"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const Scene = dynamic(
  () => import("./YorWorldShowcaseScene").then((module) => module.YorWorldShowcaseScene),
  { ssr: false, loading: () => null },
);

class StudioErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

type CameraPosition = { x: number; y: number; z: number; distance: number };

/** The scene is an object viewer. Navigation belongs to the separate HTML link. */
export function StudioRoom() {
  const root = useRef<HTMLDivElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const lastCamera = useRef<CameraPosition | null>(null);
  const [requested, setRequested] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [manualLoad, setManualLoad] = useState(false);
  const [graphicsAvailable, setGraphicsAvailable] = useState<boolean | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [resetSequence, setResetSequence] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const announceReady = useCallback(() => setSceneReady(true), []);
  const reportFailed = useCallback(() => setSceneFailed(true), []);
  const reportCamera = useCallback((camera: CameraPosition) => {
    if (!root.current || !Object.values(camera).every(Number.isFinite)) return;
    const previous = lastCamera.current;
    const changed = previous && ["x", "y", "z", "distance"].some((key) =>
      Math.abs(camera[key as keyof CameraPosition] - previous[key as keyof CameraPosition]) > .0001);
    if (changed) root.current.dataset.interactionCount = String(Number(root.current.dataset.interactionCount || 0) + 1);
    root.current.dataset.cameraX = camera.x.toFixed(4);
    root.current.dataset.cameraY = camera.y.toFixed(4);
    root.current.dataset.cameraZ = camera.z.toFixed(4);
    root.current.dataset.cameraDistance = camera.distance.toFixed(4);
    lastCamera.current = camera;
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setAnimationPaused(true);
      setPreferencesReady(true);
    };
    const frame = window.requestAnimationFrame(update);
    media.addEventListener("change", update);
    return () => { window.cancelAnimationFrame(frame); media.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    const frame = window.requestAnimationFrame(update);
    document.addEventListener("visibilitychange", update);
    return () => { window.cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    const probe = document.createElement("canvas");
    let available = false;
    try {
      const context = probe.getContext("webgl2");
      available = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { available = false; }
    const frame = window.requestAnimationFrame(() => setGraphicsAvailable(available));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => { setRequested(true); setInViewport(true); });
      return () => window.cancelAnimationFrame(frame);
    }
    const preload = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setRequested(true); preload.disconnect(); }
    }, { rootMargin: "160px" });
    const visibility = new IntersectionObserver((entries) => {
      setInViewport(entries.some((entry) => entry.isIntersecting));
    });
    preload.observe(element);
    visibility.observe(element.querySelector(".yor-studio__viewport") || element);
    return () => { preload.disconnect(); visibility.disconnect(); };
  }, []);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === root.current;
      setFullscreen(active);
      if (!active) fullscreenButton.current?.focus();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const controls = Array.from(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], canvas[tabindex="0"]') || [])
          .filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || !root.current?.contains(document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !root.current?.contains(document.activeElement))) {
          event.preventDefault(); first?.focus();
        }
        return;
      }
      if (event.key !== "Escape") return;
      setFullscreen(false);
      if (document.fullscreenElement === root.current) void document.exitFullscreen().catch(() => {});
      fullscreenButton.current?.focus();
    };
    window.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onEscape); };
  }, [fullscreen]);

  const toggleFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement === root.current) void document.exitFullscreen().catch(() => {});
    } else {
      setFullscreen(true);
      // The expanded CSS view also works when the browser Fullscreen API is absent.
      void root.current?.requestFullscreen?.().catch(() => {});
    }
  };
  const motionAllowed = preferencesReady && (!reducedMotion || manualLoad);
  const mountScene = requested && motionAllowed && graphicsAvailable === true && !sceneFailed;
  const renderPaused = animationPaused || !inViewport || !pageVisible;
  const fallbackReason = sceneFailed
    ? "The 3D scene could not load. The reference artwork remains available."
    : graphicsAvailable === false
      ? "WebGL is unavailable in this browser. You can still view the reference artwork."
      : reducedMotion && !manualLoad
        ? "Reduced motion is enabled. The reference artwork is shown; load 3D when you choose."
        : "Loading the operator, companion, and after-hours study…";

  return (
    <div ref={root} className={`yor-studio${fullscreen ? " is-fullscreen" : ""}`}
      data-scene-ready={String(sceneReady && mountScene)} data-scene-failed={String(sceneFailed)}
      data-render-paused={String(renderPaused)} data-animation-paused={String(animationPaused)}
      data-fullscreen={String(fullscreen)} data-interaction-count="0" data-reset-sequence={resetSequence}>
      <div className="yor-studio__topline"><span>YOR / AFTER HOURS</span><span>AN OPERATOR. A COMPANION. A QUIET MOMENT.</span></div>
      <div className="yor-studio__viewport" aria-label="3D operator and husky viewer. Drag to rotate; scroll or pinch to zoom." aria-describedby="studio-instructions">
        <div className="yor-studio__fallback" aria-hidden={sceneReady && mountScene}>
          {/* Native image keeps the exact reference visible before the renderer is ready. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/operator-reference.webp" alt="A masked tactical operator and a husky in a dark study with red lighting." width="1672" height="941" />
        </div>
        {mountScene && <StudioErrorBoundary onError={reportFailed}><Scene lightsOn={lightsOn} paused={renderPaused} resetSequence={resetSequence}
          onReady={announceReady} onCameraChange={reportCamera} onError={reportFailed} /></StudioErrorBoundary>}
        {(!sceneReady || sceneFailed || !motionAllowed) && <div className="yor-studio__loading" role="status" aria-live="polite">
          <p>{fallbackReason}</p>
          {reducedMotion && !manualLoad && graphicsAvailable !== false && !sceneFailed && <button type="button" onClick={() => { setSceneReady(false); setAnimationPaused(true); setManualLoad(true); setRequested(true); }}>Load 3D</button>}
          {sceneFailed && <button type="button" onClick={async () => {
            try {
              const sceneModule = await import("./YorWorldShowcaseScene");
              sceneModule.clearStudioAssetCache();
              setSceneReady(false);
              setSceneFailed(false);
              setRequested(true);
            } catch {
              setSceneFailed(true);
            }
          }}>Try 3D again</button>}
        </div>}
        <span className="yor-studio__frame-label" aria-hidden="true">{sceneReady && mountScene ? "LIVE 3D / DRAG TO EXPLORE" : "REFERENCE / AFTER HOURS"}</span>
      </div>
      <div className="yor-studio__controls" role="group" aria-label="Scene controls">
        <button type="button" aria-label="Reset camera view" onClick={() => setResetSequence((value) => value + 1)} disabled={!sceneReady || !mountScene}>Reset view</button>
        <button type="button" aria-label={lightsOn ? "Dim scene lights" : "Turn on scene lights"} aria-pressed={lightsOn} onClick={() => setLightsOn((value) => !value)} disabled={!sceneReady || !mountScene}>Lights {lightsOn ? "on" : "dim"}</button>
        <button type="button" aria-label={animationPaused ? "Resume scene animation" : "Pause scene animation"} aria-pressed={animationPaused} onClick={() => setAnimationPaused((value) => !value)} disabled={!sceneReady || !mountScene}>{animationPaused ? "Resume" : "Pause"}</button>
        <button ref={fullscreenButton} type="button" aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} aria-pressed={fullscreen} onClick={toggleFullscreen}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>
      </div>
      <div className="yor-studio__bottomline">
        <p id="studio-instructions">Drag to rotate. Scroll or pinch to zoom. Arrow keys rotate; + and − zoom. Reset view to return. Escape exits fullscreen.</p>
        <Link className="yor-studio__projects" href="/projects">Explore engineering work <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  );
}
