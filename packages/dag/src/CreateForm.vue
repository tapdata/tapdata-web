<template>
  <section class="task-create-page p-5">
    <Form class="task-create-form" :form="form" :scope="scope" v-bind="formProps">
      <SchemaField :schema="schema" :scope="{ ...scope, formStep }" />

      <FormConsumer>
        <template #default="{ form }">
          <div class="form-footer">
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
            <ElButton
              type="primary"
              :disabled="!formStep.allowNext"
              @click="
                () => {
                  formStep.next()
                }
              "
              >下一步</ElButton
            >
            <ElButton @click="handleSubmit">完成</ElButton>
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
    const form = createForm({
      values: {
        nodes: [
          {
            attrs: {}
          },
          {
            attrs: {}
          }
        ]
      }
    })
    const formStep = FormStep.createFormStep()
    return {
      formStep,
      formProps: {
        colon: true,
        // shallow: false,
        layout: 'horizontal',
        labelAlign: 'left',
        labelWidth: 140,
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
              class: 'flex-fill primary',
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
                  'nodes[0]': {
                    type: 'object',
                    properties: {
                      'attrs.source_databaseType': {
                        type: 'string',
                        title: '源端类型',
                        'x-decorator': 'FormItem',
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
                          onSetSelected: '{{useHandleWithForm(handlerSyncDatabaseChange, $form)}}',
                          itemLabel: 'label',
                          itemValue: 'id',
                          itemQuery: 'name',
                          method: '{{loadDatabases}}',
                          params: `{{ {isSource: true, where: {database_type: $values.nodes[0].attrs.source_databaseType}} }}`
                        }
                      }
                    }
                  },
                  'nodes[1]': {
                    type: 'object',
                    properties: {
                      'attrs.target_databaseType': {
                        type: 'string',
                        title: '目标类型',
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        'x-component-props': {
                          filterable: true
                        },
                        'x-reactions': [
                          {
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
                          }
                        ]
                      },
                      connectionId: {
                        type: 'string',
                        title: '目标连接',
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'AsyncSelect',
                        'x-component-props': {
                          onSetSelected: '{{useHandleWithForm(handlerSyncDatabaseChange, $form)}}',
                          itemLabel: 'label',
                          itemValue: 'id',
                          itemQuery: 'name',
                          method: '{{loadDatabases}}',
                          params: `{{ {isTarget: true, where: {database_type: $values.nodes[1].attrs.target_databaseType}} }}`
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
                  bbb: {
                    type: 'string',
                    title: 'AAA',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input'
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
                  ccc: {
                    type: 'string',
                    title: 'AAA',
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'Input'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  methods: {
    handleSubmit() {
      console.log('form', this.form.values) // eslint-disable-line
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
    }
  }
}
</style>
