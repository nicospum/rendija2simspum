import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ARCSEC,
  AU,
  C,
  CENTURY,
  CYCLES,
  GM_SUN,
  integrate,
  MERCURY,
  point,
  TAU,
  validate,
} from '../src/orbita/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/orbita/learning.ts'
const close = (a, b, rel = 1e-8) =>
  assert.ok(
    Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-30),
    `${a} != ${b}`,
  )
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const end = (s) => reducer(s, { type: 'time', value: 1 })
const check = (s, choice) =>
  reducer(reducer(s, { type: 'predict', choice }), { type: 'check' })
test('Mercury benchmark: about 0.1035 arcsec per orbit and 42.98 arcsec per century', () => {
  const o = integrate(MERCURY)
  close(o.delta * ARCSEC, 0.10352, 8e-5)
  close((o.delta * ARCSEC * CENTURY) / o.period, 42.98, 2e-4)
  close(o.period / 86400, 87.969, 2e-5)
  // Fact-sheet rounded distances and mean J2000 elements differ slightly.
  close(o.perihelion / 1e9, 46, 5e-5)
  close(o.aphelion / 1e9, 69.818, 2e-5)
})
test('Independent first post-Newtonian prediction agrees across the complete control domain', () => {
  for (const a of [0.25, MERCURY.a, 1])
    for (const e of [0.05, MERCURY.e, 0.7])
      for (const mass of [0.5, 1, 2]) {
        const o = integrate({ ...MERCURY, a, e, mass })
        const expected =
          (6 * Math.PI * GM_SUN * mass) / (a * AU * (1 - e * e) * C * C)
        close(o.delta, expected, 2e-6)
        assert.ok(o.delta > expected)
      }
})
test('Simpson refinement preserves Mercury advance without subtracting nearly equal full angles', () => {
  const coarse = integrate(MERCURY, 64),
    fine = integrate(MERCURY, 1024)
  close(coarse.delta, fine.delta, 1e-13)
  close(coarse.period, fine.period, 1e-10)
  assert.ok(coarse.extra.every((v, i, a) => i === 0 || v > a[i - 1]))
})
test('Newton closes and keeps the Sun in a focus; GR returns to minimum radius at an advanced angle', () => {
  const o = integrate(MERCURY),
    start = point(o, 0, false),
    newton = point(o, 1, false),
    einstein = point(o, 1, true)
  close(start.x, newton.x)
  assert.ok(Math.abs(newton.y) < 1e-3)
  close(einstein.radius, start.radius)
  close(einstein.angle - TAU, o.delta, 1e-8)
  close(point(o, 0.5, true).radius, o.aphelion)
})
test('Visual gain changes only the plotted angle, preserving radius, advance and integrated quantities', () => {
  const o = integrate(MERCURY),
    real = point(o, 8.23, true),
    expanded = point(o, 8.23, true, 100000)
  close(real.radius, expanded.radius)
  close(real.advance, expanded.advance)
  close(expanded.angle - 8.23 * TAU, real.advance * 100000)
  close(integrate({ ...MERCURY, expanded: false }).delta, o.delta)
  close(point(o, 2, false, 100000).angle, 2 * TAU)
})
test('Larger mass, eccentricity and smaller radius have the expected distinct effects', () => {
  const o = integrate(MERCURY),
    large = integrate({ ...MERCURY, a: 2 * MERCURY.a })
  close(large.delta / o.delta, 0.5, 2e-7)
  close(large.period / o.period, Math.sqrt(8), 2e-7)
  close(
    large.delta / large.period / (o.delta / o.period),
    1 / (2 * Math.sqrt(8)),
    3e-7,
  )
  close(integrate({ ...MERCURY, mass: 2 }).delta / o.delta, 2, 3e-7)
  assert.ok(
    integrate({ ...MERCURY, e: 0.6 }).delta >
      integrate({ ...MERCURY, e: 0.1 }).delta,
  )
})
test('All sampled trajectories are finite, continuous and in the allowed radial interval', () => {
  for (const setup of [
    MERCURY,
    { ...MERCURY, a: 1, e: 0.7, mass: 2 },
    { ...MERCURY, a: 0.25, e: 0.05, mass: 0.5 },
  ]) {
    const o = integrate(setup)
    for (let i = 0; i <= 1000; i++) {
      const p = point(o, (i * CYCLES) / 1000, true, 100000)
      assert.ok([p.x, p.y, p.radius, p.angle, p.advance].every(Number.isFinite))
      assert.ok(
        p.radius >= o.perihelion * (1 - 1e-14) &&
          p.radius <= o.aphelion * (1 + 1e-14),
      )
    }
    const left = point(o, 1 - 1e-9, true, 100000),
      right = point(o, 1 + 1e-9, true, 100000)
    assert.ok(Math.hypot(left.x - right.x, left.y - right.y) < 1000)
  }
})
test('Invalid orbital and display inputs are rejected; no circular perihelion claim', () => {
  for (const patch of [
    { a: 0 },
    { a: NaN },
    { e: 0 },
    { e: 0.71 },
    { mass: Infinity },
    { mass: 0.49 },
    { progress: 1.1 },
    { expanded: 1 },
  ])
    assert.throws(() => validate({ ...MERCURY, ...patch }), RangeError)
  for (const steps of [0, 1, 16.5, 8193])
    assert.throws(() => integrate(MERCURY, steps), RangeError)
  for (const cycles of [-1, NaN, 11])
    assert.throws(() => point(integrate(MERCURY), cycles, true), RangeError)
  for (const gain of [0, NaN, 100001])
    assert.throws(() => point(integrate(MERCURY), 0, true, gain), RangeError)
})
test('Correct predictions alone do not complete any challenge', () => {
  for (let i = 0; i < 4; i++)
    assert.deepEqual(check(initialState(i), LESSONS[i].answer).completed, [])
})
test('All four challenges require their controlled comparisons, allow correction and retain discoveries', () => {
  const trials = [
    [(s) => end(s)],
    [(s) => end(s), (s) => end(tune(s, { e: 0.6 }))],
    [(s) => end(s), (s) => end(tune(s, { a: 2 * MERCURY.a }))],
    [(s) => end(s), (s) => tune(s, { expanded: true })],
  ]
  let completed = []
  for (let i = 0; i < 4; i++) {
    let s = initialState(i, completed)
    for (const trial of trials[i]) s = trial(s)
    assert.ok(observations(s).every(Boolean))
    const wrong = check(s, (LESSONS[i].answer + 1) % 3)
    assert.equal(wrong.completed.length, i)
    s = check(wrong, LESSONS[i].answer)
    assert.ok(s.feedback.startsWith('¡Descubrimiento completo!'))
    assert.equal(s.completed.length, i + 1)
    completed = s.completed
    s = reducer(s, { type: 'lesson', index: i })
    assert.deepEqual(s.marks, [])
    assert.deepEqual(s.completed, completed)
  }
})
test('Changing the wrong variable cannot satisfy a scientific comparison', () => {
  for (let i = 0; i < 4; i++)
    assert.ok(
      observations(end(tune(initialState(i), { mass: 2 }))).every((v) => !v),
    )
  let s = end(initialState(1))
  s = end(tune(s, { a: 1, e: 0.6 }))
  assert.deepEqual(observations(s), [true, false])
})
test('Physical tuning resets the phase; the visual magnifier preserves phase and measurements', () => {
  const s = end(initialState())
  assert.equal(tune(s, { e: 0.4 }).setup.progress, 0)
  assert.equal(tune(s, { expanded: false }).setup.progress, 1)
  assert.equal(tune(s, { a: NaN }), s)
  assert.equal(reducer(s, { type: 'time', value: NaN }), s)
  assert.equal(reducer(s, { type: 'lesson', index: 8 }), s)
  assert.throws(() => initialState(8), RangeError)
})
test('Playback is bounded, pause works, replay resets phase and negative ticks do nothing', () => {
  let s = reducer(initialState(), { type: 'play' })
  const first = reducer(s, { type: 'tick', seconds: 100 })
  assert.ok(first.setup.progress > 0 && first.setup.progress <= 0.01)
  assert.equal(reducer(s, { type: 'tick', seconds: -1 }), s)
  assert.equal(reducer(s, { type: 'tick', seconds: NaN }), s)
  s = reducer(s, { type: 'play' })
  assert.equal(reducer(s, { type: 'tick', seconds: 1 }), s)
  s = reducer(end(s), { type: 'play' })
  assert.equal(s.setup.progress, 0)
  for (let i = 0; i < 1200; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.progress, 1)
  assert.equal(s.playing, false)
})
