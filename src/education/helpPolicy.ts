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
