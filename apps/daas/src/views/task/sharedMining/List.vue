<template>
  <section class="share-list-wrap">
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
          <!-- <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('share_list_connection_search')"
              @input="table.fetch(1, 800)"
            >
            </el-input>
          </li> -->
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
        <el-button class="btn btn-create" size="mini" @click="handleSetting">
          <span>{{ $t('share_list_setting') }}</span>
        </el-button>
      </div>
      <el-table-column :label="$t('share_list_name')" prop="name" sortable="name" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_connection')" prop="connections">
        <template slot-scope="scope">
          {{ scope.row.connections }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_time_excavation')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.indexName }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_creat_time')" prop="createTime"> </el-table-column>
      <el-table-column :label="$t('share_list_status')" prop="status"> </el-table-column>
      <el-table-column :label="$t('column_operation')">
        <template slot-scope="scope">
          <el-button size="mini" type="text" style="color: #f56c6c" @click="handleEdit(scope.row)">{{
            $t('button_edit')
          }}</el-button>
          <el-button size="mini" type="text" @click="handleDetail(scope.row)">{{ $t('button_details') }}</el-button>
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      width="400px"
      custom-class="setting-dialog"
      :title="$t('share_list_setting')"
      :close-on-click-modal="false"
      :visible.sync="settingDialogVisible"
    >
      <FormBuilder ref="form" v-model="digSettingForm" :config="digSettingFormConfig"></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="createNewTtl()" size="mini">{{ $t('button_confirm') }}</el-button>
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
        <el-form-item :label="$t('share_form_edit_dig_time')" size="mini" required>
          <el-row>
            <el-col :span="24" class="pb-3">
              <el-select v-model="editForm.syncTimePoint" placeholder="请选择">
                <el-option v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </el-option>
              </el-select>
            </el-col>
            <el-col :span="24">
              <el-date-picker
                format="yyyy-MM-dd HH:mm:ss"
                v-model="editForm.syncTineZone"
                type="datetime"
              ></el-date-picker>
            </el-col>
          </el-row>
        </el-form-item>
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
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'

export default {
  components: {
    TablePage
  },
  data() {
    return {
      rowspan: '',
      tableData: [],
      spanData: [],
      spanNameData: [],
      types: 'database',
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'createTime DESC',
      dbOptions: [],
      list: null,
      settingDialogVisible: false,
      editDialogVisible: false,
      digSettingForm: {
        model_type: 'mongo',
        database: '',
        tableName: '',
        filed: '',
        data_type: 's',
        expire: ''
      },
      digSettingFormConfig: {
        form: {
          labelPosition: 'left',
          labelWidth: '160px'
        },
        defaultModel: {
          data_type: 's'
        },
        items: [
          {
            type: 'select',
            label: this.$t('share_form_setting_connection_name'),
            field: 'model_type',
            options: [],
            required: true
          },
          {
            type: 'select',
            label: this.$t('share_form_setting_table_name'),
            field: 'database',
            options: [],
            required: true,
            filterable: true
          },
          {
            type: 'select',
            label: this.$t('share_form_setting_log_time'),
            field: 'tableName',
            options: [],
            filterable: true
          }
        ]
      },
      editForm: {
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
      logSaveList: [1, 2, 3, 4, 5, 6, 7]
    }
  },
  created() {
    // this.getDbOptions()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  watch: {
    'createForm.tableName'(val) {
      let includesTimeField = []
      let selectTable = this.createFormConfig.items[2].options.filter(item => item.value === val)
      let schemaField = selectTable && selectTable.length ? selectTable[0].record.fields : []
      this.createFormConfig.items[3].options = []
      this.createForm.filed = ''
      schemaField.forEach(v => {
        if (v.data_type == 'DATE_TIME' || v.data_type == 'DATETIME' || v.data_type == 'DATE' || v.data_type == 'date') {
          includesTimeField.push(v.field_name)
          if (v.field_name == '__tapd8.ts') {
            this.createForm.filed = v.field_name
            // this.indexDefinition[0].key = v.field_name
          }
          this.createFormConfig.items[3].options.push({
            name: v.field_name + `(${v.data_type})`,
            value: v.field_name
          })
        }
      })

      if (this.createForm.tableName && includesTimeField.length === 0) {
        this.createForm.filed = ''
        // this.indexDefinition = [{ key: '', value: 1 }]
        this.$message.error(this.$t('timeToLive.filedGetFailed'))
      }
    }
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
    handleSetting() {
      this.settingDialogVisible = true
      this.$api('logcollector')
        .getSystemConfig()
        .then(res => {
          if (res) {
            console.log('#####', res)
            // this.digSettingFormConfig.items[0].options = res.data
          }
        })
    },

    // 编辑
    handleEdit(item) {
      this.editDialogVisible = true
      let editData = item
      this.editForm = editData
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
    saveEdit() {},

    handleDetail(item) {
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
      padding: 7px;
      background: #f5f5f5;
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
