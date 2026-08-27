<script setup lang="ts">
import {
  fetchDqlEventDetail,
  fetchDqlEventSummary,
  fetchDqlEvents,
  previewDqlRecovery,
  startDqlRecovery,
  type DqlEvent,
  type DqlEventDetail,
  type DqlRecoveryAttempt,
  type DqlEventStatus,
  type DqlRecoveryPreview,
} from '@tap/api/src/core/dql-event'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import EventStatusTag from './components/EventStatusTag.vue'
import SummaryTabs from './components/SummaryTabs.vue'
import {
  fetchMockDqlEventDetail,
  fetchMockDqlEvents,
  fetchMockDqlSummary,
  previewMockDqlRecovery,
  startMockDqlRecovery,
} from './mock'

const isMockMode =
  import.meta.env.DEV && import.meta.env.VITE_DQL_EVENT_API !== 'true'
const route = useRoute()
const router = useRouter()
const table = ref<InstanceType<typeof TablePage>>()
const selectedRows = ref<DqlEvent[]>([])
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<DqlEventDetail>()
const recoveryVisible = ref(false)
const recoveryLoading = ref(false)
const recoveryDetail = ref<DqlEventDetail>()
const previewVisible = ref(false)
const previewLoading = ref(false)
const preview = ref<DqlRecoveryPreview>()
const submitting = ref(false)
const status = ref<DqlEventStatus>()
let refreshTimer: ReturnType<typeof setInterval> | undefined
let detailRefreshTimer: ReturnType<typeof setInterval> | undefined
let recoveryRefreshTimer: ReturnType<typeof setInterval> | undefined

