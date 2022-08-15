<template>
  <section
    v-show="isShow"
    class="verify-panel border-start flex-column"
    :class="{ flex: isShow, 'show-verify': isShow }"
  >
    <div class="flex justify-content-between align-items-center p-4">
      <span class="font-color-normal fw-bold fs-7">任务校验</span>
      <VIcon size="16" class="cursor-pointer" @click="$emit('showVerify')">close</VIcon>
    </div>
    <div class="px-4 pb-4 border-bottom">
      <Chart :extend="pieOptions" class="chart"></Chart>
    </div>
    <div class="flex justify-content-between align-items-center px-4 pt-4">
      <div class="flex align-items-center font-color-normal fw-bold fs-7">
        <span>问题表清单</span>
        <ElTooltip :value="hasNew" transition="tooltip-fade-in" :content="hasNew ? '检测到新数据，请点击刷新' : '刷新'">
          <VIcon class="ml-2 color-primary cursor-pointer" size="9" @click="search">icon_table_selector_load</VIcon>
        </ElTooltip>
      </div>
      <ElTooltip transition="tooltip-fade-in" content="列表">
        <VIcon size="16" class="cursor-pointer" @click="$emit('verifyDetails')">menu-left</VIcon>
      </ElTooltip>
    </div>
    <div class="px-4 py-2">
      <ElInput
        v-model="keyword"
        placeholder="请输入搜索内容"
        prefix-icon="el-icon-search"
        size="mini"
        clearable
        @keydown.native.stop
        @keyup.native.stop
        @click.native.stop
        @input="search"
      >
      </ElInput>
    </div>

    <div v-loading="loading" class="flex-1" style="height: 0">
      <DynamicScroller
        ref="virtualScroller"
        :items="list"
        key-field="id"
        :min-item-size="30"
        class="scroller h-100"
        v-infinite-scroll="loadMoreDB"
      >
        <template #after>
          <div class="before-scroll-content text-center font-color-light py-1">
            <VEmpty
              v-if="!list.length"
              :description="keyword ? $t('customer_logs_no_search_data') : $t('dag_dialog_field_mapping_no_data')"
            />
            <div v-show="moreLoading">
              <i class="el-icon-loading"></i>
            </div>
            <div v-show="!moreLoading && noMore">{{ $t('customer_logs_no_more_data') }}</div>
          </div>
        </template>
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="[item.id]">
            <div class="px-4 py-2 user-select-none border-bottom">
              <div class="flex justify-content-between mb-2">
                <span>连接名：</span>
                <ElLink type="primary" @click="$emit('connectionList', item.sourceConnName)">{{
                  item.sourceConnName
                }}</ElLink>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>表名：</span>
                <ElLink type="primary" @click="$emit('verifyDetails', item.originalTableName)">{{
                  item.originalTableName
                }}</ElLink>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>异常数据（行）：</span>
                <span>{{ item.counts }}</span>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </section>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'

import { Chart } from '@tap/component'
import { calcUnit, deepCopy } from '@tap/shared'
import { taskApi } from '@tap/api'
import { VEmpty } from '@tap/component'

import Locale from '../../mixins/locale'

