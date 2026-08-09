import { sharedDayLimits, type SharedDayCreateRequest, type SharedDayCreateResponse, type SharedDayErrorCode, type SharedDayErrorResponse } from "@/types/shared-day";

const sharedDayErrorCodes = new Set<SharedDayErrorCode>([
   "INVALID_JSON",
   "REQUEST_TOO_LARGE",
   "UNSUPPORTED_MEDIA_TYPE",
   "REQUEST_ORIGIN_REJECTED",
   "INVALID_REQUEST",
   "INVALID_DATE",
   "INVALID_GEOGRAPHY",
   "RATE_LIMITED",
   "SHARE_CONFIGURATION_ERROR",
   "SHARE_CREATION_ERROR",
]);

const sharedDayTokenPattern = /^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export class SharedDayRequestError extends Error {
   readonly code: SharedDayErrorCode | null;

   readonly requestId: string | null;

   readonly retryable: boolean;

   constructor(message: string, details: Readonly<{ code?: SharedDayErrorCode; requestId?: string; retryable?: boolean }> = {}) {
      super(message);

      this.name = "SharedDayRequestError";
      this.code = details.code ?? null;
      this.requestId = details.requestId ?? null;
      this.retryable = details.retryable ?? false;
   }
}

function isSharedDayErrorCode(value: unknown): value is SharedDayErrorCode {
   return typeof value === "string" && sharedDayErrorCodes.has(value as SharedDayErrorCode);
}

function isCreateResponse(value: unknown): value is SharedDayCreateResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedDayCreateResponse>;

   if (
      typeof candidate.token !== "string" ||
      candidate.token.length === 0 ||
      candidate.token.length > sharedDayLimits.maximumTokenLength ||
      !sharedDayTokenPattern.test(candidate.token) ||
      typeof candidate.shareUrl !== "string" ||
      candidate.shareUrl.length === 0 ||
      typeof candidate.expiresAt !== "string" ||
      !Number.isFinite(Date.parse(candidate.expiresAt)) ||
      Date.parse(candidate.expiresAt) <= Date.now()
   ) {
      return false;
   }

   try {
      const shareUrl = new URL(candidate.shareUrl);

      return (shareUrl.protocol === "https:" || shareUrl.protocol === "http:") && shareUrl.username.length === 0 && shareUrl.password.length === 0 && shareUrl.pathname === `/day/${candidate.token}`;
   } catch {
      return false;
   }
}

function isErrorResponse(value: unknown): value is SharedDayErrorResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedDayErrorResponse>;

   return typeof candidate.error === "string" && isSharedDayErrorCode(candidate.code);
}

export async function requestSharedDay(request: SharedDayCreateRequest, signal?: AbortSignal): Promise<SharedDayCreateResponse> {
   const response = await fetch("/api/shared-days", {
      method: "POST",
      headers: {
         Accept: "application/json",
         "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store",
      credentials: "same-origin",
      referrerPolicy: "no-referrer",
      signal,
   });

   let responseBody: unknown = null;

   try {
      responseBody = (await response.json()) as unknown;
   } catch {
      // The response handling below provides a stable product-facing error.
   }

   if (!response.ok) {
      if (isErrorResponse(responseBody)) {
         throw new SharedDayRequestError(responseBody.error, {
            code: responseBody.code,
            requestId: responseBody.requestId,
            retryable: responseBody.retryable,
         });
      }

      throw new SharedDayRequestError("Sidewalk could not create a shareable day right now.", {
         retryable: response.status >= 500,
      });
   }

   if (!isCreateResponse(responseBody)) {
      throw new SharedDayRequestError("Sidewalk received an incomplete sharing response.", {
         retryable: true,
      });
   }

   return responseBody;
}
