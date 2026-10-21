export const LIGHT_SPEED = 299792458
export function restEnergy(milligrams: number) {
  if (!Number.isFinite(milligrams) || milligrams < 0.1 || milligrams > 1000)
    throw new RangeError('Masa fuera del intervalo del cuaderno.')
  const kg = milligrams / 1e6,
    joules = kg * LIGHT_SPEED ** 2
  return { kg, joules, kwh: joules / 3.6e6 }
}
export function massFromPosition(position: number) {
  if (!Number.isFinite(position) || position < 0 || position > 100)
    throw new RangeError('Posición inválida.')
  return 10 ** (position / 25 - 1)
}
export const positionFromMass = (milligrams: number) => {
  restEnergy(milligrams)
  return (Math.log10(milligrams) + 1) * 25
}
