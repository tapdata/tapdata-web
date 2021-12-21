<template>
  <div class="e-debug-log">
    <el-form inline action="javascript: void(0);">
      <el-form-item>
        <el-input class="inputStyle" v-model="search" size="mini" :placeholder="$t('message.search')"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" size="mini" :disabled="loading" @click="loadNew"></el-button>
      </el-form-item>

      <i class="el-icon-loading" v-if="loading"></i>
    </el-form>
    <!-- v-loading="loading" :element-loading-text="$t('dataFlow.loadLogTip')" -->
    <div class="logBox">
      <LogBox ref="log" :keyword="search" :load="loadNew" @scroll="logScroll"></LogBox>
    </div>
  </div>
</template>
<script>
// import $ from 'jquery';
import factory from '@/api/factory'
import ws from '@/api/ws'
import LogBox from '@/components/LogBox'
import { mapGetters } from 'vuex'

const logsModel = factory('logs')
export default {
  name: 'DebugLogs',

  components: {
    LogBox
  },

  props: {
    dataflowId: String
  },

  data() {
    return {
      search: '',
      lastLogsId: '',
      firstLogsId: '',
      timer: null,
      loading: false,
      imageUrl: require('@/assets/images/noData.svg')
    }
  },

  watch: {
    dataflowId: 'init'
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      let msg = {
        type: 'logs',
        filter: {
          where: { 'contextMap.dataFlowId': { eq: this.dataflowId } },
          order: 'id DESC',
          limit: 20
        }
      }

      ws.on('logs', ({ data }) => {
        if (data && data.length > 0) {
          this.$refs.log.add({ logs: data, prepend: true })
          if (!this.firstLogsId || this.firstLogsId.length == 0) this.firstLogsId = data[data.length - 1].id
        }
      })

      ws.ready(() => {
        ws.send(msg)
      }, true)
      this.loadNew()
    },

    logScroll(logContainer) {
      if (logContainer.scrollHeight - logContainer.clientHeight - logContainer.scrollTop < 100) {
        this.loadOld()
      }
    },
    addFilter(filter) {
      if (this.search) {
        filter.where.or = [
          { threadName: { regexp: this.search } },
          { loggerName: { regexp: this.search } },
          { message: { regexp: this.search } },
          { level: { regexp: this.search } }
        ]
      }
      return filter
    },

    loadOld() {
      let filter = {
        where: {
          'contextMap.dataFlowId': {
            eq: this.dataflowId
          },
          id: {
            lt: this.firstLogsId
          }
        },
        order: 'id DESC',
        limit: 20
      }
      this.addFilter(filter)
      this.getLogsData(filter, false, false)
    },
    loadNew() {
      this.lastLogsId = ''
      let filter = {
        where: {
          'contextMap.dataFlowId': {
            eq: this.dataflowId
          }
        },
        order: 'id DESC',
        limit: 20
      }
      this.addFilter(filter)

      this.getLogsData(filter, true, true)
    },

    getLogsData(filter, reset = false, prepend = false) {
      if (this.loading) return

      this.loading = true
      logsModel
        .get({ filter: JSON.stringify(filter) })
        .then(res => {
          if (res.data && res.data.length > 0) {
            if (reset || prepend || !this.lastLogsId) {
              this.lastLogsId = res.data[0].id
            }
            if (reset || !prepend || !this.firstLogsId) {
              this.firstLogsId = res.data[res.data.length - 1].id
            }

            this.$refs.log.add({ logs: res.data, prepend, reset })
          } else if (this.search && reset) {
            this.$message.info(this.$t('editor.noResult'))
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  },

  destroyed() {
    clearInterval(this.timer)
    this.timer = null
  }
}
</script>
<style lang="scss" scoped>
.e-debug-log {
  width: 100%;
  height: 100%;
  padding: 10px 5px 5px 20px;
  box-sizing: border-box;
  overflow: hidden;

  .el-form {
    position: relative;

    .el-form-item {
      margin-bottom: 0;
    }

    .el-icon-loading {
      right: 10px;
      top: 10px;
      position: absolute;
    }
  }
}
.logBox {
  height: calc(100% - 44px);
  .el-loading-spinner .el-loading-text {
    font-size: 12px;
    color: #333;
  }
}
.inputStyle {
  width: 300px;
}
</style>
