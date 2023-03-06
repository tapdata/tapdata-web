import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class TargetDatabase extends NodeType {
  constructor() {
    super()
  }

  type = 'database'

  maxInputs = 1 // 最大输入个数

  // allowTarget = false // 该节点不允许有目标

  group = 'output'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      databaseType: {
        type: 'string',
        'x-display': 'hidden'
      },
      connectionId: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': '{{useSyncConnection}}'
      },

      layout: {
        type: 'void',
        'x-component': 'FormLayout',
        'x-component-props': {
          layout: 'horizontal',
          colon: false,
          labelAlign: 'left',
          labelWidth: 80,
          feedbackLayout: 'none'
        },
        properties: {
          'attrs.connectionName': {
            type: 'string',
            title: i18n.global.t('packages_dag_nodes_database_lianjiemingcheng'),
            'x-decorator': 'FormItem',
            'x-component': 'PreviewText.Input'
          },
          'attrs.accessNodeProcessId': {
            type: 'string',
            title: i18n.global.t('packages_dag_nodes_database_suoshuage'),
            'x-decorator': 'FormItem',
            'x-component': 'PreviewText.Input',
            'x-component-props': {
              content:
                '{{$agentMap[$self.value] ? `${$agentMap[$self.value].hostName}（${$agentMap[$self.value].ip}）` : "-"}}'
            },
            'x-reactions': {
              fulfill: {
                state: {
                  display: '{{!$self.value ? "hidden":"visible"}}'
                }
              }
            }
          }
        }
      },

      desc: {
        type: 'string',
        title: i18n.global.t('packages_dag_nodes_targetdatabase_jiedianmiaoshu'),
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          autosize: { maxRows: 2 }
        }
      },
      // clipBtn: {
      //   type: 'void',
      //   'x-decorator': 'FormItem',
      //   'x-component': 'ClipboardBtn'
      // },

      ddlEvents: {
        type: 'void',
        title: i18n.global.t('packages_dag_nodes_database_ddLshijian'),
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          tooltip: i18n.global.t('packages_dag_nodes_database_dangqianjiedianzhi'),
          feedbackLayout: 'none'
        },
        'x-component': 'DdlEventList',
        'x-component-props': {
          findParentNodes: '{{findParentNodes}}'
        }
      },

      name: {
        type: 'string',
        'x-display': 'hidden'
      },
      fieldMapping: {
        type: 'void',
        title: i18n.global.t('packages_dag_nodes_database_tuiyanjieguo'),
        'x-decorator': 'FormItem',
        'x-component': 'SchemaFiledMapping'
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
              title: i18n.global.t('packages_dag_task_stetting_most_setting')
            },
            properties: {
              existDataProcessMode: {
                type: 'string',
                title: i18n.global.t('packages_dag_nodes_database_chongfuchulice'),
                default: 'keepData',
                enum: [
                  {
                    label: i18n.global.t('packages_dag_nodes_database_qingchumubiaoduan'),
                    value: 'dropTable'
                  },
                  {
                    label: i18n.global.t('packages_dag_nodes_targetdatabase_baochimubiaoduan'),
                    value: 'removeData'
                  },
                  {
                    label: i18n.global.t('packages_dag_nodes_database_baochimubiaoduan'),
                    value: 'keepData'
                  }
                ],
                'x-decorator': 'FormItem',
                required: true,
                'x-component': 'Select'
              },
              dmlPolicy: {
                title: i18n.global.t('packages_dag_nodes_database_shujuxieruce'),
                type: 'object',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  feedbackLayout: 'none'
                },
                'x-component': 'FormLayout',
                'x-component-props': {
                  layout: 'horizontal',
                  colon: false,
                  feedbackLayout: 'none'
                },
                properties: {
                  insertPolicy: {
                    type: 'string',
                    'x-component': 'Select',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'font-color-dark mb-2',
                      wrapperWidth: 300,
                      addonBefore: i18n.global.t('packages_dag_nodes_database_charushijian')
                    },
                    default: 'update_on_exists',
                    enum: [
                      {
                        label: i18n.global.t('packages_dag_nodes_targetdatabase_mubiaocunzaishi'),
                        value: 'update_on_exists'
                      },
                      {
                        label: i18n.global.t('packages_dag_nodes_database_mubiaocunzaishi'),
                        value: 'ignore_on_exists'
                      }
                    ]
                  },
                  updatePolicy: {
                    type: 'string',
                    'x-component': 'Select',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'font-color-dark mb-2',
                      wrapperWidth: 300,
                      addonBefore: i18n.global.t('packages_dag_nodes_database_gengxinshijian')
                    },
                    default: 'ignore_on_nonexists',
                    enum: [
                      {
                        label: i18n.global.t('packages_dag_nodes_database_bucunzaishidiu'),
                        value: 'ignore_on_nonexists'
                      },
                      {
                        label: i18n.global.t('packages_dag_nodes_database_bucunzaishicha'),
                        value: 'insert_on_nonexists'
                      }
                    ]
                  },
                  deletePolicy: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'font-color-dark',
                      wrapperWidth: 300,
                      addonBefore: i18n.global.t('packages_dag_nodes_database_shanchushijian')
                    },
                    'x-component': 'Tag',
                    'x-content': i18n.global.t('packages_dag_nodes_database_bucunzaishidiu'),
                    'x-component-props': {
                      type: 'info',
                      effect: 'light'
                    }
                  }
                }
              },

              initialConcurrentSpace: {
                title: i18n.global.t('packages_dag_nodes_database_quanliangduoxiancheng'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  layout: 'horizontal'
                },
                type: 'void',
                'x-component': 'Space',
                'x-component-props': {
                  size: 'middle'
                },
                properties: {
                  initialConcurrent: {
                    type: 'boolean',
                    default: true,
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: '.initialConcurrentWriteNum',
                      fulfill: {
                        state: {
                          visible: '{{!!$self.value}}'
                        }
                      }
                    }
                  },
                  initialConcurrentWriteNum: {
                    type: 'number',
                    default: 8,
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 0
                    }
                  }
                }
              },
              cdcConcurrentSpace: {
                type: 'void',
                title: i18n.global.t('packages_dag_nodes_database_zengliangduoxiancheng'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  layout: 'horizontal'
                },
                'x-component': 'Space',
                'x-component-props': {
                  size: 'middle'
                },
                properties: {
                  cdcConcurrent: {
                    type: 'boolean',
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: '.cdcConcurrentWriteNum',
                      fulfill: {
                        state: {
                          visible: '{{!!$self.value}}'
                        }
                      }
                    }
                  },
                  cdcConcurrentWriteNum: {
                    type: 'number',
                    default: 4,
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 0
                    }
                  }
                }
              }
            }
          }
        }
      },

      // 切换连接，保存连接的类型
      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      },

      // 切换连接，保存连接的类型
      'attrs.capabilities': {
        type: 'array',
        'x-display': 'hidden',
        'x-reactions': '{{useDmlPolicy}}'
      }
    }
  }

  selector(node) {
    // attrs.isTarget 是UI属性，在无UI的模式生成的节点，通过是否有输入($inputs)来判断
    return node.type === 'database' && (node.attrs?.isTarget || node.$inputs?.length)
  }
}
