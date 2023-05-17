<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_targets') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton @click="handleAdd">add</IconButton>
      <IconButton :class="{ active: enableSearch }" @click="toggleEnableSearch">search-outline</IconButton>
    </div>
    <div class="flex-fill min-h-0 flex flex-column">
      <div v-if="enableSearch" class="px-2 pt-2">
        <ElInput
          ref="search"
          v-model="search"
          size="mini"
          clearable
          @keydown.native.stop
          @keyup.native.stop
          @click.native.stop
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
          </template>
        </ElInput>
      </div>

      <div class="flex-fill min-h-0 overflow-auto p-2">
        <!--<draggable v-model="filterList" @start="dragging = true" @end="dragging = false">-->
        <div
          v-for="item in filterList"
          :key="item.id"
          class="wrap__item rounded-lg mb-3"
          @dragover="handleDragOver"
          @dragenter.stop="handleDragEnter"
          @dragleave.stop="handleDragLeave"
          @drop.stop="handleDrop($event, item)"
        >
          <template v-if="item.LDP_TYPE === 'app'">
            <div class="item__header p-3">
              <div class="flex align-center gap-2 overflow-hidden">
                <VIcon size="20">mini-app</VIcon>
                <span class="font-color-normal fw-sub fs-6 ellipsis lh-base" :title="item.value">{{ item.value }}</span>
                <!--<IconButton class="ml-auto" sm>open-in-new</IconButton>-->
              </div>
              <div v-if="item.desc" class="mt-2 font-color-light">{{ item.desc }}</div>
            </div>
            <div class="item__content position-relative p-2">
              <div class="task-list">
                <div class="task-list-content">
                  <template v-if="item.modules && item.modules.length">
                    <div v-for="(m, i) in item.modules" :key="i" class="task-list-item flex align-center">
                      <div class="p-1 ellipsis flex-1 align-center">
                        <a
                          class="el-link el-link--primary w-100 justify-content-start"
                          :title="m.name"
                          @click="handlePreviewApi(m)"
                        >
                          <span class="ellipsis">{{ m.name }}</span>
                        </a>
                      </div>
                      <div class="p-1">
                        <span class="status-block" :class="'status-' + m.status">{{ m.statusText }}</span>
                      </div>
                    </div>
                  </template>
                  <span v-else class="font-color-sslight">{{
                    $t('packages_business_data_console_target_no_api')
                  }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="item__header p-3">
              <div class="flex align-center overflow-hidden">
                <DatabaseIcon :item="item" :size="20" class="item__icon flex-shrink-0" />
                <span
                  class="font-color-normal fw-sub fs-6 lh-base flex-1 ml-2 flex align-center overflow-hidden"
                  :title="item.name"
                  ><span class="ellipsis">{{ item.name }}</span>
                  <ElTag
                    v-if="item.showConnectorWebsite && connectionWebsiteMap[item.id]"
                    size="small"
                    class="ml-1 px-1 flex align-center clickable"
                    @click="handleOpenWebsite(connectionWebsiteMap[item.id])"
                    ><VIcon class="mr-1" size="14">open-in-new</VIcon
                    >{{ $t('packages_business_swimlane_target_shouye') }}</ElTag
                  ></span
                >
                <IconButton class="ml-1" @click="$emit('preview', item)">view-details</IconButton>
                <!--                <IconButton
                  v-if="item.showConnectorWebsite && connectionWebsiteMap[item.id]"
                  @click="handleOpenWebsite(connectionWebsiteMap[item.id])"
                  >open-in-new</IconButton
                >-->
              </div>
              <div class="mt-2 font-color-light">
                {{ $t('packages_business_data_console_target_connection_desc', { val: item.database_type }) }}
              </div>
            </div>
            <TaskList :list="connectionTaskMap[item.id] || []" @edit-in-dag="handleClickName"></TaskList>
          </template>
        </div>
        <!--</draggable>-->
      </div>

      <ElDialog :visible.sync="dialogConfig.visible" width="600" :close-on-click-modal="false">
        <span slot="title" class="font-color-dark fs-6 fw-sub">{{ dialogConfig.title }}</span>
        <ElForm ref="form" :model="dialogConfig" label-width="180px" @submit.prevent :rules="formRules">
          <!--          <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">{{ dialogConfig.desc }}</div>-->
          <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
            <span>{{
              $t(
                dialogConfig.tableName
                  ? 'packages_business_target_create_task_dialog_desc_prefix_sync'
                  : 'packages_business_target_create_task_dialog_desc_prefix_clone'
              )
            }}</span
            ><span v-if="dialogConfig.from" class="inline-flex align-center px-1 font-color-dark fw-sub"
              ><DatabaseIcon :item="dialogConfig.from" :key="dialogConfig.from.database_type" :size="20" class="mr-1" />
              <span>{{ dialogConfig.from.name }}</span> </span
            ><span v-if="dialogConfig.tableName" class="font-color-dark fw-sub"
              >/<span class="px-1">{{ dialogConfig.tableName }}</span> </span
            ><span>
              {{ $t('packages_business_target_create_task_dialog_desc_to') }}
              <span v-if="dialogConfig.to" class="inline-flex align-center px-1 font-color-dark fw-sub"
                ><DatabaseIcon :item="dialogConfig.to" :key="dialogConfig.to.database_type" :size="20" class="mr-1" />
                <span>{{ dialogConfig.to.name }}</span>
              </span></span
            >
            <div>{{ $t('packages_business_target_create_task_dialog_desc_suffix') }}</div>
          </div>
          <ElFormItem prop="taskName" :label="$t('public_task_name')">
            <ElInput size="small" v-model="dialogConfig.taskName" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
        </ElForm>
        <span slot="footer" class="dialog-footer">
          <ElButton size="mini" @click="hideDialog">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton :loading="creating" size="mini" @click="dialogSubmit(false)">{{
            $t('packages_business_save_only')
          }}</ElButton>
          <ElButton :loading="creating" size="mini" type="primary" @click="dialogSubmit(true)">
            {{ $t('packages_business_save_and_run_now') }}
          </ElButton>
        </span>
      </ElDialog>
      <CreateRestApi
        v-model="apiDialog.visible"
        :params="apiDialog"
        :host="apiServerHost"
        @save="handleAddApi"
      ></CreateRestApi>
      <ApiPreview v-if="isDaas" ref="apiPreview" :host="apiServerHost"></ApiPreview>
    </div>
  </div>
</template>

<script>
// import draggable from 'vuedraggable'
import { defineComponent, ref } from '@vue/composition-api'

import { apiServerApi, appApi, connectionsApi, modulesApi, proxyApi, taskApi } from '@tap/api'
import { uuid, generateId } from '@tap/shared'
import { VIcon, IconButton } from '@tap/component'
import i18n from '@tap/i18n'
import {
  DatabaseIcon,
  TaskStatus,
  DataServerDrawer as ApiPreview,
  makeStatusAndDisabled,
  TASK_SETTINGS
} from '@tap/business'
import CreateRestApi from './components/CreateRestApi'
import commonMix from './mixins/common'

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
                    {task.website && (
                      <IconButton
                        onClick={() => {
                          window.open(task.website)
                        }}
                      >
                        open-in-new
                      </IconButton>
                      /*<ElTag
                        size="small"
                        class="ml-1 px-1 flex align-center clickable"
                        onClick={() => {
                          window.open(task.website)
                        }}
                      >
                        <VIcon class="mr-1" size="14">
                          open-in-new
                        </VIcon>
                        首页
                      </ElTag>*/
                    )}
                  </div>
                ))}{' '}
              </div>
            </div>
          ) : (
            <span class="font-color-sslight">{i18n.t('packages_business_data_console_target_no_task')}</span>
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
            {i18n.t(isLimit.value ? 'packages_business_view_more' : 'packages_business_view_collapse')}
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
    dragState: Object,
    fdmAndMdmId: Array
  },

  components: { ApiPreview, CreateRestApi, DatabaseIcon, TaskList, IconButton, VIcon },

  mixins: [commonMix],

  data() {
    const validateTaskName = async (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        callback(new Error(this.$t('packages_business_relation_list_qingshururenwu')))
      } else {
        const isExist = await taskApi.checkName({
          name: value
        })
        if (isExist) {
          callback(new Error(this.$t('packages_dag_task_form_error_name_duplicate')))
        } else {
          callback()
        }
      }
    }

    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      dragging: false,
      list: [],
      appList: [],
      dialogConfig: {
        title: '',
        desc: '',
        taskName: '',
        syncType: '',
        visible: false,
        from: null,
        to: null
      },
      connectionTaskMap: {},
      apiDialog: {
        visible: false
      },
      apiServerHost: '',
      formRules: {
        taskName: [{ validator: validateTaskName, trigger: 'blur' }]
      },

      searchIng: false,
      search: '',
      enableSearch: false,
      filterTreeData: [],
      creating: false,
      apiStatusMap: {
        active: this.$t('public_status_published'),
        pending: this.$t('public_status_unpublished'),
        generating: this.$t('public_status_to_be_generated')
      },
      connectionWebsiteMap: {}
    }
  },

  computed: {
    allowDrop() {
      return (
        this.dragState.isDragging &&
        ['SOURCE', 'FDM', 'MDM'].includes(this.dragState.from) &&
        ['connection', 'table'].includes(this.dragState.draggingObjects[0]?.data.LDP_TYPE)
      )
    },

    filterList() {
      if (!this.search) return this.list.filter(item => !this.fdmAndMdmId.includes(item.id))

      return this.list.filter(
        item =>
          !this.fdmAndMdmId?.includes(item.id) &&
          (item.name?.includes(this.search) || item.value?.includes(this.search))
      )
    }
  },

  mounted() {
    this.init()
    this.isDaas && this.getApiServerHost()
  },

  methods: {
    async init() {
      const connectionList = await this.getData()
      let appList = []

      if (this.isDaas) {
        appList = await this.getApiAppList()
        Promise.all(appList.map(({ id }) => this.loadApiModule(id))).then(list => {
          appList.forEach((app, i) => {
            this.$set(app, 'modules', list[i])
          })
        })
      }

      this.list = appList
        .concat(connectionList)
        .sort((obj1, obj2) => new Date(obj2.createTime) - new Date(obj1.createTime))
      this.loadTask(connectionList)
    },

    handleAdd() {
      this.$emit('create-target', 'target')
    },

    async getData() {
      let filter = {
        limit: 999,
        where: {
          connection_type: {
            in: ['source_and_target', 'target']
          },
          createType: {
            $ne: 'System'
          }
        }
      }
      const res = await connectionsApi.get({
        filter: JSON.stringify(filter)
      })

      return res.items.map(this.mapConnection)
    },

    async loadTask(list) {
      if (!list.length) return
      const spec = []
      const ids = list.map(item => {
        if (item.showTableWebsite) spec.push(item.id)
        return item.id
      })
      const data = await taskApi.getTaskByConnection({
        connectionIds: ids.join(','),
        position: 'target'
      })

      Object.keys(data).forEach(key => {
        this.$set(this.connectionTaskMap, key, data[key].reverse().map(this.mapTask))
      })

      if (spec.length) {
        spec.forEach(id => {
          const taskList = data[id]
          if (taskList?.length) {
            const mapTaskList = this.connectionTaskMap[id]
            taskList.forEach((task, i) => {
              const table = this.getTableByTask(task)
              if (table) this.getTableWebsite(id, table, mapTaskList[i])
            })
          }
        })
      }
    },

    getTableByTask(task) {
      const { dag = {} } = task
      if (dag.edges?.length && dag.nodes?.length) {
        const outputsMap = {}
        const inputsMap = {}

        dag.edges.forEach(({ source, target }) => {
          let _source = outputsMap[source]
          let _target = inputsMap[target]

          if (!_source) {
            outputsMap[source] = [target]
          } else {
            _source.push(target)
          }

          if (!_target) {
            inputsMap[target] = [source]
          } else {
            _target.push(source)
          }
        })

        const targetNode = dag.nodes.find(node => {
          return node.type === 'table' && inputsMap[node.id] && !outputsMap[node.id]
        })

        return targetNode?.tableName
      }
    },

    getApiAppList() {
      let filter = {
        limit: 999,
        order: 'createTime DESC',
        where: {
          item_type: 'app'
        }
      }

      return appApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(({ items }) => {
          return items.map(item => {
            item.LDP_TYPE = 'app'
            return item
          })
        })
    },

    loadApiModule(appId) {
      let filter = {
        limit: 999,
        order: 'createAt DESC',
        where: {
          'listtags.id': appId
        }
      }

      return modulesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(({ items }) => {
          return items.map(this.mapApi)
        })
    },

    mapApi(item) {
      item.statusText = this.apiStatusMap[item.status] || '--'
      return item
    },

    getWebsite(connectionId) {
      return proxyApi
        .call({
          className: 'PDKConnectionService',
          method: 'getConnectorWebsite',
          args: [connectionId]
        })
        .then(data => {
          data?.url && this.$set(this.connectionWebsiteMap, connectionId, data.url)
          return data?.url
        })
    },

    getTableWebsite(connectionId, table, task) {
      return proxyApi
        .call({
          className: 'PDKConnectionService',
          method: 'getTableWebsite',
          args: [connectionId, [table]],
          _: generateId(4)
        })
        .then(data => {
          data?.url && this.$set(task, 'website', data.url)
          return data?.url
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
      if (this.dragging || !this.allowDrop) return
      const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev) {
      if (this.dragging || !this.allowDrop) return

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        this.removeDropEffect(ev)
      }
    },

    removeDropEffect(ev, cls = 'wrap__item') {
      const dropNode = this.findParentByClassName(ev.currentTarget, cls)
      dropNode.classList.remove('is-drop-inner')
    },

    handleDrop(ev, item) {
      ev.preventDefault()
      this.removeDropEffect(ev)

      if (this.dragging) return

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (!this.allowDrop) return

      if (item.LDP_TYPE === 'app') {
        if (object.data.type === 'table') {
          this.apiDialog.from = object.parent.data
          this.apiDialog.tableName = object.data.name
          this.apiDialog.to = item
        }

        this.showApiDialog()
      } else {
        if (object.data.type === 'connection') {
          this.dialogConfig.from = object.data
          this.dialogConfig.tableName = null
          this.dialogConfig.to = item
          this.dialogConfig.title = this.$t('packages_business_create_clone_task')
          this.dialogConfig.syncType = 'migrate'
          this.dialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
        } else if (object.data.type === 'table') {
          this.dialogConfig.from = object.parent.data
          this.dialogConfig.tableName = object.data.name
          this.dialogConfig.to = item
          this.dialogConfig.title = this.$t('packages_business_create_sync_task')
          this.dialogConfig.syncType = 'sync'
          this.dialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] from [ ${object.parent.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
        }

        this.showDialog()
      }
    },

    showApiDialog() {
      this.apiDialog.visible = true
    },

    makeMigrateTask(from, to) {
      let source = this.getDatabaseNode(from)
      let target = this.getDatabaseNode(to)
      Object.assign(source, {
        migrateTableSelectType: 'expression',
        tableExpression: '.*'
      })

      return {
        ...TASK_SETTINGS,
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
        ...TASK_SETTINGS,
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

    async dialogSubmit(ifStart) {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const { syncType, from, to, tableName } = this.dialogConfig
          let task
          this.creating = true

          if (syncType === 'sync') {
            task = this.makeSyncTask(from, tableName, to)
          } else if (syncType === 'migrate') {
            task = this.makeMigrateTask(from, to)
          }

          let taskInfo = await taskApi[ifStart ? 'saveAndStart' : 'post'](task)
          const table = this.getTableByTask(taskInfo)
          const mapTask = this.mapTask(taskInfo)

          if (to.showTableWebsite) this.getTableWebsite(to.id, table, mapTask)

          this.dialogConfig.visible = false
          this.creating = false

          if (this.connectionTaskMap[to.id]) {
            this.connectionTaskMap[to.id].unshift(mapTask)
          } else {
            this.$set(this.connectionTaskMap, to.id, [mapTask])
          }

          const h = this.$createElement
          this.$message.success({
            message: h(
              'span',
              {
                class: 'color-primary fs-7 clickable',
                on: {
                  click: () => {
                    this.handleClickName(taskInfo)
                  }
                }
              },
              this.$t('packages_business_task_created_success')
            )
          })
        }
      })
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

    mapConnection(item) {
      item.LDP_TYPE = 'connection'
      item.showConnectorWebsite = item?.capabilities.some(c => c.id === 'connector_website_function')
      item.showTableWebsite = item?.capabilities.some(c => c.id === 'connector_website_function')

      if (item.showConnectorWebsite) {
        this.getWebsite(item.id)
      }

      return item
    },

    //打开连接详情
    openView(row) {
      this.$refs.targetconnectionView.open(row)
    },

    addItem(item) {
      if (item.LDP_TYPE !== 'app') {
        this.mapConnection(item)
        this.loadTask([item])
      }

      this.list.unshift(item)
    },

    async getApiServerHost() {
      const showError = () => {
        this.$message.error(this.$t('packages_business_data_server_list_huoqufuwuyu'))
      }
      const data = await apiServerApi.get().catch(() => {
        showError()
      })
      this.apiServerHost = data?.items?.[0]?.clientURI || ''
      if (!this.apiServerHost) {
        showError()
      }
    },

    handlePreviewApi(row = {}) {
      this.$refs.apiPreview.open(row)
    },

    handleSearch(val) {
      this.searchIng = true
      this.debouncedSearch(val)
    },

    handleAddApi(data, app) {
      data = this.mapApi(data)

      if (!app.modules) this.$set(app, 'modules', [data])
      else app.modules.unshift(data)
    },

    handleOpenWebsite(url) {
      window.open(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap__item {
  border: 1px solid #e1e3e9;

  &:hover {
    //background-color: #f2f3f5;
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
</style>