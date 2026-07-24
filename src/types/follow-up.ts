import type { Place } from "@/types/place";

/**
 * The first continuation decision stays intentionally binary.
 *
 * More specific intent choices should only appear once each metro has enough
 * curated follow-up candidates to honor those choices honestly.
 */
export const dayContinuationChoices = ["continue", "finish"] as const;

export type DayContinuationChoice = (typeof dayContinuationChoices)[number];

/**
 * FollowUpPick links one primary Sidewalk recommendation to one compatible
 * second stop.
 *
 * The follow-up remains a complete Place record so future itinerary,
 * persistence, and provider integrations can treat both stops consistently.
 */
export type FollowUpPick = Readonly<{
   followsPlaceId: string;
   place: Place;
}>;
