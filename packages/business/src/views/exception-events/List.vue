<script setup lang="ts">
import {
  fetchDlqEventDetail,
  fetchDlqEvents,
  fetchDlqEventSummary,
  previewDlqRecovery,
  startDlqRecovery,
  type DlqEvent,
  type DlqEventDetail,
  type DlqEventQueryParams,
  type DlqEventStatus,
  type DlqRecoveryAttempt,
  type DlqRecoveryPreview,
  type DlqTaskSyncType,
} from '@tap/api/src/core/dlq-event'
import { getTaskById } from '@tap/api/src/core/task'
import { FilterBar } from '@tap/component/src/filter-bar'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import { getDlqEventStatusWarning } from './components/event-status-presentation'
import EventStatusTag from './components/EventStatusTag.vue'
import SummaryTabs from './components/SummaryTabs.vue'
import {
  fetchMockDlqEventDetail,
  fetchMockDlqEvents,
  fetchMockDlqSummary,
  previewMockDlqRecovery,
  startMockDlqRecovery,
} from './mock'
import {
  canSubmitRecoveryPreview,
  getRecoveryPreviewIssueGroups,
  removeRecoveryPreviewEvent,
} from './recovery-preview-presentation'
import {
  displayDlqTaskName,
  DLQ_TASK_NAME_LIST_MAX_LENGTH,
  getDlqTaskNameTooltipContent,
  shouldShowDlqTaskNameTooltip,
} from './task-name-presentation'

const { t } = useI18n()
const isMockMode =
  import.meta.env.DEV && import.meta.env.VITE_DLQ_EVENT_API === 'mock'
const route = useRoute()
const router = useRouter()
const table = ref<InstanceType<typeof TablePage>>()
const selectedRows = ref<DlqEvent[]>([])
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<DlqEventDetail>()
const detailStatusWarning = computed(() =>
  detail.value
    ? getDlqEventStatusWarning(
        detail.value.status,
        detail.value.notReprocessableReason,
      )
    : undefined,
)
const detailStatusWarning = computed(() =>
  detail.value
    ? getDqlEventStatusWarning(
        detail.value.status,
        detail.value.notReprocessableReason,
      )
    : undefined,
)
const recoveryVisible = ref(false)
const recoveryLoading = ref(false)
const recoveryDetail = ref<DlqEventDetail>()
const previewVisible = ref(false)
const previewLoading = ref(false)
const preview = ref<DlqRecoveryPreview>()
const previewEventIds = ref<string[]>([])
const previewIssueGroups = computed(() => {
  if (!preview.value) return { riskyEvents: [], blockedEvents: [] }
  return getRecoveryPreviewIssueGroups(preview.value)
})
const previewCanSubmit = computed(() => {
  if (!preview.value) return false
  return canSubmitRecoveryPreview({
    canSubmit: preview.value.canSubmit,
    orderedEvents: preview.value.orderedEvents,
    blockedEvents: previewIssueGroups.value.blockedEvents,
  })
})
const previewEventIds = ref<string[]>([])
const previewIssueGroups = computed(() => {
  if (!preview.value) return { riskyEvents: [], blockedEvents: [] }
  return getRecoveryPreviewIssueGroups(preview.value)
})
const previewCanSubmit = computed(() => {
  if (!preview.value) return false
  return canSubmitRecoveryPreview({
    canSubmit: preview.value.canSubmit,
    orderedEvents: preview.value.orderedEvents,
    blockedEvents: previewIssueGroups.value.blockedEvents,
  })
})
const submitting = ref(false)
const status = ref<DlqEventStatus>()
const order = ref('failedAt DESC')
let refreshTimer: ReturnType<typeof setInterval> | undefined
let detailRefreshTimer: ReturnType<typeof setInterval> | undefined
let recoveryRefreshTimer: ReturnType<typeof setInterval> | undefined

interface DlqEventFilters {
  keyword: string
  errorCode: string
  eventId: string
  taskId: string
  taskName: string
  sourceTable: string
  targetTable: string
  dmlType: '' | 'I' | 'U' | 'D'
  errorType: '' | DlqEventQueryParams['errorType']
  startTime: string
  endTime: string
}

const filters = ref<DlqEventFilters>({
  keyword: '',
  errorCode: '',
  eventId: '',
  taskId: '',
  taskName: '',
  sourceTable: '',
  targetTable: '',
  dmlType: '',
  errorType: '',
  startTime: '',
  endTime: '',
})
const summary = ref({
  total: 0,
  pending: 0,
  reprocessing: 0,
  recovered: 0,
  recoveryFailed: 0,
  notReprocessable: 0,
})

const errorTypeOptions = [
  {
    label: t('packages_business_exception_events_error_target_write'),
    value: 'TARGET_WRITE_ERROR',
  },
  {
    label: t('packages_business_exception_events_error_transform'),
    value: 'TRANSFORM_ERROR',
  },
  {
    label: t('packages_business_exception_events_error_poison_record'),
    value: 'POISON_RECORD',
  },
  {
    label: t('packages_business_exception_events_error_malformed_record'),
    value: 'MALFORMED_RECORD',
  },
  {
    label: t('packages_business_exception_events_error_unknown_record'),
    value: 'UNKNOWN_RECORD_ERROR',
  },
] as const

const filterItems = [
  {
    placeholder: t('packages_business_exception_events_search_placeholder'),
    key: 'keyword',
    type: 'input',
    debounce: 0,
    searchOnBlur: true,
  },
  {
    placeholder: t('packages_business_exception_events_error_code'),
    key: 'errorCode',
    type: 'input',
    debounce: 0,
    searchOnBlur: true,
  },
  {
    placeholder: t('packages_business_exception_events_task_name'),
    key: 'taskName',
    type: 'input',
    debounce: 0,
    searchOnBlur: true,
  },
  {
    label: 'DML',
    key: 'dmlType',
    type: 'select-inner',
    items: [
      {
        label: t('packages_business_exception_events_dml_insert'),
        value: 'I',
      },
      {
        label: t('packages_business_exception_events_dml_update'),
        value: 'U',
      },
      {
        label: t('packages_business_exception_events_dml_delete'),
        value: 'D',
      },
    ],
  },
]

const advancedFilterCount = computed(
  () =>
    [
      filters.value.sourceTable,
      filters.value.targetTable,
      filters.value.errorType,
      filters.value.startTime || filters.value.endTime,
    ].filter(Boolean).length,
)
const failedTimeRange = computed({
  get: () => {
    const { startTime, endTime } = filters.value
    return startTime || endTime ? [startTime, endTime] : undefined
  },
  set: (value?: string[]) => {
    filters.value.startTime = value?.[0] || ''
    filters.value.endTime = value?.[1] || ''
  },
})
const canReprocess = (event: any) =>
  ['PENDING', 'RECOVERY_FAILED'].includes(event.status)
const hasRecoveryHistory = (event: any) =>
  event.status === 'REPROCESSING' || event.recoveryCount > 0
const selectedTaskId = computed(() => selectedRows.value[0]?.taskId)
const selectable = (event: DlqEvent) =>
  canReprocess(event) &&
  (!selectedTaskId.value || selectedTaskId.value === event.taskId)
