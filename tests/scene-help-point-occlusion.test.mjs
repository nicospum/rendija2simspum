import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BoxGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
} from 'three'
import {
  apparatusBounds,
  CAMERA_FOV,
  fitCamera,
} from '../src/components/simulation/cameraFraming.ts'
import { pickThreeScene } from '../src/education/sceneHelpThree.ts'

const description = (id) => ({ id, title: id, body: `Meaning of ${id}` })

/** Same screen planes and camera fitting as the double-slit apparatus. */
function fixture(width, height, showTheory) {
  const scene = new Scene()
  const rect = { left: 0, top: 0, width, height }
  const camera = new PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 100)
  const frame = fitCamera(apparatusBounds(3.5), width, height, 'perspective')
  camera.position.copy(frame.position)
  camera.up.copy(frame.up)
  camera.lookAt(frame.target)
  camera.updateMatrixWorld()
  const screen = new Mesh(new BoxGeometry(0.2, 1.94, 6.08), new MeshBasicMaterial())
  screen.position.set(3.5, 1.17, 0)
  screen.userData.sceneHelp = description('screen')
  scene.add(screen)
  if (showTheory) {
    const theory = new Mesh(
      new PlaneGeometry(6, 1.7),
      new MeshBasicMaterial({ transparent: true }),
    )
    theory.rotation.y = -Math.PI / 2
    theory.position.set(3.5 - 0.111, 1.17, 0)
    theory.userData.sceneHelp = description('theory')
    scene.add(theory)
  }
  const project = (position) => {
    const p = position.clone().project(camera)
    return { x: ((p.x + 1) * width) / 2, y: ((1 - p.y) * height) / 2 }
  }
  return { scene, camera, rect, project }
}

function impact(scene, k) {
  const geometry = new BufferGeometry().setAttribute(
    'position',
    new Float32BufferAttribute(
      [3.5 - 0.16, 0.45 + (k % 5) * 0.28, -2.6 + Math.floor(k / 5) * 1.04],
      3,
    ),
  )
  const points = new Points(
    geometry,
    new PointsMaterial({
      size: 0.055,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    }),
  )
  points.userData.sceneHelp = description('detection')
  scene.add(points)
  // Project the actual Float32 render position, including its rounding.
  const position = new Vector3().fromBufferAttribute(geometry.attributes.position, 0)
  return { points, position }
}

for (const [width, height] of [
  [1000, 550],
  [390, 350],
]) {
  for (const showTheory of [false, true]) {
    test(`visible impacts stay selectable near the surface at ${width}×${height}, theory ${showTheory}`, () => {
      const f = fixture(width, height, showTheory)
      for (let k = 0; k < 30; k++) {
        const { points, position } = impact(f.scene, k)
        const at = f.project(position)
        for (const [pointerType, offsets] of [
          ['mouse', [0, 2, 4, 6, 7]],
          ['touch', [0, 6, 10, 14]],
        ]) {
          for (const offset of offsets) {
            for (const [dx, dy] of [
              [offset, 0],
              [-offset, 0],
              [0, offset],
              [0, -offset],
            ]) {
              const hit = pickThreeScene(f.scene, f.camera, f.rect, {
                x: at.x + dx,
                y: at.y + dy,
                pointerType,
              })
              assert.equal(
                hit?.id,
                'detection',
                `impact ${k}, ${pointerType}, offset (${dx},${dy}): ${hit?.id}`,
              )
            }
          }
        }
        f.scene.remove(points)
        points.geometry.dispose()
        points.material.dispose()
      }
    })
  }
}

test('an opaque object in front of the real impact still blocks mouse and touch selection', () => {
  const f = fixture(1000, 550, true)
  const { position } = impact(f.scene, 12)
  const cover = new Mesh(new BoxGeometry(1.5, 1.5, 1.5), new MeshBasicMaterial())
  cover.position.copy(f.camera.position).lerp(position, 0.5)
  cover.userData.sceneHelp = description('opaque-cover')
  f.scene.add(cover)
  const at = f.project(position)
  for (const [pointerType, offset] of [
    ['mouse', 7],
    ['touch', 14],
  ]) {
    for (const dx of [-offset, 0, offset]) {
      const hit = pickThreeScene(f.scene, f.camera, f.rect, {
        x: at.x + dx,
        y: at.y,
        pointerType,
      })
      assert.notEqual(hit?.id, 'detection', `${pointerType}, offset ${dx}`)
    }
  }
})
