"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";

/* Genuine, authored YOR WORLD scene, chair and animated resident, transplanted
 * from the connected Yor-World production assets. No CSS 3D substitution. */
const CAMERA: Record<StudioTarget, { eye: [number,number,number]; look: [number,number,number] }> = {
  work: { eye: [1.15,1.78,1.36], look: [0,1.1,-.83] },
  about: { eye: [1.12,1.5,.82], look: [.3,.88,-.36] },
  lab: { eye: [.6,1.65,.68], look: [1.92,1.5,-.4] },
  contact: { eye: [-.08,1.53,.23], look: [-1.22,1.2,1.77] },
};

function WorldCamera({ selected }: { selected: StudioTarget }) {
  const target = useRef(new THREE.Vector3(...CAMERA.work.look));
  const { camera } = useThree();
  useFrame((_, delta) => {
    const weight = 1 - Math.exp(-2.4 * Math.min(delta,.05));
    const config = CAMERA[selected];
    camera.position.lerp(new THREE.Vector3(...config.eye),weight);
    target.current.lerp(new THREE.Vector3(...config.look),weight);
    camera.lookAt(target.current);
  });
  return null;
}

function AuthenticYorRoom({ onSelect, onToggleLights, selected, lightsOn, onReady }: {
  onSelect: (target:StudioTarget)=>void;
  onToggleLights:()=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  onReady:()=>void;
}) {
  const [world, resident, fixture] = useLoader(GLTFLoader, [
    "/models/yor-world-room.glb",
    "/models/yor-world-resident.glb",
    "/models/yor-world-fixture.glb",
  ]);
  const { group, avatarMixer, chairMixer, actions, door, lightNodes } = useMemo(() => {
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
    return {group:model,avatarMixer:am,chairMixer:cm,actions:anims,door,lightNodes};
  },[world,resident,fixture]);

  // Three.js scene objects are inherently mutable. Keep that mutation behind
  // a ref so React memoized values stay read-only in effects and frame hooks.
  const mutable = useRef<{ door: THREE.Object3D | null; lights: Array<{ node:THREE.Light; intensity:number }> } | null>(null);
  useEffect(() => {
    mutable.current = { door, lights: lightNodes };
    return () => { mutable.current = null; };
  }, [door, lightNodes]);

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
    avatarMixer.update(Math.min(delta,.06));
    chairMixer.update(Math.min(delta,.06));
    const pivot = mutable.current?.door;
    // The external Three.js scene owns this mutable transform, not React state.
    // eslint-disable-next-line react-hooks/immutability
    if (pivot) pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, selected==="contact" ? -1.05 : 0,2.8,Math.min(delta,.06));
  });

  useEffect(() => {
    for (const {node,intensity} of mutable.current?.lights ?? [])
      // Imported GPU lights must be mutated imperatively to dim without remount.
      // eslint-disable-next-line react-hooks/immutability
      node.intensity = intensity * (lightsOn ? .0025 : .00022);
  },[lightsOn,lightNodes]);

  const choose = (event:ThreeEvent<MouseEvent>) => {
    let current:THREE.Object3D | null=event.object;
    const names:string[]=[];
    while(current && current!==group){names.push(current.name.toLowerCase());current=current.parent;}
    const id=names.join(" ");
    const target =
      /lightbar|taskdownlight|desk.lamp/.test(id) ? "lights" :
      /monitor|keyboard|mouse_body|desk/.test(id) ? "work" :
      /resident|body-turn|head|chair/.test(id) ? "about" :
      /painting|hex_panel|pegboard|shelf/.test(id) ? "lab" :
      /door-hinge|door_leaf|door_handle|door_frame/.test(id) ? "contact" : null;
    if(!target)return;
    event.stopPropagation();
    if(target==="lights")onToggleLights();
    else onSelect(target);
  };
  return (
    <>
      <color attach="background" args={["#bbbcd8"]}/>
      <ambientLight intensity={.24} color="#f9f6ff"/>
      <hemisphereLight args={["#eceaff","#9ca8c9",.3]}/>
      <directionalLight position={[4,7,5]} intensity={.4} color="#f9f5ff"/>
      <WorldCamera selected={selected}/>
      <primitive object={group} onClick={choose}
        onPointerOver={(e:ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor="pointer"; }}
        onPointerOut={() => { document.body.style.cursor=""; }}/>
    </>
  );
}

export function YorWorldShowcaseScene({ onSelect, onToggleLights, selected, lightsOn, onReady }: {
  onSelect:(target:StudioTarget)=>void;
  onToggleLights:()=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  onReady:()=>void;
}) {
  useEffect(() => () => { document.body.style.cursor=""; },[]);
  return (
    <Canvas camera={{position:[1.15,1.78,1.36],fov:54,near:.08,far:30}}
      dpr={[1,1.5]} gl={{antialias:true,powerPreference:"high-performance"}}
      onCreated={({gl})=>{ gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=.85; }}
      aria-label="Authentic interactive YOR World gaming studio with desk, resident, light panels, door and workstation">
      <Suspense fallback={null}>
        <AuthenticYorRoom onSelect={onSelect} onToggleLights={onToggleLights}
          selected={selected} lightsOn={lightsOn} onReady={onReady}/>
      </Suspense>
    </Canvas>
  );
}
