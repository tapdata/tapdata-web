<script lang="jsx">
import { TaskStatus } from '@tap/business'
import { IconButton, VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import DFNode from '../DFNode'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale(i18n.locale || 'zh-cn')

const setConnectionAlarm = (endpoint, type) => {
  endpoint.connections?.forEach((conn) => {
    conn.setType(type)
  })
}

const clearConnectionAlarm = (endpoint) => {
  endpoint.connections?.forEach((conn) => {
    conn.clearTypes()
  })
}

export default defineComponent({
  name: 'Node',
  components: {
    DFNode,
    VIcon,
    TaskStatus,
  },

  props: {
    node: {},
    quota: {},
    sample: {
      type: Object,
      default: () => ({
        snapshotInsertRowTotal: 0,
        snapshotRowTotal: 0,
        outputQps: 0,
        snapshotTableTotal: 0,
        tableTotal: 0,
      }),
    },
    alarmData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    taskType: String,
    syncType: String,
    alarm: Object,
    dataflow: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  setup(props, { attrs, emit, refs }) {
    const dfNode = ref(null)
    const completeTime = computed(() => {
      const totalData = props.quota.samples?.totalData?.[0] || {}
      const { snapshotInsertRowTotal, snapshotRowTotal } = props.sample
      const { lastFiveMinutesQps } = totalData
      if (!snapshotInsertRowTotal || !snapshotRowTotal || !lastFiveMinutesQps) {
        return null
      }
      const time =
        ((snapshotRowTotal - snapshotInsertRowTotal) / lastFiveMinutesQps) *
        1000
      return calcTimeUnit(Math.ceil(Math.abs(time)))
    })

    const isSource = computed(() => {
      const { type, $inputs } = props.node
      return (type === 'database' || type === 'table') && !$inputs.length
    })

    const isTarget = computed(() => {
      const { type, $outputs } = props.node
      return (type === 'database' || type === 'table') && !$outputs.length
    })

    /**
     * 是否包含增量阶段（全量+增量、增量）
     * @type {ComputedRef<boolean>}
     */
    const hasCDC = props.taskType !== 'initial_sync'

    const hasInitalSync = props.taskType !== 'cdc'

    const taskSnapshotStartAt = computed(() => {
      const val = props.quota.samples?.totalData?.[0]?.snapshotStartAt
      return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
    })
    const taskSnapshotDoneAt = computed(() => {
      const val = props.quota.samples?.totalData?.[0]?.snapshotDoneAt
      return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
    })
    const currentEventTimestamp = computed(() => {
      const val =
        props.sample.currentEventTimestamp ||
        props.sample.snapshotDoneAt ||
        taskSnapshotDoneAt.value
      return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
    })

    /**
     * 增量时间点
     * @type {ComputedRef<string|string>}
     */
    const cdcEventStartTime = computed(() => {
      if (!hasCDC) return ''
      const val = currentEventTimestamp.value
      return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
    })

    const outputQps = computed(() => {
      const { outputQps = 0 } = props.sample
      return outputQps.toLocaleString('zh', {
        maximumFractionDigits: 3,
        useGrouping: false,
      })
    })

    const isProcessor = computed(() => {
      const { type } = props.node
      return type !== 'database' && type !== 'table'
    })

    const isFileSource = computed(() => {
      return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(props.node.databaseType)
    })

    /**
     * 耗时
     * @type {ComputedRef<unknown>}
     */
    const timeCostAvg = computed(() => {
      const { timeCostAvg } = props.sample
      if (isNumber(timeCostAvg)) return calcTimeUnit(timeCostAvg)
      return null
    })

    /**
     * 目标写入耗时
     * @type {ComputedRef<unknown>}
     */
    const targetWriteTimeCostAvg = computed(() => {
      const { targetWriteTimeCostAvg } = props.sample
      if (isNumber(targetWriteTimeCostAvg))
        return calcTimeUnit(targetWriteTimeCostAvg)
      return null
    })

    /**
     * 全量进度
     * @type {ComputedRef<number|number>}
     */
    const initialSyncProcess = computed(() => {
      const {
        snapshotInsertRowTotal = 0,
        snapshotRowTotal = 0,
        snapshotTableTotal = 0,
        tableTotal = 0,
      } = props.sample
      // 复制任务用表数量计算
      if (props.syncType === 'migrate')
        return tableTotal
          ? Math.round((snapshotTableTotal / tableTotal) * 100)
          : 0
      return snapshotRowTotal
        ? Math.round((snapshotInsertRowTotal / snapshotRowTotal) * 100)
        : 0
    })

    /**
     * 输入事件
     * @type {ComputedRef<number>}
     */
    const inputTotal = computed(() => {
      return [
        'inputDdlTotal',
        'inputDeleteTotal',
        'inputInsertTotal',
        'inputOthersTotal',
        'inputUpdateTotal',
      ].reduce((total, key) => {
        return total + (props.sample[key] || 0)
      }, 0)
    })

    /**
     * 输出事件
     * @type {ComputedRef<number>}
     */
    const outputTotal = computed(() => {
      return [
        'outputDdlTotal',
        'outputDeleteTotal',
        'outputInsertTotal',
        'outputOthersTotal',
        'outputUpdateTotal',
      ].reduce((total, key) => {
        return total + (props.sample[key] || 0)
      }, 0)
    })

    const isNumber = (value) => typeof value === 'number'

    const getVal = (val, placeholder) => {
      return val ?? placeholder ?? i18n.t('public_data_no_data')
    }

    const renderStatistic = () => {
      if (hasInitalSync) {
        // 全量完成
        if (taskSnapshotDoneAt.value) {
          if (!hasCDC) {
            return (
              <div class="statistic flex">
                <div class="statistic-title">
                  {i18n.t(
                    'packages_dag_components_nodedetaildialog_quanliangyiwancheng',
                  )}
                </div>
              </div>
            )
          }
        } else {
          // 全量进行中
          if (taskSnapshotStartAt.value) {
            const title = isSource.value
              ? i18n.t('packages_dag_components_node_quanliangwanchenghaixu')
              : isTarget.value
                ? i18n.t(
                    'packages_dag_monitor_node_popover_targetWriteTime_title',
                  )
                : i18n.t('packages_dag_monitor_node_per_deal_need_time')
            const val = isFileSource.value
              ? i18n.t('packages_dag_components_node_zanbuzhichi')
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
      }
      if (hasCDC) {
        // 增量进行中
        let cdcTitle = ''
        let placeholder

        if (isSource.value) {
          cdcTitle = i18n.t('public_event_incremental_delay')
          placeholder = i18n.t('public_event_cdc_placeholder')
        } else if (isTarget.value) {
          cdcTitle = i18n.t(
            'packages_dag_monitor_node_popover_targetWriteTime_title',
          )
        } else {
          cdcTitle = i18n.t('packages_dag_monitor_node_per_deal_need_time')
        }

        const replicateLagProps = props.sample.replicateLag
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
        ? i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_source')
        : isTarget.value
          ? i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_target')
          : i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_processor')
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
            {i18n.t('packages_dag_monitor_node_per_deal_need_time')}
          </div>
          <div class="statistic-content">
            <div class="statistic-value">{getVal(timeCostAvg.value)}</div>
          </div>
        </div>
      )

      // 目标写入耗时
      const targetWriteTime = (
        <div class="statistic">
          <div class="statistic-title">
            {i18n.t('packages_dag_monitor_node_popover_targetWriteTime_title')}
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
            {i18n.t('packages_dag_monitor_node_leijishuchushi')}
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
            {i18n.t('packages_dag_monitor_node_leijishurushi')}
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
          <div class="statistic-title">
            {i18n.t('public_task_full_sync_progress')}
          </div>
          <div class="statistic-content">
            <div class="statistic-value">{initialSyncProcess.value}%</div>
          </div>
        </div>
      )

      const qps = (
        <div class="statistic">
          <div class="statistic-title">QPS(Q/S)</div>
          <div class="statistic-content">
            <div class="statistic-value">{outputQps.value}</div>
          </div>
        </div>
      )

      // 在增量阶段
      if (!hasInitalSync || (hasCDC && taskSnapshotDoneAt.value)) {
        if (isSource.value) {
          return [cdcTime, inputEvent, outputEvent, qps]
        }
        if (isProcessor.value) {
          if (props.node.hiddenMap?.totalData) {
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
          if (props.node.hiddenMap?.totalData) {
            return [cdcTime]
          }
          return [inputEvent, outputEvent, processingTime, qps]
        }
        return [inputEvent, outputEvent, targetWriteTime, processingTime, qps]
      }
    }

    const ifDragStart = ref(false) // 控制popover禁用

    const alarmLevel = computed(() => {
      if (!props.alarm) return
      const alarmLevel = props.alarm.level
      if (['EMERGENCY', 'CRITICAL'].includes(alarmLevel)) {
        return 'error'
      } else if (['WARNING', 'NORMAL'].includes(alarmLevel)) {
        return 'warn'
      }
    })

    onMounted(() => {
      watch(
        alarmLevel,
        (level) => {
          const endpoint = dfNode.value?.targetPoint
          if (!endpoint) return

          clearConnectionAlarm(endpoint)

          level && setConnectionAlarm(endpoint, level)
        },
        { immediate: true },
      )
    })

    return () => {
      const nodeProps = { ...attrs }
      const alarmCls = alarmLevel.value ? `alarm-${alarmLevel.value}` : null
      const sharedCache = props.node.attrs?.sharedCache || []

      return (
        <DFNode
          ref={dfNode}
          {...attrs}
          class={alarmCls}
          onDragStart={(...args) => {
            ifDragStart.value = true
            emit('drag-start', ...args)
          }}
          onDragStop={(...args) => {
            ifDragStart.value = false
            refs.popover?.updatePopper?.() // 更新popover位置
            emit('drag-stop', ...args)
          }}
        >
          <div>
            <el-popover
              ref="popover"
              disabled={ifDragStart.value}
              placement="bottom"
              width="auto"
              trigger="hover"
              close-delay={0}
              popper-class="node-statistic-popover"
            >
              {{
                reference: () => (
                  <div class="node-card rounded-xl px-2 pb-2 pt-4 mt-n2">
                    <div class="flex align-center">
                      <div class="node-card-content p-2 flex-1 rounded-sm">
                        {renderStatistic()}
                      </div>
                      <button
                        onClick={() => emit('open-detail')}
                        class="ml-2 icon-btn"
                      >
                        <VIcon size="16">menu-left</VIcon>
                      </button>
                    </div>
                    {isSource.value && hasInitalSync && (
                      <ElProgress
                        class="mt-2"
                        show-text={false}
                        percentage={initialSyncProcess.value}
                      />
                    )}

                    {!!sharedCache.length && (
                      <div class="fw-bold my-2 flex align-center">
                        {i18n.t(
                          'packages_dag_monitor_node_zhengzaishiyongdehuancun',
                        )}{' '}
                        <IconButton
                          onClick={() => emit('refresh-shared-cache')}
                          class="ml-0.5"
                          sm
                          clickAndRotate
                        >
                          refresh
                        </IconButton>
                      </div>
                    )}
                    {!!sharedCache.length && (
                      <ul class="shared-cache-list rounded-4 p-2">
                        {sharedCache.map((item) => (
                          <li class="flex justify-content-between align-items-center pb-1">
                            <ElLink
                              type="primary"
                              onClick={() => emit('open-shared-cache', item)}
                            >
                              {item.name}
                            </ElLink>
                            <TaskStatus task={item} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
                default: () => (
                  <div class="statistic-card">
                    <div class="grid statistic-list">
                      {renderPopoverContent()}
                    </div>
                  </div>
                ),
              }}
            </el-popover>
          </div>
        </DFNode>
      )
    }
  },
})
</script>

<style lang="scss" scoped>
.node-card {
  position: absolute;
  min-width: 240px;
  z-index: -2;
  top: 100%;
  left: 50%;
  background-color: #fff;
  transform: translateX(-50%);

  &-content {
    background-color: #f5f8fe;
  }

  &-footer {
    height: 28px;
  }

  .statistic-list {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
    gap: 4px;
  }

  .statistic {
    display: inline-block;
    color: var(--text-sslight);

    &-title {
      font-size: 12px;
      line-height: 1.5;
    }

    &-value {
      display: inline-block;
      vertical-align: middle;
      color: var(--text-dark);
      line-height: 1;
      //font-weight: 700;
      font-size: 12px;
      font-family: DIN;
      white-space: nowrap;
    }
  }
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  color: #4e5969;
  background: #fff;
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
  background-color: #f5f8fe;
}
</style>

<style lang="scss">
.el-popover.el-popper.node-statistic-popover {
  $bg: rgba(54, 66, 82, 0.9);
  background: $bg;
  border: 1px solid #f2f2f2;

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
</style>
