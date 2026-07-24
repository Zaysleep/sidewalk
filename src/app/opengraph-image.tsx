import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site/site-config";

export const alt = "Sidewalk — A Kin City Guide";

export const size = {
   width: 1200,
   height: 630,
};

export const contentType = "image/png";

/**
 * Generated at build/runtime so Sidewalk does not need a separate social image
 * asset before launch.
 */
export default function OpenGraphImage() {
   return new ImageResponse(
      (
         <div
            style={{
               width: "100%",
               height: "100%",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               background:
                  "linear-gradient(135deg, #fbf8f0 0%, #f1eadb 100%)",
               color: "#26301f",
               padding: "72px",
            }}
         >
            <div
               style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                     "space-between",
                  border: "2px solid #d7cbb8",
                  background:
                     "rgba(255, 253, 248, 0.82)",
                  padding: "64px",
               }}
            >
               <div
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     maxWidth: "760px",
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        fontSize: "24px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#687553",
                        marginBottom: "28px",
                     }}
                  >
                     A Kin City Guide
                  </div>

                  <div
                     style={{
                        display: "flex",
                        fontSize: "92px",
                        lineHeight: 0.94,
                        fontWeight: 700,
                        letterSpacing: "-0.055em",
                        marginBottom: "34px",
                     }}
                  >
                     Sidewalk
                  </div>

                  <div
                     style={{
                        display: "flex",
                        fontSize: "32px",
                        lineHeight: 1.35,
                        color: "#5f6159",
                     }}
                  >
                     {siteConfig.description}
                  </div>
               </div>

               <div
                  style={{
                     width: "250px",
                     height: "250px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     border: "10px solid #526141",
                     borderRadius: "999px",
                     color: "#526141",
                     fontSize: "138px",
                     fontWeight: 700,
                     lineHeight: 1,
                     boxShadow:
                        "inset 0 0 0 8px #c6934a",
                  }}
               >
                  S
               </div>
            </div>
         </div>
      ),
      size,
   );
}
