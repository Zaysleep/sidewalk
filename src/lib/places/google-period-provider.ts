import "server-only";

import type { ActivityDirection, ActivityKind } from "@/types/activity";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { CommittedStopContext, PeriodRecommendation } from "@/types/period-recommendation";
import { getDestinationIsoDate } from "@/lib/geography/destination-date";
import { getLocalAreaSearchAuthority } from "@/data/geography/local-area-search-authority";
import type { Place, PlaceCategory, ProviderBusinessStatus, ProviderPeriodAvailability } from "@/types/place";

type Coordinates = Readonly<{
   latitude: number;
   longitude: number;
}>;

type GooglePhoto = Readonly<{
   name?: string;
}>;

type GoogleDate = Readonly<{
   year?: number;
   month?: number;
   day?: number;
}>;

type GoogleOpeningPoint = Readonly<{
   day?: number;
   hour?: number;
   minute?: number;
   date?: GoogleDate;
}>;

type GoogleOpeningPeriod = Readonly<{
   open?: GoogleOpeningPoint;
   close?: GoogleOpeningPoint;
}>;

type GoogleOpeningHours = Readonly<{
   periods?: readonly GoogleOpeningPeriod[];
   weekdayDescriptions?: readonly string[];
}>;

type OpeningInterval = Readonly<{
   startMinuteOfWeek: number;
   endMinuteOfWeek: number;
}>;

type AvailabilityConfidence = "current" | "regular" | "unknown";

type PeriodAvailabilityAnalysis = Readonly<{
   availability: ProviderPeriodAvailability;

   confidence: AvailabilityConfidence;

   overlapMinutes: number | null;
   coverageRatio: number | null;
}>;

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

   rating?: number;
   userRatingCount?: number;

   photos?: readonly GooglePhoto[];

   websiteUri?: string;
   googleMapsUri?: string;

   regularOpeningHours?: GoogleOpeningHours;
   currentOpeningHours?: GoogleOpeningHours;
   utcOffsetMinutes?: number;
}>;

type GoogleSearchResponse = Readonly<{
   places?: readonly GooglePlace[];
}>;

type ActivityProfile = Readonly<{
   activity: ActivityKind;
   query: string;
}>;

type DistanceStage = "nearby" | "expanded" | "fallback";

type ActivityDistanceRules = Readonly<{
   nearby: number;
   expanded: number;
   fallback: number;
}>;

export type PeriodSearchContext = Readonly<{
   countryCode: string;
   countryName: string;

   regionCode: string;
   regionName: string;

   timezone: string;

   metroRegionId: string;
   metroRegionName: string;

   municipalityId: string;
   municipalityName: string;

   /**
    * Compatibility/display value retained while Geography V2 migrates.
    * Provider queries use canonical regionName instead.
    */
   stateOrRegion: string;

   localAreaId: string;
   localAreaName: string;

   dayPeriod: DayPeriod;

   activityDirection: ActivityDirection;

   planningDate: string;

   sessionSeed: string;

   variationIndex: number;

   excludedPlaceIds: readonly string[];

   committedStops: readonly CommittedStopContext[];
}>;

type ScoredCandidate = Readonly<{
   place: GooglePlace;

   activity: ActivityKind;

   distanceMeters: number;

   qualityScore: number;

   seededScore: number;

   availability: ProviderPeriodAvailability;
}>;

type CachedRecommendations = Readonly<{
   expiresAt: number;

   value: readonly PeriodRecommendation[];
}>;

type CachedAreaCenter = Readonly<{
   expiresAt: number;
   value: Coordinates;
}>;

const recommendationCache = new Map<string, CachedRecommendations>();

const areaCenterCache = new Map<string, CachedAreaCenter>();

const inFlightRecommendationRequests = new Map<string, Promise<readonly PeriodRecommendation[]>>();

const inFlightAreaCenterRequests = new Map<string, Promise<Coordinates>>();

const maximumRecommendationCacheEntries = 500;

const maximumAreaCenterCacheEntries = 250;

const recommendationCacheDurationMilliseconds = 6 * 60 * 60 * 1000;

const areaCenterCacheDurationMilliseconds = 7 * 24 * 60 * 60 * 1000;

const googlePlacesRequestTimeoutMilliseconds = 8_000;

/**
 * L1A calibration keeps "worth someone's time" ahead of raw provider rank.
 *
 * These are intentionally soft editorial preferences rather than hard market
 * assumptions. Sparse neighborhoods can still fall back to a broader pool.
 */
const recommendationQualityCalibration = {
   minimumReliableRatingCount: 15,
   strongerReliableRatingCount: 50,

   minimumReliableRating: 3.5,
   minimumStrongerReliableRating: 3.8,

   sidewalkChoiceStrongScore: 66,
   directedChoiceStrongScore: 76,

   maximumSeedVariationBonus: 4,
   nationalChainPenalty: 14,
} as const;

/**
 * L1B treats a good Sidewalk day as a sequence of complementary experiences,
 * not five individually-good stops that all feel the same.
 *
 * These adjustments apply only to Sidewalk Choice. When someone explicitly
 * asks for Food, Browse, Culture, or Outdoors, their direction remains the
 * authority.
 */
const dayVarietyCalibration = {
   unseenActivityBonus: 11,
   broadDayBonus: 3,

   repeatedActivityBasePenalty: 6,
   repeatedActivityStepPenalty: 5,
   maximumRepeatedActivityPenalty: 18,

   consecutiveRepeatPenalty: 8,
   adjacentDifferentActivityBonus: 3,

   saturatedActivityPenalty: 4,
} as const;

/**
 * L1C catches recommendations that technically match a provider query but do
 * not make much sense for the selected activity or time of day.
 *
 * The penalties remain soft. Sidewalk can still use a less-perfect candidate
 * in a sparse market instead of returning an empty recommendation set.
 */
const contextFitCalibration = {
   preferredTypeBonus: 7,
   preferredPrimaryTypeBonus: 3,

   discouragedTypePenalty: 10,
   discouragedPrimaryTypePenalty: 4,

   activityPrimaryMatchBonus: 4,
   activityPrimaryMismatchPenalty: 9,
   genericOnlyPenalty: 5,

   lowIntentPrimaryTypePenalty: 14,
} as const;

/**
 * Provider types that often surface because they are nearby businesses, not
 * because they are worthwhile Sidewalk experiences.
 *
 * This is a scoring penalty rather than a hard block so an unusual local place
 * can still survive when the rest of its signals are exceptionally strong.
 */
const lowIntentPrimaryTypes = new Set([
   "apartment_building",
   "atm",
   "bank",
   "beauty_salon",
   "car_dealer",
   "car_rental",
   "car_repair",
   "car_wash",
   "convenience_store",
   "dentist",
   "doctor",
   "electrician",
   "gas_station",
   "grocery_store",
   "gym",
   "hair_salon",
   "hospital",
   "hotel",
   "insurance_agency",
   "laundry",
   "lodging",
   "motel",
   "moving_company",
   "nail_salon",
   "parking",
   "pharmacy",
   "plumber",
   "real_estate_agency",
   "storage",
   "supermarket",
]);

const preferredTypesByPeriod: Readonly<Record<DayPeriod, Readonly<Record<ActivityKind, readonly string[]>>>> = {
   "early-morning": {
      outdoors: ["park", "national_park", "state_park", "hiking_area", "botanical_garden"],
      food: ["breakfast_restaurant", "bakery", "coffee_shop", "cafe"],
      browse: ["market"],
      culture: ["historical_landmark", "botanical_garden"],
   },

   morning: {
      outdoors: ["park", "national_park", "state_park", "hiking_area", "botanical_garden"],
      food: ["breakfast_restaurant", "brunch_restaurant", "bakery", "coffee_shop", "cafe"],
      browse: ["book_store", "market", "record_store"],
      culture: ["museum", "art_museum", "art_gallery", "library", "historical_landmark"],
   },

   afternoon: {
      outdoors: ["park", "national_park", "state_park", "hiking_area", "botanical_garden"],
      food: ["restaurant", "cafe", "bakery"],
      browse: ["book_store", "record_store", "market", "gift_shop", "clothing_store", "home_goods_store"],
      culture: ["museum", "art_museum", "art_gallery", "library", "historical_landmark", "cultural_center"],
   },

   evening: {
      outdoors: ["park", "tourist_attraction"],
      food: ["restaurant", "dessert_shop"],
      browse: ["market", "record_store", "video_arcade"],
      culture: ["performing_arts_theater", "concert_hall", "comedy_club", "event_venue", "bar", "night_club"],
   },

   night: {
      outdoors: ["tourist_attraction"],
      food: ["restaurant", "dessert_shop"],
      browse: ["video_arcade", "market", "record_store"],
      culture: ["bar", "night_club", "comedy_club", "concert_hall", "event_venue", "performing_arts_theater"],
   },
};

const discouragedTypesByPeriod: Readonly<Record<DayPeriod, Readonly<Record<ActivityKind, readonly string[]>>>> = {
   "early-morning": {
      outdoors: ["event_venue"],
      food: ["dessert_shop", "bar", "night_club"],
      browse: ["shopping_mall", "video_arcade", "clothing_store", "home_goods_store", "record_store"],
      culture: ["bar", "night_club", "comedy_club", "concert_hall", "performing_arts_theater", "event_venue"],
   },

   morning: {
      outdoors: ["event_venue"],
      food: ["bar", "night_club", "dessert_shop"],
      browse: ["video_arcade"],
      culture: ["bar", "night_club", "comedy_club", "concert_hall", "event_venue"],
   },

   afternoon: {
      outdoors: [],
      food: ["breakfast_restaurant", "brunch_restaurant"],
      browse: [],
      culture: ["night_club"],
   },

   evening: {
      outdoors: ["hiking_area", "national_park", "state_park"],
      food: ["breakfast_restaurant", "brunch_restaurant"],
      browse: [],
      culture: ["library"],
   },

   night: {
      outdoors: ["hiking_area", "national_park", "state_park", "botanical_garden"],
      food: ["breakfast_restaurant", "brunch_restaurant", "bakery", "coffee_shop"],
      browse: ["shopping_mall", "home_goods_store", "gift_shop"],
      culture: ["museum", "art_museum", "art_gallery", "library"],
   },
};

