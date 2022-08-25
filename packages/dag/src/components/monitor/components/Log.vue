<template>
  <div class="log-container flex justify-content-between">
    <div class="filter-items border-end">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[{ active: activeNodeId === item.value }]"
        class="filter-items__item flex justify-content-between align-items-center"
        @click="changeItem(item)"
      >
        <span>{{ item.label }}</span>
        <VIcon>arrow-right</VIcon>
      </div>
    </div>
    <div class="main flex-fill flex flex-column pt-5">
      <div class="flex ml-4 mb-4 align-items-center">
        <TimeSelect
          :options="timeOptions"
          :range="[firstStartTime, lastStopTime || Date.now()]"
          @change="changeTime"
        ></TimeSelect>
        <ElInput
          class="search-input ml-4"
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="请输入日志内容…"
          size="mini"
          clearable
          style="width: 240px"
          @input="searchFnc(800)"
        ></ElInput>
        <!--        <ElButton type="text" size="mini" class="ml-4" @click="handleSetting">设置</ElButton>-->
        <ElButton :loading="downloadLoading" type="text" size="mini" class="ml-4" @click="handleDownload"
          >下载</ElButton
        >
      </div>
      <div class="level-line ml-4">
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
      </div>
      <div v-loading="loading" class="log-list my-4 ml-4 pl-4 flex-1" style="height: 0">
        <DynamicScroller
          ref="virtualScroller"
          :items="list"
          key-field="id"
          :min-item-size="30"
          class="scroller py-4 h-100"
          @scroll.native="scrollFnc"
        >
          <template #before>
            <div class="before-scroll-content text-center font-color-light pb-2">
              <div v-show="preLoading">
                <i class="el-icon-loading"></i>
              </div>
              <ElAlert
                v-show="showNoMore"
                :title="$t('customer_logs_no_more_data')"
                type="info"
                class="no-more__alert position-absolute py-1 px-2"
              ></ElAlert>
              <VEmpty
                v-if="!list.length"
                :description="keyword ? $t('customer_logs_no_search_data') : $t('dag_dialog_field_mapping_no_data')"
              />
            </div>
          </template>
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :data-index="index"
              :size-dependencies="[item.id, item.message]"
            >
              <div class="log-line py-1 font-color-light">
                <span :class="['level-item', 'inline-block', colorMap[item.level]]">{{ item.levelText }}</span>
                <span class="white-space-nowrap ml-1">{{ formatTime(item.timestamp) }}</span>
                <span v-if="item.taskName" v-html="item.taskNameText" class="ml-1"></span>
                <span v-if="item.nodeName" v-html="item.nodeNameText" class="ml-1"></span>
                <span v-for="(temp, tIndex) in item.logTagsText" :key="tIndex" v-html="temp" class="ml-1"></span>
                <span v-html="item.message" class="ml-1"></span>
                <span v-html="item.errorStack" class="ml-1"></span>
                <span v-if="item.dataText" v-html="item.dataText"></span>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>

    <ElDialog
      title="日志等级设置"
      width="437px"
      :visible.sync="dialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ElForm label-width="120px">
        <ElFormItem label="日志级别：" prop="level">
          <ElSelect v-model="form.level" style="width: 275px">
            <ElOption v-for="item in checkList" :label="item" :value="item" :key="item"></ElOption>
          </ElSelect>
        </ElFormItem>
        <template v-if="form.level === 'DEBUG'">
          <ElFormItem label="DEBUG日志参数" prop="param"> </ElFormItem>
          <ElFormItem label="开启时长（秒）" prop="start">
            <ElInput v-model="form.start" type="number" style="width: 275px"></ElInput>
          </ElFormItem>
          <ElFormItem label="开启时长（秒）" prop="max">
            <ElInput v-model="form.max" type="number" style="width: 275px"></ElInput>
          </ElFormItem>
        </template>
      </ElForm>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleClose">{{ $t('button_cancel') }}</ElButton>
        <ElButton size="mini" type="primary" @click="handleSave">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapGetters } from 'vuex'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

import VIcon from 'web-core/components/VIcon'
import { delayTrigger, uniqueArr, downloadBlob, deepCopy } from '@tap/shared'
import { VEmpty } from '@tap/component'
import { monitoringLogsApi } from '@tap/api'

import TimeSelect from './TimeSelect'

