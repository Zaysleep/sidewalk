import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SharedDayPhoto } from "@/components/sharing/shared-day-photo";
import { verifySharedDayToken } from "@/lib/sharing/shared-day-token";
import { siteConfig } from "@/lib/site/site-config";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { SharedDaySnapshot, SharedDayStop } from "@/types/shared-day";

import styles from "./shared-day.module.css";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type SharedDayPageProps = Readonly<{
   params: Promise<{
      token: string;
   }>;
}>;

type SharedDayReadResult =
   | Readonly<{
        status: "ready";
        snapshot: SharedDaySnapshot;
     }>
   | Readonly<{
        status: "invalid" | "expired" | "unavailable";
     }>;

function readSharedDay(token: string): SharedDayReadResult {
   try {
      const verification = verifySharedDayToken(token);

      if (!verification.ok) {
         return {
            status: verification.reason,
         };
      }

      return {
         status: "ready",
         snapshot: verification.snapshot,
      };
   } catch {
      return {
         status: "unavailable",
      };
   }
}

function formatPlanningDate(planningDate: string): string {
   const [yearText, monthText, dayText] = planningDate.split("-");

   return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
   }).format(new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText))));
}

function formatExpirationDate(expiresAt: string): string {
   return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
   }).format(new Date(expiresAt));
}

function getPeriodLabel(period: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === period)?.label ?? period;
}

function sortStops(stops: readonly SharedDayStop[]): readonly SharedDayStop[] {
   return dayPeriods.flatMap((period) => {
      const stop = stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });
}

function formatSharedDayPlace(snapshot: SharedDaySnapshot): string {
   const geography = snapshot.geography;
   const regionName = "regionName" in geography && geography.regionName ? geography.regionName : geography.stateOrRegion;

   return `${geography.municipalityName}, ${regionName}`;
}

function createPageDescription(snapshot: SharedDaySnapshot): string {
   const stopLabel = snapshot.stops.length === 1 ? "stop" : "stops";

   return `A thoughtfully planned ${snapshot.stops.length}-${stopLabel} Sidewalk day in ${snapshot.geography.localAreaName}, ${snapshot.geography.municipalityName}.`;
}

function createSharedDayMetadataTitle(snapshot: SharedDaySnapshot): string {
   return `A Day in ${snapshot.geography.localAreaName}`;
}

function createSimilarDayHref(snapshot: SharedDaySnapshot): string {
   const orderedPeriods = sortStops(snapshot.stops).map((stop) => stop.dayPeriod);

   const searchParams = new URLSearchParams({
      similar: "1",
      metro: snapshot.geography.metroSlug,
      municipality: snapshot.geography.municipalityId,
      area: snapshot.geography.localAreaId,
      periods: orderedPeriods.join(","),
   });

   return `/?${searchParams.toString()}`;
}

export async function generateMetadata({ params }: SharedDayPageProps): Promise<Metadata> {
   const { token } = await params;

   const result = readSharedDay(token);

   const privateSharedPageMetadata: Pick<Metadata, "robots" | "referrer"> = {
      robots: {
         index: false,
         follow: false,
      },
      referrer: "no-referrer",
   };

   if (result.status !== "ready") {
      const title = result.status === "expired" ? "Shared day expired" : result.status === "unavailable" ? "Sharing unavailable" : "Shared day unavailable";

      return {
         ...privateSharedPageMetadata,
         title,
         description: "This shared Sidewalk day is not available.",
      };
   }

   const title = createSharedDayMetadataTitle(result.snapshot);

   const description = createPageDescription(result.snapshot);

   return {
      ...privateSharedPageMetadata,
      title,
      description,
      openGraph: {
         type: "website",
         locale: siteConfig.locale,
         siteName: siteConfig.name,
         title: `${title} | ${siteConfig.name}`,
         description,
         url: new URL(`/day/${token}`, siteConfig.url),
      },
      twitter: {
         card: "summary",
         title: `${title} | ${siteConfig.name}`,
         description,
      },
   };
}

function SharedDayUnavailable({ status }: Readonly<{ status: Exclude<SharedDayReadResult["status"], "ready"> }>) {
   const copy =
      status === "expired"
         ? {
              eyebrow: "Shared day expired",
              title: "This day is no longer available.",
              description: "Shared Sidewalk days stay available for a limited time. The original plan remains private to the person who created it.",
           }
         : status === "unavailable"
           ? {
                eyebrow: "Sharing unavailable",
                title: "Sidewalk cannot open this day right now.",
                description: "The sharing service is temporarily unavailable. The link has not changed the original plan.",
             }
           : {
                eyebrow: "Shared day unavailable",
                title: "This link doesn’t look right.",
                description: "The link may be incomplete or may have been changed. Sidewalk could not verify the shared itinerary.",
             };

   return (
      <>
         <header className={styles.masthead}>
            <Link className={styles.brandGroup} href="/" aria-label="Sidewalk home">
               <span className={styles.brand}>Sidewalk</span>
               <span className={styles.edition}>A Kin city guide</span>
            </Link>
         </header>

         <main id="main-content" className={styles.unavailableMain} tabIndex={-1}>
            <section className={styles.unavailableCard} aria-labelledby="shared-day-unavailable-title">
               <p className={styles.eyebrow}>{copy.eyebrow}</p>

               <h1 id="shared-day-unavailable-title" className={styles.unavailableTitle}>
                  {copy.title}
               </h1>

               <p className={styles.unavailableDescription}>{copy.description}</p>

               <Link className={styles.returnLink} href="/">
                  Return to Sidewalk
               </Link>
            </section>
         </main>

         <SiteFooter />
      </>
   );
}

