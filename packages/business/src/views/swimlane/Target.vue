<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex justify-content-between p-4">
      <span class="fs-6">SERVICES / TARGETS</span>
      <div class="operation">
        <VIcon size="16" class="icon-color" @click="handleAdd">add-fill</VIcon>
        <VIcon size="16" class="icon-color ml-3">search-outline</VIcon>
        <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
      </div>
    </div>
    <div class="p-3 flex-fill min-h-0 overflow-auto">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="wrap__item rounded-2 mb-4"
        @dragover.stop="handleDragOver"
        @dragenter.stop="handleDragEnter"
        @dragleave.stop="handleDragLeave"
        @drop.stop="handleDrop($event, item)"
      >
        <div class="item__header flex p-3">
          <NodeIcon :node="item" :size="20" class="item__icon mt-1" />
          <div class="flex-fill ml-2">
            <div class="flex justify-content-between">
              <span class="font-color-normal fw-sub fs-6">{{ item.name }}</span>
              <span class="operation-line">
                <VIcon size="16" class="cursor-pointer" @click="openView(item)">copy</VIcon>
                <VIcon size="18" class="ml-3">setting</VIcon>
              </span>
            </div>
            <div class="mt-2 font-color-light">Sync data to {{ item.database_type }} for analytics</div>
          </div>
        </div>
        <div class="item__content p-2">
          <span v-if="!connectionTaskMap[item.id] || !connectionTaskMap[item.id].length" class="font-color-sslight"
            >No tasks configured for this target</span
          >
          <div v-else class="task-list">
            <div class="task-list-content">
              <div v-for="(task, i) in connectionTaskMap[item.id]" :key="i" class="task-list-item flex">
                <div class="p-1 ellipsis flex-1 align-center">
                  <ElLink @click="handleEditInDag(task)" type="primary" size="small">{{ task.name }}</ElLink>
                </div>
                <div class="p-1">
                  <TaskStatus :task="task"></TaskStatus>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ElDialog :visible.sync="dialogConfig.visible" width="600" :close-on-click-modal="false">
        <span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
        <ElForm ref="form" :model="dialogConfig" label-width="180px">
          <div class="pipeline-desc p-4 mb-4">{{ dialogConfig.desc }}</div>
          <ElFormItem label="Pipeline Name">
            <ElInput size="small" v-model="dialogConfig.taskName" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
        </ElForm>
        <span slot="footer" class="dialog-footer">
          <ElButton size="mini" @click="hideDialog">{{ $t('packages_component_button_cancel') }}</ElButton>
          <ElButton size="mini" type="primary" @click="dialogSubmit">
            {{ $t('packages_component_button_confirm') }}
          </ElButton>
        </span>
      </ElDialog>
      <connectionPreview ref="targetconnectionView"></connectionPreview>
    </div>
  </div>
</template>

<script>
import { connectionsApi, taskApi } from '@tap/api'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import connectionPreview from './connectionPreview'
import { uuid } from '@tap/shared'

import { makeStatusAndDisabled } from '../../shared'
import { TaskStatus } from '../../components'

const DEFAULT_SETTINGS = {
  name: '', // 任务名称
  desc: '', // 任务描述
  type: 'initial_sync+cdc', // 任务类型：全量+增量
  isAutoCreateIndex: true, // 自动创建索引
  isOpenAutoDDL: false, // 自动DDL
  increOperationMode: false, // 增量数据处理模式：批量,
  increaseReadSize: 1, // 增量批次读取行数
  processorThreadNum: 1, // 处理器线程数
  shareCdcEnable: false, //开启共享挖掘
  isSchedule: false,
  cronExpression: ' ',
  accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
  isAutoInspect: false
}

