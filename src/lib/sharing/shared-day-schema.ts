import { dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import {
   sharedDayLimits,
   sharedDaySnapshotVersion,
   type SharedDayCreateRequest,
   type SharedDaySnapshot,
   type SharedDayStop,
} from "@/types/shared-day";

const safeIdentifierPattern = /^[a-zA-Z0-9_-]+$/;

const controlCharacterPattern = /[\u0000-\u001f\u007f]/;

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDayPeriod(value: unknown): value is DayPeriod {
   return typeof value === "string" && (dayPeriods as readonly string[]).includes(value);
}

function isSafeIdentifier(value: unknown): value is string {
   return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= sharedDayLimits.maximumIdentifierLength &&
      value.trim() === value &&
      safeIdentifierPattern.test(value)
   );
}

function isSafeText(value: unknown, maximumLength: number, allowEmpty = false): value is string {
   return (
      typeof value === "string" &&
      value.length <= maximumLength &&
      (allowEmpty || value.length > 0) &&
      value.trim() === value &&
      !controlCharacterPattern.test(value)
   );
}

function isPlanningDate(value: unknown): value is string {
   if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
   }

   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const parsedDate = new Date(Date.UTC(year, month - 1, day));

   return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
}

function isIsoTimestamp(value: unknown): value is string {
   if (typeof value !== "string") {
      return false;
   }

   const timestamp = Date.parse(value);

   return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function isVisitDuration(value: unknown): value is SharedDayStop["visitDurationMinutes"] {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.minimum === "number" &&
      Number.isInteger(value.minimum) &&
      value.minimum > 0 &&
      value.minimum <= 24 * 60 &&
      typeof value.maximum === "number" &&
      Number.isInteger(value.maximum) &&
      value.maximum >= value.minimum &&
      value.maximum <= 24 * 60
   );
}

function isNullableLocationUrl(value: unknown): value is string | null {
   if (value === null) {
      return true;
   }

   if (typeof value !== "string" || value.length === 0 || value.length > sharedDayLimits.maximumLocationUrlLength || value.trim() !== value) {
      return false;
   }

   try {
      const url = new URL(value);

      return url.protocol === "https:" || url.protocol === "http:";
   } catch {
      return false;
   }
}

function isNullablePhotoResourceName(value: unknown): value is string | null {
   return value === null || isSafeText(value, sharedDayLimits.maximumPhotoResourceNameLength);
}

export function isSharedDayStop(value: unknown): value is SharedDayStop {
   if (!isRecord(value)) {
      return false;
   }

   return (
      isDayPeriod(value.dayPeriod) &&
      isSafeText(value.bestWindow, sharedDayLimits.maximumBestWindowLength) &&
      isSafeIdentifier(value.placeId) &&
      isSafeText(value.placeName, sharedDayLimits.maximumPlaceNameLength) &&
      isSafeText(value.summary, sharedDayLimits.maximumSummaryLength, true) &&
      isSafeText(value.reason, sharedDayLimits.maximumReasonLength, true) &&
      isVisitDuration(value.visitDurationMinutes) &&
      isNullableLocationUrl(value.locationUrl) &&
      isNullablePhotoResourceName(value.photoResourceName)
   );
}

function hasValidStopCollection(stops: readonly SharedDayStop[]): boolean {
   if (stops.length < sharedDayLimits.minimumStops || stops.length > sharedDayLimits.maximumStops) {
      return false;
   }

   const periods = stops.map((stop) => stop.dayPeriod);

   const placeIds = stops.map((stop) => stop.placeId);

   return new Set(periods).size === periods.length && new Set(placeIds).size === placeIds.length;
}

export function isSharedDayCreateRequest(value: unknown): value is SharedDayCreateRequest {
   if (!isRecord(value) || !Array.isArray(value.stops)) {
      return false;
   }

   return (
      isPlanningDate(value.planningDate) &&
      isSafeIdentifier(value.metroRegionId) &&
      isSafeIdentifier(value.municipalityId) &&
      isSafeIdentifier(value.localAreaId) &&
      value.stops.every(isSharedDayStop) &&
      hasValidStopCollection(value.stops)
   );
}

export function isSharedDaySnapshot(value: unknown): value is SharedDaySnapshot {
   if (!isRecord(value) || value.version !== sharedDaySnapshotVersion || !isRecord(value.geography) || !Array.isArray(value.stops)) {
      return false;
   }

   const geography = value.geography;

   if (
      !isIsoTimestamp(value.createdAt) ||
      !isIsoTimestamp(value.expiresAt) ||
      Date.parse(value.expiresAt) <= Date.parse(value.createdAt) ||
      !isPlanningDate(value.planningDate) ||
      !isSafeIdentifier(geography.metroRegionId) ||
      !isSafeIdentifier(geography.metroSlug) ||
      !isSafeText(geography.metroName, sharedDayLimits.maximumPlaceNameLength) ||
      !isSafeText(geography.stateOrRegion, sharedDayLimits.maximumPlaceNameLength) ||
      !isSafeIdentifier(geography.municipalityId) ||
      !isSafeText(geography.municipalityName, sharedDayLimits.maximumPlaceNameLength) ||
      !isSafeIdentifier(geography.localAreaId) ||
      !isSafeText(geography.localAreaName, sharedDayLimits.maximumPlaceNameLength) ||
      !value.stops.every(isSharedDayStop)
   ) {
      return false;
   }

   return hasValidStopCollection(value.stops);
}

type CurrentPlanForSharing = Readonly<{
   planningDate: string;

   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;

   stops: readonly DayStop[];
}>;

/**
 * Converts the current browser plan into the only public fields accepted by
 * the sharing endpoint. Private planning state never enters this object.
 */
export function createSharedDayRequestFromPlan(plan: CurrentPlanForSharing): SharedDayCreateRequest | null {
   const orderedStops = dayPeriods.flatMap((period) => {
      const stop = plan.stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });

   const request: SharedDayCreateRequest = {
      planningDate: plan.planningDate,

      metroRegionId: plan.metroRegionId,
      municipalityId: plan.municipalityId,
      localAreaId: plan.localAreaId,

      stops: orderedStops.map((stop) => ({
         dayPeriod: stop.dayPeriod,

         bestWindow: stop.bestWindow.trim(),

         placeId: stop.placeId.trim(),
         placeName: stop.placeName.trim(),

         summary: stop.summary?.trim() ?? "",
         reason: stop.reason?.trim() ?? "",

         visitDurationMinutes: {
            minimum: stop.visitDurationMinutes.minimum,
            maximum: stop.visitDurationMinutes.maximum,
         },

         locationUrl: stop.locationUrl,
         photoResourceName: stop.photoResourceName?.trim() || null,
      })),
   };

   return isSharedDayCreateRequest(request) ? request : null;
}
