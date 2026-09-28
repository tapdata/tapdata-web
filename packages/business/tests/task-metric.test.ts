import assert from 'node:assert/strict'
import test from 'node:test'
import { formatTaskMetricInfo } from '../src/shared/task-metric.ts'

test('formats task CPU and memory metrics for list display', () => {
  const now = Date.now()
  const metricInfo = formatTaskMetricInfo(
    {
      cpuUsage: 12.3456,
      memoryUsage: 1024,
      lastUpdateTime: now - 61_000,
    },
    (key, params) => `${key}:${params.time}`,
    (value, type, fix) => `${value}-${type}-${fix}`,
    now,
  )

  assert.equal(metricInfo.cpuUsage, '12.35%')
  assert.equal(metricInfo.memoryUsage, '1024-b-2')
  assert.match(metricInfo.lastUpdateTime, /^public_updated_from_now:/)
  assert.equal(metricInfo.hasWarning, true)
})
