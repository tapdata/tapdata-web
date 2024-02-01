import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldModTypeFilter extends NodeType {
  constructor() {
    super()
  }

  type = 'field_mod_type_filter_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
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
              filterTypes: {
                type: 'array',
                title: i18n.t('packages_dag_nodes_database_xuanzeyaoguolvdiaode'),
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-component-props': {
                  multiple: true,
                },
                'x-reactions':
                  '{{useAsyncDataSourceByConfig({service: loadNodeFieldTypesById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0])}}',
              },
              fieldList: {
                type: 'void',
                title: i18n.t('packages_dag_nodes_database_guolvjieguo'),
                'x-decorator': 'FormItem',
                'x-component': 'fieldList',
                'x-component-props': {
                  nodeId: '{{$values.id}}',
                  hideNav: true,
                },
              },
              schemaPreview: {
                type: 'void',
                'x-component': 'SchemaPreview',
              },
            },
          },
        },
      },
    },
  }
}
