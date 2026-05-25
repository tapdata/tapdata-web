<script setup lang="ts">
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import SkipError from '@tap/business/src/views/task/SkipError.vue'
import { TextEditable } from '@tap/component/src/base/text-editable'
import { useI18n } from '@tap/i18n'
import { uuid } from '@tap/shared'
import { useVueFlow } from '@vue-flow/core'
import { useLocalStorage, useResizeObserver } from '@vueuse/core'
import {
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Canvas from './Canvas.vue'
import MaterializedView from './components/materialized-view/MaterializedView.vue'
import ConsolePanel from './components/migration/ConsolePanel.vue'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useClipboard } from './composables/useClipboard'
import { useDataflowStore } from './stores/dataflow.store'
import { useHistoryStore } from './stores/history.store'

const dataflowStore = useDataflowStore()
const historyStore = useHistoryStore()
const { findNode, getOutgoers } = useVueFlow()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const materializedViewRef = useTemplateRef('materializedView')

const {
  dag,
  dataflow,
  dataflowName,
  dataflowDesc,
  buttonShowMap,
  formScope,
  isSaving,
  isSyncTask,
  canvasRef,
  consoleRef,
  skipErrorRef,
  taskOperationsRef,
  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onDeleteNodes,
  onAddNode,
  onMoveNodePosition,
  onUpdateNodesPosition,
  onClickNode,
  handleSave,
  handleReset,
  handleStart,
  onNameInputChange,
  initWS,
  startTask,
  previewData,
  previewLoading,
  handlePreview,
  handleStop,
  handleForceStop,
  handlePageReturn,
  setMaterializedViewVisible,
  onCopyNodes,
  onPasteNodes,
} = useCanvasOperation()

const clipboard = useClipboard({ onPaste: onClipboardPaste })

const isInitialized = ref(false)
const init = async () => {
  dataflowStore.$reset()
  const taskId = route.params.id as string
  await dataflowStore.initPdkProperties()

  if (taskId) {
    await initNodeType()
    const task = await dataflowStore.fetchDataflow(taskId)

    if (!task) {
      ElMessage.error(t('packages_dag_mixins_editor_renwubucunzai'))
      handlePageReturn()
      return
    }
  } else {
    let syncType
    let targetRoute

    if (route.name === 'DataflowNew') {
      syncType = 'sync'
      targetRoute = 'DataflowEditor'
    } else if (route.name === 'MigrateCreate') {
      syncType = 'migrate'
      targetRoute = 'MigrateEditor'
    }
    await initNodeType()
    await dataflowStore.createDataflow(syncType)
    router.push({
      name: targetRoute,
      params: {
        id: dataflowStore.dataflow.id,
      },
    })
  }

  initWS()
  isInitialized.value = true
  dataflowStore.taskLoading = false
  // Check route query for auto-opening materialized view
  checkMaterializedView()
}

const copyNodes = async (nodes: any[]) => {
  await clipboard.copy(onCopyNodes(nodes))

  ElMessage.success(t('packages_dag_src_editor_copy_success'))
}

function onClipboardPaste(plainTextData: string) {
  const newIds = onPasteNodes(plainTextData)
  if (!newIds.length) return

  setTimeout(() => {
    // 确保粘贴的节点在视野内
    canvasRef.value?.ensureNodesVisible(newIds)
    // 多节点（框选复制的）重新选中并显示框选矩形
    if (newIds.length > 1) {
      canvasRef.value?.selectNodes(newIds)
    }
  }, 10)
}

watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
  if (isInitialized.value) {
    dataflowStore.patchDataflow()
  }
})

watch(
  () => dataflow.value.status,
  (v) => {
    // if (dataflow.value.btnDisabled?.edit) {
    //   dataflowStore.stateIsReadonly = true
    // } else {
    //   dataflowStore.stateIsReadonly = false
    // }

    if (v === 'starting' || v === 'running') {
      const routeName =
        dataflow.value.syncType === 'sync' ? 'TaskMonitor' : 'MigrationMonitor'
      router.push({
        name: routeName,
        params: {
          id: dataflow.value.id,
        },
      })
    }

    // if (
    //   ['DataflowViewer'].includes(this.$route.name) &&
    //   ['renewing'].includes(v)
    // ) {
    //   this.handleConsoleAutoLoad()
    // }
  },
)

