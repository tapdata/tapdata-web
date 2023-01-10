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
      :hide-menus="['verify', 'operation', 'agent']"
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
          {{ $t('packages_dag_task_preview_status_' + result[0].status) }}
        </span>
      </template>
    </TopHeader>
    <section class="layout-wrap layout-has-sider position-relative font-color-light">
      <!--内容体-->
      <section class="layout-wrap flex-1">
        <main id="dfEditorContent" ref="layoutContent" class="layout-content flex flex-column flex-1 overflow-hidden">
          <PaperScroller
            ref="paperScroller"
            :nav-lines="navLines"
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
          >
            <DFNode
              v-for="n in allNodes"
              :key="n.id"
              :node-id="n.id"
              :id="NODE_PREFIX + n.id"
              :js-plumb-ins="jsPlumbIns"
              :class="{
                'options-active': nodeMenu.typeId === n.id
              }"
              @drag-start="onNodeDragStart"
              @drag-move="onNodeDragMove"
              @drag-stop="onNodeDragStop"
              @deselectAllNodes="deselectAllNodes"
              @deselectNode="nodeDeselectedById"
              @nodeSelected="nodeSelectedById"
              @delete="handleDeleteById"
              @show-node-popover="showNodePopover"
            ></DFNode>
          </PaperScroller>
          <div v-if="!allNodes.length && stateIsReadonly" class="absolute-fill flex justify-center align-center">
            <VEmpty large></VEmpty>
          </div>
        </main>
        <BottomPanel
          v-if="showBottomPanel"
          v-resize.top="{
            minHeight: 328
          }"
          :dataflow="dataflow"
          class="tabs-header__hidden"
          @showBottomPanel="handleShowBottomPanel"
        ></BottomPanel>
      </section>
      <!--配置面板-->
      <ConfigPanel ref="configPanel" :settings="dataflow" :scope="formScope" @hide="onHideSidebar" />

      <!--   节点详情   -->
      <NodeDetailDialog
        v-model="nodeDetailDialog"
        :dataflow="dataflow"
        :node-id="nodeDetailDialogId"
        :timeFormat="timeFormat"
        :range="[firstStartTime, lastStopTime || getTime()]"
        :quotaTime="quotaTime"
        :quotaTimeType="quotaTimeType"
        :getTimeRange="getTimeRange"
        ref="nodeDetailDialog"
      ></NodeDetailDialog>
    </section>
  </section>
</template>

<script>
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'

import PaperScroller from './components/PaperScroller'
import TopHeader from './components/monitor/TopHeader'
import DFNode from './components/DFNode'
import { jsPlumb, config } from './instance'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH, NONSUPPORT_CDC, NONSUPPORT_SYNC } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import ConfigPanel from './components/migration/ConfigPanel'
import BottomPanel from './components/monitor/BottomPanel'
import resize from '@tap/component/src/directives/resize'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import { VEmpty } from '@tap/component'
import { observable } from '@formily/reactive'
import { databaseTypesApi, measurementApi, taskApi } from '@tap/api'
import dagre from 'dagre'
import { MoveNodeCommand } from './command'
import NodeDetailDialog from './components/monitor/components/NodeDetailDialog'
import { TIME_FORMAT_MAP, getTimeGranularity } from './components/monitor/util'
import { mapMutations } from 'vuex'