export default {
  name: 'Target',

  props: {
    dragState: Object
  },

  components: { NodeIcon, connectionPreview, TaskStatus },

  data() {
    return {
      list: [],
      dialogConfig: {
        title: '',
        desc: '',
        taskName: '',
        syncType: '',
        visible: false
      },
      connectionTaskMap: {}
    }
  },

  created() {
    this.init()
  },

  methods: {
    async init() {
      this.list = await this.getData()
      this.loadTask(this.list)
    },

    handleAdd() {
      this.$emit('create-connection', 'target')
    },

    async getData() {
      let filter = {
        limit: 999,
        where: {
          connection_type: {
            in: ['source_and_target', 'target']
          }
        }
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      return res.items
    },

    async loadTask(list) {
      if (!list.length) return
      const ids = list.map(item => item.id)
      const data = await taskApi.getTaskByConnection({
        connectionIds: ids.join(','),
        position: 'target'
      })

      Object.keys(data).forEach(key => {
        this.$set(this.connectionTaskMap, key, data[key].map(this.mapTask))
      })
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    handleDragOver(ev) {
      ev.preventDefault()
      ev.dataTransfer.dropEffect = 'copy'
    },

    handleDragEnter(ev) {
      ev.preventDefault()

      const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    handleDrop(ev, item) {
      ev.preventDefault()
      const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
      dropNode.classList.remove('is-drop-inner')
      console.log('handleDrop', this.dragState, item) // eslint-disable-line

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (object.data.type === 'connection') {
        this.dialogConfig.from = object.data
        this.dialogConfig.to = item
        this.dialogConfig.title = 'Create Migrate Pipeline'
        this.dialogConfig.syncType = 'migrate'
        this.dialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
      } else if (object.data.type === 'table') {
        this.dialogConfig.from = object.parent.data
        this.dialogConfig.tableName = object.data.name
        this.dialogConfig.to = item
        this.dialogConfig.title = 'Create Sync Pipeline'
        this.dialogConfig.syncType = 'sync'
        this.dialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] from [ ${object.parent.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
      }

      this.showDialog()
    },

    makeMigrateTask(from, to) {
      let source = this.getDatabaseNode(from)
      let target = this.getDatabaseNode(to)

      Object.assign(source, {
        migrateTableSelectType: 'expression',
        tableExpression: '.*'
      })

      return {
        ...DEFAULT_SETTINGS,
        syncType: 'migrate',
        name: this.dialogConfig.taskName,
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target]
        }
      }
    },

    getDatabaseNode(db) {
      return {
        id: uuid(),
        type: 'database',
        name: db.name,
        connectionId: db.id,
        databaseType: db.database_type,
        attrs: {
          connectionName: db.name,
          connectionType: db.connection_type,
          accessNodeProcessId: db.accessNodeProcessId,
          pdkType: db.pdkType,
          pdkHash: db.pdkHash,
          capabilities: db.capabilities || []
        }
      }
    },

    getTableNode(db, tableName) {
      return {
        id: uuid(),
        type: 'table',
        name: tableName,
        tableName,
        connectionId: db.id,
        databaseType: db.database_type,
        attrs: {
          connectionName: db.name,
          connectionType: db.connection_type,
          accessNodeProcessId: db.accessNodeProcessId,
          pdkType: db.pdkType,
          pdkHash: db.pdkHash,
          capabilities: db.capabilities || []
        }
      }
    },

    makeSyncTask(fromConnection, tableName, to) {
      let source = this.getTableNode(fromConnection, tableName)
      let target = this.getTableNode(to, tableName)
      return {
        ...DEFAULT_SETTINGS,
        name: this.dialogConfig.taskName,
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target]
        }
      }
    },

    showDialog() {
      this.dialogConfig.visible = true
      this.dialogConfig.taskName = ''
    },

    hideDialog() {
      this.dialogConfig.visible = false
    },

    async dialogSubmit() {
      const { syncType, from, to, tableName } = this.dialogConfig
      let task

      if (syncType === 'sync') {
        task = this.makeSyncTask(from, tableName, to)
      } else if (syncType === 'migrate') {
        task = this.makeMigrateTask(from, to)
      }

      this.dialogConfig.visible = false

      let taskInfo = await taskApi.post(task)
      taskInfo = this.mapTask(taskInfo)

      if (this.connectionTaskMap[to.id]) {
        this.connectionTaskMap[to.id].push(taskInfo)
      } else {
        this.$set(this.connectionTaskMap, to.id, [taskInfo])
      }

      this.$message.success('任务创建成功')
    },

    handleEditInDag(task) {
      if (!task.id) return

      window.open(
        this.$router.resolve({
          name: task.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor',
          params: {
            id: task.id
          }
        }).href
      )
    },

    mapTask(task) {
      makeStatusAndDisabled(task)
      const { id, name, status, syncType } = task
      return { id, name, status, syncType }
    },
    //打开连接详情
    openView(row) {
      this.$refs.targetconnectionView.open(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap__item {
  border: 1px solid #e1e3e9;

  &:hover {
    background-color: #f2f3f5;
  }

  &.is-drop-inner {
    background-color: #d0deff;
  }
}
.item__header {
  border-bottom: 1px solid #e1e3e9;
}
.item__icon {
  //border: 1px solid #4e5969;
}
.operation-line {
  min-width: 50px;
}

.pipeline-desc {
  background-color: #f8f8fa;
  border-radius: 8px;
}
</style>
