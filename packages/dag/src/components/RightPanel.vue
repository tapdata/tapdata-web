<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core'
import { computed } from 'vue'
import NodePanel from './NodePanel.vue'

const { nodes } = useVueFlow()

const selectedNode = computed(() => {
  const currentNode = nodes.value.find((node) => node.selected)

  if (currentNode) {
    return {
      id: currentNode.id,
      type: currentNode.type,
      data: currentNode.data,
    }
  }
  return undefined
})
</script>

<template>
  <div class="position-absolute end-0 top-14 bottom-3 z-10">
    <div class="position-relative pr-3 h-100">
      <!-- BasePanel -->
      <NodePanel v-if="selectedNode" :node="selectedNode.data" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
