import assert from 'node:assert/strict'
import test from 'node:test'
import {
  agentCheckPayload,
  agentConflictReport,
  conflictTaskRoutes,
  taskAgentEdits,
  conflictTaskDestination,
  automaticConflictTasks,
  commonAllowedAgentProcessIds,
  filterAllowedAgentOptions,
  saveConnectionWithAgentConflictCheck,
  saveConnectionWithConflictRetry,
  snapshotConflictTasks,
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
    conflictTaskDestination({
      ...item,
      syncType: 'inspect',
      status: 'done',
      editable: false,
    })?.name,
    'dataVerificationEdit',
  )
  assert.equal(
    conflictTaskDestination({
      ...item,
      syncType: 'inspect',
      status: 'running',
      editable: false,
    })?.name,
    'dataVerifyDetails',
  )
  assert.equal(
    conflictTaskDestination({
      ...item,
      syncType: 'migrate',
      status: 'complete',
      editable: false,
    })?.name,
    'MigrateEditor',
  )
  assert.equal(
    conflictTaskDestination({ ...item, status: 'error', editable: false })
      ?.name,
    'DataflowEditor',
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

test('editing snapshots task ids and revisions without changing table selection', () => {
  const rows = [
    {
      id: 'task-a',
      name: 'Task A',
      revision: 123,
      editable: true,
      allowedAgentProcessIdSets: [['agent-a']],
    },
  ]
  const snapshot = snapshotConflictTasks(rows)
  rows[0].id = 'task-b'
  rows[0].revision = 456
  rows[0].allowedAgentProcessIdSets[0].push('agent-b')
  assert.deepEqual(snapshot, [
    {
      id: 'task-a',
      name: 'Task A',
      revision: 123,
      editable: true,
      allowedAgentProcessIdSets: [['agent-a']],
    },
  ])
})

test('common allowed Agents are intersected and unrestricted tasks do not widen the set', () => {
  assert.deepEqual(
    commonAllowedAgentProcessIds([
      ['a', 'b'],
      ['b', 'c'],
    ]),
    ['b'],
  )
  assert.equal(commonAllowedAgentProcessIds([]), null)
  assert.deepEqual(commonAllowedAgentProcessIds([['a'], ['b']]), [])
  assert.deepEqual(commonAllowedAgentProcessIds([['a'], []]), [])
})

test('Agent selector filters individual Agents and group members to the allowed intersection', () => {
  const options = [
    { value: 'a', accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER' },
    { value: 'b', accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER' },
    {
      value: 'group-1',
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
      children: [{ value: 'a' }, { value: 'b' }],
    },
    {
      value: 'group-2',
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
      children: [{ value: 'c' }],
    },
  ]
  assert.deepEqual(filterAllowedAgentOptions(options, [['a', 'b'], ['b']]), [
    { value: 'b', accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER' },
    {
      value: 'group-1',
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
      children: [{ value: 'b' }],
    },
  ])
  assert.deepEqual(filterAllowedAgentOptions(options, [['a'], ['b']]), [
    {
      value: 'group-1',
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
      children: [],
    },
  ])
  assert.deepEqual(filterAllowedAgentOptions(options, [[], ['b']]), [])
  assert.equal(filterAllowedAgentOptions(options, []), options)
})

test('connection save waits for preview approval and handles save-time conflicts', async () => {
  const payload = agentCheckPayload(['connection-1'], {}, 'request-1')
  const report = { items: [], total: 1, hiddenCount: 0, hasConflicts: true }
  const calls: string[] = []
  let attempts = 0
  const saved = await saveConnectionWithAgentConflictCheck(
    payload,
    (receivedPayload) => {
      assert.equal(receivedPayload, payload)
      calls.push('preview')
      return Promise.resolve(report)
    },
    () => {
      calls.push('save')
      if (++attempts === 1) throw { data: report }
      return Promise.resolve()
    },
    (receivedPayload, receivedReport) => {
      assert.equal(receivedPayload, payload)
      assert.deepEqual(receivedReport, report)
      calls.push('open')
      return Promise.resolve(true)
    },
  )
  assert.equal(saved, true)
  assert.deepEqual(calls, ['preview', 'open', 'save', 'open', 'save'])
})

test('canceling the preview prevents the connection write', async () => {
  const saved = await saveConnectionWithAgentConflictCheck(
    agentCheckPayload(['connection-1'], {}, 'request-1'),
    () =>
      Promise.resolve({
        items: [],
        total: 1,
        hiddenCount: 0,
        hasConflicts: true,
      }),
    () => assert.fail('connection must not be written'),
    () => Promise.resolve(false),
  )
  assert.equal(saved, false)
})

test('connection save retries original settings only after conflict resolution is confirmed', async () => {
  const payload = {
    requestId: 'request-1',
    connectionIds: ['connection-1'],
    settings: {
      accessNodeType: 'MANUALLY_SPECIFIED_BY_THE_USER',
      accessNodeProcessId: 'agent-b',
      priorityProcessId: null,
    },
  }
  const report = {
    items: [],
    total: 1,
    hiddenCount: 0,
    hasConflicts: true,
  }
  let saves = 0
  let opens = 0
  const saved = await saveConnectionWithConflictRetry(
    payload,
    () => {
      saves += 1
      if (saves === 1) throw { data: report }
      return Promise.resolve()
    },
    (receivedPayload, receivedReport) => {
      opens += 1
      assert.equal(receivedPayload, payload)
      assert.deepEqual(receivedReport, report)
      return Promise.resolve(true)
    },
  )
  assert.equal(saved, true)
  assert.equal(saves, 2)
  assert.equal(opens, 1)
})

test('canceling conflict resolution does not retry the connection save', async () => {
  let saves = 0
  const saved = await saveConnectionWithConflictRetry(
    {
      requestId: 'request-1',
      connectionIds: ['connection-1'],
      settings: {
        accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
        accessNodeProcessId: null,
        priorityProcessId: null,
      },
    },
    () => {
      saves += 1
      throw {
        data: { items: [], total: 1, hiddenCount: 0, hasConflicts: true },
      }
    },
    () => Promise.resolve(false),
  )
  assert.equal(saved, false)
  assert.equal(saves, 1)
})
