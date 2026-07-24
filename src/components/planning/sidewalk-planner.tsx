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
import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { getLocalAreasForMunicipality } from "@/lib/geography/get-local-areas-for-municipality";
import { getMunicipalitiesForMetro } from "@/lib/geography/get-municipalities-for-metro";
import { fetchPeriodRecommendations } from "@/lib/places/period-recommendation-client";
import { activityDirections, activityKinds, type ActivityDirection, type ActivityKind } from "@/types/activity";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import { maxPeriodRecommendationRefreshes, type CommittedStopContext, type PeriodRecommendation, type PeriodRecommendationStatus } from "@/types/period-recommendation";

import plannerStyles from "./period-planner.module.css";

type RecommendationsByPeriod = Record<DayPeriod, readonly PeriodRecommendation[]>;

type RecommendationStatuses = Record<DayPeriod, PeriodRecommendationStatus>;

type SelectedRecommendations = Partial<Record<DayPeriod, PeriodRecommendation>>;

type ActivityDirectionsByPeriod = Record<DayPeriod, ActivityDirection | null>;

type RequestKeysByPeriod = Record<DayPeriod, string | null>;

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
   version: 4;

   selectedMetroSlug: string;
   selectedMunicipalityId: string;
   selectedLocalAreaId: string;

   planningDate: string;

   activityDirectionsByPeriod: ActivityDirectionsByPeriod;

   activeDayPeriod: DayPeriod;

   sessionSeed: string;

   dayStops: readonly DayStop[];

   chapterRefreshStates: StoredChapterRefreshStates;
}>;

const activeMetroRegions = metroRegions
   .filter((metroRegion) => metroRegion.isActive && metroRegion.coverageStatus === "active")
   .slice()
   .sort((firstMetro, secondMetro) => firstMetro.name.localeCompare(secondMetro.name));

const defaultMetroSlug = "san-diego";

const planningSessionStorageKey = "sidewalk-active-planning-session-v4";

const previousPlanningSessionStorageKeys = ["sidewalk-active-planning-session-v3", "sidewalk-active-planning-session-v2", "sidewalk-active-planning-session-v1"] as const;

const sessionSeedStorageKey = "sidewalk-planning-session-seed";

function createEmptyRecommendations(): RecommendationsByPeriod {
   return {
      morning: [],
      afternoon: [],
      evening: [],
   };
}

function createIdleStatuses(): RecommendationStatuses {
   return {
      morning: "idle",
      afternoon: "idle",
      evening: "idle",
   };
}

function createEmptyActivityDirections(): ActivityDirectionsByPeriod {
   return {
      morning: null,
      afternoon: null,
      evening: null,
   };
}

function createEmptyRequestKeys(): RequestKeysByPeriod {
   return {
      morning: null,
      afternoon: null,
      evening: null,
   };
}

function createInitialChapterRefreshState(): ChapterRefreshStates {
   const createPeriodState = (): ChapterRefreshState => ({
      refreshCount: 0,
      shownPlaceIds: [],
      isRefreshing: false,
      canRefresh: true,
      message: "",
   });

   return {
      morning: createPeriodState(),
      afternoon: createPeriodState(),
      evening: createPeriodState(),
   };
}

function getLocalIsoDate(date: Date): string {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
}

function getTodayPlanningDate(): string {
   return getLocalIsoDate(new Date());
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
   return {
      morning: {
         refreshCount: states.morning.refreshCount,
         shownPlaceIds: states.morning.shownPlaceIds,
         canRefresh: states.morning.canRefresh,
         message: states.morning.message,
      },
      afternoon: {
         refreshCount: states.afternoon.refreshCount,
         shownPlaceIds: states.afternoon.shownPlaceIds,
         canRefresh: states.afternoon.canRefresh,
         message: states.afternoon.message,
      },
      evening: {
         refreshCount: states.evening.refreshCount,
         shownPlaceIds: states.evening.shownPlaceIds,
         canRefresh: states.evening.canRefresh,
         message: states.evening.message,
      },
   };
}

