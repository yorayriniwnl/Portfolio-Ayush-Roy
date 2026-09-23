import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import type { ExperienceState } from "./experience-state";
import { MachineMaterial } from "./worlds/shared";

const plateAngles = [0, Math.PI / 3, (Math.PI * 2) / 3, Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3];

export function MachineCore({
  stateRef,
  quality,
}: {
  stateRef: MutableRefObject<ExperienceState>;
  quality: "low" | "medium" | "high";
}) {
  const machine = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Group>(null);
  const petals = useRef<THREE.Group>(null);
  const radialSegments = quality === "high" ? 12 : quality === "medium" ? 10 : 8;

  useFrame((_, delta) => {
    if (!machine.current || !rotor.current || !petals.current) return;
    const state = stateRef.current;
    const selectionBias = state.projectId || state.activeProject ? 0.12 : 0;
    const targetX = selectionBias + (state.progress - 0.5) * 0.08;
    const targetY = (state.progress - 0.5) * 0.18;
    const targetRotor = state.progress * 1.12;
    const opening = Math.max(0, Math.min(1, state.progress / 0.72));
    machine.current.rotation.x = THREE.MathUtils.damp(machine.current.rotation.x, targetX, 3, delta);
    machine.current.rotation.y = THREE.MathUtils.damp(machine.current.rotation.y, targetY, 3, delta);
    rotor.current.rotation.z = THREE.MathUtils.damp(rotor.current.rotation.z, targetRotor, 2.5, delta);
    rotor.current.position.z = THREE.MathUtils.damp(
      rotor.current.position.z,
      0.12 + opening * 0.16,
      2.5,
      delta,
    );
    petals.current.children.forEach((petal, index) => {
      const angle = plateAngles[index];
      const radius = 0.94 + opening * 0.46;
      petal.position.x = THREE.MathUtils.damp(
        petal.position.x,
        Math.cos(angle) * radius,
        2.6,
        delta,
      );
      petal.position.y = THREE.MathUtils.damp(
        petal.position.y,
        Math.sin(angle) * radius,
        2.6,
        delta,
      );
      petal.position.z = THREE.MathUtils.damp(petal.position.z, 0.12 + opening * 0.08, 2.6, delta);
    });
  });

  return (
    <group ref={machine}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.06, 1.06, 0.12, radialSegments, 1, true]} />
        <MachineMaterial tint="#41464a" opacity={0.56} transparent metalness={0.94} roughness={0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.82, 0.76, 0.14, radialSegments, 1, true]} />
        <MachineMaterial tint="#8b9090" opacity={0.5} transparent metalness={0.94} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.09]}>
        <cylinderGeometry args={[0.69, 0.69, 0.08, radialSegments]} />
        <MachineMaterial tint="#111417" metalness={0.92} roughness={0.33} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.48, 0.48, 0.06, radialSegments, 1, true]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.48} transparent metalness={0.96} roughness={0.24} />
      </mesh>
      <group ref={rotor} position={[0, 0, 0.12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.16, radialSegments]} />
          <MachineMaterial tint="#252a2e" metalness={0.94} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[0.08, 0.56, 0.035]} />
          <MachineMaterial tint="#ff1728" opacity={0.84} transparent roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, 0.145]}>
          <boxGeometry args={[0.38, 0.035, 0.035]} />
          <MachineMaterial tint="#d7d7d2" opacity={0.72} transparent roughness={0.22} />
        </mesh>
      </group>
      <group ref={petals}>
        {plateAngles.map((angle, index) => (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.94, Math.sin(angle) * 0.94, 0.12]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.38, 0.13, 0.2]} />
            <MachineMaterial
              tint={index === 0 ? "#555c60" : "#202428"}
              opacity={index % 2 === 0 ? 0.92 : 0.74}
              transparent={index % 2 !== 0}
              roughness={0.31}
              metalness={0.88}
            />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 0, 1.45]} intensity={quality === "low" ? 5 : 9} color="#ff1728" distance={3.5} />
      <pointLight position={[-1.3, 0.8, 1]} intensity={quality === "high" ? 4 : 2} color="#aab0b1" distance={4} />
    </group>
  );
}
