"use client";

import * as THREE from "three";

/** Light, actual 3D tabletop and foreground accessories.
 * Modeled with compact primitives so WebGL remains usable on phones.
 * Existing imported room objects continue to own their interaction zones. */
function DeskConsole({ onOpen }: { onOpen: () => void }) {
  return (
    <group name="desk-showcase-console" position={[-1.02,.751,-.99]}
      onClick={event => {event.stopPropagation();onOpen();}}>
      <mesh position={[0,.19,0]}>
        <boxGeometry args={[.105,.36,.19]}/>
        <meshStandardMaterial color="#131a31" roughness={.35}/>
      </mesh>
      {[-1,1].map(side => (
        <mesh key={side}
          position={[side*.060,.19,.006]} rotation={[0,0,side*-.045]}>
          <boxGeometry args={[.026,.39,.205]}/>
          <meshStandardMaterial color="#f6f5ff" roughness={.28}/>
        </mesh>
      ))}
      <mesh position={[.075,.16,.101]}>
        <boxGeometry args={[.006,.20,.007]}/>
        <meshBasicMaterial color="#7c9bff" toneMapped={false}/>
      </mesh>
      <mesh position={[0,.005,.025]}>
        <boxGeometry args={[.2,.012,.18]}/>
        <meshStandardMaterial color="#cdd9f0" roughness={.47}/>
      </mesh>
    </group>
  );
}

function Planter({ x, y, z, leaves=4 }: {
  x:number;y:number;z:number;leaves?:number;
}) {
  return (
    <group position={[x,y,z]}>
      <mesh position={[0,.045,0]}>
        <cylinderGeometry args={[.065,.048,.09,10]}/>
        <meshStandardMaterial color="#f7f4ff" roughness={.38}/>
      </mesh>
      <mesh position={[0,.091,0]}>
        <cylinderGeometry args={[.057,.057,.007,10]}/>
        <meshStandardMaterial color="#6d523e" roughness={.88}/>
      </mesh>
      {Array.from({length:leaves},(_,i) => {
        const a=i*2.39996;
        return (
          <mesh key={i}
            position={[Math.cos(a)*.036,.132+(i%3)*.024,Math.sin(a)*.036]}
            rotation={[Math.cos(a)*.3,a,Math.sin(a)*.4]}
            scale={[.034,.070,.025]}>
            <sphereGeometry args={[1,9,7]}/>
            <meshStandardMaterial color={i%2===0?"#4d9b71":"#7abf87"}
              roughness={.7}/>
          </mesh>
        );
      })}
    </group>
  );
}

function StandingFloorPlant() {
  return (
    <group name="foreground-floor-plant" position={[-1.48,0,-.27]}>
      <mesh position={[0,.13,0]}>
        <cylinderGeometry args={[.13,.10,.25,10]}/>
        <meshStandardMaterial color="#aaaad0" roughness={.55}/>
      </mesh>
      <mesh position={[0,.02,0]}>
        <cylinderGeometry args={[.165,.165,.04,10]}/>
        <meshStandardMaterial color="#5d516d" roughness={.72}/>
      </mesh>
      {Array.from({length:7},(_,i)=>{
        const a=i*2.3999632;
        const height=.46+(i%3)*.11;
        const x=Math.sin(a)*.12,z=Math.cos(a)*.13;
        return <group key={i}>
          <mesh position={[x/2,.25+height/2,z/2]}
            rotation={[Math.sin(a)*-.2,0,Math.sin(a)*.18]}>
            <cylinderGeometry args={[.006,.008,height,5]}/>
            <meshStandardMaterial color="#4c725a" roughness={.83}/>
          </mesh>
          <mesh position={[x,.24+height,z]} rotation={[.15,a,.5]}>
            <sphereGeometry args={[1,10,8]}/>
            <meshStandardMaterial color={i%2===0?"#327754":"#4c9065"} roughness={.64}/>
          </mesh>
          <mesh position={[x,.24+height,z]} scale={[.13,.075,.024]} rotation={[0,a,.4]}>
            <sphereGeometry args={[1,10,8]}/>
            <meshStandardMaterial color={i%2===0?"#327754":"#4c9065"}
              roughness={.64} side={THREE.DoubleSide}/>
          </mesh>
        </group>;
      })}
    </group>
  );
}

function ClockAndController({ onOpen }: { onOpen:()=>void }) {
  return (
    <group onClick={event => {event.stopPropagation();onOpen();}}>
      <group position={[.67,.77,-.91]}>
        <mesh position={[0,.075,0]}>
          <boxGeometry args={[.15,.15,.075]}/>
          <meshStandardMaterial color="#f7f5fd" roughness={.30}/>
        </mesh>
        <mesh position={[0,.075,.039]}>
          <boxGeometry args={[.128,.122,.002]}/>
          <meshBasicMaterial color="#141f50" toneMapped={false}/>
        </mesh>
        {Array.from({length:4},(_,i)=>(
          <mesh key={i} position={[-.039+(i%2)*.052,.085-Math.floor(i/2)*.04,.042]}>
            <boxGeometry args={[.027,.013,.003]}/>
            <meshBasicMaterial color="#83cbff" toneMapped={false}/>
          </mesh>
        ))}
      </group>
      <group position={[.18,.773,-.79]}>
        <mesh position={[0,.048,0]}>
          <boxGeometry args={[.23,.022,.12]}/>
          <meshStandardMaterial color="#c3b5d9" roughness={.39}/>
        </mesh>
        <mesh position={[0,.107,0]}>
          <boxGeometry args={[.16,.056,.07]}/>
          <meshStandardMaterial color="#f6efff" roughness={.32}/>
        </mesh>
        {[-1,1].map(side=>(
          <mesh key={side} position={[side*.09,.073,0]} rotation={[0,0,side*.3]}>
            <sphereGeometry args={[1,10,8]}/>
            <meshStandardMaterial color="#efeaff" roughness={.35}/>
          </mesh>
        ))}
        <mesh position={[0,.08,.038]}>
          <boxGeometry args={[.065,.027,.008]}/>
          <meshBasicMaterial color="#575da0"/>
        </mesh>
      </group>
    </group>
  );
}

export function StudioDeskProps({ onOpen }: { onOpen:()=>void }) {
  return (
    <group name="reference-workstation-small-props">
      <DeskConsole onOpen={onOpen}/>
      <ClockAndController onOpen={onOpen}/>
      <Planter x={-.65} y={1.51} z={-1.53} leaves={5}/>
      <Planter x={.68} y={1.51} z={-1.53} leaves={5}/>
      <Planter x={.84} y={.754} z={-1.36} leaves={5}/>
      <StandingFloorPlant/>
    </group>
  );
}
