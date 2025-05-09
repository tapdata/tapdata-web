<script setup lang="ts">
import { inspectApi, taskApi } from '@tap/api'
import { AsyncSelect } from '@tap/form'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { computed, onMounted, provide, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageContainer from '../../components/PageContainer.vue'
import ConditionBox from './components/ConditionBox.vue'
import { TABLE_PARAMS } from './components/const'
import { inspectMethod as inspectMethodMap } from './const'

interface Timing {
  intervals: number
  intervalsUnit: string
  start: number
  end: number
}

interface Limit {
  keep: number
}

interface AlarmSetting {
  type: string
  key: string
  notify: string[]
  open: boolean
  params?: {
    maxDifferentialRows?: number
    maxDifferentialValues?: number
  }
}

interface FormData {
  flowId: string
  name: string
  mode: 'manual' | 'cron'
  inspectDifferenceMode: string
  inspectMethod: string
  cdcBeginDate: string
  cdcEndDate: string
  cdcDuration: string
  timing: Timing
  limit: Limit
  enabled: boolean
  tasks: any[]
  taskMode: 'pipeline' | 'random'
  errorNotifys: string[]
  inconsistentNotifys: string[]
  checkTableThreadNum: number
  alarmSettings: AlarmSetting[]
  ignoreTimePrecision?: boolean
}

interface Task {
  taskId: string
  source: any
  target: any
  fullMatch: boolean
  showAdvancedVerification?: boolean
  script?: string
  webScript?: string
  jsEngineName?: string
}

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const timeUnitOptions = ['second', 'minute', 'hour', 'day', 'week', 'month']
const isDbClone = ref(false)
const taskName = ref('')
const defaultTime = ref([
  new Date(2025, 1, 1, 0, 0, 0),
  new Date(2025, 2, 1, 23, 59, 59),
])

const form = reactive({
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
  checkTableThreadNum: 10,
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
})

const requiredValidator = (msg: string, check?: () => boolean) => {
  return (rule: any, value: any, callback: any) => {
    const valid = check ? check() : true
    if (valid && !value) {
      callback(new Error(msg))
    } else {
      callback()
    }
  }
}

const checkMode = () => {
  return form.mode === 'cron'
}

const rules = ref({
  flowId: [
    {
      validator: requiredValidator(
        i18n.t('packages_business_verification_tasksDataFlow'),
      ),
    },
  ],
  name: [
    {
      validator: requiredValidator(
        i18n.t('packages_business_verification_tasksJobName'),
      ),
    },
  ],
  'timing.start': [
    {
      validator: requiredValidator(
        i18n.t('packages_business_verification_tasksTime'),
        checkMode,
      ),
    },
  ],
  'timing.intervals': [
    {
      validator: requiredValidator(
        i18n.t('packages_business_verification_tasksVerifyInterval'),
        checkMode,
      ),
    },
  ],
  cdcBeginDate: [
    {
      validator: requiredValidator(
        i18n.t('packages_business_verification_form_qingshurukaishi'),
        () => {
          return form.inspectMethod === 'cdcCount'
        },
      ),
    },
  ],
})

const edges = ref([])
const allStages = ref([])
const typTipMap = ref({
  row_count: i18n.t('packages_business_verification_fastCountTip'),
  field: i18n.t('packages_business_verification_contentVerifyTip'),
  jointField: i18n.t('packages_business_verification_jointFieldTip'),
})
const jointErrorMessage = ref('')
const errorMessageLevel = ref('')
const autoAddTableLoading = ref(false)
const taskOptionCache = ref(null)
const baseForm = ref(null)
const conditionBox = ref(null)

const saveDisabled = computed(() => {
  return (
    errorMessageLevel.value === 'error' ||
    autoAddTableLoading.value ||
    loading.value
  )
})

const isCountOrHash = computed(() => {
  return form.inspectMethod === 'row_count' || form.inspectMethod === 'hash'
})

onMounted(() => {
  // 设置form.taskMode
  const taskMode = route.query.taskMode
  if (taskMode) {
    form.taskMode = taskMode
  }

  const id = route.params.id
  if (id) {
    getData(id)
  }
})

const getTaskOptions = async (filter: any) => {
  let data

  if (filter.where?.id) {
    return {
      items: [
        {
          id: filter.where.id,
          name: taskName.value,
        },
      ],
      total: 1,
    }
  }

  if (!taskOptionCache.value) {
    taskOptionCache.value = await inspectApi.getTaskList()
  }

  data = taskOptionCache.value || []

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
}

const getData = async (id: string) => {
  try {
    const data = await inspectApi.findOne({
      filter: JSON.stringify({
        where: {
          id,
        },
      }),
    })

    if (data) {
      if (form.taskMode === 'pipeline' && data.flowId) {
        taskName.value = data.taskDto.name
        applyTask(data.taskDto)
      }

      // 任务一致性/任意表 都走异步获取 capabilities/tags
      const capabilitiesMap = await conditionBox.value.getCapabilities([
        ...new Set([
          ...data.tasks.map((t) => t.source.connectionId),
          ...data.tasks.map((t) => t.target.connectionId),
        ]),
      ])

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
        t.modeType = t.source.columns ? 'custom' : 'all'

        return t
      })

      if (!data.timing) {
        data.timing = form.timing
      }
      data.taskMode = data.flowId ? 'pipeline' : 'random'

      // 历史数据，默认不打开；新数据默认打开
      const { alarmSettings = [] } = data
      data.alarmSettings =
        form.alarmSettings?.map((t) => {
          const f = alarmSettings.find((item) => item.key === t.key)
          if (f) return Object.assign(t, f)
          t.notify = []
          t.open = false
          return t
        }) || []

      Object.assign(form, data)
    }
  } catch (error) {
    console.error(error)
  }
}

