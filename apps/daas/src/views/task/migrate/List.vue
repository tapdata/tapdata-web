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
          size="mini"
          class="btn message-button-cancel"
          v-readonlybtn="'SYNC_category_application'"
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
        <el-button
          v-readonlybtn="'SYNC_job_import'"
          size="mini"
          class="btn message-button-cancel"
          @click="handleImport"
        >
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('dataFlow.bulkImport') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="create"
        >
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          {{ $t('task_create_task') }}
        </el-button>
      </div>

      <el-table-column
        reserve-selection
        type="selection"
        width="45"
        :selectable="row => !row.hasChildren && !$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
      >
      </el-table-column>

      <el-table-column min-width="200" :label="$t('task_list_name')" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="dataflow-name link-primary">
            <ElLink
              type="primary"
              :class="['name', { 'has-children': row.hasChildren }]"
              @click.stop="handlePreview(row.id)"
              >{{ row.name }}</ElLink
            >
            <el-tag v-if="row.listTagId !== undefined" class="tag" type="info" effect="dark" size="mini">
              {{ row.listTagValue }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('task_list_task_type')" min-width="150">
        <template #default="{ row }">
          <span>
            {{ row.type ? syncType[row.type] : '' }}
          </span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="lag" :label="$t('dataFlow.maxLagTime')" width="180" sortable="custom"></el-table-column> -->
      <el-table-column prop="status" :label="$t('task_list_status')" width="180">
        <template #default="{ row }">
          <!--调度失败任务 统一归类为error-->
          <span :class="['status-' + row.statusResult[0].status, 'status-block', 'mr-2']">
            {{ $t('task_preview_status_' + row.statusResult[0].status) }}
          </span>
          <span v-if="row.transformStatus && row.transformStatus === 'running'">
            <span v-if="row.transformProcess && row.transformProcess !== 1">{{ row.transformProcess * 100 }} %</span>
          </span>
        </template>
      </el-table-column>

      <!--引擎暂时未回写启动时间，暂时注释-->
      <!--<el-table-column prop="startTime" :label="$t('task_list_start_time')" width="170" sortable="custom">
        <template #default="{ row }">
          {{ row.startTime ? $moment(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>-->

      <el-table-column prop="createTime" :label="$t('column_create_time')" width="210" sortable="createTime">
        <template #default="{ row }">
          {{ row.createTime ? $moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="270" fixed="right">
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
              v-if="row.status === 'stopping'"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
              @click="forceStop([row.id], row)"
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
              {{ $t('task_list_edit') }}
            </ElLink>
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_edition'"></ElDivider>
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="toDetail(row)">
              {{ $t('task_list_button_monitor') }}
            </ElLink>
            <ElDivider direction="vertical" v-readonlybtn="'SYNC_job_edition'"></ElDivider>
            <el-dropdown v-show="moreAuthority" size="small" @command="handleCommand($event, row)">
              <ElLink type="primary" class="rotate-90">
                <!-- {{ $t('button.more') }} -->
                <i class="el-icon-more"></i>
              </ElLink>
              <el-dropdown-menu class="dataflow-table-more-dropdown-menu" slot="dropdown">
                <el-dropdown-item command="toView">{{ $t('dataFlow.view') }}</el-dropdown-item>
                <el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
                  $t('task_list_export')
                }}</el-dropdown-item>
                <el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'"
                  >{{ $t('task_list_copy') }}
                </el-dropdown-item>

                <el-dropdown-item
                  :disabled="row.disabledData.reset"
                  command="initialize"
                  v-readonlybtn="'SYNC_job_operation'"
                >
                  {{ $t('task_list_reset') }}
                </el-dropdown-item>
                <el-dropdown-item command="del" :disabled="row.disabledData.delete" v-readonlybtn="'SYNC_job_delete'">
                  {{ $t('task_list_delete') }}
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
              <div class="status">
                <!-- <img :src="getSatusImgSrc(previewData.status)" alt="" /> -->
                <span :class="['status-' + previewData.status, 'status-block']">
                  {{ $t('task_preview_status_' + previewData.status) }}
                </span>
              </div>
            </div>
          </div>
        </header>
        <ul class="info-list">
          <li v-for="item in previewList" :key="item.label">
            <!-- {{ previewData[item] }} -->
            <template v-if="!!item.value">
              <VIcon class="icon mr-4">{{ item.label }}</VIcon>
              <!-- <img class="label-img" :src="getImgByData(item.label)" /> -->
              <div class="label-text">
                <div class="label font-color-light">{{ $t('task_preview_' + item.label) }}:</div>
                <div
                  class="value align-items-center align-middle font-color-dark"
                  :class="{ 'align-top': item.value && item.value.length > 15 }"
                >
                  {{ item.value }}
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
import factory from '../../../api/factory'
const Task = factory('Task')
import { toRegExp } from '../../../utils/util'
import SkipError from '../../../components/SkipError'
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
import Drawer from '@/components/Drawer'
import Upload from '@/components/UploadDialog'
// import { ETL_STATUS_MAP } from '@/const'
import { getSubTaskStatus, getTaskBtnDisabled } from '@/utils/util'

let timeout = null
export default {
  name: 'TaskList',
  components: { FilterBar, TablePage, SkipError, Drawer, Upload },
  data() {
    return {
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
        progress: '',
        executionStatus: '',
        timeData: '',
        syncType: ''
      },
      order: 'createTime DESC',
      progressOptions: [
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
        initial_sync: this.$t('dataFlow.initial_sync'),
        cdc: this.$t('dataFlow.cdc'),
        'initial_sync+cdc': this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
      },
      statusTransformMap: {
        running: this.$t('task_list_transform_running'),
        done: this.$t('task_list_transform_done'),
        error: this.$t('task_list_transform_error')
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
      timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week', 'year'],
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        { label: this.$t('task_preview_status_running'), value: 'running' },
        { label: this.$t('task_preview_status_stop'), value: 'stop' },
        { label: this.$t('task_preview_status_edit'), value: 'edit' },
        { label: this.$t('task_preview_status_ready'), value: 'ready' },
        { label: this.$t('task_preview_status_wait_run'), value: 'wait_run' },
        { label: this.$t('task_preview_status_error'), value: 'error' },
        { label: this.$t('task_preview_status_complete'), value: 'complete' }
      ]
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  created() {
    this.getFilterItems()
    // let { status } = this.$route.query
    // this.searchParams.status = status ?? ''
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)

    let { status } = this.$route.query
    this.searchParams.status = status ?? ''
  },
  beforeDestroy() {
    clearInterval(timeout)
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  methods: {
    dataflowChange(data) {
      if (data && data.data && data.data.fullDocument) {
        let dataflow = data.data.fullDocument
        if (dataflow.agentId) {
          let opt = this.agentOptions.find(it => it.value === dataflow.agentId)
          dataflow.tcm = {
            agentName: opt?.label
          }
        }
        let list = this.table.list
        let index = list.findIndex(it => it.name === dataflow.name)
        if (dataflow.children && !dataflow.children.length) {
          delete dataflow.children
        }
        if (index >= 0) {
          this.table.$set(list, index, Object.assign(list[index], this.cookRecord(dataflow)))
          let handleItem = this.cookRecord(dataflow)
          if (handleItem.children && !handleItem.children.length) {
            delete handleItem.children
          }
          this.table.$set(list, index, Object.assign(list[index], handleItem))
        }
      }
    },
    reset() {
      this.searchParams = {
        keyword: '',
        status: '',
        progress: '',
        executionStatus: '',
        timeData: '',
        syncType: ''
      }

      this.multipleSelection = []
      this.table.fetch(1)
    },
    getData({ page, tags }) {
      let region = this.$route.query.region
      let { current, size } = page
      let { keyword, status, progress, executionStatus, timeData, syncType, agentId } = this.searchParams

      let where = {
        syncType: 'migrate'
      }
      if (keyword && keyword.trim()) {
        where.or = [
          { name: { like: toRegExp(keyword), options: 'i' } },
          { 'stages.tableName': { like: toRegExp(keyword), options: 'i' } },
          { 'stages.name': { like: toRegExp(keyword), options: 'i' } }
        ]
      }
      if (agentId) {
        where['agentId'] = agentId
        status = status || 'running'
      }
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      region && (where['platformInfo.region'] = region)
      syncType && (where['type'] = syncType)
      if (executionStatus) {
        if (executionStatus === 'Lag') {
          where.Lag = true
        } else if (executionStatus === 'initialized') {
          where.and = [
            {
              'stats.stagesMetrics.status': {
                inq: ['initialized']
              }
            },
            {
              'stats.stagesMetrics.status': {
                nin: ['cdc', 'initializing']
              }
            }
          ]
        } else {
          where['stats.stagesMetrics.status'] = executionStatus
        }
      }
      if (timeData && timeData.length) {
        let dates = this.timeData.concat()
        if (dates[1]) {
          dates[1] = new Date(dates[1])
          dates[1].setHours(dates[1].getHours() + 24)
        }
        where.createTime = {
          between: dates
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
      progress && (where['type'] = progress)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      delete filter.where.mappingTemplate
      return this.$api('Task')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res.data
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
      let platformInfo = item.platformInfo
      if (platformInfo && platformInfo.regionName) {
        item.regionInfo = platformInfo.regionName + ' ' + platformInfo.zoneName
      }
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
      item.statusResult = getSubTaskStatus(statuses)
      item.disabledData = getTaskBtnDisabled(
        item,
        this.$disabledByPermission('SYNC_job_operation_all_data', item.user_id)
      )
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
      Task.batchUpdateListtags(attributes).then(() => {
        this.dataFlowId = ''
        this.table.fetch()
      })
    },
    create() {
      this.$router.push({
        name: 'MigrateNew'
      })
    },
    handleEditor(id) {
      this.$router.push({
        name: 'MigrateEditor',
        params: {
          id: id
        }
      })
    },
    handleImport() {
      this.$refs.upload.show()
      // let routeUrl = this.$router.resolve({
      //   // path: '/upload?type=dataflow'
      //   name: 'upload',
      //   query: {
      //     type: 'dataflow'
      //   }
      // })
      // window.open(routeUrl.href, '_blank')
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
          name: 'MigrateViewer',
          params: {
            id
          }
        }).href,
        'viewer_' + id
      )
    },
    export(ids) {
      Task.export(ids)
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

      this.$api('Task')
        .get({ filter: JSON.stringify(filter) })
        .then(res => {
          let flag = false
          let items = res.data?.items || []
          if (items.length) {
            items.forEach(item => {
              if (item?.errorEvents?.length) {
                flag = true
              }
            })
          }
          this.$api('Task')
            .batchStart(ids)
            .then(res => {
              this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
              this.table.fetch()
            })
            .catch(err => {
              this.$message.error(err.data?.message)
            })
          if (flag) {
            _this.$refs.errorHandler.checkError({ id, status: 'error' }, () => {
              // _this.changeStatus(ids, { status: 'scheduled' })
            })
          } else {
            // _this.changeStatus(ids, { status: 'scheduled' })
          }
        })
    },
    stop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      let message = msgObj.msg
      // let title = msgObj.title
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
            // title = this.$t('dataFlow.importantReminder')
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
        this.$api('Task')
          .batchStop(ids)
          .then(res => {
            this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
            this.table.fetch()
          })
          .catch(err => {
            this.$message.error(err.data?.message)
          })
        // return
        // this.changeStatus(ids, { status: 'stopping' })
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
        this.$api('Task')
          .forceStop(ids)
          .then(res => {
            this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
            this.table.fetch()
          })
          .catch(err => {
            this.$message.error(err.data?.message)
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
        this.$api('Task')
          .batchDelete(ids)
          .then(res => {
            if (res) {
              this.table.fetch()
              this.responseHandler(res.data, this.$t('message.deleteOK'))
            } else if (res.data && res.data.fail) {
              this.$message.info(this.$t('message.deleteFail'))
            }
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
        this.$api('Task')
          .batchRenew(ids)
          .then(res => {
            this.table.fetch()
            this.responseHandler(res.data, this.$t('message.resetOk'))
          })
          .catch(() => {
            this.$message.info(this.$t('message.cancelReset'))
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
      this.$api('Task')
        .copy(node.id)
        .then(() => {
          this.table.fetch()
          this.$message.success(this.$t('message.copySuccess'))
        })
        .catch(() => {
          this.$message.info(this.$t('message.copyFail'))
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
      this.$api('Task')
        .update(where, attributes)
        .then(res => {
          this.table.fetch()
          this.responseHandler(res.data, this.$t('message.operationSuccuess'))
        })
        .catch(err => {
          if (err.response.msg === 'Metadata transformer error') {
            this.$message.error('任务启动失败，请编辑任务完成映射配置')
          } else if (err.response.msg === 'DataFlow has add or del stages') {
            this.$message.error('任务启动失败，请编辑任务完成新增同步链路设置')
          } else if (err.response.msg === 'running transformer') {
            this.$message.error('任务启动失败，正在模型推演中...请稍后再试')
          }
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
              return `<div style="line-height: 24px;"><span class="link-primary">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg)
      }
    },
    // 任务调度设置保存
    saveTaskSetting() {
      // let data = this.formSchedule.taskData;
      let data = this.formSchedule.taskData.setting || {}
      data.isSchedule = this.formSchedule.isSchedule
      data.cronExpression = this.formSchedule.cronExpression
      this.$api('Task')
        .patchId(this.formSchedule.id, { setting: data })
        .then(result => {
          if (result && result.data) {
            this.$message.success(this.$t('message_save_ok'))
          }
        })
        .catch(() => {
          this.$message.error(this.$t('message_save_fail'))
        })
        .finally(() => {
          this.taskSettingsDialog = false
        })
    },
    handleGoFunction() {
      // top.location.href = '/#/JsFuncs'
      this.$router.push({
        name: 'function'
      })
    },
    toDetail(row) {
      let subId = row.statuses[0]?.id || ''
      if (!subId) {
        this.$message.error('该复制任务没有子任务')
        return
      }
      this.$router.push({
        name: 'MigrateStatistics',
        query: {
          id: row.id,
          subId: subId
        }
      })
    },
    handlePreview(id) {
      this.isShowDetails = true
      this.getPreviewData(id)
    },
    async getPreviewData(id) {
      this.previewLoading = true
      this.$api('Task')
        .findTaskDetailById([id])
        .then(res => {
          if (res) {
            let previewData = []
            this.previewData = res.data
            for (let item in res.data) {
              if (['type'].includes(item)) {
                res.data[item] = this.syncType[res.data[item]]
              }

              if (['cdcDelayTime', 'taskLastHour'].includes(item)) {
                res.data[item] = this.handleTimeConvert(res.data[item])
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
                res.data[item] = res.data[item] ? this.$moment(res.data[item]).format('YYYY-MM-DD HH:mm:ss') : '-'
              }

              if (
                !['customId', 'lastUpdAt', 'userId', 'lastUpdBy', 'lastUpdBy', 'status', 'desc', 'name'].includes(item)
              ) {
                previewData.push({ label: item, value: res.data[item] || '-' })
              }
              // this.getSatusImgSrc(res.data.status)
            }

            this.previewList = previewData
          }
        })
        .finally(() => {
          this.previewLoading = false
        })
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
          key: 'progress',
          type: 'select-inner',
          items: this.progressOptions
        },
        // {
        //   label: this.$t('task_list_execution_status'),
        //   key: 'executionStatus',
        //   type: 'select-inner',
        //   menuMinWidth: '250px',
        //   items: async () => {
        //     let option = ['initializing', 'cdc', 'initialized', 'Lag']
        //     return option.map(item => {
        //       return {
        //         label: this.$t('task_list_status_' + item),
        //         value: item
        //       }
        //     })
        //   }
        // },
        {
          placeholder: this.$t('task_list_search_placeholder'),
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
          r = 1 + this.$t('task_info_m')
        }
        // r = parseInt(s) + this.$t('timeToLive.s')
        if (m > 0) {
          r = parseInt(m) + this.$t('task_info_m')
        }
        if (h > 0) {
          r = parseInt(h) + this.$t('task_info_h') + r
        }
        if (d > 0) {
          r = parseInt(d) + this.$t('task_info_d') + r
        }
      }
      return r
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
