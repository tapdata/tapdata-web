import { NodeType } from './extends/NodeType'

export class Database extends NodeType {
  constructor() {
    super()
  }

  type = 'database'

  minInputs = 0 // 最小输入个数
  minOutputs = 1 // 最小输出个数
  maxOutputs = 1 // 最大输出个数

  allowSource = false // 该节点不允许有源

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
      connectionId: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': '{{useSyncConnection}}'
      },

      layout: {
        type: 'void',
        title: '节点描述',
        'x-component': 'FormLayout',
        'x-component-props': {
          layout: 'horizontal',
          colon: false,
          labelAlign: 'left',
          labelWidth: 80,
          feedbackLayout: 'none'
        },
        properties: {
          'attrs.connectionName': {
            type: 'string',
            title: '连接名称',
            'x-decorator': 'FormItem',
            'x-component': 'PreviewText.Input'
          },
          'attrs.accessNodeProcessId': {
            type: 'string',
            title: '所属agent',
            'x-decorator': 'FormItem',
            'x-component': 'PreviewText.Input',
            'x-component-props': {
              content:
                '{{$agentMap[$self.value] ? `${$agentMap[$self.value].hostName}（${$agentMap[$self.value].ip}）` : "-"}}'
            },
            'x-reactions': {
              fulfill: {
                state: {
                  display: '{{!$self.value ? "hidden":"visible"}}'
                }
              }
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

      increaseReadSize: {
        title: '批量读取条数', //增量批次读取条数
        type: 'string',
        'x-decorator': 'FormItem',
        'x-component': 'InputNumber',
        'x-decorator-props': {
          tooltip: '全量每批次读取的条数'
        },
        'x-component-props': {
          min: 1,
          max: 100000
        },
        default: 100,
        'x-reactions': {
          fulfill: {
            state: {
              display: '{{$settings.type === "cdc" ? "hidden":"visible"}}'
            }
          }
        }
      },
      enableDynamicTable: {
        title: '动态新增表',
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          tooltip: '开启后任务将会自动处理新增，删除表',
          feedbackLayout: 'none'
        },
        'x-component': 'Switch',
        'x-reactions': [
          {
            dependencies: ['.migrateTableSelectType'],
            fulfill: {
              state: {
                visible:
                  '{{ $deps[0] === "all" && $values.attrs.capabilities.find(({ id }) => id === "get_table_names_function") && $settings.type !== "initial_sync"  }}'
              }
            }
          }
        ]
      },

      enableDDL: {
        title: 'DDL事件采集',
        type: 'boolean',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          // addonAfter: '开启后任务将会自动采集选中的源端DDL事件',
          tooltip: '开启后任务将会自动采集选中的源端DDL事件',
          feedbackLayout: 'none'
          // wrapperStyle: {
          //   width: 'auto'
          // }
        },
        'x-component': 'Switch',
        'x-reactions': {
          target: 'disabledEvents',
          fulfill: {
            state: {
              display: '{{$self.value ? "visible" :"hidden"}}'
            }
          }
        }
      },

      disabledEvents: {
        type: 'array',
        'x-component': 'DdlEventCheckbox'
      },

      migrateTableSelectType: {
        title: '选择表',
        type: 'string',
        default: 'all',
        required: true,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          className: 'form-item-dense'
        },
        'x-component': 'Radio.Group',
        'x-component-props': {
          style: {
            marginBottom: '8px'
          }
        },
        enum: [
          {
            label: '全部',
            value: 'all'
          },
          {
            label: '自定义',
            value: 'custom'
          }
        ],
        'x-reactions': {
          target: 'tableNames',
          effects: ['onFieldInputValueChange'],
          fulfill: {
            state: {
              value: '{{$self.value === "custom" ? [] : $target.value}}'
            }
          }
        }
      },

      tableCard: {
        type: 'void',
        properties: {
          tableNames: {
            type: 'array',
            'x-component': 'TableListCard',
            'x-component-props': {
              connectionId: '{{$values.connectionId}}'
            },
            'x-reactions': {
              dependencies: ['migrateTableSelectType'],
              fulfill: {
                state: {
                  display: '{{$deps[0] !== "custom" ? "visible":"hidden"}}'
                }
              }
            }
          }
        }
      },

      tableNames: {
        type: 'array',
        default: [],
        'x-component': 'TableSelector',
        'x-component-props': {
          connectionId: '{{$values.connectionId}}',
          style: {
            height: 'unset',
            minHeight: 0,
            maxHeight: 'calc((100vh - 120px) * 0.618)'
          }
        },
        'x-reactions': {
          dependencies: ['migrateTableSelectType'],
          fulfill: {
            state: {
              display: '{{$deps[0] === "custom" ? "visible":"hidden"}}'
            },
            schema: {
              required: '{{$deps[0] === "custom"}}'
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

  selector(node) {
    // attrs.isTarget 是UI属性，在无UI的模式生成的节点，通过是否有输入($inputs)来判断
    return node.type === 'database' && !node.attrs?.isTarget && !node.$inputs?.length
  }
}
