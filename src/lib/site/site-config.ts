/**
 * Public site metadata shared by the App Router metadata files.
 *
 * NEXT_PUBLIC_SITE_URL is the preferred production value. Vercel's generated
 * production URL is used automatically when available, while localhost keeps
 * local builds working before deployment.
 */
function normalizeSiteUrl(value: string): URL {
   const normalizedValue =
      /^https?:\/\//i.test(value)
         ? value
         : `https://${value}`;

   try {
      return new URL(normalizedValue);
   } catch {
      return new URL("http://localhost:3000");
   }
}

function resolveSiteUrl(): URL {
   const configuredUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim();

   if (configuredUrl) {
      return normalizeSiteUrl(configuredUrl);
   }

   const vercelProductionUrl =
      process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

   if (vercelProductionUrl) {
      return normalizeSiteUrl(
         vercelProductionUrl,
      );
   }

   const vercelPreviewUrl =
      process.env.VERCEL_URL?.trim();

   if (vercelPreviewUrl) {
      return normalizeSiteUrl(
         vercelPreviewUrl,
      );
   }

   return new URL("http://localhost:3000");
}

export const siteConfig = {
   name: "Sidewalk",
   title: "Sidewalk — A Kin City Guide",
   shortName: "Sidewalk",
   description:
      "A thoughtful city guide for planning one worthwhile morning, afternoon, and evening.",
   locale: "en_US",
   language: "en-US",
   url: resolveSiteUrl(),
   themeColor: "#F7F3EA",
   backgroundColor: "#FAF7F0",
} as const;
