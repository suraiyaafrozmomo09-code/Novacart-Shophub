"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  direction?: "horizontal" | "vertical" | "diagonal";
  pauseOnHover?: boolean;
  yoyo?: boolean;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#5227FF", "#FF9FFC", "#B497CF"],
  animationSpeed = 8,
  direction = "horizontal",
  pauseOnHover = false,
  showBorder = false,
}: GradientTextProps) {
  const gradientAngle =
    direction === "horizontal" ? "to right" : direction === "vertical" ? "to bottom" : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");

  return (
    <span
      className={cn(
        "animated-gradient-text",
        showBorder && "with-border",
        pauseOnHover && "pause-on-hover",
        className
      )}
      style={
        {
          "--gradient-angle": gradientAngle,
          "--gradient-colors": gradientColors,
          "--animation-speed": `${animationSpeed}s`,
          "--gradient-size":
            direction === "horizontal" ? "300% 100%" : direction === "vertical" ? "100% 300%" : "300% 300%",
        } as CSSProperties
      }
    >
      {showBorder && <span className="gradient-overlay" />}
      <span className="text-content">{children}</span>
    </span>
  );
}
