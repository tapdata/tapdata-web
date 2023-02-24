<template>
  <div class="monitor-log-wrap flex-column">
    <div class="filter-row flex justify-content-between align-items-center mb-4">
      <div class="flex align-items-center">
        <ElInput
          class="search-input mt-2"
          v-model:value="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('packages_business_task_info_log_placeholder')"
          size="mini"
          @input="searchFnc(800)"
        ></ElInput>
        <ElCheckboxGroup v-model:value="checkList" :min="1" size="mini" class="inline-flex ml-4" @change="searchFnc">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
          <ElCheckbox label="FATAL">FATAL</ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <slot></slot>
    </div>
    <div ref="logs" class="log-container flex-fit py-6 overflow-auto" @scroll="loadOld">
      <div v-show="!noMore && loading" class="pb-4 text-center fs-5">
        <el-icon><el-icon-loading /></el-icon>
      </div>
      <div v-show="noMore" class="font-color-light text-center pb-4">
        {{ $t('packages_business_task_info_no_more') }}
      </div>
      <ul v-if="logs.length">
        <li class="log-item px-6 font-color-light" v-for="log in logs" :key="log.id">
          [<span class="fw-bold" :class="log.color" v-html="log.level"></span>]&nbsp; <span>{{ log.time }}</span
          >&nbsp; [<span v-html="log.threadName"></span>]&nbsp; <span v-html="log.loggerName"></span>&nbsp;
          <div class="log-message pl-10" v-html="log.message"></div>
        </li>
      </ul>
      <div v-else-if="keyword" class="text-center">
        {{ $t('packages_business_logs_detailed_sousuowushuju') }}
      </div>
      <div v-else class="text-center">
        {{ $t('packages_business_dag_dialog_field_mapping_no_data') }}
      </div>
    </div>
  </div>
</template>

<script>
import { Loading as ElIconLoading } from '@element-plus/icons'
import dayjs from 'dayjs'
import { logsApi } from '@tap/api'
import { delayTrigger, toRegExp } from '@tap/shared'

export default {
  components: {
    ElIconLoading
  },
  props: {
    id: String
  },
  data() {
    return {
      loading: false,
      noMore: false,
      keyword: '',
      logs: [],
      isScrollBottom: true,
      checkList: ['INFO', 'WARN', 'ERROR', 'FATAL']
    }
  },
  created() {
    let msg = {
      type: 'logs',
      filter: {
        where: { 'contextMap.dataFlowId': { eq: this.id } },
        order: 'id DESC',
        limit: 20
      }
    }
    this.$ws.on('logs', this.updateLogs)
    this.$ws.send(msg)
  },
  beforeUnmount() {
    this.$ws.off('logs', this.updateLogs)
  },
  methods: {
    updateLogs(data) {
      this.loadNew(data.data)
    },
    loadOld(event) {
      let el = event.target
      this.isScrollBottom = el.scrollTop + el.clientHeight >= el.scrollHeight
      if (el.scrollTop <= 0 && !this.noMore && !this.loading) {
        this.getLogs()
      }
    },
    loadNew(data) {
      let list = data || []
      list = data
        .reverse()
        .filter(it => this.checkList.includes(it.level))
        .map(this.formatLog)
      this.logs.push(...list)
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let el = this.$refs.logs
        if (this.isScrollBottom) {
          let lastItemEl = el.querySelector('li:last-child')
          if (lastItemEl) {
            el.scrollTo(0, lastItemEl.offsetTop + lastItemEl.clientHeight)
          }
        }
      })
    },
    getLogs(isSearch) {
      this.loading = true
      let filter = {
        where: {
          'contextMap.dataFlowId': {
            eq: this.id
          }
        },
        order: `id DESC`,
        limit: 35
      }
      const { keyword, checkList } = this
      const len = checkList.length
      if (len > 0) {
        filter.where.level = {
          $in: checkList
        }
      }
      if (keyword) {
        let query = { like: toRegExp(keyword), options: 'i' }
        filter.where.or = [{ threadName: query }, { loggerName: query }, { message: query }, { level: query }]
      }
      if (!isSearch && this.logs.length) {
        filter.where.id = {
          lt: this.logs[0].id
        }
      }
      logsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          if (isSearch) {
            this.noMore = false
            this.isScrollBottom = true
            this.logs = list.reverse().map(this.formatLog)
            this.scrollToBottom()
            return
          }
          if (!list.length) {
            this.noMore = true
            return
          }
          let el = this.$refs.logs
          let itemEl = el.querySelector('li:nth-child(2)')
          list = list.reverse().map(this.formatLog)
          this.logs.unshift(...list)
          this.$nextTick(() => {
            if (itemEl) {
              el.scrollTo(0, itemEl.offsetTop - itemEl.clientHeight - 90)
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatLog(log) {
      let colorMap = {
        ERROR: 'color-danger',
        WARN: 'color-warning',
        INFO: 'font-color-dark'
      }
      let markKeyword = text => {
        let keyword = this.keyword
        if (keyword) {
          let re = new RegExp(keyword, 'ig')
          text = text.replace(re, `<span class="px-1 color-danger log-keyword-block">$&</span>`)
        }
        return text
      }
      return {
        color: colorMap[log.level],
        time: log.date ? dayjs(log.date).format('YYYY-MM-DD HH:mm:ss') : '',
        level: markKeyword(log.level),
        threadName: markKeyword(log.threadName),
        loggerName: markKeyword(log.loggerName),
        message: markKeyword(log.message),
        id: log.id
      }
    },
    searchFnc(debounce) {
      delayTrigger(() => {
        this.getLogs(true)
      }, debounce)
    }
  }
}
</script>

<style lang="scss" scoped>
.monitor-log-wrap{display:flex;//max-height:450px;font-size:14px;.search-input {
    width: 343px;
  }
  .log-container {
    background: rgba(229, 236, 255, 0.22);
    box-sizing: border-box;
  }
  .log-item {
    word-break: break-word;
  }
  .log-message {
    box-sizing: border-box;
  }
  .log-keyword-block {
    background: map-get($color, warning);
  }}.filter-row{.el-checkbox {
    margin-right: 16px;
  }}
</style>
