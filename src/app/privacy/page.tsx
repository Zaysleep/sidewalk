import type { Metadata } from "next";

import { InfoPageShell } from "@/components/layout/info-page-shell";

export const metadata: Metadata = {
   title: "Sidewalk Privacy",
   description: "How Sidewalk handles browser plans, shared trips, Google Places requests, and anonymous product signals.",
};

export default function PrivacyPage() {
   return (
      <InfoPageShell
         eyebrow="Privacy"
         title="Keep the useful parts. Leave the profile behind."
         introduction="Sidewalk is built without user accounts, advertising profiles, or cross-site behavioral tracking. It keeps only the information needed to plan, share, and improve the product."
      >
         <section>
            <h2>Your planning state</h2>

            <p>Active days and Trip Folios are stored in your browser so they can survive normal refreshes and reopenings. Sidewalk does not currently sync those private planning records across accounts or devices.</p>
         </section>

         <section>
            <h2>Shared trips</h2>

            <p>When you explicitly create a shared Trip Folio link, Sidewalk stores a read-only trip snapshot in its server-side Upstash data store. The snapshot is available to anyone who has the link and is configured to expire after 30 days.</p>

            <p>Creating a new snapshot does not make your private browser Trip Folio public, and recipients cannot edit the original plan.</p>
         </section>

         <section>
            <h2>Place recommendations</h2>

            <p>
               Sidewalk uses server-side Google Places requests to find and evaluate places for the metro, municipality, neighborhood, date, time period, and activity direction being planned. Sidewalk&apos;s private browser storage is not sent to Google
               as an account profile.
            </p>
         </section>

         <section>
            <h2>Anonymous product signals</h2>

            <p>Sidewalk keeps lightweight daily aggregate counters for a small set of product actions such as selecting a metro, changing a neighborhood, adding a stop, completing a day, sharing a trip, or using recommendation feedback.</p>

            <p>
               These counters do not contain an account ID, persistent browser identifier, advertising ID, place ID, or free-form text. Sidewalk stores aggregate counts rather than a browsable personal activity history, with a 90-day retention window.
               Browsers that send the Do Not Track setting are excluded from this product-signal collection.
            </p>
         </section>

         <section>
            <h2>No advertising profile</h2>

            <p>Sidewalk does not sell personal data, build advertising audiences, or use the planning experience to create a behavioral profile for advertisers.</p>
         </section>
      </InfoPageShell>
   );
}
