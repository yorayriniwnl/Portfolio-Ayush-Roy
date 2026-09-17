import assert from "node:assert/strict";
import test from "node:test";
import { cvProjects } from "../src/content/project-registry";
import { getCvProject, resolveProjectLink } from "../src/content/project-system";

test("CandidateX is the sixth recruiter-facing project", () => {
  assert.deepEqual(cvProjects.map((project) => project.slug), [
    "portfolio",
    "helios",
    "zenith",
    "ai-vs-real",
    "talks",
    "candidatex",
  ]);
  assert.equal(getCvProject("candidatex")?.index, "06");
});

test("CandidateX exposes source without inventing a live deployment", () => {
  const source = resolveProjectLink("candidatex", "source");
  assert.equal(source.kind, "redirect");
  if (source.kind === "redirect") {
    assert.equal(source.target, "https://github.com/yorayriniwnl/CandidateX");
  }
  assert.equal(resolveProjectLink("candidatex", "live").kind, "unavailable");
});
