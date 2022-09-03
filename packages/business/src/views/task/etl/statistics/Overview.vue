<template>
  <div class="overview-bar">
    <div class="mb-4 fs-7 font-color-dark">{{ this.$t('packages_business_task_monitor_full_sync') }}</div>
    <div class="overview-bar__content p-4">
      <div class="flex justify-content-between mb-2 font-color-dark">
        <div>
          <span>{{ $t('packages_business_task_info_table_number') }} : {{ totalDataText }}</span>
          <span class="ml-3">{{ $t('packages_business_task_info_completed') }} : {{ info.finishNumber || 0 }}</span>
        </div>
        <div v-if="info.progress !== 100">{{ $t('packages_business_task_monitor_full_completion_time') }}：{{ finishDurationText }}</div>
        <div v-else>{{ $t('packages_business_task_info_fully_completed') }}</div>
      </div>
      <ElProgress color="#2C65FF" :percentage="info.progress" :show-text="false"></ElProgress>
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
  },
  computed: {
    totalDataText() {
      let num = this.info?.totalDataNum
      return num < 0 ? this.$t('packages_business_task_info_overView_status') : num || 0
    },
    finishDurationText() {
      let duration = this.info?.finishDuration
      return duration < 0 ? this.$t('packages_business_task_info_overView_status') : duration || 0
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-bar__content {
  background: map-get($bgColor, normal);
  border-radius: 4px 4px 0 0;
}
</style>
