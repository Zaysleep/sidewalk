"use client";

import Link from "next/link";
import { useEffect } from "react";

import styles from "./recovery.module.css";

type ErrorPageProps = Readonly<{
   error: Error & {
      digest?: string;
   };

   reset: () => void;
}>;

/**
 * Segment-level recovery screen. The user's Sidewalk day remains in
 * sessionStorage, so retrying does not discard a saved plan.
 */
export default function ErrorPage({
   error,
   reset,
}: ErrorPageProps) {
   useEffect(() => {
      console.error("Sidewalk page error", {
         name: error.name,
         digest: error.digest,
      });
   }, [error]);

   return (
      <main
         id="main-content"
         className={styles.page}
         tabIndex={-1}
      >
         <section
            className={styles.card}
            aria-labelledby="sidewalk-error-title"
            aria-describedby="sidewalk-error-copy"
         >
            <p className={styles.eyebrow}>
               Something went sideways
            </p>

            <h1
               id="sidewalk-error-title"
               className={styles.title}
            >
               Sidewalk lost the thread.
            </h1>

            <p
               id="sidewalk-error-copy"
               className={styles.copy}
            >
               Your saved day is still here. Try this
               part again, or return to the beginning
               and pick up where you left off.
            </p>

            <div className={styles.actions}>
               <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={reset}
               >
                  Try again
               </button>

               <Link
                  className={styles.secondaryAction}
                  href="/"
               >
                  Return to Sidewalk
               </Link>
            </div>

            {error.digest ? (
               <p className={styles.support}>
                  Reference: {error.digest}
               </p>
            ) : null}
         </section>
      </main>
   );
}
