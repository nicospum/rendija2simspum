import { experiments } from '../portal/catalog.ts'
export const BLACK_HOLE_IDS = [
  'lente-gravitacional',
  'acrecion',
  'horizonte',
  'hawking',
  'entropia',
] as const
export const blackHoleLabs = BLACK_HOLE_IDS.map(
  (id) => experiments.find((lab) => lab.id === id)!,
)
