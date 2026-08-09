/**
 * Props allow the footer to reserve mobile space when the persistent day tray
 * is present at the bottom of the viewport.
 */
type SiteFooterProps = Readonly<{
   hasDayTray?: boolean;
}>;

/**
 * The footer stays minimal so the page ends with the product rather than
 * another explanatory section.
 */
export function SiteFooter({ hasDayTray = false }: SiteFooterProps) {
   const className = hasDayTray ? "site-footer site-footer--with-day-tray" : "site-footer";

   return (
      <footer className={className}>
         <p className="site-footer__brand">Sidewalk</p>
         <p className="site-footer__credit">© 2026 Sidewalk is operated by Kin Software LLC</p>
      </footer>
   );
}
