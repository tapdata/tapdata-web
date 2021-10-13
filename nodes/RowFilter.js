import { NodeType } from './extends/NodeType'

export class RowFilter extends NodeType {
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
      name: {
        title: '节点名称',
        type: 'string',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请输入节点名称' }
        }
      },
      action: {
        title: '主键',
        type: 'string',
        required: true,
        enum: [
          {
            label: '保留匹配数据',
            value: 'retain'
          },
          {
            label: '创建匹配数据',
            value: 'discard'
          }
        ],
        'x-decorator': 'ElFormItem',
        'x-component': 'Select'
      },
      expression: {
        title: '条件表达式',
        type: 'string',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'JsEditor',
        'x-component-props': {
          options: { showPrintMargin: false, useWrapMode: true }
        }
      }
    }
  }
}
