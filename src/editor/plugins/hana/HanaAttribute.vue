<template>
  <div class="hanaNode nodeStyle">
    <head>
      <span class="headIcon iconfont icon-you2" type="primary"></span>
      <span class="txt">{{ $t('editor.nodeSettings') }}</span>
    </head>
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form class="e-form" label-position="top" :model="model" ref="form" :disabled="disabled">
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item :label="$t('editor.choose') + ' hana'" prop="connectionId" :rules="rules" required>
          <FbSelect v-model="model.connectionId" :config="databaseSelectConfig"></FbSelect>
        </el-form-item>

        <el-form-item
          :label="$t('editor.cell.data_node.table.form.table.label')"
          prop="tableName"
          :rules="rules"
          required
        >
          <div class="flex-block">
            <!-- <FbSelect class="e-select" v-model="model.tableName" :config="schemaSelectConfig"></FbSelect> -->
            <VirtualSelect
              v-model="model.tableName"
              size="mini"
              filterable
              clearable
              :item-size="34"
              :items="schemaSelectConfig.options"
              :loading="schemaSelectConfig.loading"
              :disabled="schemaSelectConfig.loading"
              :placeholder="$t('editor.cell.data_node.table.form.table.placeholder')"
              @change="handleFieldFilterType"
            />
            <el-tooltip
              class="item"
              effect="light"
              popper-class=""
              :content="$t('dataForm.createTable')"
              placement="bottom-start"
            >
              <el-button
                size="mini"
                class="el-icon-plus"
                style="padding: 7px; margin-left: 7px"
                v-readonlybtn="'new_model_creation'"
                @click="addNewTable"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="light"
              popper-class="table-tooltips"
              :content="$t('dataForm.copyTable')"
              placement="bottom-start"
            >
              <div class="el-button" style="padding: 7px; margin-left: 7px">
                <ClipButton :value="model.tableName"></ClipButton>
              </div>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item
          required
          :label="$t('editor.cell.data_node.collection.form.initialSyncOrder.keep')"
          v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
        >
          <div class="flex-block">
            <el-switch
              v-model="model.enableInitialOrder"
              style="margin-right: 20px"
              inactive-color="#dcdfe6"
              :active-text="
                model.enableInitialOrder
                  ? $t('editor.cell.data_node.collection.form.initialSyncOrder.open')
                  : $t('editor.cell.data_node.collection.form.initialSyncOrder.close')
              "
              @change="model.initialSyncOrder = 0"
            ></el-switch>
            <el-input-number
              v-if="model.enableInitialOrder"
              v-model="model.initialSyncOrder"
              controls-position="right"
              :min="1"
              size="mini"
            ></el-input-number>
          </div>
        </el-form-item>

        <el-form-item
          required
          :label="$t('editor.cell.data_node.collection.form.filter.fiflterSetting')"
          v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
        >
          <div class="flex-block">
            <el-switch
              v-model="model.isFilter"
              inactive-color="#dcdfe6"
              :active-text="
                model.isFilter
                  ? $t('editor.cell.data_node.collection.form.filter.openFiflter')
                  : $t('editor.cell.data_node.collection.form.filter.closeFiflter')
              "
              style="margin-right: 20px"
            ></el-switch>
          </div>
        </el-form-item>

        <queryBuilder
          v-if="(dataNodeInfo.isSource || !dataNodeInfo.isTarget) && model.isFilter"
          v-model="model.custSql"
          v-bind:initialOffset.sync="model.initialOffset"
          :primaryKeyOptions="primaryKeyOptions"
          v-bind:selectedFields.sync="model.selectedFields"
          v-bind:custFields.sync="model.custFields"
          :tableName="model.tableName"
          :disabled="disabled"
          :databaseType="model.databaseType"
          :mergedSchema="mergedSchema"
        ></queryBuilder>
        <el-form-item>
          <div class="flex-block fr" style="padding-top: 10px" v-if="model.connectionId && model.tableName">
            <el-button
              class="fr marR20"
              type="success"
              size="mini"
              v-if="!dataNodeInfo.isTarget || !showFieldMapping || !transformModelVersion"
              @click="hanlderLoadSchema"
            >
              <i class="el-icon-loading" v-if="reloadModelLoading"></i>
              <span v-if="reloadModelLoading">{{ $t('dataFlow.loadingText') }}</span>
              <span v-else>{{ $t('dataFlow.updateModel') }}</span>
            </el-button>
            <FieldMapping
              v-else
              ref="fieldMapping"
              class="fr"
              :isDisable="disabled"
              :transform="model"
              :getDataFlow="getDataFlow"
              @update-first="returnModel"
            ></FieldMapping>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="e-entity-wrap" style="text-align: center; overflow: auto">
      <entity :schema="convertSchemaToTreeData(mergedSchema)" :editable="false"></entity>
    </div>
    <el-dialog
      :title="$t('message_title_prompt')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" size="mini" @click="confirmDialog">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
    <CreateTable v-if="addtableFalg" :dialog="dialogData" @handleTable="getAddTableName"></CreateTable>
  </div>
