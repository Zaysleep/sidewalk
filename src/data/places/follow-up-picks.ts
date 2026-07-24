import type { FollowUpPick } from "@/types/follow-up";
import type { PlaceCategory } from "@/types/place";

type FollowUpSeed = Readonly<{
   followsPlaceId: string;

   id: string;
   slug: string;

   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;

   name: string;
   category: PlaceCategory;

   summary: string;
   reasonToVisit: string;

   duration: readonly [minimum: number, maximum: number];
}>;

/**
 * Converts compact editorial seed data into the same Place model used by the
 * primary Sidewalk recommendation.
 */
function createFollowUpPick(seed: FollowUpSeed): FollowUpPick {
   const [minimum, maximum] = seed.duration;

   return {
      followsPlaceId: seed.followsPlaceId,
      place: {
         id: seed.id,
         slug: seed.slug,

         metroRegionId: seed.metroRegionId,
         municipalityId: seed.municipalityId,
         localAreaId: seed.localAreaId,

         provider: {
            source: "manual",
            providerPlaceId: null,
            name: seed.name,
            businessStatus: "unverified",
         },

         editorial: {
            approvalStatus: "approved",
            editorialTier: "sidewalk-pick",
            category: seed.category,
            summary: seed.summary,
            reasonToVisit: seed.reasonToVisit,
            visitDurationMinutes: {
               minimum,
               maximum,
            },
         },
      },
   };
}

/**
 * One real follow-up seed for every current primary Sidewalk pick.
 *
 * These records intentionally omit live hours and operating-status claims.
 * Provider integration will eventually validate those facts independently
 * from Sidewalk's editorial writing.
 */
