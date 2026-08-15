"use client";

import { useEffect, useRef, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PeriodPickDetail } from "@/components/places/period-pick-detail";
import { PeriodRecommendationList } from "@/components/places/period-recommendation-list";
import { ActivityDirectionSelector } from "@/components/planning/activity-direction";
import { DayTray } from "@/components/planning/day-tray";
import { LocationSelect } from "@/components/planning/location-select";
import { PlanningDateSelector } from "@/components/planning/planning-date";
import { PeriodSwitcher } from "@/components/planning/period-switcher";
import { getCountryByCode } from "@/data/geography/countries";
import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { getDestinationIsoDate } from "@/lib/geography/destination-date";
import { getLocalAreasForMunicipality } from "@/lib/geography/get-local-areas-for-municipality";
import { getMunicipalitiesForMetro } from "@/lib/geography/get-municipalities-for-metro";
import { createRecentMetroSlugs, readRecentMetroSlugs, saveRecentMetroSlugs } from "@/lib/geography/recent-metros";
import { resolveGeography } from "@/lib/geography/resolve-geography";
import { trackProductSignal } from "@/lib/analytics/product-signal-client";
import { fetchPeriodRecommendations } from "@/lib/places/period-recommendation-client";
import { getFeedbackExcludedPlaceIds, readRecommendationFeedback, recordRecommendationFeedback, saveRecommendationFeedback, type RecommendationFeedbackReason, type RecommendationFeedbackSignal } from "@/lib/places/recommendation-feedback";
import { createTripFolio, createTripFolioDay, createTripFolioDaySourceKey, findTripFolioDay, getNextTripPlanningDate, readTripFolio, removeTripFolioDay, renameTripFolio, saveTripFolio, upsertTripFolioDay } from "@/lib/trips/trip-folio-storage";
import { requestSharedDay, SharedDayRequestError } from "@/lib/sharing/shared-day-client";
import { createSharedDayRequestFromPlan } from "@/lib/sharing/shared-day-schema";
import { requestSharedTrip, SharedTripRequestError } from "@/lib/sharing/shared-trip-client";
import { createSharedTripRequestFromFolio } from "@/lib/sharing/shared-trip-schema";
import { activityDirections, activityKinds, type ActivityDirection, type ActivityKind } from "@/types/activity";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import { maxPeriodRecommendationRefreshes, type CommittedStopContext, type PeriodRecommendation, type PeriodRecommendationStatus } from "@/types/period-recommendation";
import { tripFolioLimits, type TripFolio, type TripFolioDay } from "@/types/trip-folio";

import plannerStyles from "./period-planner.module.css";

type RecommendationsByPeriod = Record<DayPeriod, readonly PeriodRecommendation[]>;

type RecommendationStatuses = Record<DayPeriod, PeriodRecommendationStatus>;

type SelectedRecommendations = Partial<Record<DayPeriod, PeriodRecommendation>>;

type ActivityDirectionsByPeriod = Record<DayPeriod, ActivityDirection | null>;

type RequestKeysByPeriod = Record<DayPeriod, string | null>;

type SharedDayCreationStatus = "idle" | "loading" | "ready" | "error";

type SharedDayCreationState = Readonly<{
   status: SharedDayCreationStatus;
   sourceKey: string | null;
   shareUrl: string | null;
   message: string;
}>;

type SharedTripCreationState = Readonly<{
   status: SharedDayCreationStatus;
   sourceKey: string | null;
   shareUrl: string | null;
   message: string;
}>;

type ChapterRefreshState = Readonly<{
   refreshCount: number;
   shownPlaceIds: readonly string[];
   isRefreshing: boolean;
   canRefresh: boolean;
   message: string;
}>;

type ChapterRefreshStates = Record<DayPeriod, ChapterRefreshState>;

type StoredChapterRefreshState = Readonly<{
   refreshCount: number;
   shownPlaceIds: readonly string[];
   canRefresh: boolean;
   message: string;
}>;

type StoredChapterRefreshStates = Record<DayPeriod, StoredChapterRefreshState>;

type StoredPlanningSession = Readonly<{
   version: 5;

   selectedMetroSlug: string;
   selectedMunicipalityId: string;
   selectedLocalAreaId: string;

   planningDate: string;

   activityDirectionsByPeriod: ActivityDirectionsByPeriod;

   activeDayPeriod: DayPeriod;

   sessionSeed: string;

   dayStops: readonly DayStop[];

   /**
    * Optional so existing version-5 sessions remain valid.
    */
   similarDayPeriods?: readonly DayPeriod[];

   chapterRefreshStates: StoredChapterRefreshStates;
}>;

type LegacyDayPeriod = "morning" | "afternoon" | "evening";

type LegacyActivityDirectionsByPeriod = Record<LegacyDayPeriod, ActivityDirection | null>;

type LegacyStoredChapterRefreshStates = Record<LegacyDayPeriod, StoredChapterRefreshState>;

type LegacyStoredPlanningSessionV4 = Readonly<{
   version: 4;

   selectedMetroSlug: string;
   selectedMunicipalityId: string;
   selectedLocalAreaId: string;

   planningDate: string;

   activityDirectionsByPeriod: LegacyActivityDirectionsByPeriod;

   activeDayPeriod: LegacyDayPeriod;

   sessionSeed: string;

   dayStops: readonly DayStop[];

   chapterRefreshStates: LegacyStoredChapterRefreshStates;
}>;

const activeMetroRegions = metroRegions
   .filter((metroRegion) => metroRegion.isActive && metroRegion.coverageStatus === "active")
   .slice()
   .sort((firstMetro, secondMetro) => firstMetro.name.localeCompare(secondMetro.name));

const activeMetroSlugs = activeMetroRegions.map((metroRegion) => metroRegion.slug);

const defaultMetroSlug = "san-diego";

function getTodayPlanningDateForMetroSlug(metroSlug: string): string {
   const metroRegion = activeMetroRegions.find((candidate) => candidate.slug === metroSlug) ?? activeMetroRegions.find((candidate) => candidate.slug === defaultMetroSlug) ?? activeMetroRegions[0];

   if (!metroRegion) {
      return new Date().toISOString().slice(0, 10);
   }

   return getDestinationIsoDate(metroRegion.timezone);
}

/**
 * A fresh plan for Today should meet someone where they actually are in the
 * day. The browser clock is intentionally used here because this is a UI
 * starting-point preference, not provider/opening-hours logic.
 *
 * Future trip days still start at Early Morning so a new day opens as a clean
 * full-day canvas.
 */
function getCurrentDayPeriodFromDeviceClock(now = new Date()): DayPeriod {
   const minutes = now.getHours() * 60 + now.getMinutes();

   if (minutes < 2 * 60) {
      return "night";
   }

   if (minutes < 9 * 60) {
      return "early-morning";
   }

   if (minutes < 12 * 60) {
      return "morning";
   }

   if (minutes < 17 * 60) {
      return "afternoon";
   }

   if (minutes < 21 * 60) {
      return "evening";
   }

   return "night";
}

function getStartingDayPeriod(planningDate: string, timezone: string | null | undefined): DayPeriod {
   if (!planningDate || !timezone) {
      return "early-morning";
   }

   return planningDate === getDestinationIsoDate(timezone) ? getCurrentDayPeriodFromDeviceClock() : "early-morning";
}

const planningSessionStorageKey = "sidewalk-active-planning-session-v5";

const legacyPlanningSessionStorageKey = "sidewalk-active-planning-session-v4";

const previousPlanningSessionStorageKeys = ["sidewalk-active-planning-session-v3", "sidewalk-active-planning-session-v2", "sidewalk-active-planning-session-v1"] as const;

const sessionSeedStorageKey = "sidewalk-planning-session-seed";

const similarDayQueryKeys = ["similar", "metro", "municipality", "area", "periods"] as const;

type SimilarDayContext = Readonly<{
   metroSlug: string;
   municipalityId: string;
   localAreaId: string;
   periods: readonly DayPeriod[];
}>;

function createPeriodRecord<T>(createValue: (period: DayPeriod) => T): Record<DayPeriod, T> {
   return Object.fromEntries(dayPeriods.map((period) => [period, createValue(period)])) as Record<DayPeriod, T>;
}

function createEmptyRecommendations(): RecommendationsByPeriod {
   return createPeriodRecord<readonly PeriodRecommendation[]>(() => []);
}

function createIdleStatuses(): RecommendationStatuses {
   return createPeriodRecord<PeriodRecommendationStatus>(() => "idle");
}

function createEmptyActivityDirections(): ActivityDirectionsByPeriod {
   return createPeriodRecord<ActivityDirection | null>(() => null);
}

function createEmptyRequestKeys(): RequestKeysByPeriod {
   return createPeriodRecord<string | null>(() => null);
}

function createInitialChapterRefreshState(): ChapterRefreshStates {
   const createPeriodState = (): ChapterRefreshState => ({
      refreshCount: 0,
      shownPlaceIds: [],
      isRefreshing: false,
      canRefresh: true,
      message: "",
   });

   return createPeriodRecord<ChapterRefreshState>(createPeriodState);
}

function createInitialSharedDayCreationState(): SharedDayCreationState {
   return {
      status: "idle",
      sourceKey: null,
      shareUrl: null,
      message: "",
   };
}

function createInitialSharedTripCreationState(): SharedTripCreationState {
   return {
      status: "idle",
      sourceKey: null,
      shareUrl: null,
      message: "",
   };
}

function readSimilarDayContext(): SimilarDayContext | null {
   const requestUrl = new URL(window.location.href);

   if (requestUrl.searchParams.get("similar") !== "1") {
      return null;
   }

   const metroSlug = requestUrl.searchParams.get("metro")?.trim() ?? "";
   const municipalityId = requestUrl.searchParams.get("municipality")?.trim() ?? "";
   const localAreaId = requestUrl.searchParams.get("area")?.trim() ?? "";
   const periodsValue = requestUrl.searchParams.get("periods")?.trim() ?? "";

   const requestedPeriods = periodsValue
      .split(",")
      .map((value) => value.trim())
      .filter((value): value is DayPeriod => (dayPeriods as readonly string[]).includes(value));

   const uniquePeriods = dayPeriods.filter((period) => requestedPeriods.includes(period));

   if (uniquePeriods.length < 2 || uniquePeriods.length !== requestedPeriods.length) {
      return null;
   }

   const metroRegion = activeMetroRegions.find((candidate) => candidate.slug === metroSlug) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea) {
      return null;
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return null;
   }

   return {
      metroSlug: metroRegion.slug,
      municipalityId: municipality.id,
      localAreaId: localArea.id,
      periods: uniquePeriods,
   };
}

