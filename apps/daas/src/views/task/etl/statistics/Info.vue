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
          {{ $t('task_monitor_founder') }}：<span>{{ task.creator }}</span>
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
        @change="changePeriodFnc"
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
      <div class="p-6 grey-background" style="min-width: 240px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_input') }}</span>
        </div>
        <div class="mb-4 fs-4 font-color-main">{{ overData.inputTotal }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_output') }}</span>
        </div>
        <div class="mb-6 fs-4 font-color-main">{{ overData.outputTotal }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_insert') }}</div>
            <div class="fs-6 font-color-main">{{ overData.insertedTotal }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_update') }}</div>
            <div class="fs-6 font-color-main">{{ overData.updatedTotal }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_delete') }}</div>
            <div class="fs-6 font-color-main">{{ overData.deletedTotal }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-column flex-fill pl-10" style="height: 250px">
        <Chart ref="chart" type="line" :data="lineData" :options="lineOptions" class="type-chart h-100"></Chart>
      </div>
      <div class="ml-3 flex flex-column text-center" style="min-width: 250px">
        <div class="right-box grey-background">
          <div class="fw-bold mb-3">全量进度</div>
          <div class="progress-box flex justify-content-center align-items-center position-relative">
            <ElProgress
              type="circle"
              color="rgba(44, 101, 255, 1)"
              :percentage="progress"
              :show-text="false"
              :width="50"
            ></ElProgress>
            <div class="flex justify-content-center position-absolute color-primary fw-bolder">{{ progress }}%</div>
          </div>
          <div v-if="progress === 100" class="font-color-sub mt-3">全量完成时间：{{ formatTime(endTs) }}</div>
          <div v-else class="font-color-sub mt-2">
            {{ $t('task_monitor_full_completion_time') + '：' + (finishDuration || '计算中') }}
          </div>
        </div>
        <div class="right-box mt-3 grey-background">
          <div class="fw-bold">增量延迟</div>
          <div class="color-primary fw-bolder fs-5">{{ getReplicateLagTime(writeData.replicateLag) }}</div>
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
import { formatTime, formatMs } from '@/utils/util'

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
      finishDuration: 0,
      progress: 0,
      selectTime: 'second',
      statusBtMap: {
        start: {
          edit: true,
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
      selectedStage: '', // 选中的节点
      selectedTime: 'default',
      selectedRate: 'second',
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
          // formatter: params => {
          //   let [item1, item2] = params
          //   let html = formatTime(item1.name)
          //   html += `<div style="display: flex;justify-content: space-between"><span>${item1.marker}${item1.seriesName}</span>` + `<span>${item1.value?.[1]}</span></div>`
          //   html += `<div style="display: flex;justify-content: space-between"><span>${item2.marker}${item2.seriesName}</span>` + `<span>${item2.value?.[1]}</span></div>`
          //   return html
          // }
        },
        legend: {
          top: 4,
          right: 0,
          show: true
        },
        // dataZoom: [
        //   {
        //     type: 'inside',
        //     minSpan: 1,
        //     maxSpan: 100
        //   }
        // ],
        xAxis: {
          type: 'time'
          // axisLabel: {
          //   formatter: val => {
          //     return formatTime(val)
          //   }
          // },
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
          left: 12, // 没有数据的时候，Y轴单位显示不全。后面可以通过判断设置该值
          right: '2px',
          top: '36px',
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
        inputTotal: 0,
        outputTotal: 0,
        insertedTotal: 0,
        updatedTotal: 0,
        deletedTotal: 0
      },
      writeData: {
        cdcTime: '',
        initialTime: '',
        initialTotal: 0,
        initialWrite: 0,
        replicateLag: 0
      },
      initialData: [], // 缓存最近两次全量的进度数据
      endTs: '', // 预计完成时间
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
          label: '默认',
          value: 'default',
          spacing: 0
        },
        {
          label: '最近五分钟',
          value: '5min',
          spacing: 5 * 60 * 1000
        },
        {
          label: '最近十五分钟',
          value: '15min',
          spacing: 15 * 60 * 1000
        },
        {
          label: '最近三十分钟',
          value: '30min',
          spacing: 30 * 60 * 1000
        },
        {
          label: '最近一小时',
          value: '60min',
          spacing: 60 * 60 * 1000
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
      let result = this.task?.dag?.nodes?.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      })
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
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  },
  mounted() {
    this.getSyncOverViewData()
  },
  methods: {
    //概览信息
    getSyncOverViewData() {
      this.$api('SubTask')
        .syncOverView(this.$route.params?.subId)
        .then(res => {
          let data = res?.data
          this.finishDuration = this.handleTime(data?.finishDuration)
          this.progress = data?.progress
          this.endTs = data?.endTs
          if (data?.progress !== 100) {
            setTimeout(() => {
              this.getSyncOverViewData()
            }, 800)
          }
        })
    },
    handleTime(time) {
      let r = ''
      if (time) {
        let s = time,
          m = 0,
          h = 0,
          d = 0
        if (s > 60) {
          m = parseInt(s / 60)
          s = parseInt(s % 60)
          if (m > 60) {
            h = parseInt(m / 60)
            m = parseInt(m % 60)
            if (h > 24) {
              d = parseInt(h / 24)
              h = parseInt(h % 24)
            }
          }
        }
        if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
          r = 1 + this.$t('taskProgress.m')
        }
        // r = parseInt(s) + i18n.t('timeToLive.s')
        if (m > 0) {
          r = parseInt(m) + this.$t('taskProgress.m')
        }
        if (h > 0) {
          r = parseInt(h) + this.$t('taskProgress.h') + r
        }
        if (d > 0) {
          r = parseInt(d) + this.$t('taskProgress.d') + r
        }
        return r
      }
    },
    init() {
      this.getMeasurement()
      this.resetTimer()
    },
    resetTimer() {
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
        let { selectedTime } = this
        if (!(selectedTime === 'custom')) {
          this.getMeasurement()
        }
        // if (!this.selectedTime || this.selectedTime !== 'custom') {
        //   this.getMeasurement()
        // }
      }, ms)
    },
    getParams(reset) {
      const { selectedTime, selectedTimeItems } = this
      let startTimeStamp, endTimeStamp
      if (selectedTime) {
        ;[startTimeStamp, endTimeStamp] = this.getTimeRangeByType(selectedTime, this.timeRange)
        if (isNaN(startTimeStamp)) {
          startTimeStamp = null
        }
        if (isNaN(endTimeStamp)) {
          endTimeStamp = null
        }
      }
      // 自定义时间，需要选择范围
      if (selectedTime === 'custom') {
        if (!startTimeStamp && !endTimeStamp) {
          return
        }
      }
      let diff =
        this.selectedTime === 'custom'
          ? (endTimeStamp || new Date().getTime()) - startTimeStamp
          : selectedTimeItems.find(t => t.value === selectedTime).spacing
      let guanluary = this.getGuanluary(diff)
      let subTaskId = this.$route.params?.subId
      let tags = {
        subTaskId: subTaskId,
        type: 'subTask'
      }
      let params = {
        samples: [
          {
            tags,
            guanluary,
            fields: ['inputQPS', 'outputQPS']
          },
          {
            tags,
            guanluary,
            fields: ['inputTotal', 'outputTotal', 'insertedTotal', 'updatedTotal', 'deletedTotal'],
            type: 'headAndTail'
          }
        ],
        statistics: [
          {
            tags
          }
        ]
      }
      if (this.selectedStage) {
        let nodeId = this.selectedStage
        let taskTags = tags
        tags = {
          subTaskId: subTaskId,
          type: 'node',
          nodeId
        }
        params = {
          samples: [
            {
              tags,
              guanluary,
              fields: ['inputQPS', 'outputQPS']
            },
            {
              tags,
              guanluary,
              fields: ['inputTotal', 'outputTotal', 'insertedTotal', 'updatedTotal', 'deletedTotal'],
              type: 'headAndTail'
            }
          ],
          statistics: [
            {
              tags: taskTags
            }
          ]
        }
      }
      if (reset) {
        this.lineDataDeep = {
          x: [],
          y: [[], []]
        }
      }
      if (endTimeStamp) {
        params.samples[0].end = endTimeStamp
        if (selectedTime !== 'default') {
          params.samples[1].end = endTimeStamp
        }
        // params.samples[2].end = endTimeStamp
      }
      if (startTimeStamp) {
        if (selectedTime && selectedTime !== 'custom') {
          const lastTime = this.lineDataDeep.x[this.lineDataDeep.x.length - 1]
          const lastTimeStamp = lastTime ? new Date(lastTime).getTime() : ''
          params.samples[0].start = lastTimeStamp || startTimeStamp
          if (selectedTime !== 'default') {
            params.samples[1].start = lastTimeStamp || startTimeStamp
          }
        } else {
          params.samples[0].start = startTimeStamp
          if (selectedTime !== 'default') {
            params.samples[1].start = startTimeStamp
          }
        }
        // params.samples[2].start = startTimeStamp
      }
      return params
    },
    // param1：true 清除数据，做覆盖操作
    getMeasurement(reset = false) {
      const { selectedTime } = this
      let params = this.getParams(reset)
      this.remoteMethod(params).then(data => {
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
        // if (!isEmpty(countObj)) {
        for (let key in overData) {
          let val0 = countObj[key]?.[0] || 0
          let val1 = countObj[key]?.[1] || 0
          // 默认是查询任务的，不做叠加
          if (selectedTime === 'default') {
            overData[key] = Math.max(val1, val0)
          } else if (reset) {
            overData[key] = val1 - val0
          } else {
            overData[key] += val1 - val0
          }
        }
        // }
        for (let key in writeData) {
          writeData[key] = statistics[key]
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
        // eslint-disable-next-line
        console.log('x轴：', this.lineDataDeep.x.length, xArr)
        if (reset) {
          this.lineDataDeep.x = xArr
          this.lineDataDeep.y[0] = inArr
          this.lineDataDeep.y[1] = outArr
        } else {
          xArr.forEach((el, index) => {
            if (!this.lineDataDeep.x.includes(el)) {
              this.lineDataDeep.x.push(el)
              this.lineDataDeep.y[0].push(inArr[index])
              this.lineDataDeep.y[1].push(outArr[index])
            }
          })
          // this.lineDataDeep.x.push(...xArr)
          // this.lineDataDeep.y[0].push(...inArr)
          // this.lineDataDeep.y[1].push(...outArr)
        }
        // this.lineOptions.xAxis.axisLabel.formatter = val => {
        //   return formatTime(val, formatGuanluaryTime)
        // }
        this.$refs.chart?.chart?.setOption({
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
    getEmptyData(start, end) {
      let result = []
      const { selectedTime, selectedTimeItems } = this
      let startTimeStamp = start || new Date().getTime()
      let endTimeStamp = end || new Date().getTime()
      let diff =
        this.selectedTime === 'custom'
          ? endTimeStamp - startTimeStamp
          : selectedTimeItems.find(t => t.value === selectedTime).spacing
      let timeSpacing = this.getTimeSpacing(this.getGuanluary(diff))
      for (let i = start; i < endTimeStamp; i += timeSpacing) {
        result.push(i)
      }
      return result.slice(1)
    },
    formatTime(date) {
      return formatTime(date)
    },
    getReplicateLagTime(val) {
      if (val < 1000) {
        return '<1' + this.$t('task_info_s')
      } else if (val > 24 * 60 * 60 * 1000) {
        return '>1' + this.$t('task_info_d')
      }
      return formatMs(val, 'time')
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
        default:
          result[0] = current - 5 * 60 * 1000
          break
      }
      return result
    },
    changePeriodFnc() {
      this.resetTimer()
      this.getMeasurement(true)
    },
    changeRateFnc() {
      this.resetTimer()
      this.getMeasurement(true)
    },
    changeStageFnc() {
      this.resetTimer()
      this.getMeasurement(true)
    },
    changeTimeRangeFnc() {
      this.resetTimer()
      this.getMeasurement(true)
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

.ant-layout.authing-guard-layout {
  padding: 0;
}
.g2-view-login {
  height: 100%;
}
.g2-view-header {
  text-align: center;
}
.g2-view-container .g2-view-tabs [class*='authing-'].authing-ant-tabs-tab {
  display: flex;
  justify-content: center;
  flex: 1;
  font-size: 16px;
}
/*
  Edit login page css
  eg：
  .authing-guard-layout {
    background: black !important;
  }
  Change the background color
*/
.react-joyride {
  position: relative;
  flex: 1;
  margin-top: 0;
  padding-bottom: 100vh;
  width: 65%;
}
.react-joyride::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: url(https://cloud.tapdata.net/assets/img/login/bg.png) no-repeat center center;
  background-size: 80%;
}
.ant-layout.authing-guard-layout {
  flex-direction: row;
  justify-content: unset;
  align-items: unset;
}
body .styles_container__24ljE {
  margin: 0;
  padding-top: 100px;
  width: 35%;
}
.styles_container__28TSZ {
  margin-bottom: 30px;
}
.styles_authing-tabs-inner__KEW7v {
  text-align: center;
}
.styles_authing-tab-item__2W-41 {
  flex: 1;
  margin-right: 0;
  font-size: 16px;
}
.styles_authing-tab-item__active__1E7DK {
  font-size: 16px;
}
.styles_authing-tab-item__active__1E7DK:after {
  width: 100%;
}
.ant-form-item {
  margin-bottom: 30px;
}
.ant-input-lg {
  font-size: 14px;
}
.styles_registerBtn__37rJN {
  margin-bottom: 24px;
}
.styles_pageFooter__1Gi3w,
.styles_problem__2ff93,
.styles_problem__3qBot {
  display: none;
}
</style>
