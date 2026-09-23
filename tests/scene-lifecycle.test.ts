import assert from "node:assert/strict";
import test from "node:test";
import { unmountAndDisposeScene } from "../src/experience/scene-lifecycle";

test("scene teardown unmounts the reconciler root before disposing its renderer", () => {
  const events: string[] = [];

  unmountAndDisposeScene(
    { unmount: () => events.push("unmount") },
    { dispose: () => events.push("dispose") },
  );

  assert.deepEqual(events, ["unmount", "dispose"]);
});

test("scene teardown still attempts both releases when either one throws", () => {
  const events: string[] = [];

  assert.doesNotThrow(() => unmountAndDisposeScene(
    {
      unmount: () => {
        events.push("unmount");
        throw new Error("root teardown failed");
      },
    },
    {
      dispose: () => {
        events.push("dispose");
        throw new Error("renderer teardown failed");
      },
    },
  ));

  assert.deepEqual(events, ["unmount", "dispose"]);
});
