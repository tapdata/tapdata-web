<template>
  <section class="verify-form-wrap section-wrap flex-fill" v-loading="loading">
    <div class="section-wrap-box position-relative">
      <div class="verify-form-title">
        {{
          $route.params.id ? $t('packages_business_verification_edit') : $t('packages_business_verification_newVerify')
        }}
      </div>
      <div>
        <ElForm
          class="grey"
          ref="baseForm"
          label-position="left"
          label-width="160px"
          :model="form"
          :rules="rules"
          :validate-on-rule-change="false"
        >
          <ElFormItem
            required
            class="form-item"
            prop="name"
            :label="$t('packages_business_verification_task_name') + ': '"
          >
            <ElInput class="form-input" v-model="form.name"></ElInput>
          </ElFormItem>
          <ElFormItem
            required
            class="form-item"
            :label="$t('packages_business_verification_form_jiaoyanrenwumo') + ': '"
          >
            <ElRadioGroup v-model="form.taskMode" @change="handleChangeTaskMode">
              <ElRadio label="pipeline">{{ $t('packages_business_verification_form_weitedingdeP') }}</ElRadio>
              <ElRadio label="random">{{ $t('packages_business_verification_form_zhidingrenyibiao') }}</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem
            v-if="form.taskMode === 'pipeline'"
            required
            class="form-item"
            prop="flowId"
            :label="$t('packages_business_verification_chooseJob') + ': '"
          >
            <ElSelect
              filterable
              class="form-select"
              v-model="form.flowId"
              :loading="!flowOptions"
              clearable
              @input="flowChangeHandler"
            >
              <ElOption v-for="opt in flowOptions" :key="opt.id" :label="opt.name" :value="opt.id"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            required
            class="form-item"
            prop="inspectDifferenceMode"
            :label="$t('packages_business_verification_form_jieguoshuchu') + ': '"
          >
            <ElSelect filterable class="form-select" v-model="form.inspectDifferenceMode">
              <ElOption :label="$t('packages_business_verification_form_shuchusuoyoubu')" value="All"></ElOption>
              <ElOption
                :label="$t('packages_business_verification_form_zhishuchulaiyuan')"
                value="OnSourceExists"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
          <!--<ElFormItem
            required
            class="form-item"
            :label="$t('packages_business_verification_form_jiaoyangaojing') + ': '"
          >
            <div class="flex align-items-center">
              <span>{{ $t('packages_business_verification_form_jianyanrenwuyun') }}</span>
              <ElCheckboxGroup v-model="form.errorNotifys" class="inline-block ml-4">
                <ElCheckbox label="SYSTEM">{{ $t('packages_business_verification_form_xitongtongzhi') }}</ElCheckbox>
                <ElCheckbox label="EMAIL">{{ $t('packages_business_verification_form_youjiantongzhi') }}</ElCheckbox>
              </ElCheckboxGroup>
            </div>
            <div class="flex align-items-center">
              <span>{{ $t('packages_business_verification_form_jiaoyanjieguobu') }}</span>
              <ElCheckboxGroup v-model="form.inconsistentNotifys" class="inline-block ml-4">
                <ElCheckbox label="SYSTEM">{{ $t('packages_business_verification_form_xitongtongzhi') }}</ElCheckbox>
                <ElCheckbox label="EMAIL">{{ $t('packages_business_verification_form_youjiantongzhi') }}</ElCheckbox>
              </ElCheckboxGroup>
            </div>
          </ElFormItem>-->
          <ElFormItem required class="form-item" :label="$t('packages_business_verification_type') + ': '">
            <ElRadioGroup v-model="form.inspectMethod">
              <ElRadioButton label="row_count">{{ $t('packages_business_verification_row_verify') }}</ElRadioButton>
              <ElRadioButton label="field">{{ $t('packages_business_verification_content_verify') }}</ElRadioButton>
              <ElRadioButton label="jointField">{{ $t('packages_business_verification_joint_verify') }}</ElRadioButton>
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
                  row_count: $t('packages_business_verification_fastCountTip'),
                  field: $t('packages_business_verification_contentVerifyTip'),
                  jointField: $t('packages_business_verification_jointFieldTip')
                }[form.inspectMethod]
              }}</span>
            </div>
          </ElFormItem>
          <ElFormItem class="form-item" :label="$t('packages_business_verification_frequency') + ': '">
            <ElSelect class="form-select" v-model="form.mode" @input="form.enabled = true">
              <ElOption :label="$t('packages_business_verification_single')" value="manual"></ElOption>
              <ElOption :label="$t('packages_business_verification_repeating')" value="cron"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            v-if="form.mode === 'cron'"
            class="form-item"
            :label="$t('packages_business_verification_is_enabled') + ': '"
          >
            <ElSwitch v-model="form.enabled"></ElSwitch>
          </ElFormItem>
          <template v-if="form.mode === 'cron'">
            <ElFormItem
              class="form-item"
              prop="timing.start"
              :label="$t('packages_business_verification_startAndStopTime') + ': '"
            >
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
            <ElFormItem
              class="form-item"
              prop="timing.intervals"
              :label="$t('packages_business_verification_verifyInterval') + ': '"
            >
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
          <ElFormItem
            class="form-item"
            :label="$t('packages_business_verification_form_label_error_save_count') + ': '"
          >
            <ElSelect class="form-select" v-model="form.limit.keep">
              <ElOption :value="100" label="100(rows)"></ElOption>
              <ElOption :value="1000" label="1000(rows)"></ElOption>
              <ElOption :value="10000" label="10000(rows)"></ElOption>
            </ElSelect>
          </ElFormItem>
          <template v-if="form.inspectMethod === 'cdcCount'">
            <ElFormItem class="setting-item">
              <label class="item-label">{{ $t('packages_business_verification_create_window_duration') }}</label>
              <ElInput
                class="item-input"
                size="mini"
                v-model="form.cdcDuration"
                onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
              >
                <template slot="append"> {{ $t('public_time_m') }} </template>
              </ElInput>
            </ElFormItem>
            <ElFormItem class="setting-item" prop="cdcBeginDate">
              <label class="item-label is-required">{{
                $t('packages_business_verification_form_jiaoyankaishishi')
              }}</label>
              <ElDatePicker
                class="item-select"
                size="mini"
                v-model="form.cdcBeginDate"
                type="datetime"
                :placeholder="$t('packages_business_verification_form_jiaoyankaishishi')"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm"
              >
              </ElDatePicker>
            </ElFormItem>
            <ElFormItem class="setting-item" v-if="form.mode === 'manual'">
              <label class="item-label">{{ $t('packages_business_verification_form_jiaoyanjieshushi') }}</label>
              <ElDatePicker
                class="item-select"
                size="mini"
                v-model="form.cdcEndDate"
                type="datetime"
                :placeholder="$t('packages_business_verification_form_jiaoyanjieshushi')"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm"
              >
              </ElDatePicker>
            </ElFormItem>
          </template>
        </ElForm>
        <ConditionBox
          ref="conditionBox"
          :task-id="form.flowId"
          :inspectMethod="form.inspectMethod"
          :data="form.tasks"
          :allStages="allStages"
          :isDB="isDbClone"
          @addScript="addScript"
        ></ConditionBox>
      </div>
      <div class="mt-8">
        <ElButton size="mini" @click="goBack()">{{ $t('public_button_back') }}</ElButton>
        <ElButton type="primary" size="mini" @click="save">{{ $t('public_button_save') }}</ElButton>
      </div>
    </div>

    <ElDialog
      width="60%"
      :title="$t('packages_business_verification_JSVerifyLogic')"
      :visible.sync="dialogAddScriptVisible"
      :before-close="handleAddScriptClose"
    >
      <div class="js-wrap">
        <div class="jsBox">
          <div class="js-fixText"><span style="color: #0000ff">function </span><span> validate(sourceRow){</span></div>
          <VCodeEditor v-model="webScript" height="500" class="js-editor"></VCodeEditor>
          <div class="js-fixText">}</div>
        </div>
        <GitBook :value="doc" class="example ml-4 color-primary"></GitBook>
      </div>
      <span slot="footer" class="dialog-footer">
        <ElButton size="mini" @click="handleAddScriptClose">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton type="primary" size="mini" @click="submitScript">{{ $t('public_button_confirm') }}</ElButton>
      </span>
    </ElDialog>
  </section>
