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
  assert.match(card, /Building systems/);
  assert.match(card, /Making them matter/);
  assert.match(card, /Backend and Full-Stack Engineer/);
  assert.doesNotMatch(card, /Full Stack Developer/);
});

test("homepage work list is plain, crawlable links rather than a carousel", () => {
  const home = readFileSync("src/components/Home.tsx", "utf8");
  assert.doesNotMatch(home, /aria-roledescription="carousel"|onTouchStart|useState/);
  assert.match(home, /href=\{`\/projects\/\$\{project\.slug\}`\}/);
  assert.match(home, /<Link className="home-text-link" href="\/projects">All six case studies<\/Link>/);
});

test("homepage uses the public email from profile data and respects reduced motion", () => {
  const page = readFileSync("src/components/Home.tsx", "utf8");
  const css = readFileSync("src/styles/home.css", "utf8");
  assert.match(page, /mailto:\$\{profile\.email\}/);
  assert.doesNotMatch(page, /mailto:ayushroy\.dev@gmail\.com/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
