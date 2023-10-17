import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldRename extends NodeType {
  constructor() {
    super()
  }

  type = 'field_rename_processor'

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
              operations: {
                type: 'array',
                title: '',
                'x-decorator': 'FormItem',
                'x-component': 'FieldRename',
                'x-component-props': {
                  getFields: '{{loadNodeFieldsById}}',
                },
                // 'x-reactions': [
                //   '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $values.id)}}',
                //   '{{useAfterPatchAsyncDataSource({service: loadNodeFieldsById, withoutField: true}, $values.id, $values.$inputs[0], $values.fieldsNameTransform)}}'
                // ],
                fieldsNameTransform: {
                  type: 'string',
                  default: '',
                  display: 'none',
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
