import { dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import { tripFolioLimits, tripFolioVersion, type TripFolio, type TripFolioDay } from "@/types/trip-folio";

const tripFolioStorageKey = "sidewalk-trip-folio-v1";

type TripFolioDayInput = Readonly<{
   planningDate: string;

   metroRegionId: string;
   metroSlug: string;
   metroName: string;
   stateOrRegion: string;

   municipalityId: string;
   municipalityName: string;

   localAreaId: string;
   localAreaName: string;

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

function isTripFolioDay(value: unknown): value is TripFolioDay {
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
      Array.isArray(value.stops) &&
      value.stops.length >= 2 &&
      value.stops.length <= dayPeriods.length &&
      value.stops.every(isStoredDayStop) &&
      new Set(value.stops.map((stop) => stop.dayPeriod)).size === value.stops.length
   );
}

function isTripFolio(value: unknown): value is TripFolio {
   if (!isRecord(value)) {
      return false;
   }

   return (
      value.version === tripFolioVersion &&
      typeof value.id === "string" &&
      value.id.length > 0 &&
      typeof value.title === "string" &&
      value.title.length > 0 &&
      value.title.length <= tripFolioLimits.maximumTitleLength &&
      typeof value.createdAt === "string" &&
      typeof value.updatedAt === "string" &&
      Array.isArray(value.days) &&
      value.days.length <= tripFolioLimits.maximumDays &&
      value.days.every(isTripFolioDay) &&
      new Set(value.days.map((day) => day.planningDate)).size === value.days.length
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

function sortDays(days: readonly TripFolioDay[]): readonly TripFolioDay[] {
   return [...days].sort((first, second) => first.planningDate.localeCompare(second.planningDate));
}

function cleanTitle(title: string): string {
   const normalized = title.replace(/\s+/g, " ").trim();

   return normalized.slice(0, tripFolioLimits.maximumTitleLength);
}

export function createTripFolioDay(input: TripFolioDayInput): TripFolioDay | null {
   if (!isPlanningDate(input.planningDate) || input.stops.length < 2 || input.stops.length > dayPeriods.length) {
      return null;
   }

   const stops = sortStops(input.stops);

   if (stops.length !== input.stops.length || new Set(stops.map((stop) => stop.dayPeriod)).size !== stops.length) {
      return null;
   }

   return {
      planningDate: input.planningDate,

      metroRegionId: input.metroRegionId,
      metroSlug: input.metroSlug,
      metroName: input.metroName,
      stateOrRegion: input.stateOrRegion,

      municipalityId: input.municipalityId,
      municipalityName: input.municipalityName,

      localAreaId: input.localAreaId,
      localAreaName: input.localAreaName,

      stops,
   };
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
      const rawValue = window.localStorage.getItem(tripFolioStorageKey);

      if (!rawValue) {
         return null;
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (!isTripFolio(parsedValue)) {
         window.localStorage.removeItem(tripFolioStorageKey);

         return null;
      }

      return {
         ...parsedValue,
         days: sortDays(parsedValue.days),
      };
   } catch {
      return null;
   }
}

export function saveTripFolio(folio: TripFolio | null): boolean {
   try {
      if (!folio) {
         window.localStorage.removeItem(tripFolioStorageKey);

         return true;
      }

      window.localStorage.setItem(tripFolioStorageKey, JSON.stringify(folio));

      return true;
   } catch {
      return false;
   }
}
