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
      <LeftSider
        v-show="activeType !== 'node'"
        v-if="!stateIsReadonly"
        v-resize.right="{
          minWidth: 260,
          maxWidth: 400
        }"
        @move-node="handleDragMoveNode"
        @drop-node="handleAddNodeByDrag"
        @add-node="handleAddNode"
      />
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
        <PaperEmpty v-else-if="!allNodes.length"></PaperEmpty>
        <NodePopover
          :popover="nodeMenu"
          @click-node="handleClickNodePopover"
          @hide="nodeMenu.typeId = ''"
        ></NodePopover>
      </main>
      <!--配置面板-->
      <ConfigPanel ref="configPanel" :settings="dataflow" :scope="scope" @hide="onHideSidebar"></ConfigPanel>
      <!--<section class="layout-wrap">

      </section>-->
    </section>
  </section>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSider from './components/migration/LeftSider'
import DFNode from './components/DFNode'
import { jsPlumb, config } from './instance'
import { connectorActiveStyle } from './style'
import { DEFAULT_SETTINGS, NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH, NONSUPPORT_CDC, NONSUPPORT_SYNC } from './constants'
import { allResourceIns } from './nodes/loader'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from './components/migration/ConfigPanel'
import { uuid } from '@tap/shared'
import { Task } from '@tap/api'
import {
  AddConnectionCommand,
  AddNodeCommand,
  AddNodeOnConnectionCommand,
  CommandManager,
  MoveNodeCommand,
  QuickAddTargetCommand,
  RemoveConnectionCommand,
  RemoveNodeCommand
} from './command'
import Mousetrap from 'mousetrap'
import dagre from 'dagre'
import { validateBySchema } from '@tap/form/src/shared/validate'
import resize from 'web-core/directives/resize'
import { merge } from 'lodash'
import PaperEmpty from './components/PaperEmpty'
import EmptyItem from './components/EmptyItem'
import formScope from './mixins/formScope'
import editor from './mixins/editor'
import NodePopover from './components/NodePopover'

const taskApi = new Task()

