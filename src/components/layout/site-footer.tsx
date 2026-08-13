import Link from "next/link";

import styles from "./site-footer.module.css";

type SiteFooterProps = Readonly<{
   hasDayTray?: boolean;
}>;

export function SiteFooter({ hasDayTray = false }: SiteFooterProps) {
   return (
      <footer className={`${styles.footer} ${hasDayTray ? styles.withDayTray : ""}`}>
         <div className={styles.identity}>
            <span className={styles.brand}>Sidewalk</span>

            <span className={styles.edition}>A Kin city guide</span>
         </div>

         <nav className={styles.links} aria-label="Sidewalk information">
            <Link href="/about">About</Link>

            <Link href="/privacy">Privacy</Link>

            <Link href="/terms">Terms</Link>

            <Link href="/feedback">Send feedback</Link>
         </nav>
      </footer>
   );
}
