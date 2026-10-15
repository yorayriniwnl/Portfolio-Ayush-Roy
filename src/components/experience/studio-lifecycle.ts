export type StudioLifecycle = {
  motionAllowed: boolean | null;
  graphicsAvailable: boolean | null;
  enteredViewport: boolean;
  viewportVisible: boolean;
  documentVisible: boolean;
  ready: boolean;
  failed: boolean;
  attempt: number;
};

export const initialStudioLifecycle: StudioLifecycle = {
  motionAllowed: null,
  graphicsAvailable: null,
  enteredViewport: false,
  viewportVisible: false,
  documentVisible: true,
  ready: false,
  failed: false,
  attempt: 0,
};

type StudioLifecycleEvent =
  | { type: "motion"; allowed: boolean }
  | { type: "graphics"; available: boolean; attempt: number }
  | { type: "viewport"; visible: boolean }
  | { type: "document"; visible: boolean }
  | { type: "ready" | "failed"; attempt: number }
  | { type: "retry" };

export function studioShouldMount(state: StudioLifecycle) {
  return state.motionAllowed === true && state.graphicsAvailable === true && state.enteredViewport && !state.failed;
}

export function studioIsActive(state: StudioLifecycle) {
  return studioShouldMount(state) && state.viewportVisible && state.documentVisible;
}

export function studioStatus(state: StudioLifecycle) {
  if (state.motionAllowed === false) return "reduced-motion";
  if (state.failed || state.graphicsAvailable === false) return "unavailable";
  if (!studioShouldMount(state) || !state.ready) return "loading";
  return studioIsActive(state) ? "running" : "paused";
}

export function studioLifecycle(state: StudioLifecycle, event: StudioLifecycleEvent): StudioLifecycle {
  // Old loader/frame callbacks cannot mark a replacement scene ready or failed.
  if ("attempt" in event && event.attempt !== state.attempt) return state;
  switch (event.type) {
    case "motion":
      if (state.motionAllowed === event.allowed) return state;
      return {
        ...state, motionAllowed: event.allowed, ready: false,
        attempt: state.attempt + (state.motionAllowed === true && !event.allowed ? 1 : 0),
      };
    case "graphics": return { ...state, graphicsAvailable: event.available };
    case "viewport": return { ...state, viewportVisible: event.visible, enteredViewport: state.enteredViewport || event.visible };
    case "document": return { ...state, documentVisible: event.visible };
    case "ready": return studioShouldMount(state) ? { ...state, ready: true } : state;
    case "failed": return { ...state, ready: false, failed: true };
    case "retry": return { ...state, ready: false, failed: false, graphicsAvailable: null, attempt: state.attempt + 1 };
  }
}
