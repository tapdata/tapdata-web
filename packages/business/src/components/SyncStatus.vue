<template>
  <div>
    <div v-if="item" :class="['status-' + item.type]" class="inline-flex align-center gap-1">
      <VIcon class="flex-shirink-0">{{ typeIconMap[item.type] }}</VIcon>
      <span>
        {{ item.text }}
      </span>
    </div>
    <span v-else>-</span>
  </div>
</template>

<script>
import { dayjs } from '../shared'
import i18n from '@tap/i18n'
import { VIcon } from '@tap/component'

export default {
  name: 'SyncStatus',
  props: {
    status: String
  },
  components: { VIcon },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      typeIconMap: {
        info: 'exclamation-circle-filled',
        success: 'success-filled',
        primary: 'more-circle-filled'
      },
      STATUS_MAP: {
        task_init: {
          text: i18n.t('public_status_task_init'),
          type: 'info'
        },
        do_snapshot: {
          text: i18n.t('public_status_do_snapshot'),
          type: 'primary'
        },
        snapshot_completed: {
          text: i18n.t('public_status_snapshot_completed'),
          type: 'success'
        },
        do_cdc: {
          text: i18n.t('public_status_do_cdc'),
          type: 'primary'
        }
      },
      showErrorCause: false
    }
  },
  computed: {
    item() {
      return this.STATUS_MAP[this.status]
    }
  },

  methods: {
    onClickStatus() {
      let route
      if (this.isDaas) {
        route = {
          name: 'clusterManagement'
        }
      } else {
        route = {
          name: 'Instance',
          query: {
            keyword: this.agentInfo?.itemId
          }
        }
      }
      this.$router.push(route)
    },

    getNextStartTime() {
      try {
        if (!this.task.crontabExpression) return
        const interval = cronParse.parseExpression(this.task.crontabExpression)
        return this.$t('packages_business_task_status_next_run_time', {
          val: dayjs(interval.next()).format('YYYY-MM-DD HH:mm:ss')
        })
      } catch (err) {
        console.log('Error: ' + err.message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-info {
  color: #86909c;
}
.status-primary {
  color: #3b47e5;
}
.status-success {
  color: #00b42a;
}
</style>
