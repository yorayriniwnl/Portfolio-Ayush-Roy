import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as qa from "../scripts/cdp-qa-lib.mjs";

const runner = readFileSync("scripts/browser-qa.mjs", "utf8");
const matches = (source: string, pattern: RegExp, message: string) => assert.equal(pattern.test(source), true, message);
const excludes = (source: string, pattern: RegExp, message: string) => assert.equal(pattern.test(source), false, message);

test("browser audit covers the approved ten viewport sizes and eight recruiter routes", () => {
  assert.equal(Array.isArray(qa.QA_VIEWPORTS), true, "viewport contract is not exported");
  assert.deepEqual(
    qa.QA_VIEWPORTS.map(({ width, height }) => [width, height]),
    [
      [375, 812],
      [390, 844],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1280, 720],
      [1440, 900],
      [1728, 1117],
      [1920, 1080],
      [2560, 1440],
    ],
  );
  assert.deepEqual(qa.QA_CORE_ROUTES.map(({ path }) => path), [
    "/",
    "/projects",
    "/projects/candidatex",
    "/projects/zenith",
    "/projects/helios",
    "/projects/ai-vs-real",
    "/projects/talks",
    "/projects/portfolio",
  ]);
});

test("clipping probe checks headings, essential copy, viewport edges, and clipping ancestors", () => {
  assert.equal(typeof qa.CLIPPING_PROBE_EXPRESSION, "string", "clipping probe is not exported");
  matches(qa.CLIPPING_PROBE_EXPRESSION, /h1[\s\S]*data-essential-copy/, "clipping probe omits essential selectors");
  matches(qa.CLIPPING_PROBE_EXPRESSION, /getClientRects/, "clipping probe omits per-line text rectangles");
  matches(qa.CLIPPING_PROBE_EXPRESSION, /heading-line-outside-box/, "clipping probe does not compare primary text against its own box");
  excludes(qa.CLIPPING_PROBE_EXPRESSION, /heading-self-overflow/, "clipping probe relies on child-inclusive scrollWidth as a clipping signal");
  matches(qa.CLIPPING_PROBE_EXPRESSION, /overflowX/, "clipping probe omits horizontal clipping ancestors");
  matches(qa.CLIPPING_PROBE_EXPRESSION, /overflowY/, "clipping probe omits vertical clipping ancestors");
  matches(runner, /CLIPPING_PROBE_EXPRESSION/, "runner does not call the clipping probe");
});

test("expected not-found route requires HTTP 404 and readable 404 content", () => {
  assert.equal(typeof qa.isExpectedNotFound, "function", "404 assertion helper is not exported");
  assert.equal(qa.isExpectedNotFound({ status: 404, body: "Page not found" }), true);
  assert.equal(qa.isExpectedNotFound({ status: 200, body: "Page not found" }), false);
  assert.equal(qa.isExpectedNotFound({ status: 404, body: "" }), false);
});

test("browser discovery checks Windows Chrome and Edge paths without Unix shell commands", () => {
  assert.equal(typeof qa.resolveChromiumPath, "function", "browser discovery helper is not exported");
  const shellCalls: string[] = [];
  const env = {
      ...process.env,
      "PROGRAMFILES(X86)": "C:\\Program Files (x86)",
      PROGRAMFILES: "C:\\Program Files",
      LOCALAPPDATA: "C:\\Users\\QA\\AppData\\Local",
  };
  const existsSync = (candidate: string | Buffer | URL) => {
    const target = String(candidate);
    return target.endsWith("Google\\Chrome\\Application\\chrome.exe") || target.endsWith("Microsoft\\Edge\\Application\\msedge.exe");
  };
  const resolved = qa.resolveChromiumPath({
    platform: "win32",
    env,
    existsSync,
    execFileSync: (command: string) => {
      shellCalls.push(command);
      throw new Error("Unix command should not run on Windows");
    },
  });
  assert.match(resolved, /chrome\.exe$/i, "Windows browser discovery should prefer installed Chrome");
  const edgeOnly = qa.resolveChromiumPath({
    platform: "win32",
    env,
    existsSync: (candidate: string | Buffer | URL) => String(candidate).endsWith("Microsoft\\Edge\\Application\\msedge.exe"),
    execFileSync: (command: string) => {
      shellCalls.push(command);
      throw new Error("Unix command should not run on Windows");
    },
  });
  assert.match(edgeOnly, /msedge\.exe$/i);
  assert.deepEqual(shellCalls, []);
});

