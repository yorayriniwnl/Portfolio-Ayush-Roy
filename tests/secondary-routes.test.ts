import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { profile } from "../src/content/profile";
import { cvProjects, recruiterProjects } from "../src/content/project-registry";
import { videoWall } from "../src/content/hub";
import { createExperienceState } from "../src/experience/experience-state";

declare const require: NodeRequire;
require.extensions[".css"] = (module) => {
  module.exports = { link: "action-link", primary: "action-link-primary" };
};
const { default: Resume } = require("../src/app/resume/page") as typeof import("../src/app/resume/page");
const { Lab } = require("../src/components/Lab") as typeof import("../src/components/Lab");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

test("resume preserves identity, education, internship, project evidence, and contact actions", () => {
  const html = renderToStaticMarkup(React.createElement(Resume));
  assert.match(html, /<main id="main" class="resume-page container"[^>]*>/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  for (const fact of [profile.name, profile.role, profile.positioning, "B.Tech in Computer Science and Communication Engineering", "KIIT Deemed University", "2023–2027", "Bharat Sanchar Nigam Limited (BSNL)", "Telecom & Data Network Intern", "June 2026", "Chennai (Hybrid)", "Open PDF"]) {
    assert.ok(html.includes(escapeHtml(fact)), `resume is missing ${fact}`);
  }
  for (const href of ["/media/Ayush_Roy_Resume.pdf", `mailto:${profile.email}`, profile.links.github, profile.links.linkedin]) {
    assert.ok(html.includes(href), `resume is missing contact action ${href}`);
  }
  for (const project of cvProjects) {
    assert.ok(html.includes(escapeHtml(project.title)), `resume is missing ${project.title}`);
    assert.ok(html.includes(escapeHtml(project.outcome)), `resume is missing ${project.slug} outcome`);
    assert.ok(html.includes(`href="/projects/${project.slug}"`));
    assert.ok(html.includes(`href="/projects/${project.slug}/source"`));
  }
  assert.deepEqual(
    [...html.matchAll(/data-project-slug="([^"]+)"/g)].map((match) => match[1]),
    recruiterProjects.map((project) => project.slug),
  );
});

test("Lab keeps experiments separated from recruiter projects and the shared canvas routes", () => {
  const html = renderToStaticMarkup(React.createElement(Lab));
  assert.match(html, /<main id="main" class="hub-page lab-page">/);
  assert.ok(html.includes("ROOM CONCEPT"));
  assert.ok(html.includes("Chess as a place."));
  assert.ok(html.includes("CONCEPT / NOT PUBLISHED"));
  for (const item of videoWall) assert.ok(html.includes(item.title));
  assert.equal(html.includes("machine-scene-layer"), false);
  assert.equal(html.includes("<canvas"), false);
  assert.equal(createExperienceState("/lab").surface, "inactive");
});

test("navigation has five named destinations and predictable mobile keyboard behavior", () => {
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");
  const navCss = readFileSync("src/components/SiteNav.module.css", "utf8");
  const layout = readFileSync("src/app/layout.tsx", "utf8");

  assert.match(nav, /const links = \[\s*\["Work", "\/projects"\],\s*\["About", "\/#about"\],\s*\["Lab", "\/lab"\],\s*\["Resume", "\/resume"\]/);
  assert.match(nav, /aria-label="Ayush Roy home"/);
  assert.match(nav, /usePathname/);
  assert.match(nav, /aria-current=/);
  assert.match(nav, /aria-expanded=\{open\}/);
  assert.match(nav, /event\.key === "Escape"/);
  assert.match(nav, /firstLinkRef\.current\?\.focus\(\)/);
  assert.match(nav, /menuRef\.current\?\.focus\(\)/);
  assert.match(nav, /onClick=\{\(\) => setOpen\(false\)\}/);
  assert.doesNotMatch(nav, /Contact/);
  assert.match(navCss, /@media \(max-width: 850px\)/);
  assert.match(navCss, /\.mobile\[data-open="true"\]/);
  assert.match(navCss, /:focus-visible/);
  assert.match(layout, /className="machine-skip-link" href="#main"/);
  assert.match(readFileSync("src/styles/machine.css", "utf8"), /\.machine-skip-link:focus/);
});

test("all retained routes use the new CSS layers without rebuild overrides", () => {
  const globals = readFileSync("src/app/globals.css", "utf8");
  const machine = readFileSync("src/styles/machine.css", "utf8");
  assert.equal(globals.includes("@layer legacy"), false, "legacy globals layer remains");
  assert.equal(existsSync("src/app/rebuild.css"), false);
  assert.match(machine, /\.case-hero/);
  assert.match(machine, /\.resume-page/);
  assert.match(machine, /\.lab-page/);
  assert.match(machine, /\.link-unavailable/);
});
