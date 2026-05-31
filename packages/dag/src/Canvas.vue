<script setup lang="ts">
import { useDeviceSupport } from '@tap/shared/src/composables/useDeviceSupport'
import { isOutsideSelected } from '@tap/shared/src/dom'
import { Background } from '@vue-flow/background'
import {
  SelectionMode,
  useVueFlow,
  VueFlow,
  type Connection,
  type GraphNode,
  type NodeChange,
  type OnConnectStartParams,
} from '@vue-flow/core'
import { useDark } from '@vueuse/core'
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
import HelperLines from './components/elements/HelperLines.vue'
import NodesPopover from './components/elements/NodesPopover.vue'
import NodesPanel from './components/NodesPanel.vue'
import RightPanel from './components/RightPanel.vue'
import { useCanvasMapping } from './composables/useCanvasMapping'
import { useHistory } from './composables/useHistory'
import { useKeybindings, type KeyMap } from './composables/useKeybindings'
import { useLayout } from './composables/useLayout'
import { useDataflowStore } from './stores/dataflow.store'
import { useUiStore } from './stores/ui.store'
import { getHelperLines, getHelperLinesForPosition } from './utils/helperLines'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const dark = useDark()

const emit = defineEmits<{
  'update:nodes:position': [events: any[]]
  'create:connection': [connection: any]
  'delete:connection': [connection: any]
  'delete:node': [node: any]
  'delete:nodes': [nodes: any[]]
  'copy:nodes': [nodes: any[]]
  'add:node': [node: any]
  'move:node:position': [id: string, newPosition: [number, number]]
  'click:connection:add': [connection: any]
}>()

const props = withDefaults(
  defineProps<{
    hideLeft?: boolean
    keyBindings?: boolean
  }>(),
  {
    keyBindings: true,
  },
)

const uiStore = useUiStore()
const dataflowStore = useDataflowStore()
const { controlKeyText } = useDeviceSupport()
const dag = inject('dag')
const nodesPanelExpanded = inject<Ref<boolean>>('nodesPanelExpanded', ref(true))
const isInitialized = inject<Ref<boolean>>('isInitialized')

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

const helperLineHorizontal = ref<number | undefined>(undefined)
const helperLineVertical = ref<number | undefined>(undefined)

function updateHelperLines(changes: NodeChange[], nodes: GraphNode[]) {
  helperLineHorizontal.value = undefined
  helperLineVertical.value = undefined

  if (
    changes.length === 1 &&
    changes[0].type === 'position' &&
    changes[0].dragging &&
    changes[0].position
  ) {
    const helperLines = getHelperLines(changes[0], nodes)

    // if we have a helper line, we snap the node to the helper line position
    // this is being done by manipulating the node position inside the change object
    changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x
    changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y

    // if helper lines are returned, we set them so that they can be displayed
    helperLineHorizontal.value = helperLines.horizontal
    helperLineVertical.value = helperLines.vertical
  }

  return changes
}

function onNodesChange(changes: NodeChange[]) {
  if (dataflowStore.stateIsReadonly) return
  updateHelperLines(changes, getNodes.value)
}

function emitWithSelectedNodes(emitFn: (node: any[]) => void) {
  return () => {
    // 优先使用 VueFlow 框选的节点，否则使用 store 中单击选中的节点
    const vueFlowSelected = getSelectedNodes.value
    const nodesToDelete = vueFlowSelected
      .map((graphNode) => graphNode.data)
      .filter(Boolean)

    if (nodesToDelete.length) {
      // 多节点批量删除，作为一个整体记录到 undo 历史
      emitFn(nodesToDelete)
    } else if (dataflowStore.selectedNode) emitFn([dataflowStore.selectedNode])
  }
}

