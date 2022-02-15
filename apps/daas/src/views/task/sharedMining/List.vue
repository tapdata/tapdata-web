<template>
  <section class="timeToLive-list-wrap">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="timeToLive-list"
      :title="$t('app.menu.' + $route.name)"
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
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('share_list_connection_search')"
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
        <el-button class="btn btn-create" size="mini" @click="handleSetting">
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          <span>{{ $t('share_list_setting') }}</span>
        </el-button>
      </div>
      <el-table-column
        :label="$t('share_list_name')"
        prop="source.name"
        sortable="source.name"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          {{ scope.row.source.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_connection')" prop="tableName" sortable="tableName">
        <template slot-scope="scope">
          {{ scope.row.name || scope.row.original_name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_time_excavation')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.indexName }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('share_list_creat_time')" prop="fields">
        <template slot-scope="scope">
          {{
            typeof scope.row.key === 'string'
              ? Object.keys(JSON.parse(scope.row.key)).join(',')
              : Object.keys(scope.row.key).join(',')
          }}
        </template>
      </el-table-column>
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
      width="600px"
      custom-class="create-dialog"
      :title="$t('share_list_dig_setting')"
      :close-on-click-modal="false"
      :visible.sync="settingDialogVisible"
    >
      <FormBuilder ref="form" v-model="digSettingForm" :config="digSettingFormConfig"></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false" size="small">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="createNewTtl()" size="small">{{ $t('button_confirm') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('share_list_dig_setting')"
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
    >
      <Elform :model="editForm">
        <ElFormItem :label="$t('share_form_edit_name')" size="mini">
          <ElInput v-model="editForm.name"></ElInput>
        </ElFormItem>
        <ElFormItem :label="$t('share_form_edit_dig_time')" size="mini">
          <ElRow>
            <ElCol :span="8" style="margin-right: 10px">
              <ElSelect v-model="editForm.type" placeholder="请选择">
                <ElOption v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </ElOption>
              </ElSelect>
            </ElCol>
            <ElCol :span="14">
              <ElDatePicker
                format="yyyy-MM-dd HH:mm:ss"
                style="width: 95%"
                v-model="editForm.date"
                type="datetime"
              ></ElDatePicker>
            </ElCol>
          </ElRow>
        </ElFormItem>
        <ElFormItem :label="$t('share_form_setting_log_time')" size="mini">
          <ElSelect v-model="editForm.logTtl" placeholder="请选择">
            <ElOption v-for="op in logSaveList" :key="op" :label="op + $t('share_form_edit_day')" :value="op">
            </ElOption>
          </ElSelect>
        </ElFormItem>
      </Elform>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit" size="small">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="saveEdit()" size="small">{{ $t('share_form_edit_give_up') }}</el-button>
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
      order: 'last_updated DESC',
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
          labelPosition: 'right',
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
            // mode: 'text',
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
        type: '',
        date: '',
        logTtl: 3
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
    getData({ page, tags }) {
      let tableArrData = []
      let { current, size } = page
      let { isFuzzy, keyword } = this.searchParams
      let where = {
        is_deleted: false,
        meta_type: 'collection',
        'source.database_type': 'mongodb',
        'source.connection_type': {
          inq: ['target', 'source_and_target']
        },
        indexes: {
          $elemMatch: {
            expireAfterSeconds: { $exists: true },
            create_by: { $ne: 'dba' }
          }
        }
      }
      let fields = {
        id: true,
        _id: true,
        meta_type: true,
        name: true,
        original_name: true,
        source: true,
        'source.id': true,
        'source._id': true,
        'source.name': true,
        'source.user_id': true,
        'source.database_uri': true,
        'source.database_host': true,
        'source.database_name': true,
        indexes: true
      }
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: keyword, options: 'i' } : keyword
        where.or = [
          { name: filterObj },
          { original_name: filterObj },
          { 'source.name': filterObj },
          { 'indexes.name': filterObj }
        ]
      }

      if (tags && tags.length) {
        where['classifications.id'] = {
          in: tags
        }
      }

      if (!parseInt(this.$cookie.get('isAdmin'))) {
        if (!this.$disabledByPermission('time_to_live_all_data')) {
          where['source.user_id'] = {
            regexp: `^${this.$cookie.get('user_id')}$`
          }
        }
      }

      let filter = {
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return this.$api('MetadataInstances')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          this.table.setCache({
            isFuzzy,
            keyword
          })
          if (res.data?.items?.length) {
            this.tableData = res.data.items.map(item => {
              item.indexsFilter = item.indexes.filter(idx => idx.expireAfterSeconds && idx.create_by !== 'dba')
              return item
            })

            this.tableData.forEach(item => {
              for (let i = 0; i < item.indexsFilter.length; i++) {
                for (let key in item.indexsFilter[i]) {
                  if (key === 'name') {
                    item.indexsFilter[i]['indexName'] = item.indexsFilter[i][key]
                    delete item.indexsFilter[i]['name']
                  }
                }
                let rdata = {
                  ...item,
                  ...item.indexsFilter[i]
                }
                rdata.combineNum = item.indexsFilter.length
                delete rdata.indexsFilter
                tableArrData.push(rdata)
                // if (i == 0) {
                //   rowspan.push(rdata.combineNum)
                // } else {
                //   rowspan.push(0)
                // }
              }
            })
          }
          return {
            total: res.data.total,
            data: tableArrData
          }
        })
    },

    // 挖掘设置
    handleSetting() {
      this.settingDialogVisible = true
    },

    // 编辑
    handleEdit(item) {
      this.editDialogVisiblef = true
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
      })
    },

    // 保存编辑
    saveEdit() {},

    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.timeToLive-list-wrap {
  height: 100%;
  .timeToLive-list {
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
}
</style>
<style lang="scss">
.metadata-list-wrap {
  .create-dialog {
    .el-dialog__body {
      padding: 30px;
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
          .el-form-item__label {
            text-align: left;
          }
        }
      }
    }
  }
}
</style>
