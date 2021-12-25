<template>
  <ElContainer v-loading="loading" class="task-details-container flex-column">
    <div class="task-info flex justify-content-between bg-white p-6">
      <div class="task-info__left flex align-items-center">
        <div class="task-info__img flex justify-center align-items-center mr-8">
          <img src="../../../assets/images/task/task.png" alt="" />
        </div>
        <div>
          <div class="flex align-items-center">
            <span class="fs-6 color-primary">{{ task.name }}</span>
            <StatusItem v-model="statusResult" :rows="task.statuses" class="ml-4" inline></StatusItem>
          </div>
          <div class="flex align-items-center mt-4" style="height: 30px">
            <div
              v-for="(item, index) in infoItems"
              :key="index"
              :class="['flex', 'align-items-center', { 'ml-6': index !== 0 }]"
            >
              <VIcon size="12" class="v-icon">{{ item.icon }}</VIcon>
              <span class="ml-1">{{ item.label }}</span>
              <span>{{ task[item.key] }}</span>
            </div>
            <div class="ml-6 flex align-items-center">
              <VIcon size="12" class="v-icon">document</VIcon>
              <span class="ml-1">{{ $t('task_details_desc') }}：</span>
              <InlineInput
                :value="task.desc"
                :icon-config="{ class: 'color-primary' }"
                :input-props="{ placeholder: '描述内容' }"
                :min="0"
                :max="50"
                type="icon"
                @save="updateDesc($event, task.id)"
              ></InlineInput>
            </div>
          </div>
          <div class="operation-row mt-4">
            <VButton
              type="primary"
              :disabled="startDisabled"
              auto-loading
              @click="start($route.params.id, arguments[0])"
            >
              <VIcon size="12">start-fill</VIcon>
              <span class="ml-1">{{ $t('task_button_start') }}</span>
            </VButton>
            <VButton :disabled="stopDisabled" :loading="loadingObj.stop" @click="stop($route.params.id, arguments[0])">
              <VIcon size="12">pause-fill</VIcon>
              <span class="ml-1">{{ $t('task_button_stop') }}</span>
            </VButton>
            <VButton @click="handleEditor(task.id)">
              <VIcon size="12">edit-fill</VIcon>
              <span class="ml-1">{{ $t('task_button_edit') }}</span>
            </VButton>
            <!--            <VButton-->
            <!--              :disabled="!statusBtMap['reset'][task.status]"-->
            <!--              :loading="loadingObj.reset"-->
            <!--              @click="reset($route.params.id)"-->
            <!--              >重置</VButton-->
            <!--            >-->
          </div>
        </div>
      </div>
      <div class="task-info__right flex align-items-center">
        <TypeChart type="pie" :data="pieData" :options="pieOptions" class="type-chart"></TypeChart>
        <div class="pie-status flex flex-wrap">
          <div v-for="(item, index) in pieData" :key="index" class="pie-status__item flex align-items-center ellipsis">
            <span class="circle-icon mr-2" :style="{ 'background-color': item.color }"></span>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="sub-task flex-fill mt-6 p-6 bg-white">
      <ElTabs v-model="activeTab" class="dashboard-tabs flex flex-column overflow-hidden h-100">
        <ElTabPane label="子任务" name="subTask">
          <div slot="label">
            <span class="mr-2">{{ $t('task_details_sub_task') }}</span>
            <ElTooltip
              placement="top"
              content="在Tapdata Cloud中你创建任务里的每个目标节点均会被定义为子任务 您可以在下方查看每个子任务详情"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
          <Subtask :task="task"></Subtask>
        </ElTabPane>
        <ElTabPane label="连接" name="connect" lazy>
          <Connection :ids="connectionIds" @change="loadData"></Connection>
        </ElTabPane>
        <ElTabPane label="历史运行记录" name="history" lazy>
          <History v-if="task.id" :ids="[task.id]" :operations="operations"></History>
        </ElTabPane>
        <ElTabPane label="运行日志" name="log" lazy>
          <Log :id="task.id" type="2"></Log>
        </ElTabPane>
      </ElTabs>
    </div>
  </ElContainer>
</template>

<script>
import VIcon from '@/components/VIcon'
import InlineInput from '@/components/InlineInput'
import Connection from '../migrate/details/Connection'
import History from '../migrate/details/History'
import Subtask from './Subtask'
import StatusItem from './StatusItem'
import Log from '@/components/logs/Index'
import TypeChart from '@/components/TypeChart'
import { ETL_SUB_STATUS_MAP } from '@/const'
// import Task from 'web-core/api/Task'
// const taskApi = new Task()

