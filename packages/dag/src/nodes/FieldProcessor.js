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
      fieldsMapping: {
        type: 'array',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'FieldRenameProcessor',
        'x-component-props': {
          nodeId: '{{$values.id}}'
        }
      }
      // loadSchemaButton: {
      //   type: 'void',
      //   title: '',
      //   'x-decorator': 'FormItem',
      //   'x-component': 'Button',
      //   'x-content': '加載模型',
      //   'x-component-props': {
      //     onClick:
      //       '{{useAsyncDataSourceByConfig({service: getCommandAndSetValue, withoutField: true}, $form, {nodeId:$values.id})}}'
      //   }
      // },
      // loadSchemaTree: {
      //   type: 'void',
      //   title: '',
      //   required: true,
      //   'x-decorator': 'FormItem',
      //   'x-component': 'loadSchemaTree'
      // }
    }
  }
}
