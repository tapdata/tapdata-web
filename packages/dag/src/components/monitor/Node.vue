<script setup lang="tsx">
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useDataflowStore } from '../../stores/dataflow.store'
import BaseNode from '../BaseNode.vue'
import NodeSourceHandle from '../elements/NodeSourceHandle.vue'
import NodeTargetHandle from '../elements/NodeTargetHandle.vue'
import type { NodeProps } from '@vue-flow/core'
import 'dayjs/locale/zh-cn'

export type MonitorNodeProps = NodeProps & {
  readOnly?: boolean
  quota: any
  sample: any
  alarmData?: any
  taskType?: string
  syncType?: string
  alarm?: any
  dataflow?: any
}

const { t, locale } = useI18n()

dayjs.extend(relativeTime)
dayjs.locale(locale.value || 'zh-cn')

const dataflowStore = useDataflowStore()

const setConnectionAlarm = (endpoint: any, type: string) => {
  endpoint.connections?.forEach((conn: any) => {
    conn.setType(type)
  })
}

const clearConnectionAlarm = (endpoint: any) => {
  endpoint.connections?.forEach((conn: any) => {
    conn.clearTypes()
  })
}

defineOptions({ name: 'Node' })

const props = defineProps<MonitorNodeProps>()

const emit = defineEmits<{
  'drag-start': [any]
  'drag-move': [any]
  'drag-stop': [any]
  'deselect-all-nodes': []
  'deselect-node': [any]
  'node-selected': [any]
  delete: [any]
  'show-node-popover': [any]
  'open-detail': [any]
  'open-shared-cache': [any]
  'refresh-shared-cache': []
}>()

const dfNode = ref(null)
const popoverRef = useTemplateRef('popover')

const completeTime = computed(() => {
  const totalData = props.quota?.samples?.totalData?.[0] || {}
  const { snapshotInsertRowTotal, snapshotRowTotal } = props.sample || {}
  const { lastFiveMinutesQps } = totalData
  if (!snapshotInsertRowTotal || !snapshotRowTotal || !lastFiveMinutesQps) {
    return null
  }
  const time =
    ((snapshotRowTotal - snapshotInsertRowTotal) / lastFiveMinutesQps) * 1000
  return calcTimeUnit(Math.ceil(Math.abs(time)))
})

const isSource = computed(() => {
  const { type, $inputs } = props.data
  return (type === 'database' || type === 'table') && !$inputs.length
})

const isTarget = computed(() => {
  const { type, $outputs } = props.data
  return (type === 'database' || type === 'table') && !$outputs.length
})

/**
 * 是否包含增量阶段（全量+增量、增量）
 */
const hasCDC = props.taskType !== 'initial_sync'

const hasInitalSync = props.taskType !== 'cdc'

const taskSnapshotStartAt = computed(() => {
  const val = props.quota?.samples?.totalData?.[0]?.snapshotStartAt
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
})
const taskSnapshotDoneAt = computed(() => {
  const val = props.quota?.samples?.totalData?.[0]?.snapshotDoneAt
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
})
const currentEventTimestamp = computed(() => {
  const val =
    props.sample?.currentEventTimestamp ||
    props.sample?.snapshotDoneAt ||
    taskSnapshotDoneAt.value
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
})

/**
 * 增量时间点
 */
const cdcEventStartTime = computed(() => {
  if (!hasCDC) return ''
  const val = currentEventTimestamp.value
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
})

const outputQpsVal = computed(() => {
  const { outputQps = 0 } = props.sample || {}
  return outputQps.toLocaleString('zh', {
    maximumFractionDigits: 3,
    useGrouping: false,
  })
})

const isProcessor = computed(() => {
  const { type } = props.data
  return type !== 'database' && type !== 'table'
})

const isFileSource = computed(() => {
  return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(props.data.databaseType)
})

/**
 * 耗时
 */
const timeCostAvg = computed(() => {
  const { timeCostAvg } = props.sample || {}
  if (isNumber(timeCostAvg)) return calcTimeUnit(timeCostAvg)
  return null
})

