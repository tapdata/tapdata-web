<template>
  <component
    :is="tag"
    v-if="visible"
    class="sw-table-drawer flex flex-column"
    :visible.sync="visible"
    width="850px"
    v-loading="loading"
  >
    <header v-if="detailData" class="px-6 pt-3">
      <div class="mb-2 flex align-center">
        <span class="table-name inline-block">{{ detailData.name }}</span>
        <span v-if="swimType !== 'source'" :class="['status', 'ml-4', 'status-' + tableStatus]">{{
          statusMap[tableStatus]
        }}</span>
      </div>
      <div class="flex align-center gap-8">
        <span class="inline-flex align-center text-uppercase">
          <VIcon class="mr-1" size="18">table</VIcon> {{ $t('public_table') }}</span
        >
        <span class="inline-flex align-center">
          <VIcon class="mr-1" size="18">database</VIcon>
          <span>{{ databaseName }}</span></span
        >
        <template v-if="swimType !== 'source'">
          <span
            ><span class="table-dec-label">{{ $t('packages_business_last_data_change_time') }}：</span
            ><span class="table-dec-txt">{{ lastDataChangeTime || '-' }}</span></span
          >
          <span
            ><span class="table-dec-label">{{ $t('packages_business_cdc_delay_time') }}：</span
            ><span class="table-dec-txt">{{ cdcDelayTime || '-' }}</span></span
          >
        </template>
      </div>
    </header>
    <section class="flex-1 min-h-0 mt-1">
      <el-tabs v-model="activeName" @tab-click="handleTab" class="h-100 table-preview-tabs tabs-fill">
        <el-tab-pane :label="$t('packages_business_overview')" name="overView">
          <div class="p-4">
            <section class="bg-white rounded-lg p-3">
              <div class="mb-4">
                <span class="table-dec-label mb-4">{{ $t('public_description') }}：</span
                ><el-input
                  type="textarea"
                  row="4"
                  class="table-dec-txt mt-2"
                  v-model="detailData.description"
                  @blur="saveTableDesc"
                ></el-input>
              </div>
              <el-row>
                <el-col :span="4">
                  <div class="table-dec-label">{{ $t('packages_business_rows') }}</div>
                  <div class="table-dec-txt mt-4">{{ numOfRows || '-' }}</div>
                </el-col>
                <el-col :span="4">
                  <div class="table-dec-label">{{ $t('packages_business_columns') }}</div>
                  <div class="table-dec-txt mt-4">{{ tableFields.length }}</div>
                </el-col>
                <el-col :span="4">
                  <div class="table-dec-label">{{ $t('packages_business_storage_size') }}</div>
                  <div class="table-dec-txt mt-4">{{ storageSize || '-' }}</div>
                </el-col>
                <el-col :span="12">
                  <div class="table-dec-label">{{ $t('public_connection') }}</div>
                  <div class="table-dec-txt mt-4 flex align-center text-break" v-if="detailData">
                    <DatabaseIcon v-if="connection" class="mr-1 flex-shrink-0" :item="connection" :size="18" /><span
                      class="min-w-0"
                      >{{ detailData.connectionName }}</span
                    >
                  </div>
                </el-col>
              </el-row>
            </section>
            <section class="mt-4 bg-white rounded-lg pt-1 overflow-hidden">
              <el-tabs v-model="activeNameItems" class="tabs-fill">
                <el-tab-pane :label="$t('packages_business_columns_preview')" name="columnsPreview">
                  <VTable
                    class="discovery-page-table p-3"
                    :columns="columnsPreview"
                    :data="tableFields"
                    max-height="381px"
                    :has-pagination="false"
                  >
                    <div slot="empty">{{ $t('public_data_no_data') }}</div>
                  </VTable>
                </el-tab-pane>
                <el-tab-pane :label="$t('packages_business_sample_data')" name="sampleData">
                  <div class="p-3">
                    <VEmpty v-if="!sampleHeader.length"></VEmpty>
                    <el-table v-else :data="sampleData" v-loading="loadingSampleData" max-height="381px">
                      <el-table-column type="index" label="#"></el-table-column>
                      <el-table-column
                        v-for="(item, index) in sampleHeader"
                        :key="index"
                        :prop="item"
                        :label="item"
                        min-width="200"
                      >
                        <template #header="{ column }">
                          <span :title="column.label">{{ column.label }}</span>
                        </template>
                      </el-table-column>
                    </el-table>
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
        <el-tab-pane :label="$t('public_connection_form_schema')" name="schema">
          <div class="p-4">
            <VTable
              class="discovery-page-table rounded-lg bg-white p-3"
              :columns="columns"
              :data="tableFields"
              :has-pagination="false"
            >
              <div slot="empty">{{ $t('public_data_no_data') }}</div>
              <template #primaryKey="{ row }">
                <VIcon v-if="row.primaryKey" class="font-color-light">check</VIcon>
                <span v-else>-</span>
              </template>
              <template #foreignKey="{ row }">
                <VIcon v-if="row.foreignKey" class="font-color-light">check</VIcon>
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
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('packages_business_tasks')" name="tasks">
          <div class="p-4">
            <div class="rounded-lg bg-white p-3">
              <div class="flex align-center mb-4">
                <ElRadioGroup v-model="asTaskType" size="mini">
                  <ElRadioButton label="all">{{ $t('public_select_option_all') }}</ElRadioButton>
                  <ElRadioButton label="source">{{ $t('packages_business_as_source') }}</ElRadioButton>
                  <ElRadioButton label="target">{{ $t('packages_business_as_target') }}</ElRadioButton>
                </ElRadioGroup>
                <ElDivider class="mx-3" direction="vertical"></ElDivider>
                <span class="color-primary cursor-pointer" @click="handleCreateTask">{{
                  $t('packages_business_swimlane_tablepreview_chuangjianrenwu')
                }}</span>
              </div>
              <el-table class="discovery-page-table" :data="filterTask" :has-pagination="false">
                <el-table-column :label="$t('public_task_name')" prop="name" width="200px" show-overflow-tooltip>
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
                <el-table-column :label="$t('public_task_type')">
                  <template #default="{ row }">
                    <span>
                      {{ getTaskType(row.type) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('public_task_status')">
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
              </el-table>
            </div>
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
        <el-tab-pane :label="$t('packages_ldp_lineage')" name="lineage">
          <TableLineage
            :is-show="activeName === 'lineage'"
            :connection-id="connectionId"
            :table-name="selected.name"
            @click-task="handleClickName"
            @node-dblclick="open"
          ></TableLineage>
        </el-tab-pane>
      </el-tabs>
    </section>
  </component>
</template>

<script>
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'

import { Drawer, VTable, VEmpty } from '@tap/component'
import { calcTimeUnit, calcUnit, isNum } from '@tap/shared'
import { discoveryApi, proxyApi, taskApi, metadataInstancesApi, modulesApi } from '@tap/api'
import { TaskStatus, DatabaseIcon, TASK_TYPE_MAP } from '@tap/business'
import i18n from '@tap/i18n'
import TableLineage from './components/TableLineage'

export default {
  name: 'TablePreview',
  props: {
    tag: {
      type: String,
      default: 'Drawer'
    }
  },
  components: { Drawer, VTable, TaskStatus, VEmpty, DatabaseIcon, TableLineage },
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
      columnsPreview: [
        {
          label: i18n.t('public_name'),
          prop: 'name'
        },
        {
          label: i18n.t('public_type'),
          prop: 'dataType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc'
        }
      ],
      columns: [
        {
          label: i18n.t('public_name'),
          prop: 'name',
          className: 'text-nowrap',
          minWidth: 120
        },
        {
          label: i18n.t('public_type'),
          prop: 'dataType',
          minWidth: 120
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_zhujian'),
          slotName: 'primaryKey',
          align: 'center'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_waijian'),
          prop: 'foreignKey',
          slotName: 'foreignKey',
          align: 'center'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_suoyin'),
          prop: 'index',
          slotName: 'index',
          align: 'center'
        },
        {
          label: i18n.t('meta_table_not_null'),
          prop: 'notNull',
          slotName: 'notNull',
          align: 'center'
        },
        {
          label: i18n.t('meta_table_default'),
          prop: 'defaultValue'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumingcheng'),
          prop: 'businessName'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewuleixing'),
          prop: 'businessType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_yewumiaoshu'),
          prop: 'businessDesc'
        }
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
        normal: i18n.t('packages_business_table_status_normal') // 正常
      },
      apisColumns: [
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apifuwu'),
          prop: 'name'
        },
        {
          label: i18n.t('packages_business_data_server_list_fuwuzhuangtai'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_fangwencishu'),
          prop: 'visitCount',
          default: 0
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apIfangwen'),
          prop: 'visitLine',
          default: 0
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_apIchuanshu'),
          prop: 'transitQuantityLabel',
          default: 0
        },
        {
          label: i18n.t('packages_business_swimlane_tablepreview_zuihoufangwenshi'),
          prop: 'last_updated',
          dataType: 'time',
          width: 160
        }
      ],
      statusOptions: [
        {
          label: i18n.t('public_select_option_all'),
          value: ''
        },
        {
          label: i18n.t('modules_active'),
          value: 'active'
        },
        {
          label: i18n.t('modules_pending'),
          value: 'pending'
        },
        {
          label: i18n.t('api_monitor_total_api_list_status_generating'),
          value: 'generating'
        }
      ],
      selected: {},
      swimType: '', // source/fdm/mdm/target
      asTaskType: 'all',
      connection: null
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
      return this.taskData.filter(task => task.isAsSource)
    },
    targetTask() {
      return this.taskData.filter(task => !task.isAsSource)
    },
    databaseName() {
      if (!this.connection) return this.detailData.sourceType

      const config = this.connection.config

      if (config.uri && config.isUri !== false) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/gm.exec(
            config.uri
          )
        if (regResult && regResult.groups) {
          config.database = regResult.groups.database
        }
      }

      return config.database || config.sid || this.detailData.sourceType
    }
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
    open(row, connection, notReset) {
      console.log('open preview', row, connection) // eslint-disable-line
      !notReset && this.reset()
      this.init()
      this.visible = true
      this.swimType = row.SWIM_TYPE
      this.connectionId = row.connectionId
      this.selected = cloneDeep(row)
      this.connection = connection
      this.getTableStorage(row)
    },
    getTableStorage(row) {
      this.loading = true
      discoveryApi
        .overViewStorage(row.id)
        .then(res => {
          this.detailData = res
          this.detailData['lastUpdAt'] = this.detailData['lastUpdAt']
            ? dayjs(this.detailData['lastUpdAt']).format('YYYY-MM-DD HH:mm:ss')
            : '-'
          this.tableFields = res?.fields || []
          this.getSampleData()
          this.getTasks()
          this.getTaskStatus()
        })
        .finally(() => {
          this.loading = false
        })
    },
    getTasks() {
      let params = {
        connectionId: this.connectionId,
        tableName: this.detailData.name
      }
      taskApi.getTaskByTableName(params).then(taskList => {
        taskList.forEach(task => {
          const { dag } = task

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

            task.isAsSource = dag.nodes.some(node => {
              if (!inputsMap[node.id] && outputsMap[node.id] && node.connectionId === this.connectionId) {
                if (node.type === 'database') return true
                return node.tableName === params.tableName
              }
            })
          }
        })
        this.taskData = taskList
      })
    },
    getSampleData() {
      let params = {
        className: 'QueryDataBaseDataService',
        method: 'getData',
        args: [this.connectionId, this.detailData.name]
      }
      this.loadingSampleData = true
      proxyApi
        .call(params)
        .then(res => {
          this.sampleData = res?.sampleData
          //schema返回的数据组装数据
          this.sampleHeader = this.tableFields.map(it => it.name)
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
        description: this.detailData.description
      })
    },
    //获取表状态
    getTaskStatus() {
      taskApi.tableStatus(this.connectionId, this.detailData.name).then(res => {
        this.tableStatus = res?.status
        this.cdcDelayTime =
          isNum(res?.cdcDelayTime) && res.cdcDelayTime >= 0
            ? calcTimeUnit(res.cdcDelayTime, 2, {
                autoHideMs: true
              })
            : '-'
        this.lastDataChangeTime = res?.lastDataChangeTime
          ? dayjs(res?.lastDataChangeTime).format('YYYY-MM-DD HH:mm:ss')
          : '-'
      })
    },
    handleTab(item) {
      switch (item.name) {
        case 'apis':
          break
      }
    },
    getApisData() {
      const { connectionId, name } = this.selected || {}

      return modulesApi.apiList({ connectionId, tableName: name }).then(data => {
        return {
          total: data.total || 0,
          data:
            data.items?.map(t => {
              t.statusFmt = this.statusOptions.find(it => it.value === t.status)?.label || '-'
              t.transitQuantityLabel = calcUnit(t.transitQuantity, 1)
              return t
            }) || []
        }
      })
    },

    handleCreateTask() {
      this.$emit('create-single-task', this.selected, this.swimType)
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
      if (this.$disabledReadonlyUserBtn()) return
      let routeName

      if (!['edit', 'wait_start'].includes(row.status)) {
        routeName = row.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
      } else {
        routeName = row.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
      }

      this.openRoute({
        name: routeName,
        params: {
          id: row.id
        }
      })
    },

    reset() {
      this.activeName = 'overView'
      this.asTaskType = 'all'
    }
  }
}
</script>

<style scoped lang="scss">
.sw-table-drawer {
  ::v-deep {
    .el-tabs__nav-wrap {
      padding: 0 24px;
    }

    .table-preview-tabs > .el-tabs__content > .el-tab-pane {
      background-color: rgb(245, 248, 254);
    }

    th .cell {
      white-space: nowrap;
    }
  }

  .table-name {
    font-weight: 500;
    font-size: 20px;
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
}
</style>