export default async function SharedDayPage({ params }: SharedDayPageProps) {
   const { token } = await params;

   const result = readSharedDay(token);

   if (result.status !== "ready") {
      return <SharedDayUnavailable status={result.status} />;
   }

   const { snapshot } = result;

   const orderedStops = sortStops(snapshot.stops);

   const pageTitle = createSharedDayMetadataTitle(snapshot);

   const pageDescription = createPageDescription(snapshot);

   const similarDayHref = createSimilarDayHref(snapshot);

   return (
      <>
         <header className={styles.masthead}>
            <Link className={styles.brandGroup} href="/" aria-label="Sidewalk home">
               <span className={styles.brand}>Sidewalk</span>
               <span className={styles.edition}>A Kin city guide</span>
            </Link>

            <p className={styles.mastheadNote}>Shared itinerary</p>
         </header>

         <main id="main-content" className={styles.main} tabIndex={-1}>
            <article className={styles.story} aria-labelledby="shared-day-title">
               <header className={styles.hero}>
                  <p className={styles.eyebrow}>A shared Sidewalk day</p>

                  <h1 id="shared-day-title" className={styles.title}>
                     {pageTitle}
                  </h1>

                  <p className={styles.date}>{formatPlanningDate(snapshot.planningDate)}</p>

                  <p className={styles.introduction}>{pageDescription}</p>

                  <p className={styles.geography}>{formatSharedDayPlace(snapshot)}</p>
               </header>

               <ol className={styles.itinerary} aria-label={`Itinerary for ${pageTitle}`}>
                  {orderedStops.map((stop, index) => {
                     const periodLabel = getPeriodLabel(stop.dayPeriod);

                     return (
                        <li key={`${stop.dayPeriod}-${stop.placeId}`} className={styles.itineraryItem}>
                           <article className={styles.stop} aria-labelledby={`shared-stop-${index}`}>
                              <div className={styles.stopCopy}>
                                 <header className={styles.stopHeading}>
                                    <div>
                                       <p className={styles.period}>{periodLabel}</p>

                                       <h2 id={`shared-stop-${index}`} className={styles.placeName}>
                                          {stop.placeName}
                                       </h2>
                                    </div>

                                    <p className={styles.window}>{stop.bestWindow}</p>
                                 </header>

                                 {stop.summary ? <p className={styles.summary}>{stop.summary}</p> : null}

                                 {stop.reason ? <p className={styles.reason}>{stop.reason}</p> : null}

                                 <div className={styles.stopFooter}>
                                    {stop.locationUrl ? (
                                       <a className={styles.locationLink} href={stop.locationUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer" aria-label={`Open ${stop.placeName} location in a new tab`}>
                                          Open location
                                       </a>
                                    ) : null}
                                 </div>
                              </div>

                              <SharedDayPhoto resourceName={stop.photoResourceName} placeName={stop.placeName} className={styles.photo} fallbackClassName={styles.photoFallback} priority={index === 0} />
                           </article>
                        </li>
                     );
                  })}
               </ol>

               <footer className={styles.storyFooter}>
                  <div>
                     <p className={styles.footerLabel}>The shape of the day</p>

                     <p className={styles.footerSummary}>
                        {orderedStops.length} {orderedStops.length === 1 ? "stop" : "stops"}
                     </p>
                  </div>

                  <p className={styles.expiration}>Available through {formatExpirationDate(snapshot.expiresAt)}</p>
               </footer>

               <section className={styles.similarDay} aria-labelledby="plan-similar-day-title">
                  <div className={styles.similarDayCopy}>
                     <p className={styles.similarDayEyebrow}>Make it your own</p>

                     <h2 id="plan-similar-day-title" className={styles.similarDayTitle}>
                        Plan a similar day
                     </h2>

                     <p className={styles.similarDayDescription}>Start with the same area and time-period rhythm. Sidewalk will find fresh recommendations instead of copying these stops.</p>
                  </div>

                  <Link className={styles.similarDayLink} href={similarDayHref} prefetch={false} referrerPolicy="no-referrer">
                     Plan a similar day
                  </Link>
               </section>
            </article>
         </main>

         <SiteFooter />
      </>
   );
}
