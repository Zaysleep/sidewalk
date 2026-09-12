"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";

import { countries, getCountryByCode } from "@/data/geography/countries";
import { getRegionByCode } from "@/data/geography/regions";
import type { MetroRegion } from "@/types/metro-region";

type SiteHeaderProps = Readonly<{
   metroRegions: readonly MetroRegion[];
   selectedMetroSlug: string;
   recentMetroSlugs: readonly string[];
   tripTitle?: string | null;
   tripDayCount?: number;
   onMetroChange: (metroSlug: string) => void;
   onResumeTrip?: () => void;
}>;

type MetroRegionGroup = Readonly<{
   label: string;
   metroRegions: readonly MetroRegion[];
}>;

function groupMetroRegions(metroRegions: readonly MetroRegion[]): readonly MetroRegionGroup[] {
   const groupedRegions = new Map<string, MetroRegion[]>();

   for (const metroRegion of metroRegions) {
      const primaryRegion = getRegionByCode(metroRegion.primaryRegionCode);
      const groupLabel = primaryRegion?.name ?? metroRegion.stateOrRegion;
      const existingGroup = groupedRegions.get(groupLabel);

      if (existingGroup) {
         existingGroup.push(metroRegion);
      } else {
         groupedRegions.set(groupLabel, [metroRegion]);
      }
   }

   return Array.from(groupedRegions.entries())
      .sort(([firstLabel], [secondLabel]) => firstLabel.localeCompare(secondLabel))
      .map(([label, regions]) => ({
         label,
         metroRegions: regions.slice().sort((firstMetro, secondMetro) => firstMetro.name.localeCompare(secondMetro.name)),
      }));
}

/**
 * Country navigation stays deliberately small: one native country select, one
 * metro select, and the existing Recent Metros shortcut. Countries are derived
 * from active metro coverage so future additions do not require another UI
 * branch or a permanently visible empty destination.
 */
export function SiteHeader({ metroRegions, selectedMetroSlug, recentMetroSlugs, tripTitle = null, tripDayCount = 0, onMetroChange, onResumeTrip }: SiteHeaderProps) {
   const selectedMetro = metroRegions.find((candidate) => candidate.slug === selectedMetroSlug) ?? metroRegions[0] ?? null;

   const activeCountryCodes = new Set(metroRegions.map((metroRegion) => metroRegion.countryCode));
   const activeCountries = countries.filter((country) => activeCountryCodes.has(country.code));

   const selectedCountryCode = selectedMetro?.countryCode ?? activeCountries[0]?.code ?? "US";
   const countryMetroRegions = metroRegions.filter((metroRegion) => metroRegion.countryCode === selectedCountryCode);
   const metroRegionGroups = groupMetroRegions(countryMetroRegions);

   const recentMetroRegions = recentMetroSlugs.flatMap((metroSlug) => {
      const metroRegion = metroRegions.find((candidate) => candidate.slug === metroSlug);
      return metroRegion ? [metroRegion] : [];
   });

   const recentCountries = new Set(recentMetroRegions.map((metroRegion) => metroRegion.countryCode));
   const showRecentCountryName = recentCountries.size > 1;

   function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
      const nextCountryCode = event.target.value;

      if (nextCountryCode === selectedCountryCode) {
         return;
      }

      const nextCountry = getCountryByCode(nextCountryCode);
      const availableMetros = metroRegions.filter((metroRegion) => metroRegion.countryCode === nextCountryCode);

      if (availableMetros.length === 0) {
         return;
      }

      /**
       * A recent metro is the least surprising destination if someone has
       * already planned in this country. Otherwise use the country's explicit
       * default rather than relying on alphabetical order.
       */
      const recentMetro = recentMetroSlugs
         .map((metroSlug) => availableMetros.find((metroRegion) => metroRegion.slug === metroSlug) ?? null)
         .find((metroRegion): metroRegion is MetroRegion => metroRegion !== null);

      const defaultMetro = nextCountry ? availableMetros.find((metroRegion) => metroRegion.slug === nextCountry.defaultMetroSlug) ?? null : null;
      const nextMetro = recentMetro ?? defaultMetro ?? availableMetros[0];

      onMetroChange(nextMetro.slug);
   }

   function handleMetroChange(event: ChangeEvent<HTMLSelectElement>) {
      onMetroChange(event.target.value);
   }

   return (
      <header className="site-header">
         <a className="site-header__brand-group" href="/" aria-label="Sidewalk home">
            <Image className="site-header__logo" src="/icon.png" alt="Sidewalk" width={512} height={512} priority />
            <span className="site-header__edition">A Kin city guide</span>
         </a>

         <div className="metro-control">
            <label className="metro-control__label" htmlFor="sidewalk-country-select">
               Country
            </label>

            <div className="metro-control__field">
               <select id="sidewalk-country-select" className="metro-control__select" value={selectedCountryCode} onChange={handleCountryChange}>
                  {activeCountries.map((country) => (
                     <option key={country.code} value={country.code}>
                        {country.name}
                     </option>
                  ))}
               </select>

               <span className="metro-control__icon" aria-hidden="true">
                  ⌄
               </span>
            </div>

            <label className="metro-control__label" htmlFor="metro-region-select">
               Metro region
            </label>

            <div className="metro-control__field">
               <select id="metro-region-select" className="metro-control__select" value={selectedMetroSlug} onChange={handleMetroChange}>
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
                        const country = getCountryByCode(metroRegion.countryCode);
                        const label = showRecentCountryName && country ? `${metroRegion.name} · ${country.name}` : metroRegion.name;

                        return (
                           <button
                              key={metroRegion.id}
                              type="button"
                              className="metro-recent__button"
                              aria-current={isCurrentMetro ? "page" : undefined}
                              data-current={isCurrentMetro}
                              onClick={() => onMetroChange(metroRegion.slug)}
                           >
                              {label}
                           </button>
                        );
                     })}
                  </div>
               </nav>
            ) : null}

            {tripTitle && tripDayCount > 0 && onResumeTrip ? (
               <div className="metro-trip-resume">
                  <span className="metro-trip-resume__label">Saved trip</span>

                  <button type="button" className="metro-trip-resume__button" onClick={onResumeTrip}>
                     Continue {tripTitle} · {tripDayCount} {tripDayCount === 1 ? "day" : "days"}
                  </button>
               </div>
            ) : null}
         </div>
      </header>
   );
}
