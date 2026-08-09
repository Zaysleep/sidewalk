import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { isSharedTripCreateRequest } from "@/lib/sharing/shared-trip-schema";
import { createSharedTripToken, SharedTripConfigurationError } from "@/lib/sharing/shared-trip-token";
import { dayPeriods } from "@/types/day-period";
import { sharedTripLimits, sharedTripSnapshotVersion, type SharedTripCreateResponse, type SharedTripDayCreateRequest, type SharedTripDaySnapshot, type SharedTripErrorCode, type SharedTripErrorResponse, type SharedTripSnapshot } from "@/types/shared-trip";

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

function parsePlanningDate(value: string): number | null {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
   }

   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const timestamp = Date.UTC(year, month - 1, day);

   const date = new Date(timestamp);

   if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return null;
   }

   return timestamp;
}

function isPlanningDateInSupportedRange(value: string): boolean {
   const timestamp = parsePlanningDate(value);

   if (timestamp === null) {
      return false;
   }

   const now = new Date();

   const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

   const minimumDate = utcToday - 24 * 60 * 60 * 1_000;

   const maximumDate = utcToday + 366 * 24 * 60 * 60 * 1_000;

   return timestamp >= minimumDate && timestamp <= maximumDate;
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

function resolveTripDay(day: SharedTripDayCreateRequest): SharedTripDaySnapshot | null {
   const metroRegion = metroRegions.find((candidate) => candidate.id === day.metroRegionId) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === day.municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === day.localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea || !metroRegion.isActive || metroRegion.coverageStatus !== "active") {
      return null;
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return null;
   }

   const orderedStops = dayPeriods.flatMap((period) => {
      const stop = day.stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });

   return {
      planningDate: day.planningDate,

      geography: {
         metroRegionId: metroRegion.id,
         metroSlug: metroRegion.slug,
         metroName: metroRegion.name,
         stateOrRegion: metroRegion.stateOrRegion,

         municipalityId: municipality.id,
         municipalityName: municipality.name,

         localAreaId: localArea.id,
         localAreaName: localArea.name,
      },

      stops: orderedStops,
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

   if (body.days.some((day) => !isPlanningDateInSupportedRange(day.planningDate))) {
      return errorResponse("One or more trip dates are outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
   }

   const resolvedDays = body.days.map((day) => resolveTripDay(day));

   if (resolvedDays.some((day) => day === null)) {
      return errorResponse("One or more trip areas could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   const createdAt = new Date();

   const expiresAt = new Date(createdAt.getTime() + sharedTripLimits.expirationDays * 24 * 60 * 60 * 1_000);

   const snapshot: SharedTripSnapshot = {
      version: sharedTripSnapshotVersion,

      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),

      title: body.title,

      days: resolvedDays as readonly SharedTripDaySnapshot[],
   };

   try {
      const token = createSharedTripToken(snapshot);

      /**
       * Build the outgoing link from the host that actually received this
       * request. This keeps production, custom-domain, and preview links from
       * accidentally inheriting a stale NEXT_PUBLIC_SITE_URL value.
       *
       * Local development will intentionally produce localhost links; those
       * are only usable on the machine running Sidewalk.
       */
      const requestOrigin = new URL(request.url).origin;

      const shareUrl = new URL(`/trip/${encodeURIComponent(token)}`, requestOrigin).toString();

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
      const isConfigurationError = error instanceof SharedTripConfigurationError;

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
