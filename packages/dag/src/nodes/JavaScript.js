import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class JavaScript extends NodeType {
  constructor() {
    super()
  }

  type = 'js_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        properties: {
          script: {
            title: '脚本',
            type: 'string',
            required: true,
            default: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}',
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'JsEditor',
            'x-component-props': {
              height: 500,
              options: { showPrintMargin: false, useWrapMode: true }
            }
          },
          declareScript: {
            title: 'Declare 脚本',
            type: 'string',
            required: true,
            default: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 1 },
            'x-component': 'JsEditor',
            'x-component-props': {
              height: 500,
              options: { showPrintMargin: false, useWrapMode: true }
            }
          }
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
