"use client";

import type { CSSProperties, ReactNode } from "react";
import { useExperience } from "@/experience/ExperienceProvider";

export function MachineScrollBinding({ children }: { children: ReactNode }) {
  const { state } = useExperience();
  const progress = state.reducedMotion ? 0 : state.progress;
  const separation = Math.max(0, Math.min(1, progress / 0.18));
  const style = {
    "--machine-scroll-progress": progress.toFixed(4),
    "--machine-wordmark-left": (separation * -5).toFixed(2) + "vw",
    "--machine-wordmark-right": (separation * 5).toFixed(2) + "vw",
    "--machine-wordmark-rise": (separation * -10).toFixed(2) + "px",
    "--machine-copy-lift": (progress * -18).toFixed(2) + "px",
    "--machine-progress-width": (progress * 100).toFixed(2) + "vw",
    "--machine-core-open": progress.toFixed(4),
  } as CSSProperties;

  return (
    <div
      className="machine-scroll-binding"
      data-machine-section={state.section}
      data-machine-motion={state.reducedMotion ? "reduced" : "full"}
      style={style}
    >
      {children}
    </div>
  );
}
