import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectIndex } from "../src/components/ProjectIndex";
import { ExperienceProvider } from "../src/experience/ExperienceProvider";
import { recruiterProjects } from "../src/content/project-registry";
import { projectLinkPath, projectPath, resolveProjectLink } from "../src/content/project-system";

const expectedOrder = ["candidatex", "zenith", "helios", "ai-vs-real", "talks", "portfolio"] as const;

function renderIndex() {
  const providerProps = { initialPathname: "/projects" } as React.ComponentProps<typeof ExperienceProvider>;
  return renderToStaticMarkup(
    React.createElement(ExperienceProvider, providerProps, React.createElement(ProjectIndex, { projects: recruiterProjects })),
  );
}

test("recruiter index presents the six canonical projects in the approved order", () => {
  assert.deepEqual(recruiterProjects.map((project) => project.slug), expectedOrder);

  const html = renderIndex();

  assert.equal(html.includes("Yor Token Usage"), false);
  assert.equal((html.match(/data-project-slug=/g) ?? []).length, 6);
  for (const slug of expectedOrder) {
    assert.ok(html.includes(`data-project-slug="${slug}"`));
    assert.ok(html.includes(`href="${projectPath(slug as (typeof expectedOrder)[number])}"`));
  }
  assert.ok(html.indexOf('data-project-slug="candidatex"') < html.indexOf('data-project-slug="zenith"'));
  assert.ok(html.indexOf('data-project-slug="zenith"') < html.indexOf('data-project-slug="helios"'));
  assert.ok(html.indexOf('data-project-slug="helios"') < html.indexOf('data-project-slug="ai-vs-real"'));
  assert.ok(html.indexOf('data-project-slug="ai-vs-real"') < html.indexOf('data-project-slug="talks"'));
  assert.ok(html.indexOf('data-project-slug="talks"') < html.indexOf('data-project-slug="portfolio"'));
});

test("case, source, and live actions use stable internal resolver paths", () => {
  const html = renderIndex();

  for (const project of recruiterProjects) {
    const slug = project.slug as (typeof expectedOrder)[number];
    const caseResolution = resolveProjectLink(slug, "source");
    assert.equal(caseResolution.kind, "redirect");
    assert.ok(html.includes(`href="${projectPath(slug)}"`));
    assert.ok(html.includes(`aria-label="Open ${project.title} case study"`));

    for (const kind of ["source", "live"] as const) {
      const resolution = resolveProjectLink(slug, kind);
      const hasVerifiedTarget = resolution.kind === "redirect";
      const path = projectLinkPath(slug, kind);
      assert.equal(html.includes(`href="${path}"`), hasVerifiedTarget);
      if (hasVerifiedTarget) assert.equal(html.includes(resolution.target), false);
    }
  }
  assert.equal(html.includes("https://github.com/yorayriniwnl/"), false);
});

test("every row exposes native selection links and preserves registry labels and metrics", () => {
  const html = renderIndex();

  for (const project of recruiterProjects) {
    assert.ok(html.includes(`data-project-active="false"`));
    assert.ok(html.includes(project.title));
    assert.ok(html.includes(project.status));
    for (const metric of project.metrics.slice(0, 2)) {
      assert.ok(html.includes(metric.label));
      assert.ok(html.includes(metric.value));
    }
  }
});
