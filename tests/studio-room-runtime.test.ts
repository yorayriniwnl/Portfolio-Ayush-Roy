import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createStudioRoom,
  identifyRoomObject,
  setStudioLights,
  StudioGreeting,
} from "../src/components/experience/studio-room-runtime";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

function gltf(scene = new THREE.Group(), animations: THREE.AnimationClip[] = []): GLTF {
  return { scene, scenes: [scene], animations, cameras: [], asset: { version: "2.0" }, parser: null as never, userData: {} };
}

function clip(name: string, duration = 1) {
  return new THREE.AnimationClip(name, duration, [
    new THREE.NumberKeyframeTrack(".position[y]", [0, duration], [0, 1]),
  ]);
}

test("studio instances clone loader-cached nodes before changing lights, fixtures or hit areas", () => {
  const worldRoot = new THREE.Group();
  const light = new THREE.PointLight("white", 1000);
  const panel = new THREE.Object3D(); panel.name = "hex_panel_1";
  const door = new THREE.Object3D(); door.name = "door-hinge";
  worldRoot.add(light, panel, door);
  const cachedWorld = gltf(worldRoot);
  const cachedResident = gltf(new THREE.Group());
  const cachedFixture = gltf(new THREE.Group());
  const cachedDetails = gltf(new THREE.Group());

  const first = createStudioRoom(cachedWorld, cachedResident, cachedFixture, cachedDetails);
  const firstLight = first.lightNodes.find(entry => entry.node.type === "PointLight")!.node;
  setStudioLights(first.lightNodes, true);
  first.door!.rotation.y = -1;
  const second = createStudioRoom(cachedWorld, cachedResident, cachedFixture, cachedDetails);
  const secondLight = second.lightNodes.find(entry => entry.node.type === "PointLight")!;

  assert.notEqual(first.group, second.group);
  assert.notEqual(firstLight, light);
  assert.notEqual(secondLight.node, firstLight);
  assert.equal(light.intensity, 1000);
  assert.equal(secondLight.intensity, 1000);
  assert.equal(second.door!.rotation.y, 0);
  assert.equal(cachedWorld.scene.getObjectByName("hex_panel_1")!.visible, true);
  assert.equal(first.group.getObjectByName("hex_panel_1")!.visible, false);
});

test("headset names do not turn the headset stand into an avatar hit target", () => {
  const root = new THREE.Group();
  const stand = new THREE.Group(); stand.name = "headset-stand";
  const headset = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
  stand.add(headset); root.add(stand);
  assert.equal(identifyRoomObject(headset, root), "monitor");
});

test("greetings move both authored rigs through the full return-to-work cycle and queue a repeated request", () => {
  const resident = new THREE.Group();
  const chair = new THREE.Group();
  const clips = ["coding_idle", "notice_visitor", "turn_to_visitor", "greeting_nod", "return_to_work"]
    .map(name => clip(name));
  const greeting = new StudioGreeting(resident, clips, chair, clips);
  assert.equal(greeting.phase, "coding_idle");
  greeting.greet();
  assert.equal(greeting.phase, "notice_visitor");
  greeting.update(0.5);
  assert.equal(resident.position.y, 0.5);
  assert.equal(chair.position.y, 0.5);
  greeting.greet();

  for (const phase of ["turn_to_visitor", "greeting_nod", "return_to_work", "notice_visitor"]) {
    greeting.update(phase === "turn_to_visitor" ? 0.5 : 1);
    assert.equal(greeting.phase, phase);
  }
  assert.equal(greeting.phase, "notice_visitor", "a repeated request is queued after the first cycle");
  for (const phase of ["turn_to_visitor", "greeting_nod", "return_to_work", "coding_idle"])
    { greeting.update(1); assert.equal(greeting.phase, phase); }
  assert.equal(greeting.phase, "coding_idle");
  assert.equal(resident.position.y, 0);
  assert.equal(chair.position.y, 0);
  greeting.dispose();
});
