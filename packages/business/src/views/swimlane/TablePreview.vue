<template>
  <component :is="tag" v-if="visible" class="sw-table-drawer" :visible.sync="visible" width="850px" v-loading="loading">
    <header v-if="detailData">
      <div class="mb-4">
        <span class="table-name inline-block">{{ detailData.name }}</span>
        <span :class="['status', 'ml-4', 'status-' + tableStatus]">{{ statusMap[tableStatus] }}</span>
      </div>
      <span class="mr-2">
        <VIcon class="tree-item-icon" size="18">table</VIcon> <span class="table-dec-txt">Table</span></span
      >
      <span class="ml-8">
        <span>{{ detailData.sourceType }}</span></span
      >
      <span class="ml-8"
        ><span class="table-dec-label">数据最后更新时间：</span
        ><span class="table-dec-txt">{{ lastDataChangeTime || '-' }}</span></span
      >
      <span class="ml-8"
        ><span class="table-dec-label">增量数据延迟：</span
        ><span class="table-dec-txt">{{ cdcDelayTime || '-' }}</span></span
      >
    </header>
    <section class="mt-6">
      <el-tabs v-model="activeName" @tab-click="handleTab">
        <el-tab-pane label="OverView" name="overView">
          <section class="mt-2">
            <div class="mb-4">
              <span class="table-dec-label mb-4">Table Description：</span
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
                <div class="table-dec-label">Rows</div>
                <div class="table-dec-txt mt-4">{{ numOfRows || '-' }}</div>
              </el-col>
              <el-col :span="4">
                <div class="table-dec-label">Columns</div>
                <div class="table-dec-txt mt-4">{{ tableFields.length }}</div>
              </el-col>
              <el-col :span="4">
                <div class="table-dec-label">Storage Size</div>
                <div class="table-dec-txt mt-4">{{ storageSize || '-' }}</div>
              </el-col>
              <el-col :span="6">
                <div class="table-dec-label">Connection</div>
                <div class="table-dec-txt mt-4" v-if="detailData">{{ detailData.connectionName }}</div>
              </el-col>
            </el-row>
          </section>
          <section class="mt-6">
            <el-tabs v-model="activeNameItems">
              <el-tab-pane label="Columns Preview" name="columnsPreview">
                <VTable
                  class="discovery-page-table"
                  :columns="columnsPreview"
                  :data="tableFields"
                  max-height="381px"
                  :has-pagination="false"
                >
                  <div slot="empty">{{ $t('public_data_no_data') }}</div>
                </VTable>
              </el-tab-pane>
              <el-tab-pane label="Sample Data" name="sampleData">
                <VEmpty v-if="!sampleHeader.length"></VEmpty>
                <el-table v-else :data="sampleData" v-loading="loadingSampleData" max-height="381px">
                  <el-table-column type="index" label="#"></el-table-column>
                  <el-table-column v-for="(item, index) in sampleHeader" :key="index" :prop="item" :label="item">
                  </el-table-column> </el-table
              ></el-tab-pane>
            </el-tabs>
          </section>
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
        <el-tab-pane label="Schema" name="schema">
          <VTable class="discovery-page-table" :columns="columns" :data="tableFields" :has-pagination="false">
            <div slot="empty">{{ $t('public_data_no_data') }}</div>
          </VTable>
        </el-tab-pane>
        <el-tab-pane label="Tasks" name="tasks">
          <div class="flex justify-content-between mb-4">
            <span>以这个模型源/目标的任务</span
            ><span class="color-primary cursor-pointer" @click="handleCreateTask">Create Task</span>
          </div>
          <el-table class="discovery-page-table" :data="taskData" :has-pagination="false">
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
        </el-tab-pane>
        <el-tab-pane label="APIs" name="apis">
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
        </el-tab-pane>
        <!--        <el-tab-pane label="Lineage" name="lineage">APIs</el-tab-pane>-->
      </el-tabs>
    </section>
  </component>
</template>

<script>
import { cloneDeep } from 'lodash'

import { Drawer, VTable, VEmpty } from '@tap/component'
import { calcUnit } from '@tap/shared'
import { discoveryApi, proxyApi, taskApi, metadataInstancesApi, modulesApi } from '@tap/api'
import i18n from '@/i18n'
import dayjs from 'dayjs'
import { TaskStatus } from '../../components'
import { TASK_TYPE_MAP } from '../../shared'

export default {
  name: 'TablePreview',
  props: {
    tag: {
      type: String,
      default: 'Drawer'
    }
  },
  components: { Drawer, VTable, TaskStatus, VEmpty },
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
          prop: 'dataType'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_zhujian'),
          prop: 'primaryKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_waijian'),
          prop: 'foreignKey'
        },
        {
          label: i18n.t('datadiscovery_previewdrawer_suoyin'),
          prop: 'index'
        },
        {
          label: i18n.t('meta_table_not_null'),
          prop: 'notNull'
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
        error: i18n.t('public_status_error'),
        draft: i18n.t('public_status_wait_run'),
        normal: i18n.t('public_status_renew_normal')
      },
      apisColumns: [
        {
          label: 'api服务名称',
          prop: 'name'
        },
        {
          label: '服务状态',
          prop: 'status',
          slotName: 'status'
        },
        {
          label: '访问次数',
          prop: 'visitCount',
          default: 0
        },
        {
          label: 'API访问行数',
          prop: 'visitLine',
          default: 0
        },
        {
          label: 'API传输总量',
          prop: 'transitQuantityLabel',
          default: 0
        },
        {
          label: '最后访问时间',
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
      selected: {}
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
    open(row) {
      this.init()
      this.visible = true
      this.connectionId = row.connectionId
      this.selected = cloneDeep(row)
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
      taskApi.getTaskByTableName(params).then(res => {
        this.taskData = res
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
          this.sampleHeader = Object.keys(this.sampleData.reduce((o, c) => Object.assign(0, c))) || []
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
        this.cdcDelayTime = res?.cdcDelayTime || '-'
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
      this.$router.push({
        name: 'MigrateCreate'
      })
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
    }
  }
}
</script>

<style scoped lang="scss">
.sw-table-drawer {
  padding: 24px;
  .table-name {
    font-weight: 500;
    font-size: 32px;
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
