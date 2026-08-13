import type { Metadata } from "next";

import { InfoPageShell } from "@/components/layout/info-page-shell";

export const metadata: Metadata = {
   title: "Send Sidewalk Feedback",
   description: "Tell Kin Software what felt useful, confusing, thin, or wrong in Sidewalk.",
};

export default function FeedbackPage() {
   return (
      <InfoPageShell eyebrow="Send feedback" title="Something off? Say so." introduction="Useful feedback is specific: a neighborhood felt thin, a recommendation did not fit, something was confusing, or a part of the trip flow worked especially well.">
         <section>
            <h2>What helps most</h2>

            <ul>
               <li>The metro, municipality, or neighborhood you were planning.</li>
               <li>What you expected Sidewalk to do.</li>
               <li>What happened instead.</li>
               <li>The device or browser if the issue looked visual or interactive.</li>
            </ul>
         </section>

         <section>
            <h2>Send it to Kin</h2>

            <p>Sidewalk feedback is handled through Kin Software so the product can stay focused instead of growing a separate support system.</p>

            <p>
               <a href="https://kin-gold.vercel.app/#contact" target="_blank" rel="noreferrer noopener">
                  Open the Kin Software contact page
               </a>
            </p>
         </section>
      </InfoPageShell>
   );
}
