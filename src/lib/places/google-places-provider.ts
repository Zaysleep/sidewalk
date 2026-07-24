import "server-only";

import type { ActivityKind } from "@/types/activity";
import type { Place, PlaceCategory, ProviderBusinessStatus } from "@/types/place";

/**
 * Only the Google fields Sidewalk currently consumes are requested.
 *
 * Ratings and review counts are deliberately excluded from the field mask and
 * therefore cannot influence this recommendation phase.
 */
type GooglePlace = Readonly<{
   id?: string;

   displayName?: Readonly<{
      text?: string;
   }>;

   formattedAddress?: string;

   location?: Readonly<{
      latitude?: number;
      longitude?: number;
   }>;

   primaryType?: string;
   types?: readonly string[];

   businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

   websiteUri?: string;
   googleMapsUri?: string;
}>;

type GoogleTextSearchResponse = Readonly<{
   places?: readonly GooglePlace[];
}>;

type SearchContext = Readonly<{
   metroRegionId: string;
   metroRegionName: string;

   municipalityId: string;
   municipalityName: string;
   stateOrRegion: string;

   localAreaId: string;
   localAreaName: string;

   activity: ActivityKind;
}>;

type CachedRecommendation = Readonly<{
   expiresAt: number;
   value: Place | null;
}>;

/**
 * This cache is scoped to the current server runtime.
 *
 * It prevents duplicate requests during local testing and warm server
 * instances. A durable database or shared cache can replace it after the live
 * provider behavior is validated.
 */
const recommendationCache = new Map<string, CachedRecommendation>();

const cacheDurationMilliseconds = 12 * 60 * 60 * 1000;

const activityQueryLanguage: Readonly<Record<ActivityKind, string>> = {
   outdoors: "parks, gardens, scenic walks, hiking trails, and outdoor attractions",

   culture: "museums, art galleries, libraries, historic sites, and cultural attractions",

   browse: "independent bookstores, record stores, markets, boutiques, and local shops",

   food: "local restaurants, bakeries, food halls, cafes, and neighborhood food",
};

const activityTypeSignals: Readonly<Record<ActivityKind, readonly string[]>> = {
   outdoors: ["park", "national_park", "state_park", "hiking_area", "botanical_garden", "garden", "tourist_attraction", "natural_feature"],

   culture: ["museum", "art_gallery", "library", "historical_landmark", "historical_place", "performing_arts_theater", "cultural_center", "tourist_attraction"],

   browse: ["book_store", "record_store", "store", "shopping_mall", "market", "gift_shop", "clothing_store", "home_goods_store"],

   food: ["restaurant", "cafe", "bakery", "food_court", "meal_takeaway", "coffee_shop"],
};

const categoryByActivity: Readonly<Record<ActivityKind, PlaceCategory>> = {
   outdoors: "parks-outdoors",
   culture: "culture",
   browse: "shopping",
   food: "food",
};

const visitDurationByActivity: Readonly<
   Record<
      ActivityKind,
      Readonly<{
         minimum: number;
         maximum: number;
      }>
   >
> = {
   outdoors: {
      minimum: 60,
      maximum: 120,
   },

   culture: {
      minimum: 75,
      maximum: 120,
   },

   browse: {
      minimum: 45,
      maximum: 75,
   },

   food: {
      minimum: 60,
      maximum: 90,
   },
};

function createCacheKey(context: SearchContext): string {
   return [context.metroRegionId, context.municipalityId, context.localAreaId, context.activity].join(":");
}

function createTextQuery(context: SearchContext): string {
   const location = [context.localAreaName, context.municipalityName, context.stateOrRegion].join(", ");

   return `${activityQueryLanguage[context.activity]} in ${location}`;
}

function mapBusinessStatus(status: GooglePlace["businessStatus"]): ProviderBusinessStatus {
   switch (status) {
      case "OPERATIONAL":
         return "operational";

      case "CLOSED_TEMPORARILY":
         return "temporarily-closed";

      case "CLOSED_PERMANENTLY":
         return "permanently-closed";

      default:
         return "unknown";
   }
}

function slugify(value: string): string {
   return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
}

