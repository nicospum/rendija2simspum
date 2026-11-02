import test from 'node:test'
import assert from 'node:assert/strict'
import {
  thermalModel,
  integratedLength,
  G3,
  CENTRAL_CHARGE,
} from '../src/maldacena/thermal/physics.ts'
const close = (a, b, tol = 1e-5) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`)
test('BTZ regulated geodesic recovers vacuum and satisfies independent quadrature', () => {
  for (const ell of [0.5, 2, 6])
    for (const t of [0, 0.001, 0.08, 0.16, 0.32]) {
      const m = thermalModel(ell, t)
      close(m.zAt(-ell / 2), m.eps, 1e-10)
      close(m.zAt(ell / 2), m.eps, 1e-10)
      close(integratedLength(ell, t), m.exactLength)
      assert.ok(Number.isFinite(m.entropy))
      assert.ok(m.depth > m.eps)
      if (t > 0) assert.ok(m.depth < m.zh)
    }
  close(thermalModel(2, 1e-7).entropy, thermalModel(2, 0).entropy)
})
test('thermal CFT and geometric answer distinguish regulator and obey central charge dictionary', () => {
  close(CENTRAL_CHARGE, 3 / (2 * G3))
  const m = thermalModel(2, 0.16)
  close(
    m.entropy,
    (CENTRAL_CHARGE / 3) *
      Math.log(Math.sinh(Math.PI * 2 * 0.16) / (Math.PI * 0.16 * m.eps)),
  )
  assert.ok(m.geometricEntropy > m.entropy)
  assert.ok(m.geometricEntropy - m.entropy < 0.02)
})
test('BTZ mass-temperature scaling differs from Schwarzschild and large intervals approach thermal density', () => {
  const a = thermalModel(2, 0.08),
    b = thermalModel(2, 0.16)
  close(b.horizonRadius / a.horizonRadius, 2)
  close(b.massParameter / a.massParameter, 4)
  const long = thermalModel(6, 0.32),
    short = thermalModel(4, 0.32)
  assert.ok(long.depth / long.zh > 0.99)
  close((long.entropy - short.entropy) / 2, long.entropyDensity, 0.02)
})
test('thermal input bounds never allow invalid geometry', () => {
  for (const l of [NaN, Infinity, -100, 100])
    for (const t of [NaN, -100, Infinity, 100]) {
      const m = thermalModel(l, t)
      assert.ok(Number.isFinite(m.entropy))
      assert.ok(Number.isFinite(m.depth))
    }
})

test('arbitrarily cold positive temperatures preserve the vacuum curve and quadrature', () => {
  for (const ell of [0.5, 2, 6]) {
    const vacuum = thermalModel(ell, 0)
    for (const t of [Number.MIN_VALUE, 1e-200, 1e-12, 1e-9, 1e-7, 1e-5]) {
      const m = thermalModel(ell, t)
      assert.ok(Number.isFinite(m.depth) && m.depth > m.eps)
      close(m.depth, m.zAt(0), 1e-12)
      close(m.depth, vacuum.depth, 1e-7)
      for (const fraction of [-0.5, -0.25, 0, 0.25, 0.5]) {
        close(m.zAt(ell * fraction), vacuum.zAt(ell * fraction), 1e-7)
      }
      close(integratedLength(ell, t), m.exactLength, 1e-6)
    }
  }
})
