<template>
  <div class="monitor-log-wrap h-100 flex flex-column">
    <div class="filter-row">
      <ElInput
        class="search-input mt-2"
        v-model="keyword"
        clearable
        prefix-icon="el-icon-search"
        placeholder="请输入日志内容"
        @input="search"
      ></ElInput>
      <ElCheckboxGroup v-model="checkList" :min="1" class="inline-block ml-4" @change="changeType">
        <ElCheckbox label="INFO">INFO</ElCheckbox>
        <ElCheckbox label="WARN">WARN</ElCheckbox>
        <ElCheckbox label="ERROR">ERROR</ElCheckbox>
      </ElCheckboxGroup>
    </div>
    <div ref="logs" class="log-container flex-fit mt-6 py-6 overflow-auto" @scroll="loadOld">
      <div v-show="!noMore && loading" class="pb-4 text-center fs-5">
        <i class="el-icon-loading"></i>
      </div>
      <div v-show="logs && logs.length && noMore" class="font-color-sub text-center pb-4">没有更多了</div>
      <ul v-if="logs">
        <li class="log-item px-6" v-for="log in logs" :key="log.id">
          [<span class="fw-bold" :class="log.color" v-html="log.level"></span>]&nbsp; <span>{{ log.time }}</span
          >&nbsp; [<span v-html="log.threadName"></span>]&nbsp; <span v-html="log.loggerName"></span>&nbsp;
          <div class="log-message pl-10" v-html="log.message"></div>
        </li>
      </ul>
      <div v-if="logs && !logs.length" class="monitor-log__empty text-center">
        <VIcon size="120">no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
          <span>暂无日志</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.monitor-log-wrap {
  .search-input {
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
  }
  .monitor-log-wrap {
    color: map-get($fontColor, light);
  }
}
</style>
<script>
import VIcon from '@/components/VIcon'

export default {
  components: { VIcon },
  props: {
    id: String
  },
  data() {
    return {
      loading: true,
      noMore: false,
      keyword: '',
      logs: null,
      isScrollBottom: true,
      checkList: ['INFO', 'WARN', 'ERROR']
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
  beforeDestroy() {
    this.$ws.off('logs', this.updateLogs)
  },
  methods: {
    search() {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.getLogs(true)
      }, 1000)
    },
    updateLogs(data) {
      const { keyword, checkList } = this
      let logs = data?.data || []
      this.loadNew(
        logs.filter(item => {
          return (
            checkList.includes(item.level) &&
            (item.threadName.includes(keyword) ||
              item.loggerName.includes(keyword) ||
              item.message.includes(keyword) ||
              item.level.includes(keyword))
          )
        })
      )
    },
    loadOld(event) {
      if (this.loading) {
        return
      }
      let el = event.target
      this.isScrollBottom = el.scrollTop + el.clientHeight >= el.scrollHeight
      if (el.scrollTop <= 0 && !this.noMore && !this.loading) {
        this.getLogs()
      }
    },
    loadNew(data) {
      let list = data || []
      list = list.reverse().map(this.formatLog)
      let logs = this.logs || []
      logs.push(...list)
      this.logs = logs
      this.loading = false
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let el = this.$refs.logs
        if (el && this.isScrollBottom) {
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
            $eq: this.id
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
        const { toRegExp } = this.$util
        let query = { $regex: toRegExp(keyword), $options: 'i' }
        filter.where.$or = [{ threadName: query }, { loggerName: query }, { message: query }, { level: query }]
      }
      if (!isSearch && this.logs.length) {
        filter.where.id = {
          lt: this.logs[0].id
        }
      }
      this.$axios
        .get(`tm/api/Logs?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(data => {
          let list = data?.items || data || []
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
        INFO: 'font-color-main'
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
        time: log.date ? this.$moment(log.date).format('YYYY-MM-DD HH:mm:ss') : '',
        level: markKeyword(log.level),
        threadName: markKeyword(log.threadName),
        loggerName: markKeyword(log.loggerName),
        message: markKeyword(log.message),
        id: log.id
      }
    },
    changeType() {
      this.getLogs(true)
    }
  }
}
</script>
