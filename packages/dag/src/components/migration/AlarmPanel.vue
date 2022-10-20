<template>
  <FormRender :form="form" :schema="schema" :scope="formScope" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters, mapState } from 'vuex'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'
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
    ...mapGetters('dataflow', ['stateIsReadonly', 'allNodes', 'allEdges', 'activeNode']),
    ...mapState('dataflow', ['taskId', 'activeNodeId'])
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
          const { allNodes, allEdges, activeNodeId } = this
          this.saveNodeSettings(values, this.settings, {
            allNodes,
            allEdges,
            activeNodeId
          })
          return
        }
        this.saveTaskSettings(values, this.settings)
      })
    },

    saveTaskSettings: debounce((values, settings) => {
      const { id, alarmSettings, alarmRules } = settings
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

    saveNodeSettings: debounce((values, settings, params = {}) => {
      const { id } = settings
      const { allNodes, allEdges, activeNodeId } = params
      let nodes = cloneDeep(allNodes)
      let findOne = nodes?.find(t => t.id === activeNodeId) || {}
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
          edges: allEdges,
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
                  'DATANODE_CANNOT_CONNECT.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_shujuyuanwufa')
                  ),
                  'DATANODE_CANNOT_CONNECT.notify': this.getCheckboxGroup(),
                  'DATANODE_HTTP_CONNECT_CONSUME.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_shujuyuanwangluo')
                  ),
                  'DATANODE_HTTP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  space1: this.getSpace(
                    'DATANODE_HTTP_CONNECT_CONSUME.point',
                    'DATANODE_HTTP_CONNECT_CONSUME.equalsFlag',
                    'DATANODE_HTTP_CONNECT_CONSUME.ms'
                  ),
                  'DATANODE_TCP_CONNECT_CONSUME.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_shujuyuanxieyi')
                  ),
                  'DATANODE_TCP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  space2: this.getSpace(
                    'DATANODE_TCP_CONNECT_CONSUME.point',
                    'DATANODE_TCP_CONNECT_CONSUME.equalsFlag',
                    'DATANODE_TCP_CONNECT_CONSUME.ms'
                  ),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_jiedianpingjunchu')
                  ),
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
                  'PROCESSNODE_AVERAGE_HANDLE_CONSUME.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_jiedianpingjunchu')
                  ),
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
                  'TASK_STATUS_ERROR.open': this.getSwitch(i18n.t('packages_dag_migration_alarmpanel_renwuyunxingchu')),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup(),
                  'TASK_INSPECT_ERROR.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwujiaoyanchu')
                  ),
                  'TASK_INSPECT_ERROR.notify': this.getCheckboxGroup(),
                  'TASK_FULL_COMPLETE.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuquanliangwan')
                  ),
                  'TASK_FULL_COMPLETE.notify': this.getCheckboxGroup(),
                  'TASK_INCREMENT_START.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuzengliangkai')
                  ),
                  'TASK_INCREMENT_START.notify': this.getCheckboxGroup(),
                  'TASK_STATUS_STOP.open': this.getSwitch(i18n.t('packages_dag_migration_alarmpanel_renwutingzhigao')),
                  'TASK_STATUS_STOP.notify': this.getCheckboxGroup(),
                  'TASK_INCREMENT_DELAY.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuzengliangyan')
                  ),
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
        const { activeNode = {} } = this
        alarmSettings = activeNode.alarmSettings || []
        alarmRules = activeNode.alarmRules || []
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
          { label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'), value: 'SYSTEM' },
          { label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'), value: 'EMAIL' }
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
        default: -1,
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
      result.properties[key1] = this.getInputNumber(i18n.t('packages_dag_migration_alarmpanel_lianxu'))
      result.properties[key2] = this.getSelect(i18n.t('packages_dag_migration_alarmpanel_gedian'))
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
