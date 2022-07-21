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
      <div class="flex justify-content-between p-2">
        <ElCheckboxGroup v-model="levels" :min="1" size="mini" class="inline-flex">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
        </ElCheckboxGroup>

        <VIcon class="ml-3" size="16" @click="toggleConsole(false)">close</VIcon>
      </div>
      <div class="log-list-wrap flex-1 min-h-0 px-2 pb-2">
        <code class="log-list block h-100 overflow-auto py-1 rounded-2" v-loading="loading">
          <pre
            v-for="(item, i) in logList"
            :key="i"
            class="log-list-item m-0 px-1"
          ><span class="log-list-item-level">[{{item.grade}}]</span><span>{{item.log}}</span></pre>
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
        this.loadData()
      }
    }
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
    async loadData() {
      const { taskId, nodeId } = this
      /*const data = {
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
      this.loading = true
      const data = await taskApi.getConsole({
        taskId,
        nodeId,
        grade: this.levels.join(',')
      })
      this.loading = false
      this.logList = data.list
      const nodeList = []
      this.nodeList = Object.keys(data.nodes).forEach(id => {
        let node = this.nodeById(id)
        node && nodeList.push(node)
      })
      this.nodeList = nodeList
    },

    toggleNode(nodeId) {
      this.nodeId = nodeId
      this.loadData()
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
$color: map-get($color, primary);
$tabsHeaderWidth: 220px;
$headerHeight: 40px;

.title-input-wrap {
  position: relative;
  flex: 1;
  font-size: 14px;

  &:hover {
    .title-input {
      border-color: #dcdfe6;
    }
    .title-input-icon {
      color: $color;
    }
  }

  .title-input {
    position: relative;
    padding: 2px 28px 1px 8px;
    width: 100%;
    height: 28px;
    line-height: 28px;
    outline: none;
    box-shadow: none;
    background: 0 0;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: inherit;
    transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:focus {
      border-color: #409eff;
      & + .title-input-icon {
        color: $color;
      }
    }
  }

  .title-input-icon {
    position: absolute;
    right: 8px;
    height: 28px;
  }
}

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
      background-color: rgba(229, 236, 255, 0.22);

      &-item {
        white-space: pre-wrap;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      }
    }
  }

  &-close {
    position: absolute;
    z-index: 11;
    top: 12px;
    right: 16px;
  }

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .tabs-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: $tabsHeaderWidth;
    height: $headerHeight;

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  .panel-header {
    height: $headerHeight;
  }

  .header-icon {
    color: $color;
    font-size: 18px;
  }

  .setting-panel-wrap {
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #fff;
  }

  ::v-deep {
    .config-tabs.el-tabs {
      height: 100%;

      > .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          padding-left: $tabsHeaderWidth;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
        }
        .el-tabs__active-bar {
          background-color: $color;
        }

        .el-tabs__item {
          font-weight: 400;

          &.is-active,
          &:hover {
            color: $color;
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 40px);
        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}
</style>
