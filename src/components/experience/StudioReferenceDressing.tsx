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

function GlowingFan({ x, y, color, enabled }: { x:number; y:number; color:string; enabled:boolean }) {
  return (
    <group position={[x,y,-.912]}>
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

function ShelfBooks() {
  const books = [
    { x: -.07, width: .052, height: .15, color: "#5c4d91" },
    { x: 0, width: .056, height: .19, color: "#386b79" },
    { x: .072, width: .05, height: .17, color: "#b66f83" },
  ] as const;
  return (
    <group name="reference-shelf-books" position={[-.86,1.515,-1.705]} rotation={[0,0,-.025]}>
      {books.map(({x,width,height,color},index) => (
        <group key={index} position={[x,0,0]}>
          <mesh position={[0,height/2,0]} castShadow receiveShadow>
            <boxGeometry args={[width,height,.12]}/>
            <meshStandardMaterial color={color} roughness={.58}/>
          </mesh>
          {[.16,.23,.78,.84].map((fraction,detail) => (
            <mesh key={detail} position={[0,height*fraction,.062]}>
              <boxGeometry args={[width*.72,.004,.003]}/>
              <meshBasicMaterial color={detail%2===0?"#e8d5aa":"#d5c6f0"} toneMapped={false}/>
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function WallHeadset() {
  return (
    <group name="wall-headset" position={[1.25,1.35,-.84]}>
      <mesh>
        <torusGeometry args={[.15,.019,10,32,Math.PI]}/>
        <meshStandardMaterial color="#24213f" metalness={.24} roughness={.32}/>
      </mesh>
      {[-1,1].map((side,index) => (
        <group key={side} position={[side*.15,-.012,.012]}>
          <mesh scale={[1,1.26,.76]}>
            <sphereGeometry args={[.063,16,12]}/>
            <meshStandardMaterial color="#30284f" roughness={.42}/>
          </mesh>
          <mesh position={[0,0,.046]} rotation={[Math.PI/2,0,0]}>
            <cylinderGeometry args={[.043,.043,.014,20]}/>
            <meshStandardMaterial color={index===0 ? "#9d78f3" : "#738eff"}
              metalness={.18} roughness={.28}/>
          </mesh>
          <mesh position={[0,0,.055]}>
            <torusGeometry args={[.035,.005,7,20]}/>
            <meshBasicMaterial color={index===0 ? "#f2a7ff" : "#8ee5ff"} toneMapped={false}/>
          </mesh>
          <mesh position={[0,0,.056]}>
            <circleGeometry args={[.026,20]}/>
            <meshStandardMaterial color="#252441" roughness={.72}/>
          </mesh>
        </group>
      ))}
      <mesh position={[0,.02,.026]}>
        <boxGeometry args={[.018,.09,.028]}/>
        <meshStandardMaterial color="#bcb9d4" metalness={.2} roughness={.34}/>
      </mesh>
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

function FloorPlant() {
  return (
    <group name="reference-floor-plant" position={[1.16,0,.10]} scale={.82}>
      <mesh position={[0,.23,0]} castShadow receiveShadow>
        <cylinderGeometry args={[.16,.12,.38,24,1,true]}/>
        <meshStandardMaterial color="#d8d0ef" metalness={.06} roughness={.27} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0,.42,0]} castShadow>
        <torusGeometry args={[.15,.014,10,28]}/>
        <meshStandardMaterial color="#f5f0ff" metalness={.12} roughness={.24}/>
      </mesh>
      <mesh position={[0,.41,0]}>
        <cylinderGeometry args={[.138,.138,.014,24]}/>
        <meshStandardMaterial color="#514333" roughness={.9}/>
      </mesh>
      <mesh position={[0,.035,0]} castShadow>
        <cylinderGeometry args={[.135,.14,.05,24]}/>
        <meshStandardMaterial color="#8d82b8" metalness={.18} roughness={.3}/>
      </mesh>
      {Array.from({length:11},(_,index) => {
        const angle = index * 2.39996;
        const height = .36 + (index % 4) * .065;
        const reach = .12 + (index % 3) * .035;
        const color = index % 3 === 0 ? "#347c57" : index % 3 === 1 ? "#58a16b" : "#2f694d";
        const x = Math.cos(angle)*reach;
        const z = Math.sin(angle)*reach;
        return <group key={index} position={[Math.cos(angle)*.035,.41,Math.sin(angle)*.035]}>
          <mesh position={[x*.42,height*.48,z*.42]} rotation={[0,0,-Math.cos(angle)*.18]}>
            <cylinderGeometry args={[.005,.008,height,7]}/>
            <meshStandardMaterial color="#527f55" roughness={.82}/>
          </mesh>
          <mesh position={[x,height*.69,z]} rotation={[Math.cos(angle)*.18,angle,-Math.sin(angle)*.16]}
            scale={[.065,.18+(index%3)*.015,.026]} castShadow>
            <sphereGeometry args={[1,14,10]}/>
            <meshStandardMaterial color={color} roughness={.62} side={THREE.DoubleSide}/>
          </mesh>
        </group>;
      })}
    </group>
  );
}

const SHELF_EDGES = [
  { x: -.90, y: 1.486, width: .58 },
  { x: .45, y: 1.636, width: .57 },
  { x: -.50, y: 1.836, width: .80 },
] as const;

export function StudioReferenceDressing({ lightsOn, onOpenComputer, onExplore, pcX=1.02, includeFloorPlant=false }: {
  lightsOn:boolean;
  onOpenComputer:()=>void;
  onExplore:()=>void;
  pcX?:number;
  includeFloorPlant?:boolean;
}) {
  return (
    <group name="reference-detailed-room-dressing">
      <group onClick={event => {event.stopPropagation();onOpenComputer();}}>
        {FAN_LIGHTS.map(({y,color}) =>
          <GlowingFan key={y} x={pcX} y={y} color={color} enabled={lightsOn}/>)}
      </group>

      {/* A pair of raised white gamepads with genuine depth, in front of
          the right-wall pegboard rather than flat colored blockout disks. */}
      <group onClick={event => {event.stopPropagation();onExplore();}}>
        <Controller y={1.86} color="#e984ed"/>
        <Controller y={1.60} color="#72ccff"/>
        <WallHeadset/>
      </group>

      <ShelfBooks/>
      {SHELF_EDGES.map(({x,y,width},index) => (
        <group key={index}>
          <mesh position={[x,y,-1.646]}>
            <boxGeometry args={[width,.008,.014]}/>
            <meshBasicMaterial color={lightsOn ? index===1 ? "#8ce5ff" : "#b9a1ff" : "#41465f"}
              toneMapped={false}/>
          </mesh>
          <pointLight position={[x,y-.10,-1.48]} color={index===1?"#71dfff":"#9c83ff"}
            intensity={lightsOn?.18:.012} distance={.85} decay={2}/>
        </group>
      ))}

      {/* Trailing leaves make the wall shelving organic rather than isolated
          green spheres. Curved stems are geometry, not 2D image cards. */}
      {TRAILS.map(vine=><HangingVine key={vine.x}
        x={vine.x} y={vine.y} count={vine.count} phase={vine.phase}/>)}
      {includeFloorPlant && <FloorPlant/>}

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
