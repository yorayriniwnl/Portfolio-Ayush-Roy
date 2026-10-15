"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";
import { StudioReferenceDressing } from "./StudioReferenceDressing";
import { StudioDeskProps } from "./StudioDeskProps";
import { StudioWalkCamera } from "./StudioWalkCamera";
import type { WalkDirection, WalkPoint, WalkPose } from "./StudioWalk";

import { createStudioRoom, identifyRoomObject, releaseStudioSkeletons, setStudioLights, StudioGreeting } from "./studio-room-runtime";
import type { StudioObjectAction } from "./studio-room-runtime";
export type { StudioObjectAction } from "./studio-room-runtime";

/* Genuine, authored YOR WORLD scene, chair and animated resident, transplanted
 * from the connected Yor-World production assets. No CSS 3D substitution. */

/** Twelve modeled wall-light replacements above the authored workstation
 * positions. Basic shaded faces keep their individual pink/violet colors visible
 * instead of tone-mapping the upstream 5.7x emissive panels into white blocks. */
const HEX_LIGHTS = [
  [-.57,2.38,"#dfaeff"],[-.285,2.38,"#e9bfff"],[0,2.38,"#d7a7fb"],[.285,2.38,"#e4b1f9"],[.57,2.38,"#c7b7ff"],
  [-.427,2.14,"#caafff"],[-.142,2.14,"#f1b5ee"],[.143,2.14,"#c9abfd"],[.428,2.14,"#f3b3e9"],
  [-.285,1.90,"#d1b4fe"],[0,1.90,"#edb3f5"],[.285,1.90,"#b0adff"],
] as const;
function StudioHexLights({ lightsOn, onExplore }: { lightsOn:boolean; onExplore:()=>void }) {
  const geometry = useMemo(() => {
    const outline = new THREE.Shape();
    for(let i=0;i<6;i++) {
      const angle=Math.PI/2 + i*Math.PI/3;
      const x=Math.cos(angle)*.153, y=Math.sin(angle)*.153;
      if(i===0) outline.moveTo(x,y); else outline.lineTo(x,y);
    }
    outline.closePath();
    const face = new THREE.Shape();
    for(let i=0;i<6;i++) {
      const angle=Math.PI/2 + i*Math.PI/3;
      const x=Math.cos(angle)*.136, y=Math.sin(angle)*.136;
      if(i===0) face.moveTo(x,y); else face.lineTo(x,y);
    }
    face.closePath();
    return {rim:new THREE.ShapeGeometry(outline), core:new THREE.ShapeGeometry(face)};
  }, []);
  useEffect(() => () => { geometry.rim.dispose(); geometry.core.dispose(); }, [geometry]);
  return (
    <group position={[0,0,-1.708]} onClick={e=>{e.stopPropagation();onExplore();}}>
      {HEX_LIGHTS.map(([x,y,color],i) =>
        <group key={i} position={[x,y,0]}>
          <mesh position={[0,0,-.003]}>
            <circleGeometry args={[.19,32]}/>
            <meshBasicMaterial color={color} transparent opacity={lightsOn ? .105 : .025}
              blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/>
          </mesh>
          <mesh geometry={geometry.rim}>
            <meshBasicMaterial color={lightsOn ? "#f7e3ff" : "#696178"} toneMapped={false}/>
          </mesh>
          <mesh geometry={geometry.core} position={[0,0,.008]}>
            <meshBasicMaterial color={lightsOn ? color : "#322b4b"} toneMapped={false}/>
          </mesh>
        </group>
      )}
    </group>
  );
}

