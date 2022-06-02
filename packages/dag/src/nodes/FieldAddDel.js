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
      operations: {
        type: 'array',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'FieldAddDel',
        'x-reactions': [
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0])}}',
          '{{useAfterPatchAsyncDataSource({service: loadNodeFieldsById, withoutField: true}, $self.value.length ? $values.id : $values.$inputs[0], $values.deleteAllFields)}}'
        ]
      },
      deleteAllFields: {
        type: 'boolean',
        default: false,
        display: 'none'
      }
    }
  }
}
