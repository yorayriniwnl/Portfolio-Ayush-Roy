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
  assert.match(hero, /href="\/projects"/);
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
  assert.match(authored, /function WorldCamera\(\{ selected, introSequence, roaming \}/);
  assert.match(authored, /entryTime\.current = introSequence > 0 \? 0 : null/);
  assert.match(authored, /camera\.position\.copy\(doorEye\)\.lerp\(portrait \? portraitDeskEye : deskEye,eased\)/);
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

test("actual GLB fills the opening cinematic stage instead of an editorial side card", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const css = readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(scene,/work: \{ eye: \[-0\.82,1\.72,1\.50\]/);
  assert.match(scene,/gl\.toneMappingExposure=\.95/);
  assert.match(scene,/node\.intensity = intensity \* \(lightsOn \? \.00092 : \.00012\)/);
  assert.match(scene,/function StudioHexLights/);
  assert.match(scene,/new THREE.ShapeGeometry/);
  assert.match(scene,/oldFixture.visible=false/);
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
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const css = readFileSync("src/styles/studio-revival.css", "utf8");
  assert.match(scene, /look: \[0\.04,1\.30,-1\.23\]/);
  assert.match(scene, /ambientLight intensity=\{\.49\}/);
  assert.match(scene, /THREE\.AdditiveBlending/);
  assert.match(room, /data-photo-mode=\{String\(photoMode\)\}/);
  assert.match(room, /Exit distraction-free room view/);
  assert.match(room, /event\.key === "Escape"\) setPhotoMode\(false\)/);
  assert.match(css, /Reference-aligned pastel workstation art pass/);
  assert.match(css, /\.yor-studio\[data-photo-mode="true"\]/);
  assert.match(css, /\.yor-studio__photo-toggle/);
});

test("high-detail authored gaming props replace low-poly blockout groups without deleting controls", () => {
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const css = readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(scene,/yor-world-workstation-details\.glb/);
  for(const node of ["helios-pc","controller-pegboard","plants_group"]) {
    assert.ok(scene.includes('"' + node + '"'), "Missing authored dressing " + node);
  }
  assert.match(scene,/authoredDressing = workstationDetail\.scene\.clone\(true\)/);
  assert.match(scene,/model\.attach\(detail\)/);
  assert.match(scene,/controller-pegboard/);
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

test("reference composition keeps the whole workstation visible without covering desktop content", () => {
  const scene=readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const css=readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(scene, /targetFov = portrait \? 64 : 55/);
  assert.match(scene, /portraitDeskEye = useMemo\(\(\) => new THREE.Vector3\(-\.42,1\.65,1\.85\)/);
  assert.match(css, /Room-first editorial strip/);
  assert.match(css, /grid-column:1;grid-row:3;margin-top:0/);
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

test("room can be traversed by WASD, clicking the floor and mobile directional controls", () => {
  const room=readFileSync("src/components/experience/StudioRoom.tsx","utf8");
  const scene=readFileSync("src/components/experience/YorWorldShowcaseScene.tsx","utf8");
  const camera=readFileSync("src/components/experience/StudioWalkCamera.tsx","utf8");
  const walk=readFileSync("src/components/experience/StudioWalk.ts","utf8");
  const css=readFileSync("src/styles/studio-revival.css","utf8");
  assert.match(room,/data-roaming=\{String\(roaming\)\}/);
  assert.match(room,/WALK THE ROOM/);
  assert.match(room,/onWalkTo=\{walkToPoint\}/);
  assert.match(room,/onWalkStep=\{reportWalk\}/);
  assert.match(room,/yor-studio__touch-pad/);
  assert.match(room,/setPointerCapture/);
  assert.match(scene,/<planeGeometry args=\{\[3\.9,3\.35\]\}/);
  assert.match(scene,/event\.ray\.intersectPlane/);
  assert.match(scene,/onWalkTo\(\{x:event\.point\.x,z:event\.point\.z\}\)/);
  assert.match(camera,/window\.addEventListener\("keydown",down\)/);
  assert.match(camera,/canvas\.addEventListener\("pointerdown",startDrag\)/);
  assert.match(scene,/gl\.domElement\.tabIndex=0/);
  assert.match(camera,/if\(touchDirection==="forward"\)/);
  assert.match(camera,/route\.current=walkRoute/);
  assert.match(camera,/camera\.lookAt\(next\.x/);
  assert.match(camera,/document\.activeElement/);
  assert.match(walk,/export function isWalkable/);
  assert.match(walk,/export function nearestWalkable/);
  assert.match(walk,/export function slideWalk/);
  assert.match(walk,/export function walkRoute/);
  assert.match(css,/\.yor-studio__touch-pad/);
  assert.match(css,/\[data-roaming="true"\]/);
});


test("the optional studio exposes an honest accessible fallback when WebGL or motion is unavailable", () => {
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const css = readFileSync("src/styles/recruiter-first.css", "utf8");
  assert.match(room, /graphicsChecked/);
  assert.match(room, /role="status"/);
  assert.match(room, /Motion-reduced mode: the animated 3D scene is paused/);
  assert.match(room, /Interactive WebGL is unavailable/);
  assert.match(room, /<Link href="\/projects">all case studies<\/Link>/);
  assert.match(css, /yor-studio__availability/);
});


test("the room conserves GPU rendering while offscreen and resumes without remounting", () => {
  const room = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  const scene = readFileSync("src/components/experience/YorWorldShowcaseScene.tsx", "utf8");
  assert.match(room, /setInViewport\(nearViewport\)/);
  assert.match(room, /if \(nearViewport\) setVisible\(true\)/);
  assert.match(room, /paused=\{consoleOpen \|\| !inViewport\}/);
  assert.match(scene, /frameloop=\{paused \? "demand" : "always"\}/);
});
