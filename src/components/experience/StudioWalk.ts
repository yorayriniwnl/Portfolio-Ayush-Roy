/** Bounded, deterministic walkmesh for the authored 4.2m x 3.6m room. */
export type WalkPoint = { x: number; z: number };
export type WalkPose = WalkPoint & { yaw: number; pitch: number };
export type WalkDirection = "forward" | "back" | "left" | "right";

export const WALK_BOUNDS = { minX: -1.83, maxX: 1.83, minZ: -1.48, maxZ: 1.48 } as const;
export const WALK_EYE_HEIGHT = 1.58;
export const WALK_GRID_STEP = 0.16;

const STEP = WALK_GRID_STEP;
const NX = Math.floor((WALK_BOUNDS.maxX - WALK_BOUNDS.minX) / STEP) + 1;
const NZ = Math.floor((WALK_BOUNDS.maxZ - WALK_BOUNDS.minZ) / STEP) + 1;

export function isWalkable(x: number, z: number): boolean {
  const { minX, maxX, minZ, maxZ } = WALK_BOUNDS;
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < minX || x > maxX || z < minZ || z > maxZ) return false;
  // The desk and cabinets occupy the back-center of the room. The circular
  // footprint pads the chair and seated resident so routes do not graze them.
  if (z < -0.64 && Math.abs(x) < 1.48) return false;
  if ((x - 0.3) ** 2 + (z + 0.36) ** 2 < 0.46 ** 2) return false;
  return true;
}

export function nearestWalkable(x: number, z: number): WalkPoint {
  const base = {
    x: Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, x)),
    z: Math.max(WALK_BOUNDS.minZ, Math.min(WALK_BOUNDS.maxZ, z)),
  };
  if (isWalkable(base.x, base.z)) return base;

  // Find the closest open grid point instead of routing through furniture.
  let found: WalkPoint = { x: 0, z: 0.9 };
  let best = Infinity;
  for (let ix = 0; ix < NX; ix++) {
    for (let iz = 0; iz < NZ; iz++) {
      const point = { x: WALK_BOUNDS.minX + ix * STEP, z: WALK_BOUNDS.minZ + iz * STEP };
      if (!isWalkable(point.x, point.z)) continue;
      const distance = (point.x - base.x) ** 2 + (point.z - base.z) ** 2;
      if (distance < best) {
        best = distance;
        found = point;
      }
    }
  }
  return found;
}

export function slideWalk(position: WalkPoint, dx: number, dz: number): WalkPoint {
  // Resolve axes separately so diagonal input slides along furniture edges.
  const x = position.x + dx;
  const z = position.z + dz;
  if (isWalkable(x, z)) return { x, z };
  if (isWalkable(x, position.z)) return { x, z: position.z };
  if (isWalkable(position.x, z)) return { x: position.x, z };
  return position;
}

function toCell(point: WalkPoint) {
  return {
    x: Math.max(0, Math.min(NX - 1, Math.round((point.x - WALK_BOUNDS.minX) / STEP))),
    z: Math.max(0, Math.min(NZ - 1, Math.round((point.z - WALK_BOUNDS.minZ) / STEP))),
  };
}

function toWorld(x: number, z: number): WalkPoint {
  return { x: WALK_BOUNDS.minX + x * STEP, z: WALK_BOUNDS.minZ + z * STEP };
}

export function walkRoute(start: WalkPoint, requested: WalkPoint): WalkPoint[] {
  const goal = nearestWalkable(requested.x, requested.z);
  const origin = nearestWalkable(start.x, start.z);
  const startCell = toCell(origin);
  const goalCell = toCell(goal);
  const id = (x: number, z: number) => z * NX + x;
  const source = id(startCell.x, startCell.z);
  const destination = id(goalCell.x, goalCell.z);
  if (source === destination) return [goal];

  const total = NX * NZ;
  const score = new Float64Array(total).fill(Infinity);
  const prior = new Int32Array(total).fill(-1);
  const active = new Set<number>([source]);
  const closed = new Set<number>();
  score[source] = 0;
  const estimate = (index: number) => Math.hypot(index % NX - goalCell.x, Math.floor(index / NX) - goalCell.z);
  const offsets = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const;

  for (let count = 0; count < total && active.size > 0; count++) {
    let current = -1;
    let lowest = Infinity;
    for (const candidate of active) {
      const value = score[candidate] + estimate(candidate);
      if (value < lowest) {
        lowest = value;
        current = candidate;
      }
    }
    if (current === destination) {
      const path: WalkPoint[] = [];
      let cell = destination;
      while (cell !== source) {
        if (cell < 0) return [];
        path.push(toWorld(cell % NX, Math.floor(cell / NX)));
        cell = prior[cell];
      }
      path.reverse();
      path.unshift(toWorld(startCell.x, startCell.z));
      path.push(goal);
      return path;
    }

    active.delete(current);
    closed.add(current);
    const currentX = current % NX;
    const currentZ = Math.floor(current / NX);
    const pointAt = (x: number, z: number) => toWorld(x, z);
    for (const [dx, dz] of offsets) {
      const x = currentX + dx;
      const z = currentZ + dz;
      if (x < 0 || x >= NX || z < 0 || z >= NZ) continue;
      const neighbour = id(x, z);
      const point = pointAt(x, z);
      if (closed.has(neighbour) || !isWalkable(point.x, point.z)) continue;
      if (dx !== 0 && dz !== 0) {
        const sideX = pointAt(currentX + dx, currentZ);
        const sideZ = pointAt(currentX, currentZ + dz);
        if (!isWalkable(sideX.x, sideX.z) || !isWalkable(sideZ.x, sideZ.z)) continue;
      }
      const next = score[current] + Math.hypot(dx, dz);
      if (next < score[neighbour]) {
        prior[neighbour] = current;
        score[neighbour] = next;
        active.add(neighbour);
      }
    }
  }

  // An unreachable point is a stop, never a straight-line shortcut through a prop.
  return [];
}
