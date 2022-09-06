<template>
  <section class="data-flow-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :remoteMethod="getData"
      :classify="isDaas ? { authority: 'SYNC_category_management', types: ['dataflow'] } : null"
      :default-sort="{ prop: 'last_updated', order: 'descending' }"
      @selection-change="
        val => {
          multipleSelection = val
        }
      "
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)" />
      </template>
      <div class="buttons" slot="operation">
        <el-button
          v-if="isDaas"
          v-show="multipleSelection.length > 0"
          v-readonlybtn="'SYNC_category_application'"
          size="mini"
          class="btn message-button-cancel"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </el-button>
        <el-dropdown
          class="btn"
          @command="handleCommand($event)"
          v-show="multipleSelection.length > 0 && bulkOperation"
        >
          <el-button class="btn-dropdowm" size="mini">
            <i class="iconfont icon-piliang back-btn-icon"></i>
            <span> {{ $t('packages_business_dataFlow_taskBulkOperation') }}</span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="isDaas" command="export" v-readonlybtn="'SYNC_job_export'">{{
              $t('packages_business_dataFlow_bulkExport')
            }}</el-dropdown-item>
            <el-dropdown-item command="start" v-readonlybtn="'SYNC_job_operation'">{{
              $t('packages_business_dataFlow_bulkScheuled')
            }}</el-dropdown-item>
            <el-dropdown-item command="stop" v-readonlybtn="'SYNC_job_operation'">{{
              $t('packages_business_dataFlow_bulkStopping')
            }}</el-dropdown-item>
            <el-dropdown-item command="del" v-readonlybtn="'SYNC_job_delete'">{{
              $t('packages_business_dataFlow_batchDelete')
            }}</el-dropdown-item>
            <el-dropdown-item command="initialize" v-readonlybtn="'SYNC_job_operation'">{{
              $t('packages_business_dataFlow_batchRest')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-if="isDaas"
          v-readonlybtn="'SYNC_job_import'"
          size="mini"
          class="btn message-button-cancel"
          @click="handleImport"
        >
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('packages_business_button_bulk_import') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="create"
        >
          {{ $t('packages_business_button_create') }}
        </el-button>
      </div>
      <el-table-column
        reserve-selection
        type="selection"
        width="45"
        align="center"
        :selectable="row => !row.hasChildren && !$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
      >
      </el-table-column>

      <el-table-column min-width="380" :label="$t('packages_business_task_list_name')" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="dataflow-name link-primary">
            <ElLink
              type="primary"
              class="justify-content-start ellipsis block"
              :class="['name', { 'has-children': row.hasChildren }]"
              @click.stop="handleClickName(row)"
              >{{ row.name }}</ElLink
            >
            <el-tag v-if="row.listTagId !== undefined" class="tag" type="info" effect="dark" size="mini">
              {{ row.listTagValue }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('packages_business_task_list_task_type')" min-width="140">
        <template #default="{ row }">
          <span>
            {{ row.type ? syncType[row.type] : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('packages_business_task_list_status')" min-width="120">
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="$t('packages_business_column_create_time')" min-width="160" sortable="createTime">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('packages_business_column_operation')" width="280">
        <template #default="{ row }">
          <div class="table-operations" v-if="!row.hasChildren">
            <ElLink
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
            >
              {{ $t('packages_business_task_list_run') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_operation'" direction="vertical"></ElDivider>
            <ElLink
              v-if="row.status === 'stopping'"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.forceStop"
              @click="forceStop([row.id], row)"
            >
              {{ $t('packages_business_task_list_force_stop') }}
            </ElLink>
            <ElLink
              v-else
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.stop"
              @click="stop([row.id], row)"
              >{{ $t('packages_business_task_list_stop') }}</ElLink
            >
            <ElDivider v-readonlybtn="'SYNC_job_operation'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.edit"
              @click="handleEditor(row)"
            >
              {{ $t('packages_business_task_list_edit') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.monitor"
              @click="toDetail(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <el-dropdown v-show="moreAuthority" size="small" @command="handleCommand($event, row)">
              <ElLink type="primary" class="rotate-90">
                <i class="el-icon-more"></i>
              </ElLink>
              <el-dropdown-menu class="dataflow-table-more-dropdown-menu" slot="dropdown">
                <el-dropdown-item v-if="isDaas" command="export" v-readonlybtn="'SYNC_job_export'">{{
                  $t('packages_business_task_list_export')
                }}</el-dropdown-item>
                <el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'"
                  >{{ $t('packages_business_task_list_copy') }}
                </el-dropdown-item>

                <el-dropdown-item
                  :disabled="row.btnDisabled.reset"
                  command="initialize"
                  v-readonlybtn="'SYNC_job_operation'"
                >
                  {{ $t('packages_business_task_list_reset') }}
                </el-dropdown-item>
                <el-dropdown-item command="del" :disabled="row.btnDisabled.delete" v-readonlybtn="'SYNC_job_delete'">
                  {{ $t('packages_business_task_list_delete') }}
                </el-dropdown-item>
                <el-dropdown-item v-if="isDaas" command="setTag" v-readonlybtn="'SYNC_category_application'">
                  {{ $t('packages_business_dataFlow_addTag') }}
                </el-dropdown-item>
                <el-dropdown-item command="validate" v-readonlybtn="'Data_verify'">{{
                  $t('packages_business_dataVerify_dataVerify')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
    <Drawer class="task-drawer" :visible.sync="isShowDetails">
      <div class="task-drawer-wrap" v-loading="previewLoading">
        <header class="header mb-3">
          <div class="tab pb-3">
            <div class="img-box">
              <VIcon class="icon">text</VIcon>
            </div>
            <div class="content" v-if="previewData">
              <div class="name fs-6">
                <el-tooltip class="item" effect="dark" :content="previewData.name" placement="top-start">
                  <span> {{ previewData.name }}</span>
                </el-tooltip>
              </div>
              <div class="fs-8 mt-2 mb-2 desc">
                {{ $t('packages_business_task_details_desc') }}: <span>{{ previewData.desc }}</span>
              </div>
              <div class="status">
                <TaskStatus :task="previewData" />
              </div>
            </div>
          </div>
        </header>
        <ul class="info-list">
          <li v-for="item in previewList" :key="item.label">
            <template v-if="!!item.value">
              <VIcon class="icon mr-4" style="margin-top: 3px">{{ item.icon }}</VIcon>
              <div class="label-text">
                <div class="label font-color-light">{{ item.label }}:</div>
                <div class="value align-items-center align-middle font-color-dark">
                  {{ item.value }}
                </div>
              </div>
            </template>
          </li>
        </ul>
      </div>
    </Drawer>
    <!-- 导入 -->
    <Upload v-if="isDaas" :type="'dataflow'" ref="upload"></Upload>
  </section>
</template>

<script>
import dayjs from 'dayjs'

import { taskApi } from '@tap/api'
import { VIcon, FilterBar, Drawer } from '@tap/component'
import { toRegExp } from '@tap/shared'

import { makeStatusAndDisabled, STATUS_MAP } from '../../shared'
import { TablePage, TaskStatus } from '../../components'
import SkipError from './SkipError'
import Upload from '../../components/UploadDialog'

let timeout = null
export default {
  name: 'MigrateList',
  components: { VIcon, FilterBar, TablePage, SkipError, Drawer, Upload, TaskStatus },
  inject: ['checkAgent', 'buried'],
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      STATUS_MAP,
      previewData: null,
      previewList: [],
      data: {},
      name: '',
      status: '',
      isShowDetails: false,
      previewLoading: false,
      filterItems: [],
      restLoading: false,
      searchParams: {
        keyword: '',
        status: '',
        type: ''
      },
      order: 'last_updated DESC',
      progressOptions: [
        { label: this.$t('packages_business_select_option_all'), value: '' },
        {
          label: this.$t('packages_business_dataFlow_initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('packages_business_dataFlow_cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('packages_business_dataFlow_initial_sync') + this.$t('packages_business_dataFlow_cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      agentOptions: [],

      multipleSelection: [],

      taskSettingsDialog: false, //任务调度设置弹窗开关

      syncType: {
        initial_sync: this.$t('packages_business_dataFlow_initial_sync'),
        cdc: this.$t('packages_business_dataFlow_cdc'),
        'initial_sync+cdc': this.$t('packages_business_dataFlow_initial_sync') + '+' + this.$t('packages_business_dataFlow_cdc')
      },
      statusTransformMap: {
        running: this.$t('packages_business_task_list_transform_running'),
        done: this.$t('packages_business_task_list_transform_done'),
        error: this.$t('packages_business_task_list_transform_error')
      },
      dataFlowId: '',
      formSchedule: {
        id: '',
        name: '',
        isSchedule: false,
        cronExpression: '',
        taskData: null
      },
      moreAuthority:
        this.$has('Data_verify') ||
        this.$has('SYNC_job_export') ||
        this.$has('SYNC_job_creation') ||
        this.$has('SYNC_job_operation') ||
        this.$has('SYNC_category_application'),
      bulkOperation: this.$has('SYNC_job_export') || this.$has('SYNC_job_operation') || this.$has('SYNC_job_delete'),
      timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week', 'year']
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },

    statusOptions() {
      const options = Object.entries(this.STATUS_MAP).map(([status, item]) => {
        return {
          label: this.$t(item.i18n),
          value: item.in ? item.in.join(',') : status
        }
      })
      options.unshift({ label: this.$t('packages_business_task_list_status_all'), value: '' })
      return options
    }
  },
  watch: {
    '$route.query'() {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    }
  },
  created() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.getFilterItems()
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },
  beforeDestroy() {
    clearInterval(timeout)
  },
  methods: {
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    getData({ page, tags }) {
      let { current, size } = page
      let { keyword, status, type } = this.searchParams
      let fields = {
        id: true,
        name: true,
        status: true,
        last_updated: true,
        createTime: true,
        user_id: true,
        startTime: true,
        agentId: true,
        statuses: true,
        type: true,
        desc: true
      }
      let where = {
        syncType: 'migrate'
      }
      if (keyword && keyword.trim()) {
        where.name = { like: toRegExp(keyword), options: 'i' }
      }
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      type && (where['type'] = type)
      if (status) {
        if (status.includes(',')) {
          where.status = {
            $in: status.split(',')
          }
        } else {
          where.status = status
        }
      }
      let filter = {
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return taskApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(makeStatusAndDisabled)

          // 有选中行，列表刷新后无法更新行数据，比如状态
          if (this.multipleSelection.length && list.length) {
            let tempMap = list.reduce((map, item) => {
              map[item.id] = {
                status: item.status,
                btnDisabled: item.btnDisabled
              }
              return map
            }, {})
            this.multipleSelection.forEach(item => {
              const temp = tempMap[item.id]
              if (temp) {
                Object.assign(item, temp)
              }
            })
          }

          return {
            total: data.total,
            data: list
          }
        })
    },
    create() {
      this.buried('migrationCreate')
      this.checkAgent(() => {
        this.$router
          .push({
            name: 'MigrateCreate'
          })
          .catch(() => {
            this.buried('migrationCreateAgentFail')
          })
      })
    },
    handleEditor({ id }) {
      this.$router.push({
        name: 'MigrateEditor',
        params: {
          id
        }
      })
    },
    handleImport() {
      this.$refs.upload.show()
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
    handleCommand(command, node) {
      let commandFilter = ['start', 'stop', 'del']
      let ids = []
      let taskList = []
      if (node) {
        taskList = [node]
      } else {
        taskList = this.multipleSelection
      }
      let canList = []
      let canNotList = []
      if (commandFilter.includes(command)) {
        let op = command === 'del' ? 'delete' : command
        taskList.forEach(task => {
          if (task.btnDisabled?.[op]) {
            canNotList.push(task)
          } else {
            canList.push(task)
          }
        })
      } else {
        canList = taskList
      }

      if (canNotList.length) {
        const msg = canNotList.length !== taskList.length ? `部分任务不支持该操作` : `所选任务不支持该操作`
        this.$message.warning(msg)
      }

      if (!canList.length) return
      ids = canList.map(item => item.id)
      this[command](ids, node)
    },
    export(ids) {
      taskApi.export(ids)
    },
    async start(ids) {
      this.buried('migrationStart')
      let id = ids[0]
      let filter = {
        fields: {
          id: true,
          errorEvents: true
        },
        where: {
          id: {
            inq: ids
          }
        }
      }
      try {
        let data = await taskApi.get({ filter: JSON.stringify(filter) })
        let flag = false
        let items = data?.items || []
        if (items.length) {
          items.forEach(item => {
            if (item?.errorEvents?.length) {
              flag = true
            }
          })
        }
        let result = await taskApi.batchStart(ids)
        this.buried('migrationStart', '', { result: true })
        this.$message.success(result?.message || this.$t('packages_business_message_operation_succuess'), false)
        this.table.fetch()
        if (flag) {
          this.$refs.errorHandler.checkError({ id, status: 'error' }, () => {})
        }
      } catch (error) {
        this.buried('migrationStart', '', { result: false })
      }
    },
    stop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      let message = msgObj.msg
      this.$confirm(message, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('packages_business_message_operation_succuess'), false)
          this.table.fetch()
        })
      })
    },
    forceStop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('force_stop', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('packages_business_message_operation_succuess'), false)
          this.table.fetch()
        })
      })
    },
    del(ids, item = {}) {
      let msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchDelete(ids).then(data => {
          this.table.fetch()
          this.responseHandler(data, this.$t('packages_business_message_deleteOK'))
        })
      })
    },
    initialize(ids, item = {}) {
      let msgObj = this.getConfirmMessage('initialize', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.restLoading = true
        taskApi
          .batchRenew(ids)
          .then(data => {
            this.table.fetch()
            this.responseHandler(data, this.$t('packages_business_message_resetOk'))
          })
          .finally(() => {
            this.restLoading = false
          })
      })
    },
    validate(ids, node) {
      this.$router.push({
        name: 'dataVerification',
        query: { name: node.name, id: node.id }
      })
    },
    copy(ids, node) {
      taskApi.copy(node.id).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('packages_business_message_copySuccess'))
      })
    },
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listTagId) {
          tagList[row.listTagId] = {
            value: row.listTagValue
          }
        }
      })
      return tagList
    },
    handleOperationClassify(listtags) {
      let ids = []
      if (this.dataFlowId) {
        ids = [this.dataFlowId]
      } else {
        ids = this.multipleSelection.map(r => r.id)
      }
      let attributes = {
        id: ids,
        listtags
      }
      taskApi.batchUpdateListtags(attributes).then(() => {
        this.dataFlowId = ''
        this.table.fetch()
      })
    },
    setTag(ids, node) {
      this.dataFlowId = node.id
      this.$refs.table.showClassify(node.listTags || [])
    },
    changeStatus(ids, { status, errorEvents }) {
      let where = {
        _id: {
          in: ids
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      taskApi.update(where, attributes).then(data => {
        this.table.fetch()
        this.responseHandler(data, this.$t('packages_business_message_operation_succuess'))
      })
    },
    skipHandler(id, errorEvents) {
      this.changeStatus([id], { status: 'scheduled', errorEvents })
    },
    handleSortTable({ order, prop }) {
      if (prop === 'lag') {
        prop = 'stats.replicationLag'
      }
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    responseHandler(data, msg) {
      let failList = data?.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('packages_business_dataFlow_multiError_notFound'),
          6: this.$t('packages_business_dataFlow_multiError_statusError'),
          7: this.$t('packages_business_dataFlow_multiError_otherError'),
          8: this.$t('packages_business_dataFlow_multiError_statusError')
        }
        let nameMapping = {}
        this.table.list.forEach(item => {
          nameMapping[item.id] = item.name
        })
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span class="link-primary">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg, false)
      }
    },
    // 任务调度设置保存
    saveTaskSetting() {
      let data = this.formSchedule.taskData.setting || {}
      data.isSchedule = this.formSchedule.isSchedule
      data.cronExpression = this.formSchedule.cronExpression
      taskApi
        .patchId(this.formSchedule.id, { setting: data })
        .then(() => {
          this.$message.success(this.$t('packages_business_message_save_ok'))
        })
        // .catch(() => {
        //   this.$message.error(this.$t('packages_business_message_save_fail'))
        // })
        .finally(() => {
          this.taskSettingsDialog = false
        })
    },
    handleGoFunction() {
      this.$router.push({
        name: 'function'
      })
    },
    toDetail({ id }) {
      this.$router.push({
        name: 'MigrationMonitor',
        params: {
          id
        }
      })
    },
    handlePreview(id) {
      this.isShowDetails = true
      this.getPreviewData(id)
    },
    async getPreviewData(id) {
      this.previewLoading = true
      taskApi
        .findTaskDetailById([id])
        .then((data = {}) => {
          let previewList = []
          let map = {
            title: { label: this.$t('packages_business_task_preview_title'), icon: 'title' },
            createUser: { label: this.$t('packages_business_task_preview_createUser'), icon: 'createUser' },
            sync_type: { label: this.$t('packages_business_task_preview_sync_type'), icon: 'sync_type' },
            type: { label: this.$t('packages_business_task_preview_type'), icon: 'type', format: val => this.syncType[val] },
            id: { label: this.$t('packages_business_task_preview_id'), icon: 'id' },
            createAt: { label: this.$t('packages_business_task_preview_createAt'), icon: 'createAt', format: this.formatTime },
            createTime: { label: this.$t('packages_business_task_preview_createTime'), icon: 'createTime' },
            startTime: { label: this.$t('packages_business_task_preview_startTime'), icon: 'startTime', format: this.formatTime },
            initStartTime: {
              label: this.$t('packages_business_task_preview_initStartTime'),
              icon: 'initStartTime',
              format: this.formatTime
            },
            cdcStartTime: {
              label: this.$t('packages_business_task_preview_cdcStartTime'),
              icon: 'cdcStartTime',
              format: this.formatTime
            },
            taskFinishTime: {
              label: this.$t('packages_business_task_preview_taskFinishTime'),
              icon: 'taskFinishTime',
              format: this.formatTime
            },
            taskLastHour: {
              label: this.$t('packages_business_task_preview_taskLastHour'),
              icon: 'taskLastHour',
              format: this.handleTimeConvert
            },
            eventTime: { label: this.$t('packages_business_task_preview_eventTime'), icon: 'eventTime', format: this.formatTime },
            cdcDelayTime: {
              label: this.$t('packages_business_task_preview_cdcDelayTime'),
              icon: 'cdcDelayTime',
              format: this.handleTimeConvert
            },
            failCount: { label: this.$t('packages_business_task_preview_failCount'), icon: 'failCount' }
          }
          this.previewData = makeStatusAndDisabled(data)
          for (let key in data) {
            let opt = map[key]
            let val = data[key]
            if (opt) {
              if (opt.format) {
                val = opt.format(val)
              }
              previewList.push({
                label: opt.label,
                value: val || val === 0 ? val : '-',
                icon: opt.icon
              })
            }
          }

          this.previewList = previewList
        })
        .finally(() => {
          this.previewLoading = false
        })
    },

    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_task_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('packages_business_task_list_sync_type'),
          key: 'type',
          type: 'select-inner',
          items: this.progressOptions
        },
        {
          placeholder: this.$t('packages_business_task_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    // 毫秒转时间
    handleTimeConvert(time) {
      let r = ''
      if (time) {
        let s = time,
          m = 0,
          h = 0,
          d = 0
        if (s > 60) {
          m = parseInt(s / 60)
          s = parseInt(s % 60)
          if (m > 60) {
            h = parseInt(m / 60)
            m = parseInt(m % 60)
            if (h > 24) {
              d = parseInt(h / 24)
              h = parseInt(h % 24)
            }
          }
        }
        if (m === 0 && h === 0 && d === 0 && s < 60 && s > 0) {
          r = 1 + this.$t('packages_business_task_info_m')
        }
        // r = parseInt(s) + this.$t('packages_business_timeToLive_s')
        if (m > 0) {
          r = parseInt(m) + this.$t('packages_business_task_info_m')
        }
        if (h > 0) {
          r = parseInt(h) + this.$t('packages_business_task_info_h') + r
        }
        if (d > 0) {
          r = parseInt(d) + this.$t('packages_business_task_info_d') + r
        }
      }
      return r
    },

    /**
     * 点击名称调整
     * @param row
     */
    handleClickName(row) {
      if (row.btnDisabled.edit) {
        this.toDetail(row)
      } else {
        this.handleEditor(row)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-flow-wrap {
  height: 100%;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .data-flow-list {
    .search-bar {
      display: flex;
      flex-wrap: wrap;
      li {
        margin-right: 10px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .buttons {
      white-space: nowrap;
      .btn + .btn {
        margin-left: 12px;
      }
      .btn {
        // height: 28px;
        i.iconfont {
          font-size: 12px;
        }
        &.btn-dropdowm {
          margin-left: 12px;
        }
        &.btn-create {
          margin-left: 12px;
        }
        &.btn-createText {
          margin-left: 12px;
        }
      }
    }
    .dataflow-name {
      .tag {
        margin-left: 5px;
        color: map-get($fontColor, slight);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .name {
        &:not(.has-children) {
          // color: map-get($color, primary);
          cursor: pointer;
          // text-decoration: underline;
        }
      }
    }
    .table-operations {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .el-table {
      ::v-deep {
        .el-table__cell {
          padding: 10px 0;
        }
      }
    }
  }
}
.dataflow-table-more-dropdown-menu .btn-delete {
  color: map-get($color, danger);
  &.is-disabled {
    color: map-get($fontColor, slight);
  }
}
.task-drawer {
  padding: 16px;
  .task-drawer-wrap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
  .header {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #eee;
  }
  .test-progress {
    width: 94.5%;
    margin: 0 10px 10px 30px;
  }
  .tab {
    display: flex;
    justify-content: flex-start;
    .img-box {
      display: flex;
      width: 20px;
      justify-content: center;
      align-items: flex-start;
      background-color: map-get($bgColor, white);
      //border: 1px solid #dedee4;
      border-radius: 3px;
      margin: 5px 0 0 0;
      img {
        width: 20px;
      }
    }
    .content {
      margin-left: 10px;
      margin-top: 4px;
      width: 100%;
      overflow: hidden;
      .name {
        color: map-get($fontColor, dark);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .desc {
        color: map-get($fontColor, normal);
        span {
          color: map-get($fontColor, light);
        }
      }
    }
    .status {
      padding-top: 5px;
      font-size: 12px;
      border-top-width: 2px;
      .error {
        color: #f56c6c;
      }
      .success {
        color: #67c23a;
      }
      .warning {
        color: #e6a23c;
      }
    }
  }
  .label-img {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 15px;
    margin-top: 2px;
  }

  .schema-load {
    color: map-get($fontColor, slight);
    display: inline-block;
    margin-left: 20px;
    font-size: 12px;
    font-weight: normal;
  }
  .info-list {
    flex: 1;
    overflow-y: auto;
    max-height: 690px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    li {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-bottom: 10px;
      .label-text {
        width: 100%;
        margin-right: 16px;
        padding-bottom: 10px;
        border-bottom: 1px solid map-get($borderColor, light);
        .label {
          width: 100%;
          text-align: left;
          font-size: 12px;
        }
        .value {
          display: inline-block;
          width: 100%;
          padding-top: 5px;
          font-size: 12px;
          word-break: break-all;
        }
      }
    }
  }
  .bar {
    display: block;
    width: 100%;
    height: 30px;
    background: map-get($bgColor, main);
    border-bottom: 1px solid #dedee4;
  }
  .back-btn-icon-box {
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    line-height: 1;
    font-weight: normal;
    font-size: 14px;
    color: red;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    outline: 0;
    border: 0;
    border-radius: 0;
    box-sizing: border-box;
    background: map-get($color, primary);
    transition: 0.1s;
    -webkit-appearance: none;
    -webkit-box-sizing: border-box;
    -webkit-transition: 0.1s;
  }
  .back-btn-icon-box:hover {
    background: #6dc5e8;
  }
  .back-btn-icon {
    color: map-get($fontColor, white);
  }
  .back-btn-text {
    padding-left: 10px;
    font-size: 12px;
  }
}
</style>
<style lang="scss">
.data-flow-wrap .data-flow-list .dataflow-table__icon {
  margin-left: -5px;
  font-size: 14px;
  width: 26px;
  text-align: center;
}
.jobSeceduleDialog {
  .text {
    padding-left: 100px;
    line-height: 28px;
    color: map-get($fontColor, slight);
    ul {
      display: flex;
      flex-direction: row;
      text-align: center;
      li {
        padding-right: 20px;
      }
    }
  }
  .box {
    padding-left: 0;
  }
}
</style>
