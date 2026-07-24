import { municipalities } from "@/data/geography/municipalities";
import type { Municipality } from "@/types/geography";

/**
 * Returns the curated municipalities belonging to one metro region.
 *
 * The source data is not mutated. Alphabetical ordering provides a predictable
 * selector experience regardless of how records are ordered in storage.
 */
export function getMunicipalitiesForMetro(metroRegionId: string): readonly Municipality[] {
   return municipalities
      .filter((municipality) => municipality.metroRegionId === metroRegionId)
      .slice()
      .sort((firstMunicipality, secondMunicipality) => firstMunicipality.name.localeCompare(secondMunicipality.name));
}
