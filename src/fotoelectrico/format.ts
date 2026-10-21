export const n = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
