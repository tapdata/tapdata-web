import { NodeType } from './extends/NodeType'

export class FieldModType extends NodeType {
  constructor() {
    super()
  }

  type = 'field_mod_type_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      operations: {
        type: 'array',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'FieldModType',
        'x-reactions': '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $values.id)}}'
      }
    }
  }
}
