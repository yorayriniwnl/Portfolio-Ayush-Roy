export type CameraPoint = [number, number, number];

export const STUDIO_TARGET: CameraPoint = [0.12, 1.12, 0];

export const STUDIO_LIMITS = {
  minDistance: 2.8,
  maxDistance: 9.5,
  minPolarAngle: Math.PI * 0.29,
  maxPolarAngle: Math.PI * 0.51,
  minAzimuthAngle: -Math.PI * 0.3,
  maxAzimuthAngle: Math.PI * 0.3,
} as const;

/** Frame both characters, including their ears, at every viewport shape. */
export function getStudioCamera(aspect: number): { eye: CameraPoint; target: CameraPoint; fov: number } {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? Math.max(0.45, Math.min(aspect, 4)) : 1.6;
  const fov = 42;
  const halfFov = (fov * Math.PI) / 360;
  const distance = Math.min(STUDIO_LIMITS.maxDistance, Math.max(3.3, 3.15 / (2 * Math.tan(halfFov) * safeAspect)));
  return {
    eye: [STUDIO_TARGET[0] + 0.08, STUDIO_TARGET[1] + 0.65, Math.sqrt(distance * distance - 0.65 * 0.65 - 0.08 * 0.08)],
    target: [...STUDIO_TARGET],
    fov,
  };
}
