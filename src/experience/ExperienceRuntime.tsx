"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ExperienceDirector } from "./ExperienceDirector";
import { ExperienceProvider } from "./ExperienceProvider";
import { ExperienceSceneLayer } from "./ExperienceSceneLayer";

export function ExperienceRuntime({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <ExperienceProvider initialPathname={pathname}>
      <ExperienceDirector />
      <ExperienceSceneLayer />
      {children}
    </ExperienceProvider>
  );
}
