import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const maximumPhotoResourceNameLength = 500;

const maximumPhotoResponseBytes = 12 * 1024 * 1024;

const providerTimeoutMilliseconds = 10_000;

const errorHeaders = {
   "Cache-Control": "no-store",
   "Referrer-Policy": "no-referrer",
   "X-Content-Type-Options": "nosniff",
} as const;

/**
 * Google Places photo resource names use this structure:
 *
 * places/{placeId}/photos/{photoReference}
 */
function isValidPhotoName(value: string): boolean {
   const photoNamePattern = /^places\/[^/\\]+\/photos\/[^/\\]+$/;

   return value.length <= maximumPhotoResourceNameLength && photoNamePattern.test(value) && !value.includes("..") && !value.includes("\\");
}

function photoErrorResponse(error: string, status: number) {
   return NextResponse.json(
      {
         error,
      },
      {
         status,
         headers: errorHeaders,
      },
   );
}

export async function GET(request: Request) {
   const requestUrl = new URL(request.url);

   /**
    * The current Sidewalk client sends `resourceName`.
    *
    * `name` remains supported temporarily so any older calls do not break.
    */
   const photoName = requestUrl.searchParams.get("resourceName") ?? requestUrl.searchParams.get("name");

   if (!photoName || !isValidPhotoName(photoName)) {
      return photoErrorResponse("The photo reference is invalid.", 400);
   }

   const apiKey = process.env.GOOGLE_PLACES_API_KEY;

   if (!apiKey) {
      return photoErrorResponse("The places provider is not configured.", 503);
   }

   const providerUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);

   providerUrl.searchParams.set("maxWidthPx", "1200");
   providerUrl.searchParams.set("key", apiKey);

   const controller = new AbortController();

   const timeoutId = setTimeout(() => {
      controller.abort();
   }, providerTimeoutMilliseconds);

   try {
      /**
       * Google normally responds with a redirect to the final image.
       * Server-side fetch follows that redirect and returns the actual image
       * bytes to the browser through Sidewalk's own API route.
       */
      const providerResponse = await fetch(providerUrl, {
         method: "GET",
         redirect: "follow",
         cache: "no-store",
         signal: controller.signal,
      });

      if (!providerResponse.ok) {
         console.error("Google Places photo request failed:", providerResponse.status, providerResponse.statusText);

         return photoErrorResponse("The place photo could not be loaded.", 502);
      }

      const contentType = providerResponse.headers.get("content-type") ?? "image/jpeg";

      if (!contentType.startsWith("image/")) {
         console.error("Google Places returned a non-image response:", contentType);

         return photoErrorResponse("The provider did not return an image.", 502);
      }

      const declaredContentLength = Number(providerResponse.headers.get("content-length"));

      if (Number.isFinite(declaredContentLength) && declaredContentLength > maximumPhotoResponseBytes) {
         console.error("Google Places returned an oversized image:", declaredContentLength);

         return photoErrorResponse("The place photo was too large to load.", 502);
      }

      const imageBytes = await providerResponse.arrayBuffer();

      if (imageBytes.byteLength === 0 || imageBytes.byteLength > maximumPhotoResponseBytes) {
         console.error("Google Places returned an invalid image size:", imageBytes.byteLength);

         return photoErrorResponse("The place photo could not be loaded.", 502);
      }

      return new NextResponse(imageBytes, {
         status: 200,

         headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "Content-Length": String(imageBytes.byteLength),
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
         },
      });
   } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
         console.error("Google Places photo proxy timed out.");

         return photoErrorResponse("The place photo took too long to load.", 504);
      }

      console.error("Google Places photo proxy error:", error);

      return photoErrorResponse("The place photo could not be loaded.", 502);
   } finally {
      clearTimeout(timeoutId);
   }
}
