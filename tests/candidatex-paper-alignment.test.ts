import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("CandidateX portfolio copy separates paper benchmark and supplementary ablation", () => {
  const candidate = readFileSync("src/content/candidatex.ts", "utf8");
  const claims = readFileSync("src/content/claims.ts", "utf8");

  assert.match(candidate, /28,800/);
  assert.match(candidate, /4,800/);
  assert.match(candidate, /supplementary implementation ablation/i);
  assert.match(candidate, /(?:not|neither).*real-world hiring|real-world hiring validity/i);

  assert.match(claims, /28,800/);
  assert.match(claims, /candidate-role evaluations/i);
});
