<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto">
      <Form
        class-name="form-wrap-task-setting"
        :form="form"
        :colon="true"
        labelAlign="left"
        labelWidth="150"
        size="small"
        layout="horizontal"
        wrapperWidth="400"
      >
        <SchemaField v-if="!!schema" :schema="schema" />
      </Form>
    </div>
  </div>
</template>

<script>
import * as components from '@daas/form'
import { createSchemaField } from '@formily/vue'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'

const { SchemaField } = createSchemaField({
  components: {
    ...components
  }
})
export default {
  name: 'Setting',
  components: { Form: components.Form, SchemaField },
  props: ['dataSourceData', 'settingData'],
  data() {
    return {
      form: createForm(),
      schema: null
    }
  },
  mounted() {
    this.setSchema()
  },
  methods: {
    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        // console.log('onFormValuesChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        this.$emit('submit', form)
      })
      onFormInputChange(form => {
        // console.log('onFormInputChange', JSON.parse(JSON.stringify(form.values))) // eslint-disable-line
        this.$emit('submit', form)
      })
    },
    // 设置schema
    async setSchema() {
      this.schema = null
      await this.$nextTick()
      this.form = createForm({
        values: this.settingData,
        effects: this.useEffects
      })
      this.schema = this.getSettingSchema()
      console.log(this.schema)
    },
    getSettingSchema() {
      //根据配置规则生成schema
      let type = this.dataSourceData?.target_databaseType
      //let sourceType = this.dataSourceData?.source_databaseType

      let mapping = {
        oracle: {
          readShareLogMode: {
            title: '共享增量读取的模式', // 共享增量读取的模式 支持oracle和mongodb
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              {
                label: '流式读取',
                value: 'STREAMING'
              },
              {
                label: '轮询读取',
                value: 'POLLING'
              }
            ],
            'x-reactions': {
              dependencies: ['sync_type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                }
              }
            }
          },
          maxTransactionLength: {
            title: '事务最大时长(小时)',
            type: 'number',
            'x-decorator': 'FormItem',
            'x-component': 'InputNumber'
          }
        },
        mongodb: {
          cdcEngineFilter: {
            title: '启用引擎过滤', //仅MongoDB作为源
            type: 'boolean',
            'x-decorator': 'FormItem',
            'x-component': 'Switch',
            'x-reactions': {
              dependencies: ['sync_type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                }
              }
            }
          },
          readShareLogMode: {
            title: '共享增量读取的模式', // 共享增量读取的模式 支持oracle和mongodb
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              {
                label: '流式读取',
                value: 'STREAMING'
              },
              {
                label: '轮询读取',
                value: 'POLLING'
              }
            ],
            'x-reactions': {
              dependencies: ['sync_type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                }
              }
            }
          }
        },
        mysql: {
          isOpenAutoDDL: {
            title: '自动处理DDL', //仅支持MySQL
            type: 'boolean',
            'x-decorator': 'FormItem',
            'x-component': 'Switch',
            'x-reactions': {
              dependencies: ['sync_type'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                }
              }
            }
          }
        }
      }
      //默认配置
      let config = {
        type: 'object',
        properties: {
          layout: {
            type: 'void',
            properties: {
              name: {
                title: '任务名称',
                type: 'string',
                required: 'true',
                'x-decorator': 'FormItem',
                'x-component': 'Input'
              },
              sync_type: {
                title: '同步类型',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                // default: 'initial_sync+cdc',
                enum: [
                  {
                    label: '全量+增量',
                    value: 'initial_sync+cdc'
                  },
                  {
                    label: '全量',
                    value: 'initial_sync'
                  },
                  {
                    label: '增量',
                    value: 'cdc'
                  }
                ],
                'x-reactions': {
                  target: '*(isSerialMode, cdcFetchSize)',
                  fulfill: {
                    state: {
                      visible: '{{$self.value !== "initial_sync"}}'
                    }
                  }
                }
              },
              stopOnError: {
                title: '遇到错误停止',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              needToCreateIndex: {
                title: '自动创建索引',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
                // default: true
              },
              noPrimaryKey: {
                title: '支持无主键同步',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              isSerialMode: {
                title: '增量数据处理机制',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: '批量',
                    value: false
                  },
                  {
                    label: '逐条',
                    value: true
                  }
                ]
              },
              cdcFetchSize: {
                title: '增量批次读取条数',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 1000
                }
                // default: 1
              },
              distinctWriteType: {
                title: '去重写入机制',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: this.$t('dataFlow.setting.intellect'),
                    value: 'intellect'
                  },
                  {
                    label: this.$t('dataFlow.setting.compel'),
                    value: 'compel'
                  }
                ]
                // default: 'intellect'
              },
              readShareLogMode: {
                title: '共享增量读取的模式',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                enum: [
                  {
                    label: '流式读取',
                    value: 'STREAMING'
                  },
                  {
                    label: '轮询读取',
                    value: 'POLLING'
                  }
                ]
                // default: 'STREAMING'
              },
              increment: {
                title: '自动创建索引',
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
                title: '定期调度任务',
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
                }
                // default: false
              },
              cronExpression: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder: '请输入调度表达式'
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
              readCdcInterval: {
                title: '增量同步间隔',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  append: 'ms'
                }
              },
              readBatchSize: {
                title: '每次读取数量',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-content': {
                  append: 'row'
                }
                // default: 100
              },
              processorConcurrency: {
                title: '处理器线程数',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 100
                }
                // default: 1
              },
              cdcConcurrency: {
                title: '增量同步并发写入',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                // default: false,
                'x-reactions': {
                  dependencies: ['sync_type'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0] !== "initial_sync" ? "visible" : "hidden"}}'
                    }
                  }
                }
              },
              transformerConcurrency: {
                title: '目标写入线程数',
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 100
                },
                'x-reactions': {
                  dependencies: ['sync_type', 'cdcConcurrency'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0] !== "cdc" || ($deps[0] === "cdc" && $deps[1])}}'
                    }
                  }
                }
                // default: 8
              },
              syncPoints: {
                title: '增量采集开始时刻',
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
              },
              cdcShareFilterOnServer: {
                title: '共享挖掘日志过滤',
                type: 'boolean',
                'x-decorator': 'FormItem',
                'x-component': 'Switch'
              },
              lagTime: {
                title: '增量滞后判断时间设置(秒)',
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
      }

      //合并配置
      let target = mapping[type] || {}
      config.properties.layout.properties = Object.assign(config?.properties?.layout?.properties, target)
      return config
    }
  }
}
</script>
