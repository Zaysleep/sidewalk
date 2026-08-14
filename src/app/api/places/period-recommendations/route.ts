import { createHash, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isPlanningDateInDestinationRange } from "@/lib/geography/destination-date";
import { resolveGeography } from "@/lib/geography/resolve-geography";
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

   if (body.excludedPlaceIds.length > periodRecommendationLimits.maximumExcludedPlaceIds || !body.excludedPlaceIds.every(isSafeIdentifier) || !hasUniqueValues(body.excludedPlaceIds as readonly string[])) {
      return errorResponse("The excluded-place list is invalid.", 400, "INVALID_REQUEST", requestId);
   }

   if (body.committedStops !== undefined && (!Array.isArray(body.committedStops) || !body.committedStops.every(isCommittedStopContext) || !hasValidCommittedStopShape(body.committedStops))) {
      return errorResponse("The committed day context is invalid.", 400, "INVALID_REQUEST", requestId);
   }

   const geography = resolveGeography({
      metroRegionId: body.metroRegionId,
      municipalityId: body.municipalityId,
      localAreaId: body.localAreaId,
   });

   if (!geography || !geography.metroRegion.isActive || geography.metroRegion.coverageStatus !== "active") {
      return errorResponse("The selected geography could not be found.", 404, "INVALID_GEOGRAPHY", requestId);
   }

   if (!isPlanningDateInDestinationRange(body.planningDate, geography.timezone, periodRecommendationLimits.maximumPlanningDaysAhead, 1)) {
      return errorResponse("The planning date is outside Sidewalk’s supported range.", 400, "INVALID_DATE", requestId);
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
         countryCode: geography.country.code,
         countryName: geography.country.name,

         regionCode: geography.region.code,
         regionName: geography.region.name,

         timezone: geography.timezone,

         metroRegionId: geography.metroRegion.id,
         metroRegionName: geography.metroRegion.name,

         municipalityId: geography.municipality.id,
         municipalityName: geography.municipality.name,
         stateOrRegion: geography.municipality.stateOrRegion,

         localAreaId: geography.localArea.id,
         localAreaName: geography.localArea.name,

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
