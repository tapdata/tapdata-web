import { NodeType } from './extends/NodeType'

export class FieldProcessor extends NodeType {
  constructor() {
    super()
  }

  type = 'field_processor'

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
        'x-component': 'FieldProcess',
        'x-reactions':
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $values.$inputs[0])}}'
      },
      scripts: {
        type: 'array',
        display: 'none'
      }
    }
  }
}
