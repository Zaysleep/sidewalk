import { sidewalkPicks } from "@/data/places/sidewalk-picks";
import type { Place } from "@/types/place";

/**
 * Returns the approved primary recommendation for one local area.
 *
 * The first release deliberately returns one place rather than a ranked list.
 * Recommendation scoring and alternative roles will be added only after the
 * primary interaction is working.
 */
export function getSidewalkPickForArea(localAreaId: string): Place | null {
   return sidewalkPicks.find((place) => place.localAreaId === localAreaId && place.editorial.approvalStatus === "approved" && place.editorial.editorialTier === "sidewalk-pick") ?? null;
}
