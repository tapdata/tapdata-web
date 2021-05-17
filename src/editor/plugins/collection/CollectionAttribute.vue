<template>
  <div class="e-collection nodeStyle" :class="{ nodeHeight: disabled }">
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form
        class="e-form"
        label-position="top"
        label-width="160px"
        :model="model"
        ref="form"
        :rules="rules"
        :disabled="disabled"
      >
        <el-form-item
          :label="$t('editor.cell.data_node.collection.form.database.label')"
          prop="connectionId"
          :rules="rules"
          required
        >
          <div style="display: flex">
            <FbSelect
              v-model="model.connectionId"
              :config="databaseSelectConfig"
            ></FbSelect>
            <el-tooltip
              class="item"
              popper-class="collection-tooltip"
              effect="light"
              :content="$t('dataForm.createDatabase')"
              placement="top-start"
            >
              <el-button
                size="mini"
                icon="el-icon-plus"
                style="padding: 7px; margin-left: 7px"
                v-readonlybtn="'datasource_creation'"
                @click="creatDatabase"
              ></el-button>
              <!-- @click="$refs.databaseForm.show({ whiteList: ['mongodb'] })" -->
            </el-tooltip>
            <el-tooltip
              class="item"
              popper-class="collection-tooltip"
              effect="light"
              :content="$t('dataForm.copyDatabase')"
              placement="top-start"
            >
              <div class="el-button" style="padding: 7px; margin-left: 7px">
                <ClipButton :value="copyConnectionId"></ClipButton>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="light"
              popper-class="collection-tooltip"
              :content="$t('dataForm.checkDatabase')"
              placement="top-start"
            >
              <el-button
                size="mini"
                class="iconfont icon-dakai1"
                style="padding: 7px; margin-left: 7px"
                :disabled="!model.connectionId"
                @click="handDatabase"
              ></el-button>
            </el-tooltip>
            <!-- <DatabaseForm ref="databaseForm" @success="loadDataSource"></DatabaseForm> -->
          </div>
        </el-form-item>

        <el-form-item
          :label="$t('editor.cell.data_node.collection.form.collection.label')"
          prop="tableName"
          required
        >
          <div class="flex-block">
            <FbSelect
              class="e-select"
              v-model="model.tableName"
              :config="schemaSelectConfig"
              @change="handleFieldFilterType"
            ></FbSelect>
            <el-tooltip
              class="item"
              popper-class="collection-tooltip"
              effect="light"
              :content="$t('dataForm.createCollection')"
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
              popper-class="collection-tooltip"
              effect="light"
              :content="$t('dataForm.copyCollection')"
            >
              <!-- <el-button size="mini" style="padding: 7px;margin-left: 7px">
								<ClipButton :value="model.tableName"></ClipButton>
							</el-button> -->
              <div class="el-button" style="padding: 7px; margin-left: 7px">
                <ClipButton :value="model.tableName"></ClipButton>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              popper-class="collection-tooltip"
              effect="light"
              :content="$t('dataForm.checkDatabase')"
            >
              <el-button
                size="mini"
                class="iconfont icon-dakai1"
                style="padding: 7px; margin-left: 7px"
                :disabled="!tableNameId"
                @click="handTableName"
              ></el-button>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item>
          <template slot="label">
            {{
              $t('editor.cell.data_node.collection.form.fieldFilterTip.label')
            }}
            <el-tooltip effect="light" popper-class="collection-tooltip">
              <div slot="content">
                <div style="word-break: keep-all">
                  {{
                    $t(
                      'editor.cell.data_node.collection.form.fieldFilterTip.keepAllFields'
                    )
                  }}
                </div>
                <div style="word-break: keep-all">
                  {{
                    $t(
                      'editor.cell.data_node.collection.form.fieldFilterTip.retainedField'
                    )
                  }}
                </div>
                <div style="word-break: keep-all">
                  {{
                    $t(
                      'editor.cell.data_node.collection.form.fieldFilterTip.deleteField'
                    )
                  }}
                </div>
              </div>
              <i class="e-primary el-icon-warning-outline"></i>
            </el-tooltip>
          </template>
          <el-select
            v-model="model.fieldFilterType"
            @change="handleCurrentFieldFilterType"
          >
            <el-option
              v-for="item in filterTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="model.fieldFilterType !== 'keepAllFields'">
          <MultiSelection
            v-model="model.fieldFilter"
            :options="primaryKeyOptions"
            :placeholder="
              model.fieldFilterType === 'retainedField'
                ? $t(
                    'editor.cell.data_node.collection.form.fieldFilter.placeholderKeep'
                  )
                : $t(
                    'editor.cell.data_node.collection.form.fieldFilter.placeholderDelete'
                  )
            "
            @change="handleFilterChange()"
          ></MultiSelection>
        </el-form-item>

        <el-form-item
          required
          :label="
            $t('editor.cell.data_node.collection.form.initialSyncOrder.keep')
          "
          v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
        >
          <div class="flex-block">
            <el-switch
              v-model="model.enableInitialOrder"
              style="margin-right: 20px"
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
          :label="$t('editor.cell.data_node.collection.form.dropTable.label')"
          v-if="dataNodeInfo.isTarget"
        >
          <el-select v-model="model.dropTable" size="mini" :disabled="logsFlag">
            <el-option
              :label="
                $t('editor.cell.data_node.collection.form.dropTable.keep')
              "
              :value="false"
            ></el-option>
            <el-option
              :label="
                $t('editor.cell.data_node.collection.form.dropTable.remove')
              "
              :value="true"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          required
          v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
          :label="
            $t(
              'editor.cell.data_node.collection.form.aggregation.aggregationText'
            )
          "
        >
          <div class="flex-block">
            <el-tooltip
              class="item"
              placement="top-start"
              :disabled="collectionAggregateTip"
              popper-class="collection-tooltip"
              effect="light"
              :content="
                !sync_typeFalg
                  ? $t(
                      'editor.cell.data_node.collection.form.aggregation.seetingAggreTip'
                    )
                  : $t(
                      'editor.cell.data_node.collection.form.aggregation.filterAggreTip'
                    )
              "
            >
              <el-switch
                v-model="model.collectionAggregate"
                inactive-color="#dcdfe6"
                @change="handleAggregation"
                :disabled="!this.sync_typeFalg || this.model.isFilter"
                :active-text="
                  model.collectionAggregate
                    ? $t(
                        'editor.cell.data_node.collection.form.aggregation.enabled'
                      )
                    : $t(
                        'editor.cell.data_node.collection.form.aggregation.disabled'
                      )
                "
                style="margin-right: 20px"
              ></el-switch>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item
          v-if="model.collectionAggrPipeline && model.pipelineFalg"
          class="aggregation-item"
        >
          <div class="flex-block">
            <div class="head">Pipeline</div>
            <el-input
              class="e-textarea"
              type="textarea"
              disabled
              v-model="model.collectionAggrPipeline"
            ></el-input>
          </div>
          <el-tooltip
            class="item"
            popper-class="collection-tooltip"
            effect="light"
            :content="$t('dataFlow.edit')"
          >
            <el-button
              size="mini"
              class="iconfont icon-bianji edit"
              style="padding: 7px; margin-left: 7px"
              @click="aggregationDialog = true"
            ></el-button>
          </el-tooltip>
        </el-form-item>

        <el-form-item
          required
          :label="
            $t('editor.cell.data_node.collection.form.filter.fiflterSetting')
          "
          v-if="dataNodeInfo.isSource || !dataNodeInfo.isTarget"
        >
          <div class="flex-block">
            <el-tooltip
              class="item"
              popper-class="collection-tooltip"
              effect="light"
              :disabled="filterTooltip"
              placement="top-start"
              :content="
                $t(
                  'editor.cell.data_node.collection.form.aggregation.filterAggreTip'
                )
              "
            >
              <el-switch
                v-model="model.isFilter"
                :disabled="model.collectionAggregate"
                @change="handleIsFilter"
                inactive-color="#dcdfe6"
                :active-text="
                  model.isFilter
                    ? $t(
                        'editor.cell.data_node.collection.form.aggregation.enabled'
                      )
                    : $t(
                        'editor.cell.data_node.collection.form.aggregation.disabled'
                      )
                "
                style="margin-right: 20px"
              ></el-switch>
            </el-tooltip>
          </div>
        </el-form-item>

        <queryBuilder
          v-if="
            (dataNodeInfo.isSource || !dataNodeInfo.isTarget) && model.isFilter
          "
          v-model="model.custSql"
          v-bind:initialOffset.sync="model.initialOffset"
          :primaryKeyOptions="primaryKeyOptions"
          v-bind:selectedFields.sync="model.selectedFields"
          v-bind:custFields.sync="model.custFields"
          :tableName="model.tableName"
          :disabled="disabled"
          :databaseType="model.databaseType"
          :mergedSchema="defaultSchema"
        ></queryBuilder>
      </el-form>
      <div class="e-entity-wrap" style="text-align: center">
        <el-button
          class="fr"
          type="success"
          size="mini"
          v-if="model.connectionId && model.tableName"
          @click="hanlderLoadSchema"
        >
          <i class="el-icon-loading" v-if="reloadModelLoading"></i>
          <span v-if="reloadModelLoading">{{
            $t('dataFlow.loadingText')
          }}</span>
          <span v-else>{{ $t('dataFlow.updateModel') }}</span>
        </el-button>
        <entity
          v-loading="schemaSelectConfig.loading"
          :schema="convertSchemaToTreeData(defaultSchema)"
          :editable="false"
          :operations="model.operations"
        ></entity>
      </div>
    </div>
    <CreateTable
      v-if="addtableFalg"
      :dialog="dialogData"
      @handleTable="getAddTableName"
    ></CreateTable>
    <relatedTasks :taskData="taskData" v-if="disabled"></relatedTasks>
    <el-dialog
      :title="$t('message.prompt')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="30%"
    >
      <span>{{ $t('editor.ui.nodeLoadSchemaDiaLog') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="mini">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" size="mini" @click="confirmDialog">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog>

    <AggregationDialog
      :aggregationDialog="aggregationDialog"
      v-if="aggregationDialog"
      :model="model"
      ref="aggregationChild"
      @backAggregateResult="backAggregateResult"
      @closeAggregationDialog="closeAggregationDialog"
    ></AggregationDialog>

    <el-dialog
      append-to-body
      :visible.sync="repeatTableDiao"
      custom-class="repeatDialog"
      :close-on-click-modal="false"
      width="30%"
    >
      <div class="dialogMain">
        <div class="head">
          {{ $t('dialog.library') }}
          (<span class="databaseColor" @click="handDatabase">{{
            copyConnectionId
          }}</span
          >){{ $t('dialog.sameTable') }}
        </div>

        <div v-for="(item, index) in repeatTable" :key="index">{{ item }}</div>
        <p>{{ $t('dialog.repeatTip') }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import DatabaseForm from '../../../view/job/components/DatabaseForm/DatabaseForm';
import MultiSelection from '../../../components/MultiSelection'
import RelatedTasks from '../../../components/relatedTasks'
import ClipButton from '@/components/ClipButton'
import queryBuilder from '@/components/QueryBuilder'
import CreateTable from '@/components/dialog/createTable'
import AggregationDialog from './aggregationDialog'
import {
  convertSchemaToTreeData,
  mergeJoinTablesToTargetSchema,
  removeDeleted,
  uuid
} from '../../util/Schema'
import Entity from '../link/Entity'
import _ from 'lodash'
import ws from '../../../api/ws'
import factory from '../../../api/factory'
let connectionApi = factory('connections')
const MetadataInstances = factory('MetadataInstances')
// let editorMonitor = null;
let tempSchemas = []
const RETAINED_OPS_TPL = {
  id: '',
  op: 'RETAINED'
}
const DELETE_OPS_TPL = {
  id: '',
  op: 'DELETE'
}
export default {
  name: 'Collection',
  components: {
    Entity,
    MultiSelection,
    ClipButton,
    RelatedTasks,
    CreateTable,
    queryBuilder,
    AggregationDialog
  },
  props: {
    database_types: {
      type: Array,
      default: function () {
        return ['mongodb']
      }
    }
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
        this.loadDatabaseId(this.model.connectionId)
        this.loadDataModels(this.model.connectionId)
        if (this.model.connectionId) {
          this.taskData.id = this.model.connectionId
          if (this.databaseSelectConfig.options.length) {
            this.databaseSelectConfig.options.forEach(item => {
              if (item.value === this.model.connectionId) {
                this.copyConnectionId = item.name
              }
            })
          }
        }
      }
    },
    'model.tableName': {
      immediate: true,
      handler() {
        let schemas = tempSchemas
        if (this.schemaSelectConfig.options.length > 0) {
          let schema,
            defaultSchema = {
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
            schema = schemas.filter(s => s.table_name === this.model.tableName)
            schema = schema && schema.length > 0 ? schema[0] : defaultSchema

            let fields = schema.fields || []
            //过滤被删除的字段
            if (fields) {
              fields = removeDeleted(fields)
            }
            // let primaryKeys = fields
            // 	.filter(f => f.primary_key_position > 0)
            // 	.map(f => f.field_name)
            // 	.join(',');
            this.primaryKeyOptions = fields.map(f => f.field_name)
            // if (primaryKeys) {
            // 	this.model.primaryKeys = primaryKeys;
            // } else {
            // 	this.model.primaryKeys = '';
            // }
            this.model.custSql.custFields = fields.map(f => f.field_name)
            this.model.custSql.conditions.length = 0
            this.model.custSql.fieldFilterType = 'keepAllFields'
            this.model.custSql.cSql = ''
            this.model.custSql.editSql = ''
            this.model.custSql.selectedFields.length = 0
            this.model.collectionAggregate = false
            this.model.isFilter = false
            this.model.collectionAggrPipeline = ''
          }
          this.$emit('schemaChange', _.cloneDeep(schema))
        }

        this.taskData.tableName = this.model.tableName
        this.tableIsLink()
      }
    },
    defaultSchema: {
      handler() {
        if (
          this.defaultSchema &&
          this.defaultSchema.fields &&
          this.defaultSchema.fields.length > 0
        ) {
          let fields = this.defaultSchema.fields
          //过滤被删除的字段
          if (fields) {
            fields = removeDeleted(fields)
          }
          this.primaryKeyOptions = fields.map(f => f.field_name)
          // if (!this.model.primaryKeys) {
          // 	let primaryKeys = fields.filter(f => f.primary_key_position > 0).map(f => f.field_name);
          // 	if (primaryKeys.length > 0) this.model.primaryKeys = Array.from(new Set(primaryKeys)).join(',');
          // }
        }
      }
    }
  },
  data() {
    let self = this
    return {
      dialogDatabaseTypeVisible: false,
      aggregationDialog: false,
      reloadModelLoading: false,
      addtableFalg: false,
      dialogData: null,
      databaseData: [],
      copyConnectionId: '',
      tableNameId: '',

      dialogVisible: false,
      logsFlag: false,
      taskData: {
        id: '',
        tableName: ''
      },
      disabled: false,
      filterTypeOptions: [
        {
          label: this.$t(
            'editor.cell.data_node.collection.form.fieldFilterType.keepAllFields'
          ),
          value: 'keepAllFields'
        },
        {
          label: this.$t(
            'editor.cell.data_node.collection.form.fieldFilterType.retainedField'
          ),
          value: 'retainedField'
        },
        {
          label: this.$t(
            'editor.cell.data_node.collection.form.fieldFilterType.deleteField'
          ),
          value: 'deleteField'
        }
      ],
      databaseSelectConfig: {
        size: 'mini',
        placeholder: this.$t('editor.cell.data_node.database.form.placeholder'),
        loading: false,
        filterable: true,
        on: {
          change() {
            self.handlerConnectionChange()
          }
        },
        options: []
      },

      schemaSelectConfig: {
        size: 'mini',
        placeholder: this.$t(
          'editor.cell.data_node.collection.form.collection.placeholder'
        ),
        loading: false,
        filterable: true,
        options: [],
        allowCreate: false,
        defaultFirstOption: false,
        clearable: true
      },

      rules: {
        connectionId: [
          { required: true, trigger: 'blur', message: `Please select database` }
        ],
        filter: {
          type: 'string',
          message: this.$t(
            'editor.cell.data_node.collection.form.filter.invalidJSON'
          ),
          validator: (rule, value) => {
            if (value) {
              try {
                JSON.parse(value)
                return true
              } catch (e) {
                return false
              }
            }
          }
        }
      },
      dataNodeInfo: {},
      model: {
        connectionId: '',
        databaseType: 'mongodb',
        tableName: '',
        dropTable: false,
        type: 'collection',
        // primaryKeys: '',
        isFilter: false,
        sqlFromCust: true,
        custSql: {
          filterType: 'field', //sql
          noFieldFilter: true,
          noLineLimit: true,
          selectedFields: [],
          fieldFilterType: 'keepAllFields',
          limitLines: '',
          cSql: '',
          editSql: '',
          conditions: []
        },
        filter: '',
        fieldFilterType: 'keepAllFields',
        fieldFilter: '',
        initialSyncOrder: 0,
        enableInitialOrder: false,
        operations: [],
        collectionAggregate: false,
        collectionAggrPipeline: '',
        pipelineFalg: false
      },
      primaryKeyOptions: [],
      fieldFilterOptions: [],
      defaultSchema: null,
      aggregationStatus: '',
      filterTooltip: true,
      sync_typeFalg: false,
      loading: false,
      collectionAggregateTip: true,
      repeatTableDiao: false,
      repeatTable: []
    }
  },

  async mounted() {
    await this.loadDataSource()

    if (this.model.connectionId) {
      this.taskData.id = this.model.connectionId
      if (this.databaseSelectConfig.options.length) {
        this.databaseSelectConfig.options.forEach(item => {
          if (item.value === this.model.connectionId) {
            this.copyConnectionId = item.name
          }
        })
      }
    }
    this.collectionAggregateTip = !this.sync_typeFalg
      ? false
      : !this.model.isFilter
      ? true
      : false
    this.filterTooltip = this.model.collectionAggregate ? false : true
  },

  methods: {
    creatDatabase() {
      let href = '/#/connections/create?databaseType=mongodb'
      window.open(href, '_blank')
    },

    // 新建表弹窗
    addNewTable() {
      this.addtableFalg = true
      this.dialogData = {
        type: 'collection',
        title: this.$t('dialog.createCollection'),
        placeholder: this.$t('dialog.placeholderCollection'),
        visible: this.addtableFalg
      }
    },

    // 获取新建表名称
    getAddTableName(val) {
      this.model.tableName = val
      this.tableIsLink()
      this.defaultSchema = null
      let schema = {
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
      this.$emit('schemaChange', _.cloneDeep(schema))
    },

    // 打开数据目录数据库
    handDatabase() {
      let href = '/#/metadataInstances/' + this.databaseData[0].id
      window.open(href)
    },

    // 跳转到数据目录当前表
    handTableName() {
      this.tableNameId = ''
      this.tableIsLink()

      if (this.tableNameId) {
        let href = '/#/metadataInstances/' + this.tableNameId
        window.open(href)
      }
    },

    // 判断表是否可以跳转
    tableIsLink() {
      this.tableNameId = ''
      if (tempSchemas && tempSchemas.length) {
        tempSchemas.forEach(item => {
          if (item.table_name === this.model.tableName) {
            this.tableNameId = item.tableId
          }
        })
      }
    },

    // 获取数据库id
    loadDatabaseId(connectionId) {
      if (!connectionId) {
        return
      }
      let params = {
        filter: JSON.stringify({
          where: {
            'source.id': connectionId,
            meta_type: {
              in: ['database'] //,
            },
            is_deleted: false
          },
          fields: {
            id: true,
            original_name: true
          }
        })
      }

      MetadataInstances.get(params).then(res => {
        this.databaseData = Object.freeze(res.data)
      })
    },

    handleFilterChange() {
      let fieldFilter = this.model.fieldFilter
        ? this.model.fieldFilter.split(',')
        : []

      let fieldList = this.getFieldData(fieldFilter)
      if (this.model.fieldFilterType === 'retainedField') {
        this.handleRetainedField(fieldList)
      } else if (this.model.fieldFilterType === 'deleteField') {
        this.handleDeleteField(fieldList)
      }
      this.$nextTick(() => {
        this.$emit('schemaChange', _.cloneDeep(this.defaultSchema))
      })
    },
    handleRetainedField(fieldFilter) {
      this.model.operations = []

      fieldFilter.forEach(f => {
        let self = this
        let ops = self.model.operations.filter(
          v => v.op === 'RETAINED' && v.id === f.id
        )
        let op
        if (ops.length === 0) {
          op = Object.assign(_.cloneDeep(RETAINED_OPS_TPL), {
            id: f.id,
            field: f.field_name
          })
          self.model.operations.push(op)
        }
      })
    },
    handleDeleteField(fieldFilter) {
      this.model.operations = []
      fieldFilter.forEach(f => {
        let self = this
        let fn = function (field) {
          let ops = self.model.operations.filter(
            v => v.op === 'DELETE' && v.id === field.id
          )
          let op
          if (ops.length === 0) {
            op = Object.assign(_.cloneDeep(DELETE_OPS_TPL), {
              id: field.id,
              field: field.field_name
            })
            self.model.operations.push(op)
          }
          if (field.children) {
            field.children.forEach(fn)
          }
        }
        if (f) fn(f)
      })
    },
    getFieldData(fieldFilter) {
      let currentFiled = []
      fieldFilter.forEach(f => {
        if (f && f.length) {
          let op = this.defaultSchema.fields.find(item => item.field_name === f)
          currentFiled.push(op)
        }
      })
      return currentFiled
    },
    handleFieldFilterType() {
      this.model.operations = []
      this.model.fieldFilter = ''
      this.model.fieldFilterType = 'keepAllFields'
    },
    handleCurrentFieldFilterType(type) {
      this.model.operations = []
      this.model.fieldFilter = ''
      this.model.fieldFilterType = type
      this.$nextTick(() => {
        this.$emit('schemaChange', _.cloneDeep(this.defaultSchema))
      })
    },
    convertSchemaToTreeData,

    async loadDataSource() {
      this.databaseSelectConfig.loading = true
      let result = await connectionApi.get({
        filter: JSON.stringify({
          where: {
            database_type: { in: this.database_types }
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
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} (${item.status})`,
            value: item.id
          }
        })
      }
    },

    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }

      let self = this
      this.schemaSelectConfig.loading = true

      connectionApi
        .get([connectionId])
        .then(result => {
          if (result.data && result.data.schema && result.data.schema.tables) {
            let schemas =
              (result.data.schema && result.data.schema.tables) || []
            tempSchemas = schemas.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
            )
            let tableList = tempSchemas.map(item => ({
              label: item.table_name,
              value: item.table_name
            }))

            // 相同表名提示
            let hash = {}
            this.repeatTable = []
            self.schemaSelectConfig.options = []
            tableList.forEach(item => {
              if (hash[item.value]) {
                this.repeatTable.push(item.value)
              } else {
                self.schemaSelectConfig.options.push(Object.assign({}, item))
                hash[item.value] = 1
              }
            })
            if (this.repeatTable.length > 0 && !this.disabled) {
              this.repeatTableDiao = true
            }

            this.tableIsLink()
          }
        })
        .finally(() => {
          this.schemaSelectConfig.loading = false
        })
    },
    handlerConnectionChange() {
      this.model.tableName = ''
    },
    setData(data, cell, dataNodeInfo, vueAdapter) {
      if (data) {
        let conds
        if (data.custSql && data.custSql.conditions) {
          conds = JSON.parse(JSON.stringify(data.custSql.conditions))
          delete data.custSql.conditions
        }
        _.merge(this.model, data)
        if (
          this.model.custSql &&
          this.model.custSql.conditions &&
          conds &&
          conds.length > 0
        )
          conds.forEach(it => {
            this.model.custSql.conditions.push(it)
          })
        //老数据的兼容处理
        this.model.databaseType = 'mongodb'
        if (data.initialSyncOrder > 0) {
          this.model.enableInitialOrder = true
        }
        if (data.filter && !Object.hasOwnProperty.call(data, 'isFilter')) {
          this.model.custSql.editSql = data.filter
          this.model.custSql.filterType = 'sql'
          this.model.isFilter = true
        } else if (
          this.model.custSql.conditions &&
          this.model.custSql.conditions.length > 0 &&
          !['sql', 'field'].includes(this.model.custSql.filterType)
        ) {
          this.model.custSql.filterType = 'field'
        }
        if (data.connectionId) {
          this.loadDataModels(data.connectionId)
        }

        this.tableIsLink()
      }

      this.dataNodeInfo = dataNodeInfo || {}
      this.defaultSchema = mergeJoinTablesToTargetSchema(
        cell.getSchema(),
        cell.getInputSchema()
      )
      cell.on('change:outputSchema', () => {
        this.defaultSchema = mergeJoinTablesToTargetSchema(
          cell.getSchema(),
          cell.getInputSchema()
        )
      })
      // editorMonitor = vueAdapter.editor;
      let settingData = vueAdapter.editor.getData().settingData
      this.sync_typeFalg =
        settingData.sync_type === 'initial_sync' ? true : false

      // let getCellData = vueAdapter.editor.graph.graph.getCells();

      // connection上一个节点是日志挖掘，已存在的数据表单项禁用
      let sourceCell = cell.graph
        .getConnectedLinks(cell, { inbound: true })
        .map(link => link.getSourceCell().getFormData())
      if (sourceCell && sourceCell.length) {
        this.logsFlag = sourceCell.some(item => item.type === 'log_collect')
        if (this.logsFlag) {
          this.model.dropTable = true
        }
      }
    },
    getData() {
      if (this.model.isFilter) {
        if (this.model.custSql.filterType === 'field')
          this.model.filter = this.model.custSql.cSql
        else this.model.filter = this.model.custSql.editSql
      } else this.model.filter = ''

      let result = _.cloneDeep(this.model)
      result.name = result.tableName || 'Collection'
      if (!this.dataNodeInfo.isTarget) {
        delete result.dropTable
      }
      this.taskData.id = result.connectionId
      this.taskData.tableName = result.tableName
      return result
    },

    setDisabled(disabled) {
      this.disabled = disabled
    },

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },

    //  聚合处理弹窗开启设置
    handleAggregation(val) {
      if (val && !this.model.isFilter) {
        this.aggregationDialog = true
      } else {
        this.aggregationDialog = false
        this.model.collectionAggregate = false
      }
      if (!val) {
        if (this.model.pipelineFalg) {
          this.confirmDialog()
        }
        this.model.pipelineFalg = false
      }
      if (this.model.isFilter) {
        this.model.collectionAggregate = false
      }
      this.filterTooltip = this.model.collectionAggregate ? false : true
    },

    // 过滤设置开启任务
    handleIsFilter() {
      this.collectionAggregateTip = !this.sync_typeFalg
        ? false
        : !this.model.isFilter
        ? true
        : false
      // this.filterTooltip = this.model.collectionAggregate ? false : true;
    },

    // 更新模型点击弹窗
    hanlderLoadSchema() {
      this.dialogVisible = true
    },

    // 确定更新模型弹窗
    confirmDialog() {
      this.reloadModelLoading = true

      if (
        this.model.collectionAggregate &&
        !!this.model.collectionAggrPipeline
      ) {
        let params = {
          type: 'aggregatePreview',
          data: {
            connectionId: this.model.connectionId,
            tableName: this.model.tableName,
            pipeline: this.model.collectionAggrPipeline || '[]'
          }
        }
        ws.ready(() => {
          ws.send(params)
        })

        ws.on('aggregatePreviewResult', res => {
          let templeSchema = null
          if (res.status === 'SUCCESS' && !!res.result) {
            if (res.result.relateDataBaseTable) {
              templeSchema = res.result.relateDataBaseTable
            }
            this.defaultSchema = templeSchema
            this.$emit('schemaChange', _.cloneDeep(templeSchema))
          } else {
            self.$message.error(this.$t('message.reloadSchemaError'))
          }
          this.reloadModelLoading = false
        })
      } else {
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

        ws.ready(() => {
          ws.send(params)
        })
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
              if (
                item.connId === this.model.connectionId &&
                item.tableName === this.model.tableName
              ) {
                schema = item.schema
              }
            })
          }
          self.$nextTick(() => {
            if (schema) {
              self.$emit('schemaChange', _.cloneDeep(schema))
              self.defaultSchema = schema
              self.$message.success(this.$t('message.reloadSchemaSuccess'))
            }
          })
        })
      }

      this.dialogVisible = false
    },

    // 获取aggregation数据
    backAggregateResult(pipeline, schema) {
      this.model.collectionAggrPipeline = pipeline
      this.model.pipelineFalg = true
      this.aggregationDialog = false

      this.defaultSchema = schema

      this.$emit('schemaChange', _.cloneDeep(this.defaultSchema))
    },

    // 关闭aggregation弹窗
    closeAggregationDialog() {
      if (!this.model.pipelineFalg) {
        this.model.collectionAggregate = false
      }

      this.aggregationDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.e-collection {
  .e-entity-wrap {
    flex: 1;
    overflow: auto;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
}
</style>
<style lang="scss">
.e-collection {
  .iconfont {
    font-size: 12px;
  }
  .el-switch__label {
    font-size: 12px !important;
    color: #666 !important;
    font-weight: normal !important;
  }
  .aggregation-item {
    .el-form-item__content {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      align-content: flex-start;
    }
    .flex-block {
      display: block;
      width: 90%;
      .head {
        width: 100%;
        height: 28px;
        padding-left: 12px;
        line-height: 27px;
        color: #333;
        font-size: 12px;
        border: 1px solid #dedee4;
        border-bottom: 0;
        box-sizing: border-box;
        background-color: #f5f5f5;
      }
      .e-textarea {
        .el-textarea__inner {
          min-height: 240px !important;
        }
      }
    }

    .edit {
      display: inline-block;
      padding-left: 20px;
      cursor: pointer;
    }
  }
  .repeatDialog {
    .dialogMain {
      .head {
        padding-bottom: 10px;
        .databaseColor {
          color: #48b6e2;
          cursor: pointer;
        }
      }
      p {
        padding-top: 10px;
      }
    }
  }
}
.collection-tooltip.is-light {
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
