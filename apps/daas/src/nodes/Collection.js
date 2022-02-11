import { NodeType } from '@/nodes/extends/NodeType'

export class Collection extends NodeType {
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
      datasource: {
        title: '数据库',
        type: 'void',
        'x-decorator': 'ElFormItem',
        'x-decorator-props': {
          asterisk: true
        },
        'x-component': 'Row',
        'x-component-props': {
          type: 'flex',
          gap: '8px'
        },
        properties: {
          connectionId: {
            type: 'string',
            required: true,
            'x-decorator': 'Col',
            'x-decorator-props': { flex: 1 },
            'x-component': 'ComboSelect',
            'x-component-props': {
              config: { placeholder: '请选择数据库' }
            },
            'x-reactions': ['{{useAsyncDataSource(loadDatabase, "dataSource", ["mongodb"])}}']
          },
          databaseType: {
            type: 'string',
            default: 'mongodb',
            'x-display': 'hidden'
          },
          connectionBtn: {
            type: 'void',
            'x-component': 'AddDatabaseBtn'
          }
        }
      },
      tableRow: {
        title: '数据集',
        type: 'void',
        'x-decorator': 'ElFormItem',
        'x-decorator-props': {
          asterisk: true
        },
        'x-component': 'Row',
        'x-component-props': {
          type: 'flex',
          gap: '8px'
        },
        properties: {
          tableName: {
            type: 'string',
            required: true,
            'x-decorator': 'Col',
            'x-decorator-props': { flex: 1 },
            'x-component': 'Select',
            'x-component-props': {
              placeholder: '请选择数据集',
              clearable: true,
              filterable: true,
              itemLabel: 'table_name',
              itemValue: 'table_name'
            },
            'x-reactions': ['{{useAsyncDataSource(loadCollections)}}']
          },
          table: {
            type: 'object',
            'x-display': 'hidden',
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                state: {
                  value: '{{$form.query("tableName").get("dataSource")?.find(item=>item.table_name===$deps[0])}}'
                }
              }
            }
          },
          connectionBtn: {
            type: 'void',
            'x-component': 'AddDatabaseBtn'
          }
        }
      },
      name: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': {
          dependencies: ['tableName'],
          fulfill: {
            state: {
              value: '{{$deps[0] || $self.value}}'
            }
          }
        }
      },
      fieldFilterType: {
        type: 'string',
        title: '字段过滤',
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
        'x-decorator': 'ElFormItem',
        'x-component': 'Select',
        'x-reactions': {
          target: 'fieldFilter',
          fulfill: {
            state: {
              visible: '{{$self.value !== "keepAllFields"}}'
            }
          }
        }
      },
      fieldFilter: {
        type: 'array',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Select',
        'x-component-props': {
          size: 'mini',
          multiple: true,
          filterable: true,
          defaultFirstOption: true
        },
        'x-reactions': {
          dependencies: ['table'],
          fulfill: {
            state: {
              dataSource: '{{$deps[0] && $deps[0].fields ? $deps[0].fields.map(item => item.field_name) : []}}'
            }
          }
        }
        // 'x-reactions': ['{{useAsyncDataSource(loadTableField)}}']
      },
      switchSpace: {
        type: 'void',
        title: '启用自定义初始化顺序',
        properties: {
          enableInitialOrder: {
            type: 'boolean',
            required: true,
            'x-component': 'Switch',
            'x-component-props': {},
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
        },
        'x-decorator': 'ElFormItem',
        'x-decorator-props': {
          asterisk: true
        },
        'x-component': 'Space',
        'x-component-props': {
          size: 'middle'
        }
      },
      isFilter: {
        type: 'boolean',
        title: '过滤设置',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Switch',
        'x-reactions': {
          target: 'custSql',
          fulfill: {
            state: {
              visible: '{{!!$self.value}}'
            }
          }
        }
      },
      custSql: {
        type: 'object',
        'x-component': 'FormTab',
        'x-component-props': {},
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTabPane',
            'x-component-props': {
              tab: '智能模式'
            },
            properties: {
              conditions: {
                type: 'array',
                'x-component': 'FilterConditions',
                'x-component-props': {},
                'x-reactions': {
                  dependencies: ['fieldFilter'],
                  fulfill: {
                    run: '{{$self.dataSource = $form.query("fieldFilter").get("dataSource")}}'
                  }
                }
              },
              previewSql: {
                type: 'string',
                'x-component': 'PreviewSql',
                'x-component-props': {}
              }
            }
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTabPane',
            'x-component-props': {
              tab: 'MQL模式'
            },
            properties: {
              editSql: {
                type: 'string',
                'x-decorator': 'ElFormItem',
                'x-component': 'SqlEditor',
                'x-component-props': {
                  options: { showPrintMargin: false, useWrapMode: true }
                }
              }
            }
          }
        }
      }
    }
  }

  linkFormSchema = {
    type: 'object',
    properties: {
      dropType: {
        type: 'string',
        title: '对目标端已存在的结构和数据的处理',
        default: 'no_drop',
        'x-decorator': 'ElFormItem',
        'x-component': 'Select',
        'x-reactions': ['{{loadDropOptions}}']
      },
      syncObjects: {
        type: 'array',
        default: [
          {
            type: 'table'
          }
        ],
        enum: [
          {
            label: 'Table',
            value: 'table',
            tooltip: 'editor.cell.link.tableTip',
            disabled: true
          },
          {
            label: 'View',
            value: 'view',
            tooltip: 'editor.cell.link.viewTip'
          },
          {
            label: 'Function',
            value: 'function'
          },
          {
            label: 'Procedure',
            value: 'procedure'
          }
        ],
        'x-component': 'SyncObjects',
        'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}']
      }
    }
  }
}
