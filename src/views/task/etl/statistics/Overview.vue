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
          {{ $t('task_info_expected') }}{{ info.label }}{{ $t('task_info_completed_time') }}：{{ completeTime }}
        </div>
      </div>
      <ElProgress :percentage="progressBar" :show-text="false"></ElProgress>
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
  data() {
    return {
      // progressBar: 0,
      // completeTime: ''
    }
  },
  computed: {
    progressBar() {
      const { source, success } = this.info
      let num = source ? (success / source) * 100 : 0
      if (num > 100) {
        num = 100
      }
      return num ? num.toFixed(2) * 1 : 0
    },
    completeTime() {
      const { source, success, start } = this.info
      const { progressBar, status } = this
      let result = ''
      if (['paused', 'error'].includes(status)) {
        result = this.$t('task_info_task_stopped')
      }
      if (progressBar === 100) {
        result = this.$t('task_info_fully_completed')
      }
      let runningTime = new Date().getTime() - new Date(start).getTime()
      let speed = runningTime ? success / runningTime : 0
      let time = speed ? (source - success) / speed / 1000 : 0
      if (!result && time) {
        let r = '',
          s = time,
          m = 0,
          h = 0,
          d = 0
        if (s > 60) {
          m = parseInt(s / 60)
          s = parseInt(s % 60)
          if (m > 60) {
            h = parseInt(m / 60)
            m = parseInt(m % 60)
            if (h > 24) {
              d = parseInt(h / 24)
              h = parseInt(h % 24)
            }
          }
        }
        if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
          r = 1 + this.$t('task_info_m')
        }
        if (m > 0) {
          r = parseInt(m) + this.$t('task_info_m')
        }
        if (h > 0) {
          r = parseInt(h) + this.$t('task_info_h') + r
        }
        if (d > 0) {
          r = parseInt(d) + this.$t('task_info_d') + r
        }
        result = r
      }
      return result
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
