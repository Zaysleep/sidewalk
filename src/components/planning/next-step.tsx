"use client";

import type { DayContinuationChoice } from "@/types/follow-up";
import type { Place, PlaceCategory } from "@/types/place";

import styles from "./next-step.module.css";

const categoryLabels: Readonly<Record<PlaceCategory, string>> = {
   coffee: "Coffee",
   food: "Food",
   shopping: "Shopping",
   culture: "Culture",
   "parks-outdoors": "Parks and outdoors",
};

type NextStepProps = Readonly<{
   choice: DayContinuationChoice | null;
   followUpPlace: Place | null;
   areaName: string | null;
   isAdded: boolean;

   onChoose: (choice: DayContinuationChoice) => void;
   onAdd: (place: Place) => void;
}>;

function formatDuration(minimumMinutes: number, maximumMinutes: number): string {
   if (minimumMinutes === maximumMinutes) {
      return `${minimumMinutes} minutes`;
   }

   return `${minimumMinutes}–${maximumMinutes} minutes`;
}

/**
 * NextStep keeps the continuation decision small:
 *
 * - Continue and receive one curated follow-up.
 * - Finish with the worthwhile stop already selected.
 *
 * More granular category choices can be added after the supporting dataset is
 * broad enough to produce genuinely different results.
 */
export function NextStep({ choice, followUpPlace, areaName, isAdded, onChoose, onAdd }: NextStepProps) {
   if (isAdded && followUpPlace) {
      return (
         <div className={styles.complete}>
            <p className={styles.completeTitle}>Two good stops.</p>
            <p className={styles.completeBody}>Your day is ready to review.</p>
         </div>
      );
   }

   return (
      <div className={styles.root}>
         <div className={styles.choices} role="group" aria-label="Choose what comes next">
            <button type="button" className={styles.choice} aria-pressed={choice === "continue"} onClick={() => onChoose("continue")}>
               Keep exploring
            </button>

            <button type="button" className={styles.choice} aria-pressed={choice === "finish"} onClick={() => onChoose("finish")}>
               Finish here
            </button>
         </div>

         {choice === "finish" ? (
            <div className={styles.finished}>
               <p className={styles.finishedTitle}>Your day is ready.</p>
               <p className={styles.finishedBody}>One worthwhile stop is enough.</p>
            </div>
         ) : null}

         {choice === "continue" && !followUpPlace ? (
            <div className={styles.empty}>
               <p className={styles.emptyTitle}>No next pick yet.</p>
               <p className={styles.emptyBody}>This stop can still stand on its own.</p>
            </div>
         ) : null}

         {choice === "continue" && followUpPlace ? (
            <article className={styles.card} aria-labelledby={`follow-up-${followUpPlace.id}`}>
               <div className={styles.heading}>
                  <p className={styles.eyebrow}>Next stop</p>

                  <h2 id={`follow-up-${followUpPlace.id}`} className={styles.name}>
                     {followUpPlace.provider.name}
                  </h2>

                  <p className={styles.summary}>{followUpPlace.editorial.summary}</p>
               </div>

               <p className={styles.reason}>{followUpPlace.editorial.reasonToVisit}</p>

               <ul className={styles.meta} aria-label="Next stop details">
                  {areaName ? <li>{areaName}</li> : null}
                  <li>{categoryLabels[followUpPlace.editorial.category]}</li>
                  <li>{formatDuration(followUpPlace.editorial.visitDurationMinutes.minimum, followUpPlace.editorial.visitDurationMinutes.maximum)}</li>
               </ul>

               <button type="button" className={styles.action} onClick={() => onAdd(followUpPlace)}>
                  Add second stop
               </button>
            </article>
         ) : null}
      </div>
   );
}
