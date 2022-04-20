<template>
  <ElContainer class="create-task-wrap bg-white" v-if="steps[activeStep]">
    <ElContainer style="overflow: hidden; flex: 1" class="create-task-container flex-column">
      <div class="steps-header">
        <ElSteps class="primary pb-6" :active="taskStep" process-status="process" finish-status="success" align-center>
          <ElStep :title="$t('task_form_select_connection')"></ElStep>
          <ElStep :title="$t('task_form_set_task_properties')"></ElStep>
          <ElStep :title="$t('task_form_select_table')"></ElStep>
          <ElStep :title="$t('task_form_table_field')"></ElStep>
        </ElSteps>
      </div>
      <ElContainer :class="['task-container', 'task-container-' + steps[activeStep].index]">
        <div class="task-container-box flex-fill flex flex-column w-100">
          <ElMain :class="['create-task-main', 'task-main-' + steps[activeStep].index]">
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
              <FormBuilder
                ref="dataSource"
                v-model="dataSourceModel"
                :config="config"
                style="width: 376px"
                class="form-builder grey"
                @value-change="formChange"
              >
              </FormBuilder>
            </div>
            <!-- 步骤3 -->
            <div class="body step-3" v-if="steps[activeStep].index === 3">
              <div class="mb-8">
                <span class="title">{{ $t('task_form_task_setting') }}</span>
                <span class="desc">
                  {{ $t('task_form_task_setting_tip') }}
                </span>
              </div>
              <FormBuilder
                ref="setting"
                v-model="settingModel"
                :config="config"
                class="form-builder grey"
                style="width: 820px"
                @submit.native.prevent
                @value-change="formChangeSetting"
              >
                <template slot="syncPoints">
                  <ElRow>
                    {{ $t('connection_form_data_source') }}{{ $t('field_mapping_field_mapping_dialog_')
                    }}{{ dataSourceModel.source_connectionName }}
                  </ElRow>
                  <ElRow>
                    <ElCol :span="8" style="margin-right: 10px">
                      <ElSelect v-model="settingModel.syncPoints[0].type" :placeholder="$t('gl_placeholder_select')">
                        <ElOption v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </ElOption>
                      </ElSelect>
                    </ElCol>
                    <ElCol :span="12" v-if="settingModel.syncPoints[0].type !== 'current'">
                      <ElDatePicker
                        value-format="yyyy-MM-dd HH:mm:ss"
                        format="yyyy-MM-dd HH:mm:ss"
                        v-model="settingModel.syncPoints[0].date"
                        type="datetime"
                        :disabled="settingModel.syncPoints[0].type === 'current'"
                      ></ElDatePicker>
                    </ElCol>
                  </ElRow>
                  <ElRow>
                    <i class="el-icon-info color-primary mr-2"></i>
                    <span class="font-color-sub fs-8">{{ $t('task_form_setting_sync_points_tip') }}</span>
                  </ElRow>
                </template>
                <template slot="scheduleTime">
                  <ElRow class="flex align-items-center" style="height: 32px">
                    <ElSwitch v-model="settingModel.isSchedule"></ElSwitch>
                    <ElForm
                      :model="settingModel"
                      ref="scheduleTimeForm"
                      inline
                      class="ml-4 pt-7"
                      @submit.native.prevent
                    >
                      <ElFormItem
                        v-if="settingModel.isSchedule"
                        required
                        class="form-item"
                        prop="scheduleTime"
                        label=""
                        :rules="[
                          {
                            required: true,
                            message: $t('task_setting_schedule_time') + $t('gl_form_can_not_be_empty'),
                            trigger: ['blur', 'change']
                          }
                        ]"
                      >
                        <ElDatePicker
                          value-format="yyyy-MM-dd HH:mm:ss"
                          format="yyyy-MM-dd HH:mm:ss"
                          v-model="settingModel.scheduleTime"
                          type="datetime"
                          :picker-options="getCurrentOptions()"
                          popper-class="schedule-time-date-picker"
                        ></ElDatePicker>
                      </ElFormItem>
                    </ElForm>
                    <!--                    <ElDatePicker-->
                    <!--                      v-if="settingModel.isSchedule"-->
                    <!--                      value-format="yyyy-MM-dd HH:mm:ss"-->
                    <!--                      format="yyyy-MM-dd HH:mm:ss"-->
                    <!--                      v-model="settingModel.scheduleTime"-->
                    <!--                      type="datetime"-->
                    <!--                      class="ml-4"-->
                    <!--                      :picker-options="getCurrentOptions()"-->
                    <!--                    ></ElDatePicker>-->
                  </ElRow>
                </template>
                <template slot="cronExpression">
                  <ElRow class="flex align-items-center" style="height: 32px">
                    <div class="flex align-items-center">
                      <ElSwitch v-model="settingModel.isSchedule"></ElSwitch>
                      <ElForm
                        :model="settingModel"
                        ref="cronExpressionForm"
                        inline
                        class="ml-4 pt-7"
                        @submit.native.prevent
                      >
                        <ElFormItem
                          v-if="settingModel.isSchedule"
                          required
                          class="form-item"
                          prop="cronExpression"
                          label=""
                          :rules="[
                            {
                              required: true,
                              message: $t('task_setting_cron_expression') + $t('gl_form_can_not_be_empty'),
                              trigger: ['blur', 'change']
                            },
                            {
                              required: true,
                              trigger: 'blur',
                              validator: cronExpressionValidator
                            }
                          ]"
                        >
                          <div class="flex">
                            <ElInput
                              v-model="settingModel.cronExpression"
                              :placeholder="$t('dataFlow_cronExpression')"
                              size="mini"
                              class="jobSchedule"
                            ></ElInput>
                            <ElPopover
                              popper-class="jobSeceduleDialog"
                              placement="top-start"
                              width="500"
                              trigger="hover"
                            >
                              <div class="text box">
                                <p>{{ $t('dialog_jobSchedule_explanation') }}</p>
                                <p>{{ $t('dialog_jobSchedule_grammar') }}</p>
                                <ul class="flex">
                                  <li v-for="item in timeTextArr" :key="item" class="mr-3 text-center">
                                    <p>{{ $t('dialog.jobSchedule.' + item) }}</p>
                                    <span>*</span>
                                  </li>
                                </ul>
                                <p>{{ $t('dialog_jobSchedule_example') }}</p>
                                <p>0 */1 * * * ? // {{ $t('dialog_jobSchedule_runMinute') }}</p>
                                <p>0 0 2 * * ? // {{ $t('dialog_jobSchedule_runDay') }}</p>
                              </div>
                              <VIcon slot="reference" class="color-disable ml-2" size="14">info</VIcon>
                            </ElPopover>
                          </div>
                        </ElFormItem>
                      </ElForm>
                    </div>
                  </ElRow>
                </template>
              </FormBuilder>
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
                  :dataSourceModel="dataSourceModel"
                  :mqTransferFlag="mqTransferFlag"
                  :isTwoWay="settingModel.bidirectional"
                  :reloadLoading.sync="reloadLoading"
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
                :dataSourceModel="dataSourceModel"
                :customTypeMappings.sync="customTypeMappings"
                @update-first="returnModel"
                @update-transform="updateTranForm"
                @row-click="selectRowFieldProcess"
              ></FieldMapping>
            </div>
          </ElMain>
          <div class="create-task-footer py-6 mx-6" :class="['btns-step-' + steps[activeStep].index]">
            <VButton class="btn-step" v-if="steps[activeStep].showExitBtn" @click="goBackList()">
              {{ $t('button_cancel') }}
            </VButton>
            <VButton
              class="btn-step"
              :loading="loading"
              v-else-if="steps[activeStep].showBackBtn || (steps[activeStep].index === 3 && !id)"
              @click="back()"
            >
              {{ $t('guide_btn_back') }}
            </VButton>
            <VButton
              v-if="steps[activeStep].showNextBtn"
              type="primary"
              class="btn-step"
              :loading="loading"
              :disabled="(isTransfer || reloadLoading) && steps[activeStep].type === 'mapping'"
              @mousedown.native.prevent="next()"
            >
              <span>{{ $t('guide_btn_next') }}</span>
            </VButton>
            <VButton
              v-if="steps[activeStep].showSaveBtn"
              type="primary"
              class="btn-step"
              :disabled="isTransfer"
              :loading="loading"
              @click="save()"
            >
              {{ $t('button_finish') }}
            </VButton>
          </div>
        </div>
      </ElContainer>
    </ElContainer>
  </ElContainer>
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
.schedule-time-date-picker {
  .el-picker-panel__footer {
    .el-picker-panel__link-btn:first-child {
      display: none;
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
    height: 0;
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
import VIcon from '@/components/VIcon'
import { SETTING_MODEL, INSTANCE_MODEL, DFSDATASOURCE_MODEL } from '../task/const'
import { uniqueArr, getDatabaseTypes } from '@/util'

let defaultConfig = []
export default {
  components: { Transfer, FieldMapping, VIcon },
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
        tableOperations: [],
        vikaMappings: {},
        qingFlowMappings: {},
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
      supportTwoWay: false,
      systemTimeZone: '',
      options: [
        {
          label: this.$t('dataFlow_SyncInfo_localTZType'),
          value: 'localTZ'
        },
        {
          label: this.$t('dataFlow_SyncInfo_connTZType'),
          value: 'connTZ'
        },
        {
          label: this.$t('dataFlow_SyncInfo_currentType'),
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
      updateTransfer: false,
      timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week'],
      cronExpressionValidator: (rule, value, callback) => {
        if (!value || !value.trim()) {
          callback(new Error(this.$t('task_form_task_cannot_empty')))
        } else {
          this.$axios.get('tm/api/DataFlows/cron/isValidExpression?cron=' + value).then(({ isValid }) => {
            if (!isValid) {
              callback(new Error(this.$t('task_setting_cron_expression_valid_false')))
            } else callback()
          })
        }
      },
      customTypeMappings: [],
      reloadLoading: false // 重新加载schema的loading
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
              } else if (value.length > 300) {
                callback(new Error(this.$t('task_form_task_name_limit')))
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
                      callback(new Error(this.$t('task_setting_task_name_already_exists')))
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
          tableOperations: stages[1].tableOperations,
          vikaMappings: stages[1].vikaMappings,
          qingFlowMappings: stages[1].qingFlowMappings,
          tableNameTransform: stages[1].tableNameTransform,
          fieldsNameTransform: stages[1].fieldsNameTransform,
          field_process: stages[0].field_process,
          selectSourceArr: syncObjects[0] ? syncObjects[0].objectNames : [],
          topicData: syncObjects[0]?.type === 'topic' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || [],
          queueData: syncObjects[0]?.type === 'queue' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || []
        }
        this.customTypeMappings = data.customTypeMappings || []
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
      } else if (field === 'sync_type') {
        let target = items.find(it => it.field === 'syncPoints')
        if (
          value === 'cdc' &&
          [
            'mysql',
            'oracle',
            'sqlserver',
            'mongodb',
            'aliyun_mysql',
            'tencent_mysql',
            'aliyun_mongodb',
            'tencent_mongodb',
            'aliyun_sqlserver',
            'tencent_sqlserver',
            'polardb_mysql'
          ].includes(this.dataSourceModel['source_databaseType'])
        ) {
          target.show = true
        } else {
          target.show = false
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
      if (field === 'target_connectionId') {
        if (data.value) {
          // vika clear tableOperations、field_process
          this.transferData.tableOperations = []
          this.transferData.field_process = []
        }
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
            // field: 'sync_type',
            let { sync_type } = this.settingModel
            if (sync_type === 'initial_sync') {
              // 开启了调度时间
              this.$refs.cronExpressionForm.validate(v => {
                if (v) {
                  this.settingNextFnc()
                } else {
                  this.$message.error(this.$t('task_form_validation_failed'))
                }
              })
            } else {
              // 开启了计划启动时间
              this.$refs.scheduleTimeForm.validate(v => {
                if (v) {
                  this.settingNextFnc()
                } else {
                  this.$message.error(this.$t('task_form_validation_failed'))
                }
              })
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
        if (this.reloadLoading) {
          return
        }
        this.activeStep += 1
        this.getFormConfig()
      }
      this.taskStep++
    },
    settingNextFnc() {
      this.activeStep += 1
      this.getFormConfig()
      if (this.showSysncTableTip) {
        this.$message.warning(this.$t('task_form_table_name_cannot_consistent'))
      }
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
        //保存表改名 字段改名
        this.updateTransfer = true
        this.transferData.table_prefix = returnData.changNameData?.table_prefix
        this.transferData.table_suffix = returnData.changNameData?.table_suffix
        this.transferData.tableOperations = returnData.changNameData?.tableOperations
        this.transferData.vikaMappings = returnData.changNameData?.vikaMappings
        this.transferData.qingFlowMappings = returnData.changNameData?.qingFlowMappings
        this.transferData.tableNameTransform = returnData.changNameData?.tableNameTransform
        this.transferData.fieldsNameTransform = returnData.changNameData?.fieldsNameTransform
        let deleteLen = returnData.target.filter(v => !v.is_deleted)
        if (deleteLen.length !== 0 && returnData.target?.length > 0) {
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

          this.getConnection(this.getWhere('source'), 'source_connectionId').then(async () => {
            const connectionId = this.dataSourceModel.source_connectionId
            const options = source_connectionId.options

            if (connectionId && !options.find(item => item.value === connectionId)) {
              const connection = await this.findOneConnection(connectionId)
              options.push(this.getConnectionItem(connection))
            }
          })
          this.getConnection(this.getWhere('target'), 'target_connectionId').then(async () => {
            const connectionId = this.dataSourceModel.target_connectionId
            const options = target_connectionId.options

            if (connectionId && !options.find(item => item.value === connectionId)) {
              const connection = await this.findOneConnection(connectionId)
              options.push(this.getConnectionItem(connection))
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
            !['mysql', 'aliyun_mysql', 'tencent_mysql', 'polardb_mysql'].includes(
              this.dataSourceModel['source_databaseType']
            ) ||
            !['mysql', 'aliyun_mysql', 'tencent_mysql', 'polardb_mysql'].includes(
              this.dataSourceModel['target_databaseType']
            )
          ) {
            this.changeConfig([], 'setting_isOpenAutoDDL')
            this.changeConfig([], 'setting_twoWay')
          }
          //kafka, vika, qingflow 作为目标 不支持删除模式
          if (['kafka', 'vika', 'qingflow'].includes(this.dataSourceModel['target_databaseType'])) {
            this.changeConfig([], 'setting_distinctWriteType')
          }
          //greenplum、ADB mysql、kundb做源时不能增量
          if (
            ['greenplum', 'adb_mysql', 'adb_postgres', 'kundb'].includes(this.dataSourceModel['source_databaseType'])
          ) {
            this.changeConfig([], 'setting_sync_type')
            //设置默认值
            this.settingModel.sync_type = 'initial_sync'
          }
          // kafka、es、mq作为目标不允许开启自动创建索引
          // if (
          //   ['kafka', 'mq', 'elasticsearch'].includes(this.dataSourceModel['target_databaseType']) ||
          //   ['kafka', 'mq', 'elasticsearch'].includes(this.dataSourceModel['source_databaseType'])
          // ) {
          //   this.changeConfig([], 'setting_needToCreateIndex')
          //   //设置默认值
          //   this.settingModel.needToCreateIndex = false
          // }

          // mysql、pg、oracle、sql server、mongodb、mariadb 是作为目标 支持自动创建索引
          if (
            [
              'mysql',
              'postgres',
              'oracle',
              'sqlserver',
              'mongodb',
              'mariadb',
              'aliyun_mysql',
              'aliyun_mariadb',
              'aliyun_mongodb',
              'aliyun_sqlserver',
              'aliyun_postgres',
              'tencent_mariadb',
              'tencent_mongodb',
              'tencent_mysql',
              'tencent_postgres',
              'tencent_sqlserver',
              'polardb_mysql'
            ].includes(this.dataSourceModel['target_databaseType'])
          ) {
            this.changeConfig([], 'setting_needToCreateIndex')
            //设置默认值
            this.settingModel.needToCreateIndex = true
          }
          // mysql、oracle、sqlserver、mongodb 支持增量时间点
          let target = this.config.items.find(it => it.field === 'syncPoints')
          if (
            this.settingModel.sync_type === 'cdc' &&
            [
              'mysql',
              'oracle',
              'sqlserver',
              'mongodb',
              'aliyun_mysql',
              'tencent_mysql',
              'aliyun_mongodb',
              'tencent_mongodb',
              'aliyun_sqlserver',
              'tencent_sqlserver',
              'polardb_mysql'
            ].includes(this.dataSourceModel['source_databaseType'])
          ) {
            target.show = true
          } else {
            target.show = false
          }
          // kafka、mq作为源不支持无主键同步， doris作为目标不支持无主键同步
          if (
            ['kafka', 'mq'].includes(this.dataSourceModel['source_databaseType']) ||
            ['doris'].includes(this.dataSourceModel['target_databaseType'])
          ) {
            this.changeConfig([], 'setting_noPrimaryKey')
            this.settingModel.noPrimaryKey = false
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
        (this.twoWayAgentRunningCount > 0 &&
          !['mongodb', 'aliyun_mongodb', 'tencent_mongodb'].includes(this.dataSourceModel['source_databaseType'])) ||
        !['mongodb', 'aliyun_mongodb', 'tencent_mongodb'].includes(this.dataSourceModel['target_databaseType'])
      this.settingModel['distinctWriteType'] !== 'compel' // 进入设置页面再判断
    },
    getWhere(type) {
      let where = {
        connection_type: {
          $in: ['source_and_target', type]
        }
      }

      if (
        this.dataSourceModel.source_filter_databaseType !== 'all' ||
        this.dataSourceModel.target_filter_databaseType !== 'all'
      ) {
        where.database_type = { $in: [this.dataSourceModel[`${type}_databaseType`]] }
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
        order: ['status DESC', 'name ASC'],
        limit: 999
      }
      return this.$axios
        .get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ items }) => {
          this.changeConfig(items || [], type, reset)
        })
    },

    getConnectionItem(item) {
      return {
        id: item.database_host + item.database_port + item.database_name + item.database_uri,
        name: item.name,
        label: item.name,
        value: item.id,
        type: item.database_type,
        mqType: item.mqType || ''
      }
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
            source_connectionId.options = data.map(this.getConnectionItem)
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
        // 允许开启自动索引
        case 'setting_needToCreateIndex': {
          let op = items.find(it => it.field === 'needToCreateIndex')
          if (op) {
            op.show = true
          }
          break
        }
        // 不支持无主键同步
        case 'setting_noPrimaryKey': {
          let op = items.find(it => it.field === 'noPrimaryKey')
          if (op) {
            op.show = false
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
          if (op) {
            op.show = !!this.supportTwoWay
          }
          break
        }
        case 'databaseType': {
          let source = items.find(it => it.field === 'source_filter_databaseType')
          let TYPEMAP = getDatabaseTypes(true)
          //不包含远端类型
          if (source) {
            // dfs源端不支持 redis elasticsearch
            let options = data
            let filterArr = [
              'redis',
              'hazelcast_cloud_cluster',
              'elasticsearch',
              'clickhouse',
              'dameng',
              'tidb',
              'vika',
              'doris',
              'qingflow'
            ]
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
        const connection = await this.findOneConnection(target)
        item = this.getConnectionItem(connection)
      } else {
        item.id = item.value
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
        if (data && data?.[stageId] !== undefined) {
          this.hiddenFieldMapping = !data[stageId] || false
        }
        this.getSteps()
      })
    },
    //预存数据
    daft() {
      let source = this.dataSourceModel
      let target = this.dataSourceModel
      //设置为增量模式
      this.settingModel.syncPoints[0].connectionId = source.source_connectionId
      this.settingModel.syncPoints[0].timezone = this.systemTimeZone
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
        ),
        customTypeMappings: this.customTypeMappings
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
          field_process: uniqueArr(this.transferData.field_process, 'table_id') //字段处理器 源
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
          tableOperations: this.transferData.tableOperations,
          vikaMappings: this.transferData.vikaMappings,
          qingFlowMappings: this.transferData.qingFlowMappings,
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
        this.saveOperations(returnData.row, returnData.operations, uniqueArr(returnData.target, 'field_name'))
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
            this.$message.error(this.$t('message_exists_name'))
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
      this.transferData.tableOperations = data.tableOperations
      this.transferData.vikaMappings = data.vikaMappings
      this.transferData.qingFlowMappings = data.qingFlowMappings
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
    },

    async findOneConnection(id) {
      let filter = {
        where: {
          id
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
      return result?.items?.[0]
    },
    getCurrentOptions() {
      let current = new Date()
      let options = {
        disabledDate: time => {
          return time.getTime() < current.getTime() - 8.64e7
        },
        selectableRange: null
      }
      // same day
      if (
        this.$moment(current).format('YYYY-MM-DD') ===
        this.$moment(this.settingModel.scheduleTime || current).format('YYYY-MM-DD')
      ) {
        options.selectableRange = this.$moment(current).format('HH:mm:ss') + '-23:59:59'
      } else {
        options.selectableRange = '00:00:00' + '-23:59:59'
      }
      return options
    }
  }
}
</script>
