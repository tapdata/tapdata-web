<template>
  <section class="task-create-page p-5">
    <Form class="task-create-form" :form="form" v-bind="formProps">
      <SchemaField :schema="schema" :scope="formScope" />

      <FormConsumer>
        <template #default>
          <div class="form-footer mt-1">
            <ElButton v-if="!formStep.allowBack">取消</ElButton>
            <ElButton
              v-else
              :disabled="!formStep.allowBack"
              @click="
                () => {
                  formStep.back()
                }
              "
              >上一步</ElButton
            >

            <ElButton v-if="!formStep.allowNext" type="primary" :loading="saving" @click="handleSubmit">完成</ElButton>
            <ElButton
              v-else
              type="primary"
              :disabled="!formStep.allowNext"
              @click="
                () => {
                  formStep.next()
                }
              "
              >下一步</ElButton
            >
          </div>
        </template>
      </FormConsumer>
    </Form>
  </section>
</template>

<script>
import { createForm } from '@formily/core'

import { Form, FormStep, FormConsumer, FormButtonGroup, Button, createSchemaField, components } from '@tap/form'
import formScope from './mixins/formScope'
import * as _components from './components/form'
import i18n from '@tap/i18n'
import { debounce } from 'lodash'
import { taskApi } from '@tap/api'
import { observable } from '@formily/reactive'
import { DEFAULT_SETTINGS } from './constants'
import { uuid } from '@tap/shared'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components
  }
})

