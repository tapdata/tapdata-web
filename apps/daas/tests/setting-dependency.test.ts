import assert from 'node:assert/strict'
import test from 'node:test'
import { orderSettingsByDependency } from '../src/utils/setting-dependency.ts'

test('places a child setting directly after its parent', () => {
  const settings = [
    { key: 'other', sort: '1' },
    { key: 'child', parent_key: 'parent', sort: '2' },
    { key: 'parent', sort: '3' },
  ]

  const result = orderSettingsByDependency(settings)

  assert.deepEqual(
    result.map((setting) => setting.key),
    ['other', 'parent', 'child'],
  )
})
