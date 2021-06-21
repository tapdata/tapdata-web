export class Table {
  constructor(node) {
    this.icon = node.icon
    this.name = node.name
    this.tip = node.name

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
            'x-reactions': [
              '{{useAsyncDataSource(loadDatabase, "dataSource", ["mysql","mysql pxc","oracle","sqlserver","sybase ase","gbase-8s","db2","gaussdb200","postgres","mariadb"])}}'
            ]
          },
          connectionBtn: {
            type: 'void',
            'x-component': 'AddDatabaseBtn'
          }
        }
      },
      switchSpace: {
        type: 'void',
        title: '启用自定义初始化顺序',
        properties: {
          enableInitialOrder: {
            type: 'boolean',
            required: true,
            'x-component': 'Switch',
            'x-component-props': {
              // activeText: '开启'
            },
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
        'x-component': 'Switch'
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
        'x-reactions': ['{{getDropOptions}}']
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
        'x-reactions': [
          '{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}'
        ]
      }
    }
  }

  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    return {}
  }
}
