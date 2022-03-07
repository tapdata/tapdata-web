import { NodeType } from './extends/NodeType'

export class Merge extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {
    // maxOutputs: 1 // 最大输入个数
  }

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      sourceNode: {
        type: 'array',
        'x-visible': false,
        'x-reactions': '{{getSourceNode}}'
      },
      mergeProperties: {
        type: 'array',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'ArrayItems',
        'x-reactions': {
          dependencies: ['sourceNode'],
          fulfill: {
            state: {
              value:
                '{{$deps[0] && $deps[0].map( item =>({ sourceId: item.value, sourceName: item.label, mergeType: "updateOrInsert", joinKeys: [{source: "", target:""}], source: item.source }) )}}'
            }
          }
        },
        items: {
          type: 'object',
          properties: {
            layout: {
              type: 'void',
              'x-component': 'FormLayout',
              'x-component-props': {
                labelWidth: 120,
                wrapperWidth: 500,
                labelAlign: 'left',
                style: {
                  'margin-bottom': '16px',
                  padding: '16px',
                  border: '1px solid #f2f2f2'
                }
              },
              properties: {
                sourceName: {
                  type: 'string',
                  title: '节点名称',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input'
                },
                sourceId: {
                  type: 'string',
                  'x-display': 'hidden',
                  'x-decorator': 'FormItem',
                  'x-component': 'PreviewText.Input'
                },
                mergeType: {
                  type: 'select',
                  title: '写入模式',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  default: 'updateOrInsert',
                  enum: [
                    { label: '追加写入', value: 'updateOrInsert' },
                    { label: '更新写入', value: 'appendWrite' },
                    { label: '更新已存在或插入新数据', value: 'updateWrite' },
                    { label: '更新进内嵌数组', value: 'updateWrite' }
                  ]
                },
                joinKeys: {
                  type: 'array',
                  title: '关联条件',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayTable',
                  'x-component-props': {
                    style: {
                      border: '1px solid #f2f2f2'
                    }
                  },
                  default: [{ source: '', target: '' }],
                  items: {
                    type: 'object',
                    properties: {
                      c1: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          title: '源表字段',
                          align: 'center'
                        },
                        properties: {
                          source: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'Select',
                            'x-component-props': {
                              'allow-create': true,
                              filterable: true
                            },
                            'x-reactions': [
                              '{{useAsyncDataSource(loadNodeFieldNames, "dataSource", $values.mergeProperties[$self.indexes[0]].sourceId)}}'
                            ]
                          }
                        }
                      },
                      c2: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          title: '目标表字段',
                          align: 'center'
                        },
                        properties: {
                          target: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'Input'
                          }
                        }
                      },
                      c3: {
                        type: 'void',
                        'x-component': 'ArrayTable.Column',
                        'x-component-props': {
                          width: 40,
                          title: '',
                          align: 'center'
                        },
                        properties: {
                          remove: {
                            type: 'void',
                            'x-component': 'ArrayTable.Remove'
                          }
                        }
                      }
                    }
                  },
                  properties: {
                    addition: {
                      type: 'void',
                      title: '+',
                      'x-component': 'ArrayTable.Addition'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
