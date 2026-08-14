import { getCountryByCode } from "@/data/geography/countries";
import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { getRegionByCode } from "@/data/geography/regions";
import { metroRegions } from "@/data/metros/metro-regions";
import type { ResolvedGeography } from "@/types/geography";

export type ResolveGeographyInput = Readonly<{
   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;
}>;

/**
 * Resolves and validates one complete Sidewalk destination.
 *
 * This is the Geography V2 trust boundary. Recommendation, sharing, and trip
 * code should pass stable ids here rather than re-creating relationship checks
 * or interpreting stateOrRegion display strings independently.
 */
export function resolveGeography(input: ResolveGeographyInput): ResolvedGeography | null {
   const metroRegion = metroRegions.find((candidate) => candidate.id === input.metroRegionId) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === input.municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === input.localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea) {
      return null;
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return null;
   }

   const country = getCountryByCode(metroRegion.countryCode);

   const region = getRegionByCode(municipality.regionCode);

   if (!country || !region) {
      return null;
   }

   if (region.countryCode !== country.code || !metroRegion.regionCodes.includes(region.code)) {
      return null;
   }

   if (!metroRegion.regionCodes.includes(metroRegion.primaryRegionCode)) {
      return null;
   }

   return {
      country,
      region,
      metroRegion,
      municipality,
      localArea,
      timezone: metroRegion.timezone,
   };
}
