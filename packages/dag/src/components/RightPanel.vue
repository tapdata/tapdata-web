<script lang="ts" setup>
import { inject, type Ref } from 'vue'
import { useDataflowStore } from '../stores/dataflow.store'
import NodePanel from './NodePanel.vue'
import SettingsPanel from './SettingsPanel.vue'

const dataflowStore = useDataflowStore()
const dataflow = inject<Ref<any>>('dataflow')
</script>

<template>
  <div class="position-absolute end-0 top-14 bottom-3 z-30">
    <div class="position-relative pr-3 h-100">
      <!-- BasePanel -->
      <NodePanel
        v-if="dataflowStore.selectedNode"
        :node="dataflowStore.selectedNode"
      />

      <SettingsPanel v-if="dataflow.id" v-show="dataflowStore.showSettings" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
