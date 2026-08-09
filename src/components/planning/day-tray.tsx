"use client";

import { useEffect, useRef, useState } from "react";

import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import type { TripFolioDay } from "@/types/trip-folio";

import styles from "./day-tray.module.css";

type DayShareStatus = "idle" | "loading" | "ready" | "error";

type TripDayStatus = "not-saved" | "saved" | "changed";

type DayTrayProps = Readonly<{
   planningDate: string;
   stops: readonly DayStop[];
   isOpen: boolean;

   shareStatus: DayShareStatus;
   shareUrl: string | null;
   shareMessage: string;

   tripTitle: string | null;
   tripDays: readonly TripFolioDay[];
   tripDayStatus: TripDayStatus;
   tripMessage: string;

   tripShareStatus: DayShareStatus;
   tripShareUrl: string | null;
   tripShareMessage: string;

   onToggle: () => void;
   onDone: () => void;
   onRemove: (stopId: string) => void;
   onClearDay: () => void;
   onEditPeriod: (period: DayPeriod) => void;
   onContinuePlanning: () => void;
   onCreateShare: () => void;
   onSaveToTrip: () => void;
   onEditTripDay: (planningDate: string) => void;
   onRemoveTripDay: (planningDate: string) => void;
   onAddTripDay: () => void;
   onCreateTripShare: () => void;
   onRenameTrip: (title: string) => void;
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

function formatTripDayDate(planningDate: string): string {
   const [yearText, monthText, dayText] = planningDate.split("-");

   const year = Number(yearText);
   const month = Number(monthText);
   const day = Number(dayText);

   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return planningDate;
   }

   return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
   }).format(new Date(Date.UTC(year, month - 1, day)));
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

