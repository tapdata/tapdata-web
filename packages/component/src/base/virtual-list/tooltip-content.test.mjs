import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import { getOverflowTooltipContent } from './tooltip-content.mjs'

const { window } = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = window
globalThis.document = window.document

function setWidth(element, scrollWidth, clientWidth) {
  Object.defineProperties(element, {
    scrollWidth: { configurable: true, value: scrollWidth },
    clientWidth: { configurable: true, value: clientWidth },
  })
}

test('shows the complete field name only when its text is clipped', () => {
  const cell = document.createElement('div')
  const name = document.createElement('span')
  name.setAttribute('data-tooltip-content', '')
  name.textContent = 'long_field_name'
  cell.append(name)

  setWidth(name, 150, 80)
  assert.equal(getOverflowTooltipContent(cell), 'long_field_name')

  setWidth(name, 80, 80)
  assert.equal(getOverflowTooltipContent(cell), '')
})

test('uses the current input draft when it no longer fits', () => {
  const cell = document.createElement('div')
  const input = document.createElement('input')
  input.value = 'edited_long_field_name'
  cell.append(input)
  setWidth(input, 80, 80)
  window.HTMLCanvasElement.prototype.getContext = () => ({
    measureText: () => ({ width: 180 }),
  })

  assert.equal(getOverflowTooltipContent(cell), 'edited_long_field_name')

  window.HTMLCanvasElement.prototype.getContext = () => ({
    measureText: () => ({ width: 20 }),
  })
  assert.equal(getOverflowTooltipContent(cell), '')
})
