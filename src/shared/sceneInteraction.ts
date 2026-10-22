export interface Point2 {
  x: number
  y: number
}

/** Project onto the two calculated halves of a light path, never invent a new path. */
export function pathFraction(
  point: Point2,
  path: readonly Point2[],
  returning: boolean,
) {
  if (
    path.length !== 3 ||
    ![point, ...path].every(
      (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
    )
  )
    return null
  const candidates = [0, 1].map((i) => {
    const a = path[i],
      b = path[i + 1]
    const dx = b.x - a.x,
      dy = b.y - a.y
    const length2 = dx * dx + dy * dy
    const t =
      length2 === 0
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              ((point.x - a.x) * dx + (point.y - a.y) * dy) / length2,
            ),
          )
    const distance = Math.hypot(
      point.x - a.x - t * dx,
      point.y - a.y - t * dy,
    )
    // Snap endpoints so a touch can complete a tic without pixel-perfect placement.
    const snapped =
      t * Math.sqrt(length2) < 8
        ? 0
        : (1 - t) * Math.sqrt(length2) < 8
          ? 1
          : t
    return { fraction: (i + snapped) / 2, distance }
  })
  if (Math.abs(candidates[0].distance - candidates[1].distance) < 0.01)
    return candidates[returning ? 1 : 0].fraction
  return candidates[0].distance < candidates[1].distance
    ? candidates[0].fraction
    : candidates[1].fraction
}

export function scrubKey(
  key: string,
  value: number,
  min: number,
  max: number,
  step: number,
) {
  if (key === 'Home') return min
  if (key === 'End') return max
  const delta = (
    {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 10,
      PageDown: -10,
    } as Record<string, number>
  )[key]
  return delta === undefined
    ? undefined
    : Math.max(min, Math.min(max, value + delta * step))
}
