import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("content validator encodes the canonical six-project boundary", () => {
  const source = readFileSync("scripts/validate-content.mjs", "utf8");
  assert.match(source, /portfolio.*helios.*zenith.*ai-vs-real.*talks.*candidatex/s);
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
  assert.match(packageJson, /validate.*npm run test/s);
  assert.match(workflow, /npm run test/);
  assert.match(workflow, /NEXT_PUBLIC_SITE_URL:\s*https:\/\/portfolio\.example\.test/);
});
