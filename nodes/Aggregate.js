import { NodeType } from './extends/NodeType'

export class Aggregate extends NodeType {
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
      primaryKeys: {
        title: '主键',
        type: 'string',
        required: true,
        default: 'column_2',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-reactions': ['{{useAsyncDataSource(loadNodeFieldNames)}}']
      },
      aggregations: {
        type: 'array',
        'x-component': 'ArrayAggregate',
        'x-reactions': {
          dependencies: ['primaryKeys'],
          fulfill: {
            state: {
              dataSource: '{{$form.getFieldState("primaryKeys").dataSource}}'
            }
          }
        }
      }
    }
  }
}