init()

// Control NodesPanel visibility
const nodesPanelExpanded = useLocalStorage('dag-nodes-panel-expanded', true)
const hideNodesPanelTipShown = useLocalStorage(
  'dag-hide-nodes-panel-tip-shown',
  false,
)
const showHideNodesPanelTip = ref(false)
const hideNodesPanelTipRef = useTemplateRef<any>('hideNodesPanelTipRef')
const taskDetailRef = useTemplateRef<HTMLElement>('taskDetailRef')

// 延迟显示 tooltip，等待布局稳定后再出现
if (!hideNodesPanelTipShown.value && nodesPanelExpanded.value) {
  setTimeout(() => {
    showHideNodesPanelTip.value = true
  }, 1000)
}

// 仅在 tooltip 显示时监听父容器尺寸变化，保持 tooltip 跟随按钮位置
let stopResizeObserver: (() => void) | null = null

watch(showHideNodesPanelTip, (visible) => {
  if (visible) {
    const { stop } = useResizeObserver(taskDetailRef, () => {
      hideNodesPanelTipRef.value?.updatePopper?.()
    })
    stopResizeObserver = stop
  } else {
    stopResizeObserver?.()
    stopResizeObserver = null
  }
})

const toggleExpandNodes = () => {
  nodesPanelExpanded.value = !nodesPanelExpanded.value
  if (showHideNodesPanelTip.value) {
    showHideNodesPanelTip.value = false
    hideNodesPanelTipShown.value = true
  }
}

onBeforeUnmount(() => {
  dataflowStore.$reset()
})

// ======== Materialized View ========
const X_OFFSET = 100
const Y_OFFSET = 40

function createNodeData(nodeType: any) {
  return {
    id: uuid(),
    attrs: { position: [0, 0] },
    ...nodeType,
  }
}

/**
 * 添加源节点到主 DAG（在 merge_table_processor 前面添加）
 * 位置计算逻辑与 NodesPopover.handleAddNode 保持一致
 */
function onAddMaterializedViewNode(parentNode: any, mvProps: any) {
  const activeNode = dataflowStore.selectedNode as any
  if (!activeNode) return

  const nextNodeId = activeNode.id

  const newNode = createNodeData({
    name: '',
    type: 'table',
    databaseType: '',
    connectionId: '',
    tableName: '',
    attrs: { hasCreated: false, position: [0, 0] },
  })

  // 计算位置：在 merge_table_processor 前面添加
  const canvasNextNode = findNode(nextNodeId)
  if (canvasNextNode) {
    const existingInputs = activeNode.$inputs || []
    if (existingInputs.length > 0) {
      // 已有上游节点，放在最后一个上游节点下方
      const lastInputNode = findNode(existingInputs.at(-1))
      if (lastInputNode) {
        newNode.attrs.position = [
          lastInputNode.position.x,
          lastInputNode.position.y +
            (lastInputNode.dimensions?.height || 200) +
            Y_OFFSET,
        ]
      } else {
        newNode.attrs.position = [
          canvasNextNode.position.x -
            (canvasNextNode.dimensions?.width || 260) -
            X_OFFSET,
          canvasNextNode.position.y,
        ]
      }
    } else {
      // 没有上游节点，放在 merge_table_processor 左边
      newNode.attrs.position = [
        canvasNextNode.position.x -
          (canvasNextNode.dimensions?.width || 260) -
          X_OFFSET,
        canvasNextNode.position.y,
      ]
    }
  }

  // 使用带历史记录的操作
  historyStore.startRecordingUndo()
  onAddNode(newNode)
  onCreateConnection({ source: newNode.id, target: nextNodeId })
  historyStore.stopRecordingUndo()

  const viewNode = {
    ...mvProps,
    id: newNode.id,
    parentId: parentNode.id,
    tableName: newNode.name,
    tableNode: newNode,
    children: [],
  }

  parentNode.children.push(viewNode)
  materializedViewRef.value?.addNode(viewNode)
}

