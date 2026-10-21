import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT,
  C,
  GM_SUN,
  ENTRY,
  STOP,
  RECEIVER,
  MAX_TIME,
  HORIZON_TIME,
  FALL_END,
  lapse,
  fallTimeAt,
  fallRadius,
  lightSpeed,
  opticalDistance,
  arrivalTime,
  frequencyRatio,
  photonRadius,
  makePulse,
  pulseTrain,
  model,
} from '../src/horizonte/physics.ts'
import {
  LESSONS,
  initialState,
  reducer,
  observed,
} from '../src/horizonte/learning.ts'
const near = (a, b, tol = 1e-9) =>
  assert.ok(
    Math.abs(a - b) <= tol * Math.max(1e-20, Math.abs(b)),
    `${a} != ${b}`,
  )
const FALL = { ...DEFAULT, mode: 'fall', time: 0 }

test('horizon scale, stationary clock rates and mass scaling agree with SI Schwarzschild metric', () => {
  const m = model(DEFAULT)
  near(m.rs, (2 * GM_SUN * 4e6) / C ** 2)
  near(m.rs / 4e6, 2953.25008, 1e-8)
  near(m.probeClock, DEFAULT.time * Math.sqrt(1 - 1 / 4) * m.unit)
  near(m.receiverClock, DEFAULT.time * Math.sqrt(1 - 1 / 20) * m.unit)
  near(m.heldRate, Math.sqrt(0.75 / 0.95))
  const low = model({ ...DEFAULT, radius: 1.2 })
  assert.ok(low.heldRate < m.heldRate && low.acceleration > m.acceleration)
  const double = model({ ...DEFAULT, mass: 8 })
  near(double.rs / m.rs, 2)
  near(double.horizonProper / m.horizonProper, 2)
  near(double.heldRate, m.heldRate)
  near(double.acceleration / m.acceleration, 0.5)
})
test('chosen freely falling geodesic crosses the horizon in finite proper time and has regular norm', () => {
  assert.equal(fallRadius(HORIZON_TIME), 1)
  near(fallTimeAt(1), HORIZON_TIME)
  near(fallRadius(0), ENTRY)
  near(fallRadius(FALL_END), STOP)
  assert.equal(fallRadius(FALL_END + 0.01), null)
  for (const x of [3.5, 1.1, 1, 0.8]) {
    const t = fallTimeAt(x),
      h = 1e-5
    const velocity = (fallRadius(t + h) - fallRadius(t - h)) / (2 * h)
    near(velocity, -1 / Math.sqrt(x), 1e-8)
    const norm = -(1 - 1 / x) + (2 * velocity) / Math.sqrt(x) + velocity ** 2
    near(norm, -1, 1e-8)
  }
  const m = model({ ...FALL, time: HORIZON_TIME })
  assert.ok(m.probeClock > 0 && Number.isFinite(m.probeClock))
  near(m.probeClock, m.horizonProper)
  assert.equal(m.acceleration, 0)
})
test('optical primitive differentiates to the radial null travel integrand', () => {
  for (const x of [0.6, 0.8, 1.05, 2, 4, 20]) {
    const h = 1e-6,
      d = (opticalDistance(x + h) - opticalDistance(x - h)) / (2 * h)
    near(d, 1 / lightSpeed(x), 1e-7)
  }
})
test('arrival matches independent Simpson integration and grows without bound near the horizon', () => {
  for (const radius of [1.05, 2, 4]) {
    const count = 20000,
      h = (RECEIVER - radius) / count
    const f = (x) => Math.sqrt(x) / (Math.sqrt(x) - 1)
    let sum = f(radius) + f(RECEIVER)
    for (let i = 1; i < count; i++) sum += (i % 2 ? 4 : 2) * f(radius + i * h)
    near(arrivalTime(2, radius) - 2, (sum * h) / 3, 1e-8)
  }
  assert.ok(arrivalTime(0, 1.000001) > arrivalTime(0, 1.001))
  assert.equal(arrivalTime(0, 1), null)
  assert.equal(arrivalTime(0, 0.8), null)
})
test('frequency equals inverse received pulse spacing, independently of the written g formula', () => {
  for (const x of [3, 1.2, 1.05]) {
    const t = fallTimeAt(x),
      h = 1e-6
    const before = arrivalTime(t - h, fallRadius(t - h)),
      after = arrivalTime(t + h, fallRadius(t + h))
    const derivative = ((after - before) / (2 * h)) * lapse(RECEIVER)
    near(frequencyRatio(x, 'fall'), 1 / derivative, 1e-6)
    const beta = 1 / Math.sqrt(x),
      gamma = 1 / Math.sqrt(1 - beta ** 2)
    near(
      frequencyRatio(x, 'fall'),
      Math.sqrt((1 - 1 / x) / (1 - 1 / RECEIVER)) / (gamma * (1 + beta)),
    )
  }
  near(frequencyRatio(2, 'hover'), Math.sqrt(0.5 / 0.95))
  assert.equal(frequencyRatio(0.8, 'fall'), null)
  assert.equal(frequencyRatio(1, 'fall'), null)
})
test('light trajectories match independent RK4 integration and have null PG norm on both branches', () => {
  for (const radius of [0.8, 1, 1.2, 4])
    for (const outward of [true, false]) {
      const p = { ...makePulse(FALL, 'test'), radius, emitted: 0 },
        dt = 0.0001
      let r = radius
      for (let i = 0; i < 2000; i++) {
        const f = (x) => (outward ? 1 : -1) - 1 / Math.sqrt(x)
        const a = f(r),
          b = f(r + (dt * a) / 2),
          c = f(r + (dt * b) / 2),
          d = f(r + dt * c)
        r += (dt * (a + 2 * b + 2 * c + d)) / 6
      }
      near(photonRadius(p, 0.2, outward), r, 1e-8)
      const v = lightSpeed(radius, outward)
      assert.ok(
        Math.abs(v * v + (2 * v) / Math.sqrt(radius) - (1 - 1 / radius)) <
          1e-12,
      )
    }
  assert.ok(lightSpeed(0.8) < 0)
  assert.equal(lightSpeed(1), 0)
  assert.ok(lightSpeed(1.2) > 0)
})
test('arrival marker is at receiver at its computed time; interior trajectories never reach it', () => {
  const p = makePulse({ ...FALL, time: fallTimeAt(1.2) }, 'outside')
  assert.equal(photonRadius(p, p.arrival), RECEIVER)
  assert.ok(photonRadius(p, p.arrival - 0.01) < RECEIVER)
  const inside = makePulse({ ...FALL, time: fallTimeAt(0.8) }, 'inside')
  assert.ok(photonRadius(inside, inside.emitted + 0.1) < inside.radius)
  assert.equal(photonRadius(inside, inside.emitted + 10), null)
  const horizon = makePulse({ ...FALL, time: HORIZON_TIME }, 'horizon')
  assert.equal(horizon.arrival, null)
  assert.equal(photonRadius(horizon, HORIZON_TIME + 20), 1)
  assert.equal(photonRadius(p, p.emitted - 1), null)
})
test('pulse train uses equal emitter proper intervals and separates future arrivals from emission', () => {
  for (const setup of [
    { ...DEFAULT, time: 10 },
    { ...FALL, time: MAX_TIME },
  ]) {
    const pulses = pulseTrain(setup)
    for (let i = 1; i < pulses.length; i++)
      near(pulses[i].proper - pulses[i - 1].proper, setup.interval)
    assert.ok(pulses.every((p) => p.arrival === null || p.arrival > p.emitted))
  }
  assert.ok(
    pulseTrain({ ...FALL, time: MAX_TIME }).some((p) => p.arrival === null),
  )
  assert.equal(makePulse({ ...FALL, time: FALL_END + 0.1 }, 'gone'), null)
  const m = model({ ...FALL, time: MAX_TIME })
  assert.equal(m.radius, null)
  assert.equal(m.probeClock, null)
  assert.ok(Number.isFinite(m.receiverClock))
})
test('all four lessons require manipulation or saved sends plus an explanation', () => {
  const paths = [
    [{ type: 'tune', patch: { radius: 1.2 } }],
    [
      { type: 'radius', radius: 1 },
      { type: 'radius', radius: 0.8 },
    ],
    [
      { type: 'radius', radius: 3 },
      { type: 'send' },
      { type: 'radius', radius: 1.05 },
      { type: 'send' },
    ],
    [
      { type: 'radius', radius: 1.2 },
      { type: 'send' },
      { type: 'radius', radius: 0.8 },
      { type: 'send' },
      { type: 'receivePulse', id: 'manual-1' },
    ],
  ]
  for (let index = 0; index < 4; index++) {
    let s = initialState(index)
    assert.equal(observed(s.learning), false)
    s = reducer(s, { type: 'predict', choice: LESSONS[index].answer })
    s = reducer(s, { type: 'check' })
    assert.equal(s.learning.completed.length, 0)
    for (const action of paths[index]) s = reducer(s, action)
    assert.equal(observed(s.learning), true)
    s = reducer(s, { type: 'check' })
    assert.deepEqual(s.learning.completed, [index])
    s = reducer(s, { type: 'lesson', index: (index + 1) % 4 })
    assert.deepEqual(s.learning.completed, [index])
    assert.equal(s.manual.length, 0)
  }
})
test('wrong predictions, different modes and unsent comparisons do not complete lessons', () => {
  let s = initialState(2)
  s = reducer(s, { type: 'radius', radius: 3 })
  s = reducer(s, { type: 'radius', radius: 1.05 })
  assert.equal(observed(s.learning), false)
  s = reducer(s, { type: 'radius', radius: 3 })
  s = reducer(s, { type: 'send' })
  s = reducer(s, { type: 'radius', radius: 1.05 })
  s = reducer(s, { type: 'send' })
  s = reducer(s, { type: 'predict', choice: 0 })
  s = reducer(s, { type: 'check' })
  assert.equal(s.learning.completed.length, 0)
  assert.match(s.feedback, /Revisá/)
  assert.throws(() => frequencyRatio(0.8, 'hover'), RangeError)
})
test('pause, bounded stepping, feedback and mode changes preserve coherent history', () => {
  let s = initialState()
  assert.equal(reducer(s, { type: 'tick', delta: 0.1 }), s)
  const before = s.setup.time
  s = reducer(s, { type: 'tune', patch: { radius: 1.2 } })
  assert.equal(
    s.setup.time,
    before,
    'held radii compare independent runs at equal T',
  )
  s = reducer(s, { type: 'play' })
  s = reducer(s, { type: 'tick', delta: 100 })
  near(s.setup.time, before + 0.08)
  s = reducer(s, { type: 'check' })
  assert.equal(s.playing, false)
  const message = s.feedback
  s = reducer(s, { type: 'tick', delta: 0.1 })
  assert.equal(s.feedback, message)
  s = reducer(s, { type: 'send' })
  assert.equal(s.manual.length, 1)
  s = reducer(s, { type: 'tune', patch: { mode: 'fall' } })
  assert.equal(s.setup.time, 0)
  assert.equal(s.manual.length, 0)
})
test('manual history stays bounded and listening advances to a true pending arrival', () => {
  let s = initialState(3)
  s = reducer(s, { type: 'radius', radius: 1.2 })
  for (let i = 0; i < 150; i++) s = reducer(s, { type: 'send' })
  assert.equal(s.manual.length, 16)
  assert.equal(new Set(s.manual.map((p) => p.id)).size, 16)
  const all = [...pulseTrain(s.setup), ...s.manual]
  const expected = all
    .filter((p) => p.arrival !== null && p.arrival > s.setup.time)
    .sort((a, b) => a.arrival - b.arrival)[0]
  s = reducer(s, { type: 'receive' })
  assert.ok(s.setup.time >= expected.arrival && s.setup.time <= MAX_TIME)
  assert.equal(s.playing, false)
})
test('unsupported values are rejected and reducer does not corrupt a valid setup', () => {
  for (const patch of [
    { mass: NaN },
    { mass: 0 },
    { radius: 1 },
    { interval: 0 },
    { time: Infinity },
    { time: 49 },
    { mode: 'invalid' },
  ]) {
    assert.throws(() => model({ ...DEFAULT, ...patch }), RangeError)
    const s = initialState()
    assert.equal(reducer(s, { type: 'tune', patch }), s)
  }
  assert.throws(() => fallTimeAt(0.5), RangeError)
  assert.throws(() => lapse(1), RangeError)
  assert.throws(() => lightSpeed(0), RangeError)
  assert.throws(() => opticalDistance(1), RangeError)
  assert.throws(() => arrivalTime(0, 20), RangeError)
  const s = initialState()
  assert.equal(reducer(s, { type: 'lesson', index: -1 }), s)
})

