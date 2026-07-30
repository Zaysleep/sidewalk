import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

import { isSharedDaySnapshot } from "@/lib/sharing/shared-day-schema";
import { sharedDayLimits, type SharedDaySnapshot } from "@/types/shared-day";

const sharedDayTokenVersion = "v1";

const minimumSecretLength = 32;

const maximumInflatedBytes = sharedDayLimits.maximumSnapshotJsonBytes;

export class SharedDayConfigurationError extends Error {
   constructor() {
      super("SIDEWALK_SHARE_SECRET must contain at least 32 characters.");

      this.name = "SharedDayConfigurationError";
   }
}

export type SharedDayTokenVerification =
   | Readonly<{
        ok: true;
        snapshot: SharedDaySnapshot;
     }>
   | Readonly<{
        ok: false;
        reason: "invalid" | "expired";
     }>;

function getShareSecret(): string {
   const secret = process.env.SIDEWALK_SHARE_SECRET?.trim();

   if (!secret || secret.length < minimumSecretLength) {
      throw new SharedDayConfigurationError();
   }

   return secret;
}

function createSignature(signedValue: string): Buffer {
   return createHmac("sha256", getShareSecret()).update(signedValue).digest();
}

function encodeSnapshot(snapshot: SharedDaySnapshot): string {
   const serializedSnapshot = JSON.stringify(snapshot);

   const serializedBytes = Buffer.byteLength(serializedSnapshot, "utf8");

   if (serializedBytes > sharedDayLimits.maximumSnapshotJsonBytes) {
      throw new Error("The shared-day snapshot is too large.");
   }

   return deflateRawSync(Buffer.from(serializedSnapshot, "utf8"), {
      level: 9,
   }).toString("base64url");
}

function decodeSnapshot(encodedPayload: string): unknown {
   const compressedPayload = Buffer.from(encodedPayload, "base64url");

   const inflatedPayload = inflateRawSync(compressedPayload, {
      maxOutputLength: maximumInflatedBytes,
   });

   return JSON.parse(inflatedPayload.toString("utf8")) as unknown;
}

export function createSharedDayToken(snapshot: SharedDaySnapshot): string {
   if (!isSharedDaySnapshot(snapshot)) {
      throw new Error("The shared-day snapshot is invalid.");
   }

   const encodedPayload = encodeSnapshot(snapshot);

   const signedValue = `${sharedDayTokenVersion}.${encodedPayload}`;

   const signature = createSignature(signedValue).toString("base64url");

   const token = `${signedValue}.${signature}`;

   if (token.length > sharedDayLimits.maximumTokenLength) {
      throw new Error("The shared-day token is too large.");
   }

   return token;
}

export function verifySharedDayToken(token: string): SharedDayTokenVerification {
   if (token.length === 0 || token.length > sharedDayLimits.maximumTokenLength) {
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

   const [version, encodedPayload, encodedSignature] = segments;

   if (version !== sharedDayTokenVersion || !encodedPayload || !encodedSignature) {
      return {
         ok: false,
         reason: "invalid",
      };
   }

   try {
      const providedSignature = Buffer.from(encodedSignature, "base64url");

      const expectedSignature = createSignature(`${version}.${encodedPayload}`);

      if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(providedSignature, expectedSignature)) {
         return {
            ok: false,
            reason: "invalid",
         };
      }

      const decodedValue = decodeSnapshot(encodedPayload);

      if (!isSharedDaySnapshot(decodedValue)) {
         return {
            ok: false,
            reason: "invalid",
         };
      }

      if (Date.parse(decodedValue.expiresAt) <= Date.now()) {
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
      if (error instanceof SharedDayConfigurationError) {
         throw error;
      }

      return {
         ok: false,
         reason: "invalid",
      };
   }
}
