<script lang="ts" setup>
import { useDataflowStore } from '../stores/dataflow.store'
import NodePanel from './NodePanel.vue'

const dataflowStore = useDataflowStore()
</script>

<template>
  <div class="position-absolute end-0 top-14 bottom-3 z-10">
    <div class="position-relative pr-3 h-100">
      <!-- BasePanel -->
      <NodePanel
        v-if="dataflowStore.selectedNode"
        :node="dataflowStore.selectedNode.data"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
