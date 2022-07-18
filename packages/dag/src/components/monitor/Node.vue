<template>
  <DFNode class="position-s" v-bind="$attrs" v-on="$listeners">
    <div class="node-card rounded-lg px-2 pt-6 mt-n3">
      <div class="node-card-content p-2">
        <div class="grid statistic-list">
          <div v-if="taskType !== 'initial_sync' && isSource" class="statistic">
            <div class="statistic-title">增量时间点</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ cdcEventStartTime }}</div>
            </div>
          </div>

          <div v-if="taskType !== 'initial_sync' && isSource" class="statistic">
            <!--增量耗时-->
            <div class="statistic-title">耗时</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.incrementalDelay }}ms</div>
            </div>
          </div>

          <div v-if="isTarget" class="statistic">
            <!--写入-->
            <div class="statistic-title">耗时</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.writeDelay }}ms</div>
            </div>
          </div>

          <div v-if="isProcessorNode" class="statistic">
            <!--处理-->
            <div class="statistic-title">耗时</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.processDelay }}ms</div>
            </div>
          </div>

          <div v-if="isTarget || isProcessorNode" class="statistic">
            <div class="statistic-title">累积输入事件</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.inputEventTotal }}</div>
            </div>
          </div>

          <div v-if="isSource || isProcessorNode" class="statistic">
            <div class="statistic-title">累积输出事件</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.outputEventTotal }}</div>
            </div>
          </div>

          <div class="statistic">
            <div class="statistic-title">QPS</div>
            <div class="statistic-content">
              <div class="statistic-value">{{ sample.qps }}</div>
            </div>
          </div>
        </div>
        <div v-if="isSource" class="grid statistic-list mt-2">
          <div v-if="taskType !== 'cdc'" class="statistic">
            <div class="statistic-title">全量</div>
            <div class="statistic-content">
              <Chart ref="chart" :extend="initialSyncOption" style="width: 80px; height: 80px"></Chart>
            </div>
          </div>
          <div v-if="taskType !== 'initial_sync'" class="statistic">
            <div class="statistic-title">增量</div>
            <div class="statistic-content">
              <Chart ref="chart" :extend="cdcOption" style="width: 80px; height: 80px"></Chart>
            </div>
          </div>
        </div>
      </div>
      <div class="node-card-footer flex align-center justify-content-end">
        <ElTooltip v-if="taskType !== 'cdc' && isSource" :content="initialSyncProcessTip">
          <ElProgress class="flex-1 mr-3" :show-text="false" :percentage="initialSyncProcess" />
        </ElTooltip>

        <button @click="$emit('open-detail')" class="icon-btn">
          <VIcon size="16">menu</VIcon>
        </button>
      </div>
    </div>
  </DFNode>
</template>

<script>
import DFNode from '../DFNode'
import { Chart } from '@tap/component'
import VIcon from 'web-core/components/VIcon'
import dayjs from 'dayjs'

export default {
  name: 'Node',
  components: {
    Chart,
    DFNode,
    VIcon
  },

  props: {
    node: {},
    sample: {
      type: Object,
      default: () => ({
        cdcEventStartTime: 1658117353136,
        inputEventTotal: 996,
        outputEventTotal: 996,
        incrementalDelay: 600,
        writeDelay: 700,
        processDelay: 500,
        qps: 888,
        initialSyncState: {
          wait: 60,
          process: 100,
          success: 120,
          error: 15
        },
        cdcState: {
          wait: 160,
          process: 100,
          success: 120,
          error: 15
        },
        milestone: {
          finish: 10,
          total: 100,
          planTime: 100
        }
      })
    },
    taskType: String
  },

  data() {
    return {
      id: this.$attrs.id,
      seriesItemMap: {
        wait: {
          name: '待进行',
          color: '#F7D762'
        },
        process: {
          name: '进行中',
          color: '#88DBDA'
        },
        success: {
          name: '已完成',
          color: '#82C647'
        },
        error: {
          name: '错误',
          color: '#EC8181'
        }
      },

      initialSyncOption: this.getPieOption(),
      cdcOption: this.getPieOption()
    }
  },

  computed: {
    nodeStyle() {
      const [left = 0, top = 0] = this.node.attrs?.position || []
      return {
        left: left + 'px',
        top: top + 'px'
      }
    },

    isProcessorNode() {
      const { type } = this.node
      return type !== 'database' && type !== 'table'
    },

    isSource() {
      const { type, $inputs } = this.node
      return (type === 'database' || type === 'table') && !$inputs.length
    },

    isTarget() {
      const { type, $outputs } = this.node
      return (type === 'database' || type === 'table') && !$outputs.length
    },

    showStatus() {
      const { type, $inputs } = this.node
      return (type === 'database' || type === 'table') && !$inputs.length
    },

    cdcEventStartTime() {
      return dayjs(this.sample.cdcEventStartTime).format('YYYY-MM-DD HH:mm:ss')
    },

    initialSyncProcess() {
      const { milestone } = this.sample
      return Math.round((milestone.finish / milestone.total) * 100)
    },

    initialSyncProcessTip() {
      const { milestone } = this.sample
      return ` ${milestone.finish}/${milestone.total} | 预计全量完成还需 ${milestone.planTime}ms`
    }
  },

  watch: {
    'sample.initialSyncState': {
      immediate: true,
      handler(v) {
        this.seriesHandler(this.initialSyncOption, v)
      }
    },

    'sample.cdcState': {
      immediate: true,
      handler(v) {
        this.seriesHandler(this.cdcOption, v)
      }
    }
  },

  methods: {
    getPieOption() {
      return {
        tooltip: {},
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '80%'],
            center: ['50%', '50%'],
            label: { show: false },
            labelLine: { show: false },
            data: []
          }
        ]
      }
    },

    seriesHandler(option, data) {
      const { seriesItemMap } = this
      option.series[0].data = Object.entries(data).map(([key, value]) => {
        return {
          value,
          name: seriesItemMap[key].name,
          itemStyle: {
            color: seriesItemMap[key].color
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.node-card {
  position: absolute;
  z-index: -1;
  top: 100%;
  left: 50%;
  background-color: #fff;
  transform: translateX(-50%);
  &-content {
    background-color: #f5f8fe;
  }
  &-footer {
    height: 28px;
  }

  .statistic-list {
    grid-template-columns: repeat(2, minmax(130px, 1fr));
    gap: 4px;
  }

  .statistic {
    display: inline-block;
    color: map-get($fontColor, light);
    &-title {
      font-size: 12px;
      line-height: 1.5;
    }

    &-value {
      color: map-get($fontColor, dark);
      font-weight: 500;
      font-size: 14px;
      font-family: DIN;
      white-space: nowrap;
    }
  }
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  color: #4e5969;
  background: #fff;
  outline: none;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;

  &.active,
  &:hover {
    color: map-get($color, primary);
    background: #eef3ff;
  }
}
</style>
