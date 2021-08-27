<template>
  <div class="database-link nodeStyle">
    <!--    <head class="head">-->
    <!--      <span class="txt">{{ $t('editor.cell.link.mappingRelations') }}</span>-->
    <!--    </head>-->
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form
        :disabled="disabled"
        class="e-form"
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
              <el-popover class="aggtip" placement="top-start" width="400" trigger="hover">
                <span>{{ $t('editor.cell.link.formTip') }}</span>
                <span class="icon iconfont icon-tishi1" slot="reference"></span>
              </el-popover>
            </div>

            <el-checkbox v-model="model.selectSourceDatabase.table" disabled
              >Table
              <el-popover placement="top-start" width="400" trigger="hover">
                <span>{{ $t('editor.cell.link.tableTip') }}</span>
                <span class="icon iconfont icon-tishi1" slot="reference"></span>
              </el-popover>
            </el-checkbox>

            <el-checkbox v-model="model.selectSourceDatabase.view" :disabled="mysqlDisable" @change="changeView"
              >View
              <el-popover placement="top-start" width="400" trigger="hover">
                <span>{{ $t('editor.cell.link.viewTip') }}</span>
                <span class="icon iconfont icon-tishi1" slot="reference"></span>
              </el-popover>
            </el-checkbox>

            <el-checkbox v-model="model.selectSourceDatabase.function" :disabled="mysqlDisable">Function</el-checkbox>
            <el-checkbox v-model="model.selectSourceDatabase.procedure" :disabled="mysqlDisable">Procedure</el-checkbox>
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

        <div class="database-tableBox" v-loading="transferLoading">
          <div class="box-text">
            <h3>{{ $t('editor.cell.link.migrationSetting') }}<i style="color: red"> *</i></h3>
            <div class="box-btn">
              <el-button class="e-button" size="mini" @click="fieldProcess">映射配置</el-button>
              <el-button class="e-button" size="mini" :disabled="model.selectSourceDatabase.view" @click="handDialog">{{
                $t('dataFlow.changeName')
              }}</el-button>
              <el-button
                size="mini"
                class="e-button"
                :disabled="disabled || model.selectSourceDatabase.view"
                @click="handleReduction"
                >{{ $t('editor.cell.link.reduction') }}</el-button
              >
            </div>
          </div>
          <div class="transfer">
            <el-transfer
              filterable
              v-if="!model.transferFlag"
              :titles="titles"
              :filter-method="filterMethod"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              v-model="model.selectSourceArr"
              :data="sourceData"
              @change="handleChangeTransfer"
            >
              <span class="box" slot-scope="{ option }">
                <span v-if="model.selectSourceArr.includes(option.label)">{{ model.table_prefix }}</span>
                <!-- :class="[{ active: option.label !== option.key }, 'text']" -->
                <span :title="option.label">{{ option.label }}</span>
                <span v-if="model.selectSourceArr.includes(option.label)">{{ model.table_suffix }}</span>
                <!-- <span class="nameStyle" @click="handleChageTransfer(option)">{{
								$t('dataFlow.changeName')
							}}</span> -->
              </span>
            </el-transfer>
            <!-- MQ穿梭框 start -->
            <template v-else>
              <MqTransfer
                v-model="mqActiveData"
                :source="sourceData"
                :table_prefix="model.table_prefix"
                :table_suffix="model.table_suffix"
              ></MqTransfer>
              <!-- <el-transfer
                filterable
                class="topic-transfer"
                :titles="topicTitles"
                :filter-method="filterMethod"
                :filter-placeholder="$t('editor.cell.link.searchContent')"
                v-model="model.topicData"
                :data="sourceData"
                :left-default-checked="topicSelected"
                @change="handleChangeTopic"
                @right-check-change="handleSelectTopic"
              >
                <span class="box" slot-scope="{ option }">
                  <span
                    class="text"
                    :title="option.label"
                    :class="[{ active: option.label !== option.key }, 'text']"
                    >{{ option.label }}</span
                  >
                </span>
              </el-transfer> -->
              <!-- <el-tabs v-model="seletecTab" type="border-card">
                <el-tab-pane label="topic" name="topic">Topic</el-tab-pane>
                <el-tab-pane label="queue" name="queue">Queue</el-tab-pane>
              </el-tabs>
              <el-transfer
                filterable
                class="queue-transfer"
                :titles="seletecTab === 'topic' ? topicTitles : queueTitles"
                :filter-method="filterMethod"
                :filter-placeholder="$t('editor.cell.link.searchContent')"
                v-model="mq[seletecTab].value"
                :data="mq[seletecTab].list"
                @change="handleChangeQueueData"
                @left-check-change="handleLeftTable"
                @right-check-change="handleSelectQueue"
              >
                <span class="box" slot-scope="{ option }">
                  <span
                    class="text"
                    :title="option.label"
                    :class="[{ active: option.label !== option.key }, 'text']"
                    >{{ option.label }}</span
                  >
                </span>
              </el-transfer> -->
            </template>
          </div>
        </div>
      </el-form>
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
                v-model="model.table_prefix"
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
                v-model="model.table_suffix"
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
        {{ $t('editor.cell.link.tableNameExample') }}: {{ model.table_prefix }}{{ exampleName }}{{ model.table_suffix }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('dataVerify.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{ $t('dataVerify.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      width="85%"
      title="映射配置"
      :visible.sync="dialogFieldProcessVisible"
      :modal-append-to-body="false"
      custom-class="database-filed-mapping-dialog"
      :close-on-click-modal="false"
      v-if="dialogFieldProcessVisible"
    >
      <FieldMapping
        ref="fieldMappingDom"
        class="custom-field-mapping"
        :remoteMethod="intiFieldMappingTableData"
        :typeMappingMethod="getTypeMapping"
        :fieldProcessMethod="updateFieldProcess"
        :fieldMappingNavData="fieldMappingNavData"
        :field_process="model.field_process"
        @row-click="saveOperations"
        :hiddenFieldProcess="false"
        @update-nav="updateFieldMappingNavData"
      ></FieldMapping>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveReturnData">{{ $t('dataVerify.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog
			:title="$t('message.modifyName')"
			:visible.sync="modifyNameDialog"
			custom-class="modifyNameDialog"
			:close-on-click-modal="false"
		>
			<el-form>
				<el-form-item :label="$t('message.modifyName')">+
					<el-input
						v-model="databaseName"
						autocomplete="off"
						:placeholder="$t('message.modifyName')"
					></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="modifyNameDialog = false">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="confirmName">{{ $t('dataVerify.confirm') }}</el-button>
			</div>
		</el-dialog> -->
  </div>
</template>

<script>
import _ from 'lodash'
import log from '../../../log'
import factory from '../../../api/factory'
import MqTransfer from './mqTransfer'
let connections = factory('connections')
let editorMonitor = null
export default {
  name: 'databaseLink',
  components: { MqTransfer },
  data() {
    return {
      mysqlDisable: false,
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
        selectSourceArr: [],
        topicData: [],
        queueData: [],
        field_process: [], //字段处理器
        transferFlag: false,

        selectSourceDatabase: {
          table: true,
          view: false,
          function: false,
          procedure: false
        }
      },
      topicSelected: [],

      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      //表设置
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      dialogFieldProcessVisible: false,
      scope: ''
    }
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
      }
    }
  },
  methods: {
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
        this.mysqlDisable = sourceDatabaseType === 'mysql' && targetDatabaseType === 'mysql' ? false : true
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

          if (targetFormData.database_type === 'mq' && targetFormData.mqType === '0') {
            this.model.transferFlag = true
            this.mqActiveData.topicData = data.topicData
            this.mqActiveData.queueData = data.queueData
          }
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
              this.model.selectSourceDatabase[key] = selectTargetType.includes(key)
            })
          }
        }
        this.loadDataModels(connectionId)
      }

      editorMonitor = vueAdapter.editor
      this.configJoinTable = cell.configJoinTable && cell.configJoinTable()

      // if (!this.configJoinTable) return
    },

    getData() {
      let result = JSON.parse(JSON.stringify(this.model))
      // console.log(this.model)
      // let includeTables = []
      // for (let i = 0; i < this.sourceData.length; i++) {
      //   for (let j = 0; j < this.model.selectSourceArr.length; j++) {
      //     if (this.sourceData[i].key === this.model.selectSourceArr[j]) {
      //       includeTables.push(this.sourceData[i].key)
      //     }
      //   }
      // }
      if (this.cell) {
        let targetCell = this.cell.getTargetCell()
        if (targetCell && targetCell.getFormData()) {
          let targetFormData = targetCell.getFormData()

          if (targetFormData) {
            targetFormData.dropType = this.model.dropType
            targetFormData.table_prefix = this.model.table_prefix
            targetFormData.table_suffix = this.model.table_suffix
            targetFormData.syncObjects = []
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

      return result
    },

    // 改变view
    changeView(val) {
      if (val) {
        this.handleReduction()
      }
    },

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
    handDialog() {
      this.dialogVisible = true
    },

    // 弹窗确认
    confirm() {
      this.dialogVisible = false
      this.preFixSuffixData()
    },

    // 添加前后缀数据处理
    preFixSuffixData() {
      // if (
      //   this.sourceData &&
      //   this.sourceData.length &&
      //   this.model.selectSourceArr.length
      // ) {
      //   let selectSourceArr = []
      //   this.model.selectSourceArr = Array.from(
      //     new Set(this.model.selectSourceArr)
      //   )
      //   this.sourceData.forEach(sourceName => {
      //     this.model.selectSourceArr.map(k => {
      //       if (k == sourceName.key) {
      //         selectSourceArr.push(k)
      //       }
      //     })
      //   })
      //   this.model.selectSourceArr = selectSourceArr

      //   for (let i = 0; i < this.sourceData.length; i++) {
      //     for (let j = 0; j < this.model.selectSourceArr.length; j++) {
      //       if (this.sourceData[i].key === this.model.selectSourceArr[j]) {
      //         this.sourceData[i].label =
      //           this.model.table_prefix +
      //           this.sourceData[i].key +
      //           this.model.table_suffix
      //       }
      //     }
      //   }
      // }
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
      // if (this.sourceData.length) {
      //   for (let i = 0; i < this.sourceData.length; i++) {
      //     for (let k = 0; k < this.model.selectSourceArr.length; k++) {
      //       if (this.sourceData[i].key === this.model.selectSourceArr[k]) {
      //         this.sourceData[i].label = this.sourceData[i].key
      //       }
      //     }
      //   }
      // }
    },
    //表设置
    fieldProcess() {
      let data = this.getDataFlowData()
      if (!data) return
      delete data['rollback']
      delete data['rollbackTable']
      let promise = this.$api('DataFlows').getMetadata(data)
      promise.then(data => {
        this.dialogFieldProcessVisible = true
        this.fieldMappingNavData = data?.data
      })
    },
    async updateFieldProcess(rollback, rollbackTable, id) {
      let data = this.getDataFlowData()
      if (rollback === 'all') {
        data['rollback'] = rollback
        //删除整个字段处理器
        this.model.field_process = []
      } else if (rollbackTable) {
        data['rollback'] = rollback
        data['rollbackTable'] = rollbackTable
        for (let i = 0; i < this.model.field_process.length; i++) {
          // 删除操作
          let ops = this.model.field_process[i]
          if (ops.table_id === id) {
            this.model.field_process.splice(i, 1)
          }
        }
      }
      let result = this.updateAutoFieldProcess(data)
      let promise = await this.$api('DataFlows').getMetadata(result)
      return promise?.data
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
    },
    //获取当前任务所有的节点
    getDataFlowData() {
      //手动同步更新字段处理器
      let data = this.scope.getDataFlowData()
      let result = this.updateAutoFieldProcess(data)
      return result
    },
    updateAutoFieldProcess(data) {
      for (let i = 0; i < data.stages.length; i++) {
        if (data.stages[i].outputLanes) {
          data['stages'][i].field_process = this.model.field_process
        }
      }
      return data
    },
    //获取表设置
    async intiFieldMappingTableData(row) {
      let source = await this.$api('MetadataInstances').originalData(row.sourceQualifiedName)
      source = source.data && source.data.length > 0 ? source.data[0].fields : []
      let target = await this.$api('MetadataInstances').originalData(row.sinkQulifiedName, '&isTarget=true')
      target = target.data && target.data.length > 0 ? target.data[0].fields : []
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      //源表 目标表数据组合
      let fieldMappingTableData = []
      source.forEach(item => {
        target.forEach(field => {
          //先检查是否被改过名
          let node = {
            t_id: field.id,
            t_field_name: field.field_name,
            t_data_type: field.data_type,
            t_scale: field.scale,
            t_precision: field.precision,
            is_deleted: field.is_deleted, //目标决定这个字段是被删除？
            t_isPrecisionEdit: true, //默认不能编辑
            t_isScaleEdit: true //默认不能编辑
          }
          if (item.field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
          let ops = this.handleFieldName(row, field.field_name)
          if (!ops || ops?.length === 0) return
          ops = ops[0]
          if (ops.operand === field.field_name && ops.original_field_name === item.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    //判断是否改名
    getFieldOperations(row) {
      let operations = []
      if (!this.model.field_process || this.model.field_process.length === 0) return
      let field_process = this.model.field_process.filter(process => process.table_id === row.sourceQualifiedName)
      if (field_process.length > 0) {
        operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
      return operations || []
    },
    //判断是否改名
    handleFieldName(row, fieldName) {
      let operations = this.getFieldOperations(row)
      if (!operations) return
      let ops = operations.filter(op => op.operand === fieldName && op.op === 'RENAME')
      return ops
    },
    //获取typeMapping
    async getTypeMapping(row) {
      let promise = await this.$api('TypeMapping').getId(row.sinkDbType)
      return promise?.data
    },
    saveReturnData() {
      //保存字段映射
      let returnData = this.$refs.fieldMappingDom.returnData()
      if (!returnData.valid) return //检验不通过
      let deleteLen = returnData.target.filter(v => !v.is_deleted)
      if (deleteLen.length === 0) {
        this.$message.error('当前表被删除了所有字段，不允许保存操作')
        return //所有字段被删除了 不可以保存任务
      }
      this.saveOperations(returnData.row, returnData.operations, returnData.target)
      this.dialogFieldProcessVisible = false
    },
    //保存字段处理器
    saveOperations(row, operations, target) {
      if (!target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      this.$api('MetadataInstances').update(where, data)
      this.model.field_process = this.$refs.fieldMappingDom.saveFileOperations()
    },
    // 获取表名称
    loadDataModels(connectionId) {
      let self = this
      if (!connectionId) {
        return
      }
      this.transferLoading = true
      connections
        .customQuery([connectionId], { schema: true })
        .then(result => {
          if (result.data) {
            let tables = []
            // 数据库为mq
            if (result.data.database_type === 'mq') {
              this.model.mqType = result.data.mqType

              let tableData = []
              if (result.data.mqType === '0') {
                let data = [...result.data.mqQueueSet, ...result.data.mqTopicSet]
                tableData = [...new Set(data)]
              } else {
                tableData = result.data.mqTopicSet
              }
              tables = tableData.map(item => {
                return { table_name: item }
              })
            } else {
              tables = (result.data.schema && result.data.schema.tables) || []
            }
            self.databaseInfo = result.data
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            )

            if (tables && tables.length) {
              self.sourceData = tables.map(table => ({
                label: table.table_name,
                key: table.table_name,
                // value: table.table_name,
                disabled: this.disabled
              }))
            }
            self.$forceUpdate()
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    }
    // 修改名称弹窗返回
    // confirmName() {
    // 	let self = this;
    // 	for (let i = 0; i < this.sourceData.length; i++) {
    // 		for (let j = 0; j < self.model.selectSourceArr.length; j++) {
    // 			if (
    // 				this.sourceData[i].label === self.model.selectSourceArr[j] &&
    // 				this.sourceData[i].label === self.currentName.label
    // 			) {
    // 				this.sourceData[i].label = self.model.selectSourceArr[j] = this.sourceData[i].key =
    // 					self.databaseName;
    // 				this.sourceData[i].key = this.sourceData[i].label;
    // 			}
    // 		}
    // 	}

    // 	this.modifyNameDialog = false;
    // },
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
    height: calc(100% - 30px);
    overflow: hidden;
  }
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
  .custom-field-mapping {
    height: 500px;
  }
  .el-dialog__body {
    display: flex;
    flex: 1;
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
