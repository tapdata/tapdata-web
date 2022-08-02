<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      :loading="loading"
      :is-saving="isSaving"
      :dataflow-name="dataflow.name"
      :dataflow="dataflow"
      :scale="scale"
      @page-return="handlePageReturn"
      @save="save"
      @delete="handleDelete"
      @undo="handleUndo"
      @redo="handleRedo"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @zoom-to="handleZoomTo"
      @showSettings="handleShowSettings"
      @center-content="handleCenterContent"
      @auto-layout="handleAutoLayout"
      @change-name="handleUpdateName"
      @locate-node="handleLocateNode"
      @start="handleStart"
      @stop="handleStop"
      @forceStop="handleForceStop"
      @reset="handleReset"
      @edit="handleEdit"
      @detail="handleDetail"
    ></TopHeader>
    <section class="layout-wrap layout-has-sider">
      <!--左侧边栏-->
      <LeftSidebar
        v-if="!stateIsReadonly"
        v-resize.right="{
          minWidth: 260,
          maxWidth: 400
        }"
        @move-node="handleDragMoveNode"
        @drop-node="handleAddNodeByDrag"
        @add-table-as-node="handleAddTableAsNode"
      />
      <section class="layout-wrap">
        <!--内容体-->
        <main id="dfEditorContent" ref="layoutContent" class="layout-content flex-1 overflow-hidden">
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
            <EmptyItem></EmptyItem>
          </div>
          <NodePopover
            :popover="nodeMenu"
            @click-node="handleClickNodePopover"
            @hide="nodeMenu.typeId = ''"
          ></NodePopover>
        </main>
        <!--配置面板-->
        <ConfigPanel ref="configPanel" :settings="dataflow" :scope="scope" @hide="onHideSidebar"></ConfigPanel>
      </section>
    </section>
  </section>
</template>

