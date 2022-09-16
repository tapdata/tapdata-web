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
                  'TASK_STATUS_ERROR.open': this.getSwitch('源数据源无法连接告警'),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup(),
                  'TASK_INSPECT_ERROR.open': this.getSwitch('源数据源网络连接耗时告警'),
                  'TASK_INSPECT_ERROR.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  ),
                  'TASK_FULL_COMPLETE.open': this.getSwitch('源数据源协议连接耗时告警'),
                  'TASK_FULL_COMPLETE.notify': this.getCheckboxGroup(),
                  space2: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  ),
                  'TASK_INCREMENT_COMPLETE.open': this.getSwitch('源节点平均处理耗时告警'),
                  'TASK_INCREMENT_COMPLETE.notify': this.getCheckboxGroup(),
                  space3: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  )
                }
              }
            }
          }
          break
        case 'target':
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'TASK_STATUS_ERROR1.open': this.getSwitch('目标数据源无法连接告警'),
                  'TASK_STATUS_ERROR1.notify': this.getCheckboxGroup(),
                  'TASK_INSPECT_ERROR1.open': this.getSwitch('目标数据源网络连接耗时告警'),
                  'TASK_INSPECT_ERROR1.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  ),
                  'TASK_FULL_COMPLETE1.open': this.getSwitch('目标数据源协议连接耗时告警'),
                  'TASK_FULL_COMPLETE1.notify': this.getCheckboxGroup(),
                  space2: this.getSpace(
                    'TASK_INCREMENT_DELAY1.point',
                    'TASK_INCREMENT_DELAY1.equalsFlag',
                    'TASK_INCREMENT_DELAY1.ms'
                  ),
                  'TASK_INCREMENT_COMPLETE1.open': this.getSwitch('目标节点平均处理耗时告警'),
                  'TASK_INCREMENT_COMPLETE1.notify': this.getCheckboxGroup(),
                  space3: this.getSpace(
                    'TASK_INCREMENT_DELAY1.point',
                    'TASK_INCREMENT_DELAY1.equalsFlag',
                    'TASK_INCREMENT_DELAY1.ms'
                  )
                }
              }
            }
          }
          break
        case 'process':
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'TASK_STATUS_ERROR.open': this.getSwitch('节点平均处理耗时告警'),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  )
                }
              }
            }
          }
          break
        default:
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'TASK_STATUS_ERROR.open': this.getSwitch('任务运行出错告警'),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup(),
                  'TASK_INSPECT_ERROR.open': this.getSwitch('任务校验出错告警'),
                  'TASK_INSPECT_ERROR.notify': this.getCheckboxGroup(),
                  'TASK_FULL_COMPLETE.open': this.getSwitch('任务全量完成通知'),
                  'TASK_FULL_COMPLETE.notify': this.getCheckboxGroup(),
                  'TASK_INCREMENT_COMPLETE.open': this.getSwitch('任务增量开始通知'),
                  'TASK_INCREMENT_COMPLETE.notify': this.getCheckboxGroup(),
                  'TASK_STATUS_STOP.open': this.getSwitch('任务停止告警'),
                  'TASK_STATUS_STOP.notify': this.getCheckboxGroup(),
                  'TASK_INCREMENT_DELAY.open': this.getSwitch('任务增量延迟告警'),
                  'TASK_INCREMENT_DELAY.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms'
                  )
                }
              }
            }
          }
          break
      }
    },

    getSwitch(title) {
      return {
        title,
        type: 'string',
        required: 'true',
        'x-decorator': 'FormItem',
        'x-component': 'Switch'
      }
    },

    getCheckboxGroup() {
      return {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        enum: [
          { label: '系统通知', value: 'SYSTEM' },
          { label: '邮件通知', value: 'EMAIL' }
        ]
      }
    },

    getInputNumber(title) {
      return {
        title,
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
      }
    },

    getSelect(title) {
      return {
        title,
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
      }
    },

    getSpace(key1, key2, key3) {
      let result = {
        type: 'void',
        'x-component': 'Space',
        properties: {}
      }
      result.properties[key1] = this.getInputNumber('连续')
      result.properties[key2] = this.getSelect('个点')
      result.properties[key3] = this.getInputNumber('连续')
      result.properties.ms = {
        title: 'ms',
        type: 'void',
        default: 0,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal'
        }
      }
      return result
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
