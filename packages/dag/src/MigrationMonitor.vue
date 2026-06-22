<script setup lang="ts">
import { batchMeasurements } from '@tap/api/src/core/measurement'
import { getTaskRecords, resetTask, startTask } from '@tap/api/src/core/task'
import UpgradeCharges from '@tap/business/src/components/UpgradeCharges.vue'
import UpgradeFee from '@tap/business/src/components/UpgradeFee.vue'
import {
  ALARM_LEVEL_SORT,
  TASK_STATUS_MAP,
} from '@tap/business/src/shared/const'
import SharedCacheDetails from '@tap/business/src/views/shared-cache/Details'
import SharedCacheEditor from '@tap/business/src/views/shared-cache/Editor'
import SharedMiningEditor from '@tap/business/src/views/shared-mining/Editor'
import SkipError from '@tap/business/src/views/task/SkipError.vue'
import VEmpty from '@tap/component/src/base/v-empty/VEmpty.vue'
import resize from '@tap/component/src/directives/resize'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import dagre from 'dagre'
import { debounce } from 'lodash-es'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import { MoveNodeCommand } from './command'
import ConfigPanel from './components/migration/ConfigPanel'
import ConsolePanel from './components/migration/ConsolePanel'
import BottomPanel from './components/monitor/BottomPanel'
import AlarmStatistics from './components/monitor/components/AlarmStatistics'
import NodeDetailDialog from './components/monitor/components/NodeDetailDialog'
import LeftSider from './components/monitor/LeftSider'
import Node from './components/monitor/Node'
import TopHeader from './components/monitor/TopHeader'
import { getTimeGranularity, TIME_FORMAT_MAP } from './components/monitor/util'
import PaperScroller from './components/PaperScroller'
import { NODE_PREFIX, NONSUPPORT_CDC, NONSUPPORT_SYNC } from './constants'
import { config, jsPlumb } from './instance'
import editor from './mixins/editor'
import formScope from './mixins/formScope'
import { allResourceIns } from './nodes/loader'
import { useDataflowStore } from './stores/dataflow.store'

defineOptions({
  name: 'MigrationMonitor',
  directives: { resize },
  components: {
    SkipError,
    UpgradeFee,
    UpgradeCharges,
    AlarmStatistics,
    VEmpty,
    ConfigPanel,
    BottomPanel,
    PaperScroller,
    TopHeader,
    Node,
    LeftSider,
    NodeDetailDialog,
    ConsolePanel,
    SharedMiningEditor,
    SharedCacheDetails,
    SharedCacheEditor,
  },
  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],
})

const dataflowStore = useDataflowStore()
const dataflow = dataflowStore.dataflow
const vm = getCurrentInstance()!.proxy as any
const router = useRouter()

const status = ref('draft')
const loading = ref(false)
const editable = ref(false)
const isSaving = ref(false)
const jsPlumbIns = jsPlumb.getInstance(config)
const navLines = ref<any[]>([])
const selectBoxAttr = ref<any>(null)
const selectActive = ref(false)
const showSelectBox = ref(false)

const nodeMenu = ref({
  show: false,
  type: '',
  typeId: '',
  reference: null as any,
  data: null as any,
  connectionData: {} as any,
})

const scale = ref(1)
const showBottomPanel = ref(false)
const timer = ref<any>(null)
const quotaTimeType = ref('5m')
const quotaTime = ref<any[]>([])
const quota = ref<any>({})
const nodeDetailDialog = ref(false)
const nodeDetailDialogId = ref('')
const timeFormat = ref('HH:mm:ss')
const dagData = ref<any>(null)
const verifyTotals = ref<any>(null)
const alarmData = ref<any>(null)
const logTotals = ref<any[]>([])
const refreshRate = ref(5000)
const extraEnterCount = ref(0)
const isReset = ref(false)
const watchStatusCount = ref(0)
const taskRecord = ref({ total: 0, items: [] as any[] })
const upgradeFeeVisible = ref(false)
const upgradeFeeVisibleTips = ref('')
const upgradeChargesVisible = ref(false)
const upgradeChargesVisibleTips = ref('')
const noNeedRefresh = ref(false)

