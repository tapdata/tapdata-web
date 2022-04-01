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
          <div class="font-color-sub">{{ $moment(detailData.logTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
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
          <div class="title fs-8">{{ $t('share_detail_incremental_play') }}</div>
          <div class="time py-4 fs-4 text-primary">{{ replicateLag }}</div>
          <div class="text-muted">{{ $t('share_detail_incremental_time') }}：{{ formatTime(detailData.cdcTime) }}</div>
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
          <span>{{ $moment(scope.row.sourceTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
        <template slot="syncTimestamp" slot-scope="scope">
          <span> {{ $moment(scope.row.syncTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
        <template slot="status" slot-scope="scope">
          <span :class="['status-' + scope.row.status, 'status-block']">
            {{ $t('task_preview_status_' + scope.row.status) }}
          </span>
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
import { formatTime, formatMs } from '@/utils/util'
import DatetimeRange from '@/components/filter-bar/DatetimeRange'
export default {
  name: 'Info',
  components: { Chart, TableList, DatetimeRange },
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
          type: 'time'
        },
        yAxis: [
          {
            // max: 'dataMax',
            name: 'QPS',
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
          // left: 0,
          right: '8px',
          top: '24px',
          bottom: '30px'
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
      tableNameTotal: 0,
      replicateLag: 0,
      timer: null //定时器
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
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
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
          this.getMeasurement()
        })
    },
    getTables() {
      this.tableDialogVisible = true
      this.getTableNames()
    },
    getMeasurement() {
      let params = {
        samples: [
          {
            tags: {
              subTaskId: this.detailData.subTaskId,
              type: 'subTask'
            },
            fields: ['inputQPS', 'outputQPS'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            start: this.timeRange?.[0], //optional
            end: this.timeRange?.[1], //optional
            limit: 10, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: 'minute'
          }
        ],
        statistics: [
          {
            tags: {
              subTaskId: this.detailData.subTaskId,
              type: 'subTask'
            },
            fields: ['replicateLag']
          }
        ]
      }
      this.$api('Measurement')
        .query(params)
        .then(res => {
          let data = res?.data
          let { samples } = data
          samples.forEach(el => {
            for (let key in el) {
              el[key] = el[key].reverse()
            }
          })
          let statistics = data.statistics?.[0] || {}
          this.replicateLag = statistics.replicateLag || 0
          // 折线图
          const qpsData = samples[0] || {}
          let { inputQPS = [], outputQPS = [] } = qpsData
          let qpsDataTime = qpsData.time || []
          // 空数据，需要模拟时间点
          if (!qpsDataTime.length) {
            qpsDataTime = this.getEmptyData(params.samples[0].start, params.samples[0].end)
          }

          let xArr = qpsDataTime.map(t => formatTime(t, 'YYYY-MM-DD HH:mm:ss.SSS')) // 时间不在这里格式化.map(t => formatTime(t))
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
    },
    resetTimer() {
      let ms = 60 * 1000
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.getMeasurement()
      }, ms)
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
    getEmptyData(start, end) {
      let result = []
      let startTimeStamp = start || new Date().getTime()
      let endTimeStamp = end || new Date().getTime()
      let diff = endTimeStamp - startTimeStamp
      let timeSpacing = this.getTimeSpacing(this.getGuanluary(diff))
      for (let i = start; i < endTimeStamp; i += timeSpacing) {
        result.push(i)
      }
      return result.slice(1)
    },
    getGuanluary(val, format) {
      let diff = val / 1000
      let timeType
      let formatRes = ''
      // <= 1h(1 * 60 * 60s) --> minute, second point, max 60 * 12 = 720
      // <= 12h(12 * 60 * 60s) --> hour, minute point, max 12 * 60 = 720
      // <= 30d(30 * 24 * 60 * 60s) --> day, hour point, max 24 * 30 = 720
      // <= 24m+ --> month, day point, max 30 * 24 = 720
      if (diff <= 1 * 60 * 60) {
        timeType = 'minute'
        formatRes = 'YYYY-MM-DD HH:mm:ss'
      } else if (diff <= 12 * 60 * 60) {
        timeType = 'hour'
        formatRes = 'YYYY-MM-DD HH:mm'
      } else if (diff <= 30 * 24 * 60 * 60) {
        timeType = 'day'
        formatRes = 'YYYY-MM-DD HH:00'
      } else {
        timeType = 'month'
        formatRes = 'YYYY-MM-DD'
      }
      if (format) {
        return formatRes
      }
      return timeType
    },
    getTimeSpacing(type) {
      // <= 1h(1 * 60 * 60s) --> minute, second point, max 60 * 12 = 720 period 5s
      // <= 12h(12 * 60 * 60s) --> hour, minute point, max 12 * 60 = 720 period 1m
      // <= 30d(30 * 24 * 60 * 60s) --> day, hour point, max 24 * 30 = 720 period 1h
      // <= 24m+ --> month, day point, max 30 * 24 = 720 period 1d
      let result = ''
      switch (type) {
        case 'minute':
          result = 5 * 1000
          break
        case 'hour':
          result = 1 * 60 * 1000
          break
        case 'day':
          result = 1 * 60 * 60 * 1000
          break
        case 'month':
          result = 1 * 24 * 60 * 60 * 1000
          break
      }
      return result
    },
    changeTimeRangeFnc() {
      this.getMeasurement()
      //this.resetTimer()
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
