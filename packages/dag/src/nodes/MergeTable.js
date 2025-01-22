import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'

export class MergeTable extends NodeType {
  constructor() {
    super()
  }

  type = 'merge_table_processor'

  maxOutputs = 1 // 最大输出个数

  group = 'processor'

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
              externalStorageId: {
                title: i18n.t('packages_dag_nodes_aggregate_waicunpeizhi'), //外存配置
                type: 'string',
                'x-visible': '{{$isDaas}}',
                'x-decorator': 'FormItem',
                'x-component': 'Select',
                'x-reactions': [
                  '{{useAsyncDataSourceByConfig({service: loadExternalStorage, withoutField: true})}}',
                  {
                    fulfill: {
                      state: {
                        value: '{{$self.value || $self.dataSource?.find(item => item.isDefault)?.value }}'
                      }
                    }
                  }
                ]
              },

              nameWrap: {
                type: 'void',
                title: i18n.t('public_node_name'),
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
                  name: {
                    type: 'string',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      style: {
                        flex: 1
                      }
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      onChange: `{{() => { $values.attrs.hasNameEdited = true }}}`
                    }
                  },

                  clipboardButton: {
                    type: 'void',
                    'x-component': 'ClipboardButton',
                    'x-component-props': {
                      tooltip: i18n.t('packages_dag_copy_node_id'),
                      finishTooltip: i18n.t('packages_dag_nodes_table_yifuzhi'),
                      content: '{{$values.id}}'
                    }
                  }
                }
              },

              mergeMode: {
                type: 'string',
                title: i18n.t('packages_dag_mergeMode'),
                default: 'main_table_first',
                enum: [
                  {
                    label: i18n.t('packages_dag_main_table_first'),
                    value: 'main_table_first'
                  },
                  {
                    label: i18n.t('packages_dag_sub_table_first'),
                    value: 'sub_table_first'
                  }
                ],
                'x-decorator': 'FormItem',
                'x-component': 'Radio.Group'
              },

              mergeProperties: {
                title: i18n.t('packages_dag_nodes_mergetable_zhucongpeizhi'),
                type: 'array',
                required: true,
                'x-component': 'MergeTableTree',
                'x-component-props': {
                  treeWidth: 200,
                  findNodeById: '{{findNodeById}}',
                  loadFieldsMethod: '{{loadNodeFieldOptions}}',
                  '@center-node': '{{centerNode}}'
                },
                items: {
                  type: 'object',
                  properties: {
                    itemsWrap: {
                      type: 'void',
                      'x-component': 'FormContent',
                      properties: {
                        id: {
                          type: 'string',
                          'x-display': 'hidden'
                        },
                        mergeType: {
                          type: 'string',
                          title: i18n.t('packages_dag_materialized_view_field_type'),
                          'x-decorator': 'FormItem',
                          'x-component': 'Radio.Group',
                          enum: [
                            { label: i18n.t('public_document'), value: 'updateWrite' },
                            {
                              label: i18n.t('public_array'),
                              value: 'updateIntoArray'
                            }
                          ]
                        },
                        wrap: {
                          type: 'void',
                          'x-component': 'FormContent',
                          properties: {
                            hasWarning: {
                              type: 'boolean',
                              'x-display': 'hidden'
                            },
                            targetPath: {
                              type: 'string',
                              title: i18n.t('packages_dag_field_path'),
                              'x-decorator': 'FormItem',
                              'x-component': 'Input',
                              'x-component-props': {
                                id: 'merge_table_processor_targetPath'
                              },
                              'x-reactions': [
                                {
                                  dependencies: ['.mergeType', '.id'],
                                  fulfill: {
                                    state: {
                                      value: `{{ !$self.value && $self.value !== '' && ($deps[0] === "updateWrite" || $deps[0] === "updateIntoArray") ? findNodeById($deps[1]) ? findNodeById($deps[1]).name:undefined : $self.value }}`
                                    }
                                  }
                                },
                                {
                                  effects: ['onFieldInputValueChange'],
                                  fulfill: {
                                    run: `{{
                                  const arr = $self.value.split('.')
                                  if (arr.length > 3) {
                                    $self.value = arr.slice(0,3).join('.')
                                    $self.description = '${i18n.t(
                                      'packages_dag_nodes_mergetable_const_zuiduozhichiliangceng'
                                    )}'
                                  } else {
                                    $self.description = ''
                                  }
                                }}`
                                  }
                                }
                              ]
                            },
                            arrayKeys: {
                              required: true,
                              type: 'array',
                              title: i18n.t('packages_dag_nodes_mergetable_neiqianshuzupi'),
                              'x-decorator': 'FormItem',
                              'x-component': 'FieldSelect',
                              'x-component-props': {
                                'allow-create': true,
                                multiple: true,
                                filterable: true
                              }
                            },
                            children: {
                              type: 'array',
                              'x-display': 'hidden'
                            },
                            joinKeys: {
                              type: 'array',
                              title: i18n.t('packages_dag_nodes_mergetable_guanliantiaojian'),
                              'x-decorator': 'FormItem',
                              'x-component': 'ArrayTable',
                              items: {
                                type: 'object',
                                properties: {
                                  c1: {
                                    type: 'void',
                                    'x-component': 'ArrayTable.Column',
                                    'x-component-props': {
                                      title: i18n.t('packages_dag_nodes_mergetable_dangqianbiaoziduan'),
                                      align: 'center',
                                      asterisk: false
                                    },
                                    properties: {
                                      source: {
                                        type: 'string',
                                        loading: true,
                                        required: true,
                                        'x-decorator': 'FormItem',
                                        'x-component': 'FieldSelect',
                                        'x-component-props': {
                                          'allow-create': true,
                                          filterable: true
                                        }
                                      }
                                    }
                                  },
                                  c2: {
                                    type: 'void',
                                    'x-component': 'ArrayTable.Column',
                                    'x-component-props': {
                                      title: i18n.t('packages_dag_nodes_mergetable_mubiaobiaoziduan'),
                                      align: 'center',
                                      asterisk: false
                                    },
                                    properties: {
                                      target: {
                                        type: 'string',
                                        required: true,
                                        'x-decorator': 'FormItem',
                                        'x-component': 'FieldSelect',
                                        'x-component-props': {
                                          'allow-create': true,
                                          filterable: true
                                        }
                                      }
                                    }
                                  },
                                  c3: {
                                    type: 'void',
                                    'x-component': 'ArrayTable.Column',
                                    'x-component-props': {
                                      width: 40,
                                      title: '',
                                      align: 'center'
                                    },
                                    properties: {
                                      remove: {
                                        type: 'void',
                                        'x-component': 'ArrayTable.Remove'
                                      }
                                    }
                                  }
                                }
                              },
                              properties: {
                                addition: {
                                  type: 'void',
                                  title: '+',
                                  'x-component': 'ArrayTable.Addition'
                                }
                              }
                            },
                            enableUpdateJoinKeyValue: {
                              type: 'boolean',
                              title: i18n.t('packages_dag_nodes_mergetable_gengxinjianguanlian'),
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                layout: 'horizontal',
                                tooltip: i18n.t('packages_dag_nodes_mergetable_gengxinjianguanlian_tips')
                              },
                              'x-component': 'Switch',
                              'x-component-props': {
                                onChange: '{{(val) => { changeEnableUpdateJoinKeyValue(val, $self) }}}'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },

              schemaPreview: {
                type: 'void',
                'x-component': 'SchemaPreview'
              }
            }
          }
        }
      }
    }
  }

  allowTarget(target) {
    return !!target.attrs?.capabilities?.find(({ id }) => id === 'master_slave_merge')
  }
}
