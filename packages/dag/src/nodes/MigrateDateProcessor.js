import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class MigrateDateProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_date_processor'

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
      dataTypes: {
        type: 'array',
        title: i18n.t('packages_dag_date_processor_data_types'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          multiple: true
        },
        'x-reactions': [`{{usePdkFieldDateType($values.$inputs[0])}}`]
      },
      space: {
        type: 'void',
        title: i18n.t('packages_dag_date_processor_method'),
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          asterisk: true
        },
        'x-component': 'Space',
        properties: {
          add: {
            type: 'boolean',
            'x-decorator': 'FormItem',
            'x-component': 'Select',
            default: true,
            enum: [
              {
                label: i18n.t('packages_dag_date_processor_increase'),
                value: true
              },
              {
                label: i18n.t('packages_dag_date_processor_decrease'),
                value: false
              }
            ]
          },
          hours: {
            type: 'number',
            default: 8,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              addonAfter: i18n.t('public_time_h')
            },
            'x-component': 'InputNumber',
            'x-component-props': {
              min: 1
            }
          }
        }
      }
    }
  }
}
