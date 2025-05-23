<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import { databaseTypesApi, inspectApi, taskApi } from '@tap/api'
import { InfiniteSelect } from '@tap/form'
import i18n from '@tap/i18n'
import Time from '@tap/shared/src/time'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import {
  computed,
  onMounted,
  provide,
  reactive,
  ref,
  useTemplateRef,
} from 'vue'
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
const conditionList = ref([])

const taskSelect = useTemplateRef('taskSelect')

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
  // tasks: [],
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
const activePanel = ref('condition')

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

      data.tasks = data.tasks.map((t) => {
        t.source = Object.assign({}, TABLE_PARAMS, t.source)
        t.target = Object.assign({}, TABLE_PARAMS, t.target)

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

      conditionList.value = data.tasks

      delete data.tasks

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
      let tasks = conditionList.value
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
              modeType,
            }) => {
              if (modeType === 'all') {
                source.columns = null
                target.columns = null
              }

              if (webScript && webScript !== '') {
                script = `function validate(sourceRow){${webScript}}`
              }

              if (
                source.enableCustomCommand &&
                source.databaseType.toLowerCase().includes('mongo')
              ) {
                source.customCommand.params.collection = source.tableName

                if (source.customCommand.command === 'executeQuery') {
                  source.customCommand.params.op = 'find'
                }
              }

              if (
                target.enableCustomCommand &&
                target.databaseType.toLowerCase().includes('mongo')
              ) {
                target.customCommand.params.collection = target.tableName

                if (target.customCommand.command === 'executeQuery') {
                  target.customCommand.params.op = 'find'
                }
              }

              const newSource = cloneDeep(source)
              const newTarget = cloneDeep(target)
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

const ConnectorMap = ref({})

const fetchDatabaseTypes = async () => {
  const databaseItems = await databaseTypesApi.get()

  ConnectorMap.value = databaseItems.reduce((map, item) => {
    map[item.type] = {
      pdkHash: item.pdkHash,
      isNullsLast: item.tags?.includes('NullsLast'),
      capabilityMap:
        item.capabilities?.reduce((map, item) => {
          map[item.id] = true
          return map
        }, {}) || {},
    }
    return map
  }, {})
}

const openTaskSelect = () => {
  taskSelect.value.focus()
  taskSelect.value.$el.querySelector('input').click()
}

fetchDatabaseTypes()

provide('formData', form)
provide('conditionList', conditionList)
provide('ConnectorMap', ConnectorMap)
</script>

<template>
  <PageContainer
    v-loading="loading"
    mode="auto"
    content-class="flex flex-column flex-1 min-h-0 overflow-auto px-6 position-relative"
  >
    <ElForm
      ref="baseForm"
      class="grey"
      label-position="top"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
    >
      <div class="flex gap-4">
        <ElFormItem
          v-if="form.taskMode === 'pipeline'"
          required
          class="form-item"
          prop="flowId"
          :label="`${$t('packages_business_verification_chooseJob')}: `"
        >
          <InfiniteSelect
            ref="taskSelect"
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
      </div>

      <ElFormItem
        required
        class="form-item"
        :label="`${$t('packages_business_verification_type')}: `"
      >
        <div>
          <el-radio-group
            v-model="form.inspectMethod"
            class="align-top has-space"
            @change="handleChangeInspectMethod"
          >
            <el-radio-button value="row_count">
              <div class="flex align-center gap-2">
                <VIcon size="16">Lightning</VIcon>
                {{ inspectMethodMap['row_count'] }}
              </div>
            </el-radio-button>
            <el-radio-button value="field">
              <div class="flex align-center gap-2">
                <VIcon size="16">LucideTable</VIcon>
                {{ inspectMethodMap['field'] }}
              </div>
            </el-radio-button>
            <el-radio-button value="jointField">
              <div class="flex align-center gap-2">
                <VIcon size="16">LucideLink</VIcon>
                {{ inspectMethodMap['jointField'] }}
              </div>
            </el-radio-button>
            <el-radio-button value="hash">
              <div class="flex align-center gap-2">
                <VIcon size="16">LucideHash</VIcon>
                {{ inspectMethodMap['hash'] }}
              </div>
            </el-radio-button>
          </el-radio-group>
          <div v-if="typTipMap[form.inspectMethod]" class="font-color-light">
            <VIcon class="align-middle mr-1">info</VIcon>
            <span class="align-middle fs-8">{{
              typTipMap[form.inspectMethod]
            }}</span>
          </div>
        </div>
      </ElFormItem>

      <ElCollapse
        v-model="activePanel"
        class="collapse-fill has-sticky last-item-noborder"
        accordion
        expand-icon-position="left"
        style="--collapse-padding-primary: 0"
      >
        <ElCollapseItem name="1">
          <template #title>
            <span>{{
              $t('packages_business_verification_form_gaojipeizhi')
            }}</span>
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
                  />
                  {{
                    $t(
                      'packages_business_verification_form_task_alarm_when_diff_result_over_count2',
                    )
                  }}
                </ElCheckbox>
                <ElCheckbox
                  v-show="['field', 'jointField'].includes(form.inspectMethod)"
                  v-model="form.alarmSettings[2].open"
                  @change="handleChangeAlarm(arguments[0], 2)"
                  >{{
                    $t(
                      'packages_business_verification_form_task_alarm_when_result_table_over_count1',
                    )
                  }}
                  <ElInputNumber
                    v-model="form.alarmSettings[2].params.maxDifferentialValues"
                    controls-position="right"
                    :min="0"
                    style="width: 100px"
                    @click.native.prevent.stop
                    @blur="
                      () => {
                        form.alarmSettings[2].params.maxDifferentialValues =
                          form.alarmSettings[2].params.maxDifferentialValues ||
                          0
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
                  >{{ $t('packages_business_verification_form_xitongtongzhi') }}
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
                  >{{ $t('packages_business_verification_form_xitongtongzhi') }}
                </ElCheckbox>
                <ElCheckbox label="EMAIL"
                  >{{
                    $t('packages_business_verification_form_youjiantongzhi')
                  }}
                </ElCheckbox>
              </ElCheckboxGroup>
              <ElCheckboxGroup
                v-show="['field', 'jointField'].includes(form.inspectMethod)"
                v-model="form.alarmSettings[2].notify"
                @change="handleChangeAlarmItem"
              >
                <ElCheckbox label="SYSTEM"
                  >{{ $t('packages_business_verification_form_xitongtongzhi') }}
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
        </ElCollapseItem>

        <ConditionBox
          ref="conditionBox"
          v-model:joint-error-message="jointErrorMessage"
          v-model:error-message-level="errorMessageLevel"
          v-model:auto-add-table-loading="autoAddTableLoading"
          class="condition-panel"
          :task-id="form.flowId"
          :inspect-method="form.inspectMethod"
          :data="form.tasks"
          :edges="edges"
          :all-stages="allStages"
          :is-d-b="isDbClone"
          @open-task-select="openTaskSelect"
        />
      </ElCollapse>
    </ElForm>

    <div
      class="position-sticky bottom-0 border-top bg-white z-10 mt-auto flex align-center content-footer flex-shrink-0"
    >
      <el-button size="large" @click="goBack()">{{
        $t('public_button_back')
      }}</el-button>
      <el-button
        id="form-save-btn"
        size="large"
        type="primary"
        :disabled="saveDisabled"
        :icon="Check"
        @click="save(true)"
        >{{ $t('public_button_save') }}
      </el-button>

      <template v-if="!!errorMessageLevel">
        <el-divider class="mx-4" direction="vertical" />
        <el-alert type="error" show-icon :closable="false" class="w-auto">
          <template #title>
            <div v-html="jointErrorMessage" />
          </template>
        </el-alert>
      </template>
    </div>
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

// .form-item {
//   margin-bottom: 32px;
// }

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

.has-sticky {
  --sticky-top: 0px;
  :deep(.el-collapse-item__header) {
    position: sticky;
    top: var(--sticky-top);
    z-index: 10;
  }
}

.el-collapse {
  &.last-item-noborder {
    border-bottom: none;
    :deep(.el-collapse-item:last-child) {
      margin-bottom: 0;
      .el-collapse-item__header,
      .el-collapse-item__wrap {
        border-bottom: none;
      }
    }
  }
}

.condition-panel {
  &.is-active {
    :deep(.el-collapse-item__wrap) {
      overflow: unset;
    }
    :deep(.condition-footer) {
      position: sticky;
      bottom: 72px;
      backdrop-filter: blur(12px);
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 10;
    }
  }
}

.content-footer {
  height: 72px;
}
</style>
