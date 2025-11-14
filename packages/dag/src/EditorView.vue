<script setup lang="ts">
import { computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from './Canvas.vue'
import NodesPanel from './components/NodesPanel.vue'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()

const route = useRoute()

const dag = computed(() => dataflowStore.dag)

onMounted(async () => {
  await dataflowStore.fetchDataflow(route.params.id as string)
})

provide('dag', dag)
</script>

<template>
  <div id="dataflow-container" class="w-100 h-100 position-relative">
    <div
      class="task-detail lh-8 position-absolute top-3 start-3 z-10 bg-card rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button text>
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <div>
        {{ dataflowStore.dataflow.name }}
      </div>
    </div>
    <NodesPanel />
    <Canvas />
  </div>
</template>

<style scoped lang="scss"></style>
