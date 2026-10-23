"use client";

/* eslint-disable react-hooks/immutability -- Three.js owns mutable camera, scene and GPU objects outside React state. */

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { getStudioCamera, STUDIO_LIMITS } from "./studio-camera";
import { getScenePixelRatio } from "../sceneQuality";

const MODEL_URLS = ["/models/yor-night-study.glb", "/models/yor-operator.glb", "/models/yor-husky.glb"];

export function clearStudioAssetCache() {
  useLoader.clear(GLTFLoader, MODEL_URLS);
}

function softwareRendering(renderer: THREE.WebGLRenderer) {
  const context = renderer.getContext();
  const extension = context.getExtension("WEBGL_debug_renderer_info");
  return Boolean(extension && /swiftshader|llvmpipe|software rasterizer/i.test(String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL))));
}

export type StudioCameraReading = { x: number; y: number; z: number; distance: number };

export type YorWorldShowcaseSceneProps = {
  lightsOn: boolean;
  paused: boolean;
  resetSequence: number;
  onReady: () => void;
  onCameraChange?: (camera: StudioCameraReading) => void;
  onError?: () => void;
};

/** Owns the camera only during input/reset. No click handlers or navigation. */
function CameraControls({ resetSequence, onCameraChange }: Pick<YorWorldShowcaseSceneProps, "resetSequence" | "onCameraChange">) {
  const { camera, gl, size, invalidate } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const notify = useRef(onCameraChange);
  useEffect(() => { notify.current = onCameraChange; }, [onCameraChange]);

  useEffect(() => {
    const canvas = gl.domElement;
    const orbit = new OrbitControls(camera, canvas);
    orbit.enablePan = false;
    orbit.enableDamping = false;
    orbit.rotateSpeed = 0.65;
    orbit.zoomSpeed = 0.65;
    Object.assign(orbit, STUDIO_LIMITS);
    orbit.touches.ONE = THREE.TOUCH.ROTATE;
    orbit.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.current = orbit;

    const report = () => {
      notify.current?.({
        x: camera.position.x, y: camera.position.y, z: camera.position.z,
        distance: camera.position.distanceTo(orbit.target),
      });
      invalidate();
    };
    const focus = () => canvas.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"].includes(event.key)) return;
      event.preventDefault();
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
      if (event.key === "ArrowLeft") spherical.theta -= 0.09;
      if (event.key === "ArrowRight") spherical.theta += 0.09;
      if (event.key === "ArrowUp") spherical.phi -= 0.06;
      if (event.key === "ArrowDown") spherical.phi += 0.06;
      if (event.key === "+" || event.key === "=") spherical.radius *= 0.9;
      if (event.key === "-" || event.key === "_") spherical.radius /= 0.9;
      spherical.theta = THREE.MathUtils.clamp(spherical.theta, STUDIO_LIMITS.minAzimuthAngle, STUDIO_LIMITS.maxAzimuthAngle);
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, STUDIO_LIMITS.minPolarAngle, STUDIO_LIMITS.maxPolarAngle);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius, STUDIO_LIMITS.minDistance, STUDIO_LIMITS.maxDistance);
      camera.position.copy(new THREE.Vector3().setFromSpherical(spherical)).add(orbit.target);
      orbit.update();
      report();
    };
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "3D masked operator and husky in a red-lit study. Drag or use arrow keys to rotate; scroll, pinch or use plus and minus to zoom.");
    canvas.addEventListener("pointerdown", focus);
    canvas.addEventListener("keydown", onKey);
    orbit.addEventListener("change", report);
    return () => {
      orbit.removeEventListener("change", report);
      canvas.removeEventListener("pointerdown", focus);
      canvas.removeEventListener("keydown", onKey);
      orbit.dispose();
      controls.current = null;
    };
  }, [camera, gl, invalidate]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const framing = getStudioCamera(size.width / Math.max(size.height, 1));
    camera.position.set(...framing.eye);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = framing.fov;
      camera.updateProjectionMatrix();
    }
    orbit.target.set(...framing.target);
    orbit.update();
    orbit.saveState();
    invalidate();
  }, [camera, invalidate, resetSequence, size.width, size.height]);

  return null;
}

function MaterialsAndBloom({ onReady }: Pick<YorWorldShowcaseSceneProps, "onReady">) {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);
  const reportedReady = useRef(false);
  const simpleRendering = size.width <= 760 || softwareRendering(gl);

  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04);
    const previousEnvironment = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.18;
    room.dispose();
    generator.dispose();

    // Small/mobile and software GPUs retain the same geometry and materials
    // while avoiding the extra HDR render targets and bloom passes.
    let effects: EffectComposer | null = null;
    let bloom: UnrealBloomPass | null = null;
    let output: OutputPass | null = null;
    if (!simpleRendering) {
      const target = new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        samples: Math.min(4, gl.capabilities.maxSamples),
      });
      effects = new EffectComposer(gl, target);
      bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.24, 0.45, 1.15);
      output = new OutputPass();
      effects.addPass(new RenderPass(scene, camera));
      effects.addPass(bloom);
      effects.addPass(output);
      composer.current = effects;
      effects.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    }

    return () => {
      composer.current = null;
      scene.environment = previousEnvironment;
      environment.dispose();
      bloom?.dispose();
      output?.dispose();
      effects?.dispose();
    };
  }, [gl, scene, camera, simpleRendering]);

  useEffect(() => { composer.current?.setSize(size.width, size.height); }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (composer.current) composer.current.render(delta);
    else gl.render(scene, camera);
    const host = gl.domElement.closest<HTMLElement>(".yor-studio");
    if (host) host.dataset.renderedFrames = String(Number(host.dataset.renderedFrames || 0) + 1);
    if (!reportedReady.current) {
      reportedReady.current = true;
      onReady();
    }
  }, 1);

  return null;
}

