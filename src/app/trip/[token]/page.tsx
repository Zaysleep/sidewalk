import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SharedDayPhoto } from "@/components/sharing/shared-day-photo";
import { verifySharedTripToken } from "@/lib/sharing/shared-trip-token";
import { siteConfig } from "@/lib/site/site-config";
import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { SharedDayStop } from "@/types/shared-day";
import type { SharedTripDaySnapshot, SharedTripSnapshot } from "@/types/shared-trip";

import styles from "./shared-trip.module.css";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type SharedTripPageProps = Readonly<{
   params: Promise<{
      token: string;
   }>;
}>;

type SharedTripReadResult =
   | Readonly<{
        status: "ready";
        snapshot: SharedTripSnapshot;
     }>
   | Readonly<{
        status: "invalid" | "expired" | "unavailable";
     }>;

function readSharedTrip(token: string): SharedTripReadResult {
   try {
      const verification = verifySharedTripToken(token);

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

function parsePlanningDate(planningDate: string): Date {
   const [yearText, monthText, dayText] = planningDate.split("-");

   return new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
}

function formatTripDate(planningDate: string): string {
   return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
   }).format(parsePlanningDate(planningDate));
}

function formatCompactDate(planningDate: string): string {
   return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
   }).format(parsePlanningDate(planningDate));
}

function formatDateRange(days: readonly SharedTripDaySnapshot[]): string {
   const firstDay = days[0];
   const finalDay = days[days.length - 1];

   if (!firstDay || !finalDay) {
      return "";
   }

   if (firstDay.planningDate === finalDay.planningDate) {
      return formatCompactDate(firstDay.planningDate);
   }

   return `${formatCompactDate(firstDay.planningDate)}–${formatCompactDate(finalDay.planningDate)}`;
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

function formatDuration(minimumMinutes: number, maximumMinutes: number): string {
   if (minimumMinutes === maximumMinutes) {
      return `${minimumMinutes} minutes`;
   }

   return `${minimumMinutes}–${maximumMinutes} minutes`;
}

function formatDayDuration(stops: readonly SharedDayStop[]): string {
   const minimum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.minimum, 0);

   const maximum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.maximum, 0);

   return minimum === maximum ? `${minimum} minutes at places` : `${minimum}–${maximum} minutes at places`;
}

function getTripStopCount(snapshot: SharedTripSnapshot): number {
   return snapshot.days.reduce((total, day) => total + day.stops.length, 0);
}

function createPageDescription(snapshot: SharedTripSnapshot): string {
   const stopCount = getTripStopCount(snapshot);

   return `${snapshot.days.length}-day Sidewalk trip with ${stopCount} curated stops, shared as one read-only itinerary.`;
}

export async function generateMetadata({ params }: SharedTripPageProps): Promise<Metadata> {
   const { token } = await params;

   const result = readSharedTrip(token);

   const privateMetadata: Pick<Metadata, "robots" | "referrer"> = {
      robots: {
         index: false,
         follow: false,
      },
      referrer: "no-referrer",
   };

   if (result.status !== "ready") {
      const title = result.status === "expired" ? "Shared trip expired" : result.status === "unavailable" ? "Sharing unavailable" : "Shared trip unavailable";

      return {
         ...privateMetadata,
         title,
         description: "This shared Sidewalk trip is not available.",
      };
   }

   const title = result.snapshot.title;

   const description = createPageDescription(result.snapshot);

   return {
      ...privateMetadata,
      title,
      description,
      openGraph: {
         type: "website",
         locale: siteConfig.locale,
         siteName: siteConfig.name,
         title: `${title} | ${siteConfig.name}`,
         description,
         url: new URL(`/trip/${token}`, siteConfig.url),
      },
      twitter: {
         card: "summary",
         title: `${title} | ${siteConfig.name}`,
         description,
      },
   };
}

