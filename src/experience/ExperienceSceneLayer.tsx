"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import {
  chooseSceneRendererBackend,
  type SceneRendererChoice,
} from "../components/sceneQuality";
import { useExperience } from "./ExperienceProvider";
import { StaticMachine } from "./StaticMachine";

const DynamicMachineCanvas = dynamic(
  () => import("./MachineCanvas").then((module) => module.MachineCanvas),
  { ssr: false, loading: () => null },
);

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

class SceneLoadBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function releaseRendererChoice(choice: SceneRendererChoice | null) {
  if (choice?.backend !== "webgpu") return;
  const destroy = (choice.device as { destroy?: () => void }).destroy;
  destroy?.call(choice.device);
}

export function ExperienceSceneLayer() {
  const { state, setSceneStatus } = useExperience();
  const [canvasRequested, setCanvasRequested] = useState(false);
  const [rendererChoice, setRendererChoice] = useState<SceneRendererChoice | null>(null);
  const eligible = state.surface !== "inactive";
  const mode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("renderer") === "webgl"
      ? "webgl"
      : "auto";

  useEffect(() => {
    const choice = rendererChoice;
    return () => {
      if (choice?.backend === "webgpu") {
        window.setTimeout(() => releaseRendererChoice(choice), 650);
      }
    };
  }, [rendererChoice]);

  useEffect(() => {
    if (eligible && !state.reducedMotion) return;
    window.setTimeout(() => {
      setCanvasRequested(false);
      setRendererChoice(null);
      setSceneStatus("static");
    }, 0);
  }, [eligible, setSceneStatus, state.reducedMotion]);

  useEffect(() => {
    if (state.sceneStatus !== "failed") return;
    window.setTimeout(() => {
      setCanvasRequested(false);
      setRendererChoice(null);
    }, 0);
  }, [state.sceneStatus]);

  useEffect(() => {
    if (
      !eligible ||
      state.reducedMotion ||
      !state.pageVisible ||
      state.sceneStatus === "failed" ||
      canvasRequested
    ) return;

    const idleWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;
    let cancelled = false;

    const requestCanvas = () => {
      if (cancelled) return;

      void (async () => {
        const gpu = (navigator as Navigator & {
          gpu?: {
            requestAdapter?: () => Promise<{
              requestDevice?: () => Promise<unknown>;
            } | null>;
          };
        }).gpu;
        const requestAdapter = gpu?.requestAdapter?.bind(gpu);
        const requestGpuDevice = requestAdapter
          ? async () => {
              const adapter = await requestAdapter();
              return adapter?.requestDevice ? adapter.requestDevice() : null;
            }
          : undefined;
        const choice = await chooseSceneRendererBackend({
          mode,
          requestGpuDevice,
          createWebGL2Context: () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("webgl2", {
              failIfMajorPerformanceCaveat: true,
            });
            if (!context) return null;
            return {
              loseContext: () => context.getExtension("WEBGL_lose_context")?.loseContext(),
            };
          },
        });

        if (cancelled) {
          releaseRendererChoice(choice);
          return;
        }
        if (!choice) {
          setSceneStatus("failed");
          return;
        }

        setRendererChoice(choice);
        setSceneStatus("queued");
        setCanvasRequested(true);
      })().catch(() => {
        if (!cancelled) setSceneStatus("failed");
      });
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(requestCanvas, { timeout: 1200 });
    } else {
      timerHandle = window.setTimeout(requestCanvas, 240);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };
  }, [
    canvasRequested,
    eligible,
    mode,
    setSceneStatus,
    state.pageVisible,
    state.reducedMotion,
    state.sceneStatus,
  ]);

  if (!eligible) return null;

  const showCanvas =
    canvasRequested &&
    rendererChoice !== null &&
    eligible &&
    !state.reducedMotion &&
    state.sceneStatus !== "failed";

  return (
    <div className="machine-scene-layer" data-scene-status={state.sceneStatus} aria-hidden="true">
      <StaticMachine />
      {showCanvas && (
        <SceneLoadBoundary
          key={state.pathname}
          onFail={() => setSceneStatus("failed")}
        >
          <DynamicMachineCanvas
            backend={rendererChoice.backend}
            device={rendererChoice.backend === "webgpu" ? rendererChoice.device : undefined}
          />
        </SceneLoadBoundary>
      )}
    </div>
  );
}
