import type { LocalArea } from "@/types/geography";

/**
 * Curated neighborhoods, districts, downtowns, and local areas.
 *
 * These labels support editorial discovery rather than legal boundary
 * enforcement. Provider coordinates and future geographic validation will
 * determine whether an individual place belongs within an area.
 */
export const localAreas = [
   /* ------------------------------------------------------------------------ */
   /* San Diego                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-san-diego-downtown",
      municipalityId: "municipality-san-diego-san-diego",
      name: "Downtown",
      slug: "downtown",
      kind: "downtown",
   },
   {
      id: "area-san-diego-little-italy",
      municipalityId: "municipality-san-diego-san-diego",
      name: "Little Italy",
      slug: "little-italy",
      kind: "neighborhood",
   },
   {
      id: "area-san-diego-north-park",
      municipalityId: "municipality-san-diego-san-diego",
      name: "North Park",
      slug: "north-park",
      kind: "neighborhood",
   },
   {
      id: "area-san-diego-south-park",
      municipalityId: "municipality-san-diego-san-diego",
      name: "South Park",
      slug: "south-park",
      kind: "neighborhood",
   },
   {
      id: "area-san-diego-hillcrest",
      municipalityId: "municipality-san-diego-san-diego",
      name: "Hillcrest",
      slug: "hillcrest",
      kind: "neighborhood",
   },
   {
      id: "area-san-diego-kearny-mesa",
      municipalityId: "municipality-san-diego-san-diego",
      name: "Kearny Mesa",
      slug: "kearny-mesa",
      kind: "area",
   },
   {
      id: "area-san-diego-la-jolla",
      municipalityId: "municipality-san-diego-san-diego",
      name: "La Jolla",
      slug: "la-jolla",
      kind: "area",
   },
   {
      id: "area-san-diego-ocean-beach",
      municipalityId: "municipality-san-diego-san-diego",
      name: "Ocean Beach",
      slug: "ocean-beach",
      kind: "neighborhood",
   },
   {
      id: "area-chula-vista-downtown",
      municipalityId: "municipality-san-diego-chula-vista",
      name: "Downtown Chula Vista",
      slug: "downtown-chula-vista",
      kind: "downtown",
   },
   {
      id: "area-chula-vista-eastlake",
      municipalityId: "municipality-san-diego-chula-vista",
      name: "Eastlake",
      slug: "eastlake",
      kind: "area",
   },
   {
      id: "area-chula-vista-otay-ranch",
      municipalityId: "municipality-san-diego-chula-vista",
      name: "Otay Ranch",
      slug: "otay-ranch",
      kind: "area",
   },
   {
      id: "area-encinitas-downtown",
      municipalityId: "municipality-san-diego-encinitas",
      name: "Downtown Encinitas",
      slug: "downtown-encinitas",
      kind: "downtown",
   },
   {
      id: "area-encinitas-leucadia",
      municipalityId: "municipality-san-diego-encinitas",
      name: "Leucadia",
      slug: "leucadia",
      kind: "neighborhood",
   },
   {
      id: "area-encinitas-cardiff",
      municipalityId: "municipality-san-diego-encinitas",
      name: "Cardiff-by-the-Sea",
      slug: "cardiff-by-the-sea",
      kind: "area",
   },
   {
      id: "area-national-city-downtown",
      municipalityId: "municipality-san-diego-national-city",
      name: "Downtown National City",
      slug: "downtown-national-city",
      kind: "downtown",
   },
   {
      id: "area-national-city-highland-avenue",
      municipalityId: "municipality-san-diego-national-city",
      name: "Highland Avenue",
      slug: "highland-avenue",
      kind: "district",
   },
   {
      id: "area-national-city-westside",
      municipalityId: "municipality-san-diego-national-city",
      name: "Westside National City",
      slug: "westside-national-city",
      kind: "neighborhood",
   },
   {
      id: "area-national-city-national-city-boulevard",
      municipalityId: "municipality-san-diego-national-city",
      name: "National City Boulevard",
      slug: "national-city-boulevard",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Orange County                                                           */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-irvine-spectrum",
      municipalityId: "municipality-orange-county-irvine",
      name: "Irvine Spectrum",
      slug: "irvine-spectrum",
      kind: "district",
   },
   {
      id: "area-irvine-university-town-center",
      municipalityId: "municipality-orange-county-irvine",
      name: "University Town Center",
      slug: "university-town-center",
      kind: "district",
   },
   {
      id: "area-irvine-great-park",
      municipalityId: "municipality-orange-county-irvine",
      name: "Great Park",
      slug: "great-park",
      kind: "area",
   },
   {
      id: "area-irvine-woodbridge",
      municipalityId: "municipality-orange-county-irvine",
      name: "Woodbridge",
      slug: "woodbridge",
      kind: "neighborhood",
   },
   {
      id: "area-irvine-diamond-jamboree",
      municipalityId: "municipality-orange-county-irvine",
      name: "Diamond Jamboree",
      slug: "diamond-jamboree",
      kind: "district",
   },
   {
      id: "area-costa-mesa-south-coast-metro",
      municipalityId: "municipality-orange-county-costa-mesa",
      name: "South Coast Metro",
      slug: "south-coast-metro",
      kind: "district",
   },
   {
      id: "area-costa-mesa-eastside",
      municipalityId: "municipality-orange-county-costa-mesa",
      name: "Eastside Costa Mesa",
      slug: "eastside-costa-mesa",
      kind: "neighborhood",
   },
   {
      id: "area-costa-mesa-sobeca",
      municipalityId: "municipality-orange-county-costa-mesa",
      name: "SoBECA District",
      slug: "sobeca-district",
      kind: "district",
   },
   {
      id: "area-santa-ana-downtown",
      municipalityId: "municipality-orange-county-santa-ana",
      name: "Downtown Santa Ana",
      slug: "downtown-santa-ana",
      kind: "downtown",
   },
   {
      id: "area-santa-ana-calle-cuatro",
      municipalityId: "municipality-orange-county-santa-ana",
      name: "Calle Cuatro",
      slug: "calle-cuatro",
      kind: "district",
   },
   {
      id: "area-anaheim-packing-district",
      municipalityId: "municipality-orange-county-anaheim",
      name: "Anaheim Packing District",
      slug: "anaheim-packing-district",
      kind: "district",
   },
   {
      id: "area-anaheim-downtown",
      municipalityId: "municipality-orange-county-anaheim",
      name: "Downtown Anaheim",
      slug: "downtown-anaheim",
      kind: "downtown",
   },
   {
      id: "area-anaheim-resort",
      municipalityId: "municipality-orange-county-anaheim",
      name: "Anaheim Resort",
      slug: "anaheim-resort",
      kind: "district",
   },
   {
      id: "area-fullerton-downtown",
      municipalityId: "municipality-orange-county-fullerton",
      name: "Downtown Fullerton",
      slug: "downtown-fullerton",
      kind: "downtown",
   },
   {
      id: "area-newport-beach-balboa-peninsula",
      municipalityId: "municipality-orange-county-newport-beach",
      name: "Balboa Peninsula",
      slug: "balboa-peninsula",
      kind: "area",
   },
   {
      id: "area-newport-beach-balboa-island",
      municipalityId: "municipality-orange-county-newport-beach",
      name: "Balboa Island",
      slug: "balboa-island",
      kind: "area",
   },
   {
      id: "area-newport-beach-lido-marina-village",
      municipalityId: "municipality-orange-county-newport-beach",
      name: "Lido Marina Village",
      slug: "lido-marina-village",
      kind: "district",
   },
   {
      id: "area-newport-beach-corona-del-mar",
      municipalityId: "municipality-orange-county-newport-beach",
      name: "Corona del Mar",
      slug: "corona-del-mar",
      kind: "neighborhood",
   },
   {
      id: "area-huntington-beach-downtown",
      municipalityId: "municipality-orange-county-huntington-beach",
      name: "Downtown Huntington Beach",
      slug: "downtown-huntington-beach",
      kind: "downtown",
   },
   {
      id: "area-huntington-beach-sunset-beach",
      municipalityId: "municipality-orange-county-huntington-beach",
      name: "Sunset Beach",
      slug: "sunset-beach",
      kind: "neighborhood",
   },
   {
      id: "area-huntington-beach-pacific-city",
      municipalityId: "municipality-orange-county-huntington-beach",
      name: "Pacific City",
      slug: "pacific-city",
      kind: "district",
   },
   {
      id: "area-orange-old-towne",
      municipalityId: "municipality-orange-county-orange",
      name: "Old Towne Orange",
      slug: "old-towne-orange",
      kind: "district",
   },
   {
      id: "area-westminster-little-saigon",
      municipalityId: "municipality-orange-county-westminster",
      name: "Little Saigon",
      slug: "little-saigon",
      kind: "district",
   },
   {
      id: "area-garden-grove-historic-main-street",
      municipalityId: "municipality-orange-county-garden-grove",
      name: "Historic Main Street",
      slug: "historic-main-street",
      kind: "district",
   },
   {
      id: "area-garden-grove-little-saigon",
      municipalityId: "municipality-orange-county-garden-grove",
      name: "Garden Grove Little Saigon",
      slug: "garden-grove-little-saigon",
      kind: "district",
   },
   {
      id: "area-laguna-beach-downtown",
      municipalityId: "municipality-orange-county-laguna-beach",
      name: "Downtown Laguna Beach",
      slug: "downtown-laguna-beach",
      kind: "downtown",
   },
   {
      id: "area-laguna-beach-laguna-canyon",
      municipalityId: "municipality-orange-county-laguna-beach",
      name: "Laguna Canyon",
      slug: "laguna-canyon",
      kind: "area",
   },
   {
      id: "area-laguna-beach-north-laguna",
      municipalityId: "municipality-orange-county-laguna-beach",
      name: "North Laguna",
      slug: "north-laguna",
      kind: "neighborhood",
   },

   /* ------------------------------------------------------------------------ */
   /* Palm Springs                                                            */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-palm-springs-downtown",
      municipalityId: "municipality-palm-springs-palm-springs",
      name: "Downtown Palm Springs",
      slug: "downtown-palm-springs",
      kind: "downtown",
   },
   {
      id: "area-palm-springs-uptown-design-district",
      municipalityId: "municipality-palm-springs-palm-springs",
      name: "Uptown Design District",
      slug: "uptown-design-district",
      kind: "district",
   },
   {
      id: "area-palm-springs-south-palm-canyon",
      municipalityId: "municipality-palm-springs-palm-springs",
      name: "South Palm Canyon",
      slug: "south-palm-canyon",
      kind: "district",
   },
   {
      id: "area-palm-springs-indian-canyons",
      municipalityId: "municipality-palm-springs-palm-springs",
      name: "Indian Canyons",
      slug: "indian-canyons",
      kind: "area",
   },
   {
      id: "area-palm-desert-el-paseo",
      municipalityId: "municipality-palm-springs-palm-desert",
      name: "El Paseo",
      slug: "el-paseo",
      kind: "district",
   },
   {
      id: "area-palm-desert-san-pablo-avenue",
      municipalityId: "municipality-palm-springs-palm-desert",
      name: "San Pablo Avenue",
      slug: "san-pablo-avenue",
      kind: "district",
   },
   {
      id: "area-palm-desert-civic-center",
      municipalityId: "municipality-palm-springs-palm-desert",
      name: "Palm Desert Civic Center",
      slug: "palm-desert-civic-center",
      kind: "area",
   },
   {
      id: "area-rancho-mirage-the-river",
      municipalityId: "municipality-palm-springs-rancho-mirage",
      name: "The River at Rancho Mirage",
      slug: "the-river-at-rancho-mirage",
      kind: "district",
   },
   {
      id: "area-rancho-mirage-rancho-las-palmas",
      municipalityId: "municipality-palm-springs-rancho-mirage",
      name: "Rancho Las Palmas",
      slug: "rancho-las-palmas",
      kind: "area",
   },
   {
      id: "area-cathedral-city-downtown",
      municipalityId: "municipality-palm-springs-cathedral-city",
      name: "Downtown Cathedral City",
      slug: "downtown-cathedral-city",
      kind: "downtown",
   },
   {
      id: "area-cathedral-city-cathedral-canyon",
      municipalityId: "municipality-palm-springs-cathedral-city",
      name: "Cathedral Canyon",
      slug: "cathedral-canyon",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Los Angeles                                                             */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-los-angeles-downtown",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Downtown Los Angeles",
      slug: "downtown-los-angeles",
      kind: "downtown",
   },
   {
      id: "area-los-angeles-silver-lake",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Silver Lake",
      slug: "silver-lake",
      kind: "neighborhood",
   },
   {
      id: "area-los-angeles-echo-park",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Echo Park",
      slug: "echo-park",
      kind: "neighborhood",
   },
   {
      id: "area-los-angeles-koreatown",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Koreatown",
      slug: "koreatown",
      kind: "neighborhood",
   },
   {
      id: "area-los-angeles-los-feliz",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Los Feliz",
      slug: "los-feliz",
      kind: "neighborhood",
   },
   {
      id: "area-los-angeles-venice",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Venice",
      slug: "venice",
      kind: "neighborhood",
   },
   {
      id: "area-santa-monica-downtown",
      municipalityId: "municipality-los-angeles-santa-monica",
      name: "Downtown Santa Monica",
      slug: "downtown-santa-monica",
      kind: "downtown",
   },
   {
      id: "area-santa-monica-ocean-park",
      municipalityId: "municipality-los-angeles-santa-monica",
      name: "Ocean Park",
      slug: "ocean-park",
      kind: "neighborhood",
   },
   {
      id: "area-santa-monica-main-street",
      municipalityId: "municipality-los-angeles-santa-monica",
      name: "Main Street",
      slug: "main-street",
      kind: "district",
   },
   {
      id: "area-pasadena-old-pasadena",
      municipalityId: "municipality-los-angeles-pasadena",
      name: "Old Pasadena",
      slug: "old-pasadena",
      kind: "district",
   },
   {
      id: "area-pasadena-playhouse-village",
      municipalityId: "municipality-los-angeles-pasadena",
      name: "Playhouse Village",
      slug: "playhouse-village",
      kind: "district",
   },
   {
      id: "area-pasadena-south-lake",
      municipalityId: "municipality-los-angeles-pasadena",
      name: "South Lake",
      slug: "south-lake",
      kind: "district",
   },
   {
      id: "area-long-beach-downtown",
      municipalityId: "municipality-los-angeles-long-beach",
      name: "Downtown Long Beach",
      slug: "downtown-long-beach",
      kind: "downtown",
   },
   {
      id: "area-long-beach-belmont-shore",
      municipalityId: "municipality-los-angeles-long-beach",
      name: "Belmont Shore",
      slug: "belmont-shore",
      kind: "neighborhood",
   },
   {
      id: "area-long-beach-retro-row",
      municipalityId: "municipality-los-angeles-long-beach",
      name: "Retro Row",
      slug: "retro-row",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* San Francisco Bay Area                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-san-francisco-mission",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Mission District",
      slug: "mission-district",
      kind: "district",
   },
   {
      id: "area-san-francisco-north-beach",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "North Beach",
      slug: "north-beach",
      kind: "neighborhood",
   },
   {
      id: "area-san-francisco-hayes-valley",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Hayes Valley",
      slug: "hayes-valley",
      kind: "neighborhood",
   },
   {
      id: "area-san-francisco-inner-sunset",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Inner Sunset",
      slug: "inner-sunset",
      kind: "neighborhood",
   },
   {
      id: "area-san-francisco-richmond",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Richmond District",
      slug: "richmond-district",
      kind: "district",
   },
   {
      id: "area-oakland-temescal",
      municipalityId: "municipality-bay-area-oakland",
      name: "Temescal",
      slug: "temescal",
      kind: "neighborhood",
   },
   {
      id: "area-oakland-rockridge",
      municipalityId: "municipality-bay-area-oakland",
      name: "Rockridge",
      slug: "rockridge",
      kind: "neighborhood",
   },
   {
      id: "area-oakland-uptown",
      municipalityId: "municipality-bay-area-oakland",
      name: "Uptown",
      slug: "uptown",
      kind: "district",
   },
   {
      id: "area-oakland-jack-london-square",
      municipalityId: "municipality-bay-area-oakland",
      name: "Jack London Square",
      slug: "jack-london-square",
      kind: "district",
   },
   {
      id: "area-berkeley-downtown",
      municipalityId: "municipality-bay-area-berkeley",
      name: "Downtown Berkeley",
      slug: "downtown-berkeley",
      kind: "downtown",
   },
   {
      id: "area-berkeley-fourth-street",
      municipalityId: "municipality-bay-area-berkeley",
      name: "Fourth Street",
      slug: "fourth-street",
      kind: "district",
   },
   {
      id: "area-berkeley-north-shattuck",
      municipalityId: "municipality-bay-area-berkeley",
      name: "North Shattuck",
      slug: "north-shattuck",
      kind: "district",
   },
   {
      id: "area-san-jose-downtown",
      municipalityId: "municipality-bay-area-san-jose",
      name: "Downtown San Jose",
      slug: "downtown-san-jose",
      kind: "downtown",
   },
   {
      id: "area-san-jose-japantown",
      municipalityId: "municipality-bay-area-san-jose",
      name: "Japantown",
      slug: "japantown",
      kind: "neighborhood",
   },
   {
      id: "area-san-jose-willow-glen",
      municipalityId: "municipality-bay-area-san-jose",
      name: "Willow Glen",
      slug: "willow-glen",
      kind: "neighborhood",
   },
   {
      id: "area-san-jose-santana-row",
      municipalityId: "municipality-bay-area-san-jose",
      name: "Santana Row",
      slug: "santana-row",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Seattle                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-seattle-capitol-hill",
      municipalityId: "municipality-seattle-seattle",
      name: "Capitol Hill",
      slug: "capitol-hill",
      kind: "neighborhood",
   },
   {
      id: "area-seattle-ballard",
      municipalityId: "municipality-seattle-seattle",
      name: "Ballard",
      slug: "ballard",
      kind: "neighborhood",
   },
   {
      id: "area-seattle-fremont",
      municipalityId: "municipality-seattle-seattle",
      name: "Fremont",
      slug: "fremont",
      kind: "neighborhood",
   },
   {
      id: "area-seattle-pioneer-square",
      municipalityId: "municipality-seattle-seattle",
      name: "Pioneer Square",
      slug: "pioneer-square",
      kind: "district",
   },
   {
      id: "area-seattle-queen-anne",
      municipalityId: "municipality-seattle-seattle",
      name: "Queen Anne",
      slug: "queen-anne",
      kind: "neighborhood",
   },
   {
      id: "area-bellevue-downtown",
      municipalityId: "municipality-seattle-bellevue",
      name: "Downtown Bellevue",
      slug: "downtown-bellevue",
      kind: "downtown",
   },
   {
      id: "area-bellevue-old-bellevue",
      municipalityId: "municipality-seattle-bellevue",
      name: "Old Bellevue",
      slug: "old-bellevue",
      kind: "district",
   },
   {
      id: "area-bellevue-crossroads",
      municipalityId: "municipality-seattle-bellevue",
      name: "Crossroads",
      slug: "crossroads",
      kind: "area",
   },
   {
      id: "area-tacoma-downtown",
      municipalityId: "municipality-seattle-tacoma",
      name: "Downtown Tacoma",
      slug: "downtown-tacoma",
      kind: "downtown",
   },
   {
      id: "area-tacoma-stadium",
      municipalityId: "municipality-seattle-tacoma",
      name: "Stadium District",
      slug: "stadium-district",
      kind: "district",
   },
   {
      id: "area-tacoma-proctor",
      municipalityId: "municipality-seattle-tacoma",
      name: "Proctor District",
      slug: "proctor-district",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Phoenix                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-phoenix-downtown",
      municipalityId: "municipality-phoenix-phoenix",
      name: "Downtown Phoenix",
      slug: "downtown-phoenix",
      kind: "downtown",
   },
   {
      id: "area-phoenix-roosevelt-row",
      municipalityId: "municipality-phoenix-phoenix",
      name: "Roosevelt Row",
      slug: "roosevelt-row",
      kind: "district",
   },
   {
      id: "area-phoenix-arcadia",
      municipalityId: "municipality-phoenix-phoenix",
      name: "Arcadia",
      slug: "arcadia",
      kind: "area",
   },
   {
      id: "area-phoenix-melrose",
      municipalityId: "municipality-phoenix-phoenix",
      name: "Melrose District",
      slug: "melrose-district",
      kind: "district",
   },
   {
      id: "area-scottsdale-old-town",
      municipalityId: "municipality-phoenix-scottsdale",
      name: "Old Town Scottsdale",
      slug: "old-town-scottsdale",
      kind: "district",
   },
   {
      id: "area-scottsdale-south",
      municipalityId: "municipality-phoenix-scottsdale",
      name: "South Scottsdale",
      slug: "south-scottsdale",
      kind: "area",
   },
   {
      id: "area-scottsdale-mcdowell-sonoran",
      municipalityId: "municipality-phoenix-scottsdale",
      name: "McDowell Sonoran",
      slug: "mcdowell-sonoran",
      kind: "area",
   },
   {
      id: "area-tempe-downtown",
      municipalityId: "municipality-phoenix-tempe",
      name: "Downtown Tempe",
      slug: "downtown-tempe",
      kind: "downtown",
   },
   {
      id: "area-tempe-mill-avenue",
      municipalityId: "municipality-phoenix-tempe",
      name: "Mill Avenue",
      slug: "mill-avenue",
      kind: "district",
   },
   {
      id: "area-tempe-lakes",
      municipalityId: "municipality-phoenix-tempe",
      name: "Tempe Town Lake",
      slug: "tempe-town-lake",
      kind: "area",
   },
   {
      id: "area-mesa-downtown",
      municipalityId: "municipality-phoenix-mesa",
      name: "Downtown Mesa",
      slug: "downtown-mesa",
      kind: "downtown",
   },
   {
      id: "area-mesa-eastmark",
      municipalityId: "municipality-phoenix-mesa",
      name: "Eastmark",
      slug: "eastmark",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Las Vegas                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-las-vegas-downtown",
      municipalityId: "municipality-las-vegas-las-vegas",
      name: "Downtown Las Vegas",
      slug: "downtown-las-vegas",
      kind: "downtown",
   },
   {
      id: "area-las-vegas-arts-district",
      municipalityId: "municipality-las-vegas-las-vegas",
      name: "Arts District",
      slug: "arts-district",
      kind: "district",
   },
   {
      id: "area-las-vegas-fremont-east",
      municipalityId: "municipality-las-vegas-las-vegas",
      name: "Fremont East",
      slug: "fremont-east",
      kind: "district",
   },
   {
      id: "area-las-vegas-summerlin",
      municipalityId: "municipality-las-vegas-las-vegas",
      name: "Summerlin",
      slug: "summerlin",
      kind: "area",
   },
   {
      id: "area-henderson-water-street",
      municipalityId: "municipality-las-vegas-henderson",
      name: "Water Street District",
      slug: "water-street-district",
      kind: "district",
   },
   {
      id: "area-henderson-green-valley",
      municipalityId: "municipality-las-vegas-henderson",
      name: "Green Valley",
      slug: "green-valley",
      kind: "area",
   },
   {
      id: "area-henderson-lake-las-vegas",
      municipalityId: "municipality-las-vegas-henderson",
      name: "Lake Las Vegas",
      slug: "lake-las-vegas",
      kind: "area",
   },
   {
      id: "area-north-las-vegas-downtown",
      municipalityId: "municipality-las-vegas-north-las-vegas",
      name: "Downtown North Las Vegas",
      slug: "downtown-north-las-vegas",
      kind: "downtown",
   },
   {
      id: "area-north-las-vegas-aliante",
      municipalityId: "municipality-las-vegas-north-las-vegas",
      name: "Aliante",
      slug: "aliante",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Portland                                                                */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-portland-pearl",
      municipalityId: "municipality-portland-portland",
      name: "Pearl District",
      slug: "pearl-district",
      kind: "district",
   },
   {
      id: "area-portland-alberta",
      municipalityId: "municipality-portland-portland",
      name: "Alberta Arts District",
      slug: "alberta-arts-district",
      kind: "district",
   },
   {
      id: "area-portland-hawthorne",
      municipalityId: "municipality-portland-portland",
      name: "Hawthorne",
      slug: "hawthorne",
      kind: "area",
   },
   {
      id: "area-portland-mississippi",
      municipalityId: "municipality-portland-portland",
      name: "Mississippi",
      slug: "mississippi",
      kind: "area",
   },
   {
      id: "area-portland-sellwood",
      municipalityId: "municipality-portland-portland",
      name: "Sellwood-Moreland",
      slug: "sellwood-moreland",
      kind: "neighborhood",
   },
   {
      id: "area-beaverton-downtown",
      municipalityId: "municipality-portland-beaverton",
      name: "Downtown Beaverton",
      slug: "downtown-beaverton",
      kind: "downtown",
   },
   {
      id: "area-beaverton-cedar-hills",
      municipalityId: "municipality-portland-beaverton",
      name: "Cedar Hills",
      slug: "cedar-hills",
      kind: "area",
   },
   {
      id: "area-vancouver-downtown",
      municipalityId: "municipality-portland-vancouver",
      name: "Downtown Vancouver",
      slug: "downtown-vancouver",
      kind: "downtown",
   },
   {
      id: "area-vancouver-uptown",
      municipalityId: "municipality-portland-vancouver",
      name: "Uptown Village",
      slug: "uptown-village",
      kind: "district",
   },
   {
      id: "area-vancouver-waterfront",
      municipalityId: "municipality-portland-vancouver",
      name: "Vancouver Waterfront",
      slug: "vancouver-waterfront",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Denver                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-denver-lodo",
      municipalityId: "municipality-denver-denver",
      name: "LoDo",
      slug: "lodo",
      kind: "district",
   },
   {
      id: "area-denver-rino",
      municipalityId: "municipality-denver-denver",
      name: "RiNo",
      slug: "rino",
      kind: "district",
   },
   {
      id: "area-denver-capitol-hill",
      municipalityId: "municipality-denver-denver",
      name: "Capitol Hill",
      slug: "capitol-hill",
      kind: "neighborhood",
   },
   {
      id: "area-denver-cherry-creek",
      municipalityId: "municipality-denver-denver",
      name: "Cherry Creek",
      slug: "cherry-creek",
      kind: "neighborhood",
   },
   {
      id: "area-denver-highland",
      municipalityId: "municipality-denver-denver",
      name: "Highland",
      slug: "highland",
      kind: "neighborhood",
   },
   {
      id: "area-aurora-cultural-arts",
      municipalityId: "municipality-denver-aurora",
      name: "Aurora Cultural Arts District",
      slug: "aurora-cultural-arts-district",
      kind: "district",
   },
   {
      id: "area-aurora-havana-street",
      municipalityId: "municipality-denver-aurora",
      name: "Havana Street",
      slug: "havana-street",
      kind: "district",
   },
   {
      id: "area-aurora-southlands",
      municipalityId: "municipality-denver-aurora",
      name: "Southlands",
      slug: "southlands",
      kind: "area",
   },
   {
      id: "area-boulder-pearl-street",
      municipalityId: "municipality-denver-boulder",
      name: "Pearl Street",
      slug: "pearl-street",
      kind: "district",
   },
   {
      id: "area-boulder-university-hill",
      municipalityId: "municipality-denver-boulder",
      name: "University Hill",
      slug: "university-hill",
      kind: "district",
   },
   {
      id: "area-boulder-north-boulder",
      municipalityId: "municipality-denver-boulder",
      name: "North Boulder",
      slug: "north-boulder",
      kind: "area",
   },
   {
      id: "area-golden-downtown",
      municipalityId: "municipality-denver-golden",
      name: "Downtown Golden",
      slug: "downtown-golden",
      kind: "downtown",
   },
   {
      id: "area-golden-clear-creek",
      municipalityId: "municipality-denver-golden",
      name: "Clear Creek",
      slug: "clear-creek",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Chicago                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-chicago-wicker-park",
      municipalityId: "municipality-chicago-chicago",
      name: "Wicker Park",
      slug: "wicker-park",
      kind: "neighborhood",
   },
   {
      id: "area-chicago-logan-square",
      municipalityId: "municipality-chicago-chicago",
      name: "Logan Square",
      slug: "logan-square",
      kind: "neighborhood",
   },
   {
      id: "area-chicago-pilsen",
      municipalityId: "municipality-chicago-chicago",
      name: "Pilsen",
      slug: "pilsen",
      kind: "neighborhood",
   },
   {
      id: "area-chicago-hyde-park",
      municipalityId: "municipality-chicago-chicago",
      name: "Hyde Park",
      slug: "hyde-park",
      kind: "neighborhood",
   },
   {
      id: "area-chicago-west-loop",
      municipalityId: "municipality-chicago-chicago",
      name: "West Loop",
      slug: "west-loop",
      kind: "neighborhood",
   },
   {
      id: "area-chicago-andersonville",
      municipalityId: "municipality-chicago-chicago",
      name: "Andersonville",
      slug: "andersonville",
      kind: "neighborhood",
   },
   {
      id: "area-evanston-downtown",
      municipalityId: "municipality-chicago-evanston",
      name: "Downtown Evanston",
      slug: "downtown-evanston",
      kind: "downtown",
   },
   {
      id: "area-evanston-main-dempster",
      municipalityId: "municipality-chicago-evanston",
      name: "Main-Dempster",
      slug: "main-dempster",
      kind: "district",
   },
   {
      id: "area-oak-park-downtown",
      municipalityId: "municipality-chicago-oak-park",
      name: "Downtown Oak Park",
      slug: "downtown-oak-park",
      kind: "downtown",
   },
   {
      id: "area-oak-park-hemingway",
      municipalityId: "municipality-chicago-oak-park",
      name: "Hemingway District",
      slug: "hemingway-district",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Dallas–Fort Worth                                                       */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-dallas-bishop-arts",
      municipalityId: "municipality-dfw-dallas",
      name: "Bishop Arts District",
      slug: "bishop-arts-district",
      kind: "district",
   },
   {
      id: "area-dallas-deep-ellum",
      municipalityId: "municipality-dfw-dallas",
      name: "Deep Ellum",
      slug: "deep-ellum",
      kind: "neighborhood",
   },
   {
      id: "area-dallas-uptown",
      municipalityId: "municipality-dfw-dallas",
      name: "Uptown",
      slug: "uptown",
      kind: "neighborhood",
   },
   {
      id: "area-dallas-lower-greenville",
      municipalityId: "municipality-dfw-dallas",
      name: "Lower Greenville",
      slug: "lower-greenville",
      kind: "area",
   },
   {
      id: "area-dallas-design-district",
      municipalityId: "municipality-dfw-dallas",
      name: "Design District",
      slug: "design-district",
      kind: "district",
   },
   {
      id: "area-fort-worth-sundance-square",
      municipalityId: "municipality-dfw-fort-worth",
      name: "Sundance Square",
      slug: "sundance-square",
      kind: "district",
   },
   {
      id: "area-fort-worth-near-southside",
      municipalityId: "municipality-dfw-fort-worth",
      name: "Near Southside",
      slug: "near-southside",
      kind: "district",
   },
   {
      id: "area-fort-worth-stockyards",
      municipalityId: "municipality-dfw-fort-worth",
      name: "Stockyards",
      slug: "stockyards",
      kind: "district",
   },
   {
      id: "area-fort-worth-cultural-district",
      municipalityId: "municipality-dfw-fort-worth",
      name: "Cultural District",
      slug: "cultural-district",
      kind: "district",
   },
   {
      id: "area-arlington-downtown",
      municipalityId: "municipality-dfw-arlington",
      name: "Downtown Arlington",
      slug: "downtown-arlington",
      kind: "downtown",
   },
   {
      id: "area-arlington-entertainment",
      municipalityId: "municipality-dfw-arlington",
      name: "Entertainment District",
      slug: "entertainment-district",
      kind: "district",
   },
   {
      id: "area-plano-downtown",
      municipalityId: "municipality-dfw-plano",
      name: "Downtown Plano",
      slug: "downtown-plano",
      kind: "downtown",
   },
   {
      id: "area-plano-legacy-west",
      municipalityId: "municipality-dfw-plano",
      name: "Legacy West",
      slug: "legacy-west",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Austin                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-austin-downtown",
      municipalityId: "municipality-austin-austin",
      name: "Downtown Austin",
      slug: "downtown-austin",
      kind: "downtown",
   },
   {
      id: "area-austin-south-congress",
      municipalityId: "municipality-austin-austin",
      name: "South Congress",
      slug: "south-congress",
      kind: "district",
   },
   {
      id: "area-austin-east-austin",
      municipalityId: "municipality-austin-austin",
      name: "East Austin",
      slug: "east-austin",
      kind: "area",
   },
   {
      id: "area-austin-hyde-park",
      municipalityId: "municipality-austin-austin",
      name: "Hyde Park",
      slug: "hyde-park",
      kind: "neighborhood",
   },
   {
      id: "area-austin-mueller",
      municipalityId: "municipality-austin-austin",
      name: "Mueller",
      slug: "mueller",
      kind: "area",
   },
   {
      id: "area-round-rock-downtown",
      municipalityId: "municipality-austin-round-rock",
      name: "Downtown Round Rock",
      slug: "downtown-round-rock",
      kind: "downtown",
   },
   {
      id: "area-round-rock-old-settlers",
      municipalityId: "municipality-austin-round-rock",
      name: "Old Settlers",
      slug: "old-settlers",
      kind: "area",
   },
   {
      id: "area-georgetown-downtown",
      municipalityId: "municipality-austin-georgetown",
      name: "Downtown Georgetown",
      slug: "downtown-georgetown",
      kind: "downtown",
   },
   {
      id: "area-georgetown-square",
      municipalityId: "municipality-austin-georgetown",
      name: "Georgetown Square",
      slug: "georgetown-square",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* New York Metro                                                          */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-nyc-lower-east-side",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Lower East Side",
      slug: "lower-east-side",
      kind: "neighborhood",
   },
   {
      id: "area-nyc-west-village",
      municipalityId: "municipality-new-york-new-york-city",
      name: "West Village",
      slug: "west-village",
      kind: "neighborhood",
   },
   {
      id: "area-nyc-williamsburg",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Williamsburg",
      slug: "williamsburg",
      kind: "neighborhood",
   },
   {
      id: "area-nyc-astoria",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Astoria",
      slug: "astoria",
      kind: "neighborhood",
   },
   {
      id: "area-nyc-harlem",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Harlem",
      slug: "harlem",
      kind: "neighborhood",
   },
   {
      id: "area-nyc-park-slope",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Park Slope",
      slug: "park-slope",
      kind: "neighborhood",
   },
   {
      id: "area-jersey-city-downtown",
      municipalityId: "municipality-new-york-jersey-city",
      name: "Downtown Jersey City",
      slug: "downtown-jersey-city",
      kind: "downtown",
   },
   {
      id: "area-jersey-city-journal-square",
      municipalityId: "municipality-new-york-jersey-city",
      name: "Journal Square",
      slug: "journal-square",
      kind: "district",
   },
   {
      id: "area-jersey-city-heights",
      municipalityId: "municipality-new-york-jersey-city",
      name: "The Heights",
      slug: "the-heights",
      kind: "neighborhood",
   },
   {
      id: "area-newark-downtown",
      municipalityId: "municipality-new-york-newark",
      name: "Downtown Newark",
      slug: "downtown-newark",
      kind: "downtown",
   },
   {
      id: "area-newark-ironbound",
      municipalityId: "municipality-new-york-newark",
      name: "Ironbound",
      slug: "ironbound",
      kind: "neighborhood",
   },
   {
      id: "area-newark-university-heights",
      municipalityId: "municipality-new-york-newark",
      name: "University Heights",
      slug: "university-heights",
      kind: "neighborhood",
   },
   {
      id: "area-yonkers-waterfront",
      municipalityId: "municipality-new-york-yonkers",
      name: "Downtown Waterfront",
      slug: "downtown-waterfront",
      kind: "district",
   },
   {
      id: "area-yonkers-getty-square",
      municipalityId: "municipality-new-york-yonkers",
      name: "Getty Square",
      slug: "getty-square",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Boston                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-boston-back-bay",
      municipalityId: "municipality-boston-boston",
      name: "Back Bay",
      slug: "back-bay",
      kind: "neighborhood",
   },
   {
      id: "area-boston-south-end",
      municipalityId: "municipality-boston-boston",
      name: "South End",
      slug: "south-end",
      kind: "neighborhood",
   },
   {
      id: "area-boston-beacon-hill",
      municipalityId: "municipality-boston-boston",
      name: "Beacon Hill",
      slug: "beacon-hill",
      kind: "neighborhood",
   },
   {
      id: "area-boston-north-end",
      municipalityId: "municipality-boston-boston",
      name: "North End",
      slug: "north-end",
      kind: "neighborhood",
   },
   {
      id: "area-boston-seaport",
      municipalityId: "municipality-boston-boston",
      name: "Seaport",
      slug: "seaport",
      kind: "district",
   },
   {
      id: "area-cambridge-harvard-square",
      municipalityId: "municipality-boston-cambridge",
      name: "Harvard Square",
      slug: "harvard-square",
      kind: "district",
   },
   {
      id: "area-cambridge-central-square",
      municipalityId: "municipality-boston-cambridge",
      name: "Central Square",
      slug: "central-square",
      kind: "district",
   },
   {
      id: "area-cambridge-kendall-square",
      municipalityId: "municipality-boston-cambridge",
      name: "Kendall Square",
      slug: "kendall-square",
      kind: "district",
   },
   {
      id: "area-somerville-davis-square",
      municipalityId: "municipality-boston-somerville",
      name: "Davis Square",
      slug: "davis-square",
      kind: "district",
   },
   {
      id: "area-somerville-union-square",
      municipalityId: "municipality-boston-somerville",
      name: "Union Square",
      slug: "union-square",
      kind: "district",
   },
   {
      id: "area-somerville-assembly-row",
      municipalityId: "municipality-boston-somerville",
      name: "Assembly Row",
      slug: "assembly-row",
      kind: "district",
   },
   {
      id: "area-brookline-coolidge-corner",
      municipalityId: "municipality-boston-brookline",
      name: "Coolidge Corner",
      slug: "coolidge-corner",
      kind: "district",
   },
   {
      id: "area-brookline-village",
      municipalityId: "municipality-boston-brookline",
      name: "Brookline Village",
      slug: "brookline-village",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Philadelphia                                                            */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-philadelphia-center-city",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Center City",
      slug: "center-city",
      kind: "district",
   },
   {
      id: "area-philadelphia-old-city",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Old City",
      slug: "old-city",
      kind: "neighborhood",
   },
   {
      id: "area-philadelphia-fishtown",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Fishtown",
      slug: "fishtown",
      kind: "neighborhood",
   },
   {
      id: "area-philadelphia-passayunk",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Passyunk Square",
      slug: "passyunk-square",
      kind: "neighborhood",
   },
   {
      id: "area-philadelphia-university-city",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "University City",
      slug: "university-city",
      kind: "district",
   },
   {
      id: "area-philadelphia-manayunk",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Manayunk",
      slug: "manayunk",
      kind: "neighborhood",
   },
   {
      id: "area-media-downtown",
      municipalityId: "municipality-philadelphia-media",
      name: "Downtown Media",
      slug: "downtown-media",
      kind: "downtown",
   },
   {
      id: "area-media-state-street",
      municipalityId: "municipality-philadelphia-media",
      name: "State Street",
      slug: "state-street",
      kind: "district",
   },
   {
      id: "area-collingswood-downtown",
      municipalityId: "municipality-philadelphia-collingswood",
      name: "Downtown Collingswood",
      slug: "downtown-collingswood",
      kind: "downtown",
   },
   {
      id: "area-collingswood-haddon-avenue",
      municipalityId: "municipality-philadelphia-collingswood",
      name: "Haddon Avenue",
      slug: "haddon-avenue",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Washington DC Metro                                                     */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-dc-georgetown",
      municipalityId: "municipality-dc-washington",
      name: "Georgetown",
      slug: "georgetown",
      kind: "neighborhood",
   },
   {
      id: "area-dc-dupont-circle",
      municipalityId: "municipality-dc-washington",
      name: "Dupont Circle",
      slug: "dupont-circle",
      kind: "neighborhood",
   },
   {
      id: "area-dc-shaw",
      municipalityId: "municipality-dc-washington",
      name: "Shaw",
      slug: "shaw",
      kind: "neighborhood",
   },
   {
      id: "area-dc-capitol-hill",
      municipalityId: "municipality-dc-washington",
      name: "Capitol Hill",
      slug: "capitol-hill",
      kind: "neighborhood",
   },
   {
      id: "area-dc-wharf",
      municipalityId: "municipality-dc-washington",
      name: "The Wharf",
      slug: "the-wharf",
      kind: "district",
   },
   {
      id: "area-alexandria-old-town",
      municipalityId: "municipality-dc-alexandria",
      name: "Old Town Alexandria",
      slug: "old-town-alexandria",
      kind: "district",
   },
   {
      id: "area-alexandria-del-ray",
      municipalityId: "municipality-dc-alexandria",
      name: "Del Ray",
      slug: "del-ray",
      kind: "neighborhood",
   },
   {
      id: "area-arlington-clarendon",
      municipalityId: "municipality-dc-arlington",
      name: "Clarendon",
      slug: "clarendon",
      kind: "district",
   },
   {
      id: "area-arlington-ballston",
      municipalityId: "municipality-dc-arlington",
      name: "Ballston",
      slug: "ballston",
      kind: "district",
   },
   {
      id: "area-arlington-rosslyn",
      municipalityId: "municipality-dc-arlington",
      name: "Rosslyn",
      slug: "rosslyn",
      kind: "district",
   },
   {
      id: "area-bethesda-downtown",
      municipalityId: "municipality-dc-bethesda",
      name: "Downtown Bethesda",
      slug: "downtown-bethesda",
      kind: "downtown",
   },
   {
      id: "area-bethesda-woodmont-triangle",
      municipalityId: "municipality-dc-bethesda",
      name: "Woodmont Triangle",
      slug: "woodmont-triangle",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* Atlanta                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-atlanta-midtown",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Midtown",
      slug: "midtown",
      kind: "district",
   },
   {
      id: "area-atlanta-old-fourth-ward",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Old Fourth Ward",
      slug: "old-fourth-ward",
      kind: "neighborhood",
   },
   {
      id: "area-atlanta-inman-park",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Inman Park",
      slug: "inman-park",
      kind: "neighborhood",
   },
   {
      id: "area-atlanta-virginia-highland",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Virginia-Highland",
      slug: "virginia-highland",
      kind: "neighborhood",
   },
   {
      id: "area-atlanta-west-end",
      municipalityId: "municipality-atlanta-atlanta",
      name: "West End",
      slug: "west-end",
      kind: "neighborhood",
   },
   {
      id: "area-decatur-downtown",
      municipalityId: "municipality-atlanta-decatur",
      name: "Downtown Decatur",
      slug: "downtown-decatur",
      kind: "downtown",
   },
   {
      id: "area-decatur-oakhurst",
      municipalityId: "municipality-atlanta-decatur",
      name: "Oakhurst",
      slug: "oakhurst",
      kind: "neighborhood",
   },
   {
      id: "area-marietta-square",
      municipalityId: "municipality-atlanta-marietta",
      name: "Marietta Square",
      slug: "marietta-square",
      kind: "district",
   },
   {
      id: "area-marietta-whitlock",
      municipalityId: "municipality-atlanta-marietta",
      name: "Whitlock",
      slug: "whitlock",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Houston                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-houston-montrose",
      municipalityId: "municipality-houston-houston",
      name: "Montrose",
      slug: "montrose",
      kind: "neighborhood",
   },
   {
      id: "area-houston-heights",
      municipalityId: "municipality-houston-houston",
      name: "The Heights",
      slug: "the-heights",
      kind: "neighborhood",
   },
   {
      id: "area-houston-downtown",
      municipalityId: "municipality-houston-houston",
      name: "Downtown Houston",
      slug: "downtown-houston",
      kind: "downtown",
   },
   {
      id: "area-houston-museum-district",
      municipalityId: "municipality-houston-houston",
      name: "Museum District",
      slug: "museum-district",
      kind: "district",
   },
   {
      id: "area-houston-eado",
      municipalityId: "municipality-houston-houston",
      name: "EaDo",
      slug: "eado",
      kind: "district",
   },
   {
      id: "area-houston-rice-village",
      municipalityId: "municipality-houston-houston",
      name: "Rice Village",
      slug: "rice-village",
      kind: "district",
   },
   {
      id: "area-sugar-land-town-square",
      municipalityId: "municipality-houston-sugar-land",
      name: "Sugar Land Town Square",
      slug: "sugar-land-town-square",
      kind: "district",
   },
   {
      id: "area-sugar-land-first-colony",
      municipalityId: "municipality-houston-sugar-land",
      name: "First Colony",
      slug: "first-colony",
      kind: "area",
   },
   {
      id: "area-woodlands-market-street",
      municipalityId: "municipality-houston-the-woodlands",
      name: "Market Street",
      slug: "market-street",
      kind: "district",
   },
   {
      id: "area-woodlands-hughes-landing",
      municipalityId: "municipality-houston-the-woodlands",
      name: "Hughes Landing",
      slug: "hughes-landing",
      kind: "district",
   },
   {
      id: "area-woodlands-waterway",
      municipalityId: "municipality-houston-the-woodlands",
      name: "The Waterway",
      slug: "the-waterway",
      kind: "area",
   },
   {
      id: "area-galveston-strand",
      municipalityId: "municipality-houston-galveston",
      name: "Strand Historic District",
      slug: "strand-historic-district",
      kind: "district",
   },
   {
      id: "area-galveston-east-end",
      municipalityId: "municipality-houston-galveston",
      name: "East End",
      slug: "east-end",
      kind: "district",
   },
   {
      id: "area-galveston-seawall",
      municipalityId: "municipality-houston-galveston",
      name: "Seawall",
      slug: "seawall",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Miami                                                                   */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-miami-wynwood",
      municipalityId: "municipality-miami-miami",
      name: "Wynwood",
      slug: "wynwood",
      kind: "neighborhood",
   },
   {
      id: "area-miami-little-havana",
      municipalityId: "municipality-miami-miami",
      name: "Little Havana",
      slug: "little-havana",
      kind: "neighborhood",
   },
   {
      id: "area-miami-brickell",
      municipalityId: "municipality-miami-miami",
      name: "Brickell",
      slug: "brickell",
      kind: "neighborhood",
   },
   {
      id: "area-miami-coconut-grove",
      municipalityId: "municipality-miami-miami",
      name: "Coconut Grove",
      slug: "coconut-grove",
      kind: "neighborhood",
   },
   {
      id: "area-miami-design-district",
      municipalityId: "municipality-miami-miami",
      name: "Design District",
      slug: "design-district",
      kind: "district",
   },
   {
      id: "area-miami-beach-south-beach",
      municipalityId: "municipality-miami-miami-beach",
      name: "South Beach",
      slug: "south-beach",
      kind: "area",
   },
   {
      id: "area-miami-beach-north-beach",
      municipalityId: "municipality-miami-miami-beach",
      name: "North Beach",
      slug: "north-beach",
      kind: "area",
   },
   {
      id: "area-miami-beach-sunset-harbour",
      municipalityId: "municipality-miami-miami-beach",
      name: "Sunset Harbour",
      slug: "sunset-harbour",
      kind: "district",
   },
   {
      id: "area-coral-gables-downtown",
      municipalityId: "municipality-miami-coral-gables",
      name: "Downtown Coral Gables",
      slug: "downtown-coral-gables",
      kind: "downtown",
   },
   {
      id: "area-coral-gables-miracle-mile",
      municipalityId: "municipality-miami-coral-gables",
      name: "Miracle Mile",
      slug: "miracle-mile",
      kind: "district",
   },
   {
      id: "area-coral-gables-merrick-park",
      municipalityId: "municipality-miami-coral-gables",
      name: "Merrick Park",
      slug: "merrick-park",
      kind: "district",
   },
   {
      id: "area-fort-lauderdale-las-olas",
      municipalityId: "municipality-miami-fort-lauderdale",
      name: "Las Olas",
      slug: "las-olas",
      kind: "district",
   },
   {
      id: "area-fort-lauderdale-flagler-village",
      municipalityId: "municipality-miami-fort-lauderdale",
      name: "Flagler Village",
      slug: "flagler-village",
      kind: "neighborhood",
   },
   {
      id: "area-fort-lauderdale-beach",
      municipalityId: "municipality-miami-fort-lauderdale",
      name: "Fort Lauderdale Beach",
      slug: "fort-lauderdale-beach",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Orlando                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-orlando-downtown",
      municipalityId: "municipality-orlando-orlando",
      name: "Downtown Orlando",
      slug: "downtown-orlando",
      kind: "downtown",
   },
   {
      id: "area-orlando-mills-50",
      municipalityId: "municipality-orlando-orlando",
      name: "Mills 50",
      slug: "mills-50",
      kind: "district",
   },
   {
      id: "area-orlando-thornton-park",
      municipalityId: "municipality-orlando-orlando",
      name: "Thornton Park",
      slug: "thornton-park",
      kind: "neighborhood",
   },
   {
      id: "area-orlando-audubon-park",
      municipalityId: "municipality-orlando-orlando",
      name: "Audubon Park",
      slug: "audubon-park",
      kind: "district",
   },
   {
      id: "area-orlando-milk-district",
      municipalityId: "municipality-orlando-orlando",
      name: "Milk District",
      slug: "milk-district",
      kind: "district",
   },
   {
      id: "area-winter-park-park-avenue",
      municipalityId: "municipality-orlando-winter-park",
      name: "Park Avenue",
      slug: "park-avenue",
      kind: "district",
   },
   {
      id: "area-winter-park-hannibal-square",
      municipalityId: "municipality-orlando-winter-park",
      name: "Hannibal Square",
      slug: "hannibal-square",
      kind: "district",
   },
   {
      id: "area-kissimmee-downtown",
      municipalityId: "municipality-orlando-kissimmee",
      name: "Downtown Kissimmee",
      slug: "downtown-kissimmee",
      kind: "downtown",
   },
   {
      id: "area-kissimmee-lakefront",
      municipalityId: "municipality-orlando-kissimmee",
      name: "Kissimmee Lakefront",
      slug: "kissimmee-lakefront",
      kind: "area",
   },
   {
      id: "area-sanford-downtown",
      municipalityId: "municipality-orlando-sanford",
      name: "Historic Downtown Sanford",
      slug: "historic-downtown-sanford",
      kind: "downtown",
   },
   {
      id: "area-sanford-riverwalk",
      municipalityId: "municipality-orlando-sanford",
      name: "Sanford RiverWalk",
      slug: "sanford-riverwalk",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Nashville                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-nashville-downtown",
      municipalityId: "municipality-nashville-nashville",
      name: "Downtown Nashville",
      slug: "downtown-nashville",
      kind: "downtown",
   },
   {
      id: "area-nashville-east",
      municipalityId: "municipality-nashville-nashville",
      name: "East Nashville",
      slug: "east-nashville",
      kind: "area",
   },
   {
      id: "area-nashville-germantown",
      municipalityId: "municipality-nashville-nashville",
      name: "Germantown",
      slug: "germantown",
      kind: "neighborhood",
   },
   {
      id: "area-nashville-12-south",
      municipalityId: "municipality-nashville-nashville",
      name: "12 South",
      slug: "12-south",
      kind: "neighborhood",
   },
   {
      id: "area-nashville-gulch",
      municipalityId: "municipality-nashville-nashville",
      name: "The Gulch",
      slug: "the-gulch",
      kind: "district",
   },
   {
      id: "area-nashville-wedgewood-houston",
      municipalityId: "municipality-nashville-nashville",
      name: "Wedgewood-Houston",
      slug: "wedgewood-houston",
      kind: "neighborhood",
   },
   {
      id: "area-franklin-downtown",
      municipalityId: "municipality-nashville-franklin",
      name: "Downtown Franklin",
      slug: "downtown-franklin",
      kind: "downtown",
   },
   {
      id: "area-franklin-factory",
      municipalityId: "municipality-nashville-franklin",
      name: "The Factory",
      slug: "the-factory",
      kind: "district",
   },
   {
      id: "area-murfreesboro-downtown",
      municipalityId: "municipality-nashville-murfreesboro",
      name: "Downtown Murfreesboro",
      slug: "downtown-murfreesboro",
      kind: "downtown",
   },
   {
      id: "area-murfreesboro-square",
      municipalityId: "municipality-nashville-murfreesboro",
      name: "Public Square",
      slug: "public-square",
      kind: "district",
   },
   {
      id: "area-hendersonville-indian-lake",
      municipalityId: "municipality-nashville-hendersonville",
      name: "Indian Lake",
      slug: "indian-lake",
      kind: "area",
   },
   {
      id: "area-hendersonville-old-hickory-lake",
      municipalityId: "municipality-nashville-hendersonville",
      name: "Old Hickory Lake",
      slug: "old-hickory-lake",
      kind: "area",
   },

   /* ------------------------------------------------------------------------ */
   /* Controlled U.S. expansion                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "area-baltimore-inner-harbor",
      municipalityId: "municipality-baltimore-baltimore",
      name: "Inner Harbor",
      slug: "inner-harbor",
      kind: "district",
   },
   {
      id: "area-baltimore-fells-point",
      municipalityId: "municipality-baltimore-baltimore",
      name: "Fells Point",
      slug: "fells-point",
      kind: "neighborhood",
   },
   {
      id: "area-baltimore-hampden",
      municipalityId: "municipality-baltimore-baltimore",
      name: "Hampden",
      slug: "hampden",
      kind: "neighborhood",
   },
   {
      id: "area-baltimore-mount-vernon",
      municipalityId: "municipality-baltimore-baltimore",
      name: "Mount Vernon",
      slug: "mount-vernon",
      kind: "neighborhood",
   },
   {
      id: "area-buffalo-elmwood-village",
      municipalityId: "municipality-buffalo-buffalo",
      name: "Elmwood Village",
      slug: "elmwood-village",
      kind: "neighborhood",
   },
   {
      id: "area-buffalo-allentown",
      municipalityId: "municipality-buffalo-buffalo",
      name: "Allentown",
      slug: "allentown",
      kind: "neighborhood",
   },
   {
      id: "area-buffalo-canalside",
      municipalityId: "municipality-buffalo-buffalo",
      name: "Canalside",
      slug: "canalside",
      kind: "district",
   },
   {
      id: "area-buffalo-hertel-avenue",
      municipalityId: "municipality-buffalo-buffalo",
      name: "Hertel Avenue",
      slug: "hertel-avenue",
      kind: "district",
   },
   {
      id: "area-charlotte-uptown",
      municipalityId: "municipality-charlotte-charlotte",
      name: "Uptown",
      slug: "uptown",
      kind: "downtown",
   },
   {
      id: "area-charlotte-noda",
      municipalityId: "municipality-charlotte-charlotte",
      name: "NoDa",
      slug: "noda",
      kind: "district",
   },
   {
      id: "area-charlotte-south-end",
      municipalityId: "municipality-charlotte-charlotte",
      name: "South End",
      slug: "south-end",
      kind: "district",
   },
   {
      id: "area-charlotte-plaza-midwood",
      municipalityId: "municipality-charlotte-charlotte",
      name: "Plaza Midwood",
      slug: "plaza-midwood",
      kind: "neighborhood",
   },
   {
      id: "area-cincinnati-over-the-rhine",
      municipalityId: "municipality-cincinnati-cincinnati",
      name: "Over-the-Rhine",
      slug: "over-the-rhine",
      kind: "neighborhood",
   },
   {
      id: "area-cincinnati-downtown",
      municipalityId: "municipality-cincinnati-cincinnati",
      name: "Downtown Cincinnati",
      slug: "downtown-cincinnati",
      kind: "downtown",
   },
   {
      id: "area-cincinnati-the-banks",
      municipalityId: "municipality-cincinnati-cincinnati",
      name: "The Banks",
      slug: "the-banks",
      kind: "district",
   },
   {
      id: "area-cincinnati-mount-adams",
      municipalityId: "municipality-cincinnati-cincinnati",
      name: "Mount Adams",
      slug: "mount-adams",
      kind: "neighborhood",
   },
   {
      id: "area-covington-mainstrasse",
      municipalityId: "municipality-cincinnati-covington",
      name: "MainStrasse Village",
      slug: "mainstrasse-village",
      kind: "district",
   },
   {
      id: "area-covington-roebling-point",
      municipalityId: "municipality-cincinnati-covington",
      name: "Roebling Point",
      slug: "roebling-point",
      kind: "district",
   },
   {
      id: "area-cleveland-downtown",
      municipalityId: "municipality-cleveland-cleveland",
      name: "Downtown Cleveland",
      slug: "downtown-cleveland",
      kind: "downtown",
   },
   {
      id: "area-cleveland-ohio-city",
      municipalityId: "municipality-cleveland-cleveland",
      name: "Ohio City",
      slug: "ohio-city",
      kind: "neighborhood",
   },
   {
      id: "area-cleveland-tremont",
      municipalityId: "municipality-cleveland-cleveland",
      name: "Tremont",
      slug: "tremont",
      kind: "neighborhood",
   },
   {
      id: "area-cleveland-university-circle",
      municipalityId: "municipality-cleveland-cleveland",
      name: "University Circle",
      slug: "university-circle",
      kind: "district",
   },
   {
      id: "area-columbus-short-north",
      municipalityId: "municipality-columbus-columbus",
      name: "Short North",
      slug: "short-north",
      kind: "district",
   },
   {
      id: "area-columbus-german-village",
      municipalityId: "municipality-columbus-columbus",
      name: "German Village",
      slug: "german-village",
      kind: "neighborhood",
   },
   {
      id: "area-columbus-downtown",
      municipalityId: "municipality-columbus-columbus",
      name: "Downtown Columbus",
      slug: "downtown-columbus",
      kind: "downtown",
   },
   {
      id: "area-columbus-franklinton",
      municipalityId: "municipality-columbus-columbus",
      name: "Franklinton",
      slug: "franklinton",
      kind: "neighborhood",
   },
   {
      id: "area-detroit-downtown",
      municipalityId: "municipality-detroit-detroit",
      name: "Downtown Detroit",
      slug: "downtown-detroit",
      kind: "downtown",
   },
   {
      id: "area-detroit-corktown",
      municipalityId: "municipality-detroit-detroit",
      name: "Corktown",
      slug: "corktown",
      kind: "neighborhood",
   },
   {
      id: "area-detroit-midtown",
      municipalityId: "municipality-detroit-detroit",
      name: "Midtown",
      slug: "midtown",
      kind: "district",
   },
   {
      id: "area-detroit-eastern-market",
      municipalityId: "municipality-detroit-detroit",
      name: "Eastern Market",
      slug: "eastern-market",
      kind: "district",
   },
   {
      id: "area-green-bay-downtown",
      municipalityId: "municipality-green-bay-green-bay",
      name: "Downtown Green Bay",
      slug: "downtown-green-bay",
      kind: "downtown",
   },
   {
      id: "area-green-bay-broadway-district",
      municipalityId: "municipality-green-bay-green-bay",
      name: "Broadway District",
      slug: "broadway-district",
      kind: "district",
   },
   {
      id: "area-green-bay-titletown",
      municipalityId: "municipality-green-bay-green-bay",
      name: "Titletown",
      slug: "titletown",
      kind: "district",
   },
   {
      id: "area-green-bay-bay-beach",
      municipalityId: "municipality-green-bay-green-bay",
      name: "Bay Beach",
      slug: "bay-beach",
      kind: "area",
   },
   {
      id: "area-indianapolis-downtown",
      municipalityId: "municipality-indianapolis-indianapolis",
      name: "Downtown Indianapolis",
      slug: "downtown-indianapolis",
      kind: "downtown",
   },
   {
      id: "area-indianapolis-mass-ave",
      municipalityId: "municipality-indianapolis-indianapolis",
      name: "Mass Ave",
      slug: "mass-ave",
      kind: "district",
   },
   {
      id: "area-indianapolis-fountain-square",
      municipalityId: "municipality-indianapolis-indianapolis",
      name: "Fountain Square",
      slug: "fountain-square",
      kind: "neighborhood",
   },
   {
      id: "area-indianapolis-broad-ripple",
      municipalityId: "municipality-indianapolis-indianapolis",
      name: "Broad Ripple",
      slug: "broad-ripple",
      kind: "neighborhood",
   },
   {
      id: "area-jacksonville-downtown",
      municipalityId: "municipality-jacksonville-jacksonville",
      name: "Downtown Jacksonville",
      slug: "downtown-jacksonville",
      kind: "downtown",
   },
   {
      id: "area-jacksonville-riverside-avondale",
      municipalityId: "municipality-jacksonville-jacksonville",
      name: "Riverside Avondale",
      slug: "riverside-avondale",
      kind: "area",
   },
   {
      id: "area-jacksonville-san-marco",
      municipalityId: "municipality-jacksonville-jacksonville",
      name: "San Marco",
      slug: "san-marco",
      kind: "neighborhood",
   },
   {
      id: "area-jacksonville-beach-downtown",
      municipalityId: "municipality-jacksonville-jacksonville-beach",
      name: "Downtown Jacksonville Beach",
      slug: "downtown-jacksonville-beach",
      kind: "downtown",
   },
   {
      id: "area-jacksonville-beach-beaches-town-center",
      municipalityId: "municipality-jacksonville-jacksonville-beach",
      name: "Beaches Town Center",
      slug: "beaches-town-center",
      kind: "district",
   },
   {
      id: "area-kansas-city-downtown",
      municipalityId: "municipality-kansas-city-kansas-city",
      name: "Downtown Kansas City",
      slug: "downtown-kansas-city",
      kind: "downtown",
   },
   {
      id: "area-kansas-city-crossroads",
      municipalityId: "municipality-kansas-city-kansas-city",
      name: "Crossroads Arts District",
      slug: "crossroads-arts-district",
      kind: "district",
   },
   {
      id: "area-kansas-city-westport",
      municipalityId: "municipality-kansas-city-kansas-city",
      name: "Westport",
      slug: "westport",
      kind: "district",
   },
   {
      id: "area-kansas-city-country-club-plaza",
      municipalityId: "municipality-kansas-city-kansas-city",
      name: "Country Club Plaza",
      slug: "country-club-plaza",
      kind: "district",
   },
   {
      id: "area-overland-park-downtown",
      municipalityId: "municipality-kansas-city-overland-park",
      name: "Downtown Overland Park",
      slug: "downtown-overland-park",
      kind: "downtown",
   },
   {
      id: "area-overland-park-prairiefire",
      municipalityId: "municipality-kansas-city-overland-park",
      name: "Prairiefire",
      slug: "prairiefire",
      kind: "district",
   },
   {
      id: "area-memphis-downtown",
      municipalityId: "municipality-memphis-memphis",
      name: "Downtown Memphis",
      slug: "downtown-memphis",
      kind: "downtown",
   },
   {
      id: "area-memphis-beale-street",
      municipalityId: "municipality-memphis-memphis",
      name: "Beale Street",
      slug: "beale-street",
      kind: "district",
   },
   {
      id: "area-memphis-cooper-young",
      municipalityId: "municipality-memphis-memphis",
      name: "Cooper-Young",
      slug: "cooper-young",
      kind: "neighborhood",
   },
   {
      id: "area-memphis-overton-square",
      municipalityId: "municipality-memphis-memphis",
      name: "Overton Square",
      slug: "overton-square",
      kind: "district",
   },
   {
      id: "area-milwaukee-downtown",
      municipalityId: "municipality-milwaukee-milwaukee",
      name: "Downtown Milwaukee",
      slug: "downtown-milwaukee",
      kind: "downtown",
   },
   {
      id: "area-milwaukee-historic-third-ward",
      municipalityId: "municipality-milwaukee-milwaukee",
      name: "Historic Third Ward",
      slug: "historic-third-ward",
      kind: "district",
   },
   {
      id: "area-milwaukee-walkers-point",
      municipalityId: "municipality-milwaukee-milwaukee",
      name: "Walker's Point",
      slug: "walkers-point",
      kind: "neighborhood",
   },
   {
      id: "area-milwaukee-bay-view",
      municipalityId: "municipality-milwaukee-milwaukee",
      name: "Bay View",
      slug: "bay-view",
      kind: "neighborhood",
   },
   {
      id: "area-minneapolis-north-loop",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "North Loop",
      slug: "north-loop",
      kind: "neighborhood",
   },
   {
      id: "area-minneapolis-northeast",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "Northeast Minneapolis",
      slug: "northeast-minneapolis",
      kind: "area",
   },
   {
      id: "area-minneapolis-uptown",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "Uptown",
      slug: "uptown",
      kind: "neighborhood",
   },
   {
      id: "area-minneapolis-downtown",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "Downtown Minneapolis",
      slug: "downtown-minneapolis",
      kind: "downtown",
   },
   {
      id: "area-saint-paul-lowertown",
      municipalityId: "municipality-twin-cities-saint-paul",
      name: "Lowertown",
      slug: "lowertown",
      kind: "district",
   },
   {
      id: "area-saint-paul-grand-avenue",
      municipalityId: "municipality-twin-cities-saint-paul",
      name: "Grand Avenue",
      slug: "grand-avenue",
      kind: "district",
   },
   {
      id: "area-saint-paul-summit-university",
      municipalityId: "municipality-twin-cities-saint-paul",
      name: "Summit-University",
      slug: "summit-university",
      kind: "neighborhood",
   },
   {
      id: "area-new-orleans-french-quarter",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "French Quarter",
      slug: "french-quarter",
      kind: "neighborhood",
   },
   {
      id: "area-new-orleans-marigny",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Marigny",
      slug: "marigny",
      kind: "neighborhood",
   },
   {
      id: "area-new-orleans-garden-district",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Garden District",
      slug: "garden-district",
      kind: "neighborhood",
   },
   {
      id: "area-new-orleans-magazine-street",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Magazine Street",
      slug: "magazine-street",
      kind: "district",
   },
   {
      id: "area-oklahoma-city-bricktown",
      municipalityId: "municipality-oklahoma-city-oklahoma-city",
      name: "Bricktown",
      slug: "bricktown",
      kind: "district",
   },
   {
      id: "area-oklahoma-city-midtown",
      municipalityId: "municipality-oklahoma-city-oklahoma-city",
      name: "Midtown",
      slug: "midtown",
      kind: "district",
   },
   {
      id: "area-oklahoma-city-plaza-district",
      municipalityId: "municipality-oklahoma-city-oklahoma-city",
      name: "Plaza District",
      slug: "plaza-district",
      kind: "district",
   },
   {
      id: "area-oklahoma-city-paseo",
      municipalityId: "municipality-oklahoma-city-oklahoma-city",
      name: "Paseo Arts District",
      slug: "paseo-arts-district",
      kind: "district",
   },
   {
      id: "area-pittsburgh-downtown",
      municipalityId: "municipality-pittsburgh-pittsburgh",
      name: "Downtown Pittsburgh",
      slug: "downtown-pittsburgh",
      kind: "downtown",
   },
   {
      id: "area-pittsburgh-strip-district",
      municipalityId: "municipality-pittsburgh-pittsburgh",
      name: "Strip District",
      slug: "strip-district",
      kind: "district",
   },
   {
      id: "area-pittsburgh-lawrenceville",
      municipalityId: "municipality-pittsburgh-pittsburgh",
      name: "Lawrenceville",
      slug: "lawrenceville",
      kind: "neighborhood",
   },
   {
      id: "area-pittsburgh-shadyside",
      municipalityId: "municipality-pittsburgh-pittsburgh",
      name: "Shadyside",
      slug: "shadyside",
      kind: "neighborhood",
   },
   {
      id: "area-raleigh-downtown",
      municipalityId: "municipality-raleigh-durham-raleigh",
      name: "Downtown Raleigh",
      slug: "downtown-raleigh",
      kind: "downtown",
   },
   {
      id: "area-raleigh-warehouse-district",
      municipalityId: "municipality-raleigh-durham-raleigh",
      name: "Warehouse District",
      slug: "warehouse-district",
      kind: "district",
   },
   {
      id: "area-raleigh-glenwood-south",
      municipalityId: "municipality-raleigh-durham-raleigh",
      name: "Glenwood South",
      slug: "glenwood-south",
      kind: "district",
   },
   {
      id: "area-durham-downtown",
      municipalityId: "municipality-raleigh-durham-durham",
      name: "Downtown Durham",
      slug: "downtown-durham",
      kind: "downtown",
   },
   {
      id: "area-durham-ninth-street",
      municipalityId: "municipality-raleigh-durham-durham",
      name: "Ninth Street",
      slug: "ninth-street",
      kind: "district",
   },
   {
      id: "area-durham-american-tobacco",
      municipalityId: "municipality-raleigh-durham-durham",
      name: "American Tobacco District",
      slug: "american-tobacco-district",
      kind: "district",
   },
   {
      id: "area-sacramento-downtown",
      municipalityId: "municipality-sacramento-sacramento",
      name: "Downtown Sacramento",
      slug: "downtown-sacramento",
      kind: "downtown",
   },
   {
      id: "area-sacramento-midtown",
      municipalityId: "municipality-sacramento-sacramento",
      name: "Midtown",
      slug: "midtown",
      kind: "neighborhood",
   },
   {
      id: "area-sacramento-old-sacramento",
      municipalityId: "municipality-sacramento-sacramento",
      name: "Old Sacramento",
      slug: "old-sacramento",
      kind: "district",
   },
   {
      id: "area-sacramento-r-street",
      municipalityId: "municipality-sacramento-sacramento",
      name: "R Street Corridor",
      slug: "r-street-corridor",
      kind: "district",
   },
   {
      id: "area-salt-lake-city-downtown",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "Downtown Salt Lake City",
      slug: "downtown-salt-lake-city",
      kind: "downtown",
   },
   {
      id: "area-salt-lake-city-central-ninth",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "Central Ninth",
      slug: "central-ninth",
      kind: "district",
   },
   {
      id: "area-salt-lake-city-sugar-house",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "Sugar House",
      slug: "sugar-house",
      kind: "neighborhood",
   },
   {
      id: "area-salt-lake-city-granary",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "Granary District",
      slug: "granary-district",
      kind: "district",
   },
   {
      id: "area-san-antonio-downtown",
      municipalityId: "municipality-san-antonio-san-antonio",
      name: "Downtown San Antonio",
      slug: "downtown-san-antonio",
      kind: "downtown",
   },
   {
      id: "area-san-antonio-pearl",
      municipalityId: "municipality-san-antonio-san-antonio",
      name: "Pearl District",
      slug: "pearl-district",
      kind: "district",
   },
   {
      id: "area-san-antonio-southtown",
      municipalityId: "municipality-san-antonio-san-antonio",
      name: "Southtown",
      slug: "southtown",
      kind: "district",
   },
   {
      id: "area-san-antonio-king-william",
      municipalityId: "municipality-san-antonio-san-antonio",
      name: "King William",
      slug: "king-william",
      kind: "neighborhood",
   },
   {
      id: "area-st-louis-downtown",
      municipalityId: "municipality-st-louis-st-louis",
      name: "Downtown St. Louis",
      slug: "downtown-st-louis",
      kind: "downtown",
   },
   {
      id: "area-st-louis-central-west-end",
      municipalityId: "municipality-st-louis-st-louis",
      name: "Central West End",
      slug: "central-west-end",
      kind: "neighborhood",
   },
   {
      id: "area-st-louis-the-grove",
      municipalityId: "municipality-st-louis-st-louis",
      name: "The Grove",
      slug: "the-grove",
      kind: "district",
   },
   {
      id: "area-st-louis-soulard",
      municipalityId: "municipality-st-louis-st-louis",
      name: "Soulard",
      slug: "soulard",
      kind: "neighborhood",
   },
   {
      id: "area-tampa-downtown",
      municipalityId: "municipality-tampa-bay-tampa",
      name: "Downtown Tampa",
      slug: "downtown-tampa",
      kind: "downtown",
   },
   {
      id: "area-tampa-ybor-city",
      municipalityId: "municipality-tampa-bay-tampa",
      name: "Ybor City",
      slug: "ybor-city",
      kind: "district",
   },
   {
      id: "area-tampa-hyde-park",
      municipalityId: "municipality-tampa-bay-tampa",
      name: "Hyde Park",
      slug: "hyde-park",
      kind: "neighborhood",
   },
   {
      id: "area-tampa-seminole-heights",
      municipalityId: "municipality-tampa-bay-tampa",
      name: "Seminole Heights",
      slug: "seminole-heights",
      kind: "neighborhood",
   },
   {
      id: "area-st-petersburg-downtown",
      municipalityId: "municipality-tampa-bay-st-petersburg",
      name: "Downtown St. Petersburg",
      slug: "downtown-st-petersburg",
      kind: "downtown",
   },
   {
      id: "area-st-petersburg-central-arts",
      municipalityId: "municipality-tampa-bay-st-petersburg",
      name: "Central Arts District",
      slug: "central-arts-district",
      kind: "district",
   },
   {
      id: "area-st-petersburg-grand-central",
      municipalityId: "municipality-tampa-bay-st-petersburg",
      name: "Grand Central District",
      slug: "grand-central-district",
      kind: "district",
   },

   /* ------------------------------------------------------------------------ */
   /* E1B — restrained nationwide starting areas                               */
   /* ------------------------------------------------------------------------ */

   /* Alabama */

   {
      id: "area-birmingham-downtown",
      municipalityId: "municipality-birmingham-birmingham",
      name: "Downtown Birmingham",
      slug: "downtown-birmingham",
      kind: "downtown",
   },

   {
      id: "area-huntsville-downtown",
      municipalityId: "municipality-huntsville-huntsville",
      name: "Downtown Huntsville",
      slug: "downtown-huntsville",
      kind: "downtown",
   },

   {
      id: "area-mobile-downtown",
      municipalityId: "municipality-mobile-mobile",
      name: "Downtown Mobile",
      slug: "downtown-mobile",
      kind: "downtown",
   },

   /* Alaska */

   {
      id: "area-anchorage-downtown",
      municipalityId: "municipality-anchorage-anchorage",
      name: "Downtown Anchorage",
      slug: "downtown-anchorage",
      kind: "downtown",
   },

   {
      id: "area-juneau-downtown",
      municipalityId: "municipality-juneau-juneau",
      name: "Downtown Juneau",
      slug: "downtown-juneau",
      kind: "downtown",
   },

   /* Arizona */

   {
      id: "area-flagstaff-downtown",
      municipalityId: "municipality-flagstaff-flagstaff",
      name: "Downtown Flagstaff",
      slug: "downtown-flagstaff",
      kind: "downtown",
   },

   {
      id: "area-tucson-downtown",
      municipalityId: "municipality-tucson-tucson",
      name: "Downtown Tucson",
      slug: "downtown-tucson",
      kind: "downtown",
   },

   /* Arkansas */

   {
      id: "area-fayetteville-arkansas-downtown",
      municipalityId: "municipality-fayetteville-arkansas-fayetteville",
      name: "Downtown Fayetteville",
      slug: "downtown-fayetteville",
      kind: "downtown",
   },

   {
      id: "area-little-rock-downtown",
      municipalityId: "municipality-little-rock-little-rock",
      name: "Downtown Little Rock",
      slug: "downtown-little-rock",
      kind: "downtown",
   },

   /* California */

   {
      id: "area-fresno-downtown",
      municipalityId: "municipality-fresno-fresno",
      name: "Downtown Fresno",
      slug: "downtown-fresno",
      kind: "downtown",
   },

   {
      id: "area-monterey-downtown",
      municipalityId: "municipality-monterey-monterey",
      name: "Downtown Monterey",
      slug: "downtown-monterey",
      kind: "downtown",
   },

   {
      id: "area-napa-downtown",
      municipalityId: "municipality-napa-napa",
      name: "Downtown Napa",
      slug: "downtown-napa",
      kind: "downtown",
   },

   {
      id: "area-san-luis-obispo-downtown",
      municipalityId: "municipality-san-luis-obispo-san-luis-obispo",
      name: "Downtown San Luis Obispo",
      slug: "downtown-san-luis-obispo",
      kind: "downtown",
   },

   {
      id: "area-santa-barbara-downtown",
      municipalityId: "municipality-santa-barbara-santa-barbara",
      name: "Downtown Santa Barbara",
      slug: "downtown-santa-barbara",
      kind: "downtown",
   },

   {
      id: "area-santa-cruz-downtown",
      municipalityId: "municipality-santa-cruz-santa-cruz",
      name: "Downtown Santa Cruz",
      slug: "downtown-santa-cruz",
      kind: "downtown",
   },

   /* Colorado */

   {
      id: "area-boulder-downtown",
      municipalityId: "municipality-boulder-boulder",
      name: "Downtown Boulder",
      slug: "downtown-boulder",
      kind: "downtown",
   },

   {
      id: "area-colorado-springs-downtown",
      municipalityId: "municipality-colorado-springs-colorado-springs",
      name: "Downtown Colorado Springs",
      slug: "downtown-colorado-springs",
      kind: "downtown",
   },

   {
      id: "area-fort-collins-downtown",
      municipalityId: "municipality-fort-collins-fort-collins",
      name: "Downtown Fort Collins",
      slug: "downtown-fort-collins",
      kind: "downtown",
   },

   /* Connecticut */

   {
      id: "area-hartford-downtown",
      municipalityId: "municipality-hartford-hartford",
      name: "Downtown Hartford",
      slug: "downtown-hartford",
      kind: "downtown",
   },

   {
      id: "area-new-haven-downtown",
      municipalityId: "municipality-new-haven-new-haven",
      name: "Downtown New Haven",
      slug: "downtown-new-haven",
      kind: "downtown",
   },

   /* Delaware */

   {
      id: "area-rehoboth-beach-downtown",
      municipalityId: "municipality-rehoboth-beach-rehoboth-beach",
      name: "Downtown Rehoboth Beach",
      slug: "downtown-rehoboth-beach",
      kind: "downtown",
   },

   {
      id: "area-wilmington-delaware-downtown",
      municipalityId: "municipality-wilmington-delaware-wilmington",
      name: "Downtown Wilmington",
      slug: "downtown-wilmington",
      kind: "downtown",
   },

   /* Florida */

   {
      id: "area-key-west-downtown",
      municipalityId: "municipality-key-west-key-west",
      name: "Downtown Key West",
      slug: "downtown-key-west",
      kind: "downtown",
   },

   {
      id: "area-naples-florida-downtown",
      municipalityId: "municipality-naples-florida-naples",
      name: "Downtown Naples",
      slug: "downtown-naples",
      kind: "downtown",
   },

   {
      id: "area-pensacola-downtown",
      municipalityId: "municipality-pensacola-pensacola",
      name: "Downtown Pensacola",
      slug: "downtown-pensacola",
      kind: "downtown",
   },

   {
      id: "area-sarasota-downtown",
      municipalityId: "municipality-sarasota-sarasota",
      name: "Downtown Sarasota",
      slug: "downtown-sarasota",
      kind: "downtown",
   },

   {
      id: "area-tallahassee-downtown",
      municipalityId: "municipality-tallahassee-tallahassee",
      name: "Downtown Tallahassee",
      slug: "downtown-tallahassee",
      kind: "downtown",
   },

   {
      id: "area-west-palm-beach-downtown",
      municipalityId: "municipality-west-palm-beach-west-palm-beach",
      name: "Downtown West Palm Beach",
      slug: "downtown-west-palm-beach",
      kind: "downtown",
   },

   /* Georgia */

   {
      id: "area-athens-georgia-downtown",
      municipalityId: "municipality-athens-georgia-athens",
      name: "Downtown Athens",
      slug: "downtown-athens",
      kind: "downtown",
   },

   {
      id: "area-augusta-georgia-downtown",
      municipalityId: "municipality-augusta-georgia-augusta",
      name: "Downtown Augusta",
      slug: "downtown-augusta",
      kind: "downtown",
   },

   {
      id: "area-savannah-downtown",
      municipalityId: "municipality-savannah-savannah",
      name: "Downtown Savannah",
      slug: "downtown-savannah",
      kind: "downtown",
   },

   /* Hawaii */

   {
      id: "area-hilo-downtown",
      municipalityId: "municipality-hilo-hilo",
      name: "Downtown Hilo",
      slug: "downtown-hilo",
      kind: "downtown",
   },

   {
      id: "area-honolulu-downtown",
      municipalityId: "municipality-honolulu-honolulu",
      name: "Downtown Honolulu",
      slug: "downtown-honolulu",
      kind: "downtown",
   },

   /* Idaho */

   {
      id: "area-boise-downtown",
      municipalityId: "municipality-boise-boise",
      name: "Downtown Boise",
      slug: "downtown-boise",
      kind: "downtown",
   },

   {
      id: "area-coeur-dalene-downtown",
      municipalityId: "municipality-coeur-dalene-coeur-dalene",
      name: "Downtown Coeur d'Alene",
      slug: "downtown-coeur-dalene",
      kind: "downtown",
   },

   /* Illinois */

   {
      id: "area-champaign-downtown",
      municipalityId: "municipality-champaign-champaign",
      name: "Downtown Champaign",
      slug: "downtown-champaign",
      kind: "downtown",
   },

   {
      id: "area-peoria-downtown",
      municipalityId: "municipality-peoria-peoria",
      name: "Downtown Peoria",
      slug: "downtown-peoria",
      kind: "downtown",
   },

   {
      id: "area-springfield-illinois-downtown",
      municipalityId: "municipality-springfield-illinois-springfield",
      name: "Downtown Springfield",
      slug: "downtown-springfield",
      kind: "downtown",
   },

   /* Indiana */

   {
      id: "area-bloomington-indiana-downtown",
      municipalityId: "municipality-bloomington-indiana-bloomington",
      name: "Downtown Bloomington",
      slug: "downtown-bloomington",
      kind: "downtown",
   },

   {
      id: "area-fort-wayne-downtown",
      municipalityId: "municipality-fort-wayne-fort-wayne",
      name: "Downtown Fort Wayne",
      slug: "downtown-fort-wayne",
      kind: "downtown",
   },

   {
      id: "area-south-bend-downtown",
      municipalityId: "municipality-south-bend-south-bend",
      name: "Downtown South Bend",
      slug: "downtown-south-bend",
      kind: "downtown",
   },

   /* Iowa */

   {
      id: "area-cedar-rapids-downtown",
      municipalityId: "municipality-cedar-rapids-cedar-rapids",
      name: "Downtown Cedar Rapids",
      slug: "downtown-cedar-rapids",
      kind: "downtown",
   },

   {
      id: "area-des-moines-downtown",
      municipalityId: "municipality-des-moines-des-moines",
      name: "Downtown Des Moines",
      slug: "downtown-des-moines",
      kind: "downtown",
   },

   {
      id: "area-iowa-city-downtown",
      municipalityId: "municipality-iowa-city-iowa-city",
      name: "Downtown Iowa City",
      slug: "downtown-iowa-city",
      kind: "downtown",
   },

   /* Kansas */

   {
      id: "area-lawrence-kansas-downtown",
      municipalityId: "municipality-lawrence-kansas-lawrence",
      name: "Downtown Lawrence",
      slug: "downtown-lawrence",
      kind: "downtown",
   },

   {
      id: "area-wichita-downtown",
      municipalityId: "municipality-wichita-wichita",
      name: "Downtown Wichita",
      slug: "downtown-wichita",
      kind: "downtown",
   },

   /* Kentucky */

   {
      id: "area-lexington-kentucky-downtown",
      municipalityId: "municipality-lexington-kentucky-lexington",
      name: "Downtown Lexington",
      slug: "downtown-lexington",
      kind: "downtown",
   },

   {
      id: "area-louisville-downtown",
      municipalityId: "municipality-louisville-louisville",
      name: "Downtown Louisville",
      slug: "downtown-louisville",
      kind: "downtown",
   },

   /* Louisiana */

   {
      id: "area-baton-rouge-downtown",
      municipalityId: "municipality-baton-rouge-baton-rouge",
      name: "Downtown Baton Rouge",
      slug: "downtown-baton-rouge",
      kind: "downtown",
   },

   {
      id: "area-lafayette-louisiana-downtown",
      municipalityId: "municipality-lafayette-louisiana-lafayette",
      name: "Downtown Lafayette",
      slug: "downtown-lafayette",
      kind: "downtown",
   },

   {
      id: "area-shreveport-downtown",
      municipalityId: "municipality-shreveport-shreveport",
      name: "Downtown Shreveport",
      slug: "downtown-shreveport",
      kind: "downtown",
   },

   /* Maine */

   {
      id: "area-bangor-downtown",
      municipalityId: "municipality-bangor-bangor",
      name: "Downtown Bangor",
      slug: "downtown-bangor",
      kind: "downtown",
   },

   {
      id: "area-portland-maine-downtown",
      municipalityId: "municipality-portland-maine-portland",
      name: "Downtown Portland",
      slug: "downtown-portland",
      kind: "downtown",
   },

   /* Maryland */

   {
      id: "area-annapolis-downtown",
      municipalityId: "municipality-annapolis-annapolis",
      name: "Downtown Annapolis",
      slug: "downtown-annapolis",
      kind: "downtown",
   },

   {
      id: "area-frederick-maryland-downtown",
      municipalityId: "municipality-frederick-maryland-frederick",
      name: "Downtown Frederick",
      slug: "downtown-frederick",
      kind: "downtown",
   },

   /* Massachusetts */

   {
      id: "area-salem-massachusetts-downtown",
      municipalityId: "municipality-salem-massachusetts-salem",
      name: "Downtown Salem",
      slug: "downtown-salem",
      kind: "downtown",
   },

   {
      id: "area-springfield-massachusetts-downtown",
      municipalityId: "municipality-springfield-massachusetts-springfield",
      name: "Downtown Springfield",
      slug: "downtown-springfield",
      kind: "downtown",
   },

   {
      id: "area-worcester-downtown",
      municipalityId: "municipality-worcester-worcester",
      name: "Downtown Worcester",
      slug: "downtown-worcester",
      kind: "downtown",
   },

   /* Michigan */

   {
      id: "area-ann-arbor-downtown",
      municipalityId: "municipality-ann-arbor-ann-arbor",
      name: "Downtown Ann Arbor",
      slug: "downtown-ann-arbor",
      kind: "downtown",
   },

   {
      id: "area-grand-rapids-downtown",
      municipalityId: "municipality-grand-rapids-grand-rapids",
      name: "Downtown Grand Rapids",
      slug: "downtown-grand-rapids",
      kind: "downtown",
   },

   {
      id: "area-lansing-downtown",
      municipalityId: "municipality-lansing-lansing",
      name: "Downtown Lansing",
      slug: "downtown-lansing",
      kind: "downtown",
   },

   {
      id: "area-traverse-city-downtown",
      municipalityId: "municipality-traverse-city-traverse-city",
      name: "Downtown Traverse City",
      slug: "downtown-traverse-city",
      kind: "downtown",
   },

   /* Minnesota */

   {
      id: "area-duluth-downtown",
      municipalityId: "municipality-duluth-duluth",
      name: "Downtown Duluth",
      slug: "downtown-duluth",
      kind: "downtown",
   },

   {
      id: "area-rochester-minnesota-downtown",
      municipalityId: "municipality-rochester-minnesota-rochester",
      name: "Downtown Rochester",
      slug: "downtown-rochester",
      kind: "downtown",
   },

   /* Mississippi */

   {
      id: "area-gulfport-downtown",
      municipalityId: "municipality-gulfport-gulfport",
      name: "Downtown Gulfport",
      slug: "downtown-gulfport",
      kind: "downtown",
   },

   {
      id: "area-jackson-mississippi-downtown",
      municipalityId: "municipality-jackson-mississippi-jackson",
      name: "Downtown Jackson",
      slug: "downtown-jackson",
      kind: "downtown",
   },

   /* Missouri */

   {
      id: "area-columbia-missouri-downtown",
      municipalityId: "municipality-columbia-missouri-columbia",
      name: "Downtown Columbia",
      slug: "downtown-columbia",
      kind: "downtown",
   },

   {
      id: "area-springfield-missouri-downtown",
      municipalityId: "municipality-springfield-missouri-springfield",
      name: "Downtown Springfield",
      slug: "downtown-springfield",
      kind: "downtown",
   },

   /* Montana */

   {
      id: "area-billings-downtown",
      municipalityId: "municipality-billings-billings",
      name: "Downtown Billings",
      slug: "downtown-billings",
      kind: "downtown",
   },

   {
      id: "area-bozeman-downtown",
      municipalityId: "municipality-bozeman-bozeman",
      name: "Downtown Bozeman",
      slug: "downtown-bozeman",
      kind: "downtown",
   },

   {
      id: "area-missoula-downtown",
      municipalityId: "municipality-missoula-missoula",
      name: "Downtown Missoula",
      slug: "downtown-missoula",
      kind: "downtown",
   },

   /* Nebraska */

   {
      id: "area-lincoln-nebraska-downtown",
      municipalityId: "municipality-lincoln-nebraska-lincoln",
      name: "Downtown Lincoln",
      slug: "downtown-lincoln",
      kind: "downtown",
   },

   {
      id: "area-omaha-downtown",
      municipalityId: "municipality-omaha-omaha",
      name: "Downtown Omaha",
      slug: "downtown-omaha",
      kind: "downtown",
   },

   /* Nevada */

   {
      id: "area-carson-city-downtown",
      municipalityId: "municipality-carson-city-carson-city",
      name: "Downtown Carson City",
      slug: "downtown-carson-city",
      kind: "downtown",
   },

   {
      id: "area-reno-downtown",
      municipalityId: "municipality-reno-reno",
      name: "Downtown Reno",
      slug: "downtown-reno",
      kind: "downtown",
   },

   /* New Hampshire */

   {
      id: "area-manchester-new-hampshire-downtown",
      municipalityId: "municipality-manchester-new-hampshire-manchester",
      name: "Downtown Manchester",
      slug: "downtown-manchester",
      kind: "downtown",
   },

   {
      id: "area-portsmouth-new-hampshire-downtown",
      municipalityId: "municipality-portsmouth-new-hampshire-portsmouth",
      name: "Downtown Portsmouth",
      slug: "downtown-portsmouth",
      kind: "downtown",
   },

   /* New Jersey */

   {
      id: "area-asbury-park-downtown",
      municipalityId: "municipality-asbury-park-asbury-park",
      name: "Downtown Asbury Park",
      slug: "downtown-asbury-park",
      kind: "downtown",
   },

   {
      id: "area-atlantic-city-downtown",
      municipalityId: "municipality-atlantic-city-atlantic-city",
      name: "Downtown Atlantic City",
      slug: "downtown-atlantic-city",
      kind: "downtown",
   },

   {
      id: "area-princeton-downtown",
      municipalityId: "municipality-princeton-princeton",
      name: "Downtown Princeton",
      slug: "downtown-princeton",
      kind: "downtown",
   },

   /* New Mexico */

   {
      id: "area-albuquerque-downtown",
      municipalityId: "municipality-albuquerque-albuquerque",
      name: "Downtown Albuquerque",
      slug: "downtown-albuquerque",
      kind: "downtown",
   },

   {
      id: "area-las-cruces-downtown",
      municipalityId: "municipality-las-cruces-las-cruces",
      name: "Downtown Las Cruces",
      slug: "downtown-las-cruces",
      kind: "downtown",
   },

   {
      id: "area-santa-fe-downtown",
      municipalityId: "municipality-santa-fe-santa-fe",
      name: "Downtown Santa Fe",
      slug: "downtown-santa-fe",
      kind: "downtown",
   },

   /* New York */

   {
      id: "area-albany-new-york-downtown",
      municipalityId: "municipality-albany-new-york-albany",
      name: "Downtown Albany",
      slug: "downtown-albany",
      kind: "downtown",
   },

   {
      id: "area-ithaca-downtown",
      municipalityId: "municipality-ithaca-ithaca",
      name: "Downtown Ithaca",
      slug: "downtown-ithaca",
      kind: "downtown",
   },

   {
      id: "area-rochester-new-york-downtown",
      municipalityId: "municipality-rochester-new-york-rochester",
      name: "Downtown Rochester",
      slug: "downtown-rochester",
      kind: "downtown",
   },

   {
      id: "area-syracuse-downtown",
      municipalityId: "municipality-syracuse-syracuse",
      name: "Downtown Syracuse",
      slug: "downtown-syracuse",
      kind: "downtown",
   },

   /* North Carolina */

   {
      id: "area-asheville-downtown",
      municipalityId: "municipality-asheville-asheville",
      name: "Downtown Asheville",
      slug: "downtown-asheville",
      kind: "downtown",
   },

   {
      id: "area-greensboro-downtown",
      municipalityId: "municipality-greensboro-greensboro",
      name: "Downtown Greensboro",
      slug: "downtown-greensboro",
      kind: "downtown",
   },

   {
      id: "area-wilmington-north-carolina-downtown",
      municipalityId: "municipality-wilmington-north-carolina-wilmington",
      name: "Downtown Wilmington",
      slug: "downtown-wilmington",
      kind: "downtown",
   },

   /* North Dakota */

   {
      id: "area-bismarck-downtown",
      municipalityId: "municipality-bismarck-bismarck",
      name: "Downtown Bismarck",
      slug: "downtown-bismarck",
      kind: "downtown",
   },

   {
      id: "area-fargo-downtown",
      municipalityId: "municipality-fargo-fargo",
      name: "Downtown Fargo",
      slug: "downtown-fargo",
      kind: "downtown",
   },

   /* Ohio */

   {
      id: "area-akron-downtown",
      municipalityId: "municipality-akron-akron",
      name: "Downtown Akron",
      slug: "downtown-akron",
      kind: "downtown",
   },

   {
      id: "area-dayton-downtown",
      municipalityId: "municipality-dayton-dayton",
      name: "Downtown Dayton",
      slug: "downtown-dayton",
      kind: "downtown",
   },

   {
      id: "area-toledo-downtown",
      municipalityId: "municipality-toledo-toledo",
      name: "Downtown Toledo",
      slug: "downtown-toledo",
      kind: "downtown",
   },

   /* Oklahoma */

   {
      id: "area-norman-downtown",
      municipalityId: "municipality-norman-norman",
      name: "Downtown Norman",
      slug: "downtown-norman",
      kind: "downtown",
   },

   {
      id: "area-tulsa-downtown",
      municipalityId: "municipality-tulsa-tulsa",
      name: "Downtown Tulsa",
      slug: "downtown-tulsa",
      kind: "downtown",
   },

   /* Oregon */

   {
      id: "area-bend-downtown",
      municipalityId: "municipality-bend-bend",
      name: "Downtown Bend",
      slug: "downtown-bend",
      kind: "downtown",
   },

   {
      id: "area-eugene-downtown",
      municipalityId: "municipality-eugene-eugene",
      name: "Downtown Eugene",
      slug: "downtown-eugene",
      kind: "downtown",
   },

   {
      id: "area-salem-oregon-downtown",
      municipalityId: "municipality-salem-oregon-salem",
      name: "Downtown Salem",
      slug: "downtown-salem",
      kind: "downtown",
   },

   /* Pennsylvania */

   {
      id: "area-allentown-pennsylvania-downtown",
      municipalityId: "municipality-allentown-pennsylvania-allentown",
      name: "Downtown Allentown",
      slug: "downtown-allentown",
      kind: "downtown",
   },

   {
      id: "area-harrisburg-downtown",
      municipalityId: "municipality-harrisburg-harrisburg",
      name: "Downtown Harrisburg",
      slug: "downtown-harrisburg",
      kind: "downtown",
   },

   {
      id: "area-lancaster-pennsylvania-downtown",
      municipalityId: "municipality-lancaster-pennsylvania-lancaster",
      name: "Downtown Lancaster",
      slug: "downtown-lancaster",
      kind: "downtown",
   },

   {
      id: "area-state-college-downtown",
      municipalityId: "municipality-state-college-state-college",
      name: "Downtown State College",
      slug: "downtown-state-college",
      kind: "downtown",
   },

   /* Rhode Island */

   {
      id: "area-newport-rhode-island-downtown",
      municipalityId: "municipality-newport-rhode-island-newport",
      name: "Downtown Newport",
      slug: "downtown-newport",
      kind: "downtown",
   },

   {
      id: "area-providence-downtown",
      municipalityId: "municipality-providence-providence",
      name: "Downtown Providence",
      slug: "downtown-providence",
      kind: "downtown",
   },

   /* South Carolina */

   {
      id: "area-charleston-south-carolina-downtown",
      municipalityId: "municipality-charleston-south-carolina-charleston",
      name: "Downtown Charleston",
      slug: "downtown-charleston",
      kind: "downtown",
   },

   {
      id: "area-columbia-south-carolina-downtown",
      municipalityId: "municipality-columbia-south-carolina-columbia",
      name: "Downtown Columbia",
      slug: "downtown-columbia",
      kind: "downtown",
   },

   {
      id: "area-greenville-south-carolina-downtown",
      municipalityId: "municipality-greenville-south-carolina-greenville",
      name: "Downtown Greenville",
      slug: "downtown-greenville",
      kind: "downtown",
   },

   /* South Dakota */

   {
      id: "area-rapid-city-downtown",
      municipalityId: "municipality-rapid-city-rapid-city",
      name: "Downtown Rapid City",
      slug: "downtown-rapid-city",
      kind: "downtown",
   },

   {
      id: "area-sioux-falls-downtown",
      municipalityId: "municipality-sioux-falls-sioux-falls",
      name: "Downtown Sioux Falls",
      slug: "downtown-sioux-falls",
      kind: "downtown",
   },

   /* Tennessee */

   {
      id: "area-chattanooga-downtown",
      municipalityId: "municipality-chattanooga-chattanooga",
      name: "Downtown Chattanooga",
      slug: "downtown-chattanooga",
      kind: "downtown",
   },

   {
      id: "area-knoxville-downtown",
      municipalityId: "municipality-knoxville-knoxville",
      name: "Downtown Knoxville",
      slug: "downtown-knoxville",
      kind: "downtown",
   },

   /* Texas */

   {
      id: "area-amarillo-downtown",
      municipalityId: "municipality-amarillo-amarillo",
      name: "Downtown Amarillo",
      slug: "downtown-amarillo",
      kind: "downtown",
   },

   {
      id: "area-corpus-christi-downtown",
      municipalityId: "municipality-corpus-christi-corpus-christi",
      name: "Downtown Corpus Christi",
      slug: "downtown-corpus-christi",
      kind: "downtown",
   },

   {
      id: "area-el-paso-downtown",
      municipalityId: "municipality-el-paso-el-paso",
      name: "Downtown El Paso",
      slug: "downtown-el-paso",
      kind: "downtown",
   },

   {
      id: "area-lubbock-downtown",
      municipalityId: "municipality-lubbock-lubbock",
      name: "Downtown Lubbock",
      slug: "downtown-lubbock",
      kind: "downtown",
   },

   {
      id: "area-mcallen-downtown",
      municipalityId: "municipality-mcallen-mcallen",
      name: "Downtown McAllen",
      slug: "downtown-mcallen",
      kind: "downtown",
   },

   {
      id: "area-waco-downtown",
      municipalityId: "municipality-waco-waco",
      name: "Downtown Waco",
      slug: "downtown-waco",
      kind: "downtown",
   },

   /* Utah */

   {
      id: "area-park-city-downtown",
      municipalityId: "municipality-park-city-park-city",
      name: "Downtown Park City",
      slug: "downtown-park-city",
      kind: "downtown",
   },

   {
      id: "area-provo-downtown",
      municipalityId: "municipality-provo-provo",
      name: "Downtown Provo",
      slug: "downtown-provo",
      kind: "downtown",
   },

   {
      id: "area-st-george-downtown",
      municipalityId: "municipality-st-george-st-george",
      name: "Downtown St. George",
      slug: "downtown-st-george",
      kind: "downtown",
   },

   /* Vermont */

   {
      id: "area-burlington-vermont-downtown",
      municipalityId: "municipality-burlington-vermont-burlington",
      name: "Downtown Burlington",
      slug: "downtown-burlington",
      kind: "downtown",
   },

   {
      id: "area-montpelier-downtown",
      municipalityId: "municipality-montpelier-montpelier",
      name: "Downtown Montpelier",
      slug: "downtown-montpelier",
      kind: "downtown",
   },

   /* Virginia */

   {
      id: "area-charlottesville-downtown",
      municipalityId: "municipality-charlottesville-charlottesville",
      name: "Downtown Charlottesville",
      slug: "downtown-charlottesville",
      kind: "downtown",
   },

   {
      id: "area-richmond-virginia-downtown",
      municipalityId: "municipality-richmond-virginia-richmond",
      name: "Downtown Richmond",
      slug: "downtown-richmond",
      kind: "downtown",
   },

   {
      id: "area-virginia-beach-downtown",
      municipalityId: "municipality-virginia-beach-virginia-beach",
      name: "Downtown Virginia Beach",
      slug: "downtown-virginia-beach",
      kind: "downtown",
   },

   /* Washington */

   {
      id: "area-bellingham-downtown",
      municipalityId: "municipality-bellingham-bellingham",
      name: "Downtown Bellingham",
      slug: "downtown-bellingham",
      kind: "downtown",
   },

   {
      id: "area-olympia-downtown",
      municipalityId: "municipality-olympia-olympia",
      name: "Downtown Olympia",
      slug: "downtown-olympia",
      kind: "downtown",
   },

   {
      id: "area-spokane-downtown",
      municipalityId: "municipality-spokane-spokane",
      name: "Downtown Spokane",
      slug: "downtown-spokane",
      kind: "downtown",
   },

   /* West Virginia */

   {
      id: "area-charleston-west-virginia-downtown",
      municipalityId: "municipality-charleston-west-virginia-charleston",
      name: "Downtown Charleston",
      slug: "downtown-charleston",
      kind: "downtown",
   },

   {
      id: "area-morgantown-downtown",
      municipalityId: "municipality-morgantown-morgantown",
      name: "Downtown Morgantown",
      slug: "downtown-morgantown",
      kind: "downtown",
   },

   /* Wisconsin */

   {
      id: "area-eau-claire-downtown",
      municipalityId: "municipality-eau-claire-eau-claire",
      name: "Downtown Eau Claire",
      slug: "downtown-eau-claire",
      kind: "downtown",
   },

   {
      id: "area-madison-wisconsin-downtown",
      municipalityId: "municipality-madison-wisconsin-madison",
      name: "Downtown Madison",
      slug: "downtown-madison",
      kind: "downtown",
   },

   /* Wyoming */

   {
      id: "area-cheyenne-downtown",
      municipalityId: "municipality-cheyenne-cheyenne",
      name: "Downtown Cheyenne",
      slug: "downtown-cheyenne",
      kind: "downtown",
   },

   {
      id: "area-jackson-wyoming-downtown",
      municipalityId: "municipality-jackson-wyoming-jackson",
      name: "Downtown Jackson",
      slug: "downtown-jackson",
      kind: "downtown",
   },


   /* ======================================================================== */
   /* E1C — U.S. Neighborhood Depth                                            */
   /* ======================================================================== */

   /**
    * E1C adds only local areas where choosing the area meaningfully changes
    * the character of a Sidewalk day. These are editorial discovery anchors,
    * not an attempt to catalog every named neighborhood in each metro.
    */

   /* New York City */

   {
      id: "area-e1c-new-york-new-york-city-soho",
      municipalityId: "municipality-new-york-new-york-city",
      name: "SoHo",
      slug: "soho",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-new-york-new-york-city-east-village",
      municipalityId: "municipality-new-york-new-york-city",
      name: "East Village",
      slug: "east-village",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-new-york-new-york-city-chelsea",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Chelsea",
      slug: "chelsea",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-new-york-new-york-city-dumbo",
      municipalityId: "municipality-new-york-new-york-city",
      name: "DUMBO",
      slug: "dumbo",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-new-york-new-york-city-long-island-city",
      municipalityId: "municipality-new-york-new-york-city",
      name: "Long Island City",
      slug: "long-island-city",
      kind: "neighborhood",
   },

   /* Los Angeles */

   {
      id: "area-e1c-los-angeles-los-angeles-arts-district",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Arts District",
      slug: "arts-district",
      kind: "district",
   },
   {
      id: "area-e1c-los-angeles-los-angeles-highland-park",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Highland Park",
      slug: "highland-park",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-los-angeles-los-angeles-hollywood",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Hollywood",
      slug: "hollywood",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-los-angeles-los-angeles-atwater-village",
      municipalityId: "municipality-los-angeles-los-angeles",
      name: "Atwater Village",
      slug: "atwater-village",
      kind: "neighborhood",
   },

   /* San Francisco */

   {
      id: "area-e1c-bay-area-san-francisco-chinatown",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Chinatown",
      slug: "chinatown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-bay-area-san-francisco-the-castro",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "The Castro",
      slug: "the-castro",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-bay-area-san-francisco-dogpatch",
      municipalityId: "municipality-bay-area-san-francisco",
      name: "Dogpatch",
      slug: "dogpatch",
      kind: "neighborhood",
   },

   /* Oakland */

   {
      id: "area-e1c-bay-area-oakland-grand-lake",
      municipalityId: "municipality-bay-area-oakland",
      name: "Grand Lake",
      slug: "grand-lake",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-bay-area-oakland-piedmont-avenue",
      municipalityId: "municipality-bay-area-oakland",
      name: "Piedmont Avenue",
      slug: "piedmont-avenue",
      kind: "district",
   },

   /* Chicago */

   {
      id: "area-e1c-chicago-chicago-river-north",
      municipalityId: "municipality-chicago-chicago",
      name: "River North",
      slug: "river-north",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-chicago-chicago-lincoln-park",
      municipalityId: "municipality-chicago-chicago",
      name: "Lincoln Park",
      slug: "lincoln-park",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-chicago-chicago-chinatown",
      municipalityId: "municipality-chicago-chicago",
      name: "Chinatown",
      slug: "chinatown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-chicago-chicago-ukrainian-village",
      municipalityId: "municipality-chicago-chicago",
      name: "Ukrainian Village",
      slug: "ukrainian-village",
      kind: "neighborhood",
   },

   /* Boston */

   {
      id: "area-e1c-boston-boston-fenway",
      municipalityId: "municipality-boston-boston",
      name: "Fenway",
      slug: "fenway",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-boston-boston-jamaica-plain",
      municipalityId: "municipality-boston-boston",
      name: "Jamaica Plain",
      slug: "jamaica-plain",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-boston-boston-charlestown",
      municipalityId: "municipality-boston-boston",
      name: "Charlestown",
      slug: "charlestown",
      kind: "neighborhood",
   },

   /* Cambridge */

   {
      id: "area-e1c-boston-cambridge-porter-square",
      municipalityId: "municipality-boston-cambridge",
      name: "Porter Square",
      slug: "porter-square",
      kind: "district",
   },

   /* Seattle */

   {
      id: "area-e1c-seattle-seattle-belltown",
      municipalityId: "municipality-seattle-seattle",
      name: "Belltown",
      slug: "belltown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-seattle-seattle-chinatown-international-district",
      municipalityId: "municipality-seattle-seattle",
      name: "Chinatown–International District",
      slug: "chinatown-international-district",
      kind: "district",
   },
   {
      id: "area-e1c-seattle-seattle-georgetown",
      municipalityId: "municipality-seattle-seattle",
      name: "Georgetown",
      slug: "georgetown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-seattle-seattle-west-seattle-junction",
      municipalityId: "municipality-seattle-seattle",
      name: "West Seattle Junction",
      slug: "west-seattle-junction",
      kind: "district",
   },

   /* Portland */

   {
      id: "area-e1c-portland-portland-nob-hill",
      municipalityId: "municipality-portland-portland",
      name: "Nob Hill",
      slug: "nob-hill",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-portland-portland-division-clinton",
      municipalityId: "municipality-portland-portland",
      name: "Division–Clinton",
      slug: "division-clinton",
      kind: "district",
   },
   {
      id: "area-e1c-portland-portland-st-johns",
      municipalityId: "municipality-portland-portland",
      name: "St. Johns",
      slug: "st-johns",
      kind: "neighborhood",
   },

   /* Austin */

   {
      id: "area-e1c-austin-austin-south-lamar",
      municipalityId: "municipality-austin-austin",
      name: "South Lamar",
      slug: "south-lamar",
      kind: "district",
   },
   {
      id: "area-e1c-austin-austin-north-loop",
      municipalityId: "municipality-austin-austin",
      name: "North Loop",
      slug: "north-loop",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-austin-austin-clarksville",
      municipalityId: "municipality-austin-austin",
      name: "Clarksville",
      slug: "clarksville",
      kind: "neighborhood",
   },

   /* Dallas */

   {
      id: "area-e1c-dfw-dallas-oak-lawn",
      municipalityId: "municipality-dfw-dallas",
      name: "Oak Lawn",
      slug: "oak-lawn",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-dfw-dallas-knox-henderson",
      municipalityId: "municipality-dfw-dallas",
      name: "Knox–Henderson",
      slug: "knox-henderson",
      kind: "district",
   },
   {
      id: "area-e1c-dfw-dallas-the-cedars",
      municipalityId: "municipality-dfw-dallas",
      name: "The Cedars",
      slug: "the-cedars",
      kind: "neighborhood",
   },

   /* Houston */

   {
      id: "area-e1c-houston-houston-midtown",
      municipalityId: "municipality-houston-houston",
      name: "Midtown",
      slug: "midtown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-houston-houston-third-ward",
      municipalityId: "municipality-houston-houston",
      name: "Third Ward",
      slug: "third-ward",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-houston-houston-upper-kirby",
      municipalityId: "municipality-houston-houston",
      name: "Upper Kirby",
      slug: "upper-kirby",
      kind: "district",
   },

   /* Miami */

   {
      id: "area-e1c-miami-miami-little-haiti",
      municipalityId: "municipality-miami-miami",
      name: "Little Haiti",
      slug: "little-haiti",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-miami-miami-midtown-miami",
      municipalityId: "municipality-miami-miami",
      name: "Midtown Miami",
      slug: "midtown-miami",
      kind: "district",
   },
   {
      id: "area-e1c-miami-miami-mimo-district",
      municipalityId: "municipality-miami-miami",
      name: "MiMo District",
      slug: "mimo-district",
      kind: "district",
   },

   /* Miami Beach */

   {
      id: "area-e1c-miami-miami-beach-mid-beach",
      municipalityId: "municipality-miami-miami-beach",
      name: "Mid-Beach",
      slug: "mid-beach",
      kind: "neighborhood",
   },

   /* Washington */

   {
      id: "area-e1c-dc-washington-adams-morgan",
      municipalityId: "municipality-dc-washington",
      name: "Adams Morgan",
      slug: "adams-morgan",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-dc-washington-u-street",
      municipalityId: "municipality-dc-washington",
      name: "U Street",
      slug: "u-street",
      kind: "district",
   },
   {
      id: "area-e1c-dc-washington-navy-yard",
      municipalityId: "municipality-dc-washington",
      name: "Navy Yard",
      slug: "navy-yard",
      kind: "neighborhood",
   },

   /* Philadelphia */

   {
      id: "area-e1c-philadelphia-philadelphia-rittenhouse-square",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Rittenhouse Square",
      slug: "rittenhouse-square",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-philadelphia-philadelphia-northern-liberties",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "Northern Liberties",
      slug: "northern-liberties",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-philadelphia-philadelphia-east-passyunk",
      municipalityId: "municipality-philadelphia-philadelphia",
      name: "East Passyunk",
      slug: "east-passyunk",
      kind: "district",
   },

   /* Denver */

   {
      id: "area-e1c-denver-denver-baker",
      municipalityId: "municipality-denver-denver",
      name: "Baker",
      slug: "baker",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-denver-denver-south-broadway",
      municipalityId: "municipality-denver-denver",
      name: "South Broadway",
      slug: "south-broadway",
      kind: "district",
   },
   {
      id: "area-e1c-denver-denver-city-park-west",
      municipalityId: "municipality-denver-denver",
      name: "City Park West",
      slug: "city-park-west",
      kind: "neighborhood",
   },

   /* Atlanta */

   {
      id: "area-e1c-atlanta-atlanta-little-five-points",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Little Five Points",
      slug: "little-five-points",
      kind: "district",
   },
   {
      id: "area-e1c-atlanta-atlanta-grant-park",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Grant Park",
      slug: "grant-park",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-atlanta-atlanta-cabbagetown",
      municipalityId: "municipality-atlanta-atlanta",
      name: "Cabbagetown",
      slug: "cabbagetown",
      kind: "neighborhood",
   },

   /* New Orleans */

   {
      id: "area-e1c-new-orleans-new-orleans-bywater",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Bywater",
      slug: "bywater",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-new-orleans-new-orleans-uptown",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Uptown",
      slug: "uptown",
      kind: "area",
   },
   {
      id: "area-e1c-new-orleans-new-orleans-warehouse-district",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Warehouse District",
      slug: "warehouse-district",
      kind: "district",
   },
   {
      id: "area-e1c-new-orleans-new-orleans-mid-city",
      municipalityId: "municipality-new-orleans-new-orleans",
      name: "Mid-City",
      slug: "mid-city",
      kind: "neighborhood",
   },

   /* Nashville */

   {
      id: "area-e1c-nashville-nashville-hillsboro-village",
      municipalityId: "municipality-nashville-nashville",
      name: "Hillsboro Village",
      slug: "hillsboro-village",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-nashville-nashville-sylvan-park",
      municipalityId: "municipality-nashville-nashville",
      name: "Sylvan Park",
      slug: "sylvan-park",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-nashville-nashville-belmont-hillsboro",
      municipalityId: "municipality-nashville-nashville",
      name: "Belmont–Hillsboro",
      slug: "belmont-hillsboro",
      kind: "neighborhood",
   },

   /* Minneapolis */

   {
      id: "area-e1c-twin-cities-minneapolis-lyn-lake",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "Lyn-Lake",
      slug: "lyn-lake",
      kind: "district",
   },
   {
      id: "area-e1c-twin-cities-minneapolis-whittier",
      municipalityId: "municipality-twin-cities-minneapolis",
      name: "Whittier",
      slug: "whittier",
      kind: "neighborhood",
   },

   /* Saint Paul */

   {
      id: "area-e1c-twin-cities-saint-paul-west-seventh",
      municipalityId: "municipality-twin-cities-saint-paul",
      name: "West Seventh",
      slug: "west-seventh",
      kind: "neighborhood",
   },

   /* Detroit */

   {
      id: "area-e1c-detroit-detroit-new-center",
      municipalityId: "municipality-detroit-detroit",
      name: "New Center",
      slug: "new-center",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-detroit-detroit-mexicantown",
      municipalityId: "municipality-detroit-detroit",
      name: "Mexicantown",
      slug: "mexicantown",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-detroit-detroit-west-village",
      municipalityId: "municipality-detroit-detroit",
      name: "West Village",
      slug: "west-village",
      kind: "neighborhood",
   },

   /* Charlotte */

   {
      id: "area-e1c-charlotte-charlotte-dilworth",
      municipalityId: "municipality-charlotte-charlotte",
      name: "Dilworth",
      slug: "dilworth",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-charlotte-charlotte-optimist-park",
      municipalityId: "municipality-charlotte-charlotte",
      name: "Optimist Park",
      slug: "optimist-park",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-charlotte-charlotte-elizabeth",
      municipalityId: "municipality-charlotte-charlotte",
      name: "Elizabeth",
      slug: "elizabeth",
      kind: "neighborhood",
   },

   /* Raleigh */

   {
      id: "area-e1c-raleigh-durham-raleigh-boylan-heights",
      municipalityId: "municipality-raleigh-durham-raleigh",
      name: "Boylan Heights",
      slug: "boylan-heights",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-raleigh-durham-raleigh-village-district",
      municipalityId: "municipality-raleigh-durham-raleigh",
      name: "Village District",
      slug: "village-district",
      kind: "district",
   },

   /* Durham */

   {
      id: "area-e1c-raleigh-durham-durham-brightleaf",
      municipalityId: "municipality-raleigh-durham-durham",
      name: "Brightleaf",
      slug: "brightleaf",
      kind: "district",
   },

   /* Charleston */

   {
      id: "area-e1c-charleston-south-carolina-charleston-french-quarter",
      municipalityId: "municipality-charleston-south-carolina-charleston",
      name: "French Quarter",
      slug: "french-quarter",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-charleston-south-carolina-charleston-cannonborough-elliotborough",
      municipalityId: "municipality-charleston-south-carolina-charleston",
      name: "Cannonborough–Elliotborough",
      slug: "cannonborough-elliotborough",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-charleston-south-carolina-charleston-upper-king",
      municipalityId: "municipality-charleston-south-carolina-charleston",
      name: "Upper King",
      slug: "upper-king",
      kind: "district",
   },
   {
      id: "area-e1c-charleston-south-carolina-charleston-west-ashley",
      municipalityId: "municipality-charleston-south-carolina-charleston",
      name: "West Ashley",
      slug: "west-ashley",
      kind: "area",
   },

   /* Savannah */

   {
      id: "area-e1c-savannah-savannah-starland-district",
      municipalityId: "municipality-savannah-savannah",
      name: "Starland District",
      slug: "starland-district",
      kind: "district",
   },
   {
      id: "area-e1c-savannah-savannah-victorian-district",
      municipalityId: "municipality-savannah-savannah",
      name: "Victorian District",
      slug: "victorian-district",
      kind: "district",
   },
   {
      id: "area-e1c-savannah-savannah-historic-river-street",
      municipalityId: "municipality-savannah-savannah",
      name: "Historic River Street",
      slug: "historic-river-street",
      kind: "district",
   },

   /* Honolulu */

   {
      id: "area-e1c-honolulu-honolulu-waikiki",
      municipalityId: "municipality-honolulu-honolulu",
      name: "Waikiki",
      slug: "waikiki",
      kind: "area",
   },
   {
      id: "area-e1c-honolulu-honolulu-kakaako",
      municipalityId: "municipality-honolulu-honolulu",
      name: "Kakaako",
      slug: "kakaako",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-honolulu-honolulu-ala-moana",
      municipalityId: "municipality-honolulu-honolulu",
      name: "Ala Moana",
      slug: "ala-moana",
      kind: "area",
   },
   {
      id: "area-e1c-honolulu-honolulu-kaimuki",
      municipalityId: "municipality-honolulu-honolulu",
      name: "Kaimuki",
      slug: "kaimuki",
      kind: "neighborhood",
   },

   /* Salt Lake City */

   {
      id: "area-e1c-salt-lake-city-salt-lake-city-9th-and-9th",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "9th & 9th",
      slug: "9th-and-9th",
      kind: "district",
   },
   {
      id: "area-e1c-salt-lake-city-salt-lake-city-marmalade-district",
      municipalityId: "municipality-salt-lake-city-salt-lake-city",
      name: "Marmalade District",
      slug: "marmalade-district",
      kind: "district",
   },

   /* Park City */

   {
      id: "area-e1c-park-city-park-city-prospector",
      municipalityId: "municipality-park-city-park-city",
      name: "Prospector",
      slug: "prospector",
      kind: "area",
   },
   {
      id: "area-e1c-park-city-park-city-deer-valley",
      municipalityId: "municipality-park-city-park-city",
      name: "Deer Valley",
      slug: "deer-valley",
      kind: "area",
   },
   {
      id: "area-e1c-park-city-park-city-canyons-village",
      municipalityId: "municipality-park-city-park-city",
      name: "Canyons Village",
      slug: "canyons-village",
      kind: "area",
   },

   /* Asheville */

   {
      id: "area-e1c-asheville-asheville-river-arts-district",
      municipalityId: "municipality-asheville-asheville",
      name: "River Arts District",
      slug: "river-arts-district",
      kind: "district",
   },
   {
      id: "area-e1c-asheville-asheville-west-asheville",
      municipalityId: "municipality-asheville-asheville",
      name: "West Asheville",
      slug: "west-asheville",
      kind: "area",
   },
   {
      id: "area-e1c-asheville-asheville-south-slope",
      municipalityId: "municipality-asheville-asheville",
      name: "South Slope",
      slug: "south-slope",
      kind: "district",
   },

   /* Santa Fe */

   {
      id: "area-e1c-santa-fe-santa-fe-railyard-district",
      municipalityId: "municipality-santa-fe-santa-fe",
      name: "Railyard District",
      slug: "railyard-district",
      kind: "district",
   },
   {
      id: "area-e1c-santa-fe-santa-fe-canyon-road",
      municipalityId: "municipality-santa-fe-santa-fe",
      name: "Canyon Road",
      slug: "canyon-road",
      kind: "district",
   },
   {
      id: "area-e1c-santa-fe-santa-fe-guadalupe-district",
      municipalityId: "municipality-santa-fe-santa-fe",
      name: "Guadalupe District",
      slug: "guadalupe-district",
      kind: "district",
   },

   /* Portland, Maine */

   {
      id: "area-e1c-portland-maine-portland-old-port",
      municipalityId: "municipality-portland-maine-portland",
      name: "Old Port",
      slug: "old-port",
      kind: "district",
   },
   {
      id: "area-e1c-portland-maine-portland-arts-district",
      municipalityId: "municipality-portland-maine-portland",
      name: "Arts District",
      slug: "arts-district",
      kind: "district",
   },
   {
      id: "area-e1c-portland-maine-portland-east-end",
      municipalityId: "municipality-portland-maine-portland",
      name: "East End",
      slug: "east-end",
      kind: "neighborhood",
   },

   /* Providence */

   {
      id: "area-e1c-providence-providence-federal-hill",
      municipalityId: "municipality-providence-providence",
      name: "Federal Hill",
      slug: "federal-hill",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-providence-providence-college-hill",
      municipalityId: "municipality-providence-providence",
      name: "College Hill",
      slug: "college-hill",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-providence-providence-fox-point",
      municipalityId: "municipality-providence-providence",
      name: "Fox Point",
      slug: "fox-point",
      kind: "neighborhood",
   },

   /* Boise */

   {
      id: "area-e1c-boise-boise-hyde-park",
      municipalityId: "municipality-boise-boise",
      name: "Hyde Park",
      slug: "hyde-park",
      kind: "district",
   },
   {
      id: "area-e1c-boise-boise-boise-bench",
      municipalityId: "municipality-boise-boise",
      name: "Boise Bench",
      slug: "boise-bench",
      kind: "area",
   },

   /* Louisville */

   {
      id: "area-e1c-louisville-louisville-nulu",
      municipalityId: "municipality-louisville-louisville",
      name: "NuLu",
      slug: "nulu",
      kind: "district",
   },
   {
      id: "area-e1c-louisville-louisville-the-highlands",
      municipalityId: "municipality-louisville-louisville",
      name: "The Highlands",
      slug: "the-highlands",
      kind: "area",
   },
   {
      id: "area-e1c-louisville-louisville-germantown",
      municipalityId: "municipality-louisville-louisville",
      name: "Germantown",
      slug: "germantown",
      kind: "neighborhood",
   },

   /* Albuquerque */

   {
      id: "area-e1c-albuquerque-albuquerque-old-town",
      municipalityId: "municipality-albuquerque-albuquerque",
      name: "Old Town",
      slug: "old-town",
      kind: "district",
   },
   {
      id: "area-e1c-albuquerque-albuquerque-nob-hill",
      municipalityId: "municipality-albuquerque-albuquerque",
      name: "Nob Hill",
      slug: "nob-hill",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-albuquerque-albuquerque-sawmill-district",
      municipalityId: "municipality-albuquerque-albuquerque",
      name: "Sawmill District",
      slug: "sawmill-district",
      kind: "district",
   },

   /* Richmond */

   {
      id: "area-e1c-richmond-virginia-richmond-the-fan",
      municipalityId: "municipality-richmond-virginia-richmond",
      name: "The Fan",
      slug: "the-fan",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-richmond-virginia-richmond-carytown",
      municipalityId: "municipality-richmond-virginia-richmond",
      name: "Carytown",
      slug: "carytown",
      kind: "district",
   },
   {
      id: "area-e1c-richmond-virginia-richmond-scotts-addition",
      municipalityId: "municipality-richmond-virginia-richmond",
      name: "Scott's Addition",
      slug: "scotts-addition",
      kind: "neighborhood",
   },

   /* Tucson */

   {
      id: "area-e1c-tucson-tucson-fourth-avenue",
      municipalityId: "municipality-tucson-tucson",
      name: "Fourth Avenue",
      slug: "fourth-avenue",
      kind: "district",
   },
   {
      id: "area-e1c-tucson-tucson-barrio-viejo",
      municipalityId: "municipality-tucson-tucson",
      name: "Barrio Viejo",
      slug: "barrio-viejo",
      kind: "neighborhood",
   },

   /* Monterey */

   {
      id: "area-e1c-monterey-monterey-cannery-row",
      municipalityId: "municipality-monterey-monterey",
      name: "Cannery Row",
      slug: "cannery-row",
      kind: "district",
   },
   {
      id: "area-e1c-monterey-monterey-new-monterey",
      municipalityId: "municipality-monterey-monterey",
      name: "New Monterey",
      slug: "new-monterey",
      kind: "neighborhood",
   },

   /* Santa Barbara */

   {
      id: "area-e1c-santa-barbara-santa-barbara-funk-zone",
      municipalityId: "municipality-santa-barbara-santa-barbara",
      name: "Funk Zone",
      slug: "funk-zone",
      kind: "district",
   },
   {
      id: "area-e1c-santa-barbara-santa-barbara-waterfront",
      municipalityId: "municipality-santa-barbara-santa-barbara",
      name: "Waterfront",
      slug: "waterfront",
      kind: "area",
   },

   /* Key West */

   {
      id: "area-e1c-key-west-key-west-bahama-village",
      municipalityId: "municipality-key-west-key-west",
      name: "Bahama Village",
      slug: "bahama-village",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-key-west-key-west-historic-seaport",
      municipalityId: "municipality-key-west-key-west",
      name: "Historic Seaport",
      slug: "historic-seaport",
      kind: "district",
   },

   /* Anchorage */

   {
      id: "area-e1c-anchorage-anchorage-spenard",
      municipalityId: "municipality-anchorage-anchorage",
      name: "Spenard",
      slug: "spenard",
      kind: "neighborhood",
   },
   {
      id: "area-e1c-anchorage-anchorage-south-addition",
      municipalityId: "municipality-anchorage-anchorage",
      name: "South Addition",
      slug: "south-addition",
      kind: "neighborhood",
   },

   /* E1D — Toronto */
   { id: "area-e1d-toronto-downtown", municipalityId: "municipality-toronto-toronto", name: "Downtown", slug: "downtown", kind: "downtown" },
   { id: "area-e1d-toronto-kensington-market", municipalityId: "municipality-toronto-toronto", name: "Kensington Market", slug: "kensington-market", kind: "district" },
   { id: "area-e1d-toronto-queen-west", municipalityId: "municipality-toronto-toronto", name: "Queen West", slug: "queen-west", kind: "district" },
   { id: "area-e1d-toronto-yorkville", municipalityId: "municipality-toronto-toronto", name: "Yorkville", slug: "yorkville", kind: "neighborhood" },
   { id: "area-e1d-toronto-distillery-district", municipalityId: "municipality-toronto-toronto", name: "Distillery District", slug: "distillery-district", kind: "district" },

   /* E1D — Vancouver */
   { id: "area-e1d-vancouver-downtown", municipalityId: "municipality-vancouver-canada-vancouver", name: "Downtown", slug: "downtown", kind: "downtown" },
   { id: "area-e1d-vancouver-gastown", municipalityId: "municipality-vancouver-canada-vancouver", name: "Gastown", slug: "gastown", kind: "district" },
   { id: "area-e1d-vancouver-yaletown", municipalityId: "municipality-vancouver-canada-vancouver", name: "Yaletown", slug: "yaletown", kind: "neighborhood" },
   { id: "area-e1d-vancouver-kitsilano", municipalityId: "municipality-vancouver-canada-vancouver", name: "Kitsilano", slug: "kitsilano", kind: "neighborhood" },
   { id: "area-e1d-vancouver-mount-pleasant", municipalityId: "municipality-vancouver-canada-vancouver", name: "Mount Pleasant", slug: "mount-pleasant", kind: "neighborhood" },

   /* E1D — Montreal */
   { id: "area-e1d-montreal-old-montreal", municipalityId: "municipality-montreal-montreal", name: "Old Montreal", slug: "old-montreal", kind: "district" },
   { id: "area-e1d-montreal-plateau-mont-royal", municipalityId: "municipality-montreal-montreal", name: "Plateau Mont-Royal", slug: "plateau-mont-royal", kind: "neighborhood" },
   { id: "area-e1d-montreal-mile-end", municipalityId: "municipality-montreal-montreal", name: "Mile End", slug: "mile-end", kind: "neighborhood" },
   { id: "area-e1d-montreal-downtown", municipalityId: "municipality-montreal-montreal", name: "Downtown", slug: "downtown", kind: "downtown" },
   { id: "area-e1d-montreal-griffintown", municipalityId: "municipality-montreal-montreal", name: "Griffintown", slug: "griffintown", kind: "neighborhood" },

   /* E1D — London */
   { id: "area-e1d-london-soho", municipalityId: "municipality-london-london", name: "Soho", slug: "soho", kind: "district" },
   { id: "area-e1d-london-shoreditch", municipalityId: "municipality-london-london", name: "Shoreditch", slug: "shoreditch", kind: "district" },
   { id: "area-e1d-london-covent-garden", municipalityId: "municipality-london-london", name: "Covent Garden", slug: "covent-garden", kind: "district" },
   { id: "area-e1d-london-south-bank", municipalityId: "municipality-london-london", name: "South Bank", slug: "south-bank", kind: "district" },
   { id: "area-e1d-london-notting-hill", municipalityId: "municipality-london-london", name: "Notting Hill", slug: "notting-hill", kind: "neighborhood" },
   { id: "area-e1d-london-camden-town", municipalityId: "municipality-london-london", name: "Camden Town", slug: "camden-town", kind: "district" },

   /* E1D — Edinburgh */
   { id: "area-e1d-edinburgh-old-town", municipalityId: "municipality-edinburgh-edinburgh", name: "Old Town", slug: "old-town", kind: "district" },
   { id: "area-e1d-edinburgh-new-town", municipalityId: "municipality-edinburgh-edinburgh", name: "New Town", slug: "new-town", kind: "district" },
   { id: "area-e1d-edinburgh-stockbridge", municipalityId: "municipality-edinburgh-edinburgh", name: "Stockbridge", slug: "stockbridge", kind: "neighborhood" },
   { id: "area-e1d-edinburgh-leith", municipalityId: "municipality-edinburgh-edinburgh", name: "Leith", slug: "leith", kind: "area" },

   /* E1D — Mexico City */
   { id: "area-e1d-mexico-city-roma-norte", municipalityId: "municipality-mexico-city-mexico-city", name: "Roma Norte", slug: "roma-norte", kind: "neighborhood" },
   { id: "area-e1d-mexico-city-condesa", municipalityId: "municipality-mexico-city-mexico-city", name: "Condesa", slug: "condesa", kind: "neighborhood" },
   { id: "area-e1d-mexico-city-centro-historico", municipalityId: "municipality-mexico-city-mexico-city", name: "Centro Histórico", slug: "centro-historico", kind: "district" },
   { id: "area-e1d-mexico-city-polanco", municipalityId: "municipality-mexico-city-mexico-city", name: "Polanco", slug: "polanco", kind: "neighborhood" },
   { id: "area-e1d-mexico-city-coyoacan", municipalityId: "municipality-mexico-city-mexico-city", name: "Coyoacán", slug: "coyoacan", kind: "neighborhood" },

   /* E1D — Guadalajara */
   { id: "area-e1d-guadalajara-centro", municipalityId: "municipality-guadalajara-mexico-guadalajara", name: "Centro", slug: "centro", kind: "downtown" },
   { id: "area-e1d-guadalajara-colonia-americana", municipalityId: "municipality-guadalajara-mexico-guadalajara", name: "Colonia Americana", slug: "colonia-americana", kind: "neighborhood" },
   { id: "area-e1d-guadalajara-chapultepec", municipalityId: "municipality-guadalajara-mexico-guadalajara", name: "Chapultepec", slug: "chapultepec", kind: "district" },
   { id: "area-e1d-guadalajara-providencia", municipalityId: "municipality-guadalajara-mexico-guadalajara", name: "Providencia", slug: "providencia", kind: "neighborhood" },

   /* E1D — Tokyo */
   { id: "area-e1d-tokyo-shibuya-shibuya", municipalityId: "municipality-tokyo-shibuya", name: "Shibuya", slug: "shibuya", kind: "district" },
   { id: "area-e1d-tokyo-shibuya-daikanyama", municipalityId: "municipality-tokyo-shibuya", name: "Daikanyama", slug: "daikanyama", kind: "neighborhood" },
   { id: "area-e1d-tokyo-shibuya-ebisu", municipalityId: "municipality-tokyo-shibuya", name: "Ebisu", slug: "ebisu", kind: "neighborhood" },
   { id: "area-e1d-tokyo-shibuya-harajuku", municipalityId: "municipality-tokyo-shibuya", name: "Harajuku", slug: "harajuku", kind: "district" },
   { id: "area-e1d-tokyo-shinjuku-shinjuku", municipalityId: "municipality-tokyo-shinjuku", name: "Shinjuku", slug: "shinjuku", kind: "district" },
   { id: "area-e1d-tokyo-shinjuku-kagurazaka", municipalityId: "municipality-tokyo-shinjuku", name: "Kagurazaka", slug: "kagurazaka", kind: "neighborhood" },
   { id: "area-e1d-tokyo-taito-asakusa", municipalityId: "municipality-tokyo-taito", name: "Asakusa", slug: "asakusa", kind: "district" },
   { id: "area-e1d-tokyo-taito-ueno", municipalityId: "municipality-tokyo-taito", name: "Ueno", slug: "ueno", kind: "district" },
   { id: "area-e1d-tokyo-chuo-ginza", municipalityId: "municipality-tokyo-chuo", name: "Ginza", slug: "ginza", kind: "district" },
   { id: "area-e1d-tokyo-chuo-tsukiji", municipalityId: "municipality-tokyo-chuo", name: "Tsukiji", slug: "tsukiji", kind: "district" },
   { id: "area-e1d-tokyo-setagaya-shimokitazawa", municipalityId: "municipality-tokyo-setagaya", name: "Shimokitazawa", slug: "shimokitazawa", kind: "neighborhood" },

   /* E1D — Yokohama */
   { id: "area-e1d-yokohama-minato-mirai", municipalityId: "municipality-yokohama-yokohama", name: "Minato Mirai", slug: "minato-mirai", kind: "district" },
   { id: "area-e1d-yokohama-kannai", municipalityId: "municipality-yokohama-yokohama", name: "Kannai", slug: "kannai", kind: "district" },
   { id: "area-e1d-yokohama-motomachi", municipalityId: "municipality-yokohama-yokohama", name: "Motomachi", slug: "motomachi", kind: "district" },
   { id: "area-e1d-yokohama-chinatown", municipalityId: "municipality-yokohama-yokohama", name: "Chinatown", slug: "chinatown", kind: "district" },
   { id: "area-e1d-yokohama-noge", municipalityId: "municipality-yokohama-yokohama", name: "Noge", slug: "noge", kind: "district" },

   /* E1D — Yokosuka */
   { id: "area-e1d-yokosuka-yokosuka-chuo", municipalityId: "municipality-yokosuka-yokosuka", name: "Yokosuka-Chuo", slug: "yokosuka-chuo", kind: "downtown" },
   { id: "area-e1d-yokosuka-dobuita", municipalityId: "municipality-yokosuka-yokosuka", name: "Dobuita", slug: "dobuita", kind: "district" },
   { id: "area-e1d-yokosuka-shioiri", municipalityId: "municipality-yokosuka-yokosuka", name: "Shioiri", slug: "shioiri", kind: "area" },
   { id: "area-e1d-yokosuka-kurihama", municipalityId: "municipality-yokosuka-yokosuka", name: "Kurihama", slug: "kurihama", kind: "area" },

   /* E2C — Shonan Coast */
   { id: "area-e2c-zushi-coast", municipalityId: "municipality-shonan-zushi", name: "Zushi Coast", slug: "zushi-coast", kind: "area" },
   { id: "area-e2c-zushi-station", municipalityId: "municipality-shonan-zushi", name: "Zushi Station", slug: "zushi-station", kind: "district" },
   { id: "area-e2c-zushi-kotsubo", municipalityId: "municipality-shonan-zushi", name: "Kotsubo", slug: "kotsubo", kind: "area" },

   { id: "area-e2c-fujisawa-enoshima", municipalityId: "municipality-shonan-fujisawa", name: "Enoshima", slug: "enoshima", kind: "area" },
   { id: "area-e2c-fujisawa-katase-enoshima", municipalityId: "municipality-shonan-fujisawa", name: "Katase-Enoshima", slug: "katase-enoshima", kind: "district" },
   { id: "area-e2c-fujisawa-kugenuma-coast", municipalityId: "municipality-shonan-fujisawa", name: "Kugenuma Coast", slug: "kugenuma-coast", kind: "area" },

   /* E1D — Kyoto */
   { id: "area-e1d-kyoto-gion", municipalityId: "municipality-kyoto-kyoto", name: "Gion", slug: "gion", kind: "district" },
   { id: "area-e1d-kyoto-higashiyama", municipalityId: "municipality-kyoto-kyoto", name: "Higashiyama", slug: "higashiyama", kind: "area" },
   { id: "area-e1d-kyoto-pontocho", municipalityId: "municipality-kyoto-kyoto", name: "Pontocho", slug: "pontocho", kind: "district" },
   { id: "area-e1d-kyoto-arashiyama", municipalityId: "municipality-kyoto-kyoto", name: "Arashiyama", slug: "arashiyama", kind: "area" },
   { id: "area-e1d-kyoto-downtown", municipalityId: "municipality-kyoto-kyoto", name: "Downtown Kyoto", slug: "downtown-kyoto", kind: "downtown" },

   /* E1D — Osaka */
   { id: "area-e1d-osaka-dotonbori", municipalityId: "municipality-osaka-osaka", name: "Dotonbori", slug: "dotonbori", kind: "district" },
   { id: "area-e1d-osaka-namba", municipalityId: "municipality-osaka-osaka", name: "Namba", slug: "namba", kind: "district" },
   { id: "area-e1d-osaka-umeda", municipalityId: "municipality-osaka-osaka", name: "Umeda", slug: "umeda", kind: "district" },
   { id: "area-e1d-osaka-shinsekai", municipalityId: "municipality-osaka-osaka", name: "Shinsekai", slug: "shinsekai", kind: "district" },
   { id: "area-e1d-osaka-nakazakicho", municipalityId: "municipality-osaka-osaka", name: "Nakazakicho", slug: "nakazakicho", kind: "neighborhood" },

   /* E1D — Sydney */
   { id: "area-e1d-sydney-cbd", municipalityId: "municipality-sydney-sydney", name: "CBD", slug: "cbd", kind: "downtown" },
   { id: "area-e1d-sydney-the-rocks", municipalityId: "municipality-sydney-sydney", name: "The Rocks", slug: "the-rocks", kind: "district" },
   { id: "area-e1d-sydney-darling-harbour", municipalityId: "municipality-sydney-sydney", name: "Darling Harbour", slug: "darling-harbour", kind: "district" },
   { id: "area-e1d-sydney-surry-hills", municipalityId: "municipality-sydney-sydney", name: "Surry Hills", slug: "surry-hills", kind: "neighborhood" },

   /* E1D — Melbourne */
   { id: "area-e1d-melbourne-cbd", municipalityId: "municipality-melbourne-australia-melbourne", name: "CBD", slug: "cbd", kind: "downtown" },
   { id: "area-e1d-melbourne-southbank", municipalityId: "municipality-melbourne-australia-melbourne", name: "Southbank", slug: "southbank", kind: "district" },
   { id: "area-e1d-melbourne-carlton", municipalityId: "municipality-melbourne-australia-melbourne", name: "Carlton", slug: "carlton", kind: "neighborhood" },
   { id: "area-e1d-melbourne-docklands", municipalityId: "municipality-melbourne-australia-melbourne", name: "Docklands", slug: "docklands", kind: "district" },


] satisfies readonly LocalArea[];