const recoveryAttemptMeta = (result: DlqRecoveryAttempt['result']) =>
  (
    ({
      RUNNING: {
        label: t('packages_business_exception_events_recovery_running'),
        type: 'primary',
      },
      SUCCESS: {
        label: t('packages_business_exception_events_recovery_success'),
        type: 'success',
      },
      FAILED: {
        label: t('packages_business_exception_events_recovery_failed'),
        type: 'danger',
      },
      SKIPPED: {
        label: t('packages_business_exception_events_recovery_skipped'),
        type: 'info',
      },
      TIMEOUT: {
        label: t('packages_business_exception_events_recovery_timeout'),
        type: 'warning',
      },
    }) as const
  )[result]
const recoveryView = {
  title: t('packages_business_exception_events_recovery_records'),
  sectionTitle: t('packages_business_exception_events_recovery_records'),
  emptyText: t('packages_business_exception_events_recovery_records_empty'),
  refreshLabel: t(
    'packages_business_exception_events_refresh_recovery_records',
  ),
}
const recoveryAttempts = computed(() => {
  const attempts = [...(recoveryDetail.value?.recoveryAttempts || [])]
  if (recoveryDetail.value?.status !== 'REPROCESSING') return attempts

  const runningIndex = attempts.findIndex((item) => item.result === 'RUNNING')
  if (runningIndex <= 0) return attempts

  const running = attempts[runningIndex]
  if (!running) return attempts

  attempts.splice(runningIndex, 1)
  attempts.unshift(running)
  return attempts
})
const errorTypeLabel = (type: DlqEvent['errorType']) =>
  ({
    MALFORMED_RECORD: t(
      'packages_business_exception_events_error_malformed_record',
    ),
    POISON_RECORD: t('packages_business_exception_events_error_poison_record'),
    TRANSFORM_ERROR: t('packages_business_exception_events_error_transform'),
    TARGET_WRITE_ERROR: t(
      'packages_business_exception_events_error_target_write',
    ),
    UNKNOWN_RECORD_ERROR: t(
      'packages_business_exception_events_error_unknown_record',
    ),
  })[type]
const formatKeyValue = (value: unknown) => {
  if (value === null) return 'null'
  if (value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
const formatEventKey = (eventKey?: string) => {
  if (!eventKey) return '-'

  try {
    const values = JSON.parse(eventKey)
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      return String(eventKey)
    }

    return (
      Object.entries(values)
        .map(([key, value]) => [key, formatKeyValue(value)].join('='))
        .join('\n') || '-'
    )
  } catch {
    return eventKey
  }
}
const previewTaskGroups = computed(() => {
  const groups = new Map<
    string,
    {
      taskId: string
      taskName: string
      events: DlqEvent[]
    }
  >()

  for (const event of preview.value?.orderedEvents || []) {
    const group = groups.get(event.taskId)

    if (group) {
      group.events.push(event)
    } else {
      groups.set(event.taskId, {
        taskId: event.taskId,
        taskName: event.taskName,
        events: [event],
      })
    }
  }

  return [...groups.values()].map((group) => ({
    ...group,
    routes: [
      ...new Set(
        group.events.map(
          (event) => `${event.sourceTable} → ${event.targetTable}`,
        ),
      ),
    ],
  }))
})

const getQueryFilters = (): DlqEventQueryParams =>
  Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => value !== ''),
  ) as DlqEventQueryParams

const getList = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const params = {
    ...getQueryFilters(),
    status: status.value,
    skip: (page.current - 1) * page.size,
    limit: page.size,
    order: order.value,
  }
  const data = isMockMode
    ? await fetchMockDlqEvents(params)
    : await fetchDlqEvents(params)
  return { data: data?.items || [], total: data?.total || 0 }
}

const refreshSummary = async () => {
  summary.value = isMockMode
    ? await fetchMockDlqSummary(getQueryFilters())
    : await fetchDlqEventSummary(getQueryFilters())
}

const refresh = (passive = false) => {
  table.value?.fetch(1, 0, passive)
  refreshSummary()
}

const handleStatusChange = (value?: DlqEventStatus) => {
  status.value = value
  router.replace({ query: { ...route.query, status: value || undefined } })
  refresh()
}

const handleFilterFetch = () => {
  const query = Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => value !== ''),
  )
  router.replace({
    query: { ...query, status: status.value || undefined },
  })
  refresh()
}

const handleSortTable = ({
  order: sortOrder,
  prop,
}: {
  order: string | null
  prop: string
}) => {
  order.value = `${sortOrder ? prop : 'failedAt'} ${sortOrder === 'ascending' ? 'ASC' : 'DESC'}`
  table.value?.fetch(1)
}

const filterBarKeys = ['keyword', 'errorCode', 'taskName', 'dmlType'] as const

const updateFilterBarValue = (value: Partial<DlqEventFilters>) => {
  const nextFilters = { ...filters.value }
  filterBarKeys.forEach((key) => {
    nextFilters[key] = (value[key] || '') as never
  })
  filters.value = nextFilters
}

const clearAdvancedFilters = () => {
  filters.value.sourceTable = ''
  filters.value.targetTable = ''
  filters.value.errorType = ''
  filters.value.startTime = ''
  filters.value.endTime = ''
  handleFilterFetch()
}

const handleSelectionChange = (rows: DlqEvent[]) => {
  if (rows.length > 1 && new Set(rows.map((item) => item.taskId)).size > 1) {
    ElMessage.warning(
      t('packages_business_exception_events_same_task_selection_warning'),
    )
    table.value?.clearSelection()
    selectedRows.value = []
    return
  }
  selectedRows.value = rows
}

const stopDetailPolling = () => {
  if (detailRefreshTimer) clearInterval(detailRefreshTimer)
  detailRefreshTimer = undefined
}

const startDetailPolling = () => {
  if (detailRefreshTimer || !detail.value?.eventId) return
  detailRefreshTimer = setInterval(
    () => refreshDetail(detail.value?.eventId, true),
    3_000,
  )
}

const stopRecoveryPolling = () => {
  if (recoveryRefreshTimer) clearInterval(recoveryRefreshTimer)
  recoveryRefreshTimer = undefined
}

const startRecoveryPolling = () => {
  if (recoveryRefreshTimer || !recoveryDetail.value?.eventId) return
  recoveryRefreshTimer = setInterval(
    () => refreshRecovery(recoveryDetail.value?.eventId, true),
    3_000,
  )
}

const refreshDetail = async (eventId?: string, passive = false) => {
  if (!eventId) return
  if (!passive) detailLoading.value = true
  try {
    detail.value = isMockMode
      ? await fetchMockDlqEventDetail(eventId)
      : await fetchDlqEventDetail(eventId)
  } finally {
    detailLoading.value = false
  }
  if (detail.value?.status === 'REPROCESSING') startDetailPolling()
  else stopDetailPolling()
}

const refreshRecovery = async (eventId?: string, passive = false) => {
  if (!eventId) return
  if (!passive) recoveryLoading.value = true
  try {
    recoveryDetail.value = isMockMode
      ? await fetchMockDlqEventDetail(eventId)
      : await fetchDlqEventDetail(eventId)
  } finally {
    recoveryLoading.value = false
  }
  if (recoveryDetail.value?.status === 'REPROCESSING') startRecoveryPolling()
  else stopRecoveryPolling()
}

