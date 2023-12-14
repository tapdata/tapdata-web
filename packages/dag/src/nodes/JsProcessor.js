import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

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
      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          'config-tabs': true,
          formTab: '{{formTab}}',
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings'),
            },
            properties: {
              nameWrap: {
                type: 'void',
                title: i18n.t('public_node_name'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: true,
                  feedbackLayout: 'none',
                },
                'x-component': 'FormFlex',
                'x-component-props': {
                  gap: 8,
                  align: 'start',
                },
                properties: {
                  name: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      style: {
                        flex: 1,
                      },
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      onChange: `{{() => { $values.attrs.hasNameEdited = true }}}`,
                    },
                  },

                  clipboardButton: {
                    type: 'void',
                    'x-component': 'ClipboardButton',
                    'x-component-props': {
                      tooltip: i18n.t('packages_dag_copy_node_id'),
                      finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi'),
                      content: '{{$values.id}}',
                    },
                  },
                },
              },
              jsType: {
                type: 'number',
                title: i18n.t('public_type'),
                default: 0,
                enum: [
                  {
                    label: i18n.t('packages_dag_default_js'),
                    value: 0,
                  },
                  {
                    label: i18n.t('packages_dag_standardization_js'),
                    value: 1,
                  },
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group',
              },
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
                  afterRegexp: '}[^}]*$',
                  after: '}',
                  param: 'schemaApplyResultList',
                  handleAddCompleter: '{{addDeclaredCompleterForMigrate}}',
                },
              },
            },
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_data_schema'),
            },
            properties: {
              schemaPanel: {
                type: 'void',
                'x-component': 'SchemaPanel',
                'x-component-props': {
                  class: 'mx-n4 my-n1',
                  formTab: '{{formTab}}',
                },
              },
            },
          },
        },
      },
    },
  }
}