const formScopeComputed = computed(() => ({
  ...vm.scope,
  $settings: dataflow,
}))

const firstStartTime = computed(() => {
  const { startTime } = dataflow || {}
  return startTime ? new Date(startTime).getTime() : null
})

const lastStopTime = computed(() => {
  const { stopTime } = dataflow || {}
  return stopTime ? new Date(stopTime).getTime() : null
})

const isEnterTimer = computed(() => {
  return (
    quotaTimeType.value !== 'custom' &&
    !nodeDetailDialog.value &&
    ['running', 'stopping'].includes(dataflow?.status)
  )
})

const timeSelectRange = computed(() => {
  let end = lastStopTime.value
  if (['running'].includes(dataflow.status)) {
    end = Time.now()
  }
  if (end < firstStartTime.value) {
    end = firstStartTime.value + 5 * 60 * 1000
  }
  return [firstStartTime.value, end || Time.now()]
})

const ifEnableConcurrentRead = computed(() => {
  if (dataflow.syncType !== 'migrate') return false
  const sourceNode = vm.allNodes.find(
    (node: any) => !node.$inputs.length && node.type === 'database',
  )
  return sourceNode?.enableConcurrentRead
})

watch(
  () => dataflow.type,
  (v: any) => {
    v && init()
  },
)

watch(
  () => dataflow.status,
  (v1: any, v2: any) => {
    watchStatusCount.value++

    if (watchStatusCount.value === 1) {
      // 进入页面后首次执行
      const flag = ['renewing', 'renew_failed'].includes(v1)
      vm.toggleConsole(flag)
      handleBottomPanel(!flag)
      noNeedRefresh.value = [
        'error',
        'schedule_failed',
        'stop',
        'complete',
      ].includes(v1)
    } else {
      // 状态变化，重置自动刷新状态
      noNeedRefresh.value = false
      extraEnterCount.value = 0
    }

    if (v1 !== v2) {
      init()
    }
    toggleConnectionRun(v1 === 'running')
  },
)

watch(
  () => dataflow.id,
  () => {
    vm.getTaskPermissions()
  },
)

// created
vm.setStateReadonly(true)

onMounted(async () => {
  vm.setValidateLanguage()
  // 收集pdk上节点的schema
  await vm.initPdkProperties()
  await initNodeType()
  // 加载权限
  await vm.getTaskPermissions()
  jsPlumbIns.ready(async () => {
    try {
      initConnectionType()
      vm.initCommand()
      vm.initNodeView()
      await vm.initView(true)
      toggleConnectionRun()
      // initWS()
    } catch (error) {
      console.error(error)
    }
  })
})

onBeforeUnmount(() => {
  vm.command = null
  jsPlumbIns?.destroy()
  vm.resetWorkspace()
  vm.resetState()
  vm.$ws.off('editFlush', vm.handleEditFlush)
  timer.value && clearInterval(timer.value)
  // $off(vm, 'loop-task')
})

const init = debounce(function () {
  timer.value && clearTimeout(timer.value)
  startLoadData()
}, 200)

function polling() {
  if (
    isEnterTimer.value ||
    (!noNeedRefresh.value &&
      ['error', 'schedule_failed', 'stop', 'complete'].includes(
        dataflow.status,
      ) &&
      ++extraEnterCount.value < 4)
  ) {
    startLoadData()
  }
}

async function startLoadData() {
  // 根据周期类型，计算时间范围
  if (quotaTimeType.value === 'lastStart') {
    const { id: taskId } = dataflow || {}
    const filter = {}
    await getTaskRecords(taskId, filter).then((data: any) => {
      const lastStartDate = data.items?.[0]?.startDate
      if (lastStartDate) {
        dataflow.lastStartDate = new Date(lastStartDate).getTime()
      }
    })
  }
  if (quotaTimeType.value !== 'custom') {
    quotaTime.value = getTimeRange(quotaTimeType.value)
  }
  loadData()
}

