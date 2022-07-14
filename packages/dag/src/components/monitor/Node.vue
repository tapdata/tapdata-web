<template>
  <DFNode class="position-s" v-bind="$attrs" v-on="$listeners">
    <div class="node-card rounded-lg px-2 pt-6 mt-n3">
      <div class="node-card-content p-2">
        <div class="grid statistic-list">
          <div v-if="taskType !== 'initial_sync' && !isProcessorNode" class="statistic">
            <div class="statistic-title">增量时间点</div>
            <div class="statistic-content">
              <div class="statistic-value">2022-12-01 12:12:12</div>
            </div>
          </div>

          <div class="statistic">
            <div class="statistic-title">耗时</div>
            <div class="statistic-content">
              <div class="statistic-value">123ms</div>
            </div>
          </div>

          <div class="statistic">
            <div class="statistic-title">累积输入事件</div>
            <div class="statistic-content">
              <div class="statistic-value">666</div>
            </div>
          </div>

          <div class="statistic">
            <div class="statistic-title">累积输出事件</div>
            <div class="statistic-content">
              <div class="statistic-value">666</div>
            </div>
          </div>

          <div class="statistic">
            <div class="statistic-title">QPS</div>
            <div class="statistic-content">
              <div class="statistic-value">200</div>
            </div>
          </div>
        </div>
        <div v-if="showStatus" class="grid statistic-list mt-2">
          <div v-if="taskType !== 'cdc'" class="statistic">
            <div class="statistic-title">全量</div>
            <div class="statistic-content">
              <Chart ref="chart" :extend="options" style="width: 80px; height: 80px"></Chart>
            </div>
          </div>
          <div v-if="taskType !== 'initial_sync'" class="statistic">
            <div class="statistic-title">增量</div>
            <div class="statistic-content">
              <Chart ref="chart" :extend="options" style="width: 80px; height: 80px"></Chart>
            </div>
          </div>
        </div>
      </div>
      <div class="node-card-footer flex align-center justify-content-end">
        <ElProgress v-if="taskType !== 'cdc' && showStatus" class="flex-1 mr-3" :show-text="false" :percentage="50" />
        <VIcon size="16">menu</VIcon>
      </div>
    </div>
  </DFNode>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { sourceEndpoint, targetEndpoint } from '../style'
import { NODE_PREFIX } from '../constants'
import DFNode from '../DFNode'
import { Chart } from '@tap/component'
import VIcon from 'web-core/components/VIcon'

export default {
  name: 'Node',
  components: {
    Chart,
    DFNode,
    VIcon
  },

  props: {
    node: {},
    taskType: String
  },

  data() {
    return {
      id: this.$attrs.id,
      options: {
        tooltip: {
          trigger: 'item'
        },
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
            data: [
              {
                name: '待进行',
                value: 10,
                color: '#F7D762'
              },
              {
                name: '无需创建',
                value: 20,
                color: '#88DBDA'
              },
              {
                name: '已完成',
                value: 30,
                color: '#82C647'
              },
              {
                name: '错误',
                value: 40,
                color: '#EC8181'
              }
            ]
          }
        ]
      },
      syncData: [
        {
          name: '待进行',
          value: 10,
          color: '#F7D762'
        },
        {
          name: '无需创建',
          value: 20,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          value: 30,
          color: '#82C647'
        },
        {
          name: '错误',
          value: 40,
          color: '#EC8181'
        }
      ],
      cdcData: [
        {
          name: '待进行',
          value: 10,
          color: '#F7D762'
        },
        {
          name: '无需创建',
          value: 20,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          value: 30,
          color: '#82C647'
        },
        {
          name: '错误',
          value: 40,
          color: '#EC8181'
        }
      ]
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

    showStatus() {
      const { type, $inputs } = this.node
      return (type === 'database' || type === 'table') && !$inputs.length
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
</style>
