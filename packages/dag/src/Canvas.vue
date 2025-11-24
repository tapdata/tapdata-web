<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, watch } from 'vue'
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
const { viewport } = useVueFlow()

function onUpdateNodesPosition(events) {
  emit('update:nodes:position', events)
}

function onNodeDragStop(event) {
  onUpdateNodesPosition(
    event.nodes.map(({ id, position }) => ({ id, position })),
  )
}

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
      <template #node-canvas-node="nodeProps">
        <Node :data="nodeProps.data" />
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
