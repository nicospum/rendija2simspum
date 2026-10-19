import assert from 'node:assert/strict'
import test from 'node:test'
import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three-stdlib'
import { DEFAULT_CONFIG, traceExperiment } from '../src/prisma/physics/optics.ts'
import {
  CAMERA_FOV,
  clipRayToViewBounds,
  experimentFramingPoints,
  fitExperimentCamera,
  settleOrbitControls,
} from '../src/prisma/components/simulation/cameraFraming.ts'

const dimensions = [[1280, 500], [900, 390], [390, 310], [320, 310], [240, 800], [1800, 250]]

function screenBounds(experiment) {
  const hits = experiment.rays.flatMap(ray => ray.screenHit && Math.abs(ray.screenHit.z) <= 12 ? [ray.screenHit.z] : [])
  const low = hits.length ? Math.min(...hits) : 0
  const high = hits.length ? Math.max(...hits) : 0
  const center = (low + high) / 2
  const halfWidth = Math.max(0.68, (high - low) / 2 + 0.22)
  return [Math.max(-12, center - halfWidth), Math.min(12, center + halfWidth)]
}

function frame(config, width, height, view, direction) {
  const experiment = traceExperiment(config)
  const bounds = screenBounds(experiment)
  const points = experimentFramingPoints(experiment, config, ...bounds)
  const framing = fitExperimentCamera(points, width, height, view, direction)
  const camera = new PerspectiveCamera(CAMERA_FOV, width / height, 0.1, framing.far)
  camera.position.copy(framing.position)
  camera.up.copy(framing.up)
  camera.lookAt(framing.target)
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()
  return { experiment, bounds, points, framing, camera }
}

// Verify the actual perspective projection, independently of the fitting math.
function projectInside(points, camera, width, height, padding, context) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const point of points) {
    const projected = point.clone().project(camera)
    const x = (projected.x + 1) * width / 2
    const y = (1 - projected.y) * height / 2
    assert.ok([x, y, projected.z].every(Number.isFinite), `${context}: finite projection`)
    assert.ok(projected.z >= -1 && projected.z <= 1, `${context}: near/far clipping`)
    assert.ok(x >= padding - 1e-6 && x <= width - padding + 1e-6, `${context}: horizontal clipping at ${x}`)
    assert.ok(y >= padding - 1e-6 && y <= height - padding + 1e-6, `${context}: vertical clipping at ${y}`)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  return { width: (maxX - minX) / width, height: (maxY - minY) / height }
}

function boxCorners(minimum, maximum) {
  const points = []
  for (const x of [minimum[0], maximum[0]])
    for (const y of [minimum[1], maximum[1]])
      for (const z of [minimum[2], maximum[2]]) points.push(new Vector3(x, y, z))
  return points
}

// These dimensions come from the visible meshes, not from the framing helper.
function apparatusSamples(experiment, config, minimumZ, maximumZ) {
  const { x, z } = experiment.source
  const points = boxCorners([x - 0.62, 0, z - 0.32], [x + 0.14, 0.13, z + 0.32])
  const lamp = []
  for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 16) {
    for (const longitudinal of [-0.66, -0.02]) lamp.push(new Vector3(longitudinal, Math.cos(angle) * 0.215, Math.sin(angle) * 0.215))
    for (const longitudinal of [-0.072, 0.018]) lamp.push(new Vector3(longitudinal, Math.cos(angle) * 0.21, Math.sin(angle) * 0.21))
    for (const longitudinal of [-0.6, -0.51, -0.42, -0.33]) {
      for (const axial of [-0.014, 0.014]) lamp.push(new Vector3(longitudinal + axial, Math.cos(angle) * 0.23, Math.sin(angle) * 0.23))
    }
    for (const [y, radius] of [[0.015, 0.86], [0.155, 0.82]]) points.push(new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
  }
  lamp.push(...boxCorners([-0.43, 0.24, -0.04], [-0.17, 0.28, 0.04]))
  const slitWidth = Math.max(0.012, config.lightWidth)
  lamp.push(...boxCorners([0.022, -0.115, -slitWidth / 2], [0.026, 0.115, slitWidth / 2]))
  const axis = new Vector3(0, 1, 0)
  points.push(...lamp.map(point => point.applyAxisAngle(axis, -config.lightAngle * Math.PI / 180).add(new Vector3(x, 0.84, z))))
  for (const vertex of experiment.vertices) for (const y of [0.34, 1.33]) points.push(new Vector3(vertex.x, y, vertex.z))
  const screenX = experiment.screenX
  points.push(...boxCorners([screenX - 0.0025, 0.21, minimumZ - 0.065], [screenX + 0.0725, 1.73, maximumZ + 0.065]))
  points.push(...boxCorners([screenX - 0.011, 0.28, minimumZ], [screenX + 0.001, 1.66, maximumZ]))
  for (const footZ of [minimumZ + 0.13, maximumZ - 0.13]) {
    points.push(...boxCorners([screenX - 0.185, 0, footZ - 0.115], [screenX + 0.315, 0.11, footZ + 0.115]))
    points.push(...boxCorners([screenX + 0.028, 0.05, footZ - 0.037], [screenX + 0.102, 0.37, footZ + 0.037]))
  }
  return points
}

