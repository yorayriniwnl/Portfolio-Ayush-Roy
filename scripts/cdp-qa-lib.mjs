import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const QA_VIEWPORTS = [
  { width: 375, height: 812, label: "375x812" },
  { width: 390, height: 844, label: "390x844" },
  { width: 430, height: 932, label: "430x932" },
  { width: 768, height: 1024, label: "768x1024" },
  { width: 1024, height: 768, label: "1024x768" },
  { width: 1280, height: 720, label: "1280x720" },
  { width: 1440, height: 900, label: "1440x900" },
  { width: 1728, height: 1117, label: "1728x1117" },
  { width: 1920, height: 1080, label: "1920x1080" },
  { width: 2560, height: 1440, label: "2560x1440" },
];

export const QA_PROJECT_SLUGS = ["candidatex", "zenith", "helios", "ai-vs-real", "talks", "portfolio"];

export const QA_CORE_ROUTES = [
  { path: "/", label: "home", surface: "home", requiredHeading: "I BUILD SYSTEMS THAT MOVE." },
  { path: "/projects", label: "project-index", surface: "project-index", requiredHeading: "Projects with receipts." },
  ...[
    ["candidatex", "CandidateX"],
    ["zenith", "Yor Zenith"],
    ["helios", "Yor Helios"],
    ["ai-vs-real", "Yor AI vs. Real Image Detector"],
    ["talks", "Yor Talks V2"],
    ["portfolio", "Personal Developer Portfolio"],
  ].map(([slug, requiredHeading]) => ({ path: `/projects/${slug}`, label: `case-${slug}`, surface: "case-study", slug, requiredHeading })),
];

export const QA_SECONDARY_ROUTES = [
  { path: "/resume", label: "resume", requiredHeading: "Ayush Roy", requiredText: "Open PDF" },
  { path: "/lab", label: "lab", requiredHeading: "Play without", requiredText: "ROOM CONCEPT" },
];

export const QA_RESOLVER_ROUTES = QA_PROJECT_SLUGS.flatMap((slug) => [
  { path: `/projects/${slug}/source`, slug, kind: "source" },
  { path: `/projects/${slug}/live`, slug, kind: "live" },
]);

export const QA_LEGACY_ROUTES = [
  ...[
    ["portfolio", "portfolio"],
    ["helios", "helios"],
    ["candidatex", "candidatex"],
    ["cci", "candidatex"],
    ["candidate-capability-intelligence", "candidatex"],
    ["zenith", "zenith"],
    ["yor-zenith", "zenith"],
    ["yor-helios", "helios"],
    ["ai-vs-real", "ai-vs-real"],
    ["texture-forensics", "ai-vs-real"],
    ["yor-ai-vs-real-image", "ai-vs-real"],
    ["talks", "talks"],
    ["yor-talks", "talks"],
    ["yor-talks-v2", "talks"],
  ].map(([slug, canonical]) => ({ path: `/work/${slug}`, expectedLocation: `/projects/${canonical}` })),
  { path: "/work/token-usage", expectedStatus: 200, requiredText: "Token" },
];

export const REVIEW_SCREENSHOT_NAMES = [
  "desktop-hero",
  "desktop-project-world",
  "desktop-case-study",
  "mobile-hero",
  "mobile-project-world",
  "contact-finale",
];

export const CLIPPING_PROBE_EXPRESSION = String.raw`(() => {
  const selector = "h1, h2, h3, [data-essential-copy]";
  const targets = Array.from(document.querySelectorAll(selector)).filter((node) => node.textContent?.trim());
  const issues = [];
  const headingMetrics = [];
  const clipValues = new Set(["hidden", "clip"]);
  const textOf = (node) => (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 110);
  const rectOf = (rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });

  for (const node of targets) {
    const text = textOf(node);
    const isHeading = /^H[1-3]$/.test(node.tagName);
    const range = document.createRange();
    range.selectNodeContents(node);
    const lineRects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
    if (isHeading) {
      const style = getComputedStyle(node);
      const metrics = {
        text,
        tag: node.tagName,
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
        fontSize: style.fontSize,
        letterSpacing: style.letterSpacing,
        box: rectOf(node.getBoundingClientRect()),
      };
      headingMetrics.push(metrics);
    }

    for (const line of lineRects) {
      const lineBox = rectOf(line);
      if (line.left < -1 || line.right > innerWidth + 1) {
        issues.push({ kind: "viewport-horizontal", text, line: lineBox, viewportWidth: innerWidth });
      }

      let horizontalChecked = false;
      let verticalChecked = false;
      for (let ancestor = node; ancestor && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        const box = ancestor.getBoundingClientRect();
        const className = typeof ancestor.className === "string" ? ancestor.className : ancestor.tagName.toLowerCase();
        if (!horizontalChecked && clipValues.has(style.overflowX)) {
          horizontalChecked = true;
          if (line.left < box.left - 1 || line.right > box.right + 1) {
            issues.push({ kind: "clipped-horizontal-ancestor", text, ancestor: className, line: lineBox, ancestorBox: rectOf(box) });
          }
        }
        if (!verticalChecked && clipValues.has(style.overflowY)) {
          verticalChecked = true;
          if (line.top < box.top - 1 || line.bottom > box.bottom + 1) {
            issues.push({ kind: "clipped-vertical-ancestor", text, ancestor: className, line: lineBox, ancestorBox: rectOf(box) });
          }
        }
        if (horizontalChecked && verticalChecked) break;
      }

      const ownBox = node.getBoundingClientRect();
      if (isHeading && (line.left < ownBox.left - 1 || line.right > ownBox.right + 1)) {
        issues.push({ kind: "heading-line-outside-box", text, line: lineBox, headingBox: rectOf(ownBox) });
      }
      if (node.hasAttribute("data-essential-copy") && (line.left < ownBox.left - 1 || line.right > ownBox.right + 1)) {
        issues.push({ kind: "essential-copy-line-outside-box", text, line: lineBox, copyBox: rectOf(ownBox) });
      }
    }
  }

  return {
    viewport: { width: innerWidth, height: innerHeight },
    targetCount: targets.length,
    headingMetrics,
    essentialCopyCount: document.querySelectorAll("[data-essential-copy]").length,
    issues,
  };
})()`;

