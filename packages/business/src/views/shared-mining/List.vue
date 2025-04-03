<template>
  <PageContainer>
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template #search>
        <FilterBar v-model:value="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <!--外存配置已上，这里关闭，稳定后相关注释代码可去掉-->
      <!--      <div slot="operation">-->
      <!--        <el-button class="btn btn-create" type="primary"  :loading="loadingConfig" @click="handleSetting">-->
      <!--        </el-button>-->
      <!--      </div>-->
      <el-table-column min-width="250" :label="$t('packages_business_shared_list_name')" :show-overflow-tooltip="true">
        <template v-slot="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column min-width="160" :label="$t('packages_business_shared_list_time_excavation')">
        <template #header>
          <div class="inline-flex align-center">
            <span>{{ $t('packages_business_shared_list_time_excavation') }}</span>
            <ElTooltip class="ml-1" placement="top" :content="$t('public_database_time')">
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>

        <template v-slot="scope">
          {{ scope.row.logTime }}
        </template> </el-table-column
      >l
      <el-table-column sortable min-width="160" :label="$t('packages_business_shared_list_time')" prop="delayTime">
        <template #header>
          <div class="inline-flex align-center">
            <span>{{ $t('packages_business_shared_list_time') }}</span>
            <ElTooltip class="ml-1" placement="top" :content="$t('packages_dag_monitor_leftsider_shijiancongyuanku')">
              <VIcon class="color-primary" size="14">info</VIcon>
            </ElTooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" min-width="260" :label="$t('public_create_time')" sortable> </el-table-column>
      <el-table-column min-width="110" prop="status" :label="$t('packages_business_shared_list_status')">
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column width="280" fixed="right" :label="$t('public_operation')">
        <template #default="{ row }">
          <div class="table-operations">
            <ElButton
              text
              v-if="row.btnDisabled.stop && row.btnDisabled.forceStop"
              v-readonlybtn="'SYNC_job_operation'"
              type="primary"
              :disabled="row.btnDisabled.start"
              @click="start([row.id])"
            >
              {{ $t('public_button_start') }}
            </ElButton>
            <template v-else>
              <ElButton
                text
                v-if="row.status === 'stopping'"
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.forceStop"
                @click="forceStop([row.id], row)"
              >
                {{ $t('public_button_force_stop') }}
              </ElButton>
              <ElButton
                text
                v-else
                v-readonlybtn="'SYNC_job_operation'"
                type="primary"
                :disabled="row.btnDisabled.stop"
                @click="stop([row.id])"
              >
                {{ $t('public_button_stop') }}
              </ElButton>
            </template>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_operation'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.edit || $disabledReadonlyUserBtn()"
              @click="handleEditor(row)"
            >
              {{ $t('public_button_edit') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.monitor && !row.lastStartDate"
              @click="handleDetails(row)"
            >
              {{ $t('packages_business_task_list_button_monitor') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.reset || $disabledReadonlyUserBtn()"
              @click="handleReset(row)"
            >
              {{ $t('public_button_reset') }}
            </ElButton>
            <ElDivider class="mx-1" v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElButton
              text
              v-readonlybtn="'SYNC_job_edition'"
              type="primary"
              :disabled="row.btnDisabled.delete || $disabledReadonlyUserBtn()"
              @click="handleDelete(row)"
            >
              {{ $t('public_button_delete') }}
            </ElButton>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      width="500px"
      class="setting-dialog"
      :title="$t('packages_business_shared_list_setting')"
      :close-on-click-modal="false"
      v-model="settingDialogVisible"
    >
      <el-form
        ref="digSettingForm"
        label-position="left"
        label-width="180px"
        :model="digSettingForm"
        :disabled="!showEditSettingBtn"
        :rules="rules"
      >
        <el-form-item prop="persistenceMode" :label="$t('packages_business_shared_cdc_setting_select_mode')">
          <el-select v-model="digSettingForm.persistenceMode">
            <el-option v-for="item in enumsItems" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_uri_db"
          label="MongoDB URI"
        >
          <el-input type="textarea" v-model="digSettingForm.persistenceMongodb_uri_db"></el-input>
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_form_setting_table_name')"
        >
          <el-input v-model="digSettingForm.persistenceMongodb_collection"> </el-input>
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'RocksDB'"
          prop="persistenceMongodb_collection"
          :label="$t('packages_business_shared_cdc_persistence_rocksdb_path')"
        >
          <el-input type="textarea" v-model="digSettingForm.persistenceRocksdb_path"></el-input>
        </el-form-item>
        <el-form-item
          v-if="['MongoDB', 'RocksDB'].includes(digSettingForm.persistenceMode)"
          :label="$t('packages_business_shared_form_setting_log_time')"
        >
          <el-select
            allow-create
            filterable
            v-model="digSettingForm.share_cdc_ttl_day"
            :placeholder="$t('packages_business_shared_cdc_setting_select_time_tip')"
          >
            <el-option v-for="op in logSaveList" :key="op" :label="op + $t('public_time_d')" :value="op"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="settingDialogVisible = false">{{ $t('public_button_cancel') }}</el-button>
          <el-button type="primary" :disabled="!showEditSettingBtn" @click="saveSetting()">{{
            $t('public_button_confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <Editor ref="editor" @success="table.fetch(1)"></Editor>

    <!-- 挖掘关联的任务 -->
    <ElDialog
      :title="$t('public_message_title_prompt')"
      :close-on-click-modal="false"
      v-model="showUsingTaskDialog.visible"
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
      <VTable :columns="taskColumns" :data="showUsingTaskDialog.list" :has-pagination="false">
        <template #name="{ row }">
          <ElLink type="primary" @click="handleName(row)">{{ row.name }}</ElLink>
        </template>
      </VTable>
      <template v-slot:footer>
        <div class="dialog-footer">
          <ElButton @click=";(showUsingTaskDialog.list = []), (showUsingTaskDialog.visible = false)"
            >{{ $t('public_button_cancel') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </PageContainer>
</template>

<script>
import { escapeRegExp } from 'lodash'
import dayjs from 'dayjs'
import { logcollectorApi, taskApi, workerApi } from '@tap/api'
import { FilterBar, VTable } from '@tap/component'
import { TablePage, TaskStatus } from '../../components'
import { makeStatusAndDisabled } from '../../shared'

import Editor from './Editor'
import i18n from '@tap/i18n'
import { calcTimeUnit, openUrl } from '@tap/shared'
import PageContainer from '../../components/PageContainer.vue'

let timeout = null
export default {
  inject: ['buried'],
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    TaskStatus,
    Editor,
    VTable,
  },
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: '',
      },
      filterItems: [
        {
          placeholder: this.$t('packages_business_shared_cdc_placeholder_task_name'),
          key: 'taskName',
          type: 'input',
        },
        {
          placeholder: this.$t('packages_business_shared_cdc_placeholder_connection_name'),
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
            message: this.$t('packages_business_shared_cdc_setting_select_mongodb_tip'),
            trigger: 'blur',
          },
        ],
        persistenceMongodb_collection: [
          {
            required: true,
            message: this.$t('packages_business_shared_cdc_setting_select_table_tip'),
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
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.searchParams = Object.assign(this.searchParams, {
      taskName: this.$route.query?.keyword || '',
    })
  },
  computed: {
    table() {
      return this.$refs.table
    },

    systemTimeZone() {
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      return systemTimeZone
    },
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    },
  },
  unmounted() {
    clearInterval(timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page
      let { taskName, connectionName } = this.searchParams
      let where = {}

      if (taskName) {
        where.name = { like: escapeRegExp(taskName), options: 'i' }
      }
      if (connectionName) {
        where.connectionName = { like: escapeRegExp(connectionName), options: 'i' }
      }

      let filter = {
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
          let list = data?.items || []
          let pointTime = new Date()
          return {
            total: data?.total || 0,
            data: list.map((item) => {
              item['pointTime'] = pointTime
              if (item.syncTimePoint === 'current') {
                item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              item.logTime = item.logTime ? dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss') : '-'
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
      let filter = {
        where: {
          id: ids[0],
        },
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then((data) => {
            this.buried(this.taskBuried.start, '', { result: true })
            this.$message.success(data?.message || this.$t('public_message_operation_success'))
            this.table.fetch()
          })
          .catch(() => {
            this.buried(this.taskBuried.start, '', { result: false })
          })
      })
    },

    forceStop(ids, row) {
      let msgObj = this.getConfirmMessage('force_stop', row)
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false,
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
          this.table.fetch()
        })
      })
    },

    stop(ids) {
      this.$confirm(
        this.$t('packages_business_stop_confirm_message'),
        this.$t('packages_business_important_reminder'),
        {
          type: 'warning',
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      let strArr = this.$t('dataFlow_' + message).split('xxx')
      let msg = `
        <p>
          ${strArr[0]}
          <span class="color-primary">${task.name}</span>
          ${strArr[1]}
        </p>`
      return {
        msg,
        title: this.$t('dataFlow_' + title),
      }
    },

    handleReset(row) {
      const id = row.id
      let msgObj = this.getConfirmMessage('initialize', row)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        taskApi.batchRenew([id]).then((data) => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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
        this.$t('packages_business_shared_mining_list_shanchurenwus', {
          val1: row.name,
        }),
        '',
        {
          type: 'warning',
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
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
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

<style lang="scss" scoped>
.share-list-wrap {
  height: 100%;
  .refresh {
    color: map-get($color, primary);
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
        color: map-get($color, primary);
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
        color: map-get($fontColor, slight);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: map-get($fontColor, slight);
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
