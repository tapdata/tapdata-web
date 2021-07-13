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
      @save="save"
      @delete="handleDelete"
    ></TopHeader>

    <section class="layout-wrap layout-has-sider">
      <!--左侧边栏-->
      <LeftSidebar></LeftSidebar>
      <!--内容体-->
      <main
        id="dfEditorContent"
        ref="layoutContent"
        class="layout-content flex-grow-1"
        @mousedown="mouseDown"
        @wheel="wheelScroll"
      >
        <div
          id="node-view-background"
          class="node-view-background"
          :style="backgroundStyle"
        ></div>

        <div id="node-view" class="node-view" :style="dataflowStyle">
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
          ></DFNode>
        </div>

        <div
          v-show="showSelectBox"
          class="select-box"
          :style="selectBoxStyle"
        ></div>
        <div
          class="nav-line"
          v-for="(l, i) in navLines"
          :key="`l-${i}`"
          :style="l"
        ></div>
      </main>
      <!--右侧边栏-->
      <RightSidebar @deselectConnection="deselectConnection"></RightSidebar>
    </section>
  </section>
</template>

<script>
import jsPlumbIns from './instance'
import { mapGetters } from 'vuex'
import { ctorTypes, nodeTypes } from '@/nodes/loader/index'
import { statusBtMap } from '@/editor/states'
import factory from '@/api/factory'
import LeftSidebar from '@/views/dataflow/components/LeftSidebar'
import { mapMutations } from 'vuex'
import DFNode from '@/views/dataflow/components/DFNode'
import RightSidebar from '@/views/dataflow/components/RightSidebar'
import { off, on } from '@/utils/dom'
import deviceSupportHelpers from '@/mixins/deviceSupportHelpers'
import { connectorActiveStyle } from '@/views/dataflow/style'
import { NODE_PREFIX } from '@/views/dataflow/constants'
import TopHeader from '@/views/dataflow/components/TopHeader'
import { titleChange } from '@/mixins/titleChange'
import { showMessage } from '@/mixins/showMessage'
import moveDataflow from './mixins/moveDataflow'

const dataFlowsApi = factory('DataFlows')
// const Setting = factory('Setting')

