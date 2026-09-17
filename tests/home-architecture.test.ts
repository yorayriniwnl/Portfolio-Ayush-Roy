import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("homepage keeps static content on the server and isolates the heavy hero scene", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const island = readFileSync("src/components/HeroSceneIsland.tsx", "utf8");

  assert.doesNotMatch(home, /^\s*["']use client["']/m);
  assert.doesNotMatch(home, /from ["']\.\/HeroScene["']/);
  assert.match(home, /HeroSceneIsland/);
  assert.match(island, /^["']use client["']/m);
  assert.match(island, /dynamic\(/);
  assert.match(island, /ssr:\s*false/);
});

test("unfinished game and video concepts live in the lab, not the recruiter homepage", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  const lab = readFileSync("src/components/Lab.tsx", "utf8");
  const nav = readFileSync("src/components/SiteNav.tsx", "utf8");

  assert.doesNotMatch(home, /gameRooms|videoWall|ROOM CONCEPT|FEED SLOT \/ READY/);
  assert.match(home, /href="\/lab"/);
  assert.match(lab, /gameRooms/);
  assert.match(lab, /videoWall/);
  assert.match(nav, /\["Lab", "\/lab"\]/);
});
