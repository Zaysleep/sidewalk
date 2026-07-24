import { followUpPicks } from "@/data/places/follow-up-picks";
import { sidewalkPicks } from "@/data/places/sidewalk-picks";
import type { FollowUpPick } from "@/types/follow-up";

/**
 * Returns a compatible second stop for the selected first anchor.
 *
 * Existing editorial pairs now work in both directions. This allows a former
 * follow-up place to become the beginning of the day when it better matches
 * the user's chosen activity.
 */
export function getFollowUpPickForPlace(firstPlaceId: string): FollowUpPick | null {
   const directPair = followUpPicks.find((followUpPick) => followUpPick.followsPlaceId === firstPlaceId && followUpPick.place.editorial.approvalStatus === "approved") ?? null;

   if (directPair) {
      return directPair;
   }

   const reversePair = followUpPicks.find((followUpPick) => followUpPick.place.id === firstPlaceId && followUpPick.place.editorial.approvalStatus === "approved") ?? null;

   if (!reversePair) {
      return null;
   }

   const originalPrimaryPlace = sidewalkPicks.find((place) => place.id === reversePair.followsPlaceId && place.editorial.approvalStatus === "approved") ?? null;

   if (!originalPrimaryPlace) {
      return null;
   }

   return {
      followsPlaceId: firstPlaceId,
      place: originalPrimaryPlace,
   };
}
