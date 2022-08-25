import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class Join extends NodeType {
  constructor() {
    super()
  }

  type = 'join_processor'

  maxInputs = 2 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none',
        'x-reactions': [
          {
            fulfill: {
              run: `
                // console.log('$self.value', $self.value, $values);
                if (($values.leftNodeId && !$self.value.includes($values.leftNodeId)) || !$values.leftNodeId) {
                  let nodeIds = $self.value.filter(v => v !== $values.rightNodeId)
                  $values.leftNodeId = nodeIds[0] || ''
                }
                
                if (($values.rightNodeId && !$self.value.includes($values.rightNodeId)) || !$values.rightNodeId) {
                  let nodeIds = $self.value.filter(v => v !== $values.leftNodeId)
                  $values.rightNodeId = nodeIds[0] || ''
                }
                // console.log('$inputs_$values', $values)
              `
            }
          }
        ]
      },
      leftNodeId: {
        type: 'string',
        display: 'none'
      },
      rightNodeId: {
        type: 'string',
        display: 'none'
      },

      joinType: {
        title: '连接类型',
        type: 'string',
        required: true,
        default: 'left',
        enum: [
          {
            label: '左连接',
            value: 'left'
          } /*,
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
                  }*/
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select'
      },

      joinExpressions: {
        title: '连接字段设置',
        type: 'array',
        required: true,
        default: [{ left: '', right: '', expression: '=' }],
        items: {
          type: 'object',
          properties: {
            left: {
              title: '左侧',
              type: 'string',
              required: true,
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                labelStyle: {
                  display: 'none'
                }
              },
              'x-component': 'FieldSelect',
              'x-component-props': {
                filterable: true
              }
            },
            right: {
              title: '右侧',
              type: 'string',
              required: true,
              'x-decorator': 'FormItem',
              'x-decorator-props': {
                labelStyle: {
                  display: 'none'
                }
              },
              'x-component': 'FieldSelect',
              'x-component-props': {
                filterable: true
              }
            }
          }
        },
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          layout: 'vertical'
        },
        'x-component': 'JoinExpression',
        'x-component-props': {
          findNodeById: '{{findNodeById}}',
          loadNodeFieldNamesById: '{{loadNodeFieldOptions}}'
        },
        'x-reactions': [
          {
            dependencies: ['leftNodeId'],
            fulfill: {
              schema: {
                'x-component-props.leftNodeId': '{{$deps[0]}}'
              }
            }
          },
          {
            dependencies: ['rightNodeId'],
            fulfill: {
              schema: {
                'x-component-props.rightNodeId': '{{$deps[0]}}'
              }
            }
          }
        ]
      }
    }
  }

  locales = AllLocales.Join
}
