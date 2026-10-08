"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type StudioTarget = "work" | "about" | "lab" | "contact";

const brass = "#f3a86a";
const deep = "#0b1019";

function Box({
  position, args, color, metalness = 0, roughness = .62, emissive, intensity = 0,
  rotation, onClick,
}: {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  intensity?: number;
  rotation?: [number, number, number];
  onClick?: () => void;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow onClick={onClick}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}
        emissive={emissive ?? "#000000"} emissiveIntensity={intensity} />
    </mesh>
  );
}

function Rod({
  a, b, r = .026, color = "#9ea0a0",
}: { a: [number, number, number]; b: [number, number, number]; r?: number; color?: string }) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const middle = start.clone().add(end).multiplyScalar(.5);
  const direction = end.clone().sub(start);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0), direction.clone().normalize()
  );
  return (
    <mesh position={[middle.x, middle.y, middle.z]} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[r, r, direction.length(), 10]} />
      <meshStandardMaterial color={color} metalness={.7} roughness={.28} />
    </mesh>
  );
}

function StudioMonitor({ onClick, secondary = false }: { onClick: () => void; secondary?: boolean }) {
  const w = secondary ? 1.24 : 2.06;
  const h = secondary ? .82 : 1.2;
  return (
    <group position={secondary ? [1.38, -.02, -.66] : [-.41, .04, -.7]}
      rotation={[0, secondary ? -.24 : .1, 0]}>
      <Box position={[0, 0, 0]} args={[w + .12, h + .12, .13]} color="#1f2730" metalness={.65} roughness={.22} onClick={onClick} />
      <mesh position={[0, 0, .075]} onClick={onClick}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={secondary ? "#16232c" : "#101f30"}
          emissive={secondary ? "#1b4850" : "#16354e"} emissiveIntensity={.67} />
      </mesh>
      <group position={[0, 0, .088]}>
        <Box position={[-w * .27, h * .19, 0]} args={[w * .3, .045, .003]} color={secondary ? "#b2c6ba" : brass} emissive={secondary ? "#4a9c99" : brass} intensity={.8} onClick={onClick} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Box key={i} position={[-w * .21, h * .06 - i * h * .13, 0]}
            args={[w * (.36 + (i % 2) * .17), .022, .003]} color={i === 2 ? brass : "#52768a"}
            emissive={i === 2 ? "#fd855a" : "#1d586d"} intensity={.5} onClick={onClick} />
        ))}
        <Box position={[w * .24, -.02, 0]} args={[w * .22, h * .46, .003]} color="#173648" emissive="#17516e" intensity={.8} onClick={onClick} />
        <Box position={[w * .24, h * .28, .003]} args={[w * .22, .026, .003]} color={brass} emissive="#ff9860" intensity={1} onClick={onClick} />
      </group>
      <Rod a={[0, -h / 2, -.03]} b={[0, -h / 2 - .37, -.03]} r={.036} />
      <Box position={[0, -h / 2 - .4, .06]} args={[.52, .035, .3]} color="#343b42" metalness={.7} />
    </group>
  );
}

function Desk() {
  return (
    <group>
      <Box position={[0, -1.07, .35]} args={[5.3, .18, 2.24]} color="#554139" roughness={.46} />
      <Box position={[0, -.966, .35]} args={[5.3, .045, 2.24]} color="#9a6b4c" roughness={.38} />
      {[[-2.32, -2.04, -.46], [2.32, -2.04, -.46], [-2.32, -2.04, 1.15], [2.32, -2.04, 1.15]].map(([x,y,z], i) =>
        <Box key={i} position={[x,y,z]} args={[.11, 1.89, .11]} color="#252d35" metalness={.75}/>)}
      <Box position={[.1, -.925, .8]} args={[1.6, .048, .49]} color="#1b2126" roughness={.46} />
      {Array.from({ length: 4 * 13 }, (_, i) => {
        const row = Math.floor(i / 13);
        const col = i % 13;
        return <Box key={i} position={[-.65 + col * .118, -.89, .615 + row * .102]}
          args={[.092, .015, .07]} color={i % 11 === 0 ? brass : "#6e747c"} emissive={i % 11 === 0 ? "#d96e50" : undefined} intensity={.2}/>;
      })}
      <Box position={[1.39, -.916, .86]} args={[.22, .056, .32]} color="#a9afb4" metalness={.3} />
      <Box position={[-2.1, -.83, .72]} args={[.35, .35, .35]} color="#d5c2a8" roughness={.7}/>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[-2.1, -.645, .72]}>
        <torusGeometry args={[.12, .021, 10, 28]} />
        <meshStandardMaterial color="#ede1d2"/>
      </mesh>
      <Box position={[-2.06, -.52, .74]} args={[.013, .39, .013]} color="#866b50"/>
    </group>
  );
}

