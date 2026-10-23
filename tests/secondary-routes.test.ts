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

test("resume preserves identity, selection, education, internship, project evidence, and contact actions", () => {
  const html = renderToStaticMarkup(React.createElement(Resume));
  assert.match(html, /<main id="main" class="resume-page container"[^>]*>/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  for (const fact of [profile.name, profile.headline, profile.positioning, "KPIT Technologies", "Associate Engineer 2027", "onboarding pending", "This is a selection, not current employment.", "B.Tech in Computer Science and Communication Engineering", "KIIT Deemed University", "2023–2027", "Bharat Sanchar Nigam Limited (BSNL)", "Telecom & Data Network Intern", "June 2026", "Chennai (Hybrid)"]) {
    assert.ok(html.includes(escapeHtml(fact)), `resume is missing ${fact}`);
  }
  for (const href of [profile.links.resumePdf, `mailto:${profile.email}`, profile.links.github, profile.links.linkedin]) {
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
  assert.equal(html.includes("<canvas"), false, "the studio canvas mounts on the client, never in server HTML");
  assert.ok(html.includes('id="studio"'), "the 3D studio lives in the Lab");
  assert.ok(html.includes('aria-label="Reset camera view"'));
  assert.ok(html.includes("Drag to rotate."));
  assert.equal(html.includes('role="dialog"'), false, "scene navigation must not cover the model with a project dialog");
  assert.ok(html.indexOf('id="studio"') < html.indexOf('id="games"'), "the studio leads the Lab");
  assert.equal(createExperienceState("/lab").surface, "inactive");
});

test("navigation exposes all editorial sections and predictable mobile keyboard behavior", () => {
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");
  const navCss = readFileSync("src/components/SiteNav.module.css", "utf8");
  const layout = readFileSync("src/app/layout.tsx", "utf8");

  for (const name of ["Work", "About", "Lab", "Resume", "Contact"]) assert.ok(nav.includes(`["${name}",`));
  for (const removed of ["Skills", "Experience"]) assert.equal(nav.includes(`["${removed}",`), false, `${removed} anchor no longer exists`);
  assert.match(nav, /aria-label="Ayush Roy home"/);
  assert.match(nav, /usePathname/);
  assert.match(nav, /aria-current=/);
  assert.match(nav, /aria-expanded=\{open\}/);
  assert.match(nav, /event\.key === "Escape"/);
  assert.match(nav, /firstLinkRef\.current\?\.focus\(\)/);
  assert.match(nav, /menuRef\.current\?\.focus\(\)/);
  assert.match(nav, /onClick=\{\(\) => setOpen\(false\)\}/);
  assert.match(nav, /Contact/);
  assert.match(navCss, /@media \(max-width: 820px\)/);
  assert.match(nav, /className=\{styles\.wordmark\}><b>Y<\/b>OR \/ AYUSH ROY<\/span>/, "the wordmark must be one flex item so the gap never splits YOR");
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