function removeSimilarDayQueryParameters() {
   const requestUrl = new URL(window.location.href);

   similarDayQueryKeys.forEach((key) => {
      requestUrl.searchParams.delete(key);
   });

   const nextUrl = `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;

   window.history.replaceState(window.history.state, "", nextUrl);
}

function createSharedDaySourceKey(planningDate: string, metroRegionId: string, municipalityId: string, localAreaId: string, stops: readonly DayStop[]): string {
   return JSON.stringify({
      planningDate,
      metroRegionId,
      municipalityId,
      localAreaId,
      stops: sortDayStops(stops).map((stop) => ({
         dayPeriod: stop.dayPeriod,
         bestWindow: stop.bestWindow,
         placeId: stop.placeId,
         placeName: stop.placeName,
         locationUrl: stop.locationUrl,
         visitDurationMinutes: stop.visitDurationMinutes,
         summary: stop.summary ?? "",
         reason: stop.reason ?? "",
         photoResourceName: stop.photoResourceName ?? null,
      })),
   });
}

function createSharedTripSourceKey(folio: TripFolio | null): string {
   if (!folio) {
      return "";
   }

   return JSON.stringify({
      title: folio.title,

      days: folio.days.map((day) => ({
         planningDate: day.planningDate,
         metroRegionId: day.metroRegionId,
         municipalityId: day.municipalityId,
         localAreaId: day.localAreaId,
         sourceKey: createTripFolioDaySourceKey(day),
      })),
   });
}

function isPlanningDate(value: unknown): value is string {
   if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
   }

   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const parsedDate = new Date(Date.UTC(year, month - 1, day));

   return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
}

function toStoredChapterRefreshStates(states: ChapterRefreshStates): StoredChapterRefreshStates {
   return createPeriodRecord((period) => ({
      refreshCount: states[period].refreshCount,
      shownPlaceIds: states[period].shownPlaceIds,
      canRefresh: states[period].canRefresh,
      message: states[period].message,
   }));
}

function fromStoredChapterRefreshStates(states: StoredChapterRefreshStates): ChapterRefreshStates {
   return createPeriodRecord((period) => ({
      ...states[period],
      isRefreshing: false,
   }));
}

function createPeriodRequestKey(
   metroRegionId: string,
   municipalityId: string,
   localAreaId: string,
   dayPeriod: DayPeriod,
   activityDirection: ActivityDirection,
   planningDate: string,
   sessionSeed: string,
   variationIndex: number,
   committedStopsSegment: string,
): string {
   return [metroRegionId, municipalityId, localAreaId, dayPeriod, activityDirection, planningDate, sessionSeed, variationIndex, committedStopsSegment].join("|");
}

function mergePlaceIds(currentIds: readonly string[], nextIds: readonly string[]): readonly string[] {
   return Array.from(new Set([...currentIds, ...nextIds]));
}

function generateAnonymousSessionSeed(): string {
   if (typeof window.crypto?.randomUUID === "function") {
      return window.crypto.randomUUID();
   }

   return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function saveSessionSeed(seed: string) {
   try {
      window.sessionStorage.setItem(sessionSeedStorageKey, seed);
   } catch {
      // Sidewalk can continue without browser storage.
   }
}

function getOrCreateSessionSeed(): string {
   try {
      const existingSeed = window.sessionStorage.getItem(sessionSeedStorageKey);

      if (existingSeed) {
         return existingSeed;
      }

      const generatedSeed = generateAnonymousSessionSeed();

      saveSessionSeed(generatedSeed);

      return generatedSeed;
   } catch {
      return generateAnonymousSessionSeed();
   }
}

function getPeriodLabel(period: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === period)?.label ?? period;
}

function getPeriodRangeLabel(period: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === period)?.rangeLabel ?? "";
}

function sortDayStops(stops: readonly DayStop[]): DayStop[] {
   return dayPeriods.flatMap((period) => {
      const stop = stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });
}

function createCommittedStopContext(stops: readonly DayStop[], activePeriod: DayPeriod, includeActivePeriod = false): readonly CommittedStopContext[] {
   return stops
      .filter((stop) => includeActivePeriod || stop.dayPeriod !== activePeriod)
      .map((stop) => ({
         placeId: stop.placeId,
         placeName: stop.placeName,
         dayPeriod: stop.dayPeriod,
         resolvedActivity: stop.resolvedActivity,
         latitude: stop.latitude,
         longitude: stop.longitude,
      }));
}

function createCommittedStopsRequestSegment(committedStops: readonly CommittedStopContext[]): string {
   return [...committedStops]
      .sort((first, second) => dayPeriods.indexOf(first.dayPeriod) - dayPeriods.indexOf(second.dayPeriod))
      .map((stop) => [stop.dayPeriod, stop.placeId, stop.resolvedActivity, stop.latitude ?? "none", stop.longitude ?? "none"].join("~"))
      .join(",");
}

function getNextUnfilledPeriod(currentPeriod: DayPeriod, stops: readonly DayStop[], preferredPeriods: readonly DayPeriod[] = []): DayPeriod | null {
   const filledPeriods = new Set(stops.map((stop) => stop.dayPeriod));

   if (preferredPeriods.length > 0) {
      const currentPreferredIndex = preferredPeriods.indexOf(currentPeriod);

      const preferredStartIndex = currentPreferredIndex >= 0 ? currentPreferredIndex + 1 : 0;

      for (let offset = 0; offset < preferredPeriods.length; offset += 1) {
         const candidate = preferredPeriods[(preferredStartIndex + offset) % preferredPeriods.length];

         if (!filledPeriods.has(candidate)) {
            return candidate;
         }
      }
   }

   const currentIndex = dayPeriods.indexOf(currentPeriod);

   for (let offset = 1; offset <= dayPeriods.length; offset += 1) {
      const candidate = dayPeriods[(currentIndex + offset) % dayPeriods.length];

      if (!filledPeriods.has(candidate)) {
         return candidate;
      }
   }

   return null;
}

function getFirstUnfilledPeriod(stops: readonly DayStop[], preferredPeriods: readonly DayPeriod[] = []): DayPeriod | null {
   const filledPeriods = new Set(stops.map((stop) => stop.dayPeriod));

   const preferredPeriod = preferredPeriods.find((period) => !filledPeriods.has(period));

   if (preferredPeriod) {
      return preferredPeriod;
   }

   return dayPeriods.find((period) => !filledPeriods.has(period)) ?? null;
}

function getPlanProgressCopy(stopCount: number): string {
   if (stopCount === 0) {
      return "Two stops make a saved day.";
   }

   if (stopCount === 1) {
      return "One more stop saves the day.";
   }

   return `Day saved · ${stopCount} ${stopCount === 1 ? "stop" : "stops"}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDayPeriod(value: unknown): value is DayPeriod {
   return typeof value === "string" && (dayPeriods as readonly string[]).includes(value);
}

function isActivityDirection(value: unknown): value is ActivityDirection {
   return typeof value === "string" && (activityDirections as readonly string[]).includes(value);
}

function isActivityKind(value: unknown): value is ActivityKind {
   return typeof value === "string" && (activityKinds as readonly string[]).includes(value);
}

function isStoredSimilarDayPeriods(value: unknown): value is readonly DayPeriod[] {
   return Array.isArray(value) && value.length <= dayPeriods.length && value.every(isDayPeriod) && new Set(value).size === value.length;
}

function isStoredActivityDirections(value: unknown): value is ActivityDirectionsByPeriod {
   if (!isRecord(value)) {
      return false;
   }

   return dayPeriods.every((period) => {
      const direction = value[period];

      return direction === null || isActivityDirection(direction);
   });
}

function isStoredChapterRefreshState(value: unknown): value is StoredChapterRefreshState {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.refreshCount === "number" &&
      Number.isInteger(value.refreshCount) &&
      value.refreshCount >= 0 &&
      value.refreshCount <= maxPeriodRecommendationRefreshes &&
      Array.isArray(value.shownPlaceIds) &&
      value.shownPlaceIds.every((placeId) => typeof placeId === "string") &&
      typeof value.canRefresh === "boolean" &&
      typeof value.message === "string"
   );
}

function isStoredChapterRefreshStates(value: unknown): value is StoredChapterRefreshStates {
   if (!isRecord(value)) {
      return false;
   }

   return dayPeriods.every((period) => isStoredChapterRefreshState(value[period]));
}

function isStoredDayStop(value: unknown): value is DayStop {
   if (!isRecord(value)) {
      return false;
   }

   const duration = value.visitDurationMinutes;

   if (!isRecord(duration)) {
      return false;
   }

   return (
      typeof value.id === "string" &&
      isDayPeriod(value.dayPeriod) &&
      typeof value.bestWindow === "string" &&
      isActivityKind(value.resolvedActivity) &&
      typeof value.placeId === "string" &&
      typeof value.placeName === "string" &&
      typeof value.metroRegionId === "string" &&
      typeof value.municipalityId === "string" &&
      typeof value.municipalityName === "string" &&
      typeof value.localAreaId === "string" &&
      typeof value.localAreaName === "string" &&
      (value.latitude === null || (typeof value.latitude === "number" && Number.isFinite(value.latitude))) &&
      (value.longitude === null || (typeof value.longitude === "number" && Number.isFinite(value.longitude))) &&
      (value.locationUrl === null || typeof value.locationUrl === "string") &&
      (value.summary === undefined || typeof value.summary === "string") &&
      (value.reason === undefined || typeof value.reason === "string") &&
      (value.photoResourceName === undefined || value.photoResourceName === null || typeof value.photoResourceName === "string") &&
      typeof duration.minimum === "number" &&
      typeof duration.maximum === "number"
   );
}

function isLegacyDayPeriod(value: unknown): value is LegacyDayPeriod {
   return value === "morning" || value === "afternoon" || value === "evening";
}

function isLegacyStoredActivityDirections(value: unknown): value is LegacyActivityDirectionsByPeriod {
   if (!isRecord(value)) {
      return false;
   }

   return (["morning", "afternoon", "evening"] as const).every((period) => {
      const direction = value[period];

      return direction === null || isActivityDirection(direction);
   });
}

function isLegacyStoredChapterRefreshStates(value: unknown): value is LegacyStoredChapterRefreshStates {
   if (!isRecord(value)) {
      return false;
   }

   return (["morning", "afternoon", "evening"] as const).every((period) => isStoredChapterRefreshState(value[period]));
}

function isLegacyStoredPlanningSessionV4(value: unknown): value is LegacyStoredPlanningSessionV4 {
   if (!isRecord(value)) {
      return false;
   }

   return (
      value.version === 4 &&
      typeof value.selectedMetroSlug === "string" &&
      typeof value.selectedMunicipalityId === "string" &&
      typeof value.selectedLocalAreaId === "string" &&
      isPlanningDate(value.planningDate) &&
      isLegacyStoredActivityDirections(value.activityDirectionsByPeriod) &&
      isLegacyDayPeriod(value.activeDayPeriod) &&
      typeof value.sessionSeed === "string" &&
      value.sessionSeed.length > 0 &&
      Array.isArray(value.dayStops) &&
      value.dayStops.length <= 3 &&
      value.dayStops.every(isStoredDayStop) &&
      isLegacyStoredChapterRefreshStates(value.chapterRefreshStates)
   );
}

function migrateLegacyPlanningSessionV4(legacySession: LegacyStoredPlanningSessionV4): StoredPlanningSession {
   const activityDirectionsByPeriod = createEmptyActivityDirections();

   const chapterRefreshStates = toStoredChapterRefreshStates(createInitialChapterRefreshState());

   (["morning", "afternoon", "evening"] as const).forEach((period) => {
      activityDirectionsByPeriod[period] = legacySession.activityDirectionsByPeriod[period];

      chapterRefreshStates[period] = {
         ...legacySession.chapterRefreshStates[period],
      };
   });

   return {
      version: 5,

      selectedMetroSlug: legacySession.selectedMetroSlug,
      selectedMunicipalityId: legacySession.selectedMunicipalityId,
      selectedLocalAreaId: legacySession.selectedLocalAreaId,

      planningDate: legacySession.planningDate,

      activityDirectionsByPeriod,

      activeDayPeriod: legacySession.activeDayPeriod,

      sessionSeed: legacySession.sessionSeed,

      dayStops: legacySession.dayStops,

      chapterRefreshStates,
   };
}

