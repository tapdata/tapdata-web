<template>
  <section class="dataflow-editor layout-wrap vh-100">
    <!--头部-->
    <TopHeader
      :is-saving="isSaving"
      :is-editable="isEditable"
      :editable="editable"
      :status="status"
      :status-bt-map="statusBtMap"
      :sync_type="sync_type"
      :creat-user-id="creatUserId"
      :is-starting="isStarting"
      :dataflow-name="dataflow.name"
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
    ></TopHeader>
    <section class="layout-wrap layout-has-sider">
      <!--左侧边栏-->
      <LeftSidebar
        v-resize.right="{
          minWidth: 230,
          maxWidth: 400
        }"
        @move-node="handleDragMoveNode"
        @drop-node="handleAddNodeByDrag"
      />
      <section class="layout-wrap">
        <!--内容体-->
        <main id="dfEditorContent" ref="layoutContent" class="layout-content flex-1 overflow-hidden">
          <PaperScroller
            ref="paperScroller"
            @add-node="handleAddNodeToPos"
            @mouse-select="handleMouseSelect"
            @change-scale="handleChangeScale"
          >
            <DFNode
              v-for="n in nodes"
              :key="n.id"
              :node-id="n.id"
              :id="NODE_PREFIX + n.id"
              :js-plumb-ins="jsPlumbIns"
              @drag-start="onNodeDragStart"
              @drag-move="onNodeDragMove"
              @drag-stop="onNodeDragStop"
              @deselectAllNodes="deselectAllNodes"
              @deselectNode="nodeDeselectedById"
              @nodeSelected="nodeSelectedById"
              @delete="handleDeleteById"
              @quick-add-node="quickAddNode"
            ></DFNode>
          </PaperScroller>
          <ElPopover
            ref="nodeMenu"
            v-model="nodeMenu.show"
            trigger="hover"
            placement="bottom"
            width="88"
            popper-class="min-width-unset rounded-xl"
            :reference="nodeMenu.reference"
          >
            <div class="df-menu-list">
              <div
                v-for="(n, ni) in processorNodeTypes"
                :key="ni"
                class="df-menu-item"
                @click="addNodeOnConnByNodeMenu(n)"
              >
                {{ n.name }}
              </div>
            </div>
          </ElPopover>
        </main>
        <!--配置面板-->
        <ConfigPanel :settings="dataflow" @hide="onHideSidebar"></ConfigPanel>
      </section>
    </section>
  </section>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSidebar from './components/LeftSidebar'
import DFNode from './components/DFNode'
import jsPlumbIns from './instance'
import { connectorActiveStyle } from './style'
import { DEFAULT_SETTINGS, NODE_HEIGHT, NODE_PREFIX, NODE_WIDTH, STATUS_MAP } from './constants'
import { ctorTypes, nodeTypes } from 'web-core/nodes/loader/index'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from 'web-core/views/dataflow/components/ConfigPanel'
import { off, on } from 'web-core/utils/dom'
import { uuid } from 'web-core/utils/util'
import DatabaseTypes from 'web-core/api/DatabaseTypes'
import Task from 'web-core/api/Task'
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
import { validateBySchema } from 'web-core/components/form/utils/validate'
import resize from 'web-core/directives/resize'
import { merge } from 'lodash'

const databaseTypesApi = new DatabaseTypes()
const taskApi = new Task()

