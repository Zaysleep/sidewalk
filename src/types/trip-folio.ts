import type { DayStop } from "@/types/day-plan";

export const tripFolioVersion = 1 as const;

export const tripFolioLimits = {
   minimumDaysForShare: 2,
   maximumDays: 5,
   maximumTitleLength: 80,
} as const;

export type TripFolioDay = Readonly<{
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

export type TripFolio = Readonly<{
   version: typeof tripFolioVersion;

   id: string;
   title: string;

   createdAt: string;
   updatedAt: string;

   days: readonly TripFolioDay[];
}>;
