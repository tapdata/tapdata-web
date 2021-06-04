<template>
  <section class="index-list-wrap">
    <div>
      <el-button
        v-readonlybtn="'new_model_creation'"
        class="btn btn-create"
        size="mini"
        @click="openCreateDialog"
      >
        <i class="iconfont icon-jia add-btn-icon"></i>
        <span>{{ $t('metadata.details.index.create') }}</span>
      </el-button>
    </div>
    <el-table ref="table" class="metadata-list" :data="indexTableData">
      <el-table-column :label="$t('metadata.details.index.name')" prop="name">
      </el-table-column>
      <el-table-column :label="$t('metadata.details.index.fields')" prop="key">
        <template slot-scope="scope">
          <div v-for="(value, key) in scope.row.key" :key="key">
            {{ key }}&nbsp;:&nbsp;&nbsp;{{
              value === 1 ? 'ASC(1)' : value === -1 ? 'DESC(-1)' : value
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('metadata.details.index.unique')"
        prop="unique"
      >
        <template slot-scope="scope">
          <span>{{
            $t('metadata.details.index.unique_' + !!scope.row.unique)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('metadata.details.index.status')"
        prop="status"
      >
        <template slot-scope="scope">
          <span>{{
            $t('metadata.details.index.status_' + scope.row.status)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('metadata.details.index.create_by')"
        prop="create_by"
      >
        <!-- <template slot-scope="scope">
          <span>{{
            $t('metadata.details.index.create_by_' + scope.row.create_by)
          }}</span>
        </template> -->
      </el-table-column>
      <el-table-column :label="$t('metadata.details.opera')" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="remove(scope.row)"
            v-if="scope.row.name !== '_id_' && scope.row.status === 'created'"
            >{{ $t('button.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('dataRule.creatRule')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <FormBuilder
        ref="form"
        v-model="createForm"
        :config="createFormConfig"
      ></FormBuilder>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="createNewModel()" size="small">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
export default {
  props: {
    indexData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      indexTableData: [],
      createDialogVisible: false,
      createFormConfig: {
        form: {
          labelPosition: 'right',
          labelWidth: '100px'
        },
        items: [
          {
            type: 'select',
            label: this.$t('metadata.form.type'),
            field: 'model_type',
            options: ['collection', 'mongo_view'].map(t => ({
              label: this.$t('metadata.metaType.' + t),
              value: t
            })),
            required: true
          },
          {
            type: 'select',
            label: this.$t('metadata.form.database'),
            field: 'database',
            options: [],
            required: true
          },
          {
            type: 'input',
            label: this.$t('metadata.form.tableName'),
            field: 'tableName',
            rules: [
              {
                required: true,
                validator: (rule, v, callback) => {
                  if (!v || !v.trim()) {
                    return callback(
                      new Error(this.$t('metadata.form.none_table_name'))
                    )
                  }
                  const flag = /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/.test(v) // eslint-disable-line
                  if (v.split('.')[0] == 'system' || !flag) {
                    return callback(
                      new Error(this.$t('dialog.placeholderTable'))
                    )
                  }
                  return callback()
                }
              }
            ]
          }
        ]
      }
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    getData() {
      if (this.indexData.indexes)
        this.indexData.indexes.forEach(item => {
          let props = {}
          Object.keys(item).forEach(key => {
            if (item.key && typeof item.key === 'string') {
              item.key = JSON.parse(item.key)
            }
            if (['v', 'key', 'name', 'ns'].indexOf(key) === -1) {
              props[key] = item[key]
            }
          })
          this.indexTableData.push(Object.assign({ properties: props }, item))
        })
    },
    getDbOptions() {
      let filter = {
        fields: {
          name: true,
          id: true,
          database_type: true,
          connection_type: true,
          status: true
        }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let dbOptions = res.data
          this.dbOptions = dbOptions
          let options = []
          dbOptions.forEach(db => {
            if (
              db.database_type === 'mongodb' &&
              ['target', 'source_and_target'].includes(db.connection_type)
            ) {
              options.push({
                label: db.name,
                value: db.id
              })
            }
          })
          this.createFormConfig.items[1].options = options
        })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
      this.table.fetch(1)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.classifications && row.classifications.length > 0) {
          tagList[row.classifications[0].id] = {
            value: row.classifications[0].value
          }
        }
      })
      return tagList
    },
    handleOperationClassify(classifications) {
      this.$api('MetadataInstances')
        .classification({
          metadatas: this.multipleSelection.map(it => {
            return {
              id: it.id,
              classifications: classifications
            }
          })
        })
        .then(() => {
          this.table.fetch()
        })
    },
    metaTypeChange(val) {
      if (!this.whiteList.includes(val)) {
        this.searchParams.dbId = ''
      }
      this.table.fetch(1)
    },
    openCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        model_type: 'collection',
        database: '',
        tableName: ''
      }
    },
    createNewModel() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let { model_type, database, tableName } = this.createForm
          let db = this.dbOptions.find(it => it.id === database)
          let params = {
            connectionId: db.id,
            original_name: tableName,
            is_deleted: false,
            meta_type: model_type,
            create_source: 'manual',
            databaseId: db.id,
            classifications: db.classifications,
            alias_name: '',
            comment: ''
          }
          this.$api('MetadataInstances')
            .post(params)
            .then(() => {
              this.createDialogVisible = false
              // this.toDetails(res.data);
            })
        }
      })
    },
    remove(item) {
      const h = this.$createElement
      let _this = this
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#48b6e2' } }, item.name)
      ])
      debugger
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            this.$api('ScheduleTasks')
              .post({
                task_name: 'mongodb_drop_index',
                task_type: 'MONGODB_DROP_INDEX',
                status: 'waiting',
                task_data: {
                  collection_name: _this.indexData.original_name,
                  uri: _this.indexData.source
                    ? _this.indexData.source.database_uri
                    : '',
                  name: item.name,
                  ns: item.ns,
                  meta_id: _this.$route.params.id
                }
              })
              .then(() => {
                done()
                this.$message.success(this.$t('message.deleteOK'))
              })
              .catch(() => {
                this.$message.info(this.$t('message.deleteFail'))
              })
          } else {
            done()
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.metadata-list-wrap {
  height: 100%;
  .metadata-list {
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
        color: #48b6e2;
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
