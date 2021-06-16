<template>
  <div class="attr-panel">
    <header class="attr-panel-header">
      <div @click="handleClose" class="header-icon">
        <VIcon>right-circle</VIcon>
      </div>
      <span class="header-txt pl-2">{{
        $t('editor.cell.link.mappingRelations')
      }}</span>
    </header>
    <div class="attr-panel-body overflow-auto">
      <ElForm
        v-if="form"
        class="e-form flex flex-column h-auto"
        label-position="top"
        label-width="160px"
      >
        <FormProvider :form="form">
          <SchemaField
            :schema="schema"
            :scope="{
              getDropOptions,
              useAsyncDataSource,
              loadDatabaseInfo,
              sourceConnectionId: sourceNode.connectionId
            }"
          />
          <!--<FormConsumer>
            <template #default="{ form }">
              {{ form.values }}
            </template>
          </FormConsumer>-->
        </FormProvider>
      </ElForm>
      <!--<ElForm
        :disabled="disabled"
        class="e-form flex flex-column"
        label-position="top"
        label-width="160px"
        :model="node"
        ref="form"
        action="javascript:void(0);"
      >
        <ElFormItem>
          <div class="e-label">
            <label class="el-form-item__label">{{
              $t('editor.cell.link.copySourceDatabase')
            }}</label>
            <el-popover
              class="align-middle"
              placement="top-start"
              width="400"
              trigger="hover"
            >
              <span>{{ $t('editor.cell.link.formTip') }}</span>
              <template #reference>
                <VIcon color="#999">tishi</VIcon>
              </template>
            </el-popover>
          </div>

          <ElCheckboxGroup v-model="syncTypes" @change="syncTypesChanged">
            <ElCheckbox label="table" disabled
              >Table
              <el-popover
                class="align-middle"
                placement="top-start"
                width="400"
                trigger="hover"
              >
                <span>{{ $t('editor.cell.link.tableTip') }}</span>
                <template #reference>
                  <VIcon color="#999">tishi</VIcon>
                </template>
              </el-popover>
            </ElCheckbox>

            <ElCheckbox
              label="view"
              :disabled="mysqlDisable"
              @change="changeView"
              >View
              <el-popover
                class="align-middle"
                placement="top-start"
                width="400"
                trigger="hover"
              >
                <span>{{ $t('editor.cell.link.viewTip') }}</span>
                <template #reference>
                  <VIcon color="#999">tishi</VIcon>
                </template>
              </el-popover>
            </ElCheckbox>
            <ElCheckbox label="function" :disabled="mysqlDisable"
              >Function</ElCheckbox
            >
            <ElCheckbox
              label="procedure"
              v-model="model.selectSourceDatabase.procedure"
              :disabled="mysqlDisable"
              >Procedure</ElCheckbox
            >
          </ElCheckboxGroup>
        </ElFormItem>
        <ElFormItem :label="$t('editor.cell.link.existingSchema.label')">
          <ElSelect
            :value="node.dropType"
            @change="valueChanged($event, 'dropType')"
            size="mini"
          >
            <ElOption
              :label="$t('editor.cell.link.existingSchema.keepSchema')"
              value="no_drop"
            ></ElOption>
            <ElOption
              :label="$t('editor.cell.link.existingSchema.keepExistedData')"
              value="drop_data"
            ></ElOption>
            <ElOption
              v-if="targetDatabaseType === 'mongodb'"
              :label="$t('editor.cell.link.existingSchema.removeSchema')"
              value="drop_schema"
            ></ElOption>
          </ElSelect>
        </ElFormItem>
        <div
          class="database-tableBox flex flex-column flex-grow-1 overflow-hidden"
          v-loading="transferLoading"
        >
          <div class="box-text">
            <h3>
              {{ $t('editor.cell.link.migrationSetting')
              }}<i style="color: red"> *</i>
            </h3>
            <div class="box-btn">
              <el-button
                class="e-button"
                size="mini"
                :disabled="syncTypes.includes('view')"
                @click="handDialog"
                >{{ $t('dataFlow.changeName') }}</el-button
              >
              <el-button
                size="mini"
                class="e-button"
                :disabled="disabled || syncTypes.includes('view')"
                @click="handleReduction"
                >{{ $t('editor.cell.link.reduction') }}</el-button
              >
            </div>
          </div>
          <div class="transfer flex-fill">
            <ElTransfer
              filterable
              :titles="titles"
              :filter-method="filterMethod"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              v-model="tables"
              :data="sourceData"
              @change="handleChangeTransfer"
              @right-check-change="handleSelectTable"
            >
              <span class="box" slot-scope="{ option }">
                <span
                  class="text"
                  :title="option.label"
                  :class="[{ active: option.label !== option.key }, 'text']"
                  >{{ option.label }}</span
                >
              </span>
            </ElTransfer>
          </div>
        </div>
      </ElForm>-->
    </div>
    <el-dialog
      :title="$t('editor.cell.link.batchRename')"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
    >
      <el-form :model="model" :disabled="disabled">
        <el-row :gutter="80" class="e-row">
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.prefixPlaceholder')">
              <el-input
                v-model="table_prefix"
                autocomplete="off"
                maxlength="20"
                show-word-limit
                :placeholder="$t('editor.cell.link.prefixPlaceholder')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.suffixPlaceholder')">
              <el-input
                v-model="table_suffix"
                autocomplete="off"
                maxlength="20"
                show-word-limit
                :placeholder="$t('editor.cell.link.suffixPlaceholder')"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="text">
        {{ $t('editor.cell.link.tableNameExample') }}: {{ table_prefix
        }}{{ exampleName }}{{ table_suffix }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{
          $t('dataVerify.cancel')
        }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('dataVerify.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import log from '@/log'
import factory from '@/api/factory'
import { mapGetters, mapMutations } from 'vuex'
import VIcon from '@/components/VIcon'
import { createForm } from '@formily/core'
import { action } from '@formily/reactive'
import { FormProvider, FormConsumer, createSchemaField } from '@formily/vue'
import { components } from '@/components/form'
import { CheckboxGroup } from '@/components/form/CheckboxGroup'

const { SchemaField } = createSchemaField({
  components
})

let connections = factory('connections')
let editorMonitor = null
let selectKeepArr = []
export default {
  name: 'DatabaseLinkAttribute',
  components: { CheckboxGroup, VIcon, FormProvider, FormConsumer, SchemaField },
  data() {
    return {
      form: null,
      schema: {
        type: 'object',
        properties: {
          dropType: {
            type: 'string',
            title: '对目标端已存在的结构和数据的处理',
            'x-decorator': 'ElFormItem',
            'x-component': 'Select',
            'x-reactions': ['{{getDropOptions}}']
          },
          syncObjects: {
            type: 'array',
            default: [
              {
                type: 'table'
              }
            ],
            enum: [
              {
                label: 'Table',
                value: 'table',
                tooltip: 'editor.cell.link.tableTip',
                disabled: true
              },
              {
                label: 'View',
                value: 'view',
                tooltip: 'editor.cell.link.viewTip'
              },
              {
                label: 'Function',
                value: 'function'
              },
              {
                label: 'Procedure',
                value: 'procedure'
              }
            ],
            'x-component': 'SyncObjects',
            'x-reactions': [
              '{{useAsyncDataSource(loadDatabaseInfo, sourceConnectionId)}}'
            ]
          }
        }
      },

      transferLoading: false,
      currentName: null,
      databaseName: '',
      modifyNameDialog: false,
      dialogVisible: false,
      disabled: false,
      logsFlag: false,
      exampleName: 'tableName',

      configJoinTable: false,
      sourceData: [],
      targetDatabaseType: '',
      model: {
        // label: '',
        table_prefix: '',
        table_suffix: '',
        dropType: 'no_drop',
        type: 'databaseLink',
        selectSourceArr: [],
        selectSourceDatabase: {
          table: true,
          view: false,
          function: false,
          procedure: false
        }
      },

      syncTypes: [],
      tables: [],
      table_prefix: '',
      table_suffix: '',

      titles: [
        this.$t('editor.cell.link.migrationObjece'),
        this.$t('editor.cell.link.chosen')
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', {
      connection: 'activeConnection',
      nodeById: 'nodeById'
    }),

    node() {
      return this.nodeById(this.connection.targetId)
    },

    sourceNode() {
      return this.nodeById(this.connection.sourceId)
    },

    // tables() {
    //   console.log('comp-tables', this.node.syncObjects)
    //   const item = this.node.syncObjects.find(item => item.type === 'table')
    //   return item.objectNames
    // },

    mysqlDisable() {
      const sourceNode = this.sourceNode
      const dbType = this.node.database_type
      return dbType !== 'mysql' || dbType !== sourceNode.database_type
    }
  },

  async mounted() {
    await this.$nextTick()
    this.form = createForm({
      values: this.node
    })
    // this.form.setValues(this.node)

    /*const { syncObjects } = this.node
    if (syncObjects?.length) {
      this.syncTypes.push(...syncObjects.map(item => item.type))
      const item = syncObjects.find(item => item.type === 'table')
      this.tables = item.objectNames
    } else {
      console.warn('syncObjects 至少要有一项，默认是table')
    }

    this.loadDataModels(this.sourceNode.connectionId)*/
  },

  methods: {
    ...mapMutations('dataflow', [
      'setActiveConnection',
      'setNodeValue',
      'setNodeValueByPath'
    ]),

    useAsyncDataSource(service, ...args) {
      return field => {
        field.loading = true
        service(field, ...args).then(
          action(data => {
            field.data = data
            field.loading = false
            console.log('useAsyncDataSource-Action', field)
          })
        )
      }
    },

    async loadDatabaseInfo(field, id) {
      const connectionId = id || field.query('connectionId').get('value')
      if (!connectionId) return
      let result = await connections.customQuery([connectionId], {
        schema: true
      })
      return result.data
    },

    getDropOptions(field) {
      const options = [
        {
          label: this.$t('editor.cell.link.existingSchema.keepSchema'),
          value: 'no_drop'
        },
        {
          label: this.$t('editor.cell.link.existingSchema.keepExistedData'),
          value: 'drop_data'
        }
      ]
      if (field.form.values.database_type === 'mongodb') {
        options.push({
          label: this.$t('editor.cell.link.existingSchema.removeSchema'),
          value: 'drop_schema'
        })
      }
      field.dataSource = options
    },

    setData(data, cell, isSourceDataNode, vueAdapter) {
      if (data) {
        _.merge(this.model, data)
        // this.model.selectSourceDatabase = data.selectSourceDatabase;
      }
      this.cell = cell

      if (cell.getSourceCell()) {
        let sourceCell = this.cell.getSourceCell(),
          targetCell = this.cell.getTargetCell(),
          sourceDatabaseType = sourceCell.getFormData().database_type,
          targetDatabaseType =
            targetCell && targetCell.getFormData().database_type
              ? targetCell.getFormData().database_type
              : '',
          connectionId = sourceCell.getFormData().connectionId
        this.targetDatabaseType = targetDatabaseType
        this.mysqlDisable =
          sourceDatabaseType === 'mysql' && targetDatabaseType === 'mysql'
            ? false
            : true
        if (this.mysqlDisable) {
          this.model.selectSourceDatabase = {
            table: true,
            view: false,
            function: false,
            procedure: false
          }
        }
        // 获取目标节点的数据显示右侧选择表
        if (targetCell && this.model.selectSourceArr.length === 0) {
          let targetFormData = targetCell.getFormData()
          let selectTargetType = []
          this.model.table_prefix = targetFormData.table_prefix
          this.model.table_suffix = targetFormData.table_suffix
          if (targetFormData.syncObjects && targetFormData.syncObjects.length) {
            targetFormData.syncObjects.forEach(item => {
              selectTargetType.push(item.type)
              if (item.type === 'table') {
                this.model.selectSourceArr = item.objectNames
              }
            })
          }

          if (selectTargetType.length) {
            Object.keys(this.model.selectSourceDatabase).forEach(key => {
              this.model.selectSourceDatabase[key] =
                selectTargetType.includes(key)
            })
          }
        }

        this.loadDataModels(connectionId)
      }

      editorMonitor = vueAdapter.editor
      this.configJoinTable = cell.configJoinTable && cell.configJoinTable()

      if (!this.configJoinTable) return
    },

    getData() {
      let result = JSON.parse(JSON.stringify(this.model))

      let includeTables = []
      for (let i = 0; i < this.length; i++) {
        for (let j = 0; j < this.model.selectSourceArr.length; j++) {
          if (this.sourceData[i].key === this.model.selectSourceArr[j]) {
            includeTables.push(this.sourceData[i].key)
          }
        }
      }

      if (this.cell) {
        let targetCell = this.cell.getTargetCell()
        if (targetCell && targetCell.getFormData()) {
          let targetFormData = targetCell.getFormData()

          if (targetFormData) {
            targetFormData.dropType = this.model.dropType
            targetFormData.table_prefix = this.model.table_prefix
            targetFormData.table_suffix = this.model.table_suffix
            targetFormData.syncObjects = []
            if (this.model.selectSourceDatabase) {
              Object.keys(this.model.selectSourceDatabase).forEach(key => {
                if (this.model.selectSourceDatabase[key]) {
                  targetFormData.syncObjects.push({
                    type: key,
                    objectNames:
                      key === 'table' ? this.model.selectSourceArr : []
                  })
                }
              })
            }
          }
        }
      }

      return result
    },

    // 改变view
    changeView(val) {
      if (val) {
        this.handleReduction()
      }
    },

    // 关闭当前页
    handleClose() {
      this.$emit('deselectConnection')
    },

    // 是否是编辑模式
    setDisabled(disabled) {
      this.disabled = disabled
    },

    // // 查看监控按钮
    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },

    // 修改名称
    handleChageTransfer(data) {
      this.modifyNameDialog = true
      this.currentName = data
    },

    // 穿梭框值改变的时候
    handleChangeTransfer(tables) {
      // this.sourceData.forEach(el => {
      //   if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
      //     el.label = el.key
      //   }
      // })
      // this.preFixSuffixData()

      this.setNodeValueByPath({
        id: this.node.id,
        path: 'syncObjects.objectNames',
        conditions: [
          {
            type: 'table'
          }
        ],
        value: tables
      })

      console.log('node', this.node)

      /*const syncObjects = [...this.node.syncObjects]
      const syncItem = syncObjects.find(item => item.type === 'table')

      syncItem.objectNames = tables

      this.valueChanged(syncObjects, 'syncObjects')*/
    },

    // 穿梭框搜索
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1
    },

    // 已选择的表
    handleSelectTable(data) {
      selectKeepArr = data
    },

    // 添加前后缀弹窗开关
    handDialog() {
      this.table_prefix = this.node.table_prefix
      this.table_suffix = this.node.table_suffix
      this.dialogVisible = true
    },

    // 弹窗确认
    confirm() {
      this.dialogVisible = false
      this.valueChanged(this.table_prefix, 'table_prefix')
      this.valueChanged(this.table_suffix, 'table_suffix')
      this.preFixSuffixData()
    },

    // 添加前后缀数据处理
    preFixSuffixData() {
      // FIXME 临时逻辑
      let { tables } = this
      let len = tables.length
      if (len) {
        const sourceKeys = this.sourceData.map(item => item.key)
        tables = this.tables.filter(t => sourceKeys.includes(t))
        if (len !== tables.length) {
          // FIXME 临时逻辑
          // 如果表不存在，更新syncObjects
          this.setNodeValueByPath({
            id: this.node.id,
            path: 'syncObjects.objectNames',
            conditions: [
              {
                type: 'table'
              }
            ],
            value: tables
          })
        }
      }

      if (this.sourceData && this.sourceData.length && tables.length) {
        const { table_prefix = '', table_suffix = '' } = this.node

        this.sourceData.forEach(item => {
          if (tables.includes(item.key)) {
            item.label = table_prefix + item.key + table_suffix
          }
        })
      }
    },

    // 还原
    handleReduction() {
      this.model.table_suffix = ''
      this.model.table_prefix = ''
      if (this.sourceData.length) {
        for (let i = 0; i < this.sourceData.length; i++) {
          // for (let j = 0; j < selectKeepArr.length; j++) {
          for (let k = 0; k < this.model.selectSourceArr.length; k++) {
            if (
              // this.sourceData[i].label === selectKeepArr[j] &&
              this.sourceData[i].key === this.model.selectSourceArr[k]
            ) {
              this.sourceData[i].label = this.sourceData[i].key
              // this.sourceData[i].key = this.sourceData[i].label;
              // this.model.selectSourceArr[k] = this.sourceData[i].value;
            }
            // 	}
          }
        }
      }
    },

    // 获取表名称
    loadDataModels(connectionId) {
      if (!connectionId) {
        return
      }
      this.transferLoading = true
      connections
        .customQuery([connectionId], { schema: true })
        .then(result => {
          if (result.data) {
            this.databaseInfo = result.data
            let tables = (result.data.schema && result.data.schema.tables) || []
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
            )

            if (tables && tables.length) {
              this.sourceData = tables.map(table => ({
                label: table.table_name,
                key: table.table_name,
                // value: table.table_name,
                disabled: this.disabled
              }))
              if (this.sourceData.length) {
                this.preFixSuffixData()
              }
            }
            this.$forceUpdate()
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    },

    valueChanged(value, key) {
      this.setNodeValue({
        id: this.node.id,
        key,
        value
      })
    },

    syncTypesChanged(types) {
      // const { ...syncObjects } = this.node
      // const oldTypes = syncObjects.map(item => item.type)
      console.log('this.tables', this.tables)
      const new_syncObjects = types.map(type => {
        return {
          type,
          syncObjects: type === 'table' ? this.tables : []
        }
      })

      this.valueChanged(new_syncObjects, 'syncObjects')

      // types.forEach(t => {
      //   if (!oldTypes.includes(t)) {
      //   }
      // })
      // console.log('syncTypesChanged', arguments)
    }
  },

  destroyed() {
    log('DatabaseLink.destroyed')
    if (this.unwatch) this.unwatch()
    if (this.targetCell) {
      this.targetCell.off('change:outputSchema', this.renderSchema, this)
    }
    delete this.unwatch
    delete this.cell
    delete this.targetCell
  }
}
</script>

<style lang="scss" scoped>
$radius: 4px;

.attr-panel {
  box-sizing: border-box;

  ::v-deep {
    .e-form {
      height: 100%;
      .database-tableBox {
        padding-top: 10px;
        height: calc(100% - 140px);
        box-sizing: border-box;
        .box-text {
          display: flex;
          padding-bottom: 10px;
          justify-content: space-between;
          font-size: 12px;
          color: #333;
          h3 {
            color: #606266;
          }
          .box-btn {
            color: #48b6e2;
            cursor: pointer;
            .e-button {
              padding: 4px 10px;
              color: #666;
              background-color: #f5f5f5;
            }
          }
        }
      }
    }

    .el-form-item {
      position: relative;
      margin-bottom: 14px;
    }

    .database-tableBox {
      .el-checkbox__label {
        height: 30px;
        font-size: 12px !important;
        padding-right: 6px;
      }
      .el-transfer {
        height: 640px;
        .el-transfer-panel {
          width: 298px;
          .el-transfer-panel__body {
            .box {
              display: inline-block;
              .nameStyle {
                display: none;
                color: #48b6e2;
                float: right;
                font-size: 12px;
                padding-left: 10px;
              }
              .text {
                width: 230px;
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
          .el-transfer-panel__header {
            height: 28px;
            line-height: 28px;
            background: #f5f5f5;
            .el-checkbox {
              height: 28px;
              line-height: 28px;
              overflow: hidden;
            }
          }
          .el-transfer-panel__filter {
            margin: 10px;
            .el-input__inner {
              border-radius: 3px;
            }
          }
          .el-transfer__button {
            border-radius: 3px;
          }
          .el-transfer__button.is-disabled,
          .el-transfer__button.is-disabled:hover {
            background-color: #f5f5f5;
          }
        }
        .el-transfer-panel:nth-child(3) {
          .el-transfer-panel__body {
            .el-transfer-panel__item .el-checkbox__label:hover {
              .box .nameStyle {
                display: block;
              }
              .active {
                color: rgb(253, 176, 28) !important;
              }
            }
          }
        }
        .el-transfer__buttons {
          padding: 0 20px;
        }
      }
      .el-transfer-panel__item:hover {
        color: #666 !important;
      }
      .transfer {
        height: calc(100% - 32px) !important;
        overflow: auto;
      }
      .el-transfer,
      .el-transfer-panel {
        height: 100% !important;
      }
      .el-transfer-panel__body {
        height: calc(100% - 38px) !important;
      }
      .el-checkbox-group {
        height: calc(100% - 32px);
        padding-bottom: 5px;
        box-sizing: border-box;
      }
      .el-transfer-panel__item {
        width: 100%;
        margin-right: 10px !important;
        box-sizing: border-box;
      }
    }

    .el-transfer {
      display: flex;
      align-items: center;

      &-panel {
        flex: 1;
      }
    }
  }
}
</style>
<style lang="scss">
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
