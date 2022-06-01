import { NodeType } from './extends/NodeType'

export class MergeTable extends NodeType {
  constructor() {
    super()
  }

  type = 'merge_table_processor'

  maxOutputs = 1 // 最大输出个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden'
      },

      mergeProperties: {
        type: 'array',
        required: true,
        'x-component': 'MergeTableTree',
        'x-component-props': {
          findNodeById: '{{findNodeById}}',
          loadFieldsMethod: '{{loadNodeFieldOptions}}'
        },
        items: {
          type: 'object',
          properties: {
            itemsWrap: {
              type: 'void',
              'x-component': 'FormContent',
              properties: {
                id: {
                  type: 'string',
                  'x-display': 'hidden'
                },
                mergeType: {
                  type: 'string',
                  title: '数据写入模式',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    wrapperWidth: 320
                  },
                  'x-component': 'Select',
                  enum: [
                    { label: '更新写入', value: 'updateWrite' },
                    { label: '更新已存在或插入新数据', value: 'updateOrInsert' },
                    { label: '更新进内嵌数组', value: 'updateIntoArray' }
                  ]
                },
                wrap: {
                  type: 'void',
                  'x-component': 'FormContent',
                  properties: {
                    space: {
                      type: 'void',
                      'x-component': 'Space',
                      properties: {
                        targetPath: {
                          type: 'string',
                          title: '关联后写入路径',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            wrapperWidth: 320
                          },
                          'x-component': 'Input',
                          'x-reactions': {
                            dependencies: ['.mergeType', '.id'],
                            fulfill: {
                              state: {
                                value: `{{ !$self.value && $self.value !== '' && ($deps[0] === "updateWrite" || $deps[0] === "updateIntoArray") ? findNodeById($deps[1])?.name : $self.value }}`
                              }
                            }
                          }
                        },
                        arrayKeys: {
                          type: 'array',
                          title: '内嵌数组匹配条件',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            wrapperWidth: 320
                          },
                          'x-component': 'FieldSelect',
                          'x-component-props': {
                            'allow-create': true,
                            multiple: true,
                            filterable: true
                          },
                          'x-reactions': [
                            {
                              dependencies: ['.mergeType'],
                              fulfill: {
                                state: {
                                  visible: '{{ $deps[0] === "updateIntoArray" }}'
                                }
                              }
                            }
                          ]
                        }
                      }
                    },
                    joinKeys: {
                      type: 'array',
                      title: '关联条件',
                      'x-decorator': 'FormItem',
                      'x-component': 'ArrayTable',
                      items: {
                        type: 'object',
                        properties: {
                          c1: {
                            type: 'void',
                            'x-component': 'ArrayTable.Column',
                            'x-component-props': {
                              title: '当前表字段',
                              align: 'center',
                              asterisk: false
                            },
                            properties: {
                              source: {
                                type: 'string',
                                loading: true,
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'FieldSelect',
                                'x-component-props': {
                                  'allow-create': true,
                                  filterable: true
                                }
                              }
                            }
                          },
                          c2: {
                            type: 'void',
                            'x-component': 'ArrayTable.Column',
                            'x-component-props': {
                              title: '目标表字段',
                              align: 'center',
                              asterisk: false
                            },
                            properties: {
                              target: {
                                type: 'string',
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'FieldSelect',
                                'x-component-props': {
                                  'allow-create': true,
                                  filterable: true
                                }
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
  }

  allowTarget(target) {
    return target.attrs?.pdkExpansion?.includes('master-slave-merge')
  }
}
