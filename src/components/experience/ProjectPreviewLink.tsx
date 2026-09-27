"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useExperienceDispatch, useExperienceProject } from "@/experience/ExperienceProvider";
import type { ProjectId } from "@/experience/experience-state";

export function ProjectPreviewLink({
  projectId,
  href,
  children,
  className,
  ariaLabel,
}: {
  projectId: ProjectId;
  href: string;
  children: ReactNode;
  className: string;
  ariaLabel?: string;
}) {
  const dispatch = useExperienceDispatch();
  const { projectId: routeProject, activeProject } = useExperienceProject();
  const isActive = activeProject === projectId || (!activeProject && routeProject === projectId);

  const activate = () => dispatch({ type: "project", projectId });
  const release = (element: HTMLAnchorElement) => {
    if (element.matches(":hover") || element.matches(":focus")) return;
    if (activeProject === projectId) dispatch({ type: "project" });
  };

  return (
    <Link
      className={className}
      href={href}
      data-project-active={isActive ? "true" : "false"}
      aria-label={ariaLabel}
      onPointerEnter={activate}
      onPointerLeave={(event) => release(event.currentTarget)}
      onFocus={activate}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        release(event.currentTarget);
      }}
      onTouchStart={activate}
      onClick={activate}
    >
      {children}
    </Link>
  );
}
