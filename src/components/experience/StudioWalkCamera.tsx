"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  WALK_EYE_HEIGHT, nearestWalkable, slideWalk, walkRoute,
  type WalkPoint, type WalkDirection,
} from "./StudioWalk";

export function StudioWalkCamera({ roaming, paused, walkTarget, touchDirection, onWalkStep }: {
  roaming: boolean;
  paused: boolean;
  walkTarget: (WalkPoint & {id:number}) | null;
  touchDirection: WalkDirection | null;
  onWalkStep: (position:WalkPoint) => void;
}) {
  const { camera, gl, invalidate } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-.2);
  const pressed = useRef(new Set<string>());
  const route = useRef<WalkPoint[]>([]);
  const dragging = useRef<{pointerId:number; x:number; y:number; total:number} | null>(null);
  const reportClock = useRef(0);
  useEffect(() => {
    const canvas=gl.domElement;
    if (!roaming) {
      pressed.current.clear();
      route.current=[];
      return;
    }
    const direction = camera.getWorldDirection(new THREE.Vector3());
    yaw.current=Math.atan2(-direction.x,-direction.z);
    pitch.current=THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(direction.y,-1,1)),-.65,.6);
    const start=nearestWalkable(camera.position.x,camera.position.z);
    // This mutable camera belongs to Three.js; navigation is never React layout state.
    camera.position.set(start.x,WALK_EYE_HEIGHT,start.z);
    onWalkStep(start);
    const acceptable=(event:KeyboardEvent) => {
      const el=document.activeElement;
      const tag=(event.target as HTMLElement | null)?.tagName?.toLowerCase();
      if(tag==="input"||tag==="textarea"||tag==="select"||(event.target as HTMLElement | null)?.isContentEditable)return false;
      if(el?.closest(".yor-studio__console"))return false;
      return Boolean(el?.closest(".yor-studio"));
    };
    const impulse=(f:number, strafe:number)=>{
      const length=Math.hypot(f,strafe);
      if(!length)return;
      const delta=.11;
      const dx=(-Math.sin(yaw.current)*f+Math.cos(yaw.current)*strafe)/length*delta;
      const dz=(-Math.cos(yaw.current)*f-Math.sin(yaw.current)*strafe)/length*delta;
      const next=slideWalk({x:camera.position.x,z:camera.position.z},dx,dz);
      camera.position.set(next.x,WALK_EYE_HEIGHT,next.z);
      onWalkStep(next);
      route.current=[];
      invalidate();
    };
    const down=(event:KeyboardEvent)=>{
      const key=event.key.toLowerCase();
      if(!["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"].includes(key)||!acceptable(event))return;
      if(["arrowup","arrowdown","arrowleft","arrowright"].includes(key))event.preventDefault();
      if(!event.repeat&&!pressed.current.has(key)) {
        if(key==="w"||key==="arrowup")impulse(1,0);
        if(key==="s"||key==="arrowdown")impulse(-1,0);
        if(key==="d"||key==="arrowright")impulse(0,1);
        if(key==="a"||key==="arrowleft")impulse(0,-1);
      }
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
      window.removeEventListener("keydown",down);
      window.removeEventListener("keyup",up);
      window.removeEventListener("blur",release);
      document.removeEventListener("visibilitychange",release);
      canvas.removeEventListener("pointerdown",startDrag);
      window.removeEventListener("pointermove",moveDrag);
      window.removeEventListener("pointerup",endDrag);
      window.removeEventListener("pointercancel",endDrag);
    };
  },[camera,gl,roaming,paused,onWalkStep,invalidate]);

  useEffect(()=>{
    if(!roaming||paused||!touchDirection)return;
    // Give a touch press immediate feedback even before the next expensive GPU frame.
    const f=touchDirection==="forward"?1:touchDirection==="back"?-1:0;
    const strafe=touchDirection==="right"?1:touchDirection==="left"?-1:0;
    const delta=.11;
    const dx=(-Math.sin(yaw.current)*f+Math.cos(yaw.current)*strafe)*delta;
    const dz=(-Math.cos(yaw.current)*f-Math.sin(yaw.current)*strafe)*delta;
    const next=slideWalk({x:camera.position.x,z:camera.position.z},dx,dz);
    camera.position.set(next.x,WALK_EYE_HEIGHT,next.z);
    route.current=[];
    onWalkStep(next);
    invalidate();
  },[camera,invalidate,roaming,paused,touchDirection,onWalkStep]);

  useEffect(()=>{
    if(roaming && walkTarget)route.current=walkRoute({x:camera.position.x,z:camera.position.z},walkTarget);
  },[camera,roaming,walkTarget]);

  useFrame((_,delta)=>{
    const step=Math.min(delta,.085);
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
      reportClock.current+=delta;
      if(reportClock.current>.17) {
        reportClock.current=0;
        onWalkStep({x:next.x,z:next.z});

      }
      return;
    }
  });
  return null;
}
