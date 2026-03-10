<script setup lang="ts">
import { getExternalStorage } from '@tap/api/src/core/external-storage'
import { getLogcollectorDetail } from '@tap/api/src/core/logcollector'
import { findOneSharedCache } from '@tap/api/src/core/shared-cache'
import { EXTERNAL_STORAGE_TYPE_MAP } from '@tap/business/src/shared/const'
import { IconButton } from '@tap/component/src/icon-button'
import TimeSelect from '@tap/component/src/TimeSelect.vue'

import { useI18n } from '@tap/i18n'
import { calcTimeUnit, calcUnit } from '@tap/shared'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { computed, inject, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Frequency from './components/Frequency.vue'
import InitialList from './components/InitialList.vue'
import LineChart from './components/LineChart.vue'

defineOptions({ name: 'LeftSider' })

const emit = defineEmits<{
  (e: 'load-data'): void
  (e: 'verifyDetails'): void
  (e: 'changeTimeSelect', val: any, isTime: any, source: any): void
  (e: 'changeFrequency', val: any): void
}>()

const props = defineProps({
  quota: Object,
  verifyTotals: {
    type: Object,
    default: () => ({
      diffRecords: 0,
      diffTables: 0,
      totals: 0,
      ignore: 0,
    }),
  },
  timeFormat: String,
  ifEnableConcurrentRead: Boolean,
})

const dataflow = inject<Ref<any>>('dataflow')

const { t } = useI18n()
const route = useRoute()
const store = useStore()

const timeSelectRef = ref()
const dialogTimeSelectRef = ref()

const lineChartDialog = ref(false)
const initialListDialog = ref(false)
const timeSelectLabel = ref('')
const infoList = ref<any[]>([])
const qpsChartsType = ref('count')
const isUpdatingTimeSelect = ref(false)

const cpuUsageOptions = {
  tooltip: {
    formatter: (params: any) => {
      const [cpu, mem] = params
      let result = dayjs(Number(cpu.axisValue)).format('YYYY-MM-DD HH:mm:ss')

      result += `<div class="flex justify-content-between gap-4"><div>${cpu.marker}${cpu.seriesName}</div><div class="din-font">${cpu.data === null ? '-' : Number(cpu.data?.toFixed(2))}%</div></div>`
      result += `<div class="flex justify-content-between gap-4"><div>${mem.marker}${mem.seriesName}</div><div class="din-font">${calcUnit(mem.data, 'byte')}</div></div>`

      return result
    },
  },
  yAxis: [
    {
      name: 'CPU',
      max: 'dataMax',
      nameTextStyle: { color: '#535F72' },
      axisLine: { show: true, lineStyle: { color: '#E9E9E9' } },
      splitLine: { show: false },
      axisLabel: {
        show: true,
        color: '#535F72',
        hideOverlap: true,
        showMaxLabel: true,
        formatter: (val: number) => `${Number(val.toFixed(2))}%`,
      },
    },
    {
      name: 'MEM',
      max: 'dataMax',
      nameTextStyle: { color: '#535F72' },
      axisLine: { show: true, lineStyle: { color: '#E9E9E9' } },
      splitLine: { show: false },
      axisLabel: {
        show: true,
        color: '#535F72',
        hideOverlap: true,
        showMaxLabel: true,
        formatter: (val: number) => calcUnit(val, 'byte'),
      },
    },
  ],
  series: [{ yAxisIndex: 0 }, { yAxisIndex: 1 }],
}

const qpsColors = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
]
const allNodes = computed(() => store.getters['dataflow/allNodes'])

