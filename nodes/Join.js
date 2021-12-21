import { NodeType } from './extends/NodeType'

export class Join extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {
    maxInputs: 2 // 最大输入个数
  }

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      sourceNode: {
        type: 'string',
        'x-visible': false,
        'x-reactions': '{{getSourceNode}}'
      },
      leftNodeId: {
        type: 'string',
        display: 'none',
        'x-reactions': {
          dependencies: ['sourceNode'],
          fulfill: {
            state: {
              value: '{{$deps[0] && $deps[0][0] ? $deps[0][0].value : ""}}'
            }
          }
        }
      },
      rightNodeId: {
        type: 'string',
        display: 'none',
        'x-reactions': {
          dependencies: ['sourceNode'],
          fulfill: {
            state: {
              value: '{{$deps[0] && $deps[0][1] ? $deps[0][1].value : ""}}'
            }
          }
        }
      },

      grid: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': {
          align: 'stretch',
          size: 32,
          split: true
        },
        properties: {
          leftCell: {
            type: 'void',
            properties: {
              joinType: {
                title: '连接类型',
                type: 'string',
                required: true,
                default: 'left',
                enum: [
                  {
                    label: '左连接',
                    value: 'left'
                  },
                  {
                    label: '右连接',
                    value: 'right'
                  },
                  {
                    label: '内连接',
                    value: 'inner'
                  },
                  {
                    label: '全连接',
                    value: 'full'
                  }
                ],
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  wrapperWidth: 240
                },
                'x-component': 'Select'
              },

              embeddedMode: {
                type: 'boolean',
                title: '内嵌模式',
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': {
                  target: 'embeddedSetting',
                  fulfill: {
                    state: {
                      visible: '{{!!$self.value}}'
                    }
                  }
                }
              },
              embeddedSetting: {
                type: 'object',
                properties: {
                  main: {
                    type: 'string',
                    title: '内嵌对象',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 240
                    },
                    'x-component': 'PreviewText.Input',
                    'x-reactions': {
                      dependencies: ['sourceNode', 'joinType'],
                      fulfill: {
                        state: {
                          value:
                            '{{console.log("$deps[0]",$deps[0]&&$deps[0][1]&&$deps[0][1].label),$deps[1] === "left" ? $deps[0]&&$deps[0][1]&&$deps[0][1].label : $deps[0]&&$deps[0][0]&&$deps[0][0].label}}'
                        }
                      }
                    }
                  },
                  path: {
                    type: 'string',
                    title: '内嵌路径',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 240
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      placeholder: '默认为表名'
                    }
                  },
                  format: {
                    type: 'string',
                    title: '内嵌类型',
                    default: 'object',
                    enum: [
                      {
                        label: '文档',
                        value: 'object'
                      },
                      {
                        label: '数组',
                        value: 'array'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 240
                    },
                    'x-component': 'Radio.Group'
                  }
                }
              }
            }
          },

          rightCell: {
            type: 'void',
            properties: {
              joinExpressions: {
                title: '连接字段设置',
                type: 'array',
                required: true,
                default: [{ left: '', right: '', expression: '=' }],
                items: {
                  type: 'object',
                  properties: {
                    left: {
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select'
                    },
                    right: {
                      type: 'string',
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-component': 'Select'
                    }
                  }
                },
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  layout: 'vertical'
                },
                'x-component': 'JoinExpression',
                'x-reactions': [
                  {
                    dependencies: ['leftNodeId', 'rightNodeId']
                  },
                  '{{useAsyncDataSource(loadSourceNodeField, "dataSource", "object")}}'
                ]
              }
            }
          }
        }
      }
    }
  }
}
