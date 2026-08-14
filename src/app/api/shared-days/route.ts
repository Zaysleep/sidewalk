import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isPlanningDateInDestinationRange } from "@/lib/geography/destination-date";
import { resolveGeography } from "@/lib/geography/resolve-geography";
import { isSharedDayCreateRequest } from "@/lib/sharing/shared-day-schema";
import { createSharedDayToken, SharedDayConfigurationError } from "@/lib/sharing/shared-day-token";
import { siteConfig } from "@/lib/site/site-config";
import { dayPeriods } from "@/types/day-period";
import { sharedDayLimits, sharedDaySnapshotVersion, type SharedDayCreateResponse, type SharedDayErrorCode, type SharedDayErrorResponse, type SharedDaySnapshotV2 } from "@/types/shared-day";

export const runtime = "nodejs";

export const maxDuration = 10;

const rateLimitWindowMilliseconds = 10 * 60 * 1000;

const maximumRequestsPerWindow = 12;

const maximumRateLimitEntries = 1_000;

const responseSecurityHeaders = {
   "Cache-Control": "no-store",
   "Permissions-Policy": "interest-cohort=()",
   "Referrer-Policy": "no-referrer",
   "X-Content-Type-Options": "nosniff",
} as const;

type RateLimitEntry = {
   count: number;
   resetAt: number;
};

const rateLimitEntries = new Map<string, RateLimitEntry>();

function getClientAddress(request: Request): string {
   const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

   return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function getRateLimitKey(request: Request): string {
   return createHash("sha256").update(getClientAddress(request)).digest("hex").slice(0, 24);
}

function pruneRateLimitEntries(now: number) {
   for (const [key, entry] of rateLimitEntries) {
      if (entry.resetAt <= now) {
         rateLimitEntries.delete(key);
      }
   }

   while (rateLimitEntries.size > maximumRateLimitEntries) {
      const oldestKey = rateLimitEntries.keys().next().value;

      if (typeof oldestKey !== "string") {
         break;
      }

      rateLimitEntries.delete(oldestKey);
   }
}

function consumeRateLimit(request: Request): Readonly<{
   allowed: boolean;
   remaining: number;
   retryAfterSeconds: number;
}> {
   const now = Date.now();

   pruneRateLimitEntries(now);

   const key = getRateLimitKey(request);

   const existingEntry = rateLimitEntries.get(key);

   if (!existingEntry || existingEntry.resetAt <= now) {
      rateLimitEntries.set(key, {
         count: 1,
         resetAt: now + rateLimitWindowMilliseconds,
      });

      return {
         allowed: true,
         remaining: maximumRequestsPerWindow - 1,
         retryAfterSeconds: 0,
      };
   }

   existingEntry.count += 1;

   return {
      allowed: existingEntry.count <= maximumRequestsPerWindow,
      remaining: Math.max(0, maximumRequestsPerWindow - existingEntry.count),
      retryAfterSeconds: Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1_000)),
   };
}

function isJsonContentType(request: Request): boolean {
   const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();

   return contentType === "application/json" || Boolean(contentType?.endsWith("+json"));
}

function isTrustedRequestOrigin(request: Request): boolean {
   const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();

   if (fetchSite === "cross-site") {
      return false;
   }

   const originHeader = request.headers.get("origin");

   if (!originHeader) {
      return true;
   }

   try {
      return new URL(originHeader).origin === new URL(request.url).origin;
   } catch {
      return false;
   }
}

function errorResponse(error: string, status: number, code: SharedDayErrorCode, requestId: string, retryable = false, additionalHeaders: Readonly<Record<string, string>> = {}) {
   const body: SharedDayErrorResponse = {
      error,
      code,
      requestId,
      retryable,
   };

   return NextResponse.json(body, {
      status,
      headers: {
         ...responseSecurityHeaders,
         ...additionalHeaders,
      },
   });
}

async function readRequestBody(request: Request): Promise<
   | Readonly<{
        ok: true;
        value: unknown;
     }>
   | Readonly<{
        ok: false;
        status: number;
        message: string;
        code: "INVALID_JSON" | "REQUEST_TOO_LARGE";
     }>
> {
   const contentLengthHeader = request.headers.get("content-length");

   if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);

      if (Number.isFinite(contentLength) && contentLength > sharedDayLimits.maximumRequestBodyBytes) {
         return {
            ok: false,
            status: 413,
            message: "The sharing request is too large.",
            code: "REQUEST_TOO_LARGE",
         };
      }
   }

   const rawBody = await request.text();

   if (new TextEncoder().encode(rawBody).byteLength > sharedDayLimits.maximumRequestBodyBytes) {
      return {
         ok: false,
         status: 413,
         message: "The sharing request is too large.",
         code: "REQUEST_TOO_LARGE",
      };
   }

   try {
      return {
         ok: true,
         value: JSON.parse(rawBody) as unknown,
      };
   } catch {
      return {
         ok: false,
         status: 400,
         message: "The sharing request was not valid JSON.",
         code: "INVALID_JSON",
      };
   }
}

