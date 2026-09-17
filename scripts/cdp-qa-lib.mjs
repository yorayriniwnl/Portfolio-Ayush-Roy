import fs from "node:fs";
import net from "node:net";
import path from "node:path";

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
  await delay(450);
}

export async function capture(cdp, outputDir, name) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  fs.writeFileSync(path.join(outputDir, `${name}.png`), Buffer.from(result.data, "base64"));
}

export async function pageHealth(cdp) {
  return cdp.evaluate(`(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ').trim() || '',
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
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
