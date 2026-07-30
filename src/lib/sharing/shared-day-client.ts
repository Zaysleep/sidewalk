import type {
   SharedDayCreateRequest,
   SharedDayCreateResponse,
   SharedDayErrorCode,
   SharedDayErrorResponse,
} from "@/types/shared-day";

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

function isCreateResponse(value: unknown): value is SharedDayCreateResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedDayCreateResponse>;

   return typeof candidate.token === "string" && candidate.token.length > 0 && typeof candidate.shareUrl === "string" && candidate.shareUrl.length > 0 && typeof candidate.expiresAt === "string" && Number.isFinite(Date.parse(candidate.expiresAt));
}

function isErrorResponse(value: unknown): value is SharedDayErrorResponse {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }

   const candidate = value as Partial<SharedDayErrorResponse>;

   return typeof candidate.error === "string" && typeof candidate.code === "string";
}

export async function requestSharedDay(request: SharedDayCreateRequest, signal?: AbortSignal): Promise<SharedDayCreateResponse> {
   const response = await fetch("/api/shared-days", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store",
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
