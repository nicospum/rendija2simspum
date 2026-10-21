import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  C,
  MIRROR_DISTANCE,
  OWN_PERIOD,
  MAX_BETA,
  HALF_RATE_BETA,
  gamma,
  boost,
  photonEvent,
  snapshot,
} from '../src/reloj/physics.ts'
import { initialState, reducer, observed } from '../src/reloj/learning.ts'
import { experiments } from '../src/portal/catalog.ts'

const close = (a, b, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(a - b) <= tolerance * Math.max(Math.abs(a), Math.abs(b), 1e-15),
    `${a} != ${b}`,
  )
const tune = (s, beta) => reducer(s, { type: 'beta', value: beta })
const finish = (s) => reducer(s, { type: 'fraction', value: 1 })

test('SI light-clock benchmark and independent half-rate solution', () => {
  assert.equal(C, 299792458)
  close(OWN_PERIOD, 300 / 299792458)
  close(gamma(0.6), 1.25)
  close(gamma(0.8), 5 / 3)
  close(gamma(HALF_RATE_BETA), 2)
  close(1 / gamma(HALF_RATE_BETA), 0.5)
})
test('each half path has null spacetime separation in both systems over the control range', () => {
  for (let beta = 0; beta <= MAX_BETA; beta += 0.005)
    for (const follow of ['nave', 'estacion'])
      for (const frame of ['nave', 'estacion']) {
        const m = snapshot({ beta, fraction: 0.37, follow }, frame)
        for (let i = 0; i < 2; i++) {
          const a = m.events[i],
            b = m.events[i + 1]
          close(C * (b.t - a.t), Math.hypot(b.x - a.x, b.y - a.y), 1e-10)
        }
        close(Math.hypot(m.vx, m.vy), C)
        close(m.events[1].y, MIRROR_DISTANCE)
      }
})
test('Lorentz inverse and timelike invariant recover a general event, independently of the drawing', () => {
  for (const beta of [-0.95, -0.6, 0, 0.8, 0.95]) {
    const e = { t: 0.000002, x: 57, y: 82 },
      b = boost(e, beta),
      r = boost(b, -beta)
    close(e.t, r.t)
    close(e.x, r.x)
    close(e.y, r.y)
    close(
      C * C * e.t * e.t - e.x * e.x - e.y * e.y,
      C * C * b.t * b.t - b.x * b.x - b.y * b.y,
    )
  }
})
test('the same tracked pulse event has the proper and assigned times in its two panels', () => {
  for (const beta of [0, 0.6, 0.8, HALF_RATE_BETA, 0.95])
    for (const fraction of [0, 0.1, 0.5, 0.8, 1]) {
      const setup = { beta, fraction, follow: 'nave' },
        rest = snapshot(setup, 'nave'),
        moving = snapshot(setup, 'estacion')
      close(moving.point.t, gamma(beta) * rest.point.t)
      close(moving.point.x, beta * C * moving.point.t)
      close(moving.point.y, rest.point.y)
      close(moving.pathLength / C, moving.period)
      close(
        Math.sqrt((C * moving.events[2].t) ** 2 - moving.events[2].x ** 2) / C,
        OWN_PERIOD,
      )
    }
})
test('reciprocal experiment swaps the clock, reverses motion and keeps the same time ratio', () => {
  const a = snapshot({ beta: 0.8, fraction: 1, follow: 'nave' }, 'estacion')
  const b = snapshot({ beta: 0.8, fraction: 1, follow: 'estacion' }, 'nave')
  close(a.point.x, -b.point.x)
  close(a.point.t, b.point.t)
  close(a.ownTime, b.ownTime)
  assert.equal(
    snapshot({ beta: 0.8, fraction: 1, follow: 'estacion' }, 'estacion').moving,
    false,
  )
})
test('reflection is not counted as another tick; only return to the emitter is a tick', () => {
  for (const fraction of [0, 0.499, 0.5, 0.999, 1]) {
    const m = snapshot({ beta: 0.8, fraction, follow: 'nave' }, 'estacion')
    assert.equal(m.ticks, fraction === 1 ? 1 : 0)
  }
  close(photonEvent(0).y, 0)
  close(photonEvent(0.5).y, 150)
  close(photonEvent(1).y, 0)
})
test('invalid speeds, frames, events and progress cannot leak nonfinite physical results', () => {
  for (const beta of [NaN, Infinity, -Infinity, 1, -1, 2])
    assert.throws(() => gamma(beta), RangeError)
  for (const patch of [
    { beta: NaN },
    { beta: -0.1 },
    { beta: 0.951 },
    { fraction: Infinity },
    { fraction: -0.1 },
    { fraction: 1.01 },
    { follow: 'earth' },
  ])
    assert.throws(
      () =>
        snapshot(
          { beta: 0.6, fraction: 0.5, follow: 'nave', ...patch },
          'nave',
        ),
      RangeError,
    )
  assert.throws(() => photonEvent(NaN), RangeError)
  assert.throws(() => boost({ t: Infinity, x: 0, y: 0 }, 0.6), RangeError)
})
test('four challenges require the intended comparisons, prediction and explanation', () => {
  const solutions = [
    (s) => finish(tune(s, 0)),
    (s) => finish(tune(finish(tune(s, 0.6)), 0.8)),
    (s) => finish(reducer(finish(s), { type: 'follow', frame: 'estacion' })),
    (s) => finish(tune(s, HALF_RATE_BETA)),
  ]
  const answers = [0, 1, 2, 0]
  let completed = []
  for (let index = 0; index < 4; index++) {
    let s = initialState(index, completed)
    assert.equal(observed(s), false)
    assert.equal(reducer(s, { type: 'check' }).completed.length, index)
    s = solutions[index](s)
    assert.equal(observed(s), true)
    assert.match(reducer(s, { type: 'check' }).feedback, /Elegí primero/)
    s = reducer(s, { type: 'predict', choice: (answers[index] + 1) % 3 })
    assert.match(reducer(s, { type: 'check' }).feedback, /Revisá/)
    s = reducer(s, { type: 'predict', choice: answers[index] })
    s = reducer(s, { type: 'check' })
    assert.match(s.feedback, /¡Descubrimiento completo!/)
    completed = s.completed
  }
  assert.deepEqual(completed, [0, 1, 2, 3])
})
test('wrong frames, partial paths and unsuitable speeds cannot satisfy a challenge', () => {
  assert.equal(
    observed(reducer(initialState(0), { type: 'fraction', value: 0.5 })),
    false,
  )
  assert.equal(observed(finish(tune(initialState(3), 0.5))), false)
  let s = reducer(initialState(1), { type: 'follow', frame: 'estacion' })
  s = finish(tune(finish(tune(s, 0.6)), 0.8))
  assert.equal(observed(s), false)
  assert.equal(observed(finish(initialState(2))), false)
})
test('changing velocity or tracked clock restarts the trial and preserves completed comparisons', () => {
  let s = finish(tune(initialState(0), 0))
  s = reducer(s, { type: 'predict', choice: 0 })
  s = reducer(s, { type: 'check' })
  const changed = tune(s, 0.8)
  assert.equal(changed.setup.fraction, 0)
  assert.equal(changed.playing, false)
  assert.deepEqual(changed.completed, [0])
  assert.deepEqual(s.setup, { beta: 0, fraction: 1, follow: 'nave' })
  assert.deepEqual(reducer(changed, { type: 'lesson', index: 1 }).completed, [
    0,
  ])
  assert.equal(
    reducer(s, { type: 'follow', frame: 'estacion' }).setup.fraction,
    0,
  )
})
test('play, pause, bounded deltas and replay preserve the same analytic trajectory', () => {
  let s = initialState()
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 0.1 }), s)
  s = reducer(s, { type: 'play' })
  const a = reducer(s, { type: 'tick', seconds: 1000 })
  const b = reducer(s, { type: 'tick', seconds: 0.1 })
  close(a.setup.fraction, b.setup.fraction)
  s = reducer(s, { type: 'play' })
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 0.1 }), s)
  s = reducer(finish(s), { type: 'play' })
  assert.equal(s.setup.fraction, 0)
  assert.equal(s.playing, true)
  for (let i = 0; i < 1000; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.fraction, 1)
  assert.equal(s.playing, false)
})
test('unsupported actions preserve state while finite range input is safely bounded', () => {
  const s = initialState()
  for (const action of [
    { type: 'beta', value: NaN },
    { type: 'fraction', value: NaN },
    { type: 'predict', choice: 7 },
    { type: 'lesson', index: -1 },
    { type: 'tick', seconds: NaN },
  ])
    assert.strictEqual(reducer(s, action), s)
  assert.equal(tune(s, 10).setup.beta, MAX_BETA)
  assert.equal(reducer(s, { type: 'fraction', value: 10 }).setup.fraction, 1)
})
test('the new laboratory has one canonical catalog entry and both MPA entries exist', () => {
  const labs = experiments.filter((e) => e.id === 'reloj-de-luz')
  assert.equal(labs.length, 1)
  assert.equal(labs[0].href, '/reloj-de-luz/')
  for (const entry of ['../reloj-de-luz/index.html', '../einstein/index.html'])
    assert.ok(existsSync(new URL(entry, import.meta.url)))
})
