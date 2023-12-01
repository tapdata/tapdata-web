import i18n from '@tap/i18n'
export class NodeType {
  constructor() {}
  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {}
  }

  validate() {
    return true
  }

  /**
   * 验证能否作为该节点的目标
   */
  allowTarget() {
    return true
  }

  /**
   * 验证能否作为该节点的源
   */
  allowSource() {
    return true
  }

  selector(node) {
    if (!this.type) throw new Error(i18n.t('packages_dag_extends_nodetype_queshaobiyaode'))
    return node.type === this.type
  }

  getSchema() {
    const { formSchema } = this

    if (formSchema.properties.tabs) {
      formSchema.properties.tabs['x-decorator'] = 'FormItem'
      const props = formSchema.properties.tabs['x-decorator-props'] || {}
      formSchema.properties.tabs['x-decorator-props'] = {
        ...props,
        class: 'config-tabs-decorator',
      }

      if (this.group === 'processor' && !formSchema.properties.tabs.properties.alarmTab) {
        formSchema.properties.tabs.properties.alarmTab = {
          type: 'void',
          'x-component': 'FormTab.TabPane',
          'x-component-props': {
            label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi'),
          },
          // 'x-hidden': '{{!$isMonitor}}',
          properties: {
            alarmSettings: {
              type: 'array',
              default: [
                {
                  type: 'PROCESSNODE',
                  sort: 1,
                  open: true,
                  key: 'PROCESSNODE_AVERAGE_HANDLE_CONSUME',
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
              ],
            },
            alarmRules: {
              type: 'array',
              default: [
                {
                  key: 'PROCESSNODE_AVERAGE_HANDLE_CONSUME',
                  point: 60,
                  equalsFlag: 1,
                  ms: 30000,
                },
              ],
            },
            'alarmSettings.0.open': {
              title: i18n.t('packages_business_setting_alarmnotification_dangjiediandeping'),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmRules[0].notify.length && ($values.alarmRules[0].notify=["SYSTEM"]))}}`,
              },
              'x-reactions': {
                target: 'alarmRules.0.*',
                fulfill: {
                  state: {
                    disabled: `{{!$self.value}}`,
                  },
                },
              },
            },
            'alarmRules.0.notify': {
              type: 'array',
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
            },
            space: {
              type: 'void',
              'x-component': 'Space',
              properties: {
                'alarmRules.0.point': {
                  type: 'number',
                  'x-reactions': [
                    {
                      dependencies: ['._point'],
                      fulfill: {
                        state: {
                          value: `{{Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12)}}`,
                        },
                      },
                    },
                    {
                      target: 'alarmRules.0._point',
                      effects: ['onFieldInit'],
                      fulfill: {
                        state: {
                          value: `{{Math.ceil($self.value / 12) < 1 ? 1 : Math.ceil($self.value / 12)}}`,
                        },
                      },
                    },
                  ],
                },
                'alarmRules.0._point': {
                  title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                  type: 'number',
                  'x-editable': true,
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
                },
                'alarmRules.0.equalsFlag': {
                  title: i18n.t('public_time_m'),
                  type: 'number',
                  default: 1,
                  'x-editable': true,
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
                  'x-reactions': {
                    dependencies: ['.open'],
                    fulfill: {
                      state: {
                        disabled: `{{!$deps[0]}}`,
                      },
                    },
                  },
                },
                'alarmRules.0.ms': {
                  type: 'number',
                  'x-reactions': [
                    {
                      dependencies: ['._ms'],
                      fulfill: {
                        state: {
                          value: `{{Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000)}}`,
                        },
                      },
                    },
                    {
                      target: 'alarmRules.0._ms',
                      effects: ['onFieldInit'],
                      fulfill: {
                        state: {
                          value: `{{Math.ceil($self.value / 1000) < 1 ? 1 : Math.ceil($self.value / 1000)}}`,
                        },
                      },
                    },
                  ],
                },
                'alarmRules.0._ms': {
                  title: '',
                  type: 'number',
                  'x-editable': true,
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
                },
                unit: {
                  title: 's',
                  type: 'void',
                  default: 0,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    layout: 'horizontal',
                  },
                },
              },
            },
          },
        }
        return formSchema
      }
    }

    return formSchema
  }
}
