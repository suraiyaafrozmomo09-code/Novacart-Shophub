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
  /** Local image path to try first when the primary src fails (before AI fallback) */
  fallbackSrc?: string;
  imageSize?: ImageSize;
}

function buildGeneratedImageUrl(prompt: string, imageSize: ImageSize) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

export function SmartImage({
   src,
   alt,
   fallbackSrc,
   fallbackPrompt,
   imageSize = "square",
   ...props
 }: SmartImageProps) {
   const aiFallbackSrc = useMemo(
     () => buildGeneratedImageUrl(fallbackPrompt, imageSize),
     [fallbackPrompt, imageSize]
   );

  return (
    // eslint-disable-next-line @next/next/no-img-element
     <img
       {...props}
       src={src || fallbackSrc || aiFallbackSrc}
       alt={alt}
       onError={(event) => {
         const target = event.currentTarget;
         const stage = target.dataset.fallbackStage || "0";

         // Stage 0 → no fallback attempted yet
         if (stage === "0") {
           if (fallbackSrc && target.src !== fallbackSrc) {
             // Try local fallback image first
             target.dataset.fallbackStage = "1";
             target.src = fallbackSrc;
             return;
           }
           // No local fallback, go straight to AI
           target.dataset.fallbackStage = "2";
           target.src = aiFallbackSrc;
           return;
         }

         // Stage 1 → local fallback also failed, try AI-generated
         if (stage === "1") {
           target.dataset.fallbackStage = "2";
           target.src = aiFallbackSrc;
           return;
         }

         // Stage 2 → nothing more to try
       }}
     />
   );
 }
