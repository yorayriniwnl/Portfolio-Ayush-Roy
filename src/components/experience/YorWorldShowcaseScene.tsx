"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";

export type StudioObjectAction = "monitor" | "painting" | "blinds" | "lights" | "avatar" | "door" | "skills";
function identifyRoomObject(object: THREE.Object3D, root: THREE.Object3D): StudioObjectAction | null {
  const names: string[] = [];
  let node: THREE.Object3D | null = object;
  while (node && node !== root) {
    if (node.name) names.push(node.name.toLowerCase());
    node = node.parent;
  }
  const id = names.join(" ");
  if (/lightbar|taskdownlight|desk.lamp/.test(id)) return "lights";
  if (/blind_slat|window_frame|window-blind/.test(id)) return "blinds";
  if (/painting|wall.art|hex_panel/.test(id)) return "painting";
  if (/door-hinge|door_leaf|door_handle|door_frame/.test(id)) return "door";
  if (/resident|body-turn|head|chair/.test(id)) return "avatar";
  if (/pegboard_system|research.books|shelves/.test(id)) return "skills";
  if (/monitor|keyboard|mouse_body|desk/.test(id)) return "monitor";
  return null;
}

/* Genuine, authored YOR WORLD scene, chair and animated resident, transplanted
 * from the connected Yor-World production assets. No CSS 3D substitution. */
const CAMERA: Record<StudioTarget, { eye: [number,number,number]; look: [number,number,number] }> = {
  work: { eye: [1.15,1.78,1.36], look: [0,1.1,-.83] },
  about: { eye: [1.12,1.5,.82], look: [.3,.88,-.36] },
  lab: { eye: [.6,1.65,.68], look: [1.92,1.5,-.4] },
  contact: { eye: [-.08,1.53,.23], look: [-1.22,1.2,1.77] },
};