export default {
  name: 'Editor',

  mixins: [deviceSupportHelpers, titleChange, showMessage, moveDataflow],

  components: {
    TopHeader,
    DFNode,
    LeftSidebar,
    RightSidebar
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
      sync_type: 'initial_sync+cdc',
      statusBtMap,
      jsPlumbIns,
      nodeMap: {},
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false,
      nodeViewScale: 1
    }
  },

  computed: {
    ...mapGetters('dataflow', {
      nodes: 'allNodes',
      isActionActive: 'isActionActive',
      nodeById: 'nodeById',
      stateIsDirty: 'getStateIsDirty',
      nodeViewOffsetPosition: 'getNodeViewOffsetPosition'
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
    this.setNodeTypes(nodeTypes)
    this.setCtorTypes(ctorTypes)
  },

  mounted() {
    this.jsPlumbIns.ready(async () => {
      try {
        this.initNodeView()
        await this.initView()
      } catch (error) {
        console.error(error)
      }
    })
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
      'addNode'
    ]),

    async confirmMessage(
      message,
      headline,
      type,
      confirmButtonText,
      cancelButtonText
    ) {
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
        // In case the workflow got saved we do not have to run init
        // as only the route changed but all the needed data is already loaded
        this.setStateDirty(false)
        return Promise.resolve()
      }

      if (this.stateIsDirty) {
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

      let dataflowId
      if (this.$route.params.id) {
        dataflowId = this.$route.params.id
        await this.openDataflow(dataflowId)
      } else {
        this.newDataflow()
      }
    },

    initNodeView() {
      // let container = this.$refs.layoutContent
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer('#node-view')
      jsPlumbIns.registerConnectionType('active', connectorActiveStyle)

      jsPlumbIns.bind('connection', info => {
        console.log('connectionEvent', info)
        const { sourceId: source, targetId: target } = info
        const sourceId = this.getRealId(source)
        const targetId = this.getRealId(target)

        info.connection.bind('click', conn => {
          console.log('connectionClickEvent', conn)
          // 设置按钮可见
          info.connection.showOverlay('remove-connection')
          // 高亮连接
          info.connection.addClass('connection-selected')

          this.setActiveConnection({
            sourceId,
            targetId
          })
        })

        // 添加删除按钮，并且绑定事件，默认不可见
        info.connection.addOverlay([
          'Label',
          {
            id: 'remove-connection',
            location: 0.25,
            label:
              '<div class="remove-connection-btn" title="删除连接"></span>',
            cssClass: 'remove-connection-label cursor-pointer',
            visible: false,
            events: {
              mousedown: () => {
                this.removeConnection(source, target)
              }
            }
          }
        ])

        console.log('连接状态', this.isConnected(sourceId, targetId))

        // this.setDependsOn(info.sourceId, info.targetId)
        // this.checkConnect()
        // this.checkOutputStep()
        this.addConnection({
          sourceId,
          targetId
        })
      })

      // 连接线拖动结束事件
      jsPlumbIns.bind('connectionDragStop', (conn, event) => {
        console.log('connectionDragStopEvent', conn)
        let $node = this.$refs.layoutContent.querySelector('.df-node')
        if (!$node) return
        const pos = this.getMousePositionWithinNodeView(event)
        let sourceId = this.getRealId(conn.sourceId)
        let nw = $node.offsetWidth
        let nh = $node.offsetHeight
        let isConnected = false

        for (let n of this.nodes) {
          if (n.id !== sourceId) {
            const [x, y] = n.position
            if (pos.x > x && pos.x < x + nw && pos.y > y && pos.y < y + nh) {
              console.log('in Node')
              if (
                !this.isConnected(sourceId, n.id) &&
                !this.isParent(sourceId, n.id)
              ) {
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
      })

      // 连线移动到其他节点
      jsPlumbIns.bind('connectionMoved', info => {
        console.log('connectionMoved', info)
      })
      // 连线移动到其他节点
      jsPlumbIns.bind('connectionDetached', info => {
        console.log('connectionDetachedEvent', info)
      })

      // 在target的Endpoint上面drop会触发该事件
      jsPlumbIns.bind('beforeDrop', e => {
        console.log('beforeDrop')
        return true
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
      } catch (e) {
        this.$showError(e, '数据流加载出错', '加载数据流出现的问题:')
        return
      }

      const { data } = result

      this.setDataflowId(dataflowId)
      this.setDataflowName({ newName: data.name, setStateDirty: false })
      this.setDataflowSettings(data.settings)
      this.addNodes(data.stages)

      this.setStateDirty(false)
    },

    newDataflow() {
      this.resetWorkspace()
      this.setDataflowName({
        newName: 'dataflow@' + new Date().toLocaleTimeString()
      })
    },

    async addNodes(nodes) {
      if (!nodes || !nodes.length) return
      const { getters } = this.$store
      // const allNodes = getters['dataflow/allNodeTypes']
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

      this.updateNodeProperties({
        id,
        properties: {
          position: [...pos]
        }
      })

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
      // 组装导航线
      let lines = []
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
      this.navLines = lines
    },

    onNodeDragStop() {
      this.ifNodeDragStart = false
      this.navLines = []
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

    nodeDeselectedById() {},

    /**
     * 取消选择所有节点
     */
    deselectAllNodes() {
      console.log('deselectAllNodes')
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

    getNodesInSelection() {
      let $node = this.$refs.layoutContent.querySelector('.df-node')
      if (!$node) return []
      let nw = $node.offsetWidth
      let nh = $node.offsetHeight
      let { x, y, bottom, right } = this.selectBoxAttr
      return this.nodes.filter(
        ({ position }) =>
          position[0] + nw > x &&
          position[0] < right &&
          bottom > position[1] &&
          y < position[1] + nh
      )
    },

    mouseDown(e) {
      console.log('mouseDown', e.button)
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
      this.showSelectBox = true
      let w, h, x, y
      const pos = this.getMousePositionWithinNodeView(e)

      console.log('mouseMoveSelect', pos)

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
      console.log('mouseUpMouseSelect')
      this.deselectAllNodes()

      if (this.showSelectBox) {
        const selectedNodes = this.getNodesInSelection()
        selectedNodes.forEach(node => this.nodeSelected(node))
      }

      this.hideSelectBox()
    },

    wheelScroll(e) {
      //* Control + scroll zoom
      if (e.ctrlKey) {
        if (e.deltaY > 0) {
          this.zoomOut()
        } else {
          this.zoomIn()
        }

        e.preventDefault()
        return
      }
      this.wheelMoveDataflow(e)
    },

    hideSelectBox() {
      this.selectActive = false
      this.showSelectBox = false
      this.selectBoxAttr = null
    },

    getMousePositionWithinNodeView(e) {
      let { x, y } = this.$refs.layoutContent.getBoundingClientRect()
      return { x: e.pageX - x, y: e.pageY - y }
    },

    removeConnection(source, target) {
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
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        emailWaring: {
          edited: true,
          started: false,
          error: true,
          paused: false
        },
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
        const { data: dataflow } = await dataFlowsApi.draft(data)
        this.isSaving = false
        this.$message.success(this.$t('message.saveOK'))
        this.$router.push({
          name: 'DataflowEdit',
          params: { id: dataflow.id, action: 'dataflowSave' }
        })
      } catch (e) {
        this.$showError(e, '数据流保存出错', '出现的问题:')
      }
    },

    handleDelete() {
      const selectNodes = this.$store.getters['dataflow/getSelectedNodes']

      selectNodes.forEach(node => {
        const nodeElID = NODE_PREFIX + node.id
        this.jsPlumbIns.remove(nodeElID)
        this.removeNode(node)
      })

      this.resetSelectedNodes()
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
      return this.jsPlumbIns
        .getConnections('*')
        .some(c => `${c.sourceId}` === s && `${c.targetId}` === t)
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
      // Reset nodes
      if (this.jsPlumbIns) {
        // On first load it does not exist
        this.jsPlumbIns.deleteEveryEndpoint()
      }

      this.removeAllNodes()
      this.setActiveNode(null)
      this.setDataflowId(null)
      this.setDataflowName({ newName: '', setStateDirty: false })
      this.setDataflowSettings({})
      this.resetSelectedNodes()
    }
  }
}
</script>

<style lang="scss" scoped>
$sidebarW: 236px;
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
  min-height: 0;

  &.layout-has-sider {
    flex-direction: row;
  }
}

.layout-content {
  position: relative;
  background-color: #f9f9f9;

  ::v-deep {
    .connection-selected {
      path:nth-child(2) {
        stroke: var(--primary);
      }
      path:nth-child(3) {
        fill: var(--primary);
        stroke: var(--primary);
      }
    }

    .remove-connection-label {
      position: relative;
      padding: 4px;
      border-radius: 100%;
      background-color: red;
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
  background: rgba(215, 215, 215, 0.2);
  border: 1px solid #b2b2b3;
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