function isStoredPlanningSession(value: unknown): value is StoredPlanningSession {
   if (!isRecord(value)) {
      return false;
   }

   return (
      value.version === 5 &&
      typeof value.selectedMetroSlug === "string" &&
      typeof value.selectedMunicipalityId === "string" &&
      typeof value.selectedLocalAreaId === "string" &&
      isPlanningDate(value.planningDate) &&
      isStoredActivityDirections(value.activityDirectionsByPeriod) &&
      isDayPeriod(value.activeDayPeriod) &&
      typeof value.sessionSeed === "string" &&
      value.sessionSeed.length > 0 &&
      Array.isArray(value.dayStops) &&
      value.dayStops.length <= 5 &&
      value.dayStops.every(isStoredDayStop) &&
      (value.similarDayPeriods === undefined || isStoredSimilarDayPeriods(value.similarDayPeriods)) &&
      isStoredChapterRefreshStates(value.chapterRefreshStates)
   );
}

function readStoredPlanningSession(): StoredPlanningSession | null {
   try {
      const rawSession = window.sessionStorage.getItem(planningSessionStorageKey);

      if (rawSession) {
         const parsedSession: unknown = JSON.parse(rawSession);

         if (isStoredPlanningSession(parsedSession)) {
            return parsedSession;
         }

         window.sessionStorage.removeItem(planningSessionStorageKey);
      }

      const rawLegacySession = window.sessionStorage.getItem(legacyPlanningSessionStorageKey);

      if (!rawLegacySession) {
         return null;
      }

      const parsedLegacySession: unknown = JSON.parse(rawLegacySession);

      if (!isLegacyStoredPlanningSessionV4(parsedLegacySession)) {
         window.sessionStorage.removeItem(legacyPlanningSessionStorageKey);

         return null;
      }

      const migratedSession = migrateLegacyPlanningSessionV4(parsedLegacySession);

      window.sessionStorage.removeItem(legacyPlanningSessionStorageKey);

      return migratedSession;
   } catch {
      return null;
   }
}

function saveStoredPlanningSession(session: StoredPlanningSession) {
   try {
      window.sessionStorage.setItem(planningSessionStorageKey, JSON.stringify(session));
   } catch {
      // Sidewalk can continue without browser storage.
   }
}

