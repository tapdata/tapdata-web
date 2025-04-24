<script>
import { connectionsApi, taskApi } from '@tap/api'

import { SkipError } from '@tap/business'
import { VEmpty } from '@tap/component'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { showMessage } from '@tap/component/src/mixins/showMessage'
import { titleChange } from '@tap/component/src/mixins/titleChange'
import i18n from '@tap/i18n'
import { uuid } from '@tap/shared'
import dagre from 'dagre'
import { merge } from 'lodash-es'
import { mapMutations } from 'vuex'
import { MoveNodeCommand } from './command'
import DFNode from './components/DFNode'
import LeftSidebar from './components/LeftSidebar'
import MaterializedView from './components/materialized-view/MaterializedView.vue'
import ConfigPanel from './components/migration/ConfigPanel'
import ConsolePanel from './components/migration/ConsolePanel'
import NodePopover from './components/NodePopover'
import PaperEmpty from './components/PaperEmpty'
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import TransformLoading from './components/TransformLoading'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH } from './constants'
import { config, jsPlumb } from './instance'
import editor from './mixins/editor'
import formScope from './mixins/formScope'
import { allResourceIns } from './nodes/loader'

export default {
  name: 'Editor',

  components: {
    MaterializedView,
    NodePopover,
    VEmpty,
    ConfigPanel,
    PaperScroller,
    TopHeader,
    DFNode,
    LeftSidebar,
    TransformLoading,
    ConsolePanel,
    PaperEmpty,
    SkipError,
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  inject: ['buried'],

  data() {
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

      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      scale: 1,
    }
  },

  watch: {
    'dataflow.status': function (v) {
      if (this.dataflow.disabledData?.edit) {
        this.setStateReadonly(true)
      } else {
        this.setStateReadonly(false)
      }

      if (v === 'starting' || v === 'running') {
        this.gotoViewer()
      }

      if (
        ['DataflowViewer'].includes(this.$route.name) &&
        ['renewing'].includes(v)
      ) {
        this.handleConsoleAutoLoad()
      }
    },
    'dataflow.id': function () {
      this.getTaskPermissions()
    },
  },

  // created 换成 mounted，等上一个实例destroy走完
  async mounted() {
    if (this.$route.name === 'DataflowViewer') {
      this.setStateReadonly(true)
    }
    const query = { ...this.$route.query }
    // 设置schema的校验语言
    this.setValidateLanguage()
    // 收集pdk上节点的schema
    await this.initPdkProperties()
    // 初始化所有节点类型
    await this.initNodeType()
    // 加载权限
    await this.getTaskPermissions()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
        this.autoAddNode(query)
        this.checkMaterializedView(query)
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
  },

  methods: {
    async initNodeType() {
      let nodes = [
        {
          name: i18n.t('packages_dag_src_editor_zhuconghebing'),
          type: 'merge_table_processor',
          hidden: !this.hasFeature('masterSlaveMergeProcessor'),
        },
        {
          name: i18n.t('packages_dag_src_editor_zhuijiahebing'),
          type: 'union_processor',
          hidden: !this.hasFeature('appendMergeProcessor'),
        },
        {
          name: i18n.t('packages_dag_src_migrationeditor_jSchuli_standard'),
          type: 'standard_js_processor',
        },
        {
          name: i18n.t('packages_dag_src_migrationeditor_jSchuli'),
          type: 'js_processor',
          beta: true,
          hidden: !this.hasFeature('enhanceJsProcessor'),
        },
        {
          name: 'Python',
          type: 'python_processor',
          beta: true,
          hidden: !this.hasFeature('pythonProcessor'),
        },
        {
          name: 'Row Filter',
          type: 'row_filter_processor',
          hidden: !this.hasFeature('rowFilterProcessor'),
        },
        // {
        //   name: i18n.t('packages_dag_src_editor_juhe'),
        //   type: 'aggregation_processor' //聚合节点
        // }
        {
          name: i18n.t('packages_dag_src_editor_ziduanjisuan'),
          type: 'field_calc_processor',
        },
        {
          name: i18n.t('packages_dag_src_editor_leixingxiugai'),
          type: 'field_mod_type_processor',
        },
        {
          name: i18n.t('packages_dag_src_editor_ziduangaiming'),
          type: 'field_rename_processor',
        },
        {
          name: i18n.t('packages_dag_src_editor_zengshanziduan'),
          type: 'field_add_del_processor',
        },
        {
          name: i18n.t('packages_dag_date_processor'),
          type: 'date_processor',
        },
        {
          name: i18n.t('packages_dag_src_editor_leixingguolu'),
          type: 'field_mod_type_filter_processor',
        },
        {
          name: 'Unwind',
          type: 'unwind_processor',
          hidden: !this.hasFeature('unwindProcessor'),
        },
        {
          name: i18n.t('packages_dag_time_field_injection'),
          type: 'add_date_field_processor',
          hidden: !this.hasFeature('appendDatetimeFieldProcessor'),
        },
        {
          name: i18n.t('packages_dag_src_editor_huawei_drs_kafka_convertor'),
          type: 'huawei_drs_kafka_convertor',
        },
      ]
      //仅企业版有的节点
      if (this.isDaas) {
        const isDaasNode = [
          {
            name: i18n.t('packages_dag_src_editor_join'),
            type: 'join_processor', //join 节点
          },
        ]
        nodes = [...isDaasNode, ...nodes]
      }
      this.addProcessorNode(nodes.filter((item) => !item.hidden))
      this.addResourceIns(allResourceIns)

      if (this.hasFeature('customProcessor')) {
        await this.loadCustomNode()
      }
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)

      if (data) {
        if (this.destory) return
        const { dag } = data
        this.setStateReadonly(
          this.$route.name === 'DataflowViewer'
            ? true
            : this.dataflow.disabledData.edit,
        )
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.$refs.paperScroller.initVisibleArea()
        this.$refs.paperScroller.autoResizePaper()
        this.handleCenterContent()
        this.preventNodeOverlap(dag.nodes)
      }
    },

    gotoViewer() {
      if (this.$route.name === 'TaskMonitor') return
      this.$router
        .push({
          name: 'TaskMonitor',
          params: {
            id: this.dataflow.id,
          },
        })
        .catch(() => {
          console.log('Current route: DataflowViewer') // eslint-disable-line
        })
    },

    // 循环检查检查链路的末尾节点类型是否是表节点
    isEndOfTable(source, sourceMap, nodeMap) {
      if (!sourceMap[source.id]) {
        // 末位节点
        return source.type === 'table'
      }

      for (const edge of sourceMap[source.id]) {
        if (!this.isEndOfTable(nodeMap[edge.target], sourceMap, nodeMap)) {
          return false
        }
      }

      return true
    },

    async save(needStart) {
      this.isSaving = true

      const errorMsg = await this.validate()
      if (errorMsg) {
        this.setMaterializedViewVisible(false)
        if (this.destory) return
        this.$message.error(errorMsg)
        this.isSaving = false
        return
      }

      if (!this.dataflow.id) {
        return this.saveAsNewDataflow()
      }

      const data = this.getDataflowDataToSave('sync')

      try {
        this.initWS()
        // const result = await taskApi[needStart ? 'saveAndStart' : 'save'](data)
        const result = await taskApi.save(data, {
          silenceMessage: true,
        })
        this.reformDataflow(result)
        !needStart && this.$message.success(this.$t('public_message_save_ok'))
        this.setEditVersion(result.editVersion)
        this.isSaving = false
        this.toggleConsole(true)
        this.$refs.console?.startAuto('checkDag') // 信息输出自动加载
        return true
      } catch (error) {
        this.isSaving = false
        this.handleError(error)
        this.toggleConsole(true)
        this.$refs.console?.startAuto('checkDag') // 信息输出自动加载
        return false
      }
    },

    async saveAsNewDataflow() {
      this.buried('taskSubmit')
      this.isSaving = true
      const data = this.getDataflowDataToSave('sync')
      try {
        const dataflow = await taskApi.post(data)
        this.buried('taskSubmit', { result: true })
        this.reformDataflow(dataflow)
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        this.setTaskInfo(this.dataflow)
        await this.$router.replace({
          name: 'DataflowEditor',
          params: { id: dataflow.id, action: 'dataflowEdit' },
        })
        this.$nextTick(() => {
          this.$refs.paperScroller.initVisibleArea()
        })
      } catch (error) {
        console.error(i18n.t('packages_dag_src_editor_renwubaocunchu'), error)
        this.buried('taskSubmit', { result: true })
        if (error?.data?.code === 'Task.RepeatName') {
          const newName = await this.makeTaskName(data.name)
          await this.newDataflow(newName)
        } else if (error?.data?.code === 'InvalidPaidPlan') {
          this.$router.push({
            name: 'dataflowList',
          })
        } else {
          this.handleError(error)
        }
      }
      this.isSaving = false
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
        nodesep: 60,
        ranksep: 120,
        marginx: 50,
        marginy: 50,
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
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs.position
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

    createNode(position, item) {
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const node = merge(
        {
          id: uuid(),
          attrs: { position },
        },
        item,
      )

      const ins = item.__Ctor || getResourceIns(item)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false,
      })

      return node
    },

    /*handleMouseSelect(showSelectBox, selectBoxAttr) {
      // 取消选中所有节点
      this.deselectAllNodes()
      // 清空激活状态
      this.setActiveType(null)

      if (showSelectBox) {
        const selectedNodes = this.getNodesInSelection(selectBoxAttr)
        selectedNodes.forEach(node => this.nodeSelected(node))
      }
    },*/

    handlePageReturn() {
      if (
        !this.allNodes.length &&
        !this.nameHasUpdated &&
        this.$store.state.dataflow.taskId
      ) {
        this.$confirm(
          this.$t('packages_dag_page_return_confirm_content'),
          this.$t('packages_dag_page_return_confirm_title'),
          {
            type: 'warning',
            closeOnClickModal: false,
            confirmButtonText: this.$t(
              'packages_dag_page_return_confirm_ok_text',
            ),
            cancelButtonText: this.$t(
              'packages_dag_page_return_confirm_cancel_text',
            ),
          },
        ).then((res) => {
          if (res) {
            taskApi.delete(this.dataflow.id)
          }
          this.$router.push({
            name: 'dataflowList',
          })
          window.name = null
        })
      } else {
        this.$router.push({
          name: 'dataflowList',
        })
        window.name = null
      }
    },

    handleEdit() {
      this.$router.push({
        name: 'DataflowEditor',
        params: { id: this.dataflow.id, action: 'dataflowEdit' },
      })
    },

    handleDetail() {
      this.$router.push({
        name: 'TaskMonitor',
        params: {
          id: this.dataflow.id,
        },
      })
    },

    async handleStart(isDebug = false) {
      this.buried('taskStart')

      this.unWatchStatus?.()
      this.unWatchStatus = this.$watch('dataflow.status', (v) => {
        if (
          ['error', 'complete', 'running', 'stop', 'schedule_failed'].includes(
            v,
          )
        ) {
          this.$refs.console?.loadData()
          if (v !== 'running') {
            this.$refs.console?.stopAuto()
          } else {
            this.toggleConsole(false)
            this.gotoViewer()
          }
          // this.unWatchStatus()
        }
        if (['MigrateViewer', 'DataflowViewer'].includes(this.$route.name)) {
          if (['renewing'].includes(v)) {
            this.handleConsoleAutoLoad()
          } else {
            this.toggleConsole(false)
          }
        }
      })

      const hasError = await this.$refs.skipError.checkError(this.dataflow)
      if (hasError) return

      const flag = await this.save(true)

      if (flag) {
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        this.beforeStartTask()
        isDebug && this.openDataCapture()
        // this.gotoViewer()
        // this.buried('taskStart', { result: true })
      } else {
        this.buried('taskStart', { result: false })
      }
    },

    handleSkipAndRun() {
      this.startTask()
    },

    async autoAddNode(query) {
      const { addNode, connectionId, tableName } = query

      if (!addNode) return

      try {
        const con = await connectionsApi.get(connectionId)
        this.handleAddNodeToPos(
          [-300, 300],
          this.$refs.leftSidebar.getNodeProps(con, tableName),
        )
      } catch (error) {
        console.error(error)
      }
    },

    onAddMaterializedViewNode(parentNode, props) {
      const activeNode = this.$store.getters['dataflow/activeNode']
      const newNode = this.quickAddSourceNode(activeNode, {
        name: '',
        type: 'table',
        databaseType: '',
        connectionId: '',
        tableName: '',
        attrs: {
          hasCreated: false,
        },
      })
      const viewNode = {
        ...props,
        id: newNode.id,
        parentId: parentNode.id,
        tableName: newNode.name,
        tableNode: newNode,
        // joinKeys: [],
        children: [],
      }

      parentNode.children.push(viewNode)
      this.$refs.materializedView.addNode(viewNode)
    },

    onAddMaterializedViewTargetNode(
      activeNode = this.$store.getters['dataflow/activeNode'],
      nodeType = {
        name: `Node ${this.allNodes.length + 1}`,
        type: 'table',
        databaseType: '',
        connectionId: '',
        tableName: '',
        attrs: {
          capabilities: [{ id: 'master_slave_merge' }], // 允许作为主从合并的目标
          hasCreated: false,
        },
      },
    ) {
      const newNode = this.quickAddNode(activeNode, nodeType)
      this.$nextTick(() => {
        this.$refs.materializedView.addTargetNode(newNode)
      })
    },

    async checkMaterializedView(query = {}) {
      const { by, connectionId, tableName } = query
      let connection

      if (by !== 'materialized-view' && by !== 'transformation-materialized')
        return

      await this.$router.replace({
        params: {
          action: 'dataflowEdit',
        },
        query: {
          ...query,
          by: undefined,
          connectionId: undefined,
          tableName: undefined,
        },
      })

      this.setTaskId(this.$route.params.id)

      if (connectionId) {
        connection = await connectionsApi.get(connectionId)
      }

      if (by === 'transformation-materialized') {
        const mergeTableNode = this.handleAddNodeToCenter({
          name: i18n.t('packages_dag_src_editor_zhuconghebing'),
          type: 'merge_table_processor',
        })

        // 添加目标节点
        if (connection) {
          this.quickAddNode(
            mergeTableNode,
            this.$refs.leftSidebar.getNodeProps(connection, tableName),
          )
        }
        return
      }

      // 统一添加节点，可以通过节流走一个updateDag请求
      // 添加源节点
      const sourceNode = this.handleAddNodeToCenter({
        name: `SourceNode`,
        type: 'table',
        databaseType: '',
        connectionId: '',
        tableName: '',
        attrs: {
          hasCreated: false,
        },
      })
      // 添加主从合并节点
      const mergeTableNode = this.quickAddNode(sourceNode, {
        name: i18n.t('packages_dag_src_editor_zhuconghebing'),
        type: 'merge_table_processor',
      })
      // 添加目标节点
      if (connection) {
        this.quickAddNode(
          mergeTableNode,
          this.$refs.leftSidebar.getNodeProps(connection, tableName),
        )
      }

      await this.$nextTick()
      await this.updateDag({ vm: this, isNow: true })
      // 打开主从合并节点
      this.setActiveNode(mergeTableNode.id)

      // 等待主从合并节点的默认配置生成（渲染一次表单）
      setTimeout(() => {
        // 显示物化视图
        // 等待主从合并节点的默认配置保存
        this.setMaterializedViewVisible(true)
      }, 120)
    },
  },
}
</script>

