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
      @save="save"
      @start="start"
      @delete="handleDelete"
      @undo="handleUndo"
      @redo="handleRedo"
      @zoom-out="handleZoomOut"
      @zoom-in="handleZoomIn"
      @showSettings="handleShowSettings"
      @center-content="handleCenterContent"
      @auto-layout="handleAutoLayout"
    ></TopHeader>
    <section class="layout-wrap layout-has-sider">
      <!--左侧边栏-->
      <LeftSidebar @move-node="handleDragMoveNode" @drop-node="handleAddNodeByDrag" />
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
        <ConfigPanel @hide="onHideSidebar"></ConfigPanel>
      </section>
    </section>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import PaperScroller from './components/PaperScroller'
import TopHeader from './components/TopHeader'
import LeftSidebar from './components/LeftSidebar'
import DFNode from './components/DFNode'
import jsPlumbIns from './instance'
import { connectorActiveStyle } from './style'
import { NODE_PREFIX, DEFAULT_SETTINGS, NODE_WIDTH, NODE_HEIGHT, STATUS_MAP } from './constants'
import { ctorTypes, nodeTypes } from 'web-core/nodes/loader/index'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { titleChange } from 'web-core/mixins/titleChange'
import { showMessage } from 'web-core/mixins/showMessage'
import ConfigPanel from 'web-core/views/dataflow/components/ConfigPanel'
import { off, on } from 'web-core/utils/dom'
import { uuid } from 'web-core/utils/util'
import DataFlows from 'web-core/api/DataFlows'
import DatabaseTypes from 'web-core/api/DatabaseTypes'
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

const dataFlowsApi = new DataFlows()
const databaseTypesApi = new DatabaseTypes()

