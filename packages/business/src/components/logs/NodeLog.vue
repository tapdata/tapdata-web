<script>
import { CancelToken, monitoringLogsApi, proxyApi, taskApi } from '@tap/api'
import { IconButton, TimeSelect, VIcon } from '@tap/component'

import VEmpty from '@tap/component/src/base/v-empty/VEmpty.vue'
import i18n from '@tap/i18n'
import { copyToClipboard, CountUp, downloadBlob, openUrl } from '@tap/shared'
import Time from '@tap/shared/src/time'

import dayjs from 'dayjs'
import { cloneDeep, debounce, escape, uniqBy } from 'lodash-es'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { mapGetters } from 'vuex'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

import NodeList from '../nodes/List'
import Download from './Download'

export default {
  name: 'NodeLog',
  components: {
    VIcon,
    TimeSelect,
    DynamicScroller,
    DynamicScrollerItem,
    VEmpty,
    NodeList,
  },

  components: {
    IconButton,
    VIcon,
    TimeSelect,
    DynamicScroller,
    DynamicScrollerItem,
    VEmpty,
    NodeList,
    Download,
  },

  props: {
    dataflow: {
      type: Object,
      default: () => {},
    },
    logsData: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: [],
        }
      },
    },
    hideFilter: {
      type: Boolean,
      default: false,
    },
    logTotals: {
      type: Array,
      default: () => [],
    },
    nodeId: {
      type: String,
      default: '',
    },
  },
  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    return {
      isDaas,
      hideDownload: import.meta.env.VUE_APP_HIDE_ANALYSE_DOWNLOAD,
      activeNodeId: this.nodeId,
      keyword: '',
      checkList: [],
      checkItems: [
        /*{
          label: 'DEBUG',
          text: 'DEBUG',
        },*/
        {
          label: 'INFO',
          text: 'INFO',
        },
        {
          label: 'WARN',
          text: 'WARN',
        },
        {
          label: 'ERROR',
          text: 'ERROR',
        },
      ],
      timer: null,
      downloadLoading: false,
      loading: false,
      saveLoading: false,
      preLoading: false,
      resetDataTime: null,
      list: [],
      iconMap: {
        INFO: 'success',
        WARN: 'warning',
        ERROR: 'error',
        FATAL: 'error',
        DEBUG: 'debug',
      },
      colorMap: {
        INFO: 'color-info',
        WARN: 'color-warning',
        ERROR: 'color-danger',
        FATAL: 'color-danger',
        DEBUG: 'color-disable',
      },
      newPageObj: {
        page: 0,
        pageSize: 50,
        total: 0,
      },
      oldPageObj: {
        page: 0,
        pageSize: 50,
        total: 0,
      },
      isScrollBottom: false,
      form: {
        level: 'INFO',
        intervalCeiling: 500,
        recordCeiling: 500,
      },
      dialog: false,
      timeOptions: [
        {
          label: i18n.t('public_select_option_all'),
          value: 'full',
        },
        {
          label: i18n.t('public_time_Last_six_hours'),
          value: '6h',
        },
        {
          label: i18n.t('public_time_last_day'),
          value: '1d',
        },
        {
          label: i18n.t('public_time_last_three_days'),
          value: '3d',
        },
        {
          label: i18n.t('public_time_custom_time'),
          type: 'custom',
          value: 'custom',
        },
      ],
      quotaTimeType: 'full',
      quotaTime: [],
      newFilter: {},
      showNoMore: false,
      extraEnterCount: 0,
      codeDialog: {
        visible: false,
        data: {
          errorStack: '',
          errorCode: '',
          fullErrorCode: '',
          describe: '',
          solution: '',
          dynamicDescribe: '',
          seeAlso: [],
          module: '',
          message: '',
        },
      },
      showCols: [],
      switchData: {
        timestamp: false,
      },
      fullscreen: false,
      showTooltip: false,
      hideSeeAlso:
        import.meta.env.VUE_APP_PAGE_TITLE === 'IKAS' ||
        import.meta.env.VUE_APP_HIDE_LOG_SEE_ALSO,
      downloadAnalysis: {
        visible: false,
        progress: 0,
        currentStep: 0,
        steps: [
          {
            label: i18n.t('packages_business_exporting_task'),
          },
          {
            label: i18n.t('packages_business_exporting_run_history'),
          },
          {
            label: i18n.t('packages_business_exporting_task_log'),
          },
          {
            label: i18n.t('packages_business_exporting_metrics'),
          },
          {
            label: i18n.t('packages_business_gen_engine_cpu_chart'),
          },
          {
            label: i18n.t('packages_business_gen_tm_cpu_chart'),
          },
          {
            label: i18n.t('packages_business_gen_engine_mem_chart'),
          },
          {
            label: i18n.t('packages_business_gen_tm_mem_chart'),
          },
          {
            label: i18n.t('packages_business_exporting_engine_thread'),
          },
          {
            label: i18n.t('packages_business_exporting_tm_thread'),
          },
          {
            label: i18n.t('packages_business_downloading_file'),
          },
        ],
      },
      expandErrorMessage: false,
      downloadDialog: false,
    }
  },
  computed: {
    ...mapGetters('dataflow', ['allNodes', 'nodeById']),

    nodeLogCountMap() {
      return this.logTotals
        .filter((t) => t.nodeId)
        .reduce((cur, next) => {
          const count = cur[next.nodeId] || 0
          return { ...cur, [next.nodeId]: count + next.count }
        }, {})
    },

    items() {
      return this.allNodes.filter((t) => !!this.nodeLogCountMap[t.id])
    },

    firstStartTime() {
      const { startTime } = this.dataflow || {}
      const { taskRecordId, start } = this.$route.query || {}
      if (taskRecordId) {
        return Number(start)
      }
      return startTime ? new Date(startTime).getTime() : null
    },

    lastStopTime() {
      const { stopTime } = this.dataflow || {}
      const { taskRecordId, end } = this.$route.query || {}
      if (taskRecordId) {
        return Number(end)
      }
      return stopTime ? new Date(stopTime).getTime() : null
    },

    isNoMore() {
      const { page, pageSize, total } = this.oldPageObj
      if (!page) return false
      return page * pageSize > total
    },

    isEnterTimer() {
      return (
        this.quotaTimeType !== 'custom' && this.dataflow?.status === 'running'
      )
    },

    logSetting() {
      return this.dataflow?.logSetting || {}
    },
  },
  watch: {
    dataflow: {
      deep: true,
      handler(v1, v2) {
        if (v1.status === 'edit') return
        if (v1.taskRecordId + v1.startTime !== v2.taskRecordId + v2.startTime) {
          this.init()
        }
      },
    },
    nodeId(v) {
      this.activeNodeId = v
    },
  },
  created() {
    this.checkList = ['error'].includes(this.dataflow.status)
      ? ['WARN', 'ERROR']
      : ['INFO', 'WARN', 'ERROR']
  },
  mounted() {
    this.init()
  },
  unmounted() {
    this.clearTimer()
  },
  methods: {
    init: debounce(function () {
      if (this.$route.name === 'MigrationMonitorViewer') {
        this.timeOptions = [
          {
            label: i18n.t('public_select_option_all'),
            value: 'full',
          },
          {
            label: i18n.t('public_time_custom_time'),
            type: 'custom',
            value: 'custom',
          },
        ]
      }
      this.extraEnterCount = 0
      this.clearTimer()
      this.resetData()
    }, 500),

    resetData() {
      this.preLoading = false
      this.resList()
      this.resetNewPage()
      this.resetOldPage()
      this.resetDataTime = Time.now()
      this.loadOld(this.pollingData)
    },

    resetOldPage() {
      this.oldPageObj = {
        page: 0,
        pageSize: 20,
        total: 0,
      }
    },

    resetNewPage() {
      this.newPageObj = {
        page: 0,
        pageSize: 20,
        total: 0,
      }
    },

    clearTimer() {
      this.timer && clearInterval(this.timer)
      this.timer = null
    },

    pollingData() {
      this.clearTimer()
      this.timer = setInterval(() => {
        // 不满足轮询条件，则多请求几次结束
        if (
          this.isEnterTimer ||
          (['error', 'schedule_failed'].includes(this.dataflow.status) &&
            ++this.extraEnterCount < 5)
        ) {
          this.loadNew()
        }
      }, 5000)
      this.loadNew()
    },

    changeItem(val) {
      $emit(this, 'update:nodeId', val)
      this.init()
    },

    changeTime(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime
        ? val?.split(',')?.map((t) => Number(t))
        : this.getTimeRange(val)
      this.init()
    },

    searchFnc() {
      this.clearTimer()
      this.init()
    },

    scrollFnc(ev) {
      const target = ev.target
      if (this.list.length && target.scrollTop <= 0) {
        this.loadOld()
      }
      this.isScrollBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight
    },

    loadOld(callback) {
      if (this.isNoMore || this.loading) {
        return
      }
      const filter = this.getOldFilter()
      if (!filter.start || !filter.end) {
        return
      }
      filter.page++
      if (this.list.length) {
        this.preLoading = true
      } else {
        this.loading = true
      }
      monitoringLogsApi
        .query(filter)
        .then((data = {}) => {
          const items = this.getFormatRow(data.items?.reverse())
          this.oldPageObj.total = data.total || 0
          this.oldPageObj.page = filter.page
          if (this.list.length && this.oldPageObj.page !== 1) {
            this.list = Object.freeze(uniqBy([...items, ...this.list], 'id'))
            this.scrollToItem(items.length - 1)
          } else {
            this.list = Object.freeze(items)
            this.scrollToBottom()
          }
        })
        .finally(() => {
          this.preLoading = false
          this.loading = false
          callback?.()
          this.showNoMore = this.oldPageObj.page > 1 ? this.isNoMore : false
          if (this.showNoMore) {
            setTimeout(() => {
              this.showNoMore = false
            }, 3000)
          }
        })
    },

    loadNew() {
      let filter
      const { page, pageSize, total } = this.newPageObj
      if (page === 0 || page * pageSize > total) {
        this.resetNewPage()
        filter = this.getNewFilter()
        filter.page++
      } else {
        this.newFilter.page++
        filter = Object.assign({}, this.newFilter, {
          page: this.newFilter.page,
        })
      }
      if (!filter.start || !filter.end) {
        return
      }
      monitoringLogsApi.query(filter).then((data = {}) => {
        const items = this.getFormatRow(data.items)
        this.newPageObj.total = data.total || 0
        const arr = uniqBy([...this.list, ...items], 'id')
        if (arr.length === this.list.length) {
          this.resetNewPage()
          return
        }
        this.newPageObj.page = filter.page
        this.list = Object.freeze(arr)
        if (this.isScrollBottom) {
          this.scrollToBottom()
        }
        // 清空额外请求的计数
        if (this.isEnterTimer) {
          this.extraEnterCount = 0
        }
      })
    },

    getFormatRow(rowData = []) {
      const result = cloneDeep(rowData)
      result.forEach((row) => {
        row.timestampLabel = this.formatTime(row.date)
        row.expand = false
        row.hideContent = false
        row.message = escape(row.message)
        if (row.fullErrorCode === 'Task.ScheduleLimit') {
          row.message = i18n.t('packages_business_logs_nodelog_yinqingkeyibei')
        }
      })
      return result
    },

    getHighlightSpan(str = '') {
      const { keyword } = this
      if (!keyword) {
        return str
      }
      const reg = new RegExp(keyword.toLowerCase(), 'gi')
      return str.replace(reg, `<span class="highlight-bg-color">$&</span>`)
    },

    getOldFilter() {
      const [start, end] = this.quotaTime.length
        ? this.quotaTime
        : this.getTimeRange(this.quotaTimeType)
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      const params = {
        start,
        end,
        page: this.oldPageObj.page,
        pageSize: this.oldPageObj.pageSize,
        order: 'desc',
        taskId,
        taskRecordId,
        nodeId: this.activeNodeId === '' ? null : this.activeNodeId,
        search: this.keyword,
        levels: this.checkList,
      }

      if (this.activeNodeId) {
        const node = this.nodeById(this.activeNodeId)
        if (
          [
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

      return params
    },

    getNewFilter() {
      const [start, end] = [
        this.list.at(-1)?.timestamp || this.resetDataTime,
        Time.now(),
      ]
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      const params = {
        start,
        end,
        page: this.newPageObj.page,
        pageSize: this.newPageObj.pageSize,
        order: 'asc',
        taskId,
        taskRecordId,
        nodeId: this.activeNodeId === '' ? null : this.activeNodeId,
        search: this.keyword,
        levels: this.checkList,
      }

      if (this.activeNodeId) {
        const node = this.nodeById(this.activeNodeId)
        if (
          [
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

      this.newFilter = params
      return params
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.virtualScroller?.scrollToBottom?.()
        this.isScrollBottom = true
      })
    },

    scrollToItem(index) {
      this.$nextTick(() => {
        this.$refs.virtualScroller?.scrollToItem?.(index)
      })
    },

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss.SSS') {
      return dayjs(date).format(type)
    },

    handleDownload() {
      this.downloadDialog = true
      return
      const [start, end] = this.quotaTime.length
        ? this.quotaTime
        : this.getTimeRange(this.quotaTimeType)
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      const filter = {
        start,
        end,
        taskId,
        taskRecordId,
      }
      this.downloadLoading = true
      monitoringLogsApi
        .export(filter)
        .then((data) => {
          downloadBlob(data)
        })
        .catch(() => {
          this.$message.error(
            i18n.t('packages_dag_components_log_xiazaishibai'),
          )
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },

    handleSetting(val) {
      const { level, intervalCeiling, recordCeiling } = this.logSetting
      this.form.level = val
      if (level) {
        this.form = {
          level,
          intervalCeiling,
          recordCeiling,
        }
      }
      this.dialog = true
    },

    handleClose() {
      const index = this.checkList.indexOf('DEBUG')
      this.checkList.splice(index, 1)
      this.searchFnc()
      this.dialog = false
    },

    handleSave() {
      const { form } = this
      const params = {
        level: form.level,
      }
      if (form.level === 'DEBUG') {
        params.intervalCeiling = form.intervalCeiling
        params.recordCeiling = form.recordCeiling
      }
      this.saveLoading = true
      taskApi
        .putLogSetting(this.dataflow.id, params)
        .then(() => {
          this.$message.success(this.$t('public_message_save_ok'))
          this.dialog = false
        })
        .finally(() => {
          this.saveLoading = false
        })
        .catch(() => {
          this.$message.error(this.$t('public_message_save_fail'))
        })
    },

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime || Time.now()
      if (status === 'running') {
        endTimestamp = Time.now()
      }
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
          result = [this.dataflow.lastStartDate, endTimestamp]
          break
        case 'full':
          result = [this.firstStartTime, endTimestamp]
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
    },

    resList() {
      this.list = []
    },

    getTime() {
      return Time.now()
    },

    handleCode(item = {}) {
      const params = {
        className: 'ErrorCodeService',
        method: 'getErrorCodeWithDynamic',
        args: [
          item.errorCode,
          i18n.locale === 'en' ? 'en' : 'cn',
          item.dynamicDescriptionParameters,
        ],
      }

      this.codeDialog.data.errorStack = item.errorStack
      this.codeDialog.data.errorCode = item.errorCode
      this.codeDialog.data.fullErrorCode = item.fullErrorCode
      this.codeDialog.data.message = item.message
      this.codeDialog.data.module = ''

      proxyApi
        .call(params)
        .then((data) => {
          Object.assign(this.codeDialog.data, data)

          this.codeDialog.data.describe = data.describe || item.message
          this.codeDialog.visible = true
        })
        .catch(() => {
          this.codeDialog.visible = true
        })
    },

    handleLink(val) {
      openUrl(val)
    },

    command(command) {
      const index = this.showCols.indexOf(command)
      index !== -1
        ? this.showCols.splice(index, 1)
        : this.showCols.push(command)
    },

    handleCheckbox(flag, val) {
      if (flag && val === 'DEBUG') {
        this.handleSetting(val)
      }
    },

    handleFullScreen() {
      this.fullscreen = !this.fullscreen
    },

    handleHideContent(data) {
      const { item = {} } = data || {}
      const dom = this.$refs[`icon${item.id}`] || {}
      item.hideContent = dom.scrollHeight > dom.offsetHeight
      return item.hideContent
    },

    handleLog(item) {
      if (!item.hideContent) return
      item.expand = !item.expand
    },

    onCopy() {
      this.showTooltip = true
    },

    async handleDownloadAnalysis() {
      this.downloadAnalysis.progress = 0
      this.downloadAnalysis.visible = true
      this.analysisCancelSource = CancelToken.source()
      this.initSteps()

      const blogData = await taskApi.downloadAnalyze(this.dataflow.id, {
        cancelToken: this.analysisCancelSource.token,
      })

      if (blogData.data.type === 'application/json') {
        this.$message.error(
          this.$t('packages_business_connections_test_xiazaishibai'),
        )
        this.countUp.reset()
        this.downloadAnalysis.visible = false
        return
      }

      downloadBlob(blogData)

      this.completeSteps()
    },

    onClose() {
      this.analysisCancelSource?.cancel()
      this.countUp.reset()
    },

    updateProgress(temp, val) {
      val = Number(val)

      this.downloadAnalysis.currentStep = Math.min(
        Math.floor(val / 9),
        this.downloadAnalysis.steps.length - 1,
      )
      this.downloadAnalysis.progress = val
    },

    initSteps() {
      this.downloadAnalysis.currentStep = 0
      this.downloadAnalysis.progress = 0
      this.countUp = new CountUp({}, 99, {
        duration: 62,
        plugin: {
          render: this.updateProgress,
        },
        useEasing: false,
        onCompleteCallback: () => {},
      })
      this.countUp.start()
    },

    completeSteps() {
      this.countUp.pauseResume()
      this.updateProgress({}, 100)
      this.$message.success('public_message_download_ok')

      setTimeout(() => {
        this.downloadAnalysis.visible = false
      }, 200)
    },

    handleCopyStack(stack) {
      copyToClipboard(stack)
      this.$message.success(this.$t('public_message_copy_success'))
    },

    openDataCapture() {
      window.open(
        this.$router.resolve({
          name: 'DataCapture',
          params: { id: this.dataflow.id },
        }).href,
        `DataCapture-${this.dataflow.id}`,
      )
    },
    handleCreateTicket() {
      const errorCode =
        this.codeDialog.data.fullErrorCode || this.codeDialog.data.errorCode

      window.open(
        this.$router.resolve({
          name: 'TicketSystem',
          query: {
            form: encodeURIComponent(
              JSON.stringify({
                jobId: this.dataflow.id,
                subject: `${errorCode}-${this.codeDialog.data.message}`,
                description: `Error Code: ${errorCode}
Module: ${this.codeDialog.data.module || ''}
Describe: ${this.codeDialog.data.describe ? `\n${this.codeDialog.data.describe}` : ''}
Stack Trace: ${this.codeDialog.data.errorStack ? `\n${this.codeDialog.data.errorStack}` : ''}`,
              }),
            ),
          },
        }).href,
      )
    },
  },
}
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
            @change="handleCheckbox(arguments[0], item.label)"
            >{{ item.text }}
          </ElCheckbox>
        </ElCheckboxGroup>

        <el-divider class="mx-4" direction="vertical" />

        <ElCheckbox
          v-model="switchData.timestamp"
          @change="command('timestamp')"
          >{{
            $t('packages_business_logs_nodelog_xianshishijianchuo')
          }}</ElCheckbox
        >

        <span
          class="color-primary cursor-pointer ml-auto"
          @click="handleFullScreen"
        >
          <VIcon class="mr-1">{{ fullscreen ? 'suoxiao' : 'fangda' }}</VIcon>
          <span>{{
            fullscreen
              ? $t('packages_form_js_editor_exit_fullscreen')
              : $t('packages_form_js_editor_fullscreen')
          }}</span>
        </span>
      </div>
      <div
        v-loading="loading"
        class="log-list flex-1 rounded-2"
        style="height: 0"
      >
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
                  :class="{
                    'hide-content cursor-pointer': handleHideContent(
                      arguments[0],
                      item,
                    ),
                  }"
                  @click="handleLog(item)"
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
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
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
    background-color: map.get($bgColor, hover);
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
