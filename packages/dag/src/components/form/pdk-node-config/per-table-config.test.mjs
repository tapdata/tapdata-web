import assert from 'node:assert/strict'
import test from 'node:test'
import {
  pickPerTableConfig,
  syncInheritedPerTableValues,
} from './per-table-config.mjs'

const schema = {
  type: 'object',
  properties: {
    stopTimeoutSeconds: { type: 'number' },
    diskTmpDir: { type: 'string', 'x-perTable': true },
    options: {
      type: 'object',
      properties: {
        inherited: { type: 'string', 'x-perTable': true },
        nodeOnly: { type: 'string' },
      },
    },
  },
}

test('new table config contains only x-perTable fields, including nested fields', () => {
  assert.deepEqual(
    pickPerTableConfig(schema, {
      stopTimeoutSeconds: 180,
      diskTmpDir: '/tmp',
      options: { inherited: 'node-value', nodeOnly: 'service-value' },
    }),
    { diskTmpDir: '/tmp', options: { inherited: 'node-value' } },
  )
})

test('node changes update inherited values and preserve explicit per-table overrides', () => {
  const tableValues = {
    diskTmpDir: '/tmp',
    options: { inherited: 'old-node-value' },
  }
  assert.deepEqual(
    syncInheritedPerTableValues(
      schema,
      tableValues,
      { diskTmpDir: '/tmp', options: { inherited: 'old-node-value' } },
      { diskTmpDir: '/tapdata_cache', options: { inherited: 'new-node-value' } },
    ),
    {
      diskTmpDir: '/tapdata_cache',
      options: { inherited: 'new-node-value' },
    },
  )

  assert.deepEqual(
    syncInheritedPerTableValues(
      schema,
      { diskTmpDir: '/table-cache', stopTimeoutSeconds: 180 },
      { diskTmpDir: '/tmp' },
      { diskTmpDir: '/tapdata_cache' },
    ),
    { diskTmpDir: '/table-cache' },
  )
})
