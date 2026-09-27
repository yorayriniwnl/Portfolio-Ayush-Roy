import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CdpClient,
  CLIPPING_PROBE_EXPRESSION,
  PERFORMANCE_METRICS_EXPRESSION,
  PERFORMANCE_OBSERVER_INSTALL,
  QA_CORE_ROUTES,
  QA_LEGACY_ROUTES,
  QA_PROJECT_SLUGS,
  QA_RESOLVER_ROUTES,
  QA_SECONDARY_ROUTES,
  QA_VIEWPORTS,
  REVIEW_SCREENSHOT_NAMES,
  accessibilityHealth,
  assert,
  capture,
  decodeGalleryImages,
  delay,
  findPageDebugger,
  freePort,
  isExpectedNotFound,
  navigate,
  pageHealth,
  resolveChromiumPath,
  setViewport,
  waitForCondition,
  waitForHttp,
} from "./cdp-qa-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "artifacts", "browser-qa");
const reportPath = path.join(outputDir, "report.json");
const buildIdPath = path.join(root, ".next", "BUILD_ID");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
fs.mkdirSync(outputDir, { recursive: true });

const report = {
  status: "running",
  startedAt: new Date().toISOString(),
  production: { command: [process.execPath, nextCli, "start"], buildId: null },
  browser: { path: null, version: null },
  viewports: QA_VIEWPORTS,
  routeMatrix: { checked: 0, routes: [], clippingIssues: [] },
  routeResponses: { resolvers: [], legacy: [], expected404: [] },
  accessibility: [],
  interaction: {},
  rendering: {},
  galleries: [],
  performance: {
    samples: [],
    notes: [],
    targets: {
      desktopFramesPerSecond: { target: 60, measured: false, reason: "No representative physical-display cadence measurement was made in this headless browser." },
      lcpAndLayoutShift: "The approved spec does not define numeric pass thresholds; report observed values only.",
    },
  },
  requiredScreenshots: REVIEW_SCREENSHOT_NAMES.map((name) => `artifacts/browser-qa/${name}.png`),
  screenshots: [],
  environmentWarnings: [],
  browserErrors: [],
  failures: [],
};

const appPort = await freePort();
const chromePort = await freePort();
const baseUrl = `http://127.0.0.1:${appPort}`;
const chromeProfile = fs.mkdtempSync(path.join(os.tmpdir(), "yor-machine-browser-qa-"));
let app;
let chrome;
let cdp;
let browserCdp;
let primaryTargetId;
let backgroundTargetId;
let activeScenario = "startup";
let appOutput = "";
const browserErrors = [];
const requestUrls = new Map();

function isBrowserExtensionNoise(value) {
  return /gc\.kis\.v2(?:\.scr)?\.kaspersky-labs\.com|(?:chrome|edge)-extension:\/\//i.test(String(value ?? ""));
}

