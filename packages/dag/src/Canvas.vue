<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, watch } from 'vue'
import Node from './components/elements/CanvasNode.vue'
import { useCanvasMapping } from './composables/useCanvasMapping'
import { useUiStore } from './stores/ui.store'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const uiStore = useUiStore()
const dag = inject('dag')
const { nodes, edges } = useCanvasMapping(dag)
const { viewport } = useVueFlow()

watch(
  () => viewport.value.zoom,
  (val) => {
    uiStore.zoom = val
  },
)
</script>

<template>
  <div id="node-canvas" class="position-relative w-100 h-100">
    <VueFlow :nodes="nodes" :edges="edges">
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
