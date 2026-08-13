import { NextResponse } from "next/server";

import { productSignalEvents, type ProductSignalEvent } from "@/lib/analytics/product-signal-client";
import { incrementProductSignal } from "@/lib/analytics/product-signal-store";

export const runtime = "nodejs";
export const maxDuration = 5;

const maximumRequestBytes = 2_048;

const allowedDimensionKeys = new Set(["metroSlug", "localAreaId", "period", "reason", "count", "dayCount", "stopCount"]);

const allowedEvents = new Set<string>(productSignalEvents);

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
   if (typeof value !== "string") {
      return null;
   }

   const clean = value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 80);

   return clean || null;
}

function cleanCount(value: unknown): number | null {
   if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
      return null;
   }

   return value;
}

function cleanDimensions(value: unknown): Readonly<Record<string, string | number>> {
   if (!isRecord(value)) {
      return {};
   }

   const clean: Record<string, string | number> = {};

   Object.entries(value).forEach(([key, rawValue]) => {
      if (!allowedDimensionKeys.has(key)) {
         return;
      }

      if (key === "count" || key === "dayCount" || key === "stopCount") {
         const count = cleanCount(rawValue);

         if (count !== null) {
            clean[key] = count;
         }

         return;
      }

      const stringValue = cleanString(rawValue);

      if (stringValue) {
         clean[key] = stringValue;
      }
   });

   return clean;
}

export async function POST(request: Request) {
   const contentLength = Number(request.headers.get("content-length") ?? "0");

   if (Number.isFinite(contentLength) && contentLength > maximumRequestBytes) {
      return NextResponse.json(
         {
            error: "Signal payload is too large.",
         },
         {
            status: 413,
         },
      );
   }

   let body: unknown;

   try {
      body = await request.json();
   } catch {
      return NextResponse.json(
         {
            error: "Signal payload is invalid.",
         },
         {
            status: 400,
         },
      );
   }

   if (!isRecord(body) || typeof body.event !== "string" || !allowedEvents.has(body.event)) {
      return NextResponse.json(
         {
            error: "Signal event is invalid.",
         },
         {
            status: 400,
         },
      );
   }

   const event = body.event as ProductSignalEvent;

   const dimensions = cleanDimensions(body.dimensions);

   try {
      await incrementProductSignal(event, dimensions);
   } catch (error: unknown) {
      /**
       * Signals are intentionally best-effort. A metrics outage must not
       * change recommendations, planning state, or sharing.
       */
      console.warn("Sidewalk product signal unavailable", {
         event,
         errorName: error instanceof Error ? error.name : "UnknownError",
      });
   }

   return new NextResponse(null, {
      status: 204,
      headers: {
         "Cache-Control": "no-store",
         "Referrer-Policy": "no-referrer",
         "X-Content-Type-Options": "nosniff",
      },
   });
}
