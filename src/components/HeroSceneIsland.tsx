"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DynamicHeroScene = dynamic(
  () => import("./HeroScene").then((module) => module.HeroScene),
  {
    ssr: false,
    loading: () => null,
  },
);

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function HeroSceneIsland() {
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const idleWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;

    const schedule = () => {
      setReducedMotion(media.matches);
      if (media.matches) {
        setEnabled(false);
        return;
      }
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(() => setEnabled(true), { timeout: 900 });
      } else {
        timerHandle = window.setTimeout(() => setEnabled(true), 320);
      }
    };

    schedule();
    const onPreferenceChange = () => {
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timerHandle !== undefined) clearTimeout(timerHandle);
      setEnabled(false);
      schedule();
    };
    media.addEventListener("change", onPreferenceChange);

    return () => {
      media.removeEventListener("change", onPreferenceChange);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timerHandle !== undefined) clearTimeout(timerHandle);
    };
  }, []);

  if (!enabled) {
    return <span className="scene-status">{reducedMotion ? "Static field · reduced motion" : "Interactive field · queued"}</span>;
  }

  return <DynamicHeroScene showPoster={false} />;
}
