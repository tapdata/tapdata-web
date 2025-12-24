<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from './Canvas.vue'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const route = useRoute()

const {
  dag,
  dataflow,
  buttonShowMap,
  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onClickConnectionAdd,
  onUpdateNodesPosition,
  onClickNode,
} = useCanvasOperation()

const isInitialized = ref(false)

const init = async () => {
  await initNodeType()
  await dataflowStore.initPdkProperties()
  await dataflowStore.fetchDataflow(route.params.id as string)

  isInitialized.value = true
}

watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
  if (isInitialized.value) {
    dataflowStore.patchDataflow()
  }
})

init()

provide('dag', dag)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
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
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations />
    </div>
    <Canvas
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @click:connection:add="onClickConnectionAdd"
      @click:node="onClickNode"
    />
  </div>
</template>

<style scoped lang="scss">
.header {
  top: 28px;
}
:deep(.btn-shadow) {
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(16, 24, 40, 0.05) 0px 1px 2px 0px;
}
</style>