function pruneExpiringCache<T>(
   cache: Map<
      string,
      Readonly<{
         expiresAt: number;
         value: T;
      }>
   >,
   maximumEntries: number,
) {
   const now = Date.now();

   for (const [key, entry] of cache) {
      if (entry.expiresAt <= now) {
         cache.delete(key);
      }
   }

   while (cache.size >= maximumEntries) {
      const oldestKey = cache.keys().next().value;

      if (typeof oldestKey !== "string") {
         break;
      }

      cache.delete(oldestKey);
   }
}

export class PlacesProviderTimeoutError extends Error {
   constructor() {
      super("The Google Places request timed out.");

      this.name = "PlacesProviderTimeoutError";
   }
}

type ProviderLogStage = "area-center" | DistanceStage;

function logProviderEvent(
   context: PeriodSearchContext,
   details: Readonly<{
      stage: ProviderLogStage;
      providerStatus: "ok" | "error" | "timeout";
      elapsedMilliseconds: number;
      candidateCount?: number;
      activity?: ActivityKind;
      httpStatus?: number;
   }>,
) {
   console.info("Sidewalk places provider", {
      stage: details.stage,
      dayPeriod: context.dayPeriod,
      activityDirection: context.activityDirection,
      activity: details.activity,
      providerStatus: details.providerStatus,
      elapsedMilliseconds: details.elapsedMilliseconds,
      candidateCount: details.candidateCount,
      httpStatus: details.httpStatus,
   });
}

async function fetchGooglePlaces(
   request: RequestInfo | URL,
   init: RequestInit,
   context: PeriodSearchContext,
   details: Readonly<{
      stage: ProviderLogStage;
      activity?: ActivityKind;
   }>,
): Promise<Response> {
   const controller = new AbortController();

   const startedAt = performance.now();

   const timeoutId = setTimeout(() => {
      controller.abort();
   }, googlePlacesRequestTimeoutMilliseconds);

   try {
      const response = await fetch(request, {
         ...init,
         signal: controller.signal,
      });

      logProviderEvent(context, {
         ...details,
         providerStatus: response.ok ? "ok" : "error",
         elapsedMilliseconds: Math.round(performance.now() - startedAt),
         httpStatus: response.status,
      });

      return response;
   } catch (error: unknown) {
      const didTimeout = error instanceof Error && error.name === "AbortError";

      logProviderEvent(context, {
         ...details,
         providerStatus: didTimeout ? "timeout" : "error",
         elapsedMilliseconds: Math.round(performance.now() - startedAt),
      });

      if (didTimeout) {
         throw new PlacesProviderTimeoutError();
      }

      throw error;
   } finally {
      clearTimeout(timeoutId);
   }
}

const distanceRulesByActivity: Readonly<Record<ActivityKind, ActivityDistanceRules>> = {
   food: {
      nearby: 2_400,
      expanded: 4_000,
      fallback: 6_400,
   },

   browse: {
      nearby: 2_400,
      expanded: 4_000,
      fallback: 6_400,
   },

   culture: {
      nearby: 3_200,
      expanded: 5_600,
      fallback: 8_000,
   },

   outdoors: {
      nearby: 4_800,
      expanded: 8_000,
      fallback: 11_200,
   },
};

const profilesByPeriod: Readonly<Record<DayPeriod, readonly ActivityProfile[]>> = {
   "early-morning": [
      {
         activity: "outdoors",
         query: "sunrise viewpoints, beaches, parks, scenic walks, hiking trails, and outdoor attractions open early",
      },
      {
         activity: "food",
         query: "early breakfast restaurants, bakeries, coffee shops, cafes, and donut shops",
      },
      {
         activity: "browse",
         query: "farmers markets, flower markets, neighborhood markets, and local shops open early",
      },
      {
         activity: "culture",
         query: "historic landmarks, public gardens, libraries, museums, and cultural attractions open early",
      },
   ],

   morning: [
      {
         activity: "outdoors",
         query: "parks, gardens, scenic walks, hiking trails, beaches, and outdoor attractions",
      },
      {
         activity: "food",
         query: "breakfast restaurants, brunch restaurants, bakeries, coffee shops, cafes, and morning markets",
      },
      {
         activity: "browse",
         query: "independent bookstores, farmers markets, neighborhood markets, and local shops",
      },
      {
         activity: "culture",
         query: "museums, libraries, historic sites, gardens, and daytime cultural attractions",
      },
   ],

   afternoon: [
      {
         activity: "culture",
         query: "museums, galleries, libraries, historic sites, and cultural attractions",
      },
      {
         activity: "browse",
         query: "independent bookstores, record stores, boutiques, markets, and local shops",
      },
      {
         activity: "outdoors",
         query: "parks, beaches, scenic walks, gardens, and outdoor attractions",
      },
      {
         activity: "food",
         query: "local restaurants, food halls, bakeries, cafes, and neighborhood food",
      },
   ],

   evening: [
      {
         activity: "food",
         query: "dinner restaurants, dessert shops, food halls, and evening dining",
      },
      {
         activity: "culture",
         query: "live music venues, theaters, comedy clubs, performances, and evening cultural attractions",
      },
      {
         activity: "outdoors",
         query: "sunset viewpoints, waterfront walks, scenic overlooks, and evening parks",
      },
      {
         activity: "browse",
         query: "night markets, evening markets, record stores, and local shops open late",
      },
   ],

   night: [
      {
         activity: "food",
         query: "late-night restaurants, diners, taco shops, dessert shops, supper clubs, and food open after 9 PM",
      },
      {
         activity: "culture",
         query: "cocktail bars, speakeasies, live music venues, comedy clubs, nightclubs, lounges, and late-night entertainment",
      },
      {
         activity: "browse",
         query: "night markets, late-night arcades, record stores, and local shops open after 9 PM",
      },
      {
         activity: "outdoors",
         query: "waterfront walks, illuminated public spaces, scenic overlooks, and outdoor attractions open at night",
      },
   ],
};

const typeSignals: Readonly<Record<ActivityKind, readonly string[]>> = {
   outdoors: ["park", "national_park", "state_park", "hiking_area", "botanical_garden", "tourist_attraction"],

   culture: ["museum", "art_museum", "art_gallery", "library", "historical_landmark", "performing_arts_theater", "cultural_center", "tourist_attraction", "concert_hall", "comedy_club", "event_venue", "bar", "night_club"],

   browse: ["book_store", "store", "shopping_mall", "market", "gift_shop", "clothing_store", "home_goods_store", "record_store", "video_arcade"],

   food: ["restaurant", "cafe", "bakery", "food_court", "meal_takeaway", "coffee_shop", "dessert_shop"],
};

/**
 * A short editorial list used only as a soft scoring penalty.
 *
 * Sidewalk can still return one of these places when a neighborhood is sparse;
 * they simply should not outrank a comparable local option by default.
 */
const nationalChainBrandKeys = new Set([
   "applebees",
   "applebees grill bar",
   "barnes noble",
   "burger king",
   "chick fil a",
   "chilis",
   "chilis grill bar",
   "chipotle mexican grill",
   "costco",
   "costco wholesale",
   "dennys",
   "dunkin",
   "gap",
   "h m",
   "ihop",
   "jack in the box",
   "mcdonalds",
   "olive garden",
   "olive garden italian restaurant",
   "old navy",
   "panera bread",
   "ross dress for less",
   "starbucks",
   "subway",
   "taco bell",
   "target",
   "the cheesecake factory",
   "tj maxx",
   "walmart",
   "wendys",
   "zara",
]);

/**
 * These provider types are useful but broad. A place that only matches one of
 * them receives less editorial confidence than a candidate with a more
 * specific activity signal.
 */
const genericActivityTypes = new Set(["event_venue", "food_court", "meal_takeaway", "restaurant", "shopping_mall", "store", "tourist_attraction"]);

const categoryByActivity: Readonly<Record<ActivityKind, PlaceCategory>> = {
   outdoors: "parks-outdoors",
   culture: "culture",
   browse: "shopping",
   food: "food",
};

const durationByPeriod: Readonly<
   Record<
      DayPeriod,
      Readonly<{
         minimum: number;
         maximum: number;
      }>
   >
> = {
   "early-morning": {
      minimum: 45,
      maximum: 90,
   },

   morning: {
      minimum: 60,
      maximum: 120,
   },

   afternoon: {
      minimum: 75,
      maximum: 120,
   },

   evening: {
      minimum: 75,
      maximum: 120,
   },

   night: {
      minimum: 60,
      maximum: 150,
   },
};

const periodWindowByDayPeriod: Readonly<
   Record<
      DayPeriod,
      Readonly<{
         startMinute: number;
         endMinute: number;
      }>
   >
> = {
   "early-morning": {
      startMinute: 5 * 60 + 30,
      endMinute: 8 * 60 + 30,
   },

   morning: {
      startMinute: 9 * 60,
      endMinute: 11 * 60 + 30,
   },

   afternoon: {
      startMinute: 12 * 60 + 30,
      endMinute: 16 * 60 + 30,
   },

   evening: {
      startMinute: 17 * 60 + 30,
      endMinute: 20 * 60 + 30,
   },

   /**
    * End minutes may extend beyond midnight. Twenty-six hours means 2:00 AM
    * on the calendar day following the selected planning date.
    */
   night: {
      startMinute: 21 * 60,
      endMinute: 26 * 60,
   },
};

/**
 * L2A rejects a place that is technically open during a period but not open
 * long enough to support a worthwhile visit.
 *
 * These are deliberately conservative minimums. Unknown hours remain eligible
 * because Sidewalk should not invent a closure when the provider has no data.
 */
const minimumUsefulOpenMinutesByPeriod: Readonly<Record<DayPeriod, number>> = {
   "early-morning": 45,
   morning: 45,
   afternoon: 45,
   evening: 60,
   night: 60,
};

const minimumUsefulOpenMinutesByActivity: Readonly<Record<ActivityKind, number>> = {
   outdoors: 45,
   food: 45,
   browse: 45,
   culture: 60,
};

