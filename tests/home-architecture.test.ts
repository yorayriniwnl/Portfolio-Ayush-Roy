import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("homepage keeps static content on the server and uses the persistent machine scene", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const runtime = readFileSync("src/experience/ExperienceRuntime.tsx", "utf8");

  assert.doesNotMatch(home, /^\s*["']use client["']/m);
  assert.doesNotMatch(home, /HeroSceneIsland|HeroScene|<Canvas/);
  assert.match(runtime, /ExperienceSceneLayer/);
});

test("unfinished game and video concepts live in the lab, not the recruiter homepage", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const lab = readFileSync("src/components/Lab.tsx", "utf8");
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");

  assert.doesNotMatch(home, /gameRooms|videoWall|ROOM CONCEPT|FEED SLOT \/ READY/);
  assert.match(home, /href="\/lab"/);
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
