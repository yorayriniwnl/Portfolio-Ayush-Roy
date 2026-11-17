import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_PROJECT_SLUGS,
  cvProjects,
  getCanonicalProjectSlug,
  getCvProject,
  getLegacyProject,
  getLegacyRedirect,
  resolveConfiguredProjectLink,
  resolveProjectLink,
  projectLinkPath,
  projectPath,
} from "../src/content/project-system";

test("exposes exactly the six CV project slugs", () => {
  assert.deepEqual([...CANONICAL_PROJECT_SLUGS], ["portfolio", "velvetclip", "zenith", "falsequiet", "avelry", "candidatex"]);
  assert.deepEqual(cvProjects.map((project) => project.slug), [...CANONICAL_PROJECT_SLUGS]);
  assert.equal(cvProjects.some((project) => project.slug === "token-usage"), false);
});

test("canonicalizes historical project aliases", () => {
  assert.equal(getCanonicalProjectSlug("yor-talks"), "avelry");
  assert.equal(getCanonicalProjectSlug("talks"), "avelry");
  assert.equal(getCanonicalProjectSlug("yor-tools"), "velvetclip");
  assert.equal(getCvProject("h-nids")?.slug, "falsequiet");
  assert.equal(getCanonicalProjectSlug("texture-forensics"), undefined);
  assert.equal(getCanonicalProjectSlug("token-usage"), undefined);
});

test("maps legacy work paths to canonical project paths", () => {
  assert.equal(getLegacyRedirect("yor-talks"), "/projects/avelry");
  assert.equal(getLegacyRedirect("yor-tools"), "/projects/velvetclip");
  assert.equal(getLegacyRedirect("h-nids"), "/projects/falsequiet");
  assert.equal(getLegacyRedirect("helios"), undefined);
  assert.equal(getLegacyProject("helios")?.slug, "helios");
  assert.equal(getLegacyProject("texture-forensics")?.slug, "ai-vs-real");
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

test("resolves the live Avelry product and keeps its private source unlinked", () => {
  const live = resolveProjectLink("avelry", "live");
  assert.equal(live.kind, "redirect");
  if (live.kind === "redirect") assert.equal(live.target, "https://avelry.in");
  assert.equal(resolveProjectLink("avelry", "source").kind, "unavailable");
});

test("resolves the Velvetclip deployment and keeps its private source unlinked", () => {
  const live = resolveProjectLink("velvetclip", "live");
  assert.equal(live.kind, "redirect");
  if (live.kind === "redirect") assert.equal(live.target, "https://velvetclip.vercel.app");
  assert.equal(resolveProjectLink("velvetclip", "source").kind, "unavailable");
});

test("adds CandidateX to the canonical project system with verified source and verified demo live state", () => {
  assert.equal(getCvProject("candidatex")?.title, "CandidateX");
  assert.equal(projectPath("candidatex"), "/projects/candidatex");

  const source = resolveProjectLink("candidatex", "source");
  assert.equal(source.kind, "redirect");
  if (source.kind === "redirect") assert.equal(source.target, "https://github.com/yorayriniwnl/CandidateX");

  const live = resolveProjectLink("candidatex", "live");
  assert.equal(live.kind, "redirect");
  if (live.kind === "redirect") assert.equal(live.target, "https://candidatex-smoky.vercel.app");
});

test("resolves source through the stable source namespace", () => {
  const result = resolveProjectLink("falsequiet", "source");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://github.com/yorayriniwnl/Hybrid-Intelligent-Network-Intrusion-Detection-System");
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

test("rejects credential-bearing destinations and alternate localhost spellings", () => {
  const project = getCvProject("zenith");
  assert.ok(project);
  for (const live of [
    "https://username:password@example.com",
    "https://username@example.com",
    "http://localhost.:3000",
    "http://preview.localhost:3000",
    "http://127.0.0.1.:3000",
    "javascript:alert(1)",
  ]) {
    assert.equal(resolveConfiguredProjectLink({ ...project, links: { ...project.links, live } }, "live").kind, "unavailable", live);
  }
});

test("generates stable canonical project paths and keeps demo modes scoped", () => {
  assert.equal(projectPath("falsequiet"), "/projects/falsequiet");
  assert.equal(projectLinkPath("avelry", "source"), "/projects/avelry/source");
  assert.equal(cvProjects.some((project) => String(project.demoMode) === "token-usage"), false);
  assert.equal(getCvProject("portfolio")?.demoMode, undefined);
});
