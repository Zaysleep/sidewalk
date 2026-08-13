import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";

import styles from "./info-page-shell.module.css";

type InfoPageShellProps = Readonly<{
   eyebrow: string;
   title: string;
   introduction: string;
   children: ReactNode;
}>;

export function InfoPageShell({ eyebrow, title, introduction, children }: InfoPageShellProps) {
   return (
      <>
         <header className={styles.masthead}>
            <Link href="/" className={styles.brand} aria-label="Sidewalk home">
               <span className={styles.wordmark}>Sidewalk</span>

               <span className={styles.edition}>A Kin city guide</span>
            </Link>
         </header>

         <main id="main-content" className={styles.main} tabIndex={-1}>
            <article className={styles.article}>
               <header className={styles.hero}>
                  <p className={styles.eyebrow}>{eyebrow}</p>

                  <h1 className={styles.title}>{title}</h1>

                  <p className={styles.introduction}>{introduction}</p>
               </header>

               <div className={styles.content}>{children}</div>

               <Link href="/" className={styles.returnLink}>
                  Return to Sidewalk
               </Link>
            </article>
         </main>

         <SiteFooter />
      </>
   );
}
