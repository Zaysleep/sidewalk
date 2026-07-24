import Link from "next/link";

import styles from "./recovery.module.css";

export default function NotFoundPage() {
   return (
      <main
         id="main-content"
         className={styles.page}
         tabIndex={-1}
      >
         <section
            className={styles.card}
            aria-labelledby="sidewalk-not-found-title"
            aria-describedby="sidewalk-not-found-copy"
         >
            <p className={styles.eyebrow}>
               Wrong turn
            </p>

            <h1
               id="sidewalk-not-found-title"
               className={styles.title}
            >
               This sidewalk ends here.
            </h1>

            <p
               id="sidewalk-not-found-copy"
               className={styles.copy}
            >
               The page you were looking for is not part
               of this guide. Head back to Sidewalk and
               plan something worthwhile.
            </p>

            <div className={styles.actions}>
               <Link
                  className={styles.primaryAction}
                  href="/"
               >
                  Return to Sidewalk
               </Link>
            </div>
         </section>
      </main>
   );
}