function fromStoredChapterRefreshStates(states: StoredChapterRefreshStates): ChapterRefreshStates {
   return {
      morning: {
         ...states.morning,
         isRefreshing: false,
      },
      afternoon: {
         ...states.afternoon,
         isRefreshing: false,
      },
      evening: {
         ...states.evening,
         isRefreshing: false,
      },
   };
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

function getNextUnfilledPeriod(currentPeriod: DayPeriod, stops: readonly DayStop[]): DayPeriod | null {
   const currentIndex = dayPeriods.indexOf(currentPeriod);

   for (let offset = 1; offset <= dayPeriods.length; offset += 1) {
      const candidate = dayPeriods[(currentIndex + offset) % dayPeriods.length];

      const isFilled = stops.some((stop) => stop.dayPeriod === candidate);

      if (!isFilled) {
         return candidate;
      }
   }

   return null;
}

function getFirstUnfilledPeriod(stops: readonly DayStop[]): DayPeriod | null {
   return dayPeriods.find((period) => !stops.some((stop) => stop.dayPeriod === period)) ?? null;
}

function getPlanProgressCopy(stopCount: number): string {
   if (stopCount === 0) {
      return "Choose two or three stops";
   }

   if (stopCount === 1) {
      return "1 stop chosen · choose one more to complete the day";
   }

   if (stopCount === 2) {
      return "2 stops chosen · day saved";
   }

   return "3 stops chosen · day saved";
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
      typeof duration.minimum === "number" &&
      typeof duration.maximum === "number"
   );
}

function isStoredPlanningSession(value: unknown): value is StoredPlanningSession {
   if (!isRecord(value)) {
      return false;
   }

   return (
      value.version === 4 &&
      typeof value.selectedMetroSlug === "string" &&
      typeof value.selectedMunicipalityId === "string" &&
      typeof value.selectedLocalAreaId === "string" &&
      isPlanningDate(value.planningDate) &&
      isStoredActivityDirections(value.activityDirectionsByPeriod) &&
      isDayPeriod(value.activeDayPeriod) &&
      typeof value.sessionSeed === "string" &&
      value.sessionSeed.length > 0 &&
      Array.isArray(value.dayStops) &&
      value.dayStops.length <= 3 &&
      value.dayStops.every(isStoredDayStop) &&
      isStoredChapterRefreshStates(value.chapterRefreshStates)
   );
}

