<template>
  <div class="position-relative flex flex-column gap-4 h-100 min-h-0 rounded-lg overflow-y-auto">
    <SchemaForm v-if="form" :form="form" :schema="schema" :scope="scope" />
    <div
      class="step-footer mt-auto flex align-center position-sticky z-index bottom-0 p-4 border backdrop-filter-light z-10 rounded-lg"
    >
      <el-button @click="handlePrev">{{ $t('public_button_previous') }}</el-button>
      <el-button :loading="starting" type="primary" @click="handleStart">{{
        $t('packages_business_task_start_task')
      }}</el-button>
      <el-divider class="mx-4" direction="vertical"></el-divider>
      <slot name="help"></slot>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'
import { showErrorMessage } from '@tap/business'
import { Message } from 'element-ui'
import { alarmApi, clusterApi, taskApi } from '@tap/api'
import { debounce, merge } from 'lodash'
import { createForm, onFormValuesChange, onFieldValueChange, createEffectHook } from '@formily/core'
import { observable, action, untracked, raw, isObservable, observe, autorun } from '@formily/reactive'
import SchemaForm from '../SchemaForm.vue'
import { defineComponent, inject, nextTick, ref, onBeforeUnmount, computed } from '@vue/composition-api'

// 自定义 Dialog 表单内的 value 变化事件
const onDialogFormValuesChange = createEffectHook('dialog-form-values-change', (payload, form) => listener => {
  listener(payload, form)
})