/**
 * 目标写入耗时
 */
const targetWriteTimeCostAvg = computed(() => {
  const { targetWriteTimeCostAvg } = props.sample || {}
  if (isNumber(targetWriteTimeCostAvg))
    return calcTimeUnit(targetWriteTimeCostAvg)
  return null
})

/**
 * 全量进度
 */
const initialSyncProcess = computed(() => {
  const {
    snapshotInsertRowTotal = 0,
    snapshotRowTotal = 0,
    snapshotTableTotal = 0,
    tableTotal = 0,
  } = props.sample || {}
  if (props.syncType === 'migrate')
    return tableTotal ? Math.round((snapshotTableTotal / tableTotal) * 100) : 0
  if (snapshotTableTotal === tableTotal) return 100
  return snapshotRowTotal
    ? Math.round((snapshotInsertRowTotal / snapshotRowTotal) * 100)
    : 0
})

/**
 * 输入事件
 */
const inputTotal = computed(() => {
  return [
    'inputDdlTotal',
    'inputDeleteTotal',
    'inputInsertTotal',
    'inputOthersTotal',
    'inputUpdateTotal',
  ].reduce((total, key) => {
    return total + ((props.sample || {})[key] || 0)
  }, 0)
})

/**
 * 输出事件
 */
const outputTotal = computed(() => {
  return [
    'outputDdlTotal',
    'outputDeleteTotal',
    'outputInsertTotal',
    'outputOthersTotal',
    'outputUpdateTotal',
  ].reduce((total, key) => {
    return total + ((props.sample || {})[key] || 0)
  }, 0)
})

const isNumber = (value: any) => typeof value === 'number'

const getVal = (val: any, placeholder?: any) => {
  return val ?? placeholder ?? t('public_data_no_data')
}

const renderStatistic = () => {
  if (hasInitalSync) {
    if (taskSnapshotDoneAt.value) {
      if (!hasCDC) {
        return (
          <div class="statistic flex">
            <div class="statistic-title">
              {t(
                'packages_dag_components_nodedetaildialog_quanliangyiwancheng',
              )}
            </div>
          </div>
        )
      }
    } else if (taskSnapshotStartAt.value) {
      const title = isSource.value
        ? t('packages_dag_components_node_quanliangwanchenghaixu')
        : isTarget.value
          ? t('packages_dag_monitor_node_popover_targetWriteTime_title')
          : t('packages_dag_monitor_node_per_deal_need_time')
      const val = isFileSource.value
        ? t('packages_dag_components_node_zanbuzhichi')
        : getVal(
            isTarget.value
              ? targetWriteTimeCostAvg.value
              : isProcessor.value
                ? timeCostAvg.value
                : completeTime.value,
          )
      return (
        <div class="statistic flex align-center gap-1">
          <div class="statistic-title">{title}:</div>
          <div class="statistic-value">{val}</div>
        </div>
      )
    }
  }
  if (hasCDC) {
    let cdcTitle = ''
    let placeholder

    if (isSource.value) {
      cdcTitle = t('public_event_incremental_delay') as string
      placeholder = t('public_event_cdc_placeholder')
    } else if (isTarget.value) {
      cdcTitle = t(
        'packages_dag_monitor_node_popover_targetWriteTime_title',
      ) as string
    } else {
      cdcTitle = t('packages_dag_monitor_node_per_deal_need_time') as string
    }

    const replicateLagProps = (props.sample || {}).replicateLag
    const replicateLagVal =
      isNumber(replicateLagProps) && replicateLagProps >= 0
        ? calcTimeUnit(replicateLagProps, 2, {
            autoHideMs: true,
          })
        : null
    const val = getVal(
      isSource.value
        ? replicateLagVal
        : isTarget.value
          ? targetWriteTimeCostAvg.value
          : timeCostAvg.value,
      placeholder,
    )
    return (
      <div class="statistic flex align-center gap-1">
        <div class="statistic-title">{cdcTitle}:</div>
        <div class="statistic-value">{val}</div>
      </div>
    )
  }
  return <div>-</div>
}

