import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

test("actual recovered WebGL workspace powers the homepage, never a static imitation", () => {
  const homepage = readFileSync("src/components/experience/EditorialHome.tsx", "utf8");
  const hero = readFileSync("src/components/experience/StudioHero.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const runtime = readFileSync("src/experience/ExperienceRuntime.tsx", "utf8");
  assert.match(homepage, /<StudioHero \/>/);
  assert.match(hero, /<StudioRoom \/>/);
  assert.match(room, /<Scene onSelect=\{selectTarget\}/);
  const authored = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  assert.match(authored, /<Canvas frameloop=\{active \? "always" : "never"\}/);
  assert.ok(authored.includes("yor-world-room.glb"));
  assert.ok(authored.includes("yor-world-resident.glb"));
  assert.ok(authored.includes("yor-world-fixture.glb"));
  assert.match(authored, /<AuthenticYorRoom onSelect=\{onSelect\} onInteract=\{onInteract\} onHover=\{onHover\} onToggleLights=\{onToggleLights\}/);
  assert.match(runtime, /pathname !== "\/" && <ExperienceSceneLayer/);
  assert.doesNotMatch(hero, /Illustrated engineer portrait/);
});

test("recovered objects have camera targets and physical interactions", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const runtime = readFileSync("src/components/experience/studio-room-runtime.ts", "utf8");
  const camera = readFileSync("src/components/experience/StudioWalkCamera.tsx", "utf8");
  for (const target of ["work", "about", "lab", "contact"]) {
    assert.match(camera, new RegExp(`\\b${target}: \\{ eye:`));
  }
  assert.match(camera, /function StudioWalkCamera/);
  assert.match(camera, /camera\.position\.lerp/);
  assert.match(runtime, /function identifyRoomObject/);
  assert.match(runtime, /function setStudioLights/);
  assert.match(runtime, /class StudioGreeting/);
  assert.match(scene, /function StudioHexLights/);
  assert.match(scene, /new THREE\.ShapeGeometry/);
  assert.match(runtime, /oldFixture\.visible = false/);
  assert.match(room, /setLightsOn/);
  assert.match(room, /prefers-reduced-motion: reduce/);
  assert.match(room, /studioShouldMount\(lifecycle\)/);
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
  const camera = readFileSync("src/components/experience/StudioWalkCamera.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(hero, /href="#studio"/);
  assert.match(room, /window\.addEventListener\("hashchange", handleStudioLink\)/);
  assert.match(room, /setIntroSequence\(\(value\) => value \+ 1\)/);
  assert.match(room, /Replay doorway entrance animation/);
  assert.match(room, /setIntroSequence\(0\)/);
  assert.match(room, /introSequence=\{introSequence\}/);
  assert.match(room, /data-intro-active=\{String\(introActive\)\}/);
  assert.match(room, /SKIP INTRO/);
  assert.match(room, /onIntroComplete=\{finishIntro\}/);
  assert.match(authored, /<StudioWalkCamera selected=\{selected\} introSequence=\{introSequence\}/);
  assert.match(camera, /entryTime\.current = roaming \? null : introSequence > 0 \? 0 : null/);
  assert.match(authored, /entryTime\.current = introSequence > 0 \? 0 : null/);
  assert.match(camera, /camera\.position\.copy\(doorEye\)\.lerp\(portrait \? portraitDeskEye : desktopCamera\?\.position \?\? deskEye, eased\)/);
  assert.match(authored, /doorwayOpening/);
  assert.match(camera, /onIntroComplete\(\)/);
  assert.match(css, /\.yor-studio__utilities button:last-child \{ display:inline-flex/);
});

test("Yor World object map drives real blinds and tilt with accessible DOM controls", () => {
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  const roomRuntime = readFileSync("src/components/experience/studio-room-runtime.ts", "utf8");
  for (const object of ["monitor", "painting", "blinds", "lights", "avatar", "door", "skills"]) {
    assert.match(roomRuntime, new RegExp(`return "${object}"`), `Scene must recognize ${object}`);
  }
  assert.match(roomRuntime, /getObjectByName\("painting-pivot"\)/);
  assert.match(roomRuntime, /getObjectByName\(`blind_slat_/);
  assert.match(roomRuntime, /getObjectByName\("hidden-yor-mark"\)/);
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

test("actual GLB fills the opening cinematic stage instead of an editorial side card", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const camera = readFileSync("src/components/experience/StudioWalkCamera.tsx","utf8");
  const roomRuntime = readFileSync("src/components/experience/studio-room-runtime.ts","utf8");
  const css = readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(camera,/desktopCamera\?\.fov \?\? 55/);
  assert.match(camera,/selected === "work" \? homeEye/);
  assert.match(roomRuntime,/Camera_HomeDesktop/);
  assert.match(scene,/gl\.toneMappingExposure=\.95/);
  assert.match(roomRuntime,/node\.intensity = intensity \* \(enabled \? \.00092 : \.00012\)/);
  assert.match(scene,/function StudioHexLights/);
  assert.match(scene,/new THREE.ShapeGeometry/);
  assert.match(roomRuntime,/oldFixture\.visible = false/);
  assert.match(scene,/<StudioHexLights lightsOn=\{lightsOn\}/);
  assert.match(scene,/HEX_LIGHTS.map/);
  assert.match(scene,/<pointLight position=\{\[0,2\.05,-1\.5\]\}/);
  assert.match(css,/Full-room art direction:/);
  assert.match(css,/\.yor-world-hero__intro \{[\s\S]*?grid-column:1;grid-row:2;align-self:center/);
  assert.match(css,/\.yor-world-hero__studio\.machine-home \{[\s\S]*?grid-column:1;grid-row:2/);
  assert.match(css,/\.yor-world-hero__studio \.yor-studio__viewport \{[\s\S]*?height:clamp\(615px,76vh,850px\)/);
  assert.match(css,/\.yor-world-hero__studio\.machine-home:has\(\[data-console-open="true"\]\)/);
  assert.match(css,/@media \(max-width:800px\)/);
  assert.match(css,/height:min\(81svh,720px\)/);
});

test("studio prioritizes the reference-backed wide camera and pastel daylight over the dark hero", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const camera = readFileSync("src/components/experience/StudioWalkCamera.tsx", "utf8");
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(camera, /authoredDesktopTarget/);
  assert.match(camera, /const fov = portrait \? 64 : desktopCamera\?\.fov \?\? 55/);
  assert.match(scene, /ambientLight intensity=\{\.49\}/);
  assert.match(scene, /THREE\.AdditiveBlending/);
  assert.match(room, /data-photo-mode=\{String\(photoMode\)\}/);
  assert.match(room, /Exit distraction-free room view/);
  assert.match(room, /event\.key === "Escape"\) setPhotoMode\(false\)/);
  assert.match(css, /Reference-aligned pastel workstation art pass/);
  assert.match(css, /\.yor-studio\[data-photo-mode="true"\]/);
  assert.match(css, /\.yor-studio__photo-toggle/);
});

test("studio controls remain legible and keyboard-visible over the bright rendered room", () => {
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(css, /yor-studio__topline > \[role="status"\]/);
  assert.match(css, /background:rgba\(13,16,38,\.78\)/);
  assert.match(css, /\.yor-studio__utilities button:disabled/);
  assert.match(css, /\.yor-studio__utilities button:focus-visible/);
});

test("high-detail authored gaming props replace low-poly blockout groups without deleting controls", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const roomRuntime = readFileSync("src/components/experience/studio-room-runtime.ts","utf8");
  const css = readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(scene,/yor-world-workstation-details\.glb/);
  for(const node of ["helios-pc","controller-pegboard","plants_group"]) {
    assert.ok(roomRuntime.includes('"' + node + '"'), "Missing authored dressing " + node);
  }
  assert.match(roomRuntime,/const dressing = clone\(workstationDetail\.scene\)/);
  assert.match(roomRuntime,/group\.attach\(detail\)/);
  assert.match(roomRuntime,/controller-pegboard/);
  assert.match(css,/Compact mobile introduction preceding the 3D room/);
  assert.match(css,/grid-column:1;grid-row:3/);
  assert.ok(statSync("public/models/yor-world-workstation-details.glb").size > 700_000);
});

test("reference dressing uses modeled RGB fans, gamepads and trailing vines, not flat image overlays", () => {
  const detail = readFileSync("src/components/experience/StudioReferenceDressing.tsx", "utf8");
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(detail, /function GlowingFan/);
  assert.match(detail, /function Controller/);
  assert.match(detail, /function HangingVine/);
  assert.match(detail, /CatmullRomCurve3/);
  assert.match(detail, /torusGeometry/);
  assert.match(detail, /onOpenComputer/);
  assert.match(detail, /onExplore/);
  assert.match(scene, /<StudioReferenceDressing lightsOn=\{lightsOn\}/);
  assert.match(scene, /\[-\.57,2\.38,"#dfaeff"\]/);
  assert.match(css, /Second-stage art pass:/);
});

test("reference composition keeps the workstation visible and intro in the left wall area", () => {
  const camera=readFileSync("src/components/experience/StudioWalkCamera.tsx","utf8");
  const runtime=readFileSync("src/components/experience/studio-room-runtime.ts","utf8");
  const css=readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(camera, /const fov = portrait \? 64 : desktopCamera\?\.fov \?\? 55/);
  assert.match(runtime, /Camera_HomeDesktop/);
  assert.match(camera, /selected === "work" \? homeEye/);
  assert.match(camera, /portraitDeskEye = useMemo\(\(\) => new THREE.Vector3\(-0\.42, 1\.65, 1\.85\)/);
  assert.match(css, /Desktop first-view composition/);
  assert.match(css, /grid-column:1;grid-row:2;margin-top:0/);
  assert.match(css, /width:min\(315px,30%\)/);
});

test("the reference workstation includes lightweight modeled desk and floor accessories", () => {
  const details=readFileSync("src/components/experience/StudioDeskProps.tsx","utf8");
  const scene=readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  for(const feature of ["DeskConsole","ClockAndController","StandingFloorPlant","Planter"]) {
    assert.match(details,new RegExp("function " + feature + "\\("));
  }
  assert.match(scene, /<StudioDeskProps onOpen=\{\(\) => onInteract\("monitor"\)\}\/>/);
  assert.match(details, /position=\{\[-1\.02,\.751,-\.99\]\}/);
  assert.match(details, /scale=\{\[\.055,\.04,\.043\]\}/);
});
