<template>
  <section
    v-show="isShow"
    class="verify-panel border-start flex-column"
    :class="{ flex: isShow, 'show-verify': isShow }"
  >
    <div class="flex justify-content-between align-items-center p-4">
      <span class="font-color-normal fw-bold fs-7">{{
        $t('packages_dag_monitor_leftsider_renwujiaoyan')
      }}</span>
      <VIcon size="16" class="cursor-pointer" @click="$emit('showVerify')"
        >close</VIcon
      >
    </div>
    <div class="px-4 pb-4 border-bottom">
      <Chart :extend="pieOptions" class="chart"></Chart>
    </div>
    <div class="flex justify-content-between align-items-center px-4 pt-4">
      <div class="flex align-items-center font-color-normal fw-bold fs-7">
        <span>{{
          $t('packages_dag_monitor_verifypanel_wentibiaoqingdan')
        }}</span>
        <ElTooltip
          :value="hasNew"
          transition="tooltip-fade-in"
          :content="
            hasNew
              ? $t('packages_dag_monitor_verifypanel_jiancedaoxinshu')
              : $t('packages_dag_components_initiallist_dianjishuaxin')
          "
        >
          <VIcon
            class="ml-2 color-primary cursor-pointer"
            size="9"
            @click="search"
            >icon_table_selector_load</VIcon
          >
        </ElTooltip>
      </div>
      <ElTooltip
        v-if="!!total"
        transition="tooltip-fade-in"
        :content="$t('packages_dag_monitor_leftsider_liebiao')"
      >
        <VIcon size="16" class="cursor-pointer" @click="$emit('verifyDetails')"
          >menu-left</VIcon
        >
      </ElTooltip>
    </div>
    <div class="px-4 py-2">
      <ElInput
        v-model:value="keyword"
        :placeholder="$t('packages_dag_monitor_verifypanel_qingshurusousuo')"
        prefix-icon="el-icon-search"
        size="mini"
        clearable
        @keydown.stop
        @keyup.stop
        @click.stop
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
              :description="
                keyword
                  ? $t('packages_dag_customer_logs_no_search_data')
                  : $t('packages_dag_dag_dialog_field_mapping_no_data')
              "
            />
            <div v-show="moreLoading">
              <i class="el-icon-loading"></i>
            </div>
            <div v-show="!moreLoading && noMore">
              {{ $t('packages_dag_customer_logs_no_more_data') }}
            </div>
          </div>
        </template>
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
            :size-dependencies="[item.id]"
          >
            <div class="px-4 py-2 user-select-none border-bottom">
              <div class="flex justify-content-between mb-2">
                <span>{{
                  $t('packages_dag_monitor_verifypanel_lianjieming')
                }}</span>
                <ElLink
                  type="primary"
                  @click="$emit('connectionList', item.sourceConnName)"
                  >{{ item.sourceConnName }}</ElLink
                >
              </div>
              <div class="flex justify-content-between mb-2">
                <span>{{
                  $t('packages_dag_monitor_verifypanel_biaoming')
                }}</span>
                <ElLink
                  type="primary"
                  @click="$emit('verifyDetails', item.originalTableName)"
                  >{{ item.originalTableName }}</ElLink
                >
              </div>
              <div class="flex justify-content-between mb-2">
                <span>{{
                  $t('packages_dag_monitor_verifypanel_yichangshujuhang')
                }}</span>
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
import i18n from '@tap/i18n'

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'

import { Chart } from '@tap/component'
import { calcUnit, deepCopy } from '@tap/shared'
import Time from '@tap/shared/src/time'
import { taskApi } from '@tap/api'
import { VEmpty } from '@tap/component'

