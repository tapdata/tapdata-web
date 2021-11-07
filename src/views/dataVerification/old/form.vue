<template>
  <section class="data-verification-form" v-loading="loading">
    <div class="form-container">
      <div class="form-body">
        <h1 class="title">
          <span>{{ $route.params.id ? $t('dataVerification.edit') : $t('dataVerification.newVerify') }}</span>
          <div style="font-size: 12px" v-show="form.mode === 'cron'">
            <span style="color: #409eff" v-show="form.enabled">{{ $t('dataVerification.enable') }}</span>
            <span style="color: #9a9a9a" v-show="!form.enabled">{{ $t('dataVerification.disable') }}</span>
            <el-switch size="mini" v-model="form.enabled"></el-switch>
          </div>
        </h1>
        <div class="form-panel">
          <div class="panel-label">
            <span>{{ $t('dataVerification.BasicSettings') }}</span>
          </div>
          <el-form
            inline-message
            ref="baseForm"
            :model="form"
            :rules="rules"
            :validate-on-rule-change="false"
            class="panel-container"
            label-position="right"
            style="padding: 10px 20px"
          >
            <el-form-item class="setting-item" prop="flowId">
              <label class="item-label is-required">{{ $t('dataVerification.chooseJob') }}</label>
              <el-select
                filterable
                class="item-select"
                size="mini"
                v-model="form.flowId"
                :placeholder="$t('dataVerification.chooseJob')"
                :loading="!flowOptions"
                @input="flowChangeHandler"
              >
                <el-option v-for="opt in flowOptions" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="setting-item">
              <label class="item-label">{{ $t('dataVerification.verifytype') }}</label>
              <el-radio-group v-model="form.inspectMethod" style="margin-left: 10px">
                <el-radio label="row_count">
                  {{ $t('dataVerification.rowVerify') }}
                  <el-tooltip class="item" effect="dark" :content="$t('dataVerification.fastCountTip')" placement="top">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </el-radio>
                <el-radio label="field">
                  {{ $t('dataVerification.contentVerify') }}
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="$t('dataVerification.contentVerifyTip')"
                    placement="top"
                  >
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </el-radio>
                <el-radio label="jointField">
                  {{ $t('dataVerification.jointVerify') }}
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="$t('dataVerification.jointFieldTip')"
                    placement="top"
                  >
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </el-radio>
                <ElRadio label="cdcCount"
                  >动态校验
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="基于时间窗口对动态数据进行校验，目前仅支持对行数进行校验"
                    placement="top"
                  >
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </ElRadio>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="setting-item" prop="name">
              <label class="item-label is-required">{{ $t('dataVerification.verifyJobName') }}</label>
              <el-input class="item-input" size="mini" v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item class="setting-item">
              <label class="item-label">{{ $t('dataVerification.frequency') }}</label>
              <el-select class="item-select" v-model="form.mode" size="mini" placeholder="请选择">
                <el-option :label="$t('dataVerification.singleVerify')" value="manual"></el-option>
                <el-option :label="$t('dataVerification.repeatingVerify')" value="cron"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="setting-item" prop="timing.start" v-show="form.mode === 'cron'">
              <label class="item-label">{{ $t('dataVerification.startAndStopTime') }}</label>
              <el-date-picker
                class="item-select"
                size="mini"
                :value="[form.timing.start, form.timing.end]"
                type="datetimerange"
                range-separator="-"
                :start-placeholder="$t('dataVerification.startTime')"
                :end-placeholder="$t('dataVerification.LastTime')"
                align="right"
                :default-time="['00:00:00', '23:59:59']"
                value-format="timestamp"
                @input="timingChangeHandler"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item class="setting-item" prop="timing.intervals" v-show="form.mode === 'cron'">
              <label class="item-label">{{ $t('dataVerification.verifyInterval') }}</label>
              <el-input
                class="item-input"
                size="mini"
                v-model="form.timing.intervals"
                onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
              >
                <template slot="append">
                  <el-select style="width: 100px" size="mini" v-model="form.timing.intervalsUnit">
                    <el-option v-for="unit in timeUnitOptions" :key="unit" :label="unit" :value="unit"></el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item class="setting-item">
              <label class="item-label">{{ $t('dataVerification.inconsistentCount') }}</label>
              <el-select class="item-select" size="mini" v-model="form.limit.keep">
                <el-option :value="100" label="100(rows)"></el-option>
                <el-option :value="1000" label="1000(rows)"></el-option>
                <el-option :value="10000" label="10000(rows)"></el-option>
              </el-select>
            </el-form-item>
            <template v-if="form.inspectMethod === 'cdcCount'">
              <el-form-item class="setting-item">
                <label class="item-label">{{ $t('verify_create_window_duration') }}</label>
                <el-input
                  class="item-input"
                  size="mini"
                  v-model="form.cdcDuration"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <template slot="append"> {{ $t('timeToLive.m') }} </template>
                </el-input>
              </el-form-item>
              <el-form-item class="setting-item" prop="cdcBeginDate">
                <label class="item-label is-required">校验开始时间</label>
                <el-date-picker
                  class="item-select"
                  size="mini"
                  v-model="form.cdcBeginDate"
                  type="datetime"
                  placeholder="校验开始时间"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item class="setting-item">
                <label class="item-label">校验结束时间</label>
                <el-date-picker
                  class="item-select"
                  size="mini"
                  v-model="form.cdcEndDate"
                  type="datetime"
                  placeholder="校验结束时间"
                  format="yyyy-MM-dd HH:mm"
                  value-format="yyyy-MM-dd HH:mm"
                >
                </el-date-picker>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div v-if="flowStages" v-loading="!flowStages.length">
          <div class="form-panel">
            <div class="panel-label">
              <span>{{ $t('dataVerification.verifyCondition') }}</span>
              <el-button style="height: 24px; line-height: 24px; padding: 0 10px" size="mini" @click="clear">
                {{ $t('dataVerification.clear') }}
              </el-button>
            </div>
            <ul class="panel-container" id="data-verification-form">
              <li class="condition-item" v-for="(item, index) in form.tasks" :key="index">
                <div class="condition-setting">
                  <div class="setting-item">
                    <label class="item-label is-required">{{ $t('dataVerification.table') }}</label>
                    <el-cascader
                      class="item-select"
                      :class="{ red: !item.sourceTable }"
                      size="mini"
                      v-model="item.sourceTable"
                      :options="item.sourceTree"
                      @input="tableChangeHandler(item, 'source', index)"
                    ></el-cascader>
                    <span class="item-icon">
                      <i class="el-icon-right"></i>
                    </span>
                    <el-cascader
                      class="item-select"
                      size="mini"
                      :class="{ red: !item.targetTable }"
                      v-model="item.targetTable"
                      :options="item.targetTree"
                      @input="tableChangeHandler(item, 'target')"
                    ></el-cascader>
                  </div>
                  <div class="setting-item" v-show="['field', 'jointField'].includes(form.inspectMethod)">
                    <label class="item-label is-required">{{ $t('dataVerification.indexField') }}</label>
                    <MultiSelection
                      v-model="item.source.sortColumn"
                      :options="item.source.fields"
                      :class="{ red: !item.source.sortColumn }"
                      :placeholder="$t('dataVerification.ChoosePKField')"
                      :id="'itemSource' + index"
                    ></MultiSelection>
                    <span class="item-icon"></span>
                    <MultiSelection
                      v-model="item.target.sortColumn"
                      :class="{ red: !item.target.sortColumn }"
                      :options="item.target.fields"
                      :placeholder="$t('dataVerification.ChoosePKField')"
                    ></MultiSelection>
                    <el-checkbox
                      style="margin-left: 10px"
                      v-model="item.showAdvancedVerification"
                      v-show="form.inspectMethod === 'field'"
                      >{{ $t('dataVerification.advanceVerify') }}</el-checkbox
                    >
                  </div>
                  <div class="setting-item" v-if="item.showAdvancedVerification">
                    <label class="item-label is-required">{{ $t('dataVerification.JSVerifyLogic') }}</label>
                    <el-button
                      v-if="!item.webScript || item.webScript === ''"
                      size="mini"
                      icon="el-icon-plus"
                      @click="addScript(index)"
                      >{{ $t('dataVerification.addJS') }}</el-button
                    >
                    <span v-if="item.webScript && item.webScript !== ''">
                      <el-input
                        class="item-select item-textarea"
                        type="textarea"
                        v-model="item.webScript"
                        disabled
                      ></el-input>
                      <el-button-group class="setting-buttons">
                        <el-button size="mini" icon="el-icon-edit" @click="editScript(index)"></el-button>
                      </el-button-group>
                      <el-button-group class="setting-buttons">
                        <el-button size="mini" icon="el-icon-close" @click="removeScript(index)"></el-button>
                      </el-button-group>
                    </span>
                  </div>
                </div>
                <el-button-group class="setting-buttons">
                  <el-button size="mini" icon="el-icon-close" @click="removeItem(index)"></el-button>
                </el-button-group>
              </li>
              <li style="color: #ccc" v-show="!form.tasks.length">
                {{ $t('dataVerification.clickVerified') }}
              </li>
            </ul>
          </div>
          <div style="margin-top: 10px">
            <el-button size="mini" icon="el-icon-plus" @click="addTable()">{{
              $t('dataVerification.addTable')
            }}</el-button>
            <el-button size="mini" icon="el-icon-plus" @click="autoAddTable()">{{
              $t('dataVerification.automaticallyAdd')
            }}</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <el-button size="mini" @click="goBack()">{{ $t('dataVerification.back') }}</el-button>
      <el-button type="primary" size="mini" @click="nextStep()">{{ $t('app.save') }}</el-button>
    </div>
    <el-dialog
      :title="$t('dataVerification.JSVerifyLogic')"
      :visible.sync="dialogAddScriptVisible"
      width="60%"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox px-6">
          <div>
            <span class="mr-2 text-secondary" style="font-size: 12px">JS引擎版本：</span>
            <ElSelect v-model="jsEngineName" style="width: 100px" size="mini">
              <ElOption label="新版" value="graal.js"></ElOption>
              <ElOption label="旧版" value="nashorn"></ElOption>
            </ElSelect>
          </div>
          <div class="py-2"><span style="color: #0000ff">function </span><span> validate(sourceRow){</span></div>
          <CodeEditor class="js-editor" v-model="webScript"></CodeEditor>
          <div class="py-2">}</div>
        </div>
        <div class="markdown-body-wrap example">
          <div class="markdown-body" v-html="htmlMD"></div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleAddScriptClose" size="mini">{{ $t('dataForm.cancel') }}</el-button>
        <el-button type="primary" @click="submitScript" size="mini">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
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
import MultiSelection from './multi-selection.vue'
import CodeEditor from 'web-core/components/CodeEditor'
//import JsEditor from 'web-core/components/js-editor.vue'
export default {
  components: { MultiSelection, CodeEditor },
  props: {
    remoteFunc: Function,
    optionsFunc: Function,
    dataflowFunc: Function,
    metaDataFunc: Function,
    submitFunc: Function
  },
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
      htmlMD: '',
      removeVisible: false,
      isDbClone: false,
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
            validator: requiredValidator(this.$t('dataVerification.tasksDataFlow'))
          }
        ],
        name: [
          {
            validator: requiredValidator(this.$t('dataVerification.tasksJobName'))
          }
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('dataVerification.tasksTime'), checkMode)
          }
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('dataVerification.tasksVerifyInterval'), checkMode)
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
      allStages: null
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
      this.optionsFunc({
        filter: JSON.stringify({
          where: where,
          fields: {
            id: true,
            name: true
          },
          order: 'createTime DESC'
        })
      })
        .then(data => {
          this.flowOptions = data || []
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
      this.remoteFunc({
        filter: JSON.stringify({
          where: {
            id: id
          }
        })
      }).then(data => {
        if (data) {
          data.tasks = data.tasks.map(t => {
            t.sourceTable = [t.source.connectionId, t.source.table]
            t.targetTable = [t.target.connectionId, t.target.table]
            t.source = Object.assign({}, TABLE_PARAMS, t.source)
            t.target = Object.assign({}, TABLE_PARAMS, t.target)
            t.sourceTree = []
            t.targetTree = []
            return t
          })
          this.form = data
          this.getFlowStages()
        }
      })
    },
    getFlowStages() {
      this.loading = true
      this.dataflowFunc({
        filter: JSON.stringify({
          where: {
            id: this.form.flowId
          },
          fields: {
            id: true,
            name: true,
            stages: true,
            mappingTemplate: true
          }
        })
      })
        .then(data => {
          let flowData = data
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
        if (!isDB) {
          tableNames.push(stg.tableName)
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
        if (!isDB) {
          where.original_name = {
            inq: Array.from(new Set(tableNames))
          }
        }
        this.metaDataFunc({
          filter: JSON.stringify({
            where,
            fields: META_INSTANCE_FIELDS
          })
        })
          .then(data => {
            let tables = data || []
            if (isDB) {
              this.stageMap = {}
              flowStages.forEach(stage => {
                if (stage.outputLanes.length) {
                  let targetDBStage = flowStages.find(stg => stg.id === stage.outputLanes[0])
                  this.getTreeForDBFlow('source', tables, stage, targetDBStage)
                }
                if (stage.inputLanes.length) {
                  this.getTreeForDBFlow('target', tables, stage)
                }
              })
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
    getTreeForDBFlow(type, tables, stage, targetStage) {
      let includeTableNames = []
      let getTableNames = (objects, prefix = '', suffix = '') => {
        let obj = objects.find(obj => obj.type === 'table')
        if (obj) {
          includeTableNames = obj.objectNames.map(tName => {
            return prefix + tName + suffix
          })
        }
      }
      if (type === 'source' && targetStage.syncObjects) {
        getTableNames(targetStage.syncObjects)
      }
      if (type === 'target' && stage.syncObjects) {
        getTableNames(stage.syncObjects, stage.table_prefix, stage.table_suffix)
      }
      let includeTables = tables.filter(tb => {
        let flag = true
        if (includeTableNames.length) {
          flag = includeTableNames.includes(tb.original_name)
        }
        return tb.source.id === stage.connectionId && flag
      })
      if (!includeTables.length) {
        return this.$message.error("Can't found the " + type + 'node: ' + stage.tableName)
      }
      let parent = {
        label: includeTables[0].source.name,
        value: stage.connectionId,
        children: []
      }
      let index = this[type + 'Tree'].findIndex(it => it.value === stage.connectionId)
      if (index >= 0) {
        parent = this[type + 'Tree'].splice(index, 1)[0]
      }
      includeTables.forEach(table => {
        if (!parent.children.find(child => child.value === table.original_name)) {
          parent.children.push({
            label: table.original_name,
            value: table.original_name
          })
          let outputLanes = targetStage
            ? [targetStage.connectionId + targetStage.table_prefix + table.original_name + targetStage.table_suffix]
            : null
          let key = stage.connectionId + table.original_name
          if (targetStage) {
            this.stageMap[key] = outputLanes
          }
          this.flowStages.push({
            id: key,
            connectionId: table.source.id,
            connectionName: table.source.name,
            fields: table.fields,
            tableName: table.original_name,
            outputLanes
          })
        }
      })
      this[type + 'Tree'].push(parent)
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
        table: stage.tableName,
        sortColumn,
        fields: sortField(stage.fields)
      }
    },
    addTable() {
      this.form.tasks.push({
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
      this.$confirm(this.$t('message.verifyConfirm'), this.$t('message.delete'), {
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
      this.$confirm(this.$t('dataVerification.backConfirmMessage'), this.$t('dataVerification.backConfirmTitle'), {
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
            return this.$message.error(this.$t('dataVerification.tasksVerifyCondition'))
          }
          if (
            tasks.some((c, i) => {
              index = i + 1
              return !c.source.table || !c.target.table
            })
          ) {
            document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
            return this.$message.error(this.$t('dataVerification.lackSource'))
          }
          index = 0
          if (
            ['field', 'jointField'].includes(this.form.inspectMethod) &&
            tasks.some((c, i) => {
              index = i + 1
              return !c.source.sortColumn || !c.target.sortColumn
            })
          ) {
            document.getElementById('data-verification-form').childNodes[index - 1].querySelector('input').focus()
            return this.$message.error(this.$t('dataVerification.lackIndex'))
          }
          index = 0
          if (
            ['field', 'jointField'].includes(this.form.inspectMethod) &&
            tasks.some((c, i) => {
              index = i + 1
              return c.source.sortColumn.split(',').length !== c.target.sortColumn.split(',').length
            })
          ) {
            let item = document.getElementById('itemSource' + (index - 1))
            item.querySelector('input').focus()
            return this.$message.error(this.$t('dataVerification.tasksAmount'))
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
          this.submitFunc(
            this.form.id,
            Object.assign({}, this.form, {
              fullMatchKeep: this.form.keep,
              status: this.form.mode === 'manual' ? 'scheduling' : 'waiting',
              ping_time: 0,
              tasks: this.form.tasks.map(
                ({ source, target, fullMatch, showAdvancedVerification, script, webScript, jsEngineName }) => {
                  if (webScript && webScript !== '') {
                    script = 'function validate(sourceRow){' + webScript + '}'
                  }
                  return {
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
              byFirstCheckId: ''
            })
          )
            .then(data => {
              if (data) {
                this.$router.back()
              }
            })
            .catch(err => {
              let message = err?.response?.msg || err?.data?.msg || ''
              if (message === 'duplication for names') {
                this.$message.error(this.$t('message.exists_name'))
              }
            })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.el-select-dropdown__item {
  max-width: 600px;
}
.data-verification-form {
  .red .el-input__inner {
    border: none;
    border: 1px solid #ee5353;
    border-radius: 4px;
  }
  position: relative;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: 68px;
  .el-form-item__label,
  .el-form-item__content,
  .el-radio__label {
    font-size: 12px;
  }
  .el-radio {
    line-height: 16px;
  }
  .form-container {
    height: 100%;
    overflow: auto;
    .form-body {
      display: inline-block;
      margin: 0 auto;
      padding: 15px 30px;
      box-sizing: border-box;
    }
  }
  .title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    line-height: 28px;
    font-size: 16px;
    font-weight: 400;
    color: #343434;
    margin-bottom: 10px;
  }
  .form-panel {
    background: #fafafa;
    font-size: 12px;
    border: 1px solid #dedee4;
    color: #666;
    margin-bottom: 10px;
    .panel-label {
      padding: 2px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dedee4;
    }
    .panel-container {
      padding: 10px;
      .condition-item {
        display: flex;
        margin-bottom: 10px;
      }
      .condition-setting {
        flex: 1;
        background: #fff;
        padding: 5px 10px;
        border: 1px solid #dedee4;
      }
      .setting-item {
        display: flex;
        align-items: center;
        padding: 5px 0;
        margin-bottom: 0;
        .el-form-item__content {
          display: flex;
          align-items: center;
          line-height: 1;
        }
        .is-required::before {
          content: '*';
          color: #f56c6c;
          margin-right: 3px;
        }
        .item-label {
          padding: 0 10px;
          width: 120px;
          text-align: right;
        }
        .item-textarea {
          font-size: 12px;
          font-family: element-icons;
          line-height: 16px;
          color: #aaa;
        }
        .item-icon {
          width: 20px;
          text-align: center;
        }
        .item-time-picker,
        .item-input,
        .item-select {
          width: 600px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .setting-buttons {
        margin-left: 10px;
        .el-button {
          padding: 7px;
        }
      }
    }
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 20px;
    border-top: 1px solid #f2f2f2;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    overflow: hidden;
  }
}
</style>
<style lang="scss">
.js-wrap {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  .jsBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    .js-fixContent {
      margin-left: 60px;
    }
  }
  .example {
    width: calc(100% - 70%);
    height: 478px;
    overflow-y: auto;
    padding-right: 10px;
  }
}
</style>