export function DayTray({
   planningDate,
   stops,
   isOpen,
   shareStatus,
   shareUrl,
   shareMessage,
   tripTitle,
   tripDays,
   tripDayStatus,
   tripMessage,
   tripShareStatus,
   tripShareUrl,
   tripShareMessage,
   onToggle,
   onDone,
   onRemove,
   onClearDay,
   onEditPeriod,
   onContinuePlanning,
   onCreateShare,
   onSaveToTrip,
   onEditTripDay,
   onRemoveTripDay,
   onAddTripDay,
   onCreateTripShare,
   onRenameTrip,
}: DayTrayProps) {
   const isComplete = stops.length >= 2;

   const hasTripFolio = tripTitle !== null && tripDays.length > 0;

   const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

   const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);

   const [copyMessage, setCopyMessage] = useState("");

   const [tripCopyMessage, setTripCopyMessage] = useState("");

   const [isTripRenameOpen, setIsTripRenameOpen] = useState(false);

   const [tripTitleDraft, setTripTitleDraft] = useState(tripTitle ?? "");

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

   useEffect(() => {
      setTripCopyMessage("");
   }, [tripShareUrl]);

   useEffect(() => {
      setTripTitleDraft(tripTitle ?? "");

      if (!tripTitle) {
         setIsTripRenameOpen(false);
      }
   }, [tripTitle]);

   if (stops.length === 0 && !hasTripFolio) {
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

   const tripActionLabel = tripDayStatus === "changed" ? "Update trip day" : "Add day to trip";

   const tripSummary = hasTripFolio ? `${tripTitle} · ${tripDays.length} ${tripDays.length === 1 ? "day" : "days"}` : "Keep this day with the rest of your trip.";

   const canAddTripDay = hasTripFolio && tripDays.length < 5;

   const currentDayNeedsTripSave = tripDayStatus !== "saved";

   const canStartAnotherTripDay = canAddTripDay && (!currentDayNeedsTripSave || isComplete);

   const addTripDayLabel = currentDayNeedsTripSave ? (isComplete ? "Save & add another day" : "Finish this day first") : "Add another day";

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

   async function handleCopyTripLink() {
      if (!tripShareUrl) {
         return;
      }

      try {
         if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(tripShareUrl);
         } else {
            const temporaryInput = document.createElement("textarea");

            temporaryInput.value = tripShareUrl;
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

         setTripCopyMessage("Trip link copied.");
      } catch {
         setTripCopyMessage("Sidewalk could not copy the trip link. Open the shared trip and copy it from the address bar.");
      }
   }

   return (
      <aside className={styles.tray} data-open={isOpen} aria-label={hasTripFolio ? "Your trip and saved day" : "Your saved day"}>
         <button
            ref={summaryButtonReference}
            type="button"
            className={styles.summaryButton}
            aria-expanded={isOpen}
            aria-controls="sidewalk-day-tray-content"
            aria-label={
               hasTripFolio
                  ? `${isOpen ? "Close" : "Open"} ${tripTitle} with ${tripDays.length} ${tripDays.length === 1 ? "day" : "days"}`
                  : `${isOpen ? "Close" : "Open"} your day with ${orderedStops.length} ${orderedStops.length === 1 ? "stop" : "stops"}`
            }
            onClick={() => {
               if (isOpen) {
                  shouldRestoreTriggerFocusReference.current = true;
               }

               onToggle();
            }}
         >
            <span className={styles.summaryHeading}>{hasTripFolio ? "Trip folio" : isComplete ? "Day saved" : "Your day"}</span>

            <span className={styles.summaryPlace}>{hasTripFolio ? `${tripTitle} · ${tripDays.length} ${tripDays.length === 1 ? "day" : "days"}` : getSummaryLabel(orderedStops)}</span>

            <span className={styles.summaryAction}>{isOpen ? "Close" : "Open"}</span>
         </button>

         <div ref={trayContentReference} id="sidewalk-day-tray-content" className={styles.content} role="region" aria-labelledby={trayTitleId}>
            <header className={styles.heading}>
               <div>
                  <p className={styles.eyebrow}>{orderedStops.length > 0 ? (isComplete ? "Day saved" : "In progress") : "Trip folio"}</p>

                  <h2 ref={trayHeadingReference} id={trayTitleId} className={styles.title} tabIndex={-1}>
                     {orderedStops.length > 0 ? "Your Day" : tripTitle}
                  </h2>

                  {orderedStops.length > 0 && formattedPlanningDate ? <p className={styles.date}>{formattedPlanningDate}</p> : null}
               </div>

               <p className={styles.count}>{orderedStops.length > 0 ? `${orderedStops.length} ${orderedStops.length === 1 ? "stop" : "stops"}` : `${tripDays.length} ${tripDays.length === 1 ? "day" : "days"}`}</p>
            </header>

            {orderedStops.length > 0 ? (
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
            ) : null}

            <div className={styles.footer}>
               {orderedStops.length > 0 ? (
                  <div className={styles.footerSummary}>
                     <p className={styles.total}>{formatTotalDuration(orderedStops)}</p>

                     <p className={styles.completionNote}>{!isComplete ? "One more stop saves this day." : canAddAnotherStop ? "Saved. Add another stop only if it improves the day." : "All five time periods are planned."}</p>
                  </div>
               ) : null}

               {isComplete || hasTripFolio ? (
                  <section className={styles.tripFolio} aria-labelledby="sidewalk-trip-folio-title">
                     <div className={styles.tripFolioHeading}>
                        <div className={styles.tripFolioCopy}>
                           <p className={styles.tripFolioEyebrow}>Trip folio</p>

                           <div className={styles.tripTitleRow}>
                              <h3 id="sidewalk-trip-folio-title" className={styles.tripFolioTitle}>
                                 {hasTripFolio ? tripTitle : "Start a multi-day trip"}
                              </h3>

                              {hasTripFolio && !isTripRenameOpen ? (
                                 <button type="button" className={styles.renameTripButton} onClick={() => setIsTripRenameOpen(true)}>
                                    Rename
                                 </button>
                              ) : null}
                           </div>

                           {hasTripFolio && isTripRenameOpen ? (
                              <form
                                 className={styles.renameTripForm}
                                 onSubmit={(event) => {
                                    event.preventDefault();

                                    const nextTitle = tripTitleDraft.replace(/\s+/g, " ").trim();

                                    if (!nextTitle) {
                                       return;
                                    }

                                    onRenameTrip(nextTitle);
                                    setIsTripRenameOpen(false);
                                 }}
                              >
                                 <label className={styles.renameTripLabel} htmlFor="sidewalk-trip-title-input">
                                    Trip name
                                 </label>

                                 <input id="sidewalk-trip-title-input" className={styles.renameTripInput} type="text" value={tripTitleDraft} maxLength={80} autoComplete="off" onChange={(event) => setTripTitleDraft(event.target.value)} />

                                 <div className={styles.renameTripActions}>
                                    <button type="submit" className={styles.renameTripSaveButton}>
                                       Save name
                                    </button>

                                    <button
                                       type="button"
                                       className={styles.renameTripCancelButton}
                                       onClick={() => {
                                          setTripTitleDraft(tripTitle ?? "");
                                          setIsTripRenameOpen(false);
                                       }}
                                    >
                                       Keep current
                                    </button>
                                 </div>
                              </form>
                           ) : null}

                           <p className={styles.tripFolioSummary}>{tripSummary}</p>

                           {tripMessage ? (
                              <p className={styles.tripFolioMessage} aria-live="polite">
                                 {tripMessage}
                              </p>
                           ) : null}
                        </div>

                        {!hasTripFolio && isComplete ? (
                           <button type="button" className={styles.tripFolioButton} onClick={onSaveToTrip}>
                              Add day to trip
                           </button>
                        ) : null}

                        {hasTripFolio && isComplete && tripDayStatus !== "saved" ? (
                           <button type="button" className={styles.tripFolioButton} onClick={onSaveToTrip}>
                              {tripActionLabel}
                           </button>
                        ) : null}

                        {hasTripFolio && isComplete && tripDayStatus === "saved" ? <span className={styles.tripFolioSaved}>Current day saved</span> : null}
                     </div>

                     {hasTripFolio ? (
                        <>
                           <ol className={styles.tripDayList}>
                              {tripDays.map((tripDay) => {
                                 const isCurrentTripDay = tripDay.planningDate === planningDate;

                                 return (
                                    <li key={tripDay.planningDate} className={styles.tripDay} data-current={isCurrentTripDay}>
                                       <div className={styles.tripDayCopy}>
                                          <div className={styles.tripDayDateRow}>
                                             <p className={styles.tripDayDate}>{formatTripDayDate(tripDay.planningDate)}</p>

                                             {isCurrentTripDay ? <span className={styles.tripDayCurrent}>Open</span> : null}
                                          </div>

                                          <p className={styles.tripDayArea}>
                                             {tripDay.localAreaName} · {tripDay.stops.length} {tripDay.stops.length === 1 ? "stop" : "stops"}
                                          </p>
                                       </div>

                                       <div className={styles.tripDayActions}>
                                          <button type="button" className={styles.tripDayEditButton} onClick={() => onEditTripDay(tripDay.planningDate)}>
                                             {isCurrentTripDay ? "Return to day" : "Edit day"}
                                          </button>

                                          <button type="button" className={styles.tripDayRemoveButton} onClick={() => onRemoveTripDay(tripDay.planningDate)}>
                                             Remove
                                          </button>
                                       </div>
                                    </li>
                                 );
                              })}
                           </ol>

                           <div className={styles.tripFolioFooter}>
                              {canAddTripDay ? (
                                 <button type="button" className={styles.addTripDayButton} disabled={!canStartAnotherTripDay} onClick={onAddTripDay}>
                                    {addTripDayLabel}
                                 </button>
                              ) : (
                                 <p className={styles.tripLimitNote}>This trip has all five available days.</p>
                              )}

                              <div className={styles.tripShare}>
                                 <div className={styles.tripShareCopy}>
                                    <p className={styles.tripShareLabel}>Share the whole trip</p>

                                    <p className={styles.tripShareDescription}>
                                       {tripDays.length < 2
                                          ? "Add one more saved day to create one read-only link for the full trip."
                                          : tripDayStatus === "changed"
                                            ? "Update the current trip day before sharing so the link includes your latest changes."
                                            : "One link includes every saved day in this Trip Folio."}
                                    </p>
                                 </div>

                                 {tripDays.length >= 2 && tripDayStatus !== "changed" ? (
                                    <div className={styles.tripShareActions}>
                                       {tripShareStatus === "ready" && tripShareUrl ? (
                                          <>
                                             <button type="button" className={styles.tripShareButton} onClick={() => void handleCopyTripLink()}>
                                                Copy trip link
                                             </button>

                                             <a className={styles.tripShareLink} href={tripShareUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                                                View shared trip
                                             </a>
                                          </>
                                       ) : (
                                          <button type="button" className={styles.tripShareButton} disabled={tripShareStatus === "loading"} onClick={onCreateTripShare}>
                                             {tripShareStatus === "loading" ? "Creating link…" : tripShareStatus === "error" ? "Try sharing again" : "Share trip"}
                                          </button>
                                       )}
                                    </div>
                                 ) : null}

                                 {tripShareMessage ? (
                                    <p className={styles.tripShareMessage} aria-live="polite">
                                       {tripShareMessage}
                                    </p>
                                 ) : null}

                                 {tripCopyMessage ? (
                                    <p className={styles.tripShareMessage} aria-live="polite">
                                       {tripCopyMessage}
                                    </p>
                                 ) : null}
                              </div>
                           </div>
                        </>
                     ) : null}
                  </section>
               ) : null}

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
