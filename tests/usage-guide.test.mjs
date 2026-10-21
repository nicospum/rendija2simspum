import test from 'node:test'
import assert from 'node:assert/strict'
import { challengeGuide } from '../src/components/ui/trialSteps.ts'
import {
  LESSONS as diskLessons,
  observationSteps as diskSteps,
  observed as diskObserved,
  observe as observeDisk,
} from '../src/acrecion/learning.ts'
import {
  initialState,
  reducer,
  observationSteps as horizonSteps,
  observed as horizonObserved,
} from '../src/horizonte/learning.ts'

test('A first visit asks for an idea, even when the visitor explored the controls first', () => {
  assert.equal(
    challengeGuide(undefined, [{ label: 'Comparar', done: true }]).phase,
    'predict',
  )
  assert.match(challengeGuide(undefined, []).prompt, /cambiar de idea/)
  // The first choice may be an empty string; only undefined means no selection.
  assert.equal(
    challengeGuide('', [{ label: 'Probar', done: false }]).phase,
    'observe',
  )
})
test('The next instruction names the missing observation instead of repeating completed steps', () => {
  const guide = challengeGuide('Una idea', [
    { label: 'Sin gas', done: true },
    { label: 'Con gas', done: false },
  ])
  assert.match(guide.prompt, /Con gas/)
  assert.doesNotMatch(guide.prompt, /Sin gas/)
  assert.equal(guide.phase, 'observe')
})
test('The explanation step distinguishes manual checking from automatic achievements', () => {
  const steps = [{ label: 'Comparación', done: true }]
  assert.match(challengeGuide('Mi idea', steps).prompt, /Comprobar/)
  const automatic = challengeGuide('Mi idea', steps, true)
  assert.doesNotMatch(automatic.prompt, /Comprobar/)
  assert.match(automatic.prompt, /explicación coincide/)
})
test('Accretion checklists expose every required condition and agree with completion rules', () => {
  const marks = [
    ['off', 'gas'],
    ['bent', 'straight'],
    ['inclined', 'face'],
    ['mass'],
  ]
  for (let index = 0; index < diskLessons.length; index++) {
    const full = diskSteps(index, marks[index])
    assert.equal(full.length, marks[index].length)
    assert.ok(full.every((step) => step.done && step.label.length > 12))
    assert.equal(diskObserved(index, marks[index]), true)
    for (const mark of marks[index]) {
      const partial = marks[index].filter((value) => value !== mark)
      assert.equal(diskObserved(index, partial), false)
      assert.equal(
        diskSteps(index, partial).filter((step) => !step.done).length,
        1,
      )
    }
  }
  assert.equal(diskObserved(9, []), false)
  const start = diskLessons[0].setup
  const marks0 = observeDisk(0, start, [])
  assert.equal(diskSteps(0, marks0)[0].done, true)
  assert.equal(diskSteps(0, marks0)[1].done, false)
})
test('Horizon checklist includes receiving the outside pulse, beyond sending both pulses', () => {
  const learning = {
    ...initialState(3).learning,
    marks: ['outside', 'trapped'],
  }
  assert.equal(horizonObserved(learning), false)
  const missing = horizonSteps(learning).filter((step) => !step.done)
  assert.equal(missing.length, 1)
  assert.match(missing[0].label, /Recibir este pulso/)
  assert.equal(
    horizonObserved({ ...learning, marks: [...learning.marks, 'heard'] }),
    true,
  )
})
test('Horizon checklists retain exact observation requirements for all four challenges', () => {
  for (const [index, marks] of [
    ['high', 'low'],
    ['horizon', 'inside'],
    ['early', 'late'],
    ['outside', 'trapped', 'heard'],
  ].entries()) {
    const learning = { ...initialState(index).learning, marks }
    assert.ok(horizonSteps(learning).every((step) => step.done))
    assert.equal(horizonObserved(learning), true)
    for (const mark of marks)
      assert.equal(
        horizonObserved({
          ...learning,
          marks: marks.filter((m) => m !== mark),
        }),
        false,
      )
  }
})
test('The held-clock shortcuts compare heights without switching to free fall or erasing achievements', () => {
  let state = initialState(0, [2])
  state = reducer(state, { type: 'tune', patch: { radius: 4 } })
  state = reducer(state, { type: 'tune', patch: { radius: 1.2 } })
  assert.equal(state.setup.mode, 'hover')
  assert.equal(state.setup.radius, 1.2)
  assert.ok(horizonObserved(state.learning))
  assert.deepEqual(state.learning.completed, [2])
  state = reducer(state, { type: 'predict', choice: 0 })
  state = reducer(state, { type: 'check' })
  assert.deepEqual(state.learning.completed, [2, 0])
})
