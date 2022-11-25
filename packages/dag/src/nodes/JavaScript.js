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
      $inputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      name: {
        type: 'string',
        title: '节点名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
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
          showFullscreen: true,
          options: { showPrintMargin: false, wrap: false },
          includeBeforeAndAfter: true,
          before: 'function process(record){',
          beforeRegexp: '^[^]*function\\s+process\\s*\\(record\\)\\{',
          afterRegexp: '}[^}]*$',
          after: '}'
        }
      },
      declareScript: {
        type: 'string',
        'x-component': 'JsDeclare',
        'x-component-props': {
          height: 300,
          options: { showPrintMargin: false, wrap: false },
          handleAddCompleter: '{{addDeclaredCompleterForSync}}'
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
