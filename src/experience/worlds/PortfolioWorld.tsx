import { MachineMaterial, type WorldProps } from "./shared";

export function PortfolioWorld({ quality }: WorldProps) {
  const detailSides = quality === "high" ? 12 : 8;

  return (
    <group rotation={[0.18, -0.24, 0.08]}>
      <mesh position={[-0.38, 0.22, 0]} rotation={[0, 0, -0.24]}>
        <boxGeometry args={[0.68, 0.12, 0.58]} />
        <MachineMaterial tint="#303539" roughness={0.31} metalness={0.91} />
      </mesh>
      <mesh position={[0.34, 0.18, 0.08]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.64, 0.1, 0.54]} />
        <MachineMaterial tint="#171a1d" roughness={0.39} metalness={0.82} />
      </mesh>
      <mesh position={[-0.1, -0.28, 0.14]} rotation={[0.08, 0.2, -0.1]}>
        <cylinderGeometry args={[0.3, 0.38, 0.16, detailSides, 1, true]} />
        <MachineMaterial tint="#636a6f" opacity={0.74} transparent />
      </mesh>
      <mesh position={[0.42, -0.4, 0.02]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.42, 0.06, 0.34]} />
        <MachineMaterial tint="#ff1728" opacity={0.76} transparent />
      </mesh>
      <mesh position={[-0.58, -0.38, -0.02]} rotation={[0.1, 0, 0.14]}>
        <boxGeometry args={[0.31, 0.08, 0.28]} />
        <MachineMaterial tint="#d7d7d2" opacity={0.56} transparent />
      </mesh>
      <mesh position={[0, 0.02, 0.29]}>
        <sphereGeometry args={[0.13, detailSides, Math.max(4, Math.round(detailSides / 2))]} />
        <MachineMaterial tint="#08090b" roughness={0.24} metalness={0.94} />
      </mesh>
    </group>
  );
}
