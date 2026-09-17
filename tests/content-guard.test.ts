import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("content validator encodes the canonical six-project boundary", () => {
  const source = readFileSync("scripts/validate-content.mjs", "utf8");
  assert.match(source, /CANONICAL_PROJECT_SLUGS/);
  assert.match(source, /cvProjects\.length !== 6/);
  assert.match(source, /src\/content\/candidatex\.ts/);
  assert.match(source, /src\/content\/project-registry\.ts/);
  assert.match(source, /src\/app\/projects\/\[slug\]\/live\/page\.tsx/);
  assert.match(source, /NEXT_PUBLIC_SITE_URL|yorayriniwnl\.in/);
  assert.match(source, /cvProjects/);
  assert.match(source, /claimRegistry/);
});

test("release scripts and CI gate the test suite with a safe build origin", () => {
  const packageJson = readFileSync("package.json", "utf8");
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
  assert.match(packageJson, /"verify:code".*npm run test/s);
  assert.match(packageJson, /"build".*verify:code.*next build/s);
  assert.match(workflow, /npm run test/);
  assert.match(workflow, /npm run qa:browser/);
  assert.match(workflow, /NEXT_PUBLIC_SITE_URL:\s*https:\/\/portfolio\.example\.test/);
});

test("project registry uses a canonical portfolio record without mutating legacy copy", () => {
  const registry = readFileSync("src/content/project-registry.ts", "utf8");
  const portfolio = readFileSync("src/content/portfolio-project.ts", "utf8");
  const validator = readFileSync("scripts/validate-content.mjs", "utf8");

  assert.match(registry, /portfolioProject/);
  assert.match(registry, /legacyCvProjects\.filter\(\(project\) => project\.slug !== "portfolio"\)/);
  assert.doesNotMatch(registry, /\.replace\(|normalizedOriginalProjects|canonicalProjectCount/);
  assert.doesNotMatch(registry, /decisions:\s*project\.decisions|results:\s*project\.results|metrics:\s*project\.metrics/);
  assert.doesNotMatch(portfolio, /five public projects|exactly five CV projects|value:\s*"5"/i);
  assert.doesNotMatch(validator, /const canonicalSlugs\s*=\s*\[\s*["']/);
  assert.match(validator, /const canonicalSlugs\s*=\s*\[\.\.\.CANONICAL_PROJECT_SLUGS\]/);
});

test("dead legacy universe code stays out of the production graph", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const nextConfig = readFileSync("next.config.ts", "utf8");
  const validator = readFileSync("scripts/validate-content.mjs", "utf8");

  assert.doesNotMatch(home, /Universe|UniverseArcade|from ["']motion/);
  assert.doesNotMatch(nextConfig, /["']motion["']/);
  assert.doesNotMatch(validator, /Universe\.tsx/);
});
