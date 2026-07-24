import type { ActivityKind, DayRole } from "@/types/activity";
import type { Place, PlaceCategory } from "@/types/place";

/**
 * Existing broad categories receive controlled activity fallbacks.
 *
 * This allows the current place catalog to participate in the activity-led
 * recommendation flow while explicit editorial classifications are added over
 * time.
 */
const fallbackActivitiesByCategory: Readonly<Record<PlaceCategory, readonly ActivityKind[]>> = {
   coffee: ["food"],
   food: ["food"],
   shopping: ["browse"],
   culture: ["culture"],
   "parks-outdoors": ["outdoors"],
};

const fallbackDayRoles = ["first-anchor", "follow-up"] as const satisfies readonly DayRole[];

/**
 * Returns the activities explicitly assigned to a place, or a controlled
 * fallback based on its current place category.
 */
export function getPlaceActivityKinds(place: Place): readonly ActivityKind[] {
   if (place.editorial.activities && place.editorial.activities.length > 0) {
      return place.editorial.activities;
   }

   return fallbackActivitiesByCategory[place.editorial.category];
}

/**
 * Returns the itinerary roles explicitly assigned to a place.
 *
 * Existing approved seed places may appear in either position until more
 * detailed editorial roles are assigned.
 */
export function getPlaceDayRoles(place: Place): readonly DayRole[] {
   if (place.editorial.dayRoles && place.editorial.dayRoles.length > 0) {
      return place.editorial.dayRoles;
   }

   return fallbackDayRoles;
}
