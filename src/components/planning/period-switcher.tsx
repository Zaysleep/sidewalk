"use client";

import { useRef, type KeyboardEvent } from "react";

import { dayPeriodDefinitions, type DayPeriod } from "@/types/day-period";

import styles from "./period-switcher.module.css";

type PeriodSwitcherProps = Readonly<{
   activePeriod: DayPeriod;
   completedPeriods: readonly DayPeriod[];

   disabled?: boolean;

   onChange: (period: DayPeriod) => void;
}>;

export function PeriodSwitcher({ activePeriod, completedPeriods, disabled = false, onChange }: PeriodSwitcherProps) {
   const tabReferences = useRef<Array<HTMLButtonElement | null>>([]);

   function moveToTab(nextIndex: number) {
      const nextPeriod = dayPeriodDefinitions[nextIndex];

      if (!nextPeriod) {
         return;
      }

      onChange(nextPeriod.id);

      window.requestAnimationFrame(() => {
         tabReferences.current[nextIndex]?.focus();
      });
   }

   /**
    * The period rail follows the standard horizontal tab pattern. Arrow keys
    * wrap through all five periods, while Home and End jump to the edges.
    */
   function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
      const finalIndex = dayPeriodDefinitions.length - 1;

      let nextIndex: number | null = null;

      switch (event.key) {
         case "ArrowRight":
            nextIndex = currentIndex === finalIndex ? 0 : currentIndex + 1;
            break;

         case "ArrowLeft":
            nextIndex = currentIndex === 0 ? finalIndex : currentIndex - 1;
            break;

         case "Home":
            nextIndex = 0;
            break;

         case "End":
            nextIndex = finalIndex;
            break;

         default:
            return;
      }

      event.preventDefault();

      moveToTab(nextIndex);
   }

   return (
      <div className={styles.switcher} role="tablist" aria-label="Choose a part of the day" aria-orientation="horizontal">
         {dayPeriodDefinitions.map((period, index) => {
            const isActive = period.id === activePeriod;

            const isComplete = completedPeriods.includes(period.id);

            return (
               <button
                  key={period.id}
                  ref={(element) => {
                     tabReferences.current[index] = element;
                  }}
                  id={`sidewalk-period-tab-${period.id}`}
                  type="button"
                  role="tab"
                  className={styles.tab}
                  aria-selected={isActive}
                  aria-controls="sidewalk-period-panel"
                  aria-label={`${period.label}, ${period.rangeLabel}${isComplete ? ", chosen" : ", not chosen"}`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={disabled}
                  data-active={isActive}
                  data-complete={isComplete}
                  onClick={() => onChange(period.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
               >
                  <span className={styles.label}>{period.label}</span>

                  {isComplete ? (
                     <span className={styles.status} aria-hidden="true">
                        ✓
                     </span>
                  ) : null}
               </button>
            );
         })}
      </div>
   );
}
