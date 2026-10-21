import { blackHole, SOLAR_MASS } from '../hawking/physics.ts'
export function expeditionScales(solarMasses: number) {
  if (!Number.isFinite(solarMasses) || solarMasses < 5 || solarMasses > 20)
    throw new RangeError('La masa debe estar entre 5 y 20 masas solares')
  const hole = blackHole(solarMasses * SOLAR_MASS)
  return {
    radiusKm: hole.radiusM / 1000,
    temperatureNK: hole.temperatureK * 1e9,
    entropyOverK: hole.entropyOverK,
    radiusRatio: solarMasses / 10,
    entropyRatio: (solarMasses / 10) ** 2,
    drawingRadius: 6 * solarMasses,
  }
}
