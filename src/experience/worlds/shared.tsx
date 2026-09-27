import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { color } from "three/tsl";
import type { SceneQuality } from "../../components/sceneQuality";
import type { ExperienceState } from "../experience-state";

export type WorldProps = { quality: SceneQuality; demo?: ExperienceState["demo"] };
export type Point3 = readonly [number, number, number];

export function MachineMaterial({
  tint,
  opacity = 1,
  transparent = false,
  wireframe = false,
  roughness = 0.42,
  metalness = 0.78,
}: {
  tint: string;
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
}) {
  const material = useMemo(() => {
    const next = new THREE.MeshStandardNodeMaterial();
    next.colorNode = color(tint);
    next.roughness = roughness;
    next.metalness = metalness;
    next.transparent = transparent;
    next.opacity = opacity;
    next.wireframe = wireframe;
    next.depthWrite = !transparent;
    return next;
  }, [metalness, opacity, roughness, tint, transparent, wireframe]);

  useEffect(() => () => material.dispose(), [material]);

  return <primitive object={material} attach="material" />;
}

export function Connector({
  from,
  to,
  tint = "#596066",
  radius = 0.012,
}: {
  from: Point3;
  to: Point3;
  tint?: string;
  radius?: number;
}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);
    const midpoint = start.add(end).multiplyScalar(0.5);
    return {
      position: [midpoint.x, midpoint.y, midpoint.z] as Point3,
      rotation: [rotation.x, rotation.y, rotation.z] as Point3,
      length: direction.length(),
    };
  }, [from, to]);

  return (
    <mesh position={transform.position} rotation={transform.rotation}>
      <cylinderGeometry args={[radius, radius, transform.length, 6]} />
      <MachineMaterial tint={tint} roughness={0.58} metalness={0.62} />
    </mesh>
  );
}
