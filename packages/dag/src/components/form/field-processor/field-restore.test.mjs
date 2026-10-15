import assert from 'node:assert/strict'
import { test } from 'node:test'
import { restoreSelectedFieldState } from './field-restore.mjs'

test('restore removes selected field overrides and keeps other table mappings', () => {
  const rows = [
    {
      sourceFieldName: 'source_a',
      targetFieldName: 'manually_adjusted',
      isShow: false,
    },
    {
      sourceFieldName: 'source_b',
      targetFieldName: 'custom_name',
      isShow: true,
    },
  ]
  const fieldMappings = [
    {
      sourceFieldName: 'source_a',
      targetFieldName: 'manually_adjusted',
      isShow: false,
      migrateType: 'custom',
    },
    {
      sourceFieldName: 'source_b',
      targetFieldName: 'custom_name',
      isShow: true,
      migrateType: 'custom',
    },
  ]
  const mappings = [
    {
      qualifiedName: 'table_a',
      operation: { prefix: '', suffix: '', capitalized: '' },
      fields: fieldMappings,
    },
    {
      qualifiedName: 'table_b',
      fields: [{ sourceFieldName: 'other', targetFieldName: 'custom_other' }],
    },
  ]

  const remainingMappings = restoreSelectedFieldState(
    rows,
    mappings,
    'table_a',
    ['source_a'],
    new Map([['source_a', 'resolved_default_name']]),
  )

  assert.deepEqual(remainingMappings, [
    { ...mappings[0], fields: [fieldMappings[1]] },
    mappings[1],
  ])
})

test('restore resets visibility and the name to its collision-resolved default', () => {
  const rows = [
    {
      sourceFieldName: 'source_a',
      targetFieldName: 'manually_adjusted',
      isShow: false,
    },
    {
      sourceFieldName: 'source_b',
      targetFieldName: 'custom_name',
      isShow: true,
    },
  ]
  const mappings = [
    {
      qualifiedName: 'table_a',
      fields: [{ sourceFieldName: 'source_a', targetFieldName: 'custom_name' }],
    },
  ]

  const remainingMappings = restoreSelectedFieldState(
    rows,
    mappings,
    'table_a',
    ['source_a'],
    new Map([['source_a', 'resolved_default_name']]),
  )

  assert.equal(rows[0].isShow, true)
  assert.equal(rows[0].targetFieldName, 'resolved_default_name')
  assert.deepEqual(remainingMappings, [])
  assert.equal(rows[1].targetFieldName, 'custom_name')
})

test('restore leaves table overrides untouched when no selected field mapping exists', () => {
  const mappings = [
    {
      qualifiedName: 'table_a',
      fields: [{ sourceFieldName: 'source_b', targetFieldName: 'custom_name' }],
    },
  ]

  const result = restoreSelectedFieldState(
    [
      {
        sourceFieldName: 'source_a',
        targetFieldName: 'source_a',
        isShow: false,
      },
    ],
    mappings,
    'table_a',
    ['source_a'],
    new Map(),
  )

  assert.equal(result, mappings)
})

test('restore removes selected overrides from every entry for the table', () => {
  const mappings = [
    {
      qualifiedName: 'table_a',
      fields: [{ sourceFieldName: 'source_a', targetFieldName: 'custom_a' }],
    },
    {
      qualifiedName: 'table_a',
      fields: [{ sourceFieldName: 'source_a', targetFieldName: 'custom_a' }],
    },
  ]

  const remainingMappings = restoreSelectedFieldState(
    [
      {
        sourceFieldName: 'source_a',
        targetFieldName: 'custom_a',
        isShow: false,
      },
    ],
    mappings,
    'table_a',
    ['source_a'],
    new Map([['source_a', 'source_a']]),
  )

  assert.deepEqual(remainingMappings, [])
})

test('restore sets the default name before making a field visible', () => {
  const stateAtVisibilityChange = []
  const row = {
    sourceFieldName: 'source_a',
    targetFieldName: 'previous_custom_name',
  }
  Object.defineProperty(row, 'isShow', {
    get: () => false,
    set: (visible) => {
      if (visible) stateAtVisibilityChange.push(row.targetFieldName)
    },
  })

  restoreSelectedFieldState(
    [row],
    [],
    'table_a',
    ['source_a'],
    new Map([['source_a', 'resolved_default_name']]),
  )

  assert.deepEqual(stateAtVisibilityChange, ['resolved_default_name'])
})