const renderPopoverContent = () => {
  const cdcTimeTitle = isSource.value
    ? t('packages_dag_monitor_node_popover_cdcTimeTitle_source')
    : isTarget.value
      ? t('packages_dag_monitor_node_popover_cdcTimeTitle_target')
      : t('packages_dag_monitor_node_popover_cdcTimeTitle_processor')
  const cdcTime = (
    <div class="statistic span-2">
      <div class="statistic-title">{cdcTimeTitle}</div>
      <div class="statistic-content">
        <div class="statistic-value">{getVal(cdcEventStartTime.value)}</div>
      </div>
    </div>
  )

  const processingTime = (
    <div class="statistic">
      <div class="statistic-title">
        {t('packages_dag_monitor_node_per_deal_need_time')}
      </div>
      <div class="statistic-content">
        <div class="statistic-value">{getVal(timeCostAvg.value)}</div>
      </div>
    </div>
  )

  const targetWriteTime = (
    <div class="statistic">
      <div class="statistic-title">
        {t('packages_dag_monitor_node_popover_targetWriteTime_title')}
      </div>
      <div class="statistic-content">
        <div class="statistic-value">
          {getVal(targetWriteTimeCostAvg.value)}
        </div>
      </div>
    </div>
  )

  const outputEvent = (
    <div class="statistic">
      <div class="statistic-title">
        {t('packages_dag_monitor_node_leijishuchushi')}
      </div>
      <div class="statistic-content">
        <ElTooltip
          transition="tooltip-fade-in"
          content={outputTotal.value.toLocaleString()}
        >
          <div class="statistic-value">{calcUnit(outputTotal.value)}</div>
        </ElTooltip>
      </div>
    </div>
  )

  const inputEvent = (
    <div class="statistic">
      <div class="statistic-title">
        {t('packages_dag_monitor_node_leijishurushi')}
      </div>
      <div class="statistic-content">
        <ElTooltip
          transition="tooltip-fade-in"
          content={inputTotal.value.toLocaleString()}
        >
          <div class="statistic-value">{calcUnit(inputTotal.value)}</div>
        </ElTooltip>
      </div>
    </div>
  )

  const syncProcess = (
    <div class="statistic">
      <div class="statistic-title">{t('public_task_full_sync_progress')}</div>
      <div class="statistic-content">
        <div class="statistic-value">{initialSyncProcess.value}%</div>
      </div>
    </div>
  )

  const qps = (
    <div class="statistic">
      <div class="statistic-title">QPS(Q/S)</div>
      <div class="statistic-content">
        <div class="statistic-value">{outputQpsVal.value}</div>
      </div>
    </div>
  )

  if (!hasInitalSync || (hasCDC && taskSnapshotDoneAt.value)) {
    if (isSource.value) {
      return [cdcTime, inputEvent, outputEvent, qps]
    }
    if (isProcessor.value) {
      if (props.data.hiddenMap?.totalData) {
        return [cdcTime]
      }
      return [cdcTime, inputEvent, outputEvent, processingTime, qps]
    }
    return [cdcTime, inputEvent, outputEvent, targetWriteTime, qps]
  }

  if (hasInitalSync) {
    if (isSource.value) {
      return [syncProcess, qps, inputEvent, outputEvent]
    }
    if (isProcessor.value) {
      if (props.data.hiddenMap?.totalData) {
        return [cdcTime]
      }
      return [inputEvent, outputEvent, processingTime, qps]
    }
    return [inputEvent, outputEvent, targetWriteTime, processingTime, qps]
  }
}

const ifDragStart = ref(false)

const ins = computed(() => props.data?.__Ctor || {})

const alarmLevel = computed(() => {
  if (!props.alarm) return ''
  const level = props.alarm.level
  if (['EMERGENCY', 'CRITICAL'].includes(level)) {
    return 'error'
  } else if (['WARNING', 'NORMAL'].includes(level)) {
    return 'warn'
  }
  return ''
})

const alarmCls = computed(() =>
  alarmLevel.value ? `alarm-${alarmLevel.value}` : null,
)

