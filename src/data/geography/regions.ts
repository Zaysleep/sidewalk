import type { Region } from "@/types/geography";

/**
 * Canonical administrative-region authority.
 *
 * The United States remains complete across all 50 states plus DC, while E1D
 * adds only the international regions needed by the first beta. Keeping this
 * authority separate from metro coverage makes future country additions a
 * data change instead of a geography-model rewrite.
 */
export const regions = [
   {
      code: "US-AL",
      countryCode: "US",
      name: "Alabama",
      slug: "alabama",
      kind: "state",
   },
   {
      code: "US-AK",
      countryCode: "US",
      name: "Alaska",
      slug: "alaska",
      kind: "state",
   },
   {
      code: "US-AZ",
      countryCode: "US",
      name: "Arizona",
      slug: "arizona",
      kind: "state",
   },
   {
      code: "US-AR",
      countryCode: "US",
      name: "Arkansas",
      slug: "arkansas",
      kind: "state",
   },
   {
      code: "US-CA",
      countryCode: "US",
      name: "California",
      slug: "california",
      kind: "state",
   },
   {
      code: "US-CO",
      countryCode: "US",
      name: "Colorado",
      slug: "colorado",
      kind: "state",
   },
   {
      code: "US-CT",
      countryCode: "US",
      name: "Connecticut",
      slug: "connecticut",
      kind: "state",
   },
   {
      code: "US-DE",
      countryCode: "US",
      name: "Delaware",
      slug: "delaware",
      kind: "state",
   },
   {
      code: "US-DC",
      countryCode: "US",
      name: "District of Columbia",
      slug: "district-of-columbia",
      kind: "federal-district",
   },
   {
      code: "US-FL",
      countryCode: "US",
      name: "Florida",
      slug: "florida",
      kind: "state",
   },
   {
      code: "US-GA",
      countryCode: "US",
      name: "Georgia",
      slug: "georgia",
      kind: "state",
   },
   {
      code: "US-HI",
      countryCode: "US",
      name: "Hawaii",
      slug: "hawaii",
      kind: "state",
   },
   {
      code: "US-ID",
      countryCode: "US",
      name: "Idaho",
      slug: "idaho",
      kind: "state",
   },
   {
      code: "US-IL",
      countryCode: "US",
      name: "Illinois",
      slug: "illinois",
      kind: "state",
   },
   {
      code: "US-IN",
      countryCode: "US",
      name: "Indiana",
      slug: "indiana",
      kind: "state",
   },
   {
      code: "US-IA",
      countryCode: "US",
      name: "Iowa",
      slug: "iowa",
      kind: "state",
   },
   {
      code: "US-KS",
      countryCode: "US",
      name: "Kansas",
      slug: "kansas",
      kind: "state",
   },
   {
      code: "US-KY",
      countryCode: "US",
      name: "Kentucky",
      slug: "kentucky",
      kind: "state",
   },
   {
      code: "US-LA",
      countryCode: "US",
      name: "Louisiana",
      slug: "louisiana",
      kind: "state",
   },
   {
      code: "US-ME",
      countryCode: "US",
      name: "Maine",
      slug: "maine",
      kind: "state",
   },
   {
      code: "US-MD",
      countryCode: "US",
      name: "Maryland",
      slug: "maryland",
      kind: "state",
   },
   {
      code: "US-MA",
      countryCode: "US",
      name: "Massachusetts",
      slug: "massachusetts",
      kind: "state",
   },
   {
      code: "US-MI",
      countryCode: "US",
      name: "Michigan",
      slug: "michigan",
      kind: "state",
   },
   {
      code: "US-MN",
      countryCode: "US",
      name: "Minnesota",
      slug: "minnesota",
      kind: "state",
   },
   {
      code: "US-MS",
      countryCode: "US",
      name: "Mississippi",
      slug: "mississippi",
      kind: "state",
   },
   {
      code: "US-MO",
      countryCode: "US",
      name: "Missouri",
      slug: "missouri",
      kind: "state",
   },
   {
      code: "US-MT",
      countryCode: "US",
      name: "Montana",
      slug: "montana",
      kind: "state",
   },
   {
      code: "US-NE",
      countryCode: "US",
      name: "Nebraska",
      slug: "nebraska",
      kind: "state",
   },
   {
      code: "US-NV",
      countryCode: "US",
      name: "Nevada",
      slug: "nevada",
      kind: "state",
   },
   {
      code: "US-NH",
      countryCode: "US",
      name: "New Hampshire",
      slug: "new-hampshire",
      kind: "state",
   },
   {
      code: "US-NJ",
      countryCode: "US",
      name: "New Jersey",
      slug: "new-jersey",
      kind: "state",
   },
   {
      code: "US-NM",
      countryCode: "US",
      name: "New Mexico",
      slug: "new-mexico",
      kind: "state",
   },
   {
      code: "US-NY",
      countryCode: "US",
      name: "New York",
      slug: "new-york",
      kind: "state",
   },
   {
      code: "US-NC",
      countryCode: "US",
      name: "North Carolina",
      slug: "north-carolina",
      kind: "state",
   },
   {
      code: "US-ND",
      countryCode: "US",
      name: "North Dakota",
      slug: "north-dakota",
      kind: "state",
   },
   {
      code: "US-OH",
      countryCode: "US",
      name: "Ohio",
      slug: "ohio",
      kind: "state",
   },
   {
      code: "US-OK",
      countryCode: "US",
      name: "Oklahoma",
      slug: "oklahoma",
      kind: "state",
   },
   {
      code: "US-OR",
      countryCode: "US",
      name: "Oregon",
      slug: "oregon",
      kind: "state",
   },
   {
      code: "US-PA",
      countryCode: "US",
      name: "Pennsylvania",
      slug: "pennsylvania",
      kind: "state",
   },
   {
      code: "US-RI",
      countryCode: "US",
      name: "Rhode Island",
      slug: "rhode-island",
      kind: "state",
   },
   {
      code: "US-SC",
      countryCode: "US",
      name: "South Carolina",
      slug: "south-carolina",
      kind: "state",
   },
   {
      code: "US-SD",
      countryCode: "US",
      name: "South Dakota",
      slug: "south-dakota",
      kind: "state",
   },
   {
      code: "US-TN",
      countryCode: "US",
      name: "Tennessee",
      slug: "tennessee",
      kind: "state",
   },
   {
      code: "US-TX",
      countryCode: "US",
      name: "Texas",
      slug: "texas",
      kind: "state",
   },
   {
      code: "US-UT",
      countryCode: "US",
      name: "Utah",
      slug: "utah",
      kind: "state",
   },
   {
      code: "US-VT",
      countryCode: "US",
      name: "Vermont",
      slug: "vermont",
      kind: "state",
   },
   {
      code: "US-VA",
      countryCode: "US",
      name: "Virginia",
      slug: "virginia",
      kind: "state",
   },
   {
      code: "US-WA",
      countryCode: "US",
      name: "Washington",
      slug: "washington",
      kind: "state",
   },
   {
      code: "US-WV",
      countryCode: "US",
      name: "West Virginia",
      slug: "west-virginia",
      kind: "state",
   },
   {
      code: "US-WI",
      countryCode: "US",
      name: "Wisconsin",
      slug: "wisconsin",
      kind: "state",
   },
   {
      code: "US-WY",
      countryCode: "US",
      name: "Wyoming",
      slug: "wyoming",
      kind: "state",
   },

   /* Canada */
   { code: "CA-BC", countryCode: "CA", name: "British Columbia", slug: "british-columbia", kind: "province" },
   { code: "CA-ON", countryCode: "CA", name: "Ontario", slug: "ontario", kind: "province" },
   { code: "CA-QC", countryCode: "CA", name: "Quebec", slug: "quebec", kind: "province" },

   /* United Kingdom */
   { code: "GB-ENG", countryCode: "GB", name: "England", slug: "england", kind: "constituent-country" },
   { code: "GB-SCT", countryCode: "GB", name: "Scotland", slug: "scotland", kind: "constituent-country" },

   /* Mexico */
   { code: "MX-CMX", countryCode: "MX", name: "Mexico City", slug: "mexico-city", kind: "administrative-region" },
   { code: "MX-JAL", countryCode: "MX", name: "Jalisco", slug: "jalisco", kind: "state" },

   /* Japan */
   { code: "JP-13", countryCode: "JP", name: "Tokyo", slug: "tokyo", kind: "prefecture" },
   { code: "JP-14", countryCode: "JP", name: "Kanagawa", slug: "kanagawa", kind: "prefecture" },
   { code: "JP-26", countryCode: "JP", name: "Kyoto", slug: "kyoto", kind: "prefecture" },
   { code: "JP-27", countryCode: "JP", name: "Osaka", slug: "osaka", kind: "prefecture" },

   /* Australia */
   { code: "AU-NSW", countryCode: "AU", name: "New South Wales", slug: "new-south-wales", kind: "state" },
   { code: "AU-VIC", countryCode: "AU", name: "Victoria", slug: "victoria", kind: "state" },

] as const satisfies readonly Region[];

export function getRegionByCode(regionCode: string): Region | null {
   return regions.find((region) => region.code === regionCode) ?? null;
}

export function getRegionsForCountry(countryCode: string): readonly Region[] {
   return regions.filter((region) => region.countryCode === countryCode);
}
