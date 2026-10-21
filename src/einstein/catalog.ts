import { experiments } from '../portal/catalog.ts'
export const EINSTEIN_IDS = [
  'reloj-de-luz',
  'tren-de-einstein',
  'nos-vemos-a-la-vuelta',
  'ascensor-de-einstein',
] as const
export const einsteinLabs = EINSTEIN_IDS.map(
  (id) => experiments.find((lab) => lab.id === id)!,
)
