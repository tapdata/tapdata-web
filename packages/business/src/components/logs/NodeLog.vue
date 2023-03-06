<template>
  <div class="log-container flex justify-content-between">
    <div v-show="!hideFilter" class="filter-items border-end">
      <div class="px-2 py-3">
        <div
          class="node-list-item px-2 mb-1 flex align-center font-color-dark"
          :class="{ active: activeNodeId === 'all' }"
          @click="changeItem()"
        >
          <VIcon size="20" class="mr-1">folder</VIcon>{{ $t('packages_dag_migration_consolepanel_quanburizhi') }}
        </div>
        <div
          v-for="node in items"
          :key="node.id"
          class="node-list-item px-2 mb-1 flex align-center font-color-dark"
          :class="{ active: activeNodeId === node.id }"
          @click="changeItem(node.id)"
        >
          <NodeIcon :node="node" :size="18" />
          <div class="flex-1 ml-1 text-truncate">{{ node.name }}</div>
        </div>
      </div>
    </div>
    <div class="main flex-fill flex flex-column px-4 py-3">
      <div class="flex mb-2 align-items-center">
        <TimeSelect
          :options="timeOptions"
          :range="[firstStartTime, lastStopTime || getTime()]"
          ref="timeSelect"
          @change="changeTime"
        ></TimeSelect>
        <ElInput
          class="search-input ml-4"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('packages_dag_components_log_qingshururizhi')"
          size="mini"
          clearable
          style="width: 240px"
          @input="searchFnc"
        ></ElInput>
        <ElButton :loading="downloadLoading" type="text" size="mini" class="ml-4" @click="handleDownload">{{
          $t('public_button_download')
        }}</ElButton>
      </div>
      <div class="level-line mb-2">
        <ElCheckboxGroup
          v-model="checkList"
          :disabled="loading"
          :min="1"
          size="mini"
          class="inline-flex"
          @change="searchFnc"
        >
          <ElCheckbox v-for="item in checkItems" :label="item.label" :key="item.label">{{ item.text }}</ElCheckbox>
        </ElCheckboxGroup>
        <ElButton type="text" size="mini" class="ml-4" @click="handleSetting">{{
          $t('packages_dag_components_log_rizhidengjishe')
        }}</ElButton>
      </div>
      <div v-loading="loading" class="log-list flex-1 rounded-2" style="height: 0">
        <DynamicScroller
          ref="virtualScroller"
          :items="list"
          key-field="id"
          :min-item-size="30"
          class="scroller px-2 py-1 h-100"
          @scroll.native="scrollFnc"
        >
          <template #before>
            <div
              v-show="preLoading || showNoMore || !list.length"
              class="before-scroll-content text-center font-color-light pb-2"
            >
              <div v-show="preLoading">
                <i class="el-icon-loading"></i>
              </div>
              <ElAlert
                v-show="showNoMore"
                :title="$t('packages_dag_customer_logs_no_more_data')"
                type="info"
                class="no-more__alert position-absolute py-1 px-2"
              ></ElAlert>
              <VEmpty
                v-if="!list.length"
                :description="keyword ? $t('packages_dag_customer_logs_no_search_data') : $t('public_data_no_data')"
              />
            </div>
          </template>
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :data-index="index"
              :size-dependencies="[item.id, item.message, item.errorStack, item.dataText]"
            >
              <VCollapse active="0">
                <template #header>
                  <div class="log-line flex align-items-center pr-6 flex font-color-light">
                    <VIcon :class="`${item.level.toLowerCase()}-level`" size="16">{{ iconMap[item.level] }}</VIcon>
                    <div v-html="item.titleDomStr" class="text-truncate flex-1"></div>
                  </div>
                </template>
                <template #content>
                  <div v-html="item.jsonDomStr" class="log-line pl-10 pr-4 py-2 font-color-light white-space-pre"></div>
                </template>
              </VCollapse>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <ElDialog
      :title="$t('packages_dag_components_log_rizhidengjishe')"
      width="437px"
      :visible.sync="dialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ElForm label-width="120px">
        <ElFormItem :label="$t('packages_dag_components_log_rizhijibie')" prop="level">
          <ElSelect v-model="form.level" style="width: 275px">
            <ElOption v-for="item in checkItems" :label="item.text" :value="item.label" :key="item.label"></ElOption>
          </ElSelect>
        </ElFormItem>
        <template v-if="form.level === 'DEBUG'">
          <ElFormItem :label="$t('packages_dag_components_log_debug')" prop="param"> </ElFormItem>
          <ElFormItem :label="$t('packages_dag_components_log_kaiqishichangmiao')" prop="start">
            <ElInput v-model="form.intervalCeiling" type="number" style="width: 275px"></ElInput>
          </ElFormItem>
          <ElFormItem :label="$t('packages_dag_components_log_zuidashijianshu')" prop="max">
            <ElInput v-model="form.recordCeiling" type="number" style="width: 275px"></ElInput>
          </ElFormItem>
        </template>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleClose">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton :disabled="saveLoading" size="mini" type="primary" @click="handleSave">{{
          $t('public_button_confirm')
        }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { mapGetters } from 'vuex'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { debounce } from 'lodash'

