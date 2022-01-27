<template>
  <div class="card-box p-6">
    <div class="flex justify-content-between align-items-center">
      <div class="info-line align-items-center">
        <span class="mr-4 fs-6 font-color-main">{{ task.name }}</span>
        <StatusTag
          type="text"
          target="migrate"
          :status="task.isFinished ? 'finished' : task.status || 'running'"
        ></StatusTag>
        <!--        <span class="ml-6 font-color-sub">-->
        <!--          所属Agent：<span>{{ task.belongAgent }}</span>-->
        <!--        </span>-->
        <span class="ml-6 font-color-sub">
          {{ $t('task_monitor_founder') }}：<span>{{ creator }}</span>
        </span>
        <span class="ml-6 font-color-sub">
          {{ $t('task_info_start_time') }}：<span>{{ formatTime(task.startTime) || '-' }}</span>
        </span>
      </div>
      <div class="operation">
        <VButton type="primary" :disabled="startDisabled" @click="start(task, arguments[0])">
          <VIcon size="12">start-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_start') }}</span>
        </VButton>
        <VButton type="danger" :disabled="stopDisabled" @click="stop(task, arguments[0])">
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_stop') }}</span>
        </VButton>
        <!--        <VButton :disabled="editDisabled" @click="edit">-->
        <!--          <VIcon size="12">edit-fill</VIcon>-->
        <!--          <span class="ml-1">{{ $t('button_edit') }}</span>-->
        <!--        </VButton>-->
      </div>
    </div>
    <div class="flex align-center mt-3">
      <SelectList
        v-if="stagesItems.length"
        v-model="selectedStage"
        :items="stagesItems"
        last-page-text=""
        clearable
        size="mini"
        style="min-width: 240px"
        menu-min-width="240px"
        placeholder="请选择节点"
        @change="changeStageFnc"
      ></SelectList>
      <SelectList
        v-model="selectedTime"
        :items="selectedTimeItems"
        last-page-text=""
        clearable
        size="mini"
        placeholder="请选择周期"
        class="ml-4"
        style="min-width: 180px"
        @change="changeTimeFnc"
      ></SelectList>
      <DatetimeRange
        v-if="selectedTime === 'custom'"
        v-model="timeRange"
        value-format="timestamp"
        class="filter-datetime-range ml-2"
        @change="changeTimeRangeFnc"
      ></DatetimeRange>
      <SelectList
        v-model="selectedRate"
        :items="selectedRateItems"
        last-page-text=""
        clearable
        size="mini"
        placeholder="请选择频率"
        class="ml-4"
        style="min-width: 180px"
        @change="changeRateFnc"
      ></SelectList>
    </div>
    <div class="flex justify-content-between mt-6">
      <div class="p-6 grey-background" style="min-width: 200px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_input') }}</span>
        </div>
        <div class="mb-4 fs-4 font-color-main">{{ overData.inputEvents }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_output') }}</span>
        </div>
        <div class="mb-6 fs-4 font-color-main">{{ overData.outputEvents }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_insert') }}</div>
            <div class="fs-6 font-color-main">{{ overData.insertCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_update') }}</div>
            <div class="fs-6 font-color-main">{{ overData.updateCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_delete') }}</div>
            <div class="fs-6 font-color-main">{{ overData.deleteCount }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-column flex-fill pl-10" style="height: 250px">
        <!--        <div class="flex justify-content-between ml-6">-->
        <!--          <ElRadioGroup v-model="selectTime" size="mini" @change="changeUtil">-->
        <!--            <ElRadioButton label="second" :disabled="secondDisabled">{{ $t('task_info_s') }}</ElRadioButton>-->
        <!--            <ElRadioButton label="minute" :disabled="minuteDisabled">{{ $t('task_info_m') }}</ElRadioButton>-->
        <!--            <ElRadioButton label="hour" :disabled="hourDisabled">{{ $t('task_info_h') }}</ElRadioButton>-->
        <!--            <ElRadioButton label="day" :disabled="dayDisabled">{{ $t('task_info_d') }}</ElRadioButton>-->
        <!--          </ElRadioGroup>-->
        <!--          <div-->
        <!--            class="px-2"-->
        <!--            style="line-height: 27px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box"-->
        <!--          >-->
        <!--            QPS-->
        <!--          </div>-->
        <!--        </div>-->
        <Chart ref="chart" type="line" :data="lineData" :options="lineOptions" class="type-chart h-100"></Chart>
      </div>
      <div class="ml-3 flex flex-column text-center" style="min-width: 250px">
        <div class="right-box grey-background">
          <div class="fw-bold">全量进度</div>
          <div class="progress-box flex justify-content-center align-items-center position-relative">
            <ElProgress
              type="circle"
              color="rgba(44, 101, 255, 1)"
              :percentage="progressBar"
              :show-text="false"
              :width="50"
            ></ElProgress>
            <div class="flex justify-content-center position-absolute color-primary fw-bolder fs-7">
              {{ progressBar }}%
            </div>
          </div>
          <div v-if="progressBar === 100" class="font-color-sub">
            全量完成时间：{{ formatTime(writeData.initialTime) }}
          </div>
          <div v-else class="font-color-sub">
            {{ $t('task_monitor_full_completion_time') + '：' + (forecast || '计算中') }}
          </div>
        </div>
        <div class="right-box mt-4 grey-background">
          <div class="fw-bold">增量延迟</div>
          <div class="color-primary fw-bolder fs-5">{{ formatMs(writeData.replicateLag) }}</div>
          <div class="font-color-sub">增量所处时间点：{{ formatTime(writeData.cdcTime) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VIcon from '@/components/VIcon'
import SelectList from '@/components/SelectList'
import Chart from 'web-core/components/chart'
import DatetimeRange from '@/components/filter-bar/DatetimeRange'
import { formatTime, formatMs, delayTrigger, isEmpty } from '@/utils/util'
import { cloneDeep } from 'lodash'

let now = new Date(1997, 9, 3)
let oneDay = 24 * 3600 * 1000
let value1 = Math.random() * 1000
export default {
  name: 'Info',
  components: { StatusTag, VIcon, SelectList, Chart, DatetimeRange },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    },
    remoteMethod: Function
  },
  data() {
    return {
      selectTime: 'second',
      statusBtMap: {
        start: {
          edit: true,
          wait_run: true,
          stop: true,
          complete: true
        },
        pause: {
          running: true
        },
        recover: {
          pause: true,
          schedule_failed: true,
          error: true
        },
        stop: {
          running: true
          // pause: true,
          // schedule_failed: true,
          // error: true
        },
        edit: {
          edit: true,
          pause: true
        }
      },
      creator: '',
      selectedStage: '', // 选中的节点
      selectedTime: '',
      selectedRate: '',
      lineData: {
        x: [],
        y: [[], []]
      },
      lineDataDeep: {
        x: [],
        y: [[], []]
      },
      lineOptions: {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 4,
          right: 0,
          show: true
        },
        dataZoom: [
          // {
          //   type: 'slider',
          //   show: true,
          //   height: 20,
          //   bottom: '2%',
          //   textStyle: {
          //     color: '#2c65ff',
          //     fontSize: 11
          //   }
          // },
          {
            type: 'inside',
            minSpan: 1,
            maxSpan: 100
          }
        ],
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
      overData: {
        inputEvents: 0,
        outputEvents: 0,
        insertCount: 0,
        updateCount: 0,
        deleteCount: 0
      },
      writeData: {
        cdcTime: '',
        initialTime: '',
        initialTotal: 0,
        initialWrite: 0,
        replicateLag: 0
      },
      initialData: [], // 缓存最近两次全量的进度数据
      forecast: '', // 预计完成时间
      searchParams: {
        start: '',
        end: ''
      },
      filterItems: [
        {
          label: '统计时间',
          key: 'start,end',
          type: 'datetimerange',
          timeDiff: 60 * 1000
        }
      ],
      selectedTimeItems: [
        {
          label: '最近五分钟',
          value: '5min'
        },
        {
          label: '最近十五分钟',
          value: '15min'
        },
        {
          label: '最近三十分钟',
          value: '30min'
        },
        {
          label: '最近一小时',
          value: '60min'
        },
        {
          label: '自定义时间',
          value: 'custom'
        }
      ],
      selectedRateItems: [
        {
          label: '5秒',
          value: 'second'
        },
        {
          label: '1分钟',
          value: 'minute'
        }
      ],
      timeRange: []
    }
  },
  computed: {
    startDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['start'][task.status]
    },
    stopDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['stop'][task.status]
    },
    editDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['edit'][task.status]
    },
    stagesItems() {
      console.log('stagesItems', this.task)
      let result = this.task?.dag?.nodes?.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      })
      console.log('result', result)
      return result || []
    },
    progressBar() {
      const { writeData } = this
      const { initialWrite, initialTotal } = writeData
      if (!initialTotal) {
        return 0
      } else if (initialWrite >= initialTotal) {
        return 100
      }
      return Math.floor((initialWrite * 100) / initialTotal)
    },
    secondDisabled() {
      return false
    },
    minuteDisabled() {
      return false
    },
    hourDisabled() {
      const { selectedTime } = this
      return !['30min', '60min'].includes(selectedTime)
    },
    dayDisabled() {
      const { selectedTime } = this
      return !['60min'].includes(selectedTime)
    }
  },
  watch: {
    task: {
      deep: true,
      handler() {
        this.init()
      }
    }
  },
  methods: {
    init() {
      if (this.task.creator) {
        this.creator = this.task.creator
      }
      this.getMeasurement(60)
      this.resetTimer()
    },
    resetTimer(limit) {
      let ms = 5000
      let type = this.selectedRate
      switch (type) {
        case 'second':
          ms = 5000
          break
        case 'minute':
          ms = 60 * 1000
          break
      }
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.getMeasurement(limit)
      }, ms)
    },
    randomData() {
      now = new Date(+now + oneDay)
      return [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/')
    },
    randomData1() {
      now = new Date(+now + oneDay)
      value1 = value1 + Math.random() * 21 - 10
      return {
        name: now.toString(),
        value: [[now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'), Math.round(value1)]
      }
    },
    randomTime() {
      now = new Date(+now + oneDay)
      return [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/')
    },
    // param1：数组前后操作，  param2:：滑块范围是否追加，false表示范围不变，true表示会扩张
    getMeasurement() {
      const { selectedTime } = this
      let startTimeStamp, endTimeStamp
      if (selectedTime) {
        ;[startTimeStamp, endTimeStamp] = this.getTimeRangeByType(selectedTime, this.timeRange)
      }
      let guanluary = 'minute'
      switch (this.selectedRate) {
        case 'minute':
          guanluary = 'hour'
          break
        default:
          guanluary = 'minute'
          break
      }
      let agentId = this.task.agentId
      let dataFlowId = this.task.id
      let taskId = this.$route.params?.id
      let subTaskId = this.$route.params?.subId
      console.log('this.', this.$route.params)
      let params = {
        samples: [
          {
            tags: {
              // measureType: 'dataflow', //指标类型
              // customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              // host: 'hostname', //主机
              // agentId: agentId, //Agent的ID
              // taskId: taskId,
              subTaskId: subTaskId,
              type: 'subTask'
            },
            fields: ['inputQPS', 'outputQPS'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            // start: startTimeStamp, //optional
            // end: endTimeStamp, //optional
            // limit: limit, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: guanluary
          },
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: agentId, //Agent的ID
              dataFlowId: dataFlowId //DataFlow的ID
            },
            fields: ['replicateLag'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            // start: startTimeStamp, //optional
            // end: endTimeStamp, //optional
            limit: 1, //optional， 没有就返回全部， 服务器保护返回最多1000个
            guanluary: guanluary
          },
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: agentId, //Agent的ID
              dataflowId: dataFlowId //DataFlow的ID
            },
            // fields: ['outputEvents', 'inputEvents'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
            // start: startTimeStamp, //optional
            // end: endTimeStamp, //optional
            type: 'headAndTail', // headAndTail 返回查询头尾两个值， default是需要指定limit的列表返回， default可以不写
            guanluary: guanluary
          }
        ],
        statistics: [
          {
            tags: {
              measureType: 'dataflow', //指标类型
              customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
              host: 'hostname', //主机
              agentId: 'agent1', //Agent的ID
              dataflowId: 'afsdfasdf' //DataFlow的ID
            }
            //"fields" : ["initialTotal", "initialWrite", "outputEvents", "inputEvents", "insertCount", "updateCount", "deleteCount"]
          }
        ]
      }
      if (this.selectedStage) {
        params = {
          samples: [
            {
              tags: {
                measureType: 'node', //指标类型
                customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
                host: 'hostname', //主机
                agentId: 'agent1', //Agent的ID
                dataFlowId: 'dataFlow1', //DataFlow的ID
                type: 'node', //节点类型， node， processor
                nodeId: 'kasldjfkasf' //节点的ID
              },
              //"fields" : ["inputQPS", "outputQPS", "transmitionTime"],  //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
              start: 123123323214, //optional
              end: 123123123123123, //optional
              // limit: limit, //optional, 没有就返回全部， 服务器保护返回最多1000个
              guanluary: 'minute'
            },
            {
              tags: {
                measureType: 'dataflow', //指标类型
                customerId: 'enterpriseId', //客户ID, 如果没有可以先试用userId
                host: 'hostname', //主机
                agentId: 'agent1', //Agent的ID
                dataFlowId: 'dataFlow1' //DataFlow的ID
              },
              fields: ['replicateLag'], //optional， 返回需要用到的数据， 不指定会返回该指标里的所有值， 强烈建议指定， 不要浪费带宽
              start: 123123323214, //optional
              end: 123123123123123, //optional
              limit: 1, //optional， 没有就返回全部， 服务器保护返回最多1000个
              guanluary: 'minute'
            }
          ],
          statistics: [
            {
              tags: {
                userId: 'aaaa',
                key1: 'cdccc',
                key2: 'ccccc'
              },
              fields: ['input', 'output']
            }
          ]
        }
      }
      if (startTimeStamp) {
        params.samples[0].start = startTimeStamp
        params.samples[1].start = startTimeStamp
        params.samples[2].start = startTimeStamp
      }
      if (endTimeStamp) {
        params.samples[0].end = endTimeStamp
        params.samples[1].end = endTimeStamp
        params.samples[2].end = endTimeStamp
      }
      this.remoteMethod(params).then(data => {
        console.log('getMeasurement', data)
        const { samples } = data
        const countObj = samples?.[2] || {}
        const statistics = data.statistics?.[0] || {}
        const { overData, writeData, initialData, lineOptions } = this
        // 总输入总输出
        if (!isEmpty(countObj)) {
          for (let key in overData) {
            overData[key] = countObj[key][1] - countObj[key][0]
          }
        }

        for (let key in writeData) {
          writeData[key] = statistics[key]
        }
        writeData.replicateLag = data.samples?.[1]?.replicateLag?.[0] || 0
        // 全量预计完成时间
        initialData.length >= 2 && initialData.shift()
        initialData.push(Object.assign({}, writeData))
        if (initialData.length >= 2) {
          const getForecastMs = this.getForecastMs(initialData)
          if (getForecastMs) {
            this.forecast = getForecastMs
          }
        }
        // 折线图
        const qpsData = samples[0]
        let { inputQPS = [], outputQPS = [] } = qpsData
        console.log('inputQPS', inputQPS)
        console.log('outputQPS', outputQPS)
        let qpsDataTime = qpsData.time
        let lineDataDeep = this.lineDataDeep
        let xArr = qpsDataTime.map(t => formatTime(t))
        const xArrLen = xArr.length
        console.log('xArrLen', xArrLen)
        if (lineDataDeep.x.length > 20) {
          lineDataDeep.x.splice(0, xArrLen)
          lineDataDeep.y[0].splice(0, xArrLen)
          lineDataDeep.y[1].splice(0, xArrLen)
        }
        let inArr = []
        let outArr = []
        xArr.forEach((el, i) => {
          let time = this.randomTime() || el // TODO 造递增的时间点
          inArr.push({
            name: time,
            value: [time, inputQPS[i] || 0]
          })
          outArr.push({
            name: time,
            value: [time, outputQPS[i] || 0]
          })
        })
        console.log('inArr', inArr)
        lineDataDeep.x.push(...xArr)
        lineDataDeep.y[0].push(...inArr)
        lineDataDeep.y[1].push(...outArr)
        console.log('xArr', xArr)
        console.log('this.$refs.chart', this.$refs.chart.chart.getOption())
        console.log('lineDataDeep', lineDataDeep)
        this.$refs.chart.chart?.setOption({
          series: [
            {
              // data: data1
              data: lineDataDeep.y[0]
            },
            {
              // data: data2
              data: lineDataDeep.y[1]
            }
          ]
        })

        // if (this.selectedStage) {
        //   // 追加系列
        //   lineDataDeep.y[2] = qpsData.transmitionTime
        //   lineOptionsDeep.series[2] = {
        //     name: '耗时',
        //     yAxisIndex: 1,
        //     lineStyle: {
        //       color: 'rgba(70, 10, 238, 1)',
        //       width: 1
        //     },
        //     symbol: 'none',
        //     areaStyle: {
        //       color: 'rgba(70, 10, 238, 0.2)'
        //     },
        //     itemStyle: {
        //       color: 'rgba(70, 10, 238, 1)'
        //     }
        //   }
        // } else {
        //   lineDataDeep.y[2] = []
        //   lineOptionsDeep.series[2] = { name: '' }
        // }

        console.log('lineDataDeep.x.', lineDataDeep.x.length)
        // this.lineOptions = lineOptionsDeep
        // this.lineData = lineDataDeep
      })
    },
    getForecastMs(data) {
      const [start, end] = data
      const num = end.initialWrite - start.initialWrite
      const timeDiff = new Date(end.initialTime).getTime() - new Date(start.initialTime).getTime()
      if (!num) {
        return
      }
      const speed = num / timeDiff
      if (!speed) {
        return
      }
      const result = (end.initialTotal - start.initialWrite) / speed
      return formatMs(result)
    },
    changeUtil(val) {
      console.log('changeUtil', val)
    },
    formatTime(date) {
      return formatTime(date)
    },
    formatMs(ms) {
      return formatMs(ms)
    },
    start(row = {}, resetLoading) {
      this.$api('SubTask')
        .start(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    },
    stop(row, resetLoading) {
      this.$api('SubTask')
        .stop(row.id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    },
    edit() {
      console.log('编辑') // eslint-disable-line
      let row = this.task || {}
      this.handleDetail(row.id, 'edit', row.mappingTemplate, row.hasChildren)
    },
    handleDetail(id, type, mappingTemplate, hasChildren) {
      // 子选项 hasChildren 为 true
      if (hasChildren) {
        return
      }
      if (type === 'edit') {
        this.$confirm(
          `<p>${this.$t('task_list_edit_tip')}<span style="color:#409EFF">${this.$t('task_list_edit_tip1')}</span>、` +
            `<span style="color:#409EFF">${this.$t('task_list_node_attr')}</span>、` +
            `<span style="color:#409EFF">${this.$t('task_list_matching_releation')}</span>,` +
            `${this.$t('task_list_edit_submit')}<span style="color:#409EFF">${this.$t(
              'task_list_edit_reset'
            )}</span>${this.$t('task_list_edit_tip3')}</p>`,
          this.$t('task_important_reminder'),
          {
            dangerouslyUseHTMLString: true,
            customClass: 'dataflow-clickTip',
            cancelButtonText: this.$t('button_cancel'),
            confirmButtonText: this.$t('task_list_continue_edit'),
            type: 'warning'
          }
        ).then(resFlag => {
          if (resFlag) {
            this.$router.push({
              path: '/task/' + id
            })
          }
        })
      } else {
        this.$router.push({
          name: 'Monitor',
          params: {
            id: id
          }
        })
      }
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)
    },
    getTimeRangeByType(type, val) {
      let current = new Date().getTime()
      let result = [null]
      switch (type) {
        case '5min':
          result[0] = current - 5 * 60 * 1000
          break
        case '15min':
          result[0] = current - 15 * 60 * 1000
          break
        case '30min':
          result[0] = current - 30 * 60 * 1000
          break
        case '60min':
          result[0] = current - 60 * 60 * 1000
          break
        case 'custom':
          result = val
          break
      }
      console.log('result', result)
      return result
    },
    changeTimeFnc(val) {
      console.log('changeTimeFnc', val)
      switch (val) {
        case '5min':
          this.selectTime = 'second'
          break
        case '15min':
          this.selectTime = 'minute'
          break
        case '30min':
          this.selectTime = 'hour'
          break
        case '60min':
          this.selectTime = 'day'
          break
        default:
          this.selectTime = 'second'
          break
      }
      this.getMeasurement(false, true)
      this.resetTimer()
    },
    changeRateFnc(val) {
      console.log('changeRateFnc', val)
      this.getMeasurement(60)
      this.resetTimer(5)
    },
    changeStageFnc() {
      this.getMeasurement()
      this.resetTimer()
    },
    changeTimeRangeFnc() {
      this.getMeasurement()
      this.resetTimer()
    }
  }
}
</script>

<style lang="scss" scoped>
.grey-background {
  background-color: #fafafa;
}
.right-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  flex: 1;
  height: 50%;
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
</style>
