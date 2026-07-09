import assert from 'node:assert/strict'
import {
  ASSISTANT_CONFIG_STORAGE_KEY,
  appendAssistantResults,
  applyAssistantToolCallResult,
  appendAssistantToolCallStart,
  buildAssistantContentBlocks,
  createAssistantMessage,
  createAssistantResultsFromToolResult,
  createDemoAssistantMessage,
  DEFAULT_ASSISTANT_CONFIG,
  extractStreamContent,
  formatAssistantToolCallJson,
  normalizeAssistantConfig,
  takeAssistantDeltaFrame,
} from '../src/views/ai-assistant/logic.ts'

assert.equal(
  ASSISTANT_CONFIG_STORAGE_KEY,
  'tapdata.aiAssistant.config',
  'uses a stable storage key',
)

assert.deepEqual(normalizeAssistantConfig({}), DEFAULT_ASSISTANT_CONFIG)

assert.deepEqual(
  normalizeAssistantConfig({
    baseUrl: ' https://api.example.com/v1/ ',
    authToken: ' token ',
    model: ' model-x ',
  }),
  {
    baseUrl: 'https://api.example.com/v1',
    authToken: 'token',
    model: 'model-x',
  },
)

assert.equal(
  extractStreamContent(
    [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}',
      '',
      'data: {"choices":[{"delta":{"content":" world"}}]}',
      '',
      'data: [DONE]',
      '',
    ].join('\n'),
  ),
  'Hello world',
)

assert.equal(
  extractStreamContent(
    [
      'event: message_delta',
      'data: {"content":"Created"}',
      '',
      'event: tool_call_start',
      'data: {"id":"call-1","name":"create_connection","arguments":{"name":"demo"}}',
      '',
      'event: tool_call_result',
      'data: {"id":"call-1","name":"create_connection","result":{"status":"ok"}}',
      '',
      'event: message_delta',
      'data: {"content":" done"}',
      '',
    ].join('\n'),
  ),
  'Created done',
)

assert.equal(extractStreamContent('plain text chunk'), 'plain text chunk')

const firstMessage = createAssistantMessage('user', 'hello')
const secondMessage = createAssistantMessage('assistant', 'hi')
assert.equal(firstMessage.role, 'user')
assert.equal(secondMessage.role, 'assistant')
assert.notEqual(firstMessage.id, secondMessage.id)

const demo = createDemoAssistantMessage('创建连接并查看表')
assert.equal(demo.role, 'assistant')
assert.ok(demo.content.includes('已创建'))
assert.equal(demo.results.length, 3)
assert.equal(demo.results[0].type, 'connection')
assert.equal(demo.results[1].type, 'task')
assert.equal(demo.results[2].type, 'table')

const connectionResults = createAssistantResultsFromToolResult(
  'create_connection',
  {
    id: 'conn-1',
    name: 'demo_mysql',
    databaseType: 'mysql',
    message: 'Connection created successfully',
  },
)
assert.equal(connectionResults.length, 1)
assert.equal(connectionResults[0].type, 'connection')
assert.equal(connectionResults[0].label, 'demo_mysql')
assert.deepEqual(connectionResults[0].route, {
  name: 'connectionsEdit',
  params: { id: 'conn-1' },
})

const listedConnections = createAssistantResultsFromToolResult(
  'listConnection',
  [
    {
      id: 'conn-1',
      name: 'mysql_source',
      databaseType: 'mysql',
      connectionType: 'source',
      tableCount: 12,
    },
    {
      id: 'conn-2',
      name: 'pg_target',
      databaseType: 'postgresql',
      connectionType: 'target',
      tableCount: 8,
    },
  ],
)
assert.equal(listedConnections.length, 2)
assert.equal(listedConnections[0].type, 'connection')
assert.equal(listedConnections[0].label, 'mysql_source')
assert.ok(listedConnections[0].description.includes('mysql'))
assert.ok(listedConnections[0].description.includes('12'))
assert.equal(listedConnections[0].source?.id, 'conn-1')
assert.deepEqual(listedConnections[0].route, {
  name: 'connectionsEdit',
  params: { id: 'conn-1' },
})

