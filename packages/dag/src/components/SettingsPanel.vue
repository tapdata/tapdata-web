<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import {
  createForm,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core'
import { action } from '@formily/reactive'
import { updateTaskAlarm } from '@tap/api/src/core/alarm'
import {
  getPermissions,
  postPermissions,
} from '@tap/api/src/core/data-permission'
import {
  checkCloudTaskLimit,
  checkTaskName,
  updateTaskInfo,
} from '@tap/api/src/core/task'
import { getUserRoles } from '@tap/api/src/core/users'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { TextEditable } from '@tap/component/src/base/text-editable'
import * as components from '@tap/form/src/components'
import { createSchemaField } from '@tap/form/src/shared/create'
import { I18nT, useI18n } from '@tap/i18n'
import { getSettingByKey } from '@tap/shared/src/settings'
import { debounce } from 'lodash-es'
import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  watch,
  type Ref,
} from 'vue'
import { useStore } from 'vuex'
import { FormTab } from '../../../form'
import * as _components from '../components/form'
import { useDataflowStore } from '../stores/dataflow.store'

const dataflowStore = useDataflowStore()
const scope = inject('formScope')
const dataflow = inject<Ref<any>>('dataflow')
const dataflowName = inject('dataflowName')
const dataflowDesc = inject<Ref<string>>('dataflowDesc')
const { Form } = components
const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components,
  },
})

defineOptions({
  name: 'SettingsPanel',
})

const { t } = useI18n()

const RenderI18nT = defineComponent({
  props: {
    value: {
      type: Number,
    },
  },
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        {
          class: 'flex align-center gap-2',
        },
        [
          h(
            I18nT,
            {
              keypath: 'packages_dag_task_retry_alert_desc',
            },
            {
              count: () =>
                h(ElInputNumber, {
                  modelValue: props.value,
                  min: 1,
                  precision: 0,
                  controlsPosition: 'right',
                  style: {
                    width: '100px',
                  },
                  onChange: (value: number) => {
                    emit('change', value)
                  },
                }),
            },
          ),
        ],
      )
  },
})

// Types
interface FormScope {
  lockedFeature: any
  $alarmChannels: any[]
  hasFeature: (feature: string) => boolean
  getPickerOptionsBeforeTime: typeof getPickerOptionsBeforeTime
  $isDaas: boolean
  formTab: any
  checkName: (value: string) => Promise<any>
  checkCrontabExpressionFlag: (value: boolean) => Promise<any>
  useAsyncOptions: (service: Function, ...params: any[]) => (field: any) => void
  useAsyncDataSource: (
    service: Function,
    fieldName?: string,
    ...params: any[]
  ) => (field: any) => void
  loadRoleList: (field: any, val: any[]) => Promise<any[]>
  handleRemovePermissionsItem: () => void
  getConnectionNameByAgent: (field: any) => void
  handleQuicklySyncPoints: () => void
}

// Store
const store = useStore()

// Injections
const lockedFeature = inject('lockedFeature')
const buttonShowMap = inject<Record<string, boolean>>('buttonShowMap', {})
const showSettings = inject<{ value: boolean }>('showSettings')

// Close handler
const handleClose = () => {
  dataflowStore.showSettings = false
}

// State
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
// const values = settings.value
// const { id } = values

// Messages
const repeatNameMessage = t('packages_dag_task_form_error_name_duplicate')
const checkCrontabExpressionFlagMessage = t(
  'packages_dag_task_form_error_can_not_open_crontab_expression_flag',
)

// Handlers
const handleCheckName = debounce((resolve: Function, value: string) => {
  checkTaskName({
    name: value,
    id: dataflowStore.dataflow.id,
  }).then((data) => {
    resolve(data)
  })
}, 500)

const handleCheckCrontabExpressionFlag = debounce((resolve: Function) => {
  checkCloudTaskLimit(dataflowStore.dataflow.id).then((data) => {
    resolve(data)
  })
}, 500)

// Form Scope
const formScope: FormScope = {
  $alarmChannels: scope.$alarmChannels,
  lockedFeature,
  hasFeature: (feature: string) => {
    return !isDaas || store.getters['feature/hasFeature']?.(feature)
  },
  getPickerOptionsBeforeTime,
  $isDaas: isDaas,
  formTab: FormTab.createFormTab(),
  checkName: (value: string) => {
    return new Promise((resolve) => {
      handleCheckName(resolve, value)
    })
  },
  checkCrontabExpressionFlag: () => {
    return new Promise((resolve) => {
      handleCheckCrontabExpressionFlag(resolve)
    })
  },
  useAsyncOptions: (service: Function, ...serviceParams: any[]) => {
    return (field: any) => {
      field.loading = true
      service(...serviceParams).then(
        action.bound((data: any) => {
          field.dataSource = data
          field.loading = false
        }),
      )
    }
  },
  useAsyncDataSource: (
    service: Function,
    fieldName = 'dataSource',
    ...serviceParams: any[]
  ) => {
    return (field: any) => {
      field.loading = true
      service({ field }, ...serviceParams).then(
        action.bound((data: any) => {
          if (fieldName === 'value') {
            field.setValue(data)
          } else field[fieldName] = data
          field.loading = false
        }),
      )
    }
  },
  async loadRoleList(field: any, val: any[]) {
    try {
      const filter = {
        limit: 1000,
      }

      const usedId = val?.map((t) => t.roleId) || []

      const response = await getUserRoles({
        filter: JSON.stringify(filter),
      })
      const items = response?.items || []
      return items.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
          disabled: usedId.includes(item.id),
        }
      })
    } catch {
      return []
    }
  },
  handleRemovePermissionsItem: () => {
    savePermissionsConfig()
  },
  getConnectionNameByAgent: (field: any) => {
    if (
      !field.value ||
      !field.dataSource?.length ||
      !accessNodeProcessIdMap.value[field.value]
    ) {
      field.setDescription('')
      return
    }

    const map: Record<string, string> = {}

    for (const id of accessNodeProcessIdMap.value[field.value]) {
      const node = dataflowStore.findNodeById(id)
      map[node.connectionId] = node.attrs.connectionName
    }

    const values = Object.values(map)

    field.setDescription(
      values.length
        ? `${t('packages_dag_agent_setting_from')}: ${values.join(', ')}`
        : '',
    )
  },
  handleQuicklySyncPoints: () => {
    const currentEventTimestamp = form.values.currentEventTimestamp
    const syncPoints = form.values.syncPoints
    syncPoints?.forEach((point: any) => {
      point.pointType = 'localTZ'
      point.dateTime = currentEventTimestamp
    })
    dataflowStore.dataflow.syncPoints = [...syncPoints]
  },
}

