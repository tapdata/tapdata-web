import { NodeType } from './extends/NodeType'

export class JointCache extends NodeType {
  constructor() {
    super()
  }

  type = 'cache_lookup_processor'

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
        'x-component': 'Select',
        'x-decorator-props': {
          wrapperWidth: 240
        }
        // 'x-component': 'ComboSelect'
      },
      joinSettings: {
        type: 'array',
        title: '关联设置',
        required: true,
        default: [{ cacheKey: 1 }],
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
                  type: 'string',
                  'x-component': 'PreviewText.Input'
                }
              }
            },
            column2: {
              type: 'void',
              'x-component': 'ArrayTable.Column',
              'x-component-props': { title: '源表关联键', align: 'center' },
              properties: {
                sourceKey: {
                  type: 'void',
                  properties: {
                    sourceKey: {
                      type: 'string',
                      enum: [
                        {
                          label: 'AVG',
                          value: 'AVG'
                        },
                        {
                          label: 'SUM',
                          value: 'SUM'
                        },
                        {
                          label: 'MAX',
                          value: 'MAX'
                        },
                        {
                          label: 'MIN',
                          value: 'MIN'
                        },
                        {
                          label: 'COUNT',
                          value: 'COUNT'
                        }
                      ],
                      'x-component': 'Select'
                    }
                  }
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
      },
      script: {
        type: 'string'
      }
    }
  }
}
