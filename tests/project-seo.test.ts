import assert from "node:assert/strict";
import test from "node:test";
import { getProjectMetadata, getProjectResolverMetadata, getResumeMetadata } from "../src/content/project-seo";
import { getCvProject } from "../src/content/project-system";

test("generates an absolute canonical project URL from the configured origin", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("helios");
  assert.ok(project);
  const metadata = getProjectMetadata(project);
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/projects/helios");
  assert.equal((metadata.openGraph as { url?: string }).url, "https://portfolio.example.test/projects/helios");
  assert.equal((metadata.twitter as { card?: string }).card, "summary_large_image");
});

test("keeps project metadata distinct", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("ai-vs-real");
  assert.ok(project);
  const metadata = getProjectMetadata(project);
  assert.equal(metadata.title, project.seo.title);
  assert.match(String(metadata.description), /107-image holdout/);
});

test("gives the resume its own canonical URL", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const metadata = getResumeMetadata();
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/resume");
});

test("gives resolver routes self-canonical URLs while keeping them noindex", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("talks");
  assert.ok(project);
  const metadata = getProjectResolverMetadata(project, "source");
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/projects/talks/source");
  assert.deepEqual(metadata.robots, { index: false, follow: false });
});
