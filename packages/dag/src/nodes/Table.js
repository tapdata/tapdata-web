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

  attr = {
    minInputs: 0, // 最小输入个数
    maxInputs: 1 // 最大输入个数
  }

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
      grid: {
        type: 'void',
        'x-component': 'Space',
        'x-component-props': {
          align: 'stretch',
          size: 32,
          split: true,
          filterIndex: []
        },
        'x-reactions': {
          dependencies: ['$inputs', '$outputs'],
          fulfill: {
            schema: {
              'x-component-props.filterIndex': '{{$deps[0]?.length || $deps[1]?.length ? [] : [1]}}'
            }
          }
        },
        properties: {
          leftCell: {
            type: 'void',
            properties: {
              connectionIdWrap: {
                type: 'void',
                title: '数据库',
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  asterisk: true,
                  wrapperWidth: 320,
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
                  wrapperWidth: 320,
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

              name: {
                type: 'string',
                'x-display': 'hidden'
              }
            }
          },
          rightCell: {
            type: 'void',
            properties: {
              sourceNodeConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['$outputs'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0].length > 0}}'
                    }
                  }
                },
                properties: {
                  totalReadMethod: {
                    title: '全量数据读取',
                    type: 'string',
                    default: 'fullRead',
                    enum: [
                      {
                        label: '全量读取',
                        value: 'fullRead'
                      },
                      {
                        label: '自定义sql',
                        value: 'customizeSql'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Radio.Group'
                  },
                  totalsql: {
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 800
                    },
                    'x-component': 'SqlEditor',
                    'x-component-props': {
                      options: { showPrintMargin: false, useWrapMode: true }
                    },
                    'x-reactions': {
                      dependencies: ['totalReadMethod'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0]==="customizeSql"}}'
                        }
                      }
                    }
                  },
                  increasePoll: {
                    title: '增量数据读取',
                    type: 'string',
                    default: 'fullRead',
                    enum: [
                      {
                        label: '日志CDC',
                        value: 'fullRead'
                      },
                      {
                        label: '自定义sql',
                        value: 'customizeSql'
                      }
                    ],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Radio.Group'
                  },
                  increasesql: {
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 800
                    },
                    'x-component': 'SqlEditor',
                    'x-component-props': {
                      options: { showPrintMargin: false, useWrapMode: true }
                    },
                    'x-reactions': {
                      dependencies: ['increasePoll'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0]==="customizeSql"}}'
                        }
                      }
                    }
                  },
                  initialOffset: {
                    title: 'sql增量条件',
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Input',
                    'x-reactions': {
                      dependencies: ['increasePoll'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0]==="customizeSql"}}'
                        }
                      }
                    }
                  },
                  /*increaseSyncTitle: {
                    title: '增量轮询',
                    type: 'void',
                    'x-component': 'FormTitle'
                  },*/
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
                      /*processorThreadNum: {
                        title: '处理器线程数',
                        type: 'number',
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1
                        }
                      }*/
                    }
                  },
                  maxTransactionDuration: {
                    title: '事务最大时长(小时)',
                    type: 'number',
                    'x-decorator': 'FormItem',
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 0
                    },
                    'x-reactions': {
                      dependencies: ['databaseType'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0]==="oracle"}}'
                        }
                      }
                    }
                  }
                }
              },
              targetNodeConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      visible: '{{$deps[0].length > 0}}'
                    }
                  }
                },
                properties: {
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
                        label: '更新写入',
                        value: 'updateWrite'
                      },
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
                    'x-reactions': {
                      target: 'updateConditionFields',
                      fulfill: {
                        state: {
                          visible: '{{$self.value!=="appendWrite"}}'
                        }
                      }
                    }
                  },
                  updateConditionFields: {
                    title: '更新条件字段',
                    type: 'array',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 300
                      // feedbackText: '可输入创建新字段'
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      allowCreate: true,
                      multiple: true,
                      filterable: true
                    },
                    'x-reactions': [
                      // 展示源节点的字段
                      '{{useAsyncDataSource(loadNodeFieldNames, "dataSource", $values.$inputs[0], "primaryKey")}}'
                    ]
                  }
                }
              }
            }
          }
        }
      },

      // 切换连接，保存连接的类型
      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }
  /**
   * 获取额外添加到节点上的属性
   */
  getExtraAttr() {
    const { tableName, databaseType, connectionId, connectionType } = this.attr
    return {
      tableName,
      databaseType,
      connectionId,
      attrs: {
        connectionType
      }
    }
  }
}
