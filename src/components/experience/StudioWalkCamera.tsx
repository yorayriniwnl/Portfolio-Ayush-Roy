"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";
import {
  WALK_EYE_HEIGHT, isWalkable, nearestWalkable, slideWalk, walkRoute,
  type WalkPoint, type WalkDirection,
} from "./StudioWalk";

const CAMERA: Record<StudioTarget, { eye: [number,number,number]; look: [number,number,number] }> = {
  work: { eye:[1.15,1.78,1.36],look:[0,1.1,-.83] },
  about: { eye:[1.12,1.5,.82],look:[.3,.88,-.36] },
  lab: { eye:[.6,1.65,.68],look:[1.92,1.5,-.4] },
  contact: { eye:[-.08,1.53,.23],look:[-1.22,1.2,1.77] },
};

export function StudioWalkCamera({ selected, introSequence, roaming, paused, walkTarget, touchDirection, onWalkStep }: {
  selected: StudioTarget;
  introSequence: number;
  roaming: boolean;
  paused: boolean;
  walkTarget: (WalkPoint & {id:number}) | null;
  touchDirection: WalkDirection | null;
  onWalkStep: (position:WalkPoint) => void;
}) {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3(...CAMERA.work.look));
  const entryTime = useRef<number | null>(null);
  const yaw = useRef(0);
  const pitch = useRef(-.2);
  const pressed = useRef(new Set<string>());
  const route = useRef<WalkPoint[]>([]);
  const dragging = useRef<{pointerId:number; x:number; y:number; total:number} | null>(null);
  const reportClock = useRef(0);
  const initialPose = useMemo(() => ({
    doorEye:new THREE.Vector3(...CAMERA.contact.eye),
    doorLook:new THREE.Vector3(...CAMERA.contact.look),
    deskEye:new THREE.Vector3(...CAMERA.work.eye),
    deskLook:new THREE.Vector3(...CAMERA.work.look),
  }), []);

  useEffect(() => { entryTime.current = roaming ? null : introSequence > 0 ? 0 : null; }, [introSequence,roaming]);

  useEffect(() => {
    const canvas=gl.domElement;
    if (!roaming) {
      pressed.current.clear();
      route.current=[];
      canvas.style.touchAction="";
      return;
    }
    const direction = camera.getWorldDirection(new THREE.Vector3());
    yaw.current=Math.atan2(-direction.x,-direction.z);
    pitch.current=THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(direction.y,-1,1)),-.65,.6);
    const start=nearestWalkable(camera.position.x,camera.position.z);
    // This mutable camera belongs to Three.js; navigation is never React layout state.
    camera.position.set(start.x,WALK_EYE_HEIGHT,start.z);
    canvas.tabIndex=0;
    canvas.style.touchAction="none";
    const acceptable=(event:KeyboardEvent) => {
      const el=document.activeElement;
      const tag=(event.target as HTMLElement | null)?.tagName?.toLowerCase();
      if(tag==="input"||tag==="textarea"||tag==="select"||(event.target as HTMLElement | null)?.isContentEditable)return false;
      if(el?.closest(".yor-studio__console"))return false;
      return Boolean(el?.closest(".yor-studio"));
    };
    const down=(event:KeyboardEvent)=>{
      const key=event.key.toLowerCase();
      if(!["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"].includes(key)||!acceptable(event))return;
      if(["arrowup","arrowdown","arrowleft","arrowright"].includes(key))event.preventDefault();
      pressed.current.add(key);
    };
    const up=(event:KeyboardEvent)=>{pressed.current.delete(event.key.toLowerCase());};
    const release=()=>{pressed.current.clear();dragging.current=null;};
    const startDrag=(event:PointerEvent)=>{
      if(event.button!==0||paused)return;
      dragging.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,total:0};
      canvas.focus({preventScroll:true});
    };
    const moveDrag=(event:PointerEvent)=>{
      const drag=dragging.current;
      if(!drag||drag.pointerId!==event.pointerId||paused)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      drag.x=event.clientX;drag.y=event.clientY;
      drag.total+=Math.abs(dx)+Math.abs(dy);
      if(drag.total<6)return; // tiny movement must remain an ordinary object click
      yaw.current-=dx*.0045;
      pitch.current=THREE.MathUtils.clamp(pitch.current-dy*.0039,-.65,.6);
      route.current=[];
    };
    const endDrag=(event:PointerEvent)=>{
      if(dragging.current?.pointerId===event.pointerId)dragging.current=null;
    };
    window.addEventListener("keydown",down);
    window.addEventListener("keyup",up);
    window.addEventListener("blur",release);
    document.addEventListener("visibilitychange",release);
    canvas.addEventListener("pointerdown",startDrag);
    window.addEventListener("pointermove",moveDrag);
    window.addEventListener("pointerup",endDrag);
    window.addEventListener("pointercancel",endDrag);
    return ()=>{
      release();
      canvas.style.touchAction="";
      window.removeEventListener("keydown",down);
      window.removeEventListener("keyup",up);
      window.removeEventListener("blur",release);
      document.removeEventListener("visibilitychange",release);
      canvas.removeEventListener("pointerdown",startDrag);
      window.removeEventListener("pointermove",moveDrag);
      window.removeEventListener("pointerup",endDrag);
      window.removeEventListener("pointercancel",endDrag);
    };
  },[camera,gl,roaming,paused]);

  useEffect(()=>{
    if(roaming && walkTarget)route.current=walkRoute({x:camera.position.x,z:camera.position.z},walkTarget);
  },[camera,roaming,walkTarget]);

  useFrame((_,delta)=>{
    const step=Math.min(delta,.05);
    if(roaming){
      if(paused)return;
      const keys=pressed.current;
      let f=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"));
      let strafe=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"));
      if(touchDirection==="forward") f++;
      if(touchDirection==="back") f--;
      if(touchDirection==="right") strafe++;
      if(touchDirection==="left") strafe--;
      const manual=f!==0||strafe!==0;
      const pos={x:camera.position.x,z:camera.position.z};
      let next=pos;
      if(manual) {
        route.current=[];
        const length=Math.hypot(f,strafe);
        const stride=(keys.has("shift")?2.35:1.55)*step;
        const dx=(-Math.sin(yaw.current)*f+Math.cos(yaw.current)*strafe)/length*stride;
        const dz=(-Math.cos(yaw.current)*f-Math.sin(yaw.current)*strafe)/length*stride;
        next=slideWalk(pos,dx,dz);
      } else if(route.current.length){
        const waypoint=route.current[0];
        const dx=waypoint.x-pos.x,dz=waypoint.z-pos.z;
        const distance=Math.hypot(dx,dz);
        if(distance<.14)route.current.shift();
        else {
          const stride=Math.min(distance,1.45*step);
          next=slideWalk(pos,dx/distance*stride,dz/distance*stride);
          const desiredYaw=Math.atan2(-dx,-dz);
          yaw.current+=Math.atan2(Math.sin(desiredYaw-yaw.current),Math.cos(desiredYaw-yaw.current))*(1-Math.exp(-4*step));
        }
      }
      camera.position.set(next.x,WALK_EYE_HEIGHT,next.z);
      const cp=Math.cos(pitch.current);
      camera.lookAt(next.x-Math.sin(yaw.current)*cp,
                    WALK_EYE_HEIGHT+Math.sin(pitch.current),
                    next.z-Math.cos(yaw.current)*cp);
      reportClock.current+=step;
      if(reportClock.current>.17) {
        reportClock.current=0;
        onWalkStep({x:next.x,z:next.z});
        gl.domElement.dataset.walkX=next.x.toFixed(3);
        gl.domElement.dataset.walkZ=next.z.toFixed(3);
        gl.domElement.dataset.walkable=String(isWalkable(next.x,next.z));
      }
      return;
    }
    if(entryTime.current!==null){
      const elapsed=entryTime.current+step;
      entryTime.current=elapsed;
      const progress=THREE.MathUtils.clamp((elapsed-.75)/3.7,0,1);
      const eased=progress*progress*(3-2*progress);
      camera.position.copy(initialPose.doorEye).lerp(initialPose.deskEye,eased);
      target.current.copy(initialPose.doorLook).lerp(initialPose.deskLook,eased);
      camera.lookAt(target.current);
      if(elapsed>=5)entryTime.current=null;
      return;
    }
    const weight=1-Math.exp(-2.4*step);
    const config=CAMERA[selected];
    camera.position.lerp(new THREE.Vector3(...config.eye),weight);
    target.current.lerp(new THREE.Vector3(...config.look),weight);
    camera.lookAt(target.current);
  });
  return null;
}