function getMinimumUsefulOpenMinutes(dayPeriod: DayPeriod, activity: ActivityKind): number {
   return Math.max(minimumUsefulOpenMinutesByPeriod[dayPeriod], minimumUsefulOpenMinutesByActivity[activity]);
}

/**
 * L3 route sanity stays deliberately lightweight. Sidewalk is not a
 * navigation product; it simply avoids assembling a day that unnecessarily
 * jumps across town or immediately doubles back.
 */
const routeSanityCalibration = {
   veryCloseMeters: 1_500,
   nearbyMeters: 3_000,
   comfortableMeters: 5_000,
   longLegMeters: 8_000,
   excessiveLegMeters: 12_000,

   veryCloseBonus: 10,
   nearbyBonus: 7,
   comfortableBonus: 3,
   longLegPenalty: 4,
   excessiveLegPenalty: 10,
   extremeLegPenalty: 16,

   backtrackReturnMeters: 1_500,
   previousLegMinimumMeters: 2_500,
   backtrackPenalty: 7,
} as const;

function getApiKey(): string {
   const apiKey = process.env.GOOGLE_PLACES_API_KEY;

   if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is missing.");
   }

   return apiKey;
}

function getBestWindow(dayPeriod: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === dayPeriod)?.bestWindow ?? "";
}

function getRecommendationHoursCacheSegment(): string {
   const sixHourBucketMilliseconds = 6 * 60 * 60 * 1000;

   return String(Math.floor(Date.now() / sixHourBucketMilliseconds));
}

