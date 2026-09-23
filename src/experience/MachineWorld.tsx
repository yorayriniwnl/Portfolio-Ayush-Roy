import { memo, useRef, type ComponentType, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import type { SceneQuality } from "../components/sceneQuality";
import type { ExperienceState, ProjectId } from "./experience-state";
import { MachineCore } from "./MachineCore";
import { AiVsRealWorld } from "./worlds/AiVsRealWorld";
import { CandidateXWorld } from "./worlds/CandidateXWorld";
import { HeliosWorld } from "./worlds/HeliosWorld";
import { PortfolioWorld } from "./worlds/PortfolioWorld";
import { TalksWorld } from "./worlds/TalksWorld";
import { ZenithWorld } from "./worlds/ZenithWorld";
import type { Point3, WorldProps } from "./worlds/shared";

const worlds: Record<ProjectId, ComponentType<WorldProps>> = {
  candidatex: CandidateXWorld,
  zenith: ZenithWorld,
  helios: HeliosWorld,
  "ai-vs-real": AiVsRealWorld,
  talks: TalksWorld,
  portfolio: PortfolioWorld,
};

const positions: Record<ProjectId, Point3> = {
  candidatex: [1.6, 0, -0.82],
  zenith: [0.8, 1.38, -0.92],
  helios: [-0.8, 1.38, -0.92],
  "ai-vs-real": [-1.6, 0, -0.82],
  talks: [-0.8, -1.38, -0.92],
  portfolio: [0.8, -1.38, -0.92],
};

function ProjectWorld({
  projectId,
  stateRef,
  quality,
}: {
  projectId: ProjectId;
  stateRef: MutableRefObject<ExperienceState>;
  quality: SceneQuality;
}) {
  const group = useRef<THREE.Group>(null);
  const World = worlds[projectId];

  useFrame((_, delta) => {
    if (!group.current) return;
    const state = stateRef.current;
    const selected = state.projectId === projectId || state.activeProject === projectId;
    const target = selected ? [1.48, 0.18, 0.18] : positions[projectId];
    const targetScale = selected ? 0.78 : state.projectId || state.activeProject ? 0.12 : 0.25;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, target[0], 3.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, target[1], 3.2, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, target[2], 3.2, delta);
    const scale = THREE.MathUtils.damp(group.current.scale.x, targetScale, 3.2, delta);
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group} position={positions[projectId]} scale={0.25}>
      <World quality={quality} />
    </group>
  );
}

export const MachineWorld = memo(function MachineWorld({
  stateRef,
  quality,
}: {
  stateRef: MutableRefObject<ExperienceState>;
  quality: SceneQuality;
}) {
  const root = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!root.current) return;
    const state = stateRef.current;
    const targetY = (state.progress - 0.5) * 0.035;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 2.4, delta);
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.32} />
      <directionalLight position={[-3, 4, 5]} intensity={2.5} color="#c6c9c8" />
      <directionalLight position={[2.8, -1, -1]} intensity={0.8} color="#5d0710" />
      <MachineCore stateRef={stateRef} quality={quality} />
      {(Object.keys(worlds) as ProjectId[]).map((projectId) => (
        <ProjectWorld
          key={projectId}
          projectId={projectId}
          stateRef={stateRef}
          quality={quality}
        />
      ))}
    </group>
  );
});
