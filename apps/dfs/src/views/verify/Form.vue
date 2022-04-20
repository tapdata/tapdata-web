<template>
  <section class="verify-form-wrap g-panel-container" v-loading="loading">
    <div class="verify-form-title">
      {{ $route.params.id ? $t('verify_title_edit') : $t('verify_title_create') }}
    </div>
    <ElForm
      inline-message
      class="overflow-hidden grey"
      ref="baseForm"
      label-position="left"
      label-width="96px"
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
            <div class="setting-item mt-4">
              <ElCheckbox v-model="item.showAdvancedVerification" v-show="form.inspectMethod === 'field'">{{
                $t('verify_checkbox_advance')
              }}</ElCheckbox>
            </div>
            <div class="setting-item mt-4" v-if="item.showAdvancedVerification && form.inspectMethod === 'field'">
              <label class="item-label">{{ $t('verify_form_label_script') }}: </label>
              <VButton v-if="!item.webScript || item.webScript === ''" @click="addScript(index)">{{
                $t('verify_button_add_script')
              }}</VButton>
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
            <ElLink type="primary" @click.stop="removeItem(index)">{{ $t('button_delete') }}</ElLink>
            <ElLink type="primary" class="block mt-2" @click="editItem(item)">{{ $t('button_edit') }}</ElLink>
          </div>
        </li>
      </ul>
      <div class="joint-table-footer">
        <VButton @click="addTable()">{{ $t('verify_button_add_table') }}</VButton>
        <VButton type="primary" @click="autoAddTable()">{{ $t('verify_button_auto_add_table') }}</VButton>
      </div>
    </div>
    <div class="mt-8">
      <VButton @click="goBack()">{{ $t('button_back') }}</VButton>
      <VButton type="primary" :disabled="!flowStages || !flowStages.length" @click="nextStep()">{{
        $t('button_save')
      }}</VButton>
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
          <CodeEditor class="js-editor" v-model="webScript" lang="javascript"></CodeEditor>
          <div class="js-fixText">}</div>
        </div>
        <div class="markdown-body-wrap example ml-4">
          <div class="markdown-body" v-html="htmlMD"></div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <VButton @click="handleAddScriptClose">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" @click="submitScript">{{ $t('button_confirm') }}</VButton>
      </span>
    </ElDialog>
  </section>
</template>
<style lang="scss" scoped>
.verify-form-title {
  margin-bottom: 24px;
  line-height: 22px;
  font-size: 14px;
  color: map-get($fontColor, main);
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
  background: #fafafa;
}
.joint-table-footer {
  padding: 16px 24px;
}
.joint-table-main {
  .joint-table-item {
    padding: 16px 24px;
    display: flex;
    border-bottom: 1px solid #f2f2f2;
    cursor: pointer;
  }
  .joint-table-setting {
    flex: 1;
    background: #fff;
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
      color: rgba(0, 0, 0, 0.6);
      font-size: 16px;
      text-align: center;
    }
    .item-time-picker,
    .item-input,
    .item-select {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
    border: 1px solid #f2f2f2;
  }
}
</style>
<script>
import i18n from '@/i18n'

