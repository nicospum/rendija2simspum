import test from 'node:test'
import assert from 'node:assert/strict'
import {
  traceNormalized,
  traceRay,
  geometry,
  impactParameter,
  alignedRingAngle,
  buildTransfer,
  interpolateTransfer,
  CRITICAL_B,
  RS_REFERENCE,
  OBSERVER_DISTANCE,
  SKY_DISTANCE,
  radians,
  directionForPixel,
  backgroundDirection,
} from '../src/lente/physics.ts'
import { initialState, reducer, lessonStatus, LESSONS } from '../src/lente/learning.ts'
const close = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`)

test('camera picking and projection are inverse on desktop and phone', () => {
  for (const aspect of [1, 1.6, 2])
    for (const nx of [-0.7, 0, 0.8])
      for (const ny of [-0.6, 0.5]) {
        const ray = directionForPixel(nx, ny, aspect)
        close((Math.tan(ray.angle) * Math.cos(ray.azimuth)) / Math.tan(Math.PI / 6) / aspect, nx)
        close((Math.tan(ray.angle) * Math.sin(ray.azimuth)) / Math.tan(Math.PI / 6), ny)
      }
})

test('every azimuth of the calculated aligned ring reaches the same source', () => {
  const model = { mass: 1, gravity: true },
    angle = alignedRingAngle(model)
  const ray = traceRay(model, angle, false)
  for (let azimuth = -Math.PI; azimuth <= Math.PI; azimuth += 0.2) {
    const n = backgroundDirection(ray.phi, azimuth, 0)
    close(n.x, -1, 1e-10)
    close(n.y, 0, 1e-8)
    close(n.z, 0, 1e-8)
  }
})

test('limited integrations are unresolved rather than falsely classified as captured', () => {
  const ray = traceNormalized(24, 90, 0.3, true, { maxPhi: 0.1 })
  assert.equal(ray.outcome, 'unresolved')
  assert.ok(ray.points.at(-1).x > 1)
})

test('an independent potential quadrature agrees with the integrated ray angle', () => {
  for (const angle of [radians(7), radians(14), radians(30)]) {
    const b = impactParameter(24, angle),
      energy = 1 / b ** 2
    const potential = (u) => energy - u * u + u ** 3
    let low = 0,
      high = 2 / 3
    for (let i = 0; i < 70; i++) {
      const mid = (low + high) / 2
      if (potential(mid) > 0) low = mid
      else high = mid
    }
    const turn = (low + high) / 2
    const integrate = (start) => {
      const upper = Math.sqrt(1 - start / turn),
        n = 6000,
        h = upper / n
      let sum = 0
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) * h,
          u = turn * (1 - t * t)
        sum += (2 * turn * t) / Math.sqrt(potential(u))
      }
      return sum * h
    }
    const expected = integrate(1 / 24) + integrate(1 / 90)
    close(traceNormalized(24, 90, angle).phi, expected, 5e-6)
  }
})

test('flat rays intersect the same background sphere on a straight line', () => {
  for (const angle of [0, 0.1, 0.4, 1]) {
    const ray = traceNormalized(24, 90, angle, false)
    const p = ray.points.at(-1)
    close(Math.hypot(p.x, p.y), 90)
    close((24 - p.x) * Math.sin(angle), p.y * Math.cos(angle))
    assert.equal(ray.outcome, 'sky')
  }
})

test('the observer tetrad agrees with the geodesic first integral', () => {
  for (const r of [12, 24, 48])
    for (const angle of [0.05, 0.4, 1]) {
      const b = impactParameter(r, angle),
        u = 1 / r,
        v = Math.cos(angle) / b
      close(v * v + u * u - u ** 3, 1 / b ** 2, 1e-12)
    }
})

test('capture threshold and the photon sphere agree with analytic Schwarzschild results', () => {
  const g = geometry(1)
  close(impactParameter(g.observer, g.shadowAngle), CRITICAL_B, 1e-12)
  const captured = traceRay({ mass: 1, gravity: true }, g.shadowAngle * 0.99)
  const escaped = traceRay({ mass: 1, gravity: true }, g.shadowAngle * 1.01)
  assert.equal(captured.outcome, 'captured')
  assert.equal(escaped.outcome, 'sky')
  assert.ok(escaped.minRadius > 1.5)
  const radial = traceRay({ mass: 1, gravity: true }, 0)
  assert.equal(radial.outcome, 'captured')
  close(radial.points.at(-1).x, 1)
})

test('RK4 conserves the null first integral and converges under step refinement', () => {
  const a = traceNormalized(24, 90, radians(14), true, { step: 0.004 })
  const b = traceNormalized(24, 90, radians(14), true, { step: 0.002 })
  assert.equal(a.outcome, 'sky')
  assert.ok(a.invariantError < 1e-8)
  close(a.phi, b.phi, 2e-6) // Includes linear endpoint localization.
  close(Math.hypot(a.points.at(-1).x, a.points.at(-1).y), 90)
})

test('weak-field bending approaches 4GM/(bc²), independently of the renderer', () => {
  const observer = 1e6,
    sky = 2e6,
    b = 200
  const angle = Math.asin((b * Math.sqrt(1 - 1 / observer)) / observer)
  const curved = traceNormalized(observer, sky, angle)
  const flat = traceNormalized(observer, sky, angle, false)
  assert.equal(curved.outcome, 'sky')
  close((curved.phi - flat.phi) / (2 / b), 1, 0.02)
})

test('aligned rings are roots of the same ray equation and grow at fixed physical distances', () => {
  let previous = 0
  for (const mass of [0.5, 1, 2]) {
    const model = { mass, gravity: true },
      g = geometry(mass)
    const angle = alignedRingAngle(model)
    close(traceRay(model, angle, false).phi, Math.PI, 1e-7)
    assert.ok(angle > previous && angle > g.shadowAngle)
    previous = angle
    close(g.observer * g.rs, OBSERVER_DISTANCE, 1e-3)
    close(g.sky * g.rs, SKY_DISTANCE, 1e-3)
    close(g.rs / RS_REFERENCE, mass)
  }
})

test('radial transfer texture agrees with independent direct integrations', () => {
  const model = { mass: 1, gravity: true }
  const { data, critical } = buildTransfer(model)
  for (const angle of [0.15, 0.24, 0.4, 0.8, 1.2])
    close(interpolateTransfer(data, critical, angle), traceRay(model, angle, false).phi, 0.0001)
  assert.equal(interpolateTransfer(data, critical, critical * 0.9), null)
  assert.ok([...data].every(Number.isFinite))
})

test('all four lessons isolate their intended condition and keep references immutable', () => {
  for (const lesson of LESSONS) {
    const state = initialState(lesson.id),
      reference = structuredClone(state.reference)
    assert.equal(lessonStatus(state), 'ready')
    const predicted = reducer(state, { type: 'predict', value: lesson.answer })
    const next = reducer(predicted, { type: 'try' })
    assert.equal(lessonStatus(next), 'observed')
    assert.deepEqual(next.reference, reference)
    assert.notEqual(next.reference, next)
    assert.equal(next.completed.length, 1)
    assert.equal(lessonStatus(reducer(next, { type: 'restore' })), 'ready')
  }
})

test('manual alignment works through either one control and mixed changes do not complete a challenge', () => {
  const state = initialState('ring')
  assert.equal(lessonStatus(reducer(state, { type: 'yaw', value: -8 })), 'observed')
  const mixed = reducer(reducer(state, { type: 'source', value: 3 }), { type: 'yaw', value: -3 })
  assert.equal(lessonStatus(mixed), 'changed')
  assert.equal(mixed.completed.length, 0)
  assert.equal(reducer(state, { type: 'mass', value: NaN }), state)
  close(reducer(state, { type: 'mass', value: 100 }).mass, 2)
  assert.throws(() => traceNormalized(1, 90, 0.3))
  assert.throws(() => traceNormalized(24, 90, NaN))
  assert.throws(() => geometry(Infinity))
  assert.throws(() => geometry(Number.MIN_VALUE))
})
