<template>
  <section class="data-flow-wrap" v-loading="restLoading">
    <TablePage
      ref="table"
      row-key="id"
      class="data-flow-list"
      :title="
        mappingTemplate === 'custom'
          ? $t('dataFlow.custom')
          : $t('dataFlow.clusterClone')
      "
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
        <ul class="search-bar">
          <li>
            <ElSelect
              v-model="searchParams.status"
              size="small"
              @input="table.fetch(1)"
            >
              <ElOption label="全部状态" value=""></ElOption>
              <ElOption
                v-for="(value, label) in statusOptions"
                :key="value"
                :label="label"
                :value="value"
              >
              </ElOption>
            </ElSelect>
          </li>
          <li>
            <el-input
              v-model="searchParams.keyword"
              clearable
              size="small"
              :placeholder="$t('dataFlow.searchPlaceholder')"
              @input="table.fetch(1, 800)"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </li>
          <li v-if="$window.getSettingByKey('DFS_TCM_PLATFORM')">
            <ElSelect
              v-model="searchParams.agentId"
              clearable
              size="small"
              :placeholder="$t('dataFlow.searchAgent')"
              @input="table.fetch(1)"
            >
              <ElOption
                v-for="opt in agentOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              ></ElOption>
            </ElSelect>
          </li>
          <!-- <li>
						<el-select
							v-model="searchParams.progress"
							size="mini"
							clearable
							:placeholder="$t('dataFlow.taskSettingPlaceholder')"
							style="width:160px"
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
							size="mini"
							clearable
							:placeholder="$t('dataFlow.executionStatus')"
							style="width:160px"
							@input="table.fetch(1)"
						>
							<el-option
								v-for="opt in ['initializing', 'cdc', 'initialized', 'Lag']"
								:key="opt"
								:label="$t('dataFlow.status.' + opt)"
								:value="opt"
							></el-option>
						</el-select>
					</li> -->
          <li>
            <ElButton class="btn-refresh" size="small" @click="table.fetch()">
              <i class="el-icon-refresh"></i>
            </ElButton>
          </li>
        </ul>
      </template>
      <div class="buttons" slot="operation">
        <el-button
          v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
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
          @command="handleCommand($event)"
          v-show="multipleSelection.length > 0 && bulkOperation"
        >
          <el-button class="btn btn-dropdowm" size="small">
            <i class="iconfont icon-piliang back-btn-icon"></i>
            <span> {{ $t('dataFlow.taskBulkOperation') }}</span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="export"
              v-readonlybtn="'SYNC_job_export'"
              v-if="!$window.getSettingByKey('HIDE_EXPORT')"
              >{{ $t('dataFlow.bulkExport') }}</el-dropdown-item
            >
            <el-dropdown-item
              command="run"
              v-readonlybtn="'SYNC_job_operation'"
              >{{ $t('dataFlow.bulkScheuled') }}</el-dropdown-item
            >
            <el-dropdown-item
              command="stop"
              v-readonlybtn="'SYNC_job_operation'"
              >{{ $t('dataFlow.bulkStopping') }}</el-dropdown-item
            >
            <el-dropdown-item command="del" v-readonlybtn="'SYNC_job_delete'">{{
              $t('dataFlow.batchDelete')
            }}</el-dropdown-item>
            <el-dropdown-item
              command="initialize"
              v-readonlybtn="'SYNC_job_operation'"
              >{{ $t('dataFlow.batchRest') }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-readonlybtn="'SYNC_Function_management'"
          size="small"
          class="btn"
          @click="handleGoFunction"
          v-if="!$window.getSettingByKey('HIDE_FUNCTION_BUTTON')"
        >
          <i class="iconfont icon-hanshu back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkFx') }}</span>
        </el-button>
        <el-button
          v-if="!$window.getSettingByKey('HIDE_IMPORT')"
          v-readonlybtn="'SYNC_job_import'"
          size="mini"
          class="btn"
          @click="handleImport"
        >
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('dataFlow.bulkImport') }}</span>
        </el-button>
        <el-button
          v-if="!$window.getSettingByKey('CREATE_DATAFLOW_BY_FORM')"
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="small"
          @click="create"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
        </el-button>
        <el-button
          v-else
          v-readonlybtn="'SYNC_job_creation'"
          class="btn btn-create"
          type="primary"
          size="small"
          @click="creatText"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
          创建任务
        </el-button>
      </div>

      <el-table-column
        type="selection"
        width="45"
        :selectable="
          row =>
            !row.hasChildren &&
            !$disabledByPermission('SYNC_job_operation_all_data', row.user_id)
        "
      >
      </el-table-column>
      <el-table-column
        v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs'"
        min-width="200"
        :label="$t('dataFlow.taskName') + '/地域'"
      >
        <template slot-scope="scope">
          <div class="task-name">{{ scope.row.name }}</div>
          <div class="region-info">{{ scope.row.regionInfo }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        min-width="200"
        :label="$t('dataFlow.taskName')"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <span class="dataflow-name">
            <span
              :class="['name', { 'has-children': scope.row.hasChildren }]"
              @click="
                scope.row.status === 'draft'
                  ? handleDetail(
                      scope.row.id,
                      'edit',
                      scope.row.mappingTemplate,
                      scope.row.hasChildren
                    )
                  : handleDetail(
                      scope.row.id,
                      'detail',
                      scope.row.mappingTemplate,
                      scope.row.hasChildren
                    )
              "
              >{{ scope.row.name }}</span
            >
            <el-tag
              v-if="scope.row.listtags && scope.row.listtags.length"
              class="tag"
              type="info"
              effect="dark"
              size="mini"
            >
              {{ scope.row.listtags[0].value }}
            </el-tag>
          </span>
          <!-- <div style="color:#ccc">
						{{
							scope.row.user
								? scope.row.user.username
									? scope.row.user.username
									: scope.row.user.email
								: ''
						}}
					</div> -->
        </template>
      </el-table-column>
      <el-table-column
        v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs'"
        prop="status"
        :label="$t('dataFlow.belongAgent')"
        width="180"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center">
            <span>{{
              scope.row.tcm &&
              (scope.row.tcm.agentName || scope.row.tcm.agentId || '-')
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="150">
        <div slot="header">
          {{ $t('dataFlow.syncType') }}
          <TableFilter
            v-model="searchParams.syncType"
            :options="syncType"
            @input="table.fetch(1)"
          ></TableFilter>
        </div>
        <template slot-scope="scope">
          <span>
            {{
              scope.row.setting && scope.row.setting.sync_type
                ? syncType[scope.row.setting.sync_type]
                : ''
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        :label="$t('dataFlow.taskStatus')"
        width="180"
      >
        <template slot-scope="scope">
          <div style="display: flex; align-items: center">
            <template v-if="statusMap[scope.row.status]">
              <img
                v-if="statusMap[scope.row.status].icon == 'loading'"
                style="width: 26px; vertical-align: middle"
                :src="$window._TAPDATA_OPTIONS_.loadingImg"
              />
              <i
                v-else
                :class="
                  'dataflow-table__icon iconfont ' +
                  statusMap[scope.row.status].icon
                "
              ></i>
            </template>
            <span>{{ scope.row.statusLabel }}</span>
            <span
              style="color: #999"
              v-if="
                !scope.row.hasChildren &&
                scope.row.statusList &&
                scope.row.statusList.length
              "
            >
              (
              <span v-for="(key, index) in scope.row.statusList" :key="key">
                {{ $t('dataFlow.status.' + key) }}
                <span v-if="index < scope.row.statusList.length - 1"
                  >&nbsp;</span
                >
              </span>
              )
            </span>
          </div>
          <div
            v-if="
              $window.getSettingByKey('DFS_TCM_PLATFORM') !== 'dfs' &&
              scope.row.status === 'running' &&
              scope.row.tcm
            "
          >
            {{ scope.row.tcm.agentName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs'"
        :label="$t('dataFlow.creatdor')"
        width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.user ? scope.row.user.username : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="startTime"
        :label="$t('dataFlow.creationTime')"
        width="170"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{
            scope.row.startTime
              ? $moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss')
              : ''
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('dataFlow.operate')"
        width="250"
        fixed="right"
      >
        <template slot-scope="scope">
          <div class="table-operations" v-if="!scope.row.hasChildren">
            <el-tooltip
              v-if="!['running', 'stopping'].includes(scope.row.status)"
              effect="dark"
              :content="$t('dataFlow.draftNotStart')"
              :manual="
                !(scope.row.status === 'draft' && scope.row.checked === false)
              "
              placement="top-start"
            >
              <span>
                <ElLink
                  v-readonlybtn="'SYNC_job_operation'"
                  type="primary"
                  :disabled="
                    $disabledByPermission(
                      'SYNC_job_operation_all_data',
                      scope.row.user_id
                    ) ||
                    !statusBtMap['run'][scope.row.status] ||
                    (scope.row.status === 'draft' &&
                      scope.row.checked === false)
                  "
                  @click="run([scope.row.id], scope.row)"
                >
                  {{ $t('dataFlow.run') }}
                </ElLink>
              </span>
            </el-tooltip>
            <ElLink
              v-if="scope.row.status === 'running'"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="
                $disabledByPermission(
                  'SYNC_job_operation_all_data',
                  scope.row.user_id
                ) || !statusBtMap['stop'][scope.row.status]
              "
              @click="stop([scope.row.id])"
              >{{ $t('dataFlow.stop') }}</ElLink
            >
            <ElLink
              v-if="scope.row.status === 'stopping'"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="
                $disabledByPermission(
                  'SYNC_job_operation_all_data',
                  scope.row.user_id
                ) || !statusBtMap['forceStop'][scope.row.status]
              "
              @click="forceStop([scope.row.id])"
            >
              {{ $t('dataFlow.button.force_stop') }}
            </ElLink>
            <ElLink
              style="margin-left: 10px"
              type="primary"
              @click="
                handleDetail(
                  scope.row.id,
                  'detail',
                  scope.row.mappingTemplate,
                  scope.row.hasChildren
                )
              "
            >
              {{ $t('dataFlow.runningMonitor') }}
            </ElLink>
            <ElLink
              v-readonlybtn="'SYNC_job_edition'"
              style="margin-left: 10px"
              type="primary"
              :disabled="
                $disabledByPermission(
                  'SYNC_job_edition_all_data',
                  scope.row.user_id
                ) || !statusBtMap['edit'][scope.row.status]
              "
              @click="
                handleDetail(
                  scope.row.id,
                  'edit',
                  scope.row.mappingTemplate,
                  scope.row.hasChildren
                )
              "
            >
              {{ $t('button.edit') }}
            </ElLink>
            <ElLink
              v-if="!$window.getSettingByKey('HIDE_SCHEDULE')"
              v-readonlybtn="'SYNC_job_edition'"
              style="margin-left: 10px"
              type="primary"
              :disabled="
                $disabledByPermission(
                  'SYNC_job_edition_all_data',
                  scope.row.user_id
                ) ||
                scope.row.setting.sync_type !== 'initial_sync' ||
                scope.row.status === 'running'
              "
              @click="handleTaskscheduling(scope.row.id, scope.row)"
            >
              {{ $t('dataFlow.schedule') }}
            </ElLink>
            <el-dropdown
              v-show="moreAuthority"
              size="small"
              style="margin-left: 10px"
              @command="handleCommand($event, scope.row)"
            >
              <ElLink type="primary">
                {{ $t('button.more') }}
                <i class="el-icon-arrow-down"></i>
              </ElLink>
              <el-dropdown-menu
                class="dataflow-table-more-dropdown-menu"
                slot="dropdown"
              >
                <el-dropdown-item
                  command="validate"
                  v-readonlybtn="'Data_verify'"
                  >{{ $t('dataVerify.dataVerify') }}</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="!$window.getSettingByKey('HIDE_EXPORT')"
                  command="export"
                  v-readonlybtn="'SYNC_job_export'"
                  >{{ $t('dataFlow.dataFlowExport') }}</el-dropdown-item
                >
                <el-dropdown-item
                  command="copy"
                  v-readonlybtn="'SYNC_job_creation'"
                  >{{ $t('dataFlow.copy') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="
                    $disabledByPermission(
                      'SYNC_job_operation_all_data',
                      scope.row.user_id
                    ) || !statusBtMap['reset'][scope.row.status]
                  "
                  command="initialize"
                  v-readonlybtn="'SYNC_job_operation'"
                >
                  {{ $t('dataFlow.button.reset') }}
                </el-dropdown-item>
                <el-dropdown-item
                  command="setTag"
                  v-if="$window.getSettingByKey('SHOW_CLASSIFY')"
                  v-readonlybtn="'SYNC_category_application'"
                >
                  {{ $t('dataFlow.addTag') }}
                </el-dropdown-item>
                <el-dropdown-item
                  class="btn-delete"
                  command="del"
                  :disabled="
                    $disabledByPermission(
                      'SYNC_job_delete_all_data',
                      scope.row.user_id
                    ) || !statusBtMap['delete'][scope.row.status]
                  "
                  v-readonlybtn="'SYNC_job_delete'"
                >
                  {{ $t('button.delete') }}
                </el-dropdown-item>
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
        <el-form-item
          :label="$t('dialog.jobSchedule.expression')"
          v-if="formSchedule.isSchedule"
        >
          <el-input
            v-model="formSchedule.cronExpression"
            :placeholder="$t('dialog.jobSchedule.expressionPlaceholder')"
          >
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
        <el-button @click="taskSettingsDialog = false">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="saveTaskSetting">{{
          $t('app.save')
        }}</el-button>
      </span>
    </el-dialog>
    <DownAgent ref="agentDialog" type="taskRunning"></DownAgent>
    <SkipError ref="errorHandler" @skip="skipHandler"></SkipError>
  </section>
</template>

<script>
import factory from '../../api/factory'
import ws from '../../api/ws'
const dataFlows = factory('DataFlows')
const MetadataInstance = factory('MetadataInstances')
// const cluster = factory('cluster');
import { toRegExp } from '../../utils/util'
import SkipError from '../../components/SkipError'
import DownAgent from '../downAgent/agentDown'
import TablePage from '@/components/TablePage'
import TableFilter from '@/components/TableFilter'

let interval = null
export default {
  components: { TablePage, TableFilter, DownAgent, SkipError },
  data() {
    return {
      restLoading: false,
      mappingTemplate: '',
      searchParams: {
        keyword: '',
        status: '',
        progress: '',
        executionStatus: '',
        timeData: '',
        syncType: '',
        agentId: ''
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
      statusMap: {
        running: {
          label: this.$t('dataFlow.status.running'),
          icon: 'icon-yunhangzhong'
        },
        paused: {
          label: this.$t('dataFlow.status.draft'),
          icon: 'icon-daiqidong'
        },
        error: {
          label: this.$t('dataFlow.status.error'),
          icon: 'icon-yichang'
        },
        draft: {
          label: this.$t('dataFlow.status.draft'),
          icon: 'icon-daiqidong'
        },
        scheduled: {
          label: this.$t('dataFlow.status.scheduled'),
          icon: 'loading'
        },
        stopping: {
          label: this.$t('dataFlow.status.stopping'),
          icon: 'loading'
        },
        'force stopping': {
          label: this.$t('dataFlow.status.force_stopping'),
          icon: 'loading'
        }
      },
      agentOptions: [],

      multipleSelection: [],

      taskSettingsDialog: false, //任务调度设置弹窗开关

      syncType: {
        initial_sync: this.$t('dataFlow.initial_sync'),
        cdc: this.$t('dataFlow.cdc'),
        'initial_sync+cdc':
          this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc')
      },
      statusBtMap: {
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true }
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
      bulkOperation:
        this.$has('SYNC_job_export') ||
        this.$has('SYNC_job_operation') ||
        this.$has('SYNC_job_delete'),
      timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week', 'year'],
      tempList: []
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    statusOptions() {
      let options = {}
      let map = this.statusMap
      for (const key in map) {
        const item = map[key]
        let value = key
        if (options[item.label]) {
          value = options[item.label] + ',' + value
        }
        options[item.label] = value
      }
      return options
    }
  },
  created() {
    // window.windows = [];
    this.mappingTemplate = this.$route.query.mapping
    this.searchParams.agentId = this.$route.query.agentId
    this.searchParams.status = this.$route.query.status
    ws.on('watch', this.dataflowChange)
    interval = setInterval(() => {
      let tempList = this.tempList
      tempList.forEach(item => {
        let list = this.table.list
        let index = list.findIndex(it => it.name === item.name)
        if (index >= 0) {
          this.table.$set(
            list,
            index,
            Object.assign(list[index], this.cookRecord(item))
          )
        }
      })
      this.tempList = []
    }, 5000)
    this.getAgentOptions()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  beforeDestroy() {
    ws.off('watch', this.dataflowChange)
    clearInterval(interval)
  },
  watch: {
    '$route.query'(query) {
      this.mappingTemplate = query.mapping
      this.table.fetch(1)
    }
  },
  methods: {
    getAgentOptions() {
      this.$api('tcm')
        .getAgent()
        .then(res => {
          let list = res.data && res.data.items ? res.data.items : []
          this.agentOptions = list.map(item => {
            return {
              label: item.name,
              value: item.tmInfo.agentId
            }
          })
        })
    },
    dataflowChange(data) {
      if (data && data.data && data.data.fullDocument) {
        let dataflow = data.data.fullDocument
        if (dataflow.agentId) {
          let opt = this.agentOptions.find(it => it.value === dataflow.agentId)
          dataflow.tcm = {
            agentName: opt?.label
          }
        }
        this.tempList.push(data.data.fullDocument)
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
            'fullDocument.createTime': true,
            'fullDocument.children': true,
            'fullDocument.stats': true,
            'fullDocument.stages.id': true,
            'fullDocument.stages.name': true,
            'fullDocument.errorEvents': true,
            'fullDocument.agentId': true
          }
        }
      }
      ws.ready(() => {
        ws.send(msg)
      }, true)
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
      this.table.fetch(1)
    },
    getData({ page, tags }) {
      let region = this.$route.query.region
      let { current, size } = page
      let {
        keyword,
        status,
        progress,
        executionStatus,
        timeData,
        syncType,
        agentId
      } = this.searchParams

      let where = {
        mappingTemplate: this.mappingTemplate
      }
      let fields = {
        id: true,
        name: true,
        status: true,
        executeMode: true,
        category: true,
        stopOnError: true,
        last_updated: true,
        createTime: true,
        children: true,
        stats: true,
        checked: true,
        stages: true,
        setting: true,
        user_id: true,
        startTime: true,
        listtags: true,
        mappingTemplate: true,
        platformInfo: true,
        agentId: true
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
      syncType && (where['setting.sync_type'] = syncType)
      if (executionStatus) {
        if (executionStatus === 'Lag') {
          where['stats.stagesMetrics.replicationLag'] = {
            gt: 0
          }
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
      progress && (where['setting.sync_type'] = progress)
      let filter = {
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        this.$api('DataFlows').count({ where: JSON.stringify(where) }),
        this.$api('DataFlows').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        let list = res.data || []
        this.watchDataflowList(list.map(it => it.id))
        this.table.setCache({
          keyword,
          status,
          progress,
          executionStatus,
          timeData
        })
        return {
          total: countRes.data.count,
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
      item.statusLabel = this.statusMap[item.status].label
      // let statusMap = {}
      // let getLag = (lag) => {
      //   let r = '0s'
      //   if (lag) {
      //     let m = this.$moment.duration(lag, 'seconds')
      //     if (m.days()) {
      //       r = m.days() + 'd'
      //     } else if (m.hours()) {
      //       r = m.hours() + 'h'
      //     } else if (m.minutes()) {
      //       r = m.minutes() + 'm'
      //     } else {
      //       r = lag + 's'
      //     }
      //   }
      //   return r
      // }
      if (item.stats && window.getSettingByKey('DFS_TCM_PLATFORM') !== 'drs') {
        item.hasChildren = false
        // let children = item.stages
        item.children = []
        // if (children) {
        //   let finishedCount = 0
        //   children.forEach((k) => {
        //     let stage = ''
        //     let node = {}
        //     if (item.stats.stagesMetrics) {
        //       stage = item.stats.stagesMetrics.filter((v) => k.id === v.stageId)
        //     }
        //     if (!stage.length) {
        //       node = {
        //         id: item.id + k.id,
        //         name: k.name,
        //         input: '--',
        //         output: '--',
        //         transmissionTime: '--',
        //         hasChildren: true,
        //         statusLabel: '--'
        //       }
        //     } else {
        //       let stg = stage[0]
        //       let statusLabel = stg.status
        //         ? this.$t('dataFlow.status.' + stg.status)
        //         : '--'
        //       if (stg.status === 'cdc') {
        //         let lag = `(${this.$t('dataFlow.lag')}${getLag(
        //           stg.replicationLag
        //         )})`
        //         statusLabel += lag
        //         statusMap.cdc = true
        //       }
        //       if (stg.status === 'initializing') {
        //         statusMap.initializing = true
        //       }
        //       if (stg.status === 'initialized') {
        //         finishedCount += 1
        //       }
        //       node = {
        //         id: item.id + k.id,
        //         name: k.name,
        //         input: stg.input.rows,
        //         output: stg.output.rows,
        //         transmissionTime: stg.transmissionTime,
        //         hasChildren: true,
        //         statusLabel
        //       }
        //     }
        //     item.children.push(node)
        //   })
        //   if (finishedCount && !statusMap.cdc && !statusMap.initializing) {
        //     statusMap.initialized = true
        //   }
        //   let statusList = []
        //   for (const key in statusMap) {
        //     statusList.push(key)
        //   }
        //   item.statusList = statusList
        // }
      }
      return item
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
      dataFlows.batchUpdateListtags(attributes).then(() => {
        this.dataFlowId = ''
        this.table.fetch()
      })
    },
    create() {
      let routeUrl = this.$router.resolve({
        path: '/job',
        query: { mapping: this.mappingTemplate }
      })
      window.open(routeUrl.href, '_blank')
      // window.windows.push(window.open(routeUrl.href, '_blank'));
      // window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
    },
    async creatText() {
      this.$router.push({
        path: '/createTask/create'
      })
    },
    handleDetail(id, type, mappingTemplate, hasChildren) {
      // 子选项 hasChildren 为 true
      if (hasChildren) {
        return
      }
      const h = this.$createElement
      if (type === 'edit') {
        this.$confirm(
          h('p', null, [
            h('span', null, this.$t('dataFlow.modifyEditText')),
            h(
              'span',
              { style: 'color: #48b6e2' },
              this.$t('dataFlow.nodeLayoutProcess')
            ),
            h('span', null, '、'),
            h(
              'span',
              { style: 'color: #48b6e2' },
              this.$t('dataFlow.nodeAttributes')
            ),
            h('span', null, '、'),
            h(
              'span',
              { style: 'color: #48b6e2' },
              this.$t('dataFlow.matchingRelationship')
            ),
            h('span', null, '，'),
            h('span', null, this.$t('dataFlow.afterSubmission')),
            h('span', { style: 'color: #48b6e2' }, this.$t('dataFlow.reset')),
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
          if (window.getSettingByKey('CREATE_DATAFLOW_BY_FORM')) {
            this.$router.push({
              path: '/createTask/' + id + '/edit'
            })
            return
          }
          let routeUrl = this.$router.resolve({
            path: '/job',
            query: { id: id, mapping: mappingTemplate }
          })
          setTimeout(() => {
            document.querySelectorAll('.el-tooltip__popper').forEach(it => {
              it.outerHTML = ''
            })
            window.open(routeUrl.href, 'edit_' + id)
            // window.windows.push(window.open(routeUrl.href, 'edit_' + id));
            // window.windows[window.windows.length - 1].tempKeys = this.getTempKeys();
          }, 200)
        })
      } else {
        if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'drs') {
          window.open(
            `${
              location.href.split('/tm/')[0]
            }/#/monitor?id=${id}&isMoniting=true&mapping=${mappingTemplate}`,
            'monitor_' + id
          )
        } else {
          let routeUrl = this.$router.resolve({
            path: '/job',
            query: { id: id, isMoniting: true, mapping: mappingTemplate }
          })
          window.open(routeUrl.href, 'monitor_' + id)
        }
      }
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
    run(ids) {
      if (this.$refs.agentDialog.checkAgent()) {
        // if (node) {
        // 	this.$refs.errorHandler.checkError(node, () => {
        // 		//启动任务时判断任务内是否存在聚合处理器，若存在，则弹框提示
        // 		if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
        // 			const h = this.$createElement;
        // 			let arr = this.$t('message.startAggregation_message').split('XXX');
        // 			this.$confirm(
        // 				h('p', [
        // 					arr[0] + '(',
        // 					h('span', { style: { color: '#48b6e2' } }, node.name),
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
        this.changeStatus(ids, { status: 'scheduled' })
        // }
      }
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
          if (
            node.stages &&
            node.stages.find(s => s.type === 'aggregation_processor')
          ) {
            const h = this.$createElement
            let arr = this.$t('message.stopAggregation_message').split('XXX')
            message = h('p', [
              arr[0] + '(',
              h('span', { style: { color: '#48b6e2' } }, node.name),
              ')' + arr[1]
            ])
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
        this.changeStatus(ids, { status: 'stopping' })
      })
    },
    forceStop(ids, item = {}) {
      let msgObj = this.getConfirmMessage(
        'force_stop',
        ids.length > 1,
        item.name
      )
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
      let where = {
        _id: {
          inq: ids
        }
      }
      let msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        dataFlows.deleteAll(where).then(res => {
          if (res.data && res.data.success) {
            this.table.fetch()
            this.responseHandler(res.data, this.$t('message.deleteOK'))
          } else if (res.data && res.data.fail) {
            this.$message.info(this.$t('message.deleteFail'))
          }
        })
      })
    },
    initialize(ids, item = {}) {
      let msgObj = this.getConfirmMessage(
        'initialize',
        ids.length > 1,
        item.name
      )
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.restLoading = true
        dataFlows
          .resetAll(ids)
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
      dataFlows
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
      dataFlows.update(where, attributes).then(res => {
        this.table.fetch()
        this.responseHandler(res.data, this.$t('message.operationSuccuess'))
      })
    },
    skipHandler(id, errorEvents) {
      this.changeStatus([id], { status: 'scheduled', errorEvents })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
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
              }</span> : <span style="color: #F56C6C">${
                msgMapping[item.code]
              }</span></div>`
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
      this.formSchedule.isSchedule = data.setting.isSchedule
      this.formSchedule.cronExpression = data.setting.cronExpression
      this.formSchedule.taskData = data
    },
    // 任务调度设置保存
    saveTaskSetting() {
      // let data = this.formSchedule.taskData;
      let data = this.formSchedule.taskData.setting
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
      top.location.href = '/#/JsFuncs'
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
          color: #48b6e2;
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
    .task-name {
      color: #333;
    }
    .region-info {
      line-height: 20px;
      color: #aaa;
    }
    .table-operations {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
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
