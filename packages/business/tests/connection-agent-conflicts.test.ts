import assert from 'node:assert/strict'
import test from 'node:test'
import {
  agentCheckPayload,
  agentConflictReport,
  conflictTaskRoutes,
  taskAgentEdits,
  conflictTaskDestination,
  automaticConflictTasks,
} from '../src/views/connections/connectionAgentConflicts.ts'

test('automatic allocation clears stale manual and priority values without mutating the form', () => {
  const ids = ['one', 'two']
  const settings = {
    accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
    accessNodeProcessId: 'old',
    priorityProcessId: 'old',
  }
  const payload = agentCheckPayload(ids, settings, 'request')
  assert.deepEqual(payload.settings, {
    accessNodeType: settings.accessNodeType,
    accessNodeProcessId: null,
    priorityProcessId: null,
  })
  assert.equal(settings.accessNodeProcessId, 'old')
  assert.notEqual(payload.connectionIds, ids)
  assert.deepEqual(payload.connectionIds, ids)
})

test('single manual Agent and agent-group requests match the save payload', () => {
  assert.deepEqual(
    agentCheckPayload(['one'], {
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER',
      accessNodeProcessId: ' agent ',
      priorityProcessId: 'stale',
    }).settings,
    {
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER',
      accessNodeProcessId: 'agent',
      priorityProcessId: null,
    },
  )
  const group = agentCheckPayload(['one'], {
    accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
    accessNodeProcessId: ' group ',
    priorityProcessId: ' agent ',
  })
  assert.equal(group.settings.priorityProcessId, 'agent')
  assert.equal(group.settings.accessNodeProcessId, 'group')
})

test('reads conflict details from preview and save-time errors including hidden tasks', () => {
  const report = { items: [], total: 0, hiddenCount: 2, hasConflicts: false }
  for (const value of [
    report,
    { data: report },
    {
      response: {
        data: { code: 'Datasource.AgentTaskConflict', data: report },
      },
    },
  ]) {
    assert.equal(agentConflictReport(value)?.hasConflicts, true)
    assert.equal(agentConflictReport(value)?.hiddenCount, 2)
  }
  assert.equal(report.hasConflicts, false)
})

test('ordinary errors and malformed reports are not treated as task conflicts', () => {
  for (const value of [
    null,
    new Error('network'),
    { data: { total: 5, items: [] } },
    { total: -1, items: [], hasConflicts: true },
  ]) {
    assert.equal(agentConflictReport(value), null)
  }
})

test('supports navigation for all five related task types', () => {
  assert.equal(Object.keys(conflictTaskRoutes).length, 5)
  assert.equal(conflictTaskRoutes.inspect, 'dataVerificationList')
  assert.equal(conflictTaskRoutes.connHeartbeat, 'HeartbeatTableList')
})

test('task edits carry the selected revision and exclude noneditable rows', () => {
  const rows = [
    { id: 'stopped', editable: true, revision: 123 },
    { id: 'running', editable: false, revision: 456 },
    { id: 'legacy', editable: true, revision: null },
  ]
  assert.deepEqual(taskAgentEdits(rows), [
    { id: 'stopped', revision: 123 },
    { id: 'legacy', revision: null },
  ])
  assert.equal(rows.length, 3)
  assert.deepEqual(taskAgentEdits([]), [])
})

test('direct task links use IDs, editors for editable tasks and viewers otherwise', () => {
  const item = {
    id: 'task-id',
    syncType: 'sync',
    status: 'stop',
    canEdit: true,
    editable: true,
  }
  assert.deepEqual(conflictTaskDestination(item), {
    name: 'DataflowEditor',
    params: { id: 'task-id' },
    query: { settingsTab: 'agent' },
  })
  assert.equal(
    conflictTaskDestination({ ...item, canEdit: false })?.name,
    'TaskMonitor',
  )
  assert.equal(
    conflictTaskDestination({ ...item, status: 'running' })?.name,
    'TaskMonitor',
  )
  assert.equal(
    conflictTaskDestination({ ...item, syncType: 'migrate' })?.name,
    'MigrateEditor',
  )
  assert.deepEqual(
    conflictTaskDestination({ ...item, syncType: 'logCollector' }),
    { name: 'sharedMiningList', query: { editTaskId: 'task-id' } },
  )
  assert.equal(
    conflictTaskDestination({ ...item, syncType: 'connHeartbeat' }),
    null,
  )
  assert.equal(
    conflictTaskDestination({
      ...item,
      syncType: 'connHeartbeat',
      canEdit: false,
    })?.name,
    'HeartbeatMonitor',
  )
  assert.equal(
    conflictTaskDestination({ ...item, syncType: 'inspect' })?.name,
    'dataVerificationEdit',
  )
})

test('automatic action requires a positive server prediction and editability', () => {
  const rows = [
    { id: 'eligible', editable: true, autoResolvable: true },
    { id: 'connections-conflict', editable: true, autoResolvable: false },
    { id: 'no-permission', editable: false, autoResolvable: true },
    { id: 'old-server', editable: true },
  ]
  assert.deepEqual(
    automaticConflictTasks(rows).map((row) => row.id),
    ['eligible'],
  )
})
