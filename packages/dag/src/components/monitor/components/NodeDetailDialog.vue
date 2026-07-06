<script setup lang="ts">
import { batchMeasurements } from '@tap/api/src/core/measurement'
import { withPassive } from '@tap/api/src/request'
import { IconButton } from '@tap/component/src/icon-button'
import TimeSelect from '@tap/component/src/TimeSelect.vue'
import { useI18n } from '@tap/i18n'
import { calcTimeUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { computed, nextTick, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'
import NodeIcon from '../../NodeIcon.vue'
import { getTimeGranularity, TIME_FORMAT_MAP } from '../util'
import EventChart from './EventChart.vue'
import Frequency from './Frequency.vue'
import LineChart from './LineChart.vue'

const props = defineProps<{
  value: boolean
  nodeId: string
  dataflow: any
  getTimeRange: (...args: any[]) => any
  ifEnableConcurrentRead?: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: boolean]
  'load-data': []
}>()

const { t } = useI18n()
const dataflowStore = useDataflowStore()
const allNodes = computed(() => dataflowStore.dag.nodes || [])

// data
const period = ref('')
const visible = ref(false)
const selected = ref('')
const quota = ref<any>({})
const timeFormat = ref('HH:mm:ss')
const quotaTime = ref<number[]>([])
const quotaTimeType = ref('5m')
const loading = ref(false)
const refreshRate = ref(5000)
const currentNodeId = ref('')
const qpsChartsType = ref('count')
let timer: ReturnType<typeof setInterval> | null = null

// template refs
const qpsLineChart = ref<any>(null)
const delayLineChart = ref<any>(null)
const sharedMiningTable = ref<any>(null)
const nodeSelect = ref<any>(null)

// computed
const nodeItems = computed(() =>
  allNodes.value
    .filter((t: any) => !['mem_cache'].includes(t.type))
    .map((t: any) => ({
      node: t,
      label: t.name,
      value: t.id,
    })),
)

const isLogCollector = computed(() =>
  ['logCollector'].includes(props.dataflow.syncType),
)

const eventDataAll = computed(() => {
  const data = quota.value.samples?.totalData?.[0]
  return getInputOutput(data)
})

const eventDataPeriod = computed(() => {
  const data = quota.value.samples?.barChartData?.[0]
  return getInputOutput(data)
})

const qpsMap = computed(() => {
  const data = quota.value.samples?.lineChartData?.[0]
  if (!data) {
    return {
      count: { x: [], name: [], value: [[], []], markLine: [{ data: [] }] },
      size: { x: [], name: [], value: [[], []], markLine: [{ data: [] }] },
    }
  }
  const { time = [] } = quota.value
  const inputQps = data.inputQps?.map((t: number) => Math.abs(t))
  const outputQps = data.outputQps?.map((t: number) => Math.abs(t))
  const inputSizeQps = data.inputSizeQps?.map((t: number) => Math.abs(t))
  const outputSizeQps = data.outputSizeQps?.map((t: number) => Math.abs(t))

  const milestone = props.dataflow.attrs?.milestone || {}
  const snapshotDoneAt = milestone.SNAPSHOT?.end
  let markLineTime = 0
  time.forEach((el: number) => {
    if (
      Math.abs(el - snapshotDoneAt) < 2000 &&
      Math.abs(el - snapshotDoneAt) < Math.abs(el - markLineTime)
    ) {
      markLineTime = el
    }
  })

  const opt: any = {
    x: time,
    name: [t('public_time_input'), t('public_time_output')],
    value: [],
    zoomValue: 10,
  }

  if (props.dataflow.type === 'initial_sync+cdc') {
    opt.markLine = [
      {
        symbol: 'none',
        data: [
          {
            xAxis: String(markLineTime),
            lineStyle: { color: '#000' },
            label: { show: false },
          },
        ],
      },
    ]
  }

  return {
    count: Object.assign(cloneDeep(opt), { value: [inputQps, outputQps] }),
    size: Object.assign(cloneDeep(opt), {
      value: [inputSizeQps, outputSizeQps],
    }),
  }
})

const node = computed(
  () => allNodes.value.find((t: any) => selected.value === t.id) || ({} as any),
)

const isSource = computed(() => {
  const { type, $inputs } = node.value
  return (
    (type === 'database' || type === 'table' || type === 'logCollector') &&
    !$inputs?.length
  )
})

const isTarget = computed(() => {
  const { type, $outputs } = node.value
  return (type === 'database' || type === 'table') && !$outputs?.length
})

const delayLineTitle = computed(() => {
  let result = t('packages_dag_components_nodedetaildialog_chulihaoshi')
  if (isSource.value) {
    result = t('packages_dag_components_nodedetaildialog_duquchulihao')
  } else if (isTarget.value) {
    result = t('packages_dag_components_nodedetaildialog_chulixieruhao')
  }
  return result
})

const delayData = computed(() => {
  const data = quota.value.samples?.lineChartData?.[0]
  if (!data) {
    return { x: [], value: [] }
  }
  const { time = [] } = quota.value
  const {
    timeCostAvg = [],
    snapshotSourceReadTimeCostAvg = [],
    incrementalSourceReadTimeCostAvg = [],
    targetWriteTimeCostAvg = [],
  } = data
  const result: any = {
    x: time,
    name: [t('packages_dag_components_nodedetaildialog_chulihaoshi')],
    value: [timeCostAvg],
  }
  if (isSource.value) {
    result.name = [
      t('packages_dag_components_nodedetaildialog_chulihaoshi'),
      t('packages_dag_components_nodedetaildialog_pingjunduquhao'),
      t('packages_dag_components_nodedetaildialog_zengliangduquyan'),
    ]
    result.value = [
      timeCostAvg,
      snapshotSourceReadTimeCostAvg,
      incrementalSourceReadTimeCostAvg,
    ]
  } else if (isTarget.value) {
    result.name = [
      t('packages_dag_components_nodedetaildialog_chulihaoshi'),
      t('packages_dag_components_nodedetaildialog_xieruhaoshi'),
    ]
    result.value = [timeCostAvg, targetWriteTimeCostAvg]
  }
  return result
})

const batchReadData = computed(() => {
  const data = quota.value.samples?.batchReadData?.[0]
  if (!data) {
    return { x: [], value: [], markLine: [{ data: [] }] }
  }
  const { time = [] } = quota.value
  const result: any = {
    x: time,
    name: [t('packages_dag_batch_read_size')],
    value: data.batchReadSize,
  }
  const milestone = props.dataflow.attrs?.milestone || {}
  const snapshotDoneAt = milestone.SNAPSHOT?.end
  let markLineTime = 0
  time.forEach((el: number) => {
    if (
      Math.abs(el - snapshotDoneAt) < 2000 &&
      Math.abs(el - snapshotDoneAt) < Math.abs(el - markLineTime)
    ) {
      markLineTime = el
    }
  })
  if (props.dataflow.type === 'initial_sync+cdc') {
    result.markLine = [
      {
        symbol: 'none',
        data: [
          {
            xAxis: String(markLineTime),
            lineStyle: { color: '#000' },
            label: { show: false },
          },
        ],
      },
    ]
  }
  return result
})

const sourceData = computed(() => {
  const data = quota.value.samples?.totalData?.[0]
  if (!data) return {}
  const { tcpPing, connectPing, currentEventTimestamp } = data
  return { tcpPing, connectPing, currentEventTimestamp }
})

const targetData = computed(() => {
  const data = quota.value.samples?.totalData?.[0]
  if (!data) return {}
  const { tcpPing, connectPing, currentEventTimestamp } = data
  return { tcpPing, connectPing, currentEventTimestamp }
})

const initialData = computed(() => {
  const data = quota.value.samples?.totalData?.[0] || {}
  const {
    snapshotRowTotal = 0,
    snapshotInsertRowTotal = 0,
    snapshotDoneAt,
    snapshotStartAt,
    replicateLag,
    lastFiveMinutesQps,
  } = data
  let time: number
  if (!snapshotInsertRowTotal || !snapshotRowTotal || !lastFiveMinutesQps) {
    time = 0
  } else {
    time =
      ((snapshotRowTotal - snapshotInsertRowTotal) / lastFiveMinutesQps) * 1000
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
})

const totalData = computed(() => {
  let {
    snapshotTableTotal = 0,
    tableTotal = 0,
    snapshotInsertRowTotal = 0,
    snapshotRowTotal = 0,
    currentSnapshotTableInsertRowTotal = 0,
    currentSnapshotTableRowTotal = 0,
  } = quota.value.samples?.totalData?.[0] || {}
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
})

const totalDataPercentage = computed(() => {
  const {
    snapshotTableTotal,
    tableTotal,
    snapshotRowTotal,
    snapshotInsertRowTotal,
  } = totalData.value

  if (props.dataflow.syncType === 'migrate')
    return tableTotal
      ? {
          val: Math.round((snapshotTableTotal / tableTotal) * 100),
          text: `${snapshotTableTotal}/${tableTotal}`,
        }
      : { val: 0, text: '' }
  if (snapshotTableTotal === tableTotal)
    return {
      val: 100,
      text: '',
    }
  return snapshotRowTotal
    ? {
        val: Math.round((snapshotInsertRowTotal / snapshotRowTotal) * 100),
        text: `${snapshotInsertRowTotal} / ${snapshotRowTotal}`,
      }
    : {
        val: 0,
        text: '',
      }
})

const currentTotalDataPercentage = computed(() => {
  const { currentSnapshotTableInsertRowTotal, currentSnapshotTableRowTotal } =
    totalData.value
  return currentSnapshotTableRowTotal
    ? (currentSnapshotTableInsertRowTotal / currentSnapshotTableRowTotal) * 100
    : 0
})

const chartBoxWidth100 = computed(() => !isSource.value && !isTarget.value)

// watch
watch(
  () => props.value,
  (v) => {
    visible.value = !!v
    if (v) {
      init()
    } else {
      timer && clearInterval(timer)
      selected.value = ''
    }
  },
)

// methods
function init() {
  if (!selected.value) {
    selected.value = props.nodeId
  }
  currentNodeId.value = selected.value
  setPeriod()
  timer && clearInterval(timer)
  timer = setInterval(() => {
    quotaTimeType.value !== 'custom' &&
      props.dataflow?.status === 'running' &&
      withPassive(loadQuotaData)
  }, refreshRate.value)
  loadQuotaData(true)
  nextTick(() => {
    qpsLineChart.value?.reset?.()
    delayLineChart.value?.reset?.()
    delayLineChart.value?.clear?.()
    isLogCollector.value && sharedMiningTable.value?.fetch?.()
  })
}

function setPeriod() {
  if (quotaTimeType.value === 'custom') {
    period.value = quotaTime.value.join()
  } else {
    period.value = quotaTimeType.value
  }
}

function getFilter(type: string) {
  const { id: taskId, taskRecordId } = props.dataflow || {}
  const nodeId = selected.value
  const [startAt, endAt] =
    quotaTimeType.value === 'custome'
      ? quotaTime.value
      : props.getTimeRange(quotaTimeType.value)
  const params: any = { startAt, endAt, samples: {} }
  const samples: any = {
    totalData: {
      tags: { type: 'node', taskId, taskRecordId, nodeId },
      endAt: Time.now(),
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
      type: 'instant',
    },
    barChartData: {
      tags: { type: 'node', taskId, taskRecordId, nodeId },
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
    lineChartData: {
      tags: { type: 'node', taskId, taskRecordId, nodeId },
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
      type: 'continuous',
    },
    batchReadData: {
      tags: { type: 'node', taskId, taskRecordId, nodeId },
      fields: ['batchReadSize', 'intervalMs'],
      type: 'continuous',
    },
  }
  params.samples.data = samples[type]
  return params
}

function loadQuotaData(showLoading = false) {
  if (showLoading) {
    loading.value = true
  }
  const startStamp = Time.now()
  const params = {
    totalData: {
      uri: '/api/measurement/query/v2',
      param: getFilter('totalData'),
    },
    barChartData: {
      uri: '/api/measurement/query/v2',
      param: getFilter('barChartData'),
    },
    lineChartData: {
      uri: '/api/measurement/query/v2',
      param: getFilter('lineChartData'),
    },
    batchReadData: {
      uri: '/api/measurement/query/v2',
      param: getFilter('batchReadData'),
    },
  }
  batchMeasurements(params)
    .then((data: any) => {
      const q: any = { samples: {}, time: [], interval: 5000 }
      const arr = [
        'totalData',
        'barChartData',
        'lineChartData',
        'batchReadData',
      ]
      arr.forEach((el) => {
        const item = data[el]
        if (item.code === 'ok') {
          q.samples[el] = item.data?.samples?.data
          if (item.data?.interval) q.interval = item.data.interval
          if (item.data?.time) q.time = item.data.time
        }
      })
      quota.value = q
      const granularity = getTimeGranularity(quota.value.interval)
      timeFormat.value = TIME_FORMAT_MAP[granularity]
    })
    .finally(() => {
      loading.value &&
        setTimeout(
          () => {
            loading.value = false
          },
          Time.now() - startStamp < 1000 ? 1000 : 0,
        )
    })
}

function formatTime(date: any, type = 'YYYY-MM-DD HH:mm:ss') {
  return date ? dayjs(date).format(type) : '-'
}

function getInputOutput(data: any = {}) {
  const keyArr = [
    'insertTotal',
    'updateTotal',
    'deleteTotal',
    'ddlTotal',
    'othersTotal',
  ]
  const result: any = { input: {}, output: {} }
  const newData: any = {}
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
}

function changeTimeSelect(val: any, isTime: boolean, source: any) {
  quotaTimeType.value = source?.type ?? val
  quotaTime.value = isTime
    ? val?.split(',')?.map((t: string) => Number(t))
    : props.getTimeRange(val)
  init()
}

function changeFrequency(val: number) {
  refreshRate.value = val
  init()
}

function handleSelect() {
  nodeSelect.value?.focus()
}

function onClose() {
  emit('update:value', false)
  emit('load-data')
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
          style="width: 200px"
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
        <IconButton class="color-primary" @click="init">refresh</IconButton>
      </ElTooltip>
    </div>
    <div class="flex flex-column gap-4">
      <div
        v-if="isSource || isTarget"
        v-loading="loading"
        class="chart-box rounded-xl flex flex-column"
      >
        <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
          {{ $t('packages_dag_components_nodedetaildialog_tongbuzhuangtai') }}
        </div>
        <div
          class="chart-box__content p-4 pt-0 grid-auto-column gap-3 font-color-sslight lh-base"
        >
          <template v-if="isSource">
            <template v-if="dataflow.type !== 'cdc'">
              <div class="flex flex-column gap-1">
                <span>{{
                  $t(
                    'packages_dag_components_nodedetaildialog_quanliangkaishishi',
                  )
                }}</span>
                <span class="font-color-dark">{{
                  initialData.snapshotStartAt || '-'
                }}</span>
              </div>
              <div
                v-if="initialData.snapshotDoneAt"
                class="flex flex-column gap-1"
              >
                <span>{{
                  $t('packages_dag_monitor_leftsider_quanliangwanchengshi')
                }}</span>
                <span class="font-color-dark">{{
                  initialData.snapshotDoneAt
                }}</span>
              </div>
              <div v-else class="flex flex-column gap-1">
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
              <div class="flex flex-column gap-1">
                <span class="mr-2">{{
                  $t('public_task_full_sync_progress')
                }}</span>
                <div class="flex align-center px-1">
                  <ElProgress
                    class="flex-1"
                    :show-text="false"
                    :percentage="totalDataPercentage.val"
                  />
                  <span class="ml-2">{{ totalDataPercentage.text }}</span>
                </div>
              </div>
              <div
                v-if="
                  dataflow.syncType === 'migrate' &&
                  totalData.currentSnapshotTableRowTotal &&
                  !ifEnableConcurrentRead
                "
                class="flex flex-column gap-1"
              >
                <span class="mr-2">{{
                  $t(
                    'packages_dag_components_nodedetaildialog_dangqianbiaotongbu',
                  )
                }}</span>
                <div class="flex align-center px-1">
                  <ElProgress
                    class="flex-1"
                    :show-text="false"
                    :percentage="currentTotalDataPercentage"
                  />
                  <span class="ml-2">{{
                    `${totalData.currentSnapshotTableInsertRowTotal || 0}/${
                      totalData.currentSnapshotTableRowTotal || 0
                    }`
                  }}</span>
                </div>
              </div>
            </template>
            <template v-if="dataflow.type !== 'initial_sync'">
              <div
                v-if="targetData.currentEventTimestamp"
                class="flex flex-column gap-1"
              >
                <span>{{
                  $t(
                    'packages_dag_components_nodedetaildialog_zengliangshijiandian2',
                  )
                }}</span>
                <span class="font-color-dark">{{
                  formatTime(
                    targetData.currentEventTimestamp,
                    'YYYY-MM-DD HH:mm:ss.SSS',
                  )
                }}</span>
              </div>
            </template>
          </template>

          <template v-if="isTarget">
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
          </template>
        </div>
      </div>
      <div v-if="isLogCollector">
        <div v-loading="loading" class="chart-box rounded-xl w-100">
          <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
            {{ $t('packages_dag_components_nodedetaildialog_shijiantongji') }}
          </div>
          <div class="chart-box__content px-4 pb-2">
            <EventChart :samples="[eventDataAll, eventDataPeriod]" />
          </div>
        </div>
      </div>
      <template v-else>
        <div class="flex justify-content-between gap-4">
          <div
            v-loading="loading"
            class="chart-box rounded-xl"
            :class="{ 'w-100': chartBoxWidth100 }"
          >
            <div class="chart-box__title py-2 px-4 fw-bold font-color-normal">
              {{ $t('packages_dag_components_nodedetaildialog_shijiantongji') }}
            </div>
            <div class="chart-box__content px-4 pb-2">
              <EventChart :samples="[eventDataAll, eventDataPeriod]" />
            </div>
          </div>
          <div v-loading="loading" class="chart-box rounded-xl">
            <div
              class="flex justify-content-between align-items-center chart-box__title px-4"
            >
              <div class="fw-bold font-color-normal flex align-items-center">
                <span class="mr-2">{{
                  $t('packages_dag_batch_read_size_chart_title')
                }}</span>
              </div>
            </div>
            <div class="chart-box__content p-4">
              <LineChart
                :data="batchReadData"
                :color="['#2C65FF']"
                :time-format="timeFormat"
                label-unit-type=""
              />
            </div>
          </div>
        </div>
        <div class="flex justify-content-between gap-4">
          <div v-loading="loading" class="chart-box rounded-xl">
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
              <ElRadioGroup
                v-model="qpsChartsType"
                class="chart__radio"
                size="small"
              >
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
          <div v-loading="loading" class="chart-box rounded-xl">
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
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  .el-dialog__body {
    padding-top: 6px;
  }
}

.chart-box {
  flex: 1;
  border: 1px solid var(--el-border-color);
  position: relative;
  overflow: hidden;
  &.disabled {
    border: none;
  }
}
.chart-box__title {
  //color: #333c4a;
  height: 40px;
  display: flex;
  align-items: center;
}
.line-chart {
  height: 200px;
}
.event-chart {
  :deep(.event-chart__radio) {
    position: absolute;
    top: 8px;
    right: 16px;
    margin: 0;
  }
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

.grid-auto-column {
  display: grid;
  // grid-auto-columns: 1fr;
  // grid-auto-flow: column;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
</style>
