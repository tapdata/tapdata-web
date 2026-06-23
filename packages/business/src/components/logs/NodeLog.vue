<script setup lang="ts">
import {
  exportMonitoringLogs,
  queryMonitoringLogs,
} from '@tap/api/src/core/monitoring-logs'
import { callProxy } from '@tap/api/src/core/proxy'
import { downloadTaskAnalyze, putTaskLogSetting } from '@tap/api/src/core/task'
import { CancelToken, withPassive } from '@tap/api/src/request'
import VEmpty from '@tap/component/src/base/v-empty/VEmpty.vue'
import TimeSelect from '@tap/component/src/TimeSelect.vue'
import { useI18n } from '@tap/i18n'
import { copyToClipboard, CountUp, downloadBlob, openUrl } from '@tap/shared'
import Time from '@tap/shared/src/time'
import dayjs from 'dayjs'
import { cloneDeep, debounce, escape, uniqBy } from 'lodash-es'
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  useTemplateRef,
  watch,
  type Ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import NodeList from '../nodes/List.vue'
import Download from './Download.vue'

defineOptions({ name: 'NodeLog' })

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const dag = inject<Ref<{ nodes: any[]; edges: any[] }>>('dag')

const props = withDefaults(
  defineProps<{
    dataflow?: Record<string, any>
    logsData?: { total: number; items: any[] }
    hideFilter?: boolean
    logTotals?: any[]
    nodeId?: string
  }>(),
  {
    dataflow: () => ({}),
    logsData: () => ({ total: 0, items: [] }),
    hideFilter: false,
    logTotals: () => [],
    nodeId: '',
  },
)

const emit = defineEmits<{
  (e: 'update:nodeId', val: string): void
  (e: 'action', val: any): void
}>()

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const hideDownload = import.meta.env.VUE_APP_HIDE_ANALYSE_DOWNLOAD
const hideSeeAlso =
  import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
  import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO

const activeNodeId = ref(props.nodeId)
const keyword = ref('')
const checkList = ref<string[]>([])
const checkItems = [
  { label: 'INFO', text: 'INFO' },
  { label: 'WARN', text: 'WARN' },
  { label: 'ERROR', text: 'ERROR' },
]
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const downloadLoading = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const preLoading = ref(false)
const resetDataTime = ref<number | null>(null)
const list = ref<any[]>([])
const colorMap: Record<string, string> = {
  INFO: 'color-info',
  WARN: 'color-warning',
  ERROR: 'color-danger',
  FATAL: 'color-danger',
  DEBUG: 'color-disable',
}
const newPageObj = reactive({ page: 0, pageSize: 100, total: 0 })
const oldPageObj = reactive({ page: 0, pageSize: 50, total: 0 })
const isScrollBottom = ref(false)
const form = reactive({
  level: 'INFO',
  intervalCeiling: 500,
  recordCeiling: 500,
})
const dialog = ref(false)
const timeOptions = ref([
  { label: t('public_select_option_all'), value: 'full' },
  { label: t('public_time_Last_six_hours'), value: '6h' },
  { label: t('public_time_last_day'), value: '1d' },
  { label: t('public_time_last_three_days'), value: '3d' },
  { label: t('public_time_custom_time'), type: 'custom', value: 'custom' },
])
const quotaTimeType = ref('full')
const quotaTime = ref<number[]>([])
const newFilter = ref<Record<string, any>>({})
const showNoMore = ref(false)
const extraEnterCount = ref(0)
const codeDialog = reactive({
  visible: false,
  data: {
    errorStack: '',
    errorCode: '',
    fullErrorCode: '',
    describe: '',
    solution: '',
    dynamicDescribe: '',
    seeAlso: [] as string[],
    module: '',
    message: '',
  },
})
const showCols = ref<string[]>([])
const switchData = reactive({ timestamp: false })
const fullscreen = ref(false)
const showTooltip = ref(false)
const downloadAnalysis = reactive({
  visible: false,
  progress: 0,
  currentStep: 0,
  steps: [
    { label: t('packages_business_exporting_task') },
    { label: t('packages_business_exporting_run_history') },
    { label: t('packages_business_exporting_task_log') },
    { label: t('packages_business_exporting_metrics') },
    { label: t('packages_business_gen_engine_cpu_chart') },
    { label: t('packages_business_gen_tm_cpu_chart') },
    { label: t('packages_business_gen_engine_mem_chart') },
    { label: t('packages_business_gen_tm_mem_chart') },
    { label: t('packages_business_exporting_engine_thread') },
    { label: t('packages_business_exporting_tm_thread') },
    { label: t('packages_business_downloading_file') },
  ],
})
const expandErrorMessage = ref(false)
const downloadDialog = ref(false)
let overflowObserver: MutationObserver | null = null
let analysisCancelSource: any = null
let countUp: any = null

