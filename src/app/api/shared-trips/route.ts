import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isPlanningDateInDestinationRange } from "@/lib/geography/destination-date";
import { resolveGeography } from "@/lib/geography/resolve-geography";
import { isSharedTripCreateRequest } from "@/lib/sharing/shared-trip-schema";
import { saveSharedTripSnapshot, SharedTripStoreConfigurationError } from "@/lib/sharing/shared-trip-store";
import { dayPeriods } from "@/types/day-period";
import { sharedTripLimits, sharedTripSnapshotVersion, type SharedTripCreateResponse, type SharedTripDayCreateRequest, type SharedTripDaySnapshotV2, type SharedTripErrorCode, type SharedTripErrorResponse, type SharedTripSnapshotV2 } from "@/types/shared-trip";

export const runtime = "nodejs";

export const maxDuration = 10;

const rateLimitWindowMilliseconds = 10 * 60 * 1_000;

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
   return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
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

function errorResponse(error: string, status: number, code: SharedTripErrorCode, requestId: string, retryable = false, additionalHeaders: Readonly<Record<string, string>> = {}) {
   const body: SharedTripErrorResponse = {
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

      if (Number.isFinite(contentLength) && contentLength > sharedTripLimits.maximumRequestBodyBytes) {
         return {
            ok: false,
            status: 413,
            message: "The trip-sharing request is too large.",
            code: "REQUEST_TOO_LARGE",
         };
      }
   }

   const rawBody = await request.text();

   if (new TextEncoder().encode(rawBody).byteLength > sharedTripLimits.maximumRequestBodyBytes) {
      return {
         ok: false,
         status: 413,
         message: "The trip-sharing request is too large.",
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
         message: "The trip-sharing request was not valid JSON.",
         code: "INVALID_JSON",
      };
   }
}

type ResolvedTripDay =
   | Readonly<{
        ok: true;
        snapshot: SharedTripDaySnapshotV2;
     }>
   | Readonly<{
        ok: false;
        reason: "geography" | "date";
     }>;

function resolveTripDay(day: SharedTripDayCreateRequest): ResolvedTripDay {
   const geography = resolveGeography({
      metroRegionId: day.metroRegionId,
      municipalityId: day.municipalityId,
      localAreaId: day.localAreaId,
   });

   if (!geography || !geography.metroRegion.isActive || geography.metroRegion.coverageStatus !== "active") {
      return {
         ok: false,
         reason: "geography",
      };
   }

   if (!isPlanningDateInDestinationRange(day.planningDate, geography.timezone, 366, 1)) {
      return {
         ok: false,
         reason: "date",
      };
   }

   const orderedStops = dayPeriods.flatMap((period) => {
      const stop = day.stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });

   return {
      ok: true,
      snapshot: {
         planningDate: day.planningDate,

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
      },
   };
}

export async function POST(request: Request) {
   const requestId = randomUUID().slice(0, 12);

   if (!isTrustedRequestOrigin(request)) {
      return errorResponse("Sidewalk rejected a cross-site trip-sharing request.", 403, "REQUEST_ORIGIN_REJECTED", requestId);
   }

   if (!isJsonContentType(request)) {
      return errorResponse("The trip-sharing request must use JSON.", 415, "UNSUPPORTED_MEDIA_TYPE", requestId);
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

   if (!isSharedTripCreateRequest(parsedBody.value)) {
      return errorResponse("The shared-trip request is incomplete.", 400, "INVALID_REQUEST", requestId);
   }

   const body = parsedBody.value;

   const resolvedDays = body.days.map((day) => resolveTripDay(day));

   if (resolvedDays.some((day) => !day.ok && day.reason === "geography")) {
      return errorResponse("One or more trip areas could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   if (resolvedDays.some((day) => !day.ok && day.reason === "date")) {
      return errorResponse("One or more trip dates are outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
   }

   const daySnapshots = resolvedDays.map((day) => {
      if (!day.ok) {
         throw new Error("Resolved trip-day narrowing failed.");
      }

      return day.snapshot;
   });

   const createdAt = new Date();

   const expiresAt = new Date(createdAt.getTime() + sharedTripLimits.expirationDays * 24 * 60 * 60 * 1_000);

   const snapshot: SharedTripSnapshotV2 = {
      version: sharedTripSnapshotVersion,

      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),

      title: body.title,

      days: daySnapshots,
   };

   try {
      const token = await saveSharedTripSnapshot(snapshot);

      /**
       * Build the outgoing link from the host that actually received this
       * request. This keeps production, custom-domain, and preview links from
       * accidentally inheriting a stale NEXT_PUBLIC_SITE_URL value.
       *
       * Local development will intentionally produce localhost links; those
       * are only usable on the machine running Sidewalk.
       */
      const requestUrl = new URL(request.url);

      const isLocalRequest = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1" || requestUrl.hostname === "[::1]";

      /**
       * Local development should keep producing localhost links so the
       * complete share flow can be tested without a deployment.
       *
       * Deployed environments should point recipients at Sidewalk's canonical
       * public URL instead of a Vercel preview deployment, which may be behind
       * deployment protection and require a Vercel sign-in.
       */
      const configuredPublicUrl = process.env.SIDEWALK_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

      const shareOrigin = !isLocalRequest && configuredPublicUrl ? new URL(configuredPublicUrl).origin : requestUrl.origin;

      const shareUrl = new URL(`/trip/${encodeURIComponent(token)}`, shareOrigin).toString();

      const responseBody: SharedTripCreateResponse = {
         token,
         shareUrl,
         expiresAt: snapshot.expiresAt,
      };

      console.info("Sidewalk shared-trip request", {
         requestId,
         stage: "complete",
         dayCount: snapshot.days.length,
         stopCount: snapshot.days.reduce((total, day) => total + day.stops.length, 0),
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
      const isConfigurationError = error instanceof SharedTripStoreConfigurationError;

      console.error("Sidewalk shared-trip request", {
         requestId,
         stage: "failed",
         errorName: error instanceof Error ? error.name : "UnknownError",
      });

      return errorResponse(
         isConfigurationError ? "Sidewalk sharing is not configured yet." : "Sidewalk could not create a shareable trip right now.",
         500,
         isConfigurationError ? "SHARE_CONFIGURATION_ERROR" : "SHARE_CREATION_ERROR",
         requestId,
         !isConfigurationError,
      );
   }
}
