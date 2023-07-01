import i18n from '@tap/i18n'
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

      type: {
        type: 'string',
        'x-display': 'hidden'
      },

      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          class: 'config-tabs',
          formTab: '{{formTab}}'
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings')
            },
            properties: {
              nameWrap: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  minColumns: 2,
                  maxColumns: 2,
                  columnGap: 16
                },
                properties: {
                  name: {
                    type: 'string',
                    title: i18n.t('public_node_name'),
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input'
                  },
                  'attrs.connectionName': {
                    type: 'string',
                    title: i18n.t('public_connection_name'),
                    'x-decorator': 'FormItem',
                    'x-component': 'PreviewText.Input'
                  }
                }
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
                  'attrs.accessNodeProcessId': {
                    type: 'string',
                    title: i18n.t('packages_dag_nodes_database_suoshuage'),
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
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{(!$deps[0].length && $values.attrs.connectionType.includes("source")) ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  migrateTableSelectType: {
                    title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
                    type: 'string',
                    default: 'custom',
                    'x-decorator': 'StageButtonLabel',
                    'x-decorator-props': {
                      asterisk: true,
                      feedbackLayout: 'none',
                      connectionId: '{{$values.connectionId}}',
                      title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
                      target: ''
                    },
                    'x-component': 'Radio.Group',
                    'x-reactions': {
                      fulfill: {
                        schema: {
                          'x-decorator-props.target': `{{$self.value==='expression'?'tableListCard':'tableNames'}}`
                        }
                      }
                    },
                    enum: [
                      {
                        label: i18n.t('packages_dag_nodes_database_anbiaomingxuanze'),
                        value: 'custom'
                      },
                      {
                        label: i18n.t('packages_dag_nodes_database_anzhengzebiaoda'),
                        value: 'expression'
                      }
                    ]
                  },

                  noPrimaryKeyTableSelectType: {
                    type: 'string',
                    title: i18n.t('packages_dag_nodes_database_biaoxianshi'),
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    default: 'All',
                    enum: [
                      { label: i18n.t('public_select_option_all'), value: 'All' },
                      { label: i18n.t('packages_dag_nodes_database_jinyouzhujianbiao'), value: 'HasKeys' },
                      { label: i18n.t('packages_dag_nodes_database_jinwuzhujianbiao'), value: 'NoKeys' }
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
                      },
                      hideReload: true,
                      filterType: `{{ $values.noPrimaryKeyTableSelectType }}`
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
                    required: true,
                    description: i18n.t('packages_dag_nodes_database_zhengzebiaodashi'),
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
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

                  tableListCard: {
                    type: 'void',
                    'x-decorator': 'FormItem',
                    'x-component': 'TableListCard',
                    'x-component-props': {
                      rows: 1,
                      title: i18n.t('packages_dag_nodes_database_pipeidaodebiao'),
                      connectionId: '{{$values.connectionId}}',
                      params: '{{ {regex: $values.tableExpression,limit:0} }}',
                      filterType: `{{ $values.noPrimaryKeyTableSelectType }}`
                    },
                    'x-reactions': {
                      dependencies: ['migrateTableSelectType'],
                      fulfill: {
                        state: {
                          display: '{{$deps[0] === "expression" ? "visible":"hidden"}}'
                        }
                      }
                    }
                  }
                }
              },

              targetConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{$deps[0].length > 0 || $values.attrs.connectionType === "target" ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  fieldMapping: {
                    type: 'void',
                    title: i18n.t('packages_dag_nodes_database_tuiyanjieguo'),
                    'x-decorator': 'FormItem',
                    'x-component': 'fieldInference',
                    'x-component-props': {
                      style: {
                        'margin-top': '-36px'
                      }
                    }
                  },

                  'attrs.capabilities': {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': '{{useDmlPolicy}}'
                  }
                }
              }
            }
          },
          advancedTab: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_advanced_settings')
            },
            properties: {
              sourceCollapse: {
                type: 'void',
                'x-component': 'FormCollapse',
                'x-component-props': {
                  class: 'advanced-collapse'
                },
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{(!$deps[0].length && $values.attrs.connectionType.includes("source")) ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  tab1: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: 'DDL同步配置'
                    },
                    properties: {
                      enableDDL: {
                        title: i18n.t('packages_dag_nodes_table_ddLshijian'),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          // addonAfter: '开启后任务将会自动采集选中的源端DDL事件',
                          tooltip: i18n.t('packages_dag_nodes_database_kaiqihourenwu'),
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
                      }
                    }
                  },
                  tab2: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: '驱动读取配置'
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display: '{{$settings.type === "cdc" ? "hidden":"visible"}}'
                        }
                      }
                    },
                    properties: {
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
                      }
                    }
                  },
                  tab3: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: '断点续传配置'
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display:
                            '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? "visible":"hidden"}}'
                        }
                      }
                    },
                    properties: {
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
                            'x-reactions': {
                              fulfill: {
                                state: {
                                  display:
                                    '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") ? "visible" :"hidden"}}'
                                }
                              }
                            }
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
                        },
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display: '{{$settings.type === "cdc" ? "hidden":"visible"}}'
                            }
                          }
                        }
                      }
                    }
                  },
                  tab6: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: '数据源专属配置'
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          // display: '{{$hasPdkConfig($values.attrs.pdkHash) ? "visible":"hidden"}}',
                          visible: '{{$hasPdkConfig($values.attrs.pdkHash)}}'
                        }
                      }
                    },
                    properties: {
                      nodeConfig: {
                        type: 'object'
                      }
                    }
                  }
                }
              },
              targetCollapse: {
                type: 'void',
                'x-component': 'FormCollapse',
                'x-component-props': {
                  class: 'advanced-collapse'
                },
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{$deps[0].length > 0 || $values.attrs.connectionType === "target" ? "visible":"hidden"}}'
                    }
                  }
                },
                properties: {
                  tab1: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_nodes_database_ddLshijian')
                    },
                    properties: {
                      ddlEvents: {
                        type: 'void',
                        // title: i18n.t('packages_dag_nodes_database_ddLshijian'),
                        // 'x-decorator': 'FormItem',
                        // 'x-decorator-props': {
                        //   tooltip: i18n.t('packages_dag_nodes_database_dangqianjiedianzhi'),
                        //   feedbackLayout: 'none'
                        // },
                        'x-component': 'DdlEventList',
                        'x-component-props': {
                          hideParent: true,
                          findParentNodes: '{{findParentNodes}}'
                        }
                      }
                    }
                  },
                  tab2: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: '数据写入配置'
                    },
                    properties: {
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
                            ]
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
                        },
                        'x-reactions': {
                          dependencies: ['writeStrategy'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "appendWrite" ? "hidden":"visible"}}'
                            }
                          }
                        }
                      }
                    }
                  },
                  tab3: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: '数据源专属配置'
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          // display: '{{$hasPdkConfig($values.attrs.pdkHash) ? "visible":"hidden"}}',
                          visible: '{{$hasPdkConfig($values.attrs.pdkHash)}}'
                        }
                      }
                    },
                    properties: {
                      nodeConfig: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: '数据模型'
            },
            properties: {
              schemaPanel: {
                type: 'void',
                'x-component': 'SchemaPanel',
                'x-component-props': {
                  class: 'mx-n4 my-n1',
                  formTab: '{{formTab}}'
                }
              }
            }
          },
          tab3: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi')
            },
            // 'x-hidden': '{{!$isMonitor}}',
            properties: {
              alarmSettings: {
                type: 'array',
                default: [
                  {
                    type: 'DATANODE',
                    sort: 4,
                    open: true,
                    key: 'DATANODE_AVERAGE_HANDLE_CONSUME',
                    notify: ['SYSTEM', 'EMAIL'],
                    interval: 300,
                    unit: 'SECOND'
                  }
                ]
              },
              alarmRules: {
                type: 'array',
                default: [
                  {
                    key: 'DATANODE_AVERAGE_HANDLE_CONSUME',
                    point: 12,
                    equalsFlag: 1,
                    ms: 5000
                  }
                ]
              },
              'alarmSettings.0.open': {
                title: i18n.t('packages_business_setting_alarmnotification_dangshujuyuanjie'),
                type: 'boolean',
                'x-editable': true,
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-component-props': {
                  onChange: `{{val=>(val && !$values.alarmRules[0].notify.length && ($values.alarmRules[0].notify=["SYSTEM"]))}}`
                },
                'x-reactions': {
                  target: 'alarmRules.0.*',
                  fulfill: {
                    state: {
                      disabled: `{{!$self.value}}`
                    }
                  }
                }
              },
              'alarmRules.0.notify': {
                type: 'array',
                'x-editable': true,
                'x-decorator': 'FormItem',
                'x-component': 'Checkbox.Group',
                'x-component-props': {
                  onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`
                },
                default: ['SYSTEM', 'EMAIL'],
                'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
              },
              space: {
                type: 'void',
                'x-component': 'Space',
                properties: {
                  'alarmRules.0.point': {
                    type: 'number',
                    'x-reactions': [
                      {
                        dependencies: ['._point'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12)}}`
                          }
                        }
                      },
                      {
                        target: 'alarmRules.0._point',
                        effects: ['onFieldInit'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($self.value / 12) < 1 ? 1 : Math.ceil($self.value / 12)}}`
                          }
                        }
                      }
                    ]
                  },
                  'alarmRules.0._point': {
                    title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                    type: 'number',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                      precision: 0,
                      style: {
                        width: '100px'
                      }
                    }
                  },
                  'alarmRules.0.equalsFlag': {
                    title: i18n.t('public_time_m'),
                    type: 'number',
                    default: 1,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      style: {
                        width: '70px'
                      }
                    },
                    enum: [
                      {
                        label: '<=',
                        value: -1
                      },
                      {
                        label: '>=',
                        value: 1
                      }
                    ],
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          disabled: `{{!$deps[0]}}`
                        }
                      }
                    }
                  },
                  'alarmRules.0.ms': {
                    type: 'number',
                    'x-reactions': [
                      {
                        dependencies: ['._ms'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000)}}`
                          }
                        }
                      },
                      {
                        target: 'alarmRules.0._ms',
                        effects: ['onFieldInit'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($self.value / 1000) < 1 ? 1 : Math.ceil($self.value / 1000)}}`
                          }
                        }
                      }
                    ]
                  },
                  'alarmRules.0._ms': {
                    title: '',
                    type: 'number',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                      precision: 0,
                      style: {
                        width: '100px'
                      }
                    }
                  },
                  unit: {
                    title: 's',
                    type: 'void',
                    default: 0,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal'
                    }
                  }
                }
              }
            }
          }
        }
      },

      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden'
      }
    }
  }

  allowTarget(target, source) {
    // 不再支持既是源又是目标的节点
    return !source.$inputs?.length && (target.type !== 'database' || !target.$outputs?.length)
  }

  allowSource(source, target) {
    // 不再支持既是源又是目标的节点
    return !target.$outputs?.length
  }
}
