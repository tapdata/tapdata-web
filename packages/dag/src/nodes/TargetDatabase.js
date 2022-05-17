import { NodeType } from './extends/NodeType'

export class TargetDatabase extends NodeType {
  constructor() {
    super()
  }

  type = 'database'

  minInputs = 0 // 最小输入个数
  maxInputs = 1 // 最大输入个数
  maxOutputs = 0 // 最大输出个数

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

      'attrs.connectionName': {
        type: 'string',
        title: '连接名称',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          className: 'form-item-text'
        },
        'x-component': 'PreviewText.Input',
        'x-component-props': {
          style: {
            color: '#535F72'
          }
        }
      },

      // 所属agent
      'attrs.accessNodeProcessId': {
        type: 'string',
        title: '所属agent',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          className: 'form-item-text'
        },
        'x-component': 'PreviewText.Input',
        'x-component-props': {
          content:
            '{{$agentMap[$self.value] ? `${$agentMap[$self.value].hostName}（${$agentMap[$self.value].ip}）` : "-"}}',
          style: {
            color: '#535F72'
          }
        },
        'x-reactions': {
          fulfill: {
            state: {
              display: '{{!$self.value ? "hidden":"visible"}}'
            }
          }
        }
      },

      desc: {
        type: 'string',
        title: '节点描述',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          autosize: { maxRows: 2 }
        }
      },

      name: {
        type: 'string',
        'x-display': 'hidden'
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
              title: '高级设置'
            },
            properties: {
              writeStrategy: {
                type: 'string',
                title: '重复处理策略',
                default: 'updateOrInsert',
                enum: [
                  {
                    label: '更新写入',
                    value: 'updateWrite'
                  },
                  {
                    label: '追加写入',
                    value: 'appendWrite'
                  },
                  {
                    label: '更新已存在或者插入新数据',
                    value: 'updateOrInsert'
                  }
                ],
                'x-decorator': 'FormItem',
                required: true,
                'x-component': 'Select'
              },
              existDataProcessMode: {
                title: '数据写入策略',
                type: 'void',
                'x-decorator': 'FormItem',
                properties: {
                  grid1: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      checkMode: {
                        type: 'array',
                        'x-component': 'Checkbox.Group',
                        'x-decorator': 'FormItem',
                        enum: [
                          {
                            label: '插入事件',
                            value: 1
                          }
                        ]
                      },
                      existDataProcess: {
                        type: 'string',
                        'x-component': 'Select',
                        'x-decorator-props': {
                          wrapperWidth: 300
                        },
                        default: '1',
                        enum: [
                          {
                            label: '目标存在时更新，不存在时插入',
                            value: '1'
                          },
                          {
                            label: '目标存在时丢弃，不存在时插入',
                            value: '2'
                          }
                        ],
                        'x-decorator': 'FormItem',
                        required: true
                      }
                    }
                  },
                  grid2: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      checkMode: {
                        type: 'array',
                        'x-component': 'Checkbox.Group',
                        'x-decorator': 'FormItem',
                        enum: [
                          {
                            label: '更新事件',
                            value: 1
                          }
                        ]
                      },
                      existDataProcess: {
                        type: 'string',
                        'x-component': 'Select',
                        'x-decorator-props': {
                          wrapperWidth: 300
                        },
                        default: '1',
                        enum: [
                          {
                            label: '目标存在时更新，不存在时丢弃',
                            value: '1'
                          },
                          {
                            label: '目标存在时更新，不存在时插入',
                            value: '2'
                          }
                        ],
                        'x-decorator': 'FormItem',
                        required: true
                      }
                    }
                  },
                  grid3: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      checkMode: {
                        type: 'array',
                        'x-component': 'Checkbox.Group',
                        'x-decorator': 'FormItem',
                        default: true,
                        enum: [
                          {
                            label: '删除事件',
                            value: true
                          }
                        ]
                      },
                      existDataProcess: {
                        type: 'string',
                        'x-component': 'PreviewText.Input',
                        'x-component-props': {
                          content: '目标存在时删除，不存在时丢弃',
                          wrapperWidth: 300
                        },
                        'x-decorator': 'FormItem'
                      }
                    }
                  }
                }
              },
              increaseSyncInterval: {
                title: '目标写入线程数',
                type: 'number',
                default: 8,
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1,
                  max: 99
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
      }
    }
  }

  selector(node) {
    // attrs.isTarget 是UI属性，在无UI的模式生成的节点，通过是否有输入($inputs)来判断
    return node.type === 'database' && (node.attrs.isTarget || node.$inputs?.length)
  }
}
