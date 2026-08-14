import type { Country } from "@/types/geography";

/**
 * Canonical country authority for Geography V2.
 *
 * Adding a country later is intentionally data-led: give it a stable ISO-style
 * code, a display name/slug, and the metro Sidewalk should open first. The
 * header only surfaces countries that currently have active metro coverage.
 */
export const countries = [
   { code: "US", name: "United States", slug: "united-states", defaultMetroSlug: "san-diego" },
   { code: "CA", name: "Canada", slug: "canada", defaultMetroSlug: "toronto" },
   { code: "GB", name: "United Kingdom", slug: "united-kingdom", defaultMetroSlug: "london" },
   { code: "MX", name: "Mexico", slug: "mexico", defaultMetroSlug: "mexico-city" },
   { code: "JP", name: "Japan", slug: "japan", defaultMetroSlug: "tokyo" },
   { code: "AU", name: "Australia", slug: "australia", defaultMetroSlug: "sydney" },
] as const satisfies readonly Country[];

export function getCountryByCode(countryCode: string): Country | null {
   return countries.find((country) => country.code === countryCode) ?? null;
}
