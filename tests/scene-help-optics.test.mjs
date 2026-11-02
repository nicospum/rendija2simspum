import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
} from 'three'
import { invalidatePickingBounds } from '../src/components/simulation/sceneHelp.ts'
import { pickThreeScene, threeSceneItems } from '../src/education/sceneHelpThree.ts'

const rect = { left: 0, top: 0, width: 600, height: 400 }
const info = { id: 'trace', title: 'Trace', body: 'Calculated object' }
function setup() {
  const scene = new Scene(),
    camera = new PerspectiveCamera(50, 1.5, 0.1, 100)
  camera.position.set(0, 0, 10)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  const pixel = (x) => {
    const v = new Vector3(x, 0, 0).project(camera)
    return { x: (v.x + 1) * 300, y: (1 - v.y) * 200, pointerType: 'mouse' }
  }
  return { scene, camera, pixel }
}

test('new impacts become selectable after an empty geometry was already inspected', () => {
  const { scene, camera, pixel } = setup()
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([], 3))
  const points = new Points(geometry, new PointsMaterial({ size: 0.02 }))
  scene.add(points)
  pickThreeScene(scene, camera, rect, pixel(0)) // Produces the empty cached sphere.
  assert.equal(geometry.boundingSphere.radius, 0)
  geometry.setAttribute('position', new Float32BufferAttribute([1, 0, 0], 3))
  points.userData.sceneHelp = info
  invalidatePickingBounds(geometry)
  assert.equal(pickThreeScene(scene, camera, rect, pixel(1))?.id, 'trace')
  assert.deepEqual(
    threeSceneItems(scene, camera).map((entry) => entry.id),
    ['trace'],
  )
  geometry.setAttribute('position', new Float32BufferAttribute([], 3))
  points.userData = {}
  invalidatePickingBounds(geometry)
  assert.equal(pickThreeScene(scene, camera, rect, pixel(1)), null)
  assert.deepEqual(threeSceneItems(scene, camera), [])
})

test('a guide moved by a new configuration uses its new bounds and position', () => {
  const { scene, camera, pixel } = setup()
  const geometry = new BufferGeometry().setAttribute(
    'position',
    new Float32BufferAttribute([0, -1, 0, 0, 1, 0], 3),
  )
  const guide = new LineSegments(geometry, new LineBasicMaterial())
  guide.userData.sceneHelp = info
  scene.add(guide)
  assert.equal(pickThreeScene(scene, camera, rect, pixel(0))?.id, 'trace')
  geometry.setAttribute('position', new Float32BufferAttribute([4, -1, 0, 4, 1, 0], 3))
  invalidatePickingBounds(geometry)
  assert.equal(pickThreeScene(scene, camera, rect, pixel(0)), null)
  assert.equal(pickThreeScene(scene, camera, rect, pixel(4))?.id, 'trace')
})
