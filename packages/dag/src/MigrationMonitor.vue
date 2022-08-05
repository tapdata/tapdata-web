<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      :showBottomPanel="showBottomPanel"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @change-name="handleUpdateName"
      @showSettings="handleShowSettings"
      @showVerify="handleShowVerify"
      @showBottomPanel="handleShowBottomPanel"
      @locate-node="handleLocateNode"
      @start="handleStart"
      @stop="handleStop"
      @forceStop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @detail="handleDetail"
    >
      <template #status="{ result }">
        <span v-if="result && result[0]" :class="['status-' + result[0].status, 'status-block', 'mr-2']">
          {{ t('task_preview_status_' + result[0].status) }}
        </span>
      </template>
    </TopHeader>
    <section class="layout-wrap layout-has-sider position-relative font-color-light">
      <!--左侧边栏-->
      <VExpandXTransition>
        <LeftSider
          v-resize.right="{
            minWidth: 356,
            maxWidth: 750
          }"
          :dataflow="dataflow"
          :quota="quota"
          :timeFormat="timeFormat"
          :range="[firstStartTime, lastStopTime || Date.now()]"
          @move-node="handleDragMoveNode"
          @drop-node="handleAddNodeByDrag"
          @add-node="handleAddNode"
          @toggle-expand="handleToggleExpand"
          @changeTimeSelect="handleChangeTimeSelect"
        >
          <template #status="{ result }">
            <span v-if="result && result[0]" :class="['status-' + result[0].status, 'status-block']">
              {{ t('task_preview_status_' + result[0].status) }}
            </span>
          </template>
        </LeftSider>
      </VExpandXTransition>
      <div v-if="!stateIsReadonly" class="sider-expand-wrap flex justify-center align-center rotate-180">
        <VIcon size="24" class="font-color-light" @click.stop="handleToggleExpand">expand</VIcon>
      </div>
      <!--内容体-->
      <main id="dfEditorContent" ref="layoutContent" class="layout-content flex flex-column flex-1 overflow-hidden">
        <PaperScroller
          ref="paperScroller"
          :nav-lines="navLines"
          @add-node="handleAddNodeToPos"
          @mouse-select="handleMouseSelect"
          @change-scale="handleChangeScale"
        >
          <Node
            v-for="n in allNodes"
            :key="n.id"
            :node-id="n.id"
            :node="n"
            :id="NODE_PREFIX + n.id"
            :js-plumb-ins="jsPlumbIns"
            :class="{
              'options-active': nodeMenu.typeId === n.id
            }"
            :task-type="dataflow.type"
            :sample="dagData ? dagData[n.id] : {}"
            @drag-start="onNodeDragStart"
            @drag-move="onNodeDragMove"
            @drag-stop="onNodeDragStop"
            @deselectAllNodes="deselectAllNodes"
            @deselectNode="nodeDeselectedById"
            @nodeSelected="nodeSelectedById"
            @delete="handleDeleteById"
            @show-node-popover="showNodePopover"
            @open-detail="handleOpenDetail(n)"
          ></Node>
        </PaperScroller>
        <div v-if="!allNodes.length && stateIsReadonly" class="absolute-fill flex justify-center align-center">
          <EmptyItem></EmptyItem>
        </div>
        <BottomPanel
          v-if="showBottomPanel"
          :dataflow="dataflow"
          class="position-relative"
          @showBottomPanel="handleShowBottomPanel"
        ></BottomPanel>
      </main>
      <!--校验面板-->
      <VerifyPanel
        v-if="activeType === 'verify'"
        ref="verifyPanel"
        :settings="dataflow"
        :scope="formScope"
        @hide="onHideSidebar"
        @verifyDetails="handleVerifyDetails"
        @connectionList="handleConnectionList"
      />
      <!--配置面板-->
      <ConfigPanel v-else ref="configPanel" :settings="dataflow" :scope="formScope" @hide="onHideSidebar" />

      <!--   节点详情   -->
      <NodeDetailDialog
        v-model="nodeDetailDialog"
        :dataflow="dataflow"
        :node-id="nodeDetailDialogId"
        :timeFormat="timeFormat"
        :range="[firstStartTime, lastStopTime || Date.now()]"
        :quotaTime="quotaTime"
        :quotaTimeType="quotaTimeType"
        :getTimeRange="getTimeRange"
        ref="nodeDetailDialog"
      ></NodeDetailDialog>
    </section>
  </section>
