import test from "node:test";
import assert from "node:assert/strict";
import {
  initialStudioLifecycle,
  studioIsActive,
  studioLifecycle,
  studioShouldMount,
  studioStatus,
} from "../src/components/experience/studio-lifecycle";

function ready() {
  let state = initialStudioLifecycle;
  state = studioLifecycle(state, { type: "motion", allowed: true });
  state = studioLifecycle(state, { type: "graphics", available: true, attempt: state.attempt });
  state = studioLifecycle(state, { type: "viewport", visible: true });
  state = studioLifecycle(state, { type: "ready", attempt: state.attempt });
  return state;
}

test("the 3D room loads only after motion, graphics and viewport allow it", () => {
  const state = ready();
  assert.equal(studioShouldMount(state), true);
  assert.equal(studioIsActive(state), true);
  assert.equal(studioStatus(state), "running");
});

test("offscreen and hidden rooms keep their loaded scene and stop their render loop", () => {
  let state = ready();
  state = studioLifecycle(state, { type: "viewport", visible: false });
  assert.equal(studioShouldMount(state), true);
  assert.equal(state.ready, true);
  assert.equal(studioIsActive(state), false);
  assert.equal(studioStatus(state), "paused");
  state = studioLifecycle(state, { type: "viewport", visible: true });
  state = studioLifecycle(state, { type: "document", visible: false });
  assert.equal(studioStatus(state), "paused");
  state = studioLifecycle(state, { type: "document", visible: true });
  assert.equal(studioStatus(state), "running");
});

test("changing to reduced motion unmounts stale 3D and exposes the static presentation", () => {
  let state = ready();
  const previousAttempt = state.attempt;
  state = studioLifecycle(state, { type: "motion", allowed: false });
  assert.equal(state.ready, false);
  assert.equal(state.attempt, previousAttempt + 1);
  assert.equal(studioShouldMount(state), false);
  assert.equal(studioIsActive(state), false);
  assert.equal(studioStatus(state), "reduced-motion");
  assert.equal(studioLifecycle(state, { type: "ready", attempt: previousAttempt }), state);
});

test("graphics failure can be retried without accepting stale callbacks from the failed attempt", () => {
  let state = initialStudioLifecycle;
  state = studioLifecycle(state, { type: "motion", allowed: true });
  state = studioLifecycle(state, { type: "graphics", available: false, attempt: state.attempt });
  assert.equal(studioStatus(state), "unavailable");
  const failedAttempt = state.attempt;
  state = studioLifecycle(state, { type: "retry" });
  assert.equal(state.attempt, failedAttempt + 1);
  assert.equal(state.graphicsAvailable, null);
  assert.equal(state.failed, false);
  const attemptState = state;
  state = studioLifecycle(state, { type: "failed", attempt: failedAttempt });
  assert.equal(state, attemptState);
  state = studioLifecycle(state, { type: "graphics", available: true, attempt: state.attempt });
  state = studioLifecycle(state, { type: "viewport", visible: true });
  state = studioLifecycle(state, { type: "ready", attempt: state.attempt });
  assert.equal(studioStatus(state), "running");
});
