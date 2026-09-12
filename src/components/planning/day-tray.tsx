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

   requestedTab?: "day" | "trip" | null;
   requestedTabVersion?: number;

   onToggle: () => void;
   onDone: () => void;
   onRemove: (stopId: string) => void;
   onClearDay: () => void;
   unavailablePeriods: readonly DayPeriod[];
   canAddAnotherStop: boolean;
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
   requestedTab = null,
   requestedTabVersion = 0,
   onToggle,
   onDone,
   onRemove,
   onClearDay,
   unavailablePeriods,
   canAddAnotherStop,
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

   useEffect(() => {
      if (!requestedTab) {
         return;
      }

      if (requestedTab === "trip" && !hasTripFolio) {
         return;
      }

      setActiveTrayTab(requestedTab);
   }, [hasTripFolio, requestedTab, requestedTabVersion]);

   if (stops.length === 0 && !hasTripFolio) {
      return null;
   }

   const orderedStops = sortStops(stops);

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

   const dayLocationLabel =
      orderedStops.length > 0
         ? `${orderedStops[0].localAreaName}, ${orderedStops[0].municipalityName}`
         : "";

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

      /*
       * Sharing should be one obvious action. If Sidewalk does not already
       * have a link, the first tap starts creating it instead of opening a
       * second confirmation step that asks the user to create the link again.
       */
      if (shareStatus === "idle" || shareStatus === "error") {
         onCreateShare();
      }
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

   function handleStartTripFromDay() {
      setActiveTrayTab("trip");
      setIsSharePanelOpen(false);
      setIsClearConfirmationOpen(false);
      onSaveToTrip();
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

   async function handleShareDayLink() {
      if (!shareUrl) {
         return;
      }

      const shareData = {
         title: `${formattedPlanningDate || "A Sidewalk day"} · Sidewalk`,
         text: "Here’s a Sidewalk day worth keeping.",
         url: shareUrl,
      };

      try {
         if (typeof navigator.share === "function") {
            await navigator.share(shareData);
            setCopyMessage("Day shared.");
            return;
         }

         await handleCopyShareLink();
         setCopyMessage("Sharing isn’t available in this browser, so Sidewalk copied the link instead.");
      } catch (error: unknown) {
         if (error instanceof Error && error.name === "AbortError") {
            return;
         }

         setCopyMessage("Sidewalk couldn’t open the share sheet. Copy the link instead.");
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
               {isOpen
                  ? ""
                  : visibleTrayTab === "trip" && hasTripFolio
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
                  <header className={styles.dayHeader}>
                     <h2 ref={trayHeadingReference} id={trayTitleId} className={styles.title} tabIndex={-1}>
                        {formattedPlanningDate || "Plan a day"}
                     </h2>

                     {dayLocationLabel ? (
                        <p className={styles.dayContext}>
                           {dayLocationLabel}
                           {!hasTripFolio ? ` · ${dayTabLabel}` : ""}
                        </p>
                     ) : null}
                  </header>

                  <div className={styles.dayActionCluster} aria-label="Day actions">
                     {isComplete ? (
                        <button
                           ref={shareDayButtonReference}
                           type="button"
                           className={styles.shareButton}
                           aria-expanded={isSharePanelOpen}
                           aria-controls="sidewalk-share-day-panel"
                           onClick={isSharePanelOpen ? handleCloseSharePanel : handleOpenSharePanel}
                        >
                           Share this day
                        </button>
                     ) : null}

                     {orderedStops.length > 0 && canAddAnotherStop ? (
                        <button type="button" className={isComplete ? styles.optionalButton : styles.continueButton} onClick={onContinuePlanning}>
                           {isComplete ? "Add another stop" : "Choose one more stop"}
                        </button>
                     ) : null}

                     {isComplete && !hasTripFolio ? (
                        <button type="button" className={styles.tripFolioButton} onClick={handleStartTripFromDay}>
                           Start a trip
                        </button>
                     ) : null}

                     {hasTripFolio && isComplete && tripDayStatus !== "saved" ? (
                        <button type="button" className={styles.tripFolioButton} onClick={onSaveToTrip}>
                           {tripDayStatus === "changed" ? "Save changes" : "Save to trip"}
                        </button>
                     ) : null}
                  </div>

                  {hasTripFolio && tripDayStatus === "saved" ? (
                     <p className={styles.dayTripStatus}>Saved in {tripTitle}</p>
                  ) : null}

                  {isSharePanelOpen ? (
                     <section id="sidewalk-share-day-panel" className={styles.sharePanel} aria-labelledby={sharePanelTitleId} aria-describedby={sharePanelDescriptionId}>
                        <div className={styles.sharePanelHeading}>
                           <h3 id={sharePanelTitleId} className={styles.shareTitle}>
                              Share link
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
                           <>
                              <p className={styles.shareError} role="alert">
                                 {shareMessage || "Sidewalk could not create the link right now."}
                              </p>

                              <button type="button" className={styles.createShareButton} onClick={onCreateShare}>
                                 Try again
                              </button>
                           </>
                        ) : null}

                        {shareStatus === "ready" && shareUrl ? (
                           <>
                              <p className={styles.shareStatus} role="status">
                                 Ready to share. This link will work for 30 days.
                              </p>

                              <div className={styles.shareReadyActions}>
                                 <button type="button" className={styles.copyLinkButton} onClick={() => void handleShareDayLink()}>
                                    Share day
                                 </button>

                                 <button type="button" className={styles.viewSharedDayLink} onClick={() => void handleCopyShareLink()}>
                                    Copy link
                                 </button>

                                 <a className={styles.viewSharedDayLink} href={shareUrl} target="_blank" rel="noreferrer noopener" referrerPolicy="no-referrer">
                                    View shared day
                                 </a>
                              </div>
                           </>
                        ) : null}

                        <p className={styles.copyMessage} aria-live="polite">
                           {copyMessage}
                        </p>
                     </section>
                  ) : null}

                  {orderedStops.length > 0 ? (
                     <div className={styles.stopList}>
                        {orderedStops.map((stop) => {
                           const periodLabel = getPeriodLabel(stop.dayPeriod);
                           const isPastPeriod = unavailablePeriods.includes(stop.dayPeriod);

                           return (
                              <article key={stop.id} className={styles.stop} aria-labelledby={`day-stop-title-${stop.id}`}>
                                 <details className={styles.stopDisclosure}>
                                    <summary className={styles.stopSummary}>
                                       <span className={styles.stopSummaryCopy}>
                                          <span className={styles.stopHeading}>
                                             <span className={styles.stopLabel}>{periodLabel}</span>
                                             <span className={styles.window}>{stop.bestWindow}</span>
                                          </span>

                                          <span id={`day-stop-title-${stop.id}`} className={styles.stopName}>
                                             {stop.placeName}
                                          </span>
                                       </span>

                                       <span className={styles.stopDisclosureIcon} aria-hidden="true">+</span>
                                    </summary>

                                    <div className={styles.stopActions}>
                                       {stop.locationUrl ? (
                                          <a className={styles.locationLink} href={stop.locationUrl} target="_blank" rel="noreferrer" aria-label={`Open ${stop.placeName} location in a new tab`}>
                                             Open location
                                          </a>
                                       ) : null}

                                       <button
                                          type="button"
                                          className={styles.editButton}
                                          aria-label={isPastPeriod ? `${periodLabel} has already passed` : `Change the ${periodLabel} stop`}
                                          disabled={isPastPeriod}
                                          onClick={() => onEditPeriod(stop.dayPeriod)}
                                       >
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
                                 </details>
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

                     {!isComplete && orderedStops.length > 0 && !canAddAnotherStop ? (
                        <p className={styles.completionNote}>There are no remaining time windows to add today.</p>
                     ) : null}

                     {visibleTripMessage && hasTripFolio ? (
                        <p className={styles.tripFolioMessage} aria-live="polite">
                           {visibleTripMessage}
                        </p>
                     ) : null}

                     {orderedStops.length > 0 ? (
                        <div className={styles.dayUtilities}>
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
                        </div>
                     ) : null}

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
                  </header>

                  {visibleTripMessage ? (
                     <p className={styles.tripFolioMessage} aria-live="polite">
                        {visibleTripMessage}
                     </p>
                  ) : null}

                  <div className={styles.tripNextDayAction}>
                     {canAddTripDay ? (
                        <>
                           <button type="button" className={styles.addTripDayButton} disabled={!canStartAnotherTripDay} onClick={handleAddTripDayFromTripTab}>
                              Start next day
                           </button>

                           {currentDayNeedsTripSave && !isComplete ? (
                              <p className={styles.tripShareDescription}>Finish this day before starting the next one.</p>
                           ) : null}
                        </>
                     ) : (
                        <p className={styles.tripLimitNote}>This trip has all five available days.</p>
                     )}
                  </div>

                  {canShareTrip ? (
                     <section className={styles.tripShare} aria-labelledby="sidewalk-trip-share-title">
                        <div className={styles.tripShareCopy}>
                           <p id="sidewalk-trip-share-title" className={styles.tripShareLabel}>
                              Share the whole trip
                           </p>

                           <p className={styles.tripShareDescription}>One read-only link for every saved day.</p>
                        </div>

                        {tripDayStatus === "changed" ? (
                           <button type="button" className={styles.tripShareButton} onClick={onSaveToTrip}>
                              Save changes to share
                           </button>
                        ) : tripShareStatus === "ready" && tripShareUrl ? (
                           <button type="button" className={styles.tripShareButton} onClick={() => void handleShareTripLink()}>
                              Share this trip
                           </button>
                        ) : (
                           <button type="button" className={styles.tripShareButton} disabled={tripShareStatus === "loading"} onClick={onCreateTripShare}>
                              {tripShareStatus === "loading" ? "Creating link…" : tripShareStatus === "error" ? "Try sharing again" : "Share this trip"}
                           </button>
                        )}

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
                  ) : (
                     <p className={styles.tripShareHint}>Add one more day to share this trip.</p>
                  )}

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
                                       {isCurrentTripDay ? <span className={styles.tripDayCurrent}>Current day</span> : null}
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

               </section>
            ) : null}
         </div>
      </aside>
   );
}
