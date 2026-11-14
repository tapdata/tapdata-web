import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildAgentProcessCommandParams,
  mapAgentProcessCommandResult,
} from './agent-process-command.ts'

test('builds the TM agent process list command with AsyncSelect pagination', () => {
  assert.deepEqual(
    buildAgentProcessCommandParams({
      agentType: 'Db2 for z cdc reader',
      status: 'RUNNING',
      page: 2,
      size: 25,
    }),
    {
      type: 'agent-process',
      command: 'list',
      action: 'list',
      argMap: {
        agentType: 'Db2 for z cdc reader',
        status: 'RUNNING',
        sortBy: 'agentName',
        sortOrder: 'ASC',
        page: 2,
        pageSize: 25,
      },
    },
  )
})

test('maps proxy process DTOs to AsyncSelect options', () => {
  assert.deepEqual(
    mapAgentProcessCommandResult({
      total: 1,
      items: [
        {
          proxyProcessId: 'proxy-1',
          agentId: 'agent-1',
          agentType: 'Db2 for z cdc reader',
          agentName: 'zos-proxy-1',
          advertiseIp: '192.0.2.10',
          advertisePort: 8080,
          startTime: 1761724800000,
          status: 'RUNNING',
        },
      ],
    }),
    {
      total: 1,
      items: [
        {
          value: 'proxy-1',
          label: 'zos-proxy-1',
          proxyProcessInfo: {
            proxyProcessId: 'proxy-1',
            agentId: 'agent-1',
            agentType: 'Db2 for z cdc reader',
            agentName: 'zos-proxy-1',
            advertiseIp: '192.0.2.10',
            advertisePort: 8080,
            startTime: 1761724800000,
            status: 'RUNNING',
          },
        },
      ],
    },
  )
})

test('maps AsyncSelect exact-value rehydration to a TM proxy process filter', () => {
  assert.deepEqual(
    buildAgentProcessCommandParams({
      agentType: 'Db2 for z cdc reader',
      status: 'RUNNING',
      where: { proxyProcessId: 'proxy-1' },
    }).argMap.proxyProcessId,
    'proxy-1',
  )
})

test('maps AsyncSelect value rehydration to a TM proxy process filter', () => {
  assert.deepEqual(
    buildAgentProcessCommandParams({
      where: { value: 'proxy-1' },
    }).argMap.proxyProcessId,
    'proxy-1',
  )
})

test('returns an empty page for missing or empty TM results', () => {
  assert.deepEqual(mapAgentProcessCommandResult(), { items: [], total: 0 })
  assert.deepEqual(mapAgentProcessCommandResult({ items: [] }), {
    items: [],
    total: 0,
  })
})
