import { NodeType } from './extends/NodeType'

export class Table extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {}

  group = 'data'

  formSchema = {
    type: 'object',
    properties: {
      connectionId: {
        type: 'string',
        title: '数据库',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-component': 'Select',
        'x-component-props': {
          config: { placeholder: '请选择数据库' }
        },
        'x-reactions': '{{useAsyncDataSource(loadDatabase, "dataSource")}}'
      },
      tableName: {
        title: '表',
        type: 'string',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-component': 'Select',
        'x-component-props': {
          config: { placeholder: '请选择表，区分大小写' }
        },
        'x-reactions': '{{useAsyncDataSource(loadDatabaseTable)}}'
      },
      name: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': {
          dependencies: ['.tableName'],
          fulfill: {
            state: {
              value: '{{$deps[0]}}'
            }
          }
        }
      },
      dropTable: {
        type: 'boolean',
        title: '已存在的数据',
        enum: [
          {
            label: '保持已存在的数据',
            value: false
          },
          {
            label: '运行前删除已存在的数据',
            value: true
          }
        ],
        default: false,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-component': 'Select',
        'x-reactions': {
          dependencies: ['inputLanes'],
          fulfill: {
            state: {
              visible: '{{!!$deps[0] && $deps[0].length>0}}'
            }
          }
        }
      },
      isSource: {
        type: 'boolean',
        'x-visible': false,
        'x-reactions': '{{isSource}}'
      },
      isTarget: {
        type: 'boolean',
        'x-visible': false,
        'x-reactions': '{{isTarget}}'
      },

      sourceNodeConfig: {
        type: 'void',
        'x-reactions': {
          dependencies: ['isSource'],
          fulfill: {
            state: {
              visible: '{{console.log("isSource", $deps[0]),!!$deps[0]}}'
            }
          }
        },
        properties: {
          totalReadMethod: {
            title: '全量数据读取配置',
            type: 'string',
            default: 'fullRead',
            enum: [
              {
                label: '全量读取',
                value: 'fullRead'
              },
              {
                label: '自定义sql',
                value: 'customizeSql'
              }
            ],
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 240
            },
            'x-component': 'Radio.Group'
          },
          totalsql: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 800
            },
            'x-component': 'SqlEditor',
            'x-component-props': {
              options: { showPrintMargin: false, useWrapMode: true }
            },
            'x-reactions': {
              dependencies: ['totalReadMethod'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="customizeSql"}}'
                }
              }
            }
          },
          increasePoll: {
            title: '增量数据读取配置',
            type: 'string',
            default: 'fullRead',
            enum: [
              {
                label: '日志CDC',
                value: 'fullRead'
              },
              {
                label: '自定义sql',
                value: 'customizeSql'
              }
            ],
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 240
            },
            'x-component': 'Radio.Group',
            'x-reactions': {
              dependencies: ['isSource'],
              fulfill: {
                state: {
                  visible: '{{!!$deps[0]}}'
                }
              }
            }
          },
          increasesql: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 800
            },
            'x-component': 'SqlEditor',
            'x-component-props': {
              options: { showPrintMargin: false, useWrapMode: true }
            },
            'x-reactions': {
              dependencies: ['increasePoll'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="customizeSql"}}'
                }
              }
            }
          },
          initialOffset: {
            title: 'sql增量条件',
            type: 'string',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 240
            },
            'x-component': 'Input',
            'x-reactions': {
              dependencies: ['increasePoll'],
              fulfill: {
                state: {
                  visible: '{{$deps[0]==="customizeSql"}}'
                }
              }
            }
          },
          /*increaseSyncTitle: {
            title: '增量轮询配置',
            type: 'void',
            'x-component': 'FormTitle'
          },*/
          increase: {
            type: 'void',
            'x-component': 'Space',
            properties: {
              increaseSyncInterval: {
                title: '增量同步间隔（ms）',
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber'
              },
              increaseReadSize: {
                title: '每次读取数量（行）',
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber'
              },
              processorThreadNum: {
                title: '处理器线程数',
                type: 'number',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber'
              }
            }
          },
          maxTransactionDuration: {
            title: '事务最大时长',
            type: 'number',
            'x-decorator': 'FormItem',
            'x-component': 'InputNumber'
          }
        }
      }
    }
  }
  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {
      ...this.attr
    }
  }
}
