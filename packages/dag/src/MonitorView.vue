<script setup lang="ts">
import { batchMeasurements } from '@tap/api/src/core/measurement'
import { deleteTask, getTaskRecords, startTask } from '@tap/api/src/core/task'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import SkipError from '@tap/business/src/views/task/SkipError.vue'
import { TextEditable } from '@tap/component/src/base/text-editable'
import { Modal } from '@tap/component/src/modal'
import { useI18n } from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { debounce } from 'lodash-es'
import { computed, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Canvas from './Canvas.vue'
import ConsolePanel from './components/migration/ConsolePanel.vue'
import BottomPanel from './components/monitor/BottomPanel.vue'
import LeftSider from './components/monitor/LeftSider.vue'
import Node from './components/monitor/Node.vue'
import { getTimeGranularity, TIME_FORMAT_MAP } from './components/monitor/util'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store = useStore()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

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
const noNeedRefresh = ref(false)
const showBottomPanel = ref(true)

const {
  dataflow,
  dag,
  buttonShowMap,
  formScope,
  isSaving,
  consoleRef,
  skipErrorRef,
  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onAddNode,
  onMoveNodePosition,
  onClickConnectionAdd,
  onUpdateNodesPosition,
  onClickNode,
  handleSave,
  handleReset,
  handleStart,
  onNameInputChange,
  initWS,
  startTask,
} = useCanvasOperation()

const isInitialized = ref(false)
const timer = ref()
const quotaTimeType = ref('5m')
const quotaTime = ref([])

const firstStartTime = computed(() => {
  const { startTime } = dataflowStore.dataflow || {}
  return startTime ? new Date(startTime).getTime() : null
})

const lastStopTime = computed(() => {
  const stopTime = dataflowStore.dataflowRef.stopTime
  return stopTime ? new Date(stopTime).getTime() : null
})

const isEnterTimer = computed(() => {
  return (
    quotaTimeType.value !== 'custom' &&
    !nodeDetailDialog.value &&
    ['running', 'stopping'].includes(dataflowStore.dataflowRef?.status)
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
  if (dataflowStore.dataflowRef.syncType !== 'migrate') return false
  const sourceNode = dataflowStore.dag.nodes.find(
    (node: any) => !node.$inputs.length && node.type === 'database',
  )
  return sourceNode?.enableConcurrentRead
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
  console.log('dataflow.value.id', dataflow.value.id)
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

const init = async () => {
  console.log('dataflowStore.dataflow.id', dataflowStore.dataflow.id)
  dataflowStore.$reset()
  dataflowStore.stateIsReadonly = true
  const taskId = route.params.id as string
  await initNodeType()
  await dataflowStore.initPdkProperties()

  if (taskId) {
    await dataflowStore.fetchDataflow(taskId)
  }
  initMonitor()
  initWS()
  isInitialized.value = true
}

init()

const handlePageReturn = () => {
  if (!dataflowStore.dag.nodes.length && dataflowStore.dataflow.id) {
    Modal.confirm(
      t('packages_dag_page_return_confirm_title'),
      t('packages_dag_page_return_confirm_content'),
      {
        confirmButtonText: t('packages_dag_page_return_confirm_ok_text'),
        cancelButtonText: t('packages_dag_page_return_confirm_cancel_text'),
      },
    ).then((res) => {
      if (res) {
        deleteTask(dataflowStore.dataflow.id)
      }
      router.push({
        name: 'dataflowList',
      })
      window.name = null
    })
  } else {
    router.push({
      name: 'dataflowList',
    })
    window.name = null
  }
}

provide('dag', dag)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
provide('onNameInputChange', onNameInputChange)
provide('formScope', formScope)
provide('isSaving', isSaving)
</script>

<template>
  <div
    id="dataflow-container"
    class="w-100 h-100 position-relative overflow-hidden"
  >
    <div
      class="task-detail position-absolute top-3 start-3 z-10 bg-card rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button text @click="handlePageReturn">
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <el-divider direction="vertical" class="mx-0" />
      <div>
        <TextEditable
          v-model:value="dataflowStore.dataflowName"
          class="overflow-hidden"
          :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
          :maxlength="200"
          hidden-icon
          @change="onNameInputChange"
        />
      </div>
      <TaskStatus class="w-auto rounded-lg zoom-xs" :task="dataflow" />
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations
        @save="handleSave"
        @reset="handleReset"
        @start="handleStart"
      />
    </div>
    <Canvas
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:connection:add="onClickConnectionAdd"
      @click:node="onClickNode"
    >
      <template #node="scope">
        <Node
          v-bind="scope"
          :task-type="dataflowStore.dataflowRef.type"
          :sync-type="dataflowStore.dataflowRef.syncType"
          :sample="dagData ? dagData[scope.data.id] : {}"
          :quota="quota"
          :alarm="alarmData ? alarmData.nodes[scope.data.id] : undefined"
        />
      </template>
      <template #left>
        <LeftSider
          :quota="quota"
          :verify-totals="verifyTotals"
          :time-format="timeFormat"
          :range="timeSelectRange"
          :if-enable-concurrent-read="ifEnableConcurrentRead"
          @load-data="initMonitor"
          @change-time-select="handleChangeTimeSelect"
          @change-frequency="handleChangeFrequency"
          @verify-details="handleVerifyDetails"
        />
      </template>
      <template #bottom>
        <BottomPanel
          v-if="dataflowStore.dataflow.status && showBottomPanel"
          ref="bottomPanel"
          v-resize.top="{
            minHeight: 328,
          }"
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
        <ConsolePanel ref="consoleRef" />
      </template>
    </Canvas>

    <SkipError ref="skipErrorRef" @skip="startTask" />
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
</style>
