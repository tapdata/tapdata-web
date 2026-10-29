export interface AgentProcessCommandFilter {
  agentType?: string
  status?: string
  page?: number | string
  size?: number | string
  proxyProcessId?: string
  where?: {
    proxyProcessId?: string
    value?: string
  }
}

interface AgentProcessCommandItem {
  proxyProcessId?: string
  agentId?: string
  agentType?: string
  agentName?: string
  advertiseIp?: string
  advertisePort?: number
  startTime?: number | string
  status?: string
}

interface AgentProcessCommandResult {
  total?: number
  items?: AgentProcessCommandItem[]
}

const DEFAULT_PAGE_SIZE = 1000

export function buildAgentProcessCommandParams(
  filter: AgentProcessCommandFilter = {},
) {
  const argMap = {
    agentType: filter.agentType,
    status: filter.status,
    sortBy: 'agentName',
    sortOrder: 'ASC',
    page: toPositiveInteger(filter.page, 1),
    pageSize: toPositiveInteger(filter.size, DEFAULT_PAGE_SIZE),
  }
  const proxyProcessId =
    filter.proxyProcessId || filter.where?.proxyProcessId || filter.where?.value
  if (proxyProcessId) {
    Object.assign(argMap, { proxyProcessId })
  }

  return {
    type: 'agent-process',
    command: 'list',
    action: 'list',
    argMap,
  }
}

export function mapAgentProcessCommandResult(
  result?: AgentProcessCommandResult,
) {
  const sourceItems = Array.isArray(result?.items) ? result.items : []
  const items = sourceItems
    .filter((item) => Boolean(item?.proxyProcessId))
    .map((item) => ({
      value: item.proxyProcessId as string,
      label: item.agentName || item.proxyProcessId,
      // Keep the TM result unchanged. Field semantics belong to the data source.
      proxyProcessInfo: { ...item },
    }))
  const total = Number.isFinite(result?.total)
    ? Number(result?.total)
    : items.length
  return { items, total }
}

export async function loadAgentProcessCommandList(
  filter: AgentProcessCommandFilter = {},
) {
  try {
    const { commandAgentProcessList } = await import('./proxy')
    const result = await commandAgentProcessList(
      buildAgentProcessCommandParams(filter),
    )
    return mapAgentProcessCommandResult(result)
  } catch {
    return { items: [], total: 0 }
  }
}

function toPositiveInteger(
  value: number | string | undefined,
  fallback: number,
) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}
