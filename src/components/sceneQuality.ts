export function getScenePixelRatio(maximum: number) {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const cores = typeof navigator === "undefined" ? 8 : navigator.hardwareConcurrency || 8;
  const lowPowerViewport = typeof window !== "undefined" && window.innerWidth <= 760;
  const lowPowerDevice = cores <= 4;
  return Math.min(dpr, lowPowerViewport || lowPowerDevice ? 1 : maximum);
}

export function syncSceneRendererSize(renderer: { setSize: (width: number, height: number, updateStyle?: boolean) => void }, canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  if (!parent) return;
  const { width, height } = parent.getBoundingClientRect();
  if (width > 0 && height > 0) renderer.setSize(width, height, false);
}
