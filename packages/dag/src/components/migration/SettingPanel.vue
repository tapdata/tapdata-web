<template>
  <FormRender :form="form" :schema="schema" :scope="scope" />
</template>

<script>
import { mapGetters } from 'vuex'
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
    this.getAllNode()
    let values = observable(this.settings)
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
                      planStartDateFlag: {
                        title: '计划开始时间', //计划时间
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
                      planStartDate: {
                        type: 'string',
                        required: 'true',
                        'x-component': 'DatePicker',
                        'x-component-props': {
                          type: 'datetime',
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
                      crontabExpression: {
                        //调度表达式
                        title: '重复策略', //定期调度任务
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Input.TextArea',
                        'x-component-props': {
                          placeholder: this.$t('task_setting_cron_expression')
                        },
                        'x-decorator-props': {
                          tooltip: this.$t('task_setting_cron_tip')
                        },
                        'x-reactions': {
                          dependencies: ['type', 'planStartDateFlag'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      syncPoints: {
                        title: this.$t('task_setting_sync_point'), //增量采集开始时刻
                        type: 'array',
                        default: [{ type: 'current', date: '' }],
                        'x-decorator-props': {
                          tooltip: this.$t('task_setting_syncPoint_tip')
                        },
                        'x-component': 'ArrayItems',
                        'x-decorator': 'FormItem',
                        'x-reactions': {
                          dependencies: ['type', 'planStartDateFlag'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "cdc" && $deps[1] ? "visible" : "hidden"}}'
                            }
                          }
                        },
                        items: {
                          type: 'object',
                          properties: {
                            pointType: {
                              type: 'string',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: '请选择',
                                style: 'margin-bottom:10px'
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
                            dateTime: {
                              type: 'string',
                              required: 'true',
                              'x-component': 'DatePicker',
                              'x-component-props': {
                                type: 'datetime',
                                format: 'yyyy-MM-dd HH:mm:ss',
                                valueFormat: 'timestamp'
                              },
                              'x-reactions': {
                                dependencies: ['.pointType'],
                                fulfill: {
                                  state: {
                                    visible: '{{$deps[0] !== "current"}}'
                                  }
                                }
                              }
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
                      isStopOnError: {
                        title: this.$t('task_setting_stop_on_error'), //遇到错误停止
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch'
                      },
                      // shareCdcEnable: {
                      //   title: this.$t('connection_form_shared_mining'), //共享挖掘日志过滤
                      //   type: 'boolean',
                      //   default: false,
                      //   'x-decorator': 'FormItem',
                      //   'x-component': 'Switch',
                      //   'x-reactions': {
                      //     dependencies: ['type'],
                      //     fulfill: {
                      //       state: {
                      //         visible: '{{$deps[0] !== "initial_sync"}}' // 只有增量或全量+增量支持
                      //       }
                      //     }
                      //   }
                      // }
                      // isAutoInspect: {
                      //   title: '数据校验', //共享挖掘日志过滤
                      //   type: 'boolean',
                      //   default: true,
                      //   'x-decorator': 'FormItem',
                      //   'x-component': 'Switch'
                      // },
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
    ...mapGetters('dataflow', ['stateIsReadonly'])
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
    }
  },

  created() {
    this.form.setState({ disabled: this.stateIsReadonly })
  },

  methods: {
    handleCheckName: debounce(function (resolve, value) {
      taskApi.checkName(value, this.settings.id || '').then(data => {
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
      const allSource = this.$store.getters['dataflow/allEdges'].map(item => item.source)
      // 根据节点id查询源节点数据
      let sourceConnectionIds = []
      const sourceNodes = allNodes.filter(item => {
        if (allSource.includes(item.id)) {
          sourceConnectionIds.push(item.connectionId)
          return item
        }
      })
      // 过滤重复数据源
      // 过滤重复数据源
      let map = {}
      let filterSourceNodes = () => {
        sourceNodes.forEach(item => {
          if (!map[item.connectionId]) {
            //是否已有保存数据
            this.settings.syncPoints = this.settings.syncPoints || []
            let oldPoint = this.settings.syncPoints.filter(point => point.connectionId === item.connectionId)
            if (oldPoint?.length > 0) {
              map[item.connectionId] = {
                connectionId: item.connectionId,
                pointType: oldPoint[0].pointType || 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: oldPoint[0].dateTime || '',
                timeZone: this.systemTimeZone,
                connectionName: item.name
              }
            } else {
              map[item.connectionId] = {
                connectionId: item.connectionId,
                pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: '',
                timeZone: this.systemTimeZone,
                connectionName: item.name
              }
            }
          }
        })
        return map
      }
      this.settings.syncPoints = Object.values(filterSourceNodes())
      //this.$set(this.settings, 'syncPoints', Object.values(filterSourceNodes()))
      // let arr = filterSourceNodes()
      // eslint-disable-next-line
      console.log(allNodes, allSource, sourceConnectionIds, this.settings.syncPoints, filterSourceNodes())
    }
  }
})
</script>
