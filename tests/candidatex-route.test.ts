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

test("CandidateX exposes verified source and live deployment resolvers", () => {
  const source = resolveProjectLink("candidatex", "source");
  assert.equal(source.kind, "redirect");
  if (source.kind === "redirect") {
    assert.equal(source.target, "https://github.com/yorayriniwnl/CandidateX");
  }

  const live = resolveProjectLink("candidatex", "live");
  assert.equal(live.kind, "redirect");
  if (live.kind === "redirect") {
    assert.equal(live.target, "https://candidatex-smoky.vercel.app");
  }
});
