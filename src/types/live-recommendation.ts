import type { ActivityDirection, ActivityKind } from "@/types/activity";
import type { Place } from "@/types/place";

/**
 * The browser sends only stable Sidewalk IDs and a controlled activity
 * direction. Arbitrary user-created provider queries are not accepted.
 */
export type LiveRecommendationRequest = Readonly<{
   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;
   activityDirection: ActivityDirection;
}>;

/**
 * Sidewalk Choice is resolved by the server into one concrete activity.
 */
export type LiveRecommendationResponse = Readonly<{
   recommendation: Place | null;
   resolvedActivity: ActivityKind;
}>;

export type LiveRecommendationErrorResponse = Readonly<{
   error: string;
}>;
