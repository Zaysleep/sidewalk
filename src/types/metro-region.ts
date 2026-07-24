/**
 * Coverage tiers describe Sidewalk's editorial maturity in a metro region.
 *
 * These values are deliberately lowercase because they will eventually map
 * cleanly to database values and URL-safe application logic.
 */
export const coverageTiers = ["signature", "established", "growing"] as const;

export type CoverageTier = (typeof coverageTiers)[number];

/**
 * Coverage status describes whether an edition is currently available to the
 * product. It is separate from editorial maturity.
 *
 * A Growing metro can still be active, while a Signature metro could
 * temporarily be paused without changing its maturity tier.
 */
export const coverageStatuses = ["draft", "active", "paused"] as const;

export type CoverageStatus = (typeof coverageStatuses)[number];

/**
 * MetroRegion is the highest geographic boundary in a Sidewalk planning
 * session.
 *
 * It may include multiple municipalities, counties, or closely connected urban
 * areas. The type intentionally avoids treating every metro as a single city.
 */
export type MetroRegion = Readonly<{
   id: string;
   name: string;
   slug: string;
   stateOrRegion: string;
   countryCode: string;
   timezone: string;

   coverageTier: CoverageTier;
   coverageStatus: CoverageStatus;

   centerLatitude: number;
   centerLongitude: number;

   description: string;
   isActive: boolean;
}>;

/**
 * Public-facing language for each internal coverage tier.
 *
 * Keeping these definitions outside the UI prevents different components from
 * describing the same coverage tier inconsistently.
 */
export type CoverageTierDefinition = Readonly<{
   label: string;
   description: string;
}>;

export const coverageTierDefinitions = {
   signature: {
      label: "Signature",
      description: "Flagship editions with the deepest neighborhood coverage and strongest editorial refinement.",
   },
   established: {
      label: "Established",
      description: "Reliable editions with strong core coverage and a growing collection of complete day guides.",
   },
   growing: {
      label: "Growing",
      description: "Available editions with a complete planning foundation and a smaller, actively curated recommendation pool.",
   },
} satisfies Record<CoverageTier, CoverageTierDefinition>;
