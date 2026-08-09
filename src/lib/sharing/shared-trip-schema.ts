import {
   createSharedDayRequestFromPlan,
   isSharedDayCreateRequest,
   isSharedDayStop,
} from "@/lib/sharing/shared-day-schema";
import {
   sharedDayLimits,
   type SharedDayGeography,
} from "@/types/shared-day";
import type { TripFolio } from "@/types/trip-folio";
import {
   sharedTripLimits,
   sharedTripSnapshotVersion,
   type SharedTripCreateRequest,
   type SharedTripDaySnapshot,
   type SharedTripSnapshot,
} from "@/types/shared-trip";

const controlCharacterPattern =
   /[\u0000-\u001f\u007f]/;

const safeIdentifierPattern =
   /^[a-zA-Z0-9_-]+$/;

const requestKeys = [
   "title",
   "days",
] as const;

const snapshotKeys = [
   "version",
   "createdAt",
   "expiresAt",
   "title",
   "days",
] as const;

const snapshotDayKeys = [
   "planningDate",
   "geography",
   "stops",
] as const;

const geographyKeys = [
   "metroRegionId",
   "metroSlug",
   "metroName",
   "stateOrRegion",
   "municipalityId",
   "municipalityName",
   "localAreaId",
   "localAreaName",
] as const;

function isRecord(
   value: unknown,
): value is Record<string, unknown> {
   return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
   );
}

function hasExactlyKeys(
   record: Record<string, unknown>,
   expectedKeys: readonly string[],
): boolean {
   const actualKeys = Object.keys(record);

   return (
      actualKeys.length === expectedKeys.length &&
      expectedKeys.every((key) =>
         Object.prototype.hasOwnProperty.call(
            record,
            key,
         ),
      )
   );
}

function isSafeText(
   value: unknown,
   maximumLength: number,
): value is string {
   return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= maximumLength &&
      value.trim() === value &&
      !controlCharacterPattern.test(value)
   );
}

function isSafeIdentifier(
   value: unknown,
): value is string {
   return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <=
         sharedDayLimits.maximumIdentifierLength &&
      value.trim() === value &&
      safeIdentifierPattern.test(value)
   );
}

function isPlanningDate(
   value: unknown,
): value is string {
   if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
   ) {
      return false;
   }

   const [
      yearText,
      monthText,
      dayText,
   ] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const date = new Date(
      Date.UTC(
         year,
         month - 1,
         day,
      ),
   );

   return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
   );
}

function isIsoTimestamp(
   value: unknown,
): value is string {
   if (typeof value !== "string") {
      return false;
   }

   const timestamp = Date.parse(value);

   return (
      Number.isFinite(timestamp) &&
      new Date(timestamp).toISOString() === value
   );
}

function isSharedTripGeography(
   value: unknown,
): value is SharedDayGeography {
   if (
      !isRecord(value) ||
      !hasExactlyKeys(
         value,
         geographyKeys,
      )
   ) {
      return false;
   }

   return (
      isSafeIdentifier(value.metroRegionId) &&
      isSafeIdentifier(value.metroSlug) &&
      isSafeText(
         value.metroName,
         sharedDayLimits.maximumPlaceNameLength,
      ) &&
      isSafeText(
         value.stateOrRegion,
         sharedDayLimits.maximumPlaceNameLength,
      ) &&
      isSafeIdentifier(value.municipalityId) &&
      isSafeText(
         value.municipalityName,
         sharedDayLimits.maximumPlaceNameLength,
      ) &&
      isSafeIdentifier(value.localAreaId) &&
      isSafeText(
         value.localAreaName,
         sharedDayLimits.maximumPlaceNameLength,
      )
   );
}

function hasValidTripDays(
   days: readonly {
      planningDate: string;
   }[],
): boolean {
   if (
      days.length <
         sharedTripLimits.minimumDays ||
      days.length >
         sharedTripLimits.maximumDays
   ) {
      return false;
   }

   const planningDates = days.map(
      (day) => day.planningDate,
   );

   if (
      new Set(planningDates).size !==
      planningDates.length
   ) {
      return false;
   }

   return planningDates.every(
      (planningDate, index) =>
         index === 0 ||
         planningDates[index - 1] <
            planningDate,
   );
}

