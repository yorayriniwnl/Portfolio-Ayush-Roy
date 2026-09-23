import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";

const fragments: readonly Point3[] = [
  [-0.75, 0.52, 0.1],
  [-0.44, 0.3, 0.1],
  [-0.78, 0.03, 0.1],
  [-0.28, -0.34, 0.1],
  [0.42, 0.45, 0.1],
  [0.7, 0.2, 0.1],
  [0.34, -0.1, 0.1],
  [0.76, -0.42, 0.1],
];

export function AiVsRealWorld({ quality }: WorldProps) {
  const shownFragments = quality === "low" ? fragments.filter((_, index) => index % 2 === 0) : fragments;

  return (
    <group>
      <mesh position={[-0.48, 0.02, -0.1]} rotation={[0, 0, -0.12]}>
        <planeGeometry args={[0.74, 1.16]} />
        <MachineMaterial tint="#778086" opacity={0.16} transparent wireframe />
      </mesh>
      <mesh position={[0.48, 0.02, -0.1]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[0.74, 1.16]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.11} transparent wireframe />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.018, 1.28, 0.018]} />
        <MachineMaterial tint="#ff1728" roughness={0.22} />
      </mesh>
      <Connector from={[-0.94, -0.7, 0.08]} to={[0.94, 0.7, 0.08]} tint="#77787d" radius={0.006} />
      {shownFragments.map((position, index) => (
        <mesh
          key={index}
          position={position}
          rotation={[0, 0, (index % 2 === 0 ? 1 : -1) * 0.16]}
        >
          {index % 3 === 0 ? (
            <boxGeometry args={[0.16, 0.1, 0.025]} />
          ) : (
            <planeGeometry args={[0.13, 0.16]} />
          )}
          <MachineMaterial
            tint={position[0] < 0 ? "#535b61" : "#c0c3c1"}
            opacity={0.62}
            transparent
            wireframe={index % 2 === 0}
          />
        </mesh>
      ))}
      <mesh position={[0.91, 0.66, 0.15]}>
        <sphereGeometry args={[0.035, quality === "high" ? 14 : 8, 8]} />
        <MachineMaterial tint="#ff1728" />
      </mesh>
    </group>
  );
}
