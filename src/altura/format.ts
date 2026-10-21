export const n = (value: number, digits = 3) =>
  (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toLocaleString('es-AR', {
    maximumFractionDigits: digits,
  })
export const amount = (value: number) =>
  value !== 0 && Math.abs(value) < 0.0005
    ? value.toExponential(2).replace('.', ',')
    : n(value)
export const signed = (value: number) =>
  (value > 0 ? '+' : value < 0 ? '−' : '') + amount(Math.abs(value))
