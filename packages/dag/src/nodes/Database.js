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
        'x-display': 'hidden',
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden',
      },
      databaseType: {
        type: 'string',
        'x-display': 'hidden',
      },
      connectionId: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': '{{useSyncConnection}}',
      },

      type: {
        type: 'string',
        'x-display': 'hidden',
      },

      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          class: 'config-tabs',
          formTab: '{{formTab}}',
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings'),
            },
            properties: {
              nameWrap: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  minColumns: 2,
                  maxColumns: 2,
                  columnGap: 16,
                },
                properties: {
                  nameWrap: {
                    type: 'void',
                    title: i18n.t('public_node_name'),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      asterisk: true,
                      feedbackLayout: 'none',
                    },
                    'x-component': 'FormFlex',
                    'x-component-props': {
                      gap: 8,
                      align: 'start',
                    },
                    properties: {
                      name: {
                        type: 'string',
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          style: {
                            flex: 1,
                          },
                        },
                        'x-component': 'Input',
                        'x-component-props': {
                          onChange: `{{() => { $values.attrs.hasNameEdited = true }}}`,
                        },
                      },

                      clipboardButton: {
                        type: 'void',
                        'x-component': 'ClipboardButton',
                        'x-component-props': {
                          tooltip: i18n.t('packages_dag_copy_node_id'),
                          finishTooltip: i18n.t(
                            'packages_dag_nodes_table_yifuzhi',
                          ),
                          content: '{{$values.id}}',
                        },
                      },
                    },
                  },
                  'attrs.connectionName': {
                    type: 'string',
                    title: i18n.t('public_connection_name'),
                    'x-decorator': 'FormItem',
                    'x-component': 'div',
                    'x-content': '{{$self.value}}',
                    'x-component-props': {
                      class: 'ellipsis',
                      title: '{{$self.value}}',
                    },
                  },
                },
              },

              'attrs.accessNodeProcessId': {
                type: 'string',
                title: i18n.t('packages_dag_nodes_database_suoshuage'),
                'x-decorator': 'FormItem',
                'x-decorator-props': {
                  feedbackLayout: 'none',
                },
                'x-component': 'PreviewText.Input',
                'x-component-props': {
                  content: `{{$agentMap[$self.value] ? $values.attrs.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' ? \`\${$agentMap[$self.value].accessNodeName} (\${$agentMap[$self.value].processId})\` : \`\${$agentMap[$self.value].hostName}（\${$agentMap[$self.value].ip}）\` : "-"}}`,
                },
                'x-reactions': {
                  fulfill: {
                    state: {
                      display: '{{!$self.value ? "hidden":"visible"}}',
                    },
                  },
                },
              },

              sourceConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{(!$deps[0].length && $values.attrs.connectionType && $values.attrs.connectionType.includes("source")) ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  div1: {
                    type: 'void',
                    'x-component': 'div',
                    properties: {
                      migrateTableSelectType: {
                        title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
                        type: 'string',
                        default: 'custom',
                        'x-decorator': 'SchemaFormItem',
                        'x-decorator-props': {
                          type: 'connection',
                          asterisk: true,
                          feedbackLayout: 'none',
                          connectionId: '{{$values.connectionId}}',
                          title: i18n.t(
                            'packages_dag_nodes_database_xuanzebiao',
                          ),
                          target: '',
                        },
                        'x-component': 'Radio.Group',
                        'x-reactions': {
                          fulfill: {
                            schema: {
                              'x-decorator-props.target': `{{$self.value==='expression'?'tableListCard':'tableNames'}}`,
                            },
                          },
                        },
                        enum: [
                          {
                            label: i18n.t(
                              'packages_dag_nodes_database_anbiaomingxuanze',
                            ),
                            value: 'custom',
                          },
                          {
                            label: i18n.t(
                              'packages_dag_nodes_database_anzhengzebiaoda',
                            ),
                            value: 'expression',
                          },
                        ],
                      },
                    },
                  },

                  warp: {
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle',
                      class: 'w-100',
                    },
                    properties: {
                      noPrimaryKeyTableSelectType: {
                        type: 'string',
                        title: i18n.t(
                          'packages_dag_nodes_database_biaoxianshi',
                        ),
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          class: 'flex-1',
                        },
                        'x-component': 'Select',
                        default: 'HasKeys',
                        enum: [
                          {
                            label: i18n.t('public_select_option_all'),
                            value: 'All',
                          },
                          {
                            label: i18n.t(
                              'packages_dag_nodes_database_jinyouzhujianbiao',
                            ),
                            value: 'HasKeys',
                          },
                          {
                            label: i18n.t('packages_dag_only_include_pk'),
                            value: 'OnlyPrimaryKey',
                          },
                          {
                            label: i18n.t('packages_dag_only_include_uk'),
                            value: 'OnlyUniqueIndex',
                          },
                          {
                            label: i18n.t(
                              'packages_dag_nodes_database_jinwuzhujianbiao',
                            ),
                            value: 'NoKeys',
                          },
                        ],
                      },
                      syncSourcePartitionTableEnable: {
                        title: i18n.t(
                          'packages_dag_syncSourcePartitionTableEnable',
                        ),
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          class: 'flex-1',
                          tooltip: i18n.t(
                            'packages_dag_syncSourcePartitionTableEnable_tip',
                          ),
                        },
                        'x-component': 'Switch',
                        'x-reactions': {
                          fulfill: {
                            state: {
                              visible:
                                '{{$values.attrs.capabilities.some(item => item.id==="source_support_partition")}}',
                            },
                          },
                        },
                      },
                    },
                  },

                  selectAlert: {
                    type: 'void',
                    'x-component': 'Alert',
                    'x-component-props': {
                      class: 'mb-2 lh-base',
                      title: i18n.t('packages_dag_select_HasKeys_alert'),
                      type: 'warning',
                      showIcon: true,
                      closable: false,
                    },
                    'x-reactions': {
                      dependencies: ['.noPrimaryKeyTableSelectType'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === "HasKeys"}}',
                        },
                      },
                    },
                  },

                  div2: {
                    type: 'void',
                    'x-component': 'div',
                    properties: {
                      tableNames: {
                        type: 'array',
                        default: [],
                        'x-component': 'TableSelector',
                        'x-component-props': {
                          class: 'my-4',
                          connectionId: '{{$values.connectionId}}',
                          syncPartitionTableEnable:
                            '{{$values.syncSourcePartitionTableEnable}}',
                          hasPartition: `{{$values.attrs.capabilities.some(item => item.id==="source_support_partition")}}`,
                          style: {
                            height: 'unset',
                            minHeight: 0,
                            maxHeight: 'calc((100vh - 120px) * 0.618)',
                          },
                          hideReload: true,
                          filterType: `{{ $values.noPrimaryKeyTableSelectType }}`,
                        },
                        'x-reactions': {
                          dependencies: ['migrateTableSelectType'],
                          fulfill: {
                            state: {
                              display:
                                '{{$deps[0] === "custom" ? "visible":"hidden"}}',
                            },
                            schema: {
                              required: '{{$deps[0] === "custom"}}',
                            },
                          },
                        },
                      },
                      tableExpression: {
                        type: 'string',
                        default: '.*',
                        required: true,
                        description: i18n.t(
                          'packages_dag_nodes_database_zhengzebiaodashi',
                        ),
                        'x-decorator': 'FormItem',
                        'x-component': 'Input',
                        'x-component-props': {
                          rows: 1,
                        },
                        'x-reactions': {
                          dependencies: ['migrateTableSelectType'],
                          fulfill: {
                            state: {
                              display:
                                '{{$deps[0] === "expression" ? "visible":"hidden"}}',
                            },
                          },
                        },
                      },
                      tableListCard: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-component': 'TableListCard',
                        'x-component-props': {
                          rows: 1,
                          title: i18n.t(
                            'packages_dag_nodes_database_pipeidaodebiao',
                          ),
                          connectionId: '{{$values.connectionId}}',
                          params:
                            '{{ {regex: $values.tableExpression,limit:0, syncPartitionTableEnable: $values.syncSourcePartitionTableEnable} }}',
                          filterType: `{{ $values.noPrimaryKeyTableSelectType }}`,
                          hasPartition: `{{$values.attrs.capabilities.some(item => item.id==="source_support_partition")}}`,
                        },
                        'x-reactions': {
                          dependencies: ['migrateTableSelectType'],
                          fulfill: {
                            state: {
                              display:
                                '{{$deps[0] === "expression" ? "visible":"hidden"}}',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },

              targetConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{$deps[0].length > 0 || $values.attrs.connectionType === "target" ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  fieldMapping: {
                    type: 'void',
                    'x-component': 'fieldInference',
                  },
                  uniqueIndexEnable: {
                    type: 'boolean',
                    title: i18n.t('packages_dag_migration_uniqueIndexEnable'),
                    default: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                      tooltip: i18n.t('packages_dag_uniqueIndexEnable_tip'),
                    },
                    'x-component': 'Switch',
                  },
                  updateConditionFieldsAlert: {
                    type: 'void',
                    'x-component': 'Alert',
                    'x-component-props': {
                      class: 'mb-2 lh-base',
                      title: i18n.t('packages_dag_updateConditionFields_alert'),
                      type: 'warning',
                      showIcon: true,
                      closable: false,
                    },
                  },
                  existDataProcessMode: {
                    type: 'string',
                    title: i18n.t('packages_dag_nodes_database_chongfuchulice'),
                    default: 'keepData',
                    enum: [
                      {
                        label: i18n.t(
                          'packages_dag_nodes_database_baochimubiaoduan',
                        ),
                        value: 'keepData',
                      },
                      {
                        label: i18n.t(
                          'packages_dag_nodes_database_qingchumubiaoduan',
                        ),
                        value: 'dropTable',
                        disabled: true,
                      },
                      {
                        label: i18n.t(
                          'packages_dag_nodes_targetdatabase_baochimubiaoduan',
                        ),
                        value: 'removeData',
                      },
                    ],
                    'x-decorator': 'FormItem',
                    'x-component': 'Select',
                    'x-reactions': {
                      fulfill: {
                        run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $settings.type === "cdc"}}',
                        state: {
                          description: `{{$settings.type === "cdc" ? '${i18n.t(
                            'packages_dag_nodes_database_setting_cdc_changjing_desc',
                          )}':''}}`,
                        },
                        schema: {
                          // ⚠️👇表达式依赖enum的顺序
                          'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`,
                        },
                      },
                    },
                  },
                  initialConcurrentSpace: {
                    title: i18n.t(
                      'packages_dag_nodes_database_quanliangduoxiancheng',
                    ),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle',
                    },
                    properties: {
                      initialConcurrent: {
                        type: 'boolean',
                        'x-component': 'Switch',
                        'x-reactions': {
                          target: '.initialConcurrentWriteNum',
                          fulfill: {
                            state: {
                              visible: '{{!!$self.value}}',
                            },
                          },
                        },
                      },
                      initialConcurrentWriteNum: {
                        type: 'number',
                        default: 8,
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0,
                        },
                      },
                    },
                  },
                  cdcConcurrentSpace: {
                    type: 'void',
                    title: i18n.t(
                      'packages_dag_nodes_database_zengliangduoxiancheng',
                    ),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle',
                    },
                    properties: {
                      cdcConcurrent: {
                        type: 'boolean',
                        'x-component': 'Switch',
                        'x-reactions': {
                          target: '.cdcConcurrentWriteNum',
                          fulfill: {
                            state: {
                              visible: '{{!!$self.value}}',
                            },
                          },
                        },
                      },
                      cdcConcurrentWriteNum: {
                        type: 'number',
                        default: 4,
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 0,
                        },
                      },
                    },
                  },
                  writeBachSpace: {
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      size: 'middle',
                    },
                    properties: {
                      writeBatchSize: {
                        title: i18n.t(
                          'packages_dag_nodes_database_piliangxierutiao',
                        ), //增量批次读取条数
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-decorator-props': {
                          tooltip: i18n.t(
                            'packages_dag_nodes_database_quanliangmeipici2',
                          ),
                        },
                        'x-component-props': {
                          min: 1,
                          max: 10000000,
                        },
                        default: 100,
                      },
                      writeBatchWaitMs: {
                        title: i18n.t(
                          'packages_dag_nodes_database_xierumeipizui',
                        ), //增量批次读取条数
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          min: 1,
                        },
                        default: 500,
                      },
                    },
                  },
                  'attrs.capabilities': {
                    type: 'array',
                    'x-display': 'hidden',
                    'x-reactions': '{{useDmlPolicy}}',
                  },
                },
              },
            },
          },
          advancedTab: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_advanced_settings'),
            },
            properties: {
              sourceCollapse: {
                type: 'void',
                'x-component': 'FormCollapse',
                'x-component-props': {
                  class: 'advanced-collapse',
                  expandIconPosition: 'left',
                },
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{(!$deps[0].length && $values.attrs.connectionType && $values.attrs.connectionType.includes("source")) ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  tab1: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_ddl'),
                    },
                    properties: {
                      ddlConfiguration: {
                        type: 'string',
                        default: 'FILTER',
                        enum: [
                          {
                            label: i18n.t('packages_dag_ddl_stopped_on_error'),
                            value: 'ERROR',
                          },
                          {
                            label: i18n.t('packages_dag_ddl_auto_ignore'),
                            value: 'FILTER',
                          },
                          {
                            label: i18n.t('packages_dag_ddl_sync_events'),
                            value: 'SYNCHRONIZATION',
                          },
                        ],
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        'x-reactions': [
                          {
                            target: 'disabledEvents',
                            fulfill: {
                              state: {
                                visible:
                                  '{{$self.value === "SYNCHRONIZATION"}}',
                              },
                            },
                          },
                          {
                            when: `{{!$values.attrs.capabilities.filter(item => item.type === 10).length}}`,
                            fulfill: {
                              state: {
                                disabled: true,
                                description: `{{$values.databaseType + ' ${i18n.t(
                                  'packages_dag_nodes_database_value_zanbuzhiciddl',
                                )}'}}`,
                              },
                            },
                          },
                        ],
                      },
                      disabledEvents: {
                        type: 'array',
                        'x-component': 'DdlEventCheckbox',
                      },
                      ignoredDDLRules: {
                        title: i18n.t('packages_dag_ddl_ignore_rules'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_ddl_ignore_rules_tip'),
                        },
                        'x-component': 'Input',
                        'x-component-props': {
                          placeholder: i18n.t(
                            'packages_dag_ddl_ignore_rules_placeholder',
                          ),
                        },
                        'x-reactions': {
                          dependencies: ['ddlConfiguration'],
                          fulfill: {
                            state: {
                              visible: '{{$deps[0] === "ERROR"}}',
                            },
                          },
                        },
                      },
                    },
                  },
                  tab2: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_data_read'),
                    },
                    properties: {
                      sizeSpace: {
                        type: 'void',
                        'x-component': 'Space',
                        'x-component-props': {
                          size: 'middle',
                        },
                        properties: {
                          readBatchSize: {
                            title: i18n.t(
                              'packages_dag_nodes_database_piliangduqutiao',
                            ), //全量批次读取条数
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-decorator-props': {
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_quanliangmeipici',
                              ),
                            },
                            'x-component-props': {
                              min: 1,
                              max: 100000,
                            },
                            default: 100,
                          },
                          increaseReadSize: {
                            title: i18n.t(
                              'packages_dag_nodes_database_zengliangmeipici',
                            ), //增量批次读取条数
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1,
                            },
                            default: 1,
                          },
                        },
                      },

                      enableConcurrentReadSpace: {
                        title: i18n.t('packages_dag_enableConcurrentRead'),
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t(
                            'packages_dag_enableConcurrentRead_tips',
                          ),
                        },
                        type: 'void',
                        'x-component': 'Space',
                        'x-component-props': {
                          size: 'middle',
                        },
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display:
                                '{{$settings.type === "cdc" ? "hidden":"visible"}}',
                            },
                          },
                        },
                        properties: {
                          enableConcurrentRead: {
                            type: 'boolean',
                            'x-component': 'Switch',
                            'x-reactions': {
                              target: '.concurrentReadThreadNumber',
                              fulfill: {
                                state: {
                                  visible: '{{!!$self.value}}',
                                },
                              },
                            },
                          },
                          concurrentReadThreadNumber: {
                            title: i18n.t(
                              'packages_dag_concurrentReadThreadNumber',
                            ),
                            type: 'number',
                            default: 2,
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              layout: 'horizontal',
                              feedbackLayout: 'none',
                            },
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                  tab3: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_breakpoint_resume'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display:
                            '{{hasFeature("resume") && $values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? "visible":"hidden"}}',
                        },
                      },
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
                              title: i18n.t(
                                'packages_dag_nodes_database_quanliangduandianxu',
                              ),
                              iconSize: 30,
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_quanliangduandianshi',
                              ),
                            },
                            'x-component': 'Switch',
                            'x-reactions': {
                              fulfill: {
                                state: {
                                  display:
                                    '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                          splitType: {
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpianfangshi',
                            ),
                            type: 'number',
                            default: 10,
                            enum: [
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_jiyumin',
                                ),
                                value: 10,
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_jiyucou',
                                ),
                                value: 1,
                              },
                            ],
                            'x-decorator': 'FormItem',
                            'x-component': 'Select',
                            'x-reactions': {
                              dependencies: ['.enable'],
                              fulfill: {
                                run: `{{ $values.splitTyp !== 10 && $values.attrs.capabilities.some(t => t.id === 'count_by_partition_filter_function') && $self.setValue(1) }}`,
                                state: {
                                  display: '{{$deps[0] ? "visible" :"hidden"}}',
                                },
                                schema: {
                                  'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.some(item => item.id ==='count_by_partition_filter_function') && options.push($self.dataSource[1]),options}}`,
                                },
                              },
                            },
                          },
                          maxRecordInPartition: {
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpiandaxiao',
                            ),
                            type: 'number',
                            default: 200000,
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            'x-reactions': {
                              dependencies: ['.enable', '.splitType'],
                              fulfill: {
                                state: {
                                  display:
                                    '{{$deps[0] && $deps[1] === 1 ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                          minMaxSplitPieces: {
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpianshuliang',
                            ),
                            type: 'number',
                            default: 100,
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            'x-reactions': {
                              dependencies: ['.enable', '.splitType'],
                              fulfill: {
                                state: {
                                  display:
                                    '{{$deps[0] && $deps[1] === 10 ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                          partitionThreadCount: {
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpianbingfaxian',
                            ),
                            type: 'number',
                            default: 8,
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            'x-reactions': {
                              dependencies: ['.enable'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0] ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                          partitionBatchCount: {
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpianyipidu',
                            ),
                            type: 'number',
                            default: 3000,
                            'x-decorator': 'FormItem',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 0,
                            },
                            'x-reactions': {
                              dependencies: ['.enable'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0] ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                          hasKVStorage: {
                            type: 'boolean',
                            title: i18n.t(
                              'packages_dag_nodes_database_fenpianpilianghezengliang',
                            ),
                            default: true,
                            'x-component': 'Switch',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_guanbicigongnenghoufenpian',
                              ),
                            },
                            'x-reactions': {
                              dependencies: ['.enable'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0] ? "visible" :"hidden"}}',
                                },
                              },
                            },
                          },
                        },
                        'x-reactions': {
                          fulfill: {
                            state: {
                              display:
                                '{{$settings.type === "cdc" ? "hidden":"visible"}}',
                            },
                          },
                        },
                      },
                    },
                  },
                  tab6: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_datasource'),
                    },
                    'x-reactions': {
                      fulfill: {
                        schema: {
                          'x-component-props.className':
                            '{{$hasPdkConfig($values.attrs.pdkHash) && $self.query("nodeConfig.*").map(field => field.visible).includes(true) ? "":"none"}}',
                        },
                      },
                    },
                    properties: {
                      nodeConfig: {
                        type: 'object',
                      },
                    },
                  },
                },
              },
              targetCollapse: {
                type: 'void',
                'x-component': 'FormCollapse',
                'x-component-props': {
                  class: 'advanced-collapse',
                  expandIconPosition: 'left',
                },
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{$deps[0].length > 0 || $values.attrs.connectionType === "target" ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  tab1: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_nodes_database_ddLshijian'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display: `{{findParentNodes($values.id).filter(parent => (parent.type === 'database' || parent.type === 'table') && parent.ddlConfiguration === 'SYNCHRONIZATION' ).length > 0 ? "visible":"hidden"}}`,
                        },
                      },
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
                          findParentNodes: '{{findParentNodes}}',
                        },
                      },
                    },
                  },
                  tab2: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_data_write'),
                    },
                    properties: {
                      writeStrategyObject: {
                        // title: '数据写入模式',
                        type: 'void',
                        'x-component-props': {
                          layout: 'horizontal',
                          colon: false,
                          feedbackLayout: 'none',
                        },
                        properties: {
                          writeStrategy: {
                            title: i18n.t(
                              'packages_dag_nodes_mergetable_shujuxierumo',
                            ),
                            type: 'string',
                            default: 'updateOrInsert',
                            'x-component': 'Radio.Group',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_tongjizhuijiaxie2',
                              ),
                            },
                            enum: [
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_anshijianleixing',
                                ),
                                value: 'updateOrInsert',
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_tongjizhuijiaxie',
                                ),
                                value: 'appendWrite',
                              },
                            ],
                          },
                        },
                      },
                      dmlPolicy: {
                        title: i18n.t(
                          'packages_dag_nodes_database_shujuxieruce',
                        ),
                        type: 'object',
                        'x-decorator': 'FormItem',
                        'x-component': 'FormLayout',
                        'x-component-props': {
                          layout: 'horizontal',
                          colon: false,
                          feedbackLayout: 'none',
                        },
                        properties: {
                          insertPolicy: {
                            type: 'string',
                            'x-component': 'Select',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'font-color-dark mb-2',
                              wrapperWidth: 300,
                              addonBefore: i18n.t(
                                'packages_dag_nodes_database_charushijian',
                              ),
                            },
                            default: 'update_on_exists',
                            enum: [
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_targetdatabase_mubiaocunzaishi',
                                ),
                                value: 'update_on_exists',
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_mubiaocunzaishi',
                                ),
                                value: 'ignore_on_exists',
                              },
                              {
                                label: i18n.t('packages_dag_just_insert'),
                                value: 'just_insert',
                              },
                            ],
                          },
                          updatePolicy: {
                            type: 'string',
                            'x-component': 'Select',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'font-color-dark mb-2',
                              wrapperWidth: 300,
                              addonBefore: i18n.t(
                                'packages_dag_nodes_database_gengxinshijian',
                              ),
                            },
                            default: 'ignore_on_nonexists',
                            enum: [
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_bucunzaishidiu',
                                ),
                                value: 'ignore_on_nonexists',
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_bucunzaishicha',
                                ),
                                value: 'insert_on_nonexists',
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_bucunzaishidayinrizhi',
                                ),
                                value: 'log_on_nonexists',
                              },
                            ],
                          },
                          deletePolicy: {
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'font-color-dark',
                              wrapperWidth: 300,
                              addonBefore: i18n.t(
                                'packages_dag_nodes_database_shanchushijian',
                              ),
                            },
                            'x-component': 'Select',
                            'x-content': i18n.t(
                              'packages_dag_nodes_database_bucunzaishidiu',
                            ),
                            'x-component-props': {
                              type: 'info',
                              effect: 'light',
                            },
                            default: 'ignore_on_nonexists',
                            enum: [
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_bucunzaishidiu',
                                ),
                                value: 'ignore_on_nonexists',
                              },
                              {
                                label: i18n.t(
                                  'packages_dag_nodes_database_bucunzaishidayinrizhi',
                                ),
                                value: 'log_on_nonexists',
                              },
                            ],
                          },
                        },
                        'x-reactions': {
                          dependencies: ['writeStrategy'],
                          fulfill: {
                            state: {
                              display:
                                '{{$deps[0] === "appendWrite" ? "hidden":"visible"}}',
                            },
                          },
                        },
                      },
                      syncIndexEnable: {
                        title: i18n.t('packages_dag_syncIndex'),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal',
                        },
                        'x-component': 'Switch',
                        'x-component-props': {
                          confirm: {
                            title: i18n.t('packages_dag_syncIndexTip'),
                          },
                        },
                        'x-reactions': {
                          fulfill: {
                            state: {
                              visible:
                                '{{hasFeature("syncIndex") && $settings.type !== "cdc" && $values.attrs.capabilities.filter(item => ["get_table_info_function", "create_index_function", "query_indexes_function"].includes(item.id)).length === 3}}',
                              description: `{{$self.value ? '${i18n.t('packages_dag_syncIndex_desc')}' : ''}}`,
                            },
                          },
                        },
                      },
                      syncTargetPartitionTableEnable: {
                        title: i18n.t('packages_dag_syncPartitionTableEnable'),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          layout: 'horizontal',
                        },
                        'x-component': 'Switch',
                        'x-reactions': {
                          fulfill: {
                            state: {
                              visible:
                                '{{hasFeature("syncPartitionTable") && $values.attrs.capabilities.some(item => item.id==="target_support_partition")}}',
                            },
                          },
                        },
                      },
                      noPkSyncMode: {
                        type: 'string',
                        title: i18n.t('packages_dag_noPkSyncMode'),
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        default: 'ALL_COLUMNS', // 兼容老任务
                        enum: [
                          {
                            label: i18n.t('packages_dag_noPkSyncMode_ADD_HASH'),
                            value: 'ADD_HASH',
                          },
                          {
                            label: i18n.t(
                              'packages_dag_noPkSyncMode_ALL_COLUMNS',
                            ),
                            value: 'ALL_COLUMNS',
                          },
                        ],
                        'x-visible': '{{hasFeature("noPrimaryKey")}}',
                      },
                    },
                  },
                  tab3: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_datasource'),
                    },
                    'x-reactions': {
                      fulfill: {
                        schema: {
                          'x-component-props.className':
                            '{{$hasPdkConfig($values.attrs.pdkHash) && $self.query("nodeConfig.*").map(field => field.visible).includes(true) ? "":"none"}}',
                        },
                      },
                    },
                    properties: {
                      nodeConfig: {
                        type: 'object',
                      },
                    },
                  },
                },
              },
            },
          },
          tab2: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_data_schema'),
            },
            properties: {
              schemaPanel: {
                type: 'void',
                'x-component': 'SchemaPanel',
                'x-component-props': {
                  class: 'mx-n4',
                  formTab: '{{formTab}}',
                },
              },
            },
          },
          alarmTab: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi'),
              locked: import.meta.env.VUE_APP_MODE === 'community',
            },
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
                    unit: 'SECOND',
                  },
                ],
              },
              alarmRules: {
                type: 'array',
                default: [
                  {
                    key: 'DATANODE_AVERAGE_HANDLE_CONSUME',
                    point: 12,
                    equalsFlag: 1,
                    ms: 5000,
                  },
                ],
              },
              'alarmSettings.0': {
                type: 'object',
                title: i18n.t(
                  'packages_business_setting_alarmnotification_dangshujuyuanjie',
                ),
                'x-decorator': 'FormItem',
                'x-component': 'div',
                'x-component-props': {
                  class: 'flex align-center',
                },
                properties: {
                  open: {
                    type: 'boolean',
                    default: true,
                    'x-editable': true,
                    'x-component': 'Switch',
                    'x-component-props': {
                      onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`,
                    },
                    'x-reactions': {
                      target: 'alarmRules.0.*',
                      fulfill: {
                        state: {
                          disabled: `{{!$self.value}}`,
                        },
                      },
                    },
                  },
                  divider: {
                    type: 'void',
                    'x-component': 'Divider',
                    'x-component-props': {
                      direction: 'vertical',
                      class: 'mx-4',
                    },
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                        },
                      },
                    },
                  },
                  notify: {
                    type: 'array',
                    'x-component': 'Checkbox.Group',
                    'x-component-props': {
                      onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
                    },
                    default: ['SYSTEM', 'EMAIL'],
                    enum: '{{$alarmChannels}}',
                    'x-editable': true,
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                        },
                      },
                    },
                  },
                },
              },
              'alarmRules.0': {
                type: 'object',
                'x-component': 'Space',
                'x-reactions': {
                  dependencies: ['alarmSettings.0.open'],
                  fulfill: {
                    state: {
                      display: `{{$deps[0] ? 'visible' : 'hidden'}}`,
                    },
                  },
                },
                properties: {
                  point: {
                    type: 'number',
                    'x-reactions': [
                      {
                        dependencies: ['._point'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12)}}`,
                          },
                        },
                      },
                      {
                        target: 'alarmRules.0._point',
                        effects: ['onFieldInit'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($self.value / 12) < 1 ? 1 : Math.ceil($self.value / 12)}}`,
                          },
                        },
                      },
                    ],
                  },
                  _point: {
                    title: i18n.t('packages_dag_migration_alarmpanel_lianxu'),
                    type: 'number',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                      precision: 0,
                      style: {
                        width: '100px',
                      },
                    },
                  },
                  equalsFlag: {
                    title: i18n.t('public_time_m'),
                    type: 'number',
                    default: 1,
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'Select',
                    'x-component-props': {
                      style: {
                        width: '70px',
                      },
                    },
                    enum: [
                      {
                        label: '<=',
                        value: -1,
                      },
                      {
                        label: '>=',
                        value: 1,
                      },
                    ],
                  },
                  ms: {
                    type: 'number',
                    'x-reactions': [
                      {
                        dependencies: ['._ms'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000)}}`,
                          },
                        },
                      },
                      {
                        target: 'alarmRules.0._ms',
                        effects: ['onFieldInit'],
                        fulfill: {
                          state: {
                            value: `{{Math.ceil($self.value / 1000) < 1 ? 1 : Math.ceil($self.value / 1000)}}`,
                          },
                        },
                      },
                    ],
                  },
                  _ms: {
                    title: '',
                    type: 'number',
                    'x-editable': true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                    'x-component': 'InputNumber',
                    'x-component-props': {
                      min: 1,
                      precision: 0,
                      style: {
                        width: '100px',
                      },
                    },
                  },
                  unit: {
                    title: 's',
                    type: 'void',
                    default: 0,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      layout: 'horizontal',
                    },
                  },
                },
              },
            },
          },
        },
      },

      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden',
      },
    },
  }

  allowTarget(target, source) {
    // 不再支持既是源又是目标的节点
    return (
      !source.$inputs?.length &&
      (target.type !== 'database' || !target.$outputs?.length)
    )
  }

  allowSource(source, target) {
    // 不再支持既是源又是目标的节点
    return !target.$outputs?.length
  }
}