const listedModels = createAssistantResultsFromToolResult(
  'listDataModel',
  [
    { id: 'model-1', name: 'orders', type: 'table' },
    { id: 'model-2', collectionName: 'users', type: 'collection' },
  ],
  { connectionId: 'conn-1' },
)
assert.equal(listedModels.length, 2)
assert.equal(listedModels[0].type, 'model')
assert.equal(listedModels[0].label, 'orders')
assert.equal(listedModels[0].metadata?.connectionId, 'conn-1')
assert.equal(listedModels[0].metadata?.metadataId, 'model-1')
assert.equal(listedModels[0].source?.id, 'model-1')

const taskResults = createAssistantResultsFromToolResult('createMigrateTask', {
  taskId: 'task-1',
  taskName: 'mysql_to_pg_sync',
  syncType: 'migrate',
})
assert.equal(taskResults.length, 1)
assert.equal(taskResults[0].type, 'task')
assert.deepEqual(taskResults[0].route, {
  name: 'MigrateEditor',
  params: { id: 'task-1' },
})

const tableResults = createAssistantResultsFromToolResult(
  'sampleData',
  {
    data: [
      { id: 1, name: 'Ada', active: true },
      { id: 2, name: 'Lin', meta: { city: 'Hangzhou' } },
    ],
  },
  { tableName: 'user' },
)
assert.equal(tableResults.length, 1)
assert.equal(tableResults[0].type, 'table')
assert.equal(tableResults[0].label, 'user')
assert.deepEqual(tableResults[0].tablePreview?.columns, [
  'id',
  'name',
  'active',
  'meta',
])
assert.deepEqual(tableResults[0].tablePreview?.rows[0], {
  id: 1,
  name: 'Ada',
  active: 'true',
  meta: '',
})

const resultMessage = createAssistantMessage('assistant', '')
appendAssistantResults(resultMessage, connectionResults)
appendAssistantResults(resultMessage, connectionResults)
assert.equal(resultMessage.results.length, 1)

const toolMessage = createAssistantMessage('assistant', '')
const toolCall = appendAssistantToolCallStart(toolMessage, {
  id: 'call-1',
  name: 'listConnection',
  arguments: { name: 'mysql' },
})
assert.equal(toolMessage.toolCalls.length, 1)
assert.equal(toolCall.status, 'running')
assert.deepEqual(toolCall.arguments, { name: 'mysql' })
assert.equal(toolCall.expanded, false)

const completedToolCall = applyAssistantToolCallResult(toolMessage, {
  id: 'call-1',
  name: 'listConnection',
  result: [{ id: 'conn-1', name: 'mysql_source', databaseType: 'mysql' }],
})
assert.equal(completedToolCall.status, 'success')
assert.equal(completedToolCall.results.length, 1)
assert.equal(completedToolCall.results[0].label, 'mysql_source')
assert.equal(toolMessage.results.length, 1)
assert.equal(
  formatAssistantToolCallJson(completedToolCall),
  JSON.stringify(
    [{ id: 'conn-1', name: 'mysql_source', databaseType: 'mysql' }],
    null,
    2,
  ),
)

assert.deepEqual(takeAssistantDeltaFrame('abcdef', 2), {
  content: 'ab',
  rest: 'cdef',
})
assert.deepEqual(takeAssistantDeltaFrame('abc', 8), {
  content: 'abc',
  rest: '',
})

const richBlocks = buildAssistantContentBlocks(
  '这条连接 mysql_source 里目前有 2 个表：\n- orders\n- users',
  [listedConnections[0], ...listedModels],
)
assert.equal(richBlocks.length, 3)
assert.equal(richBlocks[0].type, 'paragraph')
assert.equal(
  richBlocks[0].parts.find((part) => part.type === 'result')?.result.label,
  'mysql_source',
)
assert.equal(richBlocks[1].type, 'list-item')
assert.equal(
  richBlocks[1].parts.find((part) => part.type === 'result')?.result.label,
  'orders',
)
assert.equal(
  richBlocks[2].parts.find((part) => part.type === 'result')?.result.label,
  'users',
)

console.log('ai-assistant logic tests passed')