// History (Undo/Redo) controls
const {
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  setupKeyboardShortcuts,
  cleanupKeyboardShortcuts,
} = useHistory()
const disableKeyBindings = computed(() => !props.keyBindings)
const keyMap = computed(() => {
  const readOnlyKeymap: KeyMap = {
    ctrl_c: {
      disabled: () => isOutsideSelected(viewportRef.value),
      run: emitWithSelectedNodes((nodes) => emit('copy:nodes', nodes)),
    },
    ctrl_a: () => {
      nodesSelectionActive.value = true
      addSelectedNodes(graphNodes.value)
    },
    'shift_+|+|=|shift_Equal|Equal': () => handleZoomIn(),
    'shift+_|-|_|shift_Minus|Minus': () => handleZoomOut(),
    0: () => handleZoomReset(),
    1: () => handleFitView(),
  }

  if (dataflowStore.stateIsReadonly) return readOnlyKeymap

  const fullKeymap: KeyMap = {
    ...readOnlyKeymap,
    // ctrl_x: emitWithSelectedNodes((ids) => emit('cut:nodes', ids)),
    'delete|backspace': emitWithSelectedNodes((nodes) =>
      emit('delete:nodes', nodes),
    ),
    ctrl_d: emitWithSelectedNodes((ids) => emit('duplicate:nodes', ids)),
  }
  return fullKeymap
})

useKeybindings(keyMap, { disabled: disableKeyBindings })

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
    updateNode(id, { position })
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
const vueFlow = useVueFlow()
const {
  viewportRef,
  viewport,
  nodes: graphNodes,
  nodesSelectionActive,
  zoomTo,
  updateNode,
  onEdgeMouseLeave,
  onEdgeMouseEnter,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onPaneContextMenu,
  screenToFlowCoordinate,
  addSelectedNodes,
  removeSelectedNodes,
  getNodes,
  getSelectedNodes,
} = vueFlow

// Zoom controls
const ZOOM_STEP = 0.1
const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 2]

const zoomPercentage = computed(() => Math.round(viewport.value.zoom * 100))
const previousZoom = ref(1)
const showZoomDropdown = ref(false)

// Zoom preset shortcut hints
const presetShortcuts: Record<number, string> = { 1: '0' }
const fitViewShortcut = computed(() => `${controlKeyText.value} 1`)

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

// Empty state detection
const isCanvasEmpty = computed(
  () =>
    !nodes.value.length &&
    !dataflowStore.stateIsReadonly &&
    !dataflowStore.taskLoading &&
    !showPopover.value,
)

// Virtual element anchored at canvas center (stable position, won't drift)
const virtualCanvasCenterTarget = computed(() => {
  const container = viewportRef.value
  const rect = container?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  // Place at ~20% from top so the popover has room to expand downward
  const y = rect ? rect.top + rect.height * 0.2 : window.innerHeight * 0.2
  return {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: y,
      left: x,
      right: x,
      bottom: y,
      x,
      y,
      toJSON() {
        return this
      },
    }),
  } as HTMLElement
})

async function onAddNodeFromEmptyState() {
  // Calculate canvas center in flow coordinates for node placement
  const container = viewportRef.value
  const rect = container?.getBoundingClientRect()
  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
  const flowPosition = screenToFlowCoordinate({ x: centerX, y: centerY })

  addNodeParams.value = { flowPosition }
  showPopover.value = false
  await nextTick()
  popoverTarget.value = virtualCanvasCenterTarget.value
  popoverTargetKey.value = 'empty_state'
  await nextTick()
  setTimeout(() => {
    showPopover.value = true
  }, 50)
}

// Context menu position for right-click popover
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
  if (popoverTargetKey.value === 'empty_state') {
    return 'bottom'
  }
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
const connectingHandle = ref<OnConnectStartParams>()
const connectedHandle = ref<Connection>()

function onConnectStart(params: { event?: MouseEvent } & OnConnectStartParams) {
  connectingHandle.value = params
  connectionCreated.value = false
}

function onConnect(connection: Connection) {
  emit('create:connection', connection)

  connectedHandle.value = connection
  connectionCreated.value = true
}

