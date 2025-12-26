<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, nextTick, provide, ref, watch } from 'vue'
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
const { nodes, edges } = useCanvasMapping(dag)
const vueFlow = useVueFlow()
const {
  viewport,
  onEdgeMouseLeave,
  onEdgeMouseEnter,
  onEdgeMouseMove,
  onNodeMouseEnter,
  onNodeMouseLeave,
} = vueFlow

const nodesHoveredById = ref<Record<string, boolean>>({})
const showPopover = ref(false)
const popoverRef = ref<InstanceType<typeof NodesPopover> | null>(null)
const popoverTarget = ref<HTMLElement | null>(null)
const popoverTargetKey = ref<string | null>(null)

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
  console.log('onHideNodesPopover')
  popoverTarget.value = null
  popoverTargetKey.value = null
}

provide('popoverTarget', popoverTarget)
provide('showPopover', showPopover)
provide('popoverTargetKey', popoverTargetKey)
</script>

<template>
  <div id="node-canvas" class="position-relative w-100 h-100">
    <NodesPanel />
    <RightPanel />
    <NodesPopover
      ref="popoverRef"
      v-model="showPopover"
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
</style>
