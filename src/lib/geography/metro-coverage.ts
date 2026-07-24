import { coverageTiers, type CoverageTier, type MetroRegion } from "@/types/metro-region";

/**
 * A grouped representation of active Sidewalk editions.
 *
 * Every coverage tier always exists in the result, even when no active metros
 * currently belong to that tier. This keeps consuming components predictable.
 */
export type MetroRegionsByCoverageTier = Readonly<Record<CoverageTier, readonly MetroRegion[]>>;

/**
 * Groups active metro regions by editorial coverage tier.
 *
 * The source array is never mutated. Draft, paused, or inactive editions are
 * excluded from public-facing metro collections.
 */
export function groupActiveMetroRegionsByCoverageTier(metroRegions: readonly MetroRegion[]): MetroRegionsByCoverageTier {
   const groupedMetroRegions: Record<CoverageTier, MetroRegion[]> = {
      signature: [],
      established: [],
      growing: [],
   };

   for (const metroRegion of metroRegions) {
      const isPubliclyAvailable = metroRegion.isActive && metroRegion.coverageStatus === "active";

      if (!isPubliclyAvailable) {
         continue;
      }

      groupedMetroRegions[metroRegion.coverageTier].push(metroRegion);
   }

   /*
    * Return a fresh object in the shared editorial order rather than relying on
    * object-key enumeration inside UI components.
    */
   return coverageTiers.reduce<MetroRegionsByCoverageTier>(
      (result, coverageTier) => ({
         ...result,
         [coverageTier]: groupedMetroRegions[coverageTier],
      }),
      {
         signature: [],
         established: [],
         growing: [],
      },
   );
}
