import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class Table extends NodeType {
  constructor() {
    super()
  }

  type = 'table'

  group = 'data'

  minInputs = 0 // 最小输入个数

  maxInputs = 1 // 最大输入个数

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

      name: {
        type: 'string',
        title: '节点名称',
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input'
      },

      connectionIdWrap: {
        type: 'void',
        title: '数据库',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          asterisk: true,
          feedbackLayout: 'none'
        },
        'x-component': 'FormFlex',
        'x-component-props': {
          gap: 8,
          align: 'start'
        },
        properties: {
          connectionId: {
            type: 'string',
            required: true,
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              style: {
                flex: 1
              }
            },
            'x-component': 'AsyncSelect',
            'x-component-props': {
              onSetSelected: '{{useHandleWithForm(handlerSyncDatabaseChange, $form)}}',
              itemLabel: 'label',
              itemValue: 'id',
              itemQuery: 'name',
              method: '{{loadDatabases}}',
              params: `{{ {where: {database_type: $values.databaseType}} }}`
            },
            'x-reactions': [
              {
                target: 'tableName',
                effects: ['onFieldValueChange'],
                fulfill: {
                  state: {
                    value: ''
                  }
                }
              }
            ]
          },

          clipboardButton: {
            type: 'void',
            'x-component': 'ClipboardButton',
            'x-component-props': {
              tooltip: '复制数据库名',
              finishTooltip: '已复制'
            }
          }
        }
      },

      tableNameWrap: {
        type: 'void',
        title: '表',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          asterisk: true,
          feedbackLayout: 'none'
        },
        'x-component': 'FormFlex',
        'x-component-props': {
          gap: 8,
          align: 'start'
        },
        properties: {
          tableName: {
            type: 'string',
            required: true,
            'x-validator': [
              {
                required: true,
                message: '请选择表'
              }
            ],
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              style: {
                flex: 1
              }
            },
            'x-component': 'TableSelect',
            'x-component-props': {
              method: '{{loadTable}}'
            },
            'x-reactions': [
              {
                target: 'name',
                effects: ['onFieldInputValueChange'],
                fulfill: {
                  state: {
                    value: '{{$self.value}}'
                  }
                }
              },
              {
                target: 'updateConditionFields',
                effects: ['onFieldValueChange'],
                fulfill: {
                  state: {
                    value: null
                  }
                }
              },
              {
                dependencies: ['$inputs'],
                fulfill: {
                  schema: {
                    // title: '{{console.log("tableName", $deps[0]),$deps[0] ? "表(可输入创建新表)" : "表"}}',
                    'x-component-props.allowCreate': '{{$deps[0].length>0}}'
                    // 'x-decorator-props.feedbackText': '{{$deps[0] && "可输入创建新表"}}'
                  }
                }
              }
            ]
          },
          clipboardButton: {
            type: 'void',
            'x-component': 'ClipboardButton',
            'x-component-props': {
              tooltip: '复制表名',
              finishTooltip: '已复制'
            },
            'x-reactions': {
              dependencies: ['tableName'],
              fulfill: {
                schema: {
                  'x-component-props.content': '{{$deps[0]}}'
                }
              }
            }
          }
        }
      },

      // 指定agent
      'attrs.accessNodeProcessId': {
        type: 'string',
        title: '所属agent',
        'x-decorator': 'FormItem',
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
        'x-reactions': {
          dependencies: ['$inputs', '$outputs'],
          fulfill: {
            state: {
              display: '{{$deps[0].length > 0 || $deps[1].length > 0 ? "visible":"hidden"}}'
            }
          }
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormCollapse.Item',
            'x-component-props': {
              title: '高级设置'
            },
            properties: {
              sourceNodeConfig: {
                type: 'void',
                'x-component': 'FormContent', // 为properties组件增加根节点，避免vue-frag报错
                'x-reactions': {
                  dependencies: ['$outputs'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  increase: {
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle'
                    },
                    properties: {
                      increaseSyncInterval: {
                        title: '增量同步间隔(ms)',
                        type: 'number',
                        default: 500,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1
                        }
                      },
                      increaseReadSize: {
                        title: '每次读取数量(行)',
                        type: 'number',
                        default: 100,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1
                        }
                      }
                    }
                  },
                  enableDDL: {
                    title: 'DDL事件采集',
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      tooltip: '开启后任务将会自动采集选中的源端DDL事件',
                      layout: 'horizontal'
                    },
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: '.disabledEvents',
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
                  }
                }
              },

              targetNodeConfig: {
                type: 'void',
                'x-component': 'FormContent',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  ddlEvents: {
                    type: 'void',
                    title: 'DDL事件应用',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      feedbackLayout: 'none'
                    },
                    'x-component': 'DdlEventList',
                    'x-component-props': {
                      findParentNodes: '{{findParentNodes}}'
                    }
                  },
                  existDataProcessMode: {
                    title: '已有数据处理',
                    type: 'string',
                    default: 'keepData',
                    enum: [
                      {
                        label: '保持已存在的数据',
                        value: 'keepData'
                      },
                      {
                        label: '运行前删除已存在的数据',
                        value: 'removeData'
                      },
                      {
                        label: '运行前删除表结构',
                        value: 'dropTable'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Select'
                  },
                  writeStrategy: {
                    title: '数据写入模式',
                    type: 'string',
                    default: 'updateOrInsert',
                    enum: [
                      {
                        label: '追加写入',
                        value: 'appendWrite'
                      },
                      {
                        label: '更新已存在或者插入新数据',
                        value: 'updateOrInsert'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Select',
                    'x-reactions': [
                      {
                        target: 'updateConditionFields',
                        fulfill: {
                          state: {
                            display: '{{$self.value!=="appendWrite" ? "visible":"hidden"}}'
                          }
                        }
                      }
                    ]
                  },
                  updateConditionFields: {
                    title: '更新条件字段',
                    type: 'array',
                    required: true,
                    default: null,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'FieldSelect',
                    'x-component-props': {
                      allowCreate: true,
                      multiple: true,
                      filterable: true
                    },
                    'x-reactions': [
                      `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.$inputs[0])}}`,
                      {
                        fulfill: {
                          run: `
                            if (!$self.value && $self.dataSource?.length) {
                              $self.setValue($self.dataSource.filter(item => item.isPrimaryKey).map(item => item.value))
                              $self.validate()
                            }
                          `
                        }
                      }
                    ]
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
                  }
                }
              },

              nodeConfig: {
                type: 'object',
                'x-component': 'PdkProperties'
              }
            }
          }
        }
      },

      // 切换连接，保存连接的类型
      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      },

      // 连接名称
      'attrs.connectionName': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }

  locales = AllLocales.Table

  allowTarget(target, source) {
    // 不再支持既是源又是目标的节点
    return !source.$inputs?.length && (target.type !== 'table' || !target.$outputs?.length)
  }

  allowSource(source, target) {
    // 不再支持既是源又是目标的节点
    return !target.$outputs?.length
  }
}