const virtualScroller = useTemplateRef<any>('virtualScroller')
const timeSelect = useTemplateRef<any>('timeSelect')
// --- Computed ---

const allNodes = computed(() => dag?.value?.nodes ?? [])

function nodeById(id: string) {
  return allNodes.value.find((node: any) => node.id === id)
}

const nodeLogCountMap = computed(() => {
  return props.logTotals
    .filter((item: any) => item.nodeId)
    .reduce((cur: Record<string, number>, next: any) => {
      const count = cur[next.nodeId] || 0
      return { ...cur, [next.nodeId]: count + next.count }
    }, {})
})

const items = computed(() => {
  return allNodes.value.filter((item: any) => !!nodeLogCountMap.value[item.id])
})

const firstStartTime = computed(() => {
  const { startTime } = props.dataflow || {}
  const { taskRecordId, start } = route.query || {}
  if (taskRecordId) {
    return Number(start)
  }
  return startTime ? new Date(startTime).getTime() : null
})

const lastStopTime = computed(() => {
  const { stopTime } = props.dataflow || {}
  const { taskRecordId, end } = route.query || {}
  if (taskRecordId) {
    return Number(end)
  }
  return stopTime ? new Date(stopTime).getTime() : null
})

const isNoMore = computed(() => {
  const { page, pageSize, total } = oldPageObj
  if (!page) return false
  return page * pageSize > total
})

const isCustomTime = computed(() => {
  return quotaTimeType.value === 'custom' || quotaTimeType.value.includes(',')
})

const isEnterTimer = computed(() => {
  return (
    !isCustomTime.value &&
    (props.dataflow?.status === 'running' ||
      props.dataflow?.status === 'starting')
  )
})

const logSetting = computed(() => {
  return props.dataflow?.logSetting || {}
})

// --- Watch ---

watch(
  () => props.dataflow,
  (v1, v2) => {
    if (v1.status === 'edit') return
    if (v1.taskRecordId + v1.startTime !== v2?.taskRecordId + v2?.startTime) {
      init()
    }
  },
  { deep: true },
)

watch(
  () => props.nodeId,
  (v) => {
    activeNodeId.value = v
  },
)

// --- Methods ---
const init = debounce(() => {
  if (route.name === 'MigrationMonitorViewer') {
    timeOptions.value = [
      { label: t('public_select_option_all'), value: 'full' },
      { label: t('public_time_custom_time'), type: 'custom', value: 'custom' },
    ]
  }
  extraEnterCount.value = 0
  clearTimer()
  resetData()
}, 500)

function resetData() {
  preLoading.value = false
  resList()
  resetNewPage()
  resetOldPage()
  resetDataTime.value = Time.now()
  loadOld(pollingData)
}

function resetOldPage() {
  Object.assign(oldPageObj, { page: 0, pageSize: 20, total: 0 })
}

function resetNewPage() {
  Object.assign(newPageObj, { page: 0, pageSize: 100, total: 0 })
}

function clearTimer() {
  if (timer.value) clearInterval(timer.value)
  timer.value = null
}

function pollingData() {
  clearTimer()
  timer.value = setInterval(() => {
    if (
      isEnterTimer.value ||
      (['error', 'schedule_failed'].includes(props.dataflow.status) &&
        ++extraEnterCount.value < 5)
    ) {
      withPassive(loadNew)
    }
  }, 5000)
  !isCustomTime.value && loadNew()
}

function changeItem(val: string) {
  emit('update:nodeId', val)
  init()
}

function changeTime(val: any, isTime: boolean, source: any) {
  quotaTimeType.value = source?.type ?? val
  quotaTime.value = isTime
    ? val?.split(',')?.map((item: string) => Number(item))
    : getTimeRange(val)
  init()
}

function searchFnc() {
  clearTimer()
  init()
}

function scrollFnc(ev: Event) {
  const target = ev.target as HTMLElement
  if (list.value.length && target.scrollTop <= 0) {
    loadOld()
  }
  isScrollBottom.value =
    target.scrollHeight - target.scrollTop - target.clientHeight < 30
}

