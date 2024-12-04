<template>
  <ElDialog
    :title="$t('public_data_capture')"
    :visible="visible"
    @open="onOpen"
    @update:visible="$emit('update:visible', $event)"
    width="30%"
    :close-on-click-modal="false"
    :append-to-body="true"
  >
    <ElInput v-model="query" :placeholder="$t('public_data_capture_keywords_ph')"></ElInput>

    <template #footer>
      <ElButton @click="close">{{ $t('public_button_cancel') }}</ElButton>
      <ElButton :disabled="!query.trim()" :loading="loading" @click="start" type="primary">{{
        $t('public_button_start')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<script>
import { taskApi } from '@tap/api'

export default {
  name: 'DataCaptureDebug',
  props: {
    visible: Boolean,
    taskId: String
  },
  data() {
    return {
      query: '',
      loading: false
    }
  },
  methods: {
    onOpen() {
      this.query = ''
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
          intervalCeiling: 500,
          recordCeiling: 500,
          query: this.query
        })
        .finally(() => (this.loading = false))

      this.close()
      this.$emit('start')
    }
  }
}
</script>

<style scoped lang="scss"></style>
