<script setup lang="ts">
import { refreshTaskSchema } from '@tap/api/src/core/task'
import { computed, inject, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDataflowStore } from '../stores/dataflow.store'
import DataCaptureDebug from './DataCaptureDebug.vue'
import DataValidationDialog from './DataValidationDialog.vue'

const emit = defineEmits<{
  showSettings: []
  save: []
  reset: []
  detail: []
  edit: []
  forceStop: []
  stop: []
  start: []
  'locate-node': [nodeId: string]
}>()

const route = useRoute()
const isViewer = computed(() => route.name === 'DataflowView')
const dataflow = inject<Ref<any>>('dataflow')!
const buttonShowMap = inject('buttonShowMap')
const stateIsReadonly = inject('stateIsReadonly')
const isSaving = inject('isSaving')
const dataflowStore = useDataflowStore()
const openValidation = ref(false)
const dataValidationDialog = ref()
const openDebug = ref(false)

// Node search
const showSearchPopover = ref(false)
const nodeSearchInput = ref('')

const nodeList = computed(() => {
  const allNodes = dataflowStore.dag.nodes || []
  if (nodeSearchInput.value) {
    const txt = nodeSearchInput.value.toLocaleLowerCase()
    return allNodes.filter((node: any) =>
      node.name?.toLocaleLowerCase().includes(txt),
    )
  }
  return allNodes
})

function handleClickNode(node: any) {
  showSearchPopover.value = false
  dataflowStore.selectNodeById(node.id)
  emit('locate-node', node.id)
}

const validateDataValidation = () => {
  return dataValidationDialog.value.validate()
}

const handleRefreshSchema = () => {
  if (dataflowStore.schemaRefreshing) return

  dataflowStore.schemaRefreshing = true

  refreshTaskSchema(dataflow.value.id).finally(() => {
    dataflowStore.schemaRefreshing = false
  })
}

const handleOpenValidation = () => {
  openValidation.value = true
}

defineExpose({
  validateDataValidation,
  handleOpenValidation,
})
</script>

