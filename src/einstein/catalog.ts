import { experiments } from '../portal/catalog.ts'
export const EINSTEIN_IDS = ['reloj-de-luz', 'tren-de-einstein'] as const
export const einsteinLabs = EINSTEIN_IDS.map(
  (id) => experiments.find((lab) => lab.id === id)!,
)