export default {
  name: 'Editor',

  directives: {
    resize
  },

  mixins: [deviceSupportHelpers, titleChange, showMessage],

  props: {
    listRoute: {
      type: Object,
      default: () => ({ name: 'Task' })
    }
  },

  components: {
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
      loading: true,
      editable: false,
      isMoniting: false,
      isSimple: false,
      isSaving: false,
      isStarting: false,
      sync_type: 'initial_sync+cdc',
      creatUserId: '',
      statusBtMap: STATUS_MAP,
      jsPlumbIns,
      nodeMap: {},
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false,
      nodeViewScale: 1,
      mapping: this.$route.query?.mapping,

      nodeMenu: {
        show: false,
        reference: null,
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
    ...mapGetters('dataflow', {
      nodes: 'allNodes',
      edges: 'allEdges',
      isActionActive: 'isActionActive',
      nodeById: 'nodeById',
      stateIsDirty: 'getStateIsDirty',
      nodeViewOffsetPosition: 'getNodeViewOffsetPosition',
      processorNodeTypes: 'processorNodeTypes'
    }),

    dataflowStyle() {
      const offsetPosition = this.nodeViewOffsetPosition
      return {
        left: offsetPosition[0] + 'px',
        top: offsetPosition[1] + 'px'
      }
    },

    backgroundStyle() {
      const offsetPosition = this.nodeViewOffsetPosition
      return {
        transform: `scale(${this.nodeViewScale})`,
        'background-position': `right ${-offsetPosition[0]}px bottom ${-offsetPosition[1]}px`
      }
    },

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
    },

    isEditable() {
      return ['draft', 'error', 'paused'].includes(this.status)
    }
  },

  watch: {
    $route: 'initView'
  },

  created() {
    this.initNodeType()
  },

  mounted() {
    this.jsPlumbIns.ready(async () => {
      try {
        this.initCommand()
        this.initNodeView()
        await this.initView()
        this.initWS()
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    })
  },

  destroyed() {
    this.command = null
    this.resetWorkspace()
  },

  methods: {
    ...mapMutations('dataflow', [
      'setStateDirty',
      'setEdges',
      'setTaskId',
      'setNodeTypes',
      'setCtorTypes',
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
      'pasteNodes'
    ]),

    ...mapActions('dataflow', ['addNodeAsync', 'updateDag']),

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

    async initView() {
      if (this.$route.params.action === 'dataflowSave') {
        // 保存后路由跳转
        this.setStateDirty(false)
        return Promise.resolve()
      }

      if (this.stateIsDirty) {
        // 状态已被修改
        const importConfirm = await this.confirmMessage(
          `当您切换数据流时，您当前的数据流更改将丢失。`,
          '确定切换？',
          'warning',
          '确定（不保存）'
        )
        if (importConfirm === false) {
          return Promise.resolve()
        }
      }

      const { id } = this.$route.params

      if (id) {
        await this.openDataflow(id)
      } else {
        await this.newDataflow()
        // this.handleShowSettings() // 默认打开设置
      }

      this.stopDagWatch?.()
      this.stopDagWatch = this.$watch(() => this.nodes.length + this.edges.length, this.updateDag)
    },

    initCommand() {
      this.command = new CommandManager(this.$store, this.jsPlumbIns)
      Mousetrap.bind('mod+c', () => {
        console.log('复制快捷键')
        this.copyNodes()
      })
      Mousetrap.bind('mod+v', () => {
        console.log('粘贴快捷键')
        this.pasteNodes(this.command)
      })
      Mousetrap.bind('mod+z', () => {
        this.command.undo()
      })
      Mousetrap.bind('mod+shift+z', () => {
        this.command.redo()
      })
      Mousetrap.bind('mod+shift+o', () => {
        this.$refs.paperScroller.toggleMiniView()
      })
      Mousetrap.bind('backspace', () => {
        this.handleDelete()
      })
      Mousetrap.bind(['option+command+l', 'ctrl+alt+l'], e => {
        e.preventDefault()
        this.handleAutoLayout()
      })
    },

    async initNodeType() {
      let _nodeTypes = nodeTypes
      // let dataFlowType
      /*if (this.mapping === 'cluster-clone') {
        // dataFlowType = 'database-migration' // 数据库迁移
        const dbTypes = await this.loadDatabaseTypes(nodeTypes)
        _nodeTypes = _nodeTypes.filter(item => item.type === 'database')
        _nodeTypes.push(...dbTypes)
      }*/
      this.setNodeTypes(_nodeTypes)
      this.setCtorTypes(ctorTypes)
    },

    /**
     * 加载插件化数据源节点
     * @param allNodeTypes
     * @returns {Promise<*>}
     */
    async loadDatabaseTypes(allNodeTypes) {
      // 临时过滤本地的数据库节点
      const localTypes = allNodeTypes.map(item => item.attr.databaseType)

      const { data } = await databaseTypesApi.get({
        filter: {
          fields: {
            id: 1,
            type: 1,
            name: 1
          },
          where: {
            type: {
              nin: localTypes
            }
          }
        }
      })

      return data.map(item => {
        return {
          name: item.name,
          icon: 'tigerdb',
          group: 'plugin',
          type: 'database',
          constructor: 'Database',
          attr: {
            databaseType: item.type
          }
        }
      })
    },

    initNodeView() {
      // let container = this.$refs.layoutContent
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
      jsPlumbIns.registerConnectionType('active', connectorActiveStyle)

      jsPlumbIns.bind('connection', (info, event) => {
        // console.log('connectionEvent', info) // eslint-disable-line
        const { sourceId, targetId } = info
        const source = this.getRealId(sourceId)
        const target = this.getRealId(targetId)
        const connection = { source, target }

        info.connection.bind('mouseover', () => {
          info.connection.showOverlay('removeConn')
          info.connection.showOverlay('addNodeOnConn')
        })
        info.connection.bind('mouseout', () => {
          info.connection.hideOverlay('removeConn')
          info.connection.hideOverlay('addNodeOnConn')
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
              mousedown: overlay => {
                const rect = info.connection.canvas.getBoundingClientRect()
                // 更新reference
                this.nodeMenu.reference = overlay.canvas
                this.$refs.nodeMenu.referenceElm = overlay.canvas
                this.nodeMenu.connection = connection
                this.nodeMenu.connectionCenterPos = [rect.x + rect.width / 2, rect.y + rect.height / 2]
                // 显示菜单
                this.nodeMenu.show = true
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
              mousedown: () => {
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

      const _instance = {
        getConnections(params) {
          // console.log('_instance', params) // eslint-disable-line
          if (typeof params === 'object') {
            if (params.target) params.target = NODE_PREFIX + params.target
            if (params.source) params.source = NODE_PREFIX + params.source
          }
          return jsPlumbIns.getConnections(params)
        }
      }

      jsPlumbIns.bind('beforeDrop', info => {
        // console.log('beforeDrop', info) // eslint-disable-line
        const { sourceId, targetId } = info

        const source = this.nodeById(this.getRealId(sourceId))
        const target = this.nodeById(this.getRealId(targetId))

        // target.__Ctor.allowSource(source)

        if (!this.nodeELIsConnected(sourceId, targetId) && !this.isParent(source.id, target.id)) {
          return target.__Ctor.allowSource(source) && source.__Ctor.allowTarget(target, source, _instance)
        }

        return false
      })
    },

    async openDataflow(id) {
      this.resetWorkspace()

      let data
      try {
        data = await taskApi.get([id]) // this.creatUserId = result.user_id
        if (data.temp) data.dag = data.temp // 和后端约定了，如果缓存有数据则获取temp
      } catch (e) {
        this.$showError(e, '任务加载出错', '加载任务出现的问题:')
        return
      }

      const { dag } = data

      delete data.dag

      this.status = data.status
      this.$set(this, 'dataflow', data)

      await this.addNodes(dag)
      this.setTaskId(data.id)
      this.setEdges(dag.edges)
      this.setEditVersion(data.editVersion)
      this.setStateDirty(false)

      this.$refs.paperScroller.autoResizePaper()
      this.handleCenterContent()
    },

    async newDataflow() {
      this.resetWorkspace()
      this.dataflow.name = '新任务@' + new Date().toLocaleTimeString()
      await this.saveAsNewDataflow()
    },

    /**
     * 旧版数据转换
     * @param stages
     * @returns {boolean}
     */
    transformStages(stages) {
      if (!stages.length) return false
      // 判断是否是旧版数据
      if ('position' in stages[0]) return false
      stages.forEach(item => {
        item.position = [0, 0]
        item.databaseType = item.database_type
        delete item.database_type
      })
      return true
    },

    async addNodes({ nodes, edges }) {
      if (!nodes?.length) return
      const { getters } = this.$store
      const getNodeType = getters['dataflow/nodeType']
      const getCtor = getters['dataflow/getCtor']

      // 创建节点
      let nodeType
      nodes.forEach(node => {
        delete node.outputSchema // 粗暴删除不需要的节点属性
        nodeType = getNodeType(node)

        if (nodeType !== null) {
          const Ctor = getCtor(nodeType.constructor)
          const ins = new Ctor(nodeType)

          Object.defineProperty(node, '__Ctor', {
            value: ins,
            enumerable: false
          })

          this.addNode(node)
        }
      })

      await this.$nextTick()

      // 连线
      edges.forEach(({ source, target }) => {
        this.jsPlumbIns.connect({ uuids: [`${NODE_PREFIX}${source}_source`, `${NODE_PREFIX}${target}_target`] })
      })
    },

    getRealId(str) {
      return str.replace(new RegExp(`^${NODE_PREFIX}`), '')
    },

    onNodeDragStart() {
      if (this.ifNodeDragStart) {
        this.ifNodeDragStart = false
        return
      }
      this.ifNodeDragStart = true
    },

    onNodeDragMove(param) {
      if (!this.ifNodeDragStart) return
      let { id, pos } = param
      let nw = param.el.offsetWidth
      let nh = param.el.offsetHeight
      let diffPos = { x: 0, y: 0 }
      let horiArr = []
      let verArr = []
      let rangeX = 10
      let rangeY = 10

      this.nodes.forEach(item => {
        if (item.id !== id) {
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
        }
      })

      pos[0] += diffPos.x
      pos[1] += diffPos.y

      // this.updateNodeProperties({
      //   id,
      //   properties: {
      //     position: [...pos]
      //   }
      // })

      param.el.style.left = pos[0] + 'px'
      param.el.style.top = pos[1] + 'px'
      this.jsPlumbIns.revalidate(param.el) // 重绘

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

      const offsetPosition = this.nodeViewOffsetPosition
      // 组装导航线
      let lines = []
      if (t < pos[1]) {
        let top = t + offsetPosition[1] + 'px',
          height = pos[1] - t + 'px'
        lines.push(
          {
            top,
            left: pos[0] + offsetPosition[0] + 'px',
            height
          },
          {
            top,
            left: pos[0] + nw + offsetPosition[0] + 'px',
            height
          }
        )
      }
      if (b > pos[1] + nh) {
        let top = pos[1] + nh + offsetPosition[1] + 'px',
          height = b - pos[1] - nh + 'px'
        lines.push(
          {
            top,
            left: pos[0] + offsetPosition[0] + 'px',
            height
          },
          {
            top,
            left: pos[0] + nw + offsetPosition[0] + 'px',
            height
          }
        )
      }

      if (l < pos[0]) {
        let left = l + offsetPosition[0] + 'px',
          width = pos[0] - l + 'px'
        lines.push(
          {
            top: pos[1] + offsetPosition[1] + 'px',
            left,
            width
          },
          {
            top: pos[1] + nh + offsetPosition[1] + 'px',
            left,
            width
          }
        )
      }

      if (r > pos[0] + nw) {
        let left = pos[0] + nw + offsetPosition[0] + 'px',
          width = r - pos[0] - nw + 'px'
        lines.push(
          {
            top: pos[1] + offsetPosition[1] + 'px',
            left,
            width
          },
          {
            top: pos[1] + nh + offsetPosition[1] + 'px',
            left,
            width
          }
        )
      }
      this.navLines = lines
    },

    onNodeDragStop(isNotMove, oldProperties, newProperties) {
      this.ifNodeDragStart = false
      this.navLines = []

      this.$refs.paperScroller.autoResizePaper()

      !isNotMove && this.command.exec(new MoveNodeCommand(oldProperties, newProperties))
    },

    nodeSelectedById(id, setActive, deselectAllOthers) {
      if (deselectAllOthers) {
        this.deselectAllNodes()
      }

      const node = this.nodeById(id)

      node && this.nodeSelected(node)

      setActive && this.setActiveNode(node.id)
    },

    nodeSelected(node) {
      this.addSelectedNode(node)
      const nodeElement = `node-${node.id}`
      this.jsPlumbIns.addToDragSelection(nodeElement)
    },

    nodeDeselected(node) {
      this.removeNodeFromSelection(node)
      const nodeElement = NODE_PREFIX + node.id
      this.jsPlumbIns.removeFromDragSelection(nodeElement)
    },

    nodeDeselectedById(id) {
      const node = this.nodeById(id)
      if (node) {
        this.nodeDeselected(node)
      }
    },

    /**
     * 取消选择所有节点
     */
    deselectAllNodes() {
      // console.log('deselectAllNodes') // eslint-disable-line
      this.jsPlumbIns.clearDragSelection()
      this.resetSelectedNodes()
      this.deselectConnection()
      // this.setActiveNode(null)
    },

    /**
     * 取消选中连线
     */
    deselectConnection() {
      const activeConnection = this.$store.getters['dataflow/activeConnection']
      if (!activeConnection) return

      const { NODE_PREFIX, jsPlumbIns } = this
      const conn = jsPlumbIns.select({
        target: NODE_PREFIX + activeConnection.targetId,
        source: NODE_PREFIX + activeConnection.sourceId
      })

      if (conn) {
        conn.removeClass('connection-selected')
        conn.hideOverlay('remove-connection')
      }

      this.setActiveConnection(null)
    },

    onHideSidebar() {
      const activeType = this.$store.getters['dataflow/activeType']
      if (activeType === 'connection') {
        this.deselectConnection(...arguments)
      }
      this.setActiveType(null)
    },

    getNodesInSelection(selectBoxAttr) {
      let $node = this.$refs.layoutContent.querySelector('.df-node')
      if (!$node) return []
      let nw = $node.offsetWidth
      let nh = $node.offsetHeight
      let { x, y, bottom, right } = selectBoxAttr

      // console.log('getNodesInSelection', selectBoxAttr) // eslint-disable-line
      /*const nodeViewOffset = this.nodeViewOffsetPosition
      x -= nodeViewOffset[0]
      right -= nodeViewOffset[0]
      y -= nodeViewOffset[1]
      bottom -= nodeViewOffset[1]*/
      return this.nodes.filter(node => {
        const [left, top] = node.attrs.position
        return left + nw > x && left < right && bottom > top && y < top + nh
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

    async save() {
      // this.validateNodes()
      const errorMsg = this.getError()
      if (errorMsg) {
        this.$message.error(errorMsg)
        return
      }

      if (!this.dataflow.id) {
        return this.saveAsNewDataflow()
      }

      this.isSaving = true

      const data = this.getDataflowDataToSave()

      try {
        const result = await taskApi.save(data)
        this.$message.success(this.$t('message.saveOK'))
        this.setEditVersion(result.editVersion)
      } catch (e) {
        this.handleError(e)
      }
      // await taskApi.patch(data)

      this.isSaving = false
    },

    async saveAsNewDataflow() {
      try {
        this.isSaving = true
        const data = this.getDataflowDataToSave()
        const dataflow = await taskApi.post(data)
        this.isSaving = false
        this.dataflow.id = dataflow.id
        this.setTaskId(dataflow.id)
        this.setEditVersion(dataflow.editVersion)
        // this.$message.success(this.$t('message.saveOK'))
        await this.$router.replace({
          name: 'DataflowEditor',
          params: { id: dataflow.id, action: 'dataflowSave' }
        })
      } catch (e) {
        this.$showError(e, '任务保存出错', '出现的问题:')
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
    },

    handleDeleteById(id) {
      const node = this.nodeById(id)
      this.command.exec(new RemoveNodeCommand(node))
      this.nodeDeselected(node)
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
      const nodes = this.nodes
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
      return this.jsPlumbIns.getConnections('*').some(c => `${c.sourceId}` === s && `${c.targetId}` === t)
    },

    // 循环检查target是否是source的上级
    isParent(sourceId, targetId) {
      if (sourceId === targetId) return true
      let sourceNode = this.nodeById(sourceId)
      let flag = false
      if (!sourceNode.inputLanes) return flag
      for (let id of sourceNode.inputLanes) {
        flag = id === targetId
        if (flag || this.isParent(id, targetId)) return true
      }
      return flag
    },

    resetWorkspace() {
      if (this.jsPlumbIns) {
        this.jsPlumbIns.deleteEveryEndpoint()
      }
      this.dataflow = merge(
        {
          id: '',
          name: ''
        },
        DEFAULT_SETTINGS
      )
      this.deselectAllNodes()
      this.reset()
      this.setActiveType(null)
      this.resetSelectedNodes()
    },

    getError() {
      if (!this.dataflow.name) return this.$t('editor.cell.validate.empty_name')

      if (this.nodes.length < 2) {
        return this.$t('editor.cell.validate.none_data_node')
      }

      if (this.jsPlumbIns.getConnections('*').length < 1) return this.$t('editor.cell.validate.none_link_node')

      return null
    },

    async validateNodes() {
      const { nodes } = this
      const result = await Promise.all(nodes.map(node => validateBySchema(node.__Ctor.formSchema, node))).catch(
        error => {
          // eslint-disable-next-line no-console
          console.log('validateNodes', error)
        }
      )
      // eslint-disable-next-line no-console
      console.log('validateNodes-result', result)
    },

    setZoomLevel(zoomLevel) {
      this.nodeViewScale = zoomLevel // important for background
      const element = this.jsPlumbIns.getContainer()

      // https://docs.jsplumbtoolkit.com/community/current/articles/zooming.html
      const prependProperties = ['webkit', 'moz', 'ms', 'o']
      const scaleString = 'scale(' + zoomLevel + ')'

      for (let i = 0; i < prependProperties.length; i++) {
        // @ts-ignore
        element.style[prependProperties[i] + 'Transform'] = scaleString
      }
      element.style['transform'] = scaleString

      this.jsPlumbIns.setZoom(zoomLevel)
    },

    /**
     * 从侧边栏拖拽节点时，判断是否能放置到连线，并且高亮可以放置的线
     * @param item
     * @param position
     */
    handleDragMoveNode(item, position) {
      this.jsPlumbIns.select().removeClass('connection-highlight')
      const $elemBelow = document.elementFromPoint(...position)
      if ($elemBelow.nodeName === 'path' && $elemBelow.parentElement._jsPlumb) {
        $elemBelow.parentElement.classList.add('connection-highlight')
      }
    },

    /**
     * 通过拖拽添加节点
     * 🎉 支持拖到连线上快速添加
     * @param item
     * @param position
     * @param size
     */
    handleAddNodeByDrag(item, position, size) {
      const paper = this.$refs.paperScroller
      const newPosition = paper.getDropPositionWithinPaper(position, size)
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
    },

    handleAddNodeToPos(position, item) {
      const node = this.createNode(position, item)
      this.command.exec(new AddNodeCommand(node))
      return node
    },

    createNode(position, item) {
      const getCtor = this.$store.getters['dataflow/getCtor']
      const Ctor = getCtor(item.constructor)
      const ins = new Ctor(item)
      const node = {
        id: uuid(),
        name: item.name,
        type: item.type,
        attrs: { position },
        ...ins.getExtraAttr() // 附加属性
      }

      // 设置属性__Ctor不可枚举
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

    quickAddNode(source, nodeType) {
      const spaceX = 120
      const spaceY = 120
      const newPosition = [
        source.position[0] + NODE_WIDTH + spaceX,
        !source.outputLanes?.length ? source.position[1] : source.position[1] + spaceY
      ]
      const movePosition = !source.outputLanes?.length > 0 ? [spaceX, 0] : [0, spaceY]
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
      nodeMenu.show = false
      // console.log('nodeMenu.connectionCenterPos', nodeMenu.connectionCenterPos) // eslint-disable-line
      const position = this.$refs.paperScroller.getDropPositionWithinPaper(nodeMenu.connectionCenterPos, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      })
      this.addNodeOnConn(nodeType, position, nodeMenu.connection.source, nodeMenu.connection.target)
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
        for (i = 0; i < this.nodes.length; i++) {
          node = this.nodes[i]
          if (!this.canUsePosition(node.position, newPosition)) {
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

    handleError(error) {
      if (error?.data?.message) {
        this.$message.error(error.data.message)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
        this.$message.error('出错了')
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

    handleEditFlush(data) {
      // eslint-disable-next-line no-console
      console.log('handleEditFlush', data)
      const { opType } = data
      if (opType === 'transformRate') {
        // 推演进度
        this.setTransformStatus(data.transformStatus)
      } else if (opType === 'updateVersion') {
        // 版本变化
      }
    },

    handlePageReturn() {
      this.$router.push(this.listRoute)
    },

    initWS() {
      this.$ws.on('editFlush', this.handleEditFlush)
      this.$ws.send({
        type: 'editFlush',
        opType: 'subscribe',
        taskId: this.dataflow.id
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarW: 230px;
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
        stroke: #fa6303;
      }
      path:nth-child(3) {
        fill: #fa6303;
        stroke: #fa6303;
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
