<template>
  <section class="timeToLive-list-wrap">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="timeToLive-list"
      :title="$t('app.menu.' + $route.name)"
      :classify="{
        authority: 'time_to_live',
        types: ['database']
      }"
      :remoteMethod="getData"
      :spanMethod="handleSpanMethod"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
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
              :placeholder="$t('metadata.namePlaceholder')"
              @input="table.fetch(1, 800)"
            >
              <el-select
                style="width: 120px"
                slot="prepend"
                v-model="searchParams.isFuzzy"
                @input="table.fetch(1)"
              >
                <el-option
                  :label="$t('connection.fuzzyQuery')"
                  :value="true"
                ></el-option>
                <el-option
                  :label="$t('connection.PreciseQuery')"
                  :value="false"
                ></el-option>
              </el-select>
            </el-input>
          </li>
          <template v-if="searchParams.keyword">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{
                $t('button.query')
              }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{
                $t('button.reset')
              }}</el-button>
            </li>
          </template>
        </ul>
      </div>
      <div slot="operation">
        <el-button
          v-readonlybtn="'time_to_live_management'"
          class="btn btn-create"
          size="mini"
          @click="openCreateDialog"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('timeToLive.creatTtl') }}</span>
        </el-button>
      </div>
      <el-table-column
        :label="$t('timeToLive.header.database')"
        prop="source.name"
        sortable="source.name"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          {{ scope.row.source.name }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('timeToLive.header.tableName')"
        prop="tableName"
        sortable="tableName"
      >
        <template slot-scope="scope">
          {{ scope.row.name || scope.row.original_name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('timeToLive.header.indexName')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.indexName }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('timeToLive.header.indexFields')"
        prop="fields"
      >
        <template slot-scope="scope">
          {{
            typeof scope.row.key === 'string'
              ? Object.keys(JSON.parse(scope.row.key)).join(',')
              : Object.keys(scope.row.key).join(',')
          }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('timeToLive.header.expire')" prop="expire">
        <template slot-scope="scope">
          <!-- {{ scope.row.type_data }} -- -->
          {{ getTimeScale(scope.row.type_data) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('timeToLive.header.indexStatus')"
        prop="status"
        sortable="status"
      >
        <template slot-scope="scope">
          {{ $t('timeToLive.status_' + scope.row.status) || scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('timeToLive.header.indexCreate_by')"
        prop="create_by"
      >
        <template slot-scope="scope">
          {{ scope.row.create_by }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('timeToLive.header.operate')">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'time_to_live_management'"
            v-if="scope.row.status === 'created'"
            size="mini"
            type="text"
            :disabled="
              $disabledByPermission(
                'time_to_live_management_all_data',
                scope.row.source ? scope.row.source.user_id : ''
              )
            "
            @click="remove(scope.row)"
            >{{ $t('button.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>

    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('timeToLive.creatTtl')"
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
        <el-button type="primary" @click="createNewTtl()" size="small">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'

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
      multipleSelection: [],
      createDialogVisible: false,
      // indexDefinition: [{ key: '', value: '1' }],
      createForm: {
        model_type: 'mongo',
        database: '',
        tableName: '',
        filed: '',
        data_type: 's',
        expire: ''
      },
      createFormConfig: {
        form: {
          labelPosition: 'right',
          labelWidth: '100px'
        },
        defaultModel: {
          data_type: 's'
        },
        items: [
          {
            type: 'input',
            label: this.$t('timeToLive.form.databaseTypes'),
            field: 'model_type',
            mode: 'text',
            required: true
          },
          {
            type: 'select',
            label: this.$t('timeToLive.form.database'),
            field: 'database',
            options: [],
            required: true,
            filterable: true
          },
          {
            type: 'select',
            label: this.$t('timeToLive.form.tableName'),
            field: 'tableName',
            options: [],
            required: true,
            filterable: true
          },
          {
            type: 'select',
            label: this.$t('timeToLive.form.fieldName'),
            field: 'filed',
            options: [],
            required: true,
            filterable: true
          },
          {
            type: 'input',
            label: this.$t('timeToLive.form.expire'),
            field: 'expire',
            required: true
          },
          {
            type: 'select',
            field: 'data_type',
            options: [
              {
                label: this.$t('timeToLive.s'),
                tip: this.$t('timeToLive.s'),
                value: 's'
              },
              {
                label: this.$t('timeToLive.m'),
                tip: this.$t('timeToLive.m'),
                value: 'm'
              },
              {
                label: this.$t('timeToLive.h'),
                tip: this.$t('timeToLive.h'),
                value: 'h'
              },
              {
                label: this.$t('timeToLive.d'),
                tip: this.$t('timeToLive.d'),
                value: 'd'
              },
              {
                label: this.$t('timeToLive.w'),
                tip: this.$t('timeToLive.w'),
                value: 'w'
              },
              {
                label: this.$t('timeToLive.mo'),
                tip: this.$t('timeToLive.mo'),
                value: 'mo'
              },
              {
                label: this.$t('timeToLive.y'),
                tip: this.$t('timeToLive.y'),
                value: 'y'
              }
            ],
            required: true
          }
        ]
      }
    }
  },
  created() {
    this.getDbOptions()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  watch: {
    'createForm.database'(val) {
      this.loadCollections(val)
    },
    'createForm.tableName'(val) {
      let includesTimeField = []
      let selectTable = this.createFormConfig.items[2].options.filter(
        item => item.value === val
      )
      let schemaField =
        selectTable && selectTable.length ? selectTable[0].record.fields : []
      this.createFormConfig.items[3].options = []
      this.createForm.filed = ''
      schemaField.forEach(v => {
        if (
          v.data_type == 'DATE_TIME' ||
          v.data_type == 'DATETIME' ||
          v.data_type == 'DATE' ||
          v.data_type == 'date'
        ) {
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

      if (includesTimeField.length === 0) {
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
    // 根据秒数获取最大刻度的数值
    getTimeScale(seconds) {
      let val = ''
      if (seconds && Number(seconds) && seconds > 0) {
        if (seconds % (86400 * 360) === 0) {
          val = seconds / (86400 * 360) + this.$t('timeToLive.y')
        } else if (seconds % (86400 * 30) === 0) {
          val = seconds / (86400 * 30) + this.$t('timeToLive.mo')
        } else if (seconds % (86400 * 7) === 0) {
          val = seconds / (86400 * 7) + this.$t('timeToLive.w')
        } else if (seconds % 86400 === 0) {
          val = seconds / 86400 + this.$t('timeToLive.d')
        } else if (seconds % 3600 === 0) {
          val = seconds / 3600 + this.$t('timeToLive.h')
        } else if (seconds % 60 === 0) {
          val = seconds / 60 + this.$t('timeToLive.m')
        } else {
          val = seconds + this.$t('timeToLive.s')
        }
      }
      return val
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
        let filterObj = isFuzzy
          ? { like: toRegExp(keyword), options: 'i' }
          : keyword
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
      return Promise.all([
        this.$api('MetadataInstances').count({ where: where }),
        this.$api('MetadataInstances').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        this.table.setCache({
          isFuzzy,
          keyword
        })
        if (res.data && res.data.length) {
          this.tableData = res.data.map(item => {
            item.indexsFilter = item.indexes.filter(
              idx => idx.expireAfterSeconds && idx.create_by !== 'dba'
            )
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
        this.getSpanArr(tableArrData)
        return {
          total: countRes.data.count,
          data: tableArrData
        }
      })
    },

    getSpanArr(data) {
      // 存放计算好的合并单元格的规则
      this.spanData = []
      this.spanNameData = []
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanData.push(1)
          this.spanNameData.push(1)
          this.pos = 0
          this.position = 0
        } else {
          if (data[i].source.name === data[i - 1].source.name) {
            this.spanData[this.pos] += 1
            this.spanData.push(0)
          } else {
            this.spanData.push(1)
            this.pos = i
          }
          if (data[i].name === data[i - 1].name) {
            this.spanNameData[this.position] += 1
            this.spanNameData.push(0)
          } else {
            this.spanNameData.push(1)
            this.position = i
          }
        }
      }
    },

    // 合并单元格
    handleSpanMethod({ rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanData[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
      if (columnIndex === 1) {
        const _row = this.spanNameData[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    // 获取数据库
    getDbOptions() {
      let filter = {
        fields: {
          name: true,
          id: true,
          database_type: true,
          connection_type: true,
          status: true
        },
        where: {
          database_type: { in: ['mongodb'] }
        }
      }
      if (
        !(
          this.$disabledByPermission('time_to_live_management_all_data') &&
          this.$disabledByPermission('datasource_all_data')
        )
      ) {
        filter.where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` }
      }
      this.$api('connections')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let dbOptions = res.data
          let options = []
          dbOptions.forEach(db => {
            options.push({
              label: db.name,
              value: db.id
            })
          })
          this.createFormConfig.items[1].options = options
        })
    },
    // 获取表
    loadCollections(databaseId) {
      let filter = {
        fields: {
          name: true,
          id: true,
          original_name: true,
          qualified_name: true,
          schema: true,
          indexes: true,
          source: true,
          'source.database_uri': true,
          'source.name': true,
          fields: true
        },
        where: {
          is_deleted: false,
          meta_type: 'collection',
          'source.id': databaseId,
          'source.database_type': 'mongodb',
          or: [
            { 'source.connection_type': 'target' },
            { 'source.connection_type': 'source_and_target' }
          ]
        }
      }
      this.$api('MetadataInstances')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let tables = res.data
          let options = []
          tables.forEach(item => {
            options.push({
              label: item.name,
              value: item.id,
              record: item
            })
          })
          this.createFormConfig.items[2].options = options
        })
    },
    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
      this.table.fetch(1)
    },
    // 分类选择
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 选中分类返回数据
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
    // 创建生命周期弹窗开启
    openCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        model_type: 'mongo',
        database: '',
        tableName: '',
        filed: '',
        data_type: 's',
        expire: ''
      }
    },
    // 保存新建生命周期
    createNewTtl() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          let { tableName, filed, data_type, expire } = _this.createForm
          let selectTable = this.createFormConfig.items[2].options.find(
            it => it.value === tableName
          )
          let key = {}
          key[filed] = 1
          // _this.indexDefinition.forEach(v => (key[v.key] = v.value))
          let collection = selectTable.record || {}
          if (collection.indexes) {
            let _keyJson = JSON.stringify(key)
            let existsIndexes = collection.indexes.filter(
              v => _keyJson === JSON.stringify(v.key)
            )

            if (existsIndexes && existsIndexes.length > 0) {
              _this.$message.error('timeToLive.index_exists')
              return false
            }
          }
          let typeData = ''
          switch (data_type) {
            case 'm':
              typeData = expire * 60
              break
            case 'h':
              typeData = expire * 60 * 60
              break
            case 'd':
              typeData = expire * 60 * 60 * 24
              break
            case 'w':
              typeData = expire * 60 * 60 * 24 * 7
              break
            case 'mo':
              typeData = expire * 60 * 60 * 24 * 30
              break
            case 'y':
              typeData = expire * 60 * 60 * 24 * 300
              break
            default:
              typeData = expire
          }
          let params = {
            task_name: 'mongodb_create_index',
            task_type: 'MONGODB_CREATE_INDEX',
            status: 'waiting',
            task_data: {
              collection_name: collection.original_name,
              data_type: data_type,
              expireAfterSeconds: typeData,
              meta_id: tableName,
              key: JSON.stringify(key),
              name: '',
              ttl: true,
              type_data: typeData,
              unique: false,
              uri: collection.source ? collection.source.database_uri : ''
            }
          }
          _this
            .$api('ScheduleTasks')
            .post(params)
            .then(() => {
              this.createDialogVisible = false
              this.table.fetch()
              // this.toDetails(res.data);
            })
        }
      })
    },

    // 删除生命周期
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#48b6e2' } }, item.original_name)
      ])
      let params = {
        task_name: 'mongodb_drop_index',
        task_type: 'MONGODB_DROP_INDEX',
        status: 'waiting',
        task_data: {
          collection_name: item.original_name,
          meta_id: item.meta_id,
          name: item.indexName,
          uri: item.uri
        }
      }
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            this.$api('ScheduleTasks')
              .post(params)
              .then(() => {
                this.$message.success(this.$t('message.deleteOK'))
                this.table.fetch()
                done()
              })
              .catch(() => {
                this.$message.info(this.$t('message.deleteFail'))
              })
              .finally(() => {
                instance.confirmButtonLoading = false
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
