import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { StudioRoom } from "../src/components/experience/StudioRoom";

const renderViewer = () => renderToStaticMarkup(createElement(StudioRoom));

test("the server-rendered viewer provides faithful artwork before WebGL loads", () => {
  const html = renderViewer();
  assert.match(html, /src="\/media\/operator-reference\.webp"/);
  assert.match(html, /width="1672" height="941"/);
  assert.match(html, /alt="A masked tactical operator and a husky in a dark study with red lighting\."/);
  assert.match(html, /YOR \/ AFTER HOURS/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /Loading the operator, companion/);
  assert.equal(html.includes("<canvas"), false, "WebGL must load lazily on the client");
});

test("scene navigation is one explicit engineering link outside the viewport", () => {
  const html = renderViewer();
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(links, ["/projects"]);
  assert.ok(html.indexOf('class="yor-studio__projects"') > html.indexOf('class="yor-studio__controls"'));
  assert.doesNotMatch(html, /role="dialog"|yor-room-console|console-project|EXPLORE CANDIDATEX/);
  const wrapper = readFileSync("src/components/experience/StudioRoom.tsx", "utf8");
  assert.doesNotMatch(wrapper, /onSelect=|onInteract=|onWalkTo=|recruiterProjects|router\.push|window\.location/);
});

test("viewer controls remain accessible without a rendered model", () => {
  const html = renderViewer();
  for (const label of ["Reset camera view", "Dim scene lights", "Pause scene animation", "Enter fullscreen"]) {
    assert.ok(html.includes(`aria-label="${label}"`), `missing accessible control ${label}`);
  }
  assert.match(html, /aria-describedby="studio-instructions"/);
  assert.match(html, /Drag to rotate\. Scroll or pinch to zoom\./);
  assert.match(html, /Escape exits fullscreen/);
  assert.match(html, /aria-label="Reset camera view"[^>]*disabled=""/);
  assert.match(html, /data-scene-ready="false"/);
});

test("browser regression audit exercises scene gestures and navigation isolation", () => {
  const runner = readFileSync("scripts/browser-qa.mjs", "utf8");
  for (const required of [
    "Ordinary scene clicks opened project navigation or a dialog",
    "Releasing a drag opened navigation",
    "Dragging the scene did not orbit the camera",
    "Wheel zoom did not change camera distance",
    "Pinch gesture did not zoom the scene",
    "Paused scene kept continuously rendering",
    "Offscreen scene kept continuously rendering",
    "__qaStudioCanvas",
  ]) assert.ok(runner.includes(required), `browser coverage missing: ${required}`);
});
