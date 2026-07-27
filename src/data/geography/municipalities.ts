import type { Municipality } from "@/types/geography";

/**
 * Curated launch municipalities for Sidewalk's initial metro catalog.
 *
 * This is intentionally selective rather than exhaustive. Each metro includes
 * enough major municipalities to prove real geographic filtering while
 * preserving Sidewalk's editorial focus.
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
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-chula-vista",
      metroRegionId: "metro-san-diego",
      name: "Chula Vista",
      slug: "chula-vista",
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-encinitas",
      metroRegionId: "metro-san-diego",
      name: "Encinitas",
      slug: "encinitas",
      stateOrRegion: "California",
   },
   {
      id: "municipality-san-diego-national-city",
      metroRegionId: "metro-san-diego",
      name: "National City",
      slug: "national-city",
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
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-costa-mesa",
      metroRegionId: "metro-orange-county",
      name: "Costa Mesa",
      slug: "costa-mesa",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-santa-ana",
      metroRegionId: "metro-orange-county",
      name: "Santa Ana",
      slug: "santa-ana",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-anaheim",
      metroRegionId: "metro-orange-county",
      name: "Anaheim",
      slug: "anaheim",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-fullerton",
      metroRegionId: "metro-orange-county",
      name: "Fullerton",
      slug: "fullerton",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-newport-beach",
      metroRegionId: "metro-orange-county",
      name: "Newport Beach",
      slug: "newport-beach",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-huntington-beach",
      metroRegionId: "metro-orange-county",
      name: "Huntington Beach",
      slug: "huntington-beach",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-orange",
      metroRegionId: "metro-orange-county",
      name: "Orange",
      slug: "orange",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-westminster",
      metroRegionId: "metro-orange-county",
      name: "Westminster",
      slug: "westminster",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-garden-grove",
      metroRegionId: "metro-orange-county",
      name: "Garden Grove",
      slug: "garden-grove",
      stateOrRegion: "California",
   },
   {
      id: "municipality-orange-county-laguna-beach",
      metroRegionId: "metro-orange-county",
      name: "Laguna Beach",
      slug: "laguna-beach",
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
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-santa-monica",
      metroRegionId: "metro-los-angeles",
      name: "Santa Monica",
      slug: "santa-monica",
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-pasadena",
      metroRegionId: "metro-los-angeles",
      name: "Pasadena",
      slug: "pasadena",
      stateOrRegion: "California",
   },
   {
      id: "municipality-los-angeles-long-beach",
      metroRegionId: "metro-los-angeles",
      name: "Long Beach",
      slug: "long-beach",
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
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-oakland",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "Oakland",
      slug: "oakland",
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-berkeley",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "Berkeley",
      slug: "berkeley",
      stateOrRegion: "California",
   },
   {
      id: "municipality-bay-area-san-jose",
      metroRegionId: "metro-san-francisco-bay-area",
      name: "San Jose",
      slug: "san-jose",
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
      stateOrRegion: "Washington",
   },
   {
      id: "municipality-seattle-bellevue",
      metroRegionId: "metro-seattle",
      name: "Bellevue",
      slug: "bellevue",
      stateOrRegion: "Washington",
   },
   {
      id: "municipality-seattle-tacoma",
      metroRegionId: "metro-seattle",
      name: "Tacoma",
      slug: "tacoma",
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
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-scottsdale",
      metroRegionId: "metro-phoenix",
      name: "Scottsdale",
      slug: "scottsdale",
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-tempe",
      metroRegionId: "metro-phoenix",
      name: "Tempe",
      slug: "tempe",
      stateOrRegion: "Arizona",
   },
   {
      id: "municipality-phoenix-mesa",
      metroRegionId: "metro-phoenix",
      name: "Mesa",
      slug: "mesa",
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
      stateOrRegion: "Nevada",
   },
   {
      id: "municipality-las-vegas-henderson",
      metroRegionId: "metro-las-vegas",
      name: "Henderson",
      slug: "henderson",
      stateOrRegion: "Nevada",
   },
   {
      id: "municipality-las-vegas-north-las-vegas",
      metroRegionId: "metro-las-vegas",
      name: "North Las Vegas",
      slug: "north-las-vegas",
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
      stateOrRegion: "Oregon",
   },
   {
      id: "municipality-portland-beaverton",
      metroRegionId: "metro-portland",
      name: "Beaverton",
      slug: "beaverton",
      stateOrRegion: "Oregon",
   },
   {
      id: "municipality-portland-vancouver",
      metroRegionId: "metro-portland",
      name: "Vancouver",
      slug: "vancouver",
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
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-aurora",
      metroRegionId: "metro-denver",
      name: "Aurora",
      slug: "aurora",
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-boulder",
      metroRegionId: "metro-denver",
      name: "Boulder",
      slug: "boulder",
      stateOrRegion: "Colorado",
   },
   {
      id: "municipality-denver-golden",
      metroRegionId: "metro-denver",
      name: "Golden",
      slug: "golden",
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
      stateOrRegion: "Illinois",
   },
   {
      id: "municipality-chicago-evanston",
      metroRegionId: "metro-chicago",
      name: "Evanston",
      slug: "evanston",
      stateOrRegion: "Illinois",
   },
   {
      id: "municipality-chicago-oak-park",
      metroRegionId: "metro-chicago",
      name: "Oak Park",
      slug: "oak-park",
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
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-fort-worth",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Fort Worth",
      slug: "fort-worth",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-arlington",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Arlington",
      slug: "arlington",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-dfw-plano",
      metroRegionId: "metro-dallas-fort-worth",
      name: "Plano",
      slug: "plano",
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
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-austin-round-rock",
      metroRegionId: "metro-austin",
      name: "Round Rock",
      slug: "round-rock",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-austin-georgetown",
      metroRegionId: "metro-austin",
      name: "Georgetown",
      slug: "georgetown",
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
      stateOrRegion: "New York",
   },
   {
      id: "municipality-new-york-jersey-city",
      metroRegionId: "metro-new-york",
      name: "Jersey City",
      slug: "jersey-city",
      stateOrRegion: "New Jersey",
   },
   {
      id: "municipality-new-york-newark",
      metroRegionId: "metro-new-york",
      name: "Newark",
      slug: "newark",
      stateOrRegion: "New Jersey",
   },
   {
      id: "municipality-new-york-yonkers",
      metroRegionId: "metro-new-york",
      name: "Yonkers",
      slug: "yonkers",
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
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-cambridge",
      metroRegionId: "metro-boston",
      name: "Cambridge",
      slug: "cambridge",
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-somerville",
      metroRegionId: "metro-boston",
      name: "Somerville",
      slug: "somerville",
      stateOrRegion: "Massachusetts",
   },
   {
      id: "municipality-boston-brookline",
      metroRegionId: "metro-boston",
      name: "Brookline",
      slug: "brookline",
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
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-philadelphia-media",
      metroRegionId: "metro-philadelphia",
      name: "Media",
      slug: "media",
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-philadelphia-collingswood",
      metroRegionId: "metro-philadelphia",
      name: "Collingswood",
      slug: "collingswood",
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
      stateOrRegion: "District of Columbia",
   },
   {
      id: "municipality-dc-alexandria",
      metroRegionId: "metro-washington-dc",
      name: "Alexandria",
      slug: "alexandria",
      stateOrRegion: "Virginia",
   },
   {
      id: "municipality-dc-arlington",
      metroRegionId: "metro-washington-dc",
      name: "Arlington",
      slug: "arlington",
      stateOrRegion: "Virginia",
   },
   {
      id: "municipality-dc-bethesda",
      metroRegionId: "metro-washington-dc",
      name: "Bethesda",
      slug: "bethesda",
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
      stateOrRegion: "Georgia",
   },
   {
      id: "municipality-atlanta-decatur",
      metroRegionId: "metro-atlanta",
      name: "Decatur",
      slug: "decatur",
      stateOrRegion: "Georgia",
   },
   {
      id: "municipality-atlanta-marietta",
      metroRegionId: "metro-atlanta",
      name: "Marietta",
      slug: "marietta",
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
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-sugar-land",
      metroRegionId: "metro-houston",
      name: "Sugar Land",
      slug: "sugar-land",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-the-woodlands",
      metroRegionId: "metro-houston",
      name: "The Woodlands",
      slug: "the-woodlands",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-houston-galveston",
      metroRegionId: "metro-houston",
      name: "Galveston",
      slug: "galveston",
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
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-miami-beach",
      metroRegionId: "metro-miami",
      name: "Miami Beach",
      slug: "miami-beach",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-coral-gables",
      metroRegionId: "metro-miami",
      name: "Coral Gables",
      slug: "coral-gables",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-miami-fort-lauderdale",
      metroRegionId: "metro-miami",
      name: "Fort Lauderdale",
      slug: "fort-lauderdale",
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
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-winter-park",
      metroRegionId: "metro-orlando",
      name: "Winter Park",
      slug: "winter-park",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-kissimmee",
      metroRegionId: "metro-orlando",
      name: "Kissimmee",
      slug: "kissimmee",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-orlando-sanford",
      metroRegionId: "metro-orlando",
      name: "Sanford",
      slug: "sanford",
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
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-franklin",
      metroRegionId: "metro-nashville",
      name: "Franklin",
      slug: "franklin",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-murfreesboro",
      metroRegionId: "metro-nashville",
      name: "Murfreesboro",
      slug: "murfreesboro",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-nashville-hendersonville",
      metroRegionId: "metro-nashville",
      name: "Hendersonville",
      slug: "hendersonville",
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
      stateOrRegion: "Maryland",
   },
   {
      id: "municipality-buffalo-buffalo",
      metroRegionId: "metro-buffalo",
      name: "Buffalo",
      slug: "buffalo",
      stateOrRegion: "New York",
   },
   {
      id: "municipality-charlotte-charlotte",
      metroRegionId: "metro-charlotte",
      name: "Charlotte",
      slug: "charlotte",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-cincinnati-cincinnati",
      metroRegionId: "metro-cincinnati",
      name: "Cincinnati",
      slug: "cincinnati",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-cincinnati-covington",
      metroRegionId: "metro-cincinnati",
      name: "Covington",
      slug: "covington",
      stateOrRegion: "Kentucky",
   },
   {
      id: "municipality-cleveland-cleveland",
      metroRegionId: "metro-cleveland",
      name: "Cleveland",
      slug: "cleveland",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-columbus-columbus",
      metroRegionId: "metro-columbus",
      name: "Columbus",
      slug: "columbus",
      stateOrRegion: "Ohio",
   },
   {
      id: "municipality-detroit-detroit",
      metroRegionId: "metro-detroit",
      name: "Detroit",
      slug: "detroit",
      stateOrRegion: "Michigan",
   },
   {
      id: "municipality-green-bay-green-bay",
      metroRegionId: "metro-green-bay",
      name: "Green Bay",
      slug: "green-bay",
      stateOrRegion: "Wisconsin",
   },
   {
      id: "municipality-indianapolis-indianapolis",
      metroRegionId: "metro-indianapolis",
      name: "Indianapolis",
      slug: "indianapolis",
      stateOrRegion: "Indiana",
   },
   {
      id: "municipality-jacksonville-jacksonville",
      metroRegionId: "metro-jacksonville",
      name: "Jacksonville",
      slug: "jacksonville",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-jacksonville-jacksonville-beach",
      metroRegionId: "metro-jacksonville",
      name: "Jacksonville Beach",
      slug: "jacksonville-beach",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-kansas-city-kansas-city",
      metroRegionId: "metro-kansas-city",
      name: "Kansas City",
      slug: "kansas-city",
      stateOrRegion: "Missouri",
   },
   {
      id: "municipality-kansas-city-overland-park",
      metroRegionId: "metro-kansas-city",
      name: "Overland Park",
      slug: "overland-park",
      stateOrRegion: "Kansas",
   },
   {
      id: "municipality-memphis-memphis",
      metroRegionId: "metro-memphis",
      name: "Memphis",
      slug: "memphis",
      stateOrRegion: "Tennessee",
   },
   {
      id: "municipality-milwaukee-milwaukee",
      metroRegionId: "metro-milwaukee",
      name: "Milwaukee",
      slug: "milwaukee",
      stateOrRegion: "Wisconsin",
   },
   {
      id: "municipality-twin-cities-minneapolis",
      metroRegionId: "metro-minneapolis-saint-paul",
      name: "Minneapolis",
      slug: "minneapolis",
      stateOrRegion: "Minnesota",
   },
   {
      id: "municipality-twin-cities-saint-paul",
      metroRegionId: "metro-minneapolis-saint-paul",
      name: "Saint Paul",
      slug: "saint-paul",
      stateOrRegion: "Minnesota",
   },
   {
      id: "municipality-new-orleans-new-orleans",
      metroRegionId: "metro-new-orleans",
      name: "New Orleans",
      slug: "new-orleans",
      stateOrRegion: "Louisiana",
   },
   {
      id: "municipality-oklahoma-city-oklahoma-city",
      metroRegionId: "metro-oklahoma-city",
      name: "Oklahoma City",
      slug: "oklahoma-city",
      stateOrRegion: "Oklahoma",
   },
   {
      id: "municipality-pittsburgh-pittsburgh",
      metroRegionId: "metro-pittsburgh",
      name: "Pittsburgh",
      slug: "pittsburgh",
      stateOrRegion: "Pennsylvania",
   },
   {
      id: "municipality-raleigh-durham-raleigh",
      metroRegionId: "metro-raleigh-durham",
      name: "Raleigh",
      slug: "raleigh",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-raleigh-durham-durham",
      metroRegionId: "metro-raleigh-durham",
      name: "Durham",
      slug: "durham",
      stateOrRegion: "North Carolina",
   },
   {
      id: "municipality-sacramento-sacramento",
      metroRegionId: "metro-sacramento",
      name: "Sacramento",
      slug: "sacramento",
      stateOrRegion: "California",
   },
   {
      id: "municipality-salt-lake-city-salt-lake-city",
      metroRegionId: "metro-salt-lake-city",
      name: "Salt Lake City",
      slug: "salt-lake-city",
      stateOrRegion: "Utah",
   },
   {
      id: "municipality-san-antonio-san-antonio",
      metroRegionId: "metro-san-antonio",
      name: "San Antonio",
      slug: "san-antonio",
      stateOrRegion: "Texas",
   },
   {
      id: "municipality-st-louis-st-louis",
      metroRegionId: "metro-st-louis",
      name: "St. Louis",
      slug: "st-louis",
      stateOrRegion: "Missouri",
   },
   {
      id: "municipality-tampa-bay-tampa",
      metroRegionId: "metro-tampa-bay",
      name: "Tampa",
      slug: "tampa",
      stateOrRegion: "Florida",
   },
   {
      id: "municipality-tampa-bay-st-petersburg",
      metroRegionId: "metro-tampa-bay",
      name: "St. Petersburg",
      slug: "st-petersburg",
      stateOrRegion: "Florida",
   },
] satisfies readonly Municipality[];
