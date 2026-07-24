import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { getPeriodRecommendations, PlacesProviderTimeoutError } from "@/lib/places/google-period-provider";
import { activityDirections, activityKinds, type ActivityDirection, type ActivityKind } from "@/types/activity";
import { dayPeriods, type DayPeriod } from "@/types/day-period";
import {
   maxPeriodRecommendationRefreshes,
   periodRecommendationLimits,
   type CommittedStopContext,
   type PeriodRecommendationErrorCode,
   type PeriodRecommendationErrorResponse,
   type PeriodRecommendationRequest,
   type PeriodRecommendationResponse,
} from "@/types/period-recommendation";

export const runtime = "nodejs";
export const maxDuration = 30;

const identifierPattern = /^[a-zA-Z0-9_-]+$/;

const rateLimitWindowMilliseconds = 10 * 60 * 1000;

const maximumRequestsPerWindow = 40;

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

   const retryAfterSeconds = Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000));

   return {
      allowed: existingEntry.count <= maximumRequestsPerWindow,
      remaining: Math.max(0, maximumRequestsPerWindow - existingEntry.count),
      retryAfterSeconds,
   };
}

function isActivityDirection(value: unknown): value is ActivityDirection {
   return typeof value === "string" && activityDirections.includes(value as ActivityDirection);
}

function isActivityKind(value: unknown): value is ActivityKind {
   return typeof value === "string" && activityKinds.includes(value as ActivityKind);
}

function isDayPeriod(value: unknown): value is DayPeriod {
   return typeof value === "string" && dayPeriods.includes(value as DayPeriod);
}

function isSafeIdentifier(value: unknown): value is string {
   return typeof value === "string" && value.length > 0 && value.length <= periodRecommendationLimits.maximumIdentifierLength && identifierPattern.test(value);
}

function isSessionSeed(value: unknown): value is string {
   return typeof value === "string" && value.length > 0 && value.length <= periodRecommendationLimits.maximumSessionSeedLength && value.trim() === value;
}

function isNullableLatitude(value: unknown): value is number | null {
   return value === null || (typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90);
}

function isNullableLongitude(value: unknown): value is number | null {
   return value === null || (typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180);
}

function isCommittedStopContext(value: unknown): value is CommittedStopContext {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<CommittedStopContext>;

   return (
      isSafeIdentifier(candidate.placeId) &&
      typeof candidate.placeName === "string" &&
      candidate.placeName.trim().length > 0 &&
      candidate.placeName.length <= periodRecommendationLimits.maximumPlaceNameLength &&
      isDayPeriod(candidate.dayPeriod) &&
      isActivityKind(candidate.resolvedActivity) &&
      isNullableLatitude(candidate.latitude) &&
      isNullableLongitude(candidate.longitude)
   );
}

function isVariationIndex(value: unknown): value is number {
   return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= maxPeriodRecommendationRefreshes;
}