// 在节点本体（非 Handle）上松开连线时，仍尝试建立连接
function onConnectEnd(event?: MouseEvent | TouchEvent) {
  const start = connectingHandle.value
  connectingHandle.value = undefined

  // 已命中 Handle 完成连线，或缺少起始节点/事件信息，无需补充处理
  if (connectionCreated.value || !start?.nodeId || !event) return

  const point = 'changedTouches' in event ? event.changedTouches[0] : event
  if (!point) return

  const el = document.elementFromPoint(point.clientX, point.clientY)
  const targetNodeId = el?.closest('.vue-flow__node')?.getAttribute('data-id')
  if (!targetNodeId || targetNodeId === start.nodeId) return

  // 根据起始 Handle 类型确定连线方向：target 起始则落点节点为 source，反之为 target
  const connection =
    start.handleType === 'target'
      ? { source: targetNodeId, target: start.nodeId }
      : { source: start.nodeId, target: targetNodeId }

  if (!dataflowStore.isValidConnection(connection as any)) return

  emit('create:connection', {
    ...connection,
    sourceHandle: null,
    targetHandle: null,
  })
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
  // 记录最后点击位置（flow 坐标），用于粘贴节点定位
  if (node.position) {
    dataflowStore.lastClickPosition = [node.position.x, node.position.y]
  }
  emit('click:node', node)
}

function clearTextSelection() {
  window.getSelection()?.removeAllRanges()
}

function onPaneClick(event: MouseEvent) {
  const pos = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  dataflowStore.lastClickPosition = [pos.x, pos.y]
  dataflowStore.selectNode(null)
}

function onSelectionEnd(event: MouseEvent) {
  const pos = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  dataflowStore.lastClickPosition = [pos.x, pos.y]
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

// Right-click directly shows NodesPopover with activeTab = 0
onPaneContextMenu((event) => {
  event.preventDefault()
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  const flowPosition = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  })
  // Use the virtual element as the popover target
  addNodeParams.value = {
    flowPosition, // Pass the converted flow coordinates
  }

  popoverTarget.value = virtualContextMenuTarget.value
  popoverTargetKey.value = 'context_menu'
  popoverRef.value?.setActiveTab(0)

  showPopover.value = true
  // setTimeout(() => {
  //   showPopover.value = true
  //   nextTick(() => {
  //     popoverRef.value?.setActiveTab(0)
  //   })
  // }, 50)
})

