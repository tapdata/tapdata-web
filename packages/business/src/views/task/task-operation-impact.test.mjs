import assert from 'node:assert/strict'
import test from 'node:test'

import {
  confirmTaskOperation,
  getAffectedTaskDqlImpacts,
  getTaskDqlImpactMessageKey,
} from './task-operation-impact.js'

test('sorts affected task DQL impacts by count descending', () => {
  const result = getAffectedTaskDqlImpacts(
    [
      { taskId: 'task-a', exists: true, count: 2 },
      { taskId: 'task-b', exists: true, count: 9 },
      { taskId: 'task-c', exists: true, count: 0 },
      { taskId: 'task-d', exists: false, count: 20 },
    ],
    new Map([
      ['task-a', { name: 'Task A' }],
      ['task-b', { name: 'Task B' }],
    ]),
  )

  assert.deepEqual(result, [
    { taskId: 'task-b', exists: true, count: 9, name: 'Task B' },
    { taskId: 'task-a', exists: true, count: 2, name: 'Task A' },
  ])
})

test('confirms the impact dialog instead of the operation dialog when impacts exist', async () => {
  const calls = []
  const result = await confirmTaskOperation({
    taskIds: ['task-a'],
    fetchImpacts: async (taskIds) => {
      calls.push(['fetch', taskIds])
      return [{ taskId: 'task-a', exists: true, count: 3 }]
    },
    confirmImpact: async (impacts) => {
      calls.push(['impact', impacts])
      return true
    },
    confirmOperation: async () => {
      calls.push(['operation'])
      return true
    },
  })

  assert.equal(result, true)
  assert.deepEqual(calls, [
    ['fetch', ['task-a']],
    ['impact', [{ taskId: 'task-a', exists: true, count: 3, name: 'task-a' }]],
  ])
})

test('confirms the original operation when no impacts exist or the check fails', async () => {
  const operationCalls = []
  const confirmOperation = async () => {
    operationCalls.push('operation')
    return true
  }

  assert.equal(
    await confirmTaskOperation({
      taskIds: ['task-a'],
      fetchImpacts: async () => [{ taskId: 'task-a', exists: true, count: 0 }],
      confirmImpact: async () => false,
      confirmOperation,
    }),
    true,
  )
  assert.equal(
    await confirmTaskOperation({
      taskIds: ['task-a'],
      fetchImpacts: async () => {
        throw new Error('unavailable')
      },
      confirmImpact: async () => false,
      confirmOperation,
    }),
    true,
  )

  assert.deepEqual(operationCalls, ['operation', 'operation'])
})

test('uses a separate message key for bulk task operations', () => {
  assert.equal(
    getTaskDqlImpactMessageKey('reset', false),
    'packages_business_dataFlow_dql_reset_impact_message',
  )
  assert.equal(
    getTaskDqlImpactMessageKey('reset', true),
    'packages_business_dataFlow_dql_bulk_reset_impact_message',
  )
  assert.equal(
    getTaskDqlImpactMessageKey('delete', true),
    'packages_business_dataFlow_dql_bulk_delete_impact_message',
  )
})
