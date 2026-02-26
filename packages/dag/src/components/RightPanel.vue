<script lang="ts" setup>
import { provide } from 'vue'
import { useFormScope } from '../composables/useFormScope'
import { useDataflowStore } from '../stores/dataflow.store'
import NodePanel from './NodePanel.vue'
import SettingsPanel from './SettingsPanel.vue'

const formScope = useFormScope()

const dataflowStore = useDataflowStore()

provide('formScope', formScope)
</script>

<template>
  <div class="position-absolute end-0 top-14 bottom-3 z-10">
    <div class="position-relative pr-3 h-100">
      <!-- BasePanel -->
      <NodePanel
        v-if="dataflowStore.selectedNode"
        :node="dataflowStore.selectedNode.data"
      />

      <SettingsPanel
        v-if="dataflowStore.dataflow.id"
        v-show="dataflowStore.showSettings"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
