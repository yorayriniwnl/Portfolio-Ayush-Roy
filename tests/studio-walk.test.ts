import test from "node:test";
import assert from "node:assert/strict";
import { getStudioCamera, STUDIO_TARGET, STUDIO_LIMITS } from "../src/components/experience/studio-camera";

test("camera framing stays finite and within orbit bounds for extreme aspect ratios", () => {
  for (const aspect of [NaN, Infinity, -Infinity, -1, 0, .01, .45, .7, 1, 1.6, 2.5, 4, 1000]) {
    const { eye, target, fov } = getStudioCamera(aspect);
    assert.ok([...eye, ...target, fov].every(Number.isFinite), `invalid camera at aspect ${aspect}`);
    assert.deepEqual(target, STUDIO_TARGET);
    assert.ok(fov > 20 && fov < 80);
    const distance = Math.hypot(...eye.map((value, index) => value - target[index]));
    assert.ok(distance >= STUDIO_LIMITS.minDistance && distance <= STUDIO_LIMITS.maxDistance + .001,
      `camera distance ${distance} exceeds safe bounds at aspect ${aspect}`);
  }
});

test("portrait framing pulls back so the operator and companion stay together", () => {
  const portrait = getStudioCamera(.65);
  const desktop = getStudioCamera(1.8);
  const landscape = getStudioCamera(3);
  assert.ok(portrait.eye[2] > desktop.eye[2], "portrait camera should widen its horizontal coverage");
  assert.ok(desktop.eye[2] >= landscape.eye[2]);
  assert.equal(portrait.fov, desktop.fov, "framing should not rely on an extreme wide-angle lens");
  assert.ok(STUDIO_LIMITS.minPolarAngle > 0 && STUDIO_LIMITS.maxPolarAngle < Math.PI);
  assert.ok(STUDIO_LIMITS.minAzimuthAngle < 0 && STUDIO_LIMITS.maxAzimuthAngle > 0);
});

test("reset camera data is fresh and cannot be mutated by previous orbit controls", () => {
  const initial = getStudioCamera(1.6);
  const expected = structuredClone(initial);
  initial.eye[0] = 999;
  initial.target[1] = 999;
  const reset = getStudioCamera(1.6);
  assert.deepEqual(reset, expected);
  assert.notEqual(reset.target, STUDIO_TARGET);
});

test("malformed aspect ratios use the stable desktop fallback", () => {
  const expected = getStudioCamera(1.6);
  for (const aspect of [NaN, Infinity, -Infinity, -10, 0]) assert.deepEqual(getStudioCamera(aspect), expected);
  assert.deepEqual(getStudioCamera(.001), getStudioCamera(.45));
  assert.deepEqual(getStudioCamera(100), getStudioCamera(4));
});