export default {
  name: 'VerifyPanel',
  components: { Chart, DynamicScroller, DynamicScrollerItem, VEmpty },
  props: {
    dataflow: Object,
    data: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: [],
        }
      },
    },
    totals: Object,
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
      totalsData: {},
      hasNew: false, // 出现新数据
    }
  },
  computed: {
    ...mapGetters('dataflow', ['activeType']),

    isShow() {
      return this.activeType === 'verify'
    },

    pieOptions() {
      let { totalsData, totals } = this
      if (totals) {
        totalsData = {
          ...totals,
        }
      }
      let arr = [
        {
          name: i18n.t('packages_dag_monitor_verifypanel_jiaoyanyizhi'),
          key: 'passed',
          value: 0,
          color: '#82C647',
        },
        {
          name: i18n.t('packages_dag_monitor_verifypanel_jiaoyanbuyizhi'),
          key: 'diffTables',
          value: 0,
          color: '#F7D762',
        },
        {
          name: i18n.t('packages_dag_monitor_verifypanel_buzhichijiaoyan'),
          key: 'ignore',
          value: 0,
          color: '#88DBDA',
        },
      ]
      const values = arr.map((t) =>
        Object.assign({}, t, {
          value: totalsData?.[t.key] ?? 0,
        })
      )
      return this.getPieOptions(values)
    },

    disabledDBMore() {
      return this.loading || this.noMore || this.moreLoading
    },

    noMore() {
      return (
        this.page !== 1 && this.page >= Math.ceil(this.total / this.pageSize)
      )
    },
  },
  watch: {
    data: {
      deep: true,
      handler(v1, v2) {
        if (JSON.stringify(v1) === JSON.stringify(v2)) {
          return
        }
        this.updateList()
      },
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loadData()
      this.loadTotals()
    },

    resetPage() {
      this.page = 1
      this.total = 0
    },

    getFilter(page) {
      const { pageSize, keyword } = this
      page = page || this.page
      let filter = {
        id: this.dataflow.id,
        limit: pageSize,
        skip: pageSize * (page - 1),
        filter: keyword,
      }
      return filter
    },

    loadData(loadMore = false) {
      const startStamp = Time.now()
      taskApi
        .autoInspectResultsGroupByTable(this.getFilter())
        .then(({ total, items = [] }) => {
          this.total = total
          const lastId = this.list.at(-1)?.id || 0
          items = items.map((t, i) => {
            t.id = lastId + i + 1
            t.counts = t.counts.toLocaleString()
            return t
          })
          if (loadMore) {
            // 防止重复push
            items.forEach((item) => {
              if (!this.idMap[item.id]) {
                this.list.push(item)
                this.idMap[item.id] = true
              }
            })
          } else {
            this.scrollTopOfDBList()
            this.list = items
            this.idMap = items.reduce(
              (map, item) => ((map[item.id] = true), map),
              {}
            )
          }
        })
        .finally(() => {
          setTimeout(
            () => {
              this.moreLoading = false
              this.loading = false
            },
            Time.now() - startStamp < 1000 ? 1500 : 0
          )
        })
    },

    loadTotals() {
      taskApi
        .autoInspectTotals({
          id: this.dataflow.id,
        })
        .then((data) => {
          const { diffTables = 0, ignore = 0, totals = 0 } = data
          const passed = totals - ignore - diffTables
          this.totalsData = { diffTables, ignore, passed }
        })
    },

    getPieOptions(data) {
      const total = eval(data.map((t) => t.value).join('+'))
      const totalText = i18n.t('packages_dag_monitor_verifypanel_zongji')
      let options = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#364252',
          borderColor: '#364252',
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          position: 'top',
          formatter: (params) => {
            const { marker, name, value, seriesName } = params || {}
            let result = `<div>`
            if (seriesName) {
              result += `<div class="text-center">${seriesName}</div>`
            }
            result += `<span>${marker}</span><span class="pl-2">${name}</span><span class="din-font inline-block text-end" style="width: 60px">${value.toLocaleString()}</span>`
            result += `</div>`
            return result
          },
        },
        textStyle: {
          rich: {
            orgname: {
              width: 80,
              color: '#535F72',
            },
            count: {
              padding: [0, 0, 0, 15],
              color: '#333C4A',
            },
          },
        },
        legend: {
          top: 'center',
          right: 0,
          icon: 'circle',
          orient: 'vertical',
          itemWidth: 6,
          itemHeight: 6,
          formatter: (name) => {
            const count = 0
            const arr = [`{orgname|${name}}`, `{count|${count}}`]
            return arr.join('')
          },
        },
        series: [
          {
            name: i18n.t('packages_dag_monitor_leftsider_renwujiaoyan'),
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
                  fontWeight: '400',
                },
                value: {
                  color: 'rgba(0, 0, 0, 0.43)',
                  fontSize: 12,
                  fontWeight: '400',
                },
              },
            },
            labelLine: { show: false },
            data: [],
            top: 'top',
          },
        ],
      }
      if (data?.length) {
        options.series[0].data = data.map((t) => {
          return {
            name: t.name,
            value: t.value,
            itemStyle: {
              color: t.color,
            },
          }
        })
        options.legend.formatter = (name) => {
          const count =
            options.series[0].data?.find((t) => t.name === name)?.value || 0
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
        items.map((t) => t.id + '_' + t.counts).join() ===
          this.list.map((t) => t.id + '_' + t.counts).join() // id、差异都相同
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
    },
  },
  emits: ['showVerify', 'verifyDetails', 'connectionList'],
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
