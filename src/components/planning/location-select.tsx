"use client";

import type { ChangeEvent } from "react";

/**
 * A compact option used by the shared geographic selector.
 */
type LocationSelectOption = Readonly<{
   value: string;
   label: string;
}>;

/**
 * Props shared by municipality and local-area controls.
 */
type LocationSelectProps = Readonly<{
   id: string;
   label: string;
   value: string;
   placeholder: string;
   options: readonly LocationSelectOption[];
   disabled?: boolean;
   onChange: (value: string) => void;
}>;

/**
 * LocationSelect keeps Sidewalk's geographic controls visually and
 * behaviorally consistent.
 *
 * A native select provides reliable keyboard, touch, and assistive-technology
 * support without adding a custom menu dependency during this phase.
 */
export function LocationSelect({ id, label, value, placeholder, options, disabled = false, onChange }: LocationSelectProps) {
   function handleChange(event: ChangeEvent<HTMLSelectElement>) {
      onChange(event.target.value);
   }

   return (
      <div className="location-select">
         <label className="sr-only" htmlFor={id}>
            {label}
         </label>

         <div className="location-select__field">
            <select id={id} className="location-select__select" value={value} disabled={disabled} onChange={handleChange}>
               <option value="" disabled>
                  {placeholder}
               </option>

               {options.map((option) => (
                  <option key={option.value} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </select>

            <span className="location-select__icon" aria-hidden="true">
               ⌄
            </span>
         </div>
      </div>
   );
}
