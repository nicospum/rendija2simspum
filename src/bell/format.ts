export const n = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
export const signed = (value: number, digits = 2) =>
  `${value >= 0 ? '+' : ''}${n(value, digits)}`
