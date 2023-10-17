<template>
  <div class="inline-flex align-center gap-2" :class="{ 'flex-row-reverse': reverse }">
    <span v-if="show" class="task-status-block" :class="['task-status-' + task.status]">
      {{ $t(STATUS_MAP[task.status].i18n) }}
    </span>
    <ElTooltip v-if="showCronTip" placement="top">
      <VIcon size="16" :color="task.crontabScheduleMsg ? '#F3961A' : '#008b58'">task-process</VIcon>
      <template #content>
        {{ task.crontabScheduleMsg || getNextStartTime() }}
      </template>
    </ElTooltip>
    <!--心跳超时-->
    <template v-if="agentMap">
      <ElTooltip
        v-if="pingTime"
        placement="top"
        popper-class="agent-tooltip__popper"
        :visible-arrow="false"
        effect="light"
      >
        <VIcon size="16" class="color-warning">warning</VIcon>
        <template #content>
          <div class="flex flex-wrap align-center font-color-dark">
            <VIcon size="16" class="mr-2 color-warning"> warning </VIcon>
            {{
              $t('packages_business_task_status_agent_tooltip_time', {
                time: pingTime
              })
            }}<template v-if="agentStatus"
              >，{{ $t('packages_business_task_status_agent_tooltip_agent') }}：
              <ElLink @click="onClickStatus" type="primary">{{ agentStatus }}</ElLink></template
            >
          </div>
        </template>
      </ElTooltip>
    </template>
    <template v-if="task.shareCdcStop">
      <ElTooltip placement="top" popper-class="agent-tooltip__popper" :visible-arrow="false" effect="light">
        <VIcon size="16" class="color-warning">warning</VIcon>
        <template #content>
          <div class="font-color-dark">{{ task.shareCdcStopMessage }}</div>
        </template>
      </ElTooltip>
    </template>
    <!--错误解读-->
    <template v-if="errorCause && task.status === 'error'">
      <VIcon @click="showErrorCause = true" size="16" class="color-danger">question-circle</VIcon>
      <ElDialog append-to-body :title="$t('public_task_reasons_for_error')" v-model:visible="showErrorCause">
        <div class="p-4 rounded-4 bg-subtle mt-n4 text-preline font-color-dark">
          {{ errorCause }}
        </div>
      </ElDialog>
    </template>
    <!--重试状态-->
    <template v-if="showRetrying">
      <ElTooltip
        key="retrying"
        placement="top"
        popper-class="agent-tooltip__popper"
        :visible-arrow="false"
        effect="light"
      >
        <VIcon size="16" class="color-warning">warning</VIcon>
        <template #content>
          <div class="flex flex-wrap align-center font-color-dark">
            <VIcon size="16" class="mr-2 color-warning"> warning </VIcon>
            {{ $t('packages_business_task_status_retrying_tooltip') }}
          </div>
        </template>
      </ElTooltip>
    </template>
  </div>
</template>

<script>
import cronParse from 'cron-parser'

import { dayjs, STATUS_MAP } from '../shared'
import Time from '@tap/shared/src/time'

export default {
  name: 'TaskStatus',
  props: {
    task: Object,
    agentMap: Object,
    errorCause: String,
    reverse: Boolean
  },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      STATUS_MAP,
      showErrorCause: false
    }
  },
  computed: {
    show() {
      return this.task.status in this.STATUS_MAP
    },

    pingTime() {
      const pingTime = this.task.pingTime
      if (this.task.status === 'running' && pingTime) {
        if (Time.now() - this.task.pingTime > 5 * 60 * 1000) {
          return dayjs(pingTime).from(Time.now(), true)
        }
      }
      return undefined
    },

    agentInfo() {
      return this.agentMap?.[this.task.agentId]
    },

    agentStatus() {
      const info = this.agentInfo
      return info ? `${info.name}（${info.status}）` : null
    },

    showCronTip() {
      const task = this.task
      let ifShow =
        task.status !== 'edit' && task.type === 'initial_sync' && task.crontabExpressionFlag && task.crontabExpression
      if (!ifShow) return ifShow
      try {
        if (cronParse.parseExpression(this.task.crontabExpression).hasNext()) {
          return true
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error: ' + err.message)
      }
      return false
    },

    showRetrying() {
      const { functionRetryStatus, taskRetryStatus } = this.task
      return functionRetryStatus === 'Retrying' || taskRetryStatus === 'Retrying'
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

<style lang="scss">
.task-status-block {
  display: inline-block;
  min-width: 72px;
  padding: 2px 8px;
  text-align: center;
  border-radius: 6px;
  box-sizing: border-box;
  word-break: keep-all;
  line-height: 22px;
}
.task-status-running {
  color: #178061;
  background-color: #c4f3cb;
}
.task-status-complete {
  color: #008b58;
  background-color: #b4edd8;
}
.task-status-renew_failed,
.task-status-error {
  color: #d44d4d;
  background-color: #ffecec;
}
.task-status-edit {
  color: #0083c7;
  background-color: #d1eefd;
}
.task-status-starting {
  color: #2c65ff;
  background-color: #ddebff;
}
.task-status-stop {
  color: #c88500;
  background-color: #ffe4ae;
}
.task-status-renewing,
.task-status-wait_start,
.task-status-stopping {
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
