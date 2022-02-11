<template>
  <div>
    <el-table border max-height="480" v-loading="loading" :data="list">
      <el-table-column :label="$t('dkDashboard.from')">
        <template slot-scope="scope">
          <span>{{ scope.row.data.name || $t('dkDashboard.unknown') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dkDashboard.record')">
        <template slot-scope="scope">
          <span>{{ formatNum(scope.row.data.total_record) || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dkDashboard.dataSize')">
        <template slot-scope="scope">
          <span>{{ handleSize(scope.row.data.total_data_size) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dkDashboard.outCount')">
        <template slot-scope="scope">
          <span>{{ formatNum(scope.row.data.total_violation) || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dkDashboard.outRate')">
        <template slot-scope="scope">
          <span>{{ handleDecimals(scope.row.data.total_violation / scope.row.data.total_record) }}%</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="
        size => {
          pagination.size = size
          pagination.current = 1
          getList()
        }
      "
      @current-change="
        current => {
          pagination.current = current
          getList()
        }
      "
      :current-page="pagination.current"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      background
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 翻页配置
      pagination: {
        current: 1, // 当前页码
        size: 10, // 每页条数
        total: 0, // 总数
        sortBy: 'data.total_record', // 按哪个字段排序
        descending: true // 是否降序
      },
      list: [], // 状态列表
      loading: false // 状态列表加载中
    }
  },
  methods: {
    // 获取状态列表数据
    getList() {
      let { sortBy, descending, current, size } = this.pagination
      let params = {
        filter: {
          where: {
            stats_name: 'api_stats',
            stats_granularity: 'minute'
          },
          limit: size,
          skip: (current - 1) * size
        }
      }
      const sortRule = descending ? 'DESC' : 'ASC'
      if (sortBy) {
        params.filter.order = `${sortBy} ${sortRule}`
      }

      this.loading = true
      Promise.all([this.$api('insights').get(params), this.$api('insights').count({ where: params.filter.where })])
        .then(([{ data: data1 }, { data: data2 }]) => {
          this.pagination.total = data2.count || 0
          let list = data1 || []

          // 添加当页汇总数据
          if (list.length) {
            let total = {
              name: this.$t('dkDashboard.gather'),
              total_data_size: 0,
              total_record: 0,
              total_violation: 0
            }
            list.forEach(v => {
              if (v.data) {
                total.total_data_size += v.data.total_data_size || 0
                total.total_record += v.data.total_record || 0
                total.total_violation += v.data.total_violation || 0
              }
            })
            list.push({
              data: total
            })
          }

          this.list = list
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 转百分数，且保留两位小数
    handleDecimals(num) {
      let data = Number(num)
      if (data) {
        return Number(data * 100).toFixed(2)
      } else {
        return '0.00'
      }
    },
    // 数据处理，每三位中间加个","
    formatNum(num) {
      if (Number(num) && num > 1000) {
        let str = String(num)
        let newStr = ''
        let count = 0
        if (str.indexOf('.') == -1) {
          for (let i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
              newStr = str.charAt(i) + ',' + newStr
            } else {
              newStr = str.charAt(i) + newStr
            }
            count++
          }
          str = newStr //自动补小数点后两位+".00"
          return newStr
        } else {
          // 当数字带有小数
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
        return num
      }
    },
    // 容量大小转换
    handleSize: function (num) {
      num = Number(num)
      if (!num) return 0

      let unit = ''

      if (num < 1024) {
        unit = 'Byte'
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

      return num.toFixed(0) + unit
    }
  },
  created() {
    this.getList()
  }
}
</script>
