<template>
  <el-container class="create-task-wrap bg-white" v-if="steps[activeStep]">
    <el-container style="overflow: hidden; flex: 1" class="create-task-container flex-column">
      <div class="steps-header">
        <el-steps class="primary pb-6" :active="taskStep" process-status="process" finish-status="success" align-center>
          <el-step :title="$t('task_form_select_connection')"></el-step>
          <el-step :title="$t('task_form_set_task_properties')"></el-step>
          <el-step :title="$t('task_form_select_table')"></el-step>
          <el-step :title="$t('task_form_table_field')"></el-step>
        </el-steps>
      </div>
      <el-container :class="['task-container', 'task-container-' + steps[activeStep].index]">
        <div class="task-container-box flex-fill flex flex-column w-100">
          <el-main :class="['create-task-main', 'task-main-' + steps[activeStep].index]">
            <!--步骤2-->
            <div class="body" v-if="steps[activeStep].index === 2">
              <div class="mb-8">
                <span class="title">{{ $t('task_form_select_connection') }}</span>
                <span class="desc">
                  {{ $t('task_form_connection_tip')
                  }}<span style="color: #337dff; cursor: pointer" @click="handleCreateDatabase">{{
                    $t('task_form_go_to_connection_tip')
                  }}</span>
                </span>
              </div>
              <form-builder
                ref="dataSource"
                v-model="dataSourceModel"
                :config="config"
                style="width: 376px"
                class="form-builder grey"
                @value-change="formChange"
              >
              </form-builder>
            </div>
            <!-- 步骤3 -->
            <div class="body step-3" v-if="steps[activeStep].index === 3">
              <div class="mb-8">
                <span class="title">{{ $t('task_form_task_setting') }}</span>
                <span class="desc">
                  {{ $t('task_form_task_setting_tip') }}
                </span>
              </div>
              <form-builder
                ref="setting"
                v-model="settingModel"
                :config="config"
                class="form-builder grey"
                style="width: 820px"
                @submit.native.prevent
                @value-change="formChangeSetting"
              >
              </form-builder>
            </div>
            <!-- 步骤4 -->
            <div class="body step-4" v-if="steps[activeStep].index === 4">
              <div class="mb-6">
                <span class="title">{{ $t('task_form_select_table') }}</span>
                <span class="desc">
                  {{ $t('task_form_sync_tip') }}
                </span>
              </div>
              <div class="create-task-transfer">
                <Transfer
                  ref="transfer"
                  :transferData="transferData"
                  :mqTransferFlag="mqTransferFlag"
                  :isTwoWay="settingModel.bidirectional"
                  @select-table="selectTransfer"
                ></Transfer>
              </div>
            </div>
            <!-- 步骤5 -->
            <div class="step-5" v-if="steps[activeStep].index === 5">
              <FieldMapping
                ref="fieldMapping"
                :transform="transferData"
                :isFirst="isFirst"
                :getDataFlow="getDataFlow"
                @update-first="returnModel"
                @update-transform="updateTranForm"
                @row-click="selectRowFieldProcess"
              ></FieldMapping>
            </div>
          </el-main>
          <div class="create-task-footer py-6 mx-6" :class="['btns-step-' + steps[activeStep].index]">
            <v-button class="btn-step" v-if="steps[activeStep].showExitBtn" @click="goBackList()">
              {{ $t('button_cancel') }}
            </v-button>
            <v-button
              class="btn-step"
              :loading="loading"
              v-else-if="steps[activeStep].showBackBtn || (steps[activeStep].index === 3 && !id)"
              @click="back()"
            >
              {{ $t('guide.btn_back') }}
            </v-button>
            <v-button
              v-if="steps[activeStep].showNextBtn"
              type="primary"
              class="btn-step"
              :loading="loading"
              :disabled="isTransfer && steps[activeStep].type === 'mapping'"
              @mousedown.native.prevent="next()"
            >
              <span>{{ $t('guide.btn_next') }}</span>
            </v-button>
            <v-button
              v-if="steps[activeStep].showSaveBtn"
              type="primary"
              class="btn-step"
              :disabled="isTransfer"
              :loading="loading"
              @click="save()"
            >
              {{ $t('button_finish') }}
            </v-button>
          </div>
        </div>
      </el-container>
    </el-container>
  </el-container>
