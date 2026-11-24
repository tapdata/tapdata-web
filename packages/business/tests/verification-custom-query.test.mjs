import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'
import ts from 'typescript'
import { compileScript, parse } from 'vue/compiler-sfc'
import {
  autoMappings,
  defaultQueryConfig,
} from '../src/views/verification/components/customQuery.ts'

const { window } = new JSDOM()
globalThis.window = window
globalThis.document = window.document
globalThis.SVGElement = window.SVGElement
globalThis.Element = window.Element
const vue = await import('vue')
const verification = new URL('../src/views/verification/', import.meta.url)

function load(source, dependencies) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const exports = {}
  new Function('require', 'exports', outputText)(
    (id) => dependencies[id],
    exports,
  )
  return exports.default
}

const editorSource = compileScript(
  parse(
    readFileSync(
      new URL('components/CustomQueryEditor.vue', verification),
      'utf8',
    ),
  ).descriptor,
  { id: 'custom-query-editor-test' },
).content

function mountEditor(item, requests) {
  const component = load(editorSource, {
    vue,
    './customQuery': { autoMappings, defaultQueryConfig },
    '@tap/form/src/components/sql-editor': {},
    '@tap/api/src/core/inspects': {
      testInspectQuery: (input) =>
        new Promise((resolve, reject) =>
          requests.push({ input, resolve, reject }),
        ),
    },
  })
  component.render = () => null
  const app = vue.createApp(component, { item })
  const vm = app.mount(document.createElement('div'))
  return { ...vm.$.setupState, unmount: () => app.unmount() }
}

function snapshot(fingerprint, names = ['total'], timezone = 'UTC') {
  return {
    fingerprint,
    timezone,
    columns: names.map((name) => ({ name, type: 'NUMBER' })),
    rows: [{ total: 42 }],
    rowCount: 1,
  }
}

function queryItem() {
  return vue.reactive({
    source: { connectionId: 'source', customQuery: 'SELECT total FROM orders' },
    target: { connectionId: 'target', querySnapshot: snapshot('target') },
    customQueryConfig: defaultQueryConfig(),
  })
}

test('ignores a response from the editor instance that left the page', async () => {
  const requests = []
  const item = queryItem()
  item.source.queryTimezone = 'UTC'
  const first = mountEditor(item, requests)
  const earlier = first.test('source')
  first.unmount()

  const second = mountEditor(item, requests)
  const later = second.test('source')
  requests[1].resolve(snapshot('later'))
  await later
  item.customQueryConfig.mappings[0].absoluteTolerance = '0.01'

  requests[0].resolve(snapshot('earlier'))
  await earlier
  assert.equal(item.source.querySnapshot.fingerprint, 'later')
  assert.equal(item.customQueryConfig.mappings[0].absoluteTolerance, '0.01')
  second.unmount()
})

test('invalidates a pending request when inputs change and then change back', async () => {
  const requests = []
  const item = queryItem()
  const editor = mountEditor(item, requests)
  const earlier = editor.test('source')
  item.customQueryConfig.ignoreCase = false
  item.customQueryConfig.ignoreCase = true
  const later = editor.test('source')

  requests[0].reject(new Error('old preview failure'))
  await earlier
  assert.equal(editor.errors.source, '')
  assert.equal(editor.busy.source, true)
  requests[1].resolve(snapshot('later'))
  await later
  assert.equal(editor.busy.source, false)
  assert.equal(item.source.querySnapshot.fingerprint, 'later')
  editor.unmount()
})

test('inherits timezone separately for each connection and preserves an explicit override', async () => {
  const requests = []
  const item = queryItem()
  item.source.queryTimezone = ''
  const editor = mountEditor(item, requests)
  const first = editor.test('source')
  requests[0].resolve(snapshot('utc'))
  await first

  item.source.connectionId = 'shanghai'
  const second = editor.test('source')
  assert.equal(requests[1].input.timezone, '')
  requests[1].resolve(snapshot('shanghai', ['total'], 'Asia/Shanghai'))
  await second
  assert.equal(item.source.querySnapshot.timezone, 'Asia/Shanghai')
  assert.equal(item.source.queryTimezone, '')

  item.source.queryTimezone = 'UTC'
  const third = editor.test('source')
  assert.equal(requests[2].input.timezone, 'UTC')
  requests[2].resolve(snapshot('override'))
  await third
  assert.equal(item.source.queryTimezone, 'UTC')
  editor.unmount()
})