</template>

<script>
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/monitor/TopHeader'
import LeftSider from './components/monitor/LeftSider'
import Node from './components/monitor/Node'
import { jsPlumb, config } from './instance'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH, NONSUPPORT_CDC, NONSUPPORT_SYNC } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from './components/migration/ConfigPanel'
import VerifyPanel from './components/monitor/VerifyPanel'
import BottomPanel from './components/monitor/BottomPanel'
import resize from 'web-core/directives/resize'
import EmptyItem from './components/EmptyItem'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import VIcon from 'web-core/components/VIcon'
import { VExpandXTransition } from '@tap/component'
import { observable } from '@formily/reactive'
import Locale from './mixins/locale'
import { measurementApi, taskApi } from '@tap/api'
import dagre from 'dagre'
import { MoveNodeCommand } from './command'
import NodeDetailDialog from './components/monitor/components/NodeDetailDialog'
import { TIME_FORMAT_MAP, getTimeGranularity } from './components/monitor/util'

function getRandom(num = 100) {
  return Math.ceil(Math.random() * 100 * num)
}

function getRandomArray(count = 20, num = 1) {
  return Array(count)
    .fill()
    .map(() => getRandom(num))
}

function getRandomTimeArray(count = 20, ms = 5000) {
  return Array(count)
    .fill()
    .map((t, i) => Date.now() + i * ms)
}

const TIME_LIST = getRandomTimeArray(100000)
const VALUE_LIST = getRandomArray(100000)

