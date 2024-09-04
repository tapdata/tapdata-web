import { observer } from '@formily/reactive-vue'
import { RecursionField, SchemaExpressionScopeSymbol } from '@formily/vue'
import { defineComponent, ref, inject } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { taskApi } from '@tap/api'
import { useForm, FormDialog, FormLayout, useFormLayout, createSchemaField, components } from '@tap/form'
import './style.scss'
import { createForm, onFieldValueChange, onFormValuesChange } from '@formily/core'
import * as _components from '../index'
import { useAfterTaskSaved } from '../../../hooks/useAfterTaskSaved'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components
  }
})

const TableEditForm = {
  props: {
    form: Object,
    scope: Object,
    layout: Object
  },
  data() {
    const schema = {
      type: 'object',
      properties: {
        replaceBefore: { type: 'string', 'x-display': 'hidden' },
        replaceAfter: { type: 'string', 'x-display': 'hidden' },
        prefix: { type: 'string', 'x-display': 'hidden' },
        suffix: { type: 'string', 'x-display': 'hidden' },
        transferCase: { type: 'string', 'x-display': 'hidden' },
        tableNames: {
          type: 'array',
          'x-component': 'TableRename',
          'x-component-props': {
            findParentNodes: '{{findParentNodes}}',
            listStyle: {
              maxHeight: 'calc((100vh - 120px) * 0.618)'
            }
          }
        }
      }
    }
    return {
      schema
    }
  },
  render(h) {
    return (
      <FormLayout {...{ props: this.layout }}>
        <SchemaField schema={this.schema} scope={this.scope} />
      </FormLayout>
    )
  }
}

const FieldEditForm = {
  props: {
    form: Object,
    scope: Object,
    layout: Object
  },
  data() {
    const schema = {
      type: 'object',
      properties: {
        fieldsOperation: {
          type: 'object',
          default: {
            prefix: '',
            suffix: '',
            capitalized: ''
          }
        },
        fieldsMapping: {
          type: 'array',
          title: '',
          'x-decorator': 'FormItem',
          'x-component': 'FieldRenameProcessor',
          'x-component-props': {
            nodeId: '{{$values.id}}'
          }
        }
      }
    }
    return {
      schema
    }
  },
  render(h) {
    return (
      <FormLayout {...{ props: this.layout }}>
        <SchemaField schema={this.schema} scope={this.scope} />
      </FormLayout>
    )
  }
}

