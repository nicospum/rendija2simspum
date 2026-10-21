import test from 'node:test'
import assert from 'node:assert/strict'
import {
  C,
  DAY,
  GM,
  R,
  DEFAULT,
  GPS,
  heightFromPosition,
  heightPosition,
  rates,
  snapshot,
  validate,
} from '../src/altura/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/altura/learning.ts'
const close = (a, b, tol = 1e-12) =>
  assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`)
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const finish = (s) => reducer(s, { type: 'time', value: 1 })
test('same height and rest have zero drift at every duration', () => {
  for (const days of [1, 7])
    for (const progress of [0, 0.5, 1]) {
      const m = snapshot({ ...DEFAULT, height: 0, days, progress })
      assert.equal(m.physicalOffset, 0)
      assert.equal(m.motion, 0)
      assert.equal(m.gravity, 0)
    }
})
test('100 m stationary height recovers independent weak-field potential prediction', () => {
  const s = { ...DEFAULT, progress: 1 },
    m = snapshot(s),
    weak = ((GM * (s.height / (R * (R + s.height)))) / C ** 2) * DAY
  close(m.physicalOffset / weak, 1, 2e-9)
  assert.ok(m.physicalOffset * 1e9 > 0.94 && m.physicalOffset * 1e9 < 0.95)
})
test('centimetre and micrometre effects survive precision near unity', () => {
  for (const height of [1e-6, 0.001, 0.33]) {
    const m = snapshot({ ...DEFAULT, height, progress: 1 }),
      weak = (((GM / R ** 2) * height) / C ** 2) * DAY
    assert.ok(m.physicalOffset > 0)
    close(m.physicalOffset / weak, 1, 1e-7)
  }
})
test('higher stationary clocks gain more proper time without increasing local seconds', () => {
  let previous = 0
  for (const height of [0, 0.33, 1, 100, 4000]) {
    const r = rates({ ...DEFAULT, height })
    assert.ok(r.total >= previous)
    previous = r.total
    assert.equal(r.velocity, 0)
  }
})
test('accumulated offset scales with elapsed time while daily rate stays constant', () => {
  const a = snapshot({ ...DEFAULT, progress: 1 }),
    b = snapshot({ ...DEFAULT, days: 7, progress: 1 }),
    half = snapshot({ ...DEFAULT, progress: 0.5 })
  close(b.physicalOffset, 7 * a.physicalOffset, 1e-20)
  close(half.physicalOffset, a.physicalOffset / 2, 1e-20)
  assert.equal(a.total, b.total)
})
test('GPS circular benchmark separates gravity, kinematics and net drift', () => {
  const m = snapshot({ ...GPS, progress: 1 })
  assert.ok(m.gravity * DAY * 1e6 > 45 && m.gravity * DAY * 1e6 < 47)
  assert.ok(m.motion * DAY * 1e6 < -7 && m.motion * DAY * 1e6 > -8)
  assert.ok(m.physicalOffset * 1e6 > 38 && m.physicalOffset * 1e6 < 39)
  close(m.total, m.gravity + m.motion, 1e-25)
  assert.ok(m.velocity > 3800 && m.velocity < 4000)
})
test('circular proper time agrees with independent Schwarzschild geodesic expression', () => {
  for (const height of [400000, GPS.height, 35786000]) {
    const s = { ...GPS, height },
      r = R + height,
      m = rates(s),
      ratio = Math.sqrt(
        (1 - (3 * GM) / (r * C ** 2)) / (1 - (2 * GM) / (R * C ** 2)),
      )
    close(m.total, ratio - 1, 2e-16)
    close(
      m.period / (2 * Math.PI * Math.sqrt(r ** 3 / GM)),
      Math.sqrt(1 - (2 * GM) / (R * C ** 2)),
      1e-14,
    )
  }
})
test('orbital angle completes a turn in one reference-clock orbital period', () => {
  const s = { ...GPS, days: 1 },
    p = rates(s).period,
    m = snapshot({ ...s, progress: p / DAY })
  close(m.angle, 2 * Math.PI, 1e-12)
})
test('low orbit can lose proper time while high GPS orbit gains it', () => {
  assert.ok(rates({ ...GPS, height: 400000 }).total < 0)
  assert.ok(rates(GPS).total > 0)
})
test('at fixed height motion opposes gravitational gain and twice the speed gives fourfold leading effect', () => {
  const rest = rates({ ...GPS, motion: 'quieto' }),
    a = rates({ ...GPS, motion: 'manual', speed: 2000 }),
    b = rates({ ...GPS, motion: 'manual', speed: 4000 })
  assert.equal(rest.motion, 0)
  assert.ok(a.total < rest.total)
  close(b.motion / a.motion, 4, 1e-8)
})
test('ideal frequency adjustment aligns transmitted reading while preserving physical ageing', () => {
  const raw = snapshot({ ...GPS, progress: 1 }),
    fixed = snapshot({ ...GPS, progress: 1, corrected: true })
  assert.equal(raw.physicalOffset, fixed.physicalOffset)
  assert.equal(fixed.readoutOffset, 0)
  assert.equal(fixed.rangeBias, 0)
  assert.ok(fixed.frequencyAdjustment < 0)
  close((1 + fixed.total) * (1 + fixed.frequencyAdjustment), 1, 1e-15)
  close(raw.rangeBias, C * raw.physicalOffset, 1e-8)
})
test('unexpanded chart setting cannot change any physical result', () => {
  const a = snapshot({ ...GPS, progress: 0.7 }),
    b = snapshot({ ...GPS, progress: 0.7, expanded: false })
  assert.deepEqual(a, b)
})
test('logarithmic height control preserves presets and its whole range', () => {
  for (const height of [0, 0.01, 0.33, 1, 100, 4000])
    close(heightFromPosition(heightPosition(height)), height, 1e-9)
  close(heightPosition(0), 0)
  close(heightPosition(4000), 100)
})
test('all combinations of supported extremes remain finite and clocks are timelike', () => {
  for (const height of [400000, GPS.height, 36e6])
    for (const motion of ['quieto', 'circular', 'manual'])
      for (const speed of [0, 8000])
        for (const days of [1, 7])
          for (const progress of [0, 0.3, 1]) {
            const m = snapshot({
              ...GPS,
              height,
              motion,
              speed,
              days,
              progress,
            })
            assert.ok(
              Object.values(m)
                .filter((v) => typeof v === 'number')
                .every(Number.isFinite),
            )
            assert.ok(1 + m.total > 0)
            close(m.physicalOffset, m.gravityOffset + m.motionOffset, 1e-20)
          }
})
test('invalid inputs cannot poison state or physical calculations', () => {
  for (const patch of [
    { mode: 'earth' },
    { height: -1 },
    { height: Infinity },
    { speed: NaN },
    { days: 0 },
    { progress: 2 },
    { motion: 'constructor' },
    { corrected: 'yes' },
    { expanded: null },
  ])
    assert.throws(() => validate({ ...GPS, ...patch }), RangeError)
  assert.throws(() => validate({ ...DEFAULT, motion: 'circular' }), RangeError)
  assert.throws(() => validate({ ...DEFAULT, corrected: true }), RangeError)
  const s = initialState()
  assert.strictEqual(tune(s, { height: NaN }), s)
  assert.strictEqual(reducer(s, { type: 'time', value: NaN }), s)
})
test('all four challenges require complete intended trials and a correct explanation', () => {
  for (let i = 0; i < 4; i++) {
    let s = reducer(initialState(i), {
      type: 'predict',
      choice: LESSONS[i].answer,
    })
    assert.equal(reducer(s, { type: 'check' }).completed.length, 0)
    s = finish(s)
    if (i === 0) s = finish(tune(s, { height: 100 }))
    if (i === 1) s = finish(tune(s, { days: 7 }))
    if (i === 2) s = finish(tune(s, { motion: 'circular' }))
    if (i === 3) s = tune(s, { corrected: true })
    assert.ok(observations(s).every(Boolean))
    assert.equal(
      reducer(
        reducer(s, { type: 'predict', choice: (LESSONS[i].answer + 1) % 3 }),
        { type: 'check' },
      ).completed.length,
      0,
    )
    s = reducer(s, { type: 'check' })
    assert.deepEqual(s.completed, [i])
    assert.match(s.feedback, /Descubrimiento completo/)
    assert.deepEqual(reducer(s, { type: 'check' }).completed, [i])
  }
})
test('confounded heights, incomplete days or manual instead of circular do not complete trials', () => {
  let s = finish(tune(initialState(0), { height: 101 }))
  assert.deepEqual(s.marks, [])
  s = reducer(initialState(), { type: 'time', value: 0.5 })
  assert.deepEqual(s.marks, [])
  s = finish(tune(initialState(2), { motion: 'manual', speed: 3874 }))
  assert.deepEqual(s.marks, [])
})
test('instrument settings preserve time while physical conditions restart and pause', () => {
  const s = finish(initialState(3))
  assert.equal(tune(s, { corrected: true }).setup.progress, 1)
  assert.equal(tune(s, { expanded: false }).setup.progress, 1)
  const next = tune(s, { height: 400000 })
  assert.equal(next.setup.progress, 0)
  assert.equal(next.playing, false)
})
test('lesson and mode changes preserve achievements with independent configurations', () => {
  let s = finish(initialState())
  s = finish(tune(s, { height: 100 }))
  s = reducer(s, { type: 'predict', choice: 0 })
  s = reducer(s, { type: 'check' })
  s = reducer(s, { type: 'lesson', index: 1 })
  assert.deepEqual(s.completed, [0])
  assert.equal(s.prediction, null)
  assert.deepEqual(s.marks, [])
  s = reducer(s, { type: 'mode', mode: 'gps' })
  assert.equal(s.setup.mode, 'gps')
  assert.equal(s.setup.motion, 'circular')
  assert.deepEqual(s.completed, [0])
  const a = initialState(),
    b = initialState()
  a.setup.height = 5
  assert.equal(b.setup.height, 0)
})
test('playback caps elapsed steps, pauses, reaches the end and replays', () => {
  let s = reducer(initialState(), { type: 'play' })
  s = reducer(s, { type: 'tick', seconds: 100 })
  close(s.setup.progress, 0.012)
  s = reducer(s, { type: 'play' })
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 1 }), s)
  s = reducer(finish(s), { type: 'play' })
  assert.equal(s.setup.progress, 0)
  for (let i = 0; i < 90; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.progress, 1)
  assert.equal(s.playing, false)
})
