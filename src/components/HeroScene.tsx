"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { color } from "three/tsl";
import { getScenePixelRatio, syncSceneRendererSize } from "./sceneQuality";

class SceneBoundary extends React.Component<{ children: React.ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch() { this.props.onFail(); }

  render() { return this.state.failed ? null : this.props.children; }
}

function Material({ hot = false, wire = false, transparent = false }: { hot?: boolean; wire?: boolean; transparent?: boolean }) {
  const material = useMemo(() => {
    const next = new THREE.MeshStandardNodeMaterial();
    next.colorNode = color(hot ? "#ff3040" : "#1c171b");
    next.roughness = hot ? 0.24 : 0.44;
    next.metalness = hot ? 0.58 : 0.86;
    next.wireframe = wire;
    next.transparent = transparent;
    next.opacity = transparent ? 0.36 : 1;
    next.depthWrite = !transparent;
    return next;
  }, [hot, transparent, wire]);

  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

function Dust() {
  const geometry = useMemo(() => {
    const pseudo = (seed: number) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };
    const values = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      const radius = 1.45 + pseudo(i + 1) * 2.3;
      const angle = pseudo(i + 421) * Math.PI * 2;
      values[i * 3] = Math.cos(angle) * radius;
      values[i * 3 + 1] = (pseudo(i + 841) - 0.5) * 3.8;
      values[i * 3 + 2] = Math.sin(angle) * radius - 0.4;
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
    return next;
  }, []);
  const material = useMemo(() => new THREE.PointsMaterial({ color: "#ff7780", size: 0.018, transparent: true, opacity: 0.68, depthWrite: false }), []);
  const group = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.025;
  });

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <points ref={group} geometry={geometry} material={material} />;
}

function Core({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!root.current || !rings.current || reduced) return;
    const targetX = THREE.MathUtils.clamp(-state.pointer.y * 0.12, -0.12, 0.12);
    const targetY = THREE.MathUtils.clamp(state.pointer.x * 0.16, -0.16, 0.16);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 4, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 4, delta);
    root.current.rotation.z += delta * 0.07;
    rings.current.rotation.z -= delta * 0.12;
    rings.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={root}>
      <mesh scale={1.02}>
        <icosahedronGeometry args={[0.9, 4]} />
        <Material hot transparent />
      </mesh>
      <mesh scale={1.03}>
        <icosahedronGeometry args={[0.92, 2]} />
        <Material hot wire />
      </mesh>
      <group ref={rings}>
        <mesh rotation={[Math.PI / 2.6, 0.1, 0.1]}>
          <torusGeometry args={[1.22, 0.018, 12, 128]} />
          <Material hot />
        </mesh>
        <mesh rotation={[0.2, Math.PI / 2.1, 0.6]}>
          <torusGeometry args={[1.42, 0.009, 10, 128]} />
          <Material hot />
        </mesh>
        <mesh rotation={[0.5, 0.8, Math.PI / 2.3]}>
          <torusGeometry args={[1.7, 0.006, 8, 128]} />
          <Material hot transparent />
        </mesh>
      </group>
      <mesh position={[0.48, 0.62, 0.48]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <Material hot />
      </mesh>
      <pointLight position={[0.2, 0.3, 1.8]} intensity={26} color="#ff3040" distance={5} />
      <pointLight position={[-1.8, -0.6, 0.8]} intensity={8} color="#7d111d" distance={4} />
    </group>
  );
}

function ScenePoster() {
  return <div className="scene-poster" aria-hidden="true"><span className="poster-halo" /><span className="poster-ring poster-ring-one" /><span className="poster-ring poster-ring-two" /><span className="poster-core" /><span className="poster-crosshair" /></div>;
}

export function HeroScene({ showPoster = true }: { showPoster?: boolean } = {}) {
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const forceWebGL = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("renderer") === "webgl";

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motionOverride = new URLSearchParams(location.search).get("motion") === "on";
    const update = () => setReduced(!motionOverride && media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  if (reduced || failed) {
    return <div className="scene-host">{showPoster && <ScenePoster />}<span className="scene-status">{failed ? "Static fallback · renderer unavailable" : "Static composition · reduced motion"}</span></div>;
  }

  return (
    <div className="scene-host">
      {showPoster && <ScenePoster />}
      <SceneBoundary onFail={() => setFailed(true)}>
        <Canvas camera={{ position: [0, 0, 5.1], fov: 42 }} dpr={[1, 1.5]} frameloop={pageVisible ? "always" : "never"} gl={async (props) => {
          try {
            const renderer = new THREE.WebGPURenderer({ canvas: props.canvas as HTMLCanvasElement, antialias: true, alpha: true, forceWebGL });
            renderer.setPixelRatio(getScenePixelRatio(1.5));
            await renderer.init();
            syncSceneRendererSize(renderer, props.canvas as HTMLCanvasElement);
            setReady(true);
            return renderer;
          } catch (error) {
            setFailed(true);
            throw error;
          }
        }}>
          <Dust />
          <ambientLight intensity={0.1} />
          <Core reduced={reduced} />
        </Canvas>
      </SceneBoundary>
      <span className="scene-status">{!pageVisible ? "Scene paused · tab hidden" : ready ? (forceWebGL ? "WebGL 2 / test path" : "WebGPU / live") : "Warming the core"}</span>
    </div>
  );
}