// TablePage exposes untyped DefaultRow values through its slots; these handlers
// are the runtime boundary where the DLQ row contract is consumed.
const openDetail = async (event: any) => {
  detailVisible.value = true
  detail.value = undefined
  await refreshDetail(event.eventId)
}

const openRecovery = async (event: any) => {
  recoveryVisible.value = true
  recoveryDetail.value = undefined
  await refreshRecovery(event.eventId)
}

const taskSyncTypeCache = new Map<string, DlqTaskSyncType>()

const resolveTaskSyncType = async (event: DlqEvent) => {
  if (event.syncType) return event.syncType

  const cached = taskSyncTypeCache.get(event.taskId)
  if (cached) return cached

  const task = await getTaskById(event.taskId, {
    fields: JSON.stringify({ name: true, syncType: true }),
  })
  const syncType = task?.syncType as DlqTaskSyncType | undefined
  if (syncType) taskSyncTypeCache.set(event.taskId, syncType)
  return syncType
}

const openTaskMonitor = async (event: any) => {
  let syncType: DlqTaskSyncType | undefined
  try {
    syncType = await resolveTaskSyncType(event)
  } catch {
    ElMessage.error(
      t('packages_business_exception_events_task_type_fetch_error'),
    )
    return
  }

  if (!syncType) {
    ElMessage.warning(t('packages_business_exception_events_task_type_missing'))
    return
  }

  const { href } = router.resolve({
    name: syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor',
    params: { id: event.taskId },
  })
  window.open(href, '_blank')
}

const loadPreview = async (eventIds: string[]) => {
  previewLoading.value = true
  try {
    preview.value = isMockMode
      ? await previewMockDlqRecovery(eventIds)
      : await previewDlqRecovery(eventIds)
  } finally {
    previewLoading.value = false
  }
}

const openPreview = async (events: any[]) => {
  if (!events.length) return
  if (new Set(events.map((item) => item.taskId)).size > 1) {
    ElMessage.warning(
      t('packages_business_exception_events_same_task_selection_required'),
    )
    return
  }
  const ids = events.map((item) => item.eventId)
  previewEventIds.value = ids
  preview.value = undefined
  previewVisible.value = true
  await loadPreview(ids)
}

const removePreviewEvent = async (eventId: string) => {
  const nextEventIds = removeRecoveryPreviewEvent(
    previewEventIds.value,
    eventId,
  )
  const selectedEvent = selectedRows.value.find(
    (event) => event.eventId === eventId,
  )
  if (selectedEvent) table.value?.toggleRowSelection(selectedEvent, false)
  selectedRows.value = selectedRows.value.filter(
    (event) => event.eventId !== eventId,
  )
  previewEventIds.value = nextEventIds

  if (!nextEventIds.length) {
    previewVisible.value = false
    preview.value = undefined
    return
  }

  await loadPreview(nextEventIds)
}