export function isSharedTripCreateRequest(
   value: unknown,
): value is SharedTripCreateRequest {
   if (
      !isRecord(value) ||
      !hasExactlyKeys(value, requestKeys) ||
      !isSafeText(
         value.title,
         sharedTripLimits.maximumTitleLength,
      ) ||
      !Array.isArray(value.days) ||
      !value.days.every(
         isSharedDayCreateRequest,
      )
   ) {
      return false;
   }

   return hasValidTripDays(value.days);
}

function isSharedTripDaySnapshot(
   value: unknown,
): value is SharedTripDaySnapshot {
   if (
      !isRecord(value) ||
      !hasExactlyKeys(
         value,
         snapshotDayKeys,
      ) ||
      !isPlanningDate(value.planningDate) ||
      !isSharedTripGeography(
         value.geography,
      ) ||
      !Array.isArray(value.stops)
   ) {
      return false;
   }

   if (
      value.stops.length <
         sharedDayLimits.minimumStops ||
      value.stops.length >
         sharedDayLimits.maximumStops ||
      !value.stops.every(isSharedDayStop)
   ) {
      return false;
   }

   const periods = value.stops.map(
      (stop) => stop.dayPeriod,
   );

   const placeIds = value.stops.map(
      (stop) => stop.placeId,
   );

   return (
      new Set(periods).size ===
         periods.length &&
      new Set(placeIds).size ===
         placeIds.length
   );
}

function hasValidSnapshotLifetime(
   createdAt: string,
   expiresAt: string,
): boolean {
   const createdTimestamp =
      Date.parse(createdAt);

   const expiresTimestamp =
      Date.parse(expiresAt);

   const clockSkewMilliseconds =
      sharedTripLimits.maximumClockSkewMinutes *
      60 *
      1_000;

   const maximumLifetimeMilliseconds =
      sharedTripLimits.expirationDays *
         24 *
         60 *
         60 *
         1_000 +
      clockSkewMilliseconds;

   return (
      createdTimestamp <=
         Date.now() + clockSkewMilliseconds &&
      expiresTimestamp > createdTimestamp &&
      expiresTimestamp - createdTimestamp <=
         maximumLifetimeMilliseconds
   );
}

export function isSharedTripSnapshot(
   value: unknown,
): value is SharedTripSnapshot {
   if (
      !isRecord(value) ||
      !hasExactlyKeys(
         value,
         snapshotKeys,
      ) ||
      value.version !==
         sharedTripSnapshotVersion ||
      !isIsoTimestamp(value.createdAt) ||
      !isIsoTimestamp(value.expiresAt) ||
      !hasValidSnapshotLifetime(
         value.createdAt,
         value.expiresAt,
      ) ||
      !isSafeText(
         value.title,
         sharedTripLimits.maximumTitleLength,
      ) ||
      !Array.isArray(value.days) ||
      !value.days.every(
         isSharedTripDaySnapshot,
      )
   ) {
      return false;
   }

   return hasValidTripDays(value.days);
}

/**
 * Only saved Trip Folio data becomes public.
 * Session seeds, recommendation history, unsaved edits,
 * and browser-storage metadata never enter this request.
 */
export function createSharedTripRequestFromFolio(
   folio: TripFolio,
): SharedTripCreateRequest | null {
   const days = [...folio.days]
      .sort((first, second) =>
         first.planningDate.localeCompare(
            second.planningDate,
         ),
      )
      .map((day) =>
         createSharedDayRequestFromPlan({
            planningDate:
               day.planningDate,

            metroRegionId:
               day.metroRegionId,
            municipalityId:
               day.municipalityId,
            localAreaId:
               day.localAreaId,

            stops: day.stops,
         }),
      );

   if (
      days.some(
         (day) => day === null,
      )
   ) {
      return null;
   }

   const request: SharedTripCreateRequest = {
      title: folio.title.trim(),

      days:
         days as readonly NonNullable<
            (typeof days)[number]
         >[],
   };

   return isSharedTripCreateRequest(request)
      ? request
      : null;
}
