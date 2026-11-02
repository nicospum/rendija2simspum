import test from 'node:test'
import assert from 'node:assert/strict'
import {
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Line,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  Points,
  PointsMaterial,
  Vector3,
  Group,
} from 'three'
import { pickThreeScene, threeSceneItems } from '../src/education/sceneHelpThree.ts'
import { sceneHelpPosition } from '../src/education/helpPolicy.ts'
import { registerSceneHelp, sceneHelpAt } from '../src/education/sceneHelp.ts'
const rect = { left: 20, top: 50, width: 600, height: 400 }
const info = (id) => ({ id, title: id, body: `Meaning of ${id}` })
function camera() {
  const c = new PerspectiveCamera(50, 1.5, 0.1, 100)
  c.position.set(0, 0, 10)
  c.lookAt(0, 0, 0)
  c.updateMatrixWorld()
  return c
}
function pixel(c, world, r = rect) {
  const p = world.clone().project(c)
  return {
    x: r.left + ((p.x + 1) * r.width) / 2,
    y: r.top + ((1 - p.y) * r.height) / 2,
    pointerType: 'mouse',
  }
}
function box(id, z = 0, opacity = 1) {
  const m = new Mesh(
    new BoxGeometry(2, 2, 0.1),
    new MeshBasicMaterial({ transparent: opacity < 1, opacity }),
  )
  m.position.z = z
  if (id) m.userData.sceneHelp = info(id)
  return m
}
function line(id, x, z) {
  const geometry = new BufferGeometry().setFromPoints([
    new Vector3(x, -1, z),
    new Vector3(x, 1, z),
  ])
  const l = new Line(geometry, new LineBasicMaterial())
  l.userData.sceneHelp = info(id)
  return l
}
test('visible surfaces respect opaque occlusion, hidden parents and zero opacity', () => {
  const scene = new Scene(),
    c = camera(),
    rear = box('rear'),
    front = box(null, 2)
  scene.add(rear, front)
  const at = pixel(c, new Vector3())
  assert.equal(pickThreeScene(scene, c, rect, at), null)
  front.visible = false
  assert.equal(pickThreeScene(scene, c, rect, at)?.id, 'rear')
  front.visible = true
  front.material.transparent = true
  front.material.opacity = 0
  assert.equal(pickThreeScene(scene, c, rect, at)?.id, 'rear')
  const parent = new Group()
  scene.add(parent)
  parent.add(rear)
  parent.visible = false
  assert.equal(pickThreeScene(scene, c, rect, at), null)
})
test('a visible ray inside transparent glass is selectable; an opaque cover blocks it', () => {
  const scene = new Scene(),
    c = camera()
  scene.add(box('glass', 1, 0.2), line('ray', 0, 0))
  const at = pixel(c, new Vector3())
  assert.equal(pickThreeScene(scene, c, rect, at)?.id, 'ray')
  scene.add(box('cover', 2))
  assert.equal(pickThreeScene(scene, c, rect, at)?.id, 'cover')
})
test('nearby thin rays choose the closest projected trace rather than the closest depth', () => {
  const scene = new Scene(),
    c = camera()
  scene.add(line('far-but-exact', 0, 0), line('near-but-offset', 0.06, 2))
  assert.equal(
    pickThreeScene(scene, c, rect, pixel(c, new Vector3()))?.id,
    'far-but-exact',
  )
})
test('point hit tolerance uses the rendered position and grows moderately for touch', () => {
  const scene = new Scene(),
    c = camera(),
    geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3))
  const points = new Points(geometry, new PointsMaterial({ size: 0.02 }))
  points.userData.sceneHelp = info('detection')
  scene.add(points)
  const at = pixel(c, new Vector3()),
    offset = { ...at, x: at.x + 10 }
  assert.equal(pickThreeScene(scene, c, rect, offset), null)
  const touch = pickThreeScene(scene, c, rect, { ...offset, pointerType: 'touch' })
  assert.equal(touch?.id, 'detection')
  assert.ok(Math.abs(touch.anchor.x - at.x) < 1e-8)
  points.visible = false
  assert.equal(pickThreeScene(scene, c, rect, { ...offset, pointerType: 'touch' }), null)
})
test('projection tracks rotated cameras, resizing and orthographic zoom', () => {
  for (const c of [camera(), new OrthographicCamera(-3, 3, 2, -2, 0.1, 100)]) {
    c.position.set(2, 3, 10)
    c.lookAt(0, 0, 0)
    c.updateMatrixWorld()
    const scene = new Scene()
    scene.add(line('trace', 0, 0))
    for (const r of [rect, { left: 0, top: 0, width: 300, height: 200 }])
      assert.equal(pickThreeScene(scene, c, r, pixel(c, new Vector3(), r))?.id, 'trace')
  }
})
test('object list deduplicates annotations and omits invisible or out of view objects', () => {
  const scene = new Scene(),
    c = camera()
  scene.add(box('one'), box('one', -2))
  const hidden = box('hidden')
  hidden.visible = false
  scene.add(hidden)
  const outside = box('outside')
  outside.position.x = 100
  scene.add(outside)
  assert.deepEqual(
    threeSceneItems(scene, c).map((x) => x.id),
    ['one'],
  )
})
test('scene cards prefer space outside the canvas and protect selected points in fallback', () => {
  const viewport = { width: 1280, height: 900 },
    scene = { left: 20, right: 760, top: 80, bottom: 620 }
  const p = sceneHelpPosition(scene, viewport, { x: 400, y: 300 })
  assert.ok(p.left >= scene.right)
  const mobile = { width: 390, height: 844 },
    small = { left: 12, right: 378, top: 70, bottom: 420 }
  const m = sceneHelpPosition(small, mobile, { x: 200, y: 200 })
  assert.ok(m.top > small.bottom)
  assert.ok(m.top + m.maxHeight <= mobile.height - 82)
  const full = { left: 0, right: 390, top: 0, bottom: 844 },
    anchor = { x: 200, y: 700 }
  const f = sceneHelpPosition(full, mobile, anchor)
  assert.ok(anchor.y < f.top || anchor.y > f.top + f.maxHeight)
})
test('stale provider cleanup does not unregister its replacement', () => {
  const element = { parentElement: null, closest: () => null },
    first = { pick: () => null },
    second = { pick: () => null }
  const dispose = registerSceneHelp(element, first),
    last = registerSceneHelp(element, second)
  dispose()
  assert.equal(sceneHelpAt(element)?.provider, second)
  last()
  assert.equal(sceneHelpAt(element), null)
})
