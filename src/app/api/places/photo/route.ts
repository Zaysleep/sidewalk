import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google Places photo resource names use this structure:
 *
 * places/{placeId}/photos/{photoReference}
 */
function isValidPhotoName(value: string): boolean {
   const photoNamePattern = /^places\/[^/]+\/photos\/[^/]+$/;

   return photoNamePattern.test(value) && !value.includes("..") && !value.includes("\\");
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
      return NextResponse.json(
         {
            error: "The photo reference is invalid.",
         },
         {
            status: 400,
         },
      );
   }

   const apiKey = process.env.GOOGLE_PLACES_API_KEY;

   if (!apiKey) {
      return NextResponse.json(
         {
            error: "The places provider is not configured.",
         },
         {
            status: 503,
         },
      );
   }

   const providerUrl = new URL(`https://places.googleapis.com/v1/${photoName}/media`);

   providerUrl.searchParams.set("maxWidthPx", "1200");
   providerUrl.searchParams.set("key", apiKey);

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
      });

      if (!providerResponse.ok) {
         console.error("Google Places photo request failed:", providerResponse.status, providerResponse.statusText);

         return NextResponse.json(
            {
               error: "The place photo could not be loaded.",
            },
            {
               status: 502,
            },
         );
      }

      const contentType = providerResponse.headers.get("content-type") ?? "image/jpeg";

      if (!contentType.startsWith("image/")) {
         console.error("Google Places returned a non-image response:", contentType);

         return NextResponse.json(
            {
               error: "The provider did not return an image.",
            },
            {
               status: 502,
            },
         );
      }

      const imageBytes = await providerResponse.arrayBuffer();

      return new NextResponse(imageBytes, {
         status: 200,

         headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "Content-Length": String(imageBytes.byteLength),
         },
      });
   } catch (error: unknown) {
      console.error("Google Places photo proxy error:", error);

      return NextResponse.json(
         {
            error: "The place photo could not be loaded.",
         },
         {
            status: 502,
         },
      );
   }
}