function loadOld(callback?: () => void) {
  if (isNoMore.value || loading.value) {
    return
  }
  const filter = getOldFilter()
  if (!filter.start || !filter.end) {
    return
  }
  filter.page++
  if (list.value.length) {
    preLoading.value = true
  } else {
    loading.value = true
  }
  queryMonitoringLogs(filter)
    .then((data: any = {}) => {
      const rows = getFormatRow(data.items?.reverse())
      oldPageObj.total = data.total || 0
      oldPageObj.page = filter.page

      if (list.value.length && oldPageObj.page !== 1) {
        const mergedList = uniqBy([...rows, ...list.value], 'id')
        if (mergedList.length !== list.value.length) {
          list.value = mergedList
          scrollToItem(rows.length - 1)
        }
      } else {
        list.value = rows
        scrollToBottom()
      }
    })
    .finally(() => {
      preLoading.value = false
      loading.value = false
      callback?.()
      showNoMore.value = oldPageObj.page > 1 ? isNoMore.value : false
      if (showNoMore.value) {
        setTimeout(() => {
          showNoMore.value = false
        }, 3000)
      }
    })
}

let loadNewLock = false

async function loadNew() {
  if (loadNewLock) return
  loadNewLock = true

  try {
    resetNewPage()
    const filter = getNewFilter()
    filter.page = 1

    if (!filter.start || !filter.end) return

    // 第一次请求，获取 total
    const firstData: any = await queryMonitoringLogs(filter)
    const total = firstData.total || 0
    let allRows = getFormatRow(firstData.items)

    if (!allRows.length) return

    // 如果还有更多页，并行请求剩余所有页（上限10页防止极端情况）
    if (total > filter.pageSize) {
      const totalPages = Math.min(Math.ceil(total / filter.pageSize), 10)
      const promises = []
      for (let p = 2; p <= totalPages; p++) {
        promises.push(queryMonitoringLogs({ ...filter, page: p }))
      }
      const results = await Promise.all(promises)
      for (const data of results) {
        allRows = allRows.concat(getFormatRow((data as any).items))
      }
    }

    const mergedList = uniqBy([...list.value, ...allRows], 'id')

    if (mergedList.length !== list.value.length) {
      list.value = mergedList

      if (isScrollBottom.value) {
        scrollToBottom()
      }

      if (isEnterTimer.value) {
        extraEnterCount.value = 0
      }
    }
  } finally {
    loadNewLock = false
  }
}

function getFormatRow(rowData: any[] = []) {
  const result = cloneDeep(rowData)
  result.forEach((row: any) => {
    row.timestampLabel = formatTime(row.date)
    row.expand = false
    row.hideContent = false
    row.message = escape(row.message)
    if (row.fullErrorCode === 'Task.ScheduleLimit') {
      row.message = t('packages_business_logs_nodelog_yinqingkeyibei')
    }
  })
  return result
}

function getHighlightSpan(str = '') {
  if (!keyword.value) {
    return str
  }
  const reg = new RegExp(keyword.value.toLowerCase(), 'gi')
  return str.replace(reg, `<span class="highlight-bg-color">$&</span>`)
}

function addLogTagsFilter(params: any) {
  if (activeNodeId.value) {
    const node = nodeById(activeNodeId.value)
    if (
      node &&
      [
        'custom_processor',
        'js_processor',
        'migrate_js_processor',
        'standard_js_processor',
        'standard_migrate_js_processor',
      ].includes(node.type)
    ) {
      params.includeLogTags = ['src=user_script']
    }
  } else {
    params.excludeLogTags = ['src=user_script']
  }
}

function getOldFilter() {
  const [start, end] = quotaTime.value.length
    ? quotaTime.value
    : getTimeRange(quotaTimeType.value)
  let { id: taskId, taskRecordId } = props.dataflow || {}
  const { query } = route
  if (query?.taskRecordId) {
    taskRecordId = query?.taskRecordId as string
    taskId = route.params?.id as string
  }
  const params: any = {
    start,
    end,
    page: oldPageObj.page,
    pageSize: oldPageObj.pageSize,
    order: 'desc',
    taskId,
    taskRecordId,
    nodeId: activeNodeId.value === '' ? null : activeNodeId.value,
    search: keyword.value,
    levels: checkList.value,
  }

  addLogTagsFilter(params)

  return params
}

function getNewFilter() {
  const [start, end] = [
    list.value.at(-1)?.timestamp || resetDataTime.value,
    Time.now(),
  ]
  let { id: taskId, taskRecordId } = props.dataflow || {}
  const { query } = route
  if (query?.taskRecordId) {
    taskRecordId = query?.taskRecordId as string
    taskId = route.params?.id as string
  }
  const params: any = {
    start,
    end,
    page: newPageObj.page,
    pageSize: newPageObj.pageSize,
    order: 'asc',
    taskId,
    taskRecordId,
    nodeId: activeNodeId.value === '' ? null : activeNodeId.value,
    search: keyword.value,
    levels: checkList.value,
  }

  addLogTagsFilter(params)

  newFilter.value = params
  return params
}

