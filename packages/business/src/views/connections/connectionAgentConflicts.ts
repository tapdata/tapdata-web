import type {
  BatchUpdateConnectionAgentSettingsParams,
  ConnectionAgentConflictReport,
} from '@tap/api/src/core/connections'

type ConflictTask = ConnectionAgentConflictReport['items'][number]

export function snapshotConflictTasks(
  items: Array<
    Pick<
      ConflictTask,
      'id' | 'name' | 'revision' | 'editable' | 'allowedAgentProcessIds'
    >
  >,
) {
  return items.map(
    ({ id, name, revision, editable, allowedAgentProcessIds }) => ({
      id,
      name,
      revision,
      editable,
      allowedAgentProcessIds: allowedAgentProcessIds
        ? [...allowedAgentProcessIds]
        : allowedAgentProcessIds,
    }),
  )
}

export function commonAllowedAgentProcessIds(
  items: Array<{ allowedAgentProcessIds?: string[] | null }>,
): string[] | null {
  const restricted = items
    .map((item) => item.allowedAgentProcessIds)
    .filter((ids): ids is string[] => Array.isArray(ids))
  if (!restricted.length) return null
  return restricted[0].filter((id) =>
    restricted.every((ids) => ids.includes(id)),
  )
}

export function filterAllowedAgentOptions<
  T extends {
    value: string
    accessNodeType?: string
    children?: T[]
  },
>(options: T[], allowedAgentProcessIds?: string[] | null): T[] {
  if (!allowedAgentProcessIds) return options
  return options.flatMap((option) => {
    if (
      option.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
    ) {
      const children = option.children?.filter((child) =>
        allowedAgentProcessIds.includes(child.value),
      )
      return children?.length ? [{ ...option, children }] : []
    }
    return allowedAgentProcessIds.includes(option.value) ? [option] : []
  })
}

export function agentCheckPayload(
  connectionIds: string[],
  settings: Record<string, unknown>,
  requestId = '',
): BatchUpdateConnectionAgentSettingsParams {
  const type = String(
    settings.accessNodeType || 'AUTOMATIC_PLATFORM_ALLOCATION',
  )
  const clean = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value.trim() : null
  return {
    requestId,
    connectionIds: [...connectionIds],
    settings: {
      accessNodeType: type,
      accessNodeProcessId:
        type === 'AUTOMATIC_PLATFORM_ALLOCATION'
          ? null
          : clean(settings.accessNodeProcessId),
      priorityProcessId:
        type === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
          ? clean(settings.priorityProcessId)
          : null,
    },
  }
}

export function agentConflictReport(
  value: any,
): ConnectionAgentConflictReport | null {
  const candidates = [
    value,
    value?.data,
    value?.response?.data,
    value?.response?.data?.data,
  ]
  const report = candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate.hasConflicts === 'boolean' &&
      Array.isArray(candidate.items) &&
      Number.isFinite(candidate.total) &&
      candidate.total >= 0,
  )
  if (!report) return null
  const hiddenCount =
    Number.isFinite(report.hiddenCount) && report.hiddenCount > 0
      ? report.hiddenCount
      : 0
  return {
    ...report,
    hiddenCount,
    hasConflicts: report.hasConflicts || report.total > 0 || hiddenCount > 0,
  }
}

export async function saveConnectionWithConflictRetry(
  payload: BatchUpdateConnectionAgentSettingsParams,
  save: () => Promise<unknown>,
  openDialog: (
    payload: BatchUpdateConnectionAgentSettingsParams,
    report: ConnectionAgentConflictReport,
  ) => Promise<boolean>,
): Promise<boolean> {
  while (true) {
    try {
      await save()
      return true
    } catch (error) {
      const report = agentConflictReport(error)
      if (!report?.hasConflicts) throw error
      if (!(await openDialog(payload, report))) return false
    }
  }
}

export const conflictTaskRoutes: Record<string, string> = {
  sync: 'dataflowList',
  migrate: 'migrateList',
  logCollector: 'sharedMiningList',
  connHeartbeat: 'HeartbeatTableList',
  inspect: 'dataVerificationList',
}

export function taskAgentEdits(
  items: Array<{ id: string; editable: boolean; revision: number | null }>,
) {
  return items
    .filter((item) => item.editable)
    .map(({ id, revision }) => ({ id, revision }))
}

export function conflictTaskDestination(item: {
  id: string
  syncType: string
  editable: boolean
  canEdit?: boolean
  status: string
}) {
  const editable =
    item.canEdit &&
    ['edit', 'ready', 'stop', 'wait_start', 'stopped'].includes(item.status)
  if (editable) {
    if (item.syncType === 'sync' || item.syncType === 'migrate')
      return {
        name: item.syncType === 'sync' ? 'DataflowEditor' : 'MigrateEditor',
        params: { id: item.id },
        query: { settingsTab: 'agent' },
      }
    if (item.syncType === 'logCollector')
      return { name: 'sharedMiningList', query: { editTaskId: item.id } }
    if (item.syncType === 'inspect')
      return { name: 'dataVerificationEdit', params: { id: item.id } }
    // Heartbeat has no dedicated editor; use the inline Agent editor.
    if (item.syncType === 'connHeartbeat') return null
  }
  const viewers: Record<string, string> = {
    sync: 'TaskMonitor',
    migrate: 'MigrationMonitor',
    logCollector: 'SharedMiningMonitor',
    connHeartbeat: 'HeartbeatMonitor',
    inspect: 'dataVerifyDetails',
  }
  const name = viewers[item.syncType]
  return name ? { name, params: { id: item.id } } : null
}

export function automaticConflictTasks(
  items: Array<{ id: string; editable: boolean; autoResolvable?: boolean }>,
) {
  return items.filter((item) => item.editable && item.autoResolvable === true)
}
