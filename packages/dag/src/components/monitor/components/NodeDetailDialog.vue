<script>
import { measurementApi } from '@tap/api'

import SharedMiningTable from '@tap/business/src/views/shared-mining/Table'
import TimeSelect from '@tap/component/src/TimeSelect.vue'

import i18n from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

import { mapGetters } from 'vuex'
import NodeIcon from '../../NodeIcon'
import { getTimeGranularity, TIME_FORMAT_MAP } from '../util'
import EventChart from './EventChart'
import Frequency from './Frequency'
import LineChart from './LineChart'

export default {
  name: 'NodeDetailDialog',
  components: {
    NodeIcon,
    EventChart,
    LineChart,
    TimeSelect,
    Frequency,
    SharedMiningTable,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },

    nodeId: {
      type: String,
      required: true,
    },

    dataflow: Object,

    getTimeRange: Function,

    ifEnableConcurrentRead: Boolean,
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
      refreshRate: 5000,
      currentNodeId: '',
      qpsChartsType: 'count',
    }
  },
  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    nodeItems() {
      return (
        this.allNodes
          .filter((t) => !['mem_cache'].includes(t.type))
          .map((t) => {
            return {
              node: t,
              label: t.name,
              value: t.id,
            }
          }) || []
      )
    },

    isLogCollector() {
      return ['logCollector'].includes(this.dataflow.syncType)
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

    qpsMap() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          name: [],
          value: [[], []],
          markLine: [
            {
              data: [],
            },
          ],
        }
      }
      const { time = [] } = this.quota
      const inputQps = data.inputQps?.map((t) => Math.abs(t))
      const outputQps = data.outputQps?.map((t) => Math.abs(t))
      const inputSizeQps = data.inputSizeQps?.map((t) => Math.abs(t))
      const outputSizeQps = data.outputSizeQps?.map((t) => Math.abs(t))
      // 计算距离增量时间点，最近的时间点
      const milestone = this.dataflow.attrs?.milestone || {}
      const snapshotDoneAt = milestone.SNAPSHOT?.end
      let markLineTime = 0
      time.forEach((el) => {
        if (
          Math.abs(el - snapshotDoneAt) < 2000 &&
          Math.abs(el - snapshotDoneAt) < Math.abs(el - markLineTime)
        ) {
          markLineTime = el
        }
      })

      const opt = {
        x: time,
        name: [i18n.t('public_time_input'), i18n.t('public_time_output')],
        // value: [inputQps, outputQps],
        value: [],
        zoomValue: 10,
      }

      if (this.dataflow.type === 'initial_sync+cdc') {
        opt.markLine = [
          {
            symbol: 'none',
            data: [
              {
                xAxis: String(markLineTime),
                lineStyle: {
                  color: '#000',
                },
                label: {
                  show: false,
                },
              },
            ],
          },
        ]
      }

      return {
        count: Object.assign(cloneDeep(opt), {
          value: [inputQps, outputQps],
        }),
        size: Object.assign(cloneDeep(opt), {
          value: [inputSizeQps, outputSizeQps],
        }),
      }
    },

    delayLineTitle() {
      const { isSource, isTarget } = this
      let result = i18n.t(
        'packages_dag_components_nodedetaildialog_chulihaoshi',
      )
      if (isSource) {
        result = i18n.t('packages_dag_components_nodedetaildialog_duquchulihao')
      } else if (isTarget) {
        result = i18n.t(
          'packages_dag_components_nodedetaildialog_chulixieruhao',
        )
      }
      return result
    },

    delayLineInfo() {
      const { isSource, isTarget } = this
      let result = i18n.t(
        'packages_dag_components_nodedetaildialog_chulihaoshi',
      )
      if (isSource) {
        result = i18n.t('packages_dag_components_nodedetaildialog_duquchulihao')
      } else if (isTarget) {
        result = i18n.t(
          'packages_dag_components_nodedetaildialog_chulixieruhao',
        )
      }
      return result
    },

    // 增量延迟
    delayData() {
      const data = this.quota.samples?.lineChartData?.[0]
      if (!data) {
        return {
          x: [],
          value: [],
        }
      }
      const { time = [] } = this.quota
      const { isSource, isTarget } = this
      const result = {
        x: time,
        name: [i18n.t('packages_dag_components_nodedetaildialog_chulihaoshi')],
        value: data.timeCostAvg,
      }
      if (isSource) {
        result.name = [
          i18n.t('packages_dag_components_nodedetaildialog_chulihaoshi'),
          i18n.t('packages_dag_components_nodedetaildialog_pingjunduquhao'),
          i18n.t('packages_dag_components_nodedetaildialog_zengliangduquyan'),
        ]
        result.value = [
          data.timeCostAvg,
          data.snapshotSourceReadTimeCostAvg,
          data.incrementalSourceReadTimeCostAvg,
        ]
      } else if (isTarget) {
        result.name = [
          i18n.t('packages_dag_components_nodedetaildialog_chulihaoshi'),
          i18n.t('packages_dag_components_nodedetaildialog_xieruhaoshi'),
        ]
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
        currentEventTimestamp,
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
        currentEventTimestamp,
      }
    },

    node() {
      return this.allNodes.find((t) => this.selected === t.id) || {}
    },

    nodeConnectionId() {
      return this.node.connectionIds?.[0]
    },

    isSource() {
      const { type, $inputs } = this.node
      return (
        (type === 'database' || type === 'table' || type === 'logCollector') &&
        !$inputs.length
      )
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
        snapshotDoneAt,
        snapshotStartAt,
        replicateLag,
        lastFiveMinutesQps,
      } = data
      let time
      if (!snapshotInsertRowTotal || !snapshotRowTotal || !lastFiveMinutesQps) {
        time = 0
      } else {
        time =
          ((snapshotRowTotal - snapshotInsertRowTotal) / lastFiveMinutesQps) *
          1000
      }
      return {
        snapshotDoneAt: snapshotDoneAt
          ? dayjs(snapshotDoneAt).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '',
        snapshotStartAt: snapshotStartAt
          ? dayjs(snapshotStartAt).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '',
        replicateLag,
        finishDuration: time,
      }
    },

    totalData() {
      let {
        snapshotTableTotal = 0,
        tableTotal = 0,
        snapshotInsertRowTotal = 0,
        snapshotRowTotal = 0,
        currentSnapshotTableInsertRowTotal = 0,
        currentSnapshotTableRowTotal = 0,
      } = this.quota.samples?.totalData?.[0] || {}
      // 如果分子大于分母，将分母的值调整成跟分子一样
      if (currentSnapshotTableInsertRowTotal > currentSnapshotTableRowTotal) {
        currentSnapshotTableRowTotal = currentSnapshotTableInsertRowTotal
      }
      return {
        snapshotTableTotal,
        tableTotal,
        snapshotInsertRowTotal,
        snapshotRowTotal,
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal,
      }
    },

    totalDataPercentage() {
      const { snapshotTableTotal, tableTotal } = this.totalData
      return snapshotTableTotal && tableTotal
        ? (snapshotTableTotal / tableTotal) * 100
        : 0
    },

    currentTotalDataPercentage() {
      const {
        currentSnapshotTableInsertRowTotal,
        currentSnapshotTableRowTotal,
      } = this.totalData
      return currentSnapshotTableRowTotal
        ? (currentSnapshotTableInsertRowTotal / currentSnapshotTableRowTotal) *
            100
        : 0
    },

    chartBoxWidth100() {
      const { isSource, isTarget } = this
      return !isSource && !isTarget
    },
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
    },
  },
  methods: {
    init() {
      if (!this.selected) {
        this.selected = this.nodeId
      }
      this.currentNodeId = this.selected //当前nodeId
      this.setPeriod()
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.quotaTimeType !== 'custom' &&
          this.dataflow?.status === 'running' &&
          this.loadQuotaData()
      }, this.refreshRate)
      this.loadQuotaData(true)
      this.$nextTick(() => {
        this.$refs.qpsLineChart?.reset?.()
        this.$refs.delayLineChart?.reset?.()
        this.$refs.delayLineChart?.clear?.()
        this.isLogCollector && this.$refs.sharedMiningTable?.fetch?.()
      })
    },

    setPeriod() {
      if (this.quotaTimeType === 'custom') {
        this.period = this.quotaTime.join()
      } else {
        this.period = this.quotaTimeType
      }
    },

    getFilter(type) {
      const { id: taskId, taskRecordId } = this.dataflow || {}
      const nodeId = this.selected
      const [startAt, endAt] =
        this.quotaTimeType === 'custome'
          ? this.quotaTime
          : this.getTimeRange(this.quotaTimeType)
      const params = {
        startAt,
        endAt,
        samples: {},
      }
      const samples = {
        // 任务事件统计（条）- 任务累计 + 全量信息 + 增量信息
        totalData: {
          tags: {
            type: 'node',
            taskId,
            taskRecordId,
            nodeId,
          },
          endAt: Time.now(), // 停止时间 || 当前时间
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
            'outputQps',
          ],
          //
          type: 'instant', // 瞬时值
        },
        // 任务事件统计（条）-所选周期累计
        barChartData: {
          tags: {
            type: 'node',
            taskId,
            taskRecordId,
            nodeId,
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
            'outputOthersTotal',
          ],
          type: 'difference',
        },
        // qps + 增量延迟
        lineChartData: {
          tags: {
            type: 'node',
            taskId,
            taskRecordId,
            nodeId,
          },
          fields: [
            'qps',
            'inputQps',
            'outputQps',
            'timeCostAvg',
            'snapshotSourceReadTimeCostAvg',
            'incrementalSourceReadTimeCostAvg',
            'targetWriteTimeCostAvg',
            'inputSizeQps',
            'outputSizeQps',
            'qpsType',
          ],
          type: 'continuous', // 连续数据
        },
      }
      params.samples.data = samples[type]
      return params
    },

    loadQuotaData(showLoading = false) {
      if (showLoading) {
        this.loading = true
      }
      const startStamp = Time.now()
      const params = {
        totalData: {
          uri: '/api/measurement/query/v2',
          param: this.getFilter('totalData'),
        },
        barChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getFilter('barChartData'),
        },
        lineChartData: {
          uri: '/api/measurement/query/v2',
          param: this.getFilter('lineChartData'),
        },
      }
      measurementApi
        .batch(params)
        .then((data) => {
          const quota = {
            samples: {},
            time: [],
            interval: 5000,
          }
          const arr = ['totalData', 'barChartData', 'lineChartData']
          arr.forEach((el) => {
            const item = data[el]
            if (item.code === 'ok') {
              quota.samples[el] = item.data?.samples?.data
              if (item.data?.interval) {
                quota.interval = item.data.interval
              }
              if (item.data?.time) {
                quota.time = item.data.time
              }
            }
          })
          this.quota = quota
          const granularity = getTimeGranularity(this.quota.interval)
          this.timeFormat = TIME_FORMAT_MAP[granularity]
        })
        .finally(() => {
          this.loading &&
            setTimeout(
              () => {
                this.loading = false
              },
              Time.now() - startStamp < 1000 ? 1000 : 0,
            )
        })
    },

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(type) : '-'
    },

    getInputOutput(data = {}) {
      const keyArr = [
        'insertTotal',
        'updateTotal',
        'deleteTotal',
        'ddlTotal',
        'othersTotal',
      ]
      const result = {
        input: {},
        output: {},
      }
      const newData = {}
      for (const key in data) {
        newData[key.toLowerCase()] = data[key] || 0
      }
      keyArr.forEach((el) => {
        for (const key in result) {
          result[key][el] =
            newData[key + el.toLowerCase()] || newData[el.toLowerCase()] || 0
        }
      })
      return result
    },

    changeTimeSelect(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime
        ? val?.split(',')?.map((t) => Number(t))
        : this.getTimeRange(val)
      this.init()
    },

    changeFrequency(val) {
      this.refreshRate = val
      this.init()
    },

    handleSelect() {
      this.$refs.nodeSelect?.focus()
    },

    calcTimeUnit() {
      return typeof val === 'number' ? calcTimeUnit(...arguments) : '-'
    },

    onClose() {
      this.$emit('update:value', false)
      this.$emit('load-data')
    },
  },
  emits: ['update:value', 'load-data', 'load-data'],
}
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="$t('packages_dag_components_nodedetaildialog_jiedianxiangqing')"
    width="1100px"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @close="onClose"
  >
    <div class="flex mb-4 align-items-center">
      <div
        class="select__row flex align-items-center"
        @click.stop="handleSelect"
      >
        <span class="text-nowrap">{{
          $t('packages_dag_components_nodedetaildialog_jiedian')
        }}</span>
        <ElSelect
          ref="nodeSelect"
          v-model="selected"
          class="ml-2 dark"
          filterable
          @change="init()"
        >
          <ElOption
            v-for="(item, index) in nodeItems"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
            <div class="flex align-center mx-n1">
              <NodeIcon class="mr-2" :node="item.node" :size="18" />
              <span>{{ item.label }}</span>
            </div>
          </ElOption>
        </ElSelect>
      </div>
      <TimeSelect
        :value="period"
        :range="$attrs.range"
        class="ml-4"
        @change="changeTimeSelect"
      />
      <Frequency :range="$attrs.range" @change="changeFrequency" />
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('public_button_refresh')"
      >
        <VIcon class="color-primary" @click="init">refresh</VIcon>
      </ElTooltip>
    </div>
    <div v-if="isLogCollector">
      <div v-loading="loading" class="chart-box rounded-2 w-100">
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_shijiantongji') }}
        </div>
        <div class="chart-box__content px-4 pb-2">
          <EventChart :samples="[eventDataAll, eventDataPeriod]" />
        </div>
      </div>
    </div>
    <template v-else>
      <div class="flex justify-content-between">
        <div
          v-loading="loading"
          class="chart-box rounded-2"
          :class="{ 'w-100': chartBoxWidth100 }"
        >
          <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
            {{ $t('packages_dag_components_nodedetaildialog_shijiantongji') }}
          </div>
          <div class="chart-box__content px-4 pb-2">
            <EventChart :samples="[eventDataAll, eventDataPeriod]" />
          </div>
        </div>
        <div
          v-if="isSource"
          v-loading="loading"
          class="chart-box rounded-2 flex flex-column"
        >
          <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
            {{ $t('packages_dag_components_nodedetaildialog_tongbuzhuangtai') }}
          </div>
          <div class="chart-box__content p-6 fs-8">
            <template v-if="dataflow.type !== 'cdc'">
              <div class="mb-4 flex justify-content-between">
                <span>{{
                  $t(
                    'packages_dag_components_nodedetaildialog_quanliangkaishishi',
                  )
                }}</span>
                <span>{{ initialData.snapshotStartAt || '-' }}</span>
              </div>
              <div
                v-if="initialData.snapshotDoneAt"
                class="mb-4 flex justify-content-between"
              >
                <span>{{
                  $t('packages_dag_monitor_leftsider_quanliangwanchengshi')
                }}</span>
                <span>{{ initialData.snapshotDoneAt }}</span>
              </div>
              <div v-else class="mb-4 flex justify-content-between">
                <span>{{
                  $t('packages_dag_monitor_leftsider_yujiquanliangwan')
                }}</span>
                <ElTooltip
                  transition="tooltip-fade-in"
                  :content="`${initialData.finishDuration.toLocaleString()}ms`"
                >
                  <span>{{ calcTimeUnit(initialData.finishDuration) }}</span>
                </ElTooltip>
              </div>
              <div class="mb-4 flex align-items-center">
                <span class="mr-2">{{
                  $t('public_task_full_sync_progress')
                }}</span>
                <ElProgress
                  class="flex-1 my-2"
                  :show-text="false"
                  style="width: 150px"
                  :percentage="totalDataPercentage"
                />
                <span class="ml-2">{{
                  `${totalData.snapshotTableTotal}/${totalData.tableTotal}`
                }}</span>
              </div>
              <div
                v-if="
                  dataflow.syncType === 'migrate' &&
                  totalData.currentSnapshotTableRowTotal &&
                  !ifEnableConcurrentRead
                "
                class="mb-4 flex align-items-center"
              >
                <span class="mr-2">{{
                  $t(
                    'packages_dag_components_nodedetaildialog_dangqianbiaotongbu',
                  )
                }}</span>
                <ElProgress
                  class="flex-1 my-2"
                  :show-text="false"
                  :percentage="currentTotalDataPercentage"
                />
                <span class="ml-2">{{
                  `${totalData.currentSnapshotTableInsertRowTotal || 0}/${
                    totalData.currentSnapshotTableRowTotal || 0
                  }`
                }}</span>
              </div>
            </template>
            <template v-if="dataflow.type !== 'initial_sync'">
              <div
                v-if="targetData.currentEventTimestamp"
                class="mb-4 flex justify-content-between"
              >
                <span>{{
                  $t(
                    'packages_dag_components_nodedetaildialog_zengliangshijiandian2',
                  )
                }}</span>
                <span>{{
                  formatTime(
                    targetData.currentEventTimestamp,
                    'YYYY-MM-DD HH:mm:ss.SSS',
                  )
                }}</span>
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
          <div
            class="chart-box__content p-6 fs-8 flex flex-column align-items-center flex-fill justify-content-center"
          >
            <template v-if="dataflow.type !== 'initial_sync'">
              <div
                v-if="targetData.currentEventTimestamp"
                class="mb-4 flex justify-content-between"
              >
                <span>{{
                  $t(
                    'packages_dag_components_nodedetaildialog_zengliangshijiandian2',
                  )
                }}</span>
                <span>{{
                  formatTime(
                    targetData.currentEventTimestamp,
                    'YYYY-MM-DD HH:mm:ss.SSS',
                  )
                }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="my-4">
        {{ $t('packages_dag_components_nodedetaildialog_xingnengzhibiao') }}
      </div>
      <div class="flex justify-content-between">
        <div v-loading="loading" class="chart-box rounded-2">
          <div
            class="flex justify-content-between align-items-center chart-box__title px-4"
          >
            <div class="fw-bold font-color-normal flex align-items-center">
              <span class="mr-2">QPS</span>
              <ElTooltip
                transition="tooltip-fade-in"
                placement="top"
                :content="
                  qpsChartsType === 'count'
                    ? $t(
                        'packages_dag_components_nodedetaildialog_dangqianjiedianping',
                      )
                    : $t('packages_dag_monitor_leftsider_qpSshizhi2')
                "
              >
                <VIcon class="color-primary">info</VIcon>
              </ElTooltip>
            </div>
            <ElRadioGroup v-model="qpsChartsType" class="chart__radio">
              <ElRadioButton label="count">count</ElRadioButton>
              <ElRadioButton label="size">size</ElRadioButton>
            </ElRadioGroup>
          </div>
          <div class="chart-box__content p-4">
            <LineChart
              ref="qpsLineChart"
              :data="qpsMap[qpsChartsType]"
              :color="['#26CF6C', '#2C65FF']"
              :time-format="timeFormat"
              :label-unit-type="qpsChartsType === 'size' ? 'byte' : ''"
              auto-scale
            />
          </div>
        </div>
        <div v-loading="loading" class="chart-box rounded-2">
          <div
            class="chart-box__title py-2 px-4 fw-bold font-color-normal flex align-items-center"
          >
            <span class="mr-2">{{ delayLineTitle }}</span>
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              class="inline-flex align-items-center"
            >
              <VIcon class="color-primary">info</VIcon>
              <template v-if="isSource" #content>
                <div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_chulihaoshiyuan',
                      )
                    }}
                  </div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_pingjunduquhao2',
                      )
                    }}
                  </div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_zengliangduquyan2',
                      )
                    }}
                  </div>
                </div>
              </template>
              <template v-else-if="isTarget" #content>
                <div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_chulihaoshidang',
                      )
                    }}
                  </div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_xieruhaoshidang',
                      )
                    }}
                  </div>
                </div>
              </template>
              <template v-else #content>
                <div>
                  <div>
                    {{
                      $t(
                        'packages_dag_components_nodedetaildialog_dangqianjiedianchu',
                      )
                    }}
                  </div>
                </div>
              </template>
            </ElTooltip>
          </div>
          <div class="chart-box__content p-4">
            <LineChart
              ref="delayLineChart"
              :data="delayData"
              :time-format="timeFormat"
              :color="['#2C65FF']"
              time-value
            />
          </div>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  .el-dialog__body {
    padding-top: 6px;
  }
}

.chart-box {
  width: 48%;
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
  :deep(.chart__radio) {
    .el-radio-button--mini .el-radio-button__inner {
      padding: 4px 8px;
    }
  }

  :deep(.total-line) {
    margin-bottom: 20px !important;
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

  :deep(.el-select) {
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
.search-input {
  width: 350px;
}
.shared-mining-table {
  height: 350px;
}
</style>