const filters = ref({
  keyword: '',
  taskId: '',
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

const filterItems = [
  { placeholder: '任务或错误码', key: 'keyword', type: 'input' },
  {
    label: '任务',
    key: 'taskId',
    type: 'select-inner',
    items: [
      { label: '订单同步', value: 'task-orders' },
      { label: '库存同步', value: 'task-inventory' },
      { label: '会员数据同步', value: 'task-members' },
    ],
  },
  {
    label: 'DML',
    key: 'dmlType',
    type: 'select-inner',
    items: [
      { label: '新增', value: 'I' },
      { label: '更新', value: 'U' },
      { label: '删除', value: 'D' },
    ],
  },
  {
    label: '错误类型',
    key: 'errorType',
    type: 'select-inner',
    items: [
      { label: '目标写入失败', value: 'TARGET_WRITE_ERROR' },
      { label: '转换失败', value: 'TRANSFORM_ERROR' },
      { label: '不可处理记录', value: 'POISON_RECORD' },
      { label: '格式错误', value: 'MALFORMED_RECORD' },
    ],
  },
]

const advancedFilterCount = computed(
  () =>
    [
      filters.value.sourceTable,
      filters.value.targetTable,
      filters.value.startTime || filters.value.endTime,
    ].filter(Boolean).length,
)
const failedTimeRange = computed({
  get: () =>
    filters.value.startTime && filters.value.endTime
      ? [filters.value.startTime, filters.value.endTime]
      : undefined,
  set: (value?: string[]) => {
    filters.value.startTime = value?.[0] || ''
    filters.value.endTime = value?.[1] || ''
  },
})
const canReprocess = (event: DqlEvent) =>
  ['PENDING', 'RECOVERY_FAILED'].includes(event.status)
const hasRecoveryHistory = (event: DqlEvent) =>
  event.status === 'REPROCESSING' || event.recoveryCount > 0
const selectable = (event: DqlEvent) => canReprocess(event)
const recoveryAttemptMeta = (result: DqlRecoveryAttempt['result']) =>
  ({
    RUNNING: { label: '处理中', type: 'primary' },
    SUCCESS: { label: '处理成功', type: 'success' },
    FAILED: { label: '处理失败', type: 'danger' },
    SKIPPED: { label: '已跳过', type: 'info' },
    TIMEOUT: { label: '处理超时', type: 'warning' },
  })[result]
const recoveryView = {
  title: '处理记录',
  sectionTitle: '处理记录',
  emptyText: '暂无处理记录',
  refreshLabel: '刷新处理记录',
}
const recoveryAttempts = computed(() => {
  const attempts = [...(recoveryDetail.value?.recoveryAttempts || [])]
  if (recoveryDetail.value?.status !== 'REPROCESSING') return attempts

  const runningIndex = attempts.findIndex((item) => item.result === 'RUNNING')
  if (runningIndex <= 0) return attempts

  const [running] = attempts.splice(runningIndex, 1)
  attempts.unshift(running)
  return attempts
})
const errorTypeLabel = (type: DqlEvent['errorType']) =>
  ({
    MALFORMED_RECORD: '格式错误',
    POISON_RECORD: '不可处理记录',
    TRANSFORM_ERROR: '转换失败',
    TARGET_WRITE_ERROR: '目标写入失败',
    UNKNOWN_RECORD_ERROR: '未知记录错误',
  })[type]
const syncTypeLabel = (syncType: DqlEvent['syncType']) =>
  ({ migrate: '复制任务', sync: '转换任务' })[syncType] || '数据任务'
const formatKeyValue = (value: unknown) => {
  if (value === null) return 'null'
  if (value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
const formatEventKeys = (keys: DqlEventDetail['eventKeys']) =>
  [...(keys || [])]
    .sort((a, b) => {
      const priority = { PRIMARY_KEY: 0, UNIQUE_INDEX: 1 }
      return (priority[a.type] ?? 2) - (priority[b.type] ?? 2)
    })
    .map(({ values }) =>
      Object.entries(values || {})
        .map(([key, value]) => [key, formatKeyValue(value)].join('='))
        .join('\n'),
    )
    .filter(Boolean)
    .join('\n\n') || '-'
const previewTaskGroups = computed(() => {
  const groups = new Map<
    string,
    {
      taskId: string
      taskName: string
      syncType: DqlEvent['syncType']
      events: DqlEvent[]
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
        syncType: event.syncType,
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

const getList = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const params = {
    ...Object.fromEntries(
      Object.entries(filters.value).filter(([, value]) => value !== ''),
    ),
    status: status.value,
    skip: (page.current - 1) * page.size,
    limit: page.size,
    order: '-failedAt',
  }
  const data = isMockMode
    ? await fetchMockDqlEvents(params)
    : await fetchDqlEvents(params)
  return { data: data?.items || [], total: data?.total || 0 }
}

const refreshSummary = async () => {
  summary.value = isMockMode
    ? await fetchMockDqlSummary(filters.value)
    : await fetchDqlEventSummary(filters.value)
}

const refresh = (passive = false) => {
  table.value?.fetch(1, 0, passive)
  refreshSummary()
}

const handleStatusChange = (value?: DqlEventStatus) => {
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

const clearAdvancedFilters = () => {
  filters.value.sourceTable = ''
  filters.value.targetTable = ''
  filters.value.startTime = ''
  filters.value.endTime = ''
  handleFilterFetch()
}

const handleSelectionChange = (rows: DqlEvent[]) => {
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
      ? await fetchMockDqlEventDetail(eventId)
      : await fetchDqlEventDetail(eventId)
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
      ? await fetchMockDqlEventDetail(eventId)
      : await fetchDqlEventDetail(eventId)
  } finally {
    recoveryLoading.value = false
  }
  if (recoveryDetail.value?.status === 'REPROCESSING')
    startRecoveryPolling()
  else stopRecoveryPolling()
}

const openDetail = async (event: DqlEvent) => {
  detailVisible.value = true
  detail.value = undefined
  await refreshDetail(event.eventId)
}

const openRecovery = async (event: DqlEvent) => {
  recoveryVisible.value = true
  recoveryDetail.value = undefined
  await refreshRecovery(event.eventId)
}

const openTaskMonitor = (event: DqlEvent) => {
  router.push({
    name: event.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor',
    params: { id: event.taskId },
  })
}

const openPreview = async (events: DqlEvent[]) => {
  if (!events.length) return
  previewVisible.value = true
  previewLoading.value = true
  try {
    const ids = events.map((item) => item.eventId)
    preview.value = isMockMode
      ? await previewMockDqlRecovery(ids)
      : await previewDqlRecovery(ids)
  } finally {
    previewLoading.value = false
  }
}

const submitRecovery = async () => {
  if (!preview.value?.canSubmit) return
  submitting.value = true
  try {
    const ids = preview.value.orderedEvents.map((item) => item.eventId)
    await (isMockMode
      ? await startMockDqlRecovery(ids)
      : await startDqlRecovery(ids))
    previewVisible.value = false
    selectedRows.value = []
    table.value?.clearSelection()
    ElMessage.success('重处理已提交，可在“处理进度”中跟踪状态')
    refresh()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  Object.entries(filters.value).forEach(([key]) => {
    const value = route.query[key]
    if (typeof value === 'string') filters.value[key as keyof typeof filters.value] = value
  })
  const routeStatus = route.query.status
  if (typeof routeStatus === 'string')
    status.value = routeStatus as DqlEventStatus
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
        <span class="fs-5 font-color-dark lh-8">异常事件</span>
        <el-tag v-if="isMockMode" size="small" type="info" effect="plain">
          模拟数据
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
            v-model:value="filters"
            :items="filterItems"
            :change-route="false"
            @fetch="handleFilterFetch"
          />
          <el-popover placement="bottom-start" :width="360" trigger="click">
            <template #reference>
              <el-button class="exception-event-filters__more">
                <template #icon><i-lucide-sliders-horizontal /></template>
                更多筛选
                <span v-if="advancedFilterCount" class="exception-event-filters__count">
                  {{ advancedFilterCount }}
                </span>
              </el-button>
            </template>
            <div class="advanced-filters">
              <div class="advanced-filters__heading">
                <div>
                  <strong>更多筛选</strong>
                  <span>按表名或失败时间进一步缩小范围</span>
                </div>
                <el-button text @click="clearAdvancedFilters">清除</el-button>
              </div>
              <el-input v-model="filters.sourceTable" placeholder="来源表，例如 mysql.orders" clearable />
              <el-input v-model="filters.targetTable" placeholder="目标表，例如 mongo.orders" clearable />
              <el-date-picker
                v-model="failedTimeRange"
                class="advanced-filters__time"
                type="datetimerange"
                value-format="x"
                start-placeholder="失败开始时间"
                end-placeholder="失败结束时间"
              />
              <div class="advanced-filters__actions">
                <el-button type="primary" @click="handleFilterFetch">应用筛选</el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </template>
      <template #operation>
        <el-button @click="refresh()">
          <template #icon><i-lucide-refresh-cw /></template>
          刷新
        </el-button>
      </template>
      <template #multipleSelectionActions>
        <el-button type="primary" @click="openPreview(selectedRows)">
          <template #icon><i-lucide-rotate-cw /></template>
          重处理
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
        label="任务"
        min-width="130"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-link
            class="exception-event-task-link"
            type="primary"
            :underline="false"
            @click.stop="openTaskMonitor(row)"
          >
            <span class="ellipsis">{{ row.taskName }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="sourceTable"
        label="来源表"
        min-width="170"
        show-overflow-tooltip
      />
      <el-table-column
        prop="targetTable"
        label="目标表"
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
        label="错误类型"
        min-width="145"
        show-overflow-tooltip
      >
        <template #default="{ row }">{{ errorTypeLabel(row.errorType) }}</template>
      </el-table-column>
      <el-table-column
        prop="errorCode"
        label="错误码"
        min-width="145"
        show-overflow-tooltip
      />
      <el-table-column prop="eventTime" label="事件时间" min-width="165">
        <template #default="{ row }">{{
          dayjs(row.eventTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
      </el-table-column>
      <el-table-column
        prop="failedAt"
        label="失败时间"
        min-width="165"
        sortable="custom"
      >
        <template #default="{ row }">{{
          dayjs(row.failedAt).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="118">
        <template #default="{ row }"
          ><EventStatusTag :status="row.status"
        /></template>
      </el-table-column>
      <el-table-column
        prop="recoveryCount"
        label="重处理次数"
        width="108"
        align="right"
      />
      <el-table-column
        prop="lastRecoveryTime"
        label="最近重处理"
        min-width="165"
      >
        <template #default="{ row }">{{
          row.lastRecoveryTime
            ? dayjs(row.lastRecoveryTime).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        }}</template>
      </el-table-column>
      <el-table-column prop="operation" label="操作" width="210" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" @click="openDetail(row)"
            >详情</el-button
          >
          <el-button
            v-if="canReprocess(row)"
            text
            type="primary"
            @click="openPreview([row])"
            >重处理</el-button
          >
          <el-button
            v-if="hasRecoveryHistory(row)"
            text
            type="primary"
            @click="openRecovery(row)"
            >处理记录</el-button
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
          <div class="exception-detail__title">异常事件详情</div>
          <div class="exception-detail__subtitle">
            {{ detail ? `${detail.taskName} · ${detail.sourceTable}` : '正在加载…' }}
          </div>
        </div>
      </template>
      <div v-loading="detailLoading" class="exception-detail">
        <template v-if="detail">
          <div class="flex justify-content-between align-center mb-5">
            <EventStatusTag :status="detail.status" />
            <div class="flex align-center gap-2">
              <el-button aria-label="刷新事件详情" @click="refreshDetail(detail.eventId)">
                <template #icon><i-lucide-refresh-cw /></template>
              </el-button>
              <el-button
                v-if="canReprocess(detail)"
                type="primary"
                @click="openPreview([detail])"
              >
                <template #icon><i-lucide-rotate-cw /></template>
                重处理
              </el-button>
            </div>
          </div>
          <section class="detail-section detail-overview">
            <div class="detail-section-heading">
              <div>
                <h4>事件信息</h4>
              </div>
              <div class="detail-section-heading__aside">
                <div class="detail-section-heading__meta">
                  首次失败于 {{ dayjs(detail.failedAt).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
                <span v-if="detail.eventKeyMissing" class="detail-warning">
                  事件主键缺失，不能安全重处理
                </span>
              </div>
            </div>
            <div class="event-context">
              <div class="event-context__task">
                <el-icon :size="16"><i-lucide-workflow /></el-icon>
                <div>
                  <span>所属任务</span>
                  <strong>{{ detail.taskName }}</strong>
                </div>
              </div>
              <div class="event-context__flow">
                <div class="event-context__endpoint">
                  <span>来源表</span>
                  <strong>{{ detail.sourceTable }}</strong>
                </div>
                <el-icon class="event-context__arrow" :size="16"
                  ><i-lucide-arrow-right
                /></el-icon>
                <div class="event-context__endpoint">
                  <span>目标表</span>
                  <strong>{{ detail.targetTable }}</strong>
                </div>
              </div>
              <dl class="event-context__meta">
                <div>
                  <dt>失败节点</dt>
                  <dd>{{ detail.failedNodeName || '-' }}</dd>
                </div>
              </dl>
            </div>
            <dl class="detail-fact-list">
              <div><dt>源节点</dt><dd>{{ detail.sourceNodeName || '-' }}</dd></div>
              <div><dt>目标节点</dt><dd>{{ detail.targetNodeName || '-' }}</dd></div>
              <div><dt>DML</dt><dd>{{ detail.dmlType }}</dd></div>
              <div><dt>事件时间</dt><dd>{{ dayjs(detail.eventTime).format('YYYY-MM-DD HH:mm:ss') }}</dd></div>
            </dl>
            <div class="detail-event-keys">
              <div class="detail-field-label">业务键</div>
              <pre class="detail-code detail-key-values">{{ formatEventKeys(detail.eventKeys) }}</pre>
            </div>
          </section>
          <section class="detail-section">
            <div class="detail-section-heading">
              <div>
                <h4>错误信息</h4>
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
                <h4>Payload 预览</h4>
              </div>
            </div>
            <el-alert
              v-if="detail.payloadPreviewTruncated"
              title="Payload 预览已截断，仅展示服务端返回的安全预览。"
              type="warning"
              :closable="false"
              class="mb-3"
            />
            <el-alert
              v-if="detail.payloadComplete === false"
              title="Payload 不完整，当前事件不可重处理。"
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
          <div class="exception-detail__subtitle">
            {{
              recoveryDetail
                ? `${recoveryDetail.taskName} · ${recoveryDetail.sourceTable}`
                : '正在加载…'
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
              刷新记录
            </el-button>
          </div>
          <div class="recovery-drawer__context">
            <div>
              <span>任务</span>
              <strong>{{ recoveryDetail.taskName }}</strong>
            </div>
            <div>
              <span>来源表</span>
              <strong>{{ recoveryDetail.sourceTable }}</strong>
            </div>
            <div>
              <span>目标表</span>
              <strong>{{ recoveryDetail.targetTable }}</strong>
            </div>
          </div>
          <div class="recovery-drawer__heading">
            <h4>{{ recoveryView.sectionTitle }}</h4>
            <span>{{ recoveryAttempts.length }} 次</span>
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
              :timestamp="dayjs(attempt.startedAt).format('YYYY-MM-DD HH:mm:ss')"
              :type="recoveryAttemptMeta(attempt.result).type"
            >
              <div class="recovery-attempt">
                <div class="recovery-attempt__header">
                  <el-tag :type="recoveryAttemptMeta(attempt.result).type" effect="light">
                    {{ recoveryAttemptMeta(attempt.result).label }}
                  </el-tag>
                  <span v-if="attempt.finishedAt">
                    完成于 {{ dayjs(attempt.finishedAt).format('YYYY-MM-DD HH:mm:ss') }}
                  </span>
                </div>
                <p
                  v-if="attempt.errorMessage || (attempt.result === 'FAILED' && attempt.message)"
                  class="recovery-attempt__error"
                >
                  <el-icon :size="15"><i-lucide-circle-alert /></el-icon>
                  {{ attempt.errorMessage || attempt.message }}
                </p>
                <p v-else-if="attempt.message" class="recovery-attempt__message">
                  {{ attempt.message }}
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
              {{ previewTaskGroups.length > 1 ? '确认批量重处理' : '确认重处理' }}
            </h3>
            <p>提交前确认任务范围和事件数量</p>
          </div>
          <span v-if="preview" class="reprocess-dialog__header-count">
            {{ preview.orderedEvents.length }} 条事件
          </span>
        </div>
      </template>
      <div v-loading="previewLoading">
        <template v-if="preview">
          <div class="reprocess-dialog">
            <div class="reprocess-dialog__notice">
              <el-icon :size="16"><i-lucide-info /></el-icon>
              <p>
                将使用各任务当前已发布配置提交原始事件。处理期间，相关任务可能短暂暂停，完成后恢复。原始 Payload 不会被修改。
              </p>
            </div>
            <div class="reprocess-dialog__summary">
              <div class="reprocess-dialog__summary-item">
                <span>待提交事件</span>
                <strong>{{ preview.orderedEvents.length }} <small>条</small></strong>
              </div>
              <div class="reprocess-dialog__summary-item">
                <span>涉及任务</span>
                <strong>{{ previewTaskGroups.length }} <small>个</small></strong>
              </div>
              <div class="reprocess-dialog__summary-item">
                <span>执行顺序</span>
                <strong class="reprocess-dialog__summary-copy">按事件时间</strong>
              </div>
            </div>
            <div class="reprocess-dialog__list-heading">
              <div>
                <h4>提交清单</h4>
                <p>按任务归类，按事件时间顺序执行</p>
              </div>
              <span>{{ preview.orderedEvents.length }} 条事件</span>
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
                        <h5>{{ group.taskName }}</h5>
                        <span>{{ syncTypeLabel(group.syncType) }}</span>
                      </div>
                      <p>
                        {{ group.routes.length }} 条数据链路 · {{ group.events.length }} 条事件
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
                        >{{ event.dmlType }}</span>
                        <span>{{ errorTypeLabel(event.errorType) }}</span>
                        <span class="reprocess-task-group__error-code">
                          {{ event.errorCode }}
                        </span>
                        <time>
                          失败于 {{ dayjs(event.failedAt).format('YYYY-MM-DD HH:mm') }}
                        </time>
                      </div>
                    </div>
                  </li>
                </ol>
                <div
                  v-if="group.events.length > 4"
                  class="reprocess-task-group__more"
                >
                  还有 {{ group.events.length - 4 }} 条事件未展开
                </div>
              </section>
            </div>

            <div v-if="preview.blockedEvents.length" class="reprocess-blocked">
              <div class="reprocess-blocked__heading">
                <div>
                  <strong>暂不可提交</strong>
                  <span>这些事件不会被提交</span>
                </div>
                <em>{{ preview.blockedEvents.length }} 条</em>
              </div>
              <ul>
                <li v-for="item in preview.blockedEvents" :key="item.eventId">
                  <strong>
                    {{ item.sourceTable || '所选记录' }}{{
                      item.targetTable ? ` → ${item.targetTable}` : ''
                    }}
                  </strong>
                  <span>{{ item.message }}</span>
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
            {{ preview.canSubmit ? '确认后将按顺序提交这些事件' : '请先移除不可提交的事件' }}
          </span>
          <div class="reprocess-dialog__footer-actions">
            <el-button @click="previewVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="submitting"
              :disabled="!preview?.canSubmit"
              @click="submitRecovery"
            >
              确认重处理{{ preview?.orderedEvents.length ? ` ${preview.orderedEvents.length} 条` : '' }}
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
.reprocess-blocked {
  margin-top: 16px;
  padding: 12px 14px;
  color: #b42318;
  background: #fff7f7;
  border: 1px solid #fecdca;
  border-radius: 10px;

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
      color: #b42318;
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
    border-top: 1px solid #fecdca;
  }

  li {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1px;
    font-size: 12px;
    line-height: 18px;
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
    align-items: flex-start;
    gap: 6px;
    margin: 8px 0 0;
    line-height: 20px;
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
