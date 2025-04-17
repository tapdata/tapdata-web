<script>
import { inspectApi, taskApi } from '@tap/api'
import { AsyncSelect } from '@tap/form'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { cloneDeep } from 'lodash'

import PageContainer from '../../components/PageContainer.vue'
import ConditionBox from './components/ConditionBox'
import { TABLE_PARAMS } from './components/const'
import { inspectMethod as inspectMethodMap } from './const'

export default {
  components: { AsyncSelect, ConditionBox, PageContainer },
  data() {
    const self = this
    const requiredValidator = (msg, check) => {
      return (rule, value, callback) => {
        const valid = check ? check() : true
        if (valid && !value) {
          callback(new Error(msg))
        } else {
          callback()
        }
      }
    }
    const checkMode = () => {
      return self.form.mode === 'cron'
    }

    return {
      loading: false,
      timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
      isDbClone: false,
      taskName: '',
      dateRange: [],
      defaultTime: [
        new Date(2025, 1, 1, 0, 0, 0),
        new Date(2025, 2, 1, 23, 59, 59),
      ],
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
          end: Time.now() + 24 * 60 * 60 * 1000,
        },
        limit: {
          keep: 100,
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
            open: true,
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_COUNT_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialRows: 0,
            },
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_VALUE_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialValues: 0,
            },
          },
        ],
      },
      rules: {
        flowId: [
          {
            validator: requiredValidator(
              this.$t('packages_business_verification_tasksDataFlow'),
            ),
          },
        ],
        name: [
          {
            validator: requiredValidator(
              this.$t('packages_business_verification_tasksJobName'),
            ),
          },
        ],
        'timing.start': [
          {
            validator: requiredValidator(
              this.$t('packages_business_verification_tasksTime'),
              checkMode,
            ),
          },
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(
              this.$t('packages_business_verification_tasksVerifyInterval'),
              checkMode,
            ),
          },
        ],
        cdcBeginDate: [
          {
            validator: requiredValidator(
              i18n.t('packages_business_verification_form_qingshurukaishi'),
              () => {
                return self.form.inspectMethod === 'cdcCount'
              },
            ),
          },
        ],
      },
      edges: [],
      allStages: [],
      flowOptions: [],
      inspectMethodMap,
      typTipMap: {
        row_count: this.$t('packages_business_verification_fastCountTip'),
        field: this.$t('packages_business_verification_contentVerifyTip'),
        jointField: this.$t('packages_business_verification_jointFieldTip'),
      },
      jointErrorMessage: '',
      errorMessageLevel: '',
      autoAddTableLoading: false,
    }
  },
  computed: {
    saveDisabled() {
      return (
        this.errorMessageLevel === 'error' ||
        this.autoAddTableLoading ||
        this.loading
      )
    },
  },
  created() {
    // 设置form.taskMode
    const taskMode = this.$route.query.taskMode
    if (taskMode) {
      this.form.taskMode = taskMode
    }

    const id = this.$route.params.id
    if (id) {
      this.getData(id)
    }
  },
  methods: {
    async getTaskOptions(filter) {
      let data

      if (filter.where?.id) {
        return {
          items: [
            {
              id: filter.where.id,
              name: this.taskName,
            },
          ],
          total: 1,
        }
      }

      if (!this.taskOptionCache) {
        this.taskOptionCache = await inspectApi.getTaskList()
      }

      data = this.taskOptionCache || []

      let query = filter?.where?.name
      query = typeof query === 'object' ? query.like : query
      if (query) {
        query = query.toLowerCase()
        const reg = new RegExp(query, 'i')
        data = data.filter((item) => reg.test(item.name))
      }

      return {
        items: data,
        total: data.length,
      }
    },
    //获取表单数据
    async getData(id) {
      try {
        const data = await inspectApi.findOne({
          filter: JSON.stringify({
            where: {
              id,
            },
          }),
        })

        if (data) {
          if (this.form.taskMode === 'pipeline' && data.flowId) {
            this.taskName = data.taskDto.name
            this.applyTask(data.taskDto)
          }

          // 任务一致性/任意表 都走异步获取 capabilities/tags
          const capabilitiesMap = await this.$refs.conditionBox.getCapabilities(
            [
              ...new Set([
                ...data.tasks.map((t) => t.source.connectionId),
                ...data.tasks.map((t) => t.target.connectionId),
              ]),
            ],
          )

          data.tasks = data.tasks.map((t) => {
            t.source = Object.assign({}, TABLE_PARAMS, t.source)
            t.target = Object.assign({}, TABLE_PARAMS, t.target)
            t.source.capabilities =
              capabilitiesMap[t.source.connectionId]?.capabilities || []
            t.target.capabilities =
              capabilitiesMap[t.target.connectionId]?.capabilities || []
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
          data.alarmSettings =
            this.form.alarmSettings?.map((t) => {
              const f = alarmSettings.find((item) => item.key === t.key)
              if (f) return Object.assign(t, f)
              t.notify = []
              t.open = false
              return t
            }) || []

          this.form = Object.assign({}, this.form, data)
        }
      } catch (error) {
        console.error(error)
      }
    },
    async getFlowStages(id, cb) {
      this.loading = true
      try {
        id = id || this.form.flowId
        const data = await taskApi.getId(id)
        this.loading = false
        this.applyTask(data, cb)
      } catch {
        this.loading = false
      }
    },
    applyTask(task, cb) {
      this.isDbClone = task.syncType === 'migrate'
      const edges = task.dag?.edges || []
      const nodes = task.dag?.nodes || []

      if (!edges.length) {
        if (cb) {
          setTimeout(() => {
            cb()
            this.loading = false
          }, 800)
        } else {
          this.loading = false
        }
        return { items: [], total: 0 }
      }
      const stages = []
      nodes.forEach((n) => {
        const outputLanes = []
        const inputLanes = []
        edges.forEach((e) => {
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
            inputLanes,
          }),
        )
      })

      this.edges = edges
      this.allStages = stages

      if (cb) {
        setTimeout(() => {
          cb()
          this.loading = false
        }, 800)
      }
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
          type: 'warning',
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        this.$router.back()
      })
    },
    save(saveOnly = false) {
      this.$refs.baseForm.validate(async (valid) => {
        if (valid) {
          let tasks = this.$refs.conditionBox.getList()
          // 自动过滤出完整数据，以及索引字段数量不相等的情况
          tasks = tasks.filter((t) => {
            if (
              this.form.inspectMethod === 'row_count' ||
              this.form.inspectMethod === 'hash'
            ) {
              return t.source.table && t.target.table
            }
            return (
              t.source.sortColumn &&
              t.source.sortColumn.split(',').length ===
                t.target.sortColumn.split(',').length
            )
          })

          if (!tasks.length) {
            return this.$message.error(
              this.$t('packages_business_verification_tasksVerifyCondition'),
            )
          }
          const validateMsg = await this.$refs.conditionBox.validate()
          if (validateMsg) {
            return this.$message.error(validateMsg)
          }

          if (this.form.inspectMethod === 'jointField') {
            tasks.forEach((item) => {
              item.fullMatch = false
            })
          } else {
            tasks.forEach((item) => {
              item.fullMatch = true
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
          const alarmSettings = this.form.alarmSettings.filter((t) =>
            alarmSettingsKeys.includes(t.key),
          )

          inspectApi[this.form.id ? 'patch' : 'post'](
            Object.assign({}, this.form, {
              fullMatchKeep: this.form.keep,
              status: saveOnly ? 'waiting' : 'scheduling',
              ping_time: 0,
              tasks: tasks.map(
                ({
                  taskId,
                  source,
                  target,
                  fullMatch,
                  showAdvancedVerification,
                  script,
                  webScript,
                  jsEngineName,
                }) => {
                  if (webScript && webScript !== '') {
                    script = `function validate(sourceRow){${webScript}}`
                  }
                  const newSource = cloneDeep(source)
                  const newTarget = cloneDeep(target)
                  newSource.fields = []
                  newTarget.fields = []
                  newSource.capabilities = []
                  newTarget.capabilities = []
                  return {
                    taskId,
                    source: newSource,
                    target: newTarget,
                    fullMatch,
                    showAdvancedVerification,
                    script,
                    webScript,
                    jsEngineName,
                  }
                },
              ),
              platformInfo: {
                agentType: 'private',
              },
              byFirstCheckId: '',
              browserTimezoneOffset: new Date().getTimezoneOffset(),
              alarmSettings,
            }),
          ).then(() => {
            this.$message.success(this.$t('public_message_save_ok'))
            this.$router.back() // back 保留上个路由的参数
          })
        }
      })
    },

    handleChangeAlarmItem() {
      this.form.alarmSettings[0].open =
        !!this.form.alarmSettings[0].notify.length
      this.form.alarmSettings[1].open =
        !!this.form.alarmSettings[1].notify.length
      this.form.alarmSettings[2].open =
        !!this.form.alarmSettings[2].notify.length
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
        this.form.name = `${this.taskName} - ${this.inspectMethodMap[this.form.inspectMethod]}`
      }
    },
    handleSelectTask(task, byClick) {
      if (byClick) {
        this.form.tasks = []
        this.taskName = task.name
        this.setVerifyName()
        this.getFlowStages(task.id, this.$refs.conditionBox.autoAddTable)
      }
    },
  },
}
</script>

