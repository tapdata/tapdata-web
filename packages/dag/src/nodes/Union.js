import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class Union extends NodeType {
  constructor() {
    super()
  }

  type = 'union_processor'

  group = 'processor'

  formSchema = {
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
      }
    }
  }
}
