"use client";

import { useRef, type KeyboardEvent } from "react";

import { dayPeriodDefinitions, type DayPeriod } from "@/types/day-period";

import styles from "./period-switcher.module.css";

type PeriodSwitcherProps = Readonly<{
   activePeriod: DayPeriod;
   completedPeriods: readonly DayPeriod[];
   unavailablePeriods?: readonly DayPeriod[];
   disabled?: boolean;
   onChange: (period: DayPeriod) => void;
}>;

export function PeriodSwitcher({ activePeriod, completedPeriods, unavailablePeriods = [], disabled = false, onChange }: PeriodSwitcherProps) {
   const tabReferences = useRef<Array<HTMLButtonElement | null>>([]);

   function isUnavailable(period: DayPeriod) {
      return unavailablePeriods.includes(period);
   }

   function moveToTab(nextIndex: number, direction: 1 | -1) {
      const total = dayPeriodDefinitions.length;

      for (let offset = 0; offset < total; offset += 1) {
         const candidateIndex = (nextIndex + offset * direction + total) % total;
         const nextPeriod = dayPeriodDefinitions[candidateIndex];

         if (!nextPeriod || isUnavailable(nextPeriod.id)) {
            continue;
         }

         onChange(nextPeriod.id);

         window.requestAnimationFrame(() => {
            tabReferences.current[candidateIndex]?.focus();
         });

         return;
      }
   }

   function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
      const finalIndex = dayPeriodDefinitions.length - 1;

      switch (event.key) {
         case "ArrowRight":
            event.preventDefault();
            moveToTab(currentIndex === finalIndex ? 0 : currentIndex + 1, 1);
            return;

         case "ArrowLeft":
            event.preventDefault();
            moveToTab(currentIndex === 0 ? finalIndex : currentIndex - 1, -1);
            return;

         case "Home":
            event.preventDefault();
            moveToTab(0, 1);
            return;

         case "End":
            event.preventDefault();
            moveToTab(finalIndex, -1);
            return;

         default:
            return;
      }
   }

   return (
      <div className={styles.switcher} role="tablist" aria-label="Choose a part of the day" aria-orientation="horizontal">
         {dayPeriodDefinitions.map((period, index) => {
            const isActive = period.id === activePeriod;
            const isComplete = completedPeriods.includes(period.id);
            const isPast = isUnavailable(period.id);

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
                  aria-label={`${period.label}, ${period.rangeLabel}${isComplete ? ", chosen" : ""}${isPast ? ", already passed" : ""}`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={disabled || isPast}
                  data-active={isActive}
                  data-complete={isComplete}
                  data-past={isPast}
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
