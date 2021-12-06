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
      sourceNode: {
        type: 'string',
        'x-visible': false,
        'x-reactions': '{{getSourceNode}}'
      },
      leftNodeId: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'PreviewText.Select',
        'x-reactions': {
          dependencies: ['sourceNode'],
          fulfill: {
            state: {
              dataSource: '{{!!$deps[0]}}'
            }
          }
        }
      },
      rightNodeId: {
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'PreviewText.Select',
        'x-reactions': '{{getSourceNode}}'
      },
      joinExpression: {
        title: '连接字段设置',
        type: 'array',
        required: true,
        default: [{ left: '', right: '', expression: '=' }],
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 600
        },
        'x-component': 'ArrayItems',
        'x-reactions': ['{{useAsyncDataSource(loadSourceNodeField, , "dataSource", "object")}}'],
        items: {
          type: 'object',
          properties: {
            space: {
              type: 'void',
              'x-component': 'Space',
              properties: {
                left: {
                  type: 'string',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select'
                },
                expression: {
                  type: 'string',
                  required: true,
                  default: '=',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input'
                },
                right: {
                  type: 'string',
                  required: true,
                  'x-decorator': 'FormItem',
                  'x-component': 'Select'
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove'
                }
              }
            }
          }
        },
        properties: {
          add: {
            type: 'void',
            title: '添加',
            'x-component': 'ArrayItems.Addition',
            'x-component-props': {
              defaultValue: {
                expression: '='
              }
            }
          }
        }
      }
      /*nodeId: {
        title: 'sourceNode',
        type: 'string',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-component': 'Select',
        'x-reactions': '{{getSourceNode}}'
      }*/
    }
  }
}
