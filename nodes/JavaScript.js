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

  attr = {
    maxInputs: 1 // 最大输入个数
  }

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
        'x-decorator-props': {
          wrapperWidth: 800
        },
        'x-component-props': {
          options: { showPrintMargin: false, useWrapMode: true }
        }
      }
    }
  }
}
