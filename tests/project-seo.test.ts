import assert from "node:assert/strict";
import test from "node:test";
import { getProjectMetadata, getProjectResolverMetadata, getResumeMetadata } from "../src/content/project-seo";
import { getCvProject } from "../src/content/project-system";

test("generates an absolute canonical project URL from the configured origin", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("velvetclip");
  assert.ok(project);
  const metadata = getProjectMetadata(project);
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/projects/velvetclip");
  assert.equal((metadata.openGraph as { url?: string }).url, "https://portfolio.example.test/projects/velvetclip");
  assert.equal((metadata.twitter as { card?: string }).card, "summary_large_image");
});

test("keeps project metadata distinct", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("falsequiet");
  assert.ok(project);
  const metadata = getProjectMetadata(project);
  assert.equal(metadata.title, project.seo.title);
  assert.match(String(metadata.description), /CIC-IDS2017/);
});

test("gives the resume its own canonical URL", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const metadata = getResumeMetadata();
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/resume");
});

test("gives resolver routes self-canonical URLs while keeping them noindex", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
  const project = getCvProject("avelry");
  assert.ok(project);
  const metadata = getProjectResolverMetadata(project, "source");
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/projects/avelry/source");
  assert.deepEqual(metadata.robots, { index: false, follow: false });
});