<script>
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSidebar from './components/LeftSidebar'
import DFNode from './components/DFNode'
import { jsPlumb, config } from './instance'
import { NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from './components/ConfigPanel'
import { uuid } from '@tap/shared'
import { taskApi } from '@tap/api'
import { MoveNodeCommand } from './command'
import dagre from 'dagre'
import { merge } from 'lodash'
import EmptyItem from './components/EmptyItem'
import formScope from './mixins/formScope'
import NodePopover from './components/NodePopover'
import editor from './mixins/editor'
import Locale from './mixins/locale'

export default {
  name: 'Editor',

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor, Locale],

  components: {
    NodePopover,
    EmptyItem,
    ConfigPanel,
    PaperScroller,
    TopHeader,
    DFNode,
    LeftSidebar
  },

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
        connectionData: {}
      },

      dataflow: {
        id: '',
        name: ''
      },

      scale: 1
    }
  },

  async created() {
    if (this.$route.name === 'DataflowViewer') {
      this.setStateReadonly(true)
    }
    this.setValidateLanguage()
    await this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        await this.initView(true)
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
  },

  methods: {
    async initNodeType() {
      this.addProcessorNode([
        {
          name: 'JavaScript',
          type: 'js_processor'
        },
        {
          name: '聚合',
          type: 'aggregation_processor'
        },
        {
          name: 'Row Filter',
          type: 'row_filter_processor'
        },
        {
          name: '连接',
          type: 'join_processor'
        },
        {
          name: '主从合并',
          type: 'merge_table_processor'
        },
        {
          name: '字段计算',
          type: 'field_calc_processor'
        },
        {
          name: '类型修改',
          type: 'field_mod_type_processor'
        },
        {
          name: '字段改名',
          type: 'field_rename_processor'
        },
        {
          name: '增删字段',
          type: 'field_add_del_processor'
        }
      ])
      this.addResourceIns(allResourceIns)
      await this.loadCustomNode()
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)

      if (data) {
        const { dag } = data
        this.setStateReadonly(this.$route.name === 'DataflowViewer' ? true : this.dataflow.disabledData.edit)
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        this.setEditVersion(data.editVersion)
        this.setStateDirty(false)

        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.$refs.paperScroller.autoResizePaper()
        this.handleCenterContent()
      }
    },

    gotoViewer() {
      this.$router
        .push({
          name: 'DataflowViewer',
          params: {
            id: this.dataflow.id,
            action: 'dataflowViewer'
          }
        })
        .catch(() => {
          console.log('Current route: DataflowViewer') // eslint-disable-line
        })
    },

    getDataflowDataToSave() {
      const dag = this.$store.getters['dataflow/dag']
      const editVersion = this.$store.state.dataflow.editVersion
      return {
        dag,
        editVersion,
        ...this.dataflow
      }
    },

    /*async validate() {
      if (!this.dataflow.name) return this.t('editor_cell_validate_empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter(node => node.type === 'table')
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
        const minInputs = node.__Ctor.minInputs ?? 1 // 没有设置minInputs则缺省为1
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
    },*/

    // 循环检查检查链路的末尾节点类型是否是表节点
    isEndOfTable(source, sourceMap, nodeMap) {
      if (!sourceMap[source.id]) {
        // 末位节点
        return source.type === 'table'
      }

      for (let edge of sourceMap[source.id]) {
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
        this.$message.error(errorMsg)
        this.isSaving = false
        return
      }

      if (!this.dataflow.id) {
        return this.saveAsNewDataflow()
      }

      const data = this.getDataflowDataToSave()

      try {
        const result = await taskApi[needStart ? 'saveAndStart' : 'save'](data)
        this.reformDataflow(result)
        !needStart && this.$message.success(this.t('message_save_ok'))
        this.setEditVersion(result.editVersion)
        this.isSaving = false
        return true
      } catch (e) {
        this.isSaving = false
        this.handleError(e)
        return false
      }
    },

    async saveAsNewDataflow() {
      this.isSaving = true
      try {
        const data = this.getDataflowDataToSave()
        const dataflow = await taskApi.post(data)
        this.reformDataflow(dataflow)
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        // this.$message.success(this.t('message_save_ok'))
        await this.$router.replace({
          name: 'DataflowEditor',
          params: { id: dataflow.id, action: 'dataflowEdit' }
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('任务保存出错', e)
        this.handleError(e)
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

      dg.setGraph({ nodesep: 60, ranksep: 120, marginx: 50, marginy: 50, rankdir: 'LR' })
      dg.setDefaultEdgeLabel(function () {
        return {}
      })

      nodes.forEach(n => {
        dg.setNode(NODE_PREFIX + n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
        nodePositionMap[NODE_PREFIX + n.id] = n.attrs.position
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

    /**
     * 通过拖拽添加节点
     * 🎉 支持拖到连线上快速添加
     * @param item
     * @param position
     * @param rect
     */
    handleAddNodeByDrag(item, position, rect) {
      const paper = this.$refs.paperScroller
      // const newPosition = paper.getDropPositionWithinPaper(position, rect)
      const point = paper.getMouseToPage(rect)
      const newPosition = [point.x, point.y]
      const $elemBelow = document.elementFromPoint(...position)

      // 节点拖放在连线上
      if ($elemBelow.nodeName === 'path' && $elemBelow.parentElement._jsPlumb) {
        const connection = $elemBelow.parentElement._jsPlumb
        const source = this.getRealId(connection.sourceId)
        const target = this.getRealId(connection.targetId)
        this.addNodeOnConn(item, newPosition, source, target)
        this.jsPlumbIns.select().removeClass('connection-highlight')
      } else {
        this.handleAddNodeToPos(newPosition, item)
      }

      paper.autoResizePaper()
      // 重置导航线
      this.navLines = []
    },

    handleAddTableAsNode(item) {
      const { x, y } = this.$refs.paperScroller.getPaperCenterPos()
      const position = this.getNewNodePosition([x - NODE_WIDTH / 2, y - NODE_HEIGHT / 2], [0, 120])
      const node = this.handleAddNodeToPos(position, item)
      if (position[1] !== y) {
        this.$refs.paperScroller.centerNode(node)
      }
    },

    createNode(position, item) {
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const node = merge(
        {
          id: uuid(),
          attrs: { position }
        },
        item
      )

      const ins = item.__Ctor || getResourceIns(item)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false
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

    handleError(error, msg = '出错了') {
      if (error?.data?.code === 'Task.ListWarnMessage') {
        let names = []
        if (error.data?.data) {
          const keys = Object.keys(error.data.data)
          keys.forEach(key => {
            const node = this.$store.state.dataflow.NodeMap[key]
            if (node) {
              names.push(node.name)
              this.setNodeErrorMsg({
                id: node.id,
                msg: error.data.data[key][0].msg
              })
            }
          })
          if (!names.length && keys.length && msg) {
            // 兼容错误信息id不是节点id的情况
            const msg = error.data.data[keys[0]][0]?.msg
            if (msg) {
              this.$message.error(msg)
              return
            }
          }
        }
        // this.$message.error(`${this.t('dag_save_fail')} ${names.join('，')}`)
      }
      // else if (error?.data?.message) {
      //   this.$message.error(error.data.message)
      // } else {
      //   // eslint-disable-next-line no-console
      //   console.error(error)
      //   this.$message.error(msg)
      // }
    },

    handlePageReturn() {
      this.$router.push({
        name: 'dataflowList'
      })
    },

    handleEdit() {
      this.$router.push({
        name: 'DataflowEditor',
        params: { id: this.dataflow.id, action: 'dataflowEdit' }
      })
    },

    handleDetail() {
      this.$router.push({
        name: 'dataflowDetails',
        params: {
          id: this.dataflow.id
        }
      })
    }
  }
}
</script>

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
</style>
