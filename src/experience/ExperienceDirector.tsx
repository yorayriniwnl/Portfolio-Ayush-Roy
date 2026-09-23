"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { chooseSceneQuality, type SceneQuality } from "../components/sceneQuality";
import type { HomeSection } from "./experience-state";
import { useExperienceDispatch } from "./ExperienceProvider";

const HOME_SECTIONS = new Set<HomeSection>([
  "intro",
  "identity",
  "projects",
  "about",
  "contact",
]);

function asHomeSection(value: string | undefined): HomeSection | undefined {
  if (value && HOME_SECTIONS.has(value as HomeSection)) return value as HomeSection;
  return undefined;
}

function reduceTouchQuality(quality: SceneQuality): SceneQuality {
  if (quality === "high") return "medium";
  return "low";
}

export function ExperienceDirector() {
  const pathname = usePathname() ?? "/";
  const dispatch = useExperienceDispatch();
  const activeSection = useRef<HomeSection>("intro");
  const progress = useRef(0);
  const environment = useRef({ reducedMotion: true, pageVisible: true });

  useEffect(() => {
    activeSection.current = "intro";
    progress.current = 0;
    dispatch({ type: "route", pathname });
  }, [dispatch, pathname]);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const updateEnvironment = () => {
      const reducedMotion = reducedMotionQuery.matches;
      const pageVisible = document.visibilityState === "visible";
      const touchDevice =
        coarsePointerQuery.matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      environment.current = { reducedMotion, pageVisible };

      dispatch({ type: "environment", reducedMotion, pageVisible });

      const quality = chooseSceneQuality({
        width: window.innerWidth,
        cores: navigator.hardwareConcurrency || 8,
        dpr: window.devicePixelRatio || 1,
      });
      const safeQuality =
        reducedMotion || !pageVisible
          ? "low"
          : touchDevice
            ? reduceTouchQuality(quality)
            : quality;
      dispatch({ type: "quality", quality: safeQuality });
    };

    reducedMotionQuery.addEventListener("change", updateEnvironment);
    coarsePointerQuery.addEventListener("change", updateEnvironment);
    document.addEventListener("visibilitychange", updateEnvironment);
    window.addEventListener("resize", updateEnvironment, { passive: true });
    updateEnvironment();

    return () => {
      reducedMotionQuery.removeEventListener("change", updateEnvironment);
      coarsePointerQuery.removeEventListener("change", updateEnvironment);
      document.removeEventListener("visibilitychange", updateEnvironment);
      window.removeEventListener("resize", updateEnvironment);
    };
  }, [dispatch]);

  useEffect(() => {
    let animationFrame = 0;

    const measureProgress = () => {
      animationFrame = 0;
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableDistance > 0 ? window.scrollY / scrollableDistance : 0;
      progress.current = nextProgress;
      dispatch({
        type: "section",
        section: activeSection.current,
        progress: nextProgress,
      });
    };

    const scheduleProgress = () => {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(measureProgress);
    };

    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress, { passive: true });
    scheduleProgress();

    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
    };
  }, [dispatch]);

  useEffect(() => {
    const markers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-experience-section]"),
    );
    if (markers.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (!activeEntry) return;

        const section = asHomeSection(
          (activeEntry.target as HTMLElement).dataset.experienceSection,
        );
        if (!section) return;

        activeSection.current = section;
        dispatch({ type: "section", section, progress: progress.current });
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] },
    );

    markers.forEach((marker) => observer.observe(marker));
    return () => observer.disconnect();
  }, [dispatch, pathname]);

  return null;
}
