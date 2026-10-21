import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT,
  eventAt,
  itinerary,
  rate,
  snapshot,
  validate,
} from '../src/gemelos/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/gemelos/learning.ts'
const close = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`)
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const finish = (s) => reducer(s, { type: 'time', progress: 1 })
test('standard twin journey gives 10 and 6 years with 4 light-year destination', () => {
  const m = snapshot({ ...DEFAULT, progress: 1 })
  close(m.ownTotal, 6)
  close(m.t, 10)
  close(m.gap, 4)
  close(m.distance, 4)
  close(m.out, 5)
  close(m.back, 5)
  close(m.x, 0)
})
test('slower journey at same Earth duration gives 8 years and shorter destination', () => {
  const m = snapshot({ ...DEFAULT, outbound: 0.6, inbound: 0.6, progress: 1 })
  close(m.own, 8)
  close(m.distance, 3)
  close(m.total, 10)
})
test('waiting replaces moving time and accumulates proper time at unit rate', () => {
  const s = { ...DEFAULT, wait: 0.2 },
    p = itinerary(s)
  close(p.out, 4)
  close(p.back, 4)
  close(p.stop, 2)
  close(p.distance, 3.2)
  close(p.ownTotal, 6.8)
  const a = eventAt(s, 4.5),
    b = eventAt(s, 5.5)
  close(b.own - a.own, 1)
  close(a.x, b.x)
  close(a.velocity, 0)
})
test('asymmetric velocities meet at same endpoint and agree with interval sum', () => {
  const s = { ...DEFAULT, outbound: 0.3, inbound: 0.9, wait: 0.1 },
    p = itinerary(s)
  close(p.out * s.outbound, p.back * s.inbound)
  close(
    p.ownTotal,
    Math.sqrt(p.out ** 2 - p.distance ** 2) +
      p.stop +
      Math.sqrt(p.back ** 2 - p.distance ** 2),
  )
  close(eventAt(s, 10).x, 0)
})
test('proper time and positions are continuous at both changes of velocity', () => {
  for (const wait of [0, 0.2, 0.4]) {
    const s = { ...DEFAULT, wait },
      p = itinerary(s)
    for (const t of [p.out, p.leave]) {
      const a = eventAt(s, t, 'before'),
        b = eventAt(s, t, 'after')
      close(a.own, b.own)
      close(a.x, b.x)
      close(eventAt(s, t - 1e-7).own, eventAt(s, t + 1e-7).own, 3e-7)
    }
  }
})
test('turn changes Earth simultaneity assignment but never jumps the local clock', () => {
  const a = snapshot({ ...DEFAULT, progress: 0.5, side: 'before' }),
    b = snapshot({ ...DEFAULT, progress: 0.5, side: 'after' })
  close(a.own, 3)
  close(b.own, 3)
  close(a.assignedEarth, 1.8)
  close(b.assignedEarth, 8.2)
  close(b.assignedEarth - a.assignedEarth, 2 * 0.8 * 4)
  // The transformed time separation of assigned Earth and ship events vanishes.
  for (const m of [a, b])
    close(m.assignedEarth - m.t - m.velocity * (0 - m.x), 0)
})
test('message received at turn contains earlier ship time, independent of frame switch', () => {
  const a = snapshot({ ...DEFAULT, progress: 0.5, side: 'before' }),
    b = snapshot({ ...DEFAULT, progress: 0.5, side: 'after' })
  close(a.received.t, 5 / 1.8)
  close(a.received.own, 5 / 3)
  close(a.received.t + a.received.x, 5)
  close(a.received.own, b.received.own)
})
test('photon null paths and worldlines remain valid across all control extremes', () => {
  for (const outbound of [0.1, 0.6, 0.95])
    for (const inbound of [0.1, 0.8, 0.95])
      for (const duration of [2, 10, 20])
        for (const wait of [0, 0.2, 0.4]) {
          const setup = { ...DEFAULT, outbound, inbound, duration, wait },
            p = itinerary(setup)
          let oldOwn = -1
          for (let i = 0; i <= 50; i++) {
            const m = snapshot({ ...setup, progress: i / 50 })
            assert.ok(
              Object.values(m)
                .filter((v) => typeof v === 'number')
                .every(Number.isFinite),
            )
            assert.ok(m.own >= oldOwn && m.own <= m.t + 1e-8)
            oldOwn = m.own
            assert.ok(m.received.t <= m.t + 1e-8 && m.received.t >= 0)
            close(m.received.t + m.received.x, m.t)
            assert.ok(
              m.assignedEarth >= -1e-8 && m.assignedEarth <= duration + 1e-8,
            )
            close(m.x, eventAt(setup, m.t).x)
          }
          close(p.out + p.stop + p.back, duration)
        }
})
test('proper time agrees with independent midpoint integration', () => {
  const s = {
      ...DEFAULT,
      outbound: 0.47,
      inbound: 0.91,
      wait: 0.3,
      duration: 17,
    },
    p = itinerary(s)
  let sum = 0
  const dt = p.total / 20000
  for (let i = 0; i < 20000; i++) {
    const v = eventAt(s, (i + 0.5) * dt).velocity
    sum += Math.sqrt(1 - v * v) * dt
  }
  close(sum, p.ownTotal, 0.001)
})
test('doubling duration doubles distances and all accumulated times', () => {
  const a = snapshot({ ...DEFAULT, progress: 0.7 }),
    b = snapshot({ ...DEFAULT, duration: 20, progress: 0.7 })
  for (const key of [
    't',
    'own',
    'distance',
    'ownTotal',
    'assignedEarth',
    'gap',
  ])
    close(b[key], 2 * a[key])
})
test('invalid inputs are rejected by physical API and ignored by reducer', () => {
  for (const patch of [
    { outbound: 0 },
    { inbound: 1 },
    { duration: NaN },
    { wait: 0.5 },
    { progress: Infinity },
    { side: 'invalid' },
  ])
    assert.throws(() => validate({ ...DEFAULT, ...patch }), RangeError)
  assert.throws(() => rate(1), RangeError)
  assert.throws(() => eventAt(DEFAULT, -1), RangeError)
  const s = initialState()
  assert.strictEqual(tune(s, { outbound: Infinity }), s)
  assert.strictEqual(reducer(s, { type: 'time', progress: NaN }), s)
})
test('all four challenges require experiments and a correct prediction', () => {
  for (let index = 0; index < 4; index++) {
    let s = initialState(index)
    s = reducer(s, { type: 'predict', choice: LESSONS[index].answer })
    assert.equal(reducer(s, { type: 'check' }).completed.length, 0)
    if (index === 0) s = finish(s)
    if (index === 1) {
      s = finish(s)
      s = finish(tune(s, { outbound: 0.8, inbound: 0.8 }))
    }
    if (index === 2) {
      s = reducer(s, { type: 'time', progress: 0.5, side: 'before' })
      s = reducer(s, { type: 'time', progress: 0.5, side: 'after' })
    }
    if (index === 3) {
      s = finish(s)
      s = finish(tune(s, { wait: 0.2 }))
    }
    assert.ok(observations(s).every(Boolean))
    const wrong = reducer(
      reducer(s, { type: 'predict', choice: (LESSONS[index].answer + 1) % 3 }),
      { type: 'check' },
    )
    assert.equal(wrong.completed.length, 0)
    s = reducer(s, { type: 'check' })
    assert.deepEqual(s.completed, [index])
    assert.match(s.feedback, /Descubrimiento completo/)
    assert.deepEqual(reducer(s, { type: 'check' }).completed, [index])
  }
})
test('tuning restarts an experiment while changing views need not mutate its setup', () => {
  const s = finish(initialState()),
    next = tune(s, { duration: 12 })
  assert.equal(next.setup.progress, 0)
  assert.equal(next.playing, false)
  assert.equal(s.setup.progress, 1)
})
test('lesson switching preserves achievements and resets the experiment', () => {
  let s = finish(initialState())
  s = reducer(s, { type: 'predict', choice: 1 })
  s = reducer(s, { type: 'check' })
  s = reducer(s, { type: 'lesson', index: 1 })
  assert.deepEqual(s.completed, [0])
  assert.equal(s.prediction, null)
  assert.equal(s.setup.progress, 0)
  assert.deepEqual(s.marks, [])
  assert.strictEqual(reducer(s, { type: 'lesson', index: 5 }), s)
})
test('playback pauses, caps elapsed steps, stops at reunion and can replay', () => {
  let s = reducer(initialState(), { type: 'play' })
  s = reducer(s, { type: 'tick', seconds: 100 })
  close(s.setup.progress, 0.007)
  s = reducer(s, { type: 'play' })
  const paused = s
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 1 }), paused)
  s = reducer(finish(s), { type: 'play' })
  assert.equal(s.setup.progress, 0)
  assert.equal(s.playing, true)
  for (let i = 0; i < 150; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.progress, 1)
  assert.equal(s.playing, false)
})
