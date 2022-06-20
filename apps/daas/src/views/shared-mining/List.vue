<template>
  <section class="share-list-wrap section-wrap">
    <TablePage ref="table" row-key="id+indexName" class="share-list" :remoteMethod="getData">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" :loading="loadingConfig" @click="handleSetting">
          <span>{{ $t('share_list_setting') }}</span>
        </el-button>
      </div>
      <el-table-column width="250" :label="$t('share_list_name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="connections" width="250" :label="$t('share_list_connection')">
        <template slot-scope="scope">
          <div v-for="item in scope.row.connections" :key="item.id">
            <span v-for="op in item" :key="op">{{ op }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="150" :label="$t('share_list_time_excavation')">
        <template slot-scope="scope">
          {{ scope.row.pointTime }}
        </template>
      </el-table-column>
      <el-table-column sortable width="120" :label="$t('share_list_time')"></el-table-column>
      <el-table-column prop="createTime" width="160" :label="$t('share_list_creat_time')" sortable> </el-table-column>
      <el-table-column width="120" prop="status" :label="$t('share_list_status')">
        <template #default="{ row }">
          <span :class="['status-' + row.statusResult, 'status-block']">
            {{ $t('task_preview_status_' + row.statusResult) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column width="250" fixed="right" :label="$t('column_operation')">
        <template #default="{ row }">
          <el-button size="mini" type="text" :disabled="row.disabledData.start" @click="run([row.id])">{{
            $t('task_list_run')
          }}</el-button>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink v-if="isShowForceStop(row.statuses)" type="primary" @click="forceStop([row.id])">
            {{ $t('task_list_force_stop') }}
          </ElLink>
          <el-button v-else size="mini" type="text" :disabled="row.disabledData.stop" @click="stop([row.id])">{{
            $t('task_list_stop')
          }}</el-button>
          <ElDivider direction="vertical"></ElDivider>
          <el-button size="mini" type="text" :disabled="row.disabledData.edit" @click="edit(row)">{{
            $t('button_edit')
          }}</el-button>
          <el-button size="mini" type="text" :disabled="row.disabledData.reset" @click="rest([row.id])">{{
            $t('dataFlow.button.reset')
          }}</el-button>
          <ElDivider direction="vertical"></ElDivider>
          <el-button size="mini" type="text" @click="detail(row)">{{ $t('button_details') }}</el-button>
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
        <el-form-item prop="persistenceMongodb_uri_db" size="mini" :label="$t('shared_cdc_setting_select_mode')">
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
          <el-input v-model="digSettingForm.persistenceMongodb_uri_db"></el-input>
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
          <el-input v-model="digSettingForm.persistenceRocksdb_path"></el-input>
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
          <el-select v-model="editForm.storageTime" placeholder="请选择">
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
import TablePage from '@/components/TablePage'
import FilterBar from '@/components/filter-bar'
import { getSubTaskStatus, getTaskBtnDisabled } from '@/utils/util'
import dayjs from 'dayjs'

let timeout = null
export default {
  components: {
    TablePage,
    FilterBar
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
      mongodbList: [],
      editForm: {
        id: '',
        name: '',
        storageTime: 3
      },
      currentForm: {},
      options: [
        {
          label: this.$t('share_form_edit_localTZ_type'),
          value: 'localTZ'
        },
        {
          label: this.$t('share_form_edit_connTZ_type'),
          value: 'connTZ'
        },
        {
          label: this.$t('share_form_edit_current_type'),
          value: 'current'
        }
      ],
      logSaveList: ['1', '2', '3', '4', '5', '6', '7'],
      statusBtMap: {
        // scheduled, draft, running, stopping, error, pause, force stopping
        start: { draft: true, error: true, pause: true },
        stop: { running: true },
        edit: { edit: true, stop: true, error: true }
      },
      showEditSettingBtn: false, //禁用
      //rules
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
    }, 30000)
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
      return this.$api('logcollector')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res.data?.items || []
          let pointTime = new Date()
          return {
            total: res.data.total,
            data: list.map(item => {
              this.$set(item, 'pointTime', pointTime)
              if (item.syncTimePoint === 'current') {
                item.pointTime = dayjs(pointTime).format('YYYY-MM-DD HH:mm:ss')
              } else {
                item.pointTime = item.syncTimeZone
              }
              item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              let statuses = item.statuses
              item.disabledData = getTaskBtnDisabled(item)
              item.statusResult = getSubTaskStatus(statuses)[0].status
              return item
            })
          }
        })
    },

    handleSetting() {
      //是否可以全局设置
      this.loadingConfig = true
      this.$api('logcollector')
        .check()
        .then(res => {
          if (res) {
            this.showEditSettingBtn = res?.data?.data //true是可用，false是禁用
            this.settingDialogVisible = true
            this.$api('logcollector')
              .getSystemConfig()
              .then(res => {
                if (res) {
                  this.digSettingForm = res.data
                }
              })
              .finally(() => {
                this.loadingConfig = false
              })
          }
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
          this.$api('logcollector')
            .patchSystemConfig(this.digSettingForm)
            .then(res => {
              if (res) {
                this.settingDialogVisible = false
                this.$message.success(this.$t('message_save_ok'))
              }
            })
        }
      })
    },
    run(ids) {
      let filter = {
        where: {
          id: ids[0]
        }
      }
      this.$api('Task')
        .get({ filter: JSON.stringify(filter) })
        .then(res => {
          if (res) {
            this.$api('Task')
              .batchStart(ids)
              .then(res => {
                this.$message.success(res.data?.message || this.$t('message_operation_succuess'))
                this.table.fetch()
              })
          }
        })
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
    isShowForceStop(data) {
      return data?.length && data.every(t => ['stopping'].includes(t.status))
    },
    stop(ids) {
      this.$confirm(this.$t('message.stopInitial_syncMessage'), this.$t('dataFlow.importantReminder'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('Task')
          .batchStop(ids)
          .then(res => {
            this.$message.success(res.data?.message || this.$t('message_operation_succuess'))
            this.table.fetch()
          })
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
            this.$message.success(res.data?.message || this.$t('message_operation_succuess'))
            this.table.fetch()
          })
      })
    },
    // 编辑
    edit(item) {
      this.editDialogVisible = true
      this.editForm.id = item.id
      this.editForm.name = item.name
      this.editForm.storageTime = item.storageTime
      this.currentForm = JSON.parse(JSON.stringify(this.editForm))
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
    //重置
    rest(ids, item = {}) {
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
            this.$message.success(res.data?.message || this.$t('message_operation_succuess'))
          })
          .finally(() => {
            this.restLoading = false
          })
      })
    },

    // 保存编辑
    saveEdit() {
      this.$refs['editForm'].validate(valid => {
        if (valid) {
          let id = this.editForm?.id
          this.$api('logcollector')
            .patch(id, this.editForm)
            .then(res => {
              if (res) {
                this.editDialogVisible = false
                this.table.fetch(1)
                this.$message.success(this.$t('shared_cdc_setting_message_edit_save'))
              }
            })
        }
      })
    },

    detail(item) {
      this.$router.push({
        name: 'SharedMiningDetails',
        params: {
          id: item.id
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
