import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { homeHighlights } from "../src/content/home";
import { recruiterProjects } from "../src/content/project-registry";
import test from "node:test";

test("homepage is a single server-rendered page: hero, selected work, about, contact", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const css = readFileSync("src/styles/home.css", "utf8");
  assert.doesNotMatch(home, /^\s*["']use client["']/m);
  assert.match(home, /<main id="main" className="home">/);
  const order = ["home-hero", 'id="projects"', 'id="about"', 'id="contact"'].map((marker) => home.indexOf(marker));
  assert.ok(order.every((position) => position >= 0), "homepage is missing a section");
  assert.deepEqual([...order].sort((a, b) => a - b), order, "sections must read hero → work → about → contact");
  for (const section of ["identity", "projects", "about", "contact"]) {
    assert.match(home, new RegExp(`data-experience-section="${section}"`));
  }
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("the homepage stays short: no 3D room, skills grid, timeline or vanity counters", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  assert.doesNotMatch(home, /StudioRoom|<Canvas|EditorialSkills|periodic|id="skills"|id="experience"|id="moments"|By the/);
  assert.equal(existsSync("src/components/experience/EditorialInteractive.tsx"), false);
  assert.equal(existsSync("src/components/experience/StudioHero.tsx"), false);
  assert.equal(existsSync("src/styles/editorial.css"), false);
  assert.match(home, /coreStack\.join/);
  assert.ok(home.includes('href="/lab#studio"'), "homepage should point to the studio in the Lab");
});

test("hero keeps the one accent, working CTAs and recruiter facts", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  assert.match(home, /Building software<br \/>\s*<em>that works\.<\/em>/);
  assert.equal((home.match(/<em>/g) ?? []).length, 1, "only the hero headline carries the serif accent");
  assert.match(home, /href="#projects"/);
  assert.ok(home.includes('href="/resume"'));
  for (const fact of ["profile.status", "profile.education", "profile.location", "profile.email"]) {
    assert.ok(home.includes(fact), `hero facts are missing ${fact}`);
  }
  assert.match(home, /data-essential-copy/);
});

test("selected work shows three projects, each with a metric that exists in its case study", () => {
  assert.equal(homeHighlights.length, 3);
  for (const { project, metric, caption, source } of homeHighlights) {
    assert.ok(recruiterProjects.includes(project), `${project.slug} is not a recruiter project`);
    assert.ok(project.metrics.includes(metric), `${project.slug} metric is not from its registry entry`);
    assert.ok(source, `${project.slug} should link verified source`);
    const evidence = [metric.context, ...project.metrics.map((item) => `${item.value} ${item.context}`), ...project.results, project.outcome].join(" ");
    for (const number of caption.match(/\d[\d,./%]*/g) ?? []) {
      assert.ok(evidence.includes(number.replace(/[.,]$/, "")), `${project.slug} caption number ${number} is not backed by project data`);
    }
  }
});

test("unfinished game and video concepts stay off the recruiter homepage and remain in the lab", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const lab = readFileSync("src/components/Lab.tsx", "utf8");
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");

  assert.doesNotMatch(home, /gameRooms|videoWall|ROOM CONCEPT|FEED SLOT \/ READY/);
  assert.match(lab, /gameRooms/);
  assert.match(lab, /videoWall/);
  assert.match(lab, /<StudioRoom \/>/);
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
