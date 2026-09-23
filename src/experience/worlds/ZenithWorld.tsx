import { Connector, MachineMaterial, type Point3, type WorldProps } from "./shared";

const panelRows = [-0.34, 0.34] as const;
const panelColumns = [-0.48, 0, 0.48] as const;
const irradianceStart: Point3 = [-0.68, 0.92, -0.08];

export function ZenithWorld({ quality }: WorldProps) {
  const columns = quality === "low" ? panelColumns.filter((_, index) => index !== 1) : panelColumns;

  return (
    <group rotation={[0.12, -0.18, -0.12]}>
      {panelRows.flatMap((y, row) =>
        columns.map((x, column) => {
          const position: Point3 = [x, y, -0.06 + row * 0.035 + column * 0.012];
          return (
            <group key={`${row}-${column}`} position={position} rotation={[-0.16, 0, 0.08]}>
              <mesh>
                <boxGeometry args={[0.39, 0.035, 0.27]} />
                <MachineMaterial tint="#24292d" roughness={0.3} metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.022, 0]}>
                <boxGeometry args={[0.31, 0.008, 0.2]} />
                <MachineMaterial tint="#737a7e" opacity={0.46} transparent wireframe />
              </mesh>
            </group>
          );
        }),
      )}
      <Connector
        from={irradianceStart}
        to={[0.1, 0.36, 0.18]}
        tint="#ff1728"
        radius={0.008}
      />
      <Connector
        from={irradianceStart}
        to={[-0.48, 0.34, 0.12]}
        tint="#d7d7d2"
        radius={0.006}
      />
      <mesh position={irradianceStart}>
        <sphereGeometry args={[0.045, quality === "high" ? 16 : 8, 8]} />
        <MachineMaterial tint="#d7d7d2" roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.36, 0.19]}>
        <sphereGeometry args={[0.034, 10, 8]} />
        <MachineMaterial tint="#ff1728" roughness={0.22} />
      </mesh>
    </group>
  );
}
