import type { Metadata } from "next";

import { InfoPageShell } from "@/components/layout/info-page-shell";

export const metadata: Metadata = {
   title: "Sidewalk Terms",
   description: "Basic terms for using Sidewalk recommendations and shared trip links.",
};

export default function TermsPage() {
   return (
      <InfoPageShell eyebrow="Terms" title="A guide, not a guarantee." introduction="Sidewalk helps shape a worthwhile day, but places, hours, prices, availability, routes, and local conditions can change.">
         <section>
            <h2>Use Sidewalk as a planning guide.</h2>

            <p>
               Recommendations and trip plans are provided for general planning purposes. Before traveling, verify details that matter to you, especially current hours, closures, accessibility, admission requirements, route conditions, and time-sensitive
               availability.
            </p>
         </section>

         <section>
            <h2>Shared links are snapshots.</h2>

            <p>A shared Trip Folio is a read-only snapshot created at the moment you choose to share it. Editing your private Trip Folio later does not silently rewrite an already shared snapshot.</p>
         </section>

         <section>
            <h2>Third-party services.</h2>

            <p>Sidewalk can link to mapping, place, and other third-party services. Those services control their own content, availability, terms, and privacy practices.</p>
         </section>

         <section>
            <h2>Reasonable use.</h2>

            <p>Do not misuse Sidewalk, attempt to defeat its safeguards, interfere with other users, or use shared links to distribute unlawful or abusive material.</p>

            <p>Effective August 13, 2026.</p>
         </section>
      </InfoPageShell>
   );
}
