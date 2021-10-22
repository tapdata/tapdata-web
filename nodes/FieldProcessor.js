import { NodeType } from './extends/NodeType'

export class FieldProcessor extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {}

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      operations: {
        type: 'object',
        title: '',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'FieldProcess',
        'x-reactions': ['{{useAsyncDataSource(loadTableField)}}']
      }
    }
  }
}
