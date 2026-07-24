import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/site-config";

export default function manifest(): MetadataRoute.Manifest {
   return {
      name: siteConfig.title,
      short_name: siteConfig.shortName,
      description: siteConfig.description,

      start_url: "/",
      scope: "/",
      display: "standalone",

      background_color:
         siteConfig.backgroundColor,

      theme_color: siteConfig.themeColor,

      icons: [
         {
            src: "/sidewalk-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
         },
         {
            src: "/sidewalk-apple-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
         },
      ],
   };
}
