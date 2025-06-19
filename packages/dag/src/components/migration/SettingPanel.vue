<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import {
  createForm,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core'
import { action } from '@formily/reactive'
import { alarmApi, dataPermissionApi, taskApi, usersApi } from '@tap/api'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import i18n from '@tap/i18n'
import { getSettingByKey } from '@tap/shared/src/settings'
import { debounce } from 'lodash-es'
import { computed, h, inject, nextTick, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { FormTab } from '../../../../form'
import FormRender from '../FormRender.vue'

defineOptions({
  name: 'SettingPanel',
})

// Types
interface Props {
  settings: Record<string, any>
  scope: Record<string, any>
  buttonShowMap: Record<string, boolean>
}

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

// Props
const props = defineProps<Props>()

// Store
const store = useStore()

// Injections
const lockedFeature = inject('lockedFeature')

// State
const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const values = props.settings
const { id } = values

// Messages
const repeatNameMessage = i18n.t('packages_dag_task_form_error_name_duplicate')
const checkCrontabExpressionFlagMessage = i18n.t(
  'packages_dag_task_form_error_can_not_open_crontab_expression_flag',
)

// Handlers
const handleCheckName = debounce((resolve: Function, value: string) => {
  taskApi
    .checkName({
      name: value,
      id,
    })
    .then((data) => {
      resolve(data)
    })
}, 500)

const handleCheckCrontabExpressionFlag = debounce((resolve: Function) => {
  taskApi.checkCheckCloudTaskLimit(id).then((data) => {
    resolve(data)
  })
}, 500)

// Form Scope
const formScope: FormScope = {
  $alarmChannels: props.scope.$alarmChannels,
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

      const response = await usersApi.role({
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
      const node = store.state.dataflow.NodeMap[id]
      map[node.connectionId] = node.attrs.connectionName
    }

    const values = Object.values(map)

    field.setDescription(
      values.length
        ? `${i18n.t('packages_dag_agent_setting_from')}: ${values.join(', ')}`
        : '',
    )
  },
  handleQuicklySyncPoints: () => {
    const { currentEventTimestamp } = props.settings
    props.settings.syncPoints.forEach((point: any) => {
      point.pointType = 'localTZ'
      point.dateTime = currentEventTimestamp
    })
  },
}

// Computed
const stateIsReadonly = computed(
  () => store.getters['dataflow/stateIsReadonly'],
)
const allNodes = computed(() => store.getters['dataflow/allNodes'])

const dataNodes = computed(() => {
  return allNodes.value.filter(
    (item: any) => item.type === 'database' || item.type === 'table',
  )
})

const showDoubleActive = computed(() => {
  const map = store.state.dataflow.pdkDoubleActiveMap
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
  const agents = props.scope.$agents.filter(
    (item: any) => item.accessNodeType === props.settings.accessNodeType,
  )
  if (!accessNodeProcessIdArr.value.length) return agents
  return agents.filter(
    (item: any) => !!accessNodeProcessIdMap.value[item.value],
  )
})

const sourceNodes = computed(() => {
  return allNodes.value
    .filter((node: any) => node.$outputs.length && !node.$inputs.length)
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
  disabled: stateIsReadonly.value,
  values,
})

// Methods
const lazySaveAlarmConfig = debounce(saveAlarmConfig, 100)
const lazySavePermissionsConfig = debounce(savePermissionsConfig, 300)

function updateSettings(path: string, value: any) {
  const pathArr = path.split('.')
  let current = props.settings

  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i]
    if (!(key in current)) {
      current[key] = {}
    }
    current = current[key]
  }

  current[pathArr.at(-1)] = value
}

