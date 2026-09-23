import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  chooseSceneRendererBackend,
  chooseScenePixelRatio,
  chooseSceneQuality,
} from "../src/components/sceneQuality";

test("scene quality protects small and low-core devices", () => {
  assert.equal(chooseSceneQuality({ width: 390, cores: 12, dpr: 3 }), "low");
  assert.equal(chooseSceneQuality({ width: 1440, cores: 4, dpr: 1 }), "low");
});

test("scene quality uses a medium tier before full desktop quality", () => {
  assert.equal(chooseSceneQuality({ width: 1024, cores: 8, dpr: 1.5 }), "medium");
  assert.equal(chooseSceneQuality({ width: 1440, cores: 8, dpr: 2.5 }), "medium");
  assert.equal(chooseSceneQuality({ width: 1600, cores: 12, dpr: 2 }), "high");
});

test("scene pixel ratio respects the low, medium, and requested high-quality caps", () => {
  assert.equal(chooseScenePixelRatio({ dpr: 3, quality: "low", maximum: 2 }), 1);
  assert.equal(chooseScenePixelRatio({ dpr: 3, quality: "medium", maximum: 2 }), 1.25);
  assert.equal(chooseScenePixelRatio({ dpr: 3, quality: "high", maximum: 2 }), 2);
  assert.equal(chooseScenePixelRatio({ dpr: 1.1, quality: "high", maximum: 2 }), 1.1);
});

test("scene renderer capability probing selects an available backend and releases probe contexts", async () => {
  let released = 0;
  let webGlProbes = 0;

  assert.deepEqual(
    await chooseSceneRendererBackend({
      mode: "auto",
      requestGpuDevice: async () => null,
      createWebGL2Context: () => {
        webGlProbes += 1;
        return { loseContext: () => { released += 1; } };
      },
    }),
    { backend: "webgl" },
  );
  assert.equal(webGlProbes, 1);
  assert.equal(released, 1);

  assert.equal(
    await chooseSceneRendererBackend({
      mode: "webgl",
      requestGpuDevice: async () => ({ device: true }),
      createWebGL2Context: () => null,
    }),
    null,
  );

  assert.equal(
    await chooseSceneRendererBackend({
      mode: "auto",
      requestGpuDevice: async () => { throw new Error("device unavailable"); },
      createWebGL2Context: () => null,
    }),
    null,
  );

  const device = { adapter: true };
  assert.deepEqual(
    await chooseSceneRendererBackend({
      mode: "auto",
      requestGpuDevice: async () => device,
      createWebGL2Context: () => null,
    }),
    { backend: "webgpu", device },
  );
});

test("machine scene has one catchable renderer root and a separate decorative static composition", () => {
  const layer = readFileSync("src/experience/ExperienceSceneLayer.tsx", "utf8");
  const canvas = readFileSync("src/experience/MachineCanvas.tsx", "utf8");
  const staticMachine = readFileSync("src/experience/StaticMachine.tsx", "utf8");

  assert.equal((canvas.match(/createRoot\(/g) ?? []).length, 1);
  assert.doesNotMatch(layer, /createRoot\(/);
  assert.match(canvas, /await\s+root\.configure\(/);
  assert.match(canvas, /catch\s*\(/);
  assert.match(canvas, /root\.unmount\(/);
  assert.match(canvas, /frameloop:\s*state\.pageVisible\s*\?\s*["']always["']\s*:\s*["']never["']/);
  assert.match(layer, /<StaticMachine\s*\/>/);
  assert.match(layer, /surface\s*!==\s*["']inactive["']/);
  assert.match(layer, /reducedMotion/);
  assert.match(layer, /requestIdleCallback/);
  assert.match(layer, /chooseSceneRendererBackend/);
  assert.match(canvas, /if\s*\(!context\)\s*\{[\s\S]*?throw new Error/);
  assert.match(staticMachine, /aria-hidden=["']true["']/);
});
