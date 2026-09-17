import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  CdpClient, accessibilityHealth, assert, capture, delay, findPageDebugger,
  freePort, navigate, pageHealth, setViewport, waitForHttp,
} from "./cdp-qa-lib.mjs";

const root = process.cwd();
const outputDir = path.join(root, "artifacts", "browser-qa");
fs.mkdirSync(outputDir, { recursive: true });

const viewports = [
  [1440, 900, "1440"],
  [1366, 768, "1366"],
  [768, 1024, "768"],
  [390, 844, "390"],
  [360, 800, "360"],
  [320, 568, "320"],
];

const appPort = await freePort();
const chromePort = await freePort();
const baseUrl = `http://127.0.0.1:${appPort}`;
function resolveChromiumPath() {
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  for (const command of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    try {
      const resolved = execFileSync("which", [command], { encoding: "utf8" }).trim();
      if (resolved) return resolved;
    } catch {}
  }
  throw new Error("No Chromium-compatible browser found. Set CHROMIUM_PATH to run browser QA.");
}

const chromiumPath = resolveChromiumPath();
const chromeProfile = fs.mkdtempSync(path.join(os.tmpdir(), "yor-browser-qa-"));

let app;
let chrome;
let cdp;
const browserErrors = [];

try {
  app = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(appPort)], {
    cwd: root,
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
    stdio: "ignore",
  });
  const homeResponse = await waitForHttp(baseUrl);
  const csp = homeResponse.headers.get("content-security-policy") || "";
  assert(csp.includes("default-src 'self'"), "CSP header is missing the default self boundary");
  assert(csp.includes("object-src 'none'"), "CSP header is missing object-src none");

  chrome = spawn(chromiumPath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${chromeProfile}`,
    "about:blank",
  ], { stdio: "ignore" });

  const debuggerUrl = await findPageDebugger(chromePort);
  cdp = new CdpClient(debuggerUrl);
  await cdp.connect();
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Log.enable")]);

  cdp.on("Runtime.exceptionThrown", (params) => browserErrors.push(`exception: ${params.exceptionDetails?.text ?? "unknown"}`));
  cdp.on("Log.entryAdded", (params) => {
    if (params.entry?.level === "error") browserErrors.push(`log: ${params.entry.text}`);
  });
  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") browserErrors.push("console.error called");
  });

  for (const [width, height, label] of viewports) {
    await setViewport(cdp, width, height);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await navigate(cdp, baseUrl);
    const health = await pageHealth(cdp);
    assert(health.h1.includes("Ayush Roy"), `${label}: homepage identity missing`);
    assert(health.scrollWidth <= health.width + 1, `${label}: homepage horizontal overflow ${health.scrollWidth} > ${health.width}`);
    assert(!health.bodyText.includes("NEON SNAKE"), `${label}: lab placeholder leaked into recruiter homepage`);
    await capture(cdp, outputDir, `home-${label}`);
  }

  await setViewport(cdp, 1440, 900);
  await navigate(cdp, baseUrl);
  await accessibilityHealth(cdp, "/");

  await setViewport(cdp, 390, 844);
  await navigate(cdp, baseUrl);
  const firstTab = await cdp.evaluate(`document.activeElement?.blur(); true`);
  void firstTab;
  await cdp.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const focusedClass = await cdp.evaluate(`document.activeElement?.className || ''`);
  assert(String(focusedClass).includes("skip"), "Keyboard traversal does not start at the skip link");

  await cdp.evaluate(`document.querySelector('button[aria-controls="mobile-nav"]')?.click()`);
  await delay(100);
  assert(await cdp.evaluate(`document.querySelector('#mobile-nav')?.getAttribute('data-open') === 'true'`), "Mobile menu did not open");
  await cdp.evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await delay(100);
  assert(await cdp.evaluate(`document.querySelector('#mobile-nav')?.getAttribute('data-open') === 'false'`), "Escape did not close mobile menu");

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate(cdp, baseUrl);
  await delay(1000);
  const reducedState = await cdp.evaluate(`({ status: document.querySelector('.hub-hero-scene .scene-status')?.textContent || '', canvases: document.querySelectorAll('.hub-hero-scene canvas').length })`);
  assert(/reduced motion/i.test(reducedState.status), `Reduced-motion status missing: ${reducedState.status}`);
  assert(reducedState.canvases === 0, "Reduced-motion path should not initialize the Three.js canvas");

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  const routeChecks = [
    ["/projects", "Projects", (body) => (body.match(/Case study/g) ?? []).length >= 6],
    ["/projects/candidatex", "CandidateX", (body) => body.includes("28,800") && body.includes("4,800")],
    ["/resume", "Ayush Roy", (body) => body.includes("Open PDF")],
    ["/lab", "Play without", (body) => body.includes("ROOM CONCEPT")],
  ];

  for (const [route, h1Needle, bodyCheck] of routeChecks) {
    for (const [width, height, label] of [[1440, 900, "desktop"], [390, 844, "mobile"]]) {
      await setViewport(cdp, width, height);
      await navigate(cdp, `${baseUrl}${route}`);
      const health = await pageHealth(cdp);
      assert(health.h1.includes(h1Needle), `${route} ${label}: unexpected h1 ${health.h1}`);
      assert(health.scrollWidth <= health.width + 1, `${route} ${label}: horizontal overflow`);
      assert(bodyCheck(health.bodyText), `${route} ${label}: required content missing`);
      if (label === "desktop") await accessibilityHealth(cdp, route);
      await capture(cdp, outputDir, `${route.replaceAll("/", "-").replace(/^-/, "") || "home"}-${label}`);
    }
  }

  await setViewport(cdp, 390, 844);
  await navigate(cdp, `${baseUrl}/projects/candidatex`);
  const candidateMedia = await cdp.evaluate(`document.querySelectorAll('img[src*="/candidatex/"]').length`);
  assert(candidateMedia >= 4, `CandidateX gallery expected >=4 bespoke images, found ${candidateMedia}`);
  assert(await cdp.evaluate(`Boolean(document.querySelector('a[href="/projects/candidatex/live"]'))`), "CandidateX verified demo live CTA missing");

  await navigate(cdp, `${baseUrl}/this-route-does-not-exist`);
  const notFoundText = await cdp.evaluate(`document.body.innerText`);
  assert(/not found|404/i.test(notFoundText), "Custom 404 path is not understandable");

  const meaningfulErrors = browserErrors.filter((message) => !/favicon/i.test(message));
  assert(meaningfulErrors.length === 0, `Browser errors detected:\n${meaningfulErrors.join("\n")}`);

  fs.writeFileSync(path.join(outputDir, "report.json"), JSON.stringify({
    baseUrl,
    viewports: viewports.map(([width, height, label]) => ({ width, height, label })),
    screenshots: fs.readdirSync(outputDir).filter((file) => file.endsWith(".png")).sort(),
    browserErrors: meaningfulErrors,
    status: "passed",
  }, null, 2));

  console.log(`browser QA: passed · screenshots in ${path.relative(root, outputDir)}`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  cdp?.close();
  if (chrome && !chrome.killed) chrome.kill("SIGTERM");
  if (app && !app.killed) app.kill("SIGTERM");
  fs.rmSync(chromeProfile, { recursive: true, force: true });
}
