<template>
  <section class="data-flow-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :classify="{ authority: 'SYNC_category_management', types: ['dataflow'] }"
      :remoteMethod="getData"
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
          v-readonlybtn="'SYNC_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('packages_business_dataFlow_taskBulkTag') }}</span>
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
              $t('dataFlow.packages_business_dataFlow_bulkExport')
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
        <el-button v-if="isDaas" v-readonlybtn="'SYNC_job_import'" size="mini" class="btn" @click="handleImport">
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

      <el-table-column min-width="400" :label="$t('packages_business_task_list_name')" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="dataflow-name link-primary flex">
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
      <el-table-column prop="status" :label="$t('packages_business_task_list_status')" min-width="110">
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        :label="$t('packages_business_column_create_time')"
        min-width="160"
        sortable="custom"
      >
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('packages_business_column_operation')" width="240">
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
              {{ $t('packages_business_button_edit') }}
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
                <el-dropdown-item command="toView">{{ $t('packages_business_dataFlow_view') }}</el-dropdown-item>
                <el-dropdown-item v-if="isDaas" v-readonlybtn="'SYNC_job_export'" command="export">{{
                  $t('packages_business_dataFlow_dataFlowExport')
                }}</el-dropdown-item>
                <el-dropdown-item v-readonlybtn="'SYNC_job_creation'" command="copy"
                  >{{ $t('packages_business_dataFlow_copy') }}
                </el-dropdown-item>

                <el-dropdown-item
                  v-readonlybtn="'SYNC_job_operation'"
                  command="initialize"
                  :disabled="row.btnDisabled.reset"
                >
                  {{ $t('packages_business_dataFlow_button_reset') }}
                </el-dropdown-item>
                <el-dropdown-item v-readonlybtn="'SYNC_job_delete'" command="del" :disabled="row.btnDisabled.delete">
                  {{ $t('packages_business_button_delete') }}
                </el-dropdown-item>
                <!-- <el-dropdown-item v-readonlybtn="'SYNC_category_application'" command="setTag">
                  {{ $t('packages_business_dataFlow_addTag') }}
                </el-dropdown-item> -->
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
    <!-- 导入 -->
    <Upload v-if="isDaas" :type="'dataflow'" ref="upload"></Upload>
  </section>
</template>

<script>
import dayjs from 'dayjs'

import { taskApi } from '@tap/api'
import { VIcon, FilterBar } from '@tap/component'
import { toRegExp } from '@tap/shared'

import SkipError from './SkipError'
import Upload from '../../components/UploadDialog.vue'
import { TablePage, TaskStatus } from '../../components'
import { makeStatusAndDisabled, STATUS_MAP } from '../../shared'

