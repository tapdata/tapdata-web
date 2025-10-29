<script setup lang="ts">
import { findLineageByTable } from '@tap/api/src/core/lineage'
import { makeStatusAndDisabled } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import { Background } from '@vue-flow/background'
import {
  Panel,
  useVueFlow,
  VueFlow,
  type Edge,
  type Node,
} from '@vue-flow/core'
import { nextTick, ref, watch } from 'vue'
import { useLayout } from '../composables/useLayout'
import TableNode from './Node.vue'
import TableEdge from './TableEdge.vue'
import TasksPopover from './TasksPopover.vue'

interface Task {
  name: string
  status: string
}

const emit = defineEmits<{
  (e: 'clickTask', task: Task): void
  (e: 'nodeDblclick', table: any): void
}>()

const props = defineProps<{
  connectionId: string
  tableName: string
  isShow: boolean
}>()

const { addNodes, addEdges, fitView, zoomOut, zoomIn } = useVueFlow()
const { layout } = useLayout()

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const showPopover = ref(false)
const popoverTasks = ref<Task[]>([])
const popoverTarget = ref<HTMLElement | null>(null)

interface FetchLineageFn {
  (): Promise<void>
  controller?: AbortController
}

const mapNode = (node: any) => {
  let module: any = {}
  if (node.type === 'apiserverLineage') {
    module = Object.values(node.modules)[0]
  }
  return {
    id: node.id,
    type: 'table',
    position: { x: 0, y: 0 },
    data: {
      type: node.type,
      table: node.table,
      metadataId: node.metadata?.id,
      module,
      connectionName: node.connectionName,
      pdkHash: node.pdkHash,
      connectionId: node.connectionId,
    },
  }
}

const mapEdge = (edge: any, index: number) => {
  return {
    id: index,
    source: edge.source,
    target: edge.target,
    type: 'table',
    // markerEnd: 'figma-arrow-wide',
    markerEnd: 'custom-arrow',
    // markerEnd: {
    //   type: 'arrow',
    //   strokeWidth: 2,
    // },
    data: {
      tasks: (edge.attrs.tasks
        ? Object.values(edge.attrs.tasks).map(makeStatusAndDisabled)
        : []) as Task[],
    },
  }
}

const loading = ref(false)

