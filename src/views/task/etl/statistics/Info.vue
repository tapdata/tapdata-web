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
        <VButton type="primary" :disabled="startDisabled" @click="start">
          <VIcon size="12">start-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_start') }}</span>
        </VButton>
        <VButton type="danger" :disabled="stopDisabled" @click="stop">
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{ $t('task_button_stop') }}</span>
        </VButton>
        <!--        <VButton :disabled="editDisabled" @click="edit">-->
        <!--          <VIcon size="12">edit-fill</VIcon>-->
        <!--          <span class="ml-1">{{ $t('button_edit') }}</span>-->
        <!--        </VButton>-->
      </div>
    </div>
    <div class="mt-3">
      <SelectList
        v-if="stagesItems.length > 0"
        v-model="selectedStage"
        :items="stagesItems"
        last-page-text=""
        clearable
        size="mini"
        style="min-width: 240px"
        @change="changeStageFnc"
      ></SelectList>
    </div>
    <div class="flex justify-content-between mt-6">
      <div class="p-6" style="background-color: #fafafa; min-width: 240px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_input') }}</span>
        </div>
        <div class="mb-4 fs-4 font-color-main">{{ overviewObj.body.inputCount }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_output') }}</span>
        </div>
        <div class="mb-6 fs-4 font-color-main">{{ overviewObj.body.outputCount }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_insert') }}</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.insertCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_update') }}</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.updateCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_delete') }}</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.deleteCount }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-column flex-fill pl-10" style="height: 250px">
        <div class="flex justify-content-between ml-6">
          <ElRadioGroup v-model="throughputObj.title.time" size="mini" @change="changeUtil">
            <ElRadioButton label="second">{{ $t('task_info_s') }}</ElRadioButton>
            <ElRadioButton label="minute">{{ $t('task_info_m') }}</ElRadioButton>
            <ElRadioButton label="hour">{{ $t('task_info_h') }}</ElRadioButton>
            <ElRadioButton label="day">{{ $t('task_info_d') }}</ElRadioButton>
          </ElRadioGroup>
          <div
            class="px-2"
            style="line-height: 27px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box"
          >
            QPS
          </div>
        </div>
        <VEchart :option="throughputObj.body" class="v-echart flex-fill"></VEchart>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VEchart from '@/components/VEchart'
import VIcon from '@/components/VIcon'
import SelectList from '@/components/SelectList'
import { formatTime, isEmpty } from '@/utils/util'

