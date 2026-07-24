"use client";

import type { Place, PlaceCategory } from "@/types/place";

import styles from "./sidewalk-pick.module.css";

const categoryLabels: Readonly<Record<PlaceCategory, string>> = {
   coffee: "Coffee",
   food: "Food",
   shopping: "Shopping",
   culture: "Culture",
   "parks-outdoors": "Parks and outdoors",
};

export type SidewalkPickStatus = "idle" | "loading" | "ready" | "empty" | "error";

type SidewalkPickProps = Readonly<{
   place: Place | null;
   areaName: string | null;

   status: SidewalkPickStatus;

   emptyTitle?: string;
   emptyBody?: string;

   hasDayStop: boolean;
   isCurrentDayStop: boolean;

   onAddToDay: (place: Place) => void;
}>;

function formatVisitDuration(minimum: number, maximum: number): string {
   if (minimum === maximum) {
      return `${minimum} minutes`;
   }

   return `${minimum}–${maximum} minutes`;
}

export function SidewalkPick({
   place,
   areaName,
   status,

   emptyTitle = "No approved match yet.",
   emptyBody = "Choose another direction or area.",

   hasDayStop,
   isCurrentDayStop,
   onAddToDay,
}: SidewalkPickProps) {
   if (status === "idle" || !areaName) {
      return <p className={styles.waiting}>—</p>;
   }

   if (status === "loading") {
      return (
         <div className={styles.empty}>
            <p className={styles.emptyTitle}>Looking nearby…</p>

            <p className={styles.emptyBody}>Sidewalk is finding one worthwhile place.</p>
         </div>
      );
   }

   if (status === "error") {
      return (
         <div className={styles.empty}>
            <p className={styles.emptyTitle}>Places could not load.</p>

            <p className={styles.emptyBody}>Try the direction again in a moment.</p>
         </div>
      );
   }

   if (status === "empty" || !place) {
      return (
         <div className={styles.empty}>
            <p className={styles.emptyTitle}>{emptyTitle}</p>

            <p className={styles.emptyBody}>{emptyBody}</p>
         </div>
      );
   }

   const duration = formatVisitDuration(
      place.editorial.visitDurationMinutes.minimum,

      place.editorial.visitDurationMinutes.maximum,
   );

   const actionLabel = isCurrentDayStop ? "Added to day" : hasDayStop ? "Replace first stop" : "Add to day";

   return (
      <article className={styles.card} aria-labelledby={`sidewalk-pick-${place.id}`}>
         <div className={styles.heading}>
            <h2 id={`sidewalk-pick-${place.id}`} className={styles.name}>
               {place.provider.name}
            </h2>

            <p className={styles.summary}>{place.editorial.summary}</p>
         </div>

         <p className={styles.reason}>{place.editorial.reasonToVisit}</p>

         <ul className={styles.meta} aria-label="Recommendation details">
            <li>{areaName}</li>

            <li>{categoryLabels[place.editorial.category]}</li>

            <li>{duration}</li>
         </ul>

         <button type="button" className={styles.action} disabled={isCurrentDayStop} onClick={() => onAddToDay(place)}>
            {actionLabel}
         </button>
      </article>
   );
}
