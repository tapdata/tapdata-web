<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { VueFlow } from '@vue-flow/core'
import { inject } from 'vue'
import Node from './components/elements/CanvasNode.vue'
import { useCanvasMapping } from './composables/useCanvasMapping'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const dag = inject('dag')
const { nodes, edges } = useCanvasMapping(dag)

console.log('dag', nodes.value, nodes)
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <template #node-canvas-node="nodeProps">
      <Node :data="nodeProps.data" />
    </template>
    <Background class="bg-dataflow-canvas" />
  </VueFlow>
</template>

<style scoped lang="scss">
.bg-dataflow-canvas {
  background-color: var(--color-dataflow-canvas-bg, #f2f4f7);
}
</style>
