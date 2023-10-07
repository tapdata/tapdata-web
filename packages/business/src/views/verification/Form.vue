<template>
  <section class="verify-form-wrap section-wrap flex-fill bg-white" v-loading="loading">
    <div class="section-wrap-box position-relative p-6">
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
          <!--          <ElFormItem-->
          <!--            required-->
          <!--            class="form-item"-->
          <!--            :label="$t('packages_business_verification_form_jiaoyanrenwumo') + ': '"-->
          <!--          >-->
          <!--            <ElRadioGroup v-model="form.taskMode" @change="handleChangeTaskMode">-->
          <!--              <ElRadio label="pipeline">{{ $t('packages_business_verification_form_weitedingdeP') }}</ElRadio>-->
          <!--              <ElRadio label="random">{{ $t('packages_business_verification_form_zhidingrenyibiao') }}</ElRadio>-->
          <!--            </ElRadioGroup>-->
          <!--          </ElFormItem>-->
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
              <ElOption v-for="opt in flowOptions" :key="opt.id" :label="opt.name" :value="opt.id"> </ElOption>
            </ElSelect>
          </ElFormItem>

          <ElFormItem
            required
            class="form-item"
            prop="name"
            :label="$t('packages_business_verification_task_name') + ': '"
          >
            <ElInput class="form-input" v-model="form.name"></ElInput>
          </ElFormItem>

          <ElFormItem required class="form-item" :label="$t('packages_business_verification_type') + ': '">
            <ElRadioGroup v-model="form.inspectMethod" @change="handleChangeInspectMethod">
              <ElRadioButton label="row_count">{{ inspectMethodMap['row_count'] }}</ElRadioButton>
              <ElRadioButton label="field">{{ inspectMethodMap['field'] }}</ElRadioButton>
              <ElRadioButton label="jointField">{{ inspectMethodMap['jointField'] }}</ElRadioButton>
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
                  row_count:
                    $t('packages_business_verification_fastCountTip') +
                    this.$t('packages_dag_components_node_zanbuzhichi') +
                    notSupport['row_count'].join(),
                  field:
                    $t('packages_business_verification_contentVerifyTip') +
                    this.$t('packages_dag_components_node_zanbuzhichi') +
                    notSupport['field'].join(),
                  jointField:
                    $t('packages_business_verification_jointFieldTip') +
                    this.$t('packages_dag_components_node_zanbuzhichi') +
                    notSupport['jointField'].join()
                }[form.inspectMethod]
              }}</span>
            </div>
          </ElFormItem>

          <ElCollapse class="collapse-fill db-list-container" accordion>
            <ElCollapseItem name="1">
              <template #title>
                <span>{{ $t('packages_business_verification_form_gaojipeizhi') }}</span>
                <span
                  v-if="form.taskMode === 'pipeline' && (autoAddTableLoading || loading)"
                  class="ml-3 font-color-sslight"
                  >{{ $t('packages_business_verification_form_zhengzaijiyuren') }}</span
                >
                <VIcon
                  v-if="form.taskMode === 'pipeline' && (autoAddTableLoading || loading)"
                  class="ml-2 animation-rotate"
                  size="14"
                  color="rgb(61, 156, 64)"
                  >loading-circle</VIcon
                >
              </template>
              <ElFormItem
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

              <ElFormItem class="form-item" :label="$t('packages_business_verification_form_task_alarm') + ': '">
                <div class="inline-block">
                  <div>
                    <ElCheckbox v-model="form.alarmSettings[0].open" @change="handleChangeAlarm(arguments[0], 0)">{{
                      $t('packages_business_verification_form_task_alarm_when_error')
                    }}</ElCheckbox>
                  </div>
                  <div>
                    <ElCheckbox
                      v-show="form.inspectMethod === 'row_count'"
                      v-model="form.alarmSettings[1].open"
                      @change="handleChangeAlarm(arguments[0], 1)"
                      >{{ $t('packages_business_verification_form_task_alarm_when_diff_result_over_count1') }}
                      <ElInputNumber
                        v-model="form.alarmSettings[1].params.maxDifferentialRows"
                        controls-position="right"
                        :min="0"
                        style="width: 100px"
                        @click.native.prevent.stop
                        @blur="
                          () => {
                            form.alarmSettings[1].params.maxDifferentialRows =
                              form.alarmSettings[1].params.maxDifferentialRows || 0
                          }
                        "
                      ></ElInputNumber>
                      {{
                        $t('packages_business_verification_form_task_alarm_when_diff_result_over_count2')
                      }}</ElCheckbox
                    >
                    <ElCheckbox
                      v-show="['field', 'jointField'].includes(form.inspectMethod)"
                      v-model="form.alarmSettings[2].open"
                      @change="handleChangeAlarm(arguments[0], 2)"
                      >{{ $t('packages_business_verification_form_task_alarm_when_result_table_over_count1') }}
                      <ElInputNumber
                        v-model="form.alarmSettings[2].params.maxDifferentialValues"
                        controls-position="right"
                        :min="0"
                        style="width: 100px"
                        @click.native.prevent.stop
                        @blur="
                          () => {
                            form.alarmSettings[2].params.maxDifferentialValues =
                              form.alarmSettings[2].params.maxDifferentialValues || 0
                          }
                        "
                      ></ElInputNumber>
                      {{
                        $t('packages_business_verification_form_task_alarm_when_diff_result_over_count2')
                      }}</ElCheckbox
                    >
                  </div>
                </div>
                <div class="inline-block ml-8">
                  <ElCheckboxGroup v-model="form.alarmSettings[0].notify" @change="handleChangeAlarmItem">
                    <ElCheckbox label="SYSTEM">{{
                      $t('packages_business_verification_form_xitongtongzhi')
                    }}</ElCheckbox>
                    <ElCheckbox label="EMAIL">{{
                      $t('packages_business_verification_form_youjiantongzhi')
                    }}</ElCheckbox>
                  </ElCheckboxGroup>
                  <ElCheckboxGroup
                    v-show="form.inspectMethod === 'row_count'"
                    v-model="form.alarmSettings[1].notify"
                    @change="handleChangeAlarmItem"
                  >
                    <ElCheckbox label="SYSTEM">{{
                      $t('packages_business_verification_form_xitongtongzhi')
                    }}</ElCheckbox>
                    <ElCheckbox label="EMAIL">{{
                      $t('packages_business_verification_form_youjiantongzhi')
                    }}</ElCheckbox>
                  </ElCheckboxGroup>
                  <ElCheckboxGroup
                    v-show="['field', 'jointField'].includes(form.inspectMethod)"
                    v-model="form.alarmSettings[2].notify"
                    @change="handleChangeAlarmItem"
                  >
                    <ElCheckbox label="SYSTEM">{{
                      $t('packages_business_verification_form_xitongtongzhi')
                    }}</ElCheckbox>
                    <ElCheckbox label="EMAIL">{{
                      $t('packages_business_verification_form_youjiantongzhi')
                    }}</ElCheckbox>
                  </ElCheckboxGroup>
                </div>
              </ElFormItem>

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

              <ConditionBox
                v-if="form.taskMode === 'pipeline'"
                ref="conditionBox"
                :task-id="form.flowId"
                :inspectMethod="form.inspectMethod"
                :data="form.tasks"
                :edges="edges"
                :allStages="allStages"
                :isDB="isDbClone"
                :jointErrorMessage.sync="jointErrorMessage"
                :errorMessageLevel.sync="errorMessageLevel"
                :autoAddTableLoading.sync="autoAddTableLoading"
              ></ConditionBox>
            </ElCollapseItem>
          </ElCollapse>
          <ConditionBox
            v-if="form.taskMode !== 'pipeline'"
            ref="conditionBox"
            :task-id="form.flowId"
            :inspectMethod="form.inspectMethod"
            :data="form.tasks"
            :edges="edges"
            :allStages="allStages"
            :isDB="isDbClone"
            :jointErrorMessage.sync="jointErrorMessage"
            :errorMessageLevel.sync="errorMessageLevel"
            :autoAddTableLoading.sync="autoAddTableLoading"
            class="mt-6"
          ></ConditionBox>
        </ElForm>
      </div>
      <div v-if="!!errorMessageLevel" class="color-danger mt-2" v-html="jointErrorMessage"></div>
      <div class="mt-4">
        <ElButton size="mini" @click="goBack()">{{ $t('public_button_back') }}</ElButton>
        <!--        <ElButton type="primary" size="mini" @click="save()">{{-->
        <!--          $t('public_button_save') + ' & ' + $t('public_button_execute')-->
        <!--        }}</ElButton>-->
        <ElButton type="primary" size="mini" :disabled="saveDisabled" @click="save(true)">{{
          $t('public_button_save')
        }}</ElButton>
      </div>
    </div>
  </section>