<template>
  <PageContainer mode="auto">
    <section v-loading="loading">
      <div>
        <ElForm
          ref="baseForm"
          class="grey"
          label-position="left"
          label-width="auto"
          :model="form"
          :rules="rules"
          :validate-on-rule-change="false"
        >
          <ElFormItem
            v-if="form.taskMode === 'pipeline'"
            required
            class="form-item"
            prop="flowId"
            :label="`${$t('packages_business_verification_chooseJob')}: `"
          >
            <AsyncSelect
              v-model="form.flowId"
              class="form-item-width"
              :method="getTaskOptions"
              :current-label="taskName"
              item-label="name"
              item-value="id"
              item-query="name"
              :page-size="10000000000"
              @option-select="handleSelectTask"
            />
          </ElFormItem>

          <ElFormItem
            required
            class="form-item"
            prop="name"
            :label="`${$t('packages_business_verification_task_name')}: `"
          >
            <ElInput v-model="form.name" class="form-input" />
          </ElFormItem>

          <ElFormItem
            required
            class="form-item"
            :label="`${$t('packages_business_verification_type')}: `"
          >
            <div>
              <ElRadioGroup
                v-model="form.inspectMethod"
                @change="handleChangeInspectMethod"
              >
                <ElRadioButton label="row_count">{{
                  inspectMethodMap['row_count']
                }}</ElRadioButton>
                <ElRadioButton label="field">{{
                  inspectMethodMap['field']
                }}</ElRadioButton>
                <ElRadioButton label="jointField">{{
                  inspectMethodMap['jointField']
                }}</ElRadioButton>
                <ElRadioButton label="hash">{{
                  inspectMethodMap['hash']
                }}</ElRadioButton>
              </ElRadioGroup>
              <div
                v-if="typTipMap[form.inspectMethod]"
                class="font-color-light"
              >
                <VIcon class="align-middle mr-1">info</VIcon>
                <span class="align-middle fs-8">{{
                  typTipMap[form.inspectMethod]
                }}</span>
              </div>
            </div>
          </ElFormItem>

          <ElCollapse
            class="collapse-fill db-list-container"
            accordion
            style="--collapse-padding-primary: 0"
          >
            <ElCollapseItem name="1">
              <template #title>
                <span>{{
                  $t('packages_business_verification_form_gaojipeizhi')
                }}</span>
                <span
                  v-if="
                    form.taskMode === 'pipeline' &&
                    (autoAddTableLoading || loading)
                  "
                  class="ml-3 font-color-sslight"
                  >{{
                    $t('packages_business_verification_form_zhengzaijiyuren')
                  }}</span
                >
                <VIcon
                  v-if="
                    form.taskMode === 'pipeline' &&
                    (autoAddTableLoading || loading)
                  "
                  class="ml-2 animation-rotate"
                  size="14"
                  color="rgb(61, 156, 64)"
                  >loading-circle
                </VIcon>
              </template>
              <ElFormItem
                v-if="form.inspectMethod !== 'hash'"
                class="form-item"
                prop="inspectDifferenceMode"
                :label="`${$t('packages_business_verification_form_jieguoshuchu')}: `"
              >
                <ElSelect
                  v-model="form.inspectDifferenceMode"
                  filterable
                  class="form-select"
                >
                  <ElOption
                    :label="
                      $t('packages_business_verification_form_shuchusuoyoubu')
                    "
                    value="All"
                  />
                  <ElOption
                    :label="
                      $t('packages_business_verification_form_zhishuchulaiyuan')
                    "
                    value="OnSourceExists"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem
                class="form-item"
                :label="`${$t('packages_business_verification_frequency')}: `"
              >
                <ElSelect
                  v-model="form.mode"
                  class="form-select"
                  @input="form.enabled = true"
                >
                  <ElOption
                    :label="$t('packages_business_verification_single')"
                    value="manual"
                  />
                  <ElOption
                    :label="$t('packages_business_verification_repeating')"
                    value="cron"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem
                v-if="form.mode === 'cron'"
                class="form-item"
                :label="`${$t('packages_business_verification_is_enabled')}: `"
              >
                <ElSwitch v-model="form.enabled" />
              </ElFormItem>
              <template v-if="form.mode === 'cron'">
                <ElFormItem
                  class="form-item"
                  prop="timing.start"
                  :label="`${$t('packages_business_verification_startAndStopTime')}: `"
                >
                  <ElDatePicker
                    :model-value="[form.timing.start, form.timing.end]"
                    class="form-input"
                    type="datetimerange"
                    range-separator="-"
                    align="right"
                    :default-time="defaultTime"
                    value-format="x"
                    @update:model-value="timingChangeHandler"
                  />
                </ElFormItem>
                <ElFormItem
                  class="form-item"
                  prop="timing.intervals"
                  :label="`${$t('packages_business_verification_verifyInterval')}: `"
                >
                  <ElInput
                    v-model="form.timing.intervals"
                    class="form-input"
                    onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                    onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                  >
                    <template #append>
                      <ElSelect
                        v-model="form.timing.intervalsUnit"
                        style="width: 100px"
                      >
                        <ElOption
                          v-for="unit in timeUnitOptions"
                          :key="unit"
                          :label="unit"
                          :value="unit"
                        />
                      </ElSelect>
                    </template>
                  </ElInput>
                </ElFormItem>
              </template>

              <ElFormItem
                class="form-item"
                :label="`${$t('packages_business_verification_form_task_alarm')}: `"
              >
                <div class="inline-block">
                  <div>
                    <ElCheckbox
                      v-model="form.alarmSettings[0].open"
                      @change="handleChangeAlarm(arguments[0], 0)"
                      >{{
                        $t(
                          'packages_business_verification_form_task_alarm_when_error',
                        )
                      }}
                    </ElCheckbox>
                  </div>
                  <div>
                    <ElCheckbox
                      v-show="form.inspectMethod === 'row_count'"
                      v-model="form.alarmSettings[1].open"
                      @change="handleChangeAlarm(arguments[0], 1)"
                      >{{
                        $t(
                          'packages_business_verification_form_task_alarm_when_diff_result_over_count1',
                        )
                      }}
                      <ElInputNumber
                        v-model="
                          form.alarmSettings[1].params.maxDifferentialRows
                        "
                        controls-position="right"
                        :min="0"
                        style="width: 100px"
                        @click.native.prevent.stop
                        @blur="
                          () => {
                            form.alarmSettings[1].params.maxDifferentialRows =
                              form.alarmSettings[1].params
                                .maxDifferentialRows || 0
                          }
                        "
                      />
                      {{
                        $t(
                          'packages_business_verification_form_task_alarm_when_diff_result_over_count2',
                        )
                      }}
                    </ElCheckbox>
                    <ElCheckbox
                      v-show="
                        ['field', 'jointField'].includes(form.inspectMethod)
                      "
                      v-model="form.alarmSettings[2].open"
                      @change="handleChangeAlarm(arguments[0], 2)"
                      >{{
                        $t(
                          'packages_business_verification_form_task_alarm_when_result_table_over_count1',
                        )
                      }}
                      <ElInputNumber
                        v-model="
                          form.alarmSettings[2].params.maxDifferentialValues
                        "
                        controls-position="right"
                        :min="0"
                        style="width: 100px"
                        @click.native.prevent.stop
                        @blur="
                          () => {
                            form.alarmSettings[2].params.maxDifferentialValues =
                              form.alarmSettings[2].params
                                .maxDifferentialValues || 0
                          }
                        "
                      />
                      {{
                        $t(
                          'packages_business_verification_form_task_alarm_when_diff_result_over_count2',
                        )
                      }}
                    </ElCheckbox>
                  </div>
                </div>
                <div class="inline-block ml-8">
                  <ElCheckboxGroup
                    v-model="form.alarmSettings[0].notify"
                    @change="handleChangeAlarmItem"
                  >
                    <ElCheckbox label="SYSTEM"
                      >{{
                        $t('packages_business_verification_form_xitongtongzhi')
                      }}
                    </ElCheckbox>
                    <ElCheckbox label="EMAIL"
                      >{{
                        $t('packages_business_verification_form_youjiantongzhi')
                      }}
                    </ElCheckbox>
                  </ElCheckboxGroup>
                  <ElCheckboxGroup
                    v-show="form.inspectMethod === 'row_count'"
                    v-model="form.alarmSettings[1].notify"
                    @change="handleChangeAlarmItem"
                  >
                    <ElCheckbox label="SYSTEM"
                      >{{
                        $t('packages_business_verification_form_xitongtongzhi')
                      }}
                    </ElCheckbox>
                    <ElCheckbox label="EMAIL"
                      >{{
                        $t('packages_business_verification_form_youjiantongzhi')
                      }}
                    </ElCheckbox>
                  </ElCheckboxGroup>
                  <ElCheckboxGroup
                    v-show="
                      ['field', 'jointField'].includes(form.inspectMethod)
                    "
                    v-model="form.alarmSettings[2].notify"
                    @change="handleChangeAlarmItem"
                  >
                    <ElCheckbox label="SYSTEM"
                      >{{
                        $t('packages_business_verification_form_xitongtongzhi')
                      }}
                    </ElCheckbox>
                    <ElCheckbox label="EMAIL"
                      >{{
                        $t('packages_business_verification_form_youjiantongzhi')
                      }}
                    </ElCheckbox>
                  </ElCheckboxGroup>
                </div>
              </ElFormItem>

              <ElFormItem
                v-if="form.inspectMethod !== 'hash'"
                class="form-item"
                :label="`${$t(
                  'packages_business_verification_form_label_error_save_count',
                )}: `"
              >
                <ElSelect v-model="form.limit.keep" class="form-select">
                  <ElOption :value="100" label="100(rows)" />
                  <ElOption :value="1000" label="1000(rows)" />
                  <ElOption :value="10000" label="10000(rows)" />
                </ElSelect>
              </ElFormItem>
              <template v-if="form.inspectMethod === 'cdcCount'">
                <ElFormItem class="setting-item">
                  <label class="item-label">{{
                    $t('packages_business_verification_create_window_duration')
                  }}</label>
                  <ElInput
                    v-model="form.cdcDuration"
                    class="item-input"
                    onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                    onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                  >
                    <template #append> {{ $t('public_time_m') }}</template>
                  </ElInput>
                </ElFormItem>
                <ElFormItem class="setting-item" prop="cdcBeginDate">
                  <label class="item-label is-required">{{
                    $t('packages_business_verification_form_jiaoyankaishishi')
                  }}</label>
                  <ElDatePicker
                    v-model="form.cdcBeginDate"
                    class="item-select"
                    type="datetime"
                    :placeholder="
                      $t('packages_business_verification_form_jiaoyankaishishi')
                    "
                    format="yyyy-MM-dd HH:mm"
                    value-format="yyyy-MM-dd HH:mm"
                  />
                </ElFormItem>
                <ElFormItem v-if="form.mode === 'manual'" class="setting-item">
                  <label class="item-label">{{
                    $t('packages_business_verification_form_jiaoyanjieshushi')
                  }}</label>
                  <ElDatePicker
                    v-model="form.cdcEndDate"
                    class="item-select"
                    type="datetime"
                    :placeholder="
                      $t('packages_business_verification_form_jiaoyanjieshushi')
                    "
                    format="yyyy-MM-dd HH:mm"
                    value-format="yyyy-MM-dd HH:mm"
                  />
                </ElFormItem>
              </template>

              <ConditionBox
                v-if="form.taskMode === 'pipeline'"
                ref="conditionBox"
                v-model:joint-error-message="jointErrorMessage"
                v-model:error-message-level="errorMessageLevel"
                v-model:auto-add-table-loading="autoAddTableLoading"
                :task-id="form.flowId"
                :inspect-method="form.inspectMethod"
                :data="form.tasks"
                :edges="edges"
                :all-stages="allStages"
                :is-d-b="isDbClone"
              />
            </ElCollapseItem>
          </ElCollapse>
          <ConditionBox
            v-if="form.taskMode !== 'pipeline'"
            ref="conditionBox"
            v-model:joint-error-message="jointErrorMessage"
            v-model:error-message-level="errorMessageLevel"
            v-model:auto-add-table-loading="autoAddTableLoading"
            :task-id="form.flowId"
            :inspect-method="form.inspectMethod"
            :data="form.tasks"
            :edges="edges"
            :all-stages="allStages"
            :is-d-b="isDbClone"
            class="mt-6"
          />
        </ElForm>
      </div>
      <div
        v-if="!!errorMessageLevel"
        class="color-danger mt-2"
        v-html="jointErrorMessage"
      />
      <div class="mt-4">
        <ElButton @click="goBack()">{{ $t('public_button_back') }}</ElButton>
        <!--        <ElButton type="primary"  @click="save()">{{-->
        <!--          $t('public_button_save') + ' & ' + $t('public_button_execute')-->
        <!--        }}</ElButton>-->
        <ElButton type="primary" :disabled="saveDisabled" @click="save(true)"
          >{{ $t('public_button_save') }}
        </ElButton>
      </div>
    </section>
  </PageContainer>
</template>

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
  color: map.get($fontColor, dark);
}

.form-item {
  margin-bottom: 32px;
}

.form-select {
  width: 276px;
}

:deep(.form-input, .form-item-width) {
  flex-grow: 0;
  width: 500px;
}

:deep(.js-wrap) {
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
    border: 1px solid map.get($borderColor, light);
  }
}

.el-form {
  :deep(.el-form-item__error) {
    margin-top: 8px;
  }
}
</style>
