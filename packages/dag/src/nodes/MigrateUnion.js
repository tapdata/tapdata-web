import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class Union extends NodeType {
  constructor() {
    super()
  }

  minInputs = 0 // 最小输入个数
  maxInputs = 1 // 最小输入个数
  minOutputs = 0 // 最小输出个数
  maxOutputs = 1 // 最大输出个数

  type = 'migrate_union_processor'

  group = 'processor'

  formSchema = {
    properties: {
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
              nameWrap: {
                type: 'void',
                title: i18n.t('public_node_name'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: true,
                  feedbackLayout: 'none'
                },
                'x-component': 'FormFlex',
                'x-component-props': {
                  gap: 8,
                  align: 'start'
                },
                properties: {
                  name: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      style: {
                        flex: 1
                      }
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      onChange: `{{() => { $values.attrs.hasNameEdited = true }}}`
                    }
                  },

                  clipboardButton: {
                    type: 'void',
                    'x-component': 'ClipboardButton',
                    'x-component-props': {
                      tooltip: i18n.t('packages_dag_copy_node_id'),
                      finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi'),
                      content: '{{$values.id}}'
                    }
                  }
                }
              },
              tableName: {
                title: i18n.t('packages_dag_merged_tableName'),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  allowCreate: true,
                  filterable: true,
                  clearable: true,
                  defaultFirstOption: true,
                  placeholder: i18n.t('packages_dag_merged_tableName_ph')
                },
                'x-reactions': [
                  '{{useAsyncDataSourceByConfig({service: getNodeTableOptions, withoutField: true}, $values.id, $values.$inputs[0])}}'
                  // '{{useAfterPatchAsyncDataSource({service: getNodeTableOptions, withoutField: true}, $values.id, $values.$inputs[0])}}'
                ]
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
