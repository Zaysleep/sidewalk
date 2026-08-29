/**
 * Search authority for local areas whose names are ambiguous, reused in other
 * cities, or better represented by a well-known district name.
 *
 * Sidewalk uses these entries before its generic Geography V2
 * "local area, municipality, region, country" fallback. Coordinates are
 * optional so verified centers can be added later without changing the
 * provider contract.
 */
export type LocalAreaSearchAuthority = Readonly<{
   localAreaId: string;

   searchQuery: string;

   maximumSearchRadiusMeters?: number;

   center?: Readonly<{
      latitude: number;
      longitude: number;
   }>;
}>;

export const localAreaSearchAuthorities = [
   {
      localAreaId: "area-san-diego-kearny-mesa",
      searchQuery: "Kearny Mesa neighborhood, San Diego, California",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-national-city-downtown",
      searchQuery: "Downtown National City, National City, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-national-city-highland-avenue",
      searchQuery: "Highland Avenue commercial corridor, National City, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-national-city-westside",
      searchQuery: "Westside National City neighborhood, National City, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-national-city-national-city-boulevard",
      searchQuery: "National City Boulevard, National City, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-irvine-diamond-jamboree",
      searchQuery: "Diamond Jamboree Shopping Center, Irvine, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-westminster-little-saigon",
      searchQuery: "Little Saigon, Westminster, California",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-garden-grove-little-saigon",
      searchQuery: "Little Saigon, Garden Grove, California",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-costa-mesa-south-coast-metro",
      searchQuery: "South Coast Metro, Costa Mesa, California",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-anaheim-packing-district",
      searchQuery: "Anaheim Packing District, Anaheim, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-charlotte-uptown",
      searchQuery: "Uptown Charlotte, Charlotte, North Carolina",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-minneapolis-uptown",
      searchQuery: "Uptown Minneapolis, Minneapolis, Minnesota",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-oklahoma-city-midtown",
      searchQuery: "Midtown Oklahoma City, Oklahoma City, Oklahoma",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-sacramento-midtown",
      searchQuery: "Midtown Sacramento, Sacramento, California",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-detroit-midtown",
      searchQuery: "Midtown Detroit, Detroit, Michigan",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-baltimore-mount-vernon",
      searchQuery: "Mount Vernon neighborhood, Baltimore, Maryland",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-cincinnati-mount-adams",
      searchQuery: "Mount Adams neighborhood, Cincinnati, Ohio",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-st-louis-the-grove",
      searchQuery: "The Grove district, St. Louis, Missouri",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-san-antonio-pearl",
      searchQuery: "Pearl District, San Antonio, Texas",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-pittsburgh-strip-district",
      searchQuery: "Strip District, Pittsburgh, Pennsylvania",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-tampa-hyde-park",
      searchQuery: "Hyde Park neighborhood, Tampa, Florida",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-st-petersburg-grand-central",
      searchQuery: "Grand Central District, St. Petersburg, Florida",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-new-orleans-garden-district",
      searchQuery: "Garden District, New Orleans, Louisiana",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-cleveland-ohio-city",
      searchQuery: "Ohio City neighborhood, Cleveland, Ohio",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-raleigh-warehouse-district",
      searchQuery: "Warehouse District, Raleigh, North Carolina",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-buffalo-allentown",
      searchQuery: "Allentown neighborhood, Buffalo, New York",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-kansas-city-crossroads",
      searchQuery: "Crossroads Arts District, Kansas City, Missouri",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-palm-springs-downtown",
      searchQuery: "Downtown Palm Springs, Palm Springs, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-palm-springs-uptown-design-district",
      searchQuery: "Uptown Design District, Palm Springs, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-palm-springs-south-palm-canyon",
      searchQuery: "South Palm Canyon Drive district, Palm Springs, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-palm-springs-indian-canyons",
      searchQuery: "Indian Canyons area, Palm Springs, California",
      maximumSearchRadiusMeters: 5000,
   },
   {
      localAreaId: "area-palm-desert-el-paseo",
      searchQuery: "El Paseo Shopping District, Palm Desert, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-palm-desert-san-pablo-avenue",
      searchQuery: "San Pablo Avenue corridor, Palm Desert, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-palm-desert-civic-center",
      searchQuery: "Palm Desert Civic Center area, Palm Desert, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-rancho-mirage-the-river",
      searchQuery: "The River at Rancho Mirage, Rancho Mirage, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-rancho-mirage-rancho-las-palmas",
      searchQuery: "Rancho Las Palmas area, Rancho Mirage, California",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-cathedral-city-downtown",
      searchQuery: "Downtown Cathedral City, Cathedral City, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-cathedral-city-cathedral-canyon",
      searchQuery: "Cathedral Canyon area, Cathedral City, California",
      maximumSearchRadiusMeters: 4000,
   },


   /* E1C — stronger authority only where a generic neighborhood label is ambiguous. */
   {
      localAreaId: "area-e1c-seattle-seattle-chinatown-international-district",
      searchQuery: "Chinatown-International District, Seattle, Washington",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-portland-portland-division-clinton",
      searchQuery: "Division Clinton district, Portland, Oregon",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-dfw-dallas-the-cedars",
      searchQuery: "The Cedars neighborhood, Dallas, Texas",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-miami-miami-mimo-district",
      searchQuery: "MiMo Biscayne Boulevard Historic District, Miami, Florida",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-atlanta-atlanta-little-five-points",
      searchQuery: "Little Five Points, Atlanta, Georgia",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-charleston-south-carolina-charleston-cannonborough-elliotborough",
      searchQuery: "Cannonborough Elliotborough, Charleston, South Carolina",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-charleston-south-carolina-charleston-upper-king",
      searchQuery: "Upper King Street district, Charleston, South Carolina",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-savannah-savannah-starland-district",
      searchQuery: "Starland District, Savannah, Georgia",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-savannah-savannah-historic-river-street",
      searchQuery: "River Street Historic District, Savannah, Georgia",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-honolulu-honolulu-kakaako",
      searchQuery: "Kakaako neighborhood, Honolulu, Hawaii",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-salt-lake-city-salt-lake-city-9th-and-9th",
      searchQuery: "9th and 9th district, Salt Lake City, Utah",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-park-city-park-city-canyons-village",
      searchQuery: "Canyons Village, Park City, Utah",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-asheville-asheville-river-arts-district",
      searchQuery: "River Arts District, Asheville, North Carolina",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-santa-fe-santa-fe-canyon-road",
      searchQuery: "Canyon Road arts district, Santa Fe, New Mexico",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-portland-maine-portland-old-port",
      searchQuery: "Old Port, Portland, Maine",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-providence-providence-federal-hill",
      searchQuery: "Federal Hill, Providence, Rhode Island",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-boise-boise-hyde-park",
      searchQuery: "Hyde Park district, Boise, Idaho",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-louisville-louisville-nulu",
      searchQuery: "NuLu East Market District, Louisville, Kentucky",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-richmond-virginia-richmond-the-fan",
      searchQuery: "The Fan District, Richmond, Virginia",
      maximumSearchRadiusMeters: 4500,
   },
   {
      localAreaId: "area-e1c-tucson-tucson-fourth-avenue",
      searchQuery: "Historic Fourth Avenue, Tucson, Arizona",
      maximumSearchRadiusMeters: 4000,
   },
   {
      localAreaId: "area-e1c-santa-barbara-santa-barbara-funk-zone",
      searchQuery: "Funk Zone, Santa Barbara, California",
      maximumSearchRadiusMeters: 3500,
   },
   {
      localAreaId: "area-e1c-key-west-key-west-historic-seaport",
      searchQuery: "Historic Seaport, Key West, Florida",
      maximumSearchRadiusMeters: 3500,
   },

   /* E1D — International beta authority */
   { localAreaId: "area-e1d-toronto-distillery-district", searchQuery: "Distillery Historic District, Toronto, Ontario, Canada", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-vancouver-gastown", searchQuery: "Gastown, Vancouver, British Columbia, Canada", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-montreal-old-montreal", searchQuery: "Old Montreal, Montreal, Quebec, Canada", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-london-soho", searchQuery: "Soho, London, England, United Kingdom", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-london-shoreditch", searchQuery: "Shoreditch, London, England, United Kingdom", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-edinburgh-old-town", searchQuery: "Old Town, Edinburgh, Scotland, United Kingdom", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-mexico-city-centro-historico", searchQuery: "Centro Historico, Mexico City, Mexico", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-mexico-city-roma-norte", searchQuery: "Roma Norte, Mexico City, Mexico", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-guadalajara-colonia-americana", searchQuery: "Colonia Americana, Guadalajara, Jalisco, Mexico", maximumSearchRadiusMeters: 4000 },

   { localAreaId: "area-e1d-tokyo-shibuya-shibuya", searchQuery: "Shibuya, Tokyo, Japan", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-tokyo-shibuya-daikanyama", searchQuery: "Daikanyama, Shibuya, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-shibuya-ebisu", searchQuery: "Ebisu, Shibuya, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-shibuya-harajuku", searchQuery: "Harajuku, Shibuya, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-shinjuku-shinjuku", searchQuery: "Shinjuku, Tokyo, Japan", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-tokyo-shinjuku-kagurazaka", searchQuery: "Kagurazaka, Shinjuku, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-taito-asakusa", searchQuery: "Asakusa, Taito, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-taito-ueno", searchQuery: "Ueno, Taito, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-chuo-ginza", searchQuery: "Ginza, Chuo, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-chuo-tsukiji", searchQuery: "Tsukiji, Chuo, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-tokyo-setagaya-shimokitazawa", searchQuery: "Shimokitazawa, Setagaya, Tokyo, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokohama-minato-mirai", searchQuery: "Minato Mirai, Yokohama, Kanagawa, Japan", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e1d-yokohama-kannai", searchQuery: "Kannai, Yokohama, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokohama-motomachi", searchQuery: "Motomachi, Yokohama, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokohama-chinatown", searchQuery: "Yokohama Chinatown, Yokohama, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokohama-noge", searchQuery: "Noge, Yokohama, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokosuka-yokosuka-chuo", searchQuery: "Yokosuka-Chuo, Yokosuka, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokosuka-dobuita", searchQuery: "Dobuita Street, Yokosuka, Kanagawa, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e1d-yokosuka-shioiri", searchQuery: "Shioiri, Yokosuka, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-yokosuka-kurihama", searchQuery: "Kurihama, Yokosuka, Kanagawa, Japan", maximumSearchRadiusMeters: 3500 },
   { localAreaId: "area-e2c-zushi-coast", searchQuery: "Zushi Beach, Zushi, Kanagawa, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e2c-zushi-station", searchQuery: "Zushi Station, Zushi, Kanagawa, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e2c-zushi-kotsubo", searchQuery: "Kotsubo, Zushi, Kanagawa, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e2c-fujisawa-enoshima", searchQuery: "Enoshima, Fujisawa, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e2c-fujisawa-katase-enoshima", searchQuery: "Katase-Enoshima, Fujisawa, Kanagawa, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e2c-fujisawa-kugenuma-coast", searchQuery: "Kugenuma Kaigan, Fujisawa, Kanagawa, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-kyoto-gion", searchQuery: "Gion, Kyoto, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-kyoto-pontocho", searchQuery: "Pontocho, Kyoto, Japan", maximumSearchRadiusMeters: 2500 },
   { localAreaId: "area-e1d-kyoto-arashiyama", searchQuery: "Arashiyama, Kyoto, Japan", maximumSearchRadiusMeters: 4000 },
   { localAreaId: "area-e1d-osaka-dotonbori", searchQuery: "Dotonbori, Osaka, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-osaka-namba", searchQuery: "Namba, Osaka, Japan", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-osaka-umeda", searchQuery: "Umeda, Osaka, Japan", maximumSearchRadiusMeters: 3500 },

   { localAreaId: "area-e1d-sydney-the-rocks", searchQuery: "The Rocks, Sydney, New South Wales, Australia", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-sydney-darling-harbour", searchQuery: "Darling Harbour, Sydney, New South Wales, Australia", maximumSearchRadiusMeters: 3000 },
   { localAreaId: "area-e1d-melbourne-cbd", searchQuery: "Melbourne CBD, Victoria, Australia", maximumSearchRadiusMeters: 3500 },

] satisfies readonly LocalAreaSearchAuthority[];

const localAreaSearchAuthorityById = new Map(localAreaSearchAuthorities.map((authority) => [authority.localAreaId, authority] as const));

export function getLocalAreaSearchAuthority(localAreaId: string): LocalAreaSearchAuthority | null {
   return localAreaSearchAuthorityById.get(localAreaId) ?? null;
}
