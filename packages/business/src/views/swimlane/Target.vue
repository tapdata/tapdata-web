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
      <draggable v-model="list" @start="dragging = true" @end="dragging = false">
        <div
          v-for="item in list"
          :key="item.id"
          class="wrap__item rounded-2 mb-3"
          @dragover="handleDragOver"
          @dragenter.stop="handleDragEnter"
          @dragleave.stop="handleDragLeave"
          @drop.stop="handleDrop($event, item)"
        >
          <template v-if="item.type === 'service'">
            <div class="item__header flex p-3">
              <ElImage
                style="width: 20px; height: 20px"
                class="item__icon mt-1 flex-shrink-0"
                :src="$util.getConnectionTypeDialogImg('rest api')"
              />
              <div class="flex-fill ml-2">
                <div class="flex justify-content-between">
                  <span class="font-color-normal fw-sub fs-6">{{ item.name }}</span>
                </div>
                <div class="mt-2 font-color-light">A set of APIs for 3rd party integration with Tapdata Cloud</div>
              </div>
            </div>
            <div class="item__content position-relative p-2">
              <div class="task-list">
                <div class="task-list-content">
                  <div v-for="api in item.apiList" key="{i}" class="task-list-item flex align-center">
                    <div class="p-1 ellipsis flex-1 align-center">
                      <a class="el-link el-link--primary w-100 justify-content-start" title="{task.name}">
                        <span class="ellipsis">{{ api.name }}</span>
                      </a>
                    </div>
                    <div class="p-1">
                      <span class="status-block status-active">已发布</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
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
            <TaskList :list="connectionTaskMap[item.id] || []" @edit-in-dag="handleEditInDag"></TaskList>
          </template>
        </div>
      </draggable>

      <ElDialog :visible.sync="dialogConfig.visible" width="600" :close-on-click-modal="false">
        <span slot="title" style="font-size: 14px">{{ dialogConfig.title }}</span>
        <ElForm ref="form" :model="dialogConfig" label-width="180px">
          <div class="pipeline-desc p-4 mb-4">{{ dialogConfig.desc }}</div>
          <ElFormItem label="Pipeline Name">
            <ElInput size="small" v-model="dialogConfig.taskName" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
        </ElForm>
        <span slot="footer" class="dialog-footer">
          <ElButton size="mini" @click="hideDialog">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton size="mini" type="primary" @click="dialogSubmit">
            {{ $t('public_button_confirm') }}
          </ElButton>
        </span>
      </ElDialog>
      <connectionPreview ref="targetconnectionView"></connectionPreview>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

import { connectionsApi, taskApi } from '@tap/api'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import connectionPreview from './connectionPreview'
import { uuid } from '@tap/shared'

import { makeStatusAndDisabled } from '../../shared'
import { TaskStatus } from '../../components'
import { defineComponent, ref } from '@vue/composition-api'

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

const TaskList = defineComponent({
  props: ['list'],
  setup(props, { emit }) {
    const limit = 3
    const isLimit = ref(true)
    return () => {
      const list = isLimit.value ? props.list.slice(0, limit) : props.list
      return (
        <div staticClass="item__content position-relative p-2" class={{ 'has-more': props.list.length > limit }}>
          {props.list.length ? (
            <div class="task-list">
              <div class="task-list-content">
                {list.map((task, i) => (
                  <div key={i} class="task-list-item flex align-center">
                    <div class="p-1 ellipsis flex-1 align-center">
                      <a
                        class="el-link el-link--primary w-100 justify-content-start"
                        title={task.name}
                        onClick={() => emit('edit-in-dag', task)}
                      >
                        <span class="ellipsis">{task.name}</span>
                      </a>
                    </div>
                    <div class="p-1">
                      <TaskStatus task={task}></TaskStatus>
                    </div>
                  </div>
                ))}{' '}
              </div>
            </div>
          ) : (
            <span class="font-color-sslight">No tasks configured for this target</span>
          )}

          <ElButton
            onClick={() => {
              isLimit.value = !isLimit.value
            }}
            size="mini"
            round
            staticClass="task-list-item-more position-absolute fs-8"
            class={{ 'is-reverse': !isLimit.value }}
          >
            {isLimit.value ? '查看更多' : '收起'}
            <VIcon class="ml-1">arrow-down</VIcon>
          </ElButton>
        </div>
      )
    }
  }
})

export default {
  name: 'Target',

  props: {
    dragState: Object
  },

  components: { NodeIcon, connectionPreview, TaskList, draggable },

  data() {
    return {
      dragging: false,
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
      console.log('list', this.list) // eslint-disable-line
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

      return [
        {
          id: 'Product Catalog',
          name: 'Product Catalog',
          type: 'service',
          apiList: [
            {
              name: 'API_ProductInventory'
            },
            {
              name: 'API_IM_STATIC_REF'
            }
          ]
        },
        {
          id: 'Discount',
          name: 'Discount',
          type: 'service',
          apiList: [
            {
              name: 'API_bomCertificate'
            }
          ]
        },
        {
          id: '业绩宝',
          name: '业绩宝',
          type: 'service',
          apiList: [
            {
              name: 'API_marketingKeyword'
            },
            {
              name: 'API_PC_refinement'
            },
            {
              name: 'API_modelPriceGroup'
            }
          ]
        },
        {
          id: 'POSS',
          name: 'POSS',
          type: 'service',
          apiList: [
            {
              name: 'API_pos'
            }
          ]
        }
      ].concat(res.items)
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
      if (this.dragging) return
      const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      if (this.dragging) return
      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
        dropNode.classList.remove('is-drop-inner')
      }
    },

    handleDrop(ev, item) {
      ev.preventDefault()
      if (this.dragging || item.type === 'service') return
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
    },

    addItem(value) {
      this.list.unshift(value)
      this.loadTask([value])
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

  ::v-deep {
    .task-list-item-more {
      display: none;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);

      .v-icon {
        vertical-align: -0.125em;
        transition: transform 0.3s;
        transform: rotate(0deg);
      }

      &.is-reverse .v-icon {
        transform: rotate(180deg);
      }
    }

    .has-more {
      .task-list {
        padding-bottom: 36px;
      }

      .task-list-item-more {
        display: inline-flex;
      }
    }
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