const submitRecovery = async () => {
  const currentPreview = preview.value
  if (!currentPreview || !previewCanSubmit.value) return
  submitting.value = true
  try {
    const ids = currentPreview.orderedEvents.map((item) => item.eventId)
    await (isMockMode
      ? await startMockDlqRecovery(ids)
      : await startDlqRecovery(ids))
    previewVisible.value = false
    selectedRows.value = []
    table.value?.clearSelection()
    ElMessage.success(
      t('packages_business_exception_events_recovery_submitted'),
    )
    refresh()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const routeFilters: Partial<DlqEventFilters> = {}
  Object.entries(filters.value).forEach(([key]) => {
    const value = route.query[key]
    if (typeof value === 'string') {
      routeFilters[key as keyof DlqEventFilters] = value as never
    }
  })
  filters.value = { ...filters.value, ...routeFilters }
  const routeStatus = route.query.status
  if (typeof routeStatus === 'string')
    status.value = routeStatus as DlqEventStatus
  refreshSummary()
  refreshTimer = setInterval(() => {
    if (summary.value.reprocessing) refresh(true)
  }, 8_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  stopDetailPolling()
  stopRecoveryPolling()
})
</script>

<template>
  <PageContainer>
    <template #title>
      <div class="flex align-center gap-2">
        <span class="fs-5 font-color-dark lh-8">
          {{ t('packages_business_exception_events_title') }}
        </span>
        <el-tag v-if="isMockMode" size="small" type="info" effect="plain">
          {{ t('packages_business_exception_events_mock_data') }}
        </el-tag>
      </div>
    </template>

    <TablePage
      ref="table"
      row-key="eventId"
      :remote-method="getList"
      :default-sort="{ prop: 'failedAt', order: 'descending' }"
      enable-custom-columns="exceptionEvents"
      :locked-columns="['operation']"
      :default-hidden-columns="['targetTable', 'eventTime', 'lastRecoveryTime']"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <template #nav>
        <SummaryTabs
          :model-value="status"
          :summary="summary"
          @update:model-value="handleStatusChange"
        />
      </template>
      <template #search>
        <div class="exception-event-filters">
          <FilterBar
            :value="filters"
            :items="filterItems"
            hide-refresh
            :change-route="false"
            @update:value="updateFilterBarValue"
            @search="handleFilterFetch"
            @fetch="handleFilterFetch"
          />
          <el-popover placement="bottom-start" :width="360" trigger="click">
            <template #reference>
              <el-button class="exception-event-filters__more">
                <template #icon><i-lucide-sliders-horizontal /></template>
                {{ t('packages_business_exception_events_more_filters') }}
                <span
                  v-if="advancedFilterCount"
                  class="exception-event-filters__count"
                >
                  {{ advancedFilterCount }}
                </span>
              </el-button>
            </template>
            <div class="advanced-filters">
              <div class="advanced-filters__heading">
                <div>
                  <strong>
                    {{ t('packages_business_exception_events_more_filters') }}
                  </strong>
                  <span>
                    {{
                      t(
                        'packages_business_exception_events_more_filters_description',
                      )
                    }}
                  </span>
                </div>
                <el-button text @click="clearAdvancedFilters">
                  {{ t('packages_business_exception_events_clear') }}
                </el-button>
              </div>
              <el-input
                v-model="filters.sourceTable"
                :placeholder="
                  t(
                    'packages_business_exception_events_source_table_placeholder',
                  )
                "
                clearable
              />
              <el-input
                v-model="filters.targetTable"
                :placeholder="
                  t(
                    'packages_business_exception_events_target_table_placeholder',
                  )
                "
                clearable
              />
              <el-select
                v-model="filters.errorType"
                :placeholder="
                  t('packages_business_exception_events_error_type')
                "
                clearable
              >
                <el-option
                  v-for="item in errorTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-date-picker
                v-model="failedTimeRange"
                class="advanced-filters__time"
                type="datetimerange"
                value-format="x"
                clearable
                :start-placeholder="
                  t('packages_business_exception_events_failure_start_time')
                "
                :end-placeholder="
                  t('packages_business_exception_events_failure_end_time')
                "
              />
              <div class="advanced-filters__actions">
                <el-button type="primary" @click="handleFilterFetch">{{
                  t('packages_business_exception_events_apply_filters')
                }}</el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </template>
      <template #operation>
        <el-button @click="refresh()">
          <template #icon><i-lucide-refresh-cw /></template>
          {{ t('packages_business_exception_events_refresh') }}
        </el-button>
      </template>
      <template #multipleSelectionActions>
        <el-button type="primary" @click="openPreview(selectedRows)">
          <template #icon><i-lucide-rotate-cw /></template>
          {{ t('packages_business_exception_events_reprocess') }}
        </el-button>
      </template>

      <el-table-column
        type="selection"
        width="46"
        :selectable="selectable"
        reserve-selection
      />
      <el-table-column
        prop="taskName"
        :label="t('packages_business_exception_events_task')"
        min-width="200"
        show-overflow-tooltip
        fixed="left"
      >
        <template #default="{ row }">
          <el-link
            class="exception-event-task-link"
            type="primary"
            :underline="false"
            @click.stop="openTaskMonitor(row)"
          >
            <el-tooltip
              placement="top"
              :content="getDlqTaskNameTooltipContent(row.taskName)"
              :disabled="
                !shouldShowDlqTaskNameTooltip(
                  row.taskName,
                  DLQ_TASK_NAME_LIST_MAX_LENGTH,
                )
              "
            >
              <span class="ellipsis">
                {{
                  displayDlqTaskName(
                    row.taskName,
                    DLQ_TASK_NAME_LIST_MAX_LENGTH,
                  )
                }}
              </span>
            </el-tooltip>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="sourceTable"
        :label="t('packages_business_exception_events_source_table')"
        min-width="170"
        show-overflow-tooltip
      />
      <el-table-column
        prop="targetTable"
        :label="t('packages_business_exception_events_target_table')"
        min-width="170"
        show-overflow-tooltip
      />
      <el-table-column prop="dmlType" label="DML" width="80" align="center">
        <template #default="{ row }">
          <el-tag
            :type="
              row.dmlType === 'I'
                ? 'success'
                : row.dmlType === 'U'
                  ? 'primary'
                  : 'danger'
            "
            effect="plain"
            >{{ row.dmlType }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="errorType"
        :label="t('packages_business_exception_events_error_type')"
        min-width="145"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{
          errorTypeLabel(row.errorType)
        }}</template>
      </el-table-column>
      <el-table-column
        prop="errorCode"
        :label="t('packages_business_exception_events_error_code')"
        min-width="115"
        show-overflow-tooltip
      />
      <el-table-column
        prop="eventTime"
        :label="t('packages_business_exception_events_event_time')"
        min-width="165"
      >
        <template #default="{ row }">{{
          dayjs(row.eventTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
      </el-table-column>
      <el-table-column
        prop="status"
        :label="t('packages_business_exception_events_status')"
        min-width="150"
      >
        <template #default="{ row }"
          ><EventStatusTag :status="row.status"
        /></template>
      </el-table-column>
      <el-table-column
        prop="lastRecoveryTime"
        :label="t('packages_business_exception_events_last_reprocess_time')"
        min-width="165"
      >
        <template #default="{ row }">{{
          row.lastRecoveryTime
            ? dayjs(row.lastRecoveryTime).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        }}</template>
      </el-table-column>
      <el-table-column
          prop="failedAt"
          :label="t('packages_business_exception_events_failure_time')"
          min-width="200"
          sortable="custom"
      >
        <template #default="{ row }">{{
            dayjs(row.failedAt).format('YYYY-MM-DD HH:mm:ss')
          }}</template>
      </el-table-column>
      <el-table-column
          prop="recoveryCount"
          :label="t('packages_business_exception_events_reprocess_count')"
          width="100"
      />
      <el-table-column
        prop="operation"
        :label="t('packages_business_exception_events_operation')"
        width="210"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button text type="primary" @click="openDetail(row)">{{
            t('packages_business_exception_events_details')
          }}</el-button>
          <el-button
            v-if="canReprocess(row)"
            text
            type="primary"
            @click="openPreview([row])"
            >{{ t('packages_business_exception_events_reprocess') }}</el-button
          >
          <el-button
            v-if="hasRecoveryHistory(row)"
            text
            type="primary"
            @click="openRecovery(row)"
            >{{
              t('packages_business_exception_events_recovery_records')
            }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>

    <el-drawer
      v-model="detailVisible"
      size="min(720px, 100vw)"
      append-to-body
      class="exception-detail-drawer"
      @closed="stopDetailPolling"
    >
      <template #header>
        <div class="exception-detail__header">
          <div class="exception-detail__title">
            {{ t('packages_business_exception_events_event_details') }}
          </div>
          <div class="exception-detail__subtitle" :title="detail?.taskName">
            {{
              detail
                ? `${displayDlqTaskName(detail.taskName)} · ${detail.sourceTable}`
                : t('packages_business_exception_events_loading')
            }}
          </div>
        </div>
      </template>
      <div v-loading="detailLoading" class="exception-detail">
        <template v-if="detail">
          <div class="flex justify-content-between align-center mb-5">
            <div class="exception-detail__status">
              <EventStatusTag :status="detail.status" />
              <span
                v-if="detailStatusWarning"
                class="exception-detail__status-warning"
              >
                {{ detailStatusWarning }}
              </span>
            </div>
            <div class="flex align-center gap-2">
              <el-button
                :aria-label="
                  t('packages_business_exception_events_refresh_event_details')
                "
                @click="refreshDetail(detail.eventId)"
              >
                <template #icon><i-lucide-refresh-cw /></template>
              </el-button>
              <el-button
                v-if="canReprocess(detail)"
                type="primary"
                @click="openPreview([detail])"
              >
                <template #icon><i-lucide-rotate-cw /></template>
                {{ t('packages_business_exception_events_reprocess') }}
              </el-button>
            </div>
          </div>
          <section class="detail-section detail-overview">
            <div class="detail-section-heading">
              <div>
                <h4>
                  {{ t('packages_business_exception_events_event_info') }}
                </h4>
              </div>
              <div class="detail-section-heading__aside">
                <div class="detail-section-heading__meta">
                  {{
                    t('packages_business_exception_events_first_failed_at', {
                      time: dayjs(detail.failedAt).format(
                        'YYYY-MM-DD HH:mm:ss',
                      ),
                    })
                  }}
                </div>
                <span v-if="detail.eventKeyMissing" class="detail-warning">
                  {{
                    t('packages_business_exception_events_event_key_missing')
                  }}
                </span>
              </div>
            </div>
            <div class="event-context">
              <div class="event-context__task">
                <el-icon :size="16"><i-lucide-workflow /></el-icon>
                <div>
                  <span>
                    {{ t('packages_business_exception_events_belonging_task') }}
                  </span>
                  <strong :title="detail.taskName">
                    {{ displayDlqTaskName(detail.taskName) }}
                  </strong>
                </div>
              </div>
              <div class="event-context__flow">
                <div class="event-context__endpoint">
                  <span>
                    {{ t('packages_business_exception_events_source_table') }}
                  </span>
                  <strong>{{ detail.sourceTable }}</strong>
                </div>
                <el-icon class="event-context__arrow" :size="16"
                  ><i-lucide-arrow-right
                /></el-icon>
                <div class="event-context__endpoint">
                  <span>
                    {{ t('packages_business_exception_events_target_table') }}
                  </span>
                  <strong>{{ detail.targetTable }}</strong>
                </div>
              </div>
              <dl class="event-context__meta">
                <div>
                  <dt>
                    {{ t('packages_business_exception_events_failed_node') }}
                  </dt>
                  <dd>
                    {{ detail.failedNodeName }}
                  </dd>
                </div>
              </dl>
            </div>
            <dl class="detail-fact-list">
              <div>
                <dt>
                  {{ t('packages_business_exception_events_source_node') }}
                </dt>
                <dd>
                  {{ detail.sourceNodeName }}
                </dd>
              </div>
              <div>
                <dt>
                  {{ t('packages_business_exception_events_target_node') }}
                </dt>
                <dd>
                  {{ detail.targetNodeName }}
                </dd>
              </div>
              <div>
                <dt>DML</dt>
                <dd>{{ detail.dmlType }}</dd>
              </div>
              <div>
                <dt>
                  {{ t('packages_business_exception_events_event_time') }}
                </dt>
                <dd>
                  {{ dayjs(detail.eventTime).format('YYYY-MM-DD HH:mm:ss') }}
                </dd>
              </div>
            </dl>
            <div class="detail-event-keys">
              <div class="detail-field-label">
                {{ t('packages_business_exception_events_business_key') }}
              </div>
              <pre class="detail-code detail-key-values">{{
                formatEventKey(detail.eventKey)
              }}</pre>
            </div>
          </section>
          <section class="detail-section">
            <div class="detail-section-heading">
              <div>
                <h4>
                  {{ t('packages_business_exception_events_error_info') }}
                </h4>
              </div>
            </div>
            <el-alert
              :title="`${detail.errorCode} · ${detail.errorType}`"
              type="error"
              :closable="false"
              show-icon
            />
            <pre class="detail-code">{{ detail.errorDetails }}</pre>
          </section>
          <section class="detail-section">
            <div class="detail-section-heading">
              <div>
                <h4>
                  {{ t('packages_business_exception_events_payload_preview') }}
                </h4>
              </div>
            </div>
            <el-alert
              v-if="detail.payloadPreviewTruncated"
              :title="
                t(
                  'packages_business_exception_events_payload_preview_truncated',
                )
              "
              type="warning"
              :closable="false"
              class="mb-3"
            />
            <el-alert
              v-if="detail.payloadComplete === false"
              :title="
                t('packages_business_exception_events_payload_incomplete')
              "
              type="error"
              :closable="false"
              class="mb-3"
            />
            <pre class="detail-code">{{
              JSON.stringify(detail.payloadPreview, null, 2)
            }}</pre>
          </section>
        </template>
      </div>
    </el-drawer>

    <el-drawer
      v-model="recoveryVisible"
      size="min(560px, 100vw)"
      append-to-body
      class="exception-detail-drawer recovery-drawer"
      @closed="stopRecoveryPolling"
    >
      <template #header>
        <div class="exception-detail__header">
          <div class="exception-detail__title">{{ recoveryView.title }}</div>
          <div
            class="exception-detail__subtitle"
            :title="recoveryDetail?.taskName"
          >
            {{
              recoveryDetail
                ? `${displayDlqTaskName(recoveryDetail.taskName)} · ${recoveryDetail.sourceTable}`
                : t('packages_business_exception_events_loading')
            }}
          </div>
        </div>
      </template>
      <div v-loading="recoveryLoading" class="recovery-drawer__content">
        <template v-if="recoveryDetail">
          <div class="recovery-drawer__toolbar">
            <EventStatusTag :status="recoveryDetail.status" />
            <el-button
              :aria-label="recoveryView.refreshLabel"
              @click="refreshRecovery(recoveryDetail.eventId)"
            >
              <template #icon><i-lucide-refresh-cw /></template>
              {{ t('packages_business_exception_events_refresh_records') }}
            </el-button>
          </div>
          <div class="recovery-drawer__context">
            <div>
              <span>{{ t('packages_business_exception_events_task') }}</span>
              <strong :title="recoveryDetail.taskName">
                {{ displayDlqTaskName(recoveryDetail.taskName) }}
              </strong>
            </div>
            <div>
              <span>
                {{ t('packages_business_exception_events_source_table') }}
              </span>
              <strong>{{ recoveryDetail.sourceTable }}</strong>
            </div>
            <div>
              <span>
                {{ t('packages_business_exception_events_target_table') }}
              </span>
              <strong>{{ recoveryDetail.targetTable }}</strong>
            </div>
          </div>
          <div class="recovery-drawer__heading">
            <h4>{{ recoveryView.sectionTitle }}</h4>
            <span>
              {{
                t('packages_business_exception_events_attempt_count', {
                  count: recoveryAttempts.length,
                })
              }}
            </span>
          </div>
          <el-empty
            v-if="!recoveryAttempts.length"
            :description="recoveryView.emptyText"
            :image-size="64"
          />
          <el-timeline v-else>
            <el-timeline-item
              v-for="attempt in recoveryAttempts"
              :key="attempt.attemptId"
              :timestamp="
                dayjs(attempt.startedAt).format('YYYY-MM-DD HH:mm:ss')
              "
              :type="recoveryAttemptMeta(attempt.result).type"
            >
              <div class="recovery-attempt">
                <div class="recovery-attempt__header">
                  <el-tag
                    :type="recoveryAttemptMeta(attempt.result).type"
                    effect="light"
                  >
                    {{ recoveryAttemptMeta(attempt.result).label }}
                  </el-tag>
                  <span v-if="attempt.finishedAt">
                    {{
                      t('packages_business_exception_events_finished_at', {
                        time: dayjs(attempt.finishedAt).format(
                          'YYYY-MM-DD HH:mm:ss',
                        ),
                      })
                    }}
                  </span>
                </div>
                <p
                  v-if="
                    attempt.errorMessage ||
                    (attempt.result === 'FAILED' && attempt.message)
                  "
                  class="recovery-attempt__error"
                >
                  <el-icon :size="15"><i-lucide-circle-alert /></el-icon>
                  <span
                    class="recovery-attempt__text"
                    v-text="attempt.errorMessage || attempt.message"
                  />
                </p>
                <p
                  v-else-if="attempt.message"
                  class="recovery-attempt__message"
                >
                  <span
                    class="recovery-attempt__text"
                    v-text="attempt.message"
                  />
                </p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </template>
      </div>
    </el-drawer>

    <el-dialog
      v-model="previewVisible"
      width="min(820px, calc(100vw - 32px))"
      class="reprocess-modal"
      append-to-body
      destroy-on-close
    >
      <template #header>
        <div class="reprocess-dialog__header">
          <div>
            <h3>
              {{
                previewTaskGroups.length > 1
                  ? t(
                      'packages_business_exception_events_confirm_batch_reprocess',
                    )
                  : t('packages_business_exception_events_confirm_reprocess')
              }}
            </h3>
            <p>
              {{
                t(
                  'packages_business_exception_events_reprocess_confirm_description',
                )
              }}
            </p>
          </div>
          <span v-if="preview" class="reprocess-dialog__header-count">
            {{
              t('packages_business_exception_events_event_count', {
                count: preview.orderedEvents.length,
              })
            }}
          </span>
        </div>
      </template>
      <div v-loading="previewLoading">
        <template v-if="preview">
          <div class="reprocess-dialog">
            <div class="reprocess-dialog__notice">
              <el-icon :size="16"><i-lucide-info /></el-icon>
              <p>
                {{ t('packages_business_exception_events_reprocess_notice') }}
              </p>
            </div>
            <div class="reprocess-dialog__summary">
              <div class="reprocess-dialog__summary-item">
                <span>
                  {{ t('packages_business_exception_events_events_to_submit') }}
                </span>
                <strong>{{
                  t('packages_business_exception_events_event_count', {
                    count: preview.orderedEvents.length,
                  })
                }}</strong>
              </div>
              <div class="reprocess-dialog__summary-item">
                <span>
                  {{ t('packages_business_exception_events_tasks_involved') }}
                </span>
                <strong>{{
                  t('packages_business_exception_events_task_count', {
                    count: previewTaskGroups.length,
                  })
                }}</strong>
              </div>
              <div class="reprocess-dialog__summary-item">
                <span>
                  {{ t('packages_business_exception_events_execution_order') }}
                </span>
                <strong class="reprocess-dialog__summary-copy">{{
                  t('packages_business_exception_events_event_time_order')
                }}</strong>
              </div>
            </div>
            <div class="reprocess-dialog__list-heading">
              <div>
                <h4>
                  {{ t('packages_business_exception_events_submission_list') }}
                </h4>
                <p>
                  {{
                    t(
                      'packages_business_exception_events_submission_list_description',
                    )
                  }}
                </p>
              </div>
              <span>
                {{
                  t('packages_business_exception_events_event_count', {
                    count: preview.orderedEvents.length,
                  })
                }}
              </span>
            </div>
            <div class="reprocess-task-groups">
              <section
                v-for="(group, groupIndex) in previewTaskGroups"
                :key="group.taskId"
                class="reprocess-task-group"
              >
                <header class="reprocess-task-group__header">
                  <div class="reprocess-task-group__identity">
                    <span class="reprocess-task-group__index">
                      {{ String(groupIndex + 1).padStart(2, '0') }}
                    </span>
                    <div>
                      <div class="reprocess-task-group__title">
                        <h5 :title="group.taskName">
                          {{ displayDlqTaskName(group.taskName) }}
                        </h5>
                      </div>
                      <p>
                        {{
                          t(
                            'packages_business_exception_events_data_routes_events_count',
                            {
                              routeCount: group.routes.length,
                              eventCount: group.events.length,
                            },
                          )
                        }}
                      </p>
                    </div>
                  </div>
                </header>
                <ol class="reprocess-task-group__events">
                  <li
                    v-for="(event, eventIndex) in group.events.slice(0, 4)"
                    :key="event.eventId"
                    class="reprocess-task-group__event"
                  >
                    <span class="reprocess-task-group__event-index">
                      {{ String(eventIndex + 1).padStart(2, '0') }}
                    </span>
                    <div class="reprocess-task-group__event-body">
                      <div class="reprocess-task-group__route">
                        <strong>{{ event.sourceTable }}</strong>
                        <span>→</span>
                        <strong>{{ event.targetTable }}</strong>
                      </div>
                      <div class="reprocess-task-group__event-meta">
                        <span
                          class="reprocess-dml"
                          :class="`is-${event.dmlType.toLowerCase()}`"
                          >{{ event.dmlType }}</span
                        >
                        <span>{{ errorTypeLabel(event.errorType) }}</span>
                        <span class="reprocess-task-group__error-code">
                          {{ event.errorCode }}
                        </span>
                        <time>
                          {{
                            t('packages_business_exception_events_failed_at', {
                              time: dayjs(event.failedAt).format(
                                'YYYY-MM-DD HH:mm',
                              ),
                            })
                          }}
                        </time>
                      </div>
                    </div>
                  </li>
                </ol>
                <div
                  v-if="group.events.length > 4"
                  class="reprocess-task-group__more"
                >
                  {{
                    t(
                      'packages_business_exception_events_more_events_not_expanded',
                      { count: group.events.length - 4 },
                    )
                  }}
                </div>
              </section>
            </div>

            <div
              v-if="previewIssueGroups.riskyEvents.length"
              class="reprocess-issue reprocess-issue--risk"
            >
              <div class="reprocess-issue__heading">
                <div>
                  <strong>
                    {{
                      t('packages_business_exception_events_risky_submission')
                    }}
                  </strong>
                  <span>
                    {{
                      t(
                        'packages_business_exception_events_risky_submission_description',
                      )
                    }}
                  </span>
                </div>
                <em>
                  {{
                    t('packages_business_exception_events_event_count', {
                      count: previewIssueGroups.riskyEvents.length,
                    })
                  }}
                </em>
              </div>
              <ul>
                <li
                  v-for="item in previewIssueGroups.riskyEvents"
                  :key="item.eventId"
                >
                  <strong>
                    {{
                      item.sourceTable ||
                      t('packages_business_exception_events_selected_record')
                    }}{{ item.targetTable ? ` → ${item.targetTable}` : '' }}
                  </strong>
                  <span>{{ item.message }}</span>
                </li>
              </ul>
            </div>

            <div
              v-if="previewIssueGroups.blockedEvents.length"
              class="reprocess-issue reprocess-issue--blocked"
            >
              <div class="reprocess-issue__heading">
                <div>
                  <strong>
                    {{
                      t(
                        'packages_business_exception_events_temporarily_unavailable',
                      )
                    }}
                  </strong>
                  <span>
                    {{
                      t(
                        'packages_business_exception_events_blocked_events_description',
                      )
                    }}
                  </span>
                </div>
                <em>
                  {{
                    t('packages_business_exception_events_event_count', {
                      count: previewIssueGroups.blockedEvents.length,
                    })
                  }}
                </em>
              </div>
              <ul>
                <li
                  v-for="item in previewIssueGroups.blockedEvents"
                  :key="item.eventId"
                  class="reprocess-issue__event"
                >
                  <div class="reprocess-issue__event-content">
                    <strong>
                      {{
                        item.sourceTable ||
                        t('packages_business_exception_events_selected_record')
                      }}{{ item.targetTable ? ` → ${item.targetTable}` : '' }}
                    </strong>
                    <span>{{ item.message }}</span>
                  </div>
                  <el-button
                    text
                    type="danger"
                    :disabled="previewLoading || submitting"
                    @click="removePreviewEvent(item.eventId)"
                  >
                    {{ t('packages_business_exception_events_remove_event') }}
                  </el-button>
                </li>
              </ul>
            </div>
          </div>
        </template>
        <div v-else-if="previewLoading" class="reprocess-dialog__loading">
          <el-skeleton :rows="5" animated />
        </div>
      </div>
      <template #footer>
        <div class="reprocess-dialog__footer">
          <span v-if="preview" class="reprocess-dialog__footer-hint">
            {{
              previewCanSubmit
                ? t('packages_business_exception_events_submit_in_order')
                : t('packages_business_exception_events_remove_blocked_events')
            }}
          </span>
          <div class="reprocess-dialog__footer-actions">
            <el-button @click="previewVisible = false">
              {{ t('packages_business_exception_events_cancel') }}
            </el-button>
            <el-button
              type="primary"
              :loading="submitting"
              :disabled="!previewCanSubmit"
              @click="submitRecovery"
            >
              {{
                preview?.orderedEvents.length
                  ? t(
                      'packages_business_exception_events_confirm_reprocess_with_count',
                      {
                        count: preview.orderedEvents.length,
                      },
                    )
                  : t('packages_business_exception_events_confirm_reprocess')
              }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style scoped lang="scss">
.exception-event-filters {
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(.filter-form) {
    display: flex;
    flex-wrap: nowrap;
  }

  &__more {
    height: 32px;
    padding: 0 10px;
    color: var(--text-normal);
    border-style: dashed;
  }

  &__count {
    display: grid;
    min-width: 16px;
    height: 16px;
    margin-left: 2px;
    color: var(--el-color-primary);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    line-height: 16px;
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
    place-items: center;
  }
}
.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;

  :deep(.el-date-editor) {
    width: 100%;
    min-width: 0;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 2px;

    div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    strong {
      color: var(--text-dark);
      font-size: 14px;
      line-height: 20px;
    }

    span {
      color: #667085;
      font-size: 12px;
      line-height: 18px;
    }
  }

  &__time {
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 2px;
  }
}
.exception-detail {
  --detail-label: #667085;
  --detail-muted: #7b8494;
  --detail-border: #e5e7eb;
  --detail-surface: #f8fafc;
  --detail-heading: #111827;
}
.exception-detail__header {
  padding-right: 24px;
}
:global(.exception-detail-drawer .el-drawer__header) {
  align-items: flex-start;
}
:global(.exception-detail-drawer .el-drawer__close-btn) {
  margin-top: 2px;
}
.exception-detail__title {
  color: var(--detail-heading, #111827);
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 28px;
}
.exception-detail__subtitle {
  margin-top: 6px;
  overflow-wrap: anywhere;
  color: var(--detail-muted, #7b8494);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}
.exception-detail__status {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.exception-detail__status-warning {
  max-width: min(520px, 100%);
  overflow-wrap: anywhere;
  color: var(--el-color-warning-dark-2);
  font-size: 12px;
  line-height: 18px;
}
.exception-detail section + section {
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid var(--detail-border, #e5e7eb);
}
.exception-detail h4 {
  margin: 0;
  color: var(--detail-heading, #111827);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  line-height: 24px;
}
.detail-section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  &__aside {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 6px;
  }

  &__meta {
    padding-top: 3px;
    color: var(--detail-muted, #7b8494);
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    text-align: right;
  }
}
.event-context {
  background: transparent;

  &__task span,
  &__endpoint span,
  dt {
    color: var(--detail-label, #475467);
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
  }

  &__task {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;

    .el-icon {
      display: grid;
      flex: none;
      width: 32px;
      height: 32px;
      color: var(--el-color-primary);
      background: #eef2ff;
      border-radius: 8px;
      place-items: center;
    }

    div {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 2px;
    }

    strong {
      overflow-wrap: anywhere;
      color: var(--text-dark);
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
    }
  }

  &__flow {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
    align-items: center;
    margin-top: 18px;
    padding: 0;
  }

  &__endpoint {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;

    strong {
      overflow-wrap: anywhere;
      color: var(--text-dark);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      font-weight: 500;
      line-height: 19px;
    }
  }

  &__arrow {
    justify-self: center;
    color: #98a2b3;
  }

  &__meta {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    margin: 18px 0 0;
    padding-top: 18px;
    border-top: 1px solid var(--detail-border, #e5e7eb);

    div {
      min-width: 0;
      padding: 0;
    }

    dt,
    dd {
      margin: 0;
    }

    dd {
      margin-top: 3px;
      overflow-wrap: anywhere;
      color: var(--text-dark);
      font-size: 13px;
      font-weight: 500;
      line-height: 19px;
    }
  }
}
.detail-identifiers {
  padding-top: 0;
}
.detail-fact-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  gap: 0 28px;
  margin-top: 24px;

  div {
    min-width: 0;
    padding: 0 0 14px;

    &:nth-child(n + 3) {
      padding-top: 14px;
    }
  }

  dt,
  dd {
    margin: 0;
  }

  dt {
    color: var(--detail-label, #667085);
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
  }

  dd {
    margin-top: 2px;
    overflow-wrap: anywhere;
    color: var(--text-dark);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
  }
}
.detail-field-label {
  color: var(--detail-label, #667085);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}
.detail-event-keys {
  margin-top: 2px;
}
.detail-warning {
  padding: 4px 8px;
  color: var(--el-color-warning-dark-2);
  font-size: 12px;
  line-height: 18px;
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 6px;
}
:global(.el-dialog.reprocess-modal) {
  overflow: hidden;
  border-radius: 16px;
}
.reprocess-dialog {
  color: var(--text-dark);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: #111827;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 28px;
    }

    p {
      margin-top: 4px;
      color: #667085;
      font-size: 13px;
      line-height: 20px;
    }
  }

  &__header-count {
    flex: none;
    padding-top: 4px;
    color: #667085;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 18px;
  }

  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 11px 13px;
    color: #8a5a16;
    font-size: 13px;
    line-height: 20px;
    background: #fffbeb;
    border: 1px solid #f5dfad;
    border-radius: 10px;

    .el-icon {
      flex: none;
      margin-top: 2px;
    }

    p {
      margin: 0;
    }
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 16px;
    overflow: hidden;
    background: #f8fafc;
    border: 1px solid #eaecf0;
    border-radius: 12px;
  }

  &__summary-item {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
    padding: 13px 16px 14px;

    span {
      color: #667085;
      font-size: 12px;
      line-height: 18px;
    }

    strong {
      overflow-wrap: anywhere;
      color: #111827;
      font-size: 17px;
      font-weight: 600;
      line-height: 24px;
    }

    small {
      color: #667085;
      font-size: 12px;
      font-weight: 500;
    }
  }

  &__summary-copy {
    font-size: 14px !important;
  }

  &__list-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin: 24px 1px 10px;

    h4,
    p {
      margin: 0;
    }

    h4 {
      color: #111827;
      font-size: 15px;
      font-weight: 600;
      line-height: 22px;
    }

    p,
    > span {
      color: #667085;
      font-size: 12px;
      line-height: 18px;
    }

    p {
      margin-top: 2px;
    }

    > span {
      flex: none;
      padding-bottom: 2px;
      font-variant-numeric: tabular-nums;
    }
  }

  &__loading {
    padding: 4px 0;
  }
}
.reprocess-task-groups {
  display: flex;
  max-height: 390px;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  padding: 1px 2px 1px 1px;
}
.reprocess-task-group {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 12px;

  &__header {
    padding: 13px 15px;
    background: #f8fafc;
    border-bottom: 1px solid #eef0f3;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  &__index,
  &__event-index {
    display: grid;
    flex: none;
    place-items: center;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }

  &__index {
    width: 28px;
    height: 28px;
    color: #4f46e5;
    font-size: 11px;
    font-weight: 600;
    background: #eef2ff;
    border-radius: 8px;
  }

  &__identity > div {
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;

    h5,
    span {
      margin: 0;
    }

    h5 {
      overflow-wrap: anywhere;
      color: #111827;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
    }

    span {
      padding: 1px 6px;
      color: #667085;
      font-size: 11px;
      line-height: 17px;
      background: #fff;
      border: 1px solid #e4e7ec;
      border-radius: 999px;
    }
  }

  &__identity p {
    margin: 3px 0 0;
    color: #667085;
    font-size: 12px;
    line-height: 18px;
  }

  &__events {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__event {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 12px 15px;

    + li {
      border-top: 1px solid #f0f2f5;
    }
  }

  &__event-index {
    width: 24px;
    height: 24px;
    margin-top: 1px;
    color: #98a2b3;
    font-size: 10px;
    font-weight: 600;
    background: #f8fafc;
    border: 1px solid #eaecf0;
    border-radius: 7px;
  }

  &__event-body {
    min-width: 0;
  }

  &__route {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    color: #667085;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 18px;

    strong {
      overflow-wrap: anywhere;
      color: #1f2937;
      font-weight: 500;
    }
  }

  &__event-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 9px;
    margin-top: 5px;
    color: #667085;
    font-size: 12px;
    line-height: 18px;

    time {
      color: #98a2b3;
    }
  }

  &__error-code {
    overflow-wrap: anywhere;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  &__more {
    padding: 9px 15px 11px;
    color: #667085;
    font-size: 12px;
    line-height: 18px;
    background: #fcfcfd;
    border-top: 1px solid #f0f2f5;
  }
}
.reprocess-dml {
  display: inline-flex;
  min-width: 20px;
  justify-content: center;
  padding: 0 4px;
  color: #475467;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  line-height: 17px;
  background: #f2f4f7;
  border: 1px solid #eaecf0;
  border-radius: 5px;

  &.is-i {
    color: #16803c;
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  &.is-u {
    color: #4338ca;
    background: #eef2ff;
    border-color: #c7d2fe;
  }

  &.is-d {
    color: #c2410c;
    background: #fff7ed;
    border-color: #fed7aa;
  }
}
.reprocess-issue {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;

  &--risk {
    --reprocess-border-color: #fedf89;

    color: #b54708;
    background: #fffaeb;
    border: 1px solid #fedf89;
  }

  &--blocked {
    --reprocess-border-color: #fecdca;

    color: #b42318;
    background: #fff7f7;
    border: 1px solid #fecdca;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    strong,
    span,
    em {
      font-size: 12px;
      line-height: 18px;
    }

    strong {
      font-weight: 600;
    }

    span,
    em {
      opacity: 0.76;
    }

    em {
      flex: none;
      font-style: normal;
      font-variant-numeric: tabular-nums;
    }
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 9px 0 0;
    padding: 9px 0 0 16px;
    border-top: 1px solid var(--reprocess-border-color);
  }

  li {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1px;
    font-size: 12px;
    line-height: 18px;
  }

  &__event {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
  }

  &__event-content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1px;
  }

  &__event > .el-button {
    flex: none;
    min-height: 18px;
    padding: 0;
    font-size: 12px;
  }

  li strong {
    overflow-wrap: anywhere;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 500;
  }

  li span {
    opacity: 0.76;
  }
}
.reprocess-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.reprocess-dialog__footer-hint {
  color: #667085;
  font-size: 12px;
  line-height: 18px;
}
.reprocess-dialog__footer-actions {
  display: flex;
  flex: none;
  gap: 8px;
}
.detail-code {
  max-height: 220px;
  margin: 14px 0 0;
  padding: 14px 16px;
  overflow: auto;
  color: #1f2937;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  background: var(--detail-surface, #f8fafc);
  border: 1px solid var(--detail-border, #e5e7eb);
  border-radius: 12px;
}
.detail-key-values {
  max-height: 160px;
  color: #344054;
  font-size: 13px;
  background: #f8fafc;
  border-color: transparent;
}
.recovery-drawer__content {
  color: var(--detail-heading, #111827);
}
.recovery-drawer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}
.recovery-drawer__context {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--detail-border, #e5e7eb);
  border-bottom: 1px solid var(--detail-border, #e5e7eb);

  div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
  }

  span {
    color: var(--detail-label, #475467);
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }

  strong {
    overflow-wrap: anywhere;
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }
}
.recovery-drawer__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 16px;

  h4 {
    margin: 0;
    color: var(--detail-heading, #111827);
    font-size: 15px;
    font-weight: 600;
    line-height: 24px;
  }

  span {
    color: var(--detail-muted, #7b8494);
    font-size: 12px;
    line-height: 18px;
  }
}
.exception-event-task-link {
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  font-weight: 500;
  vertical-align: top;

  .ellipsis {
    min-width: 0;
  }
}
.recovery-attempt {
  min-width: 0;
  padding: 2px 0 8px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;

    span {
      color: var(--detail-muted, #7b8494);
      font-size: 12px;
      font-weight: 500;
    }
  }

  p {
    display: flex;
    min-width: 0;
    max-width: 100%;
    align-items: flex-start;
    gap: 6px;
    margin: 8px 0 0;
    line-height: 20px;
  }

  &__text {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    max-height: 160px;
    overflow: auto;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  &__message {
    color: var(--detail-muted, #7b8494);
  }

  &__error {
    color: var(--el-color-danger);
  }
}
.exception-detail :deep(.el-alert) {
  border-radius: 10px;
}
.exception-detail :deep(.el-alert + .detail-code) {
  margin-top: 14px;
}
@media (max-width: 900px) {
  :deep(.table-page-container) {
    min-width: 0;
  }

  .detail-section-heading {
    flex-direction: column;
    gap: 2px;

    &__meta {
      padding-top: 0;
      text-align: left;
    }

    &__aside {
      align-items: flex-start;
    }
  }

  .event-context {
    &__meta {
      grid-template-columns: 1fr;

      div {
        border-right: 0;
      }
    }
  }

  .detail-fact-list {
    grid-template-columns: 1fr;
    column-gap: 0;
  }

  .recovery-drawer__context {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .exception-event-filters {
    width: 100%;
    overflow-x: auto;

    :deep(.filter-form) {
      flex: 1 0 auto;
    }
  }
}
@media (max-width: 600px) {
  .reprocess-dialog {
    &__header {
      h3 {
        font-size: 18px;
        line-height: 26px;
      }
    }

    &__header-count {
      display: none;
    }

    &__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__summary-item:last-child {
      grid-column: 1 / -1;
    }

    &__list-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 2px;
    }

    &__footer {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
    }

    &__footer-actions {
      justify-content: flex-end;
    }
  }

  .reprocess-task-group {
    &__event {
      gap: 9px;
      padding-right: 12px;
      padding-left: 12px;
    }

    &__header {
      padding-right: 12px;
      padding-left: 12px;
    }
  }
}
</style>
