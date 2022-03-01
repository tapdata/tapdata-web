<template>
  <div class="share-detail section-wrap">
    <div class="share-detail-box share-detail-head flex justify-content-between fs-8">
      <div class="share-detail-head-left">
        <div class="flex align-items-center mb-2">
          <span class="fw-bold mb-4 fs-7">{{ $t('share_detail_mining_info') }}</span>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-bold head-label">{{ $t('share_detail_name') }}:</div>
          <div class="font-color-sub">{{ detailData.name }}</div>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-bold head-label">{{ $t('share_detail_log_mining_time') }}:</div>
          <div class="font-color-sub">{{ detailData.logTime }}</div>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-bold head-label">{{ $t('share_detail_log_time') }}:</div>
          <div class="font-color-sub">{{ detailData.storageTime }}</div>
        </div>
      </div>
      <div class="share-detail-head-center py-3" style="min-height: 250px">
        <div class="flex ml-3 pt-3">
          <span class="label fs-8">{{ $t('share_detail_statistics_time') }}</span>
          <DatetimeRange
            v-model="timeRange"
            value-format="timestamp"
            class="filter-datetime-range ml-2"
            @change="changeTimeRangeFnc"
          ></DatetimeRange>
        </div>
        <Chart ref="chart" type="line" :extend="lineOptions" class="v-echart h-100"></Chart>
      </div>
      <div class="flex share-detail-head-right text-center">
        <div class="box py-3 mt-2">
          <div class="title fs-8">增量延迟</div>
          <div class="time py-4 fs-4 text-primary">{{ detailData.delayTime }}</div>
          <div class="text-muted">增量所处时间点：{{ formatTime(detailData.cdcTime) }}</div>
        </div>
      </div>
    </div>
    <div class="share-detail-box share-detail-main mt-5 p-5">
      <TableList
        :data="detailData.taskList"
        :columns="columns"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="tableList"
      >
        <template slot="sourceTimestamp" slot-scope="scope">
          <span>{{ scope.row.sourceTimestamp }}</span>
        </template>
        <template slot="syncTimestamp" slot-scope="scope">
          <span>{{ scope.row.syncTimestamp }}</span>
        </template>
        <template slot="status" slot-scope="scope">
          <StatusTag type="text" target="shareCdc" :status="scope.row.status" only-img></StatusTag>
        </template>
        <template slot="operation" slot-scope="scope">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="goDetail(scope.row.id)">{{ $t('button_check') }}</ElButton>
            <ElButton size="mini" type="text" @click="getTables(scope.row.id)">{{
              $t('share_detail_button_table_info')
            }}</ElButton>
          </div>
        </template>
      </TableList>
    </div>
    <el-dialog
      width="400px"
      custom-class="edit-dialog"
      :title="$t('share_detail_title')"
      :close-on-click-modal="false"
      :visible.sync="tableDialogVisible"
    >
      <TableList
        :data="tableNameList"
        :columns="columnsTableName"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="tableName"
      >
      </TableList>
      <span slot="footer" class="dialog-footer">
        <el-pagination
          @current-change="getTableNames"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="tableNameTotal"
        >
        </el-pagination>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Chart from 'web-core/components/chart'
