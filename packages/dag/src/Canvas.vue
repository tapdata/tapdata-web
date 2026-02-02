<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import {
  computed,
  inject,
  nextTick,
  provide,
  ref,
  shallowRef,
  watch,
  type Ref,
} from 'vue'
import CanvasConnectionLine from './components/elements/CanvasConnectionLine.vue'
import CanvasEdge from './components/elements/CanvasEdge.vue'
import Node from './components/elements/CanvasNode.vue'
import NodesPopover from './components/elements/NodesPopover.vue'
import NodesPanel from './components/NodesPanel.vue'
import RightPanel from './components/RightPanel.vue'
import { useCanvasMapping } from './composables/useCanvasMapping'
import { useUiStore } from './stores/ui.store'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const emit = defineEmits<{
  'update:nodes:position': [events: any[]]
  'create:connection': [connection: any]
  'delete:connection': [connection: any]
  'click:connection:add': [connection: any]
}>()

const uiStore = useUiStore()
const dag = inject('dag')
const nodesPanelExpanded = inject<Ref<boolean>>('nodesPanelExpanded', ref(true))
const { nodes, edges } = useCanvasMapping(dag)
const vueFlow = useVueFlow()
const {
  viewport,
  onEdgeMouseLeave,
  onEdgeMouseEnter,
  onEdgeMouseMove,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneContextMenu,
  screenToFlowCoordinate,
} = vueFlow

const nodesHoveredById = ref<Record<string, boolean>>({})
const showPopover = ref(false)
const popoverRef = ref<InstanceType<typeof NodesPopover> | null>(null)
const popoverTarget = ref<HTMLElement | null>(null)
const popoverTargetKey = ref<string | null>(null)
const addNodeParams = shallowRef<any>(null)

// Context menu state
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

// Create virtual element for context menu position
const virtualContextMenuTarget = computed(() => {
  return {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        top: contextMenuPosition.value.y,
        left: contextMenuPosition.value.x,
        right: contextMenuPosition.value.x,
        bottom: contextMenuPosition.value.y,
        x: contextMenuPosition.value.x,
        y: contextMenuPosition.value.y,
        toJSON() {
          return this
        },
      }
    },
  } as HTMLElement
})

const popoverPlacement = computed(() => {
  if (popoverTargetKey.value?.endsWith('_target')) {
    return 'left'
  }
  return 'right'
})

onNodeMouseEnter(({ node }) => {
  nodesHoveredById.value = { [node.id]: true }
})

onNodeMouseLeave(({ node }) => {
  nodesHoveredById.value = { [node.id]: false }
})

function onUpdateNodesPosition(events) {
  emit('update:nodes:position', events)
}

function onNodeDragStop(event) {
  onUpdateNodesPosition(
    event.nodes.map(({ id, position }) => ({ id, position })),
  )
}

const edgesHoveredById = ref<Record<string, boolean>>({})
const edgesBringToFrontById = ref<Record<string, boolean>>({})

onEdgeMouseEnter(({ edge }) => {
  edgesBringToFrontById.value = { [edge.id]: true }
  edgesHoveredById.value = { [edge.id]: true }
})

onEdgeMouseLeave(({ edge }) => {
  edgesBringToFrontById.value = { [edge.id]: false }
  edgesHoveredById.value = { [edge.id]: false }
})

watch(
  () => viewport.value.zoom,
  (val) => {
    uiStore.zoom = val

    if (showPopover.value) {
      popoverRef.value?.update()
    }
  },
)

function onUpdateEdgeLabelHovered(id: string, hovered: boolean) {
  edgesHoveredById.value[id] = hovered
}

const connectionCreated = ref(false)
const connectingHandle = ref<ConnectStartEvent>()
const connectedHandle = ref<Connection>()

function onConnect(connection: Connection) {
  emit('create:connection', connection)

  connectedHandle.value = connection
  connectionCreated.value = true
}

function onDeleteConnection(connection: Connection) {
  emit('delete:connection', connection)
}

function onClickConnectionAdd(connection: Connection) {
  emit('click:connection:add', connection)
}

function onNodeClick({ event, node }) {
  emit('click:node', node)
}

async function onShowNodesPopover(data, target, key) {
  addNodeParams.value = data
  showPopover.value = false
  await nextTick()
  popoverTarget.value = target
  popoverTargetKey.value = key
  await nextTick()
  setTimeout(() => {
    showPopover.value = true
  }, 50)
}

