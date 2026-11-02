export const n = (v: number, digits = 1) =>
  v.toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
