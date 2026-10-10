import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("homepage is server-rendered and delegates only interactions to small client islands", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const narrative = readFileSync("src/components/experience/EditorialHome.tsx", "utf8");
  const interactive = readFileSync("src/components/experience/EditorialInteractive.tsx", "utf8");
  const css = readFileSync("src/styles/editorial.css", "utf8");
  assert.doesNotMatch(home, /^\\s*["']use client["']/m);
  assert.doesNotMatch(narrative, /^\\s*["']use client["']/m);
  assert.match(home, /EditorialHome/);
  assert.match(narrative, /<main id="main" className="editorial-home"/);
  assert.match(narrative, /<EditorialSkills \\/>/);
  assert.match(narrative, /<EditorialWork projects=\\{portfolioCards\\} \\/>/);
  assert.match(interactive, /"use client"/);
  assert.match(interactive, /aria-pressed/);
  assert.match(interactive, /aria-roledescription="carousel"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("reference-inspired narrative preserves semantic sections, working URLs and evidence boundaries", () => {
  const narrative = readFileSync("src/components/experience/EditorialHome.tsx", "utf8");
  const interactive = readFileSync("src/components/experience/EditorialInteractive.tsx", "utf8");
  const registry = readFileSync("src/content/project-registry.ts", "utf8");
  for (const id of ["about", "experience", "moments", "contact"]) {
    assert.ok(narrative.includes(`id="${id}"`), `missing section ${id}`);
  }
  for (const id of ["skills", "projects"]) {
    assert.ok(interactive.includes(`id="${id}"`), `missing interactive section ${id}`);
  }
  assert.match(narrative, /Full Stack/);
  assert.match(narrative, /Developer/);
  assert.match(narrative, /data-essential-copy/);
  assert.match(narrative, /href="#projects"/);
  assert.match(narrative, /href="\\/resume"/);
  assert.match(interactive, /project\\.outcome/);
  assert.match(interactive, /project\\.purpose/);
  assert.match(interactive, /project\\.source/);
  assert.match(interactive, /project\\.live/);
  assert.match(registry, /recruiterProjects/);
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
