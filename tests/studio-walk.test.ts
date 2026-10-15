import assert from "node:assert/strict";
import test from "node:test";
import {
  WALK_BOUNDS,
  isWalkable,
  nearestWalkable,
  slideWalk,
  walkRoute,
  type WalkPoint,
} from "../src/components/experience/StudioWalk";

test("walkmesh rejects room walls, the workstation and the chair footprint", () => {
  assert.equal(isWalkable(0, 0), true);
  assert.equal(isWalkable(WALK_BOUNDS.minX, 0), true);
  assert.equal(isWalkable(WALK_BOUNDS.maxX + 0.001, 0), false);
  assert.equal(isWalkable(0, WALK_BOUNDS.maxZ + 0.001), false);
  assert.equal(isWalkable(0, -1), false);
  assert.equal(isWalkable(0.3, -0.36), false);
  assert.equal(isWalkable(Number.NaN, 0), false);
});

test("nearest walkable destination stays inside the room and outside furniture", () => {
  for (const request of [
    { x: 0, z: -1.2 },
    { x: 0.3, z: -0.36 },
    { x: 20, z: -20 },
  ]) {
    const destination = nearestWalkable(request.x, request.z);
    assert.equal(isWalkable(destination.x, destination.z), true);
    assert.ok(destination.x >= WALK_BOUNDS.minX && destination.x <= WALK_BOUNDS.maxX);
    assert.ok(destination.z >= WALK_BOUNDS.minZ && destination.z <= WALK_BOUNDS.maxZ);
  }
});

test("manual movement slides along furniture and stops at room boundaries", () => {
  const deskSlide = slideWalk({ x: -1.5, z: -0.9 }, 0.3, 0.2);
  assert.deepEqual(deskSlide, { x: -1.5, z: -0.7 });
  assert.equal(isWalkable(deskSlide.x, deskSlide.z), true);

  const wallSlide = slideWalk({ x: 1.8, z: 0.2 }, 0.2, 0.1);
  assert.equal(wallSlide.x, 1.8);
  assert.ok(Math.abs(wallSlide.z - 0.3) < 1e-12);
  assert.equal(isWalkable(wallSlide.x, wallSlide.z), true);
});

function assertRouteStaysWalkable(start: WalkPoint, route: WalkPoint[]) {
  assert.ok(route.length > 0, "a walkable destination should have a route");
  const points = [nearestWalkable(start.x, start.z), ...route];
  for (const point of points) assert.equal(isWalkable(point.x, point.z), true);
  for (let edge = 1; edge < points.length; edge++) {
    const from = points[edge - 1];
    const to = points[edge];
    const distance = Math.hypot(to.x - from.x, to.z - from.z);
    assert.ok(distance <= 0.33, `route contains a jump of ${distance.toFixed(3)} metres`);
    const samples = Math.ceil(distance / 0.025);
    for (let step = 1; step < samples; step++) {
      const amount = step / samples;
      assert.equal(isWalkable(from.x + (to.x - from.x) * amount, from.z + (to.z - from.z) * amount), true,
        "route cuts through a wall or furniture footprint");
    }
  }
}

test("A* routes around the workstation and chair without cutting corners", () => {
  const start = { x: 1.6, z: 0.5 };
  const requested = { x: -1.6, z: -1.0 };
  const route = walkRoute(start, requested);
  assertRouteStaysWalkable(start, route);
  assert.deepEqual(route.at(-1), nearestWalkable(requested.x, requested.z));
});

test("walk routing safely handles exact room edges and zero-distance requests", () => {
  const edgeStart = { x: WALK_BOUNDS.maxX, z: WALK_BOUNDS.maxZ };
  const edgeGoal = { x: WALK_BOUNDS.minX, z: WALK_BOUNDS.minZ };
  const route = walkRoute(edgeStart, edgeGoal);
  assertRouteStaysWalkable(edgeStart, route);
  assert.deepEqual(route.at(-1), nearestWalkable(edgeGoal.x, edgeGoal.z));

  const samePoint = { x: 1.6, z: 1.2 };
  assert.deepEqual(walkRoute(samePoint, samePoint), [samePoint]);
});