// Computed
const stateIsReadonly = computed(() => dataflowStore.stateIsReadonly)
const allNodes = computed(() => dataflowStore.dag.nodes)

const dataNodes = computed(() => {
  return allNodes.value.filter(
    (item: any) => item.type === 'database' || item.type === 'table',
  )
})

const showDoubleActive = computed(() => {
  const map = dataflowStore.pdkDoubleActiveMap
  return dataNodes.value.length
    ? dataNodes.value.every((node: any) => map[node.attrs.pdkHash])
    : false
})

const accessNodeProcessIdMap = computed(() => {
  return dataNodes.value.reduce((map: Record<string, string[]>, node: any) => {
    const { accessNodeProcessId } = node.attrs
    if (accessNodeProcessId) {
      let nodeIdArr = map[accessNodeProcessId]

      if (!nodeIdArr) {
        nodeIdArr = map[accessNodeProcessId] = []
      }

      nodeIdArr.push(node.id)
    }
    return map
  }, {})
})

const accessNodeProcessIdArr = computed(() =>
  Object.keys(accessNodeProcessIdMap.value),
)

const accessNodeProcessList = computed(() => {
  const agents = scope.$agents.filter(
    (item: any) => item.accessNodeType === dataflow.value.accessNodeType,
  )
  if (!accessNodeProcessIdArr.value.length) return agents
  return agents.filter(
    (item: any) => !!accessNodeProcessIdMap.value[item.value],
  )
})

const sourceNodes = computed(() => {
  return allNodes.value
    .filter(
      (node: any) =>
        (node.type === 'table' || node.type === 'database') &&
        node.$outputs.length &&
        !node.$inputs.length,
    )
    .map((node: any) => ({
      nodeId: node.id,
      nodeName: node.name,
      hiddenPointType: node?.cdcMode === 'polling',
      connectionId: node.connectionId,
      connectionName: node.attrs.connectionName,
    }))
})

const systemTimeZone = computed(() => {
  const timeZone = new Date().getTimezoneOffset() / 60
  let systemTimeZone = ''
  if (timeZone > 0) {
    systemTimeZone = String(0 - timeZone)
  } else {
    systemTimeZone = `+${-timeZone}`
  }
  return systemTimeZone
})

// Form
const form = createForm({
  disabled: dataflowStore.stateIsReadonly,
  values: dataflowStore.dataflow,
  effects: useFormEffects,
})

// Methods
const lazySaveAlarmConfig = debounce(saveAlarmConfig, 100)
const lazySavePermissionsConfig = debounce(savePermissionsConfig, 300)

function loadEmailReceivers() {
  const str = getSettingByKey('email.receivers')
  const receivers = str ? str.split(',').filter(Boolean) : []
  let value = dataflowStore.dataflow.emailReceivers || []
  const size = value.length

  if (size) {
    const filter = value.filter((email: string) => receivers.includes(email))

    if (size !== filter.length) {
      value = [...filter]
    }
  } else {
    value = receivers
  }

  form.setFieldState('emailReceivers', {
    value,
    dataSource: receivers.map((receiver: string) => {
      return {
        label: receiver,
        value: receiver,
      }
    }),
  })
}

function useFormEffects() {
  // 告警和权限的副作用
  onFieldInputValueChange(
    '*(alarmSettings.*.*,alarmRules.*.*,emailReceivers)',
    () => {
      if (stateIsReadonly.value) lazySaveAlarmConfig()
    },
  )
  onFieldValueChange('*(permissions.*)', () => {
    lazySavePermissionsConfig()
  })
}

function saveAlarmConfig() {
  const { values } = form

  if (!values?.id || !values?.name) {
    return
  }

  updateTaskAlarm({
    taskId: values.id,
    alarmSettings: values.alarmSettings,
    alarmRules: values.alarmRules,
    emailReceivers: values.emailReceivers,
  })
}

function savePermissionsConfig() {
  if (!form.values?.id) {
    return
  }
  const filter = {
    dataId: form.values?.id,
    dataType: 'Task',
    actions:
      form.values.permissions?.map((t: any) => {
        return {
          type: 'Role',
          typeId: t.roleId,
          actions: t.checked || [],
        }
      }) || [],
  }
  postPermissions(filter)
}

async function getRolePermissions() {
  const filter = {
    dataType: 'Task',
    dataId: form.values.id,
  }
  const data = await getPermissions(filter)
  dataflowStore.dataflow.permissions =
    data?.map((t: any) => ({
      checked: t.actions,
      roleId: t.typeId,
    })) || []
}

// Watchers
watch(stateIsReadonly, (v) => {
  form.setState({ disabled: v })
  if (v) {
    form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
      disabled: true,
    })
  }
})

