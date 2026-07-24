"use client";

import type { ChangeEvent } from "react";

import styles from "./planning-date.module.css";

type PlanningDateSelectorProps = Readonly<{
   value: string;
   disabled?: boolean;
   onChange: (planningDate: string) => void;
}>;

function toLocalIsoDate(date: Date): string {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
}

function addDays(date: Date, numberOfDays: number): Date {
   const nextDate = new Date(date);

   nextDate.setDate(nextDate.getDate() + numberOfDays);

   return nextDate;
}

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

export function PlanningDateSelector({ value, disabled = false, onChange }: PlanningDateSelectorProps) {
   const today = new Date();

   const todayIso = toLocalIsoDate(today);
   const tomorrowIso = toLocalIsoDate(addDays(today, 1));

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
