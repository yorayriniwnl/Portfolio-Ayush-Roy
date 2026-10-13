"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { StudioTarget } from "./StudioScene";
import { StudioReferenceDressing } from "./StudioReferenceDressing";
import { StudioDeskProps } from "./StudioDeskProps";

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
  if (/pegboard_system|controller-pegboard|research.books|shelves/.test(id)) return "skills";
  if (/helios-pc|pc_chassis|pc_tempered_glass|pc_fan|headset/.test(id)) return "monitor";
  if (/monitor|keyboard|mouse_body|desk/.test(id)) return "monitor";
  return null;
}

/* Genuine, authored YOR WORLD scene, chair and animated resident, transplanted
 * from the connected Yor-World production assets. No CSS 3D substitution. */
const CAMERA: Record<StudioTarget, { eye: [number,number,number]; look: [number,number,number] }> = {
  work: { eye: [-1.95,2.10,1.55], look: [0.22,0.90,-1.15] },
  about: { eye: [1.12,1.5,.82], look: [.3,.88,-.36] },
  lab: { eye: [.6,1.65,.68], look: [1.92,1.5,-.4] },
  contact: { eye: [-.08,1.53,.23], look: [-1.22,1.2,1.77] },
};

function WorldCamera({ selected, introSequence }: { selected: StudioTarget; introSequence: number }) {
  const target = useRef(new THREE.Vector3(...CAMERA.work.look));
  const entryTime = useRef<number | null>(null);
  const { camera, size } = useThree();
  const portrait = size.width < 800;
  const doorEye = useMemo(() => new THREE.Vector3(...CAMERA.contact.eye), []);
  const doorLook = useMemo(() => new THREE.Vector3(...CAMERA.contact.look), []);
  // Move toward the reference-facing station so the PC is visible to the right of the chair.
  const deskEye = useMemo(() => new THREE.Vector3(...CAMERA.work.eye), []);
  const deskLook = useMemo(() => new THREE.Vector3(...CAMERA.work.look), []);
  const portraitDeskEye = useMemo(() => new THREE.Vector3(-.42,1.65,1.85), []);
  const portraitDeskLook = useMemo(() => new THREE.Vector3(.20,1.26,-1.18), []);
  useEffect(() => { entryTime.current = introSequence > 0 ? 0 : null; }, [introSequence]);
  // Mutable Three.js cameras live outside React state, as does the scene rig below.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((_, delta) => {
    // Increase portrait horizontal coverage without moving the actual models.
    // Wide camera crops the chair on 390px phones; a wider portrait lens does not.
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = portrait ? 64 : 55;
      if (camera.fov !== targetFov) {
        // eslint-disable-next-line react-hooks/immutability
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
    }
    if (entryTime.current !== null) {
      const elapsed = entryTime.current + Math.min(delta,.06);
      entryTime.current = elapsed;
      const progress = THREE.MathUtils.clamp((elapsed - .75) / 3.7, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.copy(doorEye).lerp(portrait ? portraitDeskEye : deskEye,eased);
      target.current.copy(doorLook).lerp(portrait ? portraitDeskLook : deskLook,eased);
      camera.lookAt(target.current);
      if (elapsed >= 5) entryTime.current = null;
      return;
    }
    const weight = 1 - Math.exp(-2.4 * Math.min(delta,.05));
    const config = CAMERA[selected];
    camera.position.lerp(portrait && selected === "work" ? portraitDeskEye : new THREE.Vector3(...config.eye),weight);
    target.current.lerp(portrait && selected === "work" ? portraitDeskLook : new THREE.Vector3(...config.look),weight);
    camera.lookAt(target.current);
  });
  return null;
}

/** Seven modeled wall-light replacements in the original authored fixture
 * positions. Basic shaded faces keep their individual pink/violet colors visible
 * instead of tone-mapping the upstream 5.7x emissive panels into white blocks. */
