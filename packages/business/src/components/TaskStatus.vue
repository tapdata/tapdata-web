<template>
  <div class="inline-flex align-center">
    <span v-if="show" class="status-block" :class="['status-' + task.status]">
      {{ $t(STATUS_MAP[task.status].i18n) }}
    </span>
    <template v-if="agentMap">
      <ElTooltip
        v-if="pingTime"
        placement="top"
        popper-class="agent-tooltip__popper"
        :visible-arrow="false"
        effect="light"
      >
        <VIcon size="16" class="ml-2 color-warning">warning </VIcon>
        <template #content>
          <div class="flex flex-wrap align-center font-color-dark">
            <VIcon size="16" class="mr-2 color-warning"> warning </VIcon>
            {{
              $t('packages_business_task_status_agent_tooltip_time', {
                time: pingTime
              })
            }}，{{ $t('packages_business_task_status_agent_tooltip_agent') }}：
            <ElLink @click="onClickStatus" type="primary">{{ agentStatus }}</ElLink>
          </div>
        </template>
      </ElTooltip>
    </template>
  </div>
</template>

<script>
import { dayjs, STATUS_MAP } from '../shared'
import Time from '@tap/shared/src/time'

export default {
  name: 'TaskStatus',
  props: {
    task: Object,
    agentMap: Object
  },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      STATUS_MAP
    }
  },
  computed: {
    show() {
      return this.task.status in this.STATUS_MAP
    },

    pingTime() {
      const pingTime = this.task.pingTime
      if (this.task.status === 'running' && pingTime) {
        if (Date.now() - this.task.pingTime > 5 * 60 * 1000) {
          return dayjs(pingTime).from(Time.getTime(), true)
        }
      }
      return undefined
    },

    agentInfo() {
      return this.agentMap?.[this.task.agentId]
    },

    agentStatus() {
      const info = this.agentInfo
      return info ? `${info.name}（${info.status}）` : '-'
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
    }
  }
}
</script>

<style lang="scss" scoped>
.status-block {
  display: inline-block;
  min-width: 60px;
  padding: 3px 10px;
  text-align: center;
  font-weight: 500;
  border-radius: 4px;
  box-sizing: border-box;
}
.status-running {
  color: #178061;
  background-color: #c4f3cb;
}
.status-complete {
  color: #008b58;
  background-color: #b4edd8;
}
.status-error {
  color: #d44d4d;
  background-color: #ffecec;
}
.status-edit {
  color: #0083c7;
  background-color: #d1eefd;
}
.status-starting {
  color: #2c65ff;
  background-color: #ddebff;
}
.status-stop {
  color: #c88500;
  background-color: #ffe4ae;
}
.status-wait_start,
.status-stopping {
  color: #c39700;
  background-color: #fdf1c8;
}
</style>

<style>
.agent-tooltip__popper {
  border: none !important;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1), 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
}
</style>
