import type {
   SharedDayCreateRequest,
   SharedDayGeographyV1,
   SharedDayGeographyV2,
   SharedDayStop,
} from "@/types/shared-day";

export const legacySharedTripSnapshotVersion = 1 as const;
export const sharedTripSnapshotVersion = 2 as const;

export const sharedTripLimits = {
   minimumDays: 2,
   maximumDays: 5,

   maximumRequestBodyBytes: 98_304,
   maximumTitleLength: 80,

   maximumSnapshotJsonBytes: 81_920,
   maximumCompressedPayloadBytes: 24_576,
   maximumTokenLength: 34_000,

   expirationDays: 30,
   maximumClockSkewMinutes: 5,
} as const;

export type SharedTripDayCreateRequest = SharedDayCreateRequest;

export type SharedTripCreateRequest = Readonly<{
   title: string;
   days: readonly SharedTripDayCreateRequest[];
}>;

export type SharedTripDaySnapshotV1 = Readonly<{
   planningDate: string;
   geography: SharedDayGeographyV1;
   stops: readonly SharedDayStop[];
}>;

export type SharedTripDaySnapshotV2 = Readonly<{
   planningDate: string;
   geography: SharedDayGeographyV2;
   stops: readonly SharedDayStop[];
}>;

export type SharedTripDaySnapshot = SharedTripDaySnapshotV1 | SharedTripDaySnapshotV2;

export type SharedTripSnapshotV1 = Readonly<{
   version: typeof legacySharedTripSnapshotVersion;

   createdAt: string;
   expiresAt: string;

   title: string;

   days: readonly SharedTripDaySnapshotV1[];
}>;

export type SharedTripSnapshotV2 = Readonly<{
   version: typeof sharedTripSnapshotVersion;

   createdAt: string;
   expiresAt: string;

   title: string;

   days: readonly SharedTripDaySnapshotV2[];
}>;

export type SharedTripSnapshot = SharedTripSnapshotV1 | SharedTripSnapshotV2;

export type SharedTripCreateResponse = Readonly<{
   token: string;
   shareUrl: string;
   expiresAt: string;
}>;

export type SharedTripErrorCode =
   | "INVALID_JSON"
   | "REQUEST_TOO_LARGE"
   | "UNSUPPORTED_MEDIA_TYPE"
   | "REQUEST_ORIGIN_REJECTED"
   | "INVALID_REQUEST"
   | "INVALID_DATE"
   | "INVALID_GEOGRAPHY"
   | "RATE_LIMITED"
   | "SHARE_CONFIGURATION_ERROR"
   | "SHARE_CREATION_ERROR";

export type SharedTripErrorResponse = Readonly<{
   error: string;
   code: SharedTripErrorCode;
   requestId?: string;
   retryable?: boolean;
}>;
