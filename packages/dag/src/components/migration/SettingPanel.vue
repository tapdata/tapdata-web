<template>
  <FormRender :form="form" :schema="schema" :scope="formScope" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters } from 'vuex'
import { createForm } from '@formily/core'
// import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'
import { debounce } from 'lodash'
import { taskApi } from '@tap/api'
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object
  },

  data() {
    let repeatNameMessage = this.$t('packages_dag_task_form_error_name_duplicate')
    let values = this.settings
    values.isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      formScope: {
        checkName: value => {
          return new Promise(resolve => {
            this.handleCheckName(resolve, value)
          })
        },
        getPickerOptionsBeforeTime
      },

      schema: {
        type: 'object',
        properties: {
          isDaas: {
            type: 'string',
            display: 'none'
          },
          layout: {
            type: 'void',
            properties: {
              name: {
                title: this.$t('packages_dag_task_stetting_name'), //任务名称
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
                    label: this.$t('packages_dag_task_setting_initial_sync'), //全量
                    value: 'initial_sync'
                  },
                  {
                    label: this.$t('packages_dag_task_setting_cdc'), //增量
                    value: 'cdc'
                  }
                ]
              },
              desc: {
                title: this.$t('packages_dag_task_stetting_desc'), //任务描述
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'Input.TextArea',
                'x-component-props': {
                  min: 1,
                  max: 100
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
                      title: this.$t('packages_dag_task_stetting_most_setting')
                    },
                    properties: {
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
                          message: 'Cron表达式格式有误'
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
                                dependencies: ['.connectionName'],
                                fulfill: {
                                  schema: {
                                    'x-component-props.content': `{{$deps[0] + '('+ $self.value + ')'}}`
                                  }
                                }
                              }
                            },
                            hiddenPointType: {
                              'x-display': 'hidden',
                              type: 'boolean',
                              'x-component': 'PreviewText.Input'
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
                                placeholder: i18n.t('packages_dag_components_formpanel_qingxuanze')
                              },
                              default: 'current',
                              enum: [
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_localTZType'),
                                  value: 'localTZ'
                                },
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_connTZType'),
                                  value: 'connTZ'
                                },
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_currentType'),
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
                                valueFormat: 'timestamp'
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
                                  fulfill: {
                                    schema: {
                                      'x-component-props.pickerOptions': `{{getPickerOptionsBeforeTime($self.value)}}`
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
                              visible: '{{$deps[0] !== "initial_sync" && $values.isDaas}}' // 只有增量或全量+增量支持
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
                      increSyncConcurrency: {
                        title: this.$t('packages_dag_task_setting_cdc_concurrency'),
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      increHysteresisSpace: {
                        type: 'void',
                        title: this.$t('packages_dag_task_setting_lag_time'),
                        'x-decorator': 'FormItem',
                        'x-component': 'Space',
                        properties: {
                          increHysteresis: {
                            type: 'boolean',
                            'x-component': 'Switch'
                          },
                          hysteresisInterval: {
                            type: 'number',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              feedbackLayout: 'none',
                              addonAfter: i18n.t('packages_dag_dag_data_setting_second')
                            },
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1
                            },
                            'x-reactions': {
                              dependencies: ['.increHysteresis'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0]?"visible":"hidden"}}'
                                }
                              }
                            }
                          }
                        },
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      processorThreadNum: {
                        type: 'number',
                        title: this.$t('packages_dag_task_setting_processorThreadNum'),
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber'
                      },
                      increOperationModeSpace: {
                        type: 'void',
                        title: this.$t('packages_dag_task_setting_increOperationMode'),
                        'x-decorator': 'FormItem',
                        'x-component': 'Space',
                        properties: {
                          increOperationMode: {
                            type: 'boolean',
                            'x-component': 'Select',
                            enum: [
                              { label: i18n.t('packages_dag_components_formpanel_piliang'), value: false },
                              { label: i18n.t('packages_dag_components_formpanel_zhutiao'), value: true }
                            ]
                          },
                          increaseReadSize: {
                            type: 'number',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1
                            },
                            'x-reactions': {
                              dependencies: ['.increOperationMode'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0]?"visible":"hidden"}}'
                                }
                              }
                            }
                          }
                        },
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
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
                            fulfill: { state: { visible: "{{$self.value==='MANUALLY_SPECIFIED_BY_THE_USER'}}" } }
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

      form: createForm({
        disabled: this.stateIsReadonly,
        values
      })
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes']),

    accessNodeProcessIdArr() {
      const set = this.allNodes
        .filter(item => item.type === 'database' || item.type === 'table')
        .reduce((set, item) => {
          item.attrs.accessNodeProcessId && set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set())
      return [...set]
    },

    accessNodeProcessList() {
      if (!this.accessNodeProcessIdArr.length) return this.scope.$agents
      return this.scope.$agents.filter(item => this.accessNodeProcessIdArr.includes(item.value))
    },

    sourceNodes() {
      return this.allNodes
        .filter(node => node.$outputs.length && !node.$inputs.length)
        .map(node => ({
          nodeId: node.id,
          nodeName: node.name,
          hiddenPointType: node?.cdcMode === 'polling', //源节点开启了日志轮询则禁用增量采集时刻配置
          connectionId: node.connectionId,
          connectionName: node.attrs.connectionName
        }))
    },

    systemTimeZone() {
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      return systemTimeZone
    }
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
    },

    accessNodeProcessIdArr: {
      handler(arr) {
        const size = arr.length
        if (size >= 1) {
          const currentId = this.settings.accessNodeProcessId
          this.settings.accessNodeType = 'MANUALLY_SPECIFIED_BY_THE_USER'
          this.settings.accessNodeProcessId = currentId && arr.includes(currentId) ? currentId : arr[0]
        }
        if (!this.stateIsReadonly) {
          // 只在编辑模式下禁用或启用
          this.form.setFieldState('*(accessNodeType,accessNodeProcessId)', {
            disabled: size === 1
          })
        }
      },
      immediate: true
    },
    accessNodeProcessList: {
      handler(dataSource = []) {
        this.form.setFieldState('accessNodeProcessId', {
          dataSource
        })
      },
      immediate: true
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
      const syncPoints = this.sourceNodes.map(item => {
        const old = oldPointsMap[item.nodeId]
        const point = {
          ...item,
          timeZone,
          pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
          dateTime: ''
        }
        if (old) {
          Object.assign(point, {
            pointType: old.pointType,
            dateTime: old.dateTime
          })
        }
        return point
      })
      this.settings.syncPoints = syncPoints
    }
  },

  created() {
    this.form.setState({ disabled: this.stateIsReadonly })
  },

  methods: {
    handleCheckName: debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value,
          id: this.settings.id || ''
        })
        .then(data => {
          resolve(data)
        })
    }, 500),
    // 获取所有节点
    getAllNode() {
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      const allNodes = this.$store.getters['dataflow/allNodes']
      const oldPoints = this.settings.syncPoints
      const oldPointsMap = oldPoints?.length
        ? oldPoints.reduce((map, point) => {
            if (point.connectionId) map[point.connectionId] = point
            return map
          }, {})
        : {}
      const connectionMap = allNodes
        .filter(node => node.$outputs.length && !node.$inputs.length)
        .reduce((map, node) => {
          const { connectionId } = node
          const item = (map[connectionId] = {
            connectionId,
            connectionName: node.attrs.connectionName,
            pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
            dateTime: '',
            timeZone: systemTimeZone
          })
          if (oldPointsMap[connectionId]) {
            const old = oldPointsMap[connectionId]
            Object.assign(item, {
              pointType: old.pointType,
              dateTime: old.dateTime
            })
          }
          return map
        }, {})

      this.settings.syncPoints = Object.values(connectionMap)
    }
  }
})
</script>
<style lang="scss" scoped>
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
