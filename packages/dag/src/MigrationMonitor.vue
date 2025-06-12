<script>
import { observable } from '@formily/reactive'
import { databaseTypesApi, measurementApi, taskApi } from '@tap/api'
import {
  ALARM_LEVEL_SORT,
  SkipError,
  TASK_STATUS_MAP,
  UpgradeCharges,
  UpgradeFee,
} from '@tap/business'
import SharedCacheDetails from '@tap/business/src/views/shared-cache/Details'
import SharedCacheEditor from '@tap/business/src/views/shared-cache/Editor'

import SharedMiningEditor from '@tap/business/src/views/shared-mining/Editor'
import { VEmpty, VExpandXTransition, VIcon } from '@tap/component'
import resize from '@tap/component/src/directives/resize'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import dagre from 'dagre'
import { debounce } from 'lodash-es'
import { mapMutations, mapState } from 'vuex'
import { $emit, $off, $on, $once } from '../utils/gogocodeTransfer'

import { MoveNodeCommand } from './command'
import MaterializedView from './components/materialized-view/MaterializedView.vue'
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
import {
  NODE_HEIGHT,
  NODE_PREFIX,
  NODE_WIDTH,
  NONSUPPORT_CDC,
  NONSUPPORT_SYNC,
} from './constants'
import { config, jsPlumb } from './instance'
import editor from './mixins/editor'
import formScope from './mixins/formScope'
import { allResourceIns } from './nodes/loader'

