<template>
  <section class="dataflow-editor flex flex-column vh-100">
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

    <section class="flex flex-grow-1">
      <!--左侧边栏-->
      <LeftSidebar></LeftSidebar>
      <!--内容体-->
      <main
        id="dfEditorContent"
        ref="layoutContent"
        class="layout-content flex-grow-1"
        @mousedown="mouseDown"
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
        ></DFNode>

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
import { nodeTypes } from '@/nodes/loader/index'
import { statusBtMap } from '@/editor/states'
import factory from '@/api/factory'
import LeftSidebar from '@/views/data-flow/components/LeftSidebar'
import { mapMutations } from 'vuex'
import DFNode from '@/views/data-flow/components/DFNode'
import RightSidebar from '@/views/data-flow/components/RightSidebar'
import { off, on } from '@/utils/dom'
import deviceSupportHelpers from '@/mixins/deviceSupportHelpers'
import { connectorActiveStyle } from '@/views/data-flow/style'
import { NODE_PREFIX } from '@/views/data-flow/constants'
import TopHeader from '@/views/data-flow/components/TopHeader'

const dataFlowsApi = factory('DataFlows')
// const Setting = factory('Setting')

export default {
  name: 'Editor',

  mixins: [deviceSupportHelpers],

  components: {
    TopHeader,
    DFNode,
    LeftSidebar,
    RightSidebar
  },

  data() {
    return {
      NODE_PREFIX,
      downLoadNum: 0,
      reloadSchemaDialog: false,
      dialogFormVisible: false,
      form: {
        taskName: '',
        type:
          this.$t('dataFlow.button.quantitative') +
          '+' +
          this.$t('dataFlow.button.increment')
      },

      dataFlowId: null,
      tempDialogVisible: false,
      tempKey: 0,
      tempId: false,
      tempData: [],
      status: 'draft',
      executeMode: 'normal',
      isPreview: false, //只有这一个场景需要切换编辑状态

      loading: true,
      cells: [],
      state1: '',
      editable: false,
      isMoniting: false,
      isSimple: false,
      newDataFlowV: false,
      isSaving: false,
      sync_type: 'initial_sync+cdc',
      settingList: [
        {
          type: 'initial_sync+cdc',
          name: this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
        },
        { type: 'initial_sync', name: this.$t('dataFlow.initial_sync') },
        { type: 'cdc', name: this.$t('dataFlow.cdc') }
      ],
      flowDataName: '',
      mappingTemplate: '',
      creatUserId: '',
      dataChangeFalg: false,
      statusBtMap,

      jsPlumbIns,
      nodeMap: {},
      navLines: [],
      selectBoxAttr: null,
      selectActive: false,
      showSelectBox: false
    }
  },

  computed: {
    ...mapGetters('dataflow', {
      nodes: 'allNodes',
      isActionActive: 'isActionActive',
      nodeById: 'nodeById'
    }),

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

  created() {
    this.setNodeTypes(nodeTypes)
  },

  mounted() {
    this.jsPlumbIns.ready(async () => {
      try {
        this.initNodeView()
        this.$api('nodeConfigs')
          .get()
          .then(({ data }) => {
            console.log('nodeConfigs', data)
          })
      } catch (error) {
        console.error(error)
      }
    })
  },

  methods: {
    ...mapMutations('dataflow', [
      'setNodeTypes',
      'updateNodeProperties',
      'setActiveNode',
      'setActiveConnection',
      'resetSelectedNodes',
      'addSelectedNode',
      'addConnection',
      'removeConnection',
      'removeNode',
      'removeNodeFromSelection'
    ]),

    getRealId(str) {
      return str.replace(new RegExp(`^${NODE_PREFIX}`), '')
    },

    initNodeView() {
      let container = this.$refs.layoutContent
      const { jsPlumbIns } = this
      jsPlumbIns.setContainer(container)
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
      // jsPlumbIns.bind('beforeDrop', e => {
      //   console.log('beforeDrop')
      //   // return this.isParent(
      //   //   this.getRealId(e.sourceId),
      //   //   this.getRealId(e.targetId)
      //   // )
      // })

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

      this.deselectAllNodes()

      if (this.showSelectBox) {
        const selectedNodes = this.getNodesInSelection()
        selectedNodes.forEach(node => this.nodeSelected(node))
      }

      this.hideSelectBox()
    },

    // showSelectBox(e) {
    //   this.mouseClickPosition = this.getMousePositionWithinNodeView(e)
    //   this.selectActive = true
    // },

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

    async save() {
      this.isSaving = true

      let params = {
        name: 'demo ' + new Date().toLocaleTimeString(),
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
        setting: {
          isSerialMode: false,
          sync_type: 'initial_sync',
          readBatchSize: 1000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          maxTransactionLength: 12,
          description: '',
          cdcFetchSize: 1,
          distinctWriteType: 'intellect',
          drop_target: false,
          run_custom_sql: false,
          needToCreateIndex: true,
          increment: false,
          isSchedule: false,
          cronExpression: '',
          isOpenAutoDDL: false,
          emailWaring: {
            edited: false,
            started: false,
            error: false,
            paused: false
          },
          stopOnError: true,
          syncPoints: [
            {
              connectionId: '',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          processorConcurrency: 1,
          transformerConcurrency: 8,
          editDisable: false
        }
      }

      let result = await dataFlowsApi.draft(params)
      this.isSaving = false

      console.log('save', result)
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

  &.--right {
    width: 726px;
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
</style>
