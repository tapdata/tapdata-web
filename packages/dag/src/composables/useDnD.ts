import { ref } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'

export function useDnD(emit) {
  const dataflowStore = useDataflowStore()
  const dragNode = ref(null)
  const dragStarting = ref(false)

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

  const onDragStart = (connection, tableName = '') => {
    const node = makeNode(connection, tableName)
    const ins = dataflowStore.getResourceInsByNode(node)
    Object.defineProperty(node, '__Ctor', {
      value: ins,
      enumerable: false,
    })
    dragNode.value = node
    dragStarting.value = true
  }

  const onDragMove = () => {
    emit('move-node', ...arguments)
  }

  const onDrop = (item, position, rect)  => {
    emit('drop-node', dragNode.value, position, rect)
  }

  const onDragStop = () => {
    dragStarting.value = false
    dragNode.value = null
  }

  return {
    dragNode,
    dragStarting,
    onDragStart,
    onDragStop,
    onDragMove,
    onDrop,
  }
}