function getPointDay(point: GoogleOpeningPoint): number | null {
   if (typeof point.day === "number") {
      return point.day;
   }

   const date = point.date;

   if (typeof date?.year !== "number" || typeof date.month !== "number" || typeof date.day !== "number") {
      return null;
   }

   return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

function getMinuteOfWeek(point: GoogleOpeningPoint): number | null {
   const day = getPointDay(point);

   if (day === null) {
      return null;
   }

   const hour = typeof point.hour === "number" ? point.hour : 0;

   const minute = typeof point.minute === "number" ? point.minute : 0;

   return day * 24 * 60 + hour * 60 + minute;
}

function getOpeningIntervals(hours: GoogleOpeningHours): readonly OpeningInterval[] {
   const minutesPerWeek = 7 * 24 * 60;

   return (hours.periods ?? []).flatMap((period) => {
      if (!period.open) {
         return [];
      }

      const startMinuteOfWeek = getMinuteOfWeek(period.open);

      if (startMinuteOfWeek === null) {
         return [];
      }

      if (!period.close) {
         return [
            {
               startMinuteOfWeek,
               endMinuteOfWeek: startMinuteOfWeek + minutesPerWeek,
            },
         ];
      }

      const rawEndMinuteOfWeek = getMinuteOfWeek(period.close);

      if (rawEndMinuteOfWeek === null) {
         return [];
      }

      const endMinuteOfWeek = rawEndMinuteOfWeek <= startMinuteOfWeek ? rawEndMinuteOfWeek + minutesPerWeek : rawEndMinuteOfWeek;

      return [
         {
            startMinuteOfWeek,
            endMinuteOfWeek,
         },
      ];
   });
}

function parsePlanningDate(planningDate: string): Readonly<{
   year: number;
   month: number;
   day: number;
   dayIndex: number;
}> {
   const [yearText, monthText, dayText] = planningDate.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   return {
      year,
      month,
      day,
      dayIndex: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
   };
}

function getPlaceLocalIsoDate(utcOffsetMinutes: number | undefined, destinationTimezone: string): string {
   if (typeof utcOffsetMinutes !== "number") {
      return getDestinationIsoDate(destinationTimezone);
   }

   const localDate = new Date(Date.now() + utcOffsetMinutes * 60 * 1000);

   const year = localDate.getUTCFullYear();
   const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
   const day = String(localDate.getUTCDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
}

function formatClockTime(minuteOfDay: number): string {
   const normalizedMinute = ((minuteOfDay % (24 * 60)) + 24 * 60) % (24 * 60);

   const hours24 = Math.floor(normalizedMinute / 60);
   const minutes = normalizedMinute % 60;

   const period = hours24 >= 12 ? "PM" : "AM";
   const hours12 = hours24 % 12 || 12;

   return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getOpeningHoursSource(
   place: GooglePlace,
   planningDate: string,
   destinationTimezone: string,
): Readonly<{
   hours: GoogleOpeningHours;
   source: "current-hours" | "regular-hours";
   confidence: Exclude<AvailabilityConfidence, "unknown">;
}> | null {
   const isTodayAtPlace = planningDate === getPlaceLocalIsoDate(place.utcOffsetMinutes, destinationTimezone);

   if (isTodayAtPlace && place.currentOpeningHours) {
      return {
         hours: place.currentOpeningHours,
         source: "current-hours",
         confidence: "current",
      };
   }

   if (place.regularOpeningHours) {
      return {
         hours: place.regularOpeningHours,
         source: "regular-hours",
         confidence: "regular",
      };
   }

   return null;
}

function analyzePeriodAvailability(place: GooglePlace, dayPeriod: DayPeriod, planningDate: string, destinationTimezone: string): PeriodAvailabilityAnalysis {
   const openingHoursSource = getOpeningHoursSource(place, planningDate, destinationTimezone);

   if (!openingHoursSource) {
      return {
         availability: {
            status: "hours-unavailable",
            source: "unavailable",
            label: "Check hours for this date",
            opensAt: null,
            closesAt: null,
         },
         confidence: "unknown",
         overlapMinutes: null,
         coverageRatio: null,
      };
   }

   const intervals = getOpeningIntervals(openingHoursSource.hours);

   const hasPublishedHours = intervals.length > 0 || (openingHoursSource.hours.weekdayDescriptions?.length ?? 0) > 0;

   if (!hasPublishedHours) {
      return {
         availability: {
            status: "hours-unavailable",
            source: "unavailable",
            label: "Check hours for this date",
            opensAt: null,
            closesAt: null,
         },
         confidence: "unknown",
         overlapMinutes: null,
         coverageRatio: null,
      };
   }

   const { dayIndex } = parsePlanningDate(planningDate);

   const periodWindow = periodWindowByDayPeriod[dayPeriod];

   const targetStart = dayIndex * 24 * 60 + periodWindow.startMinute;

   const targetEnd = dayIndex * 24 * 60 + periodWindow.endMinute;

   const targetMinutes = Math.max(1, targetEnd - targetStart);

   const minutesPerWeek = 7 * 24 * 60;

   const comparableIntervals = intervals.flatMap((interval) => [
      interval,
      {
         startMinuteOfWeek: interval.startMinuteOfWeek - minutesPerWeek,
         endMinuteOfWeek: interval.endMinuteOfWeek - minutesPerWeek,
      },
      {
         startMinuteOfWeek: interval.startMinuteOfWeek + minutesPerWeek,
         endMinuteOfWeek: interval.endMinuteOfWeek + minutesPerWeek,
      },
   ]);

   const fullyOpenInterval = comparableIntervals.find((interval) => interval.startMinuteOfWeek <= targetStart && interval.endMinuteOfWeek >= targetEnd) ?? null;

   if (fullyOpenInterval) {
      return {
         availability: {
            status: "open-through-window",
            source: openingHoursSource.source,
            label: openingHoursSource.confidence === "current" ? "Open throughout this window" : "Usually open throughout this window",
            opensAt: formatClockTime(fullyOpenInterval.startMinuteOfWeek),
            closesAt: formatClockTime(fullyOpenInterval.endMinuteOfWeek),
         },
         confidence: openingHoursSource.confidence,
         overlapMinutes: targetMinutes,
         coverageRatio: 1,
      };
   }

   const overlappingIntervals = comparableIntervals
      .map((interval) => {
         const overlapStart = Math.max(interval.startMinuteOfWeek, targetStart);

         const overlapEnd = Math.min(interval.endMinuteOfWeek, targetEnd);

         return {
            interval,
            overlapStart,
            overlapEnd,
            overlapMinutes: Math.max(0, overlapEnd - overlapStart),
         };
      })
      .filter((result) => result.overlapMinutes > 0)
      .sort((first, second) => second.overlapMinutes - first.overlapMinutes);

   const strongestOverlap = overlappingIntervals[0] ?? null;

   if (!strongestOverlap) {
      return {
         availability: {
            status: "closed-during-window",
            source: openingHoursSource.source,
            label: openingHoursSource.confidence === "current" ? "Closed during this window" : "Usually closed during this window",
            opensAt: null,
            closesAt: null,
         },
         confidence: openingHoursSource.confidence,
         overlapMinutes: 0,
         coverageRatio: 0,
      };
   }

   const overlapInterval = strongestOverlap.interval;

   const opensInsideWindow = overlapInterval.startMinuteOfWeek > targetStart && overlapInterval.startMinuteOfWeek < targetEnd;

   const closesInsideWindow = overlapInterval.endMinuteOfWeek > targetStart && overlapInterval.endMinuteOfWeek < targetEnd;

   const opensAt = opensInsideWindow ? formatClockTime(overlapInterval.startMinuteOfWeek) : null;

   const closesAt = closesInsideWindow ? formatClockTime(overlapInterval.endMinuteOfWeek) : null;

   const sourcePrefix = openingHoursSource.confidence === "regular" ? "Usually " : "";

   let label = `${sourcePrefix}open for part of this window`;

   if (opensAt && closesAt) {
      label = `${sourcePrefix}open ${opensAt}–${closesAt}`;
   } else if (opensAt) {
      label = `${sourcePrefix}opens at ${opensAt}`;
   } else if (closesAt) {
      label = `${sourcePrefix}open until ${closesAt}`;
   }

   return {
      availability: {
         status: "open-part-of-window",
         source: openingHoursSource.source,
         label,
         opensAt,
         closesAt,
      },
      confidence: openingHoursSource.confidence,
      overlapMinutes: strongestOverlap.overlapMinutes,
      coverageRatio: strongestOverlap.overlapMinutes / targetMinutes,
   };
}

function calculateAvailabilityScore(analysis: PeriodAvailabilityAnalysis): number {
   const isCurrent = analysis.confidence === "current";

   switch (analysis.availability.status) {
      case "open-through-window":
         return isCurrent ? 14 : 11;

      case "open-part-of-window": {
         const coverageRatio = analysis.coverageRatio ?? 0;

         /**
          * Current hours receive slightly more confidence than regular weekly
          * hours. Future-date recommendations remain useful without Sidewalk
          * pretending a normal schedule is a guarantee.
          */
         const baseScore = isCurrent ? 3 : 2;
         const coverageWeight = isCurrent ? 8 : 6;

         return baseScore + Math.round(coverageRatio * coverageWeight);
      }

      case "hours-unavailable":
         return 0;

      case "closed-during-window":
         return -50;
   }
}

function getProfilesForRequest(dayPeriod: DayPeriod, activityDirection: ActivityDirection): readonly ActivityProfile[] {
   const periodProfiles = profilesByPeriod[dayPeriod];

   if (activityDirection === "sidewalk-choice") {
      return periodProfiles;
   }

   return periodProfiles.filter((profile) => profile.activity === activityDirection);
}

function createAreaCenterCacheKey(context: PeriodSearchContext): string {
   return [context.metroRegionId, context.municipalityId, context.localAreaId].join(":");
}

/**
 * Ambiguous district names receive a curated search query and an optional
 * radius ceiling. Areas without an authority entry keep the provider's
 * existing generic geography behavior.
 */
function getAreaSearchQuery(context: PeriodSearchContext): string {
   const authority = getLocalAreaSearchAuthority(context.localAreaId);

   return authority?.searchQuery ?? [context.localAreaName, context.municipalityName, context.regionName, context.countryName].join(", ");
}

function getAreaSearchRadiusMeters(context: PeriodSearchContext, activity: ActivityKind, stage: DistanceStage): number {
   const defaultRadius = distanceRulesByActivity[activity][stage];

   const authority = getLocalAreaSearchAuthority(context.localAreaId);

   if (typeof authority?.maximumSearchRadiusMeters !== "number") {
      return defaultRadius;
   }

   return Math.min(defaultRadius, authority.maximumSearchRadiusMeters);
}

function createCommittedStopsCacheSegment(committedStops: readonly CommittedStopContext[]): string {
   return [...committedStops]
      .sort((first, second) => dayPeriods.indexOf(first.dayPeriod) - dayPeriods.indexOf(second.dayPeriod))
      .map((stop) => [stop.dayPeriod, stop.placeId, stop.resolvedActivity, stop.latitude ?? "none", stop.longitude ?? "none"].join("~"))
      .join(",");
}

function createRecommendationCacheKey(context: PeriodSearchContext): string {
   return [
      context.metroRegionId,
      context.municipalityId,
      context.localAreaId,
      context.dayPeriod,
      context.activityDirection,
      context.planningDate,
      context.sessionSeed,
      context.variationIndex,
      getRecommendationHoursCacheSegment(),
      [...context.excludedPlaceIds].sort().join(","),
      createCommittedStopsCacheSegment(context.committedStops),
   ].join(":");
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

function sanitizeProviderId(value: string): string {
   return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function getTypes(place: GooglePlace): readonly string[] {
   return Array.from(new Set([place.primaryType, ...(place.types ?? [])].filter((type): type is string => typeof type === "string" && type.length > 0)));
}

function hasAnyProviderType(place: GooglePlace, types: readonly string[]): boolean {
   if (types.length === 0) {
      return false;
   }

   const placeTypes = getTypes(place);

   return types.some((type) => placeTypes.includes(type));
}

function calculatePrimaryActivityAlignmentScore(place: GooglePlace, activity: ActivityKind): number {
   const primaryType = place.primaryType;

   if (!primaryType) {
      return 0;
   }

   if (genericActivityTypes.has(primaryType)) {
      return 0;
   }

   if (typeSignals[activity].includes(primaryType)) {
      return contextFitCalibration.activityPrimaryMatchBonus;
   }

   const belongsToAnotherActivity = (Object.entries(typeSignals) as readonly [ActivityKind, readonly string[]][]).some(([candidateActivity, candidateTypes]) => candidateActivity !== activity && candidateTypes.includes(primaryType));

   return belongsToAnotherActivity ? -contextFitCalibration.activityPrimaryMismatchPenalty : 0;
}

function calculateGenericOnlyPenalty(place: GooglePlace, activity: ActivityKind): number {
   const matchingTypes = getTypes(place).filter((type) => typeSignals[activity].includes(type));

   if (matchingTypes.length === 0) {
      return -contextFitCalibration.genericOnlyPenalty;
   }

   const hasSpecificMatch = matchingTypes.some((type) => !genericActivityTypes.has(type));

   return hasSpecificMatch ? 0 : -contextFitCalibration.genericOnlyPenalty;
}

function calculatePeriodContextScore(place: GooglePlace, activity: ActivityKind, dayPeriod: DayPeriod): number {
   const preferredTypes = preferredTypesByPeriod[dayPeriod][activity];

   const discouragedTypes = discouragedTypesByPeriod[dayPeriod][activity];

   let score = 0;

   if (hasAnyProviderType(place, preferredTypes)) {
      score += contextFitCalibration.preferredTypeBonus;
   }

   if (place.primaryType && preferredTypes.includes(place.primaryType)) {
      score += contextFitCalibration.preferredPrimaryTypeBonus;
   }

   if (hasAnyProviderType(place, discouragedTypes)) {
      score -= contextFitCalibration.discouragedTypePenalty;
   }

   if (place.primaryType && discouragedTypes.includes(place.primaryType)) {
      score -= contextFitCalibration.discouragedPrimaryTypePenalty;
   }

   if (place.primaryType && lowIntentPrimaryTypes.has(place.primaryType)) {
      score -= contextFitCalibration.lowIntentPrimaryTypePenalty;
   }

   score += calculatePrimaryActivityAlignmentScore(place, activity);

   score += calculateGenericOnlyPenalty(place, activity);

   return score;
}

function getCoordinates(place: GooglePlace): Coordinates | null {
   const latitude = place.location?.latitude;

   const longitude = place.location?.longitude;

   if (typeof latitude !== "number" || typeof longitude !== "number") {
      return null;
   }

   return {
      latitude,
      longitude,
   };
}

function getCommittedStopCoordinates(stop: CommittedStopContext): Coordinates | null {
   if (typeof stop.latitude !== "number" || typeof stop.longitude !== "number") {
      return null;
   }

   return {
      latitude: stop.latitude,
      longitude: stop.longitude,
   };
}

function degreesToRadians(degrees: number): number {
   return (degrees * Math.PI) / 180;
}

function calculateDistanceMeters(first: Coordinates, second: Coordinates): number {
   const earthRadiusMeters = 6_371_000;

   const latitudeDifference = degreesToRadians(second.latitude - first.latitude);

   const longitudeDifference = degreesToRadians(second.longitude - first.longitude);

   const firstLatitude = degreesToRadians(first.latitude);

   const secondLatitude = degreesToRadians(second.latitude);

   const haversine = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2;

   const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

   return earthRadiusMeters * angularDistance;
}

function hashString(value: string): number {
   let hash = 2166136261;

   for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
   }

   return hash >>> 0;
}

function seededNumber(seed: string): number {
   return hashString(seed) / 0xffffffff;
}

function calculateRatingConfidence(rating: number | undefined, ratingCount: number | undefined): number {
   if (typeof rating !== "number" || typeof ratingCount !== "number" || ratingCount <= 0) {
      return 0;
   }

   const globalMean = 4.2;
   const confidenceWeight = 80;

   const adjustedRating = (ratingCount * rating + confidenceWeight * globalMean) / (ratingCount + confidenceWeight);

   return Math.max(0, Math.min(1, (adjustedRating - 3.5) / 1.5));
}

function calculateDistanceFit(distanceMeters: number, activity: ActivityKind, maximumDistance: number): number {
   const idealDistance = distanceRulesByActivity[activity].nearby;

   if (distanceMeters <= idealDistance) {
      return 1;
   }

   if (distanceMeters >= maximumDistance) {
      return 0;
   }

   return 1 - (distanceMeters - idealDistance) / (maximumDistance - idealDistance);
}

function normalizeName(value: string): string {
   return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(the|a|an)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
}

/**
 * Removes common branch suffixes so names such as:
 *
 * "Example Coffee | North Park"
 * "Example Coffee - Downtown"
 *
 * share one brand key.
 */
function createBrandKey(value: string): string {
   const firstSegment =
      value
         .split(/\s(?:-|–|—|\||·)\s/)[0]
         ?.split(/\s+at\s+/i)[0]
         ?.trim() ?? value;

   return normalizeName(firstSegment);
}

function isLikelyNationalChain(place: GooglePlace): boolean {
   const name = place.displayName?.text?.trim();

   if (!name) {
      return false;
   }

   return nationalChainBrandKeys.has(createBrandKey(name));
}

function isClearlyLowQuality(place: GooglePlace): boolean {
   const rating = place.rating;

   const ratingCount = place.userRatingCount;

   if (typeof rating !== "number" || typeof ratingCount !== "number" || ratingCount <= 0) {
      return false;
   }

   if (ratingCount >= recommendationQualityCalibration.strongerReliableRatingCount && rating < recommendationQualityCalibration.minimumStrongerReliableRating) {
      return true;
   }

   return ratingCount >= recommendationQualityCalibration.minimumReliableRatingCount && rating < recommendationQualityCalibration.minimumReliableRating;
}

function calculateReviewDepthScore(ratingCount: number | undefined): number {
   if (typeof ratingCount !== "number" || ratingCount <= 0) {
      return -4;
   }

   if (ratingCount >= 500) {
      return 4;
   }

   if (ratingCount >= 150) {
      return 3;
   }

   if (ratingCount >= 50) {
      return 2;
   }

   if (ratingCount >= 15) {
      return 1;
   }

   return 0;
}

function calculateEditorialSpecificityScore(place: GooglePlace, activity: ActivityKind): number {
   const matchingTypes = getTypes(place).filter((type) => typeSignals[activity].includes(type));

   const specificMatches = matchingTypes.filter((type) => !genericActivityTypes.has(type));

   if (specificMatches.length >= 2) {
      return 6;
   }

   if (specificMatches.length === 1) {
      return 3;
   }

   if (matchingTypes.length > 0) {
      return -3;
   }

   return -8;
}

function getStrongCandidateMinimumScore(context: PeriodSearchContext): number {
   return context.activityDirection === "sidewalk-choice" ? recommendationQualityCalibration.sidewalkChoiceStrongScore : recommendationQualityCalibration.directedChoiceStrongScore;
}

function isStrongCandidate(candidate: ScoredCandidate, context: PeriodSearchContext): boolean {
   return candidate.qualityScore >= getStrongCandidateMinimumScore(context);
}

function getCommittedActivityCount(context: PeriodSearchContext, activity: ActivityKind): number {
   return context.committedStops.filter((stop) => stop.resolvedActivity === activity).length;
}

function getCommittedActivityKinds(context: PeriodSearchContext): ReadonlySet<ActivityKind> {
   return new Set(context.committedStops.map((stop) => stop.resolvedActivity));
}

function calculateDayVarietyScore(activity: ActivityKind, context: PeriodSearchContext): number {
   if (context.activityDirection !== "sidewalk-choice" || context.committedStops.length === 0) {
      return 0;
   }

   const matchingActivityCount = getCommittedActivityCount(context, activity);

   const committedActivityKinds = getCommittedActivityKinds(context);

   let score = 0;

   if (matchingActivityCount === 0) {
      score += dayVarietyCalibration.unseenActivityBonus;

      /**
       * Once a day already contains several distinct experiences, give the
       * remaining unused activity a small nudge rather than repeating one the
       * person has already done.
       */
      if (committedActivityKinds.size >= 3) {
         score += dayVarietyCalibration.broadDayBonus;
      }
   } else {
      const repeatPenalty = dayVarietyCalibration.repeatedActivityBasePenalty + Math.max(0, matchingActivityCount - 1) * dayVarietyCalibration.repeatedActivityStepPenalty;

      score -= Math.min(dayVarietyCalibration.maximumRepeatedActivityPenalty, repeatPenalty);

      if (matchingActivityCount >= 2) {
         score -= dayVarietyCalibration.saturatedActivityPenalty;
      }
   }

   const referenceStop = getReferenceCommittedStop(context);

   if (referenceStop) {
      if (referenceStop.resolvedActivity === activity) {
         score -= dayVarietyCalibration.consecutiveRepeatPenalty;
      } else {
         score += dayVarietyCalibration.adjacentDifferentActivityBonus;
      }
   }

   return score;
}

function getReferenceCommittedStop(context: PeriodSearchContext): CommittedStopContext | null {
   if (context.committedStops.length === 0) {
      return null;
   }

   const currentIndex = dayPeriods.indexOf(context.dayPeriod);

   const previousStops = context.committedStops.filter((stop) => dayPeriods.indexOf(stop.dayPeriod) < currentIndex).sort((first, second) => dayPeriods.indexOf(second.dayPeriod) - dayPeriods.indexOf(first.dayPeriod));

   return previousStops[0] ?? context.committedStops[0] ?? null;
}

function getChronologicalCommittedStops(context: PeriodSearchContext): readonly CommittedStopContext[] {
   return [...context.committedStops].sort((first, second) => dayPeriods.indexOf(first.dayPeriod) - dayPeriods.indexOf(second.dayPeriod));
}

function calculateReferenceStopDistanceMeters(candidateCoordinates: Coordinates, context: PeriodSearchContext): number | null {
   const referenceStop = getReferenceCommittedStop(context);

   if (!referenceStop) {
      return null;
   }

   const referenceCoordinates = getCommittedStopCoordinates(referenceStop);

   if (!referenceCoordinates) {
      return null;
   }

   return calculateDistanceMeters(candidateCoordinates, referenceCoordinates);
}

function calculateRouteSanityScore(place: GooglePlace, context: PeriodSearchContext): number {
   const candidateCoordinates = getCoordinates(place);

   if (!candidateCoordinates) {
      return 0;
   }

   const referenceDistance = calculateReferenceStopDistanceMeters(candidateCoordinates, context);

   if (referenceDistance === null) {
      return 0;
   }

   let score = 0;

   if (referenceDistance <= routeSanityCalibration.veryCloseMeters) {
      score += routeSanityCalibration.veryCloseBonus;
   } else if (referenceDistance <= routeSanityCalibration.nearbyMeters) {
      score += routeSanityCalibration.nearbyBonus;
   } else if (referenceDistance <= routeSanityCalibration.comfortableMeters) {
      score += routeSanityCalibration.comfortableBonus;
   } else if (referenceDistance <= routeSanityCalibration.longLegMeters) {
      score -= routeSanityCalibration.longLegPenalty;
   } else if (referenceDistance <= routeSanityCalibration.excessiveLegMeters) {
      score -= routeSanityCalibration.excessiveLegPenalty;
   } else {
      score -= routeSanityCalibration.extremeLegPenalty;
   }

   /**
    * Detect a simple A → B → A pattern. This is intentionally narrow: it
    * penalizes an obvious return toward the place before the previous stop,
    * without trying to become a routing engine.
    */
   const chronologicalStops = getChronologicalCommittedStops(context);

   const referenceStop = getReferenceCommittedStop(context);

   if (!referenceStop) {
      return score;
   }

   const referenceIndex = chronologicalStops.findIndex((stop) => stop.placeId === referenceStop.placeId);

   const priorStop = referenceIndex > 0 ? chronologicalStops[referenceIndex - 1] : null;

   const referenceCoordinates = getCommittedStopCoordinates(referenceStop);

   const priorCoordinates = priorStop ? getCommittedStopCoordinates(priorStop) : null;

   if (referenceCoordinates && priorCoordinates) {
      const previousLegDistance = calculateDistanceMeters(priorCoordinates, referenceCoordinates);

      const candidateDistanceToPrior = calculateDistanceMeters(candidateCoordinates, priorCoordinates);

      if (previousLegDistance >= routeSanityCalibration.previousLegMinimumMeters && candidateDistanceToPrior <= routeSanityCalibration.backtrackReturnMeters) {
         score -= routeSanityCalibration.backtrackPenalty;
      }
   }

   return score;
}

function calculateCoherenceDistanceFit(candidateCoordinates: Coordinates, committedStops: readonly CommittedStopContext[]): number {
   const distances = committedStops
      .map((stop) => {
         const stopCoordinates = getCommittedStopCoordinates(stop);

         return stopCoordinates ? calculateDistanceMeters(candidateCoordinates, stopCoordinates) : null;
      })
      .filter((distance): distance is number => typeof distance === "number");

   if (distances.length === 0) {
      return 0;
   }

   const nearestDistance = Math.min(...distances);

   const averageDistance = distances.reduce((total, distance) => total + distance, 0) / distances.length;

   const normalizeDistance = (distance: number) => {
      const fullCreditDistance = 2_500;
      const noCreditDistance = 12_000;

      if (distance <= fullCreditDistance) {
         return 1;
      }

      if (distance >= noCreditDistance) {
         return 0;
      }

      return 1 - (distance - fullCreditDistance) / (noCreditDistance - fullCreditDistance);
   };

   return normalizeDistance(nearestDistance) * 0.65 + normalizeDistance(averageDistance) * 0.35;
}

function calculateDayCoherenceScore(place: GooglePlace, activity: ActivityKind, context: PeriodSearchContext): number {
   if (context.committedStops.length === 0) {
      return 0;
   }

   const coordinates = getCoordinates(place);

   let score = 0;

   if (coordinates) {
      score += calculateCoherenceDistanceFit(coordinates, context.committedStops) * 18;
   }

   score += calculateDayVarietyScore(activity, context);

   return score;
}

function scoreCandidate(place: GooglePlace, activity: ActivityKind, providerIndex: number, context: PeriodSearchContext, distanceMeters: number, maximumDistance: number, availabilityAnalysis: PeriodAvailabilityAnalysis): number {
   const types = getTypes(place);

   const activityMatches = types.filter((type) => typeSignals[activity].includes(type)).length;

   const activityFit = Math.min(1, activityMatches / 2);

   const distanceFit = calculateDistanceFit(distanceMeters, activity, maximumDistance);

   const municipalityFit = place.formattedAddress?.toLowerCase().includes(context.municipalityName.toLowerCase()) ? 1 : 0.4;

   const ratingQuality = calculateRatingConfidence(place.rating, place.userRatingCount);

   const providerRelevance = Math.max(0, 1 - providerIndex / 10);

   const preferredActivity = context.activityDirection !== "sidewalk-choice" && context.activityDirection === activity ? 1 : 0;

   const operationalFit = place.businessStatus === "OPERATIONAL" ? 1 : 0.5;

   const coherenceScore = calculateDayCoherenceScore(place, activity, context);

   const routeSanityScore = calculateRouteSanityScore(place, context);

   const availabilityScore = calculateAvailabilityScore(availabilityAnalysis);

   const specificityScore = calculateEditorialSpecificityScore(place, activity);

   const reviewDepthScore = calculateReviewDepthScore(place.userRatingCount);

   const chainPenalty = isLikelyNationalChain(place) ? recommendationQualityCalibration.nationalChainPenalty : 0;

   const contextFitScore = calculatePeriodContextScore(place, activity, context.dayPeriod);

   return (
      activityFit * 22 +
      distanceFit * 28 +
      municipalityFit * 10 +
      ratingQuality * 18 +
      providerRelevance * 7 +
      preferredActivity * 10 +
      operationalFit * 5 +
      coherenceScore +
      routeSanityScore +
      availabilityScore +
      specificityScore +
      reviewDepthScore +
      contextFitScore -
      chainPenalty
   );
}

const fitStatementsByPeriod: Readonly<Record<DayPeriod, Readonly<Record<ActivityKind, readonly string[]>>>> = {
   "early-morning": {
      outdoors: [
         "It makes good use of the quieter early hours and leaves the entire day open afterward.",
         "It brings a little movement into the day before the neighborhood gets busy.",
         "It works as a calm start without turning the morning into a schedule.",
      ],

      food: ["It gives the day a proper beginning without using up the whole morning.", "It suits an early coffee or breakfast while later plans are still wide open.", "It offers an easy first stop before the city settles into its usual pace."],

      browse: ["It adds a small bit of discovery while the day still feels unhurried.", "It works as a gentle early stop that can stay brief or take its time.", "It leaves plenty of room to decide what the rest of the day should become."],

      culture: [
         "It gives the early hours one thoughtful destination without making the day feel overplanned.",
         "It adds a quiet point of interest before busier daytime plans begin.",
         "It works well when the day should start with something calm and focused.",
      ],
   },

   morning: {
      outdoors: ["It brings movement and open air into the morning without taking over the day.", "It makes good use of the cooler morning window and leaves later plans flexible.", "It gives the day a calmer start with room to keep exploring afterward."],

      food: ["It leaves enough time for a proper morning meal without crowding the rest of the day.", "It gives the morning an easy pace before the day gets busier.", "It works as a comfortable first stop while keeping later plans open."],

      browse: [
         "It offers a low-pressure start that can be as quick or unhurried as the morning allows.",
         "It adds a little discovery to the morning without committing too much time.",
         "It suits a slower start and still leaves plenty of room for the rest of the day.",
      ],

      culture: ["It gives the morning a focused point of interest without making the day feel overplanned.", "It adds something thoughtful early while leaving the afternoon open.", "It works well as a quieter morning visit before the day picks up."],
   },

   afternoon: {
      outdoors: ["It breaks up the afternoon with fresh air and a little room to reset.", "It adds movement to the middle of the day without demanding the entire afternoon.", "It gives the afternoon a slower pace before the evening begins."],

      food: ["It gives the day a proper meal break while leaving the rest of the afternoon flexible.", "It works as a relaxed pause between the morning and evening plans.", "It adds an unhurried meal without turning the afternoon into a long detour."],

      browse: [
         "It leaves room to wander, look around, and move on whenever the afternoon feels complete.",
         "It adds a little discovery without locking the afternoon into a strict schedule.",
         "It works well for an easygoing stretch between more structured stops.",
      ],

      culture: ["It gives the afternoon one focused experience without filling every minute.", "It adds a thoughtful change of pace in the middle of the day.", "It works as a substantial afternoon visit while still leaving room for the evening."],
   },

   evening: {
      outdoors: ["It gives the evening a quieter finish with open air and less structure.", "It makes room for a slower end to the day without adding another formal stop.", "It works well when the day needs a scenic, low-pressure close."],

      food: ["It suits a slower dinner and gives the day a natural finish.", "It leaves enough time to settle into a proper evening meal.", "It works as an easy evening stop when the day should gather around the table."],

      browse: ["It keeps the evening casual and leaves room to linger or move into the night.", "It adds another bit of discovery without making the evening feel crowded.", "It works as a low-pressure option before deciding whether the night continues."],

      culture: ["It gives the evening a memorable experience without overloading the day.", "It adds a stronger sense of occasion as the day moves toward night.", "It works well as the main event of the evening."],
   },

   night: {
      outdoors: [
         "It gives the night a quieter direction with open air and very little structure.",
         "It works when the day should wind down somewhere scenic rather than somewhere loud.",
         "It leaves the night flexible while still giving it a clear destination.",
      ],

      food: [
         "It gives the night a proper late meal without requiring a full evening schedule.",
         "It works well as a final food stop after the rest of the day has settled.",
         "It keeps the night social and unhurried without needing another major activity.",
      ],

      browse: ["It adds something playful or unexpected without committing the entire night.", "It keeps the night casual and lets the group decide how long to stay.", "It works as a flexible late stop when the night should remain open-ended."],

      culture: [
         "It gives the night a stronger sense of occasion through music, drinks, comedy, or performance.",
         "It works as a distinct late-night experience rather than an extension of dinner.",
         "It adds energy to the final part of the day while keeping the choice intentional.",
      ],
   },
};

function hasPlaceType(place: GooglePlace, ...types: readonly string[]): boolean {
   const placeTypes = getTypes(place);

   return types.some((type) => placeTypes.includes(type));
}

function createPlaceSummary(place: GooglePlace, activity: ActivityKind): string {
   if (hasPlaceType(place, "night_club")) {
      return "A nightclub for music, dancing, and a higher-energy late-night stop.";
   }

   if (hasPlaceType(place, "bar")) {
      return "A bar or lounge for drinks and a relaxed social stop later in the day.";
   }

   if (hasPlaceType(place, "comedy_club")) {
      return "A comedy venue for a focused night out built around a live show.";
   }

   if (hasPlaceType(place, "concert_hall", "event_venue")) {
      return "A live-event venue for music, performance, or a more energetic night out.";
   }

   if (hasPlaceType(place, "video_arcade")) {
      return "An arcade for a playful, low-pressure stop that can run later into the night.";
   }

   if (hasPlaceType(place, "korean_restaurant")) {
      return "A Korean restaurant suited to a relaxed, social meal.";
   }

   if (hasPlaceType(place, "italian_restaurant")) {
      return "An Italian restaurant for a slower, sit-down meal.";
   }

   if (hasPlaceType(place, "mexican_restaurant")) {
      return "A Mexican restaurant for a casual, sit-down meal.";
   }

   if (hasPlaceType(place, "japanese_restaurant", "sushi_restaurant")) {
      return "A Japanese restaurant suited to a focused, unhurried meal.";
   }

   if (hasPlaceType(place, "chinese_restaurant")) {
      return "A Chinese restaurant for a relaxed meal with room to share.";
   }

   if (hasPlaceType(place, "thai_restaurant")) {
      return "A Thai restaurant for a flavorful, sit-down meal.";
   }

   if (hasPlaceType(place, "indian_restaurant")) {
      return "An Indian restaurant suited to a relaxed meal and shared dishes.";
   }

   if (hasPlaceType(place, "barbecue_restaurant")) {
      return "A barbecue restaurant built around a casual, hearty meal.";
   }

   if (hasPlaceType(place, "seafood_restaurant")) {
      return "A seafood restaurant suited to a slower, sit-down meal.";
   }

   if (hasPlaceType(place, "steak_house", "steakhouse")) {
      return "A steakhouse for a more substantial sit-down meal.";
   }

   if (hasPlaceType(place, "pizza_restaurant")) {
      return "A pizza restaurant for an easygoing, casual meal.";
   }

   if (hasPlaceType(place, "hamburger_restaurant")) {
      return "A burger spot for a straightforward, casual meal.";
   }

   if (hasPlaceType(place, "breakfast_restaurant")) {
      return "A breakfast spot for a proper morning meal and a slower start.";
   }

   if (hasPlaceType(place, "brunch_restaurant")) {
      return "A brunch spot for a leisurely late-morning meal.";
   }

   if (hasPlaceType(place, "american_restaurant")) {
      return "A full-service American restaurant for a familiar sit-down meal.";
   }

   if (hasPlaceType(place, "coffee_shop")) {
      return "A coffee shop for a drink, a light bite, and an easy pause.";
   }

   if (hasPlaceType(place, "cafe")) {
      return "A cafe for coffee, a light meal, and an unhurried break.";
   }

   if (hasPlaceType(place, "bakery")) {
      return "A bakery for pastries, bread, and a quick neighborhood stop.";
   }

   if (hasPlaceType(place, "dessert_shop", "ice_cream_shop")) {
      return "A dessert spot for a quick treat later in the day.";
   }

   if (hasPlaceType(place, "food_court")) {
      return "A casual food destination with several options in one place.";
   }

   if (activity === "food" || hasPlaceType(place, "restaurant", "meal_takeaway")) {
      return "A casual place for a meal and an unhurried break in the day.";
   }

   if (hasPlaceType(place, "book_store")) {
      return "A bookstore for a quiet browse and an unhurried stop.";
   }

   if (hasPlaceType(place, "record_store")) {
      return "A record shop for music discovery and a slower browse.";
   }

   if (hasPlaceType(place, "clothing_store")) {
      return "A clothing shop for a focused neighborhood browse.";
   }

   if (hasPlaceType(place, "gift_shop")) {
      return "A gift shop for small finds and an easy browse.";
   }

   if (hasPlaceType(place, "home_goods_store")) {
      return "A home-goods shop for design finds and a relaxed browse.";
   }

   if (hasPlaceType(place, "market")) {
      return "A local market for food, small finds, and a casual wander.";
   }

   if (hasPlaceType(place, "shopping_mall")) {
      return "A larger shopping destination with several places to browse.";
   }

   if (activity === "browse" || hasPlaceType(place, "store")) {
      return "A neighborhood shop for a low-pressure browse.";
   }

   if (hasPlaceType(place, "art_museum")) {
      return "An art museum for a focused look at exhibitions and collections.";
   }

   if (hasPlaceType(place, "museum")) {
      return "A museum for a focused cultural visit.";
   }

   if (hasPlaceType(place, "art_gallery")) {
      return "An art gallery for a shorter, more intimate cultural stop.";
   }

   if (hasPlaceType(place, "performing_arts_theater")) {
      return "A performing-arts venue for a show or live program.";
   }

   if (hasPlaceType(place, "movie_theater")) {
      return "A cinema for a seated break and a change of pace.";
   }

   if (hasPlaceType(place, "historical_landmark")) {
      return "A historic site for local context and a slower look around.";
   }

   if (hasPlaceType(place, "library")) {
      return "A public library for a quiet, thoughtful stop.";
   }

   if (hasPlaceType(place, "cultural_center")) {
      return "A cultural center for exhibits, events, or community programming.";
   }

   if (activity === "culture") {
      return "A local cultural destination worth a focused visit.";
   }

   if (hasPlaceType(place, "botanical_garden")) {
      return "A botanical garden for a slower walk among landscaped grounds.";
   }

   if (hasPlaceType(place, "hiking_area")) {
      return "A trail area for a longer walk and time outdoors.";
   }

   if (hasPlaceType(place, "beach")) {
      return "A beach for open views, fresh air, and an unhurried walk.";
   }

   if (hasPlaceType(place, "national_park", "state_park")) {
      return "A protected outdoor area for scenery, movement, and more time outside.";
   }

   if (hasPlaceType(place, "park")) {
      return "A public green space for a walk, fresh air, and a slower pause.";
   }

   if (activity === "outdoors") {
      return "An outdoor destination for fresh air, movement, and a change of pace.";
   }

   return "A worthwhile local place for an easy stop during the day.";
}

function getFitStatement(place: GooglePlace, activity: ActivityKind, context: PeriodSearchContext): string {
   const statements = fitStatementsByPeriod[context.dayPeriod][activity];

   const placeKey = place.id ?? place.displayName?.text ?? context.localAreaId;

   const statementIndex = hashString([placeKey, context.dayPeriod, activity, "fit-statement"].join(":")) % statements.length;

   return statements[statementIndex] ?? statements[0] ?? "It fits naturally into this part of the day.";
}

function createReason(place: GooglePlace, activity: ActivityKind, context: PeriodSearchContext, distanceMeters: number): string {
   const fitStatement = getFitStatement(place, activity, context);

   const referenceStop = getReferenceCommittedStop(context);

   const placeCoordinates = getCoordinates(place);

   const referenceCoordinates = referenceStop ? getCommittedStopCoordinates(referenceStop) : null;

   if (referenceStop && placeCoordinates && referenceCoordinates) {
      const distanceFromReference = calculateDistanceMeters(placeCoordinates, referenceCoordinates);

      if (distanceFromReference <= 4_000) {
         if (context.activityDirection === "sidewalk-choice" && referenceStop.resolvedActivity !== activity) {
            return `${fitStatement} It changes the pace from ${referenceStop.placeName} while staying nearby.`;
         }

         return `${fitStatement} It also keeps you close to ${referenceStop.placeName}.`;
      }

      if (distanceFromReference <= 8_000) {
         return `${fitStatement} It remains within a reasonable reach of ${referenceStop.placeName}.`;
      }

      return `${fitStatement} It adds a change of scene while staying within the broader ${context.localAreaName} plan.`;
   }

   if (distanceMeters <= 2_500) {
      return `${fitStatement} It keeps you close to ${context.localAreaName}.`;
   }

   if (distanceMeters <= 6_000) {
      return `${fitStatement} It adds a small change of scene without pulling you far from ${context.localAreaName}.`;
   }

   return `${fitStatement} It remains within a reasonable reach of ${context.localAreaName}.`;
}

function normalizePlace(place: GooglePlace, activity: ActivityKind, context: PeriodSearchContext, distanceMeters: number, availability: ProviderPeriodAvailability): Place | null {
   const providerPlaceId = place.id;

   const name = place.displayName?.text?.trim();

   if (!providerPlaceId || !name) {
      return null;
   }

   const safeProviderId = sanitizeProviderId(providerPlaceId);

   if (!safeProviderId) {
      return null;
   }

   const reason = createReason(place, activity, context, distanceMeters);

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

         types: getTypes(place),

         rating: place.rating ?? null,

         userRatingCount: place.userRatingCount ?? null,

         photoResourceName: place.photos?.[0]?.name ?? null,

         websiteUrl: place.websiteUri ?? null,

         mapsUrl: place.googleMapsUri ?? null,

         periodAvailability: availability,
      },

      editorial: {
         approvalStatus: "provisional",

         editorialTier: "sidewalk-pick",

         category: categoryByActivity[activity],

         activities: [activity],

         dayRoles: ["first-anchor", "follow-up"],

         summary: createPlaceSummary(place, activity),

         reasonToVisit: reason,

         visitDurationMinutes: durationByPeriod[context.dayPeriod],
      },
   };
}

function isCandidateEligible(
   place: GooglePlace,
   context: PeriodSearchContext,
   activity: ActivityKind,
   areaCenter: Coordinates,
   maximumDistance: number,
): Readonly<{
   eligible: boolean;
   distanceMeters: number;
   availability: ProviderPeriodAvailability;
   availabilityAnalysis: PeriodAvailabilityAnalysis;
}> {
   const unavailableHours: ProviderPeriodAvailability = {
      status: "hours-unavailable",
      source: "unavailable",
      label: "Check today’s hours",
      opensAt: null,
      closesAt: null,
   };
   const unavailableHoursAnalysis: PeriodAvailabilityAnalysis = {
      availability: unavailableHours,
      confidence: "unknown",
      overlapMinutes: null,
      coverageRatio: null,
   };
   const name = place.displayName?.text?.trim();

   if (!place.id || !name) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   const internalPlaceId = `place-google-${sanitizeProviderId(place.id)}`;

   if (context.excludedPlaceIds.includes(internalPlaceId) || context.committedStops.some((stop) => stop.placeId === internalPlaceId)) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   const candidateBrandKey = createBrandKey(name);

   const repeatsCommittedBrand = candidateBrandKey.length > 0 && context.committedStops.some((stop) => createBrandKey(stop.placeName) === candidateBrandKey);

   if (repeatsCommittedBrand) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   if (place.businessStatus === "CLOSED_TEMPORARILY" || place.businessStatus === "CLOSED_PERMANENTLY") {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   if (isClearlyLowQuality(place)) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   const coordinates = getCoordinates(place);

   if (!coordinates) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
         availabilityAnalysis: unavailableHoursAnalysis,
      };
   }

   const distanceMeters = calculateDistanceMeters(areaCenter, coordinates);

   const availabilityAnalysis = analyzePeriodAvailability(place, context.dayPeriod, context.planningDate, context.timezone);

   const availability = availabilityAnalysis.availability;

   const minimumUsefulOpenMinutes = getMinimumUsefulOpenMinutes(context.dayPeriod, activity);

   const hasEnoughUsableTime = availability.status !== "open-part-of-window" || (availabilityAnalysis.overlapMinutes ?? 0) >= minimumUsefulOpenMinutes;

   return {
      eligible: distanceMeters <= maximumDistance && availability.status !== "closed-during-window" && hasEnoughUsableTime,

      distanceMeters,

      availability,
      availabilityAnalysis,
   };
}

function orderStrongCandidatesForDayVariety(candidates: readonly ScoredCandidate[], context: PeriodSearchContext): readonly ScoredCandidate[] {
   if (context.activityDirection !== "sidewalk-choice" || context.committedStops.length === 0) {
      return candidates;
   }

   return [...candidates].sort((first, second) => {
      const firstCount = getCommittedActivityCount(context, first.activity);

      const secondCount = getCommittedActivityCount(context, second.activity);

      const firstIsNew = firstCount === 0;
      const secondIsNew = secondCount === 0;

      /**
       * Only promote novelty inside the already-strong tier. This avoids
       * choosing a mediocre place merely because its category is different.
       */
      if (firstIsNew !== secondIsNew) {
         return firstIsNew ? -1 : 1;
      }

      if (firstCount !== secondCount) {
         return firstCount - secondCount;
      }

      return second.seededScore - first.seededScore;
   });
}

function selectThree(candidates: readonly ScoredCandidate[], context: PeriodSearchContext): readonly PeriodRecommendation[] {
   const sorted = [...candidates].sort((first, second) => second.seededScore - first.seededScore);

   const strongCandidates = orderStrongCandidatesForDayVariety(
      sorted.filter((candidate) => isStrongCandidate(candidate, context)),
      context,
   );

   const recommendations: PeriodRecommendation[] = [];

   const usedNames = new Set<string>();
   const usedBrandKeys = new Set<string>();
   const usedActivities = new Set<ActivityKind>();

   const shouldPreferActivityVariety = context.activityDirection === "sidewalk-choice";

   function tryAddCandidate(candidate: ScoredCandidate, preferActivityVariety: boolean): boolean {
      const name = candidate.place.displayName?.text ?? "";

      const normalizedName = normalizeName(name);

      const brandKey = createBrandKey(name);

      if (!normalizedName || !brandKey || usedNames.has(normalizedName) || usedBrandKeys.has(brandKey)) {
         return false;
      }

      if (preferActivityVariety && usedActivities.has(candidate.activity)) {
         return false;
      }

      const place = normalizePlace(candidate.place, candidate.activity, context, candidate.distanceMeters, candidate.availability);

      if (!place || recommendations.some((recommendation) => recommendation.place.id === place.id)) {
         return false;
      }

      recommendations.push({
         place,

         reason: place.editorial.reasonToVisit,

         bestWindow: getBestWindow(context.dayPeriod),

         resolvedActivity: candidate.activity,
      });

      usedNames.add(normalizedName);
      usedBrandKeys.add(brandKey);
      usedActivities.add(candidate.activity);

      return true;
   }

   /**
    * First pass: only strong candidates, and for Sidewalk Choice prefer a
    * visibly varied recommendation set when the strong pool supports it.
    */
   for (const candidate of strongCandidates) {
      if (recommendations.length >= 3) {
         break;
      }

      tryAddCandidate(candidate, shouldPreferActivityVariety);
   }

   /**
    * Second pass: quality still wins over artificial variety. If the market
    * does not contain three strong, distinct activities, allow another strong
    * option rather than promoting a weaker place.
    */
   for (const candidate of strongCandidates) {
      if (recommendations.length >= 3) {
         break;
      }

      tryAddCandidate(candidate, false);
   }

   /**
    * Sparse-market fallback: eligible lower-tier candidates may fill any
    * remaining slots, but only after every strong candidate has had a chance.
    */
   for (const candidate of sorted) {
      if (recommendations.length >= 3) {
         break;
      }

      tryAddCandidate(candidate, false);
   }

   return recommendations;
}

async function fetchAreaCenter(context: PeriodSearchContext, cacheKey: string): Promise<Coordinates> {
   const authority = getLocalAreaSearchAuthority(context.localAreaId);

   if (authority?.center) {
      const center = {
         latitude: authority.center.latitude,
         longitude: authority.center.longitude,
      };

      pruneExpiringCache(areaCenterCache, maximumAreaCenterCacheEntries);

      areaCenterCache.set(cacheKey, {
         expiresAt: Date.now() + areaCenterCacheDurationMilliseconds,
         value: center,
      });

      return center;
   }

   const apiKey = getApiKey();

   const query = getAreaSearchQuery(context);

   const response = await fetchGooglePlaces(
      "https://places.googleapis.com/v1/places:searchText",
      {
         method: "POST",

         headers: {
            "Content-Type": "application/json",

            "X-Goog-Api-Key": apiKey,

            "X-Goog-FieldMask": ["places.id", "places.displayName", "places.formattedAddress", "places.location", "places.primaryType", "places.types"].join(","),
         },

         body: JSON.stringify({
            textQuery: query,

            languageCode: "en",

            regionCode: context.countryCode,

            maxResultCount: 5,

            rankPreference: "RELEVANCE",
         }),

         cache: "no-store",
      },
      context,
      {
         stage: "area-center",
      },
   );

   if (!response.ok) {
      let providerMessage = "";

      try {
         const payload = (await response.json()) as {
            error?: {
               message?: string;
            };
         };

         providerMessage = payload.error?.message ?? "";
      } catch {
         providerMessage = "";
      }

      throw new Error(providerMessage || `Google could not resolve the selected area center. HTTP ${response.status}.`);
   }

   const payload = (await response.json()) as GoogleSearchResponse;

   const candidates = payload.places ?? [];

   const preferredCandidate =
      candidates.find((place) => {
         const types = getTypes(place);

         return types.includes("neighborhood") || types.includes("sublocality") || types.includes("locality");
      }) ??
      candidates[0] ??
      null;

   const center = preferredCandidate ? getCoordinates(preferredCandidate) : null;

   if (!center) {
      throw new Error(`Google did not return coordinates for ${query}.`);
   }

   pruneExpiringCache(areaCenterCache, maximumAreaCenterCacheEntries);

   areaCenterCache.set(cacheKey, {
      expiresAt: Date.now() + areaCenterCacheDurationMilliseconds,

      value: center,
   });

   return center;
}

async function resolveAreaCenter(context: PeriodSearchContext): Promise<Coordinates> {
   const cacheKey = createAreaCenterCacheKey(context);

   pruneExpiringCache(areaCenterCache, maximumAreaCenterCacheEntries);

   const cached = areaCenterCache.get(cacheKey);

   if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
   }

   const inFlightRequest = inFlightAreaCenterRequests.get(cacheKey);

   if (inFlightRequest) {
      return inFlightRequest;
   }

   const requestPromise = fetchAreaCenter(context, cacheKey);

   inFlightAreaCenterRequests.set(cacheKey, requestPromise);

   try {
      return await requestPromise;
   } finally {
      if (inFlightAreaCenterRequests.get(cacheKey) === requestPromise) {
         inFlightAreaCenterRequests.delete(cacheKey);
      }
   }
}

