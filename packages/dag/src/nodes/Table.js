import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'
import i18n from '@tap/i18n'

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
        'x-decorator': 'StageButtonLabel',
        'x-decorator-props': {
          asterisk: true,
          feedbackLayout: 'none',
          connectionId: '',
          title: '表'
        },
        'x-component': 'FormFlex',
        'x-component-props': {
          gap: 8,
          align: 'start'
        },
        'x-reactions': {
          dependencies: ['databaseType', '.connectionId'],
          fulfill: {
            state: {
              display: '{{ !["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}'
            },
            schema: {
              'x-decorator-props.connectionId': `{{$deps[1]}}`
            }
          }
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
              display:
                '{{$hasPdkConfig($values.attrs.pdkHash) || $deps[0].length > 0 || $deps[1].length > 0 ? "visible":"hidden"}}'
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
                  // increase: {
                  //   type: 'void',
                  //   'x-component': 'Space',
                  //   'x-component-props': {
                  //     size: 'middle'
                  //   },
                  //   properties: {
                  //     increaseSyncInterval: {
                  //       title: '增量同步间隔(ms)',
                  //       type: 'number',
                  //       default: 500,
                  //       'x-decorator': 'FormItem',
                  //       'x-component': 'InputNumber',
                  //       'x-component-props': {
                  //         min: 1
                  //       }
                  //     },
                  //     increaseReadSize: {
                  //       title: '每次读取数量(行)',
                  //       type: 'number',
                  //       default: 100,
                  //       'x-decorator': 'FormItem',
                  //       'x-component': 'InputNumber',
                  //       'x-component-props': {
                  //         min: 1
                  //       }
                  //     }
                  //   }
                  // },
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
                  enableDDL: {
                    title: 'DDL事件采集',
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      tooltip: '开启后任务将会自动采集选中的源端DDL事件'
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
                  cdcMode: {
                    title: '增量同步方式',
                    type: 'string',
                    default: 'logCdc',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      tooltip: '特定字段的轮询方式对数据进行增量采集'
                    },
                    'x-component': 'Radio.Group',
                    enum: [
                      { label: '日志cdc', value: 'logCdc' },
                      { label: '轮询', value: 'polling' }
                    ],
                    'x-reactions': {
                      target:
                        '*(cdcPollingFields,cdcPollingFieldsDefaultValues,cdcPollingInterval,cdcPollingBatchSize)',
                      fulfill: {
                        state: {
                          visible: '{{$self.value==="polling"}}'
                        }
                      }
                    }
                  },
                  cdcPollingFields: {
                    title: '指定轮询字段',
                    type: 'array',
                    required: true,
                    default: [{ field: '', defaultValue: '' }],
                    'x-decorator': 'FormItem',
                    'x-component': 'ArrayItems',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          required: 'true',
                          'x-decorator': 'FormItem',
                          'x-component': 'FieldSelect',
                          'x-component-props': {
                            filterable: true
                          },
                          'x-reactions': {
                            effects: ['onFieldInputValueChange']
                          }
                        },
                        defaultValue: {
                          title: '轮询字段默认值',
                          required: true,
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-reactions': {
                            fulfill: {
                              state: {
                                visible: `{{$settings.type === "cdc"}}`
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  cdcPollingInterval: {
                    title: '轮询间隔(ms)',
                    type: 'object',
                    default: 500,
                    'x-decorator': 'FormItem',
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      style: {
                        width: '140px'
                      },
                      min: 500
                    }
                  },
                  cdcPollingBatchSize: {
                    title: '每次读取行数',
                    type: 'number',
                    default: 1000,
                    'x-decorator': 'FormItem',
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      style: {
                        width: '140px'
                      },
                      min: 1
                    }
                  },
                  isFilter: {
                    type: 'boolean',
                    title: '过滤设置',
                    default: false,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: '*(conditions)',
                      fulfill: {
                        state: {
                          visible: '{{$self.value===true}}'
                        }
                      }
                    }
                  },

                  /*limitWrap: {
                    type: 'void',
                    title: '行数限制',
                    'x-decorator': 'FormItem',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle'
                    },
                    properties: {
                      limitType: {
                        type: 'string',
                        default: 'all',
                        enum: [
                          {
                            label: '全部行数',
                            value: 'all'
                          },
                          {
                            label: '自定义',
                            value: 'custom'
                          }
                        ],
                        'x-component': 'Select',
                        'x-reactions': [
                          {
                            target: 'limit',
                            effects: ['onFieldInit'],
                            fulfill: {
                              run: `if ($target.value) {
                                $target.visible = true
                                $self.value = 'custom'
                              } else {
                                $target.visible = false
                                $self.value = 'all'
                              }`
                            }
                          },
                          {
                            target: 'limit',
                            effects: ['onFieldInputValueChange'],
                            fulfill: {
                              state: {
                                visible: `{{$self.value === 'custom'}}`,
                                value: null
                              }
                            }
                          }
                        ]
                      },
                      limit: {
                        type: 'number',
                        required: true,
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1
                        }
                      }
                    }
                  },*/

                  nodeSchema: {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': [
                      `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true, fieldName: 'value'}, $values.id, $values.tableName)}}`,
                      {
                        target: '*(conditions.*.key,cdcPollingFields.*.field)',
                        fulfill: {
                          state: {
                            loading: '{{$self.loading}}',
                            dataSource: '{{$self.value}}'
                          }
                        }
                      }
                    ]
                  },

                  conditions: {
                    title: '自定义条件',
                    type: 'array',
                    required: true,
                    default: [{ key: '', value: '', operator: 5 }],
                    'x-decorator': 'FormItem',
                    'x-component': 'ArrayItems',
                    items: {
                      type: 'object',
                      properties: {
                        space: {
                          type: 'void',
                          'x-component': 'Space',
                          properties: {
                            key: {
                              type: 'string',
                              required: 'true',
                              'x-decorator': 'FormItem',
                              'x-component': 'FieldSelect',
                              'x-component-props': {
                                filterable: true
                              },
                              'x-reactions': {
                                effects: ['onFieldInputValueChange'],
                                fulfill: {
                                  run: '{{$record.value = undefined}}'
                                }
                              }
                            },
                            operator: {
                              type: 'number',
                              required: 'true',
                              enum: [
                                {
                                  label: '>',
                                  value: 1
                                },
                                {
                                  label: '>=',
                                  value: 2
                                },
                                {
                                  label: '<',
                                  value: 3
                                },
                                {
                                  label: '<=',
                                  value: 4
                                },
                                {
                                  label: '=',
                                  value: 5
                                }
                              ],
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                wrapperWidth: 100
                              },
                              'x-component': 'Select'
                            },
                            value: {
                              type: 'string',
                              required: 'true',
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-component-props': {
                                type: 'datetime',
                                align: 'right',
                                format: 'yyyy-MM-dd HH:mm:ss'
                              },
                              'x-reactions': {
                                dependencies: ['nodeSchema', '.key'],
                                fulfill: {
                                  schema: {
                                    'x-component':
                                      '{{field=$deps[0] && $deps[0].find(item=>item.value===$deps[1]),field&&/timestamp|date|DATE_TIME|datetime/i.test(field.type)?"DatePicker":"Input"}}'
                                  }
                                }
                              }
                            },
                            remove: {
                              type: 'void',
                              'x-decorator': 'FormItem',
                              'x-component': 'ArrayItems.Remove',
                              'x-component-props': {
                                disabled: '{{$values.conditions.length<2}}'
                              }
                            }
                          }
                        }
                      }
                    },
                    properties: {
                      add: {
                        type: 'void',
                        title: '添加',
                        'x-component': 'ArrayItems.Addition',
                        'x-component-props': {
                          defaultValue: { key: '', value: '', operator: 5 }
                        }
                      }
                    }
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
                    'x-decorator-props': {
                      wrapperWidth: 300
                    },
                    'x-component': 'Select',
                    'x-reactions': {
                      fulfill: {
                        run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $settings.type === "cdc"}}',
                        state: {
                          description: `{{$settings.type === "cdc" ? '纯增量场景下，不支持对目标表结构和数据的清除操作。':''}}`
                        },
                        schema: {
                          // 根据capabilities列表如果不存在{"id" : "clear_table_function"}属性，表示不支持“运行前删除已存在数据”，⚠️👇表达式依赖enum的顺序
                          'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`
                        }
                      }
                    }
                  },
                  // writeStrategy: {
                  //   title: '数据写入模式',
                  //   type: 'string',
                  //   default: 'updateOrInsert',
                  //   enum: [
                  //     {
                  //       label: '追加写入',
                  //       value: 'appendWrite'
                  //     },
                  //     {
                  //       label: '更新已存在或者插入新数据',
                  //       value: 'updateOrInsert'
                  //     }
                  //   ],
                  //   'x-decorator': 'FormItem',
                  //   'x-decorator-props': {
                  //     wrapperWidth: 300
                  //   },
                  //   'x-component': 'Select',
                  //   'x-reactions': [
                  //     {
                  //       target: 'updateConditionFields',
                  //       fulfill: {
                  //         state: {
                  //           display: '{{$self.value!=="appendWrite" ? "visible":"hidden"}}'
                  //         }
                  //       }
                  //     }
                  //   ]
                  // },
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
                        'x-component': 'Radio.Group',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: '统计追加写入: 只处理插入事件，丢弃更新和删除事件'
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
                  updateConditionFields: {
                    title: '更新条件字段',
                    type: 'array',
                    required: true,
                    default: null,
                    description: '{{ !$isDaas ? "如果源为MongoDB时，需要同步删除事件，请确保关联 _id" : ""}}',
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
                            if (!$self.value && $self.dataSource && $self.dataSource.length) {
                              let isPrimaryKeyList = $self.dataSource.filter(item => item.isPrimaryKey)
                              let indicesUniqueList = $self.dataSource.filter(item => item.indicesUnique)
                              $self.setValue((isPrimaryKeyList.length ? isPrimaryKeyList : indicesUniqueList).map(item => item.value))
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
                type: 'object'
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
      },

      loadSchemaTree: {
        type: 'void',
        title: '',
        'x-decorator': 'FormItem',
        'x-component': 'loadSchemaTree',
        'x-component-props': {
          tableNameField: 'tableName'
        },
        'x-reactions': {
          dependencies: ['databaseType', '$outputs'],
          fulfill: {
            state: {
              display:
                '{{ ($deps[1].length > 0 && ["CSV","EXCEL","JSON","XML"].includes($deps[0])) ? "visible":"hidden"}}'
            }
          }
        }
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