function readStoredPlanningSession(): StoredPlanningSession | null {
   try {
      const rawSession = window.sessionStorage.getItem(planningSessionStorageKey);

      if (!rawSession) {
         return null;
      }

      const parsedSession: unknown = JSON.parse(rawSession);

      if (!isStoredPlanningSession(parsedSession)) {
         window.sessionStorage.removeItem(planningSessionStorageKey);

         return null;
      }

      return parsedSession;
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

   const [activeDayPeriod, setActiveDayPeriod] = useState<DayPeriod>("morning");

   const [sessionSeed, setSessionSeed] = useState("");

   const [isSessionReady, setIsSessionReady] = useState(false);

   const [recommendationsByPeriod, setRecommendationsByPeriod] = useState<RecommendationsByPeriod>(createEmptyRecommendations);

   const [recommendationStatuses, setRecommendationStatuses] = useState<RecommendationStatuses>(createIdleStatuses);

   const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendations>({});

   const [loadedRequestKeys, setLoadedRequestKeys] = useState<RequestKeysByPeriod>(createEmptyRequestKeys);

   const [chapterRefreshStates, setChapterRefreshStates] = useState<ChapterRefreshStates>(createInitialChapterRefreshState);

   const requestControllersReference = useRef<Partial<Record<DayPeriod, AbortController>>>({});

   const [dayStops, setDayStops] = useState<DayStop[]>([]);

   const [isDayTrayOpen, setIsDayTrayOpen] = useState(false);

   const [dayPlanAnnouncement, setDayPlanAnnouncement] = useState("");

   const selectedMetro = activeMetroRegions.find((metroRegion) => metroRegion.slug === selectedMetroSlug) ?? activeMetroRegions[0];

   const availableMunicipalities = selectedMetro ? getMunicipalitiesForMetro(selectedMetro.id) : [];

   const availableLocalAreas = selectedMunicipalityId ? getLocalAreasForMunicipality(selectedMunicipalityId) : [];

   const selectedMunicipality = availableMunicipalities.find((municipality) => municipality.id === selectedMunicipalityId) ?? null;

   const selectedLocalArea = availableLocalAreas.find((localArea) => localArea.id === selectedLocalAreaId) ?? null;

   const activeActivityDirection = activityDirectionsByPeriod[activeDayPeriod];

   const activeChapterRefreshState = chapterRefreshStates[activeDayPeriod];

   useEffect(() => {
      try {
         previousPlanningSessionStorageKeys.forEach((storageKey) => {
            window.sessionStorage.removeItem(storageKey);
         });
      } catch {
         // Ignore unavailable browser storage.
      }

      const today = getTodayPlanningDate();
      const storedSession = readStoredPlanningSession();

      if (storedSession) {
         const metroStillExists = activeMetroRegions.some((metroRegion) => metroRegion.slug === storedSession.selectedMetroSlug);

         if (metroStillExists) {
            const planningDateIsCurrent = storedSession.planningDate >= today;

            const restoredStops = planningDateIsCurrent ? sortDayStops(storedSession.dayStops) : [];

            setSelectedMetroSlug(storedSession.selectedMetroSlug);

            setSelectedMunicipalityId(storedSession.selectedMunicipalityId);

            setSelectedLocalAreaId(storedSession.selectedLocalAreaId);

            setPlanningDate(planningDateIsCurrent ? storedSession.planningDate : today);

            setActivityDirectionsByPeriod(storedSession.activityDirectionsByPeriod);

            setActiveDayPeriod(planningDateIsCurrent ? storedSession.activeDayPeriod : "morning");

            setSessionSeed(storedSession.sessionSeed);

            setDayStops(restoredStops);

            setChapterRefreshStates(planningDateIsCurrent ? fromStoredChapterRefreshStates(storedSession.chapterRefreshStates) : createInitialChapterRefreshState());

            setIsDayTrayOpen(restoredStops.length >= 2);

            saveSessionSeed(storedSession.sessionSeed);

            setIsSessionReady(true);

            return;
         }
      }

      setPlanningDate(today);
      setSessionSeed(getOrCreateSessionSeed());
      setIsSessionReady(true);
   }, []);

   useEffect(() => {
      return () => {
         Object.values(requestControllersReference.current).forEach((controller) => {
            controller?.abort();
         });
      };
   }, []);

   useEffect(() => {
      if (!isSessionReady || !sessionSeed) {
         return;
      }

      saveStoredPlanningSession({
         version: 4,

         selectedMetroSlug,
         selectedMunicipalityId,
         selectedLocalAreaId,

         planningDate,

         activityDirectionsByPeriod,

         activeDayPeriod,

         sessionSeed,

         dayStops,

         chapterRefreshStates: toStoredChapterRefreshStates(chapterRefreshStates),
      });
   }, [activeDayPeriod, activityDirectionsByPeriod, chapterRefreshStates, dayStops, isSessionReady, planningDate, selectedLocalAreaId, selectedMetroSlug, selectedMunicipalityId, sessionSeed]);

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

      const excludedPlaceIds = new Set<string>();

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

   const completedPeriods = dayStops.map((stop) => stop.dayPeriod);

   const chosenChapterCount = dayStops.length;

   const planProgressCopy = getPlanProgressCopy(chosenChapterCount);

   const layoutClassName = dayStops.length > 0 ? "editorial-container planning-view__layout planning-view__layout--with-tray" : "editorial-container planning-view__layout";

   const mainClassName = dayStops.length > 0 ? "home-main home-main--with-day-tray" : "home-main";

   function abortAllRequests() {
      Object.values(requestControllersReference.current).forEach((controller) => {
         controller?.abort();
      });

      requestControllersReference.current = {};
   }

   function clearAllGeneratedPlanning(clearActivities: boolean) {
      abortAllRequests();

      setActiveDayPeriod("morning");

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
      };
   }

   function handleMetroChange(nextMetroSlug: string) {
      const hadDayStops = dayStops.length > 0;

      setSelectedMetroSlug(nextMetroSlug);

      setSelectedMunicipalityId("");

      setSelectedLocalAreaId("");

      clearAllGeneratedPlanning(true);

      if (hadDayStops) {
         setDayPlanAnnouncement("Your day was cleared because the metro region changed.");
      }
   }

   function handleMunicipalityChange(nextMunicipalityId: string) {
      const hadDayStops = dayStops.length > 0;

      setSelectedMunicipalityId(nextMunicipalityId);

      setSelectedLocalAreaId("");

      clearAllGeneratedPlanning(true);

      if (hadDayStops) {
         setDayPlanAnnouncement("Your day was cleared because the municipality changed.");
      }
   }

   function handleLocalAreaChange(nextLocalAreaId: string) {
      const hadDayStops = dayStops.length > 0;

      setSelectedLocalAreaId(nextLocalAreaId);

      clearAllGeneratedPlanning(true);

      if (hadDayStops) {
         setDayPlanAnnouncement("Your day was cleared because the neighborhood changed.");
      }
   }

   function handlePlanningDateChange(nextPlanningDate: string) {
      if (nextPlanningDate === planningDate || !isPlanningDate(nextPlanningDate)) {
         return;
      }

      const hadDayStops = dayStops.length > 0;

      setPlanningDate(nextPlanningDate);

      clearAllGeneratedPlanning(false);

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

      const excludedPlaceIds = new Set<string>(currentRefreshState.shownPlaceIds);

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

      if (existingPeriodStop) {
         setDayPlanAnnouncement(`${nextStop.placeName} replaced ${existingPeriodStop.placeName} for ${getPeriodLabel(period)}. Your day remains saved.`);

         return;
      }

      if (nextStops.length === 1) {
         const nextUnfilledPeriod = getNextUnfilledPeriod(period, nextStops);

         if (nextUnfilledPeriod) {
            setActiveDayPeriod(nextUnfilledPeriod);
         }

         setIsDayTrayOpen(false);

         setDayPlanAnnouncement(`${nextStop.placeName} was added to ${getPeriodLabel(period)}. Choose one more stop to complete the day.`);

         return;
      }

      if (nextStops.length === 2) {
         setIsDayTrayOpen(true);

         setDayPlanAnnouncement(`${nextStop.placeName} completed your Sidewalk day with two stops. The day is saved, and a third stop is optional.`);

         return;
      }

      setIsDayTrayOpen(true);

      setDayPlanAnnouncement(`${nextStop.placeName} completed your three-stop Sidewalk day.`);
   }

   function handleEditPeriod(period: DayPeriod) {
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

      setActiveDayPeriod(removedStop.dayPeriod);

      setIsDayTrayOpen(false);

      setDayPlanAnnouncement(
         nextStops.length >= 2
            ? `${removedStop.placeName} was removed from ${getPeriodLabel(removedStop.dayPeriod)}. Your two-stop day is still saved.`
            : `${removedStop.placeName} was removed from ${getPeriodLabel(removedStop.dayPeriod)}. Choose one more stop to complete the day.`,
      );
   }

   function handleContinuePlanning() {
      const unfilledPeriod = getFirstUnfilledPeriod(dayStops);

      if (!unfilledPeriod) {
         return;
      }

      setActiveDayPeriod(unfilledPeriod);
      setIsDayTrayOpen(false);

      setDayPlanAnnouncement(`${getPeriodLabel(unfilledPeriod)} is open if you would like to add one more stop.`);
   }

   function handlePlanAnotherDay() {
      const nextSessionSeed = generateAnonymousSessionSeed();

      saveSessionSeed(nextSessionSeed);

      setSessionSeed(nextSessionSeed);

      abortAllRequests();

      setActiveDayPeriod("morning");

      setRecommendationsByPeriod(createEmptyRecommendations());

      setRecommendationStatuses(createIdleStatuses());

      setSelectedRecommendations({});

      setLoadedRequestKeys(createEmptyRequestKeys());

      setChapterRefreshStates(createInitialChapterRefreshState());

      setDayStops([]);

      setIsDayTrayOpen(false);

      setDayPlanAnnouncement("Sidewalk is preparing a new set of recommendations for the same area.");
   }

   let selectionAnnouncement = `${selectedMetro.name} selected. Choose a municipality.`;

   if (selectedMunicipality) {
      selectionAnnouncement = `${selectedMunicipality.name} selected. Choose a neighborhood or area.`;
   }

   if (selectedLocalArea && planningDate) {
      selectionAnnouncement = `${selectedLocalArea.name} selected. Your planning date is ${planningDate}. Choose a time of day and what sounds worthwhile.`;
   }

   if (selectedLocalArea && activeActivityDirection && activeStatus === "loading") {
      selectionAnnouncement = `Sidewalk is finding ${activeDayPeriod} options for ${selectedLocalArea.name}.`;
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
         <SiteHeader metroRegions={activeMetroRegions} selectedMetroSlug={selectedMetro.slug} onMetroChange={handleMetroChange} />

         <main id="main-content" className={mainClassName} tabIndex={-1}>
            <section className="planning-view" aria-labelledby="selected-metro-title">
               <div className={layoutClassName}>
                  <div className="planning-view__content">
                     <header className="planning-view__heading">
                        <h1 id="selected-metro-title" className="planning-view__title">
                           {selectedMetro.name}
                        </h1>

                        <p className="planning-view__region">{selectedMetro.stateOrRegion}</p>
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
                              <PlanningDateSelector value={planningDate} disabled={!selectedLocalArea} onChange={handlePlanningDateChange} />
                           </div>
                        </li>

                        <li className="planning-step planning-step--recommendation" data-state={recommendationStepState}>
                           <span className="planning-step__label">Your day</span>

                           <div className="planning-step__control">
                              <div className={plannerStyles.shell}>
                                 <p className={plannerStyles.progress} aria-live="polite">
                                    {planProgressCopy}
                                 </p>

                                 <PeriodSwitcher activePeriod={activeDayPeriod} completedPeriods={completedPeriods} disabled={!selectedLocalArea || !planningDate} onChange={handlePeriodChange} />

                                 <section id="sidewalk-period-panel" className={plannerStyles.chapter} role="tabpanel" aria-labelledby={`sidewalk-period-tab-${activeDayPeriod}`} tabIndex={0}>
                                    <header className={plannerStyles.chapterHeading}>
                                       <p className={plannerStyles.chapterEyebrow}>{getPeriodLabel(activeDayPeriod)}</p>

                                       <h2 className={plannerStyles.chapterTitle}>What sounds worthwhile?</h2>

                                       <p className={plannerStyles.chapterDescription}>Morning, afternoon, and evening can each go in a different direction.</p>
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
                                             onAddToDay={(recommendation) => handleAddPeriodStop(activeDayPeriod, recommendation)}
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
                     onToggle={() => setIsDayTrayOpen((currentState) => !currentState)}
                     onRemove={handleRemoveStop}
                     onEditPeriod={handleEditPeriod}
                     onContinuePlanning={handleContinuePlanning}
                     onPlanAnotherDay={handlePlanAnotherDay}
                  />
               </div>
            </section>
         </main>

         <SiteFooter hasDayTray={dayStops.length > 0} />
      </>
   );
}
