import assert from 'node:assert/strict'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Element: dom.window.Element,
  SVGElement: dom.window.SVGElement,
})

const { createApp, h, nextTick, ref } = await import('vue')
const { InnerInput } = await import('./inner-input.mjs')

test('an uncommitted field name survives a rerender and commits on change', async () => {
  const component = ref()
  const changes = []
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp({
    render: () =>
      h(InnerInput, {
        ref: component,
        value: 'old_name',
        onChange: (event) => changes.push(event.target.value),
      }),
  })

  app.mount(container)
  const input = container.querySelector('input')
  input.value = 'new_name'
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
  component.value.$forceUpdate()
  await nextTick()

  assert.equal(input.value, 'new_name')
  input.dispatchEvent(new window.Event('change', { bubbles: true }))
  assert.deepEqual(changes, ['new_name'])
  app.unmount()
  container.remove()
})
