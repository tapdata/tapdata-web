<script>
import { customerJobLogsApi } from '@tap/api'
import { delayTrigger } from '@tap/shared'
import dayjs from 'dayjs'

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default {
  name: 'Normal',
  components: {
    DynamicScroller,
    DynamicScrollerItem,
  },
  props: {
    id: String,
  },
  data() {
    return {
      checkList: ['INFO', 'WARN', 'ERROR', 'FATAL'],
      keyword: '',
      lastLogsId: '',
      firstLogsId: '',
      // topKey: '',
      // bottomKey: '',
      timer: null,
      loading: false,
      preLoading: false,
      imageUrl: require('@tap/assets/images/noData.svg'),
      list: [],
      colorMap: {
        FATAL: 'color-red',
        ERROR: 'color-danger',
        WARN: 'color-warning',
      },
      itemSize: 20,
      pageObj: {
        page: 1,
        size: 20,
      },
      isScrollBottom: false,
      isNoMore: false,
    }
  },
  mounted() {
    this.init()
  },
  unmounted() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    init() {
      this.pollingData()
      // this.loadWs()
      this.resetData()
    },
    pollingData() {
      this.timer = setInterval(() => {
        this.loadNew()
      }, 5000)
    },
    loadWs() {
      const msg = {
        type: 'logs',
        filter: {
          where: { dataFlowId: this.id },
          order: 'id DESC',
          limit: 20,
        },
      }
      this.$ws.on('logs', (data) => {
        data && this.resetData()
      })

      this.$ws.ready(() => {
        this.$ws.send(msg)
      }, true)
    },
    scrollFnc(ev) {
      const target = ev.target
      if (target.scrollTop <= 0) {
        this.loadOld()
      }
      this.isScrollBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight
    },
    logScroll(logContainer) {
      if (
        logContainer.scrollHeight -
          logContainer.clientHeight -
          logContainer.scrollTop <
        100
      ) {
        this.loadOld()
      }
    },
    addFilter(filter) {
      const { checkList, keyword } = this
      if (keyword) {
        // filter.where.searchKey = { $regex: keyword, $options: 'i' }
        filter.where.$or = [
          { searchKey: { $regex: keyword, $options: 'i' } },
          { key: keyword },
        ]
      }

      if (checkList.length) {
        filter.where.level = {
          in: checkList,
        }
      }
      return filter
    },
    loadOld() {
      if (this.isNoMore) {
        return
      }
      const filter = {
        where: {
          dataFlowId: this.id,
        },
        order: 'id DESC',
        limit: 20,
      }
      if (this.firstLogsId) {
        filter.where.id = {
          lt: this.firstLogsId,
        }
      }
      this.addFilter(filter)
      this.getLogsData(filter, false, true)
    },
    loadNew() {
      // this.lastLogsId = ''
      const filter = {
        where: {
          dataFlowId: this.id,
        },
        order: 'id DESC',
        limit: 20,
      }
      if (this.lastLogsId) {
        filter.where.id = {
          gt: this.lastLogsId,
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
      const filter = {
        where: {
          dataFlowId: this.id,
        },
        order: 'id DESC',
        limit: 20,
      }
      this.addFilter(filter)

      this.getLogsData(filter, true, false)
    },
    getLogsData(filter, reset = false, prepend = false) {
      // 获取日志

      if (this.loading) return

      if (reset) {
        this.loading = true
      } else if (prepend) {
        this.preLoading = true
      }
      customerJobLogsApi
        .get({ filter: JSON.stringify(filter) })
        .then((data) => {
          let items = data?.items || []
          items = items.reverse()
          if (!items.length) {
            if (reset) {
              this.list = []
            } else if (prepend) {
              this.isNoMore = true
            }
            return
          }
          const { keyword } = this
          items.forEach((el) => {
            const { template, params, templateKeys } = el
            let content = template || ''
            if (templateKeys) {
              templateKeys.forEach((t) => {
                for (const key in params) {
                  const re = new RegExp(`{${key}}`, 'gi')
                  params[t] = params[t].replace(re, params[key])
                }
              })
            }
            for (const key in params) {
              const re = new RegExp(`{${key}}`, 'gi')
              content = content.replace(re, params[key])
            }
            // dataSourceErrorMessage
            if (params.dataSourceErrorMessage) {
              content += `<span class="ml-2">${params.dataSourceErrorMessage}</span>`
            }

            el.content = content
              .replaceAll('\r\n', '<br/>')
              .replaceAll('\n', '<br/>')
              .replaceAll('\t', '<span class="tap-span"></span>')
              .replaceAll(/[\b\f\n\r\t]/g, '')
            // 高亮处理
            if (keyword && new RegExp(keyword, 'gi').test(el.content)) {
              const reg = new RegExp(keyword, 'gi')
              // 高亮关键字
              el.content = el.content.replace(reg, function (val) {
                return `<span class="keyword">${val}</span>`
              })
            }
          })
          const { list } = this
          if (reset) {
            this.list = Object.freeze(items)
            this.scrollToBottom()
            this.firstLogsId = this.list[0]?.id
            this.lastLogsId = this.list.at(-1)?.id
          } else if (prepend) {
            this.list = Object.freeze([...items, ...list])
            this.firstLogsId = this.list[0]?.id
            this.scrollToItem(items.length - 1)
          } else {
            this.list = Object.freeze([...list, ...items])
            this.lastLogsId = this.list.at(-1)?.id
            if (this.isScrollBottom) {
              this.scrollToBottom()
            }
          }
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
      return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : ''
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
    toLink(link) {
      this.$clipboard(link).then(() => {
        this.$message.success(
          this.$t('packages_business_customer_logs_copy_result'),
        )
        window.open(link, '_blank')
      })
    },
  },
}
</script>

<template>
  <div class="e-debug-log customer-logs">
    <div
      class="filter-row flex justify-content-between align-items-center mb-4"
    >
      <div class="flex align-items-center">
        <ElInput
          v-model="keyword"
          class="search-input mt-2"
          :placeholder="$t('packages_business_task_info_log_placeholder')"
          clearable
          @input="searchFnc(800)"
        >
          <template #prefix>
            <ElIcon>
              <ElIconSearch />
            </ElIcon>
          </template>
        </ElInput>
        <ElCheckboxGroup
          v-model="checkList"
          :min="1"
          class="inline-flex ml-4"
          @change="searchFnc"
        >
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
          <ElCheckbox label="FATAL">FATAL</ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <slot />
    </div>
    <div ref="logsList" v-loading="loading" class="logs-list">
      <DynamicScroller
        ref="virtualScroller"
        :items="list"
        key-field="id"
        :min-item-size="30"
        class="scroller"
        @scroll="scrollFnc"
      >
        <template #before>
          <div
            v-if="keyword"
            class="before-scroll-content text-center font-color-light pb-2"
          >
            <div>
              {{ $t('packages_business_customer_logs_no_search_data') }}
            </div>
          </div>
          <div
            v-else
            class="before-scroll-content text-center font-color-light pb-2"
          >
            <div v-if="isNoMore">
              {{ $t('packages_business_customer_logs_no_more_data') }}
            </div>
            <div v-else-if="!list.length">{{ $t('public_data_no_data') }}</div>
            <div v-show="preLoading">
              <el-icon>
                <el-icon-loading />
              </el-icon>
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
                [<span :class="['level', colorMap[item.level]]">{{
                  item.params.level || item.level
                }}</span
                >]
                <span>{{ formatTime(item.timestamp) }}</span>
              </div>
              <div>
                <span v-html="item.content" />
                <span
                  v-if="item.link"
                  class="color-primary ml-2 cursor-pointer"
                  @click="toLink(item.link)"
                  >{{ $t('packages_business_customer_logs_to_link') }}</span
                >
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.customer-logs {
  font-size: 12px;

  :deep(.tap-span) {
    padding-left: 16px;
  }

  :deep(.color-red) {
    color: red;
  }
}

.e-debug-log {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  overflow: auto;
  background: rgba(229, 236, 255, 0.22);

  .el-loading-spinner .el-loading-text {
    font-size: 12px;
    color: map.get($fontColor, dark);
  }

  :deep(.keyword) {
    color: map.get($color, danger);
  }
}

.el-checkbox {
  margin-left: 4px;
  margin-right: 8px;

  :deep(.el-checkbox__label) {
    font-size: 12px;
  }
}

.white-space-nowrap {
  white-space: nowrap;
}
</style>
