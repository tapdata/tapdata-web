<template>
  <!-- 索引 -->
  <section class="index-list-wrap">
    <div class="table-page-operation-bar">
      <el-button
        v-readonlybtn="'new_model_creation'"
        class="btn btn-create"
        type="primary"
        size="mini"
        @click="openCreateDialog"
      >
        <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
        <span>{{ $t('metadata.details.index.create') }}</span>
      </el-button>
    </div>
    <!-- 索引表格 start -->
    <el-table ref="table" class="table-page-table" :data="indexTableData">
      <el-table-column :label="$t('metadata.details.index.name')" prop="name"> </el-table-column>
      <el-table-column :label="$t('metadata.details.index.fields')" prop="key">
        <template slot-scope="scope">
          <div v-for="(value, key) in scope.row.key" :key="key">
            {{ key }}&nbsp;:&nbsp;&nbsp;{{ value === 1 ? 'ASC(1)' : value === -1 ? 'DESC(-1)' : value }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.details.index.unique')" prop="unique">
        <template slot-scope="scope">
          <span>{{ $t('metadata.details.index.unique_' + !!scope.row.unique) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.details.index.status')" prop="status">
        <template slot-scope="scope">
          <span>{{ $t('metadata.details.index.status_' + scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.details.index.create_by')" prop="create_by">
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
            style="color: #f56c6c"
            @click="remove(scope.row)"
            v-if="scope.row.name !== '_id_' && scope.row.status === 'created'"
            >{{ $t('button.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 索引表格 end -->
    <!-- 创建索引弹窗 start -->
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="$t('metadata.details.index.create')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <el-form ref="form" :model="createForm" class="dataRule-form">
        <el-form-item :label="$t('metadata.details.index.name')">
          <el-input
            type="text"
            size="mini"
            v-model="createForm.task_data.name"
            :placeholder="$t('dataRule.pleaseSelect') + $t('metadata.details.index.name')"
          ></el-input>
        </el-form-item>
        <el-row
          type="flex"
          :gutter="20"
          class="loopFrom"
          v-for="(item, index) in createForm.indexDefinition"
          :key="index"
        >
          <el-col :span="21" class="fromLoopBox">
            <el-row :gutter="10">
              <el-col :span="16">
                <el-form-item
                  :label="$t('metadata.details.index.definition')"
                  :prop="'indexDefinition.' + index + '.key'"
                  filterable
                  allow-create
                  default-first-option
                >
                  <el-select v-model="item.key" size="mini">
                    <el-option
                      v-for="fieldsItem in fieldsArr"
                      :key="fieldsItem"
                      :label="fieldsItem"
                      :value="fieldsItem"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-select v-model="item.value" size="mini">
                  <el-option
                    v-for="unitItem in [
                      { name: '1(asc)', value: 1 },
                      { name: '-1(desc)', value: -1 },
                      { name: '2dsphere', value: '2dsphere' },
                      { name: '2d', value: '2d' }
                    ]"
                    :key="unitItem.value"
                    :label="unitItem.name"
                    :value="unitItem.value"
                  >
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="4" class="loop-btn">
            <el-button
              plain
              style="padding: 0; color: red"
              type="text"
              @click="removeRow(item, index)"
              v-if="createForm.indexDefinition.length > 1"
            >
              {{ $t('message.delete') }}
            </el-button>
            <el-button
              plain
              style="padding: 0"
              type="text"
              @click="addRow"
              v-if="index === createForm.indexDefinition.length - 1"
            >
              {{ $t('relations.add') }}
            </el-button>
          </el-col>
        </el-row>
        <el-form-item :label="$t('metadata.details.index.options')">
          <el-checkbox v-model="createForm.task_data.background">{{
            $t('metadata.details.index.build_in_background')
          }}</el-checkbox>
          <el-checkbox v-model="createForm.task_data.unique">{{
            $t('metadata.details.index.create_unique')
          }}</el-checkbox>
          <el-checkbox v-model="createForm.task_data.ttl">{{ $t('metadata.details.index.create_ttl') }}</el-checkbox>
        </el-form-item>
        <el-form-item v-if="createForm.task_data.ttl">
          <el-col :span="16">
            <el-input type="text" size="mini" v-model="createForm.task_data.expireAfterSeconds"></el-input>
          </el-col>
          <el-col :span="6" class="fr">
            <el-select v-model="createForm.task_data.data_type" size="mini">
              <el-option v-for="item in dataTypeList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="createNewModel()" size="small">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
    <!-- 创建索引弹窗 end -->
  </section>
</template>

<script>
import { scheduleTasksApi } from '@tap/api'
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
      fieldsArr: [],
      createDialogVisible: false,

      rulesArr: [],
      createForm: {
        task_name: 'mongodb_create_index',
        task_type: 'MONGODB_CREATE_INDEX',
        status: 'waiting',
        indexDefinition: [
          {
            key: '',
            value: 1
          }
        ],
        task_data: {
          name: '',
          key: {},
          unique: false,
          expireAfterSeconds: '',
          collection_name: '',
          background: true,
          uri: '',
          ttl: false,
          type_data: '',
          data_type: 's'
        }
      },
      dataTypeList: [
        { label: this.$t('timeToLive.s'), value: 's' },
        { label: this.$t('timeToLive.m'), value: 'm' },
        { label: this.$t('timeToLive.h'), value: 'h' },
        { label: this.$t('timeToLive.d'), value: 'd' },
        { label: this.$t('timeToLive.w'), value: 'w' },
        { label: this.$t('timeToLive.mo'), value: 'mo' },
        { label: this.$t('timeToLive.y'), value: 'y' }
      ]
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    if (this.indexData.fields) this.fieldsArr = this.indexData.fields.map(item => item.field_name)
  },
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
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    openCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        task_name: 'mongodb_create_index',
        task_type: 'MONGODB_CREATE_INDEX',
        status: 'waiting',
        indexDefinition: [
          {
            key: '',
            value: 1
          }
        ],
        task_data: {
          name: '',
          key: {},
          unique: false,
          expireAfterSeconds: '',
          collection_name: '',
          background: true,
          uri: '',
          ttl: false,
          type_data: '',
          data_type: 's'
        }
      }
    },
    // 保存
    createNewModel() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          let { name, background, unique, ttl, expireAfterSeconds, data_type } = _this.createForm.task_data
          let existsIndexes = _this.indexTableData.filter(it => it.name === name)
          if (existsIndexes && existsIndexes.length > 0) {
            this.$message.error(this.$t('metadata.details.index.name_exists'))
            return false
          }
          let key = {}
          _this.createForm.indexDefinition.forEach(v => (key[v.key] = v.value))
          let _keyJson = JSON.stringify(key)
          existsIndexes = _this.indexTableData.find(v => _keyJson === JSON.stringify(v.key))
          if (existsIndexes) {
            this.$message.error(this.$t('metadata.details.index.index_exists'))
            return false
          }
          let typeData = ''
          switch (data_type) {
            case 'm':
              typeData = expireAfterSeconds * 60
              break
            case 'h':
              typeData = expireAfterSeconds * 60 * 60
              break
            case 'd':
              typeData = expireAfterSeconds * 60 * 60 * 24
              break
            case 'w':
              typeData = expireAfterSeconds * 60 * 60 * 24 * 7
              break
            case 'mo':
              typeData = expireAfterSeconds * 60 * 60 * 24 * 30
              break
            case 'y':
              typeData = expireAfterSeconds * 60 * 60 * 24 * 300
              break
            default:
              typeData = expireAfterSeconds
          }
          let params = {
            task_name: 'mongodb_create_index',
            task_type: 'MONGODB_CREATE_INDEX',
            status: 'waiting',
            task_data: {
              collection_name: _this.indexData.original_name,
              data_type: data_type,
              expireAfterSeconds: typeData,
              meta_id: _this.$route.params.id,
              key: JSON.stringify(key),
              name: name,
              ttl: ttl,
              type_data: typeData,
              unique: unique,
              background: background,
              uri: _this.indexData.source ? _this.indexData.source.database_uri : ''
            }
          }
          scheduleTasksApi.post(params).then(() => {
            this.createDialogVisible = false
            this.$message.success(this.$t('message_save_ok'))
            // this.toDetails(res.data);
          })
          // .catch(() => {
          //   this.$message.error(this.$t('message_save_fail'))
          // })
        }
      })
    },
    // 删除索引
    remove(item) {
      const h = this.$createElement
      let _this = this
      let message = h('p', [this.$t('message.deleteOrNot') + ' ' + item.name])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(res => {
        if (res) {
          scheduleTasksApi
            .post({
              task_name: 'mongodb_drop_index',
              task_type: 'MONGODB_DROP_INDEX',
              status: 'waiting',
              task_data: {
                collection_name: _this.indexData.original_name,
                uri: _this.indexData.source ? _this.indexData.source.database_uri : '',
                name: item.name,
                ns: item.ns,
                meta_id: _this.$route.params.id
              }
            })
            .then(() => {
              this.$message.success(this.$t('message.deleting'))
            })
          // .catch(() => {
          //   this.$message.info(this.$t('message.deleteFail'))
          // })
        }
      })
    },
    // 添加索引字段
    addRow() {
      this.createForm.indexDefinition.push({
        key: '',
        value: '1'
      })
    },
    // 删除索引字段
    removeRow(item, index) {
      this.createForm.indexDefinition.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.index-list-wrap {
  height: 100%;
  .table-page-operation-bar {
    margin-bottom: 10px;
    overflow: hidden;
    .btn-create {
      float: right;
      padding: 7px;
      // background: map-get($bgColor, main);
      i.iconfont {
        font-size: 12px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
  }

  .fr {
    float: right;
  }
}
</style>
<style lang="scss">
.index-list-wrap {
  .create-dialog {
    .el-dialog__body {
      padding: 30px;
      .dataRule-form {
        .el-form-item {
          margin-bottom: 5px;
          .el-form-item__label {
            width: 100px;
            font-size: 14px;
            text-align: left;
          }
          .el-form-item__content {
            margin-left: 100px;
            .el-row {
              display: flex;
              justify-content: left;
            }
            .el-select {
              width: 100%;
            }
            .el-form-item__error {
              top: 82%;
            }
            .template-box {
              padding: 5px 0 8px;
              max-height: 350px;
              min-height: 50px;
              overflow-y: auto;
              .el-row {
                padding-bottom: 5px;
              }
              .el-form-item__content {
                line-height: initial;
                margin: 0;
                .el-form-item__error {
                  top: 100%;
                }
              }
            }
          }
        }
        .fromLoopBox {
          .el-row {
            .el-col {
              line-height: 40px;
            }
          }
        }
        .loop-btn {
          line-height: 40px;
        }
      }
    }
  }
}
</style>
