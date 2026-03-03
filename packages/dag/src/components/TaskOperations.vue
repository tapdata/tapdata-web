<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useDataflowStore } from '../stores/dataflow.store'

defineEmits<{
  showSettings: []
  save: []
  reset: []
  detail: []
  edit: []
  forceStop: []
  stop: []
  start: []
}>()

const route = useRoute()
const isViewer = computed(() => route.name === 'DataflowView')
const dataflow = inject('dataflow')
const buttonShowMap = inject('buttonShowMap')
const stateIsReadonly = inject('stateIsReadonly')
const isSaving = inject('isSaving')
const dataflowStore = useDataflowStore()
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
        :disabled="dataflow.disabledData && dataflow.disabledData.edit"
        @click="$emit('edit')"
      >
        <VIcon class="mr-1">edit-outline</VIcon>{{ $t('public_button_edit') }}
      </ElButton>

      <ElButton
        v-if="dataflow.status === 'stopping' && buttonShowMap.Stop"
        class="btn--text btn-shadow"
        :disabled="dataflow.disabledData && dataflow.disabledData.forceStop"
        @click="$emit('forceStop')"
      >
        <VIcon>stop</VIcon>
        {{ $t('public_button_force_stop') }}
      </ElButton>
      <ElButton
        v-else-if="buttonShowMap.Stop"
        class="btn--text btn-shadow"
        :disabled="dataflow.disabledData && dataflow.disabledData.stop"
        @click="$emit('stop')"
      >
        <VIcon>stop</VIcon>
        {{ $t('public_button_stop') }}
      </ElButton>
    </template>
    <ElButton class="btn-shadow" type="primary" @click="$emit('start')">
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
  </div>
</template>