import { uniqueArr, downloadBlob, deepCopy } from '@tap/shared'
import Time from '@tap/shared/src/time'
import { VIcon, TimeSelect, VCollapse } from '@tap/component'
import VEmpty from '@tap/component/src/base/v-empty/VEmpty.vue'
import { monitoringLogsApi, taskApi } from '@tap/api'
import NodeIcon from '@tap/dag/src/components/NodeIcon'

export default {
  name: 'NodeLog',

  components: { NodeIcon, VIcon, TimeSelect, DynamicScroller, DynamicScrollerItem, VEmpty, VCollapse },

  props: {
    dataflow: {
      type: Object,
      default: () => {}
    },
    logsData: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: []
        }
      }
    },
    hideFilter: {
      type: Boolean,
      default: false
    },
    logTotals: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      activeNodeId: 'all',
      keyword: '',
      checkList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
      checkItems: [
        {
          label: 'DEBUG',
          text: 'DEBUG'
        },
        {
          label: 'INFO',
          text: 'INFO'
        },
        {
          label: 'WARN',
          text: 'WARN'
        },
        {
          label: 'ERROR',
          text: 'ERROR'
        }
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
        DEBUG: 'debug'
      },
      newPageObj: {
        page: 0,
        pageSize: 50,
        total: 0
      },
      oldPageObj: {
        page: 0,
        pageSize: 50,
        total: 0
      },
      isScrollBottom: false,
      form: {
        level: 'INFO',
        intervalCeiling: 500,
        recordCeiling: 500
      },
      dialog: false,
      timeOptions: [
        {
          label: i18n.t('public_select_option_all'),
          value: 'full'
        },
        {
          label: i18n.t('public_time_Last_six_hours'),
          value: '6h'
        },
        {
          label: i18n.t('public_time_last_day'),
          value: '1d'
        },
        {
          label: i18n.t('public_time_last_three_days'),
          value: '3d'
        },
        {
          label: i18n.t('public_time_custom_time'),
          type: 'custom',
          value: 'custom'
        }
      ],
      quotaTimeType: 'full',
      quotaTime: [],
      newFilter: {},
      showNoMore: false,
      extraEnterCount: 0
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    nodeLogCountMap() {
      return this.logTotals
        .filter(t => t.nodeId)
        .reduce((cur, next) => {
          const count = cur[next.nodeId] || 0
          return { ...cur, [next.nodeId]: count + next.count }
        }, {})
    },

    items() {
      return this.allNodes.filter(t => !!this.nodeLogCountMap[t.id])
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
      return this.quotaTimeType !== 'custom' && this.dataflow?.status === 'running'
    },

    logSetting() {
      return this.dataflow?.logSetting || {}
    }
  },

  watch: {
    'dataflow.status'(v) {
      if (v === 'edit') return
      this.init()
    },
    'dataflow.taskRecordId'() {
      this.init()
    },
    'dataflow.startTime'() {
      this.init()
    }
  },

  mounted() {
    this.init()
  },

  destroyed() {
    this.clearTimer()
  },

  methods: {
    init: debounce(function () {
      if (this.$route.name === 'MigrationMonitorViewer') {
        this.timeOptions = [
          {
            label: i18n.t('public_select_option_all'),
            value: 'full'
          },
          {
            label: i18n.t('public_time_custom_time'),
            type: 'custom',
            value: 'custom'
          }
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
        total: 0
      }
    },

    resetNewPage() {
      this.newPageObj = {
        page: 0,
        pageSize: 20,
        total: 0
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
          (['error', 'schedule_failed'].includes(this.dataflow.status) && ++this.extraEnterCount < 5)
        ) {
          this.loadNew()
        }
      }, 5000)
      this.loadNew()
    },

    changeItem(itemId = 'all') {
      if (this.activeNodeId === itemId) {
        return
      }
      this.activeNodeId = itemId
      this.init()
    },

    changeTime(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
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
      this.isScrollBottom = target.scrollHeight - target.scrollTop <= target.clientHeight
    },

    loadOld(callback) {
      if (this.isNoMore || this.loading) {
        return
      }
      let filter = this.getOldFilter()
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
            this.list = Object.freeze(uniqueArr([...items, ...this.list]))
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
          page: this.newFilter.page
        })
      }
      if (!filter.start || !filter.end) {
        return
      }
      monitoringLogsApi.query(filter).then((data = {}) => {
        const items = this.getFormatRow(data.items)
        this.newPageObj.total = data.total || 0
        const arr = uniqueArr([...this.list, ...items])
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
      let result = deepCopy(rowData)
      result.forEach(row => {
        let obj = {}
        row.timestamp = new Date(row.date).getTime()
        obj.level = row.level
        obj.timestamp = this.formatTime(row.timestamp)
        obj.nodeName = this.getHighlightSpan(row.nodeName)
        obj.logTags = row.logTags?.map(t => `[${this.getHighlightSpan(t)}]`) || []
        obj.data = row.data.length ? JSON.stringify(row.data?.slice(0, 10)) : ''
        obj.message = row.message?.slice(0, 10000)
        obj.errorStack = row.errorStack?.slice(0, 20000)

        const { level, timestamp, nodeName, logTags, data, message, errorStack } = obj
        const jsonStr = JSON.stringify(Object.assign({ message, errorStack }, obj), null, '\t')?.slice(0, 200)
        row.titleDomStr = this.getTitleStringDom({ timestamp, nodeName }, jsonStr)
        row.jsonDomStr = this.getJsonString([
          { level },
          { timestamp },
          { nodeName },
          { logTags },
          { data },
          { message },
          { errorStack }
        ])
      })
      return result
    },
    getTitleStringDom(row = {}, extra = '') {
      let result = ''
      result += `<span class="ml-1">${row.timestamp}</span>`
      if (row.nodeName) {
        result += `<span class="ml-1">[${this.getHighlightSpan(row.nodeName)}]</span>`
      }
      if (extra) {
        result += `<span class="ml-1">${extra}</span>`
      }
      return result
    },

    getJsonString(data = []) {
      let result = `<div class="bg-color-normal">{`
      data.forEach((obj, i) => {
        for (let key in obj) {
          const val = obj[key]
          if (val) {
            result += `<div class="flex pl-4">`
            result += `<span class="log__label warn-level">"${key}"</span>: <span class="debug-level">"${val}"</span>`
            result += `,</div>`
          }
        }
      })
      return (result += `}</div>`)
    },

    getHighlightSpan(str = '') {
      const { keyword } = this
      if (!keyword) {
        return str
      }
      const reg = new RegExp(keyword.toLowerCase(), 'ig')
      return str.replace(reg, `<span class="highlight-bg-color">$&</span>`)
    },

    getOldFilter() {
      const [start, end] = this.quotaTime.length ? this.quotaTime : this.getTimeRange(this.quotaTimeType)
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      let params = {
        start,
        end,
        page: this.oldPageObj.page,
        pageSize: this.oldPageObj.pageSize,
        order: 'desc',
        taskId,
        taskRecordId,
        nodeId: this.activeNodeId === 'all' ? null : this.activeNodeId,
        search: this.keyword,
        levels: this.checkList
      }
      return params
    },

    getNewFilter() {
      const [start, end] = [this.list.at(-1)?.timestamp || this.resetDataTime, Time.now()]
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      let params = {
        start,
        end,
        page: this.newPageObj.page,
        pageSize: this.newPageObj.pageSize,
        order: 'asc',
        taskId,
        taskRecordId,
        nodeId: this.activeNodeId === 'all' ? null : this.activeNodeId,
        search: this.keyword,
        levels: this.checkList
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
      const [start, end] = this.quotaTime.length ? this.quotaTime : this.getTimeRange(this.quotaTimeType)
      let { id: taskId, taskRecordId } = this.dataflow || {}
      const { query } = this.$route
      if (query?.taskRecordId) {
        taskRecordId = query?.taskRecordId
        taskId = this.$route.params?.id
      }
      let filter = {
        start,
        end,
        taskId,
        taskRecordId
      }
      this.downloadLoading = true
      monitoringLogsApi
        .export(filter)
        .then(data => {
          downloadBlob(data)
        })
        .catch(() => {
          this.$message.error(i18n.t('packages_dag_components_log_xiazaishibai'))
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },

    handleSetting() {
      const { level, intervalCeiling, recordCeiling } = this.logSetting
      if (level) {
        this.form = {
          level,
          intervalCeiling,
          recordCeiling
        }
      }
      this.dialog = true
    },

    handleClose() {
      this.dialog = false
    },

    handleSave() {
      const { form } = this
      let params = {
        level: form.level
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
    }
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  height: inherit;
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

.log-list {
  background-color: rgba(229, 236, 255, 0.22);
  ::v-deep {
    .log-line {
      width: 100%;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
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
    .highlight-bg-color {
      background-color: #ff0;
    }
    .empty-wrap {
      margin: 24px 0;
    }
    .vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
      overflow: visible;
    }
    .log__label {
      white-space: nowrap;
    }
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  z-index: 2;
  ::v-deep {
    .el-alert__closebtn {
      top: 7px;
    }
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
</style>
