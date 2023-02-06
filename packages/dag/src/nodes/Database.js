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

      name: {
        type: 'string',
        title: i18n.t('packages_dag_nodes_database_jiedianmingcheng'),
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
            title: i18n.t('packages_dag_nodes_database_lianjiemingcheng'),
            'x-decorator': 'FormItem',
            'x-component': 'PreviewText.Input'
          },
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
          dependencies: ['$outputs'],
          fulfill: {
            state: {
              display: '{{$deps[0].length > 0 ? "visible":"hidden"}}'
            }
          }
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
          },

          migrateTableSelectType: {
            title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
            type: 'string',
            default: 'custom',
            'x-decorator': 'StageButtonLabel',
            'x-decorator-props': {
              asterisk: true,
              feedbackLayout: 'none',
              connectionId: '',
              title: i18n.t('packages_dag_nodes_database_xuanzebiao')
            },
            'x-component': 'Radio.Group',
            enum: [
              {
                label: i18n.t('packages_dag_nodes_database_anbiaomingxuanze'),
                value: 'custom'
              },
              {
                label: i18n.t('packages_dag_nodes_database_anzhengzebiaoda'),
                value: 'expression'
              }
            ],
            'x-reactions': {
              dependencies: ['.connectionId'],
              fulfill: {
                schema: {
                  'x-decorator-props.connectionId': `{{$deps[0]}}`
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
                marginTop: '8px',
                height: 'unset',
                minHeight: 0,
                maxHeight: 'calc((100vh - 120px) * 0.618)'
              },
              hideReload: true
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
            description: i18n.t('packages_dag_nodes_database_zhengzebiaodashi'),
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
                title: i18n.t('packages_dag_nodes_database_piliangxierutiao'), //增量批次读取条数
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'InputNumber',
                'x-decorator-props': {
                  tooltip: i18n.t('packages_dag_nodes_database_quanliangmeipici2')
                },
                'x-component-props': {
                  min: 1,
                  max: 100000
                },
                default: 2000
              },
              writeBatchWaitMs: {
                title: i18n.t('packages_dag_nodes_database_xierumeipizui'), //增量批次读取条数
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
            title: i18n.t('packages_dag_nodes_database_ddLshijian'),
            'x-decorator': 'FormItem',
            'x-decorator-props': {
              tooltip: i18n.t('packages_dag_nodes_database_dangqianjiedianzhi'),
              feedbackLayout: 'none'
            },
            'x-component': 'DdlEventList',
            'x-component-props': {
              findParentNodes: '{{findParentNodes}}'
            }
          },
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
                  title: i18n.t('packages_dag_task_stetting_most_setting')
                },
                properties: {
                  existDataProcessMode: {
                    type: 'string',
                    title: i18n.t('packages_dag_nodes_database_chongfuchulice'),
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
                  },

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
