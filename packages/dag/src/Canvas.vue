<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  useTemplateRef,
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
import { useHistory } from './composables/useHistory'
import { useLayout } from './composables/useLayout'
import { useDataflowStore } from './stores/dataflow.store'
import { useUiStore } from './stores/ui.store'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const emit = defineEmits<{
  'update:nodes:position': [events: any[]]
  'create:connection': [connection: any]
  'delete:connection': [connection: any]
  'delete:node': [node: any]
  'add:node': [node: any]
  'move:node:position': [id: string, newPosition: [number, number]]
  'click:connection:add': [connection: any]
}>()

const props = defineProps<{
  hideLeft?: boolean
}>()

const uiStore = useUiStore()
const dataflowStore = useDataflowStore()
const dag = inject('dag')
const nodesPanelExpanded = inject<Ref<boolean>>('nodesPanelExpanded', ref(true))

// Bottom bar dynamic positioning
const RIGHT_PANEL_WIDTH = 600
const PANEL_MARGIN = 12

// Observe actual width of the left panel slot content
const leftPanelRef = useTemplateRef<HTMLElement>('leftPanel')
const leftPanelWidth = ref(0)

// Use MutationObserver + ResizeObserver to track the first visible child's width
let leftPanelResizeObserver: ResizeObserver | null = null

function observeLeftPanel() {
  if (!leftPanelRef.value) return
  // Find the first element child that has actual dimensions (position: absolute elements)
  const target =
    (leftPanelRef.value.querySelector(
      ':scope > *:not([style*="display: none"])',
    ) as HTMLElement) || (leftPanelRef.value.firstElementChild as HTMLElement)
  if (!target) {
    leftPanelWidth.value = 0
    return
  }
  leftPanelResizeObserver?.disconnect()
  leftPanelResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      leftPanelWidth.value =
        entry.contentRect.width +
        Number.parseFloat(getComputedStyle(entry.target).paddingLeft || '0') +
        Number.parseFloat(getComputedStyle(entry.target).paddingRight || '0')
    }
  })
  leftPanelResizeObserver.observe(target)
}

// Also observe DOM changes in the wrapper to handle slot content swaps
let leftPanelMutationObserver: MutationObserver | null = null

// Observe actual height of the bottom bar (toolbar + BottomPanel)
const bottomBarRef = useTemplateRef<HTMLElement>('bottomBar')
const bottomBarHeight = ref(0)
let bottomBarResizeObserver: ResizeObserver | null = null
console.log('bottomBarHeight', bottomBarHeight)

function observeBottomBar() {
  if (!bottomBarRef.value) return
  bottomBarResizeObserver?.disconnect()
  bottomBarResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      bottomBarHeight.value = entry.target.getBoundingClientRect().height
    }
  })
  bottomBarResizeObserver.observe(bottomBarRef.value)
}

const { layout, fitViewWithOffset } = useLayout({
  nodesPanelExpanded,
  nodesPanelWidth: leftPanelWidth,
  bottomPanelHeight: bottomBarHeight,
})

// History (Undo/Redo) controls
const {
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  setupKeyboardShortcuts,
  cleanupKeyboardShortcuts,
} = useHistory()

onMounted(() => {
  // Start observing the left panel slot content width
  if (!props.hideLeft) {
    observeLeftPanel()
    // Re-observe when slot content changes (e.g. component swap via v-if)
    if (leftPanelRef.value) {
      leftPanelMutationObserver = new MutationObserver(() => observeLeftPanel())
      leftPanelMutationObserver.observe(leftPanelRef.value, { childList: true })
    }
  }

  // Start observing the bottom bar height
  observeBottomBar()

  setupKeyboardShortcuts()
  // 注册 VueFlow 节点位置更新回调，用于 undo/redo 时同步 VueFlow 内部状态
  dataflowStore.registerVueFlowUpdateCallback((id, position) => {
    console.log(
      'VueFlow updateNode callback',
      id,
      position,
      'current zoom:',
      viewport.value.zoom,
    )
    updateNode(id, { position })
    console.log('VueFlow updateNode done, new zoom:', viewport.value.zoom)
  })
})

