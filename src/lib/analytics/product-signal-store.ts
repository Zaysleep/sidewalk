import "server-only";

const signalKeyPrefix = "sidewalk:signals:";

const signalRetentionSeconds = 90 * 24 * 60 * 60;

type RedisRestResponse = Readonly<{
   result?: unknown;
   error?: unknown;
}>;

function getRedisConfiguration(): Readonly<{
   url: string;
   token: string;
}> {
   const url = process.env.UPSTASH_REDIS_REST_URL?.trim();

   const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

   if (!url || !token) {
      throw new Error("Sidewalk product signals are not configured.");
   }

   return {
      url: url.replace(/\/+$/, ""),
      token,
   };
}

async function executeRedisCommand(command: readonly (string | number)[]): Promise<unknown> {
   const configuration = getRedisConfiguration();

   const response = await fetch(configuration.url, {
      method: "POST",
      headers: {
         Authorization: `Bearer ${configuration.token}`,
         "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
   });

   const payload = (await response.json()) as RedisRestResponse;

   if (!response.ok || payload.error) {
      throw new Error("Sidewalk could not store a product signal.");
   }

   return payload.result;
}

function getUtcDayKey(date = new Date()): string {
   return date.toISOString().slice(0, 10);
}

function createAggregateField(event: string, dimensions: Readonly<Record<string, string | number>>): string {
   const dimensionText = Object.entries(dimensions)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, value]) => `${key}=${value}`)
      .join("|");

   return dimensionText ? `${event}|${dimensionText}` : event;
}

/**
 * Daily aggregate counters only. There is no per-event record and no
 * individual identifier stored alongside these counts.
 */
export async function incrementProductSignal(event: string, dimensions: Readonly<Record<string, string | number>>): Promise<void> {
   const key = `${signalKeyPrefix}${getUtcDayKey()}`;

   const field = createAggregateField(event, dimensions);

   await executeRedisCommand(["HINCRBY", key, field, 1]);

   await executeRedisCommand(["EXPIRE", key, signalRetentionSeconds]);
}
