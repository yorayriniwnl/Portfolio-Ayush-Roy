import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";
import { SIGNAL } from "../palette";

// A radar of network flows: most read as quiet, one is flagged by the anomaly stream.
const flows: readonly Point3[] = [
  [-0.52, 0.34, 0],
  [0.48, -0.42, 0.02],
  [-0.38, -0.5, -0.02],
  [0.62, 0.18, 0],
  [-0.66, -0.06, 0.02],
];
const flagged: Point3 = [0.42, 0.46, 0.06];

export function FalseQuietWorld({ quality }: WorldProps) {
  const visibleFlows = quality === "low" ? flows.slice(0, 3) : flows;
  const segments = quality === "high" ? 48 : 24;

  return (
    <group>
      <mesh>
        <torusGeometry args={[0.8, 0.012, 6, segments]} />
        <MachineMaterial tint="#737a7e" roughness={0.5} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.008, 6, segments]} />
        <MachineMaterial tint="#454b50" opacity={0.7} transparent />
      </mesh>
      <Connector from={[0, 0, 0]} to={flagged} tint={SIGNAL} radius={0.014} />
      {visibleFlows.map((position, index) => (
        <mesh key={`flow-${index}`} position={position}>
          <sphereGeometry args={[0.045, quality === "high" ? 12 : 8, 8]} />
          <MachineMaterial tint="#626a6e" roughness={0.36} />
        </mesh>
      ))}
      <mesh position={flagged}>
        <sphereGeometry args={[0.085, quality === "high" ? 16 : 10, 8]} />
        <MachineMaterial tint={SIGNAL} roughness={0.24} metalness={0.54} />
      </mesh>
      <mesh position={[flagged[0], flagged[1], flagged[2] - 0.08]}>
        <ringGeometry args={[0.12, 0.14, quality === "high" ? 32 : 18]} />
        <MachineMaterial tint={SIGNAL} opacity={0.55} transparent wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.07, 12, 8]} />
        <MachineMaterial tint="#d7d7d2" roughness={0.3} />
      </mesh>
    </group>
  );
}
