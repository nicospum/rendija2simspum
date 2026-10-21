import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  C,
  DEFAULT,
  gamma,
  signals,
  snapshot,
  measurement,
  MIN_TIME,
  MAX_TIME,
} from '../src/tren/physics.ts'
import { initialState, reducer, observed } from '../src/tren/learning.ts'
import { einsteinLabs } from '../src/einstein/catalog.ts'
const close = (a, b, epsilon = 1e-9) =>
  assert.ok(
    Math.abs(a - b) < epsilon * Math.max(Math.abs(a), Math.abs(b), 1e-14),
    `${a} != ${b}`,
  )
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const finish = (s) => reducer(s, { type: 'time', value: MAX_TIME })
test('simultaneous platform strikes obey an independent relativity-of-simultaneity formula', () => {
  const s = { ...DEFAULT, time: 0 },
    e = snapshot(s, 'anden'),
    t = snapshot(s, 'tren')
  close(e.emissionGap, 0)
  close(
    t.emissionGap,
    (-gamma(s.beta) * (s.beta * C) * (s.length / gamma(s.beta))) / C ** 2,
  )
  close(t.pulses[0].emission.t, (0.3 * s.length) / C)
  close(t.pulses[1].emission.t, (-0.3 * s.length) / C)
})
test('train-simultaneous emissions transform to different platform dates', () => {
  const s = { ...DEFAULT, sync: 'tren' },
    t = snapshot(s, 'tren'),
    e = snapshot(s, 'anden')
  close(t.emissionGap, 0)
  close(e.emissionGap, (gamma(s.beta) * s.beta * s.length) / C)
  assert.ok(e.pulses[0].emission.t < e.pulses[1].emission.t)
})
test('all receiver events are future null-separated from emission and lie on their worldlines', () => {
  for (const beta of [-0.9, -0.6, 0, 0.8, 0.9])
    for (const sync of ['anden', 'tren'])
      for (const offset of [-0.3, 0, 0.3])
        for (const length of [100, 300, 400]) {
          const setup = { ...DEFAULT, beta, sync, offset, length }
          for (const frame of ['anden', 'tren']) {
            const m = snapshot(setup, frame)
            for (const p of m.pulses)
              for (const kind of ['platform', 'passenger']) {
                const r = p[kind],
                  dt = r.t - p.emission.t
                assert.ok(dt > 0)
                close(C * dt, Math.abs(r.x - p.emission.x), 1e-8)
                const expected =
                  frame === 'anden'
                    ? kind === 'platform'
                      ? 0
                      : beta * C * r.t + (offset * length) / gamma(beta)
                    : kind === 'passenger'
                      ? offset * length
                      : -beta * C * r.t
                assert.ok(
                  Math.abs(r.x - expected) < 1e-8,
                  'worldline position agrees to better than 10 nm',
                )
              }
          }
        }
})
test('a moving platform midpoint receives simultaneous platform strikes together', () => {
  for (const beta of [-0.9, -0.4, 0, 0.6, 0.9]) {
    const m = snapshot({ ...DEFAULT, beta }, 'anden')
    close(m.arrivalGap, 0)
    close(m.pulses[0].arrival.t, DEFAULT.length / (2 * C * gamma(beta)))
  }
})
test('offset changes signal delays but never changes source dates or spacetime events', () => {
  const a = { ...DEFAULT, beta: 0, sync: 'tren', offset: 0 },
    b = { ...a, offset: 0.25 }
  const ma = snapshot(a, 'tren'),
    mb = snapshot(b, 'tren')
  close(ma.arrivalGap, 0)
  close(mb.arrivalGap, (-0.5 * DEFAULT.length) / C)
  assert.deepEqual(
    signals(a).map((p) => p.emission),
    signals(b).map((p) => p.emission),
  )
  close(mb.emissionGap, 0)
})
test('reversing velocity reverses spacelike emission order without changing interval or length', () => {
  const a = snapshot({ ...DEFAULT, beta: 0.6 }, 'tren'),
    b = snapshot({ ...DEFAULT, beta: -0.6 }, 'tren')
  close(a.emissionGap, -b.emissionGap)
  const interval = (m) =>
    (C * m.emissionGap) ** 2 -
    (m.pulses[1].emission.x - m.pulses[0].emission.x) ** 2
  assert.ok(interval(a) < 0)
  close(interval(a), interval(b))
  close(
    snapshot({ ...DEFAULT, beta: 0.6 }, 'anden').length,
    snapshot({ ...DEFAULT, beta: -0.6 }, 'anden').length,
  )
})
test('simultaneous endpoint protocol independently recovers L0/gamma at any recorded time', () => {
  for (const beta of [-0.9, 0, 0.8, 0.9])
    for (const time of [MIN_TIME, 0, MAX_TIME])
      for (const frame of ['anden', 'tren']) {
        const s = { ...DEFAULT, beta, time },
          m = measurement(s, frame)
        assert.equal(m.valid, true)
        close(m.deltaT, 0, 1e-7)
        close(
          m.distance,
          frame === 'anden' ? s.length * Math.sqrt(1 - beta * beta) : s.length,
        )
        for (const [i, event] of m.events.entries()) {
          const atTime = snapshot({ ...s, time }, frame)
          close(
            event.x,
            frame === 'anden'
              ? beta * C * event.t + ((i === 0 ? -1 : 1) * atTime.length) / 2
              : ((i === 0 ? -1 : 1) * s.length) / 2,
            1e-8,
          )
        }
      }
})
test('train-simultaneous endpoints are not a platform length: 500 m and 1.334 us at 0.8c', () => {
  const m = measurement(
    { ...DEFAULT, beta: 0.8, protocol: 'tren', time: 0 },
    'anden',
  )
  close(m.distance, 500)
  close(m.deltaT, 400 / C)
  assert.equal(m.valid, false)
  close(m.expected, 180)
  assert.equal(
    measurement({ ...DEFAULT, beta: 0.8, protocol: 'tren' }, 'tren').valid,
    true,
  )
})
test('status never receives a signal before emission; all rest receivers have received by the supported end', () => {
  for (const beta of [-0.9, 0, 0.9])
    for (const sync of ['anden', 'tren'])
      for (const offset of [-0.3, 0, 0.3])
        for (const frame of ['anden', 'tren']) {
          const setup = { ...DEFAULT, beta, sync, offset }
          for (const p of snapshot({ ...setup, time: MIN_TIME }, frame).pulses)
            assert.equal(p.emitted, false)
          for (const p of snapshot({ ...setup, time: MAX_TIME }, frame).pulses)
            assert.equal(p.received, true)
          for (const time of [-0.3, 0, 0.25, 0.8])
            for (const p of snapshot({ ...setup, time }, frame).pulses)
              if (p.received) assert.equal(p.emitted, true)
        }
})
test('photon coordinate speed remains c in each system', () => {
  for (const beta of [-0.9, 0, 0.9])
    for (const frame of ['anden', 'tren']) {
      const a = snapshot({ ...DEFAULT, beta, time: 0.3 }, frame),
        b = snapshot({ ...DEFAULT, beta, time: 0.4 }, frame)
      for (let i = 0; i < 2; i++)
        close(Math.abs((b.pulses[i].x - a.pulses[i].x) / (b.time - a.time)), C)
    }
})
test('four lessons require their observations and a correct prediction', () => {
  const solutions = [
    finish,
    (s) => finish(tune(finish(s), { offset: 0.25 })),
    (s) => finish(tune(finish(s), { beta: -0.6 })),
    (s) =>
      reducer(tune(reducer(s, { type: 'measure' }), { protocol: 'tren' }), {
        type: 'measure',
      }),
  ]
  const answers = [1, 2, 0, 1]
  let completed = []
  for (let index = 0; index < 4; index++) {
    let s = initialState(index, completed)
    assert.equal(observed(s), false)
    s = solutions[index](s)
    assert.equal(observed(s), true)
    assert.match(reducer(s, { type: 'check' }).feedback, /Elegí/)
    s = reducer(s, { type: 'predict', choice: (answers[index] + 1) % 3 })
    assert.match(reducer(s, { type: 'check' }).feedback, /Revisá/)
    s = reducer(s, { type: 'predict', choice: answers[index] })
    s = reducer(s, { type: 'check' })
    assert.match(s.feedback, /¡Descubrimiento completo!/)
    completed = s.completed
  }
  assert.deepEqual(completed, [0, 1, 2, 3])
})
test('incomplete, confounded or unrecorded comparisons do not finish a lesson', () => {
  assert.equal(
    observed(reducer(initialState(0), { type: 'time', value: 0 })),
    false,
  )
  assert.equal(observed(finish(tune(initialState(0), { sync: 'tren' }))), false)
  assert.equal(
    observed(
      finish(tune(finish(initialState(1)), { beta: 0.6, offset: 0.25 })),
    ),
    false,
  )
  assert.equal(observed(finish(initialState(3))), false)
  assert.equal(
    observed(
      reducer(tune(initialState(3), { length: 400 }), { type: 'measure' }),
    ),
    false,
  )
})
test('measurements own their trial, survive playback and clear when conditions change', () => {
  const a = reducer(initialState(3), { type: 'measure' }),
    sample = { ...a.sample }
  const b = finish(a)
  assert.deepEqual(b.sample, sample)
  assert.equal(a.setup.time, 0)
  const c = tune(b, { beta: -0.6 })
  assert.equal(c.sample, null)
  assert.equal(c.setup.time, MIN_TIME)
  assert.equal(c.playing, false)
  assert.deepEqual(a.sample, sample)
})
test('changing only the endpoint protocol keeps the current time and clears the old record', () => {
  const a = reducer(initialState(3), { type: 'measure' })
  const b = tune(a, { protocol: 'tren' })
  assert.equal(b.setup.time, a.setup.time)
  assert.equal(b.sample, null)
  assert.equal(b.playing, false)
})
test('playback pauses, clamps large deltas, stops and restarts from the beginning', () => {
  let s = initialState()
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 1 }), s)
  s = reducer(s, { type: 'play' })
  close(
    reducer(s, { type: 'tick', seconds: 100 }).setup.time,
    reducer(s, { type: 'tick', seconds: 0.1 }).setup.time,
  )
  for (let i = 0; i < 500; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.time, MAX_TIME)
  assert.equal(s.playing, false)
  s = reducer(s, { type: 'play' })
  assert.equal(s.setup.time, MIN_TIME)
  s = reducer(s, { type: 'play' })
  assert.equal(s.playing, false)
})
test('invalid inputs fail explicitly without poisoning UI state', () => {
  for (const patch of [
    { beta: NaN },
    { length: Infinity },
    { offset: 0.31 },
    { beta: 1 },
    { time: NaN },
    { sync: 'earth' },
    { protocol: 'photo' },
  ])
    assert.throws(() => snapshot({ ...DEFAULT, ...patch }, 'anden'), RangeError)
  const s = initialState()
  for (const patch of [
    { beta: NaN },
    { length: 0 },
    { offset: Infinity },
    { protocol: 'bad' },
  ])
    assert.strictEqual(tune(s, patch), s)
  assert.strictEqual(reducer(s, { type: 'time', value: NaN }), s)
  assert.throws(() => snapshot(DEFAULT, 'earth'), RangeError)
})
test('Einstein series has six canonical available chapters and all entries exist', () => {
  assert.deepEqual(
    einsteinLabs.map((l) => l.id),
    [
      'reloj-de-luz',
      'tren-de-einstein',
      'nos-vemos-a-la-vuelta',
      'ascensor-de-einstein',
      'el-tiempo-tiene-altura',
      'orbita-que-no-se-cierra',
    ],
  )
  for (const lab of einsteinLabs)
    assert.ok(existsSync(new URL(`..${lab.href}index.html`, import.meta.url)))
})
