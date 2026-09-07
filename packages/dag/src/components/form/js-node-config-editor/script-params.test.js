import assert from 'node:assert/strict'
import test from 'node:test'

import {
  duplicateScriptParamKeys,
  normalizeScriptParams,
  serializeScriptParams,
} from './script-params.js'

test('normalizeScriptParams always returns editable rows', () => {
  assert.deepEqual(normalizeScriptParams(null), [])
  assert.deepEqual(normalizeScriptParams([{ key: 'host', value: 1 }]), [
    {
      key: 'host',
      type: 'string',
      value: '1',
      encrypted: false,
      description: '',
    },
  ])
})

test('serializeScriptParams converts primitive values by declared type', () => {
  assert.deepEqual(
    serializeScriptParams([
      { key: 'port', type: 'number', value: '21' },
      { key: 'passive', type: 'boolean', value: 'true' },
      { key: 'options', type: 'json', value: '{"timeout": 10}' },
      { key: 'secret', type: 'string', value: 'ciphertext', encrypted: true },
    ]),
    [
      {
        key: 'port',
        type: 'number',
        value: 21,
        encrypted: false,
        description: '',
      },
      {
        key: 'passive',
        type: 'boolean',
        value: true,
        encrypted: false,
        description: '',
      },
      {
        key: 'options',
        type: 'json',
        value: { timeout: 10 },
        encrypted: false,
        description: '',
      },
      {
        key: 'secret',
        type: 'string',
        value: 'ciphertext',
        encrypted: true,
        description: '',
      },
    ],
  )
})

test('serializeScriptParams keeps invalid JSON for backend validation', () => {
  const [param] = serializeScriptParams([
    { key: 'options', type: 'json', value: '{invalid' },
  ])
  assert.equal(param.value, '{invalid')
})

test('duplicateScriptParamKeys ignores blank rows and returns repeated keys', () => {
  assert.deepEqual(
    [
      ...duplicateScriptParamKeys([
        { key: 'ftp.host' },
        { key: ' ftp.host ' },
        { key: '' },
        { key: 'ftp.port' },
      ]),
    ],
    ['ftp.host'],
  )
})
