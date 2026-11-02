import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT,
  SPHERE_CIRCUMFERENCE,
  RADIUS,
  circumference,
  latitudeAtDistance,
  measure,
  snapshot,
} from '../src/eratostenes/physics.ts'
import {
  initialState,
  LESSONS,
  observations,
  reducer,
} from '../src/eratostenes/learning.ts'

const rad = (degrees) => (degrees * Math.PI) / 180
const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} != ${expected}`,
  )

// Independent construction: project a ray from the stick tip onto the tangent plane.
// It does not use the app's tan(q) or shadow/height angle recovery.
function vectorShadow(latitude, declination, height) {
  const phi = rad(latitude)
  const delta = rad(declination)
  const up = [Math.cos(phi), Math.sin(phi)]
  const north = [-Math.sin(phi), Math.cos(phi)]
  const sun = [Math.cos(delta), Math.sin(delta)]
  const illumination = up[0] * sun[0] + up[1] * sun[1]
  const ground = up.map(
    (component, index) => height * (component - sun[index] / illumination),
  )
  return ground[0] * north[0] + ground[1] * north[1]
}

test('teaching sphere declares 40000 km and the reference 800 km / 7.2 degree result', () => {
  assert.equal(SPHERE_CIRCUMFERENCE, 40000)
  near(2 * Math.PI * RADIUS, 40000)
  const m = snapshot(DEFAULT)
  near(m.distance, 800)
  near(m.separation, 7.2)
  near(m.shadowA, 0)
  near(m.shadowB, 0.12632937844610817)
  near(m.estimatedC, 40000)
  near(circumference(800, 7.2), 40000)
  assert.notEqual(m.estimatedC, 2 * Math.PI * 6371)
})

test('shadow projection agrees with a vector ray/tangent construction across the range', () => {
  for (const latitudeA of [-35, -10, 0, 23.44, 55]) {
    for (const latitudeB of [-35, 0, 30.64, 55]) {
      for (const declination of [-23.44, 0, 23.44]) {
        for (const height of [0.5, 1, 3]) {
          const m = snapshot({ ...DEFAULT, latitudeA, latitudeB, declination, height })
          near(m.shadowA, vectorShadow(latitudeA, declination, height))
          near(m.shadowB, vectorShadow(latitudeB, declination, height))
          // NOAA's cos(z) at H=0 independently supplies the unsigned zenith angle.
          const cosine =
            Math.sin(rad(latitudeB)) * Math.sin(rad(declination)) +
            Math.cos(rad(latitudeB)) * Math.cos(rad(declination))
          near(Math.cos(rad(m.signedB)), cosine)
          assert.ok(Number.isFinite(m.shadowA) && Number.isFinite(m.shadowB))
        }
      }
    }
  }
})

test('opposite-side shadows sum magnitudes instead of losing the north/south sign', () => {
  const m = snapshot({ ...DEFAULT, latitudeA: -10, latitudeB: 20, declination: 0 })
  near(m.shadowA, -0.17632698070846498)
  near(m.shadowB, 0.36397023426620234)
  near(m.separation, 30)
  near(m.distance, 40000 / 12)
  near(m.estimatedC, 40000)
  assert.notEqual(m.separation, 10)
  const exchanged = snapshot({
    ...DEFAULT,
    latitudeA: 20,
    latitudeB: -10,
    declination: 0,
  })
  near(exchanged.distance, m.distance)
  near(exchanged.separation, m.separation)
  near(exchanged.estimatedC, m.estimatedC)
})

test('changing solar declination changes both shadows but preserves their angular separation', () => {
  const summer = snapshot(DEFAULT)
  for (const declination of [-23.44, 0, 10, 23.44]) {
    const m = snapshot({ ...DEFAULT, declination })
    near(m.separation, summer.separation)
    near(m.distance, summer.distance)
    near(m.estimatedC, summer.estimatedC)
  }
  assert.notEqual(snapshot({ ...DEFAULT, declination: 0 }).shadowA, summer.shadowA)
})

test('doubling stick height doubles both shadows and preserves every inferred angle', () => {
  const setup = { ...DEFAULT, latitudeA: -10, latitudeB: 20, declination: 0 }
  const one = snapshot(setup)
  const two = snapshot({ ...setup, height: 2 })
  near(two.shadowA, 2 * one.shadowA)
  near(two.shadowB, 2 * one.shadowB)
  for (const key of ['signedA', 'signedB', 'separation', 'distance', 'estimatedC'])
    near(two[key], one[key])
})

test('surface arc agrees with an independent central-vector angle and is not a chord', () => {
  for (const [latitudeA, latitudeB] of [
    [-35, 55],
    [0, 30],
    [30.64, 23.44],
    [-10, 20],
  ]) {
    const a = [Math.cos(rad(latitudeA)), Math.sin(rad(latitudeA))]
    const b = [Math.cos(rad(latitudeB)), Math.sin(rad(latitudeB))]
    const central = Math.atan2(
      Math.abs(a[0] * b[1] - a[1] * b[0]),
      a[0] * b[0] + a[1] * b[1],
    )
    const expected = (40000 * central) / (2 * Math.PI)
    const m = snapshot({ ...DEFAULT, latitudeA, latitudeB, declination: 0 })
    near(m.distance, expected)
    near(m.estimatedC, 40000)
    const chord = (40000 * Math.sin(central / 2)) / Math.PI
    assert.ok(m.distance > chord)
  }
})

test('coincident sites have no finite circumference estimate, even with nonzero individual shadows', () => {
  const m = snapshot({ ...DEFAULT, latitudeA: 10, latitudeB: 10, declination: -10 })
  assert.ok(m.shadowA > 0)
  near(m.shadowA, m.shadowB)
  assert.equal(m.distance, 0)
  assert.equal(m.separation, 0)
  assert.equal(m.estimatedC, null)
  assert.equal(m.lowerC, null)
  assert.equal(m.upperC, null)
  assert.equal(circumference(0, 0), null)
  assert.equal(circumference(800, 0), null)
})

test('bounded angular error has independent numeric intervals and a longer base narrows them', () => {
  const short = snapshot({
    ...DEFAULT,
    latitudeB: DEFAULT.latitudeA + 3.6,
    angularError: 0.2,
  })
  const long = snapshot({ ...DEFAULT, angularError: 0.2 })
  near(short.distance, 400)
  near(short.lowerC, 37894.73684210527)
  near(short.upperC, 42352.94117647059)
  near(long.lowerC, 38918.91891891892)
  near(long.upperC, 41142.857142857145)
  assert.ok(short.upperC - short.lowerC > long.upperC - long.lowerC)
  for (const m of [short, long]) assert.ok(m.lowerC < 40000 && m.upperC > 40000)
  const exact = snapshot(DEFAULT)
  near(exact.lowerC, 40000)
  near(exact.upperC, 40000)
})

test('a margin reaching zero angle has no finite upper bound and is never a negative circumference', () => {
  const m = snapshot({
    ...DEFAULT,
    latitudeB: DEFAULT.latitudeA + 0.1,
    angularError: 0.2,
  })
  near(m.distance, 40000 / 3600)
  near(m.estimatedC, 40000)
  assert.ok(m.lowerC > 0)
  assert.equal(m.upperC, null)
})

test('nonfinite, nonphysical and out-of-domain inputs fail without contaminating the model', () => {
  for (const [key, values] of Object.entries({
    latitudeA: [-35.01, 55.01, NaN, Infinity],
    latitudeB: [-35.01, 55.01, NaN, -Infinity],
    declination: [-23.45, 23.45, NaN],
    height: [0, -1, 0.49, 3.01, Infinity],
    angularError: [-0.01, 0.51, NaN],
  })) {
    for (const value of values)
      assert.throws(() => snapshot({ ...DEFAULT, [key]: value }), RangeError)
  }
  for (const [distance, angle] of [
    [-1, 1],
    [1, -1],
    [NaN, 1],
    [1, Infinity],
  ]) {
    assert.throws(() => circumference(distance, angle), RangeError)
  }
})

test('distance presets have correct meridian endpoints and clamp to the visible latitude domain', () => {
  near(latitudeAtDistance(DEFAULT, 800), 30.64)
  near(latitudeAtDistance(DEFAULT, 1600), 37.84)
  near(latitudeAtDistance(DEFAULT, 400), 27.04)
  assert.equal(latitudeAtDistance(DEFAULT, 100000), 55)
  assert.throws(() => latitudeAtDistance(DEFAULT, Infinity), RangeError)
})

test('a recorded measurement owns its setup rather than following later control mutations', () => {
  const setup = { ...DEFAULT }
  const recorded = measure(setup)
  setup.height = 2
  setup.latitudeB = 40
  assert.equal(recorded.setup.height, 1)
  near(recorded.setup.latitudeB, 30.64)
  near(recorded.shadowB, 0.12632937844610817)
})

const configurations = [
  [{ latitudeB: DEFAULT.latitudeA }, { latitudeB: 30.64 }],
  [{ latitudeB: 30.64 }, { latitudeB: 37.84 }],
  [{ height: 1 }, { height: 2 }],
  [
    { latitudeB: 27.04, angularError: 0.2 },
    { latitudeB: 30.64, angularError: 0.2 },
  ],
]
const observe = (state, patch) =>
  reducer(reducer(state, { type: 'tune', patch }), { type: 'measure' })

test('four scientific answers require two recorded comparisons, not merely correct prediction or control motion', () => {
  assert.deepEqual(
    LESSONS.map((lesson) => lesson.answer),
    [1, 0, 2, 1],
  )
  for (let index = 0; index < 4; index++) {
    let state = initialState(index)
    state = reducer(state, { type: 'check' })
    assert.match(state.feedback, /Elegí una predicción/)
    assert.equal(state.verified, false)
    state = reducer(state, { type: 'predict', choice: LESSONS[index].answer })
    state = reducer(state, { type: 'tune', patch: configurations[index][0] })
    state = reducer(state, { type: 'check' })
    assert.match(state.feedback, /Falta una medición/)
    assert.deepEqual(state.completed, [])
    state = observe(state, configurations[index][0])
    assert.equal(observations(state).filter(Boolean).length, 1)
    state = reducer(state, { type: 'check' })
    assert.equal(state.verified, false)
    state = observe(state, configurations[index][1])
    assert.deepEqual(observations(state), [true, true])
    state = reducer(state, { type: 'predict', choice: (LESSONS[index].answer + 1) % 3 })
    state = reducer(state, { type: 'check' })
    assert.equal(state.verified, false)
    assert.deepEqual(state.completed, [])
    assert.match(state.feedback, /Todavía no coincide/)
    state = reducer(state, { type: 'predict', choice: LESSONS[index].answer })
    state = reducer(state, { type: 'check' })
    assert.equal(state.verified, true)
    assert.deepEqual(state.completed, [index])
  }
})

test('confounded site, Sun, height and error conditions cannot supply the requested comparisons', () => {
  for (let index = 0; index < 4; index++) {
    const offCondition = index === 2 ? { angularError: 0.1 } : { height: 1.5 }
    let state = initialState(index)
    for (const patch of configurations[index])
      state = observe(state, { ...patch, ...offCondition })
    assert.deepEqual(observations(state), [false, false])
    state = reducer(state, { type: 'predict', choice: LESSONS[index].answer })
    assert.equal(reducer(state, { type: 'check' }).verified, false)

    for (const changedReference of [{ latitudeA: 23.54 }, { declination: 23.34 }]) {
      let reference = initialState(index)
      for (const patch of configurations[index])
        reference = observe(reference, { ...patch, ...changedReference })
      assert.deepEqual(observations(reference), [false, false])
    }
  }
})

test('a nearby distinct site is not credited as the degenerate same-location observation', () => {
  const state = observe(initialState(0), { latitudeB: DEFAULT.latitudeA + 0.04 })
  assert.ok(state.records[0].distance > 0 && state.records[0].distance < 6)
  assert.deepEqual(observations(state), [false, false])
})

test('reset with an earlier achievement clears the current attempt and cannot auto-approve it', () => {
  let state = initialState(2)
  for (const patch of configurations[2]) state = observe(state, patch)
  state = reducer(state, { type: 'predict', choice: 2 })
  state = reducer(state, { type: 'check' })
  assert.equal(state.verified, true)
  state = reducer(state, { type: 'lesson', index: 2 })
  assert.deepEqual(state.completed, [2])
  assert.deepEqual(state.marks, [])
  assert.deepEqual(state.records, [])
  assert.equal(state.prediction, null)
  assert.equal(state.verified, false)
  assert.equal(reducer(state, { type: 'check' }).verified, false)
})

test('invalid reducer actions do not replace a valid setup or invent a lesson/answer', () => {
  const state = initialState()
  assert.throws(() => initialState(4), RangeError)
  assert.throws(() => initialState(-1), RangeError)
  assert.equal(reducer(state, { type: 'lesson', index: 4 }), state)
  assert.equal(reducer(state, { type: 'predict', choice: -1 }), state)
  assert.equal(reducer(state, { type: 'predict', choice: 3 }), state)
  assert.equal(reducer(state, { type: 'tune', patch: { height: 0 } }), state)
  assert.equal(reducer(state, { type: 'tune', patch: { angularError: NaN } }), state)
})

test('extra exploration preserves both required records and remeasuring a condition replaces only its own entry', () => {
  let state = initialState(1)
  state = observe(state, { latitudeB: 30.64 })
  state = observe(state, { latitudeB: 37.84 })
  near(state.records.find((record) => record.key === 'short').distance, 800)
  near(state.records.find((record) => record.key === 'long').distance, 1600)
  state = observe(state, { height: 2 })
  assert.equal(state.records.length, 3)
  assert.deepEqual(observations(state), [true, true])
  near(state.records.find((record) => record.key === 'short').distance, 800)
  near(state.records.find((record) => record.key === 'long').distance, 1600)
  state = observe(state, { height: 3 })
  assert.equal(state.records.length, 3)
  assert.equal(state.records.find((record) => record.key === 'explore').setup.height, 3)
  state = observe(state, { height: 1, latitudeB: 30.64 })
  assert.equal(state.records.length, 3)
  assert.equal(state.records.filter((record) => record.key === 'short').length, 1)
  near(state.records.find((record) => record.key === 'short').distance, 800)
})
