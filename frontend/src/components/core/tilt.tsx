"use client";

import { useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  rotationFactor?: number;
  isRevese?: boolean;
}

export function Tilt({
  children,
  rotationFactor = 8,
  isRevese = false,
  className,
  ...props
}: TiltProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
  });

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * rotationFactor * (isRevese ? -1 : 1);
    const rotateX = (0.5 - py) * rotationFactor * (isRevese ? -1 : 1);

    setStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015,1.015,1.015)`,
    });
  };

  const reset = () => {
    setStyle({
      transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
    });
  };

  return (
    <div
      ref={ref}
      className={cn("transform-gpu transition-transform duration-300 will-change-transform", className)}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      {...props}
    >
      {children}
    </div>
  );
}
