"use client";

import { useEffect } from "react";

import styles from "./recovery.module.css";

type GlobalErrorPageProps = Readonly<{
   error: Error & {
      digest?: string;
   };

   reset: () => void;
}>;

/**
 * Root-level fallback used only when the application shell itself cannot
 * render. It includes its own html and body elements as required by Next.js.
 */
export default function GlobalErrorPage({
   error,
   reset,
}: GlobalErrorPageProps) {
   useEffect(() => {
      console.error("Sidewalk global error", {
         name: error.name,
         digest: error.digest,
      });
   }, [error]);

   return (
      <html lang="en">
         <body>
            <main
               id="main-content"
               className={styles.page}
               tabIndex={-1}
            >
               <section
                  className={styles.card}
                  aria-labelledby="sidewalk-global-error-title"
                  aria-describedby="sidewalk-global-error-copy"
               >
                  <p className={styles.eyebrow}>
                     Sidewalk needs a reset
                  </p>

                  <h1
                     id="sidewalk-global-error-title"
                     className={styles.title}
                  >
                     The guide could not open.
                  </h1>

                  <p
                     id="sidewalk-global-error-copy"
                     className={styles.copy}
                  >
                     Your browser may still have your
                     saved day. Try opening Sidewalk
                     again before starting over.
                  </p>

                  <div className={styles.actions}>
                     <button
                        type="button"
                        className={
                           styles.primaryAction
                        }
                        onClick={reset}
                     >
                        Try again
                     </button>

                     <a
                        className={
                           styles.secondaryAction
                        }
                        href="/"
                     >
                        Reload Sidewalk
                     </a>
                  </div>

                  {error.digest ? (
                     <p className={styles.support}>
                        Reference: {error.digest}
                     </p>
                  ) : null}
               </section>
            </main>
         </body>
      </html>
   );
}