async function searchProfile(profile: ActivityProfile, context: PeriodSearchContext, areaCenter: Coordinates, searchRadiusMeters: number, stage: DistanceStage): Promise<readonly GooglePlace[]> {
   const apiKey = getApiKey();

   const location = getAreaSearchQuery(context);

   const response = await fetchGooglePlaces(
      "https://places.googleapis.com/v1/places:searchText",
      {
         method: "POST",

         headers: {
            "Content-Type": "application/json",

            "X-Goog-Api-Key": apiKey,

            "X-Goog-FieldMask": [
               "places.id",
               "places.displayName",
               "places.formattedAddress",
               "places.location",
               "places.primaryType",
               "places.types",
               "places.businessStatus",
               "places.rating",
               "places.userRatingCount",
               "places.photos",
               "places.websiteUri",
               "places.googleMapsUri",
               "places.regularOpeningHours",
               "places.currentOpeningHours",
               "places.utcOffsetMinutes",
            ].join(","),
         },

         body: JSON.stringify({
            textQuery: `${profile.query} in ${location}`,

            languageCode: "en",

            regionCode: context.countryCode,

            maxResultCount: 10,

            rankPreference: "RELEVANCE",

            locationBias: {
               circle: {
                  center: {
                     latitude: areaCenter.latitude,

                     longitude: areaCenter.longitude,
                  },

                  radius: searchRadiusMeters,
               },
            },
         }),

         cache: "no-store",
      },
      context,
      {
         stage,
         activity: profile.activity,
      },
   );

   if (!response.ok) {
      let providerMessage = "";

      try {
         const payload = (await response.json()) as {
            error?: {
               message?: string;
            };
         };

         providerMessage = payload.error?.message ?? "";
      } catch {
         providerMessage = "";
      }

      throw new Error(providerMessage || `Google Places returned HTTP ${response.status}.`);
   }

   const payload = (await response.json()) as GoogleSearchResponse;

   return payload.places ?? [];
}

