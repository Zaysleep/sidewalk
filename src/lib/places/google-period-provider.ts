import "server-only";

import type { ActivityDirection, ActivityKind } from "@/types/activity";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { CommittedStopContext, PeriodRecommendation } from "@/types/period-recommendation";
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
   metroRegionId: string;
   metroRegionName: string;

   municipalityId: string;
   municipalityName: string;
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

function getPlaceLocalIsoDate(utcOffsetMinutes: number | undefined): string {
   const safeOffset = typeof utcOffsetMinutes === "number" ? utcOffsetMinutes : 0;

   const localDate = new Date(Date.now() + safeOffset * 60 * 1000);

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
): Readonly<{
   hours: GoogleOpeningHours;
   source: "current-hours" | "regular-hours";
}> | null {
   const isTodayAtPlace = planningDate === getPlaceLocalIsoDate(place.utcOffsetMinutes);

   if (isTodayAtPlace && place.currentOpeningHours) {
      return {
         hours: place.currentOpeningHours,
         source: "current-hours",
      };
   }

   if (place.regularOpeningHours) {
      return {
         hours: place.regularOpeningHours,
         source: "regular-hours",
      };
   }

   return null;
}

function calculatePeriodAvailability(place: GooglePlace, dayPeriod: DayPeriod, planningDate: string): ProviderPeriodAvailability {
   const openingHoursSource = getOpeningHoursSource(place, planningDate);

   if (!openingHoursSource) {
      return {
         status: "hours-unavailable",
         source: "unavailable",
         label: "Check hours for this date",
         opensAt: null,
         closesAt: null,
      };
   }

   const intervals = getOpeningIntervals(openingHoursSource.hours);

   const hasPublishedHours = intervals.length > 0 || (openingHoursSource.hours.weekdayDescriptions?.length ?? 0) > 0;

   if (!hasPublishedHours) {
      return {
         status: "hours-unavailable",
         source: "unavailable",
         label: "Check hours for this date",
         opensAt: null,
         closesAt: null,
      };
   }

   const { dayIndex } = parsePlanningDate(planningDate);

   const periodWindow = periodWindowByDayPeriod[dayPeriod];

   const targetStart = dayIndex * 24 * 60 + periodWindow.startMinute;

   const targetEnd = dayIndex * 24 * 60 + periodWindow.endMinute;

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
         status: "open-through-window",
         source: openingHoursSource.source,
         label: openingHoursSource.source === "regular-hours" ? "Usually open during this window" : "Open during this window",
         opensAt: formatClockTime(fullyOpenInterval.startMinuteOfWeek),
         closesAt: formatClockTime(fullyOpenInterval.endMinuteOfWeek),
      };
   }

   const overlappingIntervals = comparableIntervals
      .map((interval) => {
         const overlapStart = Math.max(interval.startMinuteOfWeek, targetStart);

         const overlapEnd = Math.min(interval.endMinuteOfWeek, targetEnd);

         return {
            interval,
            overlapMinutes: Math.max(0, overlapEnd - overlapStart),
         };
      })
      .filter((result) => result.overlapMinutes > 0)
      .sort((first, second) => second.overlapMinutes - first.overlapMinutes);

   const strongestOverlap = overlappingIntervals[0] ?? null;

   if (!strongestOverlap) {
      return {
         status: "closed-during-window",
         source: openingHoursSource.source,
         label: "Closed during this window",
         opensAt: null,
         closesAt: null,
      };
   }

   const overlapInterval = strongestOverlap.interval;

   const opensInsideWindow = overlapInterval.startMinuteOfWeek > targetStart && overlapInterval.startMinuteOfWeek < targetEnd;

   const closesInsideWindow = overlapInterval.endMinuteOfWeek > targetStart && overlapInterval.endMinuteOfWeek < targetEnd;

   if (opensInsideWindow) {
      const opensAt = formatClockTime(overlapInterval.startMinuteOfWeek);

      return {
         status: "open-part-of-window",
         source: openingHoursSource.source,
         label: openingHoursSource.source === "regular-hours" ? `Usually opens at ${opensAt}` : `Opens at ${opensAt}`,
         opensAt,
         closesAt: closesInsideWindow ? formatClockTime(overlapInterval.endMinuteOfWeek) : null,
      };
   }

   if (closesInsideWindow) {
      const closesAt = formatClockTime(overlapInterval.endMinuteOfWeek);

      return {
         status: "open-part-of-window",
         source: openingHoursSource.source,
         label: openingHoursSource.source === "regular-hours" ? `Usually open until ${closesAt}` : `Open until ${closesAt}`,
         opensAt: null,
         closesAt,
      };
   }

   return {
      status: "open-part-of-window",
      source: openingHoursSource.source,
      label: openingHoursSource.source === "regular-hours" ? "Usually open for part of this window" : "Open for part of this window",
      opensAt: null,
      closesAt: null,
   };
}