// Keep the former implementation as a fixed regression baseline. It frames
// the table's empty corners and then adds its original 12% distance margin.
function previousDistance(experiment, bounds, width, height, view) {
  const [minimumZ, maximumZ] = bounds
  const back = Math.min(-1.6, minimumZ - 0.55, experiment.source.z - 0.55)
  const front = Math.max(1.6, maximumZ + 0.55, experiment.source.z + 0.55)
  const direction = view === 'top' ? new Vector3(0, 1, 0) : new Vector3(-0.5, 0.62, 0.85).normalize()
  const up = view === 'top' ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0)
  const horizontal = new Vector3().crossVectors(up, direction).normalize()
  const vertical = new Vector3().crossVectors(direction, horizontal).normalize()
  const tangent = Math.tan(43 * Math.PI / 360)
  const aspect = Math.max(0.1, width / Math.max(1, height))
  let distance = 4
  for (const x of [-(experiment.screenX + 5.3) / 2, (experiment.screenX + 5.3) / 2])
    for (const y of [-0.9, 1.65])
      for (const z of [-(front - back) / 2, (front - back) / 2]) {
        const corner = new Vector3(x, y, z)
        const depth = corner.dot(direction)
        distance = Math.max(distance,
          depth + Math.abs(corner.dot(horizontal)) / (tangent * aspect),
          depth + Math.abs(corner.dot(vertical)) / tangent)
      }
  return distance * 1.12 + 0.2
}

test('default apparatus fits desktop and phone with useful viewport occupancy', () => {
  for (const [width, height] of dimensions) for (const view of ['perspective', 'top']) {
    const { points, framing, camera } = frame(DEFAULT_CONFIG, width, height, view)
    const occupancy = projectInside(points, camera, width, height, framing.padding, `${width}×${height} ${view}`)
    assert.ok(Math.max(occupancy.width, occupancy.height) > 0.75, 'apparatus should use at least 75% of one viewport axis')
  }
})

test('default camera is substantially closer than framing the old empty table bounds', () => {
  for (const [width, height] of [[1280, 500], [900, 390], [390, 310], [320, 310]])
    for (const view of ['perspective', 'top']) {
      const { experiment, bounds, framing } = frame(DEFAULT_CONFIG, width, height, view)
      const previous = previousDistance(experiment, bounds, width, height, view)
      assert.ok(framing.distance < previous * 0.82, `${width}×${height} ${view}: ${framing.distance} vs ${previous}`)
    }
})

test('mesh dimensions remain visible across prism, lamp, screen and aspect extremes', () => {
  const configurations = [
    DEFAULT_CONFIG,
    { ...DEFAULT_CONFIG, prismAngle: -30 },
    { ...DEFAULT_CONFIG, prismAngle: 55.5, screenDistance: 4.2 },
    { ...DEFAULT_CONFIG, apexAngle: 85, prismAngle: -180, lightAngle: -16, lightOffset: -0.7, lightWidth: 0.08, screenDistance: 1.6 },
    { ...DEFAULT_CONFIG, apexAngle: 80, prismAngle: 180, lightAngle: 16, lightOffset: 0.7, lightWidth: 0.08, screenDistance: 4.2 },
    { ...DEFAULT_CONFIG, apexAngle: 30, prismAngle: 90, lightAngle: -80, lightOffset: -0.7, lightWidth: 0.5, screenDistance: 8 },
    { ...DEFAULT_CONFIG, apexAngle: 85, prismAngle: -90, lightAngle: 80, lightOffset: 0.7, lightWidth: 0.5, screenDistance: 8 },
  ]
  for (const config of configurations) for (const [width, height] of dimensions) for (const view of ['perspective', 'top']) {
    const { experiment, bounds, points, framing, camera } = frame(config, width, height, view)
    const context = `${JSON.stringify(config)} ${width}×${height} ${view}`
    projectInside(points, camera, width, height, framing.padding, context)
    projectInside(apparatusSamples(experiment, config, ...bounds), camera, width, height, framing.padding, context)
  }
})

test('reflected and nearly parallel rays frame their visible geometry, without changing physical hits', () => {
  const backward = frame({ ...DEFAULT_CONFIG, prismAngle: -30 }, 390, 310, 'perspective')
  assert.ok(backward.experiment.rays.every(ray => ray.status === 'escaped'))
  assert.ok(backward.points.some(point => point.z > 6), 'include backward exits that never hit the screen')

  const parallel = frame({ ...DEFAULT_CONFIG, prismAngle: 55.5, screenDistance: 4.2 }, 390, 310, 'perspective')
  assert.ok(parallel.experiment.rays.some(ray => ray.screenHit?.z < -190), 'physical model keeps its distant ideal screen hit')
  assert.ok(parallel.points.every(point => point.z >= -12.001 && point.z <= 12.001), 'do not fit invisible hundreds-of-units ray extensions')
  assert.ok(parallel.points.some(point => Math.abs(point.z + 12) < 1e-6), 'include the displayed ray up to its clipping boundary')
})

