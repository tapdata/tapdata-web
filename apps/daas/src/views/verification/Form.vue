<template>
  <section class="verify-form-wrap section-wrap flex-fill" v-loading="loading">
    <div class="section-wrap-box position-relative">
      <div class="verify-form-title">
        {{ $route.params.id ? $t('verify_title_edit') : $t('verify_title_create') }}
      </div>
      <ElForm
        inline-message
        class="grey"
        ref="baseForm"
        label-position="left"
        label-width="160px"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <ElFormItem required class="form-item" prop="flowId" :label="$t('verify_form_label_select_job') + ': '">
          <ElSelect
            filterable
            class="form-select"
            v-model="form.flowId"
            :loading="!flowOptions"
            @input="flowChangeHandler"
          >
            <ElOption v-for="opt in flowOptions" :key="opt.id" :label="opt.name" :value="opt.id"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem required class="form-item" :label="$t('verify_form_label_type') + ': '">
          <ElRadioGroup v-model="form.inspectMethod">
            <ElRadioButton label="row_count">{{ $t('verify_type_row_count') }}</ElRadioButton>
            <ElRadioButton label="field">{{ $t('verify_type_field') }}</ElRadioButton>
            <ElRadioButton label="jointField">{{ $t('verify_type_joint_field') }}</ElRadioButton>
            <!-- <ElRadioButton label="cdcCount"
              >动态校验
              <ElTooltip
                class="item"
                effect="dark"
                content="基于时间窗口对动态数据进行校验，目前仅支持对行数进行校验"
                placement="top"
              >
                <i class="el-icon-warning-outline"></i>
              </ElTooltip>
            </ElRadioButton> -->
          </ElRadioGroup>
          <div>
            <i class="el-icon-info color-primary mr-1"></i>
            <span style="font-size: 12px">{{
              {
                row_count: $t('verify_tips_type_row_count'),
                field: $t('verify_tips_type_field'),
                jointField: $t('verify_tips_type_joint_field')
              }[form.inspectMethod]
            }}</span>
          </div>
        </ElFormItem>
        <ElFormItem required class="form-item" prop="name" :label="$t('verify_job_name') + ': '">
          <ElInput class="form-input" v-model="form.name"></ElInput>
        </ElFormItem>
        <ElFormItem class="form-item" :label="$t('verify_form_label_frequency') + ': '">
          <ElSelect class="form-select" v-model="form.mode" @input="form.enabled = true">
            <ElOption :label="$t('verify_frequency_manual')" value="manual"></ElOption>
            <ElOption :label="$t('verify_frequency_cron')" value="cron"></ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="form.mode === 'cron'" class="form-item" :label="$t('verify_switch_job_enable_or_not') + ': '">
          <ElSwitch v-model="form.enabled"></ElSwitch>
        </ElFormItem>
        <template v-if="form.mode === 'cron'">
          <ElFormItem class="form-item" prop="timing.start" :label="$t('verify_form_label_start_and_end_time') + ': '">
            <ElDatePicker
              class="form-input"
              :value="[form.timing.start, form.timing.end]"
              type="datetimerange"
              range-separator="-"
              :start-placeholder="$t('date_picker_start_time')"
              :end-placeholder="$t('date_picker_end_time')"
              align="right"
              :default-time="['00:00:00', '23:59:59']"
              value-format="timestamp"
              @input="timingChangeHandler"
            >
            </ElDatePicker>
          </ElFormItem>
          <ElFormItem class="form-item" prop="timing.intervals" :label="$t('verify_form_label_interval') + ': '">
            <ElInput
              class="form-input"
              v-model="form.timing.intervals"
              onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
              onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
            >
              <template slot="append">
                <ElSelect style="width: 100px" v-model="form.timing.intervalsUnit">
                  <ElOption v-for="unit in timeUnitOptions" :key="unit" :label="unit" :value="unit"></ElOption>
                </ElSelect>
              </template>
            </ElInput>
          </ElFormItem>
        </template>
        <ElFormItem class="form-item" :label="$t('verify_form_label_error_save_count') + ': '">
          <ElSelect class="form-select" v-model="form.limit.keep">
            <ElOption :value="100" label="100(rows)"></ElOption>
            <ElOption :value="1000" label="1000(rows)"></ElOption>
            <ElOption :value="10000" label="10000(rows)"></ElOption>
          </ElSelect>
        </ElFormItem>
        <template v-if="form.inspectMethod === 'cdcCount'">
          <ElFormItem class="setting-item">
            <label class="item-label">{{ $t('verify_create_window_duration') }}</label>
            <ElInput
              class="item-input"
              size="mini"
              v-model="form.cdcDuration"
              onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
              onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
            >
              <template slot="append"> {{ $t('timeToLive_m') }} </template>
            </ElInput>
          </ElFormItem>
          <ElFormItem class="setting-item" prop="cdcBeginDate">
            <label class="item-label is-required">校验开始时间</label>
            <ElDatePicker
              class="item-select"
              size="mini"
              v-model="form.cdcBeginDate"
              type="datetime"
              placeholder="校验开始时间"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
            >
            </ElDatePicker>
          </ElFormItem>
          <ElFormItem class="setting-item" v-if="form.mode === 'manual'">
            <label class="item-label">校验结束时间</label>
            <ElDatePicker
              class="item-select"
              size="mini"
              v-model="form.cdcEndDate"
              type="datetime"
              placeholder="校验结束时间"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm"
            >
            </ElDatePicker>
          </ElFormItem>
        </template>
      </ElForm>
      <div
        v-if="flowStages"
        v-loading="!flowStages.length"
        class="joint-table"
        :class="{ error: !!jointErrorMessage }"
        @click="jointErrorMessage = ''"
      >
        <div class="joint-table-header">
          <div>
            <span>{{ $t('verify_form_joint_table_header') }}</span>
            <span class="color-danger ml-6">{{ jointErrorMessage }}</span>
          </div>
          <ElLink type="primary" :disabled="!form.tasks.length" @click="clear">{{
            $t('verify_button_joint_table_clear')
          }}</ElLink>
        </div>
        <ul class="joint-table-main" id="data-verification-form">
          <li class="joint-table-item" v-for="(item, index) in form.tasks" :key="item.id" @click="editItem(item)">
            <div class="joint-table-setting overflow-hidden">
              <div class="setting-item">
                <label class="item-label">{{ $t('verify_form_label_table') }}: </label>
                <ElCascader
                  v-if="editId === item.id"
                  v-model="item.sourceTable"
                  class="item-select"
                  :class="{ red: !item.sourceTable }"
                  :options="item.sourceTree"
                  @input="tableChangeHandler(item, 'source', index)"
                ></ElCascader>
                <span v-else :class="['item-value-text', { 'color-danger': !item.sourceTable }]">{{
                  item.sourceTable ? item.sourceTable[1] : $t('message_placeholderSelect')
                }}</span>
                <span class="item-icon">
                  <i class="el-icon-arrow-right"></i>
                </span>
                <ElCascader
                  v-if="editId === item.id"
                  v-model="item.targetTable"
                  class="item-select"
                  :class="{ red: !item.targetTable }"
                  :options="item.targetTree"
                  @input="tableChangeHandler(item, 'target')"
                ></ElCascader>
                <span v-else :class="['item-value-text', { 'color-danger': !item.targetTable }]">{{
                  item.targetTable ? item.targetTable[1] : $t('message_placeholderSelect')
                }}</span>
              </div>
              <div class="setting-item mt-4" v-show="form.inspectMethod !== 'row_count'">
                <label class="item-label">{{ $t('verify_form_label_index_field') }}: </label>
                <MultiSelection
                  v-if="editId === item.id"
                  v-model="item.source.sortColumn"
                  class="item-select"
                  :class="{ red: !item.source.sortColumn }"
                  :options="item.source.fields"
                  :id="'item-source-' + index"
                ></MultiSelection>
                <span v-else :class="['item-value-text', { 'color-danger': !item.source.sortColumn }]">{{
                  item.source.sortColumn || $t('message_placeholderSelect')
                }}</span>
                <span class="item-icon"></span>
                <MultiSelection
                  v-if="editId === item.id"
                  v-model="item.target.sortColumn"
                  class="item-select"
                  :class="{ red: !item.target.sortColumn }"
                  :options="item.target.fields"
                ></MultiSelection>
                <span v-else :class="['item-value-text', { 'color-danger': !item.target.sortColumn }]">{{
                  item.target.sortColumn || $t('message_placeholderSelect')
                }}</span>
              </div>
              <!-- <div v-if="editId === item.id" class="setting-item mt-4">
                <label class="item-label"></label>
                <span class="item-select">
                  <label class="item-label mr-2">{{ $t('verify_form_source_filter') }}</label>
                  <ElSwitch v-model="item.source.sourceFilterFalg" @input="item.source.where = ''"></ElSwitch>
                </span>
                <span class="item-icon"></span>
                <span class="item-select">
                  <label class="item-label mr-2">{{ $t('verify_form_target_filter') }}</label>
                  <ElSwitch
                    :disabled="item.showAdvancedVerification"
                    v-model="item.target.targeFilterFalg"
                    @input="item.target.where = ''"
                  ></ElSwitch>
                </span>
              </div>
              <div v-if="item.source.sourceFilterFalg || item.target.targeFilterFalg" class="setting-item mt-4">
                <label class="item-label"></label>
                <div class="item-filter">
                  <div v-if="item.source.sourceFilterFalg" class="item-filter-body">
                    <template v-if="editId === item.id">
                      <VCodeEditor
                        v-model.trim="item.source.where"
                        class="mb-2"
                        lang="sql"
                        height="200px"
                      ></VCodeEditor>
                      <div class="filter-example-label">{{ $t('dag_dialog_field_mapping_example') }}</div>
                      <div v-if="item.source.databaseType === 'mongodb'" class="filter-example">
                        {"field": 1, "field2": "value"}
                      </div>
                      <div v-else class="filter-example">WHERE field1 = 1 and field2 = "value"</div>
                    </template>
                    <div v-else-if="item.source.where">
                      {{ item.source.where }}
                    </div>
                  </div>
                </div>
                <span class="item-icon"></span>
                <div class="item-filter">
                  <div v-if="item.target.targeFilterFalg" class="item-filter-body">
                    <template v-if="editId === item.id">
                      <VCodeEditor
                        v-model.trim="item.target.where"
                        class="mb-2"
                        lang="sql"
                        height="200px"
                      ></VCodeEditor>
                      <div class="filter-example-label">{{ $t('dag_dialog_field_mapping_example') }}</div>
                      <div v-if="item.target.databaseType === 'mongodb'" class="filter-example">
                        {"field": 1, "field2": "value"}
                      </div>
                      <div v-else class="filter-example">WHERE field1 = 1 and field2 = "value"</div>
                    </template>
                    <div v-else-if="item.target.where">
                      {{ item.target.where }}
                    </div>
                  </div>
                </div>
              </div> -->
              <div class="setting-item mt-4">
                <ElCheckbox
                  v-if="editId === item.id"
                  v-model="item.showAdvancedVerification"
                  v-show="form.inspectMethod === 'field'"
                  @input="handleChangeAdvanced(item)"
                  >{{ $t('verify_checkbox_advance') }}</ElCheckbox
                >
              </div>
              <div class="setting-item mt-4" v-if="item.showAdvancedVerification && form.inspectMethod === 'field'">
                <label class="item-label">{{ $t('verify_form_label_script') }}: </label>
                <ElButton v-if="!item.webScript || item.webScript === ''" @click="addScript(index)">{{
                  $t('verify_button_add_script')
                }}</ElButton>
                <template v-else>
                  <ElLink type="primary" class="ml-4" @click="editScript(index)">{{ $t('button_edit') }}</ElLink>
                  <ElLink type="primary" class="ml-4" @click="removeScript(index)">{{ $t('button_delete') }}</ElLink>
                </template>
              </div>
              <div
                class="setting-item mt-4"
                v-if="form.inspectMethod === 'field' && item.showAdvancedVerification && item.webScript"
              >
                <pre class="item-script">{{ item.webScript }}</pre>
              </div>
            </div>
            <div class="ml-6">
              <a class="el-link el-link--primary is-underline" @click.stop="removeItem(index)">{{
                $t('button_delete')
              }}</a>
            </div>
          </li>
        </ul>
        <div class="joint-table-footer">
          <ElButton size="mini" @click="addTable()">{{ $t('verify_button_add_table') }}</ElButton>
          <ElButton type="primary" size="mini" @click="autoAddTable()">{{
            $t('verify_button_auto_add_table')
          }}</ElButton>
        </div>
      </div>
      <div class="mt-8">
        <ElButton size="mini" @click="goBack()">{{ $t('button_back') }}</ElButton>
        <ElButton type="primary" size="mini" :disabled="!flowStages || !flowStages.length" @click="nextStep()">{{
          $t('button_save')
        }}</ElButton>
      </div>
    </div>

    <ElDialog
      width="60%"
      :title="$t('dataVerification_JSVerifyLogic')"
      :visible.sync="dialogAddScriptVisible"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox">
          <div class="js-fixText"><span style="color: #0000ff">function </span><span> validate(sourceRow){</span></div>
          <JsEditor v-model="webScript" class="js-editor"></JsEditor>
          <div class="js-fixText">}</div>
        </div>
        <GitBook :value="doc" class="example ml-4 color-primary"></GitBook>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleAddScriptClose">{{ $t('button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submitScript">{{ $t('button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>
<style lang="scss" scoped>
.verify-form-wrap {
  overflow: hidden;
  .section-wrap-box {
    height: 100%;
    flex-direction: column;
    overflow: auto;
  }
}
.verify-form-title {
  margin-bottom: 24px;
  line-height: 22px;
  font-size: 14px;
  color: map-get($fontColor, dark);
}
.form-item {
  margin-bottom: 32px;
}
.form-select {
  width: 276px;
}
.form-input {
  width: 505px;
}
.joint-table {
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  &.error {
    border-color: map-get($color, danger);
  }
}
.joint-table-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  background: map-get($bgColor, normal);
}
.joint-table-footer {
  padding: 16px 24px;
}
.joint-table-main {
  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid map-get($borderColor, light);
    cursor: pointer;
  }
  .joint-table-setting {
    flex: 1;
    background-color: map-get($bgColor, white);
  }
  .setting-item {
    display: flex;
    margin-bottom: 0;
    .el-form-item__content {
      display: flex;
      align-items: center;
      line-height: 1;
    }
    .item-label {
      width: 80px;
      line-height: 32px;
      text-align: left;
    }
    .item-icon {
      margin: 0 10px;
      width: 20px;
      line-height: 32px;
      color: map-get($fontColor, light);
      font-size: 16px;
      text-align: center;
    }
    .item-time-picker,
    .item-input,
    .item-select,
    .item-filter {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-filter-body {
      padding: 16px;
      background: map-get($fontColor, normal);
      border-radius: 2px;
      color: map-get($fontColor, slight);
      .filter-example-label {
        margin-top: 8px;
        color: #bfd0ff;
        line-height: 17px;
      }
      .filter-example {
        margin-top: 8px;
        padding: 8px;
        line-height: 30px;
        background: #262838;
        color: #82b290;
      }
    }
    .item-value-text {
      flex: 1;
      line-height: 32px;
      padding: 0 16px;
    }
    .item-script {
      margin: 0;
      padding: 16px 24px;
      width: 100%;
      max-height: 130px;
      overflow: auto;
      border-radius: 5px;
      border-left: 5px solid map-get($color, primary);
      background: #eff1f4;
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      line-height: 17px;
    }
  }
}
</style>
<style lang="scss">
.joint-table {
  .red .el-input__inner {
    border: none;
    border: 1px solid #ee5353;
    border-radius: 4px;
  }
}
.js-wrap {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  .jsBox {
    display: flex;
    flex-direction: column;
    flex: 1;
    .js-fixText {
      line-height: 25px;
    }
    .js-fixContent {
      margin-left: 60px;
    }
  }
  .example {
    width: 300px;
  }
  .js-editor {
    border: 1px solid map-get($borderColor, light);
  }
}
</style>
<script>
const TABLE_PARAMS = {
  connectionId: '',
  table: '',
  databaseType: '',
  sortColumn: '',
  fields: []
}
const META_INSTANCE_FIELDS = {
  id: true,
  name: true,
  original_name: true,
  'source.id': true,
  'source.name': true,
  fields: true,
  'fields.id': true,
  'fields.field_name': true,
  'fields.primary_key_position': true,
  databaseId: true,
  meta_type: true
}
import MultiSelection from './MultiSelection.vue'
import { /*VCodeEditor,*/ JsEditor, GitBook } from '@tap/component'

import { DATA_NODE_TYPES } from '@/const.js'
import { metadataInstancesApi, taskApi, inspectApi } from '@tap/api'

export default {
  components: { MultiSelection, /*VCodeEditor,*/ JsEditor, GitBook },
  data() {
    let self = this
    let requiredValidator = (msg, check) => {
      return (rule, value, callback) => {
        let valid = check ? check() : true
        if (valid && !value) {
          callback(new Error(msg))
        } else {
          callback()
        }
      }
    }
    let checkMode = () => {
      return self.form.mode === 'cron'
    }
    return {
      loading: false,
      timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
      pickerTimes: [],
      doc: '',
      removeVisible: false,
      isDbClone: false,
      editId: -1,
      form: {
        flowId: '',
        name: '',
        mode: 'manual',
        inspectMethod: 'row_count',
        cdcBeginDate: '',
        cdcEndDate: '',
        cdcDuration: '',
        timing: {
          intervals: 24 * 60,
          intervalsUnit: 'minute',
          start: new Date().getTime(),
          end: new Date().getTime() + 24 * 60 * 60 * 1000
        },
        limit: {
          keep: 100
        },
        enabled: true,
        tasks: []
      },
      rules: {
        flowId: [
          {
            validator: requiredValidator(this.$t('dataVerification_tasksDataFlow'))
          }
        ],
        name: [
          {
            validator: requiredValidator(this.$t('dataVerification_tasksJobName'))
          }
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('dataVerification_tasksTime'), checkMode)
          }
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('dataVerification_tasksVerifyInterval'), checkMode)
          }
        ],
        cdcBeginDate: [
          {
            validator: requiredValidator('请输入开始时间', () => {
              return self.form.inspectMethod === 'cdcCount'
            })
          }
        ]
      },
      sourceTree: [],
      targetTree: [],
      stageMap: {},
      flowStages: null,
      flowOptions: null,
      dialogAddScriptVisible: false,
      formIndex: '',
      webScript: '',
      jsEngineName: 'graal.js',
      jointErrorMessage: '',
      allStages: null
    }
  },
  created() {
    this.getFlowOptions()
    this.loadDoc()
  },
  methods: {
    handleChangeAdvanced(item) {
      item.target.targeFilterFalg = false
      item.target.where = ''
    },
    //获取dataflow数据
    getFlowOptions() {
      this.loading = true
      let id = this.$route.params.id
      let where = {
        status: {
          inq: ['running', 'stop', 'complete']
        },
        syncType: 'migrate'
      }
      taskApi
        .get({
          filter: JSON.stringify({
            where: where,
            fields: {
              id: true,
              name: true
            },
            order: 'createTime DESC',
            limit: 999,
            skip: 0
          })
        })
        .then(data => {
          let list = data?.items || []
          this.flowOptions = list
          let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {}
          this.form.name = this.form.name || flow.name || ''
          this.form['dataFlowName'] = flow.name
          if (id) {
            this.getData(id)
          }
        })
        .finally(() => {
          !id && (this.loading = false)
        })
    },
    //获取表单数据
    getData(id) {
      inspectApi
        .findOne({
          filter: JSON.stringify({
            where: {
              id: id
            }
          })
        })
        .then(data => {
          if (data) {
            data.tasks = data.tasks.map(t => {
              t.sourceTable = [t.source.connectionId, t.source.table]
              t.targetTable = [t.target.connectionId, t.target.table]
              t.source = Object.assign({}, TABLE_PARAMS, t.source)
              t.target = Object.assign({}, TABLE_PARAMS, t.target)
              t.sourceTree = []
              t.targetTree = []
              t.id = t.taskId
              return t
            })
            if (!data.timing) {
              data.timing = this.form.timing
            }
            this.form = Object.assign({}, this.form, data)
            this.getFlowStages()
          }
        })
    },
    getFlowStages() {
      this.loading = true
      taskApi
        .getId(this.form.flowId)
        .then(data => {
          let flowData = data
          this.flowStages = []
          this.isDbClone = flowData.syncType === 'migrate'
          this.dealData(flowData, this.getTaskTree, this.isDbClone)
        })
        .finally(() => {
          this.loading = false
        })
    },
    //dataflow改变时
    flowChangeHandler() {
      this.form.tasks = []
      this.sourceTree = []
      this.targetTree = []
      let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {}
      this.form.name = this.form.name || flow.name || ''
      this.getFlowStages()
    },
    dealData(flowData, callback, isDB) {
      let types = isDB ? ['database'] : DATA_NODE_TYPES
      let edges = flowData.dag?.edges || []
      let nodes = flowData.dag?.nodes || []
      if (!edges.length) {
        return this.$message.error('所选任务缺少节点连线信息')
      }
      let stages = []
      nodes.forEach(n => {
        let outputLanes = []
        let inputLanes = []
        edges.forEach(e => {
          if (e.source === n.id) {
            outputLanes.push(e.target)
          }
          if (e.target === n.id) {
            inputLanes.push(e.source)
          }
        })
        stages.push(
          Object.assign({}, n, {
            outputLanes,
            inputLanes
          })
        )
      })
      let flowStages = stages.filter(stg => types.includes(stg.type))
      let connectionIds = []
      let tableNames = []
      flowStages.forEach(stg => {
        connectionIds.push(stg.connectionId)
        // 获取节点表名称，缩小接口请求数据的范围
        if (!isDB) {
          tableNames.push(stg.tableName)
        } else if (stg.syncObjects?.length) {
          // 当stage存在syncObjects字段说明是目标节点
          let obj = stg.syncObjects[0]
          let tables = obj.objectNames || []
          tables.forEach(t => {
            // 迁移时，可以同时从目标节点获取源和目标的表名，匹配目标表名时注意大小写和前后缀配置
            tableNames.push(t)
            // 拼上前后缀
            let name = stg.tablePrefix + t + stg.tableSuffix
            // 大小写转换
            if (stg.tableNameTransform) {
              name = name[stg.tableNameTransform]()
            }
            tableNames.push(name)
          })
        }
      })
      if (connectionIds.length) {
        let where = {
          meta_type: {
            inq: DATA_NODE_TYPES
          },
          'source.id': {
            inq: Array.from(new Set(connectionIds))
          }
        }
        where.original_name = {
          inq: Array.from(new Set(tableNames))
        }
        metadataInstancesApi
          .findInspect({
            where,
            fields: META_INSTANCE_FIELDS
          })
          .then(data => {
            let tables = data || []
            if (isDB) {
              this.stageMap = {}
              this.getTreeForDBFlow(tables, flowStages)
            } else {
              this.flowStages = flowStages
              this.allStages = stages
              flowStages.forEach((stage, index) => {
                let table = tables.find(
                  tb => tb.source.id === stage.connectionId && tb.original_name === stage.tableName
                )
                if (table) {
                  stage.connectionName = table.source.name
                  stage.fields = table.fields
                  if (stage.outputLanes.length) {
                    this.getTree(this.sourceTree, stage)
                  }
                  if (stage.inputLanes.length) {
                    this.getTree(this.targetTree, stage)
                  }
                }
                flowStages[index] = stage
              })
              this.getStageMap(flowStages)
            }
            callback()
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    //获取源表和目标表数据
    getTree(tree, stage = {}) {
      let parent = tree.find(c => c.value === stage.connectionId)
      if (!parent) {
        parent = {
          label: stage.connectionName,
          value: stage.connectionId,
          level: 1,
          children: []
        }
        tree.push(parent)
      }
      if (parent.children.every(t => t.value !== stage.tableName)) {
        parent.children.push({
          label: stage.tableName,
          value: stage.tableName,
          level: 2
        })
      }
    },
    getTreeForDBFlow(tables, flowStages) {
      let stagesMap = {}
      let targetStages = []
      flowStages.forEach(stg => {
        stagesMap[stg.id] = stg
        if (stg.syncObjects?.length) {
          targetStages.push(stg)
        }
      })
      this.sourceTree = []
      this.targetTree = []
      let sourceTables = []
      let targetTables = []
      targetStages.forEach(stage => {
        let target = stage
        let source = stagesMap[target.inputLanes[0]]

        let obj = target.syncObjects[0]
        let sourceTablesNames = obj.objectNames || []
        sourceTablesNames.forEach(name => {
          let targetPrefix = target.tablePrefix || ''
          let targetSuffix = target.tablePrefix || ''
          let targetTableName = targetPrefix + name + targetSuffix
          if (target.tableNameTransform) {
            targetTableName = targetTableName[target.tableNameTransform]()
          }
          let sourceTable = tables.find(tb => tb.original_name === name && tb.source.id === source.connectionId)
          let targetTable = tables.find(
            tb => tb.original_name === targetTableName && tb.source.id === target.connectionId
          )
          if (sourceTable && targetTable) {
            sourceTables.push(sourceTable)
            targetTables.push(targetTable)

            let outputLanes = target.connectionId + targetTableName
            let key = source.connectionId + name
            this.stageMap[key] = [outputLanes]
            this.flowStages.push({
              id: key,
              connectionId: sourceTable.source.id,
              connectionName: sourceTable.source.name,
              fields: sourceTable.fields,
              tableName: sourceTable.original_name,
              nodeId: source.id
            })
            this.flowStages.push({
              id: outputLanes,
              connectionId: targetTable.source.id,
              connectionName: targetTable.source.name,
              fields: targetTable.fields,
              tableName: targetTable.original_name,
              nodeId: target.id
            })
          } else {
            this.flowStages = null
            this.$message.error('找不到节点对应的表信息')
          }
        })
      })
      let getTree = (type, tables) => {
        let tree = this[type]
        tables.sort((a, b) => {
          return a.original_name - b.original_name
        })
        tables.forEach(tb => {
          let parent = tree.find(item => item.value === tb.source.id)
          if (!parent) {
            parent = {
              label: tb.source.name,
              value: tb.source.id,
              children: []
            }
            tree.push(parent)
          }

          if (!parent.children.some(c => c.value === tb.original_name)) {
            parent.children.push({
              label: tb.original_name,
              value: tb.original_name
            })
          }
        })
      }
      getTree('sourceTree', sourceTables)
      getTree('targetTree', targetTables)
    },
    //获取表的连线关系
    getStageMap(stages) {
      let checkOutputLanes = lanes => {
        let result = []
        lanes.forEach(stgId => {
          let targetStg = this.allStages.find(it => it.id === stgId)
          if (targetStg.outputLanes.length) {
            result.push(...checkOutputLanes(targetStg.outputLanes))
          } else {
            result.push(stgId)
          }
        })
        return result
      }
      let map = {}
      let sMap = {}
      stages.forEach(stg => {
        if (stg.outputLanes.length) {
          let stage = sMap[stg.connectionId + stg.tableName] || {}
          let stgId = stage.id || stg.id
          let outputLanes = map[stgId] || []
          outputLanes.push(...checkOutputLanes(stg.outputLanes))
          map[stgId] = outputLanes
          sMap[stg.connectionId + stg.tableName] = stg
        }
      })
      this.stageMap = map
    },
    getTaskTree() {
      let sourceTree = this.sourceTree
      let map = this.stageMap
      let stages = this.flowStages

      if (this.form.tasks && this.form.tasks.length) {
        this.form.tasks.forEach((t, idx) => {
          let targetTree = []
          let sourceTable = t.sourceTable
          if (sourceTable && sourceTable[0] && sourceTable[1]) {
            let stageKey = null
            if (this.isDbClone) {
              stageKey = sourceTable.join('')
            } else {
              let stage = stages.find(stg => stg.connectionId === sourceTable[0] && stg.tableName === sourceTable[1])
              if (stage) {
                stageKey = stage.id
              }
            }
            if (stageKey) {
              let outputLanes = map[stageKey]
              if (outputLanes && outputLanes.length) {
                let tree = []
                outputLanes.forEach(id => {
                  let stg = stages.find(stg => stg.id === id)
                  this.getTree(tree, stg)
                })
                targetTree = tree
              }
            }
          }
          this.form.tasks[idx].sourceTree = sourceTree
          this.form.tasks[idx].targetTree = targetTree
        })
      }
    },
    //根据表的连线关系自动添加校验条件
    autoAddTable() {
      this.form.tasks = []
      this.$nextTick(() => {
        let stages = this.flowStages
        let map = this.stageMap
        for (const key in map) {
          const lanes = map[key]
          let stg = stages.find(stg => stg.id === key)
          lanes.forEach(id => {
            let targetStage = stages.find(it => it.id === id)
            let task = {
              id: this.$util.uuid(),
              source: this.setTable(stg),
              target: Object.assign({}, TABLE_PARAMS),
              sourceTable: [stg.connectionId, stg.tableName],
              sourceTree: [],
              targetTree: [],
              showAdvancedVerification: false,
              script: '', //后台使用 需要拼接function头尾
              webScript: '', //前端使用 用于页面展示
              jsEngineName: 'graal.js'
            }
            if (targetStage) {
              this.setTarget(task, targetStage)
            }
            this.form.tasks.push(task)
          })
        }
        this.getTaskTree()
      })
    },
    setTarget(task, targetStage) {
      let stages = this.flowStages
      let source = task.source
      if (source && source.connectionId) {
        let sourceStage = stages.find(stg => stg.connectionId === source.connectionId && stg.tableName === source.table)
        if (sourceStage) {
          task.target = this.setTable(targetStage, source)
          task.targetTable = [targetStage.connectionId, targetStage.tableName]
          if (targetStage.joinTables) {
            let joinTable = targetStage.joinTables.find(ts => ts.stageId === sourceStage.id)
            if (joinTable) {
              let sourceSortColumn = []
              let targetSortColumn = []
              joinTable.joinKeys.forEach(obj => {
                if (task.source.fields.find(f => f.field_name === obj.source)) {
                  sourceSortColumn.push(obj.source)
                }
                if (task.target.fields.find(f => f.field_name === obj.target)) {
                  targetSortColumn.push(obj.target)
                }
              })
              task.source.sortColumn = sourceSortColumn.join(',')
              task.target.sortColumn = targetSortColumn.join(',')
            }
          }
        }
      }
    },
    setTable(stage, source) {
      let sortColumn = ''
      let sortField = list => {
        return (
          list?.sort((a, b) => {
            return a.field_name > b.field_name ? -1 : 1
          }) || []
        )
      }
      if (stage && stage.fields && stage.fields.length) {
        if (source && source.sortColumn) {
          sortColumn = source.sortColumn
        } else {
          let pkList = stage.fields.filter(f => f.primary_key_position > 0)
          if (pkList.length) {
            sortColumn = sortField(pkList)
              .map(it => it.field_name)
              .join(',')
          }
        }
      }
      return {
        connectionId: stage.connectionId,
        connectionName: stage.connectionName,
        databaseType: stage.databaseType,
        table: stage.tableName,
        sortColumn,
        fields: sortField(stage.fields),
        nodeId: stage.nodeId
      }
    },
    addTable() {
      this.form.tasks.push({
        id: this.$util.uuid(),
        source: Object.assign({}, TABLE_PARAMS),
        target: Object.assign({}, TABLE_PARAMS),
        sourceTree: [],
        targetTree: [],
        showAdvancedVerification: false,
        script: '', //后台使用 需要拼接function头尾
        webScript: '', //前端使用 用于页面展示
        jsEngineName: 'graal.js'
      })
      this.getTaskTree()
    },
    removeItem(idx) {
      this.form.tasks.splice(idx, 1)
    },
    editItem(item) {
      this.editId = item.id
    },
    clear() {
      this.form.tasks = []
    },
    timingChangeHandler(times) {
      this.form.timing.start = times?.[0] || ''
      this.form.timing.end = times?.[1] || ''
    },
    tableChangeHandler(item, type, index) {
      let stages = this.flowStages
      let values = item[type + 'Table']
      if (values && values.length) {
        let sourceStage = stages.find(stg => stg.connectionId === values[0] && stg.tableName === values[1])
        if (sourceStage) {
          item[type] = this.setTable(sourceStage)
          if (type === 'source') {
            let task = this.form.tasks[index]
            task.target = Object.assign({}, TABLE_PARAMS)
            task.targetTable = ['', '']
            this.$nextTick(() => {
              this.getTaskTree()
              this.$nextTick(() => {
                let targetTree = task.targetTree
                if (targetTree.length === 1 && targetTree[0].children.length === 1) {
                  let targetStage = stages.find(
                    stg => stg.connectionId === targetTree[0].value && stg.tableName === targetTree[0].children[0].value
                  )
                  this.setTarget(task, targetStage)
                }
              })
            })
          }
        }
      }
    },
    handleAddScriptClose() {
      this.webScript = ''
      this.formIndex = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = false
    },
    addScript(index) {
      this.formIndex = index
      this.webScript = ''
      this.jsEngineName = 'graal.js'
      this.dialogAddScriptVisible = true
    },
    removeScript(index) {
      this.$confirm(this.$t('message_verifyConfirm'), this.$t('message_delete'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.form.tasks[index].webScript = ''
      })
    },
    editScript(index) {
      this.formIndex = index
      let script = JSON.parse(JSON.stringify(this.form.tasks[this.formIndex].webScript))
      this.jsEngineName = JSON.parse(JSON.stringify(this.form.tasks[this.formIndex].jsEngineName || 'nashorn'))
      this.webScript = script
      this.dialogAddScriptVisible = true
    },
    submitScript() {
      let script = JSON.parse(JSON.stringify(this.webScript))
      let formIndex = JSON.parse(JSON.stringify(this.formIndex))
      let jsEngineName = JSON.parse(JSON.stringify(this.jsEngineName))
      this.form.tasks[formIndex].webScript = script
      this.form.tasks[formIndex].jsEngineName = jsEngineName
      this.jsEngineName = ''
      this.webScript = ''
      this.formIndex = ''
      this.dialogAddScriptVisible = false
    },
    goBack() {
      this.$confirm(this.$t('dataVerification_backConfirmMessage'), this.$t('dataVerification_backConfirmTitle'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.back()
      })
    },
    nextStep() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let tasks = this.form.tasks
          let index = 0
          if (!tasks.length) {
            return this.$message.error(this.$t('dataVerification_tasksVerifyCondition'))
          }
          // 判断表名称是否为空
          if (
            tasks.some((c, i) => {
              index = i + 1
              return !c.source.table || !c.target.table
            })
          ) {
            this.editId = tasks[index - 1]?.id
            this.$nextTick(() => {
              document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
            })
            this.jointErrorMessage = this.$t('verify_message_error_joint_table_field_not_set')
            return this.$message.error(this.$t('verify_message_error_joint_table_target_or_source_not_set'))
          }
          // 判断表字段校验时，索引字段是否为空
          index = 0
          if (
            ['field', 'jointField'].includes(this.form.inspectMethod) &&
            tasks.some((c, i) => {
              index = i + 1
              return !c.source.sortColumn || !c.target.sortColumn
            })
          ) {
            this.editId = tasks[index - 1]?.id
            this.$nextTick(() => {
              document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
            })
            this.jointErrorMessage = this.$t('verify_message_error_joint_table_field_not_set')
            return this.$message.error(this.$t('verify_message_error_joint_table_field_not_set'))
          }
          // 判断表字段校验时，索引字段是否个数一致
          index = 0
          if (
            ['field', 'jointField'].includes(this.form.inspectMethod) &&
            tasks.some((c, i) => {
              index = i + 1
              return c.source.sortColumn.split(',').length !== c.target.sortColumn.split(',').length
            })
          ) {
            this.editId = tasks[index - 1]?.id
            this.$nextTick(() => {
              let item = document.getElementById('item-source-' + (index - 1))
              item.querySelector('input').focus()
            })
            this.jointErrorMessage = this.$t('verify_message_error_joint_table_field_not_match')
            return this.$message.error(this.$t('verify_message_error_joint_table_field_not_match'))
          }
          // 开启高级校验后，JS校验逻辑不能为空
          index = 0
          if (
            this.form.inspectMethod === 'field' &&
            tasks.some((c, i) => {
              index = i + 1
              return c.showAdvancedVerification && !c.webScript
            })
          ) {
            this.editId = tasks[index - 1]?.id
            this.$nextTick(() => {
              document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
            })
            this.jointErrorMessage = this.$t('verify_message_error_script_no_enter')
            return this.$message.error(this.$t('verify_message_error_script_no_enter'))
          }
          if (this.form.inspectMethod === 'jointField') {
            tasks.forEach(item => {
              item['fullMatch'] = false
            })
          } else {
            tasks.forEach(item => {
              item['fullMatch'] = true
            })
          }
          if (this.form && this.form.createTime && this.form.last_updated) {
            delete this.form.createTime
            delete this.form.last_updated
          }
          inspectApi[this.form.id ? 'patch' : 'post'](
            Object.assign({}, this.form, {
              fullMatchKeep: this.form.keep,
              status: this.form.mode === 'manual' ? 'scheduling' : 'waiting',
              ping_time: 0,
              tasks: this.form.tasks.map(
                ({ taskId, source, target, fullMatch, showAdvancedVerification, script, webScript, jsEngineName }) => {
                  if (webScript && webScript !== '') {
                    script = 'function validate(sourceRow){' + webScript + '}'
                  }
                  return {
                    taskId,
                    source,
                    target,
                    fullMatch,
                    showAdvancedVerification,
                    script,
                    webScript,
                    jsEngineName
                  }
                }
              ),
              platformInfo: {
                agentType: 'private'
              },
              byFirstCheckId: '',
              browserTimezoneOffset: new Date().getTimezoneOffset()
            })
          ).then(() => {
            this.$router.back()
          })
          // .catch(err => {
          //   let message = err?.data?.message || this.$t('message_operation_error')
          //   this.$message.error(message)
          // })
        }
      })
    },
    loadDoc() {
      if (this.$i18n.locale === 'en') {
        this.doc = `##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
\`\`\`\`javascript
function validate(sourceRow){
    // step 1
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // step 2
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // step 3
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed', message: "Inconsistent records", data: targetRow}
    }
}
\`\`\`\``
      } else if (this.$i18n.locale === 'zh-TW') {
        this.doc = `##### 高級校驗說明
**第一步** 函數入參為源表數據，可以根據源表數據調用**內置函數**查詢出目標數據<br>
**第二步** 自定義校驗邏輯<br>
**第三步** 函數返回結果<br>

- **result**：是否通過校驗（passed：校驗通過，failed：校驗失敗），如果不填或填其它字符則校驗失敗，必填項<br>
- **message**：校驗異常信息，建議校驗失敗返回，選填項<br>
- **data**：當前校驗目標數據，建議校驗失敗返回，選填項<br>


完整示例：此為MongoDB查詢示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "記錄不一致",data: targetRow}
    }
}
\`\`\``
      } else {
        this.doc = `##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
\`\`\`javascript
function validate(sourceRow){
    // 第1步
    var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
    // 第2步
    if(sourceRow.USER_ID === targetRow[0].USER_ID){
        // 第3步
        return {result: 'passed',message: "",data: ""}
    }else{
        return {result: 'failed',message: "记录不一致",data: targetRow}
    }
}
\`\`\`
`
      }
    }
  }
}
</script>
