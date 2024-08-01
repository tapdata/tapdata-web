<template>
  <div class="list__item flex flex-column flex-1 overflow-hidden">
    <div class="list__title list__title__target flex align-center px-4">
      <span class="fs-6">{{ $t('packages_business_data_console_targets') }}</span>
      <div class="flex-grow-1"></div>
      <IconButton :disabled="highlightBoard" id="btn-add-target" @click="handleAdd">add</IconButton>
      <IconButton :disabled="highlightBoard" :class="{ active: enableSearch }" @click="toggleEnableSearch"
        >search-outline</IconButton
      >
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

      <div class="flex-fill min-h-0 overflow-auto p-4 position-relative ldp-list-item-wrapper" @scroll="handleScroll">
        <!--<draggable v-model="filterList" @start="dragging = true" @end="dragging = false">-->
        <div
          v-for="item in filterList"
          :ref="`wrap__item${item.id}`"
          :key="item.id"
          class="wrap__item rounded-lg mb-4 position-relative overflow-hidden"
          :class="{ 'opacity-50': item.disabled }"
          @dragover="handleDragOver"
          @dragenter.stop="handleDragEnter($event, item)"
          @dragleave.stop="handleDragLeave($event, item)"
          @drop.stop="handleDrop($event, item)"
        >
          <template v-if="item.LDP_TYPE === 'app'">
            <div class="item__header px-3 py-2">
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
                      <div :ref="`ldp_target_api_${m.id}`" class="p-1 ellipsis flex-1 align-center position-relative">
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
            <div
              class="drop-mask position-absolute absolute-fill p-2 flex-column justify-content-center align-center gap-2"
              :class="{ flex: nonSupportApi }"
            >
              <ElTooltip
                placement="top"
                :content="$t('packages_ldp_src_target_muqianzhichide') + ':' + apiSupportTypes.join(',')"
              >
                <span> {{ `${$t('packages_dag_components_node_zanbuzhichi')} ${dragDatabaseType}` }}</span>
              </ElTooltip>
            </div>
          </template>
          <template v-else>
            <div class="item__header px-3 py-2 clickable" @click="$emit('preview', item)">
              <div class="flex align-center overflow-hidden">
                <DatabaseIcon :item="item" :size="20" class="item__icon flex-shrink-0" />
                <span
                  class="font-color-normal fw-sub fs-6 lh-base flex-1 ml-2 flex align-center overflow-hidden"
                  :title="item.name"
                  ><span class="ellipsis">{{ item.name }}</span>
                  <ElTag v-if="item.disabled" class="ml-1" type="info" size="small">{{
                    $t('public_status_invalid')
                  }}</ElTag>
                  <ElTag
                    v-if="item.showConnectorWebsite && connectionWebsiteMap[item.id]"
                    size="small"
                    class="ml-1 px-1 flex align-center clickable"
                    @click="handleOpenWebsite(connectionWebsiteMap[item.id])"
                    ><VIcon class="mr-1" size="14">open-in-new</VIcon
                    >{{ $t('packages_business_swimlane_target_shouye') }}</ElTag
                  ><span
                    v-if="connectionTaskMap[item.id] && connectionTaskMap[item.id].length"
                    class="task-num-badge"
                    >{{ connectionTaskMap[item.id].length }}</span
                  >
                </span>
                <!--                <IconButton class="ml-1" @click="$emit('preview', item)">view-details</IconButton>-->
                <!--                <IconButton
                  v-if="item.showConnectorWebsite && connectionWebsiteMap[item.id]"
                  @click="handleOpenWebsite(connectionWebsiteMap[item.id])"
                  >open-in-new</IconButton
                >-->
              </div>
              <!--              <div class="mt-2 font-color-light">
                {{ $t('packages_business_data_console_target_connection_desc', { val: item.database_type }) }}
              </div>-->
            </div>
            <TaskList
              ref="taskList"
              :item-id="item.id"
              :list="connectionTaskMap[item.id] || []"
              :startTask="startTask"
              :forceStopTask="forceStopTask"
              :stopTask="stopTask"
              :getReplicateLag="getReplicateLag"
              @edit-in-dag="handleClickName"
              @find-parent="handleFindParent"
            ></TaskList>
          </template>
        </div>
        <div v-if="!filterList.length" class="h-100 flex align-center justify-center">
          <VEmpty :description="$t('packages_ldp_target_empty_text')"></VEmpty>
        </div>
        <!--</draggable>-->
      </div>

      <ElDialog :visible.sync="taskDialogConfig.visible" width="600" :close-on-click-modal="false">
        <span slot="title" class="font-color-dark fs-6 fw-sub">{{ taskDialogConfig.title }}</span>
        <ElForm ref="form" :model="taskDialogConfig" label-width="180px" @submit.prevent :rules="formRules">
          <!--          <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">{{ taskDialogConfig.desc }}</div>-->
          <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
            <span>{{
              $t(
                taskDialogConfig.tableName
                  ? 'packages_business_target_create_task_dialog_desc_prefix_sync'
                  : 'packages_business_target_create_task_dialog_desc_prefix_clone'
              )
            }}</span
            ><span v-if="taskDialogConfig.from" class="inline-flex align-center px-1 font-color-dark fw-sub align-top"
              ><DatabaseIcon
                :item="taskDialogConfig.from"
                :key="taskDialogConfig.from.database_type"
                :size="20"
                class="mr-1"
              />
              <span>{{ taskDialogConfig.from.name }}</span> </span
            ><span v-if="taskDialogConfig.tableName" class="font-color-dark fw-sub"
              >/<span class="px-1">{{ taskDialogConfig.tableName }}</span> </span
            ><span>
              {{ $t('packages_business_target_create_task_dialog_desc_to') }}
              <span v-if="taskDialogConfig.to" class="inline-flex align-center px-1 font-color-dark fw-sub align-top"
                ><DatabaseIcon
                  :item="taskDialogConfig.to"
                  :key="taskDialogConfig.to.database_type"
                  :size="20"
                  class="mr-1"
                />
                <span>{{ taskDialogConfig.to.name }}</span>
              </span></span
            >
          </div>
          <ElFormItem prop="taskName" :label="$t('public_task_name')">
            <ElInput size="small" v-model="taskDialogConfig.taskName" maxlength="50" show-word-limit></ElInput>
          </ElFormItem>
          <ElFormItem :label="$t('packages_dag_task_setting_sync_type')" prop="task.type">
            <ElRadioGroup v-model="taskDialogConfig.task.type">
              <ElTooltip
                :disabled="!taskDialogConfig.notSupportedCDC"
                :content="$t('packages_ldp_not_support_increments')"
              >
                <ElRadio label="initial_sync+cdc" :disabled="taskDialogConfig.notSupportedCDC">
                  {{ $t('packages_dag_task_setting_initial_sync_cdc') }}
                </ElRadio>
              </ElTooltip>

              <ElRadio label="initial_sync">
                {{ $t('public_task_type_initial_sync') }}
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <div class="flex align-center gap-3" v-if="taskDialogConfig.task.type === 'initial_sync'">
            <ElFormItem
              :label="$t('packages_dag_task_setting_crontabExpressionFlag')"
              prop="task.crontabExpressionType"
            >
              <ElSelect
                v-model="taskDialogConfig.task.crontabExpressionType"
                @change="handleChangeCronType"
                class="flex-1"
              >
                <ElOption v-for="(opt, i) in cronOptions" :key="i" v-bind="opt"></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              v-if="taskDialogConfig.task.crontabExpressionType === 'custom'"
              prop="task.crontabExpression"
              label-width="0"
            >
              <ElInput v-model="taskDialogConfig.task.crontabExpression"></ElInput>
            </ElFormItem>
          </div>
        </ElForm>
        <span slot="footer" class="dialog-footer">
          <ElButton size="mini" @click="hideDialog">{{ $t('public_button_cancel') }}</ElButton>
          <ElButton :disabled="highlightBoard" :loading="creating" size="mini" @click="dialogSubmit(false)">{{
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
      <ApiPreview v-if="isDaas" ref="apiPreview" :host="apiServerHost" disableApp />
    </div>
  </div>
</template>

<script>
// import draggable from 'vuedraggable'
import { debounce, cloneDeep } from 'lodash'
import { defineComponent, ref } from '@vue/composition-api'

import {
  apiServerApi,
  appApi,
  connectionsApi,
  measurementApi,
  modulesApi,
  proxyApi,
  taskApi,
  workerApi
} from '@tap/api'
import { uuid, generateId, Time, calcTimeUnit } from '@tap/shared'
import { VIcon, IconButton, VEmpty } from '@tap/component'
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
import { mapGetters } from 'vuex'

const TaskList = defineComponent({
  props: ['list', 'startTask', 'forceStopTask', 'stopTask', 'getReplicateLag'],
  setup(props, { emit }) {
    const limit = 10
    const isLimit = ref(true)
    return () => {
      const list = isLimit.value ? props.list.slice(0, limit) : props.list

      return (
        <div staticClass="item__content position-relative">
          {props.list.length ? (
            <div class="task-list">
              <div class="task-list-content">
                {list.map((task, i) => (
                  <div key={i} class="task-list-item flex align-center p-2 gap-4" id={`task-${task.id}`}>
                    <div class="ellipsis flex-1 align-center flex gap-4">
                      <a
                        class="el-link el-link--primary justify-content-start"
                        title={task.name}
                        onClick={() => emit('edit-in-dag', task)}
                      >
                        <span class="ellipsis">{task.name}</span>
                      </a>
                      {task.status === 'running' && props.getReplicateLag(task.id) && (
                        <ElTooltip content={i18n.t('public_event_incremental_delay')} placement="top">
                          <span class="font-color-sslight flex align-center gap-1">
                            <VIcon>time</VIcon>
                            <span>{props.getReplicateLag(task.id)}</span>
                          </span>
                        </ElTooltip>
                      )}
                    </div>
                    <div class="">
                      <TaskStatus reverse task={task}></TaskStatus>
                    </div>

                    <div>
                      {task.btnDisabled.stop && task.btnDisabled.forceStop ? (
                        <ElLink
                          type="primary"
                          disabled={task.btnDisabled.start}
                          onClick={() => props.startTask([task.id])}
                        >
                          {i18n.t('public_button_start')}
                        </ElLink>
                      ) : task.status === 'stopping' ? (
                        <ElLink
                          key="forceStop"
                          type="primary"
                          disabled={task.btnDisabled.forceStop}
                          onClick={() => props.forceStopTask([task.id], task)}
                        >
                          {i18n.t('public_button_force_stop')}
                        </ElLink>
                      ) : (
                        <ElLink
                          key="stop"
                          type="primary"
                          disabled={task.btnDisabled.stop}
                          onClick={() => props.stopTask([task.id], task)}
                        >
                          {i18n.t('public_button_stop')}
                        </ElLink>
                      )}
                      <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
                      <ElLink name="monitor" type="primary" onClick={() => emit('edit-in-dag', task)}>
                        {i18n.t(
                          ['edit', 'wait_start'].includes(task.status)
                            ? 'public_button_edit'
                            : 'packages_business_task_list_button_monitor'
                        )}
                      </ElLink>
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
                ))}
              </div>
              {props.list.length > limit && (
                <div class="text-center py-2 border-top">
                  <ElButton
                    onClick={() => {
                      isLimit.value = !isLimit.value
                    }}
                    size="mini"
                    round
                    staticClass="task-list-item-more fs-8"
                    class={{ 'is-reverse': !isLimit.value }}
                  >
                    {i18n.t(isLimit.value ? 'packages_business_view_more' : 'packages_business_view_collapse')}
                    <VIcon class="ml-1">arrow-down</VIcon>
                  </ElButton>
                </div>
              )}
            </div>
          ) : (
            <VEmpty small description={i18n.t('packages_ldp_drag_source_table_to_start')}></VEmpty>
          )}
        </div>
      )
    }
  }
})

export default {
  name: 'Target',

  props: {
    dragState: Object,
    fdmAndMdmId: Array,
    showParentLineage: Boolean
  },

  components: { ApiPreview, CreateRestApi, DatabaseIcon, TaskList, IconButton, VIcon, VEmpty },

  mixins: [commonMix],

  inject: ['buried'],

  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      dragging: false,
      list: [],
      appList: [],
      taskDialogConfig: {
        title: '',
        desc: '',
        taskName: '',
        syncType: '',
        visible: false,
        from: null,
        to: null,
        task: {
          type: 'initial_sync+cdc',
          crontabExpressionFlag: false,
          crontabExpression: '',
          crontabExpressionType: 'once'
        }
      },
      connectionTaskMap: {},
      apiDialog: {
        visible: false
      },
      apiServerHost: '',
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
      connectionWebsiteMap: {},
      apiSupportTypes: ['Mysql', 'SQL Server', 'Oracle', 'MongoDB', 'PostgreSQL', 'Tidb', 'Doris'],
      searchKeywordList: []
    }
  },

  computed: {
    ...mapGetters(['startingTour']),
    allowDrop() {
      return (
        this.dragState.isDragging &&
        ['SOURCE', 'FDM', 'MDM'].includes(this.dragState.from) &&
        ['connection', 'table'].includes(this.dragState.draggingObjects[0]?.data.LDP_TYPE)
      )
    },

    filterList() {
      if (this.showParentLineage) {
        let result = []
        this.searchKeywordList.forEach(item => {
          if (item.type === 'apiserverLineage') {
            // item的数据结构：appName,serverName,table,type
            const appList = cloneDeep(this.list.filter(item => item.LDP_TYPE === 'app'))
            const findApp = appList.find(t => t.value === item.appName)
            const findServer = findApp?.modules?.find(t => t.name === item.serverName)
            if (!findServer) return
            const findOne = result.find(t => t.value === item.appName)
            if (findOne) {
              findOne.modules.push(findServer)
            } else {
              result.push(Object.assign({}, findApp, { modules: [findServer] }))
            }
          }
        })
        return result
      }
      if (!this.search) return this.list.filter(item => !this.fdmAndMdmId.includes(item.id))

      return this.list.filter(
        item =>
          !this.fdmAndMdmId?.includes(item.id) &&
          (item.name?.includes(this.search) || item.value?.includes(this.search))
      )
    },

    dragDatabaseType() {
      if (!this.dragState.isDragging) return

      const object = this.dragState.draggingObjects[0]

      if (object?.data.type === 'table') {
        return object.parent.data.database_type
      }

      return object?.data.database_type
    },

    nonSupportApi() {
      return this.dragDatabaseType && !this.apiSupportTypes.includes(this.dragDatabaseType)
    }
  },

  mounted() {
    this.init()
    this.isDaas && this.getApiServerHost()
  },

  destroyed() {
    this.destroyed = true
    clearTimeout(this.loadTaskTimer)
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

      this.connectionIds = connectionList.map(item => item.id)
      this.list = appList
        .concat(connectionList)
        .sort((obj1, obj2) => new Date(obj2.createTime) - new Date(obj1.createTime))
      await this.autoLoadTaskById()
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
      // const spec = []
      // const ids = list.map(item => {
      //   if (item.showTableWebsite) spec.push(item.id)
      //   return item.id
      // })

      await this.loadConnectionTaskMap()

      // if (spec.length) {
      //   spec.forEach(id => {
      //     const taskList = data[id]
      //     if (taskList?.length) {
      //       const mapTaskList = this.connectionTaskMap[id]
      //       taskList.forEach((task, i) => {
      //         const table = this.getTableByTask(task)
      //         if (table) this.getTableWebsite(id, table, mapTaskList[i])
      //       })
      //     }
      //   })
      // }
    },

    async loadConnectionTaskMap() {
      const data = await taskApi.getTaskByConnection({
        connectionIds: this.connectionIds.join(','),
        position: 'target'
      })

      const taskMap = {}

      Object.keys(data).forEach(key => {
        this.$set(
          this.connectionTaskMap,
          key,
          data[key]
            .filter(task => {
              if (task.status === 'running') {
                taskMap[task.id] = {
                  uri: '/api/measurement/query/v2',
                  param: {
                    startAt: new Date(task.startTime).getTime(),
                    endAt: Time.now(),
                    samples: {
                      data: {
                        tags: {
                          type: 'task',
                          taskId: task.id,
                          taskRecordId: task.taskRecordId
                        },
                        endAt: Time.now(),
                        fields: ['replicateLag'],
                        type: 'instant'
                      }
                    }
                  }
                }
              }
              return (
                !['deleting', 'delete_failed'].includes(task.status) && !task.is_deleted && task.syncType === 'migrate'
              )
            })
            .reverse()
            .map(this.mapTask)
        )
      })

      const taskDataMap = await measurementApi.batch(taskMap)
      const map = {}
      for (let id in taskDataMap) {
        let current = taskDataMap[id].data?.samples?.data?.[0]

        if (current) {
          // current.replicateLag = Math.round(Math.random() * 1000) // demo
          map[id] = current
        }
      }

      this.taskMeasurementMap = map

      this.$store.commit('setTaskLoadedTime')
    },

    async autoLoadTaskById() {
      clearTimeout(this.loadTaskTimer)

      if (this.destroyed) return

      await this.loadConnectionTaskMap()

      this.loadTaskTimer = setTimeout(() => {
        this.autoLoadTaskById()
      }, 5000)
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

    handleDragEnter(ev, item) {
      ev.preventDefault()

      if (this.dragging || !this.allowDrop || item.disabled) return

      const dropNode = this.findParentByClassName(ev.currentTarget, 'wrap__item')
      dropNode.classList.add('is-drop-inner')
    },

    handleDragLeave(ev, item) {
      if (this.dragging || !this.allowDrop || item.disabled) return

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

      if (this.dragging || item.disabled) return

      const { draggingObjects } = this.dragState
      if (!draggingObjects.length) return
      const object = draggingObjects[0]

      if (!this.allowDrop) return
      if (item.LDP_TYPE === 'app') {
        if (object.data.type === 'table') {
          if (!this.apiSupportTypes.includes(object.parent.data.database_type)) return

          this.apiDialog.from = object.parent.data
          this.apiDialog.tableName = object.data.name
          this.apiDialog.to = item
        }

        this.showApiDialog()
      } else {
        if (object.data.type === 'connection') {
          this.taskDialogConfig.from = object.data
          this.taskDialogConfig.tableName = null
          this.taskDialogConfig.to = item
          this.taskDialogConfig.title = this.$t('packages_business_create_clone_task')
          this.taskDialogConfig.syncType = 'migrate'
          this.taskDialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
        } else if (object.data.type === 'table') {
          this.taskDialogConfig.from = object.parent.data
          this.taskDialogConfig.tableName = object.data.name
          this.taskDialogConfig.to = item
          this.taskDialogConfig.title = this.$t('packages_business_create_sync_task')
          this.taskDialogConfig.syncType = 'sync'
          this.taskDialogConfig.desc = `Tapdata will create a pipeline task to sync [ ${object.data.name} ] from [ ${object.parent.data.name} ] to [ ${item.name} ],  please click button below to continue. You can also change the pipeline name`
        }

        this.taskDialogConfig.syncType = 'migrate'

        this.showDialog()
      }
    },

    showApiDialog() {
      this.apiDialog.visible = true
    },

    makeMigrateTask(from, tableName, to) {
      let source = this.getSourceNode(from, tableName)
      let target = this.getDatabaseNode(to)

      return {
        ...TASK_SETTINGS,
        syncType: 'migrate',
        name: this.taskDialogConfig.taskName,
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

    getSourceNode(from, tableName) {
      let source = this.getDatabaseNode(from)

      Object.assign(
        source,
        tableName
          ? {
              migrateTableSelectType: 'custom',
              tableNames: [tableName]
            }
          : {
              migrateTableSelectType: 'expression',
              tableExpression: '.*'
            }
      )

      return source
    },

    getTableNode(db = {}, tableName) {
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
          capabilities: db.capabilities || [],
          hasCreated: false
        }
      }
    },

    makeSyncTask(fromConnection, tableName, to) {
      let source = this.getTableNode(fromConnection, tableName)
      let target = this.getTableNode(to, tableName)
      return {
        ...TASK_SETTINGS,
        name: this.taskDialogConfig.taskName,
        dag: {
          edges: [{ source: source.id, target: target.id }],
          nodes: [source, target]
        }
      }
    },

    async showDialog() {
      this.taskDialogConfig.visible = true
      this.$refs.form?.resetFields()
      this.taskDialogConfig.task.crontabExpressionFlag = false
      this.taskDialogConfig.task.crontabExpression = ''
      this.taskDialogConfig.task.type = this.highlightBoard ? 'initial_sync' : 'initial_sync+cdc'
      this.taskDialogConfig.taskName = await this.makeTaskName(`${i18n.t('public_task')} `)
    },

    hideDialog() {
      this.taskDialogConfig.visible = false
    },

    async dialogSubmit(ifStart) {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const { syncType, from, to, tableName, task: settings } = this.taskDialogConfig
          let task
          this.creating = true

          if (syncType === 'sync') {
            task = this.makeSyncTask(from, tableName, to)
          } else if (syncType === 'migrate') {
            task = this.makeMigrateTask(from, tableName, to)
          }

          Object.assign(task, settings)
          let taskInfo
          try {
            taskInfo = await taskApi.save(task)

            if (ifStart) {
              // 保存并运行
              // taskInfo = await taskApi.save(task)

              taskInfo = await taskApi.saveAndStart(taskInfo, {
                params: {
                  confirm: true
                }
              })
            }
          } catch (e) {
            if (e.data?.code === 'Task.ScheduleLimit') {
              this.$emit('handle-show-upgrade', e.data)
            } else if (e.data?.code === 'Task.ManuallyScheduleLimit') {
              this.$message.error(e.data.message)
            }
            this.taskDialogConfig.visible = false
            this.creating = false
            return
          }

          const table = this.getTableByTask(taskInfo)
          const mapTask = this.mapTask(taskInfo)

          if (to.showTableWebsite) this.getTableWebsite(to.id, table, mapTask)

          this.taskDialogConfig.visible = false
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

          if (this.startingTour) {
            this.$store.commit('setReplicationTour', {
              behavior: 'add-task',
              taskId: taskInfo.id
            })
            // 上报引导创任务
            this.buried(`guideCreateTask`, {
              taskId: taskInfo.id
            })
          }
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
      return makeStatusAndDisabled(task)
      // const { id, name, status, syncType } = task
      // return { id, name, status, syncType }
    },

    mapConnection(item) {
      item.disabled = item.status !== 'ready'
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
        this.connectionIds.push(item.id)
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
    },

    handleFindTaskDom(val = {}) {
      const modules = Object.values(val.modules) || []
      const app = modules?.[0] || {}
      const el = this.$refs[`ldp_target_api_${app.id}`]?.[0]
      return el?.parentNode
    },

    handleScroll: debounce(function () {
      this.$emit('on-scroll')
    }, 200),

    searchByKeywordList(val = []) {
      this.searchKeywordList = val
    },

    startTask(ids) {
      taskApi.batchStart(ids).then(data => {
        this.autoLoadTaskById()
        if (data.every(t => t.code === 'ok')) {
          this.$message.success(this.$t('public_message_operation_success'))
        } else {
          const findManuallyScheduleLimit = data.find(t => t.code === 'Task.ManuallyScheduleLimit')
          const findScheduleLimit = data.find(t => t.code === 'Task.ScheduleLimit')
          if (findScheduleLimit) {
            this.$emit('handle-show-upgrade', findScheduleLimit)
            return
          } else if (findManuallyScheduleLimit) {
            this.$message.error(findManuallyScheduleLimit.message)
            return
          }
          this.$message.error(data[0]?.message)
        }
      })
    },

    async forceStopTask(ids, item = {}) {
      let data = await workerApi.taskUsedAgent(ids)
      let msgObj = this.getConfirmMessage('force_stop', ids.length > 1, item.name)
      if (data?.status === 'offline' && !this.isDaas) {
        msgObj = this.getConfirmMessage('agent_force_stop', ids.length > 1, item.name)
      }
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false,
        zIndex: 999999
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
          this.autoLoadTaskById()
          this.$message.success(data?.message || this.$t('public_message_operation_success'), false)
        })
      })
    },

    stopTask(ids, item) {
      let msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      let message = msgObj.msg
      this.$confirm(message, '', {
        type: 'warning',
        showClose: false,
        zIndex: 999999
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.autoLoadTaskById()
          this.$message.success(data?.message || this.$t('public_message_operation_success'), false)
        })
      })
    },

    getConfirmMessage(operateStr, isBulk, name) {
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      if (isBulk) {
        title = 'bulk_' + title
        message = 'bulk_' + message
      }
      const h = this.$createElement
      let strArr = this.$t('packages_business_dataFlow_' + message).split('xxx')
      let msg = h(
        'p',
        {
          style: 'width: calc(100% - 28px);word-break: break-all;'
        },
        [
          strArr[0],
          h(
            'span',
            {
              class: 'color-primary'
            },
            name
          ),
          strArr[1]
        ]
      )
      return {
        msg,
        title: this.$t('packages_business_dataFlow_' + title)
      }
    },

    getReplicateLag(taskId) {
      const replicateLag = this.taskMeasurementMap?.[taskId]?.replicateLag

      if (replicateLag != undefined) {
        return calcTimeUnit(replicateLag, 2, {
          autoHideMs: true
        })
      }
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
    .task-list-content {
      .task-list-item:not(:last-child) {
        border-bottom: 1px solid #ececec;
      }
    }
    .task-list-item-more {
      .v-icon {
        vertical-align: -0.125em;
        transition: transform 0.3s;
        transform: rotate(0deg);
      }

      &.is-reverse .v-icon {
        transform: rotate(180deg);
      }
    }
  }
}
.item__header {
  border-bottom: 1px solid #e1e3e9;
  &:hover {
    background-color: #f2f3f5;
  }

  .task-num-badge {
    display: inline-block;
    margin-left: 4px;
    padding: 2px 6px;
    border-radius: 18px;
    background: #e8f3ff;
    color: #2c65ff;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    vertical-align: baseline;
  }
}
.item__icon {
  //border: 1px solid #4e5969;
}
.ldp-list-item-wrapper:has(.driver-active-element) {
  overflow: hidden !important;
}
</style>
