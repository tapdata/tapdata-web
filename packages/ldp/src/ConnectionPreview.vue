<script>
import { taskApi } from '@tap/api'
import {
  CONNECTION_STATUS_MAP,
  CONNECTION_TYPE_MAP,
  SchemaProgress,
  TaskStatus,
} from '@tap/business'
import { Drawer } from '@tap/component'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

export default {
  name: 'ConnectionPreview',
  components: { Drawer, SchemaProgress, TaskStatus },
  props: ['connectionId'],
  data() {
    return {
      visible: false,
      viewData: null,
      taskData: [],
      taskType: {
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc'),
        'initial_sync+cdc': this.$t('public_task_type_initial_sync_and_cdc'),
      },
      asTaskType: 'all',
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
      return this.taskData.filter((task) =>
        task.sourceConnectionIds.includes(this.viewData.id),
      )
    },
    targetTask() {
      return this.taskData.filter((task) =>
        task.targetConnectionIds.includes(this.viewData.id),
      )
    },
    databaseName() {
      if (!this.viewData) return

      const config = this.viewData.config

      if (config.uri && config.isUri !== false) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
            config.uri,
          )
        if (regResult && regResult.groups) {
          config.database = regResult.groups.database
        }
      }

      return config.database || config.sid
    },
  },
  methods: {
    open(connection) {
      this.visible = true
      this.viewData = connection
      //组装数据
      this.getTasks()
      const data = cloneDeep(this.viewData)
      const { config } = data
      config.username = config.user || config.username
      config.additionalString = config.extParams || config.addtionalString

      if (config.uri && config.isUri !== false) {
        const regResult =
          /mongodb:\/\/(?:(?<username>[^:/?#[\]@]+)(?::(?<password>[^:/?#[\]@]+))?@)?(?<host>[\w.-]+(?::\d+)?(?:,[\w.-]+(?::\d+)?)*)(?:\/(?<database>[\w.-]+))?(?:\?(?<query>[\w.-]+=[\w.-]+(?:&[\w.-]+=[\w.-]+)*))?/.exec(
            config.uri,
          )
        if (regResult && regResult.groups) {
          const hostArr = regResult.groups.host.split(':')
          config.host = hostArr[0]
          config.port = hostArr[1]
          config.database = regResult.groups.database
          config.username = regResult.groups.username
          config.additionalString = regResult.groups.query
        }
      }
      data.last_updated = dayjs(connection.last_updated).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      data.createTime = dayjs(connection.createTime).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      data.loadSchemaTime = dayjs(connection.loadSchemaTime).format(
        'YYYY-MM-DD HH:mm:ss',
      )
      this.viewData = data
      this.reset()
    },
    edit() {
      const { id, pdkHash, definitionPdkId: pdkId } = this.viewData
      this.$router.push({
        name: 'connectionsEdit',
        params: {
          id,
        },
        query: {
          pdkHash,
          pdkId,
        },
      })
    },
    isFileSource(database_type) {
      return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(database_type)
    },
    getStatus(status) {
      return CONNECTION_STATUS_MAP[status]?.text || '-'
    },
    getType(type) {
      return CONNECTION_TYPE_MAP[type]?.text || '-'
    },
    getTasks() {
      const params = {
        connectionId: this.viewData.id,
        tableName: null,
      }
      taskApi.getTaskByTableName(params).then((taskList) => {
        taskList.forEach((task) => {
          const { dag } = task
          const sourceConnectionIds = []
          const targetConnectionIds = []
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

            dag.nodes.forEach((node) => {
              if (
                !inputsMap[node.id] &&
                outputsMap[node.id] &&
                node.connectionId
              ) {
                sourceConnectionIds.push(node.connectionId)
              } else if (
                inputsMap[node.id] &&
                !outputsMap[node.id] &&
                node.connectionId
              ) {
                targetConnectionIds.push(node.connectionId)
              }
            })
          }
          task.sourceConnectionIds = sourceConnectionIds
          task.targetConnectionIds = targetConnectionIds
        })
        this.taskData = taskList
      })
    },
    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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
    reset() {
      this.asTaskType = 'all'
    },
  },
}
</script>

