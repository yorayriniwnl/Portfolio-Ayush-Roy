import assert from "node:assert/strict";
import test from "node:test";
import { createExperienceState, experienceReducer } from "../src/experience/experience-state";

const projectSlugs = [
  "candidatex",
  "zenith",
  "helios",
  "ai-vs-real",
  "talks",
  "portfolio",
] as const;

test("classifies only the home, project index, and canonical case studies as experience routes", () => {
  assert.equal(createExperienceState("/").surface, "home");
  assert.equal(createExperienceState("/projects").surface, "project-index");

  for (const slug of projectSlugs) {
    const state = createExperienceState(`/projects/${slug}`);
    assert.equal(state.surface, "case-study", `${slug} should be a canonical case study`);
    assert.equal(state.projectId, slug);
  }

  for (const pathname of [
    "/lab",
    "/resume",
    "/projects/candidatex/source",
    "/projects/candidatex/live",
    "/projects/not-a-project",
    "/projects/zenith/nested",
    "/unknown",
  ]) {
    const state = createExperienceState(pathname);
    assert.equal(state.surface, "inactive", `${pathname} should be inactive`);
    assert.equal(state.projectId, undefined);
  }
});

test("starts with a static reduced-motion-safe experience", () => {
  const state = createExperienceState("/");

  assert.deepEqual(state, {
    pathname: "/",
    surface: "home",
    section: "intro",
    progress: 0,
    reducedMotion: true,
    pageVisible: true,
    quality: "low",
    sceneStatus: "static",
    demo: { choice: 0, selectedNode: 0, run: 0 },
  });
});

test("section updates retain the selected section and clamp progress to its valid range", () => {
  const state = createExperienceState("/");

  const active = experienceReducer(state, {
    type: "section",
    section: "projects",
    progress: 0.42,
  });
  assert.equal(active.section, "projects");
  assert.equal(active.progress, 0.42);

  assert.equal(
    experienceReducer(active, { type: "section", section: "contact", progress: -1 }).progress,
    0,
  );
  assert.equal(
    experienceReducer(active, { type: "section", section: "contact", progress: 2 }).progress,
    1,
  );
});

test("project preview can be selected and cleared independently of the route project", () => {
  const state = createExperienceState("/projects/zenith");
  const selected = experienceReducer(state, { type: "project", projectId: "candidatex" });

  assert.equal(selected.projectId, "zenith");
  assert.equal(selected.activeProject, "candidatex");

  const cleared = experienceReducer(selected, { type: "project" });
  assert.equal(cleared.activeProject, undefined);
  assert.equal(cleared.projectId, "zenith");
});

test("demo controls update their shared deterministic state", () => {
  const initial = createExperienceState("/projects/helios");
  const chosen = experienceReducer(initial, { type: "demo-choice", choice: 1 });
  const nodeSelected = experienceReducer(chosen, { type: "demo-node", index: 4 });
  const runOnce = experienceReducer(nodeSelected, { type: "demo-run" });
  const runTwice = experienceReducer(runOnce, { type: "demo-run" });

  assert.deepEqual(runTwice.demo, { choice: 1, selectedNode: 4, run: 2 });
});

test("environment, quality, and renderer updates are represented in state", () => {
  const initial = createExperienceState("/");
  const environment = experienceReducer(initial, {
    type: "environment",
    reducedMotion: false,
    pageVisible: false,
  });
  const quality = experienceReducer(environment, { type: "quality", quality: "medium" });
  const queued = experienceReducer(quality, { type: "scene-status", status: "queued" });
  const ready = experienceReducer(queued, { type: "scene-status", status: "ready" });
  const failed = experienceReducer(ready, { type: "scene-status", status: "failed" });

  assert.equal(failed.reducedMotion, false);
  assert.equal(failed.pageVisible, false);
  assert.equal(failed.quality, "medium");
  assert.equal(failed.sceneStatus, "failed");
});

test("route changes recompute route identity and discard stale scene/demo state", () => {
  const initial = experienceReducer(createExperienceState("/"), {
    type: "scene-status",
    status: "ready",
  });
  const selected = experienceReducer(initial, { type: "demo-node", index: 5 });
  const routed = experienceReducer(selected, { type: "route", pathname: "/projects/talks" });

  assert.equal(routed.pathname, "/projects/talks");
  assert.equal(routed.surface, "case-study");
  assert.equal(routed.projectId, "talks");
  assert.equal(routed.sceneStatus, "static");
  assert.deepEqual(routed.demo, { choice: 0, selectedNode: 0, run: 0 });

  const index = experienceReducer(createExperienceState("/projects/zenith"), {
    type: "route",
    pathname: "/projects",
  });
  assert.equal(index.surface, "project-index");
  assert.equal(index.projectId, undefined);
});
