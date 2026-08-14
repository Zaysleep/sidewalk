import type { DayStop } from "@/types/day-plan";

export const legacyTripFolioVersion = 1 as const;
export const tripFolioVersion = 2 as const;

export const tripFolioLimits = {
   minimumDaysForShare: 2,
   maximumDays: 5,
   maximumTitleLength: 80,
} as const;

export type TripFolioDayV1 = Readonly<{
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

export type TripFolioV1 = Readonly<{
   version: typeof legacyTripFolioVersion;

   id: string;
   title: string;

   createdAt: string;
   updatedAt: string;

   days: readonly TripFolioDayV1[];
}>;

/**
 * Geography V2 stores enough destination metadata with each saved day to make
 * a Trip Folio durable across metro, country, and timezone changes.
 *
 * Names are intentionally snapshotted for display continuity. Stable ids remain
 * the authority when a saved day is reopened for editing.
 */
export type TripFolioDay = Readonly<{
   planningDate: string;

   countryCode: string;
   countryName: string;

   regionCode: string;
   regionName: string;

   timezone: string;

   metroRegionId: string;
   metroSlug: string;
   metroName: string;

   /**
    * Compatibility/display label retained during the Geography V2 transition.
    */
   stateOrRegion: string;

   municipalityId: string;
   municipalityName: string;

   localAreaId: string;
   localAreaName: string;

   stops: readonly DayStop[];
}>;

export type TripFolio = Readonly<{
   version: typeof tripFolioVersion;

   id: string;
   title: string;

   createdAt: string;
   updatedAt: string;

   days: readonly TripFolioDay[];
}>;
