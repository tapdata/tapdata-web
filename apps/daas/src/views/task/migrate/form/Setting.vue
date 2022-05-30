<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto">
      <Form
        class-name="form-wrap-task-setting"
        :form="form"
        :colon="true"
        labelAlign="left"
        labelWidth="160"
        layout="horizontal"
        wrapperWidth="400"
      >
        <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
      </Form>
    </div>
  </div>
</template>

<script>
import { SchemaField, Form } from '@tap/form'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'

export default {
  name: 'Setting',
  components: { Form, SchemaField },
  props: ['dataSourceData', 'settingData', 'accessNodeList'],
  data() {
    return {
      form: createForm(),
      schema: null,
      scope: {
        checkName: value => {
          let id = this.$route.params.id || this.dataSourceData.id || '' //当前任务id
          const { delayTrigger } = this.$util
          return new Promise(resolve => {
            delayTrigger(() => {
              resolve(this.$api('Task').checkName(value, id))
            }, 800)
          })
        }
      }
    }
  },

  created() {
    this.initAccessNode()
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
        disabled: this.$store.state.dataflow.stateIsReadonly,
        effects: this.useEffects
      })
      this.schema = this.getSettingSchema()
    },
    getSettingSchema() {
      //根据配置规则生成schema
      let type = this.dataSourceData?.target_databaseType
      let sourceType = this.dataSourceData?.source_databaseType

      let mapping = {
        oracle: {
          maxTransactionLength: {
            title: this.$t('task_setting_maximum_transaction'), //事务最大时长(小时)
            type: 'number',
            'x-decorator': 'FormItem',
            'x-component': 'InputNumber'
          }
        },
        mongodb: {
          isFilter: {
            title: this.$t('task_setting_cdc_engine_filter'), //仅MongoDB作为源   启用引擎过滤
            default: false,
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
        } /*,
        mysql: {
          isOpenAutoDDL: {
            title: this.$t('task_setting_automatic_ddl'), //仅支持MySQL
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
        }*/
      }
      let repeatNameMessage = this.$t('task_form_error_name_duplicate')
      //默认配置
      let config = {
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
              existDataProcessMode: {
                title: this.$t('dag_attributes_exist_data_deal'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
                'x-component-props': {
                  optionType: 'button'
                },
                enum: [
                  {
                    label: this.$t('dag_attributes_exist_data_keep_data'),
                    value: 'keepData'
                  },
                  {
                    label: this.$t('dag_attributes_exist_data_remove_data'),
                    value: 'removeData'
                  },
                  {
                    label: this.$t('dag_attributes_exist_data_drop_table'),
                    value: 'dropTable'
                  }
                ],
                default: 'keepData',
                'x-decorator-props': {
                  wrapperWidth: 420
                }
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

                // properties: {
                //   accessNodeType: {
                //     type: 'string',
                //     default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                //     'x-disabled': this.disabledAccessNode,
                //     'x-decorator': 'FormItem',
                //     'x-component': 'Select',
                //     enum: [
                //       {
                //         label: this.$t('connection_form_automatic'),
                //         value: 'AUTOMATIC_PLATFORM_ALLOCATION'
                //       },
                //       {
                //         label: this.$t('connection_form_manual'),
                //         value: 'MANUALLY_SPECIFIED_BY_THE_USER'
                //       }
                //     ]
                //   },
                //   accessNodeProcessId: {
                //     type: 'string',
                //     enum: this.accessNodeList,
                //     'x-disabled': this.disabledAccessNode,
                //     'x-decorator': 'FormItem',
                //     'x-decorator-props': {
                //       style: { flex: 1 }
                //     },
                //     'x-component': 'Select',
                //     'x-reactions': {
                //       dependencies: ['accessNodeType'],
                //       fulfill: {
                //         state: {
                //           visible: '{{$deps[0]==="MANUALLY_SPECIFIED_BY_THE_USER"}}',
                //           value:
                //             '{{console.log("$self.value", $self.value, $self.dataSource), $self.value || ($deps[0]==="MANUALLY_SPECIFIED_BY_THE_USER" && $self.dataSource.length ? $self.dataSource[0].value : undefined)}}'
                //         }
                //       }
                //     }
                //   }
                // }
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
      }

      //特殊配置需要源表满足条件
      let shareCdcEnable = {
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
        }
      }
      //源表连接开启了日志挖掘功能
      if (this.dataSourceData?.shareCdcEnable) {
        config.properties.layout.properties = Object.assign(config?.properties?.layout?.properties, shareCdcEnable)
        //共享增量读取的模式 共享挖掘打开且目标数据源是mongodb 或者 oracle
        if (['mongodb', 'oracle'].includes(type)) {
          config.properties.layout.properties.increShareReadMode = {
            title: this.$t('task_setting_share_cdc_mode'), // 共享增量读取的模式 支持oracle和mongodb
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            enum: [
              {
                label: this.$t('task_setting_streaming'), //流式读取
                value: 'STREAMING'
              },
              {
                label: this.$t('task_setting_polling'), //轮询读取
                value: 'POLLING'
              }
            ],
            default: 'STREAMING',
            'x-reactions': {
              dependencies: ['sync_type', 'shareCdcEnable'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "initial_sync" && $deps[1] }}'
                }
              }
            }
          }
        }
      }
      //合并配置
      let target = {}
      let source = {}
      if (
        [
          'hana',
          'gbase-8s',
          'dameng',
          'kundb',
          'adb_postgres',
          'adb_mysql',
          'greenplum',
          'db2',
          'sybase ase',
          'gaussdb200',
          'kudu',
          'hbase'
        ].includes(sourceType) //只支持全量同步
      ) {
        source = {
          sync_type: {
            title: this.$t('task_setting_sync_type'),
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Radio.Group',
            'x-component-props': {
              optionType: 'button'
            },
            default: 'initial_sync',
            enum: [
              {
                label: this.$t('task_setting_initial_sync'), //全量
                value: 'initial_sync'
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
          }
        }
      }
      target = mapping[type] || {}
      config.properties.layout.properties = Object.assign(config?.properties?.layout?.properties, target, source)

      // AutoDDL
      if (type === sourceType && ['mysql', 'oracle'].includes(type)) {
        config.properties.layout.properties.isOpenAutoDDL = {
          title: this.$t('task_setting_automatic_ddl'),
          type: 'boolean',
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
        }
      }
      return config
    },

    initAccessNode() {
      this.disabledAccessNode = false
      const { sourceAccessNodeProcessId, targetAccessNodeProcessId } = this.dataSourceData
      if (
        sourceAccessNodeProcessId &&
        (sourceAccessNodeProcessId === targetAccessNodeProcessId || !targetAccessNodeProcessId)
      ) {
        // 源和目标agent一致或只有源有指定agent
        this.settingData.accessNodeType = 'MANUALLY_SPECIFIED_BY_THE_USER'
        this.settingData.accessNodeProcessId = sourceAccessNodeProcessId
        this.disabledAccessNode = true
      } else if (targetAccessNodeProcessId && !sourceAccessNodeProcessId) {
        // 只有目标有指定agent
        this.settingData.accessNodeType = 'MANUALLY_SPECIFIED_BY_THE_USER'
        this.settingData.accessNodeProcessId = targetAccessNodeProcessId
        this.disabledAccessNode = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.attr-panel {
  ::v-deep {
    .formily-element-form-item-label label {
      font-size: 12px;
      color: map-get($fontColor, light);
    }
    .formily-element-form-item-info-help {
      font-size: 12px;
      line-height: 24px;
      width: 340px;
    }
    .formily-element-form-item-extra {
      font-size: 12px;
      line-height: 24px;
      width: 340px;
    }
  }
}
</style>
