<template>
  <div class="share-detail h-100 flex flex-column">
    <div class="share-detail-box share-detail-head flex justify-content-between fs-8">
      <div class="share-detail-head-left py-6 px-4">
        <div class="flex align-items-center">
          <span class="fw-sub mb-4 fs-7">{{ $t('share_detail_mining_info') }}</span>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-normal head-label font-color-light">{{ $t('share_detail_name') }}:</div>
          <ElTooltip effect="dark" :content="detailData.name" placement="top-start">
            <div class="name font-color-dark fw-normal">{{ detailData.name }}</div>
          </ElTooltip>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-normal head-label font-color-light">{{ $t('share_detail_log_mining_time') }}:</div>
          <div class="font-color-dark fw-normal">{{ formatTime(detailData.logTime) }}</div>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="fw-normal head-label font-color-light">{{ $t('share_detail_log_time') }}:</div>
          <div class="font-color-dark fw-normal">{{ detailData.storageTime }}</div>
        </div>
      </div>
      <div class="share-detail-head-center py-5 px-6" style="min-height: 250px">
        <div class="flex">
          <span class="label font-color-dark fs-8">{{ $t('share_detail_statistics_time') }}</span>
          <DatetimeRange
            v-model="timeRange"
            :range="2 * 365 * 24 * 60 * 60 * 1000"
            value-format="timestamp"
            class="filter-datetime-range ml-2"
            @change="changeTimeRangeFnc"
          ></DatetimeRange>
        </div>
        <!-- <Chart ref="chart" type="line" :extend="lineOptions" class="v-echart h-100"></Chart> -->
        <div class="flex flex-column flex-fill" style="height: 250px" v-loading="!lineDataDeep.x.length">
          <Chart ref="chart" type="line" :data="lineData" :options="lineOptions" class="type-chart h-100"></Chart>
        </div>
      </div>
      <div class="flex share-detail-head-right text-center p-6 pl-0">
        <div class="flex text-center bg-color-main w-100 h-100">
          <div class="box py-3">
            <div class="title fs-7 font-color-dark">{{ $t('share_detail_incremental_play') }}</div>
            <div class="time py-4 fs-2 text-primary">{{ getReplicateLagTime(replicateLag) }}</div>
            <div class="text-muted font-color-slight fs-8" v-if="detailData.cdcTime">
              {{ $t('share_detail_incremental_time') }}：{{ formatTime(detailData.cdcTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="share-detail-box share-detail-main mt-5 p-5 overflow-hidden">
      <VTable
        v-if="detailData"
        :data="detailData.taskList"
        :columns="columns"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="VTable"
      >
        <template slot="sourceTimestamp" slot-scope="scope">
          <span>{{ formatTime(scope.row.sourceTimestamp) }}</span>
        </template>
        <template slot="syncTimestamp" slot-scope="scope">
          <span> {{ formatTime(scope.row.syncTimestamp) }}</span>
        </template>
        <template slot="status" slot-scope="scope">
          <TaskStatus :task="scope.row" />
        </template>
        <template slot="operation" slot-scope="scope">
          <div class="operate-columns">
            <ElButton size="mini" type="text" @click="goDetail(scope.row)">{{ $t('button_check') }}</ElButton>
            <ElButton size="mini" type="text" @click="getTables(scope.row.id)">{{
              $t('share_detail_button_table_info')
            }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>
    <el-dialog
      width="400px"
      custom-class="edit-dialog"
      :title="$t('share_detail_title')"
      :close-on-click-modal="false"
      :visible.sync="tableDialogVisible"
    >
      <VTable
        :data="tableNameList"
        :columns="columnsTableName"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="tableName"
      >
      </VTable>
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
import i18n from '@/i18n'

import { Chart, DatetimeRange, VTable } from '@tap/component'
import { formatMs } from '@/utils/util'
import dayjs from 'dayjs'
import { measurementApi, logcollectorApi } from '@tap/api'
import { TaskStatus, makeStatusAndDisabled } from '@tap/business'

export default {
  name: 'Info',
  components: { Chart, VTable, DatetimeRange, TaskStatus },
  data() {
    return {
      id: '',
      detailData: '',
      statisticsTime: [],
      lineData: {
        x: [],
        y: [[], []]
      },
      lineDataDeep: {
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
          show: false
        },
        xAxis: {
          type: 'time'
        },
        yAxis: [
          {
            // max: 'dataMax',
            // name: 'QPS',
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
          right: 0,
          top: '24px',
          bottom: 0
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
            // type: 'line',
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
            // type: 'line',
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
          label: i18n.t('modules_header_tablename'),
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
    formatTime(date, f = 'YYYY-MM-DD HH:mm:ss') {
      return dayjs(date).format(f)
    },
    formatMs(ms) {
      return formatMs(ms)
    },

    getData(id) {
      logcollectorApi.getDetail(id).then(data => {
        let detailData = data || {}
        detailData.taskList = detailData.taskList?.map(makeStatusAndDisabled)
        this.detailData = detailData
        this.getMeasurement()
      })
    },
    getTables(id) {
      this.tableDialogVisible = true
      this.getTableNames(id)
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
      let start = this.timeRange?.[0]
      let end = this.timeRange?.[1]
      if (!(start && !isNaN(start)) && !(end && !isNaN(end))) {
        // 默认最近一分钟范围
        start = Date.now() - 60 * 1000
      }
      if (start && !isNaN(start)) {
        params.samples[0].start = start
      } else {
        start = Date.now() - 60 * 1000
      }
      if (end && !isNaN(end)) {
        params.samples[0].end = end
      } else {
        end = undefined
      }
      let diff = (end || Date.now()) - start
      params.samples[0].guanluary = this.getGuanluary(diff)
      let guanluaryFormat = this.getGuanluary(diff, true)
      measurementApi.query(params).then(data => {
        let { samples } = data || {}
        samples.forEach(el => {
          for (let key in el) {
            el[key] = el[key].reverse()
          }
        })
        let statistics = data.statistics?.[0] || {}
        this.replicateLag = statistics.replicateLag || 0
        // 折线图
        const qpsData = samples?.[0] || {}
        let { inputQPS = [], outputQPS = [] } = qpsData
        let qpsDataTime = qpsData?.time || []

        let xArr = qpsDataTime.map(t => this.formatTime(t, 'YYYY-MM-DD HH:mm:ss.SSS')) // 时间不在这里格式化.map(t => formatTime(t))
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
        // eslint-disable-next-line
        console.log(i18n.t('daas_shared_mining_detail_wajuexiangqingx'), this.lineDataDeep.x.length, xArr)
        xArr.forEach((el, index) => {
          if (!this.lineDataDeep.x.includes(el)) {
            this.lineDataDeep.x.push(el)
            this.lineDataDeep.y[0].push(inArr[index])
            this.lineDataDeep.y[1].push(outArr[index])
          }
        })
        this.$nextTick(() => {
          this.$refs.chart?.chart?.setOption({
            // Object.assign(this.lineOptions, {
            //   xAxis: {
            //     data: xArr
            //   },
            xAxis: {
              axisLabel: {
                formatter: val => {
                  return this.formatTime(val, guanluaryFormat)
                }
              }
            },
            series: [
              {
                data: Object.assign([], this.lineDataDeep.y[0])
              },
              {
                data: Object.assign([], this.lineDataDeep.y[1])
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
    goDetail(row) {
      if (row?.syncType === 'migrate') {
        this.$router.push({
          name: 'MigrationMonitor',
          params: {
            id: row.id
          }
        })
      } else {
        this.$router.push({
          name: 'TaskMonitor',
          params: {
            id: row.id
          }
        })
      }
    },
    getGuanluary(val, format) {
      let diff = val / 1000
      let timeType
      let formatRes = ''
      // <= 1h(1 * 60 * 60s) --> minute, second point, max 60 * 12 = 720 period 5s
      // <= 12h(12 * 60 * 60s) --> hour, minute point, max 12 * 60 = 720 period 1m
      // <= 30d(30 * 24 * 60 * 60s) --> day, hour point, max 24 * 30 = 720 period 1h
      // <= 24m+ --> month, day point, max 30 * 24 = 720 period 1d
      if (diff <= 1 * 60 * 60) {
        timeType = 'minute'
        formatRes = 'HH:mm:ss'
      } else if (diff <= 12 * 60 * 60) {
        timeType = 'hour'
        formatRes = 'MM-DD HH:mm'
      } else if (diff <= 30 * 24 * 60 * 60) {
        timeType = 'day'
        formatRes = 'MM-DD HH:00'
      } else {
        timeType = 'month'
        formatRes = 'YYYY-MM-DD'
      }
      if (format) {
        return formatRes
      }
      return timeType
    },
    changeTimeRangeFnc() {
      this.getMeasurement()
    },
    getReplicateLagTime(val) {
      if (val < 1000) {
        return '<1' + this.$t('task_info_s')
      } else if (val > 24 * 60 * 60 * 1000) {
        return '>1' + this.$t('task_info_d')
      }
      return formatMs(val, 'time')
    },
    getTableNames(callSubId) {
      let filter = {
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize
      }
      logcollectorApi.newTableNames(this.detailData.id, callSubId, filter).then(data => {
        this.tableNameList = data?.items || []
        this.tableNameTotal = data?.total || 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.share-detail {
  .share-detail-box {
    // &.share-detail-head {
    //   height: 300px;
    // }
    width: 100%;
    background-color: map-get($bgColor, white);
    border-radius: 4px;
    .share-detail-head-left {
      width: 260px;
      border-right: 1px solid map-get($borderColor, light);
      .head-label {
        min-width: 100px;
      }
      .name {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .share-detail-head-center {
      width: 100%;
      .label {
        width: 70px;
        line-height: 32px;
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
      overflow: hidden;
      & > div {
        align-items: center;
        justify-content: center;
      }
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