const wrapClass = computed(() => {
  if (dataflowStore.selectedNode?.id === props.data.id) return 'border-primary'
  return ''
})

const nodeClass = computed(() => {
  const list: string[] = []

  if (props.data.attrs.disabled) list.push('node--disabled')
  if (props.data.disabled) list.push('node--disabled__main')

  ins.value && list.push(`node--${ins.value.group}`)
  alarmCls.value && list.push(alarmCls.value)
  return list
})

const sharedCache = computed(() => props.data.attrs?.sharedCache || [])

onMounted(() => {
  watch(
    alarmLevel,
    (level) => {
      const endpoint = (dfNode.value as any)?.targetPoint
      if (!endpoint) return

      clearConnectionAlarm(endpoint)

      level && setConnectionAlarm(endpoint, level)
    },
    { immediate: true },
  )
})
</script>

<template>
  <div
    class="df-node-wrap canvas-node border border-transparent rounded-2xl"
    :class="wrapClass"
    tabindex="1"
  >
    <BaseNode
      ref="dfNode"
      :node="props.data"
      :class="nodeClass"
      class="border border-transparent position-relative"
    >
      <template #extra>
        <NodeSourceHandle
          v-bind="$attrs"
          :node="props.data"
          class="canvas-node-handle z-1"
        />
        <NodeTargetHandle
          v-bind="$attrs"
          :node="props.data"
          class="canvas-node-handle z-1"
        />
        <el-popover
          ref="popover"
          :disabled="ifDragStart"
          placement="bottom"
          width="auto"
          trigger="hover"
          :close-delay="0"
          popper-class="node-statistic-popover"
        >
          <template #reference>
            <div class="node-card px-3 pb-1">
              <div class="flex align-center">
                <div class="node-card-content p-2 flex-1 rounded-lg min-w-0">
                  <renderStatistic />
                </div>
                <ElButton
                  class="ml-1"
                  text
                  @click.stop="emit('open-detail', data)"
                >
                  <template #icon>
                    <i-lucide-list />
                  </template>
                </ElButton>
              </div>
              <ElProgress
                v-if="isSource && hasInitalSync"
                class="mt-2"
                :show-text="false"
                :percentage="initialSyncProcess"
              />

              <div
                v-if="sharedCache.length"
                class="mt-2 mb-1 flex align-center"
              >
                <span class="text-xs font-color-light"
                  >{{ t('packages_dag_monitor_node_zhengzaishiyongdehuancun') }}
                </span>
                <el-button
                  size="small"
                  text
                  class="ml-0.5 p-0.5"
                  @click="emit('refresh-shared-cache')"
                >
                  <template #icon>
                    <el-icon :size="14"><i-lucide-rotate-cw /></el-icon>
                  </template>
                </el-button>
              </div>
              <ul v-if="sharedCache.length" class="flex flex-column gap-0.5">
                <li
                  v-for="item in sharedCache"
                  :key="item.id"
                  class="flex justify-content-between align-items-center px-1.5 py-1 rounded-lg bg-block text-xs"
                >
                  <ElLink
                    type="primary"
                    class="text-xs"
                    @click.stop="emit('open-shared-cache', item)"
                  >
                    {{ item.name }}
                  </ElLink>
                  <TaskStatus class="zoom-xs" :task="item" />
                </li>
              </ul>
            </div>
          </template>
          <div class="statistic-card">
            <div class="grid statistic-list">
              <renderPopoverContent />
            </div>
          </div>
        </el-popover>
      </template>
    </BaseNode>
  </div>
</template>

