<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { defineComponent, computed, ref, onMounted, watch } from '@vue/composition-api'

import i18n from '@tap/i18n'
import { VIcon } from '@tap/component'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import DFNode from '../DFNode'

dayjs.extend(relativeTime)
dayjs.locale(i18n.locale || 'zh-cn')

const setConnectionAlarm = (endpoint, type) => {
  endpoint.connections?.forEach(conn => {
    conn.setType(type)
  })
}

const clearConnectionAlarm = endpoint => {
  endpoint.connections?.forEach(conn => {
    conn.clearTypes()
  })
}

export default defineComponent({
  name: 'Node',
  components: {
    DFNode,
    VIcon
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
        tableTotal: 0
      })
    },
    alarmData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    taskType: String,
    syncType: String,
    alarm: Object
  },

  setup(props, { attrs, listeners, emit, refs }) {
    const completeTime = computed(() => {
      const { snapshotInsertRowTotal, snapshotRowTotal, outputQps } = props.sample
      return outputQps
        ? calcTimeUnit(Math.ceil(Math.abs((snapshotRowTotal - snapshotInsertRowTotal) / outputQps) * 1000), 2)
        : '-'
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
      const val = props.sample.currentEventTimestamp || props.sample.snapshotDoneAt
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

    /**
     * 增量时间点（相对）
     * @type {ComputedRef<string|string>}
     */
    const cdcEventStartRelativeTime = computed(() => {
      const val = cdcEventStartTime.value
      return val ? dayjs().to(dayjs(val)) : '-'
    })

    const outputQps = computed(() => {
      const { outputQps = 0 } = props.sample
      return outputQps.toLocaleString('zh', {
        maximumFractionDigits: 3,
        useGrouping: false
      })
    })

    const isProcessor = computed(() => {
      const { type } = props.node
      return type !== 'database' && type !== 'table'
    })

    /**
     * 耗时
     * @type {ComputedRef<unknown>}
     */
    const timeCostAvg = computed(() => {
      const { timeCostAvg } = props.sample
      if (!timeCostAvg) return '-'
      return calcTimeUnit(timeCostAvg)
    })

    /**
     * 目标写入耗时
     * @type {ComputedRef<unknown>}
     */
    const targetWriteTimeCostAvg = computed(() => {
      const { targetWriteTimeCostAvg } = props.sample
      if (!targetWriteTimeCostAvg) return '-'
      return calcTimeUnit(targetWriteTimeCostAvg)
    })

    /**
     * 全量进度
     * @type {ComputedRef<number|number>}
     */
    const initialSyncProcess = computed(() => {
      const { snapshotInsertRowTotal = 0, snapshotRowTotal = 0, snapshotTableTotal = 0, tableTotal = 0 } = props.sample
      // 复制任务用表数量计算
      if (props.syncType === 'migrate') return tableTotal ? Math.round((snapshotTableTotal / tableTotal) * 100) : 0
      return snapshotRowTotal ? Math.round((snapshotInsertRowTotal / snapshotRowTotal) * 100) : 0
    })

    /**
     * 输入事件
     * @type {ComputedRef<number>}
     */
    const inputTotal = computed(() => {
      return ['inputDdlTotal', 'inputDeleteTotal', 'inputInsertTotal', 'inputOthersTotal', 'inputUpdateTotal'].reduce(
        (total, key) => {
          return total + props.sample[key] || 0
        },
        0
      )
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
        'outputUpdateTotal'
      ].reduce((total, key) => {
        return total + props.sample[key] || 0
      }, 0)
    })

    const renderStatistic = () => {
      if (hasInitalSync) {
        // 全量完成
        if (taskSnapshotDoneAt.value) {
          if (!hasCDC) {
            return (
              <div class="statistic flex">
                <div class="statistic-title">
                  {i18n.t('packages_dag_components_nodedetaildialog_quanliangyiwancheng')}
                </div>
              </div>
            )
          }
        } else {
          // 全量进行中
          if (taskSnapshotStartAt.value) {
            return (
              <div class="statistic flex">
                <div class="statistic-title">{i18n.t('packages_dag_components_node_quanliangwanchenghaixu')}</div>
                <div class="statistic-content">
                  <div class="statistic-value">
                    {isTarget.value
                      ? targetWriteTimeCostAvg.value
                      : isProcessor.value
                      ? timeCostAvg.value
                      : completeTime.value}
                  </div>
                </div>
              </div>
            )
          }
        }
      }
      if (hasCDC) {
        // 增量进行中
        const cdcTitle = isSource.value
          ? i18n.t('packages_dag_monitor_node_cdcTitle_source')
          : isTarget.value
          ? i18n.t('packages_dag_monitor_node_cdcTitle_target')
          : i18n.t('packages_dag_monitor_node_cdcTitle_processor')
        return (
          <div class="statistic flex">
            <div class="statistic-title">{cdcTitle}：</div>
            <div class="statistic-content">
              <div class="statistic-value">
                {cdcEventStartRelativeTime.value === '-'
                  ? i18n.t('packages_dag_monitor_node_popover_cdc_no_find_data')
                  : cdcEventStartRelativeTime.value}
              </div>
            </div>
          </div>
        )
      }
      return <div>-</div>
    }

    const renderPopoverContent = () => {
      const cdcTimeTitle = isSource.value
        ? i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_source')
        : isTarget
        ? i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_target')
        : i18n.t('packages_dag_monitor_node_popover_cdcTimeTitle_processor')
      const cdcTime = (
        <div class="statistic span-2">
          <div class="statistic-title">{cdcTimeTitle}</div>
          <div class="statistic-content">
            <div class="statistic-value">
              {cdcEventStartTime.value || i18n.t('packages_dag_monitor_node_popover_cdc_no_find_data')}
            </div>
          </div>
        </div>
      )

      const processingTime = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_monitor_leftsider_chulihaoshim')}</div>
          <div class="statistic-content">
            <div class="statistic-value">{timeCostAvg.value}</div>
          </div>
        </div>
      )

      // 源全量读取耗时
      const sourceInitalReadTime = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_components_nodedetaildialog_pingjunduquhao')}</div>
          <div class="statistic-content">
            <div class="statistic-value">
              {props.sample.snapshotSourceReadTimeCostAvg
                ? calcTimeUnit(props.sample.snapshotSourceReadTimeCostAvg)
                : '-'}
            </div>
          </div>
        </div>
      )

      // 源增量读取耗时
      const sourceCDCReadTime = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_components_nodedetaildialog_zengliangduquyan')}</div>
          <div class="statistic-content">
            <div class="statistic-value">
              {props.sample.incrementalSourceReadTimeCostAvg
                ? calcTimeUnit(props.sample.incrementalSourceReadTimeCostAvg)
                : '-'}
            </div>
          </div>
        </div>
      )

      // 目标写入耗时
      const targetWriteTime = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_monitor_node_popover_targetWriteTime_title')}</div>
          <div class="statistic-content">
            <div class="statistic-value">
              {props.sample.targetWriteTimeCostAvg ? calcTimeUnit(props.sample.targetWriteTimeCostAvg) : '-'}
            </div>
          </div>
        </div>
      )

      const outputEvent = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_monitor_node_leijishuchushi')}</div>
          <div class="statistic-content">
            <ElTooltip transition="tooltip-fade-in" content={outputTotal.value.toLocaleString()}>
              <div class="statistic-value">{calcUnit(outputTotal.value)}</div>
            </ElTooltip>
          </div>
        </div>
      )

      const inputEvent = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_monitor_node_leijishurushi')}</div>
          <div class="statistic-content">
            <ElTooltip transition="tooltip-fade-in" content={inputTotal.value.toLocaleString()}>
              <div class="statistic-value">{calcUnit(inputTotal.value)}</div>
            </ElTooltip>
          </div>
        </div>
      )

      const syncProcess = (
        <div class="statistic">
          <div class="statistic-title">{i18n.t('packages_dag_components_nodedetaildialog_quanliangtongbujin')}</div>
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
          return [cdcTime, inputEvent, outputEvent, processingTime, qps]
        }
        return [cdcTime, inputEvent, outputEvent, targetWriteTime, qps]
      }

      if (hasInitalSync) {
        if (isSource.value) {
          return [syncProcess, qps, inputEvent, outputEvent]
        }
        if (isProcessor.value) {
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
        level => {
          const endpoint = refs.dfNode?.targetPoint
          if (!endpoint) return

          clearConnectionAlarm(endpoint)

          level && setConnectionAlarm(endpoint, level)
        },
        { immediate: true }
      )
    })

    return () => {
      let nodeProps = { props: { ...attrs }, attrs }
      let alarmCls = alarmLevel.value ? `alarm-${alarmLevel.value}` : null

      return (
        <DFNode
          ref="dfNode"
          {...nodeProps}
          class={alarmCls}
          on={{
            ...listeners,
            'drag-start': (...args) => {
              ifDragStart.value = true
              emit('drag-start', ...args)
            },
            'drag-stop': (...args) => {
              ifDragStart.value = false
              refs.popover?.updatePopper?.() // 更新popover位置
              emit('drag-stop', ...args)
            }
          }}
        >
          <el-popover
            ref="popover"
            disabled={ifDragStart.value}
            placement="bottom"
            width="240"
            trigger="hover"
            popper-class="node-statistic-popover rounded-lg"
          >
            <div slot="reference" class="node-card rounded-lg px-2 pb-2 pt-4 mt-n2">
              <div class="flex align-center">
                <div class="node-card-content p-2 flex-1 rounded-sm">{renderStatistic()}</div>
                <button onClick={() => emit('open-detail')} class="ml-2 icon-btn">
                  <VIcon size="16">menu-left</VIcon>
                </button>
              </div>
              {isSource.value && hasInitalSync && (
                <ElProgress class="mt-2" show-text={false} percentage={initialSyncProcess.value} />
              )}
            </div>

            <div class="statistic-card">
              <div class="grid statistic-list">{renderPopoverContent()}</div>
            </div>
          </el-popover>
        </DFNode>
      )
    }
  }
})
</script>

