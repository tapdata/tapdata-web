<template>
  <ElDialog
    :title="$t('components_ErrorLogDialog_cuoWuRiZhiCha')"
    :visible.sync="dialogVisible"
    :width="width"
    custom-class="connection-type-dialog"
    @close="$emit('input', false)"
  >
    <div v-loading="loading" class="error-log-dialog__content">
      <div v-if="!list.length">{{ $t('components_ErrorLogDialog_qingQianWangAG') }}</div>
      <ul v-else class="error-log__list">
        <li v-for="(item, index) in list" :key="index">
          [<span class="fw-bold" :class="item.color" v-html="item.level"></span>]&nbsp;
          <span class="log-message" v-html="item.message"></span>
        </li>
      </ul>
    </div>
    <div class="pt-6 text-center">
      <ElButton type="primary" @click="toDetail">{{ $t('components_ErrorLogDialog_zhaKanGengDuoRi') }}</ElButton>
      <ElButton type="primary" class="close-btn" @click="dialogVisible = false">{{ $t('gl_button_close') }}</ElButton>
    </div>
  </ElDialog>
</template>

<script>
export default {
  name: 'ErrorLogDialog',
  props: {
    value: {
      type: Boolean
    },
    width: {
      type: String,
      default: '768px'
    },
    id: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      list: []
    }
  },
  watch: {
    value(v) {
      this.dialogVisible = !!v
      this.list = []
      if (v) {
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getLogs()
    },
    getLogs() {
      this.loading = true
      let filter = {
        where: {
          'contextMap.dataFlowId': {
            $eq: this.id
          },
          level: {
            $in: ['ERROR']
          }
        },
        order: `id DESC`,
        limit: 10
      }
      this.$axios
        .get(`tm/api/Logs?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .then(data => {
          this.list = data.items.reverse().map(this.formatLog)
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
    toDetail() {
      this.$router.push({
        name: 'Monitor',
        params: {
          id: this.id
        },
        query: {
          tab: 'log'
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.error-log-dialog__content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
  border: 1px solid #ccc;
}
.error-log__list {
  padding: 8px 24px;
  height: 100%;
  overflow-y: auto;
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
.close-btn {
  padding: 9px 40px;
}
</style>