async function collectCandidatesForStage(profiles: readonly ActivityProfile[], context: PeriodSearchContext, areaCenter: Coordinates, stage: DistanceStage, seenProviderIds: Set<string>): Promise<readonly ScoredCandidate[]> {
   const stageStartedAt = performance.now();

   const searchResults = await Promise.all(
      profiles.map(async (profile) => {
         const maximumDistance = getAreaSearchRadiusMeters(context, profile.activity, stage);

         return {
            profile,

            maximumDistance,

            places: await searchProfile(profile, context, areaCenter, maximumDistance, stage),
         };
      }),
   );

   const candidates: ScoredCandidate[] = [];

   for (const result of searchResults) {
      result.places.forEach((place, providerIndex) => {
         if (!place.id || seenProviderIds.has(place.id)) {
            return;
         }

         const eligibility = isCandidateEligible(place, context, result.profile.activity, areaCenter, result.maximumDistance);

         if (!eligibility.eligible) {
            return;
         }

         seenProviderIds.add(place.id);

         const qualityScore = scoreCandidate(place, result.profile.activity, providerIndex, context, eligibility.distanceMeters, result.maximumDistance, eligibility.availabilityAnalysis);

         const randomFactor = seededNumber([context.sessionSeed, context.dayPeriod, context.variationIndex, place.id, createCommittedStopsCacheSegment(context.committedStops)].join(":"));

         candidates.push({
            place,

            activity: result.profile.activity,

            distanceMeters: eligibility.distanceMeters,

            qualityScore,

            seededScore: qualityScore + randomFactor * recommendationQualityCalibration.maximumSeedVariationBonus,

            availability: eligibility.availability,
         });
      });
   }

   logProviderEvent(context, {
      stage,
      providerStatus: "ok",
      elapsedMilliseconds: Math.round(performance.now() - stageStartedAt),
      candidateCount: candidates.length,
   });

   return candidates;
}