</template>
<style lang="scss">
.create-task-wrap {
  .select-connection-popper {
    .el-select-dropdown__item {
      height: 64px;
      padding: 10px;
    }
    .select-connection-option {
      display: flex;
      align-items: center;
      .img {
        padding: 6px;
        width: 44px;
        height: 44px;
        line-height: 32px;
        border: 1px solid #dedee4;
        border-radius: 3px;
        box-sizing: border-box;
        text-align: center;
        color: #999;
        img {
          display: block;
          width: 100%;
          height: 100%;
        }
      }
      .name {
        margin-left: 10px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.create-task-wrap {
  //padding: 0 20px;
  height: 100%;
  background: rgba(250, 250, 250, 1);
  .step-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #dedee4;
    color: rgba(102, 102, 102, 100);
    font-size: 12px;
    .step-box {
      margin-left: 20px;
      display: flex;
      align-items: center;
      li + li {
        margin-left: 54px;
        &::before {
          content: '';
          position: absolute;
          top: 10px;
          left: -42px;
          height: 1px;
          width: 30px;
          background: #bbb;
        }
      }
      li {
        position: relative;
        display: flex;
        align-items: center;
        &.active {
          .step-index {
            border-color: #fff;
            color: #fff;
          }
        }
        .step-index {
          margin-right: 7px;
          width: 20px;
          height: 20px;
          line-height: 16px;
          text-align: center;
          border: 1px solid #aaa;
          border-radius: 50%;
          font-family: Roboto;
          font-weight: bold;
          box-sizing: border-box;
        }
      }
    }
  }
  .right-aside {
    background: #fafafa;
    border-left: 1px solid #dedee4;
  }
  .task-container {
    overflow-y: auto;
    &.task-container-5 {
      flex: 1;
      .task-container-box {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .create-task-main {
        margin-bottom: 0;
        padding: 24px 0 0;
      }
      ::v-deep {
        .field-mapping {
          .field-mapping__desc,
          .search {
            padding-left: 24px;
          }
          .icon {
            color: map-get($color, primary);
          }
          .task-form-body .nav li {
            border-radius: unset;
          }
          .field-mapping-table {
            .el-table__header-wrapper {
              border-radius: unset;
            }
            th {
              background-color: #fafafa;
            }
          }
        }
      }
    }
  }
  .create-task-main {
    padding: 24px 24px 0;
    background: #fff;
    overflow-y: auto;
    .body {
      .title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
      }
      .desc {
        margin-left: 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
      .reload-schema {
        padding: 0 200px;
        margin-top: 10px;
      }
      .create-task-transfer {
        margin-bottom: 24px;
        flex: 1;
        overflow: hidden;
        min-height: 290px;
        $headerHeight: 48px;
        ::v-deep {
          .el-transfer-panel__header {
            background: rgba(44, 101, 255, 0.05);
            height: $headerHeight;
            line-height: $headerHeight;
            .el-checkbox {
              height: $headerHeight;
              line-height: $headerHeight;
            }
          }
        }
      }
    }
    .dataSource-title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0;
    }
    .step-5 {
      height: 100%;
      min-height: 300px;
      .search {
        display: flex;
        justify-content: flex-start;
        margin-top: 10px;
        .item {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-right: 10px;
          span {
            display: inline-block;
            width: 80px;
          }
        }
      }
      .task-form-body {
        display: flex;
        flex: 1;
        margin-top: 20px;
        .nav {
          width: 293px;
          border-top: 1px solid #f2f2f2;
          border-right: 1px solid #f2f2f2;
          background: rgba(44, 101, 255, 0.05);
          li {
            height: 115px;
            background: #ffffff;
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
            border-radius: 4px;
            border-bottom: 1px solid #f2f2f2;
          }
        }
      }
    }
  }
  .btn-step {
    width: 212px;
    position: relative;
    .btn-pass {
      position: absolute;
      top: 50%;
      right: -20px;
      transform: translate(100%, -50%);
    }
  }
  .btn-step + .btn-step {
    margin-left: 32px;
  }
  .select-connection {
    display: block;
    width: 450px;
  }
  .database-type {
    padding: 0 200px;
    display: flex;
    align-items: center;
    .img {
      padding: 10px;
      width: 54px;
      height: 54px;
      border: 1px solid #dedee4;
      box-sizing: border-box;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .database-name {
      margin-left: 15px;
      font-size: 28px;
    }
    .btn-change {
      margin-top: 10px;
      margin-left: 15px;
    }
  }
  .create-form {
    margin-top: 20px;
    padding-right: 200px;
  }
  .btn-test {
    padding-left: 200px;
    .status {
      margin-left: 10px;
      font-size: 12px;
      &.invalid {
        color: #f56c6c;
      }
      &.ready {
        color: #67c23a;
      }
      &.testing {
        color: #e6a23c;
      }
      .status-icon {
        display: none;
      }
    }
  }
  .error-msg {
    padding: 0 200px;
    line-height: 26px;
    color: rgba(238, 83, 83, 100);
    font-size: 14px;
  }
  .task-type-radio {
    padding: 0 200px;
    box-sizing: border-box;
  }
  .step-1 {
    .os-buttons {
      margin-top: 66px;
      display: flex;
      justify-content: space-between;
      .el-button {
        position: relative;
        width: 260px;
        font-family: Roboto;
        &.active {
          border-color: #c8e9f6;
          background-color: #edf8fc;
        }
        i {
          position: absolute;
          left: 19px;
          top: 9px;
          font-size: 19px;
        }
      }
    }
  }
  .create-task-footer {
    border-top: 1px solid #f2f2f2;
  }
  .step-4 {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
.steps-header {
  margin: 0 20px;
  padding: 20px 0 0;
  border-bottom: 1px solid #f2f2f2;
}
.el-main {
  padding: 24px 0 0;
}
.form-builder {
  ::v-deep {
    .e-form-builder-item {
      &.read-batch-size {
        .input-item,
        .el-input__inner,
        .el-form-item__content {
          width: 277px;
        }
      }
    }
  }
}
.step-3 {
  .ddl-tip {
    font-size: 12px;
    margin-top: -10px;
    color: #aaa;
  }
}
</style>
<script>
import formConfig from '../task/config'
import Transfer from './Transfer'
import FieldMapping from '@/components/field-mapping/main'
import { SETTING_MODEL, INSTANCE_MODEL, DFSDATASOURCE_MODEL } from '../task/const'

let defaultConfig = []
export default {
  components: { Transfer, FieldMapping },
  data() {
    return {
      id: '',
      loading: false,
      steps: [],
      activeStep: 0,
      errorMsg: '',
      showConnectDialog: false,
      showSysncTableTip: false, //dfs 同库不同表提示
      twoWayAgentRunningCount: '',
      mqTransferFlag: false,
      stages: [], //当前节点信息
      platformInfo: JSON.parse(JSON.stringify(INSTANCE_MODEL)),
      dataSourceModel: JSON.parse(JSON.stringify(DFSDATASOURCE_MODEL)),
      settingModel: JSON.parse(JSON.stringify(SETTING_MODEL)),
      mappingModel: {},
      config: {
        form: {
          labelPosition: 'left',
          labelWidth: '80px',
          itemStyle: 'margin-bottom: 16px;',
          size: 'small'
        },
        items: []
      },
      transferData: {
        table_prefix: '',
        table_suffix: '',
        selectSourceArr: [],
        topicData: [],
        queueData: []
      },
      taskType: 'cluster-clone',
      dialogTestVisible: false,
      status: '',
      mdHtml: '',
      platformInfoZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      dialogDatabaseTypeVisible: false,
      allowDataType: this.$settings.ALLOW_CONNECTION_TYPE,
      supportTwoWay: false,
      systemTimeZone: '',
      options: [
        {
          label: this.$t('dataFlow.SyncInfo.localTZType'),
          value: 'localTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.connTZType'),
          value: 'connTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.currentType'),
          value: 'current'
        }
      ],
      //是否选择表
      isTransfer: true,
      //表设置
      isFirst: true,
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      hiddenFieldMapping: false,
      taskStep: 0,
      tableNameTransform: '',
      fieldsNameTransform: '',
      updateTransfer: false
    }
  },

  created() {
    this.id = this.$route.params.id
    this.getSteps()
    this.getAgentCount()
    defaultConfig = [
      {
        type: 'input',
        field: 'name',
        label: this.$t('task_name'),
        labelColon: true,
        maxlength: 300,
        showWordLimit: true,
        required: true,
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error(this.$t('task_form_task_cannot_empty')))
              } else {
                let filter = {
                  where: {
                    name: value
                  },
                  fields: {
                    name: 1
                  },
                  limit: 1
                }
                if (this.id) {
                  filter.where['id'] = { neq: this.id }
                }
                this.$axios
                  .get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(filter)))
                  .then(({ items }) => {
                    if (items?.length !== 0) {
                      callback(new Error('任务名称已存在'))
                    } else callback()
                  })
              }
            }
          }
        ]
      }
    ]
    this.dataSourceModel = JSON.parse(JSON.stringify(DFSDATASOURCE_MODEL))
    this.getFormConfig()
    this.allowDatabaseType()

    if (this.id) {
      this.intiData(this.id)
    }
  },
  mounted() {
    let timeZone = new Date().getTimezoneOffset() / 60
    if (timeZone > 0) {
      this.systemTimeZone = 0 - timeZone
    } else {
      this.systemTimeZone = '+' + -timeZone
    }
  },
  methods: {
    //是否支持双向前提
    getAgentCount() {
      this.$axios.get('api/tcm/agent/agentCount').then(data => {
        this.twoWayAgentRunningCount = data.twoWayAgentRunningCount || 0
      })
    },
    //兼容新手引导
    handleCreateDatabase() {
      this.$router.push({
        name: 'Connection',
        query: {
          action: 'create'
        }
      })
    },
    //初始化数据 编辑跳转
    intiData(id) {
      this.$axios.get('tm/api/DataFlows/' + id).then(data => {
        this.status = data.status
        this.settingModel = Object.assign(this.settingModel, data.setting)
        this.settingModel.name = data.name
        this.platformInfo = data.platformInfo
        this.dataSourceModel = data.dataSourceModel || {}
        this.stages = data.stages
        let stages = data.stages
        let syncObjects = stages[1].syncObjects
        this.transferData = {
          table_prefix: stages[1].table_prefix,
          table_suffix: stages[1].table_suffix,
          tableNameTransform: stages[1].tableNameTransform,
          fieldsNameTransform: stages[1].fieldsNameTransform,
          field_process: stages[0].field_process,
          selectSourceArr: syncObjects[0] ? syncObjects[0].objectNames : [],
          topicData: syncObjects[0]?.type === 'topic' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || [],
          queueData: syncObjects[0]?.type === 'queue' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || []
        }
        //编辑时不被覆盖
        this.tableNameTransform = stages[1].tableNameTransform
        this.fieldsNameTransform = stages[1].fieldsNameTransform
        // TODO 临时为了解决bug现在这里加，回头优化
        this.getFormConfig()
        //是否已选择表
        this.isTransfer = false
      })
    },
    //云版支持数据源
    allowDatabaseType() {
      this.$axios.get('tm/api/Connections/databaseType').then(data => {
        this.changeConfig(data || [], 'databaseType')
      })
    },
    formChangeSetting(data) {
      //删除模式不支持双向
      let field = data.field || ''
      let value = data.value
      let items = this.config.items
      if (field === 'distinctWriteType') {
        let target = items.find(it => it.field === 'bidirectional')
        this.getSupportTwoWay()
        if (target && value === 'compel') {
          target.show = false
          this.settingModel.bidirectional = false
        } else if (target && value !== 'compel' && this.supportTwoWay) {
          target.show = true
        }
      }
    },
    formChange(data) {
      let field = data.field || '' // 源端 | 目标端
      if (field === 'source_filter_databaseType') {
        this.dataSourceModel['source_databaseType'] = data.value
        this.getConnection(this.getWhere('source'), 'source_connectionId', true)
      }
      if (field === 'target_filter_databaseType') {
        this.dataSourceModel['target_databaseType'] = data.value
        this.getConnection(this.getWhere('target'), 'target_connectionId', true)
      }
    },
    getSteps() {
      this.steps = []
      if (this.id && this.hiddenFieldMapping) {
        //编辑模式 无字段映射功能
        this.steps = [
          { index: 3, text: this.$t('task_form_task_setting'), type: 'setting', showExitBtn: true, showNextBtn: true },
          {
            index: 4,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      } else if (!this.id && !this.hiddenFieldMapping) {
        this.steps = [
          {
            index: 2,
            text: this.$t('task_form_source_target_connection'),
            type: 'dataSource',
            showExitBtn: true,
            showNextBtn: true
          }, //创建模式 有字段功能
          { index: 3, text: this.$t('task_form_task_setting'), type: 'setting', showBackBtn: true, showNextBtn: true },
          {
            index: 4,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showNextBtn: true
          },
          { index: 5, text: this.$t('task_form_table_setting'), type: 'table', showBackBtn: true, showSaveBtn: true }
        ]
      } else if (this.id && !this.hiddenFieldMapping) {
        this.steps = [
          { index: 3, text: this.$t('task_form_task_setting'), type: 'setting', showExitBtn: true, showNextBtn: true }, //编辑模式 有字段功能
          {
            index: 4,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showNextBtn: true
          },
          { index: 5, text: this.$t('task_form_table_setting'), type: 'table', showBackBtn: true, showSaveBtn: true }
        ]
      } else if (!this.id && this.hiddenFieldMapping) {
        this.steps = [
          {
            index: 2,
            text: this.$t('task_form_source_target_connection'),
            type: 'dataSource',
            showExitBtn: true,
            showNextBtn: true
          }, //创建模式 无字段功能
          { index: 3, text: this.$t('task_form_task_setting'), type: 'setting', showBackBtn: true, showNextBtn: true },
          {
            index: 4,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      }
    },
    //下一步
    next() {
      let type = this.steps[this.activeStep].type || 'instance'
      if (type === 'dataSource') {
        this.$refs.dataSource.validate(async valid => {
          if (valid) {
            //源端目标端不可选择相同库 规则: id一致
            this.showSysncTableTip = false
            if (this.dataSourceModel.source_connectionId === this.dataSourceModel.target_connectionId) {
              this.showSysncTableTip = true // dfs 仅提示
            }
            //数据源名称
            let source = await this.handleConnectionName(
              this.dataSourceModel.source_connectionId,
              'source_connectionId'
            )
            let target = await this.handleConnectionName(
              this.dataSourceModel.target_connectionId,
              'target_connectionId'
            )
            //source.id/target.id = host + port + username
            if (source.id === target.id) {
              this.showSysncTableTip = true // dfs 仅提示
            }
            this.dataSourceModel.source_connectionName = source.name
            this.dataSourceModel.target_connectionName = target.name
            this.dataSourceModel['source_databaseType'] = source.type
            this.dataSourceModel['target_databaseType'] = target.type
            this.dataSourceModel.mqType = target.mqType
            this.activeStep += 1
            this.getFormConfig()
          }
        })
      }
      if (type === 'setting') {
        this.$refs.setting.validate(valid => {
          if (valid) {
            this.activeStep += 1
            this.getFormConfig()
            if (this.showSysncTableTip) {
              this.$message.warning(this.$t('task_form_table_name_cannot_consistent'))
            }
          } else {
            this.$message.error(this.$t('task_form_validation_failed'))
          }
        })
      }
      if (type === 'mapping') {
        let verify = this.checkTransfer()
        this.isTransfer = !verify
        if (!verify) {
          this.$message.error(this.$t('task_form_no_bable_tip'))
          return
        }
        this.activeStep += 1
        this.getFormConfig()
      }
      this.taskStep++
    },
    selectTransfer() {
      this.isTransfer = !this.checkTransfer()
    },
    //检查是否选择表
    checkTransfer() {
      let result = true
      // this.transferData = this.$refs.transfer.returnData()
      if (this.transferData.selectSourceArr.length === 0 && this.dataSourceModel['mqType'] !== '0') {
        result = false
      } else if (
        this.transferData.topicData.length === 0 &&
        this.transferData.queueData.length === 0 &&
        this.dataSourceModel['mqType'] === '0'
      ) {
        result = false
      }
      return result
    },
    back() {
      let type = this.steps[this.activeStep].type || 'instance'
      //将复制表内容存起来
      /*if (type === 'mapping') {
        this.transferData = this.$refs.transfer.returnData()
      }*/
      if (type === 'setting') {
        this.allowDatabaseType()
      }
      //当前表的字段映射保存
      if (type === 'table') {
        //保存字段映射
        let returnData = this.$refs.fieldMapping.returnData(true)
        let deleteLen = returnData.target.filter(v => !v.is_deleted)
        if (deleteLen.length !== 0) {
          this.saveOperations(returnData.row, returnData.operations, returnData.target)
        }
      }
      this.activeStep -= 1
      this.taskStep--
      this.getFormConfig()
    },
    // 根据步骤获取不同的表单项目
    async getFormConfig() {
      let type = this.steps[this.activeStep].type || 'instance'
      if (type === 'dataSource') {
        type = 'dfs_dataSource'
      }
      let func = formConfig[type]
      if (func) {
        let config = func(this)
        config.form.size = 'small'
        this.config = config
        if (type === 'setting') {
          this.config.items = defaultConfig.concat(config.items)
        }
      }
      switch (type) {
        case 'dfs_dataSource': {
          let source_connectionId = this.config.items.find(it => it.field === 'source_connectionId')
          let target_connectionId = this.config.items.find(it => it.field === 'target_connectionId')
          source_connectionId.remote = true
          source_connectionId.remoteMethod = this.queryConnection('source')

          target_connectionId.remote = true
          target_connectionId.remoteMethod = this.queryConnection('target')

          this.getConnection(this.getWhere('source'), 'source_connectionId').then(() => {
            const connectionId = this.dataSourceModel.source_connectionId
            const options = source_connectionId.options
            if (connectionId && !options.find(item => item.value === connectionId)) {
              options.push({
                name: this.dataSourceModel.source_connectionName,
                label: this.dataSourceModel.source_connectionName,
                value: connectionId,
                type: this.dataSourceModel.source_databaseType
              })
            }
          })
          this.getConnection(this.getWhere('target'), 'target_connectionId').then(() => {
            const connectionId = this.dataSourceModel.target_connectionId
            const options = target_connectionId.options
            if (connectionId && !options.find(item => item.value === connectionId)) {
              options.push({
                name: this.dataSourceModel.target_connectionName,
                label: this.dataSourceModel.target_connectionName,
                value: connectionId,
                type: this.dataSourceModel.target_databaseType
              })
            }
          })
          break
        }
        case 'drs_dataSource': {
          this.getConnection(this.getWhere('source'), 'source_connectionId')
          this.getConnection(this.getWhere('target'), 'target_connectionId')
          break
        }
        case 'setting': {
          this.getSupportTwoWay() // 进入设置页面再判断
          if (
            this.dataSourceModel['source_databaseType'] !== 'mysql' ||
            this.dataSourceModel['target_databaseType'] !== 'mysql'
          ) {
            this.changeConfig([], 'setting_isOpenAutoDDL')
            this.changeConfig([], 'setting_twoWay')
          }
          if (this.dataSourceModel['target_databaseType'] === 'kafka') {
            this.changeConfig([], 'setting_distinctWriteType')
          }
          //greenplum做源时不能增量
          // if (this.dataSourceModel['source_databaseType'] === 'greenplum') {
          //   this.changeConfig([], 'setting_sync_type')
          //   //设置默认值
          //   this.settingModel.sync_type = 'initial_sync'
          // }
          //greenplum、ADB mysql、kundb做源时不能增量
          if (
            this.dataSourceModel['source_databaseType'] === 'greenplum' ||
            this.dataSourceModel['source_databaseType'] === 'adb_mysql' ||
            this.dataSourceModel['source_databaseType'] === 'adb_postgres' ||
            this.dataSourceModel['source_databaseType'] === 'kundb'
          ) {
            this.changeConfig([], 'setting_sync_type')
            //设置默认值
            this.settingModel.sync_type = 'initial_sync'
          }
          if (this.dataSourceModel['target_databaseType'] === 'mq' && this.dataSourceModel['mqType'] === '0') {
            this.mqTransferFlag = true
          } else {
            this.mqTransferFlag = false
          }
          //判断是否有第五步
          this.showFieldMapping()
          break
        }
        case 'table': {
          this.$nextTick(() => {
            let dataFlow = this.daft()
            this.$refs.fieldMapping.getMetaData(dataFlow)
          })
          break
        }
        case 'mapping': {
          this.getSchema()
          break
        }
      }
    },
    //获取schema
    getSchema() {
      let id = this.dataSourceModel.source_connectionId || ''
      this.$nextTick(() => {
        this.$refs.transfer.getTable(id, this.settingModel.bidirectional)
        // this.$refs.transfer.showOperation(this.settingModel.bidirectional || false) //双向模式不可以更改表名
      })
    },
    //获取当前是否可以展示双向开关
    getSupportTwoWay() {
      this.supportTwoWay =
        this.twoWayAgentRunningCount > 0 &&
        this.dataSourceModel['source_databaseType'] === 'mongodb' &&
        this.dataSourceModel['target_databaseType'] === 'mongodb' &&
        this.settingModel['distinctWriteType'] !== 'compel' // 进入设置页面再判断
    },
    getWhere(type) {
      let where = {}
      if (type === 'source' && this.dataSourceModel.source_filter_databaseType !== 'all') {
        where = {
          database_type: { in: [this.dataSourceModel.source_databaseType] }
        }
      } else if (type === 'target' && this.dataSourceModel.target_filter_databaseType !== 'all') {
        where = {
          database_type: { in: [this.dataSourceModel.target_databaseType] }
        }
      }
      return where
    },
    //获取数据源
    getConnection(where, type, reset = false) {
      //接口请求之前 loading = true
      let items = this.config.items
      let option = items.find(it => it.field === type)
      if (option) {
        option.loading = true
      }
      let fields = {
        name: 1,
        id: 1,
        database_type: 1,
        connection_type: 1,
        status: 1,
        database_host: 1,
        database_port: 1,
        database_name: 1,
        database_uri: 1,
        mqType: 1
      }
      if (type === 'source_connectionId') {
        fields['database_username'] = 1
      }
      let filter = {
        where: where,
        fields: fields,
        order: ['status DESC', 'name ASC']
      }
      return this.$axios
        .get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ items }) => {
          this.changeConfig(items || [], type, reset)
        })
    },
    //change config
    changeConfig(data, type, reset = false) {
      let items = this.config.items
      switch (type) {
        case 'source_connectionId': {
          if (reset) {
            this.dataSourceModel.source_connectionId = ''
          }
          // 第二步 数据源连接ID
          let source_connectionId = items.find(it => it.field === 'source_connectionId')
          if (source_connectionId) {
            source_connectionId.loading = false
            // 在全部类型下dfs源端不支持的数据源
            let filterArr = ['redis', 'hazelcast_cloud_cluster', 'elasticsearch', 'clickhouse', 'dameng', 'tidb']
            data = data.filter(item => filterArr.indexOf(item.database_type) === -1)
            source_connectionId.options = data.map(item => {
              return {
                id: item.database_host + item.database_port + item.database_name + item.database_uri,
                name: item.name,
                label: item.name,
                value: item.id,
                type: item.database_type,
                mqType: item.mqType || ''
              }
            })
          }
          break
        }
        case 'target_connectionId': {
          if (reset) {
            this.dataSourceModel.target_connectionId = ''
          }
          let target_connectionId = items.find(it => it.field === 'target_connectionId')
          if (target_connectionId) {
            // 在全部类型下dfs目标端不支持的数据源
            let filterArr = ['adb_mysql']
            data = data.filter(item => filterArr.indexOf(item.database_type) === -1)
            target_connectionId.loading = false
            target_connectionId.options = data.map(item => {
              return {
                id: item.database_host + item.database_port + item.database_name + item.database_uri,
                name: item.name,
                label: item.name,
                value: item.id,
                type: item.database_type,
                mqType: item.mqType || ''
              }
            })
          }
          break
        }
        case 'setting_isOpenAutoDDL': {
          //映射可用区
          let op = items.find(it => it.field === 'isOpenAutoDDL')
          if (op) {
            op.show = false
          }
          break
        }
        case 'setting_distinctWriteType': {
          //kafka 作为目标 不支持删除模式
          let op = items.find(it => it.field === 'distinctWriteType')
          if (op) {
            op.options = [
              {
                label: this.$t('task_form_update_write_mode'),
                tip: this.$t('task_form_update_write_mode_tip'),
                value: 'intellect'
              }
            ]
          }
          break
        }
        case 'setting_sync_type': {
          //greenplum做源时不能增量
          let op = items.find(it => it.field === 'sync_type')
          if (op) {
            op.options = [
              {
                label: this.$t('task_form_full_sync'),
                tip: this.$t('task_form_full_sync_tip'),
                value: 'initial_sync'
              }
            ]
          }
          break
        }
        case 'setting_twoWay': {
          //映射是否双向同步
          let op = items.find(it => it.field === 'bidirectional')
          op.show = !!this.supportTwoWay
          break
        }
        case 'databaseType': {
          let source = items.find(it => it.field === 'source_filter_databaseType')
          let TYPEMAP = this.$const.TYPEMAP
          //不包含远端类型
          if (source) {
            // dfs源端不支持 redis elasticsearch
            let options = data
            let filterArr = ['redis', 'hazelcast_cloud_cluster', 'elasticsearch', 'clickhouse', 'dameng', 'tidb']
            options = data.filter(item => filterArr.indexOf(item) === -1)
            source.options = options.map(item => {
              return {
                label: TYPEMAP[item],
                value: item
              }
            })
            source.options.unshift({ label: this.$t('task_form_all'), value: 'all' })
          }

          let target = items.find(it => it.field === 'target_filter_databaseType')
          if (target) {
            let filterArr = ['adb_mysql']
            let targetOptions = data.filter(item => filterArr.indexOf(item) === -1)
            target.options = targetOptions.map(item => {
              return {
                label: TYPEMAP[item],
                value: item
              }
            })
            target.options.unshift({ label: this.$t('task_form_all'), value: 'all' })
          }

          break
        }
      }
    },
    handleName(sourceData, target) {
      let data = sourceData.filter(item => item.code === target)
      if (data.length === 0) return
      return data[0].name
    },
    async handleConnectionName(target, type) {
      let items = this.config.items
      let optionsData = items.find(it => it.field === type)

      let item = optionsData.options.find(op => op.value === target)

      if (!item) {
        let filter = {
          where: {
            id: target
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1,
            database_host: 1,
            database_port: 1,
            database_name: 1,
            database_uri: 1,
            database_username: 1,
            mqType: 1
          },
          order: ['status DESC', 'name ASC']
        }
        let result = await this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
        item = result?.items?.[0]
      }

      return item
    },
    //是否支持同步内容
    showFieldMapping() {
      let data = this.daft()
      let stageId = data?.stages?.[1]?.id || ''
      let param = {
        stages: data?.stages,
        stageId: stageId
      }
      this.$axios.post('tm/api/DataFlows/tranModelVersionControl', param).then(data => {
        this.hiddenFieldMapping = !data?.[stageId] || false
        this.getSteps()
      })
    },
    //预存数据
    daft() {
      let source = this.dataSourceModel
      let target = this.dataSourceModel
      //设置为增量模式
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      let syncPoints = [
        {
          connectionId: source.source_connectionId,
          type: 'current', // localTZ: 本地时区； connTZ：连接时区
          time: '',
          date: '',
          name: '',
          timezone: systemTimeZone // 当type为localTZ时有该字段
        }
      ]
      this.settingModel['syncPoints'] = syncPoints
      let postData = {
        name: this.settingModel.name,
        description: '',
        status: 'paused',
        executeMode: 'normal',
        category: this.$t('task_form_database_clone'),
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [],
        setting: this.settingModel,
        dataFlowType: 'normal', //区分创建方式
        dataSourceModel: this.dataSourceModel,
        platformInfo: Object.assign(
          {
            agentType: 'private'
          },
          this.platformInfo
        )
      }
      let stageDefault = {
        connectionId: '',
        dataQualityTag: false,
        distance: 1,
        freeTransform: false,
        id: '',
        inputLanes: [],
        joinTables: [],
        name: '',
        outputLanes: [],
        type: ''
      }
      //第四步 数据组装
      if (this.hiddenFieldMapping) {
        //没有第五步 表设置 需要主动调用 transfer.returnData
        // this.transferData = this.$refs.transfer.returnData()
      }
      let selectTable = []
      if (this.transferData) {
        if (this.transferData.topicData.length || this.transferData.queueData.length) {
          if (this.transferData.topicData.length) {
            selectTable.push({
              objectNames: this.transferData.topicData,
              type: 'topic'
            })
          }
          if (this.transferData.queueData.length) {
            selectTable.push({
              objectNames: this.transferData.queueData,
              type: 'queue'
            })
          }
        } else {
          if (this.transferData.selectSourceArr.length > 0) {
            selectTable.push({
              objectNames: this.transferData.selectSourceArr,
              type: 'table'
            })
          }
        }
      }
      //编辑时传原status
      let sourceIdA = ''
      let targetIdB = ''
      if (this.id) {
        postData.status = this.status || 'paused'
        //编辑状态stages只做变更
        sourceIdA = this.stages[0]?.id
        targetIdB = this.stages[1]?.id
        postData.id = this.id
        if (!this.updateTransfer) {
          this.transferData.tableNameTransform = this.tableNameTransform
          this.transferData.fieldsNameTransform = this.fieldsNameTransform
        }
      } else {
        sourceIdA = this.$util.uuid()
        targetIdB = this.$util.uuid()
      }
      postData.stages = [
        Object.assign({}, stageDefault, {
          id: sourceIdA,
          connectionId: source.source_connectionId,
          outputLanes: [targetIdB],
          distance: 1,
          name: this.dataSourceModel.source_connectionName,
          type: 'database',
          database_type: this.dataSourceModel['source_databaseType'] || 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          field_process: this.transferData.field_process //字段处理器 源
        }),
        Object.assign({}, stageDefault, {
          id: targetIdB,
          connectionId: target.target_connectionId,
          inputLanes: [sourceIdA],
          distance: 0,
          syncObjects: selectTable,
          name: this.dataSourceModel.target_connectionName,
          table_prefix: this.transferData.table_prefix,
          table_suffix: this.transferData.table_suffix,
          tableNameTransform: this.transferData.tableNameTransform,
          fieldsNameTransform: this.transferData.fieldsNameTransform,
          type: 'database',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: this.settingModel.distinctWriteType === 'compel' ? 'drop_data' : 'no_drop',
          database_type: this.dataSourceModel['target_databaseType'] || 'mysql'
        })
      ]
      return postData
    },
    //save
    save() {
      if (this.loading) {
        return
      }
      //保存字段映射
      if (!this.hiddenFieldMapping) {
        let returnData = this.$refs.fieldMapping.returnData()
        if (!returnData.valid) return //检验不通过
        let deleteLen = returnData.target.filter(v => !v.is_deleted)
        if (deleteLen.length === 0) {
          this.$message.error(this.$t('task_form_no_fields_not_save'))
          return //所有字段被删除了 不可以保存任务
        }
        this.saveOperations(returnData.row, returnData.operations, returnData.target)
        this.saveChangNameData(returnData.changNameData)
        this.updateTransfer = true
      } else {
        let verify = this.checkTransfer()
        if (!verify) {
          this.$message.error(this.$t('task_form_no_bable_tip'))
          return
        }
      }
      let postData = this.daft()
      let promise = null
      if (this.id) {
        postData['id'] = this.id
        promise = this.$axios.patch('tm/api/DataFlows/' + this.id, postData)
      } else {
        promise = this.$axios.post('tm/api/DataFlows', postData)
      }
      this.loading = true
      promise
        .then(() => {
          this.routerBack()
        })
        .catch(e => {
          if (e.response?.msg === 'duplication for names') {
            this.$message.error(this.$t('message.exists_name'))
          } else {
            this.$message.error(e.response?.msg || e.data?.msg)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    routerBack() {
      this.$router.push({
        name: 'Task'
      })
    },
    //返回任务列表
    goBackList() {
      this.$confirm(this.$t('task_form_lost_task'), this.$t('task_form_give_up'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.routerBack()
      })
    },
    //表设置
    //接收是否第一次打开
    returnModel(value) {
      this.isFirst = value
    },
    getDataFlow() {
      return this.daft()
    },
    updateTranForm(data) {
      this.transferData.table_prefix = data.table_prefix
      this.transferData.table_suffix = data.table_suffix
      this.transferData.tableNameTransform = data.tableNameTransform
      this.transferData.fieldsNameTransform = data.fieldsNameTransform
      this.transferData.field_process = data.field_process
    },
    saveChangNameData(data) {
      this.transferData.table_prefix = data.table_prefix
      this.transferData.table_suffix = data.table_suffix
      this.transferData.tableNameTransform = data.tableNameTransform
      this.transferData.fieldsNameTransform = data.fieldsNameTransform
    },
    selectRowFieldProcess(field_process) {
      this.transferData.field_process = field_process
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
      if (typeof where === 'object') where = JSON.stringify(where)
      this.axios.post('tm/api/MetadataInstances/update?where=' + encodeURIComponent(where), data)
      this.transferData.field_process = this.$refs.fieldMapping.saveFileOperations(row, operations)
    },

    queryConnection(type) {
      return query => {
        const where = this.getWhere(type)
        where.name = { like: query, options: 'i' }
        this.getConnection(where, `${type}_connectionId`)
      }
    }
  }
}
</script>
