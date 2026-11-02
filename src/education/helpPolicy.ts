const LAB_PATHS = new Set([
  'doble-rendija',
  'prisma',
  'hawking',
  'lente-gravitacional',
  'entropia',
  'acrecion',
  'horizonte',
  'reloj-de-luz',
  'tren-de-einstein',
  'nos-vemos-a-la-vuelta',
  'ascensor-de-einstein',
  'el-tiempo-tiene-altura',
  'orbita-que-no-se-cierra',
  'efecto-fotoelectrico',
  'entrelazados',
  'espacio-con-frontera',
  'dos-lenguajes',
  'frontera-caliente',
  'holografia',
  'curva-de-page',
])

export function isLabPath(path: string) {
  return LAB_PATHS.has(path.replace(/^\/+|\/+$/g, ''))
}

/** Consultation freezes controls, including native ranges with modified arrows. */
export function consultHelpKey(
  key: string,
  {
    editable,
    control,
    modified,
  }: { editable: boolean; control: boolean; modified: boolean },
) {
  if (key === 'Tab') return false
  const navigationKey = [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'PageUp',
    'PageDown',
  ].includes(key)
  const activationKey = key === 'Enter' || key === ' '
  if (modified && !(control && (navigationKey || activationKey))) return false
  return editable || activationKey || (control && navigationKey)
}

type Rect = { left: number; right: number; top: number; bottom: number }

/** Union visible renderers, excluding decorative icons and off-screen sections. */
export function visibleSceneBounds(
  rects: readonly Rect[],
  viewport: { width: number; height: number },
) {
  const visible = rects.filter(
    (r) =>
      r.right - r.left >= 100 &&
      r.bottom - r.top >= 70 &&
      r.bottom > 0 &&
      r.top < viewport.height &&
      r.right > 0 &&
      r.left < viewport.width,
  )
  if (!visible.length) return null
  return {
    left: Math.min(...visible.map((r) => r.left)),
    right: Math.max(...visible.map((r) => r.right)),
    top: Math.min(...visible.map((r) => r.top)),
    bottom: Math.max(...visible.map((r) => r.bottom)),
  }
}

/** Clamp the reading card to the viewport, including narrow and short windows. */
export function helpPosition(
  box: { left: number; right: number; top: number; bottom: number },
  viewport: { width: number; height: number },
) {
  const width = Math.min(340, viewport.width - 24)
  const x =
    box.right + width + 20 < viewport.width ? box.right + 10 : box.left - width - 10
  return {
    left: Math.max(12, Math.min(viewport.width - width - 12, x)),
    top: Math.max(12, Math.min(viewport.height - 360, box.top)),
    width,
  }
}

/** Prefer space outside the renderer. The fallback protects the point being inspected. */
export function sceneHelpPosition(
  scene: { left: number; right: number; top: number; bottom: number },
  viewport: { width: number; height: number },
  anchor?: { x: number; y: number },
) {
  const width = Math.min(340, viewport.width - 24)
  const rightSpace = viewport.width - scene.right - 20
  const leftSpace = scene.left - 20
  if (rightSpace >= 280 || leftSpace >= 280)
    return {
      left: rightSpace >= 280 ? scene.right + 8 : 12,
      top: Math.max(12, Math.min(viewport.height - 360, scene.top)),
      width: Math.min(width, rightSpace >= 280 ? rightSpace : leftSpace),
      maxHeight: Math.min(290, viewport.height - 110),
    }
  const below = viewport.height - 94 - Math.max(0, scene.bottom)
  if (below >= 110)
    return { left: 12, top: scene.bottom + 8, width, maxHeight: Math.min(250, below) }
  if (scene.top >= 140)
    return { left: 12, top: 12, width, maxHeight: Math.min(250, scene.top - 24) }
  const maxHeight = Math.min(160, viewport.height * 0.27)
  const bottomTop = viewport.height - 94 - maxHeight
  return {
    left: 12,
    top: anchor && anchor.y > bottomTop - 20 ? 12 : bottomTop,
    width,
    maxHeight,
  }
}