const followUpSeeds = [
   {
      followsPlaceId: "place-verbatim-books",
      id: "place-tribute-pizza",
      slug: "tribute-pizza",
      metroRegionId: "metro-san-diego",
      municipalityId: "municipality-san-diego-san-diego",
      localAreaId: "area-san-diego-north-park",
      name: "Tribute Pizza",
      category: "food",
      summary: "A neighborhood pizza stop that keeps the rest of the outing relaxed and close together.",
      reasonToVisit: "It complements an afternoon of browsing without sending the day across town.",
      duration: [60, 90],
   },
   {
      followsPlaceId: "place-the-last-bookstore",
      id: "place-the-broad",
      slug: "the-broad",
      metroRegionId: "metro-los-angeles",
      municipalityId: "municipality-los-angeles-los-angeles",
      localAreaId: "area-los-angeles-downtown",
      name: "The Broad",
      category: "culture",
      summary: "A contemporary art stop that gives a Downtown Los Angeles outing a clear second chapter.",
      reasonToVisit: "It adds a different kind of attention after browsing while keeping the day geographically compact.",
      duration: [75, 120],
   },
   {
      followsPlaceId: "place-city-lights-booksellers",
      id: "place-washington-square-san-francisco",
      slug: "washington-square-san-francisco",
      metroRegionId: "metro-san-francisco-bay-area",
      municipalityId: "municipality-bay-area-san-francisco",
      localAreaId: "area-san-francisco-north-beach",
      name: "Washington Square",
      category: "parks-outdoors",
      summary: "A neighborhood green space that makes room to pause after City Lights.",
      reasonToVisit: "The short shift from books to open space keeps North Beach itself at the center of the day.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-elliott-bay-book-company",
      id: "place-volunteer-park",
      slug: "volunteer-park",
      metroRegionId: "metro-seattle",
      municipalityId: "municipality-seattle-seattle",
      localAreaId: "area-seattle-capitol-hill",
      name: "Volunteer Park",
      category: "parks-outdoors",
      summary: "A spacious neighborhood park that gives a Capitol Hill afternoon some open air.",
      reasonToVisit: "It changes the pace without requiring a complicated route or another major commitment.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-japanese-friendship-garden-phoenix",
      id: "place-pizzeria-bianco",
      slug: "pizzeria-bianco",
      metroRegionId: "metro-phoenix",
      municipalityId: "municipality-phoenix-phoenix",
      localAreaId: "area-phoenix-downtown",
      name: "Pizzeria Bianco",
      category: "food",
      summary: "A focused food stop that gives the quieter garden visit a natural next destination.",
      reasonToVisit: "The pairing creates contrast while keeping the day centered in Downtown Phoenix.",
      duration: [60, 90],
   },
   {
      followsPlaceId: "place-neon-museum",
      id: "place-downtown-container-park",
      slug: "downtown-container-park",
      metroRegionId: "metro-las-vegas",
      municipalityId: "municipality-las-vegas-las-vegas",
      localAreaId: "area-las-vegas-downtown",
      name: "Downtown Container Park",
      category: "shopping",
      summary: "An open-air collection of food and small shops that keeps the day rooted downtown.",
      reasonToVisit: "It offers flexibility after a structured museum visit without turning the outing into a checklist.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-powells-city-of-books",
      id: "place-jamison-square",
      slug: "jamison-square",
      metroRegionId: "metro-portland",
      municipalityId: "municipality-portland-portland",
      localAreaId: "area-portland-pearl",
      name: "Jamison Square",
      category: "parks-outdoors",
      summary: "A small urban park that creates a natural pause after exploring Powell’s.",
      reasonToVisit: "It keeps the Pearl District walkable and lets the second stop feel lighter than the first.",
      duration: [30, 45],
   },
   {
      followsPlaceId: "place-denver-central-market",
      id: "place-the-source-market-hall",
      slug: "the-source-market-hall",
      metroRegionId: "metro-denver",
      municipalityId: "municipality-denver-denver",
      localAreaId: "area-denver-rino",
      name: "The Source Hotel + Market Hall",
      category: "food",
      summary: "A flexible market-hall stop that continues the casual pace of a RiNo afternoon.",
      reasonToVisit: "It gives the user choices without requiring a separate search or a trip to another part of Denver.",
      duration: [60, 90],
   },
   {
      followsPlaceId: "place-myopic-books",
      id: "place-the-606",
      slug: "the-606",
      metroRegionId: "metro-chicago",
      municipalityId: "municipality-chicago-chicago",
      localAreaId: "area-chicago-wicker-park",
      name: "The 606",
      category: "parks-outdoors",
      summary: "An elevated trail that turns a Wicker Park visit into an easy neighborhood walk.",
      reasonToVisit: "It adds movement after browsing while allowing the surrounding city to remain part of the experience.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-kimbell-art-museum",
      id: "place-modern-art-museum-fort-worth",
      slug: "modern-art-museum-fort-worth",
      metroRegionId: "metro-dallas-fort-worth",
      municipalityId: "municipality-dfw-fort-worth",
      localAreaId: "area-fort-worth-cultural-district",
      name: "Modern Art Museum of Fort Worth",
      category: "culture",
      summary: "A second cultural stop with a different collection and architectural character.",
      reasonToVisit: "The close pairing makes the Cultural District feel intentional rather than scattered.",
      duration: [75, 120],
   },
   {
      followsPlaceId: "place-bookpeople",
      id: "place-texas-state-capitol",
      slug: "texas-state-capitol",
      metroRegionId: "metro-austin",
      municipalityId: "municipality-austin-austin",
      localAreaId: "area-austin-downtown",
      name: "Texas State Capitol",
      category: "culture",
      summary: "A recognizable civic landmark that gives the afternoon a change of scale.",
      reasonToVisit: "It moves the day from browsing into architecture and public space without leaving central Austin.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-washington-square-park",
      id: "place-three-lives-and-company",
      slug: "three-lives-and-company",
      metroRegionId: "metro-new-york",
      municipalityId: "municipality-new-york-new-york-city",
      localAreaId: "area-nyc-west-village",
      name: "Three Lives & Company",
      category: "shopping",
      summary: "A compact independent bookstore that suits a slower walk through the West Village.",
      reasonToVisit: "It turns a broad neighborhood wander into one specific, worthwhile destination.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-boston-public-garden",
      id: "place-boston-public-library-central",
      slug: "boston-public-library-central",
      metroRegionId: "metro-boston",
      municipalityId: "municipality-boston-boston",
      localAreaId: "area-boston-back-bay",
      name: "Boston Public Library — Central Library",
      category: "culture",
      summary: "A landmark library whose architecture and public rooms reward an unhurried visit.",
      reasonToVisit: "It continues the walk through Back Bay while shifting from outdoor space to a thoughtful interior.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-reading-terminal-market",
      id: "place-dilworth-park",
      slug: "dilworth-park",
      metroRegionId: "metro-philadelphia",
      municipalityId: "municipality-philadelphia-philadelphia",
      localAreaId: "area-philadelphia-center-city",
      name: "Dilworth Park",
      category: "parks-outdoors",
      summary: "A central public space that creates a simple pause after the energy of Reading Terminal Market.",
      reasonToVisit: "It keeps the outing walkable and lets the surrounding architecture become part of the day.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-eastern-market",
      id: "place-library-of-congress-jefferson-building",
      slug: "library-of-congress-jefferson-building",
      metroRegionId: "metro-washington-dc",
      municipalityId: "municipality-dc-washington",
      localAreaId: "area-dc-capitol-hill",
      name: "Library of Congress — Thomas Jefferson Building",
      category: "culture",
      summary: "An architectural and cultural stop that deepens a Capitol Hill afternoon.",
      reasonToVisit: "It follows naturally from the neighborhood market while giving the second stop a distinct purpose.",
      duration: [60, 90],
   },
   {
      followsPlaceId: "place-ponce-city-market",
      id: "place-historic-fourth-ward-park",
      slug: "historic-fourth-ward-park",
      metroRegionId: "metro-atlanta",
      municipalityId: "municipality-atlanta-atlanta",
      localAreaId: "area-atlanta-old-fourth-ward",
      name: "Historic Fourth Ward Park",
      category: "parks-outdoors",
      summary: "A neighborhood park that gives the day a quieter finish after Ponce City Market.",
      reasonToVisit: "It keeps the outing local and replaces another purchase decision with open space.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-menil-collection",
      id: "place-rothko-chapel",
      slug: "rothko-chapel",
      metroRegionId: "metro-houston",
      municipalityId: "municipality-houston-houston",
      localAreaId: "area-houston-montrose",
      name: "Rothko Chapel",
      category: "culture",
      summary: "A quiet contemplative space that continues the reflective character of a Menil visit.",
      reasonToVisit: "The close relationship between the two places makes the sequence feel considered rather than assembled.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-vizcaya-museum-and-gardens",
      id: "place-the-barnacle-historic-state-park",
      slug: "the-barnacle-historic-state-park",
      metroRegionId: "metro-miami",
      municipalityId: "municipality-miami-miami",
      localAreaId: "area-miami-coconut-grove",
      name: "The Barnacle Historic State Park",
      category: "parks-outdoors",
      summary: "A smaller historic waterfront setting that keeps the day connected to Coconut Grove.",
      reasonToVisit: "It extends the garden-and-history theme without repeating the scale of the first stop.",
      duration: [45, 75],
   },
   {
      followsPlaceId: "place-east-end-market",
      id: "place-park-ave-cds",
      slug: "park-ave-cds",
      metroRegionId: "metro-orlando",
      municipalityId: "municipality-orlando-orlando",
      localAreaId: "area-orlando-audubon-park",
      name: "Park Ave CDs",
      category: "shopping",
      summary: "An independent record shop that gives an Audubon Park outing a specific place to browse.",
      reasonToVisit: "It adds personality after the market while keeping the route compact and neighborhood-focused.",
      duration: [30, 60],
   },
   {
      followsPlaceId: "place-frist-art-museum",
      id: "place-country-music-hall-of-fame",
      slug: "country-music-hall-of-fame",
      metroRegionId: "metro-nashville",
      municipalityId: "municipality-nashville-nashville",
      localAreaId: "area-nashville-downtown",
      name: "Country Music Hall of Fame and Museum",
      category: "culture",
      summary: "A Nashville-specific cultural stop that gives the downtown day a clear second focus.",
      reasonToVisit: "It follows an art visit with a different story about the city without requiring a new neighborhood.",
      duration: [90, 120],
   },
] satisfies readonly FollowUpSeed[];

export const followUpPicks = followUpSeeds.map(createFollowUpPick);
