import type { DayPeriod } from "@/types/day-period";

export const sharedDaySnapshotVersion = 1 as const;

export const sharedDayLimits = {
   maximumRequestBodyBytes: 32_768,
   minimumStops: 2,
   maximumStops: 5,

   maximumIdentifierLength: 200,
   maximumPlaceNameLength: 200,
   maximumBestWindowLength: 80,
   maximumSummaryLength: 400,
   maximumReasonLength: 500,
   maximumLocationUrlLength: 2_048,
   maximumPhotoResourceNameLength: 500,

   maximumPlanningDaysAhead: 366,
   expirationDays: 30,

   maximumSnapshotJsonBytes: 24_576,
   maximumCompressedPayloadBytes: 9_216,
   maximumTokenLength: 12_000,

   maximumClockSkewMinutes: 5,
} as const;

export type SharedDayStop = Readonly<{
   dayPeriod: DayPeriod;

   bestWindow: string;

   placeId: string;
   placeName: string;

   summary: string;
   reason: string;

   visitDurationMinutes: Readonly<{
      minimum: number;
      maximum: number;
   }>;

   locationUrl: string | null;
   photoResourceName: string | null;
}>;

export type SharedDayCreateRequest = Readonly<{
   planningDate: string;

   metroRegionId: string;
   municipalityId: string;
   localAreaId: string;

   stops: readonly SharedDayStop[];
}>;

export type SharedDayGeography = Readonly<{
   metroRegionId: string;
   metroSlug: string;
   metroName: string;
   stateOrRegion: string;

   municipalityId: string;
   municipalityName: string;

   localAreaId: string;
   localAreaName: string;
}>;

export type SharedDaySnapshot = Readonly<{
   version: typeof sharedDaySnapshotVersion;

   createdAt: string;
   expiresAt: string;

   planningDate: string;

   geography: SharedDayGeography;

   stops: readonly SharedDayStop[];
}>;

export type SharedDayCreateResponse = Readonly<{
   token: string;
   shareUrl: string;
   expiresAt: string;
}>;

export type SharedDayErrorCode =
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

export type SharedDayErrorResponse = Readonly<{
   error: string;
   code: SharedDayErrorCode;
   requestId?: string;
   retryable?: boolean;
}>;