function loadEmailReceivers() {
  const str = getSettingByKey('email.receivers')
  const receivers = str ? str.split(',').filter(Boolean) : []
  let value = props.settings.emailReceivers || []
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

function useEffects() {
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

  alarmApi.updateTaskAlarm({
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
  dataPermissionApi.postPermissions(filter)
}

async function getRolePermissions() {
  const filter = {
    dataType: 'Task',
    dataId: form.values.id,
  }
  const data = await dataPermissionApi.permissions(filter)
  updateSettings(
    'permissions',
    data?.map((t: any) => ({
      checked: t.actions,
      roleId: t.typeId,
    })) || [],
  )
}

function syncFormWithSettings() {
  form.setValues(props.settings)
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
      let currentId = props.settings.accessNodeProcessId
      currentId = currentId && arr.includes(currentId) ? currentId : arr[0]

      updateSettings(
        'accessNodeType',
        props.scope.$agentMap[currentId]?.accessNodeType ||
          'MANUALLY_SPECIFIED_BY_THE_USER',
      )
      updateSettings('accessNodeProcessId', currentId)

      if (
        props.settings.accessNodeType ===
        'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
      ) {
        const nodeIds = accessNodeProcessIdMap.value[currentId]
        let priorityProcessId = null

        nodeIds.some((id) => {
          const node = props.scope.findNodeById(id)
          if (node && node.attrs.priorityProcessId) {
            priorityProcessId = node.attrs.priorityProcessId
            return true
          }
          return false
        })

        updateSettings('priorityProcessId', priorityProcessId)
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

watch(sourceNodes, () => {
  const timeZone = systemTimeZone.value
  const oldPoints = props.settings.syncPoints
  const oldPointsMap = oldPoints?.length
    ? oldPoints.reduce((map: Record<string, any>, point: any) => {
        if (point.nodeId) map[point.nodeId] = point
        return map
      }, {})
    : {}
  const syncPoints = sourceNodes.value.map((item: any) => {
    const old = oldPointsMap[item.nodeId]
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
  updateSettings('syncPoints', syncPoints)
})

watch(
  showDoubleActive,
  (val) => {
    form.setFieldState('doubleActive', {
      visible: formScope.hasFeature('TwoWaySync') && val,
    })
  },
  { immediate: true },
)

watch(
  () => props.settings,
  (newSettings) => {
    if (JSON.stringify(form.values) !== JSON.stringify(newSettings)) {
      syncFormWithSettings()
    }
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  nextTick(() => {
    loadEmailReceivers()

    form.setEffects(useEffects)

    if (isDaas) {
      form.setFieldState('tab4', {
        disabled: !props.buttonShowMap.Edit,
      })
    }

    // loadAlarmChannels()
  })
})

// Initialize
form.setState({ disabled: stateIsReadonly.value })
getRolePermissions()

// Add form effects
form.addEffects('settingsSync', () => {
  onFieldValueChange('*', (field) => {
    if (field.path && field.path.length > 0) {
      const path = field.path.toString()
      updateSettings(path, field.value)
    }
  })
})

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
            label: i18n.t('packages_dag_task_stetting_basic_setting'),
          },
          properties: {
            layout: {
              type: 'void',
              properties: {
                name: {
                  title: i18n.t('public_task_name'), //任务名称
                  type: 'string',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-validator': `{{(value) => {
                    return new Promise((resolve) => {
                      checkName(value).then(data => {
                        if(data === true) {
                          resolve('${repeatNameMessage}')
                        } else {
                          resolve()
                        }
                      })
                    })
                  }}}`,
                },
                type: {
                  title: i18n.t('packages_dag_task_setting_sync_type'),
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  default: 'initial_sync+cdc',
                  enum: [
                    {
                      label: i18n.t(
                        'packages_dag_task_setting_initial_sync_cdc',
                      ), //全量+增量
                      value: 'initial_sync+cdc',
                    },
                    {
                      label: i18n.t('public_task_type_initial_sync'), //全量
                      value: 'initial_sync',
                    },
                    {
                      label: i18n.t('public_task_type_cdc'), //增量
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
                        title: i18n.t(
                          'packages_dag_task_stetting_most_setting',
                        ),
                      },
                      properties: {
                        skipErrorEvent: {
                          type: 'object',
                          'x-component': 'FormContent',
                          properties: {
                            errorMode: {
                              type: 'string',
                              title: i18n.t(
                                'packages_dag_migration_settingpanel_dangdanbiaotongbu',
                              ),
                              'x-decorator': 'FormItem',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: i18n.t(
                                  'public_select_placeholder',
                                ),
                              },
                              default: 'Disable',
                              enum: [
                                // {
                                //   label: '直接跳过异常的表，任务继续运行 ',
                                //   value: 'SkipTable'
                                // },
                                {
                                  label: i18n.t(
                                    'packages_dag_migration_settingpanel_anzhaomorenzhong',
                                  ),
                                  value: 'Disable',
                                },
                                {
                                  label: i18n.t(
                                    'packages_dag_migration_settingpanel_tiaoguoyichangshi',
                                  ),
                                  value: 'SkipData',
                                },
                              ],
                            },
                            limitMode: {
                              type: 'string',
                              title: i18n.t(
                                'packages_dag_migration_settingpanel_renwutiaoguoshi',
                              ),
                              'x-decorator': 'FormItem',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: i18n.t(
                                  'public_select_placeholder',
                                ),
                              },
                              default: 'SkipByLimit',
                              enum: [
                                // {
                                //   label: i18n.t('packages_dag_migration_settingpanel_zhidingtiaoguoce'),
                                //   value: 'Disable'
                                // },
                                {
                                  label: i18n.t(
                                    'packages_dag_migration_settingpanel_dangtiaoguoshijian2',
                                  ),
                                  value: 'SkipByRate',
                                },
                                {
                                  label: i18n.t(
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
                                    addonAfter: i18n.t(
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
                                    addonAfter: `% ${i18n.t('packages_dag_migration_settingpanel_shirenwubaocuo')}`,
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
                          title: i18n.t(
                            'packages_dag_task_setting_plan_start_date',
                          ), //计划时间
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
                            valueFormat: 'timestamp',
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
                          title: i18n.t(
                            'packages_dag_task_setting_crontabExpressionFlag',
                          ), //定期调度任务
                          type: 'boolean',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
                              'packages_dag_task_setting_cron_tip',
                            ),
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
                            message: i18n.t(
                              'packages_dag_migration_settingpanel_cronbiao',
                            ),
                          },
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: i18n.t(
                              'packages_dag_task_setting_cron_expression',
                            ),
                          },
                          description: i18n.t(
                            'packages_dag_task_setting_cron_tip',
                          ),
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
                          title: i18n.t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
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
                            tooltip: i18n.t(
                              'packages_dag_task_setting_syncPoint_tip',
                            ),
                          },
                          'x-component': 'SyncPoints',
                          'x-decorator': 'FormItem',
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
                              'x-content': `{{'${i18n.t(
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
                              'x-content': i18n.t(
                                'packages_dag_task_setting_syncPoint_from_now',
                              ),
                            },
                          },
                        },

                        // isAutoCreateIndexS: {
                        //   title: i18n.t('packages_dag_task_setting_automatic_index'), //自动创建索引
                        //   type: 'boolean',
                        //   'x-decorator': 'FormItem',
                        //   'x-component': 'Switch',
                        //   default: true
                        // },
                        // isStopOnError: {
                        //   title: i18n.t('packages_dag_task_setting_stop_on_error'), //遇到错误停止
                        //   type: 'boolean',
                        //   default: true,
                        //   'x-decorator': 'FormItem',
                        //   'x-component': 'Switch'
                        // },
                        shareCdcEnable: {
                          title: i18n.t(
                            'packages_dag_connection_form_shared_mining',
                          ), //共享挖掘日志过滤
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
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
                          title: i18n.t(
                            'packages_dag_migration_settingpanel_danggongxiangwajue',
                          ),
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
                              'packages_dag_migration_settingpanel_danggongxiangwajuetooltip',
                            ),
                          },
                          'x-component': 'Select',
                          default: true,
                          enum: [
                            {
                              label: i18n.t(
                                'packages_dag_migration_settingpanel_renwuzhijiebao',
                              ),
                              value: true,
                            },
                            {
                              label: i18n.t(
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
                          title: i18n.t(
                            'packages_dag_dynamicAdjustMemoryUsage_title',
                          ),
                          type: 'boolean',
                          default: !isDaas,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
                              'packages_dag_dynamicAdjustMemoryUsage_tip',
                            ),
                          },
                          'x-component': 'Switch',
                        },
                        isAutoInspect: {
                          title: i18n.t('packages_dag_task_list_verify'),
                          type: 'boolean',
                          default: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
                              'packages_dag_migration_settingpanel_dangrenwufuhe',
                            ),
                          },
                          'x-component': 'Switch',
                          'x-reactions': {
                            fulfill: {
                              state: {
                                visible: '{{$values.syncType === "migrate"}}',
                              },
                            },
                          },
                        },
                        enableSyncMetricCollector: {
                          title: i18n.t(
                            'packages_dag_enableSyncMetricCollector_title',
                          ), // 同步指标收集
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t(
                              'packages_dag_enableSyncMetricCollector_tip',
                            ),
                          },
                          'x-component': 'Switch',
                        },
                        doubleActive: {
                          title: i18n.t('packages_dag_doubleActive'), // 双活
                          type: 'boolean',
                          default: false,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            tooltip: i18n.t('packages_dag_doubleActive_tip'),
                          },
                          'x-component': 'Switch',
                        },
                        accessNodeType: {
                          type: 'string',
                          title: i18n.t(
                            'packages_dag_connection_form_access_node',
                          ),
                          default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                          'x-decorator': 'FormItem',
                          'x-component': 'Select',
                          enum: [
                            {
                              label: i18n.t(
                                'packages_dag_connection_form_automatic',
                              ),
                              value: 'AUTOMATIC_PLATFORM_ALLOCATION',
                            },
                            {
                              label: i18n.t(
                                'packages_dag_connection_form_manual',
                              ),
                              value: 'MANUALLY_SPECIFIED_BY_THE_USER',
                            },
                            {
                              label: i18n.t(
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
                                      title: `{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0] ? '${i18n.t(
                                        'packages_business_choose_agent_group',
                                      )}': '${i18n.t('packages_business_choose_agent')}'}}`,
                                    },
                                  },
                                },
                              ],
                            },
                            priorityProcessId: {
                              title: i18n.t(
                                'packages_business_priorityProcessId',
                              ),
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
                                            children = $deps[1].find(item => item.accessNodeType === $deps[0] && item.value === $deps[2]).children || []
                                          }

                                          $self.dataSource = [
                                            {
                                              label:'${i18n.t('packages_business_connection_form_automatic')}',
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
            label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi'),
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
              ],
            },
            'alarmSettings.0': {
              type: 'object',
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuyunxingchu',
              ),
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
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuquanliangwan',
              ),
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
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuzengliangkai',
              ),
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
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuzengliangyan',
              ),
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
                _point: {
                  title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                  type: 'number',
                  'x-editable': true,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'horizontal',
                  },
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
                equalsFlag: {
                  title: i18n.t('public_time_m'),
                  type: 'number',
                  default: 1,
                  'x-editable': true,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'horizontal',
                  },
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
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000) : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                _ms: {
                  title: '',
                  type: 'number',
                  'x-editable': true,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'horizontal',
                  },
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
                      dependencies: ['.ms'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 1000) < 1 ? 1 : Math.ceil($deps[0] / 1000) : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                unit: {
                  title: 's',
                  type: 'void',
                  default: 0,
                  'x-editable': true,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'horizontal',
                  },
                },
              },
            },
            'alarmSettings.4': {
              type: 'object',
              title: i18n.t('packages_dag_task_inspect_difference_alarm'),
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
                  title: i18n.t('packages_dag_task_inspect_difference_alarm'),
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
            emailReceivers: {
              title: i18n.t('packages_dag_email_receivers'),
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
            label: i18n.t(
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
                      title: i18n.t(
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
                      title: i18n.t(
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
                            label: i18n.t('public_button_check'),
                            value: 'View',
                            disabled: `{{ $self.value.length > 1 }}`,
                          },
                          {
                            label: i18n.t('public_button_edit'),
                            value: 'Edit',
                          },
                          {
                            label: i18n.t('public_button_delete'),
                            value: 'Delete',
                          },
                          {
                            label: i18n.t('public_button_reset'),
                            value: 'Reset',
                          },
                          {
                            label: i18n.t('public_button_start'),
                            value: 'Start',
                          },
                          {
                            label: i18n.t('public_button_stop'),
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
                      title: i18n.t('public_operation'),
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
                  title: i18n.t(
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

defineExpose({
  validate,
})
</script>

<template>
  <FormRender
    class="setting-panel"
    :form="form"
    :schema="schema"
    :scope="formScope"
  />
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
    font-size: $fontBaseTitle;
  }

  :deep(.el-collapse-item__header) {
    font-size: $fontBaseTitle;
    font-weight: 500;
  }
}
</style>

<style lang="scss">
.setting-panel__dateTimePicker {
  .el-picker-panel__footer {
    .el-button--text {
      display: none;
    }
  }
}
</style>
