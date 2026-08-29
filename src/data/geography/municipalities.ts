import type { Municipality } from "@/types/geography";

/**
 * Curated municipalities for Sidewalk's metro catalog.
 *
 * Geography V2 adds a canonical regionCode to every municipality while
 * preserving existing ids, slugs, names, and stateOrRegion display values.
 * The catalog remains intentionally selective rather than exhaustive.
 */
export const municipalities = [
   /* ------------------------------------------------------------------------ */
   /* San Diego                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-san-diego-san-diego",
      metroRegionId: "metro-san-diego",
      name: "San Diego",
      slug: "san-diego",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-chula-vista",
      metroRegionId: "metro-san-diego",
      name: "Chula Vista",
      slug: "chula-vista",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-encinitas",
      metroRegionId: "metro-san-diego",
      name: "Encinitas",
      slug: "encinitas",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-national-city",
      metroRegionId: "metro-san-diego",
      name: "National City",
      slug: "national-city",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* ------------------------------------------------------------------------ */
   /* Orange County                                                           */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-orange-county-irvine",
      metroRegionId: "metro-orange-county",
      name: "Irvine",
      slug: "irvine",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-costa-mesa",
      metroRegionId: "metro-orange-county",
      name: "Costa Mesa",
      slug: "costa-mesa",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-santa-ana",
      metroRegionId: "metro-orange-county",
      name: "Santa Ana",
      slug: "santa-ana",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-anaheim",
      metroRegionId: "metro-orange-county",
      name: "Anaheim",
      slug: "anaheim",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-fullerton",
      metroRegionId: "metro-orange-county",
      name: "Fullerton",
      slug: "fullerton",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-newport-beach",
      metroRegionId: "metro-orange-county",
      name: "Newport Beach",
      slug: "newport-beach",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-huntington-beach",
      metroRegionId: "metro-orange-county",
      name: "Huntington Beach",
      slug: "huntington-beach",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-orange",
      metroRegionId: "metro-orange-county",
      name: "Orange",
      slug: "orange",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-westminster",
      metroRegionId: "metro-orange-county",
      name: "Westminster",
      slug: "westminster",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-garden-grove",
      metroRegionId: "metro-orange-county",
      name: "Garden Grove",
      slug: "garden-grove",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-laguna-beach",
      metroRegionId: "metro-orange-county",
      name: "Laguna Beach",
      slug: "laguna-beach",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* ------------------------------------------------------------------------ */
   /* Palm Springs                                                            */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-palm-springs-palm-springs",
      metroRegionId: "metro-palm-springs",
      name: "Palm Springs",
      slug: "palm-springs",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-palm-springs-palm-desert",
      metroRegionId: "metro-palm-springs",
      name: "Palm Desert",
      slug: "palm-desert",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-palm-springs-rancho-mirage",
      metroRegionId: "metro-palm-springs",
      name: "Rancho Mirage",
      slug: "rancho-mirage",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-palm-springs-cathedral-city",
      metroRegionId: "metro-palm-springs",
      name: "Cathedral City",
      slug: "cathedral-city",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* ------------------------------------------------------------------------ */
   /* Los Angeles                                                             */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-los-angeles-los-angeles",
      metroRegionId: "metro-los-angeles",
      name: "Los Angeles",
      slug: "los-angeles",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-santa-monica",
      metroRegionId: "metro-los-angeles",
      name: "Santa Monica",
      slug: "santa-monica",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-pasadena",
      metroRegionId: "metro-los-angeles",
      name: "Pasadena",
      slug: "pasadena",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-long-beach",
      metroRegionId: "metro-los-angeles",
      name: "Long Beach",
      slug: "long-beach",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* ------------------------------------------------------------------------ */
   /* San Francisco Bay Area                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-bay-area-san-francisco",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "San Francisco",
      slug: "san-francisco",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-oakland",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "Oakland",
      slug: "oakland",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-berkeley",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "Berkeley",
      slug: "berkeley",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-san-jose",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "San Jose",
      slug: "san-jose",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* ------------------------------------------------------------------------ */
   /* Seattle                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-seattle-seattle",
      metroRegionId: "metro-seattle",
      name: "Seattle",
      slug: "seattle",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },
   {
      id: "municipality-seattle-bellevue",
      metroRegionId: "metro-seattle",
      name: "Bellevue",
      slug: "bellevue",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },
   {
      id: "municipality-seattle-tacoma",
      metroRegionId: "metro-seattle",
      name: "Tacoma",
      slug: "tacoma",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },

   /* ------------------------------------------------------------------------ */
   /* Phoenix                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-phoenix-phoenix",
      metroRegionId: "metro-phoenix",
      name: "Phoenix",
      slug: "phoenix",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-scottsdale",
      metroRegionId: "metro-phoenix",
      name: "Scottsdale",
      slug: "scottsdale",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-tempe",
      metroRegionId: "metro-phoenix",
      name: "Tempe",
      slug: "tempe",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-mesa",
      metroRegionId: "metro-phoenix",
      name: "Mesa",
      slug: "mesa",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },

   /* ------------------------------------------------------------------------ */
   /* Las Vegas                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-las-vegas-las-vegas",
      metroRegionId: "metro-las-vegas",
      name: "Las Vegas",
      slug: "las-vegas",
      regionCode: "US-NV",
      stateOrRegion: "Nevada",
   },
   {
      id: "municipality-las-vegas-henderson",
      metroRegionId: "metro-las-vegas",
      name: "Henderson",
      slug: "henderson",
      regionCode: "US-NV",
      stateOrRegion: "Nevada",
   },
   {
      id: "municipality-las-vegas-north-las-vegas",
      metroRegionId: "metro-las-vegas",
      name: "North Las Vegas",
      slug: "north-las-vegas",
      regionCode: "US-NV",
      stateOrRegion: "Nevada",
   },

   /* ------------------------------------------------------------------------ */
   /* Portland                                                                */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-portland-portland",
      metroRegionId: "metro-portland",
      name: "Portland",
      slug: "portland",
      regionCode: "US-OR",
      stateOrRegion: "Oregon",
   },
   {
      id: "municipality-portland-beaverton",
      metroRegionId: "metro-portland",
      name: "Beaverton",
      slug: "beaverton",
      regionCode: "US-OR",
      stateOrRegion: "Oregon",
   },
   {
      id: "municipality-portland-vancouver",
      metroRegionId: "metro-portland",
      name: "Vancouver",
      slug: "vancouver",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },

   /* ------------------------------------------------------------------------ */
   /* Denver                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-denver-denver",
      metroRegionId: "metro-denver",
      name: "Denver",
      slug: "denver",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-aurora",
      metroRegionId: "metro-denver",
      name: "Aurora",
      slug: "aurora",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-boulder",
      metroRegionId: "metro-denver",
      name: "Boulder",
      slug: "boulder",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-golden",
      metroRegionId: "metro-denver",
      name: "Golden",
      slug: "golden",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },

   /* ------------------------------------------------------------------------ */
   /* Chicago                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-chicago-chicago",
      metroRegionId: "metro-chicago",
      name: "Chicago",
      slug: "chicago",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },
   {
      id: "municipality-chicago-evanston",
      metroRegionId: "metro-chicago",
      name: "Evanston",
      slug: "evanston",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },
   {
      id: "municipality-chicago-oak-park",
      metroRegionId: "metro-chicago",
      name: "Oak Park",
      slug: "oak-park",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },

   /* ------------------------------------------------------------------------ */
   /* Dallas–Fort Worth                                                       */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-dfw-dallas",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Dallas",
      slug: "dallas",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-fort-worth",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Fort Worth",
      slug: "fort-worth",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-arlington",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Arlington",
      slug: "arlington",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-plano",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Plano",
      slug: "plano",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   /* ------------------------------------------------------------------------ */
   /* Austin                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-austin-austin",
      metroRegionId: "metro-austin",
      name: "Austin",
      slug: "austin",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-austin-round-rock",
      metroRegionId: "metro-austin",
      name: "Round Rock",
      slug: "round-rock",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-austin-georgetown",
      metroRegionId: "metro-austin",
      name: "Georgetown",
      slug: "georgetown",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   /* ------------------------------------------------------------------------ */
   /* New York Metro                                                          */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-new-york-new-york-city",
      metroRegionId: "metro-new-york",
      name: "New York City",
      slug: "new-york-city",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },
   {
      id: "municipality-new-york-jersey-city",
      metroRegionId: "metro-new-york",
      name: "Jersey City",
      slug: "jersey-city",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },
   {
      id: "municipality-new-york-newark",
      metroRegionId: "metro-new-york",
      name: "Newark",
      slug: "newark",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },
   {
      id: "municipality-new-york-yonkers",
      metroRegionId: "metro-new-york",
      name: "Yonkers",
      slug: "yonkers",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },

   /* ------------------------------------------------------------------------ */
   /* Boston                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-boston-boston",
      metroRegionId: "metro-boston",
      name: "Boston",
      slug: "boston",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-cambridge",
      metroRegionId: "metro-boston",
      name: "Cambridge",
      slug: "cambridge",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-somerville",
      metroRegionId: "metro-boston",
      name: "Somerville",
      slug: "somerville",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-brookline",
      metroRegionId: "metro-boston",
      name: "Brookline",
      slug: "brookline",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },

   /* ------------------------------------------------------------------------ */
   /* Philadelphia                                                            */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-philadelphia-philadelphia",
      metroRegionId: "metro-philadelphia",
      name: "Philadelphia",
      slug: "philadelphia",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-philadelphia-media",
      metroRegionId: "metro-philadelphia",
      name: "Media",
      slug: "media",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-philadelphia-collingswood",
      metroRegionId: "metro-philadelphia",
      name: "Collingswood",
      slug: "collingswood",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },

   /* ------------------------------------------------------------------------ */
   /* Washington DC Metro                                                     */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-dc-washington",
      metroRegionId: "metro-washington-dc",
      name: "Washington",
      slug: "washington",
      regionCode: "US-DC",
      stateOrRegion: "District of Columbia",
   },
   {
      id: "municipality-dc-alexandria",
      metroRegionId: "metro-washington-dc",
      name: "Alexandria",
      slug: "alexandria",
      regionCode: "US-VA",
      stateOrRegion: "Virginia",
   },
   {
      id: "municipality-dc-arlington",
      metroRegionId: "metro-washington-dc",
      name: "Arlington",
      slug: "arlington",
      regionCode: "US-VA",
      stateOrRegion: "Virginia",
   },
   {
      id: "municipality-dc-bethesda",
      metroRegionId: "metro-washington-dc",
      name: "Bethesda",
      slug: "bethesda",
      regionCode: "US-MD",
      stateOrRegion: "Maryland",
   },

   /* ------------------------------------------------------------------------ */
   /* Atlanta                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-atlanta-atlanta",
      metroRegionId: "metro-atlanta",
      name: "Atlanta",
      slug: "atlanta",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },
   {
      id: "municipality-atlanta-decatur",
      metroRegionId: "metro-atlanta",
      name: "Decatur",
      slug: "decatur",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },
   {
      id: "municipality-atlanta-marietta",
      metroRegionId: "metro-atlanta",
      name: "Marietta",
      slug: "marietta",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },

   /* ------------------------------------------------------------------------ */
   /* Houston                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-houston-houston",
      metroRegionId: "metro-houston",
      name: "Houston",
      slug: "houston",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-sugar-land",
      metroRegionId: "metro-houston",
      name: "Sugar Land",
      slug: "sugar-land",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-the-woodlands",
      metroRegionId: "metro-houston",
      name: "The Woodlands",
      slug: "the-woodlands",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-galveston",
      metroRegionId: "metro-houston",
      name: "Galveston",
      slug: "galveston",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   /* ------------------------------------------------------------------------ */
   /* Miami                                                                   */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-miami-miami",
      metroRegionId: "metro-miami",
      name: "Miami",
      slug: "miami",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-miami-beach",
      metroRegionId: "metro-miami",
      name: "Miami Beach",
      slug: "miami-beach",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-coral-gables",
      metroRegionId: "metro-miami",
      name: "Coral Gables",
      slug: "coral-gables",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-fort-lauderdale",
      metroRegionId: "metro-miami",
      name: "Fort Lauderdale",
      slug: "fort-lauderdale",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   /* ------------------------------------------------------------------------ */
   /* Orlando                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-orlando-orlando",
      metroRegionId: "metro-orlando",
      name: "Orlando",
      slug: "orlando",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-winter-park",
      metroRegionId: "metro-orlando",
      name: "Winter Park",
      slug: "winter-park",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-kissimmee",
      metroRegionId: "metro-orlando",
      name: "Kissimmee",
      slug: "kissimmee",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-sanford",
      metroRegionId: "metro-orlando",
      name: "Sanford",
      slug: "sanford",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   /* ------------------------------------------------------------------------ */
   /* Nashville                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-nashville-nashville",
      metroRegionId: "metro-nashville",
      name: "Nashville",
      slug: "nashville",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-franklin",
      metroRegionId: "metro-nashville",
      name: "Franklin",
      slug: "franklin",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-murfreesboro",
      metroRegionId: "metro-nashville",
      name: "Murfreesboro",
      slug: "murfreesboro",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-hendersonville",
      metroRegionId: "metro-nashville",
      name: "Hendersonville",
      slug: "hendersonville",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },

   /* ------------------------------------------------------------------------ */
   /* Controlled U.S. expansion                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "municipality-baltimore-baltimore",
      metroRegionId: "metro-baltimore",
      name: "Baltimore",
      slug: "baltimore",
      regionCode: "US-MD",
      stateOrRegion: "Maryland",
   },
   {
      id: "municipality-buffalo-buffalo",
      metroRegionId: "metro-buffalo",
      name: "Buffalo",
      slug: "buffalo",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },
   {
      id: "municipality-charlotte-charlotte",
      metroRegionId: "metro-charlotte",
      name: "Charlotte",
      slug: "charlotte",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-cincinnati-cincinnati",
      metroRegionId: "metro-cincinnati",
      name: "Cincinnati",
      slug: "cincinnati",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-cincinnati-covington",
      metroRegionId: "metro-cincinnati",
      name: "Covington",
      slug: "covington",
      regionCode: "US-KY",
      stateOrRegion: "Kentucky",
   },
   {
      id: "municipality-cleveland-cleveland",
      metroRegionId: "metro-cleveland",
      name: "Cleveland",
      slug: "cleveland",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-columbus-columbus",
      metroRegionId: "metro-columbus",
      name: "Columbus",
      slug: "columbus",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-detroit-detroit",
      metroRegionId: "metro-detroit",
      name: "Detroit",
      slug: "detroit",
      regionCode: "US-MI",
      stateOrRegion: "Michigan",
   },
   {
      id: "municipality-green-bay-green-bay",
      metroRegionId: "metro-green-bay",
      name: "Green Bay",
      slug: "green-bay",
      regionCode: "US-WI",
      stateOrRegion: "Wisconsin",
   },
   {
      id: "municipality-indianapolis-indianapolis",
      metroRegionId: "metro-indianapolis",
      name: "Indianapolis",
      slug: "indianapolis",
      regionCode: "US-IN",
      stateOrRegion: "Indiana",
   },
   {
      id: "municipality-jacksonville-jacksonville",
      metroRegionId: "metro-jacksonville",
      name: "Jacksonville",
      slug: "jacksonville",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-jacksonville-jacksonville-beach",
      metroRegionId: "metro-jacksonville",
      name: "Jacksonville Beach",
      slug: "jacksonville-beach",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-kansas-city-kansas-city",
      metroRegionId: "metro-kansas-city",
      name: "Kansas City",
      slug: "kansas-city",
      regionCode: "US-MO",
      stateOrRegion: "Missouri",
   },
   {
      id: "municipality-kansas-city-overland-park",
      metroRegionId: "metro-kansas-city",
      name: "Overland Park",
      slug: "overland-park",
      regionCode: "US-KS",
      stateOrRegion: "Kansas",
   },
   {
      id: "municipality-memphis-memphis",
      metroRegionId: "metro-memphis",
      name: "Memphis",
      slug: "memphis",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-milwaukee-milwaukee",
      metroRegionId: "metro-milwaukee",
      name: "Milwaukee",
      slug: "milwaukee",
      regionCode: "US-WI",
      stateOrRegion: "Wisconsin",
   },
   {
      id: "municipality-twin-cities-minneapolis",
      metroRegionId: "metro-minneapolis-saint-paul",
      name: "Minneapolis",
      slug: "minneapolis",
      regionCode: "US-MN",
      stateOrRegion: "Minnesota",
   },
   {
      id: "municipality-twin-cities-saint-paul",
      metroRegionId: "metro-minneapolis-saint-paul",
      name: "Saint Paul",
      slug: "saint-paul",
      regionCode: "US-MN",
      stateOrRegion: "Minnesota",
   },
   {
      id: "municipality-new-orleans-new-orleans",
      metroRegionId: "metro-new-orleans",
      name: "New Orleans",
      slug: "new-orleans",
      regionCode: "US-LA",
      stateOrRegion: "Louisiana",
   },
   {
      id: "municipality-oklahoma-city-oklahoma-city",
      metroRegionId: "metro-oklahoma-city",
      name: "Oklahoma City",
      slug: "oklahoma-city",
      regionCode: "US-OK",
      stateOrRegion: "Oklahoma",
   },
   {
      id: "municipality-pittsburgh-pittsburgh",
      metroRegionId: "metro-pittsburgh",
      name: "Pittsburgh",
      slug: "pittsburgh",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-raleigh-durham-raleigh",
      metroRegionId: "metro-raleigh-durham",
      name: "Raleigh",
      slug: "raleigh",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-raleigh-durham-durham",
      metroRegionId: "metro-raleigh-durham",
      name: "Durham",
      slug: "durham",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-sacramento-sacramento",
      metroRegionId: "metro-sacramento",
      name: "Sacramento",
      slug: "sacramento",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },
   {
      id: "municipality-salt-lake-city-salt-lake-city",
      metroRegionId: "metro-salt-lake-city",
      name: "Salt Lake City",
      slug: "salt-lake-city",
      regionCode: "US-UT",
      stateOrRegion: "Utah",
   },
   {
      id: "municipality-san-antonio-san-antonio",
      metroRegionId: "metro-san-antonio",
      name: "San Antonio",
      slug: "san-antonio",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-st-louis-st-louis",
      metroRegionId: "metro-st-louis",
      name: "St. Louis",
      slug: "st-louis",
      regionCode: "US-MO",
      stateOrRegion: "Missouri",
   },
   {
      id: "municipality-tampa-bay-tampa",
      metroRegionId: "metro-tampa-bay",
      name: "Tampa",
      slug: "tampa",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-tampa-bay-st-petersburg",
      metroRegionId: "metro-tampa-bay",
      name: "St. Petersburg",
      slug: "st-petersburg",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   /* ------------------------------------------------------------------------ */
   /* E1B — primary municipalities for nationwide growing editions             */
   /* ------------------------------------------------------------------------ */

   /* Alabama */

   {
      id: "municipality-birmingham-birmingham",
      metroRegionId: "metro-birmingham",
      name: "Birmingham",
      slug: "birmingham",
      regionCode: "US-AL",
      stateOrRegion: "Alabama",
   },

   {
      id: "municipality-huntsville-huntsville",
      metroRegionId: "metro-huntsville",
      name: "Huntsville",
      slug: "huntsville",
      regionCode: "US-AL",
      stateOrRegion: "Alabama",
   },

   {
      id: "municipality-mobile-mobile",
      metroRegionId: "metro-mobile",
      name: "Mobile",
      slug: "mobile",
      regionCode: "US-AL",
      stateOrRegion: "Alabama",
   },

   /* Alaska */

   {
      id: "municipality-anchorage-anchorage",
      metroRegionId: "metro-anchorage",
      name: "Anchorage",
      slug: "anchorage",
      regionCode: "US-AK",
      stateOrRegion: "Alaska",
   },

   {
      id: "municipality-juneau-juneau",
      metroRegionId: "metro-juneau",
      name: "Juneau",
      slug: "juneau",
      regionCode: "US-AK",
      stateOrRegion: "Alaska",
   },

   /* Arizona */

   {
      id: "municipality-flagstaff-flagstaff",
      metroRegionId: "metro-flagstaff",
      name: "Flagstaff",
      slug: "flagstaff",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },

   {
      id: "municipality-tucson-tucson",
      metroRegionId: "metro-tucson",
      name: "Tucson",
      slug: "tucson",
      regionCode: "US-AZ",
      stateOrRegion: "Arizona",
   },

   /* Arkansas */

   {
      id: "municipality-fayetteville-arkansas-fayetteville",
      metroRegionId: "metro-fayetteville-arkansas",
      name: "Fayetteville",
      slug: "fayetteville",
      regionCode: "US-AR",
      stateOrRegion: "Arkansas",
   },

   {
      id: "municipality-little-rock-little-rock",
      metroRegionId: "metro-little-rock",
      name: "Little Rock",
      slug: "little-rock",
      regionCode: "US-AR",
      stateOrRegion: "Arkansas",
   },

   /* California */

   {
      id: "municipality-fresno-fresno",
      metroRegionId: "metro-fresno",
      name: "Fresno",
      slug: "fresno",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   {
      id: "municipality-monterey-monterey",
      metroRegionId: "metro-monterey",
      name: "Monterey",
      slug: "monterey",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   {
      id: "municipality-napa-napa",
      metroRegionId: "metro-napa",
      name: "Napa",
      slug: "napa",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   {
      id: "municipality-san-luis-obispo-san-luis-obispo",
      metroRegionId: "metro-san-luis-obispo",
      name: "San Luis Obispo",
      slug: "san-luis-obispo",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   {
      id: "municipality-santa-barbara-santa-barbara",
      metroRegionId: "metro-santa-barbara",
      name: "Santa Barbara",
      slug: "santa-barbara",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   {
      id: "municipality-santa-cruz-santa-cruz",
      metroRegionId: "metro-santa-cruz",
      name: "Santa Cruz",
      slug: "santa-cruz",
      regionCode: "US-CA",
      stateOrRegion: "California",
   },

   /* Colorado */

   {
      id: "municipality-boulder-boulder",
      metroRegionId: "metro-boulder",
      name: "Boulder",
      slug: "boulder",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },

   {
      id: "municipality-colorado-springs-colorado-springs",
      metroRegionId: "metro-colorado-springs",
      name: "Colorado Springs",
      slug: "colorado-springs",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },

   {
      id: "municipality-fort-collins-fort-collins",
      metroRegionId: "metro-fort-collins",
      name: "Fort Collins",
      slug: "fort-collins",
      regionCode: "US-CO",
      stateOrRegion: "Colorado",
   },

   /* Connecticut */

   {
      id: "municipality-hartford-hartford",
      metroRegionId: "metro-hartford",
      name: "Hartford",
      slug: "hartford",
      regionCode: "US-CT",
      stateOrRegion: "Connecticut",
   },

   {
      id: "municipality-new-haven-new-haven",
      metroRegionId: "metro-new-haven",
      name: "New Haven",
      slug: "new-haven",
      regionCode: "US-CT",
      stateOrRegion: "Connecticut",
   },

   /* Delaware */

   {
      id: "municipality-rehoboth-beach-rehoboth-beach",
      metroRegionId: "metro-rehoboth-beach",
      name: "Rehoboth Beach",
      slug: "rehoboth-beach",
      regionCode: "US-DE",
      stateOrRegion: "Delaware",
   },

   {
      id: "municipality-wilmington-delaware-wilmington",
      metroRegionId: "metro-wilmington-delaware",
      name: "Wilmington",
      slug: "wilmington",
      regionCode: "US-DE",
      stateOrRegion: "Delaware",
   },

   /* Florida */

   {
      id: "municipality-key-west-key-west",
      metroRegionId: "metro-key-west",
      name: "Key West",
      slug: "key-west",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   {
      id: "municipality-naples-florida-naples",
      metroRegionId: "metro-naples-florida",
      name: "Naples",
      slug: "naples",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   {
      id: "municipality-pensacola-pensacola",
      metroRegionId: "metro-pensacola",
      name: "Pensacola",
      slug: "pensacola",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   {
      id: "municipality-sarasota-sarasota",
      metroRegionId: "metro-sarasota",
      name: "Sarasota",
      slug: "sarasota",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   {
      id: "municipality-tallahassee-tallahassee",
      metroRegionId: "metro-tallahassee",
      name: "Tallahassee",
      slug: "tallahassee",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   {
      id: "municipality-west-palm-beach-west-palm-beach",
      metroRegionId: "metro-west-palm-beach",
      name: "West Palm Beach",
      slug: "west-palm-beach",
      regionCode: "US-FL",
      stateOrRegion: "Florida",
   },

   /* Georgia */

   {
      id: "municipality-athens-georgia-athens",
      metroRegionId: "metro-athens-georgia",
      name: "Athens",
      slug: "athens",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },

   {
      id: "municipality-augusta-georgia-augusta",
      metroRegionId: "metro-augusta-georgia",
      name: "Augusta",
      slug: "augusta",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },

   {
      id: "municipality-savannah-savannah",
      metroRegionId: "metro-savannah",
      name: "Savannah",
      slug: "savannah",
      regionCode: "US-GA",
      stateOrRegion: "Georgia",
   },

   /* Hawaii */

   {
      id: "municipality-hilo-hilo",
      metroRegionId: "metro-hilo",
      name: "Hilo",
      slug: "hilo",
      regionCode: "US-HI",
      stateOrRegion: "Hawaii",
   },

   {
      id: "municipality-honolulu-honolulu",
      metroRegionId: "metro-honolulu",
      name: "Honolulu",
      slug: "honolulu",
      regionCode: "US-HI",
      stateOrRegion: "Hawaii",
   },

   /* Idaho */

   {
      id: "municipality-boise-boise",
      metroRegionId: "metro-boise",
      name: "Boise",
      slug: "boise",
      regionCode: "US-ID",
      stateOrRegion: "Idaho",
   },

   {
      id: "municipality-coeur-dalene-coeur-dalene",
      metroRegionId: "metro-coeur-dalene",
      name: "Coeur d'Alene",
      slug: "coeur-dalene",
      regionCode: "US-ID",
      stateOrRegion: "Idaho",
   },

   /* Illinois */

   {
      id: "municipality-champaign-champaign",
      metroRegionId: "metro-champaign",
      name: "Champaign",
      slug: "champaign",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },

   {
      id: "municipality-peoria-peoria",
      metroRegionId: "metro-peoria",
      name: "Peoria",
      slug: "peoria",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },

   {
      id: "municipality-springfield-illinois-springfield",
      metroRegionId: "metro-springfield-illinois",
      name: "Springfield",
      slug: "springfield",
      regionCode: "US-IL",
      stateOrRegion: "Illinois",
   },

   /* Indiana */

   {
      id: "municipality-bloomington-indiana-bloomington",
      metroRegionId: "metro-bloomington-indiana",
      name: "Bloomington",
      slug: "bloomington",
      regionCode: "US-IN",
      stateOrRegion: "Indiana",
   },

   {
      id: "municipality-fort-wayne-fort-wayne",
      metroRegionId: "metro-fort-wayne",
      name: "Fort Wayne",
      slug: "fort-wayne",
      regionCode: "US-IN",
      stateOrRegion: "Indiana",
   },

   {
      id: "municipality-south-bend-south-bend",
      metroRegionId: "metro-south-bend",
      name: "South Bend",
      slug: "south-bend",
      regionCode: "US-IN",
      stateOrRegion: "Indiana",
   },

   /* Iowa */

   {
      id: "municipality-cedar-rapids-cedar-rapids",
      metroRegionId: "metro-cedar-rapids",
      name: "Cedar Rapids",
      slug: "cedar-rapids",
      regionCode: "US-IA",
      stateOrRegion: "Iowa",
   },

   {
      id: "municipality-des-moines-des-moines",
      metroRegionId: "metro-des-moines",
      name: "Des Moines",
      slug: "des-moines",
      regionCode: "US-IA",
      stateOrRegion: "Iowa",
   },

   {
      id: "municipality-iowa-city-iowa-city",
      metroRegionId: "metro-iowa-city",
      name: "Iowa City",
      slug: "iowa-city",
      regionCode: "US-IA",
      stateOrRegion: "Iowa",
   },

   /* Kansas */

   {
      id: "municipality-lawrence-kansas-lawrence",
      metroRegionId: "metro-lawrence-kansas",
      name: "Lawrence",
      slug: "lawrence",
      regionCode: "US-KS",
      stateOrRegion: "Kansas",
   },

   {
      id: "municipality-wichita-wichita",
      metroRegionId: "metro-wichita",
      name: "Wichita",
      slug: "wichita",
      regionCode: "US-KS",
      stateOrRegion: "Kansas",
   },

   /* Kentucky */

   {
      id: "municipality-lexington-kentucky-lexington",
      metroRegionId: "metro-lexington-kentucky",
      name: "Lexington",
      slug: "lexington",
      regionCode: "US-KY",
      stateOrRegion: "Kentucky",
   },

   {
      id: "municipality-louisville-louisville",
      metroRegionId: "metro-louisville",
      name: "Louisville",
      slug: "louisville",
      regionCode: "US-KY",
      stateOrRegion: "Kentucky",
   },

   /* Louisiana */

   {
      id: "municipality-baton-rouge-baton-rouge",
      metroRegionId: "metro-baton-rouge",
      name: "Baton Rouge",
      slug: "baton-rouge",
      regionCode: "US-LA",
      stateOrRegion: "Louisiana",
   },

   {
      id: "municipality-lafayette-louisiana-lafayette",
      metroRegionId: "metro-lafayette-louisiana",
      name: "Lafayette",
      slug: "lafayette",
      regionCode: "US-LA",
      stateOrRegion: "Louisiana",
   },

   {
      id: "municipality-shreveport-shreveport",
      metroRegionId: "metro-shreveport",
      name: "Shreveport",
      slug: "shreveport",
      regionCode: "US-LA",
      stateOrRegion: "Louisiana",
   },

   /* Maine */

   {
      id: "municipality-bangor-bangor",
      metroRegionId: "metro-bangor",
      name: "Bangor",
      slug: "bangor",
      regionCode: "US-ME",
      stateOrRegion: "Maine",
   },

   {
      id: "municipality-portland-maine-portland",
      metroRegionId: "metro-portland-maine",
      name: "Portland",
      slug: "portland",
      regionCode: "US-ME",
      stateOrRegion: "Maine",
   },

   /* Maryland */

   {
      id: "municipality-annapolis-annapolis",
      metroRegionId: "metro-annapolis",
      name: "Annapolis",
      slug: "annapolis",
      regionCode: "US-MD",
      stateOrRegion: "Maryland",
   },

   {
      id: "municipality-frederick-maryland-frederick",
      metroRegionId: "metro-frederick-maryland",
      name: "Frederick",
      slug: "frederick",
      regionCode: "US-MD",
      stateOrRegion: "Maryland",
   },

   /* Massachusetts */

   {
      id: "municipality-salem-massachusetts-salem",
      metroRegionId: "metro-salem-massachusetts",
      name: "Salem",
      slug: "salem",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },

   {
      id: "municipality-springfield-massachusetts-springfield",
      metroRegionId: "metro-springfield-massachusetts",
      name: "Springfield",
      slug: "springfield",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },

   {
      id: "municipality-worcester-worcester",
      metroRegionId: "metro-worcester",
      name: "Worcester",
      slug: "worcester",
      regionCode: "US-MA",
      stateOrRegion: "Massachusetts",
   },

   /* Michigan */

   {
      id: "municipality-ann-arbor-ann-arbor",
      metroRegionId: "metro-ann-arbor",
      name: "Ann Arbor",
      slug: "ann-arbor",
      regionCode: "US-MI",
      stateOrRegion: "Michigan",
   },

   {
      id: "municipality-grand-rapids-grand-rapids",
      metroRegionId: "metro-grand-rapids",
      name: "Grand Rapids",
      slug: "grand-rapids",
      regionCode: "US-MI",
      stateOrRegion: "Michigan",
   },

   {
      id: "municipality-lansing-lansing",
      metroRegionId: "metro-lansing",
      name: "Lansing",
      slug: "lansing",
      regionCode: "US-MI",
      stateOrRegion: "Michigan",
   },

   {
      id: "municipality-traverse-city-traverse-city",
      metroRegionId: "metro-traverse-city",
      name: "Traverse City",
      slug: "traverse-city",
      regionCode: "US-MI",
      stateOrRegion: "Michigan",
   },

   /* Minnesota */

   {
      id: "municipality-duluth-duluth",
      metroRegionId: "metro-duluth",
      name: "Duluth",
      slug: "duluth",
      regionCode: "US-MN",
      stateOrRegion: "Minnesota",
   },

   {
      id: "municipality-rochester-minnesota-rochester",
      metroRegionId: "metro-rochester-minnesota",
      name: "Rochester",
      slug: "rochester",
      regionCode: "US-MN",
      stateOrRegion: "Minnesota",
   },

   /* Mississippi */

   {
      id: "municipality-gulfport-gulfport",
      metroRegionId: "metro-gulfport",
      name: "Gulfport",
      slug: "gulfport",
      regionCode: "US-MS",
      stateOrRegion: "Mississippi",
   },

   {
      id: "municipality-jackson-mississippi-jackson",
      metroRegionId: "metro-jackson-mississippi",
      name: "Jackson",
      slug: "jackson",
      regionCode: "US-MS",
      stateOrRegion: "Mississippi",
   },

   /* Missouri */

   {
      id: "municipality-columbia-missouri-columbia",
      metroRegionId: "metro-columbia-missouri",
      name: "Columbia",
      slug: "columbia",
      regionCode: "US-MO",
      stateOrRegion: "Missouri",
   },

   {
      id: "municipality-springfield-missouri-springfield",
      metroRegionId: "metro-springfield-missouri",
      name: "Springfield",
      slug: "springfield",
      regionCode: "US-MO",
      stateOrRegion: "Missouri",
   },

   /* Montana */

   {
      id: "municipality-billings-billings",
      metroRegionId: "metro-billings",
      name: "Billings",
      slug: "billings",
      regionCode: "US-MT",
      stateOrRegion: "Montana",
   },

   {
      id: "municipality-bozeman-bozeman",
      metroRegionId: "metro-bozeman",
      name: "Bozeman",
      slug: "bozeman",
      regionCode: "US-MT",
      stateOrRegion: "Montana",
   },

   {
      id: "municipality-missoula-missoula",
      metroRegionId: "metro-missoula",
      name: "Missoula",
      slug: "missoula",
      regionCode: "US-MT",
      stateOrRegion: "Montana",
   },

   /* Nebraska */

   {
      id: "municipality-lincoln-nebraska-lincoln",
      metroRegionId: "metro-lincoln-nebraska",
      name: "Lincoln",
      slug: "lincoln",
      regionCode: "US-NE",
      stateOrRegion: "Nebraska",
   },

   {
      id: "municipality-omaha-omaha",
      metroRegionId: "metro-omaha",
      name: "Omaha",
      slug: "omaha",
      regionCode: "US-NE",
      stateOrRegion: "Nebraska",
   },

   /* Nevada */

   {
      id: "municipality-carson-city-carson-city",
      metroRegionId: "metro-carson-city",
      name: "Carson City",
      slug: "carson-city",
      regionCode: "US-NV",
      stateOrRegion: "Nevada",
   },

   {
      id: "municipality-reno-reno",
      metroRegionId: "metro-reno",
      name: "Reno",
      slug: "reno",
      regionCode: "US-NV",
      stateOrRegion: "Nevada",
   },

   /* New Hampshire */

   {
      id: "municipality-manchester-new-hampshire-manchester",
      metroRegionId: "metro-manchester-new-hampshire",
      name: "Manchester",
      slug: "manchester",
      regionCode: "US-NH",
      stateOrRegion: "New Hampshire",
   },

   {
      id: "municipality-portsmouth-new-hampshire-portsmouth",
      metroRegionId: "metro-portsmouth-new-hampshire",
      name: "Portsmouth",
      slug: "portsmouth",
      regionCode: "US-NH",
      stateOrRegion: "New Hampshire",
   },

   /* New Jersey */

   {
      id: "municipality-asbury-park-asbury-park",
      metroRegionId: "metro-asbury-park",
      name: "Asbury Park",
      slug: "asbury-park",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },

   {
      id: "municipality-atlantic-city-atlantic-city",
      metroRegionId: "metro-atlantic-city",
      name: "Atlantic City",
      slug: "atlantic-city",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },

   {
      id: "municipality-princeton-princeton",
      metroRegionId: "metro-princeton",
      name: "Princeton",
      slug: "princeton",
      regionCode: "US-NJ",
      stateOrRegion: "New Jersey",
   },

   /* New Mexico */

   {
      id: "municipality-albuquerque-albuquerque",
      metroRegionId: "metro-albuquerque",
      name: "Albuquerque",
      slug: "albuquerque",
      regionCode: "US-NM",
      stateOrRegion: "New Mexico",
   },

   {
      id: "municipality-las-cruces-las-cruces",
      metroRegionId: "metro-las-cruces",
      name: "Las Cruces",
      slug: "las-cruces",
      regionCode: "US-NM",
      stateOrRegion: "New Mexico",
   },

   {
      id: "municipality-santa-fe-santa-fe",
      metroRegionId: "metro-santa-fe",
      name: "Santa Fe",
      slug: "santa-fe",
      regionCode: "US-NM",
      stateOrRegion: "New Mexico",
   },

   /* New York */

   {
      id: "municipality-albany-new-york-albany",
      metroRegionId: "metro-albany-new-york",
      name: "Albany",
      slug: "albany",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },

   {
      id: "municipality-ithaca-ithaca",
      metroRegionId: "metro-ithaca",
      name: "Ithaca",
      slug: "ithaca",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },

   {
      id: "municipality-rochester-new-york-rochester",
      metroRegionId: "metro-rochester-new-york",
      name: "Rochester",
      slug: "rochester",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },

   {
      id: "municipality-syracuse-syracuse",
      metroRegionId: "metro-syracuse",
      name: "Syracuse",
      slug: "syracuse",
      regionCode: "US-NY",
      stateOrRegion: "New York",
   },

   /* North Carolina */

   {
      id: "municipality-asheville-asheville",
      metroRegionId: "metro-asheville",
      name: "Asheville",
      slug: "asheville",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },

   {
      id: "municipality-greensboro-greensboro",
      metroRegionId: "metro-greensboro",
      name: "Greensboro",
      slug: "greensboro",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },

   {
      id: "municipality-wilmington-north-carolina-wilmington",
      metroRegionId: "metro-wilmington-north-carolina",
      name: "Wilmington",
      slug: "wilmington",
      regionCode: "US-NC",
      stateOrRegion: "North Carolina",
   },

   /* North Dakota */

   {
      id: "municipality-bismarck-bismarck",
      metroRegionId: "metro-bismarck",
      name: "Bismarck",
      slug: "bismarck",
      regionCode: "US-ND",
      stateOrRegion: "North Dakota",
   },

   {
      id: "municipality-fargo-fargo",
      metroRegionId: "metro-fargo",
      name: "Fargo",
      slug: "fargo",
      regionCode: "US-ND",
      stateOrRegion: "North Dakota",
   },

   /* Ohio */

   {
      id: "municipality-akron-akron",
      metroRegionId: "metro-akron",
      name: "Akron",
      slug: "akron",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },

   {
      id: "municipality-dayton-dayton",
      metroRegionId: "metro-dayton",
      name: "Dayton",
      slug: "dayton",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },

   {
      id: "municipality-toledo-toledo",
      metroRegionId: "metro-toledo",
      name: "Toledo",
      slug: "toledo",
      regionCode: "US-OH",
      stateOrRegion: "Ohio",
   },

   /* Oklahoma */

   {
      id: "municipality-norman-norman",
      metroRegionId: "metro-norman",
      name: "Norman",
      slug: "norman",
      regionCode: "US-OK",
      stateOrRegion: "Oklahoma",
   },

   {
      id: "municipality-tulsa-tulsa",
      metroRegionId: "metro-tulsa",
      name: "Tulsa",
      slug: "tulsa",
      regionCode: "US-OK",
      stateOrRegion: "Oklahoma",
   },

   /* Oregon */

   {
      id: "municipality-bend-bend",
      metroRegionId: "metro-bend",
      name: "Bend",
      slug: "bend",
      regionCode: "US-OR",
      stateOrRegion: "Oregon",
   },

   {
      id: "municipality-eugene-eugene",
      metroRegionId: "metro-eugene",
      name: "Eugene",
      slug: "eugene",
      regionCode: "US-OR",
      stateOrRegion: "Oregon",
   },

   {
      id: "municipality-salem-oregon-salem",
      metroRegionId: "metro-salem-oregon",
      name: "Salem",
      slug: "salem",
      regionCode: "US-OR",
      stateOrRegion: "Oregon",
   },

   /* Pennsylvania */

   {
      id: "municipality-allentown-pennsylvania-allentown",
      metroRegionId: "metro-allentown-pennsylvania",
      name: "Allentown",
      slug: "allentown",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },

   {
      id: "municipality-harrisburg-harrisburg",
      metroRegionId: "metro-harrisburg",
      name: "Harrisburg",
      slug: "harrisburg",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },

   {
      id: "municipality-lancaster-pennsylvania-lancaster",
      metroRegionId: "metro-lancaster-pennsylvania",
      name: "Lancaster",
      slug: "lancaster",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },

   {
      id: "municipality-state-college-state-college",
      metroRegionId: "metro-state-college",
      name: "State College",
      slug: "state-college",
      regionCode: "US-PA",
      stateOrRegion: "Pennsylvania",
   },

   /* Rhode Island */

   {
      id: "municipality-newport-rhode-island-newport",
      metroRegionId: "metro-newport-rhode-island",
      name: "Newport",
      slug: "newport",
      regionCode: "US-RI",
      stateOrRegion: "Rhode Island",
   },

   {
      id: "municipality-providence-providence",
      metroRegionId: "metro-providence",
      name: "Providence",
      slug: "providence",
      regionCode: "US-RI",
      stateOrRegion: "Rhode Island",
   },

   /* South Carolina */

   {
      id: "municipality-charleston-south-carolina-charleston",
      metroRegionId: "metro-charleston-south-carolina",
      name: "Charleston",
      slug: "charleston",
      regionCode: "US-SC",
      stateOrRegion: "South Carolina",
   },

   {
      id: "municipality-columbia-south-carolina-columbia",
      metroRegionId: "metro-columbia-south-carolina",
      name: "Columbia",
      slug: "columbia",
      regionCode: "US-SC",
      stateOrRegion: "South Carolina",
   },

   {
      id: "municipality-greenville-south-carolina-greenville",
      metroRegionId: "metro-greenville-south-carolina",
      name: "Greenville",
      slug: "greenville",
      regionCode: "US-SC",
      stateOrRegion: "South Carolina",
   },

   /* South Dakota */

   {
      id: "municipality-rapid-city-rapid-city",
      metroRegionId: "metro-rapid-city",
      name: "Rapid City",
      slug: "rapid-city",
      regionCode: "US-SD",
      stateOrRegion: "South Dakota",
   },

   {
      id: "municipality-sioux-falls-sioux-falls",
      metroRegionId: "metro-sioux-falls",
      name: "Sioux Falls",
      slug: "sioux-falls",
      regionCode: "US-SD",
      stateOrRegion: "South Dakota",
   },

   /* Tennessee */

   {
      id: "municipality-chattanooga-chattanooga",
      metroRegionId: "metro-chattanooga",
      name: "Chattanooga",
      slug: "chattanooga",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },

   {
      id: "municipality-knoxville-knoxville",
      metroRegionId: "metro-knoxville",
      name: "Knoxville",
      slug: "knoxville",
      regionCode: "US-TN",
      stateOrRegion: "Tennessee",
   },

   /* Texas */

   {
      id: "municipality-amarillo-amarillo",
      metroRegionId: "metro-amarillo",
      name: "Amarillo",
      slug: "amarillo",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   {
      id: "municipality-corpus-christi-corpus-christi",
      metroRegionId: "metro-corpus-christi",
      name: "Corpus Christi",
      slug: "corpus-christi",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   {
      id: "municipality-el-paso-el-paso",
      metroRegionId: "metro-el-paso",
      name: "El Paso",
      slug: "el-paso",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   {
      id: "municipality-lubbock-lubbock",
      metroRegionId: "metro-lubbock",
      name: "Lubbock",
      slug: "lubbock",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   {
      id: "municipality-mcallen-mcallen",
      metroRegionId: "metro-mcallen",
      name: "McAllen",
      slug: "mcallen",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   {
      id: "municipality-waco-waco",
      metroRegionId: "metro-waco",
      name: "Waco",
      slug: "waco",
      regionCode: "US-TX",
      stateOrRegion: "Texas",
   },

   /* Utah */

   {
      id: "municipality-park-city-park-city",
      metroRegionId: "metro-park-city",
      name: "Park City",
      slug: "park-city",
      regionCode: "US-UT",
      stateOrRegion: "Utah",
   },

   {
      id: "municipality-provo-provo",
      metroRegionId: "metro-provo",
      name: "Provo",
      slug: "provo",
      regionCode: "US-UT",
      stateOrRegion: "Utah",
   },

   {
      id: "municipality-st-george-st-george",
      metroRegionId: "metro-st-george",
      name: "St. George",
      slug: "st-george",
      regionCode: "US-UT",
      stateOrRegion: "Utah",
   },

   /* Vermont */

   {
      id: "municipality-burlington-vermont-burlington",
      metroRegionId: "metro-burlington-vermont",
      name: "Burlington",
      slug: "burlington",
      regionCode: "US-VT",
      stateOrRegion: "Vermont",
   },

   {
      id: "municipality-montpelier-montpelier",
      metroRegionId: "metro-montpelier",
      name: "Montpelier",
      slug: "montpelier",
      regionCode: "US-VT",
      stateOrRegion: "Vermont",
   },

   /* Virginia */

   {
      id: "municipality-charlottesville-charlottesville",
      metroRegionId: "metro-charlottesville",
      name: "Charlottesville",
      slug: "charlottesville",
      regionCode: "US-VA",
      stateOrRegion: "Virginia",
   },

   {
      id: "municipality-richmond-virginia-richmond",
      metroRegionId: "metro-richmond-virginia",
      name: "Richmond",
      slug: "richmond",
      regionCode: "US-VA",
      stateOrRegion: "Virginia",
   },

   {
      id: "municipality-virginia-beach-virginia-beach",
      metroRegionId: "metro-virginia-beach",
      name: "Virginia Beach",
      slug: "virginia-beach",
      regionCode: "US-VA",
      stateOrRegion: "Virginia",
   },

   /* Washington */

   {
      id: "municipality-bellingham-bellingham",
      metroRegionId: "metro-bellingham",
      name: "Bellingham",
      slug: "bellingham",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },

   {
      id: "municipality-olympia-olympia",
      metroRegionId: "metro-olympia",
      name: "Olympia",
      slug: "olympia",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },

   {
      id: "municipality-spokane-spokane",
      metroRegionId: "metro-spokane",
      name: "Spokane",
      slug: "spokane",
      regionCode: "US-WA",
      stateOrRegion: "Washington",
   },

   /* West Virginia */

   {
      id: "municipality-charleston-west-virginia-charleston",
      metroRegionId: "metro-charleston-west-virginia",
      name: "Charleston",
      slug: "charleston",
      regionCode: "US-WV",
      stateOrRegion: "West Virginia",
   },

   {
      id: "municipality-morgantown-morgantown",
      metroRegionId: "metro-morgantown",
      name: "Morgantown",
      slug: "morgantown",
      regionCode: "US-WV",
      stateOrRegion: "West Virginia",
   },

   /* Wisconsin */

   {
      id: "municipality-eau-claire-eau-claire",
      metroRegionId: "metro-eau-claire",
      name: "Eau Claire",
      slug: "eau-claire",
      regionCode: "US-WI",
      stateOrRegion: "Wisconsin",
   },

   {
      id: "municipality-madison-wisconsin-madison",
      metroRegionId: "metro-madison-wisconsin",
      name: "Madison",
      slug: "madison",
      regionCode: "US-WI",
      stateOrRegion: "Wisconsin",
   },

   /* Wyoming */

   {
      id: "municipality-cheyenne-cheyenne",
      metroRegionId: "metro-cheyenne",
      name: "Cheyenne",
      slug: "cheyenne",
      regionCode: "US-WY",
      stateOrRegion: "Wyoming",
   },

   {
      id: "municipality-jackson-wyoming-jackson",
      metroRegionId: "metro-jackson-wyoming",
      name: "Jackson",
      slug: "jackson",
      regionCode: "US-WY",
      stateOrRegion: "Wyoming",
   },

   /* E1D — Canada */
   { id: "municipality-toronto-toronto", metroRegionId: "metro-toronto", name: "Toronto", slug: "toronto", regionCode: "CA-ON", stateOrRegion: "Ontario" },
   { id: "municipality-vancouver-canada-vancouver", metroRegionId: "metro-vancouver-canada", name: "Vancouver", slug: "vancouver", regionCode: "CA-BC", stateOrRegion: "British Columbia" },
   { id: "municipality-montreal-montreal", metroRegionId: "metro-montreal", name: "Montreal", slug: "montreal", regionCode: "CA-QC", stateOrRegion: "Quebec" },

   /* E1D — United Kingdom */
   { id: "municipality-london-london", metroRegionId: "metro-london", name: "London", slug: "london", regionCode: "GB-ENG", stateOrRegion: "England" },
   { id: "municipality-edinburgh-edinburgh", metroRegionId: "metro-edinburgh", name: "Edinburgh", slug: "edinburgh", regionCode: "GB-SCT", stateOrRegion: "Scotland" },

   /* E1D — Mexico */
   { id: "municipality-mexico-city-mexico-city", metroRegionId: "metro-mexico-city", name: "Mexico City", slug: "mexico-city", regionCode: "MX-CMX", stateOrRegion: "Mexico City" },
   { id: "municipality-guadalajara-mexico-guadalajara", metroRegionId: "metro-guadalajara-mexico", name: "Guadalajara", slug: "guadalajara", regionCode: "MX-JAL", stateOrRegion: "Jalisco" },

   /* E1D — Japan */
   { id: "municipality-tokyo-shibuya", metroRegionId: "metro-tokyo", name: "Shibuya", slug: "shibuya", regionCode: "JP-13", stateOrRegion: "Tokyo" },
   { id: "municipality-tokyo-shinjuku", metroRegionId: "metro-tokyo", name: "Shinjuku", slug: "shinjuku", regionCode: "JP-13", stateOrRegion: "Tokyo" },
   { id: "municipality-tokyo-taito", metroRegionId: "metro-tokyo", name: "Taito", slug: "taito", regionCode: "JP-13", stateOrRegion: "Tokyo" },
   { id: "municipality-tokyo-chuo", metroRegionId: "metro-tokyo", name: "Chuo", slug: "chuo", regionCode: "JP-13", stateOrRegion: "Tokyo" },
   { id: "municipality-tokyo-setagaya", metroRegionId: "metro-tokyo", name: "Setagaya", slug: "setagaya", regionCode: "JP-13", stateOrRegion: "Tokyo" },
   { id: "municipality-yokohama-yokohama", metroRegionId: "metro-yokohama", name: "Yokohama", slug: "yokohama", regionCode: "JP-14", stateOrRegion: "Kanagawa" },
   { id: "municipality-yokosuka-yokosuka", metroRegionId: "metro-yokosuka", name: "Yokosuka", slug: "yokosuka", regionCode: "JP-14", stateOrRegion: "Kanagawa" },
   { id: "municipality-shonan-zushi", metroRegionId: "metro-shonan-coast", name: "Zushi", slug: "zushi", regionCode: "JP-14", stateOrRegion: "Kanagawa" },
   { id: "municipality-shonan-fujisawa", metroRegionId: "metro-shonan-coast", name: "Fujisawa", slug: "fujisawa", regionCode: "JP-14", stateOrRegion: "Kanagawa" },
   { id: "municipality-kyoto-kyoto", metroRegionId: "metro-kyoto", name: "Kyoto", slug: "kyoto", regionCode: "JP-26", stateOrRegion: "Kyoto" },
   { id: "municipality-osaka-osaka", metroRegionId: "metro-osaka", name: "Osaka", slug: "osaka", regionCode: "JP-27", stateOrRegion: "Osaka" },

   /* E1D — Australia */
   { id: "municipality-sydney-sydney", metroRegionId: "metro-sydney", name: "Sydney", slug: "sydney", regionCode: "AU-NSW", stateOrRegion: "New South Wales" },
   { id: "municipality-melbourne-australia-melbourne", metroRegionId: "metro-melbourne-australia", name: "Melbourne", slug: "melbourne", regionCode: "AU-VIC", stateOrRegion: "Victoria" },


] satisfies readonly Municipality[];
