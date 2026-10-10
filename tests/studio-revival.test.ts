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
  assert.match(room, /<Scene onSelect=\{selectTarget\}/);
  const authored = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  assert.match(authored, /<Canvas camera=/);
  assert.ok(authored.includes("yor-world-room.glb"));
  assert.ok(authored.includes("yor-world-resident.glb"));
  assert.ok(authored.includes("yor-world-fixture.glb"));
  assert.match(authored, /<AuthenticYorRoom onSelect=\{onSelect\} onInteract=\{onInteract\} onHover=\{onHover\} onToggleLights=\{onToggleLights\}/);
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

test("cinematic doorway entry remains replayable and camera controls can skip it", () => {
  const hero = readFileSync("src/components/experience/StudioHero.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const authored = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(hero, /href="#studio"/);
  assert.match(room, /window\.addEventListener\("hashchange", handleStudioLink\)/);
  assert.match(room, /setIntroSequence\(\(value\) => value \+ 1\)/);
  assert.match(room, /Replay doorway entrance animation/);
  assert.match(room, /setIntroSequence\(0\)/);
  assert.match(room, /introSequence=\{introSequence\}/);
  assert.match(authored, /function WorldCamera\(\{ selected, introSequence \}/);
  assert.match(authored, /entryTime\.current = introSequence > 0 \? 0 : null/);
  assert.match(authored, /camera\.position\.copy\(doorEye\)\.lerp\(deskEye,eased\)/);
  assert.match(authored, /doorwayOpening/);
  assert.match(authored, /actions\.get\("turn_to_visitor"\)/);
  assert.match(css, /\.yor-studio__utilities button:last-child \{ display:inline-flex/);
});

test("Yor World object map drives real blinds and tilt with accessible DOM controls", () => {
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  for (const object of ["monitor", "painting", "blinds", "lights", "avatar", "door", "skills"]) {
    assert.match(scene, new RegExp(`"${object}"`), `Scene must recognize ${object}`);
  }
  assert.match(scene, /getObjectByName\("painting-pivot"\)/);
  assert.match(scene, /getObjectByName\(`blind_slat_/);
  assert.match(scene, /getObjectByName\("hidden-yor-mark"\)/);
  assert.match(scene, /blind\.node\.rotation\.z = THREE\.MathUtils\.damp/);
  assert.match(scene, /props\.painting\.rotation\.x = props\.paintingBase \+ impulse/);
  assert.match(scene, /props\.signature\.visible = paintingBeat > 0/);
  assert.match(scene, /onPointerOver=\{hover\}/);
  assert.match(room, /data-blinds-open=\{String\(blindsOpen\)\}/);
  assert.match(room, /data-painting-beat=\{paintingBeat\}/);
  assert.match(room, /onInteract=\{activateObject\}/);
  assert.match(room, /aria-pressed=\{!blindsOpen\}/);
  assert.match(room, /HIDDEN YOR MARK DISCOVERED/);
  assert.match(css, /yor-studio__hover-label/);
});

test("the workstation launcher is evidence-first and dismissible from keyboard", () => {
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(room, /recruiterProjects\.map/);
  assert.match(room, /href=\{`\/projects\/\$\{project\.slug\}`\}/);
  assert.match(room, /aria-labelledby="yor-room-console-title"/);
  assert.match(room, /aria-label="Close workstation launcher"/);
  assert.match(room, /event\.key === "Escape"/);
  assert.match(room, /consoleCloseButton\.current\?\.focus/);
  assert.match(room, /consoleButton\.current\?\.focus/);
  assert.match(room, /data-console-open=\{String\(consoleOpen\)\}/);
  assert.match(css, /yor-studio__console-projects/);
  assert.match(css, /@media \(max-width:650px\)/);
});