test('adjusting the experiment can retain an arbitrary user orbit while fitting all apparatus', () => {
  const directions = [new Vector3(-0.3, 0.8, 0.5), new Vector3(0.9, 0.3, -0.2), new Vector3(0, 1, 0)]
  for (const direction of directions) for (const [width, height] of [[1280, 500], [320, 310]]) {
    const supplied = direction.clone()
    const { points, framing, camera } = frame({ ...DEFAULT_CONFIG, prismAngle: -30, screenDistance: 4.2 }, width, height, 'perspective', supplied)
    const actual = framing.position.clone().sub(framing.target).normalize()
    assert.ok(actual.distanceTo(direction.clone().normalize()) < 1e-12, 'preserve the selected viewing direction')
    assert.deepEqual(supplied, direction, 'do not mutate the controls direction')
    projectInside(points, camera, width, height, framing.padding, 'retained orbit')
  }
})

test('settling real OrbitControls clears rotation and pan inertia before reframing', () => {
  for (const view of ['perspective', 'top']) {
    const width = 390, height = 310
    const { camera, framing: initial } = frame(DEFAULT_CONFIG, width, height, 'perspective')
    const listeners = new Map()
    const element = {
      clientHeight: height,
      clientWidth: width,
      style: {},
      addEventListener: (type, listener) => listeners.set(type, listener),
      removeEventListener: type => listeners.delete(type),
      ownerDocument: { removeEventListener() {} },
    }
    const controls = new OrbitControls(camera, element)
    controls.target.copy(initial.target)
    controls.update()
    controls.enableDamping = true
    controls.dampingFactor = 0.12
    controls.listenToKeyEvents(element)

    // Public controls APIs and its real keyboard handler create both forms
    // of inertia, as a drag or pan immediately before pressing a view tab.
    controls.setAzimuthalAngle(controls.getAzimuthalAngle() + 0.8)
    listeners.get('keydown')({ code: 'ArrowLeft', preventDefault() {} })
    const movingTarget = controls.target.clone()
    const movingDirection = camera.position.clone().sub(controls.target).normalize()
    controls.update()
    assert.ok(controls.target.distanceTo(movingTarget) > 1e-5, 'fixture has pending pan inertia')
    assert.ok(camera.position.clone().sub(controls.target).normalize().distanceTo(movingDirection) > 1e-5, 'fixture has pending orbit inertia')

    settleOrbitControls(controls)
    assert.equal(controls.enableDamping, true, 'restore the original damping setting')
    const retainedDirection = camera.position.clone().sub(controls.target).normalize()
    const config = { ...DEFAULT_CONFIG, screenDistance: 4.2 }
    const experiment = traceExperiment(config)
    const points = experimentFramingPoints(experiment, config, ...screenBounds(experiment))
    const framing = fitExperimentCamera(points, width, height, view, view === 'perspective' ? retainedDirection : undefined)
    camera.up.copy(framing.up)
    camera.position.copy(framing.position)
    camera.far = framing.far
    camera.updateProjectionMatrix()
    camera.lookAt(framing.target)
    controls.target.copy(framing.target)
    controls.enableRotate = view !== 'top'
    controls.update()

    const settledPosition = camera.position.clone()
    const settledTarget = controls.target.clone()
    const expectedDirection = view === 'top' ? new Vector3(0, 1, 0) : retainedDirection
    for (let tick = 0; tick < 120; tick++) controls.update()
    assert.ok(camera.position.distanceTo(settledPosition) < 1e-9, 'no orbit drift after applying the frame')
    assert.ok(controls.target.distanceTo(settledTarget) < 1e-9, 'no pan drift after applying the frame')
    assert.ok(camera.position.clone().sub(controls.target).normalize().distanceTo(expectedDirection) < 1e-12)
    camera.updateMatrixWorld()
    projectInside(points, camera, width, height, framing.padding, `settled ${view}`)
    controls.dispose()
  }
})

test('display clipping handles crossings and rejects exterior segments without mutating physics', () => {
  const segment = { from: { x: -7, z: -20 }, to: { x: 7, z: 20 }, medium: 'air' }
  const original = structuredClone(segment)
  const clipped = clipRayToViewBounds(segment, 4)
  assert.deepEqual(segment, original)
  assert.ok(clipped)
  assert.ok(Math.abs(clipped.from.z + 12) < 1e-12)
  assert.ok(clipped.from.x >= -5 && clipped.to.x <= 4)
  assert.ok(clipped.to.z <= 12)
  assert.equal(clipRayToViewBounds({ from: { x: 0, z: 13 }, to: { x: 2, z: 14 }, medium: 'air' }, 4), null)
  assert.equal(clipRayToViewBounds({ from: { x: -6, z: 0 }, to: { x: -6, z: 2 }, medium: 'air' }, 4), null)
})