onUnmounted(() => {
  cleanupKeyboardShortcuts()
  dataflowStore.unregisterVueFlowUpdateCallback()
  leftPanelResizeObserver?.disconnect()
  leftPanelMutationObserver?.disconnect()
  bottomBarResizeObserver?.disconnect()
})

const bottomBarStyle = computed(() => {
  const left =
    leftPanelWidth.value > 0
      ? `${leftPanelWidth.value + 20}px`
      : `${PANEL_MARGIN}px`
  const right =
    dataflowStore.selectedNode || dataflowStore.showSettings
      ? `${RIGHT_PANEL_WIDTH + 20}px`
      : `${PANEL_MARGIN}px`
  return { left, right }
})
const { nodes, edges } = useCanvasMapping(dag)
console.log('nodes', nodes)
const vueFlow = useVueFlow()
const {
  viewport,
  zoomTo,
  updateNode,
  onEdgeMouseLeave,
  onEdgeMouseEnter,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneContextMenu,
  screenToFlowCoordinate,
} = vueFlow

// Zoom controls
const ZOOM_STEP = 0.1
const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 2]

const zoomPercentage = computed(() => Math.round(viewport.value.zoom * 100))
const previousZoom = ref(1)
const showZoomDropdown = ref(false)

// Panning mode controls
const isInPanningMode = ref(true)
const selectionKeyCode = ref<boolean | null | string>('Shift')
const panningMouseButton = ref<number[]>([0, 1])

function togglePanningMode() {
  if (isInPanningMode.value) {
    selectionKeyCode.value = true
    panningMouseButton.value = [1]
    isInPanningMode.value = false
  } else {
    selectionKeyCode.value = 'Shift'
    panningMouseButton.value = [0, 1]
    isInPanningMode.value = true
  }
}

function handleZoomOut() {
  const currentZoom = viewport.value.zoom
  const newZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP)
  zoomTo(newZoom, { duration: 200 })
}

function handleZoomIn() {
  const currentZoom = viewport.value.zoom
  const newZoom = Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP)
  zoomTo(newZoom, { duration: 200 })
}

function handleZoomReset() {
  const currentZoom = viewport.value.zoom
  if (Math.abs(currentZoom - 1) < 0.01) {
    // Already at 100%, restore previous zoom
    zoomTo(previousZoom.value, { duration: 200 })
  } else {
    // Save current zoom and reset to 100%
    previousZoom.value = currentZoom
    zoomTo(1, { duration: 200 })
  }
}

function handleZoomPreset(preset: number) {
  zoomTo(preset, { duration: 200 })
  showZoomDropdown.value = false
}

function handleFitView() {
  fitViewWithOffset({ duration: 200 })
  showZoomDropdown.value = false
}

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

function onCreateConnection(connection: any) {
  emit('create:connection', connection)
}

function onDeleteConnection(connection: any) {
  emit('delete:connection', connection)
}

function onDeleteNode(node: any) {
  emit('delete:node', node)
}

/**
 * 禁用/启用节点及其同链路上的关联节点
 */
function handleDisableNode(node: any, value = true) {
  node.disabled = value
  node.attrs.disabled = value

  const parents = findChainParents(node.id)
  const children = findChainChildren(node.id)
  const relatedNodes = parents.concat(children)

  relatedNodes.forEach((n) => {
    n.attrs.disabled = value
  })

  dataflowStore.patchDataflowDebounce()
}

/**
 * 查找单链路上的父节点（maxInputs === 1 且 $outputs.length <= 1）
 */
