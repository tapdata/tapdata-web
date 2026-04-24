<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import cronParse from 'cron-parser'
import { ElLink } from 'element-plus'
import { computed, defineComponent, h, ref, type VNode } from 'vue'
import { useRouter } from 'vue-router'
import { dayjs, STATUS_MAP } from '../shared'

defineOptions({ name: 'TaskStatus' })

const props = defineProps<{
  task: Record<string, any>
  agentMap?: Record<string, any>
  errorCause?: string
  reverse?: boolean
}>()

const { t } = useI18n()
const router = useRouter()

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const showErrorCause = ref(false)

const show = computed(() => props.task.status in STATUS_MAP)

const pingTime = computed(() => {
  const pt = props.task.pingTime
  if (
    props.task.status === 'running' &&
    pt &&
    Time.now() - pt > 5 * 60 * 1000
  ) {
    return dayjs(pt).from(Time.now(), true)
  }
  return undefined
})

const agentInfo = computed(() => props.agentMap?.[props.task.agentId])

const agentStatus = computed(() => {
  const info = agentInfo.value
  return info ? `${info.name}（${info.status}）` : null
})

const showCronTip = computed(() => {
  const task = props.task
  const ifShow =
    task.status !== 'edit' &&
    task.type === 'initial_sync' &&
    task.crontabExpressionFlag &&
    task.crontabExpression
  if (!ifShow) return ifShow
  try {
    if (cronParse.parseExpression(task.crontabExpression).hasNext()) {
      return true
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
  }
  return false
})

const showRetrying = computed(() => {
  const { functionRetryStatus, status } = props.task
  return status === 'running' && functionRetryStatus === 'Retrying'
})

const taskRetryStartTimeTip = computed(() =>
  t('packages_business_task_status_retrying_tooltip', {
    val: dayjs(props.task.taskRetryStartTime).format('YYYY-MM-DD HH:mm:ss'),
  }),
)

interface Warning {
  key: string
  text: string | VNode
  type: 'warning' | 'danger'
  clickable?: boolean
}

const RenderContent = defineComponent({
  props: { content: { type: [String, Object], required: true } },
  render() {
    return this.content
  },
})

function navigateToAgent() {
  const route = isDaas
    ? { name: 'clusterManagement' }
    : { name: 'Instance', query: { keyword: agentInfo.value?.itemId } }
  router.push(route)
}

const warnings = computed<Warning[]>(() => {
  const list: Warning[] = []

  // 心跳超时
  if (props.agentMap && pingTime.value) {
    const timeText = t('packages_business_task_status_agent_tooltip_time', {
      time: pingTime.value,
    })
    const text = agentStatus.value
      ? h('span', [
          timeText,
          '，',
          t('packages_business_task_status_agent_tooltip_agent'),
          '：',
          h(
            ElLink,
            {
              type: 'primary',
              class: 'align-top',
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                navigateToAgent()
              },
            },
            () => agentStatus.value,
          ),
        ])
      : timeText
    list.push({ key: 'pingTime', text, type: 'warning' })
  }

  // 共享 CDC 停止
  if (props.task.shareCdcStop && !props.task.restartFlag) {
    list.push({
      key: 'shareCdc',
      text: props.task.shareCdcStopMessage,
      type: 'warning',
    })
  }

  // 错误解读
  if (props.errorCause && props.task.status === 'error') {
    list.push({
      key: 'errorCause',
      text: props.errorCause,
      type: 'danger',
      clickable: true,
    })
  }

  // 增量延迟告警
  if (
    props.task.taskIncrementDelay != null &&
    props.task.taskIncrementDelayThreshold != null
  ) {
    list.push({
      key: 'incrementDelay',
      text: t('packages_business_task_status_increment_delay_warning', {
        delay: calcTimeUnit(props.task.taskIncrementDelay),
        threshold: calcTimeUnit(props.task.taskIncrementDelayThreshold),
      }),
      type: 'warning',
    })
  }

  // 重试状态
  if (showRetrying.value) {
    list.push({
      key: 'retrying',
      text: taskRetryStartTimeTip.value,
      type: 'warning',
    })
  }

  return list
})

function onWarningClick(w: Warning) {
  if (w.key === 'errorCause') {
    showErrorCause.value = true
  }
}

function getNextStartTime() {
  try {
    if (!props.task.crontabExpression) return
    const interval = cronParse.parseExpression(props.task.crontabExpression)
    return t('packages_business_task_status_next_run_time', {
      val: dayjs(interval.next().toDate()).format('YYYY-MM-DD HH:mm:ss'),
    })
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
  }
}
</script>

<template>
  <div
    class="inline-flex align-center gap-2"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <span
      v-if="show"
      class="task-status-block flex align-center justify-center gap-1"
      :class="[`task-status-${task.status}`]"
    >
      {{ $t(STATUS_MAP[task.status as keyof typeof STATUS_MAP].i18n) }}

      <!--告警合并图标-->
      <ElPopover
        v-if="warnings.length"
        placement="top"
        trigger="hover"
        :width="340"
        popper-class="task-warning-popover"
      >
        <template #reference>
          <el-badge
            :offset="[4, 0]"
            :hidden="warnings.length < 2"
            :value="warnings.length"
            class="lh-1"
            badge-class="zoom-xs"
          >
            <span
              class="task-warning-trigger"
              @click="warnings[0] && onWarningClick(warnings[0])"
            >
              <VIcon size="16" class="color-warning task-warning-icon"
                >warning</VIcon
              >
            </span>
          </el-badge>
        </template>
        <ul class="task-warning-list flex flex-column gap-2">
          <li
            v-for="w in warnings"
            :key="w.key"
            class="task-warning-item flex gap-2"
            :class="{ 'is-clickable': w.clickable }"
          >
            <div
              class="w-2 h-2 mt-1.5 bg-color-warning rounded-circle flex-shrink-0"
            />
            <div>
              <RenderContent :content="w.text" />
            </div>
          </li>
        </ul>
      </ElPopover>
    </span>
    <ElTooltip v-if="showCronTip" placement="top">
      <VIcon size="16" :color="task.crontabScheduleMsg ? '#F3961A' : '#008b58'"
        >task-process</VIcon
      >
      <template #content>
        {{ task.crontabScheduleMsg || getNextStartTime() }}
      </template>
    </ElTooltip>

    <!--错误解读弹窗-->
    <ElDialog
      v-if="errorCause"
      v-model="showErrorCause"
      append-to-body
      :title="$t('public_task_reasons_for_error')"
    >
      <div class="p-4 rounded-4 bg-subtle text-preline font-color-dark">
        {{ errorCause }}
      </div>
    </ElDialog>
  </div>
</template>

<style lang="scss">
.task-status-block {
  display: inline-block;
  min-width: 72px;
  padding: 2px 8px;
  text-align: center;
  border-radius: 8px;
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

<style lang="scss">
.task-warning-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  &:hover .task-warning-icon {
    transform: scale(1.15);
  }

  .task-warning-icon {
    transition: transform 0.2s ease;
  }
}

.task-warning-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.task-warning-item {
  position: relative;
  font-size: 13px;
  line-height: 20px;
  color: var(--el-button-text-color);

  &.is-clickable {
    cursor: pointer;
    &:hover {
      background-color: #f7f8fa;
      border-radius: 4px;
    }
    &::before {
      background-color: #f43f5e;
    }
  }

  & + & {
    border-top: 1px solid #f2f3f5;
    padding-top: 8px;
  }
}
</style>
