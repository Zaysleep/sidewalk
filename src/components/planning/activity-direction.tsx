"use client";

import type { ActivityDirection } from "@/types/activity";

import styles from "./activity-direction.module.css";

type ActivityDirectionOption = Readonly<{
   value: ActivityDirection;
   label: string;
}>;

const activityOptions = [
   {
      value: "outdoors",
      label: "Get Outside",
   },
   {
      value: "culture",
      label: "Culture & Nightlife",
   },
   {
      value: "browse",
      label: "Shop & Browse",
   },
   {
      value: "food",
      label: "Food & Drink",
   },
   {
      value: "sidewalk-choice",
      label: "Let Sidewalk Choose",
   },
] satisfies readonly ActivityDirectionOption[];

type ActivityDirectionProps = Readonly<{
   value: ActivityDirection | null;
   disabled?: boolean;
   onChange: (direction: ActivityDirection) => void;
}>;

/**
 * ActivityDirection asks for one broad intention without exposing a large
 * filter panel.
 */
export function ActivityDirectionSelector({ value, disabled = false, onChange }: ActivityDirectionProps) {
   return (
      <div className={styles.options} role="group" aria-label="Choose what sounds worthwhile">
         {activityOptions.map((option) => (
            <button key={option.value} type="button" className={styles.option} aria-pressed={value === option.value} disabled={disabled} onClick={() => onChange(option.value)}>
               {option.label}
            </button>
         ))}
      </div>
   );
}