async function initNodeType() {
  vm.addResourceIns(allResourceIns)
  await vm.loadCustomNode()
}

async function openDataflow(id: any) {
  const data = await vm.loadDataflow(id)
  if (data) {
    if (vm.destory) return
    const { dag } = data
    vm.setTaskId(data.id)
    vm.setEdges(dag.edges)
    vm.setEditVersion(data.editVersion)
    vm.setStateDirty(false)

    await nextTick()
    await vm.addNodes(dag)
    await nextTick()
    await vm.initShareCache() // 共享缓存
    bindLoopTaskEvent()

    // 延迟自动布局，等待ResizeObserver
    setTimeout(() => {
      handleAutoLayout()
    }, 10)
  }
}

function bindLoopTaskEvent() {
  // $off(vm, 'loop-task')
  // $on(vm, 'loop-task', () => {
  //   if (!vm.sharedCacheMap || !Object.keys(vm.sharedCacheMap).length) {
  //     // 在重置后的任务监控页面启动,首次 initShareCache 获取不到数据
  //     vm.initShareCache()
  //   } else {
  //     const { usedShareCache = {} } = dataflow?.attrs || {}
  //     vm.setNodeShareCache(usedShareCache)
  //   }
  // })
}

function gotoViewer() {}

async function validate() {
  if (!dataflow.name)
    return vm.$t('packages_dag_editor_cell_validate_empty_name')

  // 至少两个数据节点
  const tableNode = vm.allNodes.filter((node: any) => node.type === 'database')
  if (tableNode.length < 2) {
    return vm.$t('packages_dag_editor_cell_validate_none_data_node')
  }

  await vm.validateAllNodes()

  const sourceMap: any = {}
  const targetMap: any = {}
  const edges = vm.allEdges
  edges.forEach((item: any) => {
    const _source = sourceMap[item.source]
    const _target = targetMap[item.target]

    if (!_source) {
      sourceMap[item.source] = [item]
    } else {
      _source.push(item)
    }

    if (!_target) {
      targetMap[item.target] = [item]
    } else {
      _target.push(item)
    }
  })

  let someErrorMsg = ''
  // 检查每个节点的源节点个数、连线个数、节点的错误状态
  vm.allNodes.some((node: any) => {
    const { id } = node
    const minInputs = node.__Ctor.minInputs ?? 1
    const inputNum = targetMap[id]?.length ?? 0

    if (!sourceMap[id] && !targetMap[id]) {
      someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
        val1: node.name,
      })
      return true
    }

    if (inputNum < minInputs) {
      someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
        val1: node.name,
        val2: minInputs,
      })
      return true
    }

    if (vm.hasNodeError(id)) {
      someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
        val1: node.name,
      })
      return true
    }
  })

  const nodeNames: string[] = []
  let typeName = ''
  if (dataflow.type === 'initial_sync+cdc') {
    typeName = i18n.t('public_task_type_initial_sync_and_cdc')
    tableNode.forEach((node: any) => {
      if (
        sourceMap[node.id] &&
        (NONSUPPORT_SYNC.includes(node.databaseType) ||
          NONSUPPORT_CDC.includes(node.databaseType))
      ) {
        nodeNames.push(node.name)
        vm.setNodeErrorMsg({
          id: node.id,
          msg:
            i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
            typeName,
        })
      }
    })
  } else if (dataflow.type === 'initial_sync') {
    typeName = i18n.t('public_task_type_initial_sync')
    tableNode.forEach((node: any) => {
      if (sourceMap[node.id] && NONSUPPORT_SYNC.includes(node.databaseType)) {
        nodeNames.push(node.name)
        vm.setNodeErrorMsg({
          id: node.id,
          msg:
            i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
            typeName,
        })
      }
    })
  } else if (dataflow.type === 'cdc') {
    typeName = i18n.t('public_task_type_cdc')
    tableNode.forEach((node: any) => {
      if (sourceMap[node.id] && NONSUPPORT_CDC.includes(node.databaseType)) {
        nodeNames.push(node.name)
        vm.setNodeErrorMsg({
          id: node.id,
          msg:
            i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
            typeName,
        })
      }
    })
  }

  if (nodeNames.length) {
    someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_cunzaibuzhichi', {
      val1: typeName,
    })
  }

  const accessNodeProcessIdArr = [
    ...tableNode.reduce((set: Set<any>, item: any) => {
      item.attrs.accessNodeProcessId && set.add(item.attrs.accessNodeProcessId)
      return set
    }, new Set()),
  ]

  if (accessNodeProcessIdArr.length > 1) {
    const chooseId = dataflow.accessNodeProcessId

    if (!chooseId) {
      someErrorMsg = i18n.t('packages_dag_mixins_editor_suoshuage')
    } else {
      let isError = false
      const agent = vm.scope.$agentMap[chooseId]
      tableNode.forEach((node: any) => {
        if (
          node.attrs.accessNodeProcessId &&
          chooseId !== node.attrs.accessNodeProcessId
        ) {
          vm.setNodeErrorMsg({
            id: node.id,
            msg: i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi', {
              val1: agent.hostName,
              val2: agent.ip,
            }),
          })
          isError = true
        }
      })
      isError &&
        (someErrorMsg = i18n.t('packages_dag_mixins_editor_suoshuage'))
    }
  } else if (accessNodeProcessIdArr.length === 1) {
    dataflow.accessNodeType = 'MANUALLY_SPECIFIED_BY_THE_USER'
    dataflow.accessNodeProcessId = accessNodeProcessIdArr[0]
  }

  if (someErrorMsg) return someErrorMsg

  const firstNodes = vm.allNodes.filter((node: any) => !targetMap[node.id])
  const nodeMap = vm.allNodes.reduce(
    (map: any, node: any) => ((map[node.id] = node), map),
    {},
  )
  if (
    firstNodes.some((node: any) => !vm.isEndOfTable(node, sourceMap, nodeMap))
  )
    return i18n.t('packages_dag_link_end_must_be_data_node')

  return null
}

