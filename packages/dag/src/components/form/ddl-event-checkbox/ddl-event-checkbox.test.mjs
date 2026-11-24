import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, test } from 'node:test'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

const dom = new JSDOM('<!doctype html><html><body></body></html>')
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  Element: dom.window.Element,
  SVGElement: dom.window.SVGElement,
})
after(() => dom.window.close())

const require = createRequire(import.meta.url)
const { createApp, h, nextTick } = require('vue')
const { createForm } = require('@formily/core')
const { createSchemaField, FormProvider, useForm } = require('@formily/vue')
const { ElCheckbox, ElCheckboxGroup } = require('element-plus')

const eventIds = [
  'new_field_event',
  'alter_field_attributes_event',
  'drop_field_event',
]
const hiddenEvent = 'clear_table_event'

const source = readFileSync(new URL('./index.tsx', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  fileName: 'index.tsx',
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.React,
    jsxFactory: 'jsx',
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
})

// Use real Vue, Element Plus and Formily. Stub the application store and i18n.
const appModules = {
  '@tap/form': { useForm },
  '@tap/i18n': { t: (key) => key },
  '../../../stores/dataflow.store': {
    useDataflowStore: () => ({
      getCapabilitiesByType: () =>
        [...eventIds, hiddenEvent].map((id) => ({ id, type: 10 })),
    }),
  },
}
const jsx = (tag, props, ...children) =>
  h(
    tag,
    props,
    typeof tag === 'string' ? children : { default: () => children },
  )
const components = {}
new Function(
  'require',
  'exports',
  'jsx',
  'ElCheckbox',
  'ElCheckboxGroup',
  outputText,
)(
  (id) => appModules[id] ?? require(id),
  components,
  jsx,
  ElCheckbox,
  ElCheckboxGroup,
)

const { SchemaField } = createSchemaField({ components })

function mountDdlField(t, values = {}, disabled = false) {
  const form = createForm({ values, disabled })
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp({
    render: () =>
      h(
        FormProvider,
        { form },
        {
          default: () =>
            h(SchemaField, {
              schema: {
                type: 'object',
                properties: {
                  disabledEvents: {
                    type: 'array',
                    'x-component': 'DdlEventCheckbox',
                  },
                },
              },
            }),
        },
      ),
  })
  app.mount(container)
  t.after(() => {
    app.unmount()
    container.remove()
  })

  const inputs = [...container.querySelectorAll('input[type="checkbox"]')]
  assert.deepEqual(
    inputs.map((input) => input.value),
    eventIds,
  )
  return { form, inputs, checked: () => inputs.map((input) => input.checked) }
}

async function clickCheckbox(input) {
  input.click()
  await nextTick()
  await nextTick()
}

test('DDL changes store excluded events and reopen with the same selections', async (t) => {
  const { form, inputs, checked } = mountDdlField(t, {
    disabledEvents: [hiddenEvent, ...eventIds],
  })
  assert.deepEqual(checked(), [false, false, false])

  await clickCheckbox(inputs[0])
  assert.deepEqual(form.values.disabledEvents, [
    hiddenEvent,
    ...eventIds.slice(1),
  ])
  assert.deepEqual(checked(), [true, false, false])

  const reopened = mountDdlField(t, {
    disabledEvents: [...form.values.disabledEvents],
  })
  assert.deepEqual(reopened.checked(), [true, false, false])

  await clickCheckbox(reopened.inputs[0])
  assert.deepEqual(
    new Set(reopened.form.values.disabledEvents),
    new Set([hiddenEvent, ...eventIds]),
  )
  assert.deepEqual(reopened.checked(), [false, false, false])
})

test('DDL defaults to selecting all visible events and leaves a read-only form untouched', async (t) => {
  const editable = mountDdlField(t)
  assert.deepEqual(editable.checked(), [true, true, true])

  await clickCheckbox(editable.inputs[0])
  assert.deepEqual(editable.form.values.disabledEvents, [eventIds[0]])
  await clickCheckbox(editable.inputs[0])
  assert.deepEqual(editable.form.values.disabledEvents, [])
  assert.deepEqual(editable.checked(), [true, true, true])

  const readOnly = mountDdlField(t, { disabledEvents: [eventIds[0]] }, true)
  assert.ok(readOnly.inputs.every((input) => input.disabled))
  await clickCheckbox(readOnly.inputs[0])
  assert.deepEqual(readOnly.form.values.disabledEvents, [eventIds[0]])
  assert.deepEqual(readOnly.checked(), [false, true, true])
})
