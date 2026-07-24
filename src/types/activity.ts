/**
 * Broad activity families used to guide Sidewalk recommendations.
 *
 * These are intentionally wider than place categories. A bookstore is a
 * specific kind of place, while "browse" describes the experience the user
 * wants from that place.
 */
export const activityKinds = ["outdoors", "culture", "browse", "food"] as const;

export type ActivityKind = (typeof activityKinds)[number];

/**
 * Sidewalk Choice allows the recommendation engine to select the strongest
 * approved first anchor without requiring a category preference.
 */
export const activityDirections = [...activityKinds, "sidewalk-choice"] as const;

export type ActivityDirection = (typeof activityDirections)[number];

/**
 * Day roles describe where an approved place can reasonably appear.
 *
 * More specific roles can be introduced after provider data and itinerary
 * composition are established.
 */
export const dayRoles = ["first-anchor", "follow-up"] as const;

export type DayRole = (typeof dayRoles)[number];