function handleLayoutGraph() {
  const layoutedNodes = layout(nodes.value, edges.value, 'LR')

  // Update node positions in the store
  const positionUpdates = layoutedNodes.map((node) => ({
    id: node.id,
    position: node.position,
  }))

  emit('update:nodes:position', positionUpdates)

  nextTick(() => {
    fitViewWithOffset({
      duration: 0,
      maxZoom: 1,
      padding: {
        top: '48px',
        bottom: 0,
      },
    })
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

// Expose helper-line updaters so that NodesPanel drag can show guide lines
provide(
  'updateDragHelperLines',
  (
    position: { x: number; y: number },
    dimensions: { width: number; height: number },
  ) => {
    const lines = getHelperLinesForPosition(
      position,
      dimensions,
      getNodes.value,
    )
    helperLineHorizontal.value = lines.horizontal
    helperLineVertical.value = lines.vertical
    // 返回吸附位置（flow 坐标），供拖拽元素对齐到引导线
    return lines.snapPosition
  },
)
provide('clearDragHelperLines', () => {
  helperLineHorizontal.value = undefined
  helperLineVertical.value = undefined
})

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

/**
 * 确保指定节点在视野内（不改变缩放，仅在节点不可见时平移）
 */
function ensureNodesVisible(nodeIds: string[]) {
  if (!nodeIds.length) return
  const existingIds = nodeIds.filter((id) => vueFlow.findNode(id))
  if (!existingIds.length) return
  vueFlow.fitView({
    nodes: existingIds,
    duration: 200,
    maxZoom: viewport.value.zoom, // 不放大，保持当前缩放
    padding: 0.2,
  })
}

/**
 * 选中指定节点（先清除已有选中）
 */
function selectNodes(nodeIds: string[]) {
  if (!nodeIds.length) return
  removeSelectedNodes(getNodes.value)
  addSelectedNodes(
    nodeIds.map((id) => vueFlow.findNode(id)).filter(Boolean) as GraphNode[],
  )
}

function onNodesInitialized() {
  if (isInitialized.value) return
  nextTick(() => {
    setTimeout(() => {
      if (dataflowStore.stateIsReadonly) {
        handleLayoutGraph()
      } else {
        fitViewWithOffset({ duration: 0, maxZoom: 1 })
      }
    }, 0)
  })
}

defineExpose({
  fitViewWithOffset,
  locateNode,
  ensureNodesVisible,
  selectNodes,
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

    <!-- Empty state overlay -->
    <Transition name="empty-state">
      <div v-if="isCanvasEmpty" class="canvas-empty-state">
        <div class="canvas-empty-state__icon">
          <el-icon :size="28" color="var(--el-color-primary)">
            <i-lucide-plus />
          </el-icon>
        </div>
        <h3 class="canvas-empty-state__title">
          {{ $t('packages_dag_canvas_empty_title') }}
        </h3>
        <p class="canvas-empty-state__desc">
          {{ $t('packages_dag_canvas_empty_desc') }}
        </p>
        <el-button type="primary" @click="onAddNodeFromEmptyState">
          <el-icon class="mr-1"><i-lucide-plus /></el-icon>
          {{ $t('packages_dag_canvas_add_node') }}
        </el-button>
        <p class="canvas-empty-state__hint">
          {{ $t('packages_dag_canvas_empty_hint') }}
        </p>
      </div>
    </Transition>

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
      class="bottom-bar position-absolute bottom-3 z-20 flex flex-column gap-2"
      :style="bottomBarStyle"
    >
      <div class="flex align-center justify-content-end gap-2">
        <div
          v-if="!dataflowStore.stateIsReadonly"
          class="bg-overlay shadow-canvas p-1 rounded-xl"
          style="--btn-space: 0"
        >
          <el-tooltip :enterable="false" :hide-after="0" placement="top">
            <template #content>
              <div class="inline-flex align-center gap-1">
                <div>{{ $t('packages_dag_undo') }}</div>
                <div class="color-white bg-white/15 p-1 px-1.5 lh-1 rounded-4">
                  {{ controlKeyText }} Z
                </div>
              </div>
            </template>
            <el-button text :disabled="!canUndo" @click="handleUndo">
              <template #icon>
                <i-lucide-undo-2 />
              </template>
            </el-button>
          </el-tooltip>
          <el-divider direction="vertical" class="mx-2" />
          <el-tooltip :enterable="false" :hide-after="0" placement="top">
            <template #content>
              <div class="inline-flex align-center gap-1">
                <div>{{ $t('packages_dag_redo') }}</div>
                <div class="color-white bg-white/15 p-1 px-1.5 lh-1 rounded-4">
                  {{ controlKeyText }} ⇧ Z
                </div>
              </div>
            </template>
            <el-button text :disabled="!canRedo" @click="handleRedo">
              <template #icon><i-lucide-redo-2 /></template>
            </el-button>
          </el-tooltip>
        </div>

        <div
          class="bg-overlay shadow-canvas p-1 rounded-xl flex align-items-stretch gap-0.5"
          style="--btn-space: 0"
        >
          <el-tooltip
            :content="$t('packages_dag_auto_layout')"
            :show-after="350"
            placement="top"
            ><el-button text @click="handleLayoutGraph"
              ><template #icon><VIcon>auto-layout</VIcon></template></el-button
            ></el-tooltip
          >
          <el-tooltip
            :content="$t('packages_dag_panning_mode')"
            :show-after="350"
            placement="top"
            ><el-button
              text
              :type="isInPanningMode ? 'primary' : undefined"
              :class="{ 'is-active': isInPanningMode }"
              @click="togglePanningMode"
              ><template #icon><i-mingcute-hand-line /></template></el-button
          ></el-tooltip>
          <el-divider class="mx-2 align-self-center" direction="vertical" />
          <el-tooltip :enterable="false" :hide-after="0" placement="top">
            <template #content>
              <div class="inline-flex align-center gap-1">
                <div>{{ $t('packages_dag_zoom_out') }}</div>
                <div class="color-white bg-white/15 p-1 px-1.5 lh-1 rounded-4">
                  -
                </div>
              </div>
            </template>
            <el-button text @click="handleZoomOut">
              <template #icon>
                <i-lucide-zoom-out />
              </template>
            </el-button>
          </el-tooltip>
          <el-tooltip
            :content="$t('packages_dag_zoom_reset')"
            :enterable="false"
            :hide-after="0"
            placement="top"
            :disabled="viewport.zoom === 1"
          >
            <el-button
              text
              class="zoom-percentage-btn"
              @click="handleZoomReset"
            >
              {{ zoomPercentage }}%
            </el-button>
          </el-tooltip>
          <el-popover
            v-model:visible="showZoomDropdown"
            trigger="click"
            popper-class="zoom-dropdown-popover"
            :width="145"
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
                <span
                  v-if="presetShortcuts[preset]"
                  class="zoom-dropdown-shortcut system-kbd fw-sub flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-capitalize bg-components-kbd-bg-gray"
                  >{{ presetShortcuts[preset] }}</span
                >
              </div>
              <div class="zoom-dropdown-divider" />
              <div class="zoom-dropdown-item" @click="handleFitView">
                {{ $t('packages_dag_canvas_fit_view') }}
                <span
                  class="zoom-dropdown-shortcut system-kbd fw-sub flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-capitalize bg-components-kbd-bg-gray"
                  >1</span
                >
              </div>
            </div>
          </el-popover>
          <el-tooltip :enterable="false" :hide-after="0" placement="top">
            <template #content>
              <div class="inline-flex align-center gap-1">
                <div>{{ $t('packages_dag_zoom_in') }}</div>
                <div class="color-white bg-white/15 p-1 px-1.5 lh-1 rounded-4">
                  +
                </div>
              </div>
            </template>
            <el-button text @click="handleZoomIn">
              <template #icon>
                <i-lucide-zoom-in />
              </template>
            </el-button>
          </el-tooltip>
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

    <VueFlow
      :class="{ dark }"
      data-id="flow-container"
      :nodes="nodes"
      :edges="edges"
      :connection-radius="30"
      :max-zoom="10"
      :delete-key-code="null"
      :selection-key-code="selectionKeyCode"
      :selection-mode="SelectionMode.Partial"
      :pan-on-scroll="!isInPanningMode"
      :panning-mouse-button="panningMouseButton"
      :pan-on-drag="isInPanningMode"
      :apply-changes="false"
      @mousedown="clearTextSelection"
      @node-drag-stop="onNodeDragStop"
      @connect-start="onConnectStart"
      @connect="onConnect"
      @connect-end="onConnectEnd"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @selection-end="onSelectionEnd"
      @nodes-change="onNodesChange"
      @nodes-initialized="onNodesInitialized"
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

      <HelperLines
        :horizontal="helperLineHorizontal"
        :vertical="helperLineVertical"
      />
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

// Empty state
.canvas-empty-state {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: var(--primary-hover-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    margin: 0 0 8px;
  }

  &__desc {
    font-size: 14px;
    color: var(--el-text-color-secondary, #909399);
    margin: 0 0 20px;
  }

  &__hint {
    font-size: 13px;
    color: var(--el-text-color-placeholder, #a8abb2);
    margin: 12px 0 0;
  }
}

// Empty state transition (fade + zoom)
.empty-state-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.empty-state-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.empty-state-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.empty-state-leave-to {
  opacity: 0;
  transform: scale(0.95);
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
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

  .zoom-dropdown-shortcut {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    white-space: nowrap;
  }

  .zoom-dropdown-divider {
    height: 1px;
    background-color: var(--el-border-color-lighter, #ebeef5);
    margin: 4px 0;
  }
}
</style>