function findChainParents(id: string, excludeId?: string): any[] {
  const node = dataflowStore.findNodeById(id)
  const nodes: any[] = []
  const parentIds = node?.$inputs || []

  for (const parentId of parentIds) {
    if (parentId === excludeId) continue
    const parent = dataflowStore.findNodeById(parentId)
    if (
      !parent ||
      parent.__Ctor?.maxInputs !== 1 ||
      parent.$outputs?.length > 1
    )
      continue
    nodes.push(parent)
    if (parent.$inputs?.length) {
      nodes.push(...findChainParents(parentId))
    }
  }
  return nodes
}

/**
 * 查找单链路上的子节点
 */
function findChainChildren(id: string): any[] {
  const node = dataflowStore.findNodeById(id)
  const nodes: any[] = []
  const ids = node?.$outputs || []

  ids.forEach((childId: string) => {
    const child = dataflowStore.findNodeById(childId)
    if (!child) return
    if (child.type === 'join_processor') {
      nodes.push(...findChainParents(child.id, node.id))
    } else if (child.__Ctor?.maxInputs !== 1) return
    nodes.push(child)
    if (child.$outputs?.length) {
      nodes.push(...findChainChildren(childId))
    }
  })
  return nodes
}

function onAddNode(node: any) {
  emit('add:node', node)
}

function onMoveNodePosition(id: string, newPosition: [number, number]) {
  emit('move:node:position', id, newPosition)
}

