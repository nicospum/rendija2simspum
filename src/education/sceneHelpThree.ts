import { Box3, Frustum, Matrix4, Raycaster, Vector2, Vector3 } from 'three'
import type {
  Camera,
  Intersection,
  Object3D,
  Material,
  PerspectiveCamera,
  OrthographicCamera,
} from 'three'
import type { SceneHelpHit } from './sceneHelp'

interface Annotation {
  id: string
  title: string
  body: string
}
type Annotated = Annotation | ((hit: Intersection) => Annotation | null)
interface Rect {
  left: number
  top: number
  width: number
  height: number
}

function visible(object: Object3D) {
  for (let current: Object3D | null = object; current; current = current.parent)
    if (!current.visible) return false
  const material = (object as Object3D & { material?: Material | Material[] }).material
  return (
    !material ||
    (Array.isArray(material) ? material : [material]).some(
      (m) => m.visible && (!m.transparent || m.opacity > 0.01),
    )
  )
}
function ignored(object: Object3D) {
  for (let current: Object3D | null = object; current; current = current.parent)
    if (current.userData.sceneHelpIgnore) return true
  return false
}
function annotation(object: Object3D): Annotated | null {
  for (let current: Object3D | null = object; current; current = current.parent) {
    if (current.userData.sceneHelpIgnore) return null
    if (current.userData.sceneHelp) return current.userData.sceneHelp
  }
  return null
}
function opaque(object: Object3D) {
  if (!(object as Object3D & { isMesh?: boolean }).isMesh) return false
  const material = (object as Object3D & { material?: Material | Material[] }).material
  return (
    !!material &&
    (Array.isArray(material) ? material : [material]).some(
      (m) => m.visible && (!m.transparent || m.opacity >= 0.8),
    )
  )
}
const valid = (entry: Annotation | null): entry is Annotation =>
  !!entry &&
  typeof entry.id === 'string' &&
  typeof entry.title === 'string' &&
  typeof entry.body === 'string'

/** Read-only raycasting against the rendered scene. No R3F pointer events are dispatched. */
export function pickThreeScene(
  scene: Object3D,
  camera: Camera,
  rect: Rect,
  point: { x: number; y: number; pointerType: string },
): SceneHelpHit | null {
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    point.x < rect.left ||
    point.x > rect.left + rect.width ||
    point.y < rect.top ||
    point.y > rect.top + rect.height
  )
    return null
  const ray = new Raycaster()
  scene.updateWorldMatrix(true, true)
  camera.updateWorldMatrix(true, false)
  const tolerance = point.pointerType === 'touch' ? 14 : 7
  const perspective = camera as PerspectiveCamera
  ;(ray.params as unknown as Record<string, { threshold: number }>).Line2 = {
    threshold: tolerance,
  }
  ray.setFromCamera(
    new Vector2(
      ((point.x - rect.left) / rect.width) * 2 - 1,
      1 - ((point.y - rect.top) / rect.height) * 2,
    ),
    camera,
  )
  const hits: Intersection[] = []
  scene.traverse((object) => {
    if (!('geometry' in object) || !visible(object) || ignored(object)) return
    const bounds = new Box3().setFromObject(object)
    const depth = Math.max(
      1,
      camera.position.distanceTo(
        bounds.isEmpty() ? new Vector3() : bounds.getCenter(new Vector3()),
      ) +
        bounds.getSize(new Vector3()).length() / 2,
    )
    const ortho = camera as OrthographicCamera
    const height = perspective.isPerspectiveCamera
      ? (2 * depth * Math.tan((perspective.fov * Math.PI) / 360)) / perspective.zoom
      : (ortho.top - ortho.bottom) / ortho.zoom
    ray.params.Line.threshold = (height * tolerance) / rect.height
    ray.params.Points.threshold = ray.params.Line.threshold
    hits.push(...ray.intersectObject(object, false))
  })
  hits.sort((a, b) => a.distance - b.distance)
  const blocker = hits.find((hit) => opaque(hit.object))?.distance ?? Infinity
  const occluders = new Set(
    hits.filter((hit) => opaque(hit.object)).map((hit) => hit.object),
  )
  scene.traverse((object) => {
    if ('geometry' in object && visible(object) && !ignored(object) && opaque(object))
      occluders.add(object)
  })
  const objectRay = new Raycaster()
  let surface: SceneHelpHit | null = null
  let fine: { hit: SceneHelpHit; pixels: number } | null = null
  for (const hit of hits) {
    const data = annotation(hit.object)
    const entry = typeof data === 'function' ? data(hit) : data
    if (!valid(entry)) continue
    const object = hit.object as Object3D & {
      isLine?: boolean
      isPoints?: boolean
      geometry?: { attributes: { position?: import('three').BufferAttribute } }
    }
    let position = hit.point.clone()
    if (
      object.isPoints &&
      hit.index !== undefined &&
      object.geometry?.attributes.position
    ) {
      position = object.localToWorld(
        new Vector3().fromBufferAttribute(object.geometry.attributes.position, hit.index),
      )
    }
    const projected = position.clone().project(camera)
    if (projected.z < -1 || projected.z > 1) continue
    const anchor = {
      x: rect.left + ((projected.x + 1) * rect.width) / 2,
      y: rect.top + ((1 - projected.y) * rect.height) / 2,
    }
    const result = {
      id: entry.id,
      entry: { title: entry.title, body: entry.body },
      anchor,
    }
    if (object.isLine || object.isPoints) {
      const pixels = Math.hypot(anchor.x - point.x, anchor.y - point.y)
      if (pixels <= tolerance + 1e-7 && (!fine || pixels < fine.pixels)) {
        // A fuzzy pointer ray may hit the screen before the nearby point. Test
        // visibility through the actual rendered point, not through the cursor.
        objectRay.setFromCamera(new Vector2(projected.x, projected.y), camera)
        const distance = objectRay.ray.origin.distanceTo(position)
        const hidden = objectRay
          .intersectObjects([...occluders], false)
          .some((cover) => cover.distance < distance - 1e-5)
        if (!hidden) fine = { hit: result, pixels }
      }
    } else if (hit.distance <= blocker + 1e-6) surface ??= result
  }
  return fine?.hit ?? surface
}

export function threeSceneItems(
  scene: Object3D,
  camera: Camera,
): readonly SceneHelpHit[] {
  scene.updateWorldMatrix(true, true)
  camera.updateWorldMatrix(true, false)
  const frustum = new Frustum().setFromProjectionMatrix(
    new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
  )
  const items = new Map<string, SceneHelpHit>()
  scene.traverse((object) => {
    if (!object.userData.sceneHelp && !object.userData.sceneHelpItems) return
    if (
      !visible(object) ||
      ignored(object) ||
      !frustum.intersectsBox(new Box3().setFromObject(object))
    )
      return
    const data = object.userData.sceneHelp
    const entries: Annotation[] =
      object.userData.sceneHelpItems ?? (typeof data === 'object' && data ? [data] : [])
    for (const entry of entries)
      if (valid(entry) && !items.has(entry.id))
        items.set(entry.id, {
          id: entry.id,
          entry: { title: entry.title, body: entry.body },
        })
  })
  return [...items.values()]
}
