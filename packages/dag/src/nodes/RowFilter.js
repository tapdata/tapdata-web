import { NodeType } from './extends/NodeType'

export class RowFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'row_filter_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      action: {
        title: '执行动作',
        type: 'string',
        required: true,
        default: 'retain',
        enum: [
          {
            label: '保留匹配数据',
            value: 'retain'
          },
          {
            label: '丢弃匹配数据',
            value: 'discard'
          }
        ],
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240
        }
      },
      expression: {
        title: '条件表达式',
        type: 'string',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'JsEditor',
        'x-decorator-props': {
          wrapperWidth: 800
        },
        'x-component-props': {
          options: { showPrintMargin: false, useWrapMode: true }
        }
      },
      example: {
        type: 'void',
        'x-component': 'ExpressionExample'
      }
    }
  }
}
