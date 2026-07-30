/**
 * Search authority for local areas whose names are ambiguous, reused in other
 * cities, or better represented by a well-known district name.
 *
 * Sidewalk uses these entries before its generic
 * "local area, municipality, state" fallback. Coordinates are optional so
 * verified centers can be added later without changing the provider contract.
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
] satisfies readonly LocalAreaSearchAuthority[];

const localAreaSearchAuthorityById = new Map(localAreaSearchAuthorities.map((authority) => [authority.localAreaId, authority] as const));

export function getLocalAreaSearchAuthority(localAreaId: string): LocalAreaSearchAuthority | null {
   return localAreaSearchAuthorityById.get(localAreaId) ?? null;
}
