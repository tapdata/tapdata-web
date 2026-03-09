<script setup lang="ts">
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import SkipError from '@tap/business/src/views/task/SkipError.vue'
import { TextEditable } from '@tap/component/src/base/text-editable'
import { useI18n } from '@tap/i18n'
import { nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Canvas from './Canvas.vue'
import ConsolePanel from './components/migration/ConsolePanel.vue'
import TaskOperations from './components/TaskOperations.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const store = useStore()
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'

const {
  dag,
  dataflow,
  buttonShowMap,
  formScope,
  isSaving,
  canvasRef,
  consoleRef,
  skipErrorRef,
  taskOperationsRef,
  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onAddNode,
  onMoveNodePosition,
  onClickConnectionAdd,
  onUpdateNodesPosition,
  onClickNode,
  handleSave,
  handleReset,
  handleStart,
  onNameInputChange,
  initWS,
  startTask,
  previewData,
  previewLoading,
  handlePreview,
  handleStop,
  handleForceStop,
  handlePageReturn,
} = useCanvasOperation()

const isInitialized = ref(false)

const init = async () => {
  dataflowStore.$reset()
  const taskId = route.params.id as string
  await dataflowStore.initPdkProperties()

  if (taskId) {
    await dataflowStore.fetchDataflow(taskId)
    await initNodeType(dataflowStore.dataflow.syncType)
    nextTick(() => {
      setTimeout(() => {
        canvasRef.value.fitViewWithOffset({ duration: 0, maxZoom: 1 })
      }, 0)
    })
  } else {
    let syncType
    let targetRoute

    if (route.name === 'DataflowNew') {
      syncType = 'sync'
      targetRoute = 'DataflowEditor'
    } else if (route.name === 'MigrateCreate') {
      syncType = 'migrate'
      targetRoute = 'MigrateEditor'
    }
    await initNodeType(syncType!)
    await dataflowStore.createDataflow(syncType)
    router.push({
      name: targetRoute,
      params: {
        id: dataflowStore.dataflow.id,
      },
    })
  }

  initWS()
  isInitialized.value = true
}

watch([() => dag.value.nodes.length, () => dag.value.edges.length], () => {
  if (isInitialized.value) {
    dataflowStore.patchDataflowDebounce()
  }
})

watch(
  () => dataflow.value.status,
  (v) => {
    // if (dataflow.value.btnDisabled?.edit) {
    //   dataflowStore.stateIsReadonly = true
    // } else {
    //   dataflowStore.stateIsReadonly = false
    // }

    if (v === 'starting' || v === 'running') {
      const routeName =
        dataflow.value.syncType === 'sync' ? 'TaskMonitor' : 'MigrationMonitor'
      router.push({
        name: routeName,
        params: {
          id: dataflow.value.id,
        },
      })
    }

    // if (
    //   ['DataflowViewer'].includes(this.$route.name) &&
    //   ['renewing'].includes(v)
    // ) {
    //   this.handleConsoleAutoLoad()
    // }
  },
)

init()

// Control NodesPanel visibility
const nodesPanelExpanded = ref(true)

const toggleExpandNodes = () => {
  nodesPanelExpanded.value = !nodesPanelExpanded.value
}

onBeforeUnmount(() => {
  dataflowStore.$reset()
})

provide('dag', dag)
provide('nodesPanelExpanded', nodesPanelExpanded)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
provide('onNameInputChange', onNameInputChange)
provide('formScope', formScope)
provide('isSaving', isSaving)
provide('previewData', previewData)
provide('previewLoading', previewLoading)
provide('handlePreview', handlePreview)
</script>

<template>
  <div
    id="dataflow-container"
    class="w-100 h-100 position-relative overflow-hidden"
  >
    <div
      class="task-detail position-absolute top-3 start-3 z-10 bg-card rounded-xl flex p-2 align-center gap-2 shadow-canvas"
    >
      <el-button text @click="handlePageReturn">
        <template #icon>
          <i-lucide-chevron-left />
        </template>
      </el-button>
      <el-divider direction="vertical" class="mx-0" />
      <div>
        <TextEditable
          v-model:value="dataflowStore.dataflowName"
          class="overflow-hidden"
          :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
          :maxlength="200"
          hidden-icon
          @change="onNameInputChange"
        />
      </div>
      <TaskStatus class="w-auto rounded-lg zoom-xs" :task="dataflow" />
      <el-button
        text
        :type="nodesPanelExpanded ? 'primary' : undefined"
        :bg="nodesPanelExpanded"
        @click="toggleExpandNodes"
      >
        <template #icon>
          <VIcon
            style="transition: none"
            :style="{
              transform: `scaleX(${!nodesPanelExpanded ? -1 : 1})`,
            }"
            >expand-list</VIcon
          >
        </template>
      </el-button>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <TaskOperations
        v-if="dataflow.id"
        ref="taskOperationsRef"
        @save="handleSave"
        @reset="handleReset"
        @start="handleStart"
        @stop="handleStop"
        @force-stop="handleForceStop"
        @locate-node="(id) => canvasRef?.locateNode(id)"
        @debug-start="handleStart(true)"
      />
    </div>
    <Canvas
      ref="canvasRef"
      @preview="handlePreview"
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:connection:add="onClickConnectionAdd"
      @click:node="onClickNode"
    >
      <template #bottom>
        <ConsolePanel ref="consoleRef" />
      </template>
    </Canvas>

    <SkipError ref="skipErrorRef" @skip="startTask" />
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
.task-detail {
  :deep(.task-status-block) {
    min-width: unset;
  }
}
</style>
