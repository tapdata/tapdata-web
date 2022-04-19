import { NodeType } from './extends/NodeType'

export class FieldAddDel extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {
    maxInputs: 1 // 最大输入个数
  }

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
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldsById, withoutField: true}, $values.$inputs[0])}}'
          // '{{useAfterPatchAsyncDataSource({service: loadNodeFieldsById, withoutField: true}, $values.id, $values.deleteAllFields)}}'
        ]
      },
      deleteAllFields: {
        type: 'boolean',
        default: true,
        display: 'none'
      }
    }
  }
}
