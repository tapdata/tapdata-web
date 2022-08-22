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
        'x-component-props': {
          columnGap: 16,
          minColumns: 3,
          maxColumns: 3
        },
        properties: {
          script: {
            title: '脚本',
            type: 'string',
            required: true,
            default: 'function process(record){\n\t// Enter you code at here\n\treturn record;\n}',
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 2 },
            'x-component': 'JsEditor',
            'x-component-props': {
              height: 500,
              options: { showPrintMargin: false, wrap: false },
              includeBeforeAndAfter: true,
              before: 'function process(record){',
              beforeRegexp: '^[^]*function\\s+process\\s*\\(record\\)\\{',
              afterRegexp: '}[^}]*$',
              after: '}'
            }
          },
          declareScript: {
            title: '模型声明',
            type: 'string',
            default: '',
            'x-decorator': 'FormItem',
            'x-decorator-props': { gridSpan: 1 },
            'x-component': 'JsEditor',
            'x-component-props': {
              height: 500,
              options: { showPrintMargin: false, wrap: false },
              before: 'function declare(tapTable) {',
              after: `  return tapTable\n}`,
              handleAddCompleter: '{{addDeclaredCompleterForSync}}'
            }
          }
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