let timeout = null
export default {
  name: 'TaskList',
  components: { VIcon, FilterBar, TablePage, SkipError, Upload, TaskStatus },
  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      STATUS_MAP,
      proportionData: [],
      isShowDetails: false,
      previewLoading: false,
      previewData: null,
      previewList: [],
      filterItems: [],
      restLoading: false,
      searchParams: {
        keyword: '',
        status: '',
        type: ''
      },
      order: 'last_updated DESC',
      typeOptions: [
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

      syncType: {
        initial_sync: this.$t('packages_business_task_info_initial_sync'),
        cdc: this.$t('packages_business_task_info_initial_cdc'),
        'initial_sync+cdc':
          this.$t('packages_business_task_info_initial_sync') + '+' + this.$t('packages_business_task_info_initial_cdc')
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
    reset() {
      this.searchParams = {
        keyword: '',
        status: '',
        type: ''
      }

      this.multipleSelection = []
      this.table.fetch(1)
    },
    getData({ page, tags }) {
      let { current, size } = page
      let { keyword, status, type } = this.searchParams

      let where = {}
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
        desc: true,
        listtags: true
      }
      if (keyword && keyword.trim()) {
        where.name = { like: toRegExp(keyword), options: 'i' }
      }
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      if (status) {
        if (status.includes(',')) {
          where.status = {
            $in: status.split(',')
          }
        } else {
          where.status = status
        }
      }
      where['syncType'] = 'sync' //过滤当前是数据开发
      type && (where['type'] = type)
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
      this.$router.push({
        name: 'DataflowNew'
      })
    },
    handleEditor({ id }) {
      this.$router.push({
        name: 'DataflowEditor',
        params: { id: id }
      })
      /*const h = this.$createElement
      this.$confirm(
        h('p', null, [
          h('span', null, this.$t('packages_business_dataFlow_modifyEditText')),
          h('span', { style: 'color: #2C65FF' }, this.$t('packages_business_dataFlow_nodeLayoutProcess')),
          h('span', null, '、'),
          h('span', { style: 'color: #2C65FF' }, this.$t('packages_business_dataFlow_nodeAttributes')),
          h('span', null, '、'),
          h('span', { style: 'color: #2C65FF' }, this.$t('packages_business_dataFlow_matchingRelationship')),
          h('span', null, '，'),
          h('span', null, this.$t('packages_business_dataFlow_afterSubmission')),
          h('span', { style: 'color: #2C65FF' }, this.$t('packages_business_dataFlow_reset')),
          h('span', null, this.$t('packages_business_dataFlow_runNomally')),
          h('span', null, this.$t('packages_business_dataFlow_editLayerTip'))
        ]),
        this.$t('packages_business_dataFlow_importantReminder'),
        {
          customClass: 'dataflow-clickTip',
          confirmButtonText: this.$t('packages_business_dataFlow_continueEditing'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.push({
          name: 'DataflowEditor',
          params: { id: id }
        })
      })
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)*/
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
    toView([id]) {
      window.open(
        this.$router.resolve({
          name: 'DataflowViewer',
          params: {
            id
          }
        }).href,
        'viewer_' + id
      )
    },
    export(ids) {
      taskApi.export(ids)
    },
    start(ids) {
      let _this = this
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

      taskApi.get({ filter: JSON.stringify(filter) }).then(data => {
        let flag = false
        let items = data?.items || []
        if (items.length) {
          items.forEach(item => {
            if (item?.errorEvents?.length) {
              flag = true
            }
          })
        }
        taskApi.batchStart(ids).then(data => {
          this.$message.success(data?.message || this.$t('packages_business_message_operation_succuess'), false)
          this.table.fetch()
        })
        if (flag) {
          _this.$refs.errorHandler.checkError({ id, status: 'error' }, () => {})
        }
      })
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
        type: 'warning'
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
    copy(ids, node) {
      taskApi.copy(node.id).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('packages_business_message_copySuccess'))
      })
    },
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value
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
      let failList = data.fail || []
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
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg, false)
      }
    },
    handleGoFunction() {
      this.$router.push({
        name: 'function'
      })
    },
    toDetail({ id }) {
      this.$router.push({
        name: 'TaskMonitor',
        params: {
          id
        }
      })
    },
    isShowForceStop(data) {
      return data?.length && data.every(t => ['stopping'].includes(t.status))
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
          this.previewData = makeStatusAndDisabled(data)
          for (let item in data) {
            if (['type'].includes(item)) {
              data[item] = this.syncType[data[item]]
            }

            if (['cdcDelayTime', 'taskLastHour'].includes(item)) {
              data[item] = this.handleTimeConvert(data[item])
            }
            if (
              [
                'createAt',
                'startTime',
                'initStartTime',
                'cdcStartTime',
                'initStartTime',
                'taskFinishTime',
                'eventTime'
              ].includes(item)
            ) {
              data[item] = this.formatTime(data[item])
            }

            if (
              ![
                'customId',
                'lastUpdAt',
                'userId',
                'lastUpdBy',
                'lastUpdBy',
                'status',
                'desc',
                'name',
                'btnDisabled'
              ].includes(item)
            ) {
              previewList.push({ label: item, value: data[item] || '-' })
            }
          }

          this.previewList = previewList
        })
        .finally(() => {
          this.previewLoading = false
        })
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
          items: this.typeOptions
        },
        {
          placeholder: this.$t('packages_business_task_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
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
        margin-left: 5px;
      }
      .btn {
        i.iconfont {
          font-size: 12px;
        }
        &.btn-dropdowm {
          margin-left: 5px;
        }
        &.btn-create {
          margin-left: 10px;
        }
        &.btn-createText {
          margin-left: 5px;
        }
      }
    }
    .dataflow-name {
      .tag {
        margin-left: 5px;
        color: map-get($fontColor, light);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .name {
        &:not(.has-children) {
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
</style>
