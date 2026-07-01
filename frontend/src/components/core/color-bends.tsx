"use client";

import { useState } from "react";

interface ColorBendsProps {
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  className?: string;
}

export function ColorBends({
  rotation = 90,
  colors = ["#f31d76", "#2b27cd", "#2e61ca"],
  mouseInfluence = 1,
  className = "",
}: ColorBendsProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setPosition({
          x: 50 + (x - 50) * mouseInfluence * 0.22,
          y: 50 + (y - 50) * mouseInfluence * 0.22,
        });
      }}
      style={{
        background: `
          radial-gradient(circle at ${position.x}% ${position.y}%, ${colors[0]}55 0%, transparent 28%),
          radial-gradient(circle at ${100 - position.x * 0.6}% ${position.y * 0.9}%, ${colors[1]}44 0%, transparent 34%),
          radial-gradient(circle at ${position.x * 0.7}% ${100 - position.y * 0.5}%, ${colors[2]}55 0%, transparent 32%),
          linear-gradient(${rotation}deg, rgba(2,6,23,1) 0%, rgba(15,23,42,0.94) 32%, rgba(255,255,255,0.08) 100%)
        `,
      }}
    >
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
    </div>
  );
}