export function SidewalkPlanner() {
   const [selectedMetroSlug, setSelectedMetroSlug] = useState(defaultMetroSlug);

   const [selectedMunicipalityId, setSelectedMunicipalityId] = useState("");

   const [selectedLocalAreaId, setSelectedLocalAreaId] = useState("");

   const [planningDate, setPlanningDate] = useState("");

   const [activityDirectionsByPeriod, setActivityDirectionsByPeriod] = useState<ActivityDirectionsByPeriod>(createEmptyActivityDirections);

   const [activeDayPeriod, setActiveDayPeriod] = useState<DayPeriod>("early-morning");

   const [sessionSeed, setSessionSeed] = useState("");

   const [isSessionReady, setIsSessionReady] = useState(false);

   const [recommendationsByPeriod, setRecommendationsByPeriod] = useState<RecommendationsByPeriod>(createEmptyRecommendations);

   const [recommendationStatuses, setRecommendationStatuses] = useState<RecommendationStatuses>(createIdleStatuses);

   const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendations>({});

   const [loadedRequestKeys, setLoadedRequestKeys] = useState<RequestKeysByPeriod>(createEmptyRequestKeys);

   const [chapterRefreshStates, setChapterRefreshStates] = useState<ChapterRefreshStates>(createInitialChapterRefreshState);

   const requestControllersReference = useRef<Partial<Record<DayPeriod, AbortController>>>({});

   const shareRequestControllerReference = useRef<AbortController | null>(null);

   const tripShareRequestControllerReference = useRef<AbortController | null>(null);

   const periodPanelReference = useRef<HTMLElement | null>(null);

   const shouldFocusPeriodPanelReference = useRef(false);

   const [dayStops, setDayStops] = useState<DayStop[]>([]);

   const [isDayTrayOpen, setIsDayTrayOpen] = useState(false);

   const [dayPlanAnnouncement, setDayPlanAnnouncement] = useState("");

   const [recentMetroSlugs, setRecentMetroSlugs] = useState<readonly string[]>([]);

   const [sharedDayCreationState, setSharedDayCreationState] = useState<SharedDayCreationState>(createInitialSharedDayCreationState);

   const [sharedTripCreationState, setSharedTripCreationState] = useState<SharedTripCreationState>(createInitialSharedTripCreationState);

   const [similarDayPeriods, setSimilarDayPeriods] = useState<readonly DayPeriod[]>([]);

   const [tripFolio, setTripFolio] = useState<TripFolio | null>(null);

   const [tripFolioMessage, setTripFolioMessage] = useState("");

   const [recommendationFeedback, setRecommendationFeedback] = useState<readonly RecommendationFeedbackSignal[]>([]);

   const selectedMetro = activeMetroRegions.find((metroRegion) => metroRegion.slug === selectedMetroSlug) ?? activeMetroRegions[0];

   const selectedMetroRegionLabel = selectedMetro
      ? selectedMetro.countryCode === "US"
         ? selectedMetro.stateOrRegion
         : getCountryByCode(selectedMetro.countryCode)?.name ?? selectedMetro.countryCode
      : "";

   const availableMunicipalities = selectedMetro ? getMunicipalitiesForMetro(selectedMetro.id) : [];

   const availableLocalAreas = selectedMunicipalityId ? getLocalAreasForMunicipality(selectedMunicipalityId) : [];

   const selectedMunicipality = availableMunicipalities.find((municipality) => municipality.id === selectedMunicipalityId) ?? null;

   const selectedLocalArea = availableLocalAreas.find((localArea) => localArea.id === selectedLocalAreaId) ?? null;

   const selectedGeography =
      selectedMetro && selectedMunicipality && selectedLocalArea
         ? resolveGeography({
              metroRegionId: selectedMetro.id,
              municipalityId: selectedMunicipality.id,
              localAreaId: selectedLocalArea.id,
           })
         : null;

   const activeActivityDirection = activityDirectionsByPeriod[activeDayPeriod];

   const activeChapterRefreshState = chapterRefreshStates[activeDayPeriod];

   const sharedDaySourceKey = createSharedDaySourceKey(planningDate, selectedMetro?.id ?? "", selectedMunicipality?.id ?? "", selectedLocalArea?.id ?? "", dayStops);

   const currentTripDay =
      selectedGeography && planningDate && dayStops.length >= 2
         ? createTripFolioDay({
              planningDate,

              countryCode: selectedGeography.country.code,
              countryName: selectedGeography.country.name,

              regionCode: selectedGeography.region.code,
              regionName: selectedGeography.region.name,

              timezone: selectedGeography.timezone,

              metroRegionId: selectedGeography.metroRegion.id,
              metroSlug: selectedGeography.metroRegion.slug,
              metroName: selectedGeography.metroRegion.name,
              stateOrRegion: selectedGeography.metroRegion.stateOrRegion,

              municipalityId: selectedGeography.municipality.id,
              municipalityName: selectedGeography.municipality.name,

              localAreaId: selectedGeography.localArea.id,
              localAreaName: selectedGeography.localArea.name,

              stops: dayStops,
           })
         : null;

   const savedTripDay = findTripFolioDay(tripFolio, planningDate);

   const tripDayStatus = !savedTripDay || !currentTripDay ? "not-saved" : createTripFolioDaySourceKey(savedTripDay) === createTripFolioDaySourceKey(currentTripDay) ? "saved" : "changed";

   const sharedTripSourceKey = createSharedTripSourceKey(tripFolio);

   useEffect(() => {
      try {
         previousPlanningSessionStorageKeys.forEach((storageKey) => {
            window.sessionStorage.removeItem(storageKey);
         });
      } catch {
         // Ignore unavailable browser storage.
      }

      const hasSimilarDayRequest = new URL(window.location.href).searchParams.get("similar") === "1";

      const similarDayContext = hasSimilarDayRequest ? readSimilarDayContext() : null;

      if (hasSimilarDayRequest) {
         removeSimilarDayQueryParameters();
      }

      if (similarDayContext) {
         const today = getTodayPlanningDateForMetroSlug(similarDayContext.metroSlug);

         const nextSessionSeed = generateAnonymousSessionSeed();

         try {
            window.sessionStorage.removeItem(planningSessionStorageKey);
         } catch {
            // The new session can still initialize without browser storage.
         }

         saveSessionSeed(nextSessionSeed);

         setSelectedMetroSlug(similarDayContext.metroSlug);
         setSelectedMunicipalityId(similarDayContext.municipalityId);
         setSelectedLocalAreaId(similarDayContext.localAreaId);

         setPlanningDate(today);
         setActivityDirectionsByPeriod(createEmptyActivityDirections());
         setActiveDayPeriod(similarDayContext.periods[0]);
         setSessionSeed(nextSessionSeed);

         setRecommendationsByPeriod(createEmptyRecommendations());
         setRecommendationStatuses(createIdleStatuses());
         setSelectedRecommendations({});
         setLoadedRequestKeys(createEmptyRequestKeys());
         setChapterRefreshStates(createInitialChapterRefreshState());

         setDayStops([]);
         setIsDayTrayOpen(false);

         setSimilarDayPeriods(similarDayContext.periods);

         setDayPlanAnnouncement(`A fresh day is ready in the same area. ${similarDayContext.periods.map(getPeriodLabel).join(", ")} are prioritized, and no places were copied.`);

         setIsSessionReady(true);

         return;
      }

      const storedSession = readStoredPlanningSession();

      if (storedSession) {
         const metroStillExists = activeMetroRegions.some((metroRegion) => metroRegion.slug === storedSession.selectedMetroSlug);

         if (metroStillExists) {
            const today = getTodayPlanningDateForMetroSlug(storedSession.selectedMetroSlug);

            const planningDateIsCurrent = storedSession.planningDate >= today;

            const restoredStops = planningDateIsCurrent ? sortDayStops(storedSession.dayStops) : [];

            setSelectedMetroSlug(storedSession.selectedMetroSlug);

            setSelectedMunicipalityId(storedSession.selectedMunicipalityId);

            setSelectedLocalAreaId(storedSession.selectedLocalAreaId);

            setPlanningDate(planningDateIsCurrent ? storedSession.planningDate : today);

            setActivityDirectionsByPeriod(storedSession.activityDirectionsByPeriod);

            setActiveDayPeriod(planningDateIsCurrent ? storedSession.activeDayPeriod : getCurrentDayPeriodFromDeviceClock());

            setSessionSeed(storedSession.sessionSeed);

            setDayStops(restoredStops);

            setSimilarDayPeriods(planningDateIsCurrent ? (storedSession.similarDayPeriods ?? []) : []);

            setChapterRefreshStates(planningDateIsCurrent ? fromStoredChapterRefreshStates(storedSession.chapterRefreshStates) : createInitialChapterRefreshState());

            setIsDayTrayOpen(restoredStops.length >= 2);

            saveSessionSeed(storedSession.sessionSeed);

            setIsSessionReady(true);

            return;
         }
      }

      setPlanningDate(getTodayPlanningDateForMetroSlug(defaultMetroSlug));
      setActiveDayPeriod(getCurrentDayPeriodFromDeviceClock());
      setSessionSeed(getOrCreateSessionSeed());
      setIsSessionReady(true);
   }, []);

   useEffect(() => {
      setTripFolio(readTripFolio());
   }, []);

   useEffect(() => {
      setRecommendationFeedback(readRecommendationFeedback());
   }, []);

   /**
    * A metro becomes recent only after the user has selected a local area.
    * This keeps the default San Diego state from appearing as activity before
    * the user has actually planned there.
    */
   useEffect(() => {
      if (!isSessionReady) {
         return;
      }

      const storedRecentSlugs = readRecentMetroSlugs(activeMetroSlugs);

      const nextRecentSlugs = selectedLocalAreaId ? createRecentMetroSlugs(storedRecentSlugs, selectedMetroSlug, activeMetroSlugs) : storedRecentSlugs;

      saveRecentMetroSlugs(nextRecentSlugs, storedRecentSlugs);
      setRecentMetroSlugs(nextRecentSlugs);
   }, [isSessionReady, selectedLocalAreaId, selectedMetroSlug]);

   useEffect(() => {
      if (sharedDayCreationState.status === "idle" || sharedDayCreationState.sourceKey === sharedDaySourceKey) {
         return;
      }

      shareRequestControllerReference.current?.abort();
      shareRequestControllerReference.current = null;

      setSharedDayCreationState(createInitialSharedDayCreationState());
   }, [sharedDayCreationState.sourceKey, sharedDayCreationState.status, sharedDaySourceKey]);

   useEffect(() => {
      if (sharedTripCreationState.status === "idle" || sharedTripCreationState.sourceKey === sharedTripSourceKey) {
         return;
      }

      tripShareRequestControllerReference.current?.abort();
      tripShareRequestControllerReference.current = null;

      setSharedTripCreationState(createInitialSharedTripCreationState());
   }, [sharedTripCreationState.sourceKey, sharedTripCreationState.status, sharedTripSourceKey]);

   useEffect(() => {
      return () => {
         Object.values(requestControllersReference.current).forEach((controller) => {
            controller?.abort();
         });

         shareRequestControllerReference.current?.abort();
         tripShareRequestControllerReference.current?.abort();
      };
   }, []);

   /**
    * Explicit period changes, such as Continue or editing a saved stop, move
    * keyboard focus into the newly active panel.
    */
   useEffect(() => {
      if (!shouldFocusPeriodPanelReference.current) {
         return;
      }

      shouldFocusPeriodPanelReference.current = false;

      const frameId = window.requestAnimationFrame(() => {
         periodPanelReference.current?.focus();
      });

      return () => {
         window.cancelAnimationFrame(frameId);
      };
   }, [activeDayPeriod]);

   useEffect(() => {
      if (!isSessionReady || !sessionSeed) {
         return;
      }

      saveStoredPlanningSession({
         version: 5,

         selectedMetroSlug,
         selectedMunicipalityId,
         selectedLocalAreaId,

         planningDate,

         activityDirectionsByPeriod,

         activeDayPeriod,

         sessionSeed,

         dayStops,

         similarDayPeriods,

         chapterRefreshStates: toStoredChapterRefreshStates(chapterRefreshStates),
      });
   }, [activeDayPeriod, activityDirectionsByPeriod, chapterRefreshStates, dayStops, isSessionReady, planningDate, selectedLocalAreaId, selectedMetroSlug, selectedMunicipalityId, sessionSeed, similarDayPeriods]);

   /**
    * Recommendations are loaded only for the active chapter.
    *
    * Each period owns its own activity direction, recommendation list, status,
    * selection, and request cache. Changing Afternoon therefore cannot clear
    * or replace Morning.
    */
   useEffect(() => {
      if (!isSessionReady || !selectedMetro || !selectedMunicipality || !selectedLocalArea || !planningDate || !activeActivityDirection || !sessionSeed) {
         return;
      }

      const dayPeriod = activeDayPeriod;

      const committedStops = createCommittedStopContext(dayStops, dayPeriod);

      const committedStopsSegment = createCommittedStopsRequestSegment(committedStops);

      const chapterRefreshState = chapterRefreshStates[dayPeriod];

      const variationIndex = chapterRefreshState.refreshCount;

      const requestKey = createPeriodRequestKey(selectedMetro.id, selectedMunicipality.id, selectedLocalArea.id, dayPeriod, activeActivityDirection, planningDate, sessionSeed, variationIndex, committedStopsSegment);

      if (loadedRequestKeys[dayPeriod] === requestKey) {
         return;
      }

      requestControllersReference.current[dayPeriod]?.abort();

      const controller = new AbortController();

      requestControllersReference.current[dayPeriod] = controller;

      const hadExistingRecommendations = recommendationsByPeriod[dayPeriod].length > 0;

      if (!hadExistingRecommendations) {
         setRecommendationStatuses((currentStatuses) => ({
            ...currentStatuses,
            [dayPeriod]: "loading",
         }));
      }

      const excludedPlaceIds = new Set<string>(getFeedbackExcludedPlaceIds(recommendationFeedback));

      if (variationIndex > 0) {
         chapterRefreshState.shownPlaceIds.forEach((placeId) => {
            excludedPlaceIds.add(placeId);
         });
      }

      dayStops.forEach((stop) => {
         if (stop.dayPeriod !== dayPeriod) {
            excludedPlaceIds.add(stop.placeId);
         }
      });

      dayPeriods.forEach((otherPeriod) => {
         if (otherPeriod === dayPeriod) {
            return;
         }

         recommendationsByPeriod[otherPeriod].forEach((recommendation) => {
            excludedPlaceIds.add(recommendation.place.id);
         });
      });

      const metro = selectedMetro;
      const municipality = selectedMunicipality;
      const localArea = selectedLocalArea;
      const activityDirection = activeActivityDirection;
      const planningSessionSeed = sessionSeed;

      async function loadPeriod() {
         try {
            const response = await fetchPeriodRecommendations(
               {
                  metroRegionId: metro.id,

                  municipalityId: municipality.id,

                  localAreaId: localArea.id,

                  dayPeriod,

                  activityDirection,

                  planningDate,

                  sessionSeed: planningSessionSeed,

                  variationIndex,

                  excludedPlaceIds: Array.from(excludedPlaceIds),

                  committedStops,
               },

               controller.signal,
            );

            const uniqueRecommendations = response.recommendations.filter((recommendation) => !excludedPlaceIds.has(recommendation.place.id));

            trackProductSignal("recommendation_loaded", {
               metroSlug: metro.slug,
               localAreaId: localArea.id,
               period: dayPeriod,
               count: uniqueRecommendations.length,
            });

            if (controller.signal.aborted) {
               return;
            }

            setRecommendationsByPeriod((currentRecommendations) => ({
               ...currentRecommendations,

               [dayPeriod]: uniqueRecommendations,
            }));

            setRecommendationStatuses((currentStatuses) => ({
               ...currentStatuses,

               [dayPeriod]: uniqueRecommendations.length > 0 ? "ready" : "empty",
            }));

            setChapterRefreshStates((currentStates) => ({
               ...currentStates,

               [dayPeriod]: {
                  ...currentStates[dayPeriod],

                  shownPlaceIds: mergePlaceIds(
                     currentStates[dayPeriod].shownPlaceIds,
                     uniqueRecommendations.map((recommendation) => recommendation.place.id),
                  ),

                  isRefreshing: false,

                  canRefresh: uniqueRecommendations.length >= 3 && currentStates[dayPeriod].refreshCount < maxPeriodRecommendationRefreshes,

                  message: currentStates[dayPeriod].refreshCount >= maxPeriodRecommendationRefreshes ? "These are the strongest nearby options." : "",
               },
            }));

            const committedPlaceId = dayStops.find((stop) => stop.dayPeriod === dayPeriod)?.placeId ?? null;

            const initialRecommendation = uniqueRecommendations.find((recommendation) => recommendation.place.id === committedPlaceId) ?? uniqueRecommendations[0] ?? null;

            setSelectedRecommendations((currentSelections) => {
               const nextSelections: SelectedRecommendations = {
                  ...currentSelections,
               };

               if (initialRecommendation) {
                  nextSelections[dayPeriod] = initialRecommendation;
               } else {
                  delete nextSelections[dayPeriod];
               }

               return nextSelections;
            });

            setLoadedRequestKeys((currentKeys) => ({
               ...currentKeys,

               [dayPeriod]: requestKey,
            }));
         } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") {
               return;
            }

            console.error(`Sidewalk ${dayPeriod} recommendation error:`, error);

            setRecommendationStatuses((currentStatuses) => ({
               ...currentStatuses,

               [dayPeriod]: hadExistingRecommendations ? "ready" : "error",
            }));

            setChapterRefreshStates((currentStates) => ({
               ...currentStates,

               [dayPeriod]: {
                  ...currentStates[dayPeriod],
                  isRefreshing: false,
                  message: hadExistingRecommendations ? "Sidewalk couldn’t update these options. Your current choices are still here." : currentStates[dayPeriod].message,
               },
            }));

            setDayPlanAnnouncement(hadExistingRecommendations ? `${getPeriodLabel(dayPeriod)} could not update, so Sidewalk kept the current options.` : `Sidewalk could not load ${getPeriodLabel(dayPeriod).toLowerCase()} options right now.`);
         }
      }

      void loadPeriod();

      return () => {
         controller.abort();
      };
   }, [activeActivityDirection, activeDayPeriod, chapterRefreshStates, dayStops, isSessionReady, loadedRequestKeys, recommendationsByPeriod, planningDate, selectedLocalArea, selectedMetro, selectedMunicipality, sessionSeed]);

   if (!selectedMetro) {
      return (
         <>
            <main id="main-content" className="empty-product-state" tabIndex={-1}>
               <h1>Sidewalk is unavailable.</h1>

               <p>No active metro regions could be loaded.</p>
            </main>

            <SiteFooter />
         </>
      );
   }

   const municipalityRegionCount = new Set(availableMunicipalities.map((municipality) => municipality.stateOrRegion)).size;

   const municipalityOptions = availableMunicipalities.map((municipality) => ({
      value: municipality.id,

      label: municipalityRegionCount > 1 ? `${municipality.name} — ${municipality.stateOrRegion}` : municipality.name,
   }));

   const localAreaOptions = availableLocalAreas.map((localArea) => ({
      value: localArea.id,
      label: localArea.name,
   }));

   const activeRecommendations = recommendationsByPeriod[activeDayPeriod];

   const activeStatus = recommendationStatuses[activeDayPeriod];

   const activeSelectedRecommendation = selectedRecommendations[activeDayPeriod] ?? activeRecommendations[0] ?? null;

   const activeDayStop = dayStops.find((stop) => stop.dayPeriod === activeDayPeriod) ?? null;

   const activeAddedPlaceId = activeDayStop?.placeId ?? null;

   const isCurrentPeriodStop = activeSelectedRecommendation !== null && activeDayStop?.placeId === activeSelectedRecommendation.place.id;

   const nextUnfilledPeriod = activeDayStop ? getNextUnfilledPeriod(activeDayPeriod, dayStops, similarDayPeriods) : null;

   const nextUnfilledPeriodLabel = nextUnfilledPeriod ? getPeriodLabel(nextUnfilledPeriod) : null;

   const similarDayPeriodLabels = similarDayPeriods.map(getPeriodLabel).join(" · ");

   const completedPeriods = dayStops.map((stop) => stop.dayPeriod);

   const chosenChapterCount = dayStops.length;

   const planProgressCopy = getPlanProgressCopy(chosenChapterCount);

   const hasPersistentTray = dayStops.length > 0 || tripFolio !== null;

   const layoutClassName = hasPersistentTray ? "editorial-container planning-view__layout planning-view__layout--with-tray" : "editorial-container planning-view__layout";

   const mainClassName = hasPersistentTray ? "home-main home-main--with-day-tray" : "home-main";

   function abortAllRequests() {
      Object.values(requestControllersReference.current).forEach((controller) => {
         controller?.abort();
      });

      requestControllersReference.current = {};
   }

   function clearAllGeneratedPlanning(clearActivities: boolean, clearSimilarDayShape = false, startingDayPeriod?: DayPeriod) {
      abortAllRequests();

      shouldFocusPeriodPanelReference.current = true;

      setActiveDayPeriod(startingDayPeriod ?? getStartingDayPeriod(planningDate, selectedMetro?.timezone));

      setRecommendationsByPeriod(createEmptyRecommendations());

      setRecommendationStatuses(createIdleStatuses());

      setSelectedRecommendations({});

      setLoadedRequestKeys(createEmptyRequestKeys());

      setChapterRefreshStates(createInitialChapterRefreshState());

      setDayStops([]);

      setIsDayTrayOpen(false);

      if (clearActivities) {
         setActivityDirectionsByPeriod(createEmptyActivityDirections());
      }

      if (clearSimilarDayShape) {
         setSimilarDayPeriods([]);
      }
   }

   function createDayStop(recommendation: PeriodRecommendation, dayPeriod: DayPeriod): DayStop | null {
      const municipality = municipalities.find((candidate) => candidate.id === recommendation.place.municipalityId) ?? null;

      const localArea = localAreas.find((candidate) => candidate.id === recommendation.place.localAreaId) ?? null;

      if (!municipality || !localArea) {
         return null;
      }

      return {
         id: `day-stop-${dayPeriod}-${recommendation.place.id}`,

         dayPeriod,

         bestWindow: recommendation.bestWindow,

         resolvedActivity: recommendation.resolvedActivity,

         placeId: recommendation.place.id,

         placeName: recommendation.place.provider.name,

         metroRegionId: recommendation.place.metroRegionId,

         municipalityId: municipality.id,

         municipalityName: municipality.name,

         localAreaId: localArea.id,

         localAreaName: localArea.name,

         latitude: recommendation.place.provider.latitude ?? null,

         longitude: recommendation.place.provider.longitude ?? null,

         locationUrl: recommendation.place.provider.mapsUrl ?? recommendation.place.provider.websiteUrl ?? null,

         visitDurationMinutes: recommendation.place.editorial.visitDurationMinutes,

         summary: recommendation.place.editorial.summary,
         reason: recommendation.reason,
         photoResourceName: recommendation.place.provider.photoResourceName ?? null,
      };
   }

   function handleMetroChange(nextMetroSlug: string) {
      if (nextMetroSlug === selectedMetroSlug) {
         return;
      }

      const nextMetro = activeMetroRegions.find((candidate) => candidate.slug === nextMetroSlug) ?? null;

      if (!nextMetro) {
         return;
      }

      const hadDayStops = dayStops.length > 0;

      const destinationToday = getDestinationIsoDate(nextMetro.timezone);

      setSelectedMetroSlug(nextMetroSlug);

      trackProductSignal("metro_selected", {
         metroSlug: nextMetroSlug,
      });

      setSelectedMunicipalityId("");

      setSelectedLocalAreaId("");

      const nextPlanningDate = !planningDate || planningDate < destinationToday ? destinationToday : planningDate;

      if (nextPlanningDate !== planningDate) {
         setPlanningDate(nextPlanningDate);
      }

      clearAllGeneratedPlanning(true, true, getStartingDayPeriod(nextPlanningDate, nextMetro.timezone));

      if (hadDayStops) {
         setDayPlanAnnouncement("Your day was cleared because the metro region changed.");
      }
   }

   function handleMunicipalityChange(nextMunicipalityId: string) {
      const hadDayStops = dayStops.length > 0;

      setSelectedMunicipalityId(nextMunicipalityId);

      setSelectedLocalAreaId("");

      clearAllGeneratedPlanning(true, true);

      if (hadDayStops) {
         setDayPlanAnnouncement("Your day was cleared because the municipality changed.");
      }
   }

   function handleLocalAreaChange(nextLocalAreaId: string) {
      const hadDayStops = dayStops.length > 0;

      trackProductSignal(selectedLocalAreaId ? "neighborhood_changed" : "neighborhood_selected", {
         metroSlug: selectedMetroSlug,
         localAreaId: nextLocalAreaId,
      });

      setSelectedLocalAreaId(nextLocalAreaId);

      clearAllGeneratedPlanning(true, true);

      if (hadDayStops) {
         setDayPlanAnnouncement("Neighborhood changed. Sidewalk cleared the open day so the next picks belong to the new area.");
      }
   }

   function handlePlanningDateChange(nextPlanningDate: string) {
      if (nextPlanningDate === planningDate || !isPlanningDate(nextPlanningDate)) {
         return;
      }

      const existingTripDay = findTripFolioDay(tripFolio, nextPlanningDate);

      if (existingTripDay) {
         handleEditTripDay(existingTripDay.planningDate);

         return;
      }

      const hadDayStops = dayStops.length > 0;

      setPlanningDate(nextPlanningDate);

      clearAllGeneratedPlanning(false, false, getStartingDayPeriod(nextPlanningDate, selectedMetro?.timezone));

      setTripFolioMessage("");

      setDayPlanAnnouncement(hadDayStops ? "Your chosen stops were cleared because the planning date changed." : "Sidewalk is preparing recommendations for the new date.");
   }

   /**
    * Activity choices belong to individual chapters.
    *
    * Changing Afternoon never clears Morning or Evening. An existing stop in
    * the active period also remains committed until the user explicitly adds a
    * replacement.
    */
   function handleActivityDirectionChange(direction: ActivityDirection) {
      const dayPeriod = activeDayPeriod;

      if (activityDirectionsByPeriod[dayPeriod] === direction) {
         return;
      }

      requestControllersReference.current[dayPeriod]?.abort();

      setActivityDirectionsByPeriod((currentDirections) => ({
         ...currentDirections,

         [dayPeriod]: direction,
      }));

      setRecommendationsByPeriod((currentRecommendations) => ({
         ...currentRecommendations,

         [dayPeriod]: [],
      }));

      setRecommendationStatuses((currentStatuses) => ({
         ...currentStatuses,

         [dayPeriod]: "idle",
      }));

      setSelectedRecommendations((currentSelections) => {
         const nextSelections: SelectedRecommendations = {
            ...currentSelections,
         };

         delete nextSelections[dayPeriod];

         return nextSelections;
      });

      setLoadedRequestKeys((currentKeys) => ({
         ...currentKeys,

         [dayPeriod]: null,
      }));

      setChapterRefreshStates((currentStates) => ({
         ...currentStates,

         [dayPeriod]: createInitialChapterRefreshState()[dayPeriod],
      }));

      const existingStop = dayStops.find((stop) => stop.dayPeriod === dayPeriod) ?? null;

      setDayPlanAnnouncement(existingStop ? `Sidewalk is finding new ${getPeriodLabel(dayPeriod)} options. ${existingStop.placeName} remains in your day until you choose a replacement.` : `Sidewalk is finding ${getPeriodLabel(dayPeriod)} options.`);
   }

   function handlePeriodChange(period: DayPeriod) {
      setActiveDayPeriod(period);

      const periodSelection = selectedRecommendations[period] ?? recommendationsByPeriod[period][0] ?? null;

      if (periodSelection) {
         setDayPlanAnnouncement(`${getPeriodLabel(period)} is showing ${periodSelection.place.provider.name}.`);
      }
   }

   async function handleRefreshChapter() {
      if (!selectedMetro || !selectedMunicipality || !selectedLocalArea || !planningDate || !activeActivityDirection || !sessionSeed) {
         return;
      }

      const dayPeriod = activeDayPeriod;

      const currentRefreshState = chapterRefreshStates[dayPeriod];

      const currentRecommendations = recommendationsByPeriod[dayPeriod];

      if (currentRefreshState.isRefreshing || !currentRefreshState.canRefresh || currentRefreshState.refreshCount >= maxPeriodRecommendationRefreshes || currentRecommendations.length < 3) {
         return;
      }

      requestControllersReference.current[dayPeriod]?.abort();

      const controller = new AbortController();

      requestControllersReference.current[dayPeriod] = controller;

      setChapterRefreshStates((currentStates) => ({
         ...currentStates,

         [dayPeriod]: {
            ...currentStates[dayPeriod],
            isRefreshing: true,
            message: "",
         },
      }));

      const nextVariationIndex = currentRefreshState.refreshCount + 1;

      const coherenceStops = createCommittedStopContext(dayStops, dayPeriod);

      const requestCommittedStops = createCommittedStopContext(dayStops, dayPeriod, true);

      const committedStopsSegment = createCommittedStopsRequestSegment(coherenceStops);

      const requestKey = createPeriodRequestKey(selectedMetro.id, selectedMunicipality.id, selectedLocalArea.id, dayPeriod, activeActivityDirection, planningDate, sessionSeed, nextVariationIndex, committedStopsSegment);

      const excludedPlaceIds = new Set<string>([...currentRefreshState.shownPlaceIds, ...getFeedbackExcludedPlaceIds(recommendationFeedback)]);

      currentRecommendations.forEach((recommendation) => {
         excludedPlaceIds.add(recommendation.place.id);
      });

      dayStops.forEach((stop) => {
         excludedPlaceIds.add(stop.placeId);
      });

      dayPeriods.forEach((otherPeriod) => {
         if (otherPeriod === dayPeriod) {
            return;
         }

         recommendationsByPeriod[otherPeriod].forEach((recommendation) => {
            excludedPlaceIds.add(recommendation.place.id);
         });
      });

      try {
         const response = await fetchPeriodRecommendations(
            {
               metroRegionId: selectedMetro.id,

               municipalityId: selectedMunicipality.id,

               localAreaId: selectedLocalArea.id,

               dayPeriod,

               activityDirection: activeActivityDirection,

               planningDate,

               sessionSeed,

               variationIndex: nextVariationIndex,

               excludedPlaceIds: Array.from(excludedPlaceIds),

               committedStops: requestCommittedStops,
            },

            controller.signal,
         );

         if (controller.signal.aborted) {
            return;
         }

         const alternateRecommendations = response.recommendations.filter((recommendation) => !excludedPlaceIds.has(recommendation.place.id));

         if (alternateRecommendations.length < 3) {
            setChapterRefreshStates((currentStates) => ({
               ...currentStates,

               [dayPeriod]: {
                  ...currentStates[dayPeriod],
                  isRefreshing: false,
                  canRefresh: false,
                  message: "Sidewalk couldn’t find a stronger alternate set nearby.",
               },
            }));

            setDayPlanAnnouncement(`Sidewalk could not find a stronger alternate ${getPeriodLabel(dayPeriod).toLowerCase()} set nearby.`);

            return;
         }

         setRecommendationsByPeriod((currentByPeriod) => ({
            ...currentByPeriod,

            [dayPeriod]: alternateRecommendations,
         }));

         setRecommendationStatuses((currentStatuses) => ({
            ...currentStatuses,

            [dayPeriod]: "ready",
         }));

         setSelectedRecommendations((currentSelections) => ({
            ...currentSelections,

            [dayPeriod]: alternateRecommendations[0],
         }));

         setLoadedRequestKeys((currentKeys) => ({
            ...currentKeys,

            [dayPeriod]: requestKey,
         }));

         setChapterRefreshStates((currentStates) => ({
            ...currentStates,

            [dayPeriod]: {
               refreshCount: nextVariationIndex,

               shownPlaceIds: mergePlaceIds(
                  currentStates[dayPeriod].shownPlaceIds,
                  alternateRecommendations.map((recommendation) => recommendation.place.id),
               ),

               isRefreshing: false,

               canRefresh: nextVariationIndex < maxPeriodRecommendationRefreshes,

               message: nextVariationIndex >= maxPeriodRecommendationRefreshes ? "These are the strongest nearby options." : "Three new options are ready.",
            },
         }));

         setDayPlanAnnouncement(`Three new ${getPeriodLabel(dayPeriod).toLowerCase()} options are ready.`);
      } catch (error: unknown) {
         if (error instanceof Error && error.name === "AbortError") {
            return;
         }

         console.error(`Sidewalk ${dayPeriod} refresh error:`, error);

         setChapterRefreshStates((currentStates) => ({
            ...currentStates,

            [dayPeriod]: {
               ...currentStates[dayPeriod],
               isRefreshing: false,
               canRefresh: false,
               message: "Sidewalk couldn’t find a stronger alternate set nearby.",
            },
         }));

         setDayPlanAnnouncement(`Sidewalk could not refresh the ${getPeriodLabel(dayPeriod).toLowerCase()} options.`);
      }
   }

   function handleRecommendationFeedback(period: DayPeriod, recommendation: PeriodRecommendation, reason: RecommendationFeedbackReason) {
      if (!selectedLocalArea) {
         return;
      }

      const nextFeedback = recordRecommendationFeedback(recommendationFeedback, {
         placeId: recommendation.place.id,
         reason,
         dayPeriod: period,
         localAreaId: selectedLocalArea.id,
      });

      saveRecommendationFeedback(nextFeedback);

      trackProductSignal("recommendation_feedback", {
         metroSlug: selectedMetroSlug,
         localAreaId: selectedLocalArea.id,
         period,
         reason,
      });

      setRecommendationFeedback(nextFeedback);

      const remainingRecommendations = recommendationsByPeriod[period].filter((candidate) => candidate.place.id !== recommendation.place.id);

      setRecommendationsByPeriod((currentRecommendations) => ({
         ...currentRecommendations,
         [period]: remainingRecommendations,
      }));

      setSelectedRecommendations((currentSelections) => ({
         ...currentSelections,
         [period]: remainingRecommendations[0],
      }));

      setLoadedRequestKeys((currentKeys) => ({
         ...currentKeys,
         [period]: null,
      }));

      const feedbackCopy =
         reason === "been-there"
            ? "Been there. Sidewalk will make room for something new."
            : reason === "too-far"
              ? "Got it. Sidewalk will leave that one out for the rest of this planning session."
              : "Not your thing. Sidewalk will steer around that one for the rest of this planning session.";

      setDayPlanAnnouncement(feedbackCopy);
   }

   function handleRecommendationSelect(period: DayPeriod, recommendation: PeriodRecommendation) {
      setSelectedRecommendations((currentSelections) => ({
         ...currentSelections,

         [period]: recommendation,
      }));

      setDayPlanAnnouncement(`${recommendation.place.provider.name} selected for ${getPeriodLabel(period)}.`);
   }

   function handleAddPeriodStop(period: DayPeriod, recommendation: PeriodRecommendation) {
      const duplicateStop = dayStops.find((stop) => stop.placeId === recommendation.place.id && stop.dayPeriod !== period);

      if (duplicateStop) {
         setDayPlanAnnouncement(`${recommendation.place.provider.name} is already part of ${getPeriodLabel(duplicateStop.dayPeriod)}.`);

         return;
      }

      const nextStop = createDayStop(recommendation, period);

      if (!nextStop) {
         setDayPlanAnnouncement("Sidewalk could not add that place because its geography is incomplete.");

         return;
      }

      const existingPeriodStop = dayStops.find((stop) => stop.dayPeriod === period) ?? null;

      if (existingPeriodStop?.placeId === nextStop.placeId) {
         return;
      }

      const remainingStops = dayStops.filter((stop) => stop.dayPeriod !== period);

      const nextStops = sortDayStops([...remainingStops, nextStop]);

      setDayStops(nextStops);

      if (!existingPeriodStop) {
         trackProductSignal("stop_added", {
            metroSlug: selectedMetroSlug,
            localAreaId: selectedLocalAreaId,
            period,
            count: nextStops.length,
         });

         if (nextStops.length === 2) {
            trackProductSignal("day_completed", {
               metroSlug: selectedMetroSlug,
               localAreaId: selectedLocalAreaId,
               stopCount: nextStops.length,
            });
         }
      }

      if (existingPeriodStop) {
         setDayPlanAnnouncement(`${nextStop.placeName} replaced ${existingPeriodStop.placeName} for ${getPeriodLabel(period)}. Your day remains saved.`);

         return;
      }

      if (nextStops.length === 1) {
         setDayPlanAnnouncement(`${nextStop.placeName} was added to ${getPeriodLabel(period)}. The recommendations will stay here while you compare. Continue when you are ready.`);

         return;
      }

      if (nextStops.length === 2) {
         setDayPlanAnnouncement(`${nextStop.placeName} completed your Sidewalk day with two stops. The day is saved, and every remaining time period is optional.`);

         return;
      }

      if (nextStops.length === dayPeriods.length) {
         setDayPlanAnnouncement(`${nextStop.placeName} completed all five parts of your Sidewalk day. Open Your Day when you are ready to review it.`);

         return;
      }

      setDayPlanAnnouncement(`${nextStop.placeName} was added to ${getPeriodLabel(period)}. Your day remains saved, and the other time periods stay optional.`);
   }

   function handleContinueFromPeriod(period: DayPeriod) {
      const nextPeriod = getNextUnfilledPeriod(period, dayStops, similarDayPeriods);

      if (!nextPeriod) {
         setIsDayTrayOpen(true);

         setDayPlanAnnouncement("Your selected time periods are ready to review.");

         return;
      }

      shouldFocusPeriodPanelReference.current = true;

      setActiveDayPeriod(nextPeriod);
      setIsDayTrayOpen(false);

      setDayPlanAnnouncement(`${getPeriodLabel(nextPeriod)} is ready when you are.`);
   }

   function handleEditPeriod(period: DayPeriod) {
      shouldFocusPeriodPanelReference.current = true;

      setActiveDayPeriod(period);

      setIsDayTrayOpen(false);

      setDayPlanAnnouncement(`${getPeriodLabel(period)} is ready to change.`);
   }

   function handleRemoveStop(stopId: string) {
      const removedStop = dayStops.find((stop) => stop.id === stopId) ?? null;

      if (!removedStop) {
         return;
      }

      const nextStops = dayStops.filter((stop) => stop.id !== stopId);

      setDayStops(nextStops);

      if (nextStops.length === 0) {
         setIsDayTrayOpen(false);

         window.requestAnimationFrame(() => {
            periodPanelReference.current?.focus();
         });
      }

      setDayPlanAnnouncement(
         nextStops.length >= 2
            ? `${removedStop.placeName} was removed from ${getPeriodLabel(removedStop.dayPeriod)}. Your two-stop day is still saved, and Your Day will remain open.`
            : nextStops.length === 1
              ? `${removedStop.placeName} was removed from ${getPeriodLabel(removedStop.dayPeriod)}. Your Day will remain open so you can make another change.`
              : `${removedStop.placeName} was removed. Your day is now clear, while your area, date, and preferences remain in place.`,
      );
   }

   function handleClearDay() {
      if (dayStops.length === 0) {
         return;
      }

      setDayStops([]);
      setIsDayTrayOpen(false);

      setDayPlanAnnouncement("Your day was cleared. Your area, date, activity preferences, and current recommendations remain in place.");

      window.requestAnimationFrame(() => {
         periodPanelReference.current?.focus();
      });
   }

   function handleDoneEditingDay() {
      setIsDayTrayOpen(false);

      setDayPlanAnnouncement("Your day is closed. Your selected stops remain saved in this browser session.");
   }

   function handleContinuePlanning() {
      const unfilledPeriod = getFirstUnfilledPeriod(dayStops, similarDayPeriods);

      if (!unfilledPeriod) {
         return;
      }

      shouldFocusPeriodPanelReference.current = true;

      setActiveDayPeriod(unfilledPeriod);
      setIsDayTrayOpen(false);

      setDayPlanAnnouncement(`${getPeriodLabel(unfilledPeriod)} is open if you would like to add one more stop.`);
   }

   async function handleCreateSharedDay() {
      if (sharedDayCreationState.status === "loading") {
         return;
      }

      if (sharedDayCreationState.status === "ready" && sharedDayCreationState.sourceKey === sharedDaySourceKey && sharedDayCreationState.shareUrl) {
         setDayPlanAnnouncement("Your shared-day link is already ready.");

         return;
      }

      if (!selectedMetro || !selectedMunicipality || !selectedLocalArea || dayStops.length < 2) {
         setSharedDayCreationState({
            status: "error",
            sourceKey: sharedDaySourceKey,
            shareUrl: null,
            message: "Choose at least two stops before sharing this day.",
         });

         return;
      }

      const request = createSharedDayRequestFromPlan({
         planningDate,

         metroRegionId: selectedMetro.id,
         municipalityId: selectedMunicipality.id,
         localAreaId: selectedLocalArea.id,

         stops: dayStops,
      });

      if (!request) {
         setSharedDayCreationState({
            status: "error",
            sourceKey: sharedDaySourceKey,
            shareUrl: null,
            message: "Sidewalk could not prepare this day for sharing.",
         });

         setDayPlanAnnouncement("Sidewalk could not prepare this day for sharing.");

         return;
      }

      shareRequestControllerReference.current?.abort();

      const controller = new AbortController();

      shareRequestControllerReference.current = controller;

      setSharedDayCreationState({
         status: "loading",
         sourceKey: sharedDaySourceKey,
         shareUrl: null,
         message: "",
      });

      setDayPlanAnnouncement("Sidewalk is creating a read-only link for your day.");

      try {
         const response = await requestSharedDay(request, controller.signal);

         if (controller.signal.aborted) {
            return;
         }

         setSharedDayCreationState({
            status: "ready",
            sourceKey: sharedDaySourceKey,
            shareUrl: response.shareUrl,
            message: "",
         });

         setDayPlanAnnouncement("Your shared-day link is ready.");
      } catch (error: unknown) {
         if (error instanceof Error && error.name === "AbortError") {
            return;
         }

         const message = error instanceof SharedDayRequestError ? error.message : "Sidewalk could not create a shareable day right now.";

         setSharedDayCreationState({
            status: "error",
            sourceKey: sharedDaySourceKey,
            shareUrl: null,
            message,
         });

         setDayPlanAnnouncement(message);
      } finally {
         if (shareRequestControllerReference.current === controller) {
            shareRequestControllerReference.current = null;
         }
      }
   }

   async function handleCreateSharedTrip() {
      if (sharedTripCreationState.status === "loading") {
         return;
      }

      if (!tripFolio) {
         setSharedTripCreationState({
            status: "error",
            sourceKey: sharedTripSourceKey,
            shareUrl: null,
            message: "Add days to a Trip Folio before sharing the trip.",
         });

         return;
      }

      if (tripFolio.days.length < tripFolioLimits.minimumDaysForShare) {
         const message = "Add one more saved day before sharing the whole trip.";

         setSharedTripCreationState({
            status: "error",
            sourceKey: sharedTripSourceKey,
            shareUrl: null,
            message,
         });

         setDayPlanAnnouncement(message);

         return;
      }

      if (tripDayStatus === "changed") {
         const message = "Update the current trip day before sharing so the link includes your latest changes.";

         setSharedTripCreationState({
            status: "error",
            sourceKey: sharedTripSourceKey,
            shareUrl: null,
            message,
         });

         setDayPlanAnnouncement(message);

         return;
      }

      if (sharedTripCreationState.status === "ready" && sharedTripCreationState.sourceKey === sharedTripSourceKey && sharedTripCreationState.shareUrl) {
         setDayPlanAnnouncement("Your shared-trip link is already ready.");

         return;
      }

      const request = createSharedTripRequestFromFolio(tripFolio);

      if (!request) {
         const message = "Sidewalk could not prepare this Trip Folio for sharing.";

         setSharedTripCreationState({
            status: "error",
            sourceKey: sharedTripSourceKey,
            shareUrl: null,
            message,
         });

         setDayPlanAnnouncement(message);

         return;
      }

      tripShareRequestControllerReference.current?.abort();

      const controller = new AbortController();

      tripShareRequestControllerReference.current = controller;

      setSharedTripCreationState({
         status: "loading",
         sourceKey: sharedTripSourceKey,
         shareUrl: null,
         message: "",
      });

      setDayPlanAnnouncement("Sidewalk is creating one read-only link for your full trip.");

      try {
         const response = await requestSharedTrip(request, controller.signal);

         if (controller.signal.aborted) {
            return;
         }

         setSharedTripCreationState({
            status: "ready",
            sourceKey: sharedTripSourceKey,
            shareUrl: response.shareUrl,
            message: "",
         });

         trackProductSignal("trip_shared", {
            dayCount: tripFolio.days.length,
            stopCount: tripFolio.days.reduce((total, day) => total + day.stops.length, 0),
         });

         setDayPlanAnnouncement("Your shared-trip link is ready.");
      } catch (error: unknown) {
         if (error instanceof Error && error.name === "AbortError") {
            return;
         }

         const message = error instanceof SharedTripRequestError ? error.message : "Sidewalk could not create a shareable trip right now.";

         setSharedTripCreationState({
            status: "error",
            sourceKey: sharedTripSourceKey,
            shareUrl: null,
            message,
         });

         setDayPlanAnnouncement(message);
      } finally {
         if (tripShareRequestControllerReference.current === controller) {
            tripShareRequestControllerReference.current = null;
         }
      }
   }

   function handleRenameTrip(title: string) {
      if (!tripFolio) {
         return;
      }

      const renamedFolio = renameTripFolio(tripFolio, title);

      if (!renamedFolio) {
         setTripFolioMessage("Give the trip a short name before saving it.");

         return;
      }

      if (!saveTripFolio(renamedFolio)) {
         setTripFolioMessage("Sidewalk could not rename this trip in this browser.");

         return;
      }

      setTripFolio(renamedFolio);

      setTripFolioMessage(`Trip renamed to ${renamedFolio.title}.`);

      setDayPlanAnnouncement(`${renamedFolio.title} is now the name of this Trip Folio.`);
   }

   function handleSaveDayToTrip() {
      if (!currentTripDay || !selectedMetro) {
         setTripFolioMessage("Choose at least two stops before adding this day to a trip.");

         return;
      }

      const hadTripFolioBeforeSave = tripFolio !== null;

      const nextFolio = tripFolio ? upsertTripFolioDay(tripFolio, currentTripDay) : createTripFolio(`${selectedMetro.name} Trip`, currentTripDay);

      if (!nextFolio) {
         setTripFolioMessage(`A trip can hold up to ${tripFolioLimits.maximumDays} days. Remove a day before adding another one.`);

         setDayPlanAnnouncement(`Your trip already has ${tripFolioLimits.maximumDays} days.`);

         return;
      }

      if (!saveTripFolio(nextFolio)) {
         setTripFolioMessage("Sidewalk could not save this trip in this browser.");

         return;
      }

      const wasAlreadySaved = savedTripDay !== null;

      setTripFolio(nextFolio);

      if (!wasAlreadySaved) {
         trackProductSignal(hadTripFolioBeforeSave ? "trip_day_added" : "trip_created", {
            metroSlug: selectedMetro.slug,
            localAreaId: currentTripDay.localAreaId,
            dayCount: nextFolio.days.length,
         });
      }

      setTripFolioMessage(wasAlreadySaved ? "This trip day is up to date." : "Day added. Use the Trip Folio when you are ready to add or edit another day.");

      setDayPlanAnnouncement(wasAlreadySaved ? `${formatPlanningDateForAnnouncement(planningDate)} is updated in ${nextFolio.title}.` : `${formatPlanningDateForAnnouncement(planningDate)} was added to ${nextFolio.title}.`);
   }

   function handleRemoveTripDay(tripPlanningDate: string) {
      if (!tripFolio) {
         return;
      }

      const removedDay = findTripFolioDay(tripFolio, tripPlanningDate);

      if (!removedDay) {
         return;
      }

      const nextFolio = removeTripFolioDay(tripFolio, tripPlanningDate);

      if (!saveTripFolio(nextFolio)) {
         setTripFolioMessage("Sidewalk could not update this trip in this browser.");

         return;
      }

      setTripFolio(nextFolio);

      if (!nextFolio) {
         tripShareRequestControllerReference.current?.abort();
         tripShareRequestControllerReference.current = null;

         setSharedTripCreationState(createInitialSharedTripCreationState());
      }

      const removedCurrentDay = tripPlanningDate === planningDate;

      setTripFolioMessage(nextFolio ? `${formatPlanningDateForAnnouncement(tripPlanningDate)} was removed from the trip.` : "The trip is empty, so Sidewalk cleared the folio.");

      setDayPlanAnnouncement(removedCurrentDay ? "This day was removed from your trip. The day itself is still open here." : `${formatPlanningDateForAnnouncement(tripPlanningDate)} was removed from the trip.`);
   }

   function formatPlanningDateForAnnouncement(value: string): string {
      const [yearText, monthText, dayText] = value.split("-");

      return new Intl.DateTimeFormat("en-US", {
         month: "long",
         day: "numeric",
         timeZone: "UTC",
      }).format(new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText))));
   }

   function createActivityDirectionsForTripDay(tripDay: TripFolioDay): ActivityDirectionsByPeriod {
      const nextDirections = createEmptyActivityDirections();

      tripDay.stops.forEach((stop) => {
         nextDirections[stop.dayPeriod] = stop.resolvedActivity;
      });

      return nextDirections;
   }

   function resolveTripDayGeography(tripDay: TripFolioDay) {
      const metroRegion = activeMetroRegions.find((candidate) => candidate.id === tripDay.metroRegionId || candidate.slug === tripDay.metroSlug) ?? null;

      if (!metroRegion) {
         return null;
      }

      const geography = resolveGeography({
         metroRegionId: metroRegion.id,
         municipalityId: tripDay.municipalityId,
         localAreaId: tripDay.localAreaId,
      });

      if (!geography || !geography.metroRegion.isActive || geography.metroRegion.coverageStatus !== "active") {
         return null;
      }

      return geography;
   }

   function resetRecommendationWorkspace(nextSessionSeed: string) {
      abortAllRequests();

      setSessionSeed(nextSessionSeed);

      saveSessionSeed(nextSessionSeed);

      setRecommendationsByPeriod(createEmptyRecommendations());

      setRecommendationStatuses(createIdleStatuses());

      setSelectedRecommendations({});

      setLoadedRequestKeys(createEmptyRequestKeys());

      setChapterRefreshStates(createInitialChapterRefreshState());

      setSimilarDayPeriods([]);

      setSharedDayCreationState(createInitialSharedDayCreationState());

      setTripFolioMessage("");
   }

   function handleEditTripDay(tripPlanningDate: string) {
      const tripDay = findTripFolioDay(tripFolio, tripPlanningDate);

      if (!tripDay) {
         setTripFolioMessage("Sidewalk could not find that saved trip day.");

         return;
      }

      const geography = resolveTripDayGeography(tripDay);

      if (!geography) {
         setTripFolioMessage("That trip day uses an area that is no longer available.");

         return;
      }

      const nextSessionSeed = generateAnonymousSessionSeed();

      resetRecommendationWorkspace(nextSessionSeed);

      setSelectedMetroSlug(geography.metroRegion.slug);

      setSelectedMunicipalityId(geography.municipality.id);

      setSelectedLocalAreaId(geography.localArea.id);

      setPlanningDate(tripDay.planningDate);

      setActivityDirectionsByPeriod(createActivityDirectionsForTripDay(tripDay));

      const restoredStops = sortDayStops(tripDay.stops);

      setDayStops(restoredStops);

      setActiveDayPeriod(restoredStops[0]?.dayPeriod ?? "early-morning");

      setIsDayTrayOpen(false);

      shouldFocusPeriodPanelReference.current = true;

      setDayPlanAnnouncement(`${formatPlanningDateForAnnouncement(tripDay.planningDate)} is open for editing. Saved stops are restored, and you can change any part of the day.`);
   }

   function handleAddTripDay() {
      if (!tripFolio) {
         return;
      }

      /**
       * The Trip Folio owns multi-day planning. If the person has finished a
       * new day (or changed a saved day), "Add another day" first commits that
       * work to the Folio before moving forward. This prevents an unsaved
       * August 10 from being cleared while the Folio still only contains
       * August 9.
       */
      let workingFolio = tripFolio;

      const currentDayNeedsSaving = tripDayStatus !== "saved";

      if (currentDayNeedsSaving) {
         if (!currentTripDay) {
            const message = "Finish this day with at least two stops before adding another trip day.";

            setTripFolioMessage(message);

            setDayPlanAnnouncement(message);

            return;
         }

         const updatedFolio = upsertTripFolioDay(workingFolio, currentTripDay);

         if (!updatedFolio) {
            const message = `This trip already has ${tripFolioLimits.maximumDays} days. Remove a day before adding another one.`;

            setTripFolioMessage(message);

            setDayPlanAnnouncement(message);

            return;
         }

         if (!saveTripFolio(updatedFolio)) {
            const message = "Sidewalk could not save this trip in this browser.";

            setTripFolioMessage(message);

            setDayPlanAnnouncement(message);

            return;
         }

         workingFolio = updatedFolio;

         setTripFolio(updatedFolio);
      }

      const nextPlanningDate = getNextTripPlanningDate(workingFolio);

      if (!nextPlanningDate) {
         setTripFolioMessage(`This trip already has ${tripFolioLimits.maximumDays} days.`);

         setDayPlanAnnouncement(`Your trip already has ${tripFolioLimits.maximumDays} days.`);

         return;
      }

      const latestTripDay = [...workingFolio.days].sort((first, second) => second.planningDate.localeCompare(first.planningDate))[0] ?? null;

      const geography = latestTripDay ? resolveTripDayGeography(latestTripDay) : null;

      const nextSessionSeed = generateAnonymousSessionSeed();

      resetRecommendationWorkspace(nextSessionSeed);

      if (geography) {
         setSelectedMetroSlug(geography.metroRegion.slug);

         setSelectedMunicipalityId(geography.municipality.id);

         setSelectedLocalAreaId(geography.localArea.id);
      }

      setPlanningDate(nextPlanningDate);

      setActivityDirectionsByPeriod(createEmptyActivityDirections());

      setDayStops([]);

      setActiveDayPeriod("early-morning");

      setIsDayTrayOpen(false);

      shouldFocusPeriodPanelReference.current = true;

      setDayPlanAnnouncement(
         currentDayNeedsSaving
            ? `${formatPlanningDateForAnnouncement(planningDate)} was saved to ${workingFolio.title}. ${formatPlanningDateForAnnouncement(nextPlanningDate)} is ready next.`
            : `${formatPlanningDateForAnnouncement(nextPlanningDate)} is ready as the next day in ${workingFolio.title}. Start with Early Morning, or change the area first.`,
      );
   }

   let selectionAnnouncement = `${selectedMetro.name} selected. Choose a municipality.`;

   if (selectedMunicipality) {
      selectionAnnouncement = `${selectedMunicipality.name} selected. Choose a neighborhood or area.`;
   }

   if (selectedLocalArea && planningDate) {
      selectionAnnouncement = `${selectedLocalArea.name} selected. Your planning date is ${planningDate}. Choose a time of day and what sounds worthwhile.`;
   }

   if (selectedLocalArea && activeActivityDirection && activeStatus === "loading") {
      selectionAnnouncement = `Sidewalk is finding ${getPeriodLabel(activeDayPeriod).toLowerCase()} options for ${selectedLocalArea.name}.`;
   }

   if (selectedLocalArea && activeSelectedRecommendation && activeStatus === "ready") {
      selectionAnnouncement = `${getPeriodLabel(activeDayPeriod)} currently shows ${activeSelectedRecommendation.place.provider.name}.`;
   }

   if (selectedLocalArea && activeStatus === "empty") {
      selectionAnnouncement = `No live ${activeDayPeriod} match was found in ${selectedLocalArea.name}.`;
   }

   if (selectedLocalArea && activeStatus === "error") {
      selectionAnnouncement = "Sidewalk could not load live places right now.";
   }

   const recommendationStepState = activeStatus === "ready" ? "ready" : selectedLocalArea && planningDate ? "active" : "waiting";

   return (
      <>
         <SiteHeader metroRegions={activeMetroRegions} selectedMetroSlug={selectedMetro.slug} recentMetroSlugs={recentMetroSlugs} onMetroChange={handleMetroChange} />

         <main id="main-content" className={mainClassName} tabIndex={-1}>
            <section className="planning-view" aria-labelledby="selected-metro-title">
               <div className={layoutClassName}>
                  <div className="planning-view__content">
                     <header className="planning-view__heading">
                        <h1 id="selected-metro-title" className="planning-view__title">
                           {selectedMetro.name}
                        </h1>

                        <p className="planning-view__region">{selectedMetroRegionLabel}</p>
                     </header>

                     <p className="sr-only" aria-live="polite" aria-atomic="true">
                        {selectionAnnouncement}
                     </p>

                     <p className="sr-only" aria-live="polite" aria-atomic="true">
                        {dayPlanAnnouncement}
                     </p>

                     <ol className="planning-sequence" aria-label={`Plan a day in ${selectedMetro.name}`}>
                        <li className="planning-step" data-state={selectedMunicipality ? "complete" : "active"}>
                           <span className="planning-step__label">Municipality</span>

                           <div className="planning-step__control">
                              <LocationSelect
                                 id="municipality-select"
                                 label={`Municipality in ${selectedMetro.name}`}
                                 value={selectedMunicipalityId}
                                 placeholder="Choose municipality"
                                 options={municipalityOptions}
                                 disabled={availableMunicipalities.length === 0}
                                 onChange={handleMunicipalityChange}
                              />
                           </div>
                        </li>

                        <li className="planning-step" data-state={selectedLocalArea ? "complete" : selectedMunicipality ? "active" : "waiting"}>
                           <span className="planning-step__label">Neighborhood or area</span>

                           <div className="planning-step__control">
                              <LocationSelect
                                 id="local-area-select"
                                 label={selectedMunicipality ? `Neighborhood or area in ${selectedMunicipality.name}` : "Neighborhood or area"}
                                 value={selectedLocalAreaId}
                                 placeholder={selectedMunicipality ? "Choose neighborhood or area" : "Choose municipality first"}
                                 options={localAreaOptions}
                                 disabled={!selectedMunicipality}
                                 onChange={handleLocalAreaChange}
                              />
                           </div>
                        </li>

                        <li className="planning-step" data-state={selectedLocalArea && planningDate ? "complete" : selectedLocalArea ? "active" : "waiting"}>
                           <span className="planning-step__label">Plan for</span>

                           <div className="planning-step__control">
                              <PlanningDateSelector value={planningDate} timezone={selectedMetro.timezone} disabled={!selectedLocalArea} onChange={handlePlanningDateChange} />
                           </div>
                        </li>

                        <li className="planning-step planning-step--recommendation" data-state={recommendationStepState}>
                           <span className="planning-step__label">Your day</span>

                           <div className="planning-step__control">
                              <div className={plannerStyles.shell}>
                                 {similarDayPeriods.length > 0 ? (
                                    <aside className={plannerStyles.sharedShape} aria-labelledby="sidewalk-shared-shape-title">
                                       <div>
                                          <p className={plannerStyles.sharedShapeEyebrow}>Based on a shared day</p>

                                          <h2 id="sidewalk-shared-shape-title" className={plannerStyles.sharedShapeTitle}>
                                             Keep the rhythm. Choose your own places.
                                          </h2>
                                       </div>

                                       <p className={plannerStyles.sharedShapePeriods}>{similarDayPeriodLabels}</p>

                                       <p className={plannerStyles.sharedShapeDescription}>These time periods come first. Every recommendation is fresh, and the original stops were not copied.</p>
                                    </aside>
                                 ) : null}

                                 <p className={plannerStyles.progress} aria-live="polite">
                                    {planProgressCopy}
                                 </p>

                                 <PeriodSwitcher activePeriod={activeDayPeriod} completedPeriods={completedPeriods} disabled={!selectedLocalArea || !planningDate} onChange={handlePeriodChange} />

                                 <section
                                    ref={periodPanelReference}
                                    id="sidewalk-period-panel"
                                    className={plannerStyles.chapter}
                                    role="tabpanel"
                                    aria-labelledby={`sidewalk-period-tab-${activeDayPeriod}`}
                                    aria-describedby="sidewalk-period-description"
                                    aria-busy={activeStatus === "loading" || activeChapterRefreshState.isRefreshing}
                                    tabIndex={0}
                                 >
                                    <header className={plannerStyles.chapterHeading}>
                                       <p className={plannerStyles.chapterEyebrow}>{getPeriodLabel(activeDayPeriod)}</p>

                                       <h2 className={plannerStyles.chapterTitle}>What sounds worthwhile?</h2>

                                       <p id="sidewalk-period-description" className={plannerStyles.chapterDescription}>
                                          {getPeriodRangeLabel(activeDayPeriod)}
                                       </p>
                                    </header>

                                    <ActivityDirectionSelector value={activeActivityDirection} disabled={!selectedLocalArea || !planningDate} onChange={handleActivityDirectionChange} />

                                    <div className={plannerStyles.recommendationLayout}>
                                       <PeriodRecommendationList
                                          dayPeriod={activeDayPeriod}
                                          recommendations={activeRecommendations}
                                          selectedPlaceId={activeSelectedRecommendation?.place.id ?? null}
                                          addedPlaceId={activeAddedPlaceId}
                                          status={activeStatus}
                                          refreshCount={activeChapterRefreshState.refreshCount}
                                          isRefreshing={activeChapterRefreshState.isRefreshing}
                                          canRefresh={activeChapterRefreshState.canRefresh}
                                          refreshMessage={activeChapterRefreshState.message}
                                          onSelect={(recommendation) => handleRecommendationSelect(activeDayPeriod, recommendation)}
                                          onRefresh={handleRefreshChapter}
                                       />

                                       {activeStatus === "ready" && activeSelectedRecommendation && selectedLocalArea ? (
                                          <PeriodPickDetail
                                             dayPeriod={activeDayPeriod}
                                             recommendation={activeSelectedRecommendation}
                                             areaName={selectedLocalArea.name}
                                             hasPeriodStop={activeDayStop !== null}
                                             isCurrentPeriodStop={isCurrentPeriodStop}
                                             nextPeriodLabel={nextUnfilledPeriodLabel}
                                             onAddToDay={(recommendation) => handleAddPeriodStop(activeDayPeriod, recommendation)}
                                             onContinue={() => handleContinueFromPeriod(activeDayPeriod)}
                                             onFeedback={(reason) => handleRecommendationFeedback(activeDayPeriod, activeSelectedRecommendation, reason)}
                                          />
                                       ) : null}
                                    </div>
                                 </section>
                              </div>
                           </div>
                        </li>
                     </ol>
                  </div>

                  <DayTray
                     planningDate={planningDate}
                     stops={dayStops}
                     isOpen={isDayTrayOpen}
                     shareStatus={sharedDayCreationState.status}
                     shareUrl={sharedDayCreationState.shareUrl}
                     shareMessage={sharedDayCreationState.message}
                     tripTitle={tripFolio?.title ?? null}
                     tripDays={tripFolio?.days ?? []}
                     tripDayStatus={tripDayStatus}
                     tripMessage={tripFolioMessage}
                     tripShareStatus={sharedTripCreationState.status}
                     tripShareUrl={sharedTripCreationState.shareUrl}
                     tripShareMessage={sharedTripCreationState.message}
                     onToggle={() => setIsDayTrayOpen((currentState) => !currentState)}
                     onDone={handleDoneEditingDay}
                     onRemove={handleRemoveStop}
                     onClearDay={handleClearDay}
                     onEditPeriod={handleEditPeriod}
                     onContinuePlanning={handleContinuePlanning}
                     onCreateShare={() => void handleCreateSharedDay()}
                     onSaveToTrip={handleSaveDayToTrip}
                     onEditTripDay={handleEditTripDay}
                     onRemoveTripDay={handleRemoveTripDay}
                     onAddTripDay={handleAddTripDay}
                     onCreateTripShare={() => void handleCreateSharedTrip()}
                     onRenameTrip={handleRenameTrip}
                  />
               </div>
            </section>
         </main>

         <SiteFooter hasDayTray={hasPersistentTray} />
      </>
   );
}
