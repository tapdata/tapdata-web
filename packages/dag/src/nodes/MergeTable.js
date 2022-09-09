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

      externalStorageId: {
        title: '外存配置', //外存配置
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-reactions': [
          '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true})}}',
          {
            fulfill: {
              state: {
                value: '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}'
              }
            }
          }
        ]
      },

      mergeProperties: {
        title: '主从配置',
        type: 'array',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {},
        'x-component': 'MergeTableTree',
        'x-component-props': {
          treeWidth: 200,
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
                    targetPath: {
                      type: 'string',
                      title: '关联后写入路径',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input',
                      'x-reactions': [
                        {
                          dependencies: ['.mergeType', '.id'],
                          fulfill: {
                            state: {
                              value: `{{ !$self.value && $self.value !== '' && ($deps[0] === "updateWrite" || $deps[0] === "updateIntoArray") ? findNodeById($deps[1])?.name : $self.value }}`
                            }
                          }
                        },
                        {
                          effects: ['onFieldInputValueChange'],
                          fulfill: {
                            run: `{{
                                  const arr = $self.value.split('.')
                                  if (arr.length > 2) {
                                    $self.value = arr.slice(0,2).join('.')
                                    $self.description = '最多支持两层嵌套'
                                  } else {
                                    $self.description = ''
                                  }
                                }}`
                          }
                        }
                      ]
                    },
                    arrayKeys: {
                      type: 'array',
                      title: '内嵌数组匹配条件',
                      'x-decorator': 'FormItem',
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
    return !!target.attrs?.capabilities?.find(({ id }) => id === 'master_slave_merge')
  }
}
