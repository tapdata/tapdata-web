<template>
  <section
    class="monitor-dashboard-wrap flex flex-column flex-fit overflow-hidden"
    v-loading="loading"
  >
    <div v-if="task" class="flex align-items-center g-panel-container">
      <div class="monitor-icon rounded-circle overflow-hidden mr-6 p-3">
        <img src="../../../public/images/task/console.png" />
      </div>
      <div class="base-info flex-fit overflow-hidden">
        <div class="flex align-items-center">
          <ElTooltip :content="task.name" placement="top">
            <ElLink
              class="fs-7 mr-4 inline-block ellipsis"
              style="max-width: 50%"
              type="primary"
              >{{ $t('task_name') }}: {{ task.name }}</ElLink
            >
          </ElTooltip>
          <StatusTag
            type="tag"
            target="task"
            :status="task.isFinished ? 'finished' : task.status || 'running'"
          ></StatusTag>
        </div>
        <div class="mt-1">
          <span>{{ $t('task_monitor_founder') }}: {{ task.createUser }}</span>
          <span class="ml-4"
            >{{ $t('task_type') }}{{ $t('field_mapping_field_mapping_dialog_')
            }}{{ taskType.label }}</span
          >
        </div>
        <div class="mt-2">
          <VButton
            type="primary"
            :disabled="
              !statusBtMap['run'][task.status] ||
              (task.status === 'draft' && task.checked === false)
            "
            :loading="startLoading"
            @click="start"
            >{{ $t('task_monitor_start') }}</VButton
          >
          <VButton
            :disabled="!statusBtMap['stop'][task.status]"
            @click="stop"
            >{{ $t('task_monitor_stop') }}</VButton
          >
          <VButton
            :loading="resetBtnLoading"
            :disabled="!statusBtMap['reset'][task.status]"
            @click="reset"
            >{{ $t('task_monitor_reset') }}</VButton
          >
          <VButton
            :disabled="!statusBtMap['forceStop'][task.status]"
            @click="forceStop"
            >{{ $t('task_monitor_forced_stop') }}</VButton
          >
        </div>
      </div>
      <div class="input-and-output flex align-center">
        <span>{{ $t('task_monitor_total_output') }}</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{
          task.totalOutput
        }}</span>
        <span class="ml-6">{{ $t('task_monitor_total_input') }}</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{
          task.totalInput
        }}</span>
      </div>
    </div>
    <div v-if="task" class="dashboard-main flex mt-6 flex-fit overflow-hidden">
      <div class="panel-left h-100 overflow-auto p-6">
        <!--        <div class="info-item">-->
        <!--          <span class="font-color-sub">任务类型: </span>-->
        <!--          <span class="font-color-main">{{ task.typeText }}</span>-->
        <!--        </div>-->
        <div class="info-item">
          <span class="font-color-sub"
            >{{ $t('task_monitor_execution_time') }}:
          </span>
          <span class="font-color-main">{{ task.startTimeFmt }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub"
            >{{ $t('task_monitor_end_time') }}:
          </span>
          <span class="font-color-main">{{ task.endTimeFmt }}</span>
        </div>
        <div v-if="taskType.value !== 'initial_sync'" class="info-item">
          <span class="font-color-sub"
            >{{ $t('task_monitor_cdc_time') }}:
          </span>
          <span class="font-color-main">{{ task.cdcTimeFmt }}</span>
        </div>
        <div class="info-item info-title fs-7">{{ infoObj.source.title }}</div>
        <div
          v-for="(item, index) in infoObj.source.items"
          :key="'source' + index"
          class="info-item"
        >
          <span class="font-color-sub">{{ item.label }}: </span>
          <span class="font-color-main">{{ task[item.key] || '-' }}</span>
        </div>
        <div class="info-item info-title fs-7">{{ infoObj.target.title }}</div>
        <div
          v-for="(item, index) in infoObj.target.items"
          :key="'target' + index"
          class="info-item"
        >
          <span class="font-color-sub">{{ item.label }}: </span>
          <span class="font-color-main">{{ task[item.key] || '-' }}</span>
        </div>
      </div>
      <div class="panel-right flex-fit h-100 overflow-hidden p-6">
        <ElTabs
          class="dashboard-tabs flex flex-column overflow-hidden h-100"
          v-model:value="activeTab"
          @tab-click="tabHandler"
        >
          <ElTabPane
            :label="$t('task_monitor_progress')"
            name="progress"
            class="h-100"
          >
            <TaskProgress :task="task" ref="taskProgress"></TaskProgress>
          </ElTabPane>
          <ElTabPane
            lazy
            class="h-100 overflow-hidden"
            :label="$t('task_monitor_run_log')"
            name="log"
          >
            <Log :id="$route.params.id"></Log>
          </ElTabPane>
          <ElTabPane
            lazy
            class="h-100 overflow-hidden"
            :label="$t('task_monitor_mission_milestone')"
            name="milestone"
          >
            <ElTable
              fit
              height="100%"
              :empty-text="$t('task_monitor_no_milestone_data')"
              :data="milestoneList"
            >
              <ElTableColumn
                :label="$t('task_monitor_task_details')"
                prop="label"
              >
                <template v-slot="scope">
                  <span>{{ scope.row.label }}</span>
                  <ElButton
                    v-if="scope.row.status === 'error'"
                    class="ml-2"
                    size="mini"
                    type="text"
                    @click="checkError(scope.row.errorMessage)"
                  >
                    {{ $t('milestone_btn_check_error') }}
                  </ElButton>
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('task_monitor_status')"
                prop="status"
                width="100px"
              >
                <template v-slot="scope">
                  <StatusTag
                    type="tag"
                    target="milestone"
                    :status="getMilestoneStatus(scope.row.status)"
                  ></StatusTag>
                </template>
              </ElTableColumn>
              <ElTableColumn
                :label="$t('task_monitor_time')"
                prop="fromNow"
                width="160px"
              ></ElTableColumn>
            </ElTable>
          </ElTabPane>
          <ElTabPane
            v-if="showContent"
            lazy
            class="h-100 overflow-hidden"
            :label="$t('task_monitor_sync_content')"
            name="content"
          >
            <FieldMapping
              ref="fieldMapping"
              :readOnly="true"
              :dataSourceModel="task ? task.dataSourceModel : {}"
              :field_process="field_process"
            ></FieldMapping>
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
  </section>
</template>

<script>
import i18n from '@/i18n'

import { StatusTag } from '@tap/business'
import TaskProgress from './TaskProgress'

import FieldMapping from '@/components/field-mapping/main'
import Log from './Log.vue'
import { isFinished } from '../task/copy/util'
import { getDatabaseTypes } from '@/util'
import timeFunction from '@/mixins/timeFunction'

export default {
  components: { StatusTag, TaskProgress, Log, FieldMapping },
  inject: ['checkAgent'],
  mixins: [timeFunction],
  data() {
    return {
      loading: true,
      showContent: false,
      resetBtnLoading: false,
      activeTab: 'progress',
      field_process: [],
      task: null,
      statusBtMap: {
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true },
      },
      infoObj: {
        source: {
          title: this.$t('task_monitor_source_info'),
          items: [
            {
              label: this.$t('task_monitor_node_name'),
              key: 'sourceName',
            },
            {
              label: this.$t('task_monitor_owned_library'),
              key: 'sourceDB',
            },
            {
              label: this.$t('task_monitor_database_addr'),
              key: 'sourceUrl',
            },
            {
              label: this.$t('task_monitor_database_type'),
              key: 'sourceType',
            },
          ],
        },
        target: {
          title: this.$t('task_monitor_target_info'),
          items: [
            {
              label: this.$t('task_monitor_node_name'),
              key: 'targetName',
            },
            {
              label: this.$t('task_monitor_owned_library'),
              key: 'targetDB',
            },
            {
              label: this.$t('task_monitor_database_addr'),
              key: 'targetUrl',
            },
            {
              label: this.$t('task_monitor_database_type'),
              key: 'targetType',
            },
          ],
        },
      },
      startLoading: false,
    }
  },
  created() {
    this.getData()
    let tab = this.$route.query?.tab
    if (tab) {
      this.activeTab = tab
    }
    this.$ws.on('watch', this.taskChange)
    this.$ws.send({
      type: 'watch',
      collection: 'DataFlows',
      filter: {
        where: { 'fullDocument._id': { $in: [this.$route.params.id] } }, //查询条件
        fields: {
          'fullDocument.id': true,
          'fullDocument._id': true,
          'fullDocument.name': true,
          'fullDocument.status': true,
          'fullDocument.executeMode': true,
          'fullDocument.stopOnError': true,
          'fullDocument.last_updated': true,
          'fullDocument.createTime': true,
          'fullDocument.children': true,
          'fullDocument.stats': true,
          'fullDocument.setting': true,
          'fullDocument.cdcLastTimes': true,
          'fullDocument.listtags': true,
          'fullDocument.finishTime': true,
          'fullDocument.startTime': true,
          'fullDocument.errorEvents': true,
          'fullDocument.milestones': true,
          'fullDocument.user': true,
          'fullDocument.mappingTemplate': true,
          'fullDocument.stages': true,
        },
      },
    })
  },
  unmounted() {
    this.$ws.off('watch', this.taskChange)
    this.$ws.send({
      type: 'unsubscribe',
      messageType: 'watch,logs,dataFlowInsight',
    })
  },
  computed: {
    milestoneList() {
      let list = this.task?.milestones || []
      return list.map((m) => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.formatTime(time)
        }
        return {
          label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage,
          tipDisabled: true,
        }
      })
    },
    taskType() {
      let sync_type = this.task.setting?.sync_type
      let map = {
        initial_sync: this.$t('task_initial_sync'),
        cdc: this.$t('task_sync_type_cdc'),
        'initial_sync+cdc': this.$t('task_initial_sync_cdc'),
      }
      return {
        label: map[sync_type],
        value: sync_type,
      }
    },
  },
  methods: {
    taskChange(data) {
      let task = data.data?.fullDocument || {}
      if (JSON.stringify(this.task) !== JSON.stringify(this.formatTask(task))) {
        this.task = Object.assign({}, this.task, this.formatTask(task))
      }
    },
    // 获取任务数据
    getData() {
      const { id } = this.$route.params || {}
      this.loading = true
      id &&
        this.$axios
          .get(`tm/api/Dataflows/${id}`)
          .then((data) => {
            this.task = this.formatTask(data)
            this.getConnections(data)
            this.showContentTab(data)
          })
          .finally(() => {
            this.loading = false
          })
    },
    // 获取左侧栏连接信息
    getConnections(data) {
      let stages = data.stages || []
      let target = null
      let source = null
      stages.forEach((stage) => {
        if (stage.inputLanes.length) {
          target = stage
        }
        if (stage.outputLanes.length) {
          source = stage
        }
      })
      let typeMap = getDatabaseTypes(true)
      Object.assign(this.task, {
        sourceName: source.name,
        targetName: target.name,
        sourceType:
          typeMap[source.databaseType] || typeMap[source.database_type],
        targetType:
          typeMap[target.databaseType] || typeMap[target.database_type],
      })
      let ids = [source.connectionId, target.connectionId]
      let filter = {
        where: {
          id: {
            inq: ids,
          },
        },
      }
      this.$axios
        .get(
          `tm/api/Connections?filter=${encodeURIComponent(
            JSON.stringify(filter)
          )}`
        )
        .then((data) => {
          let connections = data?.items || []
          // 源和目标一样的情况
          if (connections.length === 1) {
            connections.push(
              Object.assign({}, connections[0], { id: 'targetId' })
            )
          }
          connections.forEach((c) => {
            let type = 'source'
            if (c.id === ids[1]) {
              type = 'target'
            }
            let host = c.database_host
            // mongo 不追加port
            if (
              c.database_port &&
              !['mongodb', 'aliyun_mongodb', 'tencent_mongodb', 'mq'].includes(
                c.database_type
              )
            ) {
              host += ':' + c.database_port
            }
            switch (c.database_type) {
              case 'mq':
                this.infoObj[type].items = [
                  {
                    label: this.$t('task_monitor_node_name'),
                    key: type + 'Name',
                  },
                  {
                    label: this.$t('task_monitor_topic_name'),
                    key: type + 'MqQueueSet',
                  },
                  {
                    label: this.$t('connection_form_mq_broker_url'),
                    key: type + 'BrokerURL',
                  },
                  {
                    label: this.$t('task_monitor_database_type'),
                    key: type + 'Type',
                  },
                ]
                this.task[type + 'MqQueueSet'] = c.mqQueueSet
                this.task[type + 'BrokerURL'] = c.brokerURL
                break
              case 'kafka':
                this.infoObj[type].items = [
                  {
                    label: this.$t('task_monitor_node_name'),
                    key: type + 'Name',
                  },
                  {
                    label: this.$t('task_monitor_topic_expressionL'),
                    key: type + 'KafkaPatternTopics',
                  },
                  {
                    label: this.$t('task_monitor_database_addr'),
                    key: type + 'KafkaBootstrapServers',
                  },
                  {
                    label: this.$t('task_monitor_database_type'),
                    key: type + 'Type',
                  },
                ]
                this.task[type + 'KafkaPatternTopics'] = c.kafkaPatternTopics
                this.task[type + 'KafkaBootstrapServers'] =
                  c.kafkaBootstrapServers
                break
            }
            this.task[type + 'DB'] = c.database_name
            this.task[type + 'Url'] = host === ':0' ? '-' : host
          })
        })
    },
    formatTask(data) {
      if (!data) {
        return {}
      }
      data.totalOutput = data?.stats?.output?.rows || 0
      data.totalInput = data?.stats?.input?.rows || 0
      data.creator = data.createUser || '-'
      data.typeText =
        data.mappingTemplate === 'cluster-clone'
          ? this.$t('task_monitor_migration_task')
          : this.$t('task_monitor_sync_task')
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.formatTime(data.startTime)
      data.endTimeFmt = data.startTime ? this.formatTime(data.finishTime) : '-'
      data.cdcTimeFmt = this.formatTime(cdcTime)
      data.isFinished = isFinished(data)
      return data
    },
    // 以下方法需要考虑和列表的重构合并，暂时先复制过来
    async changeStatus({ status, errorEvents }) {
      let attributes = {
        status,
        id: this.$route.params.id,
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      return await this.$axios
        .patch('tm/api/DataFlows?where=', attributes)
        .then((data) => {
          this.responseHandler(data, this.$t('task_operation_successful'))
        })
      // .catch(error => {
      //   error?.isException && this.$message.error(this.$t('task_start_failed'))
      // })
    },
    responseHandler(data, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('task_not_exist'),
          6: this.$t('task_not_allow_operation'),
          7: this.$t('task_operation_failed'),
          8: this.$t('task_not_allow_operation'),
        }
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map((item) => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                this.task.name
              }</span> : <span style="color: #F56C6C">${
                msgMapping[item.code]
              }</span></div>`
            })
            .join(''),
        })
      } else if (msg) {
        this.$message.success(msg)
        // this.getData()
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
        initialize_confirm_message: this.$t('task_initialize_confirm_message'),
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
            class: 'color-primary',
          },
          name
        ),
        strArr[1],
      ])
      return {
        msg,
        title: map[title],
      }
    },
    start() {
      this.checkAgent(async () => {
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
      if (
        node.stages &&
        node.stages.find((s) => s.type === 'aggregation_processor')
      ) {
        const h = this.$createElement
        let arr = this.$t('task_stop_tip').split('XXX')
        message = h('p', [
          arr[0] + '(',
          h('span', { style: { color: '#409EFF' } }, node.name),
          ')' + arr[1],
        ])
        title = this.$t('task_important_reminder')
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
      }).then((resFlag) => {
        if (resFlag) {
          this.changeStatus({ status: 'stopping' })
        }
      })
    },
    forceStop() {
      let msgObj = this.getConfirmMessage('force_stop', this.task.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
      }).then((resFlag) => {
        if (resFlag) {
          this.changeStatus({ status: 'force stopping' })
        }
      })
    },
    reset() {
      this.$confirm(this.$t('task_reset_tsk'), this.$t('task_reset'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
        dangerouslyUseHTMLString: true,
      }).then((flag) => {
        if (!flag) {
          return
        }
        this.resetBtnLoading = true
        this.$axios
          .post('tm/api/DataFlows/resetAll', {
            id: [this.$route.params.id],
          })
          .then((data) => {
            this.responseHandler(data, this.$t('task_operation_successful'))
            this.getData()
          })
          // .catch(error => {
          //   error?.isException && this.$message.error(this.$t('task_reset_failed'))
          // })
          .finally(() => {
            this.resetBtnLoading = false
          })
      })
    },
    tabHandler() {
      this.$nextTick(() => {
        if (this.activeTab === 'content') {
          this.$refs.fieldMapping.getMetaData(this.task)
          this.field_process = this.task?.stages[0]?.field_process || []
        }
        if (this.activeTab === 'progress') {
          this.$refs.taskProgress?.init?.()
        } else {
          this.$refs.taskProgress?.clearWS?.()
        }
      })
    },
    getMilestoneStatus(status) {
      let result = status
      if (
        ['draft', 'paused', 'error'].includes(this.task?.status) &&
        status === 'running'
      ) {
        result = 'paused'
      }
      return result
    },
    //是否支持同步内容
    showContentTab(data) {
      let stageId = data?.stages?.[1]?.id || ''
      let param = {
        stages: data?.stages,
        stageId: stageId,
      }
      this.$axios
        .post('tm/api/DataFlows/tranModelVersionControl', param)
        .then((data) => {
          this.showContent = data?.[stageId] || false
        })
    },
    checkError(msg) {
      this.$confirm(msg, i18n.t('monitor_Dashboard_cuoWu'), {
        type: 'warning',
        width: '850px',
      })
    },
  },
}
</script>

<style lang="scss">
.monitor-dashboard-wrap {
  line-height: 22px;
  .monitor-icon {
    width: 55px;
    height: 55px;
    background: rgba(44, 101, 255, 0.08);
    box-sizing: border-box;
    img {
      display: block;
      height: 100%;
      width: 100%;
    }
  }
  .dashboard-main {
    background: #fff;
    border-radius: 4px;
  }
  .info-title {
    font-weight: 500;
  }
  .info-item {
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 4px;
    }
  }
  .panel-left {
    width: 340px;
    border-right: 1px solid #f2f2f2;
    box-sizing: border-box;
  }
  .panel-right {
    box-sizing: border-box;
  }
  .dashboard-tabs {
    .el-tabs__nav-wrap {
      &::after {
        height: 1px;
      }
    }
    .el-tabs__content {
      flex: 1;
    }
    .el-tabs__item {
      padding: 0 40px;
    }
  }
  .field-mapping {
    .task-form-body {
      .nav {
        li {
          border-radius: 0;
        }
      }
    }
  }
  .dashboard-main {
    .el-table {
      .el-table__header-wrapper {
        border-radius: 0;
      }
      &.el-table--border {
        .el-table__cell {
          border: 0;
        }
      }
    }
  }
}
</style>
