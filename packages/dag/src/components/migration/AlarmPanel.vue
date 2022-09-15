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
    scope: Object
  },

  data() {
    this.getAllNode()
    const { alarmSettings = [], alarmRules = [] } = this.settings
    const alarmRulesMap =
      alarmRules.reduce((cur, next) => {
        return { ...cur, [next.key]: next }
      }, {}) || {}
    let values =
      alarmSettings.reduce((cur, next) => {
        return { ...cur, [next.key]: Object.assign({}, next, alarmRulesMap[next.key]) }
      }, {}) || {}
    console.log('values', values, JSON.stringify(values))
    return {
      formScope: {
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
      },

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
    }
  },

  created() {
    // this.form.setState({ disabled: this.stateIsReadonly })
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
    },

    // 绑定表单事件
    useEffects() {
      onFormInputChange(form => {
        const values = JSON.parse(JSON.stringify(form.values))
        console.log('🚄onFormInputChange', values)
        // this.updateNodeProps(form)
        this.saveTaskSettings(values)
      })
    },

    saveTaskSettings: debounce(function (values) {
      const { id, alarmSettings, alarmRules } = this.settings
      console.log('saveTaskSettings--start', values)
      console.log('id', id, alarmSettings, alarmRules)
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
      console.log('alarmSettingsNew', alarmSettingsNew)
      console.log('alarmRulesNew', alarmRulesNew)
      // taskApi.checkName(value, this.settings.id || '').then(data => {
      //   resolve(data)
      // })
      // taskApi.patch({
      //   id,
      //   alarmSettings,
      //   alarmRules
      // })
    }, 500)
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