export default {
  name: 'MigrationMonitor',

  directives: {
    resize,
  },

  components: {
    SkipError,
    MaterializedView,
    UpgradeFee,
    UpgradeCharges,
    AlarmStatistics,
    VExpandXTransition,
    VEmpty,
    ConfigPanel,
    BottomPanel,
    PaperScroller,
    TopHeader,
    Node,
    LeftSider,
    VIcon,
    NodeDetailDialog,
    ConsolePanel,
    SharedMiningEditor,
    SharedCacheDetails,
    SharedCacheEditor,
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  data() {
    const dataflow = observable({
      id: '',
      name: '',
      status: '',
      attrs: {},
    })

    return {
      NODE_PREFIX,
      status: 'draft',
      loading: false,
      editable: false,
      isSaving: false,
      jsPlumbIns: jsPlumb.getInstance(config),
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false,

      nodeMenu: {
        show: false,
        type: '',
        typeId: '',
        reference: null,
        data: null,
        connectionData: {},
      },

      dataflow,

      scale: 1,
      showBottomPanel: false,
      timer: null,
      quotaTimeType: '5m',
      quotaTime: [],
      quota: {}, // 指标数据
      nodeDetailDialog: false,
      nodeDetailDialogId: '',
      timeFormat: 'HH:mm:ss',
      dagData: null,
      verifyTotals: null,
      alarmData: null,
      logTotals: [],
      refreshRate: 5000,
      extraEnterCount: 0,
      isReset: false, // 是否重置了
      watchStatusCount: 0,
      taskRecord: {
        total: 0,
        items: [],
      },
      upgradeFeeVisible: false,
      upgradeFeeVisibleTips: '',
      upgradeChargesVisible: false,
      upgradeChargesVisibleTips: '',
      noNeedRefresh: false, // 如果进入页面任务是停止运行状态，无需刷新
    }
  },

  computed: {
    ...mapState('dataflow', ['showConsole']),

    formScope() {
      return {
        ...this.scope,
        $settings: this.dataflow,
      }
    },

    firstStartTime() {
      const { startTime } = this.dataflow || {}
      return startTime ? new Date(startTime).getTime() : null
    },

    lastStopTime() {
      const { stopTime } = this.dataflow || {}
      return stopTime ? new Date(stopTime).getTime() : null
    },

    isEnterTimer() {
      return (
        this.quotaTimeType !== 'custom' &&
        !this.nodeDetailDialog &&
        ['running', 'stopping'].includes(this.dataflow?.status)
      )
    },

    timeSelectRange() {
      const { firstStartTime, lastStopTime } = this
      let end = lastStopTime
      if (['running'].includes(this.dataflow.status)) {
        end = Time.now()
      }
      if (end < firstStartTime) {
        end = firstStartTime + 5 * 60 * 1000
      }
      return [firstStartTime, end || Time.now()]
    },

    ifEnableConcurrentRead() {
      if (this.dataflow.syncType !== 'migrate') return false

      const sourceNode = this.allNodes.find(
        (node) => !node.$inputs.length && node.type === 'database',
      )

      return sourceNode?.enableConcurrentRead
    },
  },

  watch: {
    'dataflow.type': function (v) {
      v && this.init()
    },
    'dataflow.status': function (v1, v2) {
      this.watchStatusCount++

      if (this.watchStatusCount === 1) {
        // 进入页面后首次执行
        const flag = ['renewing', 'renew_failed'].includes(v1)
        this.toggleConsole(flag)
        this.handleBottomPanel(!flag)
        this.noNeedRefresh = [
          'error',
          'schedule_failed',
          'stop',
          'complete',
        ].includes(v1)
      } else {
        // 状态变化，重置自动刷新状态
        this.noNeedRefresh = false
        this.extraEnterCount = 0
      }

      if (v1 !== v2) {
        this.init()
      }
      this.toggleConnectionRun(v1 === 'running')
    },
    'dataflow.id': function () {
      this.getTaskPermissions()
    },
  },

  created() {
    // 进入监控只读
    this.setStateReadonly(true)
  },

  async mounted() {
    this.setValidateLanguage()
    // 收集pdk上节点的schema
    await this.initPdkProperties()
    await this.initNodeType()
    // 加载权限
    await this.getTaskPermissions()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initConnectionType()
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
        this.toggleConnectionRun()
        // this.initWS()
      } catch (error) {
        console.error(error)
      }
    })
  },

  beforeUnmount() {
    this.command = null
    this.jsPlumbIns?.destroy()
    this.resetWorkspace()
    this.resetState()
    this.$ws.off('editFlush', this.handleEditFlush)
    this.timer && clearInterval(this.timer)
    $off(this, 'loop-task')
  },

  methods: {
    ...mapMutations('dataflow', ['setPdkPropertiesMap']),

    init: debounce(function () {
      this.timer && clearTimeout(this.timer)
      this.startLoadData()
    }, 200),

    polling() {
      if (
        this.isEnterTimer ||
        (!this.noNeedRefresh &&
          ['error', 'schedule_failed', 'stop', 'complete'].includes(
            this.dataflow.status,
          ) &&
          ++this.extraEnterCount < 4)
      ) {
        this.startLoadData()
      }
    },

    async startLoadData() {
      // 根据周期类型，计算时间范围
      if (this.quotaTimeType === 'lastStart') {
        const { id: taskId } = this.dataflow || {}
        const filter = {}
        await taskApi.records(taskId, filter).then((data) => {
          const lastStartDate = data.items?.[0]?.startDate
          if (lastStartDate) {
            this.dataflow.lastStartDate = new Date(lastStartDate).getTime()
          }
        })
      }
      if (this.quotaTimeType !== 'custom') {
        this.quotaTime = this.getTimeRange(this.quotaTimeType)
      }
      this.loadData()
    },

    async initNodeType() {
      this.addResourceIns(allResourceIns)
      await this.loadCustomNode()
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)
      if (data) {
        if (this.destory) return
        const { dag } = data
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        await this.initShareCache() // 共享缓存
        this.bindLoopTaskEvent()

        // 延迟自动布局，等待ResizeObserver
        setTimeout(() => {
          this.handleAutoLayout()
        }, 10)
      }
    },

    bindLoopTaskEvent() {
      $off(this, 'loop-task')
      $on(this, 'loop-task', () => {
        if (!this.sharedCacheMap || !Object.keys(this.sharedCacheMap).length) {
          // 在重置后的任务监控页面启动,首次 initShareCache 获取不到数据
          this.initShareCache()
        } else {
          const { usedShareCache = {} } = this.dataflow?.attrs || {}
          this.setNodeShareCache(usedShareCache)
        }
      })
    },

    gotoViewer() {},

    async validate() {
      if (!this.dataflow.name)
        return this.$t('packages_dag_editor_cell_validate_empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter((node) => node.type === 'database')
      if (tableNode.length < 2) {
        return this.$t('packages_dag_editor_cell_validate_none_data_node')
      }

      await this.validateAllNodes()

      const sourceMap = {},
        targetMap = {},
        edges = this.allEdges
      edges.forEach((item) => {
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
      this.allNodes.some((node) => {
        const { id } = node
        const minInputs = node.__Ctor.minInputs ?? 1
        const inputNum = targetMap[id]?.length ?? 0

        if (!sourceMap[id] && !targetMap[id]) {
          // 存在没有连线的节点
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

        if (this.hasNodeError(id)) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitor_noden', {
            val1: node.name,
          })
          return true
        }
      })

      const nodeNames = []
      let typeName = ''
      // 根据任务类型(全量、增量),检查不支持此类型的节点
      // 脏代码。这里的校验是有节点错误信息提示的，和节点表单校验揉在了一起，但是校验没有一起做
      if (this.dataflow.type === 'initial_sync+cdc') {
        typeName = i18n.t('public_task_type_initial_sync_and_cdc')
        tableNode.forEach((node) => {
          if (
            sourceMap[node.id] &&
            (NONSUPPORT_SYNC.includes(node.databaseType) ||
              NONSUPPORT_CDC.includes(node.databaseType))
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg:
                i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
                typeName,
            })
          }
        })
      } else if (this.dataflow.type === 'initial_sync') {
        typeName = i18n.t('public_task_type_initial_sync')
        tableNode.forEach((node) => {
          if (
            sourceMap[node.id] &&
            NONSUPPORT_SYNC.includes(node.databaseType)
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg:
                i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
                typeName,
            })
          }
        })
      } else if (this.dataflow.type === 'cdc') {
        typeName = i18n.t('public_task_type_cdc')
        tableNode.forEach((node) => {
          if (
            sourceMap[node.id] &&
            NONSUPPORT_CDC.includes(node.databaseType)
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg:
                i18n.t('packages_dag_src_migrationmonitor_gaijiedianbuzhi') +
                typeName,
            })
          }
        })
      }

      if (nodeNames.length) {
        someErrorMsg = i18n.t(
          'packages_dag_src_migrationmonitor_cunzaibuzhichi',
          { val1: typeName },
        )
      }

      const accessNodeProcessIdArr = [
        ...tableNode.reduce((set, item) => {
          item.attrs.accessNodeProcessId &&
            set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set()),
      ]

      if (accessNodeProcessIdArr.length > 1) {
        // 所属agent节点冲突
        const chooseId = this.dataflow.accessNodeProcessId

        if (!chooseId) {
          // someErrorMsg = `请配置任务运行agent`
          someErrorMsg = `所属agent节点冲突` // 一样提示冲突
        } else {
          let isError = false
          const agent = this.scope.$agentMap[chooseId]
          tableNode.forEach((node) => {
            if (
              node.attrs.accessNodeProcessId &&
              chooseId !== node.attrs.accessNodeProcessId
            ) {
              this.setNodeErrorMsg({
                id: node.id,
                msg: i18n.t(
                  'packages_dag_src_migrationmonitor_gaijiedianbuzhi',
                  {
                    val1: agent.hostName,
                    val2: agent.ip,
                  },
                ),
              })
              isError = true
            }
          })
          isError && (someErrorMsg = `所属agent节点冲突`)
        }
      } else if (accessNodeProcessIdArr.length === 1) {
        // 如果画布上仅有一个所属agent，自动设置为任务的agent
        this.dataflow.accessNodeType = 'MANUALLY_SPECIFIED_BY_THE_USER'
        this.dataflow.accessNodeProcessId = accessNodeProcessIdArr[0]
      }

      if (someErrorMsg) return someErrorMsg

      // 检查链路的末尾节点类型是否是表节点
      const firstNodes = this.allNodes.filter((node) => !targetMap[node.id]) // 链路的首节点
      const nodeMap = this.allNodes.reduce(
        (map, node) => ((map[node.id] = node), map),
        {},
      )
      if (
        firstNodes.some((node) => !this.isEndOfTable(node, sourceMap, nodeMap))
      )
        return `链路的末位需要是一个数据节点`

      return null
    },

    handlePageReturn() {
      const map = {
        migrate: 'migrateList',
        logCollector: 'sharedMining',
        shareCache: 'sharedCache',
        connHeartbeat: 'heartbeatTable',
      }
      this.$router.push({
        name: map[this.dataflow.syncType] || 'dataflowList',
      })
      window.name = null
    },

    handleEdit() {
      switch (this.dataflow.syncType) {
        case 'migrate':
          this.$router.push({
            name: 'MigrateEditor',
            params: { id: this.dataflow.id },
          })
          break
        case 'sync':
          this.$router.push({
            name: 'DataflowEditor',
            params: { id: this.dataflow.id },
          })
          break
        case 'logCollector':
          this.$refs.sharedMiningEditor.open(this.dataflow.id)
          break
        case 'shareCache':
          this.$refs.sharedCacheEditor.open(this.dataflow.id)
          break
      }
    },

    handleShowVerify() {
      this.deselectAllNodes()
      if (this.activeType === 'verify') {
        this.setActiveType(null)
      } else {
        this.setActiveType('verify')
      }
    },

    handleShowBottomPanel() {
      this.toggleConsole(false)
      this.handleBottomPanel(!this.showBottomPanel)
    },

    handleBottomPanel(flag = false) {
      this.showBottomPanel = flag
    },

    handleAlarmShowBottomPanel() {
      //告警错误提示点击跳转到告警列表
      if (!this.showBottomPanel) {
        this.toggleConsole(false)
        this.handleBottomPanel(true)
      }
      this.$nextTick(() => {
        this.$refs.bottomPanel.changeAlertTab('alert')
      })
    },

    async handleStart(skip, isDebug) {
      const hasError =
        !skip && (await this.$refs.skipError.checkError(this.dataflow))
      if (hasError) return

      this.isSaving = true
      try {
        this.wsAgentLive()
        await taskApi.start(this.dataflow.id, {
          silenceMessage: true,
        })
        this.$message.success(this.$t('public_message_operation_success'))
        this.isSaving = false
        this.isReset = false
        // this.loadDataflow(this.dataflow?.id)
        await this.openDataflow(this.dataflow?.id)
        this.toggleConsole(false)
        this.handleBottomPanel(true)

        isDebug && this.openDataCapture()
      } catch (error) {
        this.handleError(error)
        this.isSaving = false
      }
    },

    handleSkipAndRun() {
      this.handleStart(true)
    },

    getQuotaFilter(type) {
      const { id: taskId, taskRecordId, agentId } = this.dataflow || {}
      const [startAt, endAt] = this.quotaTime
      const params = {
        startAt,
        endAt,
        samples: {},
      }
      const samples = {
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
    },

    getParams() {
      const { id: taskId, taskRecordId } = this.dataflow || {}
      const params = {
        verifyTotals: {
          uri: `/api/task/auto-inspect-totals`,
          param: {
            id: this.dataflow.id,
          },
        },
        alarmData: {
          uri: '/api/alarm/list_task',
          param: {
            taskId,
          },
        },
        logTotals: {
          uri: '/api/MonitoringLogs/count',
          param: {
            taskId,
            taskRecordId,
          },
        },
        totalData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('totalData'),
        },
        barChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('barChartData'),
        },
        lineChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('lineChartData'),
        },
        dagData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('dagData'),
        },
        agentData: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter('agentData'),
        },
        taskRecord: {
          uri: '/api/task/records',
          param: {
            taskId,
            size: 200,
            page: 1,
          },
        },
      }
      return params
    },

    loadData() {
      if (!this.dataflow?.id) {
        return
      }
      if (this.isReset) {
        this.loadResetQuotaData()
        return
      }
      measurementApi
        .batch(this.getParams())
        .then((data) => {
          const map = {
            verifyTotals: this.loadVerifyTotals,
            alarmData: this.loadAlarmData,
            logTotals: this.loadLogTotals,
            taskRecord: this.loadTaskRecord,
          }
          for (const key in data) {
            const item = data[key]
            if (item.code === 'ok') {
              map[key]?.(data[key].data)
            }
          }
          this.loadQuotaData(data)
        })
        .finally(() => {
          this.timer && clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.polling()
          }, this.refreshRate)
        })
    },

    loadQuotaData(data) {
      const quota = {
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
          quota.samples[el] = item.data?.samples?.data
          if (item.data?.interval) {
            quota.interval = item.data.interval
          }
          if (item.data?.time) {
            quota.time = item.data.time
          }
        }
      })
      this.quota = quota
      const granularity = getTimeGranularity(this.quota.interval)
      this.timeFormat = TIME_FORMAT_MAP[granularity]
      this.dagData = this.getDagData(this.quota.samples.dagData)
    },

    loadResetQuotaData() {
      const quota = {
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
        quota.samples[el] = []
      })
      this.quota = quota
      this.dagData = {}
      this.loadVerifyTotals()
      this.loadAlarmData()
      this.loadLogTotals()
      this.loadTaskRecord()
    },

    loadVerifyTotals(data = {}) {
      const { diffRecords = 0, diffTables = 0, totals = 0, ignore = 0 } = data
      this.verifyTotals = {
        diffRecords,
        diffTables,
        totals,
        ignore,
      }
    },

    loadAlarmData(data = {}) {
      const { alarmNum = {}, nodeInfos = [], alarmList = [] } = data
      const { alert = 0, error = 0 } = alarmNum
      const nodes = alarmList
        .filter((t) => t.nodeId && t.level)
        .reduce((cur, next) => {
          const index = ALARM_LEVEL_SORT.indexOf(cur[next.nodeId]?.level)
          return {
            ...cur,
            [next.nodeId]:
              index !== -1 && index < ALARM_LEVEL_SORT.indexOf(next.level)
                ? cur[next.nodeId]
                : next,
          }
        }, {})
      this.alarmData = {
        alarmNum: {
          alert,
          error,
        },
        nodeInfos: nodeInfos.map((t) => {
          return Object.assign({}, t, {
            num: t.num || 0,
          })
        }),
        alarmList,
        nodes,
      }
    },

    loadLogTotals(data = []) {
      this.logTotals = data
    },

    loadTaskRecord(data) {
      if (!data) return
      this.taskRecord = data
    },

    getDagData(data = []) {
      return data.reduce((pre, current) => {
        return { ...pre, [current.tags.nodeId]: current }
      }, {})
    },

    /**
     * 自动布局
     */
    handleAutoLayout() {
      const nodes = this.allNodes
      if (nodes.length < 2) return

      let hasMove = false
      const nodePositionMap = {}
      const dg = new dagre.graphlib.Graph()
      const newProperties = []
      const oldProperties = []

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

      nodes.forEach((n) => {
        dg.setNode(NODE_PREFIX + n.id, {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
      })
      this.jsPlumbIns.getAllConnections().forEach((edge) => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)
      dg.nodes().forEach((n) => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          hasMove = true
          oldProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: nodePositionMap[n],
              },
            },
          })
          newProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top],
              },
            },
          })
        }
      })

      hasMove &&
        this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
      this.$refs.paperScroller.autoResizePaper()
      this.$refs.paperScroller.centerContent()
    },

    handleChangeTimeSelect(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime
        ? val?.split(',')?.map((t) => Number(t))
        : this.getTimeRange(val)
      this.init()
    },

    handleChangeFrequency(val) {
      this.refreshRate = val
      this.init()
    },

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime || Time.now()
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
          result = [this.dataflow.lastStartDate, endTimestamp]
          break
        case 'full':
          result = [this.firstStartTime, endTimestamp]
          break
        case 'incremental':
          result = [
            this.quota.samples?.totalData?.[0].snapshotDoneAt + 10000,
            endTimestamp,
          ]
          break
        default:
          result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
          break
      }
      return result
    },

    handleOpenDetail(node) {
      if (['mem_cache'].includes(node.type)) return
      this.nodeDetailDialogId = node.id
      // 设置弹窗的周期
      this.$refs.nodeDetailDialog.quotaTime = this.quotaTime
      this.$refs.nodeDetailDialog.quotaTimeType = this.quotaTimeType
      this.nodeDetailDialog = true
    },

    handleVerifyDetails(table) {
      const routeUrl = this.$router.resolve({
        name: 'VerifyDetails',
        params: {
          id: this.dataflow?.id,
        },
        query: {
          table,
        },
      })
      window.open(routeUrl.href)
    },

    handleConnectionList(keyword) {
      const routeUrl = this.$router.resolve({
        name: 'connectionsList',
        query: {
          keyword,
        },
      })
      window.open(routeUrl.href)
    },

    handleReset() {
      const msg = this.getConfirmMessage('initialize')
      this.$confirm(msg).then(async (resFlag) => {
        if (!resFlag) {
          return
        }
        try {
          this.dataflow.disabledData.reset = true
          this.handleBottomPanel()
          this.toggleConsole(true)
          this.$refs.console?.startAuto('reset') // 信息输出自动加载
          const data = await taskApi.reset(this.dataflow.id)
          this.responseHandler(
            data,
            this.$t('public_message_operation_success'),
          )
          if (!data?.fail?.length) {
            this.isReset = true
          }
          // this.init()
          this.loadDataflow(this.dataflow?.id)
        } catch (error) {
          this.handleError(
            error,
            this.$t('packages_dag_message_operation_error'),
          )
        }
      })
    },

    /**
     * 显示/隐藏连线动效
     * @param flag
     */
    toggleConnectionRun(flag = this.dataflow.status === 'running') {
      if (flag) {
        this.jsPlumbIns.select().addClass('running')
      } else {
        this.jsPlumbIns.select().removeClass('running')
      }
    },

    /**
     * 初始化连接样式【告警、错误】
     */
    initConnectionType() {
      this.jsPlumbIns.registerConnectionTypes({
        error: {
          paintStyle: { stroke: '#D44D4D' },
          hoverPaintStyle: { stroke: '#D44D4D' },
        },
        warn: {
          paintStyle: { stroke: '#FF932C' },
          hoverPaintStyle: { stroke: '#FF932C' },
        },
      })
    },

    handleStopAuto() {
      setTimeout(() => {
        this.showConsole && this.$refs.console?.autoLoad()
      }, 5000)
    },

    getTime() {
      return Time.now()
    },

    getTaskStatus(type) {
      return TASK_STATUS_MAP[type] || ''
    },

    handleOpenSharedCache(row = {}) {
      this.$refs.sharedCacheDetails?.getData(row.id)
    },

    upgradeFeeGoPage() {
      const routeUrl = this.$router.resolve({
        name: 'createAgent',
      })
      window.open(routeUrl.href, '_blank')
    },

    handleBottomPanelAction(data = {}) {
      if (data.type === 'ScheduleLimit') {
        this.handleShowUpgradeDialog()
      }
    },

    handleOpenInspect() {
      this.$refs.topHeader.openValidation = true
    },
  },
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
        />
        <ConsolePanel ref="console" @stop-auto="handleStopAuto" />
      </section>
      <!--配置面板-->
      <ConfigPanel
        ref="configPanel"
        :settings="dataflow"
        :scope="formScope"
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

      <MaterializedView
        ref="materializedView"
        v-model:visible="materializedViewVisible"
        disabled
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
$sidebarBg: #fff;

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
    color: map.get($color, primary);
  }
}
</style>
