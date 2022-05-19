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
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: true
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
                      syncPoints: {
                        title: this.$t('task_setting_sync_point'), //增量采集开始时刻
                        type: 'array',
                        'x-decorator': 'FormItem',
                        'x-component': 'ArrayItems',
                        'x-reactions': {
                          dependencies: ['sync_type'],
                          fulfill: {
                            state: {
                              visible: '{{$deps[0] === "cdc"}}'
                            }
                          }
                        },
                        items: [
                          {
                            type: 'object',
                            properties: {
                              row: {
                                type: 'void',
                                'x-component': 'Row',
                                'x-component-props': {
                                  type: 'flex',
                                  gap: '10px'
                                },
                                properties: {
                                  type: {
                                    type: 'string',
                                    'x-decorator': 'Col',
                                    'x-decorator-props': {
                                      span: 8
                                    },
                                    'x-component': 'Select',
                                    'x-component-props': {
                                      placeholder: '请选择'
                                    },
                                    default: 'localTZ',
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
                                    'x-decorator': 'Col',
                                    'x-decorator-props': {
                                      span: 14
                                    },
                                    'x-component': 'DatePicker',
                                    'x-component-props': {
                                      type: 'datetime',
                                      format: 'yyyy-MM-dd HH:mm:ss'
                                    }
                                  }
                                }
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