/**
 * 添加目标节点到主 DAG（在 merge_table_processor 后面添加）
 * 位置计算逻辑与 NodesPopover.handleAddNode 保持一致
 */
function onAddMaterializedViewTargetNode() {
  const activeNode = dataflowStore.selectedNode as any
  if (!activeNode) return

  const prevNodeId = activeNode.id

  const newNode = createNodeData({
    name: `Node ${dag.value.nodes.length + 1}`,
    type: 'table',
    databaseType: '',
    connectionId: '',
    tableName: '',
    attrs: {
      capabilities: [{ id: 'master_slave_merge' }],
      hasCreated: false,
      position: [0, 0],
    },
  })

  // 计算位置：在 merge_table_processor 后面添加
  const canvasPrevNode = findNode(prevNodeId)
  if (canvasPrevNode) {
    const outgoers = getOutgoers(prevNodeId).sort(
      (a, b) => a.position.y - b.position.y,
    )
    const lastOutgoer = outgoers.at(-1)
    newNode.attrs.position = lastOutgoer
      ? [
          lastOutgoer.position.x,
          lastOutgoer.position.y +
            (lastOutgoer.dimensions?.height || 200) +
            Y_OFFSET,
        ]
      : [
          canvasPrevNode.position.x +
            (canvasPrevNode.dimensions?.width || 260) +
            X_OFFSET,
          canvasPrevNode.position.y,
        ]
  }

  // 使用带历史记录的操作
  historyStore.startRecordingUndo()
  onAddNode(newNode)
  onCreateConnection({ source: prevNodeId, target: newNode.id })
  historyStore.stopRecordingUndo()

  nextTick(() => {
    materializedViewRef.value?.addTargetNode(newNode)
  })
}

function onDeleteMaterializedViewNode(nodeId: string) {
  const node = dataflowStore.findNodeById(nodeId)
  if (node) {
    onDeleteNode(node)
  }
}

async function checkMaterializedView() {
  const { query } = route
  const { by, connectionId, tableName } = query as Record<string, string>

  if (by !== 'materialized-view' && by !== 'transformation-materialized') return

  await router.replace({
    params: { id: route.params.id },
    query: {
      ...query,
      by: undefined,
      connectionId: undefined,
      tableName: undefined,
    },
  })

  let connection: any
  if (connectionId) {
    connection = await getConnectionNoSchema(connectionId)
  }

  // 节点宽度估算值，用于计算初始位置
  const NODE_WIDTH = 260

  if (by === 'transformation-materialized') {
    const mergeTableNode = createNodeData({
      name: t('packages_dag_src_editor_zhuconghebing'),
      type: 'merge_table_processor',
      attrs: { position: [300, 300] },
    })

    historyStore.startRecordingUndo()
    onAddNode(mergeTableNode)

    if (connection) {
      const targetNode = createNodeData({
        name: tableName || connection.name,
        type: 'table',
        databaseType: connection.database_type,
        connectionId: connection.id,
        tableName,
        attrs: {
          connectionName: connection.name,
          connectionType: connection.connection_type,
          hasCreated: false,
          position: [300 + NODE_WIDTH + X_OFFSET, 300],
        },
      })
      onAddNode(targetNode)
      onCreateConnection({
        source: mergeTableNode.id,
        target: targetNode.id,
      })
    }

    historyStore.stopRecordingUndo()
    return
  }

  // Add source node
  const sourceNode = createNodeData({
    name: 'SourceNode',
    type: 'table',
    databaseType: '',
    connectionId: '',
    tableName: '',
    attrs: { hasCreated: false, position: [100, 300] },
  })

  // Add merge_table_processor node
  const mergeTableNode = createNodeData({
    name: t('packages_dag_src_editor_zhuconghebing'),
    type: 'merge_table_processor',
    attrs: { position: [100 + NODE_WIDTH + X_OFFSET, 300] },
  })

  historyStore.startRecordingUndo()
  onAddNode(sourceNode)
  onAddNode(mergeTableNode)
  onCreateConnection({
    source: sourceNode.id,
    target: mergeTableNode.id,
  })

  // Add target node
  if (connection) {
    const targetNode = createNodeData({
      name: tableName || connection.name,
      type: 'table',
      databaseType: connection.database_type,
      connectionId: connection.id,
      tableName,
      attrs: {
        connectionName: connection.name,
        connectionType: connection.connection_type,
        hasCreated: false,
        position: [100 + (NODE_WIDTH + X_OFFSET) * 2, 300],
      },
    })
    onAddNode(targetNode)
    onCreateConnection({
      source: mergeTableNode.id,
      target: targetNode.id,
    })
  }

  historyStore.stopRecordingUndo()

  await nextTick()

  // Select merge table node and open materialized view
  dataflowStore.selectNode(mergeTableNode)

  setTimeout(() => {
    setMaterializedViewVisible(true)
  }, 120)
}


