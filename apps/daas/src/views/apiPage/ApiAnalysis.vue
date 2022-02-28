<template>
  <section class="api-analysis-wrap section-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="api-analysis-list"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('api_asnalysis_name')"
              @input="table.fetch(1, 800)"
            >
              <el-select style="width: 120px" slot="prepend" v-model="searchParams.isFuzzy" @input="table.fetch(1)">
                <el-option :label="$t('query_fuzzy')" :value="true"></el-option>
                <el-option :label="$t('query_precise')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>
          <template v-if="searchParams.keyword">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{ $t('button_query') }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button_reset') }}</el-button>
            </li>
          </template>
        </ul>
      </div>
      <el-table-column :label="$t('api_asnalysis_header_api')" width="260">
        <template slot-scope="scope">
          <div
            :title="scope.row.api_path"
            class="api-analysis-table-apiname"
            v-html="makeApiInfo(scope.row.api_method, scope.row.api_path, scope.row.api_status)"
          ></div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('api_asnalysis_header_calls')" prop="api_calls" sortable="data.api_calls">
      </el-table-column>
      <el-table-column
        :label="$t('api_asnalysis_header_lastTime')"
        prop="time_of_api_last_used"
        sortable="data.time_of_api_last_used"
      ></el-table-column>
      <el-table-column
        :label="$t('api_asnalysis_header_rows')"
        prop="res_rows"
        sortable="data.res_rows"
      ></el-table-column>
      <el-table-column :label="$t('api_asnalysis_header_in_bytes')" prop="req_bytes" sortable="data.req_bytes">
      </el-table-column>
      <el-table-column :label="$t('api_asnalysis_header_out_bytes')" prop="res_bytes" sortable="data.res_bytes">
      </el-table-column>
      <el-table-column
        :label="$t('api_asnalysis_header_sum_res_timespan')"
        prop="total_call_time"
        sortable="classifications"
      ></el-table-column>
      <el-table-column :label="$t('api_asnalysis_header_avg_res_timespan')" prop="avg_call_time" sortable="user">
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '@/utils/util'

export default {
  name: 'ApiAnalysis',
  components: {
    TablePage
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'data.api_calls DESC'
    }
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    let cache = this.table.getCache()
    cache.isFuzzy = cache.isFuzzy === true
    this.searchParams = cache
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 重置查询条件
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { isFuzzy, keyword } = this.searchParams
      let where = {
        stats_name: 'ALL-time:ALL-user:EVERY-api'
      }
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
        where.or = [{ 'data.api_method': filterObj }, { 'data.api_path': filterObj }]
      }

      let totalFilter = {
        where: {
          stats_name: { eq: 'ALL-time:ALL-user:ALL-api' }
        },
        limit: 1
      }
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('insights').count({ where: JSON.stringify(where) }),
        this.$api('insights').get({
          filter: JSON.stringify(totalFilter)
        }),
        this.$api('insights').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, totalRes, res]) => {
        this.table.setCache({
          isFuzzy,
          keyword
        })

        if (totalRes.data) {
          res.data = res.data.concat(totalRes.data)
        }
        let listData = []
        if (res.data?.length) {
          listData = res.data.map(item => ({
            api_method: item.data.api_method,
            api_path: item.data.api_path,
            api_status: item.data.api_status,
            api_calls: this.formatNum(item.data.api_calls),
            time_of_api_last_used: this.formatDate(item.data.time_of_api_last_used),
            res_rows: this.formatNum(item.data.res_rows),
            req_bytes: this.dataSize(item.data.req_bytes),
            res_bytes: this.dataSize(item.data.res_bytes),
            total_call_time: ((item.data.total_call_time || 0) / 1000).toFixed(3),
            avg_call_time: (item.data.avg_call_time || 0).toFixed()
          }))
        }
        res.data = listData

        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    // api
    makeApiInfo: function (m, p, s) {
      if (p == 'T O T A L :') {
        return (p = this.$t('api_asnalysis_total'))
      } else {
        return `<span class="${s}"></span> ${m}<br>${p}`
      }
    },
    // 数字处理
    formatNum(str) {
      var newStr = ''
      var count = 0
      // 当数字是整数

      if (str !== 'undefined' || str !== undefined) {
        if (str > 1000) {
          str = str.toString()

          if (str.indexOf('.') == -1) {
            for (var i = str.length - 1; i >= 0; i--) {
              if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + ',' + newStr
              } else {
                newStr = str.charAt(i) + newStr
              }
              count++
            }
            str = newStr //自动补小数点后两位+".00"
            return str
          }
          // 当数字带有小数
          else {
            for (let i = str.indexOf('.') - 1; i >= 0; i--) {
              if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + ',' + newStr
              } else {
                newStr = str.charAt(i) + newStr //逐个字符相接起来
              }
              count++
            }
            str = newStr + (str + '00').substr((str + '00').indexOf('.'), 3)
            return str
          }
        } else {
          return str
        }
      }
    },
    // 时间换算
    formatDate(params) {
      if (!params || params == '') {
        return ''
      }

      switch (this.$t('button_help')) {
        case '帮助':
          this.$moment.updateLocale('en', {
            relativeTime: {
              future: '差 %s',
              past: '%s 以前',
              s: '几秒',
              ss: '%d 秒',
              m: '1分钟',
              mm: '%d 分钟',
              h: '1小时',
              hh: '%d 小时',
              d: '1天',
              dd: '%d 天',
              M: '1月',
              MM: '%d 月',
              y: '1年',
              yy: '%d 年'
            }
          })
          // moment.locale("zh-cn");

          break
        case '幫助':
          this.$moment.updateLocale('en', {
            relativeTime: {
              future: '差 %s',
              past: '%s 以前',
              s: '幾秒',
              ss: '%d 秒',
              m: '1分鐘',
              mm: '%d 分鐘',
              h: '1小時',
              hh: '%d 小時',
              d: '1天',
              dd: '%d 天',
              M: '1月',
              MM: '%d 月',
              y: '1年',
              yy: '%d 年'
            }
          })
          break

        default:
          this.$moment.updateLocale('en', {
            relativeTime: {
              future: 'in %s',
              past: '%s ago',
              s: 'a few seconds',
              ss: '%d seconds',
              m: 'a minute',
              mm: '%d minutes',
              h: 'an hour',
              hh: '%d hours',
              d: 'a day',
              dd: '%d days',
              M: 'a month',
              MM: '%d months',
              y: 'a year',
              yy: '%d years'
            }
          })
          break
      }
      return this.$moment(params).fromNow()
    },
    // 单位换算
    dataSize(bytes) {
      let num = bytes
      num = Number(num)

      let unit = ''

      if (num < 1024) {
        unit = 'B'
        return num + ' ' + unit
      } else {
        unit = 'KB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'MB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'GB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'TB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'PB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'EB'
        num = num / 1024
      }

      if (num > 1024) {
        unit = 'ZB'
        num = num / 1024
      }

      return num.toFixed(3) + ' ' + unit
    },
    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'clientName'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.api-analysis-wrap {
  height: 100%;
  .api-analysis-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .btn + .btn {
      margin-left: 5px;
    }
  }
}
</style>
<style lang="scss">
.api-analysis-wrap {
  .api-analysis-table-apiname {
    span {
      display: inline-block;
      height: 10px;
      width: 10px;
      border-radius: 50%;
    }
    .pending {
      background-color: red;
    }
    .active {
      background-color: green;
    }
  }
}
</style>
