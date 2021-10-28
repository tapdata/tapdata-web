import { NodeType } from './extends/NodeType'

export class JointCache extends NodeType {
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
      cacheId: {
        title: '对应缓存节点',
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
        'x-decorator': 'FormItem',
        'x-component': 'Select'
        // 'x-component': 'ComboSelect'
      },
      joinSettings: {
        type: 'array',
        title: '关联设置',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'ArrayTable',
        items: {
          type: 'object',
          properties: {
            column1: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '缓存表主键', align: 'center' },
              properties: {
                cacheKey: {
                  type: 'void',
                  'x-component': 'String'
                }
              }
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '源表关联键', align: 'center' },
              properties: {
                index: {
                  type: 'void',
                  'x-component': 'Select'
                }
              }
            }
          }
        }
      },
      joinKey: {
        title: '写入路径',
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          config: { placeholder: '请选择或创建写入路径字段' }
        }
      }
    }
  }
}
