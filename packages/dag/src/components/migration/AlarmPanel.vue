<template>
  <FormRender :form="form" :schema="schema" :scope="formScope" :key="activeNodeId" />
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters, mapState } from 'vuex'
import { createForm, onFormValuesChange } from '@formily/core'
import { observer } from '@formily/reactive-vue'
import FormRender from '../FormRender'
import { debounce } from 'lodash'
import { taskApi } from '@tap/api'

export default observer({
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object,
    isNode: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formScope: {},

      schema: null,

      form: createForm({
        effects: this.useEffects
      }),

      allNodesResult: []
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes', 'allEdges']),
    ...mapState('dataflow', ['activeNodeId'])
  },

  watch: {
    activeNodeId() {
      this.init()
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init: debounce(function () {
      if (this.isNode) {
        if (!this.allNodesResult.length) {
          this.allNodesResult = this.allNodes
        }
      }
      this.loadSchema()
      this.loadSchemaForm()
    }, 300),

    // 绑定表单事件
    useEffects() {
      onFormValuesChange(form => {
        const values = JSON.parse(JSON.stringify(form.values))
        this.isNode ? this.saveNodeSettings(values, this) : this.saveTaskSettings(values, this)
      })
    },

    saveTaskSettings: debounce((values, _self) => {
      const { settings } = _self
      let { id, alarmSettings, alarmRules } = settings
      alarmSettings.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
      })
      alarmRules.forEach(el => {
        for (let key in el) {
          el[key] = values[el.key][key]
        }
        //单位转化
        el['point'] = Math.ceil(el['point'] * 12) < 1 ? 1 : Math.ceil(el['point'] * 12)
        el['ms'] = Math.ceil(el['ms'] * 1000) < 1 ? 1 : Math.ceil(el['ms'] * 1000)
      })
      taskApi.patch({
        id,
        alarmSettings,
        alarmRules
      })
    }, 300),

    saveNodeSettings: debounce((values, _self) => {
      const { allEdges, activeNodeId, settings, allNodesResult } = _self
      const { id } = settings
      let findOne = allNodesResult.find(t => t.id === activeNodeId) || {}
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
        //单位转化
        el['point'] = Math.ceil(el['point'] * 12) < 1 ? 1 : Math.ceil(el['point'] * 12)
        el['ms'] = Math.ceil(el['ms'] * 1000) < 1 ? 1 : Math.ceil(el['ms'] * 1000)
      })
      const dag = {
        edges: allEdges,
        nodes: allNodesResult
      }
      taskApi.patch({
        id,
        dag,
        alarmSettings: settings.alarmSettings,
        alarmRules: settings.alarmRules
      })
    }, 300),

    loadSchema() {
      const nodeType = this.isNode ? this.getNodeType() : ''
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
                  // 'DATANODE_CANNOT_CONNECT.open': this.getSwitch(
                  //   i18n.t('packages_dag_migration_alarmpanel_shujuyuanwufa'),
                  //   'DATANODE_CANNOT_CONNECT.notify'
                  // ),
                  // 'DATANODE_CANNOT_CONNECT.notify': this.getCheckboxGroup('DATANODE_CANNOT_CONNECT.open'),
                  // 'DATANODE_HTTP_CONNECT_CONSUME.open': this.getSwitch(
                  //   i18n.t('packages_dag_migration_alarmpanel_shujuyuanwangluo')
                  // ),
                  // 'DATANODE_HTTP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  // space1: this.getSpace(
                  //   'DATANODE_HTTP_CONNECT_CONSUME.point',
                  //   'DATANODE_HTTP_CONNECT_CONSUME.equalsFlag',
                  //   'DATANODE_HTTP_CONNECT_CONSUME.ms'
                  // ),
                  // 'DATANODE_TCP_CONNECT_CONSUME.open': this.getSwitch(
                  //   i18n.t('packages_dag_migration_alarmpanel_shujuyuanxieyi')
                  // ),
                  // 'DATANODE_TCP_CONNECT_CONSUME.notify': this.getCheckboxGroup(),
                  // space2: this.getSpace(
                  //   'DATANODE_TCP_CONNECT_CONSUME.point',
                  //   'DATANODE_TCP_CONNECT_CONSUME.equalsFlag',
                  //   'DATANODE_TCP_CONNECT_CONSUME.ms'
                  // ),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.open': this.getSwitch(
                    i18n.t('packages_business_setting_alarmnotification_dangshujuyuanjie'),
                    'DATANODE_AVERAGE_HANDLE_CONSUME.notify'
                  ),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.notify': this.getCheckboxGroup(
                    'DATANODE_AVERAGE_HANDLE_CONSUME.open'
                  ),
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
                    i18n.t('packages_business_setting_alarmnotification_dangjiediandeping'),
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.notify'
                  ),
                  'PROCESSNODE_AVERAGE_HANDLE_CONSUME.notify': this.getCheckboxGroup(
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.open'
                  ),
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
                  'TASK_STATUS_ERROR.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuyunxingchu'),
                    'TASK_STATUS_ERROR.notify'
                  ),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup('TASK_STATUS_ERROR.open'),
                  'TASK_INSPECT_ERROR.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwujiaoyanchu'),
                    'TASK_INSPECT_ERROR.notify'
                  ),
                  'TASK_INSPECT_ERROR.notify': this.getCheckboxGroup('TASK_INSPECT_ERROR.open'),
                  'TASK_FULL_COMPLETE.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuquanliangwan'),
                    'TASK_FULL_COMPLETE.notify'
                  ),
                  'TASK_FULL_COMPLETE.notify': this.getCheckboxGroup('TASK_FULL_COMPLETE.open'),
                  'TASK_INCREMENT_START.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuzengliangkai'),
                    'TASK_INCREMENT_START.notify'
                  ),
                  'TASK_INCREMENT_START.notify': this.getCheckboxGroup('TASK_INCREMENT_START.open'),
                  'TASK_STATUS_STOP.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwutingzhigao'),
                    'TASK_STATUS_STOP.notify'
                  ),
                  'TASK_STATUS_STOP.notify': this.getCheckboxGroup('TASK_STATUS_STOP.open'),
                  'TASK_INCREMENT_DELAY.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwuzengliangyan'),
                    'TASK_INCREMENT_DELAY.notify'
                  ),
                  'TASK_INCREMENT_DELAY.notify': this.getCheckboxGroup('TASK_INCREMENT_DELAY.open'),
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
      const { settings } = this
      let alarmSettings = settings.alarmSettings || []
      let alarmRules = settings.alarmRules || []
      // 节点类型
      if (this.isNode) {
        const { activeNodeId, allNodesResult } = this
        const activeNode = allNodesResult.find(t => t.id === activeNodeId) || {}
        alarmSettings = activeNode.alarmSettings || []
        alarmRules = activeNode.alarmRules || []
      }
      const alarmRulesMap =
        alarmRules.reduce((cur, next) => {
          //单位转化
          next.point = Math.ceil(next.point / 12) < 1 ? 1 : Math.ceil(next.point / 12)
          next.ms = Math.ceil(next.ms / 1000) < 1 ? 1 : Math.ceil(next.ms / 1000)
          return { ...cur, [next.key]: next }
        }, {}) || {}
      let values =
        alarmSettings.reduce((cur, next) => {
          return { ...cur, [next.key]: Object.assign({}, next, alarmRulesMap[next.key]) }
        }, {}) || {}
      this.form.setValues(values)
    },

    getSwitch(title, key = '') {
      let options = {
        title,
        type: 'boolean',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Switch',
        default: true
      }
      if (key) {
        const a = key.split('.')
        options['x-component-props'] = {
          onChange: `{{val=>{console.log($values['${key}'], $values['${a[0]}']?.['${a[1]}']);(val && !$values['${a[0]}']?.['${a[1]}'].length) && $form.setValuesIn('${key}', ["SYSTEM"])}}}`
        }
      }
      return options
    },

    getCheckboxGroup(key = '') {
      let options = {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        enum: [
          { label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'), value: 'SYSTEM' },
          { label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'), value: 'EMAIL' }
        ],
        'x-component-props': {
          onChange: `{{val=>{$form.setValuesIn('${key}', !!val.length)}}}`
        },
        default: ['SYSTEM']
      }
      if (process.env.VUE_APP_PLATFORM !== 'DAAS') {
        let isOpenid = window.__USER_INFO__?.openid
        let enums = [
          { label: i18n.t('packages_business_notify_webchat_notification'), value: 'WECHAT', disabled: !isOpenid },
          { label: i18n.t('packages_business_notify_sms_notification'), value: 'SMS' }
        ]
        options.enum = [...options.enum, ...enums]
      }
      if (key) {
        options['x-reactions'] = {
          dependencies: [key],
          fulfill: {
            state: {
              disabled: `{{!$deps[0]}}`
            }
          }
        }
      }
      return options
    },

    getInputNumber(title, defaultNum = 0) {
      return {
        title,
        type: 'number',
        default: defaultNum,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal'
        },
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1,
          precision: 0,
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
        default: 1,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal'
        },
        'x-component': 'Select',
        'x-component-props': {
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
      result.properties[key1] = this.getInputNumber(i18n.t('packages_dag_migration_alarmpanel_lianxu'), 10)
      result.properties[key2] = this.getSelect(i18n.t('packages_dag_migration_alarmpanel_gedian'))
      result.properties[key3] = this.getInputNumber('', 1000)
      result.properties.ms = {
        title: 's',
        type: 'void',
        default: 0,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal'
        }
      }
      return result
    },

    getNodeType() {
      const { activeNodeId, allNodes } = this
      const { type, $inputs, $outputs } = allNodes.find(t => t.id === activeNodeId) || {}
      if (!type) return ''
      if (type === 'database' || type === 'table') {
        if (!$inputs.length) return 'source'
        if (!$outputs.length) return 'target'
      }
      return 'process'
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
