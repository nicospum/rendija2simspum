import test from 'node:test'
import assert from 'node:assert/strict'
import { useStore, DEFAULT_CONFIG } from '../src/prisma/store/store.ts'
import { traceExperiment } from '../src/prisma/physics/optics.ts'

test('freeze preserves the physical configuration until resume', () => {
  useStore.getState().reset()
  const initial = traceExperiment(useStore.getState().config).metrics.deviationAngle
  useStore.getState().togglePause()
  useStore.getState().setParameter('prismAngle', 12)
  assert.equal(useStore.getState().config.prismAngle, 12)
  assert.equal(useStore.getState().pausedConfig.prismAngle, 0)
  assert.equal(traceExperiment(useStore.getState().pausedConfig).metrics.deviationAngle, initial)
  useStore.getState().togglePause()
  assert.equal(useStore.getState().pausedConfig, null)
  assert.notEqual(traceExperiment(useStore.getState().config).metrics.deviationAngle, initial)
})

test('controls clamp numeric input and reject invalid numeric/material values', () => {
  useStore.getState().reset()
  useStore.getState().setParameter('screenDistance', -100)
  assert.equal(useStore.getState().config.screenDistance, 1.6)
  useStore.getState().setParameter('prismAngle', Infinity)
  assert.equal(useStore.getState().config.prismAngle, DEFAULT_CONFIG.prismAngle)
  useStore.getState().setMaterial('toString')
  assert.equal(useStore.getState().config.material, 'glass')
  useStore.getState().setIntensity(20)
  assert.equal(useStore.getState().lightIntensity, 1)
  useStore.getState().setIntensity(NaN)
  assert.equal(useStore.getState().lightIntensity, 1)
  useStore.getState().setParameter('prismAngle', 180)
  assert.equal(useStore.getState().config.prismAngle, 180)
  const clockwise = traceExperiment(useStore.getState().config)
  useStore.getState().setParameter('prismAngle', -180)
  const counterclockwise = traceExperiment(useStore.getState().config)
  assert.equal(counterclockwise.metrics.screenHits, clockwise.metrics.screenHits)
  clockwise.vertices.forEach((vertex, index) => {
    assert.ok(Math.abs(vertex.x - counterclockwise.vertices[index].x) < 1e-9)
    assert.ok(Math.abs(vertex.z - counterclockwise.vertices[index].z) < 1e-9)
  })
})

test('power controls never modify optical trajectories and reset restores all defaults', () => {
  useStore.getState().reset()
  const before = traceExperiment(useStore.getState().config)
  useStore.getState().toggleLight()
  useStore.getState().setIntensity(0.2)
  assert.deepEqual(traceExperiment(useStore.getState().config), before)
  useStore.getState().setView('top')
  useStore.getState().toggleNormals()
  useStore.getState().togglePause()
  useStore.getState().setParameter('apexAngle', 80)
  const cameraKey = useStore.getState().cameraResetKey
  useStore.getState().reset()
  assert.deepEqual(useStore.getState().config, DEFAULT_CONFIG)
  assert.equal(useStore.getState().pausedConfig, null)
  assert.equal(useStore.getState().lightEnabled, true)
  assert.equal(useStore.getState().view, 'perspective')
  assert.equal(useStore.getState().showNormals, false)
  assert.equal(useStore.getState().cameraResetKey, cameraKey + 1)
})
