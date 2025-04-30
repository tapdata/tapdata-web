import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

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
              $target && $target.visible && $target.validate()
            }, 0)`,
          },
        },
      },
      $outputs: {
        type: 'array',
        'x-display': 'hidden',
      },
      type: {
        type: 'string',
        'x-display': 'hidden',
      },
      databaseType: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions': {
          fulfill: {
            run: `{{ ["CSV","EXCEL","JSON","XML"].includes($self.value) && !$values.tableName && ($values.tableName = 'tapdata') }}`,
          },
        },
      },
      connectionId: {
        type: 'string',
        'x-display': 'hidden',
        'x-reactions':
          '{{useAsyncDataSourceByConfig({service: useSyncConnection})}}',
      },
      tabs: {
        type: 'void',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          class: 'config-tabs-decorator',
        },
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

              tableNameSpace: {
                type: 'void',
                'x-component': 'Space',
                'x-component-props': {
                  align: 'start',
                  size: 'middle',
                  class: 'w-100',
                },
                'x-reactions': {
                  dependencies: ['databaseType'],
                  fulfill: {
                    state: {
                      display:
                        '{{ !["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}',
                    },
                  },
                },
                'x-reactions': {
                  dependencies: ['databaseType'],
                  fulfill: {
                    state: {
                      display:
                        '{{ !["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  tableNameWrap: {
                    type: 'void',
                    title: i18n.t('packages_dag_dag_table'),
                    'x-decorator': 'SchemaFormItem',
                    'x-decorator-props': {
                      asterisk: true,
                      feedbackLayout: 'none',
                      connectionId: '{{$values.connectionId}}',
                      title: i18n.t('packages_dag_dag_table'),
                      target: 'tableName',
                      class: 'flex-1',
                    },
                    'x-component': 'FormFlex',
                    'x-component-props': {
                      gap: 8,
                      align: 'start',
                    },
                    'x-reactions': {
                      dependencies: ['databaseType'],
                      fulfill: {
                        state: {
                          display:
                            '{{ !["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}',
                        },
                      },
                    },
                    properties: {
                      tableName: {
                        type: 'string',
                        required: true,
                        'x-validator': [
                          {
                            required: true,
                            message: i18n.t(
                              'packages_dag_nodes_table_qingxuanzebiao',
                            ),
                          },
                        ],
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          style: {
                            flex: 1,
                          },
                        },
                        'x-component': 'TableSelect',
                        'x-component-props': {
                          method: '{{loadTable}}',
                          connectionId: '{{$values.connectionId}}',
                          itemType: 'string',
                          itemQuery: 'value',
                        },
                        'x-reactions': [
                          {
                            target: 'name',
                            effects: ['onFieldInputValueChange'],
                            fulfill: {
                              run: `{{ $self.value && !$values.attrs.hasNameEdited && ($target.value = $self.value) }}`,
                            },
                          },
                          {
                            dependencies: ['$inputs'],
                            fulfill: {
                              schema: {
                                // title: '{{console.log("tableName", $deps[0]),$deps[0] ? "表(可输入创建新表)" : "表"}}',
                                'x-component-props.allowCreate':
                                  '{{$deps[0].length>0}}',
                                // 'x-decorator-props.feedbackText': '{{$deps[0] && "可输入创建新表"}}'
                              },
                            },
                          },
                        ],
                      },
                      clipboardButton: {
                        type: 'void',
                        'x-component': 'ClipboardButton',
                        'x-component-props': {
                          tooltip: i18n.t(
                            'packages_dag_nodes_table_fuzhibiaoming',
                          ),
                          finishTooltip: i18n.t(
                            'packages_dag_nodes_table_yifuzhi',
                          ),
                        },
                        'x-reactions': {
                          dependencies: ['tableName'],
                          fulfill: {
                            schema: {
                              'x-component-props.content': '{{$deps[0]}}',
                            },
                          },
                        },
                      },
                    },
                  },

                  needDynamicTableName: {
                    type: 'boolean',
                    title: i18n.t('packages_dag_dynamic_date_suffix'),
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      tooltip: i18n.t('packages_dag_dynamic_date_suffix_tip'),
                    },
                    'x-component': 'Switch',
                    'x-reactions': [
                      {
                        dependencies: ['$inputs'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0].length > 0 ? "visible":"hidden"}}',
                          },
                        },
                      },
                    ],
                  },
                },
              },
              // 指定agent
              'attrs.accessNodeProcessId': {
                type: 'string',
                title: i18n.t('packages_dag_nodes_database_suoshuage'),
                'x-decorator': 'FormItem',
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

              targetNodeConfig: {
                type: 'void',
                'x-component': 'FormContent',
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display: '{{$deps[0].length > 0 ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  updateConditionFieldsSpace: {
                    type: 'void',
                    'x-component': 'Space',
                    'x-component-props': {
                      align: 'start',
                      size: 'middle',
                      class: 'w-100',
                    },
                    properties: {
                      updateConditionFields: {
                        title: i18n.t(
                          'packages_dag_nodes_table_gengxintiaojianzi',
                        ),
                        type: 'array',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          class: 'flex-1',
                          asterisk: true,
                          tooltip: i18n.t('packages_dag_update_conditions_tip'),
                        },
                        'x-component': 'FieldSelect',
                        'x-component-props': {
                          allowCreate: true,
                          multiple: true,
                          filterable: true,
                          onChange: `{{(val) => {
                         // 只要用户手动选择了字段,就不会自动填充
                        $values.attrs.hasCreated = true
                      }}}`,
                        },
                        'x-reactions': [
                          {
                            dependencies: [
                              'schemaFields#dataSource',
                              'schemaFields#loading',
                            ],
                            fulfill: {
                              state: {
                                dataSource: '{{$deps[0]}}',
                                loading: '{{$deps[1]}}',
                              },
                            },
                          },
                          // `{{useAsyncDataSourceByConfig({service: loadNodeFieldOptions, withoutField: true}, $values.id)}}`,
                          {
                            effects: ['onFieldMount'],
                            fulfill: {
                              run: '$self.visible && $self.validate()',
                            },
                          },
                          {
                            effects: ['onFieldInputValueChange'],
                            fulfill: {
                              run: '$self.value && $self.value.length && $form.clearErrors("updateConditionFields")',
                            },
                          },
                          {
                            effects: ['onFieldInit'],
                            fulfill: {
                              run: `let parents = findParentNodes(($values.id));$self.description = parents.some(node => node.databaseType==='MongoDB') ? '${i18n.t(
                                'packages_dag_nodes_table_isDaa_ruguoyuanweimongodb',
                              )}':''`,
                            },
                          },
                        ],
                        'x-validator': {
                          triggerType: 'onBlur',
                          validator: `{{validateUpdateConditionFields}}`,
                        },
                      },

                      uniqueIndexEnable: {
                        type: 'boolean',
                        title: i18n.t('packages_dag_uniqueIndexEnable'),
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t('packages_dag_uniqueIndexEnable_tip'),
                        },
                        'x-component': 'Switch',
                      },
                    },
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
                    title: i18n.t('packages_dag_nodes_database_chongfuchulice'),
                    type: 'string',
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
                    'x-decorator-props': {
                      wrapperWidth: 300,
                    },
                    'x-component': 'Select',
                    'x-reactions': {
                      fulfill: {
                        run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $settings.type === "cdc"}}',
                        state: {
                          description: `{{$settings.type === "cdc" ? '${i18n.t(
                            'packages_dag_nodes_database_setting_cdc_changjing_desc',
                          )}':$self.value === 'dropTable' ? '${i18n.t('packages_dag_existDataProcessMode_desc')}':''}}`,
                        },
                        schema: {
                          // 根据capabilities列表如果不存在{"id" : "clear_table_function"}属性，表示不支持“运行前删除已存在数据”，⚠️👇表达式依赖enum的顺序
                          'x-component-props.options': `{{options=[$self.dataSource[0]],$values.attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`,
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
                        ),
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
                        'x-decorator-props': {
                          tooltip: i18n.t(
                            'packages_dag_nodes_database_xierumeipizui_tips',
                          ),
                        },
                        default: 500,
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
                  concurrentWritePartitionMap: {
                    type: 'object',
                    title: i18n.t(
                      'packages_dag_nodes_database_duoxianchengfenqujian',
                    ),
                    'x-decorator': 'FormItem',
                    'x-component': 'TableFieldSelect',
                    'x-component-props': {
                      nodeId: `{{ $values.id }}`,
                      tableName: `{{ $values.tableName }}`,
                      defaultFields: `{{ $values.updateConditionFields }}`,
                      refresh: `{{ 'refresh' + $values.initialConcurrent + $values.cdcConcurrent }}`,
                    },
                    'x-reactions': [
                      {
                        dependencies: ['.initialConcurrent', '.cdcConcurrent'],
                        fulfill: {
                          state: {
                            display:
                              '{{($deps[0] || $deps[1]) ? "visible":"hidden"}}',
                          },
                        },
                      },
                    ],
                    'x-validator': {
                      triggerType: 'onBlur',
                      validator: `{{validateConcurrentWritePartitionMap}}`,
                    },
                  },
                },
              },

              fileNodeConfig: {
                type: 'void',
                'x-reactions': {
                  dependencies: ['databaseType'],
                  fulfill: {
                    state: {
                      display:
                        '{{ ["CSV","EXCEL","JSON","XML"].includes($deps[0]) ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  nodeConfig: {
                    type: 'object',
                  },

                  loadSchemaTree: {
                    type: 'void',
                    title: '',
                    'x-decorator': 'FormItem',
                    'x-component': 'loadSchemaTree',
                    'x-component-props': {
                      tableNameField: 'tableName',
                    },
                    'x-reactions': {
                      dependencies: ['$inputs'],
                      fulfill: {
                        state: {
                          display:
                            '{{(!$deps[0].length || ($values.attrs.connectionType && $values.attrs.connectionType.includes("source"))) ? "visible":"hidden"}}',
                        },
                      },
                    },
                  },
                },
              },

              schemaFields: {
                type: 'string',
                'x-component': 'SchemaPreview',
                'x-component-props': {
                  '@update-table-name': `{{(name) => {
                    if (name && $values.tableName && $values.tableName !== name) {
                      $form.setValuesIn('tableName', name)
                    }
                  }}}`,
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
                },
                'x-reactions': {
                  dependencies: ['$inputs'],
                  fulfill: {
                    state: {
                      display:
                        '{{(!$deps[0].length && (!$values.attrs.connectionType || $values.attrs.connectionType.includes("source"))) ? "visible":"hidden"}}',
                    },
                  },
                },
                properties: {
                  ddl: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_ddl'),
                    },
                    properties: {
                      ddlConfiguration: {
                        type: 'string',
                        default:
                          '{{$values.enableDDL ? "SYNCHRONIZATION" : "FILTER"}}', // 兼容老数据
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
                        'x-decorator-props': {
                          className: 'extra-prefix-bar',
                        },
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
                            otherwise: {
                              state: {
                                description: `{{$self.value === 'ERROR' ? '${i18n.t(
                                  'packages_dag_feature_agent_version_tips',
                                  { val: '3.5.12' },
                                )} ': ''}}`,
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
                  mode: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_incremental_mode'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          visible: `{{$settings.type !== "initial_sync" && $values.attrs.capabilities.some(item => item.id === 'query_by_advance_filter_function')}}`,
                        },
                      },
                    },
                    properties: {
                      cdcMode: {
                        title: i18n.t(
                          'packages_dag_nodes_table_zengliangtongbufang',
                        ),
                        type: 'string',
                        default: 'logCdc',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t(
                            'packages_dag_nodes_table_tedingziduande',
                          ),
                        },
                        'x-component': 'Radio.Group',
                        enum: [
                          {
                            label: i18n.t('packages_dag_nodes_table_rizhicdc'),
                            value: 'logCdc',
                          },
                          {
                            label: i18n.t('packages_dag_nodes_table_lunxun'),
                            value: 'polling',
                          },
                        ],
                        'x-reactions': [
                          {
                            fulfill: {
                              state: {
                                display: `{{$settings.type !== "initial_sync" && $values.attrs.capabilities.some(item => item.id === 'query_by_advance_filter_function') ? "visible":"hidden"}}`,
                              },
                            },
                          },
                          {
                            target:
                              '*(cdcPollingFields,cdcPollingFieldsDefaultValues,cdcPollingInterval,cdcPollingBatchSize)',
                            fulfill: {
                              state: {
                                display:
                                  '{{$self.value==="polling"?"visible":"hidden"}}',
                              },
                            },
                          },
                        ],
                      },
                      cdcPollingFields: {
                        title: i18n.t(
                          'packages_dag_nodes_table_zhidinglunxunzi',
                        ),
                        type: 'array',
                        required: true,
                        default: [{ field: '', defaultValue: '' }],
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          tooltip: i18n.t(
                            'packages_dag_nodes_cdcPollingFields_tip',
                          ),
                        },
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
                                filterable: true,
                              },
                              'x-reactions': {
                                effects: ['onFieldInputValueChange'],
                              },
                            },
                            defaultValue: {
                              title: i18n.t(
                                'packages_dag_nodes_table_lunxunziduanmo',
                              ),
                              required: true,
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-reactions': {
                                fulfill: {
                                  state: {
                                    visible: `{{$settings.type === "cdc"}}`,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      cdcPollingInterval: {
                        title: i18n.t('packages_dag_nodes_table_lunxunjiangem'),
                        type: 'object',
                        default: 500,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          style: {
                            width: '140px',
                          },
                          min: 500,
                        },
                      },
                      cdcPollingBatchSize: {
                        title: i18n.t('packages_dag_nodes_table_meiciduquhang'),
                        type: 'number',
                        default: 1000,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                        'x-component-props': {
                          style: {
                            width: '140px',
                          },
                          min: 1,
                        },
                      },
                    },
                  },
                  filter: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_data_filter'),
                      tooltip: i18n.t('packages_dag_config_data_filter_tip'),
                    },
                    properties: {
                      enableCustomCommand: {
                        title: i18n.t(
                          'packages_dag_nodes_table_zidingyichaxun',
                        ),
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal',
                          layout: 'horizontal',
                          tooltip: '',
                        },
                        'x-component': 'Switch',
                        'x-reactions': [
                          {
                            fulfill: {
                              state: {
                                visible: `{{$settings.type !== "cdc" && $values.attrs.capabilities.some(item => item.id === "execute_command_function")}}`,
                              },
                            },
                          },
                          {
                            target: 'customCommand',
                            fulfill: {
                              state: {
                                visible: '{{!!$self.value}}',
                              },
                            },
                          },
                          {
                            dependencies: [
                              'isFilter',
                              'readPartitionOptions.enable',
                            ],
                            fulfill: {
                              state: {
                                disabled: `{{$form.disabled || !!$deps[0] || !!$deps[1]}}`,
                                description: `{{!!$deps[1] ? '${i18n.t('packages_dag_nodes_table_depskai2')}':''}}`,
                              },
                            },
                          },
                        ],
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
                              {
                                label: i18n.t('public_query'),
                                value: 'executeQuery',
                              },
                              {
                                label: i18n.t('public_aggregate'),
                                value: 'aggregate',
                              },
                            ],
                            'x-reactions': {
                              fulfill: {
                                state: {
                                  display:
                                    '{{$values.databaseType==="MongoDB"?"visible":"hidden"}}',
                                },
                              },
                            },
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
                                      visible:
                                        '{{$values.databaseType==="MongoDB" && $deps[0]==="executeQuery"}}',
                                    },
                                  },
                                },
                                properties: {
                                  op: {
                                    type: 'string',
                                    default: 'find',
                                  },
                                  collection: {
                                    type: 'string',
                                    'x-reactions': {
                                      fulfill: {
                                        state: {
                                          value: '{{$values.tableName}}',
                                        },
                                      },
                                    },
                                  },
                                  filter: {
                                    type: 'string',
                                    'x-decorator': 'FormItem',
                                    description: i18n.t(
                                      'packages_dag_nodes_table_jinzhichiqu',
                                    ),
                                    'x-component': 'JsonEditor',
                                    'x-component-props': {
                                      options: {
                                        showPrintMargin: false,
                                        useWrapMode: true,
                                      },
                                    },
                                  },
                                },
                              },
                              mongoAgg: {
                                type: 'void',
                                'x-reactions': {
                                  dependencies: ['customCommand.command'],
                                  fulfill: {
                                    state: {
                                      visible:
                                        '{{$values.databaseType==="MongoDB" && $deps[0]==="aggregate"}}',
                                    },
                                  },
                                },
                                properties: {
                                  collection: {
                                    type: 'string',
                                    'x-reactions': {
                                      fulfill: {
                                        state: {
                                          value: '{{$values.tableName}}',
                                        },
                                      },
                                    },
                                  },
                                  pipeline: {
                                    type: 'string',
                                    'x-decorator': 'FormItem',
                                    description: i18n.t(
                                      'packages_dag_nodes_table_shiligro',
                                    ),
                                    'x-component': 'JsonEditor',
                                    'x-component-props': {
                                      options: {
                                        showPrintMargin: false,
                                        useWrapMode: true,
                                      },
                                    },
                                  },
                                },
                              },
                              sql: {
                                type: 'string',
                                required: true,
                                'x-decorator': 'FormItem',
                                'x-component': 'SqlEditor',
                                'x-component-props': {
                                  options: {
                                    showPrintMargin: false,
                                    useWrapMode: true,
                                  },
                                },
                                'x-reactions': {
                                  fulfill: {
                                    state: {
                                      visible:
                                        '{{$values.databaseType!=="MongoDB"}}',
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },

                      isFilter: {
                        type: 'boolean',
                        title: i18n.t('packages_dag_nodes_table_guolushezhi'),
                        default: false,
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          className: 'item-control-horizontal',
                          layout: 'horizontal',
                        },
                        'x-component': 'Switch',
                        'x-reactions': [
                          {
                            dependencies: [
                              'enableCustomCommand',
                              'readPartitionOptions.enable',
                            ],
                            fulfill: {
                              state: {
                                disabled: `{{$form.disabled || !!$deps[0] || !!$deps[1]}}`,
                                description: `{{!!$deps[1] ? '${i18n.t('packages_dag_nodes_table_depskai')}':''}}`,
                              },
                            },
                          },
                          {
                            target: '*(conditions,offsetHours)',
                            fulfill: {
                              state: {
                                visible: '{{$self.value===true}}',
                              },
                            },
                          },
                        ],
                      },

                      nodeSchema: {
                        type: 'string',
                        'x-display': 'hidden',
                        'x-reactions': [
                          {
                            dependencies: [
                              'schemaFields#dataSource',
                              'schemaFields#loading',
                            ],
                            fulfill: {
                              state: {
                                dataSource: '{{$deps[0]}}',
                                loading: '{{$deps[1]}}',
                              },
                              // 不设置字段的 loading，体验不好
                              run: `{{$form.setFieldState('*(conditions.*.key,cdcPollingFields.*.field)', {dataSource: $self.dataSource})}}`,
                            },
                          },
                        ],
                      },
                      conditions: {
                        title: i18n.t(
                          'packages_dag_nodes_table_zidingyitiaojian',
                        ),
                        type: 'array',
                        required: true,
                        default: [
                          {
                            key: '',
                            value: '',
                            operator: 5,
                            number: 1,
                            form: 'BEFORE',
                            unit: 'DAY',
                          },
                        ],
                        'x-decorator': 'FormItem',
                        'x-component': 'ArrayItems',
                        items: {
                          type: 'object',
                          properties: {
                            space: {
                              type: 'void',
                              'x-component': 'Space',
                              'x-component-props': {
                                class: 'w-100',
                                align: 'start',
                              },
                              properties: {
                                key: {
                                  type: 'string',
                                  required: 'true',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    className: 'flex-1',
                                  },
                                  'x-component': 'FieldSelect',
                                  'x-component-props': {
                                    filterable: true,
                                  },
                                  'x-reactions': {
                                    effects: ['onFieldInputValueChange'],
                                    fulfill: {
                                      run: '{{$record.value = undefined}}',
                                    },
                                  },
                                },
                                timeFilter: {
                                  type: 'void',
                                  'x-component': 'Space',
                                  'x-reactions': {
                                    dependencies: [
                                      'nodeSchema#dataSource',
                                      '.key',
                                    ],
                                    fulfill: {
                                      state: {
                                        display: `{{Boolean($deps[0] && $deps[1] && $deps[0].find(field=>field.value===$deps[1]&&/timestamp|date|DATE_TIME|datetime/i.test(field.type))) ? "visible" :"hidden"}}`,
                                      },
                                    },
                                  },
                                  properties: {
                                    fastQuery: {
                                      type: 'boolean',
                                      default: false,
                                      enum: [
                                        {
                                          label: i18n.t('public_date_specific'),
                                          value: false,
                                        },
                                        {
                                          label: i18n.t('public_date_relative'),
                                          value: true,
                                        },
                                      ],
                                      'x-decorator': 'FormItem',
                                      'x-decorator-props': {
                                        wrapperWidth: 140,
                                      },
                                      'x-component': 'Select',
                                    },
                                    RelativeTimePicker: {
                                      type: 'void',
                                      'x-component': 'RelativeTimePicker',
                                      'x-component-props': {
                                        offsetHours: '{{$values.offsetHours}}',
                                      },
                                      'x-reactions': {
                                        dependencies: ['.fastQuery'],
                                        fulfill: {
                                          state: {
                                            display: `{{!!$deps[0] ? "visible" :"hidden"}}`,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                valueWrapper: {
                                  type: 'void',
                                  'x-reactions': {
                                    dependencies: [
                                      'nodeSchema#dataSource',
                                      '.key',
                                      '.fastQuery',
                                    ],
                                    fulfill: {
                                      state: {
                                        display: `{{!$deps[2] || !(field=$deps[0] && $deps[0].find(item=>item.value===$deps[1]),field&&/timestamp|date|DATE_TIME|datetime/i.test(field.type)) ? "visible" :"hidden"}}`,
                                      },
                                    },
                                  },
                                  properties: {
                                    operator: {
                                      type: 'number',
                                      required: 'true',
                                      default: 5,
                                      enum: [
                                        {
                                          label: '>',
                                          value: 1,
                                        },
                                        {
                                          label: '>=',
                                          value: 2,
                                        },
                                        {
                                          label: '<',
                                          value: 3,
                                        },
                                        {
                                          label: '<=',
                                          value: 4,
                                        },
                                        {
                                          label: '=',
                                          value: 5,
                                        },
                                      ],
                                      'x-decorator': 'FormItem',
                                      'x-decorator-props': {
                                        wrapperWidth: 66,
                                      },
                                      'x-component': 'Select',
                                    },
                                    value: {
                                      type: 'string',
                                      required: 'true',
                                      'x-decorator': 'FormItem',
                                      'x-decorator-props': {
                                        wrapperWidth: 208,
                                      },
                                      'x-component': 'Input',
                                      'x-component-props': {
                                        type: 'datetime',
                                        align: 'right',
                                        format: 'YYYY-MM-DD HH:mm:ss',
                                      },
                                      'x-reactions': {
                                        dependencies: [
                                          'nodeSchema#dataSource',
                                          '.key',
                                        ],
                                        fulfill: {
                                          schema: {
                                            'x-component':
                                              '{{field=$deps[0] && $deps[0].find(item=>item.value===$deps[1]),field&&/timestamp|date|DATE_TIME|datetime/i.test(field.type)?"DatePicker":"Input"}}',
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                remove: {
                                  type: 'void',
                                  'x-decorator': 'FormItem',
                                  'x-component': 'ArrayItems.Remove',
                                  'x-component-props': {
                                    disabled: '{{$values.conditions.length<2}}',
                                  },
                                },
                              },
                            },
                          },
                        },
                        properties: {
                          add: {
                            type: 'void',
                            title: i18n.t('packages_dag_nodes_table_tianjia'),
                            'x-component': 'ArrayItems.Addition',
                            'x-component-props': {
                              defaultValue: {
                                key: '',
                                value: '',
                                operator: 5,
                                number: 1,
                                form: 'BEFORE',
                                unit: 'DAY',
                              },
                            },
                          },
                        },
                      },
                      offsetHours: {
                        type: 'number',
                        title: i18n.t('packages_dag_time_zone_offset'),
                        default: 0,
                        'x-decorator': 'FormItem',
                        'x-component': 'InputNumber',
                      },
                    },
                  },
                  read: {
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
                    },
                  },
                  resume: {
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
                            'x-reactions': [
                              {
                                fulfill: {
                                  state: {
                                    value:
                                      '{{$values.attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? $values.readPartitionOptions.enable:false}}',
                                  },
                                },
                              },
                              {
                                dependencies: [
                                  'isFilter',
                                  'enableCustomCommand',
                                ],
                                fulfill: {
                                  schema: {
                                    'x-component-props.disabled':
                                      '{{!!$deps[0] || !!$deps[1]}}',
                                  },
                                  state: {
                                    description: `{{!!$deps[0] || !!$deps[1] ? '${i18n.t(
                                      'packages_dag_nodes_table_depsd',
                                    )}':''}}`,
                                  },
                                },
                              },
                            ],
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
                      },
                    },
                  },
                  pdk: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_datasource'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          visible:
                            '{{!["CSV","EXCEL","JSON","XML"].includes($values.databaseType) && $hasPdkConfig($values.attrs.pdkHash)}}',
                        },
                        schema: {
                          'x-component-props.className':
                            '{{$self.query("nodeConfig.*").map(field => field.visible).includes(true) ? "":"none"}}',
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
                  ddlEventWrapper: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_nodes_database_ddLshijian'),
                      tooltip: i18n.t('packages_dag_ddl_events_collapse_tip'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          display: `{{findParentNodes($values.id).filter(parent => (parent.type === 'database' || parent.type === 'table') && parent.ddlConfiguration === 'SYNCHRONIZATION' ).length > 0 ? "visible":"hidden"}}`,
                        },
                      },
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
                        'x-component': 'DdlEventList',
                        'x-component-props': {
                          hideParent: true,
                          findParentNodes: '{{findParentNodes}}',
                        },
                      },
                    },
                  },
                  write: {
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
                            'x-reactions': {
                              target: '*(dmlPolicy,updateConditionFields)',
                              fulfill: {
                                state: {
                                  display:
                                    '{{$self.value === "appendWrite" ? "hidden":"visible"}}',
                                },
                              },
                            },
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
                      },
                      incrementExactlyOnceObject: {
                        type: 'void',
                        'x-component': 'Space',
                        properties: {
                          incrementExactlyOnceEnable: {
                            title: i18n.t(
                              'packages_dag_nodes_database_increment_exactly_once_enable_title',
                            ),
                            type: 'boolean',
                            default: false,
                            'x-component': 'Switch',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'item-control-horizontal',
                              layout: 'horizontal',
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_increment_exactly_once_enable_tips',
                              ),
                            },
                          },
                          incrementExactlyOnceEnableTimeWindowDay: {
                            title: i18n.t(
                              'packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_title',
                            ),
                            type: 'number',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              className: 'item-control-horizontal ml-3',
                              layout: 'horizontal',
                              tooltip: i18n.t(
                                'packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_tips',
                              ),
                            },
                            'x-component': 'Select',
                            'x-component-props': {
                              style: {
                                width: '100px',
                              },
                            },
                            enum: [1, 3, 5, 7],
                            default: 3,
                          },
                        },
                        'x-reactions': [
                          {
                            fulfill: {
                              state: {
                                display: `{{findParentNodes($values.id).length < 2 && $values.attrs.capabilities.filter(item => ["transaction_begin_function", "transaction_commit_function", "transaction_rollback_function"].includes(item.id)).length === 3 ? 'visible' : 'hidden'}}`,
                              },
                            },
                          },
                        ],
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
                  pdkTarget: {
                    type: 'void',
                    'x-component': 'FormCollapse.Item',
                    'x-component-props': {
                      title: i18n.t('packages_dag_config_datasource'),
                    },
                    'x-reactions': {
                      fulfill: {
                        state: {
                          visible:
                            '{{!["CSV","EXCEL","JSON","XML"].includes($values.databaseType) && $hasPdkConfig($values.attrs.pdkHash)}}',
                        },
                        schema: {
                          'x-component-props.className':
                            '{{$self.query("nodeConfig.*").map(field => field.visible).includes(true) ? "":"none"}}',
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
          alarmTab: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('packages_dag_migration_configpanel_gaojingshezhi'),
              locked: import.meta.env.VUE_APP_MODE === 'community',
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
              'alarmSettings.0.open': {
                title: i18n.t(
                  'packages_business_setting_alarmnotification_dangshujuyuanjie',
                ),
                type: 'boolean',
                default: true,
                'x-editable': true,
                'x-decorator': 'FormItem',
                'x-component': 'Switch',
                'x-component-props': {
                  onChange: `{{val=>(val && !$values.alarmRules[0].notify.length && ($values.alarmRules[0].notify=["SYSTEM"]))}}`,
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
              'alarmSettings.0.notify': {
                type: 'array',
                'x-editable': true,
                'x-decorator': 'FormItem',
                'x-component': 'Checkbox.Group',
                'x-component-props': {
                  onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
                },
                default: ['SYSTEM', 'EMAIL'],
                'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
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
                  'alarmRules.0._point': {
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
                  'alarmRules.0.equalsFlag': {
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
                    'x-reactions': {
                      dependencies: ['.open'],
                      fulfill: {
                        state: {
                          disabled: `{{!$deps[0]}}`,
                        },
                      },
                    },
                  },
                  'alarmRules.0.ms': {
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
                  'alarmRules.0._ms': {
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
      // 切换连接，保存连接的类型
      'attrs.connectionType': {
        type: 'string',
        'x-display': 'hidden',
      },

      // 连接名称
      'attrs.connectionName': {
        type: 'string',
        'x-display': 'hidden',
      },

      'attrs.capabilities': {
        type: 'array',
        'x-display': 'hidden',
        'x-reactions': '{{useDmlPolicy}}',
      },
    },
  }

  allowTarget(target, source) {
    // 不再支持既是源又是目标的节点
    return (
      !source.$inputs?.length &&
      (target.type !== 'table' || !target.$outputs?.length)
    )
  }

  allowSource(source, target) {
    // 不再支持既是源又是目标的节点
    return !target.$outputs?.length
  }
}