const getFlowStages = async (id: string, cb?: () => void) => {
  loading.value = true
  try {
    id = id || form.flowId
    const data = await taskApi.getId(id)
    loading.value = false
    applyTask(data, cb)
  } catch {
    loading.value = false
  }
}

const applyTask = (task: any, cb?: () => void) => {
  isDbClone.value = task.syncType === 'migrate'
  const dagEdges = task.dag?.edges || []
  const nodes = task.dag?.nodes || []

  if (!dagEdges.length) {
    if (cb) {
      setTimeout(() => {
        cb()
        loading.value = false
      }, 800)
    } else {
      loading.value = false
    }
    return { items: [], total: 0 }
  }
  const stages = []
  nodes.forEach((n) => {
    const outputLanes = []
    const inputLanes = []
    dagEdges.forEach((e) => {
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

  edges.value = dagEdges
  allStages.value = stages

  if (cb) {
    setTimeout(() => {
      cb()
      loading.value = false
    }, 800)
  }
}

const timingChangeHandler = (times: any) => {
  form.timing.start = times?.[0] || ''
  form.timing.end = times?.[1] || ''
}

const goBack = () => {
  ElMessageBox.confirm(
    i18n.t('packages_business_verification_backConfirmMessage'),
    i18n.t('packages_business_verification_backConfirmTitle'),
    {
      type: 'warning',
    },
  ).then((resFlag) => {
    if (!resFlag) {
      return
    }
    router.back()
  })
}

const save = async (saveOnly = false) => {
  await baseForm.value.validate(async (valid: boolean) => {
    if (valid) {
      let tasks = conditionBox.value.getList()
      // 自动过滤出完整数据，以及索引字段数量不相等的情况
      tasks = tasks.filter((t) => {
        if (
          form.inspectMethod === 'row_count' ||
          form.inspectMethod === 'hash'
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
        return ElMessage.error(
          i18n.t('packages_business_verification_tasksVerifyCondition'),
        )
      }
      const validateMsg = await conditionBox.value.validate()
      if (validateMsg) {
        return ElMessage.error(validateMsg)
      }

      if (form.inspectMethod === 'jointField') {
        tasks.forEach((item) => {
          item.fullMatch = false
        })
      } else {
        tasks.forEach((item) => {
          item.fullMatch = true
        })
      }
      if (form && form.createTime && form.last_updated) {
        delete form.createTime
        delete form.last_updated
      }

      const alarmSettingsKeys =
        form.inspectMethod === 'row_count'
          ? ['INSPECT_TASK_ERROR', 'INSPECT_COUNT_ERROR']
          : ['INSPECT_TASK_ERROR', 'INSPECT_VALUE_ERROR']
      const alarmSettings = form.alarmSettings.filter((t) =>
        alarmSettingsKeys.includes(t.key),
      )

      await inspectApi[form.id ? 'patch' : 'post'](
        Object.assign({}, form, {
          fullMatchKeep: form.keep,
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
      )
      ElMessage.success(i18n.t('public_message_save_ok'))
      router.back() // back 保留上个路由的参数
    }
  })
}

const handleChangeAlarmItem = () => {
  form.alarmSettings[0].open = !!form.alarmSettings[0].notify.length
  form.alarmSettings[1].open = !!form.alarmSettings[1].notify.length
  form.alarmSettings[2].open = !!form.alarmSettings[2].notify.length
}

const handleChangeAlarm = (val: boolean, index = 0) => {
  form.alarmSettings[index].notify = val ? ['SYSTEM', 'EMAIL'] : []
}

const handleChangeInspectMethod = () => {
  setVerifyName()
  handleChangeAlarm(true, 0)
  handleChangeAlarm(true, 1)
  handleChangeAlarm(true, 2)
  handleChangeAlarmItem()
  conditionBox.value.validate()
}

const setVerifyName = () => {
  // 任务模式
  if (form.taskMode === 'pipeline') {
    form.name = `${taskName.value} - ${inspectMethodMap[form.inspectMethod]}`
  }
}

const handleSelectTask = (task: any, byClick: boolean) => {
  if (byClick) {
    form.tasks = []
    taskName.value = task.name
    setVerifyName()
    getFlowStages(task.id, conditionBox.value.autoAddTable)
  }
}

provide('formData', form)
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
              class="form-input"
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
            class="collapse-fill db-list-container only-one"
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

              <ElFormItem v-if="!isCountOrHash" class="form-item">
                <template #label>
                  <span>{{ $t('packages_business_ignoreTimePrecision') }}</span>
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    :content="$t('packages_business_ignoreTimePrecision_tip')"
                  >
                    <VIcon class="align-self-center" color="#909399" size="14"
                      >info</VIcon
                    >
                  </el-tooltip>
                  <span>:</span>
                </template>
                <ElSwitch v-model="form.ignoreTimePrecision" />
              </ElFormItem>

              <ElFormItem v-if="!isCountOrHash" class="form-item">
                <template #label>
                  <span>{{ $t('packages_business_checkTableThreadNum') }}</span>
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    :content="$t('packages_business_checkTableThreadNum_tip')"
                  >
                    <VIcon class="align-self-center" color="#909399" size="14"
                      >info</VIcon
                    >
                  </el-tooltip>
                  <span>:</span>
                </template>
                <ElInputNumber v-model="form.checkTableThreadNum" :min="1" />
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
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
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
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
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
        <ElButton type="primary" :disabled="saveDisabled" @click="save(true)"
          >{{ $t('public_button_save') }}
        </ElButton>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.only-one.el-collapse {
  :deep(.el-collapse-item.is-active) {
    .el-collapse-item__wrap {
      border-bottom: none;
    }
  }
}
.verify-form-wrap {
  height: 100%;
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