const TABLE_PARAMS = {
  connectionId: '',
  table: '',
  sortColumn: '',
  fields: []
}
const META_INSTANCE_FIELDS = {
  id: true,
  name: true,
  original_name: true,
  source: true,
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
import CodeEditor from 'web-core/components/CodeEditor.vue'
export default {
  components: { MultiSelection, CodeEditor },
  data() {
    let self = this
    let requiredValidator = (msg, isCheckMode) => {
      return (rule, value, callback) => {
        let valid = isCheckMode ? self.form.mode === 'cron' : true
        if (valid && !value) {
          callback(new Error(msg))
        } else {
          callback()
        }
      }
    }
    return {
      loading: false,
      timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
      pickerTimes: [],
      htmlMD: '',
      removeVisible: false,
      isDbClone: false,
      editId: -1,
      form: {
        flowId: '',
        name: '',
        mode: 'manual',
        inspectMethod: 'row_count',
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
            validator: requiredValidator(this.$t('verify_validator_message_task'))
          }
        ],
        name: [
          {
            validator: requiredValidator(this.$t('verify_validator_message_job_name'))
          }
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('verify_validator_message_time'), true)
          }
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('verify_validator_message_frequency'), true)
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
      allStages: null,
      jointErrorMessage: ''
    }
  },
  created() {
    this.getFlowOptions()
    this.htmlMD = require(`./functionInfo.md`)
  },
  methods: {
    //获取dataflow数据
    getFlowOptions() {
      this.loading = true
      let id = this.$route.params.id
      let where = {
        status: {
          inq: ['running', 'paused', 'error']
        }
      }
      this.$axios
        .get(
          'tm/api/DataFlows?filter=' +
            encodeURIComponent(
              JSON.stringify({
                where: where,
                fields: {
                  id: true,
                  name: true
                },
                order: 'createTime DESC',
                limit: 999
              })
            )
        )
        .then(data => {
          this.flowOptions = data.items || []
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
      this.$axios
        .get('tm/api/Inspects/findOne', {
          params: {
            filter: JSON.stringify({
              where: {
                id: id
              }
            })
          }
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
            this.form = Object.assign({}, this.form, data)
            this.getFlowStages()
          }
        })
    },
    getFlowStages() {
      this.loading = true
      this.$axios
        .get(
          'tm/api/DataFlows/findOne?filter=' +
            encodeURIComponent(
              JSON.stringify({
                where: {
                  id: this.form.flowId
                },
                fields: {
                  id: true,
                  name: true,
                  stages: true,
                  mappingTemplate: true,
                  stats: true
                }
              })
            )
        )
        .then(data => {
          let flowData = data
          let stages = flowData.stages || []
          if (
            stages.some(item =>
              [
                'kafka',
                'redis',
                'hazelcast_cloud_cluster',
                'elasticsearch',
                'mq',
                'dummy db',
                'vika',
                'qingflow'
              ].includes(item.databaseType || item.database_type)
            )
          ) {
            this.$message.error(i18n.t('verify_Form_suoXuanRenWuCun'))
            this.loading = false
            return
          }
          this.flowStages = []
          this.isDbClone = flowData.mappingTemplate === 'cluster-clone'
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
      let types = isDB ? ['database'] : ['table', 'collection', 'kafka']
      let flowStages = flowData.stages.filter(stg => types.includes(stg.type))
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
          let tableOperations = stg.tableOperations || []
          tables.forEach(t => {
            // 迁移时，可以同时从目标节点获取源和目标的表名，匹配目标表名时注意大小写和前后缀配置
            tableNames.push(t)
            // 拼上前后缀
            let name = stg.table_prefix + t + stg.table_suffix
            // 大小写转换
            if (stg.tableNameTransform) {
              name = name[stg.tableNameTransform]()
            }
            let findOne = tableOperations.find(f => f.originalTableName === t)
            if (findOne) {
              name = findOne.tableName
            }
            tableNames.push(name)
          })
        }
      })
      if (connectionIds.length) {
        let where = {
          meta_type: {
            inq: ['table', 'collection', 'kafka']
          },
          'source.id': {
            inq: Array.from(new Set(connectionIds))
          }
        }
        where.original_name = {
          inq: Array.from(new Set(tableNames))
        }
        this.$axios
          .post('tm/api/MetadataInstances/findInspectPost', {
            where,
            fields: META_INSTANCE_FIELDS
          })
          .then(data => {
            let tables = data?.items || data || []
            if (isDB) {
              this.stageMap = {}
              this.getTreeForDBFlow(tables, flowStages)
            } else {
              this.flowStages = flowStages
              this.allStages = flowData.stages
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
        if (stg.inputLanes?.length) {
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
        let tableOperations = target.tableOperations
        sourceTablesNames.forEach(name => {
          if (!this.flowStages) {
            return
          }
          let targetTableName = target.table_prefix + name + target.table_suffix
          if (target.tableNameTransform) {
            targetTableName = targetTableName[target.tableNameTransform]()
          }
          let findOne = tableOperations.find(f => f.originalTableName === name)
          if (findOne) {
            targetTableName = findOne.tableName
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
              tableName: sourceTable.original_name
            })
            this.flowStages.push({
              id: outputLanes,
              connectionId: targetTable.source.id,
              connectionName: targetTable.source.name,
              fields: targetTable.fields,
              tableName: targetTable.original_name
            })
          } else {
            this.flowStages = null
            this.$message.error(i18n.t('verify_Form_zhaoBuDaoJieDian'))
          }
        })
      })
      let getTree = (type, tables) => {
        let tree = this[type]
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
              webScript: '' //前端使用 用于页面展示
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
          task.target = this.setTable(targetStage)
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
          // let findTargetNewName = task.target.fields?.find(t => t.original_field_name === task.target.sortColumn)
          // if (findTargetNewName) {
          //   task.target.sortColumn = findTargetNewName.field_name
          // }
        }
      }
    },
    setTable(stage, source) {
      let sortColumn = ''
      let sortField = list => {
        return list.sort((a, b) => {
          return a.field_name > b.field_name ? -1 : 1
        })
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
        table: stage.tableName,
        sortColumn,
        fields: sortField(stage.fields)
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
        webScript: '' //前端使用 用于页面展示
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
      this.form.timing.start = times[0]
      this.form.timing.end = times[1]
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
      this.dialogAddScriptVisible = false
    },
    addScript(index) {
      this.formIndex = index
      this.webScript = ''
      this.dialogAddScriptVisible = true
    },
    removeScript(index) {
      this.$confirm(this.$t('verify_message_confirm_delete_script'), this.$t('button_delete'), {
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
      this.webScript = script
      this.dialogAddScriptVisible = true
    },
    submitScript() {
      let script = JSON.parse(JSON.stringify(this.webScript))
      let formIndex = JSON.parse(JSON.stringify(this.formIndex))
      this.form.tasks[formIndex].webScript = script
      this.webScript = ''
      this.formIndex = ''
      this.dialogAddScriptVisible = false
    },
    goBack() {
      this.$confirm(this.$t('verify_message_confirm_back'), this.$t('verify_message_title_confirm_back'), {
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
            this.jointErrorMessage = this.$t('verify_message_error_joint_table_not_set')
            return
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
            this.form.inspectMethod !== 'row_count' &&
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
            this.form.inspectMethod !== 'row_count' &&
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
          this.$axios[this.form.id ? 'patch' : 'post'](
            'tm/api/Inspects',
            Object.assign({}, this.form, {
              fullMatchKeep: this.form.keep,
              status: this.form.mode === 'manual' ? 'scheduling' : 'waiting',
              ping_time: 0,
              tasks: this.form.tasks.map(
                ({ taskId, source, target, fullMatch, showAdvancedVerification, script, webScript }) => {
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
                    webScript
                  }
                }
              ),
              platformInfo: {
                agentType: 'private'
              },
              byFirstCheckId: ''
            })
          ).then(data => {
            if (data) {
              this.$router.back()
            }
          })
        }
      })
    }
  }
}
</script>