function AuthenticYorRoom({ onSelect, onInteract, onHover, onToggleLights, onWalkTo, onWalkStep, selected, lightsOn, blindsOpen, paintingBeat, introSequence, greetingSequence, onIntroComplete, onReady, roaming, paused, walkTarget, touchDirection }: {
  onSelect: (target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  onWalkTo:(point:WalkPoint)=>void;
  onWalkStep:(pose:WalkPose)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  greetingSequence:number;
  onIntroComplete:()=>void;
  onReady:()=>void;
  roaming:boolean;
  paused:boolean;
  walkTarget:(WalkPoint & { id:number }) | null;
  touchDirection:WalkDirection | null;
}) {
  const [world, resident, fixture, workstationDetail] = useLoader(GLTFLoader, [
    "/models/yor-world-room.glb",
    "/models/yor-world-resident.glb",
    "/models/yor-world-fixture.glb",
    "/models/yor-world-workstation-details.glb",
  ]);
  const { group, residentRoot, fixtureRoot, door, lightNodes, painting, blinds, signature, desktopCamera } = useMemo(
    () => createStudioRoom(world, resident, fixture, workstationDetail),
    [world, resident, fixture, workstationDetail],
  );
  const greeting = useRef<StudioGreeting | null>(null);

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
    const controller = new StudioGreeting(residentRoot, resident.animations, fixtureRoot, fixture.animations);
    greeting.current = controller;
    onReady();
    return () => {
      greeting.current = null;
      controller.dispose();
      releaseStudioSkeletons(group);
    };
  }, [residentRoot, resident, fixtureRoot, fixture, group, onReady]);

  useEffect(() => {
    if (greetingSequence > 0) greeting.current?.greet();
  }, [greetingSequence]);

  useFrame((_,delta) => {
    const step = Math.min(delta,.06);
    greeting.current?.update(step);
    if (entryTime.current !== null) {
      entryTime.current += step;
      // Greeting is a real animation from the user's authored GLB rig.
      if (entryTime.current > 2.75 && !entryGreeted.current) {
        entryGreeted.current = true;
        greeting.current?.greet();
      }
      if (entryTime.current > 5.1) {
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

  useEffect(() => { setStudioLights(lightNodes, lightsOn); }, [lightsOn, lightNodes]);

  const choose = (event:ThreeEvent<MouseEvent>) => {
    if (event.delta > 7) return;
    const target = identifyRoomObject(event.object,group);
    if (!target) {
      const point = new THREE.Vector3();
      if (event.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), point)) {
        (event.nativeEvent.target as HTMLElement).focus?.({ preventScroll: true });
        onWalkTo({ x: point.x, z: point.z });
      }
      return;
    }
    event.stopPropagation();
    if (target === "lights") onToggleLights();
    else if (target === "avatar") onInteract("avatar");
    else if (target === "door") {
      if (roaming) onInteract("door");
      else onSelect("contact");
    } else if (target === "skills") {
      if (roaming) onInteract("skills");
      else onSelect("lab");
    }
    else onInteract(target);
  };
  const routeFromFloor = (event:ThreeEvent<MouseEvent>) => {
    if (event.delta > 7) return;
    event.stopPropagation();
    (event.nativeEvent.target as HTMLElement).focus?.({ preventScroll: true });
    onWalkTo({ x: event.point.x, z: event.point.z });
  };
  const hover = (event:ThreeEvent<PointerEvent>) => {
    const target = identifyRoomObject(event.object,group);
    document.body.style.cursor = target ? "pointer" : "";
    onHover(target);
  };
  return (
    <>
      <color attach="background" args={["#b5bad7"]}/>
      <ambientLight intensity={.49} color="#f1efff"/>
      <hemisphereLight args={["#fff2ff","#5e729e",.48]}/>
      <directionalLight position={[4,7,5]} intensity={.62} color="#fff8ff"/>
      {/* Concerted violet/cyan practicals bring the authored RGB workstation to
          life without the overexposed white patch caused by the original lights. */}
      <pointLight position={[0,2.05,-1.5]} color="#c881ff" intensity={lightsOn ? 2.2 : .14} distance={3.1} decay={2}/>
      <pointLight position={[-1.4,.72,-.65]} color="#50daff" intensity={lightsOn ? 3.0 : .2} distance={3.7} decay={2}/>
      <pointLight position={[1.35,1.98,.06]} color="#ffb5df" intensity={lightsOn ? 2.4 : .14} distance={3.4} decay={2}/>
      <StudioWalkCamera selected={selected} introSequence={introSequence} desktopCamera={desktopCamera}
        roaming={roaming} paused={paused} walkTarget={walkTarget} touchDirection={touchDirection}
        onWalkStep={onWalkStep} onIntroComplete={onIntroComplete}/>
      <StudioHexLights lightsOn={lightsOn} onExplore={() => onSelect("lab")}/>
      <StudioReferenceDressing lightsOn={lightsOn} onOpenComputer={() => onInteract("monitor")} onExplore={() => onSelect("lab")}/>
      <StudioDeskProps onOpen={() => onInteract("monitor")}/>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} onClick={routeFromFloor}>
        <planeGeometry args={[3.9, 3.35]}/>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide}/>
      </mesh>
      <primitive object={group} dispose={null} onClick={choose}
        onPointerOver={hover}
        onPointerOut={() => { document.body.style.cursor=""; onHover(null); }}/>
    </>
  );
}