export default {
  name: 'TaskDetails',
  components: { VIcon, InlineInput, Connection, History, Subtask, StatusItem, Log, TypeChart },
  data() {
    return {
      loading: true,
      activeTab: 'subTask',
      task: {},
      infoItems: [
        {
          key: 'creator',
          icon: 'account-fill',
          label: '创建人：'
        },
        {
          key: 'updatedTime',
          icon: 'time-fill',
          label: '修改时间：'
        },
        {
          key: 'type',
          icon: 'menu',
          label: '同步类型：'
        }
      ],
      ouputItems: [
        {
          key: 'totalOutput',
          label: '总输出'
        },
        {
          key: 'totalInput',
          label: '总输入'
        }
      ],
      statusBtMap: {
        // scheduled, draft, running, stopping, error, pause, force stopping
        run: { draft: true, error: true, pause: true },
        stop: { running: true },
        delete: { draft: true, error: true, pause: true },
        edit: { draft: true, error: true, pause: true },
        reset: { draft: true, error: true, pause: true },
        forceStop: { stopping: true }
      },
      syncTypeMap: {
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
      },
      list: [
        // {
        //   name: '123',
        //   status: 'running',
        //   id: '619ca30b9b71bd1318587950'
        // }
      ],
      loadingObj: {
        start: false,
        stop: false,
        forceStop: false,
        reset: false
      },
      operations: ['start', 'stop', 'forceStop'],
      statusResult: [],
      pieData: [],
      pieOptions: {
        legend: {
          show: false
        },
        radius: true
      }
    }
  },
  computed: {
    connectionIds() {
      return (
        this.task?.dag?.nodes?.map(item => {
          return item.connectionId
        }) || []
      )
    },
    startDisabled() {
      const { statusResult, task } = this
      return (
        this.$disabledByPermission('SYNC_job_operation_all_data', task.user_id) ||
        statusResult.every(t => t.status === 'running' && t.count)
      )
    },
    stopDisabled() {
      const { statusResult, task } = this
      return (
        this.$disabledByPermission('SYNC_job_operation_all_data', task.user_id) ||
        statusResult.every(t => t.status === 'not_running' && t.count)
      )
    }
  },
  created() {
    this.$ws.on('watch', this.taskChange)
    this.$ws.send({
      type: 'watch',
      collection: 'DataFlows',
      filter: {
        where: { 'fullDocument._id': { $in: [this.$route.params.id] } }, //查询条件
        fields: {
          'fullDocument.id': true,
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
          'fullDocument.mappingTemplate': true
        }
      }
    })
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.$ws.off('watch', this.taskChange)
  },
  methods: {
    init() {
      this.loadData()
    },
    loadData() {
      let id = this.$route.params?.id
      this.loading = true
      this.$api('Task')
        .get([id])
        .then(res => {
          this.task = this.formatTask(res.data)
          this.getSubTaskStatusCount()
        })
        .finally(() => {
          this.loading = false
        })
    },
    getSubTaskStatusCount() {
      const { statuses } = this.task
      let obj = {}
      for (let key in ETL_SUB_STATUS_MAP) {
        obj[key] = Object.assign({ count: 0 }, ETL_SUB_STATUS_MAP[key])
      }

      statuses.forEach(el => {
        obj[el.status].count++
      })
      let statusArr = ['edit', 'scheduling', 'running', 'stopping', 'stop', 'complete', 'error']
      let color = ['#648EFF', '#5CC4D2', '#81CE94', '#EFB166', '#EFB166', '#11A9DA', '#EB755C']
      let arr = []
      for (let i = 0; i < statusArr.length; i++) {
        let t = statusArr[i]
        let item = { count: 0 }
        item.value = obj[t].count
        item.name = obj[t].text
        if (t === 'edit') {
          item.value += obj['wait_run'].count
        } else if (t === 'error') {
          item.value += obj['schedule_failed'].count
        }
        if (!item.value) {
          continue
        }
        item.color = color[i]
        arr.push(item)
      }
      this.pieData = arr
    },
    taskChange(data) {
      let task = data.data?.fullDocument || {}
      if (this.task) {
        this.task = Object.assign({}, this.task, this.formatTask(task))
      }
    },
    formatTime(time) {
      return time ? this.$moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    formatTask(data) {
      let result = JSON.parse(JSON.stringify(data))
      result.totalOutput = result.stats?.output?.rows || 0
      result.totalInput = result.stats?.input?.rows || 0
      result.creator = result.creator || result.username || result.user?.username || '-'
      result.updatedTime = result.last_updated ? this.formatTime(result.last_updated) : '-'
      result.type = this.syncTypeMap[result.type]
      return result
    },
    start(id, resetLoading) {
      // this.changeStatus(id, { status: 'scheduled', finallyEvents: resetLoading })
      this.$api('Task')
        .start(id)
        .then(res => {
          this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
          this.table.fetch()
        })
        .catch(err => {
          this.$message.error(err.data?.message)
        })
        .finally(resetLoading)
    },
    stop(id, resetLoading) {
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
          this.$api('Task')
            .stop(id)
            .then(res => {
              this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
              this.table.fetch()
            })
            .catch(err => {
              this.$message.error(err.data?.message)
            })
            .finally(resetLoading)
        } else {
          resetLoading?.()
        }
      })
    },
    forceStop(id, resetLoading) {
      let msgObj = this.getConfirmMessage('force_stop', this.task.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.loadingObj.forceStop = true
          this.changeStatus(id, { status: 'force stopping', finallyEvents: resetLoading })
          this.loadingObj.forceStop = false
        } else {
          resetLoading?.()
        }
      })
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
    },
    reset(id) {
      this.$confirm('是否重置该任务？', '重置', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(flag => {
        if (!flag) {
          return
        }
        this.loadingObj.reset = true
        this.$api('Task')
          .reset(id)
          .then(data => {
            this.responseHandler(data, this.$t('message.deleteOK'))
          })
          .catch(error => {
            if (error?.isException) {
              this.$message.error('重置失败')
            }
          })
          .finally(() => {
            this.loadingObj.reset = false
          })
      })
    },
    toPage(id) {
      this.$router.push({
        name: 'TaskStatistics',
        params: {
          etlId: id
        }
      })
    },
    changeStatus(id, { status, errorEvents, finallyEvents }) {
      let where = {
        _id: {
          in: [id]
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      this.$api('DataFlows')
        .update(where, attributes)
        .then(data => {
          this.responseHandler(data, this.$t('message.deleteOK'))
        })
        .catch(error => {
          if (error?.isException) {
            this.$message.error('任务启动失败，请编辑任务完成映射配置')
          }
        })
        .finally(() => {
          finallyEvents?.()
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
      }
    },
    updateDesc(val, id) {
      this.$api('Task')
        .patchId(id, {
          desc: val
        })
        .then(() => {
          this.task.desc = val
          this.$message.success(this.$t('gl_button_update_success'))
        })
        .catch(err => {
          this.$message.error(err.data.message)
        })
    },
    handleEditor(id) {
      const h = this.$createElement
      this.$confirm(
        h('p', null, [
          h('span', null, this.$t('dataFlow.modifyEditText')),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.nodeLayoutProcess')),
          h('span', null, '、'),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.nodeAttributes')),
          h('span', null, '、'),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.matchingRelationship')),
          h('span', null, '，'),
          h('span', null, this.$t('dataFlow.afterSubmission')),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.reset')),
          h('span', null, this.$t('dataFlow.runNomally')),
          h('span', null, this.$t('dataFlow.editLayerTip'))
        ]),
        this.$t('dataFlow.importantReminder'),
        {
          customClass: 'dataflow-clickTip',
          confirmButtonText: this.$t('dataFlow.continueEditing'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        let routeUrl = this.$router.resolve({
          name: 'DataflowEditor',
          params: { id: id }
        })
        setTimeout(() => {
          document.querySelectorAll('.el-tooltip__popper').forEach(it => {
            it.outerHTML = ''
          })
          window.open(routeUrl.href, 'edit_' + id)
        }, 200)
      })
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)
    }
  }
}
</script>

<style lang="scss" scoped>
.task-details-container {
  font-size: 12px;
}
.task-info {
  .v-icon {
    color: rgba(132, 175, 255, 1);
  }
}
.task-info__right {
  .type-chart {
    width: 100px;
    height: 100px;
  }
  max-width: 350px;
  border-left: 1px solid #e8e8e8;
}
.pie-status__item {
  width: 80px;
}
.circle-icon {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.task-info__img {
  width: 54px;
  height: 54px;
  background-color: rgba(44, 101, 255, 0.08);
  border-radius: 50%;
  img {
    width: 30px;
    height: 30px;
  }
}
</style>
