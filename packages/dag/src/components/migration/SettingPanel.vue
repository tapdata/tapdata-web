<template>
  <FormRender :form="form" :schema="schema" />
</template>

<script>
import { createForm } from '@formily/core'
import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object
  },

  data() {
    let repeatNameMessage = this.$t('task_form_error_name_duplicate')
    const values = observable(this.settings)
    return {
      schema: {
        type: 'object',
        properties: {
          layout: {
            type: 'void',
            properties: {
              name: {
                title: this.$t('task_stetting_name'), //任务名称
                type: 'string',
                required: 'true',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-validator': `{{(value) => {
                    return new Promise((resolve) => {
                      checkName(value).then((res) => {
                        if(res.data === true) {
                          resolve('${repeatNameMessage}')
                        } else {
                          resolve()
                        }
                      })
                    })
                  }}}`
              },
              desc: {
                title: this.$t('task_stetting_desc'), //任务描述
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea'
              },
              sync_type: {
                title: this.$t('task_setting_sync_type'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                'x-component-props': {
                  optionType: 'button'
                },
                default: 'initial_sync+cdc',
                enum: [
                  {
                    label: this.$t('task_setting_initial_sync_cdc'), //全量+增量
                    value: 'initial_sync+cdc'
                  },
                  {
                    label: this.$t('task_setting_initial_sync'), //全量
                    value: 'initial_sync'
                  },
                  {
                    label: this.$t('task_setting_cdc'), //增量
                    value: 'cdc'
                  }
                ],
                'x-reactions': {
                  target: '*(increOperationMode, increaseReadSize)',
                  fulfill: {
                    state: {
                      visible: '{{$self.value !== "initial_sync"}}'
                    }
                  }
                }
              },
              deduplicWriteMode: {
                title: this.$t('task_setting_distinct_write_type'), //去重写入机制
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                'x-component-props': {
                  optionType: 'button'
                },
                enum: [
                  {
                    label: this.$t('dataFlow.setting.intellect'),
                    value: 'intellect'
                  },
                  {
                    label: this.$t('dataFlow.setting.compel'),
                    value: 'compel'
                  }
                ],
                default: 'intellect'
              },

              accessNodeWrap: {
                type: 'void',
                title: this.$t('connection_form_access_node'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  // asterisk: true,
                  feedbackLayout: 'none'
                },
                'x-component': 'FormFlex',
                'x-component-props': {
                  gap: 8,
                  align: 'start'
                },

                properties: {
                  accessNodeType: {
                    type: 'string',
                    default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                    'x-disabled': this.disabledAccessNode,
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    enum: [
                      {
                        label: this.$t('connection_form_automatic'),
                        value: 'AUTOMATIC_PLATFORM_ALLOCATION'
                      },
                      {
                        label: this.$t('connection_form_manual'),
                        value: 'MANUALLY_SPECIFIED_BY_THE_USER'
                      }
                    ]
                  },
                  accessNodeProcessId: {
                    type: 'string',
                    enum: this.accessNodeList,
                    'x-disabled': this.disabledAccessNode,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      style: { flex: 1 }
                    },
                    'x-component': 'Select',
                    'x-reactions': {
                      dependencies: ['accessNodeType'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0]==="MANUALLY_SPECIFIED_BY_THE_USER"}}',
                          value:
                            '{{console.log("$self.value", $self.value, $self.dataSource), $self.value || ($deps[0]==="MANUALLY_SPECIFIED_BY_THE_USER" && $self.dataSource.length ? $self.dataSource[0].value : undefined)}}'
                        }
                      }
                    }
                  }
                }
              },

              isStopOnError: {
                title: this.$t('task_setting_stop_on_error'), //遇到错误停止
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              isAutoCreateIndex: {
                title: this.$t('task_setting_automatic_index'), //自动创建索引
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                default: true
              },
              automaticallyCreateTables: {
                title: this.$t('task_setting_create_tables'), //自动建表
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              // noPrimaryKey: {
              //   title: this.$t('task_setting_no_primary_key'), //支持无主键同步
              //   type: 'boolean',
              //   'x-decorator': 'FormItem',
              //   'x-component': 'Switch'
              // },
              increOperationMode: {
                title: this.$t('task_setting_cdc_data_process'), //增量数据处理机制
                default: false,
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: this.$t('task_setting_batch'), //批量
                    value: false
                  },
                  {
                    label: this.$t('task_setting_onebyone'), //逐条
                    value: true
                  }
                ],

                'x-reactions': {
                  target: 'increaseReadSize',
                  fulfill: {
                    state: {
                      visible: '{{!$self.value}}'
                      // display: '{{console.log($deps[0]),$deps[0] == false ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              increaseReadSize: {
                title: this.$t('task_setting_cdc_fetch_size'), //增量批次读取条数
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 1000
                },
                default: 1
                // 'x-reactions': {
                //   dependencies: ['increOperationMode'],
                //   fulfill: {
                //     state: {
                //       visible: '{{!$deps[0]}}'
                //       // display: '{{console.log($deps[0]),$deps[0] == false ? "visible" : "hidden"}}'
                //     }
                //   }
                // }
              },
              increment: {
                title: this.$t('task_setting_automatic_index'), //自动创建索引
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync"}}'
                    }
                  }
                }
              },
              isSchedule: {
                title: this.$t('task_setting_is_schedule'), //定期调度任务
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync" ? "visible" : "hidden"}}'
                    }
                  }
                },
                default: false
              },
              crontabExpression: {
                //调度表达式
                title: this.$t('task_setting_cron_expression_label'), //定期调度任务
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: this.$t('task_setting_cron_expression')
                },
                'x-decorator-props': {
                  feedbackStatus: 'info',
                  feedbackText: this.$t('task_setting_cron_feedbackText'),
                  extra: this.$t('task_setting_cron_extra'),
                  feedbackLayout: 'terse'
                },
                'x-reactions': {
                  dependencies: ['sync_type', 'isSchedule'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              // increaseSyncInterval: {
              //   title: this.$t('task_setting_read_cdc_interval'), //增量同步间隔
              //   type: 'string',
              //   'x-decorator': 'FormItem',
              //   'x-component': 'Input',
              //   'x-content': {
              //     append: 'ms'
              //   },
              //   default: 500
              // },
              // readBatchSize: {
              //   title: this.$t('task_setting_read_batch_size'), //每次读取数量
              //   type: 'string',
              //   'x-decorator': 'FormItem',
              //   'x-component': 'Input',
              //   'x-content': {
              //     append: 'row'
              //   }
              //   // default: 100
              // },
              increSyncConcurrency: {
                title: this.$t('task_setting_cdc_concurrency'), //增量同步并发写入
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                default: false,
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] !== "initial_sync" ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              writeThreadSize: {
                title: this.$t('task_setting_transformer_concurrency'), //目标写入线程数
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 100
                },
                'x-reactions': {
                  dependencies: ['sync_type', 'increSyncConcurrency'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                    }
                  }
                },
                default: 1
              },
              // syncPoints: {
              //   title: this.$t('task_setting_sync_point'), //增量采集开始时刻
              //   type: 'array',
              //   'x-decorator': 'FormItem',
              //   'x-component': 'ArrayItems',
              //   'x-reactions': {
              //     dependencies: ['sync_type'],
              //     fulfill: {
              //       state: {
              //         visible: '{{$deps[0] === "cdc"}}'
              //       }
              //     }
              //   },
              //   items: [
              //     {
              //       type: 'object',
              //       properties: {
              //         row: {
              //           type: 'void',
              //           'x-component': 'Row',
              //           'x-component-props': {
              //             type: 'flex',
              //             gap: '10px'
              //           },
              //           properties: {
              //             type: {
              //               type: 'string',
              //               'x-decorator': 'Col',
              //               'x-decorator-props': {
              //                 span: 8
              //               },
              //               'x-component': 'Select',
              //               'x-component-props': {
              //                 placeholder: '请选择'
              //               },
              //               default: 'localTZ',
              //               enum: [
              //                 {
              //                   label: this.$t('dataFlow.SyncInfo.localTZType'),
              //                   value: 'localTZ'
              //                 },
              //                 {
              //                   label: this.$t('dataFlow.SyncInfo.connTZType'),
              //                   value: 'connTZ'
              //                 },
              //                 {
              //                   label: this.$t('dataFlow.SyncInfo.currentType'),
              //                   value: 'current'
              //                 }
              //               ]
              //             },
              //             date: {
              //               type: 'string',
              //               'x-decorator': 'Col',
              //               'x-decorator-props': {
              //                 span: 14
              //               },
              //               'x-component': 'DatePicker',
              //               'x-component-props': {
              //                 type: 'datetime',
              //                 format: 'yyyy-MM-dd HH:mm:ss'
              //               }
              //             }
              //           }
              //         }
              //       }
              //     }
              //   ]
              // },
              increHysteresis: {
                title: this.$t('task_setting_lag_time'), //增量滞后判断时间设置(秒)
                default: false,
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'Space',
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] !== "initial_sync"}}'
                    }
                  }
                },
                properties: {
                  lagTimeFalg: {
                    type: 'boolean',
                    'x-component': 'Switch'
                  },
                  userSetLagTime: {
                    type: 'number',
                    'x-component': 'InputNumber',
                    /*'x-component-props': {
                        append: '秒'
                      },*/
                    'x-reactions': {
                      dependencies: ['lagTimeFalg'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === true}}'
                        }
                      }
                    }
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
  }
})
</script>
