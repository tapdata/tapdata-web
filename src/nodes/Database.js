import { NodeType } from '@/nodes/extends/NodeType'

export class Database extends NodeType {
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
            'x-reactions': ['{{useAsyncDataSource(loadDatabase)}}']
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
          dependencies: ['connectionId'],
          fulfill: {
            run: '{{$self.value = $form.query("connectionId").get("dataSource")?.find(item=>item.id===$deps[0])?.name}}'
          }
        }
      },
      datasourceInfo: {
        type: 'string',
        'x-component': 'DatabaseInfo',
        'x-reactions': ['{{useAsyncDataSource(loadDatabaseInfo)}}']
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
      table_prefix: {
        type: 'string',
        default: '',
        'x-display': 'hidden'
      },
      table_suffix: {
        type: 'string',
        default: '',
        'x-display': 'hidden'
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
    return {
      databaseType: this.attr.databaseType,
      inputLanes: [],
      outputLanes: []
    }
  }
}
