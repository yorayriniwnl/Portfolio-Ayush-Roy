type SceneRoot = { unmount: () => void };
type SceneRenderer = { dispose: () => void };

export function unmountAndDisposeScene(
  root: SceneRoot,
  renderer?: SceneRenderer | null,
): void {
  try {
    root.unmount();
  } catch {
    // Renderer release must still run if reconciler teardown fails.
  }

  try {
    renderer?.dispose();
  } catch {
    // A partially initialized renderer may not have a complete backend to dispose.
  }
}
