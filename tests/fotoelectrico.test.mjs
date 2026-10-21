import test from 'node:test'
import assert from 'node:assert/strict'
import {
  C,
  DEFAULT,
  E_CHARGE,
  H,
  H_EV,
  MATERIALS,
  MAX_POWER,
  M_E,
  snapshot,
  spectrum,
  stream,
  YIELD,
} from '../src/fotoelectrico/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/fotoelectrico/learning.ts'
const close = (a, b, r = 1e-12) =>
  assert.ok(
    Math.abs(a - b) <= r * Math.max(Math.abs(a), Math.abs(b), 1e-30),
    `${a} != ${b}`,
  )
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const record = (s) => reducer(s, { type: 'record' })
const check = (s, choice) =>
  reducer(reducer(s, { type: 'predict', choice }), { type: 'check' })
test('Blue sodium benchmark gives independently expected photon energy, maximum energy, current and speed', () => {
  const m = snapshot(DEFAULT)
  close(m.photonEv, 2.688184003, 1e-10)
  close(m.kineticMax, 0.228184003, 1e-9)
  close(m.current * 1e9, 18.599917247, 1e-10)
  close(m.speed, 283314.1684, 1e-10)
  close(m.wavelength, 461.21916615, 1e-10)
})
test('Red light cannot emit from any available metal even at maximum brightness', () => {
  for (const material of Object.keys(MATERIALS))
    for (const brightness of [1, 25, 100]) {
      const m = snapshot({ ...DEFAULT, material, brightness, frequency: 450 })
      assert.equal(m.emitting, false)
      assert.equal(m.kineticMax, 0)
      assert.equal(m.current, 0)
      assert.ok(m.photonRate > 0)
    }
})
test('Each exact threshold has zero transport; just below and just above are distinguished without an artificial tolerance', () => {
  for (const material of Object.keys(MATERIALS)) {
    const threshold = snapshot({ ...DEFAULT, material }).threshold
    for (const offset of [-1e-6, 0, 1e-6]) {
      const m = snapshot({
        ...DEFAULT,
        material,
        frequency: threshold + offset,
      })
      assert.equal(m.emitting, offset > 0)
      assert.equal(m.canEmit, offset > 0)
      if (offset > 0) assert.ok(m.kineticMax > 0 && m.kineticMax < 1e-7)
      else assert.equal(m.current, 0)
    }
  }
})
test('Zero brightness extinguishes photon flux, emission and current even far above threshold', () => {
  const m = snapshot({ ...DEFAULT, frequency: 1600, brightness: 0 })
  assert.ok(m.canEmit)
  assert.equal(m.emitting, false)
  for (const key of [
    'power',
    'photonRate',
    'emissionRate',
    'current',
    'kineticMax',
    'speed',
    'stopping',
  ])
    assert.equal(m[key], 0)
})
test('Quadrupling brightness quadruples photon flux and current, preserving frequency, maximum energy and speed', () => {
  const dim = snapshot({ ...DEFAULT, brightness: 25 }),
    bright = snapshot({ ...DEFAULT, brightness: 100 })
  close(bright.current / dim.current, 4)
  close(bright.photonRate / dim.photonRate, 4)
  close(bright.emissionRate / dim.emissionRate, 4)
  for (const key of [
    'photonEv',
    'threshold',
    'kineticMax',
    'speed',
    'stopping',
  ])
    assert.equal(dim[key], bright[key])
})
test('At fixed power higher frequency raises maximum energy while lowering incident photon flux and ideal current', () => {
  const blue = snapshot(DEFAULT),
    uv = snapshot({ ...DEFAULT, frequency: 1000 })
  assert.ok(uv.kineticMax > blue.kineticMax)
  assert.ok(uv.speed > blue.speed)
  close(uv.photonRate / blue.photonRate, 0.65)
  close(uv.current / blue.current, 0.65)
  close((uv.kineticMax - blue.kineticMax) / 350e12, H / E_CHARGE)
})
test('Changing material changes the extraction cost, not incident photon energy or flux', () => {
  const sodium = snapshot({ ...DEFAULT, frequency: 1000 }),
    zinc = snapshot({ ...DEFAULT, frequency: 1000, material: 'zinc' })
  assert.equal(sodium.photonEv, zinc.photonEv)
  assert.equal(sodium.photonRate, zinc.photonRate)
  assert.ok(sodium.emitting)
  assert.equal(zinc.emitting, false)
  assert.ok(zinc.threshold > sodium.threshold)
})
test('Einstein energy balance, nonrelativistic speed and stopping voltage remain consistent across all supported conditions', () => {
  for (const material of Object.keys(MATERIALS))
    for (let frequency = 350; frequency <= 1600; frequency += 25)
      for (const brightness of [0, 1, 25, 100]) {
        const m = snapshot({ ...DEFAULT, material, frequency, brightness })
        for (const key of [
          'photonEv',
          'threshold',
          'wavelength',
          'power',
          'photonRate',
          'surplus',
          'kineticMax',
          'emissionRate',
          'current',
          'speed',
          'stopping',
        ])
          assert.ok(Number.isFinite(m[key]))
        close(m.photonRate * H * frequency * 1e12, m.power)
        close(m.current, E_CHARGE * m.emissionRate)
        assert.ok(m.speed < C * 0.01)
        if (m.emitting) {
          close(m.material.work + m.kineticMax, m.photonEv)
          close(0.5 * M_E * m.speed * m.speed, m.kineticMax * E_CHARGE)
          close(E_CHARGE * m.stopping, m.kineticMax * E_CHARGE)
          close(m.emissionRate, YIELD * m.photonRate)
        } else assert.equal(m.current, 0)
      }
  assert.equal(MAX_POWER, 1e-6)
})
test('Material threshold equals work function divided by Planck constant and is ordered correctly', () => {
  const thresholds = Object.keys(MATERIALS).map((material) => {
    const m = snapshot({ ...DEFAULT, material })
    close(m.threshold * 1e12 * H_EV, m.material.work)
    return m.threshold
  })
  assert.ok(thresholds[0] < thresholds[1] && thresholds[1] < thresholds[2])
})
test('Invalid inputs and inherited material names cannot poison the model or state', () => {
  const s = initialState()
  for (const patch of [
    { frequency: NaN },
    { frequency: 349 },
    { frequency: 1601 },
    { brightness: Infinity },
    { brightness: -1 },
    { brightness: 101 },
    { material: 'constructor' },
    { material: 'toString' },
    { material: 'none' },
  ]) {
    assert.throws(() => snapshot({ ...DEFAULT, ...patch }), RangeError)
    assert.equal(tune(s, patch), s)
  }
  assert.throws(() => initialState(4), RangeError)
  assert.equal(reducer(s, { type: 'lesson', index: -1 }), s)
  assert.equal(reducer(s, { type: 'predict', choice: 3 }), s)
})
test('Visible light hue differs between red and blue; ultraviolet and infrared are explicitly symbolic', () => {
  assert.notEqual(spectrum(450).color, spectrum(650).color)
  assert.match(spectrum(650).band, /visible/)
  assert.match(spectrum(1000).band, /Ultravioleta.*simbólico/)
  assert.match(spectrum(350).band, /Infrarrojo.*simbólico/)
  for (const f of [NaN, 0, 2000]) assert.throws(() => spectrum(f), RangeError)
})
test('Visual free-flight representatives preserve constant-speed positions, density and bounded work', () => {
  const fast = stream(1, 2, 0.25),
    slow = stream(1, 4, 0.25)
  close(fast[0].x, 2 * slow[0].x)
  assert.ok(slow.length > fast.length)
  assert.deepEqual(stream(0, 1, 0), [])
  for (const time of [0, 0.01, 0.3, 1, 10000])
    for (const rate of [0.001, 1, 100, 1e9]) {
      const points = stream(rate, 0.8, time)
      assert.ok(points.length <= 64)
      for (const p of points)
        assert.ok(
          Number.isFinite(p.x) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1,
        )
    }
  for (const args of [
    [-1, 1, 0],
    [1, 0, 0],
    [1, 1, -1],
    [1, 1, NaN],
    [1, 1, 0, 1e6],
  ])
    assert.throws(() => stream(...args), RangeError)
})
test('Tuning alone does not register observations or complete a challenge', () => {
  let s = initialState()
  s = tune(s, { frequency: 650 })
  assert.deepEqual(s.marks, [])
  assert.equal(check(s, LESSONS[0].answer).completed.length, 0)
})
test('All four lessons require intended recorded comparisons and a correct explanation', () => {
  const trials = [
    [{}, { frequency: 650 }],
    [{}, { brightness: 100 }],
    [{}, { material: 'zinc' }],
    [{}, { frequency: 1000 }],
  ]
  let completed = []
  for (let i = 0; i < 4; i++) {
    let s = initialState(i, completed)
    assert.equal(check(s, LESSONS[i].answer).completed.length, i)
    for (const patch of trials[i]) s = record(tune(s, patch))
    assert.ok(observations(s).every(Boolean))
    const wrong = check(s, (LESSONS[i].answer + 1) % 3)
    assert.equal(wrong.completed.length, i)
    s = check(wrong, LESSONS[i].answer)
    assert.equal(s.completed.length, i + 1)
    assert.match(s.feedback, /¡Descubrimiento completo!/)
    completed = s.completed
    const reset = reducer(s, { type: 'lesson', index: i })
    assert.deepEqual(reset.marks, [])
    assert.deepEqual(reset.records, [])
    assert.deepEqual(reset.completed, completed)
  }
})
test('Confounded light power or material cannot fulfil a controlled comparison', () => {
  for (const index of [0, 1, 3]) {
    const s = record(tune(initialState(index), { material: 'plata' }))
    assert.ok(observations(s).every((v) => !v))
  }
  assert.ok(
    observations(record(tune(initialState(2), { brightness: 100 }))).every(
      (v) => !v,
    ),
  )
})
test('Recorded conditions are immutable, deduplicated and bounded while challenge marks persist', () => {
  let s = record(initialState(0)),
    saved = s.records[0]
  s = tune(s, { frequency: 650 })
  assert.equal(saved.setup.frequency, 450)
  assert.equal(s.records.length, 1)
  s = record(s)
  s = record(s)
  assert.equal(s.records.length, 2)
  s = record(tune(s, { frequency: 1000 }))
  assert.equal(s.records.length, 2)
  assert.ok(observations(s).every(Boolean))
  assert.equal(s.records[0].setup.frequency, 650)
})
test('Animation can pause, bounds long ticks and cannot change measurements or physical parameters', () => {
  let s = record(initialState()),
    saved = snapshot(s.setup)
  assert.equal(reducer(s, { type: 'tick', seconds: 1 }), s)
  s = reducer(s, { type: 'play' })
  assert.equal(reducer(s, { type: 'tick', seconds: NaN }), s)
  assert.equal(reducer(s, { type: 'tick', seconds: -1 }), s)
  s = reducer(s, { type: 'tick', seconds: 1000 })
  assert.equal(s.time, 0.1)
  assert.deepEqual(snapshot(s.setup), saved)
  assert.equal(s.records.length, 1)
  s = reducer(s, { type: 'play' })
  assert.equal(reducer(s, { type: 'tick', seconds: 1 }), s)
})
