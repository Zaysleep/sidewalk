import type { ActivityKind } from "@/types/activity";
import type { DayPeriod } from "@/types/day-period";

/**
 * One place committed to a Morning, Afternoon, or Evening chapter.
 *
 * Display information and coordinates are stored with the stop so the day can
 * survive a refresh and later recommendation requests can stay coherent with
 * the places the user has already chosen.
 */
export type DayStop = Readonly<{
   id: string;

   dayPeriod: DayPeriod;
   bestWindow: string;
   resolvedActivity: ActivityKind;

   placeId: string;
   placeName: string;

   metroRegionId: string;

   municipalityId: string;
   municipalityName: string;

   localAreaId: string;
   localAreaName: string;

   latitude: number | null;
   longitude: number | null;

   locationUrl: string | null;

   visitDurationMinutes: Readonly<{
      minimum: number;
      maximum: number;
   }>;
}>;
