<template>
  <el-container v-loading="loading" class="task-details-container flex-column">
    <div class="task-info flex justify-content-between bg-white p-6">
      <div class="task-info__left flex align-items-center">
        <div class="task-info__img flex justify-center align-items-center mr-8">
          <img src="../../../public/images/task/task.png" alt="" />
        </div>
        <div>
          <div>
            <span class="fs-6 color-primary">{{ task.name }}</span>
            <StatusTag
              v-if="task.status"
              type="text"
              target="task"
              :status="task.status"
              only-img
              class="ml-6"
            ></StatusTag>
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
              <span class="ml-1">描述：</span>
              <InlineInput
                :value="task.description"
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
            <!--            <ElButton type="primary" size="mini">启动</ElButton>-->
            <!--            <ElButton size="mini">停止</ElButton>-->
            <!--            <ElButton size="mini">重置</ElButton>-->
            <!--            <ElButton size="mini">强制停止</ElButton>-->
            <VButton type="primary">编辑</VButton>
            <VButton
              type="primary"
              :disabled="!statusBtMap['run'][task.status] || (task.status === 'draft' && task.checked === false)"
              :loading="loadingObj.start"
              @click="start($route.params.id)"
              >启动</VButton
            >
            <VButton
              v-if="task.status === 'stopping'"
              :disabled="!statusBtMap['forceStop'][task.status]"
              :loading="loadingObj.forceStop"
              @click="forceStop($route.params.id)"
              >强制停止</VButton
            >
            <VButton
              v-else
              :disabled="!statusBtMap['stop'][task.status]"
              :loading="loadingObj.stop"
              @click="stop($route.params.id)"
              >停止</VButton
            >
            <VButton
              :disabled="!statusBtMap['reset'][task.status]"
              :loading="loadingObj.reset"
              @click="reset($route.params.id)"
              >重置</VButton
            >
          </div>
        </div>
      </div>
      <div class="task-info__right flex align-items-center">
        <div v-for="(item, index) in ouputItems" :key="index" class="flex align-items-center ml-6">
          <span>{{ item.label }}</span>
          <span class="ml-4 fs-4 color-primary fw-bolder">{{ task[item.key] || 0 }}</span>
        </div>
      </div>
    </div>
    <div class="sub-task flex-fill mt-6 p-6 bg-white">
      <div class="sub-task__header">
        <span class="fs-7">子任务</span>
        <span class="ml-4 font-color-disable"
          >在Tapdata Cloud中你创建任务里的每个目标节点均会被定义为子任务 您可以在下方查看每个子任务详情</span
        >
      </div>
      <ElTable :data="list" class="mt-5">
        <ElTableColumn label="子任务名称" prop="name"></ElTableColumn>
        <ElTableColumn label="任务状态" prop="status">
          <template v-slot="scope">
            <StatusTag type="text" target="task" :status="scope.row.status" only-img></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作">
          <template v-slot="scope">
            <ElButton
              :disabled="
                !statusBtMap['run'][scope.row.status] || (scope.row.status === 'draft' && scope.row.checked === false)
              "
              type="text"
              @click="run([scope.row.id], scope.row)"
            >
              运行
            </ElButton>
            <ElButton
              :disabled="!statusBtMap['stop'][scope.row.status]"
              class="mr-2"
              type="text"
              @click="stop([scope.row.id])"
            >
              停止
            </ElButton>
            <ElButton :disabled="!statusBtMap['reset'][scope.row.status]" type="text" @click="reset(scope.row.id)"
              >重启</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </el-container>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VIcon from '@/components/VIcon'
import InlineInput from '@/components/InlineInput'

export default {
  name: 'TaskDetails',
  components: { StatusTag, VIcon, InlineInput },
  data() {
    return {
      loading: true,
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
          key: 'syncType',
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
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true }
      },
      syncTypeMap: {
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
      },
      list: [
        {
          name: '123',
          status: 'running'
        }
      ],
      loadingObj: {
        start: false,
        stop: false,
        forceStop: false,
        reset: false
      }
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
      this.$axios
        .get('tm/api/DataFlows/' + id)
        .then(data => {
          this.task = this.formatTask(data)
        })
        .finally(() => {
          this.loading = false
        })
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
      result.creator = result.username || result.user?.username || '-'
      result.updatedTime = result.last_updated ? this.formatTime(result.last_updated) : '-'
      result.syncType = this.syncTypeMap[result.setting?.sync_type]
      return result
    },
    start(id) {
      this.$checkAgentStatus(async () => {
        this.loadingObj.start = true
        await this.changeStatus(id, { status: 'scheduled' })
        this.loadingObj.start = false
      })
    },
    stop(id) {
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
      }).then(async resFlag => {
        if (resFlag) {
          this.loadingObj.stop = true
          await this.changeStatus(id, { status: 'stopping' })
          this.loadingObj.stop = false
        }
      })
    },
    forceStop(id) {
      let msgObj = this.getConfirmMessage('force_stop', this.task.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(async resFlag => {
        if (resFlag) {
          this.loadingObj.forceStop = true
          await this.changeStatus(id, { status: 'force stopping' })
          this.loadingObj.forceStop = false
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
        this.$axios
          .post('tm/api/DataFlows/resetAll', {
            id: [id]
          })
          .then(data => {
            this.responseHandler(data, '操作成功')
          })
          .catch(() => {
            this.$message.error('重置失败')
          })
          .finally(() => {
            this.loadingObj.reset = false
          })
      })
    },
    async changeStatus(id, { status, errorEvents }) {
      let where = {
        _id: {
          in: [id]
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      return await this.$axios
        .post('tm/api/DataFlows/update?where=' + encodeURIComponent(JSON.stringify(where)), attributes)
        .then(data => {
          this.responseHandler(data, '操作成功')
        })
        .catch(() => {
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
    updateDesc(val, id) {
      this.$axios
        .patch(`tm/api/DataFlows/${id}`, {
          description: val
        })
        .then(() => {
          this.$message.success(this.$t('gl_button_update_success'))
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.task-info {
  .v-icon {
    color: rgba(132, 175, 255, 1);
  }
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
