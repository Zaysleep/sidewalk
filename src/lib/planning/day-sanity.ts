import type { ActivityKind } from "@/types/activity";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";

export type DaySanityNote = Readonly<{
   id: "long-jump" | "long-gap" | "same-direction";
   message: string;
}>;

const longJumpThresholdMiles = 8;
const earthRadiusMiles = 3_958.8;

const activityLabels: Readonly<Record<ActivityKind, string>> = {
   outdoors: "Get outside",
   culture: "Culture & nightlife",
   browse: "Shop & browse",
   food: "Food & drink",
};

function toRadians(degrees: number): number {
   return (degrees * Math.PI) / 180;
}

function getDistanceMiles(first: DayStop, second: DayStop): number | null {
   if (first.latitude === null || first.longitude === null || second.latitude === null || second.longitude === null) {
      return null;
   }

   const latitudeDelta = toRadians(second.latitude - first.latitude);
   const longitudeDelta = toRadians(second.longitude - first.longitude);
   const firstLatitude = toRadians(first.latitude);
   const secondLatitude = toRadians(second.latitude);

   const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

   return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
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

function getLongJumpNote(stops: readonly DayStop[]): DaySanityNote | null {
   for (let index = 0; index < stops.length - 1; index += 1) {
      const first = stops[index];
      const second = stops[index + 1];
      const distanceMiles = getDistanceMiles(first, second);

      if (distanceMiles === null || distanceMiles < longJumpThresholdMiles) {
         continue;
      }

      return {
         id: "long-jump",
         message: `${first.placeName} and ${second.placeName} are roughly ${Math.round(distanceMiles)} miles apart before road routing. Worth a quick route check before you head out.`,
      };
   }

   return null;
}

function getLongGapNote(stops: readonly DayStop[]): DaySanityNote | null {
   for (let index = 0; index < stops.length - 1; index += 1) {
      const first = stops[index];
      const second = stops[index + 1];
      const firstIndex = dayPeriods.indexOf(first.dayPeriod);
      const secondIndex = dayPeriods.indexOf(second.dayPeriod);

      if (firstIndex < 0 || secondIndex - firstIndex < 3) {
         continue;
      }

      return {
         id: "long-gap",
         message: `There’s a long stretch between ${getPeriodLabel(first.dayPeriod)} and ${getPeriodLabel(second.dayPeriod)}. That may be exactly what you want—just make sure it fits the day.`,
      };
   }

   return null;
}

function getRepeatedDirectionNote(stops: readonly DayStop[]): DaySanityNote | null {
   const counts = new Map<ActivityKind, number>();

   stops.forEach((stop) => {
      counts.set(stop.resolvedActivity, (counts.get(stop.resolvedActivity) ?? 0) + 1);
   });

   const repeatedDirection = Array.from(counts.entries()).find(([, count]) => count >= 3);

   if (!repeatedDirection) {
      return null;
   }

   const [activity] = repeatedDirection;

   return {
      id: "same-direction",
      message: `This day leans heavily toward ${activityLabels[activity].toLowerCase()}. If that’s intentional, keep it. Otherwise, one different stop could give the day a little more shape.`,
   };
}

/**
 * Sidewalk surfaces at most one advisory note. It never blocks planning.
 */
export function getPrimaryDaySanityNote(stops: readonly DayStop[]): DaySanityNote | null {
   if (stops.length < 2) {
      return null;
   }

   const orderedStops = sortStops(stops);

   return getLongJumpNote(orderedStops) ?? getLongGapNote(orderedStops) ?? getRepeatedDirectionNote(orderedStops);
}