test("gallery audit scrolls lazy evidence into view and waits for image decode", async () => {
  assert.equal(typeof qa.decodeGalleryImages, "function", "gallery decode helper is not exported");
  let expression = "";
  const result = await qa.decodeGalleryImages({
    evaluate: async (script: string) => {
      expression = script;
      return [{ src: "/media/evidence.webp", complete: true, decoded: true, naturalWidth: 1200 }];
    },
  });
  assert.match(expression, /scrollIntoView/);
  assert.match(expression, /\.decode\(\)/);
  assert.deepEqual(result, [{ src: "/media/evidence.webp", complete: true, decoded: true, naturalWidth: 1200 }]);
});

test("review screenshots have the six required stable names", () => {
  assert.deepEqual(qa.REVIEW_SCREENSHOT_NAMES, [
    "desktop-hero",
    "desktop-project-world",
    "desktop-case-study",
    "mobile-hero",
    "mobile-project-world",
    "contact-finale",
  ]);
  matches(runner, /async function positionProjectWorldForCapture[\s\S]*?window\.scrollTo/, "world captures do not have a stable card framing helper");
  assert.equal((runner.match(/await positionProjectWorldForCapture\(\)/g) ?? []).length, 2, "desktop and mobile world captures must both frame a project card");
  matches(runner, /await capture\(cdp, outputDir, "mobile-project-world"\)[\s\S]*await setViewport\(cdp, 1440, 900\)[\s\S]*await capture\(cdp, outputDir, "contact-finale"\)/, "contact finale is not captured at the desktop review viewport");
});

test("production runner starts next start, writes measurements, and uses shared contracts", () => {
  matches(runner, /nextCli\s*=\s*path\.join\(root,[\s\S]*"next"[\s\S]*"dist"[\s\S]*"bin"[\s\S]*"next"/, "runner does not use the installed Next production CLI");
  matches(runner, /spawn\(process\.execPath,[\s\S]*nextCli,[\s\S]*["']start["']/, "runner does not start Next in production mode");
  excludes(runner, /npm\s+run\s+dev/, "runner still starts the development server");
  matches(runner, /QA_VIEWPORTS/, "runner does not use the shared viewport contract");
  matches(runner, /QA_CORE_ROUTES/, "runner does not use the shared route contract");
  matches(runner, /performance|measurements/i, "runner does not record performance measurements");
  matches(runner, /report\.json/, "runner does not write its audit report");
  matches(runner, /REVIEW_SCREENSHOT_NAMES/, "runner does not use stable review screenshot names");
  matches(runner, /PERFORMANCE_OBSERVER_INSTALL};/, "browser bootstrap does not terminate the observer expression before the next IIFE");
  matches(runner, /nativeVirtualKeyCode/, "keyboard audit does not send native browser key codes");
  matches(runner, /Target\.createTarget[\s\S]*Target\.activateTarget/, "visibility check does not move between real browser tabs");
  matches(runner, /Boolean\(document\.querySelector/, "browser wait does not return a DOM node to by-value serialization");
  const touchAudit = runner.slice(runner.indexOf("const touchTarget"), runner.indexOf("assert(touchTarget"));
  matches(touchAudit, /scrollIntoView/, "touch audit injects a tap before bringing its target into the viewport");
});

test("essential copy markers cover each retained content surface", () => {
  for (const file of [
    "src/components/experience/MachineHero.tsx",
    "src/components/ProjectIndex.tsx",
    "src/components/CaseStudy.tsx",
    "src/app/resume/page.tsx",
    "src/components/Lab.tsx",
  ]) {
    assert.match(readFileSync(file, "utf8"), /data-essential-copy/, `${file} has no clipping-audit content marker`);
  }
});

test("mobile machine typography and project-index proof have deliberate spacing", () => {
  const css = readFileSync("src/styles/machine.css", "utf8");
  matches(css, /@media\s*\(max-width:\s*430px\)[\s\S]*?\.machine-hero__statement\s*\{[^}]*line-height:\s*1(?:\.0[2-9]|\.[1-9]\d*)/, "mobile hero statement keeps the compressed desktop line height");
  matches(css, /\.projects-index\s*\{[^}]*padding-top:\s*clamp\(/, "project index does not clear the fixed navigation");
  matches(css, /\.projects-index-proof\s*\{[^}]*display:\s*(?:grid|flex)[^}]*gap:/, "project proof facts have no separation between items");
  matches(css, /@media\s*\(max-width:\s*1280px\)[\s\S]*?\.projects-index-heading\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/, "project-index heading remains in a narrow two-column layout at tablet widths");
});

test("package exposes a focused browser-audit contract test command", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
  assert.equal(packageJson.scripts["test:browser-qa-contract"], "node --import tsx --test tests/browser-qa-contract.test.ts");
});