export const PERFORMANCE_METRICS_EXPRESSION = String.raw`(() => {
  const resources = performance.getEntriesByType("resource");
  const scripts = resources.filter((entry) => entry.initiatorType === "script" || /\.m?js(?:[?#]|$)/i.test(entry.name));
  const bytes = (entry) => entry.transferSize || entry.encodedBodySize || 0;
  const threeCandidates = scripts.filter((entry) => /three|react-three|fiber|webgpu/i.test(entry.name));
  const navigation = performance.getEntriesByType("navigation")[0];
  const layoutShifts = window.__qaLayoutShifts || [];
  return {
    javascriptTransferBytes: scripts.reduce((sum, entry) => sum + bytes(entry), 0),
    javascriptResourceCount: scripts.length,
    javascriptResources: scripts.map((entry) => ({ path: new URL(entry.name, location.href).pathname, transferBytes: bytes(entry) })),
    threeJsCandidateBytes: threeCandidates.reduce((sum, entry) => sum + bytes(entry), 0),
    threeJsCandidateResources: threeCandidates.map((entry) => new URL(entry.name, location.href).pathname),
    threeJsAttribution: threeCandidates.length ? "resource-name match" : "not attributable from hashed production chunk names",
    navigation: navigation ? {
      responseEndMs: navigation.responseEnd,
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadEventEndMs: navigation.loadEventEnd,
      transferBytes: navigation.transferSize,
    } : null,
    largestContentfulPaintMs: window.__qaLargestContentfulPaintMs ?? null,
    cumulativeLayoutShift: layoutShifts.reduce((sum, entry) => sum + entry.value, 0),
    layoutShiftCount: layoutShifts.length,
    shaderCompilation: { available: false, reason: "No stable total compile-duration surface is exposed to this production browser harness." },
  };
})()`;

export const PERFORMANCE_OBSERVER_INSTALL = String.raw`(() => {
  window.__qaLayoutShifts = [];
  window.__qaLargestContentfulPaintMs = null;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__qaLayoutShifts.push({ value: entry.value, startTime: entry.startTime });
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__qaLargestContentfulPaintMs = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
})()`;

export function isExpectedNotFound({ status, body }) {
  return status === 404 && /not found|404/i.test(String(body ?? ""));
}

export function resolveChromiumPath({
  platform = process.platform,
  env = process.env,
  existsSync = fs.existsSync,
  execFileSync: runCommand = execFileSync,
} = {}) {
  const override = env.CHROMIUM_PATH?.trim();
  if (override && existsSync(override)) return override;

  if (platform === "win32") {
    const join = path.win32.join;
    const roots = [
      env.PROGRAMFILES,
      env["PROGRAMFILES(X86)"],
      env.PROGRAMW6432,
      env.LOCALAPPDATA,
    ].filter(Boolean);
    const suffixes = [
      ["Google", "Chrome", "Application", "chrome.exe"],
      ["Microsoft", "Edge", "Application", "msedge.exe"],
    ];
    const candidates = [...new Set(roots.flatMap((root) => suffixes.map((suffix) => join(root, ...suffix))))];
    const match = candidates.find((candidate) => existsSync(candidate));
    if (match) return match;
    throw new Error(`No Chromium-compatible browser found in Windows install locations. Set CHROMIUM_PATH. Searched: ${candidates.join(", ")}`);
  }

  for (const command of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "microsoft-edge", "microsoft-edge-stable"]) {
    try {
      const resolved = runCommand("which", [command], { encoding: "utf8" }).trim();
      if (resolved && existsSync(resolved)) return resolved;
    } catch {}
  }
  throw new Error("No Chromium-compatible browser found on PATH. Set CHROMIUM_PATH to run browser QA.");
}