watch(
  accessNodeProcessIdArr,
  (arr) => {
    const size = arr.length
    if (size >= 1) {
      let currentId = form.values.accessNodeProcessId
      currentId = currentId && arr.includes(currentId) ? currentId : arr[0]

      dataflowStore.dataflow.accessNodeType =
        scope.$agentMap[currentId]?.accessNodeType ||
        'MANUALLY_SPECIFIED_BY_THE_USER'
      dataflowStore.dataflow.accessNodeProcessId = currentId

      if (
        form.values.accessNodeType ===
        'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
      ) {
        const nodeIds = accessNodeProcessIdMap.value[currentId]
        let priorityProcessId = null

        nodeIds.some((id) => {
          const node = scope.findNodeById(id)
          if (node && node.attrs.priorityProcessId) {
            priorityProcessId = node.attrs.priorityProcessId
            return true
          }
          return false
        })

        dataflowStore.dataflow.priorityProcessId = priorityProcessId
      }
    }
    if (!stateIsReadonly.value) {
      form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
        disabled: size === 1,
      })
    }
  },
  { deep: true, immediate: true },
)

watch(
  accessNodeProcessList,
  (dataSource = []) => {
    form.setFieldState('accessNodeProcessId', {
      dataSource,
    })
  },
  { deep: true, immediate: true },
)

const syncPointsCache: Record<string, any> = {}

watch(
  sourceNodes,
  () => {
    const timeZone = systemTimeZone.value

    if (dataflowStore.dataflow.syncPoints?.length) {
      dataflowStore.dataflow.syncPoints.forEach((point: any) => {
        if (point.nodeId) {
          syncPointsCache[point.nodeId] = point
        }
      })
    }

    const syncPoints = sourceNodes.value.map((item: any) => {
      const old = syncPointsCache[item.nodeId]
      const point = {
        ...item,
        timeZone,
        pointType: 'current',
        dateTime: '',
        isStreamOffset: false,
      }
      if (old && !item.hiddenPointType) {
        Object.assign(point, {
          pointType: old.pointType,
          dateTime: old.dateTime,
          isStreamOffset: old.isStreamOffset,
          streamOffsetString: old.streamOffsetString,
        })
      }
      return point
    })

    dataflowStore.dataflow.syncPoints = syncPoints
  },
  { immediate: true },
)

watch(
  showDoubleActive,
  (val) => {
    form.setFieldState('doubleActive', {
      visible: formScope.hasFeature('TwoWaySync') && val,
    })
  },
  { immediate: true },
)

// 监听源节点
// 源节点上的某些能力属性联动到任务设置
watch(
  () => sourceNodes.value.length,
  () => {
    const showAutoIncrementalBatchSize = sourceNodes.value.some(
      ({ nodeId }: any) => {
        const node = scope.findNodeById(nodeId)

        return dataflowStore.hasCapability(
          node,
          'stream_read_one_by_one_function',
        )
      },
    )

    form.setFieldState('autoIncrementalBatchSize', {
      visible: showAutoIncrementalBatchSize,
    })
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    loadEmailReceivers()

    // form.setEffects(useEffects)

    if (isDaas) {
      form.setFieldState('tab4', {
        disabled: !buttonShowMap.Edit,
      })
    }

    // loadAlarmChannels()
  })
})

// Initialize
form.setState({ disabled: dataflowStore.stateIsReadonly })
getRolePermissions()

