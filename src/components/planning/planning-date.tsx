"use client";

import type { ChangeEvent } from "react";

import { addIsoCalendarDays, getDestinationIsoDate } from "@/lib/geography/destination-date";

import styles from "./planning-date.module.css";

type PlanningDateSelectorProps = Readonly<{
   value: string;
   timezone: string;
   disabled?: boolean;
   onChange: (planningDate: string) => void;
}>;

function formatPlanningDate(value: string): string {
   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return "Choose a date";
   }

   return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
   }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function PlanningDateSelector({ value, timezone, disabled = false, onChange }: PlanningDateSelectorProps) {
   const todayIso = getDestinationIsoDate(timezone);
   const tomorrowIso = addIsoCalendarDays(todayIso, 1);

   const isToday = value === todayIso;
   const isTomorrow = value === tomorrowIso;

   return (
      <fieldset className={styles.fieldset} disabled={disabled}>
         <legend className="sr-only">Choose the day you want to plan</legend>

         <div className={styles.controls}>
            <button type="button" className={styles.quickChoice} data-active={isToday} aria-pressed={isToday} onClick={() => onChange(todayIso)}>
               Today
            </button>

            <button type="button" className={styles.quickChoice} data-active={isTomorrow} aria-pressed={isTomorrow} onClick={() => onChange(tomorrowIso)}>
               Tomorrow
            </button>

            <label className={styles.dateControl}>
               <span className={styles.dateLabel}>Choose a date</span>

               <input
                  type="date"
                  className={styles.dateInput}
                  value={value}
                  min={todayIso}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                     const nextValue = event.currentTarget.value;

                     if (nextValue) {
                        onChange(nextValue);
                     }
                  }}
               />
            </label>
         </div>

         <p className={styles.selectedDate} aria-live="polite">
            {value ? formatPlanningDate(value) : "Choose a date"}
         </p>
      </fieldset>
   );
}
