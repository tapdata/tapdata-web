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
      <Chart ref="chart" :extend="pieOptions" style="width: 270px; height: 90px"></Chart>
    </div>
    <div class="flex justify-content-between align-items-center px-4 pt-4">
      <span class="font-color-normal fw-bold fs-7">问题表清单</span>
      <VIcon size="16" class="cursor-pointer" @click="$emit('verifyDetails')">menu-left</VIcon>
    </div>
    <div class="px-4 py-2">
      <ElInput
        v-model="dbSearchTxt"
        ref="dbInput"
        placeholder="请输入搜索内容"
        prefix-icon="el-icon-search"
        size="mini"
        clearable
        @keydown.native.stop
        @keyup.native.stop
        @click.native.stop
        @input="handleDBInput"
      >
      </ElInput>
    </div>

    <div v-loading="dbLoading" class="flex-1" style="height: 0">
      <DynamicScroller
        ref="virtualScroller"
        :items="dbList"
        key-field="id"
        :min-item-size="30"
        class="scroller h-100"
        v-infinite-scroll="loadMoreDB"
      >
        <template #after>
          <div v-if="dbSearchTxt" class="before-scroll-content text-center font-color-light pb-2">
            <div>{{ $t('customer_logs_no_search_data') }}</div>
          </div>
          <div v-else class="before-scroll-content text-center font-color-light pb-2">
            <div v-if="noDBMore">{{ $t('customer_logs_no_more_data') }}</div>
            <div v-else-if="!dbList.length">{{ $t('dag_dialog_field_mapping_no_data') }}</div>
            <div v-show="dbLoadingMore">
              <i class="el-icon-loading"></i>
            </div>
          </div>
        </template>
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
            :size-dependencies="[item.id, item.connection]"
          >
            <div class="db-item px-4 py-2 user-select-none border-bottom">
              <div class="flex justify-content-between mb-2">
                <span>连接名：</span>
                <ElLink type="primary" @click="$emit('connectionList', item.connection)">{{ item.connection }}</ElLink>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>表名：</span>
                <ElLink type="primary" @click="$emit('verifyDetails', item.table)">{{ item.table }}</ElLink>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>异常数据（行）：</span>
                <span>{{ item.diff }}</span>
              </div>
              <div class="flex justify-content-between mb-2">
                <span>准确性：</span>
                <span>{{ item.progress }}%</span>
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
import { debounce, escapeRegExp } from 'lodash'

import { Chart } from '@tap/component'
import { calcUnit } from '@tap/shared'

import Locale from '../../mixins/locale'

function getRandom() {
  return Math.ceil(Math.random() * 100)
}

export default {
  name: 'VerifyPanel',

  components: { Chart, DynamicScroller, DynamicScrollerItem },

  mixins: [Locale],

  props: {
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
    }
  },

  data() {
    return {
      dbSearchTxt: '',
      dbLoading: true,
      dbLoadingMore: false,
      skeletonThrottle: 0,
      dbList: [],
      dbPage: 1,
      dbTotal: 0,
      dbIdMap: {}
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
      return this.dbLoading || this.noDBMore || this.dbLoadingMore
    },

    noDBMore() {
      return this.dbPage >= Math.ceil(this.dbTotal / 20)
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      this.loadDatabase()
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

    handleDBInput: debounce(function () {
      this.loadDatabase()
    }, 100),

    loadMoreDB() {
      console.log('loadMoreDB')
      if (this.disabledDBMore) return
      this.loadDatabase(true)
    },

    getDbFilter() {
      const filter = {
        page: this.dbPage,
        size: 20,
        where: {
          // database_type: {
          //   $in: this.database
          // },
          connection_type: {
            like: this.connectionType,
            options: 'i'
          }
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          database_owner: 1,
          database_name: 1,
          database_username: 1,
          database_host: 1,
          database_port: 1,
          database_uri: 1,
          connection_name: 1,
          brokerURL: 1,
          mqType: 1,
          kafkaBootstrapServers: 1,
          connection_type: 1,
          status: 1,
          accessNodeType: 1,
          accessNodeProcessId: 1,
          accessNodeProcessIdList: 1,
          pdkType: 1,
          pdkHash: 1,
          capabilities: 1,
          config: 1
        },
        order: ['status DESC', 'name ASC']
      }
      const txt = escapeRegExp(this.dbSearchTxt.trim())

      if (txt) {
        filter.where.name = { like: txt, options: 'i' }
      }

      return { filter: JSON.stringify(filter) }
    },

    loadDatabase(loadMore) {
      if (loadMore) {
        this.dbPage++
        this.dbLoadingMore = true
      } else {
        this.dbLoading = true
        this.dbPage = 1
        this.dbTotal = 0
      }
      // this.dbList = Array(10)
      //   .fill()
      //   .map((t, i) => {
      //     return {
      //       id: i,
      //       connection: '连接名称' + getRandom(),
      //       table: '表名' + getRandom(),
      //       diff: getRandom(),
      //       progress: getRandom()
      //     }
      //   })
      // this.dbTotal = getRandom()

      // const data = await connectionsApi.get(this.getDbFilter())
      const startStamp = Date.now()
      this.dbTotal = 10000
      const dbList = Array(10)
        .fill()
        .map((t, i) => {
          return {
            id: Date.now() + i,
            connection: '连接名称' + getRandom(),
            table: '表名' + getRandom(),
            diff: (getRandom() * 1000).toLocaleString(),
            progress: getRandom()
          }
        })
        .filter(t => (t.connection + t.table).indexOf(this.dbSearchTxt) > -1)
      // const dbList = data.items.map(item => {
      //   let connectionUrl = ''
      //
      //   if (item.config) {
      //     if (item.config.uri) {
      //       connectionUrl = item.config.uri
      //     } else {
      //       connectionUrl = `${item.config.host}:${item.config.port}/${item.config.database}${
      //         item.config.schema ? `/${item.config.schema}` : ''
      //       }`
      //     }
      //   }
      //
      //   item.connectionUrl = connectionUrl
      //   item.databaseType = item.database_type
      //   return item
      // })
      //
      if (loadMore) {
        // 防止重复push
        dbList.forEach(item => {
          if (!this.dbIdMap[item.id]) {
            this.dbList.push(item)
            this.dbIdMap[item.id] = true
          }
        })
      } else {
        this.scrollTopOfDBList()
        this.dbList = dbList
        // this.dbLoading = false
        // 缓存所有dbId
        this.dbIdMap = dbList.reduce((map, item) => ((map[item.id] = true), map), {})
      }
      setTimeout(
        () => {
          this.dbLoadingMore = false
          this.dbLoading = false
        },
        Date.now() - startStamp < 1000 ? 2000 : 0
      )
      return this.dbList
    },

    scrollTopOfDBList() {
      if (this.$refs.dbList) this.$refs.dbList.wrap.scrollTop = 0
    }
  }
}
</script>
<style lang="scss" scoped>
.verify-panel {
  width: 306px;
}
.db-item {
}
</style>
