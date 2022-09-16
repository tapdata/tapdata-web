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
    return {
      formScope: {},

      schema: null,

      form: createForm({
        effects: this.useEffects
      })
    }
  },

  computed: {
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes', 'activeNode', 'allEdges'])
  },

  watch: {
    stateIsReadonly(v) {
      this.form.setState({ disabled: v })
    },

    nodeType() {
      this.loadSchema()
      this.loadSchemaForm()
    }
  },

  mounted() {
    this.loadSchema()
    this.loadSchemaForm()
  },

  methods: {
    // 绑定表单事件
    useEffects() {
      onFormInputChange(form => {
        const values = JSON.parse(JSON.stringify(form.values))
        // 节点类型
        if (['source', 'target', 'process'].includes(this.nodeType)) {
          this.saveNodeSettings(values)
          return
        }
        this.saveTaskSettings(values)
      })
    },

    saveTaskSettings: debounce(values => {
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

    saveNodeSettings: debounce(values => {
      const { id } = this.settings
      let nodes = cloneDeep(this.allNodes)
      let findOne = nodes?.find(t => t.id === this.activeNode?.id) || {}
      let alarmSettings = findOne.alarmSettings || []
      let alarmRules = findOne.alarmRules || []
      alarmSettings.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
      })
      alarmRules.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
      })
      taskApi.patch({
        id,
        dag: {
          edges: this.allEdges,
          nodes
        }
      })
    }, 500),

    loadSchema() {
      const { nodeType } = this
      this.schema = null
      switch (nodeType) {
        case 'source':
        case 'target':
          this.schema = {
            type: 'object',
            properties: {
              layout: {
                type: 'void',
                properties: {
                  'DATANODE_CANNOT_CONNECT.open': this.getSwitch('数据源无法连接告警'),
                  'DATANODE_CANNOT_CONNECT.notify': this.getCheckboxGroup(),
                  'DATANODE_HTTP_CONNECT_CONSUME.open': this.getSwitch('数据源网络连接耗时告警'),
                  'DATANODE_HTTP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'DATANODE_HTTP_CONNECT_CONSUME.point',
                    'DATANODE_HTTP_CONNECT_CONSUME.equalsFlag',
                    'DATANODE_HTTP_CONNECT_CONSUME.ms'
                  ),
                  'DATANODE_TCP_CONNECT_CONSUME.open': this.getSwitch('数据源协议连接耗时告警'),
                  'DATANODE_TCP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  space2: this.getSpace(
                    'DATANODE_TCP_CONNECT_CONSUME.point',
                    'DATANODE_TCP_CONNECT_CONSUME.equalsFlag',
                    'DATANODE_TCP_CONNECT_CONSUME.ms'
                  ),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.open': this.getSwitch('节点平均处理耗时告警'),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.notify': this.getCheckboxGroup(),
                  space3: this.getSpace(
                    'DATANODE_AVERAGE_HANDLE_CONSUME.point',
                    'DATANODE_AVERAGE_HANDLE_CONSUME.equalsFlag',
                    'DATANODE_AVERAGE_HANDLE_CONSUME.ms'
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
                  'PROCESSNODE_AVERAGE_HANDLE_CONSUME.open': this.getSwitch('节点平均处理耗时告警'),
                  'PROCESSNODE_AVERAGE_HANDLE_CONSUME.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.point',
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.equalsFlag',
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.ms'
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

    loadSchemaForm() {
      let { alarmSettings = [], alarmRules = [] } = this.settings
      // 节点类型
      if (['source', 'target', 'process'].includes(this.nodeType)) {
        const findOne = this.allNodes?.find(t => t.id === this.activeNode?.id) || {}
        alarmSettings = findOne.alarmSettings || []
        alarmRules = findOne.alarmRules || []
      }
      const alarmRulesMap =
        alarmRules.reduce((cur, next) => {
          return { ...cur, [next.key]: next }
        }, {}) || {}
      let values =
        alarmSettings.reduce((cur, next) => {
          return { ...cur, [next.key]: Object.assign({}, next, alarmRulesMap[next.key]) }
        }, {}) || {}
      this.form.setValues(values)
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
      result.properties[key3] = this.getInputNumber()
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
