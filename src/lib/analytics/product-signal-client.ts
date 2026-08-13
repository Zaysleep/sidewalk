export const productSignalEvents = [
   "metro_selected",
   "neighborhood_selected",
   "neighborhood_changed",
   "recommendation_loaded",
   "recommendation_feedback",
   "stop_added",
   "day_completed",
   "trip_created",
   "trip_day_added",
   "trip_shared",
   "similar_day_started",
] as const;

export type ProductSignalEvent = (typeof productSignalEvents)[number];

export type ProductSignalDimensions = Readonly<{
   metroSlug?: string;
   localAreaId?: string;
   period?: string;
   reason?: string;
   count?: number;
   dayCount?: number;
   stopCount?: number;
}>;

const productSignalsEndpoint = "/api/product-signals";

/**
 * Best-effort anonymous aggregate telemetry.
 *
 * The payload deliberately contains no account, browser identity, cookie,
 * persistent identifier, place ID, or free-form text.
 */
export function trackProductSignal(event: ProductSignalEvent, dimensions: ProductSignalDimensions = {}): void {
   if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
   }

   if (navigator.doNotTrack === "1") {
      return;
   }

   const body = JSON.stringify({
      event,
      dimensions,
   });

   try {
      if (typeof navigator.sendBeacon === "function") {
         const blob = new Blob([body], {
            type: "application/json",
         });

         if (navigator.sendBeacon(productSignalsEndpoint, blob)) {
            return;
         }
      }

      void fetch(productSignalsEndpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body,
         keepalive: true,
         cache: "no-store",
      }).catch(() => {
         // Metrics must never affect the planning experience.
      });
   } catch {
      // Metrics must never affect the planning experience.
   }
}
