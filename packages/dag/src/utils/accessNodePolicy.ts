type AccessNodeOption = {
  value: string
  accessNodeType: string
  disabled?: boolean
  children?: AccessNodeOption[]
}

type AccessNodeInfo = {
  processId?: string
  agentName?: string
  hostName?: string
  hostname?: string
  displayName?: string
  systemInfo?: {
    hostname?: string
  }
  accessNodeName?: string
  accessNodes?: AccessNodeInfo[]
}

type ConnectionAgentConfig = {
  accessNodeType?: string
  accessNodeProcessId?: string
  accessNodeProcessIdList?: string[]
}

const AUTOMATIC_ALLOCATION = 'AUTOMATIC_PLATFORM_ALLOCATION'
const AGENT_GROUP_KEY_PREFIX = '__agent_group__:'

function getAgentGroupKey(processIds: string[] = []) {
  return `${AGENT_GROUP_KEY_PREFIX}${[...new Set(processIds.filter(Boolean))].sort().join(',')}`
}

export function getAccessNodeDisplayName(accessNode: AccessNodeInfo = {}) {
  return (
    accessNode.agentName ||
    accessNode.displayName ||
    accessNode.accessNodeName ||
    accessNode.hostName ||
    accessNode.systemInfo?.hostname ||
    accessNode.hostname
  )
}

export function createAccessNodeInfoMap(accessNodeInfo: AccessNodeInfo[] = []) {
  return accessNodeInfo.reduce<Record<string, AccessNodeInfo>>((map, item) => {
    if (item.processId) {
      map[item.processId] = {
        ...item,
        displayName: getAccessNodeDisplayName(item),
      }
    }
    item.accessNodes?.forEach((accessNode) => {
      if (accessNode.processId) {
        map[accessNode.processId] = {
          ...accessNode,
          displayName: getAccessNodeDisplayName(accessNode),
        }
      }
    })
    if (item.accessNodes?.length) {
      map[
        getAgentGroupKey(
          item.accessNodes.map(({ processId }) => processId || ''),
        )
      ] = { ...item, displayName: getAccessNodeDisplayName(item) }
    }
    return map
  }, {})
}

export function getCompatibleAccessNodeOptions(
  agents: AccessNodeOption[],
  connections: ConnectionAgentConfig[],
  accessNodeType: string,
) {
  const getConfiguredProcessIds = (connection: ConnectionAgentConfig) =>
    connection.accessNodeProcessId
      ? [connection.accessNodeProcessId]
      : connection.accessNodeProcessIdList?.filter(Boolean) || []

  const candidates = agents.filter(
    (agent) => agent.accessNodeType === accessNodeType,
  )
  const configuredConnections = connections.filter(
    (connection) =>
      getConfiguredProcessIds(connection).length > 0 &&
      connection.accessNodeType !== AUTOMATIC_ALLOCATION,
  )

  if (!configuredConnections.length) return candidates

  const allowedAgentSets = configuredConnections.map((connection) => {
    return new Set(
      getConfiguredProcessIds(connection).flatMap((processId) => {
        const configuredAgent = agents.find(
          (agent) => agent.value === processId,
        )

        return configuredAgent?.children
          ? configuredAgent.children
              .filter((child) => !child.disabled)
              .map((child) => child.value)
          : [processId]
      }),
    )
  })

  const compatibleAgentIds = allowedAgentSets
    .slice(1)
    .reduce(
      (intersection, allowedIds) =>
        new Set([...intersection].filter((id) => allowedIds.has(id))),
      allowedAgentSets[0]!,
    )

  return candidates.flatMap((candidate) => {
    if (candidate.children) {
      const availableChildren = candidate.children.filter(
        (child) => !child.disabled,
      )
      const children = candidate.children.filter((child) =>
        compatibleAgentIds.has(child.value),
      )

      if (
        !availableChildren.length ||
        availableChildren.some((child) => !compatibleAgentIds.has(child.value))
      ) {
        return []
      }

      return children.length ? [{ ...candidate, children }] : []
    }

    return compatibleAgentIds.has(candidate.value) ? [candidate] : []
  })
}
