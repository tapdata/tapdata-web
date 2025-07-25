<script>
import { ArrowRight } from '@element-plus/icons-vue'
import { fetchClusterStates, getProcessInfo, getTaskChart } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { STATUS_MAP } from '@tap/business/src/shared/task'
import { statusMap as InspectStatusMap } from '@tap/business/src/views/verification/const'
import Chart from '@tap/component/src/chart/Chart.vue'
import CountUp from '@tap/component/src/CountUp.vue'
import { toThousandsUnit } from '@/utils/util'
import { STATUS_MAP as DASHBOARD_STATUS_MAP } from './const'

export default {
  components: { Chart, ArrowRight, PageContainer, CountUp },
  inject: ['lockedFeature'],
  data() {
    const colorMap = {
      running: 'rgba(59, 71, 229, 0.5)',
      paused: '#AE86C9',
      wait_run: '#AE86C9',
      waiting: '#AE86C9',
      wait_start: 'rgba(250, 140, 22, 0.7)',
      scheduling: '#fdf1c8',
      edit: 'rgba(126, 42, 243, 0.5)',
      error: 'rgba(245, 34, 45, 0.7)',
      stop: 'rgba(250, 219, 20, 1)',
      stopping: '#E6B450',
      complete: 'rgba(82, 196, 26, 0.7)',
      done: '#2EA0EA',
    }
    return {
      h: this.$createElement,
      copyPieData: [],
      syncPieData: [],
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
          right: 0,
        },
        xAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(232, 232, 232, 0.75)',
            },
          },
          axisTick: {
            show: true,
            interval: 'auto',
          },
          axisLabel: {
            color: 'rgba(0,0,0,.65)',
          },
        },
        yAxis: {
          show: true,
          type: 'value',
          min: 1,
          logBase: 20,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#d9d9d9',
            },
          },
          axisLabel: {
            color: 'rgba(0,0,0,.65)',
          },
          splitLine: {
            onZero: true,
            show: true,

            lineStyle: {
              type: 'dashed',
            },
          },
        },
        tooltip: {
          trigger: 'item',
          borderWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: {
            color: '#fff',
            fontSize: 12,
            align: 'center',
          },
          formatter: (params) => {
            const item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }

            const html = `${
              params.name
            }<span style="padding: 0 4px; text-align: center;"></span><br/>${
              val
            }`
            return html
          },
        },
      },
      syncValidFalg:
        (this.$has('Data_verify_menu') || this.$has('Data_SYNC_menu')) &&
        !this.lockedFeature.dataVerificationList,
      taskList: [
        {
          icon: 'more-app',
          title: this.$t('dashboard_all_total'),
          desc: this.$t('dashboard_current_all_total'),
          key: 'all_total',
          value: 0,
        },
        {
          icon: 'copy-link',
          title: this.$t('dashboard_copy_total'),
          desc: this.$t('dashboard_current_copy_total'),
          key: 'copy_total',
          value: 0,
        },
        {
          icon: 'exchange-four',
          title: this.$t('dashboard_sync_total'),
          desc: this.$t('dashboard_current_sync_total'),
          key: 'sync_total',
          value: 0,
        },
        {
          icon: 'database-search',
          title: this.$t('dashboard_valid_total'),
          desc: this.$t('dashboard_current_valid_total'),
          key: 'valid_total',
          value: 0,
        },
      ],
      statusList: [
        { name: this.$t('public_status_running'), label: 'running', value: 0 },
        { name: this.$t('public_status_edit'), label: 'edit', value: 0 },
        {
          name: this.$t('public_status_wait_run'),
          label: 'wait_start',
          value: 0,
        },
        { name: this.$t('public_status_stop'), label: 'stop', value: 0 },
        {
          name: this.$t('public_status_complete'),
          label: 'complete',
          value: 0,
        },
        { name: this.$t('public_status_error'), label: 'error', value: 0 },
      ],
      // 数据校验
      inspectTaskList: Object.entries(InspectStatusMap).map(([key, value]) => ({
        name: value,
        value: 0,
        label: key,
        key,
        itemStyle: { color: colorMap[key] },
      })),
      loading: false,
      migrationTotal: '',
      syncTotal: '',
      taskStatusStatistics: [
        { name: this.$t('app_Home_initialization'), value: 'initializing' },
        { name: this.$t('app_Home_loadingFinished'), value: 'initialized' },
        { name: this.$t('app_Home_incremental'), value: 'cdc' },
        { name: this.$t('app_Home_incrementalLag'), value: 'Lag' },
      ],
      colorMap,
      colorServeMap: {
        starting: '#409EFF',
        running: '#8DC47A',
        stopping: '#F97066',
        stopped: '#FDB01C',
      },
      syncType: {
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc'),
        'initial_sync+cdc': this.$t('public_task_type_initial_sync_and_cdc'),
      },

      transfer: {
        height: 360,
        isHeader: false,
        tableData: [],
      },
      syncJobObj: {},
      migrationJobObj: {},
      syncJobStatusObj: {},
      migrationJobStatusObj: {},

      // 传输总览颜色
      transBarData: [
        {
          name: this.$t('public_event_total_input'),
          value: 0,
          key: 'inputTotal',
          color: '#82C647',
        },
        {
          name: this.$t('public_event_total_output'),
          value: 0,
          key: 'outputTotal',
          color: '#2EA0EA',
        },
        {
          name: this.$t('dashboard_total_insert'),
          value: 0,
          key: 'insertedTotal',
          color: '#AE86C9',
        },
        {
          name: this.$t('dashboard_total_update'),
          value: 0,
          key: 'updatedTotal',
          color: '#F7D762',
        },
        {
          name: this.$t('dashboard_total_delete'),
          value: 0,
          key: 'deletedTotal',
          color: '#88DBDA',
        },
      ],

      transBarOptions: {
        barWidth: '100%',
        series: [
          {
            labelFormat: 'KMT',
            fixed: 1,
          },
        ],
      },
      serverProcess: {
        height: 360,
        isHeader: true,
        tableData: [],
      },
      unitData: [],
      kbData: [],
      unitType: '',
      noPermission:
        this.$has('v2_data_pipeline') ||
        this.$has('Data_verify_menu') ||
        this.$has('management_menu'),
      agentRunningTask: {},
    }
  },

  mounted() {
    if (this.$has('v2_data_pipeline') || this.$has('Data_verify')) {
      this.getDataFlowApi()
      // this.getMeasurement()
    }

    if (this.$has('v2_cluster-management_menu')) {
      this.getClsterDataApi()
    }
  },
  methods: {
    toThousandsUnit,

    // 任务概览跳转页面
    handleTask(item) {
      if (item.key === 'copy_total') {
        this.$router.push({
          name: 'migrate',
        })
      } else if (item.key === 'sync_total') {
        this.$router.push({
          name: 'dataflowList',
        })
      }
    },
    handleStatus(status) {
      this.$router.push({
        name: 'migrate',
        query: {
          status,
        },
      })
    },
    handleSyncStatus(status) {
      this.$router.push({
        name: 'dataflow',
        query: {
          status,
        },
      })
    },
    // 获取服务器与进程的数据
    getClsterDataApi() {
      fetchClusterStates({
        type: 'dashboard',
      }).then((data) => {
        this.agentRunningTask = {}
        const processIdSet = new Set()
        const items = data?.items || []
        items.map((item) => {
          const { management, engine, apiServer } = item
          const isStopped = item.status !== 'running'

          // 停止了上报状态后，因为不再上报状态了，所以各个服务的状态就不再更新了。
          if (isStopped) {
            if (management) {
              management.status = 'stopped'
              management.serviceStatus = 'stopped'
            }
            if (engine) {
              engine.status = 'stopped'
              engine.serviceStatus = 'stopped'
              engine.netStat = []
              engine.netStatTotals = 0
            }
            if (apiServer) {
              apiServer.status = 'stopped'
              apiServer.serviceStatus = 'stopped'
            }
          }

          if (item.systemInfo?.process_id) {
            item.processId = item.systemInfo.process_id
            processIdSet.add(item.systemInfo.process_id)
          }

          return item
        })

        getProcessInfo(Array.from(processIdSet)).then((data) => {
          for (const id of Object.keys(data)) {
            this.agentRunningTask[id] = data[id].runningTaskNum
          }
        })
        this.serverProcess.tableData = items
        this.serverTable = items
      })
    },
    // 获取dataflows数据
    getDataFlowApi() {
      this.loading = true
      getTaskChart()
        .then((data) => {
          if (data) {
            const setColor = (list) => {
              return list.map((item) => {
                item.itemStyle = {
                  color: this.colorMap[item.label],
                }
                return item
              })
            }
            // 全部数据
            const copy_total = data?.chart1?.total || 0
            const sync_total = data?.chart3?.total || 0
            const valid_total = data?.chart5?.total || 0
            const total = {
              all_total: copy_total + sync_total + valid_total,
              copy_total,
              sync_total,
              valid_total,
            }
            const result = []
            this.taskList.forEach((el) => {
              if (this.lockedFeature[el.key]) return
              result.push(
                Object.assign({}, el, {
                  value: total[el.key],
                }),
              )
            })
            this.taskList = result
            this.migrationTaskList = data.chart1?.items
              ? this.handleDataProcessing(data.chart1.items, this.statusList)
              : []
            this.syncTaskList = data?.chart3
              ? this.handleDataProcessing(data.chart3.items, this.statusList)
              : []
            this.copyPieData = setColor(this.migrationTaskList)
            this.syncPieData = setColor(this.syncTaskList)
            this.transBarData = this.handleChart(data.chart6, this.transBarData)
            this.inspectTaskList = data?.chart5
              ? this.inspectTaskList.map((item) => {
                  item.value = data.chart5[item.key]
                  return item
                })
              : []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // echart数据转换
    handleChart(data, originalData) {
      const echartData = []
      if (originalData?.length) {
        originalData.forEach((el) => {
          for (const item in data) {
            if (el.key === item)
              echartData.push({
                name: el.name,
                value: data[item],
                color: el.color,
              })
          }
        })
      } else {
        for (const item in data) {
          echartData.push({
            name: '',
            value: data[item],
            color: '#2EA0EA',
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
        statusData.forEach((item) => {
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
            const dataObj = dataItem.find(
              (element) => item.label === element._id,
            )
            dataObj && (total = dataObj.count)
          }
          statusItem.push({
            name: item.name,
            label: item.label,
            value: total,
          })
        })
      } else {
        statusItem = statusData
      }
      return statusItem
    },

    getPieOption(data) {
      const dataName = []
      let total = 0
      let totalFalg = true
      const totalText = this.$t('dashboard_public_total')
      if (data?.length) {
        data.forEach((item) => {
          dataName.push(item.name)
          total += Number.parseFloat(item.value) * 1
        })
        totalFalg = data.some((item) => item.value > 0)
        total = this.toThousandsUnit(total)
      }

      return {
        legend: {
          show: false,
        },
        tooltip: {
          trigger: 'item',
          borderWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: {
            color: '#fff',
            fontSize: 12,
          },
          formatter: (params) => {
            const item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }
            const html = `<div style="text-align: center;"> ${params.name}<div style="font-family: 'DIN'">${val}</div></div>`
            return html
          },
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
                  fontWeight: '400',
                },
                value: {
                  color: 'rgba(0, 0, 0, 0.43)',
                  fontSize: 12,
                  fontWeight: '400',
                },
              },
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
                    fontWeight: '400',
                  },
                  value: {
                    color: 'rgba(0, 0, 0, 0.43)',
                    fontSize: 12,
                    fontWeight: '400',
                  },
                },
              },
            },
            data,
          },
        ],
      }
    },

    getStatus(type) {
      return DASHBOARD_STATUS_MAP[type] || '-'
    },

    handleGoTask(agentId, type) {
      this.$router.push({
        name: type === 'migrate' ? 'migrateList' : 'dataflowList',
        query: {
          agentId,
          status: 'running',
        },
      })
    },
  },
}
</script>

