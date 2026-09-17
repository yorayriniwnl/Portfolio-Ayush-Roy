import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectIndex } from "../src/components/ProjectIndex";
import { cvProjects } from "../src/content/projects";

test("renders only the six CV projects and only verified live CTAs", () => {
  const html = renderToStaticMarkup(React.createElement(ProjectIndex, { projects: cvProjects }));
  assert.equal(html.includes("Yor Token Usage"), false);
  assert.equal(html.includes("/projects/zenith/live"), true);
  assert.equal(html.includes("/projects/portfolio/live"), true);
  assert.equal(html.includes("/projects/helios/live"), true);
  assert.equal(html.includes("/projects/ai-vs-real/live"), true);
  assert.equal(html.includes("/projects/talks/live"), false);
  assert.equal(html.includes("/projects/candidatex/live"), false);
  assert.equal(html.includes("/projects/candidatex/source"), true);
  assert.equal(html.includes("https://github.com/yorayriniwnl/"), false);
  for (const slug of ["portfolio", "helios", "zenith", "ai-vs-real", "talks", "candidatex"]) {
    assert.equal(html.includes(`/projects/${slug}`), true);
  }
});
