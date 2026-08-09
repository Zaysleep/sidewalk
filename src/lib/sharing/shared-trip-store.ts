import "server-only";

import {
   randomBytes,
} from "node:crypto";

import {
   isSharedTripSnapshot,
} from "@/lib/sharing/shared-trip-schema";
import {
   sharedTripLimits,
   type SharedTripSnapshot,
} from "@/types/shared-trip";

const sharedTripKeyPrefix =
   "sidewalk:shared-trip:";

const shortSharedTripTokenPattern =
   /^s1_[A-Za-z0-9_-]{16}$/;

const requestTimeoutMilliseconds =
   5_000;

type RedisRestResponse = Readonly<{
   result?: unknown;
   error?: unknown;
}>;

export class SharedTripStoreConfigurationError extends Error {
   constructor() {
      super(
         "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for short trip links.",
      );

      this.name =
         "SharedTripStoreConfigurationError";
   }
}

export class SharedTripStoreRequestError extends Error {
   constructor(
      message =
         "The shared-trip store request failed.",
   ) {
      super(message);

      this.name =
         "SharedTripStoreRequestError";
   }
}

export type SharedTripStoreReadResult =
   | Readonly<{
        status: "ready";
        snapshot: SharedTripSnapshot;
     }>
   | Readonly<{
        status:
           | "missing"
           | "invalid"
           | "expired";
     }>;

function getRedisConfiguration(): Readonly<{
   url: string;
   token: string;
}> {
   const url =
      process.env.UPSTASH_REDIS_REST_URL?.trim();

   const token =
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

   if (!url || !token) {
      throw new SharedTripStoreConfigurationError();
   }

   return {
      url: url.replace(/\/+$/, ""),
      token,
   };
}

function createShortTripToken(): string {
   return `s1_${randomBytes(12).toString("base64url")}`;
}

export function isShortSharedTripToken(
   value: string,
): boolean {
   return shortSharedTripTokenPattern.test(
      value,
   );
}

async function executeRedisCommand(
   command: readonly (
      | string
      | number
   )[],
): Promise<unknown> {
   const configuration =
      getRedisConfiguration();

   const controller =
      new AbortController();

   const timeout = setTimeout(
      () => controller.abort(),
      requestTimeoutMilliseconds,
   );

   try {
      const response = await fetch(
         configuration.url,
         {
            method: "POST",
            headers: {
               Authorization:
                  `Bearer ${configuration.token}`,
               "Content-Type":
                  "application/json",
            },
            body: JSON.stringify(
               command,
            ),
            cache: "no-store",
            signal: controller.signal,
         },
      );

      let payload: RedisRestResponse | null =
         null;

      try {
         payload =
            (await response.json()) as RedisRestResponse;
      } catch {
         // Stable store errors are raised below.
      }

      if (
         !response.ok ||
         !payload ||
         payload.error
      ) {
         throw new SharedTripStoreRequestError();
      }

      return payload.result;
   } catch (error: unknown) {
      if (
         error instanceof
            SharedTripStoreConfigurationError ||
         error instanceof
            SharedTripStoreRequestError
      ) {
         throw error;
      }

      throw new SharedTripStoreRequestError();
   } finally {
      clearTimeout(timeout);
   }
}

export async function saveSharedTripSnapshot(
   snapshot: SharedTripSnapshot,
): Promise<string> {
   if (!isSharedTripSnapshot(snapshot)) {
      throw new SharedTripStoreRequestError(
         "The shared-trip snapshot is invalid.",
      );
   }

   const token =
      createShortTripToken();

   const key =
      `${sharedTripKeyPrefix}${token}`;

   const ttlSeconds =
      sharedTripLimits.expirationDays *
      24 *
      60 *
      60;

   const result =
      await executeRedisCommand([
         "SET",
         key,
         JSON.stringify(snapshot),
         "EX",
         ttlSeconds,
      ]);

   if (result !== "OK") {
      throw new SharedTripStoreRequestError();
   }

   return token;
}

export async function readSharedTripSnapshot(
   token: string,
): Promise<SharedTripStoreReadResult> {
   if (!isShortSharedTripToken(token)) {
      return {
         status: "invalid",
      };
   }

   const key =
      `${sharedTripKeyPrefix}${token}`;

   const result =
      await executeRedisCommand([
         "GET",
         key,
      ]);

   if (result === null) {
      return {
         status: "missing",
      };
   }

   if (typeof result !== "string") {
      return {
         status: "invalid",
      };
   }

   try {
      const parsed: unknown =
         JSON.parse(result);

      if (
         !isSharedTripSnapshot(parsed)
      ) {
         return {
            status: "invalid",
         };
      }

      if (
         Date.parse(parsed.expiresAt) <=
         Date.now()
      ) {
         return {
            status: "expired",
         };
      }

      return {
         status: "ready",
         snapshot: parsed,
      };
   } catch {
      return {
         status: "invalid",
      };
   }
}
