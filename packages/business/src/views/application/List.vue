<template>
  <section class="share-list-wrap h-100">
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton
          v-readonlybtn="'new_model_creation'"
          type="primary"
          class="btn btn-create"
          size="mini"
          @click="handleEditor"
        >
          <span>创建应用</span>
        </ElButton>
      </div>
      <el-table-column min-width="250" label="应用名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column min-width="160" label="总API数量">
        <template slot-scope="scope">
          {{ scope.row.logTime }}
        </template>
      </el-table-column>
      <el-table-column min-width="160" label="已发布API数量">
        <template slot-scope="scope">
          {{ scope.row.logTime }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" min-width="160" :label="$t('public_create_time')" sortable> </el-table-column>
      <el-table-column width="220" fixed="right" :label="$t('public_operation')">
        <template #default="{ row }">
          <div class="table-operations">
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="handleEditor(row)">
              {{ $t('public_button_edit') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="handleDetails(row)">
              {{ $t('public_button_details') }}
            </ElLink>
            <ElDivider v-readonlybtn="'SYNC_job_edition'" direction="vertical"></ElDivider>
            <ElLink v-readonlybtn="'SYNC_job_edition'" type="primary" @click="handleDelete(row)">
              {{ $t('public_button_delete') }}
            </ElLink>
          </div>
        </template>
      </el-table-column>
    </TablePage>

    <Editor ref="editor" :task-id="editForm.id" :visible.sync="editVisible" @success="table.fetch(1)"></Editor>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { logcollectorApi, taskApi, workerApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage, TaskStatus, makeStatusAndDisabled } from '@tap/business'

import Editor from './Editor'

let timeout = null
export default {
  inject: ['buried'],
  components: {
    TablePage,
    FilterBar,
    TaskStatus,
    Editor
  },
  data() {
    return {
      searchParams: {
        taskName: ''
      },
      filterItems: [
        {
          placeholder: '请输入应用名称',
          key: 'taskName',
          type: 'input'
        }
      ],
      order: 'createTime DESC',
      list: null,
      settingDialogVisible: false,
      editDialogVisible: false,
      loadingConfig: false,
      digSettingForm: {
        persistenceMode: 'Mem', // 存储模式
        persistenceMongodb_uri_db: '', // mongodb uri
        persistenceMongodb_collection: '', // mongodb tablename
        persistenceRocksdb_path: '', // rocksdb路径
        share_cdc_ttl_day: 3
      },
      enumsItems: ['Mem', 'MongoDB', 'RocksDB'],
      editForm: {
        id: ''
      },
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      showEditSettingBtn: false, //禁用
      rules: {
        persistenceMongodb_uri_db: [
          {
            required: true,
            message: this.$t('packages_business_shared_cdc_setting_select_mongodb_tip'),
            trigger: 'blur'
          }
        ],
        persistenceMongodb_collection: [
          { required: true, message: this.$t('packages_business_shared_cdc_setting_select_table_tip'), trigger: 'blur' }
        ]
      },
      taskBuried: {
        start: 'sharedMiningStart'
      },
      editVisible: false
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
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
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page
      let { taskName, connectionName } = this.searchParams
      let where = {}
      taskName && (where.taskName = taskName)
      connectionName && (where.connectionName = connectionName)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return logcollectorApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          let pointTime = new Date()
          return {
            total: data?.total || 0,
            data: list.map(item => {
              this.$set(item, 'pointTime', pointTime)
              if (item.syncTimePoint === 'current') {
                item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              item.logTime = item.logTime ? dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              item.delayTime = item.delayTime < 0 ? '-' : item.delayTime
              makeStatusAndDisabled(item)
              if (item.status === 'edit') {
                item.btnDisabled.start = false
              }
              return item
            })
          }
        })
    },

    handleSetting() {
      //是否可以全局设置
      this.loadingConfig = true
      logcollectorApi
        .check()
        .then(data => {
          this.showEditSettingBtn = data?.data //true是可用，false是禁用 数据结构本身多了一层
          this.settingDialogVisible = true
          logcollectorApi
            .getSystemConfig()
            .then(data => {
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
      this.$refs.digSettingForm.validate(valid => {
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
          id: ids[0]
        }
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi
          .batchStart(ids)
          .then(data => {
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
        dangerouslyUseHTMLString: true
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
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
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('public_message_operation_success'))
          this.table.fetch()
        })
      })
    },

    handleEditor(task = {}) {
      this.editForm = task
      this.editVisible = true
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleDetails(task = {}) {},

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
        title: this.$t('dataFlow_' + title)
      }
    },

    handleDelete(row) {}
  }
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
  ::v-deep {
    .el-dialog__body {
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
