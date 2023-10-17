import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class TableProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'table_rename_processor'

  maxInputs = 1 // 最大输入个数
  maxOutputs = 1 // 最大输出个数

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
          class: 'config-tabs',
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
              name: {
                type: 'string',
                title: i18n.t('public_node_name'),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
              },
              tableNames: {
                type: 'array',
                'x-component': 'TableRename',
                'x-component-props': {
                  findParentNodes: '{{findParentNodes}}',
                  listStyle: {
                    maxHeight: 'calc((100vh - 120px) * 0.618)',
                  },
                },
                'x-validator': {
                  validator: `{{validateTableNames}}`,
                  message: i18n.t(
                    'packages_dag_nodes_tableprocessor_biaomingchongfu'
                  ),
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
