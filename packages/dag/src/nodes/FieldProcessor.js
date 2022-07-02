import { NodeType } from './extends/NodeType'

export class FieldProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'migrate_field_rename_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
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
