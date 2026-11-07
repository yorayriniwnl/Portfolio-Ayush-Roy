import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("social preview represents engineering work and matches the Obsidian Pearl identity", () => {
  const card = readFileSync("src/app/opengraph-image.tsx", "utf8");
  const metadata = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(card, /width: 1200, height: 630/);
  assert.match(card, /Code with/);
  assert.match(card, /character\./);
  assert.match(card, /#09090D/i);
  assert.match(card, /#BBA4D9/i);
  assert.doesNotMatch(card, /#(?:090f17|a4dfd2|c7eaa4|9ab0ff)/i);
  assert.match(card, /Backend and Full-Stack Engineer/);
  assert.doesNotMatch(card, /Full Stack Developer\./);
  assert.match(metadata, /engineering portfolio with evidence-backed software projects/);
});