function NightStudy({ paused, lightsOn }: Pick<YorWorldShowcaseSceneProps, "paused" | "lightsOn">) {
  const [study, operator, husky] = useLoader(GLTFLoader, MODEL_URLS);
  // Loader resources stay cached; each viewer owns independent transforms.
  const models = useMemo(() => ({
    study: study.scene.clone(true),
    operator: operator.scene.clone(true),
    husky: husky.scene.clone(true),
  }), [study, operator, husky]);
  const motion = useMemo(() => {
    const head = models.operator.getObjectByName("operator-head");
    const dogHead = models.husky.getObjectByName("husky-head");
    const tail = models.husky.getObjectByName("husky-tail");
    return {
      head, dogHead, tail,
      headYaw: head?.rotation.y ?? 0,
      dogYaw: dogHead?.rotation.y ?? 0,
      dogTilt: dogHead?.rotation.z ?? 0,
      tailYaw: tail?.rotation.y ?? 0,
    };
  }, [models]);
  const body = useRef<THREE.Group>(null);
  const companion = useRef<THREE.Group>(null);
  const lightTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 1.05, 0);
    return target;
  }, []);
  const elapsed = useRef(0);
  useEffect(() => {
    for (const asset of Object.values(models)) {
      asset.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
      });
    }
  }, [models]);

  useFrame((_, delta) => {
    if (paused) return;
    elapsed.current += Math.min(delta, 0.05);
    const t = elapsed.current;
    // Small movements retain the reference's seated portrait pose.
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 1.45) * 0.0025;
    if (companion.current) companion.current.scale.y = 1 + Math.sin(t * 1.9 + 1) * 0.003;
    if (motion.head) motion.head.rotation.y = motion.headYaw + Math.sin(t * 0.38) * 0.018;
    if (motion.dogHead) {
      motion.dogHead.rotation.y = motion.dogYaw + Math.sin(t * 0.43 + 1) * 0.035;
      motion.dogHead.rotation.z = motion.dogTilt + Math.sin(t * 0.62) * 0.012;
    }
    if (motion.tail) motion.tail.rotation.y = motion.tailYaw + Math.sin(t * 1.8) * 0.075;
  });

  return (
    <>
      <color attach="background" args={["#09080a"]} />
      <fog attach="fog" args={["#09080a", 8, 20]} />
      <ambientLight intensity={0.12} color="#c1b7bd" />
      <hemisphereLight args={["#a8b1cb", "#21120f", 0.15]} />
      <primitive object={lightTarget} />
      <spotLight position={[-1.4, 2.8, 2.3]} target={lightTarget} color="#f7cfac" intensity={lightsOn ? 22 : 7}
        angle={0.6} penumbra={0.9} distance={10} decay={2} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.025} />
      <spotLight position={[2.1, 2.4, 2]} target={lightTarget} color="#b9c2dc" intensity={lightsOn ? 9 : 3}
        angle={0.7} penumbra={1} distance={8} decay={2} />
      <pointLight position={[-2.4, 2.3, -1.2]} color="#ff2926" intensity={lightsOn ? 5 : 2} distance={7} decay={2} />
      <pointLight position={[2.1, 2.6, -1.5]} color="#ff1a24" intensity={lightsOn ? 4 : 1.5} distance={7} decay={2} />
      <primitive object={models.study} dispose={null} />
      <group ref={body}><primitive object={models.operator} dispose={null} /></group>
      <group ref={companion}><primitive object={models.husky} dispose={null} /></group>
    </>
  );
}

function ContextHealth({ onError }: Pick<YorWorldShowcaseSceneProps, "onError">) {
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const failed = (event: Event) => { event.preventDefault(); onError?.(); };
    canvas.addEventListener("webglcontextlost", failed);
    return () => canvas.removeEventListener("webglcontextlost", failed);
  }, [canvas, onError]);
  return null;
}

export function YorWorldShowcaseScene({ lightsOn, paused, resetSequence, onReady, onCameraChange, onError }: YorWorldShowcaseSceneProps) {
  return (
    <Canvas camera={{ position: [0.2, 1.77, 4.75], fov: 42, near: 0.1, far: 35 }}
      frameloop={paused ? "demand" : "always"} dpr={[1, getScenePixelRatio(1.5)]} shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}>
      <CameraControls resetSequence={resetSequence} onCameraChange={onCameraChange} />
      <ContextHealth onError={onError} />
      <Suspense fallback={null}>
        <NightStudy lightsOn={lightsOn} paused={paused} />
        <MaterialsAndBloom onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
