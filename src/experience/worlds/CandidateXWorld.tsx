import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";

const evidenceNodes: readonly Point3[] = [
  [-0.92, 0.34, 0],
  [-0.46, 0.82, -0.06],
  [0.02, 0.48, 0.02],
  [0.68, 0.79, -0.04],
  [-0.58, -0.42, 0.03],
  [0.08, -0.68, 0.02],
  [0.78, -0.24, -0.02],
];

const evidenceEdges = [
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [2, 5],
] as const;

export function CandidateXWorld({ quality }: WorldProps) {
  const visibleNodes = quality === "low" ? evidenceNodes.slice(0, 5) : evidenceNodes;
  const visibleEdges = evidenceEdges.filter(
    ([start, end]) => start < visibleNodes.length && end < visibleNodes.length,
  );

  return (
    <group>
      {visibleEdges.map(([start, end], index) => (
        <Connector
          key={`edge-${index}`}
          from={evidenceNodes[start]}
          to={evidenceNodes[end]}
          radius={quality === "low" ? 0.014 : 0.01}
          tint={index === 6 ? "#6e1a22" : "#596066"}
        />
      ))}
      {visibleNodes.map((position, index) => (
        <mesh key={`node-${index}`} position={position}>
          <sphereGeometry args={[index === 2 ? 0.09 : 0.055, quality === "high" ? 16 : 10, 8]} />
          <MachineMaterial
            tint={index === 2 ? "#ff1728" : index === 0 ? "#d7d7d2" : "#777d81"}
            roughness={0.34}
          />
        </mesh>
      ))}
      <mesh position={[0.02, 0.48, -0.14]} rotation={[0, 0, 0.16]}>
        <boxGeometry args={[0.68, 0.035, 0.28]} />
        <MachineMaterial tint="#34383b" opacity={0.42} transparent />
      </mesh>
      <mesh position={[0.02, 0.48, -0.19]} rotation={[0, 0, 0.16]}>
        <boxGeometry args={[0.58, 0.022, 0.24]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.22} transparent wireframe />
      </mesh>
    </group>
  );
}
