import { NodeType } from './extends/NodeType'
// import { NONSUPPORT_CDC, NONSUPPORT_SYNC, NONSUPPORT_TARGET } from '../constants'

export class Table extends NodeType {
  constructor(node) {
    super(node)

    if (node.attr) {
      const attr = Object.assign(this.attr, node.attr)
      if (attr.formSchema) this.formSchema = attr.formSchema
      if (attr.linkFormSchema) this.linkFormSchema = attr.linkFormSchema
    }

    /*const { databaseType } = this.attr

    // 不能作为源节点
    if (NONSUPPORT_SYNC.includes(databaseType) && NONSUPPORT_CDC.includes(databaseType)) {
      this.attr.maxOutputs = 0
    }

    // 不能作为目标节点
    if (NONSUPPORT_TARGET.includes(databaseType)) {
      this.attr.maxInputs = 0
    }*/
  }

  attr = {
    minInputs: 0, // 最小输入个数
    maxInputs: 1 // 最大输入个数
  }

  group = 'data'

  formSchema = {
    type: 'object',
    properties: {
      isSource: {
        type: 'boolean',
        'x-visible': false,
        'x-reactions': '{{isSource}}'
      },
      isTarget: {
        type: 'boolean',
        'x-visible': false,
        'x-reactions': '{{isTarget}}'
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
          dependencies: ['isSource', 'isTarget'],
          fulfill: {
            schema: {
              'x-component-props.filterIndex': '{{!!$deps[0] || !!$deps[1] ? [] : [1]}}'
            }
          }
        },
        properties: {
          leftCell: {
            type: 'void',
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
                  wrapperWidth: 240,
                  feedbackText: ''
                },
                'x-component': 'Select',
                'x-component-props': {
                  allowCreate: false,
                  filterable: true,
                  remote: true
                },
                'x-reactions': [
                  '{{useRemoteQuery(loadDatabaseTable)}}',
                  {
                    dependencies: ['isTarget'],
                    fulfill: {
                      schema: {
                        // title: '{{console.log("tableName", $deps[0]),$deps[0] ? "表(可输入创建新表)" : "表"}}',
                        'x-component-props.allowCreate': '{{$deps[0]}}',
                        'x-decorator-props.feedbackText': '{{$deps[0] && "可输入创建新表"}}'
                      }
                    }
                  }
                ]
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
              }
            }
          },

          rightCell: {
            type: 'void',
            properties: {
              sourceNodeConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['isSource'],
                  fulfill: {
                    state: {
                      visible: '{{!!$deps[0]}}'
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
                      wrapperWidth: 240
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
                      wrapperWidth: 240
                    },
                    'x-component': 'Radio.Group',
                    'x-reactions': {
                      dependencies: ['isSource'],
                      fulfill: {
                        state: {
                          visible: '{{!!$deps[0]}}'
                        }
                      }
                    }
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
                      wrapperWidth: 240
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
                  dependencies: ['isTarget'],
                  fulfill: {
                    state: {
                      visible: '{{!!$deps[0]}}'
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
                      wrapperWidth: 240
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
                      wrapperWidth: 240
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
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      wrapperWidth: 240,
                      feedbackText: '可输入创建新字段'
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      allowCreate: true,
                      multiple: true,
                      filterable: true
                    },
                    'x-reactions': ['{{useAsyncDataSource(loadNodeFieldNames)}}']
                  }
                }
              }
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