<template>
  <PageContainer hide-header mode="blank">
    <section class="dashboard-wrap isCardBox h-100">
      <div class="dashboard-main">
        <div>
          <template v-if="noPermission">
            <el-row
              v-readonlybtn="'v2_data_pipeline'"
              class="dashboard-row mb-5 gap-6"
            >
              <el-col
                v-for="item in taskList"
                :key="item.name"
                :span="24 / taskList.length"
                class="dashboard-col"
              >
                <div class="dashboard-col-box">
                  <div class="fs-7 font-color-normal flex align-center gap-2">
                    <VIcon size="20">{{ item.icon }}</VIcon>
                    <span class="fs-6 fw-sub font-color-normal">{{
                      item.desc
                    }}</span>
                  </div>
                  <div
                    class="mt-1"
                    :class="[
                      'dashboard-num',
                      'text-center',
                      'din-font',
                      {
                        'cursor-pointer':
                          item.key === 'copy_total' ||
                          item.key === 'sync_total',
                      },
                    ]"
                    @click="handleTask(item)"
                  >
                    <CountUp :end-val="item.value" :duration="2" />
                  </div>
                </div>
              </el-col>
            </el-row>
            <!-- 复制任务概览 -->
            <el-row
              v-readonlybtn="'v2_data_pipeline'"
              class="dashboard-row mb-5 align-items-stretch gap-6"
              type="flex"
            >
              <el-col :span="12" class="dashboard-col col">
                <div class="charts-list flex flex-row">
                  <div class="charts-list-text">
                    <div class="fs-7 font-color-normal">
                      {{ $t('dashboard_copy_overview_title') }}
                    </div>

                    <ul class="job-list">
                      <li
                        v-for="task in migrationTaskList"
                        :key="task.label"
                        class="flex align-center cursor-pointer"
                        @click="handleStatus(task.label)"
                      >
                        <i
                          class="dots mr-3"
                          :style="`background-color: ${colorMap[task.label]};`"
                        />
                        <span
                          :title="task.name"
                          class="fw-normal font-color-light flex-1 ellipsis"
                          >{{ task.name }}</span
                        ><span class="num font-color-dark">{{
                          task.value
                        }}</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="copyPieData.every((item) => item.value === 0)"
                    class="flex justify-content-center align-items-center w-100"
                  >
                    <div
                      class="flex justify-content-center align-items-center font-color-slight"
                      v-html="
                        $t('dashboard_no_statistics', [
                          `<span class='color-primary' style='padding: 0 5px;'>${$t(
                            'dashboard_copy_total',
                          )}</span>`,
                        ])
                      "
                    />
                  </div>
                  <div v-else class="chart">
                    <Chart
                      type="pie"
                      :extend="getPieOption(copyPieData)"
                      class="type-chart"
                    />
                  </div>
                </div>
              </el-col>
              <el-col :span="12" class="dashboard-col col">
                <div class="charts-list flex flex-row">
                  <div class="charts-list-text">
                    <div class="fs-7 font-color-normal">
                      {{ $t('dashboard_sync_overview_title') }}
                    </div>
                    <ul class="job-list">
                      <li
                        v-for="task in syncTaskList"
                        :key="task.label"
                        class="flex align-center cursor-pointer"
                        @click="handleSyncStatus(task.label)"
                      >
                        <i
                          class="dots mr-3"
                          :style="`background-color: ${colorMap[task.label]};`"
                        />
                        <span
                          :title="task.name"
                          class="fw-normal font-color-light flex-1 ellipsis"
                          >{{ task.name }}</span
                        ><span class="num font-color-dark">{{
                          task.value
                        }}</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="syncPieData.every((item) => item.value === 0)"
                    class="flex justify-content-center align-items-center w-100"
                  >
                    <div
                      class="flex justify-content-center align-items-center font-color-slight"
                      v-html="
                        $t('dashboard_no_statistics', [
                          `<span class='color-primary' style='padding: 0 5px;'>${$t(
                            'dashboard_sync_total',
                          )}</span>`,
                        ])
                      "
                    />
                  </div>
                  <div v-else class="chart">
                    <Chart
                      type="pie"
                      :extend="getPieOption(syncPieData)"
                      class="type-chart"
                    />
                  </div>
                </div>
              </el-col>
            </el-row>
            <!-- 数据校验 -->
            <el-row
              v-if="syncValidFalg"
              class="dashboard-row mb-5 align-items-stretch gap-6"
              type="flex"
            >
              <el-col :span="12" class="dashboard-col col">
                <div class="charts-list flex flex-row">
                  <div class="charts-list-text">
                    <div class="fs-7 font-color-normal">
                      {{ $t('dashboard_valid_title') }}
                    </div>
                    <ul class="job-list">
                      <li
                        v-for="task in inspectTaskList"
                        :key="task.key"
                        class="flex align-center"
                      >
                        <i
                          class="dots mr-3"
                          :style="`background-color: ${task.itemStyle.color};`"
                        />
                        <span
                          :title="task.name"
                          class="fw-normal font-color-light flex-1 ellipsis"
                          >{{ task.name }}</span
                        ><span class="num font-color-dark">{{
                          task.value
                        }}</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="inspectTaskList.every((item) => item.value === 0)"
                    class="flex justify-content-center align-items-center w-100"
                  >
                    <div
                      class="flex justify-content-center align-items-center font-color-slight"
                      v-html="
                        $t('dashboard_no_statistics', [
                          `<span class='color-primary' style='padding: 0 5px;'>${$t(
                            'dashboard_copy_total',
                          )}</span>`,
                        ])
                      "
                    />
                  </div>
                  <div v-else class="chart">
                    <Chart
                      type="pie"
                      :extend="getPieOption(inspectTaskList)"
                      class="type-chart"
                    />
                  </div>
                </div>
              </el-col>
              <el-col
                v-readonlybtn="'Data_SYNC_menu'"
                :span="12"
                class="dashboard-col col --dense"
              >
                <div class="charts-list flex flex-row">
                  <div class="charts-list-text">
                    <div class="fs-7 font-color-normal">
                      {{ $t('dashboard_transfer_overview') }}
                    </div>
                    <ul class="job-list">
                      <li
                        v-for="item in transBarData"
                        :key="item.key"
                        class="flex align-center"
                      >
                        <i
                          class="dots mr-3"
                          :style="`background-color: ${item.color};`"
                        />
                        <span
                          :title="item.name"
                          class="fw-normal font-color-light flex-1 ellipsis"
                          >{{ item.name }}</span
                        ><span class="num font-color-dark">{{
                          toThousandsUnit(item.value)
                        }}</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="transBarData.every((item) => item.value === 0)"
                    class="flex justify-content-center align-items-center w-100"
                  >
                    <div
                      class="flex justify-content-center align-items-center font-color-slight"
                      v-html="
                        $t('dashboard_no_statistics', [
                          `<span class='color-primary' style='padding: 0 5px;'>${$t(
                            'dashboard_transfer_overview',
                          )}</span>`,
                        ])
                      "
                    />
                  </div>
                  <div v-else class="chart">
                    <Chart
                      type="pie"
                      :extend="getPieOption(transBarData)"
                      class="type-chart"
                    />
                  </div>
                </div>
              </el-col>
            </el-row>
            <!-- 服务器进程 -->
            <div
              v-readonlybtn="'v2_cluster-management_menu'"
              class="dashboard-row dashboard-col col shadow-sm"
            >
              <div class="dashboard-col">
                <div class="dashboard-col-box">
                  <div class="fs-7 font-color-normal">
                    {{ $t('dashboard_server_title') }}
                  </div>
                  <el-row v-if="serverTable.length" :gutter="24">
                    <el-col
                      v-for="item in serverTable"
                      :key="item.id"
                      :span="12"
                      class="server-list pt-3"
                    >
                      <div class="server-list-box rounded-lg py-2">
                        <img
                          src="../../assets/static/serve.svg"
                          class="rounded-4"
                        />
                        <div class="server-main ml-5">
                          <div class="flex align-center gap-2">
                            <div class="title">
                              {{ item.agentName || item.systemInfo.hostname }}
                            </div>
                            <el-tag type="info" class="rounded-md">{{
                              item.custIP ? item.custIP : item.systemInfo.ip
                            }}</el-tag>
                          </div>

                          <ul class="flex flex-wrap pt-1 gap-3 align-center">
                            <li>
                              <label class="font-color-slight pr-2">{{
                                $t('dashboard_management')
                              }}</label>
                              <span
                                :style="`color: ${colorServeMap[item.management.status]};`"
                                >{{ getStatus(item.management.status) }}</span
                              >
                            </li>
                            <li>
                              <label class="font-color-slight pr-2">{{
                                $t('dashboard_api_service')
                              }}</label>
                              <span
                                :style="`color: ${colorServeMap[item.apiServer.status]};`"
                                >{{ getStatus(item.apiServer.status) }}</span
                              >
                            </li>

                            <li>
                              <label class="font-color-slight pr-2">{{
                                $t('dashboard_task_transfer')
                              }}</label>
                              <span
                                :style="`color: ${colorServeMap[item.engine.status]};`"
                                >{{ getStatus(item.engine.status) }}</span
                              >
                            </li>

                            <el-tag
                              v-if="
                                agentRunningTask[item.processId] &&
                                agentRunningTask[item.processId].migrate
                              "
                              type="success"
                              class="rounded-md cursor-pointer"
                              @click="handleGoTask(item.processId, 'migrate')"
                            >
                              {{ $t('dashboard_copy_total') }}:
                              {{
                                agentRunningTask[item.processId].migrate || 0
                              }}
                              <el-icon><ArrowRight /></el-icon>
                            </el-tag>

                            <el-tag
                              v-if="
                                agentRunningTask[item.processId] &&
                                agentRunningTask[item.processId].sync
                              "
                              type="success"
                              class="rounded-md cursor-pointer"
                              @click="handleGoTask(item.processId, 'sync')"
                            >
                              {{ $t('dashboard_sync_total') }}:
                              {{ agentRunningTask[item.processId].sync || 0 }}
                              <el-icon><ArrowRight /></el-icon>
                            </el-tag>
                          </ul>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                  <div
                    v-else
                    class="flex justify-content-center align-items-center h-100 py-4"
                  >
                    <div
                      class="flex justify-content-center align-items-center font-color-slight"
                      v-html="
                        $t('dashboard_no_statistics', [
                          `<span class='color-primary' style='padding: 0 5px;'>${$t(
                            'dashboard_server_title',
                          )}</span>`,
                        ])
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="dashboard-wrap-box">
              <img src="../../assets/static/undraw_secure_files_re_6vdh.svg" />
              <div class="txt pt-4">{{ $t('dashboard_no_data_here') }}</div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.dashboard-wrap {
  overflow-y: auto;

  .job-list {
    display: inline-flex;
    flex-direction: column;
    padding: 16px 0 0 20%;
    box-sizing: border-box;
    li {
      margin-bottom: 5px;
      //cursor: pointer;
      white-space: nowrap;
      .dots {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .num {
        font-weight: 600;
        min-width: 80px;
        margin-left: 16px;
      }
      span {
        display: inline-block;
        text-align: left;
        font-size: var(--font-base-title);
        &::before {
          content: '';
        }
      }
    }
  }

  .dashboard-row {
    .dashboard-col {
      flex: 1;
      &.col {
        border-radius: 3px;
        box-sizing: border-box;
      }
      .dashboard-col-box {
        height: 100%;
        padding: 16px;
        border-radius: 12px;
        background-color: var(--color-white);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
      }
      .dashboard-label {
        height: 48px;
      }
      .dashboard-num {
        font-size: 65px;
        color: var(--color-primary);
      }
      .charts-list {
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        background-color: var(--color-white);
        border-radius: 12px;
        box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
        .charts-list-text {
          width: 50%;
          padding: 16px;
        }
        .job-list {
          display: inline-flex;
          flex-direction: column;
          padding: 16px 0 0 20%;
          box-sizing: border-box;
          li {
            margin-bottom: 5px;
            //cursor: pointer;
            white-space: nowrap;
            .dots {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
            .num {
              font-weight: 600;
              min-width: 80px;
              margin-left: 16px;
            }
            span {
              display: inline-block;
              text-align: left;
              font-size: var(--font-base-title);
              &::before {
                content: '';
              }
            }
          }
        }
        .chart {
          width: 50%;
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
              color: var(--text-dark);
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
            color: var(--text-dark);
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
    background-color: var(--color-white);
    border-radius: 4px;
    justify-content: center;
    align-items: center;
    .txt {
      font-size: var(--font-base-title);
      color: rgba(0, 0, 0, 0.43);
    }
  }
}
</style>
