<template>
  <FormRender class="setting-panel" :form="form" :schema="schema" :scope="formScope" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters } from 'vuex'
import { createForm, onFieldValueChange, onFormInputChange, onFormValuesChange } from '@formily/core'
// import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'
import { debounce } from 'lodash'
import { alarmApi, taskApi } from '@tap/api'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { FormTab } from '../../../../form'
import { action } from '@formily/reactive'

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object
  },

  data() {
    const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
    let values = this.settings
    let repeatNameMessage = this.$t('packages_dag_task_form_error_name_duplicate')
    return {
      isDaas: isDaas,
      formScope: {
        getPickerOptionsBeforeTime,
        $isDaas: isDaas, //区分云版、企业版
        formTab: FormTab.createFormTab(),
        useAsyncOptions: (service, ...serviceParams) => {
          return field => {
            field.loading = true
            service(...serviceParams).then(
              action.bound(data => {
                field.dataSource = data
                field.loading = false
              })
            )
          }
        },

        async loadAlarmChannels() {
          const channels = await alarmApi.channels()
          const MAP = {
            system: { label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'), value: 'SYSTEM' },
            email: { label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'), value: 'EMAIL' }
          }
          const options = []
          if (!isDaas) {
            let isOpenid = window.__USER_INFO__?.openid
            Object.assign(MAP, {
              wechat: {
                label: i18n.t('packages_business_notify_webchat_notification'),
                value: 'WECHAT',
                disabled: !isOpenid
              },
              sms: { label: i18n.t('packages_business_notify_sms_notification'), value: 'SMS' }
            })
          }

          for (const channel of channels) {
            const option = MAP[channel.type]

            if (!option) continue

            options.push(option)
          }

          return options
        }
      },

      schema: {
        type: 'object',
        properties: {
          tabs: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              class: 'config-tabs-decorator'
            },
            'x-component': 'FormTab',
            'x-component-props': {
              class: 'config-tabs',
              formTab: '{{formTab}}'
            },
            properties: {
              tab1: {
                type: 'void',
                'x-component': 'FormTab.TabPane',
                'x-component-props': {
                  label: i18n.t('packages_dag_task_stetting_basic_setting')
                },
                properties: {
                  layout: {
                    type: 'void',
                    properties: {
                      name: {
                        title: this.$t('public_task_name'), //任务名称
                        type: 'string',
                        required: 'true',
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
                  }}}`
                      },
                      type: {
                        title: this.$t('packages_dag_task_setting_sync_type'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        default: 'initial_sync+cdc',
                        enum: [
                          {
                            label: this.$t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
                            value: 'initial_sync+cdc'
                          },
                          {
                            label: this.$t('public_task_type_initial_sync'), //全量
                            value: 'initial_sync'
                          },
                          {
                            label: this.$t('public_task_type_cdc'), //增量
                            value: 'cdc'
                          }
                        ]
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
                              title: this.$t('packages_dag_task_stetting_most_setting')
                            },
                            properties: {
                              skipErrorEvent: {
                                type: 'object',
                                'x-component': 'FormContent',
                                properties: {
                                  errorMode: {
                                    type: 'string',
                                    title: i18n.t('packages_dag_migration_settingpanel_dangdanbiaotongbu'),
                                    'x-decorator': 'FormItem',
                                    'x-component': 'Select',
                                    'x-component-props': {
                                      placeholder: i18n.t('public_select_placeholder')
                                    },
                                    default: 'Disable',
                                    enum: [
                                      // {
                                      //   label: '直接跳过异常的表，任务继续运行 ',
                                      //   value: 'SkipTable'
                                      // },
                                      {
                                        label: i18n.t('packages_dag_migration_settingpanel_anzhaomorenzhong'),
                                        value: 'Disable'
                                      },
                                      {
                                        label: i18n.t('packages_dag_migration_settingpanel_tiaoguoyichangshi'),
                                        value: 'SkipData'
                                      }
                                    ]
                                  },
                                  limitMode: {
                                    type: 'string',
                                    title: i18n.t('packages_dag_migration_settingpanel_renwutiaoguoshi'),
                                    'x-decorator': 'FormItem',
                                    'x-component': 'Select',
                                    'x-component-props': {
                                      placeholder: i18n.t('public_select_placeholder')
                                    },
                                    default: 'SkipByLimit',
                                    enum: [
                                      // {
                                      //   label: i18n.t('packages_dag_migration_settingpanel_zhidingtiaoguoce'),
                                      //   value: 'Disable'
                                      // },
                                      {
                                        label: i18n.t('packages_dag_migration_settingpanel_dangtiaoguoshijian2'),
                                        value: 'SkipByRate'
                                      },
                                      {
                                        label: i18n.t('packages_dag_migration_settingpanel_dangtiaoguoshijian'),
                                        value: 'SkipByLimit'
                                      }
                                    ],
                                    'x-reactions': {
                                      dependencies: ['.errorMode'],
                                      fulfill: {
                                        state: {
                                          display: '{{$deps[0] === "SkipData" ? "visible" : "hidden"}}'
                                        }
                                      }
                                    }
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
                                          addonAfter: i18n.t('packages_dag_migration_settingpanel_shirenwubaocuo')
                                        },
                                        'x-component': 'InputNumber',
                                        default: 1,
                                        'x-component-props': {
                                          precision: 0,
                                          min: 1
                                        }
                                      }
                                    },
                                    'x-reactions': {
                                      dependencies: ['.errorMode', '.limitMode'],
                                      fulfill: {
                                        state: {
                                          display:
                                            '{{$deps[0] === "SkipData" && $deps[1] === "SkipByLimit" ? "visible" : "hidden"}}'
                                        }
                                      }
                                    }
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
                                          addonAfter:
                                            '% ' + i18n.t('packages_dag_migration_settingpanel_shirenwubaocuo')
                                        },
                                        'x-component': 'InputNumber',
                                        default: 1,
                                        'x-component-props': {
                                          precision: 0,
                                          min: 1,
                                          max: 100
                                        }
                                      }
                                    },
                                    'x-reactions': {
                                      dependencies: ['.errorMode', '.limitMode'],
                                      fulfill: {
                                        state: {
                                          display:
                                            '{{$deps[0] === "SkipData" && $deps[1] === "SkipByRate" ? "visible" : "hidden"}}'
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              planStartDateFlag: {
                                title: this.$t('packages_dag_task_setting_plan_start_date'), //计划时间
                                type: 'boolean',
                                'x-decorator': 'FormItem',
                                'x-component': 'Switch',
                                default: false,
                                target: '*(syncPoints)',
                                fulfill: {
                                  state: {
                                    visible: '{{$self.value}}'
                                  }
                                }
                              },
                              planStartDate: {
                                type: 'string',
                                'x-decorator': 'FormItem',
                                required: 'true',
                                'x-component': 'DatePicker',
                                'x-component-props': {
                                  type: 'datetime',
                                  align: 'right',
                                  format: 'yyyy-MM-dd HH:mm:ss',
                                  valueFormat: 'timestamp'
                                },
                                'x-reactions': {
                                  dependencies: ['planStartDateFlag'],
                                  fulfill: {
                                    state: {
                                      display: '{{$deps[0] ? "visible" : "hidden"}}'
                                    }
                                  }
                                }
                              },
                              crontabExpressionFlag: {
                                //调度表达式
                                title: this.$t('packages_dag_task_setting_crontabExpressionFlag'), //定期调度任务
                                type: 'boolean',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  tooltip: this.$t('packages_dag_task_setting_cron_tip')
                                },
                                'x-component': 'Switch',
                                default: false,
                                'x-reactions': {
                                  dependencies: ['type'],
                                  fulfill: {
                                    state: {
                                      display: '{{$deps[0] === "initial_sync" ? "visible" : "hidden"}}'
                                    }
                                  }
                                }
                              },
                              crontabExpression: {
                                type: 'string',
                                required: 'true',
                                'x-validator': {
                                  cron: true,
                                  message: i18n.t('packages_dag_migration_settingpanel_cronbiao')
                                },
                                'x-decorator': 'FormItem',
                                'x-component': 'Input',
                                'x-component-props': {
                                  placeholder: this.$t('packages_dag_task_setting_cron_expression')
                                },
                                description: this.$t('packages_dag_task_setting_cron_tip'),
                                'x-reactions': {
                                  dependencies: ['type', 'crontabExpressionFlag'],
                                  fulfill: {
                                    state: {
                                      display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
                                    }
                                  }
                                }
                              },
                              syncPoints: {
                                title: this.$t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
                                type: 'array',
                                default: [{ type: 'current', date: '' }],
                                'x-decorator-props': {
                                  tooltip: this.$t('packages_dag_task_setting_syncPoint_tip')
                                },
                                'x-component': 'ArrayItems',
                                'x-decorator': 'FormItem',
                                'x-reactions': {
                                  dependencies: ['type'],
                                  fulfill: {
                                    state: {
                                      display: '{{$deps[0] === "cdc" ? "visible" : "hidden"}}'
                                    }
                                  }
                                },
                                items: {
                                  type: 'object',
                                  properties: {
                                    nodeName: {
                                      type: 'string',
                                      'x-component': 'PreviewText.Input',
                                      'x-reactions': {
                                        dependencies: ['.connectionName', '.connectionId'],
                                        fulfill: {
                                          schema: {
                                            'x-component-props.content': `{{$deps[0] + '('+ $self.value + ')'}}`
                                          },
                                          state: {
                                            display: '{{ $deps[1] ? "visible":"hidden"}}'
                                          }
                                        }
                                      }
                                    },
                                    hiddenPointType: {
                                      'x-display': 'hidden',
                                      type: 'boolean',
                                      'x-component': 'PreviewText.Input'
                                    },
                                    connectionId: {
                                      'x-display': 'hidden',
                                      type: 'string'
                                    },
                                    connectionName: {
                                      'x-display': 'hidden',
                                      type: 'string',
                                      'x-component': 'PreviewText.Input'
                                    },
                                    pointType: {
                                      type: 'string',
                                      'x-decorator': 'FormItem',
                                      'x-component': 'Select',
                                      'x-component-props': {
                                        placeholder: i18n.t('public_select_placeholder')
                                      },
                                      default: 'current',
                                      enum: [
                                        {
                                          label: this.$t('public_time_user_specified_time'),
                                          value: 'localTZ'
                                        },
                                        /*{
                                          label: this.$t('packages_dag_dataFlow_SyncInfo_connTZType'),
                                          value: 'connTZ'
                                        },*/
                                        {
                                          label: this.$t('public_time_current'),
                                          value: 'current'
                                        }
                                      ],
                                      'x-reactions': [
                                        {
                                          dependencies: ['.hiddenPointType'],
                                          fulfill: {
                                            state: {
                                              disabled: `{{$deps[0]}}`
                                            }
                                          }
                                        },
                                        {
                                          dependencies: ['.connectionId'],
                                          fulfill: {
                                            state: {
                                              display: '{{ $deps[0] ? "visible":"hidden"}}'
                                            }
                                          }
                                        }
                                      ]
                                    },
                                    dateTime: {
                                      type: 'string',
                                      required: 'true',
                                      'x-decorator': 'FormItem',
                                      'x-component': 'DatePicker',
                                      'x-component-props': {
                                        type: 'datetime',
                                        format: 'yyyy-MM-dd HH:mm:ss',
                                        valueFormat: 'timestamp',
                                        popperClass: 'setting-panel__dateTimePicker'
                                      },
                                      'x-reactions': [
                                        {
                                          dependencies: ['.pointType'],
                                          fulfill: {
                                            state: {
                                              visible: '{{$deps[0] !== "current"}}'
                                            }
                                          }
                                        },
                                        {
                                          dependencies: ['.pointType'],
                                          fulfill: {
                                            schema: {
                                              'x-component-props.pickerOptions': `{{$deps[0] === "localTZ" ? getPickerOptionsBeforeTime($self.value, Date.now()) : null}}`
                                            }
                                          }
                                        }
                                      ]
                                    }
                                  }
                                }
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
                                title: this.$t('packages_dag_connection_form_shared_mining'), //共享挖掘日志过滤
                                type: 'boolean',
                                default: false,
                                'x-decorator': 'FormItem',
                                'x-component': 'Switch',
                                'x-reactions': {
                                  dependencies: ['type'],
                                  fulfill: {
                                    state: {
                                      visible: '{{$deps[0] !== "initial_sync" && $isDaas}}' // 只有增量或全量+增量支持
                                    }
                                  }
                                }
                              },
                              enforceShareCdc: {
                                title: i18n.t('packages_dag_migration_settingpanel_danggongxiangwajue'),
                                type: 'string',
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  tooltip: i18n.t('packages_dag_migration_settingpanel_danggongxiangwajuetooltip')
                                },
                                'x-component': 'Select',
                                default: true,
                                enum: [
                                  {
                                    label: i18n.t('packages_dag_migration_settingpanel_renwuzhijiebao'),
                                    value: true
                                  },
                                  {
                                    label: i18n.t('packages_dag_migration_settingpanel_zhuanweiputongC'),
                                    value: false
                                  }
                                ],
                                'x-reactions': {
                                  dependencies: ['shareCdcEnable'],
                                  fulfill: {
                                    state: {
                                      visible: '{{!!$deps[0]}}'
                                    }
                                  }
                                }
                              },
                              isAutoInspect: {
                                title: this.$t('packages_dag_task_list_verify'),
                                type: 'boolean',
                                default: true,
                                'x-decorator': 'FormItem',
                                'x-decorator-props': {
                                  tooltip: i18n.t('packages_dag_migration_settingpanel_dangrenwufuhe')
                                },
                                'x-component': 'Switch',
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      visible: '{{$values.syncType === "migrate"}}'
                                    }
                                  }
                                }
                              },
                              accessNodeType: {
                                type: 'string',
                                title: this.$t('packages_dag_connection_form_access_node'),
                                default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                                'x-decorator': 'FormItem',
                                'x-component': 'Select',
                                enum: [
                                  {
                                    label: this.$t('packages_dag_connection_form_automatic'),
                                    value: 'AUTOMATIC_PLATFORM_ALLOCATION'
                                  },
                                  {
                                    label: this.$t('packages_dag_connection_form_manual'),
                                    value: 'MANUALLY_SPECIFIED_BY_THE_USER'
                                  }
                                ],
                                'x-reactions': [
                                  {
                                    target: 'accessNodeProcessId',
                                    fulfill: {
                                      state: { visible: "{{$self.value==='MANUALLY_SPECIFIED_BY_THE_USER'}}" }
                                    }
                                  },
                                  {
                                    target: 'accessNodeProcessId',
                                    effects: ['onFieldInputValueChange'],
                                    fulfill: {
                                      state: {
                                        value: '{{$target.value || $target.dataSource[0].value}}'
                                      }
                                    }
                                  }
                                ]
                              },
                              accessNodeProcessId: {
                                type: 'string',
                                'x-decorator': 'FormItem',
                                'x-component': 'Select'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              tab3: {
                type: 'void',
                'x-component': 'FormTab.TabPane',
                'x-component-props': {
                  label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi')
                },
                properties: {
                  alarmSettings: {
                    type: 'array',
                    default: [
                      {
                        type: 'TASK',
                        open: true,
                        key: 'TASK_STATUS_ERROR',
                        sort: 1,
                        notify: ['SYSTEM', 'EMAIL'],
                        interval: 1,
                        unit: 'SECOND'
                      },
                      {
                        type: 'TASK',
                        open: true,
                        key: 'TASK_FULL_COMPLETE',
                        sort: 3,
                        notify: ['SYSTEM'],
                        interval: 1,
                        unit: 'SECOND'
                      },
                      {
                        type: 'TASK',
                        open: true,
                        key: 'TASK_INCREMENT_START',
                        sort: 4,
                        notify: ['SYSTEM', 'EMAIL'],
                        interval: 300,
                        unit: 'SECOND'
                      },
                      {
                        type: 'TASK',
                        open: true,
                        key: 'TASK_INCREMENT_DELAY',
                        sort: 6,
                        notify: ['SYSTEM', 'EMAIL'],
                        interval: 300,
                        unit: 'SECOND'
                      },
                      {
                        type: 'TASK',
                        open: true,
                        key: 'TASK_REGULAR_SCHEDULING',
                        sort: 7,
                        notify: ['SYSTEM'],
                        interval: 300,
                        unit: 'SECOND'
                      }
                    ]
                  },
                  alarmRules: {
                    type: 'array',
                    default: [
                      {
                        key: 'TASK_INCREMENT_DELAY',
                        point: 60,
                        equalsFlag: 1,
                        ms: 60000,
                        _point: 5,
                        _ms: 60
                      },
                      {
                        key: 'TASK_REGULAR_SCHEDULING',
                        point: 120,
                        equalsFlag: 1,
                        ms: 60000,
                        _point: 10,
                        _ms: 60
                      }
                    ]
                  },
                  'alarmSettings.0.open': {
                    title: i18n.t('packages_dag_migration_alarmpanel_renwuyunxingchu'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`
                    }
                  },
                  'alarmSettings.0.notify': {
                    type: 'array',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
                  },
                  'alarmSettings.1.open': {
                    title: i18n.t('packages_dag_migration_alarmpanel_renwuquanliangwan'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM"]))}}`
                    }
                  },
                  'alarmSettings.1.notify': {
                    type: 'array',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[1].open=false))}}`
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
                  },
                  'alarmSettings.2.open': {
                    title: i18n.t('packages_dag_migration_alarmpanel_renwuzengliangkai'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM"]))}}`
                    }
                  },
                  'alarmSettings.2.notify': {
                    type: 'array',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[2].open=false))}}`
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
                  },
                  'alarmSettings.3.open': {
                    title: i18n.t('packages_dag_migration_alarmpanel_renwuzengliangyan'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[3].notify.length && ($values.alarmSettings[3].notify=["SYSTEM"]))}}`
                    },
                    'x-reactions': {
                      target: 'alarmRules.0.*',
                      fulfill: {
                        state: {
                          disabled: `{{!$self.value}}`
                        }
                      }
                    }
                  },
                  'alarmSettings.3.notify': {
                    type: 'array',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[3].open=false))}}`
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
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
                                value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12): $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      'alarmRules.0._point': {
                        title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                        type: 'number',
                        'x-editable': true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          precision: 0,
                          style: {
                            width: '100px'
                          }
                        },
                        'x-reactions': [
                          {
                            dependencies: ['.point'],
                            fulfill: {
                              state: {
                                value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 12) < 1 ? 1 : Math.ceil($deps[0] / 12) : $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      'alarmRules.0.equalsFlag': {
                        title: i18n.t('public_time_m'),
                        type: 'number',
                        default: 1,
                        'x-editable': true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          style: {
                            width: '70px'
                          }
                        },
                        enum: [
                          {
                            label: '<=',
                            value: -1
                          },
                          {
                            label: '>=',
                            value: 1
                          }
                        ],
                        'x-reactions': {
                          dependencies: ['.open'],
                          fulfill: {
                            state: {
                              disabled: `{{!$deps[0]}}`
                            }
                          }
                        }
                      },
                      'alarmRules.0.ms': {
                        type: 'number',
                        'x-reactions': [
                          {
                            dependencies: ['._ms'],
                            fulfill: {
                              state: {
                                value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000) : $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      'alarmRules.0._ms': {
                        title: '',
                        type: 'number',
                        'x-editable': true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          precision: 0,
                          style: {
                            width: '100px'
                          }
                        },
                        'x-reactions': [
                          {
                            dependencies: ['.ms'],
                            fulfill: {
                              state: {
                                value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 1000) < 1 ? 1 : Math.ceil($deps[0] / 1000) : $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      unit: {
                        title: 's',
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    }
                  },
                  'alarmSettings.4.open': {
                    title: i18n.t('packages_dag_migration_settingpanel_dingqidiaoduren'),
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[4].notify.length && ($values.alarmSettings[4].notify=["SYSTEM"]))}}`
                    },
                    'x-reactions': [
                      {
                        target: 'alarmRules.0.*',
                        fulfill: {
                          state: {
                            disabled: `{{!$self.value}}`
                          }
                        }
                      },
                      {
                        fulfill: {
                          state: {
                            visible: `{{$values.type === 'initial_sync' && $values.crontabExpressionFlag}}`
                          }
                        }
                      }
                    ]
                  },
                  'alarmSettings.4.notify': {
                    type: 'array',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[4].open=false))}}`
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    'x-reactions': [
                      '{{useAsyncOptions(loadAlarmChannels)}}',
                      {
                        fulfill: {
                          state: {
                            visible: `{{$values.type === 'initial_sync' && $values.crontabExpressionFlag}}`
                          }
                        }
                      }
                    ]
                  },
                  space1: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      'alarmRules.1.point': {
                        type: 'number',
                        'x-reactions': [
                          {
                            dependencies: ['._point'],
                            fulfill: {
                              state: {
                                value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12): $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      'alarmRules.1._point': {
                        title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                        type: 'number',
                        'x-editable': true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          precision: 0,
                          style: {
                            width: '100px'
                          }
                        },
                        'x-reactions': [
                          {
                            dependencies: ['.point'],
                            fulfill: {
                              state: {
                                value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 12) < 1 ? 1 : Math.ceil($deps[0] / 12) : $self.value}}`
                              }
                            }
                          }
                        ]
                      },
                      unit: {
                        title: i18n.t('packages_dag_migration_settingpanel_fenzhongrenwuwei'),
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    },
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            visible: `{{$values.type === 'initial_sync' && $values.crontabExpressionFlag}}`
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },

      form: createForm({
        disabled: this.stateIsReadonly,
        values
      })
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes'])
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
      if (v) {
        // 监控模式禁用
        this.form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
          disabled: true
        })
      }
    }
  },

  created() {
    this.form.setState({ disabled: this.stateIsReadonly })
    this.lazySaveAlarmConfig = debounce(this.saveAlarmConfig, 100)
  },

  mounted() {
    this.$nextTick(() => {
      !this.stateIsReadonly && this.form.setEffects(this.useEffects)
    })
  },

  methods: {
    // 绑定表单事件
    useEffects() {
      onFieldValueChange('*(alarmSettings.*.*,alarmRules.*.*)', (field, form) => {
        if (!this.stateIsReadonly) {
          this.lazySaveAlarmConfig()
        }
      })
    },

    saveAlarmConfig() {
      if (!this.form.values?.id || !this.form.values?.name) {
        return
      }
      taskApi.patch({
        id: this.form.values.id,
        ...JSON.parse(JSON.stringify(this.form.values))
      })
    }
  }
})
</script>
<style lang="scss" scoped>
.setting-panel {
  ::v-deep {
    .config-tabs.el-tabs > .el-tabs__header .el-tabs__nav-wrap {
      padding-left: 16px !important;
    }
  }
}
.attr-panel {
  ::v-deep {
    .attr-panel-body {
      padding-top: 0;
    }
    .formily-element-form-item-label label {
      font-size: $fontBaseTitle;
    }
    .el-collapse-item__header {
      font-size: $fontBaseTitle;
      font-weight: 500;
    }
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
