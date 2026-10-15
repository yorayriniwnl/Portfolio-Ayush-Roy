"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioCameraPreset } from "./studio-room-runtime";
import type { StudioTarget } from "./StudioScene";
import {
  WALK_EYE_HEIGHT,
  nearestWalkable,
  slideWalk,
  walkRoute,
  type WalkDirection,
  type WalkPoint,
  type WalkPose,
} from "./StudioWalk";

const CAMERA: Record<StudioTarget, { eye: [number, number, number]; look: [number, number, number] }> = {
  work: { eye: [-0.82, 1.72, 1.5], look: [0.04, 1.3, -1.23] },
  about: { eye: [1.12, 1.5, 0.82], look: [0.3, 0.88, -0.36] },
  lab: { eye: [0.6, 1.65, 0.68], look: [1.92, 1.5, -0.4] },
  contact: { eye: [-0.08, 1.53, 0.23], look: [-1.22, 1.2, 1.77] },
};

export function StudioWalkCamera({
  selected,
  introSequence,
  desktopCamera,
  roaming,
  paused,
  walkTarget,
  touchDirection,
  onWalkStep,
  onIntroComplete,
}: {
  selected: StudioTarget;
  introSequence: number;
  desktopCamera: StudioCameraPreset | null;
  roaming: boolean;
  paused: boolean;
  walkTarget: (WalkPoint & { id: number }) | null;
  touchDirection: WalkDirection | null;
  onWalkStep: (pose: WalkPose) => void;
  onIntroComplete: () => void;
}) {
  const { camera, gl, size, invalidate } = useThree();
  const target = useRef(new THREE.Vector3(...CAMERA.work.look));
  const entryTime = useRef<number | null>(null);
  const yaw = useRef(0);
  const pitch = useRef(-0.2);
  const pressed = useRef(new Set<string>());
  const route = useRef<WalkPoint[]>([]);
  const dragging = useRef<{ pointerId: number; x: number; y: number; distance: number } | null>(null);
  const reportClock = useRef(0);
  const movementTimer = useRef<number | null>(null);
  const movementTimestamp = useRef(0);
  const touchDirectionRef = useRef<WalkDirection | null>(touchDirection);
  const modeRef = useRef({ roaming, paused });
  const portrait = size.width < 800;
  const doorEye = useMemo(() => new THREE.Vector3(...CAMERA.contact.eye), []);
  const doorLook = useMemo(() => new THREE.Vector3(...CAMERA.contact.look), []);
  const deskEye = useMemo(() => new THREE.Vector3(...CAMERA.work.eye), []);
  const deskLook = useMemo(() => new THREE.Vector3(...CAMERA.work.look), []);
  const portraitDeskEye = useMemo(() => new THREE.Vector3(-0.42, 1.65, 1.85), []);
  const portraitDeskLook = useMemo(() => new THREE.Vector3(0.2, 1.26, -1.18), []);
  const authoredDesktopTarget = useMemo(
    () => desktopCamera?.position.clone().addScaledVector(desktopCamera.direction, 4) ?? deskLook.clone(),
    [desktopCamera, deskLook],
  );
  const reportPose = useCallback(
    () => onWalkStep({ x: camera.position.x, z: camera.position.z, yaw: yaw.current, pitch: pitch.current }),
    [camera, onWalkStep],
  );
  const movementStep = useCallback(() => {
    movementTimer.current = null;
    if (!modeRef.current.roaming || modeRef.current.paused) {
      movementTimestamp.current = 0;
      return;
    }

    const timestamp = performance.now();
    const step = movementTimestamp.current
      ? Math.min((timestamp - movementTimestamp.current) / 1000, 0.085)
      : 1 / 60;
    movementTimestamp.current = timestamp;
    const keys = pressed.current;
    let forward = Number(keys.has("w") || keys.has("arrowup")) - Number(keys.has("s") || keys.has("arrowdown"));
    let strafe = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    const direction = touchDirectionRef.current;
    if (direction === "forward") forward++;
    if (direction === "back") forward--;
    if (direction === "right") strafe++;
    if (direction === "left") strafe--;
    const manual = forward !== 0 || strafe !== 0;
    const position = { x: camera.position.x, z: camera.position.z };
    let next = position;

    if (manual) {
      route.current = [];
      const length = Math.hypot(forward, strafe);
      const stride = (keys.has("shift") ? 2.35 : 1.55) * step;
      const dx = (-Math.sin(yaw.current) * forward + Math.cos(yaw.current) * strafe) / length * stride;
      const dz = (-Math.cos(yaw.current) * forward - Math.sin(yaw.current) * strafe) / length * stride;
      next = slideWalk(position, dx, dz);
    } else if (route.current.length > 0) {
      const waypoint = route.current[0];
      const dx = waypoint.x - position.x;
      const dz = waypoint.z - position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.14) route.current.shift();
      else {
        const stride = Math.min(distance, 1.45 * step);
        next = slideWalk(position, dx / distance * stride, dz / distance * stride);
        const desiredYaw = Math.atan2(-dx, -dz);
        yaw.current += Math.atan2(Math.sin(desiredYaw - yaw.current), Math.cos(desiredYaw - yaw.current)) * (1 - Math.exp(-4 * step));
      }
    }

    if (!manual && route.current.length === 0) {
      movementTimestamp.current = 0;
      return;
    }
    camera.position.set(next.x, WALK_EYE_HEIGHT, next.z);
    camera.lookAt(
      next.x - Math.sin(yaw.current) * Math.cos(pitch.current),
      WALK_EYE_HEIGHT + Math.sin(pitch.current),
      next.z - Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    reportClock.current += step;
    if (reportClock.current > 0.17) {
      reportClock.current = 0;
      reportPose();
    }
    invalidate();
    movementTimer.current = window.setTimeout(movementStep, 16);
  }, [camera, invalidate, reportPose]);
  const scheduleMovement = useCallback(() => {
    if (!modeRef.current.roaming || modeRef.current.paused || movementTimer.current !== null) return;
    movementTimestamp.current = 0;
    movementTimer.current = window.setTimeout(movementStep, 0);
  }, [movementStep]);
  const cancelMovement = useCallback(() => {
    if (movementTimer.current !== null) window.clearTimeout(movementTimer.current);
    movementTimer.current = null;
    movementTimestamp.current = 0;
  }, []);

  useEffect(() => {
    entryTime.current = roaming ? null : introSequence > 0 ? 0 : null;
  }, [introSequence, roaming]);

  useEffect(() => {
    modeRef.current = { roaming, paused };
    if (!roaming || paused) cancelMovement();
    else if (route.current.length > 0 || touchDirection) scheduleMovement();
  }, [cancelMovement, paused, roaming, scheduleMovement, touchDirection]);

  useEffect(() => {
    touchDirectionRef.current = touchDirection;
    if (touchDirection) scheduleMovement();
  }, [scheduleMovement, touchDirection]);

  // Enter walking at the current cinematic viewpoint and keep the loader-owned
  // GLB camera/scene objects immutable.
  useEffect(() => {
    if (!roaming) {
      pressed.current.clear();
      route.current = [];
      dragging.current = null;
      return;
    }
    const direction = camera.getWorldDirection(new THREE.Vector3());
    yaw.current = Math.atan2(-direction.x, -direction.z);
    pitch.current = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1)), -0.65, 0.6);
    const start = nearestWalkable(camera.position.x, camera.position.z);
    camera.position.set(start.x, WALK_EYE_HEIGHT, start.z);
    camera.lookAt(
      start.x - Math.sin(yaw.current) * Math.cos(pitch.current),
      WALK_EYE_HEIGHT + Math.sin(pitch.current),
      start.z - Math.cos(yaw.current) * Math.cos(pitch.current),
    );
    reportPose();
    invalidate();
  }, [camera, invalidate, reportPose, roaming]);

  useEffect(() => {
    const canvas = gl.domElement;
    const release = () => {
      pressed.current.clear();
      dragging.current = null;
      route.current = [];
      cancelMovement();
    };
    if (!roaming || paused) {
      release();
      return;
    }

    const acceptable = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement | null;
      const activeElement = document.activeElement;
      const tag = targetElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || targetElement?.isContentEditable) return false;
      if (activeElement?.closest(".yor-studio__console")) return false;
      return Boolean(activeElement?.closest(".yor-studio"));
    };
    const down = (event: KeyboardEvent) => {
      if (paused || !acceptable(event)) return;
      const key = event.key.toLowerCase();
      if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(key)) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) event.preventDefault();
      if (!event.repeat && !pressed.current.has(key)) {
        pressed.current.add(key);
        scheduleMovement();
      }
    };
    const up = (event: KeyboardEvent) => pressed.current.delete(event.key.toLowerCase());
    const startDrag = (event: PointerEvent) => {
      if (event.button !== 0 || paused) return;
      dragging.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
      canvas.focus({ preventScroll: true });
    };
    const moveDrag = (event: PointerEvent) => {
      const drag = dragging.current;
      if (!drag || drag.pointerId !== event.pointerId || paused) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.distance += Math.abs(dx) + Math.abs(dy);
      if (drag.distance < 6) return;
      yaw.current -= dx * 0.0045;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0039, -0.65, 0.6);
      route.current = [];
      reportPose();
      invalidate();
    };
    const endDrag = (event: PointerEvent) => {
      if (dragging.current?.pointerId === event.pointerId) dragging.current = null;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    canvas.addEventListener("pointerdown", startDrag);
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      release();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
      canvas.removeEventListener("pointerdown", startDrag);
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [camera, cancelMovement, gl, paused, reportPose, roaming, scheduleMovement]);

  useEffect(() => {
    if (!roaming || !walkTarget) return;
    route.current = walkRoute({ x: camera.position.x, z: camera.position.z }, walkTarget);
    scheduleMovement();
  }, [camera, roaming, scheduleMovement, walkTarget]);

  // React Three Fiber owns this mutable camera and updates it inside useFrame.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.085);
    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = portrait ? 64 : desktopCamera?.fov ?? 55;
      if (camera.fov !== fov) {
        // eslint-disable-next-line react-hooks/immutability
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }

    if (roaming) return;

    if (entryTime.current !== null) {
      const elapsed = entryTime.current + step;
      entryTime.current = elapsed;
      const progress = THREE.MathUtils.clamp((elapsed - 0.75) / 3.7, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.copy(doorEye).lerp(portrait ? portraitDeskEye : desktopCamera?.position ?? deskEye, eased);
      target.current.copy(doorLook).lerp(portrait ? portraitDeskLook : authoredDesktopTarget, eased);
      camera.lookAt(target.current);
      if (elapsed >= 5) {
        entryTime.current = null;
        onIntroComplete();
      }
      return;
    }

    const weight = 1 - Math.exp(-2.4 * step);
    const config = CAMERA[selected];
    const homeEye = portrait ? portraitDeskEye : desktopCamera?.position ?? deskEye;
    const homeLook = portrait ? portraitDeskLook : authoredDesktopTarget;
    camera.position.lerp(selected === "work" ? homeEye : new THREE.Vector3(...config.eye), weight);
    target.current.lerp(selected === "work" ? homeLook : new THREE.Vector3(...config.look), weight);
    camera.lookAt(target.current);
  });

  return null;
}