function onHideNodesPopover() {
  popoverTarget.value = null
  popoverTargetKey.value = null
}

// Context menu handlers - use VueFlow's onPaneContextMenu hook
onPaneContextMenu((event) => {
  event.preventDefault()
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuVisible.value = true
})

async function onAddNodeFromContextMenu() {
  contextMenuVisible.value = false
  // Convert screen coordinates to flow coordinates
  const flowPosition = screenToFlowCoordinate({
    x: contextMenuPosition.value.x,
    y: contextMenuPosition.value.y,
  })
  // Use the virtual element as the popover target
  addNodeParams.value = {
    flowPosition, // Pass the converted flow coordinates
  }
  showPopover.value = false
  await nextTick()
  popoverTarget.value = virtualContextMenuTarget.value
  popoverTargetKey.value = 'context_menu'
  await nextTick()
  setTimeout(() => {
    showPopover.value = true
  }, 50)
}

provide('popoverTarget', popoverTarget)
provide('showPopover', showPopover)
provide('popoverTargetKey', popoverTargetKey)
</script>

<template>
  <div id="node-canvas" class="position-relative w-100 h-100">
    <Transition name="slide-left">
      <NodesPanel v-if="nodesPanelExpanded" />
    </Transition>
    <RightPanel />
    <NodesPopover
      ref="popoverRef"
      v-model="showPopover"
      :placement="popoverPlacement"
      :params="addNodeParams"
      :teleported="false"
      :reference="popoverTarget"
      @after-leave="onHideNodesPopover"
    />

    <svg style="position: absolute; left: -1000px; top: 0">
      <defs>
        <marker
          id="marker-arrow"
          viewBox="-10 -10 20 20"
          refX="0"
          refY="0"
          markerWidth="12.5"
          markerHeight="12.5"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
        >
          <polyline
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            points="-5,-4 0,0 -5,4"
            style="stroke: context-stroke; stroke-width: 2"
          />
        </marker>
      </defs>
    </svg>

    <!-- Context Menu -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="contextMenuVisible"
          class="canvas-context-menu"
          :style="{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }"
        >
          <div class="context-menu-item" @click="onAddNodeFromContextMenu">
            <el-icon><i-lucide-plus /></el-icon>
            <span>{{ $t('packages_dag_canvas_add_node') }}</span>
          </div>
        </div>
      </Transition>
      <div
        v-if="contextMenuVisible"
        class="context-menu-overlay"
        @click="contextMenuVisible = false"
        @contextmenu.prevent="contextMenuVisible = false"
      />
    </Teleport>

    <VueFlow
      data-id="flow-container"
      :nodes="nodes"
      :edges="edges"
      :connection-radius="30"
      :max-zoom="10"
      :delete-key-code="null"
      @node-drag-stop="onNodeDragStop"
      @connect="onConnect"
      @node-click="onNodeClick"
    >
      <template #node-canvas="nodeProps">
        <Node v-bind="nodeProps" @show-nodes-popover="onShowNodesPopover" />
      </template>
      <template #edge-canvas="edge">
        <CanvasEdge
          v-bind="edge"
          :hovered="edgesHoveredById[edge.id]"
          :connected-node-is-hovering="
            nodesHoveredById[edge.source] || nodesHoveredById[edge.target]
          "
          @update:label:hovered="onUpdateEdgeLabelHovered(edge.id, $event)"
          @add="onClickConnectionAdd"
          @delete="onDeleteConnection"
          @show-nodes-popover="onShowNodesPopover"
        />
      </template>
      <template #connection-line="connectionLineProps">
        <CanvasConnectionLine v-bind="connectionLineProps" />
      </template>
      <Background class="bg-dataflow-canvas" />
    </VueFlow>
  </div>
</template>

<style scoped lang="scss">
.bg-dataflow-canvas {
  background-color: var(--color-dataflow-canvas-bg, #f2f4f7);
}

// Slide left transition for NodesPanel
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

// Fade transition for context menu
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
// Context menu styles (unscoped for Teleport)
.canvas-context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 160px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  user-select: none;

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-fill-color-light, #f5f7fa);
    }

    .el-icon {
      font-size: 16px;
      color: #666;
    }
  }
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2999;
}
</style>
