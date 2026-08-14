import type { MetroRegion } from "@/types/metro-region";

/**
 * Country is the highest canonical geography authority in Sidewalk.
 *
 * `code` uses ISO 3166-1 alpha-2 values where available. Stable codes let the
 * provider and persistence layers carry geography without depending on display
 * names that may evolve later.
 */
export type Country = Readonly<{
   code: string;
   name: string;
   slug: string;

   /**
    * Preferred first metro when a person intentionally switches countries.
    * The header only exposes countries with active coverage, so this remains
    * a calm navigation default rather than a separate discovery system.
    */
   defaultMetroSlug: string;
}>;

export const regionKinds = [
   "state",
   "province",
   "prefecture",
   "constituent-country",
   "territory",
   "federal-district",
   "administrative-region",
] as const;

export type RegionKind = (typeof regionKinds)[number];

/**
 * Region represents the administrative layer between country and metro.
 *
 * Sidewalk does not attach product behavior to `kind`; it is descriptive
 * metadata so states, provinces, prefectures, constituent nations, and similar
 * regions can share one durable model.
 */
export type Region = Readonly<{
   code: string;
   countryCode: string;
   name: string;
   slug: string;
   kind: RegionKind;
}>;

/**
 * Municipality represents a city, town, or incorporated local jurisdiction
 * within a Sidewalk metro region.
 *
 * `regionCode` is the canonical relationship. `stateOrRegion` remains as a
 * compatibility/display field while existing UI and saved data migrate.
 */
export type Municipality = Readonly<{
   id: string;
   metroRegionId: string;
   name: string;
   slug: string;

   regionCode: string;
   stateOrRegion: string;
}>;

/**
 * Sidewalk uses "local area" internally because not every useful geographic
 * label is formally a neighborhood.
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

/**
 * One fully validated planning destination.
 *
 * Keeping this shape in one place prevents recommendation, sharing, and trip
 * code from independently interpreting geography relationships.
 */
export type ResolvedGeography = Readonly<{
   country: Country;
   region: Region;
   metroRegion: MetroRegion;
   municipality: Municipality;
   localArea: LocalArea;
   timezone: string;
}>;
