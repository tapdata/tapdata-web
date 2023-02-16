<template>
  <section
    v-resize.top="{
      minHeight: 40
    }"
    class="console-panel border-top"
    :class="showConsole ? 'flex' : 'none'"
  >
    <div class="console-panel-side border-end overflow-auto py-2 flex-shrink-0">
      <!--<div class="console-panel-header p-4">日志</div>-->
      <div class="step-list px-2">
        <div
          class="step-list-header step-item px-2 mb-1 flex align-center font-color-dark"
          :class="{ active: !nodeId }"
          @click="toggleNode()"
        >
          <VIcon size="20" class="mr-1">folder</VIcon>{{ $t('packages_dag_migration_consolepanel_quanburizhi') }}
        </div>
        <div
          v-for="node in nodeList"
          :key="node.id"
          class="step-item px-2 mb-1 flex align-center font-color-dark"
          :class="{ active: nodeId === node.id }"
          @click="toggleNode(node.id)"
        >
          <NodeIcon :node="node" :size="18" />
          <div class="flex-1 ml-1 text-truncate">{{ node.name }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-column">
      <div class="flex p-2">
        <ElCheckboxGroup v-model="levels" :min="1" size="mini" class="inline-flex flex-1" @change="autoLoad">
          <ElCheckbox label="INFO">INFO</ElCheckbox>
          <ElCheckbox label="WARN">WARN</ElCheckbox>
          <ElCheckbox label="ERROR">ERROR</ElCheckbox>
        </ElCheckboxGroup>

        <VIcon class="ml-3" size="16" @click="toggleConsole(false)">close</VIcon>
      </div>
      <div class="log-list-wrap flex-1 min-h-0 px-2 pb-2">
        <code class="log-list block h-100 overflow-auto py-1 rounded-2">
          <VEmpty v-if="!logList.length && !ifAuto && !loading" large />
          <pre
            v-for="(item, i) in logList"
            :key="i"
            class="log-list-item m-0 px-1"
          ><span class="log-list-item-level mr-1" :class="`log-${item.grade}`">[{{item.grade}}]</span><span>{{item.log}}</span></pre>

          <pre v-if="warnNum || errorNum" class="flex m-0 px-1">
            <span class="mr-1">{{ $t('packages_dag_migration_consolepanel_dangqianjiancefaxian') }}</span>
            <span v-if="warnNum" class="color-warning mr-1">{{ warnNum + $t('packages_dag_migration_consolepanel_ge') }}WARN,</span>
            <span v-if="errorNum" class="color-danger mr-1">{{ errorNum + $t('packages_dag_migration_consolepanel_ge') }}ERROR,</span>
            <span>{{ $t('packages_dag_migration_consolepanel_qingguanzhu') }}</span>
          </pre>

          <pre
            class="justify-content-center align-center m-0 p-1"
            :class="ifAuto || loading ? 'flex' : 'none'"
          ><svg viewBox="25 25 50 50" class="circular">
              <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
            </svg><span class="ml-1 font-color-light">{{$t('packages_dag_loading')}}</span>
          </pre>
        </code>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import dayjs from 'dayjs'
import i18n from '@tap/i18n'
import { deepCopy } from '@tap/shared'

import '@tap/component/src/directives/resize/index.scss'
import resize from '@tap/component/src/directives/resize'
import { taskApi } from '@tap/api'
import { VEmpty, VIcon } from '@tap/component'
import NodeIcon from '../NodeIcon'

export default {
  name: 'ConsolePanel',

  directives: {
    resize
  },

  components: { VEmpty, NodeIcon, VIcon },

  data() {
    return {
      levels: ['INFO', 'WARN', 'ERROR'],
      logList: [],
      nodeList: [],
      nodeId: '',
      ifAuto: false,
      loading: false,
      type: '',
      over: false,
      warnNum: 0,
      errorNum: 0
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
      const { taskId, nodeId } = this
      this.loading = true
      const data = await taskApi.getConsole({
        taskId: taskId || this.$route.params.id,
        nodeId,
        type: this.type,
        grade: this.levels.join(',')
      })
      const list = data.list?.filter(t => !t.describe) || []
      const resetList = data.list?.filter(t => t.describe) || []
      const modelList = data.modelList || []
      this.loading = false
      this.logList = list.concat(modelList).concat(this.getResetList(resetList)) || []
      const { warnNum = 0, errorNum = 0 } = data || {}
      this.warnNum = warnNum
      this.errorNum = errorNum
      this.over = data.over

      const nodeList = []
      Object.keys(data.nodes).forEach(id => {
        let node = this.nodeById(id)
        node && nodeList.push(node)
      })
      this.nodeList = nodeList
      this.timeout = this.logList.length ? 3000 : 1000
      if (data.over) this.stopAuto()
    },

    async autoLoad() {
      clearTimeout(this.timerId)
      await this.loadData()
      if (this.ifAuto) {
        this.timerId = setTimeout(() => {
          this.autoLoad()
        }, this.timeout || 3000)
      }
    },

    startAuto(type) {
      this.ifAuto = true
      this.type = type
      this.autoLoad()
    },

    stopAuto() {
      this.ifAuto = false
      this.$emit('stopAuto')
      clearTimeout(this.timerId)
    },

    toggleNode(nodeId) {
      if (this.nodeId === nodeId) return
      this.nodeId = nodeId
      this.autoLoad()
    },

    getResetList(data) {
      const I18N_MAP = {
        task_reset_start: 'packages_dag_task_reset_start',
        task_reset_pdk_node_external_resource: 'packages_dag_task_reset_pdk_node_external_resource',
        task_reset_pdk_node_state: 'packages_dag_task_reset_pdk_node_state',
        task_reset_merge_node: 'packages_dag_task_reset_merge_node',
        task_reset_aggregate_node: 'packages_dag_task_reset_aggregate_node',
        task_reset_custom_node: 'packages_dag_task_reset_custom_node',
        task_reset_join_node: 'packages_dag_task_reset_join_node',
        task_reset_end: 'packages_dag_task_reset_end',
        unknown_error: 'packages_dag_unknown_error',
        SUCCEED: 'packages_dag_console_log_status_success',
        TASK_SUCCEED: 'packages_dag_console_log_status_success',
        FAILED: 'packages_dag_console_log_status_fail',
        TASK_FAILED: 'packages_dag_console_log_status_fail'
      }
      let result = []
      data.forEach(el => {
        el.st = el.status
        el.status = i18n.t(I18N_MAP[el.status])
        const time = dayjs(el.time).format('YYYY-MM-DD HH:mm:ss')
        const desc = i18n.t(I18N_MAP[el.describe], el)
        let item = {}
        item.id = el.id
        item.grade = el.level
        item.log = `${time} ${desc}`
        if (['FAILED'].includes(el.st) && item.grade === 'ERROR') {
          item.log += `\n${el.errorMsg}\n${el.errorStack}`
        }
        result.push(item)
        if (el.describe === 'task_reset_end' && ['FAILED', 'TASK_FAILED'].includes(el.st)) {
          let { resetTimes = 0, resetAllTimes = 0 } = el
          const rest = resetAllTimes - resetTimes
          if (rest) {
            let startItem = deepCopy(item)
            startItem.log = `${time} ${i18n.t('packages_dag_auto_reset_start', Object.assign({}, el, { rest }))}`
            result.push(startItem)
          }
          if (resetTimes) {
            let nthItem = deepCopy(item)
            nthItem.log = `${time} ${i18n.t('packages_dag_auto_reset_start_nth', el)}`
            result.push(nthItem)
          }
          if (resetAllTimes && resetAllTimes === resetTimes) {
            let resultItem = deepCopy(item)
            resultItem.log = `${time} ${i18n.t('packages_dag_auto_reset_start_result', el)}`
            result.push(resultItem)
          }
        }
      })
      return result
    },

    getList() {
      return this.logList
    },

    getWarnAndError() {
      const { warnNum = 0, errorNum = 0 } = this
      return { warnNum, errorNum }
    },

    getData() {
      const { warnNum = 0, errorNum = 0, over, logList } = this
      return { warnNum, errorNum, over, logList }
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
      background-color: rgba(229, 236, 255, 0.3);
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