export default {
  name: 'Log',

  components: { VIcon, TimeSelect, DynamicScroller, DynamicScrollerItem, VEmpty },

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
    }
  },

  data() {
    return {
      activeNodeId: 'all',
      keyword: '',
      checkList: ['info', 'warn', 'error'],
      checkItems: [
        {
          label: 'debug',
          text: 'DEBUG'
        },
        {
          label: 'info',
          text: 'INFO'
        },
        {
          label: 'warn',
          text: 'WARN'
        },
        {
          label: 'error',
          text: 'ERROR'
        }
      ],
      timer: null,
      downloadLoading: false,
      loading: false,
      preLoading: false,
      resetDataTime: null,
      list: [],
      colorMap: {
        FATAL: 'color-danger',
        ERROR: 'color-danger',
        WARN: 'color-warning'
      },
      newPageObj: {
        page: 0,
        pageSize: 20,
        total: 0
      },
      oldPageObj: {
        page: 0,
        pageSize: 20,
        total: 0
      },
      isScrollBottom: false,
      form: {
        level: '',
        start: 500,
        max: 500
      },
      dialog: false,
      timeOptions: [
        {
          label: '全部',
          value: 'full'
        },
        {
          label: '最近6个小时',
          value: '6h'
        },
        {
          label: '最新1天',
          value: '1d'
        },
        {
          label: '最近3天',
          value: '3d'
        },
        {
          label: '自定义时间',
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

    items() {
      return [
        {
          label: '全部日志',
          value: 'all'
        },
        ...this.allNodes.map(t => {
          return {
            label: t.name,
            value: t.id,
            source: t.$outputs.length > 0,
            target: t.$inputs.length > 0
          }
        })
      ]
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
    }
  },

  watch: {
    'dataflow.status'(v) {
      if (v === 'edit') return
      this.init()
    },
    'dataflow.taskRecordId'() {
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
    init() {
      if (this.$route.name === 'MigrationMonitorViewer') {
        this.timeOptions = [
          {
            label: '全部',
            value: 'full'
          },
          {
            label: '自定义时间',
            type: 'custom',
            value: 'custom'
          }
        ]
      }
      this.extraEnterCount = 0
      this.clearTimer()
      this.resetData()
    },

    resetData() {
      this.preLoading = false
      this.resList()
      this.resetOldPage()
      this.resetDataTime = Date.now()
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

    changeItem(item) {
      if (this.activeNodeId === item.value) {
        return
      }
      this.activeNodeId = item.value
      this.init()
    },

    changeTime(val, isTime, source) {
      this.quotaTimeType = source?.type ?? val
      this.quotaTime = isTime ? val?.split(',')?.map(t => Number(t)) : this.getTimeRange(val)
      this.init()
    },

    searchFnc(debounce) {
      delayTrigger(() => {
        this.init()
      }, debounce)
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
        .then(data => {
          const items = this.getFormatRow(data.items.reverse())
          this.oldPageObj.total = data.total || 0
          this.oldPageObj.page = filter.page
          if (this.list.length) {
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
      monitoringLogsApi.query(filter).then(data => {
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

    getFormatRow(data) {
      let result = deepCopy(data)
      const arr = ['taskName', 'nodeName']
      result.forEach(row => {
        row.levelText = `[${row.level}]`
        row.logTagsText = row.logTags?.map(t => `[${this.getHighlightSpan(t)}]`) || []
        row.dataText = row.data?.length ? JSON.stringify(row.data) : ''
        arr.forEach(el => {
          row[el + 'Text'] = `[${this.getHighlightSpan(row[el])}]`
        })
      })
      return result
    },

    getHighlightSpan(str) {
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
      const [start, end] = [this.list.at(-1)?.timestamp || this.resetDataTime, Date.now()]
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
          this.$message.error('下载失败')
        })
        .finally(() => {
          this.downloadLoading = false
        })
    },

    handleSetting() {
      this.dialog = true
    },

    handleClose() {},

    handleSave() {},

    getTimeRange(type) {
      let result
      const { status } = this.dataflow || {}
      let endTimestamp = this.lastStopTime || Date.now()
      if (status === 'running') {
        endTimestamp = Date.now()
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
        case 'full':
          result = [this.firstStartTime, endTimestamp]
          break
        default:
          result = [endTimestamp - 5 * 60 * 1000, endTimestamp]
          break
      }
      return result
    },

    resList() {
      this.list = []
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
}
.filter-items__item {
  padding: 0 16px;
  height: 40px;
  cursor: pointer;
  &.active {
    background: rgba(44, 101, 255, 0.05);
  }
}
.white-space-nowrap {
  white-space: nowrap;
}

.log-list {
  border-radius: 1px;
  background-color: rgba(229, 236, 255, 0.22);
  ::v-deep {
    .log-line {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .highlight-bg-color {
      background-color: #ff0;
    }
    .empty-wrap {
      margin: 24px 0;
    }
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  ::v-deep {
    .el-alert__closebtn {
      top: 7px;
    }
  }
}
</style>
