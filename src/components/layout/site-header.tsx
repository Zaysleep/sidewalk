"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";

import type { MetroRegion } from "@/types/metro-region";

/**
 * Props for Sidewalk's global product header.
 */
type SiteHeaderProps = Readonly<{
   metroRegions: readonly MetroRegion[];
   selectedMetroSlug: string;
   recentMetroSlugs: readonly string[];
   onMetroChange: (metroSlug: string) => void;
}>;

type MetroRegionGroup = Readonly<{
   label: string;
   metroRegions: readonly MetroRegion[];
}>;

const regionalMetroGroupLabel = "Regional Metros";

function getMetroRegionGroupLabel(metroRegion: MetroRegion): string {
   return metroRegion.stateOrRegion.includes("/") ? regionalMetroGroupLabel : metroRegion.stateOrRegion;
}

/**
 * Groups single-state metros by state and places cross-state regions in one
 * predictable Regional Metros section.
 */
function groupMetroRegions(metroRegions: readonly MetroRegion[]): readonly MetroRegionGroup[] {
   const groupedRegions = new Map<string, MetroRegion[]>();

   for (const metroRegion of metroRegions) {
      const groupLabel = getMetroRegionGroupLabel(metroRegion);

      const existingGroup = groupedRegions.get(groupLabel);

      if (existingGroup) {
         existingGroup.push(metroRegion);
         continue;
      }

      groupedRegions.set(groupLabel, [metroRegion]);
   }

   return Array.from(groupedRegions.entries())
      .sort(([firstLabel], [secondLabel]) => {
         if (firstLabel === regionalMetroGroupLabel) {
            return 1;
         }

         if (secondLabel === regionalMetroGroupLabel) {
            return -1;
         }

         return firstLabel.localeCompare(secondLabel);
      })
      .map(([label, regions]) => ({
         label,
         metroRegions: regions.slice().sort((firstMetro, secondMetro) => firstMetro.name.localeCompare(secondMetro.name)),
      }));
}

/**
 * SiteHeader keeps Sidewalk's identity and metro switcher continuously
 * available without turning the metro catalog into a browsing screen.
 */
export function SiteHeader({ metroRegions, selectedMetroSlug, recentMetroSlugs, onMetroChange }: SiteHeaderProps) {
   const metroRegionGroups = groupMetroRegions(metroRegions);

   const recentMetroRegions = recentMetroSlugs.flatMap((metroSlug) => {
      const metroRegion = metroRegions.find((candidate) => candidate.slug === metroSlug);

      return metroRegion ? [metroRegion] : [];
   });

   function handleSelectionChange(event: ChangeEvent<HTMLSelectElement>) {
      onMetroChange(event.target.value);
   }

   return (
      <header className="site-header">
         <a className="site-header__brand-group" href="/" aria-label="Sidewalk home">
            <Image className="site-header__logo" src="/icon.png" alt="Sidewalk" width={512} height={512} priority />

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

            {recentMetroRegions.length > 0 ? (
               <nav className="metro-recent" aria-label="Recently planned metro regions">
                  <span className="metro-recent__label">Recently planned</span>

                  <div className="metro-recent__list">
                     {recentMetroRegions.map((metroRegion) => {
                        const isCurrentMetro = metroRegion.slug === selectedMetroSlug;

                        return (
                           <button key={metroRegion.id} type="button" className="metro-recent__button" aria-current={isCurrentMetro ? "page" : undefined} data-current={isCurrentMetro} onClick={() => onMetroChange(metroRegion.slug)}>
                              {metroRegion.name}
                           </button>
                        );
                     })}
                  </div>
               </nav>
            ) : null}
         </div>
      </header>
   );
}