export default {
  name: 'Editor',

  mixins: [deviceSupportHelpers, titleChange, showMessage],

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
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', {
      dataflowId: 'dataflowId',
      nodes: 'allNodes',
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
      'setDataflowId',
      'setDataflowName',
      'setDataflowSettings',
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
      'addNode',
      'setActiveType',
      'setFormSchema'
    ]),

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
      const mapping = this.$route.query?.mapping

      if (mapping !== this.mapping) {
        // mapping 改变 重新设置initNodeType
        this.mapping = mapping
        this.initNodeType()
      }

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

      const dataflowId = this.$route.params.id

      if (dataflowId) {
        await this.openDataflow(dataflowId)
      } else {
        this.newDataflow()
      }
    },

    initCommand() {
      this.command = new CommandManager(this.$store, this.jsPlumbIns)
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
      if (this.mapping === 'cluster-clone') {
        // dataFlowType = 'database-migration' // 数据库迁移
        const dbTypes = await this.loadDatabaseTypes(nodeTypes)
        _nodeTypes = _nodeTypes.filter(item => item.type === 'database')
        _nodeTypes.push(...dbTypes)
      }
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
        console.log('connectionEvent', info) // eslint-disable-line
        const { sourceId: source, targetId: target } = info
        const sourceId = this.getRealId(source)
        const targetId = this.getRealId(target)

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
                this.nodeMenu.connectionData = { source, target }
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
                    source: info.connection.sourceId,
                    target: info.connection.targetId
                  })
                )
              }
            }
          }
        ])

        // 设置节点的input和output属性
        this.addConnection({
          sourceId,
          targetId
        })

        event &&
          this.command.exec(
            new AddConnectionCommand({
              source: info.connection.sourceId,
              target: info.connection.targetId
            }),
            true
          )
      })

      // 连接线拖动结束事件
      /*jsPlumbIns.bind('connectionDragStop', (conn, event) => {
        console.log('connectionDragStopEvent', conn)
        let $node = this.$refs.layoutContent.querySelector('.df-node')
        if (!$node) return
        const pos = this.getMousePositionWithinNodeView(event)
        console.log({ ...pos }, [...this.nodeViewOffsetPosition])
        pos.x -= this.nodeViewOffsetPosition[0]
        pos.y -= this.nodeViewOffsetPosition[1]
        let sourceId = this.getRealId(conn.sourceId)
        let nw = $node.offsetWidth
        let nh = $node.offsetHeight
        let isConnected = false

        for (let n of this.nodes) {
          if (n.id !== sourceId) {
            const [x, y] = n.position
            console.log([x, y], pos)
            if (pos.x > x && pos.x < x + nw && pos.y > y && pos.y < y + nh) {
              console.log('in Node')
              if (!this.isConnected(sourceId, n.id) && !this.isParent(sourceId, n.id)) {
                jsPlumbIns.connect({
                  source: jsPlumbIns.getEndpoint(conn.sourceId + '_source'),
                  target: jsPlumbIns.getEndpoint(NODE_PREFIX + n.id + '_target')
                })
                isConnected = true
              }
              break
            }
          }
        }

        if (!isConnected && conn.targetId) {
          // 恢复连接
          jsPlumbIns.connect({
            source: jsPlumbIns.getEndpoint(conn.sourceId + '_source'),
            target: jsPlumbIns.getEndpoint(conn.targetId + '_target')
          })
          console.log('没有连接')
        }
      })*/

      // 连线移动到其他节点
      jsPlumbIns.bind('connectionMoved', info => {
        console.log('connectionMoved', info) // eslint-disable-line
      })
      // 连线移动到其他节点
      jsPlumbIns.bind('connectionDetached', info => {
        console.log('connectionDetachedEvent', info) // eslint-disable-line
      })

      const _instance = {
        getConnections(params) {
          console.log('_instance', params) // eslint-disable-line
          if (typeof params === 'object') {
            if (params.target) params.target = NODE_PREFIX + params.target
            if (params.source) params.source = NODE_PREFIX + params.source
          }
          return jsPlumbIns.getConnections(params)
        }
      }

      jsPlumbIns.bind('beforeDrop', info => {
        console.log('beforeDrop', info) // eslint-disable-line
        const { sourceId, targetId } = info

        const source = this.nodeById(this.getRealId(sourceId))
        const target = this.nodeById(this.getRealId(targetId))

        // target.__Ctor.allowSource(source)

        if (!this.nodeELIsConnected(sourceId, targetId) && !this.isParent(source.id, target.id)) {
          return target.__Ctor.allowSource(source) && source.__Ctor.allowTarget(target, source, _instance)
        }

        return false

        // return this.isParent(
        //   this.getRealId(e.sourceId),
        //   this.getRealId(e.targetId)
        // )
      })

      /*this.conSelections = []

      jsPlumbIns.bind('click', function (conn, evt) {
        console.log('click', conn, evt)
      })

      // 连接线开始拖动事件
      jsPlumbIns.bind('connectionDrag', function (e) {
        e.setHover(true)
        _.dragPoint = e.endpoints[1].getElement()
        _.allNodeDom = container.querySelectorAll('.flow-node')
      })

      // 连接线拖动结束事件
      jsPlumbIns.bind('connectionDragStop', function (e) {
        if (_.dragOverNode) {
          let sourceNodeId = e.sourceId
          let targetNodeId = _.dragOverNode.getAttribute('id')
          let sourceId = sourceNodeId + '_source'
          let targetId = targetNodeId + '_target'
          if (
            !_.isConnected(sourceId, targetId) &&
            !_.isParent(_.getRealId(sourceNodeId), _.getRealId(targetNodeId))
          ) {
            jsPlumbIns.connect({
              source: jsPlumbIns.getEndpoint(sourceId),
              target: jsPlumbIns.getEndpoint(targetId)
            })
          }
        }
        e.setHover(false)
        _.dragPoint = undefined
        _.allNodeDom = undefined
      })

      // 在target的Endpoint上面drop会触发该事件
      jsPlumbIns.bind('beforeDrop', e => {
        return this.isParent(
          this.getRealId(e.sourceId),
          this.getRealId(e.targetId)
        )
      })*/
    },

    async openDataflow(dataflowId) {
      this.resetWorkspace()

      let result
      try {
        result = await dataFlowsApi.get([dataflowId])
        // this.creatUserId = result.user_id
      } catch (e) {
        this.$showError(e, '数据流加载出错', '加载数据流出现的问题:')
        return
      }

      const data = result

      this.status = data.status
      this.setDataflowId(dataflowId)
      this.setDataflowName({ newName: data.name, setStateDirty: false })
      this.setDataflowSettings(data.setting)

      const isOld = this.transformStages(data.stages)
      await this.addNodes(data.stages)

      // 旧版数据自动布局
      isOld ? this.handleAutoLayout() : this.handleCenterContent()
      this.setStateDirty(false)
    },

    newDataflow() {
      // this.creatUserId = this.$cookie.get('user_id')
      this.creatUserId = ''
      this.resetWorkspace()
      this.setDataflowName({
        newName: '新任务@' + new Date().toLocaleTimeString()
      })
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

    async addNodes(nodes) {
      if (!nodes || !nodes.length) return
      const { getters } = this.$store
      const getNodeType = getters['dataflow/nodeType']
      const getCtor = getters['dataflow/getCtor']

      let nodeType
      nodes.forEach(node => {
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

      this.nodes.forEach(node => {
        let t = NODE_PREFIX + node.id + '_target',
          tp = this.jsPlumbIns.getEndpoint(t)
        if (node.inputLanes && node.inputLanes.length) {
          node.inputLanes.forEach(nid => {
            let s = NODE_PREFIX + nid + '_source',
              sp = this.jsPlumbIns.getEndpoint(s)
            this.jsPlumbIns.connect({ source: sp, target: tp })
          })
        }
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
          let [x, y] = item.position
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

      !isNotMove && this.command.exec(new MoveNodeCommand(oldProperties, newProperties), true)
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
      console.log('deselectAllNodes') // eslint-disable-line
      this.jsPlumbIns.clearDragSelection()
      this.resetSelectedNodes()
      this.setActiveNode(null)
      this.deselectConnection()
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

      console.log('getNodesInSelection', selectBoxAttr) // eslint-disable-line
      /*const nodeViewOffset = this.nodeViewOffsetPosition
      x -= nodeViewOffset[0]
      right -= nodeViewOffset[0]
      y -= nodeViewOffset[1]
      bottom -= nodeViewOffset[1]*/
      return this.nodes.filter(({ position }) => {
        console.log('position', position, { x, y, bottom, right }) // eslint-disable-line
        return position[0] + nw > x && position[0] < right && bottom > position[1] && y < position[1] + nh
      })
    },

    mouseDown(e) {
      on(window, 'mouseup', this.mouseUp)

      this.mouseDownMouseSelect(e)
    },

    mouseDownMouseSelect(e) {
      if (this.isCtrlKeyPressed(e) === true) {
        // 忽略按下ctrl||command键，此键已用来触发画布拖动
        return
      }

      if (this.isActionActive('dragActive')) {
        // 节点正在拖动
        return
      }

      this.mouseClickPosition = this.getMousePositionWithinNodeView(e)
      this.selectActive = true

      // this.showSelectBox(e)

      on(this.$refs.layoutContent, 'mousemove', this.mouseMoveSelect)
    },

    mouseMoveSelect(e) {
      e.preventDefault() // 防止拖动时文字被选中

      if (e.buttons === 0) {
        // 没有按键或者是没有初始化
        this.mouseUpMouseSelect(e)
        return
      }

      this.showSelectBox = true
      let w, h, x, y
      const pos = this.getMousePositionWithinNodeView(e)

      console.log('mouseMoveSelect', pos) // eslint-disable-line

      x = Math.min(this.mouseClickPosition.x, pos.x)
      y = Math.min(this.mouseClickPosition.y, pos.y)
      w = Math.abs(this.mouseClickPosition.x - pos.x)
      h = Math.abs(this.mouseClickPosition.y - pos.y)

      this.selectBoxAttr = { x, y, w, h, right: x + w, bottom: y + h }
    },

    mouseUp() {
      off(window, 'mouseup', this.mouseUp)

      if (!this.selectActive) {
        return
      }

      this.mouseUpMouseSelect()
    },

    mouseUpMouseSelect() {
      off(this.$refs.layoutContent, 'mousemove', this.mouseMoveSelect)
      console.log('mouseUpMouseSelect') // eslint-disable-line
      this.deselectAllNodes()
      // 清空激活状态
      this.setActiveType(null)

      if (this.showSelectBox) {
        const selectedNodes = this.getNodesInSelection()
        selectedNodes.forEach(node => this.nodeSelected(node))
      }

      this.hideSelectBox()
    },

    hideSelectBox() {
      this.selectActive = false
      this.showSelectBox = false
      this.selectBoxAttr = null
    },

    getMousePositionWithinNodeView(e) {
      const nodeViewScale = this.nodeViewScale
      // const nodeViewOffset = this.nodeViewOffsetPosition
      // const [x, y] = this.nodeViewOffsetPosition
      let { x, y } = this.$refs.layoutContent.getBoundingClientRect()
      return {
        x: (e.pageX - x) / nodeViewScale,
        y: (e.pageY - y) / nodeViewScale
      }
    },

    __removeConnection(source, target) {
      console.log('removeConnection', source, target) // eslint-disable-line
      const connections = this.jsPlumbIns.getConnections({
        source,
        target
      })

      connections.forEach(connectionInstance => {
        this.jsPlumbIns.deleteConnection(connectionInstance)
      })

      this.removeConnection({
        sourceId: this.getRealId(source),
        targetId: this.getRealId(target)
      })
    },

    getDataflowDataToSave() {
      const { getters } = this.$store
      const name = getters['dataflow/dataflowName']
      const settings = getters['dataflow/dataflowSettings']
      const data = {
        name,
        description: '',
        status: 'draft',
        executeMode: 'normal',
        category: '\u6570\u636e\u5e93\u514b\u9686',
        mappingTemplate: this.mapping,
        stages: this.nodes,
        setting: settings
      }

      const dataflowId = this.$store.getters['dataflow/dataflowId']

      if (dataflowId) {
        data.id = dataflowId
      }

      return data
    },

    async save() {
      const errorMsg = this.getError()
      if (errorMsg) {
        this.$message.error(errorMsg)
        return
      }

      const currentDataflow = this.$route.params.id
      if (!currentDataflow) {
        return this.saveAsNewDataflow()
      }

      this.isSaving = true

      const data = this.getDataflowDataToSave()

      await dataFlowsApi.draft(data)

      this.isSaving = false
      this.$message.success(this.$t('message.saveOK'))
    },

    async saveAsNewDataflow() {
      try {
        this.isSaving = true
        const data = this.getDataflowDataToSave()
        const dataflow = await dataFlowsApi.draft(data)
        this.isSaving = false
        this.$message.success(this.$t('message.saveOK'))
        this.setDataflowId(dataflow.id) // 将生成的id保存到store

        await this.$router.push({
          name: 'DataflowEditor',
          params: { id: dataflow.id, action: 'dataflowSave' },
          query: {
            mapping: this.mapping
          }
        })
      } catch (e) {
        this.$showError(e, '数据流保存出错', '出现的问题:')
      }
    },

    async start() {
      // TODO 优化错误处理
      const errorMsg = this.getError()
      if (errorMsg) {
        this.$message.error(errorMsg)
        return
      }

      const { dataflowId } = this
      const data = this.getDataflowDataToSave()
      data.status = 'scheduled'
      data.executeMode = 'normal'

      this.isStarting = true

      const fetch = dataflowId ? dataFlowsApi.patch(data) : dataFlowsApi.post(data)

      const result = await fetch

      const dataflow = result.data

      await dataFlowsApi.saveStage(data.stages)

      this.isStarting = false

      await this.$router.push({
        name: 'DataflowMonitor',
        params: {
          id: dataflow.id
        },
        query: {
          mapping: this.mapping
        }
      })
    },

    doSaveStartDataFlow(data) {
      if (data) {
        if (this.form.taskName) {
          data.name = this.form.taskName
        }

        let start = () => {
          data.status = 'scheduled'
          data.executeMode = 'normal'
          this.doSave(data, (err, rest) => {
            if (err) {
              if (err.response.msg === 'Error: Loading data source schema') {
                this.$message.error(this.$t('message.loadingSchema'))
              } else {
                this.$message.error(err.response.msg)
              }
            } else {
              this.$message.success(this.$t('message.taskStart'))
              this.$router.push({
                path: '/job',
                query: {
                  id: rest.id,
                  isMoniting: true,
                  mapping: this.mappingTemplate
                }
              })
              this.$message.success(this.$t('message.taskStart'))
              location.reload()
            }
          })
        }
        // if (data.id && this.dataFlow.stages.find(s => s.type === 'aggregation_processor')) {
        // 	const h = this.$createElement;
        // 	let arr = this.$t('message.startAggregation_message').split('XXX');
        // 	this.$confirm(
        // 		h('p', [arr[0] + '(', h('span', { style: { color: '#48b6e2' } }, data.name), ')' + arr[1]]),
        // 		this.$t('dataFlow.importantReminder'),
        // 		{
        // 			type: 'warning',
        // 			closeOnClickModal: false
        // 		}
        // 	).then(() => {
        // 		//若任务内存在聚合处理器，启动前先重置
        // 		dataFlowsApi.reset(data.id).then(() => {
        // 			start();
        // 		});
        // 	});
        // } else {
        start()
        // }
      }
      this.dialogFormVisible = false
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
        nodePositionMap[NODE_PREFIX + n.id] = n.position
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
              position: nodePositionMap[n]
            }
          })
          newProperties.push({
            id: this.getRealId(n),
            properties: {
              position: [left, top]
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

      this.status = 'draft'
      this.deselectAllNodes()
      this.removeAllNodes()
      this.setDataflowId(null)
      this.setDataflowName({ newName: '', setStateDirty: false })
      this.setDataflowSettings(DEFAULT_SETTINGS)
      this.resetSelectedNodes()
    },

    getError() {
      const settings = this.$store.getters['dataflow/dataflowSettings']

      if (!this.$store.getters['dataflow/dataflowName']) return this.$t('editor.cell.validate.empty_name')

      if (settings.sync_type === 'initial_sync' && settings.isSchedule && !settings.cronExpression) {
        return this.$t('dataFlow.cronExpression')
      }

      for (let node of this.nodes) {
        let res = node.__Ctor.validate(node)
        if (res !== true) return res
      }

      if (this.nodes.length < 2) {
        return this.$t('editor.cell.validate.none_data_node')
      }

      if (this.jsPlumbIns.getConnections('*').length < 1) return this.$t('editor.cell.validate.none_link_node')

      return null
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
        this.addNodeOnConn(item, newPosition, connection.sourceId, connection.targetId)
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
        position,
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
      console.log('handleMouseSelect', arguments) // eslint-disable-line
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
      const a = this.nodeById(this.getRealId(source))
      const b = this.createNode(position, nodeType)
      const c = this.nodeById(this.getRealId(target))
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
      console.log('nodeMenu.connectionCenterPos', nodeMenu.connectionCenterPos) // eslint-disable-line
      const position = this.$refs.paperScroller.getDropPositionWithinPaper(nodeMenu.connectionCenterPos, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      })
      this.addNodeOnConn(nodeType, position, nodeMenu.connectionData.source, nodeMenu.connectionData.target)
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
