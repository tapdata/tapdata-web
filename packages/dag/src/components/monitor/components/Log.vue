<template>
  <div class="log-container flex justify-content-between">
    <div class="filter-items border-end">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[{ active: active === item.value }]"
        class="filter-items__item flex justify-content-between align-items-center"
        @click="changeItem(item)"
      >
        <span>{{ item.label }}</span>
        <VIcon>arrow-right</VIcon>
      </div>
    </div>
    <div class="main flex-1 flex flex-column pt-5">
      <div class="flex ml-4 mb-4 align-items-center">
        <TimeSelect @change="changeTime"></TimeSelect>
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
        <ElButton type="text" class="ml-4" @click="handleSetting">设置</ElButton>
        <ElButton type="text" class="ml-4" @click="handleDownload">下载</ElButton>
      </div>
      <div class="level-line ml-4">
        <ElCheckboxGroup v-model="checkList" :min="1" size="mini" class="inline-flex" @change="searchFnc">
          <ElCheckbox label="DEBUG">DEBUG</ElCheckbox>
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
          <!--          <ElCheckbox label="FATAL">FATAL</ElCheckbox>-->
        </ElCheckboxGroup>
      </div>
      <div v-loading="loading" class="log-list p-4 flex-1" style="height: 0">
        <DynamicScroller
          ref="virtualScroller"
          :items="list"
          key-field="id"
          :min-item-size="30"
          class="scroller h-100"
          @scroll.native="scrollFnc"
        >
          <template #before>
            <div v-if="keyword" class="before-scroll-content text-center font-color-light pb-2">
              <div>{{ $t('customer_logs_no_search_data') }}</div>
            </div>
            <div v-else class="before-scroll-content text-center font-color-light pb-2">
              <div v-if="isNoMore">{{ $t('customer_logs_no_more_data') }}</div>
              <div v-else-if="!list.length">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
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
              <div class="flex py-1 font-color-light">
                <div class="mr-2 white-space-nowrap">
                  [<span :class="['level', colorMap[item.level]]">{{ item.params.level || item.level }}</span
                  >]
                  <span>{{ formatTime(item.timestamp) }}</span>
                </div>
                <div>
                  <span v-html="item.content"></span>
                  <span v-if="item.link" class="color-primary ml-2 cursor-pointer" @click="toLink(item.link)">{{
                    $t('customer_logs_to_link')
                  }}</span>
                </div>
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
import VIcon from 'web-core/components/VIcon'
import TimeSelect from './TimeSelect'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { delayTrigger } from '@tap/shared'
import { customerJobLogsApi } from '../../../../../api'
import dayjs from 'dayjs'
import { mapGetters } from 'vuex'

