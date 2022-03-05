<template>
  <section class="dashboard-wrap" v-if="!$getSettingByKey('SHOW_OLD_PAGE')" v-loading="loading">
    <el-row :gutter="20" class="dashboard-row mb-5" v-readonlybtn="'Data_SYNC_menu'">
      <el-col :span="6" v-for="item in taskList" :key="item.name" class="dashboard-col">
        <div class="dashboard-col-box">
          <div class="dashboard-title fs-7">{{ $t('dashboard_' + item.key) }}</div>
          <div class="dashboard-label fs-5 pt-4 text-center">{{ $t('dashboard_current_' + item.key) }}</div>
          <div class="dashboard-num pt-4 pb-2 text-center">{{ item.value }}</div>
        </div>
      </el-col>
    </el-row>
    <!-- 复制任务概览 -->
    <el-row :gutter="20" class="dashboard-row mb-5">
      <el-col :span="12" class="dashboard-col col">
        <div class="charts-list">
          <div class="charts-list-text">
            <div class="dashboard-title fs-7">{{ $t('dashboard_copy_overview_title') }}</div>
            <ul class="job-list">
              <li v-for="task in migrationTaskList" :key="task.label" @click="handleMigrationStatus(task.label)">
                <i class="dots mr-3" :style="`background-color: ${colorMap[task.label]};`"></i>
                <span class="text">{{ $t('dashboard_status_' + task.label) }}</span
                ><span class="num pl-7">{{ task.value }}</span>
              </li>
            </ul>
          </div>

          <div class="chart">
            <Chart type="pie" :extend="getPieOption(copyPieData)" class="type-chart"></Chart>
          </div>
        </div>
      </el-col>
      <!-- 复制任务状态 -->
      <el-col :span="12" class="dashboard-col col">
        <div class="dashboard-col-box">
          <div class="dashboard-title fs-7">{{ $t('dashboard_copy_status_title') }}</div>
          <div class="chart line-chart">
            <ul>
              <li v-for="item in copyTaskData" :key="item.name">
                <span>{{ item.name }} </span> {{ item.value }}
              </li>
            </ul>
            <Chart type="bar" :data="copyTaskData" :options="barOptions"></Chart>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 开发任务概览  -->
    <el-row :gutter="20" class="dashboard-row mb-5">
      <el-col :span="12" class="dashboard-col col">
        <div class="charts-list">
          <div class="charts-list-text">
            <div class="dashboard-title fs-7">{{ $t('dashboard_sync_overview_title') }}</div>
            <ul class="job-list">
              <li v-for="task in syncTaskList" :key="task.label" @click="handleMigrationStatus(task.label)">
                <i class="dots mr-3" :style="`background-color: ${colorMap[task.label]};`"></i>
                <span class="text">{{ $t('dataFlow.status.' + task.label) }}</span
                ><span class="num pl-7">{{ task.value }}</span>
              </li>
            </ul>
          </div>
          <div class="chart">
            <Chart type="pie" :extend="getPieOption(syncPieData)" class="type-chart"></Chart>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="dashboard-col col">
        <div class="dashboard-col-box">
          <div class="dashboard-title fs-7">{{ $t('dashboard_sync_status_title') }}</div>
          <div class="chart line-chart">
            <ul>
              <li v-for="item in syncTaskData" :key="item.name">
                <span>{{ item.name }} </span> {{ item.value }}
              </li>
            </ul>
            <Chart type="bar" :data="syncTaskData" :options="barOptions"></Chart>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 数据校验 -->
    <el-row :gutter="20" class="dashboard-row mb-5">
      <el-col :span="12" class="dashboard-col col">
        <div class="dashboard-col-box">
          <div class="dashboard-title fs-7">{{ $t('dashboard_valid_title') }}</div>
          <div class="chart line-chart">
            <ul>
              <li v-for="item in validBarData" :key="item.name">
                <span>{{ item.name }} </span> {{ item.value }}
              </li>
            </ul>
            <Chart type="bar" :data="validBarData" :options="barOptions"></Chart>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="dashboard-col col">
        <div class="charts-list">
          <div class="charts-list-text">
            <div class="dashboard-title fs-7">{{ $t('dashboard_transfer_overview') }}</div>
            <ul class="job-list">
              <li v-for="item in transBarData" :key="item.key">
                <i class="dots mr-3" :style="`background-color: ${item.color};`"></i>
                <span class="text">{{ item.name }}</span
                ><span class="num pl-7">{{ item.value }}</span>
              </li>
            </ul>
          </div>
          <div class="chart">
            <Chart type="pie" :extend="getPieOption(transBarData)" class="type-chart"></Chart>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 服务器进程 -->
    <div class="dashboard-row dashboard-col col mb-5">
      <div class="dashboard-col">
        <div class="dashboard-col-box">
          <div class="dashboard-title fs-7">服务器进程</div>
          <el-row :gutter="20">
            <el-col :span="12" class="server-list pt-3" v-for="item in serverTable" :key="item.id">
              <div class="server-list-box">
                <img src="../../assets/images/serve.svg" />
                <!-- <img src="../../assets/icons/svg/serve.svg" alt="" /> -->
                <div class="server-main ml-5">
                  <div class="title">{{ item.systemInfo.ip }}</div>
                  <ul class="flex pt-1">
                    <li class="pr-5">
                      <label class="label pr-2">{{ $t('dashboard_management') }}</label>
                      <span :style="`color: ${colorServeMap[item.management.status]};`">{{
                        $t('dashboard_' + item.management.status)
                      }}</span>
                    </li>
                    <li class="pr-5">
                      <label class="label pr-2">{{ $t('dashboard_task_transfer') }}</label>
                      <span :style="`color: ${colorServeMap[item.engine.status]};`">{{
                        $t('dashboard_' + item.engine.status)
                      }}</span>
                    </li>
                    <li>
                      <label class="label pr-2">{{ $t('dashboard_api_service') }}</label>
                      <span :style="`color: ${colorServeMap[item.apiServer.status]};`">{{
                        $t('dashboard_' + item.apiServer.status)
                      }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </section>
  <DKDashboard v-else />
</template>

<script>
import DKDashboard from './DKDashboard'
import factory from '../../api/factory'
import Chart from 'web-core/components/chart'
const cluster = factory('cluster')
const DataFlows = factory('DataFlows')

export default {
  components: { DKDashboard, Chart },
  data() {
    return {
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
        barWidth: '50%',
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
              color: '#D9D9D9'
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
            fontSize: 12
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
      taskList: [
        { key: 'all_total', value: 0 },
        { key: 'copy_total', value: 0 },
        { key: 'sync_total', value: 0 },
        { key: 'valid_total', value: 0 }
      ],
      statusList: [
        { name: this.$t('task_preview_status_running'), label: 'running', value: 0 },
        { name: this.$t('task_preview_status_edit'), label: 'wait_run', value: 0 },
        { name: this.$t('task_preview_status_pause'), label: 'pause', value: 0 },
        { name: this.$t('task_preview_status_error'), key: 'error', value: 0 }
      ],

      loading: false,
      migrationTotal: '',
      syncTotal: '',
      taskStatusStatistics: [
        { name: this.$t('app.Home.initialization'), value: 'initializing' },
        { name: this.$t('app.Home.loadingFinished'), value: 'initialized' },
        { name: this.$t('app.Home.incremental'), value: 'cdc' },
        { name: this.$t('app.Home.incrementalLag'), value: 'Lag' }
      ],
      colorMap: {
        running: '#82C647',
        paused: '#AE86C9',
        wait_run: '#AE86C9',
        edit: '#88DBDA',
        error: '#F7D762',
        stopping: '#E6B450',
        scheduled: '#2EA0EA'
      },
      colorServeMap: {
        starting: '#409EFF',
        running: '#8DC47A',
        stopping: '#F97066',
        stopped: '#FDB01C'
      },
      syncType: {
        initial_sync: this.$t('dataFlow.initial_sync'),
        cdc: this.$t('dataFlow.cdc'),
        'initial_sync+cdc': this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
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
      unitType: ''
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

    // this.allsyncJobsEchart = JSON.parse(JSON.stringify(this.allTaskEchart))
    // this.copyTaskOptions = JSON.parse(JSON.stringify(this.allTaskEchart))
  },
  methods: {
    // 点击迁移运行状态跳转到任务列表
    // handleMigrationStatus(status) {
    //   let routeUrl = this.$router.resolve({
    //     name: 'migrate',
    //     query: { status: status }
    //   })
    //   window.open(routeUrl.href)
    // },

    // 获取服务器与进程的数据
    getClsterDataApi() {
      let params = {
        type: 'dashboard'
      }
      cluster.get(params).then(res => {
        this.serverProcess.tableData = res.data?.items
        this.serverTable = res.data?.items
      })
    },
    // 获取dataflows数据
    getDataFlowApi() {
      let self = this
      self.loading = true
      DataFlows.chart()
        .then(res => {
          if (res?.data) {
            let setColor = list => {
              return list.map(item => {
                item.itemStyle = {
                  color: this.colorMap[item.label]
                }
                return item
              })
            }

            self.migrationTaskList = res.data.chart1?.items ? self.handleDataProcessing(res.data.chart1.items) : []
            self.syncTaskList = res.data?.chart3 ? self.handleDataProcessing(res.data.chart3) : []
            // self.allsyncJobsEchart.series[0].data = self.syncTaskList?.length ? setColor(self.syncTaskList) : []

            // self.syncTotal = res.data.chart5.totalDataFlows
            // self.migrationTotal = res.data.chart1.totalDataFlows

            // 全部数据
            let copy_total = res.data?.chart1?.total || 0
            let sync_total = res.data?.chart3?.total || 0
            let valid_total = res.data?.chart5?.total || 0

            let total = {
              all_total: copy_total + sync_total + valid_total,
              copy_total: copy_total,
              sync_total: sync_total,
              valid_total: valid_total
            }
            let result = []
            let handlestatus = list => {
              if (list?.length) {
                this.statusList.map(status => {
                  list.filter(item => {
                    if (item.label === status.key) {
                      debugger
                      return (status.value = item.value)
                    }
                  })
                  return status
                })
              }
            }
            // this.taskList = statusList(result)
            this.taskList.forEach(el => {
              result.push(
                Object.assign({}, el, {
                  value: total[el.key]
                })
              )
            })
            this.taskList = result

            // self.copyPieData = setColor(handlestatus(self.migrationTaskList))
            console.log(handlestatus(self.migrationTaskList))
            self.copyTaskData = this.handleChart(res.data.chart2)
            self.syncPieData = setColor(self.syncTaskList)
            self.syncTaskData = this.handleChart(res.data.chart4)
            self.validBarData = this.handleChart(res.data.chart5)
            self.transBarData = this.handleChart(res.data.chart6)
          }
        })
        .finally(() => {
          self.loading = false
        })
    },

    // echart数据转换
    handleChart(data) {
      let echartData = []
      for (let item in data) {
        echartData.push({
          name: this.$t('dashboard_' + item),
          value: data[item],
          color: '#2EA0EA'
        })
      }

      return echartData
    },
    // // 指标
    // getMeasurement() {
    //   this.$api('Measurement')
    //     .queryTransmitTotal()
    //     .then(({ data }) => {
    //       let result = []
    //       this.transBarData.forEach(el => {
    //         result.push(
    //           Object.assign({}, el, {
    //             value: data[el.key]
    //           })
    //         )
    //       })
    //       // eslint-disable-next-line
    //       console.log('result', result)
    //       this.transBarData = result
    //     })
    //     .catch(err => {
    //       // eslint-disable-next-line
    //       console.log('err', err)
    //     })
    // },

    // 数据处理
    handleDataProcessing(dataItem) {
      let statusItem = []
      if (dataItem?.length) {
        dataItem.sort((a, b) => (a._id > b._id ? 1 : a._id === b._id ? 0 : -1))
        dataItem.forEach(element => {
          statusItem.unshift({
            name: this.$t('dashboard_status_' + element._id),
            label: element._id,
            value: element.count
          })
        })
        statusItem.filter((item, index) => {
          if (item.name === 'stopping' || item.name === 'scheduled') {
            statusItem.splice(index, 1)
          }
        })
      }

      return statusItem
    },
    getPieOption(data) {
      let dataName = []
      let total = 0
      let totalFalg = true
      let totalText = this.$t('dashboard_total')
      if (data?.length) {
        data.forEach(res => {
          dataName.push(res.name)
          total += parseFloat(res.value) * 1
        })
        totalFalg = data.some(item => item.value > 0)
      }

      return {
        legend: {
          show: false
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
              height: 34,
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
                formatter: '{name|{c}}\n{value|{b}}',
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
            // itemStyle: {
            //   normal: {
            //     // color: function (params) {
            //     //   var colorList = ['#7ba75d', '#409EFF', '#d9742c', '#e6b451', '#e06c6c']
            //     //   return colorList[params.dataIndex]
            //     // },
            //     label: {
            //       show: true,
            //       // verticalAlign: 'middle',
            //       // position: 'top',
            //       // distance: 10,
            //       formatter: function (value) {
            //         if (value.data / (1000 * 1000 * 1000) > 1) {
            //           return (value.data / (1000 * 1000 * 1000)).toFixed(1) + ' T'
            //         } else if (value.data / (1000 * 1000) > 1) {
            //           return (value.data / (1000 * 1000)).toFixed(1) + ' M'
            //         } else if (value.data / 1000 > 1) {
            //           return (value.data / 1000).toFixed(1) + ' K'
            //         }
            //       }
            //     }
            //   }
            // },
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
  padding: 0 20px 20px;
  overflow-y: auto;
  background-color: #eff1f4;
  .dashboard-row {
    .dashboard-col {
      flex: 1;
      overflow: hidden;
      &.col {
        height: 210px;
        border-radius: 3px;
        box-sizing: border-box;
      }
      .dashboard-col-box {
        height: 100%;
        padding: 20px;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
      }
      .dashboard-title {
        color: rgba(0, 0, 0, 0.85);
      }
      .dashboard-label {
        color: #252a4c;
      }
      .dashboard-num {
        font-size: 65px;
        color: #2c65ff;
      }
      .charts-list {
        overflow: hidden;
        box-sizing: border-box;
        background-color: #fff;
        box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
        .charts-list-text {
          float: left;
          width: 40%;
          padding: 20px 30px 20px 20px;
        }
        .job-list {
          padding: 30px 30px 20px 60px;
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
            .text {
              font-weight: 400;
              color: rgba(0, 0, 0, 0.43);
            }
            .num {
              font-weight: 600;
            }
            span {
              display: inline-block;
              width: 50px;
              text-align: left;
              font-size: 12px;
              color: #252a4c;
              &::before {
                content: '';
              }
            }
          }
        }
        .chart {
          float: left;
          width: 40%;
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
              color: #252a4c;
              font-weight: 500;
            }
            .label {
              color: rgba(0, 0, 0, 0.43);
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
            color: #000;
            font-weight: 600;
            span {
              padding-right: 5px;
              color: rgba(0, 0, 0, 0.43);
              font-weight: 400;
            }
          }
        }
      }
    }
  }
}
</style>
