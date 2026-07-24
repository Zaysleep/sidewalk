"use client";

import type { ChangeEvent } from "react";

import type { MetroRegion } from "@/types/metro-region";

/**
 * Props for Sidewalk's global product header.
 */
type SiteHeaderProps = Readonly<{
   metroRegions: readonly MetroRegion[];
   selectedMetroSlug: string;
   onMetroChange: (metroSlug: string) => void;
}>;

/**
 * A selector group represents one state or broader regional label.
 *
 * Some Sidewalk metros cross state boundaries, so the grouping language uses
 * the existing stateOrRegion value rather than forcing every metro into one
 * state.
 */
type MetroRegionGroup = Readonly<{
   label: string;
   metroRegions: readonly MetroRegion[];
}>;

/**
 * Groups the active metro catalog by state or regional context.
 *
 * Both groups and metro names are sorted alphabetically so the selector stays
 * predictable as Sidewalk's coverage grows.
 */
function groupMetroRegions(metroRegions: readonly MetroRegion[]): readonly MetroRegionGroup[] {
   const groupedRegions = new Map<string, MetroRegion[]>();

   for (const metroRegion of metroRegions) {
      const existingGroup = groupedRegions.get(metroRegion.stateOrRegion);

      if (existingGroup) {
         existingGroup.push(metroRegion);
         continue;
      }

      groupedRegions.set(metroRegion.stateOrRegion, [metroRegion]);
   }

   return Array.from(groupedRegions.entries())
      .sort(([firstLabel], [secondLabel]) => firstLabel.localeCompare(secondLabel))
      .map(([label, regions]) => ({
         label,
         metroRegions: regions.slice().sort((firstMetro, secondMetro) => firstMetro.name.localeCompare(secondMetro.name)),
      }));
}

/**
 * SiteHeader keeps the Sidewalk identity and metro switcher continuously
 * available without competing with the selected metro headline.
 *
 * The native select remains the most reliable accessible control for this
 * phase. State and regional optgroups improve scanning without exposing
 * Sidewalk's internal coverage tiers.
 */
export function SiteHeader({ metroRegions, selectedMetroSlug, onMetroChange }: SiteHeaderProps) {
   const metroRegionGroups = groupMetroRegions(metroRegions);

   function handleSelectionChange(event: ChangeEvent<HTMLSelectElement>) {
      onMetroChange(event.target.value);
   }

   return (
      <header className="site-header">
         <a className="site-header__brand-group" href="/" aria-label="Sidewalk home">
            <span className="site-header__brand">Sidewalk</span>
            <span className="site-header__edition">A Kin city guide</span>
         </a>

         <div className="metro-control">
            <label className="metro-control__label" htmlFor="metro-region-select">
               Metro region
            </label>

            <div className="metro-control__field">
               <select id="metro-region-select" className="metro-control__select" value={selectedMetroSlug} onChange={handleSelectionChange}>
                  {metroRegionGroups.map((group) => (
                     <optgroup key={group.label} label={group.label}>
                        {group.metroRegions.map((metroRegion) => (
                           <option key={metroRegion.id} value={metroRegion.slug}>
                              {metroRegion.name}
                           </option>
                        ))}
                     </optgroup>
                  ))}
               </select>

               <span className="metro-control__icon" aria-hidden="true">
                  ⌄
               </span>
            </div>
         </div>
      </header>
   );
}
