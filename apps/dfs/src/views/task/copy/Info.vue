<template>
  <div class="card-box p-6">
    <div class="flex justify-content-between">
      <div class="info-line">
        <span class="mr-4 fs-6 font-color-main">{{ task.name }}</span>
        <StatusTag
          type="tag"
          target="task"
          :status="task.isFinished ? 'finished' : task.status || 'running'"
        ></StatusTag>
        <!--        <span class="ml-6 font-color-sub">-->
        <!--          所属Agent{{$t('field_mapping_field_mapping_dialog_')}}<span>{{ task.belongAgent }}</span>-->
        <!--        </span>-->
        <span class="ml-6 font-color-sub">
          {{ $t('task_monitor_founder') }}{{ $t('field_mapping_field_mapping_dialog_') }}<span>{{ creator }}</span>
        </span>
        <span class="ml-6 font-color-sub">
          {{ $t('start_time') }}{{ $t('field_mapping_field_mapping_dialog_')
          }}<span>{{ formatTime(task.startTime) || '-' }}</span>
        </span>
      </div>
      <div class="operation">
        <VButton type="primary" :disabled="startDisabled" @click="start">
          <VIcon size="12">start-fill</VIcon>
          <span class="ml-1">{{ $t('task_info_start') }}</span>
        </VButton>
        <VButton type="danger" :disabled="stopDisabled" @click="stop">
          <VIcon size="12">pause-fill</VIcon>
          <span class="ml-1">{{ $t('task_info_stopt') }}</span>
        </VButton>
        <VButton :disabled="editDisabled" @click="edit">
          <VIcon size="12">edit-fill</VIcon>
          <span class="ml-1">{{ $t('button_edit') }}</span>
        </VButton>
      </div>
    </div>
    <div class="flex justify-content-between mt-6" style="height: 250px">
      <div class="p-6" style="background-color: #fafafa; min-width: 240px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>{{ $t('task_monitor_total_input') }}</span>
        </div>
        <div class="mb-4 fs-4 font-color-main number-text">{{ overviewObj.body.inputCount }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4" size="18" color="#76CDEE">mark</VIcon>
          <span>{{ $t('task_monitor_total_output') }}</span>
        </div>
        <div class="mb-6 fs-4 font-color-main number-text">{{ overviewObj.body.outputCount }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_insert') }}</div>
            <div class="fs-6 font-color-main number-text">{{ overviewObj.body.insertCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_update') }}</div>
            <div class="fs-6 font-color-main number-text">{{ overviewObj.body.updateCount }}</div>
          </div>
          <div>
            <div class="mb-3">{{ $t('task_monitor_total_delete') }}</div>
            <div class="fs-6 font-color-main number-text">{{ overviewObj.body.deleteCount }}</div>
          </div>
        </div>
      </div>
      <div class="flex flex-column flex-fill pl-10">
        <div class="flex justify-content-between ml-6">
          <ElRadioGroup
            v-model="throughputObj.title.time"
            size="mini"
            @change="changeUtil"
            :disabled="lineData.x.length === 0"
          >
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
        <Chart type="line" :data="lineData" :options="lineOptions" no-x="second" class="v-echart flex-fill"></Chart>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'

import StatusTag from '@/components/StatusTag'
import { VIcon } from '@tap/component'
import { Chart } from '@tap/component'
import { isEmpty, formatTimeByTime } from '@/util'
import timeFunction from '@/mixins/timeFunction'

let lastMsg

export default {
  name: 'Info',
  components: { StatusTag, VIcon, Chart },
  mixins: [timeFunction],
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
          title: this.$t('dataFlow_dataScreening'),
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
      statusBtMap: {
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true }
      },
      creator: '',
      lineData: {
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
        yAxis: {
          axisLabel: {
            formatter: function (value) {
              if (value >= 1000) {
                value = value / 1000 + 'K'
              }
              return value
            }
          }
        },
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
            }
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
            }
          }
        ]
      }
    }
  },
  computed: {
    startDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['run'][task.status] || (task.status === 'draft' && task.checked === false)
    },
    stopDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['stop'][task.status]
    },
    editDisabled() {
      const { statusBtMap, task } = this
      return !statusBtMap['edit'][task.status]
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
      // this.loadHttp()
      this.loadOverviewData()
      this.$emit('onceLoadHttp')
      this.loadWS()
      this.sendMsg()
    },
    loadOverviewData() {
      const stats = this.task?.stats || {}
      let obj = this.overviewObj.body
      for (let key in obj) {
        obj[key] = stats[key.replace('Count', '')]?.rows || 0
      }
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
      this.$axios
        .get('tm/api/DataFlowInsights/runtimeMonitor', {
          params: params
        })
        .then(res => {
          let result = res[0] || {}
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
        timeList.push(formatTimeByTime(item.t, timeType))
        inputCountList.push(item.inputCount)
        outputCountList.push(item.outputCount)
      })
      this.lineData.x = timeList
      this.lineData.y[0] = inputCountList
      this.lineData.y[1] = outputCountList
    },
    changeUtil() {
      this.sendMsg()
    },
    start() {
      this.$checkAgentStatus(async () => {
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
          i18n.t('copy_Info_pTHIS', {
            val1: this.$t('task_list_edit_tip'),
            val2: this.$t('task_list_edit_tip1')
          }) +
            i18n.t('copy_Info_sPANS', { val1: this.$t('task_list_node_attr') }) +
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
      let attributes = {
        status,
        id: this.$route.params.id
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      return await this.$axios.patch('tm/api/DataFlows?where=', attributes).then(data => {
        this.responseHandler(data, this.$t('task_operation_successful'))
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
    }
  }
}
</script>