export default {
  name: 'CreateForm',
  components: { Form, SchemaField, FormConsumer, FormButtonGroup, Button },

  mixins: [formScope],

  inject: ['buried'],

  data() {
    let repeatNameMessage = this.$t('packages_dag_task_form_error_name_duplicate')
    const task = this.newTask()
    const form = createForm({
      values: task
    })
    const formStep = FormStep.createFormStep()

    return {
      saving: false,

      loading: false,

      task,

      formStep,

      formProps: {
        colon: true,
        // shallow: false,
        layout: 'horizontal',
        labelAlign: 'left',
        labelWidth: 180,
        wrapperWidth: 320
        // feedbackLayout: 'terse'
      },

      form,

      schema: {
        type: 'object',
        properties: {
          collapse: {
            type: 'void',
            'x-component': 'FormStep',
            'x-component-props': {
              formStep: '{{formStep}}',
              class: 'flex-fill primary min-h-0 flex flex-column',
              'align-center': true,
              'process-status': 'process',
              'finish-status': 'success'
              // simple: true
            },
            properties: {
              step1: {
                type: 'void',
                'x-component': 'FormStep.StepPane',
                'x-component-props': {
                  title: '选择连接'
                },
                properties: {
                  dag: {
                    type: 'object',
                    properties: {
                      'nodes[0]': {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string'
                          },
                          'attrs.source_databaseType': {
                            type: 'string',
                            title: '源端类型',
                            enum: [
                              {
                                label: this.$t('packages_business_select_option_all')
                              }
                            ],
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              asterisk: true
                            },
                            'x-component': 'Select',
                            'x-component-props': {
                              filterable: true
                            },
                            'x-reactions': [
                              /*{
                                target: 'nodes[1].attrs.target_databaseType',
                                fulfill: {
                                  state: {
                                    loading: '{{console.log("$self.loading", $self, $self.loading),$self.loading}}',
                                    dataSource: '{{$self.dataSource}}'
                                  }
                                }
                              },*/
                              '{{useAsyncDataSource(loadDatabaseTypes)}}'
                            ]
                          },
                          connectionId: {
                            title: '源端连接',
                            type: 'string',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'AsyncSelect',
                            'x-component-props': {
                              onSetSelected: '{{handleSyncSourceDatabaseChange}}',
                              itemLabel: 'label',
                              itemValue: 'id',
                              itemQuery: 'name',
                              method: '{{loadDatabases}}',
                              params: `{{ {isSource: true, where: {database_type: $values.dag.nodes[0].attrs.source_databaseType}} }}`
                            }
                          }
                        }
                      },
                      'nodes[1]': {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string'
                          },
                          'attrs.target_databaseType': {
                            type: 'string',
                            title: '目标类型',
                            enum: [
                              {
                                label: this.$t('packages_business_select_option_all')
                              }
                            ],
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              asterisk: true
                            },
                            'x-component': 'Select',
                            'x-component-props': {
                              filterable: true
                            },
                            'x-reactions': [
                              '{{useAsyncDataSource(loadDatabaseTypes)}}'
                              /*{
                                dependencies: [
                                  'nodes[0].attrs.target_databaseType#loading',
                                  'nodes[0].attrs.target_databaseType#dataSource'
                                ],
                                fulfill: {
                                  state: {
                                    loading: '{{console.log("$self.loading", $self, $self.loading),$deps[0]}}',
                                    dataSource: '{{$deps[1]}}'
                                  }
                                }
                              }*/
                            ]
                          },
                          connectionId: {
                            type: 'string',
                            title: '目标连接',
                            required: true,
                            'x-decorator': 'FormItem',
                            'x-component': 'AsyncSelect',
                            'x-component-props': {
                              onSetSelected: '{{handleSyncTargetDatabaseChange}}',
                              itemLabel: 'label',
                              itemValue: 'id',
                              itemQuery: 'name',
                              method: '{{loadDatabases}}',
                              params: `{{ {isTarget: true, where: {database_type: $values.dag.nodes[1].attrs.target_databaseType}} }}`
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              step2: {
                type: 'void',
                'x-component': 'FormStep.StepPane',
                'x-component-props': {
                  title: '选择表'
                },
                properties: {
                  'dag.nodes[0].tableNames': {
                    type: 'array',
                    required: true,
                    default: [],
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      className: 'table-selector-wrap flex-fill min-h-0',
                      wrapperWidth: '100%'
                    },
                    'x-component': 'TableSelector',
                    'x-component-props': {
                      connectionId: '{{$values.dag.nodes[0].connectionId}}',
                      style: {
                        flex: 1
                      }
                    }
                  }
                }
              },
              step3: {
                type: 'void',
                'x-component': 'FormStep.StepPane',
                'x-component-props': {
                  title: '设置任务属性'
                },
                properties: {
                  layout: {
                    type: 'void',
                    'x-component': 'div',
                    'x-component-props': {
                      class: 'overflow-auto'
                    },
                    properties: {
                      name: {
                        title: this.$t('packages_dag_task_stetting_name'), //任务名称
                        type: 'string',
                        required: 'true',
                        'x-decorator': 'FormItem',
                        'x-component': 'Input',
                        'x-validator': `{{(value) => {
                    return value && new Promise((resolve) => {
                      checkName(value).then(data => {
                        if(data === true) {
                          resolve('${repeatNameMessage}')
                        } else {
                          resolve()
                        }
                      })
                    })
                  }}}`
                      },
                      type: {
                        title: this.$t('packages_dag_task_setting_sync_type'),
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-decorator-props': {
                          // feedbackLayout: 'none'
                        },
                        'x-component': 'Radio.Group',
                        'x-component-props': {
                          optionType: 'button'
                        },
                        default: 'initial_sync+cdc',
                        enum: [
                          {
                            label: this.$t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
                            value: 'initial_sync+cdc'
                          },
                          {
                            label: this.$t('packages_dag_task_setting_initial_sync'), //全量
                            value: 'initial_sync'
                          },
                          {
                            label: this.$t('packages_dag_task_setting_cdc'), //增量
                            value: 'cdc'
                          }
                        ]
                      },
                      planStartDateFlag: {
                        title: this.$t('packages_dag_task_setting_plan_start_date'), //计划时间
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: false,
                        target: '*(syncPoints)',
                        fulfill: {
                          state: {
                            visible: '{{$self.value}}'
                          }
                        }
                      },
                      planStartDate: {
                        type: 'string',
                        'x-decorator': 'FormItem',
                        required: 'true',
                        'x-component': 'DatePicker',
                        'x-component-props': {
                          type: 'datetime',
                          align: 'right',
                          format: 'yyyy-MM-dd HH:mm:ss',
                          valueFormat: 'timestamp'
                        },
                        'x-reactions': {
                          dependencies: ['planStartDateFlag'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      crontabExpressionFlag: {
                        //调度表达式
                        title: this.$t('packages_dag_task_setting_crontabExpressionFlag'), //定期调度任务
                        type: 'boolean',
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        default: false,
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      crontabExpression: {
                        type: 'string',
                        required: 'true',
                        'x-validator': {
                          cron: true,
                          message: 'Cron表达式格式有误'
                        },
                        'x-decorator': 'FormItem',
                        'x-component': 'Input.TextArea',
                        'x-component-props': {
                          placeholder: this.$t('packages_dag_task_setting_cron_expression')
                        },
                        'x-decorator-props': {
                          tooltip: this.$t('packages_dag_task_setting_cron_tip')
                        },
                        'x-reactions': {
                          dependencies: ['type', 'crontabExpressionFlag'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "initial_sync" && $deps[1] ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      syncPoints: {
                        title: this.$t('packages_dag_task_setting_sync_point'), //增量采集开始时刻
                        type: 'array',
                        default: [{ type: 'current', date: '' }],
                        'x-decorator-props': {
                          tooltip: this.$t('packages_dag_task_setting_syncPoint_tip')
                        },
                        'x-component': 'ArrayItems',
                        'x-decorator': 'FormItem',
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0] === "cdc" ? "visible" : "hidden"}}'
                            }
                          }
                        },
                        items: {
                          type: 'object',
                          properties: {
                            pointType: {
                              type: 'string',
                              'x-component': 'Select',
                              'x-component-props': {
                                placeholder: i18n.t('packages_dag_components_formpanel_qingxuanze'),
                                style: 'margin-bottom:10px'
                              },
                              default: 'current',
                              enum: [
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_localTZType'),
                                  value: 'localTZ'
                                },
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_connTZType'),
                                  value: 'connTZ'
                                },
                                {
                                  label: this.$t('packages_dag_dataFlow_SyncInfo_currentType'),
                                  value: 'current'
                                }
                              ]
                            },
                            dateTime: {
                              type: 'string',
                              required: 'true',
                              'x-component': 'DatePicker',
                              'x-component-props': {
                                type: 'datetime',
                                format: 'yyyy-MM-dd HH:mm:ss',
                                valueFormat: 'timestamp'
                              },
                              'x-reactions': {
                                dependencies: ['.pointType'],
                                fulfill: {
                                  state: {
                                    visible: '{{$deps[0] !== "current"}}'
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      shareCdcEnable: {
                        title: this.$t('packages_dag_connection_form_shared_mining'), //共享挖掘日志过滤
                        type: 'boolean',
                        default: false,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              visible: '{{$deps[0] !== "initial_sync" && $values.isDaas}}' // 只有增量或全量+增量支持
                            }
                          }
                        }
                      },
                      isAutoInspect: {
                        title: this.$t('packages_dag_task_list_verify'),
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
                      increSyncConcurrency: {
                        title: this.$t('packages_dag_task_setting_cdc_concurrency'),
                        type: 'boolean',
                        default: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Switch',
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      increHysteresisSpace: {
                        type: 'void',
                        title: this.$t('packages_dag_task_setting_lag_time'),
                        'x-decorator': 'FormItem',
                        'x-component': 'Space',
                        properties: {
                          increHysteresis: {
                            type: 'boolean',
                            'x-component': 'Switch'
                          },
                          hysteresisInterval: {
                            type: 'number',
                            'x-decorator': 'FormItem',
                            'x-decorator-props': {
                              feedbackLayout: 'none',
                              addonAfter: i18n.t('packages_dag_dag_data_setting_second')
                            },
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1
                            },
                            'x-reactions': {
                              dependencies: ['.increHysteresis'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0]?"visible":"hidden"}}'
                                }
                              }
                            }
                          }
                        },
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      increOperationModeSpace: {
                        type: 'void',
                        title: this.$t('packages_dag_task_setting_increOperationMode'),
                        'x-decorator': 'FormItem',
                        'x-component': 'Space',
                        properties: {
                          increOperationMode: {
                            type: 'boolean',
                            'x-component': 'Select',
                            enum: [
                              { label: i18n.t('packages_dag_components_formpanel_piliang'), value: false },
                              { label: i18n.t('packages_dag_components_formpanel_zhutiao'), value: true }
                            ]
                          },
                          increaseReadSize: {
                            type: 'number',
                            'x-component': 'InputNumber',
                            'x-component-props': {
                              min: 1
                            },
                            'x-reactions': {
                              dependencies: ['.increOperationMode'],
                              fulfill: {
                                state: {
                                  display: '{{$deps[0]?"visible":"hidden"}}'
                                }
                              }
                            }
                          }
                        },
                        'x-reactions': {
                          dependencies: ['type'],
                          fulfill: {
                            state: {
                              display: '{{$deps[0]!=="initial_sync" ? "visible" : "hidden"}}'
                            }
                          }
                        }
                      },
                      accessNodeType: {
                        type: 'string',
                        title: this.$t('packages_dag_connection_form_access_node'),
                        default: 'AUTOMATIC_PLATFORM_ALLOCATION',
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        enum: [
                          {
                            label: this.$t('packages_dag_connection_form_automatic'),
                            value: 'AUTOMATIC_PLATFORM_ALLOCATION'
                          },
                          {
                            label: this.$t('packages_dag_connection_form_manual'),
                            value: 'MANUALLY_SPECIFIED_BY_THE_USER'
                          }
                        ],
                        'x-reactions': [
                          {
                            target: 'accessNodeProcessId',
                            fulfill: {
                              state: { visible: "{{$self.value==='MANUALLY_SPECIFIED_BY_THE_USER'}}" }
                            }
                          },
                          {
                            target: 'accessNodeProcessId',
                            effects: ['onFieldInputValueChange'],
                            fulfill: {
                              state: {
                                value: '{{$target.value || $target.dataSource[0].value}}'
                              }
                            }
                          }
                        ]
                      },
                      accessNodeProcessId: {
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Select'
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

  computed: {
    /*formScope() {
      return {
        ...this.scope,
        formStep: this.formStep,
        checkName: value => {
          return new Promise(resolve => {
            this.handleCheckName(resolve, value)
          })
        },
        handleSyncSourceDatabaseChange: item => {
          this.syncDatabaseNodeProps(0, item)
        },
        handleSyncTargetDatabaseChange: item => {
          this.syncDatabaseNodeProps(1, item)
        }
      }
    }*/
  },

  watch: {
    $route() {
      this.init(true)
    }
  },

  created() {
    this.formScope = {
      ...this.scope,
      formStep: this.formStep,
      checkName: value => {
        return new Promise(resolve => {
          this.handleCheckName(resolve, value)
        })
      },
      handleSyncSourceDatabaseChange: item => {
        this.syncDatabaseNodeProps(0, item)
      },
      handleSyncTargetDatabaseChange: item => {
        this.syncDatabaseNodeProps(1, item)
      }
    }
    this.handleCheckName = debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value,
          id: this.task?.id
        })
        .then(data => {
          resolve(data)
        })
    }, 500)

    this.init()
  },

  methods: {
    async init(byRoute) {
      const { id } = this.$route.params
      let task
      if (id) {
        task = await this.loadTask(id)
        this.form.setValues(task)
      } else if (byRoute) {
        task = this.newTask()
        this.form.setValues(task)
      }
    },

    syncDatabaseNodeProps(index, item) {
      const form = this.form
      const base = `dag.nodes.${index}.`
      form.setValuesIn(base + 'name', item.name)
      form.setValuesIn(base + 'databaseType', item.databaseType)
      form.setValuesIn(base + 'attrs.pdkType', item.pdkType)
      form.setValuesIn(base + 'attrs.pdkHash', item.pdkHash)
      form.setValuesIn(base + 'attrs.capabilities', item.capabilities)
      form.setValuesIn(base + 'attrs.connectionType', item.connectionType)
      form.setValuesIn(base + 'attrs.accessNodeProcessId', item.accessNodeProcessId)
      form.setValuesIn(base + 'attrs.connectionName', item.name)
    },

    async loadTask(id) {
      this.loading = true
      try {
        const data = await taskApi.get(id)
        if (!data) {
          this.$message.error(i18n.t('packages_dag_mixins_editor_renwubucunzai'))
          this.handlePageReturn()
          return
        }
        data.dag = data.temp || data.dag // 和后端约定了，如果缓存有数据则获取temp
        return data
      } catch (e) {
        this.$message.error(i18n.t('packages_dag_mixins_editor_renwujiazaichu'))
        this.handlePageReturn()
      } finally {
        this.loading = false
      }
    },

    newTask() {
      const source = uuid()
      const target = uuid()
      return {
        ...DEFAULT_SETTINGS,
        id: '',
        name: '',
        status: '',
        dag: {
          edges: [{ source, target }],
          nodes: [
            {
              id: source,
              type: 'database',
              migrateTableSelectType: 'custom',
              attrs: {}
            },
            {
              id: target,
              type: 'database',
              attrs: {}
            }
          ]
        }
      }
    },

    handlePageReturn() {
      this.$router.push({
        name: 'migrateList'
      })
    },

    async handleSubmit() {
      console.log('form', this.form.values) // eslint-disable-line
      this.form.validate().then(async () => {
        this.saving = true
        const task = this.form.values

        if (task.id) {
          await taskApi.patch(task)
        } else {
          await taskApi.post(task)
        }
        this.saving = false
        this.handlePageReturn()
      })
    }
  }
}
</script>

<style scope lang="scss">
.task-create-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #fff;

  .task-create-form {
    height: 100%;
    form {
      display: flex;
      flex-direction: column;
      height: 100%;

      .table-selector-wrap {
        .formily-element-form-item-control {
          display: flex;
          flex-direction: column;
          &-content {
            flex: 1;
            min-height: 0;

            .selector-panel__search input {
              border-color: #d9d9d9;
            }
          }
        }
      }

      .el-input-number {
        width: 180px;
      }
      .el-input-number--small {
        width: 130px;
      }
    }
  }
}
</style>
