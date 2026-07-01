"use client";

import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DockContext = createContext<{ active: number | null; setActive: (value: number | null) => void }>({
  active: null,
  setActive: () => undefined,
});

export function Dock({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <DockContext.Provider value={{ active, setActive }}>
      <div
        className={cn(
          "inline-flex items-end gap-3 rounded-full border border-black/10 bg-white/80 px-3 py-2 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
}

export function DockItem({
  children,
  className,
  index,
  ...props
}: HTMLAttributes<HTMLDivElement> & { index?: number }) {
  const { active, setActive } = useContext(DockContext);
  const isActive = active === index;

  return (
    <div
      className={cn(
        "group relative flex h-14 w-14 items-center justify-center rounded-full border border-black/5 bg-white text-slate-900 transition duration-300 hover:-translate-y-2 hover:shadow-xl",
        isActive ? "scale-110 bg-slate-950 text-white shadow-xl" : "scale-100",
        className
      )}
      onMouseEnter={() => setActive(index ?? null)}
      onMouseLeave={() => setActive(null)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DockIcon({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-6 w-6 items-center justify-center", className)}>{children}</div>;
}

export function DockLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white opacity-0 transition duration-200 group-hover:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}
