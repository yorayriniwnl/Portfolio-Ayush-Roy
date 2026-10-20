/**
 * Small, deterministic walkmesh for the authored 4.2m x 3.6m room.
 * The player is a first-person camera, never allowed into furniture or walls.
 * Coordinate system is metres, Y up; desk is against the negative-Z wall.
 */
export type WalkPoint = { x: number; z: number };
export type WalkDirection = "forward" | "back" | "left" | "right";
export const WALK_BOUNDS = { minX: -1.83, maxX: 1.83, minZ: -1.48, maxZ: 1.48 } as const;
export const WALK_EYE_HEIGHT = 1.58;
const STEP = 0.16;
const NX = Math.floor((WALK_BOUNDS.maxX - WALK_BOUNDS.minX) / STEP) + 1;
const NZ = Math.floor((WALK_BOUNDS.maxZ - WALK_BOUNDS.minZ) / STEP) + 1;

export function isWalkable(x: number, z: number): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const {minX,maxX,minZ,maxZ}=WALK_BOUNDS;
  if (x < minX || x > maxX || z < minZ || z > maxZ) return false;
  // Desk, under-desk cabinets and seated character/chair: padded footprints.
  if (z < -0.64 && Math.abs(x) < 1.48) return false;
  if ((x - .3) ** 2 + (z + .36) ** 2 < .46 ** 2) return false;
  return true;
}
export function nearestWalkable(x: number, z: number): WalkPoint {
  const base = {
    x: Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, Number.isFinite(x) ? x : 0)),
    z: Math.max(WALK_BOUNDS.minZ, Math.min(WALK_BOUNDS.maxZ, Number.isFinite(z) ? z : .9)),
  };
  if (isWalkable(base.x,base.z)) return base;
  // Find closest open point rather than teleporting through the desk.
  let found: WalkPoint = {x: 0,z: .9}, best=Infinity;
  for (let ix=0; ix<NX; ix++) for (let iz=0; iz<NZ; iz++) {
    const p={x:WALK_BOUNDS.minX+ix*STEP,z:WALK_BOUNDS.minZ+iz*STEP};
    if (!isWalkable(p.x,p.z)) continue;
    const d=(p.x-base.x)**2+(p.z-base.z)**2;
    if (d<best){best=d;found=p;}
  }
  return found;
}
export function slideWalk(position: WalkPoint, dx: number, dz: number): WalkPoint {
  // Reject invalid displacements instead of corrupting the Three.js camera.
  const start = isWalkable(position.x,position.z)
    ? position : nearestWalkable(position.x,position.z);
  if (!Number.isFinite(dx) || !Number.isFinite(dz)) return start;
  // Axis-separated resolution prevents pushing through the chair at diagonal angles.
  position = start;
  const x=position.x+dx,z=position.z+dz;
  if(isWalkable(x,z)) return {x,z};
  if(isWalkable(x,position.z)) return {x,z:position.z};
  if(isWalkable(position.x,z)) return {x:position.x,z};
  return position;
}
const toWorld = (ix:number,iz:number):WalkPoint =>
  ({x:WALK_BOUNDS.minX+ix*STEP,z:WALK_BOUNDS.minZ+iz*STEP});

// The room is not an exact multiple of STEP. Rounding directly at its walls
// can produce NX/NZ (out-of-bounds) or a blocked desk/chair cell. Always
// select the closest valid navigation cell instead.
const toCell = (p:WalkPoint) => {
  let bestX=0, bestZ=0, bestDistance=Infinity;
  for (let iz=0; iz<NZ; iz++) for (let ix=0; ix<NX; ix++) {
    const candidate=toWorld(ix,iz);
    if (!isWalkable(candidate.x,candidate.z)) continue;
    const distance=(candidate.x-p.x)**2+(candidate.z-p.z)**2;
    if (distance<bestDistance) {
      bestX=ix;bestZ=iz;bestDistance=distance;
    }
  }
  return {x:bestX,z:bestZ};
};
export function walkRoute(start:WalkPoint, requested:WalkPoint):WalkPoint[] {
  const goal=nearestWalkable(requested.x,requested.z);
  const origin=nearestWalkable(start.x,start.z);
  const startCell=toCell(origin), goalCell=toCell(goal);
  const id=(x:number,z:number)=>z*NX+x;
  const source=id(startCell.x,startCell.z), dest=id(goalCell.x,goalCell.z);
  if (source===dest) return [goal];
  const total=NX*NZ, score=new Float64Array(total).fill(Infinity);
  const prior=new Int32Array(total).fill(-1);
  const active=new Set<number>([source]), closed=new Set<number>();
  score[source]=0;
  const estimate=(index:number) => {
    const ix=index%NX, iz=Math.floor(index/NX);
    return Math.hypot(ix-goalCell.x,iz-goalCell.z);
  };
  const offsets=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  for(let n=0;n<total && active.size;n++){
    let current=-1, lowest=Infinity;
    for(const candidate of active) {
      const value=score[candidate]+estimate(candidate);
      if(value<lowest){lowest=value;current=candidate;}
    }
    if(current===dest) {
      const path:WalkPoint[]=[];
      let c=dest;
      while(c!==source && c!==-1) {
        path.push(toWorld(c%NX,Math.floor(c/NX)));
        c=prior[c];
      }
      path.reverse();
      // Retain last user-selected ground position, not just grid-cell centre.
      path.push(goal);
      return path;
    }
    active.delete(current); closed.add(current);
    const cx=current%NX,cz=Math.floor(current/NX);
    for(const [dx,dz] of offsets){
      const x=cx+dx,z=cz+dz;
      if(x<0||x>=NX||z<0||z>=NZ)continue;
      const neighbour=id(x,z);
      if(closed.has(neighbour)||!isWalkable(toWorld(x,z).x,toWorld(x,z).z))continue;
      // No corner cutting across furniture.
      if(dx&&dz&&(!isWalkable(toWorld(cx+dx,cz).x,toWorld(cx+dx,cz).z) ||
                  !isWalkable(toWorld(cx,cz+dz).x,toWorld(cx,cz+dz).z)))continue;
      const next=score[current]+Math.hypot(dx,dz);
      if(next<score[neighbour]){
        prior[neighbour]=current;score[neighbour]=next;active.add(neighbour);
      }
    }
  }
  // An unreachable target must not turn into a wall-crossing direct route.
  return [];
}