const qpsMap = computed(() => {
  const data = props.quota?.samples?.lineChartData?.[0]
  const { interval } = props.quota as any

  if (!data) {
    return {
      x: [],
      name: [],
      value: [[], []],
      markLine: [{ data: [] }],
    }
  }
  const { time = [] } = props.quota as any
  const inputQps = data.inputQps?.map(Math.abs)
  const outputQps = data.outputQps?.map(Math.abs)
  const inputSizeQps = data.inputSizeQps?.map(Math.abs)
  const outputSizeQps = data.outputSizeQps?.map(Math.abs)
  const inputQps95th = data.inputQps95th
  const inputQps99th = data.inputQps99th
  const outputQps95th = data.outputQps95th
  const outputQps99th = data.outputQps99th
  const inputSizeQps95th = data.inputSizeQps95th
  const inputSizeQps99th = data.inputSizeQps99th
  const outputSizeQps95th = data.outputSizeQps95th
  const outputSizeQps99th = data.outputSizeQps99th

  // 计算距离增量时间点，最近的时间点
  const milestone = dataflow.value?.attrs?.milestone || {}
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

  let unit = '5s'

  switch (interval) {
    case 5000:
      unit = '5s'
      break
    case 60000:
      unit = 'm'
      break
    case 3600000:
      unit = 'hr'
      break
    case 86400000:
      unit = 'd'
      break
  }

  const countNames = [
    t('public_time_avg_input', { unit }),
    t('public_time_avg_output', { unit }),
  ]

  const sizeNames = [
    t('public_time_avg_input', { unit }),
    t('public_time_avg_output', { unit }),
  ]

  const countValues = [inputQps, outputQps]
  const countP95Values = [
    inputQps95th,
    outputQps95th,
    inputQps99th,
    outputQps99th,
  ]
  const sizeValues = [inputSizeQps, outputSizeQps]
  const sizeP95Values = [
    inputSizeQps95th,
    outputSizeQps95th,
    inputSizeQps99th,
    outputSizeQps99th,
  ]
  const p95Names = [
    t('public_time_avg_input_95th'),
    t('public_time_avg_output_95th'),
    t('public_time_avg_input_99th'),
    t('public_time_avg_output_99th'),
  ]

  countP95Values.forEach((values, i) => {
    if (values?.some((v) => v !== null)) {
      countValues.push(values)
      countNames.push(p95Names[i])
    }
  })
  sizeP95Values.forEach((values, i) => {
    if (values?.some((v) => v !== null)) {
      sizeValues.push(values)
      sizeNames.push(p95Names[i])
    }
  })

  if (interval > 5000) {
    countValues.push(
      data.maxInputQps?.map(Math.abs),
      data.maxOutputQps?.map(Math.abs),
    )
    sizeValues.push(
      data.maxInputSizeQps?.map(Math.abs),
      data.maxOutputSizeQps?.map(Math.abs),
    )
    const names = [
      t('public_time_max_input', { unit }),
      t('public_time_max_output', { unit }),
    ]
    countNames.push(...names)
    sizeNames.push(...names)
  }

  const opt = {
    x: time,
    value: [],
    zoomValue: 10,
    serieOptions: Array.from({ length: 8 }).fill(
      {
        areaStyle: undefined,
      },
      2,
    ),
  }

  if (dataflow.value?.type === 'initial_sync+cdc') {
    ;(opt as any).markLine = [
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
    count: Object.assign(cloneDeep(opt), {
      value: countValues,
      name: countNames,
    }),
    size: Object.assign(cloneDeep(opt), {
      value: sizeValues,
      name: sizeNames,
    }),
  }
})

const lastStartDateLabel = computed(() => {
  const d = dataflow.value.lastStartDate
  return d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : '-'
})

// 处理耗时
const delayData = computed(() => {
  const data = props.quota?.samples?.lineChartData?.[0]
  const { time = [] } = props.quota as any
  if (!data) {
    return { x: [], value: [] }
  }
  return { x: time, value: data.timeCostAvg }
})

// 增量延迟
const replicateLagData = computed(() => {
  const data = props.quota?.samples?.lineChartData?.[0]
  const { time = [] } = props.quota as any
  if (!data) {
    return { x: [], value: [] }
  }

  const name = [t('public_event_incremental_delay')]
  const { replicateLag = [], replicateLag95th, replicateLag99th } = data
  const open = dataflow.value?.alarmSettings?.find(
    (t: any) => t.key === 'TASK_INCREMENT_DELAY',
  )?.open
  const delay = open
    ? dataflow.value?.alarmRules?.find(
        (t: any) => t.key === 'TASK_INCREMENT_DELAY',
      )?.ms || 0
    : 60 * 1000
  const max = Math.max(...replicateLag)
  const value = [replicateLag]
  if (replicateLag95th?.some((v: any) => v !== null)) {
    value.push(replicateLag95th)
    name.push(t('public_event_incremental_delay_95th'))
  }
  if (replicateLag99th?.some((v: any) => v !== null)) {
    value.push(replicateLag99th)
    name.push(t('public_event_incremental_delay_99th'))
  }
  return {
    x: time,
    name,
    value,
    yAxisMax: Math.max(delay, max),
    serieOptions: Array.from({ length: 3 }).fill({ areaStyle: undefined }, 1),
  }
})

const cpuUsageData = computed(() => {
  const data = props.quota?.samples?.lineChartData?.[0]
  const { time = [] } = props.quota as any
  if (!data) {
    return { x: [], value: [] }
  }
  const { cpuUsage = [], memoryUsage = [] } = data
  return { x: time, name: ['CPU', 'MEM'], value: [cpuUsage, memoryUsage] }
})

// 全量信息
const initialData = computed(() => {
  const data = props.quota?.samples?.totalData?.[0] || ({} as any)
  const {
    snapshotRowTotal = 0,
    snapshotInsertRowTotal = 0,
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
  const milestone = dataflow.value?.attrs?.milestone || {}
  const snapshotStartAt = milestone.SNAPSHOT?.begin
    ? dayjs(milestone.SNAPSHOT?.begin).format('YYYY-MM-DD HH:mm:ss')
    : ''
  const snapshotDoneAt = milestone.SNAPSHOT?.end
    ? dayjs(milestone.SNAPSHOT?.end).format('YYYY-MM-DD HH:mm:ss')
    : ''
  return { snapshotStartAt, snapshotDoneAt, replicateLag, finishDuration: time }
})

const totalData = computed(() => {
  let {
    tableTotal = 0,
    snapshotTableTotal = 0,
    currentSnapshotTableInsertRowTotal = 0,
    currentSnapshotTableRowTotal = 0,
    snapshotDoneCost,
    outputQpsMax = 0,
    outputQpsAvg = 0,
  } = props.quota?.samples?.totalData?.[0] || ({} as any)
  if (currentSnapshotTableInsertRowTotal > currentSnapshotTableRowTotal) {
    currentSnapshotTableRowTotal = currentSnapshotTableInsertRowTotal
  }
  return {
    tableTotal,
    snapshotTableTotal,
    currentSnapshotTableInsertRowTotal,
    currentSnapshotTableRowTotal,
    snapshotDoneCost,
    outputQpsMax: Math.ceil(outputQpsMax),
    outputQpsAvg: Math.ceil(outputQpsAvg),
  }
})

const totalDataPercentage = computed(() => {
  if (initialData.value.snapshotDoneAt) return 100
  const { tableTotal, snapshotTableTotal } = totalData.value
  if (!snapshotTableTotal || !tableTotal) return 0
  if (snapshotTableTotal > tableTotal) return 100
  return (snapshotTableTotal / tableTotal) * 100
})

const currentTotalDataPercentage = computed(() => {
  const { currentSnapshotTableInsertRowTotal, currentSnapshotTableRowTotal } =
    totalData.value
  if (!currentSnapshotTableRowTotal) return 0
  if (currentSnapshotTableInsertRowTotal > currentSnapshotTableRowTotal) {
    return 100
  }
  return (
    (currentSnapshotTableInsertRowTotal / currentSnapshotTableRowTotal) * 100
  )
})

// 任务事件统计（条）-任务累计
const eventDataAll = computed(() => {
  const data = props.quota?.samples?.barChartData?.[0]
  return getInputOutput(data)
})

const heartbeatTime = computed(() => {
  const { pingTime, status } = dataflow.value
  return status === 'running' && pingTime
    ? dayjs(Time.now()).to(dayjs(pingTime))
    : '-'
})

const isFileSource = computed(() => {
  if (!allNodes.value?.length) return
  const fileType = ['CSV', 'EXCEL', 'JSON', 'XML']
  return allNodes.value.some((node: any) =>
    fileType.includes(node.databaseType),
  )
})

const hideTotalData = computed(() => {
  return ['shareCache'].includes(dataflow.value?.syncType)
})

const showToInitialList = computed(() => {
  return (
    (dataflow.value?.syncType !== 'sync' || dataflow.value?.shareCache) &&
    dataflow.value.type !== 'cdc'
  )
})

// 进入增量阶段
const startingIncremental = computed(() => {
  return (
    dataflow.value?.type !== 'initial_sync' &&
    !!initialData.value.snapshotDoneAt
  )
})

const timeOptions = computed(() => {
  const options: any[] = [
    {
      label: t('packages_dag_components_timeselect_zuijinfenzhong'),
      value: '5m',
    },
    {
      label: t('packages_dag_components_timeselect_zuixinxiaoshi'),
      value: '1h',
    },
    { label: t('public_time_last_day'), value: '1d' },
    {
      label: t('packages_dag_components_timeselect_renwuzuijinyi'),
      value: 'lastStart',
    },
    {
      label: t('packages_dag_components_timeselect_renwuquanzhouqi'),
      value: 'full',
    },
  ]

  if (startingIncremental.value) {
    options.push({
      label: t('packages_dag_components_timeselect_incremental_phase'),
      value: 'incremental',
    })
  }

  options.push({
    label: t('public_time_custom_time'),
    type: 'custom',
    value: 'custom',
  })

  return options
})
// --- methods ---

function getInputOutput(data: any) {
  const result: any = {}
  const inputArr = [
    'inputInsertTotal',
    'inputUpdateTotal',
    'inputDeleteTotal',
    'inputDdlTotal',
    'inputOthersTotal',
  ]
  const outputArr = [
    'outputInsertTotal',
    'outputUpdateTotal',
    'outputDeleteTotal',
    'outputDdlTotal',
    'outputOthersTotal',
  ]
  ;[...inputArr, ...outputArr].forEach((el) => {
    result[el] = data?.[el] || 0
  })
  result.inputTotals = inputArr.reduce((total, key) => {
    return total + result[key] || 0
  }, 0)
  result.outputTotals = outputArr.reduce((total, key) => {
    return total + result[key] || 0
  }, 0)
  const limit = 1000000000
  result.inputTotalsLabel =
    result.inputTotals >= limit
      ? calcUnit(result.inputTotals)
      : result.inputTotals.toLocaleString()
  result.outputTotalsLabel =
    result.outputTotals >= limit
      ? calcUnit(result.outputTotals)
      : result.outputTotals.toLocaleString()
  return result
}

function getCalcTimeUnit(...args: any[]) {
  return typeof args[0] === 'number' ? calcTimeUnit(...args) : '-'
}

function getReplicateLag(val: any, placeholder?: string) {
  return typeof val === 'number' && val >= 0
    ? calcTimeUnit(val, 2, { autoHideMs: true })
    : (placeholder ?? t('public_data_no_data'))
}

function formatTime(date: any, f = 'YYYY-MM-DD HH:mm:ss') {
  return date ? dayjs(date).format(f) : '-'
}

function getCollectorData() {
  getLogcollectorDetail(dataflow.value?.id).then((data: any) => {
    const { externalStorage = {} as any, logTime } = data
    let uriInfo = externalStorage.uri
    if (externalStorage.type === 'mongodb') {
      const regResult =
        /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
          externalStorage.uri,
        )
      const { username, host, database, query } = regResult!.groups!
      uriInfo = `mongodb://${username}:***@${host}/${database}${query ? `/${query}` : ''}`
    }
    if (!externalStorage.name) {
      infoList.value = [
        {
          label: t('packages_business_relation_details_rizhiwajueshi'),
          value: formatTime(logTime),
        },
      ]
      return
    }
    infoList.value = [
      {
        label: t('packages_business_relation_details_rizhiwajueshi'),
        value: formatTime(logTime),
      },
      {
        label: t('public_external_memory_name'),
        value: externalStorage.name,
      },
      {
        label: t('public_external_memory_type'),
        value: EXTERNAL_STORAGE_TYPE_MAP[externalStorage.type],
      },
      {
        label: t('public_external_memory_table'),
        value: externalStorage.table,
      },
      {
        label: t('public_external_memory_info'),
        value: uriInfo,
        block: true,
        class: 'text-break',
      },
    ]
  })
}

function getSharedCacheData(id: string) {
  findOneSharedCache(id).then((data: any) => {
    getExternalStorage(data.externalStorageId).then((ext: any = {}) => {
      if (!ext.name) {
        infoList.value = []
        return
      }
      infoList.value = [
        { label: t('public_external_memory_name'), value: ext.name },
        {
          label: t('public_external_memory_type'),
          value: EXTERNAL_STORAGE_TYPE_MAP[ext.type],
        },
        { label: t('public_external_memory_table'), value: ext.table },
        { label: t('public_external_memory_info'), value: ext.uri },
      ]
    })
  })
}

async function getBasicInformation() {
  const map: Record<string, Function> = {
    SharedMiningMonitor: getCollectorData,
    SharedCacheMonitor: getSharedCacheData,
  }
  map[route.name as string]?.(dataflow.value?.id)
}

function changeTimeSelect(val: any, isTime: any, source: any) {
  emit('changeTimeSelect', val, isTime, source)
  isUpdatingTimeSelect.value = true
  dialogTimeSelectRef.value?.setPeriod(val)
  setTimeout(() => {
    isUpdatingTimeSelect.value = false
  }, 10)
}

function changeFrequency(val: any) {
  emit('changeFrequency', val)
}

function toFullscreen() {
  lineChartDialog.value = true
}

function toInitialList() {
  initialListDialog.value = true
}

function onChangeDialogTimeSelect(val: any, isTime: any, source: any) {
  if (isUpdatingTimeSelect.value) return
  const selected = timeSelectRef.value?.setPeriod(val)
  if (selected) {
    emit('changeTimeSelect', val, isTime, source)
  }
}

// --- watch & lifecycle ---

watch(
  () => dataflow.value.syncType,
  (v) => {
    v && getBasicInformation()
  },
)

onMounted(() => {
  timeSelectLabel.value = timeSelectRef.value?.getPeriod()?.label
})
</script>

<template>
  <aside
    class="layout-sidebar --left flex-shrink-0 nodes-panel position-absolute start-3 rounded-2xl bg-card shadow-canvas z-10 flex flex-column font-color-light"
  >
    <div class="flex flex-column flex-1 min-h-0 overflow-y-auto py-2">
      <div
        class="info-box flex justify-content-between align-items-center flex-wrap"
      >
        <TimeSelect
          ref="timeSelectRef"
          :options="timeOptions"
          :range="$attrs.range"
          class="mb-1 w-100"
          @change="changeTimeSelect"
        />
        <Frequency
          :range="$attrs.range"
          class="flex-1"
          @change="changeFrequency"
        />
        <IconButton class="color-primary" @click="$emit('load-data')">
          refresh</IconButton
        >
      </div>
      <div
        v-if="dataflow.syncType === 'sync' || dataflow.syncType === 'migrate'"
        class="info-box sync-info"
      >
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{
            $t('packages_dag_monitor_leftsider_tongbuxinxi')
          }}</span>
          <ElTooltip
            v-if="showToInitialList"
            transition="tooltip-fade-in"
            :content="$t('packages_dag_monitor_leftsider_liebiao')"
          >
            <ElButton text @click.stop="toInitialList">
              <template #icon>
                <i-lucide-list />
              </template>
            </ElButton>
            <!-- <VIcon @click.stop="toInitialList">menu-left</VIcon> -->
          </ElTooltip>
        </div>
        <div class="mb-2 flex justify-content-between">
          <span class="sync-info-item__title">{{
            $t('packages_dag_monitor_topheader_zuijinyiciqi')
          }}</span>
          <span>{{ lastStartDateLabel || '-' }}</span>
        </div>
        <template v-if="dataflow.type !== 'cdc'">
          <div class="mb-2 flex justify-content-between">
            <span class="sync-info-item__title">{{
              $t('packages_dag_components_nodedetaildialog_quanliangkaishishi')
            }}</span>
            <span>{{ initialData.snapshotStartAt || '-' }}</span>
          </div>
          <div
            v-if="initialData.snapshotDoneAt"
            class="mb-2 flex justify-content-between"
          >
            <span class="sync-info-item__title">{{
              $t('packages_dag_monitor_leftsider_quanliangwanchengshi')
            }}</span>
            <span>{{ initialData.snapshotDoneAt }}</span>
          </div>
          <div v-else class="mb-2 flex justify-content-between">
            <span class="sync-info-item__title">{{
              $t('packages_dag_monitor_leftsider_yujiquanliangwan')
            }}</span>
            <span v-if="isFileSource" class="flex-1 text-end">{{
              $t('packages_dag_components_node_zanbuzhichi')
            }}</span>
            <span v-else-if="initialData.finishDuration < 0">{{
              $t('packages_business_task_info_calculating')
            }}</span>
            <ElTooltip
              v-else
              transition="tooltip-fade-in"
              :content="`${initialData.finishDuration.toLocaleString()}ms`"
            >
              <span>{{
                getCalcTimeUnit(initialData.finishDuration, 2, {
                  autoHideMs: true,
                })
              }}</span>
            </ElTooltip>
          </div>
          <div class="mb-2 flex align-items-center justify-content-between">
            <span class="mr-2 sync-info-item__title">{{
              $t('public_task_full_sync_progress')
            }}</span>
            <span v-if="isFileSource" class="flex-1 text-end">{{
              $t('packages_dag_components_node_zanbuzhichi')
            }}</span>
            <ElTooltip v-else placement="bottom">
              <div class="inline-flex">
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
              <template #content>
                <div class="fs-8">
                  <div>
                    <span
                      >{{
                        $t(
                          'packages_dag_monitor_leftsider_quanliangwanchenghao',
                        )
                      }}:</span
                    >
                    <span class="ml-2">{{
                      getCalcTimeUnit(totalData.snapshotDoneCost)
                    }}</span>
                  </div>
                  <div>
                    <span
                      >{{
                        $t('packages_dag_monitor_leftsider_pingjunQps')
                      }}:</span
                    >
                    <span class="ml-2">{{ totalData.outputQpsAvg }}</span>
                  </div>
                  <div>
                    <span
                      >{{
                        $t('packages_dag_monitor_leftsider_zuidaQps')
                      }}:</span
                    >
                    <span class="ml-2">{{ totalData.outputQpsMax }}</span>
                  </div>
                </div>
              </template>
            </ElTooltip>
          </div>
          <div
            v-if="
              dataflow.syncType === 'migrate' &&
              totalData.currentSnapshotTableRowTotal &&
              !ifEnableConcurrentRead
            "
            class="mb-4 flex align-items-center"
          >
            <span class="mr-2 sync-info-item__title">{{
              $t('packages_dag_components_nodedetaildialog_dangqianbiaotongbu')
            }}</span>
            <ElProgress
              class="flex-1 my-2"
              :show-text="false"
              :percentage="currentTotalDataPercentage"
            />
            <span class="ml-2">{{
              `${totalData.currentSnapshotTableInsertRowTotal || 0}/${totalData.currentSnapshotTableRowTotal || 0}`
            }}</span>
          </div>
        </template>
        <template v-if="dataflow.type !== 'initial_sync'">
          <div
            v-if="initialData.snapshotDoneAt"
            class="mb-2 flex justify-content-between"
          >
            <span>{{
              $t('packages_dag_monitor_leftsider_zuidazengliangyan')
            }}</span>
            <span>{{
              getReplicateLag(
                initialData.replicateLag,
                $t('public_event_cdc_placeholder'),
              )
            }}</span>
          </div>
        </template>
      </div>
      <div
        v-if="
          dataflow.syncType === 'migrate' &&
          dataflow.isAutoInspect &&
          dataflow.canOpenInspect &&
          verifyTotals
        "
        class="info-box"
      >
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{
            $t('packages_dag_monitor_leftsider_renwujiaoyan')
          }}</span>
          <ElTooltip
            v-if="verifyTotals.diffTables"
            transition="tooltip-fade-in"
            :content="$t('packages_dag_monitor_leftsider_chayixiangqing')"
          >
            <VIcon @click.stop="$emit('verifyDetails')">menu-left</VIcon>
          </ElTooltip>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{
            $t('packages_dag_monitor_leftsider_chayizongxingshu')
          }}</span>
          <span :class="{ 'color-danger': verifyTotals.diffRecords }">{{
            verifyTotals.diffRecords
          }}</span>
        </div>
        <div class="flex justify-content-between mb-2">
          <span>{{ $t('packages_dag_monitor_leftsider_jiaoyanbuyizhi') }}</span>
          <span v-if="verifyTotals.diffTables">
            <span :class="{ 'color-danger': verifyTotals.diffTables }">{{
              verifyTotals.diffTables
            }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
          <span v-else>0</span>
        </div>
        <div class="flex justify-content-between">
          <span class="mr-2">{{
            $t('packages_dag_monitor_leftsider_buzhichijiaoyan')
          }}</span>
          <span v-if="verifyTotals.ignore">
            <span :class="{ 'color-danger': verifyTotals.ignore }">{{
              verifyTotals.ignore
            }}</span>
            <span>/</span>
            <span>{{ verifyTotals.totals }}</span>
          </span>
          <span v-else>0</span>
        </div>
      </div>

      <div
        v-if="
          ['SharedMiningMonitor', 'SharedCacheMonitor'].includes($route.name) &&
          infoList.length > 0
        "
        class="info-box"
      >
        <div class="flex justify-content-between mb-2">
          <span class="fw-bold fs-7 font-color-normal">{{
            $t('packages_dag_monitor_leftsider_jibenxinxi')
          }}</span>
        </div>
        <div class="mb-2 flex justify-content-between">
          <span class="sync-info-item__title">{{
            $t('packages_dag_monitor_topheader_zuijinyiciqi')
          }}</span>
          <span class="font-color-dark text-break pl-3">{{
            lastStartDateLabel || '-'
          }}</span>
        </div>
        <div
          v-for="(item, index) in infoList"
          :key="index"
          class="mb-2"
          :class="[
            item.block ? 'block' : 'flex justify-content-between',
            item.class,
          ]"
        >
          <div class="font-color-light text-nowrap">{{ item.label }}</div>
          <div class="font-color-dark text-break pl-3">
            {{ item.value || '-' }}
          </div>
        </div>
      </div>

      <div class="info-box">
        <div class="flex justify-content-between mb-2">
          <span class="fs-7 fw-sub font-color-normal">{{
            $t('packages_dag_components_nodedetaildialog_xingnengzhibiao')
          }}</span>
          <ElTooltip
            transition="tooltip-fade-in"
            :content="$t('packages_dag_button_zoom_in')"
          >
            <ElButton text @click.stop="toFullscreen">
              <template #icon>
                <VIcon size="16">enlarge</VIcon>
              </template>
            </ElButton>
          </ElTooltip>
        </div>
        <div class="line-chart__box mb-2">
          <div class="flex justify-content-between">
            <ElTooltip transition="tooltip-fade-in" placement="top">
              <template #content>
                <div>
                  <div>
                    {{
                      $t(
                        qpsChartsType === 'count'
                          ? 'packages_dag_monitor_leftsider_qpSshizhi'
                          : 'packages_dag_monitor_leftsider_qpSshizhi2',
                      )
                    }}
                  </div>
                  <ul class="mt-1 ml-4 lh-base" style="color: #d0d3d6">
                    <li class="list-disc">
                      {{ $t('packages_dag_qpSshizhi_tip') }}
                    </li>
                    <li class="list-disc">
                      {{ $t('packages_dag_qpSshizhi2_tip') }}
                    </li>
                    <li class="list-disc">
                      {{ $t('packages_dag_qpSshizhi3_tip') }}
                    </li>
                  </ul>
                </div>
              </template>
              <span class="inline-flex align-items-center">
                <span class="mr-2 font-color-dark fw-sub">QPS(Q/S)</span>
                <VIcon size="16" class="color-primary">info</VIcon>
              </span>
            </ElTooltip>
            <el-segmented
              v-model="qpsChartsType"
              :options="['count', 'size']"
            />
          </div>

          <LineChart
            :data="qpsMap[qpsChartsType]"
            :color="qpsColors"
            :time-format="timeFormat"
            :label-unit-type="qpsChartsType === 'size' ? 'byte' : ''"
            auto-scale
            class="line-chart"
          />
        </div>
        <div class="line-chart__box mb-2">
          <div class="flex align-center gap-2">
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')"
            >
              <span class="inline-flex align-items-center">
                <span class="mr-2 font-color-dark fw-sub">{{
                  $t('public_event_incremental_delay')
                }}</span>
                <VIcon size="16" class="color-primary">info</VIcon>
              </span>
            </ElTooltip>
            <ElTooltip
              v-if="dataflow.timeDifference > 0"
              key="retrying"
              placement="top"
              :content="
                $t('packages_dag_monitor_timeDifference', {
                  val: getCalcTimeUnit(dataflow.timeDifference),
                })
              "
            >
              <VIcon size="16" class="color-warning">warning</VIcon>
            </ElTooltip>
          </div>

          <LineChart
            :data="replicateLagData"
            :color="['#2C65FF', '#91cc75', '#fac858']"
            :time-format="timeFormat"
            time-value
            class="line-chart"
          />
        </div>
        <!--指标不准确，暂时隐藏-->
        <!--<div class="line-chart__box mb-2">
                <ElTooltip
                  transition="tooltip-fade-in"
                  placement="top"
                  :content="$t('packages_dag_monitor_leftsider_renwuchuliwan')"
                >
                  <span>
                    <span class="mr-2 font-color-dark fw-sub">{{ $t('packages_dag_monitor_leftsider_chulihaoshim') }}</span>
                    <VIcon size="14" class="color-primary">info</VIcon>
                  </span>
                </ElTooltip>
                <LineChart
                  :data="delayData"
                  :color="['#2C65FF']"
                  :time-format="timeFormat"
                  time-value
                  class="line-chart"
                ></LineChart>
              </div>-->
      </div>
      <div v-if="!hideTotalData" class="info-box py-2 px-4">
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{
            $t('packages_dag_monitor_leftsider_renwushijiantong')
          }}</span>
        </div>
        <div v-loading="!eventDataAll" class="flex">
          <div v-if="eventDataAll" class="w-50 pr-4">
            <div>{{ $t('public_event_total_input') }}</div>
            <ElTooltip
              transition="tooltip-fade-in"
              placement="top"
              :content="eventDataAll.inputTotals.toLocaleString()"
              class="mt-1 mb-2 font-color-normal fw-sub fs-3 din-font"
            >
              <div>{{ eventDataAll.inputTotalsLabel }}</div>
            </ElTooltip>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_charu') }}</span>
              <span>{{ eventDataAll.inputInsertTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_gengxin') }}</span>
              <span>{{ eventDataAll.inputUpdateTotal.toLocaleString() }}</span>
            </div>
            <div class="mb-2">
              <span>{{ $t('packages_dag_monitor_leftsider_shanchu') }}</span>
              <span>{{ eventDataAll.inputDeleteTotal.toLocaleString() }}</span>
            </div>
            <div>
              <span>DDL：</span>
              <span>{{ eventDataAll.inputDdlTotal.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="eventDataAll" class="output-item flex w-50">
            <div class="output-item__divider" />
            <div class="ml-4">
              <div>{{ $t('public_event_total_output') }}</div>
              <ElTooltip
                transition="tooltip-fade-in"
                placement="top"
                :content="eventDataAll.outputTotals.toLocaleString()"
                class="mt-1 mb-2 font-color-normal fw-sub fs-3 din-font"
              >
                <div>
                  {{ eventDataAll.outputTotalsLabel }}
                </div>
              </ElTooltip>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_charu') }}</span>
                <span>{{
                  eventDataAll.outputInsertTotal.toLocaleString()
                }}</span>
              </div>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_gengxin') }}</span>
                <span>{{
                  eventDataAll.outputUpdateTotal.toLocaleString()
                }}</span>
              </div>
              <div class="mb-2">
                <span>{{ $t('packages_dag_monitor_leftsider_shanchu') }}</span>
                <span>{{
                  eventDataAll.outputDeleteTotal.toLocaleString()
                }}</span>
              </div>
              <div>
                <span>DDL：</span>
                <span>{{ eventDataAll.outputDdlTotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="py-2 px-4 info-box">
        <div class="line-chart__box mb-2">
          <div class="flex align-center gap-2">
            <span class="inline-flex align-items-center">
              <span class="mr-2 font-color-normarl fw-sub">{{
                $t('packages_dag_task_resource_usage')
              }}</span>
            </span>
          </div>

          <LineChart
            :data="cpuUsageData"
            :options="cpuUsageOptions"
            :color="['#2C65FF', '#b6d634']"
            :name="['CPU', 'MEM']"
            :time-format="timeFormat"
            class="line-chart"
          />
        </div>
      </div>
      <div class="py-2 px-4">
        <div class="flex justify-content-between mb-2">
          <span class="fw-sub fs-7 font-color-normal">{{
            $t('packages_dag_monitor_leftsider_tiaoshixinxi')
          }}</span>
        </div>
        <div class="flex justify-content-between">
          <span>{{ $t('public_task_heartbeat_time') }}:</span>
          <span>{{ heartbeatTime }}</span>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="lineChartDialog"
      width="774px"
      :close-on-click-modal="false"
      append-to-body
    >
      <template #header="{ titleClass }">
        <div class="flex align-center gap-3">
          <span :class="titleClass">{{
            $t('packages_dag_components_nodedetaildialog_xingnengzhibiao')
          }}</span>
          <el-divider class="mx-0" direction="vertical" />
          <TimeSelect
            ref="dialogTimeSelectRef"
            :options="timeOptions"
            :range="$attrs.range"
            @change="onChangeDialogTimeSelect"
          />
        </div>
      </template>
      <div class="line-chart__box mb-2">
        <div class="flex justify-content-between">
          <ElTooltip
            transition="tooltip-fade-in"
            placement="top"
            :content="
              qpsChartsType === 'count'
                ? $t('packages_dag_monitor_leftsider_qpSshizhi')
                : $t('packages_dag_monitor_leftsider_qpSshizhi2')
            "
          >
            <span class="inline-flex align-items-center">
              <span class="mr-2 font-color-dark fw-sub">QPS(Q/S)</span>
              <VIcon size="16" class="color-primary">info</VIcon>
            </span>
          </ElTooltip>
          <el-segmented v-model="qpsChartsType" :options="['count', 'size']" />
        </div>
      </div>

      <LineChart
        :data="qpsMap[qpsChartsType]"
        :color="qpsColors"
        :time-format="timeFormat"
        :label-unit-type="qpsChartsType === 'size' ? 'byte' : ''"
        :options="{
          legend: {
            show: true,
            type: 'scroll',
            bottom: 0,
          },
          grid: {
            outerBounds: {
              left: 0,
              top: 0,
              right: 10,
              bottom: 32,
            },
          },
        }"
        style="height: 200px"
      />

      <div class="mt-4 font-color-dark fw-bold mb-2 lh-8">
        {{ $t('public_event_incremental_delay') }}
      </div>
      <LineChart
        :data="replicateLagData"
        :color="['#2C65FF', '#91cc75', '#fac858']"
        :time-format="timeFormat"
        time-value
        style="height: 200px"
        :options="{
          legend: {
            show: true,
            type: 'scroll',
            bottom: 0,
          },
          grid: {
            outerBounds: {
              left: 0,
              top: 0,
              right: 10,
              bottom: 32,
            },
          },
        }"
      />
      <div class="mt-4 font-color-dark fw-bold mb-2 lh-8">
        {{ $t('packages_dag_monitor_leftsider_chulihaoshim') }}
      </div>
      <LineChart
        :data="delayData"
        :color="['#2C65FF']"
        :time-format="timeFormat"
        time-value
        style="height: 200px"
      />
    </ElDialog>

    <InitialList
      ref="initialListRef"
      v-model:value="initialListDialog"
      :dataflow="dataflow"
    />
  </aside>
</template>

<style lang="scss" scoped>
.nodes-panel {
  top: 68px;
  bottom: 12px;
  width: 356px;
}
:deep(.el-dialog) {
  .el-dialog__body {
    padding-top: 6px;
  }
}

.layout-sidebar.--left {
  z-index: unset;
  overflow: visible;
  will-change: width;
  $headerH: 34px;

  :deep(.el-collapse) {
    border-top: 0;

    .el-collapse-item {
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
      }

      &__content {
        padding-bottom: 0;
      }
    }

    .chart__radio {
      .el-radio-button--mini .el-radio-button__inner {
        padding: 4px 8px;
      }
    }
  }

  :deep(.el-scrollbar) {
    height: 100%;
  }
}

.info-box {
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.task-info__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.output-item__divider {
  margin-top: 40px;
  border-right: 1px solid var(--el-border-color);
  height: calc(100% - 40px);
}

.sync-info-item__title {
  display: inline-block;
  //width: 110px;

  & + span {
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }
}

.line-chart__box {
  .line-chart {
    margin-top: 8px;
    height: 110px;
  }
}
</style>