function parsePlanningDate(value: unknown): number | null {
   if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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

function isPlanningDateInSupportedRange(value: unknown): value is string {
   const timestamp = parsePlanningDate(value);

   if (timestamp === null) {
      return false;
   }

   const now = new Date();

   const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

   /**
    * One day of tolerance prevents a valid local "today" from being rejected
    * when the Vercel server has already crossed midnight in UTC.
    */
   const minimumDate = utcToday - 24 * 60 * 60 * 1000;

   const maximumDate = utcToday + periodRecommendationLimits.maximumPlanningDaysAhead * 24 * 60 * 60 * 1000;

   return timestamp >= minimumDate && timestamp <= maximumDate;
}

function hasUniqueValues(values: readonly string[]): boolean {
   return new Set(values).size === values.length;
}

function hasValidCommittedStopShape(stops: readonly CommittedStopContext[]): boolean {
   if (stops.length > periodRecommendationLimits.maximumCommittedStops) {
      return false;
   }

   const placeIds = stops.map((stop) => stop.placeId);

   const periods = stops.map((stop) => stop.dayPeriod);

   return hasUniqueValues(placeIds) && hasUniqueValues(periods);
}

function errorResponse(error: string, status: number, code: PeriodRecommendationErrorCode, requestId: string, retryable = false, additionalHeaders: Readonly<Record<string, string>> = {}) {
   const body: PeriodRecommendationErrorResponse = {
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

      if (Number.isFinite(contentLength) && contentLength > periodRecommendationLimits.maximumRequestBodyBytes) {
         return {
            ok: false,
            status: 413,
            message: "The recommendation request is too large.",
            code: "REQUEST_TOO_LARGE",
         };
      }
   }

   const rawBody = await request.text();

   const bodyByteLength = new TextEncoder().encode(rawBody).byteLength;

   if (bodyByteLength > periodRecommendationLimits.maximumRequestBodyBytes) {
      return {
         ok: false,
         status: 413,
         message: "The recommendation request is too large.",
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
         message: "The recommendation request was not valid JSON.",
         code: "INVALID_JSON",
      };
   }
}

export async function POST(request: Request) {
   const requestId = randomUUID().slice(0, 12);

   const requestStartedAt = performance.now();

   const rateLimit = consumeRateLimit(request);

   if (!rateLimit.allowed) {
      console.warn("Sidewalk recommendation request", {
         requestId,
         stage: "rate-limited",
         providerStatus: "not-called",
      });

      return errorResponse("Sidewalk is receiving too many requests from this connection. Try again shortly.", 429, "RATE_LIMITED", requestId, true, {
         "Retry-After": String(rateLimit.retryAfterSeconds),
         "X-RateLimit-Limit": String(maximumRequestsPerWindow),
         "X-RateLimit-Remaining": "0",
      });
   }

   const parsedBody = await readRequestBody(request);

   if (!parsedBody.ok) {
      return errorResponse(parsedBody.message, parsedBody.status, parsedBody.code, requestId);
   }

   if (typeof parsedBody.value !== "object" || parsedBody.value === null || Array.isArray(parsedBody.value)) {
      return errorResponse("The recommendation request is incomplete.", 400, "INVALID_REQUEST", requestId);
   }

   const body = parsedBody.value as Partial<PeriodRecommendationRequest>;

   if (
      !isSafeIdentifier(body.metroRegionId) ||
      !isSafeIdentifier(body.municipalityId) ||
      !isSafeIdentifier(body.localAreaId) ||
      !isDayPeriod(body.dayPeriod) ||
      !isActivityDirection(body.activityDirection) ||
      !isSessionSeed(body.sessionSeed) ||
      !isVariationIndex(body.variationIndex ?? 0) ||
      !Array.isArray(body.excludedPlaceIds)
   ) {
      return errorResponse("The recommendation request is incomplete.", 400, "INVALID_REQUEST", requestId);
   }

   if (!isPlanningDateInSupportedRange(body.planningDate)) {
      return errorResponse("The planning date is outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
   }

   if (body.excludedPlaceIds.length > periodRecommendationLimits.maximumExcludedPlaceIds || !body.excludedPlaceIds.every(isSafeIdentifier) || !hasUniqueValues(body.excludedPlaceIds as readonly string[])) {
      return errorResponse("The excluded-place list is invalid.", 400, "INVALID_REQUEST", requestId);
   }

   if (body.committedStops !== undefined && (!Array.isArray(body.committedStops) || !body.committedStops.every(isCommittedStopContext) || !hasValidCommittedStopShape(body.committedStops))) {
      return errorResponse("The committed day context is invalid.", 400, "INVALID_REQUEST", requestId);
   }

   const metroRegion = metroRegions.find((candidate) => candidate.id === body.metroRegionId) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === body.municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === body.localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea) {
      return errorResponse("The selected geography could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return errorResponse("The selected geography is inconsistent.", 400, "INVALID_GEOGRAPHY", requestId);
   }

   const variationIndex = body.variationIndex ?? 0;

   const excludedPlaceIds = body.excludedPlaceIds as readonly string[];

   const committedStops = body.committedStops ?? [];

   console.info("Sidewalk recommendation request", {
      requestId,
      stage: "accepted",
      dayPeriod: body.dayPeriod,
      activityDirection: body.activityDirection,
      variationIndex,
      excludedCount: excludedPlaceIds.length,
      committedStopCount: committedStops.length,
   });

   try {
      const recommendations = await getPeriodRecommendations({
         metroRegionId: metroRegion.id,
         metroRegionName: metroRegion.name,

         municipalityId: municipality.id,
         municipalityName: municipality.name,
         stateOrRegion: municipality.stateOrRegion,

         localAreaId: localArea.id,
         localAreaName: localArea.name,

         dayPeriod: body.dayPeriod,
         activityDirection: body.activityDirection,

         planningDate: body.planningDate,

         sessionSeed: body.sessionSeed,
         variationIndex,

         excludedPlaceIds,
         committedStops,
      });

      const elapsedMilliseconds = Math.round(performance.now() - requestStartedAt);

      console.info("Sidewalk recommendation request", {
         requestId,
         stage: "complete",
         dayPeriod: body.dayPeriod,
         activityDirection: body.activityDirection,
         providerStatus: "ok",
         elapsedMilliseconds,
         recommendationCount: recommendations.length,
      });

      const responseBody: PeriodRecommendationResponse = {
         dayPeriod: body.dayPeriod,
         recommendations,
      };

      return NextResponse.json(responseBody, {
         status: 200,
         headers: {
            "Cache-Control": "no-store",
            "X-Sidewalk-Request-Id": requestId,
            "X-RateLimit-Limit": String(maximumRequestsPerWindow),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
         },
      });
   } catch (error: unknown) {
      const elapsedMilliseconds = Math.round(performance.now() - requestStartedAt);

      const isTimeout = error instanceof PlacesProviderTimeoutError;

      console.error("Sidewalk recommendation request", {
         requestId,
         stage: "failed",
         dayPeriod: body.dayPeriod,
         activityDirection: body.activityDirection,
         providerStatus: isTimeout ? "timeout" : "error",
         elapsedMilliseconds,
         errorName: error instanceof Error ? error.name : "UnknownError",
      });

      return errorResponse(isTimeout ? "Sidewalk took too long to reach the places provider. Try again." : "Sidewalk could not load recommendations right now.", isTimeout ? 504 : 502, isTimeout ? "PROVIDER_TIMEOUT" : "PROVIDER_ERROR", requestId, true);
   }
}