<style lang="scss" scoped>
.node-card {
  // position: absolute;
  // min-width: 240px;
  // z-index: -2;
  // top: 100%;
  // left: 50%;
  // background-color: var(--el-bg-color);
  // transform: translateX(-50%);

  &-content {
    background-color: var(--bg-block);
  }

  &-footer {
    height: 28px;
  }

  :deep(.statistic-list) {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
    gap: 4px;
  }

  :deep(.statistic) {
    display: inline-block;
    color: var(--text-sslight);

    .statistic-title {
      font-size: 12px;
      line-height: 1rem;
    }

    .statistic-value {
      display: inline-block;
      vertical-align: middle;
      color: var(--text-dark);
      line-height: 1rem;
      //font-weight: 700;
      font-size: 12px;
      font-family: DIN;
    }
  }
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  color: var(--icon-n1);
  background: transparent;
  outline: none;
  border: 1px solid transparent;
  border-radius: 4px;
  transition:
    background,
    color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;

  &.active,
  &:hover {
    color: var(--color-primary);
    background: #eef3ff;
  }
}

.span-2 {
  grid-column: span 2 / auto;
}

.alarm-warn {
  :deep(.df-node) {
    border-color: #ff932c;

    &.active,
    &.selected {
      box-shadow: 0 0 0 2px rgba(255, 147, 44, 0.3);
    }
  }

  :deep(.statistic-value) {
    color: #ff932c;
  }
}

.alarm-error {
  :deep(.df-node) {
    border-color: #d44d4d;

    &.active,
    &.selected {
      box-shadow: 0 0 0 2px rgba(212, 77, 77, 0.3);
    }
  }

  :deep(.statistic-value) {
    color: #d44d4d;
  }
}

.shared-cache-list {
  background-color: var(--bg-block);
}
</style>

<style lang="scss">
.el-popover.el-popper.node-statistic-popover {
  $bg: rgba(54, 66, 82, 0.9);
  background: $bg;
  border: 1px solid var(--el-border-color);

  .el-popper__arrow {
    width: 0;
    height: 0;
    &:before {
      width: 0;
      height: 0;
      background: transparent;
      border-width: 6px;
      border-style: solid;
      border-color: transparent;
      transform: none;
    }
  }

  &.el-popper[data-popper-placement^='top'] .el-popper__arrow {
    bottom: -6px;
    &:before {
      border-top-color: $bg !important;
      border-bottom-width: 0;
    }
  }

  &.el-popper[data-popper-placement^='bottom'] .el-popper__arrow {
    top: -6px;
    &:before {
      border-bottom-color: $bg !important;
      border-top-width: 0;
    }
  }

  .statistic-list {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
    gap: 4px;
  }

  .statistic {
    color: rgba(255, 255, 255, 0.65);
    &-title {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.5;
    }

    &-value {
      display: inline-block;
      color: #fff;
      line-height: 1;
      font-weight: 700;
      font-size: 14px;
      font-family: DIN;
      white-space: nowrap;
    }

    &.row {
    }
  }
}
.canvas-node {
  .canvas-node-handle {
    width: 1rem;
    height: 1rem;
    transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    background-color: transparent;
    pointer-events: all;
    border: none;
    cursor: pointer;
    transform: none;
    top: 1rem;
    border-radius: 0;
    &.vue-flow__handle-left {
      left: -9px;
    }
    &.vue-flow__handle-right {
      right: -9px;
    }
    &:hover {
      transform: scale(1.25);
    }
    &::after {
      content: '';
      position: absolute;
      width: 0.125rem;
      height: 0.5rem;
      top: 0.25rem;
      background-color: var(--el-color-primary);
    }
    &.vue-flow__handle-left::after {
      left: 0.375rem;
    }
    &.vue-flow__handle-right::after {
      right: 0.375rem;
    }
  }

  :deep(.canvas-node-handle-icon) {
    display: none;
    width: 1rem;
    height: 1rem;
    font-size: 10px;
    // transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    // &:hover {
    //   transform: scale(1.25);
    // }

    &.force-visible {
      display: flex !important;
    }
  }

  &:hover :deep(.canvas-node-handle-icon) {
    display: flex;
  }
  &:hover .canvas-node-handle,
  .canvas-node-handle.active,
  .canvas-node-handle.popover-active {
    // width: 1rem;
    // height: 1rem;
    .canvas-node-handle-icon {
      display: flex;
    }
  }

  &:hover :deep(.node-toolbar) {
    display: flex;
  }

  .task-status-block {
    min-width: unset;
  }
}
</style>
