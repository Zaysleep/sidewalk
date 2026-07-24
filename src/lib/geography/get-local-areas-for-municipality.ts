import { localAreas } from "@/data/geography/local-areas";
import type { LocalArea } from "@/types/geography";

/**
 * Returns the curated local areas belonging to one municipality.
 *
 * The utility does not assume that every municipality has the same number or
 * type of areas.
 */
export function getLocalAreasForMunicipality(municipalityId: string): readonly LocalArea[] {
   return localAreas
      .filter((localArea) => localArea.municipalityId === municipalityId)
      .slice()
      .sort((firstArea, secondArea) => firstArea.name.localeCompare(secondArea.name));
}
