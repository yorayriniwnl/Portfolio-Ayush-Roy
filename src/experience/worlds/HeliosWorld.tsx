import { useMemo } from "react";
import * as THREE from "three/webgpu";
import { MachineMaterial, type WorldProps } from "./shared";

export function HeliosWorld({ quality }: WorldProps) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.94, -0.28, 0),
        new THREE.Vector3(-0.63, -0.12, 0.02),
        new THREE.Vector3(-0.34, 0.11, -0.02),
        new THREE.Vector3(-0.02, 0.02, 0.04),
        new THREE.Vector3(0.28, 0.24, 0.02),
        new THREE.Vector3(0.56, -0.2, 0.08),
        new THREE.Vector3(0.92, 0.12, 0),
      ]),
    [],
  );
  const segments = quality === "high" ? 56 : quality === "medium" ? 36 : 20;

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, segments, 0.025, quality === "high" ? 8 : 5, false]} />
        <MachineMaterial tint="#8c969a" roughness={0.38} metalness={0.82} />
      </mesh>
      <mesh position={[0.56, -0.2, 0.08]}>
        <sphereGeometry args={[0.075, quality === "high" ? 18 : 10, 8]} />
        <MachineMaterial tint="#ff1728" roughness={0.24} metalness={0.54} />
      </mesh>
      <mesh position={[-0.34, 0.11, 0]}>
        <sphereGeometry args={[0.033, 10, 8]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.62} transparent />
      </mesh>
      <mesh position={[0.28, 0.24, 0]}>
        <sphereGeometry args={[0.033, 10, 8]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.62} transparent />
      </mesh>
      <mesh position={[0.56, -0.2, -0.02]}>
        <ringGeometry args={[0.11, 0.13, quality === "high" ? 32 : 18]} />
        <MachineMaterial tint="#ff1728" opacity={0.55} transparent wireframe />
      </mesh>
    </group>
  );
}
