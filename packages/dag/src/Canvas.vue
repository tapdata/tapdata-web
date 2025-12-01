<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, ref, watch } from 'vue'
import CanvasEdge from './components/elements/CanvasEdge.vue'
import Node from './components/elements/CanvasNode.vue'
import NodesPanel from './components/NodesPanel.vue'
import { useCanvasMapping } from './composables/useCanvasMapping'
import { useUiStore } from './stores/ui.store'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const emit = defineEmits(['update:nodes:position'])

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
  },
)
</script>

<template>
  <div id="node-canvas" class="position-relative w-100 h-100">
    <NodesPanel />

    <VueFlow
      data-id="flow-container"
      :nodes="nodes"
      :edges="edges"
      @node-drag-stop="onNodeDragStop"
    >
      <template #node-canvas="nodeProps">
        <Node :data="nodeProps.data" />
      </template>
      <template #edge-canvas="edge">
        <CanvasEdge
          :id="edge.id"
          :source-x="edge.sourceX"
          :source-y="edge.sourceY"
          :target-x="edge.targetX"
          :target-y="edge.targetY"
          :source-position="edge.sourcePosition"
          :target-position="edge.targetPosition"
          :marker-end="edge.markerEnd"
          :style="edge.style"
          :hovered="edgesHoveredById[edge.id]"
        />
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
