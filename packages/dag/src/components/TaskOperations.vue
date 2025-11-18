<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const isViewer = computed(() => route.name === 'DataflowView')
const dataflow = inject('dataflow')
const buttonShowMap = inject('buttonShowMap')
const stateIsReadonly = inject('stateIsReadonly')
const isSaving = inject('isSaving')
</script>

<template>
  <div class="flex align-center gap-2" style="--btn-space: 0">
    <ElButton class="btn-shadow" @click="$emit('showSettings')">
      <VIcon class="mr-1">cog-o</VIcon>{{ $t('public_button_setting') }}
    </ElButton>
    <ElButton
      v-if="!stateIsReadonly && buttonShowMap.Edit"
      :loading="isSaving"
      :disabled="dataflow.disabledData && dataflow.disabledData.edit"
      class="btn-shadow"
      @click="$emit('save')"
    >
      <!--保存-->
      {{ $t('public_button_save') }}
    </ElButton>

    <ElButton
      v-if="
        dataflow.disabledData &&
        !dataflow.disabledData.reset &&
        buttonShowMap.Reset
      "
      class="btn-shadow"
      :class="{ 'btn--text': isViewer }"
      type="warning"
      @click="$emit('reset')"
    >
      <VIcon v-if="isViewer">reset</VIcon>
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
    <ElButton class="btn-shadow" type="primary">
      {{ $t('public_button_start') }}
    </ElButton>
  </div>
</template>