function scrollToBottom() {
  nextTick(() => {
    virtualScroller.value?.scrollToBottom?.()
    isScrollBottom.value = true
  })
}

function scrollToItem(index: number) {
  nextTick(() => {
    virtualScroller.value?.scrollToItem?.(index)
  })
}

function formatTime(date: any, type = 'YYYY-MM-DD HH:mm:ss.SSS') {
  return dayjs(date).format(type)
}

function handleDownload() {
  downloadDialog.value = true
  const [start, end] = quotaTime.value.length
    ? quotaTime.value
    : getTimeRange(quotaTimeType.value)
  let { id: taskId, taskRecordId } = props.dataflow || {}
  const { query } = route
  if (query?.taskRecordId) {
    taskRecordId = query?.taskRecordId as string
    taskId = route.params?.id as string
  }
  const filter = { start, end, taskId, taskRecordId }
  downloadLoading.value = true
  exportMonitoringLogs(filter)
    .then((data: any) => {
      downloadBlob(data)
    })
    .catch(() => {
      ElMessage.error(t('packages_dag_components_log_xiazaishibai'))
    })
    .finally(() => {
      downloadLoading.value = false
    })
}

function handleSetting(val: string) {
  const { level, intervalCeiling, recordCeiling } = logSetting.value
  form.level = val
  if (level) {
    Object.assign(form, { level, intervalCeiling, recordCeiling })
  }
  dialog.value = true
}

function handleClose() {
  const index = checkList.value.indexOf('DEBUG')
  checkList.value.splice(index, 1)
  searchFnc()
  dialog.value = false
}

function handleSave() {
  const params: any = { level: form.level }
  if (form.level === 'DEBUG') {
    params.intervalCeiling = form.intervalCeiling
    params.recordCeiling = form.recordCeiling
  }
  saveLoading.value = true
  putTaskLogSetting(props.dataflow.id, params)
    .then(() => {
      ElMessage.success(t('public_message_save_ok'))
      dialog.value = false
    })
    .finally(() => {
      saveLoading.value = false
    })
    .catch(() => {
      ElMessage.error(t('public_message_save_fail'))
    })
}

function getTimeRange(type: string) {
  let result: any[]
  const endTimestamp = Time.now()

  switch (type) {
    case '6h':
      result = [endTimestamp - 6 * 60 * 60 * 1000, endTimestamp]
      break
    case '1d':
      result = [endTimestamp - 24 * 60 * 60 * 1000, endTimestamp]
      break
    case '3d':
      result = [endTimestamp - 3 * 24 * 60 * 60 * 1000, endTimestamp]
      break
    case 'lastStart':
      result = [props.dataflow.lastStartDate, endTimestamp]
      break
    case 'full':
      result = [firstStartTime.value, endTimestamp]
      break
    default:
      result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
      break
  }
  if (!result[0]) {
    result[0] = endTimestamp - 5 * 60 * 1000
  }
  if (result[0] >= result[1]) {
    result[1] = Time.now() + 5 * 1000
  }
  return result
}

function resList() {
  list.value = []
}

function getTime() {
  return Time.now()
}

function handleCode(item: any = {}) {
  const params = {
    className: 'ErrorCodeService',
    method: 'getErrorCodeWithDynamic',
    args: [
      item.errorCode,
      locale.value === 'en' ? 'en' : 'cn',
      item.dynamicDescriptionParameters,
    ],
  }

  codeDialog.data.errorStack = item.errorStack
  codeDialog.data.errorCode = item.errorCode
  codeDialog.data.fullErrorCode = item.fullErrorCode
  codeDialog.data.message = item.message
  codeDialog.data.module = ''

  callProxy(params)
    .then((data: any) => {
      Object.assign(codeDialog.data, data)
      codeDialog.data.describe = data.describe || item.message
      codeDialog.visible = true
    })
    .catch(() => {
      codeDialog.visible = true
    })
}

function handleLink(val: string) {
  openUrl(val)
}

function toggleCol(col: string) {
  const index = showCols.value.indexOf(col)
  index !== -1 ? showCols.value.splice(index, 1) : showCols.value.push(col)
}

function handleCheckbox(flag: boolean, val: string) {
  if (flag && val === 'DEBUG') {
    handleSetting(val)
  }
}

function handleFullScreen() {
  fullscreen.value = !fullscreen.value
}

function handleLog(item: any, event: Event) {
  const domElement = event.currentTarget as HTMLElement

  const isContentTruncated = domElement.scrollHeight > domElement.offsetHeight

  if (!isContentTruncated) return

  if (item.hideContent === undefined) {
    item.hideContent = true
  }

  item.expand = !item.expand
}