const fetchLineage: FetchLineageFn = async () => {
  if (fetchLineage.controller) {
    fetchLineage.controller.abort()
  }

  fetchLineage.controller = new AbortController()
  try {
    loading.value = true
    const { dag } = await findLineageByTable(
      props.connectionId,
      props.tableName,
      {
        signal: fetchLineage.controller.signal,
      },
    )

    nodes.value = dag.nodes.map(mapNode)
    edges.value = dag.edges.map(mapEdge)

    // addNodes(dag.nodes.map(mapNode))
    // addEdges(dag.edges.map(mapEdge))

    nextTick(() => {
      handleLayoutGraph()
    })
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const handleLayoutGraph = () => {
  nodes.value = layout(nodes.value, edges.value, 'LR')

  nextTick(() => {
    fitView()
  })
}

const handleOpenPopover = async (target: HTMLElement, tasks: Task[]) => {
  popoverTasks.value = tasks
  showPopover.value = false
  await nextTick()
  popoverTarget.value = target
  await nextTick()
  setTimeout(() => {
    showPopover.value = true
  }, 50)
}

const onNodeDoubleClick = ({ node }) => {
  const data = node.data as any

  if (data.type === 'apiserverLineage') return
  if (!data.metadataId) return

  const table = {
    ...data,
    id: data.metadataId,
    name: data.table,
    LDP_TYPE: 'table',
    isObject: true,
  }

  emit('nodeDblclick', table)
}

watch(
  () => [props.connectionId, props.tableName, props.isShow],
  ([connectionId, tableName, isShow]) => {
    if (isShow && connectionId && tableName) {
      fetchLineage()
    }
  },
  { immediate: true },
)
</script>

<template>
  <svg style="position: absolute; left: -1000px; top: 0">
    <defs>
      <!-- Figma 标准箭头 -->
      <marker
        id="figma-arrow"
        viewBox="0 0 24 24"
        refX="16"
        refY="12"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <polyline
          stroke-width="3"
          points="7,4 17,12 7,20"
          fill="none"
          stroke="#b1b1b7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
      <marker
        id="figma-arrow-wide"
        viewBox="0 0 24 24"
        refX="16"
        refY="12"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <polyline
          points="7,4 15,12 7,20"
          fill="none"
          stroke="#b1b1b7"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
      <marker
        id="figma-arrow-widest"
        viewBox="0 0 24 24"
        refX="17"
        refY="12"
        markerWidth="12"
        markerHeight="12"
        orient="auto"
      >
        <polyline
          points="5,2 17,12 5,22"
          fill="none"
          stroke="#b1b1b7"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
      <marker
        id="custom-arrow"
        viewBox="0 0 10 16"
        refX="9"
        refY="8"
        markerWidth="10"
        markerHeight="16"
        orient="auto"
      >
        <polyline
          points="2,2 8,8 2,14"
          fill="none"
          stroke="#b1b1b7"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
      <marker
        id="custom-arrow-wide"
        viewBox="0 0 12 18"
        refX="10"
        refY="9"
        markerWidth="12"
        markerHeight="18"
        orient="auto"
      >
        <polyline
          points="3,2 10,9 3,16"
          fill="none"
          stroke="#b1b1b7"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
      <marker
        id="custom-arrow-filled"
        viewBox="0 0 16 16"
        refX="14"
        refY="8"
        markerWidth="12"
        markerHeight="12"
        orient="auto"
      >
        <path
          d="M12 2L4 8L12 14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </marker>
    </defs>
  </svg>
  <VueFlow
    v-model:nodes="nodes"
    v-model:edges="edges"
    v-loading="loading"
    class="border rounded-xl"
    @nodes-initialized="handleLayoutGraph"
    @node-double-click="onNodeDoubleClick"
  >
    <Panel position="top-right">
      <div
        class="paper-toolbar flex gap-1 bg-white dark:bg-overlay p-1 rounded-lg shadow-sm border border-light"
        style="--btn-space: 0"
      >
        <IconButton click-and-rotate @click="fetchLineage">refresh</IconButton>
        <ElTooltip
          transition="tooltip-fade-in"
          :open-delay="50"
          :content="`${$t('packages_dag_button_center_content')}(Shift + 1)`"
        >
          <IconButton @click="fitView">compress</IconButton>
        </ElTooltip>
        <ElTooltip
          transition="tooltip-fade-in"
          :open-delay="50"
          :content="`${$t('packages_dag_button_zoom_out')}(${commandCode} -)`"
        >
          <IconButton @click="zoomOut">remove-outline</IconButton>
        </ElTooltip>
        <ElTooltip
          transition="tooltip-fade-in"
          :open-delay="50"
          :content="`${$t('packages_dag_button_zoom_in')}(${commandCode} +)`"
        >
          <IconButton @click="zoomIn">add-outline</IconButton>
        </ElTooltip>
        <ElTooltip
          ref="fullscreenTooltip"
          transition="tooltip-fade-in"
          :open-delay="50"
          :disabled="fullscreenDisabled"
          :content="fullscreenTip"
        >
          <IconButton @click="toggleFullscreen">{{
            isFullscreen ? 'suoxiao' : 'fangda'
          }}</IconButton>
        </ElTooltip>
      </div>
    </Panel>
    <Background />

    <template #node-table="{ id, data }">
      <TableNode :id="id" :data="data" />
    </template>

    <template #edge-table="edge">
      <TableEdge
        :id="edge.id"
        :tasks="edge.data.tasks as Task[]"
        :source-x="edge.sourceX"
        :source-y="edge.sourceY"
        :target-x="edge.targetX"
        :target-y="edge.targetY"
        :source-position="edge.sourcePosition"
        :target-position="edge.targetPosition"
        :marker-end="edge.markerEnd"
        :style="edge.style"
        @open-popover="handleOpenPopover"
        @click-task="$emit('clickTask', $event)"
      />
    </template>

    <Panel position="bottom-left" class="z-1">
      <el-text
        class="font-color-sslight fs-8"
        type="info"
        style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12)"
      >
        <el-icon>
          <i-lucide-info />
        </el-icon>
        {{ $t('packages_ldp_lineage_loading_tips') }}
      </el-text>
    </Panel>
  </VueFlow>

  <TasksPopover
    v-model="showPopover"
    :reference="popoverTarget"
    :tasks="popoverTasks"
    @click-task="$emit('clickTask', $event)"
  />
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped lang="scss">
:deep(.table-lineage-connection-label) {
  max-width: 180px;
  z-index: 1001;
  .el-tag {
    background-color: inherit;
    color: inherit;
    border-color: currentColor;
  }
  &.compact-tag {
    .el-tag:first-child {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
    .el-tag:last-child {
      margin-left: -1px;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }
  }
}
</style>
