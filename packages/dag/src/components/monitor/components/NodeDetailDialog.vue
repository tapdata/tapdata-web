<template>
  <ElDialog
    :title="$t('packages_dag_components_nodedetaildialog_jiedianxiangqing')"
    width="774px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @close="$emit('input', false)"
  >
    <div class="flex mb-4 align-items-center">
      <div class="select__row flex align-items-center" @click.stop="handleSelect">
        <span>{{ $t('packages_dag_components_nodedetaildialog_jiedian') }}</span>
        <ElSelect v-model="selected" class="ml-2 dark" ref="nodeSelect" filterable @change="init">
          <ElOption v-for="(item, index) in nodeItems" :key="index" :label="item.label" :value="item.value"></ElOption>
        </ElSelect>
      </div>
      <TimeSelect :value="period" :range="$attrs.range" class="ml-4" @change="changeTimeSelect"></TimeSelect>
      <Frequency :range="$attrs.range" @change="changeFrequency"></Frequency>
      <ElTooltip transition="tooltip-fade-in" content="刷新">
        <VIcon class="color-primary" @click="init">refresh</VIcon>
      </ElTooltip>
    </div>
    <div class="flex justify-content-between">
      <div v-loading="loading" class="chart-box rounded-2" :class="{ 'w-100': chartBoxWidth100 }">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_shijiantongji') }}
        </div>
        <div class="chart-box__content px-4 pb-2">
          <EventChart :samples="[eventDataAll, eventDataPeriod]"></EventChart>
        </div>
      </div>
      <div v-if="isSource" v-loading="loading" class="chart-box rounded-2 flex flex-column">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_tongbuzhuangtai') }}
        </div>
        <div class="chart-box__content p-6 fs-8">
          <template v-if="dataflow.type !== 'cdc'">
            <div class="mb-4 flex justify-content-between">
              <span>全量开始时间：</span>
              <span>{{ initialData.snapshotStartAt || '-' }}</span>
            </div>
            <div v-if="initialData.snapshotDoneAt" class="mb-4 flex justify-content-between">
              <span>{{ $t('packages_dag_monitor_leftsider_quanliangwanchengshi') }}</span>
              <span>{{ initialData.snapshotDoneAt }}</span>
            </div>
            <div v-else class="mb-4 flex justify-content-between">
              <span>{{ $t('packages_dag_monitor_leftsider_yujiquanliangwan') }}</span>
              <ElTooltip transition="tooltip-fade-in" :content="initialData.finishDuration.toLocaleString() + 'ms'">
                <span>{{ calcTimeUnit(initialData.finishDuration, 2) }}</span>
              </ElTooltip>
            </div>
            <div class="mb-4 flex align-items-center">
              <span class="mr-2">全量同步进度</span>
              <ElProgress
                class="flex-1 my-2"
                :show-text="false"
                style="width: 150px"
                :percentage="totalDataPercentage"
              />
              <span class="ml-2">{{ totalData.snapshotInsertRowTotal + '/' + totalData.snapshotRowTotal }}</span>
            </div>
            <div
              v-if="dataflow.syncType === 'migrate' && totalData.currentSnapshotTableRowTotal"
              class="mb-4 flex align-items-center"
            >
              <span class="mr-2">当前表同步进度</span>
              <ElProgress class="flex-1 my-2" :show-text="false" :percentage="currentTotalDataPercentage" />
              <span class="ml-2">{{
                (totalData.currentSnapshotTableInsertRowTotal || 0) +
                '/' +
                (totalData.currentSnapshotTableRowTotal || 0)
              }}</span>
            </div>
          </template>
          <template v-if="dataflow.type !== 'initial_sync'">
            <div v-if="initialData.snapshotDoneAt" class="mb-4 flex justify-content-between">
              <span>增量时间点：</span>
              <span>{{ formatTime(targetData.currentEventTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS') }}</span>
            </div>
          </template>
        </div>
      </div>
      <div
        v-else-if="isTarget"
        v-loading="loading"
        :class="{ 'w-100': !isSource && !isTarget }"
        class="chart-box rounded-2 flex flex-column"
      >
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_tongbuzhuangtai') }}
        </div>
        <div class="chart-box__content p-4 flex-fill flex align-items-center">
          <template v-if="dataflow.type !== 'initial_sync'">
            <div v-if="initialData.snapshotDoneAt" class="mb-4 flex justify-content-between">
              <span>增量时间点：</span>
              <span>{{ formatTime(targetData.currentEventTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS') }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="my-4">{{ $t('packages_dag_components_nodedetaildialog_xingnengzhibiao') }}</div>
    <div class="flex justify-content-between">
      <div v-loading="loading" class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">QPS</div>
        <div class="chart-box__content p-4">
          <LineChart
            :data="qpsData"
            :color="['#26CF6C', '#2C65FF']"
            :time-format="timeFormat"
            ref="qpsLineChart"
          ></LineChart>
        </div>
      </div>
      <div v-loading="loading" class="chart-box rounded-2">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_chulihaoshi') }}
        </div>
        <div class="chart-box__content p-4">
          <LineChart
            :data="delayData"
            :time-format="timeFormat"
            :color="['#2C65FF']"
            time-value
            ref="delayLineChart"
          ></LineChart>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { mapGetters } from 'vuex'

import { measurementApi } from '@tap/api'
import { calcTimeUnit } from '@tap/shared'

import EventChart from './EventChart'
import LineChart from './LineChart'
import TimeSelect from './TimeSelect'
import Frequency from './Frequency'
import { TIME_FORMAT_MAP, getTimeGranularity } from '../util'

export default {
  name: 'NodeDetailDialog',

  components: { EventChart, LineChart, TimeSelect, Frequency },

  props: {
    value: {
      type: Boolean,
      default: false
    },

    nodeId: {
      type: String,
      required: true
    },

    dataflow: Object,

    getTimeRange: Function
  },

  data() {
    return {
      period: '',
      visible: false,
      selected: '',
      quota: {},
      timeFormat: 'HH:mm:ss',
      quotaTime: [],
      quotaTimeType: '5m',
      loading: false,
      refreshRate: 5000
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    nodeItems() {
      return (
        this.allNodes.map(t => {
          return {
            label: t.name,
            value: t.id
          }
        }) || []
      )
    },

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
      const { qps, inputQps = [], outputQps = [] } = data
      const { time = [] } = this.quota
      return {
        x: time,
        name: [
          i18n.t('packages_dag_components_nodedetaildialog_shuru'),
          i18n.t('packages_dag_components_nodedetaildialog_shuchu')
        ],
        value: [qps || inputQps, qps || outputQps]
      }
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          value: []
        }
      }
      const { time = [] } = this.quota
      const { isSource, isTarget } = this
      let result = {
        x: time,
        name: ['处理耗时'],
        value: data.timeCostAvg
      }
      if (isSource) {
        result.name = ['处理耗时', '平均读取耗时', '增量读取延迟']
        result.value = [data.timeCostAvg, data.snapshotSourceReadTimeCostAvg, data.incrementalSourceReadTimeCostAvg]
      } else if (isTarget) {
        result.name = ['处理耗时', '写入耗时']
        result.value = [data.timeCostAvg, data.targetWriteTimeCostAvg]
      }
      return result
    },

    // 源节点-同步状态
    sourceData() {
      const data = this.quota.samples?.totalData?.[0]
      if (!data) {
        return {}
      }
      const { tcpPing, connectPing, currentEventTimestamp } = data
      return {
        tcpPing,
        connectPing,
        currentEventTimestamp
      }
    },

    // 目标节点-连接状态
    targetData() {
      const data = this.quota.samples?.totalData?.[0]
      if (!data) {
        return {}
      }
      const { tcpPing, connectPing, currentEventTimestamp } = data
      return {
        tcpPing,
        connectPing,
        currentEventTimestamp
      }
    },

    node() {
      return this.allNodes.find(t => this.selected === t.id) || {}
    },

    isSource() {
      const { type, $inputs } = this.node
      return (type === 'database' || type === 'table') && !$inputs.length
    },

    isTarget() {
      const { type, $outputs } = this.node
      return (type === 'database' || type === 'table') && !$outputs.length
    },

    initialData() {
      const data = this.quota.samples?.totalData?.[0] || {}
      const {
        snapshotRowTotal = 0,
        snapshotInsertRowTotal = 0,
        outputQps = 0,
        snapshotDoneAt,
        snapshotStartAt,
        replicateLag
      } = data
      const time = outputQps ? Math.ceil(((snapshotRowTotal - snapshotInsertRowTotal) / outputQps) * 1000) : 0 // 剩余待同步的数据量/当前的同步速率, outputQps行每秒
      return {
        snapshotDoneAt: snapshotDoneAt ? dayjs(snapshotDoneAt).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        snapshotStartAt: snapshotStartAt ? dayjs(snapshotStartAt).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        replicateLag: replicateLag,
        finishDuration: time
      }
    },

    totalData() {
      const {
        snapshotInsertRowTotal = 0,
        snapshotRowTotal = 0,
        currentSnapshotTableInsertRowTotal = 0,
        currentSnapshotTableRowTotal = 0
      } = this.quota.samples?.totalData?.[0] || {}
      return {
        snapshotInsertRowTotal,
        snapshotRowTotal,
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal
      }
    },

    totalDataPercentage() {
      const { snapshotInsertRowTotal, snapshotRowTotal } = this.totalData
      return snapshotInsertRowTotal && snapshotRowTotal ? (snapshotInsertRowTotal / snapshotRowTotal) * 100 : 0
    },

    currentTotalDataPercentage() {
      const { currentSnapshotTableInsertRowTotal, currentSnapshotTableRowTotal } = this.totalData
      return currentSnapshotTableRowTotal
        ? (currentSnapshotTableInsertRowTotal / currentSnapshotTableRowTotal) * 100
        : 0
    },

    chartBoxWidth100() {
      const { isSource, isTarget } = this
      return !isSource && !isTarget
    }
  },

  watch: {
    value(v) {
      this.visible = !!v
      if (v) {
        this.init()
      } else {
        this.timer && clearInterval(this.timer)
        this.selected = ''
      }
    }
  },

  methods: {
    init() {
      if (!this.selected) {
        this.selected = this.nodeId
      }
      this.setPeriod()
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.quotaTimeType !== 'custom' && this.dataflow?.status === 'running' && this.loadQuotaData()
      }, this.refreshRate)
      this.loadQuotaData(true)
      this.$nextTick(() => {
        this.$refs.qpsLineChart?.reset?.()
        this.$refs.delayLineChart?.reset?.()
      })
    },

    setPeriod() {
      if (this.quotaTimeType === 'custom') {
        this.period = this.quotaTime.join()
      } else {
        this.period = this.quotaTimeType
      }
    },

    getFilter() {
      const { id: taskId, taskRecordId } = this.dataflow || {}
      const nodeId = this.selected
      const [startAt, endAt] = this.quotaTimeType === 'custome' ? this.quotaTime : this.getTimeRange(this.quotaTimeType)
      let params = {
        startAt,
        endAt,
        samples: {
          // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
          totalData: {
            tags: {
              type: 'node',
              taskId,
              taskRecordId,
              nodeId
            },
            endAt: Date.now(), // 停止时间 || 当前时间
            fields: [
              'insertTotal',
              'updateTotal',
              'deleteTotal',
              'ddlTotal',
              'othersTotal',
              'tcpPing',
              'connectPing',
              'currentEventTimestamp',
              'inputInsertTotal',
              'inputUpdateTotal',
              'inputDeleteTotal',
              'inputDdlTotal',
              'inputOthersTotal',
              'outputInsertTotal',
              'outputUpdateTotal',
              'outputDeleteTotal',
              'outputDdlTotal',
              'outputOthersTotal',
              'tableTotal',
              'snapshotTableTotal',
              'snapshotRowTotal',
              'snapshotInsertRowTotal',
              'currentSnapshotTableRowTotal',
              'currentSnapshotTableInsertRowTotal',
              'replicateLag',
              'snapshotStartAt',
              'snapshotDoneAt',
              'outputQps'
            ],
            //
            type: 'instant' // 瞬时值
          },
          // 任务事件统计（条）-所选周期累计
          barChartData: {
            tags: {
              type: 'node',
              taskId,
              taskRecordId,
              nodeId
            },
            fields: [
              'insertTotal',
              'updateTotal',
              'deleteTotal',
              'ddlTotal',
              'othersTotal',
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
            ],
            type: 'difference'
          },
          // qps + 增量延迟
          lineChartData: {
            tags: {
              type: 'node',
              taskId,
              taskRecordId,
              nodeId
            },
            fields: [
              'qps',
              'inputQps',
              'outputQps',
              'timeCostAvg',
              'snapshotSourceReadTimeCostAvg',
              'incrementalSourceReadTimeCostAvg',
              'targetWriteTimeCostAvg'
            ],
            type: 'continuous' // 连续数据
          }
        }
      }
      return params
    },

    loadQuotaData(showLoading = false) {
      if (showLoading) {
        this.loading = true
      }
      const startStamp = Date.now()
      measurementApi
        .queryV2(this.getFilter())
        .then(data => {
          this.quota = data
          const granularity = getTimeGranularity(data.interval)
          this.timeFormat = TIME_FORMAT_MAP[granularity]
        })
        .finally(() => {
          this.loading &&
            setTimeout(
              () => {
                this.loading = false
              },
              Date.now() - startStamp < 1000 ? 1000 : 0
            )
        })
    },

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(type) : '-'
    },

    getInputOutput(data = {}) {
      let keyArr = ['insertTotal', 'updateTotal', 'deleteTotal', 'ddlTotal', 'othersTotal']
      let result = {
        input: {},
        output: {}
      }
      let newData = {}
      for (let key in data) {
        newData[key.toLowerCase()] = data[key] || 0
      }
      keyArr.forEach(el => {
        for (let key in result) {
          result[key][el] = newData[key + el.toLowerCase()] || newData[el.toLowerCase()] || 0
        }
      })
      return result
    },

    changeTimeSelect(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
      this.init()
    },

    changeFrequency(val) {
      this.refreshRate = val
      this.init()
    },

    handleSelect() {
      this.$refs.nodeSelect?.focus()
    },

    calcTimeUnit(val, fix) {
      return typeof val === 'number' ? calcTimeUnit(val, fix) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dialog {
    .el-dialog__body {
      padding-top: 6px;
    }
  }
}
.chart-box {
  width: 355px;
  height: 286px;
  border: 1px solid #c9cdd4;
  &.disabled {
    border: none;
  }
}
.chart-box__title {
  //color: #333c4a;
  height: 38px;
  background: #fafafa;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.line-chart {
  height: 200px;
}
.event-chart {
  ::v-deep {
    .event-chart__radio {
      //position: absolute;
      //top: 4px;
      //right: 0;
      //margin-top: 0;
    }
    .total-line {
      margin-bottom: 20px !important;
    }
  }
}
.pie-chart {
  margin: 0 auto;
  width: 70px;
  height: 70px;
}
.select__row {
  padding: 0 4px 0 0;
  height: 28px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: #eef3ff;
  }
  ::v-deep {
    .el-select {
      &.dark {
        .el-input__inner {
          border: none;
          background-color: inherit;
        }
        .el-icon-arrow-up:before {
          content: '\e78f';
        }
      }
    }
  }
}
</style>