function onNodeClick({ event, node }) {
  if (node.data?.hiddenMap?.setting) return
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

function handleLayoutGraph() {
  const layoutedNodes = layout(nodes.value, edges.value, 'LR')

  // Update node positions in the store
  const positionUpdates = layoutedNodes.map((node) => ({
    id: node.id,
    position: node.position,
  }))

  emit('update:nodes:position', positionUpdates)

  nextTick(() => {
    fitViewWithOffset({ duration: 200, maxZoom: 1 })
  })
}

// const hasInit = ref(false)
// function onInitialized() {
//   if (hasInit.value) return
//   console.log('fitViewWithOffset', bottomBarHeight.value)
//   fitViewWithOffset({ duration: 0, maxZoom: 1 })
//   hasInit.value = true
// }

provide('popoverTarget', popoverTarget)
provide('showPopover', showPopover)
provide('popoverTargetKey', popoverTargetKey)
provide('onDeleteNode', onDeleteNode)
provide('onAddNode', onAddNode)
provide('onCreateConnection', onCreateConnection)
provide('onDeleteConnection', onDeleteConnection)
provide('onMoveNodePosition', onMoveNodePosition)
provide('handleDisableNode', handleDisableNode)

function locateNode(nodeId: string) {
  const node = vueFlow.findNode(nodeId)
  if (!node) return
  vueFlow.fitView({
    nodes: [nodeId],
    duration: 300,
    maxZoom: 1,
    padding: 0.5,
  })
}

defineExpose({
  fitViewWithOffset,
  locateNode,
  handleLayoutGraph,
})
</script>

<template>
  <div id="node-canvas" class="position-relative w-100 h-100">
    <div v-if="!hideLeft" ref="leftPanel" class="left-panel-wrapper z-20">
      <slot name="left">
        <Transition name="slide-left">
          <NodesPanel v-if="nodesPanelExpanded" />
        </Transition>
      </slot>
    </div>

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

    <!-- bottom bar -->
    <div
      ref="bottomBar"
      class="bottom-bar position-absolute bottom-3 z-10 flex flex-column gap-2"
      :style="bottomBarStyle"
    >
      <div class="flex align-center justify-content-end gap-2">
        <div
          v-if="!dataflowStore.stateIsReadonly"
          class="bg-card shadow-canvas p-1 rounded-xl"
          style="--btn-space: 0"
        >
          <el-button text :disabled="!canUndo" @click="handleUndo">
            <template #icon>
              <i-lucide-undo-2 />
            </template>
          </el-button>
          <el-divider direction="vertical" class="mx-2" />
          <el-button text :disabled="!canRedo" @click="handleRedo">
            <template #icon>
              <i-lucide-redo-2 />
            </template>
          </el-button>
        </div>

        <div
          class="bg-card shadow-canvas p-1 rounded-xl flex align-items-stretch gap-0.5"
          style="--btn-space: 0"
        >
          <el-button text @click="handleLayoutGraph">
            <template #icon>
              <VIcon>auto-layout</VIcon>
            </template>
          </el-button>
          <el-button
            text
            :type="isInPanningMode ? 'primary' : undefined"
            :class="{ 'is-active': isInPanningMode }"
            @click="togglePanningMode"
          >
            <template #icon>
              <i-mingcute-hand-line />
            </template>
          </el-button>
          <el-divider class="mx-2 align-self-center" direction="vertical" />
          <el-button text @click="handleZoomOut">
            <template #icon>
              <i-lucide-zoom-out />
            </template>
          </el-button>
          <!-- 显示当前画布的缩放百分比，点击重置为 100%，再次点击再切换回去 -->
          <el-button text class="zoom-percentage-btn" @click="handleZoomReset">
            {{ zoomPercentage }}%
          </el-button>
          <el-popover
            v-model:visible="showZoomDropdown"
            :width="120"
            trigger="click"
            popper-class="zoom-dropdown-popover"
            :show-arrow="false"
            placement="top-end"
            :popper-options="{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            }"
          >
            <template #reference>
              <el-button class="px-0.5" text>
                <i-mingcute-down-fill />
              </el-button>
            </template>
            <div class="zoom-dropdown">
              <div
                v-for="preset in ZOOM_PRESETS"
                :key="preset"
                class="zoom-dropdown-item"
                :class="{
                  'is-active': Math.abs(viewport.zoom - preset) < 0.01,
                }"
                @click="handleZoomPreset(preset)"
              >
                {{ Math.round(preset * 100) }}%
              </div>
              <div class="zoom-dropdown-divider" />
              <div class="zoom-dropdown-item" @click="handleFitView">
                {{ $t('packages_dag_canvas_fit_view') }}
              </div>
            </div>
          </el-popover>
          <el-button text @click="handleZoomIn">
            <template #icon>
              <i-lucide-zoom-in />
            </template>
          </el-button>
        </div>
      </div>

      <slot name="bottom" />
    </div>

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
    <Teleport v-if="!dataflowStore.stateIsReadonly" to="body">
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
      :selection-key-code="selectionKeyCode"
      :pan-on-scroll="!isInPanningMode"
      :panning-mouse-button="panningMouseButton"
      :pan-on-drag="isInPanningMode"
      :apply-changes="false"
      @node-drag-stop="onNodeDragStop"
      @connect="onConnect"
      @node-click="onNodeClick"
    >
      <template #node-canvas="nodeProps">
        <slot name="node" v-bind="nodeProps">
          <Node v-bind="nodeProps" @show-nodes-popover="onShowNodesPopover" />
        </slot>
      </template>
      <template #edge-canvas="edge">
        <CanvasEdge
          v-bind="edge"
          :hovered="edgesHoveredById[edge.id]"
          :connected-node-is-hovering="
            nodesHoveredById[edge.source] || nodesHoveredById[edge.target]
          "
          @update:label:hovered="onUpdateEdgeLabelHovered(edge.id, $event)"
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
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  user-select: none;

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 8px;
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

.zoom-percentage-btn {
  width: 48px;
}

// Zoom dropdown styles
.zoom-dropdown-popover {
  padding: 4px !important;
  min-width: auto !important;
}

.zoom-dropdown {
  .zoom-dropdown-item {
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--el-fill-color-light, #f5f7fa);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }

  .zoom-dropdown-divider {
    height: 1px;
    background-color: var(--el-border-color-lighter, #ebeef5);
    margin: 4px 0;
  }
}
</style>
