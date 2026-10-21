export const n = (value: number, digits = 3) =>
  (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toLocaleString('es-AR', {
    maximumFractionDigits: digits,
  })