function onCopy() {
  showTooltip.value = true
}

async function handleDownloadAnalysis() {
  downloadAnalysis.progress = 0
  downloadAnalysis.visible = true
  analysisCancelSource = CancelToken.source()
  initSteps()

  const blogData = await downloadTaskAnalyze(props.dataflow.id, {
    cancelToken: analysisCancelSource.token,
  })

  if (blogData.data.type === 'application/json') {
    ElMessage.error(t('packages_business_connections_test_xiazaishibai'))
    countUp.reset()
    downloadAnalysis.visible = false
    return
  }

  downloadBlob(blogData)
  completeSteps()
}

function onClose() {
  analysisCancelSource?.cancel()
  countUp?.reset()
}

function updateProgress(_temp: any, val: any) {
  val = Number(val)
  downloadAnalysis.currentStep = Math.min(
    Math.floor(val / 9),
    downloadAnalysis.steps.length - 1,
  )
  downloadAnalysis.progress = val
}

function initSteps() {
  downloadAnalysis.currentStep = 0
  downloadAnalysis.progress = 0
  countUp = new CountUp({}, 99, {
    duration: 62,
    plugin: {
      render: updateProgress,
    },
    useEasing: false,
    onCompleteCallback: () => {},
  })
  countUp.start()
}

function completeSteps() {
  countUp.pauseResume()
  updateProgress({}, 100)
  ElMessage.success('public_message_download_ok')

  setTimeout(() => {
    downloadAnalysis.visible = false
  }, 200)
}

function handleCopyStack(stack: string) {
  copyToClipboard(stack)
  ElMessage.success(t('public_message_copy_success'))
}

function openDataCapture() {
  window.open(
    router.resolve({
      name: 'DataCapture',
      params: { id: props.dataflow.id },
    }).href,
    `DataCapture-${props.dataflow.id}`,
  )
}

function handleCreateTicket() {
  const errorCode = codeDialog.data.fullErrorCode || codeDialog.data.errorCode

  window.open(
    router.resolve({
      name: 'TicketSystem',
      query: {
        form: encodeURIComponent(
          JSON.stringify({
            jobId: props.dataflow.id,
            subject: `${errorCode}-${codeDialog.data.message}`,
            description: `Error Code: ${errorCode}
Module: ${codeDialog.data.module || ''}
Describe: ${codeDialog.data.describe ? `\n${codeDialog.data.describe}` : ''}
Stack Trace: ${codeDialog.data.errorStack ? `\n${codeDialog.data.errorStack}` : ''}`,
          }),
        ),
      },
    }).href,
  )
}

function setupOverflowDetection() {
  overflowObserver = new MutationObserver(() => {
    nextTick(() => {
      checkOverflowForVisibleItems()
    })
  })

  const container = virtualScroller.value?.$el
  if (container) {
    overflowObserver.observe(container, {
      childList: true,
      subtree: true,
    })
  }
}

function checkOverflowForVisibleItems() {
  const logItems = document.querySelectorAll('.log-item')

  logItems.forEach((item) => {
    const itemId = (item as HTMLElement).dataset.logId
    if (itemId) {
      const listItem = list.value.find((i: any) => i.id === itemId)
      if (listItem) {
        const isOverflowing =
          item.scrollHeight > (item as HTMLElement).offsetHeight
        if (listItem.hideContent !== isOverflowing) {
          listItem.hideContent = isOverflowing
        }
      }
    }
  })
}

// --- Lifecycle ---

// created
checkList.value = ['error'].includes(props.dataflow.status)
  ? ['WARN', 'ERROR']
  : ['INFO', 'WARN', 'ERROR']

onMounted(() => {
  init()
  setupOverflowDetection()
})

onUnmounted(() => {
  clearTimer()
  if (overflowObserver) {
    overflowObserver.disconnect()
  }
})
</script>

