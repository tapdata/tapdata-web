import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getRowNumber } from './row-number.mjs'

test('renders a row number only for a valid virtual-list index', () => {
  assert.equal(getRowNumber(0), 1)
  assert.equal(getRowNumber(4), 5)
  assert.equal(getRowNumber(undefined), '')
  assert.equal(getRowNumber(Number.NaN), '')
})
