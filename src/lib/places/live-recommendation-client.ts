import type { LiveRecommendationErrorResponse, LiveRecommendationRequest, LiveRecommendationResponse } from "@/types/live-recommendation";

/**
 * Calls Sidewalk's own server boundary.
 *
 * The browser never calls Google directly and never receives the provider key.
 */
export async function fetchLiveRecommendation(request: LiveRecommendationRequest, signal?: AbortSignal): Promise<LiveRecommendationResponse> {
   const response = await fetch("/api/places/recommendation", {
      method: "POST",

      headers: {
         "Content-Type": "application/json",
      },

      body: JSON.stringify(request),
      signal,
   });

   const payload = (await response.json().catch(() => null)) as LiveRecommendationResponse | LiveRecommendationErrorResponse | null;

   if (!response.ok) {
      const errorMessage = payload && "error" in payload ? payload.error : "Sidewalk could not load a recommendation.";

      throw new Error(errorMessage);
   }

   if (!payload || !("resolvedActivity" in payload) || !("recommendation" in payload)) {
      throw new Error("Sidewalk received an invalid recommendation response.");
   }

   return payload;
}
