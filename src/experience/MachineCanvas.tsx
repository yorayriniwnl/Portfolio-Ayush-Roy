"use client";

import { createRoot, extend, type Catalogue, type ReconcilerRoot } from "@react-three/fiber";
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three/webgpu";
import {
  getScenePixelRatio,
  syncSceneRendererSize,
  type SceneRendererBackend,
} from "../components/sceneQuality";
import { useExperience } from "./ExperienceProvider";
import type { ExperienceState } from "./experience-state";
import { MachineWorld } from "./MachineWorld";

extend(THREE as unknown as Catalogue);

class MachineRenderBoundary extends Component<
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

async function createSceneRenderer(
  canvas: HTMLCanvasElement,
  backend: SceneRendererBackend,
  pixelRatio: number,
  device?: unknown,
): Promise<THREE.WebGPURenderer> {
  const releaseDevice = () => {
    const destroy = (device as { destroy?: () => void } | undefined)?.destroy;
    destroy?.call(device);
  };
  const context = backend === "webgl"
    ? canvas.getContext("webgl2", { alpha: true, antialias: true })
    : canvas.getContext("webgpu");
  if (!context) {
    if (backend === "webgpu") releaseDevice();
    throw new Error(`The ${backend} canvas context is unavailable`);
  }

  let renderer: THREE.WebGPURenderer;
  try {
    renderer = new THREE.WebGPURenderer({
      canvas,
      context,
      ...(backend === "webgpu" && device
        ? {
            device: device as NonNullable<
              ConstructorParameters<typeof THREE.WebGPURenderer>[0]
            >["device"],
          }
        : {}),
      antialias: true,
      alpha: true,
      forceWebGL: backend === "webgl",
    });
  } catch (error) {
    if (backend === "webgpu") releaseDevice();
    throw error;
  }
  if (backend === "webgpu") {
    // The support probe already selected WebGPU. Do not let Three try a WebGL
    // fallback on a canvas that has already committed to a WebGPU context.
    (renderer as unknown as { _getFallback: null })._getFallback = null;
  }

  try {
    renderer.setPixelRatio(pixelRatio);
    await renderer.init();
    syncSceneRendererSize(renderer, canvas);
    return renderer;
  } catch (error) {
    try {
      renderer.dispose();
    } catch {
      // A partially initialized renderer may not have a complete backend to dispose.
    }
    if (backend === "webgpu") releaseDevice();
    throw error;
  }
}

export function MachineCanvas({
  backend,
  device,
}: {
  backend: SceneRendererBackend;
  device?: unknown;
}) {
  const { state, setSceneStatus } = useExperience();
  const pixelRatio = getScenePixelRatio(2, state.quality);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);
  const rendererRef = useRef<THREE.WebGPURenderer | null>(null);
  const stateRef = useRef<ExperienceState>(state);
  const pixelRatioRef = useRef(pixelRatio);
  const [rootReady, setRootReady] = useState(false);
  useLayoutEffect(() => {
    stateRef.current = state;
    pixelRatioRef.current = pixelRatio;
  }, [pixelRatio, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = createRoot(canvas);
    rootRef.current = root;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let resizeHandler: (() => void) | undefined;
    let renderer: THREE.WebGPURenderer | undefined;

    const fail = () => {
      if (!cancelled) setSceneStatus("failed");
    };

    const initialize = async () => {
      try {
        renderer = await createSceneRenderer(canvas, backend, pixelRatioRef.current, device);
        if (cancelled) {
          renderer.dispose();
          return;
        }

        rendererRef.current = renderer;
        await root.configure({
          gl: renderer,
          camera: { position: [0, 0, 5.1], fov: 42 },
          dpr: pixelRatioRef.current,
          frameloop: stateRef.current.pageVisible ? "always" : "never",
        });
        if (cancelled) return;

        root.render(
          <MachineRenderBoundary onFail={fail}>
            <MachineWorld
              stateRef={stateRef}
              quality={stateRef.current.quality}
              demo={stateRef.current.demo}
              selectedProjectId={stateRef.current.projectId}
            />
          </MachineRenderBoundary>,
        );
        setRootReady(true);
        setSceneStatus("ready");

        const resize = () => {
          const container = canvas.parentElement;
          if (!container) return;
          const rect = container.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;

          void root
            .configure({
              gl: renderer,
              camera: { position: [0, 0, 5.1], fov: 42 },
              dpr: getScenePixelRatio(2, stateRef.current.quality),
              frameloop: stateRef.current.pageVisible ? "always" : "never",
              size: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
            })
            .catch(fail);
        };

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(canvas.parentElement ?? canvas);
        } else {
          resizeHandler = resize;
          window.addEventListener("resize", resizeHandler, { passive: true });
        }
      } catch {
        try {
          if (renderer && rendererRef.current !== renderer) renderer.dispose();
        } catch {
          // The static composition remains visible when root setup cannot finish.
        }
        fail();
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (rootRef.current === root) rootRef.current = null;
      if (rendererRef.current === renderer) rendererRef.current = null;
      root.unmount();
    };
  }, [backend, device, setSceneStatus]);

  useEffect(() => {
    const root = rootRef.current;
    const renderer = rendererRef.current;
    if (!rootReady || !root || !renderer) return;
    let current = true;

    void root
      .configure({
        gl: renderer,
        camera: { position: [0, 0, 5.1], fov: 42 },
        dpr: pixelRatio,
        frameloop: state.pageVisible ? "always" : "never",
      })
      .catch(() => {
        if (current) setSceneStatus("failed");
      });

    return () => {
      current = false;
    };
  }, [pixelRatio, rootReady, setSceneStatus, state.pageVisible, state.quality]);

  useEffect(() => {
    const root = rootRef.current;
    if (!rootReady || !root) return;

    root.render(
      <MachineRenderBoundary onFail={() => setSceneStatus("failed")}>
        <MachineWorld
          stateRef={stateRef}
          quality={stateRef.current.quality}
          demo={state.demo}
          selectedProjectId={state.projectId}
        />
      </MachineRenderBoundary>,
    );
  }, [rootReady, setSceneStatus, state.demo, state.projectId, state.quality]);

  return (
    <div className="machine-canvas" data-renderer={backend}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
