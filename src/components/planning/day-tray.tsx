"use client";

import { useEffect, useRef, useState } from "react";

import { dayPeriodDefinitions, dayPeriods, type DayPeriod } from "@/types/day-period";
import type { DayStop } from "@/types/day-plan";
import type { TripFolioDay } from "@/types/trip-folio";
import { getPrimaryDaySanityNote } from "@/lib/planning/day-sanity";

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

   const [activeTrayTab, setActiveTrayTab] = useState<"day" | "trip">("day");

   const [tripTitleDraft, setTripTitleDraft] = useState(tripTitle ?? "");

   const summaryButtonReference = useRef<HTMLButtonElement | null>(null);

   const trayHeadingReference = useRef<HTMLHeadingElement | null>(null);

   const trayContentReference = useRef<HTMLDivElement | null>(null);

   const clearDayButtonReference = useRef<HTMLButtonElement | null>(null);

   const cancelClearButtonReference = useRef<HTMLButtonElement | null>(null);

   const shareDayButtonReference = useRef<HTMLButtonElement | null>(null);

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

   const canAddTripDay = hasTripFolio && tripDays.length < 5;

   const currentDayNeedsTripSave = tripDayStatus !== "saved";

   const canStartAnotherTripDay = canAddTripDay && (!currentDayNeedsTripSave || isComplete);

   const canShareTrip = tripDays.length >= 2;

   /**
    * Routine success copy made the tray repeat states that are already visible.
    * Keep errors and meaningful changes visible, but let the interface itself
    * communicate ordinary saved/renamed/up-to-date states.
    */
   const visibleTripMessage = tripMessage && !tripMessage.startsWith("Day added.") && tripMessage !== "This trip day is up to date." && !tripMessage.startsWith("Trip renamed to ") ? tripMessage : "";

   const visibleTrayTab = hasTripFolio ? activeTrayTab : "day";

   const dayTabLabel = `${orderedStops.length} ${orderedStops.length === 1 ? "stop" : "stops"}`;

   const tripTabLabel = `${tripDays.length} ${tripDays.length === 1 ? "day" : "days"}`;

   const daySanityNote = isComplete ? getPrimaryDaySanityNote(orderedStops) : null;

   const isLocalTripShare = (() => {
      if (!tripShareUrl) {
         return false;
      }

      try {
         const hostname = new URL(tripShareUrl).hostname;

         return hostname === "localhost" || hostname === "127.0.0.1";
      } catch {
         return false;
      }
   })();

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

   function handleSelectTrayTab(nextTab: "day" | "trip") {
      setActiveTrayTab(nextTab);
      setIsSharePanelOpen(false);
      setCopyMessage("");
      setIsClearConfirmationOpen(false);

      // Tab changes are explicit navigation. Start each view at its beginning so
      // the tray never drops someone into the middle of a different workflow.
      window.requestAnimationFrame(() => {
         trayContentReference.current?.scrollTo({
            top: 0,
            behavior: "auto",
         });
      });
   }

   function handleAddTripDayFromTripTab() {
      setActiveTrayTab("day");
      setIsTripRenameOpen(false);
      onAddTripDay();
   }

   function handleEditTripDayFromTripTab(tripPlanningDate: string) {
      setActiveTrayTab("day");
      setIsTripRenameOpen(false);
      onEditTripDay(tripPlanningDate);
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

   async function handleShareTripLink() {
      if (!tripShareUrl) {
         return;
      }

      const shareData = {
         title: tripTitle ? `${tripTitle} · Sidewalk` : "A Sidewalk trip",
         text: "Here’s a Sidewalk trip worth keeping.",
         url: tripShareUrl,
      };

      try {
         if (typeof navigator.share === "function") {
            await navigator.share(shareData);

            setTripCopyMessage("Trip shared.");

            return;
         }

         await handleCopyTripLink();

         setTripCopyMessage("Sharing isn’t available in this browser, so Sidewalk copied the trip link instead.");
      } catch (error: unknown) {
         if (error instanceof Error && error.name === "AbortError") {
            return;
         }

         setTripCopyMessage("Sidewalk couldn’t open the share sheet. Copy the trip link instead.");
      }
   }

   return (
      <aside className={styles.tray} data-open={isOpen} aria-label={hasTripFolio ? "Your day and trip" : "Your day"}>
         <button
            ref={summaryButtonReference}
            type="button"
            className={styles.summaryButton}
            aria-expanded={isOpen}
            aria-controls="sidewalk-day-tray-content"
            aria-label={
               visibleTrayTab === "trip" && hasTripFolio
                  ? `${isOpen ? "Close" : "Open"} your trip, ${tripTitle}, with ${tripTabLabel}`
                  : `${isOpen ? "Close" : "Open"} your day for ${formattedPlanningDate || "the selected date"}, with ${dayTabLabel}`
            }
            onClick={() => {
               if (isOpen) {
                  shouldRestoreTriggerFocusReference.current = true;
               }

               onToggle();
            }}
         >
            <span className={styles.summaryHeading}>{visibleTrayTab === "trip" && hasTripFolio ? "Your trip" : "Your day"}</span>

            <span className={styles.summaryPlace}>
               {visibleTrayTab === "trip" && hasTripFolio
                  ? `${tripTitle} · ${tripTabLabel}`
                  : `${formattedPlanningDate || "New day"} · ${dayTabLabel}`}
            </span>

            <span className={styles.summaryAction}>{isOpen ? "Close" : "Open"}</span>
         </button>

         <div ref={trayContentReference} id="sidewalk-day-tray-content" className={styles.content} role="region" aria-label="Sidewalk planning tray">
            {hasTripFolio ? (
               <div className={styles.tabBar} role="tablist" aria-label="Day and trip views">
                  <button
                     id="sidewalk-day-tab"
                     type="button"
                     role="tab"
                     aria-selected={visibleTrayTab === "day"}
                     aria-controls="sidewalk-day-panel"
                     tabIndex={visibleTrayTab === "day" ? 0 : -1}
                     className={styles.tabButton}
                     data-active={visibleTrayTab === "day"}
                     onClick={() => handleSelectTrayTab("day")}
                  >
                     <span className={styles.tabLabel}>Day</span>
                     <span className={styles.tabMeta}>{dayTabLabel}</span>
                  </button>

                  <button
                     id="sidewalk-trip-tab"
                     type="button"
                     role="tab"
                     aria-selected={visibleTrayTab === "trip"}
                     aria-controls="sidewalk-trip-panel"
                     tabIndex={visibleTrayTab === "trip" ? 0 : -1}
                     className={styles.tabButton}
                     data-active={visibleTrayTab === "trip"}
                     onClick={() => handleSelectTrayTab("trip")}
                  >
                     <span className={styles.tabLabel}>Trip</span>
                     <span className={styles.tabMeta}>{tripTabLabel}</span>
                  </button>
               </div>
            ) : null}

            {visibleTrayTab === "day" ? (
               <section id="sidewalk-day-panel" className={styles.tabPanel} role={hasTripFolio ? "tabpanel" : undefined} aria-labelledby={hasTripFolio ? "sidewalk-day-tab" : undefined}>
                  <header className={styles.heading}>
                     <div>
                        <p className={styles.eyebrow}>Day plan</p>

                        <h2 ref={trayHeadingReference} id={trayTitleId} className={styles.title} tabIndex={-1}>
                           {formattedPlanningDate || "Plan a day"}
                        </h2>
                     </div>

                     <p className={styles.count}>{dayTabLabel}</p>
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
                  ) : (
                     <p className={styles.emptyDayNote}>Choose a place and it will appear here.</p>
                  )}

                  <div className={styles.footer}>
                     {orderedStops.length > 0 && (!isComplete || daySanityNote) ? (
                        <div className={styles.footerSummary}>
                           {!isComplete ? <p className={styles.completionNote}>Choose one more stop to save or share this day.</p> : null}

                           {daySanityNote ? (
                              <aside className={styles.sanityNote} aria-label="Sidewalk day note">
                                 <p className={styles.sanityLabel}>Sidewalk noticed</p>
                                 <p className={styles.sanityText}>{daySanityNote.message}</p>
                              </aside>
                           ) : null}
                        </div>
                     ) : null}

                     <div className={styles.footerActions}>
                        {!isComplete && orderedStops.length > 0 && canAddAnotherStop ? (
                           <button type="button" className={styles.continueButton} onClick={onContinuePlanning}>
                              Choose one more stop
                           </button>
                        ) : null}

                        {isComplete ? (
                           <button ref={shareDayButtonReference} type="button" className={styles.shareButton} aria-expanded={isSharePanelOpen} aria-controls="sidewalk-share-day-panel" onClick={handleOpenSharePanel}>
                              Share this day
                           </button>
                        ) : null}

                        {isComplete && canAddAnotherStop ? (
                           <button type="button" className={styles.optionalButton} onClick={onContinuePlanning}>
                              Add another stop
                           </button>
                        ) : null}
                     </div>

                     {isSharePanelOpen ? (
                        <section id="sidewalk-share-day-panel" className={styles.sharePanel} aria-labelledby={sharePanelTitleId} aria-describedby={sharePanelDescriptionId}>
                           <div className={styles.sharePanelHeading}>
                              <p className={styles.shareEyebrow}>Share this day</p>

                              <h3 id={sharePanelTitleId} className={styles.shareTitle}>
                                 Create a read-only link
                              </h3>
                           </div>

                           <p id={sharePanelDescriptionId} className={styles.shareDescription}>
                              Anyone with the link can view this day. They cannot change your plan.
                           </p>

                           {shareStatus === "loading" ? (
                              <p className={styles.shareStatus} role="status">
                                 Creating link…
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
                                    Link ready. It will work for 30 days.
                                 </p>

                                 <div className={styles.shareReadyActions}>
                                    <button type="button" className={styles.copyLinkButton} onClick={() => void handleCopyShareLink()}>
                                       Copy link
                                    </button>

                                    <a className={styles.viewSharedDayLink} href={shareUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                                       View shared day
                                    </a>
                                 </div>
                              </>
                           ) : null}

                           {shareStatus === "idle" || shareStatus === "error" ? (
                              <div className={styles.shareConfirmationActions}>
                                 <button type="button" className={styles.createShareButton} onClick={onCreateShare}>
                                    {shareStatus === "error" ? "Try again" : "Create share link"}
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

                     {isComplete && !hasTripFolio ? (
                        <section className={styles.tripStart} aria-labelledby="sidewalk-start-trip-title">
                           <div className={styles.tripShareCopy}>
                              <p className={styles.tripFolioEyebrow}>Planning more than one day?</p>
                              <h3 id="sidewalk-start-trip-title" className={styles.tripFolioTitle}>
                                 Start a trip with this day.
                              </h3>
                              <p className={styles.tripShareDescription}>Keep multiple days together so you can reopen, edit, and share the whole trip later.</p>
                           </div>

                           <button type="button" className={styles.tripFolioButton} onClick={onSaveToTrip}>
                              Start a trip
                           </button>
                        </section>
                     ) : null}

                     {hasTripFolio ? (
                        <section className={styles.tripStart} aria-label="Current day trip status">
                           <div className={styles.tripShareCopy}>
                              <p className={styles.tripFolioEyebrow}>Trip</p>

                              <h3 className={styles.tripFolioTitle}>
                                 {tripDayStatus === "saved"
                                    ? `Saved to ${tripTitle}`
                                    : tripDayStatus === "changed"
                                      ? `Save changes to ${tripTitle}`
                                      : isComplete
                                        ? `Add this day to ${tripTitle}`
                                        : `This day is not in ${tripTitle} yet`}
                              </h3>

                              <p className={styles.tripShareDescription}>
                                 {tripDayStatus === "saved"
                                    ? "This day is already part of your trip."
                                    : tripDayStatus === "changed"
                                      ? "You changed this day since it was last saved."
                                      : isComplete
                                        ? "Save this day with the rest of your trip."
                                        : "Choose at least two stops before saving this day to the trip."}
                              </p>
                           </div>

                           <div className={styles.tripShareUtilityActions}>
                              {isComplete && tripDayStatus !== "saved" ? (
                                 <button type="button" className={styles.tripFolioButton} onClick={onSaveToTrip}>
                                    {tripDayStatus === "changed" ? "Save changes" : "Save to trip"}
                                 </button>
                              ) : null}

                              <button type="button" className={styles.tripShareUtilityButton} onClick={() => handleSelectTrayTab("trip")}>
                                 View trip
                              </button>
                           </div>
                        </section>
                     ) : null}

                     {visibleTripMessage && hasTripFolio ? (
                        <p className={styles.tripFolioMessage} aria-live="polite">
                           {visibleTripMessage}
                        </p>
                     ) : null}

                     <div className={styles.trayActions}>
                        {orderedStops.length > 0 ? (
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
                        ) : null}

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
                              This removes every stop you chose. Your area, date, and preferences stay in place.
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
               </section>
            ) : null}

            {visibleTrayTab === "trip" && hasTripFolio ? (
               <section id="sidewalk-trip-panel" className={styles.tabPanel} role="tabpanel" aria-labelledby="sidewalk-trip-tab">
                  <header className={styles.tripTabHeader}>
                     <div className={styles.tripTabIdentity}>
                        <p className={styles.tripFolioEyebrow}>Your trip</p>

                        {isTripRenameOpen ? (
                           <form
                              className={styles.headerRenameForm}
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
                              <label className={styles.srOnly} htmlFor="sidewalk-trip-title-tab-input">
                                 Trip name
                              </label>

                              <input id="sidewalk-trip-title-tab-input" className={styles.headerRenameInput} type="text" value={tripTitleDraft} maxLength={80} autoComplete="off" autoFocus onChange={(event) => setTripTitleDraft(event.target.value)} />

                              <div className={styles.headerRenameActions}>
                                 <button type="submit" className={styles.headerRenameSaveButton}>
                                    Save name
                                 </button>

                                 <button
                                    type="button"
                                    className={styles.headerRenameCancelButton}
                                    onClick={() => {
                                       setTripTitleDraft(tripTitle ?? "");
                                       setIsTripRenameOpen(false);
                                    }}
                                 >
                                    Cancel
                                 </button>
                              </div>
                           </form>
                        ) : (
                           <h2 ref={trayHeadingReference} id={trayTitleId} className={styles.title} tabIndex={-1}>
                              <button type="button" className={styles.editableTripTitle} aria-label={`Rename trip: ${tripTitle ?? "Sidewalk Trip"}`} onClick={() => setIsTripRenameOpen(true)}>
                                 <span>{tripTitle}</span>
                                 <span className={styles.editableTripTitleHint}>Rename</span>
                              </button>
                           </h2>
                        )}
                     </div>

                     <p className={styles.count}>{tripTabLabel}</p>
                  </header>

                  {visibleTripMessage ? (
                     <p className={styles.tripFolioMessage} aria-live="polite">
                        {visibleTripMessage}
                     </p>
                  ) : null}

                  <section className={styles.savedDaysSection} aria-labelledby="sidewalk-saved-days-title">
                     <div className={styles.savedDaysHeading}>
                        <p id="sidewalk-saved-days-title" className={styles.tripDetailsLabel}>
                           Saved days
                        </p>
                     </div>

                     <ol className={styles.tripDayList}>
                        {tripDays.map((tripDay) => {
                           const isCurrentTripDay = tripDay.planningDate === planningDate;

                           return (
                              <li key={tripDay.planningDate} className={styles.tripDay} data-current={isCurrentTripDay}>
                                 <div className={styles.tripDayCopy}>
                                    <div className={styles.tripDayDateRow}>
                                       <p className={styles.tripDayDate}>{formatTripDayDate(tripDay.planningDate)}</p>
                                       {isCurrentTripDay ? <span className={styles.tripDayCurrent}>Open now</span> : null}
                                    </div>

                                    <p className={styles.tripDayArea}>
                                       {tripDay.localAreaName}, {tripDay.municipalityName} · {tripDay.stops.length} {tripDay.stops.length === 1 ? "stop" : "stops"}
                                    </p>
                                 </div>

                                 <div className={styles.tripDayActions}>
                                    {!isCurrentTripDay ? (
                                       <button type="button" className={styles.tripDayEditButton} onClick={() => handleEditTripDayFromTripTab(tripDay.planningDate)}>
                                          Open day
                                       </button>
                                    ) : null}

                                    <button type="button" className={styles.tripDayRemoveButton} onClick={() => onRemoveTripDay(tripDay.planningDate)}>
                                       Remove
                                    </button>
                                 </div>
                              </li>
                           );
                        })}
                     </ol>
                  </section>

                  <div className={styles.tripPrimaryActions}>
                     {canAddTripDay ? (
                        <>
                           <button type="button" className={styles.addTripDayButton} disabled={!canStartAnotherTripDay} onClick={handleAddTripDayFromTripTab}>
                              Add another day
                           </button>

                           {currentDayNeedsTripSave ? (
                              <p className={styles.tripShareDescription}>
                                 {isComplete ? "Your current day will be saved first." : "Finish this day before adding another."}
                              </p>
                           ) : null}
                        </>
                     ) : (
                        <p className={styles.tripLimitNote}>This trip has all five available days.</p>
                     )}
                  </div>

                  <section className={styles.tripShare} aria-labelledby="sidewalk-trip-share-title">
                     <div className={styles.tripShareCopy}>
                        <p id="sidewalk-trip-share-title" className={styles.tripShareLabel}>
                           Share this trip
                        </p>

                        <p className={styles.tripShareDescription}>
                           {!canShareTrip
                              ? "Add one more day to share the whole trip with one link."
                              : tripDayStatus === "changed"
                                ? "Save the open day's changes so the shared trip is up to date."
                                : "Create one read-only link for every saved day in this trip."}
                        </p>
                     </div>

                     {canShareTrip && tripDayStatus === "changed" ? (
                        <button type="button" className={styles.tripShareButton} onClick={onSaveToTrip}>
                           Save changes
                        </button>
                     ) : null}

                     {canShareTrip && tripDayStatus !== "changed" && tripShareStatus === "ready" && tripShareUrl ? (
                        <button type="button" className={styles.tripShareButton} onClick={() => void handleShareTripLink()}>
                           Share trip
                        </button>
                     ) : null}

                     {canShareTrip && tripDayStatus !== "changed" && !(tripShareStatus === "ready" && tripShareUrl) ? (
                        <button type="button" className={styles.tripShareButton} disabled={tripShareStatus === "loading"} onClick={onCreateTripShare}>
                           {tripShareStatus === "loading" ? "Creating link…" : tripShareStatus === "error" ? "Try again" : "Create trip link"}
                        </button>
                     ) : null}

                     {tripShareStatus === "ready" && tripShareUrl ? (
                        <div className={styles.tripShareUtilityActions}>
                           <button type="button" className={styles.tripShareUtilityButton} onClick={() => void handleCopyTripLink()}>
                              Copy link
                           </button>

                           <a className={styles.tripShareUtilityLink} href={tripShareUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                              View shared trip
                           </a>
                        </div>
                     ) : null}

                     {isLocalTripShare ? <p className={styles.tripShareMessage}>Local links only work on this computer. Create the final link from deployed Sidewalk.</p> : null}

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
                  </section>

                  <div className={styles.tripTabActions}>
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
               </section>
            ) : null}
         </div>
      </aside>
   );
}
