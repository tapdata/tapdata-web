<script>
import { createForm } from '@formily/core'
import { action } from '@formily/reactive'
import { getAlarmChannels, taskApi } from '@tap/api'
import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import SchemaForm from '../SchemaForm.vue'

export default defineComponent({
  name: 'TaskReadPretty',
  components: { SchemaForm },
  props: {
    task: Object,
  },
  setup(props) {
    const store = useStore()
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    const nodes = store.getters['dataflow/allNodes']
    const form = ref(null)
    const fieldForm = ref(null)
    const checkCrontabExpressionFlagMessage = i18n.t(
      'packages_dag_task_form_error_can_not_open_crontab_expression_flag',
    )
    const handleCheckCrontabExpressionFlag = debounce(function (resolve) {
      taskApi.checkCheckCloudTaskLimit(props.task.id).then((data) => {
        resolve(data)
      })
    }, 500)
    const schema = {
      type: 'object',
      properties: {
        div: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4 mb-4',
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4',
              },
              'x-content': i18n.t('public_basic_settings'),
            },
            dag: {
              type: 'object',
              properties: {
                type: {
                  title: i18n.t('packages_dag_task_setting_sync_type'),
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  default: 'initial_sync+cdc',
                  enum: [
                    {
                      label: i18n.t(
                        'packages_dag_task_setting_initial_sync_cdc',
                      ), //全量+增量
                      value: 'initial_sync+cdc',
                    },
                    {
                      label: i18n.t('public_task_type_initial_sync'), //全量
                      value: 'initial_sync',
                    },
                    {
                      label: i18n.t('public_task_type_cdc'), //增量
                      value: 'cdc',
                    },
                  ],
                },

                'nodes[3]': {
                  type: 'object',
                  properties: {
                    existDataProcessMode: {
                      type: 'string',
                      title: i18n.t(
                        'packages_dag_nodes_database_chongfuchulice',
                      ),
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
                          run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $values.type === "cdc"}}',
                          state: {
                            description: `{{$values.type === "cdc" ? '${i18n.t(
                              'packages_dag_nodes_database_setting_cdc_changjing_desc',
                            )}':''}}`,
                          },
                          schema: {
                            // TODO 根据能力改变dataSource
                            'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`,
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
                        },
                        initialConcurrentWriteNum: {
                          type: 'number',
                          default: 8,
                          'x-component': 'InputNumber',
                          'x-component-props': {
                            min: 0,
                          },
                          'x-reactions': {
                            dependencies: ['.initialConcurrent'],
                            fulfill: {
                              state: {
                                visible: '{{!!$deps[0]}}',
                              },
                            },
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
                        },
                        cdcConcurrentWriteNum: {
                          type: 'number',
                          default: 4,
                          'x-component': 'InputNumber',
                          'x-component-props': {
                            min: 0,
                          },
                          'x-reactions': {
                            dependencies: ['.cdcConcurrent'],
                            fulfill: {
                              state: {
                                visible: '{{!!$deps[0]}}',
                              },
                            },
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
                  },
                },

                'nodes[0]': {
                  type: 'object',
                  properties: {
                    'attrs.capabilities': {
                      type: 'array',
                    },
                    sourceCollapse: {
                      type: 'void',
                      'x-component': 'FormCollapse',
                      'x-component-props': {
                        class: 'advanced-collapse',
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
                                  label: i18n.t(
                                    'packages_dag_ddl_stopped_on_error',
                                  ),
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
                                  when: `{{!$values.dag.nodes[0].attrs.capabilities.filter(item => item.type === 10).length}}`,
                                  fulfill: {
                                    state: {
                                      disabled: true,
                                      description: `{{$values.dag.nodes[0].databaseType + ' ${i18n.t(
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
                              'x-component-props': {
                                formValues: '{{$values.dag.nodes[0]}}',
                              },
                              'x-reactions': [
                                {
                                  dependencies: ['.ddlConfiguration'],
                                  fulfill: {
                                    state: {
                                      visible:
                                        '{{$deps[0].value === "SYNCHRONIZATION"}}',
                                    },
                                  },
                                },
                              ],
                            },
                            ignoredDDLRules: {
                              title: i18n.t('packages_dag_ddl_ignore_rules'),
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                tooltip: i18n.t(
                                  'packages_dag_ddl_ignore_rules_tip',
                                ),
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
                              title: i18n.t(
                                'packages_dag_enableConcurrentRead',
                              ),
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
                            title: i18n.t(
                              'packages_dag_config_breakpoint_resume',
                            ),
                          },
                          'x-reactions': {
                            fulfill: {
                              state: {
                                display:
                                  '{{hasFeature("resume") && $values.dag.nodes[0].attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? "visible":"hidden"}}',
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
                                          '{{$values.dag.nodes[0].attrs.capabilities.some(item => item.id === "get_read_partitions_function") ? "visible" :"hidden"}}',
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
                                      run: `{{ $values.dag.nodes[0].splitTyp !== 10 && $values.dag.nodes[0].attrs.capabilities.some(t => t.id === 'count_by_partition_filter_function') && $self.setValue(1) }}`,
                                      state: {
                                        display:
                                          '{{$deps[0] ? "visible" :"hidden"}}',
                                      },
                                      schema: {
                                        'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[0].attrs.capabilities.some(item => item.id ==='count_by_partition_filter_function') && options.push($self.dataSource[1]),options}}`,
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
                                        display:
                                          '{{$deps[0] ? "visible" :"hidden"}}',
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
                                        display:
                                          '{{$deps[0] ? "visible" :"hidden"}}',
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
                                        display:
                                          '{{$deps[0] ? "visible" :"hidden"}}',
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

                        tab4: {
                          type: 'void',
                          'x-component': 'FormCollapse.Item',
                          'x-component-props': {
                            title: i18n.t(
                              'packages_dag_nodes_database_ddLshijian',
                            ),
                          },
                          properties: {
                            ddlEvents: {
                              type: 'void',
                              'x-component': 'DdlEventList',
                              'x-component-props': {
                                formValues: '{{$values.dag.nodes[3]}}',
                                hideParent: true,
                                findParentNodes: '{{findParentNodes}}',
                              },
                            },
                          },
                        },
                        tab5: {
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
                              'x-decorator-props': {
                                feedbackLayout: 'none',
                              },
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
                                  type: 'void',
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    className: 'font-color-dark',
                                    wrapperWidth: 300,
                                    addonBefore: i18n.t(
                                      'packages_dag_nodes_database_shanchushijian',
                                    ),
                                  },
                                  'x-component': 'Tag',
                                  'x-content': i18n.t(
                                    'packages_dag_nodes_database_bucunzaishidiu',
                                  ),
                                  'x-component-props': {
                                    type: 'info',
                                    effect: 'light',
                                  },
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
                                    visible: '{{$settings.type !== "cdc"}}',
                                    description: `{{$self.value ? '${i18n.t('packages_dag_syncIndex_desc')}' : ''}}`,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        div1: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4',
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4',
              },
              'x-content': i18n.t('public_advanced_settings'),
            },
            config: {
              type: 'object',
              properties: {
                skipErrorEvent: {
                  type: 'object',
                  'x-component': 'FormContent',
                  properties: {
                    errorMode: {
                      type: 'string',
                      title: i18n.t(
                        'packages_dag_migration_settingpanel_dangdanbiaotongbu',
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: i18n.t('public_select_placeholder'),
                      },
                      default: 'Disable',
                      enum: [
                        // {
                        //   label: '直接跳过异常的表，任务继续运行 ',
                        //   value: 'SkipTable'
                        // },
                        {
                          label: i18n.t(
                            'packages_dag_migration_settingpanel_anzhaomorenzhong',
                          ),
                          value: 'Disable',
                        },
                        {
                          label: i18n.t(
                            'packages_dag_migration_settingpanel_tiaoguoyichangshi',
                          ),
                          value: 'SkipData',
                        },
                      ],
                    },
                    limitMode: {
                      type: 'string',
                      title: i18n.t(
                        'packages_dag_migration_settingpanel_renwutiaoguoshi',
                      ),
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: i18n.t('public_select_placeholder'),
                      },
                      default: 'SkipByLimit',
                      enum: [
                        // {
                        //   label: i18n.t('packages_dag_migration_settingpanel_zhidingtiaoguoce'),
                        //   value: 'Disable'
                        // },
                        {
                          label: i18n.t(
                            'packages_dag_migration_settingpanel_dangtiaoguoshijian2',
                          ),
                          value: 'SkipByRate',
                        },
                        {
                          label: i18n.t(
                            'packages_dag_migration_settingpanel_dangtiaoguoshijian',
                          ),
                          value: 'SkipByLimit',
                        },
                      ],
                      'x-reactions': {
                        dependencies: ['.errorMode'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "SkipData" ? "visible" : "hidden"}}',
                          },
                        },
                      },
                    },
                    limitVoid: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'Space',
                      properties: {
                        limit: {
                          type: 'number',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            feedbackLayout: 'none',
                            addonAfter: i18n.t(
                              'packages_dag_migration_settingpanel_shirenwubaocuo',
                            ),
                          },
                          'x-component': 'InputNumber',
                          default: 1,
                          'x-component-props': {
                            precision: 0,
                            min: 1,
                          },
                        },
                      },
                      'x-reactions': {
                        dependencies: ['.errorMode', '.limitMode'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "SkipData" && $deps[1] === "SkipByLimit" ? "visible" : "hidden"}}',
                          },
                        },
                      },
                    },
                    rateVoid: {
                      type: 'void',
                      'x-decorator': 'FormItem',
                      'x-component': 'Space',
                      properties: {
                        rate: {
                          type: 'number',
                          'x-decorator': 'FormItem',
                          'x-decorator-props': {
                            feedbackLayout: 'none',
                            addonAfter: `% ${i18n.t(
                              'packages_dag_migration_settingpanel_shirenwubaocuo',
                            )}`,
                          },
                          'x-component': 'InputNumber',
                          default: 1,
                          'x-component-props': {
                            precision: 0,
                            min: 1,
                            max: 100,
                          },
                        },
                      },
                      'x-reactions': {
                        dependencies: ['.errorMode', '.limitMode'],
                        fulfill: {
                          state: {
                            display:
                              '{{$deps[0] === "SkipData" && $deps[1] === "SkipByRate" ? "visible" : "hidden"}}',
                          },
                        },
                      },
                    },
                  },
                },
                planStartDateFlag: {
                  title: i18n.t('packages_dag_task_setting_plan_start_date'), //计划时间
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Switch',
                  default: false,
                  target: '*(syncPoints)',
                  fulfill: {
                    state: {
                      visible: '{{$self.value}}',
                    },
                  },
                },
                planStartDate: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  required: true,
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    type: 'datetime',
                    align: 'right',
                    format: 'YYYY-MM-DD HH:mm:ss',
                    valueFormat: 'x',
                  },
                  'x-reactions': {
                    dependencies: ['planStartDateFlag'],
                    fulfill: {
                      state: {
                        display: '{{$deps[0] ? "visible" : "hidden"}}',
                      },
                    },
                  },
                },
                crontabExpressionFlag: {
                  //调度表达式
                  title: i18n.t(
                    'packages_dag_task_setting_crontabExpressionFlag',
                  ), //定期调度任务
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_task_setting_cron_tip'),
                  },
                  'x-component': 'Switch',
                  default: false,
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        display:
                          '{{$deps[0] !== "cdc" ? "visible" : "hidden"}}',
                      },
                    },
                  },
                  'x-validator': `{{(value) => {
                                if (!value || $isDaas) { return true }
                    return new Promise((resolve) => {
                      checkCrontabExpressionFlag(value).then(data => {
                        if(data === false) {
                          resolve('${checkCrontabExpressionFlagMessage}')
                        } else {
                          resolve()
                        }
                      })
                    })
                  }}}`,
                },
                crontabExpression: {
                  type: 'string',
                  required: true,
                  'x-validator': {
                    cron: true,
                    message: i18n.t(
                      'packages_dag_migration_settingpanel_cronbiao',
                    ),
                  },
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: i18n.t(
                      'packages_dag_task_setting_cron_expression',
                    ),
                  },
                  description: i18n.t('packages_dag_task_setting_cron_tip'),
                  'x-reactions': {
                    dependencies: ['type', 'crontabExpressionFlag'],
                    fulfill: {
                      state: {
                        display:
                          '{{$deps[0] !== "cdc" && $deps[1] ? "visible" : "hidden"}}',
                      },
                    },
                  },
                },
                syncPoints: {
                  title: i18n.t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
                  type: 'array',
                  default: [{ type: 'current', date: '' }],
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_task_setting_syncPoint_tip'),
                    feedbackLayout: 'none',
                  },
                  'x-component': 'SyncPoints',
                  'x-decorator': 'FormItem',
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        display:
                          '{{$deps[0] === "cdc" ? "visible" : "hidden"}}',
                      },
                    },
                  },
                },
                syncPointsDescWrap: {
                  type: 'void',
                  'x-component': 'div',
                  'x-component-props': {
                    class: 'flex align-center gap-2',
                  },
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        visible:
                          '{{$deps[0] === "cdc" && !!$values.currentEventTimestampLabel}}',
                      },
                    },
                  },
                  properties: {
                    syncPointsDesc: {
                      type: 'void',
                      'x-component': 'div',
                      'x-component-props': {
                        style: {
                          color: '#909399',
                        },
                      },
                      'x-content': `{{'${i18n.t(
                        'packages_dag_task_setting_syncPoint_recent_increment',
                      )}: ' + $values.currentEventTimestampLabel}}`,
                    },
                    syncPointsDescBtn: {
                      type: 'void',
                      'x-component': 'Link',
                      'x-component-props': {
                        type: 'primary',
                        onClick: '{{handleQuicklySyncPoints}}',
                      },
                      'x-content': i18n.t(
                        'packages_dag_task_setting_syncPoint_from_now',
                      ),
                    },
                  },
                },
              },
            },
          },
        },

        alarm: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4 mt-4',
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4',
              },
              'x-content': i18n.t(
                'packages_dag_migration_configpanel_gaojingshezhi',
              ),
            },
            alarmSettings: {
              'x-editable': true,
              type: 'array',
              default: [
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_STATUS_ERROR',
                  sort: 1,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 1,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_FULL_COMPLETE',
                  sort: 3,
                  notify: ['SYSTEM'],
                  interval: 1,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_START',
                  sort: 4,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_DELAY',
                  sort: 6,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND',
                },
              ],
            },
            alarmRules: {
              type: 'array',
              'x-editable': true,
              default: [
                {
                  key: 'TASK_INCREMENT_DELAY',
                  point: 60,
                  equalsFlag: 1,
                  ms: 60000,
                },
              ],
            },
            'alarmSettings.0.open': {
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuyunxingchu',
              ),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`,
              },
            },
            'alarmSettings.0.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`,
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
            },
            'alarmSettings.1.open': {
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuquanliangwan',
              ),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM"]))}}`,
              },
            },
            'alarmSettings.1.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[1].open=false))}}`,
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
            },
            'alarmSettings.2.open': {
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuzengliangkai',
              ),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM"]))}}`,
              },
            },
            'alarmSettings.2.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[2].open=false))}}`,
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
            },
            'alarmSettings.3.open': {
              title: i18n.t(
                'packages_dag_migration_alarmpanel_renwuzengliangyan',
              ),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[3].notify.length && ($values.alarmSettings[3].notify=["SYSTEM"]))}}`,
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
            'alarmSettings.3.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[3].open=false))}}`,
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}'],
            },
            space: {
              type: 'void',
              'x-component': 'Space',
              properties: {
                'alarmRules.0.point': {
                  type: 'number',
                  'x-editable': true,
                  'x-reactions': [
                    {
                      dependencies: ['._point'],
                      fulfill: {
                        state: {
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12): $self.value}}`,
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
                  'x-reactions': [
                    {
                      dependencies: ['.point'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 12) < 1 ? 1 : Math.ceil($deps[0] / 12) : $self.value}}`,
                        },
                      },
                    },
                  ],
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
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000) : $self.value}}`,
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
                  'x-reactions': [
                    {
                      dependencies: ['.ms'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 1000) < 1 ? 1 : Math.ceil($deps[0] / 1000) : $self.value}}`,
                        },
                      },
                    },
                  ],
                },
                unit: {
                  title: 's',
                  type: 'void',
                  default: 0,
                  'x-editable': true,
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
    }
    const scope = {
      $settings: props.task,
      useAsyncOptions: (service, ...serviceParams) => {
        return (field) => {
          field.loading = true
          service(...serviceParams).then(
            action.bound((data) => {
              field.dataSource = data
              field.loading = false
            }),
          )
        }
      },
      async loadAlarmChannels() {
        const channels = await getAlarmChannels()
        const MAP = {
          system: {
            label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'),
            value: 'SYSTEM',
          },
          email: {
            label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'),
            value: 'EMAIL',
          },
        }
        const options = []
        if (!isDaas) {
          const isOpenid = window.__USER_INFO__?.openid
          Object.assign(MAP, {
            wechat: {
              label: i18n.t('packages_business_notify_webchat_notification'),
              value: 'WECHAT',
              disabled: !isOpenid,
            },
            sms: {
              label: i18n.t('packages_business_notify_sms_notification'),
              value: 'SMS',
            },
          })
        }

        for (const channel of channels) {
          const option = MAP[channel.type]

          if (!option) continue

          options.push(option)
        }

        return options
      },
      checkCrontabExpressionFlag: (value) => {
        return new Promise((resolve) => {
          handleCheckCrontabExpressionFlag(resolve, value)
        })
      },
      findNodeById: (id) => {
        return store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        const node = scope.findNodeById(id)
        const parents = []

        if (!node) return parents

        const parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach((pid) => {
          const parent = scope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach((ppid) => {
                parents.push(...scope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      },
    }

    const initForm = () => {
      const task = props.task
      scope.$taskId = task.id

      form.value = createForm({
        readPretty: true,
        values: {
          ...task,
          dag: {
            nodes,
          },
        },
      })
    }

    initForm()

    return {
      form,
      fieldForm,
      schema,
      scope,
    }
  },
})
</script>

<template>
  <div class="flex flex-column gap-4">
    <SchemaForm :form="form" :schema="schema" :scope="scope" />
  </div>
</template>

<style scoped lang="scss"></style>