function handlePageReturn() {
  const map: any = {
    migrate: 'migrateList',
    logCollector: 'sharedMining',
    shareCache: 'sharedCache',
    connHeartbeat: 'heartbeatTable',
  }
  router.push({
    name: map[dataflow.syncType] || 'dataflowList',
  })
  window.name = null as any
}

function handleEdit() {
  switch (dataflow.syncType) {
    case 'migrate':
      router.push({
        name: 'MigrateEditor',
        params: { id: dataflow.id },
      })
      break
    case 'sync':
      router.push({
        name: 'DataflowEditor',
        params: { id: dataflow.id },
      })
      break
    case 'logCollector':
      vm.$refs.sharedMiningEditor.open(dataflow.id)
      break
    case 'shareCache':
      vm.$refs.sharedCacheEditor.open(dataflow.id)
      break
  }
}

function handleShowVerify() {
  vm.deselectAllNodes()
  if (vm.activeType === 'verify') {
    vm.setActiveType(null)
  } else {
    vm.setActiveType('verify')
  }
}

function handleShowBottomPanel() {
  vm.toggleConsole(false)
  handleBottomPanel(!showBottomPanel.value)
}

function handleBottomPanel(flag = false) {
  showBottomPanel.value = flag
}

function handleAlarmShowBottomPanel() {
  //告警错误提示点击跳转到告警列表
  if (!showBottomPanel.value) {
    vm.toggleConsole(false)
    handleBottomPanel(true)
  }
  nextTick(() => {
    vm.$refs.bottomPanel.changeAlertTab('alert')
  })
}

