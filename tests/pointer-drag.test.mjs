import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { usePointerDrag } from '../src/shared/usePointerDrag.ts'

// Exercise the real hook with event records and a capture target. This verifies
// event ownership, not Safari dispatch, physical touch input or browser scrolling.
function harness(options = {}) {
  const events = [],
    captures = new Set(),
    released = []
  const target = {
    setPointerCapture(id) {
      captures.add(id)
    },
    hasPointerCapture(id) {
      return captures.has(id)
    },
    releasePointerCapture(id) {
      captures.delete(id)
      released.push(id)
    },
  }
  let handlers
  function Probe() {
    handlers = usePointerDrag({
      onStart: (e) => events.push(['start', e.pointerId, e.clientX]),
      onMove: (e) => events.push(['move', e.pointerId, e.clientX]),
      onEnd: (e) => events.push(['end', e.pointerId, e.clientX]),
      onCancel: () => events.push(['cancel']),
      onHover: (e) => events.push(['hover', e.pointerId, e.clientX]),
      ...options,
    })
    return null
  }
  renderToStaticMarkup(createElement(Probe))
  const event = (pointerId, extra = {}) => ({
    pointerId,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX: 0,
    clientY: 0,
    currentTarget: target,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
    ...extra,
  })
  return { handlers, target, events, captures, released, event }
}

test('A scene drag records the final position and releases only its own capture', () => {
  const h = harness(),
    down = h.event(1, { clientX: 10 })
  h.handlers.onPointerDown(down)
  h.handlers.onPointerMove(h.event(1, { clientX: 40 }))
  h.handlers.onPointerUp(h.event(1, { clientX: 100 }))
  h.handlers.onLostPointerCapture(h.event(1))
  assert.deepEqual(h.events, [
    ['start', 1, 10],
    ['move', 1, 40],
    ['end', 1, 100],
  ])
  assert.equal(down.defaultPrevented, true)
  assert.deepEqual(h.released, [1])
  assert.equal(h.captures.size, 0)
})

test('A second finger cannot move, end or cancel the active scene gesture', () => {
  const h = harness(),
    other = h.event(2, { isPrimary: false, clientX: 999 })
  h.handlers.onPointerDown(h.event(1))
  h.handlers.onPointerDown(other)
  h.handlers.onPointerMove(other)
  h.handlers.onPointerUp(other)
  h.handlers.onPointerCancel(other)
  h.handlers.onLostPointerCapture(other)
  h.handlers.onPointerMove(h.event(1, { clientX: 30 }))
  h.handlers.onPointerUp(h.event(1, { clientX: 50 }))
  assert.deepEqual(h.events, [
    ['start', 1, 0],
    ['move', 1, 30],
    ['end', 1, 50],
  ])
  assert.equal(other.defaultPrevented, false)
  assert.deepEqual(h.released, [1])
})

test('A primary pen or mouse cannot steal an active touch gesture', () => {
  const h = harness()
  h.handlers.onPointerDown(h.event(1))
  h.handlers.onPointerDown(h.event(8, { pointerType: 'pen' }))
  h.handlers.onPointerMove(h.event(8, { pointerType: 'pen', clientX: 999 }))
  h.handlers.onPointerCancel(h.event(8, { pointerType: 'pen' }))
  h.handlers.onPointerUp(h.event(1, { clientX: 10 }))
  assert.deepEqual(h.events, [
    ['start', 1, 0],
    ['end', 1, 10],
  ])
  assert.deepEqual(h.released, [1])
})

test('Browser cancellation ends a gesture without a final update or a map tap', () => {
  const h = harness()
  h.handlers.onPointerDown(h.event(1))
  h.handlers.onPointerCancel(h.event(1))
  h.handlers.onLostPointerCapture(h.event(1))
  h.handlers.onPointerUp(h.event(1, { clientX: 999 }))
  h.handlers.onPointerDown(h.event(2))
  h.handlers.onPointerCancel(h.event(1)) // A late event cannot cancel the next trial.
  h.handlers.onPointerUp(h.event(2, { clientX: 20 }))
  assert.deepEqual(h.events, [
    ['start', 1, 0],
    ['cancel'],
    ['start', 2, 0],
    ['end', 2, 20],
  ])
})

test('Lost capture clears ownership, ignores late release and permits a new gesture', () => {
  const h = harness()
  h.handlers.onPointerDown(h.event(1))
  h.captures.delete(1) // The browser already released capture.
  h.handlers.onLostPointerCapture(h.event(1))
  h.handlers.onPointerUp(h.event(1))
  h.handlers.onPointerDown(h.event(2))
  h.handlers.onLostPointerCapture(h.event(1))
  h.handlers.onPointerMove(h.event(2, { clientX: 50 }))
  h.captures.delete(2)
  h.handlers.onPointerUp(h.event(2, { clientX: 60 }))
  assert.deepEqual(h.events, [
    ['start', 1, 0],
    ['cancel'],
    ['start', 2, 0],
    ['move', 2, 50],
    ['end', 2, 60],
  ])
  assert.deepEqual(h.released, [])
})

test('Invalid drag starts and failed capture cannot leave the scene stuck', () => {
  const h = harness()
  h.handlers.onPointerDown(h.event(1, { isPrimary: false }))
  h.handlers.onPointerDown(h.event(1, { button: 2 }))
  assert.deepEqual(h.events, [])
  const capture = h.target.setPointerCapture
  h.target.setPointerCapture = () => {
    throw new Error('Pointer no longer active')
  }
  assert.throws(
    () => h.handlers.onPointerDown(h.event(1)),
    /no longer active/,
  )
  h.target.setPointerCapture = capture
  h.handlers.onPointerDown(h.event(2))
  h.handlers.onPointerUp(h.event(2))
  assert.deepEqual(h.events, [
    ['start', 2, 0],
    ['end', 2, 0],
  ])
})

test('The Hawking map can preserve native panning and keep hover separate from dragging', () => {
  const h = harness({ preventDefault: false }),
    down = h.event(1)
  h.handlers.onPointerMove(
    h.event(7, { pointerType: 'mouse', clientX: 20 }),
  )
  h.handlers.onPointerDown(down)
  h.handlers.onPointerMove(
    h.event(7, { pointerType: 'mouse', clientX: 999 }),
  )
  h.handlers.onPointerMove(h.event(1, { clientX: 30 }))
  h.handlers.onPointerUp(h.event(1, { clientX: 40 }))
  assert.equal(down.defaultPrevented, false)
  assert.deepEqual(h.events, [
    ['hover', 7, 20],
    ['start', 1, 0],
    ['move', 1, 30],
    ['end', 1, 40],
  ])
})
