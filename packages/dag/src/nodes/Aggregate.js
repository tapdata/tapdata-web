import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class Aggregate extends NodeType {
  constructor() {
    super()
  }

  type = 'aggregation_processor'

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        display: 'none'
      },
      fieldNames: {
        type: 'array',
        visible: false,
        'x-reactions': [
          '{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, fieldName: "value", withoutField: true}, $values.$inputs[0])}}',
          {
            target: '*(primaryKeys,aggregations.*.aggExpression,aggregations.*.groupByExpression)',
            fulfill: {
              state: {
                dataSource: '{{$self.value}}',
                loading: '{{$self.loading}}'
              }
            }
          }
        ]
      },
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          minColumns: 2,
          columnGap: 16
        },
        properties: {
          wrap: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            properties: {
              // primaryKeys: {
              //   title: '主键',
              //   type: 'array',
              //   required: true,
              //   'x-decorator': 'FormItem',
              //   'x-component': 'FieldSelect',
              //   'x-component-props': {
              //     multiple: true
              //   }
              // },
              aggregations: {
                type: 'array',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayCards',
                'x-component-props': {
                  title: '聚合'
                },
                default: [
                  {
                    name: 'COUNT',
                    filterPredicate: '',
                    aggFunction: 'COUNT',
                    aggExpression: '',
                    groupByExpression: []
                  }
                ],
                items: {
                  type: 'object',
                  properties: {
                    index: {
                      type: 'void',
                      'x-component': 'ArrayCards.Index'
                    },
                    remove: {
                      type: 'void',
                      'x-component': 'ArrayCards.Remove',
                      'x-reactions': {
                        dependencies: ['aggregations'],
                        fulfill: {
                          state: {
                            visible: `{{$deps[0].length > 1}}`
                          }
                        }
                      }
                    },
                    row: {
                      type: 'void',
                      'x-component': 'FormGrid',
                      properties: {
                        aggFunction: {
                          type: 'string',
                          title: '聚合函数',
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
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-component': 'Select'
                        },
                        aggExpression: {
                          type: 'string',
                          title: '作用目标',
                          required: true,
                          'x-decorator': 'FormItem',
                          'x-decorator-props': { gridSpan: 2 },
                          'x-component': 'FieldSelect',
                          'x-component-props': {
                            allowCreate: true
                          },
                          'x-reactions': [
                            {
                              dependencies: ['.aggFunction'],
                              fulfill: {
                                state: {
                                  value: `{{$deps[0]==='COUNT' ? null:'1'}}`,
                                  disabled: `{{$deps[0]==='COUNT'}}`
                                }
                              }
                            }
                          ]
                        }
                      }
                    },

                    // name: {
                    //   type: 'string',
                    //   title: '子处理名称',
                    //   required: true,
                    //   'x-decorator': 'FormItem',
                    //   'x-decorator-props': {
                    //     tooltip: `后续节点的脚本编辑需要引用此子处理的名称进行指定的数据处理，\n故不同的子处理名称不可重复。`
                    //   },
                    //   'x-component': 'Input',
                    //   'x-reactions': [
                    //     {
                    //       dependencies: ['.aggFunction'],
                    //       fulfill: {
                    //         state: {
                    //           value: `{{$deps[0]+($index > 0 ? '_'+($index):'')}}`
                    //         }
                    //       }
                    //     }
                    //   ]
                    // },
                    // filterPredicate: {
                    //   title: '过滤器',
                    //   'x-decorator': 'FormItem',
                    //   'x-component': 'Input.TextArea'
                    // },
                    groupByExpression: {
                      title: '分组字段',
                      type: 'array',
                      'x-decorator': 'FormItem',
                      'x-component': 'FieldSelect',
                      'x-component-props': {
                        multiple: true
                      }
                    }
                  }
                },
                properties: {
                  addition: {
                    type: 'void',
                    title: '添加聚合',
                    'x-component': 'ArrayCards.Addition',
                    'x-component-props': {
                      plain: true,
                      defaultValue: {
                        filterPredicate: '',
                        aggFunction: 'COUNT',
                        // name: '',
                        aggExpression: '',
                        groupByExpression: []
                      }
                    }
                  }
                }
              }
            }
          },
          return: {
            title: '返回示例',
            type: 'void',
            'x-decorator': 'FormItem',
            'x-component': 'ArrayAggregate'
          }
        }
      }
    }
  }

  locales = AllLocales.Aggregate
}
