"use client";

import { useEffect, useRef, useState } from "react";

import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";

import styles from "./day-tray.module.css";

type DayShareStatus = "idle" | "loading" | "ready" | "error";

type DayTrayProps = Readonly<{
   planningDate: string;
   stops: readonly DayStop[];
   isOpen: boolean;

   shareStatus: DayShareStatus;
   shareUrl: string | null;
   shareMessage: string;

   onToggle: () => void;
   onDone: () => void;
   onRemove: (stopId: string) => void;
   onClearDay: () => void;
   onEditPeriod: (period: DayPeriod) => void;
   onContinuePlanning: () => void;
   onPlanAnotherDay: () => void;
   onCreateShare: () => void;
}>;

function formatDuration(minimumMinutes: number, maximumMinutes: number): string {
   if (minimumMinutes === maximumMinutes) {
      return `${minimumMinutes} minutes`;
   }

   return `${minimumMinutes}–${maximumMinutes} minutes`;
}

function formatTotalDuration(stops: readonly DayStop[]): string {
   const minimum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.minimum, 0);

   const maximum = stops.reduce((total, stop) => total + stop.visitDurationMinutes.maximum, 0);

   if (minimum === maximum) {
      return `${minimum} minutes at stops`;
   }

   return `${minimum}–${maximum} minutes at stops`;
}

function formatPlanningDate(planningDate: string): string {
   const [yearText, monthText, dayText] = planningDate.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return "";
   }

   return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
   }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getPeriodLabel(period: DayPeriod): string {
   return dayPeriodDefinitions.find((definition) => definition.id === period)?.label ?? period;
}

function sortStops(stops: readonly DayStop[]): readonly DayStop[] {
   return dayPeriods.flatMap((period) => {
      const stop = stops.find((candidate) => candidate.dayPeriod === period);

      return stop ? [stop] : [];
   });
}

function getSummaryLabel(stops: readonly DayStop[]): string {
   if (stops.length === 1) {
      const stop = stops[0];

      return `${getPeriodLabel(stop.dayPeriod)} · ${stop.placeName}`;
   }

   const firstPeriod = getPeriodLabel(stops[0].dayPeriod);

   const finalPeriod = getPeriodLabel(stops[stops.length - 1].dayPeriod);

   if (stops.length >= 4) {
      return `${stops.length} stops · ${firstPeriod} to ${finalPeriod}`;
   }

   return `${stops.length} stops · ${stops.map((stop) => getPeriodLabel(stop.dayPeriod)).join(" · ")}`;
}

function isCompactTrayLayout(): boolean {
   return window.matchMedia("(max-width: 63.99rem)").matches;
}