function StudioCanvasLifecycle({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const contextLost = (event: Event) => { event.preventDefault(); onError(); };
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => canvas.removeEventListener("webglcontextlost", contextLost);
  }, [gl, onError]);
  return null;
}

export function YorWorldShowcaseScene({ onSelect, onInteract, onHover, onToggleLights, onWalkTo, onWalkStep, selected, lightsOn, blindsOpen, paintingBeat, introSequence, greetingSequence, onIntroComplete, onReady, active, onError, roaming, paused, walkTarget, touchDirection }: {
  onSelect:(target:StudioTarget)=>void;
  onToggleLights:()=>void;
  onInteract:(action:StudioObjectAction)=>void;
  onHover:(action:StudioObjectAction | null)=>void;
  onWalkTo:(point:WalkPoint)=>void;
  onWalkStep:(pose:WalkPose)=>void;
  selected:StudioTarget;
  lightsOn:boolean;
  blindsOpen:boolean;
  paintingBeat:number;
  introSequence:number;
  greetingSequence:number;
  onIntroComplete:()=>void;
  onReady:()=>void;
  active:boolean;
  onError:()=>void;
  roaming:boolean;
  paused:boolean;
  walkTarget:(WalkPoint & { id:number }) | null;
  touchDirection:WalkDirection | null;
}) {
  useEffect(() => () => { document.body.style.cursor=""; },[]);
  return (
    <Canvas frameloop={active ? "always" : "never"} camera={{position:[-0.82,1.72,1.50],fov:55,near:.08,far:30}}
      dpr={[1,1.5]} gl={{antialias:true,powerPreference:"high-performance"}}
      onCreated={({gl})=>{ gl.domElement.tabIndex=0; gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=.95; }}
      aria-label={roaming ? "Free-roam YOR studio. Use WASD, arrow keys or the directional pad to walk; drag to look. Escape returns to the selected camera." : "Authentic interactive YOR World gaming studio with desk, resident, light panels, door and workstation"}>
      <StudioCanvasLifecycle onError={onError}/>
      <Suspense fallback={null}>
        <AuthenticYorRoom onSelect={onSelect} onInteract={onInteract} onHover={onHover} onToggleLights={onToggleLights}
          onWalkTo={onWalkTo} onWalkStep={onWalkStep}
          selected={selected} lightsOn={lightsOn} blindsOpen={blindsOpen}
          paintingBeat={paintingBeat} introSequence={introSequence} greetingSequence={greetingSequence}
          onIntroComplete={onIntroComplete} onReady={onReady} roaming={roaming} paused={paused}
          walkTarget={walkTarget} touchDirection={touchDirection}/>
      </Suspense>
    </Canvas>
  );
}
