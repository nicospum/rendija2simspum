import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ALPHA,
  BELL_ANGLES,
  PAIRS,
  card,
  interval,
  localProbabilities,
  probabilities,
  quantum,
  randomFromSeed,
  sample,
  sampleLot,
  stats,
  sweep,
  validateAngles,
} from '../src/bell/physics.ts'
import { initialState, LESSONS, observations, reducer } from '../src/bell/learning.ts'

const near = (actual, expected, tolerance = 1e-12) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} != ${expected}`,
  )
const rad = (degrees) => (degrees * Math.PI) / 180

// Independent two-component basis projection; never calls cos(2(a-b)).
function born(aDegrees, bDegrees) {
  const basis = (degrees) => {
    const angle = rad(degrees)
    return [
      [Math.cos(angle), Math.sin(angle)],
      [-Math.sin(angle), Math.cos(angle)],
    ]
  }
  const left = basis(aDegrees),
    right = basis(bDegrees)
  return left.flatMap((a) =>
    right.map((b) => ((a[0] * b[0] + a[1] * b[1]) / Math.sqrt(2)) ** 2),
  )
}
const correlation = (p) => p[0] - p[1] - p[2] + p[3]
const score = (es) => es[0] + es[1] + es[2] - es[3]
const tune = (state, index, value) => reducer(state, { type: 'angle', index, value })
const predict = (state, choice) => reducer(state, { type: 'predict', choice })
const check = (state) => reducer(state, { type: 'check' })

test('Born basis projections independently reproduce joint probabilities at 169 orientation pairs', () => {
  for (let a = -90; a <= 90; a += 15)
    for (let b = -90; b <= 90; b += 15) {
      const expected = born(a, b),
        actual = probabilities(a, b)
      actual.forEach((value, i) => near(value, expected[i]))
      near(
        actual.reduce((sum, value) => sum + value, 0),
        1,
      )
      assert.ok(actual.every((p) => p >= 0 && p <= 1))
    }
})
test('local marginals stay one half when either remote orientation changes', () => {
  for (let a = -90; a <= 90; a += 15)
    for (let b = -90; b <= 90; b += 15) {
      const p = probabilities(a, b)
      near(p[0] + p[1], 0.5)
      near(p[0] + p[2], 0.5)
      near(correlation(p), correlation(born(a, b)))
    }
})
test('polarization has 180 degree periodicity and separates aligned, diagonal and orthogonal axes', () => {
  assert.deepEqual(probabilities(0, 0), [0.5, 0, 0, 0.5])
  probabilities(0, 45).forEach((value) => near(value, 0.25))
  const opposite = probabilities(0, 90)
  near(opposite[0] + opposite[3], 0)
  near(opposite[1] + opposite[2], 1)
  for (const a of [-75, -12.5, 0, 22.5, 89])
    for (const b of [-90, 0, 45]) {
      const original = probabilities(a, b)
      probabilities(a + 180, b).forEach((value, i) => near(value, original[i]))
      probabilities(a, b - 180).forEach((value, i) => near(value, original[i]))
    }
})
test('canonical four-setting score agrees with vector Born calculation and 2sqrt2', () => {
  const expected = [
    [0, 22.5],
    [0, -22.5],
    [45, 22.5],
    [45, -22.5],
  ].map(([a, b]) => correlation(born(a, b)))
  const actual = quantum(BELL_ANGLES)
  actual.correlations.forEach((value, i) => near(value, expected[i]))
  near(actual.S, score(expected))
  near(actual.S, 2 * Math.sqrt(2))
  near(quantum([0, 0, 0, 0]).S, 2)
  near(quantum([90, 90, -90, -90]).S, 2)
})
test('all 16 local deterministic cards obey the elementary cancellation proof', () => {
  const unique = new Set(),
    scores = []
  for (let i = 0; i < 16; i++) {
    const c = card(i),
      [a0, a1, b0, b1] = c.answers
    unique.add(c.answers.join(','))
    assert.ok(c.answers.every((value) => value === 1 || value === -1))
    const products = [a0 * b0, a0 * b1, a1 * b0, a1 * b1]
    assert.deepEqual(c.correlations, products)
    assert.deepEqual(c.brackets, [b0 + b1, b0 - b1])
    assert.equal(c.S, a0 * (b0 + b1) + a1 * (b0 - b1))
    assert.equal(Math.abs(c.S), 2)
    assert.equal(Number(c.brackets[0] === 0) + Number(c.brackets[1] === 0), 1)
    scores.push(c.S)
  }
  assert.equal(unique.size, 16)
  assert.equal(scores.filter((value) => value === 2).length, 8)
  assert.equal(scores.filter((value) => value === -2).length, 8)
  assert.equal(card(15).S, 2)
  assert.equal(card(14).S, -2)
})
test('global complement preserves products and balanced local mixtures reproduce random marginals', () => {
  for (let index = 0; index < 16; index++) {
    const c = card(index),
      complement = card(15 - index)
    assert.deepEqual(
      complement.answers,
      c.answers.map((value) => -value),
    )
    assert.deepEqual(complement.correlations, c.correlations)
    for (let pair = 0; pair < 4; pair++) {
      const p = localProbabilities(index, pair)
      near(
        p.reduce((a, b) => a + b, 0),
        1,
      )
      near(p[0] + p[1], 0.5)
      near(p[0] + p[2], 0.5)
      near(correlation(p), c.correlations[pair])
    }
  }
})
test('convex mixtures of all local strategies remain inside the local score interval', () => {
  const weights = Array.from({ length: 16 }, (_, i) => i + 1),
    total = weights.reduce((a, b) => a + b)
  const es = [0, 1, 2, 3].map((pair) =>
    weights.reduce(
      (sum, weight, index) =>
        sum + (weight * correlation(localProbabilities(index, pair))) / total,
      0,
    ),
  )
  assert.ok(Math.abs(score(es)) <= 2 + 1e-12)
  near(
    score(es),
    weights.reduce((sum, weight, index) => sum + (weight * card(index).S) / total, 0),
  )
})
test('counts use every result and distinguish no data from zero correlation', () => {
  assert.deepEqual(stats([0, 0, 0, 0]), {
    N: 0,
    same: 0,
    different: 0,
    E: null,
    aPlus: null,
    bPlus: null,
  })
  assert.deepEqual(stats([40, 10, 20, 30]), {
    N: 100,
    same: 70,
    different: 30,
    E: 0.4,
    aPlus: 0.5,
    bPlus: 0.6,
  })
  assert.equal(stats([10, 10, 10, 10]).E, 0)
})
test('seeded sampling is reproducible, keeps all pairs and returns an actually sampled last event', () => {
  for (const seed of [0, 1, 77, 4294967295]) {
    const lot = sampleLot(0, 22.5, 200, seed)
    assert.deepEqual(sample(0, 22.5, 200, seed), lot.counts)
    assert.equal(
      lot.counts.reduce((a, b) => a + b, 0),
      200,
    )
    assert.ok(lot.last >= 0 && lot.last <= 3 && lot.counts[lot.last] >= 1)
    const rng = randomFromSeed(seed)
    let lastUniform = 0
    for (let i = 0; i < 200; i++) lastUniform = rng()
    const p = born(0, 22.5)
    const thresholds = p.map((_, i) => p.slice(0, i + 1).reduce((a, b) => a + b, 0))
    assert.equal(lot.last, thresholds.findIndex(value => lastUniform < value))
    const same = sample(0, 0, 4096, seed),
      opposite = sample(0, 90, 4096, seed)
    assert.equal(same[1] + same[2], 0)
    assert.equal(opposite[0] + opposite[3], 0)
  }
})
test('a deterministic Monte Carlo sample approximates independent vector Born probabilities', () => {
  const counts = [0, 0, 0, 0],
    expected = born(13, 47)
  for (let seed = 0; seed < 16; seed++)
    sample(13, 47, 1024, seed).forEach((value, i) => {
      counts[i] += value
    })
  assert.equal(
    counts.reduce((a, b) => a + b),
    16384,
  )
  counts.forEach((value, i) => near(value / 16384, expected[i], 0.015))
})
test('each sweep owns four fresh fixed-size batches and an immutable orientation snapshot', () => {
  const angles = [...BELL_ANGLES],
    small = sweep(angles, 50, 12),
    large = sweep(angles, 1000, 13)
  assert.deepEqual(PAIRS, [
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
  ])
  assert.equal(small.rows.length, 4)
  small.rows.forEach((row) => assert.equal(stats(row).N, 50))
  large.rows.forEach((row) => assert.equal(stats(row).N, 1000))
  angles[0] = 12
  assert.deepEqual(small.angles, BELL_ANGLES)
  assert.deepEqual(large.angles, BELL_ANGLES)
})
test('simultaneous Hoeffding interval agrees with an independent closed-form table', () => {
  const uniform = Array.from({ length: 4 }, () => [100, 100, 100, 100]),
    result = interval(uniform)
  const radius = Math.sqrt((-2 * Math.log(0.05 / 8)) / 400)
  assert.equal(result.alpha, ALPHA)
  near(result.estimate, 0)
  near(result.lower, -4 * radius)
  near(result.upper, 4 * radius)
  const perfect = [
      [400, 0, 0, 0],
      [400, 0, 0, 0],
      [400, 0, 0, 0],
      [0, 400, 0, 0],
    ],
    edge = interval(perfect)
  near(edge.estimate, 4)
  near(edge.upper, 4)
  near(edge.lower, 4 * (1 - radius))
})
test('fixed large batches have a narrower conservative interval than small batches without relying on a lucky crossing', () => {
  for (const seed of [0, 1, 41, 999]) {
    const small = interval(sweep(BELL_ANGLES, 50, seed).rows),
      large = interval(sweep(BELL_ANGLES, 1000, seed).rows)
    assert.ok(small.lower <= small.estimate && small.estimate <= small.upper)
    assert.ok(large.lower <= large.estimate && large.estimate <= large.upper)
    assert.ok(large.upper - large.lower < small.upper - small.lower)
    assert.ok(
      small.lower >= -4 && small.upper <= 4 && large.lower >= -4 && large.upper <= 4,
    )
  }
  assert.equal(
    interval([
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ]),
    null,
  )
})
test('a one-pair-per-setting apparent S=4 is not evidence that the local mean exceeds 2', () => {
  const result = interval([
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
  ])
  assert.equal(result.estimate, 4)
  assert.equal(result.lower, -4)
  assert.equal(result.upper, 4)
  assert.ok(result.lower <= 2 && result.upper >= 2)
})
test('invalid orientations, counts, batch sizes, cards, seeds and confidence levels fail explicitly', () => {
  for (const angles of [
    [0, 1, 2],
    [0, 1, 2, Infinity],
    [0, 1, 2, 90.01],
    [NaN, 0, 0, 0],
  ])
    assert.throws(() => validateAngles(angles), RangeError)
  for (const index of [-1, 16, 0.1, NaN]) assert.throws(() => card(index), RangeError)
  assert.throws(() => localProbabilities(0, 4), RangeError)
  for (const row of [
    [1, 2, 3],
    [0, -1, 0, 0],
    [0.5, 0, 0, 0],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0],
  ])
    assert.throws(() => stats(row), RangeError)
  for (const count of [0, 4097, 1.5, NaN])
    assert.throws(() => sample(0, 0, count, 0), RangeError)
  for (const seed of [-1, 4294967296, 0.1, Infinity])
    assert.throws(() => randomFromSeed(seed), RangeError)
  assert.throws(() => probabilities(NaN, 0), RangeError)
  assert.throws(() => sweep(BELL_ANGLES, 200, 0), RangeError)
  for (const alpha of [0, 1, -0.5, NaN])
    assert.throws(
      () =>
        interval(
          Array.from({ length: 4 }, () => [1, 1, 1, 1]),
          alpha,
        ),
      RangeError,
    )
  assert.throws(() => interval([]), RangeError)
})

function observe(index, initial = initialState(index)) {
  let s = initial
  if (index === 0 || index === 3) {
    s = reducer(s, { type: 'sample', size: 200, seed: 1 })
    s = tune(s, 2, index === 0 ? 45 : 90)
    return reducer(s, { type: 'sample', size: 200, seed: 2 })
  }
  if (index === 1) {
    s = reducer(s, { type: 'saveCard' })
    s = reducer(s, { type: 'card', index: 14 })
    return reducer(s, { type: 'saveCard' })
  }
  s = reducer(s, { type: 'sweep', n: 50, seed: 1 })
  return reducer(s, { type: 'sweep', n: 1000, seed: 2 })
}
for (let index = 0; index < 4; index++) {
  test(`challenge ${index + 1} needs its observations and explanation, and resets without historical auto-approval`, () => {
    const initial = initialState(index),
      correct = LESSONS[index].answer
    assert.equal(check(initial).verified, false)
    assert.equal(check(predict(initial, correct)).verified, false)
    assert.deepEqual(observations(initial), [false, false])
    let s = observe(index)
    assert.deepEqual(observations(s), [true, true])
    s = check(predict(s, (correct + 1) % 3))
    assert.equal(s.verified, false)
    assert.equal(s.completed.includes(index), false)
    s = check(predict(s, correct))
    assert.equal(s.verified, true)
    assert.ok(s.completed.includes(index))
    const restarted = reducer(s, { type: 'lesson', index })
    assert.equal(restarted.verified, false)
    assert.equal(restarted.prediction, null)
    assert.deepEqual(observations(restarted), [false, false])
    assert.deepEqual(restarted.completed, s.completed)
    assert.equal(check(predict(restarted, correct)).verified, false)
  })
}
test('each wrong explanation addresses its own misconception after all observations', () => {
  const topics = [
    [/no permite elegir la salida de A/, null, /no cuatro resultados simultáneos/],
    [/productos comparten/, /tarjeta concreta da \+2 o −2/, null],
    [null, /simulación usa probabilidades programadas/, /N es la cantidad de parejas/],
    [/ambos casos tiene probabilidad 50 %/, null, /necesita la lista de B/],
  ]
  const feedback = new Set()
  for (let index = 0; index < 4; index++) {
    const observed = observe(index)
    for (let choice = 0; choice < 3; choice++) {
      if (choice === LESSONS[index].answer) continue
      const result = check(predict(observed, choice))
      assert.equal(result.verified, false)
      assert.equal(result.completed.includes(index), false)
      assert.match(result.feedback, topics[index][choice])
      assert.deepEqual(observations(result), [true, true])
      feedback.add(result.feedback)
    }
  }
  assert.equal(feedback.size, 8)
})
test('incomplete comparisons name only missing observations and a relevant action', () => {
  for (let index = 0; index < 4; index++) {
    const correct = LESSONS[index].answer,
      empty = check(predict(initialState(index), correct)),
      action = index === 1 ? /Guardar tarjeta/ : index === 2 ? /Ángulos de Bell/ : /A₀B₀/
    for (const step of LESSONS[index].steps) assert.ok(empty.feedback.includes(step))
    assert.match(empty.feedback, action)
    assert.equal(empty.verified, false)
    let partial = initialState(index)
    partial = reducer(
      partial,
      index === 1
        ? { type: 'saveCard' }
        : index === 2
          ? { type: 'sweep', n: 50, seed: 1 }
          : { type: 'sample', size: 200, seed: 1 },
    )
    assert.deepEqual(observations(partial), [true, false])
    const result = check(predict(partial, correct)),
      mistaken = check(predict(partial, (correct + 1) % 3))
    assert.equal(result.verified, false)
    assert.ok(!result.feedback.includes(LESSONS[index].steps[0]))
    assert.ok(result.feedback.includes(LESSONS[index].steps[1]))
    assert.match(result.feedback, action)
    assert.equal(mistaken.feedback, result.feedback)
    assert.deepEqual(result.evidence, partial.evidence)
  }
})
test('selecting an unchanged angle or active pair preserves the full state by reference', () => {
  for (let index = 0; index < 4; index++) {
    const observed = observe(index),
      correct = LESSONS[index].answer
    for (const state of [
      check(predict(observed, correct)),
      check(predict(observed, (correct + 1) % 3)),
    ]) {
      for (let axis = 0; axis < 4; axis++)
        assert.equal(tune(state, axis, state.angles[axis]), state)
      assert.equal(reducer(state, { type: 'pair', pair: state.pair }), state)
    }
  }
})
test('repeating the active preset preserves data, while selecting pair zero or any changed angle prepares a new run', () => {
  const measured = reducer(initialState(), { type: 'sample', size: 200, seed: 11 }),
    explained = check(predict(observe(2), LESSONS[2].answer))
  for (const state of [measured, explained])
    assert.equal(reducer(state, { type: 'preset', angles: [...state.angles] }), state)

  let otherPair = reducer(measured, { type: 'pair', pair: 1 })
  otherPair = reducer(otherPair, { type: 'sample', size: 200, seed: 12 })
  assert.equal(otherPair.pair, 1)
  assert.equal(stats(otherPair.run.counts).N, 200)
  const selected = reducer(otherPair, { type: 'preset', angles: [...otherPair.angles] })
  assert.notEqual(selected, otherPair)
  assert.equal(selected.pair, 0)
  assert.equal(selected.run, null)
  assert.equal(selected.last, null)

  const tinyChange = [...measured.angles]
  tinyChange[0] += 1e-9
  const retuned = reducer(measured, { type: 'preset', angles: tinyChange })
  assert.notEqual(retuned, measured)
  assert.equal(retuned.angles[0], tinyChange[0])
  assert.equal(retuned.run, null)
  assert.equal(retuned.trial, null)
  assert.equal(retuned.last, null)
})
test('examining a local card outside challenge 2 does not claim an unrecorded observation', () => {
  for (const index of [0, 2, 3]) {
    for (const [cardIndex, expectedScore] of [
      [15, '+2'],
      [14, '-2'],
    ]) {
      const state = reducer(observe(index), { type: 'card', index: cardIndex }),
        result = reducer(state, { type: 'saveCard' })
      assert.equal(result.evidence, state.evidence)
      assert.deepEqual(observations(result), observations(state))
      assert.ok(result.feedback.includes(`S=${expectedScore}`))
      assert.match(result.feedback, /elegí el reto 2/)
      assert.doesNotMatch(result.feedback, /Tarjeta guardada/)
      assert.equal(result.verified, false)
    }
  }
})
test('saved pair comparisons describe their actual coincidences and sampled frequency', () => {
  const format = (value) =>
    value.toLocaleString('es-AR', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    })
  for (const index of [0, 3]) {
    for (const angle of [0, index === 0 ? 45 : 90]) {
      let state = tune(initialState(index), 2, angle)
      state = reducer(state, { type: 'sample', size: 200, seed: 37 })
      state = reducer(state, { type: 'sample', size: 1, seed: 9 })
      const [pp, pm, mp, mm] = state.run.counts,
        same = pp + mm,
        different = pm + mp,
        total = same + different,
        key = angle === 0 ? 'same' : index === 0 ? 'tilted' : 'opposite',
        text = state.evidence[key].text
      assert.equal(total, 201)
      assert.ok(text.includes(`${total} pares`))
      assert.ok(text.includes(`${same} iguales / ${different} distintos`))
      assert.ok(text.includes(`${format((same / total) * 100)} % iguales`))
      assert.ok(text.includes(`A+ ${format(((pp + pm) / total) * 100)} %`))
    }
  }
})
test('single, unrecorded, wrong-pair and near-but-different comparisons cannot satisfy the steps', () => {
  let s = initialState(0)
  s = tune(s, 2, 45)
  assert.deepEqual(observations(s), [false, false])
  s = reducer(s, { type: 'sample', size: 1, seed: 1 })
  assert.deepEqual(observations(s), [false, false])
  s = tune(initialState(0), 0, 0.1)
  s = reducer(s, { type: 'sample', size: 200, seed: 1 })
  assert.deepEqual(observations(s), [false, false])
  s = reducer(initialState(0), { type: 'pair', pair: 1 })
  s = reducer(s, { type: 'sample', size: 200, seed: 1 })
  assert.deepEqual(observations(s), [false, false])
  s = tune(initialState(2), 3, -22.4)
  s = reducer(s, { type: 'sweep', n: 50, seed: 1 })
  s = reducer(s, { type: 'sweep', n: 1000, seed: 2 })
  assert.deepEqual(observations(s), [false, false])
  assert.equal(check(predict(s, 0)).verified, false)
})
test('changing an orientation invalidates active data while saved comparison evidence retains its labelled setup', () => {
  let s = observe(0),
    evidence = structuredClone(s.evidence)
  s = reducer(s, { type: 'sweep', n: 50, seed: 5 })
  assert.ok(s.run && s.trial)
  const oldAngles = [...s.run.angles],
    oldTrial = [...s.trial.angles]
  s = tune(s, 2, 20)
  assert.equal(s.run, null)
  assert.equal(s.trial, null)
  assert.equal(s.last, null)
  assert.equal(s.verified, false)
  assert.deepEqual(s.evidence, evidence)
  assert.notDeepEqual(oldAngles, s.angles)
  assert.notDeepEqual(oldTrial, s.angles)
})
test('new 200-pair lots replace rather than accumulate and single-pair exploration never changes sweep rows', () => {
  let s = reducer(initialState(), { type: 'sample', size: 200, seed: 1 })
  s = reducer(s, { type: 'sample', size: 200, seed: 2 })
  assert.equal(stats(s.run.counts).N, 200)
  s = reducer(s, { type: 'sample', size: 1, seed: 3 })
  assert.equal(stats(s.run.counts).N, 201)
  s = reducer(s, { type: 'sweep', n: 50, seed: 4 })
  const trial = structuredClone(s.trial)
  s = reducer(s, { type: 'sample', size: 1, seed: 5 })
  assert.deepEqual(s.trial, trial)
  s = reducer(s, { type: 'sweep', n: 1000, seed: 6 })
  s.trial.rows.forEach((row) => assert.equal(stats(row).N, 1000))
})
test('both fixed-size CHSH comparisons retain their actual measured rows and interval after active trial replacement', () => {
  let s = reducer(initialState(2), { type: 'sweep', n: 50, seed: 17 })
  const small = structuredClone(s.trial),
    smallInterval = interval(s.trial.rows)
  s = reducer(s, { type: 'sweep', n: 1000, seed: 99 })
  assert.deepEqual(s.evidence.small.trial, small)
  assert.equal(s.evidence.small.trial.n, 50)
  assert.equal(s.evidence.large.trial.n, 1000)
  assert.deepEqual(interval(s.evidence.small.trial.rows), smallInterval)
  s = tune(s, 0, 1)
  assert.equal(s.trial, null)
  assert.deepEqual(s.evidence.small.trial, small)
  s.evidence.large.trial.rows.forEach((row) => assert.equal(stats(row).N, 1000))
})
test('invalid learning actions preserve the current state instead of poisoning observations', () => {
  const s = initialState()
  for (const action of [
    { type: 'angle', index: 4, value: 0 },
    { type: 'angle', index: 0, value: Infinity },
    { type: 'card', index: -1 },
    { type: 'pair', pair: 4 },
    { type: 'lesson', index: 4 },
    { type: 'predict', choice: 3 },
    { type: 'sample', size: 50, seed: 0 },
    { type: 'sample', size: 200, seed: -1 },
    { type: 'sweep', n: 200, seed: 0 },
  ])
    assert.equal(reducer(s, action), s)
  assert.throws(() => initialState(-1), RangeError)
})
