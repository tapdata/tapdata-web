<template>
  <FormRender :form="form" :schema="schema" :scope="formScope" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters } from 'vuex'
import { createForm, isVoidField, onFieldReact, onFormInputChange, onFormValuesChange } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'
import { debounce, cloneDeep } from 'lodash'
import { taskApi } from '@tap/api'

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object,
    nodeType: String
  },

  data() {
    const { alarmSettings = [], alarmRules = [] } = this.settings
    const alarmRulesMap =
      alarmRules.reduce((cur, next) => {
        return { ...cur, [next.key]: next }
      }, {}) || {}
    let values =
      alarmSettings.reduce((cur, next) => {
        return { ...cur, [next.key]: Object.assign({}, next, alarmRulesMap[next.key]) }
      }, {}) || {}
    return {
      formScope: {},

      schema: null,

      form: createForm({
        // disabled: this.stateIsReadonly,
        values,
        effects: this.useEffects
      })
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes'])
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
    },

    nodeType() {
      this.loadSchema()
    }
  },

  mounted() {
    this.loadSchema()
  },

  methods: {
    // 绑定表单事件
    useEffects() {
      onFormInputChange(form => {
        const values = JSON.parse(JSON.stringify(form.values))
        this.saveTaskSettings(values)
      })
    },

    saveTaskSettings: debounce(function (values) {
      const { id, alarmSettings, alarmRules } = this.settings
      let alarmSettingsNew = cloneDeep(alarmSettings)
      let alarmRulesNew = cloneDeep(alarmRules)
      alarmSettingsNew.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
      })
      alarmRulesNew.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
      })
      taskApi.patch({
        id,
        alarmSettings: alarmSettingsNew,
        alarmRules: alarmRulesNew
      })
    }, 500),

    loadSchema() {
      switch (this.nodeType) {
        case 'source':
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'TASK_STATUS_ERROR.open': {
                    title: '- 源数据源无法连接告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_STATUS_ERROR.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  'TASK_INSPECT_ERROR.open': {
                    title: '- 源数据源网络连接耗时告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_INSPECT_ERROR.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },
                  space1: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      'TASK_INCREMENT_DELAY.point': {
                        title: '连续',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      'TASK_INCREMENT_DELAY.equalsFlag': {
                        title: '个点',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          min: 1,
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
                        ]
                      },
                      'TASK_INCREMENT_DELAY.ms': {
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      ms: {
                        title: 'ms',
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    }
                  },

                  'TASK_FULL_COMPLETE.open': {
                    title: '- 源数据源协议连接耗时告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_FULL_COMPLETE.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },
                  space2: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      'TASK_INCREMENT_DELAY.point': {
                        title: '连续',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      'TASK_INCREMENT_DELAY.equalsFlag': {
                        title: '个点',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          min: 1,
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
                        ]
                      },
                      'TASK_INCREMENT_DELAY.ms': {
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      ms: {
                        title: 'ms',
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    }
                  },

                  'TASK_INCREMENT_COMPLETE.open': {
                    title: '- 源节点平均处理耗时告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_INCREMENT_COMPLETE.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },
                  space3: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      'TASK_INCREMENT_DELAY.point': {
                        title: '连续',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      'TASK_INCREMENT_DELAY.equalsFlag': {
                        title: '个点',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          min: 1,
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
                        ]
                      },
                      'TASK_INCREMENT_DELAY.ms': {
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      ms: {
                        title: 'ms',
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          break
        case 'target':
          break
        case 'process':
          break
        default:
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'TASK_STATUS_ERROR.open': {
                    title: '任务运行出错告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_STATUS_ERROR.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  'TASK_INSPECT_ERROR.open': {
                    title: '任务校验出错告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_INSPECT_ERROR.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  'TASK_FULL_COMPLETE.open': {
                    title: '任务全量完成通知',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_FULL_COMPLETE.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  // 任务增量开始通知
                  'TASK_INCREMENT_COMPLETE.open': {
                    title: '任务增量开始通知',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_INCREMENT_COMPLETE.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  'TASK_STATUS_STOP.open': {
                    title: '任务停止告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_STATUS_STOP.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },

                  'TASK_INCREMENT_DELAY.open': {
                    title: '任务增量延迟告警',
                    type: 'string',
                    required: 'true',
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch'
                  },
                  'TASK_INCREMENT_DELAY.notify': {
                    type: 'array',
                    'x-decorator': 'FormItem',
                    'x-component': 'Checkbox.Group',
                    enum: [
                      { label: '系统通知', value: 'SYSTEM' },
                      { label: '邮件通知', value: 'EMAIL' }
                    ]
                  },
                  increase: {
                    type: 'void',
                    'x-component': 'Space',
                    // 'x-component-props': {
                    //   style: {
                    //     display: 'flex'
                    //   }
                    // },
                    properties: {
                      'TASK_INCREMENT_DELAY.point': {
                        title: '连续',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      'TASK_INCREMENT_DELAY.equalsFlag': {
                        title: '个点',
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          min: 1,
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
                        ]
                      },
                      'TASK_INCREMENT_DELAY.ms': {
                        type: 'number',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                          style: {
                            width: '100px'
                          }
                        }
                      },
                      ms: {
                        title: 'ms',
                        type: 'void',
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          break
      }
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
      font-size: 12px;
    }
    .el-collapse-item__header {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
