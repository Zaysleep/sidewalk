import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { isSharedDayCreateRequest } from "@/lib/sharing/shared-day-schema";
import { createSharedDayToken, SharedDayConfigurationError } from "@/lib/sharing/shared-day-token";
import { siteConfig } from "@/lib/site/site-config";
import { dayPeriods } from "@/types/day-period";
import { sharedDayLimits, sharedDaySnapshotVersion, type SharedDayCreateResponse, type SharedDayErrorCode, type SharedDayErrorResponse, type SharedDaySnapshot } from "@/types/shared-day";

export const runtime = "nodejs";

export const maxDuration = 10;

const rateLimitWindowMilliseconds = 10 * 60 * 1000;

const maximumRequestsPerWindow = 12;

const maximumRateLimitEntries = 1_000;

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

function parsePlanningDate(value: string): number | null {
   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
   }

   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const timestamp = Date.UTC(year, month - 1, day);

   const parsedDate = new Date(timestamp);

   if (parsedDate.getUTCFullYear() !== year || parsedDate.getUTCMonth() !== month - 1 || parsedDate.getUTCDate() !== day) {
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

   const maximumDate = utcToday + sharedDayLimits.maximumPlanningDaysAhead * 24 * 60 * 60 * 1_000;

   return timestamp >= minimumDate && timestamp <= maximumDate;
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
         "Cache-Control": "no-store",
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
    * Capture the validated request in a local constant. TypeScript does not
    * preserve a dotted-property narrowing reliably inside later callbacks
    * such as Array.find and Array.flatMap.
    */
   const body = parsedBody.value;

   if (!isPlanningDateInSupportedRange(body.planningDate)) {
      return errorResponse("The planning date is outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
   }

   const metroRegion = metroRegions.find((candidate) => candidate.id === body.metroRegionId) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === body.municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === body.localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea || !metroRegion.isActive || metroRegion.coverageStatus !== "active") {
      return errorResponse("The selected geography could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return errorResponse("The selected geography is inconsistent.", 400, "INVALID_GEOGRAPHY", requestId);
   }

   const createdAt = new Date();

   const expiresAt = new Date(createdAt.getTime() + sharedDayLimits.expirationDays * 24 * 60 * 60 * 1_000);

   const orderedStops = dayPeriods.flatMap((period) => {
      const stop = body.stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });

   const snapshot: SharedDaySnapshot = {
      version: sharedDaySnapshotVersion,

      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),

      planningDate: body.planningDate,

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

   try {
      const token = createSharedDayToken(snapshot);

      const shareUrl = new URL(`/day/${token}`, siteConfig.url).toString();

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
            "Cache-Control": "no-store",
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
