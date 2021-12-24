<template>
  <div class="e-debug-log customer-logs">
    <div class="filter-row flex justify-content-between align-items-center mb-4">
      <div class="flex align-items-center">
        <ElInput
          class="search-input mt-2"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('task_info_log_placeholder')"
          size="mini"
          @input="searchFnc(800)"
        ></ElInput>
        <ElCheckboxGroup v-model="checkList" :min="1" size="mini" class="inline-flex ml-4" @change="searchFnc">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
          <ElCheckbox label="FATAL">FATAL</ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <slot></slot>
    </div>
    <div v-if="list.length" class="logs-list" ref="logsList" v-loading="loading">
      <DynamicScroller
        ref="virtualScroller"
        :items="list"
        key-field="id"
        :min-item-size="30"
        class="scroller"
        @scroll.native="scrollFnc"
      >
        <template #before>
          <div class="before-scroll-content text-center font-color-disable pb-2">
            <div v-if="isNoMore">没有更多数据</div>
            <!--            <div v-if="preLoading">正在加载...</div>-->
            <div v-show="preLoading">
              <i class="el-icon-loading"></i>
            </div>
          </div>
        </template>
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
            :size-dependencies="[item.id, item.content]"
          >
            [<span :class="['level', colorMap[item.level]]">{{ item.level }}</span
            >]
            <span class="mr-2">{{ formatTime(item.timestamp) }}</span>
            <span v-html="item.content"></span>
            <span v-if="item.link" class="color-primary ml-2">参考外链:{{ item.link }}</span>
            <span
              v-if="item.params.errorCode"
              class="color-primary cursor-pointer ml-2"
              @click="toSolutions(item.params.errorCode)"
              >点击，跳转至解决方案</span
            >
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
    <div class="logs-list empty flex align-items-center justify-content-center" v-else>
      <div class="p-4">{{ $t('message.noData') }}</div>
    </div>
  </div>
