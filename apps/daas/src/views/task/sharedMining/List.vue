<template>
  <section class="share-list-wrap section-wrap">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('share_list_dig_task_search')"
              @input="table.fetch(1, 800)"
            >
            </el-input>
          </li>
          <template v-if="searchParams.keyword">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
            </li>
          </template>
        </ul>
      </div>
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" @click="handleSetting">
          <span>{{ $t('share_list_setting') }}</span>
        </el-button>
      </div>
      <el-table-column
        :label="$t('share_list_name')"
        prop="name"
        sortable="name"
        :show-overflow-tooltip="true"
        width="360"
      >
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_connection')" prop="connections" width="250">
        <template slot-scope="scope">
          <div v-for="item in scope.row.connections" :key="item.id">
            <span v-for="op in item" :key="op">{{ op }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_time_excavation')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.indexName }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_time')"> </el-table-column>
      <el-table-column :label="$t('share_list_creat_time')" prop="createTime" width="160"> </el-table-column>
      <el-table-column :label="$t('share_list_status')" prop="status">
        <template slot-scope="scope">
          <StatusTag type="text" target="shareCdc" :status="scope.row.status" only-img></StatusTag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="run([scope.row.id])">{{ $t('task_list_run') }}</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="stop([scope.row.id])">{{ $t('task_list_stop') }}</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" style="color: #f56c6c" @click="edit(scope.row)">{{
            $t('button_edit')
          }}</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button size="mini" type="text" @click="detail(scope.row)">{{ $t('button_details') }}</el-button>
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
        :model="digSettingForm"
        ref="digSettingForm"
        :disabled="!showEditSettingBtn"
        :rules="rules"
        label-position="left"
        label-width="180px"
      >
        <el-form-item :label="$t('share_form_setting_connection_name')" size="mini" prop="persistenceMongodb_uri_db">
          <el-select v-model="digSettingForm.persistenceMongodb_uri_db" placeholder="请选择" @change="handleTables">
            <el-option v-for="item in mongodbList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>

          <div v-if="showEditSettingBtn && mongodbList.length === 0">
            <el-link type="primary" target="_blank" href="#/connections/create?databaseType=mongodb"
              >请先创建mongodb数据源</el-link
            >
            /
            <span class="refresh" @click="getMongodb"> 刷新数据 <VIcon class="font-color-sub">refresh</VIcon></span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('share_form_setting_table_name')" size="mini" prop="persistenceMongodb_collection">
          <el-select
            v-model="digSettingForm.persistenceMongodb_collection"
            placeholder="请选择"
            allow-create
            filterable
          >
            <el-option
              v-for="table in tableList"
              :key="table.tableId"
              :label="table.table_name"
              :value="table.table_name"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('share_form_setting_log_time')" size="mini">
          <el-select v-model="digSettingForm.share_cdc_ttl_day" placeholder="请选择" allow-create filterable>
            <el-option v-for="op in logSaveList" :key="op" :label="op + $t('share_form_edit_day')" :value="op">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" :disabled="!showEditSettingBtn" @click="saveSetting()" size="mini">{{
          $t('button_confirm')
        }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      width="400px"
      custom-class="edit-dialog"
      :title="$t('share_list_edit_title')"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
    >
      <el-form :model="editForm" label-position="left" label-width="150px">
        <el-form-item :label="$t('share_form_edit_name')" size="mini" required>
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <!--        <el-form-item :label="$t('share_form_edit_dig_time')" size="mini" required>-->
        <!--          <el-row>-->
        <!--            <el-col :span="24" class="pb-3">-->
        <!--              <el-select v-model="editForm.syncTimePoint" placeholder="请选择">-->
        <!--                <el-option v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </el-option>-->
        <!--              </el-select>-->
        <!--            </el-col>-->
        <!--            <el-col :span="24">-->
        <!--              <el-date-picker-->
        <!--                format="yyyy-MM-dd HH:mm:ss"-->
        <!--                v-model="editForm.syncTineZone"-->
        <!--                type="datetime"-->
        <!--              ></el-date-picker>-->
        <!--            </el-col>-->
        <!--          </el-row>-->
        <!--        </el-form-item>-->
        <el-form-item :label="$t('share_form_setting_log_time')" size="mini">
          <el-select v-model="editForm.storageTime" placeholder="请选择">
            <el-option v-for="op in logSaveList" :key="op" :label="op + $t('share_form_edit_day')" :value="op">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="saveEdit()" size="mini">{{ $t('button_confirm') }}</el-button>
      </span>
    </el-dialog>
    <DownAgent ref="agentDialog" type="taskRunning"></DownAgent>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import DownAgent from '../../downAgent/agentDown'
