import "server-only";

import {
   createHmac,
   timingSafeEqual,
} from "node:crypto";
import {
   deflateRawSync,
   inflateRawSync,
} from "node:zlib";

import {
   isSharedTripSnapshot,
} from "@/lib/sharing/shared-trip-schema";
import {
   sharedTripLimits,
   type SharedTripSnapshot,
} from "@/types/shared-trip";

const sharedTripTokenVersion = "t1";

const minimumSecretLength = 32;

const base64UrlSegmentPattern =
   /^[A-Za-z0-9_-]+$/;

export class SharedTripConfigurationError extends Error {
   constructor() {
      super(
         "SIDEWALK_SHARE_SECRET must contain at least 32 characters.",
      );

      this.name =
         "SharedTripConfigurationError";
   }
}

export type SharedTripTokenVerification =
   | Readonly<{
        ok: true;
        snapshot: SharedTripSnapshot;
     }>
   | Readonly<{
        ok: false;
        reason: "invalid" | "expired";
     }>;

function getShareSecret(): string {
   const secret =
      process.env.SIDEWALK_SHARE_SECRET?.trim();

   if (
      !secret ||
      secret.length < minimumSecretLength
   ) {
      throw new SharedTripConfigurationError();
   }

   return secret;
}

function createSignature(
   signedValue: string,
): Buffer {
   return createHmac(
      "sha256",
      getShareSecret(),
   )
      .update(
         `shared-trip:${signedValue}`,
      )
      .digest();
}

function encodeSnapshot(
   snapshot: SharedTripSnapshot,
): string {
   const serialized =
      JSON.stringify(snapshot);

   if (
      Buffer.byteLength(
         serialized,
         "utf8",
      ) >
      sharedTripLimits.maximumSnapshotJsonBytes
   ) {
      throw new Error(
         "The shared-trip snapshot is too large.",
      );
   }

   const compressed = deflateRawSync(
      Buffer.from(
         serialized,
         "utf8",
      ),
      {
         level: 9,
      },
   );

   if (
      compressed.byteLength >
      sharedTripLimits.maximumCompressedPayloadBytes
   ) {
      throw new Error(
         "The compressed shared-trip snapshot is too large.",
      );
   }

   return compressed.toString(
      "base64url",
   );
}

function decodeSnapshot(
   encodedPayload: string,
): unknown {
   if (
      !base64UrlSegmentPattern.test(
         encodedPayload,
      )
   ) {
      throw new Error(
         "The shared-trip payload encoding is invalid.",
      );
   }

   const compressed = Buffer.from(
      encodedPayload,
      "base64url",
   );

   if (
      compressed.byteLength === 0 ||
      compressed.byteLength >
         sharedTripLimits.maximumCompressedPayloadBytes
   ) {
      throw new Error(
         "The shared-trip payload is outside the supported size.",
      );
   }

   const inflated = inflateRawSync(
      compressed,
      {
         maxOutputLength:
            sharedTripLimits.maximumSnapshotJsonBytes,
      },
   );

   if (
      inflated.byteLength === 0 ||
      inflated.byteLength >
         sharedTripLimits.maximumSnapshotJsonBytes
   ) {
      throw new Error(
         "The shared-trip payload expanded beyond the supported size.",
      );
   }

   return JSON.parse(
      inflated.toString("utf8"),
   ) as unknown;
}

export function createSharedTripToken(
   snapshot: SharedTripSnapshot,
): string {
   if (
      !isSharedTripSnapshot(snapshot)
   ) {
      throw new Error(
         "The shared-trip snapshot is invalid.",
      );
   }

   const encodedPayload =
      encodeSnapshot(snapshot);

   const signedValue =
      `${sharedTripTokenVersion}.${encodedPayload}`;

   const signature =
      createSignature(signedValue).toString(
         "base64url",
      );

   const token =
      `${signedValue}.${signature}`;

   if (
      token.length >
      sharedTripLimits.maximumTokenLength
   ) {
      throw new Error(
         "The shared-trip token is too large.",
      );
   }

   return token;
}

export function verifySharedTripToken(
   token: string,
): SharedTripTokenVerification {
   if (
      token.length === 0 ||
      token.length >
         sharedTripLimits.maximumTokenLength ||
      token.trim() !== token
   ) {
      return {
         ok: false,
         reason: "invalid",
      };
   }

   const segments = token.split(".");

   if (segments.length !== 3) {
      return {
         ok: false,
         reason: "invalid",
      };
   }

   const [
      version,
      encodedPayload,
      encodedSignature,
   ] = segments;

   if (
      version !==
         sharedTripTokenVersion ||
      !encodedPayload ||
      !encodedSignature ||
      !base64UrlSegmentPattern.test(
         encodedPayload,
      ) ||
      !base64UrlSegmentPattern.test(
         encodedSignature,
      )
   ) {
      return {
         ok: false,
         reason: "invalid",
      };
   }

   try {
      const providedSignature =
         Buffer.from(
            encodedSignature,
            "base64url",
         );

      const expectedSignature =
         createSignature(
            `${version}.${encodedPayload}`,
         );

      if (
         providedSignature.length !==
            expectedSignature.length ||
         !timingSafeEqual(
            providedSignature,
            expectedSignature,
         )
      ) {
         return {
            ok: false,
            reason: "invalid",
         };
      }

      const decodedValue =
         decodeSnapshot(
            encodedPayload,
         );

      if (
         !isSharedTripSnapshot(
            decodedValue,
         )
      ) {
         return {
            ok: false,
            reason: "invalid",
         };
      }

      if (
         Date.parse(
            decodedValue.expiresAt,
         ) <= Date.now()
      ) {
         return {
            ok: false,
            reason: "expired",
         };
      }

      return {
         ok: true,
         snapshot: decodedValue,
      };
   } catch (error: unknown) {
      if (
         error instanceof
         SharedTripConfigurationError
      ) {
         throw error;
      }

      return {
         ok: false,
         reason: "invalid",
      };
   }
}
