import test from 'node:test'
import assert from 'node:assert/strict'
import {
  C,
  DEFAULT,
  HEIGHT,
  field,
  light,
  snapshot,
  validate,
} from '../src/ascensor/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/ascensor/learning.ts'
const close = (a, b, tol = 1e-10) =>
  assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`)
const tune = (s, patch) => reducer(s, { type: 'tune', patch })
const finish = (s) => reducer(s, { type: 'time', value: 1 })
test('supported lab and accelerating rocket have equal internal motion and support force', () => {
  for (let i = 0; i <= 20; i++) {
    const s = { ...DEFAULT, progress: i / 20 },
      a = snapshot(s),
      b = snapshot({ ...s, scenario: 'cohete' })
    close(a.ballY, b.ballY)
    close(a.normal, b.normal)
    close(a.proper, b.proper)
    close(a.t, b.t)
    close(a.normal, 19.62)
    close(a.g, 9.81)
    close(b.g, 0)
  }
})
test('free fall retains gravity but removes normal force and relative acceleration', () => {
  const s = { ...DEFAULT, scenario: 'caida', progress: 1 },
    m = snapshot(s)
  close(m.g, 9.81)
  close(m.gravityForce, 19.62)
  close(m.normal, 0)
  close(m.proper, 0)
  close(m.ballY, HEIGHT)
  close(m.cabinY, -0.5 * 9.81 * m.t * m.t)
  close(m.ballWorldY, HEIGHT - 0.5 * 9.81 * m.t * m.t)
  assert.equal(m.contact, false)
  assert.equal(m.hitTime, null)
})
test('free fall and inertial drift share local outcomes while exterior displacements differ', () => {
  const a = snapshot({ ...DEFAULT, scenario: 'caida', progress: 1 }),
    b = snapshot({ ...DEFAULT, scenario: 'deriva', progress: 1 })
  close(a.ballY, b.ballY)
  close(a.normal, b.normal)
  close(a.light.drop, b.light.drop)
  assert.notEqual(a.cabinY, b.cabinY)
  close(b.g, 0)
  close(b.cabinAcceleration, 0)
})
test('mass quadruples scale reading but leaves fall height and contact time unchanged', () => {
  for (const scenario of ['suelo', 'caida', 'cohete', 'deriva']) {
    const a = snapshot({ ...DEFAULT, scenario, mass: 1, progress: 0.5 }),
      b = snapshot({ ...DEFAULT, scenario, mass: 4, progress: 0.5 })
    close(b.normal, 4 * a.normal)
    close(a.ballY, b.ballY)
    assert.equal(a.hitTime, b.hitTime)
  }
})
test('ball reaches floor at independent analytic fall time and stays on it', () => {
  const s = { ...DEFAULT },
    t = Math.sqrt((2 * HEIGHT) / 9.81),
    d = snapshot(s).duration
  const a = snapshot({ ...s, progress: t / d }),
    b = snapshot({ ...s, progress: 1 })
  close(a.ballY, 0)
  assert.equal(b.contact, true)
  close(b.ballY, 0)
  close(b.ballWorldY, b.cabinY)
})
test('rocket ball is inertial before contact while its floor catches up', () => {
  const m = snapshot({ ...DEFAULT, scenario: 'cohete', progress: 0.5 })
  close(m.ballWorldY, HEIGHT)
  assert.ok(m.cabinY > 0)
  assert.ok(m.ballY < HEIGHT)
})
test('local Rindler deflection matches independent weak-field SI benchmark', () => {
  const p = light({ ...DEFAULT, scenario: 'cohete', progress: 1 })
  const independent = (9.81 * 3 ** 2) / (2 * 299792458 ** 2)
  close(p.drop, independent, 1e-28)
  close(p.drop * 1e15, 0.4911793672448698, 1e-12)
  close(p.emitterTime * 1e9, (3 / 299792458) * 1e9, 1e-12)
  close(p.labTime, 3 / C, 1e-20)
  assert.ok(
    p.drop > 0,
    'small deflection must not vanish by floating-point cancellation',
  )
})
test('light curvature integral independently recovers the calculated local height', () => {
  const s = {
      ...DEFAULT,
      scenario: 'cohete',
      strength: 20,
      width: 6,
      progress: 1,
    },
    steps = 2000,
    dx = s.width / steps
  let integral = 0
  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) * dx
    integral +=
      ((-20 * x) / C ** 2 / Math.sqrt(1 - ((20 * x) / C ** 2) ** 2)) * dx
  }
  close(light(s).insideY, integral, 1e-25)
})
test('doubling width quadruples deflection and doubling acceleration doubles it', () => {
  const s = { ...DEFAULT, scenario: 'cohete', width: 2, progress: 1 },
    a = light(s),
    b = light({ ...s, width: 4 }),
    d = light({ ...s, strength: 19.62 })
  close(b.drop / a.drop, 4)
  close(d.drop / a.drop, 2)
  close(b.labTime / a.labTime, 2)
})
test('free light is straight in its own local frame for fall and drift', () => {
  for (const scenario of ['caida', 'deriva'])
    for (const progress of [0, 0.2, 1]) {
      const p = light({ ...DEFAULT, scenario, instrument: 'luz', progress })
      close(p.insideY, 0)
      close(p.cabinY, 0)
      close(p.labY, 0)
    }
})
test('light event and accelerated cabin are physically separated in the free frame', () => {
  const p = light({ ...DEFAULT, scenario: 'cohete', progress: 1 })
  close(p.x, C * p.labTime)
  close(p.labY, 0)
  assert.ok(p.cabinY > 0)
  close(p.cabinY, p.drop, 1e-28)
})
test('all allowed control extremes remain finite, bounded and maintain frame consistency', () => {
  for (const scenario of ['suelo', 'caida', 'cohete', 'deriva'])
    for (const strength of [1, 9.81, 20])
      for (const mass of [0.2, 5])
        for (const width of [1, 6])
          for (let i = 0; i <= 20; i++) {
            const m = snapshot({
              ...DEFAULT,
              scenario,
              strength,
              mass,
              width,
              progress: i / 20,
            })
            for (const v of [
              ...Object.values(m),
              ...Object.values(m.light),
            ].filter((v) => typeof v === 'number'))
              assert.ok(Number.isFinite(v))
            assert.ok(m.ballY >= 0 && m.ballY <= HEIGHT)
            assert.ok(m.normal >= 0)
            close(m.ballWorldY - m.cabinY, m.ballY)
          }
})
test('invalid and inherited scenario names and nonfinite quantities fail explicitly', () => {
  for (const patch of [
    { scenario: 'toString' },
    { scenario: 'constructor' },
    { strength: 0 },
    { strength: NaN },
    { mass: Infinity },
    { progress: 2 },
    { width: 0 },
    { instrument: 'fake' },
    { zoom: 'yes' },
  ])
    assert.throws(() => validate({ ...DEFAULT, ...patch }), RangeError)
  assert.throws(() => light(DEFAULT, Infinity), RangeError)
  const s = initialState()
  assert.strictEqual(tune(s, { mass: NaN }), s)
  assert.strictEqual(reducer(s, { type: 'time', value: Infinity }), s)
})
test('all four lessons require intended observations and a correct prediction', () => {
  for (let i = 0; i < 4; i++) {
    let s = reducer(initialState(i), {
      type: 'predict',
      choice: LESSONS[i].answer,
    })
    assert.equal(reducer(s, { type: 'check' }).completed.length, 0)
    if (i === 0) {
      s = finish(s)
      s = finish(tune(s, { scenario: 'cohete' }))
    }
    if (i === 1) {
      s = finish(s)
      s = finish(tune(s, { scenario: 'caida' }))
      s = finish(tune(s, { scenario: 'deriva' }))
    }
    if (i === 2) {
      s = finish(s)
      s = finish(tune(s, { mass: 4 }))
    }
    if (i === 3) {
      s = finish(s)
      s = finish(tune(s, { scenario: 'caida' }))
    }
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
test('wrong intensity, unfinished trials or unamplified light do not satisfy comparisons', () => {
  let s = tune(initialState(), { strength: 10 })
  s = finish(s)
  assert.deepEqual(s.marks, [])
  s = initialState(3)
  s = tune(s, { zoom: false })
  s = finish(s)
  assert.deepEqual(s.marks, [])
  s = reducer(initialState(), { type: 'time', value: 0.5 })
  assert.deepEqual(s.marks, [])
})
test('zoom preserves physical event while trial changes restart and pause', () => {
  const s = finish(initialState(3)),
    z = tune(s, { zoom: false })
  assert.equal(z.setup.progress, 1)
  assert.deepEqual(light(s.setup), light(z.setup))
  assert.equal(z.playing, false)
  const changed = tune(z, { scenario: 'caida' })
  assert.equal(changed.setup.progress, 0)
})
test('lesson reset preserves achievements without sharing configurations', () => {
  const a = initialState(),
    b = initialState()
  a.setup.mass = 4
  assert.equal(b.setup.mass, 2)
  let s = finish(initialState())
  s = finish(tune(s, { scenario: 'cohete' }))
  s = reducer(s, { type: 'predict', choice: 1 })
  s = reducer(s, { type: 'check' })
  s = reducer(s, { type: 'lesson', index: 1 })
  assert.deepEqual(s.completed, [0])
  assert.equal(s.prediction, null)
  assert.deepEqual(s.marks, [])
})
test('playback is bounded, pauses, ends exactly and restarts for another trial', () => {
  let s = reducer(initialState(), { type: 'play' })
  s = reducer(s, { type: 'tick', seconds: 100 })
  close(s.setup.progress, 0.016)
  s = reducer(s, { type: 'play' })
  assert.strictEqual(reducer(s, { type: 'tick', seconds: 1 }), s)
  s = reducer(finish(s), { type: 'play' })
  assert.equal(s.setup.progress, 0)
  for (let i = 0; i < 70; i++) s = reducer(s, { type: 'tick', seconds: 0.1 })
  assert.equal(s.setup.progress, 1)
  assert.equal(s.playing, false)
})
