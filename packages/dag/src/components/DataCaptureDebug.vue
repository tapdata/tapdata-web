<script>
import { taskApi } from '@tap/api'

export default {
  name: 'DataCaptureDebug',
  props: {
    visible: Boolean,
    taskId: String,
  },
  data() {
    return {
      form: {
        query: '',
        intervalCeiling: 500,
      },
      loading: false,
    }
  },
  methods: {
    onOpen() {
      Object.assign(this.form, {
        query: '',
        intervalCeiling: 500,
      })
      this.loading = false
    },
    close() {
      this.$emit('update:visible', false)
    },
    async start() {
      this.loading = true

      await taskApi
        .putLogSetting(this.taskId, {
          level: 'DEBUG',
          ...this.form,
        })
        .finally(() => (this.loading = false))

      this.close()
      this.$emit('start')
    },
  },
}
</script>

<template>
  <ElDialog
    :title="$t('public_data_capture')"
    :model-value="visible"
    width="30%"
    :close-on-click-modal="false"
    :append-to-body="true"
    @open="onOpen"
    @update:model-value="$emit('update:visible', $event)"
  >
    <ElForm label-width="120px" label-position="top">
      <ElFormItem prop="query" :label="$t('public_keywords')">
        <ElInput
          v-model="form.query"
          :placeholder="$t('public_data_capture_keywords_ph')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('packages_dag_components_log_kaiqishichangmiao')">
        <ElInput
          v-model="form.intervalCeiling"
          type="number"
          style="width: 275px"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="close">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton :loading="loading" type="primary" @click="start">{{
        $t('public_button_start')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss"></style>
