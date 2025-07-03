<script>
import {
  CancelToken,
  discoveryApi,
  ldpApi,
  metadataInstancesApi,
  modulesApi,
  proxyApi,
  taskApi,
  workerApi,
} from '@tap/api'
import { DatabaseIcon } from '@tap/business/src/components/DatabaseIcon'
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { makeStatusAndDisabled, TASK_TYPE_MAP } from '@tap/business/src/shared'
import { VEmpty } from '@tap/component/src/base/v-empty'
import VTable from '@tap/component/src/base/v-table'
import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import Drawer from '@tap/component/src/Drawer.vue'
import { IconButton } from '@tap/component/src/icon-button'
import i18n from '@tap/i18n'

import { calcTimeUnit, calcUnit, isNum } from '@tap/shared'
import dayjs from 'dayjs'
import { cloneDeep, debounce } from 'lodash-es'
import { h } from 'vue'
import { $emit, $off, $on, $once } from '../utils/gogocodeTransfer'
import TableLineage from './components/TableLineage'

export default {
  name: 'TablePreview',
  components: {
    Drawer,
    VTable,
    TaskStatus,
    VEmpty,
    DatabaseIcon,
    TableLineage,
    VCodeEditor,
    IconButton,
  },
  props: {
    tag: {
      type: String,
      default: 'Drawer',
    },
  },
  data() {
    return {
      visible: false,
      activeName: 'overView',
      activeNameItems: 'columnsPreview',
      loading: false,
      detailData: {},
      tableFields: [],
      sampleData: [],
      sampleHeader: [],
      loadingSampleData: false,
      columnsPreview: [],
      columns: [
        {
          label: i18n.t('public_name'),
          prop: 'name',
          className: 'text-nowrap',
          minWidth: 120,
        },
        {
          label: i18n.t('public_type'),
          prop: 'dataType',
          minWidth: 120,
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_zhujian'),
          slotName: 'primaryKey',
          align: 'center',
          minWidth: 100,
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_waijian'),
          prop: 'foreignKey',
          slotName: 'foreignKey',
          align: 'center',
          minWidth: 100,
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_suoyin'),
          prop: 'index',
          slotName: 'index',
          align: 'center',
        },
        {
          label: i18n.t('meta_table_not_null'),
          prop: 'notNull',
          slotName: 'notNull',
          align: 'center',
        },
        {
          label: i18n.t('meta_table_default'),
          prop: 'defaultValue',
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumingcheng'),
          prop: 'businessName',
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewuleixing'),
          prop: 'businessType',
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc',
        },
      ],
      taskData: [],
      storageSize: '',
      numOfRows: '',
      tableStatus: '',
      cdcDelayTime: '',
      lastDataChangeTime: '',
      statusMap: {
        error: i18n.t('packages_business_table_status_error'), // 异常
        draft: i18n.t('packages_business_table_status_draft'), // 草稿
        normal: i18n.t('packages_business_table_status_normal'), // 正常
      },
      apisColumns: [
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apifuwu'),
          prop: 'name',
        },
        {
          label: i18n.t('packages_business_data_server_list_fuwuzhuangtai'),
          prop: 'status',
          slotName: 'status',
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_fangwencishu'),
          prop: 'visitCount',
          default: 0,
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apIfangwen'),
          prop: 'visitLine',
          default: 0,
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apIchuanshu'),
          prop: 'transitQuantityLabel',
          default: 0,
        },
        {
          label: i18n.t(
            'packages_business_swimlane_tablepreview_zuihoufangwenshi',
          ),
          prop: 'last_updated',
          dataType: 'time',
          width: 160,
        },
      ],
      statusOptions: [
        {
          label: i18n.t('public_select_option_all'),
          value: '',
        },
        {
          label: i18n.t('modules_active'),
          value: 'active',
        },
        {
          label: i18n.t('modules_pending'),
          value: 'pending',
        },
        {
          label: i18n.t('api_monitor_total_api_list_status_generating'),
          value: 'generating',
        },
      ],
      selected: {},
      swimType: '', // source/fdm/mdm/target
      asTaskType: 'all',
      connection: null,
      taskLoading: false,
      isTableView: false,
      descIsEdit: false,
      apiSupportTypes: [
        'Mysql',
        'SQL Server',
        'Oracle',
        'MongoDB',
        'PostgreSQL',
        'Tidb',
        'Doris',
      ],
    }
  },
  computed: {
    filterTask() {
      if (this.asTaskType === 'all') return this.taskData
      if (this.asTaskType === 'source') return this.sourceTask
      if (this.asTaskType === 'target') return this.targetTask
      return this.taskData
    },
    sourceTask() {
      return this.taskData.filter((task) => task.isAsSource)
    },
    targetTask() {
      return this.taskData.filter((task) => !task.isAsSource)
    },
    databaseName() {
      if (!this.connection) return this.detailData.sourceType

      const config = this.connection.config

      if (config.uri && config.isUri !== false) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
            config.uri,
          )
        if (regResult && regResult.groups) {
          config.database = regResult.groups.database
        }
      }

      return config.database || config.sid || this.detailData.sourceType
    },
    colWidth() {
      const { locale } = this.$i18n
      return locale === 'en'
        ? {
            taskType: 130,
            status: 145,
            operation: 340,
          }
        : {
            taskType: 80,
            status: 110,
            operation: 280,
          }
    },

    sampleDataJson() {
      return JSON.stringify(this.sampleData.slice(0, 10), null, 2)
    },

    canClickStatus() {
      return this.tableStatus === 'error' && this.targetTask.length > 0
    },

    connectionType() {
      return this.connection?.database_type || this.detailData.connectionType
    },
  },
  watch: {
    visible(v) {
      if (v) {
        this.cancelSource?.cancel()
        clearTimeout(this.loadTaskTimer)
      }
    },
  },
  beforeUnmount() {
    this.destroyed = true
    this.cancelSource?.cancel()
    clearTimeout(this.loadTaskTimer)
  },
  methods: {
    init() {
      this.detailData = {}
      this.tableFields = []
      this.sampleData = []
      this.sampleHeader = []
      this.taskData = []
      this.storageSize = ''
      this.numOfRows = ''
      this.tableStatus = ''
      this.cdcDelayTime = ''
      this.lastDataChangeTime = ''
    },
    getPreviewColumns(sourceType) {
      const result = [
        {
          label: i18n.t('public_name'),
          prop: 'name',
        },
        {
          label: i18n.t('public_type'),
          prop: 'dataType',
        },
      ]
      if (sourceType !== 'MongoDB') {
        result.push({
          label: i18n.t('packages_form_field_inference_list_ziduanzhushi'),
          prop: 'comment',
        })
      }
      result.push({
        label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
        prop: 'businessDesc',
        slotName: 'businessDesc',
      })
      this.columnsPreview = result
    },
    open(row, connection, callback = {}) {
      clearTimeout(this.visibleTimer)
      clearTimeout(this.loadTaskTimer)
      this.cancelSource?.cancel()

      // if (!this.visible) this.reset()

      this.init()
      this.getPreviewColumns(row.sourceType)
      this.visible = true
      this.swimType = row.SWIM_TYPE
      this.connectionId = row.connectionId
      this.selected = cloneDeep(row)
      this.connection = connection
      this.callback = callback
      this.getTableStorage(row)
    },
    getTableStorage(row) {
      this.loading = true
      discoveryApi
        .overViewStorage(row.id)
        .then((res) => {
          for (const key in res) {
            this.detailData[key] = res[key]
          }

          this.detailData.lastUpdAt = this.detailData.lastUpdAt
            ? dayjs(this.detailData.lastUpdAt).format('YYYY-MM-DD HH:mm:ss')
            : '-'
          this.tableFields = res?.fields || []
          this.getSampleData()
          this.loadTask()
          this.getTaskStatus()
        })
        .finally(() => {
          this.loading = false
        })
    },
    async loadTask(silenceLoading) {
      if (this.destroyed || !this.visible) return

      await this.getTasks(silenceLoading)
      this.loadTaskTimer = setTimeout(() => {
        this.loadTask(true)
      }, 5000)
    },
    getTasks(silenceLoading) {
      this.taskLoading = !silenceLoading
      const params = {
        connectionId: this.connectionId,
        tableName: this.detailData.name,
      }
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()
      return taskApi
        .getTaskByTableName(params, {
          cancelToken: this.cancelSource.token,
        })
        .then((taskList) => {
          this.taskData = taskList.filter((task) => {
            if (
              ['deleting', 'delete_failed'].includes(task.status) ||
              task.is_deleted ||
              task._deleted
            )
              return false

            const { dag } = task

            makeStatusAndDisabled(task)

            if (dag.edges?.length && dag.nodes?.length) {
              const outputsMap = {}
              const inputsMap = {}

              dag.edges.forEach(({ source, target }) => {
                const _source = outputsMap[source]
                const _target = inputsMap[target]

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

              task.isAsSource = dag.nodes.some((node) => {
                if (
                  !inputsMap[node.id] &&
                  outputsMap[node.id] &&
                  node.connectionId === this.connectionId
                ) {
                  if (node.type === 'database') return true
                  return node.tableName === params.tableName
                }
              })
            }

            return true
          })
        })
        .finally(() => {
          this.taskLoading = false
        })
    },
    getSampleData() {
      const params = {
        className: 'QueryDataBaseDataService',
        method: 'getData',
        args: [this.connectionId, this.detailData.name],
      }
      this.loadingSampleData = true
      proxyApi
        .call(params)
        .then((res) => {
          this.sampleData = res?.sampleData || []
          //schema返回的数据组装数据
          this.sampleHeader = this.tableFields.map((it) => {
            return {
              name: it.name,
              desc: it.businessDesc,
            }
          })
          // this.storageSize = Math.floor(res?.tableInfo?.storageSize / 1024) || 0
          this.storageSize = calcUnit(res?.tableInfo?.storageSize || 0, 1)
          this.numOfRows = res?.tableInfo?.numOfRows || 0
        })
        .finally(() => {
          this.loadingSampleData = false
        })
    },
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    //
    saveTableDesc() {
      metadataInstancesApi.updateTableDesc({
        id: this.detailData.id,
        description: this.detailData.description,
      })
    },
    //获取表状态
    getTaskStatus() {
      taskApi
        .tableStatus(this.connectionId, this.detailData.name)
        .then((res) => {
          this.tableStatus = res?.status
          this.cdcDelayTime =
            isNum(res?.cdcDelayTime) && res.cdcDelayTime >= 0
              ? calcTimeUnit(res.cdcDelayTime, 2, {
                  autoHideMs: true,
                })
              : '-'
          this.lastDataChangeTime = res?.lastDataChangeTime
            ? dayjs(res?.lastDataChangeTime).format('YYYY-MM-DD HH:mm:ss')
            : '-'
        })
    },
    getApisData() {
      const { connectionId, name } = this.selected || {}

      return modulesApi
        .apiList({ connectionId, tableName: name })
        .then((data) => {
          return {
            total: data.total || 0,
            data:
              data.items?.map((t) => {
                t.statusFmt =
                  this.statusOptions.find((it) => it.value === t.status)
                    ?.label || '-'
                t.transitQuantityLabel = calcUnit(t.transitQuantity, 1)
                return t
              }) || [],
          }
        })
    },

    handleCreateTask() {
      $emit(this, 'create-single-task', this.selected, this.swimType)
    },

    getTaskType(type) {
      return TASK_TYPE_MAP[type] || ''
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleClickName(row) {
      let routeName

      if (!['edit', 'wait_start'].includes(row.status)) {
        routeName =
          row.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
      } else {
        routeName =
          row.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
      }

      this.openRoute({
        name: routeName,
        params: {
          id: row.id,
        },
      })
    },

    openEditor(row) {
      this.openRoute({
        name: row.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor',
        params: {
          id: row.id,
        },
      })
    },

    openMonitor(row) {
      this.openRoute({
        name: row.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor',
        params: {
          id: row.id,
        },
      })
    },

    reset() {
      this.activeName = 'overView'
      this.asTaskType = 'all'
    },

    handleUpdateVisible(val) {
      if (!val) {
        this.visibleTimer = setTimeout(() => {
          this.visible = false
        }, 30)
      }
    },

    startTask(ids) {
      taskApi.batchStart(ids).then((data) => {
        this.getTasks(true)
        if (data.every((t) => t.code === 'ok')) {
          this.$message.success(this.$t('public_message_operation_success'))
        } else {
          const findManuallyScheduleLimit = data.find(
            (t) => t.code === 'Task.ManuallyScheduleLimit',
          )
          const findScheduleLimit = data.find(
            (t) => t.code === 'Task.ScheduleLimit',
          )
          if (findScheduleLimit) {
            $emit(this, 'handle-show-upgrade', findScheduleLimit)
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
      const data = await workerApi.taskUsedAgent(ids)
      let msgObj = this.getConfirmMessage(
        'force_stop',
        ids.length > 1,
        item.name,
      )
      if (data?.status === 'offline' && !this.isDaas) {
        msgObj = this.getConfirmMessage(
          'agent_force_stop',
          ids.length > 1,
          item.name,
        )
      }
      this.$confirm(msgObj.msg, {
        zIndex: 999999,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then((data) => {
          this.getTasks(true)
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
            false,
          )
        })
      })
    },

    stopTask(ids, item) {
      const msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      const message = msgObj.msg
      this.$confirm(message, {
        zIndex: 999999,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then((data) => {
          this.getTasks(true)
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
            false,
          )
        })
      })
    },

    deleteTask(ids, item = {}, canNotList) {
      const msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, {
        zIndex: 999999,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchDelete(ids).then((data) => {
          this.getTasks(true)
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
            false,
          )
        })
      })
    },

    getConfirmMessage(operateStr, isBulk, name) {
      let title = `${operateStr}_confirm_title`,
        message = `${operateStr}_confirm_message`
      if (isBulk) {
        title = `bulk_${title}`
        message = `bulk_${message}`
      }
      const strArr = this.$t(`packages_business_dataFlow_${message}`).split(
        'xxx',
      )
      const msg = h(
        'p',
        {
          style: 'width: calc(100% - 28px);word-break: break-all;',
        },
        [
          strArr[0],
          h(
            'span',
            {
              class: 'color-primary',
            },
            name,
          ),
          strArr[1],
        ],
      )
      return {
        msg,
        title: this.$t(`packages_business_dataFlow_${title}`),
      }
    },

    handleChangeBusinessDesc: debounce(function (val, id, name) {
      const col = this.sampleHeader.find((item) => item.name === name)

      if (col) {
        col.desc = val
      }

      metadataInstancesApi
        .updateTableFieldDesc(this.selected.id, {
          id,
          businessDesc: val,
        })
        .catch(() => {
          this.$message.error(this.$t('public_message_save_fail'))
        })
    }, 300),

    handleDelete() {
      if (this.taskData.length) {
        this.activeName = 'tasks'
        this.$message.warning(
          i18n.t('packages_ldp_src_tablepreview_jiancedaoyouren', {
            val1: this.selected.name,
          }),
        )
        return
      }

      this.$confirm(
        i18n.t('packages_ldp_src_tablepreview_querenshanchu'),
        i18n.t('packages_ldp_src_tablepreview_gaibiaojianghuicong'),
        {
          zIndex: 999999,
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        ldpApi.deleteTable(this.selected.id).then(() => {
          this.visible = false
          this.callback?.onDelete?.(this.selected.parent_id)
        })
      })
    },

    toggleSampleData() {
      this.isTableView = !this.isTableView
    },

    handleClickStatus() {
      if (this.tableStatus === 'error' && this.targetTask.length) {
        const errorTask = this.targetTask.find(
          (task) => task.status === 'error',
        )
        errorTask && this.handleClickName(errorTask)
      }
    },

    handleCreateAPI() {
      this.$emit('create-api', this.connection, this.selected)
    },
  },
}
</script>

<template>
  <component
    :is="tag"
    v-if="visible"
    class="sw-table-drawer flex flex-column"
    :model-value="visible"
    width="850px"
    :with-header="false"
    @update:model-value="handleUpdateVisible"
  >
    <div class="flex flex-column h-100">
      <header class="pt-3">
        <div class="mb-2 flex align-center">
          <span class="table-name inline-block ellipsis">{{
            selected.name
          }}</span>
          <ElTooltip
            v-if="swimType !== 'source'"
            :disabled="!canClickStatus"
            :content="$t('packages_ldp_view_task_monitor')"
            placement="top"
          >
            <span
              class="flex align-center justify-center py-1 status mx-3"
              :class="[`status-${tableStatus}`, { clickable: canClickStatus }]"
              @click="handleClickStatus"
            >
              <VIcon v-if="canClickStatus" class="mr-1">question-circle</VIcon
              ><span class="lh-1">{{ statusMap[tableStatus] }}</span></span
            >
          </ElTooltip>
          <div class="flex-grow-1" />
          <ElButton
            class="flex-shrink-0"
            type="primary"
            @click="handleCreateTask"
          >
            {{ $t('packages_business_swimlane_tablepreview_chuangjianrenwu') }}
          </ElButton>
          <ElButton
            v-if="apiSupportTypes.includes(connectionType) && isDaas"
            class="flex-shrink-0"
            type="primary"
            plain
            @click="handleCreateAPI"
          >
            {{ $t('packages_business_publish_api') }}
          </ElButton>
          <ElButton
            v-if="swimType === 'mdm'"
            class="flex-shrink-0"
            type="danger"
            plain
            @click="handleDelete"
          >
            <VIcon class="mr-1">delete</VIcon>
            {{ $t('public_button_delete') }}
          </ElButton>
        </div>
        <div class="flex align-center gap-8">
          <span class="inline-flex align-center text-uppercase text-nowrap">
            <VIcon class="mr-1" size="18">table</VIcon>
            {{ $t('public_table') }}</span
          >
          <span class="inline-flex align-center">
            <VIcon class="mr-1" size="18">database</VIcon>
            <span class="text-nowrap">{{ databaseName }}</span></span
          >
          <template v-if="swimType !== 'source'">
            <span
              ><span class="table-dec-label"
                >{{ $t('packages_business_last_data_change_time') }}: </span
              ><span class="table-dec-txt text-nowrap">{{
                lastDataChangeTime || '-'
              }}</span></span
            >
            <span
              ><span class="table-dec-label"
                >{{ $t('packages_business_cdc_delay_time') }}: </span
              ><span class="table-dec-txt text-nowrap">{{
                cdcDelayTime || '-'
              }}</span></span
            >
          </template>
        </div>
        <ElDivider class="my-3" />
        <el-row>
          <el-col :span="4">
            <div class="table-dec-label">
              {{ $t('packages_business_rows') }}
            </div>
            <div class="table-dec-txt mt-2">{{ numOfRows || '-' }}</div>
          </el-col>
          <el-col :span="4">
            <div class="table-dec-label">
              {{ $t('packages_business_columns') }}
            </div>
            <div class="table-dec-txt mt-2">{{ tableFields.length }}</div>
          </el-col>
          <el-col :span="4">
            <div class="table-dec-label">
              {{ $t('packages_business_storage_size') }}
            </div>
            <div class="table-dec-txt mt-2">{{ storageSize || '-' }}</div>
          </el-col>
          <el-col :span="12">
            <div class="table-dec-label">{{ $t('public_connection') }}</div>
            <div
              v-if="detailData"
              class="table-dec-txt mt-2 flex align-center text-break"
            >
              <DatabaseIcon
                v-if="connection"
                class="mr-1 flex-shrink-0"
                :item="connection"
                :size="18"
              />
              <span class="min-w-0">{{ detailData.connectionName }}</span>
            </div>
          </el-col>
        </el-row>
        <ElDivider class="mt-3 mb-0" />
        <!--<div class="flex flex-wrap align-center row-gap-2 col-gap-8 mt-4">
        <span>
          <span class="table-dec-label">{{ $t('packages_business_rows') }}: </span>
          <span class="table-dec-txt">{{ numOfRows || '-' }}</span>
        </span>
        <span>
          <span class="table-dec-label">{{ $t('packages_business_columns') }}: </span>
          <span class="table-dec-txt">{{ tableFields.length }}</span>
        </span>
        <span>
          <span class="table-dec-label">{{ $t('packages_business_storage_size') }}: </span>
          <span class="table-dec-txt">{{ storageSize || '-' }}</span>
        </span>
        <span>
          <span class="table-dec-label">{{ $t('public_connection') }}: </span>
          <span class="table-dec-txt inline-flex align-center text-break" v-if="detailData">
            <DatabaseIcon v-if="connection" class="mr-1 flex-shrink-0" :item="connection" :size="18" />
            <span class="min-w-0">{{ detailData.connectionName }}</span>
          </span>
        </span>
        <span class="ellipsis">
          <span class="table-dec-label mb-4">{{ $t('packages_ldp_table_comment') }}：</span>
          <span class="table-dec-txt">{{ detailData.comment || '-' }}</span>
        </span>
      </div>-->

        <!--<div class="table-detail-list align-center">
        <span class="inline-flex align-center text-uppercase text-nowrap">
          <VIcon class="mr-1" size="18">table</VIcon> {{ $t('public_table') }}</span
        >
        <span class="inline-flex align-center">
          <VIcon class="mr-1" size="18">database</VIcon>
          <span class="text-nowrap">{{ databaseName }}</span></span
        >
        <template v-if="swimType !== 'source'">
          <span
            ><span class="table-dec-label">{{ $t('packages_business_last_data_change_time') }}: </span
            ><span class="table-dec-txt text-nowrap">{{ lastDataChangeTime || '-' }}</span></span
          >
          <span
            ><span class="table-dec-label">{{ $t('packages_business_cdc_delay_time') }}: </span
            ><span class="table-dec-txt text-nowrap">{{ cdcDelayTime || '-' }}</span></span
          >
        </template>

        <span>
          <span class="table-dec-label">
                    {{ $t('packages_business_rows') }}
                  : </span>
          <span class="table-dec-txt">{{ numOfRows || '-' }}</span>
        </span>
        <span>
          <span class="table-dec-label">
                    {{ $t('packages_business_columns') }}
                  : </span>
          <span class="table-dec-txt">{{ tableFields.length }}</span>
        </span>
        <span>
          <span class="table-dec-label">
                    {{ $t('packages_business_storage_size') }}
                  : </span>
          <span class="table-dec-txt">{{ storageSize || '-' }}</span>
        </span>
        <span>
          <span class="table-dec-label">
                    {{ $t('public_connection') }}
                  : </span>
          <span class="table-dec-txt inline-flex align-center text-break" v-if="detailData">
            <DatabaseIcon v-if="connection" class="mr-1 flex-shrink-0" :item="connection" :size="18" />
            <span class="min-w-0">{{ detailData.connectionName }}</span>
          </span>
        </span>
      </div>-->
      </header>
      <section class="flex-1 min-h-0 mt-1">
        <el-tabs
          v-model="activeName"
          class="h-100 table-preview-tabs tabs-fill"
        >
          <el-tab-pane
            :label="$t('packages_business_business_information')"
            name="overView"
          >
            <div v-loading="loading" class="pt-4">
              <section class="bg-white rounded-xl p-3 border border-gray-200">
                <!--<div class="flex align-center">
                <h3 class="fs-6">Table Summary</h3>
                <ElLink class="ml-auto" type="primary">
                  <VIcon>edit-outline</VIcon>
                  {{ $t('public_button_edit') }}
                </ElLink>
              </div>-->

                <!--<div class="mb-4">
                <span class="table-dec-label mb-4">{{ $t('packages_ldp_table_comment') }}：</span>
                <span class="font-color-sslight">{{ detailData.comment || '-' }}</span>
              </div>-->
                <div>
                  <div
                    class="flex align-center gap-2 px-1 mb-2"
                    style="--btn-space: 0"
                  >
                    <span
                      class="rounded-xl title-icon-wrap inline-flex align-center justify-center"
                    >
                      <VIcon class="color-primary" size="20"
                        >read-outlined</VIcon
                      >
                    </span>

                    <span class="font-color-dark fs-6 fw-sub">{{
                      $t('datadiscovery_previewdrawer_yewumiaoshu')
                    }}</span>
                    <div class="flex-grow-1" />
                    <el-button
                      v-if="!descIsEdit"
                      text
                      type="primary"
                      @click="descIsEdit = true"
                    >
                      <VIcon class="mr-1">edit-outline</VIcon>
                      {{ $t('public_button_edit') }}
                    </el-button>
                    <template v-else>
                      <el-button
                        text
                        type="primary"
                        @click="descIsEdit = false"
                      >
                        {{ $t('public_button_save') }}
                      </el-button>
                      <el-button
                        text
                        type="primary"
                        @click="descIsEdit = false"
                      >
                        {{ $t('public_button_cancel') }}
                      </el-button>
                    </template>
                  </div>
                  <VEmpty v-if="!detailData.description && !descIsEdit" small />
                  <template v-else>
                    <div
                      v-if="!descIsEdit"
                      class="text-prewrap px-1 py-2 lh-base overflow-x-auto"
                    >
                      {{ detailData.description }}
                    </div>
                    <el-input
                      v-else
                      v-model="detailData.description"
                      type="textarea"
                      row="4"
                      class="table-dec-txt"
                      :autosize="{ minRows: 2 }"
                      @blur="saveTableDesc"
                    />
                  </template>
                </div>
              </section>
              <section class="mt-4 bg-white overflow-hidden">
                <el-tabs
                  v-model="activeNameItems"
                  class="tabs-fill tabs-as-card"
                >
                  <el-tab-pane
                    :label="$t('packages_business_field_description')"
                    name="columnsPreview"
                  >
                    <VTable
                      class="discovery-page-table border rounded-xl mt-4"
                      :columns="columnsPreview"
                      :data="tableFields"
                      max-height="381px"
                      :has-pagination="false"
                    >
                      <template #empty>
                        <div>{{ $t('public_data_no_data') }}</div>
                      </template>
                      <template #businessDesc="scope">
                        <ElInput
                          v-model="scope.row.businessDesc"
                          @input="
                            handleChangeBusinessDesc(
                              arguments[0],
                              scope.row.id,
                              scope.row.name,
                            )
                          "
                        />
                      </template>
                    </VTable>
                  </el-tab-pane>
                  <el-tab-pane
                    :label="$t('packages_business_sample_data')"
                    name="sampleData"
                  >
                    <div
                      v-loading="loadingSampleData"
                      class="position-relative overflow-hidden mt-4 border rounded-xl"
                    >
                      <VEmpty v-if="!sampleHeader.length" />
                      <template v-else>
                        <IconButton
                          class="position-absolute toggle-sample-btn shadow-sm"
                          @click="toggleSampleData"
                          >{{ !isTableView ? 'table-grid' : 'code-json' }}
                        </IconButton>
                        <VCodeEditor
                          v-if="!isTableView"
                          class="py-0"
                          :height="360"
                          :value="sampleDataJson"
                          lang="json"
                          :options="{
                            readOnly: true,
                            highlightActiveLine: false,
                            highlightGutterLine: false,
                          }"
                          theme="chrome"
                        />
                        <el-table v-else :data="sampleData" max-height="360px">
                          <el-table-column type="index" label="#" />
                          <el-table-column
                            v-for="(item, index) in sampleHeader"
                            :key="index"
                            :prop="item.name"
                            :label="item.name"
                            min-width="200"
                          >
                            <template #header="{ column }">
                              <div class="text-wrap lh-1">
                                <span
                                  :title="column.label"
                                  class="leading-primary"
                                  >{{ column.label }}</span
                                >
                                <span
                                  class="inline-flex ml-1 leading-5 fw-normal fs-8 font-color-sslight"
                                  >{{ item.desc }}</span
                                >
                              </div>
                            </template>
                          </el-table-column>
                        </el-table>
                      </template>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </section>
            </div>

            <!--          <section class="mt-6">-->
            <!--            <div class="change-history mb-4">Change History</div>-->
            <!--            <ul>-->
            <!--              <li>-->
            <!--                <span>2023-02-03 12:21:34</span>-->
            <!--                <span class="ml-8">Lucy</span>-->
            <!--                <span class="ml-8">新增了标签603</span>-->
            <!--              </li>-->
            <!--              <li class="mt-2">-->
            <!--                <span>2023-02-03 12:21:34</span>-->
            <!--                <span class="ml-8">Lucy</span>-->
            <!--                <span class="ml-8">新增了标签603</span>-->
            <!--              </li>-->
            <!--            </ul>-->
            <!--          </section>-->
          </el-tab-pane>
          <el-tab-pane
            :label="$t('public_connection_form_schema')"
            name="schema"
            class="pt-4"
          >
            <VTable
              v-loading="loading"
              class="discovery-page-table border rounded-xl"
              :columns="columns"
              :data="tableFields"
              :has-pagination="false"
            >
              <template #empty>
                <div>{{ $t('public_data_no_data') }}</div>
              </template>
              <template #primaryKey="{ row }">
                <VIcon v-if="row.primaryKey" class="font-color-light"
                  >check</VIcon
                >
                <span v-else>-</span>
              </template>
              <template #foreignKey="{ row }">
                <VIcon v-if="row.foreignKey" class="font-color-light"
                  >check</VIcon
                >
                <span v-else>-</span>
              </template>
              <template #index="{ row }">
                <VIcon v-if="row.index" class="font-color-light">check</VIcon>
                <span v-else>-</span>
              </template>
              <template #notNull="{ row }">
                <VIcon v-if="row.notNull" class="font-color-light">check</VIcon>
                <span v-else>-</span>
              </template>
            </VTable>
          </el-tab-pane>
          <el-tab-pane :label="$t('packages_business_tasks')" name="tasks">
            <div class="overflow-hidden mt-4 border rounded-xl">
              <div class="flex align-center p-3">
                <ElRadioGroup v-model="asTaskType">
                  <ElRadioButton label="all">{{
                    $t('public_select_option_all')
                  }}</ElRadioButton>
                  <ElRadioButton label="source">{{
                    $t('packages_business_as_source')
                  }}</ElRadioButton>
                  <ElRadioButton label="target">{{
                    $t('packages_business_as_target')
                  }}</ElRadioButton>
                </ElRadioGroup>
                <!--<ElDivider class="mx-3" direction="vertical"></ElDivider>
                <span class="color-primary cursor-pointer" @click="handleCreateTask">{{
                  $t('packages_business_swimlane_tablepreview_chuangjianrenwu')
                }}</span>-->
              </div>
              <ElDivider class="my-0" />
              <el-table
                v-loading="loading || taskLoading"
                class="discovery-page-table"
                :data="filterTask"
                :has-pagination="false"
              >
                <el-table-column
                  :label="$t('public_task_name')"
                  prop="name"
                  width="200px"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <span class="dataflow-name link-primary flex">
                      <ElLink
                        role="ellipsis"
                        type="primary"
                        class="justify-content-start ellipsis block"
                        :class="['name', { 'has-children': row.hasChildren }]"
                        @click.stop="handleClickName(row)"
                        >{{ row.name }}</ElLink
                      >
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('public_task_type')"
                  :width="colWidth.status"
                >
                  <template #default="{ row }">
                    <span>
                      {{ getTaskType(row.type) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  :label="$t('public_task_status')"
                  :width="colWidth.status"
                >
                  <template #default="{ row }">
                    <TaskStatus :task="row" />
                  </template>
                </el-table-column>
                <el-table-column
                  sortable
                  prop="currentEventTimestamp"
                  :label="$t('public_task_cdc_time_point')"
                  min-width="164"
                >
                  <template #default="{ row }">
                    {{ formatTime(row.currentEventTimestamp) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="lastStartDate"
                  :label="$t('public_task_last_run_time')"
                  min-width="164"
                  sortable="custom"
                >
                  <template #default="{ row }">
                    {{ formatTime(row.lastStartDate) }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$t('public_operation')"
                  width="180"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <ElLink
                      v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
                      v-readonlybtn="'SYNC_job_operation'"
                      type="primary"
                      :disabled="row.btnDisabled.start"
                      @click="startTask([row.id])"
                    >
                      {{ $t('public_button_start') }}
                    </ElLink>
                    <template v-else>
                      <ElLink
                        v-if="row.status === 'stopping'"
                        v-readonlybtn="'SYNC_job_operation'"
                        type="primary"
                        :disabled="row.btnDisabled.forceStop"
                        @click="forceStopTask([row.id], row)"
                      >
                        {{ $t('public_button_force_stop') }}
                      </ElLink>
                      <ElLink
                        v-else
                        v-readonlybtn="'SYNC_job_operation'"
                        type="primary"
                        :disabled="row.btnDisabled.stop"
                        @click="stopTask([row.id], row)"
                      >
                        {{ $t('public_button_stop') }}
                      </ElLink>
                    </template>
                    <ElDivider
                      v-readonlybtn="'SYNC_job_edition'"
                      direction="vertical"
                    />
                    <ElLink
                      v-if="!row.btnDisabled.monitor || row.lastStartDate"
                      v-readonlybtn="'SYNC_job_operation'"
                      type="primary"
                      @click="openMonitor(row)"
                    >
                      {{ $t('packages_business_task_list_button_monitor') }}
                    </ElLink>
                    <ElLink
                      v-else-if="!row.btnDisabled.edit"
                      v-readonlybtn="'SYNC_job_operation'"
                      type="primary"
                      :disabled="row.btnDisabled.start"
                      @click="openEditor(row)"
                    >
                      {{ $t('public_button_edit') }}
                    </ElLink>
                    <ElDivider
                      v-readonlybtn="'SYNC_job_edition'"
                      direction="vertical"
                    />
                    <ElLink
                      v-readonlybtn="'SYNC_job_edition'"
                      type="danger"
                      :disabled="row.btnDisabled.delete"
                      @click="deleteTask([row.id], row)"
                    >
                      {{ $t('public_button_delete') }}
                    </ElLink>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <!--<el-tab-pane label="APIs" name="apis">
              <VTable
                v-if="activeName === 'apis'"
                ref="table"
                :columns="apisColumns"
                :remoteMethod="getApisData"
                class="mt-4"
              >
                <template #status="{ row }">
                  <span class="status-block" :class="'status-' + row.status">{{ row.statusFmt }}</span>
                </template>
              </VTable>
            </el-tab-pane>-->
          <el-tab-pane
            :label="$t('packages_ldp_lineage')"
            name="lineage"
            class="pt-4"
          >
            <TableLineage
              class="border rounded-xl overflow-hidden"
              :is-show="activeName === 'lineage'"
              :connection-id="connectionId"
              :table-name="selected.name"
              @click-task="handleClickName"
              @node-dblclick="open"
            />
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>
  </component>
</template>

<style scoped lang="scss">
.col-gap-8 {
  column-gap: 2rem;
}
.row-gap-2 {
  row-gap: 0.5rem;
}
.row-gap-4 {
  row-gap: 1rem;
}
.title-icon-wrap {
  width: 32px;
  height: 32px;
  background: rgba(244, 246, 253, 1);
}
.sw-table-drawer {
  :deep(.el-tabs__nav-wrap) {
    padding: 0 24px;
  }

  :deep(.tabs-as-card) {
    .el-tabs__item {
      height: 44px;
      line-height: 44px;
    }
  }

  :deep(.table-preview-tabs > .el-tabs__content > .el-tab-pane) {
    background-color: rgb(245, 248, 254);
  }

  :deep(th .cell) {
    white-space: nowrap;
  }

  .table-name {
    font-weight: 500;
    font-size: 20px;
    line-height: 26px;
    color: #1d2129;
  }

  .table-dec-label {
    font-weight: 400;
    color: #535f72;
  }

  .table-dec-txt {
    font-weight: 500;
    color: #1d2129;
  }

  .change-history {
    font-weight: 500;
    font-size: 18px;
    color: #1d2129;
  }

  .status {
    display: inline-block;
    min-width: 60px;
    padding: 3px 10px;
    text-align: center;
    font-weight: 500;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .status-draft {
    color: #c39700;
    background-color: #fdf1c8;
  }

  .status-normal {
    color: #008b58;
    background-color: #b4edd8;
  }

  .status-error {
    color: #d44d4d;
    background-color: #ffecec;
  }

  .toggle-sample-btn {
    top: 6px;
    right: 16px;
    z-index: 10;
    background-color: #fff;

    &:hover {
      background-color: rgb(239, 240, 241);
    }
  }

  .table-detail-list {
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-gap: 16px;
  }
}
</style>
