"use client";

import type { ImgHTMLAttributes } from "react";
import { useMemo } from "react";

type ImageSize =
  | "square_hd"
  | "square"
  | "portrait_3_4"
  | "portrait_9_16"
  | "landscape_4_3"
  | "landscape_16_9";

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackPrompt: string;
  imageSize?: ImageSize;
}

function buildGeneratedImageUrl(prompt: string, imageSize: ImageSize) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

export function SmartImage({
   src,
   alt,
   fallbackPrompt,
   imageSize = "square",
   ...props
 }: SmartImageProps) {
   const fallbackSrc = useMemo(
     () => buildGeneratedImageUrl(fallbackPrompt, imageSize),
     [fallbackPrompt, imageSize]
   );

  return (
    // eslint-disable-next-line @next/next/no-img-element
     <img
       {...props}
       src={src || fallbackSrc}
       alt={alt}
       onError={(event) => {
         const target = event.currentTarget;
         if (target.dataset.fallbackApplied === "true") {
           return;
         }

         target.dataset.fallbackApplied = "true";
         target.src = fallbackSrc;
       }}
     />
   );
 }
