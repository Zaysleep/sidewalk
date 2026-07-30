const recentMetroStorageKey = "sidewalk-recent-metro-slugs-v1";

export const maximumRecentMetroCount = 3;

function areStringArraysEqual(first: readonly string[], second: readonly string[]): boolean {
   return first.length === second.length && first.every((value, index) => value === second[index]);
}

/**
 * Reads the recent metro list from local storage and removes stale slugs that
 * are no longer present in Sidewalk's active coverage catalog.
 */
export function readRecentMetroSlugs(availableMetroSlugs: readonly string[]): readonly string[] {
   if (typeof window === "undefined") {
      return [];
   }

   try {
      const rawValue = window.localStorage.getItem(recentMetroStorageKey);

      if (!rawValue) {
         return [];
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (!Array.isArray(parsedValue)) {
         window.localStorage.removeItem(recentMetroStorageKey);

         return [];
      }

      const availableSlugs = new Set(availableMetroSlugs);

      const validSlugs = parsedValue.filter((value): value is string => typeof value === "string" && availableSlugs.has(value));

      return Array.from(new Set(validSlugs)).slice(0, maximumRecentMetroCount);
   } catch {
      return [];
   }
}

/**
 * Moves the most recently planned metro to the front while preserving a small,
 * duplicate-free list.
 */
export function createRecentMetroSlugs(
   currentSlugs: readonly string[],
   nextMetroSlug: string,
   availableMetroSlugs: readonly string[],
): readonly string[] {
   const availableSlugs = new Set(availableMetroSlugs);

   if (!availableSlugs.has(nextMetroSlug)) {
      return currentSlugs;
   }

   return [nextMetroSlug, ...currentSlugs.filter((slug) => slug !== nextMetroSlug && availableSlugs.has(slug))].slice(0, maximumRecentMetroCount);
}

/**
 * Stores recent metros only when the list has meaningfully changed.
 */
export function saveRecentMetroSlugs(nextSlugs: readonly string[], currentStoredSlugs: readonly string[] = []): void {
   if (typeof window === "undefined" || areStringArraysEqual(nextSlugs, currentStoredSlugs)) {
      return;
   }

   try {
      window.localStorage.setItem(recentMetroStorageKey, JSON.stringify(nextSlugs));
   } catch {
      // Sidewalk remains fully usable when browser storage is unavailable.
   }
}
