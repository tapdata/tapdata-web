import assert from 'node:assert/strict'
import test from 'node:test'
import {
  autoMappings,
  defaultQueryConfig,
  isCustomQueryResult,
  queryError,
  type QueryItem,
} from '../src/views/verification/components/customQuery.ts'

function itemWithUnmatchedAmounts(): QueryItem {
  const snapshot = (names: string[]) => ({
    fingerprint: 'tested',
    columns: names.map((name) => ({ name, type: 'decimal' })),
    rows: [],
    rowCount: 1,
    hasMore: false,
  })
  const item: QueryItem = {
    source: { querySnapshot: snapshot(['count', 'total_amount']) },
    target: { querySnapshot: snapshot(['count', 'amount_sum']) },
    customQueryConfig: defaultQueryConfig(),
  }
  item.customQueryConfig!.mappings = autoMappings(item)
  return item
}

test('matching counts cannot silently exclude unmatched amount columns', () => {
  assert.equal(queryError(itemWithUnmatchedAmounts()), 'mappingInvalid')
})

test('users can explicitly ignore unmatched amounts or complete their mapping', () => {
  const item = itemWithUnmatchedAmounts()
  const mappings = item.customQueryConfig!.mappings
  for (const mapping of mappings.slice(1)) mapping.role = 'ignore'
  assert.equal(queryError(item), undefined)
  mappings.splice(1, 2, {
    source: 'total_amount',
    target: 'amount_sum',
    role: 'compare',
  })
  assert.equal(queryError(item), undefined)
})

test('historical custom query batches use the legacy result view', () => {
  assert.equal(isCustomQueryResult('custom_query', {}, []), false)
  assert.equal(
    isCustomQueryResult('custom_query', {}, [{ differenceType: undefined }]),
    false,
  )
})

test('query summaries are selected from batch stats or typed differences', () => {
  for (const stats of [
    { sourceQuery: { status: 'running' } },
    { targetQuery: { status: 'error' } },
  ]) {
    assert.equal(isCustomQueryResult('custom_query', stats), true)
    assert.equal(isCustomQueryResult('field', stats), false)
  }
  assert.equal(
    isCustomQueryResult('custom_query', {}, [
      { differenceType: 'VALUE_MISMATCH' },
    ]),
    true,
  )
})