import StatusTag from '@/components/StatusTag'

export default {
  components: {
    TablePage,
    DownAgent,
    StatusTag
  },
  data() {
    return {
      searchParams: {
        keyword: ''
      },
      order: 'createTime DESC',
      list: null,
      settingDialogVisible: false,
      editDialogVisible: false,
      digSettingForm: {
        persistenceMongodb_uri_db: '',
        persistenceMongodb_collection: '',
        share_cdc_ttl_day: 3
      },
      mongodbList: [],
      tableList: [],
      editForm: {
        id: '',
        name: '',
        syncTimePoint: 'localTZ',
        syncTineZone: '',
        storageTime: 3
      },
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
        persistenceMongodb_uri_db: [{ required: true, message: '请选择MongoDB连接名称', trigger: 'blur' }],
        persistenceMongodb_collection: [{ required: true, message: '请选择MongoDB表名', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
    //是否可以全局设置
    this.check()
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    expandChange() {},
    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true
        }
      }
      this.table.fetch(1)
    },

    // 获取列表数据
    getData({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = { like: keyword, options: 'i' }
        where.or = [{ name: filterObj }]
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return this.$api('logcollector')
        .get(filter)
        .then(res => {
          let list = res.data?.items || []
          // this.table.setCache({ keyword })
          return {
            total: res.data.total,
            data: list.map(item => {
              item.createTime = this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },

    // 挖掘设置
    check() {
      this.$api('logcollector')
        .check()
        .then(res => {
          if (res) {
            this.showEditSettingBtn = res.data //true是可用，false是禁用
          }
        })
    },
    handleSetting() {
      this.settingDialogVisible = true
      this.$api('logcollector')
        .getSystemConfig()
        .then(res => {
          if (res) {
            this.digSettingForm = res.data
            this.getMongodb()
            if (this.digSettingForm?.persistenceMongodb_uri_db) {
              this.handleTables(this.digSettingForm?.persistenceMongodb_uri_db) //编辑页面请求tables
            }
          }
        })
    },
    //获取所有mongo连接
    getMongodb() {
      let filter = {
        where: {
          database_type: 'mongodb'
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res) {
            this.mongodbList = res?.data?.items
          }
        })
    },
    //根据已选connectionId->tables
    handleTables(id) {
      this.$api('connections')
        .customQuery(id, { schema: true })
        .then(res => {
          if (res) {
            this.tableList = res?.data?.schema?.tables || []
          }
        })
    },
    //保存全局挖掘设置
    saveSetting() {
      this.$refs.digSettingForm.validate(valid => {
        if (valid) {
          this.$api('logcollector')
            .patchSystemConfig(this.digSettingForm)
            .then(res => {
              if (res) {
                this.settingDialogVisible = false
                this.$message.success('保存全局设置成功')
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
      if (this.$refs.agentDialog.checkAgent()) {
        this.$api('Task')
          .get({ filter: JSON.stringify(filter) })
          .then(res => {
            if (res) {
              this.$api('Task')
                .batchStart(ids)
                .then(res => {
                  this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
                  this.table.fetch()
                })
                .catch(err => {
                  this.$message.error(err.data?.message)
                })
            }
          })
      }
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
            this.$message.success(res.data?.message || this.$t('message.operationSuccuess'))
            this.table.fetch()
          })
          .catch(err => {
            this.$message.error(err.data?.message)
          })
      })
    },
    // 编辑
    edit(item) {
      this.editDialogVisible = true
      this.editForm = item
    },
    // 取消编辑
    cancelEdit() {
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
      let id = this.editForm?.id
      this.$api('logcollector')
        .patch(id, this.editForm)
        .then(res => {
          if (res) {
            this.editDialogVisible = false
            this.$message.success('保存成功，重启任务后生效')
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
    },

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
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
        color: #409eff;
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
        color: #999999;
        background: #f5f5f5;
        border: 1px solid #dedee4;
      }
      .parent {
        color: #cccccc;
      }
    }
  }
  ::v-deep {
    .el-dialog__body {
      padding: 10px 20px;
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
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
