import type {
  BatchUpdateConnectionAgentSettingsParams,
  ConnectionAgentConflictReport,
} from '@tap/api/src/core/connections'

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
