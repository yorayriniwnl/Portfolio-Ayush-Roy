"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";
import { StudioWalkCamera } from "./StudioWalkCamera";
import type { WalkPoint, WalkDirection } from "./StudioWalk";

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

/* Original YOR WORLD GLBs are preserved; camera direction and safe walkmesh
 * live in StudioWalkCamera, not in the imported model hierarchy. */
function AuthenticYorRoom({ onSelect, onInteract, onHover, onToggleLights, onWalkTo, onWalkStep, selected, lightsOn, blindsOpen, paintingBeat, introSequence, roaming, paused, walkTarget, touchDirection, onReady }: {
  onSelect: (target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  onWalkTo:(point:WalkPoint)=>void;
  onWalkStep:(point:WalkPoint)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  roaming:boolean;
  paused:boolean;
  walkTarget:(WalkPoint & {id:number}) | null;
  touchDirection:WalkDirection | null;
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
        // Imported GLB transform is intentionally animated imperatively in the frame loop.
        // eslint-disable-next-line react-hooks/immutability
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
    if (pivot) pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, selected==="contact" || doorwayOpening ? -1.05 : 0,2.8,step);
  });

  useEffect(() => {
    for (const {node,intensity} of mutable.current?.lights ?? [])
      // Imported GPU lights must be mutated imperatively to dim without remount.
      // eslint-disable-next-line react-hooks/immutability
      node.intensity = intensity * (lightsOn ? .0025 : .00022);
  },[lightsOn,lightNodes]);

  const choose = (event:ThreeEvent<MouseEvent>) => {
    if (event.delta > 7) return;
    const target = identifyRoomObject(event.object,group);
    if (!target) {
      const point=new THREE.Vector3();
      if(event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),point)) {
        (event.nativeEvent.target as HTMLElement)?.focus?.({preventScroll:true});
        onWalkTo({x:point.x,z:point.z});
      }
      return;
    }
    event.stopPropagation();
    if (target === "lights") onToggleLights();
    else if (target === "avatar") roaming ? onInteract("avatar") : onSelect("about");
    else if (target === "door") roaming ? onInteract("door") : onSelect("contact");
    else if (target === "skills") roaming ? onInteract("skills") : onSelect("lab");
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
      <StudioWalkCamera selected={selected} introSequence={introSequence}
        roaming={roaming} paused={paused} walkTarget={walkTarget}
        touchDirection={touchDirection} onWalkStep={onWalkStep}/>
      {/* Invisible ground hit surface. Room meshes remain clickable above it. */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.008,0]}
        onClick={(event:ThreeEvent<MouseEvent>) => {
          if(event.delta>7)return;
          event.stopPropagation();
          (event.nativeEvent.target as HTMLElement)?.focus?.({preventScroll:true});
          onWalkTo({x:event.point.x,z:event.point.z});
        }}>
        <planeGeometry args={[3.9,3.35]}/>
        <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
      </mesh>
      <primitive object={group} onClick={choose}
        onPointerOver={hover}
        onPointerOut={() => { document.body.style.cursor=""; onHover(null); }}/>
    </>
  );
}

export function YorWorldShowcaseScene({ onSelect, onInteract, onHover, onToggleLights, onWalkTo, onWalkStep, selected, lightsOn, blindsOpen, paintingBeat, introSequence, roaming, paused, walkTarget, touchDirection, onReady }: {
  onSelect:(target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  onWalkTo:(point:WalkPoint)=>void;
  onWalkStep:(point:WalkPoint)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  roaming:boolean;
  paused:boolean;
  walkTarget:(WalkPoint & {id:number}) | null;
  touchDirection:WalkDirection | null;
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
          onWalkTo={onWalkTo} onWalkStep={onWalkStep}
          selected={selected} lightsOn={lightsOn} blindsOpen={blindsOpen}
          paintingBeat={paintingBeat} introSequence={introSequence}
          roaming={roaming} paused={paused} walkTarget={walkTarget} touchDirection={touchDirection} onReady={onReady}/>
      </Suspense>
    </Canvas>
  );
}
