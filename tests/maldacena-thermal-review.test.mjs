import test from 'node:test'
import assert from 'node:assert/strict'
import { thermalModel, CENTRAL_CHARGE } from '../src/maldacena/thermal/physics.ts'
const close = (a, b, tol = 1e-5) =>
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`)

test('independent BTZ review: finite difference of CFT entropy approaches analytic thermal slope', () => {
  for (const temperature of [0.08, 0.16, 0.32])
    for (const length of [1, 2, 4, 5]) {
      const step = 1e-5
      const measured =
        (thermalModel(length + step, temperature).entropy -
          thermalModel(length - step, temperature).entropy) /
        (2 * step)
      const expected =
        (Math.PI * CENTRAL_CHARGE * temperature) /
        (3 * Math.tanh(Math.PI * length * temperature))
      close(measured, expected, 1e-8)
    }
})
test('independent BTZ review: curve satisfies the spatial metric first integral at interior points', () => {
  for (const temperature of [0, 0.08, 0.24, 0.32])
    for (const length of [0.5, 2, 6]) {
      const m = thermalModel(length, temperature)
      for (const f of [-0.4, -0.2, 0.2, 0.4]) {
        const x = f * length,
          h = 1e-6,
          z = m.zAt(x)
        const dz = (m.zAt(x + h) - m.zAt(x - h)) / (2 * h)
        const lapse = temperature === 0 ? 1 : 1 - (z / m.zh) ** 2
        close(1 + dz ** 2 / lapse, m.depth ** 2 / z ** 2, 2e-5)
      }
    }
})
