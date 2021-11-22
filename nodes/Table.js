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
