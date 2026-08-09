import { sharedTripLimits, type SharedTripCreateRequest, type SharedTripCreateResponse, type SharedTripErrorCode, type SharedTripErrorResponse } from "@/types/shared-trip";

const sharedTripErrorCodes = new Set<SharedTripErrorCode>([
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

const sharedTripTokenPattern = /^(?:s1_[A-Za-z0-9_-]{16}|t1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;

export class SharedTripRequestError extends Error {
   readonly code: SharedTripErrorCode | null;

   readonly requestId: string | null;

   readonly retryable: boolean;

   constructor(
      message: string,
      details: Readonly<{
         code?: SharedTripErrorCode;
         requestId?: string;
         retryable?: boolean;
      }> = {},
   ) {
      super(message);

      this.name = "SharedTripRequestError";
      this.code = details.code ?? null;
      this.requestId = details.requestId ?? null;
      this.retryable = details.retryable ?? false;
   }
}

function isErrorCode(value: unknown): value is SharedTripErrorCode {
   return typeof value === "string" && sharedTripErrorCodes.has(value as SharedTripErrorCode);
}

function isCreateResponse(value: unknown): value is SharedTripCreateResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedTripCreateResponse>;

   if (
      typeof candidate.token !== "string" ||
      candidate.token.length === 0 ||
      candidate.token.length > sharedTripLimits.maximumTokenLength ||
      !sharedTripTokenPattern.test(candidate.token) ||
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

      return (shareUrl.protocol === "https:" || shareUrl.protocol === "http:") && shareUrl.username.length === 0 && shareUrl.password.length === 0 && shareUrl.pathname === `/trip/${candidate.token}`;
   } catch {
      return false;
   }
}

function isErrorResponse(value: unknown): value is SharedTripErrorResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedTripErrorResponse>;

   return typeof candidate.error === "string" && isErrorCode(candidate.code);
}

export async function requestSharedTrip(request: SharedTripCreateRequest, signal?: AbortSignal): Promise<SharedTripCreateResponse> {
   const response = await fetch("/api/shared-trips", {
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
      // Stable product-facing errors are handled below.
   }

   if (!response.ok) {
      if (isErrorResponse(responseBody)) {
         throw new SharedTripRequestError(responseBody.error, {
            code: responseBody.code,
            requestId: responseBody.requestId,
            retryable: responseBody.retryable,
         });
      }

      throw new SharedTripRequestError("Sidewalk could not create a shareable trip right now.", {
         retryable: response.status >= 500,
      });
   }

   if (!isCreateResponse(responseBody)) {
      throw new SharedTripRequestError("Sidewalk received an incomplete trip-sharing response.", {
         retryable: true,
      });
   }

   return responseBody;
}
