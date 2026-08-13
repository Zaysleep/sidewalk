import { createSharedTripPreviewImage, sharedTripPreviewSize } from "@/lib/sharing/shared-trip-preview-image";
import { isShortSharedTripToken, readSharedTripSnapshot } from "@/lib/sharing/shared-trip-store";
import { verifySharedTripToken } from "@/lib/sharing/shared-trip-token";
import { siteConfig } from "@/lib/site/site-config";
import type { SharedTripSnapshot } from "@/types/shared-trip";

export const alt = "A shared Sidewalk trip";

export const size = sharedTripPreviewSize;

export const contentType = "image/png";

type ImageProps = Readonly<{
   params: Promise<{
      token: string;
   }>;
}>;

async function readSnapshot(token: string): Promise<SharedTripSnapshot | null> {
   try {
      if (isShortSharedTripToken(token)) {
         const result = await readSharedTripSnapshot(token);

         return result.status === "ready" ? result.snapshot : null;
      }

      if (token.startsWith("t1.")) {
         const verification = verifySharedTripToken(token);

         return verification.ok ? verification.snapshot : null;
      }

      return null;
   } catch {
      return null;
   }
}

export default async function SharedTripSocialImage({ params }: ImageProps) {
   const { token } = await params;
   const snapshot = await readSnapshot(token);

   if (!snapshot) {
      throw new Error("Shared trip preview is unavailable.");
   }

   const configuredPublicUrl = process.env.SIDEWALK_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

   const publicSiteUrl = configuredPublicUrl ? new URL(configuredPublicUrl) : new URL(siteConfig.url);

   const iconUrl = new URL("/sidewalk-icon.png", publicSiteUrl).toString();

   return createSharedTripPreviewImage(snapshot, iconUrl);
}
