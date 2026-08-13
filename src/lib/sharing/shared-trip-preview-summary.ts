import type { SharedTripSnapshot } from "@/types/shared-trip";

function uniqueValues(values: readonly string[]): readonly string[] {
   return Array.from(new Set(values.filter(Boolean)));
}

export function getSharedTripStopCount(snapshot: SharedTripSnapshot): number {
   return snapshot.days.reduce((total, day) => total + day.stops.length, 0);
}

export function getSharedTripRouteLabel(snapshot: SharedTripSnapshot): string {
   const metroNames = uniqueValues(snapshot.days.map((day) => day.geography.metroName));

   if (metroNames.length > 1) {
      return metroNames.slice(0, 4).join(" → ");
   }

   const localAreaNames = uniqueValues(snapshot.days.map((day) => day.geography.localAreaName));

   if (metroNames.length === 1 && localAreaNames.length > 1) {
      return `${metroNames[0]} · ${localAreaNames.slice(0, 3).join(" · ")}`;
   }

   return localAreaNames[0] ?? metroNames[0] ?? "A Sidewalk trip";
}

export function createSharedTripPreviewDescription(snapshot: SharedTripSnapshot): string {
   const stopCount = getSharedTripStopCount(snapshot);

   return `${getSharedTripRouteLabel(snapshot)} · ${snapshot.days.length} ${snapshot.days.length === 1 ? "day" : "days"} · ${stopCount} ${stopCount === 1 ? "stop" : "stops"}. A shared Sidewalk trip.`;
}
