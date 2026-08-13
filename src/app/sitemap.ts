import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/site-config";

function getPublicSiteUrl(): URL {
   const configuredPublicUrl = process.env.SIDEWALK_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

   if (configuredPublicUrl) {
      try {
         return new URL(configuredPublicUrl);
      } catch {
         // Fall back to the existing Sidewalk site configuration.
      }
   }

   return new URL(siteConfig.url);
}

export default function sitemap(): MetadataRoute.Sitemap {
   const publicSiteUrl = getPublicSiteUrl();

   const pages = [
      {
         path: "/",
         changeFrequency: "weekly" as const,
         priority: 1,
      },
      {
         path: "/about",
         changeFrequency: "monthly" as const,
         priority: 0.5,
      },
      {
         path: "/privacy",
         changeFrequency: "monthly" as const,
         priority: 0.4,
      },
      {
         path: "/terms",
         changeFrequency: "monthly" as const,
         priority: 0.4,
      },
      {
         path: "/feedback",
         changeFrequency: "monthly" as const,
         priority: 0.4,
      },
   ];

   return pages.map((page) => ({
      url: new URL(page.path, publicSiteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
   }));
}
