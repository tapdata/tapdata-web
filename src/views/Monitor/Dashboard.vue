<template>
  <section class="monitor-dashboard-wrap flex flex-column flex-fit overflow-hidden" v-loading="loading">
    <div v-if="task" class="flex align-items-center g-panel-container">
      <div class="monitor-icon rounded-circle overflow-hidden mr-6 p-3">
        <img src="../../../public/images/task/console.png" />
      </div>
      <div class="base-info flex-fit">
        <div class="flex align-items-center">
          <ElLink class="fs-7 mr-4" type="primary">任务名称: {{ task.name }}</ElLink>
          <img v-if="task.isFinished" style="height: 25px" src="../../../public/images/task/yiwancheng.png" alt="" />
          <StatusTag v-else type="text" target="task" :status="task.status" only-img></StatusTag>
        </div>
        <div class="mt-1">
          <span>创建人: {{ task.creator }}</span>
          <span class="ml-4">任务类型：{{ taskType.label }}</span>
        </div>
        <div class="mt-2">
          <VButton
            type="primary"
            :disabled="!statusBtMap['run'][task.status] || (task.status === 'draft' && task.checked === false)"
            @click="start"
            >启动</VButton
          >
          <VButton :disabled="!statusBtMap['stop'][task.status]" @click="stop">停止</VButton>
          <VButton :disabled="!statusBtMap['reset'][task.status]" @click="reset">重置</VButton>
          <VButton :disabled="!statusBtMap['forceStop'][task.status]" @click="forceStop">强制停止</VButton>
        </div>
      </div>
      <div class="input-and-output flex align-center">
        <span>总输出</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{ task.totalOutput }}</span>
        <span class="ml-6">总输入</span>
        <span class="fs-4 ml-4 color-primary fw-bold">{{ task.totalInput }}</span>
      </div>
    </div>
    <div v-if="task" class="dashboard-main flex mt-6 flex-fit overflow-hidden">
      <div class="panel-left h-100 overflow-auto p-6">
        <!--        <div class="info-item">-->
        <!--          <span class="font-color-sub">任务类型: </span>-->
        <!--          <span class="font-color-main">{{ task.typeText }}</span>-->
        <!--        </div>-->
        <div class="info-item">
          <span class="font-color-sub">本次执行时间: </span>
          <span class="font-color-main">{{ task.startTimeFmt }}</span>
        </div>
        <div v-if="taskType.value === 'initial_sync'" class="info-item">
          <span class="font-color-sub">本次结束时间: </span>
          <span class="font-color-main">{{ task.endTimeFmt }}</span>
        </div>
        <div v-if="taskType.value !== 'initial_sync'" class="info-item">
          <span class="font-color-sub">增量所处时间点: </span>
          <span class="font-color-main">{{ task.cdcTimeFmt }}</span>
        </div>
        <div class="info-item info-title fs-7">源端信息</div>
        <div class="info-item">
          <span class="font-color-sub">节点名称: </span>
          <span class="font-color-main">{{ task.sourceName }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">所属库: </span>
          <span class="font-color-main">{{ task.sourceDB }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库地址: </span>
          <span class="font-color-main">{{ task.sourceUrl }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库类型: </span>
          <span class="font-color-main">{{ task.sourceType }}</span>
        </div>
        <div class="info-item info-title fs-7">目标端信息</div>
        <div class="info-item">
          <span class="font-color-sub">节点名称: </span>
          <span class="font-color-main">{{ task.targetName }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">所属库: </span>
          <span class="font-color-main">{{ task.targetDB }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库地址: </span>
          <span class="font-color-main">{{ task.targetUrl }}</span>
        </div>
        <div class="info-item">
          <span class="font-color-sub">数据库类型: </span>
          <span class="font-color-main">{{ task.targetType }}</span>
        </div>
      </div>
      <div class="panel-right flex-fit h-100 overflow-hidden p-6">
        <ElTabs
          class="dashboard-tabs flex flex-column overflow-hidden h-100"
          v-model="activeTab"
          @tab-click="tabHandler"
        >
          <ElTabPane label="任务进度" name="progress" class="h-100">
            <TaskProgress :task="task"></TaskProgress>
          </ElTabPane>
          <ElTabPane lazy class="h-100 overflow-hidden" label="运行日志" name="log">
            <Log :id="$route.params.id"></Log>
          </ElTabPane>
          <ElTabPane lazy class="h-100 overflow-hidden" label="任务里程碑" name="milestone">
            <ElTable fit height="100%" empty-text="此任务尚未启动或已被重置，暂无运行里程碑数据" :data="milestoneList">
              <ElTableColumn label="任务详情" prop="label"></ElTableColumn>
              <ElTableColumn label="状态" prop="status" width="100px">
                <template slot-scope="scope">
                  <StatusTag type="text" target="milestone" :status="scope.row.status" only-img></StatusTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="时间" prop="fromNow" width="160px"></ElTableColumn>
            </ElTable>
          </ElTabPane>
          <ElTabPane lazy class="h-100 overflow-hidden" label="同步内容" name="content">
            <FieldMapping ref="fieldMapping" :readOnly="true"></FieldMapping>
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
  </section>
</template>
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
  }
  .panel-left {
    width: 340px;
    border-right: 1px solid #f2f2f2;
    box-sizing: border-box;
  }
  .panel-right {
    box-sizing: border-box;
  }
  .dashboard-tabs .el-tabs__content {
    flex: 1;
  }
}
</style>
<script>
import StatusTag from '@/components/StatusTag'
import TaskProgress from './TaskProgress'

import FieldMapping from '@/components/FieldMappings'
import Log from './Log.vue'
export default {
  components: { StatusTag, TaskProgress, Log, FieldMapping },
  data() {
    return {
      loading: true,
      activeTab: 'progress',
      task: null,
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
  created() {
    this.getData()
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
  destroyed() {
    this.$ws.off('watch', this.taskChange)
  },
  computed: {
    milestoneList() {
      let list = this.task?.milestones || []
      return list.map(m => {
        let time = m.status === 'running' ? m.start : m.end
        if (time) {
          time = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
        return {
          label: this.$t(`milestone_label_${m.code.toLowerCase()}`),
          status: m.status,
          fromNow: time || '-',
          errorMessage: m.errorMessage,
          tipDisabled: true
        }
      })
    },
    taskType() {
      let sync_type = this.task.setting?.sync_type
      let map = {
        initial_sync: this.$t('task_sync_type_initial_sync'),
        cdc: this.$t('task_sync_type_cdc'),
        'initial_sync+cdc': this.$t('task_sync_type_initial_sync_cdc')
      }
      return {
        label: map[sync_type],
        value: sync_type
      }
    }
  },
  methods: {
    taskChange(data) {
      let task = data.data?.fullDocument || {}
      if (this.task) {
        Object.assign(this.task, this.formatTask(task))
      }
    },
    // 获取任务数据
    getData() {
      this.loading = true
      this.$axios
        .get(`tm/api/Dataflows/${this.$route.params.id}`)
        .then(data => {
          this.task = this.formatTask(data)
          this.getConnections(data)
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
      stages.forEach(stage => {
        if (stage.inputLanes.length) {
          target = stage
        }
        if (stage.outputLanes.length) {
          source = stage
        }
      })
      Object.assign(this.task, {
        sourceName: source.name,
        targetName: target.name,
        sourceType: source.databaseType || source.database_type,
        targetType: target.databaseType || target.database_type
      })
      let ids = [source.connectionId, target.connectionId]
      let filter = {
        where: {
          id: {
            inq: ids
          }
        }
      }
      this.$axios.get(`tm/api/Connections?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        let connections = data || []
        connections.forEach(c => {
          let type = 'source'
          if (c.id === ids[1]) {
            type = 'target'
          }
          this.$set(this.task, type + 'DB', c.database_name)
          this.$set(this.task, type + 'Url', c.database_host + ':' + c.database_port)
        })
      })
    },
    formatTask(data) {
      data.totalOutput = data.stats?.output?.rows || 0
      data.totalInput = data.stats?.input?.rows || 0
      data.creator = this.task?.creator || data.username || data.user?.username || '-'
      data.typeText = data.mappingTemplate === 'cluster-clone' ? '迁移任务' : '同步任务'
      let cdcTime = data.cdcLastTimes?.[0]?.cdcTime || ''
      data.startTimeFmt = this.formatTime(data.startTime)
      data.endTimeFmt = this.formatTime(data.finishTime)
      data.cdcTimeFmt = this.formatTime(cdcTime)
      return data
    },
    formatTime(time) {
      return time ? this.$moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    // 以下方法需要考虑和列表的重构合并，暂时先复制过来
    changeStatus({ status, errorEvents }) {
      let where = {
        _id: {
          in: [this.$route.params.id]
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      this.$axios
        .post('tm/api/DataFlows/update?where=' + encodeURIComponent(JSON.stringify(where)), attributes)
        .then(data => {
          this.responseHandler(data, '操作成功')
        })
        .catch(err => {
          console.log(err)
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
    },
    start() {
      this.$checkAgentStatus(() => {
        this.changeStatus({ status: 'scheduled' })
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
    forceStop() {
      let msgObj = this.getConfirmMessage('force_stop', this.task.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus({ status: 'force stopping' })
        }
      })
    },
    reset() {
      this.$confirm('是否重置该任务？', '重置', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(flag => {
        if (!flag) {
          return
        }
        this.$axios
          .post('tm/api/DataFlows/resetAll', {
            id: [this.$route.params.id]
          })
          .then(data => {
            this.responseHandler(data, '操作成功')
          })
          .catch(() => {
            this.$message.success('重置失败')
          })
      })
    },
    tabHandler() {
      this.$nextTick(() => {
        if (this.activeTab === 'content') {
          this.$refs.fieldMapping.getMetaData(this.task)
        }
      })
    }
  }
}
</script>