export function DayTray({ planningDate, stops, isOpen, shareStatus, shareUrl, shareMessage, onToggle, onDone, onRemove, onClearDay, onEditPeriod, onContinuePlanning, onPlanAnotherDay, onCreateShare }: DayTrayProps) {
   const isComplete = stops.length >= 2;

   const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

   const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);

   const [copyMessage, setCopyMessage] = useState("");

   const summaryButtonReference = useRef<HTMLButtonElement | null>(null);

   const trayHeadingReference = useRef<HTMLHeadingElement | null>(null);

   const trayContentReference = useRef<HTMLDivElement | null>(null);

   const clearDayButtonReference = useRef<HTMLButtonElement | null>(null);

   const cancelClearButtonReference = useRef<HTMLButtonElement | null>(null);

   const shareDayButtonReference = useRef<HTMLButtonElement | null>(null);

   const sharePanelHeadingReference = useRef<HTMLHeadingElement | null>(null);

   const hasMountedReference = useRef(false);

   const previousOpenStateReference = useRef(isOpen);

   const shouldRestoreTriggerFocusReference = useRef(false);

   /**
    * On compact screens the tray behaves like a disclosure panel. Move focus
    * into it when opened and return focus to the trigger when closed.
    */
   useEffect(() => {
      if (!hasMountedReference.current) {
         hasMountedReference.current = true;
         previousOpenStateReference.current = isOpen;
         return;
      }

      if (!isCompactTrayLayout()) {
         previousOpenStateReference.current = isOpen;
         return;
      }

      const wasOpen = previousOpenStateReference.current;

      const frameId = window.requestAnimationFrame(() => {
         if (isOpen && !wasOpen) {
            trayHeadingReference.current?.focus();
         }

         if (!isOpen && wasOpen && shouldRestoreTriggerFocusReference.current) {
            summaryButtonReference.current?.focus();

            shouldRestoreTriggerFocusReference.current = false;
         }
      });

      previousOpenStateReference.current = isOpen;

      return () => {
         window.cancelAnimationFrame(frameId);
      };
   }, [isOpen]);

   /**
    * Escape closes the compact tray. When the clear confirmation is open,
    * Escape cancels that confirmation before affecting the tray itself.
    */
   useEffect(() => {
      if (!isOpen) {
         return;
      }

      function handleKeyDown(event: KeyboardEvent) {
         if (event.key !== "Escape") {
            return;
         }

         if (isSharePanelOpen) {
            event.preventDefault();
            setIsSharePanelOpen(false);
            setCopyMessage("");

            window.requestAnimationFrame(() => {
               shareDayButtonReference.current?.focus();
            });

            return;
         }

         if (isClearConfirmationOpen) {
            event.preventDefault();
            setIsClearConfirmationOpen(false);

            window.requestAnimationFrame(() => {
               clearDayButtonReference.current?.focus();
            });

            return;
         }

         if (isCompactTrayLayout()) {
            event.preventDefault();

            shouldRestoreTriggerFocusReference.current = true;

            onDone();
         }
      }

      document.addEventListener("keydown", handleKeyDown);

      return () => {
         document.removeEventListener("keydown", handleKeyDown);
      };
   }, [isClearConfirmationOpen, isOpen, isSharePanelOpen, onDone]);

   useEffect(() => {
      if (!isClearConfirmationOpen) {
         return;
      }

      const frameId = window.requestAnimationFrame(() => {
         cancelClearButtonReference.current?.focus();
      });

      return () => {
         window.cancelAnimationFrame(frameId);
      };
   }, [isClearConfirmationOpen]);

   useEffect(() => {
      if (!isSharePanelOpen) {
         return;
      }

      const frameId = window.requestAnimationFrame(() => {
         sharePanelHeadingReference.current?.focus();
      });

      return () => {
         window.cancelAnimationFrame(frameId);
      };
   }, [isSharePanelOpen]);

   useEffect(() => {
      if (isOpen && isComplete) {
         return;
      }

      setIsSharePanelOpen(false);
      setCopyMessage("");
   }, [isComplete, isOpen]);

   if (stops.length === 0) {
      return null;
   }

   const orderedStops = sortStops(stops);

   const canAddAnotherStop = orderedStops.length < dayPeriods.length;

   const formattedPlanningDate = formatPlanningDate(planningDate);

   const trayTitleId = "sidewalk-day-tray-title";

   const clearConfirmationTitleId = "sidewalk-clear-day-title";

   const clearConfirmationDescriptionId = "sidewalk-clear-day-description";

   const sharePanelTitleId = "sidewalk-share-day-title";

   const sharePanelDescriptionId = "sidewalk-share-day-description";

   function preserveTrayScroll(action: () => void) {
      const currentScrollTop = trayContentReference.current?.scrollTop ?? 0;

      action();

      window.requestAnimationFrame(() => {
         window.requestAnimationFrame(() => {
            if (trayContentReference.current) {
               trayContentReference.current.scrollTop = currentScrollTop;
            }
         });
      });
   }

   function handleCancelClearDay() {
      setIsClearConfirmationOpen(false);

      window.requestAnimationFrame(() => {
         clearDayButtonReference.current?.focus();
      });
   }

   function handleOpenSharePanel() {
      setIsClearConfirmationOpen(false);
      setCopyMessage("");
      setIsSharePanelOpen(true);
   }

   function handleCloseSharePanel() {
      setIsSharePanelOpen(false);
      setCopyMessage("");

      window.requestAnimationFrame(() => {
         shareDayButtonReference.current?.focus();
      });
   }

   async function handleCopyShareLink() {
      if (!shareUrl) {
         return;
      }

      try {
         if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareUrl);
         } else {
            const temporaryInput = document.createElement("textarea");

            temporaryInput.value = shareUrl;
            temporaryInput.setAttribute("readonly", "");
            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";

            document.body.appendChild(temporaryInput);

            temporaryInput.select();

            const copied = document.execCommand("copy");

            temporaryInput.remove();

            if (!copied) {
               throw new Error("Copy command was unavailable.");
            }
         }

         setCopyMessage("Link copied.");
      } catch {
         setCopyMessage("Sidewalk could not copy the link. Open the shared page and copy it from the address bar.");
      }
   }

   return (
      <aside className={styles.tray} data-open={isOpen} aria-label="Your saved day">
         <button
            ref={summaryButtonReference}
            type="button"
            className={styles.summaryButton}
            aria-expanded={isOpen}
            aria-controls="sidewalk-day-tray-content"
            aria-label={`${isOpen ? "Close" : "Open"} your day with ${orderedStops.length} ${orderedStops.length === 1 ? "stop" : "stops"}`}
            onClick={() => {
               if (isOpen) {
                  shouldRestoreTriggerFocusReference.current = true;
               }

               onToggle();
            }}
         >
            <span className={styles.summaryHeading}>{isComplete ? "Day saved" : "Your day"}</span>

            <span className={styles.summaryPlace}>{getSummaryLabel(orderedStops)}</span>

            <span className={styles.summaryAction}>{isOpen ? "Close" : "Open"}</span>
         </button>

         <div ref={trayContentReference} id="sidewalk-day-tray-content" className={styles.content} role="region" aria-labelledby={trayTitleId}>
            <header className={styles.heading}>
               <div>
                  <p className={styles.eyebrow}>{isComplete ? "Day saved" : "In progress"}</p>

                  <h2 ref={trayHeadingReference} id={trayTitleId} className={styles.title} tabIndex={-1}>
                     Your Day
                  </h2>

                  {formattedPlanningDate ? <p className={styles.date}>{formattedPlanningDate}</p> : null}
               </div>

               <p className={styles.count}>
                  {orderedStops.length} {orderedStops.length === 1 ? "stop" : "stops"}
               </p>
            </header>

            <div className={styles.stopList}>
               {orderedStops.map((stop) => {
                  const periodLabel = getPeriodLabel(stop.dayPeriod);

                  return (
                     <article key={stop.id} className={styles.stop} aria-labelledby={`day-stop-title-${stop.id}`}>
                        <div className={styles.stopHeading}>
                           <p className={styles.stopLabel}>{periodLabel}</p>

                           <p className={styles.window}>{stop.bestWindow}</p>
                        </div>

                        <h3 id={`day-stop-title-${stop.id}`} className={styles.stopName}>
                           {stop.placeName}
                        </h3>

                        <p className={styles.stopMeta}>
                           {stop.localAreaName}, {stop.municipalityName} · {formatDuration(stop.visitDurationMinutes.minimum, stop.visitDurationMinutes.maximum)}
                        </p>

                        <div className={styles.stopActions}>
                           {stop.locationUrl ? (
                              <a className={styles.locationLink} href={stop.locationUrl} target="_blank" rel="noreferrer" aria-label={`Open ${stop.placeName} location in a new tab`}>
                                 Open location
                              </a>
                           ) : null}

                           <button type="button" className={styles.editButton} aria-label={`Change the ${periodLabel} stop`} onClick={() => onEditPeriod(stop.dayPeriod)}>
                              Change
                           </button>

                           <button
                              type="button"
                              className={styles.removeButton}
                              aria-label={`Remove ${stop.placeName} from ${periodLabel}`}
                              onClick={() => {
                                 preserveTrayScroll(() => onRemove(stop.id));
                              }}
                           >
                              Remove
                           </button>
                        </div>
                     </article>
                  );
               })}
            </div>

            <div className={styles.footer}>
               <div className={styles.footerSummary}>
                  <p className={styles.total}>{formatTotalDuration(orderedStops)}</p>

                  <p className={styles.completionNote}>{!isComplete ? "One more stop saves this day." : canAddAnotherStop ? "Saved. Add another stop only if it improves the day." : "All five time periods are planned."}</p>
               </div>

               <div className={styles.footerActions}>
                  {canAddAnotherStop ? (
                     <button type="button" className={isComplete ? styles.optionalButton : styles.continueButton} onClick={onContinuePlanning}>
                        {isComplete ? "Add another stop" : "Choose another stop"}
                     </button>
                  ) : null}

                  {isComplete ? (
                     <button ref={shareDayButtonReference} type="button" className={styles.shareButton} aria-expanded={isSharePanelOpen} aria-controls="sidewalk-share-day-panel" onClick={handleOpenSharePanel}>
                        Share day
                     </button>
                  ) : null}

                  {isComplete ? (
                     <button type="button" className={styles.resetButton} onClick={onPlanAnotherDay}>
                        Plan another day
                     </button>
                  ) : null}
               </div>

               {isSharePanelOpen ? (
                  <section id="sidewalk-share-day-panel" className={styles.sharePanel} aria-labelledby={sharePanelTitleId} aria-describedby={sharePanelDescriptionId}>
                     <div className={styles.sharePanelHeading}>
                        <p className={styles.shareEyebrow}>Share this day</p>

                        <h3 ref={sharePanelHeadingReference} id={sharePanelTitleId} className={styles.shareTitle} tabIndex={-1}>
                           Send the shape of a worthwhile day.
                        </h3>
                     </div>

                     <p id={sharePanelDescriptionId} className={styles.shareDescription}>
                        Anyone with the link can view this itinerary. They cannot edit your original day.
                     </p>

                     {shareStatus === "loading" ? (
                        <p className={styles.shareStatus} role="status">
                           Creating a private link…
                        </p>
                     ) : null}

                     {shareStatus === "error" ? (
                        <p className={styles.shareError} role="alert">
                           {shareMessage || "Sidewalk could not create the link right now."}
                        </p>
                     ) : null}

                     {shareStatus === "ready" && shareUrl ? (
                        <>
                           <p className={styles.shareStatus} role="status">
                              Your read-only link is ready. It will remain available for 30 days.
                           </p>

                           <div className={styles.shareReadyActions}>
                              <button type="button" className={styles.copyLinkButton} onClick={() => void handleCopyShareLink()}>
                                 Copy link
                              </button>

                              <a className={styles.viewSharedDayLink} href={shareUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                                 View shared page
                              </a>
                           </div>
                        </>
                     ) : null}

                     {shareStatus === "idle" || shareStatus === "error" ? (
                        <div className={styles.shareConfirmationActions}>
                           <button type="button" className={styles.createShareButton} onClick={onCreateShare}>
                              {shareStatus === "error" ? "Try again" : "Create link"}
                           </button>

                           <button type="button" className={styles.cancelShareButton} onClick={handleCloseSharePanel}>
                              Cancel
                           </button>
                        </div>
                     ) : null}

                     {shareStatus === "loading" ? (
                        <button type="button" className={styles.cancelShareButton} onClick={handleCloseSharePanel}>
                           Cancel
                        </button>
                     ) : null}

                     {shareStatus === "ready" ? (
                        <button type="button" className={styles.cancelShareButton} onClick={handleCloseSharePanel}>
                           Done
                        </button>
                     ) : null}

                     <p className={styles.copyMessage} aria-live="polite">
                        {copyMessage}
                     </p>
                  </section>
               ) : null}

               <div className={styles.trayActions}>
                  <button
                     ref={clearDayButtonReference}
                     type="button"
                     className={styles.clearDayButton}
                     aria-expanded={isClearConfirmationOpen}
                     aria-controls="sidewalk-clear-day-confirmation"
                     onClick={() => {
                        setIsSharePanelOpen(false);
                        setCopyMessage("");
                        setIsClearConfirmationOpen(true);
                     }}
                  >
                     Clear day
                  </button>

                  <button
                     type="button"
                     className={styles.doneButton}
                     onClick={() => {
                        shouldRestoreTriggerFocusReference.current = true;

                        onDone();
                     }}
                  >
                     Done
                  </button>
               </div>

               {isClearConfirmationOpen ? (
                  <div id="sidewalk-clear-day-confirmation" className={styles.clearConfirmation} role="alertdialog" aria-modal="false" aria-labelledby={clearConfirmationTitleId} aria-describedby={clearConfirmationDescriptionId}>
                     <p id={clearConfirmationTitleId} className={styles.clearTitle}>
                        Clear this day?
                     </p>

                     <p id={clearConfirmationDescriptionId} className={styles.clearDescription}>
                        This removes every stop you have chosen. Your area, date, and preferences will stay in place.
                     </p>

                     <div className={styles.clearConfirmationActions}>
                        <button ref={cancelClearButtonReference} type="button" className={styles.cancelClearButton} onClick={handleCancelClearDay}>
                           Cancel
                        </button>

                        <button type="button" className={styles.confirmClearButton} onClick={onClearDay}>
                           Clear day
                        </button>
                     </div>
                  </div>
               ) : null}
            </div>
         </div>
      </aside>
   );
}
