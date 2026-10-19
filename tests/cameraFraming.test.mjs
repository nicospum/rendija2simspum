import test from 'node:test'
import assert from 'node:assert/strict'
import { PerspectiveCamera, Vector3 } from 'three'
import { apparatusBounds, CAMERA_FOV, fitCamera } from '../src/components/simulation/cameraFraming.ts'

const sizes = [[1280, 590], [900, 500], [390, 410], [320, 410], [240, 800], [1800, 250]]

function projection(frame, width, height) {
  const camera = new PerspectiveCamera(CAMERA_FOV, width / height, .1, Math.max(100, frame.distance + 30))
  camera.position.copy(frame.position)
  camera.up.copy(frame.up)
  camera.lookAt(frame.target)
  camera.updateMatrixWorld()
  return (point) => point.clone().project(camera)
}

test('all apparatus bounds fit desktop and phone in both views and screen-distance extremes', () => {
  for (const view of ['perspective', 'top']) for (const distance of [2, 3.5, 6]) for (const [width, height] of sizes) {
    const points = apparatusBounds(distance)
    const frame = fitCamera(points, width, height, view)
    const project = projection(frame, width, height)
    for (const point of points) {
      const ndc = project(point)
      assert.ok(Math.abs(ndc.x) <= 1 - 2 * frame.padding / width + 1e-8, `${view} ${width}x${height}: horizontal crop`)
      assert.ok(Math.abs(ndc.y) <= 1 - 2 * frame.padding / height + 1e-8, `${view} ${width}x${height}: vertical crop`)
      assert.ok(ndc.z >= -1 && ndc.z <= 1, 'apparatus must be between near/far planes')
    }
  }
})

test('framing uses at least 70% of one viewport dimension instead of fitting the empty table', () => {
  for (const view of ['perspective', 'top']) for (const [width, height] of sizes) {
    const points = apparatusBounds(3.5)
    const frame = fitCamera(points, width, height, view)
    const projected = points.map(projection(frame, width, height))
    const occupiedX = (Math.max(...projected.map((p) => p.x)) - Math.min(...projected.map((p) => p.x))) / 2
    const occupiedY = (Math.max(...projected.map((p) => p.y)) - Math.min(...projected.map((p) => p.y))) / 2
    assert.ok(Math.max(occupiedX, occupiedY) > .7, `${view} ${width}x${height}: experiment is too small`)
  }
})

test('independent emitter, barrier and complete screen geometry samples remain visible', () => {
  for (const distance of [2, 6]) for (const [width, height] of sizes) for (const view of ['perspective', 'top']) {
    const frame = fitCamera(apparatusBounds(distance), width, height, view)
    const project = projection(frame, width, height)
    const points = [new Vector3(-3.91, .07, -.4), new Vector3(-2.81, 1.46, .32)]
    for (const z of [-1.55, 1.55]) for (const y of [.03, 2.095]) points.push(new Vector3(-.11, y, z))
    for (const z of [-3.15, 3.15]) for (const y of [.01, 2.25]) for (const x of [distance - .275, distance + .375]) points.push(new Vector3(x, y, z))
    for (const point of points) {
      const p = project(point)
      assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && p.z >= -1 && p.z <= 1, `${view} ${width}x${height}: geometry clipped`)
    }
  }
})

test('changing screen distance preserves a user orbit direction without mutating inputs', () => {
  for (const direction of [new Vector3(-1, .3, .4), new Vector3(1, 2, -1), new Vector3(.0001, 1, .0001)]) {
    const initial = direction.clone()
    const points = apparatusBounds(6)
    const snapshot = points.map((p) => p.clone())
    const frame = fitCamera(points, 390, 410, 'perspective', direction)
    const finalDirection = frame.position.clone().sub(frame.target).normalize()
    assert.ok(finalDirection.distanceTo(direction.clone().normalize()) < 1e-10)
    assert.ok(direction.equals(initial))
    points.forEach((point, i) => assert.ok(point.equals(snapshot[i])))
    const project = projection(frame, 390, 410)
    points.forEach((point) => {
      const p = project(point)
      assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1)
    })
  }
})
