import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
   return [
      {
         url: siteConfig.url.toString(),
         lastModified: new Date(),
         changeFrequency: "weekly",
         priority: 1,
      },
   ];
}