export async function decodeGalleryImages(cdp, { timeoutMs = 12_000 } = {}) {
  const expression = `(${async function decodeImages(timeout) {
    const root = document.querySelector("[data-gallery-project]") || document;
    const images = Array.from(root.querySelectorAll("img"));
    const initialScroll = window.scrollY;
    const results = [];
    for (const image of images) {
      image.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const deadline = Date.now() + timeout;
      while (!image.complete && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      let decoded = false;
      try {
        await image.decode();
        decoded = true;
      } catch {}
      results.push({
        src: new URL(image.currentSrc || image.src, location.href).pathname,
        loading: image.loading,
        complete: image.complete,
        decoded,
        naturalWidth: image.naturalWidth,
      });
    }
    window.scrollTo({ top: initialScroll, behavior: "instant" });
    return results;
  }.toString()})(${timeoutMs})`;
  return cdp.evaluate(expression);
}

export async function waitForCondition(cdp, expression, { timeoutMs = 15_000, intervalMs = 100, description = expression } = {}) {
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeoutMs) {
    lastValue = await cdp.evaluate(expression);
    if (lastValue) return { value: lastValue, elapsedMs: Date.now() - started };
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${description}; last value: ${JSON.stringify(lastValue)}`);
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

export async function waitForHttp(url, timeoutMs = 90_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return response;
    } catch (error) {
      lastError = error;
    }
    await delay(300);
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError ?? "no response"}`);
}

export class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP websocket connection timed out")), 10_000);
      this.ws.addEventListener("open", () => { clearTimeout(timeout); resolve(); });
      this.ws.addEventListener("error", (event) => { clearTimeout(timeout); reject(new Error(`CDP websocket error: ${event.type}`)); });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) listener(message.params ?? {});
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(method, timeoutMs = 12_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off(method, handler);
        reject(new Error(`Timed out waiting for CDP event ${method}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timeout);
        this.off(method, handler);
        resolve(params);
      };
      this.on(method, handler);
    });
  }

  on(method, handler) {
    const listeners = this.listeners.get(method) ?? new Set();
    listeners.add(handler);
    this.listeners.set(method, listeners);
  }

  off(method, handler) {
    this.listeners.get(method)?.delete(handler);
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(`Browser evaluation failed: ${result.exceptionDetails.text}`);
    return result.result?.value;
  }

  close() {
    this.ws?.close();
  }
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function findPageDebugger(port) {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await delay(200);
  }
  throw new Error("Unable to discover Chromium page debugger");
}

export async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 650,
    screenWidth: width,
    screenHeight: height,
  });
}

export async function navigate(cdp, url) {
  const loaded = cdp.once("Page.loadEventFired", 20_000).catch(() => null);
  await cdp.send("Page.navigate", { url });
  await loaded;
  await cdp.evaluate(`window.scrollTo({ top: 0, left: 0, behavior: "instant" }); true`);
  await delay(450);
}

export async function capture(cdp, outputDir, name) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}

export async function pageHealth(cdp) {
  return cdp.evaluate(`(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.innerText?.replace(/\\s+/g, ' ').trim() || '',
    h1Count: document.querySelectorAll('h1').length,
    mainCount: document.querySelectorAll('main').length,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    sceneStatus: document.querySelector('.machine-scene-layer')?.getAttribute('data-scene-status') || null,
    sceneLayers: document.querySelectorAll('.machine-scene-layer').length,
    canvases: document.querySelectorAll('.machine-canvas canvas').length,
    bodyText: document.body.innerText,
  }))()`);
}

export async function accessibilityHealth(cdp, routeLabel) {
  await cdp.send("Accessibility.enable");
  const { nodes = [] } = await cdp.send("Accessibility.getFullAXTree");
  const interactiveRoles = new Set(["button", "link", "checkbox", "radio", "textbox", "combobox", "menuitem"]);
  const unnamed = nodes.filter((node) => {
    const role = node.role?.value;
    if (!interactiveRoles.has(role) || node.ignored) return false;
    return !(node.name?.value || "").trim();
  });
  assert(unnamed.length === 0, `${routeLabel}: ${unnamed.length} interactive accessibility nodes have no accessible name`);
  const headingLevels = await cdp.evaluate(`Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((node) => Number(node.tagName.slice(1)))`);
  assert(headingLevels.filter((level) => level === 1).length === 1, `${routeLabel}: expected exactly one h1`);
  return { nodes: nodes.length, unnamedInteractive: unnamed.length };
}
