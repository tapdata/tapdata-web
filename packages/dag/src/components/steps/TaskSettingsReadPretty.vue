<template>
  <div class="flex flex-column gap-4">
    <SchemaForm :form="form" :schema="schema" :scope="scope" />
  </div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import { createForm, onFieldValueChange } from '@formily/core'
import i18n from '@tap/i18n'
import SchemaForm from '../SchemaForm.vue'

export default defineComponent({
  name: 'TaskReadPretty',
  components: { SchemaForm },
  props: {
    task: Object
  },
  setup(props, { emit, root }) {
    const nodes = root.$store.getters['dataflow/allNodes']
    const form = ref(null)
    const fieldForm = ref(null)
    const schema = {
      type: 'object',
      properties: {
        div: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4'
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4'
              },
              'x-content': '高级设置'
            },
            dag: {
              type: 'object',
              properties: {
                'nodes[3]': {
                  type: 'object',
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
                          run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $values.type === "cdc"}}',
                          state: {
                            description: `{{$values.type === "cdc" ? '${i18n.t(
                              'packages_dag_nodes_database_setting_cdc_changjing_desc'
                            )}':''}}`
                          },
                          schema: {
                            // TODO 根据能力改变dataSource
                            'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`
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
                          'x-component': 'Switch'
                        },
                        initialConcurrentWriteNum: {
                          type: 'number',
                          default: 8,
                          'x-component': 'InputNumber',
                          'x-component-props': {
                            min: 0
                          },
                          'x-reactions': {
                            dependencies: ['.initialConcurrent'],
                            fulfill: {
                              state: {
                                visible: '{{!!$deps[0]]}}'
                              }
                            }
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
                          'x-component': 'Switch'
                        },
                        cdcConcurrentWriteNum: {
                          type: 'number',
                          default: 4,
                          'x-component': 'InputNumber',
                          'x-component-props': {
                            min: 0
                          },
                          'x-reactions': {
                            dependencies: ['.cdcConcurrent'],
                            fulfill: {
                              state: {
                                visible: '{{!!$deps[0]]}}'
                              }
                            }
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
                          default: 100
                        },
                        writeBatchWaitMs: {
                          title: i18n.t('packages_dag_nodes_database_xierumeipizui'), //增量批次读取条数
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'InputNumber',
                          'x-component-props': {
                            min: 1
                          },
                          default: 500
                        }
                      }
                    }
                  }
                },

                'nodes[0]': {
                  type: 'object',
                  properties: {
                    'attrs.capabilities': {
                      type: 'array'
                    },
                    sourceCollapse: {
                      type: 'void',
                      'x-component': 'FormCollapse',
                      'x-component-props': {
                        class: 'advanced-collapse'
                      },
                      properties: {
                        tab1: {
                          type: 'void',
                          'x-component': 'FormCollapse.Item',
                          'x-component-props': {
                            title: i18n.t('packages_dag_config_ddl')
                          },
                          properties: {
                            ddlConfiguration: {
                              type: 'string',
                              default: 'FILTER',
                              enum: [
                                {
                                  label: i18n.t('packages_dag_ddl_stopped_on_error'),
                                  value: 'ERROR'
                                },
                                {
                                  label: i18n.t('packages_dag_ddl_auto_ignore'),
                                  value: 'FILTER'
                                },
                                {
                                  label: i18n.t('packages_dag_ddl_sync_events'),
                                  value: 'SYNCHRONIZATION'
                                }
                              ],
                              'x-decorator': 'FormItem',
                              'x-component': 'Radio.Group',
                              'x-reactions': [
                                {
                                  target: 'disabledEvents',
                                  fulfill: {
                                    state: {
                                      visible: '{{$self.value === "SYNCHRONIZATION"}}'
                                    }
                                  }
                                },
                                {
                                  when: `{{!$values.dag.nodes[0].attrs.capabilities.filter(item => item.type === 10).length}}`,
                                  fulfill: {
                                    state: {
                                      disabled: true,
                                      description: `{{$values.dag.nodes[0].databaseType + ' ${i18n.t(
                                        'packages_dag_nodes_database_value_zanbuzhiciddl'
                                      )}'}}`
                                    }
                                  }
                                }
                              ]
                            },
                            disabledEvents: {
                              type: 'array',
                              'x-component': 'DdlEventCheckbox',
                              'x-reactions': [
                                {
                                  dependencies: ['.ddlConfiguration'],
                                  fulfill: {
                                    state: {
                                      visible: '{{$deps[0].value === "SYNCHRONIZATION"}}'
                                    }
                                  }
                                }
                              ]
                            },
                            ignoredDDLRules: {
                              title: i18n.t('packages_dag_ddl_ignore_rules'),
                              type: 'string',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                tooltip: i18n.t('packages_dag_ddl_ignore_rules_tip')
                              },
                              'x-component': 'Input',
                              'x-component-props': {
                                placeholder: i18n.t('packages_dag_ddl_ignore_rules_placeholder')
                              },
                              'x-reactions': {
                                dependencies: ['ddlConfiguration'],
                                fulfill: {
                                  state: {
                                    visible: '{{$deps[0] === "ERROR"}}'
                                  }
                                }
                              }
                            }
                          }
                        },
                        tab2: {
                          type: 'void',
                          'x-component': 'FormCollapse.Item',
                          'x-component-props': {
                            title: i18n.t('packages_dag_config_data_read')
                          },
                          properties: {
                            sizeSpace: {
                              type: 'void',
                              'x-component': 'Space',
                              'x-component-props': {
                                size: 'middle'
                              },
                              properties: {
                                readBatchSize: {
                                  title: i18n.t('packages_dag_nodes_database_piliangduqutiao'), //全量批次读取条数
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
                                  default: 100
                                },
                                increaseReadSize: {
                                  title: i18n.t('packages_dag_nodes_database_zengliangmeipici'), //增量批次读取条数
                                  type: 'string',
                                  'x-decorator': 'FormItem',
                                  'x-component': 'InputNumber',
                                  'x-component-props': {
                                    min: 1
                                  },
                                  default: 1
                                }
                              }
                            },

                            enableConcurrentReadSpace: {
                              title: i18n.t('packages_dag_enableConcurrentRead'),
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                tooltip: i18n.t('packages_dag_enableConcurrentRead_tips')
                              },
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
                                enableConcurrentRead: {
                                  type: 'boolean',
                                  'x-component': 'Switch',
                                  'x-reactions': {
                                    target: '.concurrentReadThreadNumber',
                                    fulfill: {
                                      state: {
                                        visible: '{{!!$self.value}}'
                                      }
                                    }
                                  }
                                },
                                concurrentReadThreadNumber: {
                                  title: i18n.t('packages_dag_concurrentReadThreadNumber'),
                                  type: 'number',
                                  default: 2,
                                  'x-decorator': 'FormItem',
                                  'x-decorator-props': {
                                    layout: 'horizontal',
                                    feedbackLayout: 'none'
                                  },
                                  'x-component': 'InputNumber',
                                  'x-component-props': {
                                    min: 1
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
                            title: i18n.t('packages_dag_config_breakpoint_resume')
                          },
                          'x-reactions': {
                            fulfill: {
                              state: {
                                display:
                                  '{{$values.dag.nodes[0].attrs.capabilities.some(item => item.id === "get_read_partitions_function") && ($settings.type !== "cdc") ? "visible":"hidden"}}'
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
                                          '{{$values.dag.nodes[0].attrs.capabilities.some(item => item.id === "get_read_partitions_function") ? "visible" :"hidden"}}'
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
                                      run: `{{ $values.dag.nodes[0].splitTyp !== 10 && $values.dag.nodes[0].attrs.capabilities.some(t => t.id === 'count_by_partition_filter_function') && $self.setValue(1) }}`,
                                      state: {
                                        display: '{{$deps[0] ? "visible" :"hidden"}}'
                                      },
                                      schema: {
                                        'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[0].attrs.capabilities.some(item => item.id ==='count_by_partition_filter_function') && options.push($self.dataSource[1]),options}}`
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
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const scope = {
      $settings: props.task,
      findNodeById: id => {
        return root.$store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        let node = scope.findNodeById(id)
        const parents = []

        if (!node) return parents

        let parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach(pid => {
          let parent = scope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach(ppid => {
                parents.push(...scope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      }
    }

    const initForm = () => {
      const task = props.task
      scope.$taskId = task.id

      form.value = createForm({
        readPretty: true,
        values: {
          ...task,
          dag: {
            nodes
          }
        }
      })
    }

    initForm()

    return {
      form,
      fieldForm,
      schema,
      scope
    }
  }
})
</script>

<style scoped lang="scss"></style>
