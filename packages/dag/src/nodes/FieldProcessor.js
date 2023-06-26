import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_field_rename_processor'

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
              fieldsOperation: {
                type: 'object',
                default: {
                  prefix: '',
                  suffix: '',
                  capitalized: ''
                }
              },
              fieldsMapping: {
                type: 'array',
                title: '',
                'x-decorator': 'FormItem',
                'x-component': 'FieldRenameProcessor',
                'x-component-props': {
                  nodeId: '{{$values.id}}'
                }
              }
            }
          }
        }
      }
    }
  }
}
