<template>
  <section class="data-flow-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :classify="{
        authority: 'SYNC_category_management',
        types: ['dataflow'],
        viewPage: syncType,
        title: $t('packages_business_task_migratelist_renwufenlei')
      }"
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
          :disabled="$disabledReadonlyUserBtn()"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <!--<i class="iconfont icon-biaoqian back-btn-icon"></i>-->
          <span> {{ $t('public_button_bulk_tag') }}</span>
        </el-button>
        <el-dropdown
          class="btn"
          @command="handleCommand($event)"
          v-show="multipleSelection.length > 0 && bulkOperation"
        >
          <el-button class="btn-dropdowm" size="mini">
            <!--<i class="iconfont icon-piliang back-btn-icon"></i>-->
            <span> {{ $t('packages_business_dataFlow_taskBulkOperation') }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="start"
              v-readonlybtn="'SYNC_job_operation'"
              :disabled="$disabledReadonlyUserBtn()"
              >{{ $t('packages_business_dataFlow_bulkScheuled') }}</el-dropdown-item
            >
            <el-dropdown-item
              command="stop"
              v-readonlybtn="'SYNC_job_operation'"
              :disabled="$disabledReadonlyUserBtn()"
              >{{ $t('packages_business_dataFlow_bulkStopping') }}</el-dropdown-item
            >
            <el-dropdown-item
              command="initialize"
              v-readonlybtn="'SYNC_job_operation'"
              :disabled="$disabledReadonlyUserBtn()"
              >{{ $t('packages_business_dataFlow_batchRest') }}</el-dropdown-item
            >
            <el-dropdown-item command="del" v-readonlybtn="'SYNC_job_delete'" :disabled="$disabledReadonlyUserBtn()">{{
              $t('packages_business_dataFlow_batchDelete')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <template>
          <el-button
            v-show="multipleSelection.length > 0 && isDaas"
            :disabled="$disabledReadonlyUserBtn()"
            v-readonlybtn="'SYNC_job_export'"
            size="mini"
            class="btn message-button-cancel"
            @click="handleCommand('export')"
          >
            <!--<i class="iconfont icon-export back-btn-icon"></i>-->
            <span> {{ $t('public_button_export') }}</span>
          </el-button>
          <el-button
            v-if="isDaas"
            v-readonlybtn="'SYNC_job_import'"
            size="mini"
            class="btn"
            :disabled="$disabledReadonlyUserBtn()"
            @click="handleImport"
          >
            <!--<i class="iconfont icon-daoru back-btn-icon"></i>-->
            <span> {{ $t('packages_business_button_bulk_import') }}</span>
          </el-button>
        </template>
        <el-button
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          :disabled="$disabledReadonlyUserBtn()"
          :loading="createBtnLoading"
          @click="create"
        >
          {{ $t('public_button_create') }}
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
      <el-table-column min-width="240" :label="$t('public_task_name')" :show-overflow-tooltip="true">
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
            <span v-if="row.listtags" class="justify-content-start ellipsis block">
              <span class="tag inline-block" v-for="item in row.listtags" :key="item.id">{{ item.value }}</span>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_task_type')" :min-width="colWidth.taskType">
        <template #default="{ row }">
          <span>
            {{ row.type ? taskType[row.type] : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('public_task_status')" :min-width="colWidth.status">
        <template #default="{ row }">
          <TaskStatus :task="row" :agentMap="agentMap" :error-cause="taskErrorCause[row.id]" />
        </template>
      </el-table-column>
      <el-table-column sortable prop="currentEventTimestamp" :label="$t('public_task_cdc_time_point')" min-width="164">
        <template #default="{ row }">
          {{ formatTime(row.currentEventTimestamp) }}
        </template>
      </el-table-column>
      <el-table-column prop="lastStartDate" :label="$t('public_task_last_run_time')" min-width="164" sortable="custom">
        <template #default="{ row }">
          {{ formatTime(row.lastStartDate) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_operation')" :width="colWidth.operation">
        <template #default="{ row }">
          <div class="table-operations" v-if="!row.hasChildren">
            <ElLink
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.start || $disabledReadonlyUserBtn()"
              @click="start([row.id])"
            >
              {{ $t('public_button_start') }}
            </ElLink>
            <template v-else>
              <ElLink
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.forceStop || $disabledReadonlyUserBtn()"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElLink>
              <ElLink
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.stop || $disabledReadonlyUserBtn()"
                @click="stop([row.id], row)"
              >
                {{ $t('public_button_stop') }}
              </ElLink>
            </template>
            <ElDivider v-readonlybtn="'SYNC_job_operation'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.edit || $disabledReadonlyUserBtn()"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.startTime"
              @click="toDetail(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.reset || $disabledReadonlyUserBtn()"
              @click="initialize([row.id], row)"
            >
              {{ $t('public_button_reset') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="$disabledReadonlyUserBtn()"
              @click="copy([row.id], row)"
            >
              {{ $t('public_button_copy') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.delete || $disabledReadonlyUserBtn()"
              @click="del([row.id], row)"
            >
              {{ $t('public_button_delete') }}
            </ElLink>
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
    <!-- 导入 -->
    <Upload v-if="isDaas" :type="'dataflow'" ref="upload" @success="table.fetch()"></Upload>
    <!--付费 -->
    <PaidUpgradeDialog :visible.sync="paidUpgradeVisible" :paidPlan="paidPlan"></PaidUpgradeDialog>
    <!-- 删除任务 pg数据源 slot 删除失败 自定义dialog 提示 -->
    <el-dialog
      :title="$t('public_message_title_prompt')"
      :visible.sync="dialogDelMsgVisible"
      width="52%"
      custom-class="dialogDelMsgDialog"
    >
      <span> {{ $t('packages_business_task_status_error_tip') }}</span>
      <div class="box mt-4">
        <div class="mb-4">{{ $t('packages_business_task_list_sqLyuju') }}</div>
        <div class="mt-2">{{ $t('packages_business_task_list_diyibuchaxun') }}</div>
        <div class="mb-4">
          {{ copySelectSql }}
          <ElTooltip
            placement="top"
            manual
            :content="$t('agent_deploy_start_install_button_copied')"
            popper-class="copy-tooltip"
            :value="showTooltip"
          >
            <span
              class="operaKey color-primary cursor-pointer"
              v-clipboard:copy="copySelectSql"
              v-clipboard:success="onCopy"
              @mouseleave="showTooltip = false"
            >
              <i class="click-style">{{ $t('public_button_copy') }}</i>
            </span>
          </ElTooltip>
        </div>
        <div class="mt-2">{{ $t('packages_business_task_list_dierbushanchu') }}</div>
        <div>
          {{ copyDelSql }}
          <ElTooltip
            placement="top"
            manual
            :content="$t('agent_deploy_start_install_button_copied')"
            popper-class="copy-tooltip"
            :value="showDelTooltip"
          >
            <span
              class="operaKey color-primary cursor-pointer"
              v-clipboard:copy="copyDelSql"
              v-clipboard:success="onDelCopy"
              @mouseleave="showDelTooltip = false"
            >
              <i class="click-style">{{ $t('public_button_copy') }}</i>
            </span>
          </ElTooltip>
        </div>
      </div>
      <div class="mt-2" v-for="item in failList" :key="item.id">
        {{ $t('packages_business_task_list_lianjieming') }}{{ item.message }}
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogDelMsgVisible = false">{{ $t('public_button_close') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { taskApi, workerApi, paidApi } from '@tap/api'
import { TablePage, TaskStatus } from '../../components'
import SkipError from './SkipError'
import Upload from '../../components/UploadDialog'
import { makeStatusAndDisabled, STATUS_MAP } from '../../shared'
import syncTaskAgent from '../../mixins/syncTaskAgent'
import { toRegExp } from '@tap/shared'
import { FilterBar, PaidUpgradeDialog } from '@tap/component'

export default {
  name: 'List',

  props: {
    route: {},
    taskBuried: {},
    syncType: String
  },

  inject: ['checkAgent', 'buried'],

  components: { FilterBar, TablePage, SkipError, Upload, TaskStatus, PaidUpgradeDialog },

  mixins: [syncTaskAgent],

  data() {
    return {
      STATUS_MAP,
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      dataFlowId: '',
      isShowDetails: false,
      previewLoading: false,
      previewData: null,
      previewList: [],
      filterItems: [],
      restLoading: false,
      order: 'last_updated DESC',
      multipleSelection: [],
      createBtnLoading: false,
      bulkOperation: this.$has('SYNC_job_export') || this.$has('SYNC_job_operation') || this.$has('SYNC_job_delete'),
      taskType: {
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc'),
        'initial_sync+cdc': this.$t('public_task_type_initial_sync') + '+' + this.$t('public_task_type_cdc')
      },
      typeOptions: [
        { label: this.$t('public_select_option_all'), value: '' },
        {
          label: this.$t('public_task_type_initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('public_task_type_cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('public_task_type_initial_sync') + this.$t('public_task_type_cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      searchParams: {
        keyword: '',
        status: '',
        type: ''
      },
      //付费升级
      paidUpgradeVisible: false,
      paidPlan: '',
      //删除任务 pg数据源 slot 删除失败 自定义dialog 提示
      dialogDelMsgVisible: false,
      copySelectSql: `SELECT slot_name FROM pg_replication_slots WHERE slot_name like 'tapdata_cdc_%' and active='false';`,
      copyDelSql: "SELECT pg_drop_replication_slot('${slot_name}');",
      showTooltip: false,
      showDelTooltip: false,
      failList: [], //错误列表
      taskErrorCause: {}
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
    },

    colWidth() {
      const { locale } = this.$i18n
      return locale === 'en'
        ? {
            taskType: 140,
            status: 130,
            operation: 340
          }
        : {
            taskType: 80,
            status: 110,
            operation: 280
          }
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
    this.timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.getFilterItems()
    this.searchParams = Object.assign(this.searchParams, this.$route.query)

    this.loop(this.isDaas ? this.getClusterStatus : this.getAgentStatus, 30000)
  },

  beforeDestroy() {
    clearInterval(this.timeout)
  },

  methods: {
    getData({ page, tags }) {
      let { current, size } = page
      const { syncType } = this
      let { keyword, status, type, agentId } = this.searchParams
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
        listtags: true,
        syncType: true,
        stoppingTime: true,
        pingTime: true,
        canForceStopping: true,
        currentEventTimestamp: true,
        crontabExpressionFlag: true,
        crontabExpression: true,
        lastStartDate: true
      }
      let where = {
        syncType
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
      if (agentId) {
        where['agentId'] = agentId
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
          let errorTaskIds = []
          let list = (data?.items || []).map(item => {
            makeStatusAndDisabled(item)
            if (item.status === 'error') {
              errorTaskIds.push(item.id)
            }
            return item
          })

          this.loadTaskErrorCause(errorTaskIds)

          // 有选中行，列表刷新后无法更新行数据，比如状态
          if (this.multipleSelection.length && list.length) {
            let tempMap = list.reduce((map, item) => {
              map[item.id] = item
              return map
            }, {})
            this.multipleSelection.forEach((item, i) => {
              const temp = tempMap[item.id]
              if (temp) {
                this.multipleSelection[i] = temp
              }
            })
          }

          return {
            total: data.total,
            data: list
          }
        })
    },

    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('public_task_status'),
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
          placeholder: this.$t('public_task_name'),
          key: 'keyword',
          type: 'input'
        }
      ]

      if (!this.isDaas) {
        this.filterItems.splice(2, 0, {
          label: i18n.t('agent_name'),
          key: 'agentId',
          type: 'select-inner',
          menuMinWidth: '250px',
          items: async () => {
            let filter = {
              where: {
                status: { $in: ['Running'] }
              },
              size: 100
            }
            let data = await this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
            return data.items.map(item => {
              return {
                label: item.name,
                value: item.tmInfo.agentId
              }
            })
          }
        })
      }
    },

    /**
     * 点击名称调整
     * @param row
     */
    handleClickName(row) {
      if (this.$disabledReadonlyUserBtn()) return
      if (!['edit', 'wait_start'].includes(row.status)) {
        this.toDetail(row)
      } else {
        this.handleEditor(row)
      }
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    responseHandler(data, msg, canNotList = []) {
      let failList = data?.filter(t => t.code !== 'ok') || []
      failList = [...failList, ...canNotList]
      if (failList.length) {
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
              }</span> : <span style="color: #F56C6C">${item.message}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg, false)
      }
      this.table.clearSelection()
    },

    handleSortTable({ order, prop }) {
      if (prop === 'lag') {
        prop = 'stats.replicationLag'
      }
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
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
        this.responseHandler(data, this.$t('public_message_operation_success'))
      })
    },

    skipHandler(id, errorEvents) {
      this.changeStatus([id], { status: 'scheduled', errorEvents })
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

    handleSelectTag() {
      let tagList = []
      this.multipleSelection.forEach(row => {
        if (row.listtags) {
          tagList = [...row.listtags, ...tagList]
        }
      })
      //去重
      let map = new Map()
      for (let item of tagList) {
        if (!map.has(item.id)) {
          map.set(item.id, item)
        }
      }
      tagList = [...map.values()]
      return tagList
    },

    async create() {
      this.buried(this.taskBuried.new)
      this.createBtnLoading = true
      if (!this.isDaas) {
        // true 付费计划有效，false 付费计划无效
        this.paidPlan = await paidApi.getUserPaidPlan()
      }
      if (!this.isDaas && !this.paidPlan?.valid) {
        this.paidUpgradeVisible = true
        this.createBtnLoading = false
        return
      }
      this.checkAgent(() => {
        this.$router.push({
          name: this.route.new
        })
      }).catch(() => {
        this.createBtnLoading = false
        this.buried(this.taskBuried.newFail)
      })
    },

    handleEditor({ id }) {
      this.openRoute({
        name: this.route.editor,
        params: {
          id
        }
      })
    },

    start(ids, node, canNotList = []) {
      this.buried(this.taskBuried.start)
      taskApi
        .batchStart(ids)
        .then(data => {
          this.buried(this.taskBuried.start, '', { result: true })
          this.table.fetch()
          this.responseHandler(data, this.$t('public_message_operation_success'), canNotList)
        })
        .catch(() => {
          this.buried(this.taskBuried.start, '', { result: false })
        })
    },

    copy(ids, node) {
      taskApi.copy(node.id).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('public_message_copy_success'))
      })
    },

    initialize(ids, item = {}, canNotList) {
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
            this.responseHandler(data, this.$t('public_message_operation_success'), canNotList)
          })
          .finally(() => {
            this.restLoading = false
          })
      })
    },

    del(ids, item = {}, canNotList) {
      let msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, '', {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchDelete(ids).then(data => {
          const selected = this.multipleSelection.filter(({ id }) => ids.includes(id))
          const { toggleRowSelection } = this.table.$refs.table
          selected.forEach(row => toggleRowSelection(row, false))
          this.table.fetch()
          this.responseDelHandler(data, this.$t('public_message_delete_ok'), canNotList)
        })
      })
    },
    //删除任务单独提示
    responseDelHandler(data, msg, canNotList = []) {
      this.failList = data?.filter(t => t.code === 'Clear.Slot') || []
      this.failList = [...this.failList, ...canNotList]
      if (this.failList.length) {
        this.dialogDelMsgVisible = true
      } else if (msg) {
        this.$message.success(msg, false)
      }
      this.table.clearSelection()
    },

    async forceStop(ids, item = {}) {
      let data = await workerApi.taskUsedAgent(ids)
      let msgObj = this.getConfirmMessage('force_stop', ids.length > 1, item.name)
      if (data?.status === 'offline' && !this.isDaas) {
        msgObj = this.getConfirmMessage('agent_force_stop', ids.length > 1, item.name)
      }
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'), false)
          this.table.fetch()
        })
      })
    },

    stop(ids, item = {}, canNotList) {
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
          this.table.fetch()
          this.responseHandler(data, this.$t('public_message_operation_success'), canNotList)
        })
      })
    },

    toDetail({ id }) {
      this.openRoute({
        name: this.route.monitor,
        params: {
          id
        }
      })
    },

    export(ids) {
      taskApi.export(ids)
    },

    handleCommand(command, node) {
      let commandFilter = ['start', 'stop', 'del', 'initialize']
      let ids = []
      let taskList = []
      if (node) {
        taskList = [node]
      } else {
        taskList = this.multipleSelection
      }
      let canList = []
      let canNotList = []
      const disabledMap = {
        initialize: 'reset',
        del: 'delete'
      }
      if (commandFilter.includes(command)) {
        let op = disabledMap[command] || command
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

      const canNotResult = canNotList.map(t => {
        return {
          code: 'error',
          id: t?.id,
          message: i18n.t('packages_business_task_list_renwubuzhichi')
        }
      })
      if (!canList.length) {
        this.responseHandler(canList, '', canNotResult)
        return
      }
      ids = canList.map(item => item.id)
      this[command](ids, node, canNotResult)
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

    handleImport() {
      this.$refs.upload.show()
    },
    onCopy() {
      this.showTooltip = true
    },
    onDelCopy() {
      this.showDelTooltip = true
    },

    async loadTaskErrorCause(taskIds) {
      if (!taskIds.length) return
      await Promise.all(taskIds.map(this.getTaskErrorCause))

      console.log('result', this.taskErrorCause) // eslint-disable-line
    },

    async getTaskErrorCause(task_id) {
      let cause
      try {
        const data = await this.$axios({
          method: 'post',
          // baseUrl: null,
          url: '/private_ask',
          data: {
            task_id
          }
        })
        cause = data?.resp
      } catch (e) {
        console.debug(e) // eslint-disable-line
        // cause =
        //   '\u6700\u8fd1\u4e00\u6bb5\u65f6\u95f4\u5185, \u60a8\u5171\u6709 1 \u4e2a\u4efb\u52a1\u51fa\u73b0\u9519\u8bef, \u7cfb\u7edf\u5206\u6790\u6210\u529f\u7684\u6570\u91cf\u6709: 1 \u4e2a, \u53ef\u80fd\u539f\u56e0\u5206\u522b\u5982\u4e0b:\\\\n\\\\n1. \u540d\u5b57\u4e3a \u65b0\u4efb\u52a1@19:02:39 \u7684\u4efb\u52a1, \u5728 2023-03-15 10:26:38 \u53d1\u751f\u62a5\u9519, \u7ecf\u5206\u6790, \u63d0\u4f9b\u7ed9\u60a8\u7684\u4fe1\u606f\u4e3a:  \u8fd9\u53ef\u80fd\u662f\u7531\u4e8e\u6570\u636e\u5e93\u4e2d\u51fa\u73b0\u6b7b\u9501\u5bfc\u81f4\u7684\uff0c\u53ef\u80fd\u662f\u7531\u4e8e\u591a\u4e2a\u7ebf\u7a0b\u540c\u65f6\u8bbf\u95ee\u6570\u636e\u5e93\u800c\u5bfc\u81f4\u7684\uff0c\u53ef\u4ee5\u5c1d\u8bd5\u4f18\u5316\u6570\u636e\u5e93\u8bbf\u95ee\uff0c\u51cf\u5c11\u591a\u7ebf\u7a0b\u540c\u65f6\u8bbf\u95ee\u6570\u636e\u5e93\u7684\u60c5\u51b5\uff0c\u4ee5\u907f\u514d\u6b7b\u9501\u7684\u53d1\u751f\u3002\\\\n\\\\n'
      }

      cause &&
        cause !==
          '\u6ca1\u6709\u53d1\u73b0\u60a8\u6700\u8fd1\u6709\u4efb\u52a1\u62a5\u9519, \u5982\u679c\u6709\u5176\u4ed6\u95ee\u9898, \u6b22\u8fce\u54a8\u8be2\u6211\u4eec\u7684\u4eba\u5de5\u5ba2\u670d' &&
        this.$set(this.taskErrorCause, task_id, cause.replace(/\\n/g, '\n').replace(/(\n)+$/g, ''))
    }
  }
}
</script>

<style lang="scss" scoped>
.data-flow-wrap {
  height: 100%;
  padding: 0 24px 24px 0;
  background: #fff;
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
        padding: 2px 5px;
        font-style: normal;
        font-weight: 400;
        font-size: 10px;
        line-height: 14px;
        color: map-get($color, tag);
        border: 1px solid map-get($bgColor, tag);
        border-radius: 2px;
        margin-left: 5px;
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
  .dialogDelMsgDialog {
    .box {
      padding: 10px;
      background-color: #f8f9fa;
    }
  }
}
</style>
