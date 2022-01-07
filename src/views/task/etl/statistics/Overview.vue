<template>
  <div class="overview-bar">
    <div class="mb-4 fs-7 font-color-main fw-bolder">{{ info.label }}{{ this.$t('task_info_overview') }}</div>
    <div class="overview-bar__content p-4">
      <div class="flex justify-content-between mb-2 font-color-main">
        <div>
          <span
            >{{ $t('task_info_plan') }}{{ info.label }}{{ $t('task_info_table_number') }} {{ info.source || 0 }}</span
          >
          <span class="ml-3"
            >{{ $t('task_info_completed') }}{{ info.label }}{{ $t('task_info_table_number') }}
            {{ info.success || 0 }}</span
          >
        </div>
        <div>
          {{ $t('task_info_expected') }}{{ info.label }}{{ $t('task_info_completed_time') }}：{{ info.completeTime }}
        </div>
      </div>
      <ElProgress :percentage="info.progressBar" :show-text="false"></ElProgress>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Overview',
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    status: {
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-bar__content {
  background: #fafafa;
  border-radius: 4px 4px 0 0;
}
</style>