function getRecommendationDistanceFromReferenceMeters(recommendation: PeriodRecommendation, context: PeriodSearchContext): number | null {
   const referenceStop = getReferenceCommittedStop(context);

   if (!referenceStop) {
      return null;
   }

   const referenceCoordinates = getCommittedStopCoordinates(referenceStop);

   const latitude = recommendation.place.provider.latitude;

   const longitude = recommendation.place.provider.longitude;

   if (!referenceCoordinates || typeof latitude !== "number" || typeof longitude !== "number") {
      return null;
   }

   return Math.round(
      calculateDistanceMeters(referenceCoordinates, {
         latitude,
         longitude,
      }),
   );
}

async function buildPeriodRecommendations(context: PeriodSearchContext, cacheKey: string): Promise<readonly PeriodRecommendation[]> {
   const areaCenter = await resolveAreaCenter(context);

   const profiles = getProfilesForRequest(context.dayPeriod, context.activityDirection);

   if (profiles.length === 0) {
      throw new Error(`No recommendation profile exists for activity direction "${context.activityDirection}".`);
   }

   const seenProviderIds = new Set<string>();

   const candidates: ScoredCandidate[] = [];

   const stages: readonly DistanceStage[] = ["nearby", "expanded", "fallback"];

   for (const stage of stages) {
      const stageCandidates = await collectCandidatesForStage(profiles, context, areaCenter, stage, seenProviderIds);

      candidates.push(...stageCandidates);

      const strongCandidateCount = candidates.filter((candidate) => isStrongCandidate(candidate, context)).length;

      /**
       * A busy provider response is not automatically a good Sidewalk set.
       * Expand only when the nearby pool is still thin on genuinely strong
       * candidates, while keeping an upper bound to avoid unnecessary calls.
       */
      if (strongCandidateCount >= 6 || candidates.length >= 14) {
         break;
      }
   }

   const strongestPool = [...candidates].sort((first, second) => second.qualityScore - first.qualityScore).slice(0, 16);

   const recommendations = selectThree(strongestPool, context);

   console.info("Sidewalk recommendation calibration", {
      dayPeriod: context.dayPeriod,
      activityDirection: context.activityDirection,
      candidateCount: candidates.length,
      strongCandidateCount: strongestPool.filter((candidate) => isStrongCandidate(candidate, context)).length,
      selectedCount: recommendations.length,
      selectedChainCount: recommendations.filter((recommendation) => nationalChainBrandKeys.has(createBrandKey(recommendation.place.provider.name))).length,
      committedActivities: context.committedStops.map((stop) => stop.resolvedActivity),
      selectedActivities: recommendations.map((recommendation) => recommendation.resolvedActivity),
      selectedPrimaryTypes: recommendations.map((recommendation) => recommendation.place.provider.primaryType),
      selectedAvailability: recommendations.map((recommendation) => recommendation.place.provider.periodAvailability?.label ?? "hours unavailable"),
      selectedAvailabilitySources: recommendations.map((recommendation) => recommendation.place.provider.periodAvailability?.source ?? "unavailable"),
      selectedPreviousStopDistancesMeters: recommendations.map((recommendation) => getRecommendationDistanceFromReferenceMeters(recommendation, context)),
   });

   pruneExpiringCache(recommendationCache, maximumRecommendationCacheEntries);

   recommendationCache.set(cacheKey, {
      expiresAt: Date.now() + recommendationCacheDurationMilliseconds,

      value: recommendations,
   });

   return recommendations;
}

export async function getPeriodRecommendations(context: PeriodSearchContext): Promise<readonly PeriodRecommendation[]> {
   const cacheKey = createRecommendationCacheKey(context);

   pruneExpiringCache(recommendationCache, maximumRecommendationCacheEntries);

   const cached = recommendationCache.get(cacheKey);

   if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
   }

   const inFlightRequest = inFlightRecommendationRequests.get(cacheKey);

   if (inFlightRequest) {
      return inFlightRequest;
   }

   const requestPromise = buildPeriodRecommendations(context, cacheKey);

   inFlightRecommendationRequests.set(cacheKey, requestPromise);

   try {
      return await requestPromise;
   } finally {
      if (inFlightRecommendationRequests.get(cacheKey) === requestPromise) {
         inFlightRecommendationRequests.delete(cacheKey);
      }
   }
}
