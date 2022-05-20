import { NODE_PREFIX } from '../constants'
import { getSubTaskStatus, getTaskBtnDisabled } from '@tap/business'
import {
  AddConnectionCommand,
  AddNodeCommand,
  AddNodeOnConnectionCommand,
  CommandManager,
  MoveNodeCommand,
  QuickAddTargetCommand,
  RemoveConnectionCommand,
  RemoveNodeCommand
} from '../command'

export default {
  methods: {
    async addNodes({ nodes, edges }) {
      if (!nodes?.length) return
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const outputsMap = {}
      const inputsMap = {}

      edges.forEach(({ source, target }) => {
        let _source = outputsMap[source]
        let _target = inputsMap[target]

        if (!_source) {
          outputsMap[source] = [target]
        } else {
          _source.push(target)
        }

        if (!_target) {
          inputsMap[target] = [source]
        } else {
          _target.push(source)
        }
      })

      nodes.forEach(node => {
        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []

        // 数据兼容
        const defaultAttrs = {
          position: [0, 0]
        }
        if (!node.attrs) node.attrs = defaultAttrs
        else if (!node.attrs.position) Object.assign(node.attrs, defaultAttrs)

        const ins = getResourceIns(node)
        Object.defineProperty(node, '__Ctor', {
          value: ins,
          enumerable: false
        })
        this.addNode(node)
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

    checkCanBeConnected(sourceId, targetId, showMsg) {
      if (sourceId === targetId) return false
      if (this.isConnected(sourceId, targetId)) return false

      const source = this.nodeById(sourceId)
      const target = this.nodeById(targetId)
      const maxInputs = target.__Ctor.maxInputs ?? -1
      const connectionType = target.attrs.connectionType

      if (connectionType && !connectionType.includes('target')) {
        showMsg && this.$message.info(`该节点「${target.name}」仅支持作为源`)
        return false
      }

      const connections = this.jsPlumbIns.getConnections({ target: NODE_PREFIX + targetId })

      if (maxInputs !== -1 && connections.length >= maxInputs) {
        showMsg && this.$message.info('该节点已经达到最大连线限制')
        return false
      }

      if (this.allowConnect(sourceId, targetId)) {
        return target.__Ctor.allowSource(source) && source.__Ctor.allowTarget(target, source)
      }

      return false
    },

    checkGotoViewer() {
      if (this.dataflow.disabledData.edit) {
        // 不可编辑
        this.gotoViewer()
        this.setStateReadonly(true)
      }
    },

    async newDataflow() {
      this.dataflow.name = '新任务@' + new Date().toLocaleTimeString()
      await this.saveAsNewDataflow()
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

      this.allNodes.forEach(item => {
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
      this.jsPlumbIns.clearDragSelection()
      this.resetSelectedNodes()
      this.handleDeselectAllConnections()
    },

    /**
     * 取消选中连线
     */
    handleDeselectAllConnections() {
      const selectedConnections = this.$store.state.dataflow.selectedConnections
      if (!selectedConnections.length) return

      const { NODE_PREFIX, jsPlumbIns } = this

      selectedConnections.forEach(({ target, source }) => {
        const conn = jsPlumbIns.select({
          target: NODE_PREFIX + target,
          source: NODE_PREFIX + source
        })

        if (conn) {
          conn.removeClass('connection-selected')
          conn.hideOverlay('removeConn')
          conn.hideOverlay('addNodeOnConn')
        }
      })

      this.deselectAllConnections()
    },

    onHideSidebar() {
      const activeType = this.$store.getters['dataflow/activeType']
      if (activeType === 'connection') {
        this.handleDeselectAllConnections(...arguments)
      }
      this.setActiveType(null)
    },

    getNodesInSelection(selectBoxAttr) {
      let $node = this.$refs.layoutContent.querySelector('.df-node')
      if (!$node) return []
      let nw = $node.offsetWidth
      let nh = $node.offsetHeight
      let { x, y, bottom, right } = selectBoxAttr

      return this.allNodes.filter(node => {
        const [left, top] = node.attrs.position
        return left + nw > x && left < right && bottom > top && y < top + nh
      })
    },

    // 循环检查检查链路的末尾节点类型是否是表节点
    isEndOfTable(source, sourceMap, nodeMap) {
      if (!sourceMap[source.id]) {
        // 末位节点
        return source.type === 'database'
      }

      for (let edge of sourceMap[source.id]) {
        if (!this.isEndOfTable(nodeMap[edge.target], sourceMap, nodeMap)) {
          return false
        }
      }

      return true
    },

    reformDataflow(data, fromWS) {
      if (!fromWS) {
        Object.keys(data).forEach(key => {
          if (!['dag'].includes(key)) {
            this.$set(this.dataflow, key, data[key])
          }
        })
      }
      this.$set(this.dataflow, 'statuses', data.statuses)
      this.$set(this.dataflow, 'statusResult', getSubTaskStatus(data.statuses))
      this.$set(
        this.dataflow,
        'disabledData',
        getTaskBtnDisabled(this.dataflow, this.$disabledByPermission('SYNC_job_operation_all_data', data.user_id))
      )
    }
  }
}