const SourceDatabaseNode = defineComponent({
  props: {
    value: Object
  },
  setup(props, { attrs, listeners, root }) {
    const formRef = useForm()
    const SchemaExpressionScopeContext = inject(SchemaExpressionScopeSymbol)
    const form = formRef.value
    const typeEnum = ['custom', 'expression']

    console.log('SchemaExpressionScopeContext', SchemaExpressionScopeContext)

    const items = [
      {
        title: i18n.t('packages_dag_nodes_database_anbiaomingxuanze')
      },
      {
        title: i18n.t('packages_dag_nodes_database_anzhengzebiaoda')
      }
    ]

    const setActive = index => {
      form.values.dag.nodes[0].migrateTableSelectType = typeEnum[index]
    }

    const layoutRef = useFormLayout()

    console.log('formRef', formRef)

    const openTableEdit = () => {
      FormDialog(
        {
          title: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
          customClass: 'schema-form-dialog'
        },
        () => <TableEditForm scope={SchemaExpressionScopeContext.value} layout={layoutRef.value}></TableEditForm>
      )
        .forOpen((payload, next) => {
          next({
            values: form.values.dag.nodes[1],
            effects() {
              onFieldValueChange('*', field => {
                form.notify('dialog-form-values-change')
              })
            }
          })
        })
        .forConfirm((payload, next) => {
          next(payload)
        })
        .forCancel((payload, next) => {
          next(payload)
        })
        .open()
        .then(console.log)
        .catch(console.error)
    }

    const openFieldEdit = () => {
      FormDialog(
        {
          title: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
          customClass: 'schema-form-dialog'
        },
        () => <FieldEditForm scope={SchemaExpressionScopeContext.value} layout={layoutRef.value}></FieldEditForm>
      )
        .forOpen((payload, next) => {
          next({
            values: form.values.dag.nodes[2],
            effects() {
              onFieldValueChange('*', field => {
                form.notify('dialog-form-values-change')
              })
            }
          })
        })
        .forConfirm((payload, next) => {
          next(payload)
        })
        .forCancel((payload, next) => {
          next(payload)
        })
        .open()
        .then(console.log)
        .catch(console.error)
    }

    const RightExtra = () => {
      return (
        <div>
          <ElButton type="text" onClick={openTableEdit}>
            {i18n.t('packages_dag_src_migrationeditor_biaobianji')}
          </ElButton>
          <ElButton type="text" onClick={openFieldEdit}>
            {i18n.t('packages_dag_src_migrationeditor_ziduanbianji')}
          </ElButton>
        </div>
      )
    }

    const RightItem = ({ props }) => {
      return <span>{tableMap.value[props.row] || props.row}</span>
    }

    const loading = ref(false)
    const tableMap = ref({})
    const loadTable = (...args) => {
      const taskId = form.values.id
      if (taskId) {
        loading.value = true
        taskApi
          .getNodeTableInfo({
            taskId,
            nodeId: form.values.dag.nodes[1].id,
            page: 1,
            pageSize: 10000
          })
          .then(({ items = [] }) => {
            const map = items.reduce((acc, item) => {
              acc[item.previousTableName] = item.sinkObjectName
              return acc
            }, {})
            tableMap.value = map
          })
          .finally(() => {
            loading.value = false
          })
      }
    }

    loadTable()

    useAfterTaskSaved(root, [], loadTable)

    return () => {
      const active = typeEnum.indexOf(form.values.dag.nodes[0].migrateTableSelectType)

      return (
        <div class="source-database-node p-4 rounded-lg">
          <ul class="tab-bar-list flex overflow-hidden">
            {items.map((item, index) => {
              const hasRadiusLeft = active + 1 !== index
              const hasRadiusRight = active - 1 !== index

              return (
                <li
                  class={[
                    'position-relative px-4 flex align-center',
                    {
                      'tab-bar-list-item': true,
                      'tab-bar-list-item--active': index === active,
                      'hover-radius-left': !hasRadiusLeft,
                      'hover-radius-right': !hasRadiusRight
                    }
                  ]}
                  onClick={() => {
                    setActive(index)
                  }}
                >
                  {active + 1 !== index && (
                    <svg
                      width="9"
                      height="9"
                      xmlns="http://www.w3.org/2000/svg"
                      class="tab-bar-list-item__arc-angle--left tab-bar-list-item__arc-angle"
                    >
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0v9h9a9 9 0 01-9-9z"></path>
                    </svg>
                  )}
                  <span>{item.title}</span>
                  {active - 1 !== index && (
                    <svg
                      width="9"
                      height="9"
                      xmlns="http://www.w3.org/2000/svg"
                      class="tab-bar-list-item__arc-angle--right tab-bar-list-item__arc-angle"
                    >
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0v9h9a9 9 0 01-9-9z"></path>
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>
          <div class="tab-content p-4 bg-white">
            <RecursionField
              schema={{
                type: 'object',
                properties: {
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
                      class: 'mt-4',
                      connectionId: '{{$values.dag.nodes[0].connectionId}}',
                      style: {
                        height: 'unset',
                        minHeight: 0,
                        maxHeight: 'calc((100vh - 220px) * 0.618)'
                      },
                      hideReload: true,
                      filterType: `{{ $values.dag.nodes[0].noPrimaryKeyTableSelectType }}`
                    },
                    'x-content': {
                      'right-extra': RightExtra,
                      'right-item': RightItem
                    },
                    'x-reactions': {
                      dependencies: ['.migrateTableSelectType'],
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
                      dependencies: ['.migrateTableSelectType'],
                      fulfill: {
                        state: {
                          display: '{{$deps[0] === "expression" ? "visible":"hidden"}}'
                        }
                      }
                    }
                  },
                  tableListCard: {
                    type: 'void',
                    'x-component': 'TableListCard',
                    'x-component-props': {
                      class: 'mt-4',
                      rows: 1,
                      title: i18n.t('packages_dag_nodes_database_pipeidaodebiao'),
                      connectionId: '{{$values.dag.nodes[0].connectionId}}',
                      params: '{{ {regex: $values.dag.nodes[0].tableExpression,limit:0} }}',
                      filterType: `{{ $values.dag.nodes[0].noPrimaryKeyTableSelectType }}`
                    },
                    'x-reactions': {
                      dependencies: ['.migrateTableSelectType'],
                      fulfill: {
                        state: {
                          display: '{{$deps[0] === "expression" ? "visible":"hidden"}}'
                        }
                      }
                    }
                  }
                }
              }}
            ></RecursionField>
          </div>
          <FormDialog.Portal></FormDialog.Portal>
        </div>
      )
    }
  }
})

export { SourceDatabaseNode }
