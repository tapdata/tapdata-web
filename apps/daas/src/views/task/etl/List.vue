<template>
  <section class="data-flow-wrap classify-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :classify="{ authority: 'SYNC_category_management', types: ['dataflow'] }"
      :remoteMethod="getData"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
      @selection-change="
        val => {
          multipleSelection = val
        }
      "
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
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
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </el-button>
        <el-dropdown
          class="btn"
          @command="handleCommand($event)"
          v-show="multipleSelection.length > 0 && bulkOperation"
        >
          <el-button class="btn-dropdowm" size="mini">
            <i class="iconfont icon-piliang back-btn-icon"></i>
            <span> {{ $t('dataFlow.taskBulkOperation') }}</span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
              $t('dataFlow.bulkExport')
            }}</el-dropdown-item>
            <el-dropdown-item command="start" v-readonlybtn="'SYNC_job_operation'">{{
              $t('dataFlow.bulkScheuled')
            }}</el-dropdown-item>
            <el-dropdown-item command="stop" v-readonlybtn="'SYNC_job_operation'">{{
              $t('dataFlow.bulkStopping')
            }}</el-dropdown-item>
            <el-dropdown-item command="del" v-readonlybtn="'SYNC_job_delete'">{{
              $t('dataFlow.batchDelete')
            }}</el-dropdown-item>
            <el-dropdown-item command="initialize" v-readonlybtn="'SYNC_job_operation'">{{
              $t('dataFlow.batchRest')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-readonlybtn="'SYNC_job_import'" size="mini" class="btn" @click="handleImport">
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('button_bulk_import') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="create"
        >
          {{ $t('button_create') }}
        </el-button>
      </div>

      <el-table-column
        reserve-selection
        type="selection"
        width="45"
        :selectable="row => !row.hasChildren && !$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
      >
      </el-table-column>

      <el-table-column min-width="400" :label="$t('task_list_name')" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="dataflow-name link-primary flex">
            <ElLink
              type="primary"
              class="justify-content-start ellipsis block"
              :class="['name', { 'has-children': row.hasChildren }]"
              @click.stop="handlePreview(row)"
              >{{ row.name }}</ElLink
            >
            <el-tag v-if="row.listTagId !== undefined" class="tag" type="info" effect="dark" size="mini">
              {{ row.listTagValue }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('task_list_task_type')" min-width="140">
        <template #default="{ row }">
          <span>
            {{ row.type ? syncType[row.type] : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('task_list_status')" min-width="110">
        <template #default="{ row }">
          <span :class="['status-' + row.status, 'status-block', 'mr-2']">
            {{ $t('task_preview_status_' + row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="$t('column_create_time')" min-width="160" sortable="custom">
        <template #default="{ row }">
          {{ formatTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="280">
        <template #default="{ row }">
          <div class="table-operations" v-if="!row.hasChildren">
            <ElLink
              v-readonlybtn="'SYNC_job_operation'"
              :disabled="row.disabledData.start"
              type="primary"
              @click="start([row.id])"
            >
              {{ $t('task_list_run') }}
            </ElLink>
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_operation'"></ElDivider>
            <ElLink
              v-if="isShowForceStop(row.statuses)"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
              @click="forceStop([row.id])"
            >
              {{ $t('task_list_force_stop') }}
            </ElLink>
            <ElLink
              v-else
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.disabledData.stop"
              @click="stop([row.id], row)"
              >{{ $t('task_list_stop') }}</ElLink
            >
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_operation'"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.disabledData.edit"
              @click="handleEditor(row.id)"
            >
              {{ $t('button_edit') }}
            </ElLink>
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_edition'"></ElDivider>
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="toDetail(row)">
              {{ $t('task_list_button_monitor') }}
            </ElLink>
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_edition'"></ElDivider>
            <el-dropdown v-show="moreAuthority" size="small" @command="handleCommand($event, row)">
              <ElLink type="primary" class="rotate-90">
                <i class="el-icon-more"></i>
              </ElLink>
              <el-dropdown-menu class="dataflow-table-more-dropdown-menu" slot="dropdown">
                <el-dropdown-item command="toView">{{ $t('dataFlow.view') }}</el-dropdown-item>
                <el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
                  $t('dataFlow.dataFlowExport')
                }}</el-dropdown-item>
                <el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'"
                  >{{ $t('dataFlow.copy') }}
                </el-dropdown-item>

                <el-dropdown-item
                  :disabled="row.disabledData.reset"
                  command="initialize"
                  v-readonlybtn="'SYNC_job_operation'"
                >
                  {{ $t('dataFlow.button.reset') }}
                </el-dropdown-item>
                <el-dropdown-item command="del" :disabled="row.disabledData.delete" v-readonlybtn="'SYNC_job_delete'">
                  {{ $t('button.delete') }}
                </el-dropdown-item>
                <el-dropdown-item command="setTag" v-readonlybtn="'SYNC_category_application'">
                  {{ $t('dataFlow.addTag') }}
                </el-dropdown-item>
                <el-dropdown-item command="validate" v-readonlybtn="'Data_verify'">{{
                  $t('dataVerify.dataVerify')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <el-dialog
      :title="$t('dialog.jobSchedule.jobSecheduleSetting')"
      :close-on-click-modal="false"
      :visible.sync="taskSettingsDialog"
      custom-class="jobSeceduleDialog"
      width="50%"
    >
      <el-form :model="formSchedule" label-width="100px">
        <el-form-item :label="$t('dialog.jobSchedule.job')">
          <div>{{ formSchedule.name }}</div>
        </el-form-item>
        <el-form-item :label="$t('dialog.jobSchedule.sync')">
          <el-switch v-model="formSchedule.isSchedule"> </el-switch>
        </el-form-item>
        <el-form-item :label="$t('dialog.jobSchedule.expression')" v-if="formSchedule.isSchedule">
          <el-input v-model="formSchedule.cronExpression" :placeholder="$t('dialog.jobSchedule.expressionPlaceholder')">
          </el-input>
        </el-form-item>
      </el-form>
      <div v-if="formSchedule.isSchedule" class="text">
        <p>{{ $t('dialog.jobSchedule.explanation') }}</p>
        <p>{{ $t('dialog.jobSchedule.grammar') }}</p>
        <ul>
          <li v-for="item in timeTextArr" :key="item">
            <p>{{ $t('dialog.jobSchedule.' + item) }}</p>
            <span>*</span>
          </li>
        </ul>
        <p>{{ $t('dialog.jobSchedule.example') }}</p>
        <p>0 */1 * * * ? * // {{ $t('dialog.jobSchedule.runMinute') }}</p>
        <p>0 0 2 * * ? * // {{ $t('dialog.jobSchedule.runDay') }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="taskSettingsDialog = false">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="saveTaskSetting">{{ $t('app.save') }}</el-button>
      </span>
    </el-dialog>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
    <Drawer class="task-drawer" :visible.sync="isShowDetails">
      <div class="task-drawer-wrap" v-loading="previewLoading">
        <header class="header mb-3">
          <div class="tab pb-3">
            <div class="img-box">
              <VIcon class="icon">text</VIcon>
              <!-- <img src="../../../assets/images/migrate/headImage.png" /> -->
            </div>
            <div class="content" v-if="previewData">
              <div class="name fs-6">
                <el-tooltip class="item" effect="dark" :content="previewData.name" placement="top-start">
                  <span> {{ previewData.name }}</span>
                </el-tooltip>
              </div>
              <div class="fs-8 mt-2 mb-2 desc">
                {{ $t('task_details_desc') }}: <span>{{ previewData.desc }}</span>
              </div>
              <div class="status bg-main rounded-1 py-3 px-2">
                <span class="mr-2" v-for="item in previewData.statusResult" :key="item.status">
                  <span class="din-font fs-6 font-color-light">{{ item.count }}</span>
                  <span class="pl-1 fs-8 font-color-slight">{{ item.text }} </span>
                </span>
                <div class="proportion">
                  <span
                    v-for="item in proportionData"
                    :key="item.label"
                    :style="{ background: item.color, width: item.value + '%' }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <ul class="info-list">
          <li v-for="item in previewList" :key="item.label">
            <template v-if="!!item.value">
              <VIcon class="icon mr-4">{{ item.label }}</VIcon>
              <div class="label-text">
                <div class="label">{{ $t('task_preview_' + item.label) }}:</div>
                <div
                  class="value align-items-center align-middle"
                  :class="{ 'align-top': item.value && item.value.length > 15 }"
                >
                  <span v-if="item.label === 'type'"> {{ syncType[item.value] }} </span>
                  <span v-else>{{ item.value }}</span>
                </div>
              </div>
            </template>
          </li>
        </ul>
      </div>
    </Drawer>
    <!-- 导入 -->
    <Upload :type="'dataflow'" ref="upload"></Upload>
  </section>
</template>

<script>
import { taskApi } from '@tap/api'
import { toRegExp } from '../../../utils/util'
import SkipError from '../../../components/SkipError'
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
import Upload from '@/components/UploadDialog'
import StatusItem from '../StatusItem'
import Drawer from '@/components/Drawer'
import { ETL_STATUS_MAP } from '@/const'
import { getSubTaskStatus, getTaskBtnDisabled } from '@/utils/util'
import dayjs from 'dayjs'

let timeout = null
export default {
  name: 'TaskList',
  components: { FilterBar, TablePage, SkipError, StatusItem, Drawer, Upload },
  data() {
    return {
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
      order: 'createTime DESC',
      typeOptions: [
        { label: this.$t('select_option_all'), value: '' },
        {
          label: this.$t('dataFlow.initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('dataFlow.cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('dataFlow.initial_sync') + this.$t('dataFlow.cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      agentOptions: [],

      multipleSelection: [],

      taskSettingsDialog: false, //任务调度设置弹窗开关

      syncType: {
        initial_sync: this.$t('task_info_initial_sync'),
        cdc: this.$t('task_info_initial_cdc'),
        'initial_sync+cdc': this.$t('task_info_initial_sync') + '+' + this.$t('task_info_initial_cdc')
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
      let options = [{ label: this.$t('task_list_status_all'), value: '' }]
      let map = ETL_STATUS_MAP
      for (const key in map) {
        const item = map[key]
        options.push({ label: item.text, value: key })
      }
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
        desc: true
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
          let list = data?.items || []
          return {
            total: data.total,
            data: list.map(item => {
              return this.cookRecord(item)
            })
          }
        })
    },

    cookRecord(item) {
      let getLag = lag => {
        let r = ''
        if (lag) {
          let s = parseInt(lag),
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
          r = parseInt(s) + this.$t('timeToLive.s')
          if (m > 0) {
            r = parseInt(m) + this.$t('timeToLive.m') + r
          }
          if (h > 0) {
            r = parseInt(h) + this.$t('timeToLive.h') + r
          }
          if (d > 0) {
            r = parseInt(d) + this.$t('timeToLive.d') + r
          }
        }
        return r
      }
      item['lag'] = '-'
      if (item.stats) {
        //企业版增加增量lag
        if (item.stats.replicationLag && item.stats.replicationLag !== 0) {
          item['lag'] = getLag(item.stats.replicationLag)
        }
      }
      let statuses = item.statuses
      item.disabledData = getTaskBtnDisabled(
        item,
        this.$disabledByPermission('SYNC_job_operation_all_data', item.user_id)
      )
      item.statusResult = getSubTaskStatus(statuses)
      return item
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
    create() {
      this.$router.push({
        name: 'DataflowNew'
      })
    },
    handleEditor(id) {
      const h = this.$createElement
      this.$confirm(
        h('p', null, [
          h('span', null, this.$t('dataFlow.modifyEditText')),
          h('span', { style: 'color: #2C65FF' }, this.$t('dataFlow.nodeLayoutProcess')),
          h('span', null, '、'),
          h('span', { style: 'color: #2C65FF' }, this.$t('dataFlow.nodeAttributes')),
          h('span', null, '、'),
          h('span', { style: 'color: #2C65FF' }, this.$t('dataFlow.matchingRelationship')),
          h('span', null, '，'),
          h('span', null, this.$t('dataFlow.afterSubmission')),
          h('span', { style: 'color: #2C65FF' }, this.$t('dataFlow.reset')),
          h('span', null, this.$t('dataFlow.runNomally')),
          h('span', null, this.$t('dataFlow.editLayerTip'))
        ]),
        this.$t('dataFlow.importantReminder'),
        {
          customClass: 'dataflow-clickTip',
          confirmButtonText: this.$t('dataFlow.continueEditing'),
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
      }, 200)
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
      let strArr = this.$t('dataFlow.' + message).split('xxx')
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
        title: this.$t('dataFlow.' + title)
      }
    },
    handleCommand(command, node) {
      let ids = []
      if (node) {
        ids = [node.id]
      } else {
        ids = this.multipleSelection.map(item => item.id)
      }
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
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
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
      let list = this.table.list
      for (let i = 0; i < list.length; i++) {
        let node = list[i]
        if (ids.includes(node.id)) {
          if (node.setting && !node.setting.sync_type.includes('cdc')) {
            message = this.$t('message.stopInitial_syncMessage')
          }
          if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
            const h = this.$createElement
            let arr = this.$t('message.stopAggregation_message').split('XXX')
            message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
          }
        }
      }
      this.$confirm(message, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
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
          this.$message.success(data?.message || this.$t('message_operation_succuess'))
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
          this.responseHandler(data, this.$t('message.deleteOK'))
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
            this.responseHandler(data, this.$t('message.resetOk'))
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
        this.$message.success(this.$t('message.copySuccess'))
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
        this.responseHandler(data, this.$t('message_operation_succuess'))
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
          5: this.$t('dataFlow.multiError.notFound'),
          6: this.$t('dataFlow.multiError.statusError'),
          7: this.$t('dataFlow.multiError.otherError'),
          8: this.$t('dataFlow.multiError.statusError')
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
        this.$message.success(msg)
      }
    },
    // 任务调度设置
    handleTaskscheduling(id, data) {
      this.taskSettingsDialog = true
      this.formSchedule.id = id
      this.formSchedule.name = data.name
      this.formSchedule.isSchedule = data.isSchedule
      this.formSchedule.cronExpression = data.cronExpression
      this.formSchedule.taskData = data
    },
    // 任务调度设置保存
    saveTaskSetting() {
      let data = this.formSchedule.taskData.setting || {}
      data.isSchedule = this.formSchedule.isSchedule
      data.cronExpression = this.formSchedule.cronExpression
      taskApi
        .patchId(this.formSchedule.id, { setting: data })
        .then(() => {
          this.$message.success(this.$t('message_save_ok'))
        })
        .finally(() => {
          this.taskSettingsDialog = false
        })
    },
    handleGoFunction() {
      this.$router.push({
        name: 'function'
      })
    },
    toDetail(row) {
      this.$router.push({
        name: 'dataflowDetails',
        params: {
          id: row.id
        }
      })
    },
    isShowForceStop(data) {
      return data?.length && data.every(t => ['stopping'].includes(t.status))
    },
    // 打开预览
    handlePreview(data) {
      let previewList = [{ label: 'subtasks', value: data.statuses.length }]
      let statusResult = data.statusResult || []
      let colorMap = {
        error: '#F64E3E',
        running: '#2CD36F',
        not_running: '#FFBF00',
        stop: '#FF7D00',
        edit: '#2C65FF'
      }
      let total = statusResult.reduce((prev, cur) => {
        return cur.count + prev
      }, 0)
      let proportionData = statusResult.map(item => {
        return {
          label: item.status,
          key: item.count,
          value: (item.count / total) * 100,
          color: colorMap[item.status]
        }
      })
      this.proportionData = proportionData

      this.isShowDetails = true
      this.previewData = data
      for (let item in data) {
        if (['type', 'createTime'].includes(item)) {
          if (['createTime'].includes(item)) {
            data[item] = this.formatTime(data[item])
          }
          previewList.push({ label: item, value: data[item] || '-' })
        }
      }
      this.previewList = previewList
    },

    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('task_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('task_list_sync_type'),
          key: 'type',
          type: 'select-inner',
          items: this.typeOptions
        },
        {
          placeholder: this.$t('task_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
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
.dataflow-table-more-dropdown-menu .btn-delete {
  color: #f56c6c;
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
      font-size: 12px;
      border-top-width: 2px;
      box-sizing: border-box;
      .proportion {
        height: 6px;
        background-color: map-get($bgColor, main);
        span {
          display: inline-block;
          height: 6px;
          &:first-child {
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;
          }
          &:first-child {
            border-top-left-radius: 2px;
            border-bottom-left-radius: 2px;
          }
          &:last-child {
            border-top-right-radius: 2px;
            border-bottom-right-radius: 2px;
          }
        }
      }
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
          color: rgba(0, 0, 0, 0.6);
          font-size: 12px;
        }
        .value {
          display: inline-block;
          width: 100%;
          padding-top: 5px;
          color: map-get($fontColor, light);
          font-size: 12px;
          color: map-get($fontColor, dark);
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
