<template>
  <div class="card-box p-6">
    <div class="flex justify-content-between align-items-center">
      <div class="info-line flex align-items-center">
        <ElTooltip
          v-if="task"
          class="item"
          effect="dark"
          :content="task.name"
          placement="top"
        >
          <span class="mr-4 fs-6 font-color-dark ellipsis info-name">{{
            task.name
          }}</span>
        </ElTooltip>
        <TaskStatus class="py-0" :task="task" />
        <div class="flex-grow-1"></div>
        <span class="ml-6 font-color-light text-nowrap">
          {{ $t('packages_business_task_monitor_founder') }}：<span>{{
            task.creator
          }}</span>
        </span>
        <span class="mx-6 font-color-light text-nowrap">
          {{ $t('packages_business_task_info_start_time') }}：
          <span>{{ formatTime(task.startTime) || '-' }}</span>
        </span>
      </div>
      <div v-if="task.btnDisabled" class="operation">
        <VButton
          type="primary"
          :disabled="task.btnDisabled.start"
          @click="start(task, arguments[0])"
        >
          <VIcon size="12">start-fill</VIcon>
          <span class="ml-1">{{
            $t('packages_business_task_button_start')
          }}</span>
        </VButton>
        <VButton
          v-if="task.status === 'stopping'"
          type="danger"
          :disabled="task.btnDisabled.forceStop"
          @click="forceStop(task, arguments[0])"
        >
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{
            $t('packages_business_task_button_force_stop')
          }}</span>
        </VButton>
        <VButton
          v-else
          type="danger"
          :disabled="task.btnDisabled.stop"
          @click="stop(task, arguments[0])"
        >
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{
            $t('packages_business_task_button_stop')
          }}</span>
        </VButton>
      </div>
    </div>
    <div class="filter-bar flex align-center mt-3">
      <SelectList
        v-if="stagesItems.length"
        v-model:value="selectedStage"
        :items="stagesItems"
        :inner-label="$t('packages_business_task_info_node')"
        none-border
        last-page-text=""
        clearable
        menu-min-width="240px"
        :placeholder="$t('packages_business_task_info_select_node')"
        @change="changeStageFnc"
      ></SelectList>
      <SelectList
        v-model:value="selectedTime"
        :items="selectedTimeItems"
        :inner-label="$t('packages_business_task_info_cycle')"
        none-border
        last-page-text=""
        :placeholder="$t('packages_business_task_info_select_period')"
        @change="changePeriodFnc"
      ></SelectList>
      <DatetimeRange
        v-if="selectedTime === 'custom'"
        v-model:value="timeRange"
        :range="2 * 365 * 24 * 60 * 60 * 1000"
        value-format="timestamp"
        class="filter-datetime-range ml-2"
        @change="changeTimeRangeFnc"
      ></DatetimeRange>
      <SelectList
        v-model:value="selectedRate"
        :items="selectedRateItems"
        :inner-label="$t('packages_business_task_info_frequency')"
        none-border
        last-page-text=""
        :placeholder="$t('packages_business_task_info_select_frequency')"
        @change="changeRateFnc"
      ></SelectList>
    </div>
    <div
      class="chart-wrap flex justify-content-between mt-6"
      style="height: 247px"
    >
      <div class="px-4 py-6 grey-background" style="min-width: 220px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span class="font-color-light">{{
            $t('packages_business_task_monitor_total_input')
          }}</span>
        </div>
        <ElTooltip
          :content="overData.inputTotal.toString()"
          placement="left-start"
        >
          <div class="mb-4 fs-4 fw-bolder din-font" style="color: #409488">
            {{ toThousandsUnit(overData.inputTotal) }}
          </div>
        </ElTooltip>

        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span class="font-color-light">{{
            $t('packages_business_task_monitor_total_output')
          }}</span>
        </div>
        <ElTooltip
          :content="overData.outputTotal.toString()"
          placement="left-start"
        >
          <div class="mb-4 fs-4 fw-bolder din-font" style="color: #377ab9">
            {{ toThousandsUnit(overData.outputTotal) }}
          </div>
        </ElTooltip>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3 font-color-light">
              {{ $t('packages_business_task_monitor_total_insert') }}
            </div>
            <ElTooltip :content="overData.insertedTotal.toString()">
              <div class="fs-7 font-color-dark fw-bolder din-font">
                {{ toThousandsUnit(overData.insertedTotal) }}
              </div>
            </ElTooltip>
          </div>
          <div>
            <div class="mb-3 font-color-light">
              {{ $t('packages_business_task_monitor_total_update') }}
            </div>
            <ElTooltip :content="overData.updatedTotal.toString()">
              <div class="fs-7 font-color-dark fw-bolder din-font">
                {{ toThousandsUnit(overData.updatedTotal) }}
              </div>
            </ElTooltip>
          </div>
          <div>
            <div class="mb-3 font-color-light">
              {{ $t('packages_business_task_monitor_total_delete') }}
            </div>
            <ElTooltip :content="overData.deletedTotal.toString()">
              <div class="fs-7 font-color-dark fw-bolder din-font">
                {{ toThousandsUnit(overData.deletedTotal) }}
              </div>
            </ElTooltip>
          </div>
        </div>
      </div>
      <div
        class="flex flex-column flex-fill ml-4"
        v-loading="!lineDataDeep.x.length"
      >
        <Chart
          ref="chart"
          :extend="lineOptions"
          class="type-chart h-100"
        ></Chart>
      </div>
      <div class="ml-3 flex flex-column text-center" style="min-width: 250px">
        <div
          v-if="
            task &&
            task.parentTask &&
            ['initial_sync', 'initial_sync+cdc'].includes(task.parentTask.type)
          "
          class="right-box grey-background justify-content-center"
        >
          <div class="fw-bold right-box-text font-color-dark">
            {{ $t('packages_business_task_info_full_progress') }}
          </div>
          <div class="flex flex-column justify-content-center">
            <div
              class="progress-box flex justify-content-center align-items-center position-relative mt-1"
              v-if="syncData && syncData.progress"
            >
              <ElProgress
                type="circle"
                color="rgba(44, 101, 255, 1)"
                :stroke-width="3"
                :percentage="syncData.progress"
                :show-text="false"
                :width="48"
              ></ElProgress>
              <div
                class="flex justify-content-center position-absolute color-primary fw-bolder din-font"
              >
                {{ syncData.progress }}%
              </div>
            </div>
            <div class="py-2 fs-8 font-color-light" v-else>
              {{ $t('packages_business_migrate_no_progress_statistics_yet') }}
            </div>
            <div
              v-if="syncData.progress === 100"
              class="right-box-text font-color-light mt-1"
            >
              {{ $t('packages_business_task_info_full_time') }}：{{
                formatTime(syncData.endTs)
              }}
            </div>
            <div v-else class="right-box-text font-color-light mt-1">
              {{
                $t('packages_business_task_monitor_full_completion_time') +
                '：' +
                (syncData.finishDuration ||
                  $t('packages_business_task_info_calculating'))
              }}
            </div>
          </div>
        </div>
        <div
          v-if="
            task &&
            task.parentTask &&
            ['cdc', 'initial_sync+cdc'].includes(task.parentTask.type)
          "
          class="right-box grey-background justify-content-center"
        >
          <div class="fw-bold right-box-text font-color-dark">
            {{ $t('packages_business_task_info_incremental_delay') }}
          </div>
          <div class="flex flex-column justify-content-center">
            <div
              v-if="writeData.replicateLag"
              class="color-primary fw-bolder fs-5 mt-1"
              style="height: 48px; line-height: 48px"
            >
              {{ getReplicateLagTime(writeData.replicateLag) }}
            </div>
            <div class="py-2 fs-8 font-color-light" v-else>
              {{ $t('packages_business_migrate_no_latency_statistics_yet') }}
            </div>
            <div
              class="right-box-text font-color-light mt-1"
              v-if="writeData.cdcTime"
            >
              {{ $t('packages_business_task_info_increment_time_point') }}：{{
                formatTime(writeData.cdcTime)
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../../utils/gogocodeTransfer'
import dayjs from 'dayjs'

import { taskApi } from '@tap/api'
import { VIcon, SelectList, Chart, DatetimeRange } from '@tap/component'
import Time from '@tap/shared/src/time'

import { formatMs, toThousandsUnit } from '../../../../shared'
import TaskStatus from '../../../../components/TaskStatus'

export default {
  name: 'Info',
  components: { TaskStatus, VIcon, SelectList, Chart, DatetimeRange },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {},
    },
    syncData: {
      type: Object,
      default: () => {},
    },
    remoteMethod: Function,
  },
  data() {
    return {
      finishDuration: 0,
      progress: 0,
      timer: null, //cdcTime 定时器
      timerOverView: null,
      selectTime: 'second',
      statusBtMap: {
        start: {
          edit: true,
          stop: true,
          complete: true,
          error: true,
          schedule_failed: true,
        },
        pause: {
          running: true,
        },
        recover: {
          pause: true,
          schedule_failed: true,
          error: true,
        },
        stop: {
          running: true,
          // pause: true,
          // schedule_failed: true,
          // error: true
        },
        edit: {
          edit: true,
          pause: true,
        },
        reset: {
          stop: true,
          error: true,
          complete: true,
          schedule_failed: true,
        },
      },
      selectedStage: '', // 选中的节点
      selectedTime: 'default',
      selectedRate: 'second',
      guanluaryFormat: '',
      lineDataDeep: {
        x: [],
        y: [[], []],
      },
      lineOptions: {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          top: 4,
          right: 0,
          show: false,
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          name: 'QPS',
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            },
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        grid: {
          left: '24px', // 没有数据的时候，Y轴单位显示不全。后面可以通过判断设置该值
          right: '12px',
          top: '30px',
          bottom: 0,
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc',
        },
        series: [
          {
            type: 'line',
            name: this.$t('packages_business_task_info_input'),
            lineStyle: {
              color: 'rgba(24, 144, 255, 1)',
              width: 1,
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.2)',
            },
            symbol: 'none',
            itemStyle: {
              color: 'rgba(24, 144, 255, 1)',
            },
            data: [],
          },
          {
            type: 'line',
            name: this.$t('packages_business_task_info_output'),
            lineStyle: {
              color: 'rgba(118, 205, 238, 1)',
              width: 1,
            },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(118, 205, 238, 0.2)',
            },
            itemStyle: {
              color: 'rgba(118, 205, 238, 1)',
            },
            data: [],
          },
        ],
      },
      overData: {
        inputTotal: '',
        outputTotal: '',
        insertedTotal: '',
        updatedTotal: '',
        deletedTotal: '',
      },
      writeData: {
        cdcTime: '',
        initialTime: '',
        initialTotal: 0,
        initialWrite: 0,
        replicateLag: 0,
      },
      endTs: '', // 预计完成时间
      selectedTimeItems: [
        {
          label: this.$t('packages_business_task_info_default'),
          value: 'default',
          spacing: 0,
        },
        {
          label: this.$t('packages_business_task_info_five_min'),
          value: '5min',
          spacing: 5 * 60 * 1000,
        },
        {
          label: this.$t('packages_business_task_info_fifteen_min'),
          value: '15min',
          spacing: 15 * 60 * 1000,
        },
        {
          label: this.$t('packages_business_task_info_thirty_min'),
          value: '30min',
          spacing: 30 * 60 * 1000,
        },
        {
          label: this.$t('packages_business_task_info_last_hour'),
          value: '60min',
          spacing: 60 * 60 * 1000,
        },
        {
          label: this.$t('packages_business_task_info_custom_time'),
          value: 'custom',
        },
      ],
      selectedRateItems: [
        {
          label: this.$t('packages_business_task_info_five_seconds'),
          value: 'second',
        },
        {
          label: this.$t('packages_business_task_info_one_min'),
          value: 'minute',
        },
      ],
      timeRange: [],
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
      let result = this.task?.dag?.nodes?.map((item) => {
        return {
          label: item.name,
          value: item.id,
        }
      })
      return result || []
    },
  },
  beforeUnmount() {
    this.timer && clearInterval(this.timer)
    this.timerOverView && clearTimeout(this.timerOverView)
  },
  mounted() {
    this.init()
  },
  methods: {
    toThousandsUnit,
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
      }, ms)
    },
    getParams(reset) {
      const { selectedTime, selectedTimeItems } = this
      let startTimeStamp, endTimeStamp
      if (selectedTime) {
        let timeRange = this.getTimeRangeByType(selectedTime, this.timeRange)
        startTimeStamp = timeRange[0]
        endTimeStamp = timeRange[1]
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
      // 获取维度
      let diff =
        this.selectedTime === 'custom'
          ? (endTimeStamp || Time.now()) - startTimeStamp
          : selectedTimeItems.find((t) => t.value === selectedTime).spacing
      let guanluary = this.getGuanluary(diff)
      // 维度需要展示的格式
      this.guanluaryFormat = this.getGuanluary(diff, true)
      let taskId = this.$route.params?.id
      let tags = {
        taskId,
        type: 'task',
      }
      let params = {
        samples: [
          {
            tags,
            guanluary,
            fields: ['inputQPS', 'outputQPS'],
          },
          {
            tags,
            guanluary,
            fields: [
              'inputTotal',
              'outputTotal',
              'insertedTotal',
              'updatedTotal',
              'deletedTotal',
            ],
            type: 'headAndTail',
          },
        ],
        statistics: [
          {
            tags,
          },
        ],
      }
      if (this.selectedStage) {
        let nodeId = this.selectedStage
        let taskTags = tags
        tags = {
          taskId,
          type: 'node',
          nodeId,
        }
        params = {
          samples: [
            {
              tags,
              guanluary,
              fields: ['inputQPS', 'outputQPS'],
            },
            {
              tags,
              guanluary,
              fields: [
                'inputTotal',
                'outputTotal',
                'insertedTotal',
                'updatedTotal',
                'deletedTotal',
              ],
              type: 'headAndTail',
            },
          ],
          statistics: [
            {
              tags: taskTags,
            },
          ],
        }
      }
      // 轮询需要传递上一次的参数
      if (reset) {
        this.lineDataDeep = {
          x: [],
          y: [[], []],
        }
      }
      if (endTimeStamp) {
        params.samples[0].end = endTimeStamp
        if (selectedTime !== 'default') {
          params.samples[1].end = endTimeStamp
        }
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
      }
      return params
    },
    // param1：true 清除数据，做覆盖操作
    getMeasurement(reset = false) {
      const { selectedTime } = this
      let params = this.getParams(reset)
      if (!params) {
        return
      }
      this.remoteMethod(params).then((data) => {
        let { samples } = data
        samples.forEach((el) => {
          for (let key in el) {
            el[key] = el[key].reverse()
          }
        })
        const countObj = samples?.[1] || {}
        const statistics = data.statistics?.[0] || {}
        const { overData, writeData } = this
        // 总输入总输出
        for (let key in overData) {
          let val0 = countObj[key]?.[0]
          let val1 = countObj[key]?.[1]
          if (val0 === undefined && val1 === undefined) {
            overData[key] = ''
          } else {
            val0 = val0 || 0
            val1 = val1 || 0
            // 默认是查询任务的，不做叠加
            if (selectedTime === 'default') {
              overData[key] = Math.max(val1, val0)
            } else if (reset) {
              overData[key] = val1 - val0
            } else {
              overData[key] = val1 - val0 + (overData[key] || 0)
            }
          }
        }
        // 右侧增量延迟信息
        for (let key in writeData) {
          writeData[key] = statistics[key]
        }
        // 折线图
        const qpsData = samples[0] || {}
        let { inputQPS = [], outputQPS = [] } = qpsData
        let qpsDataTime = qpsData.time || []
        let xArr = qpsDataTime.map((t) =>
          this.formatTime(t, 'YYYY-MM-DD HH:mm:ss.SSS')
        ) // 时间不在这里格式化.map(t => formatTime(t))
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
            value: [time, inputQPS[i] || 0],
          })
          outArr.push({
            name: time,
            value: [time, outputQPS[i] || 0],
          })
        })
        if (reset) {
          this.lineDataDeep.x = xArr
          this.lineDataDeep.y[0] = inArr
          this.lineDataDeep.y[1] = outArr
        } else {
          xArr.forEach((el, index) => {
            // 过滤重复的时间点
            let findIndex = this.lineDataDeep.x.indexOf(el)
            if (findIndex > -1) {
              this.lineDataDeep.y[0][findIndex] = inArr[index]
              this.lineDataDeep.y[1][findIndex] = outArr[index]
            } else {
              this.lineDataDeep.x.push(el)
              this.lineDataDeep.y[0].push(inArr[index])
              this.lineDataDeep.y[1].push(outArr[index])
            }
          })
        }
        // 更新chart数据
        this.$refs.chart?.chart?.setOption({
          xAxis: {
            axisLabel: {
              formatter: (val) => {
                return this.formatTime(val, this.guanluaryFormat)
              },
            },
          },
          series: [
            {
              data: Object.assign([], this.lineDataDeep.y[0]),
            },
            {
              data: Object.assign([], this.lineDataDeep.y[1]),
            },
          ],
        })
      })
    },
    getGuanluary(val, format) {
      let diff = val / 1000
      let timeType
      let formatRes = ''
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
    formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
      return date ? dayjs(date).format(format) : '-'
    },
    getReplicateLagTime(val) {
      if (val < 1000) {
        return '<1' + this.$t('packages_business_task_info_s')
      } else if (val > 24 * 60 * 60 * 1000) {
        return '>1' + this.$t('packages_business_task_info_d')
      }
      return formatMs(val, 'time')
    },
    start(row = {}, resetLoading) {
      taskApi
        .start(row.id)
        .then((data) => {
          this.$message.success(
            data?.message ||
              this.$t('packages_business_message_operation_succuess')
          )
          $emit(this, 'reload')
        })
        .finally(resetLoading)
    },
    stop(row, resetLoading) {
      taskApi
        .stop(row.id)
        .then((data) => {
          this.$message.success(
            data?.message ||
              this.$t('packages_business_message_operation_succuess')
          )
          $emit(this, 'reload')
        })
        .finally(resetLoading)
    },
    forceStop(row, resetLoading) {
      taskApi
        .forceStop(row.id)
        .then((data) => {
          this.$message.success(
            data?.message ||
              this.$t('packages_business_message_operation_succuess')
          )
          $emit(this, 'reload')
        })
        .finally(resetLoading)
    },
    edit() {
      let row = this.task || {}
      this.handleDetail(row.id, 'edit', row.mappingTemplate, row.hasChildren)
    },
    reset() {
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
          `<p>${this.$t(
            'packages_business_task_list_edit_tip'
          )}<span style="color:#409EFF">${this.$t(
            'packages_business_task_list_edit_tip1'
          )}</span>、` +
            `<span style="color:#409EFF">${this.$t(
              'packages_business_task_list_node_attr'
            )}</span>、` +
            `<span style="color:#409EFF">${this.$t(
              'packages_business_task_list_matching_releation'
            )}</span>,` +
            `${this.$t(
              'packages_business_task_list_edit_submit'
            )}<span style="color:#409EFF">${this.$t(
              'task_list_edit_reset'
            )}</span>${this.$t('packages_business_task_list_edit_tip3')}</p>`,
          this.$t('packages_business_task_important_reminder'),
          {
            dangerouslyUseHTMLString: true,
            customClass: 'dataflow-clickTip',
            cancelButtonText: this.$t('packages_business_button_cancel'),
            confirmButtonText: this.$t(
              'packages_business_task_list_continue_edit'
            ),
            type: 'warning',
          }
        ).then((resFlag) => {
          if (resFlag) {
            this.$router.push({
              path: '/task/' + id,
            })
          }
        })
      } else {
        this.$router.push({
          name: 'Monitor',
          params: {
            id: id,
          },
        })
      }
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach((it) => {
          it.outerHTML = ''
        })
      }, 200)
    },
    getTimeRangeByType(type, val) {
      let current = Time.now()
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
    },
  },
  emits: ['reload'],
}
</script>

<style lang="scss" scoped>
.info-line {
  flex: 1;
  overflow: hidden;
}
.info-line > span {
  line-height: 26px;
}
.info-name {
  display: inline-block;
}
.grey-background {
  background-color: map-get($bgColor, normal);
}
.right-box {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  flex: 1;
  height: 50%;
}
.right-box + .right-box {
  margin-top: 16px;
}
.right-box-text {
  line-height: 22px;
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
.operation {
  white-space: nowrap;
}
.filter-bar {
  line-height: 32px;
}
.chart-wrap {
  position: relative;
  z-index: 1;
}
</style>