</template>

<script>
import i18n from '@tap/i18n'

import { cloneDeep } from 'lodash'

import { GitBook, VCodeEditor } from '@tap/component'

import { taskApi, inspectApi } from '@tap/api'
import Time from '@tap/shared/src/time'

import ConditionBox from './components/ConditionBox'
import { TABLE_PARAMS } from './components/const'

const FILTER_DATABASE_TYPES = ['Doris']

export default {
  components: { VCodeEditor, GitBook, ConditionBox },
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
      doc: '',
      isDbClone: false,
      form: {
        flowId: '',
        name: '',
        mode: 'manual',
        inspectDifferenceMode: 'All',
        inspectMethod: 'row_count',
        cdcBeginDate: '',
        cdcEndDate: '',
        cdcDuration: '',
        timing: {
          intervals: 24 * 60,
          intervalsUnit: 'minute',
          start: Time.now(),
          end: Time.now() + 24 * 60 * 60 * 1000
        },
        limit: {
          keep: 100
        },
        enabled: true,
        tasks: [],
        taskMode: 'pipeline',
        errorNotifys: ['SYSTEM', 'EMAIL'],
        inconsistentNotifys: ['SYSTEM', 'EMAIL']
      },
      rules: {
        flowId: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksDataFlow'))
          }
        ],
        name: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksJobName'))
          }
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksTime'), checkMode)
          }
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksVerifyInterval'), checkMode)
          }
        ],
        cdcBeginDate: [
          {
            validator: requiredValidator(i18n.t('packages_business_verification_form_qingshurukaishi'), () => {
              return self.form.inspectMethod === 'cdcCount'
            })
          }
        ]
      },
      allStages: [],
      flowOptions: null,
      dialogAddScriptVisible: false,
      formIndex: '',
      webScript: '',
      jsEngineName: 'graal.js',
      jointErrorMessage: ''
    }
  },
  created() {
    this.getFlowOptions()
    this.loadDoc()
  },
  methods: {
    //获取dataflow数据
    getFlowOptions() {
      this.loading = true
      let id = this.$route.params.id
      let where = {
        status: {
          inq: ['running', 'stop', 'complete']
        }
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
              t.source = Object.assign({}, TABLE_PARAMS, t.source)
              t.target = Object.assign({}, TABLE_PARAMS, t.target)
              t.id = t.taskId
              return t
            })
            if (!data.timing) {
              data.timing = this.form.timing
            }
            data.taskMode = data.flowId ? 'pipeline' : 'random'
            this.form = Object.assign({}, this.form, data)
            this.getFlowStages()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getFlowStages() {
      this.loading = true
      taskApi
        .getId(this.form.flowId)
        .then(data => {
          this.isDbClone = data.syncType === 'migrate'
          let edges = data.dag?.edges || []
          let nodes = data.dag?.nodes || []
          const findOne = this.flowOptions.find(t => t.id === data.id)
          if (!findOne) {
            this.flowOptions.unshift({
              id: data.id,
              name: data.name
            })
          }
          if (!edges.length) {
            return { items: [], total: 0 }
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
          this.allStages = stages
        })
        .finally(() => {
          this.loading = false
        })
    },
    //dataflow改变时
    flowChangeHandler() {
      this.form.tasks = []
      let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {}
      this.form.name = this.form.name || flow.name || ''
      this.getFlowStages()
    },
    timingChangeHandler(times) {
      this.form.timing.start = times?.[0] || ''
      this.form.timing.end = times?.[1] || ''
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
      this.$confirm(
        this.$t('packages_business_verification_backConfirmMessage'),
        this.$t('packages_business_verification_backConfirmTitle'),
        {
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$router.back()
      })
    },
    save() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let tasks = this.$refs.conditionBox.getList()
          // Doris数据源只支持count
          if (this.form.inspectMethod !== 'row_count') {
            const flag = tasks.some(
              t =>
                FILTER_DATABASE_TYPES.includes(t.source.databaseType) ||
                FILTER_DATABASE_TYPES.includes(t.target.databaseType)
            )

            const msg = {
              field: this.$t('packages_business_verification_contentVerifyTip'),
              jointField: this.$t('packages_business_verification_jointFieldTip')
            }
            if (flag) return this.$message.error(msg[this.form.inspectMethod])
          }
          if (!tasks.length) {
            return this.$message.error(this.$t('packages_business_verification_tasksVerifyCondition'))
          }
          const validateMsg = this.$refs.conditionBox.validate()
          if (validateMsg) {
            return this.$message.error(validateMsg)
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
              tasks: tasks.map(
                ({ taskId, source, target, fullMatch, showAdvancedVerification, script, webScript, jsEngineName }) => {
                  if (webScript && webScript !== '') {
                    script = 'function validate(sourceRow){' + webScript + '}'
                  }
                  let newSource = cloneDeep(source)
                  let newTarget = cloneDeep(target)
                  newSource.fields = []
                  newTarget.fields = []
                  return {
                    taskId,
                    source: newSource,
                    target: newTarget,
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
    },

    handleChangeTaskMode(val) {
      if (val !== 'pipeline') {
        this.form.flowId = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-form-wrap {
  height: 100%;
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
::v-deep {
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
}

.el-form {
  ::v-deep {
    .el-form-item__error {
      margin-top: 8px;
    }
  }
}
</style>