function createSafeProviderId(value: string): string {
   return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function getPlaceTypes(place: GooglePlace): readonly string[] {
   return Array.from(new Set([place.primaryType, ...(place.types ?? [])].filter((type): type is string => typeof type === "string" && type.length > 0)));
}

/**
 * Provider order supplies relevance, but Sidewalk gives additional weight to
 * clear activity matches and operational places.
 *
 * Ratings, review totals, and popularity metrics are not used.
 */
function scoreCandidate(place: GooglePlace, activity: ActivityKind, providerIndex: number, municipalityName: string): number {
   const types = getPlaceTypes(place);
   const signals = activityTypeSignals[activity];

   let score = 100 - providerIndex;

   if (place.businessStatus === "OPERATIONAL") {
      score += 20;
   }

   const matchingTypes = types.filter((type) => signals.includes(type));

   score += matchingTypes.length * 15;

   if (place.formattedAddress?.toLowerCase().includes(municipalityName.toLowerCase())) {
      score += 10;
   }

   return score;
}

function selectCandidate(places: readonly GooglePlace[], context: SearchContext): GooglePlace | null {
   const eligiblePlaces = places.filter((place) => {
      const name = place.displayName?.text?.trim();

      return Boolean(place.id) && Boolean(name) && place.businessStatus !== "CLOSED_TEMPORARILY" && place.businessStatus !== "CLOSED_PERMANENTLY";
   });

   const rankedPlaces = eligiblePlaces
      .map((place, providerIndex) => ({
         place,
         providerIndex,
         score: scoreCandidate(place, context.activity, providerIndex, context.municipalityName),
      }))
      .sort((firstCandidate, secondCandidate) => {
         if (firstCandidate.score !== secondCandidate.score) {
            return secondCandidate.score - firstCandidate.score;
         }

         return firstCandidate.providerIndex - secondCandidate.providerIndex;
      });

   return rankedPlaces[0]?.place ?? null;
}

function createEditorialSummary(placeName: string, context: SearchContext): string {
   switch (context.activity) {
      case "outdoors":
         return `${placeName} gives ${context.localAreaName} a clear outdoor anchor for the day.`;

      case "culture":
         return `${placeName} offers a focused cultural stop without turning the day into a long list.`;

      case "browse":
         return `${placeName} gives the day one specific place to browse and explore at an unhurried pace.`;

      case "food":
         return `${placeName} creates a purposeful food stop that can anchor the rest of the outing.`;
   }
}

function createEditorialReason(context: SearchContext): string {
   return `It matches the selected activity and keeps the first stop connected to ${context.localAreaName}, ${context.municipalityName}.`;
}

function normalizePlace(place: GooglePlace, context: SearchContext): Place | null {
   const providerPlaceId = place.id;
   const name = place.displayName?.text?.trim();

   if (!providerPlaceId || !name) {
      return null;
   }

   const safeProviderId = createSafeProviderId(providerPlaceId);

   if (!safeProviderId) {
      return null;
   }

   return {
      id: `place-google-${safeProviderId}`,
      slug: `${slugify(name)}-${safeProviderId.slice(-8).toLowerCase()}`,

      metroRegionId: context.metroRegionId,
      municipalityId: context.municipalityId,
      localAreaId: context.localAreaId,

      provider: {
         source: "google-places",
         providerPlaceId,
         name,
         businessStatus: mapBusinessStatus(place.businessStatus),

         formattedAddress: place.formattedAddress ?? null,

         latitude: place.location?.latitude ?? null,

         longitude: place.location?.longitude ?? null,

         primaryType: place.primaryType ?? null,

         types: getPlaceTypes(place),

         websiteUrl: place.websiteUri ?? null,

         mapsUrl: place.googleMapsUri ?? null,
      },

      editorial: {
         approvalStatus: "approved",
         editorialTier: "sidewalk-pick",
         category: categoryByActivity[context.activity],

         activities: [context.activity],
         dayRoles: ["first-anchor", "follow-up"],

         summary: createEditorialSummary(name, context),

         reasonToVisit: createEditorialReason(context),

         visitDurationMinutes: visitDurationByActivity[context.activity],
      },
   };
}

async function requestGooglePlaces(context: SearchContext): Promise<readonly GooglePlace[]> {
   const apiKey = process.env.GOOGLE_PLACES_API_KEY;

   if (!apiKey) {
      throw new Error("Google Places is not configured. Add GOOGLE_PLACES_API_KEY to .env.local.");
   }

   const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",

      headers: {
         "Content-Type": "application/json",
         "X-Goog-Api-Key": apiKey,
         "X-Goog-FieldMask": ["places.id", "places.displayName", "places.formattedAddress", "places.location", "places.primaryType", "places.types", "places.businessStatus", "places.websiteUri", "places.googleMapsUri"].join(","),
      },

      body: JSON.stringify({
         textQuery: createTextQuery(context),
         languageCode: "en",
         regionCode: "US",
         maxResultCount: 10,
         rankPreference: "RELEVANCE",
      }),

      /*
       * Sidewalk controls caching explicitly below because this is a POST
       * provider request.
       */
      cache: "no-store",
   });

   if (!response.ok) {
      let providerMessage = "";

      try {
         const providerError = (await response.json()) as {
            error?: {
               message?: string;
            };
         };

         providerMessage = providerError.error?.message ?? "";
      } catch {
         providerMessage = "";
      }

      throw new Error(providerMessage || `Google Places returned HTTP ${response.status}.`);
   }

   const payload = (await response.json()) as GoogleTextSearchResponse;

   return payload.places ?? [];
}

/**
 * Returns one live first-anchor candidate for any valid Sidewalk geography.
 */
export async function getGooglePlacesRecommendation(context: SearchContext): Promise<Place | null> {
   const cacheKey = createCacheKey(context);
   const cached = recommendationCache.get(cacheKey);

   if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
   }

   const places = await requestGooglePlaces(context);

   const selectedCandidate = selectCandidate(places, context);

   const recommendation = selectedCandidate ? normalizePlace(selectedCandidate, context) : null;

   recommendationCache.set(cacheKey, {
      expiresAt: Date.now() + cacheDurationMilliseconds,

      value: recommendation,
   });

   return recommendation;
}
