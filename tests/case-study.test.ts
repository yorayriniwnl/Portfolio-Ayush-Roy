import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ExperienceProvider } from "../src/experience/ExperienceProvider";
import { recruiterProjects } from "../src/content/project-registry";

declare const require: NodeRequire;
require.extensions[".css"] = (module) => {
  module.exports = { link: "action-link", primary: "action-link-primary" };
};
const { CaseStudy } = require("../src/components/CaseStudy") as typeof import("../src/components/CaseStudy");

const semanticSections = ["overview", "contribution", "architecture", "implementation", "testing", "results", "limitations", "next-iteration"];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#x27;");
}

function renderCaseStudy(project: (typeof recruiterProjects)[number]) {
  const providerProps = { initialPathname: `/projects/${project.slug}` } as React.ComponentProps<typeof ExperienceProvider>;
  return renderToStaticMarkup(
    React.createElement(ExperienceProvider, providerProps, React.createElement(CaseStudy, { project })),
  );
}

test("all canonical studies keep one named h1 and complete semantic evidence", () => {
  assert.equal(recruiterProjects.length, 6);

  for (const project of recruiterProjects) {
    const html = renderCaseStudy(project);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, project.slug);
    assert.match(html, new RegExp(`<main id="main" data-experience-project="${project.slug}"`), project.slug);

    for (const section of semanticSections) {
      assert.ok(html.includes(`data-case-section="${section}"`), `${project.slug} is missing ${section}`);
    }
    assert.ok(html.includes(escapeHtml(project.problem)), `${project.slug} is missing its overview`);
    assert.ok(html.includes(escapeHtml(project.contribution)), `${project.slug} is missing its contribution boundary`);
    assert.ok(html.includes(escapeHtml(project.architecture[0])), `${project.slug} is missing architecture evidence`);
    assert.ok(html.includes(escapeHtml(project.testing[0])), `${project.slug} is missing validation evidence`);
    assert.ok(html.includes(escapeHtml(project.evidenceScope)), `${project.slug} is missing evidence scope`);
    assert.ok(html.includes(escapeHtml(project.limitations[0])), `${project.slug} is missing limitations`);
    assert.ok(html.includes(`/projects/${project.slug}/source`) === (project.availability.source === "verified"), `${project.slug} source route`);
    if (project.availability.live === "verified") assert.ok(html.includes(`/projects/${project.slug}/live`), `${project.slug} live route`);
  }
});

test("repository galleries retain descriptive captions and lazy decoded images", () => {
  const projectsWithMedia = recruiterProjects.filter((project) => project.media.length > 0);
  assert.ok(projectsWithMedia.length > 0);

  for (const project of projectsWithMedia) {
    const html = renderCaseStudy(project);
    for (const item of project.media) {
      assert.ok(html.includes(`alt="${escapeHtml(item.alt)}"`), `${project.slug} ${item.label} alt`);
      assert.ok(html.includes(escapeHtml(item.caption)), `${project.slug} ${item.label} caption`);
      assert.match(html, /loading="lazy"/);
      assert.match(html, /decoding="async"/);
    }
  }
});

test("case-study demonstrations use DOM controls and no per-study canvas module", () => {
  const projectsWithDemo = recruiterProjects.filter((project) => project.demoMode);
  assert.ok(projectsWithDemo.length > 0);
  assert.equal(existsSync("src/components/ProjectDemo.tsx"), false, "the standalone ProjectDemo renderer must be removed");
  assert.equal(existsSync("src/components/DeferredProjectDemo.tsx"), false, "the standalone deferred renderer must be removed");

  for (const project of projectsWithDemo) {
    const html = renderCaseStudy(project);
    assert.match(html, /<section class="demo"/);
    assert.match(html, /role="status"/);
    assert.match(html, /<button\b/);
    assert.doesNotMatch(html, /<canvas\b|data-renderer=/i);
    assert.ok(html.includes(`data-demo-project="${project.slug}"`));

    if (project.demoMode === "talks") {
      assert.ok(html.includes("Send sample message"));
      assert.ok(html.includes('aria-pressed="true"'));
      assert.ok(html.includes("Source / social/src/App.tsx"));
      assert.ok(html.includes("e2e/core-social.spec.ts"));
    } else {
      assert.ok(html.includes('aria-pressed="true"'));
      assert.ok(html.includes('data-demo-choice="0"'));
    }
  }

  const panelSource = readFileSync("src/components/ProjectInteractionPanel.tsx", "utf8");
  assert.doesNotMatch(panelSource, /@react-three\/fiber|<Canvas\b|WebGPURenderer/);
});
