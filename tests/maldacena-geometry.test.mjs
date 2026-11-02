import test from 'node:test'
import assert from 'node:assert/strict'
import {
  geodesic,
  numericalLength,
  model,
  settings,
  DEFAULT,
  CENTRAL_CHARGE,
  ENTROPY_AXIS_MAX,
  ADS_LENGTH,
  G3,
  curvePoints,
  intervalFromEndpoint,
} from '../src/maldacena/geometry/physics.ts'
import {
  initialTrial,
  measure,
  steps,
  reference,
  GEOMETRY_LESSONS,
  DUALITY_LESSONS,
} from '../src/maldacena/geometry/learning.ts'

const near = (a, b, tolerance = 1e-8) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`)
test('AdS dictionary fixes central charge and Newton constant consistently', () => {
  near(CENTRAL_CHARGE, (3 * ADS_LENGTH) / (2 * G3))
  assert.ok(CENTRAL_CHARGE >= 60)
  const max = model({ interval: 4, cutoff: 0.02, center: 0 })
  assert.ok(
    max.cft < ENTROPY_AXIS_MAX && max.bulk < ENTROPY_AXIS_MAX,
    'fixed entropy bars must not clip at the allowed extremes',
  )
})
test('regulated endpoints lie on the same boundary-orthogonal circle', () => {
  for (const interval of [1.4, 2, 4])
    for (const cutoff of [0.02, 0.1, 0.4]) {
      const s = settings({ interval, cutoff, center: 0.8 }),
        g = geodesic(interval, cutoff),
        p = curvePoints(s)
      near(p[0].x, 0.8 - interval / 2)
      near(p.at(-1).x, 0.8 + interval / 2)
      near(p[0].z, cutoff)
      near(p.at(-1).z, cutoff)
      near(p[50].z, g.radius)
      for (const point of p)
        near((point.x - 0.8) ** 2 + point.z ** 2, g.radius ** 2)
      near(p[0].length, 0)
      near(p.at(-1).length, g.length)
    }
})
test('independent metric integration agrees with the analytic regulated length', () => {
  for (const interval of [1.4, 2, 4])
    for (const cutoff of [0.02, 0.1, 0.4]) {
      const m = geodesic(interval, cutoff)
      near(numericalLength(interval, cutoff), m.length, 2e-6)
      // Cartesian polyline midpoint integration is independent of the angular integrand.
      const points = curvePoints({ interval, cutoff, center: 0 }, 10000)
      let sum = 0
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1],
          b = points[i]
        sum += Math.hypot(b.x - a.x, b.z - a.z) / ((a.z + b.z) / 2)
      }
      near(sum, m.length, 0.0002)
    }
})
test('spatial geodesic beats coordinate straight path and responds to interval and regulator', () => {
  const base = model(DEFAULT),
    wide = model({ ...DEFAULT, interval: 4 }),
    fine = model({ ...DEFAULT, cutoff: 0.04 })
  assert.ok(base.length < base.straightLength)
  assert.ok(wide.length > base.length && wide.radius > base.radius)
  assert.ok(fine.length > base.length)
  near(model({ ...DEFAULT, center: 1 }).length, base.length)
  near(model({ ...DEFAULT, center: -1 }).cft, base.cft)
})
test('CFT logarithm is an asymptotic comparison, never silently exact at finite cutoff', () => {
  const errors = [0.3, 0.1, 0.03, 0.02].map(
    (cutoff) => model({ ...DEFAULT, cutoff }).difference,
  )
  assert.ok(errors.every((x) => x > 0))
  for (let i = 1; i < errors.length; i++)
    assert.ok(errors[i] < errors[i - 1])
  const m = model({ ...DEFAULT, interval: 4, cutoff: 0.1 })
  near(m.deltaCft, (CENTRAL_CHARGE / 3) * Math.LN2)
  assert.ok(
    Math.abs(
      model({ ...DEFAULT, interval: 4, cutoff: 0.02 }).deltaBulk -
        m.deltaCft,
    ) < Math.abs(m.deltaBulk - m.deltaCft),
  )
})
test('bounds preserve finite geometry, and invalid physical formulas are rejected', () => {
  const clamped = settings({ interval: Infinity, center: NaN, cutoff: -1 })
  assert.equal(clamped.interval, 2)
  assert.equal(clamped.center, 0)
  assert.equal(clamped.cutoff, 0.02)
  for (const interval of [-1, 0, Infinity, NaN])
    assert.throws(() => geodesic(interval, 0.1), RangeError)
  for (const cutoff of [-1, 0, Infinity, NaN])
    assert.throws(() => geodesic(2, cutoff), RangeError)
  for (const curvature of [-1, 0, Infinity, NaN])
    assert.throws(() => geodesic(2, 0.1, curvature), RangeError)
  const s = intervalFromEndpoint(DEFAULT, 'right', 1.5)
  near(s.center - s.interval / 2, -1)
  near(s.interval, 2.5)
  near(s.center, 0.25)
  assert.deepEqual(intervalFromEndpoint(DEFAULT, 'right', NaN), DEFAULT)
})
test('all eight challenges require deliberate measurements under explicit conditions', () => {
  for (const kind of ['geometry', 'duality'])
    for (let lesson = 0; lesson < 4; lesson++) {
      const state = initialTrial(kind, lesson)
      assert.ok(
        steps(state).every((step) => !step.done),
        `${kind} ${lesson} starts unearned`,
      )
      assert.equal(state.measurements, 0)
      assert.ok(
        (kind === 'geometry' ? GEOMETRY_LESSONS : DUALITY_LESSONS)[
          lesson
        ].hint.includes('ε'),
      )
    }
  for (const [lesson, setup] of [
    [0, { interval: 2, cutoff: 0.2 }],
    [1, { interval: 3, cutoff: 0.2 }],
    [2, { interval: 2, cutoff: 0.04 }],
    [3, { interval: 4, cutoff: 0.2 }],
  ]) {
    const s = measure({
      ...initialTrial('geometry', lesson),
      setup: settings(setup),
    })
    assert.ok(steps(s).every((step) => step.done))
  }
  for (const [lesson, setup] of [
    [0, { interval: 4, cutoff: 0.1 }],
    [1, { interval: 2, cutoff: 0.1, center: 1 }],
  ]) {
    const s = measure({
      ...initialTrial('duality', lesson),
      setup: settings(setup),
    })
    assert.ok(steps(s).every((step) => step.done))
  }
})
test('regulator and entropy-difference lessons retain both measured comparisons without false marks', () => {
  for (const [lesson, cutoffs] of [
    [2, [0.3, 0.03]],
    [3, [0.1, 0.02]],
  ]) {
    let s = initialTrial('duality', lesson)
    const wrong = measure({
      ...s,
      setup: settings({ ...s.setup, interval: 1.4 }),
    })
    assert.ok(steps(wrong).every((step) => !step.done))
    s = measure({
      ...s,
      setup: settings({ ...s.setup, cutoff: cutoffs[0] }),
    })
    assert.equal(steps(s).filter((step) => step.done).length, 1)
    s = measure({
      ...s,
      setup: settings({ ...s.setup, cutoff: cutoffs[1] }),
    })
    assert.ok(steps(s).every((step) => step.done))
    assert.equal(s.records.length, 2)
  }
  assert.equal(reference('duality', 3).interval, 4)
})
