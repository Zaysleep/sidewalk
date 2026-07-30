"use client";

import Image from "next/image";
import { useState } from "react";

type SharedDayPhotoProps = Readonly<{
   resourceName: string | null;
   placeName: string;
   className: string;
   fallbackClassName: string;
   priority?: boolean;
}>;

/**
 * SharedDayPhoto keeps provider failures from leaving a broken image inside a
 * public itinerary. Missing or unavailable photos quietly fall back to an
 * editorial Sidewalk surface.
 */
export function SharedDayPhoto({
   resourceName,
   placeName,
   className,
   fallbackClassName,
   priority = false,
}: SharedDayPhotoProps) {
   const [hasFailed, setHasFailed] = useState(false);

   if (!resourceName || hasFailed) {
      return (
         <div className={fallbackClassName} aria-hidden="true">
            <span>Sidewalk</span>
         </div>
      );
   }

   const photoSource = `/api/places/photo?resourceName=${encodeURIComponent(resourceName)}`;

   return (
      <div className={className}>
         <Image
            src={photoSource}
            alt={`${placeName} in the shared Sidewalk day`}
            fill
            sizes="(max-width: 47.99rem) 100vw, 42vw"
            priority={priority}
            unoptimized
            onError={() => setHasFailed(true)}
         />
      </div>
   );
}
