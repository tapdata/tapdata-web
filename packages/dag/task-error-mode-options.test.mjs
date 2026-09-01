import assert from 'node:assert/strict'
import test from 'node:test'

import { createTaskErrorModeOptions } from './src/components/task-error-mode-options.ts'

test('the DLQ display option submits the DLQ task mode', () => {
  const options = createTaskErrorModeOptions((key) => key)
  const dlqOption = options.find(
    ({ label }) => label === 'packages_dag_migration_settingpanel_route_to_dlq',
  )

  assert.ok(dlqOption)
  assert.equal(dlqOption.value, 'DLQ')
})

test('task error mode values are unique', () => {
  const options = createTaskErrorModeOptions((key) => key, true)
  const values = options.map(({ value }) => value)

  assert.equal(new Set(values).size, values.length)
})