export default {
  name: 'MigrationMonitor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor, Locale],

  components: {
    VExpandXTransition,
    EmptyItem,
    ConfigPanel,
    VerifyPanel,
    BottomPanel,
    PaperScroller,
    TopHeader,
    Node,
    LeftSider,
    VIcon,
    NodeDetailDialog
  },

  data() {
    const dataflow = observable({
      id: '',
      name: ''
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
        connectionData: {}
      },

      dataflow,

      scale: 1,
      showBottomPanel: false,
      timer: null,
      quotaTimeType: '5m',
      quotaTime: [],
      refresh: false, // 刷新数据还是初始化数据
      count: 0,
      quota: {}, // 指标数据
      nodeDetailDialog: false,
      nodeDetailDialogId: '',
      timeFormat: 'HH:mm:ss',
      dagData: null
    }
  },

  computed: {
    formScope() {
      return {
        ...this.scope,
        $settings: this.dataflow
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
      return this.quotaTimeType !== 'custom' && !this.nodeDetailDialog && this.dataflow?.status === 'running'
    }
  },

  watch: {
    'dataflow.type'(v) {
      v && this.init()
    }
  },

  mounted() {
    this.setValidateLanguage()
    this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
        // 显示连线动画
        this.jsPlumbIns.select().addClass('running')
        // this.initWS()
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    })
  },

  beforeDestroy() {
    this.command = null
    this.jsPlumbIns?.destroy()
    this.resetWorkspace()
    this.resetState()
    this.$ws.off('editFlush', this.handleEditFlush)
    this.timer && clearInterval(this.timer)
  },

  methods: {
    init() {
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.isEnterTimer && this.startLoadQuotaData()
      }, 5000)
      this.startLoadQuotaData()
    },

    startLoadQuotaData() {
      // 根据周期类型，计算时间范围
      if (this.quotaTimeType !== 'custom') {
        this.quotaTime = this.getTimeRange(this.quotaTimeType)
      }
      this.loadQuotaData()
    },

    initNodeType() {
      this.addResourceIns(allResourceIns)
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)
      if (data) {
        const { dag } = data
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.handleAutoLayout()
      }
    },

    gotoViewer() {},

    async validate() {
      if (!this.dataflow.name) return this.t('editor_cell_validate_empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter(node => node.type === 'database')
      if (tableNode.length < 2) {
        return this.t('editor_cell_validate_none_data_node')
      }

      await this.validateAllNodes()

      const sourceMap = {},
        targetMap = {},
        edges = this.allEdges
      edges.forEach(item => {
        let _source = sourceMap[item.source]
        let _target = targetMap[item.target]

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
      this.allNodes.some(node => {
        const { id } = node
        const minInputs = node.__Ctor.minInputs ?? 1
        const inputNum = targetMap[id]?.length ?? 0

        if (!sourceMap[id] && !targetMap[id]) {
          // 存在没有连线的节点
          someErrorMsg = `「 ${node.name} 」没有任何连线`
          return true
        }

        if (inputNum < minInputs) {
          someErrorMsg = `「 ${node.name} 」至少需要${minInputs}个源节点`
          return true
        }

        if (this.hasNodeError(id)) {
          someErrorMsg = `「 ${node.name} 」配置异常`
          return true
        }
      })

      const nodeNames = []
      let typeName = ''
      // 根据任务类型(全量、增量),检查不支持此类型的节点
      // 脏代码。这里的校验是有节点错误信息提示的，和节点表单校验揉在了一起，但是校验没有一起做
      if (this.dataflow.type === 'initial_sync+cdc') {
        typeName = '全量+增量'
        tableNode.forEach(node => {
          if (
            sourceMap[node.id] &&
            (NONSUPPORT_SYNC.includes(node.databaseType) || NONSUPPORT_CDC.includes(node.databaseType))
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: '该节点不支持' + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'initial_sync') {
        typeName = '全量'
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_SYNC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: '该节点不支持' + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'cdc') {
        typeName = '增量'
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_CDC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: '该节点不支持' + typeName
            })
          }
        })
      }

      if (nodeNames.length) {
        someErrorMsg = `存在不支持${typeName}的节点`
      }

      const accessNodeProcessIdArr = [
        ...tableNode.reduce((set, item) => {
          item.attrs.accessNodeProcessId && set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set())
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
          tableNode.forEach(node => {
            if (node.attrs.accessNodeProcessId && chooseId !== node.attrs.accessNodeProcessId) {
              this.setNodeErrorMsg({
                id: node.id,
                msg: `该节点不支持在 ${agent.hostName}（${agent.ip}）上运行`
              })
              isError = true
            }
          })
          isError && (someErrorMsg = `所属agent节点冲突`)
        }
      } else if (accessNodeProcessIdArr.length === 1) {
        // 如果画布上仅有一个所属agent，自动设置为任务的agent
        this.$set(this.dataflow, 'accessNodeType', 'MANUALLY_SPECIFIED_BY_THE_USER')
        this.$set(this.dataflow, 'accessNodeProcessId', accessNodeProcessIdArr[0])
      }

      if (someErrorMsg) return someErrorMsg

      // 检查链路的末尾节点类型是否是表节点
      const firstNodes = this.allNodes.filter(node => !targetMap[node.id]) // 链路的首节点
      const nodeMap = this.allNodes.reduce((map, node) => ((map[node.id] = node), map), {})
      if (firstNodes.some(node => !this.isEndOfTable(node, sourceMap, nodeMap))) return `链路的末位需要是一个数据节点`

      return null
    },

    handlePageReturn() {
      this.$router.push({
        name: 'migrateList'
      })
    },

    handleEdit() {
      this.$router.push({
        name: 'MigrateEditor',
        params: { id: this.dataflow.id }
      })
    },

    handleDetail() {
      let subId = this.dataflow.statuses[0]?.id || ''
      if (!subId) {
        this.$message.error('该复制任务没有子任务')
        return
      }

      this.$router.push({
        name: 'MigrateStatistics',
        query: {
          id: this.dataflow.id,
          subId: subId
        }
      })
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
      this.showBottomPanel = !this.showBottomPanel
    },

    async handleStart() {
      this.isSaving = true
      try {
        await taskApi.start(this.dataflow.id)
        this.$message.success(this.t('message_operation_succuess'))
        this.isSaving = false
      } catch (e) {
        this.handleError(e)
        this.isSaving = false
      }
    },

    getFilter() {
      const taskId = this.dataflow?.id
      const [startAt, endAt] = this.quotaTime
      let params = {
        startAt,
        endAt,
        samples: {
          // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
          totalData: {
            tags: {
              type: 'task',
              taskId
            },
            endAt: Date.now(), // 停止时间 || 当前时间
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
              'outputQps'
            ],
            type: 'instant' // 瞬时值
          },
          // 任务事件统计（条）-所选周期累计
          barChartData: {
            tags: {
              type: 'task',
              taskId
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
              'outputOthersTotal'
            ],
            type: 'difference'
          },
          // qps + 增量延迟
          lineChartData: {
            tags: {
              type: 'task',
              taskId
            },
            fields: ['inputQps', 'outputQps', 'timeCostAvg'],
            type: 'continuous' // 连续数据
          },
          // dag数据
          dagData: {
            tags: {
              type: 'node',
              taskId
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
              'tableTotal'
            ],
            type: 'instant' // 瞬时值
          }
        }
      }
      return params
    },

    loadQuotaData() {
      if (!this.dataflow?.id) {
        return
      }
      const { refresh } = this
      if (refresh) {
        this.count = 0
      }
      this.count++
      const { count } = this
      measurementApi
        .queryV2(this.getFilter())
        .then(data => {
          this.quota = data
          const granularity = getTimeGranularity(data.interval)
          this.timeFormat = TIME_FORMAT_MAP[granularity]
          this.dagData = this.getDagData(this.quota.samples.dagData)
          console.log('this.dagData', this.dagData) // eslint-disable-line
        })
        .catch(() => {
          let res = {
            time: TIME_LIST.slice(count, count + 60),
            samples: {
              totalData: [
                {
                  inputInsertTotal: getRandom(),
                  inputUpdateTotal: getRandom(),
                  inputDeleteTotal: getRandom(),
                  inputDdlTotal: getRandom(),
                  inputOthersTotal: getRandom(),
                  outputInsertTotal: getRandom(),
                  outputUpdateTotal: getRandom(),
                  outputDeleteTotal: getRandom(),
                  outputDdlTotal: getRandom(),
                  outputOthersTotal: getRandom(),
                  tableTotal: getRandom(),
                  createTableTotal: getRandom(),
                  snapshotTableTotal: getRandom(),
                  initialCompleteTime: 1657707577896, // 全量完成时间
                  sourceConnection: 'sourceConnection', // 增量信息:源连接、目标连接、增量时间点
                  targetConnection: 'targetConnection',
                  snapshotDoneAt: 1657707577896,
                  snapshotRowTotal: getRandom(),
                  snapshotInsertRowTotal: getRandom(),
                  outputQps: getRandom()
                }
              ],
              barChartData: [
                {
                  inputInsertTotal: getRandom(),
                  inputUpdateTotal: getRandom(),
                  inputDeleteTotal: getRandom(),
                  inputDdlTotal: getRandom(),
                  inputOthersTotal: getRandom(),
                  outputInsertTotal: getRandom(),
                  outputUpdateTotal: getRandom(),
                  outputDeleteTotal: getRandom(),
                  outputDdlTotal: getRandom(),
                  outputOthersTotal: getRandom()
                }
              ],
              lineChartData: [
                {
                  inputQps: VALUE_LIST.slice(count, count + 60),
                  outputQps: VALUE_LIST.slice(count + 10, count + 60 + 10),
                  timeCostAvg: VALUE_LIST.slice(count + 10, count + 60 + 10)
                }
              ],
              dagData: [
                {
                  inputInsertTotal: getRandom(),
                  inputUpdateTotal: getRandom(),
                  inputDeleteTotal: getRandom(),
                  inputDdlTotal: getRandom(),
                  inputOthersTotal: getRandom(),
                  outputInsertTotal: getRandom(),
                  outputUpdateTotal: getRandom(),
                  outputDeleteTotal: getRandom(),
                  outputDdlTotal: getRandom(),
                  outputOthersTotal: getRandom(),
                  qps: getRandom(),
                  timeCostAvg: getRandom(),
                  currentEventTimestamp: getRandom(),
                  tcpPing: getRandom(),
                  connectPing: getRandom(),
                  inputTotal: getRandom(),
                  outputTotal: getRandom(),
                  inputQps: getRandom(),
                  outputQps: getRandom(),
                  snapshotRowTotal: getRandom(),
                  snapshotInsertRowTotal: getRandom(),
                  tags: {
                    nodeType: 'table_rename_processor',
                    type: 'node',
                    nodeId: '3a619752-50c5-4128-ac10-75a6fa14c672',
                    subTaskId: '62e38b65290b4b01b05cec8b',
                    taskId: '62e38b26290b4b01b05ce5cf'
                  }
                },
                {
                  insertTotal: getRandom(),
                  updateTotal: getRandom(),
                  deleteTotal: getRandom(),
                  ddlTotal: getRandom(),
                  othersTotal: getRandom(),
                  qps: getRandom(),
                  timeCostAvg: getRandom(),
                  currentEventTimestamp: getRandom(),
                  tcpPing: getRandom(),
                  connectPing: getRandom(),
                  inputTotal: getRandom(),
                  outputTotal: getRandom(),
                  inputQps: getRandom(),
                  outputQps: getRandom(),
                  tags: {
                    nodeType: 'database',
                    type: 'node',
                    nodeId: '96f22ecc-6eb4-4f08-bc2a-2eab35ee9989',
                    subTaskId: '62e38b65290b4b01b05cec8b',
                    taskId: '62e38b26290b4b01b05ce5cf'
                  }
                },
                {
                  insertTotal: getRandom(),
                  updateTotal: getRandom(),
                  deleteTotal: getRandom(),
                  ddlTotal: getRandom(),
                  othersTotal: getRandom(),
                  qps: getRandom(),
                  timeCostAvg: getRandom(),
                  currentEventTimestamp: getRandom(),
                  tcpPing: getRandom(),
                  connectPing: getRandom(),
                  inputTotal: getRandom(),
                  outputTotal: getRandom(),
                  inputQps: getRandom(),
                  outputQps: getRandom(),
                  tags: {
                    nodeType: 'database',
                    type: 'node',
                    nodeId: '439e6178-9f39-498b-8a4d-5c5d4f5b014c',
                    subTaskId: '62e38b65290b4b01b05cec8b',
                    taskId: '62e38b26290b4b01b05ce5cf'
                  }
                }
              ]
            }
          }
          this.quota = res
          this.dagData = this.getDagData(this.quota.samples.dagData)
        })
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

      dg.setGraph({ nodesep: 300, ranksep: 200, marginx: 50, marginy: 50, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        dg.setNode(NODE_PREFIX + n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs?.position || [0, 0]
      })
      this.jsPlumbIns.getAllConnections().forEach(edge => {
        dg.setEdge(edge.source.id, edge.target.id)
      })

      dagre.layout(dg)
      dg.nodes().forEach(n => {
        const node = dg.node(n)
        const top = Math.round(node.y - node.height / 2)
        const left = Math.round(node.x - node.width / 2)

        if (nodePositionMap[n].join(',') !== `${left},${top}`) {
          hasMove = true
          oldProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: nodePositionMap[n]
              }
            }
          })
          newProperties.push({
            id: this.getRealId(n),
            properties: {
              attrs: {
                position: [left, top]
              }
            }
          })
        }
      })

      hasMove && this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
      this.$refs.paperScroller.autoResizePaper()
      this.$refs.paperScroller.centerContent()
    },

    handleChangeTimeSelect(val, isTime, source) {
      this.refresh = this.quotaTimeType === val
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
      this.init()
    },

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime
      if (status === 'running') {
        endTimestamp = Date.now()
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
        case 'full':
          result = [this.firstStartTime, endTimestamp]
          break
        default:
          result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
          break
      }
      return result
    },

    handleOpenDetail(node) {
      this.nodeDetailDialogId = node.id
      // 设置弹窗的周期
      this.$refs.nodeDetailDialog.quotaTime = this.quotaTime
      this.$refs.nodeDetailDialog.quotaTimeType = this.quotaTimeType
      this.nodeDetailDialog = true
    },

    handleVerifyDetails(table) {
      let routeUrl = this.$router.resolve({
        name: 'VerifyDetails',
        params: {
          id: this.dataflow?.id
        },
        query: {
          table
        }
      })
      window.open(routeUrl.href)
    },

    handleConnectionList(keyword) {
      let routeUrl = this.$router.resolve({
        name: 'connectionsList',
        query: {
          keyword
        }
      })
      window.open(routeUrl.href)
    }
  }
}
</script>

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
  ::v-deep {
    .border-bottom {
      border-bottom: 1px solid #f2f2f2 !important;
    }
  }
}

.layout-content {
  position: relative;
  background-color: #f9f9f9;
  /*background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJ2LTc2IiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZGVmcyBpZD0idi03NSI+PHBhdHRlcm4gaWQ9InBhdHRlcm5fMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCBpZD0idi03NyIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI0FBQUFBQSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgaWQ9InYtNzkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybl8wKSIvPjwvc3ZnPg==);
  background-color: #f5f8fe;*/

  ::v-deep {
    .connection-highlight,
    .connection-selected {
      path:nth-child(2) {
        stroke: #2c65ff;
      }
      path:nth-child(3) {
        fill: #2c65ff;
        stroke: #2c65ff;
      }
    }

    .remove-connection-label {
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

    .conn-btn__wrap {
      z-index: 1002;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      &:hover {
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
    }
    .conn-btn {
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
    color: map-get($color, primary);
  }
}
</style>
