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
        'x-reactions': {
          dependencies: ['databaseType'],
          fulfill: {
            state: {
              display: '{{ !["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}'
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
                  }

                  /*isFilter: {
                    type: 'boolean',
                    title: '过滤设置',
                    default: false,
                    'x-decorator': 'FormItem',
                    'x-component': 'Switch',
                    'x-reactions': {
                      target: '*(nodeSchema,conditions)',
                      fulfill: {
                        state: {
                          visible: '{{$self.value===true}}'
                        }
                      }
                    }
                  },*/

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

                  /*nodeSchema: {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': [
                      `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true, fieldName: 'value'}, $values.id, $values.tableName)}}`,
                      {
                        target: 'conditions.*.key',
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
                          'x-component-props': {
                            align: 'top'
                          },
                          properties: {
                            key: {
                              type: 'string',
                              required: 'true',
                              'x-decorator': 'FormItem',
                              'x-component': 'FieldSelect',
                              'x-component-props': {
                                filterable: true
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
                                      '{{field=$deps[0].find(item=>item.value===$deps[1]),field&&/timestamp|date|DATE_TIME|datetime/i.test(field.type)?"DatePicker":"Input"}}'
                                  }
                                }
                              }
                            },
                            /!*add: {
                              type: 'void',
                              'x-component': 'ArrayItems.Addition',
                              'x-component-props': {
                                type: 'text',
                                icon: 'el-icon-plus',
                                class: 'border-0'
                              }
                            },*!/
                            remove: {
                              type: 'void',
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
                  }*/
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
                type: 'object' /*,
                'x-component': 'PdkProperties'*/
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
