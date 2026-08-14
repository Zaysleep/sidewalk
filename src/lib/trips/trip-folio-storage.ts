import { resolveGeography } from "@/lib/geography/resolve-geography";
import { dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import {
   legacyTripFolioVersion,
   tripFolioLimits,
   tripFolioVersion,
   type TripFolio,
   type TripFolioDay,
   type TripFolioDayV1,
   type TripFolioV1,
} from "@/types/trip-folio";

const tripFolioStorageKey = "sidewalk-trip-folio-v2";
const legacyTripFolioStorageKey = "sidewalk-trip-folio-v1";

type TripFolioDayInput = Omit<TripFolioDay, "stops"> &
   Readonly<{
      stops: readonly DayStop[];
   }>;

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDayPeriod(value: unknown): value is DayPeriod {
   return typeof value === "string" && (dayPeriods as readonly string[]).includes(value);
}

function isPlanningDate(value: unknown): value is string {
   if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
   }

   const parsed = new Date(`${value}T00:00:00.000Z`);

   return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isStoredDayStop(value: unknown): value is DayStop {
   if (!isRecord(value)) {
      return false;
   }

   const duration = value.visitDurationMinutes;

   if (!isRecord(duration)) {
      return false;
   }

   return (
      typeof value.id === "string" &&
      isDayPeriod(value.dayPeriod) &&
      typeof value.bestWindow === "string" &&
      typeof value.resolvedActivity === "string" &&
      typeof value.placeId === "string" &&
      typeof value.placeName === "string" &&
      typeof value.metroRegionId === "string" &&
      typeof value.municipalityId === "string" &&
      typeof value.municipalityName === "string" &&
      typeof value.localAreaId === "string" &&
      typeof value.localAreaName === "string" &&
      (value.latitude === null || (typeof value.latitude === "number" && Number.isFinite(value.latitude))) &&
      (value.longitude === null || (typeof value.longitude === "number" && Number.isFinite(value.longitude))) &&
      (value.locationUrl === null || typeof value.locationUrl === "string") &&
      (value.summary === undefined || typeof value.summary === "string") &&
      (value.reason === undefined || typeof value.reason === "string") &&
      (value.photoResourceName === undefined || value.photoResourceName === null || typeof value.photoResourceName === "string") &&
      typeof duration.minimum === "number" &&
      Number.isFinite(duration.minimum) &&
      typeof duration.maximum === "number" &&
      Number.isFinite(duration.maximum)
   );
}

function hasValidStops(value: unknown): value is readonly DayStop[] {
   return (
      Array.isArray(value) &&
      value.length >= 2 &&
      value.length <= dayPeriods.length &&
      value.every(isStoredDayStop) &&
      new Set(value.map((stop) => stop.dayPeriod)).size === value.length
   );
}

function isTripFolioDayV1(value: unknown): value is TripFolioDayV1 {
   if (!isRecord(value)) {
      return false;
   }

   return (
      isPlanningDate(value.planningDate) &&
      typeof value.metroRegionId === "string" &&
      typeof value.metroSlug === "string" &&
      typeof value.metroName === "string" &&
      typeof value.stateOrRegion === "string" &&
      typeof value.municipalityId === "string" &&
      typeof value.municipalityName === "string" &&
      typeof value.localAreaId === "string" &&
      typeof value.localAreaName === "string" &&
      hasValidStops(value.stops)
   );
}

function isTripFolioDay(value: unknown): value is TripFolioDay {
   if (!isRecord(value)) {
      return false;
   }

   return (
      isPlanningDate(value.planningDate) &&
      typeof value.countryCode === "string" &&
      value.countryCode.length > 0 &&
      typeof value.countryName === "string" &&
      value.countryName.length > 0 &&
      typeof value.regionCode === "string" &&
      value.regionCode.length > 0 &&
      typeof value.regionName === "string" &&
      value.regionName.length > 0 &&
      typeof value.timezone === "string" &&
      value.timezone.length > 0 &&
      typeof value.metroRegionId === "string" &&
      typeof value.metroSlug === "string" &&
      typeof value.metroName === "string" &&
      typeof value.stateOrRegion === "string" &&
      typeof value.municipalityId === "string" &&
      typeof value.municipalityName === "string" &&
      typeof value.localAreaId === "string" &&
      typeof value.localAreaName === "string" &&
      hasValidStops(value.stops)
   );
}

function hasValidFolioShell(value: Record<string, unknown>): boolean {
   return (
      typeof value.id === "string" &&
      value.id.length > 0 &&
      typeof value.title === "string" &&
      value.title.length > 0 &&
      value.title.length <= tripFolioLimits.maximumTitleLength &&
      typeof value.createdAt === "string" &&
      typeof value.updatedAt === "string" &&
      Array.isArray(value.days) &&
      value.days.length >= 1 &&
      value.days.length <= tripFolioLimits.maximumDays &&
      new Set(value.days.map((day) => (isRecord(day) ? day.planningDate : undefined))).size === value.days.length
   );
}

function isTripFolioV1(value: unknown): value is TripFolioV1 {
   return (
      isRecord(value) &&
      value.version === legacyTripFolioVersion &&
      hasValidFolioShell(value) &&
      Array.isArray(value.days) &&
      value.days.every(isTripFolioDayV1)
   );
}

function isTripFolio(value: unknown): value is TripFolio {
   return (
      isRecord(value) &&
      value.version === tripFolioVersion &&
      hasValidFolioShell(value) &&
      Array.isArray(value.days) &&
      value.days.every(isTripFolioDay)
   );
}

function createTripId(): string {
   if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
   }

   return `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sortStops(stops: readonly DayStop[]): readonly DayStop[] {
   return dayPeriods.flatMap((period) => {
      const stop = stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });
}

function sortDays<T extends { planningDate: string }>(days: readonly T[]): readonly T[] {
   return [...days].sort((first, second) => first.planningDate.localeCompare(second.planningDate));
}

function cleanTitle(title: string): string {
   const normalized = title.replace(/\s+/g, " ").trim();

   return normalized.slice(0, tripFolioLimits.maximumTitleLength);
}

function migrateTripFolioDay(day: TripFolioDayV1): TripFolioDay | null {
   const geography = resolveGeography({
      metroRegionId: day.metroRegionId,
      municipalityId: day.municipalityId,
      localAreaId: day.localAreaId,
   });

   if (!geography) {
      return null;
   }

   return {
      planningDate: day.planningDate,

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

      stops: sortStops(day.stops),
   };
}

function migrateTripFolio(folio: TripFolioV1): TripFolio | null {
   const migratedDays = folio.days.map(migrateTripFolioDay);

   if (migratedDays.some((day) => day === null)) {
      return null;
   }

   return {
      version: tripFolioVersion,
      id: folio.id,
      title: folio.title,
      createdAt: folio.createdAt,
      updatedAt: folio.updatedAt,
      days: sortDays(migratedDays as readonly TripFolioDay[]),
   };
}

export function createTripFolioDay(input: TripFolioDayInput): TripFolioDay | null {
   if (!isPlanningDate(input.planningDate) || input.stops.length < 2 || input.stops.length > dayPeriods.length) {
      return null;
   }

   const stops = sortStops(input.stops);

   if (stops.length !== input.stops.length || new Set(stops.map((stop) => stop.dayPeriod)).size !== stops.length) {
      return null;
   }

   const day: TripFolioDay = {
      ...input,
      stops,
   };

   return isTripFolioDay(day) ? day : null;
}

export function createTripFolio(title: string, firstDay: TripFolioDay): TripFolio {
   const now = new Date().toISOString();

   return {
      version: tripFolioVersion,
      id: createTripId(),
      title: cleanTitle(title) || "Sidewalk Trip",
      createdAt: now,
      updatedAt: now,
      days: [firstDay],
   };
}

export function renameTripFolio(folio: TripFolio, title: string): TripFolio | null {
   const nextTitle = cleanTitle(title);

   if (!nextTitle) {
      return null;
   }

   if (nextTitle === folio.title) {
      return folio;
   }

   return {
      ...folio,
      title: nextTitle,
      updatedAt: new Date().toISOString(),
   };
}

export function upsertTripFolioDay(folio: TripFolio, day: TripFolioDay): TripFolio | null {
   const existingDayIndex = folio.days.findIndex((candidate) => candidate.planningDate === day.planningDate);

   if (existingDayIndex < 0 && folio.days.length >= tripFolioLimits.maximumDays) {
      return null;
   }

   const nextDays = [...folio.days];

   if (existingDayIndex >= 0) {
      nextDays[existingDayIndex] = day;
   } else {
      nextDays.push(day);
   }

   return {
      ...folio,
      updatedAt: new Date().toISOString(),
      days: sortDays(nextDays),
   };
}

export function removeTripFolioDay(folio: TripFolio, planningDate: string): TripFolio | null {
   const nextDays = folio.days.filter((day) => day.planningDate !== planningDate);

   if (nextDays.length === folio.days.length) {
      return folio;
   }

   if (nextDays.length === 0) {
      return null;
   }

   return {
      ...folio,
      updatedAt: new Date().toISOString(),
      days: nextDays,
   };
}

export function findTripFolioDay(folio: TripFolio | null, planningDate: string): TripFolioDay | null {
   return folio?.days.find((day) => day.planningDate === planningDate) ?? null;
}

export function getNextTripPlanningDate(folio: TripFolio): string | null {
   if (folio.days.length >= tripFolioLimits.maximumDays) {
      return null;
   }

   const latestDay = [...folio.days].sort((first, second) => second.planningDate.localeCompare(first.planningDate))[0];

   if (!latestDay) {
      return null;
   }

   const [yearText, monthText, dayText] = latestDay.planningDate.split("-");

   const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));

   if (!Number.isFinite(date.getTime())) {
      return null;
   }

   date.setUTCDate(date.getUTCDate() + 1);

   return date.toISOString().slice(0, 10);
}

export function createTripFolioDaySourceKey(day: TripFolioDay): string {
   return JSON.stringify({
      planningDate: day.planningDate,
      metroRegionId: day.metroRegionId,
      municipalityId: day.municipalityId,
      localAreaId: day.localAreaId,

      stops: day.stops.map((stop) => ({
         dayPeriod: stop.dayPeriod,
         bestWindow: stop.bestWindow,
         resolvedActivity: stop.resolvedActivity,
         placeId: stop.placeId,
         placeName: stop.placeName,
         latitude: stop.latitude,
         longitude: stop.longitude,
         locationUrl: stop.locationUrl,
         summary: stop.summary ?? "",
         reason: stop.reason ?? "",
         photoResourceName: stop.photoResourceName ?? null,
         visitDurationMinutes: stop.visitDurationMinutes,
      })),
   });
}

export function readTripFolio(): TripFolio | null {
   try {
      const currentRawValue = window.localStorage.getItem(tripFolioStorageKey);

      if (currentRawValue) {
         const currentParsedValue: unknown = JSON.parse(currentRawValue);

         if (isTripFolio(currentParsedValue)) {
            return {
               ...currentParsedValue,
               days: sortDays(currentParsedValue.days),
            };
         }

         // Corrupt V2 data can be discarded without touching the recoverable V1
         // copy that may still exist from before the migration.
         window.localStorage.removeItem(tripFolioStorageKey);
      }

      const legacyRawValue = window.localStorage.getItem(legacyTripFolioStorageKey);

      if (!legacyRawValue) {
         return null;
      }

      const legacyParsedValue: unknown = JSON.parse(legacyRawValue);

      if (!isTripFolioV1(legacyParsedValue)) {
         return null;
      }

      const migratedFolio = migrateTripFolio(legacyParsedValue);

      if (!migratedFolio) {
         // Never delete a valid V1 folio merely because its old geography can no
         // longer be resolved. Preserving the source prevents migration data loss.
         return null;
      }

      window.localStorage.setItem(tripFolioStorageKey, JSON.stringify(migratedFolio));
      window.localStorage.removeItem(legacyTripFolioStorageKey);

      return migratedFolio;
   } catch {
      return null;
   }
}

export function saveTripFolio(folio: TripFolio | null): boolean {
   try {
      if (!folio) {
         window.localStorage.removeItem(tripFolioStorageKey);
         window.localStorage.removeItem(legacyTripFolioStorageKey);

         return true;
      }

      if (!isTripFolio(folio)) {
         return false;
      }

      window.localStorage.setItem(tripFolioStorageKey, JSON.stringify(folio));

      return true;
   } catch {
      return false;
   }
}