<style lang="scss" scoped>
.node-card {
  position: absolute;
  min-width: 280px;
  z-index: -1;
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
    color: map-get($fontColor, sslight);
    &-title {
      font-size: 12px;
      line-height: 1.5;
    }

    &-value {
      display: inline-block;
      vertical-align: middle;
      color: map-get($fontColor, dark);
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
  transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;

  &.active,
  &:hover {
    color: map-get($color, primary);
    background: #eef3ff;
  }
}
.span-2 {
  grid-column: span 2 / auto;
}
.alarm-warn::v-deep {
  .df-node {
    border-color: #ff932c;
    &.active,
    &.selected {
      box-shadow: 0 0 0 2px rgba(255, 147, 44, 0.3);
    }
  }
  .statistic-value {
    color: #ff932c;
  }
}

.alarm-error::v-deep {
  .df-node {
    border-color: #d44d4d;
    &.active,
    &.selected {
      box-shadow: 0 0 0 2px rgba(212, 77, 77, 0.3);
    }
  }
  .statistic-value {
    color: #d44d4d;
  }
}
</style>

<style lang="scss">
.node-statistic-popover {
  $bg: rgba(54, 66, 82, 0.9);
  background: $bg;
  border: 1px solid #f2f2f2;

  &.el-popper[x-placement^='top'] .popper__arrow::after {
    border-top-color: $bg;
  }

  &.el-popper[x-placement^='bottom'] .popper__arrow::after {
    border-bottom-color: $bg;
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
