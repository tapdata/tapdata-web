<script setup lang="ts">
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { TextEditable } from '@tap/component/src/base/text-editable'
import { nextTick, onUnmounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import Canvas from './Canvas.vue'
import BottomPanel from './components/monitor/BottomPanel.vue'
import { useCanvasOperation } from './composables/useCanvasOperation'
import { useDataflowStore } from './stores/dataflow.store'

const dataflowStore = useDataflowStore()
const route = useRoute()

const alarmData = ref<any>(null)
const logTotals = ref<any[]>([])
const quota = ref({})
const taskRecord = ref({ total: 0, items: [] as any[] })
const canvasRef = ref<any>(null)

const {
  dataflow,
  dag,
  buttonShowMap,
  formScope,
  isSaving,
  syncTypeLabel,

  initNodeType,
  onCreateConnection,
  onDeleteConnection,
  onDeleteNode,
  onDeleteNodes,
  onAddNode,
  onMoveNodePosition,
  onUpdateNodesPosition,
  onClickNode,
  handleStart,
  onNameInputChange,
  handlePageReturn,
  handleOpenInspect,
} = useCanvasOperation()

const isInitialized = ref(false)

const init = async () => {
  dataflowStore.stateIsReadonly = true
  dataflowStore.showBottom = true
  const taskId = route.params.id as string
  const taskRecordId = route.query?.taskRecordId as string
  await dataflowStore.initPdkProperties()

  if (taskId) {
    await dataflowStore.fetchDataflow(taskId, taskRecordId)
    await initNodeType(dataflowStore.dataflow.syncType)
  }
  isInitialized.value = true

  nextTick(() => {
    setTimeout(() => {
      canvasRef.value.fitViewWithOffset({ duration: 0, maxZoom: 1 })
    }, 0)
  })
}

init()

onUnmounted(() => {
  dataflowStore.$reset()
})

provide('dag', dag)
provide('buttonShowMap', buttonShowMap)
provide('dataflow', dataflow)
provide('onNameInputChange', onNameInputChange)
provide('formScope', formScope)
provide('isSaving', isSaving)
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
      <el-divider class="mx-1" direction="vertical" />
      <span class="font-color-light text-xs">{{ syncTypeLabel }}</span>
    </div>
    <div class="w-100 h-0 position-absolute header z-10 flex align-center px-3">
      <div class="flex-1" />
      <ElButton
        class="btn-shadow"
        :type="dataflowStore.showSettings ? 'primary' : undefined"
        :plain="dataflowStore.showSettings"
        @click="dataflowStore.toggleShowSettings"
      >
        <template #icon>
          <i-lucide-settings />
        </template>
        {{ $t('public_button_setting') }}
      </ElButton>
    </div>

    <Canvas
      ref="canvasRef"
      hide-left
      @update:nodes:position="onUpdateNodesPosition"
      @create:connection="onCreateConnection"
      @delete:connection="onDeleteConnection"
      @delete:node="onDeleteNode"
      @delete:nodes="onDeleteNodes"
      @add:node="onAddNode"
      @move:node:position="onMoveNodePosition"
      @click:node="onClickNode"
    >
      <template #bottom>
        <div
          v-if="!dataflowStore.showBottom"
          class="position-absolute bg-card rounded-lg font-color-light p-1.5 shadow-canvas text-xs translate-middle-x start-50 top-1 cursor-pointer"
          @click="dataflowStore.showBottom = true"
        >
          {{ $t('packages_dag_monitor_bottompanel_renwujindu') }}
        </div>
        <BottomPanel
          v-if="dataflow.status && dataflowStore.showBottom"
          :dataflow="dataflow"
          :alarm-data="alarmData"
          :log-totals="logTotals"
          :task-record="taskRecord"
          :quota="quota"
          class="tabs-header__hidden"
          @open-inspect="handleOpenInspect"
          @start="handleStart(false, false)"
        />
      </template>
    </Canvas>
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

.monitor-info-bar {
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: var(--el-bg-color);
  padding: 6px 16px;
  border-radius: 10px;

  font-size: 13px;
  white-space: nowrap;
  color: var(--el-text-color-regular);

  &__agent {
    color: var(--el-text-color-primary);
  }

  &__metrics .fw-bold {
    color: var(--el-text-color-primary);
  }
}
</style>
