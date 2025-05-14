<script>
import {
  createForm,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core'

import { action } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { alarmApi, dataPermissionApi, taskApi, usersApi } from '@tap/api'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'
import { mapGetters } from 'vuex'
import { FormTab } from '../../../../form'
import FormRender from '../FormRender'

export default observer({
  name: 'SettingPanel',
  inject: ['lockedFeature', 'openLocked'],
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object,
    buttonShowMap: Object,
  },

  data() {
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    const values = this.settings
    const { id } = values
    const repeatNameMessage = this.$t(
      'packages_dag_task_form_error_name_duplicate',
    )
    const checkCrontabExpressionFlagMessage = this.$t(
      'packages_dag_task_form_error_can_not_open_crontab_expression_flag',
    )
    const handleCheckName = debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value,
          id,
        })
        .then((data) => {
          resolve(data)
        })
    }, 500)
    const handleCheckCrontabExpressionFlag = debounce(function (
      resolve,
      value,
    ) {
      taskApi.checkCheckCloudTaskLimit(id).then((data) => {
        resolve(data)
      })
    }, 500)
    return {
      isDaas,
      formScope: {
        lockedFeature: this.lockedFeature,
        hasFeature: (feature) => {
          return !isDaas || this.$store.getters['feature/hasFeature']?.(feature)
        },
        getPickerOptionsBeforeTime,
        $isDaas: isDaas, //区分云版、企业版
        formTab: FormTab.createFormTab(),
        checkName: (value) => {
          return new Promise((resolve) => {
            handleCheckName(resolve, value)
          })
        },
        checkCrontabExpressionFlag: (value) => {
          return new Promise((resolve) => {
            handleCheckCrontabExpressionFlag(resolve, value)
          })
        },
        useAsyncOptions: (service, ...serviceParams) => {
          return (field) => {
            field.loading = true
            service(...serviceParams).then(
              action.bound((data) => {
                field.dataSource = data
                field.loading = false
              }),
            )
          }
        },

        useAsyncDataSource: (
          service,
          fieldName = 'dataSource',
          ...serviceParams
        ) => {
          return (field) => {
            field.loading = true
            service({ field }, ...serviceParams).then(
              action.bound((data) => {
                if (fieldName === 'value') {
                  field.setValue(data)
                } else field[fieldName] = data
                field.loading = false
              }),
            )
          }
        },

        async loadAlarmChannels() {
          const channels = await alarmApi.channels()
          const MAP = {
            system: {
              label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'),
              value: 'SYSTEM',
            },
            email: {
              label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'),
              value: 'EMAIL',
            },
          }
          const options = []
          if (!isDaas) {
            const isOpenid = window.__USER_INFO__?.openid
            Object.assign(MAP, {
              wechat: {
                label: i18n.t('packages_business_notify_webchat_notification'),
                value: 'WECHAT',
                disabled: !isOpenid,
              },
              sms: {
                label: i18n.t('packages_business_notify_sms_notification'),
                value: 'SMS',
              },
            })
          }

          for (const channel of channels) {
            const option = MAP[channel.type]

            if (!option) continue

            options.push(option)
          }

          return options
        },

        async loadRoleList(field, val) {
          try {
            const filter = {
              limit: 1000,
            }

            const usedId = val?.map((t) => t.roleId) || []

            const { items = [] } = await usersApi.role({
              filter: JSON.stringify(filter),
            })
            return items.map((item) => {
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
          this.savePermissionsConfig()
        },

        getConnectionNameByAgent: (field) => {
          // 消费收集下 field.dataSource 的依赖，当选项改变时重新执行该方法
          if (
            !field.value ||
            !field.dataSource?.length ||
            !this.accessNodeProcessIdMap[field.value]
          ) {
            field.setDescription('')
            return
          }

          const map = {}

          for (const id of this.accessNodeProcessIdMap[field.value]) {
            const node = this.$store.state.dataflow.NodeMap[id]
            map[node.connectionId] = node.attrs.connectionName
          }

          const values = Object.values(map)

          field.setDescription(
            values.length
              ? `${this.$t('packages_dag_agent_setting_from')}: ${values.join(', ')}`
              : '',
          )
        },

        handleQuicklySyncPoints: () => {
          const { currentEventTimestamp } = this.settings
          this.settings.syncPoints.forEach((point) => {
            point.pointType = 'localTZ' // 用户自定义时间点
            point.dateTime = currentEventTimestamp
          })
        },

        loadEmailReceivers: (field) => {
          const str = window.getSettingByKey('email.receivers')
          const receivers = str ? str.split(',').filter(Boolean) : []

          // 过滤掉不在可选列表中的接收人
          const size = field.value.length
          if (size) {
            const filter = field.value.filter((email) =>
              receivers.includes(email),
            )

            if (size !== filter.length) {
              field.form.setValuesIn(field.path, [...filter])
            }
          }

          field.setInitialValue([...receivers])
          field.dataSource = receivers.map((receiver) => {
            return {
              label: receiver,
              value: receiver,
            }
          })
        },
      },

      schema: {
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
                        title: this.$t('public_task_name'), //任务名称
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
                        title: this.$t('packages_dag_task_setting_sync_type'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        default: 'initial_sync+cdc',
                        enum: [
                          {
                            label: this.$t(
                              'packages_dag_task_setting_initial_sync_cdc',
                            ), //全量+增量
                            value: 'initial_sync+cdc',
                          },
                          {
                            label: this.$t('public_task_type_initial_sync'), //全量
                            value: 'initial_sync',
                          },
                          {
                            label: this.$t('public_task_type_cdc'), //增量
                            value: 'cdc',
                          },
                        ],
                      },
                      collapse: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-component': 'FormCollapse',
                        properties: {
                          tab1: {
                            type: 'void',
                            'x-component': 'FormCollapse.Item',
                            'x-component-props': {
                              title: this.$t(
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
                                      dependencies: [
                                        '.errorMode',
                                        '.limitMode',
                                      ],
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
                                      dependencies: [
                                        '.errorMode',
                                        '.limitMode',
                                      ],
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
                                title: this.$t(
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
                                      display:
                                        '{{$deps[0] ? "visible" : "hidden"}}',
                                    },
                                  },
                                },
                              },
                              crontabExpressionFlag: {
                                //调度表达式
                                title: this.$t(
                                  'packages_dag_task_setting_crontabExpressionFlag',
                                ), //定期调度任务
                                type: 'boolean',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  tooltip: this.$t(
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
                                  placeholder: this.$t(
                                    'packages_dag_task_setting_cron_expression',
                                  ),
                                },
                                description: this.$t(
                                  'packages_dag_task_setting_cron_tip',
                                ),
                                'x-reactions': {
                                  dependencies: [
                                    'type',
                                    'crontabExpressionFlag',
                                  ],
                                  fulfill: {
                                    state: {
                                      display:
                                        '{{$deps[0] !== "cdc" && $deps[1] ? "visible" : "hidden"}}',
                                    },
                                  },
                                },
                              },
                              syncPoints: {
                                title: this.$t(
                                  'packages_dag_task_setting_sync_point',
                                ), //增量采集开始时刻
                                type: 'array',
                                default: [{ type: 'current', date: '' }],
                                'x-decorator-props': {
                                  tooltip: this.$t(
                                    'packages_dag_task_setting_syncPoint_tip',
                                  ),
                                  feedbackLayout: 'none',
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
                              //   title: this.$t('packages_dag_task_setting_automatic_index'), //自动创建索引
                              //   type: 'boolean',
                              //   'x-decorator': 'FormItem',
                              //   'x-component': 'Switch',
                              //   default: true
                              // },
                              // isStopOnError: {
                              //   title: this.$t('packages_dag_task_setting_stop_on_error'), //遇到错误停止
                              //   type: 'boolean',
                              //   default: true,
                              //   'x-decorator': 'FormItem',
                              //   'x-component': 'Switch'
                              // },
                              shareCdcEnable: {
                                title: this.$t(
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
                                title: this.$t(
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
                                title: this.$t('packages_dag_task_list_verify'),
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
                                      visible:
                                        '{{$values.syncType === "migrate"}}',
                                    },
                                  },
                                },
                              },
                              enableSyncMetricCollector: {
                                title: this.$t(
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
                                title: this.$t('packages_dag_doubleActive'), // 双活
                                type: 'boolean',
                                default: false,
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  tooltip: i18n.t(
                                    'packages_dag_doubleActive_tip',
                                  ),
                                },
                                'x-component': 'Switch',
                                'x-visible': '{{hasFeature("TwoWaySync")}}',
                              },
                              accessNodeType: {
                                type: 'string',
                                title: this.$t(
                                  'packages_dag_connection_form_access_node',
                                ),
                                default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                                'x-decorator': 'FormItem',
                                'x-component': 'Select',
                                enum: [
                                  {
                                    label: this.$t(
                                      'packages_dag_connection_form_automatic',
                                    ),
                                    value: 'AUTOMATIC_PLATFORM_ALLOCATION',
                                  },
                                  {
                                    label: this.$t(
                                      'packages_dag_connection_form_manual',
                                    ),
                                    value: 'MANUALLY_SPECIFIED_BY_THE_USER',
                                  },
                                  {
                                    label: this.$t(
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
                  class: 'test',
                  label: i18n.t(
                    'packages_dag_migration_configpanel_gaojingshezhi',
                  ),
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
                  'alarmSettings.0.open': {
                    title: i18n.t(
                      'packages_dag_migration_alarmpanel_renwuyunxingchu',
                    ),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`,
                    },
                  },
                  'alarmSettings.0.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-editable': true,
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
                  },
                  'alarmSettings.1.open': {
                    title: i18n.t(
                      'packages_dag_migration_alarmpanel_renwuquanliangwan',
                    ),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM"]))}}`,
                    },
                  },
                  'alarmSettings.1.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[1].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-editable': true,
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
                  },
                  'alarmSettings.2.open': {
                    title: i18n.t(
                      'packages_dag_migration_alarmpanel_renwuzengliangkai',
                    ),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM"]))}}`,
                    },
                  },
                  'alarmSettings.2.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[2].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-editable': true,
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
                  },
                  space: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      'alarmRules.0.point': {
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
                      'alarmRules.0._point': {
                        title: i18n.t(
                          'packages_dag_migration_alarmpanel_lianxu',
                        ),
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
                      'alarmRules.0.equalsFlag': {
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
                        'x-reactions': {
                          dependencies: ['.open'],
                          fulfill: {
                            state: {
                              disabled: `{{!$deps[0]}}`,
                            },
                          },
                        },
                      },
                      'alarmRules.0.ms': {
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
                      'alarmRules.0._ms': {
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
                  'alarmSettings.3.open': {
                    title: i18n.t(
                      'packages_dag_migration_alarmpanel_renwuzengliangyan',
                    ),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
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
                  'alarmSettings.3.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[3].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-editable': true,
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
                  },
                  'alarmSettings.4.open': {
                    title: i18n.t('packages_dag_task_inspect_difference_alarm'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[4].notify.length && ($values.alarmSettings[4].notify=["SYSTEM"]))}}`,
                    },
                  },
                  'alarmSettings.4.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[4].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-editable': true,
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
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
                    'x-reactions': isDaas
                      ? `{{loadEmailReceivers}}`
                      : undefined,
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
                              // default: ['SYSTEM', 'EMAIL'],
                              // 'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
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
      },

      form: createForm({
        disabled: this.stateIsReadonly,
        // effects: this.useEffects,
        values,
      }),
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes']),

    dataNodes() {
      return this.allNodes.filter(
        (item) => item.type === 'database' || item.type === 'table',
      )
    },

    showDoubleActive() {
      const map = this.$store.state.dataflow.pdkDoubleActiveMap
      return this.dataNodes.length
        ? this.dataNodes.every((node) => map[node.attrs.pdkHash])
        : false
    },

    accessNodeProcessIdMap() {
      return this.dataNodes.reduce((map, node) => {
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
    },

    accessNodeProcessIdArr() {
      return Object.keys(this.accessNodeProcessIdMap)
    },

    accessNodeProcessList() {
      const agents = this.scope.$agents.filter(
        (item) => item.accessNodeType === this.settings.accessNodeType,
      )
      if (!this.accessNodeProcessIdArr.length) return agents
      return agents.filter((item) => !!this.accessNodeProcessIdMap[item.value])
    },

    sourceNodes() {
      return this.allNodes
        .filter((node) => node.$outputs.length && !node.$inputs.length)
        .map((node) => ({
          nodeId: node.id,
          nodeName: node.name,
          hiddenPointType: node?.cdcMode === 'polling', //源节点开启了日志轮询则禁用增量采集时刻配置
          connectionId: node.connectionId,
          connectionName: node.attrs.connectionName,
        }))
    },

    systemTimeZone() {
      const timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = `+${-timeZone}`
      }
      return systemTimeZone
    },
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
      if (v) {
        // 监控模式禁用
        this.form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
          disabled: true,
        })
      }
    },

    accessNodeProcessIdArr: {
      deep: true,

      handler(arr) {
        const size = arr.length
        if (size >= 1) {
          let currentId = this.settings.accessNodeProcessId
          currentId = currentId && arr.includes(currentId) ? currentId : arr[0]
          this.settings.accessNodeType =
            this.scope.$agentMap[currentId]?.accessNodeType ||
            'MANUALLY_SPECIFIED_BY_THE_USER'
          this.settings.accessNodeProcessId = currentId

          if (
            this.settings.accessNodeType ===
            'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
          ) {
            const nodeIds = this.accessNodeProcessIdMap[currentId]
            let priorityProcessId = null

            nodeIds.some((id) => {
              const node = this.scope.findNodeById(id)
              if (node && node.attrs.priorityProcessId) {
                priorityProcessId = node.attrs.priorityProcessId
                return true
              }
            })

            this.settings.priorityProcessId = priorityProcessId
          }
        }
        if (!this.stateIsReadonly) {
          // 只在编辑模式下禁用或启用
          this.form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
            disabled: size === 1,
          })
        }
      },

      immediate: true,
    },

    accessNodeProcessList: {
      deep: true,

      handler(dataSource = []) {
        this.form.setFieldState('accessNodeProcessId', {
          dataSource,
        })
      },

      immediate: true,
    },

    sourceNodes(v) {
      const timeZone = this.systemTimeZone
      const oldPoints = this.settings.syncPoints
      const oldPointsMap = oldPoints?.length
        ? oldPoints.reduce((map, point) => {
            if (point.nodeId) map[point.nodeId] = point
            return map
          }, {})
        : {}
      const syncPoints = this.sourceNodes.map((item) => {
        const old = oldPointsMap[item.nodeId]
        const point = {
          ...item,
          timeZone,
          pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
          dateTime: '',
        }
        if (old && !item.hiddenPointType) {
          Object.assign(point, {
            pointType: old.pointType,
            dateTime: old.dateTime,
          })
        }
        return point
      })
      this.settings.syncPoints = syncPoints
    },

    // 控制双活是否可见
    showDoubleActive: {
      handler(val) {
        this.form.setFieldState('doubleActive', {
          visible: this.formScope.hasFeature('TwoWaySync') && val,
        })
      },
      immediate: true,
    },

    settings: {
      handler(newSettings) {
        // Only update if different to avoid loops
        if (JSON.stringify(this.form.values) !== JSON.stringify(newSettings)) {
          this.syncFormWithSettings()
        }
      },
      deep: true,
    },
  },

  created() {
    this.form.setState({ disabled: this.stateIsReadonly })
    this.lazySaveAlarmConfig = debounce(this.saveAlarmConfig, 100)
    this.lazySavePermissionsConfig = debounce(this.savePermissionsConfig, 300)

    this.getRolePermissions()

    // FIXME
    this.form.addEffects('settingsSync', () => {
      onFieldValueChange('*', (field) => {
        if (field.path && field.path.length > 0) {
          // Get the path as string (e.g., "name" or "syncPoints.0.dateTime")
          const path = field.path.toString()
          const pathArr = path.split('.')

          // Skip if the value is the same to avoid infinite loops
          if (path in this.settings) {
            const currentValue = this.settings[path]
            if (JSON.stringify(currentValue) !== JSON.stringify(field.value)) {
              this.settings[path] = field.value
            }
          } else {
            // For nested paths, use property access to update deeply nested values
            let obj = this.settings
            const parts = pathArr.slice()
            const lastPart = parts.pop()

            for (const part of parts) {
              if (!(part in obj)) {
                obj[part] = {}
              }
              obj = obj[part]
            }

            if (JSON.stringify(obj[lastPart]) !== JSON.stringify(field.value)) {
              obj[lastPart] = field.value
            }
          }
        }
      })
    })
  },

  mounted() {
    this.$nextTick(() => {
      this.form.setEffects(this.useEffects)
      // 权限设置，禁用单独控制
      if (this.isDaas) {
        this.form.setFieldState('tab4', {
          disabled: !this.buttonShowMap.Edit,
        })
      }
    })
  },

  methods: {
    // 绑定表单事件
    useEffects() {
      onFieldInputValueChange(
        '*(alarmSettings.*.*,alarmRules.*.*,emailReceivers)',
        (field, form) => {
          if (this.stateIsReadonly) this.lazySaveAlarmConfig()
        },
      )
      // 权限设置修改了
      onFieldValueChange('*(permissions.*)', (field, form) => {
        this.lazySavePermissionsConfig()
      })
    },

    saveAlarmConfig() {
      const { values } = this.form

      if (!values?.id || !values?.name) {
        return
      }

      alarmApi.updateTaskAlarm({
        taskId: values.id,
        alarmSettings: values.alarmSettings,
        alarmRules: values.alarmRules,
        emailReceivers: values.emailReceivers,
      })
    },

    savePermissionsConfig() {
      if (!this.form.values?.id) {
        return
      }
      const filter = {
        dataId: this.form.values?.id,
        dataType: 'Task',
        actions:
          this.form.values.permissions?.map((t) => {
            return {
              type: 'Role',
              typeId: t.roleId,
              actions: t.checked || [],
            }
          }) || [],
      }
      dataPermissionApi.postPermissions(filter)
    },

    getRolePermissions() {
      const filter = {
        dataType: 'Task',
        dataId: this.form.values.id,
      }
      dataPermissionApi.permissions(filter).then((data) => {
        this.settings.permissions =
          data?.map((t) => {
            return {
              checked: t.actions,
              roleId: t.typeId,
            }
          }) || []
      })
    },

    syncFormWithSettings() {
      this.form.setValues(this.settings)
    },
  },
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