let lastMsg
export default {
  name: 'Info',
  components: { StatusTag, VEchart, VIcon, SelectList },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      selectFlow: 'stage_', // 选中节点
      dataOverviewAll: 'flow',
      // 事件统计
      overviewObj: {
        title: {
          key: 'overview',
          statsType: 'data_overview',
          title: this.$t('dataFlow.dataScreening'),
          loading: false
        },
        body: {
          outputCount: 0,
          inputCount: 0,
          insertCount: 0,
          updateCount: 0,
          deleteCount: 0
        }
      },
      throughputObj: {
        title: {
          key: 'throughput',
          statsType: 'throughput',
          time: 'second',
          title: this.$t('task_info_input_output'),
          tip: this.$t('task_info_throughputpop'),
          unit: 'QPS',
          class: 'putColor',
          loading: false
        },
        body: null,
        input: 0,
        output: 0
      },
      yMax: 1,
      statusBtMap: {
        start: {
          edit: true,
          wait_run: true,
          stop: true,
          complete: true
        },
        paused: {
          running: true
        },
        recover: {
          paused: true,
          schedule_failed: true,
          error: true
        },
        stop: {
          running: true
          // paused: true,
          // schedule_failed: true,
          // error: true
        },
        edit: {
          edit: true,
          paused: true
        }
      },
      creator: '',
      selectedStage: '' // 选中的节点
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
  mounted() {
    // this.init()
    this.$once('onceLoadHttp', () => {
      this.loadHttp()
    })
  },
  destroyed() {
    this.$ws.off('dataFlowInsight')
  },
  methods: {
    init() {
      if (this.task.creator) {
        this.creator = this.task.creator
      }
      this.loadMetrics()
      // this.loadHttp()
      this.$emit('onceLoadHttp')
      this.loadWS()
      this.sendMsg()
    },
    loadMetrics() {
      const { selectedStage } = this
      let filter = {
        where: {
          name: {
            $in: [
              'sub_task_total_input',
              'sub_task_total_output',
              'sub_task_total_insert',
              'sub_task_total_update',
              'sub_task_total_delete',
              'sub_task_qps'
            ]
          },
          'labels.taskId': this.task.id
        }
      }
      if (selectedStage) {
        delete filter.where['labels.taskId']
        filter.where['labels.nodeId'] = selectedStage
        filter.where.name = {
          $in: [
            'sub_task_node_total_input',
            'sub_task_node_total_output',
            'sub_task_node_total_insert',
            'sub_task_node_total_update',
            'sub_task_node_total_delete',
            'sub_task_node_qps'
          ]
        }
      }
      this.$api('Metrics')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          console.log('Metrics', res)
        })
    },
    loadWS() {
      this.$ws.on('dataFlowInsight', data => {
        this.getOverview(data) // 事件统计
        this.getThroughputOpt(data) // 输入输出统计
      })
    },
    // 获取节点类型（是否是全部节点）
    sendMsg() {
      let msg = {
        type: 'dataFlowInsight',
        granularity: {
          throughput: this.selectFlow + this.throughputObj.title.time,
          trans_time: this.selectFlow + 'minute',
          repl_lag: this.selectFlow + 'minute',
          data_overview: this.dataOverviewAll
        },
        dataFlowId: this.task.id
      }
      let msgStr = JSON.stringify(msg)
      if (lastMsg !== msgStr) {
        this.$ws.ready(() => {
          lastMsg = msgStr
          this.$ws.send(msg)
        })
      }
    },
    loadHttp() {
      let arr = ['overviewObj', 'throughputObj']
      arr.forEach(el => {
        let item = this[el]?.title
        let params = {
          statsType: item.statsType,
          granularity: item.time ? 'flow_' + item.time : 'flow'
        }
        this.loadData(params, item)
      })
    },
    // 通过api获取数据
    loadData(params) {
      params['dataFlowId'] = this.task.id
      this.$api('DataFlowInsights')
        .runtimeMonitor({
          params: params
        })
        .then(res => {
          let result = res.data || {}
          let data = {
            statsData: {},
            granularity: {}
          }
          data.statsData[result.statsType] = result.statsData
          data.granularity[result.statsType] = result.granularity
          // 组合成ws返回的格式

          switch (result.statsType) {
            case 'throughput':
              this.getThroughputOpt(data) // 输入输出统计
              break
          }
        })
    },
    getOverview(data) {
      let overview = data.statsData.data_overview || {}
      if (isEmpty(overview)) {
        return
      }
      this.overviewObj.body = overview
    },
    getThroughputOpt(data) {
      let timeList = [],
        inputCountList = [],
        outputCountList = [],
        timeType = data.granularity['throughput']?.split('_')[1]
      data.statsData.throughput.forEach(item => {
        timeList.push(this.splitTime(item.t, timeType))
        inputCountList.push(item.inputCount)
        outputCountList.push(item.outputCount)
      })
      // 计算y轴最大值
      const max = Math.max(...[...inputCountList, ...outputCountList])
      if (max > this.yMax) {
        this.yMax = max + Math.ceil(max / 10)
      }
      this.throughputObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 0
        },
        grid: {
          left: 0,
          right: 0,
          bottom: '3%',
          containLabel: true,
          borderWidth: 1,
          borderColor: '#ccc'
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#409EFF',
              width: 1 // 这里是为了突出显示加上的
            }
          },
          data: timeList
        },
        yAxis: {
          max: this.yMax,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#409EFF',
              width: 1
            }
          },
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            }
          }
        },
        series: [
          {
            name: this.$t('task_info_input'),
            type: 'line',
            smooth: true,
            data: inputCountList,
            itemStyle: {
              color: '#2ba7c3'
            },
            lineStyle: {
              color: '#2ba7c3'
            },
            areaStyle: {
              color: '#2ba7c3'
            }
          },
          {
            name: this.$t('task_info_output'),
            type: 'line',
            smooth: true,
            data: outputCountList,
            itemStyle: {
              color: '#61a569'
            },
            lineStyle: {
              color: '#8cd5c2'
            },
            areaStyle: {
              color: '#8cd5c2'
            }
          }
        ]
      }
      this.throughputObj.input = inputCountList[inputCountList.length - 1] || 0
      this.throughputObj.output = outputCountList[outputCountList.length - 1] || 0
    },
    changeUtil() {
      this.sendMsg()
    },
    splitTime(time, type) {
      let result
      switch (type) {
        case 'second':
          result = time.substring(11, 19)
          break
        case 'minute':
          result = time.substring(11, 16)
          break
        case 'hour':
          result = time.substring(11, 16)
          break
        case 'day':
          result = time.substring(6, 10)
      }
      return result
    },
    formatTime(date) {
      return formatTime(date)
    },
    start() {
      this.$api('Workers')
        .getAvailableAgent()
        .then(async result => {
          if (!result.data.result || result.data.result.length === 0) {
            this.$message.error(this.$t('dataForm.form.agentMsg'))
            return
          }
          this.startLoading = true
          await this.changeStatus({ status: 'scheduled' })
          this.startLoading = false
        })
    },
    stop() {
      let msgObj = this.getConfirmMessage('stop', this.task.name)
      let message = msgObj.msg
      let title = msgObj.title
      let node = this.task
      if (node.setting && !node.setting.sync_type.includes('cdc')) {
        message = this.$t('task_pause_tip')
        title = this.$t('task_important_reminder')
      }
      if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
        const h = this.$createElement
        let arr = this.$t('task_stop_tip').split('XXX')
        message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
        title = this.$t('task_important_reminder')
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus({ status: 'stopping' })
        }
      })
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
    async changeStatus({ status, errorEvents }) {
      let where = {
        _id: {
          in: [this.$route.params.id]
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      return await this.$api('DataFlows')
        .update(where, attributes)
        .then(data => {
          this.responseHandler(data, this.$t('task_operation_successful'))
        })
        .catch(error => {
          if (error?.isException) {
            this.$message.error(this.$t('task_start_failed'))
          }
        })
    },
    responseHandler(data, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('task_not_exist'),
          6: this.$t('task_not_allow_operation'),
          7: this.$t('task_operation_failed'),
          8: this.$t('task_not_allow_operation')
        }
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                this.task.name
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg)
        this.$emit('reload')
      }
    },
    getConfirmMessage(operateStr, name) {
      let map = {
        delete_confirm_title: this.$t('task_delete_confirm_title'),
        delete_confirm_message: this.$t('task_delete_confirm_message'),

        stop_confirm_title: this.$t('task_stop_confirm_title'),
        stop_confirm_message: this.$t('task_stop_confirm_message'),

        force_stop_confirm_title: this.$t('task_force_stop_confirm_title'),
        force_stop_confirm_message: this.$t('task_force_stop_confirm_message'),

        initialize_confirm_title: this.$t('task_initialize_confirm_title'),
        initialize_confirm_message: this.$t('task_initialize_confirm_message')
      }
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      const h = this.$createElement
      let strArr = map[message].split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          name
        ),
        strArr[1]
      ])
      return {
        msg,
        title: map[title]
      }
    },
    changeStageFnc() {
      // this.sendMsg()
      this.loadMetrics()
    }
  }
}
</script>
