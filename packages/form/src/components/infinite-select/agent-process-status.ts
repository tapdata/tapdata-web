export interface AgentProcessNetworkInfo {
  advertiseIp?: unknown
  advertisePort?: unknown
}

export interface AgentProcessInfo extends AgentProcessNetworkInfo {
  agentName?: unknown
  errorReason?: unknown
  proxyProcessId?: unknown
  status?: unknown
}

export interface AgentProcessOption extends AgentProcessInfo {
  proxyProcessInfo?: AgentProcessInfo
}

export interface AgentProcessStatusPresentation {
  text: string
  type: 'success' | 'danger' | 'info'
}

type Translate = (key: string) => string

const STATUS_PRESENTATION: Record<
  string,
  { key: string; type: AgentProcessStatusPresentation['type'] }
> = {
  RUNNING: { key: 'public_status_running', type: 'success' },
  FAILED: { key: 'public_status_failed', type: 'danger' },
  OFFLINE: { key: 'public_agent_status_offline', type: 'info' },
}

export function getAgentProcessStatusPresentation(
  status: unknown,
  translate: Translate,
): AgentProcessStatusPresentation {
  const statusValue = String(status ?? '')
    .trim()
    .toUpperCase()
  const presentation = STATUS_PRESENTATION[statusValue]

  return {
    text: presentation ? translate(presentation.key) : '',
    type: presentation?.type || 'info',
  }
}

export function getAgentProcessInfo(
  item?: AgentProcessOption,
): AgentProcessInfo {
  return item?.proxyProcessInfo || item || {}
}

export function getAgentProcessErrorReason(item?: AgentProcessOption): string {
  const process = getAgentProcessInfo(item)
  const status = String(process.status ?? '')
    .trim()
    .toUpperCase()

  if (status !== 'FAILED') return ''
  return String(process.errorReason ?? '').trim()
}

export function formatAgentProcessEndpoint(
  process?: AgentProcessNetworkInfo,
): string {
  const ip = String(process?.advertiseIp ?? '').trim()
  const port = String(process?.advertisePort ?? '').trim()

  if (!ip || !port) return ''

  const host = ip.includes(':') && !ip.startsWith('[') ? `[${ip}]` : ip
  return `${host}:${port}`
}
