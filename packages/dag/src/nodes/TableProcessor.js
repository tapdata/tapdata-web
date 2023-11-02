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
      tableNames: {
        type: 'array',
        'x-component': 'TableRename',
        'x-component-props': {
          findParentNodes: '{{findParentNodes}}',
          listStyle: {
            maxHeight: 'calc((100vh - 120px) * 0.618)'
          }
        },
        'x-validator': {
          validator: `{{validateTableNames}}`,
          message: i18n.t('packages_dag_nodes_tableprocessor_biaomingchongfu')
        }
      }
    }
  }
}
