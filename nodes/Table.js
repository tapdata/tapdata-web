import { NodeType } from './extends/NodeType'

export class Table extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }
  }

  attr = {}

  group = 'data'

  formSchema = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          minColumns: 2,
          maxColumns: 2
        },
        properties: {
          leftCol: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 1
            },
            'x-reactions': {
              dependencies: ['grid.leftCol.inputLanes'],
              fulfill: {
                schema: {
                  'x-component-props.gridSpan': '{{!!$deps[0] && $deps[0].length>0 ? 1:2}}'
                }
              }
            },
            properties: {
              inputLanes: {
                type: 'string',
                'x-display': 'hidden'
              },
              outputLanes: {
                type: 'string',
                'x-display': 'hidden'
              },
              connectionId: {
                type: 'string',
                title: '数据库',
                required: true,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  wrapperWidth: 240
                },
                'x-component': 'Select',
                'x-component-props': {
                  config: { placeholder: '请选择数据库' }
                },
                'x-reactions': '{{useAsyncDataSource(loadDatabase, "dataSource")}}'
              },
              tableName: {
                title: '表',
                type: 'string',
                required: true,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  wrapperWidth: 240
                },
                'x-component': 'Select',
                'x-component-props': {
                  config: { placeholder: '请选择表，区分大小写' }
                },
                'x-reactions': '{{useAsyncDataSource(loadDatabaseTable)}}'
              },
              name: {
                type: 'string',
                'x-display': 'hidden',
                'x-reactions': {
                  dependencies: ['.tableName'],
                  fulfill: {
                    state: {
                      value: '{{$deps[0]}}'
                    }
                  }
                }
              },
              isFilter: {
                type: 'boolean',
                title: '过滤设置',
                default: false,
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-reactions': [
                  {
                    dependencies: ['inputLanes', 'outputLanes'],
                    fulfill: {
                      state: {
                        visible: '{{(!!$deps[1] && $deps[1].length>0) || (!$deps[0] || !$deps[0].length)}}'
                      }
                    }
                  }
                ]
              },
              custSql: {
                type: 'object',
                'x-component': 'FormTab',
                'x-reactions': {
                  dependencies: ['inputLanes', 'outputLanes', 'isFilter'],
                  fulfill: {
                    state: {
                      visible:
                        '{{!!$deps[2] && ((!!$deps[1] && $deps[1].length > 0) || !$deps[0] || !$deps[0].length)}}'
                    }
                  }
                },
                properties: {
                  tab1: {
                    type: 'void',
                    'x-component': 'FormTab.TabPane',
                    'x-component-props': {
                      label: '智能模式'
                    },
                    properties: {
                      fieldFilterType: {
                        type: 'string',
                        required: true,
                        default: 'keepAllFields',
                        enum: [
                          {
                            label: '全部字段',
                            value: 'keepAllFields'
                          },
                          {
                            label: '保留字段',
                            value: 'retainedField'
                          },
                          {
                            label: '删除字段',
                            value: 'deleteField'
                          }
                        ],
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          wrapperWidth: 240
                        },
                        'x-component': 'Select',
                        'x-reactions': {
                          target: 'custSql.selectedFields',
                          fulfill: {
                            state: {
                              visible: '{{$self.value !== "keepAllFields"}}'
                            }
                          }
                        }
                      },
                      selectedFields: {
                        type: 'array',
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          wrapperWidth: 240
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          multiple: true,
                          filterable: true,
                          defaultFirstOption: true
                        },
                        'x-reactions': '{{useAsyncDataSource(loadTableField)}}'
                      },
                      limitLines: {
                        title: '行数限制',
                        type: 'string',
                        required: true,
                        default: 1000,
                        enum: [
                          {
                            label: '全部行数',
                            value: 'all'
                          },
                          {
                            label: '1000行',
                            value: 1000
                          },
                          {
                            label: '10000行',
                            value: 10000
                          }
                        ],
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          wrapperWidth: 240
                        },
                        'x-component': 'Select'
                      },
                      conditions: {
                        type: 'array',
                        'x-component': 'FilterConditions',
                        'x-reactions': {
                          dependencies: ['custSql.selectedFields'],
                          fulfill: {
                            run: '{{$self.dataSource = $form.query("custSql.selectedFields").get("dataSource")}}'
                          }
                        }
                      },
                      previewSql: {
                        type: 'string',
                        'x-component': 'PreviewSql'
                      }
                    }
                  },
                  tab2: {
                    type: 'void',
                    'x-component': 'FormTab.TabPane',
                    'x-component-props': {
                      label: 'SQL模式'
                    },
                    properties: {
                      editSql: {
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'SqlEditor',
                        'x-component-props': {
                          options: { showPrintMargin: false, useWrapMode: true }
                        }
                      },
                      // TODO 这个属性原来的层级是顶层，现在放在了custSql下，注意和后端沟通支持
                      initialOffset: {
                        type: 'string',
                        title: '自定义SQL增量条件',
                        'x-decorator': 'FormItem',
                        'x-component': 'Input',
                        'x-component-props': {
                          placeholder: '请输入自定义SQL增量条件'
                        }
                      }
                    }
                  }
                }
              },
              dropTable: {
                type: 'boolean',
                title: '已存在的数据',
                enum: [
                  {
                    label: '保持已存在的数据',
                    value: false
                  },
                  {
                    label: '运行前删除已存在的数据',
                    value: true
                  }
                ],
                default: false,
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  wrapperWidth: 240
                },
                'x-component': 'Select',
                'x-reactions': {
                  dependencies: ['inputLanes'],
                  fulfill: {
                    state: {
                      visible: '{{!!$deps[0] && $deps[0].length>0}}'
                    }
                  }
                }
              }
            }
          },
          rightCol: {
            type: 'void',
            'x-component': 'FormGrid.GridColumn',
            'x-component-props': {
              gridSpan: 1
            },
            'x-reactions': {
              dependencies: ['grid.leftCol.inputLanes'],
              fulfill: {
                state: {
                  visible: '{{!!$deps[0] && $deps[0].length>0}}'
                }
              }
            },
            properties: {
              joinTypes: {
                type: 'array',
                title: '关联条件',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  editable: false
                },
                'x-component': 'ArrayTabs',
                'x-component-props': {
                  editable: false
                },
                items: {
                  type: 'object',
                  properties: {
                    layout: {
                      type: 'void',
                      'x-component': 'FormLayout',
                      'x-component-props': {
                        layout: 'vertical',
                        colon: false,
                        feedbackLayout: 'terse'
                      },
                      properties: {
                        joinType: {
                          type: 'boolean',
                          title: '数据写入模式',
                          enum: [
                            {
                              label: '追加写入',
                              value: 'append' // insert				{source: ''} + {target: ''}  =  {source: '', target: ''}
                            },
                            {
                              label: '更新已存在或插入新数据',
                              value: 'upsert' // OneOne				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
                            },
                            {
                              label: '更新写入',
                              value: 'update' // OneMany				{source: ''} + {target: ''}  =  {source: '', joinPath: {target: ''}}
                            } /*,
                        {
                          label: '更新内嵌数组',
                          value: 'merge_embed' // ManyOne		{source: ''} + {target: ''}  =  {source: '', joinPath: [{target: ''}]}
                        }*/
                          ],
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            wrapperWidth: 240
                          },
                          'x-component': 'Select'
                        }
                      }
                    }
                  }
                }
              },
              joinKeys: {
                type: 'array',
                title: '关联字段',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayTable',
                items: {
                  properties: {
                    column1: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: '源字段',
                        align: 'center'
                      },
                      properties: {
                        source: {
                          type: 'string',
                          'x-component': 'Select'
                        }
                      }
                    },
                    column2: {
                      type: 'void',
                      'x-component': 'ArrayTable.Column',
                      'x-component-props': {
                        title: '目标字段',
                        align: 'center'
                      },
                      properties: {
                        target: {
                          type: 'string',
                          'x-component': 'Select'
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
  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {
      ...this.attr
    }
  }
}