</template>

<script>
import { cloneDeep } from 'lodash'

import i18n from '@tap/i18n'
import { taskApi, inspectApi } from '@tap/api'
import Time from '@tap/shared/src/time'

import ConditionBox from './components/ConditionBox'
import { TABLE_PARAMS } from './components/const'

const FILTER_DATABASE_TYPES = ['Doris']

export default {
  components: { ConditionBox },
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
        inconsistentNotifys: ['SYSTEM', 'EMAIL'],
        alarmSettings: [
          {
            type: 'INSPECT',
            key: 'INSPECT_TASK_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_COUNT_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialRows: 0
            }
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_VALUE_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialValues: 0
            }
          }
        ]
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
      edges: [],
      allStages: [],
      flowOptions: null,
      notSupport: {
        row_count: ['Clickhouse', 'Kafka'],
        field: ['Kafka'],
        jointField: ['Kafka']
      },
      inspectMethodMap: {
        row_count: i18n.t('packages_business_verification_row_verify'),
        field: i18n.t('packages_business_verification_content_verify'),
        jointField: i18n.t('packages_business_verification_joint_verify')
      },
      jointErrorMessage: '',
      errorMessageLevel: '',
      autoAddTableLoading: false
    }
  },
  computed: {
    saveDisabled() {
      return this.errorMessageLevel === 'error' || this.autoAddTableLoading || this.loading
    }
  },
  created() {
    // 设置form.taskMode
    let taskMode = this.$route.query.taskMode
    if (taskMode) {
      this.form.taskMode = taskMode
    }

    this.getFlowOptions()
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
              name: true,
              status: true
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
          } else {
            this.loading = false
          }
        })
        .catch(() => {
          this.loading = false
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
        .then(async (data = {}) => {
          if (data) {
            // 加载数据源的Capabilities
            const capabilitiesMap = await this.$refs.conditionBox.getCapabilities([
              ...data.tasks.map(t => t.source.connectionId),
              ...data.tasks.map(t => t.target.connectionId)
            ])
            data.tasks = data.tasks.map(t => {
              t.source = Object.assign({}, TABLE_PARAMS, t.source)
              t.target = Object.assign({}, TABLE_PARAMS, t.target)
              t.source.capabilities = capabilitiesMap[t.source.connectionId]
              t.target.capabilities = capabilitiesMap[t.target.connectionId]
              if (t.source.nodeId) {
                t.source.currentLabel = `${t.source.nodeName} / ${t.source.connectionName}`
                t.target.currentLabel = `${t.target.nodeName} / ${t.target.connectionName}`
              }
              t.id = t.taskId
              return t
            })

            if (!data.timing) {
              data.timing = this.form.timing
            }
            data.taskMode = data.flowId ? 'pipeline' : 'random'
            // 历史数据，默认不打开；新数据默认打开
            const { alarmSettings = [] } = data
            data.alarmSettings = this.form.alarmSettings.map(t => {
              const f = alarmSettings.find(item => item.key === t.key)
              if (f) return Object.assign(t, f)
              t.notify = []
              t.open = false
              return t
            })

            this.form = Object.assign({}, this.form, data)
            this.getFlowStages()
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    getFlowStages(cb) {
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

          this.edges = edges
          this.allStages = stages
          if (cb) {
            setTimeout(() => {
              cb()
              this.loading = false
            }, 800)
          } else {
            this.loading = false
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    //dataflow改变时
    flowChangeHandler() {
      this.form.tasks = []
      this.setVerifyName()
      this.getFlowStages(this.$refs.conditionBox.autoAddTable)
    },
    timingChangeHandler(times) {
      this.form.timing.start = times?.[0] || ''
      this.form.timing.end = times?.[1] || ''
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
    save(saveOnly = false) {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let tasks = this.$refs.conditionBox.getList()
          // 自动过滤出完整数据，以及索引字段数量不相等的情况
          tasks = tasks.filter(t => {
            if (this.form.inspectMethod === 'row_count') {
              return t.source.table && t.target.table
            }
            return (
              t.source.sortColumn && t.source.sortColumn.split(',').length === t.target.sortColumn.split(',').length
            )
          })

          // 检查校验类型是否支持
          const notSupportList = this.notSupport[this.form.inspectMethod]
          let notSupportStr = ''
          tasks.forEach(t => {
            if (notSupportList.includes(t.source.databaseType)) {
              notSupportStr = t.source.databaseType
            }
            if (notSupportList.includes(t.target.databaseType)) {
              notSupportStr = t.target.databaseType
            }
          })

          if (notSupportStr)
            return this.$message.error(
              this.inspectMethodMap[this.form.inspectMethod] +
                ', ' +
                this.$t('packages_dag_components_node_zanbuzhichi') +
                notSupportStr
            )

          if (!tasks.length) {
            return this.$message.error(this.$t('packages_business_verification_tasksVerifyCondition'))
          }
          const validateMsg = await this.$refs.conditionBox.validate()
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

          const alarmSettingsKeys =
            this.form.inspectMethod === 'row_count'
              ? ['INSPECT_TASK_ERROR', 'INSPECT_COUNT_ERROR']
              : ['INSPECT_TASK_ERROR', 'INSPECT_VALUE_ERROR']
          const alarmSettings = this.form.alarmSettings.filter(t => alarmSettingsKeys.includes(t.key))

          inspectApi[this.form.id ? 'patch' : 'post'](
            Object.assign({}, this.form, {
              fullMatchKeep: this.form.keep,
              status: saveOnly ? 'waiting' : 'scheduling',
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
              browserTimezoneOffset: new Date().getTimezoneOffset(),
              alarmSettings
            })
          ).then(() => {
            // this.$router.back()
            this.$message.success(this.$t('public_message_save_ok'))
            this.$router.push({
              name: 'dataVerificationList'
            })
          })
          // .catch(err => {
          //   this.$message.error(message)
          // })
        }
      })
    },

    handleChangeTaskMode(val) {
      if (val !== 'pipeline') {
        this.form.flowId = ''
      }
    },

    handleChangeAlarmItem() {
      this.form.alarmSettings[0].open = !!this.form.alarmSettings[0].notify.length
      this.form.alarmSettings[1].open = !!this.form.alarmSettings[1].notify.length
      this.form.alarmSettings[2].open = !!this.form.alarmSettings[2].notify.length
    },

    handleChangeAlarm(val, index = 0) {
      this.form.alarmSettings[index].notify = val ? ['SYSTEM', 'EMAIL'] : []
    },

    handleChangeInspectMethod() {
      this.setVerifyName()
      this.handleChangeAlarm(true, 0)
      this.handleChangeAlarm(true, 1)
      this.handleChangeAlarm(true, 2)
      this.handleChangeAlarmItem()
      this.$refs.conditionBox.validate()
    },
    setVerifyName() {
      // 任务模式
      if (this.form.taskMode === 'pipeline') {
        let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {}
        this.form.name = (flow.name || '') + ' - ' + this.inspectMethodMap[this.form.inspectMethod]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-form-wrap {
  height: 100%;
  //padding: 0 24px 24px 24px;
  overflow: hidden;
  .section-wrap-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    height: 100%;
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
