<template>
  <section class="dashboard-wrap px-5 mx-n5">
    <div v-loading="loading" class="dashboard-main">
      <template v-if="noPermission">
        <el-row :gutter="20" class="dashboard-row mb-5" v-readonlybtn="'Data_SYNC_menu'">
          <el-col :span="6" v-for="item in taskList" :key="item.name" class="dashboard-col">
            <div class="dashboard-col-box">
              <div class="fs-7 font-color-normal">{{ $t('dashboard_' + item.key) }}</div>
              <div class="dashboard-label fs-5 pt-4 text-center fw-sub font-color-normal">
                {{ $t('dashboard_current_' + item.key) }}
              </div>
              <div
                :class="[
                  'dashboard-num',
                  'pt-4',
                  'pb-2',
                  'text-center',
                  'din-font',
                  { 'cursor-pointer': item.key === 'copy_total' || item.key === 'sync_total' }
                ]"
                @click="handleTask(item)"
              >
                {{ item.value }}
              </div>
            </div>
          </el-col>
        </el-row>
        <!-- 复制任务概览 -->
        <el-row :gutter="20" class="dashboard-row mb-5" v-readonlybtn="'Data_SYNC_menu'">
          <el-col :span="12" class="dashboard-col col">
            <div class="charts-list flex flex-row">
              <div class="charts-list-text">
                <div class="fs-7 font-color-normal">{{ $t('dashboard_copy_overview_title') }}</div>
                <ul class="job-list">
                  <li v-for="task in migrationTaskList" :key="task.label" @click="handleStatus(task.label)">
                    <i class="dots mr-3" :style="`background-color: ${colorMap[task.label]};`"></i>
                    <span class="fw-normal font-color-light">{{ task.name }}</span
                    ><span class="num pl-7 font-color-dark">{{ task.value }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="copyPieData.every(item => item.value === 0)"
                class="flex justify-content-center align-items-center w-100"
              >
                <div
                  class="flex justify-content-center align-items-center font-color-slight"
                  v-html="
                    $t('dashboard_no_statistics', [
                      '<span style=\'color: #2C65FF; padding: 0 5px;\'>' + $t('dashboard_copy_total') + '</span>'
                    ])
                  "
                ></div>
              </div>
              <div class="chart" v-else>
                <Chart type="pie" :extend="getPieOption(copyPieData)" class="type-chart"></Chart>
              </div>
            </div>
          </el-col>
          <el-col :span="12" class="dashboard-col col">
            <div class="charts-list flex flex-row">
              <div class="charts-list-text">
                <div class="fs-7 font-color-normal">{{ $t('dashboard_sync_overview_title') }}</div>
                <ul class="job-list">
                  <li v-for="task in syncTaskList" :key="task.label">
                    <i class="dots mr-3" :style="`background-color: ${colorMap[task.label]};`"></i>
                    <span class="fw-normal font-color-light">{{ task.name }}</span
                    ><span class="num pl-7 font-color-dark">{{ toThousandsUnit(task.value) }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="syncPieData.every(item => item.value === 0)"
                class="flex justify-content-center align-items-center w-100"
              >
                <div
                  class="flex justify-content-center align-items-center font-color-slight"
                  v-html="
                    $t('dashboard_no_statistics', [
                      '<span style=\'color: #2C65FF; padding: 0 5px;\'>' + $t('dashboard_sync_total') + '</span>'
                    ])
                  "
                ></div>
              </div>
              <div class="chart" v-else>
                <Chart type="pie" :extend="getPieOption(syncPieData)" class="type-chart"></Chart>
              </div>
            </div>
          </el-col>
        </el-row>
        <!-- 数据校验 -->
        <el-row :gutter="20" class="dashboard-row mb-5" v-if="syncValidFalg">
          <el-col :span="12" class="dashboard-col col" v-readonlybtn="'Data_verify_menu'">
            <div class="dashboard-col-box">
              <div class="fs-7 font-color-normal">{{ $t('dashboard_valid_title') }}</div>
              <div class="chart line-chart flex flex-column">
                <ul>
                  <li v-for="item in validBarData" :key="item.name">
                    <span class="font-color-light">{{ item.name }} </span>
                    <span class="font-color-dark fw-sub"> {{ item.value }}</span>
                  </li>
                </ul>
                <div
                  v-if="validBarData.every(item => item.value === 0)"
                  class="flex justify-content-center align-items-center h-100"
                >
                  <div
                    class="flex justify-content-center align-items-center font-color-slight"
                    v-html="
                      $t('dashboard_no_statistics', [
                        '<span style=\'color: #2C65FF; padding: 0 5px;\'>' + $t('dashboard_valid_title') + '</span>'
                      ])
                    "
                  ></div>
                </div>
                <Chart v-else type="bar" class="bar-chart" :data="validBarData" :options="barOptions"></Chart>
              </div>
            </div>
          </el-col>
          <el-col :span="12" class="dashboard-col col" v-readonlybtn="'Data_SYNC_menu'">
            <div class="charts-list flex flex-row">
              <div class="charts-list-text">
                <div class="fs-7 font-color-normal">{{ $t('dashboard_transfer_overview') }}</div>
                <ul class="job-list">
                  <li v-for="item in transBarData" :key="item.key">
                    <i class="dots mr-3" :style="`background-color: ${item.color};`"></i>
                    <span class="fw-normal font-color-light">{{ item.name }}</span
                    ><span class="num pl-7 font-color-dark">{{ toThousandsUnit(item.value) }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="transBarData.every(item => item.value === 0)"
                class="flex justify-content-center align-items-center w-100"
              >
                <div
                  class="flex justify-content-center align-items-center font-color-slight"
                  v-html="
                    $t('dashboard_no_statistics', [
                      '<span style=\'color: #2C65FF; padding: 0 5px;\'>' + $t('dashboard_transfer_overview') + '</span>'
                    ])
                  "
                ></div>
              </div>
              <div class="chart" v-else>
                <Chart type="pie" :extend="getPieOption(transBarData)" class="type-chart"></Chart>
              </div>
            </div>
          </el-col>
        </el-row>
        <!-- 服务器进程 -->
        <div class="dashboard-row dashboard-col col" v-readonlybtn="'Cluster_management_menu'">
          <div class="dashboard-col">
            <div class="dashboard-col-box">
              <div class="fs-7 font-color-normal">{{ $t('dashboard_server_title') }}</div>
              <el-row :gutter="20" v-if="serverTable.length">
                <el-col :span="12" class="server-list pt-3" v-for="item in serverTable" :key="item.id">
                  <div class="server-list-box">
                    <img src="../../assets/images/serve.svg" />
                    <!-- <img src="../../assets/icons/svg/serve.svg" alt="" /> -->
                    <div class="server-main ml-5">
                      <div class="title">{{ item.systemInfo.ip }}</div>

                      <ul class="flex pt-1">
                        <li class="pr-5">
                          <label class="font-color-slight pr-2">{{ $t('dashboard_management') }}</label>
                          <span :style="`color: ${colorServeMap[item.management.status]};`">{{
                            $t('dashboard_' + item.management.status)
                          }}</span>
                        </li>
                        <li class="pr-5">
                          <label class="font-color-slight pr-2">{{ $t('dashboard_task_transfer') }}</label>
                          <span :style="`color: ${colorServeMap[item.engine.status]};`">{{
                            $t('dashboard_' + item.engine.status)
                          }}</span>
                        </li>
                        <li>
                          <label class="font-color-slight pr-2">{{ $t('dashboard_api_service') }}</label>
                          <span :style="`color: ${colorServeMap[item.apiServer.status]};`">{{
                            $t('dashboard_' + item.apiServer.status)
                          }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <div v-else class="flex justify-content-center align-items-center h-100 py-4">
                <div
                  class="flex justify-content-center align-items-center font-color-slight"
                  v-html="
                    $t('dashboard_no_statistics', [
                      '<span style=\'color: #2C65FF; padding: 0 5px;\'>' + $t('dashboard_server_title') + '</span>'
                    ])
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="dashboard-wrap-box">
          <img src="../../assets/images/undraw_secure_files_re_6vdh.svg" />
          <div class="txt pt-4">{{ $t('dashboard_no_data_here') }}</div>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
import { Chart } from '@tap/component'
import { clusterApi, taskApi } from '@tap/api'
import { STATUS_MAP } from '@tap/business'
import { toThousandsUnit } from '@/utils/util'

export default {
  components: { Chart },
  data() {
    return {
      h: this.$createElement,
      copyPieData: [],
      copyTaskData: [],
      syncPieData: [],
      syncTaskData: [],
      validBarData: [],
      serverTable: [],
      migrationTaskList: [],
      syncTaskList: [],
      pieOptions: null,
      barOptions: {
        barWidth: 35,
        grid: {
          top: 20,
          bottom: 0,
          left: 0,
          right: 0
        },
        xAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(232, 232, 232, 0.75)'
            }
          },
          axisTick: {
            show: true,
            interval: 'auto'
          },
          axisLabel: {
            color: 'rgba(0,0,0,.65)'
          }
        },
        yAxis: {
          show: true,
          type: 'value',
          min: 1,
          logBase: 20,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#d9d9d9'
            }
          },
          axisLabel: {
            color: 'rgba(0,0,0,.65)'
          },
          splitLine: {
            onZero: true,
            show: true,

            lineStyle: {
              type: 'dashed'
            }
          }
        },
        tooltip: {
          trigger: 'item',
          borderWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: {
            color: '#fff',
            fontSize: 12,
            align: 'center'
          },
          formatter: params => {
            let item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }

            let html = params.name + `<span style="padding: 0 4px; text-align: center;"></span><br/>` + val
            return html
          }
        }
      },
      syncValidFalg: this.$has('Data_verify_menu') || this.$has('Data_SYNC_menu'),
      taskList: [
        { key: 'all_total', value: 0 },
        { key: 'copy_total', value: 0 },
        { key: 'sync_total', value: 0 },
        { key: 'valid_total', value: 0 }
      ],
      statusList: [
        { name: this.$t('dashboard_status_running'), label: 'running', value: 0 },
        { name: this.$t('dashboard_status_edit'), label: 'edit', value: 0 },
        { name: this.$t('status_ready'), label: 'wait_start', value: 0 },
        { name: this.$t('dashboard_status_stop'), label: 'stop', value: 0 },
        { name: this.$t('dashboard_status_complete'), label: 'complete', value: 0 },
        { name: this.$t('dashboard_status_error'), label: 'error', value: 0 }
      ],

      loading: false,
      migrationTotal: '',
      syncTotal: '',
      taskStatusStatistics: [
        { name: this.$t('app_Home_initialization'), value: 'initializing' },
        { name: this.$t('app_Home_loadingFinished'), value: 'initialized' },
        { name: this.$t('app_Home_incremental'), value: 'cdc' },
        { name: this.$t('app_Home_incrementalLag'), value: 'Lag' }
      ],
      colorMap: {
        running: '#82C647',
        paused: '#AE86C9',
        wait_run: '#AE86C9',
        edit: '#88DBDA',
        error: '#F7D762',
        stop: '#E6B450',
        complete: '#2EA0EA'
      },
      colorServeMap: {
        starting: '#409EFF',
        running: '#8DC47A',
        stopping: '#F97066',
        stopped: '#FDB01C'
      },
      syncType: {
        initial_sync: this.$t('dataFlow_initial_sync'),
        cdc: this.$t('dataFlow_cdc'),
        'initial_sync+cdc': this.$t('dataFlow_initial_sync') + '+' + this.$t('dataFlow_cdc')
      },

      transfer: {
        height: 360,
        isHeader: false,
        tableData: []
      },
      syncJobObj: {},
      migrationJobObj: {},
      syncJobStatusObj: {},
      migrationJobStatusObj: {},
      dataValidationObj: {}, //数据校验

      // 传输总览颜色
      transBarData: [
        { name: this.$t('dashboard_total_input'), value: 0, key: 'inputTotal', color: '#82C647' },
        { name: this.$t('dashboard_total_output'), value: 0, key: 'outputTotal', color: '#2EA0EA' },
        { name: this.$t('dashboard_total_insert'), value: 0, key: 'insertedTotal', color: '#AE86C9' },
        { name: this.$t('dashboard_total_update'), value: 0, key: 'updatedTotal', color: '#F7D762' },
        { name: this.$t('dashboard_total_delete'), value: 0, key: 'deletedTotal', color: '#88DBDA' }
      ],
      transBarOptions: {
        barWidth: '100%',
        series: [
          {
            labelFormat: 'KMT',
            fixed: 1
          }
        ]
      },
      serverProcess: {
        height: 360,
        isHeader: true,
        tableData: []
      },
      unitData: [],
      kbData: [],
      unitType: '',
      noPermission: this.$has('Data_SYNC_menu') || this.$has('Data_verify_menu') || this.$has('Cluster_management_menu')
    }
  },

  mounted() {
    if (this.$has('Data_SYNC') || this.$has('Data_verify')) {
      this.getDataFlowApi()
      // this.getMeasurement()
    }

    if (this.$has('Cluster_management') || this.$has('Cluster_management_menu')) {
      this.getClsterDataApi()
    }
  },
  methods: {
    toThousandsUnit,

    // 任务概览跳转页面
    handleTask(item) {
      if (item.key === 'copy_total') {
        this.$router.push({
          name: 'migrate'
        })
      } else if (item.key === 'sync_total') {
        this.$router.push({
          name: 'dataflowList'
        })
      }
    },
    handleStatus(status) {
      this.$router.push({
        name: 'migrate',
        query: {
          status: status
        }
      })
    },
    // 获取服务器与进程的数据
    getClsterDataApi() {
      let params = {
        type: 'dashboard'
      }
      clusterApi.get(params).then(data => {
        let items = data?.items || []
        this.serverProcess.tableData = items
        this.serverTable = items
      })
    },
    // 获取dataflows数据
    getDataFlowApi() {
      let self = this
      self.loading = true
      taskApi
        .chart()
        .then(data => {
          if (data) {
            let setColor = list => {
              return list.map(item => {
                item.itemStyle = {
                  color: this.colorMap[item.label]
                }
                return item
              })
            }
            // 全部数据
            let copy_total = data?.chart1?.total || 0
            let sync_total = data?.chart3?.total || 0
            let valid_total = data?.chart5?.total || 0

            let total = {
              all_total: copy_total + sync_total + valid_total,
              copy_total: copy_total,
              sync_total: sync_total,
              valid_total: valid_total
            }
            let result = []
            this.taskList.forEach(el => {
              result.push(
                Object.assign({}, el, {
                  value: total[el.key]
                })
              )
            })
            this.taskList = result

            self.migrationTaskList = data.chart1?.items
              ? self.handleDataProcessing(data.chart1.items, self.statusList)
              : []
            self.syncTaskList = data?.chart3 ? self.handleDataProcessing(data.chart3.items, self.statusList) : []

            console.log('STATUS_MAP', STATUS_MAP) // eslint-disable-line

            self.copyPieData = setColor(self.migrationTaskList)
            self.copyTaskData = this.handleChart(data.chart2)
            self.syncPieData = setColor(self.syncTaskList)
            self.syncTaskData = this.handleChart(data.chart4)
            self.validBarData = this.handleChart(data.chart5)
            self.transBarData = this.handleChart(data.chart6, self.transBarData)
          }
        })
        .finally(() => {
          self.loading = false
        })
    },

    // echart数据转换
    handleChart(data, originalData) {
      let echartData = []
      if (originalData?.length) {
        originalData.forEach(el => {
          for (let item in data) {
            if (el.key === item)
              echartData.push({
                name: el.name || this.$t('dashboard_' + item),
                value: data[item],
                color: el.color
              })
          }
        })
      } else {
        for (let item in data) {
          echartData.push({
            name: this.$t('dashboard_' + item),
            value: data[item],
            color: '#2EA0EA'
          })
        }
      }

      return echartData
    },

    // 数据处理
    handleDataProcessing(dataItem, statusData) {
      let statusItem = []
      if (dataItem?.length) {
        dataItem.sort((a, b) => (a._id > b._id ? 1 : a._id === b._id ? 0 : -1))
        statusData.forEach(item => {
          const $in = STATUS_MAP[item.label].in
          let total = 0
          if ($in?.length) {
            total = dataItem.reduce((total, item) => {
              if ($in.includes(item._id)) {
                total += item.count
              }
              return total
            }, total)
          } else {
            let dataObj = dataItem.find(element => item.label === element._id)
            dataObj && (total = dataObj.count)
          }
          statusItem.push({
            name: item.name,
            label: item.label,
            value: total
          })
        })
      } else {
        statusItem = statusData
      }
      return statusItem
    },

    getPieOption(data) {
      let dataName = []
      let total = 0
      let totalFalg = true
      let totalText = this.$t('dashboard_total')
      if (data?.length) {
        data.forEach(item => {
          dataName.push(item.name)
          total += parseFloat(item.value) * 1
        })
        totalFalg = data.some(item => item.value > 0)
        total = this.toThousandsUnit(total)
      }

      return {
        legend: {
          show: false
        },
        tooltip: {
          trigger: 'item',
          borderWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: {
            color: '#fff',
            fontSize: 12
          },
          formatter: params => {
            let item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }
            let html = `<div style="text-align: center;"> ${params.name}<div style="font-family: 'DIN'">${val}</div></div>`
            return html
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            stillShowZeroSum: totalFalg ? false : true,
            avoidLabelOverlap: false,
            zlevel: 1,
            label: {
              show: true,
              position: 'center',
              width: 60,
              height: 38,
              fontWeight: 'bold',
              backgroundColor: '#fff',
              formatter: `{name|${total}}\n{value|${totalText}}`,
              rich: {
                name: {
                  lineHeight: 24,
                  color: 'rgba(0, 0, 0, 0.85)',
                  fontSize: 16,
                  fontWeight: '400'
                },
                value: {
                  color: 'rgba(0, 0, 0, 0.43)',
                  fontSize: 12,
                  fontWeight: '400'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontWeight: 'bold',
                formatter: ({ name, value }) => {
                  return `{name|${this.toThousandsUnit(value)}}\n{value|${name}}`
                },
                width: 60,
                height: 34,
                rich: {
                  name: {
                    lineHeight: 24,
                    color: 'rgba(0, 0, 0, 0.85)',
                    fontSize: '16',
                    fontWeight: '400'
                  },
                  value: {
                    color: 'rgba(0, 0, 0, 0.43)',
                    fontSize: 12,
                    fontWeight: '400'
                  }
                }
              }
            },
            data: data
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-wrap {
  overflow-y: auto;
  background-color: #eff1f4;
  .dashboard-row {
    .dashboard-col {
      flex: 1;
      &.col {
        height: 210px;
        border-radius: 3px;
        box-sizing: border-box;
      }
      .dashboard-col-box {
        height: 100%;
        padding: 20px;
        border-radius: 4px;
        background-color: map-get($bgColor, white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
      }
      .dashboard-label {
        height: 48px;
      }
      .dashboard-num {
        font-size: 65px;
        color: map-get($color, primary);
      }
      .charts-list {
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        background-color: map-get($bgColor, white);
        border-radius: 3px;
        box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
        .charts-list-text {
          float: left;
          width: 40%;
          padding: 20px 30px 12px 20px;
        }
        .job-list {
          padding: 16px 30px 20px 60px;
          box-sizing: border-box;
          li {
            margin-bottom: 5px;
            cursor: pointer;
            white-space: nowrap;
            .dots {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
            .num {
              font-weight: 600;
            }
            span {
              display: inline-block;
              width: 50px;
              text-align: left;
              font-size: 12px;
              &::before {
                content: '';
              }
            }
          }
        }
        .chart {
          float: left;
          width: 55%;
          height: 210px;
        }
      }
      .server-list {
        .server-list-box {
          display: flex;
          flex: 1;
          padding: 5px 10px;
          border: 1px solid #d9d9d9;
          border-radius: 3px;
          img {
            width: 43px;
            height: 43px;
          }
          .server-main {
            .title {
              color: map-get($fontColor, dark);
              font-weight: 500;
            }
          }
        }
      }
      .line-chart {
        display: flex;
        flex-direction: column;
        height: 150px;
        ul {
          padding-top: 8px;
          li {
            display: inline-block;
            padding-right: 10px;
            color: map-get($fontColor, dark);
            font-weight: 600;
            span {
              padding-right: 5px;
              font-weight: 400;
            }
          }
        }
        .bar-chart {
          height: calc(100% - 24px);
        }
      }
    }
  }
  .dashboard-wrap-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: map-get($bgColor, white);
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    .txt {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.43);
    }
  }
}
</style>