export default {
  name: 'VerifyPanel',

  components: { Chart, DynamicScroller, DynamicScrollerItem, VEmpty },

  mixins: [Locale],

  props: {
    dataflow: Object,
    settings: Object,
    samples: {
      type: Object,
      default: () => {
        return {
          passed: 10232,
          diff: 456,
          notSupport: 231114
        }
      }
    },
    data: {
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
      keyword: '',
      loading: true,
      moreLoading: false,
      skeletonThrottle: 0,
      list: [],
      pageSize: 10,
      page: 1,
      total: 0,
      idMap: {},
      hasNew: false // 出现新数据
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType']),

    isShow() {
      return this.activeType === 'verify'
    },

    pieOptions() {
      let arr = [
        {
          name: '校验一致',
          key: 'passed',
          value: 0,
          color: '#82C647'
        },
        {
          name: '校验不一致',
          key: 'diff',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '不支持校验',
          key: 'notSupport',
          value: 0,
          color: '#88DBDA'
        }
      ]
      const values = arr.map(t =>
        Object.assign({}, t, {
          value: this.samples?.[t.key] ?? 0
        })
      )
      return this.getPieOptions(values)
    },

    disabledDBMore() {
      return this.loading || this.noMore || this.moreLoading
    },

    noMore() {
      return this.page !== 1 && this.page >= Math.ceil(this.total / this.pageSize)
    }
  },

  watch: {
    data: {
      deep: true,
      handler(v1, v2) {
        if (JSON.stringify(v1) === JSON.stringify(v2)) {
          return
        }
        this.updateList()
      }
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loadData()
    },

    resetPage() {
      this.page = 1
      this.total = 0
    },

    getFilter(page) {
      const { pageSize, keyword } = this
      page = page || this.page
      let filter = {
        limit: pageSize,
        skip: pageSize * (page - 1),
        tableName: keyword
      }
      return filter
    },

    loadData(loadMore = false) {
      const startStamp = Date.now()
      taskApi
        .autoInspectResultsGroupByTable('taskid' || this.dataflow.id, {
          filter: JSON.stringify(this.getFilter())
        })
        .then(data => {
          this.total = data.total
          const lastId = this.list.at(-1)?.id || 0
          let items = data.items.map((t, i) => {
            t.id = lastId + i + 1
            t.counts = t.counts.toLocaleString()
            return t
          })
          if (loadMore) {
            // 防止重复push
            items.forEach(item => {
              if (!this.idMap[item.id]) {
                this.list.push(item)
                this.idMap[item.id] = true
              }
            })
          } else {
            this.scrollTopOfDBList()
            this.list = items
            this.idMap = items.reduce((map, item) => ((map[item.id] = true), map), {})
          }
        })
        .finally(() => {
          setTimeout(
            () => {
              this.moreLoading = false
              this.loading = false
            },
            Date.now() - startStamp < 1000 ? 1500 : 0
          )
        })
    },

    getPieOptions(data) {
      const total = eval(data.map(t => t.value).join('+'))
      const totalText = '总计'
      let options = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#364252',
          borderColor: '#364252',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          position: 'top',
          formatter: params => {
            const { marker, name, value, seriesName } = params || {}
            let result = `<div>`
            if (seriesName) {
              result += `<div class="text-center">${seriesName}</div>`
            }
            result += `<span>${marker}</span><span class="pl-2">${name}</span><span class="din-font inline-block text-end" style="width: 60px">${value.toLocaleString()}</span>`
            result += `</div>`
            return result
          }
        },
        textStyle: {
          rich: {
            orgname: {
              width: 80,
              color: '#535F72'
            },
            count: {
              padding: [0, 0, 0, 15],
              color: '#333C4A'
            }
          }
        },
        legend: {
          top: 'center',
          right: 0,
          icon: 'circle',
          orient: 'vertical',
          itemWidth: 6,
          itemHeight: 6,
          formatter: name => {
            const count = 0
            const arr = [`{orgname|${name}}`, `{count|${count}}`]
            return arr.join('')
          }
        },
        series: [
          {
            name: '任务校验',
            type: 'pie',
            radius: ['55%', '90%'],
            center: ['20%', '50%'],
            label: {
              show: true,
              position: 'center',
              fontWeight: 'bold',
              // backgroundColor: '#fff',
              formatter: `{name|${calcUnit(total)}}\n{value|${totalText}}`,
              rich: {
                name: {
                  lineHeight: 24,
                  color: 'rgba(0, 0, 0, 0.85)',
                  fontSize: 14,
                  fontWeight: '400'
                },
                value: {
                  color: 'rgba(0, 0, 0, 0.43)',
                  fontSize: 12,
                  fontWeight: '400'
                }
              }
            },
            labelLine: { show: false },
            data: [],
            top: 'top'
          }
        ]
      }
      if (data?.length) {
        options.series[0].data = data.map(t => {
          return {
            name: t.name,
            value: t.value,
            itemStyle: {
              color: t.color
            }
          }
        })
        options.legend.formatter = name => {
          const count = options.series[0].data?.find(t => t.name === name)?.value || 0
          const arr = [`{orgname|${name}}`, `{count|${count.toLocaleString()}}`]
          return arr.join('')
        }
      }
      return options
    },

    search: debounce(function () {
      this.resetPage()
      this.hasNew = false
      this.loading = true
      this.loadData()
    }, 300),

    loadMoreDB() {
      if (this.disabledDBMore) return
      this.page++
      this.moreLoading = true
      this.loadData(true)
    },

    updateList() {
      const { items, total } = this.data
      const len = items.length
      const flag =
        len === this.list.length &&
        items.map(t => t.id + '_' + t.counts).join() === this.list.map(t => t.id + '_' + t.counts).join() // id、差异都相同
      this.total = total
      // 只有第一页数据时，自动更新列表
      if (this.page === 1 && (!items.length || !flag)) {
        this.scrollTopOfDBList()
        this.list = deepCopy(items).map((t, i) => {
          t.id = i + 1
          t.counts = t.counts.toLocaleString()
          return t
        })
        return
      }
      // 检查是否有新数据
      this.hasNew = !flag || total !== this.total
    },

    scrollTopOfDBList() {
      if (this.$refs.virtualScroller) this.$refs.virtualScroller.scrollToItem(0)
    }
  }
}
</script>
<style lang="scss" scoped>
.verify-panel {
  width: 306px;
}
.chart {
  width: 270px;
  height: 90px;
}
</style>
