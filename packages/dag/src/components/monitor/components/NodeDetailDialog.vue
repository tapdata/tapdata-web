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
    </div>
    <div class="flex justify-content-between">
      <div v-loading="loading" class="chart-box rounded-2" :class="{ 'w-100': !isSource && !isTarget }">
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
        <div class="chart-box__content p-4 flex-fill flex align-items-center">
          <div class="text-center pb-10 w-100">
            <div class="mb-4">
              <div class="font-color-normal fw-bold mb-1 din-font">{{ calcTimeUnit(sourceData.tcpPing, 2) }}</div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_tcPlianjie') }}</div>
            </div>
            <div class="mb-4">
              <div class="font-color-normal fw-bold mb-1 din-font">
                {{ calcTimeUnit(sourceData.connectPing, 2) }}
              </div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_xieyilianjiehao') }}</div>
            </div>
            <div>
              <div class="font-color-normal fw-bold mb-1 din-font">
                {{ formatTime(sourceData.currentEventTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS') }}
              </div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_zengliangshijiandian') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="isTarget"
        v-loading="loading"
        :class="{ 'w-100': !isSource && !isTarget }"
        class="chart-box rounded-2 flex flex-column"
      >
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_lianjiezhuangtai') }}
        </div>
        <div class="chart-box__content p-4 flex-fill flex align-items-center">
          <div class="text-center pb-10 w-100">
            <div class="mb-4">
              <div class="font-color-normal fw-bold mb-1 din-font">{{ calcTimeUnit(targetData.tcpPing, 2) }}</div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_tcPlianjie') }}</div>
            </div>
            <div class="mb-4">
              <div class="font-color-normal fw-bold mb-1 din-font">
                {{ calcTimeUnit(targetData.connectPing, 2) }}
              </div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_xieyilianjiehao') }}</div>
            </div>
            <div>
              <div class="font-color-normal fw-bold mb-1 din-font">
                {{ formatTime(targetData.currentEventTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS') }}
              </div>
              <div>{{ $t('packages_dag_components_nodedetaildialog_zengliangshijiandian') }}</div>
            </div>
          </div>
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
            title="QPS（Q/S）"
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
            :title="$t('packages_dag_components_nodedetaildialog_zengliangyanchi')"
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
import { TIME_FORMAT_MAP, getTimeGranularity } from '../util'

export default {
  name: 'NodeDetailDialog',

  components: { EventChart, LineChart, TimeSelect },

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
      loading: false
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
      return {
        x: time,
        value: data.timeCostAvg
      }
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
      }, 5000)
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
      const [startAt, endAt] = this.quotaTime
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
              'snapshotInsertRowTotal'
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
            fields: ['qps', 'inputQps', 'outputQps', 'timeCostAvg'],
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
