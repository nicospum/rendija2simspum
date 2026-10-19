import { Box3, Vector3 } from 'three'

export const CAMERA_FOV = 43
export type CameraView = 'perspective' | 'top'

/** Apparatus bounds, excluding the unused corners of the optical table. */
export function apparatusBounds(screenDistance: number): Vector3[] {
  const points: Vector3[] = []
  const box = (min: [number, number, number], max: [number, number, number]) => {
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          points.push(new Vector3(x, y, z))
        }
  }
  box([-3.95, 0, -0.48], [-2.75, 1.6, 0.48])
  box([-0.375, 0, -1.6], [0.375, 2.12, 1.6])
  box([screenDistance - 0.28, 0, -3.16], [screenDistance + 0.38, 2.38, 3.16])
  return points
}

/** Solve the four perspective edge constraints, retaining a pixel margin. */
export function fitCamera(
  points: Vector3[],
  width: number,
  height: number,
  view: CameraView,
  orbitDirection?: Vector3,
) {
  const aspect = Math.max(0.1, width / Math.max(1, height))
  const direction =
    orbitDirection?.clone().normalize() ??
    (view === 'top'
      ? new Vector3(0, 1, 0)
      : aspect < 1.35
        ? new Vector3(-1.1, 0.95, 0.44).normalize()
        : new Vector3(-0.66, 0.8, 1).normalize())
  const up = view === 'top' ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0)
  if (Math.abs(up.dot(direction)) > 0.9999) up.set(0, 0, -1)
  const right = new Vector3().crossVectors(up, direction).normalize()
  const vertical = new Vector3().crossVectors(direction, right).normalize()
  const target = new Box3().setFromPoints(points).getCenter(new Vector3())
  const padding = Math.max(20, Math.min(32, Math.min(width, height) * 0.065))
  const tangent = Math.tan((CAMERA_FOV * Math.PI) / 360)
  const horizontal = tangent * aspect * Math.max(0.1, 1 - (2 * padding) / width)
  const upright = tangent * Math.max(0.1, 1 - (2 * padding) / height)
  let maxX = -Infinity,
    minX = Infinity,
    maxY = -Infinity,
    minY = Infinity,
    maxDepth = -Infinity
  const relative = new Vector3()
  for (const point of points) {
    relative.copy(point).sub(target)
    const depth = relative.dot(direction),
      x = relative.dot(right),
      y = relative.dot(vertical)
    maxX = Math.max(maxX, x + horizontal * depth)
    minX = Math.min(minX, x - horizontal * depth)
    maxY = Math.max(maxY, y + upright * depth)
    minY = Math.min(minY, y - upright * depth)
    maxDepth = Math.max(maxDepth, depth)
  }
  const distance =
    Math.max(4, maxDepth + 0.2, (maxX - minX) / (2 * horizontal), (maxY - minY) / (2 * upright)) +
    0.01
  target.addScaledVector(right, (maxX + minX) / 2).addScaledVector(vertical, (maxY + minY) / 2)
  return {
    target,
    up,
    position: target.clone().addScaledVector(direction, distance),
    distance,
    padding,
  }
}
