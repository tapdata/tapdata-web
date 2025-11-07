<script setup lang="ts">
import { findLineageByTable } from '@tap/api/src/core/lineage'
import { batchMeasurements } from '@tap/api/src/core/measurement'
import { makeStatusAndDisabled } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import { calcTimeUnit, Time } from '@tap/shared'
import { Background } from '@vue-flow/background'
import {
  Panel,
  useVueFlow,
  VueFlow,
  type Edge,
  type Node,
} from '@vue-flow/core'
import { nextTick, onUnmounted, provide, ref, useTemplateRef, watch } from 'vue'
import { useLayout } from '../composables/useLayout'
import TableEdge from './TableEdge.vue'
import TableNode from './TableNode.vue'
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

const rootRef = useTemplateRef<HTMLElement>('root')
const { addNodes, addEdges, fitView, zoomOut, zoomIn } = useVueFlow()
const { layout } = useLayout()

const vueFlowRef = ref<InstanceType<typeof VueFlow> | null>(null)
const isFullscreen = ref(false)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const showPopover = ref(false)
const popoverTasks = ref<Task[]>([])
const popoverTarget = ref<HTMLElement | null>(null)
const taskReplicateLagMap = ref({})
const taskMap = ref<Record<string, any>>({})

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
  const tasks: Task[] = edge.attrs.tasks
    ? Object.values(edge.attrs.tasks)
        .map((task: any) => {
          task = makeStatusAndDisabled(task)

          if (task.status === 'running') {
            taskMap.value[task.id as string] = {
              taskRecordId: task.taskRecordId,
              startAt: new Date(task.startTime).getTime(),
            }
          }

          return task
        })
        .sort((a: any, b: any) => {
          // 'running' comes first, then others
          if (a.status === 'running' && b.status !== 'running') return -1
          if (a.status !== 'running' && b.status === 'running') return 1
          return 0
        })
    : []

  return {
    id: index,
    source: edge.source,
    target: edge.target,
    type: 'table',
    // markerEnd: 'figma-arrow-wide',
    markerEnd: 'custom-arrow',
    animated: tasks[0]?.status === 'running',
    // markerEnd: {
    //   type: 'arrow',
    //   strokeWidth: 2,
    // },
    data: {
      tasks,
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

    fetchTaskReplicateLag()

    nextTick(() => {
      handleLayoutGraph()
    })
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

const genParams = () => {
  return Object.keys(taskMap.value).reduce((acc, taskId) => {
    const task = taskMap.value[taskId]
    acc[taskId] = {
      uri: '/api/measurement/query/v2',
      param: {
        startAt: task.startAt,
        endAt: Time.now(),
        samples: {
          data: {
            tags: {
              type: 'task',
              taskId,
              taskRecordId: task.taskRecordId,
            },
            endAt: Time.now(),
            fields: ['replicateLag'],
            type: 'instant',
          },
        },
      },
    }
    return acc
  }, {})
}

const fetchTaskReplicateLag = async () => {
  if (!Object.keys(taskMap.value).length) return

  const data = await batchMeasurements(genParams())
  Object.keys(data).forEach((key) => {
    const { replicateLag } = data[key].data?.samples?.data?.[0] || {}
    taskReplicateLagMap.value[key] = replicateLag
      ? calcTimeUnit(replicateLag, 2, {
          autoHideMs: true,
        })
      : 0
  })
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

function enterFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    // Safari
    element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    // IE11
    element.msRequestFullscreen()
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

// function isFullscreenActive() {
//   return !!(
//     document.fullscreenElement ||
//     document.webkitFullscreenElement ||
//     document.msFullscreenElement
//   )
// }

const toggleFullscreen = () => {
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    enterFullscreen(rootRef.value)
  }

  isFullscreen.value = !isFullscreen.value
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  setTimeout(() => {
    fitView()
  }, 10)
}

const handleExpandCollapse = (ids: string[]) => {
  console.log('ids', ids)
  nodes.value.forEach((node) => {
    if (ids.includes(node.id)) {
      node.hidden = !node.hidden
    }
  })
  fitView({
    duration: 500,
  })
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

document.addEventListener('fullscreenchange', onFullscreenChange)

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

provide('taskReplicateLagMap', taskReplicateLagMap)
</script>

<template>
  <div id="table-lineage-graph" ref="root" class="table-lineage-graph h-100">
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
      ref="vueFlowRef"
      v-model:nodes="nodes"
      v-model:edges="edges"
      v-loading="loading"
      class="border rounded-xl bg-white dark:bg-overlay"
      @nodes-initialized="handleLayoutGraph"
      @node-double-click="onNodeDoubleClick"
    >
      <Panel position="top-right">
        <div
          class="paper-toolbar flex gap-1 bg-white dark:bg-overlay p-1 rounded-lg shadow-sm border border-light"
          style="--btn-space: 0"
        >
          <IconButton click-and-rotate @click="fetchLineage"
            >refresh</IconButton
          >
          <IconButton @click="fitView">compress</IconButton>
          <IconButton @click="zoomOut">remove-outline</IconButton>
          <IconButton @click="zoomIn">add-outline</IconButton>
          <IconButton @click="toggleFullscreen">{{
            isFullscreen ? 'suoxiao' : 'fangda'
          }}</IconButton>
        </div>
      </Panel>
      <Background />

      <template #node-table="{ id, data }">
        <TableNode
          :id="id"
          :data="data"
          :active="
            connectionId === data.connectionId && tableName === data.table
          "
          @expand-collapse="handleExpandCollapse"
        />
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

      <TasksPopover
        v-model="showPopover"
        :teleported="false"
        :reference="popoverTarget"
        :tasks="popoverTasks"
        @click-task="$emit('clickTask', $event)"
      />
    </VueFlow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped lang="scss">
.vue-flow.fullscreen {
  position: fixed !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
:deep(.table-lineage-connection-label) {
  max-width: 180px;
  z-index: 1001;
  &:hover {
    background-color: var(--el-fill-color-lighter) !important;
    .label-dropdown > span {
      border-color: transparent !important;
    }
  }
  .label-content:not(:only-child):hover,
  .label-dropdown:hover {
    background-color: var(--el-fill-color) !important;
  }
}
</style>