async function handleStart(skip?: boolean, isDebug?: boolean) {
  const hasError = !skip && (await vm.$refs.skipError.checkError(dataflow))
  if (hasError) return

  if (['edit', 'wait_start'].includes(dataflow.status)) {
    const validateDropTableEnabled = await vm.validateDropTableEnabled()
    if (!validateDropTableEnabled) {
      isSaving.value = false
      return
    }
  }

  isSaving.value = true
  try {
    vm.wsAgentLive()
    await startTask(dataflow.id, {
      silenceMessage: true,
    })
    vm.$message.success(vm.$t('public_message_operation_success'))
    isSaving.value = false
    isReset.value = false
    // vm.loadDataflow(dataflow?.id)
    await openDataflow(dataflow?.id)
    vm.toggleConsole(false)
    handleBottomPanel(true)

    isDebug && vm.openDataCapture()
  } catch (error) {
    vm.handleError(error)
    isSaving.value = false
  }
}

function handleSkipAndRun() {
  handleStart(true)
}

function getQuotaFilter(type: string) {
  const { id: taskId, taskRecordId, agentId } = dataflow || {}
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
  const { id: taskId, taskRecordId } = dataflow || {}
  return {
    verifyTotals: {
      uri: `/api/task/auto-inspect-totals`,
      param: { id: dataflow.id },
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

function loadData() {
  if (!dataflow?.id) {
    return
  }
  if (isReset.value) {
    loadResetQuotaData()
    return
  }
  batchMeasurements(getParams(), { passive: true })
    .then((data: any) => {
      const map: any = {
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

function loadResetQuotaData() {
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
    q.samples[el] = []
  })
  quota.value = q
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

/**
 * 自动布局
 */
function handleAutoLayout() {
  const nodes = vm.allNodes
  if (nodes.length < 2) return

  let hasMove = false
  const nodePositionMap: any = {}
  const dg = new dagre.graphlib.Graph()
  const newProperties: any[] = []
  const oldProperties: any[] = []

  dg.setGraph({
    nodesep: 120,
    ranksep: 200,
    marginx: 0,
    marginy: 0,
    rankdir: 'LR',
  })
  dg.setDefaultEdgeLabel(function () {
    return {}
  })

  nodes.forEach((n: any) => {
    let { width, height } =
      document.getElementById(NODE_PREFIX + n.id)?.getBoundingClientRect() ||
      ({} as any)
    width /= scale.value
    height /= scale.value

    dg.setNode(NODE_PREFIX + n.id, { width, height })
    nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
  })
  jsPlumbIns.getAllConnections().forEach((edge: any) => {
    dg.setEdge(edge.source.id, edge.target.id)
  })

  dagre.layout(dg)
  dg.nodes().forEach((n: any) => {
    const node = dg.node(n)
    const top = Math.round(node.y - node.height / 2)
    const left = Math.round(node.x - node.width / 2)

    if (nodePositionMap[n].join(',') !== `${left},${top}`) {
      hasMove = true
      oldProperties.push({
        id: vm.getRealId(n),
        properties: { attrs: { position: nodePositionMap[n] } },
      })
      newProperties.push({
        id: vm.getRealId(n),
        properties: { attrs: { position: [left, top] } },
      })
    }
  })

  hasMove && vm.command.exec(new MoveNodeCommand(oldProperties, newProperties))
  vm.$refs.paperScroller.autoResizePaper()
  vm.$refs.paperScroller.centerContent()
}

function handleChangeTimeSelect(val: any, isTime: boolean, source?: any) {
  quotaTimeType.value = isTime ? 'custom' : (source?.type ?? val)
  quotaTime.value = isTime
    ? val?.split(',')?.map((t: string) => Number(t))
    : getTimeRange(val)
  init()
}

function handleChangeFrequency(val: number) {
  refreshRate.value = val
  init()
}

function getTimeRange(type: string) {
  let result
  const { status: st } = dataflow || {}
  let endTimestamp = lastStopTime.value || Time.now()
  if (st === 'running') {
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
      result = [dataflow.lastStartDate, endTimestamp]
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

function handleOpenDetail(node: any) {
  if (['mem_cache'].includes(node.type)) return
  nodeDetailDialogId.value = node.id
  // 设置弹窗的周期
  vm.$refs.nodeDetailDialog.quotaTime = quotaTime.value
  vm.$refs.nodeDetailDialog.quotaTimeType = quotaTimeType.value
  nodeDetailDialog.value = true
}

function handleVerifyDetails(table: any) {
  const routeUrl = router.resolve({
    name: 'VerifyDetails',
    params: { id: dataflow?.id },
    query: { table },
  })
  window.open(routeUrl.href)
}

function handleConnectionList(keyword: string) {
  const routeUrl = router.resolve({
    name: 'connectionsList',
    query: { keyword },
  })
  window.open(routeUrl.href)
}

function handleReset() {
  const msg = vm.getConfirmMessage('initialize')
  vm.$confirm(msg).then(async (resFlag: any) => {
    if (!resFlag) {
      return
    }
    try {
      dataflow.disabledData.reset = true
      handleBottomPanel()
      vm.toggleConsole(true)
      vm.$refs.console?.startAuto('reset') // 信息输出自动加载
      const data = await resetTask(dataflow.id)
      vm.responseHandler(data, vm.$t('public_message_operation_success'))
      if (!data?.fail?.length) {
        isReset.value = true
      }
      // init()
      vm.loadDataflow(dataflow?.id)
    } catch (error) {
      vm.handleError(error, vm.$t('packages_dag_message_operation_error'))
    }
  })
}

/**
 * 显示/隐藏连线动效
 */
function toggleConnectionRun(flag = dataflow.status === 'running') {
  if (flag) {
    jsPlumbIns.select().addClass('running')
  } else {
    jsPlumbIns.select().removeClass('running')
  }
}

/**
 * 初始化连接样式【告警、错误】
 */
function initConnectionType() {
  jsPlumbIns.registerConnectionTypes({
    error: {
      paintStyle: { stroke: '#D44D4D' },
      hoverPaintStyle: { stroke: '#D44D4D' },
    },
    warn: {
      paintStyle: { stroke: '#FF932C' },
      hoverPaintStyle: { stroke: '#FF932C' },
    },
  })
}

function handleStopAuto() {
  setTimeout(() => {
    dataflowStore.showConsole && vm.$refs.console?.autoLoad()
  }, 5000)
}

function getTime() {
  return Time.now()
}

function getTaskStatus(type: string) {
  return (TASK_STATUS_MAP as any)[type] || ''
}

function upgradeFeeGoPage() {
  const routeUrl = router.resolve({
    name: 'createAgent',
  })
  window.open(routeUrl.href, '_blank')
}

function handleBottomPanelAction(data: any = {}) {
  if (data.type === 'ScheduleLimit') {
    vm.handleShowUpgradeDialog()
  }
}

function handleOpenInspect() {
  vm.$refs.topHeader.openValidation = true
}
</script>

<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      ref="topHeader"
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      :show-bottom-panel="showBottomPanel"
      :quota="quota"
      :button-show-map="buttonShowMap"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @change-name="handleUpdateName"
      @auto-layout="handleAutoLayout"
      @center-content="handleCenterContent"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @zoom-to="handleZoomTo"
      @show-settings="handleShowSettings"
      @show-verify="handleShowVerify"
      @show-bottom-panel="handleShowBottomPanel"
      @locate-node="handleLocateNode"
      @start="handleStart(false, false)"
      @debug-start="handleStart(false, true)"
      @open-capture="openDataCapture"
      @stop="handleStop"
      @force-stop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @load-data="init"
    >
      <template #status="{ result }">
        <span
          v-if="result && result[0]"
          :class="[`status-${result[0].status}`, 'status-block', 'mr-2']"
        >
          {{ getTaskStatus(result[0].status) }}
        </span>
      </template>
    </TopHeader>
    <section
      class="layout-wrap layout-has-sider position-relative font-color-light"
    >
      <!--左侧边栏-->
      <LeftSider
        v-resize.right="{
          minWidth: 356,
          maxWidth: 750,
        }"
        :dataflow="dataflow"
        :quota="quota"
        :verify-totals="verifyTotals"
        :time-format="timeFormat"
        :range="timeSelectRange"
        :if-enable-concurrent-read="ifEnableConcurrentRead"
        @load-data="init"
        @move-node="handleDragMoveNode"
        @drop-node="handleAddNodeByDrag"
        @add-node="handleAddNode"
        @toggle-expand="handleToggleExpand"
        @change-time-select="handleChangeTimeSelect"
        @change-frequency="handleChangeFrequency"
        @verify-details="handleVerifyDetails"
      >
        <template #status="{ result }">
          <span
            v-if="result && result[0]"
            :class="[`status-${result[0].status}`, 'status-block']"
          >
            {{ getTaskStatus(result[0].status) }}
          </span>
        </template>
      </LeftSider>
      <div
        v-if="!stateIsReadonly"
        class="sider-expand-wrap flex justify-center align-center rotate-180"
      >
        <VIcon
          size="24"
          class="font-color-light"
          @click.stop="handleToggleExpand"
          >expand</VIcon
        >
      </div>
      <!--内容体-->
      <section class="layout-wrap flex-1">
        <main
          id="dfEditorContent"
          ref="layoutContent"
          class="layout-content flex flex-column flex-1 overflow-hidden"
        >
          <PaperScroller
            ref="paperScroller"
            :nav-lines="navLines"
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
          >
            <Node
              v-for="n in allNodes"
              :id="NODE_PREFIX + n.id"
              :key="n.id"
              :node-id="n.id"
              :node="n"
              :js-plumb-ins="jsPlumbIns"
              :class="{
                'options-active': nodeMenu.typeId === n.id,
              }"
              :dataflow="dataflow"
              :task-type="dataflow.type"
              :sync-type="dataflow.syncType"
              :sample="dagData ? dagData[n.id] : {}"
              :quota="quota"
              :alarm="alarmData ? alarmData.nodes[n.id] : undefined"
              @drag-start="onNodeDragStart"
              @drag-move="onNodeDragMove"
              @drag-stop="onNodeDragStop"
              @deselect-all-nodes="deselectAllNodes"
              @deselect-node="nodeDeselectedById"
              @node-selected="nodeSelectedById"
              @delete="handleDeleteById"
              @show-node-popover="showNodePopover"
              @open-detail="handleOpenDetail(n)"
              @open-shared-cache="handleOpenSharedCache"
              @refresh-shared-cache="initShareCache"
            />
          </PaperScroller>
          <div
            v-if="!allNodes.length && stateIsReadonly"
            class="absolute-fill flex justify-center align-center"
          >
            <VEmpty large />
          </div>

          <AlarmStatistics
            :alarm-num="alarmData ? alarmData.alarmNum : undefined"
            @show-bottom-panel="handleAlarmShowBottomPanel"
          />
        </main>
        <BottomPanel
          v-if="dataflow && dataflow.status && showBottomPanel"
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
          @load-data="init"
          @show-bottom-panel="handleShowBottomPanel"
          @action="handleBottomPanelAction"
          @start="handleStart(false, false)"
        />
        <ConsolePanel ref="console" @stop-auto="handleStopAuto" />
      </section>
      <!--配置面板-->
      <ConfigPanel
        ref="configPanel"
        :settings="dataflow"
        :scope="formScopeComputed"
        :show-schema-panel="dataflow.syncType === 'sync'"
        :sync-type="dataflow.syncType"
        :button-show-map="buttonShowMap"
        @hide="onHideSidebar"
      />

      <!--   节点详情   -->
      <NodeDetailDialog
        ref="nodeDetailDialog"
        v-model:value="nodeDetailDialog"
        :dataflow="dataflow"
        :node-id="nodeDetailDialogId"
        :time-format="timeFormat"
        :range="[firstStartTime, lastStopTime || getTime()]"
        :quota-time="quotaTime"
        :quota-time-type="quotaTimeType"
        :get-time-range="getTimeRange"
        :if-enable-concurrent-read="ifEnableConcurrentRead"
        @load-data="init"
      />

      <SharedMiningEditor
        v-if="['logCollector'].includes(dataflow.syncType)"
        ref="sharedMiningEditor"
      />

      <SharedCacheDetails ref="sharedCacheDetails" width="380px" />

      <SharedCacheEditor
        v-if="['shareCache'].includes(dataflow.syncType)"
        ref="sharedCacheEditor"
      />

      <UpgradeFee
        v-model:visible="upgradeFeeVisible"
        :tooltip="
          upgradeFeeVisibleTips ||
          $t('packages_business_task_list_nindekeyunxing')
        "
        :go-page="upgradeFeeGoPage"
      />

      <UpgradeCharges
        v-model:visible="upgradeChargesVisible"
        :tooltip="
          upgradeChargesVisibleTips ||
          $t('packages_business_task_list_nindekeyunxing')
        "
        :go-page="upgradeFeeGoPage"
      />
      <SkipError ref="skipError" @skip="handleSkipAndRun" />
    </section>
  </section>
</template>

<style lang="scss" scoped>
$sidebarW: 356px;
$hoverBg: #e1e1e1;
$radius: 3px;
$baseHeight: 26px;
$sidebarBg: var(--el-bg-color);

.layout-sidebar {
  position: relative;
  z-index: 10;
  display: flex;
  width: $sidebarW;
  height: 100%;
  background-color: $sidebarBg;
  overflow: auto;

  &.--right {
    width: 726px;
  }
}

.layout-wrap {
  display: flex;
  flex: auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  &.layout-has-sider {
    flex-direction: row;
  }
}

.layout-content {
  position: relative;
  background-color: #f9f9f9;

  :deep(.connection-highlight),
  :deep(.connection-selected) {
    path:nth-child(2) {
      stroke: #2c65ff;
    }

    path:nth-child(3) {
      fill: #2c65ff;
      stroke: #2c65ff;
    }
  }

  :deep(.remove-connection-label) {
    z-index: 1001;
    position: relative;
    padding: 4px;
    border-radius: 100%;
    background-color: #fa6303;
    box-sizing: border-box;

    .remove-connection-btn {
      width: 1em;
      height: 1em;
      font-size: 6px;
      background: transparent
        url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e")
        center/1em auto no-repeat;
      transition: font-size 0.15s ease-in-out;
    }

    &:hover {
      .remove-connection-btn {
        font-size: 10px;
      }
    }
  }

  :deep(.conn-btn__wrap) {
    z-index: 1002;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:hover {
      transform: translate(-50%, -50%) scale(1.2) !important;
    }
  }

  :deep(.conn-btn) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    background-color: #9bb6ff;
    border-radius: 100%;
    pointer-events: none;

    .v-icon {
      width: 16px;
      height: 16px;
      font-size: 12px;
      background-color: #2c65ff;
      color: #fff;
      border-radius: 100%;

      &__svg {
        width: 1em;
        height: 1em;
      }
    }
  }
}

.nav-line {
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  border-top: 1px dashed #ff5b37;
  border-left: 1px dashed #ff5b37;
}

.select-box {
  position: absolute;
  background: rgba(23, 159, 251, 0.1);
  border: 1px solid #179ffb;
}

.node-view {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.node-view-background {
  position: absolute;
  width: 10000px;
  height: 10000px;
  top: -5000px;
  left: -5000px;
}

.sider-expand-wrap {
  position: absolute;
  z-index: 2;
  left: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0px 0px 30px rgb(0 0 0 / 6%);

  &:hover .v-icon {
    color: var(--color-primary);
  }
}
</style>
