import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isWalkable, nearestWalkable, slideWalk, walkRoute, WALK_BOUNDS,
  type WalkPoint,
} from "../src/components/experience/StudioWalk";

test("walkmesh excludes walls, furniture and malformed coordinates", () => {
  assert.equal(isWalkable(0, 0), true);
  assert.equal(isWalkable(0, -1), false, "Desk footprint must stay blocked");
  assert.equal(isWalkable(.3, -.36), false, "Chair footprint must stay blocked");
  assert.equal(isWalkable(WALK_BOUNDS.maxX + .01, 0), false);
  assert.equal(isWalkable(0, WALK_BOUNDS.minZ - .01), false);
  for (const point of [{x:NaN,z:0},{x:Infinity,z:0},{x:0,z:-Infinity}]) {
    assert.equal(isWalkable(point.x, point.z), false);
    const nearest=nearestWalkable(point.x, point.z);
    assert.equal(isWalkable(nearest.x,nearest.z),true);
  }
});

test("sliding cannot move into furniture or poison the camera with invalid input", () => {
  const start={x:0,z:.2};
  const stopped=slideWalk(start,0,-1.3);
  assert.deepEqual(stopped,start);
  assert.deepEqual(slideWalk(start,NaN,0),start);
  assert.deepEqual(slideWalk({x:Infinity,z:NaN},0,0),{x:0,z:.9});
  let position=start;
  for (let i=0;i<100;i++) {
    position=slideWalk(position,.025,-.025);
    assert.equal(isWalkable(position.x,position.z),true);
  }
});

test("pathfinding handles all four extreme floor corners without invalid grid indices", () => {
  const corners:WalkPoint[]=[
    {x:WALK_BOUNDS.minX+.01,z:WALK_BOUNDS.minZ+.01},
    {x:WALK_BOUNDS.maxX-.01,z:WALK_BOUNDS.minZ+.01},
    {x:WALK_BOUNDS.minX+.01,z:WALK_BOUNDS.maxZ-.01},
    {x:WALK_BOUNDS.maxX-.01,z:WALK_BOUNDS.maxZ-.01},
  ];
  const start:WalkPoint={x:0,z:.9};
  for(const goal of corners) {
    assert.equal(isWalkable(goal.x,goal.z),true);
    const path=walkRoute(start,goal);
    assert.ok(path.length>0, "Path was lost at corner "+JSON.stringify(goal));
    assert.deepEqual(path.at(-1),goal);
    for(const point of path) {
      assert.ok(Number.isFinite(point.x) && Number.isFinite(point.z));
      assert.equal(isWalkable(point.x,point.z),true,
        "Route passed through furniture at "+JSON.stringify(point));
    }
  }
});

test("cross-room routes stay outside obstacles and do not cut diagonally through desk", () => {
  const start={x:WALK_BOUNDS.minX+.01,z:WALK_BOUNDS.minZ+.01};
  const goal={x:WALK_BOUNDS.maxX-.01,z:WALK_BOUNDS.minZ+.01};
  const path=walkRoute(start,goal);
  assert.ok(path.length>5,"Cross-room route must detour around furniture");
  let previous=start;
  for(const next of path) {
    for(let sample=0;sample<=10;sample++) {
      const t=sample/10;
      const x=previous.x+(next.x-previous.x)*t;
      const z=previous.z+(next.z-previous.z)*t;
      assert.equal(isWalkable(x,z),true,
        "A* segment crossed an obstacle near "+JSON.stringify({x,z}));
    }
    previous=next;
  }
});

test("mobile movement buttons meet the 44px minimum target size", () => {
  const css=readFileSync("src/styles/studio.css","utf8");
  assert.match(css,/grid-template-columns: repeat\(3, 44px\);\s*grid-template-rows: repeat\(3, 44px\)/);
  assert.doesNotMatch(css,/repeat\(3, ?34px\)/);
});
