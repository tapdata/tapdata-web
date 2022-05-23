<template>
  <FormRender :form="form" :schema="schema" :scope="scope" />
</template>

<script>
import { createForm } from '@formily/core'
import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'
import { debounce } from 'lodash'
import { Task } from '@tap/api'

const taskApi = new Task()

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object
  },

  data() {
    let repeatNameMessage = this.$t('task_form_error_name_duplicate')
    const values = observable(this.settings)
    return {
      scope: {
        checkName: value => {
          return new Promise(resolve => {
            this.handleCheckName(resolve, value)
          })
        }
      },

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
                      checkName(value).then(({data}) => {
                        if(data === true) {
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
                'x-component': 'Input.TextArea',
                'x-component-props': {
                  min: 1,
                  max: 100
                }
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
                      title: '高级设置'
                    },
                    properties: {
                      planTime: {
                        title: '计划时间', //计划时间
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: false,
                        target: '*(crontabExpression,syncPoints)',
                        fulfill: {
                          state: {
                            visible: '{{$self.value}}'
                          }
                        }
                      },
                      planDate: {
                        type: 'string',
                        'x-component': 'DatePicker',
                        'x-component-props': {
                          type: 'datetime',
                          format: 'yyyy-MM-dd HH:mm:ss'
                        },
                        'x-reactions': {
                          dependencies: ['sync_type', 'planTime'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] !== "initial_sync+cdc" && $deps[1] ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      isAutoCreateIndex: {
                        title: this.$t('task_setting_automatic_index'), //自动创建索引
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: true
                      },
                      noPrimaryKey: {
                        title: this.$t('task_setting_no_primary_key'), //支持无主键同步
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch'
                      },
                      isStopOnError: {
                        title: this.$t('task_setting_stop_on_error'), //遇到错误停止
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch'
                      },
                      isSchedule: {
                        title: this.$t('task_setting_is_schedule'), //定期调度任务
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        'x-reactions': {
                          dependencies: ['sync_type', 'planTime'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
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
                      shareCdcEnable: {
                        title: this.$t('connection_form_shared_mining'), //共享挖掘日志过滤
                        type: 'boolean',
                        default: false,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        'x-reactions': {
                          dependencies: ['sync_type'],
                          fulfill: {
                            state: {
                              visible: '{{$deps[0] !== "initial_sync"}}' // 只有增量或全量+增量支持
                            }
                          }
                        }
                      },
                      isAutoInspect: {
                        title: '数据校验', //共享挖掘日志过滤
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch'
                      },
                      syncPoints: {
                        title: this.$t('task_setting_sync_point'), //增量采集开始时刻
                        type: 'array',
                        default: [{ type: 'current', date: '' }],
                        'x-component': 'ArrayItems',
                        'x-decorator': 'FormItem',
                        'x-reactions': {
                          dependencies: ['sync_type', 'planTime'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "cdc" && $deps[1] ? "visible" : "hidden"}}'
                            }
                          }
                        },
                        items: {
                          type: 'object',
                          properties: {
                            space: {
                              type: 'void',
                              'x-component': 'Space',
                              properties: {
                                type: {
                                  type: 'string',
                                  'x-component': 'Select',
                                  'x-component-props': {
                                    placeholder: '请选择'
                                  },
                                  default: 'current',
                                  enum: [
                                    {
                                      label: this.$t('dataFlow.SyncInfo.localTZType'),
                                      value: 'localTZ'
                                    },
                                    {
                                      label: this.$t('dataFlow.SyncInfo.connTZType'),
                                      value: 'connTZ'
                                    },
                                    {
                                      label: this.$t('dataFlow.SyncInfo.currentType'),
                                      value: 'current'
                                    }
                                  ]
                                },
                                date: {
                                  type: 'string',
                                  'x-component': 'DatePicker',
                                  'x-component-props': {
                                    type: 'datetime',
                                    format: 'yyyy-MM-dd HH:mm:ss'
                                  },
                                  'x-reactions': {
                                    dependencies: ['type'],
                                    fulfill: {
                                      state: {
                                        visible: '{{$deps[0] !== "current"}}'
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
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
  },

  methods: {
    handleCheckName: debounce(function (resolve, value) {
      taskApi.checkName(value, this.settings.id || '').then(data => {
        resolve(data)
      })
    }, 500)
  }
})
</script>
