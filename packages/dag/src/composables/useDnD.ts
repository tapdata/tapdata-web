import { uuid } from '@tap/shared'
import { useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'
import { useUiStore } from '../stores/ui.store'

export function useDnD(emit) {
  const uiStore = useUiStore()
  const dataflowStore = useDataflowStore()
  const dragNode = ref(null)
  const dragStarting = ref(false)
  const { screenToFlowCoordinate, getNodes } = useVueFlow()

  const makeNode = (connection, tableName) => {
    const nodeConfig = {}
    const attrs = {
      connectionName: connection.name,
      connectionType: connection.connection_type,
      accessNodeProcessId: connection.accessNodeProcessId,
      priorityProcessId: connection.priorityProcessId,
      pdkType: connection.pdkType,
      pdkHash: connection.pdkHash,
      capabilities: connection.capabilities || [],
      db_version: connection.db_version,
      hasCreated: false,
      connectionTags: connection.definitionTags,
    }

    return {
      name: tableName || connection.name,
      type: 'table',
      databaseType: connection.database_type,
      connectionId: connection.id,
      tableName,
      nodeConfig,
      attrs,
      noPkSyncMode: 'ADD_HASH', // 无主键同步默认创建哈希列
    }
  }

  const resolveNodeData = (node, position) => {
    if (node.attrs) {
      node.attrs.position = position
    } else {
      node.attrs = { position }
    }

    return {
      ...node,
      id: uuid(),
    }
  }

  const resolveNodeRecource = (node) => {
    const ins = dataflowStore.getResourceInsByNode(node)
    Object.defineProperty(node, '__Ctor', {
      value: ins,
      enumerable: false,
    })
    return node
  }

  const onDragStart = (connection, tableName = '') => {
    const node = resolveNodeRecource(makeNode(connection, tableName))
    dragNode.value = node
    dragStarting.value = true
  }

  const onProcessorDragStart = (item) => {
    dragNode.value = resolveNodeRecource(item)
    dragStarting.value = true
  }

  const onDragMove = (data, position, dragElement) => {
    // console.log('onDragMove', ...args)
    // emit('move-node', ...args)
    const belowElem = document.elementFromPoint(...position)

    if (
      document.querySelector('[data-id="flow-container"]').contains(belowElem)
    ) {
      dragElement.style.transition = `transform 0.3s`
      dragElement.style.transformOrigin = `0 0`
      dragElement.style.transform = `scale(${uiStore.zoom})`
      // const nw = dragElement.offsetWidth
      // const nh = dragElement.offsetHeight
      // const pos = this.$refs.paperScroller.getDropPositionWithinPaper(
      //   position,
      //   {
      //     width: nw,
      //     height: nh,
      //   },
      // )
      // const diffPos = { x: 0, y: 0 }
      // let horiArr = []
      // let verArr = []
      // let rangeX = 10
      // let rangeY = 10

      // this.allNodes.forEach((item) => {
      //   const [x, y] = item.attrs.position
      //   const _x = x - pos[0]
      //   const _y = y - pos[1]
      //   if (Math.abs(_x) <= Math.abs(rangeX)) {
      //     if (_x === rangeX) {
      //       verArr.push(y)
      //     } else {
      //       rangeX = _x
      //       verArr = [y]
      //     }
      //     diffPos.x = rangeX
      //   }
      //   if (Math.abs(_y) <= Math.abs(rangeY)) {
      //     if (_y === rangeY) {
      //       horiArr.push(x)
      //     } else {
      //       rangeY = _y
      //       horiArr = [x]
      //     }
      //     diffPos.y = rangeY
      //   }
      // })

      // pos[0] += diffPos.x
      // pos[1] += diffPos.y

      // console.log('diffPos', diffPos.x, diffPos.y)
      // el.style.left = `${Number.parseInt(el.style.left) + diffPos.x * this.scale}px`
      // el.style.top = `${Number.parseInt(el.style.top) + diffPos.y * this.scale}px`

      // let t = pos[1]
      // let b = pos[1] + nh
      // let l = pos[0]
      // let r = pos[0] + nw
      // verArr.forEach((y) => {
      //   t = Math.min(y + nh, t)
      //   b = Math.max(y, b)
      // })
      // horiArr.forEach((x) => {
      //   l = Math.min(x + nw, l)
      //   r = Math.max(x, r)
      // })

      // // 组装导航线
      // if (t < pos[1]) {
      //   const top = `${t}px`
      //   const height = `${pos[1] - t}px`
      //   lines.push(
      //     {
      //       top,
      //       left: `${pos[0]}px`,
      //       height,
      //     },
      //     {
      //       top,
      //       left: `${pos[0] + nw}px`,
      //       height,
      //     },
      //   )
      // }
      // if (b > pos[1] + nh) {
      //   const top = `${pos[1] + nh}px`
      //   const height = `${b - pos[1] - nh}px`
      //   lines.push(
      //     {
      //       top,
      //       left: `${pos[0]}px`,
      //       height,
      //     },
      //     {
      //       top,
      //       left: `${pos[0] + nw}px`,
      //       height,
      //     },
      //   )
      // }

      // if (l < pos[0]) {
      //   const left = `${l}px`
      //   const width = `${pos[0] - l}px`
      //   lines.push(
      //     {
      //       top: `${pos[1]}px`,
      //       left,
      //       width,
      //     },
      //     {
      //       top: `${pos[1] + nh}px`,
      //       left,
      //       width,
      //     },
      //   )
      // }

      // if (r > pos[0] + nw) {
      //   const left = `${pos[0] + nw}px`
      //   const width = `${r - pos[0] - nw}px`
      //   lines.push(
      //     {
      //       top: `${pos[1]}px`,
      //       left,
      //       width,
      //     },
      //     {
      //       top: `${pos[1] + nh}px`,
      //       left,
      //       width,
      //     },
      //   )
      // }
    } else {
      dragElement.style.transition = `transform 0.3s`
      dragElement.style.transform = 'scale(1)'
    }
  }

  const onDrop = (item, position, rect) => {
    const newPos = screenToFlowCoordinate({
      x: position[0],
      y: position[1],
    })
    console.log('screenToFlowCoordinate', newPos)
    console.log('dragNode', dragNode.value)

    emit('drop-node', dragNode.value, position, rect)
    dataflowStore.addNode(resolveNodeData(dragNode.value, [newPos.x, newPos.y]))
  }

  const onDragStop = () => {
    dragStarting.value = false
    // dragNode.value = null
  }

  return {
    dragNode,
    dragStarting,
    onDragStart,
    onProcessorDragStart,
    onDragStop,
    onDragMove,
    onDrop,
  }
}