</template>
<script>
import _ from 'lodash'
// import factory from '../../../api/factory'
import Entity from '../link/Entity'
import { convertSchemaToTreeData, uuid, removeDeleted } from '../../util/Schema'
import ClipButton from '@/components/ClipButton'
import CreateTable from '@/components/dialog/createTable'
import FieldMapping from '@/components/FieldMapping'
import queryBuilder from '@/components/QueryBuilder'
import VirtualSelect from 'web-core/components/virtual-select'
import ws from '@/api/ws'
// const connections = factory('connections')

// let editorMonitor = null;
let tempSchemas = []
export default {
  name: 'HanaNode',
  components: { Entity, ClipButton, CreateTable, FieldMapping, queryBuilder, VirtualSelect },
  data() {
    let self = this
    return {
      disabled: false,
      databases: [],
      databaseLoading: false,
      reloadModelLoading: false,
      dialogVisible: false,
      addtableFalg: false,
      dialogData: null,
      schemas: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.chooseApiName')
          }
        ],
        // primaryKeys: [
        // 	{
        // 		required: true,
        // 		trigger: 'blur',
        // 		message: this.$t('editor.cell.data_node.api.none_pk')
        // 	}
        // ],
        tableName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('editor.cell.data_node.api.none_collection')
          }
        ]
      },
      model: {
        connectionId: '',
        type: 'hana',
        databaseType: 'hana',
        tableName: '',
        stageId: '',
        showBtn: true,
        hiddenFieldProcess: true,
        isFirst: true,
        hiddenChangeValue: true,
        enableInitialOrder: false,
        initialSyncOrder: 0,
        isFilter: false,
        initialOffset: '',
        custFields: [],
        custSql: {
          filterType: 'field',
          selectedFields: [],
          fieldFilterType: 'keepAllFields',
          limitLines: '',
          cSql: '',
          editSql: '',
          conditions: []
        }
        // primaryKeys: ''
      },
      schemasLoading: false,
      mergedSchema: null,
      primaryKeyOptions: [],
      scope: '',
      showFieldMapping: false,
      dataNodeInfo: {},
      transformModelVersion: false,
      databaseSelectConfig: {
        size: 'mini',
        placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
        loading: false,
        filterable: true,
        clearable: true,
        on: {
          change() {
            self.handlerConnectionChange()
          }
        },
        options: []
      },
      schemaSelectConfig: {
        size: 'mini',
        placeholder: this.$t('editor.cell.data_node.collection.form.collection.placeholder'),
        loading: false,
        filterable: true,
        options: [],
        allowCreate: false,
        defaultFirstOption: false,
        clearable: true
      }
    }
  },

  async mounted() {
    this.databaseLoading = true
    await this.loadDataSource()
    // let result = await connections.get({
    //   filter: JSON.stringify({
    //     where: {
    //       database_type: 'hana'
    //     },
    //     fields: {
    //       name: 1,
    //       id: 1,
    //       database_type: 1,
    //       connection_type: 1,
    //       status: 1,
    //       schema: 1
    //     },
    //     order: 'name ASC'
    //   })
    // })

    this.databaseLoading = false
    // if (result.data) {
    //   this.databases = result.data
    // }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    },

    'model.connectionId': {
      immediate: true,
      handler() {
        this.loadDataModels(this.model.connectionId)
      }
    },
    'model.tableName': {
      immediate: true,
      handler() {
        // this.handlerSchemaChange()
        if (this.schemaSelectConfig.options.length > 0) {
          let defaultSchema = {
            table_name: this.model.tableName,
            cdc_enabled: true,

            meta_type: 'collection',
            fields: [
              {
                autoincrement: false,
                columnSize: 0,
                dataType: 7,
                data_type: 'OBJECT_ID',
                field_name: '_id',
                id: uuid(),
                is_nullable: true,
                javaType: 'String',
                key: 'PRI',
                original_field_name: '_id',
                precision: 0,
                primary_key_position: 1,
                scale: 0,
                table_name: this.model.tableName
              }
            ]
          }
          if (this.model.tableName) {
            let params = {
              filter: JSON.stringify({
                where: {
                  'source.id': this.model.connectionId,
                  original_name: this.model.tableName,
                  is_deleted: false
                }
              })
            }

            this.$api('MetadataInstances')
              .get(params)
              .then(res => {
                let table = res?.data?.[0] || defaultSchema
                this.defaultSchema = table
                let fields = table.fields || []
                //过滤被删除的字段
                if (fields) {
                  fields = removeDeleted(fields)
                }
                this.primaryKeyOptions = fields.map(f => f.field_name)
                this.model.custSql.custFields = fields.map(f => f.field_name)
                this.model.custSql.conditions.length = 0
                this.model.custSql.fieldFilterType = 'keepAllFields'
                this.model.custSql.cSql = ''
                this.model.custSql.editSql = ''
                this.model.custSql.selectedFields.length = 0
                this.model.collectionAggregate = false
                this.model.isFilter = false
                this.model.collectionAggrPipeline = ''
                table.tableName = this.model.tableName
                this.$emit('schemaChange', _.cloneDeep(table))
              })
          }
        }
      }
    },
    mergedSchema: {
      handler() {
        if (this.mergedSchema?.fields?.length) {
          let fields = this.mergedSchema.fields
          this.primaryKeyOptions = fields.map(f => f.field_name)
          // if (!this.model.primaryKeys) {
          // 	let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
          // 	if (primaryKeys.length > 0) this.model.primaryKeys = Array.from(new Set(primaryKeys)).join(',');
          // }
        }
      }
    }
  },

  methods: {
    convertSchemaToTreeData,

    // 新建表弹窗
    addNewTable() {
      this.addtableFalg = true
      this.dialogData = {
        type: 'table',
        title: this.$t('dialog.createTable'),
        placeholder: this.$t('dialog.placeholderTable'),
        visible: this.addtableFalg
      }
    },

    // 获取新建表名称
    getAddTableName(val) {
      this.model.tableName = val
      this.mergedSchema = null
      let schema = {
        meta_type: 'table',
        table_name: val,
        fields: []
      }
      this.$emit('schemaChange', _.cloneDeep(schema))
    },

    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      let self = this
      // this.schemasLoading = true
      // connections
      //   .get([connectionId])
      //   .then(result => {
      //     if (result.data) {
      //       let schemas = (result.data.schema && result.data.schema.tables) || []
      //       tempSchemas = schemas = schemas.sort((t1, t2) =>
      //         t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
      //       )
      //       self.schemas = schemas.filter(item => {
      //         if (item.table_name) {
      //           return item
      //         }
      //       })
      //     }
      //   })
      //   .finally(() => {
      //     this.schemasLoading = false
      //   })
      this.schemaSelectConfig.loading = true
      self.loading = true
      this.$api('MetadataInstances')
        .getTables(connectionId)
        .then(res => {
          let schemas = res.data
          schemas = Array.from(new Set(schemas))
          self.schemaSelectConfig.options = schemas
            .sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
            .map(item => ({
              label: item,
              value: item
            }))
        })
        .finally(() => {
          this.schemaSelectConfig.loading = false
        })
    },

    handlerSchemaChange() {
      let self = this
      if (tempSchemas.length > 0) {
        let schemas = tempSchemas.filter(s => s.table_name === this.model.tableName)

        if (schemas && schemas.length > 0) {
          this.model.tableId = schemas[0].tableId
        } else {
          this.model.tableId = ''
        }
      }
      if (this.model.tableId) {
        let params = {
          filter: JSON.stringify({
            where: {
              id: this.model.tableId,
              is_deleted: false
            }
          })
        }
        self.loading = true
        this.$api('MetadataInstances')
          .schema(params)
          .then(res => {
            if (res.data) {
              let fields = res.data?.records[0]?.schema?.tables[0]?.fields
              if (fields) {
                self.primaryKeyOptions = fields.map(f => f.field_name)
                self.model.custSql.custFields = fields.map(f => f.field_name)
              }
              this.loadSchema = res.data?.records[0]?.schema?.tables[0] || []
              self.$emit('schemaChange', _.cloneDeep(this.loadSchema))
            }
          })
      } else {
        let schema = {
          cdc_enabled: true,
          fields: [],
          meta_type: 'table',
          table_name: this.model.tableName
        }
        self.$emit('schemaChange', _.cloneDeep(schema))
      }
      // this.taskData.tableName = this.model.tableName
    },

    handleFieldFilterType() {
      this.model.operations = []
      this.model.fieldFilter = ''
      this.model.fieldFilterType = 'keepAllFields'
    },

    setData(data, cell, dataNodeInfo, vueAdapter) {
      if (data) {
        this.scope = vueAdapter?.editor?.scope
        _.merge(this.model, data)
        this.model.stageId = cell.id
        this.getDataFlow()
        let param = {
          stages: this.dataFlow?.stages,
          stageId: this.model.stageId
        }
        this.$api('DataFlows')
          .tranModelVersionControl(param)
          .then(data => {
            this.showFieldMapping = data?.data[this.model.stageId]
          })
      }
      this.dataNodeInfo = dataNodeInfo || {}
      this.mergedSchema = cell.getOutputSchema()
      cell.on('change:outputSchema', () => {
        this.mergedSchema = cell.getOutputSchema()
        this.getDataFlow()
      })
      let conds
      if (data.custSql && data.custSql.conditions) {
        conds = JSON.parse(JSON.stringify(data.custSql.conditions))
        delete data.custSql.conditions
      }
      _.merge(this.model, data)
      if (this.model.custSql && this.model.custSql.conditions && conds && conds.length > 0)
        conds.forEach(it => {
          this.model.custSql.conditions.push(it)
        })
      if (
        data.sql &&
        (!Object.hasOwnProperty.call(data, 'isFilter') || Object.hasOwnProperty.call(data, 'sqlNotFromCust'))
      ) {
        this.model.custSql.editSql = data.sql
        this.model.custSql.filterType = 'sql'
        this.model.isFilter = true
      }
      if (data.initialSyncOrder > 0) {
        this.model.enableInitialOrder = true
      }
      let param = {
        stages: this.dataFlow?.stages,
        stageId: this.stageId
      }
      this.$api('DataFlows')
        .tranModelVersionControl(param)
        .then(data => {
          this.showFieldMapping = data?.data[this.stageId]
        })

      if (this.model.connectionId && this.model.tableName) {
        this.handlerSchemaChange()
      }

      // editorMonitor = vueAdapter.editor;
    },

    getData() {
      if (this.model.isFilter)
        if (this.model.custSql.filterType === 'field') this.model.sql = this.model.custSql.cSql
        else this.model.sql = this.model.custSql.editSql
      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'hana'
      return result
    },

    // 更新模型点击弹窗
    hanlderLoadSchema() {
      this.dialogVisible = true
    },

    // 确定更新模型弹窗
    confirmDialog() {
      this.reloadModelLoading = true
      let params = {
        type: 'reloadSchema',
        data: {
          tables: [
            {
              connId: this.model.connectionId,
              tableName: this.model.tableName
              // userId: this.$cookie.get('user_id')
            }
          ]
        }
      }

      ws.send(params)
      let self = this,
        schema = null,
        templeSchema = []

      ws.on('execute_load_schema_result', res => {
        if (res.status === 'SUCCESS' && res.result && res.result.length) {
          templeSchema = res.result
          this.reloadModelLoading = false
        } else {
          self.$message.error(this.$t('message.reloadSchemaError'))
        }
        this.reloadModelLoading = false
        if (templeSchema && templeSchema.length) {
          templeSchema.forEach(item => {
            if (item.connId === this.model.connectionId && item.tableName === this.model.tableName) {
              schema = item.schema
            }
          })
        }
        self.$nextTick(() => {
          if (schema) {
            self.$emit('schemaChange', _.cloneDeep(schema))
            this.mergedSchema = schema
            self.$message.success(this.$t('message.reloadSchemaSuccess'))
          }
        })
      })
      this.dialogVisible = false
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },
    //获取dataFlow
    getDataFlow() {
      this.dataFlow = this.scope.getDataFlowData(true) //不校验
      if (this.dataFlow?.setting?.transformModelVersion === 'v2') {
        this.transformModelVersion = true
      } else {
        this.transformModelVersion = false
      }
      return this.dataFlow
    },
    //接收是否第一次打开
    returnModel(value) {
      this.model.isFirst = value
    },
    handlerConnectionChange() {
      this.model.tableName = ''
      let list = this.databaseSelectConfig.options
      for (let i = 0; i < list.length; i++) {
        if (this.model.connectionId === list[i].id) {
          this.model.databaseType = list[i]['database_type']
        }
      }
    },
    async loadDataSource() {
      this.databaseSelectConfig.loading = true
      let result = await this.$api('connections').get({
        filter: JSON.stringify({
          where: {
            database_type: 'hana'
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1
          }
        })
      })

      this.databaseSelectConfig.loading = false
      if (result.data) {
        this.databaseSelectConfig.options = result.data.map(item => {
          let statusName = this.$t(`connection.status.${item.status}`)
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} (${statusName})`,
            value: item.id,
            database_type: item.database_type
          }
        })
      }
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>
<style lang="scss">
.hanaNode {
  .el-form-item {
    margin-bottom: 10px;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
  .marR20 {
    margin-right: 20px;
  }
}
</style>
