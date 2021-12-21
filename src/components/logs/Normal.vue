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
    <div class="LogItem" v-if="list.length">
      <DynamicScroller
        ref="virtualScroller"
        :items="list"
        :min-item-size="32"
        class="scroller"
        :style="{
          height: '100%'
        }"
        @scroll.native="scrollFnc"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="[item.id]">
            [<span :class="['level', colorMap[item.level]]">{{ item.level }}</span
            >]
            <span>{{ item.timestamp }}</span>
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
    <div class="LogItem empty flex align-items-center justify-content-center" v-else>
      <div class="p-4">{{ $t('message.noData') }}</div>
    </div>
  </div>
</template>
<script>
import ws from '@/api/ws'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { delayTrigger } from '@/utils/util'

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
      timer: null,
      loading: false,
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
      }
    }
  },
  computed: {
    scrollerStyle() {
      const count = Math.min(this.list.length, 5)
      const height = this.itemSize * count
      return `height: ${height}px`
    }
  },
  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loadWs()
      this.loadNew()
    },
    loadWs() {
      let msg = {
        type: 'logs',
        filter: {
          where: { dataFlowId: { eq: this.id } },
          order: 'id DESC',
          limit: 20
        }
      }
      const self = this
      ws.on('logs', function (data) {
        data && self.loadNew()
      })

      ws.ready(() => {
        ws.send(msg)
      }, true)
    },
    scrollFnc(ev) {
      const target = ev.target
      if (target.scrollHeight - target.scrollTop <= target.clientHeight) {
        this.loadOld()
      }
    },
    toSolutions(code) {
      // 这里没有this.$router
      window.open('/#/customerLogsSolutions?code=' + code)
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
      let filter = {
        where: {
          dataFlowId: {
            eq: this.id
          },
          id: {
            lt: this.firstLogsId
          }
        },
        order: 'id DESC',
        limit: 35
      }
      this.addFilter(filter)
      this.getLogsData(filter, false, false)
    },
    loadNew() {
      this.lastLogsId = ''
      let filter = {
        where: {
          dataFlowId: {
            eq: this.id
          }
        },
        order: 'id DESC',
        limit: 35
      }
      this.addFilter(filter)

      this.getLogsData(filter, true, true)
    },
    getLogsData(filter, reset = false, prepend = false) {
      // 获取日志

      let self = this

      if (self.loading) return

      self.loading = true

      let flag = localStorage.getItem('logs')
      if (flag) {
        let len = 20 || this.getRandom(20, 50)
        const levelArr = ['INFO', 'WARN', 'ERROR', 'FATAL']
        const templateArr = [
          '{date} Created Job {jobName} on agent {agentHost} {info} \r\n \t 这就是换行符',
          'Job {Jobs.name} to work on agent {agentHost} \r\n' +
            '\t\t"MySqlSource" [localParallelism=1];\r\n' +
            '\t\t"MongoDBSource" [localParallelism=1];\r\n' +
            '\t\t    "join" [localParallelism=1];\r\n' +
            '\t\t    "FakeSink" [localParallelism=1];\r\n' +
            '\t\t    "MongoDBSource" -> "join" [headlabel=0, queueSize=1024];\r\n' +
            ' \t\t   "MySqlSource" -> "join" [headlabel=1, queueSize=1024];\r\n' +
            ' \t\t   "join" -> "FakeSink" [queueSize=1024]'
        ]
        const linkArr = ['', 'https://www.baidu.com/']
        const timestamp = new Date().getTime()
        let data = []
        for (let i = 0; i < len; i++) {
          let obj = {
            id: new Date().getTime() + i,
            level: levelArr[this.getRandom(0, 3)],
            params: {
              date: '日期',
              jobName: 'jobName' + i,
              errorCode: this.getRandom(10000, 10099),
              dataSourceTye: 'mongodb',
              dataSourceErrorMessage: 'Oracle error...',
              agentHost: '地址是什么',
              info: '这是信息'
            },
            timestamp: timestamp + i * 1000, //时间戳， 客户端需要根据浏览器时区显示
            link: this.getRandom(0, 2) > 1 ? linkArr[1] : linkArr[0], // 外链的地址，由tm查询返回，如果是数据库错误，则需要返回
            template: this.getRandom(0, 2) > 1 ? templateArr[1] : templateArr[0]
          }
          data.push(obj)
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
        if (reset) {
          this.list = Object.freeze(data)
        } else {
          this.list = Object.freeze([...this.list, ...data])
        }
        // let res = {
        //   data: data,
        //   code: 'ok',
        //   msg: 'ok'
        // }
        // let res = `{"data":[{"errorCode":10000,"message":"message","items":["Nancy Jackson","William Jones","Gary Martin","Susan Perez","Christopher Perez","Betty Lee","Elizabeth Martin","Shirley Anderson"]},{"errorCode":10001,"message":"message","items":["Melissa Walker","Steven Thomas","Timothy Davis"]},{"errorCode":10002,"message":"message","items":["Melissa Johnson","Brian Thomas","Paul Young"]},{"errorCode":10003,"message":"message","items":["Laura Perez"]},{"errorCode":10004,"message":"message","items":["Susan Johnson","Mark Lewis"]}],"code":"ok","msg":"ok"}`
        self.loading = false
        return
      }
      //{ filter: JSON.stringify(filter) }
      this.$api('CustomerJobLogs')
        .get()
        .then(res => {
          let list = res.data.items
          list.forEach(el => {
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
          if (reset) {
            this.list = Object.freeze(list)
          } else {
            this.list = Object.freeze([...this.list, ...list])
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
          self.loading = false
        })
    },
    getRandom(min, max) {
      return min + Math.round(Math.random() * (max - min))
    },
    searchFnc(debounce) {
      delayTrigger(() => {
        this.loadNew()
      }, debounce)
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
.LogItem {
  height: calc(100% - 44px);
  overflow-y: auto;
  background: rgba(229, 236, 255, 0.22);
  &.empty {
    min-height: 150px;
  }
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
