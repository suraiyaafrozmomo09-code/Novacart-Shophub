"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface ImageTrailProps {
  images?: string[];
  variant?: "1";
}

export function ImageTrail({ images = [], variant = "1" }: ImageTrailProps) {
  const [points, setPoints] = useState<TrailPoint[]>([]);
  const gallery = useMemo(
    () =>
      images.length > 0
        ? images
        : ["/product-images/tshirt.jpg", "/product-images/watch.jpg", "/product-images/panjabi.jpg", "/product-images/headphones.jpg"],
    [images]
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/90"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setPoints((prev) => [{ x, y, id: Date.now() }, ...prev].slice(0, variant === "1" ? 7 : 5));
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent_30%)]" />
      {points.map((point, index) => (
        <img
          key={point.id}
          src={gallery[index % gallery.length]}
          alt=""
          className="pointer-events-none absolute h-28 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl object-cover shadow-2xl transition duration-500"
          style={{
            left: point.x,
            top: point.y,
            opacity: Math.max(0.12, 1 - index * 0.14),
            rotate: `${index % 2 === 0 ? 8 : -8}deg`,
            scale: `${1 - index * 0.06}`,
          }}
        />
      ))}
    </div>
  );
}
