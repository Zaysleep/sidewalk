/**
 * Returns a stable YYYY-MM-DD calendar date for one IANA destination timezone.
 *
 * Sidewalk stores planning days as date-only strings. The timezone is used to
 * decide which calendar day "today" means; the stored value itself remains
 * timezone-free so a saved trip day cannot drift when reopened elsewhere.
 */
export function getDestinationIsoDate(timezone: string, instant: Date = new Date()): string {
   const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
   }).formatToParts(instant);

   const year = parts.find((part) => part.type === "year")?.value;
   const month = parts.find((part) => part.type === "month")?.value;
   const day = parts.find((part) => part.type === "day")?.value;

   if (!year || !month || !day) {
      throw new Error(`Sidewalk could not resolve the destination date for ${timezone}.`);
   }

   return `${year}-${month}-${day}`;
}

export function isIsoCalendarDate(value: unknown): value is string {
   if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
   }

   const [yearText, monthText, dayText] = value.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   const parsed = new Date(Date.UTC(year, month - 1, day));

   return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

/**
 * Calendar arithmetic deliberately uses UTC after parsing a date-only value.
 * UTC here prevents local-device timezone shifts; it does not represent the
 * destination timezone.
 */
export function addIsoCalendarDays(value: string, numberOfDays: number): string {
   if (!isIsoCalendarDate(value) || !Number.isInteger(numberOfDays)) {
      throw new Error("Sidewalk received an invalid calendar-date calculation.");
   }

   const [yearText, monthText, dayText] = value.split("-");

   const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));

   date.setUTCDate(date.getUTCDate() + numberOfDays);

   return date.toISOString().slice(0, 10);
}

export function isPlanningDateInDestinationRange(value: unknown, timezone: string, maximumDaysAhead: number, minimumDaysBack = 0): value is string {
   if (!isIsoCalendarDate(value) || !Number.isInteger(maximumDaysAhead) || maximumDaysAhead < 0 || !Number.isInteger(minimumDaysBack) || minimumDaysBack < 0) {
      return false;
   }

   let destinationToday: string;

   try {
      destinationToday = getDestinationIsoDate(timezone);
   } catch {
      return false;
   }

   const minimumDate = addIsoCalendarDays(destinationToday, -minimumDaysBack);
   const maximumDate = addIsoCalendarDays(destinationToday, maximumDaysAhead);

   return value >= minimumDate && value <= maximumDate;
}
