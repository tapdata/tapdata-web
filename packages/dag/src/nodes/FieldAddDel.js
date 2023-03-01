import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class FieldAddDel extends NodeType {
  constructor() {
    super()
  }

  type = 'field_add_del_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      name: {
        type: 'string',
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },
      operations: {
        type: 'array',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'FieldAddDel'
      },
      deleteAllFields: {
        type: 'boolean',
        default: false,
        display: 'none'
      }
    }
  }
}
