import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";

const messageNodes: readonly Point3[] = [
  [0, 0, 0.05],
  [-0.66, 0.48, 0],
  [0.68, 0.47, 0],
  [-0.82, -0.27, -0.04],
  [0.12, -0.62, 0.02],
  [0.86, -0.28, -0.02],
];

const messageEdges = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 3], [2, 5],
] as const;

export function TalksWorld({ quality }: WorldProps) {
  const nodes = quality === "low" ? messageNodes.slice(0, 5) : messageNodes;
  const edges = messageEdges.filter(
    ([start, end]) => start < nodes.length && end < nodes.length,
  );

  return (
    <group>
      {edges.map(([start, end], index) => (
        <Connector
          key={`message-edge-${index}`}
          from={messageNodes[start]}
          to={messageNodes[end]}
          radius={index < 5 ? 0.01 : 0.007}
          tint={index === 0 ? "#737a7e" : "#454b50"}
        />
      ))}
      {nodes.map((position, index) => (
        <mesh key={`message-node-${index}`} position={position}>
          <sphereGeometry args={[index === 0 ? 0.09 : 0.055, quality === "high" ? 14 : 8, 8]} />
          <MachineMaterial
            tint={index === 0 ? "#d7d7d2" : index === 4 ? "#ff1728" : "#626a6e"}
            roughness={0.31}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.09]}>
        <dodecahedronGeometry args={[0.24, 0]} />
        <MachineMaterial tint="#111417" opacity={0.42} transparent wireframe />
      </mesh>
    </group>
  );
}
