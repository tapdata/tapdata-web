import assert from 'node:assert/strict'
import test from 'node:test'

import { createTaskErrorModeOptions } from './src/components/task-error-mode-options.ts'

test('the DQL display option submits the DQL task mode', () => {
  const options = createTaskErrorModeOptions((key) => key)
  const dqlOption = options.find(
    ({ label }) => label === 'packages_dag_migration_settingpanel_route_to_dlq',
  )

  assert.ok(dqlOption)
  assert.equal(dqlOption.value, 'DQL')
})

test('task error mode values are unique', () => {
  const options = createTaskErrorModeOptions((key) => key, true)
  const values = options.map(({ value }) => value)

  assert.equal(new Set(values).size, values.length)
})
