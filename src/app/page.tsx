import type { Metadata, Viewport } from "next";

import { SidewalkPlanner } from "@/components/planning/sidewalk-planner";
import { siteConfig } from "@/lib/site/site-config";

import styles from "./page.module.css";

export const viewport: Viewport = {
   width: "device-width",
   initialScale: 1,
   colorScheme: "light",
   themeColor: siteConfig.themeColor,
};

export const metadata: Metadata = {
   metadataBase: siteConfig.url,

   title: {
      absolute: siteConfig.title,
   },

   description: siteConfig.description,

   applicationName: siteConfig.name,

   keywords: ["city guide", "day planner", "local recommendations", "neighborhood guide", "things to do", "Sidewalk", "Kin"],

   authors: [
      {
         name: "Kin",
      },
   ],

   creator: "Kin",
   publisher: "Kin",

   alternates: {
      canonical: "/",
   },

   manifest: "/manifest.webmanifest",

   appleWebApp: {
      capable: true,
      title: siteConfig.shortName,
      statusBarStyle: "default",
   },

   openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: "/",
      siteName: siteConfig.name,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [
         {
            url: "/opengraph-image",
            width: 1200,
            height: 630,
            alt: "Sidewalk — A Kin City Guide",
         },
      ],
   },

   twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: ["/twitter-image"],
   },

   robots: {
      index: true,
      follow: true,

      googleBot: {
         index: true,
         follow: true,
         "max-image-preview": "large",
         "max-snippet": -1,
         "max-video-preview": -1,
      },
   },
};

export default function HomePage() {
   return <SidewalkPlanner />;
}