</template>
<script>
import ws from '@/api/ws'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { delayTrigger, formatTime } from '@/utils/util'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
export default {
  name: 'Normal',
  components: {
    DynamicScroller,
    DynamicScrollerItem
  },
  props: {
    id: String
  },
  data() {
    return {
      checkList: ['INFO', 'WARN', 'ERROR', 'FATAL'],
      keyword: '',
      lastLogsId: '',
      firstLogsId: '',
      topKey: '',
      bottomKey: '',
      timer: null,
      loading: false,
      preLoading: false,
      imageUrl: require('@/assets/images/noData.svg'),
      list: [],
      colorMap: {
        FATAL: 'color-red',
        ERROR: 'color-danger',
        WARN: 'color-warning'
      },
      itemSize: 20,
      pageObj: {
        page: 1,
        size: 20
      },
      isScrollBottom: true,
      isNoMore: false
    }
  },
  mounted() {
    this.init()
  },

  methods: {
    init() {
      // this.pollingData()
      // this.loadWs()
      this.resetData()
    },
    pollingData() {
      this.timer = setInterval(() => {
        // this.loadNew()
      }, 5000)
    },
    loadWs() {
      let msg = {
        type: 'logs',
        filter: {
          where: { dataFlowId: this.id },
          order: 'id DESC',
          limit: 20
        }
      }
      ws.on('logs', data => {
        data && this.resetData()
      })

      ws.ready(() => {
        ws.send(msg)
      }, true)
    },
    scrollFnc(ev) {
      const target = ev.target
      if (target.scrollTop <= 0) {
        this.loadOld()
      }
      // if (target.scrollHeight - target.scrollTop <= target.clientHeight) {
      // this.loadOld()
      // }
    },
    toSolutions(code) {
      let routeUrl = this.$router.resolve({
        name: 'Solutions',
        query: { code: code }
      })
      window.open(routeUrl.href)
    },
    logScroll(logContainer) {
      if (logContainer.scrollHeight - logContainer.clientHeight - logContainer.scrollTop < 100) {
        this.loadOld()
      }
    },
    addFilter(filter) {
      const { checkList, keyword } = this
      if (keyword) {
        filter.where.or = [
          { threadName: { regexp: keyword } },
          { loggerName: { regexp: keyword } },
          { message: { regexp: keyword } },
          { level: { regexp: keyword } }
        ]
      }

      if (checkList.length) {
        filter.where.level = {
          in: checkList
        }
      }
      return filter
    },
    loadOld() {
      if (this.isNoMore) {
        return
      }
      let filter = {
        where: {
          dataFlowId: this.id,
          id: {
            lt: this.firstLogsId
          }
        },
        order: 'id DESC',
        limit: 20
      }
      this.addFilter(filter)
      this.getLogsData(filter, false, true)
    },
    loadNew() {
      this.lastLogsId = ''
      let filter = {
        where: {
          dataFlowId: this.id
        },
        order: 'id DESC',
        limit: 20
      }
      this.addFilter(filter)

      this.getLogsData(filter, false, false)
    },
    resetData() {
      this.lastLogsId = ''
      this.isNoMore = false
      this.preLoading = false
      let filter = {
        where: {
          dataFlowId: this.id
        },
        order: 'id DESC',
        limit: 20
      }
      this.addFilter(filter)

      this.getLogsData(filter, true, false)
    },
    getLogsData(filter, reset = false, prepend = false) {
      // 获取日志

      if (this.loading) return

      if (prepend) {
        this.preLoading = true
      } else {
        this.loading = true
      }
      // if (reset || (!reset && !prepend)) {
      //   this.loading = true
      // }
      this.$api('CustomerJobLogs')
        .get({ filter: JSON.stringify(filter) })
        .then(res => {
          let data = res.data.items
          if (!data.length) {
            if (reset) {
              console.log('暂无结果')
            } else {
              if (prepend) {
                this.isNoMore = true
              }
            }
            return
          }
          data.forEach(el => {
            let { template, params } = el
            let content = (template || '').replace(/\r\n/g, '<br/>').replace(/\t/g, '<span class="tap-span"></span>')
            for (let key in params) {
              let re = new RegExp(`{${key}}`, 'ig')
              if (this.keyword) {
                content = content.replace(re, `<span class="keyword">${params[key]}</span>`)
              } else {
                content = content.replace(re, params[key])
              }
            }
            el.content = content
          })
          let { list } = this
          if (reset) {
            this.list = Object.freeze(data)
            this.scrollToBottom()
            // this.scrollToItem(data.length - 1)
          } else {
            if (prepend) {
              this.topKey = list[0]?.id
              this.list = Object.freeze([...data, ...list])
              this.scrollToItem(data.length - 1)
            } else {
              this.topKey = list[list.length - 1]?.id
              this.list = Object.freeze([...list, ...data])
              this.scrollToBottom()
            }
          }
          // if (res.data && res.data.length > 0) {
          //   if (reset || prepend || !this.lastLogsId) {
          //     this.lastLogsId = res.data[0].id
          //   }
          //   if (reset || !prepend || !this.firstLogsId) {
          //     this.firstLogsId = res.data[res.data.length - 1].id
          //   }
          //
          //   this.$refs.log.add({ logs: res.data, prepend, reset })
          // } else if (this.keyword && reset) {
          //   this.$message.info(this.$t('editor.noResult'))
          // }
        })
        .finally(() => {
          this.loading = false
          this.preLoading = false
        })
    },
    getRandom(min, max) {
      return min + Math.round(Math.random() * (max - min))
    },
    searchFnc(debounce) {
      delayTrigger(() => {
        this.resetData()
      }, debounce)
    },
    formatTime(date) {
      return formatTime(date)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.$refs.virtualScroller?.scrollToBottom?.()
      })
    },
    scrollToItem(index) {
      this.$nextTick(() => {
        this.$refs.virtualScroller?.scrollToItem?.(index)
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
.customer-logs {
  //display: flex;
  //flex-direction: column;
  font-size: 12px;
  ::v-deep {
    .tap-span {
      padding-left: 16px;
    }
    .color-red {
      color: red;
    }
  }
}
.e-debug-log {
  width: 100%;
  height: 100%;
  //padding: 10px 5px 5px 20px;
  box-sizing: border-box;
  overflow: hidden;

  .el-form {
    position: relative;

    .el-form-item {
      margin-bottom: 0;
    }
  }
}
.logs-list {
  //height: calc(100% - 44px);
  //overflow-y: auto;
  //height: 0;
  //flex: 1;
  //min-height: 150px;
  background: rgba(229, 236, 255, 0.22);
  //&.empty {
  //  min-height: 150px;
  //}
  .el-loading-spinner .el-loading-text {
    font-size: 12px;
    color: #333;
  }
  ::v-deep {
    .keyword {
      color: #d54e21;
    }
  }
}
.inputStyle {
  width: 300px;
}
.el-checkbox {
  margin-left: 4px;
  margin-right: 8px;
  ::v-deep {
    .el-checkbox__label {
      font-size: 12px;
    }
  }
}
</style>
