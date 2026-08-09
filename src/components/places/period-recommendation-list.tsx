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
            title: "What sounds worthwhile?",
            body: "Pick a direction and Sidewalk will bring back three places worth a look.",
         };

      case "loading":
         return {
            title: "Looking around…",
            body: "Sidewalk is checking what is worth your time nearby.",
         };

      case "empty":
         return {
            title: "Nothing worth forcing.",
            body: "Try another direction or change neighborhoods.",
         };

      case "error":
         return {
            title: "That search came up short.",
            body: "Give Sidewalk another try in a moment.",
         };

      case "ready":
         return null;
   }
}

export function PeriodRecommendationList({ dayPeriod, recommendations, selectedPlaceId, addedPlaceId, status, refreshCount, isRefreshing, canRefresh, refreshMessage, onSelect, onRefresh }: PeriodRecommendationListProps) {
   const statusMessage = getStatusMessage(status);

   if (statusMessage) {
      return (
         <div className={styles.status} role="status" aria-live="polite" aria-atomic="true">
            <p className={styles.statusTitle}>{statusMessage.title}</p>

            <p className={styles.statusBody}>{statusMessage.body}</p>
         </div>
      );
   }

   const isAtRefreshLimit = refreshCount >= maxPeriodRecommendationRefreshes;

   const hasCompleteSet = recommendations.length >= 3;

   const isRefreshUnavailable = !canRefresh || !hasCompleteSet;

   const refreshButtonLabel = isRefreshing ? "Looking for another set…" : isAtRefreshLimit || isRefreshUnavailable ? "That’s the nearby shortlist." : "Show me something else";

   function handleRefresh() {
      if (isRefreshing || isAtRefreshLimit || isRefreshUnavailable) {
         return;
      }

      onRefresh();
   }

   return (
      <div className={styles.wrapper} aria-busy={isRefreshing}>
         <fieldset className={styles.fieldset}>
            <legend className="sr-only">Choose one {dayPeriod} recommendation</legend>

            <div className={styles.list} role="radiogroup" aria-label={`${dayPeriod} recommendations`}>
               {recommendations.map((recommendation) => {
                  const isSelected = recommendation.place.id === selectedPlaceId;

                  const isAdded = recommendation.place.id === addedPlaceId;

                  const descriptionId = `sidewalk-${dayPeriod}-${recommendation.place.slug}-description`;

                  const addedId = `sidewalk-${dayPeriod}-${recommendation.place.slug}-added`;

                  const describedBy = isAdded ? `${descriptionId} ${addedId}` : descriptionId;

                  return (
                     <label key={recommendation.place.id} className={styles.option} data-selected={isSelected}>
                        <input type="radio" className="sr-only" name={`sidewalk-${dayPeriod}-recommendation`} value={recommendation.place.id} checked={isSelected} aria-describedby={describedBy} onChange={() => onSelect(recommendation)} />

                        <span className={styles.selectionMark} aria-hidden="true" />

                        <span className={styles.copy}>
                           <span className={styles.placeName}>{recommendation.place.provider.name}</span>

                           <span id={descriptionId} className={styles.reason}>
                              {recommendation.place.editorial.summary}
                           </span>
                        </span>

                        {isAdded ? (
                           <span id={addedId} className={styles.added}>
                              In your day
                           </span>
                        ) : null}
                     </label>
                  );
               })}
            </div>
         </fieldset>

         {hasCompleteSet ? (
            <div className={styles.refreshPanel}>
               <button
                  type="button"
                  className={styles.refreshButton}
                  disabled={isRefreshing}
                  aria-disabled={isAtRefreshLimit || isRefreshUnavailable}
                  aria-describedby={`sidewalk-${dayPeriod}-refresh-status`}
                  aria-label={`${refreshButtonLabel} for ${dayPeriod}`}
                  data-inactive={isAtRefreshLimit || isRefreshUnavailable}
                  onClick={handleRefresh}
               >
                  {refreshButtonLabel}
               </button>

               <p id={`sidewalk-${dayPeriod}-refresh-status`} className={styles.refreshStatus} role="status" aria-live="polite" aria-atomic="true">
                  {isRefreshing ? "Sidewalk is looking for three more places worth a look." : refreshMessage}
               </p>
            </div>
         ) : null}
      </div>
   );
}
