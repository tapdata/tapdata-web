import i18n from '@tap/i18n'

const FEATURE_CONTROLS = {
  fullBreakpointResume: 'resume',
  shareCache: 'tabs.advancedTab.sourceCollapse.sharedCache',
}

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
    if (!this.type)
      throw new Error(i18n.t('packages_dag_extends_nodetype_queshaobiyaode'))
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

      if (this.group === 'processor') {
        if (formSchema.properties.tabs.properties.tab1) {
          formSchema.properties.tabs.properties.tab1['x-index'] = 1
        }

        if (formSchema.properties.tabs.properties.tab2) {
          formSchema.properties.tabs.properties.tab2['x-index'] = 3
        }

        if (!formSchema.properties.tabs.properties.advancedTab) {
          formSchema.properties.tabs.properties.advancedTab = {
            type: 'void',
            'x-index': 2,
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_advanced_settings'),
            },
            properties: {
              space: {
                // title: i18n.t('packages_dag_nodes_database_quanliangduoxiancheng'),
                type: 'void',
                'x-component': 'Space',
                'x-component-props': {
                  class: 'py-3',
                  size: 'middle',
                },
                properties: {
                  enableConcurrentProcess: {
                    title: i18n.t('packages_dag_enableConcurrentProcess'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: 'concurrentNum',
                      fulfill: {
                        state: {
                          visible: '{{!!$self.value}}',
                        },
                      },
                    },
                  },
                  concurrentNum: {
                    title: i18n.t('packages_dag_concurrentNum'),
                    type: 'number',
                    default: 2,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                    },
                  },
                },
              },
            },
          }
        }

        if (!formSchema.properties.tabs.properties.alarmTab) {
          formSchema.properties.tabs.properties.alarmTab = {
            type: 'void',
            'x-index': 4,
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi'),
              locked: import.meta.env.VUE_APP_MODE === 'community',
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
              'alarmSettings.0': {
                type: 'object',
                title: i18n.t(
                  'packages_business_setting_alarmnotification_dangjiediandeping',
                ),
                'x-decorator': 'FormItem',
                'x-component': 'div',
                'x-component-props': {
                  class: 'flex align-center',
                },
                properties: {
                  open: {
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`,
                    },
                  },
                  divider: {
                    type: 'void',
                    'x-component': 'Divider',
                    'x-component-props': {
                      direction: 'vertical',
                      class: 'mx-4',
                    },
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                        },
                      },
                    },
                  },
                  notify: {
                    type: 'array',
                    'x-editable': true,
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    enum: '{{$alarmChannels}}',
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                        },
                      },
                    },
                  },
                },
              },
              'alarmRules.0': {
                type: 'object',
                'x-component': 'Space',
                'x-reactions': {
                  dependencies: ['alarmSettings.0.open'],
                  fulfill: {
                    state: {
                      display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                    },
                  },
                },
                properties: {
                  point: {
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
                  _point: {
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
                  equalsFlag: {
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
                  },
                  ms: {
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
                  _ms: {
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
        }

        return formSchema
      }
    }

    return formSchema
  }
}
