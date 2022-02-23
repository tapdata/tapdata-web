<template>
  <div class="share-detail">
    <div class="share-detail-box flex justify-content-between fs-8">
      <div class="share-detail-head-left">
        <div class="flex align-items-center mb-2">
          <span class="mb-4 fs-7">{{ $t('share_detail_mining_info') }}</span>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="head-label">{{ $t('share_detail_name') }}:</div>
          <div class="font-color-sub">{{ detailData.name }}</div>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="head-label">{{ $t('share_detail_log_mining_time') }}:</div>
          <div class="font-color-sub">{{ detailData.logTime }}</div>
        </div>
        <div class="flex justify-content-start mb-4 text-left fs-8">
          <div class="head-label">{{ $t('share_detail_log_time') }}:</div>
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
        <Chart type="line" :data="lineData" :options="lineOptions" no-x="second" class="v-echart h-100"></Chart>
      </div>
      <div class="flex share-detail-head-right text-center">
        <div class="box py-3 mt-2">
          <div class="title fs-8">增量延迟</div>
          <div class="time py-4 fs-4 text-primary">{{ detailData.delayTime }}</div>
          <div class="text-muted">增量所处时间点：{{ formatTime(detailData.cdcTime) }}</div>
        </div>
      </div>
    </div>
    <div class="share-detail-box mt-5 p-5">
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
            <ElButton size="mini" type="text" @click="getTables()">{{ $t('share_detail_button_table_info') }}</ElButton>
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
        :data="detailData.tableName"
        :columns="columnsTableName"
        :remote-data="id"
        height="100%"
        :has-pagination="false"
        ref="tableName"
      >
      </TableList>
      <template slot="name" slot-scope="scope">
        <span>{{ scope.row }}</span>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="tableDialogVisible = false" size="mini">{{ $t('button_close') }}</el-button>
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
          type: 'time'
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
          slotName: 'name'
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
      timeRange: [] //时间范围
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
    },
    getChartData() {
      let filter = {
        where: {
          id: id,
          startTime: '',
          endTime: ''
        }
      }
      this.$api('logcollector')
        .getChart()
        .then(res => {
          //this.chartData = res?.data
          let data = [
            {
              logTime: '2022-02-18T06:50:12.109Z',
              inputQps: 1000,
              outputQps: 900
            },
            {
              logTime: '2022-02-18T06:50:12.109Z',
              inputQps: 1000,
              outputQps: 900
            }
          ]
          let xArr = data.map(t => formatTime(t.logTime)) //x轴
          let inArr = data.map(t => t.inputQps)
          let outArr = data.map(t => t.outputQps)

          this.$refs.chart.chart?.setOption({
            series: [
              {
                data: inArr
              },
              {
                data: outArr
              }
            ],
            xAxis: {
              data: xArr
            }
          })
        })
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
      this.getMeasurement(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.share-detail {
  width: 100%;
  padding: 0 20px;
  background-color: #eff1f4;
  .share-detail-box {
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
}
.statistics-container {
  font-size: 12px;
  overflow-y: auto;
}
.card-box {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  ::v-deep {
    .table-list {
      //height: 300px;
    }
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
</style>
