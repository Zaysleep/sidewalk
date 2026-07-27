"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { dayPeriodDefinitions, type DayPeriod } from "@/types/day-period";
import type { PeriodRecommendation } from "@/types/period-recommendation";

import styles from "./period-pick-detail.module.css";

type PeriodPickDetailProps = Readonly<{
   dayPeriod: DayPeriod;
   recommendation: PeriodRecommendation;
   areaName: string;

   hasPeriodStop: boolean;
   isCurrentPeriodStop: boolean;
   nextPeriodLabel: string | null;

   onAddToDay: (recommendation: PeriodRecommendation) => void;

   onContinue: () => void;
}>;

function formatRatingCount(count: number): string {
   return new Intl.NumberFormat("en-US").format(count);
}

function formatVisitDuration(minimum: number, maximum: number): string {
   if (minimum === maximum) {
      return `${minimum} minutes`;
   }

   return `${minimum}–${maximum} minutes`;
}

export function PeriodPickDetail({ dayPeriod, recommendation, areaName, hasPeriodStop, isCurrentPeriodStop, nextPeriodLabel, onAddToDay, onContinue }: PeriodPickDetailProps) {
   const [imageFailed, setImageFailed] = useState(false);

   const { place } = recommendation;

   const periodDefinition = dayPeriodDefinitions.find((candidate) => candidate.id === dayPeriod);

   const periodLabel = periodDefinition?.label ?? dayPeriod;

   const photoResourceName = place.provider.photoResourceName ?? null;

   const photoUrl = photoResourceName ? `/api/places/photo?resourceName=${encodeURIComponent(photoResourceName)}` : null;

   useEffect(() => {
      setImageFailed(false);
   }, [photoResourceName]);

   const duration = formatVisitDuration(place.editorial.visitDurationMinutes.minimum, place.editorial.visitDurationMinutes.maximum);

   const locationUrl = place.provider.mapsUrl ?? place.provider.websiteUrl ?? null;

   const availability = place.provider.periodAvailability ?? null;

   const addOrReplaceLabel = hasPeriodStop ? `Replace ${periodLabel} choice` : "Add to day";

   return (
      <article className={styles.card} aria-labelledby={`period-pick-${place.slug}`}>
         <div className={styles.imageFrame}>
            {photoUrl && !imageFailed ? (
               <Image src={photoUrl} alt={`${place.provider.name} in ${areaName}`} fill unoptimized sizes="(max-width: 768px) 100vw, 720px" className={styles.image} onError={() => setImageFailed(true)} />
            ) : (
               <div className={styles.imageFallback}>
                  <span>No image available</span>
               </div>
            )}
         </div>

         <div className={styles.content}>
            <div className={styles.heading}>
               <p className={styles.eyebrow}>Sidewalk&apos;s Pick · {periodLabel}</p>

               <h2 id={`period-pick-${place.slug}`} className={styles.name}>
                  {place.provider.name}
               </h2>

               <p className={styles.summary}>{place.editorial.summary}</p>
            </div>

            <dl className={styles.facts}>
               {place.provider.formattedAddress ? (
                  <div className={`${styles.fact} ${styles.addressFact}`}>
                     <dt>Address</dt>

                     <dd>{place.provider.formattedAddress}</dd>
                  </div>
               ) : null}

               {typeof place.provider.rating === "number" ? (
                  <div className={styles.fact}>
                     <dt>Google rating</dt>

                     <dd aria-label={`Rated ${place.provider.rating.toFixed(1)} out of 5${typeof place.provider.userRatingCount === "number" ? ` from ${formatRatingCount(place.provider.userRatingCount)} ratings` : ""}`}>
                        <span aria-hidden="true">★</span> {place.provider.rating.toFixed(1)}
                        {typeof place.provider.userRatingCount === "number" ? ` · ${formatRatingCount(place.provider.userRatingCount)} ratings` : ""}
                     </dd>
                  </div>
               ) : null}

               <div className={styles.fact}>
                  <dt>Best window</dt>

                  <dd>{recommendation.bestWindow}</dd>
               </div>

               {availability ? (
                  <div className={styles.fact}>
                     <dt>Hours</dt>

                     <dd className={styles.availability} data-status={availability.status}>
                        {availability.label}
                     </dd>
                  </div>
               ) : null}

               <div className={styles.fact}>
                  <dt>Visit length</dt>

                  <dd>{duration}</dd>
               </div>
            </dl>

            <div className={styles.why}>
               <p className={styles.whyLabel}>Why this fits</p>

               <p className={styles.whyCopy}>{recommendation.reason}</p>
            </div>

            <div className={styles.actions}>
               {isCurrentPeriodStop ? (
                  <>
                     <p className={styles.addedStatus} role="status">
                        <span aria-hidden="true">✓</span> In your {periodLabel.toLowerCase()} plan
                     </p>

                     {nextPeriodLabel ? (
                        <button type="button" className={styles.primaryAction} onClick={onContinue}>
                           Continue to {nextPeriodLabel}
                        </button>
                     ) : null}
                  </>
               ) : (
                  <button type="button" className={styles.primaryAction} onClick={() => onAddToDay(recommendation)}>
                     {addOrReplaceLabel}
                  </button>
               )}

               {locationUrl ? (
                  <a className={styles.secondaryAction} href={locationUrl} target="_blank" rel="noreferrer" aria-label={`Open ${place.provider.name} location in a new tab`}>
                     Open location
                  </a>
               ) : null}
            </div>
         </div>
      </article>
   );
}
