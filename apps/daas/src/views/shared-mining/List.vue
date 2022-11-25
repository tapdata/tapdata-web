<template>
  <section class="share-list-wrap h-100">
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <!--外存配置还没上，这里的设置需要打开-->
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" :loading="loadingConfig" @click="handleSetting">
          <span>{{ $t('share_list_setting') }}</span>
        </el-button>
      </div>
      <el-table-column min-width="250" :label="$t('share_list_name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        prop="connections"
        min-width="160"
        :label="$t('column_connection')"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <div v-for="item in scope.row.connections" :key="item.id" class="ellipsis">
            <span v-for="op in item" :key="op">{{ op }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="150" :label="$t('share_list_time_excavation')">
        <template slot-scope="scope">
          {{ scope.row.logTime }}
        </template>
      </el-table-column>
      <el-table-column sortable min-width="120" :label="$t('share_list_time')" prop="delayTime"></el-table-column>
      <el-table-column prop="createTime" min-width="150" :label="$t('share_list_creat_time')" sortable>
      </el-table-column>
      <el-table-column min-width="110" prop="status" :label="$t('share_list_status')">
        <template #default="{ row }">
          <TaskStatus :task="row" />
        </template>
      </el-table-column>
      <el-table-column width="210" fixed="right" :label="$t('column_operation')">
        <template #default="{ row }">
          <TaskButtons :task="row" :hide-list="['del']" @trigger="taskButtonsHandler"></TaskButtons>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      width="500px"
      custom-class="setting-dialog"
      :title="$t('share_list_setting')"
      :close-on-click-modal="false"
      :visible.sync="settingDialogVisible"
    >
      <el-form
        ref="digSettingForm"
        label-position="left"
        label-width="180px"
        :model="digSettingForm"
        :disabled="!showEditSettingBtn"
        :rules="rules"
      >
        <el-form-item prop="persistenceMode" size="mini" :label="$t('shared_cdc_setting_select_mode')">
          <el-select v-model="digSettingForm.persistenceMode">
            <el-option v-for="item in enumsItems" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_uri_db"
          size="mini"
          label="MongoDB URI"
        >
          <el-input type="textarea" v-model="digSettingForm.persistenceMongodb_uri_db"></el-input>
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'MongoDB'"
          prop="persistenceMongodb_collection"
          size="mini"
          :label="$t('share_form_setting_table_name')"
        >
          <el-input v-model="digSettingForm.persistenceMongodb_collection"> </el-input>
        </el-form-item>
        <el-form-item
          v-if="digSettingForm.persistenceMode === 'RocksDB'"
          prop="persistenceMongodb_collection"
          size="mini"
          :label="$t('setting_share_cdc_persistence_rocksdb_path')"
        >
          <el-input type="textarea" v-model="digSettingForm.persistenceRocksdb_path"></el-input>
        </el-form-item>
        <el-form-item
          v-if="['MongoDB', 'RocksDB'].includes(digSettingForm.persistenceMode)"
          size="mini"
          :label="$t('share_form_setting_log_time')"
        >
          <el-select
            allow-create
            filterable
            v-model="digSettingForm.share_cdc_ttl_day"
            :placeholder="$t('shared_cdc_setting_select_time_tip')"
          >
            <el-option v-for="op in logSaveList" :key="op" :label="op + $t('share_form_edit_day')" :value="op">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="settingDialogVisible = false">{{ $t('button_cancel') }}</el-button>
        <el-button size="mini" type="primary" :disabled="!showEditSettingBtn" @click="saveSetting()">{{
          $t('button_confirm')
        }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      width="400px"
      custom-class="edit-dialog"
      :title="$t('share_list_edit_title')"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :visible.sync="editDialogVisible"
    >
      <el-form ref="editForm" label-position="left" label-width="150px" :model="editForm" :rules="rulesEdit">
        <el-form-item size="mini" :label="$t('share_form_edit_name')" prop="name">
          <el-input clearable v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item size="mini" :label="$t('share_form_setting_log_time')">
          <el-select v-model="editForm.storageTime" :placeholder="$t('common_placeholder_select')">
            <el-option v-for="op in logSaveList" :key="op" :label="op + $t('share_form_edit_day')" :value="op">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="cancelEdit" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="saveEdit()">{{ $t('button_save') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import dayjs from 'dayjs'
import { logcollectorApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage, TaskStatus, makeStatusAndDisabled } from '@tap/business'

import TaskButtons from '@/components/TaskButtons'
import { getSubTaskStatus, getTaskBtnDisabled } from '@/utils/util'

let timeout = null
export default {
  components: {
    TablePage,
    FilterBar,
    TaskButtons,
    TaskStatus
  },
  data() {
    return {
      searchParams: {
        taskName: '',
        connectionName: ''
      },
      filterItems: [
        {
          placeholder: this.$t('shared_cdc_placeholder_task_name'),
          key: 'taskName',
          type: 'input'
        },
        {
          placeholder: this.$t('shared_cdc_placeholder_connection_name'),
          key: 'connectionName',
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
        id: '',
        name: '',
        storageTime: 3
      },
      currentForm: {},
      logSaveList: [1, 2, 3, 4, 5, 6, 7],
      showEditSettingBtn: false, //禁用
      rules: {
        persistenceMongodb_uri_db: [
          { required: true, message: this.$t('shared_cdc_setting_select_mongodb_tip'), trigger: 'blur' }
        ],
        persistenceMongodb_collection: [
          { required: true, message: this.$t('shared_cdc_setting_select_table_tip'), trigger: 'blur' }
        ]
      },
      rulesEdit: {
        name: [{ required: true, message: this.$t('shared_cdc_name'), trigger: 'blur' }]
      }
    }
  },
  mounted() {
    //定时轮询
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
  },
  computed: {
    table() {
      return this.$refs.table
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
              item.logTime = dayjs(item.logTime).format('YYYY-MM-DD HH:mm:ss')
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
            this.$message.success(this.$t('message_save_ok'))
          })
        }
      })
    },
    taskButtonsHandler(event, task) {
      if (event === 'edit') {
        this.editDialogVisible = true
        this.editForm.id = task.id
        this.editForm.name = task.name
        this.editForm.storageTime = task.storageTime
        this.currentForm = JSON.parse(JSON.stringify(this.editForm))
      } else if (event === 'details') {
        this.$router.push({
          name: 'SharedMiningDetails',
          params: {
            id: task.id
          }
        })
      } else {
        this.table.fetch()
      }
    },
    // 取消编辑
    cancelEdit() {
      //弹框没有任何修改 直接关闭不需要二次提示
      if (this.editForm.name === this.currentForm.name && this.editForm.storageTime === this.currentForm.storageTime) {
        this.editDialogVisible = false
        return
      }
      this.$confirm(this.$t('share_form_edit_text'), this.$t('share_form_edit_title'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.editDialogVisible = false
      })
    },
    // 保存编辑
    saveEdit() {
      this.$refs['editForm'].validate(valid => {
        if (valid) {
          let id = this.editForm?.id
          logcollectorApi.patchId(id, this.editForm).then(() => {
            this.editDialogVisible = false
            this.table.fetch(1)
            this.$message.success(this.$t('shared_cdc_setting_message_edit_save'))
          })
        }
      })
    }
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