const HEX_LIGHTS = [
  [-.57,2.23,"#f69cff"],[-.285,2.23,"#ffb0f2"],[0,2.23,"#e494ff"],[.285,2.23,"#ff9de7"],[.57,2.23,"#ca9cff"],
  [-.427,1.99,"#d49cff"],[-.142,1.99,"#ff8bf2"],[.143,1.99,"#ce91ff"],[.428,1.99,"#ff9bdf"],
  [-.285,1.75,"#df9aff"],[0,1.75,"#ff9beb"],[.285,1.75,"#a99cff"],
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
    return {
      rim:new THREE.ExtrudeGeometry(outline,{depth:.016,bevelEnabled:true,bevelSegments:2,steps:1,bevelThickness:.004,bevelSize:.003}),
      core:new THREE.ExtrudeGeometry(face,{depth:.012,bevelEnabled:true,bevelSegments:2,steps:1,bevelThickness:.003,bevelSize:.002}),
    };
  }, []);
  useEffect(() => () => { geometry.rim.dispose(); geometry.core.dispose(); }, [geometry]);
  return (
    <group position={[0,0,-1.708]} onClick={e=>{e.stopPropagation();onExplore();}}>
      {HEX_LIGHTS.map(([x,y,color],i) =>
        <group key={i} position={[x,y,0]}>
          <mesh position={[0,0,-.003]}>
            <circleGeometry args={[.205,32]}/>
            <meshBasicMaterial color={color} transparent opacity={lightsOn ? .19 : .025}
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

function createCarpetTexture() {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  let state = 0x7a31c9;
  for (let index = 0; index < pixels.length; index += 4) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const grain = ((state >>> 25) & 15) - 7;
    const fleck = ((state >>> 22) & 0x3ff) === 0 ? 12 : 0;
    pixels[index] = THREE.MathUtils.clamp(31 + grain + fleck, 0, 255);
    pixels[index + 1] = THREE.MathUtils.clamp(43 + grain + fleck, 0, 255);
    pixels[index + 2] = THREE.MathUtils.clamp(105 + grain * 2 + fleck, 0, 255);
    pixels[index + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5,5);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

type AuthoredCameraPose = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  fov: number;
};

type AuthoredEmissive = {
  material: THREE.MeshStandardMaterial;
  lit: number;
  dim: number;
};

type AuthoredLight = { light: THREE.Light; intensity: number };

function ReferenceGamingChair({ onSelect, onHover }: {
  onSelect: (target: StudioTarget) => void;
  onHover: (action: StudioObjectAction | null) => void;
}) {
  const geometry = useMemo(() => ({
    shell: new RoundedBoxGeometry(.72,1.20,.15,.12,5),
    back: new RoundedBoxGeometry(.50,.94,.105,.12,5),
    backWing: new RoundedBoxGeometry(.105,.78,.13,.05,4),
    headrestShell: new RoundedBoxGeometry(.47,.31,.14,.11,5),
    headrest: new RoundedBoxGeometry(.37,.23,.09,.085,5),
    headrestPatch: new RoundedBoxGeometry(.19,.15,.035,.06,4),
    lumbar: new RoundedBoxGeometry(.44,.22,.12,.09,5),
    seatShell: new RoundedBoxGeometry(.75,.18,.59,.095,5),
    seat: new RoundedBoxGeometry(.63,.17,.51,.09,5),
    seatWing: new RoundedBoxGeometry(.14,.19,.48,.065,4),
    seam: new RoundedBoxGeometry(.014,.61,.012,.006,3),
    armStem: new RoundedBoxGeometry(.075,.35,.09,.035,4),
    armPad: new RoundedBoxGeometry(.29,.09,.16,.045,5),
    armCap: new RoundedBoxGeometry(.18,.035,.11,.017,4),
    baseBeam: new RoundedBoxGeometry(.80,.065,.10,.032,4),
  }), []);
  const leftPiping = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.285,.91,.177),
    new THREE.Vector3(-.292,1.13,.177),
    new THREE.Vector3(-.292,1.52,.177),
    new THREE.Vector3(-.25,1.74,.15),
  ]), []);
  const rightPiping = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(.285,.91,.177),
    new THREE.Vector3(.292,1.13,.177),
    new THREE.Vector3(.292,1.52,.177),
    new THREE.Vector3(.25,1.74,.15),
  ]), []);
  const pipeGeometries = useMemo(() => ({
    left: new THREE.TubeGeometry(leftPiping,24,.009,7,false),
    right: new THREE.TubeGeometry(rightPiping,24,.009,7,false),
  }), [leftPiping,rightPiping]);
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect("about");
  };
  const handleHover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover("avatar");
  };
  const handlePointerOut = () => {
    document.body.style.cursor = "";
    onHover(null);
  };

  return (
    <group name="reference-gaming-chair" position={[.72,0,-.18]} rotation={[0,-.10,0]} scale={[.84,.62,.74]}
      onClick={handleClick} onPointerOver={handleHover} onPointerOut={handlePointerOut}>
      {/* White outer shell and the sculpted blue cushions face the camera. */}
      <mesh geometry={geometry.shell} position={[0,1.32,-.015]} castShadow>
        <meshStandardMaterial color="#f6f5ff" roughness={.31}/>
      </mesh>
      <mesh geometry={geometry.back} position={[0,1.34,.075]} castShadow>
        <meshStandardMaterial color="#275bc7" roughness={.35}/>
      </mesh>
      {[-1,1].map(side => (
        <mesh key={`back-wing-${side}`} geometry={geometry.backWing}
          position={[side*.275,1.34,.105]} rotation={[0,0,side*-.045]} castShadow>
          <meshStandardMaterial color={side < 0 ? "#3474e7" : "#194caf"} roughness={.34}/>
        </mesh>
      ))}
      <mesh geometry={geometry.headrestShell} position={[0,1.79,.065]} castShadow>
        <meshStandardMaterial color="#f7f6ff" roughness={.3}/>
      </mesh>
      <mesh geometry={geometry.headrest} position={[0,1.80,.15]} castShadow>
        <meshStandardMaterial color="#3177ec" roughness={.33}/>
      </mesh>
      <mesh geometry={geometry.headrestPatch} position={[0,1.80,.205]}>
        <meshStandardMaterial color="#b8e7ff" roughness={.3}/>
      </mesh>
      <mesh geometry={geometry.lumbar} position={[0,1.035,.16]} castShadow>
        <meshStandardMaterial color="#a9dcff" roughness={.4}/>
      </mesh>
      <mesh geometry={pipeGeometries.left}>
        <meshStandardMaterial color="#a7eaff" metalness={.12} roughness={.28}/>
      </mesh>
      <mesh geometry={pipeGeometries.right}>
        <meshStandardMaterial color="#a7eaff" metalness={.12} roughness={.28}/>
      </mesh>
      {[-1,1].map(side => (
        <mesh key={`back-seam-${side}`} geometry={geometry.seam}
          position={[side*.075,1.34,.133]}>
          <meshStandardMaterial color="#1a469e" roughness={.42}/>
        </mesh>
      ))}

      <mesh geometry={geometry.seatShell} position={[0,.705,.12]} castShadow>
        <meshStandardMaterial color="#f4f3ff" roughness={.33}/>
      </mesh>
      <mesh geometry={geometry.seat} position={[0,.79,.145]} castShadow>
        <meshStandardMaterial color="#2463d2" roughness={.37}/>
      </mesh>
      {[-1,1].map(side => (
        <mesh key={`seat-wing-${side}`} geometry={geometry.seatWing}
          position={[side*.315,.795,.12]} rotation={[0,0,side*.06]} castShadow>
          <meshStandardMaterial color={side < 0 ? "#4384ee" : "#1d54bb"} roughness={.35}/>
        </mesh>
      ))}
      <mesh geometry={geometry.seat} scale={[.58,.12,.78]} position={[0,.886,.13]}>
        <meshStandardMaterial color="#3477e5" roughness={.43}/>
      </mesh>

      {/* Cushioned armrests, supported by white and metallic brackets. */}
      {[-1,1].map(side => (
        <group key={`arm-${side}`} position={[side*.40,0,.045]}>
          <mesh geometry={geometry.armStem} position={[0,.86,-.01]} castShadow>
            <meshStandardMaterial color="#e5e8f8" metalness={.17} roughness={.32}/>
          </mesh>
          <mesh geometry={geometry.armPad} position={[0,1.045,.035]} castShadow>
            <meshStandardMaterial color="#3479eb" roughness={.34}/>
          </mesh>
          <mesh geometry={geometry.armCap} position={[0,1.097,.035]}>
            <meshStandardMaterial color="#7bcfff" roughness={.3}/>
          </mesh>
        </group>
      ))}

      {/* Gas lift and a six-point star base make the silhouette read as a real
          adjustable chair instead of a decorative blockout. */}
      <mesh position={[0,.48,.08]} castShadow>
        <cylinderGeometry args={[.047,.055,.43,20]}/>
        <meshStandardMaterial color="#b9c5dc" metalness={.68} roughness={.23}/>
      </mesh>
      <mesh position={[0,.255,.08]}>
        <cylinderGeometry args={[.11,.105,.08,20]}/>
        <meshStandardMaterial color="#d8e0f1" metalness={.5} roughness={.25}/>
      </mesh>
      {[0,Math.PI/3,-Math.PI/3].map((angle,index) => (
        <mesh key={`base-${index}`} geometry={geometry.baseBeam}
          position={[0,.105,.08]} rotation={[0,angle,0]} castShadow>
          <meshStandardMaterial color="#e6e9f7" metalness={.22} roughness={.3}/>
        </mesh>
      ))}
      {Array.from({length:5},(_,index) => {
        const angle = index*Math.PI*2/5;
        const x = Math.sin(angle)*.49;
        const z = .08 + Math.cos(angle)*.43;
        return (
          <group key={`caster-${index}`} position={[x,.095,z]}>
            <mesh position={[0,.035,0]}>
              <cylinderGeometry args={[.026,.032,.09,12]}/>
              <meshStandardMaterial color="#b6c7e8" metalness={.5} roughness={.28}/>
            </mesh>
            <mesh position={[0,-.014,0]} scale={[.045,.05,.07]} castShadow>
              <sphereGeometry args={[1,16,12]}/>
              <meshStandardMaterial color="#262943" roughness={.5}/>
            </mesh>
            <mesh position={[0,-.014,.054]} rotation={[Math.PI/2,0,0]}>
              <torusGeometry args={[.028,.006,7,16]}/>
              <meshStandardMaterial color="#8fcfff" metalness={.25} roughness={.29}/>
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function AuthoredWorkstationView({ workstationDetail, onSelect, onInteract, onHover, onToggleLights, lightsOn }: {
  workstationDetail: { scene: THREE.Group };
  onSelect: (target:StudioTarget)=>void;
  onInteract: (action:StudioObjectAction)=>void;
  onHover: (action:StudioObjectAction | null)=>void;
  onToggleLights: ()=>void;
  lightsOn: boolean;
}) {
  const { camera, size } = useThree();
  const authoredScene = workstationDetail;
  const sample = useMemo(() => {
    const referenceRoot = authoredScene.scene.getObjectByName("workstation-sample-root");
    const root = referenceRoot?.clone(true) ?? null;
    const emissives: AuthoredEmissive[] = [];
    const authoredLights: AuthoredLight[] = [];
    const carpetTexture = createCarpetTexture();
    if (!root) return { root, emissives, authoredLights, carpetTexture };

    root.name = "reference-workstation-stage";
    // Keep the tower under the right-wall pegboard and leave the chair in the
    // near-right foreground, as in the supplied workstation reference.
    const pc = root.getObjectByName("helios-pc");
    pc?.position.set(1.02,.98,-1.15);
    const chair = root.getObjectByName("chair-root");
    chair?.position.set(.72,0,-.18);
    if (chair) chair.visible = false;
    // The reference monitor spans roughly 42–45% of the room frame. Widen its
    // shell and lightbar while preserving the original stand and desk scale.
    for (const name of ["lightbar_chassis","lightbar_diffuser_lens","lightbar_mount_clamp","monitor_bezel","monitor_rear_housing","monitor_screen_mesh"]) {
      const monitorPart = root.getObjectByName(name);
      if (monitorPart) monitorPart.scale.x = 2.0;
    }

    const materialCopies = new Map<THREE.Material, THREE.Material>();
    root.traverse((node) => {
      if (/^(ivy_leaf_|pothos_leaf_)/.test(node.name)
        || node.name === "foreground_floor_plant"
        || /^peg_controller_/.test(node.name)
        || ["mic_boom_lower", "mic_boom_upper", "mic_desk_clamp", "mic_pop_filter", "talks-microphone"].includes(node.name)) {
        node.visible = false;
      }
      if ((node as THREE.Light).isLight) {
        const light = node as THREE.Light;
        authoredLights.push({ light, intensity: light.intensity });
        light.intensity *= .0002;
      }
      if (!(node instanceof THREE.Mesh)) return;
      const copyMaterial = (source: THREE.Material) => {
        let copy = materialCopies.get(source);
        if (!copy) {
          copy = source.clone();
          materialCopies.set(source, copy);
          if (copy instanceof THREE.MeshStandardMaterial && copy.emissiveIntensity > 0) {
            const screen = copy.name === "Monitor_Screen";
            const lit = Math.min(copy.emissiveIntensity * (screen ? .58 : .34), screen ? 2.2 : 1.7);
            emissives.push({ material: copy, lit, dim: Math.min(lit * .16, .28) });
            copy.emissiveIntensity = lit;
          }
        }
        return copy;
      };
      node.material = Array.isArray(node.material)
        ? node.material.map(copyMaterial)
        : copyMaterial(node.material);
      if (node.name === "room_floor") {
        const floorMaterials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of floorMaterials) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue;
          material.map = carpetTexture;
          material.color.set("#ffffff");
          material.roughness = .98;
          material.metalness = 0;
          material.needsUpdate = true;
        }
      }
      node.castShadow = true;
      node.receiveShadow = node.name === "room_floor" || node.name === "desk_top"
        || node.name.startsWith("wall_shelf_")
        || ["desk_left_pedestal", "desk_right_pedestal", "desk_modesty_panel"].includes(node.name);
    });

    return { root, emissives, authoredLights, carpetTexture };
  }, [authoredScene.scene]);

  const cameraPoses = useMemo(() => {
    const readPose = (name: string): AuthoredCameraPose | null => {
      const authored = authoredScene.scene.getObjectByName(name);
      if (!(authored instanceof THREE.PerspectiveCamera)) return null;
      return {
        position: authored.position.clone(),
        quaternion: authored.quaternion.clone(),
        fov: authored.fov,
      };
    };
    return {
      Camera_ReferenceMatch: readPose("Camera_ReferenceMatch"),
      Camera_HomeDesktop: readPose("Camera_HomeDesktop"),
      Camera_HomeMobile: readPose("Camera_HomeMobile"),
    };
  }, [authoredScene.scene]);

  const portrait = size.width < 800;
  const cameraName = portrait ? "Camera_HomeMobile" : size.width >= 1600 ? "Camera_HomeDesktop" : "Camera_ReferenceMatch";
  const sourcePose = cameraPoses[cameraName];
  const pose = sourcePose
    ? {
      ...sourcePose,
      fov: portrait
        ? Math.max(sourcePose.fov, 54)
        : cameraName === "Camera_ReferenceMatch"
          ? sourcePose.fov + THREE.MathUtils.degToRad(3)
          : sourcePose.fov,
    }
    : sourcePose;

  useEffect(() => {
    for (const entry of sample.emissives) {
      // The authored scene owns its mutable Three.js materials.
      // eslint-disable-next-line react-hooks/immutability
      entry.material.emissiveIntensity = lightsOn ? entry.lit : entry.dim;
    }
    for (const entry of sample.authoredLights) {
      // The imported practicals are calibrated to the browser renderer scale.
      entry.light.intensity = entry.intensity * (lightsOn ? .0002 : .00002);
    }
  }, [sample.emissives, sample.authoredLights, lightsOn]);
  useEffect(() => () => sample.carpetTexture.dispose(), [sample.carpetTexture]);

  useFrame((_, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !pose) return;
    const weight = 1 - Math.exp(-3.2 * Math.min(delta, .06));
    camera.position.lerp(pose.position, weight);
    camera.quaternion.slerp(pose.quaternion, weight);
    // The authored GLB camera owns focal length; the viewport controls aspect.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = THREE.MathUtils.damp(camera.fov, pose.fov, 4, delta);
    camera.updateProjectionMatrix();
  });

  const choose = (event:ThreeEvent<MouseEvent>) => {
    if (!sample.root) return;
    const target = identifyRoomObject(event.object, sample.root);
    if (!target) return;
    event.stopPropagation();
    if (target === "lights") onToggleLights();
    else if (target === "avatar") onSelect("about");
    else if (target === "door") onSelect("contact");
    else if (target === "skills") onSelect("lab");
    else onInteract(target);
  };
  const hover = (event:ThreeEvent<PointerEvent>) => {
    if (!sample.root) return;
    const target = identifyRoomObject(event.object, sample.root);
    document.body.style.cursor = target ? "pointer" : "";
    onHover(target);
  };

  return (
    <>
      <color attach="background" args={["#aaa8d0"]}/>
      <ambientLight intensity={.32} color="#fff4ff"/>
      <hemisphereLight args={["#fff1ff","#31335c",.44]}/>
      <directionalLight position={[-3.5,6,4]} intensity={1.05} color="#fff3fb" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-bias={-.0004} shadow-normalBias={.035}
        shadow-camera-near={.1} shadow-camera-far={12}
        shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4}/>
      <pointLight position={[-.35,1.95,-1.2]} color="#ec84ff"
        intensity={lightsOn ? 1.15 : .06} distance={2.8} decay={2}/>
      <pointLight position={[1.15,1.2,-.1]} color="#52caff"
        intensity={lightsOn ? .72 : .04} distance={2.2} decay={2}/>
      <pointLight position={[1.42,1.05,.34]} color="#7784ff"
        intensity={lightsOn ? .82 : .035} distance={2.7} decay={2}/>
      <StudioHexLights lightsOn={lightsOn} onExplore={() => onSelect("lab")}/>
      <StudioReferenceDressing lightsOn={lightsOn} onOpenComputer={() => onInteract("monitor")}
        onExplore={() => onSelect("lab")} pcX={1.02} includeFloorPlant showBoomMicrophone/>
      {sample.root && <primitive object={sample.root} onClick={choose}
        onPointerOver={hover}
        onPointerOut={() => { document.body.style.cursor=""; onHover(null); }}/>}
      <ReferenceGamingChair onSelect={onSelect} onHover={onHover}/>
    </>
  );
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
  const [world, resident, fixture, workstationDetail] = useLoader(GLTFLoader, [
    "/models/yor-world-room.glb",
    "/models/yor-world-resident.glb",
    "/models/yor-world-fixture.glb",
    "/models/yor-world-workstation-details.glb",
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

    // Replace only the coarse workstation dressing, retaining the production
    // door, blinds, painting, monitor hit zones and animated resident rig.
    // Yor-World's B3 sample contains authored fine-grained PC fans, controllers,
    // headset and a richer foliage collection in identical world coordinates.
    const authoredDressing = workstationDetail.scene.clone(true);
    authoredDressing.updateWorldMatrix(true, true);
    model.updateWorldMatrix(true, true);
    const visualReplacements = [
      ["helios-pc", "helios-pc"],
      ["pegboard_system", "controller-pegboard"],
      ["plants", "plants_group"],
    ] as const;
    for (const [legacyName, sourceName] of visualReplacements) {
      const detail = authoredDressing.getObjectByName(sourceName);
      if (!detail) continue;
      room.getObjectByName(legacyName)?.removeFromParent();
      model.attach(detail);
      detail.name = legacyName;
    }
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
    // GLB hex faces have a 5.3–5.7x export emissive strength and read as
    // blank white rectangles. Replace only their visible faces with the
    // explicitly modeled hex fixtures above at the same seven coordinates.
    for (let i=1; i<=7; i++) {
      const oldFixture = room.getObjectByName(`hex_panel_${i}`);
      if (oldFixture) oldFixture.visible=false;
    }
    const door = room.getObjectByName("door-hinge") || null;
    const painting = room.getObjectByName("painting-pivot") || null;
    const blinds = Array.from({ length: 12 },(_,index) => room.getObjectByName(`blind_slat_${index+1}`))
      .filter((node): node is THREE.Object3D => Boolean(node))
      .map(node => ({node, base: node.rotation.z}));
    const signature = room.getObjectByName("hidden-yor-mark") || null;
    if (signature) signature.visible = false;
    return {group:model,avatarMixer:am,chairMixer:cm,actions:anims,door,lightNodes,painting,blinds,signature};
  },[world,resident,fixture,workstationDetail]);

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
      node.intensity = intensity * (lightsOn ? .00092 : .00012);
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
  const showAuthoredWorkstation = selected === "work" && introSequence === 0;

  return showAuthoredWorkstation ? (
    <AuthoredWorkstationView workstationDetail={workstationDetail} onSelect={onSelect}
      onInteract={onInteract} onHover={onHover} onToggleLights={onToggleLights} lightsOn={lightsOn}/>
  ) : (
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
      <WorldCamera selected={selected} introSequence={introSequence}/>
      <StudioHexLights lightsOn={lightsOn} onExplore={() => onSelect("lab")}/>
      <StudioReferenceDressing lightsOn={lightsOn} onOpenComputer={() => onInteract("monitor")} onExplore={() => onSelect("lab")}/>
      <StudioDeskProps onOpen={() => onInteract("monitor")}/>
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
    <Canvas shadows camera={{position:[-1.95,2.10,1.55],fov:40.18,near:.08,far:30}}
      dpr={[1,1.5]} gl={{antialias:true,powerPreference:"high-performance"}}
      onCreated={({gl})=>{ gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=.95; }}
      aria-label="Authentic interactive YOR World gaming studio with desk, resident, light panels, door and workstation">
      <Suspense fallback={null}>
        <AuthenticYorRoom onSelect={onSelect} onInteract={onInteract} onHover={onHover} onToggleLights={onToggleLights}
          selected={selected} lightsOn={lightsOn} blindsOpen={blindsOpen}
          paintingBeat={paintingBeat} introSequence={introSequence} onReady={onReady}/>
      </Suspense>
    </Canvas>
  );
}
