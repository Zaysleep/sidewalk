/**
 * Coverage tiers describe Sidewalk's editorial maturity in a metro region.
 *
 * These values are deliberately lowercase because they map cleanly to
 * database values and URL-safe application logic.
 */
export const coverageTiers = ["signature", "established", "growing"] as const;

export type CoverageTier = (typeof coverageTiers)[number];

/**
 * Coverage status describes whether an edition is currently available to the
 * product. It is separate from editorial maturity.
 */
export const coverageStatuses = ["draft", "active", "paused"] as const;

export type CoverageStatus = (typeof coverageStatuses)[number];

/**
 * MetroRegion represents the practical destination boundary Sidewalk plans
 * within. A metro may cross administrative-region boundaries, so Geography V2
 * stores both a deterministic primary region and every region the metro spans.
 *
 * `stateOrRegion` remains during the migration because existing UI, persisted
 * browser data, and public share snapshots still use that human-readable
 * label. New geography decisions must use countryCode / primaryRegionCode /
 * regionCodes instead of parsing that string.
 */
export type MetroRegion = Readonly<{
   id: string;
   name: string;
   slug: string;

   stateOrRegion: string;

   countryCode: string;

   primaryRegionCode: string;
   regionCodes: readonly string[];

   /**
    * Canonical IANA timezone for destination-local planning.
    */
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
