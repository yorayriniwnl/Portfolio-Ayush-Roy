import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const requiredAssets = [
  "hero.svg",
  "architecture.svg",
  "evidence-graph.svg",
  "recruiter-dossier.svg",
  "research-boundary.svg",
] as const;

test("CandidateX owns a bespoke technical visual set", () => {
  const candidate = readFileSync("src/content/candidatex.ts", "utf8");
  assert.match(candidate, /\/media\/github\/candidatex\/hero\.svg/);
  assert.doesNotMatch(candidate, /art:\s*"\/media\/hero-studio\.svg"/);
  for (const file of requiredAssets) {
    assert.equal(existsSync(`public/media/github/candidatex/${file}`), true, file);
    assert.match(candidate, new RegExp(file.replace(".", "\\.")));
  }
});

test("CandidateX research visual keeps the two synthetic experiment scopes separate", () => {
  const research = readFileSync("public/media/github/candidatex/research-boundary.svg", "utf8");
  assert.match(research, /28,800/);
  assert.match(research, /4,800/);
  assert.match(research, /SYNTHETIC/i);
  assert.match(research, /NOT REAL-WORLD/i);
});
