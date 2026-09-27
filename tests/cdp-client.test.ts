import assert from "node:assert/strict";
import test from "node:test";
import { CdpClient } from "../scripts/cdp-qa-lib.mjs";

test("browser commands time out and release pending requests when Chromium stops responding", async () => {
  const client = new CdpClient("ws://unused");
  client.ws = { readyState: WebSocket.OPEN, send() {}, close() {} } as unknown as WebSocket;
  await assert.rejects(client.send("Page.navigate", {}, 10), /Timed out.*Page.navigate/);
  assert.equal(client.pending.size, 0);
});

test("closing the browser client rejects outstanding commands immediately", async () => {
  const client = new CdpClient("ws://unused");
  client.ws = { readyState: WebSocket.OPEN, send() {}, close() {} } as unknown as WebSocket;
  const pending = assert.rejects(client.send("Runtime.evaluate"), /CDP client closed/);
  client.close();
  await pending;
  assert.equal(client.pending.size, 0);
});

test("disconnected browser commands fail without leaking pending requests", async () => {
  const client = new CdpClient("ws://unused");
  await assert.rejects(client.send("Page.navigate"), /connection is not open/);
  assert.equal(client.pending.size, 0);
});
