<template>
  <section class="data-flow-wrap classify-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :classify="{ authority: 'SYNC_category_management', types: ['dataflow'] }"
      :remoteMethod="getData"
      @selection-change="
        val => {
          multipleSelection = val
        }
      "
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="table.fetch(1)"> </FilterBar>
        <!-- <ul class="search-bar">
          <li>
            <ElSelect v-model="searchParams.status" size="small" @input="table.fetch(1)">
              <ElOption :label="$t('dataFlow.status.all')" value=""></ElOption>
              <ElOption v-for="(value, label) in statusOptions" :key="value" :label="label" :value="value"> </ElOption>
            </ElSelect>
          </li>
          <li>
            <el-select
              v-model="searchParams.progress"
              size="small"
              clearable
              :placeholder="$t('dataFlow.taskSettingPlaceholder')"
              style="width: 160px"
              @input="table.fetch(1)"
            >
              <el-option
                v-for="item in progressOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </li>
          <li>
            <el-select
              v-model="searchParams.executionStatus"
              size="small"
              clearable
              :placeholder="$t('dataFlow.executionStatus')"
              style="width: 160px"
              @input="table.fetch(1)"
            >
              <el-option
                v-for="opt in ['initializing', 'cdc', 'initialized', 'Lag']"
                :key="opt"
                :label="$t('dataFlow.status.' + opt)"
                :value="opt"
              ></el-option>
            </el-select>
          </li>
          <li>
            <el-input
              v-model="searchParams.keyword"
              clearable
              size="small"
              :placeholder="$t('dataFlow.searchPlaceholder')"
              @input="table.fetch(1, 800)"
            >
              <span slot="prefix" class="el-input__icon h-100 ml-1">
                <VIcon size="14">search</VIcon>
              </span>
            </el-input>
          </li>
          <li>
            <ElButton class="btn-refresh" size="small" @click="table.fetch()">
              <i class="el-icon-refresh"></i>
            </ElButton>
          </li>
        </ul> -->
      </template>
      <div class="buttons" slot="operation">
        <el-button
          v-if="$getSettingByKey('SHOW_CLASSIFY')"
          v-readonlybtn="'SYNC_category_application'"
          size="small"
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
          <el-button class="btn-dropdowm" size="small">
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
        <!-- <el-button v-readonlybtn="'SYNC_Function_management'" size="small" class="btn" @click="handleGoFunction">
          <i class="iconfont icon-hanshu back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkFx') }}</span>
        </el-button> -->
        <el-button v-readonlybtn="'SYNC_job_import'" size="small" class="btn" @click="handleImport">
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('dataFlow.bulkImport') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="small"
          @click="create"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
        </el-button>
      </div>

      <el-table-column
        type="selection"
        width="45"
        :selectable="row => !row.hasChildren && !$disabledByPermission('SYNC_job_operation_all_data', row.user_id)"
      >
      </el-table-column>

      <el-table-column min-width="200" :label="$t('task_list_name')" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="dataflow-name">
            <span :class="['name', { 'has-children': row.hasChildren }]" @click="toDetail(row)">{{ row.name }}</span>
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
          <StatusItem :value="row.statusResult"></StatusItem>
        </template>
      </el-table-column>

      <el-table-column
        prop="lag"
        :label="$t('task_list_execution_status')"
        width="180"
        sortable="custom"
      ></el-table-column>

      <el-table-column prop="startTime" :label="$t('task_list_start_time')" width="170" sortable="custom">
        <template #default="{ row }">
          {{ row.startTime ? $moment(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="280" fixed="right">
        <template #default="{ row }">
          <div class="table-operations" v-if="!row.hasChildren">
            <ElLink
              v-readonlybtn="'SYNC_job_operation'"
              :disabled="startDisabled(row)"
              type="primary"
              @click="start([row.id])"
            >
              {{ $t('task_list_run') }}
            </ElLink>
            <ElLink
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="
                $disabledByPermission('SYNC_job_operation_all_data', row.user_id) || stopDisabled(row.statusResult)
              "
              class="ml-3"
              @click="stop([row.id])"
              >{{ $t('task_list_stop') }}</ElLink
            >
            <!--            <ElLink-->
            <!--              v-if="row.status === 'stopping'"-->
            <!--              v-readonlybtn="'SYNC_job_operation'"-->
            <!--              type="primary"-->
            <!--              :disabled="-->
            <!--                $disabledByPermission('SYNC_job_operation_all_data', row.user_id) ||-->
            <!--                !statusBtMap['forceStop'][row.status]-->
            <!--              "-->
            <!--              @click="forceStop([row.id])"-->
            <!--            >-->
            <!--              {{ $t('dataFlow.button.force_stop') }}-->
            <!--            </ElLink>-->
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              style="margin-left: 10px"
              type="primary"
              :disabled="$disabledByPermission('SYNC_job_edition_all_data', row.user_id)"
              @click="handleEditor(row.id)"
            >
              {{ $t('button.edit') }}
            </ElLink>
            <!-- <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              style="margin-left: 10px"
              type="primary"
              :disabled="
                $disabledByPermission('SYNC_job_edition_all_data', row.user_id) ||
                row.sync_type !== 'initial_sync' ||
                row.status === 'running'
              "
              @click="handleTaskscheduling(row.id, row)"
            >
              {{ $t('task_list_button_schedule') }}
            </ElLink> -->
            <el-dropdown
              v-show="moreAuthority"
              size="small"
              style="margin-left: 10px"
              @command="handleCommand($event, row)"
            >
              <ElLink type="primary">
                {{ $t('button.more') }}
                <i class="el-icon-arrow-down"></i>
              </ElLink>
              <el-dropdown-menu class="dataflow-table-more-dropdown-menu" slot="dropdown">
                <el-dropdown-item command="export" v-readonlybtn="'SYNC_job_export'">{{
                  $t('dataFlow.dataFlowExport')
                }}</el-dropdown-item>
                <el-dropdown-item command="copy" v-readonlybtn="'SYNC_job_creation'"
                  >{{ $t('dataFlow.copy') }}
                </el-dropdown-item>

                <el-dropdown-item
                  :disabled="resetDisabled(row)"
                  command="initialize"
                  v-readonlybtn="'SYNC_job_operation'"
                >
                  {{ $t('dataFlow.button.reset') }}
                </el-dropdown-item>
                <el-dropdown-item
                  class="btn-delete"
                  command="del"
                  :disabled="
                    $disabledByPermission('SYNC_job_delete_all_data', row.user_id) || deleteDisabled(row.statusResult)
                  "
                  v-readonlybtn="'SYNC_job_delete'"
                >
                  {{ $t('button.delete') }}
                </el-dropdown-item>
                <el-dropdown-item
                  command="setTag"
                  v-if="$getSettingByKey('SHOW_CLASSIFY')"
                  v-readonlybtn="'SYNC_category_application'"
                >
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
    <DownAgent ref="agentDialog" type="taskRunning"></DownAgent>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
  </section>
</template>

<script>
import factory from '../../../api/factory'
import ws from '../../../api/ws'
const dataFlows = factory('DataFlows')
const MetadataInstance = factory('MetadataInstances')
// const cluster = factory('cluster');
import { toRegExp } from '../../../utils/util'
import SkipError from '../../../components/SkipError'
import DownAgent from '../../downAgent/agentDown'
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
// import VIcon from '@/components/VIcon'
import StatusItem from './StatusItem'
import { ETL_STATUS_MAP } from '@/const'
import { getSubTaskStatus } from './util'

let interval = null
export default {
  name: 'TaskList',
  components: { FilterBar, TablePage, DownAgent, SkipError, StatusItem },
  data() {
    return {
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
      statusBtMap: {
        // scheduled, draft, running, stopping, error, pause, force stopping
        start: { draft: true, error: true, pause: true },
        stop: { running: true },
        delete: { edit: true, draft: true, error: true, pause: true },
        edit: { edit: true, stop: true, error: true },
        reset: { draft: true, error: true, pause: true },
        forceStop: { stopping: true }
        //     编辑中（edit）- 编辑中
        // 启动中（start）- 启动中
        // 运行中（running）- 运行中
        // stop - 已停止
        // pause - 暂停
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
      // let op = {}
      let map = ETL_STATUS_MAP
      for (const key in map) {
        const item = map[key]
        options.push({ label: item.text, value: key })
        // let value = key
        // if (options[item.text]) {
        //   value = options[item.text] + ',' + value
        // }
        // options[item.text] = value
      }
      return options
    }
  },
  created() {
    this.getFilterItems()
    let { status } = this.$route.query
    this.searchParams.status = status ?? ''
    ws.on('watch', this.dataflowChange)
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  beforeDestroy() {
    ws.off('watch', this.dataflowChange)
    clearInterval(interval)
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
    watchDataflowList(ids) {
      let msg = {
        type: 'watch',
        collection: 'DataFlows',
        filter: {
          where: { 'fullDocument._id': { $in: ids } }, //查询条件
          fields: {
            'fullDocument.id': true,
            'fullDocument.name': true,
            'fullDocument.status': true,
            'fullDocument.checked': true,
            'fullDocument.executeMode': true,
            'fullDocument.stopOnError': true,
            'fullDocument.last_updated': true,
            'fullDocument.startTime': true,
            'fullDocument.children': true,
            'fullDocument.stats': true,
            'fullDocument.stages.id': true,
            'fullDocument.stages.name': true,
            'fullDocument.errorEvents': true,
            'fullDocument.agentId': true,
            'fullDocument.setting': true,
            'fullDocument.listtags': true
          }
        }
      }
      try {
        ws.ready(() => {
          ws.send(msg)
        }, true)
      } catch (e) {
        // eslint-disable-next-line
        console.log('e', e)
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
        mappingTemplate: this.mappingTemplate
      }
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
        type: true
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
          // where['stats.stagesMetrics'] = {
          //   $elemMatch: {
          //     status: 'cdc',
          //     replicationLag: { $gt: 0 }
          //   }
          // }
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
        fields: fields,
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
          this.watchDataflowList(list.map(it => it.id))
          this.table.setCache({
            keyword,
            status,
            progress,
            executionStatus,
            timeData
          })
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
          // let m = this.$moment.duration(lag)
          // if (m.days()) {
          //   r = m.days() + 'd'
          // } else if (m.hours()) {
          //   r = m.hours() + 'h'
          // } else if (m.minutes()) {
          //   r = m.minutes() + 'min'
          //   // } else if (m.seconds()) {
          //   //   r = m.seconds() + 's'
          // } else {
          //   r = lag + 's'
          // }
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
      item.statusResult = []
      if (statuses?.length) {
        let result = getSubTaskStatus(statuses)
        item.statusResult = result
      }
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
      dataFlows.batchUpdateListtags(attributes).then(() => {
        this.dataFlowId = ''
        this.table.fetch()
      })
    },
    create() {
      // let routeUrl = this.$router.resolve({
      //   name: 'taskNew'
      // })
      // window.open(routeUrl.href, '_blank')
      this.$router.push({
        name: 'DataflowNew'
      })
    },
    handleEditor(id) {
      const h = this.$createElement
      this.$confirm(
        h('p', null, [
          h('span', null, this.$t('dataFlow.modifyEditText')),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.nodeLayoutProcess')),
          h('span', null, '、'),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.nodeAttributes')),
          h('span', null, '、'),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.matchingRelationship')),
          h('span', null, '，'),
          h('span', null, this.$t('dataFlow.afterSubmission')),
          h('span', { style: 'color: #409EFF' }, this.$t('dataFlow.reset')),
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
        let routeUrl = this.$router.resolve({
          name: 'DataflowEditor',
          params: { id: id }
        })
        setTimeout(() => {
          document.querySelectorAll('.el-tooltip__popper').forEach(it => {
            it.outerHTML = ''
          })
          window.open(routeUrl.href, 'edit_' + id)
        }, 200)
      })
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)
    },
    handleImport() {
      let routeUrl = this.$router.resolve({
        path: '/upload?type=dataflow'
      })
      window.open(routeUrl.href, '_blank')
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
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          name
        ),
        strArr[1]
      ])
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
    export(ids) {
      let where = {
        _id: {
          in: ids
        }
      }
      MetadataInstance.download(where, 'DataFLow')
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
        // where: {
        //   or: ids.map(item => {
        //     return {
        //       'contextMap.dataFlowId': {
        //         like: item
        //       }
        //     }
        //   }),
        //   level: 'ERROR'
        // }
      }

      if (this.$refs.agentDialog.checkAgent()) {
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
      }
      // if (node) {
      // 	this.$refs.errorHandler.checkError(node, () => {
      // 		//启动任务时判断任务内是否存在聚合处理器，若存在，则弹框提示
      // 		if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
      // 			const h = this.$createElement;
      // 			let arr = this.$t('message.startAggregation_message').split('XXX');
      // 			this.$confirm(
      // 				h('p', [
      // 					arr[0] + '(',
      // 					h('span', { style: { color: '#409EFF' } }, node.name),
      // 					')' + arr[1]
      // 				]),
      // 				this.$t('dataFlow.importantReminder'),
      // 				{
      // 					type: 'warning',
      // 					closeOnClickModal: false
      // 				}
      // 			)
      // 				.then(() => {
      // 					//若任务内存在聚合处理器，启动前先重置
      // 					dataFlows.reset(node.id).then(() => {
      // 						this.changeStatus(ids, { status: 'scheduled' });
      // 					});
      // 				})
      // 				.catch(() => {
      // 					this.table.fetch();
      // 				});
      // 		} else {
      // 			this.changeStatus(ids, { status: 'scheduled' });
      // 		}
      // 	});
      // } else {
    },
    stop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      let message = msgObj.msg
      let title = msgObj.title
      let list = this.table.list
      for (let i = 0; i < list.length; i++) {
        let node = list[i]
        if (ids.includes(node.id)) {
          if (node.setting && !node.setting.sync_type.includes('cdc')) {
            message = this.$t('message.stopInitial_syncMessage')
            title = this.$t('dataFlow.importantReminder')
          }
          if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
            const h = this.$createElement
            let arr = this.$t('message.stopAggregation_message').split('XXX')
            message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
            title = this.$t('dataFlow.importantReminder')
          }
        }
      }
      this.$confirm(message, title, {
        type: 'warning'
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
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.changeStatus(ids, { status: 'force stopping' })
      })
    },
    del(ids, item = {}) {
      let msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
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
      dataFlows
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
      // let data = this.formSchedule.taskData;
      let data = this.formSchedule.taskData.setting || {}
      data.isSchedule = this.formSchedule.isSchedule
      data.cronExpression = this.formSchedule.cronExpression
      dataFlows
        .patchId(this.formSchedule.id, { setting: data })
        .then(result => {
          if (result && result.data) {
            this.$message.success(this.$t('message.saveOK'))
          }
        })
        .catch(() => {
          this.$message.error(this.$t('message.saveFail'))
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
      this.$router.push({
        name: 'dataflowDetails',
        params: {
          id: row.id
        }
      })
    },
    startDisabled(row) {
      const statusResult = row.statusResult || []
      const statusLength = row.statuses?.length || 0
      return (
        this.$disabledByPermission('SYNC_job_operation_all_data', row.user_id) ||
        statusResult.every(t => t.status === 'running' && t.count > 0 && t.count === statusLength)
      )
    },
    stopDisabled(data) {
      let stopData = data.filter(t => t.count > 0).find(t => ['running'].includes(t.status))
      return stopData ? false : true
    },
    resetDisabled(row) {
      const statusResult = row.statusResult || []
      const statusLength = row.statuses?.length || 0
      return (
        this.$disabledByPermission('SYNC_job_operation_all_data', row.user_id) ||
        statusResult.some(t => t.status === 'running' && t.count > 0 && t.count === statusLength)
      )
    },
    deleteDisabled(data) {
      return !data
        .filter(t => t.count > 0)
        .every(t => ['edit', 'draft', 'error', 'pause', 'not_running', 'stop'].includes(t.status))
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'dataflow',
          query: this.searchParams
        })
      }, debounce)
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
        {
          label: this.$t('task_list_execution_status'),
          key: 'executionStatus',
          type: 'select-inner',
          menuMinWidth: '250px',
          items: async () => {
            let option = ['initializing', 'cdc', 'initialized', 'Lag']
            return option.map(item => {
              return {
                label: this.$t('task_list_status_' + item),
                value: item
              }
            })
          }
        },
        {
          placeholder: this.$t('task_list_search_placeholder'),
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
          margin-left: 5px;
        }
        &.btn-createText {
          margin-left: 5px;
        }
      }
    }
    .dataflow-name {
      .tag {
        margin-left: 5px;
        color: #999999;
        background: #f5f5f5;
        border: 1px solid #dedee4;
      }
      .name {
        &:not(.has-children) {
          color: #409eff;
          cursor: pointer;
          text-decoration: underline;
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
    color: #bbb;
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
    color: #999;
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
