<template>
  <section class="metadata-list-wrap classify-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="metadata-list"
      :classify="{
        authority: 'data_catalog_category_management',
        types: metaType
      }"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation">
        <el-button
          v-readonlybtn="'data_catalog_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <i class="iconfont icon-biaoqian back-btn-icon"></i>
          <span> {{ $t('dataFlow.taskBulkTag') }}</span>
        </el-button>
        <el-button
          v-readonlybtn="'new_model_creation'"
          type="primary"
          class="btn btn-create"
          size="mini"
          @click="openCreateDialog"
        >
          <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
          <span>{{ $t('metadata.createModel') }}</span>
        </el-button>
      </div>
      <el-table-column type="selection" width="45" :reserve-selection="true"></el-table-column>
      <el-table-column :label="$t('metadata.header.name')" prop="name" sortable="custom">
        <template slot-scope="scope">
          <div class="metadata-name">
            <div class="name ellipsis">
              <ElLink type="primary" @click="toDetails(scope.row)">
                {{ scope.row.name || scope.row.original_name }}
              </ElLink>
              <el-tag
                v-if="scope.row.classifications && scope.row.classifications.length"
                class="tag"
                type="info"
                effect="dark"
                size="mini"
              >
                {{ scope.row.classifications[0].value }}
              </el-tag>
            </div>
            <div class="parent ellipsis" v-if="scope.row.source">
              {{ scope.row.source.name }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.header.meta_type')" prop="meta_type" sortable="custom">
        <template slot-scope="scope">
          {{ $t('metadata.metaType.' + scope.row.meta_type) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('metadata.header.last_user_name')"
        prop="username"
        sortable="custom"
      ></el-table-column>
      <el-table-column :label="$t('metadata.header.last_updated')" prop="last_updated" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('metadata.details.opera')" width="180">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'data_catalog_edition'"
            size="mini"
            type="text"
            :disabled="
              $disabledByPermission('data_catalog_edition_all_data', scope.row.source ? scope.row.user_id : '')
            "
            @click="toDetails(scope.row)"
          >
            {{ $t('button_details') }}
          </el-button>
          <ElDivider direction="vertical" v-readonlybtn="'data_catalog_edition'"></ElDivider>
          <el-button
            v-readonlybtn="'data_catalog_edition'"
            size="mini"
            type="text"
            :disabled="
              $disabledByPermission('data_catalog_edition_all_data', scope.row.source ? scope.row.user_id : '')
            "
            @click="changeName(scope.row)"
          >
            {{ $t('button.rename') }}
          </el-button>
          <ElDivider direction="vertical" v-readonlybtn="'data_catalog_edition'"></ElDivider>
          <el-button
            v-readonlybtn="'meta_data_deleting'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('meta_data_deleting_all_data', scope.row.source ? scope.row.user_id : '')"
            @click="remove(scope.row)"
            >{{ $t('button_delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建模型 -->
    <el-dialog
      width="500px"
      custom-class="create-dialog"
      :title="$t('metadata_form_create')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <ElForm ref="form" label-position="left" label-width="100px" size="mini" :model="createForm" :rules="createRules">
        <ElFormItem :label="$t('metadata_form_type')" required prop="model_type">
          <ElSelect v-model="createForm.model_type" width="100%">
            <ElOption
              v-for="item in modelTyoeList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            ></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('metadata_form_database')" required prop="database">
          <ElSelect v-model="createForm.database" width="100%">
            <ElOption v-for="item in dbOptions" :label="item.label" :value="item.value" :key="item.value"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem :label="$t('metadata_form_table_name')" required prop="tableName">
          <ElInput v-model="createForm.tableName"></ElInput>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <el-button class="message-button-cancel" @click="createDialogVisible = false" size="mini">{{
          $t('button_cancel')
        }}</el-button>
        <el-button type="primary" @click="createNewModel()" size="mini">{{ $t('button_confirm') }}</el-button>
      </span>
    </el-dialog>
    <!-- 改名 -->
    <el-dialog
      width="500px"
      custom-class="change-name"
      :title="$t('metadata_change_name')"
      :close-on-click-modal="false"
      :visible.sync="changeNameDialogVisible"
    >
      <div class="flex fs-8">
        <span class="change-name-label">{{ $t('metadata_name') }}:</span>
        <el-input v-model="changeNameValue"></el-input>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button class="message-button-cancel" @click="changeNameDialogVisible = false" size="mini">{{
          $t('button_cancel')
        }}</el-button>
        <el-button type="primary" @click="saveChangeName()" size="mini">{{ $t('button_confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
import dayjs from 'dayjs'
import { connectionsApi, metadataInstancesApi } from '@tap/api'

export default {
  components: {
    TablePage,
    FilterBar
  },
  data() {
    let types =
      this.$route.meta.types ||
      'database|job|dataflow|api|table|view|collection|mongo_view|directory|ftp|apiendpoint'.split('|')
    return {
      whiteList: ['table', 'collection', 'mongo_view', 'view'],
      searchParams: {
        keyword: '',
        metaType: '',
        dbId: ''
      },
      order: 'last_updated DESC',
      dbOptions: [],
      metaTypeOptions: types.map(v => {
        return {
          label: this.$t('metadata.metaType.' + v),
          value: v
        }
      }),
      list: null,
      multipleSelection: [],
      createDialogVisible: false,
      createForm: {
        model_type: 'collection',
        database: '',
        tableName: ''
      },
      modelTyoeList: [
        {
          label: this.$t('metadata_form_collection'),
          value: 'collection'
        },
        {
          label: this.$t('metadata_form_mongo_view'),
          value: 'mongo_view'
        }
      ],
      createRules: {
        database: [
          {
            required: true,
            validator: (rule, v, callback) => {
              if (!v || !v.trim()) {
                return callback(new Error(this.$t('metadata_form_database') + this.$t('tips_rule_not_empty')))
              }
              return callback()
            }
          }
        ],
        tableName: [
          {
            required: true,
            validator: (rule, v, callback) => {
              if (!v || !v.trim()) {
                return callback(new Error(this.$t('metadata_form_table_name') + this.$t('tips_rule_not_empty')))
              }
              const flag = /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/.test(v) // eslint-disable-line
              if (v.split('.')[0] == 'system' || !flag) {
                return callback(new Error(this.$t('dialog.placeholderTable')))
              }
              return callback()
            }
          }
        ]
      },
      changeNameDialogVisible: false,
      changeNameValue: '',
      changeNameData: null,
      filterItems: []
    }
  },
  created() {
    this.getDbOptions()
    this.getFilterItems()
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    metaType() {
      let metaType = this.searchParams.metaType
      if (metaType) {
        return [metaType]
      } else {
        return this.$route.meta.types || []
      }
    }
  },
  methods: {
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          metaType: '',
          dbId: ''
        }
      }

      this.table.fetch(1)
    },
    getData({ page, tags }) {
      let { current, size } = page
      let { keyword, metaType, dbId } = this.searchParams
      let where = {
        is_deleted: false
      }
      let fields = {
        name: true,
        original_name: true,
        owner: true,
        meta_type: true,
        description: true,
        qualified_name: true,
        db: true,
        stats: true,
        classifications: true,
        last_user_name: true,
        last_updated: true,
        create_time: true,
        collection: true,
        id: true,
        source: true,
        databaseId: true,
        user_id: true
      }
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ name: filterObj }, { original_name: filterObj }, { 'source.name': filterObj }]
      }

      if (tags && tags.length) {
        where['classifications.id'] = {
          in: tags
        }
      }
      let types = this.$route.meta.types
      if (metaType) {
        where.meta_type = metaType
      } else if (types) {
        where.meta_type = {
          in: types
        }
      }
      dbId && (where['source.id'] = dbId)
      let filter = {
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return metadataInstancesApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          return {
            total: res?.total,
            data:
              res?.items.map(item => {
                item.lastUpdatedFmt = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
                return item
              }) || []
          }
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
        },
        where: {
          connection_type: { $in: ['target', 'source_and_target'] }
        }
      }
      connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let dbOptions = res?.items || []

          this.dbOptions = dbOptions.map(item => {
            return { label: item.name, value: item.id }
          })
        })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
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
      metadataInstancesApi
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
          let db = this.dbOptions.find(it => it.value === database)
          let fields = [
            {
              checked: false,
              create_source: 'manual',
              is_auto_allowed: true,
              alias_name: '',
              field_name: '_id',
              java_type: 'String',
              columnSize: 0,
              precision: 0,
              scale: 0,
              parent: '',
              autoincrement: false,
              primary_key: true,
              foreign_key: false,
              primary_key_position: 1,
              foreign_key_position: 0,
              is_nullable: false,
              unique: false, // 唯一
              comment: '', //长描述
              dictionary: null,
              dictionary_id: '',
              relation: []
            }
          ]
          let params = {
            connectionId: db.value,
            original_name: tableName,
            is_deleted: false,
            meta_type: model_type,
            create_source: 'manual',
            databaseId: db.value,
            // classifications: db.classifications ? db.classifications : [],
            alias_name: '',
            comment: ''
          }
          params.fields = model_type === 'collection' ? fields : []
          metadataInstancesApi.post(params).then(res => {
            if (res) {
              this.createDialogVisible = false
              this.$message.success(this.$t('message_save_ok'))
            }
            // this.toDetails(res.data);
          })
          // .catch(() => {
          //   this.$message.success(this.$t('message_save_fail'))
          // })
        }
      })
    },
    toDetails(item) {
      this.$router.push({ name: 'metadataDetails', params: { id: item.id } })
    },
    saveChangeName() {
      metadataInstancesApi
        .updateById(this.changeNameData.id, {
          name: this.changeNameValue
        })
        .then(() => {
          this.$message.success(this.$t('message_save_ok'))
          this.changeNameDialogVisible = false
          this.table.fetch()
        })
      // .catch(() => {
      //   this.$message.info(this.$t('message_save_fail'))
      // })
    },
    changeName(item) {
      this.changeNameDialogVisible = true
      this.changeNameData = item
      this.changeNameValue = item.name || item.original_name
      // this.$prompt('', this.$t('connection.rename'), {
      //   inputPattern: /^[_a-zA-Z][0-9a-zA-Z_\.\-]*$/, // eslint-disable-line
      //   inputErrorMessage: this.$t('dialog.placeholderTable'),
      //   customClass: 'changeName-prompt',
      //   cancelButtonClass: 'message-button-cancel',
      //   inputValue: item.name || item.original_name
      // }).then(resFlag => {
      //   if (!resFlag) {
      //     return
      //   }
      //  metadataInstancesApi
      //     .updateById(item.id, {
      //       name: resFlag.value
      //     })
      //     .then(() => {
      //       this.$message.success(this.$t('message_save_ok'))
      //       this.table.fetch()
      //     })
      //     .catch(() => {
      //       this.$message.info(this.$t('message_save_fail'))
      //     })
      // })
    },
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#2C65FF' } }, item.original_name)
      ])
      this.$confirm(message, '', {
        type: 'warning',
        closeOnClickModal: false,
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        metadataInstancesApi.delete(item.id).then(() => {
          this.$message.success(this.$t('message.deleteOK'))
          this.table.fetch()
        })
        // .catch(() => {
        //   this.$message.info(this.$t('message.deleteFail'))
        // })
        // .finally(() => {
        //   instance.confirmButtonLoading = false
        // })
      })
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'metadataDefinition',
          query: this.searchParams
        })
      }, debounce)
    },
    getFilterItems() {
      let filter = {
        fields: {
          name: true,
          id: true,
          database_type: true,
          connection_type: true,
          status: true
        }
      }
      this.filterItems = [
        {
          label: this.$t('metadata_type'),
          key: 'metaType',
          type: 'select-inner',
          items: this.metaTypeOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('metadata_db'),
          key: 'dbId',
          type: 'select-inner',
          items: async () => {
            let data = await connectionsApi.findAll(filter)
            let items = data || []
            return items.map(item => {
              return {
                label: item.name,
                value: item.id
              }
            })
          }
        },
        {
          placeholder: this.$t('metadata_name_placeholder'),
          key: 'keyword',
          type: 'input',
          slotName: ''
        }
      ]
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
      // background: map-get($bgColor, main);
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
      // .name {
      //   color: map-get($color, primary);
      //   a {
      //     color: inherit;
      //     cursor: pointer;
      //   }
      // }
      // .name:hover {
      //   text-decoration: underline;
      // }
      .tag {
        margin-left: 5px;
        color: map-get($fontColor, light);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .parent {
        color: map-get($fontColor, slight);
      }
    }
  }
}
</style>
<style lang="scss">
.metadata-list-wrap {
  .create-dialog {
    .el-dialog__body {
      // padding: 30px;
      .el-form {
        .el-form-item {
          margin-bottom: 15px;
          &:last-child {
            margin-bottom: 0;
          }
          .el-form-item__label {
            text-align: left;
          }
          .el-form-item__content {
            .el-select {
              width: 100%;
            }
            .el-form-item__error {
              line-height: 12px;
            }
          }
        }
      }
    }
  }
}
.change-name {
  .change-name-label {
    width: 100px;
    line-height: 32px;
    color: map-get($fontColor, dark);
  }
  // .el-message-box__header {
  //   padding: 15px 15px 0;
  //   .el-message-box__title {
  //     padding-left: 0;
  //   }
  // }
  // .el-message-box__btns {
  //   .el-button {
  //     box-sizing: border-box;
  //   }
  // }
}
</style>
