import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class StandardJs extends NodeType {
  constructor() {
    super()
  }

  type = 'standard_migrate_js_processor'

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
        default: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}',
        'x-component': 'JsProcessor',
        'x-component-props': {
          height: 500,
          options: { showPrintMargin: false, wrap: false },
          includeBeforeAndAfter: true,
          before: 'function process(record){',
          beforeRegexp: '^[^]*function\\s+process\\s*\\(record\\)\\{',
          afterRegexp: '}[^}]*$',
          after: '}',
          param: 'tapTable',
          handleAddCompleter: '{{addDeclaredCompleterForSync}}'
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