function PcTower() {
  return (
    <group position={[2.05, -.11, .03]}>
      <Box position={[0, 0, 0]} args={[.61, 1.43, .9]} color="#151a23" metalness={.5} roughness={.2}/>
      <Box position={[-.312, 0, 0]} args={[.012, 1.33, .77]} color="#33404c" metalness={.4} />
      {[.41, -.15, -.69].map((y, i) => (
        <group key={i}>
          <mesh position={[.01, y, .455]}>
            <torusGeometry args={[.17, .027, 12, 48]}/>
            <meshStandardMaterial color={i === 1 ? "#93abb9" : brass}
              emissive={i === 1 ? "#3c758a" : brass} emissiveIntensity={1.3}/>
          </mesh>
          <mesh position={[.01,y,.454]}>
            <circleGeometry args={[.097, 22]}/>
            <meshStandardMaterial color="#202a36" emissive="#192e42" emissiveIntensity={.7}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Lamp() {
  return (
    <group>
      <Box position={[-2.37, -.88, -.52]} args={[.5, .06, .5]} color="#3c414a" metalness={.7} />
      <Rod a={[-2.37,-.84,-.52]} b={[-2.42,.11,-.69]} r={.045} color="#99938c"/>
      <Rod a={[-2.42,.11,-.69]} b={[-1.77,.73,-.52]} r={.04} color="#a59b86"/>
      <mesh position={[-1.72,.67,-.5]} rotation={[0, 0, -.38]}>
        <coneGeometry args={[.3, .48, 16, 1, true]}/>
        <meshStandardMaterial color="#dbbb96" side={THREE.DoubleSide} metalness={.44}/>
      </mesh>
      <pointLight position={[-1.7,.44,-.42]} intensity={13} distance={5} color="#ffbd83" castShadow/>
    </group>
  );
}

function Avatar({ onSelect }: { onSelect: () => void }) {
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const [greeting, setGreeting] = useState(false);
  useFrame((state, delta) => {
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, greeting ? .2 : Math.PI, 3, delta);
      head.current.position.y = 1.05 + Math.sin(state.clock.elapsedTime * 1.3) * .015;
    }
    if (arm.current) {
      arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, greeting ? -.85 : .1, 3, delta);
    }
  });
  const activate = () => {
    setGreeting((value) => !value);
    onSelect();
  };
  return (
    <group position={[.58,-1.43,1.76]} onClick={activate}
      onPointerOver={() => {document.body.style.cursor = "pointer";}}
      onPointerOut={() => {document.body.style.cursor = "";}}>
      <Box position={[0,-.33,0]} args={[.82,.12,.72]} color="#20252d"/>
      <Box position={[0,.08,-.29]} args={[.83,.89,.16]} color="#252a34"/>
      <Rod a={[-.37,-.45,.12]} b={[-.45,-1.03,.2]} r={.045}/>
      <Rod a={[.37,-.45,.12]} b={[.45,-1.03,.2]} r={.045}/>
      <mesh position={[0,.6,0]} castShadow>
        <sphereGeometry args={[.46, 24, 20]}/>
        <meshStandardMaterial color="#5f556d" roughness={.9}/>
      </mesh>
      <Box position={[0,.35,0]} args={[.7,.55,.41]} color="#58556a"/>
      <group ref={head} position={[0,1.05,0]}>
        <mesh castShadow><sphereGeometry args={[.30,24,24]}/><meshStandardMaterial color="#b48260" roughness={.8}/></mesh>
        <mesh position={[0,.18,-.04]}><sphereGeometry args={[.28,20,16]}/><meshStandardMaterial color="#191b25"/></mesh>
        <mesh position={[-.105,.014,.27]}><sphereGeometry args={[.025,12,12]}/><meshStandardMaterial color="#201c1b"/></mesh>
        <mesh position={[.105,.014,.27]}><sphereGeometry args={[.025,12,12]}/><meshStandardMaterial color="#201c1b"/></mesh>
      </group>
      <group ref={arm} position={[.49,.69,0]}>
        <Rod a={[0,0,0]} b={[.13,-.39,.19]} r={.12} color="#6d6379"/>
        <mesh position={[.13,-.39,.19]}><sphereGeometry args={[.12,12,12]}/><meshStandardMaterial color="#b48260"/></mesh>
      </group>
    </group>
  );
}

function StudioEnvironment({ onSelect }: { onSelect: (target: StudioTarget) => void }) {
  const root = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!root.current) return;
    const x = Math.max(-1, Math.min(1, state.pointer.x));
    const y = Math.max(-1, Math.min(1, state.pointer.y));
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, x * .043, 2, delta);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -y * .014, 2, delta);
  });
  return (
    <group ref={root} position={[0,.15,0]}>
      <color attach="background" args={[deep]}/>
      <fog attach="fog" args={[deep, 9, 18]}/>
      <ambientLight intensity={.83} color="#b9c4e3"/>
      <hemisphereLight args={["#a9cce1","#36261e",1.1]}/>
      <directionalLight position={[4,7,6]} color="#c8d7ff" intensity={2.4} castShadow
        shadow-mapSize={[1024,1024]} shadow-camera-left={-7} shadow-camera-right={7}
        shadow-camera-top={7} shadow-camera-bottom={-7}/>
      <pointLight position={[2.65,1.5,-1.6]} color="#6b8fae" intensity={9} distance={7}/>
      <pointLight position={[.15,-.08,-.3]} color="#4d9dc2" intensity={3} distance={4}/>

      <Box position={[0,.3,-2.49]} args={[10,6,.2]} color="#1b2533"/>
      <Box position={[-4.95,.25,0]} args={[.2,6,5]} color="#15202b"/>
      <Box position={[0,-2.26,0]} args={[10,.16,6]} color="#34343c" roughness={.86}/>
      <Box position={[0,-2.164,0]} args={[10,.012,6]} color="#544c48" roughness={1}/>
      <Box position={[0,3.25,0]} args={[10,.1,6]} color="#141923"/>
      {[...Array(9)].map((_,i) => <Box key={i} position={[-4.5+i*1.1,-2.153,0]} args={[.015,.008,6]} color="#766152" />)}
      <Box position={[0,-2.135,1]} args={[6,.018,3.4]} color="#323b44"/>
      <Box position={[0,-2.126,1]} args={[5.72,.019,3.15]} color="#443c43"/>

      {/* Window and cool night skyline. */}
      <Box position={[2.73,.89,-2.33]} args={[2.45,2.58,.11]} color="#5d6168" metalness={.5}/>
      <Box position={[2.73,.89,-2.26]} args={[2.18,2.28,.08]} color="#071a2c" emissive="#0d3557" intensity={.45}/>
      <Box position={[2.73,.89,-2.20]} args={[.06,2.25,.065]} color="#777a81" metalness={.65}/>
      <Box position={[2.73,.89,-2.20]} args={[2.19,.06,.065]} color="#777a81" metalness={.65}/>
      {[0,1,2,3,4,5].map(i => <Box key={i} position={[1.72+i*.42,.07 + (i%3)*.1,-2.17]} args={[.3,.55+(i%3)*.25,.055]} color="#15283a" emissive="#193b56" intensity={.5}/>)}

      {/* Door, wall art and shelving all belong to the same room. */}
      <group position={[-3.9,.1,-2.30]} onClick={() => onSelect("contact")}
        onPointerOver={() => {document.body.style.cursor = "pointer";}}
        onPointerOut={() => {document.body.style.cursor = "";}}>
        <Box position={[0,-.14,0]} args={[1.18,2.82,.11]} color="#2c3541"/>
        <Box position={[0,-.14,.08]} args={[.97,2.55,.024]} color="#17202b"/>
        <Box position={[.35,-.28,.11]} args={[.075,.13,.055]} color={brass} emissive={brass} intensity={.6}/>
      </group>
      <group position={[-2.32,1.16,-2.35]} onClick={() => onSelect("lab")}
        onPointerOver={() => {document.body.style.cursor = "pointer";}}
        onPointerOut={() => {document.body.style.cursor = "";}}>
        <Box position={[0,0,0]} args={[1.28,1.4,.11]} color="#b38d6c"/>
        <Box position={[0,0,.06]} args={[1.15,1.27,.025]} color="#181823" emissive="#37263d" intensity={.3}/>
        <Box position={[-.17,.08,.085]} args={[.52,.54,.012]} color="#724757" emissive="#8f3d58" intensity={.4}/>
        <Box position={[.23,-.1,.087]} args={[.45,.75,.012]} color="#d18b65" emissive="#a85548" intensity={.4}/>
      </group>
      <Box position={[-.2,2.37,-2.37]} args={[2.5,.095,.46]} color="#543c31"/>
      {[0,1,2,3,4,5,6].map(i =>
        <Box key={i} position={[-1.3+i*.34,2.58,-2.31]} args={[.14,.31 + (i%3)*.12,.15]}
          color={i%2 ? "#cc8f70":"#637c78"}/>)}

      <Desk/>
      <StudioMonitor onClick={() => onSelect("work")}/>
      <StudioMonitor secondary onClick={() => onSelect("work")}/>
      <PcTower/>
      <Lamp/>
      <Avatar onSelect={() => onSelect("about")}/>
      <Box position={[-2.75,-.19,1.25]} args={[.54,1.4,.54]} color="#725744" />
      <mesh position={[-2.75,.65,1.25]} castShadow>
        <sphereGeometry args={[.62,16,12]}/>
        <meshStandardMaterial color="#496551" roughness={1}/>
      </mesh>
      <mesh position={[-2.9,.9,1.37]} castShadow>
        <sphereGeometry args={[.48,16,12]}/>
        <meshStandardMaterial color="#52735b" roughness={1}/>
      </mesh>
    </group>
  );
}

export function StudioScene({ onSelect }: { onSelect: (target: StudioTarget) => void }) {
  useEffect(() => () => {document.body.style.cursor = "";}, []);
  return (
    <Canvas camera={{ position: [5.6,3.2,8.7], fov: 41, near: .1, far: 30 }}
      dpr={[1,1.5]} shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      aria-label="Interactive 3D studio with clickable computer, avatar, painting and door">
      <StudioEnvironment onSelect={onSelect}/>
    </Canvas>
  );
}
