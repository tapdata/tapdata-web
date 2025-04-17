<script>
import Time from '@tap/shared/src/time'

import cronParse from 'cron-parser'
import { dayjs, STATUS_MAP } from '../shared'

export default {
  name: 'TaskStatus',
  props: {
    task: Object,
    agentMap: Object,
    errorCause: String,
    reverse: Boolean,
  },
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      STATUS_MAP,
      showErrorCause: false,
    }
  },
  computed: {
    show() {
      return this.task.status in this.STATUS_MAP
    },

    pingTime() {
      const pingTime = this.task.pingTime
      if (
        this.task.status === 'running' &&
        pingTime &&
        Time.now() - this.task.pingTime > 5 * 60 * 1000
      ) {
        return dayjs(pingTime).from(Time.now(), true)
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
      const ifShow =
        task.status !== 'edit' &&
        task.type === 'initial_sync' &&
        task.crontabExpressionFlag &&
        task.crontabExpression
      if (!ifShow) return ifShow
      try {
        if (cronParse.parseExpression(this.task.crontabExpression).hasNext()) {
          return true
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Error: ${error.message}`)
      }
      return false
    },

    showRetrying() {
      const { functionRetryStatus, status } = this.task
      return status === 'running' && functionRetryStatus === 'Retrying'
    },

    taskRetryStartTimeTip() {
      return this.$t('packages_business_task_status_retrying_tooltip', {
        val: dayjs(this.task.taskRetryStartTime).format('YYYY-MM-DD HH:mm:ss'),
      })
    },
  },

  methods: {
    onClickStatus() {
      let route
      if (this.isDaas) {
        route = {
          name: 'clusterManagement',
        }
      } else {
        route = {
          name: 'Instance',
          query: {
            keyword: this.agentInfo?.itemId,
          },
        }
      }
      this.$router.push(route)
    },

    getNextStartTime() {
      try {
        if (!this.task.crontabExpression) return
        const interval = cronParse.parseExpression(this.task.crontabExpression)
        return this.$t('packages_business_task_status_next_run_time', {
          val: dayjs(interval.next()).format('YYYY-MM-DD HH:mm:ss'),
        })
      } catch (error) {
        console.log(`Error: ${error.message}`)
      }
    },
  },
}
</script>

<template>
  <div
    class="inline-flex align-center gap-2"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <span
      v-if="show"
      class="task-status-block"
      :class="[`task-status-${task.status}`]"
    >
      {{ $t(STATUS_MAP[task.status].i18n) }}
    </span>
    <ElTooltip v-if="showCronTip" placement="top">
      <VIcon size="16" :color="task.crontabScheduleMsg ? '#F3961A' : '#008b58'"
        >task-process</VIcon
      >
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
        <VIcon size="16" class="color-warning ssss">warning</VIcon>
        <template #content>
          <span class="font-color-dark">
            {{
              $t('packages_business_task_status_agent_tooltip_time', {
                time: pingTime,
              })
            }}<template v-if="agentStatus"
              >，{{ $t('packages_business_task_status_agent_tooltip_agent') }}：
              <ElLink class="align-top" type="primary" @click="onClickStatus">{{
                agentStatus
              }}</ElLink></template
            >
          </span>
        </template>
      </ElTooltip>
    </template>
    <template v-if="task.shareCdcStop && !task.restartFlag">
      <ElTooltip
        placement="top"
        popper-class="agent-tooltip__popper"
        :visible-arrow="false"
        effect="light"
      >
        <VIcon size="16" class="color-warning">warning</VIcon>
        <template #content>
          <div class="font-color-dark">{{ task.shareCdcStopMessage }}</div>
        </template>
      </ElTooltip>
    </template>
    <!--错误解读-->
    <template v-if="errorCause && task.status === 'error'">
      <VIcon size="16" class="color-danger" @click="showErrorCause = true"
        >question-circle</VIcon
      >
      <ElDialog
        v-model="showErrorCause"
        append-to-body
        :title="$t('public_task_reasons_for_error')"
      >
        <div class="p-4 rounded-4 bg-subtle text-preline font-color-dark">
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
        effect="light"
      >
        <VIcon size="16" class="color-warning">warning</VIcon>
        <template #content>
          <span class="font-color-dark">
            {{ taskRetryStartTimeTip }}
          </span>
        </template>
      </ElTooltip>
    </template>
  </div>
</template>

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
.task-status-error,
.task-status-deleting,
.task-status-delete_failed,
.task-status-deleted {
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
  box-shadow:
    0px 4px 10px 0px rgba(0, 0, 0, 0.1),
    0px 4px 10px 0px rgba(0, 0, 0, 0.1);
}
</style>