<template>
  <div
    class="log-container flex justify-content-between"
    :class="{ fullscreen }"
  >
    <NodeList
      v-show="!hideFilter"
      v-model:value="activeNodeId"
      :label="$t('packages_dag_migration_consolepanel_quanburizhi')"
      class="node-list border-end flex-shrink-0"
      @change="changeItem"
    />
    <div class="main node-log-main flex-fill flex flex-column px-4 py-3">
      <div class="flex align-items-center gap-3">
        <TimeSelect
          ref="timeSelect"
          :options="timeOptions"
          :range="[firstStartTime, lastStopTime || getTime()]"
          @change="changeTime"
        />
        <ElInput
          v-model="keyword"
          class="search-input"
          :placeholder="$t('packages_dag_components_log_qingshururizhi')"
          clearable
          style="width: 240px"
          @input="searchFnc"
        />

        <el-button
          :loading="downloadLoading"
          class="min-w-0"
          type="primary"
          plain
          @click="handleDownload"
        >
          <VIcon>download</VIcon>
        </el-button>

        <ElButton
          v-if="isDaas && !hideDownload"
          :loading="downloadLoading"
          type="warning"
          plain
          class="ml-0"
          @click="handleDownloadAnalysis"
          ><VIcon class="mr-1">download</VIcon
          >{{ $t('packages_business_download_analysis_report') }}</ElButton
        >

        <el-button
          v-feature="'dataScraping'"
          class="min-w-0 ml-0"
          type="primary"
          plain
          @click="openDataCapture"
          >{{ $t('public_data_capture') }}</el-button
        >
      </div>
      <div class="level-line my-2 flex align-items-center">
        <ElCheckboxGroup
          v-model="checkList"
          :disabled="loading"
          :min="1"
          class="inline-flex"
          @change="searchFnc"
        >
          <ElCheckbox
            v-for="item in checkItems"
            :key="item.label"
            :label="item.label"
            @change="(val: any) => handleCheckbox(val, item.label)"
            >{{ item.text }}
          </ElCheckbox>
        </ElCheckboxGroup>

        <el-divider class="mx-4" direction="vertical" />

        <ElCheckbox
          v-model="switchData.timestamp"
          @change="toggleCol('timestamp')"
          >{{
            $t('packages_business_logs_nodelog_xianshishijianchuo')
          }}</ElCheckbox
        >

        <el-button
          text
          type="primary"
          class="ml-auto"
          @click="handleFullScreen"
        >
          <VIcon class="mr-1">{{ fullscreen ? 'suoxiao' : 'fangda' }}</VIcon>
          <span>{{
            fullscreen
              ? $t('packages_form_js_editor_exit_fullscreen')
              : $t('packages_form_js_editor_fullscreen')
          }}</span>
        </el-button>
      </div>
      <div
        v-loading="loading"
        class="log-list flex-1 rounded-2 position-relative"
        style="height: 0"
      >
        <Transition name="fade">
          <el-button
            v-show="!isScrollBottom && list.length"
            class="jump-to-latest"
            type="primary"
            circle
            size="small"
            @click="scrollToBottom"
          >
            <VIcon>arrow-down</VIcon>
          </el-button>
        </Transition>
        <DynamicScroller
          ref="virtualScroller"
          :items="list"
          key-field="id"
          :min-item-size="30"
          class="scroller px-2 py-1 h-100"
          @scroll="scrollFnc"
        >
          <template #before>
            <div
              v-show="preLoading || showNoMore || !list.length"
              class="before-scroll-content text-center font-color-light pb-2"
            >
              <div v-show="preLoading">
                <el-icon>
                  <el-icon-loading />
                </el-icon>
              </div>
              <ElAlert
                v-show="showNoMore"
                :title="$t('packages_dag_customer_logs_no_more_data')"
                type="info"
                class="no-more__alert position-absolute py-1 px-2"
              />
              <VEmpty
                v-if="!list.length"
                :description="
                  keyword
                    ? $t('packages_dag_customer_logs_no_search_data')
                    : $t('public_data_no_data')
                "
              />
            </div>
          </template>
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :data-index="index"
              :data-log-id="item.id"
              :size-dependencies="[
                item.id,
                item.message,
                item.errorStack,
                item.dataText,
              ]"
            >
              <div class="log-line pr-6 font-color-light">
                <div
                  :ref="`icon${item.id}`"
                  class="log-item"
                  :data-log-id="item.id"
                  :class="{
                    'hide-content cursor-pointer': item.hideContent,
                  }"
                  @click="handleLog(item, $event)"
                >
                  <VIcon
                    class="expand-icon mr-1"
                    :class="{ 'rotate-90': item.expand }"
                    >arrow-right</VIcon
                  >
                  <span
                    v-if="showCols.includes('timestamp')"
                    class="font-color-slight"
                    >[{{ item.timestampLabel }}]</span
                  >
                  <span
                    v-if="item.errorCode"
                    class="color-primary cursor-pointer mr-2 text-decoration-underline"
                    @click.stop.prevent="handleCode(item)"
                    >{{ item.fullErrorCode || item.errorCode }}</span
                  >
                  <span
                    :class="colorMap[item.level.toUpperCase()]"
                    v-html="item.message"
                  />
                  <ElLink
                    v-if="
                      item.level === 'ERROR' &&
                      item.fullErrorCode === 'Task.ScheduleLimit'
                    "
                    type="primary"
                    class="text-decoration-underline"
                    @click="
                      $emit('action', { ...item, ...{ type: 'ScheduleLimit' } })
                    "
                  >
                    {{
                      $t('packages_business_logs_nodelog_qingshengjidingyue')
                    }}
                  </ElLink>
                </div>
                <div v-if="item.expand" class="log-detail bg-color-normal p-3">
                  <p v-if="item.message" class="mb-2 fw-bold font-color-dark">
                    message:
                  </p>
                  <div
                    v-if="item.message"
                    class="mb-4 text-break"
                    v-html="item.message"
                  />
                  <p
                    v-if="item.errorStack"
                    class="mb-2 fw-bold font-color-dark"
                  >
                    errorStack:
                  </p>
                  <div
                    v-if="item.errorStack"
                    class="text-break"
                    v-html="item.errorStack"
                  />
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <ElDialog
      v-model="dialog"
      :title="$t('packages_dag_components_log_rizhidengjishe')"
      width="437px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ElForm label-width="120px">
        <ElFormItem
          :label="$t('packages_dag_components_log_rizhijibie')"
          prop="level"
        >
          <ElSelect v-model="form.level" style="width: 275px">
            <ElOption
              v-for="item in checkItems"
              :key="item.label"
              :label="item.text"
              :value="item.label"
            />
          </ElSelect>
        </ElFormItem>
        <template v-if="form.level === 'DEBUG'">
          <ElFormItem
            :label="$t('packages_dag_components_log_debug')"
            prop="param"
          />
          <ElFormItem
            :label="$t('packages_dag_components_log_kaiqishichangmiao')"
            prop="start"
          >
            <ElInput
              v-model="form.intervalCeiling"
              type="number"
              style="width: 275px"
            />
          </ElFormItem>
          <ElFormItem
            :label="$t('packages_dag_components_log_zuidashijianshu')"
            prop="max"
          >
            <ElInput
              v-model="form.recordCeiling"
              type="number"
              style="width: 275px"
            />
          </ElFormItem>
        </template>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton
            :disabled="saveLoading"
            type="primary"
            @click="handleSave"
            >{{ $t('public_button_confirm') }}</ElButton
          >
        </span>
      </template>
    </ElDialog>

    <ElDialog
      v-model="codeDialog.visible"
      width="80%"
      class="max-w-1000 mt-25 --padding"
      :close-on-click-modal="false"
      append-to-body
      @open="expandErrorMessage = false"
    >
      <template #header>
        <div class="flex align-center gap-2">
          <VIcon class="color-danger" size="18">circle-close-filled</VIcon>
          <span class="fs-6 fw-sub">{{
            codeDialog.data.fullErrorCode || codeDialog.data.errorCode
          }}</span>
        </div>
      </template>

      <div class="font-color-light">
        <!--错误信息-->
        <template v-if="codeDialog.data.describe">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('packages_business_milestone_list_cuowuxinxi') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.describe"
          />
        </template>

        <!--错误原因/描述-->
        <template v-if="codeDialog.data.dynamicDescribe">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('public_task_reasons_for_error') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.dynamicDescribe"
          />
        </template>

        <!--解决方案-->
        <template v-if="codeDialog.data.solution">
          <div class="fw-sub mb-3 font-color-dark">
            {{ $t('packages_business_solution') }}
          </div>
          <div
            class="error-stack-wrap text-prewrap mb-6 font-color-light border overflow-y-auto bg-subtle rounded-lg p-4 lh-base"
            v-html="codeDialog.data.solution"
          />
        </template>

        <!--See Also-->
        <template
          v-if="
            !hideSeeAlso &&
            codeDialog.data.seeAlso &&
            codeDialog.data.seeAlso.length
          "
        >
          <div class="fw-sub mb-3 font-color-dark">See Also</div>
          <ol class="pl-6 mb-6">
            <li
              v-for="(item, index) in codeDialog.data.seeAlso"
              :key="index"
              class="list-decimal"
            >
              <ElLink
                type="primary"
                class="text-decoration-underline"
                @click="handleLink(item)"
                >{{ item }}</ElLink
              >
            </li>
          </ol>
        </template>

        <!--错误堆栈-->
        <template v-if="codeDialog.data.errorStack">
          <div class="mb-3 flex justify-content-between align-items-end">
            <span class="fw-sub font-color-dark">{{
              $t('packages_business_logs_nodelog_cuowuduizhan')
            }}</span>
          </div>
          <div
            class="error-stack-pre-wrap position-relative font-color-light rounded-lg"
          >
            <div class="position-absolute end-0 top-0 px-2 pt-1">
              <el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark"
                @click="handleCopyStack(codeDialog.data.errorStack)"
              >
                <VIcon class="mr-1">copy</VIcon>
                <span class="">{{ $t('public_button_copy') }}</span> </el-button
              ><el-button
                text
                type="primary"
                class="px-1 py-0.5 font-color-dark ml-2"
                @click="expandErrorMessage = !expandErrorMessage"
              >
                {{
                  expandErrorMessage
                    ? $t('packages_business_verification_details_shouqi')
                    : $t('public_button_expand')
                }}<i
                  class="el-icon-arrow-down is-rotate ml-1"
                  :class="{ 'is-active': expandErrorMessage }"
                />
              </el-button>
            </div>

            <pre
              class="m-0 p-4 pt-0 mt-6 font-color-dark"
              :class="expandErrorMessage ? '' : 'truncate-two-lines'"
              style="max-height: 400px; font-size: 13px; overflow-x: auto"
              >{{ codeDialog.data.errorStack }}</pre
            >
          </div>
        </template>
      </div>

      <template v-if="!isDaas" #footer>
        <ElButton @click="codeDialog.visible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" @click="handleCreateTicket">{{
          $t('dfs_user_contactus_chuangjiangongdan')
        }}</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="downloadAnalysis.visible"
      width="437px"
      custom-class="pro-dialog"
      :close-on-click-modal="false"
      :append-to-body="true"
      @close="onClose"
    >
      <template #header>
        <div class="el-dialog__title">
          {{ $t('packages_business_download_analysis_report_title') }}
        </div>
      </template>
      <div class="pb-6 flex flex-column gap-4">
        <div class="fs-7 font-color-sslight">
          {{ $t('packages_business_download_analysis_report_desc') }}
        </div>
        <div>
          {{ downloadAnalysis.steps[downloadAnalysis.currentStep].label }},
          {{ $t('packages_business_long_wait') }}<span class="dotting" />
        </div>
        <el-progress
          :stroke-width="9"
          :percentage="downloadAnalysis.progress"
        />
      </div>
    </ElDialog>

    <Download v-model:visible="downloadDialog" :dataflow="dataflow" />
  </div>
