<template>
  <el-container v-loading="loading" class="task-details-container flex-column p-6">
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
          <div class="flex align-items-center mt-4">
            <div v-for="(item, index) in infoItems" :key="index" :class="[{ 'ml-6': index !== 0 }]">
              <VIcon size="12" class="v-icon">{{ item.icon }}</VIcon>
              <span class="ml-1">{{ item.label }}</span>
              <span>{{ task[item.key] }}</span>
            </div>
            <VIcon size="12" class="v-icon ml-4 cursor-pointer">edit-outline</VIcon>
          </div>
          <div class="operation-row mt-4">
            <!--            <ElButton type="primary" size="mini">启动</ElButton>-->
            <!--            <ElButton size="mini">停止</ElButton>-->
            <!--            <ElButton size="mini">重置</ElButton>-->
            <!--            <ElButton size="mini">强制停止</ElButton>-->
            <VButton
              type="primary"
              :disabled="!statusBtMap['run'][task.status] || (task.status === 'draft' && task.checked === false)"
              :loading="startLoading"
              @click="start"
              >启动</VButton
            >
            <VButton :disabled="!statusBtMap['stop'][task.status]" @click="stop($route.params.id)">停止</VButton>
            <VButton :disabled="!statusBtMap['reset'][task.status]" @click="reset($route.params.id)">重置</VButton>
            <VButton :disabled="!statusBtMap['forceStop'][task.status]" @click="forceStop($route.params.id)"
              >强制停止</VButton
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
            <VButton
              :disabled="
                !statusBtMap['run'][scope.row.status] || (scope.row.status === 'draft' && scope.row.checked === false)
              "
              text
              @click="run([scope.row.id], scope.row)"
            >
              运行
            </VButton>
            <VButton :disabled="!statusBtMap['stop'][scope.row.status]" class="mr-2" text @click="stop([scope.row.id])">
              停止任务
            </VButton>
            <VButton :disabled="!statusBtMap['reset'][scope.row.status]" @click="reset(scope.row.id)">重启</VButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </el-container>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import VIcon from '@/components/VIcon'
import VButton from '../../_packages/tapdata-web-core/components/base/VButton'

export default {
  name: 'TaskDetails',
  components: { VButton, StatusTag, VIcon },
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
        },
        {
          key: 'description',
          icon: 'document',
          label: '描述：'
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
      startLoading: false
    }
  },
  mounted() {
    this.init()
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
          console.log('data', data)
          this.task = this.formatTask(data)
        })
        .finally(() => {
          this.loading = false
        })
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
      result.description = result.description || '描述内容'
      return result
    },
    start(id) {
      this.$checkAgentStatus(async () => {
        this.startLoading = true
        await this.changeStatus(id, { status: 'scheduled' })
        this.startLoading = false
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
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus(id, { status: 'stopping' })
        }
      })
    },
    forceStop(id) {
      let msgObj = this.getConfirmMessage('force_stop', this.task.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus(id, { status: 'force stopping' })
        }
      })
    },
    reset(id) {
      this.$confirm('是否重置该任务？', '重置', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(flag => {
        if (!flag) {
          return
        }
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
        // this.getData()
      }
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
