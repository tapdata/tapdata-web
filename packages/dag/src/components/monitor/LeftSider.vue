<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect :range="$attrs.range" ref="timeSelect" @change="changeTimeSelect"></TimeSelect>
      </div>
      <div class="info-box">
        <div class="task-info__row">
          <span class="task-info__label">任务ID：</span>
          <span class="task-info__value">{{ dataflow.id }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">任务类型：</span>
          <span class="task-info__value">{{ syncType[dataflow.type] }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">所属FE：</span>
          <span class="task-info__value">{{ dataflow.agentId || dataflow.agentName || '-' }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">运行状态：</span>
          <span class="task-info__value">
            <TaskStatus :task="dataflow" />
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="font-color-normal fw-bold mb-2">任务事件统计（条）</div>
        <EventChart :samples="[eventDataAll, eventDataPeriod]"></EventChart>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <div class="flex align-items-center fw-bold font-color-normal">
              <span>性能指标</span>
              <!--              <span class="fs-8 font-color-sslight ml-1">{{ timeSelectLabel }}</span>-->
              <!--              <VIcon class="color-primary ml-2">timer</VIcon>-->
            </div>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="放大">
              <VIcon @click.stop="toFullscreen">enlarge</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <LineChart
              :data="qpsData"
              :color="['#26CF6C', '#2C65FF']"
              title="QPS（Q/S）"
              :time-format="timeFormat"
              style="height: 140px"
            ></LineChart>
            <LineChart
              :data="delayData"
              title="增量延迟"
              :color="['#2C65FF']"
              :time-format="timeFormat"
              time-value
              class="mt-4"
              style="height: 140px"
            ></LineChart>
          </template>
        </CollapsePanel>
      </div>
      <div v-if="dataflow.type !== 'cdc'" class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">全量信息</span>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="列表">
              <VIcon @click.stop="toInitialList">menu-left</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <div v-if="initialData.snapshotDoneAt" class="mb-4">
              <span>全量完成时间：</span>
              <span>{{ initialData.snapshotDoneAt }}</span>
            </div>
            <div v-else class="mb-4">
              <span>预计全量完成还需：</span>
              <ElTooltip transition="tooltip-fade-in" :content="initialData.finishDuration.toLocaleString() + 'ms'">
                <span>{{ calcTimeUnit(initialData.finishDuration, 2) }}</span>
              </ElTooltip>
            </div>
            <div class="flex justify-content-around">
              <div>
                <div class="text-center">表结构同步</div>
                <Chart :extend="initialStructureOptions" style="width: 140px; height: 170px"></Chart>
              </div>
              <div>
                <div class="text-center">表数据状态</div>
                <Chart
                  ref="chart"
                  :extend="initialDataOptions"
                  style="margin-left: 35px; width: 140px; height: 170px"
                ></Chart>
              </div>
            </div>
          </template>
        </CollapsePanel>
      </div>
    </div>

    <ElDialog
      title="性能指标"
      width="774px"
      :visible.sync="lineChartDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
    >
      <LineChart
        :data="qpsData"
        :color="['#26CF6C', '#2C65FF']"
        title="QPS（Q/S）"
        :time-format="timeFormat"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="delayData"
        :color="['#2C65FF']"
        :time-format="timeFormat"
        time-value
        title="增量延迟"
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog" :dataflow="dataflow" ref="initialList"></InitialList>
  </aside>
</template>

<script>
import 'web-core/assets/icons/svg/magnify.svg'
import 'web-core/assets/icons/svg/table.svg'
import 'web-core/assets/icons/svg/javascript.svg'
import 'web-core/assets/icons/svg/joint-cache.svg'
import 'web-core/assets/icons/svg/row-filter.svg'
import 'web-core/assets/icons/svg/aggregator.svg'
import 'web-core/assets/icons/svg/field-processor.svg'
import 'web-core/assets/icons/svg/join.svg'
import 'web-core/assets/icons/svg/custom-node.svg'
import 'web-core/assets/icons/svg/merge_table.svg'
import 'web-core/assets/icons/svg/field_calc.svg'
import 'web-core/assets/icons/svg/field_add_del.svg'
import 'web-core/assets/icons/svg/field_rename.svg'
import 'web-core/assets/icons/svg/field_mod_type.svg'
import Locale from '../../mixins/locale'
import EventChart from './components/EventChart'
import LineChart from './components/LineChart'
import TimeSelect from './components/TimeSelect'
import CollapsePanel from './components/CollapsePanel'
import VIcon from 'web-core/components/VIcon'
import InitialList from './components/InitialList'
import { Chart } from '@tap/component'
import { TaskStatus } from '@tap/business'
import { getPieOptions } from './util'
import dayjs from 'dayjs'
import { calcTimeUnit } from '@tap/shared'

export default {
  name: 'LeftSider',
  mixins: [Locale],
  props: {
    dataflow: Object,
    quota: Object,
    timeFormat: String
  },
  components: {
    EventChart,
    LineChart,
    Chart,
    TimeSelect,
    CollapsePanel,
    VIcon,
    InitialList,
    TaskStatus
  },

  data() {
    return {
      syncType: {
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
      },
      lineChartDialog: false,
      initialListDialog: false,
      timeSelectLabel: ''
    }
  },

  computed: {
    // 任务事件统计（条）-任务累计
    eventDataAll() {
      const data = this.quota.samples?.totalData?.[0]
      return this.getInputOutput(data)
    },

    // 任务事件统计（条）-所选周期累计
    eventDataPeriod() {
      const data = this.quota.samples?.barChartData?.[0]
      return this.getInputOutput(data)
    },

    // qps
    qpsData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: []
        }
      }
      const { time = [] } = this.quota
      return {
        x: time,
        name: ['输入', '输出'],
        value: [data.inputQps, data.outputQps]
      }
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      const { time = [] } = this.quota
      if (!data) {
        return {
          x: [],
          value: []
        }
      }
      return {
        x: time,
        value: data.timeCostAvg
      }
    },

    // 全量信息
    initialData() {
      const data = this.quota.samples?.totalData?.[0] || {}
      const { snapshotRowTotal = 0, snapshotInsertRowTotal = 0, outputQps = 0, snapshotDoneAt } = data
      const time = outputQps ? Math.ceil(((snapshotRowTotal - snapshotInsertRowTotal) / outputQps) * 1000) : 0 // 剩余待同步的数据量/当前的同步速率, outputQps行每秒
      return {
        snapshotDoneAt: snapshotDoneAt ? dayjs(snapshotDoneAt).format('YYYY-MM-DD HH:mm:ss') : '',
        finishDuration: time
      }
    },

    // 全量-表结构同步
    initialStructureOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        // {
        //   name: '无需创建',
        //   key: 'noCreate',
        //   value: 0,
        //   color: '#88DBDA'
        // },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        }
        // {
        //   name: '错误',
        //   key: 'error',
        //   value: 0,
        //   color: '#EC8181'
        // }
      ]
      const data = this.quota.samples?.totalData?.[0] || {}
      const { tableTotal = 0, createTableTotal = 0 } = data
      let result = {
        wait: 0,
        finished: createTableTotal
      }
      result.wait = tableTotal - result.finished
      // const { structure } = this.quota.statistics?.[0] || {}
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: result[t.key] ?? 0
          })
        ),
        {
          series: [
            {
              name: '表结构同步'
            }
          ]
        }
      )
    },

    // 全量-表数据同步
    initialDataOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        // {
        //   name: '进行中',
        //   key: 'running',
        //   value: 0,
        //   color: '#88DBDA'
        // },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        }
        // {
        //   name: '错误',
        //   key: 'error',
        //   value: 0,
        //   color: '#EC8181'
        // }
      ]
      // const { data } = this.quota.statistics?.[0] || {}
      const data = this.quota.samples?.totalData?.[0] || {}
      const { tableTotal = 0, snapshotTableTotal = 0 } = data
      let result = {
        wait: 0,
        finished: snapshotTableTotal
      }
      result.wait = tableTotal - result.finished
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: result?.[t.key] ?? 0
          })
        ),
        {
          series: [
            {
              name: '表数据同步'
            }
          ]
        }
      )
    },

    initialList() {
      return this.$refs?.initialList
    }
  },

  mounted() {
    this.timeSelectLabel = this.$refs.timeSelect?.getPeriod()?.label
  },

  methods: {
    changeTimeSelect(val, isTime, source) {
      this.$emit('changeTimeSelect', val, isTime, source)
      this.timeSelectLabel = this.$refs.timeSelect?.getPeriod()?.label
    },

    toFullscreen() {
      this.lineChartDialog = true
    },

    toInitialList() {
      this.initialListDialog = true
    },

    getInputOutput(data) {
      let keyArr = [
        'inputInsertTotal',
        'inputUpdateTotal',
        'inputDeleteTotal',
        'inputDdlTotal',
        'inputOthersTotal',
        'outputInsertTotal',
        'outputUpdateTotal',
        'outputDeleteTotal',
        'outputDdlTotal',
        'outputOthersTotal'
      ]
      let result = {
        input: {},
        output: {}
      }
      keyArr.forEach(el => {
        for (let key in result) {
          let item = result[key]
          if (el.includes(key)) {
            item[el.replace(key, '')] = data?.[el] || 0
          }
        }
      })
      return result
    },

    calcTimeUnit(val, fix) {
      return val ? calcTimeUnit(val, fix) : '-'
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .el-dialog {
    .el-dialog__body {
      padding-top: 6px;
    }
  }
}

.layout-sidebar.--left {
  overflow: hidden auto;
  will-change: width;
  $headerH: 34px;

  ::v-deep {
    .el-collapse {
      border-top: 0;

      &-item {
        &.is-active [role='tab'] {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        &__header {
          position: relative;
          padding-left: 16px;
          padding-right: 16px;
          height: $headerH;
          font-size: 14px;

          &:hover {
            background-color: rgba(47, 46, 63, 0.05);
          }
        }

        &__wrap {
          padding-top: 16px;
        }

        &__arrow {
          order: -1;
          &:before {
            content: '\e791';
          }
        }

        &__content {
          padding-bottom: 0;
        }
      }
    }

    .el-scrollbar {
      height: 100%;
    }

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}

.info-box {
  padding: 16px;
  border-bottom: 1px solid #f2f2f2;
}
.task-info__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
