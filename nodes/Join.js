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
      joinExpressions: {
        title: '连接字段设置',
        type: 'array',
        required: true,
        default: [{ left: '', right: '', expression: '=' }],
        'x-decorator': 'FormItem',
        'x-component': 'JoinExpression',
        'x-reactions': [
          /*{
            dependencies: ['sourceNode'],
            fulfill: {
              state: {
                sourceNode: '{{$deps[0]}}'
              }
            }
          },*/
          {
            dependencies: ['leftNodeId', 'rightNodeId']
          },
          '{{useAsyncDataSource(loadSourceNodeField, "dataSource", "object")}}'
        ]
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
          fields: {
            type: 'array',
            title: '内嵌对象',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 240
            },
            'x-component': 'Select'
          },
          path: {
            type: 'string',
            title: '内嵌路径(默认为表名)',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              wrapperWidth: 240
            },
            'x-component': 'Input'
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
  }
}
