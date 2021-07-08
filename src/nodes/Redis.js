import { NodeType } from '@/nodes/extends/NodeType'

export class Redis extends NodeType {
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
      connectionId: {
        title: '选择Redis',
        type: 'string',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择Redis'
        },
        'x-reactions': [
          '{{useAsyncDataSource(loadDatabase, "dataSource", ["redis"])}}'
        ]
      },
      name: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': {
          dependencies: ['connectionId'],
          fulfill: {
            run: '{{$self.value = $form.query("connectionId").get("dataSource")?.find(item=>item.value===$deps[0])?.label || $self.value}}'
          }
        }
      },
      redisKey: {
        title: '设置缓存键',
        type: 'array',
        required: true,
        'x-decorator': 'ElFormItem',
        'x-component': 'Select',
        'x-component-props': {
          placeholder: '请选择或输入缓存键',
          allowCreate: true,
          multiple: true,
          filterable: true
        }
      },
      redisKeyPrefix: {
        title: '缓存键前缀',
        type: 'string',
        'x-decorator': 'ElFormItem',
        'x-component': 'Input',
        'x-component-props': {
          placeholder: '请输入缓存键前缀'
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
        'x-reactions': [
          '{{useAsyncDataSource(loadDatabaseInfo, "data", sourceConnectionId)}}'
        ]
      }
    }
  }
}
