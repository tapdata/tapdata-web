import { NodeType } from './extends/NodeType'

export class JavaScript extends NodeType {
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
      script: {
        title: '脚本',
        type: 'string',
        required: true,
        default: 'function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}',
        'x-decorator': 'FormItem',
        'x-component': 'JsEditor',
        'x-component-props': {
          options: { showPrintMargin: false, useWrapMode: true }
        }
      }
    }
  }
}
