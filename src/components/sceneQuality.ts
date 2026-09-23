export type SceneQuality = "low" | "medium" | "high";

export type SceneEnvironment = {
  width: number;
  cores: number;
  dpr: number;
};

export type ScenePixelRatioSettings = {
  dpr: number;
  quality: SceneQuality;
  maximum: number;
};

export type SceneRendererMode = "auto" | "webgl";
export type SceneRendererBackend = "webgpu" | "webgl";
export type SceneRendererChoice =
  | { backend: "webgpu"; device: unknown }
  | { backend: "webgl" };

export type SceneGraphicsSupportOptions = {
  mode: SceneRendererMode;
  requestGpuDevice?: () => Promise<unknown>;
  createWebGL2Context?: () => { loseContext?: () => void } | null;
};

export function chooseSceneQuality({ width, cores, dpr }: SceneEnvironment): SceneQuality {
  if (width <= 760 || cores <= 4) return "low";
  if (width <= 1180 || cores <= 8 || dpr > 2) return "medium";
  return "high";
}

export function getSceneQuality(): SceneQuality {
  const width = typeof window === "undefined" ? 1440 : window.innerWidth;
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const cores = typeof navigator === "undefined" ? 8 : navigator.hardwareConcurrency || 8;
  return chooseSceneQuality({ width, cores, dpr });
}

export function chooseScenePixelRatio({ dpr, quality, maximum }: ScenePixelRatioSettings) {
  const cap = quality === "low" ? 1 : quality === "medium" ? Math.min(maximum, 1.25) : maximum;
  return Math.min(dpr, cap);
}

export async function chooseSceneRendererBackend({
  mode,
  requestGpuDevice,
  createWebGL2Context,
}: SceneGraphicsSupportOptions): Promise<SceneRendererChoice | null> {
  if (mode === "auto" && requestGpuDevice) {
    try {
      const device = await requestGpuDevice();
      if (device) return { backend: "webgpu", device };
    } catch {
      // WebGL 2 remains available as a fallback when the WebGPU adapter is missing.
    }
  }

  try {
    const context = createWebGL2Context?.();
    const supported = Boolean(context);
    context?.loseContext?.();
    return supported ? { backend: "webgl" } : null;
  } catch {
    return null;
  }
}

export function getScenePixelRatio(maximum: number, quality = getSceneQuality()) {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return chooseScenePixelRatio({ dpr, quality, maximum });
}

export function syncSceneRendererSize(
  renderer: { setSize: (width: number, height: number, updateStyle?: boolean) => void },
  canvas: HTMLCanvasElement,
) {
  const parent = canvas.parentElement;
  if (!parent) return;
  const { width, height } = parent.getBoundingClientRect();
  if (width > 0 && height > 0) renderer.setSize(width, height, false);
}
