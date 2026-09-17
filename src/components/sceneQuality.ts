export type SceneQuality = "low" | "medium" | "high";

export type SceneEnvironment = {
  width: number;
  cores: number;
  dpr: number;
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

export function getScenePixelRatio(maximum: number) {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const quality = getSceneQuality();
  const cap = quality === "low" ? 1 : quality === "medium" ? Math.min(maximum, 1.25) : maximum;
  return Math.min(dpr, cap);
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
