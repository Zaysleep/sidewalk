"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./sidewalk-tutorial.module.css";

type SidewalkTutorialProps = Readonly<{
   isOpen: boolean;
   onClose: () => void;
}>;

const tutorialSteps = [
   {
      eyebrow: "Start with a place",
      title: "Choose where and when.",
      body: "Pick a country, metro, local area, and date. Sidewalk keeps the geography underneath broad while showing only the choices you need right now.",
   },
   {
      eyebrow: "Build one part at a time",
      title: "Tell Sidewalk what sounds worthwhile.",
      body: "Move through the parts of the day, choose an activity direction, and add a place when it feels right. Two stops are enough for a saved day; the rest stays optional.",
   },
   {
      eyebrow: "Keep the day useful",
      title: "Review, change, or share from Your Day.",
      body: "Open Your Day to change a stop, remove something, check a quiet planning note, or create a read-only share link without leaving the planner.",
   },
   {
      eyebrow: "Continue only when you need to",
      title: "Turn a day into a trip.",
      body: "Save a day to a trip, add another date, and Sidewalk will remember what you already used so it can avoid duplicate places. Share the whole trip once you have two saved days.",
   },
] as const;

const focusableSelector = [
   "button:not([disabled])",
   "a[href]",
   "input:not([disabled])",
   "select:not([disabled])",
   "textarea:not([disabled])",
   '[tabindex]:not([tabindex="-1"])',
].join(",");

export function SidewalkTutorial({ isOpen, onClose }: SidewalkTutorialProps) {
   const [stepIndex, setStepIndex] = useState(0);
   const [isMounted, setIsMounted] = useState(false);
   const dialogReference = useRef<HTMLDivElement | null>(null);
   const closeButtonReference = useRef<HTMLButtonElement | null>(null);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   useEffect(() => {
      if (!isOpen) {
         setStepIndex(0);
         return;
      }

      const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const frameId = window.requestAnimationFrame(() => {
         closeButtonReference.current?.focus();
      });

      function handleKeyDown(event: KeyboardEvent) {
         if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
         }

         if (event.key !== "Tab" || !dialogReference.current) {
            return;
         }

         const focusableElements = Array.from(dialogReference.current.querySelectorAll<HTMLElement>(focusableSelector)) as HTMLElement[];

         if (focusableElements.length === 0) {
            return;
         }

         const firstElement = focusableElements[0];
         const lastElement = focusableElements[focusableElements.length - 1];

         if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
         } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
         }
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);

      return () => {
         window.cancelAnimationFrame(frameId);
         document.removeEventListener("keydown", handleKeyDown);
         document.body.style.overflow = previousOverflow;
         previousActiveElement?.focus();
      };
   }, [isOpen, onClose]);

   if (!isOpen || !isMounted) {
      return null;
   }

   const step = tutorialSteps[stepIndex];
   const isFirstStep = stepIndex === 0;
   const isLastStep = stepIndex === tutorialSteps.length - 1;

   const modal = (
      <div className={styles.backdrop} role="presentation" onClick={onClose}>
         <div
            ref={dialogReference}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidewalk-tutorial-title"
            aria-describedby="sidewalk-tutorial-body"
            onClick={(event) => event.stopPropagation()}
         >
            <div className={styles.header}>
               <div className={styles.headerMeta}>
                  <span className={styles.progressBadge}>How Sidewalk works</span>
                  <span className={styles.progressText}>{stepIndex + 1} of {tutorialSteps.length}</span>
               </div>

               <button ref={closeButtonReference} type="button" className={styles.closeButton} onClick={onClose}>
                  Close
               </button>
            </div>

            <div className={styles.main}>
               <div className={styles.content}>
                  <p className={styles.eyebrow}>{step.eyebrow}</p>

                  <h2 id="sidewalk-tutorial-title" className={styles.title}>{step.title}</h2>

                  <p id="sidewalk-tutorial-body" className={styles.body}>{step.body}</p>
               </div>

               <aside className={styles.desktopOverview} aria-label="Tutorial overview">
                  <p className={styles.overviewLabel}>In this guide</p>

                  <ol className={styles.overviewList}>
                     {tutorialSteps.map((tutorialStep, index) => (
                        <li
                           key={tutorialStep.title}
                           className={styles.overviewItem}
                           data-active={index === stepIndex}
                        >
                           <span className={styles.overviewNumber}>{String(index + 1).padStart(2, "0")}</span>
                           <span className={styles.overviewCopy}>
                              <span className={styles.overviewEyebrow}>{tutorialStep.eyebrow}</span>
                              <span className={styles.overviewTitle}>{tutorialStep.title}</span>
                           </span>
                        </li>
                     ))}
                  </ol>
               </aside>
            </div>

            <div className={styles.footer}>
               <div className={styles.stepDots} aria-label={`Tutorial step ${stepIndex + 1} of ${tutorialSteps.length}`}>
                  {tutorialSteps.map((tutorialStep, index) => (
                     <span key={tutorialStep.title} className={styles.stepDot} data-active={index === stepIndex} aria-hidden="true" />
                  ))}
               </div>

               <div className={styles.actions}>
                  <button
                     type="button"
                     className={styles.secondaryButton}
                     disabled={isFirstStep}
                     onClick={() => setStepIndex((current: number) => Math.max(0, current - 1))}
                  >
                     Back
                  </button>

                  {isLastStep ? (
                     <button type="button" className={styles.primaryButton} onClick={onClose}>
                        Start planning
                     </button>
                  ) : (
                     <button type="button" className={styles.primaryButton} onClick={() => setStepIndex((current: number) => Math.min(tutorialSteps.length - 1, current + 1))}>
                        Next
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );

   return createPortal(modal, document.body);
}
