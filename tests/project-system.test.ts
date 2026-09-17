import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_PROJECT_SLUGS,
  cvProjects,
  getCanonicalProjectSlug,
  getCvProject,
  getLegacyRedirect,
  resolveConfiguredProjectLink,
  resolveProjectLink,
  projectLinkPath,
  projectPath,
} from "../src/content/project-system";

test("exposes exactly the six CV project slugs", () => {
  assert.deepEqual([...CANONICAL_PROJECT_SLUGS], ["portfolio", "helios", "zenith", "ai-vs-real", "talks", "candidatex"]);
  assert.deepEqual(cvProjects.map((project) => project.slug), [...CANONICAL_PROJECT_SLUGS]);
  assert.equal(cvProjects.some((project) => project.slug === "token-usage"), false);
});

test("canonicalizes historical project aliases", () => {
  assert.equal(getCanonicalProjectSlug("texture-forensics"), "ai-vs-real");
  assert.equal(getCanonicalProjectSlug("yor-talks"), "talks");
  assert.equal(getCvProject("yor-helios")?.slug, "helios");
  assert.equal(getCanonicalProjectSlug("token-usage"), undefined);
});

test("maps legacy work paths to canonical project paths", () => {
  assert.equal(getLegacyRedirect("helios"), "/projects/helios");
  assert.equal(getLegacyRedirect("texture-forensics"), "/projects/ai-vs-real");
  assert.equal(getLegacyRedirect("yor-talks"), "/projects/talks");
  assert.equal(getLegacyRedirect("not-a-project"), undefined);
});

test("resolves the verified Zenith live target", () => {
  const result = resolveProjectLink("zenith", "live");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://zenith-xi-snowy.vercel.app");
});

test("resolves the deployed portfolio live target", () => {
  const result = resolveProjectLink("portfolio", "live");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://yorayriniwnl.in");
});

test("resolves the bounded Helios frontend demo", () => {
  const result = resolveProjectLink("helios", "live");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://yor-helios-demo.vercel.app");
});

test("resolves the AI detector inference demo", () => {
  const result = resolveProjectLink("ai-vs-real", "live");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://yor-ai-vs-real-detector.vercel.app");
});

test("keeps Yor Talks live unavailable", () => {
  assert.equal(resolveProjectLink("talks", "live").kind, "unavailable");
});

test("adds CandidateX to the canonical project system with verified source and bounded live state", () => {
  assert.equal(getCvProject("candidatex")?.title, "CandidateX");
  assert.equal(projectPath("candidatex"), "/projects/candidatex");

  const source = resolveProjectLink("candidatex", "source");
  assert.equal(source.kind, "redirect");
  if (source.kind === "redirect") assert.equal(source.target, "https://github.com/yorayriniwnl/CandidateX");

  assert.equal(resolveProjectLink("candidatex", "live").kind, "unavailable");
});

test("resolves source through the stable source namespace", () => {
  const result = resolveProjectLink("talks", "source");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://github.com/yorayriniwnl/yor-talksv2");
});

test("rejects malformed configured redirect data", () => {
  const project = getCvProject("zenith");
  assert.ok(project);
  const broken = {
    ...project,
    links: { ...project.links, live: "http://localhost:3000" },
    availability: { ...project.availability, live: "verified" as const },
  };
  assert.equal(resolveConfiguredProjectLink(broken, "live").kind, "unavailable");
});

test("returns not-found for an unknown project link", () => {
  assert.equal(resolveProjectLink("missing", "source").kind, "not-found");
});

test("generates stable canonical project paths and keeps demo modes scoped", () => {
  assert.equal(projectPath("ai-vs-real"), "/projects/ai-vs-real");
  assert.equal(projectLinkPath("talks", "source"), "/projects/talks/source");
  assert.equal(cvProjects.some((project) => String(project.demoMode) === "token-usage"), false);
  assert.equal(getCvProject("portfolio")?.demoMode, undefined);
});
