import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("signature styles apply to every route without replacing the canonical content graph", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const tokens = readFileSync("src/styles/tokens.css", "utf8");
  const signature = readFileSync("src/styles/signature.css", "utf8");
  assert.match(css, /@import "\.\.\/styles\/signature\.css"/);
  assert.match(tokens, /--metal-warm:/);
  for (const selector of [".projects-index", ".case-hero", ".resume-page", ".lab-page", ".yor-state"]) {
    assert.ok(signature.includes(selector), `Missing shared identity treatment for ${selector}`);
  }
});

test("route loading and recovery remain accessible and do not disclose stack details", () => {
  const loading = readFileSync("src/app/loading.tsx", "utf8");
  const error = readFileSync("src/app/error.tsx", "utf8");
  const css = readFileSync("src/styles/signature.css", "utf8");
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /role="status"/);
  assert.doesNotMatch(loading, /<main\b|<h1\b/);
  assert.match(error, /"use client"/);
  assert.match(error, /role="alert"/);
  assert.match(error, /onClick=\{reset\}/);
  assert.match(error, /href="\/"|href='\/'/);
  assert.doesNotMatch(error, /\{error\.message\}|\{error\.stack\}/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("the engineering sculpture is intentionally a light interactive SVG", () => {
  const scene = readFileSync("src/components/YorArtifact.tsx", "utf8");
  assert.match(scene, /<svg/);
  assert.match(scene, /yor-artifact__module--a/);
  assert.match(scene, /yor-artifact__module--b/);
  assert.match(scene, /yor-artifact__module--c/);
  assert.doesNotMatch(scene, /yor-artifact__orbit|<ellipse/);
  assert.match(scene, /onPointerMove=\{move\}/);
  assert.match(scene, /onPointerLeave=\{reset\}/);
  assert.match(scene, /aria-pressed=\{active === index\}/);
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /disabled=\{reducedMotion\}/);
  assert.match(scene, /data-reduced-motion=\{reducedMotion\}/);
  assert.match(scene, /Sculpture motion disabled by reduced-motion preference/);
  assert.match(scene, /new IntersectionObserver/);
  assert.match(scene, /observer\.disconnect\(\)/);
  assert.doesNotMatch(scene, /requestAnimationFrame|THREE|WebGLRenderer|new Audio/);
});

test("project source artwork remains fully visible and not covered by duplicate titles", () => {
  const styles = readFileSync("src/styles/signature.css", "utf8");
  const home = readFileSync("src/components/Home.tsx", "utf8");
  assert.match(styles, /\.project-world__art,\s*\.home-project__visual\s*\{[^}]*background-size: contain/s);
  assert.doesNotMatch(home, /className="home-project__art-title"/);
});
