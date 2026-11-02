import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("social preview represents engineering work and matches the mineral-glass identity", () => {
  const card = readFileSync("src/app/opengraph-image.tsx", "utf8");
  const metadata = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(card, /width: 1200, height: 630/);
  assert.match(card, /Code with/);
  assert.match(card, /character\./);
  assert.match(card, /#090f17/);
  assert.match(card, /#a4dfd2/);
  assert.match(card, /Backend and Full-Stack Engineer/);
  assert.doesNotMatch(card, /Full Stack Developer\./);
  assert.match(metadata, /engineering portfolio with evidence-backed software projects/);
});
