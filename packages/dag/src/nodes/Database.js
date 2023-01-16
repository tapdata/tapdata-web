import { NodeType } from './extends/NodeType'

export class Database extends NodeType {
  constructor() {
    super()
  }

  type = 'database'

  minInputs = 0 // 最小输入个数
  maxInputs = 1 // 最小输入个数
  minOutputs = 0 // 最小输出个数
  maxOutputs = 1 // 最大输出个数

  // allowSource = false // 该节点不允许有源

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

      name: {
        type: 'string',
        title: '节点名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },

      layout: {
        type: 'void',
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

      sourceConfig: {
        type: 'void',
        'x-reactions': {
          dependencies: ['$outputs'],
          fulfill: {
            state: {
              display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
            }
          }
        },
        properties: {
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
            'x-reactions': [
              {
                target: 'disabledEvents',
                fulfill: {
                  state: {
                    display: '{{$self.value ? "visible" :"hidden"}}'
                  }
                }
              },
              {
                when: `{{!$values.attrs.capabilities.filter(item => item.type === 10).length}}`,
                fulfill: {
                  state: {
                    disabled: true,
                    description: `{{$values.databaseType + '暂不支持DDL事件采集'}}`
                  }
                }
              }
            ]
          },

          disabledEvents: {
            type: 'array',
            'x-component': 'DdlEventCheckbox'
          },

          migrateTableSelectType: {
            title: '选择表',
            type: 'string',
            default: 'custom',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: '表达式匹配模式下，数据库新增的符合表达的表会被自动同步到目标'
            },
            'x-component': 'Radio.Group',
            enum: [
              {
                label: '按表名选择',
                value: 'custom'
              },
              {
                label: '按表达式匹配',
                value: 'expression'
              }
            ]
          },

          tableNames: {
            type: 'array',
            default: [],
            'x-component': 'TableSelector',
            'x-component-props': {
              connectionId: '{{$values.connectionId}}',
              style: {
                marginTop: '8px',
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

          tableExpression: {
            type: 'string',
            default: '.*',
            description: '使用正则表达式匹配 .*代表任意长度任意字符',
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              rows: 1
            },
            'x-reactions': {
              dependencies: ['migrateTableSelectType'],
              fulfill: {
                state: {
                  display: '{{$deps[0] === "expression" ? "visible":"hidden"}}'
                }
              }
            }
          },

          readBatchSize: {
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

          nodeConfig: {
            type: 'object'
          }
        }
      },

      targetConfig: {
        type: 'void',
        'x-reactions': {
          dependencies: ['$inputs'],
          fulfill: {
            state: {
              display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
            }
          }
        },
        properties: {
          writeBachSpace: {
            type: 'void',
            'x-component': 'Space',
            'x-component-props': {
              size: 'middle'
            },
            'x-reactions': {
              fulfill: {
                state: {
                  display: '{{$settings.type === "cdc" ? "hidden":"visible"}}'
                }
              }
            },
            properties: {
              writeBatchSize: {
                title: '批量写入条数', //增量批次读取条数
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-decorator-props': {
                  tooltip: '全量每批次写入的条数'
                },
                'x-component-props': {
                  min: 1,
                  max: 100000
                },
                default: 2000
              },
              writeBatchWaitMs: {
                title: '写入每批最大等待时间(ms)', //增量批次读取条数
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-component-props': {
                  min: 1
                },
                default: 3000
              }
            }
          },
          ddlEvents: {
            type: 'void',
            title: 'DDL事件应用',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: '当前节点支持处理的DDL事件',
              feedbackLayout: 'none'
            },
            'x-component': 'DdlEventList',
            'x-component-props': {
              findParentNodes: '{{findParentNodes}}'
            }
          },
          fieldMapping: {
            type: 'void',
            title: '推演结果',
            'x-decorator': 'FormItem',
            'x-component': 'fieldInference',
            'x-component-props': {
              style: {
                'margin-top': '-36px'
              }
            }
          },
          collapse: {
            type: 'void',
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              class: 'mt-2 mx-n4'
            },
            'x-component': 'FormCollapse',
            'x-component-props': {
              class: 'inset'
            },
            properties: {
              tab1: {
                type: 'void',
                'x-component': 'FormCollapse.Item',
                'x-component-props': {
                  title: '高级设置'
                },
                properties: {
                  existDataProcessMode: {
                    type: 'string',
                    title: '重复处理策略',
                    default: 'keepData',
                    enum: [
                      {
                        label: '保持目标端原有表结构和数据',
                        value: 'keepData'
                      },
                      {
                        label: '清除目标端原有表结构及数据',
                        value: 'dropTable',
                        disabled: true
                      },
                      {
                        label: '保持目标端原有表结构，清除数据',
                        value: 'removeData'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-reactions': {
                      fulfill: {
                        run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $settings.type === "cdc"}}',
                        state: {
                          description: `{{$settings.type === "cdc" ? '纯增量场景下，不支持对目标表结构和数据的清除操作。':''}}`
                        },
                        schema: {
                          // ⚠️👇表达式依赖enum的顺序
                          'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`
                        }
                      }
                    }
                  },
                  writeStrategyObject: {
                    // title: '数据写入模式',
                    type: 'void',
                    'x-component-props': {
                      layout: 'horizontal',
                      colon: false,
                      feedbackLayout: 'none'
                    },
                    properties: {
                      writeStrategy: {
                        title: '数据写入模式',
                        type: 'string',
                        default: 'updateOrInsert',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        'x-component-props': {
                          tooltip:
                            '选择该单选框后，隐藏【事件处理策略】配置区，当鼠标移入到提示符“！”时显示如下提示信息：只处理插入事件，丢弃更新和删除事件'
                        },
                        enum: [
                          {
                            label: '按事件类型处理',
                            value: 'updateOrInsert'
                          },
                          {
                            label: '统计追加写入',
                            value: 'appendWrite'
                          }
                        ]
                      }
                    }
                  },
                  dmlPolicy: {
                    title: '数据写入策略',
                    type: 'object',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      feedbackLayout: 'none'
                    },
                    'x-component': 'FormLayout',
                    'x-component-props': {
                      layout: 'horizontal',
                      colon: false,
                      feedbackLayout: 'none'
                    },
                    properties: {
                      insertPolicy: {
                        type: 'string',
                        'x-component': 'Select',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'font-color-dark mb-2',
                          wrapperWidth: 300,
                          addonBefore: '插入事件'
                        },
                        default: 'update_on_exists',
                        enum: [
                          {
                            label: '目标存在时更新',
                            value: 'update_on_exists'
                          },
                          {
                            label: '目标存在时丢弃',
                            value: 'ignore_on_exists'
                          }
                        ]
                      },
                      updatePolicy: {
                        type: 'string',
                        'x-component': 'Select',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'font-color-dark mb-2',
                          wrapperWidth: 300,
                          addonBefore: '更新事件'
                        },
                        default: 'ignore_on_nonexists',
                        enum: [
                          {
                            label: '不存在时丢弃',
                            value: 'ignore_on_nonexists'
                          },
                          {
                            label: '不存在时插入',
                            value: 'insert_on_nonexists'
                          }
                        ]
                      },
                      deletePolicy: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'font-color-dark',
                          wrapperWidth: 300,
                          addonBefore: '删除事件'
                        },
                        'x-component': 'Tag',
                        'x-content': '不存在时丢弃',
                        'x-component-props': {
                          type: 'info',
                          effect: 'light'
                        }
                      }
                    },
                    'x-reactions': {
                      dependencies: ['writeStrategy'],
                      fulfill: {
                        state: {
                          display: '{{$deps[0] === "appendWrite" ? "hidden":"visible"}}'
                        }
                      }
                    }
                  },

                  initialConcurrentSpace: {
                    title: '全量多线程写入',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle'
                    },
                    properties: {
                      initialConcurrent: {
                        type: 'boolean',
                        default: true,
                        'x-component': 'Switch',
                        'x-reactions': {
                          target: '.initialConcurrentWriteNum',
                          fulfill: {
                            state: {
                              visible: '{{!!$self.value}}'
                            }
                          }
                        }
                      },
                      initialConcurrentWriteNum: {
                        type: 'number',
                        default: 8,
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        }
                      }
                    }
                  },
                  cdcConcurrentSpace: {
                    type: 'void',
                    title: '增量多线程写入',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle'
                    },
                    properties: {
                      cdcConcurrent: {
                        type: 'boolean',
                        'x-component': 'Switch',
                        'x-reactions': {
                          target: '.cdcConcurrentWriteNum',
                          fulfill: {
                            state: {
                              visible: '{{!!$self.value}}'
                            }
                          }
                        }
                      },
                      cdcConcurrentWriteNum: {
                        type: 'number',
                        default: 4,
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        }
                      }
                    }
                  },
                  nodeConfig: {
                    type: 'object'
                  }
                }
              }
            }
          },

          'attrs.capabilities': {
            type: 'array',
            'x-display': 'hidden',
            'x-reactions': '{{useDmlPolicy}}'
          }
        }
      },

      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }
}
