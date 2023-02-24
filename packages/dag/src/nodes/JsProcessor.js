import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class JavaScript extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_js_processor'

  beta = true

  maxInputs = 1 // 最大输入个数
  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      // 组件内需要监听$inputs的响应
      $inputs: {
        type: 'array',
        display: 'none',
      },
      name: {
        type: 'string',
        title: i18n.t('packages_dag_nodes_database_jiedianmingcheng'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
      },
      script: {
        type: 'string',
        required: true,
        default:
          'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}',
        'x-component': 'JsProcessor',
        'x-component-props': {
          height: 500,
          options: { showPrintMargin: false, wrap: false },
          includeBeforeAndAfter: true,
          before: 'function process(record){',
          beforeRegexp: '^[^]*function\\s+process\\s*\\(record\\)\\{',
          afterRegexp: '}[^}]*$',
          after: '}',
          param: 'schemaApplyResultList',
          handleAddCompleter: '{{addDeclaredCompleterForMigrate}}',
        },
      },
    },
  }

  locales = AllLocales.JavaScript
}
