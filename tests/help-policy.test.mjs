import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isLabPath,
  helpPosition,
  sceneHelpPosition,
  visibleSceneBounds,
  consultHelpKey,
} from '../src/education/helpPolicy.ts'
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

test('SVG and double-view help protects all visible renderers, omitting icons and hidden sections', () => {
  const viewport = { width: 1920, height: 889 }
  const entropy = { left: 221.5, right: 1098.7, top: 214.7, bottom: 749.3 }
  const p = sceneHelpPosition(visibleSceneBounds([entropy], viewport), viewport)
  assert.ok(p.left > entropy.right, 'card must be outside the entropy area comparison')
  const observer = { left: 12, right: 540, top: 80, bottom: 480 }
  const diagram = { left: 560, right: 1080, top: 80, bottom: 480 }
  assert.deepEqual(
    visibleSceneBounds(
      [
        observer,
        diagram,
        { left: 0, right: 24, top: 10, bottom: 34 },
        { left: 0, right: 500, top: 1000, bottom: 1300 },
      ],
      viewport,
    ),
    { left: 12, right: 1080, top: 80, bottom: 480 },
  )
  assert.equal(
    visibleSceneBounds([{ left: 0, right: 0, top: 0, bottom: 0 }], viewport),
    null,
  )
  for (const width of [320, 390]) {
    const mobile = { width, height: 844 }
    const svg = { left: 12, right: width - 12, top: 90, bottom: 350 }
    const card = sceneHelpPosition(visibleSceneBounds([svg], mobile), mobile)
    assert.ok(card.top > svg.bottom)
    assert.ok(card.top + card.maxHeight <= mobile.height - 82)
  }
})

test('help freezes modified slider keys while preserving scrolling, Tab and copy shortcuts', () => {
  for (const modified of [false, true]) {
    for (const key of ['ArrowRight', 'ArrowDown', 'End', 'Home', 'PageUp']) {
      assert.equal(consultHelpKey(key, { editable: true, control: true, modified }), true)
      assert.equal(
        consultHelpKey(key, { editable: false, control: false, modified }),
        false,
      )
    }
    for (const key of ['Enter', ' '])
      assert.equal(
        consultHelpKey(key, { editable: false, control: true, modified }),
        true,
      )
  }
  for (const key of ['Tab', 'c', 'r', 'l'])
    assert.equal(
      consultHelpKey(key, { editable: true, control: true, modified: true }),
      false,
    )
  assert.equal(
    consultHelpKey(' ', { editable: false, control: true, modified: false }),
    true,
  )
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
