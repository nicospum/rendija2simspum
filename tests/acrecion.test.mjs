import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT,
  INNER,
  OUTER,
  PEAK_RADIUS,
  OBSERVER,
  C,
  GM_SUN,
  G,
  SIGMA,
  SOLAR_MASS,
  YEAR,
  diskFlux,
  model,
  orbitalPeriodYears,
  localContrast,
  frequencyShift,
  buildDiskMap,
  MAX_PHI,
  MAX_ANGLE,
} from '../src/acrecion/physics.ts'
import {
  LESSONS,
  observe,
  observed,
  checkAnswer,
} from '../src/acrecion/learning.ts'
import { traceNormalized } from '../src/lente/physics.ts'
import { blackHoleLabs } from '../src/series/catalog.ts'

const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <=
      tolerance * Math.max(Math.abs(expected), 1e-30),
    `${actual} != ${expected}`,
  )

test('gas off removes disk emission while gravity and stellar period remain', () => {
  const off = model({ ...DEFAULT, gas: 0 }),
    on = model(DEFAULT)
  assert.equal(off.temperature, 0)
  assert.equal(off.luminosity, 0)
  assert.equal(off.rs, on.rs)
  assert.equal(off.period, on.period)
  assert.ok(off.period > 0 && off.starRadiusRs > 600)
})
test('flux vanishes at ISCO and analytic maximum agrees with numerical search', () => {
  assert.equal(diskFlux(INNER, 4, 100), 0)
  assert.equal(diskFlux(1, 4, 100), 0)
  let peak = 0,
    radius = 0
  for (let r = INNER; r <= OUTER; r += 0.001) {
    const flux = diskFlux(r, 4, 100)
    if (flux > peak) {
      peak = flux
      radius = r
    }
  }
  near(radius, PEAK_RADIUS, 0.0002)
  near(
    model({ ...DEFAULT, gas: 100 }).temperature ** 4 * SIGMA,
    diskFlux(PEAK_RADIUS, 4, 100),
  )
})
test('finite disk luminosity agrees with independent quadrature of both faces', () => {
  const s = { ...DEFAULT, gas: 37 },
    m = model(s),
    count = 20000
  const dr = (OUTER - INNER) / count
  let sum = 0
  for (let i = 0; i < count; i++) {
    const r = INNER + (i + 0.5) * dr
    sum += diskFlux(r, s.mass, s.gas) * 4 * Math.PI * (r * m.rs) * dr * m.rs
  }
  near(m.luminosity, sum, 1e-8)
  const rate = ((s.gas / 100) * 1e-3 * SOLAR_MASS) / YEAR
  assert.ok(m.luminosity < (rate * C ** 2) / 12)
})
test('supply and mass scalings use fixed physical supply and fixed r/rs', () => {
  const a = model({ ...DEFAULT, gas: 25 }),
    b = model({ ...DEFAULT, gas: 100 })
  near(b.luminosity / a.luminosity, 4)
  near(b.temperature / a.temperature, Math.sqrt(2))
  const double = model({ ...DEFAULT, mass: 8, gas: 25 })
  near(double.rs / a.rs, 2)
  near(double.temperature / a.temperature, 1 / Math.sqrt(2))
  near(double.luminosity, a.luminosity)
})
test('orbit recovers the input mass from independent SI Kepler expression', () => {
  for (const mass of [1, 4, 8]) {
    const period = orbitalPeriodYears(mass)
    const inferredGM =
      (4 * Math.PI ** 2 * (100 * 149597870700) ** 3) / (period * YEAR) ** 2
    near(inferredGM, GM_SUN * mass * 1e6)
  }
  near(orbitalPeriodYears(8) / orbitalPeriodYears(4), 1 / Math.sqrt(2))
  near(SOLAR_MASS * G, GM_SUN)
})
test('local brightness asymmetry disappears face-on and increases with inclination', () => {
  assert.equal(localContrast(0), 1)
  assert.equal(localContrast(70, false), 1)
  assert.ok(localContrast(70) > localContrast(30))
  assert.ok(localContrast(70) > 8)
})
test('frequency shift agrees with local tetrad Doppler and gravitational factors', () => {
  const r = 6,
    beta = 1 / Math.sqrt(2 * (r - 1)),
    gamma = 1 / Math.sqrt(1 - beta ** 2)
  const gravity = Math.sqrt((1 - 1 / r) / (1 - 1 / OBSERVER))
  const lambda = r / Math.sqrt(1 - 1 / r)
  near(frequencyShift(r, lambda), gravity / (gamma * (1 - beta)))
  near(frequencyShift(r, -lambda), gravity / (gamma * (1 + beta)))
  near(
    (frequencyShift(r, lambda) / frequencyShift(r, -lambda)) ** 4,
    ((1 + beta) / (1 - beta)) ** 4,
  )
  near(frequencyShift(r, 0, false), gravity)
})
test('all supported control extremes produce finite, positive physical results', () => {
  for (const mass of [1, 8])
    for (const gas of [0, 100])
      for (const inclination of [0, 82]) {
        const m = model({ ...DEFAULT, mass, gas, inclination })
        assert.ok(Object.values(m).every(Number.isFinite))
        assert.ok(m.period > 0 && m.rs > 0 && m.luminosity >= 0)
      }
  for (const patch of [
    { mass: 0 },
    { mass: Infinity },
    { gas: NaN },
    { gas: -1 },
    { gas: 101 },
    { inclination: 90 },
    { view: 'invalid' },
    { doppler: 1 },
  ])
    assert.throws(() => model({ ...DEFAULT, ...patch }), RangeError)
  assert.throws(() => orbitalPeriodYears(0), RangeError)
  assert.throws(() => diskFlux(NaN, 4, 20), RangeError)
  assert.throws(() => frequencyShift(2, 0), RangeError)
})
test('geodesic texture preserves radius and angle, including multi-turn paths', () => {
  const width = 128,
    height = 384,
    map = buildDiskMap(width, height)
  assert.equal(map.data.length, width * height)
  assert.ok(map.data.every((x) => Number.isFinite(x) && x >= 0 && x <= 1.00001))
  assert.equal(
    map.data[(height - 1) * width + 4],
    1,
    'captured rays stay inside the opaque horizon',
  )
  for (const col of [12, 20, 50, 100]) {
    const ray = traceNormalized(
      OBSERVER,
      90,
      (col / (width - 1)) * MAX_ANGLE,
      true,
      { step: 0.0005, maxPhi: MAX_PHI, keepPath: true },
    )
    let phi = 0,
      j = 1
    const phis = [0]
    for (let k = 1; k < ray.points.length; k++) {
      const a = ray.points[k - 1],
        b = ray.points[k]
      phi += Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y)
      phis.push(phi)
    }
    for (const row of [10, 40, 80, 120, 160, 220]) {
      const target = (row / (height - 1)) * MAX_PHI
      if (target >= ray.phi - 0.02) continue
      while (j < phis.length - 1 && phis[j] < target) j++
      const a = ray.points[j - 1],
        b = ray.points[j]
      const t = (target - phis[j - 1]) / (phis[j] - phis[j - 1])
      const u = (1 - t) / Math.hypot(a.x, a.y) + t / Math.hypot(b.x, b.y)
      near(map.data[row * width + col], u, 0.001)
    }
  }
  assert.throws(() => buildDiskMap(10, 100), RangeError)
})
test('four learning paths require observations and an explanation', () => {
  const sequences = [
    [{ gas: 0 }, { gas: 70 }],
    [{ inclination: 72 }, { inclination: 72, lens: false }],
    [
      { doppler: true, inclination: 70 },
      { doppler: true, inclination: 0 },
    ],
    [{ view: 'star', mass: 8 }],
  ]
  for (let index = 0; index < 4; index++) {
    let l = { index, prediction: null, observations: [], completed: [] }
    assert.equal(checkAnswer(l), 'predict')
    l.prediction = LESSONS[index].answer
    assert.equal(checkAnswer(l), 'try')
    for (const patch of sequences[index])
      l.observations = observe(
        index,
        { ...LESSONS[index].setup, ...patch },
        l.observations,
      )
    assert.equal(checkAnswer(l), 'complete')
    l.prediction = (LESSONS[index].answer + 1) % 3
    assert.equal(checkAnswer(l), 'revise')
  }
})
test('a single state, wrong view, or contrast with movement off cannot complete a comparison', () => {
  assert.equal(observed(0, observe(0, { ...DEFAULT, gas: 80 }, [])), false)
  assert.equal(
    observed(1, observe(1, { ...DEFAULT, inclination: 75 }, [])),
    false,
  )
  assert.deepEqual(
    observe(2, { ...DEFAULT, inclination: 0, doppler: false }, []),
    [],
  )
  assert.deepEqual(observe(3, { ...DEFAULT, mass: 8, view: 'disk' }, []), [])
  const prior = ['bent'],
    next = observe(1, { ...DEFAULT, inclination: 75, lens: false }, prior)
  assert.deepEqual(prior, ['bent'])
  assert.deepEqual(next, ['bent', 'straight'])
})
test('black-hole special includes each implemented chapter once with valid canonical paths', () => {
  assert.deepEqual(
    blackHoleLabs.map((lab) => lab.id),
    ['lente-gravitacional', 'acrecion', 'hawking', 'entropia'],
  )
  assert.equal(new Set(blackHoleLabs.map((lab) => lab.href)).size, 4)
})
