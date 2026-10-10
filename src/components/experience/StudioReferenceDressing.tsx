"use client";

import * as THREE from "three";

/**
 * Lightweight geometric polish over the imported Yor-World room. Every piece
 * lives in 3D with depth, perspective and responsive physical lighting;
 * no billboard screenshots, paid APIs or external textures are required.
 * The original world GLBs and their interaction proxies remain authoritative.
 */
const FAN_LIGHTS = [
  { y: .82, color: "#ff86e9" },
  { y: .97, color: "#8cdeff" },
  { y: 1.12, color: "#d9a4ff" },
] as const;

const TRAILS = [
  { x: -.84, y: 1.96, count: 8, phase: -.12 },
  { x: .80, y: 1.99, count: 8, phase: .25 },
] as const;

function GlowingFan({ y, color, enabled }: { y:number; color:string; enabled:boolean }) {
  return (
    <group position={[1.02,y,-.912]}>
      <mesh>
        <circleGeometry args={[.073,24]}/>
        <meshBasicMaterial color="#243052" toneMapped={false}/>
      </mesh>
      <mesh position={[0,0,.001]}>
        <torusGeometry args={[.057,.009,8,30]}/>
        <meshBasicMaterial color={enabled ? color : "#66728b"} toneMapped={false}/>
      </mesh>
      <mesh position={[0,0,.002]}>
        <circleGeometry args={[.017,16]}/>
        <meshBasicMaterial color="#c4c5e8" toneMapped={false}/>
      </mesh>
      {[0,1,2,3,4].map(index => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index}
            position={[Math.cos(angle)*.033,Math.sin(angle)*.033,.003]}
            rotation={[0,0,angle]}>
            <boxGeometry args={[.024,.008,.002]}/>
            <meshBasicMaterial color={enabled ? "#dcd1ff" : "#51566e"}/>
          </mesh>
        );
      })}
      <mesh position={[0,0,-.002]}>
        <circleGeometry args={[.103,24]}/>
        <meshBasicMaterial color={color} toneMapped={false}
          transparent opacity={enabled ? .09 : 0}
          blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
    </group>
  );
}

function Controller({ y, color }: { y:number; color:string }) {
  return (
    <group position={[1.33,y,-.875]} rotation={[0,0,-.1]}>
      <mesh>
        <boxGeometry args={[.20,.076,.04]}/>
        <meshStandardMaterial color="#fbf8ff" roughness={.32}/>
      </mesh>
      {[-1,1].map(side => (
        <group key={side}>
          <mesh position={[side*.108,-.052,.004]} scale={[.047,.084,.027]} rotation={[0,0,side*.27]}>
            <sphereGeometry args={[1,12,10]}/>
            <meshStandardMaterial color="#f8f6ff" roughness={.38}/>
          </mesh>
          <mesh position={[side*.057,.013,.024]}>
            <cylinderGeometry args={[.019,.019,.011,16]}/>
            <meshStandardMaterial color="#33395e" roughness={.58}/>
          </mesh>
        </group>
      ))}
      <mesh position={[0,.014,.028]}>
        <boxGeometry args={[.059,.036,.008]}/>
        <meshStandardMaterial color="#b5b6d9" roughness={.43}/>
      </mesh>
      <mesh position={[-.068,-.006,.029]}>
        <boxGeometry args={[.036,.009,.007]}/>
        <meshBasicMaterial color="#505978"/>
      </mesh>
      <mesh position={[-.068,-.006,.029]} rotation={[0,0,Math.PI/2]}>
        <boxGeometry args={[.036,.009,.009]}/>
        <meshBasicMaterial color="#505978"/>
      </mesh>
      {[[.063,.019],[.083,0],[.043,0],[.063,-.019]].map(([x,dy],index) => (
        <mesh key={index} position={[x,dy,.029]}>
          <sphereGeometry args={[.008,9,8]}/>
          <meshBasicMaterial color={color} toneMapped={false}/>
        </mesh>
      ))}
    </group>
  );
}

function HangingVine({ x,y,count,phase }: { x:number; y:number; count:number; phase:number }) {
  const points = Array.from({ length: count+1 },(_,i) =>
    new THREE.Vector3(Math.sin(i*.64+phase)*.083, -(i*.095), Math.sin(i*.43+phase)*.033));
  const curve = new THREE.CatmullRomCurve3(points);
  return (
    <group position={[x,y,-1.55]}>
      <mesh>
        <tubeGeometry args={[curve,Math.max(16,count*5),.006,5,false]}/>
        <meshStandardMaterial color="#4a9470" roughness={.84}/>
      </mesh>
      {points.slice(1).map((point,i) => (
        <group key={i} position={[point.x,point.y,point.z]} rotation={[.3,Math.sin(i*1.5),i%2===0 ? .56 : -.56]}>
          <mesh position={[i%2===0 ? -.040 : .040,0,.012]}
            scale={[.047,.085,.021]}>
            <sphereGeometry args={[1,10,8]}/>
            <meshStandardMaterial color={i%3===0 ? "#6cb989" : "#438968"}
              roughness={.7} side={THREE.DoubleSide}/>
          </mesh>
          <mesh position={[i%2===0 ? .040 : -.040,.019,-.004]}
            scale={[.038,.07,.020]} rotation={[0,.2,-.3]}>
            <sphereGeometry args={[1,10,8]}/>
            <meshStandardMaterial color={i%2===0 ? "#82c99b" : "#337859"}
              roughness={.7} side={THREE.DoubleSide}/>
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function StudioReferenceDressing({ lightsOn, onOpenComputer, onExplore }: {
  lightsOn:boolean;
  onOpenComputer:()=>void;
  onExplore:()=>void;
}) {
  return (
    <group name="reference-detailed-room-dressing">
      <group onClick={event => {event.stopPropagation();onOpenComputer();}}>
        {FAN_LIGHTS.map(({y,color}) =>
          <GlowingFan key={y} y={y} color={color} enabled={lightsOn}/>)}
      </group>

      {/* A pair of raised white gamepads with genuine depth, in front of
          the right-wall pegboard rather than flat colored blockout disks. */}
      <group onClick={event => {event.stopPropagation();onExplore();}}>
        <Controller y={1.86} color="#e984ed"/>
        <Controller y={1.60} color="#72ccff"/>
      </group>

      {/* Trailing leaves make the wall shelving organic rather than isolated
          green spheres. Curved stems are geometry, not 2D image cards. */}
      {TRAILS.map(vine=><HangingVine key={vine.x}
        x={vine.x} y={vine.y} count={vine.count} phase={vine.phase}/>)}

      <mesh position={[0,1.33,-1.30]}>
        <boxGeometry args={[.57,.014,.021]}/>
        <meshBasicMaterial color={lightsOn?"#ffe5aa":"#5b5966"} toneMapped={false}/>
      </mesh>
      <pointLight position={[0,1.29,-1.14]} color="#ffe6bd"
        intensity={lightsOn?.82:.05} distance={1.15} decay={2}/>
      <mesh position={[0,.695,-.74]}>
        <boxGeometry args={[2.37,.012,.011]}/>
        <meshBasicMaterial color={lightsOn?"#8ce5fb":"#405574"} toneMapped={false}/>
      </mesh>
      <pointLight position={[0,.28,-.72]} color="#54cfff"
        intensity={lightsOn?1.6:.05} distance={2.0} decay={2}/>
    </group>
  );
}
