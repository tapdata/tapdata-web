import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatAgentProcessEndpoint,
  getAgentProcessErrorReason,
  getAgentProcessInfo,
  getAgentProcessStatusPresentation,
} from './agent-process-status.ts'

const translate = (key) => `translated:${key}`

test('maps agent process statuses to translated labels and tag types', () => {
  assert.deepEqual(getAgentProcessStatusPresentation('RUNNING', translate), {
    text: 'translated:public_status_running',
    type: 'success',
  })
  assert.deepEqual(getAgentProcessStatusPresentation('FAILED', translate), {
    text: 'translated:public_status_failed',
    type: 'danger',
  })
  assert.deepEqual(getAgentProcessStatusPresentation('OFFLINE', translate), {
    text: 'translated:public_agent_status_offline',
    type: 'info',
  })
  assert.deepEqual(getAgentProcessStatusPresentation('CUSTOM', translate), {
    text: '',
    type: 'info',
  })
})

test('unwraps the proxy process snapshot from an AsyncSelect option', () => {
  const proxyProcessInfo = {
    agentName: 'zos-proxy-1',
    status: 'RUNNING',
    advertiseIp: '192.0.2.10',
    advertisePort: 8080,
  }

  assert.deepEqual(
    getAgentProcessInfo({
      value: 'proxy-1',
      label: 'zos-proxy-1',
      proxyProcessInfo,
    }),
    proxyProcessInfo,
  )
})

test('returns an error reason only for failed agent processes', () => {
  assert.equal(
    getAgentProcessErrorReason({
      proxyProcessInfo: {
        status: 'FAILED',
        errorReason: 'CDC listener stopped unexpectedly',
      },
    }),
    'CDC listener stopped unexpectedly',
  )
  assert.equal(
    getAgentProcessErrorReason({
      proxyProcessInfo: {
        status: 'RUNNING',
        errorReason: 'old error',
      },
    }),
    '',
  )
})

test('formats IPv4 and IPv6 agent process endpoints for the address tag', () => {
  assert.equal(
    formatAgentProcessEndpoint({
      advertiseIp: '192.0.2.10',
      advertisePort: 8080,
    }),
    '192.0.2.10:8080',
  )
  assert.equal(
    formatAgentProcessEndpoint({
      advertiseIp: '2001:db8::10',
      advertisePort: 8080,
    }),
    '[2001:db8::10]:8080',
  )
  assert.equal(formatAgentProcessEndpoint({ advertiseIp: '192.0.2.10' }), '')
})
