import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Newsreader } from "next/font/google";

import "./globals.css";

/**
 * Geist provides clear, compact interface typography for navigation,
 * controls, labels, and body copy.
 */
const geist = Geist({
   subsets: ["latin"],
   variable: "--font-geist",
   display: "swap",
});

/**
 * Newsreader gives Sidewalk its editorial voice while remaining readable at
 * both feature-heading and section-heading sizes.
 */
const newsreader = Newsreader({
   subsets: ["latin"],
   variable: "--font-newsreader",
   display: "swap",
});

/**
 * Global metadata shared across the Sidewalk application.
 *
 * Future metro editions can provide their own page titles while inheriting the
 * shared Sidewalk title template.
 */
export const metadata: Metadata = {
   title: {
      default: "Sidewalk",
      template: "%s | Sidewalk",
   },
   description: "Sidewalk is a modern editorial city guide that helps people turn free time into a thoughtfully planned day.",
};

/**
 * Props accepted by the root application layout.
 */
type RootLayoutProps = Readonly<{
   children: ReactNode;
}>;

/**
 * RootLayout provides the document structure shared by every Sidewalk page.
 *
 * Font variables are placed on the body so all descendants can use the shared
 * typography tokens without loading fonts inside individual components.
 */
export default function RootLayout({ children }: RootLayoutProps) {
   return (
      <html lang="en">
         <body className={`${geist.variable} ${newsreader.variable}`}>
            {/* Allows keyboard users to bypass repeated page-level content. */}
            <a className="skip-link" href="#main-content">
               Skip to main content
            </a>

            <div className="site-frame">{children}</div>
         </body>
      </html>
   );
}
