import type { SceneQuality } from "../components/sceneQuality";

export const PROJECT_IDS = [
  "candidatex",
  "zenith",
  "helios",
  "ai-vs-real",
  "talks",
  "portfolio",
] as const;

export type ProjectId = (typeof PROJECT_IDS)[number];

export type HomeSection = "intro" | "identity" | "projects" | "about" | "contact";

export type ExperienceSurface = "home" | "project-index" | "case-study" | "inactive";

export type SceneStatus = "static" | "queued" | "ready" | "failed";

export type ExperienceState = {
  pathname: string;
  surface: ExperienceSurface;
  section: HomeSection;
  progress: number;
  projectId?: ProjectId;
  activeProject?: ProjectId;
  reducedMotion: boolean;
  pageVisible: boolean;
  quality: SceneQuality;
  sceneStatus: SceneStatus;
  demo: {
    choice: 0 | 1;
    selectedNode: number;
    run: number;
  };
};

export type ExperienceAction =
  | { type: "route"; pathname: string }
  | { type: "section"; section: string; progress: number }
  | { type: "project"; projectId?: ProjectId }
  | { type: "demo-choice"; choice: 0 | 1 }
  | { type: "demo-run" }
  | { type: "demo-node"; index: number }
  | { type: "environment"; reducedMotion: boolean; pageVisible: boolean }
  | { type: "quality"; quality: SceneQuality }
  | { type: "scene-status"; status: SceneStatus };

const projectIds = new Set<string>(PROJECT_IDS);

function classifyRoute(pathname: string): Pick<ExperienceState, "surface" | "projectId"> {
  if (pathname === "/") return { surface: "home" };
  if (pathname === "/projects") return { surface: "project-index" };

  const caseStudy = /^\/projects\/([^/]+)$/.exec(pathname);
  const projectId = caseStudy?.[1];
  if (projectId && projectIds.has(projectId)) {
    return { surface: "case-study", projectId: projectId as ProjectId };
  }

  return { surface: "inactive" };
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(1, progress));
}

function initialDemoState(): ExperienceState["demo"] {
  return { choice: 0, selectedNode: 0, run: 0 };
}

export function createExperienceState(pathname: string): ExperienceState {
  return {
    pathname,
    ...classifyRoute(pathname),
    section: "intro",
    progress: 0,
    reducedMotion: true,
    pageVisible: true,
    quality: "low",
    sceneStatus: "static",
    demo: initialDemoState(),
  };
}

export function experienceReducer(
  state: ExperienceState,
  action: ExperienceAction,
): ExperienceState {
  switch (action.type) {
    case "route":
      return {
        ...state,
        pathname: action.pathname,
        projectId: undefined,
        ...classifyRoute(action.pathname),
        section: "intro",
        progress: 0,
        activeProject: undefined,
        sceneStatus: "static",
        demo: initialDemoState(),
      };
    case "section": {
      const sections: readonly string[] = ["intro", "identity", "projects", "about", "contact"];
      if (!sections.includes(action.section)) return state;
      return {
        ...state,
        section: action.section as HomeSection,
        progress: clampProgress(action.progress),
      };
    }
    case "project":
      return { ...state, activeProject: action.projectId };
    case "demo-choice":
      return { ...state, demo: { ...state.demo, choice: action.choice } };
    case "demo-run":
      return { ...state, demo: { ...state.demo, run: state.demo.run + 1 } };
    case "demo-node":
      return {
        ...state,
        demo: { ...state.demo, selectedNode: Math.max(0, Math.floor(action.index)) },
      };
    case "environment":
      return {
        ...state,
        reducedMotion: action.reducedMotion,
        pageVisible: action.pageVisible,
      };
    case "quality":
      return { ...state, quality: action.quality };
    case "scene-status":
      return { ...state, sceneStatus: action.status };
  }
}
