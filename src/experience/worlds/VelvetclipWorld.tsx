import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";
import { SIGNAL } from "../palette";

// Document sheets stay inside the browser frame; the upload path outside it is cut.
const sheets: readonly Point3[] = [
  [-0.36, 0.06, 0.02],
  [-0.12, 0.02, 0.06],
  [0.12, -0.02, 0.1],
];

export function VelvetclipWorld({ quality }: WorldProps) {
  const visibleSheets = quality === "low" ? sheets.slice(1) : sheets;

  return (
    <group>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[1.36, 0.92, 0.04]} />
        <MachineMaterial tint="#111417" opacity={0.48} transparent wireframe />
      </mesh>
      <mesh position={[0, 0.38, -0.03]}>
        <boxGeometry args={[1.36, 0.1, 0.03]} />
        <MachineMaterial tint="#454b50" roughness={0.5} />
      </mesh>
      {visibleSheets.map((position, index) => (
        <mesh key={`sheet-${index}`} position={position} rotation={[0, 0, -0.08 + index * 0.06]}>
          <boxGeometry args={[0.34, 0.46, 0.012]} />
          <MachineMaterial
            tint={index === visibleSheets.length - 1 ? SIGNAL : "#d7d7d2"}
            roughness={0.34}
            metalness={0.5}
          />
        </mesh>
      ))}
      <Connector from={[0.5, 0, 0]} to={[0.94, 0, 0]} tint="#454b50" radius={0.008} />
      <mesh position={[0.82, 0, 0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.18, 0.024, 0.024]} />
        <MachineMaterial tint={SIGNAL} />
      </mesh>
      <mesh position={[0.82, 0, 0.02]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.18, 0.024, 0.024]} />
        <MachineMaterial tint={SIGNAL} />
      </mesh>
    </group>
  );
}
