import type { Place } from "@/types/place";

/**
 * Initial real-place editorial seed records.
 *
 * This first pass includes one approved pick for every active metro region.
 * It proves the recommendation relationship without pretending every local
 * area is already fully curated.
 *
 * Live hours and operational status are intentionally omitted until provider
 * data is connected and validated.
 */
export const sidewalkPicks = [
   /* ------------------------------------------------------------------------ */
   /* San Diego                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-verbatim-books",
      slug: "verbatim-books",
      metroRegionId: "metro-san-diego",
      municipalityId: "municipality-san-diego-san-diego",
      localAreaId: "area-san-diego-north-park",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Verbatim Books",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "An independent bookstore that fits naturally into an unhurried North Park afternoon.",
         reasonToVisit: "The shelves invite browsing rather than rushing, and the surrounding neighborhood makes it easy to continue the day nearby.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Los Angeles                                                             */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-the-last-bookstore",
      slug: "the-last-bookstore",
      metroRegionId: "metro-los-angeles",
      municipalityId: "municipality-los-angeles-los-angeles",
      localAreaId: "area-los-angeles-downtown",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "The Last Bookstore",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A large, character-filled bookstore that rewards a slow wander through Downtown Los Angeles.",
         reasonToVisit: "It offers enough to become the center of an outing while leaving several worthwhile downtown stops within reach.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* San Francisco Bay Area                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-city-lights-booksellers",
      slug: "city-lights-booksellers",
      metroRegionId: "metro-san-francisco-bay-area",
      municipalityId: "municipality-bay-area-san-francisco",
      localAreaId: "area-san-francisco-north-beach",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "City Lights Booksellers & Publishers",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A landmark independent bookstore with a strong literary identity in North Beach.",
         reasonToVisit: "It feels inseparable from its neighborhood and pairs naturally with a walk, coffee, or a longer afternoon nearby.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Seattle                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-elliott-bay-book-company",
      slug: "elliott-bay-book-company",
      metroRegionId: "metro-seattle",
      municipalityId: "municipality-seattle-seattle",
      localAreaId: "area-seattle-capitol-hill",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Elliott Bay Book Company",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A spacious independent bookstore suited to a curious afternoon in Capitol Hill.",
         reasonToVisit: "It gives the day a clear starting point while keeping food, coffee, and neighborhood wandering close by.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Phoenix                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-japanese-friendship-garden-phoenix",
      slug: "japanese-friendship-garden-phoenix",
      metroRegionId: "metro-phoenix",
      municipalityId: "municipality-phoenix-phoenix",
      localAreaId: "area-phoenix-downtown",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Japanese Friendship Garden of Phoenix",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "parks-outdoors",
         summary: "A quiet garden experience that offers a slower counterpoint to Downtown Phoenix.",
         reasonToVisit: "It creates a calm, self-contained stop and leaves room for food or culture afterward.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Las Vegas                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-neon-museum",
      slug: "neon-museum",
      metroRegionId: "metro-las-vegas",
      municipalityId: "municipality-las-vegas-las-vegas",
      localAreaId: "area-las-vegas-downtown",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "The Neon Museum",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "culture",
         summary: "A distinctly Las Vegas collection that gives the city’s visual history a place of its own.",
         reasonToVisit: "It offers a memorable cultural anchor without requiring an entire day on the Strip.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Portland                                                                */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-powells-city-of-books",
      slug: "powells-city-of-books",
      metroRegionId: "metro-portland",
      municipalityId: "municipality-portland-portland",
      localAreaId: "area-portland-pearl",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Powell’s City of Books",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A Portland institution large enough to reward an afternoon of wandering.",
         reasonToVisit: "It gives the day a strong centerpiece and connects naturally to the Pearl District on foot.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Denver                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-denver-central-market",
      slug: "denver-central-market",
      metroRegionId: "metro-denver",
      municipalityId: "municipality-denver-denver",
      localAreaId: "area-denver-rino",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Denver Central Market",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "food",
         summary: "A flexible food-hall stop that works well as the center of a casual RiNo outing.",
         reasonToVisit: "It makes group decisions easier and leaves the neighborhood’s galleries and streets within easy reach.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Chicago                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-myopic-books",
      slug: "myopic-books",
      metroRegionId: "metro-chicago",
      municipalityId: "municipality-chicago-chicago",
      localAreaId: "area-chicago-wicker-park",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Myopic Books",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A densely stocked used bookstore that suits an exploratory afternoon in Wicker Park.",
         reasonToVisit: "It feels discovered rather than optimized and pairs easily with the neighborhood around it.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Dallas–Fort Worth                                                       */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-kimbell-art-museum",
      slug: "kimbell-art-museum",
      metroRegionId: "metro-dallas-fort-worth",
      municipalityId: "municipality-dfw-fort-worth",
      localAreaId: "area-fort-worth-cultural-district",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Kimbell Art Museum",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "culture",
         summary: "An art museum where the building and the collection both reward close attention.",
         reasonToVisit: "It provides a strong cultural anchor and makes the wider Cultural District easy to build around.",
         visitDurationMinutes: {
            minimum: 90,
            maximum: 120,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Austin                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-bookpeople",
      slug: "bookpeople",
      metroRegionId: "metro-austin",
      municipalityId: "municipality-austin-austin",
      localAreaId: "area-austin-downtown",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "BookPeople",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "shopping",
         summary: "A long-running independent bookstore that works as a thoughtful start to an Austin afternoon.",
         reasonToVisit: "It has enough depth to feel purposeful while remaining easy to pair with food or a walk nearby.",
         visitDurationMinutes: {
            minimum: 45,
            maximum: 75,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* New York Metro                                                          */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-washington-square-park",
      slug: "washington-square-park",
      metroRegionId: "metro-new-york",
      municipalityId: "municipality-new-york-new-york-city",
      localAreaId: "area-nyc-west-village",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Washington Square Park",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "parks-outdoors",
         summary: "A lively public space that lets the surrounding part of Manhattan become part of the experience.",
         reasonToVisit: "It works best as a starting point rather than a destination in isolation, which makes it ideal for a Sidewalk day.",
         visitDurationMinutes: {
            minimum: 30,
            maximum: 60,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Boston                                                                  */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-boston-public-garden",
      slug: "boston-public-garden",
      metroRegionId: "metro-boston",
      municipalityId: "municipality-boston-boston",
      localAreaId: "area-boston-back-bay",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Boston Public Garden",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "parks-outdoors",
         summary: "A central green space that creates an easy beginning for a walk through Boston.",
         reasonToVisit: "It requires little planning and connects naturally to several different directions for the rest of the day.",
         visitDurationMinutes: {
            minimum: 30,
            maximum: 60,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Philadelphia                                                            */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-reading-terminal-market",
      slug: "reading-terminal-market",
      metroRegionId: "metro-philadelphia",
      municipalityId: "municipality-philadelphia-philadelphia",
      localAreaId: "area-philadelphia-center-city",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Reading Terminal Market",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "food",
         summary: "A lively indoor market that turns one meal into a broader Center City experience.",
         reasonToVisit: "It offers variety without requiring a long search and leaves several cultural stops nearby.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Washington DC Metro                                                     */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-eastern-market",
      slug: "eastern-market",
      metroRegionId: "metro-washington-dc",
      municipalityId: "municipality-dc-washington",
      localAreaId: "area-dc-capitol-hill",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Eastern Market",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "food",
         summary: "A neighborhood market that gives Capitol Hill a useful, local starting point.",
         reasonToVisit: "It combines food and browsing while keeping the surrounding streets and public spaces close.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Atlanta                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-ponce-city-market",
      slug: "ponce-city-market",
      metroRegionId: "metro-atlanta",
      municipalityId: "municipality-atlanta-atlanta",
      localAreaId: "area-atlanta-old-fourth-ward",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Ponce City Market",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "food",
         summary: "A flexible food and shopping stop with direct access to the rhythm of Old Fourth Ward.",
         reasonToVisit: "It works for different appetites and makes it easy to continue the day along the BeltLine.",
         visitDurationMinutes: {
            minimum: 75,
            maximum: 120,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Houston                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-menil-collection",
      slug: "menil-collection",
      metroRegionId: "metro-houston",
      municipalityId: "municipality-houston-houston",
      localAreaId: "area-houston-montrose",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "The Menil Collection",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "culture",
         summary: "A calm art destination whose setting feels connected to the surrounding Montrose neighborhood.",
         reasonToVisit: "It provides a focused cultural experience without making the day feel overplanned.",
         visitDurationMinutes: {
            minimum: 75,
            maximum: 120,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Miami                                                                   */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-vizcaya-museum-and-gardens",
      slug: "vizcaya-museum-and-gardens",
      metroRegionId: "metro-miami",
      municipalityId: "municipality-miami-miami",
      localAreaId: "area-miami-coconut-grove",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Vizcaya Museum and Gardens",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "culture",
         summary: "A historic estate and garden experience that feels removed from the city without leaving it.",
         reasonToVisit: "It is visually memorable, substantial enough to anchor the day, and easy to pair with Coconut Grove afterward.",
         visitDurationMinutes: {
            minimum: 90,
            maximum: 120,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Orlando                                                                 */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-east-end-market",
      slug: "east-end-market",
      metroRegionId: "metro-orlando",
      municipalityId: "municipality-orlando-orlando",
      localAreaId: "area-orlando-audubon-park",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "East End Market",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "food",
         summary: "A neighborhood food stop that makes Audubon Park feel easy to explore.",
         reasonToVisit: "It provides a clear first destination while leaving room for nearby coffee, shops, or a walk.",
         visitDurationMinutes: {
            minimum: 60,
            maximum: 90,
         },
      },
   },

   /* ------------------------------------------------------------------------ */
   /* Nashville                                                               */
   /* ------------------------------------------------------------------------ */

   {
      id: "place-frist-art-museum",
      slug: "frist-art-museum",
      metroRegionId: "metro-nashville",
      municipalityId: "municipality-nashville-nashville",
      localAreaId: "area-nashville-downtown",
      provider: {
         source: "manual",
         providerPlaceId: null,
         name: "Frist Art Museum",
         businessStatus: "unverified",
      },
      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: "culture",
         summary: "A focused art stop that offers a quieter way into Downtown Nashville.",
         reasonToVisit: "It gives the day a cultural center without requiring the rest of the outing to revolve around nightlife.",
         visitDurationMinutes: {
            minimum: 75,
            maximum: 120,
         },
      },
   },
] satisfies readonly Place[];
