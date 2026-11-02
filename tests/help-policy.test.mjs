import test from 'node:test'
import assert from 'node:assert/strict'
import { isLabPath, helpPosition } from '../src/education/helpPolicy.ts'
test('context help appears only in laboratories, including legacy links', () => {
  for (const path of ['/curva-de-page/', '/holografia', '/dos-lenguajes/', '/prisma/'])
    assert.equal(isLabPath(path), true)
  for (const path of [
    '/',
    '/maldacena/',
    '/einstein/',
    '/agujeros-negros/',
    '/no-existe/',
  ])
    assert.equal(isLabPath(path), false)
})
test('reading card stays within narrow and short viewports', () => {
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [667, 375],
    [1280, 900],
  ]) {
    for (const left of [-10, 0, width - 10]) {
      const p = helpPosition(
        { left, right: left + 30, top: height - 10, bottom: height + 20 },
        { width, height },
      )
      assert.ok(p.left >= 12)
      assert.ok(p.left + p.width <= width - 12)
      assert.ok(p.top >= 12 && p.top < height)
    }
  }
})
