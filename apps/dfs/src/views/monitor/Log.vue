<template>
  <div class="monitor-log-wrap h-100 flex flex-column">
    <div class="filter-row flex justify-content-between align-items-center">
      <div>
        <ElInput
          class="search-input mt-2"
          v-model:value="keyword"
          clearable
          prefix-icon="el-icon-search"
          :placeholder="$t('monitor_Log_qingShuRuRiZhi')"
          @input="search"
        ></ElInput>
        <ElCheckboxGroup v-model:value="checkList" :min="1" class="inline-block ml-4" @change="changeType">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <ElTooltip effect="dark" :content="$t('monitor_Log_xiaZaiRenWuRi')" placement="bottom">
        <VIcon class="color-primary mr-6" @click="openDownload">download</VIcon>
      </ElTooltip>
    </div>
    <div ref="logs" class="log-container flex-fit mt-6 py-6 overflow-auto" @scroll="loadOld">
      <div v-show="!noMore && loading" class="pb-4 text-center fs-5">
        <el-icon><el-icon-loading /></el-icon>
      </div>
      <div v-show="logs && logs.length && noMore" class="font-color-sub text-center pb-4">
        {{ $t('monitor_Log_meiYouGengDuoLe') }}
      </div>
      <ul v-if="logs" class="position-relative">
        <li class="log-item px-6" v-for="log in logs" :key="log.id">
          [<span class="fw-bold" :class="log.color" v-html="log.level"></span>]&nbsp; <span>{{ log.time }}</span
          >&nbsp; [<span v-html="log.threadName"></span>]&nbsp; <span v-html="log.loggerName"></span>&nbsp;
          <div class="log-message pl-10" v-html="log.message"></div>
        </li>
      </ul>
      <div v-if="logs && !logs.length" class="monitor-log__empty text-center">
        <VIcon size="120">no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
          <span>{{ $t('monitor_Log_zanWuRiZhi') }}</span>
        </div>
      </div>
    </div>
    <ElDialog
      :title="$t('monitor_Log_xiaZaiRenWuRi')"
      v-model:visible="downloadForm.visible"
      width="500px"
      top="30vh"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="flex align-items-center pl-6">
        <div class="mr-4">{{ $t('monitor_Log_xuanZeRiZhiFan') }}</div>
        <ElSelect v-model:value="downloadForm.select" size="mini">
          <ElOption
            v-for="(item, index) in downloadForm.items"
            :label="item.label"
            :value="item.value"
            :key="index"
          ></ElOption>
        </ElSelect>
      </div>
      <div class="text-center mt-10">
        <VButton type="primary" auto-loading @click="downloadNow(arguments[0])">{{
          $t('monitor_Log_liJiXiaZai')
        }}</VButton>
      </div>
    </ElDialog>
  </div>
</template>

<script>
import { Loading as ElIconLoading } from '@element-plus/icons'
import i18n from '@/i18n'
import Time from '@tap/shared/src/time'
import { VIcon } from '@tap/component'
import { downloadBlob } from '@/util'
import timeFunction from '@/mixins/timeFunction'
import { delayTrigger, toRegExp } from '@tap/shared'

export default {
  components: {
    VIcon,
    ElIconLoading
  },
  mixins: [timeFunction],
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
      checkList: ['INFO', 'WARN', 'ERROR'],
      downloadForm: {
        visible: false,
        select: 6,
        items: [
          {
            label: i18n.global.t('monitor_Log_zuiJinGeXiaoShi'),
            value: 6
          },
          {
            label: i18n.global.t('monitor_Log_zuiJinTian3'),
            value: 24
          },
          {
            label: i18n.global.t('monitor_Log_zuiJinTian2'),
            value: 3 * 24
          },
          {
            label: i18n.global.t('monitor_Log_zuiJinTian'),
            value: 5 * 24
          }
        ]
      },
      page: {
        total: 0,
        limit: 20,
        skip: 0
      }
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
    this.getLogsTotal()
  },
  beforeUnmount() {
    this.$ws.off('logs', this.updateLogs)
  },
  methods: {
    search() {
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
        if (this.page.skip <= 0) {
          return
        } else if (this.page.skip < this.page.limit) {
          this.page.limit = this.page.skip
          this.page.skip = 0
        } else {
          this.page.skip -= this.page.limit
        }
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
        order: `id ASC`,
        limit: this.page.limit
      }
      const { keyword, checkList } = this
      const len = checkList.length
      if (len > 0) {
        filter.where.level = {
          $in: checkList
        }
      }
      if (keyword) {
        let query = { $regex: toRegExp(keyword), $options: 'i' }
        filter.where.$or = [{ threadName: query }, { loggerName: query }, { message: query }, { level: query }]
      }
      if (!isSearch && this.logs.length) {
        filter.skip = this.page.skip
      }
      this.$axios
        .get(`tm/api/Logs?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(data => {
          let list = data?.items || data || []
          if (isSearch) {
            this.noMore = false
            this.isScrollBottom = true
            this.logs = list.map(this.formatLog)
            this.scrollToBottom()
            this.resetPageSkip(data.total)
            return
          }
          if (!list.length) {
            this.noMore = true
            return
          }
          let el = this.$refs.logs
          list = list.map(this.formatLog)
          this.logs.unshift(...list)
          this.$nextTick(() => {
            let itemEl = this.$refs.logs.querySelector(`li:nth-child(${list.length + 1})`)
            itemEl && el.scrollTo(0, itemEl.offsetTop)
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
        time: this.formatTime(log.date),
        level: markKeyword(log.level),
        threadName: markKeyword(log.threadName),
        loggerName: markKeyword(log.loggerName),
        message: markKeyword(log.message),
        id: log.id
      }
    },
    changeType() {
      this.getLogs(true)
    },
    openDownload() {
      this.downloadForm.visible = true
      this.downloadForm.select = 6
    },
    downloadNow(resetLoading) {
      let start = Time.now() - this.downloadForm.select * 60 * 60 * 1000
      let params = {
        dataFlowId: this.id,
        start
      }
      this.$axios
        .get('tm/api/Logs/export?where=' + encodeURIComponent(JSON.stringify(params)), {
          responseType: 'blob'
        })
        .then(res => {
          downloadBlob(res)
          this.downloadForm.visible = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    getLogsTotal() {
      let filter = {
        where: {
          'contextMap.dataFlowId': {
            $eq: this.id
          }
        },
        limit: 0
      }
      this.$axios.get(`tm/api/Logs?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        this.resetPageSkip(data.total)
      })
    },
    resetPageSkip(total) {
      this.page.total = total
      this.page.skip = this.page.total - this.page.limit
      if (this.page.skip < 0) {
        this.page.skip = 0
      }
    }
  }
}
</script>

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
