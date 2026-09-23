import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("homepage keeps static content on the server and uses the persistent machine scene", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const runtime = readFileSync("src/experience/ExperienceRuntime.tsx", "utf8");
  const world = readFileSync("src/experience/MachineWorld.tsx", "utf8");
  const core = readFileSync("src/experience/MachineCore.tsx", "utf8");

  assert.doesNotMatch(home, /^\s*["']use client["']/m);
  assert.doesNotMatch(home, /HeroSceneIsland|HeroScene|<Canvas/);
  assert.match(home, /MachineScrollBinding/);
  assert.match(home, /MachineHero/);
  assert.match(home, /HomeProjectWorlds/);
  assert.match(home, /HomeAbout/);
  assert.match(home, /HomeContact/);
  assert.match(world, /state\.progress/);
  assert.match(world, /activeCamera\.position\.z/);
  assert.match(core, /const opening = .*state\.progress/);
  assert.match(runtime, /ExperienceSceneLayer/);
});

test("home narrative keeps the approved identity, essential actions, and section markers in DOM components", () => {
  const hero = readFileSync("src/components/experience/MachineHero.tsx", "utf8");
  const projects = readFileSync("src/components/experience/HomeProjectWorlds.tsx", "utf8");
  const about = readFileSync("src/components/experience/HomeAbout.tsx", "utf8");
  const contact = readFileSync("src/components/experience/HomeContact.tsx", "utf8");
  const preview = readFileSync("src/components/experience/ProjectPreviewLink.tsx", "utf8");
  const binding = readFileSync("src/components/experience/MachineScrollBinding.tsx", "utf8");
  const provider = readFileSync("src/experience/ExperienceProvider.tsx", "utf8");
  const styles = readFileSync("src/styles/machine.css", "utf8");

  assert.match(hero, /YOR/);
  assert.match(hero, /I BUILD SYSTEMS/);
  assert.match(hero, /THAT MOVE/);
  assert.match(hero, /I BUILD SYSTEMS<\/span>\{" "\}\s*<span>THAT MOVE/);
  assert.match(hero, /FULL STACK/);
  assert.match(hero, /INTERACTIVE 3D/);
  assert.match(hero, /Explore Work/);
  assert.match(hero, /Resume/);
  assert.match(hero, /GitHub/);
  assert.equal((hero.match(/className="machine-action(?:\s|")/g) ?? []).length, 3);
  assert.match(hero, /AYUSH ROY \/ PRODUCT ENGINEER \/ 2026/);
  assert.match(projects, /data-experience-section=["']projects["']/);
  assert.match(about, /data-experience-section=["']about["']/);
  assert.match(contact, /data-experience-section=["']contact["']/);
  assert.match(contact, /THAT SHOULDN(?:&apos;|')T/);
  assert.match(contact, /BUILD<\/span>\{" "\}\s*<span>SOMETHING/);
  assert.match(preview, /onPointerEnter/);
  assert.match(preview, /onFocus/);
  assert.match(preview, /onTouchStart/);
  assert.match(preview, /useExperienceProject/);
  assert.doesNotMatch(preview, /useExperience\(/);
  assert.match(provider, /useExperienceProject/);
  assert.match(binding, /state\.progress/);
  assert.match(binding, /data-machine-section=\{state\.section\}/);
  assert.match(binding, /machine-wordmark-left/);
  assert.match(styles, /@media\s*\(max-width:\s*430px\)/);
  assert.match(styles, /machine-hero__wordmark/);
});

test("unfinished game and video concepts stay off the recruiter homepage and remain in the lab", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const lab = readFileSync("src/components/Lab.tsx", "utf8");
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");

  assert.doesNotMatch(home, /gameRooms|videoWall|ROOM CONCEPT|FEED SLOT \/ READY/);
  assert.doesNotMatch(home, /href="\/lab"/);
  assert.match(lab, /gameRooms/);
  assert.match(lab, /videoWall/);
  assert.match(nav, /\["Lab", "\/lab"\]/);
});

test("persistent experience runtime wraps the server-owned application shell", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const runtime = readFileSync("src/experience/ExperienceRuntime.tsx", "utf8");
  const provider = readFileSync("src/experience/ExperienceProvider.tsx", "utf8");

  assert.doesNotMatch(layout, /^\s*["']use client["']/m);
  assert.match(layout, /<ExperienceRuntime>[\s\S]*<SiteNav\s*\/>[\s\S]*application\/ld\+json[\s\S]*\{children\}[\s\S]*<\/ExperienceRuntime>/);
  assert.match(runtime, /usePathname/);
  assert.match(runtime, /initialPathname=\{pathname\}/);
  assert.match(runtime, /<ExperienceProvider\b/);
  assert.equal((runtime.match(/<ExperienceDirector\s*\/>/g) ?? []).length, 1);
  assert.match(provider, /function useExperience\(/);
  assert.match(provider, /setActiveProject/);
  assert.match(provider, /setDemoChoice/);
  assert.match(provider, /runDemo/);
  assert.match(provider, /selectDemoNode/);
  assert.match(provider, /setSceneStatus/);
  assert.match(provider, /ExperienceDispatchContext/);
});

test("experience director owns route, environment, section, and scroll lifecycles", () => {
  const director = readFileSync("src/experience/ExperienceDirector.tsx", "utf8");

  assert.match(director, /usePathname/);
  assert.match(director, /matchMedia/);
  assert.match(director, /visibilitychange/);
  assert.match(director, /IntersectionObserver/);
  assert.match(director, /addEventListener\(["']scroll["']/);
  assert.match(director, /removeEventListener\(["']scroll["']/);
  assert.match(director, /addEventListener\(["']resize["']/);
  assert.match(director, /removeEventListener\(["']resize["']/);
  assert.match(director, /cancelAnimationFrame/);
  assert.match(director, /\.disconnect\(/);
});
