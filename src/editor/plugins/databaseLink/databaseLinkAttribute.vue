<template>
  <div class="database-link nodeStyle">
    <!--    <head class="head">-->
    <!--      <span @click="hanleClose" class="headIcon iconfont icon-you2" type="primary"></span>-->
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
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
    >
      <FieldMapping :fieldMappingNavData="fieldMappingNavData" :field_process="field_process"></FieldMapping>
    </el-dialog>
    <!-- <el-dialog
			:title="$t('message.modifyName')"
			:visible.sync="modifyNameDialog"
			custom-class="modifyNameDialog"
			:close-on-click-modal="false"
		>
			<el-form>
				<el-form-item :label="$t('message.modifyName')">
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
let connections = factory('connections');
let editorMonitor = null;
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
      field_process: '',
      dialogFieldProcessVisible: false
    }
  },

  watch: {
    mqActiveData: {
      deep: true,
      handler() {
        this.model.topicData = this.mqActiveData.topicData;
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
  mounted() {
    this.metaData()
  },
  methods: {
    setData(data, cell, isSourceDataNode, vueAdapter) {
      if (data) {
        _.merge(this.model, data)
        // this.model.selectSourceDatabase = data.selectSourceDatabase;
      }
      this.cell = cell;

      if (cell.getSourceCell()) {
        let sourceCell = this.cell.getSourceCell(),
          targetCell = this.cell.getTargetCell(),
          sourceDatabaseType = sourceCell.getFormData().database_type,
          targetDatabaseType =
            targetCell && targetCell.getFormData().database_type ? targetCell.getFormData().database_type : '',
          connectionId = sourceCell.getFormData().connectionId;
        this.targetDatabaseType = targetDatabaseType;
        this.mysqlDisable = sourceDatabaseType === 'mysql' && targetDatabaseType === 'mysql' ? false : true;
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
          let targetFormData = targetCell.getFormData();
          let selectTargetType = [];

          if (targetFormData.database_type === 'mq' && targetFormData.mqType === '0') {
            this.model.transferFlag = true;
            this.mqActiveData.topicData = data.topicData;
            this.mqActiveData.queueData = data.queueData
          }
          this.model.table_prefix = targetFormData.table_prefix;
          this.model.table_suffix = targetFormData.table_suffix;

          if (targetFormData.syncObjects && targetFormData.syncObjects.length) {
            targetFormData.syncObjects.forEach(item => {
              selectTargetType.push(item.type);
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

      editorMonitor = vueAdapter.editor;
      this.configJoinTable = cell.configJoinTable && cell.configJoinTable()

      // if (!this.configJoinTable) return
    },

    getData() {
      let result = JSON.parse(JSON.stringify(this.model));
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
        let targetCell = this.cell.getTargetCell();
        if (targetCell && targetCell.getFormData()) {
          let targetFormData = targetCell.getFormData();

          if (targetFormData) {
            targetFormData.dropType = this.model.dropType;
            targetFormData.table_prefix = this.model.table_prefix;
            targetFormData.table_suffix = this.model.table_suffix;
            targetFormData.syncObjects = [];
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
      this.modifyNameDialog = true;
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
      this.dialogVisible = false;
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
      this.mqActiveData.table_prefix = this.model.table_prefix;
      this.mqActiveData.table_suffix = this.model.table_suffix
    },

    // 还原
    handleReduction() {
      this.model.table_suffix = '';
      this.model.table_prefix = '';
      this.mqActiveData.table_prefix = '';
      this.mqActiveData.table_suffix = ''
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
      this.dialogFieldProcessVisible = true
    },
    metaData() {
      let data = {"_id":{"$oid":"610ca47cb17d6c6dfaf49b23"},"name":"新任务_41d461d","description":"","status":"draft","executeMode":"normal","category":"数据库克隆","stopOnError":false,"mappingTemplate":"custom","emailWaring":{"edited":true,"started":false,"error":true,"paused":false},"stages":[{"id":"d6bfd9c5-ba24-4459-a35b-a41bbc470ab0","inputLanes":[],"outputLanes":["68e09839-658b-475a-a47c-fa4cfd7e551d"],"connectionId":"5fcb5c875cb97e20c43888fd","databaseType":"mongodb","tableName":"AccessToken","type":"collection","isFilter":false,"sqlFromCust":true,"custSql":{"filterType":"field","noFieldFilter":true,"noLineLimit":true,"selectedFields":[],"fieldFilterType":"keepAllFields","limitLines":"","cSql":"","editSql":"","conditions":[]},"filter":"","fieldFilterType":"retainedField","fieldFilter":"_id,created,createTime,auth_type,last_updated","initialSyncOrder":0,"enableInitialOrder":false,"operations":[{"id":"5fd03dff0f087f39b9edc612","op":"RETAINED","field":"_id"},{"id":"5fd03dff0f087f39b9edc611","op":"RETAINED","field":"created"},{"id":"5fd03dff0f087f39b9edc610","op":"RETAINED","field":"createTime"},{"id":"5fd03dff0f087f39b9edc60f","op":"RETAINED","field":"auth_type"},{"id":"5fd03dff0f087f39b9edc60e","op":"RETAINED","field":"last_updated"}],"collectionAggregate":false,"collectionAggrPipeline":"","pipelineFalg":false,"name":"AccessToken","freeTransform":false,"dataQualityTag":false,"joinTables":[],"dropTable":false},{"id":"5c180f52-72d8-4259-8fb2-0a5996b978ce","inputLanes":["68e09839-658b-475a-a47c-fa4cfd7e551d"],"outputLanes":[],"connectionId":"5fcb5c875cb97e20c43888fd","databaseType":"mongodb","tableName":"AccessToken1","dropTable":false,"type":"collection","isFilter":false,"sqlFromCust":true,"custSql":{"filterType":"field","noFieldFilter":true,"noLineLimit":true,"selectedFields":[],"fieldFilterType":"keepAllFields","limitLines":"","cSql":"","editSql":"","conditions":[]},"filter":"","fieldFilterType":"keepAllFields","fieldFilter":"","initialSyncOrder":0,"enableInitialOrder":false,"operations":[],"collectionAggregate":false,"collectionAggrPipeline":"","pipelineFalg":false,"name":"AccessToken1","freeTransform":false,"dataQualityTag":false,"joinTables":[{"tableName":"AccessToken","joinType":"upsert","joinPath":"","manyOneUpsert":false,"joinKeys":[{"source":"_id","target":"_id"}],"stageId":"d6bfd9c5-ba24-4459-a35b-a41bbc470ab0","isArray":false,"arrayUniqueKey":""}]},{"id":"68e09839-658b-475a-a47c-fa4cfd7e551d","inputLanes":["d6bfd9c5-ba24-4459-a35b-a41bbc470ab0"],"outputLanes":["5c180f52-72d8-4259-8fb2-0a5996b978ce"],"operations":[{"id":"5fd03dff0f087f39b9edc60f","op":"RENAME","field":"auth_type","operand":"auth_type-AAA","table_name":"AccessToken","type":"String","primary_key_position":0,"color":"#3q55dc","label":"auth_type-AAA"}],"scripts":[],"description":"","name":"Field Process","type":"field_processor","originalSchema":{"fields":[{"id":"89a2abbc-f7c2-4a11-918f-1fadae29ee0e","field_name":"","javaType":"Map","data_type":"DOCUMENT","table_name":"AccessToken","original_field_name":"","primary_key_position":0,"fromDB":[{"id":"89a2abbc-f7c2-4a11-918f-1fadae29ee0e","table_name":"AccessToken","field_name":""}]},{"field_name":"_id","table_name":"AccessToken","data_type":"STRING","primary_key_position":1,"key":"PRI","dataType":2,"is_nullable":false,"original_field_name":"_id","original_java_type":"String","precision":0,"scale":0,"oriPrecision":null,"oriScale":null,"javaType":"String","columnSize":0,"autoincrement":"NO","id":"5fd03dff0f087f39b9edc612","is_deleted":false,"fromDB":[{"id":"5fd03dff0f087f39b9edc612","table_name":"AccessToken","field_name":"_id"}]},{"field_name":"created","table_name":"AccessToken","data_type":"DATE_TIME","primary_key_position":0,"dataType":9,"is_nullable":true,"original_field_name":"created","original_java_type":"Date","precision":0,"scale":0,"oriPrecision":null,"oriScale":null,"javaType":"Date","columnSize":0,"autoincrement":"NO","id":"5fd03dff0f087f39b9edc611","is_deleted":false,"fromDB":[{"id":"5fd03dff0f087f39b9edc611","table_name":"AccessToken","field_name":"created"}]},{"field_name":"createTime","table_name":"AccessToken","data_type":"DATE_TIME","primary_key_position":0,"dataType":9,"is_nullable":true,"original_field_name":"createTime","original_java_type":"Date","precision":0,"scale":0,"oriPrecision":null,"oriScale":null,"javaType":"Date","columnSize":0,"autoincrement":"NO","id":"5fd03dff0f087f39b9edc610","is_deleted":false,"fromDB":[{"id":"5fd03dff0f087f39b9edc610","table_name":"AccessToken","field_name":"createTime"}]},{"field_name":"auth_type","table_name":"AccessToken","data_type":"STRING","primary_key_position":0,"dataType":2,"is_nullable":true,"original_field_name":"auth_type","original_java_type":"String","precision":0,"scale":0,"oriPrecision":null,"oriScale":null,"javaType":"String","columnSize":0,"autoincrement":"NO","id":"5fd03dff0f087f39b9edc60f","is_deleted":false,"fromDB":[{"id":"5fd03dff0f087f39b9edc60f","table_name":"AccessToken","field_name":"auth_type"}]},{"field_name":"last_updated","table_name":"AccessToken","data_type":"DATE_TIME","primary_key_position":0,"dataType":9,"is_nullable":true,"original_field_name":"last_updated","original_java_type":"Date","precision":0,"scale":0,"oriPrecision":null,"oriScale":null,"javaType":"Date","columnSize":0,"autoincrement":"NO","id":"5fd03dff0f087f39b9edc60e","is_deleted":false,"fromDB":[{"id":"5fd03dff0f087f39b9edc60e","table_name":"AccessToken","field_name":"last_updated"}]}],"table_name":"AccessToken","cdc_enabled":true,"meta_type":"collection","tableId":"5fd03def0e956a39b989caf4","indices":[]},"keep":true}],"setting":{"isSerialMode":false,"sync_type":"initial_sync+cdc","readBatchSize":100,"notificationWindow":0,"notificationInterval":300,"readCdcInterval":500,"maxTransactionLength":12,"description":"","cdcFetchSize":1,"distinctWriteType":"intellect","drop_target":false,"run_custom_sql":false,"needToCreateIndex":true,"increment":false,"isSchedule":false,"cronExpression":"","isOpenAutoDDL":false,"cdcConcurrency":false,"cdcShareFilterOnServer":false,"emailWaring":{"edited":false,"started":false,"error":true,"paused":false},"readShareLogMode":"STREAMING","stopOnError":true,"syncPoints":[{"connectionId":"","type":"current","time":"","date":"","name":"","timezone":"+08:00"}],"processorConcurrency":1,"transformerConcurrency":8,"lagTimeFalg":false,"userSetLagTime":0,"noPrimaryKey":false},"editorData":"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","user_id":"5f32027814fbc2d8530c5fe3","checked":true,"operationTime":{"$date":"2021-08-06T03:33:14.058Z"},"last_updated":{"$date":"2021-08-06T03:33:14.064Z"},"createTime":{"$date":"2021-08-06T02:54:52.028Z"},"id":{"$oid":"610ca47cb17d6c6dfaf49b23"}};
      let promise = this.$api('DataFlows').getMetadata(data);
      const that = this;
      promise.then(data=>{
        that.fieldMappingNavData = data.data
      })
    },
    // 获取表名称
    loadDataModels(connectionId) {
      let self = this;
      if (!connectionId) {
        return
      }
      this.transferLoading = true;
      connections
        .customQuery([connectionId], { schema: true })
        .then(result => {
          if (result.data) {
            let tables = [];
            // 数据库为mq
            if (result.data.database_type === 'mq') {
              this.model.mqType = result.data.mqType;

              let tableData = [];
              if (result.data.mqType === '0') {
                let data = [...result.data.mqQueueSet, ...result.data.mqTopicSet];
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
            self.databaseInfo = result.data;
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            );

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
    log('DatabaseLink.destroyed');
    if (this.unwatch) this.unwatch();
    if (this.targetCell) {
      this.targetCell.off('change:outputSchema', this.renderSchema, this)
    }
    delete this.unwatch;
    delete this.cell;
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
