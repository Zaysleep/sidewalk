"use client";

import type { DayPeriod } from "@/types/day-period";
import { maxPeriodRecommendationRefreshes, type PeriodRecommendation, type PeriodRecommendationStatus } from "@/types/period-recommendation";

import styles from "./period-recommendation-list.module.css";

type PeriodRecommendationListProps = Readonly<{
   dayPeriod: DayPeriod;

   recommendations: readonly PeriodRecommendation[];

   selectedPlaceId: string | null;
   addedPlaceId: string | null;

   status: PeriodRecommendationStatus;

   refreshCount: number;
   isRefreshing: boolean;
   canRefresh: boolean;
   refreshMessage: string;

   onSelect: (recommendation: PeriodRecommendation) => void;

   onRefresh: () => void;
}>;

function getStatusMessage(status: PeriodRecommendationStatus): Readonly<{
   title: string;
   body: string;
}> | null {
   switch (status) {
      case "idle":
         return {
            title: "Choose what sounds worthwhile.",
            body: "Sidewalk will prepare three options for this part of the day.",
         };

      case "loading":
         return {
            title: "Finding nearby options…",
            body: "Sidewalk is looking for three worthwhile choices nearby.",
         };

      case "empty":
         return {
            title: "No strong match yet.",
            body: "Try another activity direction or neighborhood.",
         };

      case "error":
         return {
            title: "Places could not load.",
            body: "Try the activity direction again in a moment.",
         };

      case "ready":
         return null;
   }
}

export function PeriodRecommendationList({ dayPeriod, recommendations, selectedPlaceId, addedPlaceId, status, refreshCount, isRefreshing, canRefresh, refreshMessage, onSelect, onRefresh }: PeriodRecommendationListProps) {
   const statusMessage = getStatusMessage(status);

   if (statusMessage) {
      return (
         <div className={styles.status} aria-live="polite">
            <p className={styles.statusTitle}>{statusMessage.title}</p>

            <p className={styles.statusBody}>{statusMessage.body}</p>
         </div>
      );
   }

   const isAtRefreshLimit = refreshCount >= maxPeriodRecommendationRefreshes;

   const hasCompleteSet = recommendations.length >= 3;

   const isRefreshUnavailable = !canRefresh || !hasCompleteSet;

   const refreshButtonLabel = isRefreshing ? "Finding another set…" : isAtRefreshLimit || isRefreshUnavailable ? "These are the strongest nearby options." : "Show another set";

   function handleRefresh() {
      if (isRefreshing || isAtRefreshLimit || isRefreshUnavailable) {
         return;
      }

      onRefresh();
   }

   return (
      <div className={styles.wrapper}>
         <fieldset className={styles.fieldset}>
            <legend className="sr-only">Choose one {dayPeriod} recommendation</legend>

            <div className={styles.list}>
               {recommendations.map((recommendation) => {
                  const isSelected = recommendation.place.id === selectedPlaceId;

                  const isAdded = recommendation.place.id === addedPlaceId;

                  return (
                     <label key={recommendation.place.id} className={styles.option} data-selected={isSelected}>
                        <input type="radio" className="sr-only" name={`sidewalk-${dayPeriod}-recommendation`} value={recommendation.place.id} checked={isSelected} onChange={() => onSelect(recommendation)} />

                        <span className={styles.selectionMark} aria-hidden="true" />

                        <span className={styles.copy}>
                           <span className={styles.placeName}>{recommendation.place.provider.name}</span>

                           <span className={styles.reason}>{recommendation.reason}</span>
                        </span>

                        {isAdded ? <span className={styles.added}>In your day</span> : null}
                     </label>
                  );
               })}
            </div>
         </fieldset>

         {hasCompleteSet ? (
            <div className={styles.refreshPanel} aria-live="polite" aria-atomic="true">
               <button type="button" className={styles.refreshButton} disabled={isRefreshing} aria-disabled={isAtRefreshLimit || isRefreshUnavailable} data-inactive={isAtRefreshLimit || isRefreshUnavailable} onClick={handleRefresh}>
                  {refreshButtonLabel}
               </button>

               <p className={styles.refreshStatus}>{isRefreshing ? "Sidewalk is looking for three more worthwhile options nearby." : refreshMessage}</p>
            </div>
         ) : null}
      </div>
   );
}
