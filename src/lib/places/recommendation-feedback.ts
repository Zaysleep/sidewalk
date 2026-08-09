import type { DayPeriod } from "@/types/day-period";

export const recommendationFeedbackReasons = [
   "not-my-thing",
   "too-far",
   "been-there",
] as const;

export type RecommendationFeedbackReason =
   (typeof recommendationFeedbackReasons)[number];

export type RecommendationFeedbackSignal = Readonly<{
   placeId: string;
   reason: RecommendationFeedbackReason;
   dayPeriod: DayPeriod;
   localAreaId: string;
   createdAt: string;
}>;

const storageKey =
   "sidewalk-recommendation-feedback-v1";

function isRecord(
   value: unknown,
): value is Record<string, unknown> {
   return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
   );
}

function isFeedbackReason(
   value: unknown,
): value is RecommendationFeedbackReason {
   return (
      typeof value === "string" &&
      (
         recommendationFeedbackReasons as readonly string[]
      ).includes(value)
   );
}

function isFeedbackSignal(
   value: unknown,
): value is RecommendationFeedbackSignal {
   if (!isRecord(value)) {
      return false;
   }

   return (
      typeof value.placeId === "string" &&
      value.placeId.length > 0 &&
      isFeedbackReason(value.reason) &&
      typeof value.dayPeriod === "string" &&
      typeof value.localAreaId === "string" &&
      value.localAreaId.length > 0 &&
      typeof value.createdAt === "string" &&
      Number.isFinite(
         Date.parse(value.createdAt),
      )
   );
}

export function readRecommendationFeedback():
   readonly RecommendationFeedbackSignal[] {
   try {
      const raw =
         window.sessionStorage.getItem(
            storageKey,
         );

      if (!raw) {
         return [];
      }

      const parsed: unknown =
         JSON.parse(raw);

      if (
         !Array.isArray(parsed) ||
         !parsed.every(
            isFeedbackSignal,
         )
      ) {
         window.sessionStorage.removeItem(
            storageKey,
         );

         return [];
      }

      return parsed;
   } catch {
      return [];
   }
}

export function saveRecommendationFeedback(
   signals: readonly RecommendationFeedbackSignal[],
): void {
   try {
      window.sessionStorage.setItem(
         storageKey,
         JSON.stringify(signals),
      );
   } catch {
      // Sidewalk can continue without browser storage.
   }
}

export function recordRecommendationFeedback(
   currentSignals: readonly RecommendationFeedbackSignal[],
   signal: Omit<
      RecommendationFeedbackSignal,
      "createdAt"
   >,
): readonly RecommendationFeedbackSignal[] {
   const nextSignal: RecommendationFeedbackSignal = {
      ...signal,
      createdAt:
         new Date().toISOString(),
   };

   return [
      ...currentSignals.filter(
         (candidate) =>
            candidate.placeId !==
            signal.placeId,
      ),
      nextSignal,
   ];
}

export function getFeedbackExcludedPlaceIds(
   signals: readonly RecommendationFeedbackSignal[],
): readonly string[] {
   return Array.from(
      new Set(
         signals.map(
            (signal) =>
               signal.placeId,
         ),
      ),
   );
}
