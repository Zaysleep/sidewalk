import type { ActivityKind, DayRole } from "@/types/activity";

export const placeCategories = ["coffee", "food", "shopping", "culture", "parks-outdoors"] as const;

export type PlaceCategory = (typeof placeCategories)[number];

export type ProviderSource = "manual" | "google-places";

export type ProviderBusinessStatus = "unverified" | "operational" | "temporarily-closed" | "permanently-closed" | "unknown";

export const providerPeriodAvailabilityStatuses = ["open-through-window", "open-part-of-window", "closed-during-window", "hours-unavailable"] as const;

export type ProviderPeriodAvailabilityStatus = (typeof providerPeriodAvailabilityStatuses)[number];

export type ProviderPeriodAvailabilitySource = "current-hours" | "regular-hours" | "unavailable";

/**
 * A quiet, period-specific summary of whether the provider's published hours
 * fit the active Sidewalk chapter.
 *
 * Sidewalk intentionally stores only the useful conclusion here rather than
 * exposing a full weekly schedule in the recommendation card.
 */
export type ProviderPeriodAvailability = Readonly<{
   status: ProviderPeriodAvailabilityStatus;
   source: ProviderPeriodAvailabilitySource;

   label: string;

   opensAt?: string | null;
   closesAt?: string | null;
}>;

/**
 * Factual information supplied by a manual record or external provider.
 *
 * Sidewalk-owned editorial judgment remains separate from this object.
 */
export type ProviderPlaceRecord = Readonly<{
   source: ProviderSource;
   providerPlaceId: string | null;

   name: string;

   businessStatus: ProviderBusinessStatus;

   formattedAddress?: string | null;

   latitude?: number | null;
   longitude?: number | null;

   primaryType?: string | null;
   types?: readonly string[];

   rating?: number | null;
   userRatingCount?: number | null;

   photoResourceName?: string | null;

   websiteUrl?: string | null;
   mapsUrl?: string | null;

   /**
    * Availability for the recommendation's Morning, Afternoon, or Evening
    * window. This is computed server-side from provider opening-hours data.
    */
   periodAvailability?: ProviderPeriodAvailability | null;
}>;

/**
 * Sidewalk owns this layer.
 *
 * Live Google results remain provisional until a future editorial approval
 * workflow is added.
 */
export type EditorialPlaceProfile = Readonly<{
   approvalStatus: "approved" | "provisional";

   editorialTier: "sidewalk-pick";

   category: PlaceCategory;

   activities?: readonly ActivityKind[];
   dayRoles?: readonly DayRole[];

   summary: string;
   reasonToVisit: string;

   visitDurationMinutes: Readonly<{
      minimum: number;
      maximum: number;
   }>;
}>;

export type Place = Readonly<{
   id: string;
   slug: string;

   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;

   provider: ProviderPlaceRecord;

   editorial: EditorialPlaceProfile;
}>;
