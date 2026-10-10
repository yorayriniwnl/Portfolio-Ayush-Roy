import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("actual recovered WebGL workspace powers the homepage, never a static imitation", () => {
  const homepage = readFileSync("src/components/experience/EditorialHome.tsx", "utf8");
  const hero = readFileSync("src/components/experience/StudioHero.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const runtime = readFileSync("src/experience/ExperienceRuntime.tsx", "utf8");
  assert.match(homepage, /<StudioHero \/>/);
  assert.match(hero, /<StudioRoom \/>/);
  assert.match(room, /<Scene onSelect=\{setSelected\}/);
  const authored = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  assert.match(authored, /<Canvas camera=/);
  assert.ok(authored.includes("yor-world-room.glb"));
  assert.ok(authored.includes("yor-world-resident.glb"));
  assert.ok(authored.includes("yor-world-fixture.glb"));
  assert.match(authored, /<AuthenticYorRoom onSelect=\{onSelect\} onToggleLights=\{onToggleLights\}/);
  assert.match(runtime, /pathname !== "\/" && <ExperienceSceneLayer/);
  assert.doesNotMatch(hero, /Illustrated engineer portrait/);
});

test("recovered objects have camera targets and physical interactions", () => {
  const scene = readFileSync("src/components/experience/StudioScene.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  for (const target of ["work", "about", "lab", "contact"]) {
    assert.match(scene, new RegExp(`\\b${target}: \\{ position:`));
  }
  assert.match(scene, /function CameraDirector/);
  assert.match(scene, /camera\.position\.lerp/);
  assert.match(scene, /onSelect\("about"\)/);
  assert.match(scene, /onSelect\("lab"\)/);
  assert.match(scene, /onSelect\("contact"\)/);
  assert.match(scene, /onSelect\("work"\)/);
  assert.match(scene, /const \[greeting, setGreeting\] = useState/);
  assert.match(scene, /lightsOn \? 12 : \.5/);
  assert.match(scene, /function StudioDoor/);
  assert.match(scene, /hinge.current.rotation.y/);
  assert.match(scene, /onToggleLights/);
  assert.match(scene, /circleGeometry args=\{\[\.31,6\]\}/);
  assert.match(room, /setLightsOn/);
  assert.match(room, /prefers-reduced-motion: reduce/);
  assert.match(room, /graphicsAvailable/);
  assert.match(room, /yor-studio__fallback/);
  assert.match(room, /aria-pressed=\{selected === target\}/);
});

test("new scene preserves direct HTML project/resume navigation and small-screen design", () => {
  const hero = readFileSync("src/components/experience/StudioHero.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(hero, /href="#projects"/);
  assert.match(hero, /href="\/resume"/);
  assert.match(css, /max-width:650px/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.yor-world-hero__studio \.yor-studio__viewport/);
  assert.match(css, /min-height: 42px/);
});
