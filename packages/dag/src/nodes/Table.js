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
        'x-display': 'hidden',
        'x-reactions': {
          target: 'updateConditionFields',
          effects: ['onFieldValueChange'],
          fulfill: {
            run: `setTimeout(() => {
              console.log("updateConditionFields.$inputs")
              $target && $target.visible && $target.validate()
            }, 0)`
          }
        }
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden'
      },
      type: {
        type: 'string',
        'x-display': 'hidden'
      },
      databaseType: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': {
          fulfill: {
            run: `{{ ["CSV","EXCEL","JSON","XML"].includes($self.value) && !$values.tableName && ($values.tableName = 'tapdata') }}`
          }
        }
      },
      name: {
        type: 'string',
        title: i18n.t('public_node_name'),
        required: true,
        'x-decorator': 'FormItem',
        'x-component': 'Input',
        'x-component-props': {
          onChange: `{{() => {
            $values.attrs.hasNameEdited = true
          }}}`
        }
      },

      connectionIdWrap: {
        type: 'void',
        title: i18n.t('packages_dag_nodes_table_shujuku'),
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
              tooltip: i18n.t('packages_dag_nodes_table_fuzhishujuku'),
              finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi')
            }
          }
        }
      },

      tableNameWrap: {
        type: 'void',
        title: i18n.t('packages_dag_dag_table'),
        'x-decorator': 'StageButtonLabel',
        'x-decorator-props': {
          asterisk: true,
          feedbackLayout: 'none',
          connectionId: '{{$values.connectionId}}',
          title: i18n.t('packages_dag_dag_table'),
          target: 'tableNameWrap.tableName'
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
                message: i18n.t('packages_dag_nodes_table_qingxuanzebiao')
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
                  run: `{{ $self.value && !$values.attrs.hasNameEdited && ($target.value = $self.value) }}`
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
              tooltip: i18n.t('packages_dag_nodes_table_fuzhibiaoming'),
              finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi')
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

      updateConditionFields: {
        title: i18n.t('packages_dag_nodes_table_gengxintiaojianzi'),
        type: 'array',
        description: `{{ !$isDaas ? "${i18n.t('packages_dag_nodes_table_isDaa_ruguoyuanweimongodb')}" : ""}}`,
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          asterisk: true
        },
        'x-component': 'FieldSelect',
        'x-component-props': {
          allowCreate: true,
          multiple: true,
          filterable: true,
          onCreate: `{{() => {
            // 标记用户创建
            $values.attrs.hasCreated = true
          }}}`
        },
        'x-reactions': [
          {
            dependencies: ['$inputs'],
            fulfill: {
              state: {
                visible: '{{$deps[0].length > 0}}'
              }
            }
          },
          `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.$inputs[0])}}`,
          {
            effects: ['onFieldMount'],
            fulfill: {
              run: '$self.visible && $self.validate()'
            }
          }
        ],
        'x-validator': {
          triggerType: 'onBlur',
          validator: `{{validateUpdateConditionFields}}`
        }
      },

      // 指定agent
      'attrs.accessNodeProcessId': {
        type: 'string',
        title: i18n.t('packages_dag_nodes_database_suoshuage'),
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
        /*'x-reactions': {
          dependencies: ['$inputs', '$outputs'],
          fulfill: {
            state: {
              display:
                '{{$hasPdkConfig($values.attrs.pdkHash) || $deps[0].length > 0 || $deps[1].length > 0 ? "visible":"hidden"}}'
            }
          }
        },*/
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormCollapse.Item',
            'x-component-props': {
              title: i18n.t('packages_dag_task_stetting_most_setting')
            },
            properties: {
              sourceNodeConfig: {
                type: 'void',
                'x-component': 'FormContent', // 为properties组件增加根节点，避免vue-frag报错
                'x-reactions': {
                  dependencies: ['$outputs', '$inputs'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0].length || !$deps[1].length ? "visible":"hidden"}}'
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
                  readPartitionOptions: {
                    type: 'object',
                    'x-decorator': 'FormItem',
                    properties: {
                      enable: {
                        type: 'boolean',
                        default: false,
                        'x-decorator': 'IconLabel',
                        'x-decorator-props': {
                          title: i18n.t('packages_dag_nodes_database_quanliangduandianxu'),
                          iconSize: 30,
                          tooltip: i18n.t('packages_dag_nodes_database_quanliangduandianshi')
                        },
                        'x-component': 'Switch',
                        'x-reactions': [
                          {
                            dependencies: ['isFilter', 'enableCustomCommand'],
                            fulfill: {
                              schema: {
                                'x-component-props.disabled': '{{!!$deps[0] || !!$deps[1]}}'
                              },
                              state: {
                                description: `{{!!$deps[0] || !!$deps[1] ? '${i18n.t(
                                  'packages_dag_nodes_table_depsd'
                                )}':''}}`
                              }
                            }
                          }
                        ]
                      },
                      splitType: {
                        title: i18n.t('packages_dag_nodes_database_fenpianfangshi'),
                        type: 'number',
                        default: 10,
                        enum: [
                          {
                            label: i18n.t('packages_dag_nodes_database_jiyumin'),
                            value: 10
                          },
                          {
                            label: i18n.t('packages_dag_nodes_database_jiyucou'),
                            value: 1
                          }
                        ],
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        'x-reactions': {
                          dependencies: ['.enable'],
                          fulfill: {
                            run: `{{ $values.splitTyp !== 10 && $values.attrs.capabilities.some(t => t.id === 'count_by_partition_filter_function') && $self.setValue(1) }}`,
                            state: {
                              display: '{{$deps[0] ? "visible" :"hidden"}}'
                            },
                            schema: {
                              'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.some(item => item.id ==='count_by_partition_filter_function') && options.push($self.dataSource[1]),options}}`
                            }
                          }
                        }
                      },
                      maxRecordInPartition: {
                        title: i18n.t('packages_dag_nodes_database_fenpiandaxiao'),
                        type: 'number',
                        default: 200000,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        },
                        'x-reactions': {
                          dependencies: ['.enable', '.splitType'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] && $deps[1] === 1 ? "visible" :"hidden"}}'
                            }
                          }
                        }
                      },
                      minMaxSplitPieces: {
                        title: i18n.t('packages_dag_nodes_database_fenpianshuliang'),
                        type: 'number',
                        default: 100,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        },
                        'x-reactions': {
                          dependencies: ['.enable', '.splitType'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] && $deps[1] === 10 ? "visible" :"hidden"}}'
                            }
                          }
                        }
                      },
                      partitionThreadCount: {
                        title: i18n.t('packages_dag_nodes_database_fenpianbingfaxian'),
                        type: 'number',
                        default: 8,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        },
                        'x-reactions': {
                          dependencies: ['.enable'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] ? "visible" :"hidden"}}'
                            }
                          }
                        }
                      },
                      partitionBatchCount: {
                        title: i18n.t('packages_dag_nodes_database_fenpianyipidu'),
                        type: 'number',
                        default: 3000,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0
                        },
                        'x-reactions': {
                          dependencies: ['.enable'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] ? "visible" :"hidden"}}'
                            }
                          }
                        }
                      },
                      hasKVStorage: {
                        type: 'boolean',
                        title: i18n.t('packages_dag_nodes_database_fenpianpilianghezengliang'),
                        default: true,
                        'x-component': 'Switch',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_nodes_database_guanbicigongnenghoufenpian')
                        },
                        'x-reactions': {
                          dependencies: ['.enable'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] ? "visible" :"hidden"}}'
                            }
                          }
                        }
                      }
                    }
                  },
                  readBatchSize: {
                    title: i18n.t('packages_dag_nodes_database_piliangduqutiao'), //增量批次读取条数
                    type: 'string',
                    'x-decorator': 'FormItem',
                    'x-component': 'InputNumber',
                    'x-decorator-props': {
                      tooltip: i18n.t('packages_dag_nodes_database_quanliangmeipici')
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
                    title: i18n.t('packages_dag_nodes_table_ddLshijian'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'item-control-horizontal',
                      layout: 'horizontal',
                      tooltip: i18n.t('packages_dag_nodes_database_kaiqihourenwu')
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
                            description: `{{$values.databaseType + '${i18n.t(
                              'packages_dag_nodes_database_value_zanbuzhiciddl'
                            )}'}}`
                          }
                        }
                      }
                    ]
                  },
                  disabledEvents: {
                    type: 'array',
                    'x-component': 'DdlEventCheckbox'
                  },
                  enableCustomCommand: {
                    title: i18n.t('packages_dag_nodes_table_zidingyichaxun'),
                    type: 'boolean',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                      tooltip: ''
                    },
                    'x-component': 'Switch',
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            visible: `{{$settings.type !== "cdc" && $values.attrs.capabilities.some(item => item.id === "execute_command_function")}}`
                          }
                        }
                      },
                      {
                        target: 'customCommand',
                        fulfill: {
                          state: {
                            visible: '{{!!$self.value}}'
                          }
                        }
                      },
                      {
                        dependencies: ['isFilter', 'readPartitionOptions.enable'],
                        fulfill: {
                          schema: {
                            'x-component-props.disabled': '{{!!$deps[0] || !!$deps[1]}}'
                          },
                          state: {
                            description: `{{!!$deps[1] ? '${i18n.t('packages_dag_nodes_table_depskai2')}':''}}`
                          }
                        }
                      }
                    ]
                  },
                  customCommand: {
                    type: 'object',
                    properties: {
                      command: {
                        type: 'string',
                        default: 'executeQuery',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        enum: [
                          { label: i18n.t('public_query'), value: 'executeQuery' },
                          { label: i18n.t('public_aggregate'), value: 'aggregate' }
                        ],
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display: '{{$values.databaseType==="MongoDB"?"visible":"hidden"}}'
                            }
                          }
                        }
                      },
                      params: {
                        type: 'object',
                        properties: {
                          mongoQuery: {
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['customCommand.command'],
                              fulfill: {
                                state: {
                                  visible: '{{$values.databaseType==="MongoDB" && $deps[0]==="executeQuery"}}'
                                }
                              }
                            },
                            properties: {
                              op: {
                                type: 'string',
                                default: 'find'
                              },
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      value: '{{$values.tableName}}'
                                    }
                                  }
                                }
                              },
                              filter: {
                                type: 'string',
                                'x-decorator': 'FormItem',
                                description: i18n.t('packages_dag_nodes_table_jinzhichiqu'),
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              }
                            }
                          },
                          mongoAgg: {
                            type: 'void',
                            'x-reactions': {
                              dependencies: ['customCommand.command'],
                              fulfill: {
                                state: {
                                  visible: '{{$values.databaseType==="MongoDB" && $deps[0]==="aggregate"}}'
                                }
                              }
                            },
                            properties: {
                              collection: {
                                type: 'string',
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      value: '{{$values.tableName}}'
                                    }
                                  }
                                }
                              },
                              pipeline: {
                                type: 'string',
                                'x-decorator': 'FormItem',
                                description: i18n.t('packages_dag_nodes_table_shiligro'),
                                'x-component': 'JsonEditor',
                                'x-component-props': {
                                  options: { showPrintMargin: false, useWrapMode: true }
                                }
                              }
                            }
                          },
                          sql: {
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'SqlEditor',
                            'x-component-props': {
                              options: { showPrintMargin: false, useWrapMode: true }
                            },
                            'x-reactions': {
                              fulfill: {
                                state: {
                                  visible: '{{$values.databaseType!=="MongoDB"}}'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  cdcMode: {
                    title: i18n.t('packages_dag_nodes_table_zengliangtongbufang'),
                    type: 'string',
                    default: 'logCdc',
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      tooltip: i18n.t('packages_dag_nodes_table_tedingziduande')
                    },
                    'x-component': 'Radio.Group',
                    enum: [
                      { label: i18n.t('packages_dag_nodes_table_rizhicdc'), value: 'logCdc' },
                      { label: i18n.t('packages_dag_nodes_table_lunxun'), value: 'polling' }
                    ],
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            visible: `{{$settings.type !== "initial_sync" && $values.attrs.capabilities.some(item => item.id === 'query_by_advance_filter_function')}}`
                          }
                        }
                      },
                      {
                        target:
                          '*(cdcPollingFields,cdcPollingFieldsDefaultValues,cdcPollingInterval,cdcPollingBatchSize)',
                        fulfill: {
                          state: {
                            visible: '{{$self.value==="polling"}}'
                          }
                        }
                      }
                    ]
                  },
                  cdcPollingFields: {
                    title: i18n.t('packages_dag_nodes_table_zhidinglunxunzi'),
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
                          title: i18n.t('packages_dag_nodes_table_lunxunziduanmo'),
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
                    title: i18n.t('packages_dag_nodes_table_lunxunjiangem'),
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
                    title: i18n.t('packages_dag_nodes_table_meiciduquhang'),
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
                    title: i18n.t('packages_dag_nodes_table_guolushezhi'),
                    default: false,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    'x-component': 'Switch',
                    'x-reactions': [
                      {
                        dependencies: ['enableCustomCommand', 'readPartitionOptions.enable'],
                        fulfill: {
                          schema: {
                            'x-component-props.disabled': '{{!!$deps[0] || !!$deps[1] }}'
                          },
                          state: {
                            description: `{{!!$deps[1] ? '${i18n.t('packages_dag_nodes_table_depskai')}':''}}`
                          }
                        }
                      },
                      {
                        target: '*(conditions)',
                        fulfill: {
                          state: {
                            visible: '{{$self.value===true}}'
                          }
                        }
                      }
                    ]
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
                      },
                      {
                        target: '*(readPartitionOptions.enable)',
                        fulfill: {
                          state: {
                            value:
                              '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? $values.readPartitionOptions.enable:false}}'
                          }
                        }
                      },
                      {
                        target: '*(readPartitionOptions)',
                        fulfill: {
                          state: {
                            display:
                              '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? "visible":"hidden"}}'
                          }
                        }
                      }
                    ]
                  },

                  conditions: {
                    title: i18n.t('packages_dag_nodes_table_zidingyitiaojian'),
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
                        title: i18n.t('packages_dag_nodes_table_tianjia'),
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
                  initialConcurrentSpace: {
                    title: i18n.t('packages_dag_nodes_database_quanliangduoxiancheng'),
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
                    title: i18n.t('packages_dag_nodes_database_zengliangduoxiancheng'),
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
                        title: i18n.t('packages_dag_nodes_database_piliangxierutiao'), //增量批次读取条数
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_nodes_database_quanliangmeipici2')
                        },
                        'x-component-props': {
                          min: 1,
                          max: 10000000
                        },
                        default: 1000
                      },
                      writeBatchWaitMs: {
                        title: i18n.t('packages_dag_nodes_database_xierumeipizui'), //增量批次读取条数
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1
                        },
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_nodes_database_xierumeipizui_tips')
                        },
                        default: 500
                      }
                    }
                  },
                  existDataProcessMode: {
                    title: i18n.t('packages_dag_nodes_table_yiyoushujuchu'),
                    type: 'string',
                    default: 'keepData',
                    enum: [
                      {
                        label: i18n.t('packages_dag_nodes_database_baochimubiaoduan'),
                        value: 'keepData'
                      },
                      {
                        label: i18n.t('packages_dag_nodes_database_qingchumubiaoduan'),
                        value: 'dropTable',
                        disabled: true
                      },
                      {
                        label: i18n.t('packages_dag_nodes_targetdatabase_baochimubiaoduan'),
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
                          description: `{{$settings.type === "cdc" ? '${i18n.t(
                            'packages_dag_nodes_database_setting_cdc_changjing_desc'
                          )}':''}}`
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
                        title: i18n.t('packages_dag_nodes_mergetable_shujuxierumo'),
                        type: 'string',
                        default: 'updateOrInsert',
                        'x-component': 'Radio.Group',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_nodes_database_tongjizhuijiaxie2')
                        },
                        enum: [
                          {
                            label: i18n.t('packages_dag_nodes_database_anshijianleixing'),
                            value: 'updateOrInsert'
                          },
                          {
                            label: i18n.t('packages_dag_nodes_database_tongjizhuijiaxie'),
                            value: 'appendWrite'
                          }
                        ],
                        'x-reactions': {
                          target: '*(dmlPolicy,updateConditionFields)',
                          fulfill: {
                            state: {
                              display: '{{$self.value === "appendWrite" ? "hidden":"visible"}}'
                            }
                          }
                        }
                      }
                    }
                  },
                  dmlPolicy: {
                    title: i18n.t('packages_dag_nodes_database_shujuxieruce'),
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
                          addonBefore: i18n.t('packages_dag_nodes_database_charushijian')
                        },
                        default: 'update_on_exists',
                        enum: [
                          {
                            label: i18n.t('packages_dag_nodes_targetdatabase_mubiaocunzaishi'),
                            value: 'update_on_exists'
                          },
                          {
                            label: i18n.t('packages_dag_nodes_database_mubiaocunzaishi'),
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
                          addonBefore: i18n.t('packages_dag_nodes_database_gengxinshijian')
                        },
                        default: 'ignore_on_nonexists',
                        enum: [
                          {
                            label: i18n.t('packages_dag_nodes_database_bucunzaishidiu'),
                            value: 'ignore_on_nonexists'
                          },
                          {
                            label: i18n.t('packages_dag_nodes_database_bucunzaishicha'),
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
                          addonBefore: i18n.t('packages_dag_nodes_database_shanchushijian')
                        },
                        'x-component': 'Tag',
                        'x-content': i18n.t('packages_dag_nodes_database_bucunzaishidiu'),
                        'x-component-props': {
                          type: 'info',
                          effect: 'light'
                        }
                      }
                    }
                  },
                  ddlEvents: {
                    type: 'void',
                    title: i18n.t('packages_dag_nodes_database_ddLshijian'),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      feedbackLayout: 'none'
                    },
                    'x-component': 'DdlEventList',
                    'x-component-props': {
                      findParentNodes: '{{findParentNodes}}'
                    }
                  },
                  incrementExactlyOnceObject: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      incrementExactlyOnceEnable: {
                        title: i18n.t('packages_dag_nodes_database_increment_exactly_once_enable_title'),
                        type: 'boolean',
                        default: false,
                        'x-component': 'Switch',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal',
                          layout: 'horizontal',
                          tooltip: i18n.t('packages_dag_nodes_database_increment_exactly_once_enable_tips')
                        }
                      },
                      incrementExactlyOnceEnableTimeWindowDay: {
                        title: i18n.t(
                          'packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_title'
                        ),
                        type: 'number',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal ml-3',
                          layout: 'horizontal',
                          tooltip: i18n.t(
                            'packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_tips'
                          )
                        },
                        'x-component': 'Select',
                        'x-component-props': {
                          style: {
                            width: '100px'
                          }
                        },
                        enum: [1, 3, 5, 7],
                        default: 3
                      }
                    },
                    'x-reactions': [
                      {
                        fulfill: {
                          state: {
                            display: `{{findParentNodes($values.id).length < 2 && $values.attrs.capabilities.filter(item => ["transaction_begin_function", "transaction_commit_function", "transaction_rollback_function"].includes(item.id)).length === 3 ? 'visible' : 'hidden'}}`
                          }
                        }
                      }
                    ]
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

      'attrs.capabilities': {
        type: 'array',
        'x-display': 'hidden',
        'x-reactions': '{{useDmlPolicy}}'
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