<template>
  <div class="flex align-center gap-2" style="--btn-space: 0">
    <el-button
      v-show="dataflowStore.transformLoading"
      class="btn-shadow"
      loading
      plain
      >{{ $t('packages_dag_model_generation') }}</el-button
    >
    <div
      class="btn-shadow bg-card p-0.5 rounded-lg flex align-center gap-1.5 icon-btn-bar cursor-pointer"
      style="border: var(--el-border)"
    >
      <el-popover
        v-model:visible="showSearchPopover"
        width="auto"
        placement="bottom"
        trigger="click"
        popper-class="rounded-xl p-1"
        @after-leave="nodeSearchInput = ''"
      >
        <template #reference>
          <el-button text>
            <template #icon>
              <i-lucide-search />
            </template>
          </el-button>
        </template>
        <div class="p-1">
          <el-input
            v-model="nodeSearchInput"
            :placeholder="$t('packages_dag_search_node')"
            clearable
            autofocus
          />
        </div>

        <el-scrollbar max-height="240px" class="mt-1">
          <div
            v-for="(node, i) in nodeList"
            :key="i"
            class="choose-item ellipsis px-4 py-2 rounded-lg cursor-pointer"
            style="line-height: 20px"
            @click="handleClickNode(node)"
          >
            {{ node.name }}
          </div>
          <div
            v-if="!nodeList.length"
            class="text-center py-4 font-color-light"
          >
            {{ $t('public_data_no_data') }}
          </div>
        </el-scrollbar>
      </el-popover>
      <el-tooltip
        v-if="!dataflowStore.stateIsReadonly"
        :enterable="false"
        :hide-after="0"
        :content="$t('packages_dag_refresh_schema')"
      >
        <el-button
          text
          :loading="dataflowStore.schemaRefreshing"
          @click="handleRefreshSchema"
        >
          <template #icon>
            <VIcon>refresh</VIcon>
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip
        :enterable="false"
        :hide-after="0"
        :content="$t('public_data_capture')"
      >
        <el-button text @click="openDebug = true">
          <template #icon>
            <VIcon>bug-outlined</VIcon>
          </template>
        </el-button>
      </el-tooltip>
      <el-tooltip
        :enterable="false"
        :hide-after="0"
        :content="$t('public_data_validation')"
      >
        <el-button text @click="openValidation = true">
          <template #icon>
            <VIcon>data-scan</VIcon>
          </template>
        </el-button>
      </el-tooltip>
    </div>

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
    <ElButton
      v-if="
        dataflowStore.stateIsReadonly &&
        dataflow.btnDisabled &&
        !dataflow.btnDisabled.edit &&
        buttonShowMap.Edit
      "
      @click="$emit('edit')"
    >
      <VIcon class="mr-1">edit-outline</VIcon>
      {{ $t('public_button_edit') }}
    </ElButton>
    <ElButton
      v-if="!dataflowStore.stateIsReadonly && buttonShowMap.Edit"
      :loading="isSaving"
      :disabled="dataflow.btnDisabled?.edit"
      class="btn-shadow"
      @click="$emit('save')"
    >
      <template #icon>
        <i-lucide-save />
      </template>
      {{ $t('public_button_save') }}
    </ElButton>

    <ElButton
      v-if="!dataflow.btnDisabled?.reset && dataflowStore.buttonShowMap.Reset"
      class="btn-shadow"
      :class="{ 'btn--text': isViewer }"
      type="warning"
      @click="$emit('reset')"
    >
      <template #icon>
        <i-lucide-rotate-ccw />
      </template>
      {{ $t('public_button_reset') }}
    </ElButton>
    <template v-if="stateIsReadonly">
      <ElButton
        v-if="stateIsReadonly"
        class="btn--text btn-shadow"
        @click="$emit('detail')"
      >
        <VIcon>monitoring</VIcon>
        <!--运行监控-->
        {{ $t('packages_dag_task_list_button_monitor') }}
      </ElButton>
      <ElButton
        v-if="$route.name !== 'MigrateEditor' && buttonShowMap.Edit"
        class="btn--text btn-shadow"
        :disabled="dataflow.btnDisabled && dataflow.btnDisabled.edit"
        @click="$emit('edit')"
      >
        <VIcon class="mr-1">edit-outline</VIcon>{{ $t('public_button_edit') }}
      </ElButton>

      <ElButton
        v-if="dataflow.status === 'stopping' && buttonShowMap.Stop"
        class="btn--text btn-shadow"
        :disabled="dataflow.btnDisabled && dataflow.btnDisabled.forceStop"
        @click="$emit('forceStop')"
      >
        <VIcon>stop</VIcon>
        {{ $t('public_button_force_stop') }}
      </ElButton>
      <ElButton
        v-else-if="buttonShowMap.Stop"
        class="btn--text btn-shadow"
        :disabled="dataflow.btnDisabled?.stop"
        @click="$emit('stop')"
      >
        <VIcon>stop</VIcon>
        {{ $t('public_button_stop') }}
      </ElButton>
    </template>
    <ElButton
      v-if="!dataflow.btnDisabled?.start"
      class="btn-shadow"
      type="primary"
      @click="$emit('start')"
    >
      <template #icon>
        <i-lucide-play />
      </template>
      {{ $t('public_button_start') }}
    </ElButton>

    <ElButton
      v-if="dataflow.status === 'stopping' && buttonShowMap.Stop"
      :disabled="dataflow.buttonDisabled && dataflow.btnDisabled.forceStop"
      type="danger"
      @click="$emit('forceStop')"
    >
      {{ $t('public_button_force_stop') }}
    </ElButton>
    <ElButton
      v-else-if="!dataflow.btnDisabled?.stop && buttonShowMap.Stop"
      type="danger"
      @click="$emit('stop')"
    >
      {{ $t('public_button_stop') }}
    </ElButton>

    <DataValidationDialog
      ref="dataValidationDialog"
      v-model="openValidation"
      :task-id="dataflow.id"
      :sync-type="dataflow.syncType"
    />

    <DataCaptureDebug
      :task-id="dataflow.id"
      :visible="openDebug"
      @update:visible="openDebug = $event"
      @start="$emit('debugStart')"
    />
  </div>
</template>

<style scoped lang="scss">
.choose-item:hover {
  background-color: var(--el-fill-color-light);
}
.icon-btn-bar {
  :deep(.el-button.is-text) {
    // padding: 3px !important;
    font-size: 18px !important;
  }
}
</style>