function WorldCamera({ selected, introSequence }: { selected: StudioTarget; introSequence: number }) {
  const target = useRef(new THREE.Vector3(...CAMERA.work.look));
  const entryTime = useRef<number | null>(null);
  const { camera } = useThree();
  const doorEye = useMemo(() => new THREE.Vector3(...CAMERA.contact.eye), []);
  const doorLook = useMemo(() => new THREE.Vector3(...CAMERA.contact.look), []);
  const deskEye = useMemo(() => new THREE.Vector3(...CAMERA.work.eye), []);
  const deskLook = useMemo(() => new THREE.Vector3(...CAMERA.work.look), []);
  useEffect(() => { entryTime.current = introSequence > 0 ? 0 : null; }, [introSequence]);
  useFrame((_, delta) => {
    if (entryTime.current !== null) {
      const elapsed = entryTime.current + Math.min(delta,.06);
      entryTime.current = elapsed;
      const progress = THREE.MathUtils.clamp((elapsed - .75) / 3.7, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.copy(doorEye).lerp(deskEye,eased);
      target.current.copy(doorLook).lerp(deskLook,eased);
      camera.lookAt(target.current);
      if (elapsed >= 5) entryTime.current = null;
      return;
    }
    const weight = 1 - Math.exp(-2.4 * Math.min(delta,.05));
    const config = CAMERA[selected];
    camera.position.lerp(new THREE.Vector3(...config.eye),weight);
    target.current.lerp(new THREE.Vector3(...config.look),weight);
    camera.lookAt(target.current);
  });
  return null;
}

function AuthenticYorRoom({ onSelect, onInteract, onHover, onToggleLights, selected, lightsOn, blindsOpen, paintingBeat, introSequence, onReady }: {
  onSelect: (target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  onReady:()=>void;
}) {
  const [world, resident, fixture] = useLoader(GLTFLoader, [
    "/models/yor-world-room.glb",
    "/models/yor-world-resident.glb",
    "/models/yor-world-fixture.glb",
  ]);
  const { group, avatarMixer, chairMixer, actions, door, lightNodes, painting, blinds, signature } = useMemo(() => {
    const model = new THREE.Group();
    model.name = "authentic-yor-world";
    const room = world.scene;
    const w1Remove: THREE.Object3D[] = [];
    room.traverse((node) => {
      if (["chair-root","chair","resident"].includes(node.name)) w1Remove.push(node);
    });
    for (const node of w1Remove) node.parent?.remove(node);
    const toRemove = fixture.scene.getObjectByName("fixture-static");
    if (toRemove) toRemove.parent?.remove(toRemove);
    model.add(room,fixture.scene,resident.scene);
    const am = new THREE.AnimationMixer(resident.scene);
    const cm = new THREE.AnimationMixer(fixture.scene);
    const anims = new Map(resident.animations.map(clip => [clip.name, am.clipAction(clip)]));
    const lightNodes: Array<{ node:THREE.Light; intensity:number }> = [];
    model.traverse(node => {
      if ((node as THREE.Light).isLight) {
        const light = node as THREE.Light;
        lightNodes.push({node:light,intensity:light.intensity});
      }
    });
    const door = room.getObjectByName("door-hinge") || null;
    const painting = room.getObjectByName("painting-pivot") || null;
    const blinds = Array.from({ length: 12 },(_,index) => room.getObjectByName(`blind_slat_${index+1}`))
      .filter((node): node is THREE.Object3D => Boolean(node))
      .map(node => ({node, base: node.rotation.z}));
    const signature = room.getObjectByName("hidden-yor-mark") || null;
    if (signature) signature.visible = false;
    return {group:model,avatarMixer:am,chairMixer:cm,actions:anims,door,lightNodes,painting,blinds,signature};
  },[world,resident,fixture]);

  const entryTime = useRef<number | null>(null);
  const entryGreeted = useRef(false);
  const paintingImpulse = useRef(0);
  useEffect(() => {
    entryTime.current = introSequence > 0 ? 0 : null;
    entryGreeted.current = false;
  }, [introSequence]);

  useEffect(() => { if (paintingBeat > 0) paintingImpulse.current = THREE.MathUtils.degToRad(6); },[paintingBeat]);

  // Three.js scene objects are inherently mutable. Keep that mutation behind
  // a ref so React memoized values stay read-only in effects and frame hooks.
  const mutable = useRef<{ door: THREE.Object3D | null; lights: Array<{ node:THREE.Light; intensity:number }>; painting: THREE.Object3D | null; paintingBase:number; blinds: Array<{node:THREE.Object3D;base:number}>; signature:THREE.Object3D | null } | null>(null);
  useEffect(() => {
    mutable.current = { door, lights: lightNodes, painting, paintingBase:painting?.rotation.x ?? 0, blinds, signature };
    return () => { mutable.current = null; };
  }, [door, lightNodes, painting, blinds, signature]);

  useEffect(() => {
    actions.get("coding_idle")?.reset().play();
    const chairIdle = fixture.animations.find(clip=>clip.name==="coding_idle");
    const action = chairIdle && chairMixer.clipAction(chairIdle);
    action?.reset().play();
    onReady();
    return () => { avatarMixer.stopAllAction(); chairMixer.stopAllAction(); };
  },[actions,avatarMixer,chairMixer,fixture,onReady]);

  useEffect(() => {
    if (selected !== "about") return;
    const greeting = actions.get("turn_to_visitor");
    if (!greeting) return;
    greeting.reset();
    greeting.setLoop(THREE.LoopOnce,1);
    greeting.clampWhenFinished = true;
    greeting.play();
    return () => { greeting.stop(); };
  },[selected,actions]);

  useFrame((_,delta) => {
    const step = Math.min(delta,.06);
    avatarMixer.update(step);
    chairMixer.update(step);
    if (entryTime.current !== null) {
      entryTime.current += step;
      // Greeting is a real animation from the user's authored GLB rig.
      if (entryTime.current > 2.75 && !entryGreeted.current) {
        entryGreeted.current = true;
        const greeting = actions.get("turn_to_visitor");
        greeting?.reset();
        greeting?.setLoop(THREE.LoopOnce,1);
        if (greeting) greeting.clampWhenFinished = false;
        greeting?.fadeIn(.35).play();
      }
      if (entryTime.current > 5.1) {
        actions.get("turn_to_visitor")?.fadeOut(.65);
        entryTime.current = null;
      }
    }
    const props = mutable.current;
    if (props) {
      for (const blind of props.blinds) {
        const angle = blind.base + (blindsOpen ? 0 : Math.PI / 2);
        blind.node.rotation.z = THREE.MathUtils.damp(blind.node.rotation.z, angle, 5, step);
      }
      if (props.painting) {
        const impulse = paintingImpulse.current;
        props.painting.rotation.x = props.paintingBase + impulse;
        paintingImpulse.current = THREE.MathUtils.damp(impulse, 0, 6, step);
        if (Math.abs(paintingImpulse.current) < .0002) paintingImpulse.current = 0;
      }
      if (props.signature) props.signature.visible = paintingBeat > 0;
    }
    const pivot = props?.door;
    const doorwayOpening = entryTime.current !== null && entryTime.current < 1.8;
    // The external Three.js scene owns this mutable transform, not React state.
    // eslint-disable-next-line react-hooks/immutability
    if (pivot) pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, selected==="contact" || doorwayOpening ? -1.05 : 0,2.8,step);
  });

  useEffect(() => {
    for (const {node,intensity} of mutable.current?.lights ?? [])
      // Imported GPU lights must be mutated imperatively to dim without remount.
      // eslint-disable-next-line react-hooks/immutability
      node.intensity = intensity * (lightsOn ? .0025 : .00022);
  },[lightsOn,lightNodes]);

  const choose = (event:ThreeEvent<MouseEvent>) => {
    const target = identifyRoomObject(event.object,group);
    if (!target) return;
    event.stopPropagation();
    if (target === "lights") onToggleLights();
    else if (target === "avatar") onSelect("about");
    else if (target === "door") onSelect("contact");
    else if (target === "skills") onSelect("lab");
    else onInteract(target);
  };
  const hover = (event:ThreeEvent<PointerEvent>) => {
    const target = identifyRoomObject(event.object,group);
    document.body.style.cursor = target ? "pointer" : "";
    onHover(target);
  };
  return (
    <>
      <color attach="background" args={["#bbbcd8"]}/>
      <ambientLight intensity={.24} color="#f9f6ff"/>
      <hemisphereLight args={["#eceaff","#9ca8c9",.3]}/>
      <directionalLight position={[4,7,5]} intensity={.4} color="#f9f5ff"/>
      <WorldCamera selected={selected} introSequence={introSequence}/>
      <primitive object={group} onClick={choose}
        onPointerOver={hover}
        onPointerOut={() => { document.body.style.cursor=""; onHover(null); }}/>
    </>
  );
}

export function YorWorldShowcaseScene({ onSelect, onInteract, onHover, onToggleLights, selected, lightsOn, blindsOpen, paintingBeat, introSequence, onReady }: {
  onSelect:(target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  onReady:()=>void;
}) {
  useEffect(() => () => { document.body.style.cursor=""; },[]);
  return (
    <Canvas camera={{position:[1.15,1.78,1.36],fov:54,near:.08,far:30}}
      dpr={[1,1.5]} gl={{antialias:true,powerPreference:"high-performance"}}
      onCreated={({gl})=>{ gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=.85; }}
      aria-label="Authentic interactive YOR World gaming studio with desk, resident, light panels, door and workstation">
      <Suspense fallback={null}>
        <AuthenticYorRoom onSelect={onSelect} onInteract={onInteract} onHover={onHover} onToggleLights={onToggleLights}
          selected={selected} lightsOn={lightsOn} blindsOpen={blindsOpen}
          paintingBeat={paintingBeat} introSequence={introSequence} onReady={onReady}/>
      </Suspense>
    </Canvas>
  );
}
