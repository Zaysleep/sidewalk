import { NextResponse } from "next/server";

import { localAreas } from "@/data/geography/local-areas";
import { municipalities } from "@/data/geography/municipalities";
import { metroRegions } from "@/data/metros/metro-regions";
import { getGooglePlacesRecommendation } from "@/lib/places/google-places-provider";
import { activityDirections, activityKinds, type ActivityDirection, type ActivityKind } from "@/types/activity";
import type { LiveRecommendationErrorResponse, LiveRecommendationRequest, LiveRecommendationResponse } from "@/types/live-recommendation";

export const runtime = "nodejs";

function isActivityDirection(value: unknown): value is ActivityDirection {
   return typeof value === "string" && activityDirections.includes(value as ActivityDirection);
}

function hashString(value: string): number {
   let hash = 0;

   for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
   }

   return hash;
}

/**
 * Sidewalk Choice remains stable for the same area instead of changing on
 * every render or request.
 */
function resolveActivity(direction: ActivityDirection, localAreaId: string): ActivityKind {
   if (direction !== "sidewalk-choice") {
      return direction;
   }

   const selectedIndex = hashString(localAreaId) % activityKinds.length;

   return activityKinds[selectedIndex];
}

function errorResponse(error: string, status: number) {
   const body: LiveRecommendationErrorResponse = {
      error,
   };

   return NextResponse.json(body, {
      status,
   });
}

export async function POST(request: Request) {
   let body: Partial<LiveRecommendationRequest>;

   try {
      body = (await request.json()) as Partial<LiveRecommendationRequest>;
   } catch {
      return errorResponse("The recommendation request was not valid JSON.", 400);
   }

   if (typeof body.metroRegionId !== "string" || typeof body.municipalityId !== "string" || typeof body.localAreaId !== "string" || !isActivityDirection(body.activityDirection)) {
      return errorResponse("The recommendation request is incomplete.", 400);
   }

   const metroRegion = metroRegions.find((candidate) => candidate.id === body.metroRegionId) ?? null;

   const municipality = municipalities.find((candidate) => candidate.id === body.municipalityId) ?? null;

   const localArea = localAreas.find((candidate) => candidate.id === body.localAreaId) ?? null;

   if (!metroRegion || !municipality || !localArea) {
      return errorResponse("The selected geography could not be found.", 404);
   }

   if (municipality.metroRegionId !== metroRegion.id || localArea.municipalityId !== municipality.id) {
      return errorResponse("The selected geography does not belong to one consistent Sidewalk region.", 400);
   }

   const resolvedActivity = resolveActivity(body.activityDirection, localArea.id);

   try {
      const recommendation = await getGooglePlacesRecommendation({
         metroRegionId: metroRegion.id,

         metroRegionName: metroRegion.name,

         municipalityId: municipality.id,

         municipalityName: municipality.name,

         stateOrRegion: municipality.stateOrRegion,

         localAreaId: localArea.id,

         localAreaName: localArea.name,

         activity: resolvedActivity,
      });

      const responseBody: LiveRecommendationResponse = {
         recommendation,
         resolvedActivity,
      };

      return NextResponse.json(responseBody, {
         status: 200,
      });
   } catch (error) {
      const message = error instanceof Error ? error.message : "The places provider could not complete the request.";

      console.error("Sidewalk places provider error:", message);

      return errorResponse("Sidewalk could not load places right now.", 502);
   }
}
