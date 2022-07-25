<template>
  <section
    v-resize.top="{
      minHeight: 40
    }"
    class="console-panel border-top"
    :class="showConsole ? 'flex' : 'none'"
  >
    <div class="console-panel-side border-end overflow-auto py-2">
      <!--<div class="console-panel-header p-4">日志</div>-->
      <div class="step-list px-2">
        <div
          class="step-list-header step-item px-2 mb-1 flex align-center"
          :class="{ active: !nodeId }"
          @click="toggleNode()"
        >
          <VIcon size="20" class="mr-1">folder</VIcon>全部日志
        </div>
        <div
          v-for="node in nodeList"
          :key="node.id"
          class="step-item px-2 mb-1 flex align-center"
          :class="{ active: nodeId === node.id }"
          @click="toggleNode(node.id)"
        >
          <NodeIcon :node="node" :size="20" />
          <div class="flex-1 ml-1 text-truncate">{{ node.name }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-column">
      <div class="flex p-2">
        <ElCheckboxGroup v-model="levels" :min="1" size="mini" class="inline-flex flex-1">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
        </ElCheckboxGroup>

        <VIcon class="ml-3" size="16" @click="toggleConsole(false)">close</VIcon>
      </div>
      <div class="log-list-wrap flex-1 min-h-0 px-2 pb-2">
        <code class="log-list block h-100 overflow-auto py-1 rounded-2">
          <pre
            v-for="(item, i) in logList"
            :key="i"
            class="log-list-item m-0 px-1"
          ><span class="log-list-item-level" :class="`log-${item.grade}`">[{{item.grade}}]</span><span>{{item.log}}</span></pre>

          <pre
            class="justify-content-center align-center m-0 p-1"
            :class="loading ? 'flex' : 'none'"
          ><svg viewBox="25 25 50 50" class="circular">
              <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
            </svg><span class="ml-1 font-color-light">加载中</span>
          </pre>
        </code>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import Locale from '../../mixins/locale'
import VIcon from 'web-core/components/VIcon'
import { taskApi } from '@tap/api'
import NodeIcon from '../NodeIcon'

export default {
  name: 'ConsolePanel',

  directives: {
    resize
  },

  mixins: [Locale],

  components: { NodeIcon, VIcon },

  data() {
    return {
      levels: ['INFO', 'WARN', 'ERROR'],
      logList: [],
      nodeList: [],
      nodeId: '',
      loading: false
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion', 'showConsole', 'taskId'])
  },

  watch: {
    showConsole(v) {
      if (v) {
        // this.loadData()
      }
    }
  },

  beforeDestroy() {
    this.stopAuto()
  },

  methods: {
    ...mapMutations('dataflow', [
      'updateNodeProperties',
      'setNodeError',
      'clearNodeError',
      'setActiveType',
      'toggleConsole'
    ]),
    ...mapActions('dataflow', ['updateDag']),

    sleep(time) {
      return new Promise(resolve => {
        setTimeout(() => resolve(), time)
      })
    },

    async loadData() {
      clearTimeout(this.timerId)
      const { taskId, nodeId } = this
      this.loading = true
      console.log('加载数据', this.timerId) // eslint-disable-line
      /*await this.sleep(1000)
      const data = {
        nodes: {
          'df32e751-a4da-4c3c-bd5f-b49b06a4df8f': 'local-mongo-demo',
          'ceb55392-af9b-4985-b70a-cd2e43a93e31': 'local-mongo-test'
        },
        list: [
          {
            id: '62d7db94481422320337c173',
            grade: 'INFO',
            log: '2022-07-20 18:40:20 【新任务@12:35:51】【任务设置检测】：任务{新任务@12:35:51}检测通过'
          },
          {
            id: '62d7db94481422320337c174',
            grade: 'INFO',
            log: ' 2022-07-20 18:40:20 【新任务@12:35:51】【源节点设置检测】：节点{local-mongo-demo}检测通过'
          },
          {
            id: '62d7db94481422320337c175',
            grade: 'INFO',
            log: ' 2022-07-20 18:40:20 【新任务@12:35:51】【目标节点设置检测】：节点{local-mongo-test}检测通过'
          },
          {
            id: '62d7db94481422320337c177',
            grade: 'INFO',
            log: '2022-07-20 18:40:20 【新任务@12:35:51】【任务设置检测】：任务{新任务@12:35:51}检测通过'
          },
          {
            id: '62d7db94481422320337c178',
            grade: 'INFO',
            log: ' 2022-07-20 18:40:20 【新任务@12:35:51】【源节点设置检测】：节点{local-mongo-demo}检测通过'
          },
          {
            id: '62d7db94481422320337c179',
            grade: 'INFO',
            log: ' 2022-07-20 18:40:20 【新任务@12:35:51】【目标节点设置检测】：节点{local-mongo-test}检测通过'
          },
          {
            id: '62d7db94481422320337c17a',
            grade: 'INFO',
            log: ' 2022-07-20 18:40:20 【新任务@12:35:51】【源连接检测】：连接XXX检测通过'
          }
        ],
        total: 8,
        offset: '62d7db94481422320337c17a'
      }*/

      const data = await taskApi.getConsole({
        taskId,
        nodeId,
        grade: this.levels.join(',')
      })
      this.loading = false
      this.logList = data.list?.concat(data?.modelList || []) || []
      const nodeList = []
      Object.keys(data.nodes).forEach(id => {
        let node = this.nodeById(id)
        node && nodeList.push(node)
      })
      this.nodeList = nodeList
    },

    async autoLoad() {
      console.log('autoLoad') // eslint-disable-line
      await this.loadData()
      if (this.ifAuto) {
        this.timerId = setTimeout(() => {
          this.autoLoad()
        }, 3000)
      }
    },

    startAuto() {
      this.ifAuto = true
      this.autoLoad()
    },

    stopAuto() {
      this.ifAuto = false
      clearTimeout(this.timerId)
    },

    toggleNode(nodeId) {
      this.nodeId = nodeId
      this.autoLoad()
    }
  }
}
</script>

<style lang="scss">
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }

  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
<style scoped lang="scss">
.console-panel {
  position: relative;
  z-index: 10;
  height: 40vh;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: height;

  &-side {
    width: 240px;
  }

  &-header {
    font-size: 13px;
  }

  .step-item {
    line-height: 32px;
    border-radius: 6px;
    cursor: pointer;

    &:hover,
    &.active {
      background-color: #edf1f9;
    }
  }

  .log-list-wrap {
    .log-list {
      background-color: rgba(229, 236, 255, 0.3);

      &-item {
        white-space: pre-wrap;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      }

      .log-ERROR {
        color: map-get($color, danger);
      }
      .log-WARN {
        color: map-get($color, warning);
      }
      .log-INFO {
        color: map-get($fontColor, dark);
      }
    }
  }

  .circular {
    height: 16px;
    width: 16px;
    animation: loading-rotate 2s linear infinite;

    .path {
      animation: loading-dash 1.5s ease-in-out infinite;
      stroke-dasharray: 90, 150;
      stroke-dashoffset: 0;
      stroke-width: 2;
      stroke: map-get($color, primary);
      stroke-linecap: round;
    }
  }
}
</style>
