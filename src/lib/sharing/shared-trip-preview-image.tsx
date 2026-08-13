import { ImageResponse } from "next/og";

import { getSharedTripRouteLabel, getSharedTripStopCount } from "@/lib/sharing/shared-trip-preview-summary";
import type { SharedTripSnapshot } from "@/types/shared-trip";

export const sharedTripPreviewSize = {
   width: 1200,
   height: 630,
} as const;

export function createSharedTripPreviewImage(snapshot: SharedTripSnapshot, iconUrl: string): ImageResponse {
   const routeLabel = getSharedTripRouteLabel(snapshot);

   const stopCount = getSharedTripStopCount(snapshot);

   const detailLine = `${snapshot.days.length} ${snapshot.days.length === 1 ? "day" : "days"} · ${stopCount} ${stopCount === 1 ? "stop" : "stops"}`;

   return new ImageResponse(
      <div
         style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 68px",
            background: "#f7f4ed",
            color: "#1f211d",
            fontFamily: "Arial, Helvetica, sans-serif",
         }}
      >
         <div
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "space-between",
            }}
         >
            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
               }}
            >
               <img alt="" src={iconUrl} width="78" height="78" style={{ borderRadius: "20px" }} />

               <div
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     gap: "4px",
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        fontSize: "31px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                     }}
                  >
                     SIDEWALK
                  </div>

                  <div
                     style={{
                        display: "flex",
                        fontSize: "16px",
                        letterSpacing: "0.18em",
                        color: "#66685f",
                     }}
                  >
                     A KIN CITY GUIDE
                  </div>
               </div>
            </div>

            <div
               style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  border: "1px solid #d2cec2",
                  borderRadius: "999px",
                  fontSize: "17px",
                  color: "#66685f",
               }}
            >
               SHARED TRIP
            </div>
         </div>

         <div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: "16px",
               maxWidth: "1040px",
            }}
         >
            <div
               style={{
                  display: "flex",
                  fontSize: snapshot.title.length > 34 ? "54px" : "66px",
                  lineHeight: 1.02,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
               }}
            >
               {snapshot.title}
            </div>

            <div
               style={{
                  display: "flex",
                  fontSize: "28px",
                  lineHeight: 1.25,
                  color: "#4f5943",
               }}
            >
               {routeLabel}
            </div>
         </div>

         <div
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "space-between",
               paddingTop: "22px",
               borderTop: "1px solid #d2cec2",
            }}
         >
            <div
               style={{
                  display: "flex",
                  fontSize: "23px",
                  color: "#3d4038",
               }}
            >
               {detailLine}
            </div>

            <div
               style={{
                  display: "flex",
                  fontSize: "18px",
                  color: "#7a6b55",
               }}
            >
               Make today worth remembering.
            </div>
         </div>
      </div>,
      sharedTripPreviewSize,
   );
}
