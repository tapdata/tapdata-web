<template>
  <div class="card-box p-6">
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
          开始时间：<span>{{ task.last_updated }}</span>
        </span>
      </div>
      <div class="operation">
        <VButton type="primary">启动</VButton>
        <VButton type="danger">停止</VButton>
        <VButton>编辑</VButton>
      </div>
    </div>
    <div class="flex justify-content-between mt-6">
      <div class="p-6" style="background-color: #fafafa; min-width: 240px">
        <div class="mb-2">总输入</div>
        <div class="mb-4 fs-4 font-color-main">{{ overviewObj.body.inputCount }}</div>
        <div class="mb-2">总输出</div>
        <div class="mb-6 fs-4 font-color-main">{{ overviewObj.body.outputCount }}</div>
        <div class="flex justify-content-between">
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

let lastMsg
export default {
  name: 'Info',
  components: { StatusTag, VEchart },
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
      }
    }
  },
  mounted() {
    this.init()
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
      return
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
    changeUtil() {
      console.log(arguments)
      this.sendMsg()
    }
  }
}
</script>
