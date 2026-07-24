import { followUpPicks } from "@/data/places/follow-up-picks";
import { sidewalkPicks } from "@/data/places/sidewalk-picks";
import { getPlaceActivityKinds, getPlaceDayRoles } from "@/lib/recommendations/place-classification";
import type { ActivityDirection } from "@/types/activity";
import type { Place } from "@/types/place";

/**
 * Combines the current primary and follow-up place catalogs.
 *
 * Former follow-up places can now become the first anchor when their activity
 * matches what the user wants.
 */
const curatedPlaces = [...sidewalkPicks, ...followUpPicks.map((followUpPick) => followUpPick.place)] satisfies readonly Place[];

/**
 * Returns approved, unique first-anchor candidates for one local area.
 */
function getFirstAnchorCandidates(localAreaId: string): readonly Place[] {
   const placeIds = new Set<string>();

   return curatedPlaces.filter((place) => {
      if (place.localAreaId !== localAreaId || place.editorial.approvalStatus !== "approved" || !getPlaceDayRoles(place).includes("first-anchor") || placeIds.has(place.id)) {
         return false;
      }

      placeIds.add(place.id);
      return true;
   });
}

/**
 * Returns one deterministic first anchor for an area and activity direction.
 *
 * Sidewalk Choice returns the first approved editorial candidate. Explicit
 * activity choices only return exact controlled activity matches.
 */
export function getFirstAnchorForArea(localAreaId: string, direction: ActivityDirection): Place | null {
   const candidates = getFirstAnchorCandidates(localAreaId);

   if (direction === "sidewalk-choice") {
      return candidates[0] ?? null;
   }

   return candidates.find((place) => getPlaceActivityKinds(place).includes(direction)) ?? null;
}