<template>
  <Drawer
    v-model="visible"
    class="sw-connection-drawer"
    width="850px"
    :with-header="false"
  >
    <section v-if="viewData">
      <header class="mt-4">
        <div class="flex justify-content-between">
          <div class="connection-name mb-2 ellipsis">{{ viewData.name }}</div>
          <div class="flex justify-content-end">
            <!--<el-button  type="primary">加载Schema</el-button>-->
            <el-button @click="edit">{{ $t('public_button_edit') }}</el-button>
            <!--<el-button >测试连接</el-button>-->
          </div>
        </div>
        <div class="color-info mb-4">
          {{ getType(viewData.connection_type) }}
          <span
            :class="[
              `status-connection-${viewData.status}`,
              'status-block',
              'ml-4',
            ]"
          >
            {{ getStatus(viewData.status) }}
          </span>
        </div>
      </header>
      <section class="basics-info">
        <el-row
          type="flex"
          class="flex-wrap"
          :gutter="16"
          style="row-gap: 16px"
        >
          <el-col :span="8">
            <span class="table-dec-label"
              >{{ $t('packages_business_table_count') }} :
            </span>
            <span>{{ viewData.tableCount }}</span>
          </el-col>
          <el-col :span="8">
            <span class="table-dec-label"
              >{{ $t('packages_business_model_update_time') }} :</span
            >
            <span>{{ viewData.loadSchemaTime }}</span>
          </el-col>
          <el-col :span="8">
            <span class="table-dec-label"
              >{{ $t('public_create_time') }} :
            </span>
            <span>{{ viewData.createTime }}</span>
          </el-col>

          <el-col :span="8">
            <span class="table-dec-label"
              >{{ $t('public_change_time') }} :
            </span>
            <span>{{ viewData.last_updated }}</span>
          </el-col>
          <el-col :span="8" class="flex items-center">
            <span class="table-dec-label"
              >{{ $t('public_connection_schema_status') }} :
            </span>
            <span v-if="isFileSource(viewData.database_type)">-</span>
            <span v-else>
              <SchemaProgress :data="viewData" />
            </span>
          </el-col>
        </el-row>
      </section>
      <section v-if="viewData.config" class="detailed-info">
        <el-row
          type="flex"
          class="flex-wrap"
          :gutter="16"
          style="row-gap: 16px"
        >
          <el-col :span="8">
            <span class="table-dec-label inline-block"
              >{{ $t('public_connection_form_database_address') }}：</span
            >
            <span>{{ viewData.config.host || viewData.config.uri }}</span>
          </el-col>
          <el-col :span="8">
            <span class="table-dec-label inline-block"
              >{{ $t('public_connection_form_host') }}：</span
            >
            <span>{{ viewData.config.port || '-' }}</span>
          </el-col>
          <el-col :span="8"
            ><span class="table-dec-label inline-block"
              >{{ $t('public_connection_form_database_name') }}：</span
            ><span>{{ viewData.config.database || '-' }}</span></el-col
          >
          <el-col :span="8"
            ><span class="table-dec-label inline-block"
              >{{ $t('public_connection_form_schema') }}：</span
            ><span>{{ viewData.config.schema || '-' }}</span></el-col
          >
          <el-col :span="8"
            ><span class="table-dec-label inline-block"
              >{{
                $t('public_connection_form_other_connection_string')
              }}：</span
            ><span>{{ viewData.config.additionalString || '-' }}</span></el-col
          >
          <el-col :span="8"
            ><span class="table-dec-label inline-block"
              >{{ $t('public_connection_form_time_zone_of_time_type') }}：</span
            ><span>{{ viewData.config.timezone || '-' }}</span></el-col
          >
        </el-row>
      </section>
      <section class="table-info mt-4">
        <header class="header flex align-center mb-4">
          <div class="table-info-name">{{ $t('packages_business_tasks') }}</div>
          <ElDivider class="mx-3" direction="vertical" />
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
          <!--<el-button type="primary" >新建</el-button>-->
        </header>
        <el-table
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
          <el-table-column :label="$t('public_task_type')">
            <template #default="{ row }">
              <span>
                {{ row.type ? taskType[row.type] : '' }}
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
      </section>
    </section>
  </Drawer>
</template>

<style lang="scss" scoped>
.sw-connection-drawer {
  padding: 24px;
  .connection-name {
    font-weight: 500;
    font-size: 20px;
    color: #1d2129;
  }
  .basics-info {
    padding: 16px 0;
    border-bottom: 1px solid map.get($borderColor, normal);
    border-top: 1px solid map.get($borderColor, normal);

    .el-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  .table-dec-label {
    font-weight: 400;
    color: #535f72;
  }
  .table-dec-txt {
    font-weight: 400;
    color: #1d2129;
  }
  .detailed-info {
    border-bottom: 1px solid map.get($borderColor, normal);
    padding: 16px 0;
    .label {
      width: 150px;
    }
    .el-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  .table-info {
    .table-info-name {
      font-weight: 500;
      font-size: 16px;
      color: #1d2129;
    }
  }
}
</style>
