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
          dependencies: ['tableId'],
          fulfill: {
            run: '{{$self.value = $form.query("tableId").get("dataSource")?.find(item=>item.value===$deps[0])?.label || $self.value}}'
          }
        }
      },
      // 产品说不要了，暂时留存
      /*switchSpace: {
        type: 'void',
        title: '启用自定义初始化顺序',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          wrapperWidth: 240
        },
        'x-component': 'Space',
        'x-component-props': {
          size: 'middle'
        },
        properties: {
          enableInitialOrder: {
            type: 'boolean',
            required: true,
            'x-component': 'Switch',
            'x-reactions': {
              target: 'initialSyncOrder',
              fulfill: {
                state: {
                  visible: '{{!!$self.value}}'
                }
              }
            }
          },

          initialSyncOrder: {
            type: 'number',
            required: true,
            'x-component': 'InputNumber',
            'x-component-props': {
              min: 1,
              size: 'mini'
            }
          }
        }
      },*/
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
          } /*,
          {
            target: 'custSql',
            fulfill: {
              state: {
                visible: '{{!!$self.value}}'
              }
            }
          }*/
        ]
      },
      custSql: {
        type: 'object',
        'x-component': 'FormTab',
        'x-reactions': {
          dependencies: ['inputLanes', 'outputLanes', 'isFilter'],
          fulfill: {
            state: {
              visible: '{{!!$deps[2] && ((!!$deps[1] && $deps[1].length > 0) || !$deps[0] || !$deps[0].length)}}'
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
