/**
 * Municipality represents a city, town, or incorporated local jurisdiction
 * within a Sidewalk metro region.
 *
 * stateOrRegion remains attached to the municipality because some metro
 * regions cross state boundaries.
 */
export type Municipality = Readonly<{
   id: string;
   metroRegionId: string;
   name: string;
   slug: string;
   stateOrRegion: string;
}>;

/**
 * Sidewalk uses "local area" internally because not every useful geographic
 * label is formally a neighborhood.
 *
 * Districts, downtowns, corridors, and locally understood areas can all guide
 * discovery without forcing inaccurate neighborhood classifications.
 */
export const localAreaKinds = ["neighborhood", "district", "downtown", "area"] as const;

export type LocalAreaKind = (typeof localAreaKinds)[number];

export type LocalArea = Readonly<{
   id: string;
   municipalityId: string;
   name: string;
   slug: string;
   kind: LocalAreaKind;
}>;
