import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class JavaScript extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_js_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      // 组件内需要监听$inputs的响应
      $inputs: {
        type: 'array',
        display: 'none'
      },
      /*declareScript: {
        title: '模型声明',
        type: 'string',
        required: true,
        default: '',
        'x-decorator': 'FormItem',
        'x-component': 'JsEditor',
        'x-component-props': {
          height: 240,
          options: { showPrintMargin: false, useWrapMode: true },
          before: 'function declare(schemaApplyResultList) {',
          after: `  return schemaApplyResultList\n}`
        }
      },*/
      script: {
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
          afterRegexp: '}[^]*$',
          after: '}',
          handleAddCompleter: '{{addDeclaredCompleterForMigrate}}'
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
