import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("editorial social preview is a generated PNG matching the homepage instead of the old studio asset", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  const card = readFileSync("src/app/opengraph-image.tsx", "utf8");
  assert.match(layout, /url: "\/opengraph-image"/);
  assert.match(layout, /images: \["\/opengraph-image"\]/);
  assert.doesNotMatch(layout, /hero-studio\.svg/);
  assert.match(card, /ImageResponse/);
  assert.match(card, /contentType = "image\/png"/);
  assert.match(card, /width: 1200, height: 630/);
  assert.match(card, /Full Stack/);
  assert.match(card, /Developer\./);
});

test("project showcase supports deliberate mobile swipes while preserving keyboard and touch navigation", () => {
  const component = readFileSync("src/components/experience/EditorialInteractive.tsx", "utf8");
  const css = readFileSync("src/styles/editorial.css", "utf8");
  assert.match(component, /onTouchStart=\{onSwipeStart\}/);
  assert.match(component, /onTouchEnd=\{onSwipeEnd\}/);
  assert.match(component, /onTouchCancel=/);
  assert.match(component, /Math\.abs\(dx\) >= 65/);
  assert.match(component, /Math\.abs\(dx\) > Math\.abs\(dy\) \* 1\.35/);
  assert.match(component, /ArrowRight/);
  assert.match(component, /ArrowLeft/);
  assert.match(css, /\.editorial-projects__stage \{ touch-action: pan-y/);
  assert.match(css, /\.editorial-projects__dots button \{[^}]*width: 44px; height: 44px;/);
});

test("editorial polish respects reduced motion and uses the public email from profile data", () => {
  const page = readFileSync("src/components/experience/EditorialHome.tsx", "utf8");
  const css = readFileSync("src/styles/editorial.css", "utf8");
  assert.match(page, /mailto:\$\{profile\.email\}/);
  assert.doesNotMatch(page, /mailto:ayushroy\.dev@gmail\.com/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(css, /animation-timeline: view\(\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
