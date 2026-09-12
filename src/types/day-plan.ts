import type { ActivityKind } from "@/types/activity";
import type { DayPeriod } from "@/types/day-period";
import type { ProviderPeriodAvailabilitySource, ProviderPeriodAvailabilityStatus } from "@/types/place";

/**
 * One place committed to a Sidewalk time period.
 *
 * Display information and coordinates are stored with the stop so the day can
 * survive a refresh, keep later recommendations geographically coherent, and
 * produce a safe public snapshot when the user explicitly chooses to share.
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

   /**
    * These public-facing fields were added after the original v5 session
    * format. They remain optional so a previously saved browser session can be
    * restored without migration or data loss.
    */
   summary?: string;
   reason?: string;
   photoResourceName?: string | null;

   /**
    * Small provider snapshots that make trip-wide variety and quiet timing
    * checks possible without re-querying the places provider later.
    */
   providerPrimaryType?: string | null;
   availabilityStatus?: ProviderPeriodAvailabilityStatus;
   availabilitySource?: ProviderPeriodAvailabilitySource;
   availabilityLabel?: string;
}>;