<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      :button-show-map="buttonShowMap"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @undo="handleUndo"
      @redo="handleRedo"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @zoom-to="handleZoomTo"
      @show-settings="handleShowSettings"
      @center-content="handleCenterContent"
      @auto-layout="handleAutoLayout"
      @change-name="handleUpdateName"
      @locate-node="handleLocateNode"
      @start="handleStart()"
      @debug-start="handleStart(true)"
      @stop="handleStop"
      @force-stop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @detail="handleDetail"
    />
    <section class="layout-wrap layout-has-sider">
      <!--左侧边栏-->
      <LeftSidebar
        v-if="dataflow.id"
        ref="leftSidebar"
        v-resize.right="{
          minWidth: 260,
          maxWidth: 400,
        }"
        @move-node="handleDragMoveNode"
        @drop-node="handleAddNodeByDrag"
        @add-table-as-node="handleAddNodeToCenter"
        @add-node="handleAddNodeToConnect"
      />
      <section class="layout-wrap flex-1">
        <!--内容体-->
        <main
          id="dfEditorContent"
          ref="layoutContent"
          class="layout-content flex-1 overflow-hidden"
        >
          <PaperScroller
            ref="paperScroller"
            :nav-lines="navLines"
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
          >
            <DFNode
              v-for="n in allNodes"
              :id="NODE_PREFIX + n.id"
              :key="n.id"
              :node-id="n.id"
              :js-plumb-ins="jsPlumbIns"
              :class="{
                'options-active': nodeMenu.typeId === n.id,
              }"
              @drag-start="onNodeDragStart"
              @drag-move="onNodeDragMove"
              @drag-stop="onNodeDragStop"
              @deselect-all-nodes="deselectAllNodes"
              @deselect-node="nodeDeselectedById"
              @node-selected="nodeSelectedById"
              @delete="handleDeleteById"
              @disable="handleDisableNode($event, true)"
              @enable="handleDisableNode($event, false)"
              @show-node-popover="showNodePopover"
            />
          </PaperScroller>
          <div
            v-if="!allNodes.length && stateIsReadonly"
            class="absolute-fill flex justify-center align-center"
          >
            <VEmpty large />
          </div>
          <PaperEmpty v-else-if="!allNodes.length" />
          <TransformLoading :show="transformLoading" />
          <NodePopover
            :popover="nodeMenu"
            @click-node="handleClickNodePopover"
            @hide="nodeMenu.typeId = ''"
          />
        </main>
        <ConsolePanel ref="console" />
      </section>
      <!--配置面板-->
      <ConfigPanel
        ref="configPanel"
        :scope="scope"
        :settings="dataflow"
        :sync-type="dataflow.syncType"
        :button-show-map="buttonShowMap"
        show-schema-panel
      />

      <MaterializedView
        ref="materializedView"
        v-model:visible="materializedViewVisible"
        :is-saving="isSaving"
        :button-show-map="buttonShowMap"
        :dataflow="dataflow"
        @start="handleStart()"
        @add-node="onAddMaterializedViewNode"
        @add-target-node="onAddMaterializedViewTargetNode()"
        @delete-node="handleDeleteById"
      />

      <SkipError ref="skipError" @skip="handleSkipAndRun" />
    </section>
  </section>
</template>

<style lang="scss" scoped>
$sidebarW: 260px;
$hoverBg: #e1e1e1;
$radius: 3px;
$baseHeight: 26px;
$sidebarBg: #fff;

.layout-sidebar {
  position: relative;
  z-index: 10;
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
</style>
