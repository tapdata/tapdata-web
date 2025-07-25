<script>
import { createForm, onFormValuesChange } from '@formily/core'

import { observer } from '@formily/reactive-vue'
import { getAlarmChannels, taskApi } from '@tap/api'
import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'
import { mapGetters, mapState } from 'vuex'
import FormRender from '../FormRender'

export default {
  name: 'SettingPanel',
  components: { FormRender },
  props: {
    settings: Object,
    scope: Object,
    isNode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formScope: {},

      schema: null,

      form: createForm(),

      allNodesResult: [],

      channels: ['wechat', 'system', 'sms', 'email'],
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes', 'allEdges']),
    ...mapState('dataflow', ['activeNodeId']),
  },

  watch: {
    activeNodeId() {
      this.init()
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    init: debounce(function () {
      if (this.isNode && !this.allNodesResult.length) {
        this.allNodesResult = this.allNodes
      }
      //获取支持通知方式
      getAlarmChannels().then((data) => {
        this.channels = []
        this.channels = data.map((item) => item.type)
        this.loadSchema()
      })
    }, 300),

    // 绑定表单事件
    useEffects() {
      onFormValuesChange((form) => {
        const values = JSON.parse(JSON.stringify(form.values))
        this.isNode
          ? this.saveNodeSettings(values, this)
          : this.saveTaskSettings(values, this)
      })
    },

    saveTaskSettings: debounce((values, _self) => {
      const { settings } = _self
      const { id, alarmSettings, alarmRules } = settings
      alarmSettings.forEach((el) => {
        for (const key in el) {
          el[key] = values[el.key][key]
        }
      })
      alarmRules.forEach((el) => {
        for (const key in el) {
          el[key] = values[el.key][key]
        }
        //单位转化
        el.point = Math.max(Math.ceil(el.point * 12), 1)
        el.ms = Math.max(Math.ceil(el.ms * 1000), 1)
      })
      taskApi.patch({
        id,
        alarmSettings,
        alarmRules,
      })
    }, 300),

    saveNodeSettings: debounce((values, _self) => {
      const { allEdges, activeNodeId, settings, allNodesResult } = _self
      const { id } = settings
      const findOne = allNodesResult.find((t) => t.id === activeNodeId) || {}
      const alarmSettings = findOne.alarmSettings || []
      const alarmRules = findOne.alarmRules || []
      alarmSettings.forEach((el) => {
        for (const key in el) {
          el[key] = values[el.key][key]
        }
      })
      alarmRules.forEach((el) => {
        for (const key in el) {
          el[key] = values[el.key][key]
        }
        //单位转化
        el.point = Math.max(Math.ceil(el.point * 12), 1)
        el.ms = Math.max(Math.ceil(el.ms * 1000), 1)
      })
      const dag = {
        edges: allEdges,
        nodes: allNodesResult,
      }
      taskApi.patch({
        id,
        dag,
        alarmSettings: settings.alarmSettings,
        alarmRules: settings.alarmRules,
      })
    }, 300),

    async loadSchema() {
      const nodeType = this.isNode ? this.getNodeType() : ''
      this.schema = null

      await this.$nextTick()

      this.loadSchemaForm()

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
                    i18n.t(
                      'packages_business_setting_alarmnotification_dangshujuyuanjie',
                    ),
                    'DATANODE_AVERAGE_HANDLE_CONSUME.notify',
                  ),
                  'DATANODE_AVERAGE_HANDLE_CONSUME.notify':
                    this.getCheckboxGroup(
                      'DATANODE_AVERAGE_HANDLE_CONSUME.open',
                    ),
                  space3: this.getSpace(
                    'DATANODE_AVERAGE_HANDLE_CONSUME.point',
                    'DATANODE_AVERAGE_HANDLE_CONSUME.equalsFlag',
                    'DATANODE_AVERAGE_HANDLE_CONSUME.ms',
                    'DATANODE_AVERAGE_HANDLE_CONSUME.open',
                  ),
                },
              },
            },
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
                    i18n.t(
                      'packages_business_setting_alarmnotification_dangjiediandeping',
                    ),
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.notify',
                  ),
                  'PROCESSNODE_AVERAGE_HANDLE_CONSUME.notify':
                    this.getCheckboxGroup(
                      'PROCESSNODE_AVERAGE_HANDLE_CONSUME.open',
                    ),
                  space1: this.getSpace(
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.point',
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.equalsFlag',
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.ms',
                    'PROCESSNODE_AVERAGE_HANDLE_CONSUME.open',
                  ),
                },
              },
            },
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
                    'TASK_STATUS_ERROR.notify',
                  ),
                  'TASK_STATUS_ERROR.notify': this.getCheckboxGroup(
                    'TASK_STATUS_ERROR.open',
                  ),
                  // 'TASK_INSPECT_ERROR.open': this.getSwitch(
                  //   i18n.t('packages_dag_migration_alarmpanel_renwujiaoyanchu'),
                  //   'TASK_INSPECT_ERROR.notify'
                  // ),
                  // 'TASK_INSPECT_ERROR.notify': this.getCheckboxGroup('TASK_INSPECT_ERROR.open'),
                  'TASK_FULL_COMPLETE.open': this.getSwitch(
                    i18n.t(
                      'packages_dag_migration_alarmpanel_renwuquanliangwan',
                    ),
                    'TASK_FULL_COMPLETE.notify',
                  ),
                  'TASK_FULL_COMPLETE.notify': this.getCheckboxGroup(
                    'TASK_FULL_COMPLETE.open',
                  ),
                  'TASK_INCREMENT_START.open': this.getSwitch(
                    i18n.t(
                      'packages_dag_migration_alarmpanel_renwuzengliangkai',
                    ),
                    'TASK_INCREMENT_START.notify',
                  ),
                  'TASK_INCREMENT_START.notify': this.getCheckboxGroup(
                    'TASK_INCREMENT_START.open',
                  ),
                  'TASK_STATUS_STOP.open': this.getSwitch(
                    i18n.t('packages_dag_migration_alarmpanel_renwutingzhigao'),
                    'TASK_STATUS_STOP.notify',
                  ),
                  'TASK_STATUS_STOP.notify': this.getCheckboxGroup(
                    'TASK_STATUS_STOP.open',
                  ),
                  'TASK_INCREMENT_DELAY.open': this.getSwitch(
                    i18n.t(
                      'packages_dag_migration_alarmpanel_renwuzengliangyan',
                    ),
                    'TASK_INCREMENT_DELAY.notify',
                  ),
                  'TASK_INCREMENT_DELAY.notify': this.getCheckboxGroup(
                    'TASK_INCREMENT_DELAY.open',
                  ),
                  space1: this.getSpace(
                    'TASK_INCREMENT_DELAY.point',
                    'TASK_INCREMENT_DELAY.equalsFlag',
                    'TASK_INCREMENT_DELAY.ms',
                    'TASK_INCREMENT_DELAY.open',
                  ),
                },
              },
            },
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
        const activeNode =
          allNodesResult.find((t) => t.id === activeNodeId) || {}
        alarmSettings = activeNode.alarmSettings || []
        alarmRules = activeNode.alarmRules || []
      }
      const alarmRulesMap = alarmRules.reduce((cur, next) => {
        const rule = (cur[next.key] = { ...next })
        //单位转化
        rule.point = Math.max(Math.ceil(next.point / 12), 1)
        rule.ms = Math.max(Math.ceil(next.ms / 1000), 1)
        return cur
      }, {})
      const values = alarmSettings.reduce((cur, next) => {
        cur[next.key] = { ...next, ...alarmRulesMap[next.key] }
        return cur
      }, {})

      this.form = createForm({
        values,
        effects: this.useEffects,
      })
    },

    getSwitch(title, key = '') {
      const options = {
        title,
        type: 'boolean',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Switch',
        default: true,
      }
      if (key) {
        const a = key.split('.')
        options['x-component-props'] = {
          onChange: `{{val=>{console.log($values['${key}'], $values['${a[0]}']?.['${a[1]}']);(val && !$values['${a[0]}']?.['${a[1]}'].length) && $form.setValuesIn('${key}', ["SYSTEM"])}}}`,
        }
      }
      return options
    },

    getCheckboxGroup(key = '') {
      const options = {
        type: 'array',
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        enum: [],
        'x-component-props': {
          onChange: `{{val=>{$form.setValuesIn('${key}', !!val.length)}}}`,
        },
        default: ['SYSTEM'],
      }
      const enums = []
      if (this.channels.includes('system')) {
        enums.push({
          label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'),
          value: 'SYSTEM',
        })
      }
      if (this.channels.includes('email')) {
        enums.push({
          label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'),
          value: 'EMAIL',
        })
      }
      if (import.meta.env.VUE_APP_PLATFORM !== 'DAAS') {
        const isOpenid = window.__USER_INFO__?.openid
        if (this.channels.includes('wechat')) {
          enums.push({
            label: i18n.t('packages_business_notify_webchat_notification'),
            value: 'WECHAT',
            disabled: !isOpenid,
          })
        }
        if (this.channels.includes('sms')) {
          enums.push({
            label: i18n.t('packages_business_notify_sms_notification'),
            value: 'SMS',
          })
        }
      }

      options.enum = [...options.enum, ...enums]
      if (key) {
        options['x-reactions'] = {
          dependencies: [key],
          fulfill: {
            state: {
              disabled: `{{!$deps[0]}}`,
            },
          },
        }
      }
      return options
    },

    getInputNumber(title, defaultNum = 0, key = '') {
      return {
        title,
        type: 'number',
        default: defaultNum,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal',
        },
        'x-component': 'InputNumber',
        'x-component-props': {
          min: 1,
          precision: 0,
          style: {
            width: '100px',
          },
        },
        'x-reactions': {
          dependencies: [key],
          fulfill: {
            state: {
              disabled: `{{!$deps[0]}}`,
            },
          },
        },
      }
    },

    getSelect(title) {
      return {
        title,
        type: 'number',
        default: 1,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal',
        },
        'x-component': 'Select',
        'x-component-props': {
          style: {
            width: '70px',
          },
        },
        enum: [
          {
            label: '<=',
            value: -1,
          },
          {
            label: '>=',
            value: 1,
          },
        ],
      }
    },

    getSpace(key1, key2, key3, key4) {
      const result = {
        type: 'void',
        'x-component': 'Space',
        properties: {},
      }
      result.properties[key1] = this.getInputNumber(
        i18n.t('packages_dag_migration_alarmpanel_lianxu'),
        10,
        key4,
      )
      result.properties[key2] = this.getSelect(i18n.t('public_time_m'))
      result.properties[key3] = this.getInputNumber('', 1000, key4)
      result.properties.ms = {
        title: 's',
        type: 'void',
        default: 0,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'horizontal',
        },
      }
      return result
    },

    getNodeType() {
      const { activeNodeId, allNodes } = this
      const { type, $inputs, $outputs } =
        allNodes.find((t) => t.id === activeNodeId) || {}
      if (!type) return ''
      if (type === 'database' || type === 'table') {
        if (!$inputs.length) return 'source'
        if (!$outputs.length) return 'target'
      }
      return 'process'
    },
  },
}
</script>

<template>
  <FormRender
    :key="activeNodeId"
    :form="form"
    :schema="schema"
    :scope="formScope"
  />
</template>

<style lang="scss" scoped>
.attr-panel {
  :deep(.attr-panel-body) {
    padding-top: 0;
  }

  :deep(.formily-element-plus-form-item-label label) {
    font-size: 12px;
  }

  :deep(.el-collapse-item__header) {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
