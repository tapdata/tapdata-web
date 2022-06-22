import { NodeType } from './extends/NodeType'

export class TableProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'table_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      operations: {
        type: 'array',
        'x-component': 'TableRename',
        'x-component-props': {
          findParentNode: '{{findParentNode}}'
        },
        items: {
          type: 'object',
          properties: {
            c1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '原表名',
                align: 'center',
                asterisk: false
              },
              properties: {
                source: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input'
                }
              }
            },
            c2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': {
                title: '新表名',
                align: 'center',
                asterisk: false
              },
              properties: {
                target: {
                  type: 'string',
                  loading: true,
                  required: true,
                  'x-decorator': 'Editable',
                  'x-component': 'Input'
                }
              }
            }
          }
        }
      }
    }
  }
}
