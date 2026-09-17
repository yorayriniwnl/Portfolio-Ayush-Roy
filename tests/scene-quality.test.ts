import assert from "node:assert/strict";
import test from "node:test";
import { chooseSceneQuality } from "../src/components/sceneQuality";

test("scene quality protects small and low-core devices", () => {
  assert.equal(chooseSceneQuality({ width: 390, cores: 12, dpr: 3 }), "low");
  assert.equal(chooseSceneQuality({ width: 1440, cores: 4, dpr: 1 }), "low");
});

test("scene quality uses a medium tier before full desktop quality", () => {
  assert.equal(chooseSceneQuality({ width: 1024, cores: 8, dpr: 1.5 }), "medium");
  assert.equal(chooseSceneQuality({ width: 1440, cores: 8, dpr: 2.5 }), "medium");
  assert.equal(chooseSceneQuality({ width: 1600, cores: 12, dpr: 2 }), "high");
});
