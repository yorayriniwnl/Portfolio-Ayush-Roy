import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("favicon.ico compatibility route prevents browser 404s", () => {
  const route = readFileSync("src/app/favicon.ico/route.ts", "utf8");
  const favicon = readFileSync("public/favicon.svg", "utf8");
  assert.match(route, /export function GET/);
  assert.match(route, /Response\.redirect/);
  assert.match(route, /\/favicon\.svg/);
  assert.match(route, /308/);
  assert.match(favicon, /<svg/);
});
