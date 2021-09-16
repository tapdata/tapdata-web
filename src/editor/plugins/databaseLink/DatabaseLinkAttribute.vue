<template>
  <div class="database-link nodeStyle">
    <div class="nodeBody">
      <el-form
        :disabled="disabled || disabledTransfer"
        class="e-form flex flex-column"
        label-position="top"
        label-width="160px"
        :model="model"
        ref="form"
        action="javascript:void(0);"
      >
        <template v-if="!$window.getSettingByKey('DFS_TCM_PLATFORM')">
          <el-form-item>
            <div class="e-label">
              <label class="el-form-item__label">{{ $t('editor.cell.link.copySourceDatabase') }}</label>
            </div>
            <ElCheckbox
              v-for="item in checkboxList"
              v-model="model.selectSourceDatabase[item.field]"
              :key="item.field"
              :disabled="item.disabled"
              @input="rollbackAll(item.field, $event)"
            >
              {{ item.label }}
              <ElPopover v-if="item.tips" placement="top-start" width="400" trigger="hover">
                <span>{{ item.tips }}</span>
                <span class="icon iconfont icon-tishi1" slot="reference"></span>
              </ElPopover>
            </ElCheckbox>
          </el-form-item>
          <el-form-item :label="$t('editor.cell.link.existingSchema.label')">
            <el-select v-model="model.dropType" size="mini">
              <el-option :label="$t('editor.cell.link.existingSchema.keepSchema')" value="no_drop"></el-option>
              <el-option :label="$t('editor.cell.link.existingSchema.keepExistedData')" value="drop_data"></el-option>
              <el-option
                v-if="targetDatabaseType === 'mongodb'"
                :label="$t('editor.cell.link.existingSchema.removeSchema')"
                value="drop_schema"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>
        <div class="database-tableBox flex-fill overflow-hidden" v-loading="transferLoading">
          <div class="box-text">
            <h3>{{ $t('editor.cell.link.migrationSetting') }}<i style="color: red"> *</i></h3>
            <div class="box-btn">
              <FieldMapping
                v-if="showFieldMapping && transformModelVersion"
                v-show="!model.selectSourceDatabase['view']"
                ref="fieldMapping"
                class="fr"
                mappingType="cluster-clone"
                :transform="model"
                :getDataFlow="getDataFlow"
                @update-first="returnModel"
                @returnFieldMapping="returnFieldMapping"
                @returnPreFixSuffix="returnPreFixSuffix"
              ></FieldMapping>
              <ElButton
                class="fr"
                style="padding: 4px 10px; color: #666; background-color: #f5f5f5; margin-left: 10px"
                @click="editScript = model.script || 'function process(record) {\n\treturn record;\n}'"
                >{{ $t('dag_link_button_custom_script') }}</ElButton
              >
            </div>
          </div>

          <div class="transfer">
            <VirtualTransfer
              v-if="!model.transferFlag"
              v-model="model.selectSourceArr"
              filterable
              :props="{ key: 'original_name' }"
              :item-size="30"
              :titles="titles"
              :data="sourceData"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              @change="handleChangeTransfer"
            >
              <template #left="{ option }"> {{ option.original_name }} </template>
              <template #right="{ option }">
                <span v-if="model.tableNameTransform === 'toLowerCase'">
                  {{ (model.table_prefix + option.original_name + model.table_suffix).toLowerCase() }}
                </span>
                <span v-else-if="model.tableNameTransform === 'toUpperCase'">
                  {{ (model.table_prefix + option.original_name + model.table_suffix).toUpperCase() }}
                </span>
                <span v-else>
                  {{ model.table_prefix + option.original_name + model.table_suffix }}
                </span>
              </template>
            </VirtualTransfer>

            <!-- MQ穿梭框 start -->
            <template v-else>
              <MqTransfer
                v-model="mqActiveData"
                :source="sourceData"
                :table_prefix="model.table_prefix"
                :table_suffix="model.table_suffix"
              ></MqTransfer>
            </template>
          </div>
        </div>
      </el-form>
    </div>
    <ElDialog
      append-to-body
      :title="$t('dag_link_button_custom_script')"
      :visible="!!editScript"
      :close-on-click-modal="false"
      @close="editScript = ''"
    >
      <CodeEditor v-model="editScript" height="300px"></CodeEditor>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editScript = ''">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="saveScript">{{ $t('button_confirm') }}</el-button>
      </div>
    </ElDialog>
  </div>
