import type { Metadata } from "next";

import { InfoPageShell } from "@/components/layout/info-page-shell";

export const metadata: Metadata = {
   title: "About Sidewalk",
   description: "Why Sidewalk is built around one worthwhile experience instead of endless browsing.",
};

export default function AboutPage() {
   return (
      <InfoPageShell eyebrow="About Sidewalk" title="Choose a day worth remembering." introduction="Sidewalk is a selective city guide for turning a neighborhood, a date, and a few directions into a day that feels considered rather than overplanned.">
         <section>
            <h2>Less searching. Better choosing.</h2>

            <p>
               Sidewalk is designed around a simple idea: a city guide should help you choose one worthwhile experience, not overwhelm you with every available option. Recommendations stay intentionally limited, and Sidewalk explains why a place may fit
               the part of the day you are planning.
            </p>
         </section>

         <section>
            <h2>Days can become trips.</h2>

            <p>A finished day can stay on its own or become part of a Trip Folio. Trip Folios support multiple days, neighborhoods, and metros while keeping the planning experience focused on the day in front of you.</p>
         </section>

         <section>
            <h2>Built by Kin.</h2>

            <p>Sidewalk is a Kin Software product. Its interface is intentionally calm, accessible, photography-forward, and designed to respect attention.</p>
         </section>
      </InfoPageShell>
   );
}
