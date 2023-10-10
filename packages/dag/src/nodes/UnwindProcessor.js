import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'unwind_processor'

  maxInputs = 1 // 最大输入个数
  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          class: 'config-tabs',
          formTab: '{{formTab}}'
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings')
            },
            properties: {
              name: {
                type: 'string',
                title: i18n.t('public_node_name'),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input'
              },
              path: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_path'),
                'x-decorator': 'FormItem',
                'x-component': 'FieldSelect',
                'x-reactions': `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.$inputs[0])}}`
              },
              includeArrayIndex: {
                type: 'string',
                title: i18n.t('packages_dag_unwind_includeArrayIndex'),
                'x-decorator': 'FormItem',
                'x-component': 'Input'
              },
              preserveNullAndEmptyArrays: {
                type: 'boolean',
                title: i18n.t('packages_dag_unwind_preserveNullAndEmptyArrays'),
                'x-component': 'Switch',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  tooltip: i18n.t('packages_dag_unwind_preserveNullAndEmptyArrays_tips')
                }
              }
            }
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_data_schema')
            },
            properties: {
              schemaPanel: {
                type: 'void',
                'x-component': 'SchemaPanel',
                'x-component-props': {
                  class: 'mx-n4 my-n1',
                  formTab: '{{formTab}}'
                }
              }
            }
          }
        }
      }
    }
  }
}