export default {
  name: 'MigrationMonitorViewer',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  components: {
    VEmpty,
    ConfigPanel,
    BottomPanel,
    PaperScroller,
    TopHeader,
    DFNode,
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
      showBottomPanel: true,
      timer: null,
      quotaTimeType: '5m',
      quotaTime: [],
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

  created() {
    this.setStateReadonly(true)
  },

  async mounted() {
    this.setValidateLanguage()
    // 收集pdk上节点的schema
    await this.initPdkProperties()
    await this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        const { id } = this.$route.params
        await this.openDataflow(id)
        this.setStateReadonly(true)
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
    ...mapMutations('dataflow', ['setPdkPropertiesMap']),

    init() {
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.isEnterTimer && this.startLoadData()
      }, 5000)
      this.startLoadData()
    },

    startLoadData() {
      // 根据周期类型，计算时间范围
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
      const data = await this.loadDataflow(id, {
        taskRecordId: this.$route.query?.taskRecordId
      })
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
      if (!this.dataflow.name) return this.$t('packages_dag_editor_cell_validate_empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter(node => node.type === 'database')
      if (tableNode.length < 2) {
        return this.$t('packages_dag_editor_cell_validate_none_data_node')
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
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitorviewer_noden', { val1: node.name })
          return true
        }

        if (inputNum < minInputs) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitorviewer_noden', { val1: node.name, val2: minInputs })
          return true
        }

        if (this.hasNodeError(id)) {
          someErrorMsg = i18n.t('packages_dag_src_migrationmonitorviewer_noden', { val1: node.name })
          return true
        }
      })

      const nodeNames = []
      let typeName = ''
      // 根据任务类型(全量、增量),检查不支持此类型的节点
      // 脏代码。这里的校验是有节点错误信息提示的，和节点表单校验揉在了一起，但是校验没有一起做
      if (this.dataflow.type === 'initial_sync+cdc') {
        typeName = i18n.t('packages_dag_components_formpanel_quanliangzengliang')
        tableNode.forEach(node => {
          if (
            sourceMap[node.id] &&
            (NONSUPPORT_SYNC.includes(node.databaseType) || NONSUPPORT_CDC.includes(node.databaseType))
          ) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitorviewer_gaijiedianbuzhi') + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'initial_sync') {
        typeName = i18n.t('packages_dag_task_setting_initial_sync')
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_SYNC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitorviewer_gaijiedianbuzhi') + typeName
            })
          }
        })
      } else if (this.dataflow.type === 'cdc') {
        typeName = i18n.t('packages_dag_task_setting_cdc')
        tableNode.forEach(node => {
          if (sourceMap[node.id] && NONSUPPORT_CDC.includes(node.databaseType)) {
            nodeNames.push(node.name)
            this.setNodeErrorMsg({
              id: node.id,
              msg: i18n.t('packages_dag_src_migrationmonitorviewer_gaijiedianbuzhi') + typeName
            })
          }
        })
      }

      if (nodeNames.length) {
        someErrorMsg = i18n.t('packages_dag_src_migrationmonitorviewer_cunzaibuzhichi', { val1: typeName })
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
                msg: i18n.t('packages_dag_src_migrationmonitorviewer_gaijiedianbuzhi', {
                  val1: agent.hostName,
                  val2: agent.ip
                })
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
        this.$message.error(i18n.t('packages_dag_src_migrationmonitorviewer_gaifuzhirenwu'))
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
        this.$message.success(this.$t('packages_dag_message_operation_succuess'))
        this.isSaving = false
      } catch (e) {
        this.handleError(e)
        this.isSaving = false
      }
    },

    getQuotaFilter() {
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
            endAt: Time.getTime(), // 停止时间 || 当前时间
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
              'tableTotal',
              'replicateLag'
            ],
            type: 'instant' // 瞬时值
          }
        }
      }
      return params
    },

    getParams() {
      let params = {
        quota: {
          uri: '/api/measurement/query/v2',
          param: this.getQuotaFilter()
        }
      }
      return params
    },

    loadData() {
      if (!this.dataflow?.id) {
        return
      }
      measurementApi.batch(this.getParams()).then(data => {
        const map = {
          quota: this.loadQuotaData
        }
        for (let key in data) {
          const item = data[key]
          if (item.code === 'ok') {
            map[key]?.(data[key].data)
          }
        }
      })
    },

    loadQuotaData(data) {
      this.quota = data
      const granularity = getTimeGranularity(data.interval)
      this.timeFormat = TIME_FORMAT_MAP[granularity]
      this.dagData = this.getDagData(this.quota.samples.dagData)
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
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
      this.init()
    },

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime || Time.getTime()
      if (status === 'running') {
        endTimestamp = Time.getTime()
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
    },

    async loadDataflow(id, params) {
      this.loading = true
      try {
        const data = await taskApi.get(id, params)
        if (!data) {
          this.$message.error(i18n.t('packages_dag_mixins_editor_renwubucunzai'))
          this.handlePageReturn()
          return
        }
        data.dag = data.temp || data.dag // 和后端约定了，如果缓存有数据则获取temp
        this.reformDataflow(data)
        return data
      } catch (e) {
        console.log(i18n.t('packages_dag_mixins_editor_renwujiazaichu'), e) // eslint-disable-line
      } finally {
        this.loading = false
      }
    },

    async initPdkProperties() {
      const databaseItems = await databaseTypesApi.get({
        filter: JSON.stringify({
          fields: {
            messages: true,
            pdkHash: true,
            properties: true
          }
        })
      })
      this.setPdkPropertiesMap(
        databaseItems.reduce((map, item) => {
          const properties = item.properties?.node
          if (properties) {
            map[item.pdkHash] = properties
          }
          return map
        }, {})
      )
    },

    getTime() {
      return Time.getTime()
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