test('the final lesson distinguishes receiving its saved exterior send from another automatic pulse', () => {
  let s = initialState(3)
  s = reducer(s, { type: 'radius', radius: 1.2 })
  s = reducer(s, { type: 'send' })
  const exterior = s.manual[0]
  s = reducer(s, { type: 'radius', radius: 0.8 })
  s = reducer(s, { type: 'send' })
  const interior = s.manual[1]
  assert.equal(observed(s.learning), false)
  s = reducer(s, { type: 'receive' })
  assert.equal(
    observed(s.learning),
    false,
    'another pulse does not prove receipt of the chosen send',
  )
  assert.equal(reducer(s, { type: 'receivePulse', id: interior.id }), s)
  s = reducer(s, { type: 'receivePulse', id: exterior.id })
  assert.ok(s.setup.time >= exterior.arrival)
  assert.equal(observed(s.learning), true)
  assert.equal(
    model(s.setup).probeClock,
    null,
    'receiving a past send does not revive or freeze the probe',
  )
})

test('a late exterior arrival outside the listening window is not confused with capture', () => {
  let s = initialState(3)
  s = reducer(s, { type: 'radius', radius: 1.0001 })
  s = reducer(s, { type: 'send' })
  const p = s.manual[0]
  assert.ok(p.arrival > MAX_TIME && p.frequency > 0)
  assert.equal(reducer(s, { type: 'receivePulse', id: p.id }), s)
})