export default defineComponent({
  name: 'TaskStep',
  components: {
    SchemaForm
  },
  setup(props, { emit, root }) {
    const isDaas = process.env.VUE_APP_PLATFORM === 'DAAS'
    const taskRef = inject('task')
    const pageVersionRef = inject('pageVersion')
    const lockedFeature = inject('lockedFeature')
    const openLocked = inject('openLocked')
    const scope = {
      lockedFeature,
      $isDaas: isDaas,
      $settings: taskRef.value,
      useAsyncOptions: (service, ...serviceParams) => {
        return field => {
          field.loading = true
          service(...serviceParams).then(
            action.bound(data => {
              field.dataSource = data
              field.loading = false
            })
          )
        }
      },
      async loadAlarmChannels() {
        const channels = await alarmApi.channels()
        const MAP = {
          system: { label: i18n.t('packages_dag_migration_alarmpanel_xitongtongzhi'), value: 'SYSTEM' },
          email: { label: i18n.t('packages_dag_migration_alarmpanel_youjiantongzhi'), value: 'EMAIL' }
        }
        const options = []
        if (!isDaas) {
          let isOpenid = window.__USER_INFO__?.openid
          Object.assign(MAP, {
            wechat: {
              label: i18n.t('packages_business_notify_webchat_notification'),
              value: 'WECHAT',
              disabled: !isOpenid
            },
            sms: { label: i18n.t('packages_business_notify_sms_notification'), value: 'SMS' }
          })
        }

        for (const channel of channels) {
          const option = MAP[channel.type]

          if (!option) continue

          options.push(option)
        }

        return options
      },
      checkCrontabExpressionFlag: value => {
        return new Promise(resolve => {
          handleCheckCrontabExpressionFlag(resolve, value)
        })
      },
      checkName: value => {
        return new Promise(resolve => {
          handleCheckName(resolve, value)
        })
      },

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
      },

      getConnectionNameByAgent: field => {
        console.log('accessNodeProcessIdMap', accessNodeProcessIdMap.value)
        // 消费收集下 field.dataSource 的依赖，当选项改变时重新执行该方法
        if (!field.value || !field.dataSource?.length || !accessNodeProcessIdMap.value[field.value]) {
          field.setDescription('')
          return
        }

        const map = {
          [taskRef.value.dag.nodes[0].connectionId]: taskRef.value.dag.nodes[0].attrs.connectionName,
          [taskRef.value.dag.nodes[3].connectionId]: taskRef.value.dag.nodes[3].attrs.connectionName
        }

        const values = Object.values(map)

        field.setDescription(values.length ? `${i18n.t('packages_dag_agent_setting_from')}: ${values.join(', ')}` : '')
      }
    }

    let repeatNameMessage = i18n.t('packages_dag_task_form_error_name_duplicate')
    const handleCheckName = debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value
          // id
        })
        .then(data => {
          resolve(data)
        })
    }, 500)

    const form = ref(null)
    const starting = ref(false)

    console.log('taskRef', taskRef)

    const loadAccessNode = async () => {
      const data = await clusterApi.findAccessNodeInfo()
      const mapNode = item => ({
        value: item.processId,
        label: `${item.agentName || item.hostName}（${
          item.status === 'running' ? i18n.t('public_status_running') : i18n.t('public_agent_status_offline')
        }）`,
        disabled: item.status !== 'running',
        accessNodeType: item.accessNodeType
      })
      scope.$agents = data.map(item => {
        if (item.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP') {
          return {
            value: item.processId,
            label: `${item.accessNodeName}（${i18n.t('public_status_running')}：${
              item.accessNodes?.filter(ii => ii.status === 'running').length || 0
            }）`,
            accessNodeType: item.accessNodeType,
            children: item.accessNodes?.map(mapNode) || []
          }
        }
        return mapNode(item)
      })
      scope.$agentMap = data.reduce((obj, item) => ((obj[item.processId] = item), obj), {})
    }

    const initTaskAgent = () => {
      const size = accessNodeProcessIdArr.value.length
      if (size >= 1) {
        let currentId = taskRef.value.accessNodeProcessId
        currentId =
          currentId && accessNodeProcessIdArr.value.includes(currentId) ? currentId : accessNodeProcessIdArr.value[0]
        taskRef.value.accessNodeType = scope.$agentMap[currentId]?.accessNodeType || 'MANUALLY_SPECIFIED_BY_THE_USER'
        taskRef.value.accessNodeProcessId = currentId

        if (taskRef.value.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP') {
          const nodeIds = accessNodeProcessIdMap.value[currentId]
          let priorityProcessId = null

          nodeIds.some(id => {
            const node = taskRef.value.dag.nodes.find(node => node.id === id)
            if (node && node.attrs.priorityProcessId) {
              priorityProcessId = node.attrs.priorityProcessId
              return true
            }
          })

          taskRef.value.priorityProcessId = priorityProcessId
        }
      }

      form.value.setFieldState('*(accessNodeType,accessNodeProcessId)', {
        disabled: size === 1
      })

      form.value.setFieldState('accessNodeProcessId', {
        dataSource: accessNodeProcessList.value
      })
    }

    let checkCrontabExpressionFlagMessage = i18n.t('packages_dag_task_form_error_can_not_open_crontab_expression_flag')
    const handleCheckCrontabExpressionFlag = debounce(function (resolve, value) {
      taskApi.checkCheckCloudTaskLimit(props.task.id).then(data => {
        resolve(data)
      })
    }, 500)

    const accessNodeProcessIdMap = computed(() => {
      return [taskRef.value.dag.nodes[0], taskRef.value.dag.nodes[3]].reduce((map, node) => {
        const { accessNodeProcessId } = node.attrs
        if (accessNodeProcessId) {
          let nodeIdArr = map[accessNodeProcessId]

          if (!nodeIdArr) {
            nodeIdArr = map[accessNodeProcessId] = []
          }

          nodeIdArr.push(node.id)
        }
        return map
      }, {})
    })

    const accessNodeProcessIdArr = computed(() => {
      return Object.keys(accessNodeProcessIdMap.value)
    })

    const accessNodeProcessList = computed(() => {
      const agents = scope.$agents.filter(item => item.accessNodeType === taskRef.value.accessNodeType)
      if (!accessNodeProcessIdArr.value.length) return agents
      return agents.filter(item => !!accessNodeProcessIdMap.value[item.value])
    })

    const schema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          'x-hidden': true
        },
        div: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4 mb-4'
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4'
              },
              'x-content': i18n.t('public_basic_settings')
            },
            dag: {
              type: 'object',
              properties: {
                type: {
                  title: i18n.t('packages_dag_task_setting_sync_type'),
                  type: 'string',
                  'x-display': 'hidden',
                  'x-decorator': 'FormItem',
                  'x-component': 'Radio.Group',
                  default: 'initial_sync+cdc',
                  enum: [
                    {
                      label: i18n.t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
                      value: 'initial_sync+cdc'
                    },
                    {
                      label: i18n.t('public_task_type_initial_sync'), //全量
                      value: 'initial_sync'
                    },
                    {
                      label: i18n.t('public_task_type_cdc'), //增量
                      value: 'cdc'
                    }
                  ]
                },

                'nodes[3]': {
                  type: 'object',
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
                                visible: '{{!!$deps[0]}}'
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
                                visible: '{{!!$deps[0]}}'
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
                              'x-component-props': {
                                formValues: '{{$values.dag.nodes[0]}}'
                              },
                              'x-reactions': [
                                {
                                  dependencies: ['.ddlConfiguration'],
                                  fulfill: {
                                    state: {
                                      visible: '{{$deps[0] === "SYNCHRONIZATION"}}'
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
                                  'x-component': 'Switch'
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
                                  },
                                  'x-reactions': {
                                    dependencies: ['.enableConcurrentRead'],
                                    fulfill: {
                                      state: {
                                        visible: '{{!!$deps[0]}}'
                                      }
                                    }
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
                        },
                        tab4: {
                          type: 'void',
                          'x-component': 'FormCollapse.Item',
                          'x-component-props': {
                            title: i18n.t('packages_dag_nodes_database_ddLshijian')
                          },
                          properties: {
                            ddlEvents: {
                              type: 'void',
                              'x-component': 'DdlEventList',
                              'x-component-props': {
                                formValues: '{{$values.dag.nodes[3]}}',
                                hideParent: true,
                                findParentNodes: '{{findParentNodes}}'
                              }
                            }
                          }
                        },
                        tab5: {
                          type: 'void',
                          'x-component': 'FormCollapse.Item',
                          'x-component-props': {
                            title: i18n.t('packages_dag_config_data_write')
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
                                    },
                                    {
                                      label: i18n.t('packages_dag_just_insert'),
                                      value: 'just_insert'
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
                                    },
                                    {
                                      label: i18n.t('packages_dag_nodes_database_bucunzaishidayinrizhi'),
                                      value: 'log_on_nonexists'
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
                                dependencies: ['.writeStrategy'],
                                fulfill: {
                                  state: {
                                    display: '{{$deps[0] === "appendWrite" ? "hidden":"visible"}}'
                                  }
                                }
                              }
                            },
                            syncIndexEnable: {
                              title: i18n.t('packages_dag_syncIndex'),
                              type: 'boolean',
                              'x-decorator': 'FormItem',
                              'x-decorator-props': {
                                className: 'item-control-horizontal',
                                layout: 'horizontal'
                              },
                              'x-component': 'Switch',
                              'x-component-props': {
                                confirm: {
                                  title: i18n.t('packages_dag_syncIndexTip')
                                }
                              },
                              'x-reactions': {
                                fulfill: {
                                  state: {
                                    visible: '{{$settings.type !== "cdc"}}',
                                    description: `{{$self.value ? '${i18n.t('packages_dag_syncIndex_desc')}' : ''}}`
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
        },

        div1: {
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
              'x-content': i18n.t('public_advanced_settings')
            },
            config: {
              type: 'void',
              properties: {
                skipErrorEvent: {
                  type: 'object',
                  'x-component': 'FormContent',
                  properties: {
                    errorMode: {
                      type: 'string',
                      title: i18n.t('packages_dag_migration_settingpanel_dangdanbiaotongbu'),
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: i18n.t('public_select_placeholder')
                      },
                      default: 'Disable',
                      enum: [
                        // {
                        //   label: '直接跳过异常的表，任务继续运行 ',
                        //   value: 'SkipTable'
                        // },
                        {
                          label: i18n.t('packages_dag_migration_settingpanel_anzhaomorenzhong'),
                          value: 'Disable'
                        },
                        {
                          label: i18n.t('packages_dag_migration_settingpanel_tiaoguoyichangshi'),
                          value: 'SkipData'
                        }
                      ]
                    },
                    limitMode: {
                      type: 'string',
                      title: i18n.t('packages_dag_migration_settingpanel_renwutiaoguoshi'),
                      'x-decorator': 'FormItem',
                      'x-component': 'Select',
                      'x-component-props': {
                        placeholder: i18n.t('public_select_placeholder')
                      },
                      default: 'SkipByLimit',
                      enum: [
                        // {
                        //   label: i18n.t('packages_dag_migration_settingpanel_zhidingtiaoguoce'),
                        //   value: 'Disable'
                        // },
                        {
                          label: i18n.t('packages_dag_migration_settingpanel_dangtiaoguoshijian2'),
                          value: 'SkipByRate'
                        },
                        {
                          label: i18n.t('packages_dag_migration_settingpanel_dangtiaoguoshijian'),
                          value: 'SkipByLimit'
                        }
                      ],
                      'x-reactions': {
                        dependencies: ['.errorMode'],
                        fulfill: {
                          state: {
                            display: '{{$deps[0] === "SkipData" ? "visible" : "hidden"}}'
                          }
                        }
                      }
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
                            addonAfter: i18n.t('packages_dag_migration_settingpanel_shirenwubaocuo')
                          },
                          'x-component': 'InputNumber',
                          default: 1,
                          'x-component-props': {
                            precision: 0,
                            min: 1
                          }
                        }
                      },
                      'x-reactions': {
                        dependencies: ['.errorMode', '.limitMode'],
                        fulfill: {
                          state: {
                            display: '{{$deps[0] === "SkipData" && $deps[1] === "SkipByLimit" ? "visible" : "hidden"}}'
                          }
                        }
                      }
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
                            addonAfter: '% ' + i18n.t('packages_dag_migration_settingpanel_shirenwubaocuo')
                          },
                          'x-component': 'InputNumber',
                          default: 1,
                          'x-component-props': {
                            precision: 0,
                            min: 1,
                            max: 100
                          }
                        }
                      },
                      'x-reactions': {
                        dependencies: ['.errorMode', '.limitMode'],
                        fulfill: {
                          state: {
                            display: '{{$deps[0] === "SkipData" && $deps[1] === "SkipByRate" ? "visible" : "hidden"}}'
                          }
                        }
                      }
                    }
                  }
                },
                planStartDateFlag: {
                  title: i18n.t('packages_dag_task_setting_plan_start_date'), //计划时间
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-component': 'Switch',
                  default: false
                },
                planStartDate: {
                  type: 'string',
                  'x-decorator': 'FormItem',
                  required: true,
                  'x-component': 'DatePicker',
                  'x-component-props': {
                    type: 'datetime',
                    align: 'right',
                    format: 'yyyy-MM-dd HH:mm:ss',
                    valueFormat: 'timestamp'
                  },
                  'x-reactions': {
                    dependencies: ['.planStartDateFlag'],
                    fulfill: {
                      state: {
                        display: '{{$deps[0] ? "visible" : "hidden"}}'
                      }
                    }
                  }
                },
                crontabExpressionFlag: {
                  //调度表达式
                  title: i18n.t('packages_dag_task_setting_crontabExpressionFlag'), //定期调度任务
                  type: 'boolean',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_task_setting_cron_tip')
                  },
                  'x-component': 'Switch',
                  default: false,
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        display: '{{$deps[0] !== "cdc" ? "visible" : "hidden"}}'
                      }
                    }
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
                  }}}`
                },
                crontabExpression: {
                  type: 'string',
                  required: true,
                  'x-validator': {
                    cron: true,
                    message: i18n.t('packages_dag_migration_settingpanel_cronbiao')
                  },
                  'x-decorator': 'FormItem',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: i18n.t('packages_dag_task_setting_cron_expression')
                  },
                  description: i18n.t('packages_dag_task_setting_cron_tip'),
                  'x-reactions': {
                    dependencies: ['type', '.crontabExpressionFlag'],
                    fulfill: {
                      state: {
                        display: '{{$deps[0] !== "cdc" && $deps[1] ? "visible" : "hidden"}}'
                      }
                    }
                  }
                },
                syncPoints: {
                  title: i18n.t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
                  type: 'array',
                  default: [{ type: 'current', date: '' }],
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_task_setting_syncPoint_tip'),
                    feedbackLayout: 'none'
                  },
                  'x-component': 'SyncPoints',
                  'x-decorator': 'FormItem',
                  'x-reactions': {
                    dependencies: ['.type'],
                    fulfill: {
                      state: {
                        display: '{{$deps[0] === "cdc" ? "visible" : "hidden"}}'
                      }
                    }
                  }
                },
                syncPointsDescWrap: {
                  type: 'void',
                  'x-component': 'div',
                  'x-component-props': {
                    class: 'flex align-center gap-2'
                  },
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        visible: '{{$deps[0] === "cdc" && !!$values.currentEventTimestampLabel}}'
                      }
                    }
                  },
                  properties: {
                    syncPointsDesc: {
                      type: 'void',
                      'x-component': 'div',
                      'x-component-props': {
                        style: {
                          color: '#909399'
                        }
                      },
                      'x-content': `{{'${i18n.t(
                        'packages_dag_task_setting_syncPoint_recent_increment'
                      )}: ' + $values.currentEventTimestampLabel}}`
                    },
                    syncPointsDescBtn: {
                      type: 'void',
                      'x-component': 'Link',
                      'x-component-props': {
                        type: 'primary',
                        onClick: '{{handleQuicklySyncPoints}}'
                      },
                      'x-content': i18n.t('packages_dag_task_setting_syncPoint_from_now')
                    }
                  }
                },
                shareCdcEnable: {
                  title: i18n.t('packages_dag_connection_form_shared_mining'), //共享挖掘日志过滤
                  type: 'boolean',
                  default: false,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_business_connection_form_shared_mining_tip')
                  },
                  'x-component': 'Switch',
                  'x-reactions': {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        visible: '{{$deps[0] !== "initial_sync" && !lockedFeature.sharedMiningList}}' // 只有增量或全量+增量支持
                      }
                    }
                  }
                },
                enforceShareCdc: {
                  title: i18n.t('packages_dag_migration_settingpanel_danggongxiangwajue'),
                  type: 'string',
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_migration_settingpanel_danggongxiangwajuetooltip')
                  },
                  'x-component': 'Select',
                  default: true,
                  enum: [
                    {
                      label: i18n.t('packages_dag_migration_settingpanel_renwuzhijiebao'),
                      value: true
                    },
                    {
                      label: i18n.t('packages_dag_migration_settingpanel_zhuanweiputongC'),
                      value: false
                    }
                  ],
                  'x-reactions': {
                    dependencies: ['shareCdcEnable'],
                    fulfill: {
                      state: {
                        visible: '{{!!$deps[0]}}'
                      }
                    }
                  }
                },
                dynamicAdjustMemoryUsage: {
                  title: i18n.t('packages_dag_dynamicAdjustMemoryUsage_title'),
                  type: 'boolean',
                  default: !isDaas,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_dynamicAdjustMemoryUsage_tip')
                  },
                  'x-component': 'Switch'
                },
                isAutoInspect: {
                  title: i18n.t('packages_dag_task_list_verify'),
                  type: 'boolean',
                  default: true,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_migration_settingpanel_dangrenwufuhe')
                  },
                  'x-component': 'Switch',
                  'x-reactions': {
                    fulfill: {
                      state: {
                        visible: '{{$values.syncType === "migrate"}}'
                      }
                    }
                  }
                },
                enableSyncMetricCollector: {
                  title: i18n.t('packages_dag_enableSyncMetricCollector_title'), // 同步指标收集
                  type: 'boolean',
                  default: false,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_enableSyncMetricCollector_tip')
                  },
                  'x-component': 'Switch'
                },
                doubleActive: {
                  title: i18n.t('packages_dag_doubleActive'), // 双活
                  type: 'boolean',
                  default: false,
                  'x-decorator': 'FormItem',
                  'x-decorator-props': {
                    tooltip: i18n.t('packages_dag_doubleActive_tip')
                  },
                  'x-component': 'Switch'
                },
                accessNodeType: {
                  type: 'string',
                  title: i18n.t('packages_dag_connection_form_access_node'),
                  default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                  'x-decorator': 'FormItem',
                  'x-component': 'Select',
                  enum: [
                    {
                      label: i18n.t('packages_dag_connection_form_automatic'),
                      value: 'AUTOMATIC_PLATFORM_ALLOCATION'
                    },
                    {
                      label: i18n.t('packages_dag_connection_form_manual'),
                      value: 'MANUALLY_SPECIFIED_BY_THE_USER'
                    },
                    {
                      label: i18n.t('packages_business_connection_form_group'),
                      value: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
                    }
                  ],
                  'x-reactions': [
                    {
                      fulfill: {
                        state: {
                          dataSource: `{{$isDaas ? $self.dataSource : $self.dataSource.slice(0,2)}}`
                        }
                      }
                    },
                    {
                      target: 'accessNodeProcessId',
                      effects: ['onFieldInputValueChange'],
                      fulfill: {
                        state: {
                          value: ''
                          // '{{$target.value || (item = $target.dataSource.find(item => !item.disabled), item ? item.value:undefined)}}'
                        }
                      }
                    }
                  ]
                },
                agentWrap: {
                  type: 'void',
                  'x-component': 'Space',
                  'x-component-props': {
                    class: 'w-100 align-items-start'
                  },
                  'x-reactions': {
                    dependencies: ['.accessNodeType'],
                    fulfill: {
                      state: {
                        visible:
                          "{{['MANUALLY_SPECIFIED_BY_THE_USER', 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'].includes($deps[0])}}"
                      }
                    }
                  },
                  properties: {
                    accessNodeProcessId: {
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        class: 'flex-1'
                      },
                      'x-component': 'Select',
                      'x-reactions': [
                        '{{getConnectionNameByAgent}}',
                        // 根据下拉数据判断是否存在已选的agent
                        {
                          dependencies: ['.accessNodeType', '.accessNodeOption#dataSource'],
                          fulfill: {
                            state: {
                              title: `{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0] ? '${i18n.t(
                                'packages_business_choose_agent_group'
                              )}': '${i18n.t('packages_business_choose_agent')}'}}`
                            }
                          }
                        }
                      ]
                    },
                    priorityProcessId: {
                      title: i18n.t('packages_business_priorityProcessId'),
                      type: 'string',
                      default: '',
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        class: 'flex-1'
                      },
                      'x-component': 'Select',
                      'x-reactions': {
                        dependencies: ['.accessNodeType', '.accessNodeProcessId#dataSource', '.accessNodeProcessId'],
                        fulfill: {
                          state: {
                            visible: "{{'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' === $deps[0]}}"
                          },
                          run: `
                                          let children = []

                                          if ($deps[1] && $deps[2]) {
                                            children = $deps[1].find(item => item.accessNodeType === $deps[0] && item.value === $deps[2]).children || []
                                          }

                                          $self.dataSource = [
                                            {
                                              label:'${i18n.t('packages_business_connection_form_automatic')}',
                                              value: ''
                                            }
                                          ].concat(children)

                                          if ($self.value && !children.find(item => item.value === $self.value)) {
                                            $self.value = null
                                          }
                                        `
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },

        alarm: {
          type: 'void',
          'x-component': 'div',
          'x-component-props': {
            class: 'bg-white rounded-lg p-4 mt-4'
          },
          properties: {
            title: {
              'x-component': 'div',
              'x-component-props': {
                class: 'title-prefix-bar mb-4'
              },
              'x-content': i18n.t('packages_dag_migration_configpanel_gaojingshezhi')
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
                  unit: 'SECOND'
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_FULL_COMPLETE',
                  sort: 3,
                  notify: ['SYSTEM'],
                  interval: 1,
                  unit: 'SECOND'
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_START',
                  sort: 4,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND'
                },
                {
                  type: 'TASK',
                  open: isDaas,
                  key: 'TASK_INCREMENT_DELAY',
                  sort: 6,
                  notify: ['SYSTEM', 'EMAIL'],
                  interval: 300,
                  unit: 'SECOND'
                }
              ]
            },
            alarmRules: {
              type: 'array',
              'x-editable': true,
              default: [
                {
                  key: 'TASK_INCREMENT_DELAY',
                  point: 60,
                  equalsFlag: 1,
                  ms: 60000
                }
              ]
            },
            'alarmSettings.0.open': {
              title: i18n.t('packages_dag_migration_alarmpanel_renwuyunxingchu'),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[0].notify.length && ($values.alarmSettings[0].notify=["SYSTEM"]))}}`
              }
            },
            'alarmSettings.0.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[0].open=false))}}`
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
            },
            'alarmSettings.1.open': {
              title: i18n.t('packages_dag_migration_alarmpanel_renwuquanliangwan'),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[1].notify.length && ($values.alarmSettings[1].notify=["SYSTEM"]))}}`
              }
            },
            'alarmSettings.1.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[1].open=false))}}`
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
            },
            'alarmSettings.2.open': {
              title: i18n.t('packages_dag_migration_alarmpanel_renwuzengliangkai'),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[2].notify.length && ($values.alarmSettings[2].notify=["SYSTEM"]))}}`
              }
            },
            'alarmSettings.2.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[2].open=false))}}`
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
            },
            'alarmSettings.3.open': {
              title: i18n.t('packages_dag_migration_alarmpanel_renwuzengliangyan'),
              type: 'boolean',
              default: true,
              'x-editable': true,
              'x-decorator': 'FormItem',
              'x-component': 'Switch',
              'x-component-props': {
                onChange: `{{val=>(val && !$values.alarmSettings[3].notify.length && ($values.alarmSettings[3].notify=["SYSTEM"]))}}`
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
            'alarmSettings.3.notify': {
              type: 'array',
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox.Group',
              'x-component-props': {
                onChange: `{{val=>(!val.length && ($values.alarmSettings[3].open=false))}}`
              },
              default: ['SYSTEM', 'EMAIL'],
              'x-editable': true,
              'x-reactions': ['{{useAsyncOptions(loadAlarmChannels)}}']
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
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 12) < 1 ? 1 : Math.ceil($deps[0] * 12): $self.value}}`
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
                  },
                  'x-reactions': [
                    {
                      dependencies: ['.point'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 12) < 1 ? 1 : Math.ceil($deps[0] / 12) : $self.value}}`
                        }
                      }
                    }
                  ]
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
                          value: `{{!isNaN($deps[0]) ? Math.ceil($deps[0] * 1000) < 1 ? 1 : Math.ceil($deps[0] * 1000) : $self.value}}`
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
                  },
                  'x-reactions': [
                    {
                      dependencies: ['.ms'],
                      fulfill: {
                        state: {
                          value: `{{isNaN($self.value) ? Math.ceil($deps[0] / 1000) < 1 ? 1 : Math.ceil($deps[0] / 1000) : $self.value}}`
                        }
                      }
                    }
                  ]
                },
                unit: {
                  title: 's',
                  type: 'void',
                  default: 0,
                  'x-editable': true,
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
    }

    const onTaskChange = debounce(async () => {
      const data = await taskApi.patch(
        {
          ...taskRef.value,
          // id: taskRef.value.id,
          // editVersion: taskRef.value.editVersion,
          pageVersion: pageVersionRef.value
          // dag: taskRef.value.dag
        },
        {
          silenceMessage: true
        }
      )

      // 防止触发 FormValuesChange
      // const rawObj = raw(taskRef.value)
      taskRef.value.editVersion = data.editVersion

      console.log('onTaskChange')
    }, 100)

    let dispose

    const systemTimeZone = computed(() => {
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
      return systemTimeZone
    })

    const initForm = async () => {
      await loadAccessNode()
      const task = taskRef.value

      const timeZone = systemTimeZone.value
      const oldPoints = task.syncPoints
      const oldPointsMap = oldPoints?.length
        ? oldPoints.reduce((map, point) => {
            if (point.nodeId) map[point.nodeId] = point
            return map
          }, {})
        : {}
      const syncPoints = [task.dag.nodes[0]]
        .map(node => ({
          nodeId: node.id,
          nodeName: node.name,
          hiddenPointType: node?.cdcMode === 'polling', //源节点开启了日志轮询则禁用增量采集时刻配置
          connectionId: node.connectionId,
          connectionName: node.attrs.connectionName
        }))
        .map(item => {
          const old = oldPointsMap[item.nodeId]
          const point = {
            ...item,
            timeZone,
            pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
            dateTime: ''
          }
          if (old && !item.hiddenPointType) {
            Object.assign(point, {
              pointType: old.pointType,
              dateTime: old.dateTime
            })
          }
          return point
        })

      task.syncPoints = syncPoints

      scope.$taskId = task.id
      form.value = createForm({
        values: task
      })

      initTaskAgent()

      // 防止挂载表单时触发valueChange
      setTimeout(() => {
        // dispose = observe(taskRef.value, () => {
        //   console.log('observe.task')
        //   onTaskChange()
        // })

        form.value.addEffects('watchForm', () => {
          // onFormValuesChange(form => {
          //   // onTaskChange()
          //   console.log('onFormValuesChange', form.values)
          // })
          onFieldValueChange('*', field => {
            onTaskChange()
            console.log('onFieldValueChange', field)
          })

          onDialogFormValuesChange((payload, form) => {
            onTaskChange()
            console.log('onDialogFormValuesChange')
          })
        })
      }, 100)
    }

    initForm()

    const handlePrev = () => {
      emit('prev')
    }

    const handleNext = () => {
      emit('next')
    }

    const handleError = (error, msg = i18n.t('packages_dag_src_editor_chucuole')) => {
      const code = error?.data?.code
      if (code === 'Task.ListWarnMessage') {
        let names = []
        if (error.data?.data) {
          const keys = Object.keys(error.data.data)
          keys.forEach(key => {
            const node = taskRef.value.dag.nodes.find(({ id }) => id === key)
            if (node) {
              names.push(node.name)
            }
          })
          if (!names.length && keys.length && msg) {
            // 兼容错误信息id不是节点id的情况
            const msg = error.data.data[keys[0]][0]?.msg
            if (msg) {
              Message.error(msg)
              return
            }
          }
        }
      } else if (code === 'Task.OldVersion') {
        root
          .$confirm('', i18n.t('packages_dag_task_old_version_confirm'), {
            onlyTitle: true,
            type: 'warning',
            closeOnClickModal: false,
            confirmButtonText: i18n.t('public_button_refresh')
          })
          .then(resFlag => {
            resFlag && location.reload()
          })
      } else if (['Task.ScheduleLimit', 'Task.ManuallyScheduleLimit'].includes(code)) {
        // this.handleShowUpgradeDialog(error.data)
      } else {
        showErrorMessage(error?.data)
      }
    }

    const save = async () => {
      // this.isSaving = true
      // const errorMsg = await this.validate()
      // if (errorMsg) {
      //   if (this.destory) return
      //   this.$message.error(errorMsg)
      //   this.isSaving = false
      //   return
      // }

      // if (!this.dataflow.id) {
      //   return this.saveAsNewDataflow()
      // }

      // const data = this.getDataflowDataToSave()
      starting.value = true
      let isOk = false

      try {
        // this.initWS()
        // const result = await taskApi[needStart ? 'saveAndStart' : 'save'](data)
        const result = await taskApi.saveAndStart(taskRef.value, {
          silenceMessage: true
        })
        // this.reformDataflow(result)
        // this.setEditVersion(result.editVersion)
        // this.isSaving = false
        isOk = true

        root.$store.dispatch('setGuideComplete')

        root.$router.push({
          name: 'MigrationMonitorSimple',
          params: {
            id: taskRef.value.id
          }
        })
      } catch (e) {
        handleError(e)
      } finally {
        starting.value = false
      }
      // this.isSaving = false
      // this.toggleConsole(true)
      // this.$refs.console?.startAuto('checkDag') // 信息输出自动加载
      return isOk
    }

    const start = async () => {
      this.buried('migrationStart')

      this.unWatchStatus?.()
      this.unWatchStatus = this.$watch('dataflow.status', v => {
        if (['error', 'complete', 'running', 'stop', 'schedule_failed'].includes(v)) {
          this.$refs.console?.loadData()
          if (v !== 'running') {
            this.$refs.console?.stopAuto()
          } else {
            this.toggleConsole(false)
            this.gotoViewer(false)
          }
          // this.unWatchStatus()
        }
        if (['MigrateViewer'].includes(this.$route.name)) {
          if (['renewing'].includes(v)) {
            this.handleConsoleAutoLoad()
          } else {
            this.toggleConsole(false)
          }
        }
      })

      const hasError = await this.$refs.skipError.checkError(this.dataflow)
      if (hasError) return

      const flag = await this.save(true)
      if (flag) {
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        // this.gotoViewer()
        this.beforeStartTask()
        this.buried('taskSubmit', { result: true })
      } else {
        this.buried('taskSubmit', { result: false })
      }
    }

    const handleStart = () => {
      save()
    }

    onBeforeUnmount(() => {
      console.log('卸载')
      form.value.onUnmount()
      dispose?.()
      dispose = null
    })

    return {
      form,
      schema,
      scope,
      starting,

      handlePrev,
      handleNext,
      handleStart
    }
  }
})
</script>

<style lang="scss" scoped></style>
