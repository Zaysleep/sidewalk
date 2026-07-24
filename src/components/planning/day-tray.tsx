"use client";

import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";

import styles from "./day-tray.module.css";

type DayTrayProps = Readonly<{
   planningDate: string;
   stops: readonly DayStop[];
   isOpen: boolean;

   onToggle: () => void;
   onRemove: (stopId: string) => void;
   onEditPeriod: (period: DayPeriod) => void;
   onContinuePlanning: () => void;
   onPlanAnotherDay: () => void;
}>;

function formatDuration(minimumMinutes: number, maximumMinutes: number): string {
   if (minimumMinutes === maximumMinutes) {
      return `${minimumMinutes} minutes`;
   }

   return `${minimumMinutes}–${maximumMinutes} minutes`;
}

function formatTotalDuration(stops: readonly DayStop[]): string {
   const minimum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.minimum, 0);

   const maximum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.maximum, 0);

   if (minimum === maximum) {
      return `${minimum} minutes at stops`;
   }

   return `${minimum}–${maximum} minutes at stops`;
}

function formatPlanningDate(planningDate: string): string {
   const [yearText, monthText, dayText] = planningDate.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return "";
   }

   return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
   }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getPeriodLabel(period: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === period)?.label ?? period;
}

function sortStops(stops: readonly DayStop[]): readonly DayStop[] {
   return dayPeriods.flatMap((period) => {
      const stop = stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });
}

function getSummaryLabel(stops: readonly DayStop[]): string {
   if (stops.length === 1) {
      const stop = stops[0];

      return `${getPeriodLabel(stop.dayPeriod)}: ${stop.placeName}`;
   }

   return stops.map((stop) => getPeriodLabel(stop.dayPeriod)).join(" + ");
}

function getTitle(stopCount: number): string {
   if (stopCount === 1) {
      return "One stop chosen.";
   }

   return "Your Sidewalk Day";
}

export function DayTray({ planningDate, stops, isOpen, onToggle, onRemove, onEditPeriod, onContinuePlanning, onPlanAnotherDay }: DayTrayProps) {
   if (stops.length === 0) {
      return null;
   }

   const orderedStops = sortStops(stops);

   const isComplete = orderedStops.length >= 2;

   const canAddAnotherStop = orderedStops.length === 2;

   const formattedPlanningDate = formatPlanningDate(planningDate);

   return (
      <aside className={styles.tray} data-open={isOpen} aria-label="Your day">
         <button type="button" className={styles.summaryButton} aria-expanded={isOpen} aria-controls="sidewalk-day-tray-content" onClick={onToggle}>
            <span className={styles.summaryHeading}>{isComplete ? "Saved Day" : "Your Day"}</span>

            <span className={styles.summaryPlace}>{getSummaryLabel(orderedStops)}</span>

            <span className={styles.summaryAction}>{isOpen ? "Close" : "Open"}</span>
         </button>

         <div id="sidewalk-day-tray-content" className={styles.content}>
            <header className={styles.heading}>
               <div>
                  <p className={styles.eyebrow}>{isComplete ? "Day saved" : "Your Day"}</p>

                  <h2 className={styles.title}>{getTitle(orderedStops.length)}</h2>

                  {formattedPlanningDate ? <p className={styles.date}>{formattedPlanningDate}</p> : null}
               </div>

               <p className={styles.count}>
                  {orderedStops.length} {orderedStops.length === 1 ? "stop" : "stops"}
               </p>
            </header>

            <div className={styles.stopList}>
               {orderedStops.map((stop) => (
                  <article key={stop.id} className={styles.stop} aria-labelledby={`day-stop-title-${stop.id}`}>
                     <div className={styles.stopHeading}>
                        <p className={styles.stopLabel}>{getPeriodLabel(stop.dayPeriod)}</p>

                        <p className={styles.window}>{stop.bestWindow}</p>
                     </div>

                     <h3 id={`day-stop-title-${stop.id}`} className={styles.stopName}>
                        {stop.placeName}
                     </h3>

                     <p className={styles.location}>
                        {stop.localAreaName}, {stop.municipalityName}
                     </p>

                     <p className={styles.duration}>{formatDuration(stop.visitDurationMinutes.minimum, stop.visitDurationMinutes.maximum)}</p>

                     {stop.locationUrl ? (
                        <a className={styles.locationLink} href={stop.locationUrl} target="_blank" rel="noreferrer">
                           Open location
                        </a>
                     ) : null}

                     <div className={styles.stopActions}>
                        <button type="button" className={styles.editButton} onClick={() => onEditPeriod(stop.dayPeriod)}>
                           Change {getPeriodLabel(stop.dayPeriod)}
                        </button>

                        <button type="button" className={styles.removeButton} onClick={() => onRemove(stop.id)}>
                           Remove
                        </button>
                     </div>
                  </article>
               ))}
            </div>

            <div className={styles.footer}>
               <p className={styles.total}>{formatTotalDuration(orderedStops)}</p>

               {!isComplete ? (
                  <p className={styles.completionNote}>Choose one more stop to save this day.</p>
               ) : (
                  <>
                     <p className={styles.completionNote}>{canAddAnotherStop ? "Two stops are enough. Add a third only if it improves the day." : "Your morning, afternoon, and evening are set."}</p>

                     <div className={styles.footerActions}>
                        {canAddAnotherStop ? (
                           <button type="button" className={styles.continueButton} onClick={onContinuePlanning}>
                              Add one more stop
                           </button>
                        ) : null}

                        <button type="button" className={styles.resetButton} onClick={onPlanAnotherDay}>
                           Plan another day
                        </button>
                     </div>
                  </>
               )}
            </div>
         </div>
      </aside>
   );
}
