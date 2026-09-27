"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  createExperienceState,
  experienceReducer,
  type ExperienceAction,
  type ExperienceState,
  type ProjectId,
  type SceneStatus,
} from "./experience-state";

type ExperienceActions = {
  setActiveProject(projectId?: ProjectId): void;
  setDemoChoice(choice: 0 | 1): void;
  runDemo(): void;
  selectDemoNode(index: number): void;
  setSceneStatus(status: SceneStatus): void;
};

type ExperienceProjectState = Pick<ExperienceState, "projectId" | "activeProject">;

const ExperienceStateContext = createContext<ExperienceState | null>(null);
const ExperienceProjectContext = createContext<ExperienceProjectState | null>(null);
const ExperienceDispatchContext = createContext<Dispatch<ExperienceAction> | null>(null);

function useExperienceState(): ExperienceState {
  const state = useContext(ExperienceStateContext);
  if (!state) {
    throw new Error("useExperience must be used inside ExperienceProvider");
  }
  return state;
}

export function ExperienceProvider({
  children,
  initialPathname = "/",
}: {
  children: ReactNode;
  initialPathname?: string;
}) {
  const [state, dispatch] = useReducer(
    experienceReducer,
    initialPathname,
    createExperienceState,
  );
  const projectState = useMemo(
    () => ({ projectId: state.projectId, activeProject: state.activeProject }),
    [state.activeProject, state.projectId],
  );
  return (
    <ExperienceDispatchContext.Provider value={dispatch}>
      <ExperienceProjectContext.Provider value={projectState}>
        <ExperienceStateContext.Provider value={state}>{children}</ExperienceStateContext.Provider>
      </ExperienceProjectContext.Provider>
    </ExperienceDispatchContext.Provider>
  );
}

export function useExperience(): { state: ExperienceState } & ExperienceActions {
  const state = useExperienceState();
  const dispatch = useExperienceDispatch();
  const setActiveProject = useCallback(
    (projectId?: ProjectId) => dispatch({ type: "project", projectId }),
    [dispatch],
  );
  const setDemoChoice = useCallback(
    (choice: 0 | 1) => dispatch({ type: "demo-choice", choice }),
    [dispatch],
  );
  const runDemo = useCallback(() => dispatch({ type: "demo-run" }), [dispatch]);
  const selectDemoNode = useCallback(
    (index: number) => dispatch({ type: "demo-node", index }),
    [dispatch],
  );
  const setSceneStatus = useCallback(
    (status: SceneStatus) => dispatch({ type: "scene-status", status }),
    [dispatch],
  );

  return useMemo(
    () => ({ state, setActiveProject, setDemoChoice, runDemo, selectDemoNode, setSceneStatus }),
    [state, setActiveProject, setDemoChoice, runDemo, selectDemoNode, setSceneStatus],
  );
}

export function useExperienceDispatch(): Dispatch<ExperienceAction> {
  const dispatch = useContext(ExperienceDispatchContext);
  if (!dispatch) {
    throw new Error("Experience dispatch must be used inside ExperienceProvider");
  }
  return dispatch;
}

export function useExperienceProject(): ExperienceProjectState {
  const projectState = useContext(ExperienceProjectContext);
  if (!projectState) {
    throw new Error("Experience project selection must be used inside ExperienceProvider");
  }
  return projectState;
}
