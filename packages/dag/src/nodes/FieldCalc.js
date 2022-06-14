import { NodeType } from './extends/NodeType'

export class FieldCalc extends NodeType {
  constructor() {
    super()
  }

  type = 'field_calc_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      scripts: {
        type: 'array',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'FieldValue',
        'x-reactions':
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0])}}'
      }
    }
  }
}