export async function POST(request: Request) {
   const requestId = randomUUID().slice(0, 12);

   if (!isTrustedRequestOrigin(request)) {
      return errorResponse("Sidewalk rejected a cross-site sharing request.", 403, "REQUEST_ORIGIN_REJECTED", requestId);
   }

   if (!isJsonContentType(request)) {
      return errorResponse("The sharing request must use JSON.", 415, "UNSUPPORTED_MEDIA_TYPE", requestId);
   }

   const rateLimit = consumeRateLimit(request);

   if (!rateLimit.allowed) {
      return errorResponse("Sidewalk is receiving too many sharing requests from this connection. Try again shortly.", 429, "RATE_LIMITED", requestId, true, {
         "Retry-After": String(rateLimit.retryAfterSeconds),
         "X-RateLimit-Limit": String(maximumRequestsPerWindow),
         "X-RateLimit-Remaining": "0",
      });
   }

   const parsedBody = await readRequestBody(request);

   if (!parsedBody.ok) {
      return errorResponse(parsedBody.message, parsedBody.status, parsedBody.code, requestId);
   }

   if (!isSharedDayCreateRequest(parsedBody.value)) {
      return errorResponse("The shared-day request is incomplete.", 400, "INVALID_REQUEST", requestId);
   }

   /**
    * Capture the validated request in a local constant so the narrowing stays
    * intact inside Array callbacks.
    */
   const body = parsedBody.value;

   const geography = resolveGeography({
      metroRegionId: body.metroRegionId,
      municipalityId: body.municipalityId,
      localAreaId: body.localAreaId,
   });

   if (!geography || !geography.metroRegion.isActive || geography.metroRegion.coverageStatus !== "active") {
      return errorResponse("The selected geography could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   if (!isPlanningDateInDestinationRange(body.planningDate, geography.timezone, sharedDayLimits.maximumPlanningDaysAhead, 1)) {
      return errorResponse("The planning date is outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
   }

   const createdAt = new Date();

   const expiresAt = new Date(createdAt.getTime() + sharedDayLimits.expirationDays * 24 * 60 * 60 * 1_000);

   const orderedStops = dayPeriods.flatMap((period) => {
      const stop = body.stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });

   const snapshot: SharedDaySnapshotV2 = {
      version: sharedDaySnapshotVersion,

      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),

      planningDate: body.planningDate,

      geography: {
         countryCode: geography.country.code,
         countryName: geography.country.name,

         regionCode: geography.region.code,
         regionName: geography.region.name,

         timezone: geography.timezone,

         metroRegionId: geography.metroRegion.id,
         metroSlug: geography.metroRegion.slug,
         metroName: geography.metroRegion.name,
         stateOrRegion: geography.metroRegion.stateOrRegion,

         municipalityId: geography.municipality.id,
         municipalityName: geography.municipality.name,

         localAreaId: geography.localArea.id,
         localAreaName: geography.localArea.name,
      },

      stops: orderedStops,
   };

   try {
      const token = createSharedDayToken(snapshot);

      const shareUrl = new URL(`/day/${encodeURIComponent(token)}`, siteConfig.url).toString();

      const responseBody: SharedDayCreateResponse = {
         token,
         shareUrl,
         expiresAt: snapshot.expiresAt,
      };

      console.info("Sidewalk shared-day request", {
         requestId,
         stage: "complete",
         stopCount: snapshot.stops.length,
         expiresAt: snapshot.expiresAt,
      });

      return NextResponse.json(responseBody, {
         status: 201,
         headers: {
            ...responseSecurityHeaders,
            "X-Sidewalk-Request-Id": requestId,
            "X-RateLimit-Limit": String(maximumRequestsPerWindow),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
         },
      });
   } catch (error: unknown) {
      const isConfigurationError = error instanceof SharedDayConfigurationError;

      console.error("Sidewalk shared-day request", {
         requestId,
         stage: "failed",
         errorName: error instanceof Error ? error.name : "UnknownError",
      });

      return errorResponse(
         isConfigurationError ? "Sidewalk sharing is not configured yet." : "Sidewalk could not create a shareable day right now.",
         500,
         isConfigurationError ? "SHARE_CONFIGURATION_ERROR" : "SHARE_CREATION_ERROR",
         requestId,
         !isConfigurationError,
      );
   }
}