provide('dag', dag)
provide('nodesPanelExpanded', nodesPanelExpanded)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
provide('dataflowName', dataflowName)
provide('dataflowDesc', dataflowDesc)
provide('onNameInputChange', onNameInputChange)
provide('formScope', formScope)
provide('isSaving', isSaving)
provide('previewData', previewData)
provide('previewLoading', previewLoading)
provide('handlePreview', handlePreview)
provide('isInitialized', isInitialized)
provide('isSyncTask', isSyncTask)
</script>

<template>
  <div
    id="dataflow-container"
    class="w-100 h-100 position-relative overflow-hidden"
  >
    <div
      ref="taskDetailRef"
      class="task-detail position-absolute top-3 start-3 z-10 bg-overlay rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button data-testid="back-button" text @click="handlePageReturn">
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <el-divider direction="vertical" class="mx-0" />
      <div>
        <TextEditable
          v-model:value="dataflowName"
          class="overflow-hidden"
          :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
          :maxlength="200"
          :max-width="320"
          hidden-icon
          @change="onNameInputChange"
        />
      </div>
      <TaskStatus class="w-auto rounded-lg zoom-xs" :task="dataflow" />
      <el-tooltip
        ref="hideNodesPanelTipRef"
        :visible="showHideNodesPanelTip"
        :content="$t('packages_dag_hide_nodes_panel_tip')"
        placement="right"
      >
        <el-button
          data-testid="nodes-panel-button"
          text
          :type="nodesPanelExpanded ? 'primary' : undefined"
          :bg="nodesPanelExpanded"
          @click="toggleExpandNodes"
        >
          <template #icon>
            <VIcon
              style="transition: none"
              :style="{
                transform: `scaleX(${!nodesPanelExpanded ? -1 : 1})`,
              }"
              >expand-list</VIcon
            >
          </template>
        </el-button>
      </el-tooltip>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations
        v-if="dataflow.id"
        ref="taskOperationsRef"
        @save="handleSave"
        @reset="handleReset"
        @start="handleStart"
        @stop="handleStop"
        @force-stop="handleForceStop"
        @locate-node="(id) => canvasRef?.locateNode(id)"
        @debug-start="handleStart(true)"
      />
    </div>
    <Canvas
      ref="canvasRef"
      @preview="handlePreview"
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @delete:nodes="onDeleteNodes"
      @copy:nodes="copyNodes"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:node="onClickNode"
    >
      <template #bottom>
        <ConsolePanel v-if="dataflowStore.showConsole" ref="consoleRef" />
      </template>
    </Canvas>

    <SkipError ref="skipErrorRef" @skip="startTask" />

    <MaterializedView
      v-if="dataflow.syncType === 'sync'"
      ref="materializedView"
      :visible="dataflowStore.materializedViewVisible"
      :disabled="dataflowStore.stateIsReadonly"
      :is-saving="isSaving"
      :dataflow="dataflow"
      :button-show-map="buttonShowMap"
      @update:visible="setMaterializedViewVisible"
      @add-node="onAddMaterializedViewNode"
      @add-target-node="onAddMaterializedViewTargetNode"
      @delete-node="onDeleteMaterializedViewNode"
      @start="handleStart"
    />
  </div>
</template>

<style scoped lang="scss">
.header {
  top: 28px;
}
:deep(.btn-shadow) {
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;
}
.task-detail {
  :deep(.task-status-block) {
    min-width: unset;
  }
}
</style>
