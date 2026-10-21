export const n = (v: number, digits = 2) =>
  (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toLocaleString('es-AR', {
    maximumFractionDigits: digits,
  })
