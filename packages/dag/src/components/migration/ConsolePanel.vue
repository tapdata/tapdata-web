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
      const { taskId, nodeId } = this
      this.loading = true
      const data = await taskApi.getConsole({
        taskId,
        nodeId,
        grade: this.levels.join(',')
      })
      let resetList = [
        {
          _id: '634d33ea95d95f29dea603b4',
          taskId: '634cda3eaaacb258fa4d45cd',
          describe: 'task_reset_start',
          status: 'START',
          level: 'INFO',
          time: '2022-10-17T10:52:26.645Z',
          _class: 'com.tapdata.tm.commons.task.dto.TaskResetEventDto'
        },
        {
          _id: '634d33ed95d95f29dea603b6',
          taskId: '634cda3eaaacb258fa4d45cd',
          nodeId: 'e79f8f7e-376f-4325-9be4-925c7e5955ea',
          describe: 'task_reset_pdk_node_external_resource',
          status: 'SUCCEED',
          level: 'INFO',
          elapsedTime: 2550,
          time: '2022-10-17T10:52:29.222Z',
          _class: 'com.tapdata.tm.commons.task.dto.TaskResetEventDto'
        },
        {
          _id: '634d34d095d95f29dea60423',
          taskId: '634cda3eaaacb258fa4d45cd',
          nodeId: 'e79f8f7e-376f-4325-9be4-925c7e5955ea',
          nodeName: 'nodeName',
          describe: 'task_reset_pdk_node_external_resource',
          status: 'FAILED',
          level: 'ERROR',
          errorMsg:
            "Call pdk function releaseExternalFunction occur an error: Execute query failed, sql: SELECT COUNT(*) FROM pg_replication_slots WHERE slot_name='tapdata_cdc_460aedb5_113b_4957_b380_18699919962c' AND active='false', code: 08001(0), error: Connection to localhost:5496 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.\n Task: 新任务@12:29:50 PM(634cda3eaaacb258fa4d45cd), node: customer(e79f8f7e-376f-4325-9be4-925c7e5955ea), pdk connector: io.tapdata-postgres-1.0-SNAPSHOT",
          errorStack:
            "io.tapdata.flow.engine.V2.task.cleaner.TaskCleanerException: Call pdk function releaseExternalFunction occur an error: Execute query failed, sql: SELECT COUNT(*) FROM pg_replication_slots WHERE slot_name='tapdata_cdc_460aedb5_113b_4957_b380_18699919962c' AND active='false', code: 08001(0), error: Connection to localhost:5496 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.\n Task: 新任务@12:29:50 PM(634cda3eaaacb258fa4d45cd), node: customer(e79f8f7e-376f-4325-9be4-925c7e5955ea), pdk connector: io.tapdata-postgres-1.0-SNAPSHOT\n\tat io.tapdata.flow.engine.V2.task.cleaner.TaskCleaner.dataNodeDestroy(TaskCleaner.java:217)\n\tat io.tapdata.flow.engine.V2.task.cleaner.TaskCleaner.clean(TaskCleaner.java:92)\n\tat io.tapdata.flow.engine.V2.task.cleaner.TaskCleanerService.clean(TaskCleanerService.java:34)\n\tat io.tapdata.websocket.handler.DataSyncEventHandler.handle(DataSyncEventHandler.java:38)\n\tat io.tapdata.websocket.WebSocketEventHandler.handle(WebSocketEventHandler.java:60)\n\tat io.tapdata.websocket.ManagementWebsocketHandler.handleMessage(ManagementWebsocketHandler.java:252)\n\tat org.springframework.web.socket.adapter.standard.StandardWebSocketHandlerAdapter.handleTextMessage(StandardWebSocketHandlerAdapter.java:113)\n\tat org.springframework.web.socket.adapter.standard.StandardWebSocketHandlerAdapter.access$000(StandardWebSocketHandlerAdapter.java:42)\n\tat org.springframework.web.socket.adapter.standard.StandardWebSocketHandlerAdapter$3.onMessage(StandardWebSocketHandlerAdapter.java:84)\n\tat org.springframework.web.socket.adapter.standard.StandardWebSocketHandlerAdapter$3.onMessage(StandardWebSocketHandlerAdapter.java:81)\n\tat org.apache.tomcat.websocket.WsFrameBase.sendMessageText(WsFrameBase.java:395)\n\tat org.apache.tomcat.websocket.WsFrameBase.processDataText(WsFrameBase.java:495)\n\tat org.apache.tomcat.websocket.WsFrameBase.processData(WsFrameBase.java:294)\n\tat org.apache.tomcat.websocket.WsFrameBase.processInputBuffer(WsFrameBase.java:133)\n\tat org.apache.tomcat.websocket.WsFrameClient.processSocketRead(WsFrameClient.java:95)\n\tat org.apache.tomcat.websocket.WsFrameClient.resumeProcessing(WsFrameClient.java:209)\n\tat org.apache.tomcat.websocket.WsFrameClient.access$300(WsFrameClient.java:31)\n\tat org.apache.tomcat.websocket.WsFrameClient$WsFrameClientCompletionHandler.doResumeProcessing(WsFrameClient.java:186)\n\tat org.apache.tomcat.websocket.WsFrameClient$WsFrameClientCompletionHandler.completed(WsFrameClient.java:163)\n\tat org.apache.tomcat.websocket.WsFrameClient$WsFrameClientCompletionHandler.completed(WsFrameClient.java:148)\n\tat sun.nio.ch.Invoker.invokeUnchecked(Invoker.java:126)\n\tat sun.nio.ch.Invoker$2.run(Invoker.java:218)\n\tat sun.nio.ch.AsynchronousChannelGroupImpl$1.run(AsynchronousChannelGroupImpl.java:112)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)\n\tat java.lang.Thread.run(Thread.java:748)\nCaused by: code: 10001 | message: Execute query failed, sql: SELECT COUNT(*) FROM pg_replication_slots WHERE slot_name='tapdata_cdc_460aedb5_113b_4957_b380_18699919962c' AND active='false', code: 08001(0), error: Connection to localhost:5496 refused. Check that the hostname and port are correct and that the postmaster is accepting TCP/IP connections.\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethodPrivate(PDKInvocationMonitor.java:169)\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.lambda$invokePDKMethod$5(PDKInvocationMonitor.java:116)\n\tat io.tapdata.pdk.core.api.Node.applyClassLoaderContext(Node.java:23)\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethod(PDKInvocationMonitor.java:116)\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethod(PDKInvocationMonitor.java:100)\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethod(PDKInvocationMonitor.java:94)\n\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invoke(PDKInvocationMonitor.java:71)\n\tat io.tapdata.flow.engine.V2.task.cleaner.TaskCleaner.dataNodeDestroy(TaskCleaner.java:211)\n\t... 25 more\n",
          elapsedTime: 7734,
          time: '2022-10-17T10:56:16.122Z',
          _class: 'com.tapdata.tm.commons.task.dto.TaskResetEventDto'
        }
      ]
      this.loading = false
      this.logList = data.list?.concat(data?.modelList || []).concat(this.getResetList(resetList)) || []

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

    startAuto() {
      this.ifAuto = true
      this.autoLoad()
    },

    stopAuto() {
      this.ifAuto = false
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
        unknown_error: 'packages_dag_unknown_error'
      }
      let result = []
      data.forEach(el => {
        const time = dayjs(el.time).format('YYYY-MM-DD HH:mm:ss')
        const desc = i18n.t(I18N_MAP[el.describe], el)
        let item = {}
        item.id = el.id
        item.grade = el.level
        item.log = `${time} ${desc}`
        if (['FAILED'].includes(el.status) && item.grade === 'ERROR') {
          item.log += `${el.errorMsg}\n${el.errorStack}`
        }
        result.push(item)
      })
      return result
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
