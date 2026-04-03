<script setup lang="ts">
import { batchMeasurements } from '@tap/api/src/core/measurement'
import { getTaskById, getTaskRecords } from '@tap/api/src/core/task'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import SharedCacheDetails from '@tap/business/src/views/shared-cache/Details.vue'
import SharedCacheEditor from '@tap/business/src/views/shared-cache/Editor.vue'
import SharedMiningEditor from '@tap/business/src/views/shared-mining/Editor.vue'
import SkipError from '@tap/business/src/views/task/SkipError.vue'
import { TextEditable } from '@tap/component/src/base/text-editable'
import Time from '@tap/shared/src/time'
import { useDark } from '@vueuse/core'
import { debounce } from 'lodash-es'
import { computed, onUnmounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Canvas from './Canvas.vue'
import ConsolePanel from './components/migration/ConsolePanel.vue'
import BottomPanel from './components/monitor/BottomPanel.vue'
import NodeDetailDialog from './components/monitor/components/NodeDetailDialog.vue'
import LeftSider from './components/monitor/LeftSider.vue'
import Node from './components/monitor/Node.vue'
import { getTimeGranularity, TIME_FORMAT_MAP } from './components/monitor/util'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

useDark()

const dataflowStore = useDataflowStore()
const router = useRouter()
const route = useRoute()

const dagData = ref<any>(null)
const verifyTotals = ref<any>(null)
const alarmData = ref<any>(null)
const logTotals = ref<any[]>([])
const quota = ref({})
const refreshRate = ref(5000)
const extraEnterCount = ref(0)
const isReset = ref(false)
const taskRecord = ref({ total: 0, items: [] as any[] })
const timeFormat = ref('HH:mm:ss')
const nodeDetailDialog = ref(false)
const nodeDetailDialogId = ref('')
const noNeedRefresh = ref(false)
const canvasRef = ref<any>(null)

const {
  dataflow,
  dataflowName,
  dataflowDesc,
  dag,
  buttonShowMap,
  formScope,
  isSaving,
  syncTypeLabel,
  taskOperationsRef,
  consoleRef,
  skipErrorRef,
  sharedMiningEditorRef,
  sharedCacheDetailsRef,
  sharedCacheEditorRef,

  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onDeleteNodes,
  onAddNode,
  onMoveNodePosition,
  onUpdateNodesPosition,
  onClickNode,
  handleSave,
  handleReset,
  handleStart,
  handleEdit,
  onNameInputChange,
  initWS,
  startTask,
  handleStop,
  handleForceStop,
  handlePageReturn,
  handleOpenInspect,
  handleOpenSharedCache,
  initShareCache,
  reformDataflow,
} = useCanvasOperation()

const isInitialized = ref(false)
const timer = ref()
const quotaTimeType = ref('5m')
const quotaTime = ref([])

const firstStartTime = computed(() => {
  const startTime = dataflow.value.startTime
  return startTime ? new Date(startTime).getTime() : null
})

const lastStopTime = computed(() => {
  const stopTime = dataflow.value?.stopTime
  return stopTime ? new Date(stopTime).getTime() : null
})

const isEnterTimer = computed(() => {
  return (
    quotaTimeType.value !== 'custom' &&
    !nodeDetailDialog.value &&
    ['running', 'stopping'].includes(dataflow.value?.status)
  )
})

const timeSelectRange = computed(() => {
  let end = lastStopTime.value
  if (['running'].includes(dataflow.value.status)) {
    end = Time.now()
  }
  if (end < firstStartTime.value) {
    end = firstStartTime.value + 5 * 60 * 1000
  }
  return [firstStartTime.value, end || Time.now()]
})

const ifEnableConcurrentRead = computed(() => {
  if (dataflow.value.syncType !== 'migrate') return false
  const sourceNode = dataflowStore.dag.nodes.find(
    (node: any) => !node.$inputs.length && node.type === 'database',
  )
  return sourceNode?.enableConcurrentRead
})

function formatPercent(val: number | undefined) {
  if (typeof val !== 'number') return ''
  return `${(val * 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

const agentData = computed(() => {
  const data = (quota.value as any).samples?.agentData?.[0] || {}
  return {
    cpuUsage: formatPercent(data.cpuUsage),
    memoryRate: formatPercent(data.memoryRate),
    gcRate: formatPercent(data.gcRate),
  }
})

function handleChangeTimeSelect(val: any, isTime: boolean, source?: any) {
  quotaTimeType.value = isTime ? 'custom' : (source?.type ?? val)
  quotaTime.value = isTime
    ? val?.split(',')?.map((t: string) => Number(t))
    : getTimeRange(val)
  initMonitor()
}

function handleChangeFrequency(val: number) {
  refreshRate.value = val
  initMonitor()
}

const getTimeRange = (type) => {
  let result
  const { status } = dataflowStore.dataflow || {}
  let endTimestamp = lastStopTime.value || Time.now()
  if (status === 'running') {
    endTimestamp = Time.now()
  }
  switch (type) {
    case '5m':
      result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
      break
    case '1h':
      result = [endTimestamp - 60 * 60 * 1000, endTimestamp]
      break
    case '1d':
      result = [endTimestamp - 24 * 60 * 60 * 1000, endTimestamp]
      break
    case 'lastStart':
      result = [dataflowStore.dataflow.lastStartDate, endTimestamp]
      break
    case 'full':
      result = [firstStartTime.value, endTimestamp]
      break
    case 'incremental':
      result = [
        quota.value.samples?.totalData?.[0].snapshotDoneAt + 10000,
        endTimestamp,
      ]
      break
    default:
      result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
      break
  }
  return result
}

function handleVerifyDetails(table: any) {
  const routeUrl = router.resolve({
    name: 'VerifyDetails',
    params: { id: dataflow?.id },
    query: { table },
  })
  window.open(routeUrl.href)
}

const loadResetQuotaData = () => {
  const quotaValue = {
    samples: {},
    time: [],
    interval: 5000,
  }
  const arr = [
    'totalData',
    'barChartData',
    'lineChartData',
    'dagData',
    'agentData',
  ]
  arr.forEach((el) => {
    quotaValue.samples[el] = []
  })
  quota.value = quotaValue
  dagData.value = {}
  loadVerifyTotals()
  loadAlarmData()
  loadLogTotals()
  loadTaskRecord()
}

function loadVerifyTotals(data: any = {}) {
  const { diffRecords = 0, diffTables = 0, totals = 0, ignore = 0 } = data
  verifyTotals.value = {
    diffRecords,
    diffTables,
    totals,
    ignore,
  }
}

function loadAlarmData(data: any = {}) {
  const { alarmNum = {}, nodeInfos = [], alarmList = [] } = data
  const { alert = 0, error = 0 } = alarmNum
  const nodes = alarmList
    .filter((t: any) => t.nodeId && t.level)
    .reduce((cur: any, next: any) => {
      const index = ALARM_LEVEL_SORT.indexOf(cur[next.nodeId]?.level)
      return {
        ...cur,
        [next.nodeId]:
          index !== -1 && index < ALARM_LEVEL_SORT.indexOf(next.level)
            ? cur[next.nodeId]
            : next,
      }
    }, {})
  alarmData.value = {
    alarmNum: { alert, error },
    nodeInfos: nodeInfos.map((t: any) => {
      return Object.assign({}, t, { num: t.num || 0 })
    }),
    alarmList,
    nodes,
  }
}

function loadLogTotals(data: any = []) {
  logTotals.value = data
}

function loadTaskRecord(data?: any) {
  if (!data) return
  taskRecord.value = data
}

function getDagData(data: any[] = []) {
  return data.reduce((pre: any, current: any) => {
    return { ...pre, [current.tags.nodeId]: current }
  }, {})
}

function getQuotaFilter(type: string) {
  const { id: taskId, taskRecordId, agentId } = dataflowStore.dataflow || {}
  const [startAt, endAt] = quotaTime.value
  const params: any = {
    startAt,
    endAt,
    samples: {},
  }
  const samples: any = {
    // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
    totalData: {
      tags: {
        type: 'task',
        taskId,
        taskRecordId,
      },
      endAt: Time.now(), // 停止时间 || 当前时间
      fields: [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal',
        'tableTotal', // 任务中源表总数
        'createTableTotal', // 完成建表的数量
        'snapshotTableTotal', // 完成全量的表的数量
        'initialCompleteTime', // 全量完成时间
        'sourceConnection', // 增量信息:源连接、目标连接、增量时间点
        'targetConnection',
        'snapshotDoneAt',
        'snapshotRowTotal',
        'snapshotInsertRowTotal',
        'outputQps',
        'currentSnapshotTableRowTotal',
        'currentSnapshotTableInsertRowTotal',
        'replicateLag',
        'snapshotStartAt',
        'currentEventTimestamp',
        'snapshotDoneCost',
        'outputQpsMax',
        'outputQpsAvg',
      ],
      type: 'instant', // 瞬时值
    },
    // 任务事件统计（条）-所选周期累计
    barChartData: {
      tags: {
        type: 'task',
        taskId,
        taskRecordId,
      },
      fields: [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal',
      ],
      type: 'difference',
    },
    // qps + 增量延迟
    lineChartData: {
      tags: {
        type: 'task',
        taskId,
        taskRecordId,
      },
      fields: [
        'inputQps',
        'outputQps',
        'timeCostAvg',
        'replicateLag',
        'inputSizeQps',
        'outputSizeQps',
        'qpsType',
        'cpuUsage',
        'memoryUsage',
      ],
      type: 'continuous', // 连续数据
    },
    // dag数据
    dagData: {
      tags: {
        type: 'node',
        taskId,
        taskRecordId,
      },
      fields: [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal',
        'qps',
        'timeCostAvg',
        'currentEventTimestamp',
        'tcpPing',
        'connectPing',
        'inputTotal',
        'outputTotal',
        'inputQps',
        'outputQps',
        'snapshotRowTotal',
        'snapshotInsertRowTotal',
        'snapshotTableTotal',
        'tableTotal',
        'snapshotSourceReadTimeCostAvg',
        'incrementalSourceReadTimeCostAvg',
        'targetWriteTimeCostAvg',
        'snapshotStartAt',
        'snapshotDoneAt',
        'replicateLag',
      ],
      type: 'instant', // 瞬时值
    },
    agentData: {
      tags: {
        type: 'engine',
        engineId: agentId,
      },
      endAt: Time.now(),
      fields: ['memoryRate', 'cpuUsage', 'gcRate'],
      type: 'instant',
    },
  }
  params.samples.data = samples[type]
  return params
}

function getParams() {
  const { id: taskId, taskRecordId } = dataflowStore.dataflow || {}
  return {
    verifyTotals: {
      uri: `/api/task/auto-inspect-totals`,
      param: { id: dataflow.value.id },
    },
    alarmData: {
      uri: '/api/alarm/list_task',
      param: { taskId },
    },
    logTotals: {
      uri: '/api/MonitoringLogs/count',
      param: { taskId, taskRecordId },
    },
    totalData: {
      uri: '/api/measurement/query/v2',
      param: getQuotaFilter('totalData'),
    },
    barChartData: {
      uri: '/api/measurement/query/v2',
      param: getQuotaFilter('barChartData'),
    },
    lineChartData: {
      uri: '/api/measurement/query/v2',
      param: getQuotaFilter('lineChartData'),
    },
    dagData: {
      uri: '/api/measurement/query/v2',
      param: getQuotaFilter('dagData'),
    },
    agentData: {
      uri: '/api/measurement/query/v2',
      param: getQuotaFilter('agentData'),
    },
    taskRecord: {
      uri: '/api/task/records',
      param: { taskId, size: 200, page: 1 },
    },
  }
}

function polling() {
  if (
    isEnterTimer.value ||
    (!noNeedRefresh.value &&
      ['error', 'schedule_failed', 'stop', 'complete'].includes(
        dataflow.value.status,
      ) &&
      ++extraEnterCount.value < 4)
  ) {
    startLoadData()
  }
}

const loadData = () => {
  if (!dataflowStore.dataflow?.id) {
    return
  }
  if (isReset.value) {
    loadResetQuotaData()
    return
  }
  batchMeasurements(getParams())
    .then((data) => {
      const map = {
        verifyTotals: loadVerifyTotals,
        alarmData: loadAlarmData,
        logTotals: loadLogTotals,
        taskRecord: loadTaskRecord,
      }
      for (const key in data) {
        const item = data[key]
        if (item.code === 'ok') {
          map[key]?.(data[key].data)
        }
      }
      loadQuotaData(data)
    })
    .finally(() => {
      timer.value && clearTimeout(timer.value)
      timer.value = setTimeout(() => {
        polling()
      }, refreshRate.value)
    })
}

function loadQuotaData(data: any) {
  const q: any = {
    samples: {},
    time: [],
    interval: 5000,
  }
  const arr = [
    'totalData',
    'barChartData',
    'lineChartData',
    'dagData',
    'agentData',
  ]
  arr.forEach((el) => {
    const item = data[el]
    if (item.code === 'ok') {
      q.samples[el] = item.data?.samples?.data
      if (item.data?.interval) {
        q.interval = item.data.interval
      }
      if (item.data?.time) {
        q.time = item.data.time
      }
    }
  })
  quota.value = q
  const granularity = getTimeGranularity(quota.value.interval)
  timeFormat.value = TIME_FORMAT_MAP[granularity]
  dagData.value = getDagData(quota.value.samples.dagData)
}

const startLoadData = async () => {
  // 根据周期类型，计算时间范围
  if (quotaTimeType.value === 'lastStart') {
    const taskId = dataflowStore.dataflow.id
    const filter = {}
    await getTaskRecords(taskId, filter).then((data) => {
      const lastStartDate = data.items?.[0]?.startDate
      if (lastStartDate) {
        dataflowStore.dataflow.lastStartDate = new Date(lastStartDate).getTime()
      }
    })
  }
  if (quotaTimeType.value !== 'custom') {
    quotaTime.value = getTimeRange(quotaTimeType.value)
  }
  loadData()
}

const initMonitor = debounce(() => {
  timer.value && clearTimeout(timer.value)
  startLoadData()
}, 200)

function handleOpenDetail(node: any) {
  if (['mem_cache'].includes(node.type)) return
  nodeDetailDialogId.value = node.id
  nodeDetailDialog.value = true
}

let pollingTimer: ReturnType<typeof setTimeout> | null = null

async function pollTaskDetail() {
  const taskId = route.params.id as string
  if (!taskId) return

  try {
    const task = await getTaskById(taskId)
    if (task) {
      reformDataflow(task)
    }
  } catch (error) {
    console.error('pollTaskDetail error', error)
  }

  pollingTimer = setTimeout(pollTaskDetail, 10000)
}

const init = async () => {
  dataflowStore.stateIsReadonly = true
  dataflowStore.showBottom = true
  const taskId = route.params.id as string
  await dataflowStore.initPdkProperties()

  if (taskId) {
    await initNodeType()
    await dataflowStore.fetchDataflow(taskId)
  }
  initMonitor()
  initWS()
  pollingTimer = setTimeout(pollTaskDetail, 10000)
  isInitialized.value = true
}

init()

onUnmounted(() => {
  if (pollingTimer) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }
  dataflowStore.$reset()
})

provide('dag', dag)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
provide('dataflowName', dataflowName)
provide('dataflowDesc', dataflowDesc)
provide('onNameInputChange', onNameInputChange)
provide('formScope', formScope)
provide('isSaving', isSaving)
provide('isInitialized', isInitialized)
</script>

<template>
  <div
    id="dataflow-container"
    class="w-100 h-100 position-relative overflow-hidden"
  >
    <div
      class="task-detail position-absolute top-3 start-3 z-10 bg-overlay rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button data-testid="back-button" text @click="handlePageReturn">
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <el-divider direction="vertical" class="mx-0" />
      <div>
        <TextEditable
          v-model:value="dataflowName"
          class="overflow-hidden"
          :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
          :maxlength="200"
          :max-width="320"
          hidden-icon
          @change="onNameInputChange"
        />
      </div>
      <TaskStatus class="w-auto rounded-lg zoom-xs" :task="dataflow" />
      <el-divider class="mx-1" direction="vertical" />
      <span class="font-color-light text-xs mr-1">{{ syncTypeLabel }}</span>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <!-- 浮动信息栏 -->
      <div
        class="monitor-info-bar shadow-canvas flex align-center gap-1 position-absolute h-8"
      >
        <el-icon><i-lucide-server /></el-icon>
        <span class="monitor-info-bar__agent">{{ dataflow.agentName }}</span>
        <el-divider class="mx-1" direction="vertical" />
        <span class="monitor-info-bar__metrics font-color-light">
          CPU
          <span class="fw-bold font-color-dark">{{ agentData.cpuUsage }}</span>
          <span class="ml-3"
            >MEM
            <span class="fw-bold font-color-dark">{{
              agentData.memoryRate
            }}</span></span
          >
          <span class="ml-3"
            >GC
            <span class="fw-bold font-color-dark">{{
              agentData.gcRate
            }}</span></span
          >
        </span>
      </div>
      <div class="flex-1" />
      <TaskOperations
        ref="taskOperationsRef"
        @save="handleSave"
        @reset="handleReset"
        @start="handleStart"
        @edit="handleEdit"
        @stop="handleStop"
        @force-stop="handleForceStop"
        @locate-node="(id) => canvasRef?.locateNode(id)"
        @debug-start="handleStart(true)"
      />
    </div>

    <Canvas
      ref="canvasRef"
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @delete:nodes="onDeleteNodes"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:node="onClickNode"
    >
      <template #node="scope">
        <Node
          v-bind="scope"
          :task-type="dataflow.type"
          :sync-type="dataflow.syncType"
          :sample="dagData ? dagData[scope.data.id] : {}"
          :quota="quota"
          :alarm="alarmData ? alarmData.nodes[scope.data.id] : undefined"
          @open-detail="handleOpenDetail"
          @open-shared-cache="handleOpenSharedCache"
          @refresh-shared-cache="initShareCache"
        />
      </template>
      <template #left>
        <LeftSider
          :quota="quota"
          :verify-totals="verifyTotals"
          :time-format="timeFormat"
          :range="timeSelectRange"
          :if-enable-concurrent-read="ifEnableConcurrentRead"
          class="z-20"
          @load-data="initMonitor"
          @change-time-select="handleChangeTimeSelect"
          @change-frequency="handleChangeFrequency"
          @verify-details="handleVerifyDetails"
        />
      </template>
      <template #bottom>
        <div
          v-if="!dataflowStore.showBottom"
          class="position-absolute bg-card rounded-lg font-color-light p-1.5 shadow-canvas text-xs translate-middle-x start-50 top-1 cursor-pointer"
          @click="dataflowStore.showBottom = true"
        >
          {{ $t('packages_dag_monitor_bottompanel_renwujindu') }}
        </div>
        <BottomPanel
          v-if="dataflow.status && dataflowStore.showBottom"
          ref="bottomPanel"
          :dataflow="dataflow"
          :alarm-data="alarmData"
          :log-totals="logTotals"
          :task-record="taskRecord"
          :quota="quota"
          @open-inspect="handleOpenInspect"
          @load-data="initMonitor"
          @show-bottom-panel="handleShowBottomPanel"
          @action="handleBottomPanelAction"
          @start="handleStart(false, false)"
        />
        <ConsolePanel v-if="!dataflowStore.showBottom" ref="consoleRef" />
      </template>
    </Canvas>

    <SkipError ref="skipErrorRef" @skip="startTask" />
    <NodeDetailDialog
      v-model:value="nodeDetailDialog"
      :dataflow="dataflow"
      :node-id="nodeDetailDialogId"
      :time-format="timeFormat"
      :range="[firstStartTime, lastStopTime || Time.now()]"
      :quota-time="quotaTime"
      :quota-time-type="quotaTimeType"
      :get-time-range="getTimeRange"
      :if-enable-concurrent-read="ifEnableConcurrentRead"
      @load-data="initMonitor"
    />

    <SharedMiningEditor
      v-if="dataflow.syncType === 'logCollector'"
      ref="sharedMiningEditorRef"
    />
    <SharedCacheEditor
      v-if="dataflow.syncType === 'shareCache'"
      ref="sharedCacheEditorRef"
    />

    <SharedCacheDetails ref="sharedCacheDetailsRef" width="380px" />
  </div>
</template>

<style scoped lang="scss">
.header {
  top: 28px;
}
:deep(.btn-shadow) {
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;
}
.task-detail {
  :deep(.task-status-block) {
    min-width: unset;
  }
}

.monitor-info-bar {
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: var(--el-bg-color);
  padding: 6px 16px;
  border-radius: 10px;

  font-size: 13px;
  white-space: nowrap;
  color: var(--el-text-color-regular);

  &__agent {
    color: var(--el-text-color-primary);
  }

  &__metrics .fw-bold {
    color: var(--el-text-color-primary);
  }
}
</style>