import TableList from '@/components/TableList'
import StatusTag from '@/components/StatusTag'
import { formatTime, formatMs, isEmpty } from '@/utils/util'
import DatetimeRange from '@/components/filter-bar/DatetimeRange'
export default {
  name: 'Info',
  components: { Chart, TableList, StatusTag, DatetimeRange },
  data() {
    return {
      id: '',
      detailData: '',
      statisticsTime: [],
      lineData: {
        x: [],
        y: [[], []]
      },
      loading: true,
      task: {},
      lineOptions: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 4,
          right: 0,
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: [
          {
            // max: 'dataMax',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          },
          {
            // max: 'dataMax',
            axisLabel: {
              formatter: function (value) {
                if (value >= 1000) {
                  value = value / 1000 + 'K'
                }
                return value
              }
            }
          }
        ],
        grid: {
          left: 0,
          right: '2px',
          top: '24px',
          bottom: '24px'
        },
        series: [
          {
            name: this.$t('task_info_input'),
            lineStyle: {
              color: 'rgba(24, 144, 255, 1)',
              width: 1
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.2)'
            },
            symbol: 'none',
            itemStyle: {
              color: 'rgba(24, 144, 255, 1)'
            },
            type: 'line',
            data: []
          },
          {
            name: this.$t('task_info_output'),
            lineStyle: {
              color: 'rgba(118, 205, 238, 1)',
              width: 1
            },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(118, 205, 238, 0.2)'
            },
            itemStyle: {
              color: 'rgba(118, 205, 238, 1)'
            },
            type: 'line',
            data: []
          }
        ]
      },
      activeTab: 'schedule',
      showContent: false,
      field_process: [],
      operations: ['start', 'stop', 'forceStop'],
      columnsTableName: [
        {
          label: '表名称',
          prop: 'tablename'
        }
      ],
      columns: [
        {
          label: this.$t('share_detail_call_task'),
          prop: 'name'
        },
        {
          label: this.$t('share_detail_source_time'),
          slotName: 'sourceTimestamp'
        },
        {
          label: this.$t('share_detail_sycn_time_point'),
          slotName: 'syncTimestamp'
        },
        {
          label: this.$t('share_detail_mining_status'),
          slotName: 'status'
        },
        {
          label: this.$t('column_operation'),
          prop: 'operation',
          slotName: 'operation'
        }
      ],
      tableDialogVisible: false,
      timeRange: [], //时间范围
      tableNameList: [],
      currentPage: 1,
      pageSize: 20,
      tableNameTotal: 0
    }
  },
  computed: {
    connectionIds() {
      return (
        this.task?.stages?.map(item => {
          return item.connectionId
        }) || []
      )
    }
  },
  created() {
    this.id = this.$route.params.id
    this.getData(this.id)
  },
  mounted() {
    this.getChartData(this.id)
  },
  destroyed() {
    this.$ws.off('watch', this.taskChange)
  },
  methods: {
    formatTime(date) {
      return formatTime(date)
    },
    formatMs(ms) {
      return formatMs(ms)
    },
    getData(id) {
      this.$api('logcollector')
        .getDetail(id)
        .then(res => {
          this.detailData = res?.data
        })
    },
    getTables() {
      this.tableDialogVisible = true
      this.getTableNames()
    },
    getChartData() {
      let params = {
        samples: [
          {
            tags: {
              subTaskId: this.id,
              type: 'subTask'
            },
            fields: ['inputQPS', 'outputQPS'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            start: '', //optional
            end: '', //optional
            limit: 10, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: 'minute'
          }
        ],
        statistics: [
          {
            tags: {
              subTaskId: this.id,
              type: 'subTask'
            },
            fields: ['replicateLag']
          }
        ]
      }
      this.$api('Measurement')
        .query(params)
        .then(res => {
          let data = res.data
          let { samples } = data
          samples.forEach(el => {
            for (let key in el) {
              el[key] = el[key].reverse()
            }
          })
          const countObj = samples?.[1] || {}
          const statistics = data.statistics?.[0] || {}
          const { overData, writeData } = this
          // 总输入总输出
          if (!isEmpty(countObj)) {
            for (let key in overData) {
              let val0 = countObj[key]?.[0] || 0
              let val1 = countObj[key]?.[1] || 0
              overData[key] += val1 - val0
            }
          }
          for (let key in writeData) {
            writeData[key] = statistics[key]
          }
          // 全量预计完成时间
          this.initialData.length >= 2 && this.initialData.shift()
          this.initialData.push(
            Object.assign(
              {
                time: new Date().getTime()
              },
              writeData
            )
          )
          if (this.initialData.length >= 2) {
            const getForecastMs = this.getForecastMs(this.initialData)
            if (getForecastMs) {
              this.forecast = getForecastMs
            }
          }
          // 折线图
          const qpsData = samples[0] || {}
          let { inputQPS = [], outputQPS = [] } = qpsData
          let qpsDataTime = qpsData.time || []
          // 空数据，需要模拟时间点
          if (!qpsDataTime.length) {
            qpsDataTime = this.getEmptyData(params.samples[0].start, params.samples[0].end)
          }

          let xArr = qpsDataTime.map(t => formatTime(t, 'YYYY-MM-DD HH:mm:ss.SSS')) // 时间不在这里格式化.map(t => formatTime(t))
          const xArrLen = xArr.length
          if (this.lineDataDeep.x.length > 20) {
            this.lineDataDeep.x.splice(0, xArrLen)
            this.lineDataDeep.y[0].splice(0, xArrLen)
            this.lineDataDeep.y[1].splice(0, xArrLen)
          }
          let inArr = []
          let outArr = []
          xArr.forEach((el, i) => {
            let time = el
            inArr.push({
              name: time,
              value: [time, inputQPS[i]]
            })
            outArr.push({
              name: time,
              value: [time, outputQPS[i]]
            })
          })
          console.log('x轴：', this.lineDataDeep.x.length, xArr)
          xArr.forEach((el, index) => {
            if (!this.lineDataDeep.x.includes(el)) {
              this.lineDataDeep.x.push(el)
              this.lineDataDeep.y[0].push(inArr[index])
              this.lineDataDeep.y[1].push(outArr[index])
            }
          })
          this.$nextTick(() => {
            Object.assign(this.lineOptions, {
              xAxis: {
                data: xArr
              },
              series: [
                {
                  data: inArr
                },
                {
                  data: outArr
                }
              ]
            })
          })
        })
      // let data = [
      //   {
      //     logTime: '2022-02-18T06:50:12.109Z',
      //     inputQps: 66,
      //     outputQps: 435
      //   },
      //   {
      //     logTime: '2022-02-19T06:50:12.109Z',
      //     inputQps: 1000,
      //     outputQps: 900
      //   }
      // ]
      // let xArr = data.map(t => formatTime(t.logTime)) //x轴
      // let inArr = data.map(t => t.inputQps)
      // let outArr = data.map(t => t.outputQps)
      // let inArr = data.map(t => {
      //   return {
      //     name: t.logTime,
      //     value: [t.logTime, t.inputQps]
      //   }
      // })
      // let outArr = data.map(t => {
      //   return {
      //     name: t.logTime,
      //     value: [t.logTime, t.outputQps]
      //   }
      // })
    },
    goDetail(id) {
      this.$router.push({
        name: 'dataflowStatistics',
        params: {
          id: this.detailData.id,
          subId: id
        }
      })
    },
    changeTimeRangeFnc() {
      this.resetTimer()
    },
    getTableNames() {
      let filter = {
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize
      }
      this.$api('logcollector')
        .tableNames(this.detailData.id, filter)
        .then(res => {
          this.tableNameList = res?.data?.items
          this.tableNameTotal = res?.data?.total
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.share-detail {
  width: 100%;
  padding: 0 20px 20px;
  background-color: #eff1f4;
  .share-detail-box {
    // &.share-detail-head {
    //   height: 300px;
    // }
    width: 100%;
    background: #fff;
    border-radius: 4px;
    .share-detail-head-left {
      min-width: 240px;
      padding: 20px;
      border-right: 1px solid #f2f2f2;
      .head-label {
        width: 100px;
      }
    }
    .share-detail-head-center {
      .label {
        width: 70px;
        line-height: 28px;
      }
      ::v-deep {
        .el-date-editor {
          width: 300px;
        }
        .el-range-input {
          width: 120px;
        }
      }
    }
    .share-detail-head-right {
      min-width: 240px;
      align-items: center;
    }
  }
  .share-detail-main {
    flex: 1;
    .filter-datetime-range {
      font-size: 12px;
      line-height: 32px;
      ::v-deep {
        font-size: 12px;
        .el-input {
          font-size: 12px;
        }
      }
    }
  }
  .statistics-container {
    font-size: 12px;
    overflow-y: auto;
  }
  .card-box {
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    ::v-deep {
      .el-tab-pane {
        min-height: 400px;
      }
      .field-mapping {
        min-height: 400px;
        .task-form-body {
          max-height: 350px;
        }
      }
    }
  }
  .card-box__info {
    border-bottom: 1px solid #e4e7ed;
  }
  .card-box__content {
    padding-left: 24px;
    //height: 0;
    ::v-deep {
      .el-tabs__content {
        overflow-y: auto;
      }
    }
  }
  .filter-datetime-range {
    font-size: 12px;
    line-height: 32px;
    ::v-deep {
      font-size: 12px;
      .el-input {
        font-size: 12px;
      }
    }
  }
}
</style>