</template>

<style lang="scss" scoped>
.log-container {
  height: inherit;

  &.fullscreen {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background: #fff;
  }
}

.filter-items {
  width: 200px;
  user-select: none;
  overflow-y: auto;
}

.filter-items__item {
  padding: 0 16px;
  height: 40px;
  cursor: pointer;

  &.active {
    background: rgba(44, 101, 255, 0.05);
  }
}

.main {
  width: 0;
}

.white-space-pre {
  white-space: pre-wrap;
  word-break: break-all;
}

.node-list {
  width: 224px;

  :deep(.error-icon) {
    display: none;
  }

  :deep(.error-node) {
    .error-icon {
      display: inline-flex;
    }
  }
}

.log-list {
  background-color: rgba(229, 236, 255, 0.22);

  :deep(.log-line) {
    padding: 8px 16px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    width: 100%;
    font-family:
      'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;

    .log-item {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;

      .expand-icon {
        display: none;
      }

      &.hide-content {
        .expand-icon {
          display: inline-flex;
        }
      }
    }

    .info-level {
      color: #c9cdd4;
    }

    .warn-level {
      color: #d5760e;
    }

    .error-level,
    .fatal-level {
      color: #d44d4d;
    }

    .debug-level {
      color: #178061;
    }
  }

  :deep(.highlight-bg-color) {
    background-color: #ff0;
  }

  :deep(.empty-wrap) {
    margin: 24px 0;
  }

  :deep(
    .vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper
  ) {
    overflow: visible;
  }

  :deep(.log__label) {
    white-space: nowrap;
  }
}

.jump-to-latest {
  position: absolute;
  bottom: 16px;
  right: 24px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  z-index: 2;

  :deep(.el-alert__closebtn) {
    top: 7px;
  }
}

.node-list-item {
  line-height: 32px;
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &.active {
    background-color: rgba(229, 236, 255, 0.3);
  }
}

.icon-btn {
  &:hover {
    background-color: var(--bg-hover);
  }
}

.error-stack-wrap {
  //height: 465px;
  &.has-describe {
    //height: 280px;
  }
}

.clipboard-button {
  right: 18px;
  top: 30px;
}
.ml-download-report {
  background: cadetblue;
  border-color: cadetblue;
}
</style>

<style lang="scss">
.error-code-dialog {
  .el-dialog__body {
    height: 680px;
    overflow-y: auto;
  }
}
</style>