// Schema
const schema = {
  type: 'object',
  properties: {
    tabs: {
      type: 'void',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        class: 'config-tabs-decorator',
      },
      'x-component': 'FormTab',
      'x-component-props': {
        class: 'config-tabs',
        formTab: '{{formTab}}',
      },
      'x-reactions': import.meta.env.VUE_APP_HIDE_TASK_SCHEMA
        ? {
            target: import.meta.env.VUE_APP_HIDE_TASK_SCHEMA,
            fulfill: {
              state: {
                display: 'none',
              },
            },
          }
        : undefined,
      properties: {
        tab1: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            label: t('packages_dag_task_stetting_basic_setting'),
          },
          properties: {
            layout: {
              type: 'void',
              properties: {
                // name: {
                //   title: t('public_task_name'), //任务名称
                //   type: 'string',
                //   required: true,
                //   'x-decorator': 'FormItem',
                //   'x-component': 'Input',
                //   'x-validator': `{{(value) => {
                //     return new Promise((resolve) => {
                //       checkName(value).then(data => {
                //         if(data === true) {
                //           resolve('${repeatNameMessage}')
                //         } else {
                //           resolve()
                //         }
                //       })
                //     })
                //   }}}`,
                // },
                type: {
                  title: t('packages_dag_task_setting_sync_type'),
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  default: 'initial_sync+cdc',
                  enum: [
                    {
                      label: t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
                      value: 'initial_sync+cdc',
                    },
                    {
                      label: t('public_task_type_initial_sync'), //全量
                      value: 'initial_sync',
                    },
                    {
                      label: t('public_task_type_cdc'), //增量
                      value: 'cdc',
                    },
                  ],
                },
                collapse: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'FormCollapse',
                  'x-component-props': {
                    expandIconPosition: 'left',
                    style: {
                      '--collapse-padding-primary': '0',
                    },
                  },
                  properties: {
                    tab1: {
                      type: 'void',
                      'x-component': 'FormCollapse.Item',
                      'x-component-props': {
                        title: t('packages_dag_task_stetting_most_setting'),
                      },
                      properties: {
                        skipErrorEvent: {
                          type: 'object',
                          'x-component': 'FormContent',
                          properties: {
                            errorMode: {
                              type: 'string',
                              title: t(
                                'packages_dag_migration_settingpanel_dangdanbiaotongbu',
                              ),
                              'x-decorator': 'FormItem',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: t('public_select_placeholder'),
                              },
                              default: 'Disable',
                              enum: [
                                {
                                  label: t(
                                    'packages_dag_migration_settingpanel_anzhaomorenzhong',
                                  ),
                                  value: 'Disable',
                                },
                                {
                                  label: t(
                                    'packages_dag_migration_settingpanel_tiaoguoyichangshi',
                                  ),
                                  value: 'SkipData',
                                },
                                {
                                  label: t(
                                    'packages_dag_SkipTableForMigrateSnapshot',
                                  ),
                                  value: 'SkipTableForMigrateSnapshot',
                                },
                              ],
                              'x-reactions': {
                                dependencies: ['type'],
                                fulfill: {
                                  schema: {
                                    'x-component-props.options': `{{options=$self.dataSource,$values.syncType === "migrate" && $deps[0] !== "cdc" ? options : options.filter(item => item.value !== "SkipTableForMigrateSnapshot")}}`,
                                  },
                                },
                              },
                            },
                            limitMode: {
                              type: 'string',
                              title: t(
                                'packages_dag_migration_settingpanel_renwutiaoguoshi',
                              ),
                              'x-decorator': 'FormItem',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: t('public_select_placeholder'),
                              },
                              default: 'SkipByLimit',
                              enum: [
                                // {
                                //   label: t('packages_dag_migration_settingpanel_zhidingtiaoguoce'),
                                //   value: 'Disable'
                                // },
                                {
                                  label: t(
                                    'packages_dag_migration_settingpanel_dangtiaoguoshijian2',
                                  ),
                                  value: 'SkipByRate',
                                },
                                {
                                  label: t(
                                    'packages_dag_migration_settingpanel_dangtiaoguoshijian',
                                  ),
                                  value: 'SkipByLimit',
                                },
                              ],
                              'x-reactions': {
                                dependencies: ['.errorMode'],
                                fulfill: {
                                  state: {
                                    display:
                                      '{{$deps[0] === "SkipData" ? "visible" : "hidden"}}',
                                  },
                                },
                              },
                            },
                            limitVoid: {
                              type: 'void',
                              'x-decorator': 'FormItem',
                              'x-component': 'Space',
                              properties: {
                                limit: {
                                  type: 'number',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    feedbackLayout: 'none',
                                    addonAfter: t(
                                      'packages_dag_migration_settingpanel_shirenwubaocuo',
                                    ),
                                  },
                                  'x-component': 'InputNumber',
                                  default: 1,
                                  'x-component-props': {
                                    precision: 0,
                                    min: 1,
                                  },
                                },
                              },
                              'x-reactions': {
                                dependencies: ['.errorMode', '.limitMode'],
                                fulfill: {
                                  state: {
                                    display:
                                      '{{$deps[0] === "SkipData" && $deps[1] === "SkipByLimit" ? "visible" : "hidden"}}',
                                  },
                                },
                              },
                            },
                            rateVoid: {
                              type: 'void',
                              'x-decorator': 'FormItem',
                              'x-component': 'Space',
                              properties: {
                                rate: {
                                  type: 'number',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    feedbackLayout: 'none',
                                    addonAfter: `% ${t('packages_dag_migration_settingpanel_shirenwubaocuo')}`,
                                  },
                                  'x-component': 'InputNumber',
                                  default: 1,
                                  'x-component-props': {
                                    precision: 0,
                                    min: 1,
                                    max: 100,
                                  },
                                },
                              },
                              'x-reactions': {
                                dependencies: ['.errorMode', '.limitMode'],
                                fulfill: {
                                  state: {
                                    display:
                                      '{{$deps[0] === "SkipData" && $deps[1] === "SkipByRate" ? "visible" : "hidden"}}',
                                  },
                                },
                              },
                            },
                          },
                        },
                        planStartDateFlag: {
                          title: t('packages_dag_task_setting_plan_start_date'), //计划时间
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-component': 'Switch',
                          default: false,
                          target: '*(syncPoints)',
                          fulfill: {
                            state: {
                              visible: '{{$self.value}}',
                            },
                          },
                        },
                        planStartDate: {
                          type: 'string',
                          'x-decorator': 'FormItem',
                          required: true,
                          'x-component': 'DatePicker',
                          'x-component-props': {
                            type: 'datetime',
                            align: 'right',
                            format: 'YYYY-MM-DD HH:mm:ss',
                            valueFormat: 'x',
                          },
                          'x-reactions': {
                            dependencies: ['planStartDateFlag'],
                            fulfill: {
                              state: {
                                display: '{{$deps[0] ? "visible" : "hidden"}}',
                              },
                            },
                          },
                        },
                        crontabExpressionFlag: {
                          //调度表达式
                          title: t(
                            'packages_dag_task_setting_crontabExpressionFlag',
                          ), //定期调度任务
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t('packages_dag_task_setting_cron_tip'),
                          },
                          'x-component': 'Switch',
                          default: false,
                          'x-reactions': {
                            dependencies: ['type'],
                            fulfill: {
                              state: {
                                display:
                                  '{{$deps[0] !== "cdc" ? "visible" : "hidden"}}',
                              },
                            },
                          },
                          'x-validator': `{{(value) => {
                                  if (!value || $isDaas) { return true }
                                  return new Promise((resolve) => {
                                    checkCrontabExpressionFlag(value).then(data => {
                                      if(data === false) {
                                        resolve('${checkCrontabExpressionFlagMessage}')
                                      } else {
                                        resolve()
                                      }
                                    })
                                  })
                                }}}`,
                        },
                        crontabExpression: {
                          type: 'string',
                          required: true,
                          'x-validator': {
                            cron: true,
                            message: t(
                              'packages_dag_migration_settingpanel_cronbiao',
                            ),
                          },
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: t(
                              'packages_dag_task_setting_cron_expression',
                            ),
                          },
                          description: t('packages_dag_task_setting_cron_tip'),
                          'x-reactions': {
                            dependencies: ['type', 'crontabExpressionFlag'],
                            fulfill: {
                              state: {
                                display:
                                  '{{$deps[0] !== "cdc" && $deps[1] ? "visible" : "hidden"}}',
                              },
                            },
                          },
                        },
                        syncPoints: {
                          title: t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
                          type: 'array',
                          default: [
                            {
                              type: 'current',
                              date: '',
                              isStreamOffset: false,
                              streamOffsetString: '',
                            },
                          ],
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_dag_task_setting_syncPoint_tip',
                            ),
                          },
                          'x-component': 'SyncPoints',
                          // 'x-decorator': 'FormItem',
                          'x-reactions': {
                            dependencies: ['type'],
                            fulfill: {
                              state: {
                                display:
                                  '{{$deps[0] === "cdc" ? "visible" : "hidden"}}',
                              },
                            },
                          },
                        },
                        syncPointsDescWrap: {
                          type: 'void',
                          'x-component': 'div',
                          'x-component-props': {
                            class: 'flex align-center gap-2 mt-1',
                          },
                          'x-reactions': {
                            dependencies: ['type'],
                            fulfill: {
                              state: {
                                visible:
                                  '{{$deps[0] === "cdc" && !!$values.currentEventTimestampLabel}}',
                              },
                            },
                          },
                          properties: {
                            syncPointsDesc: {
                              type: 'void',
                              'x-component': 'div',
                              'x-component-props': {
                                style: {
                                  color: '#909399',
                                },
                              },
                              'x-content': `{{'${t(
                                'packages_dag_task_setting_syncPoint_recent_increment',
                              )}: ' + $values.currentEventTimestampLabel}}`,
                            },
                            syncPointsDescBtn: {
                              type: 'void',
                              'x-component': 'Button',
                              'x-component-props': {
                                disabled: `{{$self.disabled}}`,
                                text: true,
                                type: 'primary',
                                onClick: '{{handleQuicklySyncPoints}}',
                              },
                              'x-content': t(
                                'packages_dag_task_setting_syncPoint_from_now',
                              ),
                            },
                          },
                        },

                        // isAutoCreateIndexS: {
                        //   title: t('packages_dag_task_setting_automatic_index'), //自动创建索引
                        //   type: 'boolean',
                        //   'x-decorator': 'FormItem',
                        //   'x-component': 'Switch',
                        //   default: true
                        // },
                        // isStopOnError: {
                        //   title: t('packages_dag_task_setting_stop_on_error'), //遇到错误停止
                        //   type: 'boolean',
                        //   default: true,
                        //   'x-decorator': 'FormItem',
                        //   'x-component': 'Switch'
                        // },
                        shareCdcEnable: {
                          title: t(
                            'packages_dag_connection_form_shared_mining',
                          ), //共享挖掘日志过滤
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_business_connection_form_shared_mining_tip',
                            ),
                          },
                          'x-component': 'Switch',
                          'x-reactions': {
                            dependencies: ['type'],
                            fulfill: {
                              state: {
                                visible:
                                  '{{hasFeature("shareCdc") && $deps[0] !== "initial_sync" && !lockedFeature.sharedMiningList}}', // 只有增量或全量+增量支持
                              },
                            },
                          },
                        },
                        enforceShareCdc: {
                          title: t(
                            'packages_dag_migration_settingpanel_danggongxiangwajue',
                          ),
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_dag_migration_settingpanel_danggongxiangwajuetooltip',
                            ),
                          },
                          'x-component': 'Select',
                          default: true,
                          enum: [
                            {
                              label: t(
                                'packages_dag_migration_settingpanel_renwuzhijiebao',
                              ),
                              value: true,
                            },
                            {
                              label: t(
                                'packages_dag_migration_settingpanel_zhuanweiputongC',
                              ),
                              value: false,
                            },
                          ],
                          'x-reactions': {
                            dependencies: ['shareCdcEnable'],
                            fulfill: {
                              state: {
                                visible: '{{!!$deps[0]}}',
                              },
                            },
                          },
                        },
                        dynamicAdjustMemoryUsage: {
                          title: t(
                            'packages_dag_dynamicAdjustMemoryUsage_title',
                          ),
                          type: 'boolean',
                          default: !isDaas,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_dag_dynamicAdjustMemoryUsage_tip',
                            ),
                          },
                          'x-component': 'Switch',
                        },
                        enableSyncMetricCollector: {
                          title: t(
                            'packages_dag_enableSyncMetricCollector_title',
                          ), // 同步指标收集
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_dag_enableSyncMetricCollector_tip',
                            ),
                          },
                          'x-component': 'Switch',
                        },
                        doubleActive: {
                          title: t('packages_dag_doubleActive'), // 双活
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t('packages_dag_doubleActive_tip'),
                          },
                          'x-component': 'Switch',
                        },
                        dataSaving: {
                          title: t('packages_dag_dataSaving'), // 数据保存
                          type: 'boolean',
                          default: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t('packages_dag_dataSaving_tip'),
                          },
                          'x-component': 'Switch',
                        },
                        autoIncrementalBatchSize: {
                          title: t('packages_dag_autoIncrementalBatchSize'),
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t(
                              'packages_dag_autoIncrementalBatchSize_tip',
                            ),
                          },
                          'x-component': 'Switch',
                        },
                        fileLog: {
                          title: t('packages_dag_fileLog'),
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: t('packages_dag_fileLog_tip'),
                          },
                          'x-component': 'Switch',
                        },
                        accessNodeType: {
                          type: 'string',
                          title: t('packages_dag_connection_form_access_node'),
                          default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          enum: [
                            {
                              label: t(
                                'packages_dag_connection_form_automatic',
                              ),
                              value: 'AUTOMATIC_PLATFORM_ALLOCATION',
                            },
                            {
                              label: t('packages_dag_connection_form_manual'),
                              value: 'MANUALLY_SPECIFIED_BY_THE_USER',
                            },
                            {
                              label: t(
                                'packages_business_connection_form_group',
                              ),
                              value:
                                'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
                            },
                          ],
                          'x-reactions': [
                            {
                              fulfill: {
                                state: {
                                  dataSource: `{{$isDaas ? $self.dataSource : $self.dataSource.slice(0,2)}}`,
                                },
                              },
                            },
                            {
                              target: 'accessNodeProcessId',
                              effects: ['onFieldInputValueChange'],
                              fulfill: {
                                state: {
                                  value: '',
                                  // '{{$target.value || (item = $target.dataSource.find(item => !item.disabled), item ? item.value:undefined)}}'
                                },
                              },
                            },
                          ],
                        },

                        agentWrap: {
                          type: 'void',
                          'x-component': 'Space',
                          'x-component-props': {
                            class: 'w-100 align-items-start',
                          },
                          'x-reactions': {
                            dependencies: ['.accessNodeType'],
                            fulfill: {
                              state: {
                                visible:
                                  "{{['MANUALLY_SPECIFIED_BY_THE_USER', 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'].includes($deps[0])}}",
                              },
                            },
                          },
                          properties: {
                            accessNodeProcessId: {
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                class: 'flex-1',
                              },
                              'x-component': 'Select',
                              'x-reactions': [
                                '{{getConnectionNameByAgent}}',
                                // 根据下拉数据判断是否存在已选的agent
                                {
                                  dependencies: [
                                    '.accessNodeType',
                                    '.accessNodeOption#dataSource',
                                  ],
                                  fulfill: {
                                    state: {
                                      title: `{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0] ? '${t(
                                        'packages_business_choose_agent_group',
                                      )}': '${t('packages_business_choose_agent')}'}}`,
                                    },
                                  },
                                },
                              ],
                            },
                            priorityProcessId: {
                              title: t('packages_business_priorityProcessId'),
                              type: 'string',
                              default: '',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                class: 'flex-1',
                              },
                              'x-component': 'Select',
                              'x-reactions': {
                                dependencies: [
                                  '.accessNodeType',
                                  '.accessNodeProcessId#dataSource',
                                  '.accessNodeProcessId',
                                ],
                                fulfill: {
                                  state: {
                                    visible:
                                      "{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0]}}",
                                  },
                                  run: `
                                          let children = []

                                          if ($deps[1] && $deps[2]) {
                                            const item = $deps[1].find(item => item.accessNodeType === $deps[0] && item.value === $deps[2])
                                            children = (item && item.children) || []
                                          }

                                          $self.dataSource = [
                                            {
                                              label:'${t('packages_business_connection_form_automatic')}',
                                              value: ''
                                            }
                                          ].concat(children)

                                          if ($self.value && !children.find(item => item.value === $self.value)) {
                                            $self.value = null
                                          }
                                        `,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tab3: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            class: 'h-auto',
            label: t('packages_dag_migration_configpanel_gaojingshezhi'),
            locked: import.meta.env.VUE_APP_MODE === 'community',
          },
          properties: {
            alarmSettings: {
              type: 'array',
              default: [
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_STATUS_ERROR',
                  sort: 1,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 1,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_FULL_COMPLETE',
                  sort: 3,
                  notify: ['SYSTEM'],
                  interval: 1,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_START',
                  sort: 4,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_DELAY',
                  sort: 6,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INSPECT_DIFFERENCE',
                  sort: 7,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_RETRY_WARN',
                  sort: 4,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 30,
                  unit: 'SECOND',
                },
              ],
            },
            alarmRules: {
              type: 'array',
              default: [
                {
                  key: 'TASK_INCREMENT_DELAY',
                  point: 60,
                  equalsFlag: 1,
                  ms: 60000,
                },
                {
                  key: 'TASK_RETRY_WARN',
                  point: 12,
                  equalsFlag: 0,
                  ms: 1000,
                  times: 10,
                },
              ],
            },
            'alarmSettings.0': {
              type: 'object',
              title: t('packages_dag_migration_alarmpanel_renwuyunxingchu'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                open: {
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`,
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },

            'alarmSettings.1': {
              type: 'object',
              title: t('packages_dag_migration_alarmpanel_renwuquanliangwan'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                open: {
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM"]))}}`,
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[1].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },

            'alarmSettings.2': {
              type: 'object',
              title: t('packages_dag_migration_alarmpanel_renwuzengliangkai'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                open: {
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM"]))}}`,
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[2].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },

            'alarmSettings.3': {
              type: 'object',
              title: t('packages_dag_migration_alarmpanel_renwuzengliangyan'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                open: {
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[3].notify.length && ($values.alarmSettings[3].notify=["SYSTEM"]))}}`,
                  },
                  'x-reactions': {
                    target: 'alarmRules.0.*',
                    fulfill: {
                      state: {
                        disabled: `{{!$self.value}}`,
                      },
                    },
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[3].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },
            'alarmRules.0': {
              type: 'object',
              'x-component': 'Space',
              'x-component-props': {
                class: 'mb-2',
              },
              'x-reactions': {
                dependencies: ['alarmSettings.3.open'],
                fulfill: {
                  state: {
                    display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                  },
                },
              },
              properties: {
                point: {
                  type: 'number',
                  'x-reactions': [
                    {
                      dependencies: ['._point'],
                      fulfill: {
                        state: {
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12): $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                pointPrefix: {
                  type: 'void',
                  'x-component': 'div',
                  'x-content': t('packages_dag_migration_alarmpanel_lianxu'),
                },
                _point: {
                  type: 'number',
                  'x-editable': true,
                  'x-component': 'InputNumber',
                  'x-component-props': {
                    min: 1,
                    precision: 0,
                    style: {
                      width: '100px',
                    },
                  },
                  'x-reactions': [
                    {
                      dependencies: ['.point'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 12) < 1 ? 1 : Math.ceil($deps[0] / 12) : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                pointSuffix: {
                  type: 'void',
                  'x-component': 'div',
                  'x-content': t('public_time_m'),
                },
                equalsFlag: {
                  type: 'number',
                  default: 1,
                  'x-editable': true,
                  'x-component': 'Select',
                  'x-component-props': {
                    style: {
                      width: '70px',
                    },
                  },
                  enum: [
                    {
                      label: '<=',
                      value: -1,
                    },
                    {
                      label: '>=',
                      value: 1,
                    },
                  ],
                },
                ms: {
                  type: 'number',
                  'x-reactions': [
                    {
                      dependencies: ['._ms'],
                      fulfill: {
                        state: {
                          value: `{{!isNaN($deps[0]) ? $deps[0] * 1000 : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                _ms: {
                  type: 'number',
                  'x-editable': true,
                  'x-component': 'InputNumber',
                  'x-component-props': {
                    min: 0,
                    style: {
                      width: '100px',
                    },
                  },
                  'x-reactions': [
                    {
                      dependencies: ['.ms'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? $deps[0] / 1000 : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                unit: {
                  type: 'void',
                  'x-component': 'div',
                  'x-content': 's',
                },
              },
            },
            'alarmSettings.4': {
              type: 'object',
              title: t('packages_dag_task_inspect_difference_alarm'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                key: {
                  type: 'string',
                  default: 'TASK_INSPECT_DIFFERENCE',
                  'x-editable': true,
                  'x-display': 'hidden',
                },
                open: {
                  title: t('packages_dag_task_inspect_difference_alarm'),
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[4].notify.length && ($values.alarmSettings[4].notify=["SYSTEM"]))}}`,
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[4].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },

            'alarmSettings.5': {
              type: 'object',
              title: t('packages_dag_task_retry_alert'),
              'x-decorator': 'FormItem',
              'x-component': 'div',
              'x-component-props': {
                class: 'flex align-center',
              },
              properties: {
                key: {
                  type: 'string',
                  default: 'TASK_RETRY_WARN',
                  'x-editable': true,
                  'x-display': 'hidden',
                },
                open: {
                  type: 'boolean',
                  default: true,
                  'x-editable': true,
                  'x-component': 'Switch',
                  'x-component-props': {
                    onChange: `{{val=>(val && !$values.alarmSettings[5].notify.length && ($values.alarmSettings[5].notify=["SYSTEM"]))}}`,
                  },
                  'x-reactions': {
                    target: 'alarmRules.0.*',
                    fulfill: {
                      state: {
                        disabled: `{{!$self.value}}`,
                      },
                    },
                  },
                },
                divider: {
                  type: 'void',
                  'x-component': 'Divider',
                  'x-component-props': {
                    direction: 'vertical',
                    class: 'mx-4',
                  },
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
                notify: {
                  type: 'array',
                  'x-component': 'Checkbox.Group',
                  'x-component-props': {
                    onChange: `{{val=>(!val.length && ($values.alarmSettings[5].open=false))}}`,
                  },
                  default: ['SYSTEM', 'EMAIL'],
                  enum: '{{$alarmChannels}}',
                  'x-editable': true,
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                      },
                    },
                  },
                },
              },
            },
            'alarmRules.1': {
              type: 'object',
              'x-component': 'Space',
              'x-component-props': {
                class: 'mb-2',
              },
              'x-reactions': {
                dependencies: ['alarmSettings.5.open'],
                fulfill: {
                  state: {
                    display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                  },
                },
              },
              properties: {
                key: {
                  type: 'string',
                  default: 'TASK_RETRY_WARN',
                  'x-editable': true,
                  'x-display': 'hidden',
                },
                times: {
                  type: 'number',
                  'x-component': RenderI18nT,
                  'x-component-props': {
                    keypath: 'packages_dag_task_retry_alert_desc',
                    tag: 'div',
                    class: 'flex align-center gap-2',
                  },
                },
              },
            },

            emailReceivers: {
              title: t('packages_dag_email_receivers'),
              type: 'array',
              'x-visible': `{{$isDaas}}`,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Select',
              'x-component-props': {
                multiple: true,
                filterable: true,
              },
              'x-content': {
                prefix: () => h(ElIcon, [h(User)]),
              },
            },
          },
        },
        tab4: {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            label: t(
              'packages_business_permissionse_settings_create_quanxianshezhi',
            ),
            locked: import.meta.env.VUE_APP_MODE === 'community',
          },
          properties: {
            permissions: {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayTable',
              items: {
                type: 'object',
                properties: {
                  c1: {
                    type: 'void',
                    'x-component': 'ArrayTable.Column',
                    'x-component-props': {
                      title: t(
                        'packages_business_connections_permissionsdialog_shouquanjuese',
                      ),
                      align: 'center',
                      asterisk: false,
                      width: 200,
                    },
                    properties: {
                      roleId: {
                        type: 'string',
                        loading: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        'x-component-props': {
                          filterable: true,
                        },
                        'x-reactions': [
                          `{{useAsyncDataSource(loadRoleList, 'dataSource', $values.permissions)}}`,
                        ],
                      },
                    },
                  },
                  c2: {
                    type: 'void',
                    'x-component': 'ArrayTable.Column',
                    'x-component-props': {
                      title: t(
                        'packages_business_connections_permissionsdialog_gongnengquanxian',
                      ),
                      align: 'center',
                      asterisk: false,
                    },
                    properties: {
                      checked: {
                        type: 'array',
                        'x-decorator': 'FormItem',
                        'x-component': 'Checkbox.Group',
                        'x-component-props': {
                          class: 'inline-flex flex-wrap',
                          onChange: `{{ () => !!$self.value.length && !$self.value.includes('View') && $self.value.unshift('View') }}`,
                        },
                        enum: [
                          {
                            label: t('public_button_check'),
                            value: 'View',
                            disabled: `{{ $self.value.length > 1 }}`,
                          },
                          {
                            label: t('public_button_edit'),
                            value: 'Edit',
                          },
                          {
                            label: t('public_button_delete'),
                            value: 'Delete',
                          },
                          {
                            label: t('public_button_reset'),
                            value: 'Reset',
                          },
                          {
                            label: t('public_button_start'),
                            value: 'Start',
                          },
                          {
                            label: t('public_button_stop'),
                            value: 'Stop',
                          },
                        ],
                      },
                    },
                  },
                  c3: {
                    type: 'void',
                    'x-component': 'ArrayTable.Column',
                    'x-component-props': {
                      width: 90,
                      title: t('public_operation'),
                      align: 'center',
                    },
                    properties: {
                      remove: {
                        type: 'void',
                        'x-component': 'ArrayTable.Remove',
                        'x-component-props': {
                          text: true,
                          type: 'primary',
                          onClick: `{{handleRemovePermissionsItem}}`,
                        },
                      },
                    },
                  },
                },
              },
              properties: {
                addition: {
                  type: 'void',
                  title: t(
                    'packages_business_connections_permissionsdialog_tianjiashouquan',
                  ),
                  'x-component': 'ArrayTable.Addition',
                },
              },
            },
          },
          'x-reactions': {
            fulfill: {
              state: {
                visible: '{{$isDaas}}',
              },
            },
          },
        },
      },
    },
  },
}

const validate = () => {
  form.validate()
}

const onNameInputChange = inject('onNameInputChange')
const onDescChange = (val: string) => {
  dataflowStore.dataflow.desc = val
  updateTaskInfo(dataflowStore.dataflow.id, dataflowStore.dataflow.name, val)
}

defineExpose({
  validate,
})
</script>

<template>
  <div
    class="bg-card rounded-2xl h-100 shadow-canvas flex-column node-panel overflow-y-auto"
    style="width: 600px; display: flex"
  >
    <div class="flex align-center px-4 pt-4 gap-1">
      <div
        class="flex align-center justify-center p-1.5 bg-gray-100 dark:bg-white/15 rounded-lg mr-1"
      >
        <el-icon size="16" color="var(--icon-n1)"
          ><i-lucide-settings
        /></el-icon>
      </div>
      <TextEditable
        v-model:value="dataflowName"
        :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
        max-width="260"
        hidden-icon
        :maxlength="200"
        @change="onNameInputChange"
      />
      <div class="flex-1" />
      <el-button text @click="handleClose">
        <template #icon>
          <i-lucide-x />
        </template>
      </el-button>
    </div>
    <div class="p-2 pb-0">
      <el-input
        v-model="dataflowDesc"
        class="desc-textarea"
        placeholder="添加描述..."
        type="textarea"
        :autosize="{ minRows: 1 }"
        size="small"
        @change="onDescChange"
      />
    </div>
    <div v-if="form" class="flex-1 min-h-0">
      <Form
        :colon="false"
        :shallow="false"
        layout="vertical"
        feedback-layout="terse"
        class-name="form-wrap"
        :form="form"
      >
        <SchemaField v-if="schema" :schema="schema" :scope="formScope" />
      </Form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  :deep(.el-tabs > .el-tabs__header .el-tabs__nav-wrap) {
    padding-left: 16px !important;
  }
}

.attr-panel {
  :deep(.attr-panel-body) {
    padding-top: 0;
  }

  :deep(.formily-element-plus-form-item-label label) {
    font-size: var(--font-base-title);
  }

  :deep(.el-collapse-item__header) {
    font-size: var(--font-base-title);
    font-weight: 500;
  }
}
</style>

<style scoped lang="scss">
.setting-panel__dateTimePicker {
  .el-picker-panel__footer {
    .el-button--text {
      display: none;
    }
  }
}
.text-editable-wrap {
  :deep(.text-editable) {
    font-size: 1rem;
    font-weight: 500;
    input {
      font-weight: 500;
    }
  }
}
.desc-textarea {
  :deep(.el-textarea__inner) {
    box-shadow: none;
    resize: none;
    caret-color: var(--el-color-primary);

    &:focus {
      box-shadow: 0px 1px 2px 0px #1018280d;
    }
  }
}
.node-panel {
  $tabHeight: 40px;
  :deep(.form-wrap) {
    &,
    > form,
    .config-tabs-decorator,
    .config-tabs-decorator .formily-element-plus-form-item-control,
    .config-tabs-decorator .formily-element-plus-form-item-control-content,
    .config-tabs {
      height: 100%;
    }
    .el-tabs.config-tabs {
      --el-tabs-header-height: 40px;
      --el-tabs-padding-left: 16px;

      > .el-tabs__header {
        margin-bottom: 0;
        // .el-tabs__nav-wrap {
        //   &::after {
        //     height: 1px;
        //   }
        // }

        // .el-tabs__item {
        //   //padding: 0 12px;
        //   line-height: $tabHeight;
        //   height: $tabHeight;
        //   font-weight: 400;
        // }
      }

      > .el-tabs__content {
        height: calc(100% - $tabHeight);
        padding: 0 16px;
        overflow: auto;
        .el-tab-pane {
          // height: 100%;
          display: contents;
        }
      }
    }
  }
}
</style>