export default {
  name: 'Log',

  components: { VIcon, TimeSelect, DynamicScroller, DynamicScrollerItem },

  props: {
    // nodes: {
    //   type: Array,
    //   default: () => []
    // }
  },

  data() {
    return {
      active: 'all',
      keyword: '',
      checkList: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
      itemSize: 20,
      timer: null,
      loading: false,
      preLoading: false,
      list: [],
      colorMap: {
        FATAL: 'color-red',
        ERROR: 'color-danger',
        WARN: 'color-warning'
      },
      pageObj: {
        page: 1,
        size: 20
      },
      isScrollBottom: false,
      isNoMore: false,
      form: {
        level: '',
        start: 500,
        max: 500
      },
      dialog: false
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),
    items() {
      console.log('items', this.allNodes)
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
    }
  },

  watch: {
    '$attrs.currentTab'(v) {
      if (v === 'log') {
        this.init()
      } else {
        this.clearTimer()
      }
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
      this.pollingData()
      this.resetData()
    },

    clearTimer() {
      this.timer && clearInterval(this.timer)
      this.timer = null
    },

    pollingData() {
      this.clearTimer()
      this.timer = setInterval(() => {
        this.loadNew()
      }, 5000)
    },

    changeItem(item) {
      this.active = item.value
      this.init()
    },

    changeTime(val, isTime) {
      console.log('eventChangeTime', val, isTime)
    },

    searchFnc(debounce) {
      delayTrigger(() => {
        console.log('searchFnc')
      }, debounce)
    },

    scrollFnc(ev) {
      const target = ev.target
      if (target.scrollTop <= 0) {
        this.loadOld()
      }
      this.isScrollBottom = target.scrollHeight - target.scrollTop <= target.clientHeight
    },

    addFilter(filter) {
      const { active, checkList, keyword } = this
      // 选中的节点
      // if (active === 'all') {
      // } else {
      // }

      if (keyword) {
        // filter.where.searchKey = { $regex: keyword, $options: 'i' }
        filter.where.$or = [{ searchKey: { $regex: keyword, $options: 'i' } }, { key: keyword }]
      }

      if (checkList.length) {
        filter.where.level = {
          in: checkList
        }
      }
      return filter
    },

    loadOld() {
      console.log('loadOld')
      if (this.isNoMore) {
        return
      }
      let filter = {
        where: {
          dataFlowId: this.id
        },
        order: 'id DESC',
        limit: 20
      }
      if (this.firstLogsId) {
        filter.where.id = {
          lt: this.firstLogsId
        }
      }
      this.addFilter(filter)
      this.getLogsData(filter, false, true)
    },

    loadNew() {
      // this.lastLogsId = ''
      let filter = {
        where: {
          dataFlowId: this.id
        },
        order: 'id DESC',
        limit: 20
      }
      if (this.lastLogsId) {
        filter.where.id = {
          gt: this.lastLogsId
        }
      }
      this.addFilter(filter)

      this.getLogsData(filter, false, false)
    },

    resetData() {
      this.firstLogsId = ''
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

      if (reset) {
        this.loading = true
      } else {
        if (prepend) {
          this.preLoading = true
        }
      }
      customerJobLogsApi
        .get({ filter: JSON.stringify(filter) })
        .then(data => {
          console.log('customerJobLogsApi', data)
          let items = data?.items || []
          items = items.reverse()
          if (!items.length) {
            if (reset) {
              this.list = []
            } else {
              if (prepend) {
                this.isNoMore = true
              }
            }
            return
          }
          const { keyword } = this
          items.forEach(el => {
            let { template, params, templateKeys } = el
            let content = template || ''
            if (templateKeys) {
              templateKeys.forEach(t => {
                for (let key in params) {
                  let re = new RegExp(`{${key}}`, 'ig')
                  params[t] = params[t].replace(re, params[key])
                }
              })
            }
            for (let key in params) {
              let re = new RegExp(`{${key}}`, 'ig')
              content = content.replace(re, params[key])
            }
            // dataSourceErrorMessage
            if (params.dataSourceErrorMessage) {
              content += `<span class="ml-2">${params.dataSourceErrorMessage}</span>`
            }

            el.content = content
              .replace(/\r\n/g, '<br/>')
              .replace(/\n/g, '<br/>')
              .replace(/\t/g, '<span class="tap-span"></span>')
              .replace(/[\b\f\n\r\t]/g, '')
            // 高亮处理
            if (keyword && new RegExp(keyword, 'ig').test(el.content)) {
              const reg = new RegExp(keyword, 'ig')
              // 高亮关键字
              el.content = el.content.replace(reg, function (val) {
                return `<span class="keyword">${val}</span>`
              })
            }
          })
          let { list } = this
          if (reset) {
            this.list = Object.freeze(items)
            this.scrollToBottom()
            this.firstLogsId = this.list[0]?.id
            this.lastLogsId = this.list[this.list.length - 1]?.id
          } else {
            if (prepend) {
              this.list = Object.freeze([...items, ...list])
              this.firstLogsId = this.list[0]?.id
              this.scrollToItem(items.length - 1)
            } else {
              this.list = Object.freeze([...list, ...items])
              this.lastLogsId = this.list[this.list.length - 1]?.id
              if (this.isScrollBottom) {
                this.scrollToBottom()
              }
            }
          }
        })
        .finally(() => {
          this.loading = false
          this.preLoading = false
        })
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
    },

    toLink(link) {},

    formatTime(date, type = 'YYYY-MM-DD HH:mm:ss') {
      return dayjs(date).format(type)
    },

    handleDownload() {
      console.log('handleDownload')
    },

    handleSetting() {
      console.log('handleSetting')
      this.dialog = true
    },

    handleClose() {},

    handleSave() {}
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
  line-height: 40px;
  cursor: pointer;
  &.active {
    background: rgba(44, 101, 255, 0.05);
  }
}
.white-space-nowrap {
  white-space: nowrap;
}
</style>
