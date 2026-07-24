import type { PeriodRecommendationErrorResponse, PeriodRecommendationRequest, PeriodRecommendationResponse } from "@/types/period-recommendation";

const PERIOD_RECOMMENDATION_ENDPOINT = "/api/places/period-recommendations";

const clientRequestTimeoutMilliseconds = 30_000;

const recentResponseCacheDurationMilliseconds = 15_000;

const maximumRecentResponseCacheEntries = 30;

type CachedClientResponse = Readonly<{
   expiresAt: number;
   value: PeriodRecommendationResponse;
}>;

const recentResponseCache = new Map<string, CachedClientResponse>();

function createClientRequestKey(request: PeriodRecommendationRequest): string {
   return JSON.stringify(request);
}

function pruneRecentResponseCache() {
   const now = Date.now();

   for (const [key, entry] of recentResponseCache) {
      if (entry.expiresAt <= now) {
         recentResponseCache.delete(key);
      }
   }

   while (recentResponseCache.size >= maximumRecentResponseCacheEntries) {
      const oldestKey = recentResponseCache.keys().next().value;

      if (typeof oldestKey !== "string") {
         break;
      }

      recentResponseCache.delete(oldestKey);
   }
}

export class PeriodRecommendationClientError extends Error {
   readonly code: string | null;
   readonly requestId: string | null;
   readonly retryable: boolean;

   constructor(
      message: string,
      options: Readonly<{
         code?: string | null;
         requestId?: string | null;
         retryable?: boolean;
      }> = {},
   ) {
      super(message);

      this.name = "PeriodRecommendationClientError";

      this.code = options.code ?? null;
      this.requestId = options.requestId ?? null;
      this.retryable = options.retryable ?? false;
   }
}

function getErrorPayload(payload: unknown): PeriodRecommendationErrorResponse | null {
   if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return null;
   }

   const candidate = payload as Partial<PeriodRecommendationErrorResponse>;

   if (typeof candidate.error !== "string") {
      return null;
   }

   return {
      error: candidate.error,
      code: candidate.code,
      requestId: candidate.requestId,
      retryable: candidate.retryable,
   };
}

function isPeriodRecommendationResponse(payload: unknown): payload is PeriodRecommendationResponse {
   if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return false;
   }

   const candidate = payload as Partial<PeriodRecommendationResponse>;

   return typeof candidate.dayPeriod === "string" && Array.isArray(candidate.recommendations);
}

export async function fetchPeriodRecommendations(request: PeriodRecommendationRequest, signal?: AbortSignal): Promise<PeriodRecommendationResponse> {
   if (signal?.aborted) {
      throw new DOMException("The request was aborted.", "AbortError");
   }

   pruneRecentResponseCache();

   const requestKey = createClientRequestKey(request);

   const cachedResponse = recentResponseCache.get(requestKey);

   if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
      return cachedResponse.value;
   }

   const controller = new AbortController();

   let didTimeout = false;

   const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
   }, clientRequestTimeoutMilliseconds);

   const handleExternalAbort = () => {
      controller.abort();
   };

   signal?.addEventListener("abort", handleExternalAbort, {
      once: true,
   });

   try {
      const response = await fetch(PERIOD_RECOMMENDATION_ENDPOINT, {
         method: "POST",

         headers: {
            "Content-Type": "application/json",
         },

         body: JSON.stringify(request),

         signal: controller.signal,

         cache: "no-store",
      });

      let payload: unknown;

      try {
         payload = await response.json();
      } catch {
         throw new PeriodRecommendationClientError("Sidewalk received an unreadable places response.", {
            requestId: response.headers.get("X-Sidewalk-Request-Id"),
            retryable: true,
         });
      }

      if (!response.ok) {
         const errorPayload = getErrorPayload(payload);

         throw new PeriodRecommendationClientError(errorPayload?.error ?? "Sidewalk could not load recommendations.", {
            code: errorPayload?.code ?? null,
            requestId: errorPayload?.requestId ?? response.headers.get("X-Sidewalk-Request-Id"),
            retryable: errorPayload?.retryable ?? response.status >= 500,
         });
      }

      if (!isPeriodRecommendationResponse(payload)) {
         throw new PeriodRecommendationClientError("Sidewalk received an incomplete places response.", {
            requestId: response.headers.get("X-Sidewalk-Request-Id"),
            retryable: true,
         });
      }

      pruneRecentResponseCache();

      recentResponseCache.set(requestKey, {
         expiresAt: Date.now() + recentResponseCacheDurationMilliseconds,
         value: payload,
      });

      return payload;
   } catch (error: unknown) {
      if (signal?.aborted && !didTimeout) {
         throw new DOMException("The request was aborted.", "AbortError");
      }

      if (didTimeout) {
         throw new PeriodRecommendationClientError("Sidewalk took too long to load nearby places. Try again.", {
            code: "CLIENT_TIMEOUT",
            retryable: true,
         });
      }

      throw error;
   } finally {
      window.clearTimeout(timeoutId);

      signal?.removeEventListener("abort", handleExternalAbort);
   }
}
