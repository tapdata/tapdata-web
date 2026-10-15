import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getTooltipPosition } from './tooltip-position.mjs'

test('centers the tooltip on the hovered cell when there is room', () => {
  assert.deepEqual(
    getTooltipPosition(
      { left: 200, top: 100, width: 100, bottom: 130 },
      { width: 80, height: 32 },
      { width: 800, height: 600 },
    ),
    { left: '210px', top: '136px', visibility: 'visible' },
  )
})

test('keeps a right-edge tooltip near its cell and flips it above at the bottom', () => {
  assert.deepEqual(
    getTooltipPosition(
      { left: 730, top: 540, width: 60, bottom: 570 },
      { width: 180, height: 40 },
      { width: 800, height: 600 },
    ),
    { left: '608px', top: '494px', visibility: 'visible' },
  )
})
