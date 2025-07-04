<script>
import { logcollectorApi, taskApi } from '@tap/api'
import { VTable } from '@tap/component/src/base/v-table'
import { FilterBar } from '@tap/component/src/filter-bar'
import i18n from '@tap/i18n'
import { calcTimeUnit, openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'

import PageContainer from '../../components/PageContainer.vue'
import TablePage from '../../components/TablePage.vue'
import TaskStatus from '../../components/TaskStatus.vue'
import { makeStatusAndDisabled } from '../../shared'
import Editor from './Editor.vue'

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    TaskStatus,
    Editor,
    VTable,
  },
  inject: ['buried'],
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: '',
      },
      filterItems: [
        {
          placeholder: this.$t(
            'packages_business_shared_cdc_placeholder_task_name',
          ),
          key: 'taskName',
          type: 'input',
          width: 220,
        },
        {
          placeholder: this.$t(
            'packages_business_shared_cdc_placeholder_connection_name',
          ),
          key: 'connectionName',
          type: 'input',
        },
      ],
      order: 'createTime DESC',
      list: null,
      settingDialogVisible: false,
      loadingConfig: false,
      digSettingForm: {
        persistenceMode: 'Mem', // 存储模式
        persistenceMongodb_uri_db: '', // mongodb uri
        persistenceMongodb_collection: '', // mongodb tablename
        persistenceRocksdb_path: '', // rocksdb路径
        share_cdc_ttl_day: 3,
      },
      enumsItems: ['Mem', 'MongoDB', 'RocksDB'],
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      showEditSettingBtn: false, //禁用
      rules: {
        persistenceMongodb_uri_db: [
          {
            required: true,
            message: this.$t(
              'packages_business_shared_cdc_setting_select_mongodb_tip',
            ),
            trigger: 'blur',
          },
        ],
        persistenceMongodb_collection: [
          {
            required: true,
            message: this.$t(
              'packages_business_shared_cdc_setting_select_table_tip',
            ),
            trigger: 'blur',
          },
        ],
      },
      taskBuried: {
        start: 'sharedMiningStart',
      },
      showUsingTaskDialog: {
        visible: false,
        list: [],
      },
      taskColumns: [
        {
          label: i18n.t('public_task_name'),
          prop: 'name',
          slotName: 'name',
        },
      ],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },

    systemTimeZone() {
      const timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = `+${-timeZone}`
      }
      return systemTimeZone
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },
  mounted() {
    //定时轮询
    this.timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.searchParams = Object.assign(this.searchParams, {
      taskName: this.$route.query?.keyword || '',
    })
  },
  beforeUnmount() {
    clearInterval(this.timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      const { current, size } = page
      const { taskName, connectionName } = this.searchParams
      const where = {}

      if (taskName) {
        where.name = { like: escapeRegExp(taskName), options: 'i' }
      }
      if (connectionName) {
        where.connectionName = connectionName
      }

      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return logcollectorApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          const pointTime = new Date()
          return {
            total: data?.total || 0,
            data: list.map((item) => {
              item.pointTime = pointTime
              if (item.syncTimePoint === 'current') {
                item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = dayjs(item.createTime).format(
                'YYYY-MM-DD HH:mm:ss',
              )
              item.logTime = item.logTime
                ? dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
              item.delayTime =
                item.delayTime < 0 || typeof item.delayTime !== 'number'
                  ? '-'
                  : calcTimeUnit(item.delayTime, 2, {
                      autoHideMs: true,
                    })
              makeStatusAndDisabled(item)
              if (item.status === 'edit') {
                item.btnDisabled.start = false
              }
              return item
            }),
          }
        })
    },

    handleSetting() {
      //是否可以全局设置
      this.loadingConfig = true
      logcollectorApi
        .check()
        .then((data) => {
          this.showEditSettingBtn = data?.data //true是可用，false是禁用 数据结构本身多了一层
          this.settingDialogVisible = true
          logcollectorApi
            .getSystemConfig()
            .then((data) => {
              if (data) {
                this.digSettingForm = data
              }
            })
            .finally(() => {
              this.loadingConfig = false
            })
        })
        .catch(() => {
          this.loadingConfig = false
        })
    },
    //保存全局挖掘设置
    saveSetting() {
      this.$refs.digSettingForm.validate((valid) => {
        if (valid) {
          if (this.digSettingForm?.persistenceMode === 'Mem') {
            this.digSettingForm.persistenceMongodb_uri_db = ''
            this.digSettingForm.persistenceMongodb_collection = ''
            this.digSettingForm.persistenceRocksdb_path = ''
          } else if (this.digSettingForm?.persistenceMode === 'MongoDB') {
            this.digSettingForm.persistenceRocksdb_path = ''
          } else if (this.digSettingForm?.persistenceMode === 'RocksDB') {
            this.digSettingForm.persistenceMongodb_uri_db = ''
            this.digSettingForm.persistenceMongodb_collection = ''
          }
          logcollectorApi.patchSystemConfig(this.digSettingForm).then(() => {
            this.settingDialogVisible = false
            this.$message.success(this.$t('public_message_save_ok'))
          })
        }
      })
    },

    start(ids) {
      this.buried(this.taskBuried.start)
      const filter = {
        where: {
          id: ids[0],
        },
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then((data) => {
            this.buried(this.taskBuried.start, '', { result: true })
            this.$message.success(
              data?.message || this.$t('public_message_operation_success'),
            )
            this.table.fetch()
          })
          .catch(() => {
            this.buried(this.taskBuried.start, '', { result: false })
          })
      })
    },

    forceStop(ids, row) {
      const msgObj = this.getConfirmMessage('force_stop', row)
      this.$confirm(this.$t('public_message_title_prompt'), msgObj.msg, {
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    stop(ids) {
      this.$confirm(
        this.$t('packages_business_important_reminder'),
        this.$t('packages_business_stop_confirm_message'),
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    handleEditor(task = {}) {
      this.$refs.editor.open(task.id)
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleDetails(task = {}) {
      this.openRoute({
        name: 'SharedMiningMonitor',
        params: {
          id: task.id,
        },
      })
    },

    getConfirmMessage(operateStr, task) {
      const title = `${operateStr}_confirm_title`,
        message = `${operateStr}_confirm_message`
      const strArr = this.$t(`dataFlow_${message}`).split('xxx')
      const msg = `
        <p>
          ${strArr[0]}
          <span class="color-primary">${task.name}</span>
          ${strArr[1]}
        </p>`
      return {
        msg,
        title: this.$t(`dataFlow_${title}`),
      }
    },

    handleReset(row) {
      const id = row.id
      const msgObj = this.getConfirmMessage('initialize', row)
      this.$confirm(msgObj.title, msgObj.msg, {
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchRenew([id]).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    async handleDelete(row) {
      const filter = {
        type: 'task_by_collector',
        taskId: row.id,
      }
      this.showUsingTaskDialog.list = await taskApi.taskConsoleRelations(filter)

      this.$confirm(
        this.$t('packages_ldp_src_tablepreview_querenshanchu'),
        this.$t('packages_business_shared_mining_list_shanchurenwus', {
          val1: row.name,
        }),
        {
          dangerouslyUseHTMLString: true,
        },
      ).then((flag) => {
        if (!flag) {
          return
        }
        if (this.showUsingTaskDialog.list.length) {
          this.showUsingTaskDialog.visible = true
          return
        }
        taskApi.batchDelete([row.id]).then((data) => {
          this.$message.success(
            data?.message || this.$t('public_message_operation_success'),
          )
          this.table.fetch()
        })
      })
    },

    handleName({ syncType, name, type }) {
      const MAP = {
        migrate: 'migrateList',
        sync: 'dataflowList',
        logCollector: 'sharedMiningList',
        mem_cache: 'sharedCacheList',
        connHeartbeat: 'HeartbeatTableList',
      }
      const routeUrl = this.$router.resolve({
        name: MAP[type] || MAP[syncType],
        query: {
          keyword: name,
        },
      })
      openUrl(routeUrl.href)
    },
  },
}
</script>

<template>
  <PageContainer>
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remote-method="getData"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          @fetch="table.fetch(1)"
        />
      </template>
      <!--外存配置已上，这里关闭，稳定后相关注释代码可去掉-->
      <!--      <div slot="operation">-->
      <!--        <el-button class="btn btn-create" type="primary"  :loading="loadingConfig" @click="handleSetting">-->
      <!--        </el-button>-->
      <!--      </div>-->
      <el-table-column
        min-width="250"
        :label="$t('packages_business_shared_list_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        :label="$t('packages_business_shared_list_time_excavation')"
      >
        <template #header>
          <div class="inline-flex align-center">
            <span>{{
              $t('packages_business_shared_list_time_excavation')
            }}</span>
            <ElTooltip
              class="ml-1"
              placement="top"
              :content="$t('public_database_time')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>

        <template #default="scope">
          {{ scope.row.logTime }}
        </template> </el-table-column
      >l
      <el-table-column
        sortable
        min-width="160"
        :label="$t('packages_business_shared_list_time')"
        prop="delayTime"
      >
        <template #header>
          <div class="inline-flex align-center">
            <span>{{ $t('packages_business_shared_list_time') }}</span>
            <ElTooltip
              class="ml-1"
              placement="top"
              :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')"
            >
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        min-width="260"
        :label="$t('public_create_time')"
        sortable
      />
      <el-table-column
        min-width="110"
        prop="status"
        :label="$t('packages_business_shared_list_status')"
      >
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column
        width="280"
        fixed="right"
        :label="$t('public_operation')"
      >
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              text
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <template v-else>
              <ElButton
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.forceStop"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElButton>
              <ElButton
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                text
                type="primary"
                :disabled="row.btnDisabled.stop"
                @click="stop([row.id])"
              >
                {{ $t('public_button_stop') }}
              </ElButton>
            </template>
            <ElDivider
              v-readonlybtn="'SYNC_job_operation'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.edit"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.reset"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElDivider
              v-readonlybtn="'SYNC_job_edition'"
              class="mx-1"
              direction="vertical"
            />
            <ElButton
              v-readonlybtn="'SYNC_job_edition'"
              text
              type="primary"
              :disabled="row.btnDisabled.delete"
              @click="handleDelete(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      v-model="settingDialogVisible"
      width="500px"
      class="setting-dialog"
      :title="$t('packages_business_shared_list_setting')"
      :close-on-click-modal="false"
    >
      <el-form
        ref="digSettingForm"
        label-position="left"
        label-width="180px"
        :model="digSettingForm"
        :disabled="!showEditSettingBtn"
        :rules="rules"
      >
        <el-form-item
          prop="persistenceMode"
          :label="$t('packages_business_shared_cdc_setting_select_mode')"
        >
          <el-select v-model="digSettingForm.persistenceMode">
            <el-option
              v-for="item in enumsItems"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_uri_db"
          label="MongoDB URI"
        >
          <el-input
            v-model="digSettingForm.persistenceMongodb_uri_db"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_form_setting_table_name')"
        >
          <el-input v-model="digSettingForm.persistenceMongodb_collection" />
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'RocksDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_cdc_persistence_rocksdb_path')"
        >
          <el-input
            v-model="digSettingForm.persistenceRocksdb_path"
            type="textarea"
          />
        </el-form-item>
        <el-form-item
          v-if="['MongoDB', 'RocksDB'].includes(digSettingForm.persistenceMode)"
          :label="$t('packages_business_shared_form_setting_log_time')"
        >
          <el-select
            v-model="digSettingForm.share_cdc_ttl_day"
            allow-create
            filterable
            :placeholder="
              $t('packages_business_shared_cdc_setting_select_time_tip')
            "
          >
            <el-option
              v-for="op in logSaveList"
              :key="op"
              :label="op + $t('public_time_d')"
              :value="op"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingDialogVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button
            type="primary"
            :disabled="!showEditSettingBtn"
            @click="saveSetting()"
            >{{ $t('public_button_confirm') }}</el-button
          >
        </span>
      </template>
    </el-dialog>

    <Editor ref="editor" @success="table.fetch(1)" />

    <!-- 挖掘关联的任务 -->
    <ElDialog
      v-model="showUsingTaskDialog.visible"
      :title="$t('public_message_title_prompt')"
      :close-on-click-modal="false"
      class="create-role"
      width="600px"
    >
      <div>
        {{
          $t('packages_business_shared_mining_list_gaiwajuerenwu', {
            val: showUsingTaskDialog.list.length,
          })
        }}
      </div>
      <VTable
        :columns="taskColumns"
        :data="showUsingTaskDialog.list"
        :has-pagination="false"
      >
        <template #name="{ row }">
          <ElLink type="primary" @click="handleName(row)">{{
            row.name
          }}</ElLink>
        </template>
      </VTable>
      <template #footer>
        <div class="dialog-footer">
          <ElButton
            @click="
              ;(showUsingTaskDialog.list = []),
                (showUsingTaskDialog.visible = false)
            "
            >{{ $t('public_button_cancel') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.share-list-wrap {
  height: 100%;
  .refresh {
    color: var(--color-primary);
    font-weight: normal;
    font-size: 12px;
    cursor: pointer;
  }
  .share-list {
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
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
    }
    .metadata-name {
      .name {
        color: var(--color-primary);
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .name:hover {
        text-decoration: underline;
      }
      .tag {
        margin-left: 5px;
        color: var(--text-slight);
        background: var(--bg-main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: var(--text-slight);
      }
    }
  }
  :deep(.el-dialog__body) {
    padding: 10px 20px;
    .el-form {
      .el-form-item {
        .el-form-item__label {
          font-size: 12px;
        }
        .el-select,
        .el-date-editor {
          width: 100%;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.hide-current__dateTime {
  .el-picker-panel__footer {
    .el-button--text {
      display: none;
    }
  }
}
</style>