export default {
  name: 'Editor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage, formScope, editor],

  components: {
    NodePopover,
    EmptyItem,
    PaperEmpty,
    ConfigPanel,
    PaperScroller,
    TopHeader,
    DFNode,
    LeftSider
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

  computed: {
    ...mapState('dataflow', ['activeNodeId']),
    ...mapGetters('dataflow', [
      'allNodes',
      'allEdges',
      'activeType',
      'isActionActive',
      'nodeById',
      'stateIsDirty',
      'stateIsReadonly',
      'processorNodeTypes',
      'hasNodeError'
    ]),

    selectBoxStyle() {
      let attr = this.selectBoxAttr
      return attr
        ? {
            left: attr.x + 'px',
            top: attr.y + 'px',
            width: attr.w + 'px',
            height: attr.h + 'px'
          }
        : null
    }
  },

  watch: {
    $route() {
      this.initView()
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
    ...mapMutations('dataflow', [
      'setStateDirty',
      'setStateReadonly',
      'setEdges',
      'setTaskId',
      'addResourceIns',
      'updateNodeProperties',
      'setActiveNode',
      'setActiveConnection',
      'resetSelectedNodes',
      'addSelectedNode',
      'addConnection',
      'removeConnection',
      'removeNode',
      'removeNodeFromSelection',
      'removeAllNodes',
      'reset',
      'addNode',
      'setActiveType',
      'setFormSchema',
      'setTransformStatus',
      'setEditVersion',
      'copyNodes',
      'pasteNodes',
      'setNodeError',
      'setNodeErrorMsg',
      'clearNodeError',
      'resetState',
      'selectConnection',
      'deselectAllConnections',
      'setCanBeConnectedNodeIds',
      'setValidateLanguage'
    ]),

    ...mapActions('dataflow', ['addNodeAsync', 'updateDag', 'loadCustomNode']),

    async confirmMessage(message, headline, type, confirmButtonText, cancelButtonText) {
      try {
        await this.$confirm(message, headline, {
          confirmButtonText,
          cancelButtonText,
          type,
          dangerouslyUseHTMLString: true
        })
        return true
      } catch (e) {
        return false
      }
    },

    async initView(first) {
      this.stopDagWatch?.()

      if (this.$route.params.action === 'dataflowEdit') {
        // 保存后路由跳转
        this.setStateDirty(false)
        this.setStateReadonly(false)
        this.stopDagWatch = this.$watch(() => this.allNodes.length + this.allEdges.length, this.updateDag)
        // 从查看进入编辑，清掉轮询
        return Promise.resolve()
      }

      if (this.$route.params.action === 'dataflowViewer') {
        this.setStateReadonly(true)
        return Promise.resolve()
      }

      const { id } = this.$route.params
      this.dataflow.id = id

      if (!first) {
        this.resetWorkspace()
        this.initNodeView()
      }
      if (this.$route.name === 'DataflowViewer') {
        await this.openDataflow(id)
        // await this.startLoop()
        this.setStateReadonly(true)
      } else {
        if (id) {
          await this.openDataflow(id)
          // 检查任务是否可编辑
          this.checkGotoViewer()
        } else {
          await this.newDataflow()
        }
        this.stopDagWatch = this.$watch(() => this.allNodes.length + this.allEdges.length, this.updateDag)
      }

      this.initWS()
    },

    initCommand() {
      this.command = new CommandManager(this.$store, this.jsPlumbIns)
      Mousetrap.bind('mod+c', () => {
        !this.stateIsReadonly && this.copyNodes()
      })
      Mousetrap.bind('mod+v', () => {
        !this.stateIsReadonly && this.pasteNodes(this.command)
      })
      Mousetrap.bind('mod+z', e => {
        e.preventDefault()
        !this.stateIsReadonly && this.command.undo()
      })
      Mousetrap.bind('mod+shift+z', () => {
        !this.stateIsReadonly && this.command.redo()
      })
      Mousetrap.bind('mod+shift+o', () => {
        this.$refs.paperScroller.toggleMiniView()
      })
      Mousetrap.bind('backspace', () => {
        !this.stateIsReadonly && this.handleDelete()
      })
      Mousetrap.bind(['option+command+l', 'ctrl+alt+l'], e => {
        e.preventDefault()
        this.handleAutoLayout()
      })
    },

    async initNodeType() {
      this.addResourceIns(allResourceIns)
    },

    initNodeView() {
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
      jsPlumbIns.registerConnectionType('active', connectorActiveStyle)

      jsPlumbIns.bind('connection', (info, event) => {
        const { sourceId, targetId } = info
        const source = this.getRealId(sourceId)
        const target = this.getRealId(targetId)
        const connection = { source, target }
        const connectionIns = info.connection

        info.connection.bind('click', () => {
          if (this.stateIsReadonly) return
          this.handleDeselectAllConnections()
          info.connection.showOverlay('removeConn')
          info.connection.showOverlay('addNodeOnConn')
          info.connection.addClass('connection-selected')
          this.selectConnection(connection)
        })
        info.connection.bind('mouseover', () => {
          if (!this.stateIsReadonly) {
            info.connection.showOverlay('removeConn')
            info.connection.showOverlay('addNodeOnConn')
          }
        })
        info.connection.bind('mouseout', () => {
          if (
            connectionIns.hasClass('connection-selected') /* ||
            (this.nodeMenu.show && this.nodeMenu.reference === connectionIns.canvas)*/
          )
            return
          connectionIns.hideOverlay('removeConn')
          connectionIns.hideOverlay('addNodeOnConn')
        })

        // 添加新增按钮，并且绑定事件，默认不可见
        info.connection.addOverlay([
          'Custom',
          {
            id: 'addNodeOnConn',
            location: 0.35,
            create() {
              const div = document.createElement('div')
              div.title = '添加节点'
              div.classList.add('conn-btn__wrap')
              div.innerHTML = `<div class="conn-btn"><span class="v-icon"> <svg class="v-icon__svg"><use xlink:href="#icon-plus"></use></svg> </span></div>`
              return div
            },
            visible: false,
            events: {
              click: async overlay => {
                const rect = info.connection.canvas.getBoundingClientRect()
                this.nodeMenu.connectionCenterPos = [rect.x + rect.width / 2, rect.y + rect.height / 2]
                await this.showNodePopover('connection', connection, overlay.canvas)
              }
            }
          }
        ])

        info.connection.addOverlay([
          'Custom',
          {
            id: 'removeConn',
            location: 0.65,
            create() {
              const div = document.createElement('div')
              div.title = '删除连接'
              div.classList.add('conn-btn__wrap')
              div.innerHTML = `<div class="conn-btn"><span class="v-icon"> <svg class="v-icon__svg"><use xlink:href="#icon-close"></use></svg> </span></div>`
              return div
            },
            visible: false,
            events: {
              click: () => {
                this.command.exec(
                  new RemoveConnectionCommand({
                    source,
                    target
                  })
                )
              }
            }
          }
        ])

        // 拖动连接
        if (event) {
          this.addConnection(connection)

          this.command.exec(new AddConnectionCommand(connection), true)
        }
      })

      jsPlumbIns.bind('beforeDrop', info => {
        const { sourceId, targetId } = info

        return this.checkCanBeConnected(this.getRealId(sourceId), this.getRealId(targetId), true)
      })

      jsPlumbIns.bind('beforeDrag', ({ sourceId }) => {
        if (this.stateIsReadonly) return false
        // 根据连接类型判断，节点是否仅支持作为目标
        const node = this.nodeById(this.getRealId(sourceId))
        const connectionType = node.attrs.connectionType
        if (connectionType && !connectionType.includes('source')) {
          this.$message.info(`该节点「${node.name}」仅支持作为目标`)
          return false
        }
        return true
      })

      // 连线拖动时，可以被连的节点在画布上凸显
      jsPlumbIns.bind('connectionDrag', info => {
        const source = this.nodeById(this.getRealId(info.sourceId))
        const canBeConnectedNodes = this.allNodes.filter(target => this.checkCanBeConnected(source.id, target.id))
        this.setCanBeConnectedNodeIds(canBeConnectedNodes.map(n => n.id))
      })

      jsPlumbIns.bind('connectionDragStop', () => {
        this.setCanBeConnectedNodeIds([])
      })
    },

    async openDataflow(id) {
      const data = await this.loadDataflow(id)

      if (data) {
        const { dag } = data
        this.setStateReadonly(this.$route.name === 'MigrateViewer' ? true : this.dataflow.disabledData.edit)
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
          name: 'MigrateViewer',
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
        ...this.dataflow,
        syncType: 'migrate'
      }
    },

    async validate() {
      if (!this.dataflow.name) return this.$t('editor.cell.validate.empty_name')

      // 至少两个数据节点
      const tableNode = this.allNodes.filter(node => node.type === 'database')
      if (tableNode.length < 2) {
        return this.$t('editor.cell.validate.none_data_node')
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
          someErrorMsg = `「 ${node.name} 」至少需要一个源节点`
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
        !needStart && this.$message.success(this.$t('message_save_ok'))
        this.setEditVersion(result.editVersion)
        this.isSaving = false
        return true
      } catch (e) {
        this.handleError(e)
        this.isSaving = false
        return false
      }
    },

    async saveAsNewDataflow() {
      try {
        this.isSaving = true
        const data = this.getDataflowDataToSave()
        const dataflow = await taskApi.post(data)
        this.isSaving = false
        this.reformDataflow(dataflow)
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        // this.$message.success(this.$t('message_save_ok'))
        await this.$router.replace({
          name: 'MigrateEditor',
          params: { id: dataflow.id, action: 'dataflowEdit' }
        })
      } catch (e) {
        // this.$showError(e, '任务保存出错', '出现的问题:')
        // eslint-disable-next-line no-console
        console.error('任务保存出错', e)
        this.handleError(e)
      }
    },

    handleUndo() {
      this.command.undo()
    },

    handleRedo() {
      this.command.redo()
    },

    /**
     * 删除选中的节点
     */
    handleDelete() {
      const selectNodes = this.$store.getters['dataflow/getSelectedNodes']
      this.command.exec(new RemoveNodeCommand(selectNodes))
      this.resetSelectedNodes()
      this.deleteSelectedConnections()
    },

    handleDeleteById(id) {
      const node = this.nodeById(id)
      this.command.exec(new RemoveNodeCommand(node))
      this.nodeDeselected(node)

      this.nodeMenu.show = false // 防止节点删除后，popover仍在显示
    },

    handleZoomIn() {
      this.$refs.paperScroller.zoomIn()
    },

    handleZoomOut() {
      this.$refs.paperScroller.zoomOut()
    },

    handleZoomTo(scale) {
      this.$refs.paperScroller.zoomTo(scale)
    },

    handleShowSettings() {
      this.deselectAllNodes()
      this.setActiveType('settings')
    },

    /**
     * 画布内容居中在可视区域
     */
    handleCenterContent() {
      this.$refs.paperScroller.centerContent()
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

    /**
     * 判断node之间是否相连
     * @param s
     * @param t
     * @returns {boolean}
     */
    isConnected(s, t) {
      s = NODE_PREFIX + s
      t = NODE_PREFIX + t
      return this.nodeELIsConnected(s, t)
    },

    nodeELIsConnected(s, t) {
      const connections = this.jsPlumbIns.getConnections('*')
      // eslint-disable-next-line
      console.log('connections', connections)
      return this.jsPlumbIns.getConnections('*').some(c => `${c.sourceId}` === s && `${c.targetId}` === t)
    },

    allowConnect(sourceId, targetId) {
      const allEdges = this.allEdges
      const map = allEdges.reduce((map, item) => {
        let target = map[item.target]
        if (target) {
          target.push(item.source)
        } else {
          map[item.target] = [item.source]
        }
        return map
      }, {})

      if (!map[sourceId]) return true

      return !this.isParent(sourceId, targetId, map)
    },

    // 循环检查target是否是source的上级
    isParent(sourceId, targetId, map) {
      let flag = false
      if (!map[sourceId]) return flag
      for (let id of map[sourceId]) {
        flag = id === targetId
        if (flag || this.isParent(id, targetId, map)) return true
      }
      return flag
    },

    resetWorkspace() {
      this.dataflow = merge(
        {
          id: '',
          name: ''
        },
        DEFAULT_SETTINGS
      )
      this.jsPlumbIns.reset()
      this.deselectAllNodes()
      this.reset()
      this.setActiveNode(null)
      this.resetSelectedNodes()
    },

    async validateNode(node) {
      try {
        await validateBySchema(node.__Ctor.formSchema, node, this.scope)
        this.clearNodeError(node.id)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('节点校验错误', e)
        this.setNodeError(node.id)
      }
    },

    async validateAllNodes() {
      await Promise.all(
        this.allNodes.map(node => {
          if (this.activeNodeId === node.id) {
            return this.$refs.configPanel.validateForm()
          } else {
            return this.validateNode(node)
          }
        })
      )
    },

    /**
     * 从侧边栏拖拽节点时，判断是否能放置到连线，并且高亮可以放置的线
     * @param item
     * @param position
     * @param el
     */
    handleDragMoveNode(item, position, el) {
      this.jsPlumbIns.select().removeClass('connection-highlight')
      const $elemBelow = document.elementFromPoint(...position)

      if ($elemBelow?.nodeName === 'path' && $elemBelow.parentElement._jsPlumb) {
        $elemBelow.parentElement.classList.add('connection-highlight')
      }

      let lines = []

      if (document.getElementById('dfEditorContent').contains($elemBelow)) {
        el.style.transform = `scale(${this.scale})`
        let nw = el.offsetWidth
        let nh = el.offsetHeight
        const pos = this.$refs.paperScroller.getDropPositionWithinPaper(position, {
          width: nw,
          height: nh
        })
        let diffPos = { x: 0, y: 0 }
        let horiArr = []
        let verArr = []
        let rangeX = 10
        let rangeY = 10

        this.allNodes.forEach(item => {
          let [x, y] = item.attrs.position
          let _x = x - pos[0]
          let _y = y - pos[1]
          if (Math.abs(_x) <= Math.abs(rangeX)) {
            if (_x === rangeX) {
              verArr.push(y)
            } else {
              rangeX = _x
              verArr = [y]
            }
            diffPos.x = rangeX
          }
          if (Math.abs(_y) <= Math.abs(rangeY)) {
            if (_y === rangeY) {
              horiArr.push(x)
            } else {
              rangeY = _y
              horiArr = [x]
            }
            diffPos.y = rangeY
          }
        })

        pos[0] += diffPos.x
        pos[1] += diffPos.y

        // console.log('diffPos', diffPos.x, diffPos.y)
        el.style.left = parseInt(el.style.left) + diffPos.x * this.scale + 'px'
        el.style.top = parseInt(el.style.top) + diffPos.y * this.scale + 'px'

        let t = pos[1],
          b = pos[1] + nh,
          l = pos[0],
          r = pos[0] + nw
        verArr.forEach(y => {
          t = Math.min(y + nh, t)
          b = Math.max(y, b)
        })
        horiArr.forEach(x => {
          l = Math.min(x + nw, l)
          r = Math.max(x, r)
        })

        // 组装导航线
        if (t < pos[1]) {
          let top = t + 'px',
            height = pos[1] - t + 'px'
          lines.push(
            {
              top,
              left: pos[0] + 'px',
              height
            },
            {
              top,
              left: pos[0] + nw + 'px',
              height
            }
          )
        }
        if (b > pos[1] + nh) {
          let top = pos[1] + nh + 'px',
            height = b - pos[1] - nh + 'px'
          lines.push(
            {
              top,
              left: pos[0] + 'px',
              height
            },
            {
              top,
              left: pos[0] + nw + 'px',
              height
            }
          )
        }

        if (l < pos[0]) {
          let left = l + 'px',
            width = pos[0] - l + 'px'
          lines.push(
            {
              top: pos[1] + 'px',
              left,
              width
            },
            {
              top: pos[1] + nh + 'px',
              left,
              width
            }
          )
        }

        if (r > pos[0] + nw) {
          let left = pos[0] + nw + 'px',
            width = r - pos[0] - nw + 'px'
          lines.push(
            {
              top: pos[1] + 'px',
              left,
              width
            },
            {
              top: pos[1] + nh + 'px',
              left,
              width
            }
          )
        }
      } else {
        el.style.transform = 'scale(1)'
      }

      this.navLines = lines
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
      } else {
        this.handleAddNodeToPos(newPosition, item)
      }

      paper.autoResizePaper()
      // 重置导航线
      this.navLines = []
    },

    handleAddNodeToPos(position, item) {
      const node = this.createNode(position, item)
      this.command.exec(new AddNodeCommand(node))
      return node
    },

    handleAddNode(item) {
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

    handleMouseSelect(showSelectBox, selectBoxAttr) {
      // 取消选中所有节点
      this.deselectAllNodes()
      // 清空激活状态
      this.setActiveType(null)

      if (showSelectBox) {
        const selectedNodes = this.getNodesInSelection(selectBoxAttr)
        selectedNodes.forEach(node => this.nodeSelected(node))
      }
    },

    handleChangeScale(scale) {
      this.scale = scale
      this.jsPlumbIns.setZoom(scale)
    },

    isSource(node) {
      const id = node.id
      const allEdges = this.allEdges
      return allEdges.some(({ source }) => source === id)
    },

    /**
     * 快速添加目标节点
     * @param source 源节点
     * @param nodeType 节点的类型对象
     */
    quickAddNode(source, nodeType) {
      const spaceX = 120
      const spaceY = 120

      const newPosition = [source.attrs.position[0] + NODE_WIDTH + spaceX, source.attrs.position[1]]
      let movePosition = [spaceX, 0]

      if (this.isSource(source)) {
        newPosition[1] += spaceY
        movePosition = [0, spaceY]
      }

      const position = this.getNewNodePosition(newPosition, movePosition)
      const target = this.createNode(position, nodeType)

      if (target.__Ctor.allowSource(source) && source.__Ctor.allowTarget(target, source)) {
        this.command.exec(new QuickAddTargetCommand(source.id, target))
      }
    },

    /**
     * 在连线上添加节点
     * @param nodeType
     * @param position
     * @param source 连线源节点的id
     * @param target 连线目标节点的id
     */
    addNodeOnConn(nodeType, position, source, target) {
      const a = this.nodeById(source)
      const b = this.createNode(position, nodeType)
      const c = this.nodeById(target)
      const aCtor = a.__Ctor
      const bCtor = b.__Ctor
      const cCtor = c.__Ctor

      if (bCtor.allowSource(a) && aCtor.allowTarget(b, a) && cCtor.allowSource(b) && bCtor.allowTarget(cCtor, b)) {
        this.command.exec(
          new AddNodeOnConnectionCommand(
            {
              source,
              target
            },
            b
          )
        )
      }
    },

    addNodeOnConnByNodeMenu(nodeType) {
      const { nodeMenu } = this
      const position = this.$refs.paperScroller.getDropPositionWithinPaper(nodeMenu.connectionCenterPos, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      })
      this.addNodeOnConn(nodeType, position, nodeMenu.data.source, nodeMenu.data.target)
      this.$nextTick(() => {
        this.handleAutoLayout()
      })
    },

    canUsePosition(position1, position2) {
      if (Math.abs(position1[0] - position2[0]) <= NODE_WIDTH) {
        if (Math.abs(position1[1] - position2[1]) <= NODE_HEIGHT) {
          return false
        }
      }

      return true
    },

    getNewNodePosition(newPosition, movePosition) {
      newPosition = newPosition.slice()

      if (!movePosition) {
        movePosition = [50, 50]
      }

      let conflictFound = false // 查找冲突
      let i, node
      do {
        conflictFound = false
        for (i = 0; i < this.allNodes.length; i++) {
          node = this.allNodes[i]
          if (!this.canUsePosition(node.attrs.position, newPosition)) {
            conflictFound = true
            break
          }
        }

        if (conflictFound === true) {
          newPosition[0] += movePosition[0]
          newPosition[1] += movePosition[1]
        }
      } while (conflictFound === true)

      return newPosition
    },

    handleError(error, msg = '出错了') {
      if (error?.data.code === 'Task.ListWarnMessage') {
        let names = []
        if (error.data.data) {
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
        this.$message.error(`${this.$t('dag_save_fail')} ${names.join('，')}`)
      } else if (error?.data?.message) {
        this.$message.error(error.data.message)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
        this.$message.error(msg)
      }
    },

    async handleUpdateName(name) {
      this.dataflow.name = name
      taskApi
        .patch({
          id: this.dataflow.id,
          name
        })
        .catch(this.handleError)
    },

    handleEditFlush(result) {
      this.reformDataflow(result.data, true)

      const { opType } = result
      if (opType === 'transformRate') {
        // 推演进度
        this.setTransformStatus(result.transformStatus)
      } else if (opType === 'updateVersion') {
        // 版本变化
      }
    },

    handlePageReturn() {
      this.$router.push({
        name: 'migrateList'
      })
    },

    handleLocateNode(node) {
      this.$refs.paperScroller.centerNode(node)
      this.nodeSelectedById(node.id, true, true)
    },

    async handleStart() {
      const flag = await this.save(true)
      if (flag) {
        this.startAt = Date.now()
        console.log('handleStart', this.startAt) // eslint-disable-line
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        this.gotoViewer()
      }
    },

    handleStop() {
      let message = this.getConfirmMessage('stop')

      this.$confirm(message, '', {
        type: 'warning',
        showClose: false
      }).then(async resFlag => {
        if (!resFlag) {
          return
        }

        try {
          this.dataflow.disabledData.stop = true

          await taskApi.stop(this.dataflow.id)
          this.$message.success(this.$t('message.operationSuccuess'))
        } catch (e) {
          this.handleError(e, this.$t('message.stopFail'))
          console.log(e) // eslint-disable-line
        }
      })
    },

    handleForceStop() {
      let msg = this.getConfirmMessage('force_stop')
      this.$confirm(msg, '', {
        type: 'warning',
        showClose: false
      }).then(async resFlag => {
        if (!resFlag) {
          return
        }

        this.dataflow.disabledData.stop = true
        await taskApi.forceStop(this.dataflow.id)
        // this.startLoop(true)
      })
    },

    handleReset() {
      let msg = this.getConfirmMessage('initialize')
      this.$confirm(msg, '', {
        type: 'warning'
      }).then(async resFlag => {
        if (!resFlag) {
          return
        }
        try {
          this.dataflow.disabledData.reset = true
          const data = await taskApi.reset(this.dataflow.id)
          this.responseHandler(data, this.$t('message.resetOk'))
        } catch (e) {
          this.handleError(e, this.$t('message.resetFailed'))
        }
      })
    },

    handleEdit() {
      this.$router.push({
        name: 'MigrateEditor',
        params: { id: this.dataflow.id, action: 'dataflowEdit' }
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

    getConfirmMessage(operateStr) {
      let message = operateStr + '_confirm_message'

      const h = this.$createElement
      let strArr = this.$t('dataFlow.' + message).split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          this.dataflow.name
        ),
        strArr[1]
      ])
      return msg
    },

    responseHandler(data, msg) {
      let failList = data?.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('dataFlow.multiError.notFound'),
          6: this.$t('dataFlow.multiError.statusError'),
          7: this.$t('dataFlow.multiError.otherError'),
          8: this.$t('dataFlow.multiError.statusError')
        }
        let nameMapping = {}
        this.table.list.forEach(item => {
          nameMapping[item.id] = item.name
        })
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg)
      }
    },

    async loadDataflow(id) {
      this.loading = true
      try {
        const data = await taskApi.get([id])
        data.dag = data.temp || data.dag // 和后端约定了，如果缓存有数据则获取temp
        this.reformDataflow(data)
        return data
      } catch (e) {
        console.log('任务加载出错', e) // eslint-disable-line
      } finally {
        this.loading = false
      }
    },

    initWS() {
      this.$ws.off('editFlush', this.handleEditFlush)
      this.$ws.on('editFlush', this.handleEditFlush)
      this.$ws.send({
        type: 'editFlush',
        taskId: this.dataflow.id,
        data: {
          opType: 'subscribe'
        }
      })
    },

    deleteSelectedConnections() {
      const selectedConnections = this.$store.state.dataflow.selectedConnections
      if (!selectedConnections.length) return

      selectedConnections.forEach(({ target, source }) => {
        const conn = this.jsPlumbIns.select({
          target: NODE_PREFIX + target,
          source: NODE_PREFIX + source
        })

        if (conn) {
          this.command.exec(
            new RemoveConnectionCommand({
              source,
              target
            })
          )
        }
      })

      this.deselectAllConnections()
    },

    async showNodePopover(type, data, el) {
      type === 'node' && this.handleDeselectAllConnections()
      this.nodeMenu.show = false
      this.nodeMenu.reference = null
      await this.$nextTick()
      this.nodeMenu.reference = el
      this.nodeMenu.type = type
      this.nodeMenu.data = data
      await this.$nextTick()
      this.nodeMenu.show = true
      this.nodeMenu.typeId = data.id
    },

    handleClickNodePopover(node) {
      this.nodeMenu.show = false
      if (this.nodeMenu.type === 'node') {
        this.quickAddNode(this.nodeMenu.data, node)
      } else {
        this.addNodeOnConnByNodeMenu(node)
      }
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
