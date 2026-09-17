import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("root metadata leads with the engineer identity while retaining YOR", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.match(layout, /Ayush Roy \| Product & Full-Stack Engineer/);
  assert.match(layout, /YOR/);
  assert.match(layout, /realtime/i);
  assert.doesNotMatch(layout, /play chess and arcade games/i);
});

test("security headers include a restrictive content security policy", () => {
  const config = readFileSync("next.config.ts", "utf8");
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /default-src 'self'/);
  assert.match(config, /object-src 'none'/);
  assert.match(config, /frame-ancestors 'self'/);
  assert.match(config, /www\.yorayriniwnl\.in/);
  assert.match(config, /https:\/\/yorayriniwnl\.in/);
});
