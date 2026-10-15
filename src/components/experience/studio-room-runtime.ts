import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export type StudioObjectAction = "monitor" | "painting" | "blinds" | "lights" | "avatar" | "door" | "skills";

export function identifyRoomObject(object: THREE.Object3D, root: THREE.Object3D): StudioObjectAction | null {
  const names: string[] = [];
  for (let node: THREE.Object3D | null = object; node && node !== root; node = node.parent) {
    if (node.name) names.push(node.name.toLowerCase());
  }
  const id = names.join(" ");
  if (/lightbar|taskdownlight|desk.lamp/.test(id)) return "lights";
  if (/blind_slat|window_frame|window-blind/.test(id)) return "blinds";
  if (/painting|wall.art|hex_panel/.test(id)) return "painting";
  if (/door-hinge|door_leaf|door_handle|door_frame/.test(id)) return "door";
  if (/helios-pc|pc_chassis|pc_tempered_glass|pc_fan|headset/.test(id)) return "monitor";
  if (/resident|body-turn|\bhead\b|chair/.test(id)) return "avatar";
  if (/pegboard_system|controller-pegboard|research.books|shelves/.test(id)) return "skills";
  if (/monitor|keyboard|mouse_body|desk/.test(id)) return "monitor";
  return null;
}

/** Loader results belong to its cache. Only instance nodes, lights and skeletons
 * are mutable; geometry, materials, textures and animation clips stay shared. */
export function createStudioRoom(world: GLTF, resident: GLTF, fixture: GLTF, workstationDetail: GLTF) {
  const room = clone(world.scene);
  const residentRoot = clone(resident.scene);
  const fixtureRoot = clone(fixture.scene);
  const group = new THREE.Group();
  group.name = "authentic-yor-world";
  const remove: THREE.Object3D[] = [];
  room.traverse(node => { if (["chair-root", "chair", "resident"].includes(node.name)) remove.push(node); });
  for (const node of remove) node.removeFromParent();
  fixtureRoot.getObjectByName("fixture-static")?.removeFromParent();
  group.add(room, fixtureRoot, residentRoot);

  const dressing = clone(workstationDetail.scene);
  dressing.updateWorldMatrix(true, true);
  group.updateWorldMatrix(true, true);
  for (const [legacyName, sourceName] of [
    ["helios-pc", "helios-pc"], ["pegboard_system", "controller-pegboard"], ["plants", "plants_group"],
  ]) {
    const detail = dressing.getObjectByName(sourceName);
    if (!detail) continue;
    room.getObjectByName(legacyName)?.removeFromParent();
    group.attach(detail);
    detail.name = legacyName;
  }
  const lightNodes: Array<{ node: THREE.Light; intensity: number }> = [];
  group.traverse(node => {
    if (node instanceof THREE.Light) lightNodes.push({ node, intensity: node.intensity });
  });
  for (let i = 1; i <= 7; i++) {
    const oldFixture = room.getObjectByName(`hex_panel_${i}`);
    if (oldFixture) oldFixture.visible = false;
  }
  const signature = room.getObjectByName("hidden-yor-mark") ?? null;
  if (signature) signature.visible = false;
  const blinds = Array.from({ length: 12 }, (_, i) => room.getObjectByName(`blind_slat_${i + 1}`))
    .filter((node): node is THREE.Object3D => Boolean(node)).map(node => ({ node, base: node.rotation.z }));
  return { group, residentRoot, fixtureRoot, lightNodes, blinds, signature,
    door: room.getObjectByName("door-hinge") ?? null, painting: room.getObjectByName("painting-pivot") ?? null };
}

export function setStudioLights(lights: Array<{ node: THREE.Light; intensity: number }>, enabled: boolean) {
  for (const { node, intensity } of lights) node.intensity = intensity * (enabled ? .00092 : .00012);
}

const GREETING = ["notice_visitor", "turn_to_visitor", "greeting_nod", "return_to_work"] as const;

/** Both authored rigs advance on the same phase clock. Repeated requests queue
 * one further greeting, keeping interrupted clicks bounded and returning idle. */
export class StudioGreeting {
  private readonly rigs: Array<{ mixer: THREE.AnimationMixer; root: THREE.Object3D; clips: Map<string, THREE.AnimationClip> }>;
  private index = -1;
  private elapsed = 0;
  private duration = 0;
  private pending = false;
  public get phase(): string { return this.index < 0 ? "coding_idle" : GREETING[this.index]; }

  constructor(resident: THREE.Object3D, residentClips: THREE.AnimationClip[], chair: THREE.Object3D, chairClips: THREE.AnimationClip[]) {
    this.rigs = [[resident, residentClips], [chair, chairClips]].map(([root, clips]) => ({
      root: root as THREE.Object3D, mixer: new THREE.AnimationMixer(root as THREE.Object3D),
      clips: new Map((clips as THREE.AnimationClip[]).map(clip => [clip.name, clip])),
    }));
    this.play("coding_idle", true);
  }

  private play(name: string, idle = false) {
    this.duration = 0;
    this.elapsed = 0;
    for (const { mixer, clips } of this.rigs) {
      mixer.stopAllAction();
      const clip = clips.get(name) ?? clips.get("coding_idle");
      if (!clip) continue;
      const action = mixer.clipAction(clip).reset();
      action.setLoop(idle ? THREE.LoopRepeat : THREE.LoopOnce, idle ? Infinity : 1);
      action.clampWhenFinished = !idle;
      action.play();
      this.duration = Math.max(this.duration, clip.duration);
      mixer.update(0);
    }
  }

  public greet() {
    if (this.index >= 0) { this.pending = true; return; }
    this.index = 0;
    this.play(GREETING[0]);
  }

  public update(delta: number) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    let remaining = delta;
    while (remaining > 0) {
      if (this.index < 0) { for (const { mixer } of this.rigs) mixer.update(remaining); return; }
      const step = Math.min(remaining, Math.max(0, this.duration - this.elapsed));
      for (const { mixer } of this.rigs) mixer.update(step);
      remaining -= step;
      this.elapsed += step;
      if (this.elapsed < this.duration) return;
      this.index++;
      if (this.index < GREETING.length) this.play(GREETING[this.index]);
      else {
        this.index = -1;
        this.play("coding_idle", true);
        if (this.pending) { this.pending = false; this.greet(); }
      }
    }
  }

  public dispose() {
    for (const { mixer, root } of this.rigs) { mixer.stopAllAction(); mixer.uncacheRoot(root); }
    this.index = -1;
    this.pending = false;
  }
}

/** Skeleton bone textures are instance-owned; mesh buffers and materials are not. */
export function releaseStudioSkeletons(group: THREE.Object3D) {
  const skeletons = new Set<THREE.Skeleton>();
  group.traverse(node => { if (node instanceof THREE.SkinnedMesh) skeletons.add(node.skeleton); });
  for (const skeleton of skeletons) skeleton.dispose();
}