</template>

<script>
import _ from 'lodash'
import log from '../../../log'
import factory from '../../../api/factory'
import MqTransfer from './MqTransfer'
import FieldMapping from '@/components/FieldMapping'
import VirtualTransfer from 'web-core/components/virtual-transfer'
import MetadataInstances from '@/api/MetadataInstances'
import ws from '@/api/ws'

const metadataApi = new MetadataInstances()

import CodeEditor from '@/components/CodeEditor'
import { ALLOW_FIELD_MAPPING } from '../../constants'
let connections = factory('connections')
let editorMonitor = null
export default {
  name: 'DatabaseLinkAttribute',
  components: { MqTransfer, VirtualTransfer, FieldMapping, CodeEditor },
  data() {
    return {
      checkboxList: [
        { field: 'table', label: 'Table', tips: this.$t('task_job_link_type_table_tips'), disabled: true },
        { field: 'view', label: 'View', tips: this.$t('task_job_link_type_view_tips'), disabled: true },
        { field: 'function', label: 'Function', disabled: true },
        { field: 'procedure', label: 'Procedure', disabled: true }
      ],
      transferLoading: false,
      currentName: null,
      databaseName: '',
      modifyNameDialog: false,
      // dialogVisible: false,
      disabled: false,
      logsFlag: false,
      exampleName: 'tableName',

      configJoinTable: false,
      sourceData: [],
      mqActiveData: {
        topicData: [],
        queueData: [],
        table_prefix: '',
        table_suffix: ''
      },
      targetDatabaseType: '',
      model: {
        // label: '',
        table_prefix: '',
        table_suffix: '',
        dropType: 'no_drop',
        type: 'databaseLink',
        tableNameTransform: '',
        fieldsNameTransform: '',
        fieldNameTransform: '',
        selectSourceArr: [],
        topicData: [],
        queueData: [],
        field_process: [], //字段处理器
        batchOperationList: [],
        transferFlag: false,
        isFirst: true, //初始值
        scope: '',
        stageId: '',
        hiddenFieldProcess: false,
        hiddenChangeValue: false, //是否显示表改大小写
        showBtn: true,
        script: '',
        dataFlow: '',

        selectSourceDatabase: {
          table: true,
          view: false,
          function: false,
          procedure: false
        }
      },
      disabledTransfer: false,
      topicSelected: [],

      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      //表设置
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      scope: '',
      editScript: '',
      showFieldMapping: false,
      transformModelVersion: false
    }
  },
  mounted() {
    let self = this
    ws.on('metadataTransformerProgress', function (res) {
      if (res?.data?.msg === 'dataFlowId is not start transformer') {
        self.disabledTransfer = false
      } else if (!res?.data?.stageId) {
        let status = res?.data?.status
        if (status === 'done') {
          self.disabledTransfer = false
        } else {
          self.disabledTransfer = true
        }
      } else {
        self.disabledTransfer = false
      }
    })
  },
  watch: {
    mqActiveData: {
      deep: true,
      handler() {
        this.model.topicData = this.mqActiveData.topicData
        this.model.queueData = this.mqActiveData.queueData
      }
    },
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
        this.getDataFlow()
      }
    }
    // 'model.tableNameTransform': {
    //   deep: true,
    //   handler(val) {
    //     this.model.tableNameTransform = val
    //   }
    // }
  },
  methods: {
    rollbackAll(field, val) {
      if (field === 'view' && val === true) {
        this.$confirm(this.$t('task_job_link_confirm_message_rollback'), this.$t('message_title_prompt'), {
          type: 'warning',
          closeOnClickModal: false
        }).then(action => {
          if (action) {
            this.$refs.fieldMapping.updateFieldProcess('all')
            //执行还原方法
            this.handleReduction()
          } else {
            this.model.selectSourceDatabase[field] = false
          }
        })
      }
    },
    setData(data, cell, isSourceDataNode, vueAdapter) {
      this.scope = vueAdapter?.editor?.scope
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
            targetCell && targetCell.getFormData().database_type ? targetCell.getFormData().database_type : '',
          connectionId = sourceCell.getFormData().connectionId
        this.targetDatabaseType = targetDatabaseType
        if (sourceDatabaseType === 'mysql' && targetDatabaseType === 'mysql') {
          this.checkboxList.forEach(item => {
            if (item.field !== 'table') {
              item.disabled = false
            }
          })
        }
        if (sourceDatabaseType === 'oracle' && targetDatabaseType === 'oracle') {
          this.checkboxList.forEach(item => {
            if (item.field === 'view') {
              item.disabled = false
            }
          })
        }
        //获取目标节点ID
        this.model.stageId = targetCell?.id || ''

        // 获取目标节点的数据显示右侧选择表

        let targetFormData = targetCell && targetCell.getFormData()
        let sourceFormData = sourceCell && sourceCell.getFormData()
        let selectTargetType = []
        if (targetFormData && targetFormData.database_type === 'mq' && targetFormData.mqType === '0') {
          this.model.transferFlag = true
        }
        if (targetCell && this.model.selectSourceArr.length === 0) {
          // 修改库清空连线选中的表
          if (sourceFormData.isChangeConnectionFlag) {
            targetFormData.syncObjects = []
            sourceFormData.isChangeConnectionFlag = false
          }
          // mq数据源赋值
          if (targetFormData.database_type === 'mq' && targetFormData.mqType === '0') {
            // this.model.transferFlag = true
            this.mqActiveData.topicData = data.topicData
            this.mqActiveData.queueData = data.queueData
          }
          this.model.table_prefix = targetFormData.table_prefix
          this.model.table_suffix = targetFormData.table_suffix
          this.model.script = targetFormData.script

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
              this.model.selectSourceDatabase[key] = selectTargetType.includes(key)
            })
          }
        }
        targetCell && this.loadTables(connectionId, sourceFormData.database_type)
      }

      editorMonitor = vueAdapter.editor
      this.configJoinTable = cell.configJoinTable && cell.configJoinTable()
      this.getDataFlow()
      //是否显示字段推演
      let param = {
        stages: this.dataFlow?.stages,
        stageId: this.model.stageId
      }
      this.$api('DataFlows')
        .tranModelVersionControl(param)
        .then(data => {
          this.showFieldMapping = data?.data[this.model.stageId]
        })

      // if (!this.configJoinTable) return
    },

    getData() {
      let result = JSON.parse(JSON.stringify(this.model))
      if (this.cell) {
        let targetCell = this.cell.getTargetCell()
        if (targetCell && targetCell.getFormData()) {
          let targetFormData = targetCell.getFormData()

          if (targetFormData) {
            targetFormData.dropType = this.model.dropType
            targetFormData.table_prefix = this.model.table_prefix
            targetFormData.table_suffix = this.model.table_suffix
            // targetFormData.tableNameTransform = this.model.tableNameTransform
            // targetFormData.fieldNameTransform = this.model.fieldNameTransform
            targetFormData.syncObjects = []
            targetFormData.script = this.model.script
            if (targetFormData.database_type === 'mq' && targetFormData.mqType === '0') {
              targetFormData.syncObjects = [
                {
                  type: 'queue',
                  objectNames: this.mqActiveData.queueData
                },
                {
                  type: 'topic',
                  objectNames: this.mqActiveData.topicData
                }
              ]
            } else {
              if (this.model.selectSourceDatabase) {
                Object.keys(this.model.selectSourceDatabase).forEach(key => {
                  if (this.model.selectSourceDatabase[key]) {
                    targetFormData.syncObjects.push({
                      type: key,
                      objectNames: key === 'table' ? this.model.selectSourceArr : []
                    })
                  }
                })
              }
            }
          }
        }
      }
      this.getDataFlow()
      return result
    },

    saveScript() {
      this.model.script = this.editScript
      this.editScript = ''
    },

    // 改变view
    // changeView(val) {
    //   if (val) {
    //     this.handleReduction()
    //   }
    // },

    // 关闭当前页
    hanleClose() {
      editorMonitor.getRightSidebar().hide()
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
    handleChangeTransfer() {
      // this.sourceData.forEach(el => {
      //   if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
      //     el.label = el.key
      //   }
      // })
      // this.preFixSuffixData()

      //前后缀 表名改动 需要清空字段处理器
      this.model.field_process = []
    },

    // 穿梭框搜索
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1
    },

    // 已选择的表
    // handleSelectTable(data) {
    //   selectKeepArr = data
    // },

    // 添加前后缀弹窗开关
    // handDialog() {
    //   this.dialogVisible = true
    // },

    // 弹窗确认
    // confirm() {
    //   this.dialogVisible = false
    //   this.preFixSuffixData()
    // },

    // 添加前后缀数据处理
    preFixSuffixData() {
      this.mqActiveData.table_prefix = this.model.table_prefix
      this.mqActiveData.table_suffix = this.model.table_suffix
      //前后缀 表名改动 需要清空字段处理器
      this.model.field_process = []
    },

    // 还原
    handleReduction() {
      this.model.table_suffix = ''
      this.model.table_prefix = ''
      this.mqActiveData.table_prefix = ''
      this.mqActiveData.table_suffix = ''
      //前后缀 表名改动 需要清空字段处理器
      this.model.field_process = []
      this.model.tableNameTransform = ''
      this.model.fieldsNameTransform = ''
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
    returnFieldMapping(field_process) {
      this.model.field_process = field_process
    },
    // 字段处理器返回前后缀
    returnPreFixSuffix(data) {
      this.model.table_prefix = data.table_prefix
      this.model.table_suffix = data.table_suffix
      this.model.tableNameTransform = data.tableNameTransform
      this.model.fieldsNameTransform = data.fieldsNameTransform
      this.model.batchOperationList = data.batchOperationList
    },
    //接收是否第一次打开
    returnModel(value) {
      this.model.isFirst = value
    },

    /**
     * 加载数据库表
     * @param connectionId 连接ID
     * @param dbType 数据库类型
     * @returns {Promise<void>}
     */
    async loadTables(connectionId, dbType) {
      if (!connectionId) return
      this.transferLoading = true
      let tables = []

      try {
        if (dbType !== 'mq') {
          const result = await metadataApi.get({
            filter: JSON.stringify({
              where: {
                'source.id': connectionId,
                meta_type: {
                  in: ['collection', 'table']
                },
                is_deleted: false
              },
              fields: {
                original_name: true
              },
              order: 'original_name ASC'
            })
          })
          tables = result.data
        } else {
          const { data: connectionInfo } = await connections.customQuery([connectionId], { schema: true })
          this.model.mqType = connectionInfo.mqType
          let tableData = []
          if (connectionInfo.mqType === '0') {
            tableData = [...new Set(connectionInfo.mqQueueSet.concat(connectionInfo.mqTopicSet))]
          } else {
            tableData = connectionInfo.mqTopicSet
          }
          tableData.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
          tables = tableData.map(item => ({ original_name: item }))
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.sourceData = tables
      this.transferLoading = false
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
.database-link {
  .head {
    display: block;
  }
  .nodeBody {
    height: 100%;
    overflow: hidden;
  }
  .e-form {
    height: 100%;
    .span-label {
      font-size: 12px;
      color: #606266;
    }
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
          color: #409eff;
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
}
</style>
<style lang="scss">
.database-link {
  .database-tableBox {
    .el-checkbox__label {
      height: 30px;
      font-size: 12px !important;
      padding-right: 6px;
    }
    .el-transfer {
      height: 640px;
      .el-transfer-panel {
        width: 278px;
        .el-transfer-panel__body {
          .box {
            display: inline-block;
            .nameStyle {
              display: none;
              color: #409eff;
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
          padding: 12px !important;
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
        padding: 0 12px;
        .el-button {
          padding: 12px;
        }
      }
    }
    .el-transfer-panel__item:hover {
      color: #666 !important;
    }
    .transfer {
      position: relative;
      height: calc(100% - 32px) !important;
      white-space: nowrap;
      overflow: auto;
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
      // .topic-transfer,
      // .queue-transfer {
      //   & > div:last-child {
      //     position: absolute;
      //     height: 48% !important;
      //   }
      // }
      // .topic-transfer {
      //   & > div:last-child {
      //     top: 0;
      //   }
      //   .el-transfer__buttons {
      //     padding-top: 100px;
      //     vertical-align: top;
      //   }
      // }
      // .queue-transfer {
      //   position: absolute;
      //   top: 0;
      //   width: 0;
      //   // display: inherit;
      //   // height: auto !important;
      //   // & > div:first-child {
      //   //   display: none;
      //   // }
      //   & > div:last-child {
      //     bottom: 0;
      //   }
      //   .el-transfer__buttons {
      //     padding-bottom: 100px;
      //     vertical-align: bottom;
      //   }
      // }
    }
  }
  .aggtip {
    vertical-align: middle;
    .iconfont {
      display: inline-block;
      color: #999;
      cursor: pointer;
      transform: rotate(-180deg);
    }
  }
}
.database-filed-mapping-dialog {
  height: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  .el-dialog__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
