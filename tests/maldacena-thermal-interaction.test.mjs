import test from 'node:test'
import assert from 'node:assert/strict'
import {
  intervalAtEdgeX,
  intervalAtPlotX,
  roundedInterval,
} from '../src/maldacena/thermal/interaction.ts'

test('both BTZ scene views reach exact native-range challenge lengths', () => {
  for (const length of [0.5, 2, 4, 6]) {
    assert.equal(intervalAtEdgeX(250 + (length / 2) * 44), length)
    assert.equal(intervalAtPlotX(45 + (length / 6) * 405), length)
  }
  let value = 0.5
  for (let i = 0; i < 15; i++) value = roundedInterval(value + 0.1)
  assert.equal(value, 2)
  assert.equal(roundedInterval(2.0000000000000004), 2)
})
test('BTZ scene inputs remain in the physical range and tolerate invalid positions', () => {
  assert.equal(intervalAtEdgeX(-100), 0.5)
  assert.equal(intervalAtPlotX(900), 6)
  assert.equal(intervalAtPlotX(NaN), 2)
  assert.equal(roundedInterval(Infinity), 2)
})
