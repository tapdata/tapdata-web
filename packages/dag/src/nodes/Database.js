import { NodeType } from './extends/NodeType'

export class Database extends NodeType {
  constructor() {
    super()
  }

  type = 'database'

  minInputs = 0 // 最小输入个数

  maxInputs = 0 // 最大输入个数

  maxOutputs = 1 // 最大输出个数

  group = 'data'

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

      increaseReadSize: {
        title: '批量读取条数', //增量批次读取条数
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'InputNumber',
        'x-decorator-props': {
          tooltip: '全量每批次读取的条数'
        },
        'x-component-props': {
          min: 1,
          max: 100000
        },
        default: 100
      },

      syncObjects: {
        type: 'array',
        default: [
          {
            type: 'table',
            objectNames: []
          }
        ]
      },

      'attrs.howManyTable': {
        title: '选择表',
        type: 'string',
        default: 'all',
        'x-decorator': 'FormItem',
        'x-component': 'Radio.Group',
        enum: [
          {
            label: '全部',
            value: 'all'
          },
          {
            label: '自定义',
            value: 'some'
          }
        ]
      },

      'syncObjects.0.objectNames': {
        type: 'array',
        default: [],
        'x-component': 'TableSelector',
        'x-component-props': {
          connectionId: '{{$values.connectionId}}',
          style: {
            minHeight: 0,
            maxHeight: 'calc(100vh - 120px)'
          }
        },
        'x-reactions': {
          dependencies: ['attrs.howManyTable'],
          fulfill: {
            state: {
              display: '{{$deps[0] === "some" ? "visible":"hidden"}}'
            }
          }
        }
      },

      tableCard: {
        type: 'void',
        properties: {
          'syncObjects.0.objectNames': {
            type: 'string',
            'x-component': 'TableListCard',
            'x-component-props': {
              connectionId: '{{$values.connectionId}}'
            },
            'x-reactions': {
              dependencies: ['attrs.howManyTable'],
              fulfill: {
                state: {
                  display: '{{$deps[0] === "all" ? "visible":"hidden"}}'
                }
              }
            }
          }
        }
      },

      name: {
        type: 'string',
        'x-display': 'hidden'
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
    return node.type === 'database' && !node.attrs?.isTarget && !node.$inputs?.length
  }
}
