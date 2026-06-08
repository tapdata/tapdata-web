import { uuid } from '@tap/shared'
import { useVueFlow } from '@vue-flow/core'
import { inject, ref } from 'vue'
import { useUiStore } from '../stores/ui.store'

export const makeNode = (
  connection: Record<string, any>,
  tableName?: string,
) => {
  const nodeConfig = {}
  const attrs = {
    connectionName: connection.name,
    connectionType: connection.connection_type,
    accessNodeProcessId: connection.accessNodeProcessId,
    priorityProcessId: connection.priorityProcessId,
    pdkType: connection.pdkType,
    pdkHash: connection.pdkHash,
    db_version: connection.db_version,
    hasCreated: false,
  }

  return {
    id: uuid(),
    name: tableName || connection.name,
    type: tableName === undefined ? 'database' : 'table',
    migrateTableSelectType: tableName === undefined ? 'custom' : undefined,
    databaseType: connection.database_type,
    connectionId: connection.id,
    tableName,
    nodeConfig,
    attrs,
    noPkSyncMode: 'ADD_HASH', // 无主键同步默认创建哈希列
  }
}

export const makeProcessorNode = (item: any) => {
  return {
    ...item,
    id: uuid(),
    attrs: {},
  }
}

export function useDnD({ emit, onAddNode }) {
  const uiStore = useUiStore()
  const dragNode = ref(null)
  const dragStarting = ref(false)
  const { screenToFlowCoordinate, flowToScreenCoordinate } = useVueFlow()

  const updateDragHelperLines = inject<
    | ((
        pos: { x: number; y: number },
        dim: { width: number; height: number },
      ) => { x?: number; y?: number } | undefined)
    | undefined
  >('updateDragHelperLines', undefined)
  const clearDragHelperLines = inject<(() => void) | undefined>(
    'clearDragHelperLines',
    undefined,
  )

  const onDragStart = (connection, tableName) => {
    const node = makeNode(connection, tableName)
    dragNode.value = node
    dragStarting.value = true
  }

  const onProcessorDragStart = (item) => {
    dragNode.value = makeProcessorNode(item)
    dragStarting.value = true
  }

  const onDragMove = (data, position, dragElement) => {
    const belowElem = document.elementFromPoint(...position)
    const flowContainer = document.querySelector('[data-id="flow-container"]')
    const isInsideCanvas = flowContainer?.contains(belowElem)

    if (isInsideCanvas) {
      dragElement.style.transition = `transform 0.3s`
      dragElement.style.transformOrigin = `0 0`
      dragElement.style.transform = `scale(${uiStore.zoom})`

      // Show helper lines: convert screen coords to flow coords
      const flowPos = screenToFlowCoordinate({ x: position[0], y: position[1] })
      const dimensions = {
        width: dragElement.offsetWidth,
        height: dragElement.offsetHeight,
      }
      const snapPosition = updateDragHelperLines?.(flowPos, dimensions)

      // 吸附：将拖拽元素对齐到引导线位置
      if (snapPosition && (snapPosition.x != null || snapPosition.y != null)) {
        const snappedScreen = flowToScreenCoordinate({
          x: snapPosition.x ?? flowPos.x,
          y: snapPosition.y ?? flowPos.y,
        })
        dragElement.style.left = `${snappedScreen.x}px`
        dragElement.style.top = `${snappedScreen.y}px`
      }
    } else {
      dragElement.style.transition = `transform 0.3s`
      dragElement.style.transform = 'scale(1)'
      clearDragHelperLines?.()
    }
  }

  const onDrop = (item, position, rect) => {
    // 使用拖拽元素左上角（已吸附到引导线）的位置作为落点，而非鼠标原始位置
    const newPos = screenToFlowCoordinate({
      x: rect.left,
      y: rect.top,
    })
    emit('drop-node', dragNode.value, position, rect)
    dragNode.value.attrs.position = [newPos.x, newPos.y]
    onAddNode(dragNode.value)
  }

  const onDragStop = () => {
    dragStarting.value = false
    clearDragHelperLines?.()
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