function addError(message) {
  browserErrors.push({ scenario: activeScenario, message: String(message).slice(0, 600) });
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function recordFailure(error) {
  const failure = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
  report.failures.push(failure.slice(0, 6000));
  report.status = "failed";
  console.error(error);
  process.exitCode = 1;
}

async function fetchManual(routePath) {
  return fetch(new URL(routePath, baseUrl), { redirect: "manual", cache: "no-store" });
}

function assertSameOriginLocation(location, routePath) {
  assert(Boolean(location), `${routePath}: expected a redirect Location header`);
  const destination = new URL(location, baseUrl);
  assert(destination.origin === baseUrl, `${routePath}: attempted external navigation to ${destination.origin}`);
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

async function clickAtSelector(selector) {
  const rect = await cdp.evaluate(`(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width, height: rect.height };
  })()`);
  assert(rect && rect.width > 0 && rect.height > 0, `Cannot click missing or hidden element: ${selector}`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
}

async function positionProjectWorldForCapture() {
  const positioned = await cdp.evaluate(`(() => {
    const card = document.querySelector('.project-world');
    if (!card) return false;
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 76;
    const top = Math.max(0, window.scrollY + card.getBoundingClientRect().top - headerHeight);
    window.scrollTo({ top, left: 0, behavior: 'instant' });
    return true;
  })()`);
  assert(positioned, "Project index has no project world to frame for review");
  await delay(220);
}

async function pressKey(key, code, windowsVirtualKeyCode) {
  const nativeVirtualKeyCode = windowsVirtualKeyCode;
  const keyText = key === "Enter" ? "\r" : key === " " ? " " : "";
  const event = { key, code, windowsVirtualKeyCode, nativeVirtualKeyCode };
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", ...event, ...(keyText ? { text: keyText, unmodifiedText: keyText } : {}) });
  if (key.length === 1 && key !== " ") await cdp.send("Input.dispatchKeyEvent", { type: "char", text: key, ...event });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

function killTree(child) {
  if (!child?.pid) return;
  try {
    child.kill("SIGTERM");
  } catch {}
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", timeout: 8000 });
    } catch {}
  }
}

const browserBootstrap = `${PERFORMANCE_OBSERVER_INSTALL};
(() => {
  const originalRaf = window.requestAnimationFrame.bind(window);
  window.__qaRafCalls = 0;
  window.requestAnimationFrame = (callback) => {
    window.__qaRafCalls += 1;
    return originalRaf(callback);
  };
  window.__qaShaderCompile = { count: 0, invocationMs: 0 };
  const proto = window.WebGL2RenderingContext?.prototype;
  if (proto?.compileShader) {
    const originalCompileShader = proto.compileShader;
    proto.compileShader = function(shader) {
      const started = performance.now();
      try { return originalCompileShader.call(this, shader); }
      finally {
        window.__qaShaderCompile.count += 1;
        window.__qaShaderCompile.invocationMs += performance.now() - started;
      }
    };
  }
})();`;

try {
  assert(fs.existsSync(buildIdPath), "Production build missing. Run the production build before browser QA.");
  assert(fs.existsSync(nextCli), `Next production CLI not found at ${nextCli}`);
  report.production.buildId = fs.readFileSync(buildIdPath, "utf8").trim();
  const chromiumPath = resolveChromiumPath();
  report.browser.path = chromiumPath;

  app = spawn(process.execPath, [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(appPort)], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout?.on("data", (chunk) => { appOutput = (appOutput + String(chunk)).slice(-8000); });
  app.stderr?.on("data", (chunk) => { appOutput = (appOutput + String(chunk)).slice(-8000); });
  app.once("error", (error) => addError(`production server spawn error: ${error.message}`));

  const homeResponse = await waitForHttp(baseUrl);
  assert(homeResponse.status === 200, `Production homepage returned HTTP ${homeResponse.status}`);
  const csp = homeResponse.headers.get("content-security-policy") || "";
  assert(csp.includes("default-src 'self'"), "CSP header is missing the default self boundary");
  assert(csp.includes("object-src 'none'"), "CSP header is missing object-src none");
  report.production.headers = {
    contentSecurityPolicy: csp,
    strictTransportSecurity: homeResponse.headers.get("strict-transport-security"),
    xContentTypeOptions: homeResponse.headers.get("x-content-type-options"),
  };

  const favicon = await fetchManual("/favicon.svg");
  const faviconBody = await favicon.text();
  assert(favicon.status === 200, `/favicon.svg returned HTTP ${favicon.status}`);
  assert((favicon.headers.get("content-type") || "").includes("image/svg+xml"), "/favicon.svg has an unexpected content type");
  assert(/<svg\b/i.test(faviconBody), "/favicon.svg does not contain an SVG document");
  report.production.favicon = { status: favicon.status, contentType: favicon.headers.get("content-type") };

  chrome = spawn(chromiumPath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${chromeProfile}`,
    "about:blank",
  ], { stdio: "ignore" });
  chrome.once("error", (error) => addError(`Chromium spawn error: ${error.message}`));

  const debuggerUrl = await findPageDebugger(chromePort);
  const [targets, browserEndpoint] = await Promise.all([
    fetch(`http://127.0.0.1:${chromePort}/json/list`).then((response) => response.json()),
    fetch(`http://127.0.0.1:${chromePort}/json/version`).then((response) => response.json()),
  ]);
  primaryTargetId = targets.find((target) => target.webSocketDebuggerUrl === debuggerUrl)?.id;
  assert(primaryTargetId, "Unable to identify the primary browser tab for visibility tests");
  cdp = new CdpClient(debuggerUrl);
  await cdp.connect();
  browserCdp = new CdpClient(browserEndpoint.webSocketDebuggerUrl);
  await browserCdp.connect();
  await Promise.all([
    cdp.send("Page.enable"),
    cdp.send("Runtime.enable"),
    cdp.send("Log.enable"),
    cdp.send("Network.enable"),
    cdp.send("Accessibility.enable"),
    cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: browserBootstrap }),
  ]);
  const browserVersion = await browserCdp.send("Browser.getVersion");
  report.browser.version = `${browserVersion.product} / ${browserVersion.revision}`;
  cdp.on("Runtime.exceptionThrown", (params) => {
    const details = params.exceptionDetails;
    const sourceUrl = details?.url ?? "";
    const description = details?.exception?.description ?? "";
    const message = `exception: ${details?.text ?? "unknown"} ${description} ${sourceUrl}`;
    if (isBrowserExtensionNoise(`${message} ${sourceUrl}`)) report.environmentWarnings.push(message);
    else addError(message);
  });
  cdp.on("Log.entryAdded", (params) => {
    if (params.entry?.level === "error") {
      const entry = params.entry;
      const message = `console log: ${entry.text}`;
      if (isBrowserExtensionNoise(`${entry.text} ${entry.url ?? ""}`)) report.environmentWarnings.push(message);
      else addError(message);
    }
  });
  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") {
      const message = params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ") || "console.error called";
      const source = params.stackTrace?.callFrames?.[0]?.url ?? "";
      if (isBrowserExtensionNoise(`${message} ${source}`)) report.environmentWarnings.push(`console.error: ${message}`);
      else addError(`console.error: ${message}`);
    }
  });
  cdp.on("Network.requestWillBeSent", (params) => requestUrls.set(params.requestId, params.request?.url ?? ""));
  cdp.on("Network.loadingFailed", (params) => {
    const requestUrl = requestUrls.get(params.requestId) ?? "";
    requestUrls.delete(params.requestId);
    if (isBrowserExtensionNoise(requestUrl)) {
      report.environmentWarnings.push(`external browser injection failed: ${requestUrl}`);
      return;
    }
    if (params.canceled || params.errorText === "net::ERR_ABORTED") return;
    addError(`network ${params.errorText ?? params.blockedReason ?? "failed"}: ${requestUrl || JSON.stringify(params)}`);
  });
  cdp.on("Network.responseReceived", (params) => {
    if (params.response?.status >= 400) {
      const url = new URL(params.response.url);
      if (url.origin === baseUrl) addError(`HTTP ${params.response.status}: ${url.pathname}`);
    }
  });

  activeScenario = "production route response matrix";
  for (const route of QA_CORE_ROUTES) {
    const response = await fetchManual(route.path);
    assert(response.status === 200, `${route.path}: production response was HTTP ${response.status}`);
    const body = await response.text();
    assert(/<h1[\s>]/i.test(body), `${route.path}: production HTML omitted its heading`);
    if (route.slug) assert(body.includes(`data-experience-project="${route.slug}"`), `${route.path}: route-specific project marker missing in HTML`);
    if (route.surface === "project-index") assert((body.match(/data-project-slug=/g) || []).length === QA_PROJECT_SLUGS.length, "/projects: expected all six canonical project records in server HTML");
    report.routeResponses[route.path] = { status: response.status, contentLength: Number(response.headers.get("content-length")) || null };
  }

  for (const route of QA_RESOLVER_ROUTES) {
    const response = await fetchManual(route.path);
    const body = await response.text();
    if (response.status === 307 || response.status === 308) {
      const location = response.headers.get("location");
      const destination = new URL(location, baseUrl);
      assert(["http:", "https:"].includes(destination.protocol), `${route.path}: resolver destination is not HTTP(S)`);
      assert(!["127.0.0.1", "localhost", "0.0.0.0"].includes(destination.hostname), `${route.path}: resolver points at a loopback address`);
      report.routeResponses.resolvers.push({ path: route.path, status: response.status, kind: "redirect", destination: `${destination.origin}${destination.pathname}` });
    } else {
      assert(response.status === 200, `${route.path}: resolver returned unexpected HTTP ${response.status}`);
      assert(/not available|deployment|blocked|pending/i.test(body), `${route.path}: unavailable resolver did not explain its state`);
      report.routeResponses.resolvers.push({ path: route.path, status: response.status, kind: "unavailable page" });
    }
  }

  for (const route of QA_LEGACY_ROUTES) {
    const response = await fetchManual(route.path);
    if (route.expectedStatus === 200) {
      const body = await response.text();
      assert(response.status === route.expectedStatus, `${route.path}: expected legacy page ${route.expectedStatus}, got ${response.status}`);
      assert(body.includes(route.requiredText), `${route.path}: expected legacy page content missing`);
      report.routeResponses.legacy.push({ path: route.path, status: response.status, kind: "legacy content" });
    } else {
      assert([307, 308].includes(response.status), `${route.path}: expected an internal redirect, got HTTP ${response.status}`);
      const location = assertSameOriginLocation(response.headers.get("location"), route.path);
      assert(location === route.expectedLocation, `${route.path}: redirected to ${location}, expected ${route.expectedLocation}`);
      report.routeResponses.legacy.push({ path: route.path, status: response.status, location });
    }
  }

  for (const routePath of ["/projects/not-a-real-project", "/work/not-a-real-project"]) {
    const response = await fetchManual(routePath);
    const body = await response.text();
    assert(isExpectedNotFound({ status: response.status, body }), `${routePath}: expected a readable HTTP 404, got ${response.status}`);
    report.routeResponses.expected404.push({ path: routePath, status: response.status, readable: true });
  }

  activeScenario = "ten viewport core route matrix";
  const matrix = [];
  for (const viewport of QA_VIEWPORTS) {
    await setViewport(cdp, viewport.width, viewport.height);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    for (const route of QA_CORE_ROUTES) {
      await navigate(cdp, `${baseUrl}${route.path}`);
      const health = await pageHealth(cdp);
      const text = normalizeText(health.h1);
      assert(health.h1Count === 1, `${route.path} ${viewport.label}: expected exactly one h1, found ${health.h1Count}`);
      assert(health.mainCount === 1, `${route.path} ${viewport.label}: expected exactly one main landmark, found ${health.mainCount}`);
      assert(text.includes(route.requiredHeading), `${route.path} ${viewport.label}: expected heading “${route.requiredHeading}”, got “${text}”`);
      assert(health.scrollWidth <= health.width + 1, `${route.path} ${viewport.label}: document overflow ${health.scrollWidth}px > ${health.width}px`);
      const clip = await cdp.evaluate(CLIPPING_PROBE_EXPRESSION);
      assert(clip.essentialCopyCount > 0, `${route.path} ${viewport.label}: no essential-copy marker reached the clipping probe`);
      report.routeMatrix.checked += 1;
      matrix.push({ path: route.path, viewport: viewport.label, h1: text, primaryHeadingMetrics: clip.headingMetrics.filter((metric) => metric.tag === "H1"), scrollWidth: health.scrollWidth, essentialCopyCount: clip.essentialCopyCount, clippingIssues: clip.issues.length });
      report.routeMatrix.clippingIssues.push(...clip.issues.map((issue) => ({ path: route.path, viewport: viewport.label, ...issue })));
      if (route.surface === "home") {
        const home = await cdp.evaluate(`({ projects: Boolean(document.querySelector('#projects')), about: Boolean(document.querySelector('#about')), contact: Boolean(document.querySelector('#contact')), favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') || '' })`);
        assert(home.projects && home.about && home.contact, `${viewport.label}: homepage narrative sections missing`);
        assert(home.favicon.includes("favicon.svg"), `${viewport.label}: document does not link /favicon.svg`);
      } else if (route.surface === "project-index") {
        const count = await cdp.evaluate(`document.querySelectorAll('[data-project-slug]').length`);
        assert(count === QA_PROJECT_SLUGS.length, `${viewport.label}: project index has ${count} records, expected six`);
      } else {
        const pageProject = await cdp.evaluate(`document.querySelector('main[data-experience-project]')?.getAttribute('data-experience-project') || ''`);
        assert(pageProject === route.slug, `${route.path} ${viewport.label}: case-study route marker is ${pageProject}`);
        const sectionCount = await cdp.evaluate(`['overview','contribution','architecture','implementation','testing','results','limitations'].filter((id) => document.querySelector('#' + id)).length`);
        assert(sectionCount === 7, `${route.path} ${viewport.label}: semantic case-study sections missing (${sectionCount}/7)`);
      }
      if (viewport.width === 1440) {
        report.accessibility.push({ path: route.path, viewport: viewport.label, ...(await accessibilityHealth(cdp, route.path)) });
      }
      if (viewport.width === 1440 && ["/", "/projects", "/projects/candidatex"].includes(route.path)) {
        await delay(1000);
        const measurement = await cdp.evaluate(PERFORMANCE_METRICS_EXPRESSION);
        report.performance.samples.push({ path: route.path, viewport: viewport.label, ...measurement });
      }
    }
  }
  report.routeMatrix.routes = matrix;
  if (report.routeMatrix.clippingIssues.length) {
    const examples = report.routeMatrix.clippingIssues.slice(0, 12).map((issue) => `${issue.path} ${issue.viewport} ${issue.kind}: ${issue.text}`).join("\n");
    throw new Error(`Heading or essential-copy clipping detected (${report.routeMatrix.clippingIssues.length} instances):\n${examples}`);
  }

  activeScenario = "secondary routes and inactive scene cleanup";
  for (const viewport of [QA_VIEWPORTS[1], QA_VIEWPORTS[6]]) {
    await setViewport(cdp, viewport.width, viewport.height);
    for (const route of QA_SECONDARY_ROUTES) {
      const response = await fetchManual(route.path);
      assert(response.status === 200, `${route.path}: HTTP ${response.status}`);
      await navigate(cdp, `${baseUrl}${route.path}`);
      const health = await pageHealth(cdp);
      assert(health.h1Count === 1 && normalizeText(health.h1).includes(route.requiredHeading), `${route.path}: secondary page heading missing`);
      assert(normalizeText(health.bodyText).toLowerCase().includes(route.requiredText.toLowerCase()), `${route.path}: required page content missing`);
      assert(health.scrollWidth <= health.width + 1, `${route.path} ${viewport.label}: document overflow`);
      assert(health.sceneLayers === 0 && health.canvases === 0, `${route.path}: inactive surface retained a scene canvas`);
      report.rendering[`${route.path}-${viewport.label}`] = { sceneLayers: health.sceneLayers, canvases: health.canvases };
    }
  }

  activeScenario = "production review screenshots";
  await setViewport(cdp, 1440, 900);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await navigate(cdp, baseUrl);
  const heroStart = Date.now();
  const heroScene = await waitForCondition(cdp, `(() => { const layer = document.querySelector('.machine-scene-layer'); return layer && (layer.dataset.sceneStatus === 'ready' || layer.dataset.sceneStatus === 'failed') ? { status: layer.dataset.sceneStatus, renderer: document.querySelector('.machine-canvas')?.dataset.renderer || null } : null; })()`, { timeoutMs: 25_000, description: "homepage scene initialization" });
  report.rendering.home = { ...heroScene.value, initializationMs: Date.now() - heroStart };
  await capture(cdp, outputDir, "desktop-hero");
  report.performance.samples.push({ path: "/", viewport: "1440x900-rendered", ...(await cdp.evaluate(PERFORMANCE_METRICS_EXPRESSION)) });

  const recordedCanvas = await cdp.evaluate(`(() => {
    const canvas = document.querySelector('.machine-canvas');
    if (!canvas) return false;
    window.__qaPersistentCanvas = canvas;
    return true;
  })()`);
  assert(recordedCanvas, "Ready homepage did not contain a Canvas instance to track across client routes");
  await clickAtSelector('a[href="/projects"]');
  await waitForCondition(cdp, `location.pathname === '/projects' && document.querySelectorAll('[data-project-slug]').length === 6`, { timeoutMs: 8000, description: "client navigation to project index with shared scene" });
  const projectCanvas = await cdp.evaluate(`(() => ({
    sameCanvas: window.__qaPersistentCanvas === document.querySelector('.machine-canvas'),
    status: document.querySelector('.machine-scene-layer')?.dataset.sceneStatus || null,
  }))()`);
  assert(projectCanvas.sameCanvas && projectCanvas.status === "ready", `Project index replaced or reset the shared Canvas: ${JSON.stringify(projectCanvas)}`);
  await positionProjectWorldForCapture();
  await capture(cdp, outputDir, "desktop-project-world");

  const candidateLink = await cdp.evaluate(`(() => {
    const link = document.querySelector('a[href="/projects/candidatex"]');
    if (!link) return false;
    link.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  })()`);
  assert(candidateLink, "Project index has no CandidateX route link for the client-navigation audit");
  await delay(120);
  await clickAtSelector('a[href="/projects/candidatex"]');
  await waitForCondition(cdp, `location.pathname === '/projects/candidatex' && Boolean(document.querySelector('[data-experience-project="candidatex"]'))`, { timeoutMs: 8000, description: "client navigation to CandidateX with shared scene" });
  const caseCanvas = await cdp.evaluate(`(() => ({
    sameCanvas: window.__qaPersistentCanvas === document.querySelector('.machine-canvas'),
    status: document.querySelector('.machine-scene-layer')?.dataset.sceneStatus || null,
  }))()`);
  assert(caseCanvas.sameCanvas && caseCanvas.status === "ready", `Case study replaced or reset the shared Canvas: ${JSON.stringify(caseCanvas)}`);
  report.interaction.sharedCanvasRoutePersistence = {
    paths: ["/", "/projects", "/projects/candidatex"],
    sameCanvasAfterEach: [projectCanvas.sameCanvas, caseCanvas.sameCanvas],
    statusAfterEach: [projectCanvas.status, caseCanvas.status],
  };
  await capture(cdp, outputDir, "desktop-case-study");

  await setViewport(cdp, 390, 844);
  await navigate(cdp, baseUrl);
  await waitForCondition(cdp, `document.querySelector('.machine-scene-layer')?.dataset.sceneStatus === 'ready' || document.querySelector('.machine-scene-layer')?.dataset.sceneStatus === 'failed'`, { timeoutMs: 25_000, description: "mobile homepage scene initialization" });
  await capture(cdp, outputDir, "mobile-hero");
  await navigate(cdp, `${baseUrl}/projects`);
  await waitForCondition(cdp, `document.querySelector('.machine-scene-layer')?.dataset.sceneStatus === 'ready' || document.querySelector('.machine-scene-layer')?.dataset.sceneStatus === 'failed'`, { timeoutMs: 25_000, description: "mobile project scene initialization" });
  await positionProjectWorldForCapture();
  await capture(cdp, outputDir, "mobile-project-world");
  await setViewport(cdp, 1440, 900);
  await navigate(cdp, baseUrl);
  await cdp.evaluate(`document.querySelector('#contact')?.scrollIntoView({ block: 'start', behavior: 'instant' }); true`);
  await delay(350);
  await capture(cdp, outputDir, "contact-finale");

  activeScenario = "keyboard and touch interactions";
  await setViewport(cdp, 390, 844);
  await navigate(cdp, baseUrl);
  await cdp.evaluate(`document.activeElement instanceof HTMLElement && document.activeElement.blur(); true`);
  await pressKey("Tab", "Tab", 9);
  const skipClass = await cdp.evaluate(`String(document.activeElement?.className || '')`);
  assert(skipClass.includes("machine-skip-link"), `First keyboard focus is not the skip link: ${skipClass}`);
  await cdp.evaluate(`document.querySelector('button[aria-controls="mobile-nav"]')?.focus(); true`);
  const menuTriggerFocused = await cdp.evaluate(`document.activeElement === document.querySelector('button[aria-controls="mobile-nav"]')`);
  assert(menuTriggerFocused, "Mobile navigation trigger could not receive keyboard focus");
  await pressKey("Enter", "Enter", 13);
  await waitForCondition(cdp, `document.querySelector('button[aria-controls="mobile-nav"]')?.getAttribute('aria-expanded') === 'true'`, { timeoutMs: 2500, description: "Enter opens the mobile menu" });
  const menuOpened = await cdp.evaluate(`({ expanded: document.querySelector('button[aria-controls="mobile-nav"]')?.getAttribute('aria-expanded'), focus: document.activeElement?.textContent?.trim() })`);
  assert(menuOpened.expanded === "true", "Keyboard Enter did not open the mobile menu");
  assert(menuOpened.focus === "Work", `Opening the menu did not focus its first link: ${menuOpened.focus}`);
  await pressKey("Escape", "Escape", 27);
  await delay(100);
  const menuClosed = await cdp.evaluate(`({ expanded: document.querySelector('button[aria-controls="mobile-nav"]')?.getAttribute('aria-expanded'), focus: document.activeElement?.getAttribute('aria-label') })`);
  assert(menuClosed.expanded === "false", "Escape did not close the mobile menu");
  assert(menuClosed.focus === "Open navigation menu", "Closing menu did not restore focus to its trigger");

  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await navigate(cdp, `${baseUrl}/projects`);
  const touchTarget = await cdp.evaluate(`(async () => {
    const node = document.querySelector('a.project-world__title-link');
    if (!node) return null;
    node.scrollIntoView({ block: 'center', behavior: 'instant' });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rect = node.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
  assert(touchTarget, "Project index has no touchable project title link");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: touchTarget.x, y: touchTarget.y, id: 1 }] });
  await delay(100);
  const touchedProject = await cdp.evaluate(`document.querySelector('a.project-world__title-link')?.getAttribute('data-project-active')`);
  assert(touchedProject === "true", "Touch selection did not activate the selected project world");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  report.interaction.keyboard = { skipLinkFirst: true, menuEnter: true, escapeDismissal: true, focusRestored: true };
  report.interaction.touch = { projectWorldSelection: true };

  activeScenario = "reduced motion and renderer behavior";
  await setViewport(cdp, 1440, 900);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate(cdp, baseUrl);
  await waitForCondition(cdp, `document.querySelector('.machine-scene-layer')?.dataset.sceneStatus === 'static' && document.querySelectorAll('.machine-canvas canvas').length === 0`, { timeoutMs: 5000, description: "reduced motion static scene" });
  const reduced = await cdp.evaluate(`({ status: document.querySelector('.machine-scene-layer')?.dataset.sceneStatus, canvases: document.querySelectorAll('.machine-canvas canvas').length, staticSvg: Boolean(document.querySelector('.machine-static svg')) })`);
  assert(reduced.staticSvg, "Reduced-motion static scene composition is missing");
  report.rendering.reducedMotion = reduced;

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  const toggleStart = Date.now();
  const toggledScene = await waitForCondition(cdp, `(() => { const layer = document.querySelector('.machine-scene-layer'); return layer && (layer.dataset.sceneStatus === 'ready' || layer.dataset.sceneStatus === 'failed') ? { status: layer.dataset.sceneStatus, renderer: document.querySelector('.machine-canvas')?.dataset.renderer || null } : null; })()`, { timeoutMs: 25_000, description: "live reduced-motion preference restoration" });
  report.rendering.livePreferenceRestore = { ...toggledScene.value, elapsedMs: Date.now() - toggleStart };

  await navigate(cdp, `${baseUrl}/?renderer=webgl`);
  const webglStart = Date.now();
  const webgl = await waitForCondition(cdp, `(() => { const layer = document.querySelector('.machine-scene-layer'); return layer && (layer.dataset.sceneStatus === 'ready' || layer.dataset.sceneStatus === 'failed') ? { status: layer.dataset.sceneStatus, renderer: document.querySelector('.machine-canvas')?.dataset.renderer || null } : null; })()`, { timeoutMs: 25_000, description: "forced WebGL renderer path" });
  assert(webgl.value.status === "ready" && webgl.value.renderer === "webgl", `WebGL 2 path failed: ${JSON.stringify(webgl.value)}`);
  const shaderStats = await cdp.evaluate(`window.__qaShaderCompile || null`);
  report.rendering.webgl = { ...webgl.value, initializationMs: Date.now() - webglStart, shaderCompile: shaderStats ? { available: shaderStats.count > 0, shaderCount: shaderStats.count, javascriptInvocationMs: Number(shaderStats.invocationMs.toFixed(2)), caveat: "Synchronous WebGL compileShader call time only; GPU completion time is not exposed." } : { available: false } };

  const rafBeforeHidden = await cdp.evaluate(`window.__qaRafCalls || 0`);
  const backgroundTarget = await browserCdp.send("Target.createTarget", { url: "about:blank" });
  backgroundTargetId = backgroundTarget.targetId;
  await browserCdp.send("Target.activateTarget", { targetId: backgroundTargetId });
  await waitForCondition(cdp, `document.visibilityState === 'hidden'`, { timeoutMs: 3000, description: "hidden page visibility event" });
  await waitForCondition(cdp, `document.querySelector('.machine-scene-layer')?.dataset.pageVisible === 'false'`, { timeoutMs: 4000, description: "hidden scene pause state" });
  await delay(900);
  const rafWhileHidden = await cdp.evaluate(`window.__qaRafCalls || 0`);
  await browserCdp.send("Target.activateTarget", { targetId: primaryTargetId });
  await waitForCondition(cdp, `document.visibilityState === 'visible' && document.querySelector('.machine-scene-layer')?.dataset.pageVisible === 'true'`, { timeoutMs: 4000, description: "visible scene resume state" });
  await delay(500);
  const rafAfterVisible = await cdp.evaluate(`window.__qaRafCalls || 0`);
  report.rendering.visibility = { rafBeforeHidden, rafWhileHidden, rafAfterVisible, hiddenDelta: rafWhileHidden - rafBeforeHidden, resumedDelta: rafAfterVisible - rafWhileHidden };
  assert(rafWhileHidden - rafBeforeHidden < 30, "Animation callbacks continued rapidly while page visibility was hidden");
  assert(rafAfterVisible > rafWhileHidden, "Animation callbacks did not resume when the tab became visible");
  await browserCdp.send("Target.closeTarget", { targetId: backgroundTargetId });
  backgroundTargetId = undefined;

  const failScript = await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `Object.defineProperty(navigator, 'gpu', { configurable: true, value: undefined }); const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (['webgl2', 'webgpu'].includes(String(type).toLowerCase())) return null; return original.call(this, type, ...args); };` });
  await navigate(cdp, baseUrl);
  const forcedFailure = await waitForCondition(cdp, `(() => { const layer = document.querySelector('.machine-scene-layer'); return layer?.dataset.sceneStatus === 'failed' ? { status: layer.dataset.sceneStatus, svg: Boolean(document.querySelector('.machine-static svg')), canvas: document.querySelectorAll('.machine-canvas canvas').length } : null; })()`, { timeoutMs: 10_000, description: "forced graphics failure fallback" });
  assert(forcedFailure.value.svg && forcedFailure.value.canvas === 0, "Forced renderer failure did not retain the static SVG fallback");
  await cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: failScript.identifier });
  report.rendering.forcedGraphicsFailure = forcedFailure.value;

  activeScenario = "gallery lazy loading and decoding";
  await setViewport(cdp, 1440, 900);
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  for (const slug of QA_PROJECT_SLUGS) {
    await navigate(cdp, `${baseUrl}/projects/${slug}`);
    const images = await decodeGalleryImages(cdp);
    const failures = images.filter((image) => !image.decoded || !image.naturalWidth);
    assert(failures.length === 0, `${slug}: gallery images failed to decode: ${JSON.stringify(failures)}`);
    report.galleries.push({ slug, count: images.length, decoded: images.length, images });
  }

  activeScenario = "refresh, browser history, and route cleanup";
  await setViewport(cdp, 1280, 720);
  await navigate(cdp, baseUrl);
  await waitForCondition(cdp, `Boolean(document.querySelector('a[href="/projects"]'))`, { description: "work navigation link" });
  await clickAtSelector('a[href="/projects"]');
  await waitForCondition(cdp, `location.pathname === '/projects'`, { timeoutMs: 8000, description: "client navigation to project index" });
  await cdp.send("Page.reload", { ignoreCache: true });
  await cdp.once("Page.loadEventFired", 20_000).catch(() => null);
  await waitForCondition(cdp, `location.pathname === '/projects' && document.querySelectorAll('[data-project-slug]').length === 6`, { description: "refresh project index" });
  const history = await cdp.send("Page.getNavigationHistory");
  const entries = history.entries;
  const projectEntry = entries[history.currentIndex];
  const homeIndex = entries.slice(0, history.currentIndex).findLastIndex((entry) => new URL(entry.url).pathname === "/");
  assert(homeIndex >= 0, "Browser history did not retain the homepage entry");
  await cdp.send("Page.navigateToHistoryEntry", { entryId: entries[homeIndex].id });
  await waitForCondition(cdp, `location.pathname === '/' && Boolean(document.querySelector('#contact'))`, { description: "browser back navigation" });
  const afterBack = await cdp.send("Page.getNavigationHistory");
  const projectsIndex = afterBack.entries.findLastIndex((entry) => new URL(entry.url).pathname === "/projects");
  assert(projectsIndex >= 0, "Browser history lost the project index entry");
  await cdp.send("Page.navigateToHistoryEntry", { entryId: afterBack.entries[projectsIndex].id });
  await waitForCondition(cdp, `location.pathname === '/projects' && document.querySelectorAll('[data-project-slug]').length === 6`, { description: "browser forward navigation" });

  const repeated = [];
  for (const routePath of ["/projects/candidatex", "/resume", "/projects/helios", "/lab", "/projects/portfolio", "/"]) {
    await navigate(cdp, `${baseUrl}${routePath}`);
    const health = await pageHealth(cdp);
    assert(health.sceneLayers <= 1 && health.canvases <= 1, `${routePath}: duplicate scene layer or canvas after route change`);
    if (routePath === "/resume" || routePath === "/lab") assert(health.sceneLayers === 0 && health.canvases === 0, `${routePath}: inactive route kept a scene mounted`);
    repeated.push({ path: routePath, sceneLayers: health.sceneLayers, canvases: health.canvases });
  }
  report.interaction.history = { clientNavigation: true, refresh: true, back: true, forward: true, startEntry: projectEntry.url };
  report.interaction.routeCleanup = { repeatedRoutes: repeated };

  const reducedMotionHome = report.performance.samples.find((sample) => sample.path === "/" && sample.viewport === "1440x900");
  const renderedHome = report.performance.samples.find((sample) => sample.path === "/" && sample.viewport === "1440x900-rendered");
  if (reducedMotionHome && renderedHome) {
    const baselineScripts = new Set(reducedMotionHome.javascriptResources.map((resource) => resource.path));
    const lazySceneResources = renderedHome.javascriptResources.filter((resource) => !baselineScripts.has(resource.path));
    report.performance.threeSceneIncrementalTransfer = {
      bytes: lazySceneResources.reduce((sum, resource) => sum + resource.transferBytes, 0),
      resources: lazySceneResources,
      attribution: "Same-origin JavaScript resources present after scene initialization and absent from the reduced-motion homepage sample at 1440x900.",
      caveat: "Production chunk filenames are hashed; this identifies the lazy scene bundle by controlled route/preference comparison, not by filename. Transfer timing reflects this warmed local browser context.",
    };
  } else {
    report.performance.notes.push("Could not derive incremental scene JavaScript transfer because one of the paired homepage samples was missing.");
  }

  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  const finalBrowserErrors = browserErrors;
  report.browserErrors = finalBrowserErrors;
  assert(finalBrowserErrors.length === 0, `Browser errors detected (${finalBrowserErrors.length}):\n${finalBrowserErrors.slice(0, 12).map((item) => `${item.scenario}: ${item.message}`).join("\n")}`);

  report.status = "passed";
  const actualScreenshots = REVIEW_SCREENSHOT_NAMES.map((name) => path.join(outputDir, `${name}.png`));
  const missingScreenshots = actualScreenshots.filter((file) => !fs.existsSync(file) || fs.statSync(file).size < 1000);
  assert(missingScreenshots.length === 0, `Review screenshots missing or empty: ${missingScreenshots.join(", ")}`);
  report.screenshots = actualScreenshots.map((file) => path.relative(root, file).replaceAll("\\", "/"));
  report.completedAt = new Date().toISOString();
  console.log(`browser QA: passed · ${report.routeMatrix.checked} route/viewport checks · ${report.screenshots.length} review captures · ${path.relative(root, reportPath)}`);
} catch (error) {
  recordFailure(error);
  if (appOutput) console.error(`production server output:\n${appOutput}`);
} finally {
  if (backgroundTargetId && browserCdp) {
    try { await browserCdp.send("Target.closeTarget", { targetId: backgroundTargetId }); } catch {}
  }
  cdp?.close();
  browserCdp?.close();
  killTree(chrome);
  killTree(app);
  try {
    fs.rmSync(chromeProfile, { recursive: true, force: true });
  } catch (error) {
    report.failures.push(`temporary browser profile cleanup: ${error.message}`);
    report.status = "failed";
    process.exitCode = 1;
  }
  report.browserErrors = browserErrors;
  report.environmentWarnings = [...new Set(report.environmentWarnings)];
  if (!report.screenshots.length) {
    report.screenshots = REVIEW_SCREENSHOT_NAMES
      .map((name) => path.join(outputDir, `${name}.png`))
      .filter((file) => fs.existsSync(file))
      .map((file) => path.relative(root, file).replaceAll("\\", "/"));
  }
  report.completedAt ??= new Date().toISOString();
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`Unable to write ${reportPath}: ${error.message}`);
    process.exitCode = 1;
  }
}
