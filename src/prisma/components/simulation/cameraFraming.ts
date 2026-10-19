import { Box3, Vector3 } from 'three'
import type { ExperimentConfig, ExperimentResult, RaySegment } from '../../physics/optics'

export type CameraView = 'perspective' | 'top'
export const CAMERA_FOV = 43

/** Consume pending orbit/pan inertia before replacing the camera framing. */
export function settleOrbitControls(controls: { enableDamping: boolean; update: () => unknown }): void {
  const damping = controls.enableDamping
  controls.enableDamping = false
  controls.update()
  controls.enableDamping = damping
}

/** Clip only the displayed rays; physical screen hits remain unchanged. */
export function clipRayToViewBounds(segment: RaySegment, screenX: number): RaySegment | null {
  const deltaX = segment.to.x - segment.from.x
  const deltaZ = segment.to.z - segment.from.z
  let start = 0, end = 1
  for (const [p, q] of [[-deltaX, segment.from.x + 5], [deltaX, screenX - segment.from.x], [-deltaZ, segment.from.z + 12], [deltaZ, 12 - segment.from.z]]) {
    if (Math.abs(p) < 1e-10) { if (q < 0) return null; continue }
    const fraction = q / p
    if (p < 0) start = Math.max(start, fraction)
    else end = Math.min(end, fraction)
    if (start > end) return null
  }
  return {
    ...segment,
    from: { x: segment.from.x + deltaX * start, z: segment.from.z + deltaZ * start },
    to: { x: segment.from.x + deltaX * end, z: segment.from.z + deltaZ * end },
  }
}

/** Fit each apparatus separately, rather than the empty corners of its table. */
export function experimentFramingPoints(experiment: ExperimentResult, config: ExperimentConfig, minimumZ: number, maximumZ: number, showNormals = false): Vector3[] {
  const points: Vector3[] = []
  const box = (min: [number, number, number], max: [number, number, number], transform?: (point: Vector3) => Vector3) => {
    for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
      const point = new Vector3(x, y, z)
      points.push(transform ? transform(point) : point)
    }
  }
  const { x, z } = experiment.source
  box([x - 0.62, 0, z - 0.32], [x + 0.14, 0.64, z + 0.32])
  const lampRotation = -config.lightAngle * Math.PI / 180
  const vertical = new Vector3(0, 1, 0)
  box([-0.70, -0.24, -0.24], [0.04, 0.28, 0.24], (point) =>
    point.applyAxisAngle(vertical, lampRotation).add(new Vector3(x, 0.84, z)))

  box([-0.86, 0.015, -0.86], [0.86, 0.26, 0.86])
  for (const vertex of experiment.vertices) {
    points.push(new Vector3(vertex.x, 0.34, vertex.z), new Vector3(vertex.x, 1.33, vertex.z))
  }
  const screenX = experiment.screenX
  box([screenX - 0.018, 0.21, minimumZ - 0.065], [screenX + 0.073, 1.73, maximumZ + 0.065])
  for (const footZ of [minimumZ + 0.13, maximumZ - 0.13]) {
    box([screenX - 0.185, 0, footZ - 0.115], [screenX + 0.315, 0.37, footZ + 0.115])
  }
  for (const ray of experiment.rays) for (const original of ray.segments) {
    const segment = clipRayToViewBounds(original, screenX)
    if (segment) points.push(new Vector3(segment.from.x, 0.84, segment.from.z), new Vector3(segment.to.x, 0.84, segment.to.z))
  }
  if (showNormals) {
    const central = experiment.rays.find((ray) => ray.wavelength === 550 && ray.offset === 0)
    for (const interaction of central?.interactions ?? []) {
      for (const length of [-0.36, 0.56]) points.push(new Vector3(
        interaction.point.x + interaction.normal.x * length, 0.846,
        interaction.point.z + interaction.normal.z * length))
    }
  }
  return points
}

/** Minimal perspective distance satisfying all four viewport edges. */
export function fitExperimentCamera(points: Vector3[], width: number, height: number, view: CameraView, orbitDirection?: Vector3) {
  const aspect = Math.max(0.1, width / Math.max(1, height))
  // A diagonal view makes better use of a phone's available height.
  const direction = orbitDirection?.clone().normalize() ?? (view === 'top'
    ? new Vector3(0, 1, 0)
    : aspect < 1.4 ? new Vector3(-0.9, 0.95, 0.4).normalize() : new Vector3(-0.5, 0.62, 0.85).normalize())
  const up = view === 'top' ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0)
  if (Math.abs(direction.dot(up)) > 0.9999) up.set(0, 0, -1)
  const right = new Vector3().crossVectors(up, direction).normalize()
  const vertical = new Vector3().crossVectors(direction, right).normalize()
  const origin = new Box3().setFromPoints(points).getCenter(new Vector3())
  const padding = Math.max(14, Math.min(24, Math.min(width, height) * 0.055))
  const tangent = Math.tan(CAMERA_FOV * Math.PI / 360)
  const horizontalSlope = tangent * aspect * Math.max(0.1, 1 - 2 * padding / width)
  const verticalSlope = tangent * Math.max(0.1, 1 - 2 * padding / height)
  let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity, maxDepth = -Infinity
  const relative = new Vector3()
  for (const point of points) {
    relative.copy(point).sub(origin)
    const depth = relative.dot(direction)
    const x = relative.dot(right), y = relative.dot(vertical)
    maxX = Math.max(maxX, x + horizontalSlope * depth)
    minX = Math.min(minX, x - horizontalSlope * depth)
    maxY = Math.max(maxY, y + verticalSlope * depth)
    minY = Math.min(minY, y - verticalSlope * depth)
    maxDepth = Math.max(maxDepth, depth)
  }
  const distance = Math.max(4, maxDepth + 0.2,
    (maxX - minX) / (2 * horizontalSlope), (maxY - minY) / (2 * verticalSlope)) + 0.01
  const target = origin.addScaledVector(right, (maxX + minX) / 2).addScaledVector(vertical, (maxY + minY) / 2)
  return {
    target, position: target.clone().addScaledVector(direction, distance), up, distance, padding,
    far: Math.max(160, distance + new Box3().setFromPoints(points).getSize(new Vector3()).length() * 2),
  }
}
