import { NodeType } from './extends/NodeType'
import i18n from '@/i18n'

export class Database extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }

    if (node.group) {
      this.group = node.group
    }
  }

  attr = {}

  group = 'data'

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
      databaseType: {
        type: 'string',
        'x-display': 'hidden'
      },

      'attrs.connectionName': {
        type: 'string',
        title: '连接名称',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          className: 'form-item-text'
        },
        'x-component': 'PreviewText.Input',
        'x-component-props': {
          style: {
            color: '#535F72'
          }
        }
      },

      // 所属agent
      'attrs.accessNodeProcessId': {
        type: 'string',
        title: '所属agent',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          className: 'form-item-text'
        },
        'x-component': 'PreviewText.Input',
        'x-component-props': {
          content:
            '{{$agentMap[$self.value] ? `${$agentMap[$self.value].hostName}（${$agentMap[$self.value].ip}）` : "-"}}',
          style: {
            color: '#535F72'
          }
        },
        'x-reactions': {
          fulfill: {
            state: {
              display: '{{!$self.value ? "hidden":"visible"}}'
            }
          }
        }
      },

      desc: {
        type: 'string',
        title: '节点描述',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          autosize: { maxRows: 2 }
        }
      },

      layout: {
        type: 'void',
        properties: {
          'attrs.connectionName': {
            type: 'string',
            title: '连接名称',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              className: 'form-item-text'
            },
            'x-component': 'PreviewText.Input',
            'x-component-props': {
              style: {
                color: '#535F72'
              }
            }
          }
        }
      },

      name: {
        type: 'string',
        'x-display': 'hidden'
      },

      // 切换连接，保存连接的类型
      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }

  getExtraAttr() {
    const { tableName, databaseType, connectionId, connectionType, accessNodeProcessId, connectionName } = this.attr
    return {
      tableName,
      databaseType,
      connectionId,
      attrs: {
        connectionName,
        connectionType,
        accessNodeProcessId
      }
    }
  }
}