function calculateAvailabilityScore(availability: ProviderPeriodAvailability): number {
   switch (availability.status) {
      case "open-through-window":
         return 12;

      case "open-part-of-window":
         return 4;

      case "hours-unavailable":
         return 0;

      case "closed-during-window":
         return -40;
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

   return authority?.searchQuery ?? [context.localAreaName, context.municipalityName, context.stateOrRegion].join(", ");
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

function getReferenceCommittedStop(context: PeriodSearchContext): CommittedStopContext | null {
   if (context.committedStops.length === 0) {
      return null;
   }

   const currentIndex = dayPeriods.indexOf(context.dayPeriod);

   const previousStops = context.committedStops.filter((stop) => dayPeriods.indexOf(stop.dayPeriod) < currentIndex).sort((first, second) => dayPeriods.indexOf(second.dayPeriod) - dayPeriods.indexOf(first.dayPeriod));

   return previousStops[0] ?? context.committedStops[0] ?? null;
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

   if (context.activityDirection === "sidewalk-choice") {
      const matchingActivityCount = context.committedStops.filter((stop) => stop.resolvedActivity === activity).length;

      if (matchingActivityCount === 0) {
         score += 8;
      } else {
         score -= Math.min(6, matchingActivityCount * 3);
      }

      const referenceStop = getReferenceCommittedStop(context);

      if (referenceStop && referenceStop.resolvedActivity !== activity) {
         score += 3;
      }
   }

   return score;
}

function scoreCandidate(place: GooglePlace, activity: ActivityKind, providerIndex: number, context: PeriodSearchContext, distanceMeters: number, maximumDistance: number, availability: ProviderPeriodAvailability): number {
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

   const availabilityScore = calculateAvailabilityScore(availability);

   return activityFit * 22 + distanceFit * 28 + municipalityFit * 10 + ratingQuality * 18 + providerRelevance * 7 + preferredActivity * 10 + operationalFit * 5 + coherenceScore + availabilityScore;
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
   areaCenter: Coordinates,
   maximumDistance: number,
): Readonly<{
   eligible: boolean;
   distanceMeters: number;
   availability: ProviderPeriodAvailability;
}> {
   const unavailableHours: ProviderPeriodAvailability = {
      status: "hours-unavailable",
      source: "unavailable",
      label: "Check today’s hours",
      opensAt: null,
      closesAt: null,
   };
   const name = place.displayName?.text?.trim();

   if (!place.id || !name) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
      };
   }

   const internalPlaceId = `place-google-${sanitizeProviderId(place.id)}`;

   if (context.excludedPlaceIds.includes(internalPlaceId) || context.committedStops.some((stop) => stop.placeId === internalPlaceId)) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
      };
   }

   const candidateBrandKey = createBrandKey(name);

   const repeatsCommittedBrand = candidateBrandKey.length > 0 && context.committedStops.some((stop) => createBrandKey(stop.placeName) === candidateBrandKey);

   if (repeatsCommittedBrand) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
      };
   }

   if (place.businessStatus === "CLOSED_TEMPORARILY" || place.businessStatus === "CLOSED_PERMANENTLY") {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
      };
   }

   const coordinates = getCoordinates(place);

   if (!coordinates) {
      return {
         eligible: false,
         distanceMeters: Number.POSITIVE_INFINITY,
         availability: unavailableHours,
      };
   }

   const distanceMeters = calculateDistanceMeters(areaCenter, coordinates);

   const availability = calculatePeriodAvailability(place, context.dayPeriod, context.planningDate);

   return {
      eligible: distanceMeters <= maximumDistance && availability.status !== "closed-during-window",

      distanceMeters,

      availability,
   };
}

function selectThree(candidates: readonly ScoredCandidate[], context: PeriodSearchContext): readonly PeriodRecommendation[] {
   const sorted = [...candidates].sort((first, second) => second.seededScore - first.seededScore);

   const recommendations: PeriodRecommendation[] = [];

   const usedNames = new Set<string>();
   const usedBrandKeys = new Set<string>();
   const usedActivities = new Set<ActivityKind>();

   const shouldPreferActivityVariety = context.activityDirection === "sidewalk-choice";

   for (const candidate of sorted) {
      if (recommendations.length >= 3) {
         break;
      }

      const name = candidate.place.displayName?.text ?? "";

      const normalizedName = normalizeName(name);

      const brandKey = createBrandKey(name);

      if (usedNames.has(normalizedName) || usedBrandKeys.has(brandKey)) {
         continue;
      }

      if (shouldPreferActivityVariety && recommendations.length < 2 && usedActivities.has(candidate.activity)) {
         continue;
      }

      const place = normalizePlace(candidate.place, candidate.activity, context, candidate.distanceMeters, candidate.availability);

      if (!place) {
         continue;
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
   }

   for (const candidate of sorted) {
      if (recommendations.length >= 3) {
         break;
      }

      const name = candidate.place.displayName?.text ?? "";

      const brandKey = createBrandKey(name);

      if (usedBrandKeys.has(brandKey)) {
         continue;
      }

      const place = normalizePlace(candidate.place, candidate.activity, context, candidate.distanceMeters, candidate.availability);

      if (!place || recommendations.some((recommendation) => recommendation.place.id === place.id)) {
         continue;
      }

      recommendations.push({
         place,

         reason: place.editorial.reasonToVisit,

         bestWindow: getBestWindow(context.dayPeriod),

         resolvedActivity: candidate.activity,
      });

      usedBrandKeys.add(brandKey);
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

            regionCode: "US",

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

            regionCode: "US",

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

         const eligibility = isCandidateEligible(place, context, areaCenter, result.maximumDistance);

         if (!eligibility.eligible) {
            return;
         }

         seenProviderIds.add(place.id);

         const qualityScore = scoreCandidate(place, result.profile.activity, providerIndex, context, eligibility.distanceMeters, result.maximumDistance, eligibility.availability);

         const randomFactor = seededNumber([context.sessionSeed, context.dayPeriod, context.variationIndex, place.id, createCommittedStopsCacheSegment(context.committedStops)].join(":"));

         candidates.push({
            place,

            activity: result.profile.activity,

            distanceMeters: eligibility.distanceMeters,

            qualityScore,

            seededScore: qualityScore + randomFactor * 10,

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

      if (candidates.length >= 8) {
         break;
      }
   }

   const strongestPool = [...candidates].sort((first, second) => second.qualityScore - first.qualityScore).slice(0, 12);

   const recommendations = selectThree(strongestPool, context);

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
