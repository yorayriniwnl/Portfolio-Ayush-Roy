import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectIndex } from "../src/components/ProjectIndex";
import { recruiterProjects } from "../src/content/project-registry";

test("renders only the six CV projects and verified live CTAs", () => {
  const html = renderToStaticMarkup(React.createElement(ProjectIndex, { projects: recruiterProjects }));
  assert.equal(html.includes("Yor Token Usage"), false);
  assert.equal(html.includes("/projects/zenith/live"), true);
  assert.equal(html.includes("/projects/portfolio/live"), true);
  assert.equal(html.includes("/projects/helios/live"), true);
  assert.equal(html.includes("/projects/ai-vs-real/live"), true);
  assert.equal(html.includes("/projects/talks/live"), false);
  assert.equal(html.includes("/projects/candidatex/live"), true);
  assert.equal(html.includes("https://github.com/yorayriniwnl/"), false);
  assert.ok(html.indexOf("CandidateX") < html.indexOf("Yor Helios"));
  assert.ok(html.indexOf("Yor Helios") < html.indexOf("Personal Developer Portfolio"));
  for (const slug of ["portfolio", "helios", "zenith", "ai-vs-real", "talks", "candidatex"]) {
    assert.equal(html.includes(`/projects/${slug}`), true);
  }
});