function SharedTripUnavailable({
   status,
}: Readonly<{
   status: Exclude<SharedTripReadResult["status"], "ready">;
}>) {
   const copy =
      status === "expired"
         ? {
              eyebrow: "Shared trip expired",
              title: "This trip is no longer available.",
              description: "Shared Sidewalk trips stay available for a limited time. The original Trip Folio remains private to the person who created it.",
           }
         : status === "unavailable"
           ? {
                eyebrow: "Sharing unavailable",
                title: "Sidewalk cannot open this trip right now.",
                description: "The sharing service is temporarily unavailable. The link has not changed the original Trip Folio.",
             }
           : {
                eyebrow: "Shared trip unavailable",
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
            <section className={styles.unavailableCard} aria-labelledby="shared-trip-unavailable-title">
               <p className={styles.eyebrow}>{copy.eyebrow}</p>

               <h1 id="shared-trip-unavailable-title" className={styles.unavailableTitle}>
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

export default async function SharedTripPage({ params }: SharedTripPageProps) {
   const { token } = await params;

   const result = readSharedTrip(token);

   if (result.status !== "ready") {
      return <SharedTripUnavailable status={result.status} />;
   }

   const { snapshot } = result;

   const stopCount = getTripStopCount(snapshot);

   return (
      <>
         <header className={styles.masthead}>
            <Link className={styles.brandGroup} href="/" aria-label="Sidewalk home">
               <span className={styles.brand}>Sidewalk</span>

               <span className={styles.edition}>A Kin city guide</span>
            </Link>

            <p className={styles.mastheadNote}>Shared trip</p>
         </header>

         <main id="main-content" className={styles.main} tabIndex={-1}>
            <article className={styles.story} aria-labelledby="shared-trip-title">
               <header className={styles.hero}>
                  <p className={styles.eyebrow}>A shared Sidewalk trip</p>

                  <h1 id="shared-trip-title" className={styles.title}>
                     {snapshot.title}
                  </h1>

                  <p className={styles.dateRange}>{formatDateRange(snapshot.days)}</p>

                  <p className={styles.introduction}>
                     {snapshot.days.length} days · {stopCount} {stopCount === 1 ? "stop" : "stops"}
                  </p>

                  <nav className={styles.dayNavigation} aria-label="Trip days">
                     {snapshot.days.map((day, index) => (
                        <a key={day.planningDate} href={`#trip-day-${index + 1}`} className={styles.dayNavigationLink}>
                           Day {index + 1}
                           <span>{formatCompactDate(day.planningDate)}</span>
                        </a>
                     ))}
                  </nav>
               </header>

               <div className={styles.tripDays}>
                  {snapshot.days.map((day, dayIndex) => {
                     const orderedStops = sortStops(day.stops);

                     return (
                        <section key={day.planningDate} id={`trip-day-${dayIndex + 1}`} className={styles.tripDay} aria-labelledby={`trip-day-title-${dayIndex + 1}`}>
                           <header className={styles.tripDayHeader}>
                              <div>
                                 <p className={styles.dayNumber}>Day {dayIndex + 1}</p>

                                 <h2 id={`trip-day-title-${dayIndex + 1}`} className={styles.tripDayTitle}>
                                    {formatTripDate(day.planningDate)}
                                 </h2>
                              </div>

                              <div className={styles.tripDayMeta}>
                                 <p>{day.geography.localAreaName}</p>

                                 <p>
                                    {day.geography.municipalityName} · {day.geography.metroName}
                                 </p>

                                 <p>
                                    {orderedStops.length} {orderedStops.length === 1 ? "stop" : "stops"} · {formatDayDuration(orderedStops)}
                                 </p>
                              </div>
                           </header>

                           <ol className={styles.itinerary} aria-label={`Day ${dayIndex + 1} itinerary`}>
                              {orderedStops.map((stop, stopIndex) => {
                                 const periodLabel = getPeriodLabel(stop.dayPeriod);

                                 const headingId = `trip-day-${dayIndex + 1}-stop-${stopIndex + 1}`;

                                 return (
                                    <li key={`${stop.dayPeriod}-${stop.placeId}`} className={styles.itineraryItem}>
                                       <article className={styles.stop} aria-labelledby={headingId}>
                                          <div className={styles.stopCopy}>
                                             <header className={styles.stopHeading}>
                                                <div>
                                                   <p className={styles.period}>{periodLabel}</p>

                                                   <h3 id={headingId} className={styles.placeName}>
                                                      {stop.placeName}
                                                   </h3>
                                                </div>

                                                <p className={styles.window}>{stop.bestWindow}</p>
                                             </header>

                                             {stop.summary ? <p className={styles.summary}>{stop.summary}</p> : null}

                                             {stop.reason ? <p className={styles.reason}>{stop.reason}</p> : null}

                                             <div className={styles.stopFooter}>
                                                <p className={styles.duration}>{formatDuration(stop.visitDurationMinutes.minimum, stop.visitDurationMinutes.maximum)}</p>

                                                {stop.locationUrl ? (
                                                   <a className={styles.locationLink} href={stop.locationUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                                                      Open location
                                                   </a>
                                                ) : null}
                                             </div>
                                          </div>

                                          <SharedDayPhoto resourceName={stop.photoResourceName} placeName={stop.placeName} className={styles.photo} fallbackClassName={styles.photoFallback} priority={dayIndex === 0 && stopIndex === 0} />
                                       </article>
                                    </li>
                                 );
                              })}
                           </ol>
                        </section>
                     );
                  })}
               </div>

               <footer className={styles.storyFooter}>
                  <div>
                     <p className={styles.footerLabel}>The whole trip</p>

                     <p className={styles.footerSummary}>
                        {snapshot.days.length} days · {stopCount} {stopCount === 1 ? "stop" : "stops"}
                     </p>
                  </div>

                  <p className={styles.expiration}>Available through {formatExpirationDate(snapshot.expiresAt)}</p>
               </footer>
            </article>
         </main>

         <SiteFooter />
      </>
   );
}
