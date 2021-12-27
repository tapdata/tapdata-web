<template>
  <div class="card-box px-2 py-6">
    <div class="flex justify-content-between">
      <div class="info-line">
        <span class="mr-4 fs-6 font-color-main">{{ task.name }}</span>
        <StatusTag
          type="text"
          target="task"
          :status="task.isFinished ? 'finished' : task.status || 'running'"
          only-img
        ></StatusTag>
        <span class="ml-6 font-color-sub">
          创建人：<span>{{ task.creator }}</span>
        </span>
        <span class="ml-6 font-color-sub">
          开始时间：<span>{{ formatTime(task.last_updated) }}</span>
        </span>
      </div>
      <div class="operation">
        <VButton type="primary" :disabled="startDisabled" @click="start">启动</VButton>
        <VButton type="danger" :disabled="stopDisabled" @click="stop">停止</VButton>
        <VButton :disabled="editDisabled" @click="edit">编辑</VButton>
      </div>
    </div>
    <div class="flex justify-content-between mt-6">
      <div class="p-6" style="background-color: #fafafa; min-width: 240px">
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-primary" size="18">mark</VIcon>
          <span>总输入</span>
        </div>
        <div class="mb-4 fs-4 font-color-main">{{ overviewObj.body.inputCount }}</div>
        <div class="flex align-items-center mb-2">
          <VIcon class="mr-4 color-success" size="18">mark</VIcon>
          <span>总输出</span>
        </div>
        <div class="mb-6 fs-4 font-color-main">{{ overviewObj.body.outputCount }}</div>
        <div class="flex justify-content-between text-center">
          <div>
            <div class="mb-3">总插入</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.insertCount }}</div>
          </div>
          <div>
            <div class="mb-3">总更新</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.updateCount }}</div>
          </div>
          <div>
            <div class="mb-3">总删除</div>
            <div class="fs-6 font-color-main">{{ overviewObj.body.deleteCount }}</div>
          </div>
        </div>
      </div>
      <div class="flex-1" style="min-height: 250px">
        <div class="flex justify-content-between" style="padding-left: 5%">
          <ElRadioGroup v-model="throughputObj.title.time" size="mini" @change="changeUtil">
            <ElRadioButton label="second">{{ $t('dataFlow.second') }}</ElRadioButton>
            <ElRadioButton label="minute">{{ $t('dataFlow.min') }}</ElRadioButton>
            <ElRadioButton label="hour">{{ $t('dataFlow.hour') }}</ElRadioButton>
            <ElRadioButton label="day">{{ $t('dataFlow.day') }}</ElRadioButton>
          </ElRadioGroup>
          <div
            class="px-2"
            style="line-height: 27px; border: 1px solid #e8e8e8; border-radius: 4px; box-sizing: border-box"
          >
            QPS
          </div>
        </div>
        <VEchart :option="throughputObj.body" class="v-echart" style="height: 100%"></VEchart>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VEchart from '@/components/VEchart'
import VIcon from '@/components/VIcon'
import { formatTime, isEmpty } from '@/util'

let lastMsg
export default {
  name: 'Info',
  components: { StatusTag, VEchart, VIcon },
  props: {
    task: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      selectFlow: 'flow_', // 选中节点
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
          title: this.$t('dataFlow.inputOutput'),
          tip: this.$t('dataFlow.throughputpop'),
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
  // mounted() {
  //   this.init()
  // },
  destroyed() {
    this.$ws.off('dataFlowInsight')
  },
  methods: {
    init() {
      this.loadHttp()
      this.loadWS()
      this.sendMsg()
    },
    loadWS() {
      this.$ws.on('dataFlowInsight', data => {
        this.getOverview(data) // 事件统计
        this.getThroughputOpt(data) // 输入输出统计
      })
    },
    // 获取节点类型（是否是全部节点）
    sendMsg() {
      if (this.stageId === 'all') {
        this.selectFlow = 'flow_'
      } else {
        this.selectFlow = 'stage_'
      }

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
      if (this.stageId !== 'all') {
        msg['stageId'] = this.stageId
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
        timeList.push(this.formatTime(item.t, timeType))
        inputCountList.push(item.inputCount)
        outputCountList.push(item.outputCount)
      })

      this.throughputObj.body = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          right: 50
        },
        grid: {
          left: '5%',
          right: '10%',
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
            name: this.$t('dataFlow.input'),
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
            name: this.$t('dataFlow.output'),
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
    formatTime(date) {
      return formatTime(date)
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
        message = '初始化类型的任务暂停后如果再次启动，任务会从头开始同步，确定暂停?'
        title = '重要提醒'
      }
      if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
        const h = this.$createElement
        let arr = '任务XXX中含有聚合处理节点，任务停止后再次启动，任务会先进行重置，确定停止？'.split('XXX')
        message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
        title = '重要提醒'
      }
      this.$confirm(message, title, {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus({ status: 'stopping' })
        }
      })
    },
    edit() {
      console.log('编辑') // eslint-disable-line
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
      return await this.$axios
        .post('tm/api/DataFlows/update?where=' + encodeURIComponent(JSON.stringify(where)), attributes)
        .then(data => {
          this.responseHandler(data, '操作成功')
        })
        .catch(() => {
          this.$message.error('任务启动失败，请编辑任务完成映射配置')
        })
    },
    responseHandler(data, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: '此任务不存在',
          6: '任务状态不允许这种操作',
          7: '操作失败，请重试',
          8: '任务状态不允许这种操作'
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
        delete_confirm_title: '是否删除该任务？',
        delete_confirm_message: '删除任务 xxx 后，此任务将无法恢复',

        stop_confirm_title: '是否暂停该任务？',
        stop_confirm_message: '暂停任务 xxx 后，任务中未完成全量同步的表再次启动时，会重新执行全量同步',

        force_stop_confirm_title: '是否强制停止该任务？',
        force_stop_confirm_message: '强制停止任务 xxx 将立即中断数据传输强制任务快速停止，并重置该任务',

        initialize_confirm_title: '是否重置该任务？',
        initialize_confirm_message: '重置任务 xxx 将清除任务同步进度，任务将重新执行'
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
